(()=>{'use strict';
// ===== SIS / ESD bo'limi: holat paneli, sabab–oqibat matritsasi, kanallar, XV klapanlar, bypass, RESET, SIL/PFD =====
if(!window.AmineApp||!window.AmineSIS)return;
const $=id=>document.getElementById(id),S=window.AmineSIS,App=window.AmineApp,M=()=>App.model;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f1=(v,d=1)=>v==null||!Number.isFinite(v)?'BAD':v.toFixed(d);
const ex=v=>v.toExponential(1).replace('e-','·10⁻').replace(/⁻(\d)/,(m,d)=>'⁻'+'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
const st=document.createElement('style');st.textContent=`
.s-banner{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:14px 16px;border-radius:10px;border:1px solid var(--line);background:var(--pan);margin-bottom:13px}
.s-banner.trip{border-color:#d9534f;background:linear-gradient(90deg,#d9534f22,transparent 70%)}.s-banner.warn{border-color:#d99a2b;background:linear-gradient(90deg,#d99a2b1c,transparent 70%)}
.s-lamp{width:16px;height:16px;border-radius:50%;background:#2c9e89;box-shadow:0 0 0 4px #2c9e8922}.trip .s-lamp{background:#d9534f;box-shadow:0 0 0 4px #d9534f33;animation:sBlink 1s steps(2) infinite}.warn .s-lamp{background:#d99a2b}
@keyframes sBlink{50%{opacity:.35}}.s-banner b{font-size:15px}.s-banner .grow{flex:1;min-width:200px}
.s-esd{background:#c62828!important;border-color:#c62828!important;color:#fff!important;font-weight:700;letter-spacing:.04em;border-radius:50px!important;padding:9px 18px!important}
.s-tab{width:100%;border-collapse:collapse;font-size:12px}.s-tab th{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);text-align:left;padding:7px 8px;border-bottom:1px solid var(--line);white-space:nowrap}
.s-tab td{padding:8px;border-bottom:1px solid var(--line);vertical-align:top}.s-tab tr.on td{background:#d9534f14}.s-tab tr.byp td{background:#d99a2b14}
.s-chip{display:inline-block;font:600 11px/1.2 Consolas,monospace;padding:3px 6px;border-radius:5px;margin:1px 3px 1px 0;border:1px solid var(--line);background:var(--pan2)}
.s-chip.act{background:#d9534f;border-color:#d9534f;color:#fff}.s-chip.bad{background:#e6b83a;border-color:#e6b83a;color:#111}
.s-state{font:700 11px Segoe UI;padding:3px 8px;border-radius:12px;white-space:nowrap}.s-ok{color:#2c9e89;background:#2c9e8918}.s-dem{color:#b9770e;background:#d99a2b22}.s-trip{color:#fff;background:#d9534f}.s-byp{color:#111;background:#e6b83a}
.s-xv{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}.s-xvc{border:1px solid var(--line);border-radius:9px;padding:10px 12px;background:var(--pan)}
.s-xvc b{font:600 13px Consolas,monospace}.s-bar{height:6px;border-radius:4px;background:var(--line);margin:8px 0 4px;overflow:hidden}.s-bar i{display:block;height:100%;background:#2c9e89;transition:width .3s}.s-xvc.cl .s-bar i{background:#d9534f}
.s-cem{border-collapse:collapse;font-size:11.5px;margin-top:6px}.s-cem th,.s-cem td{border:1px solid var(--line);padding:5px 7px;text-align:center}.s-cem th.r{text-align:left;font-weight:500}.s-cem td.x{color:#d9534f;font-weight:700}.s-cem tr.on th.r{color:#d9534f;font-weight:700}
.s-cem thead th{writing-mode:vertical-rl;transform:rotate(180deg);font:600 11px Consolas,monospace;padding:7px 4px}
.s-grid2{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,1fr);gap:13px;margin-top:13px}@media(max-width:1100px){.s-grid2{grid-template-columns:1fr}}
.s-haz{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.s-haz div{border:1px solid var(--line);border-radius:8px;padding:9px}.s-haz b{display:block;font-size:20px}.s-haz .on{border-color:#d9534f;color:#d9534f}
.s-chsel{display:flex;gap:8px;flex-wrap:wrap;align-items:end}.s-chsel select{min-width:130px}`;
document.head.appendChild(st);
const panel=document.createElement('div');panel.className='a-panel';panel.dataset.ap='sis';
panel.innerHTML=`<div class="s-banner" id="sBanner"><i class="s-lamp"></i><div class="grow"><b id="sHead">SIS normal</b><div class="a-muted" id="sSub"></div><div id="sMsg" style="font-size:12px;margin-top:3px" role="status"></div></div>
<button class="s-esd" id="sEsd" title="HS-17000 — ESD-1 qurilma izolyatsiyasi">⏻ ESD-1</button><button id="sReset" class="asec" title="HS-17001 — sabab yo‘qolgandan keyin">↺ SIS RESET</button></div>
<div class="a-card"><div class="a-toolbar"><b style="font-size:12.5px">Xavfsizlik funksiyalari (SIF) — sabab → mantiq → oqibat</b><span class="spacer"></span><span class="a-muted" id="sClock"></span></div><div style="overflow-x:auto"><table class="s-tab" id="sTab"></table></div></div>
<div class="a-card a-pad" style="margin-top:13px"><h2>Yakuniy elementlar — XV (fail-close, kuch yo‘qolsa yopiladi)</h2><div class="s-xv" id="sXv"></div></div>
<div class="s-grid2"><div class="a-card a-pad"><h2>Sabab–oqibat matritsasi (C&amp;E)</h2><div style="overflow-x:auto" id="sCem"></div>
<p class="a-muted">● — sabab faollashganda klapan yopiladi. Qizil qator — trip holatida. RESET faqat sabab yo‘qolgandan keyin qabul qilinadi (latch).</p></div>
<div class="a-card a-pad"><h2>Xavfli oqibatlar hisobi</h2><div class="s-haz" id="sHaz"></div><p class="a-muted">SIS to‘g‘ri ishlasa bu hisoblagichlar nolda qoladi. SIF bypass qilinganda (masalan, SIF-01) LC17003 ochiq qotsa, gaz blow-by sodir bo‘lishini ko‘rasiz.</p>
<h2 style="margin-top:14px">Kanalni sinash (nosozlik kiritish)</h2><div class="s-chsel"><label>Kanal<select id="sCh"></select></label><label>Holat<select id="sChMode"><option value="ok">Soz</option><option value="bad">Signal yo‘q (BAD)</option><option value="stuck">Qotib qolgan</option><option value="low">0 ga tushgan</option><option value="high">Maksimumda</option></select></label><button id="sChApply" class="asec">Qo‘llash</button></div>
<p class="a-muted">BAD kanal fail-safe — “faol” deb hisoblanadi: 2oo3 bitta BAD kanal bilan 1oo2 ga o‘tadi, ikkita BAD — trip.</p></div></div>
<div class="a-card a-pad" style="margin-top:13px"><h2>Ishonchlilik: PFDavg va SIL (IEC 61508, soddalashtirilgan)</h2><div style="overflow-x:auto"><table class="s-tab" id="sSil"></table></div>
<p class="a-muted">λ<sub>DU</sub>: uzatgich ${ex(S.REL.sensor.lambdaDU)} 1/soat, XV ${ex(S.REL.xv.lambdaDU)} 1/soat, logika PFD ${ex(S.REL.logic.pfd)}, sinov oralig‘i ${S.REL.TI} soat, β = ${S.REL.beta}. 1oo2: (1−β)(λT)²/3 + βλT/2; 2oo3: (1−β)(λT)² + βλT/2; 1oo1: λT/2. Qiymatlar taxminiy — haqiqiy SIL verifikatsiyasi ishlab chiqaruvchi ma’lumotlari bilan bajariladi.</p>
<p class="a-muted"><b>Asos:</b> P&amp;ID E 10162-10705B-11 — LC17003 (ZSL/ZSC “CLOSE”), LG 17054 A/B, FA-1702 LC17001 (ZSL “CLOSE”), PSV-1702A…E 4370 kPag, 16-izoh (kalitli blokirovka). XV17001…XV17006 va LT17054A/B/C, LT17005A/B, PT17012A/B/C teglari chizmada yo‘q — o‘quv maqsadida qabul qilingan faraz.</p></div>`;
document.querySelector('#aApp [data-ap="settings"]').before(panel);
// kanal ro'yxati
$('sCh').innerHTML=Object.entries(S.SENSORS).flatMap(([id,d])=>d.ch.map(c=>`<option value="${id}${c}">${id}${c} — ${esc(d.title)}</option>`)).join('');
const replaying=()=>App.replaying();
$('sEsd').onclick=()=>{if(replaying())return;M().sisESD();draw()};
$('sReset').onclick=()=>{if(replaying())return;const r=M().sisReset();$('sMsg').style.color=r.still.length?'#d9534f':'';$('sMsg').textContent=r.still.length?'RESET rad etildi: sabab hali bor — '+r.still.join(', '):r.ok.length?'Tiklandi: '+r.ok.join(', '):'Faol trip yo‘q';draw()};
$('sChApply').onclick=()=>{if(replaying())return;M().sisChannel($('sCh').value,$('sChMode').value);draw()};
panel.addEventListener('change',e=>{const b=e.target.closest('[data-byp]');if(b&&!replaying()){M().sisBypass(b.dataset.byp,b.checked);draw()}});
function draw(){if(!panel.classList.contains('on'))return;const m=M(),sis=m.sis,live=!replaying(),snap=App.state(),arc=snap.sis||sis.snapshot();
  const trip=live?sis.tripped():arc.trip,byp=live?S.SIF.filter(f=>sis.state[f.id].bypass).map(f=>f.id):arc.bypass,esd=live?sis.esdActive():arc.esd,first=live?sis.firstOut:arc.first;
  const b=$('sBanner');b.className='s-banner'+(trip.length?' trip':byp.length?' warn':'');
  $('sHead').textContent=esd?'ESD-1 FAOL — qurilma izolyatsiya qilingan':trip.length?'SIS TRIP: '+trip.join(', '):byp.length?'SIS normal — BYPASS faol: '+byp.join(', '):'SIS normal — barcha himoyalar faol';
  $('sSub').textContent=(first?'Birinchi sabab (first-out): '+first+' · ':'')+(live?'Jonli model':'Arxiv holati (faqat ko‘rish)');
  $('sEsd').disabled=!live;$('sReset').disabled=!live;$('sChApply').disabled=!live;$('sClock').textContent='t = '+snap.t.toFixed(1)+' s';
  const xv=live?sis.xv:arc.xv;
  $('sTab').innerHTML='<tr><th>SIF</th><th>Sabab (kirish)</th><th>Kanallar</th><th>Mantiq</th><th>Holat</th><th>Oqibat</th><th>Javob</th><th>Bypass</th></tr>'+S.SIF.map(f=>{
    const x=sis.state[f.id],on=trip.includes(f.id),bp=byp.includes(f.id),dem=live?x.demand:(arc.demand||[]).includes(f.id);
    const chips=f.manual?`<span class="s-chip ${(live?sis.esdPB:on)?'act':''}">HS-17000</span>`:live?S.SENSORS[f.sensor].ch.map((c,i)=>{const v=x.vals?.[i];return `<span class="s-chip ${v==null?'bad':x.ch?.[i]?'act':''}">${f.sensor}${c} ${f1(v,f.sensor==='PT17012'?0:1)}</span>`}).join(''):'<span class="a-muted">arxivda kanal qiymatlari saqlanmaydi</span>';
    const sp=f.manual?'qo‘lda':`${f.dir==='high'?'≥':'≤'} ${f.setVal??m.settings[f.set]} ${S.SENSORS[f.sensor].unit}`;
    const state=bp?'<span class="s-state s-byp">BYPASS</span>':on?'<span class="s-state s-trip">TRIP</span>':dem?'<span class="s-state s-dem">TALAB</span>':'<span class="s-state s-ok">NORMAL</span>';
    const resp=live&&x.t!=null?(x.closedAt!=null?(x.closedAt-x.t).toFixed(1)+' s':'yopilmoqda…'):'—';
    return `<tr class="${on?'on':bp?'byp':''}"><td><b>${f.id}</b><br><span class="a-muted">${f.tag}${f.sil?' · SIL '+f.sil:''}</span>${first===f.id?'<br><span class="s-state s-trip">FIRST-OUT</span>':''}</td><td>${esc(f.cause)}</td><td>${chips}</td><td>${f.vote||'1oo1'}<br><span class="a-muted">${sp}${f.delay?' · '+f.delay+' s':''}</span></td><td>${state}</td><td>${esc(f.effect)}<br><span class="a-muted">${f.xv.join(', ')}</span></td><td>${resp}</td><td>${f.manual?'—':`<label class="a-muted" style="display:flex;gap:5px;align-items:center;margin:0"><input type="checkbox" data-byp="${f.id}" ${bp?'checked':''} ${live?'':'disabled'} style="width:auto"> ${bp&&live?(x.bypassT/60).toFixed(1)+' min':''}</label>`}</td></tr>`}).join('');
  $('sXv').innerHTML=Object.entries(S.XV).map(([k,d])=>{const v=xv[k]??100,cl=v<99.5;return `<div class="s-xvc ${cl?'cl':''}"><b>${k}</b> <span class="s-state ${v<=0?'s-trip':cl?'s-dem':'s-ok'}">${v<=0?'YOPIQ':v>=100?'OCHIQ':v.toFixed(0)+' %'}</span><div class="s-bar"><i style="width:${v}%"></i></div><span class="a-muted">${esc(d.title)} · yurish ${d.stroke} s</span></div>`}).join('');
  const xs=Object.keys(S.XV);
  $('sCem').innerHTML=`<table class="s-cem"><thead><tr><th style="writing-mode:horizontal-tb;transform:none">Sabab \\ Oqibat</th>${xs.map(k=>`<th>${k}</th>`).join('')}</tr></thead><tbody>${S.SIF.map(f=>`<tr class="${trip.includes(f.id)?'on':''}"><th class="r">${f.id} · ${f.tag}</th>${xs.map(k=>`<td class="${f.xv.includes(k)?'x':''}">${f.xv.includes(k)?'●':''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const bb=live?sis.blowby:arc.blowby,cr=live?sis.carry:arc.carry,bd=live?sis.blowbyDrain:0;
  $('sHaz').innerHTML=[['Blow-by → FA-1705',bb],['Gaz → FA-6908',bd],['Amin → EA-1821',cr]].map(([n,v])=>`<div class="${v>0?'on':''}"><span class="a-muted">${n}</span><b>${(v||0).toFixed(0)} s</b></div>`).join('')}
$('sSil').innerHTML='<tr><th>SIF</th><th>Ovoz berish</th><th>PFD uzatgich</th><th>PFD logika</th><th>PFD XV</th><th>PFDavg</th><th>Erishilgan SIL</th><th>Talab</th></tr>'+S.SIF.filter(f=>!f.manual).map(f=>{const p=S.pfd(f);return `<tr><td><b>${f.id}</b> ${f.tag}</td><td>${f.vote}</td><td>${ex(p.sensor)}</td><td>${ex(p.logic)}</td><td>${ex(p.final)}</td><td><b>${ex(p.total)}</b></td><td><span class="s-state ${p.sil>=f.sil?'s-ok':'s-trip'}">SIL ${p.sil}</span></td><td>SIL ${f.sil}</td></tr>`}).join('');
setInterval(()=>{try{draw()}catch(e){console.error('SIS UI',e)}},400);
new MutationObserver(draw).observe(panel,{attributes:true,attributeFilter:['class']});
window.AmineSISUI={draw};
})();
