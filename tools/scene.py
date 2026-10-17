# Draws the illustrated scene parts for the Royal Agar Attar site and renders them to WebP.
# Usage: python3 tools/scene.py <out_dir>
# Parts: realistic agarwood chips (transparent), brass mabkhara (transparent),
# pale heartwood with resin veins, sinking-test glass, chips on a brass tray.
import math, random, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else "assets/img"
TMP = "/tmp/claude-0/scene"
os.makedirs(TMP, exist_ok=True)


def wood_filter(fid, seed, gx=0.005, gy=0.11, base=(0.42, 0.26, 0.13), resin=0.55, light=True, thr=0.456):
    """Grain from stretched fractal noise, resin patches from a second noise, soft sheen."""
    r, g, b = base
    spec = f'''<feSpecularLighting in="n" surfaceScale="2.2" specularConstant=".55" specularExponent="22" lighting-color="#ffd7a0" result="sp">
        <feDistantLight azimuth="235" elevation="38"/></feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spc"/>''' if light else ""
    merge_sp = '<feMergeNode in="spc"/>' if light else ""
    return f'''<filter id="{fid}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="{gx} {gy}" numOctaves="4" seed="{seed}" result="n"/>
      <feColorMatrix in="n" type="matrix" values="{r*1.3} 0 0 0 {r*0.35}  {g*1.3} 0 0 0 {g*0.3}  {b*1.3} 0 0 0 {b*0.25}  0 0 0 0 1" result="grain"/>
      <feTurbulence type="fractalNoise" baseFrequency="{gx*2.4} {gy*0.35}" numOctaves="3" seed="{seed+7}" result="rn"/>
      <feColorMatrix in="rn" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.025  0 0 0 0 0.01  9 0 0 0 {-9*thr}" result="resin"/>
      <feGaussianBlur in="resin" stdDeviation="0.6" result="resinb"/>
      {spec}
      <feMerge result="m"><feMergeNode in="grain"/><feMergeNode in="resinb"/>{merge_sp}</feMerge>
      <feComposite in="m" in2="SourceAlpha" operator="in"/>
    </filter>'''


def chip_shape(seed, w, h, cx=200, cy=200):
    random.seed(seed)
    top, bot, n = [], [], 16
    for k in range(n + 1):
        t = k / n
        x = cx - w / 2 + w * t
        taper = math.sin(math.pi * t) ** 0.55
        jag = 1 if k in (0, n) else random.uniform(0.7, 1.0)
        top.append((x + random.uniform(-5, 5), cy - h / 2 * taper * jag))
        bot.append((x + random.uniform(-5, 5), cy + h / 2 * taper * random.uniform(0.65, 1.0)))
    # splinter tips
    top[0] = (top[0][0] - random.uniform(4, 14), cy + random.uniform(-6, 6))
    top[-1] = (top[-1][0] + random.uniform(4, 16), cy + random.uniform(-6, 6))
    pts = top + bot[::-1]
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"


