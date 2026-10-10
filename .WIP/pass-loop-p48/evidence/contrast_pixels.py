# p48 A-002 pixel contrast (audit 2026-10-10 contrast_pixels.py method, unchanged rule): for every pixel inside
# the text rectangle where the rendered and text-transparent captures differ by >= 45 in some channel (glyph
# pixels; antialiased fringe excluded), compose the text colour at its alpha over the background pixel and take
# the WCAG ratio against that background pixel. Minimum: 3:1 for text >= 24px, else 4.5:1.
# usage: python contrast_pixels.py <tag>   (reads contrast-rects-<tag>.json, writes contrast-results-<tag>.json)
import json, re, sys
from pathlib import Path
from PIL import Image
root = Path(__file__).parent
tag = sys.argv[1]
def lum(c):
    v = [x / 255 for x in c]
    v = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v]
    return sum(a * b for a, b in zip(v, [.2126, .7152, .0722]))
out = []
for row in json.loads((root / f'contrast-rects-{tag}.json').read_text()):
    a = Image.open(root / f"orig-{row['name']}.png").convert('RGB')
    b = Image.open(root / f"bg-{row['name']}.png").convert('RGB')
    for item in row['items']:
        nums = list(map(float, re.findall(r'[\d.]+', item['color'])))
        alpha = nums[3] if len(nums) > 3 else 1
        minimum = 3 if float(item['size'][:-2]) >= 24 else 4.5
        vals = []
        for y in range(max(0, int(item['y'])), min(a.height, int(item['y'] + item['height']))):
            for x in range(max(0, int(item['x'])), min(a.width, int(item['x'] + item['width']))):
                fg = a.getpixel((x, y)); bg = b.getpixel((x, y))
                if max(abs(fg[i] - bg[i]) for i in range(3)) < 45:
                    continue
                actual = [nums[i] * alpha + bg[i] * (1 - alpha) for i in range(3)]
                ls = sorted([lum(actual), lum(bg)])
                vals.append((ls[1] + .05) / (ls[0] + .05))
        r = {'route': row['route'], 'width': row['width'], 'reduce': row['reduce'], 'sel': item['sel'], 'size': item['size'],
             'pixels': len(vals), 'minContrast': round(min(vals), 3) if vals else None, 'minimum': minimum,
             'under': sum(v < minimum for v in vals)}
        out.append(r)
        print(f"{r['route']:<36} {r['width']:>4}{' reduce' if r['reduce'] else '       '} {r['sel']:<10} {r['size']:>7} px={r['pixels']:>5} min={r['minContrast']} bar={minimum} under={r['under']}")
(root / f'contrast-results-{tag}.json').write_text(json.dumps(out, indent=1))
bad = [r for r in out if r['minContrast'] is None or r['under']]
print(f'{len(out)} measures, {len(bad)} under the bar or unmeasured')
sys.exit(1 if bad else 0)
