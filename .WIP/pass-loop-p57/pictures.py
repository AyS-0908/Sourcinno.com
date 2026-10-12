# p57 copy of .WIP/pass-loop-p57/pictures.py, unchanged but for these header lines (Pillow, as tools/logo-band.py).
# A JPEG source is saved PNG first, then WebP when that PNG is over 300 KB. Only the posts saved in THIS folder's wix/ are built.
#   python .WIP/pass-loop-p57/pictures.py build   wix/media originals -> assets/img/blog/ (+ wix/pictures.json for import.mjs)
#   python .WIP/pass-loop-p57/pictures.py check   Done When 5: every file of assets/img/blog/ <= 300 KB and <= 1600 px
# Rule: long side capped at 1600 px; PNG kept when <= 300 KB, else WebP (quality 85 down to 60, fails below);
# video thumbnails 480x270 JPEG like assets/img/video-*.jpg. Names: <post slug>-<n>.<ext>, video-<id>.jpg.
import json, re, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
WIX, MEDIA, OUT = HERE / "wix", HERE / "wix" / "media", ROOT / "assets" / "img" / "blog"
MAX_SIDE, MAX_BYTES = 1600, 300 * 1024


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    table = {}
    for page in sorted(WIX.glob("*.html")):
        text = page.read_text(encoding="utf-8")
        for n, uri in enumerate(re.findall(r'<wow-image id="([^"]+)"', text), 1):
            im = Image.open(MEDIA / uri)
            src = im.size
            if max(im.size) > MAX_SIDE:
                k = MAX_SIDE / max(im.size)
                im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
            target = OUT / f"{page.stem}-{n}.png"
            im.save(target, optimize=True)
            if target.stat().st_size > MAX_BYTES:
                target.unlink()
                target = target.with_suffix(".webp")
                for q in (85, 80, 75, 70, 65, 60):
                    im.save(target, quality=q, method=6)
                    if target.stat().st_size <= MAX_BYTES:
                        break
                else:
                    sys.exit(f"ECHEC {uri}: still over 300 KB at WebP quality 60")
            table[uri] = {"file": target.name, "width": im.width, "height": im.height}
            print(f"{target.name}: source {src[0]}x{src[1]} -> {im.width}x{im.height}, {target.stat().st_size} bytes")
        for vid in dict.fromkeys(re.findall(r"i\.ytimg\.com/vi/([\w-]+)/maxresdefault\.jpg", text)):
            target = OUT / f"video-{vid}.jpg"
            if f"video-{vid}" in table:
                continue
            im = Image.open(MEDIA / f"video-{vid}.jpg").convert("RGB")
            src = im.size
            if abs(im.width / im.height - 16 / 9) > 0.01:
                sys.exit(f"ECHEC video-{vid}.jpg: {im.width}x{im.height} is not 16:9")
            im = im.resize((480, 270), Image.LANCZOS)
            im.save(target, quality=82, optimize=True, progressive=True)
            table[f"video-{vid}"] = {"file": target.name, "width": 480, "height": 270}
            print(f"{target.name}: source {src[0]}x{src[1]} -> 480x270, {target.stat().st_size} bytes")
    (WIX / "pictures.json").write_text(json.dumps(table, indent=1) + "\n", encoding="utf-8")


def check():
    bad = 0
    files = sorted(p for p in OUT.iterdir())
    for p in files:
        with Image.open(p) as im:
            w, h = im.size
        size = p.stat().st_size
        ok = size <= MAX_BYTES and max(w, h) <= MAX_SIDE
        bad += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {p.name}: {w}x{h}, {size} bytes ({size / 1024:.0f} KB)")
    print(f"PICTURES assets/img/blog: {len(files)} file(s), over 300 KB or 1600 px: {bad}")
    sys.exit(1 if bad or not files else 0)


{"build": build, "check": check}[sys.argv[1]]()
