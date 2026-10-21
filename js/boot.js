// Boshlang'ich bo'lim: manzildagi #hash bo'yicha
(()=>{const v=(location.hash||'').slice(1);if(v&&document.querySelector(`.nav[data-view="${v}"]`))showView(v)})();
