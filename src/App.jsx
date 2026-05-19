import { useState, useEffect, useRef } from "react";
import CrashGame from "./CrashGame";
import SlotMachine from "./SlotMachine";
import Blackjack from "./Blackjack";
import Roulette from "./Roulette";
import Sports from "./Sports";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#080b10;--surface:#0e1420;--card:#131a27;--border:#1e2d45;
    --accent:#00e5ff;--gold:#f5c842;--red:#ff3b5c;--green:#00e676;
    --text:#e8f0fe;--muted:#5a7090;
  }
  html,body{height:100%;background:var(--bg);color:var(--text);font-family:'Syne',sans-serif;overflow-x:hidden}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:var(--bg)}
  ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
  @keyframes pulse-live{0%,100%{opacity:1}50%{opacity:0.3}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes glow-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes flash{0%,100%{opacity:1}50%{opacity:0.2}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
`;

const LABELS={vehicle_count:{low:"0–4 véh.",mid:"5–10 véh.",high:"11+ véh."},vehicle_color:{black:"Noir",white:"Blanc",red:"Rouge",other:"Autre"},vehicle_type:{car:"Voiture",bike:"Vélo",moto:"Moto",truck:"Camion"}};
const BET_CONFIG=[
  {type:"vehicle_count",label:"Nombre de véhicules",icon:"🚗",keys:["low","mid","high"],probKey:"countProbs",probIdx:{low:0,mid:1,high:2}},
  {type:"vehicle_color",label:"Couleur du prochain",icon:"🎨",keys:["black","white","red","other"],probKey:"colorProbs",probIdx:{black:0,white:1,red:2,other:3}},
  {type:"vehicle_type",label:"Type de véhicule",icon:"🚌",keys:["car","bike","moto","truck"],probKey:"typeProbs",probIdx:{car:0,bike:1,moto:2,truck:3}},
];
const MOCK_PLAYERS=[
  {id:1,name:"CryptoKing_92",avatar:"👑",coins:142800,totalWon:98400,bets:312,winRate:61,badge:"🔥",country:"🇫🇷"},
  {id:2,name:"NightRacer",avatar:"🌙",coins:89200,totalWon:54100,bets:201,winRate:55,badge:"⚡",country:"🇧🇷"},
  {id:3,name:"TrafficOracle",avatar:"🔮",coins:76500,totalWon:41200,bets:178,winRate:58,badge:"🎯",country:"🇩🇪"},
  {id:4,name:"ShibuyaBet",avatar:"🗼",coins:65400,totalWon:38900,bets:256,winRate:49,badge:"🚀",country:"🇯🇵"},
  {id:5,name:"CoinsHunter",avatar:"💎",coins:52100,totalWon:29800,bets:134,winRate:53,badge:"💰",country:"🇺🇸"},
];
const MOCK_WINS=[
  {user:"CryptoKing_92",flag:"🇫🇷",amount:4200,bet:"Crash × 4.2",time:"2min"},
  {user:"NightRacer",flag:"🇧🇷",amount:1850,bet:"PSG victoire",time:"5min"},
  {user:"TrafficOracle",flag:"🇩🇪",amount:3100,bet:"Slots 777",time:"8min"},
  {user:"ShibuyaBet",flag:"🇯🇵",amount:920,bet:"Blackjack 21",time:"11min"},
  {user:"CoinsHunter",flag:"🇺🇸",amount:5500,bet:"Crash × 11.2",time:"14min"},
  {user:"StreetProphet",flag:"🇪🇸",amount:2200,bet:"Lakers victoire",time:"18min"},
];

const CAMERAS=[
  {id:1,name:"Paris — Rue de Rivoli",location:"🇫🇷 Paris",fallbackImg:"https://images.unsplash.com/photo-1499856843040-57e7e244d4e1?w=800&q=80"},
  {id:2,name:"Shibuya Crossing — Tokyo",location:"🇯🇵 Tokyo",fallbackImg:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80"},
  {id:3,name:"Times Square — New York",location:"🇺🇸 New York",fallbackImg:"https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80"},
  {id:4,name:"Piccadilly Circus — Londres",location:"🇬🇧 Londres",fallbackImg:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80"},
];

function getTrafficProfile(){
  const now=new Date(),h=now.getHours()+now.getMinutes()/60;
  const dow=now.getDay(),isWeekend=dow===0||dow===6;
  const days=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  let p;
  if(!isWeekend){
    if(h<5.5) p={name:"Nuit profonde",icon:"🌙",color:"#7c6fcd",intensity:0.05,countProbs:[0.75,0.20,0.05],colorProbs:[0.35,0.30,0.05,0.30],typeProbs:[0.40,0.05,0.25,0.30],dur:45};
    else if(h<7) p={name:"Aube",icon:"🌅",color:"#f5a442",intensity:0.25,countProbs:[0.55,0.35,0.10],colorProbs:[0.30,0.30,0.08,0.32],typeProbs:[0.45,0.10,0.15,0.30],dur:35};
    else if(h<9.5) p={name:"Rush Matin",icon:"🚗",color:"#ff3b5c",intensity:0.95,countProbs:[0.05,0.30,0.65],colorProbs:[0.32,0.32,0.10,0.26],typeProbs:[0.80,0.05,0.10,0.05],dur:18};
    else if(h<12) p={name:"Matinée",icon:"☀️",color:"#f5c842",intensity:0.55,countProbs:[0.25,0.50,0.25],colorProbs:[0.30,0.30,0.10,0.30],typeProbs:[0.60,0.10,0.12,0.18],dur:28};
    else if(h<14) p={name:"Déjeuner",icon:"🍽️",color:"#ff9a3c",intensity:0.70,countProbs:[0.15,0.45,0.40],colorProbs:[0.28,0.28,0.12,0.32],typeProbs:[0.55,0.22,0.15,0.08],dur:22};
    else if(h<17) p={name:"Après-midi",icon:"🌤️",color:"#00e5ff",intensity:0.50,countProbs:[0.28,0.48,0.24],colorProbs:[0.30,0.28,0.10,0.32],typeProbs:[0.62,0.12,0.14,0.12],dur:30};
    else if(h<18) p={name:"Pré-Rush Soir",icon:"⚡",color:"#ff7c3c",intensity:0.80,countProbs:[0.10,0.38,0.52],colorProbs:[0.31,0.30,0.10,0.29],typeProbs:[0.72,0.08,0.12,0.08],dur:20};
    else if(h<20) p={name:"Rush Soir",icon:"🚗",color:"#ff3b5c",intensity:1.00,countProbs:[0.03,0.22,0.75],colorProbs:[0.33,0.32,0.09,0.26],typeProbs:[0.82,0.04,0.10,0.04],dur:15};
    else if(h<23) p={name:"Soirée",icon:"🌆",color:"#a78bfa",intensity:0.35,countProbs:[0.45,0.40,0.15],colorProbs:[0.28,0.25,0.15,0.32],typeProbs:[0.65,0.08,0.20,0.07],dur:38};
    else p={name:"Nuit tardive",icon:"🌙",color:"#7c6fcd",intensity:0.12,countProbs:[0.70,0.25,0.05],colorProbs:[0.30,0.25,0.10,0.35],typeProbs:[0.45,0.05,0.30,0.20],dur:42};
  } else {
    if(h<9) p={name:"Weekend Matin",icon:"😴",color:"#7c6fcd",intensity:0.08,countProbs:[0.80,0.17,0.03],colorProbs:[0.25,0.28,0.10,0.37],typeProbs:[0.35,0.30,0.15,0.20],dur:48};
    else if(h<13) p={name:"Weekend Shop",icon:"🛍️",color:"#f5c842",intensity:0.50,countProbs:[0.30,0.48,0.22],colorProbs:[0.27,0.28,0.12,0.33],typeProbs:[0.50,0.30,0.12,0.08],dur:28};
    else if(h<20) p={name:"Weekend Soir",icon:"🎉",color:"#ff9a3c",intensity:0.60,countProbs:[0.20,0.50,0.30],colorProbs:[0.28,0.26,0.15,0.31],typeProbs:[0.60,0.15,0.18,0.07],dur:25};
    else p={name:"Weekend Nuit",icon:"🎊",color:"#a78bfa",intensity:0.20,countProbs:[0.55,0.35,0.10],colorProbs:[0.25,0.22,0.18,0.35],typeProbs:[0.55,0.05,0.35,0.05],dur:40};
  }
  const toOdds=prob=>Math.max(1.05,+((1/(prob*0.88)).toFixed(2)));
  const [pL,pM,pH]=p.countProbs,[pBk,pWh,pRe,pOt]=p.colorProbs,[pCa,pBi,pMo,pTr]=p.typeProbs;
  p.odds={vehicle_count:{low:toOdds(pL),mid:toOdds(pM),high:toOdds(pH)},vehicle_color:{black:toOdds(pBk),white:toOdds(pWh),red:toOdds(pRe),other:toOdds(pOt)},vehicle_type:{car:toOdds(pCa),bike:toOdds(pBi),moto:toOdds(pMo),truck:toOdds(pTr)}};
  p.time=now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  p.day=days[dow];p.isWeekend=isWeekend;
  return p;
}
function pickRandom(arr,probs){const r=Math.random();let a=0;for(let i=0;i<arr.length;i++){a+=probs[i];if(r<a)return arr[i];}return arr[0];}
function generateResult(p){
  const cId=pickRandom(["low","mid","high"],p.countProbs);
  const raw={count:cId==="low"?Math.floor(Math.random()*5):cId==="mid"?5+Math.floor(Math.random()*6):11+Math.floor(Math.random()*10),color:pickRandom(["black","white","red","other"],p.colorProbs),type:pickRandom(["car","bike","moto","truck"],p.typeProbs)};
  return{vehicle_count:cId,vehicle_color:raw.color,vehicle_type:raw.type,raw};
}
const BET_RATIO=0.60;

function LiveBadge(){return(<span style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,59,92,0.15)",border:"1px solid var(--red)",borderRadius:4,padding:"2px 8px",fontSize:11,fontFamily:"'DM Mono',monospace",color:"var(--red)",letterSpacing:2}}><span style={{width:6,height:6,borderRadius:"50%",background:"var(--red)",animation:"pulse-live 1.2s infinite"}}/>LIVE</span>);}

function Ticker({history}){
  if(!history.length)return null;
  const d=[...history,...history];
  return(<div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",overflow:"hidden",height:28,display:"flex",alignItems:"center"}}><div style={{display:"flex",gap:40,animation:"ticker 40s linear infinite",whiteSpace:"nowrap"}}>{d.map((h,i)=>(<span key={i} style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:h.won?"var(--green)":"var(--muted)",flexShrink:0}}>{h.won?"✅":"❌"} R#{h.round} · {h.label} · {h.won?`+${h.gain?.toFixed(0)}`:`-${h.stake}`} coins</span>))}</div></div>);
}

function CountdownRing({timeLeft,total,phaseColor}){
  const r=28,circ=2*Math.PI*r,pct=timeLeft/total;
  return(<div style={{position:"relative",width:72,height:72,flexShrink:0}}><svg width="72" height="72" style={{transform:"rotate(-90deg)"}}><circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth={4}/><circle cx="36" cy="36" r={r} fill="none" stroke={phaseColor} strokeWidth={4} strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.5s linear"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:500,color:phaseColor,animation:timeLeft<=5?"flash 0.5s infinite":"none"}}>{timeLeft}</span><span style={{fontSize:8,color:"var(--muted)",letterSpacing:1}}>SEC</span></div></div>);
}

function BetCard({cfg,phase,profile,selectedBet,onSelect,placedBets}){
  const isOpen=phase==="bet";
  return(<div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}><span style={{fontSize:16}}>{cfg.icon}</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:11}}>{cfg.label}</span>{!isOpen&&<span style={{marginLeft:"auto",fontSize:9,color:"var(--red)",fontFamily:"'DM Mono',monospace",background:"rgba(255,59,92,0.1)",padding:"1px 5px",borderRadius:3}}>FERMÉ</span>}</div>{cfg.keys.map(key=>{const isSel=selectedBet?.type===cfg.type&&selectedBet?.optId===key;const isPlaced=placedBets.find(b=>b.type===cfg.type&&b.optId===key);const prob=profile[cfg.probKey][cfg.probIdx[key]];const odds=profile.odds[cfg.type][key];return(<button key={key} disabled={!isOpen} onClick={()=>onSelect(cfg.type,key,odds)} style={{display:"flex",flexDirection:"column",gap:3,width:"100%",padding:"7px 9px",marginBottom:4,borderRadius:7,border:`1px solid ${isSel?"var(--accent)":isPlaced?"var(--gold)":"var(--border)"}`,background:isSel?"rgba(0,229,255,0.08)":isPlaced?"rgba(245,200,66,0.05)":"var(--surface)",cursor:isOpen?"pointer":"not-allowed",opacity:isOpen?1:0.5,transition:"all 0.2s",textAlign:"left"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:isSel?"var(--accent)":"var(--text)"}}>{LABELS[cfg.type][key]}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:500,color:"var(--gold)"}}>×{odds}</span></div><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{flex:1,height:3,background:"var(--border)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${prob*100}%`,background:profile.color,borderRadius:2,opacity:0.75}}/></div><span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--muted)",minWidth:26}}>{Math.round(prob*100)}%</span></div></button>);})}</div>);
}

