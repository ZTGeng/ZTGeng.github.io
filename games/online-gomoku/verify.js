import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
  getAuth, GithubAuthProvider, signInWithPopup, signOut,
  setPersistence, inMemoryPersistence
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { firebaseConfig, discussionConfig } from "./config.js";

const el = id => document.getElementById(id);
const auth = getAuth(initializeApp(firebaseConfig));
const provider = new GithubAuthProvider();
// GitHub App permissions come from its registration, not OAuth App scopes.
const marker = `gomoku-connection-test:${crypto.randomUUID()}`;
let token = null;
let viewer = null;
let discussion = null;
let comment = null;
let busy = false;
let createAttempted = false;
let nextWriteAt = 0;
let ready = false;

function render() {
  el("login").disabled = !ready || busy || !el("consent").checked || Boolean(token);
  el("logout").disabled = busy || !token;
  el("read").disabled = busy || !token;
  el("create").disabled = busy || !discussion || createAttempted;
  el("edit").disabled = busy || !comment || !comment.viewerCanUpdate;
  el("delete").disabled = busy || !comment || !comment.viewerCanDelete;
  el("comment").textContent = comment ? JSON.stringify(comment, null, 2) : "尚无本次测试评论";
  el("comment-link").hidden = !comment;
  if (comment) el("comment-link").href = comment.url;
}

function message(text, failed = false) {
  el("status").textContent = text;
  el("status").className = failed ? "text-danger" : "text-success";
}

async function run(action) {
  if (busy) return;
  busy = true;
  render();
  try {
    await action();
  } catch (error) {
    // Never render Firebase's raw credential-bearing error object or log tokens.
    const known = {
      "auth/unauthorized-domain": "当前域名未授权，请在 Firebase Authentication 设置中添加它。",
      "auth/popup-blocked": "登录弹窗被拦截，请允许此站点弹窗后重试。",
      "auth/popup-closed-by-user": "登录弹窗已关闭，可以重新登录。",
      "auth/operation-not-allowed": "请确认 Firebase 的 GitHub 登录提供商已启用。",
      "auth/invalid-api-key": "Firebase API key 无效，请检查配置。",
      "auth/network-request-failed": "无法连接 Firebase，请检查网络。"
    };
    const detail = error.code ? (known[error.code] || `Firebase 登录失败：${error.code}`) : error.message;
    message(detail, true);
  } finally {
    busy = false;
    render();
  }
}

async function graphql(query, variables = {}) {
  if (!token) throw new Error("请先重新登录。");
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(20000)
  });
  if (response.status === 401) {
    token = null;
    viewer = discussion = comment = null;
    throw new Error("GitHub token 已失效，请重新登录。");
  }
  if (!response.ok) {
    const retry = response.headers.get("retry-after");
    throw new Error(`GitHub HTTP ${response.status}。${retry ? `请等待 ${retry} 秒。` : "请检查权限或稍后重试。"}`);
  }
  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(`GitHub GraphQL：${result.errors.map(item => item.message).join("；")}`);
  }
  if (!result.data) throw new Error("GitHub 未返回数据。");
  return result.data;
}

async function readConnection() {
  const data = await graphql(`query($owner:String!, $name:String!, $number:Int!) {
    viewer { id login }
    rateLimit { cost remaining limit resetAt }
    repository(owner:$owner, name:$name) {
      discussion(number:$number) {
        id title url locked
        comments(last:20) {
          totalCount
          nodes { id body url author { login } viewerCanUpdate viewerCanDelete }
        }
      }
    }
  }`, discussionConfig);
  viewer = data.viewer;
  discussion = data.repository?.discussion;
  if (!discussion) throw new Error("找不到 Discussion #5，请检查配置和账号权限。");
  el("summary").textContent = JSON.stringify({
    authentication: {
      tokenType: token.startsWith("ghu_") ? "GitHub App user access token" : "Other GitHub access token",
      requestedOAuthScopes: []
    }, viewer, rateLimit: data.rateLimit,
    discussion: { id: discussion.id, title: discussion.title, locked: discussion.locked },
    totalComments: discussion.comments.totalCount }, null, 2);
  el("comments").textContent = JSON.stringify(discussion.comments.nodes, null, 2);
  if (discussion.locked) throw new Error("Discussion 已锁定，请先在 GitHub 解锁。");
  message("读取成功。请确认 viewer.login 是你的 GitHub 账号，并查看额度和评论权限。");
}

