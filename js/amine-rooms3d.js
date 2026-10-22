(()=>{'use strict';
// ===== 3D: DCS operator xonasi, SIS / ESD shkaf xonasi, dala SIS asboblari (XV, LT/PT), kabel tokchalari =====
// Ikki alohida bino amin bloki oldida: shisha old tomon, ichida jonli ekranlar (video-devor, pult monitorlari),
// SIS shkaflarida LED lar SIF va kanal holatini ko'rsatadi, ESD tugmasi trip bo'lganda yonadi.
// Dalada XV17001…XV17006 (sariq pnevmo-aktuator, fail-close) va SIS uzatgichlari; trip bo'lsa klapan ko'rsatkichi buriladi.
const PS=window.__PS;if(!PS||!PS.PlantScene)return;const {T}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype,S=window.AmineSIS;
const tx=s=>PS.tx(s);
const DCS={x:-21.6,z:34.5,w:17,d:10,h:3.8},SISB={x:-6,z:35,w:8.6,d:11,h:3.8};
const XVPOS={XV17001:[-25,.9,0],XV17005:[24,9.4,-4.4],XV17002:[16,8.7,-7.2],XV17006:[17,10.3,-5.6],XV17003:[19.5,.75,4.4],XV17004:[8,.6,8]};
function screen(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return{c,ctx,tex,draw}}
const corr=()=>PS.canvasTex(128,128,(x,W,H)=>{const g=x.createLinearGradient(0,0,W,0);for(let i=0;i<=8;i++){g.addColorStop(i/8,i%2?'#b9c0c5':'#e4e8ea')}x.fillStyle=g;x.fillRect(0,0,W,H)},[6,1]);
// ---- ichki teksturalar: pol plitalari (teshikli), shift, shkaf ichi (modullar, kabel kanallari, klemmalar), yopiq eshik ----
const floorTex=perf=>PS.canvasTex(256,256,(x,W,H)=>{const R=PS.rnd(perf?3:4);x.fillStyle=perf?'#c3c8cc':'#d9dcdd';x.fillRect(0,0,W,H);const im=x.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const n=(R()-.5)*8;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(im,0,0);
 x.strokeStyle='rgba(120,126,130,.7)';x.lineWidth=2;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,H);x.stroke();x.beginPath();x.moveTo(0,i*64);x.lineTo(W,i*64);x.stroke()}
 if(perf){x.fillStyle='rgba(60,66,72,.75)';for(let tx=0;tx<4;tx++)for(let ty=0;ty<4;ty++)for(let a=0;a<9;a++)for(let b=0;b<9;b++)x.fillRect(tx*64+8+a*6,ty*64+8+b*6,2.4,2.4)}},[1,1]);
const ceilTex=()=>PS.canvasTex(128,128,(x,W,H)=>{x.fillStyle='#eef0f0';x.fillRect(0,0,W,H);x.strokeStyle='#b7bcbf';x.lineWidth=3;x.strokeRect(0,0,W,H);x.fillStyle='rgba(150,150,150,.12)';for(let i=0;i<160;i++)x.fillRect(Math.random()*W,Math.random()*H,1.5,1.5)},[1,1]);
const module_=(x,px,py,w,h,col,leds,R)=>{x.fillStyle=col;x.fillRect(px,py,w,h);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(px,py,w,3);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(px+w-1,py,1,h);for(let k=0;k<leds;k++){x.fillStyle=R()<.8?'#39e36b':(R()<.5?'#f2b233':'#2a3036');x.fillRect(px+3,py+6+k*5,3,3)}x.fillStyle='rgba(20,24,28,.5)';x.fillRect(px+2,py+h-9,w-4,6)};
const wires=(x,px,py,len,n,col,R)=>{for(let i=0;i<n;i++){x.strokeStyle=R()<.15?'#d8b21f':col;x.lineWidth=2;x.beginPath();x.moveTo(px+i*4,py);x.lineTo(px+i*4+(R()-.5)*2,py+len);x.stroke()}};
const cabTex=(kind,seed)=>PS.canvasTex(256,512,(x,W,H)=>{const R=PS.rnd(31+seed*7);x.fillStyle='#d3d7da';x.fillRect(0,0,W,H);x.fillStyle='#b9bec2';x.fillRect(0,0,12,H);x.fillRect(W-12,0,12,H);
 const duct=y=>{x.fillStyle='#8f969c';x.fillRect(14,y,W-28,16);x.fillStyle='#7b8288';for(let i=18;i<W-18;i+=8)x.fillRect(i,y,3,16)};
 const vduct=()=>{x.fillStyle='#8f969c';x.fillRect(W-40,20,22,H-40);x.strokeStyle='#2563c9';x.lineWidth=3;for(let i=0;i<4;i++){x.beginPath();x.moveTo(W-34+i*4,20);x.lineTo(W-34+i*4,H-20);x.stroke()}};
 vduct();
 if(kind==='term'){for(let r=0;r<4;r++){const y=30+r*118;duct(y);for(let i=0;i<34;i++){const c=i%9===8?'#3f8f3f':(i%4===0?'#2f6fc8':'#c9cdd0');x.fillStyle=c;x.fillRect(20+i*6,y+22,5,40);x.fillStyle='#5a6066';x.fillRect(20+i*6,y+26,5,3)}wires(x,22,y+62,40,50,'#2563c9',R)}}
 else{const mc=kind==='sis'?'#e2be1d':'#3b4148';for(let r=0;r<3;r++){const y=26+r*156;duct(y);x.fillStyle='#9aa1a6';x.fillRect(16,y+24,W-60,4);
   for(let i=0;i<12;i++){const w=i<2?24:14,px=18+(i<2?i*26:52+(i-2)*15);module_(x,px,y+28,w,70,i<2?'#2e3338':(R()<.85?mc:'#3b4148'),i<2?4:6,R)}
   wires(x,20,y+98,44,45,'#2563c9',R);x.fillStyle='#c9cdd0';for(let i=0;i<30;i++){x.fillRect(20+i*6.6,y+142,5,12)}}}
 x.fillStyle='#ffffff';x.fillRect(20,H-18,60,10);x.fillStyle='#333';x.font='8px Arial';x.fillText('+'+(kind==='sis'?'SIS':kind==='dcs'?'DCS':'MK')+'-'+(10+seed),22,H-10)},[1,1]);
const doorTex=()=>PS.canvasTex(128,256,(x,W,H)=>{x.fillStyle='#ccd0d3';x.fillRect(0,0,W,H);x.strokeStyle='#9da3a8';x.lineWidth=3;x.strokeRect(4,4,W-8,H-8);
 x.fillStyle='#b0b6ba';for(let i=0;i<9;i++){x.fillRect(30,H-70+i*6,W-60,3)}for(let i=0;i<9;i++){x.fillRect(30,30+i*6,W-60,3)}x.fillStyle='#24282c';x.fillRect(W-22,H/2-22,8,44);x.fillStyle='#fff';x.fillRect(30,H/2-34,40,16);x.fillStyle='#f2c218';x.beginPath();x.moveTo(40,H/2+4);x.lineTo(54,H/2+28);x.lineTo(26,H/2+28);x.closePath();x.fill()},[1,1]);
