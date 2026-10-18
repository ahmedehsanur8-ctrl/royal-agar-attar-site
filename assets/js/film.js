// Tree-to-oil film: real footage, one clip per step, crossfaded between two <video> elements.
// Starts when the film scrolls into view, pauses when it leaves, the tab hides, or the visitor presses pause.

const root = document.querySelector("[data-film]");
if (root) initFilm(root);

function initFilm(film) {
  const V = "assets/video/";
  // pos: [phone 4:5 crop, desktop 16:9 crop]
  const SCENES = [
    { step: 1, src: "1-nailing.mp4", dur: 5.4, pos: ["50% 50%", "50% 42%"], title: "Nailing the tree", text: "Iron nails go into the living agar tree. To heal itself, the tree slowly forms dark resin around each wound." },
    { step: 2, src: "2-felling.mp4", dur: 4.9, pos: ["50% 60%", "50% 72%"], title: "Cutting the tree", text: "When the resin has formed inside, the tree is cut down by hand." },
    { step: 3, src: "3-carving.mp4", dur: 5.4, pos: ["32% 50%", "38% 50%"], title: "Keeping only the resin", text: "We carve away the pale wood by hand and keep only the dark, resin-rich part." },
    { step: 4, src: "4-soaking.mp4", dur: 5.4, pos: ["35% 50%", "50% 60%"], title: "Soaking the chips", text: "The resin chips rest in water before they go into the still.", tag: "2 – 2.5 months in water" },
    { step: 5, src: "5-distilling.mp4", dur: 5.7, pos: ["45% 50%", "50% 50%"], title: "Slow distillation", text: "Fire under our own stills in Sujanagar. The oil comes over slowly with the steam." },
    { step: 6, src: "6-collecting.mp4", dur: 5.4, pos: ["55% 50%", "50% 55%"], title: "Collecting the oil", text: "The oil rises and floats on the water in the collecting pot." },
    { step: 6, src: "6b-skimming.mp4", dur: 5.4, pos: ["50% 45%", "50% 58%"], title: "Separated by hand", text: "It is lifted off the water by hand, a little at a time." },
    { step: 7, src: "7-filtering.mp4", dur: 5.9, pos: ["50% 42%", "50% 46%"], title: "Traditional filtering", text: "Filtered through traditional funnels, then left to settle before bottling." },
    { step: 8, src: "8-bottling.mp4", dur: 11, pos: ["50% 40%", "50% 50%"], finale: true }
  ];

  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WIDE = matchMedia("(min-width: 768px)");
  const vids = [...film.querySelectorAll(".film-vid")];
  const copy = film.querySelector(".film-copy");
  const end = film.querySelector("[data-film-end]");
  const $step = film.querySelector("[data-film-step]");
  const $title = film.querySelector("[data-film-title]");
  const $text = film.querySelector("[data-film-text]");
  const $tag = film.querySelector("[data-film-tag]");
  const pauseBtn = film.querySelector("[data-film-pause]");
  const ticks = [...film.querySelectorAll("[data-film-go]")];

  let idx = -1, front = 0, timer = 0, startedAt = 0, remaining = 0;
  let userPaused = REDUCED, inView = false, started = false;

  vids.forEach((v) => { v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; });

  const stepDur = (step) => SCENES.filter((s) => s.step === step).reduce((a, s) => a + s.dur, 0);
  const running = () => inView && !userPaused && !document.hidden;

  function load(v, i) {
    if (v.dataset.idx === String(i)) return;
    v.dataset.idx = String(i);
    v.preload = "auto";
    v.src = V + SCENES[i].src;
  }

  function play(v) {
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }

  function setText(s) {
    film.classList.remove("is-reveal");
    if (s.finale) {
      copy.hidden = true; end.hidden = false;
    } else {
      copy.hidden = false; end.hidden = true;
      $step.innerHTML = "";
      $step.append("Step 0" + s.step + " ", document.createElement("i"), " of 07");
      $title.textContent = s.title;
      $text.textContent = s.text;
      $tag.hidden = !s.tag;
      $tag.textContent = s.tag || "";
    }
    void film.offsetWidth; // restart the reveal
    film.classList.add("is-reveal");
  }

  function setTicks(s, prevStep) {
    ticks.forEach((b) => {
      const n = Number(b.dataset.filmGo);
      b.classList.toggle("is-done", s.step > n);
      if (n === s.step) {
        if (prevStep !== s.step) {
          b.removeAttribute("aria-current");
          b.style.setProperty("--dur", stepDur(n) + "s");
          void b.offsetWidth; // restart the fill
        }
        b.setAttribute("aria-current", "step");
      } else {
        b.removeAttribute("aria-current");
      }
    });
  }

  function show(i) {
    const prevStep = idx >= 0 ? SCENES[idx].step : 0;
    const firstRun = idx === -1 && vids[front].dataset.idx === String(i);
    idx = i;
    const s = SCENES[i];
    if (firstRun) front = 1 - front; // the visible element already holds this clip: play it in place
    const next = vids[1 - front];
    const cur = vids[front];
    load(next, i);
    next.style.objectPosition = s.pos[WIDE.matches ? 1 : 0];
    try { next.currentTime = 0; } catch (e) {}
    next.classList.remove("is-zoom");
    next.style.setProperty("--zoom", s.dur + 1 + "s");
    if (running()) play(next);
    void next.offsetWidth;
    next.classList.add("is-on");
    if (!REDUCED) next.classList.add("is-zoom");
    cur.classList.remove("is-on");
    setTimeout(() => { if (!cur.classList.contains("is-on")) cur.pause(); }, 950);
    front = 1 - front;
    setText(s);
    setTicks(s, prevStep);
    // warm up the following clip in the hidden element
    setTimeout(() => { if (vids[1 - front] === cur) load(cur, (i + 1) % SCENES.length); }, 1000);
    remaining = s.dur * 1000;
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (!running()) return;
    startedAt = performance.now();
    timer = setTimeout(() => show((idx + 1) % SCENES.length), remaining);
  }

  function hold() {
    if (timer) {
      clearTimeout(timer); timer = 0;
      remaining = Math.max(400, remaining - (performance.now() - startedAt));
    }
    vids[front].pause();
    film.classList.add("is-paused");
  }

  function resume() {
    if (!running()) return;
    film.classList.remove("is-paused");
    if (!started) { started = true; show(0); return; }
    play(vids[front]);
    schedule();
  }

  function sync() {
    if (running()) resume(); else hold();
    pauseBtn.setAttribute("aria-label", userPaused ? "Play film" : "Pause film");
  }

  pauseBtn.addEventListener("click", () => { userPaused = !userPaused; sync(); });
  film.querySelector("[data-film-replay]").addEventListener("click", () => {
    userPaused = false; started = true; film.classList.remove("is-paused"); show(0);
  });
  ticks.forEach((b) => b.addEventListener("click", () => {
    const first = SCENES.findIndex((s) => s.step === Number(b.dataset.filmGo));
    userPaused = false; started = true; film.classList.remove("is-paused");
    pauseBtn.setAttribute("aria-label", "Pause film");
    show(first);
  }));
  document.addEventListener("visibilitychange", sync);
  WIDE.addEventListener("change", () => { if (idx >= 0) vids[front].style.objectPosition = SCENES[idx].pos[WIDE.matches ? 1 : 0]; });

  new IntersectionObserver((entries) => {
    entries.forEach((e) => { inView = e.isIntersecting; });
    sync();
  }, { threshold: 0.35 }).observe(film);

  // first frame and text visible before playback starts
  load(vids[0], 0);
  vids[0].style.objectPosition = SCENES[0].pos[WIDE.matches ? 1 : 0];
  film.classList.add("is-reveal");
  if (REDUCED) film.classList.add("is-paused");
}
