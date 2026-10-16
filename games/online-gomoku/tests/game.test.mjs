import test from "node:test";
import assert from "node:assert/strict";
import { replay, appendMove, blackFoul } from "../rules.js";
import { encode, parse, aggregate, newRecord, roomFrom, mergeMoves, chooseApplicant, cleanupGroups,
  ownCleanupCandidates, lobbyRooms } from "../protocol.js";
import { GameClient } from "../client.js";
import { GitHub } from "../github.js";
import { Poller } from "../sync.js";

const now = new Date().toISOString();
const comment = (id, record, extra = {}) => ({ id, body: encode(record), author: { id: record.userId, login: record.userId },
  createdAt: now, updatedAt: now, viewerCanUpdate: true, viewerCanDelete: true, url: `https://github.com/test#${id}`, ...extra });
const host = () => newRecord("U1", "game-a", false);
const applicant = (user = "U2") => newRecord(user, "game-a", false, "H");
const boardWith = (points, color = 1) => {
  const board = new Uint8Array(225);
  points.forEach(([x, y]) => { board[y * 15 + x] = color; });
  return board;
};
const interleave = (black, white) => black.flatMap((point, i) => white[i] ? [point, white[i]] : [point]);

test("wins in all four directions; rejects moves after a win", () => {
  for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const black = Array.from({ length: 5 }, (_, i) => [5 + i * dx, 8 + i * dy]);
    const white = [[0, 0], [2, 0], [4, 0], [6, 0]];
    const moves = interleave(black, white);
    assert.equal(replay(moves).winner, "black");
    assert.throws(() => replay([...moves, [1, 1]]), /afterEnd/);
  }
});
test("freestyle overline wins; forbidden black overline rejected", () => {
  const moves = interleave([[0, 7], [1, 7], [2, 7], [4, 7], [5, 7], [3, 7]],
    [[0, 0], [2, 0], [4, 0], [6, 0], [8, 0]]);
  assert.equal(replay(moves).winner, "black");
  assert.throws(() => replay(moves, true), /overline/);
});
test("full board draw, alternating players, input bounds and duplicate checks", () => {
  const colors = [[], []];
  for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) colors[(x + 2 * y) % 4 < 2 ? 0 : 1].push([x, y]);
  const result = replay(interleave(...colors));
  assert.equal(result.finished, true); assert.equal(result.winner, null);
  assert.throws(() => appendMove([], "white", [0, 0]), /wrongTurn/);
  assert.throws(() => replay([[15, 0]]), /outOfBounds/);
  assert.throws(() => replay([[1.2, 0]]), /invalidMove/);
  assert.throws(() => replay([[0, 0], [0, 0]]), /occupied/);
});
test("true double three, double four, edge false three, single open four", () => {
  assert.equal(blackFoul(boardWith([[6, 7], [8, 7], [7, 6], [7, 8], [7, 7]]), 7, 7), "doubleThree");
  assert.equal(blackFoul(boardWith([[4, 7], [5, 7], [6, 7], [7, 4], [7, 5], [7, 6], [7, 7]]), 7, 7), "doubleFour");
  assert.equal(blackFoul(boardWith([[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]]), 0, 0), null);
  assert.equal(blackFoul(boardWith([[4, 7], [5, 7], [6, 7], [7, 7]]), 7, 7), null);
  assert.equal(blackFoul(boardWith([[3, 7], [5, 7], [6, 7], [7, 7], [9, 7]]), 7, 7), "doubleFour");
});
test("exact five has priority over forbidden shapes; white has no forbidden moves", () => {
  const board = boardWith([[3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [7, 3], [7, 4], [7, 5], [7, 6], [7, 8]]);
  assert.equal(blackFoul(board, 7, 7), null);
  const moves = interleave([[0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [10, 0]],
    [[0, 7], [1, 7], [2, 7], [4, 7], [5, 7], [3, 7]]);
  assert.equal(replay(moves, true).winner, "white");
});
test("protocol verifies real author, format, role parity, and ignores unrelated comments", () => {
  assert.ok(parse(comment("H", host())));
  assert.equal(parse(comment("H", host(), { author: { id: "fake" } })), null);
  assert.equal(parse({ body: "a normal discussion reply" }), null);
  assert.equal(parse(comment("H", { ...host(), moves: [[0, 0], [1, 0]] })), null);
  assert.equal(parse(comment("W", { ...applicant(), moves: [[0, 0]] })), null);
});
test("prefix merge accepts one move of lag; rejects divergent and abnormal length histories", () => {
  assert.deepEqual(mergeMoves([[0, 0], [1, 0]], [[0, 0]]), [[0, 0], [1, 0]]);
  assert.throws(() => mergeMoves([[0, 0]], [[1, 0]]), /fork/);
  assert.throws(() => mergeMoves([[0, 0], [1, 0], [2, 0]], []), /snapshotGap/);
});
test("deterministic applicant order, confirmed pairing, resignation", () => {
  const h = parse(comment("H", host()));
  const w1 = parse(comment("A", applicant()));
  const w2 = parse(comment("B", applicant("U3")));
  const records = new Map([["H", h], ["B", w2], ["A", w1]]);
  assert.equal(chooseApplicant(h, records).id, "A");
  h.record.opponentCommentId = "B";
  assert.equal(roomFrom(h, records).white.id, "B");
  assert.equal(chooseApplicant(h, records), null);
  w2.record.resigned = true;
  assert.equal(roomFrom(h, records).winner, "black");
  assert.equal(roomFrom(h, records).status, "finished");
});
test("cleanup groups all applications; recent host or applicant protects whole game", () => {
  const expired = "2020-01-01T00:00:00.000Z";
  const records = [comment("H", host(), { updatedAt: expired }), comment("W", applicant(), { updatedAt: expired })];
  assert.equal(cleanupGroups(records, Date.now()).length, 1);
  records[1].updatedAt = now;
  assert.equal(cleanupGroups(records, Date.now()).length, 0);
  assert.equal(cleanupGroups([{ body: "ordinary comment", updatedAt: expired }], Date.now()).length, 0);
  assert.equal(cleanupGroups([comment("orphan", applicant(), { updatedAt: expired })], Date.now()).length, 1);
});

function fakeApi(database, user) {
  let counter = database.size;
  return {
    calls: { add: 0, edit: 0 }, failAddAfterCommit: false, failEditAfterCommit: false, failAddBeforeCommit: false,
    async scan(after, hostId) { return { comments: [...database.values()].map(c => structuredClone(c)), cursor: "cursor", host: structuredClone(database.get(hostId) || null) }; },
    async nodes(ids) { return ids.map(id => structuredClone(database.get(id) || null)); },
    async add(body) {
      this.calls.add++;
      if (this.failAddBeforeCommit) throw new Error("network");
      const c = { ...comment(`${user}-${++counter}`, JSON.parse(body.match(/```json\s*([\s\S]*?)\s*```/)[1])), body };
      database.set(c.id, c);
      if (this.failAddAfterCommit) { this.failAddAfterCommit = false; throw new Error("network"); }
      return structuredClone(c);
    },
    async edit(id, body) {
      this.calls.edit++;
      const c = { ...database.get(id), body, updatedAt: new Date(Date.now() + this.calls.edit).toISOString() };
      database.set(id, c);
      if (this.failEditAfterCommit) { this.failEditAfterCommit = false; throw new Error("network"); }
      return structuredClone(c);
    },
    async delete(id) { database.delete(id); }
  };
}
test("two players pair, alternate moves, resume and resign without sharing credentials", async () => {
  const db = new Map();
  const blackApi = fakeApi(db, "U1"), whiteApi = fakeApi(db, "U2");
  const black = new GameClient(blackApi, { id: "U1" });
  const white = new GameClient(whiteApi, { id: "U2" });
  const h = await black.create(false);
  const w = await white.join(h.id);
  assert.equal((await white.room(h.id)).status, "waiting");
  assert.equal((await black.accept(h.id)).white.id, w.id);
  assert.equal((await black.move(h.id, [7, 7])).moves.length, 1);
  await assert.rejects(() => black.move(h.id, [8, 7]), /wrongTurn/);
  assert.equal((await white.move(h.id, [8, 7])).moves.length, 2);
  const resumed = new GameClient(blackApi, { id: "U1" });
  await resumed.load(); assert.equal(resumed.activeRooms().length, 1);
  assert.equal((await resumed.room(h.id)).moves.length, 2);
  assert.equal((await resumed.leave(h.id)).winner, "white");
  assert.equal((await white.room(h.id)).status, "finished");
});
test("creation and editing timeouts are reconciled, never blindly repeated", async () => {
  const db = new Map(), api = fakeApi(db, "U1");
  const black = new GameClient(api, { id: "U1" });
  api.failAddAfterCommit = true;
  const h = await black.create(false);
  assert.equal(api.calls.add, 1); assert.equal(black.pending, null);
  const white = new GameClient(fakeApi(db, "U2"), { id: "U2" });
  await white.join(h.id); await black.accept(h.id);
  api.failEditAfterCommit = true;
  assert.equal((await black.move(h.id, [7, 7])).moves.length, 1);
  assert.equal(api.calls.edit, 2); assert.equal(black.pending, null);
});
test("unconfirmed write persists and prevents duplicate creation after reload", async () => {
  const db = new Map(), api = fakeApi(db, "U1"), values = new Map();
  const storage = { getItem:k=>values.get(k), setItem:(k,v)=>values.set(k,v), removeItem:k=>values.delete(k) };
  const client = new GameClient(api, { id: "U1" }, storage);
  api.failAddBeforeCommit = true;
  await assert.rejects(() => client.create(false));
  const restored = new GameClient(api, { id: "U1" }, storage);
  await assert.rejects(() => restored.create(false), /unknownWrite/);
  assert.equal(api.calls.add, 1);
});
test("confirmed history cannot be rolled back by later server data", async () => {
  const h = comment("H", { ...host(), opponentCommentId:"W", moves:[[7,7]] });
  const w = comment("W", applicant());
  const db = new Map([["H", h], ["W", w]]);
  const client = new GameClient(fakeApi(db, "U1"), {id:"U1"});
  await client.load(); await client.room("H");
  db.set("H", comment("H", { ...host(), opponentCommentId:"W" }, {updatedAt:new Date(Date.now()+1000).toISOString()}));
  await assert.rejects(() => client.room("H"), /historyRollback/);
});
test("withdrawn applications are never accepted", async () => {
  const db = new Map();
  const black = new GameClient(fakeApi(db,"U1"), {id:"U1"});
  const white = new GameClient(fakeApi(db,"U2"), {id:"U2"});
  const h = await black.create(false), w = await white.join(h.id);
  await white.leave(h.id,w.id);
  assert.equal((await black.accept(h.id)).status,"waiting");
});
test("cleanup deletes only expired protocol records", async () => {
  const db = new Map([["H",comment("H",host(),{updatedAt:"2020-01-01T00:00:00Z"})],
    ["ordinary", {id:"ordinary",body:"keep this",updatedAt:"2020-01-01T00:00:00Z"}]]);
  const client = new GameClient(fakeApi(db,"U1"),{id:"U1"});
  const report = await client.cleanup(["H"]);
  assert.equal(report.deleted,1); assert.equal(db.has("ordinary"),true);
});

function response(data, { status = 200, headers = {} } = {}) {
  return { ok: status === 200, status, headers: new Headers(headers), json: async()=>data };
}
test("GraphQL paginates more than 100 comments without extra quota requests", async () => {
  let calls = 0;
  const api = new GitHub("fake",()=>{},async (_, options) => {
    const {variables} = JSON.parse(options.body);
    calls++;
    assert.equal(variables.after, calls === 1 ? null : "page-1");
    return response({data:{repository:{discussion:{id:"D_kwDOAcIoFc4AqDm4", locked:false,
      comments:{nodes:Array.from({length:calls === 1 ? 100 : 2},(_,i)=>({id:`${calls}-${i}`})),
        pageInfo:{endCursor:`page-${calls}`,hasNextPage:calls===1}}}},rateLimit:{remaining:4900}}});
  });
  const result = await api.scan();
  assert.equal(result.comments.length,102); assert.equal(calls,2);
});
test("GraphQL rejects HTTP 200 partial errors and invalid token", async () => {
  const partial = new GitHub("fake",()=>{},async()=>response({data:{viewer:{id:"U1"}},errors:[{message:"oops"}]}));
  await assert.rejects(()=>partial.identity(),/apiError/);
  const expired = new GitHub("fake",()=>{},async()=>response({}, {status:401}));
  await assert.rejects(()=>expired.identity(),/unauthorized/);
});
test("secondary limit stops requests until retry; cancelled sessions discard old responses", async () => {
  let calls=0;
  const limited = new GitHub("fake",()=>{},async()=>{calls++;return response({message:"secondary rate limit"},{status:403,headers:{"retry-after":"60"}});});
  await assert.rejects(()=>limited.identity(),error=>error.retryAt>Date.now());
  await assert.rejects(()=>limited.identity(),/rateLimited/); assert.equal(calls,1);
  let release;
  const api=new GitHub("fake",()=>{},()=>new Promise(resolve=>{release=resolve;}));
  const pending=api.identity(); api.close();
  release(response({data:{viewer:{id:"stale"}}}));
  await assert.rejects(()=>pending,/abort/i);
});

test("polling never overlaps requests and can stop when a game ends", {timeout:2000}, async () => {
  let inFlight=0, maximum=0, calls=0;
  let complete;
  const done=new Promise(resolve=>{complete=resolve;});
  const poller=new Poller(async()=>{
    inFlight++; maximum=Math.max(maximum,inFlight); calls++;
    await new Promise(resolve=>setTimeout(resolve,10));
    inFlight--;
    if(calls===2){complete();return false;}
    return true;
  },1,()=>true);
  poller.start(1); await done; poller.stop();
  assert.equal(maximum,1); assert.equal(calls,2);
});
test("hidden pages do not poll", async () => {
  let calls=0;
  const poller=new Poller(async()=>{calls++;},1,()=>false);
  poller.start(1); await new Promise(resolve=>setTimeout(resolve,15)); poller.stop();
  assert.equal(calls,0);
});

async function pairedGame() {
  const db=new Map();
  const black=new GameClient(fakeApi(db,"U1"),{id:"U1"});
  const white=new GameClient(fakeApi(db,"U2"),{id:"U2"});
  const h=await black.create(false); const w=await white.join(h.id); await black.accept(h.id);
  return {db,black,white,h,w};
}
test("resignation is durable, personalized lobby keeps only the unconfirmed player active", async()=>{
  const {db,black,white,h,w}=await pairedGame();
  const ended=await black.leave(h.id);
  assert.equal(ended.reason,"resign"); assert.equal(ended.winner,"white");
  assert.equal(parse(db.get(h.id)).record.acknowledged,true);
  await black.load(); await white.load();
  assert.equal(black.lobbyRooms().length,0); assert.equal(black.activeRooms().length,0);
  assert.equal(white.activeRooms().length,1); assert.equal(white.activeRooms()[0].needsResultSync,true);
  await black.cleanupOwn(); assert.equal(db.has(h.id),true);
  await white.acknowledge(h.id);
  assert.equal(parse(db.get(w.id)).record.reason,"resign");
  await black.load(); await black.cleanupOwn();
  assert.equal(db.has(h.id),false); assert.equal(db.has(w.id),true);
  const resumed=new GameClient(fakeApi(db,"U2"),{id:"U2"}); await resumed.load();
  assert.equal(resumed.activeRooms().length,0); await resumed.cleanupOwn(); assert.equal(db.size,0);
});
test("winning move confirms only its author; receiver confirms without copying wrong-parity moves", async()=>{
  const {db,black,white,h,w}=await pairedGame();
  for(let i=0;i<4;i++){await black.move(h.id,[i,7]); await white.move(h.id,[i*2,0]);}
  await black.move(h.id,[4,7]);
  assert.equal(parse(db.get(h.id)).record.acknowledged,true);
  assert.equal(parse(db.get(w.id)).record.acknowledged,false);
  await white.load(); assert.equal(white.activeRooms().length,1);
  await white.acknowledge(h.id);
  const record=parse(db.get(w.id)).record;
  assert.equal(record.moves.length,8); assert.equal(record.winner,"black"); assert.equal(record.reason,"five");
  assert.equal(cleanupGroups([...db.values()],Date.now()).length,1);
});
test("draw acknowledgement is derived from a full board", async()=>{
  const colors=[[],[]];
  for(let y=0;y<15;y++)for(let x=0;x<15;x++)colors[(x+2*y)%4<2?0:1].push([x,y]);
  const moves=interleave(...colors);
  const h={...host(),opponentCommentId:"W",moves:moves.slice(0,223),status:"playing"};
  const w={...applicant(),moves:moves.slice(0,224),status:"playing"};
  const db=new Map([["H",comment("H",h)],["W",comment("W",w)]]);
  const black=new GameClient(fakeApi(db,"U1"),{id:"U1"}); await black.load();
  await black.move("H",moves[224]);
  assert.equal(parse(db.get("H")).record.reason,"draw");
  assert.equal(parse(db.get("H")).record.winner,null);
});
test("cancel waiting and withdraw delete records, late orphan applications are cleaned", async()=>{
  const db=new Map(),black=new GameClient(fakeApi(db,"U1"),{id:"U1"}),white=new GameClient(fakeApi(db,"U2"),{id:"U2"});
  const h=await black.create(false),w=await white.join(h.id);
  assert.equal(await black.leave(h.id),null); assert.equal(db.has(h.id),false); assert.equal(db.has(w.id),true);
  await white.load(); await white.cleanupOwn(); assert.equal(db.size,0);
});
test("missing unconfirmed active records and malformed peers are preserved",()=>{
  const unconfirmed=comment("W",{...applicant(),status:"playing",moves:[[7,7],[8,7]]});
  assert.equal(ownCleanupCandidates([unconfirmed],"U2").length,0);
  assert.equal(cleanupGroups([unconfirmed],Date.now()).length,0);
  const acknowledged=comment("H",{...host(),opponentCommentId:"W",status:"finished",acknowledged:true,winner:"white",reason:"resign",resigned:true});
  assert.equal(ownCleanupCandidates([acknowledged,{...unconfirmed,body:"invalid"}],"U1").length,0);
  assert.equal(ownCleanupCandidates([acknowledged],"U1").length,1);
});
test("conflicting confirmations remain visible as errors and are not fast-cleaned",()=>{
  const h=comment("H",{...host(),opponentCommentId:"W",status:"finished",resigned:true,acknowledged:true,winner:"white",reason:"resign"});
  const w=comment("W",{...applicant(),status:"finished",acknowledged:true,winner:"black",reason:"resign"});
  const comments=[h,w]; const {rooms}=aggregate(comments);
  assert.equal(rooms[0].error,"resultMismatch");
  assert.equal(lobbyRooms(rooms,"U1")[0].status,"error");
  assert.equal(ownCleanupCandidates(comments,"U1").length,0);
  assert.equal(cleanupGroups(comments,Date.now()).length,0);
});
test("admin can clean recent confirmed results and safe leftovers without waiting 30 days", async()=>{
  const {db,black,white,h}=await pairedGame();
  await black.leave(h.id); await white.acknowledge(h.id);
  const groups=cleanupGroups([...db.values()],Date.now());
  assert.equal(groups[0].reason,"confirmed");
  const report=await black.cleanup(groups.map(g=>g.id)); assert.equal(report.deleted,2); assert.equal(db.size,0);
});
test("deleted-node NOT_FOUND is nullable; permission errors are not mistaken for absence", async()=>{
  const deleted=new GitHub("fake",()=>{},async()=>response({data:{nodes:[null]},errors:[{type:"NOT_FOUND",path:["nodes",0],message:"gone"}]}));
  assert.deepEqual(await deleted.nodes(["gone"]),[null]);
  const denied=new GitHub("fake",()=>{},async()=>response({data:{nodes:[null]},errors:[{type:"FORBIDDEN",path:["nodes",0],message:"permission denied"}]}));
  await assert.rejects(()=>denied.nodes(["private"]),/permission/);
});
test("failed result acknowledgement keeps the receiver active until retry succeeds", async()=>{
  const {db,black,white,h,w}=await pairedGame();
  await black.leave(h.id);
  const edit=white.api.edit.bind(white.api);
  white.api.edit=async()=>{throw new Error("permission");};
  await assert.rejects(()=>white.acknowledge(h.id),/permission/);
  assert.equal(parse(db.get(w.id)).record.acknowledged,false);
  assert.equal(white.activeRooms().length,1);
  await black.load(); await black.cleanupOwn(); assert.equal(db.has(h.id),true);
  white.api.edit=edit; await white.acknowledge(h.id);
  assert.equal(white.activeRooms().length,0);
});
test("a delete timeout after commit is verified instead of leaving cancellation stuck", async()=>{
  const db=new Map(),api=fakeApi(db,"U1"),black=new GameClient(api,{id:"U1"});
  const h=await black.create(false);
  api.delete=async id=>{db.delete(id);throw new Error("network");};
  assert.equal(await black.leave(h.id),null);
  assert.equal(black.activeRooms().length,0); assert.equal(db.size,0);
});
