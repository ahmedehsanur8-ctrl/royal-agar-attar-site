// Royal Agar Attar v3 — motion + interaction. No framework; Lenis for smooth scroll.
import Lenis from "lenis";

const WA = "8801819420122";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE = matchMedia("(max-width: 768px)");
const html = document.documentElement;
window.dataLayer = window.dataLayer || [];
const track = (event, params = {}) => {
  const o = { event };
  for (const k in params) if (params[k]) o[k] = params[k];
  window.dataLayer.push(o);
};

/* ---------- Adaptive rem: scale up above 1920 ---------- */
function fitRem() {
  const FONT_BASE = 16, BASE_W = 1920, COEF = 0.6666;
  const reduction = ((BASE_W - innerWidth) / BASE_W) * 100 * COEF;
  const size = FONT_BASE - (FONT_BASE * reduction) / 100;
  if (size > FONT_BASE) html.style.fontSize = size + "px";
  else html.style.removeProperty("font-size");
}
fitRem();
addEventListener("resize", fitRem);

/* ---------- Lenis ---------- */
history.scrollRestoration = "manual";
window.scrollTo(0, 0);
const lenis = new Lenis({ smoothWheel: true });
const lock = () => { lenis.stop(); html.classList.add("is-locked"); };
const unlock = () => { lenis.start(); html.classList.remove("is-locked"); };

/* ---------- Spring engine (react-spring style tension/friction, mass 1) ---------- */
const springs = new Set();
const KEYS = ["opacity", "x", "y", "scale", "rotate"];
const DEF = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 };
function state(el) {
  if (!el._sp) el._sp = { v: {}, x: { ...DEF }, target: { ...DEF }, cfg: { tension: 170, friction: 26 } };
  return el._sp;
}
function setNow(el, vals) {
  const s = state(el);
  Object.assign(s.x, vals); Object.assign(s.target, vals);
  KEYS.forEach((k) => (s.v[k] = 0));
  paint(el);
}
function springTo(el, vals, cfg = {}, delay = 0) {
  const go = () => {
    const s = state(el);
    Object.assign(s.target, vals);
    s.cfg = { tension: 170, friction: 26, ...cfg };
    if (REDUCED) { Object.assign(s.x, s.target); paint(el); return; }
    springs.add(el);
  };
  delay ? setTimeout(go, delay) : go();
}
function paint(el) {
  const { x } = el._sp;
  const xs = el.dataset.unit === "%" ? "%" : "px";
  el.style.transform = `translate3d(${x.x}${xs},${x.y}px,0) scale(${x.scale}) rotate(${x.rotate}deg)`;
  el.style.opacity = x.opacity;
}
let last = performance.now();
function stepSprings(now) {
  let dt = Math.min((now - last) / 1000, 0.064);
  last = now;
  springs.forEach((el) => {
    const s = el._sp; let moving = false;
    const steps = Math.ceil(dt / 0.002), h = dt / steps;
    for (let i = 0; i < steps; i++) {
      for (const k of KEYS) {
        const v = s.v[k] || 0, d = s.x[k] - s.target[k];
        const a = -s.cfg.tension * d - s.cfg.friction * v;
        s.v[k] = v + a * h; s.x[k] += s.v[k] * h;
      }
    }
    for (const k of KEYS) {
      const tol = k === "opacity" || k === "scale" ? 0.0005 : 0.01;
      if (Math.abs(s.x[k] - s.target[k]) > tol || Math.abs(s.v[k]) > tol) moving = true;
      else { s.x[k] = s.target[k]; s.v[k] = 0; }
    }
    paint(el);
    if (!moving) springs.delete(el);
  });
}

/* ---------- Parallax ---------- */
const parallax = [];
function addParallax(el, track, key, from, to) { parallax.push({ el, track, key, from, to }); }
function stepParallax() {
  const vh = innerHeight;
  for (const p of parallax) {
    const r = p.track.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    const val = p.from + (p.to - p.from) * t;
    p.el.style.transform = p.key === "y" ? `translate3d(0,${val}%,0)` : `translate3d(${val}%,0,0)`;
  }
}

