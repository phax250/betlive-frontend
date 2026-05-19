import { useState } from "react";

const SPORTS_DATA = {
  football: {
    icon:"⚽", name:"Football",
    leagues:[
      {name:"Ligue 1",flag:"🇫🇷",matches:[
        {id:1,home:"PSG",away:"Marseille",time:"20:45",homeOdds:1.65,drawOdds:3.80,awayOdds:4.50,live:true,score:"2-1",minute:67},
        {id:2,home:"Lyon",away:"Monaco",time:"19:00",homeOdds:2.10,drawOdds:3.20,awayOdds:3.40,live:false},
        {id:3,home:"Lille",away:"Nice",time:"17:00",homeOdds:2.30,drawOdds:3.10,awayOdds:2.90,live:false},
      ]},
      {name:"Premier League",flag:"🇬🇧",matches:[
        {id:4,home:"Man City",away:"Arsenal",time:"21:00",homeOdds:1.85,drawOdds:3.60,awayOdds:3.80,live:true,score:"1-1",minute:78},
        {id:5,home:"Liverpool",away:"Chelsea",time:"18:30",homeOdds:2.00,drawOdds:3.40,awayOdds:3.20,live:false},
      ]},
      {name:"Champions League",flag:"🇪🇺",matches:[
        {id:6,home:"Real Madrid",away:"Bayern",time:"21:00",homeOdds:2.10,drawOdds:3.50,awayOdds:3.10,live:false},
        {id:7,home:"Barcelona",away:"PSG",time:"21:00",homeOdds:2.30,drawOdds:3.20,awayOdds:2.80,live:false},
      ]},
    ]
  },
  basketball: {
    icon:"🏀", name:"Basketball",
    leagues:[
      {name:"NBA",flag:"🇺🇸",matches:[
        {id:10,home:"Lakers",away:"Warriors",time:"02:30",homeOdds:1.90,awayOdds:1.85,live:true,score:"89-94",quarter:"Q3"},
        {id:11,home:"Bulls",away:"Celtics",time:"01:00",homeOdds:2.40,awayOdds:1.55,live:false},
        {id:12,home:"Heat",away:"Knicks",time:"00:30",homeOdds:2.10,awayOdds:1.70,live:false},
      ]},
    ]
  },
  tennis: {
    icon:"🎾", name:"Tennis",
    leagues:[
      {name:"ATP Tour",flag:"🌍",matches:[
        {id:20,home:"Alcaraz",away:"Sinner",time:"14:00",homeOdds:1.75,awayOdds:2.05,live:true,score:"6-4, 3-5",set:"Set 2"},
        {id:21,home:"Medvedev",away:"Zverev",time:"16:00",homeOdds:1.90,awayOdds:1.90,live:false},
      ]},
    ]
  },
  esports: {
    icon:"🎮", name:"eSports",
    leagues:[
      {name:"CS2 Major",flag:"🌍",matches:[
        {id:30,home:"NAVI",away:"FaZe",time:"18:00",homeOdds:1.80,awayOdds:1.95,live:true,score:"12-9",map:"Map 2"},
        {id:31,home:"G2",away:"Vitality",time:"20:00",homeOdds:2.10,awayOdds:1.70,live:false},
      ]},
      {name:"League of Legends",flag:"🌍",matches:[
        {id:40,home:"T1",away:"G2",time:"15:00",homeOdds:1.55,awayOdds:2.40,live:false},
      ]},
    ]
  },
};

