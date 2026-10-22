/* ===== GP1701 3D sahna (v3): yuqori sifatli protsedura modeli ===== */
(()=>{'use strict';
const T=window.AmineThree;if(!T||!window.AmineOrbit){console.warn('3D: Three yoki Orbit yo‘q');return}
const PI=Math.PI,V3=T.Vector3;
// ---------- statik geometriyani materiallar bo'yicha birlashtirish ----------
function mergeList(items){let nv=0,ni=0;for(const g of items){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count}
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=new Uint32Array(ni);let vo=0,io=0;
 for(const g of items){const n=g.attributes.position.count;pos.set(g.attributes.position.array,vo*3);if(g.attributes.normal)nor.set(g.attributes.normal.array,vo*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,vo*2);
  if(g.index){const a=g.index.array;for(let i=0;i<a.length;i++)idx[io+i]=a[i]+vo;io+=a.length}else{for(let i=0;i<n;i++)idx[io+i]=vo+i;io+=n}vo+=n}
 const m=new T.BufferGeometry();m.setAttribute('position',new T.BufferAttribute(pos,3));m.setAttribute('normal',new T.BufferAttribute(nor,3));m.setAttribute('uv',new T.BufferAttribute(uv,2));m.setIndex(new T.BufferAttribute(idx,1));m.computeBoundingSphere();return m}
// ---------- protsedura teksturalar ----------
function rnd(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function canvasTex(w,h,draw,repeat){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat[0],repeat[1])}return t}
function noiseTex(w,h,base,amp,seed,repeat,cb){return canvasTex(w,h,(x,W,H)=>{const R=rnd(seed);x.fillStyle=base;x.fillRect(0,0,W,H);const im=x.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*amp;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0);if(cb)cb(x,W,H,R)},repeat)}
const concreteTex=()=>noiseTex(512,512,'#7d8085',34,5,[10,8],(x,W,H,R)=>{for(let i=0;i<70;i++){x.fillStyle=`rgba(${40+R()*30|0},${42+R()*30|0},${46+R()*30|0},${.05+R()*.08})`;x.beginPath();x.ellipse(R()*W,R()*H,10+R()*60,6+R()*30,R()*PI,0,PI*2);x.fill()}x.strokeStyle='rgba(30,32,36,.55)';x.lineWidth=3;x.strokeRect(0,0,W,H);for(let i=0;i<5;i++){x.strokeStyle='rgba(25,27,30,.28)';x.lineWidth=1.2;x.beginPath();let px=R()*W,py=R()*H;x.moveTo(px,py);for(let k=0;k<8;k++){px+=(R()-.5)*60;py+=(R()-.3)*50;x.lineTo(px,py)}x.stroke()}});
const gravelTex=()=>noiseTex(256,256,'#76736b',64,9,[40,40]);
const gratingTex=()=>canvasTex(128,128,(x,W,H)=>{x.fillStyle='#14181d';x.fillRect(0,0,W,H);x.fillStyle='#4b5560';for(let i=0;i<W;i+=16){x.fillRect(i,0,5,H)}x.fillStyle='#39424b';for(let j=0;j<H;j+=48)x.fillRect(0,j,W,3)},[1,1]);
const brushedTex=()=>noiseTex(256,256,'#cfd5d8',26,3,[3,3],(x,W,H,R)=>{for(let i=0;i<220;i++){x.strokeStyle=`rgba(${R()>.5?255:80},${R()>.5?255:80},${R()>.5?255:90},.05)`;x.lineWidth=1;x.beginPath();const y=R()*H;x.moveTo(0,y);x.lineTo(W,y+(R()-.5)*3);x.stroke()}});
const claddingTex=()=>canvasTex(256,64,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c4cbcf');g.addColorStop(.5,'#e3e8ea');g.addColorStop(1,'#b3babf');x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle='rgba(60,70,78,.55)';x.lineWidth=2;for(let i=0;i<W;i+=64){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}},[2,1]);
const tx=s=>(window.GP&&!window.GP.real)?window.GP.anon(s):s;
const plateTex=(text,w=256,h=80)=>{const t=canvasTex(w,h,(x,W,H)=>{x.fillStyle='#f4f4ef';x.fillRect(0,0,W,H);x.strokeStyle='#222';x.lineWidth=5;x.strokeRect(3,3,W-6,H-6);x.fillStyle='#111';x.font=`800 ${Math.round(H*.5)}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(tx(text),W/2,H/2+2)});const c=t.image,dr=(x,W,H)=>{x.fillStyle='#f4f4ef';x.fillRect(0,0,W,H);x.strokeStyle='#222';x.lineWidth=5;x.strokeRect(3,3,W-6,H-6);x.fillStyle='#111';x.font=`800 ${Math.round(H*.5)}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(tx(text),W/2,H/2+2)};t.userData.redraw=()=>{dr(c.getContext('2d'),w,h);t.needsUpdate=true};dyn.push(t);return t};
const glowTex=()=>{const t=canvasTex(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,236,190,1)');g.addColorStop(.22,'rgba(255,196,110,.6)');g.addColorStop(1,'rgba(255,170,60,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});return t};
const blobTex=()=>canvasTex(64,64,(x)=>{const g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
const dyn=[];
window.__PS={dyn,tx,refreshText(){dyn.forEach(t=>t.userData.redraw&&t.userData.redraw());const i=window.__PS.inst;if(i)i.labels.forEach(o=>o.value=null)},T,mergeList,rnd,canvasTex,noiseTex,concreteTex,gravelTex,gratingTex,brushedTex,claddingTex,plateTex,glowTex,blobTex};
})();
(()=>{'use strict';
const PS=window.__PS;if(!PS)return;const {T,mergeList,rnd}=PS,PI=Math.PI,V3=T.Vector3;
const tmpM=new T.Matrix4(),tmpE=new T.Euler(),tmpQ=new T.Quaternion(),tmpP=new V3(),tmpS=new V3(1,1,1),UP=new V3(0,1,0);
class PlantScene{
 constructor(host,onPick){this.host=host;this.pick=onPick;this.flow=true;this.cut=false;this.labelsOn=true;this.auto=false;this.shells=[];this.flows=[];this.labels=[];this.gauges=[];this.valves={};this.liquids={};this.picks=[];this.stat=new Map();this.surfaces=[];this.glass=[];this.ready=false;this.lampObjs=[];this.dynamic=[];this.look='dusk';this.animTime=0;this.quality='high';PS.inst=this;this.init()}
 // ---------------------------------------------------------------- init
 init(){const host=this.host,cv=host.querySelector('canvas');try{
  this.renderer=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;this.renderer.outputColorSpace=T.SRGBColorSpace;
  this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(40,1,.1,600);this.controls=new window.AmineOrbit(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.07;this.controls.minDistance=4;this.controls.maxDistance=95;this.controls.maxPolarAngle=PI*.495;this.controls.autoRotateSpeed=.4;
  this.makeMaterials();this.makeSky();this.makeLights();
  this.buildGround();this.buildCoolerFrame();this.buildCoolers();this.buildTower();this.buildSeparator();this.buildPipeRack();this.buildPiping();this.buildInstruments();this.buildSigns();this.buildStation();this.buildBackground();this.buildProcess();this.flush();
  this.setLook('dusk');this.setCamera('all',false);this.resize();this.ready=true;this.setCut(true);this.bindPointer();
  new ResizeObserver(()=>this.resize()).observe(host);
  const bar=host.closest('.a-card')?.querySelector('.a-toolbar');if(bar&&!document.getElementById('aTod')){const b=document.createElement('button');b.className='asec';b.id='aTod';b.title='Kechki / kunduzgi yoritish';b.onclick=()=>this.setLook(this.look==='dusk'?'day':'dusk');const sp=bar.querySelector('.spacer');bar.insertBefore(b,sp?sp.nextSibling:bar.firstChild);b.textContent='☾ Kechki'}
 }catch(e){console.error('3D:',e);const er=host.querySelector('.a3-error');if(er){er.hidden=false;er.textContent='WebGL ishga tushmadi. Mnemosxema barcha signallar bilan ishlashda davom etadi.'}}}
 // ---------------------------------------------------------------- materials
 makeMaterials(){const E=1.15,M=(o)=>new T.MeshStandardMaterial(o);const br=PS.brushedTex();
  this.m={
   steel:M({color:0xdde2e4,metalness:.92,roughness:.3,envMapIntensity:E,map:br}),
   shell:M({color:0xd9dfe2,metalness:.9,roughness:.26,envMapIntensity:E,map:br,side:T.FrontSide}),
   inner:M({color:0x56707c,metalness:.6,roughness:.5,side:T.BackSide}),
   clad:M({color:0xffffff,metalness:.8,roughness:.36,envMapIntensity:E,map:PS.claddingTex()}),
   pipe:M({color:0xc9d0d4,metalness:.88,roughness:.34,envMapIntensity:E}),
   dark:M({color:0x363f48,metalness:.7,roughness:.5}),
   frame:M({color:0x56677a,metalness:.55,roughness:.55,envMapIntensity:.8}),
   frame2:M({color:0x3e4c5b,metalness:.6,roughness:.5}),
   yellow:M({color:0xe6b01c,metalness:.15,roughness:.5}),
   green:M({color:0x2f9c3e,metalness:.35,roughness:.4}),
   red:M({color:0xb23a3a,metalness:.3,roughness:.45}),
   black:M({color:0x0b0d10,metalness:.3,roughness:.5}),
   rubber:M({color:0x15191d,roughness:.8}),
   grating:M({map:PS.gratingTex(),metalness:.5,roughness:.6,color:0xffffff}),
   conc:M({map:PS.concreteTex(),roughness:.95,metalness:0}),
   gravel:M({map:PS.gravelTex(),roughness:1,metalness:0}),
   bolt:M({color:0x2a3037,metalness:.8,roughness:.4}),
   white:M({color:0xeeeeea,roughness:.6}),
   cable:M({color:0x1c2228,metalness:.4,roughness:.6}),
   blue:M({color:0x2a58a8,metalness:.4,roughness:.45}),
   brass:M({color:0xc7a14a,metalness:.85,roughness:.35}),
   glass:new T.MeshPhysicalMaterial({color:0xcfeaf5,metalness:0,roughness:.05,transparent:true,opacity:.28,envMapIntensity:1.4,depthWrite:false}),
   lamp:new T.MeshBasicMaterial({color:0xfff0c8}),
   far:M({color:0x3b476b,metalness:.25,roughness:.9}),
   dim:new T.MeshBasicMaterial({color:0x090c12})};
  this.m.shellFront=this.m.shell}
 makeSky(){const c=document.createElement('canvas');c.width=4;c.height=512;this.skyCtx=c.getContext('2d');this.skyTex=new T.CanvasTexture(c);this.skyTex.colorSpace=T.SRGBColorSpace;const g=new T.SphereGeometry(300,32,20);this.sky=new T.Mesh(g,new T.MeshBasicMaterial({map:this.skyTex,side:T.BackSide,fog:false,depthWrite:false}));this.sky.renderOrder=-10;this.scene.add(this.sky);
  const R=rnd(77),n=520,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=R()*PI*2,e=.12+R()*1.25,r=280;pos[i*3]=Math.cos(a)*Math.cos(e)*r;pos[i*3+1]=Math.sin(e)*r;pos[i*3+2]=Math.sin(a)*Math.cos(e)*r}const sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(pos,3));this.stars=new T.Points(sg,new T.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,fog:false,transparent:true,opacity:.8,depthWrite:false}));this.scene.add(this.stars)}
 makeLights(){this.hemi=new T.HemisphereLight(0x8aa4d8,0x4a3a30,1);this.scene.add(this.hemi);const sun=new T.DirectionalLight(0xffa860,2.4);sun.position.set(-40,12,26);sun.castShadow=true;sun.shadow.mapSize.set(3072,3072);Object.assign(sun.shadow.camera,{left:-36,right:36,top:34,bottom:-28,near:1,far:140});sun.shadow.bias=-.0002;sun.shadow.normalBias=.03;this.scene.add(sun);this.sun=sun;
  const fill=new T.DirectionalLight(0x7f9cff,.6);fill.position.set(30,18,-20);this.scene.add(fill);this.fill=fill;this.lampLights=[];for(const [x,y,z] of [[2,9,9],[14,9,6],[12,20,4]]){const l=new T.PointLight(0xffc27a,0,32,1.6);l.position.set(x,y,z);this.scene.add(l);this.lampLights.push(l)}}
 // ---------------------------------------------------------------- statik batching
 S(mat){let a=this.stat.get(mat);if(!a){a=[];this.stat.set(mat,a)}return a}
 put(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){tmpE.set(rx,ry,rz,'YXZ');tmpQ.setFromEuler(tmpE);tmpP.set(x,y,z);tmpS.set(sx,sy,sz);tmpM.compose(tmpP,tmpQ,tmpS);geo.applyMatrix4(tmpM);this.S(mat).push(geo)}
 flush(){for(const [mat,list] of this.stat){if(!list.length)continue;const g=mergeList(list);const m=new T.Mesh(g,mat);m.castShadow=!mat.transparent&&!mat.isMeshBasicMaterial;m.receiveShadow=true;m.matrixAutoUpdate=false;this.scene.add(m);list.length=0}this.stat.clear()}
 box(x,y,z,w,h,d,mat,ry=0,rx=0,rz=0){this.put(new T.BoxGeometry(w,h,d),mat,x,y,z,rx,ry,rz)}
 cylAB(a,b,r,mat,seg=10,r2=r){const A=new V3(...a),B=new V3(...b),d=B.clone().sub(A),L=d.length();if(L<1e-5)return;const g=new T.CylinderGeometry(r2,r,L,seg,1,false);tmpQ.setFromUnitVectors(UP,d.clone().normalize());tmpE.setFromQuaternion(tmpQ,'YXZ');const mid=A.add(B).multiplyScalar(.5);g.applyQuaternion(tmpQ);g.translate(mid.x,mid.y,mid.z);this.S(mat).push(g)}
 cylY(x,z,y0,y1,r,mat,seg=16,r2=r){const g=new T.CylinderGeometry(r2,r,y1-y0,seg);g.translate(x,(y0+y1)/2,z);this.S(mat).push(g)}
 torus(x,y,z,R,t,mat,axis='y',arc=PI*2,seg=28,rot=0){const g=new T.TorusGeometry(R,t,6,seg,arc);if(axis==='y'){g.rotateX(PI/2);g.rotateY(rot)}else if(axis==='x')g.rotateY(PI/2+rot);else g.rotateZ(rot);g.translate(x,y,z);this.S(mat).push(g)}
 disc(x,y,z,r,h,mat,axis='y',seg=24){const g=new T.CylinderGeometry(r,r,h,seg);if(axis==='x')g.rotateZ(PI/2);else if(axis==='z')g.rotateX(PI/2);g.translate(x,y,z);this.S(mat).push(g)}
 sphere(x,y,z,r,mat,seg=12){const g=new T.SphereGeometry(r,seg,seg*.6|0);g.translate(x,y,z);this.S(mat).push(g)}
 // flanga: disk + boltlar
 flange(p,r,axis='y',n=8,mat=this.m.steel){this.disc(p[0],p[1],p[2],r,.07,mat,axis,20);const bt=this.m.bolt;for(let i=0;i<n;i++){const a=i/n*PI*2,c=Math.cos(a)*r*.78,s=Math.sin(a)*r*.78;let q=[...p];if(axis==='y'){q[0]+=c;q[2]+=s}else if(axis==='x'){q[1]+=c;q[2]+=s}else{q[0]+=c;q[1]+=s}this.disc(q[0],q[1],q[2],r*.1,.13,bt,axis,6)}}
 // ---------------------------------------------------------------- tuproq / zamin
 buildGround(){const m=this.m;const g=new T.PlaneGeometry(96,84);g.rotateX(-PI/2);g.translate(-4,-.06,9);const gm=new T.Mesh(g,m.gravel);gm.material.map.repeat.set(17,15);gm.receiveShadow=true;this.scene.add(gm);
  // asosiy beton plita
  const cw=m.conc;cw.map.repeat.set(14,10);const sl=new T.Mesh(new T.BoxGeometry(62,.3,46),cw);sl.position.set(-2,-.1,1);sl.receiveShadow=true;this.scene.add(sl);
  // sariq xavfsizlik chizig'i va chetlik
  const ym=m.yellow;for(const z of [-21.7,23.7])this.box(-2,.07,z,61,.025,.16,ym);for(const x of [-32.7,28.7])this.box(x,.07,1,.16,.025,45,ym);
  // pastki beton poydevorlar
  for(const [x,z,w,d] of [[5,0,6.2,6.2],[-2.5,2,4.4,4.4]])this.box(x,.18,z,w,.36,d,m.conc);
  // drenaj panjaralari
  for(let i=0;i<6;i++){this.box(-26+i*9,.04,-17+((i*7)%3)*12,2.4,.04,.5,m.grating)}
  // fon soyalari (blob)
  const bt=PS.blobTex();this.blobs=[];const bm=new T.MeshBasicMaterial({map:bt,transparent:true,depthWrite:false,opacity:.9});for(const [x,z,w,d] of [[5,0,10,10],[-2.5,2,8,8],[-11,0,22,10]]){const p=new T.Mesh(new T.PlaneGeometry(w,d),bm);p.rotation.x=-PI/2;p.position.set(x,.075,z);p.renderOrder=1;this.scene.add(p)}
 }
}
window.__PS.PlantScene=PlantScene;
})();
(()=>{'use strict';
const PS=window.__PS;if(!PS)return;const {T,rnd}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype;
const CUT0=2.2,CUTL=3.7; // kesim: ko'rinadigan burchak
function profile(r,y0,y1,hb,n=14){const pts=[];for(let k=0;k<=n;k++){const t=k/n*PI/2;pts.push(new T.Vector2(Math.max(.0001,r*Math.sin(t)),y0-hb*Math.cos(t)))}for(let k=1;k<=n;k++){const t=k/n*PI/2;pts.push(new T.Vector2(Math.max(.0001,r*Math.cos(t)),y1+hb*Math.sin(t)))}return pts}
// ---------------------------------------------------------------- vertikal idish
P.vessel=function(o){const {id,eq,x,z,r,y0,y1,hb}=o,m=this.m;const pts=profile(r,y0,y1,hb);
 const mk=(cut)=>new T.LatheGeometry(pts,72,cut?CUT0:0,cut?CUTL:PI*2);
 const outer=new T.Mesh(mk(false),m.shell);outer.position.set(x,0,z);outer.castShadow=true;outer.receiveShadow=true;outer.userData.eq=eq;this.scene.add(outer);this.picks.push(outer);
 const inner=new T.Mesh(mk(false),m.inner);inner.position.set(x,0,z);inner.receiveShadow=true;this.scene.add(inner);inner.userData.eq=eq;this.picks.push(inner);
 this.shells.push({kind:'v',outer,inner,mk});
 // payvand choklari
 const n=Math.floor((y1-y0)/2.6);for(let i=1;i<=n;i++)this.torus(x,y0+i*(y1-y0)/(n+1),z,r+.012,.014,m.dark,'y');
 this.torus(x,y0,z,r+.012,.02,m.dark,'y');this.torus(x,y1,z,r+.012,.02,m.dark,'y');
 // yubka (skirt) va asos halqasi, langar boltlar
 const sk=r*.96;this.cylY(x,z,.3,y0-hb*.35,sk,m.frame2,48);this.disc(x,.34,z,r+.34,.12,m.frame2,'y',48);this.disc(x,.4,z,r+.2,.06,m.dark,'y',48);
 for(let i=0;i<12;i++){const a=i/12*PI*2;this.cylY(x+Math.cos(a)*(r+.26),z+Math.sin(a)*(r+.26),.3,.62,.035,m.bolt,6)}
 this.box(x+sk*.98,.95,z,.08,1.15,.7,m.black,0);this.box(x-sk*.98,.8,z,.08,.5,.5,m.black,0);
 // ko'tarish quloqlari (tepada)
 for(const s of [-1,1])this.box(x+s*.7,y1+hb+.02,z,.16,.34,.04,m.dark);
 return {x,z,r,y0,y1,hb}};
// ---------------------------------------------------------------- nozzle (patrubka)
P.nozzle=function(x,y,z,dir,len,r,eq){const m=this.m;const d={x:[1,0,0],X:[-1,0,0],z:[0,0,1],Z:[0,0,-1],y:[0,1,0]}[dir];const e=[x+d[0]*len,y+d[1]*len,z+d[2]*len];this.cylAB([x,y,z],e,r,m.shell,16);const ax=dir==='x'||dir==='X'?'x':dir==='y'?'y':'z';this.flange(e,r*1.55,ax,8);return e};
P.manway=function(cx,cz,rad,az,y,r=.34){const m=this.m,px=cx+Math.cos(az)*rad,pz=cz+Math.sin(az)*rad,ex=cx+Math.cos(az)*(rad+.22),ez=cz+Math.sin(az)*(rad+.22);this.cylAB([px,y,pz],[ex,y,ez],r,m.shell,20);const fx=cx+Math.cos(az)*(rad+.27),fz=cz+Math.sin(az)*(rad+.27);const g=new T.CylinderGeometry(r*1.3,r*1.3,.06,24);g.rotateZ(PI/2);g.rotateY(-az);g.translate(fx,y,fz);this.S(m.steel).push(g);const g2=new T.CylinderGeometry(r*1.15,r*1.15,.08,24);g2.rotateZ(PI/2);g2.rotateY(-az);g2.translate(cx+Math.cos(az)*(rad+.33),y,cz+Math.sin(az)*(rad+.33));this.S(m.shell).push(g2);for(let i=0;i<12;i++){const a=i/12*PI*2,q=r*1.2;const bx=fx+Math.cos(az)*.04+(-Math.sin(az))*Math.cos(a)*q,bz=fz+Math.sin(az)*.04+(Math.cos(az))*Math.cos(a)*q,by=y+Math.sin(a)*q;this.disc(bx,by,bz,.025,.1,m.bolt,'z',6)}
 // ko'tarish tutqichi
 this.cylAB([ex+Math.cos(az)*.12,y+r*.6,ez+Math.sin(az)*.12],[ex+Math.cos(az)*.12,y-r*.6,ez+Math.sin(az)*.12],.025,m.dark,6)};
// ---------------------------------------------------------------- platforma (halqasimon, panjarali) + panjara
P.platform=function(cx,cz,y,r,gapAz,w=1.1,gap=.62){const m=this.m;const ri=r+.05,ro=r+w;const th0=-gapAz+gap/2,len=PI*2-gap;
 const g=new T.RingGeometry(ri,ro,72,1,th0,len);g.rotateX(-PI/2);g.translate(cx,y,cz);const ring=new T.Mesh(g,m.grating);ring.material.side=T.DoubleSide;ring.receiveShadow=true;ring.castShadow=true;ring.matrixAutoUpdate=true;this.scene.add(ring);
 // ostki halqa-profil va qirralar
 this.torus(cx,y-.03,cz,ro,.045,m.frame2,'y',len,48,-(gapAz+gap/2));this.torus(cx,y-.04,cz,ri+.05,.03,m.frame2,'y',len,36,-(gapAz+gap/2));
 // toe plate
 const tp=new T.CylinderGeometry(ro,ro,.14,72,1,true,PI/2+gapAz+gap/2-PI/2,len);this.platformToe=tp;
 // panjara
 const R=ro-.03,H=1.1,steps=Math.max(10,Math.round(len/(PI*2)*34));const a0=gapAz+gap/2;
 for(let i=0;i<=steps;i++){const a=a0+i/steps*len,px=cx+Math.cos(a)*R,pz=cz+Math.sin(a)*R;this.cylAB([px,y,pz],[px,y+H,pz],.028,m.yellow,6)}
 this.torus(cx,y+H,cz,R,.032,m.yellow,'y',len,60,-a0);this.torus(cx,y+H*.52,cz,R,.026,m.yellow,'y',len,60,-a0);this.torus(cx,y+.08,cz,R,.045,m.yellow,'y',len,60,-a0);
 // tayanch kronshteynlari
 for(let i=0;i<=8;i++){const a=a0+i/8*len,px=cx+Math.cos(a)*(r+.02),pz=cz+Math.sin(a)*(r+.02),qx=cx+Math.cos(a)*(ro-.1),qz=cz+Math.sin(a)*(ro-.1);this.cylAB([px,y-.55,pz],[qx,y-.04,qz],.035,m.frame2,6);this.cylAB([px,y-.04,pz],[qx,y-.04,qz],.04,m.frame2,6)}
 // darvoza (gap) ustunlari
 for(const s of [-1,1]){const a=gapAz+s*gap/2,px=cx+Math.cos(a)*R,pz=cz+Math.sin(a)*R;this.cylAB([px,y,pz],[px,y+H,pz],.03,m.yellow,6)}};
// ---------------------------------------------------------------- yopiq zina (cage ladder)
P.ladderV=function(cx,cz,r,az,y0,y1){const m=this.m,rad=r+.42,px=cx+Math.cos(az)*rad,pz=cz+Math.sin(az)*rad,tx=-Math.sin(az),tz=Math.cos(az),ox=Math.cos(az),oz=Math.sin(az),hw=.26;
 for(const s of [-1,1])this.cylAB([px+tx*hw*s,y0,pz+tz*hw*s],[px+tx*hw*s,y1,pz+tz*hw*s],.032,m.yellow,6);
 for(let y=y0+.3;y<y1;y+=.3)this.cylAB([px-tx*hw,y,pz-tz*hw],[px+tx*hw,y,pz+tz*hw],.02,m.steel,5);
 for(let y=y0+2.4;y<y1;y+=.95){const a=az;this.torus(px,y,pz,.44,.018,m.yellow,'y',PI,16,-(a-PI/2));}
 for(let k=-1;k<=1;k++){const a=k*.9*(PI/2);const bx=px+(ox*Math.cos(a)*-0+(-tx)*0)*0;this.cylAB([px+ox*.44*Math.cos(k*PI/2*.9)*1+tx*.44*Math.sin(k*PI/2*.9),y0+2.4,pz+oz*.44*Math.cos(k*PI/2*.9)+tz*.44*Math.sin(k*PI/2*.9)],[px+ox*.44*Math.cos(k*PI/2*.9)+tx*.44*Math.sin(k*PI/2*.9),y1,pz+oz*.44*Math.cos(k*PI/2*.9)+tz*.44*Math.sin(k*PI/2*.9)],.012,m.yellow,4)}
 for(let y=y0+1.2;y<y1;y+=2.6){this.cylAB([cx+ox*(r+.02),y,cz+oz*(r+.02)],[px-ox*0.0+tx*hw,y,pz+tz*hw],.03,m.frame2,5);this.cylAB([cx+ox*(r+.02),y,cz+oz*(r+.02)],[px-tx*hw,y,pz-tz*hw],.03,m.frame2,5)}};
// ---------------------------------------------------------------- yuqori sifatli tablichka (plastina)
P.plate=function(text,x,y,z,ry,w=1.5){const h=w*80/256;const mat=new T.MeshStandardMaterial({map:PS.plateTex(text),roughness:.55});const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mat);mesh.position.set(x,y,z);mesh.rotation.y=ry;mesh.castShadow=false;this.scene.add(mesh);const back=new T.Mesh(new T.BoxGeometry(w+.1,h+.1,.03),this.m.dark);back.position.set(x-Math.sin(ry)*.02,y,z-Math.cos(ry)*.02);back.rotation.y=ry;this.scene.add(back)};
// ---------------------------------------------------------------- DA-1701
P.buildTower=function(){const m=this.m,x=5,z=0,r=1.65,y0=2.3,y1=17.5,hb=.9;this.tower=this.vessel({id:'tower',eq:'tower',x,z,r,y0,y1,hb});
 // platformalar va zina (zina azimuti 0.55 rad)
 const AZ=.55;for(const y of [4.8,9.0,14.3])this.platform(x,z,y,r,AZ);this.ladderV(x,z,r+1.1,AZ,.4,14.3+.0);
 // 2-qism zinasi (platformalar orasi) — shu azimutda, platforma ichidan o'tadi
 this.ladderV(x,z,r,AZ+0,14.3,17.9);
 // yuqori mayda platforma (PSV va manway uchun)
 this.platform(x,z,17.7,r*.8,AZ,.9,.6);
 // patrubkalar
 this.nozzle(x-r,4.2,z,'X',.5,.3);this.nozzle(x,12.1,z-r,'Z',.55,.17);this.nozzle(x,15.7,z-r,'Z',.55,.13);this.nozzle(x+r,13.5,z,'x',.5,.12);this.nozzle(x,y0-hb*.88,z,'y',-.0,.25);
 this.nozzle(x,y1+hb,z,'y',.5,.32);
 // manway'lar
 this.manway(x,z,r,1.6,6.2,.36);this.manway(x,z,r,2.3,11.4,.36);this.manway(x,z,r,2.9,15.4,.36);this.manway(x,z,r,1.2,3.2,.34);
 // sath ko'rsatkichlari (bridle) — LC17003 (sump), LC17002 (wash)
 this.sight(x,z,r,1.05,2.6,5.6,'L');this.sight(x,z,r,-.5-0.25,13.0,14.0,'W',true);
 // nom plastinasi
 this.plate('DA-1701',x+Math.cos(.95)*(r+.015),7.0,z+Math.sin(.95)*(r+.015),PI/2-.95,1.6);
 // ichki konstruksiya (kesimda ko'rinadi): tarelkalar, quyi taqsimlagich, yuvish bo'limi, tomchi ushlagich
 const tray=new T.MeshStandardMaterial({color:0x8aa0ae,metalness:.7,roughness:.4,map:PS.noiseTex(128,128,'#9aa8b2',60,12,[2,2],(c,W,H,R)=>{c.fillStyle='rgba(20,28,34,.8)';for(let i=0;i<260;i++){c.beginPath();c.arc(R()*W,R()*H,2.2,0,PI*2);c.fill()}}),side:T.DoubleSide});
 for(const y of [5.2,7.6,10,12.5,14.0]){const g=new T.CylinderGeometry(r-.07,r-.07,.08,48);g.translate(x,y,z);const mm=new T.Mesh(g,tray);mm.receiveShadow=true;mm.castShadow=true;mm.userData.cutOnly=true;this.scene.add(mm);this.inside=(this.inside||[]);this.inside.push(mm);
  const wr=new T.BoxGeometry(.06,.34,1.5);wr.translate(x+(y%2?-1:1)*(r-.55),y+.2,z);this.S(m.dark).push(wr);for(let i=0;i<10;i++){const a=i/10*PI*2;this.cylAB([x+Math.cos(a)*(r-.1),y,z+Math.sin(a)*(r-.1)],[x+Math.cos(a)*(r-.5),y,z+Math.sin(a)*(r-.5)],.03,m.dark,5)}}
 for(const y of [12.05,15.65]){this.torus(x,y,z,1.2,.055,m.steel,'y');for(const zz of [-.7,0,.7]){this.cylAB([x-1.0,y,z+zz],[x+1.0,y,z+zz],.055,m.steel,8);for(const xx of [-.8,-.3,.3,.8])this.cylAB([x+xx,y,z+zz],[x+xx,y-.16,z+zz],.03,m.dark,5)}}
 // tomchi ushlagich to'ri (yuqori)
 const mesh=new T.Mesh(new T.CylinderGeometry(r-.15,r-.15,.28,40),new T.MeshStandardMaterial({color:0x9aa7ae,metalness:.6,roughness:.5,map:PS.canvasTex(64,64,(c,W,H)=>{c.fillStyle='#8c979e';c.fillRect(0,0,W,H);c.strokeStyle='#4b565d';c.lineWidth=1;for(let i=0;i<W;i+=5){c.beginPath();c.moveTo(i,0);c.lineTo(i,H);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(W,i);c.stroke()}},[4,4])}));mesh.position.set(x,16.95,z);this.scene.add(mesh);this.inside.push(mesh);
 // suyuqlik: sump (L) va yuvish (W)
 this.addLiquid('L',x,z,r-.08,2.3,3.4,0xc29a3d);this.addLiquid('W',x,z,r-.12,13.2,.7,0x8a79b8);
};
// ---------------------------------------------------------------- FA-1702
P.buildSeparator=function(){const m=this.m,x=-2.5,z=2,r=1.05,y0=2.1,y1=7.2,hb=.55;this.sep=this.vessel({id:'sep',eq:'sep',x,z,r,y0,y1,hb});
 const AZ=.7;this.platform(x,z,6.5,r,AZ,.9,.7);this.ladderV(x,z,r+.9,AZ,.4,6.5);this.ladderV(x,z,r,AZ,6.5,7.9);
 this.nozzle(x-r,4.4,z,'X',.55,.3);this.nozzle(x,y1+hb,z,'y',.5,.2);this.nozzle(x,y0-hb*.9,z,'y',-.0,.16);this.nozzle(x+r,3.1,z,'x',.45,.1);
 this.manway(x,z,r,1.7,4.2,.3);this.manway(x,z,r,2.4,5.6,.3);this.sight(x,z,r,1.15,2.4,4.6,'K');this.plate('FA-1702',x+Math.cos(1.0)*(r+.015),3.6,z+Math.sin(1.0)*(r+.015),PI/2-1.0,1.3);
 // ichki: inlet vane, to'r
 const g=new T.BoxGeometry(1.2,.07,1.5);g.translate(x-.25,5.1,z);this.S(m.steel).push(g);
 const mesh=new T.Mesh(new T.CylinderGeometry(r-.1,r-.1,.24,36),new T.MeshStandardMaterial({color:0x9aa7ae,metalness:.6,roughness:.5}));mesh.position.set(x,6.7,z);this.scene.add(mesh);this.inside.push(mesh);
 this.addLiquid('K',x,z,r-.07,2.1,2.7,0x8b7ab8);
 // oyoqlar o'rniga asos blok
};
// ---------------------------------------------------------------- sath ko'rsatkich (bridle + shisha)
P.sight=function(cx,cz,r,az,ya,yb,key,north){const m=this.m,d=r+.75,px=cx+Math.cos(az)*d,pz=cz+Math.sin(az)*d;
 this.cylAB([cx+Math.cos(az)*r,ya,cz+Math.sin(az)*r],[px,ya,pz],.04,m.pipe,8);this.cylAB([cx+Math.cos(az)*r,yb,cz+Math.sin(az)*r],[px,yb,pz],.04,m.pipe,8);
 this.cylAB([px,ya-.1,pz],[px,yb+.1,pz],.09,m.steel,12);this.box(px,(ya+yb)/2,pz,.2,yb-ya,.2,m.dark,az);
 const gl=new T.Mesh(new T.CylinderGeometry(.06,.06,yb-ya,12),m.glass);gl.position.set(px+Math.cos(az)*.1,(ya+yb)/2,pz+Math.sin(az)*.1);this.scene.add(gl);
 const col=key==='L'?0xd7ab45:key==='W'?0x8a79b8:0x8b7ab8;const lq=new T.Mesh(new T.CylinderGeometry(.045,.045,1,10),new T.MeshStandardMaterial({color:col,roughness:.2,metalness:.1,emissive:col,emissiveIntensity:.25}));lq.position.set(gl.position.x,ya,gl.position.z);this.scene.add(lq);
 this.glass.push({lq,ya,yb,key});for(let i=0;i<=4;i++){this.box(px+Math.cos(az)*.17,ya+(yb-ya)*i/4,pz+Math.sin(az)*.17,.12,.02,.05,m.white,az)}};
// ---------------------------------------------------------------- suyuqlik (ichki)
P.addLiquid=function(key,x,z,r,base,max,color){const mat=new T.MeshStandardMaterial({color,metalness:.1,roughness:.12,transparent:true,opacity:.78,depthWrite:false,emissive:color,emissiveIntensity:.12});const geo=new T.CylinderGeometry(r,r,1,48);const mesh=new T.Mesh(geo,mat);mesh.position.set(x,base+.5,z);mesh.castShadow=false;mesh.userData.cutOnly=true;this.scene.add(mesh);this.liquids[key]={m:mesh,base,max,x,z,r};
 const sg=new T.CircleGeometry(r,48);const sm=new T.MeshStandardMaterial({color,roughness:.1,metalness:.3,side:T.DoubleSide,transparent:true,opacity:.9,emissive:color,emissiveIntensity:.18});const sf=new T.Mesh(sg,sm);sf.rotation.x=-PI/2;sf.castShadow=false;this.scene.add(sf);this.surfaces.push({k:key,m:sf,base,max,positions:sg.attributes.position.array.slice(),x,z})};
window.__PS.profile=profile;
})();
(()=>{'use strict';
const PS=window.__PS;if(!PS)return;const {T,rnd}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype;
const TY=[8.45,5.15,1.85]; // A, B, C sovitgich o'qi balandligi
PS.TY=TY;
// ---------------------------------------------------------------- umumiy zina (cage ladder) — nuqta bo'yicha
P.ladderAt=function(px,pz,az,y0,y1,wall){const m=this.m,tx=-Math.sin(az),tz=Math.cos(az),ox=Math.cos(az),oz=Math.sin(az),hw=.26;
 for(const s of [-1,1])this.cylAB([px+tx*hw*s,y0,pz+tz*hw*s],[px+tx*hw*s,y1,pz+tz*hw*s],.032,m.yellow,6);
 for(let y=y0+.3;y<y1;y+=.3)this.cylAB([px-tx*hw,y,pz-tz*hw],[px+tx*hw,y,pz+tz*hw],.02,m.steel,5);
 const hoops=[];for(let y=y0+2.3;y<y1-.1;y+=.95)hoops.push(y);for(const y of hoops)this.torus(px,y,pz,.44,.018,m.yellow,'y',PI,18,-(az-PI/2));
 if(hoops.length)for(const k of [-.75,0,.75]){const a=az+k*PI/2*.9,qx=px+Math.cos(a)*.44,qz=pz+Math.sin(a)*.44;this.cylAB([qx,hoops[0],qz],[qx,hoops[hoops.length-1],qz],.012,m.yellow,4)}
 if(wall)for(let y=y0+1.1;y<y1;y+=2.5)for(const s of [-1,1])this.cylAB([px-ox*.0+tx*hw*s,y,pz+tz*hw*s],[px-ox*wall+tx*hw*s,y,pz-oz*wall+tz*hw*s],.03,m.frame2,5)};
P.ladderV=function(cx,cz,r,az,y0,y1){const rad=r+.42;this.ladderAt(cx+Math.cos(az)*rad,cz+Math.sin(az)*rad,az,y0,y1,.42)};
// ---------------------------------------------------------------- po'lat karkas
P.hbeam=function(a,b,w=.22,h=.3,mat=this.m.frame){const A=new V3(...a),B=new V3(...b),d=B.clone().sub(A),L=d.length();if(L<1e-4)return;const dir=d.clone().normalize();const g=[];const web=new T.BoxGeometry(L,h*.88,.03),fl1=new T.BoxGeometry(L,.035,w),fl2=new T.BoxGeometry(L,.035,w);fl1.translate(0,h*.5,0);fl2.translate(0,-h*.5,0);const m4=new T.Matrix4();const q=new T.Quaternion().setFromUnitVectors(new V3(1,0,0),dir);const mid=A.clone().add(B).multiplyScalar(.5);m4.compose(mid,q,new V3(1,1,1));for(const gg of [web,fl1,fl2]){gg.applyMatrix4(m4);this.S(mat).push(gg)}};
P.column=function(x,z,y0,y1,mat=this.m.frame){const h=.3,w=.28;const web=new T.BoxGeometry(.035,y1-y0,h*.9),f1=new T.BoxGeometry(w,y1-y0,.04),f2=new T.BoxGeometry(w,y1-y0,.04);f1.translate(0,0,h/2);f2.translate(0,0,-h/2);for(const g of [web,f1,f2]){g.translate(x,(y0+y1)/2,z);this.S(mat).push(g)}this.box(x,y0+.06,z,.5,.12,.5,this.m.frame2);for(const [dx,dz] of [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]])this.cylY(x+dx,z+dz,.0,.18,.025,this.m.bolt,6)};
P.brace=function(a,b){this.cylAB(a,b,.035,this.m.frame2,5)};
// ---------------------------------------------------------------- sovitgichlar uchun po'lat konstruksiya
P.buildCoolerFrame=function(){const m=this.m,X=[-15.8,-11,-6.2],Z=[-2.1,2.1],top=9.9;const beamTops=[7.5,4.2,.9];
 for(const x of X)for(const z of Z)this.column(x,z,.0,top);
 // yarus to'sinlari (x yo'nalishida va z yo'nalishida)
 for(const by of [...beamTops.map(y=>y-.15),top]){for(const z of Z)this.hbeam([X[0],by,z],[X[2],by,z],.2,.3);for(const x of X)this.hbeam([x,by,Z[0]],[x,by,Z[1]],.2,.28)}
 for(const by of beamTops)for(const x of [-13.2,-8.6])for(const z of [-.55,.55])this.hbeam([x-.0,by-.0-.1,Z[0]],[x,by-.1,Z[1]],.16,.2);
 // X-bog'lanishlar: orqa va yon tekisliklar
 const lv=[0,.9-.15,4.2-.15,7.5-.15,top];
 for(let i=0;i<lv.length-1;i++){const ya=lv[i]+.15,yb=lv[i+1]-.15;for(let k=0;k<2;k++){this.brace([X[k],ya,Z[0]],[X[k+1],yb,Z[0]]);this.brace([X[k+1],ya,Z[0]],[X[k],yb,Z[0]])}for(const x of [X[2]]){this.brace([x,ya,Z[0]],[x,yb,Z[1]]);this.brace([x,ya,Z[1]],[x,yb,Z[0]])}}
 // old tekislikdagi bog'lanish faqat yuqori yarusda
 // tushaklar (platformalar): old tomon (z>0)
 for(const by of beamTops){const g=new T.BoxGeometry(9.6,.05,1.7);g.translate(-11,by+.02,2.0+.35);const mm=new T.Mesh(g,m.grating);mm.material.map.repeat.set(1,1);mm.receiveShadow=true;mm.castShadow=true;this.scene.add(mm);for(const x of [-15.8,-13.4,-11,-8.6,-6.2])this.hbeam([x,by-.05,Z[1]],[x,by-.05,2.9],.14,.2,m.frame2);
  // old chetida panjara
  const zf=2.88;for(let i=0;i<=22;i++){const x=-15.9+i*(9.8/22);this.cylAB([x,by,zf],[x,by+1.1,zf],.028,m.yellow,6)}this.cylAB([-15.9,by+1.1,zf],[-6.1,by+1.1,zf],.034,m.yellow,8);this.cylAB([-15.9,by+.55,zf],[-6.1,by+.55,zf],.026,m.yellow,8);this.cylAB([-15.9,by+.06,zf],[-6.1,by+.06,zf],.04,m.yellow,8);
  for(const x of [-15.9,-6.1]){this.cylAB([x,by+1.1,zf],[x,by+1.1,Z[1]-.3],.034,m.yellow,8);this.cylAB([x,by+.55,zf],[x,by+.55,Z[1]-.3],.026,m.yellow,8)}}
 // zinalar: chap tomonda (har yarus orasida) + yuqori yarusga
 this.ladderAt(-16.6,2.5,PI,0,8.65,0);for(const y of [0.95,4.25]){}
 this.ladderAt(-6.0,3.1,0,0,4.45,0);
 // tomning yengil to'siqlari va chiroqlar
 for(const [x,y] of [[-13.4,2.6],[-8.6,2.6],[-13.4,5.9],[-8.6,5.9],[-13.4,9.2],[-8.6,9.2]]){const gl=this.m.lamp;this.box(x,y,2.0,.6,.08,.16,gl);this.cylAB([x,y,2.0],[x,y+.25,1.9],.02,m.dark,4)}
 this.frameLamps=[[-13.4,3.1,1.8],[-8.6,6.4,1.8],[-11,9.7,1.8]];
 for(const [x,y,z] of this.frameLamps){const l=new T.PointLight(0xffd7a0,0,16,1.7);l.position.set(x,y,z);this.scene.add(l);this.lampLights.push(l)}
 // sovitgich yuk elementlari: kabel trasi
 this.box(-11,9.55,-2.3,9.6,.05,.3,m.dark);
};
// ---------------------------------------------------------------- sovitgichlar (shell & tube)
P.buildCoolers=function(){const m=this.m;this.coolers=[];
 TY.forEach((yc,j)=>{const x0=-14.7,x1=-7.4,r=.7,eq='cool'+j,nm=['EA-1706A','EA-1706B','EA-1706C'][j];
  const mk=(cut)=>{const g=new T.CylinderGeometry(r,r,x1-x0,48,1,true,cut?.7:0,cut?3.9:PI*2);g.rotateZ(-PI/2);g.translate((x0+x1)/2,yc,0);return g};
  const outer=new T.Mesh(mk(false),m.shell);outer.castShadow=true;outer.receiveShadow=true;outer.userData.eq=eq;this.scene.add(outer);this.picks.push(outer);
  const inner=new T.Mesh(mk(false),m.inner);inner.receiveShadow=true;inner.userData.eq=eq;this.picks.push(inner);this.scene.add(inner);this.shells.push({kind:'x',outer,inner,mk});
  // kanal boshi (chap) va orqa qopqoq (o'ng)
  const dome=(xa,dir)=>{const pts=[];for(let k=0;k<=10;k++){const t=k/10*PI/2;pts.push(new T.Vector2(Math.max(.001,.78*Math.cos(t)),dir*(.34*Math.sin(t))))}const g=new T.LatheGeometry(pts,40);g.rotateZ(-PI/2);g.translate(xa,yc,0);return g};
  this.cylAB([x0-.62,yc,0],[x0,yc,0],.78,m.shell,40);this.S(m.shell).push(dome(x0-.62,-1));this.cylAB([x1,yc,0],[x1+.45,yc,0],.76,m.shell,40);this.S(m.shell).push(dome(x1+.45,1));
  // flanga halqalari va boltlari
  for(const [xx,rr] of [[x0,.84],[x0-.04,.84],[x1,.84],[x1+.04,.84]]){this.disc(xx,yc,0,rr,.07,m.steel,'x',40)}
  for(const xx of [x0-.02,x1+.02])for(let i=0;i<22;i++){const a=i/22*PI*2;this.disc(xx,yc+Math.cos(a)*.8,Math.sin(a)*.8,.03,.16,m.bolt,'x',6)}
  // armatura halqalari (stiffeners) va payvand
  for(const xx of [-13.6,-12.4,-11.2,-10,-8.8])this.torus(xx,yc,0,r+.008,.013,m.dark,'x');
  // saddlelar
  for(const xx of [-13.3,-8.8]){this.box(xx,yc-.62,0,.5,.12,1.2,m.dark);const g=new T.CylinderGeometry(r+.04,r+.04,.4,24,1,true,PI/2,PI);g.rotateZ(PI/2);g.rotateY(PI/2);g.translate(xx,yc,0);const mm=new T.Mesh(g,m.dark);mm.material.side=T.DoubleSide;this.S(m.dark).push(g);for(const zz of [-.5,.5])this.disc(xx+.15,yc-.7,zz,.03,.12,m.bolt,'y',6)}
  // patrubkalar: gaz kirish (o'q bo'yicha chap), chiqish (yuqori), suv (orqa)
  this.nozzle(x0-.62-.45,yc,0,'x',-.0,.22);this.cylAB([x0-1.07,yc,0],[x0-1.55,yc,0],.22,m.shell,16);this.flange([x0-1.55,yc,0],.34,'x',8);
  this.cylAB([-8.4,yc+.66,0],[-8.4,yc+1.0,0],.21,m.shell,16);this.flange([-8.4,yc+1.0,0],.33,'y',8);
  this.cylAB([-13.6,yc-.18,-.66],[-13.6,yc-.18,-1.1],.11,m.shell,12);this.flange([-13.6,yc-.18,-1.1],.19,'z',6);
  this.cylAB([-8.6,yc+.18,-.66],[-8.6,yc+.18,-1.1],.11,m.shell,12);this.flange([-8.6,yc+.18,-1.1],.19,'z',6);
  // ventilyatsiya/drenaj stubi
  this.cylAB([-12.2,yc+.69,0],[-12.2,yc+.95,0],.04,m.steel,6);this.cylAB([-12.2,yc-.69,0],[-12.2,yc-.92,0],.04,m.steel,6);
  // ichki quvur dastasi va to'siqlar
  for(let rr=-3;rr<=3;rr++)for(let cc=-3;cc<=3;cc++)if(rr*rr+cc*cc<=9){const yy=yc+rr*.15,zz=cc*.15;this.cylAB([x0+.1,yy,zz],[x1-.1,yy,zz],.026,m.pipe,6)}
  for(let k=0;k<6;k++){const xx=x0+.9+k*1.15;const g=new T.CircleGeometry(r-.03,28,k%2?PI:0,PI*1.35);g.rotateY(PI/2);g.translate(xx,yc,0);const mat=new T.MeshStandardMaterial({color:0x6c8393,metalness:.6,roughness:.5,side:T.DoubleSide});const mm=new T.Mesh(g,mat);this.scene.add(mm)}
  // nom plastinasi
  this.plate(nm,-11,yc+.06,r+.012,0,1.5);
  // termometr va manometr
  this.cylAB([-9.8,yc+.69,0],[-9.8,yc+1.0,0],.03,m.steel,6);this.disc(-9.8,yc+1.08,0,.1,.06,m.white,'z',16);
  this.coolers.push({yc,eq});
 });
};
// ---------------------------------------------------------------- quvur estakadasi (sharqiy tomon)
P.buildPipeRack=function(){const m=this.m,X=[13.2,18.4,23.6],Z=[-3.0,-9.4],H=[8.35,9.9];
 for(const x of X)for(const z of Z)this.column(x,z,.0,H[1]+.9);
 for(const by of H){for(const x of X)this.hbeam([x,by,Z[0]],[x,by,Z[1]],.18,.26);for(const z of Z)this.hbeam([X[0],by-.0,z],[X[2]+.0,by,z],.16,.24)}
 for(let i=0;i<2;i++)for(const z of Z){this.brace([X[i],.3,z],[X[i+1],H[0]-.1,z]);this.brace([X[i+1],.3,z],[X[i],H[0]-.1,z])}
 for(const x of X)for(const z of Z){}
 // kabel trasi
 this.box(18.4,H[1]+.55,-6.2,10.6,.05,.4,m.dark);
};
})();
(()=>{'use strict';
const PS=window.__PS;if(!PS)return;const {T,rnd,mergeList}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype,UP=new V3(0,1,0);
const FLOW={gas:0xbfeaff,a:0xbfeaff,b:0xbfeaff,c:0xbfeaff,out:0xbfeaff,lean:0x7bf2c0,wash:0xcdb8ff,water:0xb7a4ff,rich:0xffd37a,drain:0xdcc0ff,cw:0x8fb0ff,relief:0xffffff};
const BAND={gas:0x2f78d0,a:0x2f78d0,b:0x2f78d0,c:0x2f78d0,out:0x2f78d0,lean:0x2ea34a,wash:0x8a6bd0,water:0x8a6bd0,rich:0xd9a51a,drain:0x9a6a3a,cw:0x14a0b0,relief:0xd02828};
function perp(t){const a=Math.abs(t.y)>.9?new V3(1,0,0):new V3(0,1,0);const e1=new V3().crossVectors(t,a).normalize();const e2=new V3().crossVectors(t,e1).normalize();return [e1,e2]}
P.bandMat=function(k){this._bm=this._bm||{};const c=BAND[k]||0x888888;return this._bm[c]||(this._bm[c]=new T.MeshStandardMaterial({color:c,roughness:.5,metalness:.25}))};
// quvur flanesi (yo'nalish bo'yicha)
P.flangeAt=function(pt,tan,rad,mat){const m=this.m;mat=mat||m.steel;const q=new T.Quaternion().setFromUnitVectors(UP,tan);const g=new T.CylinderGeometry(rad,rad,.07,18);g.applyQuaternion(q);g.translate(pt.x,pt.y,pt.z);this.S(mat).push(g);
 const [e1,e2]=perp(tan);for(let i=0;i<6;i++){const a=i/6*PI*2,o=e1.clone().multiplyScalar(Math.cos(a)*rad*.78).add(e2.clone().multiplyScalar(Math.sin(a)*rad*.78));const b=new T.CylinderGeometry(rad*.09,rad*.09,.15,5);b.applyQuaternion(q);b.translate(pt.x+o.x,pt.y+o.y,pt.z+o.z);this.S(m.bolt).push(b)}};
// ---------------------------------------------------------------- quvur
P.pipe=function(pts,r,key,o={}){const m=this.m,Vs=pts.map(p=>new V3(...p)),cp=new T.CurvePath();let prev=Vs[0].clone();
 for(let i=1;i<Vs.length-1;i++){const a=Vs[i-1],b=Vs[i],c=Vs[i+1],u=b.clone().sub(a),v=c.clone().sub(b),lu=u.length(),lv=v.length();u.normalize();v.normalize();if(u.dot(v)>.999)continue;
  const ra=Math.min(o.bend??Math.max(.5,r*3),lu*.45,lv*.45),p1=b.clone().addScaledVector(u,-ra),p2=b.clone().addScaledVector(v,ra);if(prev.distanceTo(p1)>1e-4)cp.add(new T.LineCurve3(prev,p1));cp.add(new T.QuadraticBezierCurve3(p1,b.clone(),p2));prev=p2}
 cp.add(new T.LineCurve3(prev,Vs[Vs.length-1].clone()));const L=cp.getLength();
 const tube=new T.TubeGeometry(cp,Math.max(8,Math.ceil(L/.3)),r,12,false);const mesh=new T.Mesh(tube,o.mat||m.pipe);mesh.castShadow=true;mesh.receiveShadow=true;if(key&&o.pick!==false){mesh.userData.eq=key;this.picks.push(mesh)}this.scene.add(mesh);
 // identifikatsiya belbog'lari va flanes
 const bm=this.bandMat(key);for(let d=1.4;d<L-.3;d+=3.1){const u=d/L,pt=cp.getPointAt(u),tg=cp.getTangentAt(u).normalize();const g=new T.CylinderGeometry(r+.014,r+.014,.16,12);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(UP,tg));g.translate(pt.x,pt.y,pt.z);this.S(bm).push(g)}
 if(o.fl!==false){for(let d=4.6;d<L-1;d+=5.2){const u=d/L;this.flangeAt(cp.getPointAt(u),cp.getTangentAt(u).normalize(),r*1.7)}this.flangeAt(cp.getPointAt(0),cp.getTangentAt(0).normalize(),r*1.7);this.flangeAt(cp.getPointAt(1),cp.getTangentAt(1).normalize(),r*1.7)}
 // pastdagi quvurlar uchun tayanchlar (sleeper)
 for(let d=2;d<L-1;d+=4){const pt=cp.getPointAt(d/L);if(pt.y<1.5&&pt.y>.3){this.box(pt.x,.12,pt.z,.45,.24,Math.max(.7,r*3.6),this.m.conc);this.box(pt.x,pt.y-r*.6,pt.z,.1,r*1.2,r*2.6,this.m.dark)}}
 // oqim zarralari
 if(key){const cnt=Math.max(8,Math.min(40,Math.round(L/1.5))),col=FLOW[key]||0xffffff;const im=new T.InstancedMesh(new T.ConeGeometry(r*1.12,r*3,8),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.92}),cnt);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.frustumCulled=false;this.scene.add(im);
  this.flows.push({curve:cp,key,im,len:L,matrix:new T.Matrix4(),quaternion:new T.Quaternion(),up:new V3(0,1,0),scale:new V3(1,1,1),count:cnt})}
 return cp};
