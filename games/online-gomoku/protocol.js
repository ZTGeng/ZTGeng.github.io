import { replay } from "./rules.js";

export const MARKER = "<!-- gomoku-v1 -->";
const roles = ["black", "white"];
const statuses = ["waiting", "playing", "finished", "cancelled"];
export function encode(record) {
  return `${MARKER}\n\n\`\`\`json\n${JSON.stringify(record)}\n\`\`\``;
}

export function parse(comment) {
  if (!comment?.body?.startsWith(MARKER) || comment.body.length > 20000) return null;
  const match = comment.body.match(/^<!-- gomoku-v1 -->\s*```json\s*([\s\S]*?)\s*```\s*$/);
  if (!match) return null;
  try {
    const record = JSON.parse(match[1]);
    // Existing v1 games predate terminal acknowledgements; read them as unconfirmed.
    record.acknowledged ??= false;
    record.winner ??= null;
    record.reason ??= null;
    if (record.protocol !== "gomoku-v1" || typeof record.gameId !== "string" || !record.gameId ||
        record.gameId.length > 100 || record.userId !== comment.author?.id || !record.userId ||
        !roles.includes(record.role) || !statuses.includes(record.status) ||
        typeof record.forbidden !== "boolean" || typeof record.resigned !== "boolean" ||
        typeof record.acknowledged !== "boolean" ||
        !Array.isArray(record.moves) || record.moves.length > 225 ||
        !(record.hostCommentId === null || typeof record.hostCommentId === "string") ||
        !(record.opponentCommentId === null || typeof record.opponentCommentId === "string")) return null;
    if (record.role === "black" && record.hostCommentId !== null) return null;
    if (record.role === "white" && (!record.hostCommentId || record.opponentCommentId !== null)) return null;
    if (record.acknowledged) {
      if (record.status !== "finished" || !["five", "resign", "draw"].includes(record.reason) ||
          (record.reason === "draw" ? record.winner !== null : !roles.includes(record.winner))) return null;
      if (record.resigned && (record.reason !== "resign" || record.winner === record.role)) return null;
    } else if (record.winner !== null || record.reason !== null) return null;
    replay(record.moves, record.forbidden);
    if (record.moves.length && record.moves.length % 2 !== (record.role === "black" ? 1 : 0)) return null;
    return { ...comment, record };
  } catch { return null; }
}

export function prefix(a, b) {
  return a.length <= b.length && a.every((move, i) => move[0] === b[i][0] && move[1] === b[i][1]);
}

export function mergeMoves(a, b) {
  if (!prefix(a, b) && !prefix(b, a)) throw new Error("fork");
  if (Math.abs(a.length - b.length) > 1) throw new Error("snapshotGap");
  return a.length >= b.length ? a : b;
}

export function roomFrom(host, records) {
  if (host.record.role !== "black") throw new Error("invalidRoom");
  const h = host.record;
  let white = null;
  if (h.opponentCommentId) {
    white = records.get(h.opponentCommentId);
    if (!white && h.acknowledged) return terminalOrphan(host);
    if (!white || white.record.role !== "white" || white.record.hostCommentId !== host.id ||
        white.record.gameId !== h.gameId || white.record.forbidden !== h.forbidden ||
        white.record.userId === h.userId) throw new Error("missingOpponent");
  }
  if (!white && h.moves.length) throw new Error("unpairedMoves");
  const moves = white ? mergeMoves(h.moves, white.record.moves) : [];
  const state = replay(moves, h.forbidden);
  let status = white ? "playing" : "waiting";
  let winner = state.winner;
  let reason = state.finished ? (state.winner ? "five" : "draw") : null;
  if (h.status === "cancelled" && !white) status = "cancelled";
  if (state.finished) status = "finished";
  if (white && (h.resigned || white.record.resigned)) {
    if (h.resigned && white.record.resigned) throw new Error("resultMismatch");
    if (!state.finished) { winner = h.resigned ? "white" : "black"; reason = "resign"; }
    status = "finished";
  }
  for (const entry of [host, white].filter(Boolean)) {
    if (entry.record.acknowledged && (status !== "finished" || entry.record.winner !== winner || entry.record.reason !== reason)) {
      throw new Error("resultMismatch");
    }
  }
  return { id: host.id, host, white, moves, state, status, winner, reason,
    updatedAt: [host.updatedAt, white?.updatedAt].filter(Boolean).sort().at(-1) };
}

function absentHost(white) {
  return { id: white.record.hostCommentId, author: { login: "—", id: null }, updatedAt: white.updatedAt,
    record: { ...newRecord(null, white.record.gameId, white.record.forbidden), opponentCommentId: white.id } };
}
function terminalOrphan(entry) {
  const black = entry.record.role === "black";
  return { id: black ? entry.id : entry.record.hostCommentId, host: black ? entry : absentHost(entry),
    white: black ? null : entry, missingPeer: true, moves: entry.record.moves,
    state: replay(entry.record.moves, entry.record.forbidden), status: "finished",
    winner: entry.record.winner, reason: entry.record.reason, updatedAt: entry.updatedAt };
}

