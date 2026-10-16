// Framework-independent state for a Discussion message board. Authentication and
// API transport are supplied by the host page; there is no game-specific logic.
const MARKER = /\n\n<!-- gomoku-message:([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}) -->$/i;
export const messageText = body => String(body || "").replace(MARKER, "");

export class MessageBoard {
  constructor(api, user, target, storage = null) {
    this.api = api; this.user = user; this.target = target; this.storage = storage;
    this.key = `discussion-message-pending:${user.id}:${target.owner}/${target.name}#${target.number}`;
    this.items = []; this.discussion = null; this.cursor = null; this.more = false;
    this.loaded = false; this.disposed = false; this.pending = null;
    try {
      const value = JSON.parse(storage?.getItem(this.key) || "null");
      if (value && typeof value.body === "string" && MARKER.test(value.body) &&
          value.body.match(MARKER)[1] === value.uuid) this.pending = value;
    } catch { /* Session storage is optional. */ }
  }
  assertLive() { if (this.disposed) throw new DOMException("Session ended", "AbortError"); }
  remember(value) {
    this.pending = value;
    try {
      if (value) this.storage?.setItem(this.key, JSON.stringify(value));
      else this.storage?.removeItem(this.key);
    } catch { /* The in-memory pending operation remains authoritative. */ }
  }
  merge(items, replace = false) {
    const map = new Map((replace ? [] : this.items).map(item => [item.id, item]));
    for (const item of items.filter(Boolean)) map.set(item.id, item);
    this.items = [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  }
  async load(older = false, signal) {
    this.assertLive();
    const discussion = await this.api.messagePage(this.target, older ? this.cursor : null, this.target.pageSize || 20, signal);
    this.assertLive(); signal?.throwIfAborted();
    this.discussion = discussion;
    this.merge(discussion.comments.nodes, !older);
    this.cursor = discussion.comments.pageInfo.startCursor;
    this.more = discussion.comments.pageInfo.hasPreviousPage;
    this.loaded = true;
  }
  async send(text) {
    this.assertLive();
    if (this.pending) throw new Error("messagePending");
    if (!this.discussion || this.discussion.locked) throw new Error("messageLocked");
    text = text.trim();
    if (!text || text.length > (this.target.maxLength || 1000)) throw new Error("messageLength");
    const uuid = crypto.randomUUID();
    const body = `${text}\n\n<!-- gomoku-message:${uuid} -->`;
    this.remember({ uuid, body, checked: false, cursor: null });
    // A failed response may still represent a committed write. Never resend it.
    const item = await this.api.addMessage(this.discussion.id, body);
    this.assertLive();
    this.merge([item]); this.remember(null);
    return item;
  }
  async check(signal) {
    this.assertLive();
    const pending = this.pending;
    if (!pending) return null;
    const discussion = await this.api.messagePage(this.target, pending.cursor, this.target.pageSize || 20, signal);
    this.assertLive(); signal?.throwIfAborted();
    const found = discussion.comments.nodes.find(item => item?.author?.id === this.user.id &&
      item.body?.match(MARKER)?.[1] === pending.uuid);
    if (found) { this.merge([found]); this.remember(null); return found; }
    this.remember({ ...pending, checked: true, cursor: discussion.comments.pageInfo.hasPreviousPage ? discussion.comments.pageInfo.startCursor : null });
    return null;
  }
  abandon() {
    if (this.pending && !this.pending.checked) throw new Error("messageUnchecked");
    this.remember(null);
  }
  async remove(id) {
    this.assertLive();
    if (!this.discussion || !this.items.some(item => item.id === id)) throw new Error("messageMissing");
    const entry = await this.api.messageComment(id);
    this.assertLive();
    if (entry) {
      if (entry.discussion?.id !== this.discussion.id || !entry.viewerCanDelete) throw new Error("permission");
      try { await this.api.delete(id); }
      catch (error) {
        // A missing node confirms an ambiguous delete; other errors do not.
        const actual = await this.api.messageComment(id);
        this.assertLive();
        if (actual) throw error;
      }
    }
    this.assertLive();
    this.items = this.items.filter(item => item.id !== id);
  }
  dispose() { this.disposed = true; this.items = []; }
}