def chip_svg(seed, w, h, rot=0, size=400):
    d = chip_shape(seed, w, h)
    thick = max(7, h * 0.16)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 400 400">
  <defs>{wood_filter("wf", seed, base=(0.26, 0.155, 0.07), thr=0.4)}
    <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="5"/></filter></defs>
  <g transform="rotate({rot} 200 200)">
    <path d="{d}" fill="#000" opacity=".55" transform="translate(6 {thick+8})" filter="url(#sh)"/>
    <path d="{d}" fill="#140904" transform="translate(2 {thick:.0f})"/>
    <path d="{d}" fill="#000" filter="url(#wf)"/>
  </g></svg>'''


def brass_defs():
    return '''<linearGradient id="br" x1="0" x2="1"><stop offset="0" stop-color="#4a2f0e"/><stop offset=".18" stop-color="#9a7232"/>
      <stop offset=".38" stop-color="#e8c47a"/><stop offset=".46" stop-color="#fff0c4"/><stop offset=".56" stop-color="#d4a85a"/>
      <stop offset=".8" stop-color="#7a5420"/><stop offset="1" stop-color="#3a240a"/></linearGradient>
    <linearGradient id="brd" x1="0" x2="1"><stop offset="0" stop-color="#2e1c07"/><stop offset=".4" stop-color="#8a6428"/><stop offset=".55" stop-color="#b48a44"/><stop offset="1" stop-color="#24160a"/></linearGradient>
    <radialGradient id="coal" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf7a"/><stop offset=".35" stop-color="#ff7a1a"/><stop offset=".7" stop-color="#9a2a08"/><stop offset="1" stop-color="#2a0c04"/></radialGradient>
    <radialGradient id="emb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff9a3a" stop-opacity=".8"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>'''


def mabkhara_svg():
    # 400 x 520 canvas, burner centred at x=200
    arches = "".join(
        f'<path d="M{x} 300 q7 -16 14 0 Z" fill="#1c1004" opacity=".85"/>' for x in range(122, 272, 20))
    dots = "".join(f'<circle cx="{x}" cy="324" r="2.2" fill="#1c1004" opacity=".8"/>' for x in range(128, 276, 12))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520">
  <defs>{brass_defs()}{wood_filter("wf2", 41, base=(0.30, 0.18, 0.09), light=False, thr=0.4)}
    <filter id="bl"><feGaussianBlur stdDeviation="6"/></filter><filter id="bl2"><feGaussianBlur stdDeviation="2"/></filter></defs>
  <ellipse cx="200" cy="500" rx="120" ry="14" fill="#000" opacity=".55" filter="url(#bl)"/>
  <!-- foot -->
  <path d="M110 495 Q110 470 150 462 L250 462 Q290 470 290 495 Z" fill="url(#br)"/>
  <ellipse cx="200" cy="495" rx="90" ry="9" fill="url(#brd)"/>
  <rect x="140" y="452" width="120" height="14" rx="6" fill="url(#brd)"/>
  <!-- stem -->
  <path d="M172 455 C178 420 182 400 186 372 L214 372 C218 400 222 420 228 455 Z" fill="url(#br)"/>
  <ellipse cx="200" cy="410" rx="22" ry="7" fill="url(#brd)"/>
  <rect x="176" y="362" width="48" height="14" rx="6" fill="url(#brd)"/>
  <!-- bowl -->
  <path d="M96 268 L304 268 C300 318 270 356 200 364 C130 356 100 318 96 268 Z" fill="url(#br)"/>
  <path d="M104 292 L296 292 L294 306 L106 306 Z" fill="#3a240a" opacity=".5"/>
  {arches}{dots}
  <path d="M120 340 Q200 360 280 340" stroke="#fff3cf" stroke-opacity=".25" stroke-width="2" fill="none"/>
  <!-- rim -->
  <ellipse cx="200" cy="268" rx="108" ry="18" fill="url(#brd)"/>
  <ellipse cx="200" cy="266" rx="98" ry="13" fill="#1a0e05"/>
  <!-- glowing coal + chip -->
  <ellipse cx="200" cy="262" rx="70" ry="18" fill="url(#emb)" filter="url(#bl)"/>
  <ellipse cx="200" cy="262" rx="44" ry="10" fill="url(#coal)"/>
  <path d="M168 256 L226 248 L236 256 L222 262 L170 264 Z" fill="#000" filter="url(#wf2)"/>
  <path d="M170 258 L224 250" stroke="#ff9a3a" stroke-opacity=".6" stroke-width="1.5" filter="url(#bl2)"/>
  <path d="M128 268 Q140 286 150 270" stroke="#fff3cf" stroke-opacity=".45" stroke-width="3" fill="none" filter="url(#bl2)"/>
</svg>'''


