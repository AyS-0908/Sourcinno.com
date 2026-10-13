# p55 Work 3: hero markup of the four photo pages, patched as bytes (each page keeps its own line ending;
# nothing else in the file is read or rewritten). One exact replacement per page; refuses if the old line is
# not found exactly once. usage (product root): python .WIP/pass-loop-p55/evidence/markup.py
from pathlib import Path

PRODUCT = Path(__file__).resolve().parents[3]
IMG = '  <img class="hero__bg" src="{src}" alt="" width="{w}" height="{h}">'
PAGES = {
    "index.html": ('<section class="hero hero--animated">', '<section class="hero hero--cover hero--home">', "/assets/img/hero-home.webp", 1600, 900),
    "service-strategie-transformation/index.html": ('<section class="hero hero--offer hero--strategie">', '<section class="hero hero--cover hero--strategie">', "/assets/img/hero-strategie.webp", 1600, 900),
    "service-ia-business/index.html": ('<section class="hero hero--offer hero--ia">', '<section class="hero hero--cover">', "/pictures/1ai_hero.jpg", 554, 360),
    "service-venture-building/index.html": ('<section class="hero hero--offer hero--venture">', '<section class="hero hero--cover hero--venture">', "/assets/img/hero-venture.jpg", 1024, 1536),
}
for page, (old, new, src, w, h) in PAGES.items():
    p = PRODUCT / page
    data = p.read_bytes()
    nl = b"\r\n" if b"\r\n" in data else b"\n"
    old_b = old.encode() + nl + b'  <div class="container">'
    assert data.count(old_b) == 1, (page, data.count(old_b))
    new_b = new.encode() + nl + IMG.format(src=src, w=w, h=h).encode() + nl + b'  <div class="container">'
    out = data.replace(old_b, new_b)
    tmp = p.with_suffix(".p55tmp")
    tmp.write_bytes(out)
    tmp.replace(p)
    print(page, "patched,", "CRLF" if nl == b"\r\n" else "LF", len(data), "->", len(out), "bytes")
