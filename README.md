# Royal Agar Attar website

Live at https://royalagarattar.qd.je. Netlify deploys automatically on every push to `main` (no build step).

- `index.html`: the page (layout based on the "Baseline" template structure, Royal Agar Attar content).
- `assets/css/site.css`, `assets/js/site.js`: styles and motion (spring helper + Lenis smooth scroll, self-hosted in `assets/js/lenis.mjs`).
- `assets/img/`: illustrations rendered from `tools/` (`bottle.py`, `wood.py`, `render.py`). Replace with real photos when available.
- `assets/fonts/`: Onest 400/500, self-hosted.

Tracking: the page pushes `whatsapp_click`, `quote_open` and `generate_lead` to `dataLayer`. Paste a GTM ID in the marked block in `index.html` to send them to GA4 / Meta.
- `assets/video/` + `assets/js/film.js`: the "From tree to oil" film in the process section. Real footage, one H.264 clip per step (muted, no audio track), crossfaded; plays only while on screen. Scene text and timing live in `SCENES` at the top of `film.js`.
