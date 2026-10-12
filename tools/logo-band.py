# Bandeau de logos de l accueil (#references) : reconstruit les images sur UNE regle, pour qu une seule
# hauteur CSS convienne a toutes (owner 2026-10-12, Pass 52).
#   1. dessin seul : marges retirees, fond transparent, une seule teinte (--navy, grisee au repos par le filtre CSS) ;
#   2. taille tiree de la forme (un mot long est moins haut, une marque compacte plus haute) et du poids
#      (une marque tres grasse est reduite) ;
#   3. meme hauteur de toile pour toutes, le centre de masse du dessin pose sur le centre de la toile
#      (les lettres s alignent, l accent d Accenture depasse au-dessus).
# Usage, depuis la racine du produit : python tools/logo-band.py
#   Python + Pillow + numpy (outil d auteur, hors de check.mjs). Ecrit pictures/band_*.png en 2x et affiche
#   la hauteur CSS et les attributs width/height a reporter dans index.html.
# Ajouter un logo : une ligne dans SOURCES, relancer (la hauteur de toile peut changer : reporter aussi la hauteur CSS).
import io
import os
import subprocess

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Sortie -> origine. "git:<sha>:<chemin>" = fichier d origine dans l historique ; sinon un chemin sur disque.
ORIGIN = "git:f44e08b:pictures/"
SOURCES = {
    "band_accenture.png": ORIGIN + "logo_accenture.png",
    "band_mazars.png": ORIGIN + "logo_mazars.png",
    "band_mzlab.png": ORIGIN + "logo_mzlab.png",
    "band_fabereo.png": ORIGIN + "logo_fabereo.png",
    "band_nomaban.png": ORIGIN + "logo_nomaban_nb.png",
    "band_ibanfirst.png": ORIGIN + "logo_ibanfirst_nb.png",
    "band_particeep.png": ORIGIN + "logo_particeep_nb.png",
    "band_yoopala.png": ORIGIN + "logo_yoopala_nb.png",
    "band_parisnco.png": ORIGIN + "logo_parisnco_nb.png",
    "band_ioi.png": ORIGIN + "logo_ioi_nb.png",
    "band_tydex.png": ORIGIN + "logo_tydex_nb.png",
    "band_emlyon.png": ORIGIN + "logo_emlyon_nb.png",
    "band_guidemichelin.png": ORIGIN + "logo_guidemichelin_nb.png",
}
BASE = 60.0      # largeur d une marque carree, px CSS, avant correction de poids
SHAPE = 0.5      # 0 = meme largeur pour toutes, 1 = meme hauteur pour toutes
WEIGHT = 0.6     # force de la reduction des marques grasses
WEIGHT_MIN, WEIGHT_MAX = 0.70, 1.05  # une marque legere n est pas gonflee
MAXW = 176.0     # marque la plus large, px CSS
MINH = 16.0      # aucun dessin plus bas, sauf si MAXW l interdit
GAMMA = 0.75
TONE = (26, 54, 93)  # --navy
SCALE = 2        # fichiers ecrits a 2x la taille affichee


def load(source):
    if source.startswith("git:"):
        _, sha, path = source.split(":", 2)
        raw = subprocess.run(["git", "-C", ROOT, "show", f"{sha}:{path}"], capture_output=True, check=True).stdout
        return Image.open(io.BytesIO(raw)).convert("RGBA")
    return Image.open(os.path.join(ROOT, source)).convert("RGBA")


def ink_of(im):
    a = np.asarray(im).astype(np.float64) / 255.0
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    ink = a[..., 3] * (1.0 - lum)
    if a[..., 3].min() < 0.98:  # fichier transparent : ce qui est opaque est du dessin, meme clair
        ink = np.maximum(ink, a[..., 3] * 0.35)
    ink = np.clip(ink / np.percentile(ink[ink > 0.12], 90), 0, 1)
    ink[ink < 0.06] = 0
    ink = ink ** GAMMA
    # Une ligne ou une colonne fait partie du dessin si elle porte au moins 2 % de la plus chargee :
    # les poussieres tombent (Paris&Co en a sous son nom), une icone claire reste (le carre de Particeep).
    rs, cs = ink.sum(axis=1), ink.sum(axis=0)
    rows, cols = np.where(rs > 0.02 * rs.max())[0], np.where(cs > 0.02 * cs.max())[0]
    return ink[rows[0]:rows[-1] + 1, cols[0]:cols[-1] + 1]


marks = {}
for name, source in SOURCES.items():
    ink = ink_of(load(source))
    marks[name] = {"ink": ink, "ratio": ink.shape[1] / ink.shape[0], "weight": float(ink.mean())}
ref = float(np.median([m["weight"] for m in marks.values()]))
for m in marks.values():
    width = BASE * m["ratio"] ** SHAPE * float(np.clip((ref / m["weight"]) ** WEIGHT, WEIGHT_MIN, WEIGHT_MAX))
    width = min(max(width, MINH * m["ratio"]), MAXW)
    m["w"], m["h"] = width, width / m["ratio"]
    ys = np.arange(m["ink"].shape[0]) + 0.5
    m["centre"] = float((m["ink"].sum(axis=1) * ys).sum() / m["ink"].sum()) / m["ink"].shape[0]  # 0 haut .. 1 bas
canvas_h = int(np.ceil(2 * max(max(m["centre"], 1 - m["centre"]) * m["h"] for m in marks.values())))
canvas_h += canvas_h % 2
for name, m in marks.items():
    w2, h2 = round(m["w"] * SCALE), round(m["h"] * SCALE)
    alpha = Image.fromarray((m["ink"] * 255).round().astype(np.uint8), "L").resize((w2, h2), Image.LANCZOS)
    layer = Image.new("RGBA", (w2, h2), TONE + (255,))
    layer.putalpha(alpha)
    canvas = Image.new("RGBA", (w2, canvas_h * SCALE), TONE + (0,))
    canvas.paste(layer, (0, round(canvas_h * SCALE / 2 - m["centre"] * h2)))
    target = os.path.join(ROOT, "pictures", name)
    canvas.save(target, optimize=True)
    print(f'{name:24} dessin {m["w"]:5.1f}x{m["h"]:4.1f} px  poids {m["weight"]:.2f}  centre {m["centre"]:.2f}  width="{w2}" height="{canvas_h * SCALE}"  {os.path.getsize(target)} octets')
print(f"hauteur CSS commune : {canvas_h}px (#references .logo-band img)")
