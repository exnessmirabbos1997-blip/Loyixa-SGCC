(()=>{'use strict';
// DCS operator ekraniga moslash: mnemosxemaga DCS teglari qo'shiladi, TI17008 -> TI17006 tuzatiladi, solishtirish jadvali.
// Asl mnemosxema chizmasi o'zgarmaydi: faqat qo'shimcha qatlam.
if(!window.AmineMimic||!window.AmineApp)return;
let REF_TIME='';
// DCS ekranidan o'qilgan qiymatlar (foydalanuvchi fotosurati). m — modeldagi mos maydon yoki null.
const GET={'TI17005':s=>s.To,'TI17006':s=>s.Tr,'TI17007':s=>s.Ti,'PDI17010':s=>s.dp,'PI17012':s=>s.press,'LC17002':s=>s.W,'LC17003':s=>s.measured.L,'LC17001':s=>s.K,'PY17001A':s=>s.command.a,'PY17001B':s=>s.command.b,'PY17001C':s=>s.command.c,'PV17001A':s=>s.actual.a,'PV17001B':s=>s.actual.b,'PV17001C':s=>s.actual.c,'FC17001 klapan':s=>s.actual.out,'FC17003 klapan':s=>s.actual.wash,'LC17002 klapan':s=>s.actual.water,'LC17003 klapan':s=>s.actual.rich,'LC17001 klapan':s=>s.actual.drain,'TC17001 klapan':s=>s.actual.cw};
const REF=[];
window.GP&&window.GP.hook(d=>{REF.length=0;if(d)REF.push(...d.ref.map(r=>({...r,v:r.v==="NaN"?NaN:r.v,m:GET[r.id]||null})));REF_TIME=d?d.time:''});
const fmt=(v,d)=>Number.isFinite(v)?v.toFixed(d??1):'NaN';
// Mnemosxemaga qo'shiladigan DCS teglari (viewBox 1500x910). dyn — modeldan jonli, aks holda DCS qiymati (statik).
const EXTRA=[
 {id:'PY17001A',x:300,y:316,dyn:s=>[fmt(s.command.a,2),'%']},{id:'PY17001B',x:296,y:478,dyn:s=>[fmt(s.command.b,2),'%']},{id:'PY17001C',x:290,y:636,dyn:s=>[fmt(s.command.c,2),'%']},
 {id:'TI17020',x:412,y:466},{id:'TI17021',x:412,y:626},
 {id:'PC17001',x:620,y:590},{id:'PI17007',x:620,y:630},
 {id:'LT17005',x:858,y:650},{id:'PDI17010A',x:1210,y:518},{id:'AI17001',x:1176,y:118},
 {id:'FQI17001',x:25,y:560},{id:'TI82001',x:25,y:610},{id:'TI81010',x:25,y:660}
];
function extraSvg(s){if(!(window.GP&&window.GP.real))return '';const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 return '<g class="a-dcs" pointer-events="none">'+EXTRA.map(e=>{const r=REF.find(q=>q.id===e.id);const dyn=e.dyn?e.dyn(s):null;const val=dyn?dyn[0]:(Number.isInteger(r.v)?r.v.toFixed(0):fmt(r.v,2));const u=dyn?dyn[1]:r.u;
  return `<g transform="translate(${e.x} ${e.y})"><title>${esc(e.id)} — ${dyn?'model (jonli)':'DCS ekran qiymati '+REF_TIME}</title><rect width="112" height="37" rx="5" fill="#0b2030" stroke="${dyn?'#3d617c':'#6d8196'}" stroke-width="1.2" ${dyn?'':'stroke-dasharray="4 3"'}/><text x="8" y="14" fill="#97b5ca" font-size="10.5" font-weight="600" font-family="Segoe UI,Arial">${esc(e.id)}${dyn?'':' · DCS'}</text><text x="8" y="31" fill="${dyn?'#7dd5ff':'#b9c8d6'}" font-size="15" font-weight="600" font-family="Segoe UI,Arial">${esc(val)}</text><text x="${8+String(val).length*8.6}" y="31" fill="#aec2d0" font-size="10" font-family="Segoe UI,Arial">${esc(u)}</text></g>`}).join('')+'</g>'}
const orig=window.AmineMimic;
window.AmineMimic=function(s,o){let h=orig.call(this,s,o);h=h.replace(/TI17008/g,'TI17006');if(!(o&&o.noDcs)){const i=h.lastIndexOf('</svg>');if(i>0)h=h.slice(0,i)+extraSvg(s)+h.slice(i)}return h};
// ---- Solishtirish jadvali ----
function build(){const dp=document.querySelector('[data-ap="data"]');if(!dp)return;const c=document.createElement('div');c.className='a-card a-pad gp-card gp-dcs';c.style.marginTop='14px';c.innerHTML=`<h2>DCS ekrani bilan solishtirish</h2><p class="a-muted" style="margin-top:0">Qiymatlar operator ekranining fotosuratidan  o‘qilgan. Model — jonli qiymat. Mnemosxemadagi punktir ramkali teglar — DCS qiymati (modelda hisoblanmaydi). Sath/harorat/bosim farqi — o‘quv modeli real jarayonni to‘liq aks ettirmasligi belgisi.</p><div class="gp-b"><button id="dcsApply">Modelni DCS holatiga o‘rnatish</button><button id="dcsFault" class="asec">LC17003 NaN holatini yoqish</button></div><p class="gp-m" id="dcsMsg" role="status"></p><div class="gp-sc"><table class="gp-t"><thead><tr><th>Teg</th><th>Ma’nosi</th><th>DCS</th><th>Model</th><th>Farq</th></tr></thead><tbody id="dcsTab"></tbody></table></div>`;dp.appendChild(c);
 $('dcsApply').onclick=()=>{const m=window.AmineApp.model,s=m.s;s.To=56.5;s.Tr=60.6;s.Ti=30.92;s.dp=.94;s.press=3718;s.W=16.8;m.command.a=m.command.b=m.command.c=68.62;m.command.out=55;m.command.wash=49;m.command.water=10;m.command.rich=26;m.actual.a=m.actual.b=m.actual.c=68.62;m.actual.out=55;m.actual.wash=49;m.actual.water=10;m.actual.rich=26;m.checkAlarms();$('dcsMsg').textContent='Modelning harorat, bosim, yuvish sathi va klapanlari DCS qiymatlariga o‘rnatildi (LC17001 manfiy qiymati modelda 0 dan past bo‘la olmaydi, o‘zgartirilmadi).'};
 $('dcsFault').onclick=()=>{window.AmineApp.model.setFault('sensor');$('dcsMsg').textContent='Ssenariy: LC17003 signali yo‘qolishi (DCS’dagi NaN holati). AI va alarmlar shu holatni ko‘rsatadi.'};
 setInterval(()=>{const p=document.querySelector('[data-ap="data"]');if(p&&p.classList.contains('on'))draw()},1000);draw()}
const $=id=>document.getElementById(id);
function draw(){const s=window.AmineApp.state();$('dcsTab').innerHTML=REF.map(r=>{const mv=r.m?r.m(s):null;const has=r.m!=null;const dv=has&&mv!=null&&Number.isFinite(mv)&&Number.isFinite(r.v)?mv-r.v:null;const bad=dv!=null&&Math.abs(dv)>Math.max(.05*Math.abs(r.v),.5);return `<tr><td><b>${r.id}</b></td><td>${r.t}</td><td>${fmt(r.v,r.d??2)} ${r.u}</td><td>${has?fmt(mv,r.d??1)+' '+r.u:'<span class="a-muted">modelda yo‘q</span>'}</td><td style="color:${bad?'var(--warn,#bc7919)':'inherit'}">${dv==null?(has&&mv==null?'NaN (mos)':'—'):(dv>=0?'+':'')+dv.toFixed(r.d??1)}</td></tr>`}).join('')}
window.AmineScreen={REF,extraSvg,ready:true};
build();
})();