// ---------------------------------------------------------------- klapan (yashil korpus, ochiq/yopiq rangi)
P.valve=function(p,axis,key,r=.2,o={}){const m=this.m,dir={x:[1,0,0],y:[0,1,0],z:[0,0,1]}[axis],dv=new V3(...dir);let mat;
 if(o.stat)mat=m.green;else{this.vm=this.vm||{};mat=this.vm[key]||(this.vm[key]=new T.MeshStandardMaterial({color:0x2f9c3e,metalness:.35,roughness:.4}))}
 const cy=new T.CylinderGeometry(r*1.45,r*1.45,.7,18),sp=new T.SphereGeometry(r*2.0,16,10);if(axis==='x')cy.rotateZ(PI/2);else if(axis==='z')cy.rotateX(PI/2);
 const body=mergeList([cy,sp]);body.translate(p[0],p[1],p[2]);
 if(o.stat)this.S(mat).push(body);else{const mesh=new T.Mesh(body,mat);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.eq=key;this.picks.push(mesh);this.scene.add(mesh)}
 for(const s of [-1,1])this.flangeAt(new V3(p[0]+dir[0]*.4*s,p[1]+dir[1]*.4*s,p[2]+dir[2]*.4*s),dv,r*1.9);
 const x=p[0],y=p[1]+r*1.9,z=p[2];this.cylAB([x,y-.1,z],[x,y+.5,z],.065,m.steel,8);this.disc(x,y+.38,z,r*.9,.2,m.dark,'y',14);
 let wheel=null;
 if(o.act){const ay=y+.86;this.cylAB([x-.13,y+.4,z],[x-.13,ay-.14,z],.025,m.steel,5);this.cylAB([x+.13,y+.4,z],[x+.13,ay-.14,z],.025,m.steel,5);this.cylAB([x,y+.45,z],[x,ay-.14,z],.035,m.steel,6);
  this.disc(x,ay,z,.3,.3,m.blue,'y',20);const dome=new T.SphereGeometry(.3,18,8,0,PI*2,0,PI/2);dome.translate(x,ay+.15,z);this.S(m.blue).push(dome);this.box(x+.36,ay-.05,z,.2,.26,.2,m.black);this.cylAB([x+.3,ay-.05,z],[x+.2,ay-.05,z],.02,m.steel,4);this.torus(x,ay,z,.3,.014,m.dark,'y')}
 else{const wy=y+.98;this.cylAB([x-.12,y+.4,z],[x-.12,wy-.04,z],.025,m.steel,5);this.cylAB([x+.12,y+.4,z],[x+.12,wy-.04,z],.025,m.steel,5);
  const tr=new T.TorusGeometry(.26,.028,6,18);tr.rotateX(PI/2);const sa=new T.CylinderGeometry(.018,.018,.52,4);sa.rotateZ(PI/2);const sb=new T.CylinderGeometry(.018,.018,.52,4);sb.rotateX(PI/2);const wg=mergeList([tr,sa,sb]);
  if(o.stat){wg.translate(x,wy,z);this.S(m.red).push(wg)}else{wheel=new T.Mesh(wg,m.red);wheel.position.set(x,wy,z);wheel.castShadow=true;this.scene.add(wheel)}}
 if(!o.stat)this.valves[key]={m:mat,wheel}};
