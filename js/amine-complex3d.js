(()=>{'use strict';
// ===== 3D: Sho'rtan gaz-kimyo majmuasi miqyosidagi sxematik sahna =====
// DA-1701 amin bloki markazda batafsil; atrofida majmuaning asosiy qurilmalari soddalashtirilgan (LOD) ko'rinishda:
// gaz qabul qilish (slag-kecher), amin regeneratsiyasi, oltingugurt olish, gazni quritish, kriogen ajratish, etilen (piroliz),
// polietilen, rezervuar parki, energetika va sovitish minoralari, mash'allar, estakadalar, yo'llar va temir yo'l.
// Joylashuv SXEMATIK — haqiqiy bosh rejadan olinmagan; o'lchamlar taxminiy (metr).
const PS=window.__PS;if(!PS||!PS.PlantScene)return;const {T,rnd}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype;
const M=(o)=>new T.MeshStandardMaterial(o);
// ---- realistik teksturalar (protsedura, internetsiz) ----
const TX={};
const tex=(k,f)=>TX[k]||(TX[k]=f());
const shellTex=()=>PS.canvasTex(512,256,(x,W,H)=>{const R=rnd(41);x.fillStyle='#d6d9d4';x.fillRect(0,0,W,H);const im=x.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*14;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0);
 x.strokeStyle='rgba(70,76,80,.35)';x.lineWidth=2;for(let y=0;y<=H;y+=42){x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();const off=(y/42)%2?64:0;for(let xx=off;xx<W;xx+=128){x.beginPath();x.moveTo(xx,y);x.lineTo(xx,y+42);x.stroke()}}
 for(let i=0;i<46;i++){const xx=R()*W,y0=R()*H,l=20+R()*90;const g=x.createLinearGradient(0,y0,0,y0+l);g.addColorStop(0,'rgba(120,86,52,.32)');g.addColorStop(1,'rgba(120,86,52,0)');x.fillStyle=g;x.fillRect(xx,y0,1.5+R()*2.5,l)}
 for(let i=0;i<10;i++){x.fillStyle=`rgba(90,90,85,${.05+R()*.06})`;x.fillRect(R()*W,R()*H,40+R()*120,6+R()*30)}},[4,1]);
const jacketTex=()=>PS.canvasTex(128,128,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#aeb6bb');g.addColorStop(.12,'#dfe4e6');g.addColorStop(.5,'#c9d0d4');g.addColorStop(.92,'#b9c1c6');g.addColorStop(1,'#8f989e');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle='rgba(60,68,74,.5)';x.fillRect(0,H-3,W,3);for(let i=0;i<W;i+=32){x.fillStyle='rgba(255,255,255,.12)';x.fillRect(i,0,2,H)}},[6,10]);
const paintTex=(base,seed=5)=>PS.noiseTex(256,256,base,16,seed,[3,3],(x,W,H,R)=>{for(let i=0;i<30;i++){const xx=R()*W,y0=R()*H*.6,l=30+R()*80;const g=x.createLinearGradient(0,y0,0,y0+l);g.addColorStop(0,'rgba(80,64,48,.18)');g.addColorStop(1,'rgba(80,64,48,0)');x.fillStyle=g;x.fillRect(xx,y0,2,l)}});
const refrTex=()=>PS.canvasTex(256,256,(x,W,H)=>{const R=rnd(12);x.fillStyle='#8a8d8c';x.fillRect(0,0,W,H);const im=x.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*18;d[i]+=n+4;d[i+1]+=n;d[i+2]+=n-3}x.putImageData(im,0,0);x.fillStyle='rgba(40,42,44,.55)';for(let i=0;i<W;i+=21)x.fillRect(i,0,4,H);x.fillStyle='rgba(30,32,34,.6)';for(let j=0;j<H;j+=64)x.fillRect(0,j,W,6);for(let i=0;i<14;i++){x.fillStyle='rgba(110,70,40,.25)';x.fillRect(R()*W,R()*H,3,30+R()*60)}},[2,2]);
const louverTex=()=>PS.canvasTex(128,128,(x,W,H)=>{x.fillStyle='#7d8486';x.fillRect(0,0,W,H);for(let j=0;j<H;j+=8){const g=x.createLinearGradient(0,j,0,j+8);g.addColorStop(0,'#2b3134');g.addColorStop(1,'#9aa3a6');x.fillStyle=g;x.fillRect(0,j,W,7)}x.fillStyle='#555c60';for(let i=0;i<W;i+=32)x.fillRect(i,0,3,H)},[6,2]);
const roadTex=()=>PS.canvasTex(256,256,(x,W,H)=>{const R=rnd(77);x.fillStyle='#3b3d40';x.fillRect(0,0,W,H);const im=x.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*26;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0);x.fillStyle='#d8d6cc';x.fillRect(8,0,5,H);x.fillRect(W-13,0,5,H);x.fillStyle='#e8d36a';x.fillRect(W/2-3,0,6,H*.55);for(let i=0;i<20;i++){x.fillStyle=`rgba(20,20,20,${.1+R()*.15})`;x.fillRect(R()*W,R()*H,10+R()*40,4+R()*16)}},[1,1]);
const sandTex=()=>PS.canvasTex(512,512,(x,W,H)=>{const R=rnd(19);x.fillStyle='#a8916f';x.fillRect(0,0,W,H);for(let i=0;i<220;i++){const r=20+R()*90;const g=x.createRadialGradient(0,0,0,0,0,r);const c=R()>.5?'164,140,104':'138,116,86';g.addColorStop(0,`rgba(${c},.35)`);g.addColorStop(1,`rgba(${c},0)`);x.save();x.translate(R()*W,R()*H);x.fillStyle=g;x.fillRect(-r,-r,2*r,2*r);x.restore()}const im=x.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*22;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0)},[90,90]);
const fenceTex=()=>{const t=PS.canvasTex(64,64,(x,W,H)=>{x.clearRect(0,0,W,H);x.strokeStyle='rgba(190,196,198,.95)';x.lineWidth=2;for(let i=-H;i<W;i+=12){x.beginPath();x.moveTo(i,0);x.lineTo(i+H,H);x.stroke();x.beginPath();x.moveTo(i+H,0);x.lineTo(i,H);x.stroke()}},[40,1]);return t};
const facTex=(seed,lit,em)=>PS.canvasTex(512,256,(x,W,H)=>{const R=rnd(seed);x.fillStyle=em?'#000':'#c7c9c5';x.fillRect(0,0,W,H);for(let j=0;j<4;j++){x.fillStyle=em?'#000':'#a9aca8';x.fillRect(0,j*64+50,W,14);for(let i=0;i<16;i++){const on=lit&&R()<.5;x.fillStyle=on?'#ffdf9a':em?'#000':'#3c4d5a';x.fillRect(6+i*32,j*64+12,24,34);x.fillStyle=em?'rgba(0,0,0,0)':'rgba(255,255,255,.18)';x.fillRect(6+i*32,j*64+12,24,6);x.fillStyle='#8b8f8c';x.fillRect(17+i*32,j*64+12,2,34)}}},[1,1]);
const stoneTex=()=>PS.canvasTex(256,256,(x,W,H)=>{const R=rnd(23);x.fillStyle='#ddd2bc';x.fillRect(0,0,W,H);const im=x.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*16;d[i]+=n;d[i+1]+=n;d[i+2]+=n-2}x.putImageData(im,0,0);x.strokeStyle='rgba(120,104,84,.45)';x.lineWidth=2;for(let j=0;j<=H;j+=64){x.beginPath();x.moveTo(0,j);x.lineTo(W,j);x.stroke();for(let i=(j/64)%2?64:0;i<W;i+=128){x.beginPath();x.moveTo(i,j);x.lineTo(i,j+64);x.stroke()}}},[6,1]);
const uplightTex=()=>PS.canvasTex(16,128,(x,W,H)=>{const g=x.createLinearGradient(0,H,0,0);g.addColorStop(0,'#ffffff');g.addColorStop(.45,'#7a7a7a');g.addColorStop(1,'#101010');x.fillStyle=g;x.fillRect(0,0,W,H)},[1,1]);
const panelTex=()=>PS.canvasTex(256,256,(x,W,H)=>{x.fillStyle='#c3c9cd';x.fillRect(0,0,W,H);x.strokeStyle='rgba(70,80,86,.5)';x.lineWidth=2;for(let i=0;i<=W;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}for(let j=0;j<=H;j+=128){x.beginPath();x.moveTo(0,j);x.lineTo(W,j);x.stroke()}},[3,6]);
P.buildBackground=function(){const m=this.m,R=rnd(31),PSc=this;
 const mc={
  shell:M({map:tex('shell',shellTex),metalness:.25,roughness:.55,envMapIntensity:.8}),
  jacket:M({map:tex('jacket',jacketTex),metalness:.85,roughness:.27,envMapIntensity:1.35}),
  white:M({map:tex('paintW',()=>paintTex('#d9dcd8')),metalness:.15,roughness:.55}),
  grey:M({map:tex('paintG',()=>paintTex('#8f979c',8)),metalness:.35,roughness:.5}),
  galv:M({map:tex('galv',()=>PS.noiseTex(128,128,'#8c9399',24,4,[4,4])),metalness:.6,roughness:.5}),
  steelD:M({color:0x4f5a63,metalness:.55,roughness:.5}),rust:M({color:0x6e4430,metalness:.3,roughness:.8}),
  refr:M({map:tex('refr',refrTex),roughness:.85,metalness:.2}),louver:M({map:tex('louv',louverTex),roughness:.8,metalness:.2}),
  red:M({color:0xb3332b,metalness:.15,roughness:.55}),yellowP:M({color:0xd9a719,metalness:.2,roughness:.5}),greenP:M({color:0x3f6e52,metalness:.2,roughness:.55}),
  sand:M({map:tex('sand',sandTex),roughness:1,metalness:0}),road:M({map:tex('road',roadTex),roughness:.92,metalness:0}),
  curb:M({color:0xb9b8b0,roughness:.9}),rail:M({color:0x5d4b3c,roughness:.9}),
  glow:new T.MeshBasicMaterial({color:0xffcf7a}),avia:new T.MeshBasicMaterial({color:0xff2a2a}),
  fac:M({map:tex('fac',()=>facTex(3,false)),roughness:.8}),facL:M({map:tex('facL',()=>facTex(3,true)),roughness:.8,emissive:0xffffff,emissiveMap:tex('facE',()=>facTex(3,true,true)),emissiveIntensity:0}),
  panel:M({map:tex('panel',panelTex),metalness:.5,roughness:.45}),
  fence:new T.MeshStandardMaterial({map:tex('fence',fenceTex),transparent:true,alphaTest:.35,side:T.DoubleSide,metalness:.6,roughness:.5,depthWrite:true}),
  shrub:M({color:0x5b5e3c,roughness:1}),car:[M({color:0xe7e7e2,metalness:.5,roughness:.35}),M({color:0x2c4d7a,metalness:.5,roughness:.35}),M({color:0x9a1e1e,metalness:.5,roughness:.35})],
  glass:M({color:0x1f2b33,metalness:.8,roughness:.15}),
  gravel:M({map:PS.noiseTex(256,256,'#8d8576',46,29,[1,1]),roughness:1,metalness:0}),paving:M({map:PS.canvasTex(256,256,(x,W,H)=>{const R=rnd(66);x.fillStyle='#9d9c96';x.fillRect(0,0,W,H);const im=x.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*18;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0);x.strokeStyle='rgba(60,60,58,.5)';x.lineWidth=2;x.strokeRect(1,1,W-2,H-2);for(let i=0;i<8;i++){x.fillStyle=`rgba(50,46,40,${.06+R()*.1})`;x.beginPath();x.ellipse(R()*W,R()*H,10+R()*40,6+R()*24,R()*3,0,7);x.fill()}},[1,1]),roughness:.95,metalness:0}),
  roofBlue:M({color:0x2f69a6,metalness:.3,roughness:.55}),steelB:M({color:0x5f7487,metalness:.45,roughness:.5}),
  stone:M({map:tex('stone',stoneTex),roughness:.85,emissive:0xffb15e,emissiveMap:tex('upl',uplightTex),emissiveIntensity:0}),
  grass:M({map:PS.noiseTex(256,256,'#5b7a35',38,57,[1,1],(x,W,H,R)=>{for(let i=0;i<60;i++){x.fillStyle=`rgba(${R()<.5?'120,150,70':'50,70,30'},${.08+R()*.12})`;x.beginPath();x.ellipse(R()*W,R()*H,4+R()*20,3+R()*12,R()*3,0,7);x.fill()}}),roughness:1,metalness:0}),
  fenceD:new T.MeshStandardMaterial({map:tex('fence',fenceTex),color:0x2b2f33,transparent:true,alphaTest:.35,side:T.DoubleSide,metalness:.5,roughness:.5}),
  pumpBlue:M({color:0x2b5d9e,metalness:.4,roughness:.45}),motor:M({color:0x3d6d8a,metalness:.45,roughness:.45}),hydrant:M({color:0xc0261d,roughness:.5})};
 mc.shell.map.repeat.set(5,1);
 this.mc=mc;this.areaObjs=[];this.extraFlares=[];this.plumes=[];
 const NL=[],OCC=[],ROADS=[],LP=[];// tungi chiroqlar, band hududlar (daraxt ekilmaydi), yo'llar
 // ---- zamin: cho'l (qum), shag'al maydonchalar, asfalt yo'llar ----
 const sand=new T.Mesh(new T.PlaneGeometry(3600,3600),mc.sand);sand.rotation.x=-PI/2;sand.position.y=-.12;sand.receiveShadow=true;this.scene.add(sand);
 // zavod hududi: zichlangan tuproq (yirik dog'lar, g'ildirak izlari), chetlari qumga silliq o'tadi
 const soilTex=PS.canvasTex(1024,1024,(x,W,H)=>{const R=rnd(91);x.fillStyle='#9a917f';x.fillRect(0,0,W,H);
   for(let i=0;i<420;i++){const l=R()<.5;x.fillStyle=l?`rgba(186,176,152,${.05+R()*.12})`:`rgba(108,98,82,${.05+R()*.13})`;x.beginPath();x.ellipse(R()*W,R()*H,6+R()*70,4+R()*45,R()*3,0,7);x.fill()}
   x.lineCap='round';for(let i=0;i<46;i++){x.strokeStyle=`rgba(78,70,58,${.08+R()*.1})`;x.lineWidth=1.5+R()*2;const x0=R()*W,y0=R()*H,a=R()*7,L=80+R()*260;for(const o of [0,4]){x.beginPath();x.moveTo(x0+o*Math.sin(a),y0-o*Math.cos(a));x.quadraticCurveTo(x0+Math.cos(a)*L/2+(R()-.5)*90,y0+Math.sin(a)*L/2+(R()-.5)*90,x0+Math.cos(a)*L+o*Math.sin(a),y0+Math.sin(a)*L-o*Math.cos(a));x.stroke()}}
   for(let i=0;i<90;i++){x.fillStyle=`rgba(60,52,40,${.05+R()*.08})`;x.beginPath();x.ellipse(R()*W,R()*H,2+R()*9,2+R()*6,R()*3,0,7);x.fill()}
   const im=x.getImageData(0,0,W,H),d=im.data,F=W*.09;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*22,px=(i>>2)%W,py=(i>>2)/W|0;d[i]+=n;d[i+1]+=n;d[i+2]+=n;
     const e=Math.min(px,W-1-px,py,H-1-py)/F;d[i+3]=255*Math.max(0,Math.min(1,e*e*(3-2*e)))}x.putImageData(im,0,0)},[1,1]);
 const soil=new T.Mesh(new T.PlaneGeometry(760,600),new T.MeshStandardMaterial({map:soilTex,transparent:true,depthWrite:false,roughness:1,metalness:0}));soil.rotation.x=-PI/2;soil.position.set(28,-.09,-28);soil.receiveShadow=true;soil.renderOrder=-1;this.scene.add(soil);this.soilMat=soil.material;
 const road=(x0,z0,x1,z1,w=7)=>{ROADS.push([x0,z0,x1,z1,w]);const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0);const g=new T.PlaneGeometry(w,L);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*L/14);g.rotateX(-PI/2);this.put(g,mc.road,(x0+x1)/2,-.03,(z0+z1)/2,0,a,0);
  for(const s of [-1,1])this.box((x0+x1)/2+Math.cos(a)*s*(w/2+.15),.02,(z0+z1)/2-Math.sin(a)*s*(w/2+.15),.3,.16,L,mc.curb,a);
  for(let d=20;d<L;d+=42){const px=x0+(x1-x0)*d/L+Math.cos(a)*(w/2+1.2),pz=z0+(z1-z0)*d/L-Math.sin(a)*(w/2+1.2);this.cylY(px,pz,0,9,.09,mc.galv,6);this.cylAB([px,9,pz],[px-Math.cos(a)*1.4,9.2,pz+Math.sin(a)*1.4],.05,mc.galv,4);this.box(px-Math.cos(a)*1.5,9.15,pz+Math.sin(a)*1.5,.6,.12,.3,m.lamp);NL.push(px-Math.cos(a)*1.5,9,pz+Math.sin(a)*1.5);LP.push(px-Math.cos(a)*1.5,pz+Math.sin(a)*1.5)}};
 for(const z of [46,-62,-170,120])road(-300,z,360,z);for(const x of [-250,-120,95,225,340])road(x,-300,x,240);road(-28,-300,-28,-62);road(-28,46,-28,240);
 for(const dz of [-.75,.75])this.box(25,.12,262+dz,700,.14,.12,mc.steelD);for(let x=-325;x<375;x+=1.2)this.box(x,.03,262,.26,.1,2.6,mc.rail);this.box(25,-.04,262,700,.1,4.2,m.gravel);
 const tiled=(x,y,z,w,d,mat,k)=>{const g=new T.PlaneGeometry(w,d);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){uv.setX(i,uv.getX(i)*w/k);uv.setY(i,uv.getY(i)*d/k)}g.rotateX(-PI/2);this.put(g,mat,x,y,z)};
 const pad=(x,z,w,d)=>{OCC.push([x-w/2-2,z-d/2-2,x+w/2+2,z+d/2+2]);tiled(x,-.02,z,w,d,mc.gravel,6);tiled(x,-.005,z,w*.62,d*.55,mc.paving,8);this.box(x,0,z-d/2,w,.14,.3,mc.curb);this.box(x,0,z+d/2,w,.14,.3,mc.curb);this.box(x-w/2,0,z,.3,.14,d,mc.curb);this.box(x+w/2,0,z,.3,.14,d,mc.curb);clutter(x,z,w,d)};
 const fence=(x,z,w,d,gate=8,mat=mc.fence)=>{const h=2.4;OCC.push([x-w/2-2.5,z-d/2-2.5,x+w/2+2.5,z+d/2+2.5]);for(const [cx,cz,len,ry] of [[x,z-d/2,w,0],[x,z+d/2,w,0],[x-w/2,z,d,PI/2],[x+w/2,z,d,PI/2]]){const gw=cz===z+d/2?gate:0,seg=(len-gw)/2;
   for(const s of gw?[-1,1]:[0]){const L=gw?seg:len,c=gw?s*(gw/2+seg/2):0;const g=new T.PlaneGeometry(L,h);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*L/2.2);this.put(g,mat,cx+Math.cos(ry)*c,h/2,cz-Math.sin(ry)*c,0,ry,0)}
   for(let d2=-len/2;d2<=len/2+.01;d2+=3){this.cylY(cx+Math.cos(ry)*d2,cz-Math.sin(ry)*d2,0,h+.3,.05,mc.galv,5)}}};
 const area=(text,sub,x,y,z)=>{const o=this.label(text,[x,y,z],'area',30);o.sub=sub;o.sp.material.sizeAttenuation=false;o.sp.scale.set(.13,.13*116/512,1);this.areaObjs.push(o)};
 const avia=(x,y,z)=>this.sphere(x,y,z,.5,mc.avia,8);
 // ---- realistik kolonna: izolyatsiya qobig'i, yubka, maydonchalar, narvon, bug' quvuri ----
 const column=(x,z,r,h,o={})=>{const gap=o.az??0;this.cylY(x,z,0,3,r*1.04,mc.grey,20);this.box(x+Math.cos(gap+PI)*r,1,z+Math.sin(gap+PI)*r,.8,1.4,.4,m.dark);this.cylY(x,z,-.2,.3,r*1.5,m.conc,20);
  this.cylY(x,z,3,h,r,mc.jacket,24);this.sphere(x,h,z,r*.99,mc.jacket,18);
  for(let y=7;y<h-1;y+=o.step||6.5){this.platform(x,z,y,r,gap,.9,.6);for(const da of [PI*.5,-PI*.5,PI])NL.push(x+Math.cos(gap+da)*(r+.85),y+1.5,z+Math.sin(gap+da)*(r+.85))}NL.push(x,h+r+.3,z);this.ladderV(x,z,r,gap,.3,h-.5);
  const vz=gap+PI*.5,vx=x+Math.cos(vz)*(r+.55),vzz=z+Math.sin(vz)*(r+.55);this.cylAB([x,h+r*.6,z],[x,h+r+.6,z],r*.18,mc.jacket,10);this.cylAB([x,h+r+.6,z],[vx,h+r+.6,vzz],r*.18,mc.jacket,10);this.cylAB([vx,h+r+.6,vzz],[vx,1,vzz],r*.18,mc.jacket,10);
  for(let y=6;y<h;y+=9){const a=gap+PI*1.2,nx=x+Math.cos(a)*r,nz=z+Math.sin(a)*r;this.cylAB([nx,y,nz],[nx+Math.cos(a)*.6,y,nz+Math.sin(a)*.6],.2,m.steel,10);this.disc(nx+Math.cos(a)*.62,y,nz+Math.sin(a)*.62,.3,.06,m.steel,Math.abs(Math.cos(a))>.7?'x':'z',12)}
  this.cylAB([x+Math.cos(gap)*(r+.2),h+.2,z+Math.sin(gap)*(r+.2)],[x+Math.cos(gap)*(r+1.4),h+1.6,z+Math.sin(gap)*(r+1.4)],.07,mc.galv,6);// davit
  avia(x,h+r+.9,z)};
 const vessel=(x,y,z,r,L,mat=mc.white,axis='x')=>{const a=axis==='x'?[x-L/2,y,z]:[x,y,z-L/2],b=axis==='x'?[x+L/2,y,z]:[x,y,z+L/2];this.cylAB(a,b,r,mat,20);this.sphere(...a,r,mat,14);this.sphere(...b,r,mat,14);
  for(const t of [-.3,.3]){const p=axis==='x'?[x+t*L,0,z]:[x,0,z+t*L];this.box(p[0],(y-r*.6)/2,p[2],axis==='x'?.6:r*1.5,y-r*.6,axis==='x'?r*1.5:.6,m.conc)}
  for(const t of [-.15,.2]){const p=axis==='x'?[x+t*L,y+r,z]:[x,y+r,z+t*L];this.cylAB(p,[p[0],p[1]+.5,p[2]],.18,m.steel,10);this.disc(p[0],p[1]+.52,p[2],.28,.06,m.steel,'y',12)}};
 // ---- rezervuar: list choklari, shamol halqasi, spiral zina, tom panjarasi ----
 const tank=(x,z,r,h)=>{this.cylY(x,z,0,h,r,mc.shell,48);const cone=new T.ConeGeometry(r*1.01,r*.12,48);cone.translate(x,h+r*.06,z);this.S(mc.white).push(cone);this.torus(x,h*.82,z,r+.25,.12,mc.grey,'y',PI*2,48);
  this.torus(x,h+.95,z,r-.1,.04,m.yellow,'y',PI*2,48);for(let a=0;a<PI*2;a+=PI/16)this.cylAB([x+Math.cos(a)*(r-.1),h+.1,z+Math.sin(a)*(r-.1)],[x+Math.cos(a)*(r-.1),h+.95,z+Math.sin(a)*(r-.1)],.03,m.yellow,4);
  const turns=.55,steps=Math.round(h/.25);let pv=null;for(let i=0;i<=steps;i++){const u=i/steps,a=PI*.2+u*turns*PI*2,y=u*h,px=x+Math.cos(a)*(r+.65),pz=z+Math.sin(a)*(r+.65);this.box(px,y,pz,.9,.05,.28,m.grating,-a);const q=[x+Math.cos(a)*(r+1.1),y+1,z+Math.sin(a)*(r+1.1)];if(pv&&i%2===0)this.cylAB(pv,q,.025,m.yellow,4);if(i%2===0)pv=q;if(i%8===0)this.cylAB([x+Math.cos(a)*(r+1.1),y,z+Math.sin(a)*(r+1.1)],q,.025,m.yellow,4)}
  for(const a of [1.4,3.3,5.1]){this.box(x+Math.cos(a)*(r+.35),h-.6,z+Math.sin(a)*(r+.35),.6,.7,.6,mc.red,-a)}for(const a of [.3,2.6]){this.cylAB([x+Math.cos(a)*r,.8,z+Math.sin(a)*r],[x+Math.cos(a)*(r+1.4),.8,z+Math.sin(a)*(r+1.4)],.3,m.steel,10)}
  this.torus(x,h+.3,z,r+.4,.06,mc.red,'y',PI*2,48);for(let a=0;a<PI*2;a+=PI/3)NL.push(x+Math.cos(a)*(r+.3),h+1.4,z+Math.sin(a)*(r+.3))};
 const sphereTank=(x,z,r)=>{const y=r+1.2;this.sphere(x,y,z,r,mc.shell,32);this.torus(x,y,z,r+.05,.12,mc.grey,'y',PI*2,40);
  for(let i=0;i<10;i++){const a=i/10*PI*2,px=x+Math.cos(a)*r*.98,pz=z+Math.sin(a)*r*.98;this.cylAB([px,0,pz],[px,y,pz],.32,mc.grey,10);this.box(px,.2,pz,1,.4,1,m.conc);const b=(i+1)/10*PI*2,qx=x+Math.cos(b)*r*.98,qz=z+Math.sin(b)*r*.98;this.cylAB([px,.8,pz],[qx,y*.7,qz],.06,mc.galv,4);this.cylAB([qx,.8,qz],[px,y*.7,pz],.06,mc.galv,4)}
  this.disc(x,y+r+.1,z,2.4,.1,m.grating,'y',20);this.torus(x,y+r+1.1,z,2.35,.04,m.yellow,'y',PI*2,24);const sx=x+r+2;for(let yy=0;yy<y+r;yy+=3.2){this.box(sx,yy,z,2.4,.1,2.4,m.grating)}for(const [dx,dz] of [[-1.1,-1.1],[1.1,-1.1],[-1.1,1.1],[1.1,1.1]])this.cylY(sx+dx,z+dz,0,y+r,.08,mc.galv,6);this.cylAB([sx-1.2,y+r,z],[x+1.8,y+r+.1,z],.06,m.yellow,4)};
 // ---- piroliz pechi: o'tga chidamli g'isht qoplamali radiant bo'lim, konveksiya, mo'ri ----
 const furnace=(x,z)=>{this.box(x,11,z,8,22,13,mc.refr);this.box(x,25.5,z,5.5,7,9,mc.refr);this.box(x,22.6,z,8.6,.5,13.6,mc.steelD);
  for(const s of [-1,1]){this.box(x+s*4.6,11,z,1.2,.12,13.4,m.grating);for(let i=0;i<14;i++)this.cylAB([x+s*5.15,11,z-6.6+i*1.02],[x+s*5.15,12.1,z-6.6+i*1.02],.025,m.yellow,4);this.torus(x+s*5.15,12.1,z,.01,.01,m.yellow,'y');this.cylAB([x+s*5.15,12.1,z-6.6],[x+s*5.15,12.1,z+6.6],.035,m.yellow,4);
   for(let i=0;i<10;i++){this.cylAB([x+s*4.2,.6,z-5.6+i*1.25],[x+s*4.9,.6,z-5.6+i*1.25],.12,m.steel,8)}this.cylAB([x+s*4.9,.6,z-6],[x+s*4.9,.6,z+6],.16,mc.yellowP,8);for(let k=0;k<2;k++)this.box(x+s*4.03,4+k*9,z,.06,1.4,9,mc.glow)}
  this.cylY(x,z,29,56,1.1,mc.steelD,16,.9);this.disc(x,40,z,2,.1,m.grating,'y',16);this.torus(x,41,z,2,.03,m.yellow,'y',PI*2,20);avia(x,56.6,z);vessel(x,30.6,z+3.2,.9,5,mc.white,'x')};
 // ---- estakada: I-profil ustunlar, ko'p qavat quvurlar (izolyatsiyali va bo'yalgan), kabel lotogi ----
 const rack=(x0,z0,x1,z1,h=7,levels=2)=>{const L=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/L,uz=(z1-z0)/L,nx=-uz,nz=ux,w=6;OCC.push([Math.min(x0,x1)-9,Math.min(z0,z1)-9,Math.max(x0,x1)+9,Math.max(z0,z1)+9]);
  for(let s=0;s<=L;s+=6){const cx=x0+ux*s,cz=z0+uz*s;for(const sd of [-1,1]){const px=cx+nx*w/2*sd,pz=cz+nz*w/2*sd;this.box(px,(h+levels*1.8)/2,pz,.32,h+levels*1.8,.32,mc.steelB);this.box(px,.25,pz,.8,.5,.8,m.conc)}if(s%18===0)NL.push(cx,h+levels*1.8+.6,cz);
   for(let l=0;l<levels;l++){const y=h+l*1.8;this.cylAB([cx-nx*w/2,y,cz-nz*w/2],[cx+nx*w/2,y,cz+nz*w/2],.17,mc.steelB,4);this.cylAB([cx-nx*(w/2),y-1,cz-nz*(w/2)],[cx-nx*(w/2-.9),y,cz-nz*(w/2-.9)],.06,mc.galv,4);this.cylAB([cx+nx*(w/2),y-1,cz+nz*(w/2)],[cx+nx*(w/2-.9),y,cz+nz*(w/2-.9)],.06,mc.galv,4)}}
  for(let l=0;l<levels;l++){const y=h+l*1.8;this.cylAB([x0-nx*w/2,y,z0-nz*w/2],[x1-nx*w/2,y,z1-nz*w/2],.12,mc.galv,4);this.cylAB([x0+nx*w/2,y,z0+nz*w/2],[x1+nx*w/2,y,z1+nz*w/2],.12,mc.galv,4);
   const n=9;for(let i=0;i<n;i++){const o=-w/2+.4+i*(w-.8)/(n-1),r=[.32,.18,.45,.12,.25,.38,.15,.22,.3][(i+l*3)%9],mat=[mc.jacket,mc.grey,mc.jacket,mc.yellowP,mc.grey,mc.jacket,mc.greenP,mc.grey,mc.jacket][(i+l*2)%9];this.cylAB([x0+nx*o,y+.17+r,z0+nz*o],[x1+nx*o,y+.17+r,z1+nz*o],r,mat,r>.3?12:8)}}
  const yt=h+levels*1.8;this.box((x0+x1)/2,yt+.15,(z0+z1)/2,.9,.12,L,mc.steelD,Math.atan2(ux,uz));this.box((x0+x1)/2+nx*1.6,yt+.15,(z0+z1)/2+nz*1.6,.9,.12,L,mc.steelD,Math.atan2(ux,uz))};
 const frame=(x,z,w,d,h,levels,clad=false)=>{const nx=Math.max(2,Math.round(w/6)),nz=Math.max(2,Math.round(d/6));for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++)this.box(x-w/2+i*w/nx,h/2,z-d/2+j*d/nz,.4,h,.4,mc.galv);
  for(let l=1;l<=levels;l++){const y=h*l/levels;for(let j=0;j<=nz;j++)this.box(x,y,z-d/2+j*d/nz,w,.35,.25,mc.galv);for(let i=0;i<=nx;i++)this.box(x-w/2+i*w/nx,y,z,.25,.35,d,mc.galv);this.box(x,y-.15,z,w,.08,d,m.grating);for(const s of [-1,1]){this.cylAB([x-w/2,y+1.1,z+s*d/2],[x+w/2,y+1.1,z+s*d/2],.03,m.yellow,4);NL.push(x-w/2,y+2.2,z+s*d/2,x+w/2,y+2.2,z+s*d/2)}}
  for(let i=0;i<nx;i++)for(let l=0;l<levels;l++){const y0=h*l/levels,y1=h*(l+1)/levels,xa=x-w/2+i*w/nx,xb=xa+w/nx;this.cylAB([xa,y0,z-d/2],[xb,y1,z-d/2],.06,mc.galv,4)}
  if(clad){this.box(x,h*.62,z+d/2+.05,w,h*.76,.08,mc.panel)}};
 const building=(x,z,w,d,h,lit=true)=>{OCC.push([x-w/2-3,z-d/2-3,x+w/2+3,z+d/2+3]);this.box(x,h/2,z,w,h,d,lit?mc.facL:mc.fac);this.box(x,h+.35,z,w+.3,.7,d+.3,mc.white);this.box(x,h+.72,z,w-.2,.06,d-.2,mc.roofBlue);this.box(x,h-.25,z,w+.06,.5,d+.06,mc.roofBlue);for(let i=4;i<w;i+=9)NL.push(x-w/2+i,h-.9,z+d/2+.5,x-w/2+i,h-.9,z-d/2-.5);for(let i=0;i<Math.max(1,Math.round(w/12));i++){this.box(x-w/2+6+i*12,h+1.1,z,2.4,1.2,1.6,mc.white);this.cylY(x-w/2+6+i*12,z,h+1.7,h+1.8,.5,m.dark,12)}this.box(x,2.8,z+d/2+1,4,.15,2,mc.grey);this.box(x,1.3,z+d/2+.02,2.2,2.6,.05,mc.glass)};
 const flare=(x,z,h)=>{this.cylY(x,z,0,h,.8,mc.steelD,12);const legs=[0,2.094,4.189],base=7,top=2;for(let k=0;k<3;k++){const a=legs[k],b=legs[(k+1)%3];for(let y=0;y<h-4;y+=6){const s0=base-(base-top)*y/h,s1=base-(base-top)*(y+6)/h;this.cylAB([x+Math.cos(a)*s0,y,z+Math.sin(a)*s0],[x+Math.cos(a)*s1,y+6,z+Math.sin(a)*s1],.18,mc.red,5);this.cylAB([x+Math.cos(a)*s0,y,z+Math.sin(a)*s0],[x+Math.cos(b)*s1,y+6,z+Math.sin(b)*s1],.07,mc.white,4)}}
  this.cylY(x,z,h,h+3,1.1,mc.rust,12);avia(x,h*.5,z);avia(x,h+3.4,z);vessel(x+12,3,z,2.4,10,mc.white,'x');
  const sp=new T.Sprite(new T.SpriteMaterial({map:this.glowT||(this.glowT=PS.glowTex()),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false,color:0xff8a3a}));sp.position.set(x,h+10,z);sp.scale.set(14,22,1);this.scene.add(sp);this.extraFlares.push(sp)};
 const plume=(x,y,z,s)=>{const sp=new T.Sprite(new T.SpriteMaterial({map:this.blobT||(this.blobT=PS.canvasTex(64,64,c=>{const g=c.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64)})),transparent:true,depthWrite:false,opacity:.5}));sp.position.set(x,y,z);sp.scale.set(s,s*.8,1);this.scene.add(sp);this.plumes.push({sp,y0:y,s,ph:R()*6})};
 const car=(x,z,ry,k)=>{const c=mc.car[k%3];this.box(x,.75,z,1.8,.8,4.2,c,ry);this.box(x,1.35,z-Math.cos(ry)*.2,1.6,.55,2.2,mc.glass,ry);for(const [dx,dz] of [[-.8,1.3],[.8,1.3],[-.8,-1.3],[.8,-1.3]]){const px=x+dx*Math.cos(ry)+dz*Math.sin(ry),pz=z-dx*Math.sin(ry)+dz*Math.cos(ry);this.disc(px,.35,pz,.35,.25,m.rubber,'x',10)}};
 const truck=(x,z,ry,tankCol)=>{const fx=Math.sin(ry),fz=Math.cos(ry);this.box(x+fx*4.2,1.6,z+fz*4.2,2.4,2.4,2.2,mc.car[1],ry);this.cylAB([x-fx*3,1.9,z-fz*3],[x+fx*2.6,1.9,z+fz*2.6],1.15,tankCol,16);this.box(x,.75,z,2.2,.3,9.4,mc.steelD,ry);for(const d of [-3.4,-2.2,3.9]){for(const s of [-1,1]){this.disc(x+fx*d+fz*s*1.05,.5,z+fz*d-fx*s*1.05,.5,.35,m.rubber,'x',12)}}};
 const shrubs=(n,cx,cz,rad)=>{for(let i=0;i<n;i++){const a=R()*PI*2,r=rad*(.3+R()*.7),px=cx+Math.cos(a)*r,pz=cz+Math.sin(a)*r,s=.5+R()*1.1;this.put(new T.SphereGeometry(1,8,5),mc.shrub,px,s*.35,pz,0,R()*3,0,s*1.4,s*.7,s*1.2)}};
 // ---- zavod "zichligi": har bir maydonchada nasoslar, kichik idishlar, issiqlik almashtirgichlar, mahalliy quvurlar, analizator kabinalari, yong'in gidrantlari ----
 function clutter(x,z,w,d){if(w<45)return;const RR=rnd(Math.round(x*7+z*13)+999),put=PSc;const n=Math.round(w*d/420);
  for(let i=0;i<n;i++){const px=x-w/2+3+RR()*(w-6),pz=z-d/2+3+RR()*(d-6),k=RR();
   if(k<.35){put.box(px,.15,pz,1.2,.3,2.6,m.conc);put.cylAB([px,.75,pz-1.1],[px,.75,pz+.2],.33,mc.motor,12);put.cylAB([px,.75,pz+.2],[px,.75,pz+.9],.42,mc.pumpBlue,12);put.cylAB([px,1.2,pz+.6],[px,2.6,pz+.6],.12,m.pipe,8);put.cylAB([px,2.6,pz+.6],[px+(RR()-.5)*8,2.6,pz+.6],.12,m.pipe,8)}
   else if(k<.55){const r=.6+RR()*1.1,h=3+RR()*6;put.cylY(px,pz,0,h,r,mc.white,16);put.sphere(px,h,pz,r*.98,mc.white,10);put.cylAB([px,h*.6,pz],[px+r+1.5,h*.6,pz],.12,m.pipe,8)}
   else if(k<.72){const L=4+RR()*4,r=.45+RR()*.35;for(const dy of [0,1.1]){put.cylAB([px-L/2,1.1+dy,pz],[px+L/2,1.1+dy,pz],r,mc.grey,14);put.disc(px-L/2,1.1+dy,pz,r*1.25,.12,m.steel,'x',14)}put.box(px-L/3,.5,pz,.4,1,r*2.4,m.conc);put.box(px+L/3,.5,pz,.4,1,r*2.4,m.conc)}
   else if(k<.82){put.box(px,1.3,pz,2.4,2.6,2,mc.white);put.box(px,2.7,pz,2.7,.15,2.3,mc.grey);put.box(px+1.21,1.2,pz,.04,1.9,.8,m.dark)}
   else if(k<.9){put.cylY(px,pz,0,.9,.14,mc.hydrant,8);put.sphere(px,.92,pz,.14,mc.hydrant,8);put.cylAB([px,.6,pz],[px+.25,.6,pz],.06,mc.hydrant,6)}
   else{const L=6+RR()*10,y=1.6+RR()*2;put.cylAB([px,y,pz],[px+L,y,pz],.15+RR()*.15,RR()>.5?mc.jacket:m.pipe,8);for(let t=0;t<=L;t+=3)put.box(px+t,y/2,pz,.2,y,.2,mc.galv)}}}
 // havo sovitgichlari (fin-fan) — estakada ustida
 const finfan=(x0,x1,z,y)=>{for(let x=x0;x<x1;x+=6.2){this.box(x,y,z,6,1.1,11.5,mc.grey);this.box(x,y-.65,z,6,.2,11.5,m.grating);for(const dz of [-2.8,2.8]){this.cylY(x,z+dz,y+.55,y+1.6,2.3,mc.steelD,20);this.disc(x,y+1.3,z+dz,2.15,.05,m.dark,'y',16)}for(const dz of [-5.6,5.6])this.cylAB([x-3,y+1.4,z+dz],[x+3,y+1.4,z+dz],.03,m.yellow,4)}};
 // ---- chiroq ustunlari (amin bloki atrofida) ----
 for(const [x,z,d] of [[-26,9,1],[-26,-13,1],[27,14,-1],[27,-16,-1],[-5,18,1],[19,-13.5,-1],[-34,-2,1]])this.pole(x,z,d);
 // SIS trip mayoqchasi (DA-1701 tepasida)
 this.beacon=new T.Sprite(new T.SpriteMaterial({map:this.glowT||(this.glowT=PS.glowTex()),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false,color:0xff2020}));this.beacon.position.set(5,19.2,0);this.beacon.scale.set(5,5,1);this.beacon.visible=false;this.scene.add(this.beacon);this.box(5,18.4,0,.5,.6,.5,mc.avia);
 // ---- 1. Amin bloki: B/C poezdlari va regenerator ----
 area('Amin bilan tozalash','DA-1701 batafsil · B, C poezdlari · regenerator',0,36,-6);fence(-4,8,78,68,14);
 for(const [x,z] of [[-62,-4],[62,-4]]){pad(x,z,40,30);column(x+6,z,1.8,24,{az:PI});vessel(x-6,3,z+6,1.3,7,mc.white,'z');frame(x-10,z-6,8,5,8,2);for(let i=0;i<3;i++)vessel(x-10,1.6+i*2.6,z-6,.9,8,mc.jacket);fence(x,z,44,34,6)}
 pad(36,-34,40,26);column(30,-34,2.2,32,{az:PI*.5});column(44,-38,1.4,14,{az:PI});vessel(40,2.8,-26,1.6,9);tank(52,-26,5,9);
 // ---- 2. Gaz qabul qilish: slag-kecher ----
 pad(-190,10,110,46);for(let i=0;i<8;i++){const z=-8+i*5.2;this.cylAB([-240,1.4,z],[-162,2.2,z],.9,mc.grey,16);for(let x=-235;x<-162;x+=8)this.box(x,.6,z,.7,1.2,1.4,m.conc);this.cylAB([-160,2.4,z],[-160,4.2,z],.5,mc.grey,10);this.disc(-160,3.4,z,.75,.3,m.steel,'y',12)}
 this.cylAB([-160,4.2,-10],[-160,4.2,30],1.1,mc.grey,14);vessel(-145,3,10,2,10,mc.white,'z');vessel(-132,3,10,1.6,8,mc.white,'z');fence(-190,10,116,52);
 area('Gaz qabul qilish','Slag-kecher · kirish separatorlari',-190,22,10);
 // ---- 3. Oltingugurt olish (Klaus) ----
 pad(-95,-115,70,46);vessel(-105,3.5,-108,3,16,mc.refr);for(let i=0;i<3;i++)vessel(-90+i*9,3,-124,2.2,7,mc.grey,'z');building(-118,-128,14,10,7,false);
 {const x=-70,z=-102,h=72;for(let i=0;i<7;i++){const y0=h*i/7,y1=h*(i+1)/7;this.cylY(x,z,y0,y1,1.6*(1-.2*i/7),i%2?mc.red:mc.white,16,1.6*(1-.2*(i+1)/7))}this.disc(x,h*.6,z,2.6,.1,m.grating,'y',16);avia(x,h+.5,z)}
 frame(-95,-100,18,6,10,2);fence(-95,-115,74,50);area('Oltingugurt olish (Klaus)','Kislotali gaz → S, dum gazi yoqish',-95,32,-115);
 // ---- 4. Gazni quritish (molekulyar elak) ----
 pad(112,-14,56,40);for(let i=0;i<4;i++){const x=96+i*10;this.cylY(x,-20,2,20,2.4,mc.white,24);this.sphere(x,20,-20,2.35,mc.white,16);this.sphere(x,2,-20,2.35,mc.white,16);this.cylY(x,-20,-.2,2,1.6,m.conc,16);this.platform(x,-20,12,2.4,PI*.5,.8,.6);this.ladderV(x,-20,2.4,PI*.5,.3,20)}
 frame(120,-2,22,8,14,3);this.box(132,4,-2,6,8,5,mc.refr);this.cylY(132,-2,8,24,.6,mc.steelD,12);fence(112,-14,60,44);area('Gazni quritish','Molekulyar elak adsorberlari',112,30,-14);
 // ---- 5. Kriogen ajratish ----
 pad(196,-36,70,52);this.box(182,24,-40,13,48,13,mc.panel);frame(182,-31.5,13,3,48,8);column(200,-46,2.4,58,{az:PI});column(212,-30,2,44,{az:PI*1.5});column(222,-48,1.6,36,{az:PI});
 for(let i=0;i<3;i++){this.box(196+i*9,3,-18,7,6,5,mc.grey);this.cylAB([196+i*9,6,-18],[196+i*9,9,-18],.6,mc.jacket,10)}fence(196,-36,74,56);area('Kriogen ajratish','Sovuq blok · demetanizator · deetanizator',196,72,-36);
 // ---- 6. Etilen ishlab chiqarish (piroliz) ----
 pad(285,72,110,80);for(let i=0;i<8;i++)furnace(245+i*11,52);
 column(250,94,2.6,40,{az:PI});column(268,98,1.5,82,{az:PI,step:8});column(282,98,1.7,72,{az:PI,step:8});column(300,96,2.2,48,{az:PI});frame(318,86,24,14,24,4,true);building(330,112,22,12,12);
 rack(240,70,330,70,9,3);fence(285,72,114,84,12);area('Etilen ishlab chiqarish','Piroliz pechlari · ajratish kolonnalari',285,90,72);
 // ---- 7. Polietilen ----
 pad(190,165,110,70);frame(160,160,30,22,46,6,true);this.box(160,23,155,26,46,8,mc.panel);this.cylY(160,160,46,52,3,mc.jacket,20);
 for(let i=0;i<12;i++){const x=185+(i%6)*8.5,z=150+Math.floor(i/6)*10;this.cylY(x,z,8,34,3.6,mc.white,24);const cn=new T.ConeGeometry(3.6,4,24);cn.rotateX(PI);cn.translate(x,6,z);this.S(mc.white).push(cn);for(const [dx,dz] of [[-2.6,-2.6],[2.6,-2.6],[-2.6,2.6],[2.6,2.6]])this.cylY(x+dx,z+dz,0,8,.18,mc.galv,6);const tp=new T.ConeGeometry(3.6,1.2,24);tp.translate(x,34.6,z);this.S(mc.white).push(tp)}
 this.box(206.25,35.5,150,46,.3,1.4,m.grating);this.box(206.25,35.5,160,46,.3,1.4,m.grating);building(232,175,26,30,14);building(205,192,32,12,9,false);fence(190,165,114,74,12);
 area('Polietilen','Reaktor bloki · silos · qadoqlash',190,64,165);
 // ---- 8. Rezervuar parki va sharsimon idishlar ----
 pad(-205,-160,140,90);for(const [dx,dz,bw,bd] of [[0,-40,70,.8],[0,40,70,.8],[-35,0,.8,80],[35,0,.8,80]])this.box(-235+dx,.6,-160+dz,bw,1.2,bd,m.conc);
 for(const [x,z] of [[-252,-178],[-252,-142],[-218,-178],[-218,-142]])tank(x,z,13,16);for(const [x,z] of [[-168,-185],[-168,-155],[-148,-185],[-148,-155]])sphereTank(x,z,8.5);
 fence(-205,-160,146,96,12);area('Rezervuar parki','Kondensat · SUG sharsimon idishlari',-205,36,-160);
 // ---- 9. Energetika va sovitish ----
 pad(80,-150,90,50);for(let i=0;i<6;i++){const x=48+i*11;this.box(x,1,-150,10.6,2,14.2,m.conc);this.box(x,7.5,-150,10.4,11,14,mc.louver);this.box(x,13.2,-150,10.8,.4,14.4,mc.grey);this.cylY(x,-150,13.4,17,4.1,mc.steelD,24);this.cylY(x,-150,13.4,17,3.9,m.dark,24);plume(x,24,-150,16)}
 this.box(81.5,14.5,-141.8,66,.1,1.2,m.grating);building(150,-152,40,26,18);for(let i=0;i<3;i++){const x=138+i*12,z=-166,h=65;for(let k=0;k<7;k++){const y0=h*k/7,y1=h*(k+1)/7;this.cylY(x,z,y0,y1,2.2*(1-.2*k/7),i===1&&k%2?mc.red:mc.white,16,2.2*(1-.2*(k+1)/7))}avia(x,h+.5,z)}
 fence(100,-155,140,64,12);area('Energetika va sovitish','Sovitish minoralari · bug‘ qozonxonasi',100,40,-150);
 // ---- 10. Mash'allar ----
 for(const [x,z,h] of [[-300,-280,95],[-270,-292,80],[-318,-250,70]])flare(x,z,h);area('Mash’al tizimi','Yuqori / past bosim, nam mash’al',-300,112,-280);
 // ---- 11. Boshqaruv binosi, avtoturargoh ----
 pad(-80,96,70,44);building(-92,92,34,20,10);building(-58,104,18,14,16);for(let i=0;i<12;i++)car(-108+i*3.2,114,0,i);shrubs(18,-80,124,10);area('Markaziy boshqaruv xonasi','DCS / SIS operatorlari',-80,26,96);
 // ---- 12. Estakadalar ----
 rack(-150,-62,330,-62,8,2);finfan(140,250,-62,13.6);finfan(-130,-60,-62,13.6);rack(-42,-62,-42,40,7,1);rack(95,-62,95,150,8,2);rack(225,-62,225,150,8,2);rack(-150,-62,-150,30,7,1);rack(-150,-62,-210,-120,7,1);
 // ---- transport: yo'llarda sisterna va avtomobillar ----
 truck(-28,70,0,mc.white);truck(95,30,PI,mc.white);truck(-120,-100,0,mc.yellowP);car(-26,-110,PI,1);car(225-2,0,0,2);car(95+2,-100,PI,0);
 // ---- cho'l o'simliklari va uzoq tepaliklar ----
 for(let i=0;i<60;i++){const a=R()*PI*2,r=380+R()*500;shrubs(3,Math.cos(a)*r,Math.sin(a)*r,8)}
 // ---- 13. SUG fraksiyalash (propan-butan) ----
 pad(285,-16,100,56);column(250,-26,2.2,46,{az:PI});column(263,-8,1.8,54,{az:PI,step:7});column(277,-28,1.6,38,{az:PI*.5});column(291,-8,1.4,30,{az:PI});
 frame(310,-30,22,10,18,3);for(let i=0;i<3;i++)vessel(310,2+i*6,-30,1,10,mc.grey);for(let i=0;i<5;i++)vessel(304+i*6.4,3.2,0,2.1,18,mc.white,'z');
 frame(262,8,34,10,8.4,1);finfan(248,280,8,9.3);fence(285,-16,104,60,12);area('SUG fraksiyalash','Propan-butan · deetanizator · bufer sig‘imlar',285,64,-16);
 // ---- 14. Kondensat barqarorlashtirish ----
 pad(160,83,100,56);column(128,72,2.4,44,{az:PI});column(142,93,1.8,36,{az:PI*1.5});column(156,70,1.5,28,{az:PI});
 this.box(176,7,80,7,14,9,mc.refr);this.box(176,14.3,80,7.6,.5,9.6,mc.steelD);this.cylY(176,80,14.5,36,.8,mc.steelD,12);avia(176,36.4,80);NL.push(176,8,85,176,12,85);
 frame(192,93,20,10,16,3);vessel(192,4,93,1.6,12,mc.white);vessel(203,3,72,1.8,12,mc.white,'z');tank(198,104,5,8);
 fence(160,83,104,60,12);area('Kondensat barqarorlashtirish','Stabilizatsiya kolonnalari · isitish pechi',160,56,83);
 // ---- 15. Xizmat ko'rsatish: ustaxona, laboratoriya, yong'in deposi ----
 tiled(33,-.015,84,110,62,mc.paving,8);building(10,72,40,20,10,false);building(52,70,22,14,8);building(48,99,26,14,8,false);
 for(let i=0;i<4;i++)this.box(39+i*6,2.2,106.06,4.4,4.4,.1,mc.red);truck(24,104,PI/2,mc.red);for(let i=0;i<10;i++)car(-4+i*3.2,98,0,i+1);
 // ---- 16. Omborlar va azot-havo stansiyasi ----
 tiled(-185,-.015,83,120,62,mc.paving,8);building(-205,70,52,20,9,false);building(-205,97,52,16,8,false);
 for(let i=0;i<3;i++){const x=-158+i*7;this.cylY(x,70,.4,14,1.7,mc.white,18);this.sphere(x,14,70,1.68,mc.white,12);this.cylY(x,70,-.1,.4,2.2,m.conc,16);NL.push(x,14.8,70)}
 // ---- 17. Ma'muriy bino (bosh kirish yonida) ----
 tiled(-78,-.015,172,70,44,mc.paving,8);building(-80,166,44,18,15);for(let i=0;i<14;i++)car(-100+i*3.1,186,0,i);
 // ---- 18. Bosh kirish: darvoza (KPP), shlagbaum, yozuvli devor, gazon, bayroq ----
 const gz=205,wx=-60,wz=214;
 for(const [x,z] of [[-36,gz-3],[-36,gz+3],[-20,gz-3],[-20,gz+3]])this.box(x,3.2,z,1,6.4,1,mc.stone);
 this.box(-28,6.75,gz,18,.7,8,mc.white);this.box(-28,7.16,gz,18.2,.12,8.2,mc.roofBlue);for(const x of [-33,-28,-23])NL.push(x,6.1,gz-2.5,x,6.1,gz+2.5);
 for(const [px,dir] of [[-31.6,1],[-24.4,-1]]){this.box(px,.55,gz-1,.4,1.1,.4,mc.white);for(let k=0;k<6;k++)this.box(px+dir*(k+.5)*.55,1.05,gz-1,.55,.12,.12,k%2?mc.white:mc.red)}
 this.box(-12,1.6,gz,7,3.2,5,mc.white);this.box(-12,1.9,gz+2.52,6.2,1.2,.05,mc.glass);this.box(-15.52,1.9,gz,.05,1.2,4.2,mc.glass);this.box(-12,3.35,gz,7.6,.3,5.6,mc.roofBlue);NL.push(-12,3,gz+3);
 this.box(wx,.25,wz,40,.5,2.4,mc.stone);this.box(wx,2,wz,38,3.4,1.2,mc.stone);this.box(wx,3.8,wz,38.4,.2,1.5,mc.white);
 for(const x of [wx-20,wx+20]){this.box(x,2.3,wz,2.2,4.6,1.8,mc.stone);this.box(x,4.7,wz,2.6,.25,2.2,mc.white)}
 {const tx=PS.canvasTex(2048,144,(x,W,H)=>{x.clearRect(0,0,W,H);x.font='bold 112px Georgia, "Times New Roman", serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(255,236,200,.55)';x.fillText('SHO‘RTAN GAZ-KIMYO MAJMUASI',W/2+3,H/2+3);x.fillStyle='#4a3a26';x.fillText('SHO‘RTAN GAZ-KIMYO MAJMUASI',W/2,H/2)},[1,1]);
  const sg=new T.Mesh(new T.PlaneGeometry(34,2.4),new T.MeshStandardMaterial({map:tx,transparent:true,alphaTest:.25,metalness:.55,roughness:.4}));sg.position.set(wx,2.05,wz+.62);this.scene.add(sg)}
 for(let x=wx-18;x<=wx+18;x+=3)NL.push(x,.4,wz+1.5);
 {this.cylY(wx-26,wz-1,0,14,.09,mc.galv,8);const fl=PS.canvasTex(192,96,(x,W,H)=>{x.fillStyle='#1eb5e6';x.fillRect(0,0,W,32);x.fillStyle='#ce1126';x.fillRect(0,32,W,3);x.fillStyle='#ffffff';x.fillRect(0,35,W,26);x.fillStyle='#ce1126';x.fillRect(0,61,W,3);x.fillStyle='#1eb046';x.fillRect(0,64,W,32);x.fillStyle='#fff';x.beginPath();x.arc(22,16,10,0,7);x.fill();x.fillStyle='#1eb5e6';x.beginPath();x.arc(26,16,9,0,7);x.fill();x.fillStyle='#fff';for(let i=0;i<12;i++)x.fillRect(38+(i%5)*8,6+Math.floor(i/5)*8,3,3)},[1,1]);
  const f=new T.Mesh(new T.PlaneGeometry(4,2),new T.MeshStandardMaterial({map:fl,side:T.DoubleSide,roughness:.8}));f.position.set(wx-24,12.8,wz-1);this.scene.add(f)}
 tiled(wx,-.012,226,56,20,mc.grass,6);tiled(-4,-.012,222,30,26,mc.grass,6);for(const [x,z,w,d] of [[wx,216,56,.3],[wx,236,56,.3],[wx-28,226,.3,20],[wx+28,226,.3,20]])this.box(x,.05,z,w,.16,d,mc.curb);
 for(let i=0;i<10;i++)this.put(new T.SphereGeometry(1,7,5),m.conc,wx-24+R()*48,.2,219+R()*15,0,R()*3,0,.5+R()*.6,.35+R()*.3,.5+R()*.5);
 OCC.push([-112,150,-40,196],[wx-30,207,wx+30,238],[-40,196,-5,214],[-30,52,96,116],[-246,52,-140,116]);
 // ---- perimetr panjarasi (yo'llar kesishgan joylarda o'tish) ----
 const perim=(x0,z0,x1,z1,gaps)=>{const h=2.6,L=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/L,uz=(z1-z0)/L,ry=Math.atan2(-uz,ux);let s0=0;const cuts=[...gaps.map(([c,hw])=>[c-hw,c+hw]),[L,L]].sort((a,b)=>a[0]-b[0]);
  for(const [a,b] of cuts){if(a>s0+1){const l=a-s0,c=(s0+a)/2,g=new T.PlaneGeometry(l,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*l/2.2);this.put(g,mc.fenceD,x0+ux*c,h/2,z0+uz*c,0,ry,0);for(let d=s0;d<=a;d+=6)this.cylY(x0+ux*d,z0+uz*d,0,h+.2,.06,mc.steelD,5)}s0=Math.max(s0,b)}};
 const xr=[-250,-120,95,225,340],zr=[46,-62,-170,120];
 perim(-292,gz,372,gz,[...xr.map(x=>[x+292,7]),[-23+292,15]]);perim(-292,-232,372,-232,[...xr.map(x=>[x+292,7]),[-28+292,7]]);
 perim(-292,-232,-292,gz,zr.map(z=>[z+232,7]));perim(372,-232,372,gz,[]);
 // ---- yashil hudud: yo'l bo'ylab sarv qatorlari, yumaloq daraxtlar, gazon, gullar ----
 const CY=[],RT=[],FL=[];const occ=(x,z)=>OCC.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]);
 const dseg=(x,z,r)=>{const [a,b,c,d]=r,vx=c-a,vz=d-b,t=Math.max(0,Math.min(1,((x-a)*vx+(z-b)*vz)/(vx*vx+vz*vz)));return Math.hypot(x-a-vx*t,z-b-vz*t)};
 ROADS.forEach((r,i)=>{const [x0,z0,x1,z1,w]=r,L=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/L,uz=(z1-z0)/L;for(let d=5;d<L-4;d+=8.5)for(const sd of [-1,1]){const o=w/2+3.4,x=x0+ux*d-uz*o*sd+(R()-.5)*.8,z=z0+uz*d+ux*o*sd;
   if(occ(x,z)||ROADS.some((q,j)=>j!==i&&dseg(x,z,q)<q[4]/2+5)||Math.abs(z-gz)<4||Math.abs(x+292)<4||Math.abs(z+232)<4)continue;(R()<.72?CY:RT).push([x,z])}});
 for(let x=-286;x<368;x+=9)for(const z of [gz-6,gz+7])if(!occ(x,z)&&!ROADS.some(q=>dseg(x,z,q)<q[4]/2+4))(R()<.6?CY:RT).push([x+(R()-.5)*2,z]);
 for(let i=0;i<34;i++){const x=wx-26+R()*52,z=222+R()*13;if(Math.abs(z-228)>2.5)CY.push([x,z,.5])}for(let i=0;i<5;i++)RT.push([2+R()*8,212+R()*20]);
 for(let i=0;i<220;i++){const a=R()*PI*2,r=Math.sqrt(R()),b=i%3;FL.push(b<2?[wx-12+b*24+Math.cos(a)*r*9,226+Math.sin(a)*r*3.2]:[-4+Math.cos(a)*r*8,222+Math.sin(a)*r*3])}
 for(let i=0;i<30;i++)RT.push([-108+R()*66,150+R()*4]);
 const inst=(g,mat,list,fn,col,sh=true)=>{if(!list.length)return;const im=new T.InstancedMesh(g,mat,list.length),o=new T.Object3D(),c=new T.Color();const RR=rnd(list.length);
  list.forEach((t,i)=>{o.position.set(0,0,0);o.rotation.set(0,RR()*6.28,0);o.scale.set(1,1,1);fn(o,t,RR);o.updateMatrix();im.setMatrixAt(i,o.matrix);col(c,RR);im.setColorAt(i,c)});
  im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.castShadow=sh;im.receiveShadow=true;this.scene.add(im);return im};
 const cyG=new T.LatheGeometry([[0,0],[.5,.05],[.9,.22],[1,.42],[.85,.68],[.45,.92],[0,1]].map(([a,b])=>new T.Vector2(a,b)),7),rtG=new T.SphereGeometry(1,8,6),trG=new T.CylinderGeometry(.12,.17,1,5);trG.translate(0,.5,0);
 const leaf=M({map:PS.canvasTex(128,128,(x,W,H)=>{const RR=rnd(12);x.fillStyle='#b8b8b8';x.fillRect(0,0,W,H);for(let i=0;i<900;i++){const v=110+RR()*145|0;x.fillStyle=`rgb(${v},${v},${v})`;x.beginPath();x.ellipse(RR()*W,RR()*H,1.5+RR()*3,1+RR()*2,RR()*3,0,7);x.fill()}},[3,2]),roughness:.95,metalness:0});
 inst(cyG,leaf,CY,(o,t,RR)=>{const k=t[2]||1,h=(6+RR()*3.5)*k;o.position.set(t[0],0,t[1]);o.scale.set((1.05+RR()*.45)*k,h,(1.05+RR()*.45)*k)},(c,RR)=>c.setHSL(.26+RR()*.06,.32+RR()*.14,.12+RR()*.05));
 const RH=RT.map(t=>[t[0],t[1],4.2+R()*2.6,1.8+R()*1.1]);
 inst(rtG,leaf,RH,(o,t)=>{o.position.set(t[0],t[2],t[1]);o.scale.set(t[3],t[3]*.85,t[3])},(c,RR)=>c.setHSL(.2+RR()*.07,.34+RR()*.14,.17+RR()*.06));
 inst(trG,M({color:0x5b4a36,roughness:1}),RH,(o,t)=>{o.position.set(t[0],0,t[1]);o.scale.set(1,t[2],1)},c=>c.setRGB(1,1,1));
 inst(new T.SphereGeometry(1,6,4),M({color:0xffffff,roughness:.8}),FL,(o,t,RR)=>{o.position.set(t[0],.18,t[1]);const s=.1+RR()*.09;o.scale.set(s,s*.8,s)},(c,RR)=>{const p=[[.98,.25,.5],[.93,.75,.55],[.14,.9,.6],[0,0,.95],[.83,.6,.6]][Math.floor(RR()*5)];c.setHSL(...p)},false);
 // ---- yo'l bo'yi yashil chiziqlar (gazon): band hududlar va chorrahalardan tashqari ----
 ROADS.forEach((r,i)=>{const [x0,z0,x1,z1,w]=r,hor=z0===z1,L=Math.hypot(x1-x0,z1-z0),sx=Math.sign(x1-x0)||1,sz=Math.sign(z1-z0)||1;
  for(const sd of [-1,1]){const o=w/2+1.75;let run=null;const end=e=>{if(run!=null&&e-run>6){const c=(run+e)/2;if(hor)tiled(x0+sx*c,-.01,z0+sd*o,e-run,2.2,mc.grass,6);else tiled(x0+sd*o,-.01,z0+sz*c,2.2,e-run,mc.grass,6)}run=null};
   for(let d=0;d<=L;d+=3){const x=hor?x0+sx*d:x0+sd*o,z=hor?z0+sd*o:z0+sz*d,bad=occ(x,z)||ROADS.some((q,j)=>j!==i&&dseg(x,z,q)<q[4]/2+3)||Math.abs(z-gz)<3||Math.abs(z+232)<3||Math.abs(x+292)<3;if(bad)end(d);else if(run==null)run=d}end(L)}});
 // ---- yo'l chiroqlari ostidagi yorug'lik dog'lari (kechqurun va tunda) ----
 {const pt=PS.canvasTex(64,64,c=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,190,110,1)');g.addColorStop(.45,'rgba(255,150,60,.45)');g.addColorStop(1,'rgba(255,140,50,0)');c.fillStyle=g;c.fillRect(0,0,64,64)},[1,1]);
  const n=LP.length/2,pg=new T.PlaneGeometry(18,18);pg.rotateX(-PI/2);const im=new T.InstancedMesh(pg,new T.MeshBasicMaterial({map:pt,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.4,color:0xffa050}),n),mt=new T.Matrix4();
  for(let i=0;i<n;i++){mt.makeTranslation(LP[i*2],.05,LP[i*2+1]);im.setMatrixAt(i,mt)}im.computeBoundingSphere();im.renderOrder=1;im.visible=this.look!=='day';this.scene.add(im);this.pools=im}
 // ---- tungi chiroqlar (qurilmalar, estakadalar, yo'llar, binolar) ----
 {const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(NL,3));pg.computeBoundingSphere();
  this.nightPts=new T.Points(pg,new T.PointsMaterial({map:this.glowT||(this.glowT=PS.glowTex()),size:3.4,sizeAttenuation:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,color:0xffc47a}));this.nightPts.visible=this.look!=='day';this.scene.add(this.nightPts)}
 // ---- ufq: tog' tizmalari panoramasi va bulutlar (kamera bilan birga harakatlanadi, doim fon) ----
 {const mt=PS.canvasTex(2048,256,(x,W,H)=>{x.clearRect(0,0,W,H);const R2=rnd(5);
   const ridge=(amp,base,fr,top,low)=>{const ph=fr.map(()=>R2()*7);x.beginPath();x.moveTo(0,H);for(let i=0;i<=W;i+=2){const u=i/W;let y=0;fr.forEach((f,k)=>{const sn=Math.sin(u*PI*2*f+ph[k]);y+=(k<2?sn:1-Math.abs(sn))/(k+1)});x.lineTo(i,base-amp*Math.max(.05,.55+y/2.6))}x.lineTo(W,H);x.closePath();const g=x.createLinearGradient(0,base-amp*1.6,0,H);g.addColorStop(0,top);g.addColorStop(.75,low);g.addColorStop(1,low);x.fillStyle=g;x.fill()};
   ridge(78,140,[2,5,9,17,31,53],'#9aa3b1','#c6c8c6');ridge(58,172,[3,6,11,21,37,61],'#94836c','#b9ad99');ridge(34,204,[4,9,15,27,45,71],'#7f6d57','#b0a28c')},[1,1]);
  mt.wrapS=T.RepeatWrapping;const mg=new T.CylinderGeometry(270,270,48,128,1,true);mg.translate(0,10,0);
  this.mount=new T.Mesh(mg,new T.MeshBasicMaterial({map:mt,alphaTest:.5,side:T.BackSide,fog:false,depthWrite:false}));this.mount.renderOrder=-9;this.scene.add(this.mount);
  const ct=PS.canvasTex(2048,512,(x,W,H)=>{x.clearRect(0,0,W,H);const R3=rnd(8);for(let n=0;n<120;n++){const cx=R3()*W,cy=H-H*(.04+.62*R3()*R3()),sc=(.6+R3())*(1.2-cy/H*.6),k=5+Math.floor(R3()*8);
     for(let j=0;j<k;j++){const ex=cx+(R3()-.5)*120*sc,ey=cy+(R3()-.5)*14*sc,rx=(26+R3()*46)*sc,ry=rx*(.22+R3()*.12);for(const ox of [-W,0,W]){const g=x.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.save();x.translate(ex+ox,ey);x.scale(rx,ry);x.fillStyle=g;x.beginPath();x.arc(0,0,1,0,7);x.fill();x.restore()}}}},[1,1]);
  this.clouds=new T.Mesh(new T.SphereGeometry(285,48,12,0,PI*2,0,PI/2),new T.MeshBasicMaterial({map:ct,side:T.BackSide,fog:false,depthWrite:false,transparent:false,blending:5,blendSrc:204,blendDst:205,opacity:.9}));this.clouds.renderOrder=-9.5;this.scene.add(this.clouds)}
};
// ---- kamera: majmua ko'rinishi, tuman masofasi, hududiy yozuvlar ----
const _setCamera=P.setCamera,_setLook=P.setLook,_render=P.render,_init=P.init;
const VIEWS={gate:[[10,22,270],[-46,3,207]],complex:[[-330,230,360],[40,0,-30]],ethylene:[[380,90,-40],[270,30,70]],tank:[[-120,70,-60],[-205,8,-160]]};
P.applyRange=function(){if(!this.scene||!this.scene.fog)return;const far=['complex','ethylene','tank','top','gate'].includes(this.viewId);
 // soyalar: majmua ko'rinishida quyosh soyasi butun hududni qamraydi, yaqin ko'rinishda — batafsil (amin bloki)
 const sun=this.sun;if(sun){const cam=sun.shadow.camera,dir=sun.position.clone().sub(sun.target.position).normalize();
  if(far&&!this.farShadow){this.nearSun=sun.position.clone();this.farShadow=true;sun.target.position.set(20,0,-20);sun.position.copy(dir.multiplyScalar(800).add(sun.target.position));Object.assign(cam,{left:-470,right:470,top:440,bottom:-440,near:10,far:2000});sun.shadow.bias=-.0006;sun.shadow.normalBias=.4;sun.shadow.mapSize.set(4096,4096);sun.shadow.map?.dispose();sun.shadow.map=null;cam.updateProjectionMatrix();this.renderer.shadowMap.needsUpdate=true}
  else if(!far&&this.farShadow){this.farShadow=false;sun.target.position.set(0,5,0);if(this.nearSun)sun.position.copy(this.nearSun);Object.assign(cam,{left:-36,right:36,top:34,bottom:-28,near:1,far:140});sun.shadow.bias=-.0002;sun.shadow.normalBias=.03;sun.shadow.mapSize.set(3072,3072);sun.shadow.map?.dispose();sun.shadow.map=null;cam.updateProjectionMatrix();this.renderer.shadowMap.needsUpdate=true}}this.scene.fog.near=far?420:this.fogBase?.[0]??this.scene.fog.near;this.scene.fog.far=far?2200:this.fogBase?.[1]??this.scene.fog.far;this.camera.far=far?5000:600;this.camera.updateProjectionMatrix();this.controls.maxDistance=far?1400:120};