def heartwood_svg(W=840, H=1120):
    # pale split agarwood with black resin veins following the grain
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <filter id="pale" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.32 0.006" numOctaves="4" seed="12" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0.55 0 0 0 0.42  0.42 0 0 0 0.3  0.3 0 0 0 0.18  0 0 0 0 1" result="grain"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.0024" numOctaves="4" seed="31" result="rn"/>
      <feColorMatrix in="rn" type="matrix" values="0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 0 0.012  9 0 0 0 -4.1" result="resin"/>
      <feGaussianBlur in="resin" stdDeviation="0.5" result="rb"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.07 0.003" numOctaves="3" seed="77" result="rn2"/>
      <feColorMatrix in="rn2" type="matrix" values="0 0 0 0 0.22  0 0 0 0 0.11  0 0 0 0 0.04  5 0 0 0 -2.6" result="mid"/>
      <feGaussianBlur in="mid" stdDeviation="3" result="mb"/>
      <feSpecularLighting in="n" surfaceScale="1.6" specularConstant=".35" specularExponent="18" lighting-color="#ffe2b8" result="sp"><feDistantLight azimuth="220" elevation="45"/></feSpecularLighting>
      <feMerge><feMergeNode in="grain"/><feMergeNode in="mb"/><feMergeNode in="rb"/><feMergeNode in="sp"/></feMerge>
    </filter>
    <radialGradient id="v" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
    <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb35a" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
  </defs>
  <g transform="rotate(-4 {W/2} {H/2}) scale(1.12) translate({-W*0.05} {-H*0.05})"><rect width="{W}" height="{H}" filter="url(#pale)"/></g>
  <rect width="{W}" height="{H}" fill="url(#warm)"/>
  <rect width="{W}" height="{H}" fill="url(#v)"/>
</svg>'''


def table_and_wall(W, H, horizon):
    return f'''<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1b10"/><stop offset="1" stop-color="#140c07"/></linearGradient>
    <linearGradient id="tab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3e2715"/><stop offset="1" stop-color="#160d06"/></linearGradient>
    <radialGradient id="lamp" cx=".35" cy=".25" r=".7"><stop offset="0" stop-color="#d9a05a" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'''


def sinking_svg(W=600, H=800):
    gl, gr, gt, gb = 110, 490, 150, 700  # glass box
    water = 250
    d_sink = chip_shape(5, 210, 54, 0, 0)
    d_float = chip_shape(9, 190, 44, 0, 0)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>{table_and_wall(W, H, 600)}
    {wood_filter("dark", 5, base=(0.2, 0.11, 0.05), thr=0.36)}
    {wood_filter("light", 9, base=(0.62, 0.45, 0.28), thr=0.62)}
    <linearGradient id="gls" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".1" stop-color="#fff" stop-opacity=".05"/>
      <stop offset=".85" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
    <linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a77a" stop-opacity=".16"/><stop offset="1" stop-color="#6b4a2a" stop-opacity=".22"/></linearGradient>
    <filter id="b4"><feGaussianBlur stdDeviation="4"/></filter><filter id="b1"><feGaussianBlur stdDeviation="1"/></filter>
    <radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#wall)"/><rect width="{W}" height="{H}" fill="url(#lamp)"/>
  <path d="M0 640 L{W} 640 L{W} {H} L0 {H} Z" fill="url(#tab)"/>
  <rect x="0" y="638" width="{W}" height="2" fill="#6b4626" opacity=".5"/>
  <ellipse cx="300" cy="{gb+6}" rx="150" ry="16" fill="#000" opacity=".5" filter="url(#b4)"/>
  <!-- water -->
  <path d="M{gl+6} {water} L{gr-6} {water} L{gr-12} {gb-8} Q300 {gb+2} {gl+12} {gb-8} Z" fill="url(#wat)"/>
  <ellipse cx="300" cy="{water}" rx="{(gr-gl)/2-6}" ry="10" fill="#e9d2a8" opacity=".18"/>
  <!-- floating light chip at the surface -->
  <g transform="translate(280 {water-2}) rotate(-4)"><path d="{d_float}" fill="#000" filter="url(#light)"/></g>
  <!-- sinking dark chip resting at the bottom -->
  <g transform="translate(310 {gb-44}) rotate(7)"><path d="{d_sink}" fill="#000" filter="url(#dark)"/></g>
  <g fill="#f3e6cc" opacity=".55">{''.join(f'<circle cx="{300+random.uniform(-30,40):.0f}" cy="{random.uniform(water+40,gb-60):.0f}" r="{random.uniform(1,2.6):.1f}"/>' for _ in range(9))}</g>
  <!-- glass -->
  <path d="M{gl} {gt} L{gr} {gt} L{gr-8} {gb-6} Q300 {gb+8} {gl+8} {gb-6} Z" fill="url(#gls)" stroke="#f3e6cc" stroke-opacity=".35" stroke-width="2"/>
  <ellipse cx="300" cy="{gt}" rx="{(gr-gl)/2}" ry="12" fill="none" stroke="#f3e6cc" stroke-opacity=".4" stroke-width="2"/>
  <path d="M{gl+18} {gt+30} L{gl+28} {gb-40}" stroke="#fff" stroke-opacity=".3" stroke-width="6" stroke-linecap="round" filter="url(#b1)"/>
  <rect width="{W}" height="{H}" fill="url(#vig)"/>
</svg>'''