P.hv=function(p,axis,r=.12){this.valve(p,axis,null,r,{stat:true})};
// ---------------------------------------------------------------- saqlash klapani (PSV)
P.psv=function(x,y,z){const m=this.m;this.cylAB([x,y,z],[x,y+.6,z],.13,m.pipe,10);this.flangeAt(new V3(x,y+.6,z),UP,.22);const b=new T.CylinderGeometry(.2,.24,.5,14);b.translate(x,y+.9,z);this.S(m.yellow).push(b);const sp=new T.CylinderGeometry(.12,.12,.55,12);sp.translate(x,y+1.4,z);this.S(m.yellow).push(sp);this.sphere(x,y+1.7,z,.13,m.yellow);this.cylAB([x,y+.9,z],[x,y+.9,z-.55],.11,m.pipe,10);this.flangeAt(new V3(x,y+.9,z-.55),new V3(0,0,-1),.19);this.cylAB([x,y+1.2,z],[x+.3,y+1.2,z],.015,m.dark,4)};
// ---------------------------------------------------------------- yorliqlar
P.label=function(text,p,key,width=3.8){const c=document.createElement('canvas');c.width=512;c.height=116;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c);const sp=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false,transparent:true}));sp.position.set(...p);sp.scale.set(width,width*116/512,1);sp.renderOrder=100;this.scene.add(sp);const o={text,p,key,c,ctx,tex,sp};this.labels.push(o);this.paintLabel(o,'');return o};
P.paintLabel=function(o,value){if(o.value===value)return;o.value=value;const x=o.ctx;x.clearRect(0,0,512,116);x.fillStyle='#0c1c2eea';x.beginPath();x.roundRect(1,1,510,114,12);x.fill();x.strokeStyle='#54758e';x.lineWidth=2;x.stroke();x.textAlign='center';x.fillStyle='#eaf4fc';x.font='600 32px Segoe UI, Arial';x.fillText(PS.tx(o.text),256,45);x.fillStyle=value.includes('BAD')?'#f5bc63':'#70d8d0';x.font='25px Segoe UI, Arial';x.fillText(PS.tx(value),256,87);o.tex.needsUpdate=true};
// ---------------------------------------------------------------- manometr
P.gauge=function(p,key,tag){const m=this.m;this.cylAB([p[0],p[1],p[2]-.55],[p[0],p[1],p[2]-.05],.035,m.steel,6);this.cylAB([p[0],p[1]+.0,p[2]-.1],[p[0],p[1]+.0,p[2]-.1],.01,m.steel,4);
 const body=new T.Mesh(new T.CylinderGeometry(.17,.17,.13,24),m.steel);body.rotation.x=PI/2;body.position.set(p[0],p[1],p[2]);body.castShadow=true;body.userData.eq=key;this.picks.push(body);this.scene.add(body);
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#edf1e9';x.fillRect(0,0,128,128);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
 const face=new T.Mesh(new T.CircleGeometry(.15,24),new T.MeshBasicMaterial({map:tex}));face.position.set(p[0],p[1],p[2]+.07);this.scene.add(face);this.gauges.push({key,tag,ctx:x,tex,last:null})};