P.setLook=function(k){this.farShadow=false;_setLook.call(this,k);if(this.scene?.fog)this.fogBase=[this.scene.fog.near,this.scene.fog.far];if(this.mc){const n=k!=='day',ng=k==='night';this.mc.facL.emissiveIntensity=ng?1.1:n?.9:0;this.mc.stone.emissiveIntensity=ng?1:n?.75:0;if(this.nightPts){this.nightPts.visible=n;this.nightPts.material.size=ng?4.8:3.4;this.nightPts.material.color.setHex(ng?0xffa448:0xffc47a)}if(this.pools){this.pools.visible=n;this.pools.material.opacity=ng?.6:.28}if(this.mount)this.mount.material.color.setHex(ng?0x1b2133:n?0x5d5270:0xffffff);if(this.clouds){this.clouds.visible=!ng;this.clouds.material.color.setHex(n?0xf0a27a:0xffffff);this.clouds.material.opacity=n?.8:.9}this.mc.glow.color.setHex(n?0xffb050:0xc8a070);for(const p of this.plumes||[])p.sp.material.opacity=n?.18:.5}this.applyRange()};
P.setCamera=function(id,smooth=true){if(VIEWS[id]){if(!this.camera||!this.controls)return;this.viewId=id;this.applyRange();const v=VIEWS[id];if(smooth)this.cameraMove={p0:this.camera.position.clone(),t0:this.controls.target.clone(),p1:new V3(...v[0]),t1:new V3(...v[1]),u:0};else{this.camera.position.set(...v[0]);this.controls.target.set(...v[1]);this.controls.update()}}
 else{if(id==='top'&&this.camera){this.viewId='top';const p=[[0,520,.1],[20,0,-20]];if(smooth)this.cameraMove={p0:this.camera.position.clone(),t0:this.controls.target.clone(),p1:new V3(...p[0]),t1:new V3(...p[1]),u:0};else{this.camera.position.set(...p[0]);this.controls.target.set(...p[1])}}else _setCamera.call(this,id,smooth)}
 this.applyRange()};
