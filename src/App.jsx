import { useState, useEffect, useRef } from "react";

// ─── I18N ────────────────────────────────────────────────────────────────────
const T = {
  fr: {
    tagline: "Parie sur le monde réel, en direct.",
    subtitle: "Des caméras du monde entier. Des événements réels. Des gains instantanés.",
    playNow: "JOUER MAINTENANT",
    howIt: "COMMENT ÇA MARCHE ?",
    step1t: "Caméra en direct", step1d: "Une caméra filme une rue en temps réel.",
    step2t: "Tu paries",        step2d: "Choisis un événement et mise tes coins.",
    step3t: "L'IA analyse",     step3d: "L'IA détecte le résultat automatiquement.",
    step4t: "Tu gagnes",        step4d: "Les gains sont versés instantanément.",
    recentWins: "GAINS RÉCENTS",
    joinNow: "REJOINDRE MAINTENANT",
    community: "COMMUNAUTÉ",
    topPlayers: "TOP JOUEURS",
    recentActivity: "ACTIVITÉ RÉCENTE",
    profile: "Profil",
    totalWon: "Total gagné",
    totalBets: "Paris joués",
    winRate: "Taux de victoire",
    tabs: { home:"🏠 Accueil", bet:"🎯 Paris", community:"👥 Communauté", cameras:"📡 Caméras", admin:"⚙️ Admin" },
    deposit: "DÉPÔT",
    withdraw: "RETRAIT",
    crypto: "CRYPTO",
    chooseMethod: "Choisir la méthode",
    cryptoDesc: "Dépôt instantané, sans frais bancaires.",
    copyAddr: "Copier l'adresse",
    copied: "Copié !",
    roundOpen: "PARIS OUVERTS", roundClose: "FERMETURE", roundAI: "ANALYSE IA…", roundResult: "RÉSULTATS",
    placeBet: "PLACER LE PARI", cancel: "Annuler",
    betSlip: "BULLETIN", potential: "Gain potentiel",
    stake: "MISE (coins)", inProgress: "EN COURS",
    confirm: "CONFIRMER",
    nextRound: "PROCHAIN ROUND →",
    won: "GAGNÉ !", lost: "PERDU",
    loginToPlay: "Connecte-toi pour jouer",
    login: "SE CONNECTER", register: "S'INSCRIRE",
    lang: "🌐 Langue",
  },
  en: {
    tagline: "Bet on the real world, live.",
    subtitle: "Cameras from around the world. Real events. Instant wins.",
    playNow: "PLAY NOW",
    howIt: "HOW IT WORKS",
    step1t: "Live Camera", step1d: "A camera films a real street in real time.",
    step2t: "You Bet",     step2d: "Pick an event and place your coins.",
    step3t: "AI Analyses", step3d: "AI detects the result automatically.",
    step4t: "You Win",     step4d: "Winnings paid out instantly.",
    recentWins: "RECENT WINS",
    joinNow: "JOIN NOW",
    community: "COMMUNITY",
    topPlayers: "TOP PLAYERS",
    recentActivity: "RECENT ACTIVITY",
    profile: "Profile",
    totalWon: "Total won",
    totalBets: "Bets placed",
    winRate: "Win rate",
    tabs: { home:"🏠 Home", bet:"🎯 Bet", community:"👥 Community", cameras:"📡 Cameras", admin:"⚙️ Admin" },
    deposit: "DEPOSIT",
    withdraw: "WITHDRAW",
    crypto: "CRYPTO",
    chooseMethod: "Choose method",
    cryptoDesc: "Instant deposit, no banking fees.",
    copyAddr: "Copy address",
    copied: "Copied!",
    roundOpen: "BETS OPEN", roundClose: "CLOSING", roundAI: "AI SCANNING…", roundResult: "RESULTS",
    placeBet: "PLACE BET", cancel: "Cancel",
    betSlip: "BET SLIP", potential: "Potential win",
    stake: "STAKE (coins)", inProgress: "IN PROGRESS",
    confirm: "CONFIRM",
    nextRound: "NEXT ROUND →",
    won: "WON!", lost: "LOST",
    loginToPlay: "Login to play",
    login: "LOG IN", register: "REGISTER",
    lang: "🌐 Language",
  },
  es: {
    tagline: "Apuesta al mundo real, en vivo.",
    subtitle: "Cámaras de todo el mundo. Eventos reales. Ganancias instantáneas.",
    playNow: "JUGAR AHORA",
    howIt: "¿CÓMO FUNCIONA?",
    step1t: "Cámara en vivo", step1d: "Una cámara filma una calle en tiempo real.",
    step2t: "Apuestas",       step2d: "Elige un evento y apuesta tus coins.",
    step3t: "IA Analiza",     step3d: "La IA detecta el resultado automáticamente.",
    step4t: "Ganas",          step4d: "Las ganancias se pagan al instante.",
    recentWins: "GANANCIAS RECIENTES",
    joinNow: "ÚNETE AHORA",
    community: "COMUNIDAD",
    topPlayers: "TOP JUGADORES",
    recentActivity: "ACTIVIDAD RECIENTE",
    profile: "Perfil",
    totalWon: "Total ganado",
    totalBets: "Apuestas",
    winRate: "Tasa de victoria",
    tabs: { home:"🏠 Inicio", bet:"🎯 Apostar", community:"👥 Comunidad", cameras:"📡 Cámaras", admin:"⚙️ Admin" },
    deposit: "DEPÓSITO", withdraw: "RETIRO", crypto: "CRIPTO",
    chooseMethod: "Elegir método", cryptoDesc: "Depósito instantáneo, sin tarifas.",
    copyAddr: "Copiar dirección", copied: "¡Copiado!",
    roundOpen: "APUESTAS ABIERTAS", roundClose: "CIERRE", roundAI: "IA ANALIZANDO…", roundResult: "RESULTADOS",
    placeBet: "APOSTAR", cancel: "Cancelar",
    betSlip: "BOLETO", potential: "Ganancia potencial",
    stake: "APUESTA (coins)", inProgress: "EN CURSO",
    confirm: "CONFIRMAR",
    nextRound: "SIGUIENTE RONDA →",
    won: "¡GANASTE!", lost: "PERDISTE",
    loginToPlay: "Inicia sesión para jugar",
    login: "INICIAR SESIÓN", register: "REGISTRARSE",
    lang: "🌐 Idioma",
  },
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
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
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes count-up{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
`;

// ─── DATA ────────────────────────────────────────────────────────────────────
const CAMERAS = [
  {id:1,name:"Paris — Rue de Rivoli",  location:"🇫🇷 Paris",   url:"https://images.unsplash.com/photo-1499856843040-57e7e244d4e1?w=800&q=80",active:true},
  {id:2,name:"Tokyo — Shibuya",        location:"🇯🇵 Tokyo",   url:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",active:true},
  {id:3,name:"New York — Times Square",location:"🇺🇸 New York",url:"https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80",active:false},
];

const MOCK_PLAYERS = [
  {id:1,name:"CryptoKing_92",  avatar:"👑",coins:142800,totalWon:98400,bets:312,winRate:61,badge:"🔥",country:"🇫🇷"},
  {id:2,name:"NightRacer",     avatar:"🌙",coins:89200, totalWon:54100,bets:201,winRate:55,badge:"⚡",country:"🇧🇷"},
  {id:3,name:"TrafficOracle",  avatar:"🔮",coins:76500, totalWon:41200,bets:178,winRate:58,badge:"🎯",country:"🇩🇪"},
  {id:4,name:"ShibuyaBet",     avatar:"🗼",coins:65400, totalWon:38900,bets:256,winRate:49,badge:"🚀",country:"🇯🇵"},
  {id:5,name:"CoinsHunter",    avatar:"💎",coins:52100, totalWon:29800,bets:134,winRate:53,badge:"💰",country:"🇺🇸"},
  {id:6,name:"StreetProphet",  avatar:"🛸",coins:48700, totalWon:24100,bets:98, winRate:57,badge:"🌟",country:"🇪🇸"},
];

const MOCK_WINS = [
  {user:"CryptoKing_92",  flag:"🇫🇷",amount:4200, bet:"Rush Soir · 11+ véh.",  time:"2min"},
  {user:"NightRacer",     flag:"🇧🇷",amount:1850, bet:"Nuit · Moto détectée",  time:"5min"},
  {user:"TrafficOracle",  flag:"🇩🇪",amount:3100, bet:"Déjeuner · Vélo rouge", time:"8min"},
  {user:"ShibuyaBet",     flag:"🇯🇵",amount:920,  bet:"Matin · Voiture noire", time:"11min"},
  {user:"CoinsHunter",    flag:"🇺🇸",amount:5500, bet:"Rush · Camion",         time:"14min"},
  {user:"StreetProphet",  flag:"🇪🇸",amount:2200, bet:"Soir · 5–10 véh.",      time:"18min"},
];

const MOCK_FEED = [
  {user:"CryptoKing_92",  flag:"🇫🇷",action:"a gagné",  amount:4200, bet:"11+ véhicules", time:"il y a 2min",  won:true},
  {user:"NightRacer",     flag:"🇧🇷",action:"a misé",    amount:500,  bet:"Moto",          time:"il y a 3min",  won:null},
  {user:"TrafficOracle",  flag:"🇩🇪",action:"a gagné",   amount:3100, bet:"Vélo rouge",    time:"il y a 5min",  won:true},
  {user:"ShibuyaBet",     flag:"🇯🇵",action:"a perdu",   amount:200,  bet:"Voiture blanc",  time:"il y a 7min",  won:false},
  {user:"CoinsHunter",    flag:"🇺🇸",action:"a gagné",   amount:5500, bet:"Camion",        time:"il y a 9min",  won:true},
  {user:"StreetProphet",  flag:"🇪🇸",action:"a perdu",   amount:1000, bet:"0–4 véhicules", time:"il y a 12min", won:false},
  {user:"CryptoKing_92",  flag:"🇫🇷",action:"a gagné",   amount:800,  bet:"Voiture rouge", time:"il y a 15min", won:true},
];

const CRYPTO_OPTIONS = [
  {id:"btc",  name:"Bitcoin",  symbol:"BTC",  icon:"₿",  color:"#f7931a", addr:"bc1qxy2kgdygjrsqtzq2n0yrf249"},
  {id:"eth",  name:"Ethereum", symbol:"ETH",  icon:"Ξ",  color:"#627eea", addr:"0x742d35Cc6634C0532925a3b8D4C9"},
  {id:"usdt", name:"Tether",   symbol:"USDT", icon:"₮",  color:"#26a17b", addr:"TQn9Y2khEsLJW1ChVWFMSMeRDow5"},
  {id:"bnb",  name:"BNB",      symbol:"BNB",  icon:"◈",  color:"#f3ba2f", addr:"bnb1grpf0955h0ykzq3ar6ze596"},
  {id:"sol",  name:"Solana",   symbol:"SOL",  icon:"◎",  color:"#9945ff", addr:"7xKXtg2CW87d97TXJSDpbD5jBkheTqA"},
];

const LABELS = {
  vehicle_count:{low:"0–4 véh.",mid:"5–10 véh.",high:"11+ véh."},
  vehicle_color:{black:"Noir",white:"Blanc",red:"Rouge",other:"Autre"},
  vehicle_type: {car:"Voiture",bike:"Vélo",moto:"Moto",truck:"Camion"},
};
const BET_CONFIG = [
  {type:"vehicle_count",label:"Nombre de véhicules",icon:"🚗",keys:["low","mid","high"],          probKey:"countProbs",probIdx:{low:0,mid:1,high:2}},
  {type:"vehicle_color",label:"Couleur du prochain",icon:"🎨",keys:["black","white","red","other"],probKey:"colorProbs",probIdx:{black:0,white:1,red:2,other:3}},
  {type:"vehicle_type", label:"Type de véhicule",   icon:"🚌",keys:["car","bike","moto","truck"],  probKey:"typeProbs", probIdx:{car:0,bike:1,moto:2,truck:3}},
];

// ─── MOTEUR TEMPOREL ─────────────────────────────────────────────────────────
function getTrafficProfile() {
  const now=new Date(), h=now.getHours()+now.getMinutes()/60;
  const dow=now.getDay(), isWeekend=dow===0||dow===6;
  const days=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  let p;
  if(!isWeekend){
    if(h<5.5)  p={name:"Nuit profonde",  icon:"🌙",color:"#7c6fcd",intensity:0.05,countProbs:[0.75,0.20,0.05],colorProbs:[0.35,0.30,0.05,0.30],typeProbs:[0.40,0.05,0.25,0.30],dur:45};
    else if(h<7)    p={name:"Aube",           icon:"🌅",color:"#f5a442",intensity:0.25,countProbs:[0.55,0.35,0.10],colorProbs:[0.30,0.30,0.08,0.32],typeProbs:[0.45,0.10,0.15,0.30],dur:35};
    else if(h<9.5)  p={name:"Rush Matin",     icon:"🚗💨",color:"#ff3b5c",intensity:0.95,countProbs:[0.05,0.30,0.65],colorProbs:[0.32,0.32,0.10,0.26],typeProbs:[0.80,0.05,0.10,0.05],dur:18};
    else if(h<12)   p={name:"Matinée",        icon:"☀️",color:"#f5c842",intensity:0.55,countProbs:[0.25,0.50,0.25],colorProbs:[0.30,0.30,0.10,0.30],typeProbs:[0.60,0.10,0.12,0.18],dur:28};
    else if(h<14)   p={name:"Déjeuner",       icon:"🍽️",color:"#ff9a3c",intensity:0.70,countProbs:[0.15,0.45,0.40],colorProbs:[0.28,0.28,0.12,0.32],typeProbs:[0.55,0.22,0.15,0.08],dur:22};
    else if(h<17)   p={name:"Après-midi",     icon:"🌤️",color:"#00e5ff",intensity:0.50,countProbs:[0.28,0.48,0.24],colorProbs:[0.30,0.28,0.10,0.32],typeProbs:[0.62,0.12,0.14,0.12],dur:30};
    else if(h<18)   p={name:"Pré-Rush Soir",  icon:"⚡",color:"#ff7c3c",intensity:0.80,countProbs:[0.10,0.38,0.52],colorProbs:[0.31,0.30,0.10,0.29],typeProbs:[0.72,0.08,0.12,0.08],dur:20};
    else if(h<20)   p={name:"Rush Soir",      icon:"🚗💨",color:"#ff3b5c",intensity:1.00,countProbs:[0.03,0.22,0.75],colorProbs:[0.33,0.32,0.09,0.26],typeProbs:[0.82,0.04,0.10,0.04],dur:15};
    else if(h<23)   p={name:"Soirée",         icon:"🌆",color:"#a78bfa",intensity:0.35,countProbs:[0.45,0.40,0.15],colorProbs:[0.28,0.25,0.15,0.32],typeProbs:[0.65,0.08,0.20,0.07],dur:38};
    else            p={name:"Nuit tardive",   icon:"🌙",color:"#7c6fcd",intensity:0.12,countProbs:[0.70,0.25,0.05],colorProbs:[0.30,0.25,0.10,0.35],typeProbs:[0.45,0.05,0.30,0.20],dur:42};
  } else {
    if(h<9)   p={name:"Weekend Matin",   icon:"😴",color:"#7c6fcd",intensity:0.08,countProbs:[0.80,0.17,0.03],colorProbs:[0.25,0.28,0.10,0.37],typeProbs:[0.35,0.30,0.15,0.20],dur:48};
    else if(h<13) p={name:"Weekend Shop", icon:"🛍️",color:"#f5c842",intensity:0.50,countProbs:[0.30,0.48,0.22],colorProbs:[0.27,0.28,0.12,0.33],typeProbs:[0.50,0.30,0.12,0.08],dur:28};
    else if(h<20) p={name:"Weekend Soir", icon:"🎉",color:"#ff9a3c",intensity:0.60,countProbs:[0.20,0.50,0.30],colorProbs:[0.28,0.26,0.15,0.31],typeProbs:[0.60,0.15,0.18,0.07],dur:25};
    else          p={name:"Weekend Nuit", icon:"🎊",color:"#a78bfa",intensity:0.20,countProbs:[0.55,0.35,0.10],colorProbs:[0.25,0.22,0.18,0.35],typeProbs:[0.55,0.05,0.35,0.05],dur:40};
  }
  const toOdds=prob=>Math.max(1.05,+((1/(prob*0.88)).toFixed(2)));
  const [pL,pM,pH]=p.countProbs,[pBk,pWh,pRe,pOt]=p.colorProbs,[pCa,pBi,pMo,pTr]=p.typeProbs;
  p.odds={
    vehicle_count:{low:toOdds(pL),mid:toOdds(pM),high:toOdds(pH)},
    vehicle_color:{black:toOdds(pBk),white:toOdds(pWh),red:toOdds(pRe),other:toOdds(pOt)},
    vehicle_type: {car:toOdds(pCa),bike:toOdds(pBi),moto:toOdds(pMo),truck:toOdds(pTr)},
  };
  p.isWeekend=isWeekend;
  p.time=now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  p.day=days[dow];
  return p;
}

function pickRandom(arr,probs){const r=Math.random();let a=0;for(let i=0;i<arr.length;i++){a+=probs[i];if(r<a)return arr[i];}return arr[0];}

function generateResult(profile){
  const cId=pickRandom(["low","mid","high"],profile.countProbs);
  const rawCount=cId==="low"?Math.floor(Math.random()*5):cId==="mid"?5+Math.floor(Math.random()*6):11+Math.floor(Math.random()*10);
  const colorId=pickRandom(["black","white","red","other"],profile.colorProbs);
  const typeId=pickRandom(["car","bike","moto","truck"],profile.typeProbs);
  return{vehicle_count:cId,vehicle_color:colorId,vehicle_type:typeId,raw:{count:rawCount,color:colorId,type:typeId}};
}

const BET_RATIO=0.60;

// ─── MICRO-COMPOSANTS ─────────────────────────────────────────────────────────
function LiveBadge(){
  return(
    <span style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,59,92,0.15)",border:"1px solid var(--red)",borderRadius:4,padding:"2px 8px",fontSize:11,fontFamily:"'DM Mono',monospace",color:"var(--red)",letterSpacing:2}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:"var(--red)",animation:"pulse-live 1.2s infinite"}}/>LIVE
    </span>
  );
}

function Btn({children,onClick,variant="primary",small,style={}}){
  const base={border:"none",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:700,letterSpacing:0.5,borderRadius:9,transition:"opacity 0.2s"};
  const variants={
    primary:{background:"linear-gradient(135deg,var(--accent),#0090a8)",color:"#000",padding:small?"7px 14px":"11px 22px",fontSize:small?11:13},
    ghost:{background:"transparent",border:"1px solid var(--border)",color:"var(--muted)",padding:small?"6px 12px":"10px 20px",fontSize:small?11:13},
    gold:{background:"linear-gradient(135deg,var(--gold),#c8a000)",color:"#000",padding:small?"7px 14px":"11px 22px",fontSize:small?11:13},
    danger:{background:"rgba(255,59,92,0.15)",border:"1px solid var(--red)",color:"var(--red)",padding:small?"6px 12px":"10px 20px",fontSize:small?11:13},
  };
  return <button onClick={onClick} style={{...base,...variants[variant],...style}}>{children}</button>;
}

function Ticker({history}){
  if(!history.length) return null;
  const d=[...history,...history];
  return(
    <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",overflow:"hidden",height:28,display:"flex",alignItems:"center"}}>
      <div style={{display:"flex",gap:40,animation:"ticker 40s linear infinite",whiteSpace:"nowrap"}}>
        {d.map((h,i)=>(
          <span key={i} style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:h.won?"var(--green)":"var(--muted)",flexShrink:0}}>
            {h.won?"✅":"❌"} {h.user} · {h.label} · {h.won?`+${h.gain?.toFixed(0)}`:`-${h.stake}`} coins
          </span>
        ))}
      </div>
    </div>
  );
}

function CountdownRing({timeLeft,total,phaseColor}){
  const r=28,circ=2*Math.PI*r,pct=timeLeft/total;
  return(
    <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
      <svg width="72" height="72" style={{transform:"rotate(-90deg)"}}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth={4}/>
        <circle cx="36" cy="36" r={r} fill="none" stroke={phaseColor} strokeWidth={4}
          strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 0.5s linear,stroke 0.3s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:500,color:phaseColor,animation:timeLeft<=5?"flash 0.5s infinite":"none"}}>{timeLeft}</span>
        <span style={{fontSize:8,color:"var(--muted)",letterSpacing:1}}>SEC</span>
      </div>
    </div>
  );
}

function BetCard({cfg,phase,profile,selectedBet,onSelect,placedBets,t}){
  const isOpen=phase==="bet";
  return(
    <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14,animation:"glow-in 0.4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
        <span style={{fontSize:16}}>{cfg.icon}</span>
        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:11}}>{cfg.label}</span>
        {!isOpen&&<span style={{marginLeft:"auto",fontSize:9,color:"var(--red)",fontFamily:"'DM Mono',monospace",background:"rgba(255,59,92,0.1)",padding:"1px 5px",borderRadius:3,letterSpacing:1}}>FERMÉ</span>}
      </div>
      {cfg.keys.map(key=>{
        const isSel=selectedBet?.type===cfg.type&&selectedBet?.optId===key;
        const isPlaced=placedBets.find(b=>b.type===cfg.type&&b.optId===key);
        const prob=profile[cfg.probKey][cfg.probIdx[key]];
        const odds=profile.odds[cfg.type][key];
        return(
          <button key={key} disabled={!isOpen} onClick={()=>onSelect(cfg.type,key,odds)}
            style={{display:"flex",flexDirection:"column",gap:3,width:"100%",padding:"7px 9px",marginBottom:4,borderRadius:7,
              border:`1px solid ${isSel?"var(--accent)":isPlaced?"var(--gold)":"var(--border)"}`,
              background:isSel?"rgba(0,229,255,0.08)":isPlaced?"rgba(245,200,66,0.05)":"var(--surface)",
              cursor:isOpen?"pointer":"not-allowed",opacity:isOpen?1:0.5,transition:"all 0.2s",textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:isSel?"var(--accent)":"var(--text)"}}>{LABELS[cfg.type][key]}</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {isPlaced&&<span style={{fontSize:9,color:"var(--gold)",fontFamily:"'DM Mono',monospace"}}>✓</span>}
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:500,color:"var(--gold)"}}>×{odds}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{flex:1,height:3,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${prob*100}%`,background:profile.color,borderRadius:2,transition:"width 1s ease",opacity:0.75}}/>
              </div>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--muted)",minWidth:26}}>{Math.round(prob*100)}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ResultModal({result,bets,profile,onClose,t}){
  const won=bets.reduce((s,b)=>s+(result[b.type]===b.optId?b.stake*b.odds:0),0);
  const staked=bets.reduce((s,b)=>s+b.stake,0);
  const net=won-staked;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"var(--card)",border:`2px solid ${net>=0?"var(--green)":"var(--red)"}`,borderRadius:20,padding:30,maxWidth:420,width:"90%",animation:"glow-in 0.3s ease",boxShadow:`0 0 80px ${net>=0?"rgba(0,230,118,0.15)":"rgba(255,59,92,0.15)"}`}}>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{fontSize:48,marginBottom:6,animation:"float 2s infinite"}}>{net>=0?"🏆":"💸"}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,letterSpacing:2,color:net>=0?"var(--green)":"var(--red)"}}>{net>=0?t.won:t.lost}</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:26,color:net>=0?"var(--green)":"var(--red)",marginTop:3,animation:"count-up 0.5s ease"}}>{net>=0?"+":""}{net.toFixed(0)} coins</div>
        </div>
        <div style={{background:"rgba(0,229,255,0.04)",border:"1px solid rgba(0,229,255,0.1)",borderRadius:8,padding:9,marginBottom:12,fontSize:10,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>
          🤖 IA [{profile.name} · {profile.time}] — {result.raw.count} véh. · {LABELS.vehicle_color[result.raw.color]} · {LABELS.vehicle_type[result.raw.type]}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:18}}>
          {bets.map((b,i)=>{
            const w=result[b.type]===b.optId;
            return(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:"var(--surface)",borderRadius:7,border:`1px solid ${w?"rgba(0,230,118,0.3)":"rgba(255,59,92,0.2)"}`}}>
                <div><div style={{fontSize:9,color:"var(--muted)"}}>{BET_CONFIG.find(c=>c.type===b.type)?.label}</div><div style={{fontSize:12}}>{LABELS[b.type][b.optId]}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontFamily:"'DM Mono',monospace",color:w?"var(--green)":"var(--red)",fontSize:12}}>{w?`+${(b.stake*b.odds).toFixed(0)}`:`-${b.stake}`}</div><div style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>×{b.odds}</div></div>
              </div>
            );
          })}
        </div>
        <Btn onClick={onClose} style={{width:"100%"}}>{t.nextRound}</Btn>
      </div>
    </div>
  );
}