function raf(t) { lenis.raf(t); stepSprings(t); if (!REDUCED) stepParallax(); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/* ---------- Text reveal builders ---------- */
function splitWords(el, cls = "words") {
  const words = el.textContent.trim().split(/\s+/);
  el.classList.add(cls);
  el.innerHTML = words.map((w) => `<span class="w"><span>${w}</span></span>`).join(" ");
  return [...el.querySelectorAll(".w > span")];
}
function stagger(spans, base, step, dur) {
  spans.forEach((s, i) => { s.style.setProperty("--delay", base + i * step + "ms"); s.style.setProperty("--d", dur + "ms"); });
}
// stacked lines: element contains .clip > span children
function prepStack(el) {
  const base = +(el.dataset.base || 0), step = +(el.dataset.stagger || 120), dur = +(el.dataset.dur || 950);
  stagger([...el.querySelectorAll(".clip > span")], base, step, dur);
}

/* ---------- In-view (play once) ---------- */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    io.unobserve(e.target);
    reveal(e.target);
  }
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

function reveal(el) {
  if (el.matches("[data-inview]")) {
    const from = JSON.parse(el.dataset.inview);
    const to = {}; for (const k in from) to[k] = DEF[k];
    const cfg = el.dataset.cfg ? JSON.parse(el.dataset.cfg) : {};
    springTo(el, to, cfg, +(el.dataset.delay || 0));
  } else {
    el.classList.add("is-in");
  }
}
function prepInview(el) { setNow(el, JSON.parse(el.dataset.inview)); }

/* ---------- Hover springs (desktop only) ---------- */
function hover(trigger, target, from, to, cfg) {
  setNow(target, from);
  trigger.addEventListener("pointerenter", () => { if (!MOBILE.matches) springTo(target, to, cfg); });
  trigger.addEventListener("pointerleave", () => { if (!MOBILE.matches) springTo(target, from, cfg); });
}

/* ---------- Setup reveals ---------- */
const heroTitle = document.getElementById("hero-title");
const heroSpans = splitWords(heroTitle);
heroTitle.querySelectorAll(".w")[heroSpans.length - 1]?.classList.add("gold");
stagger(heroSpans, 0, 140, 1100);
document.querySelectorAll("[data-stack]").forEach(prepStack);
document.querySelectorAll("[data-fadewords]").forEach((el) => {
  const sp = splitWords(el, "fade-words");
  stagger(sp, 250, 28, 700);
});
document.querySelectorAll("[data-inview]").forEach(prepInview);

const gated = [...document.querySelectorAll("[data-gate]")];
document.querySelectorAll("[data-stack]:not([data-gate]), [data-fadewords], [data-inview]:not([data-gate])").forEach((el) => io.observe(el));

/* ---------- Loader ---------- */
const loader = document.getElementById("loader");
const MIN_VISIBLE = REDUCED ? 200 : 1400, MAX_VISIBLE = 2600, EXIT = REDUCED ? 0 : 850;
lock();
const mark = loader.querySelector(".loader-mark");
setNow(mark, { opacity: 0, y: 16 });
springTo(mark, { opacity: 1, y: 0 }, { tension: 200, friction: 22 });
requestAnimationFrame(() => loader.classList.add("go"));
let started = false;
function startCountdown() {
  if (started) return; started = true;
  setTimeout(() => {
    window.__ready = true;
    heroTitle.classList.add("is-in");
    gated.forEach((el) => reveal(el));
    startCollection();
    unlock();
    loader.classList.add("exit");
    setTimeout(() => loader.remove(), EXIT + 50);
  }, MIN_VISIBLE);
}
document.readyState === "complete" ? startCountdown() : addEventListener("load", startCountdown);
setTimeout(startCountdown, MAX_VISIBLE - MIN_VISIBLE);

/* ---------- Hero parallax plate ---------- */
const hero = document.querySelector(".hero");
addParallax(document.querySelector(".hero-plate-inner"), hero, "y", 0, 12);

