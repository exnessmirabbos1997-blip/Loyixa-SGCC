(()=>{'use strict';
// GP1701 AI erta ogohlantirish moduli. Mavjud AmineModel/AmineApp'ga tegmaydi: faqat o'qiydi.
// 1) Isolation Forest — normal rejim simulyatsiyalaridan o'qitiladi (tasodifiy setpoint/klapan o'zgarishlari bilan)
// 2) Sabab tashxisi — har bir nosozlik simulyatsiyasining o'rtacha imzosiga masofa (softmax)
// 3) Prognoz — sath tendensiyasidan H/HH chegaragacha qolgan vaqt
const FEATS=['L','K','W','lean/gas','Ti','To','Tr','dp','press','gas','dL','dK','dW','rich-lean','act_rich-cmd','cw','resCO2','resTr','aiq'];
const FEAT_UZ={L:'DA-1701 sathi',K:'FA-1702 sathi',W:'Yuvish sathi','lean/gas':'amin/gaz nisbati',Ti:'TI17007',To:'TI17005',Tr:'TI17006',dp:'PDI17010',press:'PI17012',gas:'gaz oqimi',dL:'DA-1701 sath tendensiyasi',dK:'FA-1702 sath tendensiyasi',dW:'yuvish sath tendensiyasi','rich-lean':'amin kirish/chiqish farqi','act_rich-cmd':'LC17003 buyruq/holat farqi',cw:'sovitish suvi',resCO2:'AI17001 o‘lchovi va raqamli egizak farqi',resTr:'TI17006 va raqamli egizak farqi',aiq:'AI17001 signal sifati'};
const HINT={
 normal:{t:'Normal rejim',a:'Choralar talab qilinmaydi.',tag:''},
 amine:{t:'Amin ta’minoti kamayishi',a:'FCI17002 va amin nasosi/EC-1701 ta’minotini, filtrlar va qo‘lda klapanlarni tekshiring.',tag:'FCI17002'},
 rich:{t:'To‘yingan amin chiqishi tiqilishi',a:'LC17003 chiqish liniyasi va FA-1705 tomon bosimni tekshiring; klapanni qo‘lda ochish haqida smena boshlig‘iga xabar bering.',tag:'LC17003'},
 cooling:{t:'Sovitish suvi kamayishi',a:'TC17001 va sovitish suvi kollektori bosimini tekshiring; EA-1706 A/B/C chiqish haroratini kuzating.',tag:'TC17001'},
 gas:{t:'Gaz yuklamasi oshishi',a:'PV17001 A/B/C ochilishini va kirish gaz sarfini tekshiring; amin sarfini oshirish zarurligini ko‘rib chiqing.',tag:'PV17001A/B/C'},
 sensor:{t:'LC17003 signali yo‘qolgan (uzatgich yoki aloqa)',a:'LT/LC17003 uzatgichi va kabelini tekshiring; AUTO oxirgi buyruqda qoladi — sathni LG17005 oynasidan qo‘lda nazorat qiling.',tag:'LC17003'},
 drain:{t:'Separator drenaji tiqilishi',a:'LC17001 chiqish liniyasi va FA-6908 tomon yo‘lni tekshiring.',tag:'LC17001'},
 stuckOpen:{t:'LC17003 klapani ochiq qotgan',a:'LC17003 klapan shtoki va pozitsionerini tekshiring; gaz DA-1701 pastidan o‘tib ketish xavfi.',tag:'LC17003'},
 stuckClosed:{t:'LC17003 klapani yopiq qotgan',a:'LC17003 klapan va pnevmo ta’minotini tekshiring; absorber sathi oshib boradi.',tag:'LC17003'},
 noFlow:{t:'Gaz ta’minoti uzilishi',a:'Kirish gaz liniyasi, PV17001 A/B/C va chegara uskunasini tekshiring.',tag:'PV17001'},
 lowPressure:{t:'Gaz manbai bosimi pasayishi',a:'Chegaradagi gaz bosimi (PI17012) va manba uskunasini tekshiring.',tag:'PI17012'},
 comm:{t:'LC17003 aloqa uzilishi',a:'DCS/PLC aloqa kanali va kontrollerni tekshiring; signal sifati BAD.',tag:'LC17003'},
 power:{t:'Aktuator quvvati yo‘q',a:'Klapan pozitsioneri/pnevmo ta’minotini tekshiring; klapanlar oxirgi holatda qotgan.',tag:'Aktuatorlar'},
 heat:{t:'Gaz kirish harorati oshishi',a:'EA-1706 sovitgichlari va yuqori oqim haroratini tekshiring; TI17007/TI17005 o‘sishi kuzatiladi.',tag:'EA-1706'},
 leanLoad:{t:'Regeneratsiya yomonlashdi (to‘yinmagan amin yuklanishi yuqori)',a:'Regenerator (desorber) bug‘ sarfi, qaynatgich harorati va to‘yinmagan amin laboratoriya tahlilini tekshiring.',tag:'EC-1701'},
 foam:{t:'Absorberda ko‘piklanish',a:'PDI17010 o‘sishini kuzating; antiko‘pik dozalang, amin filtrlari va uglevodorod kondensati tushishini (FA-1702) tekshiring.',tag:'PDI17010'},
 dilution:{t:'Amin konsentratsiyasi pasaygan',a:'Amin eritmasi konsentratsiyasini laboratoriyada aniqlang; yuvish suvi va qo‘shimcha suv balansini (FCI17003) tekshiring.',tag:'FCI17002'},
 feedCO2:{t:'Xom gazda CO₂ ulushi oshgan',a:'Kirish gazi tarkibini (xromatograf) tekshiring; amin sarfini oshirish va gaz yuklamasini kamaytirish ko‘rib chiqiladi.',tag:'AI17001'},
 analyzer:{t:'AI17001 analizatori ishlamayapti',a:'Analizator (AA17001) kalibrovka holati va namuna olish tizimini tekshiring; gaz sifatini laboratoriya tahlili bilan nazorat qiling.',tag:'AI17001'}
};
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const lastOf=(h,t0)=>{for(let i=h.length-1;i>=0;i--)if(h[i].t<=t0)return h[i];return h[0]};
function features(s,past,lastGoodL){
 const Lm=s.measured&&s.measured.L!=null?s.measured.L:lastGoodL;
 const pL=past.measured&&past.measured.L!=null?past.measured.L:Lm;
 const cw=s.cwFlow!=null?s.cwFlow:(s.actual.cw||0);
  return [Lm,s.K,s.W,s.lean/Math.max(s.g,1),s.Ti,s.To,s.Tr,s.dp,s.press,s.g,Lm-pL,s.K-past.K,s.W-past.W,s.rich-s.lean,s.actual.rich-s.command.rich,cw,s.ai!=null&&s.aiExp>0?Math.log10(Math.max(1,s.ai)/Math.max(1,s.aiExp)):0,s.Tr-(s.TrExp||s.Tr),s.ai==null?1:0];
}
// ---- Isolation Forest ----
const cF=n=>n<=1?0:n===2?1:2*(Math.log(n-1)+0.5772156649)-2*(n-1)/n;
function buildTree(X,depth,max,R){const n=X.length;if(depth>=max||n<=1)return{size:n};const q=Math.floor(R()*X[0].length);let lo=Infinity,hi=-Infinity;for(const r of X){if(r[q]<lo)lo=r[q];if(r[q]>hi)hi=r[q]}if(hi-lo<1e-12)return{size:n};const p=lo+R()*(hi-lo);return{q,p,l:buildTree(X.filter(r=>r[q]<p),depth+1,max,R),r:buildTree(X.filter(r=>r[q]>=p),depth+1,max,R)}}
function path(t,x,d=0){if(t.size!==undefined)return d+cF(t.size);return path(x[t.q]<t.p?t.l:t.r,x,d+1)}
class IForest{constructor(X,trees=100,psi=256,seed=7){const R=rng(seed),max=Math.ceil(Math.log2(psi));this.psi=Math.min(psi,X.length);this.t=[];for(let i=0;i<trees;i++){const S=[];for(let j=0;j<this.psi;j++)S.push(X[Math.floor(R()*X.length)]);this.t.push(buildTree(S,0,max,R))}this.c=cF(this.psi)}score(x){let e=0;for(const t of this.t)e+=path(t,x);e/=this.t.length;return Math.pow(2,-e/this.c)}}
// ---- Trening ----
const mk=()=>new window.AmineModel();
function simulate(opts){const m=mk(),R=rng(opts.seed||1),T=opts.T,out=[],hist=[m.snapshot()];let lastGood=m.s.L;const warm=opts.warm||0;
 const randomize=()=>{const c=m.command;c.a=c.b=c.c=60+R()*22;c.out=50+R()*10;c.lean=58+R()*24;c.wash=40+R()*18;c.cw=55+R()*20;m.sp.rich=30+R()*35;m.sp.drain=25+R()*30;m.sp.water=12+R()*14};
 if(opts.randomize)randomize();
 let next=10+R()*40;
 for(let k=0;k<T*10;k++){const t=k/10;if(opts.randomize&&t>=next){randomize();next=t+30+R()*60}if(opts.fault&&Math.abs(t-warm)<1e-6)m.setFault(opts.fault);m.advance(.1);
  if(k%10===9){const s=m.snapshot();if(s.measured.L!=null)lastGood=s.measured.L;hist.push(s);const past=lastOf(hist,s.t-20);out.push({t:s.t,x:features(s,past,lastGood),s,alarms:s.alarms.length,alarmLevels:s.alarms.map(a=>a.level)})}}
 return out}
let AI=null;
function train(){
 const X=[];for(let i=0;i<14;i++){for(const r of simulate({seed:100+i,T:320,randomize:true}))if(r.t>=70&&((r.t|0)%2===0))X.push(r.x)}
 for(const r of simulate({seed:99,T:420}))if(r.t>=70&&((r.t|0)%3===0))X.push(r.x);
 const mean=FEATS.map((_,j)=>X.reduce((a,r)=>a+r[j],0)/X.length);
 const sd=FEATS.map((_,j)=>{const v=Math.sqrt(X.reduce((a,r)=>a+(r[j]-mean[j])**2,0)/X.length);return Math.max(v,.03*Math.abs(mean[j])+.05)});
 const Z=X.map(r=>r.map((v,j)=>(v-mean[j])/sd[j]));
 const forest=new IForest(Z,100,256,11);
 const KN=Z.filter((_,i)=>i%2===0);const knn=(z,skip)=>{const ds=[];for(const q of KN){let s=0;for(let j=0;j<z.length;j++){const d=z[j]-q[j];s+=d*d}if(skip&&s<1e-12)continue;ds.push(s)}ds.sort((a,b)=>a-b);return Math.sqrt(ds[4])};
 const kn=Z.filter((_,i)=>i%2===1).map(z=>knn(z,true)).sort((a,b)=>a-b);const kq=p=>kn[Math.min(kn.length-1,Math.floor(p*kn.length))];
 const sc=Z.map(z=>forest.score(z)).sort((a,b)=>a-b),q=p=>sc[Math.min(sc.length-1,Math.floor(p*sc.length))];
 const base=q(.5),warn=q(.995),top=q(.9999);
 // nosozlik imzolari
 const cent={normal:Z.reduce((a,z)=>a.map((v,j)=>v+z[j]/Z.length),FEATS.map(()=>0))};
 const faults=Object.keys(window.AmineConfig.FAULTS).filter(f=>f!=='normal');
 for(const f of faults){const rows=simulate({seed:900,T:170,warm:50,fault:f}).filter(r=>r.t>=70);const zs=rows.map(r=>r.x.map((v,j)=>(v-mean[j])/sd[j]));cent[f]=zs.reduce((a,z)=>a.map((v,j)=>v+z[j]/zs.length),FEATS.map(()=>0))}
 AI={mean,sd,forest,base,warn,top,cent,n:X.length,knn,k50:kq(.5),k995:kq(.995)};return AI}
function riskAll(z,sc){const Rif=riskFromScore(sc),dk=AI.knn(z,false),r=dk/AI.k995,Rk=r<.7?0:r<1?.4*(r-.7)/.3:Math.min(1,.4+.6*(r-1)/1.5),zm=Math.max(...z.map(Math.abs)),Rz=zm<4.5?0:Math.min(1,.4+.6*(zm-4.5)/6);
 return{R:Math.max(Rif,Rk,Rz),Rif,Rk,Rz,dk,diag:diagnose(z)}}
// R: 0..1. 0.40 = ogohlantirish, 0.70 = xavfli
function riskFromScore(sc){if(sc<=AI.base)return 0;if(sc<=AI.warn)return .4*(sc-AI.base)/(AI.warn-AI.base);return Math.min(1,.4+.6*(sc-AI.warn)/Math.max(1e-6,AI.top-AI.warn)*.6)}
function diagnose(z){const T=2,ks=Object.keys(AI.cent),d=ks.map(k=>AI.cent[k].reduce((a,c,j)=>a+Math.min(100,(z[j]-c)**2),0));const mn=Math.min(...d),w=d.map(v=>Math.exp(-(v-mn)/T)),sum=w.reduce((a,b)=>a+b,0);let out=ks.map((k,i)=>({id:k,p:w[i]/sum,d:d[i]}));const c=out.find(o=>o.id==='comm'),s=out.find(o=>o.id==='sensor');if(c&&s){s.p+=c.p;out=out.filter(o=>o!==c)}return out.sort((a,b)=>b.p-a.p)}
function prognosis(s,hist,p){const out=[];const rows=[['L','DA-1701 · LC17003',p.high,p.highHigh,p.low,p.lowLow],['K','FA-1702 · LC17001',p.high,p.highHigh,p.low,p.lowLow],['W','Yuvish · LC17002',p.high,p.highHigh,p.low,p.lowLow]];
 for(const [k,name,H,HH,L,LL] of rows){let v=k==='L'&&s.measured.L==null?null:s[k];if(v==null){out.push({k,name,v:null});continue}
  const past=lastOf(hist,s.t-30),dt=Math.max(1,s.t-past.t),pv=k==='L'&&past.measured.L==null?null:past[k];const rate=pv==null?0:(v-pv)/dt;let tH=null,tHH=null,tL=null;
  if(rate>.005){if(v<H)tH=(H-v)/rate;if(v<HH)tHH=(HH-v)/rate}else if(rate<-.005){if(v>L)tL=(v-L)/-rate}
  out.push({k,name,v,rate,tH,tHH,tL,H,HH,L})}return out}
// ---- Jonli holat ----
const live={R:0,score:0,series:[],diag:[],prog:[],top:[],state:'NORMAL',lastT:-1,lastGoodL:45};
function evaluate(){if(!AI||!window.AmineApp)return null;const s=window.AmineApp.state(),h=window.AmineApp.history();if(s.measured.L!=null)live.lastGoodL=s.measured.L;
 const past=lastOf(h,s.t-20),x=features(s,past,live.lastGoodL),z=x.map((v,j)=>(v-AI.mean[j])/AI.sd[j]);
 const sc=AI.forest.score(z);const ra=riskAll(z,sc);let R=ra.R;const prog=prognosis(s,h,window.AmineApp.model.settings);
 const soon=prog.map(r=>r.tHH??r.tH).filter(v=>v!=null);const tmin=soon.length?Math.min(...soon):null;if(tmin!=null&&tmin<240)R=Math.max(R,Math.min(1,.4+.6*(1-tmin/240)));
 if(s.measured.L==null)R=Math.max(R,.55);
 const diag=ra.diag,top=z.map((v,j)=>({f:FEATS[j],z:v,x:x[j]})).sort((a,b)=>Math.abs(b.z)-Math.abs(a.z)).slice(0,3);
 const state=R>=.7?'XAVFLI':R>=.4?'OGOHLANTIRISH':'NORMAL';
 Object.assign(live,{R,score:sc,diag,prog,top,state,x,z,tmin,t:s.t});
 if(s.t!==live.lastT){live.series.push([s.t,R]);if(live.series.length>240)live.series.shift();if(s.t<live.lastT)live.series=[[s.t,R]];live.lastT=s.t}
 return live}
// ---- Ishonchlilik sinovi: AI ogohlantirishi vs. PLC alarmi ----
function leadTest(){const faults=Object.keys(window.AmineConfig.FAULTS).filter(f=>f!=='normal'),rows=[];
 for(const f of faults){const run=simulate({seed:555,T:700,warm:60,fault:f});let ai=null,plc=null,hit=0,tot=0,diagOK=null;const hist=[],lg={v:45};
  for(const r of run){hist.push(r.s);const zz=r.x.map((v,j)=>(v-AI.mean[j])/AI.sd[j]);let R=riskAll(zz,AI.forest.score(zz)).R;if(r.s.measured.L==null)R=Math.max(R,.55);
   const prog=prognosis(r.s,hist,{high:85,highHigh:95,low:10,lowLow:5});const soon=prog.map(q=>q.tHH??q.tH).filter(v=>v!=null);if(soon.length&&Math.min(...soon)<240)R=Math.max(R,.4+.6*(1-Math.min(...soon)/240));
   if(r.t>60){if(ai==null&&R>=.4)ai=r.t-60;if(plc==null&&r.alarms>0)plc=r.t-60}
   if(r.t>=100&&r.t<=160){tot++;const d=diagnose(r.x.map((v,j)=>(v-AI.mean[j])/AI.sd[j]))[0].id;if(d===f||(f==='comm'&&d==='sensor'))hit++}}
  rows.push({f,ai,plc,lead:ai!=null&&plc!=null?plc-ai:null,diag:tot?hit/tot:0})}
 // yolg‘on signal: faqat normal rejim
 const nrm=simulate({seed:777,T:600,randomize:true}).filter(r=>r.t>=70);let fa=0;for(const r of nrm){const zz=r.x.map((v,j)=>(v-AI.mean[j])/AI.sd[j]);if(riskAll(zz,AI.forest.score(zz)).R>=.4)fa++}
 return{rows,falseRate:fa/nrm.length,n:nrm.length}}
// ---- UI ----
const $=id=>document.getElementById(id);const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const col=R=>R>=.7?'var(--aiBad,#d9534f)':R>=.4?'var(--aiWarn,#d99a2b)':'var(--aiOk,#2c9e89)';
const fmtT=t=>t==null?'—':t>=3600?'>1 soat':t>=60?Math.floor(t/60)+' daq '+Math.round(t%60)+' s':Math.round(t)+' s';
function build(){
 const st=document.createElement('style');st.textContent=`#aiBox{display:grid;grid-template-columns:minmax(260px,1fr) minmax(300px,1.4fr);gap:14px;margin-bottom:14px}#aiBox .a-card{min-width:0}.ai-r{font:600 44px/1 Segoe UI,sans-serif;font-variant-numeric:tabular-nums}.ai-bar{height:12px;background:var(--pan2);border:1px solid var(--line);border-radius:7px;position:relative;margin:10px 0 4px;overflow:hidden}.ai-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px}.ai-bar u{position:absolute;top:0;bottom:0;width:1px;background:var(--mut)}.ai-sc{display:flex;justify-content:space-between;font-size:10px;color:var(--mut)}.ai-dg{display:flex;flex-direction:column;gap:8px}.ai-dg>div{display:grid;grid-template-columns:minmax(120px,1.3fr) 2fr 44px;gap:8px;align-items:center;font-size:12px}.ai-dg .tr{height:8px;background:var(--pan2);border-radius:5px;overflow:hidden}.ai-dg .tr i{display:block;height:100%;background:var(--acc)}.ai-tab{width:100%;border-collapse:collapse;font-size:12px}.ai-tab th,.ai-tab td{padding:5px 6px;border-bottom:1px solid var(--line);text-align:left;font-variant-numeric:tabular-nums}.ai-tab th{color:var(--mut);font-weight:500;font-size:11px}.ai-act{margin-top:10px;padding:9px 11px;border-left:3px solid var(--acc);background:var(--pan2);font-size:12px;border-radius:0 6px 6px 0}.ai-sp{width:100%;height:60px;display:block}.ai-wrap{overflow-x:auto}@media(max-width:900px){#aiBox{grid-template-columns:1fr}}#aiStrip{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:0 0 12px;padding:10px 14px;background:var(--pan);border:1px solid var(--line);border-radius:10px;font-size:12px}#aiStrip b{font-size:16px;font-variant-numeric:tabular-nums}#aiStrip .dot{width:10px;height:10px;border-radius:50%}`;document.head.appendChild(st);
 const panel=document.querySelector('[data-ap="ai"]');
 const box=document.createElement('div');box.id='aiBox';box.innerHTML=`<div class="a-card a-pad"><h2>AI xavf indeksi R</h2><div class="ai-r" id="aiR">0.00</div><div class="ai-bar"><i id="aiBarI"></i><u style="left:40%"></u><u style="left:70%"></u></div><div class="ai-sc"><span>0</span><span>0.40 ogohlantirish</span><span>0.70 xavfli</span><span>1</span></div><div style="margin-top:8px;font-size:13px"><b id="aiState">NORMAL</b> <span class="a-muted" id="aiScore"></span></div><svg class="ai-sp" id="aiSpark" viewBox="0 0 240 60" preserveAspectRatio="none"></svg><div class="a-muted" style="font-size:11px">So‘nggi 240 ta namuna · gorizontal chiziqlar: 0.40 va 0.70</div><h2 style="margin-top:14px">Nima g‘ayritabiiy</h2><div id="aiTop" style="font-size:12px"></div></div>
 <div class="a-card a-pad"><h2>Sabab tashxisi (ehtimollik)</h2><div class="ai-dg" id="aiDiag"></div><div class="ai-act" id="aiAct"></div><h2 style="margin-top:14px">Sath prognozi</h2><div class="ai-wrap"><table class="ai-tab"><thead><tr><th>Sath</th><th>Hozir</th><th>Tezlik</th><th>H gacha</th><th>HH gacha</th></tr></thead><tbody id="aiProg"></tbody></table></div></div>
 <div class="a-card a-pad" style="grid-column:1/-1"><h2>AI ishonchlilik sinovi</h2><p class="a-muted" style="margin:0 0 8px">Har bir nosozlik 60 s normal ishlagandan keyin kiritiladi va 700 s kuzatiladi: AI qachon ogohlantirdi, PLC alarmi qachon ishladi, tashxis to‘g‘ri chiqdimi. Normal rejimda yolg‘on signal ulushi ham o‘lchanadi. Cheklov: klapanlar oxirgi holatda qotganda (aktuator quvvati yo‘q) yoki gaz oshishi sarf bilan chegaralanganda jarayon o‘zgarmasa, AI ham o‘zgarish ko‘rmaydi.</p><button id="aiRun" class="asec">Sinovni ishga tushirish</button> <span id="aiRunInfo" class="a-muted"></span><div class="ai-wrap"><table class="ai-tab" id="aiLead" style="margin-top:8px"></table></div></div>`;
 panel.insertBefore(box,panel.firstChild);
 const strip=document.createElement('div');strip.id='aiStrip';strip.innerHTML='<span class="dot" id="aiSDot"></span><span>AI xavf indeksi <b id="aiSR">0.00</b></span><span id="aiSState"></span><span class="a-muted" id="aiSDiag"></span>';const om=document.querySelector('[data-ap="overview"]');om.insertBefore(strip,om.firstChild);
 $('aiRun').onclick=()=>{$('aiRun').disabled=true;$('aiRunInfo').textContent='Hisoblanmoqda…';setTimeout(()=>{try{const r=leadTest();window.AmineAI.lastTest=r;const F=window.AmineConfig.FAULTS;$('aiLead').innerHTML='<thead><tr><th>Nosozlik</th><th>AI ogohlantirdi</th><th>PLC alarmi</th><th>AI ustunligi</th><th>Tashxis aniqligi</th></tr></thead><tbody>'+r.rows.map(x=>`<tr><td>${esc(F[x.f])}</td><td>${x.ai==null?'—':x.ai.toFixed(0)+' s'}</td><td>${x.plc==null?'alarm yo‘q':x.plc.toFixed(0)+' s'}</td><td>${x.lead==null?(x.ai!=null&&x.plc==null?'AI aniqladi, PLC yo‘q':'—'):(x.lead>0?'+'+x.lead.toFixed(0)+' s oldin':x.lead.toFixed(0)+' s')}</td><td>${(x.diag*100).toFixed(0)}%</td></tr>`).join('')+`</tbody><tfoot><tr><td colspan="5" class="a-muted">Normal rejimda yolg‘on signal: ${(r.falseRate*100).toFixed(1)}% (${r.n} namuna). Natija o‘quv modeli ichida; real zavod tasdig‘i emas.</td></tr></tfoot>`;$('aiRunInfo').textContent=''}catch(e){$('aiRunInfo').textContent='Xato: '+e.message}$('aiRun').disabled=false},30)}}
function draw(){const L=live;if(!L.diag.length)return;const R=L.R,c=col(R);
 const sd=$('aiSDot');if(sd){sd.style.background=c;$('aiSR').textContent=R.toFixed(2);$('aiSState').textContent=L.state;$('aiSState').style.color=c;$('aiSDiag').textContent=L.state==='NORMAL'?'Anomaliya yo‘q':'Eng ehtimoliy sabab: '+HINT[L.diag[0].id].t+' ('+Math.round(L.diag[0].p*100)+'%)'}
 const panel=document.querySelector('[data-ap="ai"]');if(!panel||!panel.classList.contains('on'))return;
 $('aiR').textContent=R.toFixed(2);$('aiR').style.color=c;$('aiBarI').style.width=(R*100)+'%';$('aiBarI').style.background=c;$('aiState').textContent=L.state;$('aiState').style.color=c;$('aiScore').textContent='anomaliya bali '+L.score.toFixed(3)+' (chegara '+AI.warn.toFixed(3)+')';
 const pts=L.series.map((p,i,a)=>`${(i/Math.max(1,a.length-1))*240},${58-p[1]*56}`).join(' ');$('aiSpark').innerHTML=`<line x1="0" x2="240" y1="${58-.4*56}" y2="${58-.4*56}" stroke="var(--mut)" stroke-dasharray="3 3" stroke-width=".6"/><line x1="0" x2="240" y1="${58-.7*56}" y2="${58-.7*56}" stroke="var(--mut)" stroke-dasharray="3 3" stroke-width=".6"/><polyline fill="none" stroke="${c}" stroke-width="1.6" points="${pts}"/>`;
 $('aiTop').innerHTML=L.top.map(t=>`<div>${esc(FEAT_UZ[t.f]||t.f)}: <b>${t.x.toFixed(2)}</b> <span class="a-muted">(me’yordan ${t.z>0?'+':''}${t.z.toFixed(1)}σ)</span></div>`).join('');
 if(L.R<.4){$('aiDiag').innerHTML='<div class="a-muted" style="display:block">Anomaliya aniqlanmadi — sabab tashxisi faqat R ≥ 0.40 bo‘lganda ko‘rsatiladi.</div>';$('aiAct').innerHTML='Modelda faol nomutanosiblik yo‘q.';}else{const nd=L.diag.slice(0,3);$('aiDiag').innerHTML=nd.map(d=>`<div><span>${esc(HINT[d.id].t)}</span><span class="tr"><i style="width:${(d.p*100).toFixed(0)}%"></i></span><b>${Math.round(d.p*100)}%</b></div>`).join('');
 const h=HINT[nd[0].id];$('aiAct').innerHTML=nd[0].id==='normal'?'Modelda faol nomutanosiblik yo‘q.':`<b>${esc(h.t)}</b>${h.tag?' · '+esc(h.tag):''}<br>${esc(h.a)}`;}
 $('aiProg').innerHTML=L.prog.map(r=>r.v==null?`<tr><td>${esc(r.name)}</td><td colspan="4" class="a-muted">Signal sifati BAD — prognoz o‘chirilgan</td></tr>`:`<tr><td>${esc(r.name)}</td><td>${r.v.toFixed(1)} %</td><td>${r.rate>=0?'+':''}${(r.rate*60).toFixed(1)} %/min</td><td>${r.tH!=null?fmtT(r.tH):r.v>=r.H?'oshgan':'—'}</td><td>${r.tHH!=null?fmtT(r.tHH):r.v>=r.HH?'oshgan':'—'}</td></tr>`).join('')}
function init(){try{train();build();window.AmineAI={ready:true,live,evaluate,leadTest,features:FEATS,info:()=>({n:AI.n,base:AI.base,warn:AI.warn,top:AI.top}),simulate,diagnose:(z)=>diagnose(z),get ai(){return AI}};setInterval(()=>{try{evaluate();draw()}catch(e){console.error(e)}},500);evaluate();draw()}catch(e){console.error('AmineAI',e);window.AmineAI={ready:false,error:String(e)}}}
if(window.AmineModel&&window.AmineApp)setTimeout(init,60);else window.AmineAI={ready:false,error:'AmineApp topilmadi'};
})();
