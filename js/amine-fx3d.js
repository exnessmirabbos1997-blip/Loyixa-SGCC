(()=>{'use strict';
// ===== 3D effektlar va atrof-muhit: avariya ssenariylari (yong'in, amin oqishi, ko'piklanish, blow-by → mash'al, PSV chiqishi, suv purkash),
// ob-havo (yomg'ir, qor, bulutli osmon, ho'l / qorli zamin), dalada yuruvchi operatorlar, o't o'chirish mashinasi, patrul avtomobili, shamol yengi, xavf belgilari.
// Effektlar holati P.fx (0…1 maqsad qiymatlari) orqali boshqariladi — mantiq amine-train.js da; bu fayl faqat ko'rinishni chizadi.
const PS=window.__PS;if(!PS||!PS.PlantScene)return;const {T,rnd}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype;
const WIND=new V3(1,0,.35).normalize(),SEP=[-2.5,2],LEAK=[15.4,8.7,-7.2],FIRE=[-2.5,.4,2.6];
const tex=(()=>{const c={};return(k,f)=>c[k]||(c[k]=f())})();
const softTex=(r,g,b)=>PS.canvasTex(64,64,x=>{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,`rgba(${r},${g},${b},1)`);gr.addColorStop(.5,`rgba(${r},${g},${b},.45)`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`);x.fillStyle=gr;x.fillRect(0,0,64,64)},[1,1]);
// ---- zarrachalar tizimi (Points): joy, tezlik, umr; o'lgan zarracha ko'rinmas joyga olib qo'yiladi ----
class Parts{constructor(scene,n,o){this.n=n;this.p=new Float32Array(n*3).fill(-9999);this.v=new Float32Array(n*3);this.life=new Float32Array(n);this.age=new Float32Array(n).fill(1e9);this.g=o.grav||0;this.drag=o.drag||0;this.rise=o.rise||0;
  const g=new T.BufferGeometry();this.attr=new T.BufferAttribute(this.p,3);this.attr.setUsage(T.DynamicDrawUsage);g.setAttribute('position',this.attr);
  this.mat=new T.PointsMaterial({map:o.map,size:o.size,color:o.color,transparent:true,opacity:o.opacity??1,depthWrite:false,blending:o.add?T.AdditiveBlending:T.NormalBlending,sizeAttenuation:true});
  this.pts=new T.Points(g,this.mat);this.pts.frustumCulled=false;this.pts.visible=false;this.pts.renderOrder=6;scene.add(this.pts);this.acc=0;this.next=0;this.alive=0}
 step(dt,rate,spawn){this.acc+=rate*dt;let k=0;while(this.acc>=1&&k<400){this.acc--;k++;const i=this.next;this.next=(this.next+1)%this.n;const s=spawn();this.p[i*3]=s[0];this.p[i*3+1]=s[1];this.p[i*3+2]=s[2];this.v[i*3]=s[3];this.v[i*3+1]=s[4];this.v[i*3+2]=s[5];this.life[i]=s[6];this.age[i]=0}
  let alive=0;const d=Math.exp(-this.drag*dt);for(let i=0;i<this.n;i++){if(this.age[i]>=this.life[i]){if(this.p[i*3+1]>-9000)this.p[i*3+1]=-9999;continue}alive++;this.age[i]+=dt;const j=i*3;
   this.v[j]=this.v[j]*d+WIND.x*this.rise*dt;this.v[j+1]=this.v[j+1]*d-this.g*dt+this.rise*.6*dt;this.v[j+2]=this.v[j+2]*d+WIND.z*this.rise*dt;this.p[j]+=this.v[j]*dt;this.p[j+1]+=this.v[j+1]*dt;this.p[j+2]+=this.v[j+2]*dt}
  this.alive=alive;this.pts.visible=alive>0;if(alive)this.attr.needsUpdate=true}}
const R=rnd(404),rr=(a,b)=>a+R()*(b-a);
// ---- kichik modellar: dala operatori (kaska, jilet), o't o'chirish mashinasi, pikap, shamol yengi ----
function fieldWorker(vest){const g=new T.Group(),M=c=>new T.MeshStandardMaterial({color:c,roughness:.75}),cl=M(0x1d2b45),sk=M(0xc99a78),hv=M(vest),hl=M(0xf3f3ee),refl=new T.MeshStandardMaterial({color:0xe8ecef,metalness:.6,roughness:.3,emissive:0x303438});
 const add=(geo,mat,x,y,z,par=g)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;par.add(m);return m};
 const leg=s=>{const p=new T.Group();p.position.set(s*.1,.92,0);g.add(p);add(new T.CylinderGeometry(.075,.07,.86,7),cl,0,-.44,0,p);add(new T.BoxGeometry(.11,.08,.27),M(0x15191d),0,-.88,-.05,p);return p};
 const arm=s=>{const p=new T.Group();p.position.set(s*.26,1.45,0);g.add(p);add(new T.CylinderGeometry(.05,.045,.58,7),cl,0,-.29,0,p);add(new T.SphereGeometry(.045,6,5),sk,0,-.6,0,p);return p};
 const lL=leg(-1),lR=leg(1),aL=arm(-1),aR=arm(1);add(new T.BoxGeometry(.4,.56,.23),cl,0,1.24,0);add(new T.BoxGeometry(.42,.42,.25),hv,0,1.3,0);for(const y of [1.2,1.38])add(new T.BoxGeometry(.43,.035,.26),refl,0,y,0);
 add(new T.CylinderGeometry(.05,.05,.09,8),sk,0,1.56,0);add(new T.SphereGeometry(.115,12,10),sk,0,1.72,0);add(new T.SphereGeometry(.15,12,8,0,PI*2,0,PI/2),hl,0,1.76,0);add(new T.BoxGeometry(.32,.025,.34),hl,0,1.76,-.03);
 return {g,lL,lR,aL,aR}}
function fireTruck(){const g=new T.Group(),M=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.45,metalness:.35,...o}),red=M(0xc8201c),add=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
 add(new T.BoxGeometry(2.5,1.6,6.2),red,0,1.55,-.7);add(new T.BoxGeometry(2.5,2.1,2.2),red,0,1.8,3.3);add(new T.BoxGeometry(2.3,.8,.06),M(0x1a2a36,{metalness:.8,roughness:.15}),0,2.3,4.42);
 add(new T.BoxGeometry(2.52,.12,6.2),M(0xf2f2ee),0,1.15,-.7);add(new T.BoxGeometry(.5,.3,5.6),M(0xb9c0c5,{metalness:.8}),0,2.5,-.9);add(new T.CylinderGeometry(.12,.12,1.1,8),M(0xb9c0c5,{metalness:.8}),0,2.7,-3.2).rotation.x=PI/2.6;
 const lb=[add(new T.BoxGeometry(.5,.16,.3),new T.MeshBasicMaterial({color:0x2050ff}),-.45,2.95,3.3),add(new T.BoxGeometry(.5,.16,.3),new T.MeshBasicMaterial({color:0xff2020}),.45,2.95,3.3)];
 for(const z of [3.2,-.4,-2.4])for(const s of [-1,1]){const w=add(new T.CylinderGeometry(.52,.52,.36,14),M(0x15191d,{metalness:0,roughness:.9}),s*1.15,.52,z);w.rotation.z=PI/2}
 return {g,lb,nozzle:new V3(0,2.85,-3.6)}}
function pickup(){const g=new T.Group(),M=c=>new T.MeshStandardMaterial({color:c,roughness:.4,metalness:.5}),add=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
 add(new T.BoxGeometry(1.9,.7,4.8),M(0xf2f2ee),0,.85,0);add(new T.BoxGeometry(1.8,.6,2),M(0xf2f2ee),0,1.45,.6);add(new T.BoxGeometry(1.7,.45,.04),M(0x1a2a36),0,1.5,1.62);add(new T.BoxGeometry(1.92,.12,4.82),M(0x1f5fbf),0,.9,0);
 add(new T.BoxGeometry(.9,.12,.2),new T.MeshBasicMaterial({color:0xffa000}),0,1.8,.6);for(const z of [1.5,-1.5])for(const s of [-1,1]){const w=add(new T.CylinderGeometry(.38,.38,.28,12),M(0x15191d),s*.95,.38,z);w.rotation.z=PI/2}return g}
const signTex=(kind)=>PS.canvasTex(256,256,(x,W,H)=>{x.fillStyle='#f4f4ef';x.fillRect(0,0,W,H);
 if(kind==='h2s'){x.fillStyle='#f2c218';x.strokeStyle='#111';x.lineWidth=10;x.beginPath();x.moveTo(W/2,22);x.lineTo(W-22,170);x.lineTo(22,170);x.closePath();x.fill();x.stroke();x.fillStyle='#111';x.font='bold 46px Arial';x.textAlign='center';x.fillText('H₂S',W/2,140);x.font='bold 26px Arial';x.fillText(PS.tx('ZAHARLI GAZ'),W/2,212);x.font='20px Arial';x.fillText(PS.tx('Gaz detektori bilan kiring'),W/2,242)}
 else{x.fillStyle='#1d5fb8';x.beginPath();x.arc(W/2,100,78,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(W/2,112,44,PI,0);x.fill();x.fillRect(W/2-58,108,116,12);x.fillStyle='#111';x.font='bold 24px Arial';x.textAlign='center';x.fillText(PS.tx('KASKA MAJBURIY'),W/2,212);x.font='20px Arial';x.fillText(PS.tx('Jilet va ko‘zoynak'),W/2,242)}},[1,1]);
// ---- qurish: atrof-muhit obyektlari va effekt tizimlari ----
const _bb=P.buildBackground;
P.buildBackground=function(){_bb.call(this);try{this.buildFx()}catch(e){console.error('3D effektlar:',e)}};
P.buildFx=function(){const m=this.m,sc=this.scene;this.fx={fire:0,leak:0,foam:0,flare:0,psv:0,water:0,truck:0,weather:'clear',cur:{fire:0,leak:0,foam:0,flare:0,psv:0,water:0},t:0};const F=this.fx;
 // dala operatorlari: biri absorber maydonchasida, biri amin bloki atrofida aylanib yuradi, biri separator yonida gaz detektori bilan
 const w1=fieldWorker(0xf26a1b);w1.g.position.set(5+Math.cos(1.9)*2.3,9.05,Math.sin(1.9)*2.3);w1.g.rotation.y=-1.9+PI/2;sc.add(w1.g);
 const w2=fieldWorker(0xd9e021);sc.add(w2.g);const w3=fieldWorker(0xf26a1b);w3.g.position.set(-5.2,0,4.6);w3.g.rotation.y=PI*.75;w3.aR.rotation.x=-1.1;sc.add(w3.g);
 {const det=new T.Mesh(new T.BoxGeometry(.08,.14,.05),new T.MeshStandardMaterial({color:0xf2c218}));det.position.set(0,-.62,-.04);w3.aR.add(det)}
 F.walkers=[{w:w2,path:[[-20,10],[-20,-12],[24,-12],[24,14],[-6,14]],u:0,sp:1.15}];F.workers=[w1,w2,w3];
 // shamol yengi (separator yonidagi ustunda) va xavf belgilari
 {const g=new T.Group();g.position.set(-24,0,14);sc.add(g);const pole=new T.Mesh(new T.CylinderGeometry(.06,.08,8,8),m.steel);pole.position.y=4;g.add(pole);
  const sock=new T.Group();sock.position.y=7.9;g.add(sock);const st=PS.canvasTex(128,32,(x,W,H)=>{for(let i=0;i<5;i++){x.fillStyle=i%2?'#ffffff':'#e8501c';x.fillRect(i*W/5,0,W/5,H)}},[1,1]);
  const cg=new T.CylinderGeometry(.42,.18,2.2,14,1,true);cg.rotateZ(PI/2);cg.translate(1.15,0,0);const cm=new T.Mesh(cg,new T.MeshStandardMaterial({map:st,side:T.DoubleSide,roughness:.8}));sock.add(cm);
  const ring=new T.Mesh(new T.TorusGeometry(.42,.03,6,16),m.steel);ring.rotation.y=PI/2;sock.add(ring);F.sock=sock;sock.rotation.y=-Math.atan2(WIND.z,WIND.x)}
 const sign=(kind,x,z,ry)=>{const pl=new T.Mesh(new T.PlaneGeometry(.9,.9),new T.MeshStandardMaterial({map:tex(kind,()=>signTex(kind)),roughness:.6}));pl.position.set(x,1.85,z);pl.rotation.y=ry;sc.add(pl);
  this.box(x-Math.sin(ry)*.03,1.85,z-Math.cos(ry)*.03,.95,.95,.03,m.dark,ry);this.cylY(x-Math.sin(ry)*.06,z-Math.cos(ry)*.06,0,2.35,.04,m.steel,6)};
 sign('h2s',-12.6,42.6,0);sign('ppe',4.6,42.6,0);sign('h2s',-9.5,6.5,PI/2);sign('ppe',11,13,0);
 // o't o'chirish mashinasi (yong'in ssenariysida keladi) va patrul pikapi
 const ft=fireTruck();ft.g.visible=false;sc.add(ft.g);F.ftruck=ft;F.tpath=[[80,0,46],[.6,0,46],[.6,0,16]];F.tu=0;
 const pk=pickup();sc.add(pk);F.pick={g:pk,u:0};
 // effekt tizimlari
 const flame=tex('flame',()=>softTex(255,170,70)),smoke=tex('smoke',()=>softTex(70,70,72)),white=tex('white',()=>softTex(240,246,250)),amber=tex('amber',()=>softTex(220,170,60));
 F.pFire=new Parts(sc,700,{map:flame,size:2.2,color:0xffa040,add:true,drag:1.2,rise:4});F.pSmoke=new Parts(sc,600,{map:smoke,size:7,color:0x3a3a3c,opacity:.55,drag:.6,rise:1.6});
 F.pLeak=new Parts(sc,900,{map:amber,size:.42,color:0xf0c860,grav:9.8,opacity:.95});F.pFoam=new Parts(sc,500,{map:white,size:.45,color:0xffffff,opacity:.85,drag:2,rise:.6});
 F.pFlare=new Parts(sc,500,{map:flame,size:14,color:0xff8a30,add:true,drag:.8,rise:8});F.pPsv=new Parts(sc,400,{map:white,size:2.2,color:0xffffff,opacity:.6,drag:.9,rise:1});
 F.pWater=new Parts(sc,700,{map:white,size:.35,color:0xcfe8ff,grav:9.8,opacity:.75});
 // ko'lmak (amin oqishida o'sadi)
 F.puddle=new T.Mesh(new T.CircleGeometry(1,40),new T.MeshStandardMaterial({color:0x8a6a20,metalness:.4,roughness:.08,transparent:true,opacity:.85}));F.puddle.rotation.x=-PI/2;F.puddle.position.set(LEAK[0],.06,LEAK[2]);F.puddle.scale.setScalar(.01);F.puddle.visible=false;sc.add(F.puddle);
 // yong'in yorug'ligi (doim sahnada, intensivligi 0 — shader qayta kompilyatsiya bo'lmasligi uchun)
 F.fireLight=new T.PointLight(0xff7a20,0,26,1.6);F.fireLight.position.set(FIRE[0],2.2,FIRE[2]);sc.add(F.fireLight);
 // ob-havo: yomg'ir (chiziqlar) va qor (nuqtalar) — kamera atrofida
 const nR=3200,rp=new Float32Array(nR*6);for(let i=0;i<nR;i++){const x=rr(-45,45),y=rr(0,40),z=rr(-45,45);rp.set([x,y,z,x+.05,y-.75,z+.02],i*6)}
 const rg=new T.BufferGeometry();F.rAttr=new T.BufferAttribute(rp,3);F.rAttr.setUsage(T.DynamicDrawUsage);rg.setAttribute('position',F.rAttr);
 F.rain=new T.LineSegments(rg,new T.LineBasicMaterial({color:0xaabccc,transparent:true,opacity:.45,depthWrite:false}));F.rain.frustumCulled=false;F.rain.visible=false;sc.add(F.rain);
 const nS=2600,sp=new Float32Array(nS*3);for(let i=0;i<nS;i++)sp.set([rr(-45,45),rr(0,40),rr(-45,45)],i*3);const sg=new T.BufferGeometry();F.sAttr=new T.BufferAttribute(sp,3);F.sAttr.setUsage(T.DynamicDrawUsage);sg.setAttribute('position',F.sAttr);
 F.snow=new T.Points(sg,new T.PointsMaterial({map:white,size:.5,color:0xffffff,transparent:true,depthWrite:false,opacity:.95}));F.snow.frustumCulled=false;F.snow.visible=false;sc.add(F.snow);
 // ob-havo materiallari: zamin, yo'l, beton (asl ranglar saqlanadi)
 F.mats=[this.m.conc,this.m.gravel,this.mc?.road,this.mc?.sand,this.mc?.gravel,this.mc?.paving,this.soilMat,this.m.grating].filter(Boolean).map(mt=>({mt,c:mt.color.clone(),r:mt.roughness}))};
// ---- ob-havo ----
P.setWeather=function(w){const F=this.fx;if(!F)return;F.weather=w;F.rain.visible=w==='rain';F.snow.visible=w==='snow';
 for(const o of F.mats){o.mt.color.copy(o.c);o.mt.roughness=o.r;if(w==='rain'){o.mt.color.multiplyScalar(.62);o.mt.roughness=Math.min(o.r,.35)}else if(w==='snow'){o.mt.color.lerp(new T.Color(0xf4f6f8),.85)}}
 if(this.scene.fog&&this.fogBase){const k=w==='clear'?1:w==='rain'?.55:.6;this.scene.fog.far=this.fogBase[1]*k;this.scene.fog.near=this.fogBase[0]*k}
 if(this.clouds){this.clouds.material.opacity=w==='clear'?(this.look!=='day'?.8:.9):1;this.clouds.material.color.setHex(w==='clear'?(this.look==='day'?0xffffff:0xf0a27a):0x9aa3ad)}
 if(this.sun)this.sun.intensity=(this._sunBase??(this._sunBase=this.sun.intensity))*(w==='clear'?1:.45);
 const b=document.getElementById('fxWeather');if(b)b.textContent=w==='rain'?'🌧 Yomg‘ir':w==='snow'?'❄ Qor':'☀ Ochiq'};
const _look=P.setLook;P.setLook=function(k){_look.call(this,k);this._sunBase=this.sun?.intensity;if(this.fx&&this.fx.weather!=='clear')this.setWeather(this.fx.weather)};
// ---- kamera parvozi (ekskursiya va ssenariylar uchun) ----
P.flyTo=function(eye,target,far){if(!this.camera)return;this.viewId=far?'ethylene':'tour';this.applyRange?.();this.cameraMove={p0:this.camera.position.clone(),t0:this.controls.target.clone(),p1:new V3(...eye),t1:new V3(...target),u:0}};
// ---- har kadrda: effektlarni silliq yaqinlashtirish, zarrachalarni chiqarish, odamlar va texnikani harakatlantirish ----
const _render=P.render;
P.render=function(s,dt){const F=this.fx;if(F&&this.ready){dt=Math.min(dt||0,.1);F.t+=dt;const t=F.t,c=F.cur,ap=(k,tau)=>{c[k]+=(F[k]-c[k])*(1-Math.exp(-dt/tau))};
  ap('fire',3);ap('leak',1);ap('foam',4);ap('flare',2);ap('psv',1);ap('water',1.5);
  // yong'in: alanga + tutun + miltillovchi yorug'lik
  F.pFire.step(dt,c.fire*260,()=>[FIRE[0]+rr(-1.3,1.3),FIRE[1]+rr(0,.6),FIRE[2]+rr(-1,1),rr(-.4,.4),rr(2.5,5.5),rr(-.4,.4),rr(.5,1.1)]);
  F.pSmoke.step(dt,c.fire*45+(c.fire>.02?6:0),()=>[FIRE[0]+rr(-1,1),FIRE[1]+rr(2.5,4),FIRE[2]+rr(-1,1),rr(-.3,.3),rr(1.5,3),rr(-.3,.3),rr(5,9)]);
  F.fireLight.intensity=c.fire*(38+Math.sin(t*23)*9+Math.sin(t*7.3)*6);
  // amin oqishi: flanetsdan purkash + ko'lmak
  F.pLeak.step(dt,c.leak*420,()=>[LEAK[0],LEAK[1],LEAK[2],rr(-.8,.8),rr(-.5,1.2),rr(1.6,3.2),rr(1,1.6)]);
  if(c.leak>.02){F.puddle.visible=true;F.puddleR=Math.min(4.5,(F.puddleR||.2)+dt*.12*c.leak)}else if(F.puddleR>0){F.puddleR=Math.max(0,F.puddleR-dt*.05);if(F.puddleR<=0)F.puddle.visible=false}F.puddle.scale.setScalar(Math.max(.01,F.puddleR||0));
  // ko'piklanish: absorber ichida (oyna/kesimda ko'rinadi) va gaz chiqishida tuman
  F.pFoam.step(dt,c.foam*160,()=>{const a=R()*PI*2,r=R()*1.4;return[5+Math.cos(a)*r,rr(10,14),Math.sin(a)*r,0,rr(.2,.8),0,rr(1.5,3)]});
  // mash'al: alanga kuchayishi (blow-by yoki ESD bosimni tushirish) — uzoq mash'allar ustida katta alanga
  this.flareK=1+c.flare*3.2;for(const f of this.extraFlares||[])if(c.flare>.03&&R()<c.flare*dt*25)F.pFlare.step(0,1,()=>[f.position.x+rr(-2,2),f.position.y-2,f.position.z+rr(-2,2),rr(-2,2),rr(10,20),rr(-2,2),rr(.8,1.6)]);F.pFlare.step(dt,0,()=>[0,0,0,0,0,0,0]);
  // PSV / bosim tushirish: absorber tepasidan oq oqim
  F.pPsv.step(dt,c.psv*120,()=>[5,20.6,0,rr(-.6,.6),rr(9,14),rr(-.6,.6),rr(.8,1.6)]);
  // o't o'chirish mashinasi: yo'l bo'ylab kelish, mayoqchalar, suv purkash
  const ft=F.ftruck;if(F.truck>0){ft.g.visible=true;F.tu=Math.min(1,F.tu+dt/18)}else{F.tu=Math.max(0,F.tu-dt/18);if(F.tu===0)ft.g.visible=false}
  if(ft.g.visible){const pth=F.tpath,L=[Math.hypot(pth[1][0]-pth[0][0],pth[1][2]-pth[0][2]),Math.hypot(pth[2][0]-pth[1][0],pth[2][2]-pth[1][2])],d=F.tu*(L[0]+L[1]),k=d<L[0]?0:1,u=k?(d-L[0])/L[1]:d/L[0],a=pth[k],b=pth[k+1];
   ft.g.position.set(a[0]+(b[0]-a[0])*u,0,a[2]+(b[2]-a[2])*u);ft.g.rotation.y=Math.atan2(b[0]-a[0],b[2]-a[2]);const bl=Math.sin(t*12)>0;ft.lb[0].visible=bl;ft.lb[1].visible=!bl;F.arrived=F.tu>=1}else F.arrived=false;
  if(c.water>.02&&ft.g.visible){const o=ft.nozzle.clone().applyMatrix4(ft.g.matrixWorld),dir=new V3(FIRE[0]-o.x,0,FIRE[2]-o.z),dist=dir.length();dir.normalize();const vh=Math.min(11,dist*.95);
   F.pWater.step(dt,c.water*320,()=>[o.x,o.y,o.z,dir.x*vh+rr(-.6,.6),rr(3.5,5),dir.z*vh+rr(-.6,.6),rr(1.2,1.8)])}else F.pWater.step(dt,0,()=>[0,0,0,0,0,0,0]);
  // dala operatori yo'l bo'ylab yuradi (oyoq-qo'l harakati)
  for(const wk of F.walkers){const pth=wk.path,n=pth.length;let seg=[];let tot=0;for(let i=0;i<n;i++){const a=pth[i],b=pth[(i+1)%n],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,l]);tot+=l}
   wk.u=(wk.u+dt*wk.sp)%tot;let d=wk.u;for(const [a,b,l] of seg){if(d<=l){const u=d/l;wk.w.g.position.set(a[0]+(b[0]-a[0])*u,0,a[1]+(b[1]-a[1])*u);wk.w.g.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1])+PI;break}d-=l}
   const sw=Math.sin(t*6)*.5;wk.w.lL.rotation.x=sw;wk.w.lR.rotation.x=-sw;wk.w.aL.rotation.x=-sw*.8;wk.w.aR.rotation.x=sw*.8}
  // patrul pikapi: z=46 yo'li bo'ylab borib-keladi
  {const pk=F.pick;pk.u=(pk.u+dt*9)%1200;const d=pk.u<600?pk.u:1200-pk.u,dir=pk.u<600?1:-1;pk.g.position.set(-240+d,0,46+(dir>0?-1.8:1.8));pk.g.rotation.y=dir>0?PI/2:-PI/2}
  // shamol yengi tebranishi
  if(F.sock)F.sock.rotation.z=-.12+Math.sin(t*2.3)*.06;
  // yomg'ir va qor — kamera atrofida
  if(F.rain.visible&&this.camera){const cp=this.camera.position,a=F.rAttr.array;F.rain.position.set(cp.x,Math.max(0,cp.y-20),cp.z);for(let i=0;i<a.length;i+=6){a[i+1]-=dt*26;a[i+4]-=dt*26;if(a[i+4]<0){const y=40+R()*4;a[i+1]=y;a[i+4]=y-.75}}F.rAttr.needsUpdate=true}
  if(F.snow.visible&&this.camera){const cp=this.camera.position,a=F.sAttr.array;F.snow.position.set(cp.x,Math.max(0,cp.y-20),cp.z);for(let i=0;i<a.length;i+=3){a[i+1]-=dt*1.4;a[i]+=Math.sin(t+i)*dt*.4+WIND.x*dt*.6;a[i+2]+=Math.cos(t*.7+i)*dt*.4;if(a[i+1]<0){a[i+1]=40;a[i]=rr(-45,45);a[i+2]=rr(-45,45)}}F.sAttr.needsUpdate=true}}
 _render.call(this,s,dt)};
// ---- 3D panel tugmalari: ob-havo, yozuv (kamera ostida izoh) ----
const bar=document.querySelector('#aSceneCard .a-toolbar');
if(bar&&!document.getElementById('fxWeather')){const b=document.createElement('button');b.className='asec';b.id='fxWeather';b.title='Ob-havo: ochiq / yomg‘ir / qor';b.textContent='☀ Ochiq';
 b.onclick=()=>{const s=window.__PS.inst;if(!s?.fx)return;const o=['clear','rain','snow'];s.setWeather(o[(o.indexOf(s.fx.weather)+1)%3])};bar.appendChild(b)}
const card=document.getElementById('aSceneCard');
if(card&&!document.getElementById('fxCap')){const c=document.createElement('div');c.id='fxCap';c.setAttribute('role','status');c.style.cssText='position:absolute;left:50%;bottom:86px;transform:translateX(-50%);max-width:min(860px,92%);background:#0c1c2ee6;color:#eaf4fc;border:1px solid #54758e;border-radius:10px;padding:10px 16px;font:14px/1.45 Segoe UI,Arial;display:none;z-index:5;box-shadow:0 6px 24px #0006';
 if(getComputedStyle(card).position==='static')card.style.position='relative';card.appendChild(c)}
window.AmineFx={caption(html){const c=document.getElementById('fxCap');if(!c)return;if(!html){c.style.display='none';return}c.innerHTML=html;c.style.display='block'}};
})();
