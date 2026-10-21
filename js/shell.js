// ===== Ilova qobig'i: bo'limlar navigatsiyasi (#hash), kun/tun mavzusi. Asosiy ilova (amine-app.js) showView ni o'z navigatsiyasi bilan almashtiradi =====
const $=id=>document.getElementById(id);
(()=>{let t=null;try{t=localStorage.getItem('gptheme')}catch(e){}if(t===null&&window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)t='light';if(t==='light')document.documentElement.dataset.theme='light'})();
function showView(v){document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('on',b.dataset.view===v))}
document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b||!b.matches('.nav,.mn'))return;showView(b.dataset.view);if(history.replaceState)history.replaceState(null,'','#'+b.dataset.view);window.scrollTo({top:0})});
$('theme').addEventListener('click',()=>{const r=document.documentElement;r.dataset.theme=r.dataset.theme==='light'?'':'light';try{localStorage.setItem('gptheme',r.dataset.theme==='light'?'light':'dark')}catch(e){}window.dispatchEvent(new Event('themechange'))});
