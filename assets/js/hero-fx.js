// Hero motion scene: an amber drop of oud oil forms under the title, falls,
// and lands in a dark pool. Ripples spread, smoke curls up and moves away
// from the cursor, and embers drift. Plain 2D canvas, no libraries.

const hero = document.querySelector(".hero");
const canvas = hero && hero.querySelector(".fx");
if (canvas) init();

function init() {
  const ctx = canvas.getContext("2d");
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const title = hero.querySelector(".hero-title");
  const bottom = hero.querySelector(".hero-bottom > div");

  let W = 0, H = 0, DPR = 1, mobile = false;
  let srcX = 0, srcY = 0, poolX = 0, poolY = 0, poolRx = 0, poolRy = 0;

  // ---- sprites (pre-rendered once, drawn many times) ----
  const smokeSprite = sprite(128, [[0, "rgba(244,228,200,0.55)"], [0.45, "rgba(232,206,166,0.18)"], [1, "rgba(232,206,166,0)"]]);
  const glowSprite = sprite(128, [[0, "rgba(255,190,110,0.9)"], [0.3, "rgba(240,150,60,0.35)"], [1, "rgba(200,110,40,0)"]]);

  function sprite(size, stops) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => r.addColorStop(o, col));
    g.fillStyle = r;
    g.fillRect(0, 0, size, size);
    return c;
  }

  // ---- layout ----
  function layout() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    mobile = W < 641;
    DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    const t = title.getBoundingClientRect();
    srcX = W * 0.5;
    srcY = t.bottom - r.top + (mobile ? 6 : 10);
    poolX = srcX;
    if (mobile) {
      const b = bottom.getBoundingClientRect();
      poolY = Math.max(srcY + 120, b.top - r.top - 40);
      poolRx = W * 0.3;
    } else {
      poolY = H * 0.86;
      poolRx = Math.min(W * 0.11, 240);
    }
    poolRy = poolRx * 0.16;
  }

  // ---- drop ----
  const G = 2600; // px/s^2
  const drop = { phase: "grow", t: 0, y: 0, v: 0, r: 0 };
  const R = () => (mobile ? 10 : Math.min(18, W * 0.011));
  const GROW = 2.2, HANG = 0.5, REST = 0.9;

  const ripples = [];
  const splashes = [];
  let flash = 0;

  function stepDrop(dt) {
    drop.t += dt;
    if (drop.phase === "grow") {
      const k = Math.min(drop.t / GROW, 1);
      drop.r = R() * easeOut(k);
      drop.y = srcY + drop.r * 1.2 + k * R() * 0.9;
      if (drop.t > GROW + HANG) { drop.phase = "fall"; drop.t = 0; drop.v = 40; }
    } else if (drop.phase === "fall") {
      drop.v += G * dt;
      drop.y += drop.v * dt;
      if (drop.y + drop.r >= poolY) impact();
    } else if (drop.phase === "rest" && drop.t > REST) {
      drop.phase = "grow"; drop.t = 0; drop.r = 0;
    }
  }

  function impact() {
    drop.phase = "rest"; drop.t = 0;
    flash = 1;
    for (let i = 0; i < 4; i++) ripples.push({ age: -i * 0.28, life: 2.6 });
    const n = mobile ? 6 : 10;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const s = 260 + Math.random() * 380;
      splashes.push({ x: poolX, y: poolY, vx: Math.cos(a) * s * 0.6, vy: Math.sin(a) * s, r: 1.5 + Math.random() * 2.5, life: 1 });
    }
    // a puff of smoke rises from the impact
    for (let i = 0; i < 8; i++) spawnSmoke(true);
  }

  // ---- smoke ----
  const smoke = [];
  const SMOKE_MAX = REDUCED ? 26 : mobile ? 40 : 80;
  function spawnSmoke(burst = false) {
    const spread = burst ? poolRx * 0.35 : poolRx * 1.05;
    smoke.push({
      x: poolX + (Math.random() - 0.5) * 2 * spread,
      y: poolY - poolRy * 0.3,
      vx: (Math.random() - 0.5) * 12,
      vy: -(26 + Math.random() * 34) * (burst ? 1.6 : 1),
      age: 0,
      life: 6 + Math.random() * 5,
      s0: (mobile ? 30 : 46) * (0.7 + Math.random() * 0.6),
      seed: Math.random() * 1000,
      a: 0.09 + Math.random() * 0.1,
    });
  }

  // ---- embers ----
  const embers = [];
  const EMBER_MAX = REDUCED ? 0 : mobile ? 18 : 42;
  function spawnEmber(anyY = false) {
    embers.push({
      x: Math.random() * W,
      y: anyY ? Math.random() * H : H + 10,
      vy: -(14 + Math.random() * 30),
      r: 0.6 + Math.random() * 1.6,
      seed: Math.random() * 1000,
      tw: 1.5 + Math.random() * 3,
    });
  }

  // ---- pointer ----
  const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, on: false };
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (ptr.on) { ptr.vx = x - ptr.x; ptr.vy = y - ptr.y; }
    ptr.x = x; ptr.y = y; ptr.on = true;
  });
  hero.addEventListener("pointerleave", () => { ptr.on = false; ptr.x = ptr.y = -9999; });

  // ---- render ----
  let time = 0;
  function frame(dt) {
    time += dt;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // warm breathing light behind the pool
    const breathe = 0.85 + Math.sin(time * 0.8) * 0.15 + flash * 0.5;
    ctx.globalCompositeOperation = "screen";
    const gr = poolRx * 2.6;
    ctx.globalAlpha = 0.42 * breathe;
    ctx.drawImage(glowSprite, poolX - gr, poolY - gr * 0.75, gr * 2, gr * 1.5);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    drawPool();

    // ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.age += dt;
      if (rp.age >= rp.life) { ripples.splice(i, 1); continue; }
      if (rp.age < 0) continue;
      const k = rp.age / rp.life;
      const rx = poolRx * (0.06 + easeOut(k) * 0.92);
      ctx.beginPath();
      ctx.ellipse(poolX, poolY, rx, rx * (poolRy / poolRx), 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(240,184,110,${(1 - k) * 0.55})`;
      ctx.lineWidth = (1 - k) * 2 + 0.5;
      ctx.stroke();
    }

    drawThread();
    if (drop.phase !== "rest") drawDrop(srcX, drop.y, drop.r, drop.phase === "fall" ? Math.min(drop.v / 900, 1) : 0);

    // splash droplets
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.vy += G * 0.55 * dt;
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y > poolY && s.vy > 0) { splashes.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(246,190,110,0.95)";
      ctx.fill();
    }

    // smoke
    if (smoke.length < SMOKE_MAX && Math.random() < dt * (mobile ? 6 : 11)) spawnSmoke();
    ctx.globalCompositeOperation = "screen";
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.age += dt;
      if (p.age > p.life || p.y < -200) { smoke.splice(i, 1); continue; }
      const k = p.age / p.life;
      // curling drift
      const curl = Math.sin(time * 0.5 + p.seed + p.y * 0.006) * 22 + Math.sin(time * 0.23 + p.seed * 2 + p.y * 0.017) * 12;
      p.vx += (curl - p.vx) * dt * 0.6;
      // cursor pushes smoke aside
      if (ptr.on) {
        const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy, R2 = 170 * 170;
        if (d2 < R2) {
          const f = (1 - d2 / R2) * 520;
          const d = Math.sqrt(d2) || 1;
          p.vx += (dx / d) * f * dt + ptr.vx * 0.9 * dt * 6;
          p.vy += (dy / d) * f * dt * 0.6 + ptr.vy * 0.9 * dt * 6;
        }
      }
      p.vx *= 1 - dt * 0.4;
      p.vy += (-(30) - p.vy) * dt * 0.3;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const size = p.s0 * (1 + k * 3.2);
      ctx.globalAlpha = p.a * Math.sin(Math.PI * Math.min(k * 1.15, 1));
      ctx.drawImage(smokeSprite, p.x - size / 2, p.y - size / 2, size, size);
    }

    // embers
    while (embers.length < EMBER_MAX) spawnEmber(time < 0.1);
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.y += e.vy * dt;
      e.x += Math.sin(time * 0.7 + e.seed) * 10 * dt;
      if (ptr.on) {
        const dx = e.x - ptr.x, dy = e.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) { const d = Math.sqrt(d2) || 1; e.x += (dx / d) * 60 * dt; e.y += (dy / d) * 60 * dt; }
      }
      if (e.y < -10) { embers.splice(i, 1); continue; }
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(time * e.tw + e.seed));
      const fade = Math.min(1, (H - e.y) / 120) * Math.min(1, e.y / 160);
      ctx.globalAlpha = tw * fade * 0.9;
      const s = e.r * 7;
      ctx.drawImage(glowSprite, e.x - s, e.y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    flash = Math.max(0, flash - dt * 1.6);
  }

  function drawPool() {
    // dark oil pool: drawn as a circle squashed into an ellipse so the
    // gradient fades evenly to the edge (no hard rim)
    const sy = poolRy / poolRx;
    ctx.save();
    ctx.translate(poolX, poolY);
    ctx.scale(1, sy);
    let g = ctx.createRadialGradient(0, 0, 0, 0, 0, poolRx * 1.25);
    g.addColorStop(0, "rgba(10,5,2,0.95)");
    g.addColorStop(0.6, "rgba(14,7,3,0.8)");
    g.addColorStop(1, "rgba(14,7,3,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, poolRx * 1.25, 0, Math.PI * 2); ctx.fill();
    // amber light caught on the oil surface
    g = ctx.createRadialGradient(0, -poolRx * 0.15, 0, 0, 0, poolRx);
    g.addColorStop(0, `rgba(214,130,50,${0.55 + flash * 0.35})`);
    g.addColorStop(0.5, "rgba(140,70,20,0.28)");
    g.addColorStop(1, "rgba(80,36,10,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, poolRx, 0, Math.PI * 2); ctx.fill();
    // slow sliding highlight
    const hx = Math.sin(time * 0.4) * poolRx * 0.3;
    g = ctx.createRadialGradient(hx, -poolRx * 0.2, 0, hx, -poolRx * 0.2, poolRx * 0.38);
    g.addColorStop(0, `rgba(255,226,170,${0.28 + flash * 0.3})`);
    g.addColorStop(1, "rgba(255,226,170,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(hx, -poolRx * 0.2, poolRx * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawThread() {
    // thin film of oil from the title to the forming drop
    if (drop.phase !== "grow") return;
    const top = srcY - 2, end = drop.y - drop.r;
    if (end <= top) return;
    const wob = Math.sin(time * 3) * 0.6;
    const g = ctx.createLinearGradient(0, top, 0, end);
    g.addColorStop(0, "rgba(220,160,90,0.0)");
    g.addColorStop(1, "rgba(236,170,90,0.9)");
    ctx.beginPath();
    ctx.moveTo(srcX - 1.4, top);
    ctx.quadraticCurveTo(srcX + wob, (top + end) / 2, srcX - drop.r * 0.35, end + 1);
    ctx.lineTo(srcX + drop.r * 0.35, end + 1);
    ctx.quadraticCurveTo(srcX + wob, (top + end) / 2, srcX + 1.4, top);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function drawDrop(x, y, r, stretch) {
    if (r < 0.5) return;
    const tail = r * (1.5 + stretch * 1.6);
    // glow
    ctx.globalCompositeOperation = "screen";
    const gs = r * 6;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(glowSprite, x - gs, y - gs, gs * 2, gs * 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    // teardrop body
    ctx.beginPath();
    ctx.moveTo(x, y - r - tail);
    ctx.bezierCurveTo(x + r * 0.25, y - r - tail * 0.45, x + r, y - r * 0.6, x + r, y);
    ctx.arc(x, y, r, 0, Math.PI);
    ctx.bezierCurveTo(x - r, y - r * 0.6, x - r * 0.25, y - r - tail * 0.45, x, y - r - tail);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.2, r * 0.1, x, y, r * 1.6);
    g.addColorStop(0, "#ffd99a");
    g.addColorStop(0.35, "#d48a36");
    g.addColorStop(0.8, "#5a2a08");
    g.addColorStop(1, "#2a1204");
    ctx.fillStyle = g;
    ctx.fill();
    // specular
    ctx.beginPath();
    ctx.ellipse(x - r * 0.38, y - r * 0.3, r * 0.22, r * 0.36, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,248,230,0.85)";
    ctx.fill();
  }

  // ---- loop control ----
  let raf = 0, last = 0, visible = true, started = false;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
    last = now;
    stepDrop(dt);
    frame(dt);
  }
  function start() {
    if (raf || REDUCED || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function staticFrame() {
    // reduced motion: one still frame with a hanging drop and some smoke
    drop.phase = "grow"; drop.t = GROW; stepDrop(0);
    for (let i = 0; i < SMOKE_MAX; i++) { spawnSmoke(); const p = smoke[i]; p.age = Math.random() * p.life * 0.7; p.y -= p.age * 30; }
    frame(0);
  }

  layout();
  new ResizeObserver(() => { layout(); if (REDUCED) staticFrame(); }).observe(hero);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  const go = () => {
    if (started) return;
    started = true;
    layout();
    canvas.classList.add("on");
    REDUCED ? staticFrame() : start();
  };
  // wait for the loader so the first drop is seen; fall back after 3 s
  if (window.__ready) go();
  else {
    const iv = setInterval(() => { if (window.__ready) { clearInterval(iv); setTimeout(go, 300); } }, 100);
    setTimeout(() => { clearInterval(iv); go(); }, 3000);
  }
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