def tray_svg(W=900, H=900):
    chips = [(9, 330, 82, -12, 330, 470), (11, 290, 74, 18, 570, 440), (13, 360, 90, 4, 450, 540),
             (15, 250, 66, -30, 300, 580), (17, 300, 76, 28, 610, 570), (19, 240, 60, -6, 470, 400),
             (23, 220, 58, 52, 420, 470), (27, 260, 64, -48, 540, 500)]
    parts = []
    for sd, w, h, rot, x, y in chips:
        d = chip_shape(sd, w, h, 0, 0)
        parts.append(f'<g transform="translate({x} {y}) rotate({rot})"><path d="{d}" fill="#120803" transform="translate(2 9)"/><path d="{d}" fill="#000" filter="url(#c{sd})"/></g>')
    filters = "".join(wood_filter(f"c{sd}", sd, base=(0.26, 0.155, 0.07), thr=0.41) for sd, *_ in chips)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>{brass_defs()}{filters}
    <radialGradient id="bg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#3a2614"/><stop offset="1" stop-color="#100905"/></radialGradient>
    <radialGradient id="trayg" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#f6dc9c"/><stop offset=".45" stop-color="#b8883e"/><stop offset="1" stop-color="#4a2f0e"/></radialGradient>
    <filter id="b8"><feGaussianBlur stdDeviation="10"/></filter></defs>
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <ellipse cx="450" cy="560" rx="330" ry="150" fill="#000" opacity=".55" filter="url(#b8)"/>
  <ellipse cx="450" cy="520" rx="380" ry="180" fill="url(#brd)"/>
  <ellipse cx="450" cy="508" rx="360" ry="166" fill="url(#trayg)"/>
  <ellipse cx="450" cy="508" rx="310" ry="138" fill="none" stroke="#4a2f0e" stroke-opacity=".5" stroke-width="3" stroke-dasharray="2 10"/>
  {''.join(parts)}