// ─── PAGE ACCUEIL ─────────────────────────────────────────────────────────────
function HomePage({t,onPlay,profile}){
  const [counter,setCounter]=useState({players:12847,bets:3241092,paid:"4.2M"});
  return(
    <div style={{gridColumn:"1/-1",animation:"glow-in 0.4s ease"}}>

      {/* HERO */}
      <div style={{position:"relative",borderRadius:20,overflow:"hidden",marginBottom:24,minHeight:380,display:"flex",alignItems:"center"}}>
        <img src={CAMERAS[0].url} alt="hero" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.25}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(8,11,16,0.95) 40%,rgba(0,229,255,0.08))"}}/>
        {/* Decorative grid */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",backgroundSize:"40px 40px",opacity:0.15}}/>
        <div style={{position:"relative",padding:"40px 48px",maxWidth:640}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <LiveBadge/>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"var(--muted)",letterSpacing:2}}>{profile.icon} {profile.name} · {profile.time}</span>
          </div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:62,letterSpacing:3,lineHeight:1.05,marginBottom:16,color:"var(--text)"}}>
            {t.tagline.split(" ").map((w,i)=>
              w==="réel,"||w==="real,"||w==="real."||w==="vivo."||w==="real"
                ?<span key={i} style={{color:"var(--accent)"}}>{w} </span>
                :<span key={i}>{w} </span>
            )}
          </h1>
          <p style={{fontSize:15,color:"var(--muted)",marginBottom:28,lineHeight:1.6}}>{t.subtitle}</p>
          <div style={{display:"flex",gap:12}}>
            <Btn onClick={onPlay}>{t.playNow} 🚀</Btn>
            <Btn variant="ghost">{t.howIt}</Btn>
          </div>
        </div>
        {/* Live cam preview */}
        <div style={{position:"absolute",right:40,top:"50%",transform:"translateY(-50%)",width:240,display:"flex",flexDirection:"column",gap:8}}>
          {CAMERAS.filter(c=>c.active).map(c=>(
            <div key={c.id} style={{position:"relative",borderRadius:10,overflow:"hidden",border:"1px solid var(--border)",aspectRatio:"16/9"}}>
              <img src={c.url} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.7}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.8))"}}/>
              <div style={{position:"absolute",top:5,left:5}}><LiveBadge/></div>
              <div style={{position:"absolute",bottom:5,left:8,fontSize:10,fontFamily:"'DM Mono',monospace",color:"var(--text)"}}>{c.location}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
        {[
          {label:"Joueurs actifs",value:counter.players.toLocaleString(),icon:"👥",color:"var(--accent)"},
          {label:"Paris joués",   value:counter.bets.toLocaleString(),  icon:"🎯",color:"var(--gold)"},
          {label:"Gains versés",  value:counter.paid+" coins",          icon:"💰",color:"var(--green)"},
        ].map((s,i)=>(
          <div key={i} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:28}}>{s.icon}</span>
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:1,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:"var(--muted)"}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:24,marginBottom:24}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:3,marginBottom:20,color:"var(--accent)"}}>{t.howIt}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[
            {icon:"📡",title:t.step1t,desc:t.step1d,color:"var(--accent)"},
            {icon:"🎯",title:t.step2t,desc:t.step2d,color:"var(--gold)"},
            {icon:"🤖",title:t.step3t,desc:t.step3d,color:"#a78bfa"},
            {icon:"💰",title:t.step4t,desc:t.step4d,color:"var(--green)"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:"16px 12px",background:"var(--surface)",borderRadius:12,border:`1px solid ${s.color}30`,position:"relative"}}>
              <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",width:24,height:24,borderRadius:"50%",background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#000",fontFamily:"'DM Mono',monospace"}}>{i+1}</div>
              <div style={{fontSize:32,marginBottom:8,marginTop:8}}>{s.icon}</div>
              <div style={{fontWeight:700,fontSize:13,color:s.color,marginBottom:5}}>{s.title}</div>
              <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.5}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT WINS */}
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:3,marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          {t.recentWins} <span style={{fontSize:14,color:"var(--muted)",fontFamily:"'Syne',sans-serif",fontWeight:400,letterSpacing:0}}>dernières 30 minutes</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {MOCK_WINS.map((w,i)=>(
            <div key={i} style={{background:"var(--card)",border:"1px solid rgba(0,230,118,0.2)",borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:12,animation:`glow-in ${0.1+i*0.05}s ease`}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{w.flag}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:12,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.user}</div>
                <div style={{fontSize:10,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.bet}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'DM Mono',monospace",color:"var(--green)",fontWeight:700,fontSize:15}}>+{w.amount.toLocaleString()}</div>
                <div style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{w.time} ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{background:"linear-gradient(135deg,rgba(0,229,255,0.08),rgba(245,200,66,0.05))",border:"1px solid rgba(0,229,255,0.2)",borderRadius:16,padding:"28px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,marginBottom:6}}>{t.joinNow}</div>
          <div style={{fontSize:12,color:"var(--muted)"}}>5 000 coins offerts à l'inscription • Dépôt crypto disponible</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost">{t.login}</Btn>
          <Btn variant="gold">{t.register} →</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE COMMUNAUTÉ ──────────────────────────────────────────────────────────
function CommunityPage({t}){
  const [activePlayer,setActivePlayer]=useState(null);
  return(
    <div style={{gridColumn:"1/-1",animation:"glow-in 0.4s ease"}}>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,marginBottom:4}}>{t.community}</div>
      <div style={{fontSize:11,color:"var(--muted)",marginBottom:20}}>Classement mondial en temps réel • {MOCK_PLAYERS.length.toLocaleString()} membres actifs</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* TOP JOUEURS */}
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,marginBottom:12,color:"var(--accent)"}}>{t.topPlayers}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {MOCK_PLAYERS.map((p,i)=>(
              <div key={p.id} onClick={()=>setActivePlayer(activePlayer?.id===p.id?null:p)}
                style={{background:"var(--card)",border:`1px solid ${activePlayer?.id===p.id?"var(--accent)":"var(--border)"}`,borderRadius:12,padding:14,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:12}}>
                {/* Rang */}
                <div style={{width:28,height:28,borderRadius:"50%",background:i===0?"linear-gradient(135deg,#f5c842,#c8a000)":i===1?"linear-gradient(135deg,#aaa,#666)":i===2?"linear-gradient(135deg,#cd7f32,#8b4513)":"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:i<3?"#000":"var(--muted)",flexShrink:0}}>
                  {i+1}
                </div>
                {/* Avatar */}
                <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(0,229,255,0.1)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{p.avatar}</div>
                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontWeight:700,fontSize:13}}>{p.name}</span>
                    <span>{p.flag}</span>
                    <span style={{fontSize:12}}>{p.badge}</span>
                  </div>
                  <div style={{display:"flex",gap:12,fontSize:10,color:"var(--muted)"}}>
                    <span>{p.bets} paris</span>
                    <span style={{color:"var(--green)"}}>{p.winRate}% victoires</span>
                  </div>
                </div>
                {/* Coins */}
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)",fontSize:14,fontWeight:500}}>{p.coins.toLocaleString()}</div>
                  <div style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>coins</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DROITE : profil sélectionné + activité */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Profil joueur sélectionné */}
          {activePlayer?(
            <div style={{background:"var(--card)",border:"1px solid var(--accent)",borderRadius:14,padding:20,animation:"glow-in 0.3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(0,229,255,0.1)",border:"2px solid var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>{activePlayer.avatar}</div>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1}}>{activePlayer.name} {activePlayer.flag}</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{activePlayer.badge} Membre actif</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {[
                  {label:t.totalWon,   value:`${activePlayer.totalWon.toLocaleString()} coins`, color:"var(--green)"},
                  {label:t.totalBets,  value:activePlayer.bets,                                  color:"var(--accent)"},
                  {label:t.winRate,    value:`${activePlayer.winRate}%`,                          color:"var(--gold)"},
                  {label:"Solde",      value:`${activePlayer.coins.toLocaleString()} coins`,      color:"var(--text)"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"var(--surface)",borderRadius:9,padding:10,border:"1px solid var(--border)"}}>
                    <div style={{fontSize:9,color:"var(--muted)",marginBottom:3}}>{s.label}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,color:s.color,fontWeight:500}}>{s.value}</div>
                  </div>
                ))}
              </div>
              {/* Barre de victoire */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)",marginBottom:4}}><span>Taux de victoire</span><span style={{color:"var(--gold)"}}>{activePlayer.winRate}%</span></div>
                <div style={{height:6,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${activePlayer.winRate}%`,background:"linear-gradient(90deg,var(--gold),var(--green))",borderRadius:3}}/>
                </div>
              </div>
            </div>
          ):(
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:24,textAlign:"center",color:"var(--muted)"}}>
              <div style={{fontSize:32,marginBottom:8}}>👆</div>
              <div style={{fontSize:13}}>Clique sur un joueur pour voir son profil</div>
            </div>
          )}

          {/* Fil d'activité */}
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:16,flex:1}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,marginBottom:12,color:"var(--text)"}}>{t.recentActivity}</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:320,overflowY:"auto"}}>
              {MOCK_FEED.map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"var(--surface)",borderRadius:8,border:`1px solid ${f.won===true?"rgba(0,230,118,0.15)":f.won===false?"rgba(255,59,92,0.1)":"var(--border)"}`,animation:`glow-in ${0.05*i}s ease`}}>
                  <span style={{fontSize:16,flexShrink:0}}>{f.flag}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontWeight:600,fontSize:11}}>{f.user}</span>
                    <span style={{fontSize:11,color:"var(--muted)"}}> {f.action} </span>
                    <span style={{fontSize:11,color:f.won===true?"var(--green)":f.won===false?"var(--red)":"var(--accent)",fontWeight:600}}>{f.won===true?"+":f.won===false?"-":""}{f.amount} coins</span>
                    <div style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace",marginTop:1}}>{f.bet}</div>
                  </div>
                  <span style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace",flexShrink:0}}>{f.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DÉPÔT CRYPTO ────────────────────────────────────────────────────────────
function CryptoDepositModal({t,onClose,onDeposit}){
  const [step,setStep]=useState("choose"); // choose | address | confirm
  const [sel,setSel]=useState(null);
  const [amount,setAmount]=useState("50");
  const [copied,setCopied]=useState(false);
  const [loading,setLoading]=useState(false);

  const handleCopy=()=>{
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };
  const handleConfirm=()=>{
    setLoading(true);
    setTimeout(()=>{onDeposit(parseFloat(amount)||0,sel);setLoading(false);onClose();},1500);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,padding:28,maxWidth:400,width:"90%",animation:"glow-in 0.3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2}}>{t.crypto} {t.deposit}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:20}}>✕</button>
        </div>

        {step==="choose"&&(
          <>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:14}}>{t.cryptoDesc}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {CRYPTO_OPTIONS.map(c=>(
                <button key={c.id} onClick={()=>{setSel(c);setStep("address");}}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:sel?.id===c.id?"rgba(0,229,255,0.06)":"var(--surface)",border:`1px solid ${sel?.id===c.id?"var(--accent)":"var(--border)"}`,borderRadius:10,cursor:"pointer",transition:"all 0.2s",textAlign:"left"}}>
                  <span style={{fontSize:22,color:c.color,fontWeight:700,width:28,flexShrink:0}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                    <div style={{fontSize:10,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{c.symbol}</div>
                  </div>
                  <span style={{fontSize:12,color:"var(--muted)"}}>→</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step==="address"&&sel&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 14px",background:"var(--surface)",borderRadius:10,border:"1px solid var(--border)"}}>
              <span style={{fontSize:24,color:sel.color}}>{sel.icon}</span>
              <div><div style={{fontWeight:700}}>{sel.name}</div><div style={{fontSize:10,color:"var(--muted)"}}>{sel.symbol}</div></div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:"var(--muted)",marginBottom:6,letterSpacing:1}}>ADRESSE DE DÉPÔT {sel.symbol}</div>
              <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:12,fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--accent)",wordBreak:"break-all",marginBottom:8}}>{sel.addr}</div>
              <Btn small variant="ghost" onClick={handleCopy} style={{width:"100%"}}>{copied?t.copied:`📋 ${t.copyAddr}`}</Btn>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:"var(--muted)",marginBottom:6,letterSpacing:1}}>MONTANT ({sel.symbol})</div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>
                {["0.01","0.05","0.1","0.5"].map(v=>(
                  <button key={v} onClick={()=>setAmount(v)} style={{flex:1,padding:"6px",border:`1px solid ${amount===v?"var(--accent)":"var(--border)"}`,background:amount===v?"rgba(0,229,255,0.1)":"var(--surface)",borderRadius:6,color:amount===v?"var(--accent)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer"}}>{v}</button>
                ))}
              </div>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none"}}/>
            </div>
            <div style={{background:"rgba(245,200,66,0.06)",border:"1px solid rgba(245,200,66,0.2)",borderRadius:8,padding:9,marginBottom:14,fontSize:10,color:"var(--gold)",fontFamily:"'DM Mono',monospace"}}>
              ≈ {Math.round(parseFloat(amount||0)*100000)} coins crédités • Confirmations réseau : ~3 min
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" onClick={()=>setStep("choose")} style={{flex:1}}>← Retour</Btn>
              <Btn onClick={handleConfirm} style={{flex:2}}>
                {loading?<span style={{display:"inline-block",animation:"spin 0.8s linear infinite"}}>⟳</span>:`${t.confirm} →`}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PAGE ADMIN ───────────────────────────────────────────────────────────────
function AdminPage({profile,history}){
  const timeline24=[0.05,0.05,0.05,0.05,0.05,0.15,0.25,0.70,0.95,0.85,0.60,0.65,0.70,0.65,0.55,0.60,0.75,0.85,1.0,0.85,0.50,0.35,0.20,0.10];
  const currentHour=new Date().getHours();
  return(
    <div style={{gridColumn:"1/-1",animation:"glow-in 0.4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3}}>⚙️ ADMIN PANEL</div>
        <span style={{background:"rgba(255,59,92,0.15)",border:"1px solid var(--red)",borderRadius:6,padding:"3px 10px",fontSize:10,color:"var(--red)",fontFamily:"'DM Mono',monospace",letterSpacing:1}}>ACCÈS RESTREINT</span>
      </div>
      <div style={{fontSize:11,color:"var(--muted)",marginBottom:20}}>Moteur IA temporel · Gestion des profils de trafic · Statistiques avancées</div>

      {/* Profil actif */}
      <div style={{background:`linear-gradient(135deg,${profile.color}20,transparent)`,border:`2px solid ${profile.color}60`,borderRadius:14,padding:18,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <span style={{fontSize:32}}>{profile.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,color:profile.color}}>{profile.name}</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>{profile.day} · {profile.time} · Intensité {Math.round(profile.intensity*100)}% · Round {profile.dur}s</div>
          </div>
          <div style={{background:`${profile.color}20`,border:`1px solid ${profile.color}50`,borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace",marginBottom:2}}>ROUND DUR.</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:profile.color}}>{profile.dur}s</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {type:"vehicle_count",label:"Nombre véh.",keys:["low","mid","high"],     probs:profile.countProbs},
            {type:"vehicle_color",label:"Couleur",    keys:["black","white","red","other"],probs:profile.colorProbs},
            {type:"vehicle_type", label:"Type",       keys:["car","bike","moto","truck"],  probs:profile.typeProbs},
          ].map(g=>(
            <div key={g.type} style={{background:"var(--card)",borderRadius:9,padding:10,border:"1px solid var(--border)"}}>
              <div style={{fontSize:10,color:"var(--muted)",marginBottom:7}}>{g.label}</div>
              {g.keys.map((key,ki)=>{
                const prob=g.probs[ki];
                const odds=profile.odds[g.type][key];
                return(
                  <div key={key} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                    <span style={{fontSize:9,color:"var(--text)",width:52,flexShrink:0}}>{LABELS[g.type][key]}</span>
                    <div style={{flex:1,height:3,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${prob*100}%`,background:profile.color,borderRadius:2}}/>
                    </div>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"var(--muted)",width:22}}>{Math.round(prob*100)}%</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--gold)",width:34}}>×{odds}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14,marginBottom:16}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,marginBottom:12}}>TIMELINE 24H · INTENSITÉ TRAFIC</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:2,height:64}}>
          {timeline24.map((v,h)=>{
            const isNow=h===currentHour;
            const barColor=isNow?"var(--accent)":v>0.7?"var(--red)":v>0.4?"var(--gold)":"var(--muted)";
            return(
              <div key={h} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{width:"100%",height:`${v*52}px`,borderRadius:"2px 2px 0 0",background:barColor,opacity:isNow?1:0.5,boxShadow:isNow?`0 0 8px ${barColor}`:"none"}}/>
                {(h%4===0||isNow)&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:7,color:isNow?"var(--accent)":"var(--muted)"}}>{h}h</span>}
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:14,marginTop:8,fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>
          {[["var(--red)","Rush >70%"],["var(--gold)","Modéré 40-70%"],["var(--muted)","Calme <40%"],["var(--accent)","Maintenant"]].map(([c,l])=>(
            <span key={l} style={{color:c}}>■ {l}</span>
          ))}
        </div>
      </div>

      {/* Grille profils */}
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,marginBottom:10}}>TOUS LES PROFILS HORAIRES</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
        {[
          {name:"Nuit profonde",icon:"🌙",color:"#7c6fcd",intensity:0.05,hours:"00h–05h30",dur:45},
          {name:"Aube",icon:"🌅",color:"#f5a442",intensity:0.25,hours:"05h30–07h",dur:35},
          {name:"Rush Matin",icon:"🚗💨",color:"#ff3b5c",intensity:0.95,hours:"07h–09h30",dur:18},
          {name:"Matinée",icon:"☀️",color:"#f5c842",intensity:0.55,hours:"09h30–12h",dur:28},
          {name:"Déjeuner",icon:"🍽️",color:"#ff9a3c",intensity:0.70,hours:"12h–14h",dur:22},
          {name:"Après-midi",icon:"🌤️",color:"#00e5ff",intensity:0.50,hours:"14h–17h",dur:30},
          {name:"Pré-Rush",icon:"⚡",color:"#ff7c3c",intensity:0.80,hours:"17h–18h",dur:20},
          {name:"Rush Soir",icon:"🚗💨",color:"#ff3b5c",intensity:1.00,hours:"18h–20h",dur:15},
          {name:"Soirée",icon:"🌆",color:"#a78bfa",intensity:0.35,hours:"20h–23h",dur:38},
          {name:"Weekend",icon:"🛍️",color:"#f5c842",intensity:0.50,hours:"Sam–Dim",dur:28},
        ].map((p,i)=>{
          const isActive=profile.name===p.name;
          return(
            <div key={i} style={{background:"var(--card)",border:`1px solid ${isActive?p.color:"var(--border)"}`,borderRadius:9,padding:10,opacity:isActive?1:0.65,boxShadow:isActive?`0 0 12px ${p.color}30`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                <span style={{fontSize:16}}>{p.icon}</span>
                <div><div style={{fontSize:10,fontWeight:700,color:p.color}}>{p.name}</div><div style={{fontSize:8,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{p.hours}</div></div>
              </div>
              <div style={{height:3,background:"var(--border)",borderRadius:2,overflow:"hidden",marginBottom:4}}>
                <div style={{height:"100%",width:`${p.intensity*100}%`,background:p.color,borderRadius:2}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:8,fontFamily:"'DM Mono',monospace",color:"var(--muted)"}}>
                <span>{Math.round(p.intensity*100)}%</span><span>{p.dur}s</span>
              </div>
              {isActive&&<div style={{marginTop:4,textAlign:"center",fontSize:8,color:p.color,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>▶ ACTIF</div>}
            </div>
          );
        })}
      </div>

      {/* Stats paris */}
      {history.length>0&&(
        <div style={{marginTop:16,background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,marginBottom:10}}>STATISTIQUES SESSION</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {label:"Paris joués",  value:history.length, color:"var(--accent)"},
              {label:"Victoires",    value:history.filter(h=>h.won).length, color:"var(--green)"},
              {label:"Défaites",     value:history.filter(h=>!h.won).length,color:"var(--red)"},
              {label:"Taux victoire",value:`${history.length?Math.round(history.filter(h=>h.won).length/history.length*100):0}%`,color:"var(--gold)"},
            ].map((s,i)=>(
              <div key={i} style={{background:"var(--surface)",borderRadius:8,padding:10,border:"1px solid var(--border)",textAlign:"center"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,color:s.color,fontWeight:500}}>{s.value}</div>
                <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function BetLive(){
  const [lang,setLang]=useState("fr");
  const t=T[lang];
  const [profile,setProfile]=useState(()=>getTrafficProfile());
  const [coins,setCoins]=useState(5000);
  const [realEur,setRealEur]=useState(0);
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
  const [aiLog,setAiLog]=useState([]);
  const [showCrypto,setShowCrypto]=useState(false);
  const [showLang,setShowLang]=useState(false);
  const profileRef=useRef(profile);
  const isAdmin=true; // En prod : vérification JWT/rôle

  useEffect(()=>{
    const id=setInterval(()=>{const p=getTrafficProfile();setProfile(p);profileRef.current=p;},60000);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    const id=setInterval(()=>{
      setTimeLeft(t=>{
        const dur=profileRef.current.dur;
        const bc=Math.floor(dur*BET_RATIO);
        if(t<=1){
          const res=generateResult(profileRef.current);
          setResult(res);setPhase("showResult");
          setAiLog(l=>[`🤖 [${profileRef.current.time}] ${profileRef.current.name} · ${res.raw.count} véh. · ${LABELS.vehicle_color[res.raw.color]} · ${LABELS.vehicle_type[res.raw.type]}`,...l.slice(0,9)]);
          return dur;
        }
        const nt=t-1;
        if(nt===bc)setPhase("closing");
        if(nt===5) setPhase("result");
        return nt;
      });
    },1000);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    if(phase!=="showResult"||!result||!placedBets.length) return;
    let gain=0;
    placedBets.forEach(b=>{
      const w=result[b.type]===b.optId;
      const g=w?b.stake*b.odds:0;
      gain+=g;
      setHistory(h=>[{round:roundNum,label:LABELS[b.type][b.optId],won:w,gain:g,stake:b.stake,user:"Moi",profile:profileRef.current.name},...h.slice(0,49)]);
    });
    if(gain>0) setCoins(c=>c+Math.round(gain));
  },[phase,result]);

  const closeResult=()=>{
    setPhase("bet");setPlacedBets([]);setSelBet(null);setResult(null);
    setRoundNum(n=>n+1);
    const p=getTrafficProfile();setProfile(p);profileRef.current=p;setTimeLeft(p.dur);
  };
  const handleSelect=(type,optId,odds)=>{if(phase!=="bet")return;setSelBet({type,optId,odds});};
  const handlePlace=()=>{
    const stake=parseInt(stakeInput,10);
    if(!selBet||isNaN(stake)||stake<=0||stake>coins)return;
    setCoins(c=>c-stake);setPlacedBets(b=>[...b,{...selBet,stake}]);setSelBet(null);
  };
  const handleCryptoDeposit=(amount,crypto)=>{
    const coins_added=Math.round(amount*100000);
    setCoins(c=>c+coins_added);
    setRealEur(e=>e+amount*100);
  };

  const dur=profile.dur;
  const phaseColor=phase==="bet"?"var(--green)":phase==="closing"?"var(--gold)":"var(--accent)";
  const phaseLabel=phase==="bet"?t.roundOpen:phase==="closing"?t.roundClose:phase==="result"?t.roundAI:t.roundResult;

  const TABS=[
    {id:"home",      label:t.tabs.home},
    {id:"bet",       label:t.tabs.bet},
    {id:"community", label:t.tabs.community},
    {id:"cameras",   label:t.tabs.cameras},
    ...(isAdmin?[{id:"admin",label:t.tabs.admin}]:[]),
  ];

  return(
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>

        {/* HEADER */}
        <header style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"0 20px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:3,color:"var(--accent)",cursor:"pointer"}} onClick={()=>setTab("home")}>BETLIVE</span>
            <span style={{fontSize:10,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>betlive.live</span>
            <LiveBadge/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Lang switcher */}
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowLang(v=>!v)} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px",color:"var(--muted)",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:11}}>{t.lang}</button>
              {showLang&&(
                <div style={{position:"absolute",top:"110%",right:0,background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",zIndex:100,minWidth:120}}>
                  {[["fr","🇫🇷 Français"],["en","🇬🇧 English"],["es","🇪🇸 Español"]].map(([l,label])=>(
                    <button key={l} onClick={()=>{setLang(l);setShowLang(false);}} style={{display:"block",width:"100%",padding:"9px 14px",background:lang===l?"rgba(0,229,255,0.08)":"transparent",border:"none",borderBottom:"1px solid var(--border)",color:lang===l?"var(--accent)":"var(--text)",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:12,textAlign:"left"}}>{label}</button>
                  ))}
                </div>
              )}
            </div>
            {/* Wallet */}
            {[["🪙",coins.toLocaleString(),"var(--gold)"],["💶",realEur.toFixed(0)+"€","var(--green)"]].map(([icon,val,col],i)=>(
              <div key={i} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:5}}>
                <span>{icon}</span><span style={{fontFamily:"'DM Mono',monospace",color:col,fontSize:12,fontWeight:500}}>{val}</span>
              </div>
            ))}
            <Btn small onClick={()=>setShowCrypto(true)} variant="gold">₿ {t.deposit}</Btn>
          </div>
        </header>

        <Ticker history={history}/>

        {/* TABS */}
        <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",display:"flex",padding:"0 20px",overflowX:"auto"}}>
          {TABS.map(({id,label})=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"10px 16px",border:"none",background:"transparent",cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:600,color:tab===id?"var(--accent)":"var(--muted)",borderBottom:tab===id?"2px solid var(--accent)":"2px solid transparent",transition:"color 0.2s",whiteSpace:"nowrap",
              ...(id==="admin"?{color:tab===id?"var(--red)":"rgba(255,59,92,0.5)",borderBottom:tab===id?"2px solid var(--red)":"2px solid transparent"}:{})}}>
              {label}
            </button>
          ))}
        </div>

        {/* MAIN */}
        <main style={{flex:1,display:"grid",gridTemplateColumns:tab==="bet"?"1fr 320px":"1fr",gap:0,maxWidth:1200,width:"100%",margin:"0 auto",padding:16,boxSizing:"border-box"}}>

          {tab==="home"&&<HomePage t={t} onPlay={()=>setTab("bet")} profile={profile}/>}
          {tab==="community"&&<CommunityPage t={t}/>}
          {tab==="admin"&&isAdmin&&<AdminPage profile={profile} history={history}/>}

          {tab==="cameras"&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,marginBottom:14}}>{t.tabs.cameras}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
                {CAMERAS.map(c=>(
                  <div key={c.id} onClick={()=>{setCam(c);setTab("bet");}} style={{position:"relative",borderRadius:12,overflow:"hidden",border:`2px solid ${cam.id===c.id?"var(--accent)":"var(--border)"}`,cursor:"pointer",aspectRatio:"16/9",background:"#000",transition:"border-color 0.2s"}}>
                    <img src={c.url} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",opacity:c.active?0.8:0.3}}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.85))"}}/>
                    <div style={{position:"absolute",bottom:10,left:10}}><div style={{fontWeight:700,fontSize:12}}>{c.name}</div><div style={{fontSize:10,color:"var(--muted)"}}>{c.location}</div></div>
                    <div style={{position:"absolute",top:9,right:9}}>{c.active?<LiveBadge/>:<span style={{background:"rgba(0,0,0,0.7)",padding:"2px 7px",borderRadius:4,fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>HORS LIGNE</span>}</div>
                    {cam.id===c.id&&<div style={{position:"absolute",top:9,left:9,background:"var(--accent)",color:"#000",fontSize:8,fontFamily:"'DM Mono',monospace",padding:"2px 7px",borderRadius:4,fontWeight:700}}>ACTIVE</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="bet"&&(
            <>
              {/* GAUCHE */}
              <div style={{paddingRight:14,display:"flex",flexDirection:"column",gap:12}}>
                {/* Profil banner */}
                <div style={{background:`linear-gradient(135deg,${profile.color}18,transparent)`,border:`1px solid ${profile.color}40`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:24}}>{profile.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1,color:profile.color}}>{profile.name}</span>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--muted)"}}>{profile.day} · {profile.time}</span>
                      {profile.isWeekend&&<span style={{fontSize:9,color:"var(--gold)",background:"rgba(245,200,66,0.1)",padding:"1px 6px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>WEEKEND</span>}
                    </div>
                    <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${profile.intensity*100}%`,background:`linear-gradient(90deg,${profile.color}88,${profile.color})`,borderRadius:2,transition:"width 1s ease"}}/>
                    </div>
                  </div>
                  <div style={{textAlign:"center",padding:"5px 10px",background:`${profile.color}20`,borderRadius:8,border:`1px solid ${profile.color}40`,flexShrink:0}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"var(--muted)",marginBottom:1}}>ROUND</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:17,color:profile.color,fontWeight:500}}>{dur}s</div>
                  </div>
                </div>

                {/* Stream */}
                <div style={{position:"relative",borderRadius:14,overflow:"hidden",border:"1px solid var(--border)",aspectRatio:"16/9",background:"#000"}}>
                  <img src={cam.url} alt={cam.name} style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.8}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.25) 0%,transparent 40%,rgba(8,11,16,0.7) 100%)"}}/>
                  <div style={{position:"absolute",top:10,left:10,display:"flex",gap:8,alignItems:"center"}}>
                    <LiveBadge/>
                    <span style={{background:"rgba(0,0,0,0.6)",padding:"2px 9px",borderRadius:20,fontSize:10,fontFamily:"'DM Mono',monospace",backdropFilter:"blur(4px)"}}>{cam.location} — {cam.name}</span>
                  </div>
                  <div style={{position:"absolute",top:10,right:10,background:`${profile.color}25`,border:`1px solid ${profile.color}70`,borderRadius:7,padding:"3px 9px",fontFamily:"'DM Mono',monospace",fontSize:9,color:profile.color,backdropFilter:"blur(4px)",letterSpacing:1}}>
                    {profile.icon} {phaseLabel}
                  </div>
                  {aiLog[0]&&<div style={{position:"absolute",bottom:10,left:10,right:10,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",borderRadius:8,padding:"5px 9px",fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--accent)",border:"1px solid rgba(0,229,255,0.2)",animation:"glow-in 0.3s ease"}}>{aiLog[0]}</div>}
                  <div style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,0.6)",borderRadius:5,padding:"2px 7px",fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--muted)"}}>ROUND #{roundNum}</div>
                </div>

                {/* Bet cards */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  {BET_CONFIG.map(cfg=>(
                    <BetCard key={cfg.type} cfg={cfg} phase={phase} profile={profile} selectedBet={selBet} onSelect={handleSelect} placedBets={placedBets} t={t}/>
                  ))}
                </div>
              </div>

              {/* DROITE */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {/* Countdown */}
                <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                    <CountdownRing timeLeft={timeLeft} total={dur} phaseColor={phaseColor}/>
                    <div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--muted)",letterSpacing:2,marginBottom:2}}>ROUND #{roundNum}</div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:phaseColor}}>{phaseLabel}</div>
                      <div style={{fontSize:10,color:"var(--muted)",marginTop:1}}>{phase==="bet"?`Fermeture dans ${Math.max(0,timeLeft-Math.floor(dur*BET_RATIO))}s`:phase==="closing"?"Plus de paris":phase==="result"?"Analyse…":""}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:3}}>
                    {[["PARIS","bet"],["FERMETURE","closing"],["RÉSULTAT","result"]].map(([l,p],i)=>(
                      <div key={p} style={{flex:1,height:3,borderRadius:2,background:["bet","closing","result","showResult"].indexOf(phase)>=i?phaseColor:"var(--border)",transition:"background 0.3s"}}/>
                    ))}
                  </div>
                </div>

                {/* Bet slip */}
                <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14,flex:1}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:2,marginBottom:10}}>{t.betSlip}</div>
                  {selBet?(
                    <div style={{animation:"glow-in 0.3s ease"}}>
                      <div style={{background:"rgba(0,229,255,0.06)",border:"1px solid rgba(0,229,255,0.2)",borderRadius:8,padding:9,marginBottom:9}}>
                        <div style={{fontSize:9,color:"var(--muted)",marginBottom:2}}>{BET_CONFIG.find(c=>c.type===selBet.type)?.label}</div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontWeight:600,fontSize:12}}>{LABELS[selBet.type][selBet.optId]}</span>
                          <span style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)",fontSize:14}}>×{selBet.odds}</span>
                        </div>
                      </div>
                      <div style={{marginBottom:9}}>
                        <div style={{fontSize:9,color:"var(--muted)",marginBottom:4,letterSpacing:1}}>{t.stake}</div>
                        <div style={{display:"flex",gap:4,marginBottom:5}}>
                          {[50,100,250,500].map(v=>(
                            <button key={v} onClick={()=>setStakeInput(String(v))} style={{flex:1,padding:"5px 0",border:`1px solid ${stakeInput===String(v)?"var(--accent)":"var(--border)"}`,background:stakeInput===String(v)?"rgba(0,229,255,0.1)":"var(--surface)",borderRadius:5,color:stakeInput===String(v)?"var(--accent)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:9,cursor:"pointer"}}>{v}</button>
                          ))}
                        </div>
                        <input type="number" value={stakeInput} onChange={e=>setStakeInput(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"8px 9px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none"}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)",marginBottom:9}}>
                        <span>{t.potential}</span>
                        <span style={{color:"var(--green)",fontFamily:"'DM Mono',monospace"}}>{(parseInt(stakeInput||0)*selBet.odds).toFixed(0)} coins</span>
                      </div>
                      <Btn onClick={handlePlace} style={{width:"100%",marginBottom:5}}>{t.placeBet}</Btn>
                      <Btn variant="ghost" onClick={()=>setSelBet(null)} style={{width:"100%"}}>{t.cancel}</Btn>
                    </div>
                  ):(
                    <div style={{textAlign:"center",padding:"22px 0",color:"var(--muted)",fontSize:11}}>
                      {placedBets.length===0?<><div style={{fontSize:26,marginBottom:5}}>🎯</div>Sélectionne un pari</>:<><div style={{fontSize:26,marginBottom:5}}>✅</div>Paris placés !</>}
                    </div>
                  )}
                  {placedBets.length>0&&(
                    <div style={{marginTop:10,borderTop:"1px solid var(--border)",paddingTop:8}}>
                      <div style={{fontSize:9,color:"var(--muted)",letterSpacing:1,marginBottom:5}}>{t.inProgress} ({placedBets.length})</div>
                      {placedBets.map((b,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0"}}>
                          <span style={{color:"var(--text)"}}>{LABELS[b.type][b.optId]}</span>
                          <span style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)"}}>{b.stake}×{b.odds}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Historique rapide */}
                {history.length>0&&(
                  <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:12}}>
                    <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,marginBottom:7,fontFamily:"'DM Mono',monospace"}}>DERNIERS ROUNDS</div>
                    {history.slice(0,4).map((h,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0",borderBottom:"1px solid rgba(30,45,69,0.4)"}}>
                        <span style={{color:"var(--muted)"}}>R#{h.round} · {h.label}</span>
                        <span style={{fontFamily:"'DM Mono',monospace",color:h.won?"var(--green)":"var(--red)"}}>{h.won?`+${h.gain.toFixed(0)}`:`-${h.stake}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* MODALS */}
        {showCrypto&&<CryptoDepositModal t={t} onClose={()=>setShowCrypto(false)} onDeposit={handleCryptoDeposit}/>}
        {phase==="showResult"&&result&&placedBets.length>0&&<ResultModal result={result} bets={placedBets} profile={profile} onClose={closeResult} t={t}/>}
        {phase==="showResult"&&placedBets.length===0&&(
          <div style={{position:"fixed",bottom:18,right:18,background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,padding:"9px 14px",zIndex:50,animation:"glow-in 0.3s ease",fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--muted)",display:"flex",alignItems:"center",gap:10}}>
            R#{roundNum} · {result?.raw.count} véh.
            <Btn small onClick={closeResult}>{t.nextRound}</Btn>
          </div>
        )}
      </div>
    </>
  );
}
