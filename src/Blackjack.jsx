import { useState } from "react";

const SUITS=["♠","♥","♦","♣"];
const VALUES=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function createDeck(){
  const deck=[];
  for(const s of SUITS) for(const v of VALUES) deck.push({suit:s,value:v,color:s==="♥"||s==="♦"?"#ff3b5c":"var(--text)"});
  return deck.sort(()=>Math.random()-0.5);
}

function cardValue(card){
  if(["J","Q","K"].includes(card.value)) return 10;
  if(card.value==="A") return 11;
  return parseInt(card.value);
}

function handValue(hand){
  let total=hand.reduce((s,c)=>s+cardValue(c),0);
  let aces=hand.filter(c=>c.value==="A").length;
  while(total>21&&aces>0){total-=10;aces--;}
  return total;
}

function Card({card,hidden=false}){
  if(hidden) return(
    <div style={{width:60,height:84,background:"linear-gradient(135deg,#1a2744,#0e1420)",border:"2px solid var(--border)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"2px 2px 8px rgba(0,0,0,0.5)"}}>🂠</div>
  );
  return(
    <div style={{width:60,height:84,background:"var(--card)",border:`2px solid ${card.color==="#ff3b5c"?"rgba(255,59,92,0.5)":"var(--border)"}`,borderRadius:10,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"5px 6px",boxShadow:"2px 2px 8px rgba(0,0,0,0.5)"}}>
      <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:card.color,lineHeight:1}}>{card.value}<br/>{card.suit}</div>
      <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:card.color,lineHeight:1,textAlign:"right",transform:"rotate(180deg)"}}>{card.value}<br/>{card.suit}</div>
    </div>
  );
}

