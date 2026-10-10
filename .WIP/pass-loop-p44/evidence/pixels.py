# p44 pixel judgement of render.mjs captures. usage: python -I pixels.py <cap-dir> <tag> [<tag> ...]
# Launchers: band row = a capture row whose brightest pixel has luminance <= 30, read between x = 20 and w - 20
# (the 18 px rounded corners show the page background); prints the run of
# band rows from the top and from the bottom of each launcher capture (expect 0/0 after).
# Logos: for each logo box (render.json rects, CSS px = capture px at DPR 1), counts pixels LIGHTER than the
# band colour by more than 3 on any channel (a white slab; multiply never lightens) and samples the four
# corners 1 px inside the box. Hover captures: same count for the hovered logo + its colourfulness
# (max over pixels of max-min channel) next to the rest value.
import sys, os, json
from PIL import Image

D = sys.argv[1]


def lum(p):
    return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]


def band_runs(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    xs = range(20, w - 20)
    dark = [max(lum(px[x, y]) for x in xs) <= 30 for y in range(h)]
    top = 0
    while top < h and dark[top]:
        top += 1
    bot = 0
    while bot < h and dark[h - 1 - bot]:
        bot += 1
    mean_top = sum(lum(px[x, 0]) for x in xs) / len(xs)
    mean_bot = sum(lum(px[x, h - 1]) for x in xs) / len(xs)
    return w, h, top, bot, round(mean_top, 1), round(mean_bot, 1)


def logo_stats(im, bg, b):
    px = im.load()
    x0, y0 = int(round(b["x"])), int(round(b["y"]))
    x1, y1 = int(round(b["x"] + b["width"])) - 1, int(round(b["y"] + b["height"])) - 1
    lighter, colour = 0, 0
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            p = px[x, y]
            if any(p[i] > bg[i] + 3 for i in range(3)):
                lighter += 1
            colour = max(colour, max(p) - min(p))
    corners = [px[x0 + 1, y0 + 1], px[x1 - 1, y0 + 1], px[x0 + 1, y1 - 1], px[x1 - 1, y1 - 1]]
    near = sum(all(abs(c[i] - bg[i]) <= 3 for i in range(3)) for c in corners)
    return lighter, (x1 - x0 + 1) * (y1 - y0 + 1), near, colour


for tag in sys.argv[2:]:
    r = json.load(open(os.path.join(D, f"{tag}-render.json"), encoding="utf-8"))
    print(f"=== {tag}")
    for k, v in r["checks"].items():
        if k.startswith("launch "):
            name, width = k.split()[1:]
            w, h, top, bot, mt, mb = band_runs(os.path.join(D, f"{tag}-launch-{name}-{width}.png"))
            print(f"launch {name} @{width}: capture {w}x{h} (box {v['box']['width']:.0f}x{v['box']['height']:.0f}, ratio {v['ratio']:.3f}), natural {v['natural']}, attr {v['attr']}; band rows top {top} bottom {bot}; edge-row mean {mt}/{mb}")
        if k.startswith("logos "):
            width = k.split()[1]
            bg = tuple(int(float(t)) for t in v["bg"][v["bg"].index("(") + 1:-1].split(",")[:3])
            rest = Image.open(os.path.join(D, f"{tag}-logos-{width}-rest.png")).convert("RGB")
            tot_l, tot_near, res = 0, 0, {}
            for lg in v["logos"]:
                l, n, near, colour = logo_stats(rest, bg, lg)
                tot_l += l > 0
                tot_near += near
                res[lg["src"]] = (l, colour)
                print(f"  rest @{width} {os.path.basename(lg['src'])}: {lg['width']:.0f}x{lg['height']:.0f} lighter-than-band px {l}/{n}, corners = band±3 {near}/4, colourfulness {colour}; blend {lg['blend']}")
            print(f"logos @{width}: band {bg}; {len(v['logos'])} logos, {tot_l} with lighter-than-band pixels, corners at band±3 {tot_near}/{4 * len(v['logos'])}")
            for hv in v["hovered"]:
                if hv.get("missing"):
                    print(f"  hover @{width} {hv['name']}: MISSING")
                    continue
                im = Image.open(os.path.join(D, f"{tag}-logos-{width}-hover-{hv['name']}.png")).convert("RGB")
                lg = next(x for x in v["logos"] if f"logo_{hv['name']}" in x["src"])
                l, n, near, colour = logo_stats(im, bg, lg)
                print(f"  hover @{width} {hv['name']}: opacity {hv['opacity']} filter {hv['filter']} blend {hv['blend']}; lighter-than-band px {l}/{n}, corners band±3 {near}/4, colourfulness {colour} (rest {res[lg['src']][1]})")
