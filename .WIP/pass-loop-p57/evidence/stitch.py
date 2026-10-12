# p57: stacks capture tiles into one picture (Pillow). Headless Chrome here never answers a capture of 6000 px
# or more in one piece (capture-probe.mjs), so render.mjs captures tiles of 2500 px.
# usage: python .WIP/pass-loop-p57/evidence/stitch.py <out.png> <tile 1> <tile 2> ...
import sys
from PIL import Image

tiles = [Image.open(p) for p in sys.argv[2:]]
out = Image.new("RGB", (tiles[0].width, sum(t.height for t in tiles)), "white")
y = 0
for t in tiles:
    out.paste(t, (0, y))
    y += t.height
out.save(sys.argv[1], optimize=True)
print(f"{out.width}x{out.height} from {len(tiles)} tile(s)")
