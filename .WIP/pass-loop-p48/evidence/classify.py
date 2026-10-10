# p48 r2: classify every differing element of a Pass 40 comparer output (computed.mjs compare) by named fix.
# usage: python classify.py computed-compare-r2.json   -> one line per class, every overflow-wrap row listed, OTHER rows printed whole.
import json, re, sys
from collections import Counter

d = json.load(open(sys.argv[1], encoding='utf-8'))
port = lambda s: re.sub(r'127\.0\.0\.1:\d+', 'ORIGIN', str(s))
count, wrap, other = Counter(), [], []
for page, v in d['pages'].items():
    for e in v.get('differing') or []:
        props = [p for p in e['props'] if port(p.get('a', '<absent>')) != port(p.get('b', '<absent>'))]
        names = {p['prop'] for p in props}
        if not props:
            c = 'port-only URL difference'
        elif names <= {'min-width', 'min-inline-size'} and all(p.get('b') == '0px' for p in props):
            c = 'grid child min-width only (A-001 .grid > *)'
        elif names == {'overflow-wrap'}:
            c = 'overflow-wrap only'
            wrap.append(f"{page} | {e['key']} | {sorted({p['part'] for p in props})}")
        elif names == {'background-image'} and all(p['part'] == '::before' for p in props) and e['key'].endswith('main:2>section:0'):
            c = 'offer hero veil ::before (A-002)'
        elif page.startswith('/contact/') and '>form:2>' in e['key']:
            c = 'contact form slot shift (A-003 removed p.error)'
        else:
            c = 'OTHER'
            other.append(f"{page} | {e['key']} | " + '; '.join(f"{p['part']}:{p['prop']}={p.get('a','<absent>')}->{p.get('b','<absent>')}" for p in props)[:600])
        count[c] += 1
print('summary', json.dumps(d['summary']))
for c, n in sorted(count.items()):
    print(f'{n:4d}  {c}')
for w in wrap:
    print('  wrap:', w)
for o in other:
    print('  OTHER:', o)
sys.exit(1 if other else 0)
