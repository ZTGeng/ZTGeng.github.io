import { login, logout, savedToken, watchLogout } from "./auth.js";
import { GitHub } from "./github.js";
import { GameClient } from "./client.js";
import { gameConfig } from "./config.js";
import { roleOf, prefix, cleanupGroups, ownEntry } from "./protocol.js";
import { SIZE } from "./rules.js";
import { Poller } from "./sync.js";

const $ = id => document.getElementById(id);
let language = SiteUI.getLanguage();
const t = (zh, en) => language === "zh" ? zh : en;
const s = { api: null, client: null, user: null, quota: null, selection: null, current: null,
  busy: false, synced: false, lastSync: null, count: gameConfig.pageSize,
  message: null, failed: false, cleanup: [], session: 0,
  loading: true, loadError: false, submitting: false, resultNotice: null, notified: new Set() };
const errors = {
  unauthorized: ["登录凭据已失效，请重新登录。", "Your token expired. Please sign in again."],
  permission: ["GitHub 拒绝此操作，请检查授权与评论权限。", "GitHub denied this operation. Check authorization and comment permissions."],
  network: ["网络连接失败，请手动同步后再操作。", "Connection failed. Sync again before playing."],
  apiError: ["GitHub 未返回完整有效的数据，请稍后重新同步。", "GitHub did not return complete valid data. Sync again later."],
  missingDiscussion: ["游戏 Discussion 配置不匹配或不可访问。", "The configured game discussion is missing or inaccessible."],
  locked: ["游戏 Discussion 已锁定。", "The game discussion is locked."],
  missingRoom: ["对局记录缺失或格式异常，请返回大厅。", "The game record is missing or invalid. Return to the lobby."],
  missingOpponent: ["对手记录缺失或配对不一致，已暂停。", "Opponent record missing or pairing mismatch. Play paused."],
  fork: ["双方棋谱出现分叉，已暂停落子。", "Game histories diverged. Play paused."],
  snapshotGap: ["双方快照手数差异常，已暂停落子。", "Snapshot lengths are inconsistent. Play paused."],
  historyRollback: ["最新数据比已确认棋谱更短或不同，已暂停落子。", "The new history conflicts with confirmed moves. Play paused."],
  resultMismatch: ["双方对局结果不一致，已保留记录并暂停操作。", "The game results disagree. Records were preserved and play paused."],
  invalidResult: ["尚未取得有效终局结果，请重新同步。", "No valid final result is available. Sync again."],
  wrongTurn: ["当前不能落子，请同步局面。", "You cannot play now. Sync the board."],
  occupied: ["该位置已有棋子。", "That intersection is occupied."],
  outOfBounds: ["落子位置超出棋盘。", "That move is outside the board."],
  afterEnd: ["对局已经结束。", "The game has ended."],
  doubleThree: ["黑方禁手：三三。请选择其他位置。", "Forbidden black move: double three. Choose another point."],
  doubleFour: ["黑方禁手：四四。请选择其他位置。", "Forbidden black move: double four. Choose another point."],
  overline: ["黑方禁手：长连。请选择其他位置。", "Forbidden black move: overline. Choose another point."],
  alreadyPlaying: ["你已有未结束的对局，请在大厅继续。", "You already have an active game. Resume it in the lobby."],
  notWaiting: ["此房间已不再等待加入，请刷新大厅。", "This room is no longer available. Refresh the lobby."],
  tabBusy: ["另一个标签页正在提交，请稍后同步。", "Another tab is submitting. Sync again shortly."],
  unknownWrite: ["上次写入结果尚未确认。请刷新大厅查证，必要时到 Discussion 检查；不会自动重复提交。", "The previous write is unconfirmed. Refresh the lobby to verify, or check the discussion. It will not be sent again automatically."],
  noToken: ["登录结果中没有 GitHub token，请重新登录。", "No GitHub token was returned. Please sign in again."],
  "auth/unauthorized-domain": ["请在 Firebase 添加当前页面的授权域名。", "Add this domain to Firebase Authentication authorized domains."],
  "auth/popup-blocked": ["请允许登录弹窗后重试。", "Allow the sign-in popup and try again."],
  "auth/popup-closed-by-user": ["登录弹窗已关闭。", "The sign-in popup was closed."],
  "auth/operation-not-allowed": ["请启用 Firebase 的 GitHub 登录提供商。", "Enable the GitHub sign-in provider in Firebase."]
};