const commentFields = "id body url viewerCanUpdate viewerCanDelete author { login }";
async function readOwnComment() {
  const data = await graphql(`query($id:ID!) {
    node(id:$id) { ... on DiscussionComment { ${commentFields} } }
  }`, { id: comment.id });
  comment = data.node;
  return comment;
}

async function mutate(query, variables) {
  const delay = Math.max(0, nextWriteAt - Date.now());
  if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  try {
    return await graphql(query, variables);
  } catch (error) {
    throw new Error(`${error.message} 写入结果可能尚未确认，请先到 Discussion 查看；此页不会自动重试。`);
  } finally {
    nextWriteAt = Date.now() + 1000;
  }
}

el("consent").addEventListener("change", render);
el("login").addEventListener("click", () => run(async () => {
  message("请在弹窗中完成 GitHub 授权……");
  const result = await signInWithPopup(auth, provider);
  token = GithubAuthProvider.credentialFromResult(result)?.accessToken;
  if (!token) throw new Error("登录结果中没有 GitHub access token，请重新登录。");
  await readConnection();
}));
el("read").addEventListener("click", () => run(readConnection));
el("logout").addEventListener("click", () => run(async () => {
  token = null;
  viewer = discussion = comment = null;
  await signOut(auth);
  el("summary").textContent = "已退出";
  el("comments").textContent = "尚未读取";
  message("已退出。未删除的测试评论仍可在 GitHub 手动清理。");
}));
el("create").addEventListener("click", () => run(async () => {
  createAttempted = true;
  const body = `<!-- ${marker} -->\n在线五子棋连接测试，由 @${viewer.login} 创建。测试后请删除。\n阶段：已创建`;
  const data = await mutate(`mutation($discussionId:ID!, $body:String!) {
    addDiscussionComment(input:{discussionId:$discussionId, body:$body}) {
      comment { ${commentFields} }
    }
  }`, { discussionId: discussion.id, body });
  comment = data.addDiscussionComment.comment;
  const actual = await readOwnComment();
  if (actual?.body !== body) throw new Error("创建后的读取结果不一致，请在 GitHub 核查。");
  message("创建并重新读取成功。下一步点击编辑测试评论。");
}));
el("edit").addEventListener("click", () => run(async () => {
  if (!await readOwnComment() || comment.author?.login !== viewer.login || !comment.body.includes(marker)) {
    throw new Error("本次测试评论已不存在或作者、标记不匹配，停止编辑。");
  }
  const body = comment.body + `\n阶段：编辑验证 ${new Date().toISOString()}`;
  await mutate(`mutation($commentId:ID!, $body:String!) {
    updateDiscussionComment(input:{commentId:$commentId, body:$body}) { comment { id } }
  }`, { commentId: comment.id, body });
  const actual = await readOwnComment();
  if (actual?.body !== body) throw new Error("编辑后的读取结果不一致，请在 GitHub 核查。");
  message("编辑并重新读取成功。下一步点击删除测试评论。");
}));
el("delete").addEventListener("click", () => run(async () => {
  if (!await readOwnComment() || comment.author?.login !== viewer.login || !comment.body.includes(marker)) {
    throw new Error("本次测试评论已不存在或作者、标记不匹配，停止删除。");
  }
  const id = comment.id;
  await mutate(`mutation($id:ID!) {
    deleteDiscussionComment(input:{id:$id}) { clientMutationId }
  }`, { id });
  // Refresh the thread after deletion. Deleted node lookups may return GraphQL errors.
  comment = null;
  await readConnection();
  message("GitHub 已确认删除，评论列表已刷新。本次连接测试完成。");
}));

await run(async () => {
  await setPersistence(auth, inMemoryPersistence);
  ready = true;
  message("准备就绪。请阅读说明、勾选同意，然后使用 GitHub 登录。");
});