P.buildRooms=function(){const m=this.m,R=PS.rnd(57);this.rooms={roofs:[],screens:[],leds:[],xv:{},pulses:[],lamps:[]};const RM=this.rooms;
 const M=o=>new T.MeshStandardMaterial(o);
 const mm={clad:M({map:corr(),metalness:.35,roughness:.55,color:0xffffff}),perf:M({map:floorTex(true),roughness:.55,metalness:.25}),wallIn:M({color:0xeef0ee,roughness:.9}),
  blue:M({color:0x1f5fbf,roughness:.5}),red:M({color:0xc62828,roughness:.5}),desk:M({color:0x4a525a,metalness:.3,roughness:.5}),deskTop:M({color:0xdadde0,roughness:.45}),
  cab:M({color:0xc9cdd0,metalness:.35,roughness:.45}),cabDark:M({color:0x2b3036,metalness:.4,roughness:.5}),chair:M({color:0x1b1f24,roughness:.7}),mesh:M({color:0x26292d,roughness:.9}),
  skin:M({color:0xc99a78,roughness:.75}),hair:M({color:0x17120e,roughness:.85}),navy:M({color:0x1d2b45,roughness:.8}),wgrey:M({color:0x878e96,roughness:.8}),refl:M({color:0xdfe4e8,metalness:.6,roughness:.25,emissive:0x2a2e33}),
  shirt:M({color:0xaac4dd,roughness:.8}),paper:M({color:0xf4f4ef,roughness:.9}),pot:M({color:0x9ea3a6,roughness:.6}),leaf:M({color:0x2f6a2e,roughness:.85}),
  orange:M({color:0xe8661c,roughness:.7}),dark:M({color:0x15191d,roughness:.7}),cable:M({color:0x2563c9,roughness:.6}),cableY:M({color:0xd9b21c,roughness:.6}),
  yellow:M({color:0xf0b51c,metalness:.2,roughness:.45}),valve:M({color:0x5b6670,metalness:.7,roughness:.4}),ceil:new T.MeshBasicMaterial({color:0xfff8ea}),
  cabIn:['dcs','sis','term'].map((k,i)=>M({map:cabTex(k,i),roughness:.6})),door:M({map:doorTex(),metalness:.3,roughness:.5})};
 this.mr=mm;
 // ---- inson: ish kiyimi (to'q ko'k + kulrang yelka, nur qaytaruvchi chiziqlar), o'tirgan / turgan, daftar yoki ko'rsatish ----
 const worker=(x,z,ry,o={})=>{const sit=!!o.sit,cs=Math.cos(ry),sn=Math.sin(ry),L=(px,py,pz)=>[x+px*cs+pz*sn,py,z-px*sn+pz*cs],
   put=(g,mat,px,py,pz)=>{const p=L(px,py,pz);this.put(g,mat,p[0],p[1],p[2],0,ry,0)},limb=(a,b,r,mat)=>this.cylAB(L(...a),L(...b),r,mat,7);
  const hip=sit?.52:.94;
  if(sit){for(const s of [-1,1]){limb([s*.1,hip,0],[s*.1,hip,-.44],.08,mm.navy);limb([s*.1,hip,-.44],[s*.1,.08,-.48],.07,mm.navy);put(new T.BoxGeometry(.11,.07,.26),mm.dark,s*.1,.04,-.55)}}
  else{for(const s of [-1,1]){limb([s*.1,hip,0],[s*.1,.08,0],.08,mm.navy);put(new T.BoxGeometry(.11,.07,.26),mm.dark,s*.1,.04,-.05)}}
  put(new T.BoxGeometry(.36,.16,.22),mm.navy,0,hip,0);put(new T.BoxGeometry(.4,.56,.23),mm.navy,0,hip+.32,0);put(new T.BoxGeometry(.42,.17,.25),mm.wgrey,0,hip+.53,0);
  for(const y of [hip+.42,hip+.14])put(new T.BoxGeometry(.41,.035,.24),mm.refl,0,y,0);put(new T.BoxGeometry(.12,.08,.04),mm.shirt,0,hip+.6,-.115);
  const sh=hip+.56,ar=(s,elb,hand)=>{limb([s*.25,sh,0],elb,.055,mm.wgrey);limb(elb,hand,.05,mm.navy);this.sphere(...L(...hand),.045,mm.skin,6);
    const mid=[(s*.25+elb[0])/2,(sh+elb[1])/2+.04,(elb[2])/2];this.cylAB(L(mid[0],mid[1]-.02,mid[2]),L(mid[0],mid[1]+.02,mid[2]),.058,mm.refl,7)};
  if(o.arms==='desk'){for(const s of [-1,1])ar(s,[s*.26,sh-.27,-.08],[s*.17,sh-.3,-.38])}
  else if(o.book){ar(-1,[-.26,sh-.28,-.04],[-.08,sh-.24,-.3]);ar(1,[.26,sh-.28,-.04],[.08,sh-.2,-.3]);put(new T.BoxGeometry(.24,.025,.32),mm.paper,0,sh-.2,-.3);put(new T.BoxGeometry(.25,.028,.33),mm.navy,0,sh-.215,-.3)}
  else if(o.point){ar(-1,[-.27,sh-.3,0],[-.27,sh-.58,.02]);ar(1,[.3,sh-.12,-.22],[.36,sh+.02,-.55])}
  else{for(const s of [-1,1])ar(s,[s*.27,sh-.3,0],[s*.27,sh-.58,.02])}
  this.cylY(...L(0,0,0).filter((_,i)=>i!==1),sh,sh+.09,.05,mm.skin,8);const hd=L(0,sh+.21,0);this.put(new T.SphereGeometry(.115,14,10),mm.skin,hd[0],hd[1],hd[2],0,ry,0,1,1.12,1);
  const hr=L(0,sh+.25,.015);this.put(new T.SphereGeometry(.122,14,8,0,PI*2,0,PI*.55),mm.hair,hr[0],hr[1],hr[2],0,ry,0,1,1.05,1.04)};
 const chair=(x,z,ry)=>{this.box(x,.47,z,.52,.08,.5,mm.chair,ry);this.box(x+Math.sin(ry)*.26,.88,z+Math.cos(ry)*.26,.48,.7,.06,mm.mesh,ry);this.cylY(x,z,.08,.45,.035,mm.dark,6);for(let k=0;k<5;k++){const a=k*1.2566;this.box(x+Math.cos(a)*.15,.06,z+Math.sin(a)*.15,.3,.04,.05,mm.dark,-a)}};
 const plant=(x,z)=>{this.cylY(x,z,.32,.75,.2,mm.pot,12);for(let k=0;k<7;k++){const a=k*.9,r=.12+R()*.1;this.put(new T.SphereGeometry(.2,7,5),mm.leaf,x+Math.cos(a)*r,1.0+R()*.45,z+Math.sin(a)*r,0,a,0,1,1.4,.8)}};
 const monitor=(x,y,z,ry,w,h,tex)=>{const mon=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,toneMapped:false}));const ox=Math.sin(ry),oz=Math.cos(ry);mon.position.set(x+ox*.017,y,z+oz*.017);mon.rotation.y=ry;this.scene.add(mon);
  this.box(x,y,z,w+.04,h+.04,.03,mm.dark,ry);this.box(x-ox*.06,y-h/2-.08,z-oz*.06,.05,.18,.05,mm.dark,ry);this.box(x-ox*.06,y-h/2-.17,z-oz*.06,.24,.015,.16,mm.dark,ry)};
 // ---- bino: yengil metall qoplama, shisha old tomon, ichida shift plitalari va chiroqlar ----
 const building=(B,stripe,sign,o={})=>{const {x,z,w,d,h}=B,fz=z+d/2,bz=z-d/2,lx=x-w/2,rx=x+w/2,dz=o.doorZ??z+1.6;
  this.box(x,.15,z,w+1.2,.3,d+1.2,m.conc);
  this.box(x,h/2+.3,bz,w,h,.18,mm.clad);this.box(lx,h/2+.3,z,.18,h,d,mm.clad);this.box(rx,h/2+.3,(bz+dz-.6)/2,.18,h,dz-.6-bz,mm.clad);this.box(rx,h/2+.3,(dz+.6+fz)/2,.18,h,fz-dz-.6,mm.clad);this.box(rx,h-.1,dz,.18,.8,1.2,mm.clad);
  this.box(rx+.02,1.35,dz,.06,2.1,1,m.dark);this.box(rx+.4,2.55,dz,.9,.08,1.3,m.frame);
  this.box(x,.75,fz,w,.9,.18,mm.clad);this.box(x,h-.1,fz,w,.8,.18,mm.clad);
  const gl=new T.Mesh(new T.BoxGeometry(w-.2,h-1.6,.05),m.glass);gl.position.set(x,(1.2+h-.5)/2,fz);gl.renderOrder=2;this.scene.add(gl);
  const n=Math.round(w/1.6);for(let i=0;i<=n;i++){const px=lx+.1+i*(w-.2)/n;this.box(px,(1.2+h-.5)/2,fz,.08,h-1.68,.12,m.dark)}this.box(x,1.2,fz,w,.08,.14,m.dark);this.box(x,h-.5,fz,w,.08,.14,m.dark);
  this.box(x,h-.42,fz+.1,w+.05,.16,.06,stripe);this.box(x,h+.26,fz+.1,w+.05,.06,.06,stripe);
  this.box(x,h/2+.3,bz+.1,w-.3,h,.02,mm.wallIn);this.box(lx+.1,h/2+.3,z,.02,h,d-.3,mm.wallIn);this.box(rx-.1,h/2+.3,z,.02,h,d-.3,mm.wallIn);
  const fm=M({map:floorTex(false),roughness:.6,metalness:.05});fm.map.repeat.set((w-.2)/2.4,(d-.2)/2.4);const fl=new T.Mesh(new T.PlaneGeometry(w-.2,d-.2),fm);fl.rotation.x=-PI/2;fl.position.set(x,.33,z);fl.receiveShadow=true;this.scene.add(fl);
  const roof=new T.Group();const rm=new T.Mesh(new T.BoxGeometry(w+.5,.25,d+.5),mm.clad);rm.position.set(x,h+.42,z);roof.add(rm);
  for(const [ax,az] of [[x-w/4,z],[x+w/4,z-1]]){const ac=new T.Mesh(new T.BoxGeometry(1.4,.7,1),mm.cab);ac.position.set(ax,h+.9,az);roof.add(ac);const f=new T.Mesh(new T.CylinderGeometry(.35,.35,.05,16),m.dark);f.position.set(ax,h+1.26,az);roof.add(f)}
  const cm=M({map:ceilTex(),roughness:.9});cm.map.repeat.set((w-.2)/1.2,(d-.2)/1.2);const ce=new T.Mesh(new T.PlaneGeometry(w-.2,d-.2),cm);ce.rotation.x=PI/2;ce.position.set(x,h+.285,z);roof.add(ce);
  for(const [px,pz,pw,pd] of o.lights){const lm=new T.Mesh(new T.BoxGeometry(pw,.03,pd),mm.ceil);lm.position.set(px,h+.27,pz);roof.add(lm)}
  roof.traverse(q=>{if(q.isMesh){q.castShadow=q.material===mm.clad||q.material===mm.cab;q.receiveShadow=true}});this.scene.add(roof);RM.roofs.push(roof);
  this.plate(sign,lx+2.4,h-.1,fz+.13,0,3.4);
  for(const lp of o.lamps){const lamp=new T.PointLight(0xfff4e2,0,16,1.4);lamp.position.set(lp[0],h-.1,lp[1]);this.scene.add(lamp);RM.lamps.push(lamp)}
  const pk=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({visible:false}));pk.position.set(x,h/2+.3,z);pk.userData.eq=B===DCS?'dcs':'sis';this.picks.push(pk);this.scene.add(pk);
  return {fz,bz,lx,rx}};
 // ================= DCS OPERATOR XONASI =================
 const dl=[];for(let i=0;i<4;i++)for(const k of [-1,1])dl.push([DCS.x-6+i*4,DCS.z+k*2.2,1.2,.6]);
 const D=building(DCS,mm.blue,'DCS XONASI',{lights:dl,lamps:[[DCS.x-4,DCS.z],[DCS.x+4,DCS.z]]});
 // video-devor: 3×2 panel (55"), ingichka ramkalar
 const vw=screen(1536,512,(c,s)=>{c.save();c.scale(1.5,1.6);this.drawVideoWall(c,s);c.restore()});const vwm=new T.Mesh(new T.PlaneGeometry(7.2,2.4),new T.MeshBasicMaterial({map:vw.tex,toneMapped:false}));vwm.position.set(DCS.x,2.35,D.bz+.14);this.scene.add(vwm);RM.screens.push(vw);
 this.box(DCS.x,2.35,D.bz+.105,7.36,2.56,.04,mm.dark);this.box(DCS.x,2.35,D.bz+.145,.03,2.4,.01,mm.dark);for(const k of [-1,1]){this.box(DCS.x+k*1.2,2.35,D.bz+.145,.03,2.4,.01,mm.dark)}this.box(DCS.x,2.35,D.bz+.145,7.2,.03,.01,mm.dark);
 const sc15=f=>(c,s)=>{c.save();c.scale(1.5,1.5);f.call(this,c,s);c.restore()};const mons={p0:screen(384,240,(c,s)=>this.drawProc(c,s,0)),p1:screen(384,240,(c,s)=>this.drawProc(c,s,1)),trend:screen(384,240,sc15(this.drawTrend)),alarm:screen(384,240,sc15(this.drawAlarms)),sis:screen(384,240,sc15(this.drawSisMon))};
 RM.screens.push(mons.p0,mons.p1,mons.trend,mons.alarm,mons.sis);
 const kinds=[['alarm','p0','p1','trend'],['p1','p0','trend','sis'],['trend','p1','p0','alarm']];
 for(let i=0;i<3;i++){const cx=DCS.x-5.2+i*5.2,dz=D.bz+3.1;this.box(cx,.78,dz,3.3,.05,.9,mm.deskTop);this.box(cx,.45,dz-.12,3.2,.62,.6,mm.desk);this.box(cx,.45,dz+.3,3.2,.62,.03,mm.desk);
  kinds[i].forEach((k,j)=>{const a=(j-1.5)*.16,mx=cx+(j-1.5)*.7,mz=dz-.22+Math.abs(j-1.5)*.06;monitor(mx,1.17,mz,-a,.64,.38,mons[k].tex)});
  monitor(cx-.35,1.62,dz-.3,0,.64,.38,mons[i===1?'sis':'p0'].tex);monitor(cx+.35,1.62,dz-.3,0,.64,.38,mons[i===2?'alarm':'p1'].tex);
  this.box(cx-.1,.815,dz+.15,.46,.02,.16,mm.dark);this.box(cx+.35,.815,dz+.17,.07,.03,.11,mm.dark);this.box(cx+.7,.81,dz+.12,.22,.01,.3,mm.paper);
  chair(cx,dz+.85,0);worker(cx,dz+.8,0,{sit:true,arms:'desk'})}
 // smena boshlig'i (daftar bilan) va katta muhandis (ekranni ko'rsatmoqda)
 worker(DCS.x+3.5,D.bz+5.1,PI*.1,{book:true});worker(DCS.x+2.3,D.bz+4.9,-PI*.12,{point:true});
 this.plate('DCS · OPERATOR XONASI',D.lx+.13,2.95,DCS.z+1,PI/2,3.2);{const ck=[D.lx+.14,2.95,DCS.z-2.4];this.disc(...ck,.28,.04,mm.paper,'x',24);this.torus(...ck,.28,.025,mm.dark,'x',PI*2,24);this.box(ck[0]+.03,ck[1]+.08,ck[2],.01,.17,.02,mm.dark);this.box(ck[0]+.03,ck[1],ck[2]+.06,.01,.02,.13,mm.dark)}
 // supervayzer stoli, printer/server shkafi, o'simliklar
 const sx=DCS.x+.2,sz=D.bz+6.6;this.box(sx,.78,sz,2.4,.05,.8,mm.deskTop);this.box(sx,.45,sz,2.3,.62,.6,mm.desk);monitor(sx-.4,1.17,sz-.2,0,.64,.38,mons.trend.tex);monitor(sx+.4,1.17,sz-.2,0,.64,.38,mons.alarm.tex);chair(sx,sz+.7,0);
 this.box(D.lx+.5,1.2,D.bz+1,.8,1.8,.6,mm.cab);this.box(D.lx+.82,1.3,D.bz+1,.02,1.2,.5,mm.cabDark);plant(D.lx+.6,D.fz-.8);plant(D.rx-.6,D.bz+.7);plant(D.lx+.6,D.bz+2.4);
 // ================= ISR-1: SIS / ESD va I/O shkaflari xonasi =================
 const il=[];for(const ax of [-2.15,2.15])for(let k=0;k<4;k++)il.push([SISB.x+ax,SISB.z-3.6+k*2.3,.25,1.6]);
 const Q=building(SISB,mm.red,'ISR-1 · SIS XONASI',{lights:il,lamps:[[SISB.x,SISB.z-1]],doorZ:SISB.z+SISB.d/2-1.4});
 // teshikli pol (yo'laklar)
 for(const ax of [-2.15,2.15]){const pf=new T.Mesh(new T.PlaneGeometry(1.2,7.8),mm.perf);pf.rotation.x=-PI/2;pf.position.set(SISB.x+ax,.335,Q.bz+4.4);mm.perf.map.repeat.set(2,13);this.scene.add(pf)}
 // shkaf qatorlari: A (chap devor), B|C (markazda, orqama-orqa), D (o'ng devor)
 const live=[['TMR A','tmr',0],['TMR B','tmr',1],['TMR C','tmr',2],['I/O · kanallar','io',0],['XV rele / solenoid','xv',0]];let li=0;
 const cabinet=(cx,cz,face,k)=>{const ry=face>0?PI/2:-PI/2,fx=cx+face*.3,op=!!k.open;if(op){this.box(cx-face*.05,1.37,cz,.5,2.06,.78,mm.cab);for(const sz of [-.375,.375])this.box(cx+face*.25,1.37,cz+sz,.1,2.06,.03,mm.cab);this.box(cx+face*.25,2.38,cz,.1,.06,.78,mm.cab);this.box(cx+face*.25,.48,cz,.1,.14,.78,mm.cab)}else this.box(cx,1.37,cz,.6,2.06,.78,mm.cab);this.box(cx,.38,cz,.6,.1,.78,mm.cabDark);this.box(cx,2.44,cz,.62,.08,.8,mm.cabDark);
  const open=k.open,lv=k.live;let mat=mm.cabIn[k.v];if(lv){const [name,kind,idx]=lv;const sc=screen(192,384,(c,s)=>this.drawCabinet(c,s,kind,idx,name));RM.screens.push(sc);mat=new T.MeshBasicMaterial({map:sc.tex,toneMapped:false})}
  if(open){const pl=new T.Mesh(new T.PlaneGeometry(.68,1.86),mat);pl.position.set(cx+face*.205,1.38,cz);pl.rotation.y=ry;this.scene.add(pl);
   if(k.door){const hz=cz-.38,dg=new T.BoxGeometry(.025,1.9,.74);dg.translate(0,0,.37);const dr=new T.Mesh(dg,mm.cab);dr.position.set(fx,1.38,hz);dr.rotation.y=face>0?1.75:-1.75;dr.castShadow=true;this.scene.add(dr)}}
  else{const pl=new T.Mesh(new T.PlaneGeometry(.74,1.9),mm.door);pl.position.set(fx+face*.005,1.38,cz);pl.rotation.y=ry;this.scene.add(pl)}};
 const rows=[[-3.95,1],[-.35,-1],[.35,1],[3.95,-1]];let ci=0;
 rows.forEach(([ox,face],r)=>{for(let i=0;i<9;i++){const cz=Q.bz+.85+i*.8;const k={v:(r+i)%3===1?1:(r+i)%3===2?2:(r<2?1:0),open:(i+r)%3!==1,door:(i+r)%4===0};
   if(r===1&&i>=2&&i<7&&li<live.length){k.live=live[li++];k.open=true}if(r===0||r===3){if(i===8)continue}ci++;cabinet(SISB.x+ox,cz,face,k)}});
 // kabel lotoklari (ko'k kabel dastalari) va yoritgichlar ustida
 for(const ax of [-3.4,-1,1,3.4]){const tx0=SISB.x+ax,y=SISB.h-.35;this.box(tx0,y,Q.bz+4.2,.5,.03,8,mm.cab);for(const s of [-1,1])this.box(tx0+s*.25,y+.05,Q.bz+4.2,.02,.1,8,mm.cab);for(let k=0;k<5;k++)this.cylAB([tx0-.18+k*.09,y+.07,Q.bz+.3],[tx0-.18+k*.09,y+.07,Q.bz+8.1],.035,k===2?mm.cableY:mm.cable,6);
  for(let zz=Q.bz+.6;zz<Q.bz+8.2;zz+=1.6)this.cylAB([tx0,y,zz],[tx0,SISB.h+.29,zz],.015,m.frame,4)}
 // orqa devor: eshik, "ISR-1" belgisi, ESD paneli
 this.box(SISB.x-2.15,1.35,Q.bz+.12,.95,2.05,.05,mm.cab);this.box(SISB.x-2.15,1.75,Q.bz+.15,.12,.45,.02,m.glass);this.box(SISB.x-1.8,1.25,Q.bz+.16,.04,.16,.04,mm.dark);
 this.plate('ISR-1',SISB.x-2.15,2.75,Q.bz+.14,0,.9);
 const ex=SISB.x+2.15,ez=Q.bz+.2;this.box(ex,1.45,ez,1.4,1.2,.12,mm.cab);this.box(ex,1.95,ez+.07,1.25,.16,.02,mm.red);
 const btnMat=new T.MeshStandardMaterial({color:0x8a1010,emissive:0x000000,roughness:.35});const btn=new T.Mesh(new T.SphereGeometry(.16,16,10,0,PI*2,0,PI/2),btnMat);btn.rotation.x=PI/2;btn.position.set(ex-.35,1.4,ez+.08);this.scene.add(btn);
 this.cylAB([ex-.35,1.4,ez+.06],[ex-.35,1.4,ez+.16],.2,mm.yellow,18);RM.esdBtn=btnMat;
 RM.sifLamps=S.SIF.filter(f=>!f.manual).map((f,i)=>{const mt=new T.MeshStandardMaterial({color:0x2a3a2a,emissive:0x000000});const l=new T.Mesh(new T.SphereGeometry(.05,10,8),mt);l.position.set(ex+.25+(i%3)*.16,1.72-Math.floor(i/3)*.2,ez+.08);this.scene.add(l);return {f,mt}});
 const rst=new T.Mesh(new T.CylinderGeometry(.06,.06,.06,14),new T.MeshStandardMaterial({color:0x2a64c8}));rst.rotation.x=PI/2;rst.position.set(ex-.35,1.05,ez+.09);this.scene.add(rst);
 // muhandislik stansiyasi (old qismda, shkaflarga qaragan) va texnik
 const es=SISB.x+2.0,ez2=Q.fz-1.75;this.box(es,.78,ez2,2.4,.05,.8,mm.deskTop);this.box(es,.45,ez2-.1,2.3,.62,.55,mm.desk);
 for(const [j,k] of [[-1,'p1'],[0,'p0'],[1,'trend']])monitor(es+j*.7,1.17,ez2-.22+Math.abs(j)*.06,-j*.16,.64,.38,mons[k].tex);chair(es,ez2+.85,0);
 this.plate('MUHANDISLIK STANSIYASI',Q.rx-.13,2.5,ez2,-PI/2,1.9);plant(Q.lx+.5,Q.fz-.6);
 worker(SISB.x-2.3,Q.bz+4.1,-PI/2,{book:true});worker(es,ez2+.8,0,{sit:true,arms:'desk'});
 // tomdagi SIS mayoqchasi
 const bmat=new T.MeshStandardMaterial({color:0x661010,emissive:0x000000});const bk=new T.Mesh(new T.CylinderGeometry(.16,.16,.32,14),bmat);bk.position.set(SISB.x+3,SISB.h+.75,SISB.z+2.6);RM.roofs[1].add(bk);RM.beacon=bmat;
 // ================= KABEL TOKCHALARI va signal oqimlari =================
 const tray=(pts)=>{for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];this.cylAB([a[0],a[1]-.1,a[2]],[b[0],b[1]-.1,b[2]],.05,m.frame,4);const L=Math.hypot(b[0]-a[0],b[2]-a[2]);for(let s=0;s<=L;s+=3.5){const u=L?s/L:0,px=a[0]+(b[0]-a[0])*u,pz=a[2]+(b[2]-a[2])*u;this.cylAB([px,0,pz],[px,a[1]-.15,pz],.04,m.frame,4)}}};
 const DP=[[-.8,2.5,11.6],[-.8,2.5,28.4],[-21,2.5,28.4],[-21,2.5,29.4]],SP=[[6.2,2.75,2],[6.2,2.75,12.2],[-.4,2.75,12.2],[-.4,2.75,32],[-2.1,2.75,32]];
 tray(DP);tray(SP);
 const flowLine=(pts,color,n)=>{const cp=new T.CurvePath();for(let i=0;i<pts.length-1;i++)cp.add(new T.LineCurve3(new V3(...pts[i]),new V3(...pts[i+1])));const mat=new T.MeshBasicMaterial({color,toneMapped:false});const im=new T.InstancedMesh(new T.SphereGeometry(.07,8,6),mat,n);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.frustumCulled=false;this.scene.add(im);const o={cp,im,n,mat,len:cp.getLength(),dir:1};RM.pulses.push(o);return o};
 RM.dcsFlow=flowLine(DP,0x39a8ff,26);RM.sisFlow=flowLine(SP,0x2dd4bf,22);
 // ================= DALA SIS ASBOBLARI =================
 const xvAct=(k,p)=>{const [x,y,z]=p;this.disc(x-.3,y,z,.24,.08,m.steel,'x',16);this.disc(x+.3,y,z,.24,.08,m.steel,'x',16);this.sphere(x,y,z,.26,mm.valve,14);
  this.cylAB([x,y+.2,z],[x,y+.55,z],.06,m.steel,8);this.cylAB([x-.42,y+.78,z],[x+.42,y+.78,z],.24,mm.yellow,18);this.disc(x-.42,y+.78,z,.27,.06,mm.yellow,'x',18);this.disc(x+.42,y+.78,z,.27,.06,mm.yellow,'x',18);
  this.box(x,y+.6,z+.18,.18,.14,.1,m.dark);// solenoid
  const ind=new T.Mesh(new T.BoxGeometry(.5,.07,.1),new T.MeshStandardMaterial({color:0x2f9c3e,emissive:0x0b3010}));ind.position.set(x,y+1.08,z);this.scene.add(ind);
  const lamp=new T.Mesh(new T.SphereGeometry(.07,10,8),new T.MeshStandardMaterial({color:0x2f9c3e,emissive:0x1a6020}));lamp.position.set(x+.2,y+.62,z+.25);this.scene.add(lamp);
  RM.xv[k]={ind,lamp};this.plate(k,x,y+1.42,z,0,.9);const pk=new T.Mesh(new T.SphereGeometry(.6),new T.MeshBasicMaterial({visible:false}));pk.position.set(x,y+.5,z);pk.userData.eq='sis';this.picks.push(pk);this.scene.add(pk)};
 for(const [k,p] of Object.entries(XVPOS))xvAct(k,p);
 const tx_=(x,y,z,tag,az)=>{const ox=Math.cos(az),oz=Math.sin(az);this.cylAB([x,y,z],[x+ox*.35,y,z+oz*.35],.04,m.steel,6);this.cylY(x+ox*.45,z+oz*.45,y-.1,y+.16,.11,mm.yellow,12);this.box(x+ox*.45,y+.22,z+oz*.45,.18,.12,.18,m.dark);this.plate(tag,x+ox*.55,y+.48,z+oz*.55,-az+PI/2,.75)};
 [['LT17054A',PI*.62],['LT17054B',PI*.72],['LT17054C',PI*.82]].forEach(([t,a],i)=>tx_(5+Math.cos(a)*1.7,3.1+i*.55,Math.sin(a)*1.7,t,a));
 [['LT17005A',PI*.45],['LT17005B',PI*.62]].forEach(([t,a],i)=>tx_(-2.5+Math.cos(a)*1.1,3.4+i*.6,2+Math.sin(a)*1.1,t,a));
 [['PT17012A',-29],['PT17012B',-28],['PT17012C',-27]].forEach(([t,x])=>{this.cylAB([x,.9,0],[x,1.4,0],.04,m.steel,6);this.cylY(x,0,1.4,1.65,.1,mm.yellow,12);this.box(x,1.75,0,.16,.12,.16,m.dark);this.plate(t,x,2.05,.12,0,.75)});
 // sirena va ogohlantirish chirog'i (I/O paneli yonida)
 this.cylY(3.4,11.2,0,4.2,.06,m.dark,8);const sm=new T.MeshStandardMaterial({color:0x7a4a08,emissive:0x000000});const sl=new T.Mesh(new T.CylinderGeometry(.15,.15,.3,12),sm);sl.position.set(3.4,4.4,11.2);this.scene.add(sl);RM.siren=sm;this.cylAB([3.4,3.9,11.2],[3.9,3.9,11.4],.12,m.dark,10,.2);
 // yozuvlar
 this.label('DCS operator xonasi',[DCS.x,5.6,DCS.z],'room-dcs',5);this.label('SIS / ESD xonasi',[SISB.x,5.6,SISB.z],'room-sis',5);
};
// ---- ekran chizish ----
const C={bg:'#06121c',ink:'#d7e7f2',mut:'#7d97aa',ok:'#2ecc71',warn:'#f5b041',bad:'#ff5252',cy:'#3fb6ff',am:'#e0b84a'};
P.drawVideoWall=function(c,s){const W=1024,H=320;c.fillStyle=C.bg;c.fillRect(0,0,W,H);c.fillStyle='#0f2a40';c.fillRect(0,0,W,34);c.fillStyle=C.ink;c.font='600 20px Segoe UI,Arial';c.fillText(tx('GP1701 · DA-1701 AMIN BLOKI'),14,24);
 const sis=s.sis||{},tr=(sis.trip||[]).length;c.textAlign='right';c.fillStyle=tr?C.bad:C.ok;c.fillText(tr?(sis.esd?'ESD-1':'SIS TRIP '+sis.trip.join(',')):tx('SIS normal'),W-14,24);c.textAlign='left';
 const box=(x,y,w,h,name,lev,col)=>{silver(c,x,y,w,h,lev,col);c.fillStyle=C.ink;c.font='600 14px Segoe UI';c.fillText(tx(name),x,y-6)};
 c.strokeStyle='#3c84b8';c.lineWidth=4;c.beginPath();c.moveTo(30,200);c.lineTo(140,200);c.moveTo(220,200);c.lineTo(330,200);c.lineTo(330,240);c.moveTo(400,240);c.lineTo(560,240);c.moveTo(620,70);c.lineTo(620,52);c.lineTo(960,52);c.stroke();
 c.strokeStyle='#3fae8e';c.beginPath();c.moveTo(960,96);c.lineTo(700,96);c.stroke();c.strokeStyle='#c49a42';c.beginPath();c.moveTo(620,300);c.lineTo(960,300);c.stroke();
 for(let i=0;i<3;i++){c.strokeStyle='#5b7a92';c.strokeRect(140,150+i*28,80,18)}c.fillStyle=C.ink;c.font='600 14px Segoe UI';c.fillText(tx('EA-1706 A/B/C'),140,142);
 box(340,210,60,80,'FA-1702',s.K,'#7d68b8');box(560,70,120,225,'DA-1701',s.measured?.L,'#c19a43');
 const tag=(x,y,t,v,u,bad)=>{c.fillStyle='#0b2234';c.fillRect(x,y,150,40);c.strokeStyle=bad?C.bad:'#36607e';c.strokeRect(x,y,150,40);c.fillStyle=C.mut;c.font='12px Segoe UI';c.fillText(tx(t),x+7,y+14);c.fillStyle=bad?C.bad:C.cy;c.font='600 17px Consolas,monospace';c.fillText(v,x+7,y+34);c.fillStyle=C.mut;c.font='12px Segoe UI';c.fillText(u,x+108,y+34)};
 const f=(v,d=1)=>v==null||!isFinite(v)?'NaN':v.toFixed(d);
 tag(14,240,'PI17012',f(s.press,0),'kPa',s.press>=4200);tag(380,110,'FCI17001',f(s.g),'%Qref');tag(700,120,'LC17003',f(s.measured?.L),'%',s.measured?.L==null||s.L>=85||s.L<=10);
 tag(700,170,'TI17005',f(s.To),'°C');tag(700,220,'TI17006',f(s.Tr),'°C',s.Tr>=72);tag(860,120,'AI17001 CO₂',f(s.ai,0),'ppmv',s.ai==null||s.ai>=1000);tag(860,170,'α',f(s.alpha,3),'mol/mol',s.alpha>=.45);tag(860,220,'PDI17010',f(s.dp,2),'ref.',s.dp>=1.6);
 const al=(s.alarms||[]).length;c.fillStyle=al?C.warn:C.mut;c.font='600 14px Segoe UI';c.fillText(tx('Faol alarm')+': '+al,14,60)};
