import { useState, useEffect, useRef } from "react";

const SUITS = ["♠","♥","♦","♣"];
const VALUES = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const VALUE_MAP = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14};

function createDeck() {
  const deck = [];
  for (const s of SUITS) for (const v of VALUES) deck.push({ suit: s, value: v, color: s === "♥" || s === "♦" ? "#ff5a6e" : "#e8f0fe" });
  return deck.sort(() => Math.random() - 0.5);
}

function Card({ card, hidden = false, small = false }) {
  const w = small ? 44 : 58, h = small ? 60 : 80;
  if (hidden) return (
    <div style={{ width: w, height: h, background: "linear-gradient(135deg,#1a2744,#0e1420)", border: "2px solid #2a3a5a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: small ? 16 : 22, boxShadow: "2px 2px 6px rgba(0,0,0,0.5)", flexShrink: 0 }}>🂠</div>
  );
  return (
    <div style={{ width: w, height: h, background: "linear-gradient(135deg,#f8faff,#e8f0fe)", border: `2px solid ${card.color === "#ff5a6e" ? "rgba(255,90,110,0.4)" : "rgba(100,120,160,0.4)"}`, borderRadius: 8, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: small ? "3px 4px" : "4px 6px", boxShadow: "2px 2px 6px rgba(0,0,0,0.5)", flexShrink: 0 }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: small ? 10 : 12, fontWeight: 700, color: card.color, lineHeight: 1.1 }}>{card.value}<br />{card.suit}</div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: small ? 10 : 12, fontWeight: 700, color: card.color, lineHeight: 1.1, textAlign: "right", transform: "rotate(180deg)" }}>{card.value}<br />{card.suit}</div>
    </div>
  );
}

// Évaluation des mains
function handRank(cards) {
  const vals = cards.map(c => VALUE_MAP[c.value]).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const valCount = {};
  vals.forEach(v => { valCount[v] = (valCount[v] || 0) + 1; });
  const counts = Object.values(valCount).sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = vals.length === 5 && vals[0] - vals[4] === 4 && counts[0] === 1;
  const isRoyal = isStraight && vals[0] === 14;

  if (isFlush && isRoyal) return { rank: 9, name: "Quinte Flush Royale" };
  if (isFlush && isStraight) return { rank: 8, name: "Quinte Flush" };
  if (counts[0] === 4) return { rank: 7, name: "Carré" };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 6, name: "Full House" };
  if (isFlush) return { rank: 5, name: "Couleur" };
  if (isStraight) return { rank: 4, name: "Suite" };
  if (counts[0] === 3) return { rank: 3, name: "Brelan" };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 2, name: "Double Paire" };
  if (counts[0] === 2) return { rank: 1, name: "Paire" };
  return { rank: 0, name: "Carte Haute" };
}

function bestHand(hole, community) {
  const all = [...hole, ...community];
  if (all.length < 5) return handRank(all);
  let best = { rank: -1, name: "" };
  // Toutes les combinaisons de 5 cartes
  for (let i = 0; i < all.length - 4; i++)
    for (let j = i + 1; j < all.length - 3; j++)
      for (let k = j + 1; k < all.length - 2; k++)
        for (let l = k + 1; l < all.length - 1; l++)
          for (let m = l + 1; m < all.length; m++) {
            const h = handRank([all[i], all[j], all[k], all[l], all[m]]);
            if (h.rank > best.rank) best = h;
          }
  return best;
}

const AI_NAMES = ["PokerBot_X", "BluffMaster", "ChipKing", "AceHunter"];