function ResultModal({result,bets,profile,onClose}){
  const won=bets.reduce((s,b)=>s+(result[b.type]===b.optId?b.stake*b.odds:0),0);
  const net=won-bets.reduce((s,b)=>s+b.stake,0);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}><div style={{background:"var(--card)",border:`2px solid ${net>=0?"var(--green)":"var(--red)"}`,borderRadius:20,padding:30,maxWidth:420,width:"90%",animation:"glow-in 0.3s ease"}}><div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:48,marginBottom:6,animation:"float 2s infinite"}}>{net>=0?"🏆":"💸"}</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,letterSpacing:2,color:net>=0?"var(--green)":"var(--red)"}}>{net>=0?"GAGNÉ !":"PERDU"}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:26,color:net>=0?"var(--green)":"var(--red)",marginTop:3}}>{net>=0?"+":""}{net.toFixed(0)} coins</div></div><div style={{background:"rgba(0,229,255,0.04)",border:"1px solid rgba(0,229,255,0.1)",borderRadius:8,padding:9,marginBottom:12,fontSize:10,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>🤖 IA [{profile.name} · {profile.time}] — {result.raw.count} véh. · {LABELS.vehicle_color[result.raw.color]} · {LABELS.vehicle_type[result.raw.type]}</div><div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:18}}>{bets.map((b,i)=>{const w=result[b.type]===b.optId;return(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"var(--surface)",borderRadius:7,border:`1px solid ${w?"rgba(0,230,118,0.3)":"rgba(255,59,92,0.2)"}`}}><div><div style={{fontSize:9,color:"var(--muted)"}}>{BET_CONFIG.find(c=>c.type===b.type)?.label}</div><div style={{fontSize:12}}>{LABELS[b.type][b.optId]}</div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"'DM Mono',monospace",color:w?"var(--green)":"var(--red)",fontSize:12}}>{w?`+${(b.stake*b.odds).toFixed(0)}`:`-${b.stake}`}</div></div></div>);})}</div><button onClick={onClose} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:"linear-gradient(135deg,var(--accent),#0090a8)",color:"#000",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>PROCHAIN ROUND →</button></div></div>);
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function BetLive(){
  const [profile,setProfile]=useState(()=>getTrafficProfile());
  const [coins,setCoins]=useState(5000);
  const [cam,setCam]=useState(CAMERAS[0]);
  const [timeLeft,setTimeLeft]=useState(()=>getTrafficProfile().dur);
  const [roundNum,setRoundNum]=useState(1);
  const [phase,setPhase]=useState("bet");
  const [selBet,setSelBet]=useState(null);
  const [stakeInput,setStakeInput]=useState("100");
  const [placedBets,setPlacedBets]=useState([]);
  const [result,setResult]=useState(null);
  const [history,setHistory]=useState([]);
  const [tab,setTab]=useState("home");
  const [casinoGame,setCasinoGame]=useState("crash");
  const [aiLog,setAiLog]=useState([]);
  const [showCrypto,setShowCrypto]=useState(false);
  const [cryptoStep,setCryptoStep]=useState("choose");
  const [cryptoSel,setCryptoSel]=useState(null);
  const [cryptoAmt,setCryptoAmt]=useState("50");
  const [activePlayer,setActivePlayer]=useState(null);
  const [showLang,setShowLang]=useState(false);
  const [lang,setLang]=useState("fr");
  const [tick,setTick]=useState(0);
  const profileRef=useRef(profile);

  const CRYPTO_OPTIONS=[
    {id:"btc",name:"Bitcoin",symbol:"BTC",icon:"₿",color:"#f7931a",addr:"bc1qxy2kgdygjrsqtzq2n0yrf249"},
    {id:"eth",name:"Ethereum",symbol:"ETH",icon:"Ξ",color:"#627eea",addr:"0x742d35Cc6634C0532925a3b8D4C9"},
    {id:"usdt",name:"Tether",symbol:"USDT",icon:"₮",color:"#26a17b",addr:"TQn9Y2khEsLJW1ChVWFMSMeRDow5"},
    {id:"bnb",name:"BNB",symbol:"BNB",icon:"◈",color:"#f3ba2f",addr:"bnb1grpf0955h0ykzq3ar6ze596"},
    {id:"sol",name:"Solana",symbol:"SOL",icon:"◎",color:"#9945ff",addr:"7xKXtg2CW87d97TXJSDpbD5jBkheTqA"},
  ];

  useEffect(()=>{const id=setInterval(()=>{const p=getTrafficProfile();setProfile(p);profileRef.current=p;},60000);return()=>clearInterval(id);},[]);
  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),3000);return()=>clearInterval(id);},[]);

  useEffect(()=>{
    const id=setInterval(()=>{
      setTimeLeft(t=>{
        const dur=profileRef.current.dur,bc=Math.floor(dur*BET_RATIO);
        if(t<=1){const res=generateResult(profileRef.current);setResult(res);setPhase("showResult");setAiLog(l=>[`🤖 [${profileRef.current.time}] ${profileRef.current.name} · ${res.raw.count} véh. · ${LABELS.vehicle_color[res.raw.color]} · ${LABELS.vehicle_type[res.raw.type]}`,...l.slice(0,9)]);return dur;}
        const nt=t-1;if(nt===bc)setPhase("closing");if(nt===5)setPhase("result");return nt;
      });
    },1000);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    if(phase!=="showResult"||!result||!placedBets.length)return;
    let gain=0;
    placedBets.forEach(b=>{const w=result[b.type]===b.optId,g=w?b.stake*b.odds:0;gain+=g;setHistory(h=>[{round:roundNum,label:LABELS[b.type][b.optId],won:w,gain:g,stake:b.stake},...h.slice(0,49)]);});
    if(gain>0)setCoins(c=>c+Math.round(gain));
  },[phase,result]);

  const closeResult=()=>{setPhase("bet");setPlacedBets([]);setSelBet(null);setResult(null);setRoundNum(n=>n+1);const p=getTrafficProfile();setProfile(p);profileRef.current=p;setTimeLeft(p.dur);};
  const dur=profile.dur;
  const phaseColor=phase==="bet"?"var(--green)":phase==="closing"?"var(--gold)":"var(--accent)";
  const phaseLabel=phase==="bet"?"PARIS OUVERTS":phase==="closing"?"FERMETURE":phase==="result"?"ANALYSE IA…":"RÉSULTATS";

  const TABS=[
    {id:"home",label:"🏠 Accueil"},
    {id:"live",label:"📡 Paris Live"},
    {id:"casino",label:"🎰 Casino"},
    {id:"sports",label:"⚽ Paris Sportifs"},
    {id:"community",label:"👥 Communauté"},
    {id:"admin",label:"⚙️ Admin"},
  ];

  const CASINO_GAMES=[
    {id:"crash",label:"🚀 Crash",color:"#ff3b5c"},
    {id:"slots",label:"🎰 Slots",color:"#f5c842"},
    {id:"blackjack",label:"🃏 Blackjack",color:"#00e676"},
    {id:"roulette",label:"🎡 Roulette",color:"#a78bfa"},
  ];

  return(
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        {/* HEADER */}
        <header style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"0 20px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:"var(--accent)",cursor:"pointer"}} onClick={()=>setTab("home")}>BETLIVE</span>
            <span style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>betlive.fit</span>
            <LiveBadge/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowLang(v=>!v)} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px",color:"var(--muted)",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:10}}>🌐 {lang.toUpperCase()}</button>
              {showLang&&<div style={{position:"absolute",top:"110%",right:0,background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",zIndex:100}}>
                {[["fr","🇫🇷 Français"],["en","🇬🇧 English"],["es","🇪🇸 Español"]].map(([l,label])=>(
                  <button key={l} onClick={()=>{setLang(l);setShowLang(false);}} style={{display:"block",width:"100%",padding:"8px 14px",background:lang===l?"rgba(0,229,255,0.08)":"transparent",border:"none",borderBottom:"1px solid var(--border)",color:lang===l?"var(--accent)":"var(--text)",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:12,textAlign:"left"}}>{label}</button>
                ))}
              </div>}
            </div>
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:5}}>
              <span>🪙</span><span style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)",fontSize:12,fontWeight:500}}>{coins.toLocaleString()}</span>
            </div>
            <button onClick={()=>{setShowCrypto(true);setCryptoStep("choose");}} style={{background:"linear-gradient(135deg,var(--gold),#c8a000)",color:"#000",border:"none",borderRadius:8,padding:"7px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>₿ DÉPÔT</button>
          </div>
        </header>

        <Ticker history={history}/>

        {/* TABS */}
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",display:"flex",padding:"0 20px",overflowX:"auto"}}>
          {TABS.map(({id,label})=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"10px 14px",border:"none",background:"transparent",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:600,color:tab===id?(id==="admin"?"var(--red)":"var(--accent)"):(id==="admin"?"rgba(255,59,92,0.4)":"var(--muted)"),borderBottom:tab===id?`2px solid ${id==="admin"?"var(--red)":"var(--accent)"}`:"2px solid transparent",whiteSpace:"nowrap"}}>{label}</button>
          ))}
        </div>

        <main style={{flex:1,maxWidth:1200,width:"100%",margin:"0 auto",padding:16,boxSizing:"border-box"}}>

          {/* ── ACCUEIL ── */}
          {tab==="home"&&<div style={{animation:"glow-in 0.4s ease"}}>
            {/* Hero */}
            <div style={{position:"relative",borderRadius:20,overflow:"hidden",marginBottom:24,minHeight:340,display:"flex",alignItems:"center",background:"linear-gradient(135deg,#0a0f1a,#131a27)",border:"1px solid var(--border)"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)",backgroundSize:"30px 30px"}}/>
              <img src={cam.fallbackImg} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.15,filter:`brightness(${0.8+Math.sin(tick)*0.1})`}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(8,11,16,0.95) 40%,rgba(0,229,255,0.03))"}}/>
              <div style={{position:"relative",padding:"40px 48px",maxWidth:600}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><LiveBadge/><span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"var(--muted)"}}>{profile.icon} {profile.name} · {profile.time}</span></div>
                <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:56,letterSpacing:3,lineHeight:1.05,marginBottom:14}}>
                  La plateforme de paris<br/><span style={{color:"var(--accent)"}}>la plus complète</span>
                </h1>
                <p style={{fontSize:13,color:"var(--muted)",marginBottom:24,lineHeight:1.6}}>Paris live sur caméra · Casino complet · Paris sportifs · Crypto accepté</p>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button onClick={()=>setTab("live")} style={{background:"linear-gradient(135deg,var(--accent),#0090a8)",color:"#000",border:"none",borderRadius:9,padding:"10px 20px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>📡 PARIS LIVE</button>
                  <button onClick={()=>setTab("casino")} style={{background:"linear-gradient(135deg,var(--gold),#c8a000)",color:"#000",border:"none",borderRadius:9,padding:"10px 20px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>🎰 CASINO</button>
                  <button onClick={()=>setTab("sports")} style={{background:"linear-gradient(135deg,#00e676,#00a854)",color:"#000",border:"none",borderRadius:9,padding:"10px 20px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>⚽ SPORTIFS</button>
                </div>
              </div>
            </div>

            {/* Jeux */}
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:3,marginBottom:12}}>NOS JEUX</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
              {[
                {id:"live",icon:"📡",name:"Paris Live",desc:"Parie sur de vraies caméras",color:"var(--accent)",bg:"rgba(0,229,255,0.08)"},
                {id:"crash",icon:"🚀",name:"Crash Game",desc:"Le rocket qui monte",color:"#ff3b5c",bg:"rgba(255,59,92,0.08)"},
                {id:"slots",icon:"🎰",name:"Slots",desc:"Machine à sous",color:"var(--gold)",bg:"rgba(245,200,66,0.08)"},
                {id:"blackjack",icon:"🃏",name:"Blackjack",desc:"Bats le dealer",color:"#00e676",bg:"rgba(0,230,118,0.08)"},
                {id:"roulette",icon:"🎡",name:"Roulette",desc:"Roulette européenne",color:"#a78bfa",bg:"rgba(167,139,250,0.08)"},
                {id:"sports-football",icon:"⚽",name:"Football",desc:"Ligue 1, PL, UCL",color:"#00e676",bg:"rgba(0,230,118,0.08)"},
                {id:"sports-basketball",icon:"🏀",name:"Basketball",desc:"NBA & EuroLeague",color:"#ff9a3c",bg:"rgba(255,154,60,0.08)"},
                {id:"sports-esports",icon:"🎮",name:"eSports",desc:"CS2, LoL, Valorant",color:"#a78bfa",bg:"rgba(167,139,250,0.08)"},
              ].map(({id,icon,name,desc,color,bg})=>(
                <button key={id} onClick={()=>{if(id==="live"){setTab("live");}else if(id.startsWith("sports")){setTab("sports");}else{setTab("casino");setCasinoGame(id);}}}
                  style={{background:bg,border:`1px solid ${color}30`,borderRadius:12,padding:"16px 12px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                  <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
                  <div style={{fontWeight:700,fontSize:13,color,marginBottom:4}}>{name}</div>
                  <div style={{fontSize:10,color:"var(--muted)",lineHeight:1.4}}>{desc}</div>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[{label:"Joueurs actifs",value:"12,847",icon:"👥",color:"var(--accent)"},{label:"Paris joués",value:"3,241,092",icon:"🎯",color:"var(--gold)"},{label:"Gains versés",value:"4.2M coins",icon:"💰",color:"var(--green)"}].map((s,i)=>(
                <div key={i} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:26}}>{s.icon}</span>
                  <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:s.color}}>{s.value}</div><div style={{fontSize:10,color:"var(--muted)"}}>{s.label}</div></div>
                </div>
              ))}
            </div>

            {/* Gains récents */}
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:3,marginBottom:10}}>GAINS RÉCENTS</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {MOCK_WINS.map((w,i)=>(
                <div key={i} style={{background:"var(--card)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:10,padding:12,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>{w.flag}</span>
                  <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.user}</div><div style={{fontSize:9,color:"var(--muted)"}}>{w.bet}</div></div>
                  <div style={{textAlign:"right",flexShrink:0}}><div style={{fontFamily:"'DM Mono',monospace",color:"var(--green)",fontWeight:700,fontSize:13}}>+{w.amount.toLocaleString()}</div><div style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{w.time}</div></div>
                </div>
              ))}
            </div>
          </div>}

          {/* ── CASINO ── */}
          {tab==="casino"&&<div style={{animation:"glow-in 0.4s ease"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,marginBottom:14}}>🎰 CASINO</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {CASINO_GAMES.map(({id,label,color})=>(
                <button key={id} onClick={()=>setCasinoGame(id)}
                  style={{padding:"9px 18px",border:`1px solid ${casinoGame===id?color:"var(--border)"}`,background:casinoGame===id?`${color}15`:"var(--surface)",borderRadius:10,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:600,color:casinoGame===id?color:"var(--muted)"}}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{minHeight:500}}>
              {casinoGame==="crash"&&<CrashGame coins={coins} setCoins={setCoins}/>}
              {casinoGame==="slots"&&<SlotMachine coins={coins} setCoins={setCoins}/>}
              {casinoGame==="blackjack"&&<Blackjack coins={coins} setCoins={setCoins}/>}
              {casinoGame==="roulette"&&<Roulette coins={coins} setCoins={setCoins}/>}
            </div>
          </div>}

          {/* ── PARIS SPORTIFS ── */}
          {tab==="sports"&&<div style={{animation:"glow-in 0.4s ease"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,marginBottom:14}}>⚽ PARIS SPORTIFS</div>
            <Sports coins={coins} setCoins={setCoins}/>
          </div>}

          {/* ── PARIS LIVE ── */}
          {tab==="live"&&<div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:14,animation:"glow-in 0.4s ease"}}>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Profil */}
              <div style={{background:`linear-gradient(135deg,${profile.color}18,transparent)`,border:`1px solid ${profile.color}40`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:22}}>{profile.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:profile.color}}>{profile.name}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--muted)"}}>{profile.day} · {profile.time}</span></div>
                  <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${profile.intensity*100}%`,background:`linear-gradient(90deg,${profile.color}88,${profile.color})`,borderRadius:2}}/></div>
                </div>
                <div style={{textAlign:"center",padding:"5px 10px",background:`${profile.color}20`,borderRadius:8,border:`1px solid ${profile.color}40`,flexShrink:0}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"var(--muted)",marginBottom:1}}>ROUND</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:17,color:profile.color}}>{dur}s</div>
                </div>
              </div>

              {/* Sélecteur caméra */}
              <div style={{display:"flex",gap:6,overflowX:"auto"}}>
                {CAMERAS.map(c=><button key={c.id} onClick={()=>setCam(c)} style={{flexShrink:0,padding:"5px 12px",border:`1px solid ${cam.id===c.id?"var(--accent)":"var(--border)"}`,background:cam.id===c.id?"rgba(0,229,255,0.08)":"var(--surface)",borderRadius:8,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:10,color:cam.id===c.id?"var(--accent)":"var(--muted)"}}>{c.location}</button>)}
              </div>

              {/* Cam */}
              <div style={{position:"relative",borderRadius:14,overflow:"hidden",border:`2px solid ${profile.color}60`,aspectRatio:"16/9",background:"#000"}}>
                <img src={`${cam.fallbackImg}&t=${tick}`} alt={cam.name} style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.8,filter:`brightness(${0.85+Math.sin(tick*0.3)*0.1})`}}/>
                <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,229,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.02) 1px,transparent 1px)",backgroundSize:"20px 20px",pointerEvents:"none"}}/>
                {/* Scan line */}
                <div style={{position:"absolute",left:0,right:0,top:`${(tick*15)%90+5}%`,height:1,background:"linear-gradient(90deg,transparent,var(--accent),transparent)",opacity:0.4,pointerEvents:"none"}}/>
                <div style={{position:"absolute",top:10,left:10,display:"flex",gap:8,alignItems:"center",zIndex:3,pointerEvents:"none"}}><LiveBadge/><span style={{background:"rgba(0,0,0,0.7)",padding:"2px 9px",borderRadius:20,fontSize:10,fontFamily:"'DM Mono',monospace",backdropFilter:"blur(4px)"}}>{cam.location} — {cam.name}</span></div>
                <div style={{position:"absolute",top:10,right:10,background:`${profile.color}25`,border:`1px solid ${profile.color}70`,borderRadius:7,padding:"3px 9px",fontFamily:"'DM Mono',monospace",fontSize:9,color:profile.color,zIndex:3,pointerEvents:"none"}}>{profile.icon} {phaseLabel}</div>
                <div style={{position:"absolute",top:8,left:8,fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(0,229,255,0.5)",pointerEvents:"none",lineHeight:1.4,zIndex:3}}><div>REC ●</div><div>IA ACTIVE</div></div>
                {aiLog[0]&&<div style={{position:"absolute",bottom:10,left:10,right:10,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",borderRadius:8,padding:"5px 9px",fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--accent)",border:"1px solid rgba(0,229,255,0.2)",zIndex:3,pointerEvents:"none"}}>{aiLog[0]}</div>}
                <div style={{position:"absolute",bottom:10,right:10,fontFamily:"'DM Mono',monospace",fontSize:9,color:"rgba(0,229,255,0.6)",zIndex:3,pointerEvents:"none"}}>{new Date().toLocaleTimeString("fr-FR")} · R#{roundNum}</div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {BET_CONFIG.map(cfg=><BetCard key={cfg.type} cfg={cfg} phase={phase} profile={profile} selectedBet={selBet} onSelect={(t,o,odds)=>{if(phase==="bet")setSelBet({type:t,optId:o,odds});}} placedBets={placedBets}/>)}
              </div>
            </div>

            {/* Droite */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <CountdownRing timeLeft={timeLeft} total={dur} phaseColor={phaseColor}/>
                  <div><div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--muted)",letterSpacing:2,marginBottom:2}}>ROUND #{roundNum}</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:phaseColor}}>{phaseLabel}</div><div style={{fontSize:10,color:"var(--muted)",marginTop:1}}>{phase==="bet"?`Fermeture dans ${Math.max(0,timeLeft-Math.floor(dur*BET_RATIO))}s`:""}</div></div>
                </div>
                <div style={{display:"flex",gap:3}}>{[["PARIS","bet"],["FERMETURE","closing"],["RÉSULTAT","result"]].map(([l,p],i)=>(<div key={p} style={{flex:1,height:3,borderRadius:2,background:["bet","closing","result","showResult"].indexOf(phase)>=i?phaseColor:"var(--border)"}}/>))}</div>
              </div>

              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14,flex:1}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:2,marginBottom:10}}>BULLETIN</div>
                {selBet?(
                  <div style={{animation:"glow-in 0.3s ease"}}>
                    <div style={{background:"rgba(0,229,255,0.06)",border:"1px solid rgba(0,229,255,0.2)",borderRadius:8,padding:9,marginBottom:9}}>
                      <div style={{fontSize:9,color:"var(--muted)",marginBottom:2}}>{BET_CONFIG.find(c=>c.type===selBet.type)?.label}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontWeight:600,fontSize:12}}>{LABELS[selBet.type][selBet.optId]}</span><span style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)",fontSize:14}}>×{selBet.odds}</span></div>
                    </div>
                    <div style={{display:"flex",gap:4,marginBottom:5}}>{[50,100,250,500].map(v=><button key={v} onClick={()=>setStakeInput(String(v))} style={{flex:1,padding:"5px 0",border:`1px solid ${stakeInput===String(v)?"var(--accent)":"var(--border)"}`,background:stakeInput===String(v)?"rgba(0,229,255,0.1)":"var(--surface)",borderRadius:5,color:stakeInput===String(v)?"var(--accent)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:9,cursor:"pointer"}}>{v}</button>)}</div>
                    <input type="number" value={stakeInput} onChange={e=>setStakeInput(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"8px 9px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none",marginBottom:8}}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)",marginBottom:9}}><span>Gain potentiel</span><span style={{color:"var(--green)",fontFamily:"'DM Mono',monospace"}}>{(parseInt(stakeInput||0)*selBet.odds).toFixed(0)} coins</span></div>
                    <button onClick={()=>{const s=parseInt(stakeInput,10);if(!selBet||isNaN(s)||s<=0||s>coins)return;setCoins(c=>c-s);setPlacedBets(b=>[...b,{...selBet,stake:s}]);setSelBet(null);}} style={{width:"100%",padding:11,borderRadius:9,border:"none",background:"linear-gradient(135deg,var(--accent),#0090a8)",color:"#000",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer",marginBottom:5}}>PLACER LE PARI</button>
                    <button onClick={()=>setSelBet(null)} style={{width:"100%",padding:6,borderRadius:7,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",fontFamily:"'Syne',sans-serif",fontSize:10,cursor:"pointer"}}>Annuler</button>
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"20px 0",color:"var(--muted)",fontSize:11}}>
                    {placedBets.length===0?<><div style={{fontSize:26,marginBottom:5}}>🎯</div>Sélectionne un pari</>:<><div style={{fontSize:26,marginBottom:5}}>✅</div>Paris placés !</>}
                  </div>
                )}
                {placedBets.length>0&&<div style={{marginTop:10,borderTop:"1px solid var(--border)",paddingTop:8}}><div style={{fontSize:9,color:"var(--muted)",letterSpacing:1,marginBottom:5}}>EN COURS ({placedBets.length})</div>{placedBets.map((b,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0"}}><span style={{color:"var(--text)"}}>{LABELS[b.type][b.optId]}</span><span style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)"}}>{b.stake}×{b.odds}</span></div>)}</div>}
              </div>

              {history.length>0&&<div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:12}}><div style={{fontSize:9,color:"var(--muted)",letterSpacing:1,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>DERNIERS ROUNDS</div>{history.slice(0,4).map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0",borderBottom:"1px solid rgba(30,45,69,0.4)"}}><span style={{color:"var(--muted)"}}>R#{h.round} · {h.label}</span><span style={{fontFamily:"'DM Mono',monospace",color:h.won?"var(--green)":"var(--red)"}}>{h.won?`+${h.gain.toFixed(0)}`:`-${h.stake}`}</span></div>)}</div>}
            </div>
          </div>}

          {/* ── COMMUNAUTÉ ── */}
          {tab==="community"&&<div style={{animation:"glow-in 0.4s ease"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,marginBottom:16}}>COMMUNAUTÉ</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,marginBottom:10,color:"var(--accent)"}}>TOP JOUEURS</div>
                {MOCK_PLAYERS.map((p,i)=>(
                  <div key={p.id} onClick={()=>setActivePlayer(activePlayer?.id===p.id?null:p)} style={{background:"var(--card)",border:`1px solid ${activePlayer?.id===p.id?"var(--accent)":"var(--border)"}`,borderRadius:10,padding:12,marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:i===0?"linear-gradient(135deg,#f5c842,#c8a000)":i===1?"linear-gradient(135deg,#aaa,#666)":i===2?"linear-gradient(135deg,#cd7f32,#8b4513)":"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,color:i<3?"#000":"var(--muted)",flexShrink:0}}>{i+1}</div>
                    <div style={{fontSize:20,flexShrink:0}}>{p.avatar}</div>
                    <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:12}}>{p.name} {p.country}</div><div style={{fontSize:10,color:"var(--muted)"}}>{p.bets} paris · {p.winRate}% victoires</div></div>
                    <div style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)",fontSize:13}}>{p.coins.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div>
                {activePlayer?(
                  <div style={{background:"var(--card)",border:"1px solid var(--accent)",borderRadius:12,padding:18,marginBottom:12,animation:"glow-in 0.3s ease"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(0,229,255,0.1)",border:"2px solid var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{activePlayer.avatar}</div>
                      <div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20}}>{activePlayer.name} {activePlayer.country}</div><div style={{fontSize:11,color:"var(--muted)"}}>{activePlayer.badge} Membre actif</div></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[{l:"Total gagné",v:`${activePlayer.totalWon.toLocaleString()} coins`,c:"var(--green)"},{l:"Paris",v:activePlayer.bets,c:"var(--accent)"},{l:"Taux victoire",v:`${activePlayer.winRate}%`,c:"var(--gold)"},{l:"Solde",v:`${activePlayer.coins.toLocaleString()}`,c:"var(--text)"}].map((s,i)=>(
                        <div key={i} style={{background:"var(--surface)",borderRadius:8,padding:9,border:"1px solid var(--border)"}}><div style={{fontSize:9,color:"var(--muted)",marginBottom:2}}>{s.l}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:s.c}}>{s.v}</div></div>
                      ))}
                    </div>
                  </div>
                ):(
                  <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:20,textAlign:"center",color:"var(--muted)",marginBottom:12}}><div style={{fontSize:28,marginBottom:6}}>👆</div><div style={{fontSize:12}}>Clique sur un joueur</div></div>
                )}
                <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:2,marginBottom:10}}>ACTIVITÉ RÉCENTE</div>
                  {[{u:"CryptoKing_92",f:"🇫🇷",a:"a gagné",v:4200,b:"Crash ×4.2",t:"2min",w:true},{u:"NightRacer",f:"🇧🇷",a:"a misé",v:500,b:"PSG victoire",t:"3min",w:null},{u:"TrafficOracle",f:"🇩🇪",a:"a gagné",v:3100,b:"Slots 7️⃣7️⃣7️⃣",t:"5min",w:true},{u:"ShibuyaBet",f:"🇯🇵",a:"a perdu",v:200,b:"Lakers",t:"7min",w:false}].map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",background:"var(--surface)",borderRadius:7,marginBottom:5,border:`1px solid ${f.w===true?"rgba(0,230,118,0.15)":f.w===false?"rgba(255,59,92,0.1)":"var(--border)"}`}}>
                      <span style={{fontSize:14}}>{f.f}</span>
                      <div style={{flex:1,fontSize:10}}><span style={{fontWeight:600}}>{f.u}</span><span style={{color:"var(--muted)"}}> {f.a} </span><span style={{color:f.w===true?"var(--green)":f.w===false?"var(--red)":"var(--accent)",fontWeight:600}}>{f.w===true?"+":f.w===false?"-":""}{f.v} coins</span></div>
                      <span style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{f.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>}

          {/* ── ADMIN ── */}
          {tab==="admin"&&<div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,marginBottom:4}}>⚙️ ADMIN PANEL</div>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:14}}>IA : {profile.icon} {profile.name} · {profile.day} {profile.time} · Round {dur}s · {Math.round(profile.intensity*100)}%</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
              {[{name:"Nuit profonde",icon:"🌙",color:"#7c6fcd",intensity:0.05,hours:"00h–05h30",dur:45},{name:"Rush Matin",icon:"🚗",color:"#ff3b5c",intensity:0.95,hours:"07h–09h30",dur:18},{name:"Déjeuner",icon:"🍽️",color:"#ff9a3c",intensity:0.70,hours:"12h–14h",dur:22},{name:"Rush Soir",icon:"🚗",color:"#ff3b5c",intensity:1.00,hours:"18h–20h",dur:15},{name:"Soirée",icon:"🌆",color:"#a78bfa",intensity:0.35,hours:"20h–23h",dur:38},{name:"Weekend",icon:"🛍️",color:"#f5c842",intensity:0.50,hours:"Sam–Dim",dur:28}].map((p,i)=>{
                const isA=profile.name===p.name;
                return(<div key={i} style={{background:"var(--card)",border:`1px solid ${isA?p.color:"var(--border)"}`,borderRadius:9,padding:10,opacity:isA?1:0.6}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><span style={{fontSize:14}}>{p.icon}</span><div><div style={{fontSize:10,fontWeight:700,color:p.color}}>{p.name}</div><div style={{fontSize:8,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{p.hours}</div></div></div>
                  <div style={{height:3,background:"var(--border)",borderRadius:2,overflow:"hidden",marginBottom:3}}><div style={{height:"100%",width:`${p.intensity*100}%`,background:p.color,borderRadius:2}}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:8,fontFamily:"'DM Mono',monospace",color:"var(--muted)"}}><span>{Math.round(p.intensity*100)}%</span><span>{p.dur}s</span></div>
                  {isA&&<div style={{textAlign:"center",fontSize:8,color:p.color,fontFamily:"'DM Mono',monospace",marginTop:3}}>▶ ACTIF</div>}
                </div>);
              })}
            </div>
          </div>}
        </main>

        {/* CRYPTO MODAL */}
        {showCrypto&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,padding:28,maxWidth:400,width:"90%",animation:"glow-in 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2}}>DÉPÔT CRYPTO</div>
              <button onClick={()=>setShowCrypto(false)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:18}}>✕</button>
            </div>
            {cryptoStep==="choose"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
              {CRYPTO_OPTIONS.map(c=><button key={c.id} onClick={()=>{setCryptoSel(c);setCryptoStep("pay");}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:22,color:c.color,fontWeight:700,width:28}}>{c.icon}</span>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{c.name}</div><div style={{fontSize:10,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{c.symbol}</div></div>
                <span style={{color:"var(--muted)"}}>→</span>
              </button>)}
            </div>}
            {cryptoStep==="pay"&&cryptoSel&&<>
              <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:9,padding:10,marginBottom:10,fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--accent)",wordBreak:"break-all"}}>{cryptoSel.addr}</div>
              <div style={{display:"flex",gap:5,marginBottom:8}}>{["0.01","0.05","0.1","0.5"].map(v=><button key={v} onClick={()=>setCryptoAmt(v)} style={{flex:1,padding:"5px",border:`1px solid ${cryptoAmt===v?"var(--accent)":"var(--border)"}`,background:cryptoAmt===v?"rgba(0,229,255,0.1)":"var(--surface)",borderRadius:6,color:cryptoAmt===v?"var(--accent)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:9,cursor:"pointer"}}>{v}</button>)}</div>
              <input type="number" value={cryptoAmt} onChange={e=>setCryptoAmt(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none",marginBottom:8}}/>
              <div style={{fontSize:10,color:"var(--gold)",marginBottom:12,fontFamily:"'DM Mono',monospace"}}>≈ {Math.round(parseFloat(cryptoAmt||0)*100000)} coins crédités</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setCryptoStep("choose")} style={{flex:1,padding:"10px",border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",borderRadius:9,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12}}>← Retour</button>
                <button onClick={()=>{setCoins(c=>c+Math.round(parseFloat(cryptoAmt||0)*100000));setShowCrypto(false);}} style={{flex:2,padding:"10px",border:"none",background:"var(--accent)",color:"#000",borderRadius:9,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12}}>CONFIRMER →</button>
              </div>
            </>}
          </div>
        </div>}

        {phase==="showResult"&&result&&placedBets.length>0&&<ResultModal result={result} bets={placedBets} profile={profile} onClose={closeResult}/>}
        {phase==="showResult"&&placedBets.length===0&&<div style={{position:"fixed",bottom:18,right:18,background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,padding:"9px 14px",zIndex:50,animation:"glow-in 0.3s ease",fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--muted)",display:"flex",alignItems:"center",gap:10}}>
          R#{roundNum} · {result?.raw.count} véh.
          <button onClick={closeResult} style={{background:"var(--accent)",border:"none",color:"#000",borderRadius:5,padding:"2px 7px",cursor:"pointer",fontSize:9,fontWeight:700}}>SUIVANT →</button>
        </div>}
      </div>
    </>
  );
}
