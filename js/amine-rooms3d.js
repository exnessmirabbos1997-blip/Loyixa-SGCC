(()=>{'use strict';
// ===== 3D: DCS operator xonasi, SIS / ESD shkaf xonasi, dala SIS asboblari (XV, LT/PT), kabel tokchalari =====
// Ikki alohida bino amin bloki oldida: shisha old tomon, ichida jonli ekranlar (video-devor, pult monitorlari),
// SIS shkaflarida LED lar SIF va kanal holatini ko'rsatadi, ESD tugmasi trip bo'lganda yonadi.
// Dalada XV17001…XV17006 (sariq pnevmo-aktuator, fail-close) va SIS uzatgichlari; trip bo'lsa klapan ko'rsatkichi buriladi.
const PS=window.__PS;if(!PS||!PS.PlantScene)return;const {T}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype,S=window.AmineSIS;
const tx=s=>PS.tx(s);
const DCS={x:-21,z:33,w:13,d:7,h:3.6},SISB={x:-6.5,z:33,w:9,d:7,h:3.6};
const XVPOS={XV17001:[-25,.9,0],XV17005:[24,9.4,-4.4],XV17002:[16,8.7,-7.2],XV17006:[17,10.3,-5.6],XV17003:[19.5,.75,4.4],XV17004:[8,.6,8]};
function screen(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return{c,ctx,tex,draw}}
const corr=()=>PS.canvasTex(128,128,(x,W,H)=>{const g=x.createLinearGradient(0,0,W,0);for(let i=0;i<=8;i++){g.addColorStop(i/8,i%2?'#b9c0c5':'#e4e8ea')}x.fillStyle=g;x.fillRect(0,0,W,H)},[6,1]);
P.buildRooms=function(){const m=this.m,R=PS.rnd(57);this.rooms={roofs:[],screens:[],leds:[],xv:{},pulses:[],lamps:[]};const RM=this.rooms;
 const M=o=>new T.MeshStandardMaterial(o);
 const mm={clad:M({map:corr(),metalness:.35,roughness:.55,color:0xffffff}),floor:M({color:0xc9ced2,roughness:.8}),wallIn:M({color:0xe9ece8,roughness:.9}),
  blue:M({color:0x1f5fbf,roughness:.5}),red:M({color:0xc62828,roughness:.5}),desk:M({color:0x2c3540,metalness:.3,roughness:.5}),deskTop:M({color:0x8f9aa3,roughness:.6}),
  cab:M({color:0xd6dadd,metalness:.4,roughness:.45}),cabDark:M({color:0x2b3036,metalness:.4,roughness:.5}),chair:M({color:0x1b1f24,roughness:.7}),
  skin:M({color:0xe0b394,roughness:.8}),overall:M({color:0x1f4f9a,roughness:.75}),orange:M({color:0xe8661c,roughness:.7}),green:M({color:0x3d6b3a,roughness:.75}),
  helmetW:M({color:0xf3f3ee,roughness:.4}),helmetY:M({color:0xf2c218,roughness:.4}),dark:M({color:0x15191d,roughness:.7}),
  yellow:M({color:0xf0b51c,metalness:.2,roughness:.45}),valve:M({color:0x5b6670,metalness:.7,roughness:.4}),ceil:new T.MeshBasicMaterial({color:0xfff6e0})};
 this.mr=mm;
 // ---- inson figurasi (statik, birlashtiriladi) ----
 const person=(x,z,ry,o={})=>{const sit=!!o.sit,c=o.color||mm.overall,hel=o.helmet||mm.helmetW,put=(g,mat,px,py,pz)=>{const v=new V3(px,py,pz).applyAxisAngle(new V3(0,1,0),ry);this.put(g,mat,x+v.x,v.y,z+v.z,0,ry,0)};
  const hip=sit?.5:.92;
  if(sit){put(new T.BoxGeometry(.16,.13,.46),c,-.1,hip,-.2);put(new T.BoxGeometry(.16,.13,.46),c,.1,hip,-.2);put(new T.BoxGeometry(.14,.48,.14),c,-.1,.25,-.42);put(new T.BoxGeometry(.14,.48,.14),c,.1,.25,-.42)}
  else{put(new T.BoxGeometry(.15,.9,.17),c,-.1,.45,0);put(new T.BoxGeometry(.15,.9,.17),c,.1,.45,0);put(new T.BoxGeometry(.16,.08,.28),mm.dark,-.1,.04,-.04);put(new T.BoxGeometry(.16,.08,.28),mm.dark,.1,.04,-.04)}
  put(new T.BoxGeometry(.42,.58,.24),c,0,hip+.33,0);if(o.vest)put(new T.BoxGeometry(.44,.36,.26),mm.orange,0,hip+.4,0);
  const arm=o.arms==='desk'?[[-.27,hip+.33,-.18],[.27,hip+.33,-.18]]:[[-.27,hip+.3,0],[.27,hip+.3,0]];for(const a of arm)put(new T.BoxGeometry(.11,o.arms==='desk'?.14:.56,o.arms==='desk'?.42:.13),c,...a);
  put(new T.SphereGeometry(.13,12,10),mm.skin,0,hip+.78,0);const hg=new T.SphereGeometry(.15,12,8,0,PI*2,0,PI/2);put(hg,hel,0,hip+.82,0);put(new T.BoxGeometry(.32,.025,.32),hel,0,hip+.82,-.02)};
 const chair=(x,z,ry)=>{this.box(x,.45,z,.5,.08,.5,mm.chair,ry);this.box(x+Math.sin(ry)*.24,.8,z+Math.cos(ry)*.24,.48,.6,.07,mm.chair,ry);this.cylY(x,z,.05,.45,.04,mm.dark,6);this.disc(x,.05,z,.3,.04,mm.dark,'y',10)};
 // ---- bino ----
 const building=(B,stripe,sign,sub)=>{const {x,z,w,d,h}=B,fz=z+d/2,bz=z-d/2,lx=x-w/2,rx=x+w/2;
  this.box(x,.15,z,w+1.2,.3,d+1.2,m.conc);this.box(x,.32,z,w-.2,.04,d-.2,mm.floor);
  this.box(x,h/2+.3,bz,w,h,.18,mm.clad);this.box(lx,h/2+.3,z,.18,h,d,mm.clad);this.box(rx,h/2+.3,z-1.4,.18,h,d-2.8,mm.clad);this.box(rx,h/2+.3,fz-.45,.18,h,.9,mm.clad);
  this.box(rx+.02,1.35,z+1.6,.06,2.1,1,m.dark);this.box(rx+.4,2.55,z+1.6,.9,.08,1.3,m.frame);// eshik va soyabon
  this.box(x,.75,fz,w,.9,.18,mm.clad);this.box(x,3.4,fz,w,1.0,.18,mm.clad);// old: past va yuqori devor
  const gl=new T.Mesh(new T.BoxGeometry(w-.2,1.7,.05),m.glass);gl.position.set(x,2.05,fz);gl.renderOrder=2;this.scene.add(gl);
  for(let i=0;i<=Math.round(w/1.6);i++){const px=lx+.1+i*(w-.2)/Math.round(w/1.6);this.box(px,2.05,fz,.08,1.72,.12,m.dark)}this.box(x,1.2,fz,w,.08,.14,m.dark);this.box(x,2.9,fz,w,.08,.14,m.dark);
  this.box(x,3.0,fz+.1,w+.05,.16,.06,stripe);this.box(x,3.86,fz+.1,w+.05,.06,.06,stripe);
  // ichki devor qoplamasi
  this.box(x,h/2+.3,bz+.1,w-.3,h,.02,mm.wallIn);this.box(lx+.1,h/2+.3,z,.02,h,d-.3,mm.wallIn);
  // shift chiroqlari (tom ostida)
  // tom (kesimda yashiriladi)
  const roof=new T.Group();const rm=new T.Mesh(new T.BoxGeometry(w+.5,.25,d+.5),mm.clad);rm.position.set(x,h+.42,z);roof.add(rm);
  for(const [ax,az] of [[x-w/4,z],[x+w/4,z-1]]){const ac=new T.Mesh(new T.BoxGeometry(1.4,.7,1),mm.cab);ac.position.set(ax,h+.9,az);roof.add(ac);const f=new T.Mesh(new T.CylinderGeometry(.35,.35,.05,16),m.dark);f.position.set(ax,h+1.26,az);roof.add(f)}
  for(let i=0;i<3;i++){const cl=new T.Mesh(new T.BoxGeometry(1.4,.04,.4),mm.ceil);cl.position.set(lx+w*(i+.5)/3,h+.27,z);roof.add(cl)}roof.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});this.scene.add(roof);RM.roofs.push(roof);
  this.plate(sign,x-w/2+2.3,3.45,fz+.13,0,3.0);
  const lamp=new T.PointLight(0xfff1d6,0,14,1.6);lamp.position.set(x,h-.2,z);this.scene.add(lamp);RM.lamps.push(lamp);
  const pk=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({visible:false}));pk.position.set(x,h/2+.3,z);pk.userData.eq=B===DCS?'dcs':'sis';this.picks.push(pk);this.scene.add(pk);
  return {fz,bz,lx,rx}};
 // ================= DCS XONASI =================
 const D=building(DCS,mm.blue,'DCS XONASI');
 // video-devor
 const vw=screen(1024,320,(c,s)=>this.drawVideoWall(c,s));const vwm=new T.Mesh(new T.PlaneGeometry(7.4,2.3),new T.MeshBasicMaterial({map:vw.tex,toneMapped:false}));vwm.position.set(DCS.x,2.55,D.bz+.13);this.scene.add(vwm);RM.screens.push(vw);
 this.box(DCS.x,2.55,D.bz+.11,7.6,2.45,.04,mm.dark);
 // monitor kontentlari
 const mons={trend:screen(256,160,(c,s)=>this.drawTrend(c,s)),alarm:screen(256,160,(c,s)=>this.drawAlarms(c,s)),sis:screen(256,160,(c,s)=>this.drawSisMon(c,s)),mimic:vw};
 RM.screens.push(mons.trend,mons.alarm,mons.sis);
 const kinds=[['mimic','trend','alarm'],['trend','sis','mimic'],['alarm','mimic','sis']];
 for(let i=0;i<3;i++){const cx=DCS.x-4+i*4,dz=D.bz+1.3;this.box(cx,.72,dz,2.7,.06,.85,mm.deskTop);this.box(cx,.37,dz-.05,2.6,.7,.7,mm.desk);
  kinds[i].forEach((k,j)=>{const mx=cx+(j-1)*.86,ry=(1-j)*.18;const mon=new T.Mesh(new T.PlaneGeometry(.78,.48),new T.MeshBasicMaterial({map:mons[k].tex,toneMapped:false}));mon.position.set(mx,1.13,dz-.18);mon.rotation.y=ry;this.scene.add(mon);this.box(mx,1.13,dz-.205,.82,.52,.03,mm.dark,ry);this.box(mx,.85,dz-.22,.05,.26,.05,mm.dark)});
  this.box(cx,.76,dz+.15,.5,.02,.18,mm.dark);chair(cx,dz+.85,0);person(cx,dz+.75,0,{sit:true,arms:'desk',helmet:mm.dark,color:i===1?mm.green:mm.overall})}
 person(DCS.x+5.2,DCS.z+1.6,-PI/2,{vest:true,helmet:mm.helmetW});// smena boshlig'i
 this.box(DCS.x-5.6,1.2,D.bz+.45,.9,1.8,.5,mm.cab);this.box(DCS.x-5.6,1.4,D.bz+.71,.7,.9,.02,mm.cabDark);// printer/server
 // ================= SIS XONASI =================
 const Q=building(SISB,mm.red,'SIS XONASI');
 const cabs=[['TMR A','tmr',0],['TMR B','tmr',1],['TMR C','tmr',2],['I/O · kanallar','io',0],['XV rele / solenoid','xv',0]];
 cabs.forEach(([name,kind,idx],i)=>{const cx=SISB.x-3.2+i*1.6,cz=Q.bz+.55;this.box(cx,1.35,cz,1.2,2.1,.7,mm.cab);this.box(cx,2.47,cz,1.24,.14,.74,mm.cabDark);
  const sc=screen(128,224,(c,s)=>this.drawCabinet(c,s,kind,idx,name));const pm=new T.Mesh(new T.PlaneGeometry(1.0,1.75),new T.MeshBasicMaterial({map:sc.tex,toneMapped:false}));pm.position.set(cx,1.38,cz+.36);this.scene.add(pm);RM.screens.push(sc)});
 // ESD paneli (chap devorda)
 const ex=Q.lx+.22,ez=SISB.z+.6;this.box(ex,1.45,ez,.12,1.2,1.5,mm.cab);this.box(ex+.07,1.95,ez,.02,.16,1.3,mm.red);
 const btnMat=new T.MeshStandardMaterial({color:0x8a1010,emissive:0x000000,roughness:.35});const btn=new T.Mesh(new T.SphereGeometry(.16,16,10,0,PI*2,0,PI/2),btnMat);btn.rotation.z=-PI/2;btn.position.set(ex+.08,1.4,ez-.35);this.scene.add(btn);
 this.cylAB([ex+.06,1.4,ez-.35],[ex+.16,1.4,ez-.35],.2,mm.yellow,18);RM.esdBtn=btnMat;
 RM.sifLamps=S.SIF.filter(f=>!f.manual).map((f,i)=>{const mt=new T.MeshStandardMaterial({color:0x2a3a2a,emissive:0x000000});const l=new T.Mesh(new T.SphereGeometry(.05,10,8),mt);l.position.set(ex+.08,1.75-i*.14,ez+.25);this.scene.add(l);return {f,mt}});
 const rst=new T.Mesh(new T.CylinderGeometry(.06,.06,.06,14),new T.MeshStandardMaterial({color:0x2a64c8}));rst.rotation.z=PI/2;rst.position.set(ex+.09,1.05,ez-.35);this.scene.add(rst);
 person(SISB.x+2.6,SISB.z+.3,PI*.85,{vest:true,helmet:mm.helmetY});
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
 const box=(x,y,w,h,name,lev,col)=>{c.strokeStyle='#5b7a92';c.lineWidth=2;c.strokeRect(x,y,w,h);if(lev!=null){c.fillStyle=col;c.fillRect(x+2,y+h-2-(h-4)*lev/100,w-4,(h-4)*lev/100)}c.fillStyle=C.ink;c.font='600 14px Segoe UI';c.fillText(tx(name),x,y-6)};
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
P.drawCabinet=function(c,s,kind,idx,name){const W=128,H=224,z=s.sis||{trip:[],bypass:[],xv:{}},sis=window.AmineApp?.model?.sis;c.fillStyle='#1d2329';c.fillRect(0,0,W,H);c.fillStyle='#dfe6eb';c.font='600 11px Segoe UI';c.fillText(tx(name),6,14);
 const led=(x,y,col,on=true)=>{c.fillStyle=on?col:'#2b3238';c.beginPath();c.arc(x,y,4.5,0,PI*2);c.fill()};
 if(kind==='tmr'){for(let r=0;r<4;r++){c.fillStyle='#2c343b';c.fillRect(8,24+r*48,112,40);c.fillStyle='#9fb0bc';c.font='9px Consolas';c.fillText(['CPU','DI','AI','DO'][r]+' '+'ABC'[idx],12,36+r*48);for(let k=0;k<8;k++)led(16+k*13,54+r*48,k%3===0?'#3fb6ff':'#2ecc71',(Math.floor(this.animTime*2)+k+r+idx)%5!==0||r===0)}
  S.SIF.filter(f=>!f.manual).forEach((f,i)=>led(16+i*20,H-12,(z.trip||[]).includes(f.id)?'#ff4040':(z.bypass||[]).includes(f.id)?'#f2b233':'#2ecc71'))}
 else if(kind==='io'){let y=30;for(const [id,d] of Object.entries(S.SENSORS))d.ch.forEach(ch=>{const k=id+ch,f=sis?.chFail?.[k];led(14,y,f?'#f2b233':'#2ecc71');c.fillStyle='#cdd8df';c.font='9.5px Consolas';c.fillText(tx(k),24,y+3);y+=22})}
 else{let y=30;for(const k of Object.keys(S.XV)){const v=(z.xv||{})[k]??100;led(14,y,v<=0?'#ff4040':v<100?'#f2b233':'#2ecc71');c.fillStyle='#cdd8df';c.font='9.5px Consolas';c.fillText(tx(k)+' '+(v<=0?'CLOSE':v>=100?'OPEN':v.toFixed(0)+'%'),24,y+3);y+=24}}};