// ---------------------------------------------------------------- quvur tarmog'i
P.buildPiping=function(){const m=this.m,TY=PS.TY;
 // gaz kirish (stantsiya chegarasidan) va stoyak
 this.pipe([[-31,.9,0],[-18.4,.9,0],[-18.4,TY[0],0],[-16.25,TY[0],0]],.26,'gas');
 this.pipe([[-18.4,TY[1],0],[-16.25,TY[1],0]],.2,'b');this.pipe([[-18.4,TY[2],0],[-16.25,TY[2],0]],.2,'c');
 ['a','b','c'].forEach((k,j)=>{const yc=TY[j];this.valve([-17.35,yc,0],'x',k,.2,{act:true});
  // chiqish: sovitgich tepasidan kollektorga
  this.pipe([[-8.4,yc+1.0,0],[-8.4,yc+1.8,0],[-5.4,yc+1.8,0]],.2,k,{fl:false});
  // sovitish suvi
  this.pipe([[-13.6,yc-.18,-4.0],[-13.6,yc-.18,-1.1]],.1,'cw',{fl:false});this.pipe([[-8.6,yc+.18,-1.1],[-8.6,yc+.18,-4.0]],.1,'cw',{fl:false});this.hv([-13.6,yc-.18,-2.9],'z',.1);this.hv([-8.6,yc+.18,-2.9],'z',.1)});
 // kollektor + FA-1702 ga
 this.pipe([[-5.4,TY[0]+1.8,0],[-5.4,TY[2]+1.8,0]],.26,'gas');this.pipe([[-5.4,4.4,0],[-5.4,4.4,2],[-4.1,4.4,2]],.26,'gas');
 // FA-1702 -> DA-1701
 this.pipe([[-2.5,8.25,2],[-2.5,9.3,2],[1.9,9.3,2],[1.9,9.3,0],[1.9,4.2,0],[2.85,4.2,0]],.26,'gas');this.hv([-0.2,9.3,2],'x',.17);
 // tozalangan gaz (yuqoriga) -> EA-1821
 this.pipe([[5,18.9,0],[5,20.6,0],[15,20.6,0],[15,20.6,-4.4],[15,9.4,-4.4],[30,9.4,-4.4]],.26,'out');this.valve([10.5,20.6,0],'x','out',.22,{act:true});
 // to'yinmagan amin
 this.pipe([[30,8.7,-7.2],[11.2,8.7,-7.2],[11.2,12.1,-7.2],[11.2,12.1,-3.0],[5,12.1,-3.0],[5,12.1,-2.2]],.19,'lean');this.valve([8.2,12.1,-3.0],'x','lean',.17,{act:true});this.hv([20,8.7,-7.2],'x',.15);
 // yuvish kondensati
 this.pipe([[30,10.3,-5.6],[13.2,10.3,-5.6],[13.2,15.7,-5.6],[13.2,15.7,-3.4],[5,15.7,-3.4],[5,15.7,-2.2]],.12,'wash');this.valve([9.2,15.7,-3.4],'x','wash',.12,{act:true});
 // suv qatlami
 this.pipe([[7.15,13.5,0],[10.4,13.5,0],[10.4,2.2,0],[10.4,2.2,6.2],[30,2.2,6.2]],.13,'water');this.valve([14.5,2.2,6.2],'x','water',.13);this.hv([10.4,7.5,0],'y',.1);
 // to'yingan amin (pastdan)
 this.pipe([[5,1.4,0],[5,.75,0],[8.5,.75,0],[8.5,.75,4.4],[30,.75,4.4]],.22,'rich');this.valve([14,.75,4.4],'x','rich',.2,{act:true});
 // kondensat drenaji
 this.pipe([[-2.5,1.6,2],[-2.5,.6,2],[-2.5,.6,8],[30,.6,8]],.14,'drain');this.valve([3,.6,8],'x','drain',.14,{act:true});this.hv([-2.5,1.1,2],'y',.1);
 // sovitish suvi magistrallari
 this.pipe([[-24,.55,-5.6],[-13.6,.55,-5.6],[-13.6,.55,-4.0],[-13.6,TY[0]+.15,-4.0]],.15,'cw');this.valve([-19,.55,-5.6],'x','cw',.15);
 this.pipe([[-8.6,TY[0]+.15,-4.0],[-8.6,.9,-4.0],[-8.6,.9,-6.4],[-24,.9,-6.4]],.15,'cw');
 // saqlash klapanlari kollektori
 this.pipe([[6.2,18.1,0],[6.2,19.9,0],[6.2,19.9,-3.5],[14.2,19.9,-3.5]],.16,'relief');for(const x of [7.4,8.9,10.4,11.9,13.4])this.psv(x,19.9,-3.5);
 // quvurni ushlab turuvchi stanchion (tik quvur uchun)
 this.column(15.8,-5.4,0,21.2,this.m.frame);for(const y of [9.9,15,20.1]){this.hbeam([15.8,y,-5.4],[15.0,y,-4.4],.12,.16,this.m.frame2);this.torus(15,y,-4.4,.36,.03,this.m.dark,'y')}
 // quvur ko'prigi va qo'shimcha po'lat to'sinlar
 this.hbeam([13.2,20.2,-5.4],[15.8,20.2,-5.4],.12,.16,this.m.frame2);
};
// ---------------------------------------------------------------- asboblar
P.buildInstruments=function(){const m=this.m;
 this.gauge([1.9,7.0,.85],'gas','FCI17001');this.cylAB([1.9,7.0,.0],[1.9,7.0,.8],.04,m.steel,6);
 this.gauge([8.0,20.6,.9],'tower','TI17005');this.cylAB([8.0,20.6,.0],[8.0,20.6,.85],.04,m.steel,6);
 // uzatgichlar va sezgichlar
 const xm=(x,y,z,dz=0)=>{this.box(x,y,z,.28,.4,.22,m.black);this.cylAB([x,y-.2,z],[x,y-.55,z-dz],.025,m.steel,5);this.box(x,y+.0,z+.12,.2,.14,.02,m.white)};
 xm(-17.9,TY0(),.55);xm(-5.0,6.5,.7);xm(1.35,6.2,.5);xm(7.6,16.2,-3.4+.5);xm(9.4,2.9,.7);xm(-0.4,3.2,3.2);
 // darajani o'lchash transmitterlari (kolonna va separator)
 for(const p of [[7.1,3.1,1.9],[7.1,12.8,1.9],[-1.0,3.0,3.1]]){this.box(p[0],p[1],p[2],.16,1.1,.16,m.dark);this.box(p[0],p[1],p[2]+.09,.07,.95,.035,new T.MeshStandardMaterial({color:0x4eb7b2,emissive:0x193e41}))}
 // yorliqlar
 this.label('DA-1701',[5,22.0,2.0],'tower',4.4);this.label('FA-1702',[-2.5,9.7,3.4],'sep',3.8);PS.TY.forEach((yc,j)=>this.label(['EA-1706A','EA-1706B','EA-1706C'][j],[-11,yc+1.9,3.4],'cool'+j,4.0));
 this.label('Gaz → EA-1821',[20,21.5,-2.4],'out',4.4);this.label('To‘yinmagan amin',[17,10.6,-7.2],'lean',4.4);this.label('To‘yingan amin',[17,1.9,4.4],'rich',4.4);
};
function TY0(){return PS.TY[0]}
// ---------------------------------------------------------------- rus tablichkalari
P.sign=function(text,x,y,z,ry,w=3.4,dir=1,posts=true){const c=document.createElement('canvas');c.width=520;c.height=170;const g=c.getContext('2d');const paint=()=>{const lines=PS.tx(text).split('\n');g.clearRect(0,0,520,170);g.fillStyle='#08090b';g.fillRect(0,0,520,170);g.strokeStyle='#d9dde0';g.lineWidth=5;g.strokeRect(5,5,510,160);g.fillStyle='#fff';g.font='700 38px Arial';g.textBaseline='middle';g.textAlign='left';
 lines.forEach((ln,i)=>g.fillText(ln,22,lines.length===1?60:44+i*48));g.font='700 58px Arial';g.textAlign='right';g.fillText(dir>0?'→':'←',500,132)};paint();
 const tex=new T.CanvasTexture(c);tex.userData.redraw=()=>{paint();tex.needsUpdate=true};PS.dyn.push(tex);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;const h=w*170/520;
 const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,color:0xdadada}));mesh.position.set(x,y,z);mesh.rotation.y=ry;this.scene.add(mesh);
 const back=new T.Mesh(new T.BoxGeometry(w+.12,h+.12,.04),this.m.dark);back.position.set(x-Math.sin(ry)*.025,y,z-Math.cos(ry)*.025);back.rotation.y=ry;this.scene.add(back);
 if(posts){const tx=Math.cos(ry),tz=-Math.sin(ry);for(const s of [-1,1]){const px=x+tx*w*.42*s-Math.sin(ry)*.08,pz=z+tz*w*.42*s-Math.cos(ry)*.08;this.cylAB([px,0,pz],[px,y+h/2,pz],.045,this.m.dark,6)}}};
