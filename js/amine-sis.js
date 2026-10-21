(()=>{'use strict';
// ===== SIS / ESD: DA-1701 va FA-1702 uchun xavfsizlik funksiyalari (SIF), sabab–oqibat matritsasi, ovoz berish, latch, bypass, RESET =====
// Asos: P&ID E 10162-10705B-11 (LC17003 — ZSL/ZSC "CLOSE", LG 17054 A/B, FA-1702 — LC17001 ZSL "CLOSE", PSV-1702A…E 4370 kPag, 16-izoh: kalitli blokirovka).
// Mustaqil SIS uzatgichlari va XV (fail-close) klapanlari chizmada to'liq ko'rsatilmagan — ular o'quv maqsadida qabul qilingan FARAZ (teglar "faraz" deb belgilangan).
// SIS DCS dan mustaqil: LC17003 signali yo'qolsa ham (sensor/comm) SIS o'z uzatgichlari bilan himoyani bajaradi.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Sensorlar: o'lchanadigan holat maydoni, kanallar soni, har bir kanalning doimiy siljishi
const SENSORS={
  LT17054:{title:'DA-1701 sathi (SIS)',field:'L',unit:'%',ch:['A','B','C'],bias:[.3,-.2,.1]},
  LT17005:{title:'FA-1702 sathi (SIS)',field:'K',unit:'%',ch:['A','B'],bias:[.2,-.3]},
  PT17012:{title:'Kirish gazi bosimi (SIS)',field:'press',unit:'kPa',ch:['A','B','C'],bias:[4,-6,2]}
};
// Yakuniy elementlar (fail-close XV, buyruq yo'qolsa yopiladi). gate — model klapani(lari)
const XV={
  XV17001:{title:'Gaz kirishi (EA-1706 A/B/C oldidan)',gate:['a','b','c'],stroke:8},
  XV17002:{title:'To‘yinmagan amin kirishi (FCI17002 dan keyin)',gate:['lean'],stroke:5},
  XV17003:{title:'To‘yingan amin chiqishi (LC17003 bilan ketma-ket)',gate:['rich'],stroke:4},
  XV17004:{title:'FA-1702 kondensat drenaji',gate:['drain'],stroke:4},
  XV17005:{title:'Tozalangan gaz chiqishi (FCI17001 dan keyin)',gate:['out'],stroke:8},
  XV17006:{title:'Yuvish kondensati kirishi',gate:['wash'],stroke:5}
};
const ESD1=['XV17001','XV17002','XV17003','XV17004','XV17005','XV17006'];
// SIF ro'yxati: sabab → mantiq → oqibat
const SIF=[
  {id:'SIF-01',tag:'LALL-17054',sensor:'LT17054',dir:'low',set:'lowLow',vote:'2oo3',delay:2,xv:['XV17003'],sil:2,
   cause:'DA-1701 sathi juda past',effect:'XV17003 yopiladi — gazning FA-1705 ga o‘tib ketishi (blow-by) oldini olinadi'},
  {id:'SIF-02',tag:'LAHH-17054',sensor:'LT17054',dir:'high',set:'highHigh',vote:'2oo3',delay:2,xv:['XV17002','XV17006'],sil:1,
   cause:'DA-1701 sathi juda yuqori',effect:'XV17002 va XV17006 yopiladi — amin gaz bilan EA-1821 ga chiqib ketishi oldini olinadi'},
  {id:'SIF-03',tag:'LALL-17005',sensor:'LT17005',dir:'low',set:'lowLow',vote:'1oo2',delay:2,xv:['XV17004'],sil:1,
   cause:'FA-1702 sathi juda past',effect:'XV17004 yopiladi — gazning FA-6908 / nam mash’alaga o‘tishi oldini olinadi'},
  {id:'SIF-04',tag:'LAHH-17005',sensor:'LT17005',dir:'high',set:'highHigh',vote:'1oo2',delay:3,xv:ESD1,sil:1,esd:true,
   cause:'FA-1702 sathi juda yuqori',effect:'ESD-1: qurilma izolyatsiyasi — suyuqlik absorberga tushishi oldini olinadi'},
  {id:'SIF-05',tag:'PAHH-17012',sensor:'PT17012',dir:'high',setVal:4200,vote:'2oo3',delay:1,xv:ESD1,sil:2,esd:true,
   cause:'Kirish gazi bosimi juda yuqori (PSV 4370 kPag dan oldin)',effect:'ESD-1: kirish va chiqish XV yopiladi'},
  {id:'ESD-HS',tag:'HS-17000',manual:true,xv:ESD1,sil:0,esd:true,
   cause:'Operator ESD tugmasi (boshqaruv xonasi)',effect:'ESD-1: barcha XV yopiladi'}
];
// IEC 61508 soddalashtirilgan PFDavg: λDU (1/soat), sinov oralig'i TI (soat)
const REL={sensor:{lambdaDU:3e-7},logic:{pfd:5e-5},xv:{lambdaDU:2e-6},TI:8760,beta:.05};
function pfdVote(vote,l,TI,beta){const x=l*TI;if(vote==='1oo1')return x/2;if(vote==='1oo2')return (1-beta)*x*x/3+beta*x/2;if(vote==='2oo3')return (1-beta)*x*x+beta*x/2;if(vote==='2oo2')return x;return x/2}
function silOf(p){return p<1e-4?4:p<1e-3?3:p<1e-2?2:p<1e-1?1:0}

class AmineSIS{
  constructor(){this.reset()}
  reset(){this.xv=Object.fromEntries(Object.keys(XV).map(k=>[k,100]));this.cmd=Object.fromEntries(Object.keys(XV).map(k=>[k,true]));
    this.state=Object.fromEntries(SIF.map(f=>[f.id,{demand:false,timer:0,tripped:false,t:null,bypass:false,bypassT:0,first:false,closedAt:null}]));
    this.chFail={};this.esdPB=false;this.firstOut=null;this.blowby=0;this.blowbyDrain=0;this.carry=0;this.flags={blowby:false,drain:false,carry:false}}
  // kanal qiymati: null — signal yo'q (BAD)
  channels(s,id){const d=SENSORS[id],v=s[d.field];return d.ch.map((c,i)=>{const k=id+c,f=this.chFail[k];if(f==='bad')return null;if(f==='low')return d.field==='press'?0:0;if(f==='high')return d.field==='press'?6000:100;if(f==='stuck'&&this['stuck'+k]!=null)return this['stuck'+k];return v+d.bias[i]})}
  setChannel(k,mode,s){if(mode==='stuck'){const id=Object.keys(SENSORS).find(x=>k.startsWith(x)),i=SENSORS[id].ch.indexOf(k.slice(id.length));this['stuck'+k]=this.channels(s,id)[i]??0}if(mode==='ok')delete this.chFail[k];else this.chFail[k]=mode}
  // ovoz berish: BAD kanal fail-safe — faol deb olinadi (degradatsiyali rejim)
  vote(f,s,settings){if(f.manual)return{active:this.esdPB,vals:[],ch:[]};const vals=this.channels(s,f.sensor),sp=f.setVal??settings[f.set];
    const ch=vals.map(v=>v===null||(f.dir==='high'?v>=sp:v<=sp)),n=ch.filter(Boolean).length,need=f.vote==='2oo3'?2:f.vote==='2oo2'?2:1;return{active:n>=need,vals,ch,sp,n}}
  step(m,dt){const s=m.s,st=this.state;let anyNew=false;
    for(const f of SIF){const x=st[f.id],v=this.vote(f,s,m.settings);x.demand=v.active;x.vals=v.vals;x.ch=v.ch;x.sp=v.sp;
      if(x.bypass){x.bypassT+=dt;x.timer=0;continue}
      x.timer=v.active?x.timer+dt:0;
      if(!x.tripped&&v.active&&x.timer>=(f.delay||0)-1e-9){x.tripped=true;x.t=s.t;x.closedAt=null;if(!this.firstOut){this.firstOut=f.id;x.first=true}anyNew=true;
        m.event('TRIP',f.id,`${f.id} (${f.tag}) ishga tushdi: ${f.cause} → ${f.effect}`)}}
    // XV buyruqlari: biror faol (tripped) SIF yopishni talab qilsa — yopiq (latch RESET gacha)
    for(const k in XV)this.cmd[k]=!SIF.some(f=>st[f.id].tripped&&f.xv.includes(k));
    for(const k in XV){const target=this.cmd[k]?100:0,rate=100/XV[k].stroke*dt;this.xv[k]=this.xv[k]<target?Math.min(target,this.xv[k]+rate):Math.max(target,this.xv[k]-rate)}
    for(const f of SIF){const x=st[f.id];if(x.tripped&&x.closedAt==null&&f.xv.every(k=>this.xv[k]<=0)){x.closedAt=s.t;m.event('INFO',f.id+'_CLOSED',`${f.id}: yakuniy elementlar yopildi (${(s.t-x.t).toFixed(1)} s)`)}}
    // xavfli oqibatlar (SIS yo'q / bypass bo'lsa ko'rinadi)
    const A=m.actual,openRich=A.rich>1&&this.xv.XV17003>1,openDrain=A.drain>1&&this.xv.XV17004>1;
    const bb=s.L<3.5&&openRich&&s.g>1,bd=s.K<3.5&&openDrain&&s.g>1,cr=s.L>=99.9&&s.lean>1;
    if(bb){this.blowby+=dt;if(!this.flags.blowby){this.flags.blowby=true;m.event('HH','BLOWBY','XAVF: DA-1701 bo‘shadi — yuqori bosimli gaz to‘yingan amin liniyasi orqali FA-1705 ga o‘tmoqda (blow-by)')}}else this.flags.blowby=false;
    if(bd){this.blowbyDrain+=dt;if(!this.flags.drain){this.flags.drain=true;m.event('HH','BLOWBY_K','XAVF: FA-1702 bo‘shadi — gaz drenaj orqali FA-6908 ga o‘tmoqda')}}else this.flags.drain=false;
    if(cr){this.carry+=dt;if(!this.flags.carry){this.flags.carry=true;m.event('HH','CARRYOVER','XAVF: DA-1701 to‘ldi — amin tozalangan gaz bilan EA-1821 ga chiqib ketmoqda')}}else this.flags.carry=false}
  // model klapanlari XV bilan ketma-ket: oqim uchun samarali ochilish
  gate(actual){const A={...actual};for(const [k,d] of Object.entries(XV))for(const g of d.gate)A[g]=A[g]*this.xv[k]/100;return A}
  esd(m){this.esdPB=true;m.event('TRIP','ESD-HS','Operator ESD-1 tugmasini bosdi')}
  setBypass(id,on,m){const x=this.state[id];if(!x)return false;if(SIF.find(f=>f.id===id).manual)return false;x.bypass=!!on;if(!on)x.bypassT=0;m.event(on?'WARN':'INFO','BYPASS_'+id,`${id} ${on?'BYPASS qilindi (texnik xizmat) — himoya o‘chirilgan!':'bypass olib tashlandi'}`);return true}
  // RESET: faqat sabab yo'qolgan SIF lar tiklanadi; ESD tugmasi ham qo'yib yuboriladi
  resetAll(m){this.esdPB=false;let ok=[],still=[];for(const f of SIF){const x=this.state[f.id];if(!x.tripped)continue;const v=this.vote(f,m.s,m.settings);if(v.active&&!x.bypass)still.push(f.id);else{x.tripped=false;x.first=false;x.timer=0;ok.push(f.id)}}
    if(!SIF.some(f=>this.state[f.id].tripped))this.firstOut=null;m.event(still.length?'WARN':'INFO','SIS_RESET',ok.length?`SIS RESET: ${ok.join(', ')} tiklandi`+(still.length?`; sabab hali bor: ${still.join(', ')}`:''):still.length?`RESET rad etildi: sabab hali bor (${still.join(', ')})`:'RESET: faol trip yo‘q');return{ok,still}}
  tripped(){return SIF.filter(f=>this.state[f.id].tripped).map(f=>f.id)}
  esdActive(){return SIF.some(f=>f.esd&&this.state[f.id].tripped)}
  // ixcham holat (tarix va arxiv uchun); to'liq holat — this.state
  snapshot(){const ids=k=>SIF.filter(f=>this.state[f.id][k]).map(f=>f.id),r=v=>Math.round(v*10)/10;return{xv:Object.fromEntries(Object.entries(this.xv).map(([k,v])=>[k,r(v)])),trip:ids('tripped'),demand:ids('demand'),bypass:ids('bypass'),first:this.firstOut,esd:this.esdActive(),blowby:r(this.blowby),carry:r(this.carry)}}
  static pfd(f){if(f.manual)return null;const TI=REL.TI,b=REL.beta,ps=pfdVote(f.vote,REL.sensor.lambdaDU,TI,b),pl=REL.logic.pfd,pf=f.xv.length?pfdVote('1oo1',REL.xv.lambdaDU,TI,b):0,p=ps+pl+pf;return{sensor:ps,logic:pl,final:pf,total:p,sil:silOf(p)}}
}
AmineSIS.SENSORS=SENSORS;AmineSIS.XV=XV;AmineSIS.SIF=SIF;AmineSIS.REL=REL;
window.AmineSIS=AmineSIS;
})();