// ---- dinamik yangilanish ----
const _bb=P.buildBackground,_render=P.render,_cut=P.setCut,_look=P.setLook,_paint=P.paintLabel,_cam=P.setCamera;
P.buildBackground=function(){_bb.call(this);try{this.buildRooms()}catch(e){console.error('3D xonalar:',e)}};
P.setCut=function(on){_cut.call(this,on);for(const r of this.rooms?.roofs||[])r.visible=!on};
P.setLook=function(k){_look.call(this,k);for(const l of this.rooms?.lamps||[])l.intensity=k==='dusk'?18:4};
const ROOMCAM={dcsroom:[[-14.5,8.6,42],[-21,1,31.2]],sisroom:[[-1,8.2,40.5],[-6.8,1,31.2]]};
P.setCamera=function(id,smooth=true){if(ROOMCAM[id]&&this.camera){this.viewId=id;const v=ROOMCAM[id];if(this.rooms)for(const r of this.rooms.roofs)r.visible=false;if(smooth)this.cameraMove={p0:this.camera.position.clone(),t0:this.controls.target.clone(),p1:new V3(...v[0]),t1:new V3(...v[1]),u:0};else{this.camera.position.set(...v[0]);this.controls.target.set(...v[1])}this.applyRange?.();return}
 _cam.call(this,id,smooth);if(this.rooms&&!this.cut)for(const r of this.rooms.roofs)r.visible=true};
P.paintLabel=function(o,value){if(o.key==='room-dcs'||o.key==='room-sis'){const s=this.rooms?.last;if(s){const z=s.sis||{};value=o.key==='room-dcs'?`${tx('Operatorlar')}: 3 · ${tx('alarmlar')}: ${(s.alarms||[]).length}`:(z.esd?'ESD-1':(z.trip||[]).length?'TRIP '+z.trip.join(', '):tx('SIS normal'))}}return _paint.call(this,o,value)};
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