P.buildSigns=function(){const R=PI/2;
 this.sign('ПРИРОД. ГАЗ\nОТ ГРАН. УСТ.',-24.5,2.3,1.6,.15,3.6,1);
 this.sign('ПРИРОД. ГАЗ К\nEA-1821',26.5,10.8,-3.2,1.0,3.5,1,false);this.cylAB([25.4,9.5,-4.4],[25.4,10.2,-3.8],.03,this.m.dark,4);
 this.sign('НЕНАСЫЩ. АМИН\nОТ EC-1701',26.3,7.3,-7.6,1.0,3.5,-1,false);
 this.sign('КОНДЕНСАТ ОТ\nEA-1131',26.0,11.8,-6.2,1.0,3.4,-1,false);
 this.sign('ЛИНИЯ\nПРОМЫВ. ВОДЫ',27.6,3.5,6.2,1.1,3.3,-1);
 this.sign('НАСЫЩ. АМИН К\nFA-1705',27.8,1.9,3.6,1.1,3.5,1);
 this.sign('КОНДЕНСАТ К\nFA-6908',27.4,1.8,8.8,1.1,3.4,1);
};
// ---------------------------------------------------------------- mahalliy stansiya (I/O shkaflar)
P.buildStation=function(){const m=this.m;this.box(-.5,.25,11.1,5,.5,2,m.conc);
 const body=new T.Mesh(new T.BoxGeometry(4,2.5,1),new T.MeshStandardMaterial({color:0x687980,metalness:.45,roughness:.5}));body.position.set(-.5,1.75,11.1);body.castShadow=true;body.userData.eq='station';this.picks.push(body);this.scene.add(body);
 for(const x of [-1.8,-.5,.8]){this.box(x,1.75,11.62,1.15,2.25,.05,m.dark);this.box(x+.39,1.7,11.68,.035,.28,.05,m.steel);this.box(x,2.35,11.66,.75,.48,.04,new T.MeshStandardMaterial({color:0x153c49,emissive:0x0d2734}));for(let i=0;i<3;i++)this.sphere(x-.18+i*.18,1.95,11.68,.034,i?m.green:m.yellow);for(let y=.75;y<1.35;y+=.08)this.box(x,y,11.66,.8,.02,.015,m.rubber)}
 this.box(-.5,.35,7,5,.15,.35,m.dark);for(const x of [-3,2])this.cylAB([x,.4,10.4],[x,.4,3],.08,m.dark,6);
 this.label('Mahalliy I/O paneli',[-.5,3.9,11.1],'station',4.5)};
