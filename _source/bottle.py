import random, math
random.seed(3)
W,H=600,760
o=[]
o.append(f'<svg class="hero-shot" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A one-litre glass bottle of dark Royal Agar Attar oud oil with a blue cap, on a wooden table beside agarwood chips and a small sample vial">')
o.append('''<defs>
<linearGradient id="bgw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1d12"/><stop offset=".7" stop-color="#1a110a"/><stop offset="1" stop-color="#120c07"/></linearGradient>
<radialGradient id="lamp" cx=".38" cy=".28" r=".55"><stop offset="0" stop-color="#d9a35a" stop-opacity=".38"/><stop offset=".5" stop-color="#a86d2e" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3019"/><stop offset=".25" stop-color="#3a2513"/><stop offset="1" stop-color="#1c1209"/></linearGradient>
<linearGradient id="cap" x1="0" x2="1"><stop offset="0" stop-color="#0d2a8c"/><stop offset=".22" stop-color="#2f62ff"/><stop offset=".42" stop-color="#5b86ff"/><stop offset=".62" stop-color="#2148d6"/><stop offset="1" stop-color="#0a1f6b"/></linearGradient>
<linearGradient id="capTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d93ff"/><stop offset="1" stop-color="#2a55e6"/></linearGradient>
<linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#e9dcc4" stop-opacity=".22"/><stop offset=".12" stop-color="#e9dcc4" stop-opacity=".06"/><stop offset=".5" stop-color="#e9dcc4" stop-opacity=".03"/><stop offset=".86" stop-color="#e9dcc4" stop-opacity=".08"/><stop offset="1" stop-color="#e9dcc4" stop-opacity=".28"/></linearGradient>
<linearGradient id="oilg" x1="0" x2="1"><stop offset="0" stop-color="#2a1406"/><stop offset=".08" stop-color="#0e0603"/><stop offset=".5" stop-color="#070301"/><stop offset=".92" stop-color="#0f0703"/><stop offset="1" stop-color="#3a1d08"/></linearGradient>
<linearGradient id="menis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4813a"/><stop offset="1" stop-color="#5a2f0f"/></linearGradient>
<linearGradient id="label" x1="0" x2="1"><stop offset="0" stop-color="#d9cfbd"/><stop offset=".3" stop-color="#efe7d8"/><stop offset=".75" stop-color="#ebe2d1"/><stop offset="1" stop-color="#c9bea9"/></linearGradient>
<radialGradient id="shadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="chip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b4626"/><stop offset=".5" stop-color="#3a2210"/><stop offset="1" stop-color="#1e1007"/></linearGradient>
<linearGradient id="vialcap" x1="0" x2="1"><stop offset="0" stop-color="#7a5a26"/><stop offset=".45" stop-color="#e3c487"/><stop offset="1" stop-color="#7d5b25"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".45" r=".72"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
<clipPath id="body"><path d="M250 250 L250 266 C250 296 168 304 168 372 L168 662 Q168 694 200 694 L400 694 Q432 694 432 662 L432 372 C432 304 350 296 350 266 L350 250 Z"/></clipPath>
<filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
</defs>''')
# background wall planks
o.append(f'<rect width="{W}" height="{H}" fill="url(#bgw)"/>')
for x in range(0,W,92):
    o.append(f'<rect x="{x}" y="0" width="2" height="560" fill="#0c0805" opacity=".7"/>')
for i in range(70):
    x=random.uniform(0,W); y0=random.uniform(-40,300); L=random.uniform(120,380)
    o.append(f'<path d="M{x:.0f} {y0:.0f} q{random.uniform(-6,6):.1f} {L/2:.0f} {random.uniform(-3,3):.1f} {L:.0f}" stroke="#5a3e24" stroke-opacity="{random.uniform(.08,.25):.2f}" stroke-width="{random.uniform(.6,1.8):.1f}" fill="none"/>')
o.append(f'<rect width="{W}" height="{H}" fill="url(#lamp)"/>')
# table
o.append('<path d="M0 560 L600 560 L600 760 L0 760 Z" fill="url(#table)"/>')
o.append('<rect x="0" y="558" width="600" height="3" fill="#6b4626" opacity=".55"/>')
for i in range(26):
    y=random.uniform(566,756)
    o.append(f'<path d="M0 {y:.0f} C150 {y+random.uniform(-4,4):.0f} 420 {y+random.uniform(-4,4):.0f} 600 {y+random.uniform(-3,3):.0f}" stroke="#6b4626" stroke-opacity="{random.uniform(.08,.22):.2f}" stroke-width="{random.uniform(.6,1.4):.1f}" fill="none"/>')
