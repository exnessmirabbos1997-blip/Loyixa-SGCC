(()=>{'use strict';
// ===== DA-1701 kimyoviy tozalash modeli: CO₂ va H₂S ning aminga yutilishi, amin yuklanishi, issiqlik balansi, tozalangan gaz sifati =====
// Soddalashtirilgan o'quv modeli (rate-based emas): har bir komponent uchun samaradorlik E = 1 − exp(−NTU),
// NTU harorat, suyuqlik/gaz nisbati va amin yuklanishiga bog'liq; nominal nuqta DCS ekrani (GP1701, 09.10.2026 08:53) bo'yicha kalibrlangan:
//   gaz FC17001 = 380,7 ming nm³/soat, to'yinmagan amin FC17002 = 504,7 m³/soat, TI17007 = 30,9 °C, TI17005 = 56,5 °C, TI17006 = 60,6 °C, AI17001 ≈ 560.
// Barcha parametrlar taxminiy — real qiymatlar texnologik reglamentdan olinadi (Sozlamalar → Kimyoviy model).
const DEF={
  Qg:380.7,        // nominal gaz sarfi, ming nm³/soat (FC17001)
  QL:504.7,        // nominal to'yinmagan amin sarfi, m³/soat (FC17002)
  yCO2:3.0,        // xom gazda CO₂, mol %
  yH2S:0.10,       // xom gazda H₂S, mol %
  wt:45,           // MDEA (aktivatorli) massa ulushi, %
  MW:119.16,rho:1040,cpL:3.5,cpG:40,   // kg/kmol; kg/m³; kJ/(kg·K); kJ/(kmol·K)
  aLeanCO2:0.010,aLeanH2S:0.002,aMax:0.60,   // mol kislotali gaz / mol amin
  TL:54.7,app:1.8, // to'yinmagan amin harorati, °C; yuqori gaz harorati yondashuvi, K
  dHCO2:55,dHH2S:40,   // yutilish issiqligi, MJ/kmol
  NTUco2:3.98,NTUh2s:6.2,   // nominal o'tkazish birliklari soni (kalibrovka)
  co2H:1000,co2HH:2000,h2sH:4,h2sHH:7,   // tozalangan gaz sifati chegaralari, ppmv (taxminiy)
  aH:0.45,aHH:0.50,     // to'yingan amin yuklanishi chegaralari, mol/mol
  anaDead:60,anaTau:30  // AI17001 analizatori: kechikish va inersiya, s
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lag=(x,t,dt,tau)=>x+(t-x)*(1-Math.exp(-dt/tau));
const fTco2=T=>Math.exp(.025*(T-50))/(1+Math.exp((T-70)/4)),fTh2s=T=>1/(1+Math.exp((T-75)/5));
const fLoad=(a,p)=>Math.pow(Math.max(0,1-a/p.aMax),1.5);
class AmineChem{
  constructor(par){this.p={...DEF,...(par||{})};this.calibrate();this.reset()}
  calibrate(){const p=this.p,G=p.Qg*1e3/22.414,Lm=p.QL*p.wt/100*p.rho/p.MW,
    nC=G*p.yCO2/100*(1-Math.exp(-p.NTUco2)),nH=G*p.yH2S/100*(1-Math.exp(-p.NTUh2s));
    this.nom={G,Lm,LG:Lm/G,a:p.aLeanCO2+p.aLeanH2S+(nC+nH)/Lm};
    const mL=p.QL*p.rho/1e3,Q=(nC*p.dHCO2+nH*p.dHH2S)/1e3,Qg=G*p.cpG*(p.TL+p.app-30.92)/1e6;
    this.nom.Tr=p.TL+(Q-Qg)/(mL*1e3*p.cpL/1e6);this.nom.R=(G*p.cpG)/(mL*1e3*p.cpL);this.nom.T=(p.TL+this.nom.Tr)/2;
    this.nom.fl=fLoad(this.nom.a,p);this.nom.fc=fTco2(this.nom.T);this.nom.fh=fTh2s(this.nom.T)}
  reset(){const n=this.nom,p=this.p;this.x={co2:p.yCO2*1e4*Math.exp(-p.NTUco2),h2s:p.yH2S*1e4*Math.exp(-p.NTUh2s),a:n.a,aC:n.a-p.aLeanH2S-(n.a-p.aLeanCO2-p.aLeanH2S)*0,To:p.TL+p.app,Tr:n.Tr,Q:0,rem:100*(1-Math.exp(-p.NTUco2)),remH:100*(1-Math.exp(-p.NTUh2s))};
    this.x.ai=this.x.co2;this.buf=[];this.bufT=0;this.target=null}
  // Barqaror holat (berilgan sarflar va haroratlarda) — iteratsiya bilan yechiladi
  solve(o){const p=this.p,n=this.nom,dil=o.fault==='dilution'?35/45:1,
    aLC=p.aLeanCO2*(o.fault==='leanLoad'?6:1),aLH=p.aLeanH2S*(o.fault==='leanLoad'?4:1),
    yC=p.yCO2*(o.fault==='feedCO2'?1.5:1)/100,yH=p.yH2S/100,
    G=Math.max(0,o.g)/100*p.Qg*1e3/22.414,Lm=Math.max(0,o.lean)/100*p.QL*p.wt*dil/100*p.rho/p.MW,
    foam=o.fault==='foam'?.45:1;
    if(G<1)return{co2:this.x.co2,h2s:this.x.h2s,a:aLC+aLH,Q:0,To:o.Ti,Tr:p.TL,rem:0,remH:0,G,Lm};
    if(Lm<1)return{co2:yC*1e6,h2s:yH*1e6,a:aLC+aLH,Q:0,To:o.Ti,Tr:o.Ti,rem:0,remH:0,G,Lm};
    const LGr=Math.pow((Lm/G)/n.LG,.35),aL=aLC+aLH,mL=o.lean/100*p.QL*p.rho/1e3,
      R=(G*p.cpG)/(mL*1e3*p.cpL)/n.R,eps=clamp(1.6/(R+.6),0,1),To=o.Ti+eps*(p.TL+p.app-o.Ti),Qg=G*p.cpG*(To-o.Ti)/1e6,
      floorC=yC*Math.pow(aLC/p.aMax,2)*.5,floorH=yH*Math.pow(aLH/p.aMax,2)*.5;
    // berilgan to'yingan yuklanish a uchun: yutilish, issiqlik va qaytadan hisoblangan yuklanish
    const ev=a=>{let Tr=n.Tr,r;for(let k=0;k<2;k++){const T=Math.min(72,(p.TL+Tr)/2),fl=fLoad(a,p)/n.fl,
        Ec=1-Math.exp(-p.NTUco2*fTco2(T)/n.fc*LGr*fl*foam),Eh=1-Math.exp(-p.NTUh2s*fTh2s(T)/n.fh*LGr*Math.max(fl,.05)*foam),
        yo=Math.max(yC*(1-Ec),floorC),yoH=Math.max(yH*(1-Eh),floorH),nC=G*(yC-yo),nH=G*(yH-yoH),Q=(nC*p.dHCO2+nH*p.dHH2S)/1e3;
        Tr=clamp(p.TL+(Q-Qg)/Math.max(1e-6,mL*1e3*p.cpL/1e6),Math.min(o.Ti,p.TL)-5,92);r={yo,yoH,Q,Tr,an:aL+(nC+nH)/Lm}}return r};
    // a = g(a) tenglamasi: g kamayuvchi, shuning uchun ikkiga bo'lish usuli doim yaqinlashadi
    let lo=aL,hi=p.aMax;for(let i=0;i<32;i++){const m=(lo+hi)/2;if(ev(m).an>m)lo=m;else hi=m}
    const a=(lo+hi)/2,r=ev(a);
    return{co2:r.yo*1e6,h2s:r.yoH*1e6,a,Q:r.Q,To,Tr:r.Tr,rem:100*(1-r.yo/yC),remH:100*(1-r.yoH/yH),G,Lm}}
  step(o,dt){const x=this.x,t=this.solve(o);this.target=t;
    x.co2=lag(x.co2,t.co2,dt,45);x.h2s=lag(x.h2s,t.h2s,dt,45);x.a=lag(x.a,t.a,dt,120);x.Q=lag(x.Q,t.Q,dt,30);
    x.To=lag(x.To,t.To,dt,28);x.Tr=lag(x.Tr,t.Tr,dt,24);x.rem=lag(x.rem,t.rem,dt,45);x.remH=lag(x.remH,t.remH,dt,45);
    this.bufT+=dt;if(this.bufT>=1){this.bufT=0;this.buf.push(x.co2);if(this.buf.length>this.p.anaDead)this.buf.shift()}
    const delayed=this.buf.length>=this.p.anaDead?this.buf[0]:(this.buf[0]??x.co2);x.ai=lag(x.ai,delayed,dt,this.p.anaTau)}
  analyzer(fault){return fault==='analyzer'?null:this.x.ai}
  snapshot(fault){const x=this.x;return{co2:x.co2,h2s:x.h2s,a:x.a,Q:x.Q*1e3/3600,rem:x.rem,remH:x.remH,ai:this.analyzer(fault),aiState:fault==='analyzer'?'CAL':'OK'}}
}
AmineChem.DEF=DEF;
window.AmineChem=AmineChem;
})();