export default function Blackjack({coins,setCoins}){
  const [phase,setPhase]=useState("bet"); // bet|play|dealer|end
  const [deck,setDeck]=useState([]);
  const [player,setPlayer]=useState([]);
  const [dealer,setDealer]=useState([]);
  const [stake,setStake]=useState("100");
  const [result,setResult]=useState(null);
  const [message,setMessage]=useState("");

  const deal=()=>{
    const s=parseInt(stake);
    if(isNaN(s)||s<=0||s>coins) return;
    setCoins(c=>c-s);
    const d=createDeck();
    const p=[d[0],d[2]];
    const dl=[d[1],d[3]];
    setDeck(d.slice(4));
    setPlayer(p);
    setDealer(dl);
    setPhase("play");
    setResult(null);
    setMessage("");
    // Blackjack naturel
    if(handValue(p)===21){
      setTimeout(()=>dealerPlay(dl,[...d.slice(4)],p,s,true),500);
    }
  };

  const hit=()=>{
    if(phase!=="play") return;
    const card=deck[0];
    const newPlayer=[...player,card];
    setPlayer(newPlayer);
    setDeck(d=>d.slice(1));
    const val=handValue(newPlayer);
    if(val>21){
      setPhase("end");
      setResult("lose");
      setMessage(`Bust ! ${val} > 21`);
    } else if(val===21){
      dealerPlay(dealer,deck.slice(1),newPlayer,parseInt(stake));
    }
  };

  const stand=()=>{
    if(phase!=="play") return;
    dealerPlay(dealer,deck,player,parseInt(stake));
  };

  const double=()=>{
    const s=parseInt(stake);
    if(coins<s||phase!=="play") return;
    setCoins(c=>c-s);
    const card=deck[0];
    const newPlayer=[...player,card];
    setPlayer(newPlayer);
    dealerPlay(dealer,deck.slice(1),newPlayer,s*2);
  };

  const dealerPlay=(dCards,dDeck,pCards,finalStake,natural=false)=>{
    setPhase("dealer");
    let dHand=[...dCards];
    let dDeck2=[...dDeck];
    while(handValue(dHand)<17){
      dHand.push(dDeck2[0]);
      dDeck2=dDeck2.slice(1);
    }
    setDealer(dHand);
    const pVal=handValue(pCards);
    const dVal=handValue(dHand);
    setTimeout(()=>{
      setPhase("end");
      if(natural&&pVal===21){
        const gain=Math.floor(finalStake*2.5);
        setCoins(c=>c+gain);
        setResult("blackjack");
        setMessage(`🎉 BLACKJACK ! +${gain} coins`);
      } else if(pVal>21){
        setResult("lose");setMessage(`Bust ! Vous perdez.`);
      } else if(dVal>21){
        setCoins(c=>c+finalStake*2);
        setResult("win");setMessage(`Dealer bust ! +${finalStake*2} coins`);
      } else if(pVal>dVal){
        setCoins(c=>c+finalStake*2);
        setResult("win");setMessage(`Victoire ! ${pVal} vs ${dVal} · +${finalStake*2} coins`);
      } else if(pVal===dVal){
        setCoins(c=>c+finalStake);
        setResult("push");setMessage(`Égalité ! Mise remboursée.`);
      } else {
        setResult("lose");setMessage(`Défaite. ${pVal} vs ${dVal}`);
      }
    },800);
  };

  const pVal=handValue(player);
  const dVal=handValue(dealer);

  return(
    <div style={{maxWidth:600,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      {/* Table */}
      <div style={{background:"linear-gradient(135deg,#0a2318,#0e1420)",border:"2px solid rgba(0,230,118,0.3)",borderRadius:20,padding:24}}>
        <div style={{textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:3,color:"rgba(0,230,118,0.8)",marginBottom:16}}>♠ BLACKJACK ♠</div>

        {/* Dealer */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:"var(--muted)",fontFamily:"'DM Mono',monospace",marginBottom:8}}>DEALER {phase!=="bet"?`(${phase==="play"?"?":dVal})`:""}</div>
          <div style={{display:"flex",gap:8}}>
            {dealer.map((c,i)=><Card key={i} card={c} hidden={i===1&&phase==="play"}/>)}
            {phase==="bet"&&[0,1].map(i=><div key={i} style={{width:60,height:84,background:"var(--surface)",border:"2px dashed var(--border)",borderRadius:10}}/>)}
          </div>
        </div>

        {/* Ligne */}
        <div style={{height:1,background:"rgba(0,230,118,0.2)",marginBottom:20}}/>

        {/* Player */}
        <div>
          <div style={{fontSize:11,color:"var(--muted)",fontFamily:"'DM Mono',monospace",marginBottom:8}}>JOUEUR {phase!=="bet"?`(${pVal})`:""}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {player.map((c,i)=><Card key={i} card={c}/>)}
            {phase==="bet"&&[0,1].map(i=><div key={i} style={{width:60,height:84,background:"var(--surface)",border:"2px dashed var(--border)",borderRadius:10}}/>)}
          </div>
        </div>

        {/* Résultat */}
        {result&&(
          <div style={{marginTop:16,textAlign:"center",padding:"10px",borderRadius:10,background:result==="win"||result==="blackjack"?"rgba(0,230,118,0.1)":result==="push"?"rgba(245,200,66,0.1)":"rgba(255,59,92,0.1)",border:`1px solid ${result==="win"||result==="blackjack"?"rgba(0,230,118,0.3)":result==="push"?"rgba(245,200,66,0.3)":"rgba(255,59,92,0.2)"}`,animation:"glow-in 0.3s ease"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:result==="win"||result==="blackjack"?"#00e676":result==="push"?"var(--gold)":"var(--red)"}}>{message}</div>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:14}}>
        {phase==="bet"||phase==="end"?(
          <>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {[50,100,250,500].map(v=><button key={v} onClick={()=>setStake(String(v))} style={{flex:1,padding:"6px 0",border:`1px solid ${stake===String(v)?"var(--accent)":"var(--border)"}`,background:stake===String(v)?"rgba(0,229,255,0.1)":"var(--surface)",borderRadius:6,color:stake===String(v)?"var(--accent)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer"}}>{v}</button>)}
            </div>
            <input type="number" value={stake} onChange={e=>setStake(e.target.value)} style={{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:7,padding:"8px",color:"var(--text)",fontFamily:"'DM Mono',monospace",fontSize:12,outline:"none",marginBottom:10}}/>
            <button onClick={deal} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:"linear-gradient(135deg,#00e676,#00a854)",color:"#000",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,cursor:"pointer"}}>
              {phase==="end"?"NOUVELLE PARTIE":"DISTRIBUER"}
            </button>
          </>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[
              {label:"TIRER",action:hit,color:"var(--accent)"},
              {label:"RESTER",action:stand,color:"var(--gold)"},
              {label:"DOUBLER",action:double,color:"#a78bfa"},
            ].map(({label,action,color})=>(
              <button key={label} onClick={action} disabled={phase!=="play"}
                style={{padding:"11px",borderRadius:9,border:`1px solid ${color}`,background:`${color}15`,color,fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1,cursor:phase==="play"?"pointer":"not-allowed",opacity:phase==="play"?1:0.5}}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
