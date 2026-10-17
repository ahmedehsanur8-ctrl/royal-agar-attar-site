import math, random
random.seed(11)
W,H=420,560
kx,ky=262,214
def gx(x0,y,i):
    dx=x0-kx; dy=(y-ky)/1.6
    g=math.exp(-(dx*dx+dy*dy)/(2*48*48))
    push=math.copysign(1,dx if dx!=0 else 1)*58*g
    return x0+math.sin(y/110+i*.21)*5+math.sin(y/37+i)*1.2+push
out=[f'<svg class="wood" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of agarwood heartwood streaked with dark resin">',
'''<defs>
<linearGradient id="wg" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#6a4d2f"/><stop offset=".55" stop-color="#4b3420"/><stop offset="1" stop-color="#2b1d10"/></linearGradient>
<filter id="rb" x="-30%" y="-5%" width="160%" height="110%"><feGaussianBlur stdDeviation="4.5"/></filter>
<radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
</defs>''',
f'<rect width="{W}" height="{H}" fill="url(#wg)"/>']
paths=[]
for i in range(84):
    x0=-30+i*5.6+random.uniform(-1.5,1.5)
    pts=[(gx(x0,y,i),y) for y in range(-10,H+20,10)]
    d='M'+' L'.join(f'{x:.1f},{y}' for x,y in pts)
    paths.append((x0,d))
# resin: dark wide strokes along chosen grain lines, blurred
out.append('<g filter="url(#rb)" fill="none" stroke-linecap="round">')
for idx,y0,y1,w,o in [(18,60,420,12,.55),(22,0,300,8,.45),(31,120,560,15,.5),(44,260,560,10,.4),(52,0,180,9,.4),(60,300,520,13,.5),(37,330,560,18,.45),(48,150,330,20,.6)]:
    x0=paths[idx][0]
    L=y1-y0
    for frac,mult,op in [(1,.45,o*.6),(.7,.8,o*.8),(.4,1.0,o)]:
        a=y0+int(L*(1-frac)/2); b=y1-int(L*(1-frac)/2)
        pts=[(gx(x0,y,idx),y) for y in range(a,b,10)]
        if len(pts)<2: continue
        d='M'+' L'.join(f'{x:.1f},{y}' for x,y in pts)
        out.append(f'<path d="{d}" stroke="#1d1007" stroke-opacity="{op:.2f}" stroke-width="{w*mult:.1f}"/>')
out.append('</g>')
for k,(x0,d) in enumerate(paths):
    c=random.choice(['#8a6a44','#7a5c3a','#5e432a','#9a7a50'])
    out.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-opacity="{random.uniform(.18,.5):.2f}" stroke-width="{random.uniform(.5,1.1):.2f}"/>')
# knot
out.append(f'<g transform="rotate(-6 {kx} {ky})" filter="url(#rb)"><ellipse cx="{kx}" cy="{ky}" rx="13" ry="22" fill="#170d06" opacity=".9"/></g>')
for r,(rx,ry,o) in enumerate([(17,28,.5),(26,40,.3)]):
    out.append(f'<ellipse cx="{kx}" cy="{ky}" rx="{rx}" ry="{ry}" fill="none" stroke="#2a1a0c" stroke-opacity="{o}" stroke-width="1.6" transform="rotate(-6 {kx} {ky})"/>')
# sheen of oil on resin
for x,y,l in [(118,200,70),(205,330,60),(300,410,80),(150,470,50)]:
    out.append(f'<path d="M{x} {y} q2.5 {l//2} 0 {l}" stroke="#c48a45" stroke-opacity=".28" stroke-width="1.4" fill="none" stroke-linecap="round"/>')
out.append(f'<rect width="{W}" height="{H}" fill="url(#vig)"/></svg>')
open('/tmp/claude-0/wood.svg','w').write('\n'.join(out))
