import { aggregate, parse, encode, prefix, roomFrom, chooseApplicant, newRecord, roleOf, cleanupGroups,
  lobbyRooms, ownEntry, ownCleanupCandidates } from "./protocol.js";
import { appendMove, replay, other } from "./rules.js";

export class GameClient {
  constructor(api, user, storage = null) {
    this.api = api; this.user = user; this.storage = storage;
    this.key = `gomoku-pending:${user.id}`;
    this.comments = new Map(); this.records = new Map(); this.rooms = []; this.cursor = null;
    this.pending = null;
    this.histories = new Map();
    try { this.pending = JSON.parse(storage?.getItem(this.key) || "null"); } catch { /* Optional. */ }
  }
  remember(pending) {
    this.pending = pending;
    try {
      if (pending) this.storage?.setItem(this.key, JSON.stringify(pending));
      else this.storage?.removeItem(this.key);
    } catch { /* The in-memory pending operation remains authoritative this session. */ }
  }
  rebuild() {
    const result = aggregate([...this.comments.values()]);
    this.records = result.records; this.rooms = result.rooms;
  }
  apply(comments) {
    for (const comment of comments) {
      if (!comment) continue;
      const old = this.comments.get(comment.id);
      if (!old || old.updatedAt <= comment.updatedAt) this.comments.set(comment.id, comment);
    }
    this.rebuild();
  }
  async load() {
    const result = await this.api.scan();
    this.comments = new Map(result.comments.map(c => [c.id, c]));
    this.cursor = result.cursor;
    this.rebuild();
    this.reconcilePending();
    return this.rooms;
  }
  reconcilePending() {
    if (!this.pending) return null;
    const pending = this.pending;
    const expected = pending.record;
    const found = [...this.records.values()].filter(c =>
      (!pending.id || c.id === pending.id) && c.record.userId === this.user.id &&
      c.record.gameId === expected.gameId && c.record.role === expected.role &&
      c.record.hostCommentId === expected.hostCommentId && prefix(expected.moves, c.record.moves) &&
      (!expected.opponentCommentId || c.record.opponentCommentId === expected.opponentCommentId) &&
      (!expected.resigned || c.record.resigned) &&
      (!expected.acknowledged || (c.record.acknowledged && c.record.winner === expected.winner && c.record.reason === expected.reason)) &&
      (expected.status !== "cancelled" || c.record.status === "cancelled"))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))[0];
    if (found) this.remember(null);
    return found || null;
  }
  async fresh(ids) {
    const results = await this.api.nodes(ids);
    for (let i = 0; i < ids.length; i++) {
      if (!results[i]) this.comments.delete(ids[i]);
    }
    this.apply(results);
    return results;
  }
  async room(id, { discover = false } = {}) {
    const hostBefore = this.records.get(id);
    const discoverWaiting = discover && hostBefore && !hostBefore.record.opponentCommentId && hostBefore.record.status === "waiting";
    if (discoverWaiting) {
      try {
        const result = await this.api.scan(this.cursor, id);
        if (!result.host) this.comments.delete(id);
        this.apply([...result.comments, result.host]); this.cursor = result.cursor;
      } catch (error) {
        if (error.message !== "apiError") throw error;
        await this.load();
      }
    } else await this.fresh([id, hostBefore?.record.opponentCommentId].filter(Boolean));
    let host = this.records.get(id);
    if (!host || host.record.role !== "black") {
      const orphan = this.rooms.find(room => room.id === id && room.missingPeer && ownEntry(room, this.user.id)?.record.acknowledged);
      if (orphan) return this.keepHistory(orphan);
      throw new Error("missingRoom");
    }
    if (host.record.opponentCommentId && host.record.opponentCommentId !== hostBefore?.record.opponentCommentId) {
      await this.fresh([host.record.opponentCommentId]);
    }
    return this.keepHistory(roomFrom(host, this.records));
  }
  keepHistory(room) {
    const known = this.histories.get(room.id);
    if (known && !prefix(known, room.moves)) {
      if (room.status === "finished" && ownEntry(room, this.user.id)?.record.acknowledged && prefix(room.moves, known)) {
        room = { ...room, moves: known, state: replay(known, room.host.record.forbidden) };
      } else throw new Error("historyRollback");
    }
    this.histories.set(room.id, room.moves);
    return room;
  }
  lobbyRooms() { return lobbyRooms(this.rooms, this.user.id); }
  activeRooms() {
    return this.lobbyRooms().filter(room => ["waiting", "playing", "error"].includes(room.status) && roleOf(room, this.user.id));
  }
  assertWritable() { if (this.pending) throw new Error("unknownWrite"); }
  async write(record, entry = null) {
    this.assertWritable();
    if (record.userId !== this.user.id || (entry && (entry.author.id !== this.user.id || !entry.viewerCanUpdate))) {
      throw new Error("permission");
    }
    this.remember({ id: entry?.id || null, record });
    try {
      const result = entry ? await this.api.edit(entry.id, encode(record)) : await this.api.add(encode(record));
      const parsed = parse(result);
      if (!parsed || result.body !== encode(record)) throw new Error("apiError");
      this.apply([result]);
      this.remember(null);
      return parsed;
    } catch (error) {
      // A timeout may have happened after GitHub committed. Read, never blindly re-send.
      try {
        await this.load();
        const found = [...this.records.values()].find(c => c.record.userId === this.user.id &&
          c.record.gameId === record.gameId && c.record.role === record.role &&
          (entry ? c.id === entry.id : c.record.hostCommentId === record.hostCommentId) &&
          c.body === encode(record));
        if (found) { this.remember(null); return found; }
      } catch { /* Keep the pending record when verification is unavailable. */ }
      // Definite auth/permission failures cannot commit, so allow a corrected attempt.
      if (["permission", "unauthorized", "rateLimited"].includes(error.message)) this.remember(null);
      throw error;
    }
  }
  async create(forbidden) {
    this.assertWritable();
    await this.load();
    if (this.activeRooms().length) throw new Error("alreadyPlaying");
    const record = newRecord(this.user.id, crypto.randomUUID(), forbidden);
    return this.write(record);
  }
  async join(id) {
    this.assertWritable();
    await this.load();
    if (this.activeRooms().length) throw new Error("alreadyPlaying");
    const room = await this.room(id);
    if (room.status !== "waiting" || roleOf(room, this.user.id)) throw new Error("notWaiting");
    const existing = [...this.records.values()].filter(c => c.record.role === "white" &&
      c.record.hostCommentId === id && c.record.userId === this.user.id && c.record.gameId === room.host.record.gameId &&
      c.record.status === "waiting" && !c.record.resigned).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (existing) return existing;
    return this.write(newRecord(this.user.id, room.host.record.gameId, room.host.record.forbidden, id));
  }
  async accept(id) {
    this.assertWritable();
    const room = await this.room(id, { discover: true });
    if (room.status !== "waiting" || room.host.record.userId !== this.user.id) return room;
    const applicant = chooseApplicant(room.host, this.records);
    if (!applicant) return room;
    await this.fresh([applicant.id]);
    const valid = chooseApplicant(room.host, new Map([[applicant.id, this.records.get(applicant.id)]].filter(([, c]) => c)));
    if (!valid) return room;
    await this.write({ ...room.host.record, status: "playing", opponentCommentId: applicant.id }, room.host);
    return roomFrom(this.records.get(id), this.records);
  }
  async move(id, coordinates) {
    this.assertWritable();
    const room = await this.room(id);
    const role = roleOf(room, this.user.id);
    if (room.status === "finished" && role) return room;
    if (room.status !== "playing" || !role) throw new Error("wrongTurn");
    const moves = appendMove(room.moves, role, coordinates, room.host.record.forbidden);
    const entry = role === "black" ? room.host : room.white;
    const result = replay(moves, room.host.record.forbidden);
    await this.write({ ...entry.record, moves, status: result.finished ? "finished" : "playing",
      acknowledged: result.finished, winner: result.winner, reason: result.finished ? (result.winner ? "five" : "draw") : null }, entry);
    return this.keepHistory(roomFrom(this.records.get(id), this.records));
  }
  async leave(id, applicantId = null) {
    this.assertWritable();
    const room = await this.room(id);
    const role = roleOf(room, this.user.id);
    if (room.status === "waiting" && role === "black") {
      await this.deleteOwn(room.host);
      return null;
    } else if (room.status === "playing" && role) {
      const entry = role === "black" ? room.host : room.white;
      await this.write({ ...entry.record, resigned: true, status: "finished",
        acknowledged: true, winner: other(role), reason: "resign" }, entry);
    } else if (room.status === "finished" && role) {
      return room;
    } else if (applicantId) {
      await this.fresh([applicantId]);
      const entry = this.records.get(applicantId);
      if (!entry || entry.record.userId !== this.user.id || entry.record.hostCommentId !== id) throw new Error("permission");
      await this.deleteOwn(entry);
      return null;
    }
    return this.room(id);
  }
  async acknowledge(id) {
    this.assertWritable();
    const room = await this.room(id);
    const entry = ownEntry(room, this.user.id);
    if (room.status !== "finished" || !entry) throw new Error("invalidResult");
    if (entry.record.acknowledged) return room;
    await this.write({ ...entry.record, acknowledged: true, winner: room.winner, reason: room.reason, status: "finished" }, entry);
    return this.keepHistory(roomFrom(this.records.get(id), this.records));
  }
  async deleteOwn(entry) {
    if (entry.record.userId !== this.user.id || !entry.viewerCanDelete) throw new Error("permission");
    try { await this.api.delete(entry.id); }
    catch (error) {
      const [remaining] = await this.api.nodes([entry.id]);
      if (remaining) throw error;
    }
    this.comments.delete(entry.id); this.rebuild();
  }
  async cleanupOwn() {
    const report = { deleted: 0, failed: 0 };
    if (this.pending) return report;
    const candidates = ownCleanupCandidates([...this.comments.values()], this.user.id);
    for (const candidate of candidates) {
      try {
        const r = candidate.record;
        const ids = [...new Set([candidate.id, r.role === "black" ? r.opponentCommentId : r.hostCommentId].filter(Boolean))];
        await this.fresh(ids);
        const current = ownCleanupCandidates([...this.comments.values()], this.user.id).find(c => c.id === candidate.id);
        if (current) { await this.deleteOwn(current); report.deleted++; }
      } catch (error) {
        report.failed++;
        if (["unauthorized", "rateLimited"].includes(error.message)) break;
      }
    }
    return report;
  }
  async cleanup(previewIds, now = Date.now()) {
    const report = { deleted: 0, skipped: 0, failed: 0 };
    for (const id of previewIds) {
      // Full rescan also catches newly created applications before deleting a group.
      await this.load();
      const group = cleanupGroups([...this.comments.values()], now).find(g => g.id === id);
      if (!group || !group.entries.every(c => c.viewerCanDelete)) { report.skipped++; continue; }
      // Root last: partial failures leave a discoverable host for the next cleanup attempt.
      const entries = group.entries.sort((a, b) => Number(a.record.role === "black") - Number(b.record.role === "black"));
      const remaining = new Map(entries.map(entry => [entry.id, entry]));
      for (const entry of entries) {
        try {
          const fresh = await this.api.nodes([...remaining.keys()]);
          if (fresh.some((record, index) => !record || !record.viewerCanDelete ||
              record.updatedAt !== [...remaining.values()][index].updatedAt)) { report.skipped++; break; }
          await this.api.delete(entry.id); report.deleted++;
          remaining.delete(entry.id);
        } catch (error) {
          report.failed++;
          if (["rateLimited", "unauthorized"].includes(error.message)) throw error;
          break;
        }
      }
    }
    return report;
  }
}