# shadow
o.append('<ellipse cx="300" cy="698" rx="180" ry="22" fill="url(#shadow)"/>')
o.append('<ellipse cx="300" cy="700" rx="140" ry="10" fill="#000" opacity=".5" filter="url(#blur8)"/>')
# BOTTLE: oil first (clipped), then glass
o.append('<g clip-path="url(#body)">')
o.append('<rect x="140" y="384" width="320" height="320" fill="url(#oilg)"/>')
o.append('<ellipse cx="300" cy="386" rx="134" ry="8" fill="url(#menis)"/>')
o.append('<path d="M168 392 Q300 401 432 392" stroke="#d99a4f" stroke-opacity=".55" stroke-width="1.4" fill="none"/>')
for i in range(30):
    o.append(f'<circle cx="{random.uniform(176,424):.0f}" cy="{random.uniform(388,396):.0f}" r="{random.uniform(.8,1.8):.1f}" fill="#e3b06a" opacity="{random.uniform(.3,.7):.2f}"/>')
# amber light through oil edges
o.append('<rect x="168" y="390" width="12" height="300" fill="#7a3f12" opacity=".45" filter="url(#blur2)"/>')
o.append('<rect x="420" y="390" width="12" height="300" fill="#7a3f12" opacity=".55" filter="url(#blur2)"/>')
o.append('</g>')
# glass body
o.append('<path d="M250 250 L250 266 C250 296 168 304 168 372 L168 662 Q168 694 200 694 L400 694 Q432 694 432 662 L432 372 C432 304 350 296 350 266 L350 250 Z" fill="url(#glass)" stroke="#e9dcc4" stroke-opacity=".35" stroke-width="1.4"/>')
# thick glass bottom
o.append('<path d="M174 674 Q174 688 200 688 L400 688 Q426 688 426 674" stroke="#e9dcc4" stroke-opacity=".25" stroke-width="3" fill="none"/>')
# neck threads / lip
o.append('<rect x="246" y="242" width="108" height="14" rx="3" fill="#e9dcc4" opacity=".12" stroke="#e9dcc4" stroke-opacity=".3"/>')
# highlights
o.append('<path d="M184 380 L184 650" stroke="#fff" stroke-opacity=".32" stroke-width="7" stroke-linecap="round" filter="url(#blur2)"/>')
o.append('<path d="M198 390 L198 520" stroke="#fff" stroke-opacity=".14" stroke-width="3" stroke-linecap="round"/>')
o.append('<path d="M420 384 L420 650" stroke="#fff" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/>')
o.append('<path d="M206 316 C228 300 248 292 254 270" stroke="#fff" stroke-opacity=".3" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#blur2)"/>')
# graduations right side
for i,y in enumerate(range(410,660,40)):
    o.append(f'<line x1="408" y1="{y}" x2="424" y2="{y}" stroke="#efe7d8" stroke-opacity=".75" stroke-width="1.6"/>')
    o.append(f'<line x1="416" y1="{y+20}" x2="424" y2="{y+20}" stroke="#efe7d8" stroke-opacity=".6" stroke-width="1.2"/>')
o.append('<text x="402" y="420" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="9" fill="#efe7d8" fill-opacity=".7">1000 ml</text>')
# LABEL
o.append('<g>')
o.append('<rect x="200" y="452" width="200" height="196" rx="3" fill="url(#label)"/>')
o.append('<rect x="209" y="461" width="182" height="178" rx="1" fill="none" stroke="#a37a3c" stroke-width="1.2"/>')
o.append('<rect x="212" y="464" width="176" height="172" rx="1" fill="none" stroke="#a37a3c" stroke-opacity=".5" stroke-width=".6"/>')
# mark
o.append('<circle cx="300" cy="492" r="13" fill="none" stroke="#7a561e" stroke-width="1"/>')
o.append('<path d="M300 483c-3.4 4.6-5.2 7.8-5.2 10.4a5.2 5.2 0 0 0 10.4 0c0-2.6-1.8-5.8-5.2-10.4Z" fill="#7a561e"/>')
o.append('<text x="300" y="530" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-weight="500" font-size="20" fill="#1a140e">Royal Agar Attar</text>')
o.append('<line x1="236" y1="542" x2="364" y2="542" stroke="#a37a3c" stroke-width=".8"/>')
o.append('<text x="300" y="562" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10.5" letter-spacing="2" fill="#1a140e">CLASSIC AGAR OUD</text>')
o.append('<text x="300" y="580" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1.5" fill="#5c4e3c">PURE AGARWOOD OIL</text>')
o.append('<text x="300" y="604" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-weight="500" font-size="17" fill="#1a140e">1000 ml</text>')
o.append('<text x="300" y="624" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="1" fill="#5c4e3c">SUJANAGAR · MOULVIBAZAR · BD</text>')
# label curvature shading
o.append('<rect x="200" y="452" width="26" height="196" fill="#000" opacity=".08"/><rect x="374" y="452" width="26" height="196" fill="#000" opacity=".12"/>')
o.append('</g>')
# CAP
o.append('<path d="M222 154 Q222 140 236 140 L364 140 Q378 140 378 154 L378 236 L222 236 Z" fill="url(#cap)"/>')
o.append('<rect x="222" y="140" width="156" height="14" rx="7" fill="url(#capTop)"/>')
for x in range(228,376,7):
    o.append(f'<line x1="{x}" y1="156" x2="{x}" y2="226" stroke="#061657" stroke-opacity=".45" stroke-width="2"/>')
    o.append(f'<line x1="{x+2.5}" y1="156" x2="{x+2.5}" y2="226" stroke="#9db6ff" stroke-opacity=".2" stroke-width="1"/>')
