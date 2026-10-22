// E2E: til, SIS trip/RESET, ESD tugmasi, oq mavzu, 3D majmua, bitta HTML fayl, uzoq bloklar. Ishga tushirish: node tests/e2e/features.js
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const root=path.join(__dirname,'..','..'),url='file://'+path.join(root,'index.html');
const fails=[];const ok=(c,m)=>{if(!c){fails.push(m);console.log('  ✗',m)}else console.log('  ✓',m)};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.addInitScript(()=>{window.__LT=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__LT.push(e.duration)}).observe({type:'longtask',buffered:true})}catch(e){}});
 await p.goto(url,{timeout:120000});await p.waitForFunction(()=>window.AmineApp&&window.AmineAI&&window.AmineAI.ready,null,{timeout:120000});
 ok(await p.evaluate(()=>Math.max(0,...__LT))<1500,'ishga tushishda 1,5 s dan uzun blok yo‘q');
 // til
 await p.selectOption('#lang','ru');await p.waitForTimeout(600);
 ok(await p.evaluate(()=>document.querySelector('.nav[data-view="overview"]').textContent.includes('Общий вид')),'RU: menyu tarjima qilindi');
 await p.selectOption('#lang','en');await p.waitForTimeout(600);
 ok(await p.evaluate(()=>document.querySelector('.nav[data-view="sis"]').textContent.includes('SIS / ESD interlocks')),'EN: menyu tarjima qilindi');
 await p.selectOption('#lang','uz');await p.waitForTimeout(600);
 ok(await p.evaluate(()=>document.querySelector('.nav[data-view="overview"]').textContent.includes('Umumiy ko‘rinish')),'UZ ga qaytish asl matnni tiklaydi');
 // SIS
 await p.click('.nav[data-view="sis"]');await p.selectOption('#aSpeed','60');await p.selectOption('#aScenario','stuckOpen');
 await p.waitForFunction(()=>window.AmineApp.model.sis.tripped().includes('SIF-01'),null,{timeout:120000});await p.waitForTimeout(800);
 ok(await p.evaluate(()=>/SIF-01/.test(document.getElementById('sHead').textContent)),'SIS: SIF-01 trip bannerda');
 ok(await p.evaluate(()=>window.AmineApp.model.sis.blowby===0),'SIS: blow-by bo‘lmadi');
 await p.selectOption('#aScenario','normal');await p.click('#amReset');await p.waitForTimeout(300);
 await p.click('#sEsd');await p.waitForTimeout(600);ok(await p.evaluate(()=>window.AmineApp.model.sis.esdActive()),'ESD-1 tugmasi ishlaydi');
 await p.click('#sReset');await p.waitForTimeout(400);ok(await p.evaluate(()=>!window.AmineApp.model.sis.esdActive()),'SIS RESET tiklaydi');
 // oq mavzu
 await p.click('.nav[data-view="mimic"]');await p.evaluate(()=>{if(document.documentElement.dataset.theme==='light')document.getElementById('theme').click()});await p.click('#theme');await p.waitForTimeout(800);
 ok(await p.evaluate(()=>document.documentElement.dataset.theme==='light'&&getComputedStyle(document.querySelector('.a-mimic-canvas')).backgroundColor!=='rgb(11, 25, 38)'),'oq mavzuda mnemosxema foni yorug‘');
 await p.click('#theme');
 // 3D majmua
 await p.click('.nav[data-view="3d"]');await p.waitForTimeout(6000);await p.click('[data-camera="complex"]');await p.waitForTimeout(3000);
 ok(await p.evaluate(()=>!!window.__PS?.inst?.ready&&window.__PS.inst.viewId==='complex'),'3D: majmua kamerasi');
 // Mashq va avariyalar: ssenariy (yong'in → ESD-1), ob-havo, test, amaliy mashq, tarjima
 await p.evaluate(()=>window.AmineTrain.start('fire'));await p.waitForFunction(()=>window.AmineApp.model.sis.esdActive(),null,{timeout:120000});
 ok(await p.evaluate(()=>window.__PS.inst.fx.fire===1&&window.AmineApp.state().sis.esd),'Avariya: yong‘in → ESD-1 avtomatik');
 await p.evaluate(()=>{window.AmineTrain.stop();window.__PS.inst.setWeather('rain')});ok(await p.evaluate(()=>window.__PS.inst.fx.rain.visible),'Ob-havo: yomg‘ir');await p.evaluate(()=>window.__PS.inst.setWeather('clear'));
 await p.evaluate(()=>window.AmineApp.navigate('train'));await p.click('#trQuizGo');for(let i=0;i<8;i++){await p.click('[data-qa="0"]');await p.click('#trQuizNext')}
 ok(await p.evaluate(()=>/\d+ \/ 8/.test(document.getElementById('trQuiz').textContent)),'Bilim testi yakunlanadi');
 await p.click('#trExGo');ok(await p.evaluate(()=>document.getElementById('aScenario').style.visibility==='hidden'&&window.AmineApp.model.fault!=='normal'),'Amaliy mashq: yashirin nosozlik');
 await p.click('[data-ex="0"]');await p.click('#trExEnd');ok(await p.evaluate(()=>window.AmineApp.model.fault==='normal'&&document.getElementById('aScenario').style.visibility===''),'Amaliy mashq: yakunlash');
 await p.selectOption('#lang','en');ok(await p.evaluate(()=>document.querySelector('[data-ap="train"]').textContent.includes('Emergency scenarios')),'EN: Mashq bo‘limi tarjima qilindi');await p.selectOption('#lang','uz');
 ok(errs.length===0,'konsolda xato yo‘q'+(errs.length?': '+errs[0]:''));await ctx.close();
 // bitta HTML fayl
 const dist=path.join(root,'dist','DA-1701-Absorber-AI.html');
 if(fs.existsSync(dist)){const c2=await b.newContext();const q=await c2.newPage();const e2=[];q.on('pageerror',e=>e2.push(e.message));await q.goto('file://'+dist,{timeout:120000});
  await q.waitForFunction(()=>window.AmineApp&&window.I18N,null,{timeout:120000});ok(e2.length===0,'bitta HTML fayl xatosiz ochiladi');await c2.close()}
 await b.close();console.log(fails.length?`\n${fails.length} ta xato`:'\nHammasi o‘tdi');process.exit(fails.length?1:0)})();
