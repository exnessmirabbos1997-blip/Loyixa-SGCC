(()=>{'use strict';
// ===== 3D: Sho'rtan gaz-kimyo majmuasi miqyosidagi sxematik sahna =====
// DA-1701 amin bloki markazda batafsil; atrofida majmuaning asosiy qurilmalari soddalashtirilgan (LOD) ko'rinishda:
// gaz qabul qilish (slag-kecher), amin regeneratsiyasi, oltingugurt olish, gazni quritish, kriogen ajratish, etilen (piroliz),
// polietilen, rezervuar parki, energetika va sovitish minoralari, mash'allar, estakadalar, yo'llar va temir yo'l.
// Joylashuv SXEMATIK — haqiqiy bosh rejadan olinmagan; o'lchamlar taxminiy (metr).
const PS=window.__PS;if(!PS||!PS.PlantScene)return;const {T,rnd}=PS,PI=Math.PI,V3=T.Vector3,P=PS.PlantScene.prototype;
const M=(o)=>new T.MeshStandardMaterial(o);
const facadeTex=(seed,cols,rows,lit)=>PS.canvasTex(256,256,(x,W,H)=>{const R=rnd(seed);x.fillStyle='#b9bec2';x.fillRect(0,0,W,H);for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const on=lit&&R()<.55;x.fillStyle=on?'#ffe7a8':'#3d4c58';x.fillRect(8+i*(W-16)/cols,10+j*(H-20)/rows,(W-16)/cols-7,(H-20)/rows-9)}x.fillStyle='#8f969b';x.fillRect(0,H-12,W,12)},[1,1]);
P.buildBackground=function(){const m=this.m,R=rnd(31),S=this;
 const mc={
  white:M({color:0xe8ebea,metalness:.18,roughness:.5,envMapIntensity:.9}),alu:M({color:0xc9cfd4,metalness:.75,roughness:.32,envMapIntensity:1}),
  steelD:M({color:0x5d6b78,metalness:.6,roughness:.5}),rust:M({color:0x7b4a35,metalness:.3,roughness:.75}),brick:M({color:0x8e8a84,metalness:.1,roughness:.85}),
  red:M({color:0xc23b32,metalness:.2,roughness:.5}),sand:M({map:PS.noiseTex(256,256,'#a88f6c',40,17,[260,260]),roughness:1,metalness:0}),
  asphalt:M({map:PS.noiseTex(128,128,'#34363a',22,23,[1,60]),roughness:.95,metalness:0}),rail:M({color:0x6d5a48,roughness:.9}),
  glow:new T.MeshBasicMaterial({color:0xffcf7a}),avia:new T.MeshBasicMaterial({color:0xff2a2a}),
  fac:M({map:facadeTex(3,8,5,false),roughness:.8}),facL:M({map:facadeTex(3,8,5,true),roughness:.8,emissive:0xffffff,emissiveMap:facadeTex(3,8,5,true),emissiveIntensity:0}),
  green:M({color:0x4d7f45,roughness:.9})};
 this.mc=mc;this.areaObjs=[];this.extraFlares=[];this.plumes=[];
 // ---- zamin: cho'l (qum), majmua maydoni, yo'llar ----
 const sand=new T.Mesh(new T.PlaneGeometry(3600,3600),mc.sand);sand.rotation.x=-PI/2;sand.position.y=-.12;sand.receiveShadow=true;this.scene.add(sand);
 const road=(x0,z0,x1,z1,w=7)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0);this.box((x0+x1)/2,-.05,(z0+z1)/2,w,.06,L,mc.asphalt,a)};
 for(const z of [46,-62,-170,120,240])road(-330,z,380,z);for(const x of [-250,-120,-28,95,225,340])road(x,-320,x,260);
 // temir yo'l (shimolda)
 for(const dz of [-1.2,1.2])this.box(25,.05,268+dz,720,.12,.18,mc.steelD);for(let x=-330;x<380;x+=2.4)this.box(x,-.02,268,.3,.08,3.4,mc.rail);
 const pad=(x,z,w,d)=>this.box(x,-.04,z,w,.1,d,m.conc);
 const area=(text,sub,x,y,z,w=46)=>{const o=this.label(text,[x,y,z],'area',w);o.sub=sub;o.sp.material.sizeAttenuation=false;o.sp.scale.set(.17,.17*116/512,1);this.areaObjs.push(o)};
 const lampsOn=(x,z,h,n)=>{for(let i=0;i<n;i++)this.box(x+(R()-.5)*1.2,2+R()*(h-3),z+(R()-.5)*1.2,.5,.35,.5,m.lamp)};
 const avia=(x,y,z)=>this.sphere(x,y,z,.7,mc.avia,8);
 const column=(x,z,r,h,mat=mc.white,platforms=true)=>{this.cylY(x,z,0,h,r,mat,18);this.sphere(x,h,z,r*.98,mat,14);this.cylY(x,z,0,2.2,r*1.15,m.conc,18);
  if(platforms)for(let y=8;y<h-2;y+=7.5){this.torus(x,y,z,r+.7,.07,m.yellow,'y',PI*2,24);this.disc(x,y-.12,z,r+.75,.12,m.grating,'y',20)}
  this.cylAB([x+r+.5,1,z],[x+r+.5,h,z],.09,m.yellow,4);avia(x,h+r+.5,z);lampsOn(x+r,z,h,4)};
 const vessel=(x,y,z,r,L,mat=mc.white,axis='x')=>{const a=axis==='x'?[x-L/2,y,z]:[x,y,z-L/2],b=axis==='x'?[x+L/2,y,z]:[x,y,z+L/2];this.cylAB(a,b,r,mat,16);this.sphere(...a,r,mat,12);this.sphere(...b,r,mat,12);for(const t of [-.3,.3]){const p=axis==='x'?[x+t*L,y/2,z]:[x,y/2,z+t*L];this.box(p[0],p[1],p[2],axis==='x'?.8:r*1.6,y,axis==='x'?r*1.6:.8,m.conc)}};
 const tank=(x,z,r,h,mat=mc.white)=>{this.cylY(x,z,0,h,r,mat,40);this.disc(x,h+.05,z,r*1.01,.25,mc.alu,'y',40);this.torus(x,h-.3,z,r+.15,.08,m.yellow,'y',PI*2,40);for(let a=0;a<PI*2;a+=PI/9)this.cylAB([x+Math.cos(a)*(r+.05),0,z+Math.sin(a)*(r+.05)],[x+Math.cos(a)*(r+.05),h,z+Math.sin(a)*(r+.05)],.05,mc.alu,4);this.box(x+r+.6,h/2,z,.9,h,.9,m.yellow)};
 const bund=(x,z,w,d)=>{for(const [dx,dz,bw,bd] of [[0,-d/2,w,.8],[0,d/2,w,.8],[-w/2,0,.8,d],[w/2,0,.8,d]])this.box(x+dx,.6,z+dz,bw,1.2,bd,m.conc)};
 const stack=(x,z,r,h,stripes=true)=>{const n=stripes?7:1;for(let i=0;i<n;i++){const y0=h*(i/n),y1=h*((i+1)/n);this.cylY(x,z,y0,y1,r*(1-.25*i/n),stripes&&i%2?mc.red:mc.white,16,r*(1-.25*(i+1)/n))}avia(x,h+.6,z);avia(x,h*.55,z)};
 const frame=(x,z,w,d,h,levels,mat=m.frame)=>{for(const ix of [0,1,2,3])for(const iz of [0,1]){this.box(x-w/2+ix*w/3,h/2,z-d/2+iz*d,.5,h,.5,mat)}for(let l=1;l<=levels;l++){const y=h*l/levels;this.box(x,y,z-d/2,w,.4,.4,mat);this.box(x,y,z+d/2,w,.4,.4,mat);for(const ix of [0,1,2,3])this.box(x-w/2+ix*w/3,y,z,.4,.4,d,mat);this.box(x,y-.1,z,w,.12,d,m.grating)}};
 const building=(x,z,w,d,h,lit=true)=>{this.box(x,h/2,z,w,h,d,lit?mc.facL:mc.fac);this.box(x,h+.3,z,w+.4,.6,d+.4,mc.steelD)};
 const rack=(x0,z0,x1,z1,h=7,levels=2,pipes=6)=>{const L=Math.hypot(x1-x0,z1-z0),ux=(x1-x0)/L,uz=(z1-z0)/L,nx=-uz,nz=ux,w=6;
  for(let s=0;s<=L;s+=8){const cx=x0+ux*s,cz=z0+uz*s;for(const sd of [-1,1])this.cylAB([cx+nx*w/2*sd,0,cz+nz*w/2*sd],[cx+nx*w/2*sd,h+levels,cz+nz*w/2*sd],.22,m.frame,4);for(let l=0;l<levels;l++)this.cylAB([cx-nx*w/2,h+l*1.6,cz-nz*w/2],[cx+nx*w/2,h+l*1.6,cz+nz*w/2],.18,m.frame,4)}
  for(let l=0;l<levels;l++)for(let i=0;i<pipes;i++){const o=-w/2+.6+i*(w-1.2)/(pipes-1),r=.18+((i*7+l*3)%4)*.07;this.cylAB([x0+nx*o,h+l*1.6+.4,z0+nz*o],[x1+nx*o,h+l*1.6+.4,z1+nz*o],r,i%3===0?mc.white:m.pipe,8)}};
 const flare=(x,z,h)=>{this.cylY(x,z,0,h,.9,mc.steelD,10);for(let y=10;y<h;y+=14)for(const a of [0,2.1,4.2])this.cylAB([x,y,z],[x+Math.cos(a)*18,0,z+Math.sin(a)*18],.06,mc.steelD,3);this.cylY(x,z,h,h+2.5,1.2,mc.rust,10);avia(x,h*.5,z);
  const sp=new T.Sprite(new T.SpriteMaterial({map:this.glowT||(this.glowT=PS.glowTex()),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false,color:0xff8a3a}));sp.position.set(x,h+9,z);sp.scale.set(14,22,1);this.scene.add(sp);this.extraFlares.push(sp)};
 const plume=(x,y,z,s)=>{const sp=new T.Sprite(new T.SpriteMaterial({map:this.blobT||(this.blobT=PS.canvasTex(64,64,c=>{const g=c.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64)})),transparent:true,depthWrite:false,opacity:.5}));sp.position.set(x,y,z);sp.scale.set(s,s*.8,1);this.scene.add(sp);this.plumes.push({sp,y0:y,s,ph:R()*6})};
 // ---- chiroq ustunlari (amin bloki atrofida) ----
 for(const [x,z,d] of [[-26,9,1],[-26,-13,1],[27,14,-1],[27,-16,-1],[-5,18,1],[19,-13.5,-1],[-34,-2,1]])this.pole(x,z,d);
 // ---- 1. Amin bloki: qo'shni poezdlar B/C va regeneratsiya ----
 // SIS trip mayoqchasi (DA-1701 tepasida)
 this.beacon=new T.Sprite(new T.SpriteMaterial({map:this.glowT||(this.glowT=PS.glowTex()),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false,color:0xff2020}));this.beacon.position.set(5,19.2,0);this.beacon.scale.set(5,5,1);this.beacon.visible=false;this.scene.add(this.beacon);this.box(5,18.4,0,.5,.6,.5,mc.avia);
 area('Amin bilan tozalash','DA-1701 batafsil · B, C poezdlari · regenerator',0,36,-6,48);
 for(const [x,z,tag] of [[-62,-4,'B'],[62,-4,'C']]){pad(x,z,40,30);column(x+6,z,1.8,24);vessel(x-6,3,z+6,1.3,7,mc.white,'z');for(let i=0;i<3;i++)vessel(x-10,1.6+i*2.4,z-6,.9,10,m.steel);}
 pad(36,-34,40,26);column(30,-34,2.2,32);column(44,-38,1.4,14);vessel(40,2.8,-26,1.6,9);tank(52,-26,5,9);
 // ---- 2. Gaz qabul qilish: slag-kecher ----
 pad(-190,10,110,46);for(let i=0;i<8;i++){const z=-8+i*5.2;this.cylAB([-240,1.4,z],[-160,1.4+.8,z],.9,mc.white,12);for(let x=-235;x<-160;x+=10)this.box(x,.6,z,.8,1.2,1.4,m.conc)}this.cylAB([-160,2.4,-10],[-160,2.4,30],1.3,mc.white,12);vessel(-145,3,10,2,10,mc.white,'z');
 area('Gaz qabul qilish','Slag-kecher · kirish separatorlari',-190,22,10,52);
 // ---- 3. Oltingugurt olish (Klaus) ----
 pad(-95,-115,70,46);vessel(-105,3.5,-108,3,16);for(let i=0;i<3;i++)vessel(-90+i*9,3,-124,2.2,7,mc.steelD,'z');building(-118,-128,14,10,7,false);stack(-70,-102,1.6,72);this.box(-105,1.5,-95,12,3,6,mc.rust);
 area('Oltingugurt olish (Klaus)','Kislotali gaz → S, dum gazi yoqish',-95,32,-115,50);
 // ---- 4. Gazni quritish (molekulyar elak) ----
 pad(112,-14,56,40);for(let i=0;i<4;i++){const x=96+i*10;this.cylY(x,-20,2,20,2.4,mc.white,20);this.sphere(x,20,-20,2.35,mc.white,12);this.sphere(x,2,-20,2.35,mc.white,12);this.cylY(x,-20,0,2,1.5,m.conc,12)}frame(120,-2,22,8,14,3);this.box(132,4,-2,6,8,5,mc.rust);
 area('Gazni quritish','Molekulyar elak adsorberlari',112,30,-14,44);
 // ---- 5. Kriogen ajratish ----
 pad(196,-36,70,52);this.box(182,24,-40,13,48,13,mc.alu);for(let y=6;y<48;y+=6)this.box(182,y,-33.4,13.2,.25,.2,mc.steelD);column(200,-46,2.4,58);column(212,-30,2,44);column(222,-48,1.6,36);for(let i=0;i<3;i++)this.box(196+i*9,3,-18,7,6,5,mc.steelD);
 area('Kriogen ajratish','Sovuq blok · demetanizator · deetanizator',196,72,-36,54);
 // ---- 6. Etilen ishlab chiqarish (piroliz) ----
 pad(285,72,110,80);for(let i=0;i<8;i++){const x=245+i*11;this.box(x,13,52,8,26,13,mc.brick);this.box(x,27,52,9,2,14,mc.steelD);this.cylY(x,52,28,52,.9,mc.steelD,10);avia(x,52.6,52);for(let y=4;y<24;y+=5)this.box(x+4.05,y,52,.1,1.2,9,mc.glow)}
 column(250,94,2.6,40);column(268,98,1.5,82);column(282,98,1.7,72);column(300,96,2.2,48);frame(318,86,24,14,24,4);building(330,110,22,14,12);
 area('Etilen ishlab chiqarish','Piroliz pechlari · ajratish kolonnalari',285,90,72,62);
 // ---- 7. Polietilen ----
 pad(190,165,110,70);frame(160,160,30,22,46,6);this.box(160,23,160,26,46,18,mc.fac);this.cylY(160,160,46,52,3,mc.alu,16);for(let i=0;i<12;i++){const x=185+(i%6)*8.5,z=150+Math.floor(i/6)*10;this.cylY(x,z,6,34,3.6,mc.alu,20);this.cylY(x,z,0,6,3.6,mc.steelD,20,1);this.sphere(x,34,z,3.55,mc.alu,12)}building(232,175,26,30,14);building(205,192,32,12,9,false);
 area('Polietilen','Reaktor bloki · silos · qadoqlash',190,64,165,50);
 // ---- 8. Rezervuar parki va sharsimon idishlar ----
 pad(-205,-160,140,90);bund(-235,-160,70,80);for(const [x,z] of [[-252,-178],[-252,-142],[-218,-178],[-218,-142]])tank(x,z,13,16);for(const [x,z] of [[-168,-185],[-168,-155],[-148,-185],[-148,-155]]){this.sphere(x,11,z,9,mc.white,20);for(let a=0;a<PI*2;a+=PI/4)this.cylAB([x+Math.cos(a)*7.5,0,z+Math.sin(a)*7.5],[x+Math.cos(a)*7.5,10,z+Math.sin(a)*7.5],.35,mc.steelD,6)}
 area('Rezervuar parki','Kondensat · SUG sharsimon idishlari',-205,36,-160,52);
 // ---- 9. Energetika va sovitish ----
 pad(80,-150,90,50);for(let i=0;i<6;i++){const x=48+i*11;this.box(x,7,-150,10.5,14,14,m.conc);this.cylY(x,-150,14,17,4.2,mc.steelD,18);plume(x,24,-150,16)}
 building(150,-152,40,26,18);for(let i=0;i<3;i++)stack(138+i*12,-166,2.2,65,i===1);
 area('Energetika va sovitish','Sovitish minoralari · bug‘ qozonxonasi',100,40,-150,54);
 // ---- 10. Mash'allar ----
 for(const [x,z,h] of [[-300,-280,95],[-282,-292,80],[-318,-266,70]])flare(x,z,h);
 area('Mash’al tizimi','Yuqori / past bosim, nam mash’al',-300,112,-280,46);
 // ---- 11. Boshqaruv binosi, ma'muriy bino ----
 pad(-80,96,70,44);building(-92,92,34,20,10);building(-58,104,18,14,16);for(let i=0;i<14;i++)this.sphere(-110+i*5,1.6,118,1.6,mc.green,8);
 area('Markaziy boshqaruv xonasi','DCS / SIS operatorlari',-80,26,96,46);
 // ---- 12. Estakadalar ----
 rack(-150,-62,330,-62,8,2,7);rack(-42,-62,-42,40,7,1,5);rack(95,-62,95,150,8,2,6);rack(225,-62,225,150,8,2,6);rack(-150,-62,-150,30,7,1,5);rack(-150,-62,-210,-120,7,1,4);
 // ---- uzoq gorizont: qo'shni obyektlar va tepaliklar ----
 for(let i=0;i<46;i++){const a=R()*PI*2,r=760+R()*700,g=new T.SphereGeometry(1,18,8,0,PI*2,0,PI/2);this.put(g,mc.sand,Math.cos(a)*r,-.5,Math.sin(a)*r,0,a,0,120+R()*260,2+R()*7,60+R()*120)}
 // tungi uzoq chiroqlar
 for(let i=0;i<60;i++){const x=-320+R()*700,z=-300+R()*560;if(Math.abs(x)<40&&Math.abs(z)<30)continue;this.box(x,2+R()*14,z,.5,.4,.5,m.lamp)}
};
// ---- kamera: majmua ko'rinishi, tuman masofasi, hududiy yozuvlar ----
const _setCamera=P.setCamera,_setLook=P.setLook,_render=P.render,_init=P.init;
const VIEWS={complex:[[-330,230,360],[40,0,-30]],ethylene:[[380,90,-40],[270,30,70]],tank:[[-120,70,-60],[-205,8,-160]]};
P.applyRange=function(){if(!this.scene||!this.scene.fog)return;const far=['complex','ethylene','tank','top'].includes(this.viewId);this.scene.fog.near=far?420:this.fogBase?.[0]??this.scene.fog.near;this.scene.fog.far=far?2200:this.fogBase?.[1]??this.scene.fog.far;this.camera.far=far?5000:600;this.camera.updateProjectionMatrix();this.controls.maxDistance=far?1400:120};
P.setLook=function(k){_setLook.call(this,k);if(this.scene?.fog)this.fogBase=[this.scene.fog.near,this.scene.fog.far];if(this.mc){const n=k==='dusk';this.mc.facL.emissiveIntensity=n?.9:0;this.mc.glow.color.setHex(n?0xffb050:0xc8a070);for(const p of this.plumes||[])p.sp.material.opacity=n?.18:.5}this.applyRange()};
P.setCamera=function(id,smooth=true){if(VIEWS[id]){if(!this.camera||!this.controls)return;this.viewId=id;const v=VIEWS[id];if(smooth)this.cameraMove={p0:this.camera.position.clone(),t0:this.controls.target.clone(),p1:new V3(...v[0]),t1:new V3(...v[1]),u:0};else{this.camera.position.set(...v[0]);this.controls.target.set(...v[1]);this.controls.update()}}
 else{if(id==='top'&&this.camera){this.viewId='top';const p=[[0,520,.1],[20,0,-20]];if(smooth)this.cameraMove={p0:this.camera.position.clone(),t0:this.controls.target.clone(),p1:new V3(...p[0]),t1:new V3(...p[1]),u:0};else{this.camera.position.set(...p[0]);this.controls.target.set(...p[1])}}else _setCamera.call(this,id,smooth)}
 this.applyRange()};
