# p44 thumbnails: measure dark full-width rows, and (with --crop) crop each file to the largest
# centred 16:9 box inside its non-dark rows. Pillow only. usage: python -I thumbs.py <img-dir> [--crop]
# Band row = a full-width row whose BRIGHTEST pixel has luminance <= 30 (the YouTube letterbox is uniform;
# the slides themselves can be dark, so a mean test would flag real content). After encoding, if an edge row
# of the result is a band row (JPEG bleed from sparse bright pixels), that side alone moves in by one row and
# the box is redone (ai-for-business: row 47 holds 2 bright pixels; the cut starts at row 48).
# JPEG quality starts at the source's estimate (luminance quantization table, IJG scaling) with the source's
# chroma subsampling; if the file lands outside +/-30 % of the source size, quality steps by 1 toward it.
# Every file is written to a temp, then os.replace'd.
import sys, os, io
from PIL import Image, JpegImagePlugin

NAMES = ["ai-for-business-video.jpg", "video-corpangels-corporates.jpg",
         "video-corpangels-technoservice.jpg", "video-pib-bci.jpg"]
DARK = 30
STD_LUMA = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56,
            14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
            49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99]


def rows(im):
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    mx = [max(px[x, y] for x in range(w)) for y in range(h)]
    top = 0
    while top < h and mx[top] <= DARK:
        top += 1
    bot = h - 1
    while bot >= 0 and mx[bot] <= DARK:
        bot -= 1
    return top, bot, mx


def quality(im):
    ratio = sum(v / s for v, s in zip(im.quantization[0], STD_LUMA)) / 64 * 100
    return round(5000 / ratio) if ratio > 100 else round((200 - ratio) / 2)


def box_for(w, top, bot):
    content_h = bot - top + 1
    cw, ch = w, round(w * 9 / 16)
    if ch > content_h:
        ch = content_h
        cw = round(ch * 16 / 9)
    y0 = int(round((top + bot + 1) / 2 - ch / 2))
    y0 = max(top, min(y0, bot + 1 - ch))
    x0 = (w - cw) // 2
    return (x0, y0, x0 + cw, y0 + ch)


def encode(img, q, samp):
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=q, subsampling=samp, optimize=True)
    return buf.getvalue()


def main():
    d = sys.argv[1]
    crop = "--crop" in sys.argv
    for n in NAMES:
        p = os.path.join(d, n)
        size0 = os.path.getsize(p)
        im = Image.open(p)
        im.load()
        w, h = im.size
        top, bot, mx = rows(im)
        q0, samp = quality(im), JpegImagePlugin.get_sampling(im)
        print(f"{n}: {w}x{h} {size0} B, est. quality {q0}, subsampling {samp}; band rows 0..{top-1} and {bot+1}..{h-1}")
        if not crop:
            continue
        it, ib = 0, 0
        while True:
            box = box_for(w, top + it, bot - ib)
            out = im.crop(box)
            q = q0
            data = encode(out, q, samp)
            while len(data) > size0 * 1.3 and q > 50:
                q -= 1
                data = encode(out, q, samp)
            while len(data) < size0 * 0.7 and q < 95:
                q += 1
                data = encode(out, q, samp)
            t1, b1, mx1 = rows(Image.open(io.BytesIO(data)))
            if t1 == 0 and b1 == out.size[1] - 1:
                break
            it += t1 > 0
            ib += b1 < out.size[1] - 1
        tmp = p + ".tmp"
        with open(tmp, "wb") as f:
            f.write(data)
        os.replace(tmp, p)
        print(f"   box {box} inset top {it} bottom {ib} -> {out.size[0]}x{out.size[1]}, quality {q}, {len(data)} B ({(len(data) - size0) * 100 / size0:+.1f} %); edge rows max {mx1[0]}/{mx1[-1]}")


main()