/* ---------- Hero scene: depth parallax on pointer (desktop) ---------- */
const layers = [...document.querySelectorAll(".scene .layer")];
layers.forEach((l) => setNow(l, { x: 0, y: 0 }));
hero.addEventListener("pointermove", (e) => {
  if (MOBILE.matches || REDUCED) return;
  const r = hero.getBoundingClientRect();
  const mx = (e.clientX - r.left) / r.width - 0.5, my = (e.clientY - r.top) / r.height - 0.5;
  layers.forEach((l) => { const d = +l.dataset.depth; springTo(l, { x: -mx * d * 28, y: -my * d * 14 }, { tension: 120, friction: 20 }); });
});
hero.addEventListener("pointerleave", () => layers.forEach((l) => springTo(l, { x: 0, y: 0 }, { tension: 120, friction: 20 })));

/* ---------- Collection slider (hero) ---------- */
const COLL = [
  { img: "assets/img/b-churon.webp", t1: "Original Churon", t2: "3–4 batches a year", cta: "Reserve from next batch", product: "Original Churon Oud",
    msg: "Hello, I'd like to reserve Original Churon Oud. When is your next batch?" },
  { img: "assets/img/b-luha.webp", t1: "Luha Churon", t2: "Small, occasional batches", cta: "Ask on WhatsApp", product: "Luha Churon Oud",
    msg: "Hello, I'm interested in Luha Churon Oud for wholesale." },
  { img: "assets/img/b-classic.webp", t1: "Classic Agar Oud", t2: "Year-round supply", cta: "Get the price list", product: "Classic Agar Oud",
    msg: "Hello, please send the wholesale price for Classic Agar Oud." },
];
const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
const collStage = document.querySelector(".coll-stage");
const collDots = document.querySelector(".coll .dots");
let collIdx = 0, collTimer = null, collCard = null;
function cardHTML(s) {
  return `<img src="${s.img}" alt="" width="56" height="56" loading="lazy"><div><p class="t1">${s.t1}</p><p class="t2">${s.t2}</p>
  <a href="${waLink(s.msg)}" target="_blank" rel="noopener" data-wa="hero_slider" data-product="${s.product}">${s.cta} →</a></div>`;
}
function renderDots(wrap, n, active, onPick, label) {
  wrap.innerHTML = Array.from({ length: n }, (_, i) =>
    `<button class="dot" type="button" aria-label="${label} ${i + 1}"${i === active ? ' aria-current="true"' : ""}><span></span></button>`).join("");
  wrap.querySelectorAll(".dot").forEach((d, i) => d.addEventListener("click", () => onPick(i)));
}
function showColl(i, first = false) {
  collIdx = (i + COLL.length) % COLL.length;
  const card = document.createElement("div");
  card.className = "coll-card glass";
  card.innerHTML = cardHTML(COLL[collIdx]);
  collStage.appendChild(card);
  const cfg = { tension: 210, friction: 24 };
  if (first) setNow(card, { opacity: 1 });
  else { setNow(card, { opacity: 0, y: 16, scale: 0.96 }); springTo(card, { opacity: 1, y: 0, scale: 1 }, cfg); }
  if (collCard) {
    const old = collCard;
    springTo(old, { opacity: 0, y: -16, scale: 0.96 }, cfg);
    setTimeout(() => old.remove(), 700);
  }
  collCard = card;
  renderDots(collDots, COLL.length, collIdx, (k) => { showColl(k); restartColl(); }, "Show grade");
}
function restartColl() { clearInterval(collTimer); collTimer = setInterval(() => showColl(collIdx + 1), 3800); }
function startCollection() { if (collStage) restartColl(); }
if (collStage) showColl(0, true);

