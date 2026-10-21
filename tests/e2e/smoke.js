// E2E smoke: brauzerda (Chromium) haqiqiy ishlashini tekshiradi. Ishga tushirish: npm run e2e
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..');
const MIME={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/index.html'));
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const fails=[];const ok=(c,m)=>{if(!c){fails.push(m);console.log('  ✗',m)}else console.log('  ✓',m)};
(async()=>{await new Promise(r=>srv.listen(0,r));const url='http://localhost:'+srv.address().port+'/index.html';
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 for(const [nm,vp,mob] of [['desktop',{width:1440,height:900},false],['mobil',{width:390,height:800},true]]){
  console.log(nm);const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.goto(url,{timeout:120000});await p.waitForFunction(()=>window.AmineApp&&document.body.classList.contains('amine-mode'),null,{timeout:90000});
  const views=await p.evaluate(()=>[...document.querySelectorAll('.nav[data-view]')].map(x=>x.dataset.view));
  ok(views.length>=10,'bo‘limlar: '+views.join(','));
  for(const v of views){await p.evaluate(v=>document.querySelector(`.nav[data-view="${v}"]`).click(),v);await p.waitForTimeout(400);
   ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),v+': gorizontal scroll yo‘q')}
  ok(errs.length===0,'konsolda xato yo‘q'+(errs.length?': '+errs[0]:''));await ctx.close()}
 await b.close();srv.close();console.log(fails.length?`\n${fails.length} ta xato`:'\nHammasi o‘tdi');process.exit(fails.length?1:0)})();
