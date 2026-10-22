(()=>{'use strict';
// ===== Mashq va avariyalar: SIS bilan bog'langan avariya ssenariylari (3D effektlar), ekskursiya, demo, bilim testi, amaliy diagnostika mashqi, ovozli signallar =====
// Ssenariylar mavjud model nosozliklari (foam, amine, stuckOpen, outBlocked) va SIS funksiyalari (SIF-01, SIF-05, ESD-1) ustiga quriladi.
// Yong'in ssenariysi modelda alohida fizika emas: olov detektorlari va ESD-1 o'quv ketma-ketligi sifatida ko'rsatiladi (FARAZ).
if(!window.AmineApp)return;
const App=window.AmineApp,$=id=>document.getElementById(id),M=()=>App.model,S3=()=>window.__PS?.inst,cap=h=>window.AmineFx?.caption(h),tx=s=>window.__PS?.tx?window.__PS.tx(s):s;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f0=v=>v==null||!isFinite(v)?'NaN':v.toFixed(0),f1=v=>v==null||!isFinite(v)?'NaN':v.toFixed(1);
const fx=o=>{const s=S3();if(s?.fx)Object.assign(s.fx,o)};
const D=window.AMINE_TRAIN_DICT||{},T=(s,...a)=>{const lg=window.I18N?.lang||'uz';let r=lg!=='uz'&&D[s]?D[s][lg==='ru'?0:1]:s;a.forEach((v,i)=>{r=r.split('{'+i+'}').join(v)});return r};
const store={get(k,d){try{return JSON.parse(localStorage.getItem('amTrain.'+k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem('amTrain.'+k,JSON.stringify(v))}catch(e){}}};
// ---------------------------------------------------------------- ovoz (WebAudio, faylsiz)
const Snd={on:false,ctx:null,seen:new Set(),tripPrev:false,esdPrev:false,last:0,silenced:false,
 init(){if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(C)try{this.ctx=new C()}catch(e){}}if(this.ctx?.state==='suspended')this.ctx.resume()},
 tone(f,d,type='square',v=.05,t0=0){const c=this.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.setValueAtTime(v,t+d-.03);g.gain.linearRampToValueAtTime(0,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02)},
 alarm(){this.tone(880,.18,'square',.045,0);this.tone(660,.18,'square',.045,.24)},
 siren(){const c=this.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain(),t=c.currentTime;o.type='sawtooth';o.frequency.value=720;l.frequency.value=1.4;lg.gain.value=260;l.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(.035,t);g.gain.setValueAtTime(.035,t+1.5);g.gain.linearRampToValueAtTime(0,t+1.7);o.connect(g);g.connect(c.destination);o.start(t);l.start(t);o.stop(t+1.75);l.stop(t+1.75)},
 horn(){this.tone(220,1,'sawtooth',.055);this.tone(277,1,'sawtooth',.04)},
 tick(){if(!this.on)return;const s=App.state(),now=performance.now(),ids=(s.alarms||[]).filter(a=>!a.ack).map(a=>a.id),fresh=ids.some(i=>!this.seen.has(i));this.seen=new Set(ids);
  const z=s.sis||{},trip=(z.trip||[]).length>0;if(z.esd&&!this.esdPrev)this.horn();this.esdPrev=!!z.esd;
  if(trip&&!this.silenced&&(!this.tripPrev||now-this.last>4500)){this.siren();this.last=now}else if(fresh)this.alarm();if(!trip)this.silenced=false;this.tripPrev=trip},
 set(on){this.on=on;if(on){this.init();this.seen=new Set((App.state().alarms||[]).filter(a=>!a.ack).map(a=>a.id))}for(const b of document.querySelectorAll('.trSound'))b.textContent=T(on?'🔊 Ovoz yoniq':'🔇 Ovoz o‘chiq');store.set('sound',on)}};
setInterval(()=>{try{Snd.tick()}catch(e){}},500);
// ---------------------------------------------------------------- tezlik va kesim yordamchilari
const fresh=()=>{$('amReset')?.click();M().start()};// toza boshlang'ich holat (model, SIS latch, tarix)
let speedPrev=null;const setSpeed=v=>{const el=$('aSpeed');if(!el)return;if(speedPrev==null)speedPrev=el.value;el.value=String(v);el.dispatchEvent(new Event('change'))};
const restoreSpeed=()=>{const el=$('aSpeed');if(el&&speedPrev!=null){el.value=speedPrev;el.dispatchEvent(new Event('change'))}speedPrev=null};
const setCut=on=>{const s=S3();if(!s)return;s.setCut(on);$('aCut')?.classList.toggle('on',on);const b=$('aSceneBadge');if(b)b.textContent=on?'JARAYON KESIMI · gaz ↑ / amin ↓':'TASHQI KO‘RINISH'};
const go3d=()=>{if(App.view()!=='3d')App.navigate('3d')};
const cam=(c,far)=>{const s=S3();if(!s)return;if(typeof c==='string')s.setCamera(c);else s.flyTo(c[0],c[1],far)};
// ---------------------------------------------------------------- avariya ssenariylari
const SC={
 foam:{title:'Absorberda ko‘piklanish',sis:'SIS trip yo‘q — operator harakati talab qilinadi',desc:'Uglevodorod kondensati yoki zarrachalar aminni ko‘piklantiradi: PDI17010 oshadi, amin tomchilari gaz bilan chiqib ketadi, CO₂ yutilishi yomonlashadi.',
  start(c){c.m.setFault('foam');fx({foam:1});setCut(false);cam([[16,13,15],[5,11.5,0]]);c.log('DA-1701 da ko‘pik hosil bo‘ldi — tarelkalarda suyuqlik ko‘tarilmoqda (oyna orqali ko‘rinadi).','warn')},
  tick(c){const s=c.s;if(s.dp>=1.6)c.once('dp','PDI17010 = {0} — bosim farqi nominaldan (0,94) ancha yuqori: ko‘piklanish belgisi.','warn',[s.dp.toFixed(2)]);if(s.ai>=1000)c.once('ai','AI17001 = {0} ppmv CO₂ — tozalangan gaz sifati me’yordan chiqdi.','bad',[f0(s.ai)])},
  actions:[{label:'Antiko‘pik qo‘shish, filtrlarni tekshirish',run(c){c.m.setFault('normal');fx({foam:0});c.log('Antiko‘pik qo‘shildi — ko‘pik so‘nmoqda, PDI17010 va AI17001 me’yorga qaytadi.','ok');c.finish()}}]},
 leak:{title:'To‘yinmagan amin liniyasidan oqish',sis:'SIF-01 (LALL-17054, 2oo3) sath juda past bo‘lsa XV17003 ni yopadi',desc:'XV17002 flanetsi zichligi buzildi: amin yerga oqadi, absorberga amin kam boradi, gaz sifati yomonlashadi; sath tushsa SIS ishga tushadi.',
  start(c){c.m.setFault('amine');fx({leak:1});setCut(false);cam([[25,9,5],[15.4,6,-7.2]]);c.log('XV17002 flanetsidan to‘yinmagan amin oqmoqda — yerda ko‘lmak hosil bo‘lmoqda (amin bug‘i, H₂S xavfi).','bad');setSpeed(10)},
  tick(c){const s=c.s,z=s.sis||{};if(s.lean<40)c.once('lean','FCI17002: amin sarfi {0} %Qref gacha tushdi.','warn',[f1(s.lean)]);if(s.ai>=1000)c.once('ai','AI17001 = {0} ppmv — CO₂ me’yordan oshdi.','bad',[f0(s.ai)]);
   if((z.trip||[]).includes('SIF-01'))c.once('sif',"SIF-01 trip: XV17003 yopildi — gazning to‘yingan amin liniyasi orqali o‘tib ketishi (blow-by) oldi olindi.",'ok')},
  actions:[{label:'Liniyani izolyatsiya qilish va flanetsni almashtirish',run(c){c.m.setFault('normal');fx({leak:0});c.log('Oqish bartaraf etildi — amin sarfi tiklanmoqda. Ko‘lmak neytrallanadi.','ok')}},{label:'SIS RESET',reset:true}]},
 blowby:{title:'Gaz blow-by → mash’al (SIF-01 bypass’da)',sis:'SIF-01 bypass qilingan — himoya ishlamaydi; bypass olinsa XV17003 yopiladi',desc:'LC17003 klapani ochiq qotib qoldi, SIF-01 esa texnik xizmat uchun bypass qilingan: absorber bo‘shaydi, yuqori bosimli gaz FA-1705 ga o‘tadi, past bosim tizimi mash’alga tashlaydi.',
  start(c){c.m.sisBypass('SIF-01',true);c.m.setFault('stuckOpen');setSpeed(10);cam([[-150,30,-120],[-292,78,-276]],true);c.log('SIF-01 texnik xizmat uchun bypass qilingan (o‘quv farazi). LC17003 klapani 100 % ochiq qotib qoldi.','warn')},
  tick(c){const s=c.s,z=s.sis||{};if(s.L<=10)c.once('low','DA-1701 sathi {0} % — juda past.','warn',[f1(s.L)]);const bb=z.blowby||0,grow=bb>(c.f.bb||0);c.f.bb=bb;fx({flare:grow?1:0});
   if(grow)c.once('bb','XAVF: blow-by — gaz FA-1705 ga o‘tmoqda, mash’al alangasi keskin kuchaydi.','bad');if((z.trip||[]).includes('SIF-01'))c.once('trip','SIF-01 trip: XV17003 yopildi — blow-by to‘xtadi, mash’al me’yorga qaytmoqda.','ok')},
  actions:[{label:'SIF-01 bypass’ini olib tashlash',run(c){c.m.sisBypass('SIF-01',false);c.log('Bypass olib tashlandi — SIF-01 qayta faol.','info')}},{label:'LC17003 klapanini ta’mirlash',run(c){c.m.setFault('normal');c.log('LC17003 ta’mirlandi — sath tiklanadi.','ok')}},{label:'SIS RESET',reset:true}]},
 fire:{title:'FA-1702 yonida yong‘in',sis:'Olov detektorlari (2oo3) → ESD-1: barcha XV yopiladi (o‘quv FARAZI)',desc:'Separator pastki flanetsidan uglevodorod chiqib alanga oldi. Detektorlar yong‘inni tasdiqlaydi, ESD-1 qurilmani izolyatsiya qiladi, yong‘in xizmati chaqiriladi.',
  start(c){fx({fire:1});setCut(false);cam([[-17,9,21],[-2.5,2.5,2]]);c.log('FA-1702 asosida yong‘in chiqdi — alanga va qora tutun.','bad')},
  tick(c){const t=c.t;if(t>3)c.once('det','Olov detektorlari (UV/IR, 2oo3) yong‘inni tasdiqladi.','warn');if(t>5&&!c.f.esd){c.f.esd=1;c.m.sisESD();c.log('ESD-1: barcha XV yopildi — qurilma izolyatsiya qilindi, yonilg‘i manbai uzildi.','ok')}
   if(t>6&&!c.f.call){c.f.call=1;fx({truck:1});c.log('Yong‘in xizmati chaqirildi — o‘t o‘chirish mashinasi yo‘lda.','info')}
   const F=S3()?.fx;if(F?.arrived&&!c.f.w){c.f.w=t;fx({water:1});c.log('Mashina yetib keldi — suv bilan sovitish va o‘chirish boshlandi.','info')}
   if(c.f.w){const k=Math.max(0,1-(t-c.f.w)/28);fx({fire:k});if(k<=0){c.once('out','Yong‘in o‘chirildi. Qurilma ESD holatida — tekshiruvdan keyin SIS RESET.','ok');c.f.outT=c.f.outT||t;if(t-c.f.outT>6)fx({water:0})}}},
  actions:[{label:'Suvni to‘xtatish va mashinani qaytarish',run(c){fx({water:0,truck:0});c.log('O‘t o‘chirish mashinasi qaytdi.','info')}},{label:'SIS RESET',reset:true}]},
 press:{title:'Chiqish yopildi — bosim oshishi',sis:'SIF-05 (PAHH-17012, 2oo3, 4200 kPa) → ESD-1, PSV (4370 kPag) ochilmaydi',desc:'FCI17001 chiqish klapani yopilib qoldi: kirish bosimi oshadi. SIS PSV ochilishidan oldin ESD-1 bilan qurilmani izolyatsiya qiladi, gaz mash’alga yo‘naltiriladi.',
  start(c){c.m.setFault('outBlocked');setSpeed(10);setCut(false);cam([[20,15,16],[5,13,0]]);c.log('FCI17001 chiqish klapani yopilib qoldi — PI17012 bosimi oshmoqda.','warn')},
  tick(c){const s=c.s,z=s.sis||{};if(s.press>=4000)c.once('p','PI17012 = {0} kPa — bosim yuqori.','warn',[f0(s.press)]);
   if((z.trip||[]).includes('SIF-05')&&!c.f.e){c.f.e=c.t;c.log('SIF-05 trip → ESD-1: kirish va chiqish XV yopildi; bosim PSV sozlamasigacha yetmadi. Qoldiq gaz mash’alga tashlanmoqda.','ok');fx({flare:1,psv:.5})}
   if(c.f.e&&c.t-c.f.e>4)fx({psv:0});if(c.f.e&&c.t-c.f.e>16)fx({flare:0})},
  actions:[{label:'FCI17001 klapanini tiklash',run(c){c.m.setFault('normal');c.log('FCI17001 tiklandi — bosim me’yorga qaytadi.','ok')}},{label:'SIS RESET',reset:true}]}};
let run=null;
function ctxOf(){const r=run;return{s:App.state(),m:M(),t:(performance.now()-r.t0)/1000,f:r.flags,log:(t,k,a)=>logLine(t,k,a),once:(k,t,kind,a)=>{if(!r.flags['o_'+k]){r.flags['o_'+k]=1;logLine(t,kind,a)}},finish:()=>{r.done=true;drawRun()}}}
function logLine(text,kind='info',args=[]){if(!run)return;const t=(performance.now()-run.t0)/1000;run.log.push({t,text,kind,args});drawRun();capRun()}
const capRun=()=>{if(!run||!run.log.length)return;const l=run.log.at(-1);cap(`<b>${esc(tx(T(SC[run.id].title)))}</b> · ${esc(tx(T(l.text,...l.args)))}`)}
function startScenario(id){stopAll();const sc=SC[id];run={id,t0:performance.now(),flags:{},log:[]};go3d();fresh();setTimeout(()=>{if(run?.id!==id)return;run.t0=performance.now();run.started=true;sc.start(ctxOf());drawRun()},350)}
function stopScenario(){if(!run)return;const m=M();m.setFault('normal');if(run.id==='blowby')m.sisBypass('SIF-01',false);fx({fire:0,leak:0,foam:0,flare:0,psv:0,water:0,truck:0});restoreSpeed();setCut(true);cap(null);run=null;drawRun()}
function doAction(i){if(!run)return;const a=SC[run.id].actions[i],c=ctxOf();if(a.reset){const r=c.m.sisReset();logLine(r.still?.length?'RESET rad etildi: sabab hali bor — {0}':r.ok?.length?'SIS RESET qabul qilindi: {0}':'Faol trip yo‘q.',r.still?.length?'bad':'ok',[(r.still?.length?r.still:r.ok||[]).join(', ')])}else a.run(c)}
setInterval(()=>{if(!run?.started)return;try{SC[run.id].tick(ctxOf())}catch(e){console.error(e)}},500);
// ---------------------------------------------------------------- ekskursiya
const TOUR=[
 {c:'gate',t:'<b>Bosh kirish.</b> Sho‘rtan gaz-kimyo majmuasi (Qashqadaryo viloyati): darvoza, KPP va ma’muriy bino.'},
 {c:'complex',t:'<b>Majmua.</b> Gaz qabul qilish, amin bilan tozalash, quritish, kriogen ajratish, etilen va polietilen qurilmalari, rezervuar parki va mash’allar.'},
 {c:'all',t:'<b>Amin bloki DA-1701.</b> Xom gaz EA-1706 A/B/C da sovitiladi, FA-1702 da kondensatdan ajratiladi va absorberda amin bilan CO₂/H₂S dan tozalanadi.'},
 {c:[[16,13,15],[5,11.5,0]],cut:false,t:'<b>Absorber oynasi.</b> Tarelkalardan oqib tushayotgan amin yuqoriga ko‘tarilayotgan gaz bilan qarama-qarshi oqimda uchrashadi — CO₂ va H₂S yutiladi.'},
 {c:'cool',t:'<b>Sovitgichlar EA-1706 A/B/C.</b> Gaz harorati TI17007 da nazorat qilinadi; gaz issiq bo‘lsa yutilish yomonlashadi.'},
 {c:'sep',t:'<b>Separator FA-1702.</b> Kondensat LC17001 orqali drenajlanadi; sath juda past bo‘lsa SIF-03, juda yuqori bo‘lsa SIF-04 (ESD-1).'},
 {c:[[-19,4,8],[-25,1.2,0]],t:'<b>Dala SIS asboblari.</b> XV17001 (fail-close) va PT17012 A/B/C — mustaqil uzatgichlar 2oo3 mantiq bilan ishlaydi.'},
 {c:'dcsroom',t:'<b>DCS operator xonasi.</b> Operatorlar video-devor va pultlardan jarayonni boshqaradi; alarmlar va trendlar real vaqtda.'},
 {c:'sisroom',t:'<b>ISR-1.</b> SIS kontrollerlari (TMR A/B/C), I/O va XV rele shkaflari, ESD paneli va muhandislik stansiyasi.'},
 {c:'ethylene',t:'<b>Etilen qurilmasi.</b> Piroliz pechlari va ajratish kolonnalari.'},
 {c:[[-150,30,-120],[-292,78,-276]],far:true,t:'<b>Mash’al tizimi.</b> Avariya va bosim tushirishda gaz xavfsiz yoqiladi.'}];
let tour=null;
function tourShow(){if(!tour)return;const st=TOUR[tour.i];if(st.cut===false)setCut(false);else setCut(true);cam(st.c,st.far);
 cap(`${tx(T(st.t))}<div style="margin-top:8px;display:flex;gap:6px;align-items:center"><button class="asec" data-tour="prev">◀</button><button class="asec" data-tour="pause">${tour.pause?'▶':'⏸'}</button><button class="asec" data-tour="next">▶▶</button><span style="flex:1;opacity:.7;font-size:12px">${tour.i+1} / ${TOUR.length}</span><button class="asec" data-tour="stop">✕</button></div>`);tour.next=performance.now()+9500}
function startTour(){stopAll();tour={i:0,pause:false,next:0};go3d();setTimeout(tourShow,350)}
function stopTour(){if(!tour)return;tour=null;setCut(true);cap(null);S3()?.setCamera('all')}
setInterval(()=>{if(tour&&!tour.pause&&performance.now()>tour.next){if(tour.i<TOUR.length-1){tour.i++;tourShow()}else stopTour()}},400);
document.addEventListener('click',e=>{const b=e.target.closest('[data-tour]');if(!b||!tour)return;const k=b.dataset.tour;if(k==='prev'){tour.i=Math.max(0,tour.i-1);tourShow()}else if(k==='next'){if(tour.i<TOUR.length-1){tour.i++;tourShow()}else stopTour()}else if(k==='pause'){tour.pause=!tour.pause;tourShow()}else stopTour()});
// ---------------------------------------------------------------- demo: SIF-01 blow-by himoyasi (avtomatik, izohli)
let demo=null;
const DEMO=[
 {wait:c=>c.t>5,enter(c){cam('all');say('Demo: <b>SIF-01 himoyasi</b>. Qurilma normal ishlamoqda: DA-1701 sathi LC17003 bilan 45 % da ushlanadi.')}},
 {wait:c=>c.s.L<=8||(c.s.sis?.trip||[]).includes('SIF-01')||c.dt>40,enter(c){c.m.setFault('stuckOpen');setCut(false);cam([[15,5,10],[5,3.6,0]]);say('<b>Nosozlik:</b> LC17003 klapani 100 % ochiq qotib qoldi — absorber pastki qismi tez bo‘shamoqda (kub oynasi).')}},
 {wait:c=>(c.s.sis?.trip||[]).includes('SIF-01')&&c.dt>7||c.dt>45,enter(c){cam([[24,3.5,9],[19.5,1,4.4]]);say('<b>SIF-01 trip:</b> LT17054 A/B/C (2oo3) sath juda pastligini tasdiqladi — XV17003 fail-close yopildi. Gaz FA-1705 ga o‘tmadi.')}},
 {wait:c=>c.dt>8,enter(c){cam('dcsroom');say('<b>DCS:</b> operator SIS trip va HH alarmni ko‘radi. Blow-by hisoblagichi: {0} s — himoya ishladi. Klapan ta’mirlanmoqda.',f1(c.s.sis?.blowby||0));c.m.setFault('normal')}},
 {wait:c=>c.s.L>(c.m.settings.lowLow+6)&&c.dt>4||c.dt>45,enter(c){cam('sisroom');say('<b>ISR-1:</b> TMR kontrollerlar trip holatini latch bilan ushlab turibdi. Sabab yo‘qolishini kutamiz…')}},
 {wait:c=>c.dt>7,enter(c){const r=c.m.sisReset();cam('all');setCut(true);say(r.still?.length?'RESET rad etildi: sabab hali bor.':'<b>SIS RESET</b> qabul qilindi — XV17003 ochildi, qurilma normal ishga qaytdi. Demo tugadi.')}},
 {wait:c=>c.dt>8,enter(){stopDemo()}}];
const say=(h,...a)=>cap(tx(T(h,...a))+'<div style="margin-top:8px;text-align:right"><button class="asec" data-demo="stop">'+T('✕ Demoni to‘xtatish')+'</button></div>');
function startDemo(){stopAll();demo={i:0,t0:performance.now(),s0:performance.now()};go3d();fresh();setSpeed(5);setTimeout(()=>{if(demo)DEMO[0].enter(demoCtx())},350)}
function demoCtx(){const n=performance.now();return{s:App.state(),m:M(),t:(n-demo.t0)/1000,dt:(n-demo.s0)/1000}}
function stopDemo(){if(!demo)return;demo=null;restoreSpeed();setCut(true);cap(null);M().setFault('normal')}
setInterval(()=>{if(!demo)return;const c=demoCtx(),st=DEMO[demo.i];if(st.wait(c)&&demo.i<DEMO.length-1){demo.i++;demo.s0=performance.now();DEMO[demo.i].enter(demoCtx())}},500);
document.addEventListener('click',e=>{if(e.target.closest('[data-demo="stop"]'))stopDemo()});
function stopAll(){stopScenario();stopTour();stopDemo();if(ex)endEx()}
// ---------------------------------------------------------------- bilim testi
const QZ=[
 ['DA-1701 qurilmasining asosiy vazifasi nima?',['Tabiiy gazni amin eritmasi bilan CO₂ va H₂S dan tozalash','Gazni namlikdan quritish','Kondensatni barqarorlashtirish','Gazni kompressorda siqish']],
 ['SIF-01 (LALL-17054) ishga tushganda nima sodir bo‘ladi?',['XV17003 yopiladi — blow-by oldi olinadi','ESD-1 butun qurilmani to‘xtatadi','XV17001 ochiladi','Mash’al o‘chiriladi']],
 ['“2oo3” ovoz berish nimani anglatadi?',['Uchta uzatgichdan ikkitasi trip bersa, funksiya ishga tushadi','Uchchala uzatgich ham trip berishi kerak','Bitta uzatgich yetarli','Ikki marta tekshirib keyin ishga tushadi']],
 ['Fail-close XV klapani boshqaruv havosi yoki quvvat yo‘qolsa qanday holatga o‘tadi?',['Yopiladi','Ochiladi','Oxirgi holatda qoladi','50 % ga o‘rnatiladi']],
 ['PDI17010 bosim farqining keskin oshishi ko‘pincha qaysi nosozlik belgisi?',['Absorberda ko‘piklanish','AI17001 analizatori nosozligi','Kirish gazi bosimining pasayishi','Sovitish suvining ortishi']],
 ['SIS mantiqida BAD (signal yo‘q) kanal qanday hisoblanadi?',['Fail-safe — trip tomoniga “faol” deb hisoblanadi','E’tiborga olinmaydi','Normal qiymat deb hisoblanadi','Ovoz berishni butunlay to‘xtatadi']],
 ['SIS RESET qachon qabul qilinadi?',['Trip sababi yo‘qolgandan keyin','Istalgan paytda','Faqat ESD dan keyin','Faqat qurilma to‘xtaganda']],
 ['To‘yinmagan amin sarfi (FCI17002) kamaysa, tozalangan gazdagi CO₂ (AI17001) qanday o‘zgaradi?',['Oshadi','Kamayadi','O‘zgarmaydi','Nolga tushadi']],
 ['To‘yingan amin yuklanishi (α) chegaraga yaqinlashsa qanday xavf bor?',['Korroziya va yutish samaradorligi pasayishi','Aminning muzlashi','Gaz bosimining pasayishi','Xavf yo‘q']],
 ['ESD-1 da qaysi klapanlar yopiladi?',['XV17001…XV17006 — barchasi','Faqat XV17003','Faqat gaz kirishi','Hech qaysi']],
 ['“Blow-by” nima?',['Yuqori bosimli gazning suyuqlik chiqish liniyasi orqali past bosimli tizimga o‘tib ketishi','Aminning ko‘piklanishi','Sovitgich quvurlarining tiqilishi','Analizatorning kechikishi']],
 ['Qurilmada yong‘in aniqlanganda birinchi to‘g‘ri harakat qaysi?',['ESD ni faollashtirish va yong‘in xizmatini chaqirish','Klapanlarni qo‘lda ochish','Ovozli signalni o‘chirish','Vaziyatni kuzatib turish']]];
let quiz=null;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function startQuiz(){quiz={qs:shuffle(QZ).slice(0,8).map(([q,o])=>({q,ok:o[0],opts:shuffle(o)})),i:0,score:0,answered:null};drawQuiz()}
function drawQuiz(){const el=$('trQuiz');if(!el)return;if(!quiz){const best=store.get('quizBest',null);el.innerHTML=`<p class="a-muted">${T('8 ta tasodifiy savol: jarayon, SIS mantig‘i va xavfsizlik.')}${best!=null?' '+T('Eng yaxshi natija: {0} / 8.',best):''}</p><button class="asec" id="trQuizGo">${T('▶ Testni boshlash')}</button>`;return}
 if(quiz.i>=quiz.qs.length){const best=Math.max(store.get('quizBest',0),quiz.score);store.set('quizBest',best);el.innerHTML=`<div class="tr-score">${quiz.score} / ${quiz.qs.length}</div><p>${T(quiz.score>=7?'A’lo! Siz jarayon va SIS mantig‘ini yaxshi bilasiz.':quiz.score>=5?'Yaxshi. Xato javoblarni SIS / ESD bo‘limida qayta ko‘rib chiqing.':'SIS / ESD va Matematik model bo‘limlarini o‘rganib, testni qayta topshiring.')}</p><button class="asec" id="trQuizGo">${T('↺ Qayta boshlash')}</button>`;return}
 const q=quiz.qs[quiz.i];el.innerHTML=`<div class="a-muted">${T('Savol {0} / {1} · Ball: {2}',quiz.i+1,quiz.qs.length,quiz.score)}</div><p class="tr-q">${esc(T(q.q))}</p><div class="tr-opts">${q.opts.map((o,k)=>`<button class="tr-opt${quiz.answered!=null?(o===q.ok?' ok':k===quiz.answered?' bad':''):''}" data-qa="${k}" ${quiz.answered!=null?'disabled':''}>${esc(T(o))}</button>`).join('')}</div>${quiz.answered!=null?`<p>${q.opts[quiz.answered]===q.ok?T('✔ To‘g‘ri.'):T('✘ Noto‘g‘ri. To‘g‘ri javob:')+' <b>'+esc(T(q.ok))+'</b>'}</p><button class="asec" id="trQuizNext">${T('Keyingi ▶')}</button>`:''}`}
// ---------------------------------------------------------------- amaliy mashq: yashirin nosozlikni aniqlash
const POOL=['amine','rich','cooling','gas','foam','leanLoad','feedCO2','drain','stuckOpen','dilution','heat'];
let ex=null;
function startEx(){stopAll();const F=window.AmineConfig.FAULTS,f=POOL[Math.floor(Math.random()*POOL.length)],opts=shuffle([f,...shuffle(POOL.filter(x=>x!==f)).slice(0,3)]);fresh();const m=M();m.fault=f;m.checkAlarms();
 const sel=$('aScenario');if(sel)sel.style.visibility='hidden';ex={f,opts,t0:performance.now(),ans:null};setSpeed(10);drawEx()}
function answerEx(k){if(!ex||ex.ans!=null)return;ex.ans=k;ex.dt=(performance.now()-ex.t0)/1000;const ok=ex.opts[k]===ex.f;ex.score=ok?Math.max(40,Math.round(100-ex.dt/3)):0;
 const hist=store.get('exHist',[]);hist.push({f:ex.f,ok,score:ex.score,dt:Math.round(ex.dt)});store.set('exHist',hist.slice(-20));ex.diag=M().diagnose().map(r=>r.title);drawEx()}
function endEx(){if(!ex)return;const sel=$('aScenario');if(sel)sel.style.visibility='';M().setFault('normal');restoreSpeed();ex=null;drawEx()}
function drawEx(){const el=$('trEx');if(!el)return;const F=window.AmineConfig.FAULTS,fn=f=>(window.I18N?.tr||(x=>x))(F[f]);
 if(!ex){const h=store.get('exHist',[]),n=h.length,ok=h.filter(x=>x.ok).length;el.innerHTML=`<p class="a-muted">${T('Tizim tasodifiy nosozlikni yashirin kiritadi (ssenariy tanlagichi berkitiladi). Mnemosxema, trendlar, alarmlar va diagnostikadan foydalanib sababni aniqlang. Tez va to‘g‘ri javob — yuqori ball.')}</p>${n?`<p class="a-muted">${T('Oxirgi {0} ta mashq: to‘g‘ri {1}, o‘rtacha ball {2}.',n,ok,Math.round(h.reduce((a,x)=>a+x.score,0)/n))}</p>`:''}<button class="asec" id="trExGo">${T('▶ Mashqni boshlash')}</button>`;return}
 const t=ex.ans==null?Math.round((performance.now()-ex.t0)/1000):Math.round(ex.dt);
 el.innerHTML=`<div class="a-muted">${T('Vaqt: {0} s · Jarayonni kuzating (boshqa bo‘limlarga o‘tishingiz mumkin), so‘ng sababni tanlang:','<b id="trExT">'+t+'</b>')}</div><div class="tr-opts">${ex.opts.map((f,k)=>`<button class="tr-opt${ex.ans!=null?(f===ex.f?' ok':k===ex.ans?' bad':''):''}" data-ex="${k}" ${ex.ans!=null?'disabled':''}>${esc(fn(f))}</button>`).join('')}</div>
 ${ex.ans!=null?`<p>${ex.opts[ex.ans]===ex.f?T('✔ To‘g‘ri! Ball:')+' <b>'+ex.score+'</b>':T('✘ Noto‘g‘ri. Haqiqiy sabab:')+' <b>'+esc(fn(ex.f))+'</b>'}</p><p class="a-muted">${T('Diagnostika xulosalari:')} ${ex.diag.map(d=>esc((window.I18N?.tr||(x=>x))(d))).join(' · ')}</p><button class="asec" id="trExEnd">${T('✓ Yakunlash (normal rejim)')}</button>`:`<button class="asec" id="trExEnd" style="margin-top:8px">${T('✕ Bekor qilish')}</button>`}`}
setInterval(()=>{const el=$('trExT');if(el&&ex&&ex.ans==null)el.textContent=Math.round((performance.now()-ex.t0)/1000)},1000);
// ---------------------------------------------------------------- panel
const st=document.createElement('style');st.textContent=`
.tr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:13px}
.tr-sc{display:flex;flex-direction:column;gap:6px}.tr-sc h3{margin:0;font-size:14px}.tr-sc p{margin:0;font-size:12.5px}.tr-sis{font-size:11.5px;color:#2c9e89}
.tr-log{font:12px/1.5 Segoe UI,Arial;max-height:260px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:8px;background:var(--pan2)}
.tr-log div{padding:2px 0;border-bottom:1px dashed var(--line)}.tr-log .bad{color:#d9534f}.tr-log .warn{color:#c98b16}.tr-log .ok{color:#2c9e89}.tr-log .info{color:var(--mut)}
.tr-opts{display:grid;gap:6px;margin:8px 0}.tr-opt{text-align:left;padding:9px 12px;border-radius:8px;border:1px solid var(--line);background:var(--pan2);color:inherit;cursor:pointer;font:13px Segoe UI,Arial}
.tr-opt:hover:not([disabled]){border-color:#3f84c2}.tr-opt.ok{background:#2c9e8926;border-color:#2c9e89}.tr-opt.bad{background:#d9534f22;border-color:#d9534f}
.tr-q{font-weight:600;font-size:14px}#fxCap .asec{background:#1e3550;color:#eaf4fc;border-color:#54758e}.tr-score{font:700 34px Segoe UI;color:#2c9e89}.tr-acts{display:flex;flex-wrap:wrap;gap:6px}`;document.head.appendChild(st);
const panel=document.createElement('div');panel.className='a-panel';panel.dataset.ap='train';
const panelHTML=()=>`<div class="a-card a-pad" style="margin-bottom:13px"><div class="a-toolbar" style="padding:0;border:0"><b style="font-size:13px">${T('Avariya ssenariylari — 3D effektlar va SIS javobi')}</b><span class="spacer"></span><button class="asec trSound">${T(Snd.on?'🔊 Ovoz yoniq':'🔇 Ovoz o‘chiq')}</button><button class="asec" id="trSilence" title="${T('Joriy sirenani o‘chirish')}">${T('🔕 Sirenani o‘chirish')}</button></div>
<div class="tr-grid" style="margin-top:10px">${Object.entries(SC).map(([id,s])=>`<div class="a-card a-pad tr-sc"><h3>${esc(T(s.title))}</h3><p>${esc(tx(T(s.desc)))}</p><div class="tr-sis">🛡 ${esc(tx(T(s.sis)))}</div><div><button class="asec" data-sc="${id}">${T('▶ Boshlash')}</button></div></div>`).join('')}</div></div>
<div class="a-card a-pad" id="trRunCard" style="margin-bottom:13px;display:none"><div class="a-toolbar" style="padding:0;border:0"><b id="trRunTitle"></b><span class="spacer"></span><button class="asec" data-go="3d">${T('3D ko‘rinish')}</button><button class="asec" data-go="sis">SIS / ESD</button><button class="asec" id="trStop">${T('■ To‘xtatish')}</button></div>
<div class="tr-acts" id="trActs" style="margin:10px 0"></div><div class="tr-log" id="trLog"></div></div>
<div class="tr-grid"><div class="a-card a-pad tr-sc"><h3>🎥 ${T('Ekskursiya')}</h3><p>${T('Majmua bo‘ylab 11 bekatli sayohat: bosh kirish, amin bloki, absorber oynasi, sovitgichlar, separator, SIS asboblari, DCS va ISR xonalari, etilen va mash’allar — izohlar bilan.')}</p><div><button class="asec" id="trTour">${T('▶ Ekskursiyani boshlash')}</button></div></div>
<div class="a-card a-pad tr-sc"><h3>🎬 ${T('Demo: SIF-01 himoyasi')}</h3><p>${esc(tx(T('Avtomatik namoyish: LC17003 klapani ochiq qotadi → sath tushadi → SIF-01 2oo3 trip, XV17003 yopiladi → blow-by bo‘lmaydi → ta’mir → SIS RESET. Kamera voqealar ortidan boradi.')))}</p><div><button class="asec" id="trDemo">${T('▶ Demoni ko‘rish')}</button></div></div>
<div class="a-card a-pad tr-sc"><h3>🌦 ${T('Ob-havo va kun vaqti')}</h3><p>${T('3D panelidagi tugmalar: ☀ / ☾ / ★ / 🌅 — kunduz, kechqurun, tun, tong; ☀ Ochiq / 🌧 Yomg‘ir / ❄ Qor — ob-havo (ho‘l yoki qorli zamin, tuman, bulutli osmon).')}</p><div class="tr-acts"><button class="asec" data-wx="clear">${T('☀ Ochiq')}</button><button class="asec" data-wx="rain">${T('🌧 Yomg‘ir')}</button><button class="asec" data-wx="snow">${T('❄ Qor')}</button></div></div></div>
<div class="tr-grid" style="margin-top:13px"><div class="a-card a-pad"><h2>📝 ${T('Bilim testi')}</h2><div id="trQuiz"></div></div><div class="a-card a-pad"><h2>🎯 ${T('Amaliy mashq: nosozlikni aniqlang')}</h2><div id="trEx"></div></div></div>
<p class="a-muted" style="margin-top:10px">${T('Ssenariylar o‘quv maqsadida: yong‘in va olov detektorlari mantiqi — FARAZ; boshqa ssenariylar model nosozliklari va SIS funksiyalari (SIF-01, SIF-05, ESD-1) asosida hisoblanadi. Ovoz: yangi alarm — ikki tonli signal, SIS trip — sirena, ESD — gudok.')}</p>`;
panel.dataset.noi18n='1';panel.innerHTML=panelHTML();
const settingsPanel=document.querySelector('#aApp [data-ap="settings"]');if(settingsPanel)settingsPanel.before(panel);else document.querySelector('#aApp')?.appendChild(panel);
function drawRun(){const card=$('trRunCard');if(!card)return;if(!run){card.style.display='none';return}card.style.display='';const sc=SC[run.id];$('trRunTitle').textContent=T(sc.title)+(run.done?' — '+T('yakunlandi'):'');
 $('trActs').innerHTML=sc.actions.map((a,i)=>`<button class="asec" data-act="${i}">${esc(T(a.label))}</button>`).join('');$('trLog').innerHTML=run.log.map(l=>`<div class="${l.kind}">[${l.t.toFixed(0)} s] ${esc(T(l.text,...l.args))}</div>`).join('');$('trLog').scrollTop=1e6}
panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.sc)startScenario(b.dataset.sc);else if(b.dataset.act!=null)doAction(+b.dataset.act);else if(b.id==='trStop')stopScenario();else if(b.id==='trTour')startTour();else if(b.id==='trDemo')startDemo();
 else if(b.classList.contains('trSound'))Snd.set(!Snd.on);else if(b.id==='trSilence'){Snd.silenced=true}
 else if(b.dataset.wx){go3d();setTimeout(()=>S3()?.setWeather(b.dataset.wx),300)}
 else if(b.id==='trQuizGo')startQuiz();else if(b.dataset.qa!=null&&quiz&&quiz.answered==null){quiz.answered=+b.dataset.qa;if(quiz.qs[quiz.i].opts[quiz.answered]===quiz.qs[quiz.i].ok)quiz.score++;drawQuiz()}else if(b.id==='trQuizNext'){quiz.i++;quiz.answered=null;drawQuiz()}
 else if(b.id==='trExGo')startEx();else if(b.dataset.ex!=null)answerEx(+b.dataset.ex);else if(b.id==='trExEnd')endEx()});
// 3D paneliga: ekskursiya va ovoz tugmalari
let t3=null;const bar=document.querySelector('#aSceneCard .a-toolbar');if(bar){const t=document.createElement('button');t.className='asec';t.textContent=T('🎥 Ekskursiya');t.dataset.noi18n='1';t.onclick=()=>tour?stopTour():startTour();bar.appendChild(t);t3=t;
 const s=document.createElement('button');s.className='asec trSound';s.onclick=()=>Snd.set(!Snd.on);bar.appendChild(s)}
const wantSound=store.get('sound',false);Snd.set(false);if(wantSound)document.addEventListener('pointerdown',function f(){Snd.set(true)},{once:true});
$('fxCap')?.setAttribute('data-noi18n','1');drawQuiz();drawEx();
window.addEventListener('langchange',()=>{if(t3)t3.textContent=T('🎥 Ekskursiya');panel.innerHTML=panelHTML();drawQuiz();drawEx();drawRun();if(run)capRun();if(tour)tourShow();Snd.set(Snd.on)});
window.AmineTrain={start:startScenario,stop:stopAll,tour:startTour,demo:startDemo,quiz:startQuiz,exercise:startEx,scenarios:Object.keys(SC),sound:Snd};
})();
