from playwright.sync_api import sync_playwright
F='/tmp/claude-0/fonts/node_modules'
css=f'''<style>@font-face{{font-family:"Bodoni Moda";src:url(file://{F}/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-normal.woff2);font-weight:400 900}}
@font-face{{font-family:"IBM Plex Mono";src:url(file://{F}/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2)}}
html,body{{margin:0;background:#120e0a}} svg{{display:block}}</style>'''
jobs=[('b-classic',600,760),('b-churon',600,760),('b-luha',600,760),('wood-portrait',420,560),('wood-wide',1600,1000),('wood-square',600,600)]
with sync_playwright() as p:
    b=p.chromium.launch()
    for n,w,h in jobs:
        s=open(f'/tmp/claude-0/v3img/{n}.svg').read()
        s=s.replace('class="hero-shot"',f'width="{w}" height="{h}"').replace('class="wood"',f'width="{w}" height="{h}"')
        pg=b.new_page(viewport={'width':w,'height':h},device_scale_factor=2 if w<1000 else 1.25)
        pg.set_content('<html><head>'+css+'</head><body>'+s+'</body></html>'); pg.wait_for_timeout(400)
        pg.screenshot(path=f'/tmp/claude-0/v3img/{n}.png')
    b.close()
