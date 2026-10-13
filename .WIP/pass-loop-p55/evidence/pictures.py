# p55 Work 1: the three hero pictures enter assets/img/ from root previews/v12/img/ ONLY (never from product
# .WIP/mockup-v12/img/, which holds a watermarked stock picture). Each at most 1600 px wide and 250,000 bytes.
# hero2-home.jpg and hero2-strategie.jpg are over the bar: re-encoded as WebP (same 1600x900 pixels);
# hero-venture.jpg is under it: copied byte for byte.
# usage (product root): python .WIP/pass-loop-p55/evidence/pictures.py [--try]   (--try: print sizes per quality, write nothing)
import hashlib
import shutil
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image

PRODUCT = Path(__file__).resolve().parents[3]
SRC = PRODUCT.parent / "previews" / "v12" / "img"
DST = PRODUCT / "assets" / "img"
BAR = 250_000
QUALITY = {"hero2-home.jpg": ("hero-home.webp", 82), "hero2-strategie.jpg": ("hero-strategie.webp", 88)}


def webp(im, q):
    b = BytesIO()
    im.save(b, "WEBP", quality=q, method=6)
    return b.getvalue()


if "--try" in sys.argv:
    for name in QUALITY:
        im = Image.open(SRC / name).convert("RGB")
        print(name, im.size, (SRC / name).stat().st_size, {q: len(webp(im, q)) for q in (70, 75, 80, 82, 85, 88, 90)})
    sys.exit(0)

for name, (out, q) in QUALITY.items():
    im = Image.open(SRC / name).convert("RGB")
    assert im.width <= 1600, im.size
    data = webp(im, q)
    assert len(data) <= BAR, (out, len(data))
    (DST / out).write_bytes(data)
shutil.copyfile(SRC / "hero-venture.jpg", DST / "hero-venture.jpg")
for out in ("hero-home.webp", "hero-strategie.webp", "hero-venture.jpg"):
    p = DST / out
    with Image.open(p) as im:
        print(f"{out}: {im.width}x{im.height} {im.format}, {p.stat().st_size} bytes, sha256 {hashlib.sha256(p.read_bytes()).hexdigest()[:16]}")
        assert im.width <= 1600 and p.stat().st_size <= BAR
