import { discussionConfig, gameConfig } from "./config.js";

export const FIELDS = `id body createdAt updatedAt url viewerCanUpdate viewerCanDelete
  author { login ... on User { id } }`;
export class ApiError extends Error {
  constructor(code, retryAt = 0) { super(code); this.retryAt = retryAt; }
}

export class GitHub {
  constructor(token, onQuota = () => {}, fetcher = (...args) => fetch(...args)) {
    this.token = token;
    this.onQuota = onQuota;
    this.fetcher = fetcher;
    this.controller = new AbortController();
    this.blockedUntil = 0;
    this.nextWriteAt = 0;
    this.limitFailures = 0;
  }
  close() { this.controller.abort(); }
  async request(query, variables = {}, { allowMissing = false } = {}) {
    if (Date.now() < this.blockedUntil) throw new ApiError("rateLimited", this.blockedUntil);
    const response = await this.fetcher("https://api.github.com/graphql", {
      method: "POST", headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.any([this.controller.signal, AbortSignal.timeout(20000)])
    });
    if (response.status === 401) throw new ApiError("unauthorized");
    let result;
    try { result = await response.json(); } catch { throw new ApiError("network"); }
    this.controller.signal.throwIfAborted();
    const rate = result.data?.rateLimit;
    if (rate) this.onQuota(rate);
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");
    const retry = response.headers.get("retry-after");
    const text = JSON.stringify(result.errors || result.message || "");
    const exhausted = remaining === "0" || rate?.remaining === 0;
    const limited = response.status === 429 || retry !== null || /rate.?limit|abuse|secondary/i.test(text);
    if (exhausted || limited) {
      if (limited) this.limitFailures++;
      const resetAt = reset ? Number(reset) * 1000 : Date.parse(rate?.resetAt || "");
      this.blockedUntil = exhausted ? (resetAt || Date.now() + 3600000) + 1000 :
        Date.now() + Math.max(Math.min(900000, 60000 * 2 ** (this.limitFailures - 1)), (Number(retry) || 0) * 1000);
      // The last successful response at remaining=0 is usable; block further requests.
      if (limited || result.errors?.length || !response.ok) throw new ApiError("rateLimited", this.blockedUntil);
    }
    const missingOnly = allowMissing && Array.isArray(result.data?.nodes) && result.errors?.length &&
      result.errors.every(error => error.type === "NOT_FOUND" && error.path?.[0] === "nodes" && Number.isInteger(error.path[1]) &&
        result.data.nodes[error.path[1]] === null);
    if (!response.ok || (result.errors?.length && !missingOnly) || !result.data) {
      throw new ApiError(response.status === 403 || /forbidden|permission|accessible/i.test(text) ? "permission" : "apiError");
    }
    if (!limited) this.limitFailures = 0;
    return result.data;
  }
  async identity() {
    return (await this.request(`query { viewer { id login } rateLimit { cost remaining limit resetAt } }`)).viewer;
  }
  async scan(after = null, hostId = null) {
    const comments = [];
    let cursor = after;
    let host;
    do {
      const data = await this.request(`query($owner:String!, $name:String!, $number:Int!, $after:String, $hostId:ID!, $withHost:Boolean!) {
        host: node(id:$hostId) @include(if:$withHost) { ... on DiscussionComment { ${FIELDS} } }
        repository(owner:$owner,name:$name) {
          discussion(number:$number) { id locked
            comments(first:100,after:$after) { nodes { ${FIELDS} } pageInfo { endCursor hasNextPage } }
          }
        } rateLimit { cost remaining limit resetAt }
      }`, { ...discussionConfig, after: cursor, hostId: hostId || gameConfig.discussionId, withHost: Boolean(hostId) });
      if (hostId) host = data.host;
      const discussion = data.repository?.discussion;
      if (!discussion || discussion.id !== gameConfig.discussionId) throw new ApiError("missingDiscussion");
      if (discussion.locked) throw new ApiError("locked");
      const page = discussion.comments;
      comments.push(...page.nodes.filter(Boolean));
      cursor = page.pageInfo.endCursor || cursor;
      if (!page.pageInfo.hasNextPage) break;
    } while (true);
    return { comments, cursor, host };
  }
  async nodes(ids) {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) return [];
    const result = [];
    for (let i = 0; i < unique.length; i += 100) {
      const data = await this.request(`query($ids:[ID!]!) {
        nodes(ids:$ids) { ... on DiscussionComment { ${FIELDS} } }
        rateLimit { cost remaining limit resetAt }
      }`, { ids: unique.slice(i, i + 100) }, { allowMissing: true });
      result.push(...data.nodes);
    }
    return result;
  }
  async write(query, variables) {
    const wait = this.nextWriteAt - Date.now();
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    try { return await this.request(query, variables); }
    finally { this.nextWriteAt = Date.now() + 1000; }
  }
  async add(body) {
    const data = await this.write(`mutation($id:ID!, $body:String!) {
      addDiscussionComment(input:{discussionId:$id,body:$body}) { comment { ${FIELDS} } }
    }`, { id: gameConfig.discussionId, body });
    return data.addDiscussionComment.comment;
  }
  async edit(id, body) {
    const data = await this.write(`mutation($id:ID!, $body:String!) {
      updateDiscussionComment(input:{commentId:$id,body:$body}) { comment { ${FIELDS} } }
    }`, { id, body });
    return data.updateDiscussionComment.comment;
  }
  async delete(id) {
    await this.write(`mutation($id:ID!) { deleteDiscussionComment(input:{id:$id}) { clientMutationId } }`, { id });
  }
}