P.drawTrend=function(c,s){const W=256,H=160,h=this.rooms.hist;c.fillStyle=C.bg;c.fillRect(0,0,W,H);c.fillStyle=C.mut;c.font='11px Segoe UI';c.fillText(tx('AI17001 CO₂ · LC17003'),8,14);
 c.strokeStyle='#18324a';for(let i=1;i<4;i++){c.beginPath();c.moveTo(0,20+i*33);c.lineTo(W,20+i*33);c.stroke()}
 const line=(k,max,col)=>{c.strokeStyle=col;c.lineWidth=2;c.beginPath();h.forEach((p,i)=>{const v=p[k];if(v==null)return;const x=i/(Math.max(1,h.length-1))*W,y=150-Math.min(1,v/max)*125;i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke()};
 line('ai',Math.max(1200,...h.map(p=>p.ai||0)),'#ff7468');line('L',100,'#3fd0c0');c.fillStyle=C.ink;c.font='600 12px Consolas';c.fillText((s.ai==null?'NaN':s.ai.toFixed(0))+' ppmv',150,14)};
P.drawAlarms=function(c,s){const W=256,H=160;c.fillStyle=C.bg;c.fillRect(0,0,W,H);c.fillStyle='#2a1a10';c.fillRect(0,0,W,18);c.fillStyle=C.am;c.font='600 11px Segoe UI';c.fillText(tx('Faol o‘quv ogohlantirishlari'),6,13);
 const A=(s.alarms||[]).slice(-7).reverse();if(!A.length){c.fillStyle=C.ok;c.fillText(tx('Faol ogohlantirish yo‘q.'),8,40)}A.forEach((a,i)=>{c.fillStyle=['HH','LL','BAD'].includes(a.level)?C.bad:C.warn;c.font='10.5px Segoe UI';c.fillText(tx(a.text).slice(0,40),6,34+i*18)})};
P.drawSisMon=function(c,s){const W=256,H=160,z=s.sis||{trip:[],bypass:[]};c.fillStyle=C.bg;c.fillRect(0,0,W,H);c.fillStyle=C.ink;c.font='600 11px Segoe UI';c.fillText('SIS / ESD',8,14);
 S.SIF.forEach((f,i)=>{const t=(z.trip||[]).includes(f.id),b=(z.bypass||[]).includes(f.id);c.fillStyle=t?C.bad:b?C.am:C.ok;c.beginPath();c.arc(14,32+i*21,6,0,PI*2);c.fill();c.fillStyle=C.ink;c.font='11px Consolas';c.fillText(f.id+' '+(t?'TRIP':b?'BYPASS':'OK'),28,36+i*21)})};
// metall (kumushrang) idish — operator ekranlaridagi zamonaviy grafika uslubi
const silver=(c,x,y,w,h,lev,col)=>{const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#5f6a74');g.addColorStop(.32,'#eef2f5');g.addColorStop(.58,'#b4bec6');g.addColorStop(1,'#56606a');const r=Math.min(w,h)/2;
 c.beginPath();c.moveTo(x,y+r);c.arc(x+w/2,y+r,w/2,PI,0);c.lineTo(x+w,y+h-r);c.arc(x+w/2,y+h-r,w/2,0,PI);c.closePath();c.fillStyle=g;c.fill();
 if(lev!=null&&isFinite(lev)){c.save();c.clip();c.fillStyle=col;c.globalAlpha=.5;const lh=(h-4)*Math.max(0,Math.min(100,lev))/100;c.fillRect(x,y+h-2-lh,w,lh);c.restore()}c.strokeStyle='#2c3640';c.lineWidth=1.2;c.stroke()};
const hsilver=(c,x,y,w,h)=>{const g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#5f6a74');g.addColorStop(.35,'#eef2f5');g.addColorStop(1,'#56606a');c.fillStyle=g;c.beginPath();c.moveTo(x+h/2,y);c.lineTo(x+w-h/2,y);c.arc(x+w-h/2,y+h/2,h/2,-PI/2,PI/2);c.lineTo(x+h/2,y+h);c.arc(x+h/2,y+h/2,h/2,PI/2,PI*1.5);c.fill();c.strokeStyle='#2c3640';c.stroke()};
P.drawProc=function(c,s,v){const W=384,H=240,f=(x,d=1)=>x==null||!isFinite(x)?'NaN':x.toFixed(d),z=s.sis||{},xv=z.xv||{};
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e2d40');g.addColorStop(1,'#142130');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#2a3f57';c.fillRect(0,0,W,18);c.fillStyle='#cfe0ee';c.font='600 11px Segoe UI,Arial';
 c.fillText(tx(v?'EA-1706 A/B/C':'GP1701 · DA-1701 AMIN BLOKI'),6,13);c.fillStyle='#7f9bb3';c.textAlign='right';c.fillText(new Date().toTimeString().slice(0,8),W-6,13);c.textAlign='left';
 c.strokeStyle='rgba(120,150,180,.08)';for(let i=0;i<W;i+=24){c.beginPath();c.moveTo(i,18);c.lineTo(i,H);c.stroke()}
 const pipe=(pts,col,w=3)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();pts.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.stroke()};
 const val=(x,y,t,vv,u,bad)=>{c.fillStyle='rgba(8,16,26,.85)';c.fillRect(x,y,78,26);c.strokeStyle=bad?'#ff5252':'#3f6584';c.lineWidth=1;c.strokeRect(x,y,78,26);c.fillStyle='#8fa9bf';c.font='9px Segoe UI';c.fillText(tx(t),x+4,y+10);c.fillStyle=bad?'#ff6b6b':'#5fd0ff';c.font='600 11px Consolas';c.fillText(vv+' '+u,x+4,y+22)};
 const valve=(x,y,k)=>{const p=xv[k]??100,col=p<=0?'#ff4040':p<100?'#f2b233':'#36d07a';c.fillStyle=col;c.beginPath();c.moveTo(x-7,y-5);c.lineTo(x+7,y+5);c.lineTo(x+7,y-5);c.lineTo(x-7,y+5);c.closePath();c.fill()};
 if(!v){pipe([[10,190],[150,190],[150,170]],'#4aa8ff');pipe([[175,40],[175,30],[370,30]],'#4aa8ff');pipe([[370,80],[200,80]],'#43c97b');pipe([[175,214],[175,226],[370,226]],'#e58a3a');pipe([[90,120],[120,120]],'#43c97b',2);
  silver(c,150,40,50,176,s.measured?.L,'#d9a441');silver(c,60,120,34,70,s.K,'#8f7ad6');valve(40,190,'XV17001');valve(300,30,'XV17005');valve(300,226,'XV17003');
  c.fillStyle='#dbe7f0';c.font='600 10px Segoe UI';c.fillText(tx('DA-1701'),152,36);c.fillText(tx('FA-1702'),58,114);
  val(222,92,'LC17003',f(s.measured?.L),'%',s.L>=85||s.L<=10);val(222,124,'TI17006',f(s.Tr),'°C',s.Tr>=72);val(222,156,'AI17001 CO₂',f(s.ai,0),'ppm',s.ai==null||s.ai>=1000);val(302,92,'α',f(s.alpha,3),'',s.alpha>=.45);val(302,124,'FCI17001',f(s.g),'%');val(302,156,'PI17012',f(s.press,0),'kPa',s.press>=4200)}
 else{pipe([[10,60],[330,60]],'#4aa8ff');for(let i=0;i<3;i++){hsilver(c,40+i*96,80,80,26);pipe([[80+i*96,60],[80+i*96,80]],'#4aa8ff',2);pipe([[80+i*96,106],[80+i*96,140]],'#4aa8ff',2);
   for(let k=0;k<4;k++){c.strokeStyle='#8fa9bf';c.beginPath();c.arc(56+i*96+k*16,74,6,0,7);c.stroke()}c.fillStyle='#dbe7f0';c.font='600 9px Segoe UI';c.fillText(tx('EA-1706 '+'ABC'[i]),44+i*96,122)}
  pipe([[30,140],[330,140],[330,170]],'#4aa8ff');silver(c,312,160,40,64,s.K,'#8f7ad6');valve(200,140,'XV17002');valve(260,60,'XV17006');
  val(20,160,'TI17007',f(s.Ti),'°C');val(110,160,'PI17012',f(s.press,0),'kPa',s.press>=4200);val(200,160,'PDI17010',f(s.dp,2),'',s.dp>=1.6);c.fillStyle='#dbe7f0';c.font='600 10px Segoe UI';c.fillText(tx('FA-1702'),312,154)}
 const al=(s.alarms||[]).length;c.fillStyle=al?'#3a2410':'#13301f';c.fillRect(0,H-14,W,14);c.fillStyle=al?'#f5b041':'#2ecc71';c.font='9px Segoe UI';c.fillText(tx('Faol alarm')+': '+al+'   ·   '+((z.trip||[]).length?'SIS TRIP '+z.trip.join(','):tx('SIS normal')),6,H-4)};
P.drawCabinet=function(c,s,kind,idx,name){const W=192,H=384,z=s.sis||{trip:[],bypass:[],xv:{}},sis=window.AmineApp?.model?.sis,t=this.animTime||0;
 c.fillStyle='#d3d7da';c.fillRect(0,0,W,H);c.fillStyle='#b9bec2';c.fillRect(0,0,9,H);c.fillRect(W-9,0,9,H);c.fillStyle='#8f969c';c.fillRect(W-30,24,16,H-40);
 c.strokeStyle='#2563c9';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(W-26+i*4,24);c.lineTo(W-26+i*4,H-16);c.stroke()}
 c.fillStyle='#fff';c.fillRect(12,4,120,14);c.fillStyle='#222';c.font='600 10px Arial';c.fillText(tx(name),15,15);
 const led=(x,y,col,on=true)=>{c.fillStyle=on?col:'#30363b';c.fillRect(x,y,4,4)};
 const mod=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);c.fillStyle='rgba(255,255,255,.2)';c.fillRect(x,y,w,2);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x+w-1,y,1,h)};
 const duct=y=>{c.fillStyle='#8f969c';c.fillRect(11,y,W-44,10);c.fillStyle='#7b8288';for(let i=14;i<W-36;i+=6)c.fillRect(i,y,2,10)};
 if(kind==='tmr'){for(let r=0;r<3;r++){const y=26+r*112;duct(y);for(let i=0;i<9;i++){const px=13+i*16;mod(px,y+14,14,60,i===0?'#2e3338':'#e2be1d');for(let k=0;k<6;k++)led(px+3,y+20+k*7,k%3===0?'#3fb6ff':'#39e36b',(Math.floor(t*2)+k+i+r+idx)%7!==0||i===0)}
   c.strokeStyle='#2563c9';c.lineWidth=1.5;for(let i=0;i<34;i++){c.beginPath();c.moveTo(14+i*4,y+76);c.lineTo(14+i*4,y+104);c.stroke()}}
  c.fillStyle='#2b3036';c.fillRect(12,H-24,W-46,18);S.SIF.filter(f=>!f.manual).forEach((f,i)=>{const tr=(z.trip||[]).includes(f.id),bp=(z.bypass||[]).includes(f.id);c.fillStyle=tr?((Math.sin(t*8)>0)?'#ff4040':'#601010'):bp?'#f2b233':'#2ecc71';c.beginPath();c.arc(22+i*22,H-15,5,0,7);c.fill()})}
 else if(kind==='io'){let y=26,col=0;duct(y);y+=14;for(const [id,d] of Object.entries(S.SENSORS))d.ch.forEach(ch=>{const k=id+ch,f=sis?.chFail?.[k];const px=13+(col%2)*76,py=y+Math.floor(col/2)*44;mod(px,py,72,38,'#3b4148');led(px+4,py+6,f?'#f2b233':'#39e36b');c.fillStyle='#e6edf2';c.font='9px Consolas';c.fillText(tx(k),px+12,py+11);
   c.strokeStyle='#2563c9';c.lineWidth=1.5;for(let i=0;i<6;i++){c.beginPath();c.moveTo(px+8+i*10,py+38);c.lineTo(px+8+i*10,py+44);c.stroke()}col++})}
 else{let y=26;duct(y);y+=16;for(const k of Object.keys(S.XV)){const v=(z.xv||{})[k]??100;mod(13,y,W-46,34,'#2e3338');for(let i=0;i<4;i++)mod(17+i*14,y+4,12,26,'#c9cdd0');led(80,y+8,v<=0?'#ff4040':v<100?'#f2b233':'#39e36b');c.fillStyle='#e6edf2';c.font='9px Consolas';c.fillText(tx(k),90,y+13);c.fillText(v<=0?'CLOSE':v>=100?'OPEN':v.toFixed(0)+'%',90,y+26);y+=46}}};