// ---------------------------------------------------------------- chiroq ustunlari
P.pole=function(x,z,dir,h=9.5){const m=this.m;this.cylY(x,z,0,h,.1,m.dark,8);this.box(x,.3,z,.55,.6,.55,m.conc);this.cylAB([x,h,z],[x+dir*1.3,h+.35,z],.06,m.dark,6);this.box(x+dir*1.35,h+.3,z,.8,.12,.4,m.lamp);
 const sp=new T.Sprite(new T.SpriteMaterial({map:this.glowT||(this.glowT=PS.glowTex()),transparent:true,blending:T.AdditiveBlending,depthWrite:false,depthTest:true}));sp.position.set(x+dir*1.35,h+.15,z);sp.scale.set(3.4,3.4,1);this.scene.add(sp);this.lampObjs.push(sp)};
// ---------------------------------------------------------------- fon: boshqa sex uskunalari
P.buildBackground=function(){const m=this.m,R=rnd(31);
 for(const [x,z,d] of [[-26,9,1],[-26,-13,1],[27,14,-1],[27,-16,-1],[-5,18,1],[19,-13.5,-1],[-34,-2,1]])this.pole(x,z,d);
 // uzoq: kolonnalar, idishlar, rezervuarlar, estakadalar, binolar
 for(let i=0;i<16;i++){const x=-95+i*13+R()*4,z=-46-R()*34,h=10+R()*20,r=1.1+R()*1.6;this.cylY(x,z,0,h,r,m.far,14);this.sphere(x,h,z,r*.98,m.far);if(i%2===0){for(let y=3;y<h-1;y+=3.4){this.box(x+r+.05,y,z,.2,.14,.2,m.lamp);}}
  this.cylAB([x+r*.4,2,z+r],[x+r*.4,h-2,z+r],.1,m.far,5)}
 for(const [x,z,r,h] of [[-70,-30,6,7],[-58,-38,5,6],[66,-34,7,8],[78,-24,6,7],[-80,18,6,6],[84,16,6.5,7]]){this.cylY(x,z,0,h,r,m.far,28);this.disc(x,h+.1,z,r*1.02,.25,m.far,'y',28);this.box(x+r,h*.5,z,.25,.14,.25,m.lamp)}
 for(let i=0;i<5;i++){const x=-60+i*28,z=-60;this.box(x+12,7,z,28,.4,1.6,m.far);for(let k=0;k<=4;k++)this.box(x+k*7,3.5,z,.4,7,.4,m.far);this.cylAB([x-2,7.8,z],[x+26,7.8,z],.35,m.far,6);this.cylAB([x-2,8.4,z+.3],[x+26,8.4,z+.3],.25,m.far,6)}
 for(const [x,z,w,d,h] of [[-48,-24,16,8,7],[50,-26,14,9,8],[-40,34,12,8,6]]){this.box(x,h/2,z,w,h,d,m.far);for(let i=0;i<8;i++)this.box(x-w/2+1.4+i*(w-2.8)/7,h*.6,z+d/2+.02,.9,.7,.04,m.lamp)}
 // mash'al
 const fx=-52,fz=-72;this.cylY(fx,fz,0,44,.7,m.far,10);this.cylY(fx,fz,38,44,.9,m.far,10);this.flare=new T.Sprite(new T.SpriteMaterial({map:this.glowT||(this.glowT=PS.glowTex()),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false,color:0xff8a3a}));this.flare.position.set(fx,46.6,fz);this.flare.scale.set(8,12,1);this.scene.add(this.flare);this.lampObjs.push(this.flare);
 // qo'shni kolonna chiroqlari (uzoq nuqtalar)
 for(let i=0;i<26;i++){const x=-120+R()*240,z=-90-R()*30;this.box(x,2+R()*10,z,.4,.3,.4,m.lamp)}
};
// ---------------------------------------------------------------- jarayon qatlamlari (kesimda)
P.buildProcess=function(){this.processLayers=[];this.trayFilms=[];
 for(const d of window.AmineProcess.definitions){const mat=new T.MeshStandardMaterial({color:d.color,emissive:d.color,emissiveIntensity:d.shape==='bubble'?.25:.1,roughness:.18,metalness:.15,transparent:true,opacity:d.shape==='bubble'?.66:.9,depthWrite:false});
  const geo=d.shape==='bubble'?new T.SphereGeometry(.05,7,5):new T.SphereGeometry(.037,6,4);const im=new T.InstancedMesh(geo,mat,d.n);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.frustumCulled=false;im.userData.processLayer=d.id;im.renderOrder=3;this.scene.add(im);this.processLayers.push({d,im})}
 for(const y of [5.2,7.6,10,12.5,14.0]){const mm=new T.Mesh(new T.CylinderGeometry(1.55,1.55,.05,48),new T.MeshStandardMaterial({color:0x46b493,transparent:true,opacity:.3,roughness:.15,depthWrite:false}));mm.position.set(5,y+.07,0);this.scene.add(mm);this.trayFilms.push(mm)}
 this.processDummy=new T.Object3D();
 this.label('Yuvish bo‘limi',[9.2,15.3,1.2],'zoneWash',3.5);this.label('Qarama-qarshi oqim',[9.2,9.7,1.2],'zoneContact',3.5);this.label('Pastki inventar',[9.2,3.2,1.2],'zoneSump',3.5)};
