// Requires Playwright and a locally installed Edge, or PLAYWRIGHT_CHANNEL.
// Start dev-server.cjs first. All Firebase and GitHub traffic is mocked.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const url = process.env.GOMOKU_TEST_URL || "http://localhost:8766/games/online-gomoku/";
const db = new Map();
const users = { black: { id: "MDQ6VXNlcjY1OTEyNTc=", login: "black-player" },
  white: { id: "U_white", login: "white-player" }, watch: { id: "U_watch", login: "watcher" } };
let serial = 0;
const writes = { black: 0, white: 0, watch: 0 };
const pageErrors = [];
const plain = c => c && JSON.parse(JSON.stringify(c));
let holdMove = false, releaseMove;
let holdIdentity = false, releaseIdentity;
let failWatchIdentity = false;
let failWhiteMove = false;
let holdAcknowledgement = false, releaseAcknowledgement;

(async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "msedge", headless: true });
  try {
    async function open(name, viewport = { width: 1100, height: 900 }) {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(() => localStorage.setItem("site-language", "zh"));
      await context.route("https://www.gstatic.com/firebasejs/**", route => {
        const auth = `export const inMemoryPersistence={}; export const getAuth=()=>({});
          export const setPersistence=async()=>{}; export const signOut=async()=>{};
          export const signInWithPopup=async()=>({});
          export class GithubAuthProvider { addScope(){} static credentialFromResult(){return {accessToken:'mock-${name}'};} }`;
        return route.fulfill({ contentType: "text/javascript", body: route.request().url().endsWith("firebase-app.js") ? "export const initializeApp=()=>({});" : auth });
      });
      await context.route("https://api.github.com/graphql", async route => {
        const request = route.request();
        assert.equal(request.headers().authorization, `Bearer mock-${name}`);
        const { query, variables: v } = request.postDataJSON();
        if (name === "black" && holdIdentity && query.includes("viewer { id login }")) {
          holdIdentity = false;
          await new Promise(resolve => { releaseIdentity = resolve; });
        }
        if (name === "watch" && failWatchIdentity && query.includes("viewer { id login }")) {
          failWatchIdentity = false;
          return route.fulfill({status:503,contentType:"application/json",body:'{"message":"test failure"}'});
        }
        const user = users[name];
        const view = c => c && { ...plain(c), viewerCanUpdate: c.author.id === user.id,
          viewerCanDelete: c.author.id === user.id || name === "black" };
        const rateLimit = {cost:1,remaining:4999,limit:5000,resetAt:new Date(Date.now()+3600000).toISOString()};
        let data;
        if (query.includes("addDiscussionComment")) {
          writes[name]++;
          const id=`C_${++serial}`;
          const createdAt = new Date(Date.now() + serial).toISOString();
          const c={id,body:v.body,author:user,createdAt,updatedAt:createdAt,url:`https://github.com/test#${id}`};
          db.set(id,c); data={addDiscussionComment:{comment:view(c)}};
        } else if (query.includes("updateDiscussionComment")) {
          if (name === "white" && holdAcknowledgement && v.body.includes('"acknowledged":true')) {
            holdAcknowledgement = false;
            await new Promise(resolve => { releaseAcknowledgement = resolve; });
          }
          if (name === "white" && failWhiteMove) {
            failWhiteMove = false;
            return route.fulfill({headers:{"Access-Control-Allow-Origin":"*"},contentType:"application/json",
              body:JSON.stringify({errors:[{message:"permission denied for test"}]})});
          }
          if (name === "black" && holdMove) {
            holdMove = false;
            await new Promise(resolve => { releaseMove = resolve; });
          }
          writes[name]++; assert.equal(db.get(v.id).author.id,user.id);
          const c={...db.get(v.id),body:v.body,updatedAt:new Date(Date.now()+ ++serial).toISOString()};
          db.set(v.id,c); data={updateDiscussionComment:{comment:view(c)}};
        } else if (query.includes("deleteDiscussionComment")) {
          writes[name]++; db.delete(v.id); data={deleteDiscussionComment:{clientMutationId:null}};
        } else if (query.includes("nodes(ids:")) {
          data={nodes:v.ids.map(id=>view(db.get(id)) || null),rateLimit};
        } else if (query.includes("repository(owner:")) {
          const all=[...db.values()];
          const start=v.after ? all.findIndex(c=>c.id===v.after)+1 : 0;
          const nodes=all.slice(start).map(view);
          data={host:v.withHost ? view(db.get(v.hostId)) : undefined,repository:{discussion:{id:"D_kwDOAcIoFc4AqDm4",locked:false,
            comments:{nodes,pageInfo:{hasNextPage:false,endCursor:all.at(-1)?.id || null}}}},rateLimit};
        } else { data={viewer:user,rateLimit}; }
        await route.fulfill({headers:{"Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization,content-type"},contentType:"application/json",body:JSON.stringify({data})});
      });
      const page=await context.newPage();
      page.on("requestfailed", request=>console.error("Failed request:",request.url(),request.failure()?.errorText));
      page.on("console", message=>{if(message.type()==="error")console.error("Browser:",message.text());});
      page.on("pageerror", error=>pageErrors.push(error.message));
      page.on("dialog", dialog=>dialog.accept());
      await page.goto(url);
      assert.equal(await page.locator("body").evaluate(el=>el.innerText.includes("{% include")),false);
      assert.equal(await page.locator("body").evaluate(el=>el.innerText.trim().startsWith("---")),false);
      await page.locator("#consent").check();
      await page.locator("#login").click();
      try { await page.locator("#session-panel").waitFor({state:"visible",timeout:10000}); }
      catch(error) { console.error("Sign-in diagnostic:",await page.locator("#notice").textContent(),pageErrors); throw error; }
      return {page,context};
    }
    async function settled(page) {
      await page.waitForFunction(()=>!document.getElementById("refresh-lobby").disabled);
      const error=await page.locator("#notice").evaluate(el=>el.classList.contains("text-danger")?el.textContent:"");
      assert.equal(error,"");
    }
    async function sync(page) { await page.locator("#refresh-game").click(); await settled(page); }
    async function move(page,x,y) {
      const point=page.locator(`.intersection[data-index="${y*15+x}"]`);
      await page.waitForFunction(index=>document.querySelector(`[data-index="${index}"]`)?.getAttribute("aria-disabled")==="false",y*15+x);
      await point.click(); await settled(page);
    }
    const black=await open("black"); await settled(black.page);
    await black.page.locator("#create").click();
    assert.equal(await black.page.locator("#create-dialog").isVisible(),true);
    await black.page.locator("#forbidden").check();
    await black.page.locator("#cancel-create").click();
    assert.equal(writes.black,0);
    await black.page.locator("#create").click();
    assert.equal(await black.page.locator("#forbidden").isChecked(),false);
    await black.page.locator('#create-form button[type="submit"]').click(); await settled(black.page);
    assert.match(await black.page.locator("#game-status").textContent(),/等待玩家加入/);
    assert.equal(await black.page.locator("#game-phase").textContent(),"等待中");
    assert.equal(await black.page.locator("#admin").isVisible(),false);
    const hostId=[...db.keys()][0];
    function seed(id,status="waiting",opponentId=null,moves=[]) {
      const record={protocol:"gomoku-v1",gameId:`seed-${id}`,userId:`U_${id}`,role:"black",forbidden:false,
        hostCommentId:null,opponentCommentId:opponentId,status,resigned:false,moves};
      const time=new Date(Date.now()+ ++serial*1000).toISOString();
      db.set(id,{id,body:`<!-- gomoku-v1 -->\n\n\`\`\`json\n${JSON.stringify(record)}\n\`\`\``,
        author:{id:record.userId,login:`seed-${id}`},createdAt:time,updatedAt:time,url:`https://github.com/test#${id}`});
      return record;
    }
    for(let i=0;i<14;i++)seed(`seed-${i}`);
    seed("ended","cancelled");
    const paired=seed("playing","playing","seed-white",[[3,3]]);
    const whiteRecord={...paired,userId:"U_seed-white",role:"white",hostCommentId:"playing",opponentCommentId:null,moves:[]};
    db.set("seed-white",{...db.get("playing"),id:"seed-white",author:{id:whiteRecord.userId,login:"seed-white"},
      body:`<!-- gomoku-v1 -->\n\n\`\`\`json\n${JSON.stringify(whiteRecord)}\n\`\`\``});
    assert.equal(await black.page.locator("#back").isVisible(),false);
    // Legacy multi-room state reaches the lobby on reload; active rooms stay pinned.
    db.set("legacy-own",{...db.get(hostId),id:"legacy-own",body:db.get(hostId).body.replace(/"gameId":"[^"]+"/,'"gameId":"legacy-own"'),updatedAt:new Date(Date.now()+60000).toISOString()});
    await black.page.reload(); await black.page.locator("#lobby").waitFor({state:"visible"}); await settled(black.page);
    assert.equal(await black.page.locator(".room-card").nth(0).evaluate(el=>el.classList.contains("room-mine")),true);
    assert.equal(await black.page.locator(".room-card").nth(1).getAttribute("data-room-id"),hostId);
    assert.equal(await black.page.locator('.room-card[data-action="join"]').count(),0);
    assert.equal(await black.page.locator(".room-card button").count(),0);
    assert.equal(await black.page.locator("#admin").isVisible(),true);
    const backgrounds=await black.page.locator('.room-waiting:not(.room-mine),.room-playing').evaluateAll(els=>[...new Set(els.map(el=>getComputedStyle(el).backgroundColor))]);
    assert.equal(backgrounds.length,2);
    assert.equal(await black.page.locator('.room-cancelled,.room-finished').count(),0);
    const previousWrites=writes.black;
    await black.page.locator('.room-waiting:not(.room-mine)').first().click(); await settled(black.page);
    assert.equal(writes.black,previousWrites);
    assert.equal(await black.page.locator("#leave").isVisible(),false);
    await black.page.locator("#back").click(); await settled(black.page);
    await black.page.locator(`.room-card[data-room-id="${hostId}"]`).focus();
    await black.page.keyboard.press("Enter"); await settled(black.page);
    db.delete("legacy-own");
    const white=await open("white"); await settled(white.page);
    await white.page.locator("#more").click();
    assert.equal(await white.page.locator('.room-card[data-action="join"]').count()>0,true);
    assert.equal(await white.page.locator('.room-playing').getAttribute("data-action"),"watch");
    await white.page.locator(`.room-card[data-room-id="${hostId}"]`).click(); await settled(white.page);
    await sync(black.page); await sync(white.page);
    assert.equal(await black.page.locator("#game-phase").textContent(),"进行中");
    assert.equal(await black.page.locator("#back").isVisible(),false);
    assert.equal(await white.page.locator("#back").isVisible(),false);
    holdMove=true;
    const moving=move(black.page,7,7);
    await black.page.locator("#board-overlay").waitFor({state:"visible"});
    assert.equal(await black.page.locator("#board").getAttribute("aria-busy"),"true");
    assert.equal(await black.page.locator(".stone").count(),0);
    while(!releaseMove)await new Promise(resolve=>setTimeout(resolve,10));
    releaseMove(); await moving;
    assert.equal(await black.page.locator("#board-overlay").isVisible(),false);
    await sync(white.page);
    failWhiteMove=true;
    await white.page.locator('.intersection[data-index="113"]').click();
    await white.page.waitForFunction(()=>!document.getElementById("refresh-game").disabled);
    assert.match(await white.page.locator("#notice").textContent(),/拒绝此操作/);
    assert.equal(await white.page.locator("#board-overlay").isVisible(),false);
    assert.equal(await white.page.locator(".stone").count(),1);
    await sync(white.page); await move(white.page,8,7); await sync(black.page);
    holdIdentity=true;
    await black.page.reload();
    await black.page.locator("#loading-panel").waitFor({state:"visible"});
    assert.equal(await black.page.locator("#login-panel").isVisible(),false);
    assert.equal(await black.page.locator("#session-panel").isVisible(),false);
    while(!releaseIdentity)await new Promise(resolve=>setTimeout(resolve,10));
    releaseIdentity();
    await black.page.locator("#game").waitFor({state:"visible"}); await settled(black.page);
    assert.equal(await black.page.locator(".stone").count(),2);
    const watcher=await open("watch",{width:390,height:844}); await settled(watcher.page);
    await watcher.page.locator("#more").click();
    await watcher.page.locator(`.room-card[data-room-id="${hostId}"]`).click(); await settled(watcher.page);
    assert.equal(await watcher.page.locator('.intersection[aria-disabled="false"]').count(),0);
    assert.equal(await watcher.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    for (const [i,x] of [6,5,4,3].entries()) {
      await move(black.page,x,7);
      if(i===3){
        holdAcknowledgement=true;
        const syncing=sync(white.page);
        await white.page.locator("#result-dialog").waitFor({state:"visible"});
        assert.equal(await black.page.locator("#result-dialog").isVisible(),false);
        while(!releaseAcknowledgement)await new Promise(resolve=>setTimeout(resolve,10));
        releaseAcknowledgement(); await syncing;
        const whiteData=[...db.values()].find(c=>c.author.id===users.white.id && JSON.parse(c.body.match(/```json\s*([\s\S]*?)\s*```/)[1]).hostCommentId===hostId);
        assert.equal(JSON.parse(whiteData.body.match(/```json\s*([\s\S]*?)\s*```/)[1]).acknowledged,true);
        assert.equal(await white.page.locator("#result-dialog").isVisible(),true);
      }else await sync(white.page);
      if(i<3){await move(white.page,i*2,0);await sync(black.page);}
    }
    assert.match(await black.page.locator("#game-status").textContent(),/黑方 获胜/);
    assert.equal(await black.page.locator("#game-phase").textContent(),"已结束");
    await sync(watcher.page); assert.equal(await watcher.page.locator(".stone").count(),9);
    assert.equal(writes.watch,0);
    await black.page.locator('[data-site-language="en"]').click();
    assert.match(await black.page.locator("#game-status").textContent(),/Black wins/);
    assert.equal(await black.page.locator(".stone").count(),9);
    assert.equal(await black.page.locator("#back").isVisible(),true);
    const firstWhiteId=[...db.values()].find(c=>c.author.id===users.white.id).id;
    await black.page.locator("#back").click(); await settled(black.page);
    assert.equal(db.has(hostId),false); assert.equal(db.has(firstWhiteId),true);
    assert.equal(await black.page.locator(`.room-card[data-room-id="${hostId}"]`).count(),0);
    await white.page.locator("#result-dialog button").click();
    await white.page.locator("#back").click(); await settled(white.page);
    assert.equal(db.has(firstWhiteId),false);
    failWatchIdentity=true;
    await watcher.page.reload();
    await watcher.page.locator("#retry-load").waitFor({state:"visible"});
    assert.equal(await watcher.page.locator("#login-panel").isVisible(),false);
    await watcher.page.locator("#retry-load").click(); await settled(watcher.page);
    assert.equal(await watcher.page.locator("#session-panel").isVisible(),true);
    await watcher.page.locator("#more").click();
    assert.equal(await watcher.page.locator(`.room-card[data-room-id="${hostId}"]`).count(),0);
    await watcher.page.locator('.room-playing').click(); await settled(watcher.page);
    assert.equal(await watcher.page.locator("#back").isVisible(),true);
    // Resigning stays on the board and only the receiver gets a result dialog.
    await black.page.locator("#create").click(); await black.page.locator('#create-form button[type="submit"]').click(); await settled(black.page);
    const nextHost=[...db.values()].find(c=>c.author.id===users.black.id).id;
    await white.page.locator("#refresh-lobby").click(); await settled(white.page);
    await white.page.locator("#more").click();
    await white.page.locator(`.room-card[data-room-id="${nextHost}"]`).click(); await settled(white.page);
    await sync(black.page); await sync(white.page);
    await black.page.locator("#leave").click(); await settled(black.page);
    assert.equal(await black.page.locator("#game").isVisible(),true);
    assert.equal(await black.page.locator("#game-phase").textContent(),"Ended");
    assert.equal(await black.page.locator("#result-dialog").isVisible(),false);
    failWhiteMove=true;
    await white.page.locator("#refresh-game").click();
    await white.page.waitForFunction(()=>!document.getElementById("refresh-game").disabled);
    assert.equal(await white.page.locator("#result-dialog").isVisible(),true);
    assert.match(await white.page.locator("#result-message").textContent(),/认负/);
    assert.match(await white.page.locator("#notice").textContent(),/拒绝此操作/);
    assert.equal(await white.page.locator("#back").isVisible(),false);
    await white.page.locator("#result-dialog button").click();
    await sync(white.page);
    assert.equal(await white.page.locator("#result-dialog").isVisible(),false);
    await white.page.locator("#back").click(); await settled(white.page);
    await black.page.locator("#back").click(); await settled(black.page);
    assert.equal(db.has(nextHost),false);
    // Waiting cancellation deletes its root rather than leaving a cancelled game.
    await black.page.locator("#create").click(); await black.page.locator('#create-form button[type="submit"]').click(); await settled(black.page);
    const cancelled=[...db.values()].find(c=>c.author.id===users.black.id).id;
    await black.page.locator("#leave").click(); await settled(black.page); assert.equal(db.has(cancelled),false);
    if (process.env.GOMOKU_SCREENSHOT) await watcher.page.screenshot({path:process.env.GOMOKU_SCREENSHOT,fullPage:true});
    assert.deepEqual(pageErrors,[]);
    console.log("PASS: terminal acknowledgements, nonblocking receiver-only result dialogs, player navigation locks, resignation stays on board, ended games hidden, own-data cleanup in either deletion order, cancellation deletes data; previous lobby/loading/spinner/multiplayer checks also passed. Mocked services only.");
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
