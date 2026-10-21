(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),fract=v=>v-Math.floor(v);
const definitions=[
{id:'towerGas',flow:'gas',n:120,color:'#73d5ff',shape:'bubble',title:'Gaz — yuqoriga'},
{id:'towerLean',flow:'lean',n:150,color:'#54d8a1',shape:'drop',title:'Amin — pastga'},
{id:'towerWash',flow:'wash',n:62,color:'#b6a0ef',shape:'drop',title:'Yuvish kondensati'},
{id:'separatorGas',flow:'gas',n:64,color:'#73d5ff',shape:'bubble',title:'Separator gaz oqimi'},
{id:'separatorDrop',flow:'gas',n:58,color:'#c8b0fa',shape:'drop',title:'Ajralgan kondensat'},
...['a','b','c'].flatMap((k,i)=>[{id:'cooler'+i,flow:k,n:52,color:'#7fd5e8',shape:'streak',title:'Sovitgich gaz yo‘li'},{id:'coolant'+i,flow:'cw',n:38,color:'#678bff',shape:'bubble',title:'Sovitish muhiti'}])];
const rate=(s,k)=>k==='gas'?s.g:k==='cw'?(s.cwFlow??s.actual.cw):['a','b','c'].includes(k)?s.branches[['a','b','c'].indexOf(k)]*3:s[k]||0;
const clock=(s,k)=>s.transport?.[k]??s.t*rate(s,k)/100;
function point(d,i,s){const seed=fract(Math.sin(i*17.345+3.7)*43758.5453),a=fract(Math.sin(i*91.71+5.3)*12312.19)*Math.PI*2,p=clock(s,d.flow),u=fract(seed+p*(d.shape==='drop'?.19:.12)),r=Math.sqrt(fract(Math.sin(i*8.31+2.1)*49271.17)),w=Math.sin(a+p*.55)*.08;let x=0,y=0,z=0;
 switch(d.id){
 case 'towerGas':x=5+Math.cos(a)*r*1.25+w;y=4.25+u*12.2;z=Math.sin(a)*r*1.22;break;
 case 'towerLean':{const bottom=2.3+s.L*.034+.05;x=5+Math.cos(a)*r*1.3;y=12.05-u*(12.05-bottom);z=Math.sin(a)*r*1.3;break}
 case 'towerWash':x=5+Math.cos(a)*r*1.25;y=15.65-u*2.2;z=Math.sin(a)*r*1.25;break;
 case 'separatorGas':{const angle=a+u*2.4;x=-2.5+Math.cos(angle)*(.68-.4*u);y=5.1+u*2.15;z=2+Math.sin(angle)*(.68-.4*u);break}
 case 'separatorDrop':{const bottom=Math.min(5.1,2.1+s.K*.027+.1);x=-2.5+Math.cos(a)*r*.8;y=5.2-u*(5.2-bottom);z=2+Math.sin(a)*r*.8;break}
 default:{const j=+d.id.slice(-1),ty=[8.45,5.15,1.85][j];if(d.id.startsWith('cooler')){x=-13.4+u*4.8;y=ty+Math.sin(a)*r*.43;z=Math.cos(a)*r*.43}else{x=-8.6-u*4.8;y=ty+Math.cos(a+u*9)*.58;z=Math.sin(a+u*9)*.58}}
 }return {x,y,z,u,size:.72+fract(i*.431)*.56}}
function project(d,p){switch(d.id){case 'towerGas':case 'towerLean':return [1087+(p.x-5)*31,642-(p.y-4.25)*24.4];case 'towerWash':return [1087+(p.x-5)*31,334+(15.65-p.y)*18];case 'separatorGas':case 'separatorDrop':return [796+(p.x+2.5)*40,715-(p.y-1.8)*33.75];default:{const j=+d.id.slice(-1);return [390+(p.x+13.4)*21.5,397+j*163+(p.y-[8.45,5.15,1.85][j])*25]}}}
function svgLayer(d,s){const opacity=clamp(rate(s,d.flow)/45,0,1);return `<g data-process-layer="${d.id}" data-eq="${d.id.startsWith('tower')?'tower':d.id.startsWith('separator')?'sep':'cool'+d.id.slice(-1)}" opacity="${opacity}">${Array.from({length:d.n},(_,i)=>{let p=point(d,i,s),[x,y]=project(d,p);return `<ellipse data-process-particle="${d.id}" data-i="${i}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${d.shape==='drop'?1.15:d.shape==='streak'?2.6:1.7}" ry="${d.shape==='drop'?2.5:1.5}" fill="${d.color}" fill-opacity="${d.shape==='bubble'?.28:.78}" stroke="${d.color}" stroke-width="${d.shape==='bubble'?.7:.2}"/>`}).join('')}</g>`}
function animate(host,s){for(const group of host.querySelectorAll('[data-process-layer]')){const d=definitions.find(d=>d.id===group.dataset.processLayer);if(!d)continue;group.setAttribute('opacity',clamp(rate(s,d.flow)/45,0,1));for(const e of group.children){const p=point(d,+e.dataset.i,s),[x,y]=project(d,p);e.setAttribute('cx',x.toFixed(2));e.setAttribute('cy',y.toFixed(2))}}for(const e of host.querySelectorAll('[data-fluid-surface]')){let k=e.dataset.fluidSurface,p=clock(s,k==='L'?'rich':k==='K'?'drain':'water'),x=+e.dataset.x,y=+e.dataset.y,w=+e.dataset.w,amp=rate(s,k==='L'?'rich':k==='K'?'drain':'water')>.1?1.5:0;let path=`M${x} ${y}`;for(let i=1;i<=12;i++)path+=` L${x+i*w/12} ${y+Math.sin(i*.9+p*3)*amp}`;e.setAttribute('d',path)}}
window.AmineProcess={definitions,rate,clock,point,project,svgLayer,animate};
})();
