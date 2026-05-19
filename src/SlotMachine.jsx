import { useState, useEffect, useRef } from "react";

const SYMBOLS = ["🍒","💎","7️⃣","🎰","⭐","🍋","🔔","🍇","🎯","💰"];
const PAYS = {"🍒🍒🍒":3,"🍋🍋🍋":4,"🔔🔔🔔":5,"⭐⭐⭐":8,"🍇🍇🍇":6,"🎯🎯🎯":10,"💰💰💰":15,"🎰🎰🎰":20,"💎💎💎":25,"7️⃣7️⃣7️⃣":50};

function reel(locked){
  if(locked) return locked;
  return SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];
}

function getResult(reels){
  if(reels[0]===reels[1]&&reels[1]===reels[2]) return {win:true,mult:PAYS[reels.join("")||5]};
  if(reels[0]===reels[1]||reels[1]===reels[2]) return {win:true,mult:1.5};
  return {win:false,mult:0};
}

export default function SlotMachine({coins,setCoins}){
  const [reels,setReels]=useState(["🍒","💎","⭐"]);
  const [spinning,setSpinning]=useState(false);
  const [stake,setStake]=useState("100");
  const [lastResult,setLastResult]=useState(null);
  const [history,setHistory]=useState([]);
  const [spinReels,setSpinReels]=useState(["🍒","💎","⭐"]);
  const intervalRef=useRef(null);

  const spin=()=>{
    const s=parseInt(stake);
    if(isNaN(s)||s<=0||s>coins||spinning) return;
    setCoins(c=>c-s);
    setSpinning(true);
    setLastResult(null);
    let count=0;
    const total=20;
    intervalRef.current=setInterval(()=>{
      count++;
      setSpinReels([reel(),reel(),reel()]);
      if(count>=total){
        clearInterval(intervalRef.current);
        // Résultat final
        const finalReels=[reel(),reel(),reel()];
        // 1 chance sur 5 de gain
        let result;
        if(Math.random()<0.2){
          const sym=SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];
          finalReels[0]=sym;finalReels[1]=sym;finalReels[2]=sym;
        } else if(Math.random()<0.35){
          const sym=SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];
          finalReels[Math.random()<0.5?0:2]=sym;
          finalReels[1]=sym;
        }
        setReels(finalReels);
        setSpinReels(finalReels);
        result=getResult(finalReels);
        if(result.win){
          const gain=Math.floor(s*result.mult);
          setCoins(c=>c+gain);
          setLastResult({win:true,gain,mult:result.mult});
          setHistory(h=>[{reels:finalReels,gain,mult:result.mult},...h.slice(0,9)]);
        } else {
          setLastResult({win:false});
          setHistory(h=>[{reels:finalReels,gain:0,mult:0},...h.slice(0,9)]);
        }
        setSpinning(false);
      }
    },80);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,maxWidth:500,margin:"0 auto"}}>
      {/* Machine */}
      <div style={{background:"linear-gradient(135deg,#1a0a2e,#0e1420)",border:"2px solid var(--gold)",borderRadius:20,padding:24,width:"100%",boxShadow:"0 0 30px rgba(245,200,66,0.2)"}}>
        <div style={{textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:4,color:"var(--gold)",marginBottom:16}}>🎰 BETLIVE SLOTS 🎰</div>

        {/* Rouleaux */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
          {(spinning?spinReels:reels).map((s,i)=>(
            <div key={i} style={{width:90,height:90,background:"var(--bg)",border:"2px solid var(--gold)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,boxShadow:spinning?"inset 0 0 20px rgba(0,229,255,0.2)":"none",transition:"box-shadow 0.2s"}}>
              {s}
            </div>
          ))}
        </div>

        {/* Résultat */}
        {lastResult&&(
          <div style={{textAlign:"center",padding:"10px",borderRadius:10,background:lastResult.win?"rgba(0,230,118,0.1)":"rgba(255,59,92,0.1)",border:`1px solid ${lastResult.win?"rgba(0,230,118,0.3)":"rgba(255,59,92,0.2)"}`,marginBottom:12,animation:"glow-in 0.3s ease"}}>
            {lastResult.win?(
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#00e676"}}>🏆 GAGNÉ ! ×{lastResult.mult} = +{lastResult.gain} COINS</div>
            ):(
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"var(--muted)"}}>Pas de chance... Réessaie !</div>
            )}
          </div>
        )}

        {/* Table des gains */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:14,fontSize:10,fontFamily:"'DM Mono',monospace"}}>
          {Object.entries(PAYS).slice(0,6).map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 8px",background:"var(--surface)",borderRadius:5}}>
              <span style={{fontSize:14}}>{k.slice(0,2)}</span>
              <span style={{color:"var(--gold)"}}>×{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contrôles */}
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14,width:"100%"}}>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {[50,100,250,500].map(v=>(
            <button key={v} onClick={()=>setStake(String(v))} style={{flex:1,padding:"6px 0",border:`1px solid ${stake===String(v)?"var(--gold)":"var(--border)"}`,background:stake===String(v)?"rgba(245,200,66,0.1)":"var(--surface)",borderRadius:6,color:stake===String(v)?"var(--gold)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer"}}>{v}</button>
          ))}
        </div>
        <input type="number" value={stake} onChange={e=>setStake(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"8px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none",marginBottom:10}}/>
        <button onClick={spin} disabled={spinning}
          style={{width:"100%",padding:13,borderRadius:10,border:"none",background:spinning?"var(--surface)":"linear-gradient(135deg,var(--gold),#c8a000)",color:spinning?"var(--muted)":"#000",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,cursor:spinning?"not-allowed":"pointer"}}>
          {spinning?"🎰 EN COURS...":"🎰 TOURNER"}
        </button>
      </div>

      {/* Historique */}
      {history.length>0&&(
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:12,width:"100%"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--muted)",letterSpacing:1,marginBottom:8}}>DERNIERS TIRAGES</div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {history.slice(0,5).map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"var(--surface)",borderRadius:6}}>
                <span style={{fontSize:16}}>{h.reels.join("")}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:h.gain>0?"#00e676":"var(--muted)"}}>{h.gain>0?`+${h.gain}`:"-"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
