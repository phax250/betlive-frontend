import { useState, useRef } from "react";

const NUMBERS=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

function numColor(n){
  if(n===0)return"#00c853";
  return RED.includes(n)?"#ff3b5c":"#333";
}

export default function Roulette({coins,setCoins}){
  const [bets,setBets]=useState({});
  const [stake,setStake]=useState("100");
  const [spinning,setSpinning]=useState(false);
  const [result,setResult]=useState(null);
  const [rotation,setRotation]=useState(0);
  const [history,setHistory]=useState([]);

  const addBet=(type)=>{
    const s=parseInt(stake);
    if(isNaN(s)||s<=0||s>coins) return;
    setCoins(c=>c-s);
    setBets(b=>({...b,[type]:(b[type]||0)+s}));
  };

  const spin=()=>{
    if(spinning||Object.keys(bets).length===0) return;
    setSpinning(true);
    const resultNum=NUMBERS[Math.floor(Math.random()*NUMBERS.length)];
    const spins=5+Math.random()*3;
    const targetRot=rotation+spins*360+Math.floor(Math.random()*360);
    setRotation(targetRot);
    setTimeout(()=>{
      setSpinning(false);
      setResult(resultNum);
      setHistory(h=>[resultNum,...h.slice(0,14)]);
      // Calculer gains
      let gain=0;
      Object.entries(bets).forEach(([type,amount])=>{
        if(type===String(resultNum)){gain+=amount*35;}
        else if(type==="red"&&RED.includes(resultNum)){gain+=amount*2;}
        else if(type==="black"&&resultNum!==0&&!RED.includes(resultNum)){gain+=amount*2;}
        else if(type==="even"&&resultNum!==0&&resultNum%2===0){gain+=amount*2;}
        else if(type==="odd"&&resultNum%2!==0){gain+=amount*2;}
        else if(type==="1-18"&&resultNum>=1&&resultNum<=18){gain+=amount*2;}
        else if(type==="19-36"&&resultNum>=19&&resultNum<=36){gain+=amount*2;}
        else if(type==="1st12"&&resultNum>=1&&resultNum<=12){gain+=amount*3;}
        else if(type==="2nd12"&&resultNum>=13&&resultNum<=24){gain+=amount*3;}
        else if(type==="3rd12"&&resultNum>=25&&resultNum<=36){gain+=amount*3;}
      });
      if(gain>0) setCoins(c=>c+gain);
      setBets({});
    },3000);
  };

  const betButtons=[
    {type:"red",label:"Rouge",color:"#ff3b5c",odds:"×2"},
    {type:"black",label:"Noir",color:"#444",odds:"×2"},
    {type:"even",label:"Pair",color:"var(--accent)",odds:"×2"},
    {type:"odd",label:"Impair",color:"var(--accent)",odds:"×2"},
    {type:"1-18",label:"1-18",color:"var(--gold)",odds:"×2"},
    {type:"19-36",label:"19-36",color:"var(--gold)",odds:"×2"},
    {type:"1st12",label:"1-12",color:"#a78bfa",odds:"×3"},
    {type:"2nd12",label:"13-24",color:"#a78bfa",odds:"×3"},
    {type:"3rd12",label:"25-36",color:"#a78bfa",odds:"×3"},
  ];

  return(
    <div style={{maxWidth:700,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      {/* Roue */}
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:20,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:3,color:"var(--gold)"}}>🎡 ROULETTE EUROPÉENNE</div>

        {/* Roue visuelle */}
        <div style={{position:"relative",width:200,height:200}}>
          <div style={{width:200,height:200,borderRadius:"50%",border:"4px solid var(--gold)",overflow:"hidden",background:"#1a1a1a",transform:`rotate(${rotation}deg)`,transition:spinning?"transform 3s cubic-bezier(0.17,0.67,0.12,0.99)":"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {/* Segments colorés */}
            {NUMBERS.map((n,i)=>(
              <div key={n} style={{position:"absolute",width:2,height:"50%",bottom:"50%",left:"50%",transformOrigin:"bottom center",transform:`rotate(${i*(360/NUMBERS.length)}deg)`,background:numColor(n),opacity:0.8}}/>
            ))}
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"radial-gradient(circle,transparent 30%,rgba(0,0,0,0.3))"}}/>
          </div>
          {/* Flèche */}
          <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",fontSize:20,zIndex:2}}>▼</div>
          {/* Centre */}
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:40,height:40,borderRadius:"50%",background:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:result!==null?14:10,fontWeight:700,color:"#000",zIndex:2,border:"3px solid var(--bg)"}}>
            {result!==null&&!spinning?result:"🎡"}
          </div>
        </div>

        {/* Résultat */}
        {result!==null&&!spinning&&(
          <div style={{textAlign:"center",animation:"glow-in 0.3s ease"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:28,fontWeight:700,color:numColor(result),textShadow:`0 0 20px ${numColor(result)}`}}>{result}</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>{result===0?"Zéro":RED.includes(result)?"Rouge · "+result:"Noir · "+result}</div>
          </div>
        )}

        {/* Historique */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
          {history.map((n,i)=>(
            <span key={i} style={{width:24,height:24,borderRadius:"50%",background:numColor(n),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,color:n===0?"#000":"#fff",flexShrink:0}}>{n}</span>
          ))}
        </div>
      </div>

      {/* Paris */}
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:14}}>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {[50,100,250,500].map(v=><button key={v} onClick={()=>setStake(String(v))} style={{flex:1,padding:"5px",border:`1px solid ${stake===String(v)?"var(--accent)":"var(--border)"}`,background:stake===String(v)?"rgba(0,229,255,0.1)":"var(--surface)",borderRadius:5,color:stake===String(v)?"var(--accent)":"var(--muted)",fontFamily:"'DM Mono',monospace",fontSize:9,cursor:"pointer"}}>{v}</button>)}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
          {betButtons.map(({type,label,color,odds})=>(
            <button key={type} onClick={()=>addBet(type)} disabled={spinning}
              style={{padding:"10px 6px",border:`1px solid ${bets[type]?"var(--accent)":color+"40"}`,background:bets[type]?`${color}20`:"var(--surface)",borderRadius:8,cursor:spinning?"not-allowed":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:color}}/>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--text)"}}>{label}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--gold)"}}>{odds}</span>
              {bets[type]&&<span style={{fontSize:8,color:"var(--accent)",fontFamily:"'DM Mono',monospace"}}>{bets[type]}</span>}
            </button>
          ))}
        </div>

        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{Object.values(bets).forEach(v=>setCoins(c=>c+v));setBets({});}} disabled={spinning||Object.keys(bets).length===0}
            style={{flex:1,padding:"10px",border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",borderRadius:9,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12}}>
            ANNULER
          </button>
          <button onClick={spin} disabled={spinning||Object.keys(bets).length===0}
            style={{flex:2,padding:"10px",border:"none",background:Object.keys(bets).length>0&&!spinning?"linear-gradient(135deg,var(--gold),#c8a000)":"var(--surface)",color:Object.keys(bets).length>0&&!spinning?"#000":"var(--muted)",borderRadius:9,cursor:Object.keys(bets).length>0&&!spinning?"pointer":"not-allowed",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2}}>
            {spinning?"🎡 EN COURS...":"LANCER"}
          </button>
        </div>
      </div>
    </div>
  );
}
