# Rebuilds ../index.html from index.template.html by inlining the SVG illustrations.
import os
here=os.path.dirname(os.path.abspath(__file__))
wood=open(os.path.join(here,'wood.svg')).read()
w2=wood
for i in ['wg','rb','vig']:
    w2=w2.replace(f'id="{i}"',f'id="{i}2"').replace(f'url(#{i})',f'url(#{i}2)')
w2=w2.replace('role="img" aria-label="Illustration of agarwood heartwood streaked with dark resin"','aria-hidden="true"')
s=open(os.path.join(here,'index.template.html')).read()
s=s.replace('{{WOOD}}',wood).replace('{{WOOD2}}',w2).replace('{{BOTTLE}}',open(os.path.join(here,'bottle.svg')).read())
open(os.path.join(here,'..','index.html'),'w').write(s)