// ---------------------------------------------------------------- sichqoncha: tanlash
P.bindPointer=function(){this.ray=new T.Raycaster();this.pointer=new T.Vector2();let down;const cv=this.renderer.domElement;
 cv.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
 cv.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const b=cv.getBoundingClientRect();this.pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const hit=this.ray.intersectObjects(this.picks,false)[0];if(hit&&hit.object.userData.eq)this.pick(hit.object.userData.eq)})};
})();
(()=>{'use strict';
const PS=window.__PS;if(!PS)return;const {T}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype;
const LOOK={
 dusk:{sky:[[0,'#0a1230'],[.2,'#17285a'],[.34,'#3d4682'],[.43,'#a65d86'],[.475,'#f08a5a'],[.5,'#fbbd7c'],[.508,'#4a4256'],[.6,'#2a2f40'],[1,'#1a1f2b']],fog:0x5a4a64,fn:70,ff:240,
  env:[[0,'#1e2f62'],[.38,'#6f6a98'],[.48,'#ffb070'],[.52,'#4a4150'],[1,'#151a26']],hemi:[0x7f95d6,0x4a3a32,1.05],sun:[0xffa060,2.7,[-42,13,28]],fill:[0x7f9cff,.75],expo:1.12,lamps:true,stars:true},
 day:{sky:[[0,'#2f6cb0'],[.35,'#7fb2e2'],[.47,'#d6e8f5'],[.5,'#f2f4ee'],[.508,'#8a949a'],[.6,'#68767e'],[1,'#4a5760']],fog:0xaebfca,fn:80,ff:260,
  env:[[0,'#4c78a6'],[.42,'#d6e6f2'],[.5,'#fff6de'],[.54,'#8c8b84'],[1,'#31394a']],hemi:[0xd8eaff,0x6c675c,1.25],sun:[0xffecd2,2.6,[-18,34,22]],fill:[0xbcdcff,.85],expo:1.2,lamps:false,stars:false}};
const grad=(w,h,stops)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,h);for(const [o,col] of stops)g.addColorStop(o,col);x.fillStyle=g;x.fillRect(0,0,w,h);return c};
P.setLook=function(k){const L=LOOK[k];this.look=k;
 const c=this.skyCtx.canvas,g=this.skyCtx.createLinearGradient(0,0,0,512);for(const [o,col] of L.sky)g.addColorStop(o,col);this.skyCtx.fillStyle=g;this.skyCtx.fillRect(0,0,4,512);this.skyTex.needsUpdate=true;
 this.scene.fog=new T.Fog(L.fog,L.fn,L.ff);this.stars.visible=L.stars;
 const et=new T.CanvasTexture(grad(512,256,L.env));et.mapping=T.EquirectangularReflectionMapping;et.colorSpace=T.SRGBColorSpace;const pm=new T.PMREMGenerator(this.renderer);if(this.envRT)this.envRT.dispose();this.envRT=pm.fromEquirectangular(et);this.scene.environment=this.envRT.texture;et.dispose();pm.dispose();
 this.hemi.color.setHex(L.hemi[0]);this.hemi.groundColor.setHex(L.hemi[1]);this.hemi.intensity=L.hemi[2];
 this.sun.color.setHex(L.sun[0]);this.sun.intensity=L.sun[1];this.sun.position.set(...L.sun[2]);this.sun.target.position.set(0,5,0);this.scene.add(this.sun.target);this.fill.color.setHex(L.fill[0]);this.fill.intensity=L.fill[1];
 this.renderer.toneMappingExposure=L.expo;this.lampLights.forEach((l,i)=>{l.intensity=L.lamps?(i<3?85:45):0});for(const o of this.lampObjs)o.visible=L.lamps;
 this.renderer.shadowMap.needsUpdate=true;const b=document.getElementById('aTod');if(b)b.textContent=k==='dusk'?'☾ Kechki':'☀ Kunduzgi'};
