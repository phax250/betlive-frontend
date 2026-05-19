import { useState, useEffect, useRef, useCallback } from "react";

// Physique du wheelie
const GRAVITY = 0.4;
const BALANCE_ZONE = 15; // degrés de tolérance
const TILT_SPEED = 2.5;
const SPEED_INCREASE = 0.08;
const MAX_SPEED = 18;

export default function WheelieGame({ coins, setCoins }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const gameRef = useRef({
    phase: "idle", // idle | countdown | playing | crashed | win
    angle: 0,         // angle de la moto (0 = à plat, 90 = wheelie parfait)
    angleVel: 0,      // vitesse angulaire
    speed: 4,         // vitesse de déplacement
    distance: 0,      // distance parcourue
    x: 150,           // position X moto
    rearWheelY: 300,  // position Y roue arrière
    frontWheelY: 300, // position Y roue avant
    countdown: 3,
    bgOffset: 0,
    wheelRotation: 0,
    flames: [],
    crashed: false,
    crashTimer: 0,
    grassOffset: 0,
    cloudOffset: 0,
    clouds: [
      { x: 100, y: 40, w: 80, speed: 0.3 },
      { x: 350, y: 70, w: 60, speed: 0.2 },
      { x: 550, y: 30, w: 100, speed: 0.4 },
    ],
    trees: Array.from({ length: 8 }, (_, i) => ({ x: 100 + i * 150, h: 60 + Math.random() * 40, type: Math.floor(Math.random() * 3) })),
    multiplier: 1.00,
    targetAngle: 75, // angle idéal wheelie
    wobble: 0,
    wobbleDir: 1,
    dust: [],
  });

  const [phase, setPhase] = useState("idle");
  const [stake, setStake] = useState("100");
  const [distance, setDistance] = useState(0);
  const [multiplier, setMultiplier] = useState(1.00);
  const [countdown, setCountdown] = useState(3);
  const [angle, setAngle] = useState(0);
  const [history, setHistory] = useState([]);
  const [highScore, setHighScore] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutDist, setCashoutDist] = useState(0);

  const stakeRef = useRef("100");
  const phaseRef = useRef("idle");
  const cashedOutRef = useRef(false);
  useEffect(() => { stakeRef.current = stake; }, [stake]);

  const keys = useRef({ left: false, right: false, space: false });

  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = true;
      if (e.key === " " || e.key === "ArrowUp") { keys.current.space = true; e.preventDefault(); }
    };
    const onUp = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = false;
      if (e.key === " " || e.key === "ArrowUp") keys.current.space = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  const drawMoto = (ctx, x, centerY, angle, wheelRot, crashed) => {
    ctx.save();
    ctx.translate(x, centerY);
    ctx.rotate(-(angle * Math.PI / 180));

    const WHEEL_R = 22;
    const BODY_L = 80;

    if (crashed) {
      // Moto cassée
      ctx.save();
      ctx.rotate(0.8);
      ctx.translate(-20, 10);
    }

    // Roue arrière
    ctx.save();
    ctx.translate(-BODY_L / 2, 0);
    ctx.beginPath();
    ctx.arc(0, 0, WHEEL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
    ctx.strokeStyle = "#5a5a7a";
    ctx.lineWidth = 4;
    ctx.stroke();
    // Rayons
    for (let i = 0; i < 6; i++) {
      const a = wheelRot + i * (Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * WHEEL_R * 0.85, Math.sin(a) * WHEEL_R * 0.85);
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // Roue avant
    ctx.save();
    ctx.translate(BODY_L / 2, 0);
    ctx.beginPath();
    ctx.arc(0, 0, WHEEL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
    ctx.strokeStyle = "#5a5a7a";
    ctx.lineWidth = 4;
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = wheelRot + i * (Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * WHEEL_R * 0.85, Math.sin(a) * WHEEL_R * 0.85);
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // Cadre moto
    ctx.strokeStyle = "#e8f0fe";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Bras de fourche avant
    ctx.beginPath();
    ctx.moveTo(20, -15);
    ctx.lineTo(BODY_L / 2, 0);
    ctx.strokeStyle = "#a0b0d0";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Cadre principal
    ctx.beginPath();
    ctx.moveTo(-BODY_L / 2, 0);
    ctx.lineTo(0, -20);
    ctx.lineTo(20, -15);
    ctx.strokeStyle = "#e8f0fe";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Bras oscillant arrière
    ctx.beginPath();
    ctx.moveTo(-BODY_L / 2, 0);
    ctx.lineTo(-5, -8);
    ctx.strokeStyle = "#a0b0d0";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Réservoir / carénage
    ctx.fillStyle = "#ff3b5c";
    ctx.beginPath();
    ctx.ellipse(-5, -22, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c82040";
    ctx.beginPath();
    ctx.ellipse(-5, -22, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Guidon
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, -30);
    ctx.lineTo(25, -30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(18, -30, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#666";
    ctx.fill();

    // Pilote
    // Corps
    ctx.fillStyle = "#ff9a3c";
    ctx.beginPath();
    ctx.ellipse(5, -38, 8, 14, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Casque
    ctx.fillStyle = "#f5c842";
    ctx.beginPath();
    ctx.arc(12, -50, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.arc(15, -49, 5, -0.3, 0.5);
    ctx.fill();
    // Bras
    ctx.strokeStyle = "#ff9a3c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10, -40);
    ctx.lineTo(22, -32);
    ctx.stroke();

    // Échappement (flammes si wheelie)
    if (angle > 40) {
      for (let f = 0; f < 6; f++) {
        const fx = -BODY_L / 2 - 8 - f * 6;
        const fy = 5 + Math.sin(Date.now() / 80 + f) * 4;
        const fsize = 8 - f;
        const alpha = 1 - f / 6;
        ctx.beginPath();
        ctx.arc(fx, fy, fsize, 0, Math.PI * 2);
        const fc = f < 2 ? `rgba(255,255,200,${alpha})` : f < 4 ? `rgba(255,150,0,${alpha})` : `rgba(255,50,0,${alpha * 0.5})`;
        ctx.fillStyle = fc;
        ctx.fill();
      }
    }

    if (crashed) ctx.restore();
    ctx.restore();
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const g = gameRef.current;

    ctx.clearRect(0, 0, W, H);

    // Ciel dégradé
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    skyGrad.addColorStop(0, "#1a0a2e");
    skyGrad.addColorStop(0.5, "#0e1a3a");
    skyGrad.addColorStop(1, "#0a2818");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Soleil / lune
    ctx.beginPath();
    ctx.arc(W - 80, 60, 35, 0, Math.PI * 2);
    const sunGrad = ctx.createRadialGradient(W - 80, 60, 0, W - 80, 60, 35);
    sunGrad.addColorStop(0, "#f5c842");
    sunGrad.addColorStop(0.6, "#ff9a3c");
    sunGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // Nuages
    g.clouds.forEach(cloud => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.w < 0) cloud.x = W + cloud.w;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.w / 2, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x - 20, cloud.y + 5, cloud.w / 3, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Montagnes en fond
    ctx.fillStyle = "rgba(20,30,60,0.8)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.55);
    for (let x = 0; x <= W; x += 60) {
      const my = H * 0.55 - Math.sin((x + g.bgOffset * 0.3) * 0.015) * 80 - Math.cos((x + g.bgOffset * 0.1) * 0.025) * 40;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fill();

    // Sol (herbe)
    const groundY = H * 0.72;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, "#1a4a1a");
    groundGrad.addColorStop(0.2, "#143c14");
    groundGrad.addColorStop(1, "#0a200a");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Lignes de route
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 20]);
    ctx.lineDashOffset = -g.bgOffset % 50;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 2);
    ctx.lineTo(W, groundY + 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Herbe détail
    for (let i = 0; i < 20; i++) {
      const gx = ((i * 80 + g.bgOffset * 0.5) % (W + 20)) - 10;
      const gy = groundY;
      ctx.strokeStyle = "rgba(50,160,50,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.quadraticCurveTo(gx + 3, gy - 10, gx + 6, gy - 6);
      ctx.stroke();
    }

    // Arbres
    g.trees.forEach(tree => {
      const tx = ((tree.x - g.bgOffset * 0.8) % (W + 200) + W + 200) % (W + 200) - 100;
      const ty = groundY;
      // Tronc
      ctx.fillStyle = "#5c3d1e";
      ctx.fillRect(tx - 5, ty - tree.h * 0.4, 10, tree.h * 0.4);
      // Feuillage
      ctx.fillStyle = "#1a6b1a";
      ctx.beginPath();
      ctx.arc(tx, ty - tree.h * 0.5, tree.h * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#22882a";
      ctx.beginPath();
      ctx.arc(tx + 10, ty - tree.h * 0.55, tree.h * 0.25, 0, Math.PI * 2);
      ctx.fill();
    });

    // Poussière (quand wheelie)
    if (g.phase === "playing" && g.angle > 30) {
      if (Math.random() < 0.3) {
        g.dust.push({ x: 120, y: groundY, vx: -2 - Math.random() * 2, vy: -Math.random() * 2, life: 1, size: 4 + Math.random() * 6 });
      }
    }
    g.dust = g.dust.filter(d => d.life > 0);
    g.dust.forEach(d => {
      d.x += d.vx; d.y += d.vy; d.vy -= 0.05; d.life -= 0.05;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,140,80,${d.life * 0.4})`;
      ctx.fill();
    });

    // Moto
    const motoX = 180;
    const motoY = groundY - 22;
    drawMoto(ctx, motoX, motoY, g.angle, g.wheelRotation, g.crashed);

    // Indicateur d'angle (jauge de wheelie)
    const gaugeX = W - 50, gaugeY = H / 2;
    const gaugeH = 160;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.roundRect(gaugeX - 15, gaugeY - gaugeH / 2, 30, gaugeH, 8);
    ctx.fill();

    const normalizedAngle = Math.max(0, Math.min(1, g.angle / 90));
    const targetNorm = g.targetAngle / 90;
    const gaugeColor = Math.abs(g.angle - g.targetAngle) < BALANCE_ZONE
      ? "#00e676" : Math.abs(g.angle - g.targetAngle) < BALANCE_ZONE * 2
        ? "#f5c842" : "#ff3b5c";

    // Zone idéale
    const idealStart = gaugeY + gaugeH / 2 - targetNorm * gaugeH - 15;
    ctx.fillStyle = "rgba(0,230,118,0.2)";
    ctx.fillRect(gaugeX - 13, idealStart, 26, 30);

    // Barre actuelle
    ctx.fillStyle = gaugeColor;
    const barH = normalizedAngle * gaugeH;
    ctx.beginPath();
    ctx.roundRect(gaugeX - 12, gaugeY + gaugeH / 2 - barH, 24, barH, 4);
    ctx.fill();

    // Label
    ctx.fillStyle = gaugeColor;
    ctx.font = "bold 11px 'DM Mono',monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(g.angle)}°`, gaugeX, gaugeY + gaugeH / 2 + 18);
    ctx.fillStyle = "rgba(90,112,144,0.8)";
    ctx.font = "9px 'DM Mono',monospace";
    ctx.fillText("ANGLE", gaugeX, gaugeY + gaugeH / 2 + 30);

    // Distance & multiplicateur
    if (g.phase === "playing" || g.phase === "crashed") {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath();
      ctx.roundRect(10, 10, 180, 55, 10);
      ctx.fill();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 22px 'Bebas Neue',sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${Math.round(g.distance)}m`, 20, 38);

      ctx.fillStyle = g.multiplier < 3 ? "#00e676" : g.multiplier < 6 ? "#f5c842" : "#ff3b5c";
      ctx.font = "bold 18px 'Bebas Neue',sans-serif";
      ctx.fillText(`×${g.multiplier.toFixed(2)}`, 100, 38);

      ctx.fillStyle = "rgba(90,112,144,0.8)";
      ctx.font = "9px 'DM Mono',monospace";
      ctx.fillText("DISTANCE  MULTIPLICATEUR", 20, 55);
    }

    // Countdown
    if (g.phase === "countdown") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = "bold 80px 'Bebas Neue',sans-serif";
      ctx.fillStyle = "var(--accent)";
      ctx.textAlign = "center";
      ctx.shadowColor = "var(--accent)";
      ctx.shadowBlur = 30;
      ctx.fillText(g.countdown, W / 2, H / 2 + 25);
      ctx.shadowBlur = 0;
      ctx.font = "bold 18px 'Syne',sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("TIENS LE WHEELIE !", W / 2, H / 2 + 65);
    }

    // Crash
    if (g.phase === "crashed") {
      ctx.fillStyle = "rgba(255,59,92,0.15)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = "bold 42px 'Bebas Neue',sans-serif";
      ctx.fillStyle = "#ff3b5c";
      ctx.textAlign = "center";
      ctx.shadowColor = "#ff3b5c";
      ctx.shadowBlur = 20;
      ctx.fillText("💥 CRASH !", W / 2, H / 2 - 10);
      ctx.shadowBlur = 0;
      ctx.font = "bold 16px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`Distance: ${Math.round(g.distance)}m · ×${g.multiplier.toFixed(2)}`, W / 2, H / 2 + 25);
    }

    // Idle
    if (g.phase === "idle") {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = "bold 32px 'Bebas Neue',sans-serif";
      ctx.fillStyle = "var(--accent)";
      ctx.textAlign = "center";
      ctx.fillText("🏍️ WHEELIE MX", W / 2, H / 2 - 30);
      ctx.font = "14px 'Syne',sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("← → ou A/D pour équilibrer • ESPACE pour cacher", W / 2, H / 2 + 10);
      ctx.font = "12px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(0,229,255,0.6)";
      ctx.fillText("Plus tu roules longtemps en wheelie = plus tu multiplies !", W / 2, H / 2 + 35);
    }

    animRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  // Boucle physique
  const physicsRef = useRef(null);

  const startGame = () => {
    const s = parseInt(stakeRef.current);
    if (isNaN(s) || s <= 0 || s > coins) return;
    setCoins(c => c - s);
    setCashedOut(false); cashedOutRef.current = false;
    setCashoutDist(0);

    const g = gameRef.current;
    g.phase = "countdown";
    g.countdown = 3;
    g.angle = 0;
    g.angleVel = 0;
    g.speed = 4;
    g.distance = 0;
    g.multiplier = 1.00;
    g.crashed = false;
    g.dust = [];
    g.bgOffset = 0;
    setPhase("countdown"); phaseRef.current = "countdown";
    setCountdown(3);
    setDistance(0);
    setMultiplier(1.00);

    let cd = 3;
    const cdInterval = setInterval(() => {
      cd--;
      gameRef.current.countdown = cd;
      setCountdown(cd);
      if (cd <= 0) {
        clearInterval(cdInterval);
        gameRef.current.phase = "playing";
        setPhase("playing"); phaseRef.current = "playing";
        startPhysics();
      }
    }, 1000);
  };

  const startPhysics = () => {
    clearInterval(physicsRef.current);
    physicsRef.current = setInterval(() => {
      const g = gameRef.current;
      if (g.phase !== "playing") return;

      // Tilt selon touches
      if (keys.current.left) g.angleVel -= TILT_SPEED * 0.15;  // penche en avant
      if (keys.current.right) g.angleVel += TILT_SPEED * 0.15; // wheelie plus haut

      // Gravité qui ramène vers l'avant
      const gravityEffect = GRAVITY * Math.cos(g.angle * Math.PI / 180);
      g.angleVel -= gravityEffect * 0.3;

      // Amortissement
      g.angleVel *= 0.88;

      // Mettre à jour angle
      g.angle += g.angleVel;
      g.angle = Math.max(-5, Math.min(95, g.angle));

      // Roue avant touche le sol (crash si angle < -5 ou > 95)
      if (g.angle > 92) {
        // Trop en arrière = crash
        doCrash("trop en arrière !");
        return;
      }
      if (g.angle < -3) {
        // Avant touche = crash
        doCrash("l'avant a touché !");
        return;
      }

      // Wheelie actif si angle > 30
      const isWheeling = g.angle > 30;

      if (isWheeling) {
        g.speed = Math.min(g.speed + SPEED_INCREASE, MAX_SPEED);
        g.distance += g.speed * 0.05;
        g.bgOffset += g.speed;
        g.multiplier = 1 + g.distance / 50;
        g.wheelRotation += g.speed * 0.05;
      } else {
        g.speed = Math.max(g.speed - 0.05, 3);
        g.bgOffset += g.speed * 0.5;
        g.wheelRotation += g.speed * 0.05;
      }

      setAngle(Math.round(g.angle));
      setDistance(Math.round(g.distance));
      setMultiplier(+g.multiplier.toFixed(2));
    }, 1000 / 60);
  };

  const doCrash = (reason) => {
    const g = gameRef.current;
    g.phase = "crashed";
    g.crashed = true;
    clearInterval(physicsRef.current);
    setPhase("crashed"); phaseRef.current = "crashed";
    const finalDist = Math.round(g.distance);
    const finalMult = +g.multiplier.toFixed(2);
    setHistory(h => [{ dist: finalDist, mult: finalMult, won: false }, ...h.slice(0, 9)]);
    if (finalDist > highScore) setHighScore(finalDist);
    setTimeout(() => {
      gameRef.current.phase = "idle";
      gameRef.current.crashed = false;
      setPhase("idle"); phaseRef.current = "idle";
    }, 3000);
  };

  const doCashout = () => {
    const g = gameRef.current;
    if (g.phase !== "playing" || cashedOutRef.current) return;
    const s = parseInt(stakeRef.current);
    const gain = Math.floor(s * g.multiplier);
    setCoins(c => c + gain);
    cashedOutRef.current = true;
    setCashedOut(true);
    setCashoutDist(Math.round(g.distance));
    const finalDist = Math.round(g.distance);
    const finalMult = +g.multiplier.toFixed(2);
    setHistory(h => [{ dist: finalDist, mult: finalMult, won: true, gain }, ...h.slice(0, 9)]);
    if (finalDist > highScore) setHighScore(finalDist);
    g.phase = "crashed"; g.crashed = true;
    clearInterval(physicsRef.current);
    setPhase("crashed"); phaseRef.current = "crashed";
    setTimeout(() => {
      gameRef.current.phase = "idle";
      gameRef.current.crashed = false;
      setPhase("idle"); phaseRef.current = "idle";
    }, 2500);
  };

  useEffect(() => () => clearInterval(physicsRef.current), []);

  const multColor = multiplier < 2 ? "#00e676" : multiplier < 5 ? "#f5c842" : "#ff3b5c";
  const angleStatus = angle > 60 && angle < 88 ? "🟢 PARFAIT" : angle > 30 ? "🟡 TIENS" : "🔴 TROP BAS";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Canvas */}
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `2px solid ${phase === "playing" ? "#00e676" : phase === "crashed" ? "rgba(255,59,92,0.5)" : "var(--border)"}`, boxShadow: phase === "playing" ? "0 0 20px rgba(0,230,118,0.15)" : "none" }}>
        <canvas ref={canvasRef} width={700} height={380} style={{ display: "block", width: "100%", height: "auto" }} />
        {/* Cashout rapide */}
        {phase === "playing" && !cashedOut && (
          <button onClick={doCashout}
            style={{ position: "absolute", bottom: 12, right: 12, background: "linear-gradient(135deg,#00e676,#00a854)", border: "none", color: "#000", borderRadius: 9, padding: "10px 18px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 1, cursor: "pointer", boxShadow: "0 0 20px rgba(0,230,118,0.4)" }}>
            💰 CACHER ×{multiplier.toFixed(2)} = +{Math.floor(parseInt(stake || 0) * multiplier)}
          </button>
        )}
        {cashedOut && (
          <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.85)", border: "2px solid #00e676", borderRadius: 10, padding: "8px 16px" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "#00e676" }}>✅ CACHÉ À {cashoutDist}m · ×{(cashoutDist / 50 + 1).toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {/* Mise & Démarrage */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2, marginBottom: 8 }}>🏍️ MISE</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {[50, 100, 250, 500].map(v => (
              <button key={v} onClick={() => setStake(String(v))} disabled={phase !== "idle"}
                style={{ flex: 1, padding: "4px 0", border: `1px solid ${stake === String(v) ? "var(--accent)" : "var(--border)"}`, background: stake === String(v) ? "rgba(0,229,255,0.1)" : "var(--surface)", borderRadius: 5, color: stake === String(v) ? "var(--accent)" : "var(--muted)", fontFamily: "'DM Mono',monospace", fontSize: 9, cursor: "pointer" }}>{v}</button>
            ))}
          </div>
          <input type="number" value={stake} onChange={e => setStake(e.target.value)} disabled={phase !== "idle"}
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "7px", color: "var(--text)", fontFamily: "'DM Mono',monospace", fontSize: 12, outline: "none", marginBottom: 8 }} />
          <button onClick={startGame} disabled={phase !== "idle"}
            style={{ width: "100%", padding: 10, borderRadius: 9, border: "none", background: phase === "idle" ? "linear-gradient(135deg,#ff9a3c,#c87000)" : "var(--surface)", color: phase === "idle" ? "#000" : "var(--muted)", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 1, cursor: phase === "idle" ? "pointer" : "not-allowed" }}>
            {phase === "idle" ? "🏍️ DÉMARRER" : phase === "countdown" ? `${countdown}...` : phase === "playing" ? "EN COURSE !" : "CRASH !"}
          </button>
        </div>

        {/* Stats live */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2, marginBottom: 10 }}>STATS LIVE</div>
          {[
            { label: "Distance", value: `${distance}m`, color: "var(--accent)" },
            { label: "Multiplicateur", value: `×${multiplier.toFixed(2)}`, color: multColor },
            { label: "Angle wheelie", value: `${angle}°`, color: angle > 60 ? "#00e676" : angle > 30 ? "#f5c842" : "#ff3b5c" },
            { label: "Status", value: angleStatus, color: "var(--text)" },
            { label: "Record", value: `${highScore}m`, color: "var(--gold)" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(30,45,69,0.4)" }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>{s.label}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: s.color, fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Contrôles & Historique */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>CONTRÔLES</div>
          <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.8, marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>
            <div>← / A → Penche en avant</div>
            <div>→ / D → Wheelie plus haut</div>
            <div>ESPACE → Cacher les gains</div>
            <div style={{ color: "var(--accent)", marginTop: 4 }}>Zone idéale : 60°–85°</div>
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, letterSpacing: 2, marginBottom: 6 }}>HISTORIQUE</div>
          {history.slice(0, 4).map((h, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "3px 6px", background: "var(--surface)", borderRadius: 5, marginBottom: 3, border: `1px solid ${h.won ? "rgba(0,230,118,0.2)" : "rgba(255,59,92,0.15)"}` }}>
              <span style={{ color: "var(--muted)" }}>{h.dist}m · ×{h.mult}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", color: h.won ? "#00e676" : "#ff3b5c" }}>{h.won ? `+${h.gain}` : "crash"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