P.render=function(s,dt){if(this.ready){const t=this.animTime||0;for(const f of this.extraFlares||[]){const k=1+Math.sin(t*9+f.position.x)*.07+Math.sin(t*23)*.05;f.scale.set(14*k,22*(2-k),1)}
  for(const p of this.plumes||[]){const u=((t*.08+p.ph)%1);p.sp.position.y=p.y0+u*18;p.sp.scale.set(p.s*(1+u),p.s*(1+u)*.8,1);p.sp.material.opacity=(this.look==='dusk'?.18:.5)*(1-u)}
  const far=['complex','ethylene','tank','top'].includes(this.viewId);for(const o of this.areaObjs||[])o.sp.userData.area=true;this.__areaVisible=far}
 if(this.beacon){const tr=!!(s&&s.sis&&s.sis.trip&&s.sis.trip.length);this.beacon.visible=tr&&Math.sin((this.animTime||0)*7)>-.2}
 if(this.sky&&this.camera){this.sky.position.copy(this.camera.position);this.stars.position.copy(this.camera.position)}
 _render.call(this,s,dt)};
// hududiy yozuvlar faqat majmua ko'rinishlarida; qiymat o'rnida izoh
const _paint=P.paintLabel;P.paintLabel=function(o,value){if(o.key==='area'){o.sp.visible=this.labelsOn&&!!this.__areaVisible;return _paint.call(this,o,o.sub||'')}return _paint.call(this,o,value)};
window.AmineComplex3D=true;
})();
