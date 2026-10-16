import { MessageBoard, messageText } from "../../shared/discussion-comments.js";

// The host supplies login, transport and write scheduling. This view does not
// import game rules or state, so another page can mount it with the same contract.
export class MessagePanel {
  constructor(root, { api, user, target, storage, canRun, runWrite, onUnauthorized }) {
    this.root = root; this.board = new MessageBoard(api, user, target, storage);
    this.canRun = canRun; this.runWrite = runWrite; this.onUnauthorized = onUnauthorized;
    this.language = "en"; this.visible = false; this.hostBusy = true;
    this.working = false; this.attempted = false; this.controller = null;
    this.draft = this.board.pending ? messageText(this.board.pending.body) : "";
    this.status = null; this.failed = false;
    root.innerHTML = `<div class="toolbar"><h2 class="h4 mb-0" data-message="heading"></h2>
      <button type="button" class="btn btn-outline-secondary btn-sm" data-message="refresh"></button></div>
      <p class="small text-secondary mt-2" data-message="note"></p>
      <form data-message="form"><label class="visually-hidden" data-message="label" for="message-draft"></label>
        <textarea id="message-draft" class="form-control" rows="3" data-message="draft"></textarea>
        <div class="d-flex align-items-center gap-2 mt-2"><button class="btn btn-primary btn-sm" data-message="send"></button>
          <span class="small text-secondary" data-message="count"></span></div></form>
      <div class="alert alert-warning mt-3" data-message="pending" hidden>
        <p data-message="pendingNote"></p><button type="button" class="btn btn-outline-secondary btn-sm" data-message="check"></button>
        <button type="button" class="btn btn-outline-danger btn-sm" data-message="abandon"></button></div>
      <p role="status" aria-live="polite" class="small mt-3" data-message="status"></p>
      <div class="message-list" data-message="list"></div>
      <button type="button" class="btn btn-outline-secondary btn-sm mt-3" data-message="older" hidden></button>
      <p class="small mt-3 mb-0"><a data-message="link" target="_blank" rel="noopener noreferrer"></a></p>`;
    this.$("draft").value = this.draft;
    this.$("draft").maxLength = target.maxLength || 1000;
    this.$("draft").addEventListener("input", () => { this.draft = this.$("draft").value; this.renderControls(); });
    this.$("form").addEventListener("submit", event => {
      event.preventDefault();
      this.perform(async () => {
        await this.board.send(this.draft); this.draft = ""; this.$("draft").value = "";
        this.status = ["留言已发表。", "Message posted."];
      }, true);
    });
    this.$("refresh").addEventListener("click", () => this.load());
    this.$("older").addEventListener("click", () => this.load(true));
    this.$("check").addEventListener("click", () => this.perform(async signal => {
      const found = await this.board.check(signal);
      if (found) { this.draft = ""; this.$("draft").value = ""; }
      this.status = found ? ["已找到上次发表的留言。", "Your previous message was found."] :
        ["本页未找到。可继续检查更早留言，或前往 GitHub 核实；不要直接重复发表。", "Not found on this page. Check earlier messages or verify on GitHub before posting again."];
    }));
    this.$("abandon").addEventListener("click", () => {
      if (this.working || this.hostBusy || !this.board.pending?.checked || !confirm(this.t("确认已在 GitHub 核实，并放弃上次提交？原请求仍可能稍后完成。", "Abandon the previous submission after checking GitHub? The original request may still complete later."))) return;
      this.board.abandon(); this.status = ["已放弃上次提交，可修改后重新发表。", "Submission abandoned. You can edit and post again."]; this.render();
    });
  }
  $(name) { return this.root.querySelector(`[data-message="${name}"]`); }
  t(zh, en) { return this.language === "zh" ? zh : en; }
  update({ visible, busy, language }) {
    this.visible = visible; this.hostBusy = busy; this.language = language;
    if (!visible || busy) this.controller?.abort();
    this.render();
    if (visible && !busy && !this.board.loaded && !this.attempted && !this.working) {
      this.attempted = true;
      queueMicrotask(() => {
        if (this.canRun() && !this.board.disposed) this.load();
        else this.attempted = false;
      });
    }
  }
  async perform(action, write = false) {
    if (this.working || !this.canRun() || this.board.disposed) return;
    this.working = true; this.failed = false; this.status = null;
    if (!write) this.controller = new AbortController();
    this.render();
    const execute = async () => {
      try { await action(this.controller?.signal); }
      catch (error) {
        if (this.board.disposed) return;
        if (error.name === "AbortError") { if (!this.board.loaded) this.attempted = false; }
        else if (error.message === "unauthorized") {
          if (write) throw error;
          this.onUnauthorized();
        } else {
          this.failed = true;
          const text = {
            permission: ["没有操作此留言的权限。", "You do not have permission for this message."],
            messageDiscussion: ["留言帖不可访问或配置错误。", "The message discussion is unavailable or misconfigured."],
            messageLocked: ["留言帖已锁定，暂时不能发表。", "The discussion is locked."],
            messageLength: ["请输入 1 到 1000 字符。", "Enter 1 to 1000 characters."],
            rateLimited: ["GitHub 暂时限流，请稍后重试。", "GitHub rate limit reached. Try again later."]
          }[error.message] || ["留言操作失败，请重试；未确认的发表请先核对。", "Message operation failed. Retry reads; check unconfirmed submissions before posting again."];
          if (error.retryAt) {
            text[0] += ` ${new Date(error.retryAt).toLocaleTimeString("zh-CN")}`;
            text[1] += ` ${new Date(error.retryAt).toLocaleTimeString("en-US")}`;
          }
          this.status = text;
        }
      } finally {
        this.working = false; this.controller = null;
        if (!this.board.disposed) this.render();
      }
    };
    if (write) await this.runWrite(execute);
    else await execute();
  }
  load(older = false) {
    this.attempted = true;
    return this.perform(signal => this.board.load(older, signal));
  }
  renderControls() {
    const blocked = this.working || this.hostBusy;
    this.$("send").disabled = blocked || !this.board.loaded || this.board.discussion?.locked || !!this.board.pending || !this.draft.trim();
    this.$("draft").disabled = !!(blocked || this.board.pending || this.board.discussion?.locked);
    for (const name of ["refresh", "older", "check"]) this.$(name).disabled = blocked;
    this.$("abandon").disabled = blocked || !this.board.pending?.checked;
    this.$("count").textContent = `${this.draft.length} / ${this.board.target.maxLength || 1000}`;
  }
  render() {
    this.root.setAttribute("aria-label", this.t("留言", "Messages"));
    const strings = {
      heading: ["留言", "Messages"], refresh: ["刷新留言", "Refresh messages"],
      note: ["使用当前游戏账号留言，无需再次登录。留言公开保存于 GitHub；仅支持纯文本，手动刷新。", "Comment with your game account. Messages are public on GitHub. Plain text only; refresh manually."],
      label: ["留言内容", "Message"], send: ["发表留言", "Post message"],
      pendingNote: ["上次发表结果未确认。请先核对，避免重复发送。", "Your previous submission is unconfirmed. Check it before posting again."],
      check: ["核对上次发表", "Check submission"], abandon: ["放弃上次提交", "Abandon submission"],
      older: ["加载更早留言", "Load earlier messages"], link: ["在 GitHub 查看留言帖", "View discussion on GitHub"]
    };
    for (const [name, text] of Object.entries(strings)) this.$(name).textContent = this.t(...text);
    this.$("draft").placeholder = this.t("写点什么……", "Write a message…");
    this.$("link").href = this.board.discussion?.url || `https://github.com/${this.board.target.owner}/${this.board.target.name}/discussions/${this.board.target.number}`;
    this.$("pending").hidden = !this.board.pending;
    this.$("older").hidden = !this.board.more;
    this.$("status").className = `small mt-3 ${this.failed ? "text-danger" : "text-secondary"}`;
    this.$("status").textContent = this.working ? this.t("处理中……", "Working…") : this.status ? this.t(...this.status) :
      this.board.discussion?.locked ? this.t("留言帖已锁定，暂时不能发表。", "The discussion is locked.") : "";
    const list = this.$("list"); list.replaceChildren();
    if (this.board.loaded && !this.board.items.length) {
      const empty = document.createElement("p"); empty.className = "text-secondary";
      empty.textContent = this.t("还没有留言。", "No messages yet."); list.append(empty);
    }
    for (const item of this.board.items) {
      const card = document.createElement("article"); card.className = "message-item"; card.dataset.messageId = item.id;
      const header = document.createElement("div"); header.className = "message-header";
      if (item.author?.avatarUrl) {
        const img = document.createElement("img"); img.className = "player-avatar"; img.alt = "";
        img.src = item.author.avatarUrl; img.width = img.height = 24; img.loading = "lazy";
        img.addEventListener("error", () => { img.hidden = true; }, { once: true }); header.append(img);
      }
      const name = document.createElement("span"); name.textContent = item.author?.login || this.t("已删除的账号", "Deleted account"); header.append(name);
      const time = document.createElement("a"); time.href = item.url; time.target = "_blank"; time.rel = "noopener noreferrer";
      time.className = "small text-secondary"; time.textContent = new Date(item.createdAt).toLocaleString(this.language === "zh" ? "zh-CN" : "en-US"); header.append(time);
      if (item.viewerCanDelete) {
        const button = document.createElement("button"); button.type = "button"; button.className = "btn btn-link btn-sm text-danger message-delete";
        button.textContent = this.t("删除", "Delete"); button.disabled = this.working || this.hostBusy;
        button.addEventListener("click", () => {
          if (!confirm(this.t("确认删除这条留言？", "Delete this message?"))) return;
          this.perform(async () => { await this.board.remove(item.id); this.status = ["留言已删除。", "Message deleted."]; }, true);
        }); header.append(button);
      }
      const body = document.createElement("p"); body.className = "message-body"; body.textContent = messageText(item.body);
      card.append(header, body); list.append(card);
    }
    this.renderControls();
  }
  dispose() { this.controller?.abort(); this.board.dispose(); this.draft = ""; this.root.replaceChildren(); }
}