o.append('<rect x="218" y="226" width="164" height="22" rx="4" fill="url(#cap)"/>')
o.append('<rect x="218" y="226" width="164" height="4" fill="#9db6ff" opacity=".35"/>')
o.append('<path d="M244 160 L244 222" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round" filter="url(#blur2)"/>')
# reflection of cap blue on table glass? skip
# SAMPLE VIAL right
vx=500
o.append(f'<ellipse cx="{vx}" cy="700" rx="34" ry="6" fill="#000" opacity=".55" filter="url(#blur2)"/>')
o.append(f'<rect x="{vx-20}" y="604" width="40" height="94" rx="8" fill="#e9dcc4" fill-opacity=".1" stroke="#e9dcc4" stroke-opacity=".35"/>')
o.append(f'<rect x="{vx-17}" y="640" width="34" height="55" rx="6" fill="url(#oilg)"/>')
o.append(f'<ellipse cx="{vx}" cy="641" rx="17" ry="3" fill="#b0702f"/>')
o.append(f'<rect x="{vx-11}" y="586" width="22" height="20" rx="2" fill="url(#vialcap)"/>')
o.append(f'<path d="M{vx-13} 612 L{vx-13} 690" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>')
o.append(f'<text x="{vx}" y="724" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1.5" fill="#958873">12 ML SAMPLE</text>')
# AGARWOOD CHIPS front-left: chunky slabs with a lit top face
slabs=[(78,706,104,40,-10),(142,724,70,28,14),(40,734,66,26,-6),(110,684,60,24,18)]
for cx,cy,w,h,rot in slabs:
    pts=[]
    for k in range(10):
        a=2*math.pi*k/10; r=1+random.uniform(-.22,.12)
        pts.append((cx+math.cos(a)*w/2*r, cy+math.sin(a)*h/2*r))
    d='M'+' L'.join(f'{x:.0f},{y:.0f}' for x,y in pts)+'Z'
    o.append(f'<g transform="rotate({rot} {cx} {cy})"><ellipse cx="{cx}" cy="{cy+h/2}" rx="{w/2}" ry="5" fill="#000" opacity=".5" filter="url(#blur2)"/>')
    o.append(f'<path d="{d}" fill="url(#chip)"/>')
    o.append(f'<path d="{d}" fill="#0c0603" opacity=".35" transform="translate(0 {h*0.18:.0f}) scale(1 0.8)" transform-origin="{cx} {cy}"/>')
    for j in range(6):
        yy=cy-h/2+h*(j+1)/7
        o.append(f'<path d="M{cx-w/2+5:.0f} {yy:.0f} q{w/2:.0f} {random.uniform(-3,3):.1f} {w-10:.0f} {random.uniform(-2,2):.1f}" stroke="#0e0603" stroke-opacity=".6" stroke-width="{random.uniform(1.2,3):.1f}" fill="none"/>')
    o.append(f'<path d="M{cx-w/2+8:.0f} {cy-h/2+5:.0f} q{w/3:.0f} -2 {w/1.8:.0f} 1" stroke="#b58050" stroke-opacity=".55" stroke-width="1.4" fill="none"/></g>')
o.append(f'<rect width="{W}" height="{H}" fill="url(#vig)"/>')
o.append('</svg>')
s='\n'.join(o)
open('/tmp/claude-0/bottle.svg','w').write(s); print(len(s))