/* ---------- Trust carousel ---------- */
const SLIDES = [
  { words: ["Distilled", "In-house,", "Never", "Blended"], img: "assets/img/b-churon.webp", name: "Original Churon Oud", role: "Our rarest grade · 3–4 batches a year",
    alt: "Bottle of Royal Agar Attar Original Churon Oud, the oil glowing amber" },
  { words: ["Resin", "Rich,", "Heavy", "Chips"], img: "assets/img/p-chips.webp", name: "Agarwood chips", role: "For burning and bakhoor",
    alt: "Close-up of dark, resinous agarwood chips" },
];
const ghost = document.getElementById("trust-title");
const gws = [...ghost.querySelectorAll(".gw")];
const coachFig = document.querySelector(".coach figure");
const coachImg = coachFig.querySelector("img");
const coachName = coachFig.querySelector(".cap b");
const coachRole = coachFig.querySelector(".cap span");
const trustDots = document.querySelector(".trust-ctrl .dots");
let slide = 0;
[["-3", "3"], ["3", "-3"], ["-2", "4"], ["4", "-3"]].forEach(([a, b], i) => addParallax(gws[i], document.querySelector(".trust"), "x", +a, +b));
function setGhost(words, animate) {
  gws.forEach((g, i) => { g.querySelector("span").textContent = words[i]; g.querySelector("span").style.setProperty("--delay", i * 60 + "ms"); });
  if (animate) { ghost.classList.remove("is-in"); void ghost.offsetWidth; ghost.classList.add("is-in"); }
}
function goSlide(i) {
  slide = (i + SLIDES.length) % SLIDES.length;
  const s = SLIDES[slide];
  setGhost(s.words, true);
  setNow(coachImg, { opacity: 0 });
  coachImg.src = s.img; coachImg.alt = s.alt;
  springTo(coachImg, { opacity: 1 }, { tension: 260, friction: 26 });
  coachName.textContent = s.name; coachRole.textContent = s.role;
  renderDots(trustDots, SLIDES.length, slide, goSlide, "Show slide");
}
setGhost(SLIDES[0].words, false);
io.observe(ghost);
renderDots(trustDots, SLIDES.length, 0, goSlide, "Show slide");
document.querySelector(".trust-ctrl .prev").addEventListener("click", () => goSlide(slide - 1));
document.querySelector(".trust-ctrl .next").addEventListener("click", () => goSlide(slide + 1));

/* ---------- Hover micro-interactions ---------- */
document.querySelectorAll(".rows li a").forEach((a) => {
  const g = a.querySelector(".go svg");
  hover(a, g, { x: 0, opacity: 0.55 }, { x: 8, opacity: 1 }, { tension: 300, friction: 20 });
});
document.querySelectorAll(".tile figure").forEach((f) => hover(f, f.querySelector(".zoom"), { scale: 1 }, { scale: 1.03 }, { tension: 300, friction: 22 }));
document.querySelectorAll(".card").forEach((c) => hover(c, c.querySelector(".card-in"), { y: 0 }, { y: -8 }, { tension: 300, friction: 22 }));
document.querySelectorAll(".pill .arr").forEach((s) => hover(s.closest(".pill"), s, { x: 0 }, { x: 5 }, { tension: 320, friction: 20 }));
document.querySelectorAll(".arrow-btn").forEach((b) => {
  const s = b.querySelector("svg");
  const flip = b.classList.contains("prev");
  const inner = document.createElement("span"); inner.style.display = "grid"; s.replaceWith(inner); inner.appendChild(s);
  hover(b, inner, { scale: 1 }, { scale: 1.15 }, { tension: 320, friction: 18 });
  if (flip) s.style.transform = "scaleX(-1)";
});
document.querySelectorAll(".x-btn svg").forEach((s) => hover(s.closest(".x-btn"), s, { rotate: 0 }, { rotate: 90 }, { tension: 300, friction: 18 }));

/* ---------- Anchors ---------- */
function goTo(hash) {
  const t = document.querySelector(hash);
  if (t) lenis.scrollTo(t, { offset: 0, duration: 1.2 });
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute("href").length < 2) return;
  e.preventDefault();
  closeMenu();
  goTo(a.getAttribute("href"));
});

/* ---------- WhatsApp click tracking ---------- */
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-wa]");
  if (a) track("whatsapp_click", { click_location: a.dataset.wa, product: a.dataset.product });
});

