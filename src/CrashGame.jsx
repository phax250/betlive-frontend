import { useState, useEffect, useRef, useCallback } from "react";

export default function CrashGame({ coins, setCoins }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    phase: "waiting",
    multiplier: 1.00,
    crashAt: 1,
    startTime: 0,
    rocketX: 60,
    rocketY: 320,
    trail: [],
    particles: [],
    stars: Array.from({ length: 100 }, () => ({
      x: Math.random() * 700, y: Math.random() * 380,
      size: Math.random() * 2 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.03 + 0.01,
    })),
  });

  const [uiPhase, setUiPhase] = useState("waiting");
  const [uiMult, setUiMult] = useState(1.00);
  const [countdown, setCountdown] = useState(5);
  const [stake, setStake] = useState("100");
  const [betPlaced, setBetPlaced] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutMult, setCashoutMult] = useState(null);
  const [history, setHistory] = useState([3.2, 1.1, 8.7, 1.0, 5.4, 2.1, 12.4, 1.5]);
  const [autoCashout, setAutoCashout] = useState("");
  const [playerCashouts, setPlayerCashouts] = useState({});
  const PLAYERS = [
    { name: "CryptoKing", stake: 500, color: "#00e5ff" },
    { name: "NightRacer", stake: 200, color: "#f5c842" },
    { name: "TrafficPro", stake: 1000, color: "#a78bfa" },
    { name: "ShibuyaBet", stake: 150, color: "#ff9a3c" },
  ];

  const countdownRef = useRef(null);
  const gameRef = useRef(null);
  const cashedOutRef = useRef(false);
  const betPlacedRef = useRef(false);
  const stakeRef = useRef("100");
  const autoCashoutRef = useRef("");

  useEffect(() => { stakeRef.current = stake; }, [stake]);
  useEffect(() => { autoCashoutRef.current = autoCashout; }, [autoCashout]);

  const generateCrash = () => {
    const r = Math.random();
    if (r < 0.35) return 1.0 + Math.random() * 0.4;
    if (r < 0.60) return 1.5 + Math.random() * 2;
    if (r < 0.82) return 3.5 + Math.random() * 6;
    if (r < 0.95) return 10 + Math.random() * 15;
    return 25 + Math.random() * 75;
  };

  // ── Canvas render ────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const s = stateRef.current;

    ctx.clearRect(0, 0, W, H);

    // Fond spatial
    ctx.fillStyle = "#060910";
    ctx.fillRect(0, 0, W, H);

    // Nébuleuse en fond
    const nebula = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, 200);
    nebula.addColorStop(0, "rgba(100,0,200,0.06)");
    nebula.addColorStop(1, "transparent");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, W, H);
    const nebula2 = ctx.createRadialGradient(W * 0.2, H * 0.7, 0, W * 0.2, H * 0.7, 150);
    nebula2.addColorStop(0, "rgba(0,100,200,0.05)");
    nebula2.addColorStop(1, "transparent");
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, W, H);

    // Étoiles scintillantes
    s.stars.forEach(star => {
      star.twinkle += star.speed;
      const alpha = 0.3 + Math.sin(star.twinkle) * 0.4;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
      ctx.fill();
    });

    // Grille
    ctx.strokeStyle = "rgba(0,229,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const isCrashed = s.phase === "crashed";
    const isFlying = s.phase === "flying";
    const color = s.multiplier < 2 ? "#00e676" : s.multiplier < 5 ? "#f5c842" : s.multiplier < 10 ? "#ff9a3c" : "#ff3b5c";

    if (isFlying || isCrashed) {
      // Trail (courbe)
      if (s.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
        }
        const grad = ctx.createLinearGradient(60, H - 50, s.rocketX, s.rocketY);
        grad.addColorStop(0, `${isCrashed ? "rgba(255,59,92,0)" : "rgba(0,229,255,0)"}`);
        grad.addColorStop(1, isCrashed ? "rgba(255,59,92,0.9)" : `${color}cc`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        // Zone remplie sous la courbe
        ctx.beginPath();
        ctx.moveTo(60, H - 50);
        s.trail.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.lineTo(s.rocketX, H - 50);
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, s.rocketY, 0, H - 50);
        fillGrad.addColorStop(0, isCrashed ? "rgba(255,59,92,0.12)" : `${color}20`);
        fillGrad.addColorStop(1, "transparent");
        ctx.fillStyle = fillGrad;
        ctx.fill();
      }

      if (isFlying) {
        // ── FUSÉE ──
        ctx.save();
        ctx.translate(s.rocketX, s.rocketY);

        // Direction de la fusée
        let angle = -Math.PI / 3.5;
        if (s.trail.length > 3) {
          const prev = s.trail[s.trail.length - 3];
          angle = Math.atan2(s.rocketY - prev.y, s.rocketX - prev.x);
        }
        ctx.rotate(angle - Math.PI / 2);

        // Flammes (effet feu animé)
        const t = Date.now() / 100;
        for (let f = 0; f < 12; f++) {
          const fy = 18 + Math.sin(t + f) * 8 + f * 2;
          const fx = Math.sin(t * 1.5 + f * 0.8) * 5;
          const fsize = 5 + Math.abs(Math.sin(t + f)) * 8;
          const fAlpha = 0.5 + Math.sin(t + f) * 0.3;
          const r = 255, g = Math.floor(100 + Math.sin(t + f) * 80), b = 0;
          ctx.beginPath();
          ctx.arc(fx, fy, fsize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${fAlpha})`;
          ctx.fill();
        }
        // Cœur de flamme blanc
        ctx.beginPath();
        ctx.arc(0, 20, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,200,0.9)";
        ctx.fill();

        // Corps fusée
        ctx.fillStyle = "#dde8ff";
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.quadraticCurveTo(12, -8, 10, 14);
        ctx.lineTo(-10, 14);
        ctx.quadraticCurveTo(-12, -8, 0, -22);
        ctx.closePath();
        ctx.fill();

        // Détail rayure
        ctx.fillStyle = "#ff3b5c";
        ctx.beginPath();
        ctx.rect(-4, -4, 8, 6);
        ctx.fill();

        // Hublot
        const hublotGrad = ctx.createRadialGradient(-1, -9, 0, 0, -8, 5);
        hublotGrad.addColorStop(0, "#ffffff");
        hublotGrad.addColorStop(0.3, "#00e5ff");
        hublotGrad.addColorStop(1, "#0050a0");
        ctx.beginPath();
        ctx.arc(0, -8, 5, 0, Math.PI * 2);
        ctx.fillStyle = hublotGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ailerons
        ctx.fillStyle = "#5a7090";
        ctx.beginPath(); ctx.moveTo(10, 8); ctx.lineTo(20, 18); ctx.lineTo(10, 14); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-10, 8); ctx.lineTo(-20, 18); ctx.lineTo(-10, 14); ctx.closePath(); ctx.fill();

        // Lueur
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 35);
        glow.addColorStop(0, `rgba(0,229,255,0.25)`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
      }

      if (isCrashed) {
        // Explosion
        s.particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.life -= 0.03;
          if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace("1)", `${p.life})`);
            ctx.fill();
          }
        });
        s.particles = s.particles.filter(p => p.life > 0);
      }
    }

    // Axe
    ctx.strokeStyle = "rgba(0,229,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(55, 15); ctx.lineTo(55, H - 45); ctx.lineTo(W - 15, H - 45); ctx.stroke();

    // Labels axe Y
    for (let i = 1; i <= 5; i++) {
      const y = H - 45 - i * ((H - 60) / 6);
      ctx.fillStyle = "rgba(90,112,144,0.5)";
      ctx.font = "10px 'DM Mono',monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${i + 1}×`, 50, y + 4);
      ctx.strokeStyle = "rgba(90,112,144,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(57, y); ctx.lineTo(W - 15, y); ctx.stroke();
    }

    if (s.phase === "waiting") {
      ctx.font = "bold 14px 'Syne',sans-serif";
      ctx.fillStyle = "rgba(90,112,144,0.6)";
      ctx.textAlign = "center";
      ctx.fillText("Prêt pour le décollage...", W / 2, H - 20);
    }

    animRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  const startCountdown = useCallback(() => {
    const s = stateRef.current;
    s.phase = "waiting"; s.trail = []; s.particles = [];
    s.rocketX = 60; s.rocketY = 320;
    setUiPhase("waiting"); setUiMult(1.00);
    setBetPlaced(false); betPlacedRef.current = false;
    setCashedOut(false); cashedOutRef.current = false;
    setCashoutMult(null);
    setPlayerCashouts({});

    let cd = 5;
    setCountdown(cd);
    countdownRef.current = setInterval(() => {
      cd--;
      setCountdown(cd);
      if (cd <= 0) { clearInterval(countdownRef.current); startFlight(); }
    }, 1000);
  }, []);

  const doManualCashout = useCallback((currentMult) => {
    if (!betPlacedRef.current || cashedOutRef.current) return;
    if (stateRef.current.phase !== "flying") return;
    const s = parseInt(stakeRef.current);
    const m = currentMult || stateRef.current.multiplier;
    const gain = Math.floor(s * m);
    setCoins(c => c + gain);
    setCashedOut(true); cashedOutRef.current = true;
    setCashoutMult(+m.toFixed(2));
  }, [setCoins]);

  const startFlight = useCallback(() => {
    const crashAt = generateCrash();
    const canvas = canvasRef.current;
    const W = canvas?.width || 700, H = canvas?.height || 380;
    const s = stateRef.current;
    s.phase = "flying"; s.crashAt = crashAt;
    s.startTime = Date.now();
    s.rocketX = 60; s.rocketY = H - 50;
    s.trail = [{ x: 60, y: H - 50 }];
    setUiPhase("flying");

    let mult = 1.00;
    let speed = 0.007;
    let frameCount = 0;

    gameRef.current = setInterval(() => {
      mult += speed;
      speed *= 1.0035;
      frameCount++;

      const progress = Math.min((mult - 1) / Math.max(crashAt - 1, 0.1), 1);
      s.rocketX = 60 + progress * (W - 80);
      s.rocketY = (H - 50) - Math.pow(progress, 0.75) * (H - 80);
      s.multiplier = mult;

      if (frameCount % 2 === 0) s.trail.push({ x: s.rocketX, y: s.rocketY });

      setUiMult(+mult.toFixed(2));

      // Auto cashout
      const ac = parseFloat(autoCashoutRef.current);
      if (ac > 1 && mult >= ac) doManualCashout(mult);

      // Cashouts simulés joueurs
      if (Math.random() < 0.025 && mult > 1.5) {
        const idx = Math.floor(Math.random() * PLAYERS.length);
        const name = PLAYERS[idx].name;
        setPlayerCashouts(prev => prev[name] ? prev : { ...prev, [name]: +mult.toFixed(2) });
      }

      if (mult >= crashAt) {
        clearInterval(gameRef.current);
        s.phase = "crashed";
        s.multiplier = crashAt;
        // Créer particules explosion
        s.particles = Array.from({ length: 40 }, () => {
          const angle = Math.random() * Math.PI * 2;
          const speed2 = 2 + Math.random() * 6;
          const colors = ["rgba(255,59,92,1)", "rgba(245,200,66,1)", "rgba(255,154,60,1)", "rgba(255,255,255,1)"];
          return { x: s.rocketX, y: s.rocketY, vx: Math.cos(angle) * speed2, vy: Math.sin(angle) * speed2 - 3, life: 1, size: 3 + Math.random() * 6, color: colors[Math.floor(Math.random() * colors.length)] };
        });
        setUiPhase("crashed");
        setUiMult(+crashAt.toFixed(2));
        setHistory(h => [+crashAt.toFixed(2), ...h.slice(0, 9)]);
        setTimeout(startCountdown, 4000);
      }
    }, 80);
  }, [doManualCashout, startCountdown]);

  useEffect(() => {
    startCountdown();
    return () => { clearInterval(countdownRef.current); clearInterval(gameRef.current); cancelAnimationFrame(animRef.current); };
  }, [startCountdown]);

  const handleBet = () => {
    const s = parseInt(stake);
    if (isNaN(s) || s <= 0 || s > coins || uiPhase !== "waiting") return;
    setCoins(c => c - s);
    setBetPlaced(true); betPlacedRef.current = true;
  };

  const multColor = uiMult < 2 ? "#00e676" : uiMult < 5 ? "#f5c842" : uiMult < 10 ? "#ff9a3c" : "#ff3b5c";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Historique */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {history.map((h, i) => (
            <span key={i} style={{ flexShrink: 0, padding: "3px 12px", borderRadius: 20, fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 700, background: h < 2 ? "rgba(0,230,118,0.1)" : h < 5 ? "rgba(245,200,66,0.1)" : "rgba(255,59,92,0.1)", color: h < 2 ? "#00e676" : h < 5 ? "#f5c842" : "#ff3b5c", border: `1px solid ${h < 2 ? "rgba(0,230,118,0.3)" : h < 5 ? "rgba(245,200,66,0.3)" : "rgba(255,59,92,0.3)"}` }}>
              {h.toFixed(2)}×
            </span>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `2px solid ${uiPhase === "crashed" ? "rgba(255,59,92,0.6)" : uiPhase === "flying" ? `${multColor}60` : "rgba(0,229,255,0.2)"}`, boxShadow: uiPhase === "crashed" ? "0 0 40px rgba(255,59,92,0.15)" : uiPhase === "flying" ? `0 0 30px ${multColor}20` : "none", transition: "border-color 0.3s, box-shadow 0.3s" }}>
          <canvas ref={canvasRef} width={700} height={380} style={{ display: "block", width: "100%", height: "auto" }} />

          {/* Countdown */}
          {uiPhase === "waiting" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 72, marginBottom: 4, animation: "float 1s ease-in-out infinite" }}>🚀</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 3, color: "rgba(90,112,144,0.8)", marginBottom: 4 }}>DÉCOLLAGE DANS</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 72, color: "var(--accent)", fontWeight: 700, textShadow: "0 0 30px var(--accent)", lineHeight: 1 }}>{countdown}</div>
            </div>
          )}

          {/* Multiplicateur flying */}
          {uiPhase === "flying" && (
            <div style={{ position: "absolute", bottom: 12, left: 12, pointerEvents: "none" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: multColor, textShadow: `0 0 20px ${multColor}`, lineHeight: 1 }}>{uiMult.toFixed(2)}×</div>
            </div>
          )}

          {/* Cashout banner */}
          {cashedOut && (
            <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.85)", border: "2px solid #00e676", borderRadius: 10, padding: "8px 20px", backdropFilter: "blur(8px)", animation: "glow-in 0.3s ease", whiteSpace: "nowrap" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "#00e676", letterSpacing: 1 }}>✅ CACHÉ À {cashoutMult}× · +{Math.floor(parseInt(stake) * cashoutMult)} COINS</div>
            </div>
          )}

          {/* Crash overlay */}
          {uiPhase === "crashed" && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", textAlign: "center", pointerEvents: "none", animation: "glow-in 0.3s ease" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#ff3b5c", letterSpacing: 3 }}>💥 CRASH À {uiMult.toFixed(2)}×</div>
            </div>
          )}
        </div>
      </div>

      {/* Panneau droit */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 2, marginBottom: 10 }}>🚀 MISE</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {[50, 100, 250, 500].map(v => (
              <button key={v} onClick={() => setStake(String(v))} style={{ flex: 1, padding: "5px 0", border: `1px solid ${stake === String(v) ? "var(--accent)" : "var(--border)"}`, background: stake === String(v) ? "rgba(0,229,255,0.1)" : "var(--surface)", borderRadius: 5, color: stake === String(v) ? "var(--accent)" : "var(--muted)", fontFamily: "'DM Mono',monospace", fontSize: 9, cursor: "pointer" }}>{v}</button>
            ))}
          </div>
          <input type="number" value={stake} onChange={e => setStake(e.target.value)} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px", color: "var(--text)", fontFamily: "'DM Mono',monospace", fontSize: 12, outline: "none", marginBottom: 8 }} />
          <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4, letterSpacing: 1 }}>AUTO CASHOUT ×</div>
          <input type="number" placeholder="ex: 2.00" value={autoCashout} onChange={e => setAutoCashout(e.target.value)} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "7px", color: "var(--text)", fontFamily: "'DM Mono',monospace", fontSize: 11, outline: "none", marginBottom: 10 }} />

          {!betPlaced ? (
            <button onClick={handleBet} disabled={uiPhase !== "waiting"}
              style={{ width: "100%", padding: 11, borderRadius: 9, border: "none", background: uiPhase === "waiting" ? "linear-gradient(135deg,var(--accent),#0090a8)" : "var(--surface)", color: uiPhase === "waiting" ? "#000" : "var(--muted)", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, cursor: uiPhase === "waiting" ? "pointer" : "not-allowed" }}>
              {uiPhase === "waiting" ? `MISER ${stake} COINS` : uiPhase === "crashed" ? "ATTENDRE..." : "EN VOL..."}
            </button>
          ) : !cashedOut ? (
            <button onClick={() => doManualCashout()} disabled={uiPhase !== "flying"}
              style={{ width: "100%", padding: 11, borderRadius: 9, border: "none", background: uiPhase === "flying" ? "linear-gradient(135deg,#00e676,#00a854)" : "var(--surface)", color: uiPhase === "flying" ? "#000" : "var(--muted)", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, cursor: uiPhase === "flying" ? "pointer" : "not-allowed" }}>
              {uiPhase === "flying" ? `💰 CACHER ×${uiMult.toFixed(2)} = +${Math.floor(parseInt(stake || 0) * uiMult)}` : "..."}
            </button>
          ) : (
            <div style={{ textAlign: "center", padding: "10px", background: "rgba(0,230,118,0.1)", borderRadius: 9, border: "1px solid rgba(0,230,118,0.3)", color: "#00e676", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
              ✅ Casé à {cashoutMult}×
            </div>
          )}
        </div>

        {/* Joueurs */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, flex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 2, marginBottom: 10 }}>JOUEURS EN DIRECT</div>
          {PLAYERS.map((p, i) => {
            const co = playerCashouts[p.name];
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "var(--surface)", borderRadius: 7, marginBottom: 5, border: `1px solid ${co ? "rgba(0,230,118,0.2)" : "var(--border)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{p.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--gold)" }}>{p.stake} coins</div>
                  {co && <div style={{ fontSize: 9, color: "#00e676", fontFamily: "'DM Mono',monospace" }}>✅ {co}×</div>}
                </div>
              </div>
            );
          })}
          {uiPhase === "flying" && (
            <div style={{ marginTop: 10, textAlign: "center", padding: "12px", background: `${multColor}12`, borderRadius: 9, border: `1px solid ${multColor}40` }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, color: multColor, letterSpacing: 2, textShadow: `0 0 20px ${multColor}` }}>{uiMult.toFixed(2)}×</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
