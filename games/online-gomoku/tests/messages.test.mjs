import test from "node:test";
import assert from "node:assert/strict";
import { MessageBoard, messageText } from "../../../shared/discussion-comments.js";
import { GitHub } from "../github.js";

const user = { id: "U1", login: "one" };
const target = { owner: "ZTGeng", name: "ZTGeng.github.io", number: 6, pageSize: 2, maxLength: 1000 };
const item = (id, body = id) => ({ id, body, createdAt: `2026-10-16T00:00:${id.slice(-1).padStart(2,"0")}Z`,
  author: user, viewerCanDelete: true, discussion: {id:"D_messages"} });
const page = (nodes, cursor = null, more = false) => ({ id:"D_messages",locked:false,url:"https://github.com/test/discussions/6",
  comments:{nodes,pageInfo:{startCursor:cursor,hasPreviousPage:more}} });
const store = () => { const map=new Map(); return {getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key)}; };

test("message pagination is newest first, deduplicates overlapping pages and resets on refresh", async () => {
  let calls=0;
  const board=new MessageBoard({messagePage:async (_target,cursor)=>{
    assert.equal(cursor,calls===1?"cursor":null);
    return ++calls===1?page([item("M2"),item("M3")],"cursor",true):calls===2?page([item("M1"),item("M2")]):page([item("M4")]);
  }},user,target);
  await board.load(); await board.load(true);
  assert.deepEqual(board.items.map(i=>i.id),["M3","M2","M1"]);
  await board.load(); assert.deepEqual(board.items.map(i=>i.id),["M4"]);
});

test("ambiguous sends survive reload and are checked by author plus UUID without another write", async () => {
  const storage=store(); let saved, writes=0, checks=0;
  const api={messagePage:async (_t,cursor)=> {
    if (!saved) return page([]);
    if (++checks===1) return page([{...saved,author:{id:"other"}}],"older",true);
    assert.equal(cursor,"older"); return page([saved]);
  },addMessage:async(id,body)=>{assert.equal(id,"D_messages"); writes++;saved=item("M1",body);throw new Error("network");}};
  const board=new MessageBoard(api,user,target,storage); await board.load();
  await assert.rejects(()=>board.send("hello"),/network/);
  await assert.rejects(()=>board.send("again"),/messagePending/);
  assert.equal(writes,1);
  const restored=new MessageBoard(api,user,target,storage);
  assert.equal(messageText(restored.pending.body),"hello");
  assert.equal(await restored.check(),null); assert.equal(restored.pending.checked,true);
  assert.equal((await restored.check()).id,"M1"); assert.equal(restored.pending,null);
  assert.equal(writes,1);
});

test("abandon requires a check; missing result never triggers automatic resend", async () => {
  const board=new MessageBoard({messagePage:async()=>page([]),addMessage:async()=>{throw new Error("timeout");}},user,target);
  await board.load(); await assert.rejects(()=>board.send("hi"));
  assert.throws(()=>board.abandon(),/messageUnchecked/);
  await board.check(); assert.ok(board.pending); board.abandon(); assert.equal(board.pending,null);
});

test("delete checks discussion and actual permissions, and verifies timeout by node lookup", async () => {
  let entry=item("M1"),deletes=0;
  const api={messagePage:async()=>page([entry]),messageComment:async()=>entry,
    delete:async()=>{deletes++;entry=null;throw new Error("timeout");}};
  const board=new MessageBoard(api,user,target); await board.load();
  entry={...entry,discussion:{id:"game"}};
  await assert.rejects(()=>board.remove("M1"),/permission/); assert.equal(deletes,0);
  entry={...entry,discussion:{id:"D_messages"},viewerCanDelete:false};
  await assert.rejects(()=>board.remove("M1"),/permission/); assert.equal(deletes,0);
  entry={...entry,viewerCanDelete:true}; await board.remove("M1");
  assert.equal(deletes,1); assert.equal(board.items.length,0);
});

test("permission errors on delete verification are not interpreted as a missing comment", async () => {
  let reads=0;
  const board=new MessageBoard({messagePage:async()=>page([item("M1")]),messageComment:async()=>{
    if(++reads===1)return item("M1"); throw new Error("permission");
  },delete:async()=>{throw new Error("timeout");}},user,target);
  await board.load(); await assert.rejects(()=>board.remove("M1"),/permission/); assert.equal(board.items.length,1);
});

test("logout and cancelled reads cannot populate the new session", async () => {
  let resolve;
  const board=new MessageBoard({messagePage:()=>new Promise(r=>{resolve=r;})},user,target);
  const request=board.load(); board.dispose(); resolve(page([item("M1")]));
  await assert.rejects(()=>request,/Session ended/); assert.equal(board.items.length,0);
  const controller=new AbortController();
  const next=new MessageBoard({messagePage:async()=>{controller.abort();return page([item("M2")]);}},user,target);
  await assert.rejects(()=>next.load(false,controller.signal),error=>error.name==="AbortError");
  assert.equal(next.items.length,0);
});

test("empty, oversized and locked posts do not write; only generated suffix markers are removed", async () => {
  let writes=0;
  const board=new MessageBoard({messagePage:async()=>page([]),addMessage:async()=>{writes++;}},user,target);
  await board.load(); await assert.rejects(()=>board.send("  "),/messageLength/);
  await assert.rejects(()=>board.send("x".repeat(1001)),/messageLength/);
  board.discussion.locked=true; await assert.rejects(()=>board.send("hello"),/messageLocked/);
  assert.equal(writes,0); assert.equal(messageText('<img src=x onerror=alert(1)>'),'<img src=x onerror=alert(1)>');
  assert.equal(messageText('keep <!-- gomoku-message:not-a-uuid -->'),'keep <!-- gomoku-message:not-a-uuid -->');
});

test("transport scopes message pagination to #6 and refuses to create in the game discussion", async () => {
  const requests=[];
  const api=new GitHub("fake",()=>{},async (_url,options)=>{
    const input=JSON.parse(options.body); requests.push(input);
    return {ok:true,status:200,headers:new Headers(),json:async()=>({data:{repository:{discussion:page([])}}})};
  });
  await api.messagePage(target,"older",20);
  assert.equal(requests[0].variables.number,6); assert.equal(requests[0].variables.before,"older");
  assert.match(requests[0].query,/comments\(last:\$size,before:\$before\)/);
  await assert.rejects(()=>api.addMessage("D_kwDOAcIoFc4AqDm4","do not write"),/messageDiscussion/);
  assert.equal(requests.length,1);
});
