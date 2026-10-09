# p37 copy check: every PLAN § Rework copy Stratégie item is shipped verbatim in the page.
# usage: python copy_check.py <root PLAN.md> <page>
# Données d'entrée / Livrables cells split on " · " -> each item must appear exactly once as
# <li>Item.</li> (first letter capitalised, final period: IA item style); visible line once as the row subtitle.
import re, sys

plan = open(sys.argv[1], encoding="utf-8").read()
page = open(sys.argv[2], encoding="utf-8").read()
section = plan[plan.index("Stratégie & Transformation rows"):]
rows = [l for l in section.splitlines() if re.match(r"\| 0[1-7] ", l)]
assert len(rows) == 7, len(rows)
html = lambda s: s.replace("&", "&amp;")
fails, items = [], 0
for row in rows:
    step, inputs, outputs, visible = [c.strip() for c in row.strip("|").split("|")]
    num, title = step.split(" ", 1)
    sub = f'<span class="service-question__number">{num}</span><span><strong>{html(title)}</strong><span class="disclosure__subtitle">{html(visible)}</span></span>'
    if page.count(sub) != 1: fails.append(f"{num} summary/visible line: {page.count(sub)}")
    if page.count(html(visible)) != 1: fails.append(f"{num} visible line count {page.count(html(visible))}")
    detail = page[page.index(sub):]
    detail = detail[:detail.index("</details>")]
    blocks = re.findall(r'<p class="service-detail__label">([^<]+)</p>\s*<ul class="ticks">(.*?)</ul>', detail, re.S)
    if [b[0] for b in blocks] != ["Données d'entrée", "Livrables"]: fails.append(f"{num} labels {[b[0] for b in blocks]}")
    for cell, (_, ul) in zip((inputs, outputs), blocks):
        want = [html(i[0].upper() + i[1:] + ".") for i in cell.split(" · ")]
        got = re.findall(r"<li>(.*?)</li>", ul)
        items += len(want)
        if want != got: fails.append(f"{num} items\n  want {want}\n  got  {got}")
print(f"rows 7, items {items}, failures {len(fails)}")
for f in fails: print("FAIL", f)
sys.exit(1 if fails else 0)
