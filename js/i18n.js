(()=>{'use strict';
// ===== Interfeys tili: UZ (asl) / RU / EN =====
// Ilova matnlari o'zbekcha yoziladi; bu modul DOM dagi matn tugunlari va title/aria-label/placeholder atributlarini
// lug'at (js/i18n-dict.js) bo'yicha tarjima qiladi. Teglar (⟨T⟩) va sonlar (⟨#⟩) normallashtiriladi, shuning uchun
// jonli qiymatlar o'zgarsa ham bitta yozuv ishlaydi. Anonimlashtirish (amine-tags.js) bilan birga ishlaydi.
const DICT=new Map();for(const [uz,ru,en] of (window.I18N_DICT||[]))DICT.set(uz,[ru,en]);
const TAG=/\b[A-Z]{1,5}-?\d[\dA-Z./-]*\b/g,NUM=/[-+−]?\d+(?:[.,]\d+)?/g,ATTR=['title','aria-label','placeholder'];
const WORDS={ru:[[/\bSovitgich\b/g,'Холодильник'],[/\bIdish\b/g,'Ёмкость'],[/\bQurilma\b/g,'Установка'],[/\bObyekt\b/g,'Объект']],en:[[/\bSovitgich\b/g,'Cooler'],[/\bIdish\b/g,'Vessel'],[/\bQurilma\b/g,'Unit'],[/\bObyekt\b/g,'Facility']]};
let LANG='uz';try{const v=localStorage.getItem('gplang');if(v==='ru'||v==='en')LANG=v}catch(e){}
function tr(text,lang=LANG){if(lang==='uz'||!text)return text;const m=text.match(/^(\s*)([\s\S]*?)(\s*)$/),core=m[2].replace(/\s+/g,' ');if(!core)return text;
  const tags=[],nums=[];let key=core.replace(TAG,t=>{tags.push(t);return '⟨T⟩'});key=key.replace(NUM,n=>{nums.push(n);return '⟨#⟩'});
  const hit=DICT.get(key);let out;
  if(hit){const i=lang==='ru'?0:1;let ti=0,ni=0;out=hit[i].replace(/⟨T⟩/g,()=>tags[ti++]??'').replace(/⟨#⟩/g,()=>nums[ni++]??'')}
  else{out=core;for(const [a,b] of WORDS[lang])out=out.replace(a,b);if(out===core)return text}
  return m[1]+out+m[3]}
const rec=new WeakMap();
function doText(n){const p=n.parentNode;if(!p||p.nodeName==='SCRIPT'||p.nodeName==='STYLE'||p.closest?.('[data-noi18n]'))return;const v=n.nodeValue;if(!v||!/[A-Za-zʻʼ‘’]/.test(v))return;
  const r=rec.get(n);if(r&&v===r.out)return;const src=v,out=tr(src);rec.set(n,{src,out});if(out!==v)n.nodeValue=out}
function doAttrs(e){if(!e.getAttribute)return;const m=e.__i18n||(e.__i18n={});for(const k of ATTR){const v=e.getAttribute(k);if(!v)continue;const r=m[k];if(r&&v===r.out)continue;const out=tr(v);m[k]={src:v,out};if(out!==v)e.setAttribute(k,out)}}
function walk(root){if(root.nodeType===3)return doText(root);if(root.nodeType!==1)return;doAttrs(root);const w=document.createTreeWalker(root,5);let n;while((n=w.nextNode())){if(n.nodeType===3)doText(n);else doAttrs(n)}}
// til almashganda: har bir tugunni asl manbasidan qayta tarjima qilish
function retranslate(root=document.body){const w=document.createTreeWalker(root,5);let n;while((n=w.nextNode())){if(n.nodeType===3){const r=rec.get(n);if(r){const out=tr(r.src);r.out=out;if(n.nodeValue!==out)n.nodeValue=out}else doText(n)}else if(n.__i18n){for(const k in n.__i18n){const r=n.__i18n[k],out=tr(r.src);r.out=out;n.setAttribute(k,out)}}else doAttrs(n)}}
const obs=new MutationObserver(rs=>{for(const r of rs){if(r.type==='childList'){for(const n of r.addedNodes)walk(n)}else if(r.type==='characterData')doText(r.target);else doAttrs(r.target)}});
function setLang(l){if(!['uz','ru','en'].includes(l))return;LANG=l;try{localStorage.setItem('gplang',l)}catch(e){}document.documentElement.lang=l;const s=document.getElementById('lang');if(s&&s.value!==l)s.value=l;
  retranslate();document.title=tr('DA-1701 Absorber AI — amin bilan gaz tozalash trenajyori');try{window.__PS?.refreshText?.()}catch(e){}window.dispatchEvent(new Event('langchange'))}
// 3D yozuvlari (kanvasda chiziladi) uchun: __PS.tx = anonim → tarjima
const hookPS=()=>{const P=window.__PS;if(P&&!P.__i18n){const f=P.tx;P.tx=s=>tr(f(s));P.__i18n=true}};hookPS();
window.I18N={tr:s=>tr(s),setLang,get lang(){return LANG},retranslate};window.tr=window.tr||(s=>tr(s));
const sel=document.getElementById('lang');if(sel){sel.value=LANG;sel.addEventListener('change',()=>setLang(sel.value))}
walk(document.body);obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});
if(LANG!=='uz')setLang(LANG);
})();