// ---- dinamik yangilanish ----
const _bb=P.buildBackground,_render=P.render,_cut=P.setCut,_look=P.setLook,_paint=P.paintLabel,_cam=P.setCamera;
P.buildBackground=function(){_bb.call(this);try{this.buildRooms()}catch(e){console.error('3D xonalar:',e)}};
P.setCut=function(on){_cut.call(this,on)};// xona tomlari doim yopiq
P.setLook=function(k){_look.call(this,k);for(const l of this.rooms?.lamps||[])l.intensity=k==='dusk'?16:10};
// ichki kameralar: DCS — old o'ng burchakdan pultlar va video-devorga; ISR-1 — eshik oldidan shkaflar yo'lagi bo'ylab
const ROOMCAM={dcsroom:[[DCS.x+7.4,1.85,DCS.z+DCS.d/2-.7],[DCS.x-3,1.3,DCS.z-DCS.d/2+1.6]],sisroom:[[SISB.x-2.15,1.68,SISB.z+SISB.d/2-.45],[SISB.x-2.15,1.35,SISB.z-SISB.d/2+.3]]};
P.setCamera=function(id,smooth=true){if(ROOMCAM[id]&&this.camera){this.viewId=id;const v=ROOMCAM[id];if(smooth)this.cameraMove={p0:this.camera.position.clone(),t0:this.controls.target.clone(),p1:new V3(...v[0]),t1:new V3(...v[1]),u:0};else{this.camera.position.set(...v[0]);this.controls.target.set(...v[1])}this.applyRange?.();return}
 _cam.call(this,id,smooth)};
