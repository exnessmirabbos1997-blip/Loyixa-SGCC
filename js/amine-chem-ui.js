(()=>{'use strict';
// ===== Kimyoviy model: "Matematik model" bo'limidagi tenglamalar va "Boshqaruv va sozlamalar" dagi parametrlar kartasi =====
if(!window.AmineApp||!window.AmineChem)return;
const $=id=>document.getElementById(id),M=()=>window.AmineApp.model,D=window.AmineChem.DEF,KEY='gp1701-chem';
const FIELDS=[['yCO2','Xom gazda CO₂, mol %',.1,15,.1],['yH2S','Xom gazda H₂S, mol %',0,2,.01],['wt','MDEA ulushi, mas. %',20,60,1],['TL','To‘yinmagan amin harorati, °C',30,70,.1],
 ['aLeanCO2','To‘yinmagan amin CO₂ yuklanishi, mol/mol',0,.2,.001],['aLeanH2S','To‘yinmagan amin H₂S yuklanishi, mol/mol',0,.1,.001],['NTUco2','CO₂ NTU (kalibrovka)',.5,10,.01],['NTUh2s','H₂S NTU (kalibrovka)',.5,15,.01],
 ['co2H','CO₂ chegarasi H, ppmv',10,50000,10],['co2HH','CO₂ chegarasi HH, ppmv',10,50000,10],['h2sH','H₂S chegarasi H, ppmv',.1,500,.1],['h2sHH','H₂S chegarasi HH, ppmv',.1,500,.1],['aH','Yuklanish chegarasi H, mol/mol',.2,.6,.01],['aHH','Yuklanish chegarasi HH, mol/mol',.2,.6,.01]];
const card=document.createElement('div');card.className='a-card a-pad';card.style.marginTop='13px';
card.innerHTML=`<h2>Kimyoviy model va gaz sifati</h2><p class="a-muted">Taxminiy o‘quv parametrlari. Haqiqiy qiymatlar texnologik reglament va laboratoriya tahlillaridan olinadi. “Qo‘llash” jonli modelga va raqamli egizakka darhol ta’sir qiladi.</p>
<div class="a-chemgrid">${FIELDS.map(([k,l,mn,mx,st])=>`<label>${l}<input id="ch-${k}" type="number" min="${mn}" max="${mx}" step="${st}"></label>`).join('')}</div>
<div class="a-row" style="margin-top:10px"><button id="chApply">Qo‘llash</button><button id="chDefault" class="asec">Standart qiymatlar</button><span id="chMsg" class="a-muted" role="status"></span></div>`;
const st=document.createElement('style');st.textContent='.a-chemgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px 14px;margin-top:10px}.a-chemgrid label{font-size:11.5px;color:var(--mut);margin:0}.a-chemgrid input{width:100%;margin-top:3px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--pan);color:var(--ink)}.a-calib{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}.a-calib td,.a-calib th{border-bottom:1px solid var(--line);padding:5px 6px;text-align:left}.a-calib td:nth-child(n+2),.a-calib th:nth-child(n+2){text-align:right;font-variant-numeric:tabular-nums}';
document.head.appendChild(st);
document.querySelector('#aApp [data-ap="settings"]').appendChild(card);
const fill=p=>FIELDS.forEach(([k])=>$('ch-'+k).value=p[k]);
const read=()=>{const p={};for(const [k,l,mn,mx] of FIELDS){const v=parseFloat($('ch-'+k).value);if(!Number.isFinite(v)||v<mn||v>mx)throw Error(l+': '+mn+' … '+mx+' oralig‘ida bo‘lishi kerak');p[k]=v}
  if(p.co2H>=p.co2HH||p.h2sH>=p.h2sHH||p.aH>=p.aHH)throw Error('H chegarasi HH dan kichik bo‘lishi kerak');return p};
const say=(t,bad)=>{$('chMsg').textContent=t;$('chMsg').style.color=bad?'var(--trip,#d9534f)':''};
$('chApply').onclick=()=>{try{const p=read();M().setChem(p);try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}say('Qo‘llandi.')}catch(e){say(e.message,true)}};
$('chDefault').onclick=()=>{const p={};FIELDS.forEach(([k])=>p[k]=D[k]);fill(p);M().setChem(p);try{localStorage.removeItem(KEY)}catch(e){}say('Standart qiymatlar tiklandi.')};
let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
if(saved&&typeof saved==='object'){const p={};for(const [k,,mn,mx] of FIELDS)if(Number.isFinite(saved[k])&&saved[k]>=mn&&saved[k]<=mx)p[k]=saved[k];if(Object.keys(p).length)M().setChem(p)}
fill({...D,...(M().chemPar||{})});

// Matematik model: kimyoviy qism va kalibrovka jadvali
const mc=document.createElement('div');mc.className='a-card a-pad';mc.style.marginTop='13px';
const c=new window.AmineChem();for(let i=0;i<3000;i++)c.step({g:100,lean:100,Ti:30.92,fault:'normal'},.2);const x=c.snapshot('normal');
mc.innerHTML=`<h2>Kimyoviy tozalash: CO₂ va H₂S ning aminga yutilishi</h2>
<p>Har bir kislotali komponent uchun absorber samaradorligi o‘tkazish birliklari soni (NTU) orqali hisoblanadi. NTU harorat, suyuqlik/gaz nisbati va to‘yingan amin yuklanishiga bog‘liq; to‘yingan yuklanish α moddiy balans bilan birgalikda (ikkiga bo‘lish usulida) yechiladi.</p>
<code>G = Q<sub>g</sub>/22,414 (kmol/soat), L<sub>am</sub> = Q<sub>L</sub>·w·ρ/M<sub>MDEA</sub> (kmol/soat)<br>
NTU<sub>j</sub> = NTU<sub>j,nom</sub> · f<sub>T</sub>(T)/f<sub>T,nom</sub> · ((L/G)/(L/G)<sub>nom</sub>)<sup>0,35</sup> · (1 − α/α<sub>max</sub>)<sup>1,5</sup>/(…)<sub>nom</sub><br>
E<sub>j</sub> = 1 − exp(−NTU<sub>j</sub>), y<sub>j,chiq</sub> = max(y<sub>j,kir</sub>·(1 − E<sub>j</sub>), y<sub>j,muv</sub>(α<sub>lean</sub>))<br>
α = α<sub>lean</sub> + G·Σ(y<sub>j,kir</sub> − y<sub>j,chiq</sub>)/L<sub>am</sub><br>
f<sub>T,CO₂</sub> = e<sup>0,025(T−50)</sup>/(1 + e<sup>(T−70)/4</sup>) (kinetika ↑, muvozanat ↓), f<sub>T,H₂S</sub> = 1/(1 + e<sup>(T−75)/5</sup>)</code>
<h2>Issiqlik balansi</h2>
<code>Q<sub>abs</sub> = n<sub>CO₂</sub>·ΔH<sub>CO₂</sub> + n<sub>H₂S</sub>·ΔH<sub>H₂S</sub> (ΔH = ${D.dHCO2} va ${D.dHH2S} MJ/kmol)<br>
TI17005 = TI17007 + ε·(T<sub>L</sub> + Δ − TI17007), ε = min(1, 1,6/(R/R<sub>nom</sub> + 0,6)), R = G·c<sub>p,g</sub>/(m<sub>L</sub>·c<sub>p,L</sub>)<br>
TI17006 = T<sub>L</sub> + (Q<sub>abs</sub> − G·c<sub>p,g</sub>·(TI17005 − TI17007))/(m<sub>L</sub>·c<sub>p,L</sub>)</code>
<h2>Dinamika va analizator</h2>
<p>Tarkib τ = 45 s, yuklanish τ = 120 s (suyuqlik zaxirasi), harorat τ = 24–28 s inersiya bilan o‘zgaradi. AI17001 analizatori ${D.anaDead} s kechikish (namuna liniyasi) va τ = ${D.anaTau} s inersiyaga ega. Raqamli egizak — xuddi shu model, lekin faqat o‘lchangan sarflar va haroratlar bilan, nosozliksiz ishlaydi; AI17001 o‘lchovi bilan farqi kimyoviy nosozliklarni (regeneratsiya, suyulish, ko‘piklanish, xom gaz tarkibi) erta aniqlaydi.</p>
<h2>Kalibrovka (nominal nuqta)</h2>
<table class="a-calib"><tr><th>Ko‘rsatkich</th><th>DCS ekrani</th><th>Model</th></tr>
<tr><td>FC17001 — gaz, ming nm³/soat</td><td>380,7</td><td>${D.Qg}</td></tr>
<tr><td>FC17002 — to‘yinmagan amin, m³/soat</td><td>504,7</td><td>${D.QL}</td></tr>
<tr><td>TI17005 — tozalangan gaz, °C</td><td>56,5</td><td>${c.x.To.toFixed(1)}</td></tr>
<tr><td>TI17006 — to‘yingan amin, °C</td><td>60,6</td><td>${c.x.Tr.toFixed(1)}</td></tr>
<tr><td>AI17001 — tozalangan gaz (CO₂ deb qabul qilingan), ppmv</td><td>560,62</td><td>${x.co2.toFixed(1)}</td></tr>
<tr><td>To‘yingan amin yuklanishi, mol/mol</td><td>—</td><td>${x.a.toFixed(3)}</td></tr>
<tr><td>Yutilish issiqligi, MW</td><td>—</td><td>${x.Q.toFixed(2)}</td></tr></table>
<p class="a-muted">Faraz: xom gazda CO₂ ${D.yCO2} mol %, H₂S ${D.yH2S} mol %, MDEA ${D.wt} %. AI17001 ning o‘lchov komponenti va birligi texnolog bilan tasdiqlanishi kerak (ekranda AA17001X = CAL).</p>`;
document.querySelector('#aApp [data-ap="math"]').appendChild(mc);
})();