</svg>'''


def log_shape(seed, w, h, cx, cy):
    """Irregular split agarwood branch, long axis vertical."""
    random.seed(seed)
    left, right, n = [], [], 22
    for k in range(n + 1):
        t = k / n
        y = cy - h / 2 + h * t
        bulge = 1 + 0.12 * math.sin(t * 5.2 + 1) + 0.06 * math.sin(t * 13)
        left.append((cx - w / 2 * bulge + random.uniform(-6, 6), y))
        right.append((cx + w / 2 * bulge * random.uniform(0.9, 1.0), y))
    # splintered ends
    top = [(cx + w * f, cy - h / 2 - random.uniform(0, 46)) for f in (0.35, 0.15, -0.05, -0.25)]
    bot = [(cx + w * f, cy + h / 2 + random.uniform(0, 40)) for f in (-0.3, -0.1, 0.1, 0.3)]
    pts = left + bot + right[::-1] + top
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"


def heartlog_svg(W=840, H=1120):
    """A split piece of resinated agarwood: pale wood, black resin running with the grain."""
    d = log_shape(4, 330, 900, 0, 0)
    chips = [(31, 170, 46, -18, 210, 1010), (33, 130, 38, 24, 640, 1030), (35, 110, 32, 70, 690, 960)]
    cp = "".join(f'<g transform="translate({x} {y}) rotate({r})"><path d="{chip_shape(sd, w, h, 0, 0)}" fill="#0c0602" transform="translate(2 7)"/><path d="{chip_shape(sd, w, h, 0, 0)}" fill="#000" filter="url(#k{sd})"/></g>' for sd, w, h, r, x, y in chips)
    cf = "".join(wood_filter(f"k{sd}", sd, base=(0.26, 0.155, 0.07), thr=0.4) for sd, *_ in chips)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>{cf}
    <filter id="pale" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.30 0.007" numOctaves="4" seed="12" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0.6 0 0 0 0.44  0.46 0 0 0 0.31  0.32 0 0 0 0.18  0 0 0 0 1" result="grain"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.045 0.0028" numOctaves="4" seed="31" result="rn"/>
      <feColorMatrix in="rn" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.025  0 0 0 0 0.01  10 0 0 0 -4.7" result="resin"/>
      <feGaussianBlur in="resin" stdDeviation="0.7" result="rb"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.06 0.0035" numOctaves="3" seed="77" result="rn2"/>
      <feColorMatrix in="rn2" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.035  5 0 0 0 -2.5" result="mid"/>
      <feGaussianBlur in="mid" stdDeviation="3" result="mb"/>
      <feSpecularLighting in="n" surfaceScale="1.8" specularConstant=".4" specularExponent="18" lighting-color="#ffe2b8" result="sp"><feDistantLight azimuth="220" elevation="45"/></feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spc"/>
      <feMerge result="m"><feMergeNode in="grain"/><feMergeNode in="mb"/><feMergeNode in="rb"/><feMergeNode in="spc"/></feMerge>
      <feComposite in="m" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="edge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
    <clipPath id="lc"><path d="{d}"/></clipPath>
    <radialGradient id="bg" cx=".42" cy=".35" r=".85"><stop offset="0" stop-color="#3b2716"/><stop offset=".6" stop-color="#1a110a"/><stop offset="1" stop-color="#0d0805"/></radialGradient>
    <linearGradient id="lit" x1="0" x2="1"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".22"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <g transform="translate(430 540) rotate(-11)">
    <path d="{d}" fill="#000" opacity=".7" transform="translate(34 40)" filter="url(#sh)"/>
    <path d="{d}" fill="#1a0d05" transform="translate(10 12)"/>
    <path d="{d}" fill="#000" filter="url(#pale)"/>
    <g clip-path="url(#lc)">
      <rect x="-260" y="-560" width="520" height="1120" fill="url(#lit)"/>
      <path d="{d}" fill="none" stroke="#120803" stroke-width="40" opacity=".75" filter="url(#edge)"/>
      <path d="M-175 -480 C-190 -200 -150 120 -185 480" stroke="#2a170a" stroke-width="30" opacity=".85" filter="url(#edge)"/>
    </g>
  </g>
  {cp}
</svg>'''


def render(svg, out, w, h, transparent=False, scale=2, crop=True):
    path = f"{TMP}/{out}.png"
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=scale)
        bg = "transparent" if transparent else "#120c07"
        pg.set_content(f'<html><body style="margin:0;background:{bg}">{svg}</body></html>')
        pg.wait_for_timeout(500)
        pg.screenshot(path=path, omit_background=transparent)
        b.close()
    im = Image.open(path)
    if transparent and crop:
        im = im.crop(im.getbbox())
    im.save(f"{OUT}/{out}.webp", "WEBP", quality=84, method=6)
    return im.size


if __name__ == "__main__":
    specs = [(21, 300, 74, -8), (22, 240, 64, 14), (23, 200, 70, -22), (24, 320, 60, 6), (25, 170, 50, 28)]
    for i, (sd, w, h, rot) in enumerate(specs, 1):
        print("chip", i, render(chip_svg(sd, w, h, rot), f"chip-{i}", 400, 400, transparent=True))
    print("mabkhara", render(mabkhara_svg(), "mabkhara", 400, 520, transparent=True))
    print("sinking", render(sinking_svg(), "sinking", 600, 800, scale=1.6))
    print("tray", render(tray_svg(), "chips-tray", 900, 900, scale=1.2))