export default function Poker({ coins, setCoins }) {
  const [phase, setPhase] = useState("idle"); // idle | preflop | flop | turn | river | showdown
  const [deck, setDeck] = useState([]);
  const [playerHole, setPlayerHole] = useState([]);
  const [aiHole, setAiHole] = useState([]);
  const [community, setCommunity] = useState([]);
  const [pot, setPot] = useState(0);
  const [playerBet, setPlayerBet] = useState(0);
  const [aiBet, setAiBet] = useState(0);
  const [stake, setStake] = useState("100");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [showAiCards, setShowAiCards] = useState(false);
  const [playerFolded, setPlayerFolded] = useState(false);
  const [thinking, setThinking] = useState(false);
  const aiName = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];

  const AI_MESSAGES = {
    raise: ["Raise ! 😏", "Je mise plus… 🃏", "Tu peux suivre ?", "All in maybe ?"],
    call: ["Je suis. 😐", "Check.", "On verra bien…", "Je suis ton jeu."],
    fold: ["Je me couche. 😤", "C'est trop pour moi.", "Tu as gagné ce coup."],
    win: ["GG ! 🏆", "C'était prévisible 😏", "Meilleure main !"],
    lose: ["Bien joué ! 😤", "Chance du débutant…", "J'aurais dû fold."],
  };

  const aiSay = (type) => {
    const msgs = AI_MESSAGES[type];
    setAiMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    setTimeout(() => setAiMessage(""), 3000);
  };

  const deal = () => {
    const s = parseInt(stake);
    if (isNaN(s) || s <= 0 || s > coins) return;
    const blind = Math.max(s, 50);
    const d = createDeck();
    const ph = [d[0], d[2]];
    const ah = [d[1], d[3]];
    const rest = d.slice(4);
    setDeck(rest);
    setPlayerHole(ph);
    setAiHole(ah);
    setCommunity([]);
    setPot(blind * 2);
    setPlayerBet(blind);
    setAiBet(blind);
    setCoins(c => c - blind);
    setPhase("preflop");
    setResult(null);
    setMessage("");
    setAiMessage("Je regarde mes cartes… 👀");
    setShowAiCards(false);
    setPlayerFolded(false);
    setTimeout(() => setAiMessage(""), 2000);
  };

  const aiDecide = (currentPhase, currentCommunity, currentDeck, currentPot) => {
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const aiHand = bestHand(aiHole, currentCommunity);
      const r = Math.random();

      if (aiHand.rank >= 3 || (aiHand.rank >= 1 && r < 0.7)) {
        // Bonne main → raise
        const raiseAmt = Math.floor(parseInt(stake) * (0.5 + Math.random()));
        if (raiseAmt <= coins) {
          setPot(p => p + raiseAmt);
          setAiBet(b => b + raiseAmt);
          aiSay("raise");
          setMessage(`${aiName} relance de ${raiseAmt} coins !`);
        } else {
          aiSay("call");
          setMessage(`${aiName} suit.`);
        }
      } else if (r < 0.5) {
        // Check/Call
        aiSay("call");
        setMessage(`${aiName} check.`);
      } else if (currentPhase !== "preflop") {
        // Fold si main faible et pas preflop
        aiSay("fold");
        setMessage(`${aiName} se couche !`);
        endGame("player", currentPot, "L'IA s'est couchée !");
        return;
      }

      // Passer au prochain round
      nextStreet(currentPhase, currentCommunity, currentDeck, currentPot);
    }, 1200);
  };

  const nextStreet = (currentPhase, currentCommunity, currentDeck, currentPot) => {
    if (currentPhase === "preflop") {
      const flop = currentDeck.slice(0, 3);
      setCommunity(flop);
      setDeck(d => d.slice(3));
      setPhase("flop");
      setMessage("Le Flop !");
    } else if (currentPhase === "flop") {
      const turn = [...currentCommunity, currentDeck[0]];
      setCommunity(turn);
      setDeck(d => d.slice(1));
      setPhase("turn");
      setMessage("Le Turn !");
    } else if (currentPhase === "turn") {
      const river = [...currentCommunity, currentDeck[0]];
      setCommunity(river);
      setDeck(d => d.slice(1));
      setPhase("river");
      setMessage("La River !");
    } else if (currentPhase === "river") {
      doShowdown(currentCommunity, currentPot);
    }
  };

  const doShowdown = (currentCommunity, currentPot) => {
    setShowAiCards(true);
    setPhase("showdown");
    const playerBest = bestHand(playerHole, currentCommunity);
    const aiBest = bestHand(aiHole, currentCommunity);

    setTimeout(() => {
      if (playerBest.rank > aiBest.rank) {
        endGame("player", currentPot, `Tu gagnes ! ${playerBest.name} vs ${aiBest.name}`);
        aiSay("lose");
      } else if (aiBest.rank > playerBest.rank) {
        endGame("ai", currentPot, `L'IA gagne ! ${aiBest.name} vs ${playerBest.name}`);
        aiSay("win");
      } else {
        endGame("tie", currentPot, `Égalité ! ${playerBest.name}`);
      }
    }, 1500);
  };

  const endGame = (winner, finalPot, msg) => {
    setPhase("idle");
    setMessage(msg);
    if (winner === "player") {
      setCoins(c => c + finalPot);
      setResult("win");
      setHistory(h => [{ result: "win", pot: finalPot, msg }, ...h.slice(0, 9)]);
    } else if (winner === "tie") {
      setCoins(c => c + Math.floor(finalPot / 2));
      setResult("tie");
      setHistory(h => [{ result: "tie", pot: Math.floor(finalPot / 2), msg }, ...h.slice(0, 9)]);
    } else {
      setResult("lose");
      setHistory(h => [{ result: "lose", pot: 0, msg }, ...h.slice(0, 9)]);
    }
  };

  const handleCheck = () => {
    if (playerFolded || thinking) return;
    aiDecide(phase, community, deck, pot);
  };

  const handleRaise = () => {
    if (playerFolded || thinking) return;
    const raiseAmt = Math.floor(parseInt(stake) * 0.5);
    if (raiseAmt > coins) return;
    setCoins(c => c - raiseAmt);
    setPot(p => p + raiseAmt);
    setPlayerBet(b => b + raiseAmt);
    setMessage(`Tu relances de ${raiseAmt} !`);
    aiDecide(phase, community, deck, pot + raiseAmt);
  };

  const handleFold = () => {
    if (playerFolded || thinking) return;
    setPlayerFolded(true);
    setShowAiCards(true);
    endGame("ai", pot, "Tu t'es couché !");
  };

  const phaseLabels = { preflop: "PRE-FLOP", flop: "FLOP", turn: "TURN", river: "RIVER", showdown: "SHOWDOWN" };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Table */}
      <div style={{ background: "linear-gradient(135deg,#0a2318,#051a10)", border: "3px solid rgba(0,180,80,0.3)", borderRadius: 20, padding: 20, boxShadow: "0 0 40px rgba(0,100,40,0.2)" }}>
        <div style={{ textAlign: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 3, color: "rgba(0,230,118,0.7)", marginBottom: 4 }}>
          ♠ TEXAS HOLD'EM ♠ {phase !== "idle" && <span style={{ color: "var(--gold)" }}>— {phaseLabels[phase]}</span>}
        </div>

        {/* IA */}
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,59,92,0.2)", border: "2px solid rgba(255,59,92,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{aiName}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Mono',monospace" }}>Mise: {aiBet} coins</div>
            </div>
            {aiMessage && (
              <div style={{ marginLeft: "auto", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "var(--text)", fontStyle: "italic", animation: "glow-in 0.3s ease" }}>
                "{aiMessage}"
              </div>
            )}
            {thinking && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 11, fontFamily: "'DM Mono',monospace" }}>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Réfléchit...
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {phase === "idle" ? (
              [0, 1].map(i => <div key={i} style={{ width: 44, height: 60, background: "rgba(0,0,0,0.2)", border: "2px dashed rgba(90,112,144,0.3)", borderRadius: 8 }} />)
            ) : (
              aiHole.map((c, i) => <Card key={i} card={c} hidden={!showAiCards} small />)
            )}
          </div>
        </div>

        {/* Community cards */}
        <div style={{ background: "rgba(0,80,0,0.2)", border: "1px solid rgba(0,150,0,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, minHeight: 90 }}>
          {community.length === 0 ? (
            <div style={{ color: "rgba(90,112,144,0.5)", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
              {phase === "idle" ? "Cartes communes" : "En attente du flop..."}
            </div>
          ) : (
            community.map((c, i) => <Card key={i} card={c} />)
          )}
          {/* Cartes cachées restantes */}
          {phase !== "idle" && Array.from({ length: Math.max(0, 5 - community.length) }, (_, i) => (
            <div key={i} style={{ width: 58, height: 80, background: "rgba(0,0,0,0.2)", border: "2px dashed rgba(90,112,144,0.2)", borderRadius: 8 }} />
          ))}
        </div>

        {/* Pot */}
        {phase !== "idle" && (
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span style={{ background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.3)", borderRadius: 20, padding: "4px 16px", fontFamily: "'DM Mono',monospace", fontSize: 13, color: "var(--gold)", fontWeight: 700 }}>
              🏆 Pot : {pot} coins
            </span>
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{ textAlign: "center", marginBottom: 10, padding: "6px 12px", background: result === "win" ? "rgba(0,230,118,0.1)" : result === "lose" ? "rgba(255,59,92,0.1)" : "rgba(0,229,255,0.05)", borderRadius: 8, border: `1px solid ${result === "win" ? "rgba(0,230,118,0.3)" : result === "lose" ? "rgba(255,59,92,0.2)" : "rgba(0,229,255,0.15)"}`, animation: "glow-in 0.3s ease" }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: result === "win" ? "#00e676" : result === "lose" ? "#ff3b5c" : "var(--accent)" }}>{message}</span>
          </div>
        )}

        {/* Joueur */}
        <div style={{ padding: "10px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,229,255,0.15)", border: "2px solid rgba(0,229,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>😎</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>TOI</div>
              <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Mono',monospace" }}>Mise: {playerBet} coins</div>
            </div>
            {phase !== "idle" && community.length > 0 && (
              <div style={{ marginLeft: "auto", background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "var(--accent)", fontFamily: "'DM Mono',monospace" }}>
                {bestHand(playerHole, community).name}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {phase === "idle" ? (
              [0, 1].map(i => <div key={i} style={{ width: 44, height: 60, background: "rgba(0,0,0,0.2)", border: "2px dashed rgba(90,112,144,0.3)", borderRadius: 8 }} />)
            ) : (
              playerHole.map((c, i) => <Card key={i} card={c} small />)
            )}
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2, marginBottom: 8 }}>BLIND (mise)</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {[50, 100, 200, 500].map(v => (
              <button key={v} onClick={() => setStake(String(v))} disabled={phase !== "idle"}
                style={{ flex: 1, padding: "5px 0", border: `1px solid ${stake === String(v) ? "var(--accent)" : "var(--border)"}`, background: stake === String(v) ? "rgba(0,229,255,0.1)" : "var(--surface)", borderRadius: 5, color: stake === String(v) ? "var(--accent)" : "var(--muted)", fontFamily: "'DM Mono',monospace", fontSize: 9, cursor: "pointer" }}>{v}</button>
            ))}
          </div>
          <button onClick={deal} disabled={phase !== "idle"}
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: phase === "idle" ? "linear-gradient(135deg,#00e676,#00a854)" : "var(--surface)", color: phase === "idle" ? "#000" : "var(--muted)", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, cursor: phase === "idle" ? "pointer" : "not-allowed" }}>
            {phase === "idle" ? "DISTRIBUER" : "EN COURS..."}
          </button>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2, marginBottom: 8 }}>ACTIONS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[
              { label: "CHECK", action: handleCheck, color: "var(--accent)", disabled: phase === "idle" || phase === "showdown" || thinking },
              { label: "RELANCER", action: handleRaise, color: "var(--gold)", disabled: phase === "idle" || phase === "showdown" || thinking },
              { label: "SE COUCHER", action: handleFold, color: "var(--red)", disabled: phase === "idle" || phase === "showdown" || thinking },
            ].map(({ label, action, color, disabled }) => (
              <button key={label} onClick={action} disabled={disabled}
                style={{ padding: "10px 4px", border: `1px solid ${color}`, background: `${color}15`, color, fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: 0.5, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "var(--muted)", letterSpacing: 1, marginBottom: 8 }}>PARTIES RÉCENTES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {history.slice(0, 5).map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "4px 8px", background: "var(--surface)", borderRadius: 6, border: `1px solid ${h.result === "win" ? "rgba(0,230,118,0.2)" : h.result === "tie" ? "rgba(245,200,66,0.2)" : "rgba(255,59,92,0.15)"}` }}>
                <span style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{h.msg}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", color: h.result === "win" ? "#00e676" : h.result === "tie" ? "#f5c842" : "#ff3b5c", flexShrink: 0 }}>{h.result === "win" ? `+${h.pot}` : h.result === "tie" ? `±${h.pot}` : "perdu"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