P.render=function(s,dt){if(this.ready){const t=this.animTime||0;for(const f of this.extraFlares||[]){const k=1+Math.sin(t*9+f.position.x)*.07+Math.sin(t*23)*.05;const fk=this.flareK||1;f.scale.set(14*k*fk,22*(2-k)*fk,1)}
  for(const p of this.plumes||[]){const u=((t*.08+p.ph)%1);p.sp.position.y=p.y0+u*18;p.sp.scale.set(p.s*(1+u),p.s*(1+u)*.8,1);p.sp.material.opacity=(this.look!=='day'?.18:.5)*(1-u)}
  const far=['complex','ethylene','tank','top','gate'].includes(this.viewId);for(const o of this.areaObjs||[])o.sp.userData.area=true;this.__areaVisible=far}
 if(this.beacon){const tr=!!(s&&s.sis&&s.sis.trip&&s.sis.trip.length);this.beacon.visible=tr&&Math.sin((this.animTime||0)*7)>-.2}
 if(this.drops&&s){const D=this.drops,t=this.animTime||0,v=1.7*Math.max(.04,(s.lean??100)/100);for(let i=0;i<D.d.length;i++){const q=D.d[i],u=((t*v/q.span)+q.ph)%1;D.m.makeTranslation(q.x,q.top-u*q.span,q.z);D.im.setMatrixAt(i,D.m)}D.im.instanceMatrix.needsUpdate=true}
 if(this.sky&&this.camera){this.sky.position.copy(this.camera.position);this.stars.position.copy(this.camera.position);if(this.mount)this.mount.position.copy(this.camera.position);if(this.clouds)this.clouds.position.copy(this.camera.position)}
 _render.call(this,s,dt)};
// hududiy yozuvlar faqat majmua ko'rinishlarida; qiymat o'rnida izoh
const _paint=P.paintLabel;P.paintLabel=function(o,value){if(o.key==='area'){o.sp.visible=this.labelsOn&&!!this.__areaVisible;return _paint.call(this,o,o.sub||'')}return _paint.call(this,o,value)};
window.AmineComplex3D=true;
})();