function notify(zh, en, failed = false) { s.message = [zh, en]; s.failed = failed; }
function describe(error) {
  if (error.message === "rateLimited") {
    const time = new Date(error.retryAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US");
    return [ `GitHub 额度限制，请在 ${time} 后重试。`, `GitHub rate limit. Retry after ${time}.` ];
  }
  return errors[error.code || error.message] || errors.network;
}
const colorName = role => role === "black" ? t("黑方", "Black") : t("白方", "White");
const isAdmin = () => gameConfig.adminIds.includes(s.user?.id);
const ownRole = () => s.current && roleOf(s.current, s.user?.id);
const ownAcknowledged = () => Boolean(s.current && ownEntry(s.current, s.user?.id)?.record.acknowledged);
const pendingJoin = () => s.selection?.applicantId && s.current && !ownRole();
const canReturn = () => !s.current || (!ownRole() && !pendingJoin()) ||
  (s.current.status === "finished" && ownAcknowledged()) || ["cancelled", "error"].includes(s.current.status);
const canMove = () => s.current?.status === "playing" && s.current.state.turn === ownRole() &&
  s.synced && !s.busy && !s.client?.pending;
function shouldPoll() {
  if (s.api && s.selection && s.current?.status === "finished" && ownRole() && !ownAcknowledged()) return true;
  return Boolean(s.api && s.selection && s.current &&
    ["waiting", "playing"].includes(s.current.status) &&
    (!s.synced || s.current.status === "waiting" || !ownRole() || s.current.state.turn !== ownRole()));
}
const poller = new Poller(async () => {
  if (s.busy) return true;
  await task(syncGame, { polling: true });
  return shouldPoll();
}, gameConfig.pollMs);

function schedule() {
  poller.stop();
  if (shouldPoll() && !document.hidden && navigator.onLine) poller.start();
}
async function task(action, { polling = false, moving = false } = {}) {
  if (s.busy) return;
  s.busy = true;
  s.submitting = moving;
  const session = s.session;
  if (!polling) poller.stop();
  render();
  try { await action(); }
  catch (error) {
    if (session !== s.session) return;
    s.synced = false;
    if (s.loading) s.loadError = true;
    const [zh, en] = describe(error);
    notify(zh, en, true);
    if ((error.code || error.message) === "unauthorized") await endSession();
    if (polling && s.api) throw error;
  } finally {
    s.busy = false;
    s.loading = false;
    s.submitting = false;
    render();
    if (!polling) schedule();
  }
}
async function writeLock(action) {
  if (navigator.locks) {
    return navigator.locks.request(`online-gomoku:${s.user.id}`, { ifAvailable: true }, lock => {
      if (!lock) throw new Error("tabBusy");
      return action();
    });
  }
  return action();
}

async function connect(token) {
  s.loading = true; s.loadError = false; render();
  const api = new GitHub(token, quota => { if (s.api === api) s.quota = quota; });
  s.api = api;
  try {
    s.user = await api.identity();
    let storage = null;
    try { storage = sessionStorage; } catch { /* In-memory pending state remains available. */ }
    s.client = new GameClient(api, s.user, storage);
    await lobby(true);
  } catch (error) {
    api.close(); s.api = s.user = s.client = null;
    throw error;
  }
}
async function endSession(notifyOthers = true) {
  s.session++;
  poller.stop(); s.api?.close();
  s.api = s.client = s.user = s.selection = s.current = s.quota = null;
  s.cleanup = []; s.synced = false;
  s.loading = s.loadError = s.submitting = false;
  $("create-dialog").close();
  $("result-dialog").close(); s.resultNotice = null; s.notified.clear();
  await logout(notifyOthers);
}
async function lobby(restore = false) {
  s.loading = true; s.loadError = false; render();
  await s.client.load();
  const cleaned = await writeLock(() => s.client.cleanupOwn());
  s.selection = s.current = null; s.synced = false; s.count = gameConfig.pageSize;
  s.cleanup = [];
  if (s.client.pending) notify(...errors.unknownWrite, true);
  else notify(t("大厅已刷新。", "Lobby refreshed."), "Lobby refreshed.");
  if (cleaned.failed) notify("大厅已加载，部分己方记录清理失败，下次进入大厅时会重试。", "Lobby loaded. Some of your records could not be cleaned; the next lobby load will retry.", true);
  const active = s.client.activeRooms();
  if (restore && active.length === 1 && active[0].status !== "error") {
    await openRoom(active[0].id);
  }
}
function acceptSnapshot(room) {
  const previous = s.current;
  if (previous?.id === room.id && !prefix(previous.moves, room.moves)) throw new Error("historyRollback");
  s.current = room; s.synced = true; s.lastSync = new Date();
}
async function openRoom(id, applicantId = null) {
  s.selection = { hostId: id, applicantId };
  s.current = null; s.synced = false;
  await syncGame();
}
async function syncGame() {
  if (!s.selection) return;
  const id = s.selection.hostId;
  const knownHost = s.client.records.get(id);
  const accepting = knownHost?.record.userId === s.user.id && !knownHost.record.opponentCommentId &&
    knownHost.record.status === "waiting" && !s.client.pending;
  const readRoom = () => accepting ? writeLock(() => s.client.accept(id)) : s.client.room(id);
  let room;
  try { room = await readRoom(); }
  catch (error) {
    if (error.message === "missingRoom" && (s.selection.applicantId ||
        (knownHost?.record.userId === s.user.id && !knownHost.record.opponentCommentId && !s.client.comments.has(id)))) {
      await lobby();
      notify("房间已取消，已检查并清理失效的加入申请。", "The room was cancelled. Your stale application was checked for cleanup.");
      return;
    }
    // Retry one inconsistent snapshot once. Never retry a mutation here.
    if (!["snapshotGap", "fork", "missingOpponent", "historyRollback"].includes(error.message)) throw error;
    room = await readRoom();
  }
  if (s.selection.applicantId && room.white && room.white.id !== s.selection.applicantId) {
    await lobby();
    notify("此房间已接受另一位玩家，你的申请未被接受。", "Another player was accepted. Your application was not selected.");
    return;
  }
  await receiveRoom(room);
  if (s.client.pending) notify(...errors.unknownWrite, true);
  else notify("局面已同步。", "Board synced.");
}

async function receiveRoom(room) {
  acceptSnapshot(room);
  const entry = ownEntry(room, s.user.id);
  if (room.status !== "finished" || !entry || entry.record.acknowledged) return;
  const key = `${room.id}:${room.host.record.gameId}`;
  const generatedByThisPlayer = entry.record.resigned ||
    (room.reason !== "resign" && entry.record.moves.length === room.moves.length);
  if (!generatedByThisPlayer && !s.notified.has(key)) {
    s.notified.add(key);
    s.resultNotice = { winner: room.winner, reason: room.reason };
    render();
    $("result-dialog").showModal();
  }
  // Native dialog is UI only: acknowledgement proceeds while it is open.
  const confirmed = await writeLock(() => s.client.acknowledge(room.id));
  acceptSnapshot(confirmed);
}

function node(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}
function statusText(room) {
  if (room.needsResultSync) return t("结果待同步", "Result awaiting sync");
  if (room.status === "waiting") return t("等待加入", "Waiting for a player");
  if (room.status === "cancelled") return t("已取消", "Cancelled");
  if (room.status === "error") return t("数据异常", "Invalid game data");
  if (room.status === "finished") return room.winner ? `${colorName(room.winner)} ${t("获胜", "wins")}` : t("和棋", "Draw");
  return `${t("轮到", "Turn:")} ${colorName(room.state.turn)}`;
}
function phaseText(room) {
  if (room.status === "waiting") return t("等待中", "Waiting");
  if (room.status === "playing") return t("进行中", "In progress");
  if (["finished", "cancelled"].includes(room.status)) return t("已结束", "Ended");
  return t("数据异常", "Invalid data");
}
function isOwnActive(room) {
  return ["waiting", "playing"].includes(room.status) && Boolean(roleOf(room, s.user.id));
}
function miniature(canvas, moves) {
  canvas.width = canvas.height = 210;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#dfba7f"; ctx.fillRect(0, 0, 210, 210);
  ctx.strokeStyle = "#9e7b46"; ctx.lineWidth = .6;
  for (let i = 0; i < SIZE; i++) {
    const p = 14 + i * 13;
    ctx.beginPath(); ctx.moveTo(14, p); ctx.lineTo(196, p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p, 14); ctx.lineTo(p, 196); ctx.stroke();
  }
  moves.forEach(([x, y], i) => {
    ctx.beginPath(); ctx.arc(14 + x * 13, 14 + y * 13, 5.7, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? "#fff" : "#222"; ctx.fill();
    if (i === moves.length - 1) { ctx.fillStyle = "#d33"; ctx.fillRect(12 + x * 13, 12 + y * 13, 4, 4); }
  });
}
function renderRooms() {
  $("rooms").replaceChildren();
  const rooms = [...(s.client?.lobbyRooms() || [])].sort((a, b) => Number(isOwnActive(b)) - Number(isOwnActive(a)));
  const hasActive = rooms.some(isOwnActive);
  $("more").hidden = rooms.length <= s.count;
  if (!rooms.length) $("rooms").append(node("p", "text-secondary", t("还没有对局，创建第一局吧。", "No games yet. Create the first one.")));
  for (const room of rooms.slice(0, s.count)) {
    const mine = isOwnActive(room);
    const action = mine ? "resume" : (!hasActive && room.status === "waiting" ? "join" : "watch");
    const label = room.status === "error" ? t("不可用", "Unavailable") :
      action === "resume" ? t("进入我的棋局", "Resume my game") : action === "join" ? t("加入棋局", "Join game") : t("旁观棋局", "Watch game");
    const disabled = s.busy || room.status === "error" || (action === "join" && Boolean(s.client.pending));
    const card = node("article", `card room-card room-${room.status}${mine ? " room-mine" : ""}`);
    card.dataset.roomId = room.id; card.dataset.action = action;
    card.setAttribute("role", "button"); card.tabIndex = disabled ? -1 : 0;
    card.setAttribute("aria-disabled", String(disabled));
    card.setAttribute("aria-label", `${room.host.author.login} · ${phaseText(room)} · ${label}`);
    const open = () => {
      if (disabled || s.busy) return;
      task(async () => {
        if (action === "join") {
          const applicant = await writeLock(() => s.client.join(room.id));
          await openRoom(room.id, applicant.id);
        } else await openRoom(room.id);
      });
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
    });
    const tags = node("div", "d-flex gap-2 flex-wrap");
    if (mine) tags.append(node("span", "badge text-bg-primary", t("我的棋局", "My game")));
    tags.append(node("span", "room-phase", phaseText(room))); card.append(tags);
    const canvas = node("canvas"); canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", t(`棋盘缩略图，共 ${room.moves.length} 手`, `Board thumbnail, ${room.moves.length} moves`));
    card.append(canvas); miniature(canvas, room.moves);
    card.append(node("h3", "h6", `${room.host.author.login} · ${statusText(room)}`));
    card.append(node("p", "players", `● ${room.host.author.login} / ○ ${room.white?.author.login || "—"}`));
    card.append(node("p", "small", room.host.record.forbidden ? t("黑方有禁手", "Black forbidden moves") : t("无禁手", "Freestyle")));
    card.append(node("p", "date", new Date(room.updatedAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US")));
    card.append(node("p", "room-action", `${label} →`)); $("rooms").append(card);
  }
}
function renderBoard() {
  const board = $("board");
  board.setAttribute("aria-label", t("15 乘 15 棋盘，方向键移动，回车落子", "15 by 15 board. Arrow keys to move, Enter to play."));
  const focus = board.contains(document.activeElement) ? Number(document.activeElement.dataset.index) : null;
  board.replaceChildren();
  const positions = new Map((s.current?.moves || []).map(([x, y], i) => [y * SIZE + x, i]));
  const last = (s.current?.moves.length || 0) - 1;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const x = i % SIZE, y = Math.floor(i / SIZE), move = positions.get(i);
    const color = move === undefined ? null : move % 2 ? "white" : "black";
    const point = node("button", "intersection"); point.type = "button";
    if ([3, 7, 11].includes(x) && [3, 7, 11].includes(y)) point.classList.add("star");
    point.dataset.index = i;
    point.tabIndex = i === (focus ?? 112) ? 0 : -1;
    point.setAttribute("aria-disabled", String(!canMove() || color !== null));
    point.setAttribute("aria-label", `${String.fromCharCode(65 + x)}${y + 1} ${color ? `${colorName(color)} ${move + 1}` : t("空位", "empty")}`);
    if (color) point.append(node("span", `stone ${color}${move === last ? " last" : ""}`));
    point.addEventListener("click", () => {
      if (!canMove() || color) return;
      task(async () => {
        await syncGame();
        if (!s.current || s.current.status !== "playing") return;
        const next = await writeLock(() => s.client.move(s.selection.hostId, [x, y]));
        await receiveRoom(next);
        if (next.status === "finished") notify("对局已结束，结果已同步。", "The game ended. Your result is saved.");
        else notify("落子已写入，等待对手。", "Move saved. Waiting for your opponent.");
      }, { moving: true });
    });
    point.addEventListener("keydown", event => {
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -SIZE, ArrowDown: SIZE }[event.key];
      if (delta === undefined) return;
      event.preventDefault();
      const next = Math.max(0, Math.min(224, i + delta));
      point.tabIndex = -1; board.children[next].tabIndex = 0; board.children[next].focus();
    });
    board.append(point);
  }
  if (focus !== null) board.children[focus]?.focus();
}
function renderGame() {
  const room = s.current;
  $("board").hidden = !room;
  $("board").setAttribute("aria-busy", String(s.submitting));
  $("board-overlay").hidden = !room || !s.submitting;
  if (!room) {
    $("back").hidden = $("refresh-game").hidden = false;
    $("room-title").textContent = t("正在读取对局……", "Loading game…");
    $("game-status").textContent = $("game-detail").textContent = $("sync-status").textContent = "";
    $("leave").hidden = true;
    $("game-phase").textContent = "";
    return;
  }
  const role = ownRole();
  $("refresh-game").hidden = room.status === "finished" && (ownAcknowledged() || !role);
  $("back").hidden = !canReturn();
  $("game-phase").textContent = phaseText(room);
  $("game-phase").className = `game-phase phase-${room.status}`;
  $("room-title").textContent = `● ${room.host.author.login} / ○ ${room.white?.author.login || "—"}`;
  let status = statusText(room);
  if (pendingJoin() && room.status === "waiting") status = t("等待房主确认加入；房主需保持页面打开。", "Waiting for the host to accept. The host must keep their page open.");
  else if (room.status === "waiting" && role === "black") status = t("等待玩家加入，请保持此页面打开。", "Waiting for a player. Keep this page open.");
  else if (room.status === "playing") status += role ? ` · ${t("你是", "You are")} ${colorName(role)}` : ` · ${t("正在旁观", "Watching")}`;
  $("game-status").textContent = status;
  $("game-detail").textContent = `${room.host.record.forbidden ? t("黑方有禁手（三三、四四、长连）", "Black forbidden moves: double three, double four, overline") : t("无禁手，五连或长连获胜", "Freestyle: five or more wins")} · ${room.moves.length} ${t("手", "moves")} · ${room.host.record.gameId.slice(0, 8)}`;
  $("sync-status").textContent = `${room.status === "finished" && role && !ownAcknowledged() ? t("结果尚未确认，请重试同步", "Result not confirmed yet; retry sync") : s.synced ? t("已同步", "Synced") : t("同步未确认，落子已暂停", "Sync unconfirmed; play paused")}${s.lastSync ? ` · ${s.lastSync.toLocaleTimeString(language === "zh" ? "zh-CN" : "en-US")}` : ""}${shouldPoll() ? t(" · 每 5 秒刷新", " · Refreshing every 5 seconds") : ""}${document.hidden ? t(" · 后台已暂停", " · Paused in background") : ""}`;
  const canLeave = (role && ["waiting", "playing"].includes(room.status)) || (pendingJoin() && room.status === "waiting");
  $("leave").hidden = !canLeave;
  $("leave").textContent = room.status === "playing" ? t("认负", "Resign") : role === "black" ? t("取消房间", "Cancel room") : t("撤回申请", "Withdraw");
  $("leave").disabled = s.busy || Boolean(s.client.pending);
  renderBoard();
}
function render() {
  document.title = t("在线五子棋", "Online Gomoku");
  if (s.resultNotice) {
    const result = s.resultNotice;
    $("result-message").textContent = `${result.winner ? `${colorName(result.winner)} ${t("获胜", "wins")}` : t("和棋", "Draw")}${result.reason === "resign" ? t("（对手认负）", " (opponent resigned)") : ""}`;
  }
  $("notice").textContent = s.message ? s.message[language === "zh" ? 0 : 1] : "";
  $("notice").className = s.failed ? "text-danger" : "text-success";
  const loading = s.loading || s.loadError;
  $("loading-panel").hidden = !loading;
  $("loading-panel").setAttribute("aria-busy", String(s.loading));
  $("loading-spinner").hidden = !s.loading;
  $("loading-label").hidden = !s.loading;
  $("retry-load").hidden = !s.loadError;
  $("retry-load").disabled = s.busy;
  $("login-panel").hidden = loading || Boolean(s.user);
  $("session-panel").hidden = loading || !s.user || !s.client;
  $("account").hidden = loading || !s.user;
  $("identity").textContent = s.user ? `@${s.user.login}` : "";
  $("login").disabled = s.busy || !$("consent").checked;
  for (const id of ["logout", "refresh-lobby", "back", "refresh-game", "preview-cleanup", "more", "resolve-write"]) $(id).disabled = s.busy;
  if (!s.client || !s.user) return;
  $("pending-write").hidden = !s.client.pending;
  $("quota").textContent = s.quota ? t(
    `GitHub 额度：${s.quota.remaining}/${s.quota.limit}，本次读取 ${s.quota.cost} 点；重置于 ${new Date(s.quota.resetAt).toLocaleString("zh-CN")}`,
    `GitHub quota: ${s.quota.remaining}/${s.quota.limit}; last query ${s.quota.cost} points; resets ${new Date(s.quota.resetAt).toLocaleString("en-US")}`) : "";
  $("create").disabled = s.busy || Boolean(s.client.pending) || s.client.activeRooms().length > 0;
  $("admin").hidden = !isAdmin() || Boolean(s.selection);
  $("execute-cleanup").disabled = s.busy || !s.cleanup.length || Boolean(s.client.pending);
  $("lobby").hidden = Boolean(s.selection);
  $("game").hidden = !s.selection;
  if (!s.selection) renderRooms();
  else renderGame();
}

$("consent").addEventListener("change", render);
$("login").addEventListener("click", () => task(async () => {
  const result = await login($("remember").checked);
  await connect(result.token);
  if (!result.stored) notify("浏览器存储不可用，登录仅保存在当前页面内存。", "Browser storage is unavailable. Sign-in is kept in page memory only.");
}));
$("logout").addEventListener("click", () => task(async () => {
  await endSession(); notify("已退出。", "Signed out.");
}));
$("refresh-lobby").addEventListener("click", () => task(() => lobby()));
$("back").addEventListener("click", () => { if (canReturn()) task(() => lobby()); });
$("refresh-game").addEventListener("click", () => task(syncGame));
$("more").addEventListener("click", () => { s.count += gameConfig.pageSize; render(); });
$("resolve-write").addEventListener("click", () => task(async () => {
  await s.client.load();
  if (!s.client.pending) {
    if (s.selection) await syncGame();
    notify("已查证上次提交，无需重复写入。", "The previous submission was found. No duplicate was sent.");
    return;
  }
  if (confirm(t("GitHub 当前未查到预期写入。请确认已检查 Discussion，并放弃上次提交；若原请求迟到完成，可能仍留下记录。是否继续？",
    "GitHub has not returned the expected write. After checking the discussion, abandon this submission? A delayed original request may still leave a record."))) {
    s.client.remember(null);
    if (s.selection) await syncGame();
    notify("已放弃上次未确认提交。", "The unconfirmed submission was abandoned.");
  }
}));
$("create").addEventListener("click", () => {
  if (s.busy || $("create").disabled) return;
  $("forbidden").checked = false;
  $("create-dialog").showModal();
});
$("cancel-create").addEventListener("click", () => $("create-dialog").close());
$("create-form").addEventListener("submit", event => {
  event.preventDefault();
  const forbidden = $("forbidden").checked;
  $("create-dialog").close();
  task(async () => {
    const host = await writeLock(() => s.client.create(forbidden));
    await openRoom(host.id);
  });
});
$("retry-load").addEventListener("click", () => task(async () => {
  s.loadError = false;
  if (s.client) await lobby(true);
  else {
    const token = savedToken();
    if (token) await connect(token);
    else notify("请先登录。", "Please sign in.");
  }
}));
$("leave").addEventListener("click", () => {
  const prompt = s.current?.status === "playing" ? t("确认认负？对局结束后将留在棋盘。", "Resign? You will stay on the final board.") :
    ownRole() === "black" ? t("确认取消等待并删除此房间？", "Cancel waiting and delete this room?") : t("确认撤回并删除加入申请？", "Withdraw and delete this application?");
  if (!confirm(prompt)) return;
  task(async () => {
    const room = await writeLock(() => s.client.leave(s.selection.hostId, s.selection.applicantId));
    if (room) await receiveRoom(room);
    else await lobby();
  });
});
$("preview-cleanup").addEventListener("click", () => task(async () => {
  if (!isAdmin()) return;
  await s.client.load();
  s.cleanup = cleanupGroups([...s.client.comments.values()], Date.now(), gameConfig.retentionDays);
  $("cleanup-output").textContent = JSON.stringify(s.cleanup.map(g => ({ id: g.id, updatedAt: g.updatedAt,
    comments: g.entries.map(c => ({ id: c.id, author: c.author.login, viewerCanDelete: c.viewerCanDelete })) })), null, 2);
  notify(`找到 ${s.cleanup.length} 组可清理数据，请检查预览。`, `Found ${s.cleanup.length} groups eligible for cleanup. Review the preview.`);
}));
$("execute-cleanup").addEventListener("click", () => {
  if (!isAdmin() || !s.cleanup.length || !confirm(t("确认删除预览中的过期游戏数据？", "Delete the previewed expired game data?"))) return;
  task(() => writeLock(async () => {
    const report = await s.client.cleanup(s.cleanup.map(g => g.id));
    s.cleanup = [];
    $("cleanup-output").textContent = JSON.stringify(report, null, 2);
    await s.client.load();
    notify(`清理完成：删除 ${report.deleted}，跳过 ${report.skipped}，失败 ${report.failed}。`,
      `Cleanup: ${report.deleted} deleted, ${report.skipped} skipped, ${report.failed} failed.`);
  }));
});
watchLogout(() => { endSession(false).finally(() => { notify("已在其他标签页退出。", "Signed out in another tab."); render(); }); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { poller.stop(); return; }
  if (s.api && s.selection) task(syncGame);
});
window.addEventListener("focus", () => { if (s.api && s.selection && !s.busy && !document.hidden) task(syncGame); });
window.addEventListener("offline", () => {
  poller.stop(); s.synced = false; notify(...errors.network, true); render();
});
window.addEventListener("online", () => { if (s.api && s.selection) task(syncGame); });
SiteUI.onLanguageChange(value => { language = value; render(); });

const token = savedToken();
if (token) await task(() => connect(token));
else { s.loading = false; notify("请先登录。", "Please sign in."); render(); }
