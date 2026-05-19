import { useState, useEffect, useRef } from "react";

export default function CrashGame({ coins, setCoins }) {
  const [phase, setPhase] = useState("waiting"); // waiting | flying | crashed
  const [multiplier, setMultiplier] = useState(1.00);
  const [stake, setStake] = useState("100");
  const [betPlaced, setBetPlaced] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutMult, setCashoutMult] = useState(null);
  const [history, setHistory] = useState([2.1,5.4,1.2,8.7,1.1,3.3,1.5,12.4,1.0,2.8]);
  const [countdown, setCountdown] = useState(5);
  const [autoCashout, setAutoCashout] = useState("");
  const [players, setPlayers] = useState([
    {name:"CryptoKing",stake:500,cashedAt:null},
    {name:"NightRacer",stake:200,cashedAt:null},
    {name:"TrafficPro",stake:1000,cashedAt:null},
  ]);
  const intervalRef = useRef(null);
  const crashRef = useRef(null);

  const generateCrash = () => {
    const r = Math.random();
    if (r < 0.33) return 1.0 + Math.random() * 0.5;
    if (r < 0.6)  return 1.5 + Math.random() * 2;
    if (r < 0.85) return 3.5 + Math.random() * 5;
    if (r < 0.95) return 8 + Math.random() * 12;
    return 20 + Math.random() * 80;
  };

  useEffect(() => {
    startCountdown();
    return () => { clearInterval(intervalRef.current); };
  }, []);

  const startCountdown = () => {
    setPhase("waiting");
    setMultiplier(1.00);
    setBetPlaced(false);
    setCashedOut(false);
    setCashoutMult(null);
    setCountdown(5);
    let cd = 5;
    const cdInterval = setInterval(() => {
      cd--;
      setCountdown(cd);
      if (cd <= 0) {
        clearInterval(cdInterval);
        startFlight();
      }
    }, 1000);
  };

  const startFlight = () => {
    const crashAt = generateCrash();
    crashRef.current = crashAt;
    setPhase("flying");
    let mult = 1.00;
    let speed = 0.01;
    intervalRef.current = setInterval(() => {
      mult += speed;
      speed *= 1.003;
      setMultiplier(+mult.toFixed(2));
      // Auto cashout
      if (autoCashout && +autoCashout > 1 && mult >= +autoCashout) {
        handleCashout(mult);
      }
      // Simulate other players cashing out
      setPlayers(prev => prev.map(p => {
        if (!p.cashedAt && Math.random() < 0.02 && mult > 1.5) {
          return { ...p, cashedAt: +mult.toFixed(2) };
        }
        return p;
      }));
      if (mult >= crashAt) {
        clearInterval(intervalRef.current);
        setPhase("crashed");
        setHistory(h => [+crashAt.toFixed(2), ...h.slice(0, 9)]);
        setPlayers(prev => prev.map(p => ({...p, cashedAt: p.cashedAt || null})));
        setTimeout(startCountdown, 3000);
      }
    }, 100);
  };

  const handleBet = () => {
    const s = parseInt(stake);
    if (isNaN(s) || s <= 0 || s > coins || phase !== "waiting") return;
    setCoins(c => c - s);
    setBetPlaced(true);
  };

  const handleCashout = (currentMult) => {
    if (!betPlaced || cashedOut || phase !== "flying") return;
    const s = parseInt(stake);
    const gain = Math.floor(s * (currentMult || multiplier));
    setCoins(c => c + gain);
    setCashedOut(true);
    setCashoutMult(+(currentMult || multiplier).toFixed(2));
    clearInterval(intervalRef.current);
  };

  const multColor = multiplier < 2 ? "#00e676" : multiplier < 5 ? "#f5c842" : multiplier < 10 ? "#ff9a3c" : "#ff3b5c";

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,height:"100%"}}>
      {/* Jeu */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Historique */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {history.map((h,i) => (
            <span key={i} style={{flexShrink:0,padding:"3px 10px",borderRadius:20,fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,background:h<2?"rgba(0,230,118,0.1)":h<5?"rgba(245,200,66,0.1)":"rgba(255,59,92,0.1)",color:h<2?"#00e676":h<5?"#f5c842":"#ff3b5c",border:`1px solid ${h<2?"rgba(0,230,118,0.3)":h<5?"rgba(245,200,66,0.3)":"rgba(255,59,92,0.3)"}`}}>
              {h.toFixed(2)}×
            </span>
          ))}
        </div>

        {/* Zone principale */}
        <div style={{flex:1,background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",minHeight:280}}>
          {/* Grille */}
          <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,229,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.04) 1px,transparent 1px)",backgroundSize:"30px 30px"}}/>

          {phase === "waiting" && (
            <div style={{textAlign:"center",animation:"glow-in 0.3s ease"}}>
              <div style={{fontSize:48,marginBottom:8}}>🚀</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"var(--muted)"}}>PROCHAIN ROUND</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:48,color:"var(--accent)",marginTop:8}}>{countdown}s</div>
            </div>
          )}

          {phase === "flying" && (
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:40,animation:"float 0.5s infinite"}}>🚀</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:72,letterSpacing:2,color:multColor,lineHeight:1,marginTop:8,textShadow:`0 0 30px ${multColor}80`}}>
                {multiplier.toFixed(2)}×
              </div>
              {cashedOut && (
                <div style={{marginTop:8,background:"rgba(0,230,118,0.1)",border:"1px solid rgba(0,230,118,0.3)",borderRadius:10,padding:"8px 20px",animation:"glow-in 0.3s ease"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",color:"#00e676",fontSize:14}}>✅ CASHÉ À {cashoutMult}× · +{Math.floor(parseInt(stake)*cashoutMult)} coins</div>
                </div>
              )}
            </div>
          )}

          {phase === "crashed" && (
            <div style={{textAlign:"center",animation:"glow-in 0.3s ease"}}>
              <div style={{fontSize:48,marginBottom:8}}>💥</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"var(--red)"}}>CRASH</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:48,color:"var(--red)"}}>{multiplier.toFixed(2)}×</div>
            </div>
          )}

          {/* Courbe animée */}
          {phase === "flying" && (
            <svg style={{position:"absolute",bottom:0,left:0,right:0,height:80,opacity:0.3}} viewBox="0 0 400 80">
              <path d={`M 0 80 Q ${Math.min(multiplier*15,200)} ${80-multiplier*8} ${Math.min(multiplier*20,400)} ${Math.max(0,80-multiplier*12)}`} fill="none" stroke={multColor} strokeWidth="2"/>
            </svg>
          )}
        </div>
      </div>

      {/* Panneau droite */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {/* Mise */}
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,marginBottom:10}}>MISE</div>
          <div style={{display:"flex",gap:4,marginBottom:6}}>
            {[50,100,250,500].map(v=>(
              <button key={v} onClick={()=>setStake(String(v))} style={{flex:1,padding:"5px 0",border:`1px solid ${stake===String(v)?"var(--accent)":"var(--border)"}`,background:stake===String(v)?"rgba(0,229,255,0.1)":"var(--surface)",borderRadius:5,color:stake===String(v)?"var(--accent)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:9,cursor:"pointer"}}>{v}</button>
            ))}
          </div>
          <input type="number" value={stake} onChange={e=>setStake(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"8px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none",marginBottom:8}}/>

          <div style={{fontSize:9,color:"var(--muted)",marginBottom:4}}>AUTO CASHOUT (optionnel)</div>
          <input type="number" placeholder="ex: 2.00" value={autoCashout} onChange={e=>setAutoCashout(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"7px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:11,outline:"none",marginBottom:10}}/>

          {!betPlaced ? (
            <button onClick={handleBet} disabled={phase==="flying"||phase==="crashed"}
              style={{width:"100%",padding:11,borderRadius:9,border:"none",background:phase==="waiting"?"linear-gradient(135deg,var(--accent),#0090a8)":"var(--surface)",color:phase==="waiting"?"#000":"var(--muted)",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:phase==="waiting"?"pointer":"not-allowed"}}>
              {phase==="waiting"?`MISER ${stake} COINS`:"ATTENDRE..."}
            </button>
          ) : !cashedOut ? (
            <button onClick={()=>handleCashout()} disabled={phase!=="flying"}
              style={{width:"100%",padding:11,borderRadius:9,border:"none",background:phase==="flying"?"linear-gradient(135deg,#00e676,#00a854)":"var(--surface)",color:phase==="flying"?"#000":"var(--muted)",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:phase==="flying"?"pointer":"not-allowed",animation:phase==="flying"?"pulse-live 1s infinite":"none"}}>
              {phase==="flying"?`CACHER ×${multiplier.toFixed(2)} = +${Math.floor(parseInt(stake)*multiplier)} 🤑`:"EN ATTENTE..."}
            </button>
          ) : (
            <div style={{textAlign:"center",padding:"10px",background:"rgba(0,230,118,0.1)",borderRadius:9,border:"1px solid rgba(0,230,118,0.3)",color:"#00e676",fontFamily:"'DM Mono',monospace",fontSize:12}}>
              ✅ Casé à {cashoutMult}×
            </div>
          )}
        </div>

        {/* Joueurs en direct */}
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14,flex:1}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:2,marginBottom:10}}>JOUEURS</div>
          {players.map((p,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",background:"var(--surface)",borderRadius:7,marginBottom:5,border:`1px solid ${p.cashedAt?"rgba(0,230,118,0.2)":"var(--border)"}`}}>
              <span style={{fontSize:11,fontWeight:600}}>{p.name}</span>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--gold)"}}>{p.stake} coins</div>
                {p.cashedAt && <div style={{fontSize:9,color:"#00e676",fontFamily:"'DM Mono',monospace"}}>✅ {p.cashedAt}×</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