P.paintLabel=function(o,value){if(this.viewId==='dcsroom'||this.viewId==='sisroom'){o.sp.visible=false;return}if(o.key==='room-dcs'||o.key==='room-sis'){const s=this.rooms?.last;if(s){const z=s.sis||{};value=o.key==='room-dcs'?`${tx('Operatorlar')}: 3 · ${tx('alarmlar')}: ${(s.alarms||[]).length}`:(z.esd?'ESD-1':(z.trip||[]).length?'TRIP '+z.trip.join(', '):tx('SIS normal'))}}return _paint.call(this,o,value)};
const tmpM=new T.Matrix4(),tmpQ=new T.Quaternion(),tmpS=new V3(1,1,1);
P.render=function(s,dt){const R=this.rooms;if(this.ready&&R&&s){R.last=s;const t=this.animTime||0;
  R.acc=(R.acc||0)+(dt||0);R.hist=R.hist||[];if(R.acc>=1||!R.hist.length){R.acc=0;R.hist.push({ai:s.ai,L:s.measured?.L});if(R.hist.length>120)R.hist.shift();for(const sc of R.screens){if(sc.draw){sc.draw(sc.ctx,s);sc.tex.needsUpdate=true}}}
  const z=s.sis||{},trip=(z.trip||[]).length>0,blink=Math.sin(t*8)>0;
  for(const [k,o] of Object.entries(R.xv)){const v=(z.xv||{})[k]??100;o.ind.rotation.y=(1-v/100)*PI/2;const cl=v<=0.5,mv=v<99.5&&!cl;const col=cl?0xd32f2f:mv?0xe0a020:0x2f9c3e;o.ind.material.color.setHex(col);o.ind.material.emissive.setHex(cl?0x400808:0x0b3010);o.lamp.material.color.setHex(col);o.lamp.material.emissive.setHex(cl?(blink?0xff2020:0x300000):mv?0x805000:0x1a6020)}
  if(R.esdBtn)R.esdBtn.emissive.setHex(z.esd?(blink?0xff1a1a:0x500000):0x000000);
  for(const l of R.sifLamps||[]){const on=(z.trip||[]).includes(l.f.id),bp=(z.bypass||[]).includes(l.f.id);l.mt.color.setHex(on?0xff3030:bp?0xf2b233:0x2ecc71);l.mt.emissive.setHex(on?(blink?0xff2020:0x400000):bp?0x604000:0x0c4018)}
  if(R.beacon)R.beacon.emissive.setHex(trip&&blink?0xff2020:0x000000);if(R.siren)R.siren.emissive.setHex(trip&&!blink?0xffa020:0x000000);
  // signal oqimlari: DCS — doim ko'k; SIS — normalda yashil (daladan xonaga), tripda qizil (xonadan dalaga buyruq)
  R.sisFlow.mat.color.setHex(trip?0xff3b3b:0x2dd4bf);R.sisFlow.dir=trip?-1:1;
  for(const f of R.pulses){const sp=f===R.sisFlow&&trip?.5:.18;for(let i=0;i<f.n;i++){let u=((t*sp*f.dir)/(f.len/10)+i/f.n)%1;if(u<0)u+=1;const p=f.cp.getPointAt(u);tmpM.compose(p,tmpQ,tmpS);f.im.setMatrixAt(i,tmpM)}f.im.instanceMatrix.needsUpdate=true}}
 _render.call(this,s,dt)};
window.AmineRooms3D=true;
})();