P.setCamera=function(id,smooth=true){if(!this.camera||!this.controls)return;this.viewId=id;
 const views={all:[[31,19,37],[-1,8.5,0]],tower:[[15,12.5,24],[5,10.3,0]],sep:[[-1,6.6,14.5],[-2.5,4.9,2]],cool:[[-19,8,15.5],[-11,5.2,0]],top:[[0,72,.1],[0,0,0]],station:[[8,7,23],[-.5,1.8,11.1]]};const v=views[id]||views.all;
 if(smooth){this.cameraMove={p0:this.camera.position.clone(),t0:this.controls.target.clone(),p1:new V3(...v[0]),t1:new V3(...v[1]),u:0}}else{this.camera.position.set(...v[0]);this.controls.target.set(...v[1]);this.controls.update()}};
P.setCut=function(on){if(!this.ready)return;this.cut=!!on;for(const s of this.shells){s.outer.geometry.dispose();s.outer.geometry=s.mk(on);s.inner.geometry.dispose();s.inner.geometry=s.mk(on)}for(const o of this.inside||[])o.visible=!!on;this.renderer.shadowMap.needsUpdate=true};
P.setQuality=function(q){if(!this.ready)return;this.quality=q;this.renderer.setPixelRatio(q==='low'?1:Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=q!=='low';this.renderer.shadowMap.needsUpdate=true;this.resize()};
P.resize=function(){if(!this.renderer||!this.camera)return;const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix()};
P.screenshot=function(){return this.renderer?.domElement.toDataURL('image/png')};
P.drawGauge=function(g,v){const txt=v===null?'BAD':v.toFixed(1);if(txt===g.last)return;g.last=txt;const x=g.ctx;x.fillStyle='#edf1e9';x.fillRect(0,0,128,128);x.strokeStyle='#526470';x.lineWidth=2;for(let i=0;i<=10;i++){const a=.75*PI+i/10*1.5*PI;x.beginPath();x.moveTo(64+Math.cos(a)*54,64+Math.sin(a)*54);x.lineTo(64+Math.cos(a)*44,64+Math.sin(a)*44);x.stroke()}
 if(v!==null){const max=g.key==='gas'?200:g.key==='tower'?150:100,a=.75*PI+Math.max(0,Math.min(1,v/max))*1.5*PI;x.strokeStyle='#b04435';x.lineWidth=5;x.beginPath();x.moveTo(64,64);x.lineTo(64+Math.cos(a)*40,64+Math.sin(a)*40);x.stroke()}x.fillStyle=v===null?'#ac6432':'#17364a';x.textAlign='center';x.font='bold 22px Arial';x.fillText(txt,64,108);g.tex.needsUpdate=true};
P.render=function(s,dt){if(!this.ready)return;const AP=window.AmineProcess;this.animTime+=dt||0;this.controls.autoRotate=this.auto;
 if(this.cameraMove){const m=this.cameraMove;m.u=Math.min(1,m.u+dt/1.1);const t=m.u*m.u*(3-2*m.u);this.camera.position.lerpVectors(m.p0,m.p1,t);this.controls.target.lerpVectors(m.t0,m.t1,t);if(m.u===1)this.cameraMove=null}this.controls.update();
 for(const [k,o] of Object.entries(this.liquids)){o.m.visible=this.cut&&s.physicalKnown?.[k]!==false;const h=Math.max(.015,s[k]/100*o.max);o.m.scale.y=h;o.m.position.y=o.base+h/2}
 for(const gl of this.glass){const h=Math.max(.01,Math.min(1,s[gl.key]/100))*(gl.yb-gl.ya);gl.lq.scale.y=h;gl.lq.position.y=gl.ya+h/2}
 for(const [key,v] of Object.entries(this.valves)){const q=s.actual[key];v.m.color.setHex(q>1?0x2f9c3e:0xb23a3a);if(v.wheel)v.wheel.rotation.y=q/100*PI*2}
 for(const f of this.flows){const k=f.key;const q=k==='gas'||k==='out'?s.g:k==='cw'?(s.cwFlow??s.actual.cw):k==='relief'?0:['a','b','c'].includes(k)?s.branches[['a','b','c'].indexOf(k)]*3:s[k]||0;f.im.visible=this.flow&&q>.05;
  if(f.im.visible){const ck=['gas','out'].includes(k)?'gas':k,cl=AP.clock(s,ck)*2.4/Math.max(4,f.len);for(let i=0;i<f.count;i++){const u=(cl+i/f.count)%1,u2=u<0?u+1:u;const pt=f.curve.getPointAt(u2);f.quaternion.setFromUnitVectors(f.up,f.curve.getTangentAt(u2).normalize());f.im.setMatrixAt(i,f.matrix.compose(pt,f.quaternion,f.scale))}f.im.instanceMatrix.needsUpdate=true}}
 for(const g of this.gauges){const v=g.key==='rich'?s.measured.L:g.key==='water'?s.W:g.key==='drain'?s.K:g.key==='gas'?s.g:s.To;this.drawGauge(g,v)}
 this.renderProcess(s);
 for(const o of this.labels){o.sp.visible=this.labelsOn&&(!o.key.startsWith('zone')||(this.cut&&this.viewId==='tower'));if(!o.sp.visible)continue;
  const value=o.key==='zoneWash'?`FCI17003 · ${s.wash.toFixed(1)} %Qref`:o.key==='zoneContact'?`Gaz ${s.g.toFixed(0)} / amin ${s.lean.toFixed(0)}`:o.key==='zoneSump'?`LC17003 · ${s.measured.L===null?'BAD':s.L.toFixed(1)+'%'}`:o.key==='tower'?(s.quality.L==='BAD'?'LC17003 · BAD / NaN':`LC17003 ${s.measured.L.toFixed(1)}% · ${s.To.toFixed(1)} °C`):o.key==='sep'?`LC17001 ${s.K.toFixed(1)}%`:o.key.startsWith('cool')?`TI17007 ${s.Ti.toFixed(1)} °C`:o.key==='out'?`${s.g.toFixed(1)} %Qref`:o.key==='lean'?`${s.lean.toFixed(1)} %Qref`:o.key==='rich'?`${s.rich.toFixed(1)} %Qref`:'O‘quv modeli';this.paintLabel(o,value)}
 if(this.flare&&this.flare.visible){const f=1+Math.sin(this.animTime*9)*.07+Math.sin(this.animTime*23)*.05;this.flare.scale.set(8*f,12*(2-f),1)}
 this.renderer.render(this.scene,this.camera)};
P.renderProcess=function(s){const AP=window.AmineProcess,dummy=this.processDummy;if(!dummy)return;
 for(const {d,im} of this.processLayers){const q=AP.rate(s,d.flow);im.visible=this.cut&&this.flow&&q>.05;if(!im.visible)continue;
  for(let i=0;i<d.n;i++){const p=AP.point(d,i,s),sc=p.size;dummy.position.set(p.x,p.y,p.z);dummy.scale.set(sc*(d.shape==='streak'?2.8:1),sc*(d.shape==='drop'?2.9:1),sc);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix)}im.instanceMatrix.needsUpdate=true;
  if(d.id.startsWith('cooler')){const hot=Math.max(0,Math.min(1,(s.Ti-25)/60));im.material.color.setRGB(.35+hot*.6,.77-hot*.26,.85-hot*.57)}}
 for(const o of this.surfaces){const {k,m}=o;m.visible=this.cut&&s.physicalKnown?.[k]!==false&&s[k]>.01;if(!m.visible)continue;const fk=k==='L'?'rich':k==='K'?'drain':'water',p=AP.clock(s,fk),amp=AP.rate(s,fk)>.1?.045:.01,a=m.geometry.attributes.position;
  for(let i=0;i<a.count;i++){const x=o.positions[i*3],y=o.positions[i*3+1];a.setZ(i,amp*(Math.sin(x*6+p*2.1)+Math.cos(y*7-p*1.7))*.5)}a.needsUpdate=true;
  m.position.set(o.x,o.base+s[k]*o.max/100+.012,o.z)}
 for(const film of this.trayFilms){film.visible=this.cut&&s.lean>.05;film.material.opacity=Math.min(.55,.15+s.lean*.002)}};
window.AmineScene=PS.PlantScene;
})();