/* ---------- Menu ---------- */
const menu = document.getElementById("menu");
const menuBd = menu.querySelector(".menu-bd");
const menuPanel = menu.querySelector(".menu-panel");
const menuLinks = [...menu.querySelectorAll(".menu-links a")];
let menuOpen = false;
setNow(menuBd, { opacity: 0 }); setNow(menuPanel, { opacity: 0, y: -24 });
function openMenu() {
  menuOpen = true; menu.classList.add("open"); lock();
  springTo(menuBd, { opacity: 1 }, { tension: 260, friction: 30 });
  springTo(menuPanel, { opacity: 1, y: 0 }, { tension: 220, friction: 28 });
  menuLinks.forEach((l, i) => { setNow(l, { opacity: 0, y: 28 }); springTo(l, { opacity: 1, y: 0 }, { tension: 200, friction: 26 }, 120 + i * 70); });
  setTimeout(() => menu.querySelector(".x-btn").focus(), 150);
}
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  springTo(menuBd, { opacity: 0 }, { tension: 260, friction: 30 });
  springTo(menuPanel, { opacity: 0, y: -24 }, { tension: 220, friction: 28 });
  setTimeout(() => { if (!menuOpen) menu.classList.remove("open"); }, 400);
  if (!modalOpen) unlock();
}
document.querySelector(".burger").addEventListener("click", openMenu);
menu.querySelector(".x-btn").addEventListener("click", closeMenu);
menuBd.addEventListener("click", closeMenu);

/* ---------- Quote modal → WhatsApp ---------- */
const modal = document.getElementById("quote");
const bd = modal.querySelector(".modal-bd");
const panel = modal.querySelector(".panel");
const form = modal.querySelector("form");
const done = modal.querySelector(".done");
const err = modal.querySelector(".form-err");
let modalOpen = false;
setNow(bd, { opacity: 0 }); setNow(panel, { opacity: 0, y: 28, scale: 0.96 });
const mTitle = modal.querySelector("[data-stack]");
function openModal(src) {
  if (menuOpen) { menuOpen = false; menu.classList.remove("open"); setNow(menuBd, { opacity: 0 }); setNow(menuPanel, { opacity: 0, y: -24 }); }
  modalOpen = true; modal.classList.add("open"); lock();
  springTo(bd, { opacity: 1 }, { tension: 240, friction: 30 });
  springTo(panel, { opacity: 1, y: 0, scale: 1 }, { tension: 240, friction: 26 });
  mTitle.classList.remove("is-in"); void mTitle.offsetWidth; mTitle.classList.add("is-in");
  track("quote_open", { click_location: src });
  setTimeout(() => form.elements.name.focus({ preventScroll: true }), 120);
}
function closeModal() {
  if (!modalOpen) return;
  modalOpen = false;
  springTo(bd, { opacity: 0 }, { tension: 240, friction: 30 });
  springTo(panel, { opacity: 0, y: 28, scale: 0.96 }, { tension: 240, friction: 26 });
  unlock();
  setTimeout(() => { if (!modalOpen) { modal.classList.remove("open"); form.reset(); form.hidden = false; done.hidden = true; err.textContent = ""; } }, 350);
}
document.querySelectorAll("[data-open-quote]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openModal(b.dataset.openQuote); }));
modal.querySelector(".x-btn").addEventListener("click", closeModal);
bd.addEventListener("click", closeModal);
done.querySelector("button").addEventListener("click", closeModal);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = form.elements, v = (n) => String(f[n].value || "").trim();
  const need = ["name", "country", "buyer", "oil", "qty"].filter((n) => !v(n));
  if (need.length) { err.textContent = "Please fill in your name, country, business type, grade and quantity."; f[need[0]].focus(); return; }
  err.textContent = "";
  const lines = [
    "Hello Royal Agar Attar, I would like a wholesale quote.", "",
    "Name: " + v("name"), v("company") && "Business: " + v("company"),
    "Type: " + v("buyer"), "Country: " + v("country"), "Grade: " + v("oil"), "Quantity: " + v("qty"),
    v("message") && "Notes: " + v("message"),
  ].filter(Boolean);
  track("generate_lead", { lead_source: "quote_form", oil: v("oil"), quantity: v("qty"), country: v("country"), buyer_type: v("buyer") });
  window.open(waLink(lines.join("\n")), "_blank", "noopener");
  done.querySelector("[data-first]").textContent = v("name").split(/\s+/)[0] || "there";
  form.hidden = true; done.hidden = false;
});
addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); closeMenu(); } });

/* ---------- Floating WhatsApp after hero (phones) ---------- */
const waFloat = document.querySelector(".wa-float");
lenis.on("scroll", ({ scroll }) => waFloat.classList.toggle("show", scroll > hero.offsetHeight * 0.7));

document.getElementById("year").textContent = new Date().getFullYear();
window.__siteReady = true;