export function aggregate(comments) {
  const records = new Map(comments.map(parse).filter(Boolean).map(c => [c.id, c]));
  const rooms = [];
  for (const host of records.values()) {
    if (host.record.role !== "black") continue;
    try { rooms.push(roomFrom(host, records)); }
    catch (error) { rooms.push({ id: host.id, host, status: "error", error: error.message,
      moves: [], white: records.get(host.record.opponentCommentId), updatedAt: host.updatedAt }); }
  }
  for (const white of records.values()) {
    if (white.record.role !== "white" || records.has(white.record.hostCommentId)) continue;
    if (white.record.acknowledged) rooms.push(terminalOrphan(white));
    else if (white.record.moves.length || white.record.status === "playing") {
      rooms.push({ id: white.record.hostCommentId, host: absentHost(white), white, moves: [],
        status: "error", error: "missingRoom", updatedAt: white.updatedAt });
    }
  }
  rooms.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
  return { records, rooms };
}

export function roleOf(room, userId) {
  if (room.host.record.userId === userId) return "black";
  if (room.white?.record.userId === userId) return "white";
  return null;
}
export function ownEntry(room, userId) {
  const role = roleOf(room, userId);
  return role === "black" ? room.host : role === "white" ? room.white : null;
}
export function sameResult(a, b) {
  return Boolean(a?.acknowledged && b?.acknowledged && a.winner === b.winner && a.reason === b.reason);
}
export function lobbyRooms(rooms, userId) {
  return rooms.flatMap(room => {
    const own = ownEntry(room, userId);
    if (room.status === "error" && own) return [room];
    if (own?.record.acknowledged || room.status === "cancelled") return [];
    if (room.status === "finished") return own ? [{ ...room, status: "playing", needsResultSync: true }] : [];
    return ["waiting", "playing"].includes(room.status) || own ? [room] : [];
  });
}

export function chooseApplicant(host, records) {
  if (host.record.opponentCommentId || host.record.status !== "waiting") return null;
  return [...records.values()].filter(c => c.record.role === "white" &&
    c.record.hostCommentId === host.id && c.record.gameId === host.record.gameId &&
    c.record.userId !== host.record.userId && c.record.forbidden === host.record.forbidden &&
    c.record.moves.length === 0 && !c.record.resigned && c.record.status === "waiting")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))[0] || null;
}

export function newRecord(userId, gameId, forbidden, hostCommentId = null) {
  return { protocol: "gomoku-v1", gameId, userId, forbidden, role: hostCommentId ? "white" : "black",
    hostCommentId, opponentCommentId: null, status: "waiting", resigned: false,
    acknowledged: false, winner: null, reason: null, moves: [] };
}

export function ownCleanupCandidates(comments, userId) {
  const raw = new Map(comments.map(c => [c.id, c]));
  const { records } = aggregate(comments);
  return [...records.values()].filter(entry => {
    const r = entry.record;
    if (r.userId !== userId) return false;
    const peerId = r.role === "black" ? r.opponentCommentId : r.hostCommentId;
    const peer = records.get(peerId);
    if (r.acknowledged && peerId) {
      if (!raw.has(peerId)) return true;
      const paired = r.role === "black" ? peer?.record.hostCommentId === entry.id : peer?.record.opponentCommentId === entry.id;
      if (paired && peer.record.gameId === r.gameId && sameResult(r, peer.record)) {
        try { return roomFrom(r.role === "black" ? entry : peer, records).status === "finished"; }
        catch { return false; }
      }
    }
    if (r.role === "white" && !r.acknowledged && r.moves.length === 0 && ["waiting", "cancelled"].includes(r.status)) {
      if (!raw.has(peerId)) return true;
      if (peer?.record.gameId === r.gameId && (peer.record.status === "cancelled" ||
          (peer.record.opponentCommentId && peer.record.opponentCommentId !== entry.id))) return true;
    }
    return r.role === "black" && r.status === "cancelled" && !r.opponentCommentId && !r.moves.length;
  });
}

// Group all applications with their host so a recently active game is never partly expired.
export function cleanupGroups(comments, now, days = 30) {
  const { records } = aggregate(comments);
  const groups = new Map();
  for (const entry of records.values()) {
    const key = entry.record.role === "black" ? entry.id : entry.record.hostCommentId;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  const cutoff = now - days * 86400000;
  const raw = new Map(comments.map(c => [c.id, c]));
  return [...groups.entries()].flatMap(([id, entries]) => {
    const host = records.get(id);
    const white = host && records.get(host.record.opponentCommentId);
    let reason = null;
    if (host && white && sameResult(host.record, white.record)) {
      try { if (roomFrom(host, records).status === "finished") reason = "confirmed"; } catch { /* Keep conflicts. */ }
    } else if (host?.record.acknowledged && host.record.opponentCommentId && !raw.has(host.record.opponentCommentId)) reason = "residual";
    else if (!raw.has(id) && entries.every(c => c.record.acknowledged ||
      (!c.record.moves.length && ["waiting", "cancelled"].includes(c.record.status)))) reason = "residual";
    else if (host?.record.status === "cancelled" && !host.record.opponentCommentId && !host.record.moves.length) reason = "cancelled";
    if (!reason && entries.every(c => Number.isFinite(Date.parse(c.updatedAt)) && Date.parse(c.updatedAt) < cutoff)) reason = "expired";
    return reason ? [{ id, entries, reason, updatedAt: entries.map(c => c.updatedAt).sort().at(-1) }] : [];
  });
}
