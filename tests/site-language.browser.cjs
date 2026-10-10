const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const assert = require('node:assert/strict');
// Optional browser integration checks. Requires Playwright and Edge on Windows,
// or Playwright Chromium elsewhere. This lightweight include fixture is NOT a
// replacement for a Jekyll build; catalog checks use representative fixture data.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const read = f => fs.readFileSync(path.join(root,f),'utf8');
function catalogFixture() {
 const catalogs=[{id:'boardgames',title:{en:'Board Games',zh:'棋类'},items:[{
  id:'gomoku',title:{en:'Gomoku',zh:'五子棋'},intro:{en:'Two-player game.',zh:'双人游戏。'}
 }]}];
 let html=read('_layouts/subindex.html');
 html=html.replace(/const catalogs = \[[\s\S]*?const itemIdPrefix/,`const catalogs = ${JSON.stringify(catalogs)};
 const translations = {web_title:{en:'Games',zh:'游戏'},title:{en:'Barebones Games',zh:'朴素游戏'},greeting:{en:'Welcome',zh:'欢迎'}};
 const itemIdPrefix`);
 const start=html.indexOf('<div id="portfolio">');const end=html.indexOf('{% include footer.html %}',start);
 html=html.slice(0,start)+`<div id="portfolio"><h4 id="catalog-title-boardgames">Board Games</h4>
 <div id="item-gomoku"><h5 class="card-title">Gomoku</h5><p class="card-text">Two-player game.</p><img class="card-img-top" alt="Gomoku"></div></div>`+html.slice(end);
 return render(html);
}
function header() {
 let html=read('_includes/header.html');
 const start=html.indexOf('{% for item in site.data.navigation %}');
 const end=html.indexOf('{% endfor %}',start)+'{% endfor %}'.length;
 html=html.slice(0,start)+['games','tools','math','blog'].map((id,i)=>`<li><a href="/${id}/" data-ui-en="${['Games','Tools','Math','Blog'][i]}" data-ui-zh="${['游戏','应用','数学','文章'][i]}">${id}</a></li>`).join('')+html.slice(end);
 html=html.replace(/<nav aria-label="Breadcrumb"[\s\S]*?<\/nav>/,'');
 return html.replace(/data-bilingual="[^"]*"/,'data-bilingual="false"').replace(/{%[\s\S]*?%}/g,'').replace(/{{[\s\S]*?}}/g,'');
}
function render(html) {
 return html.replace(/^---\r?\n[\s\S]*?---\r?\n/,'')
  .replace(/{% include header.html[^%]*%}/g,header())
  .replace(/{% include footer.html[^%]*%}/g,read('_includes/footer.html'))
  .replace(/{% include comments.html[^%]*%}/g,read('_includes/comments.html').replace(/{{ '\/shared\/([^']+)' \| relative_url }}/g,'/shared/$1').replace(/{{[\s\S]*?}}/g,''))
  .replace(/{%[\s\S]*?%}/g,'');
}
const server=http.createServer((req,res)=>{
 if(req.url==='/qa/catalog.html') {res.setHeader('Content-Type','text/html; charset=utf-8');res.end(catalogFixture());return;}
 const target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!target.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
 try {
  let file=target;
  if(fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
  let content=fs.readFileSync(file);
  const ext=path.extname(file);
  if(ext==='.html') content=render(content.toString());
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'}[ext]||'application/octet-stream'));
  res.end(content);
 } catch(e) { res.writeHead(404).end(); }
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined)});
 const context=await browser.newContext({locale:'zh-CN'});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('https://giscus.app/**',route=>route.abort());
 const visit=async url=>{await page.goto(origin+url,{waitUntil:'load',timeout:45000});await page.waitForTimeout(150);};
 const language=async lang=>page.evaluate(lang=>SiteUI.setLanguage(lang),lang);
 try {
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
  const games=[...walk('games'),...walk('math')].filter(f=>f.endsWith('.html')&&read(f).includes('SiteUI.translate('));
  for(const file of games) {
   await visit('/'+file.replaceAll('\\','/'));
   await language('zh'); const zh=await page.title();
   await language('en'); const en=await page.title();
   assert.notEqual(zh,en,file+' title switches');
   const duplicate=await page.evaluate(()=>{
    const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);
   });
   // The historical two-cat game intentionally shares the CSS ID "cat".
   assert.deepEqual(duplicate.filter(id=>id!=='cat'),[],file+' unique IDs: '+duplicate.join(', '));
  }
  console.log(`PASS: ${games.length} bilingual game/math pages, titles and IDs`);
  await visit('/qa/catalog.html');await language('en');
  assert.equal(await page.locator('.card-title').textContent(),'Gomoku');
  await language('zh');assert.equal(await page.locator('.card-title').textContent(),'五子棋');
  assert.equal(await page.locator('.card-img-top').getAttribute('alt'),'五子棋');
  await language('en');assert.equal(await page.locator('#greeting').textContent(),'Welcome');
  console.log('PASS: catalog layout subscriptions (fixture data; not a Jekyll build)');
  await visit('/games/catchcat/catchcat.html');
  await page.locator('.grid:not(.occupied):not(.opened)').first().click();
  const cat=await page.evaluate(()=>({step,catPos,opened:document.querySelectorAll('.opened').length}));
  await language('en');
  assert.deepEqual(await page.evaluate(()=>({step,catPos,opened:document.querySelectorAll('.opened').length})),cat);
  assert.match(await page.locator('.result').textContent(),/step/i);
  await language('zh'); assert.match(await page.locator('.result').textContent(),/步/);
  console.log('PASS: live cat game progress and result survive switching');
  await visit('/games/memory.html');
  await page.evaluate(()=>document.getElementById('count').textContent='7');
  const board=await page.locator('#board').innerHTML();
  await language('en');await language('zh');
  assert.equal(await page.locator('#count').textContent(),'7');assert.equal(await page.locator('#board').innerHTML(),board);
  await visit('/math/coins/coins.html');await page.locator('#start').click();
  await language('zh');const round=await page.locator('#round').textContent();await language('en');
  assert.match(round,/第/);assert.match(await page.locator('#round-en').textContent(),/ROUND/);
  const validAnswer=await page.evaluate(()=>Object.keys(resMap).find(key=>resMap[key][0]>0));
  for(const choice of validAnswer) await page.locator({l:'#left-heavier',r:'#right-heavier',s:'#same-heavy'}[choice]).click();
  assert.equal(await page.locator('.result-number').count(),2);
  assert.equal(await page.locator('.result-number').nth(0).textContent(),await page.locator('.result-number').nth(1).textContent());
  await language('zh');assert.ok((await page.locator('#result-zh').textContent()).length);
  await language('en');assert.ok((await page.locator('#result-en').textContent()).length);
  await visit('/math/coins/coins2.html');await page.locator('#heavy_light').click();
  await page.evaluate(()=>document.getElementById('round-num').textContent='1');
  await language('zh');assert.equal(await page.locator('#heavy_light_text').textContent(),'更轻');
  await language('en');assert.equal(await page.locator('#heavy_light_text').textContent(),'Lighter');
  assert.equal(await page.locator('#round-num').textContent(),'1');
  console.log('PASS: memory counter and both coin-game states survive switching');
  await visit('/games/gomoku.html');await page.evaluate(()=>end());
  await language('en');assert.equal(await page.locator('#bwin').textContent(),'WIN');
  await language('zh');assert.equal(await page.locator('#bwin').textContent(),'胜');
  await page.evaluate(()=>reset());await language('en');assert.equal(await page.locator('#bwin').textContent(),'');
  for(const file of ['minesweeper','ghostsweeper','liesweeper']) {
   await visit(`/games/minesweeper/${file}.html`);
   await page.evaluate(()=>setResultMessage('won'));await language('zh');
   assert.equal(await page.locator('#result').textContent(),'你赢了！');
   await language('en');assert.equal(await page.locator('#result').textContent(),'You Win!');
   await page.locator('#reset').click();await language('zh');assert.equal(await page.locator('#result').textContent(),'');
  }
  await visit('/games/rps.html');await page.evaluate(()=>setResultMessage('你赢了！','YOU WIN!'));
  await language('en');assert.equal(await page.locator('#result-text').textContent(),'YOU WIN!');
  await page.evaluate(()=>reset());await language('zh');assert.equal(await page.locator('#result-text').textContent(),'');
  console.log('PASS: Gomoku, minesweeper and RPS result translation and reset');
  await visit('/index.html');await language('en');await page.locator('[data-site-language="zh"]').click();
  await page.locator('[data-site-language="en"]').click();
  const other=await context.newPage();await other.goto(origin+'/games/chess.html');
  assert.equal(await other.locator('#gameName').textContent(),'Chess');
  await page.locator('[data-site-language="zh"]').click();
  await other.waitForFunction(()=>SiteUI.getLanguage()==='zh');assert.equal(await other.locator('#gameName').textContent(),'国际象棋');
  await page.locator('[data-site-language="auto"]').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('site-language')),null);
  await other.close(); console.log('PASS: homepage controls, navigation persistence and real cross-tab synchronization');
  await visit('/tools/venn/venn.html');await page.locator('textarea').first().fill('保留用户文字');
  await language('en');await page.waitForTimeout(50);assert.equal(await page.locator('textarea').first().inputValue(),'保留用户文字');
  assert.equal(await page.title(),'Venn Diagram Maker');
  await language('zh');await page.waitForTimeout(50);assert.equal(await page.locator('textarea').first().inputValue(),'保留用户文字');
  await visit('/tools/digitalnumber/demo.html');await page.locator('#textBox').fill('123');
  await language('en');await language('zh');assert.equal(await page.locator('#textBox').inputValue(),'123');
  await visit('/tools/zhs2t.html');await page.waitForTimeout(100);
  const fixed=await page.locator('h1').innerHTML();await language('en');
  assert.equal(await page.locator('h1').innerHTML(),fixed);assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
  assert.equal(await page.locator('#site-header').getAttribute('lang'),'en');
  await visit('/blog/editor.html');const editor=await page.locator('#app').innerHTML();await language('zh');await language('en');
  assert.equal(await page.locator('#app').innerHTML(),editor);assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
  console.log('PASS: Vue and digital-number input preserved; Chinese-only content unchanged');
  await visit('/blog/editor-v1.html');await page.locator('#titleInput').fill('保留标题');
  await page.locator('textarea').fill('保留正文');await language('zh');await language('en');
  assert.equal(await page.locator('#titleInput').inputValue(),'保留标题');
  assert.equal(await page.locator('textarea').inputValue(),'保留正文');
  const filename=JSON.parse(read('blog/list.json')).list[0].filename;
  await visit('/blog/index-v1.html#post'+filename);
  await page.waitForFunction(()=>document.querySelector('#post').textContent.length>100);
  const post=await page.locator('#post').innerHTML();await language('zh');
  assert.equal(await page.locator('#list_title').textContent(),'文章列表');
  await language('en');assert.equal(await page.locator('#post').innerHTML(),post);
  console.log('PASS: legacy editor input and blog article retained');
  await visit('/games/chess.html');await page.setViewportSize({width:375,height:812});
  await language('en');
  await page.locator('.navbar-toggler').click();
  await page.locator('[data-site-language="zh"]').click();
  assert.equal(await page.locator('#gameName').textContent(),'国际象棋');
  assert.equal(await page.locator('#comments-heading').textContent(),'评论');
  await page.waitForTimeout(400);
  await page.setViewportSize({width:1280,height:720});
  const noJS=await browser.newContext({javaScriptEnabled:false});const noJSPage=await noJS.newPage();
  await noJSPage.goto(origin+'/games/chess.html');
  assert.equal(await noJSPage.locator('[data-site-language="zh"]').isVisible(),false);
  assert.equal(await noJSPage.locator('a[href="/games/"]').first().isVisible(),true);
  await noJS.close();console.log('PASS: mobile language controls and navigation without JavaScript');
  assert.deepEqual(errors,[],'browser script errors');
  // Syntax-check all edited JS and inline scripts not generated by Liquid.
  const files=require('node:child_process').execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n');
  for(const file of files) {
   if(file.endsWith('.js')) new vm.Script(read(file),{filename:file});
   if(file.endsWith('.html')) for(const m of read(file).matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if(!m[1].includes('{%')) new vm.Script(m[1],{filename:file});
   }
  }
  console.log('PASS: changed JavaScript syntax');
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