function MatchCard({match,sport,onBet,betSlip}){
  const isFootball=sport==="football";
  const isBball=sport==="basketball";
  const hasBet=betSlip.find(b=>b.matchId===match.id);

  return(
    <div style={{background:"var(--card)",border:`1px solid ${match.live?"rgba(255,59,92,0.3)":"var(--border)"}`,borderRadius:10,padding:12,animation:"glow-in 0.3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {match.live&&(
            <span style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,59,92,0.15)",border:"1px solid var(--red)",borderRadius:4,padding:"1px 6px",fontSize:9,fontFamily:"'DM Mono',monospace",color:"var(--red)",letterSpacing:1}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"var(--red)",animation:"pulse-live 1.2s infinite"}}/>LIVE
            </span>
          )}
          {match.live&&<span style={{fontSize:10,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{match.minute?"'+"+match.minute:match.quarter||match.set}</span>}
        </div>
        <span style={{fontSize:10,color:"var(--muted)",fontFamily:"'DM Mono',monospace"}}>{match.time}</span>
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13}}>{match.home}</div>
          <div style={{fontWeight:700,fontSize:13,color:"var(--muted)"}}>{match.away}</div>
        </div>
        {match.live&&match.score&&(
          <div style={{textAlign:"center",padding:"4px 12px",background:"var(--surface)",borderRadius:8,border:"1px solid var(--border)",margin:"0 10px"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:"var(--text)"}}>{match.score}</div>
          </div>
        )}
        <div style={{display:"flex",gap:6}}>
          {isFootball?(
            <>
              {[{label:match.home,odds:match.homeOdds,type:"home"},{label:"Nul",odds:match.drawOdds,type:"draw"},{label:match.away,odds:match.awayOdds,type:"away"}].map(({label,odds,type})=>(
                <button key={type} onClick={()=>onBet(match,type,odds,label)}
                  style={{padding:"6px 10px",border:`1px solid ${hasBet?.type===type?"var(--accent)":"var(--border)"}`,background:hasBet?.type===type?"rgba(0,229,255,0.08)":"var(--surface)",borderRadius:7,cursor:"pointer",textAlign:"center",minWidth:52}}>
                  <div style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:48}}>{label}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:"var(--gold)"}}>{odds}</div>
                </button>
              ))}
            </>
          ):(
            <>
              {[{label:match.home,odds:match.homeOdds,type:"home"},{label:match.away,odds:match.awayOdds,type:"away"}].map(({label,odds,type})=>(
                <button key={type} onClick={()=>onBet(match,type,odds,label)}
                  style={{padding:"6px 12px",border:`1px solid ${hasBet?.type===type?"var(--accent)":"var(--border)"}`,background:hasBet?.type===type?"rgba(0,229,255,0.08)":"var(--surface)",borderRadius:7,cursor:"pointer",textAlign:"center",minWidth:64}}>
                  <div style={{fontSize:9,color:"var(--muted)",fontFamily:"'DM Mono',monospace",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:60}}>{label}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:"var(--gold)"}}>{odds}</div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sports({coins,setCoins}){
  const [sport,setSport]=useState("football");
  const [betSlip,setBetSlip]=useState([]);
  const [stakeInput,setStakeInput]=useState("100");
  const [results,setResults]=useState([]);
  const data=SPORTS_DATA[sport];

  const handleBet=(match,type,odds,label)=>{
    setBetSlip(prev=>{
      const existing=prev.findIndex(b=>b.matchId===match.id);
      if(existing>=0){
        const updated=[...prev];
        if(updated[existing].type===type){updated.splice(existing,1);return updated;}
        updated[existing]={...updated[existing],type,odds,label};
        return updated;
      }
      return[...prev,{matchId:match.id,home:match.home,away:match.away,type,odds,label}];
    });
  };

  const placeBets=()=>{
    const s=parseInt(stakeInput);
    if(isNaN(s)||s<=0||s>coins||betSlip.length===0) return;
    const totalStake=s*betSlip.length;
    if(totalStake>coins) return;
    setCoins(c=>c-totalStake);
    // Simuler résultats
    betSlip.forEach(b=>{
      const won=Math.random()<(1/b.odds)*0.92;
      if(won) setCoins(c=>c+Math.floor(s*b.odds));
      setResults(r=>[{...b,won,stake:s,gain:won?Math.floor(s*b.odds):0},...r.slice(0,9)]);
    });
    setBetSlip([]);
  };

  const totalOdds=betSlip.reduce((p,b)=>p*b.odds,1);

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:14}}>
      {/* Gauche - Matchs */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Sélecteur sport */}
        <div style={{display:"flex",gap:8}}>
          {Object.entries(SPORTS_DATA).map(([key,{icon,name}])=>(
            <button key={key} onClick={()=>setSport(key)}
              style={{padding:"8px 14px",border:`1px solid ${sport===key?"var(--accent)":"var(--border)"}`,background:sport===key?"rgba(0,229,255,0.08)":"var(--surface)",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:600,color:sport===key?"var(--accent)":"var(--muted)"}}>
              <span>{icon}</span><span>{name}</span>
            </button>
          ))}
        </div>

        {/* Matchs par ligue */}
        {data.leagues.map(league=>(
          <div key={league.name}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:16}}>{league.flag}</span>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:1,color:"var(--text)"}}>{league.name}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {league.matches.map(match=><MatchCard key={match.id} match={match} sport={sport} onBet={handleBet} betSlip={betSlip}/>)}
            </div>
          </div>
        ))}
      </div>

      {/* Droite - Bulletin */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,marginBottom:12}}>BULLETIN DE PARI</div>

          {betSlip.length===0?(
            <div style={{textAlign:"center",padding:"24px 0",color:"var(--muted)",fontSize:12}}>
              <div style={{fontSize:28,marginBottom:6}}>⚽</div>
              Clique sur une cote pour parier
            </div>
          ):(
            <>
              {betSlip.map((b,i)=>(
                <div key={i} style={{padding:"8px 10px",background:"var(--surface)",borderRadius:8,marginBottom:6,border:"1px solid rgba(0,229,255,0.2)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:10,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.home} vs {b.away}</div>
                      <div style={{fontSize:12,fontWeight:600,marginTop:1}}>{b.label}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <span style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)",fontSize:13,fontWeight:700}}>{b.odds}</span>
                      <button onClick={()=>setBetSlip(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:14,padding:0}}>✕</button>
                    </div>
                  </div>
                </div>
              ))}

              {betSlip.length>1&&(
                <div style={{padding:"8px 10px",background:"rgba(245,200,66,0.06)",borderRadius:8,marginBottom:10,border:"1px solid rgba(245,200,66,0.2)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                    <span style={{color:"var(--muted)"}}>Combiné ×{betSlip.length}</span>
                    <span style={{fontFamily:"'DM Mono',monospace",color:"var(--gold)",fontWeight:700}}>{totalOdds.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:"var(--muted)",marginBottom:4,letterSpacing:1}}>MISE PAR PARI (coins)</div>
                <div style={{display:"flex",gap:4,marginBottom:6}}>
                  {[50,100,250,500].map(v=><button key={v} onClick={()=>setStakeInput(String(v))} style={{flex:1,padding:"5px 0",border:`1px solid ${stakeInput===String(v)?"var(--accent)":"var(--border)"}`,background:stakeInput===String(v)?"rgba(0,229,255,0.1)":"var(--surface)",borderRadius:5,color:stakeInput===String(v)?"var(--accent)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:9,cursor:"pointer"}}>{v}</button>)}
                </div>
                <input type="number" value={stakeInput} onChange={e=>setStakeInput(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"8px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none"}}/>
              </div>

              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:10}}>
                <span>Gain potentiel</span>
                <span style={{color:"var(--green)",fontFamily:"'DM Mono',monospace",fontWeight:700}}>{Math.floor(parseInt(stakeInput||0)*totalOdds)} coins</span>
              </div>

              <button onClick={placeBets} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:"linear-gradient(135deg,var(--accent),#0090a8)",color:"#000",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:1}}>
                PLACER ({betSlip.length} pari{betSlip.length>1?"s":""})
              </button>
            </>
          )}
        </div>

        {/* Résultats récents */}
        {results.length>0&&(
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:12}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--muted)",letterSpacing:1,marginBottom:8}}>RÉSULTATS RÉCENTS</div>
            {results.slice(0,5).map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"4px 0",borderBottom:"1px solid rgba(30,45,69,0.4)"}}>
                <span style={{color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{r.label} ({r.home} vs {r.away})</span>
                <span style={{fontFamily:"'DM Mono',monospace",color:r.won?"var(--green)":"var(--red)",flexShrink:0}}>{r.won?`+${r.gain}`:`-${r.stake}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
