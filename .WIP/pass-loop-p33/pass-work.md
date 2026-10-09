# Pass p33 — Page Venture Building : matrice, ordre et nom unique

STARTUP: unit p33, stop_mode decisions-only, audit_launch_cap 2 (AGENTS Work budget: one fresh review, same reviewer confirms only on FIX), seal = whole product repository (no seal_paths). Ground clear: P32 closed GREEN, no owed tests. Root Planner inputs saved as 632d8ea. Product base eb9916d (clean). Models: work claude-opus-5-5 (runtime-exposed model id), effort unknown; auditor declared claude-opus-5-5@unknown, inherited defaults (PROGRESS Model restriction exception), not verified by any script. Start 16:40 local.

## SLICE
Source: PLAN § 33 Work 1–4, Done When 1–4; Coder prompt `prompts/pass33-coder.md` A–E.
Size: one turn (~35 min): one page re-ordered + one HTML/CSS component, three meta/JSON-LD text edits, one check rule, one CSS cue. No split needed.
1. Kodak section (`#kodak`) first after the hero: h2, `.vb-kodak` two columns > 860 px (matrix left, text right), one column ≤ 860 px (matrix first). Matrix `.vb-matrix*` = HTML/CSS 2×2 grid, axis Offre (Existante → Nouvelle) under, axis Client (Existant → Nouveau) beside; Exploration highlighted navy + white. Accessibility choice: `role="img"` + `aria-label` naming the two axes and the four quadrants with their content (one sentence a screen reader reads in order); the visible children are presentational. Text = PNG lead + six rows, three plan substitutions (MM€ → Md€, le@ders → leaders, 🚀 → →). PNG figure removed; four images `git rm`.
2. Order Kodak → `#besoin` (eyebrow and « Approche & Outils » card removed, TechnoService video in place) → `#experience` (eyebrow removed, h2 « Expériences associées », `<strong>` name repeats removed) → `#reflexion` (h2 « Réflexion », Corporates video only). Name « Venture Building » in title, meta/og, h1.
3. A-002: `index.html` three `itemOffered.name`, `:32` description, `:7,:13` meta/og descriptions; `contact/index.html:7`. New `--seo` rule in `checkSeo` (JSON.parse each ld+json block, walk for `@type` Service, map url → local page, decode entities, case-sensitive substring of `<title>` or `<h1>`); header comment updated.
4. `.band-figure figcaption a` underline + `--teal-dark` (three video captions: IA ×1, Venture ×2; the Stratégie figcaptions carry no link). `node tools/version.mjs`.
Gates: none internal (no money/auth/migration path). Mutation pins on the new rule (scratch export, never the live tree).
MANUAL: none for this Pass — every criterion is a command or a headless-Chrome measurement this session drives (rendered by Chrome at 1200/375, computed colours, scripts-off).
Server: own `python -m http.server 4173` (4173 free at pre-flight; 4174 belongs to an earlier session, not used).

## EXPECTED TESTS
- AUTO-1 DW1 greps (product folder): `grep -c "vb-introduction\|Startups d\|section__eyebrow\|Approche &amp; Outils\|RÉFLEXION" service-venture-building/index.html` — expect 0; `grep -c 'data-video="' …` — expect 2; `git ls-files` of the four images — expect empty; `grep -rn "Startups d\|IA for Business\|Venture Building & Portfolio" --include=*.html . | grep -v "\.WIP\|_v2"` — expect empty.
- AUTO-2 `node tools/check.mjs --all` — expect exit 0 and a `--seo` note naming the JSON-LD check (3 services). Mutation pins on a `git -c core.autocrlf=false archive` scratch copy in the session scratchpad: (a) one renamed `itemOffered.name` → exit 1 naming it; (b) one `url` to a missing page → exit 1; (c) one broken JSON block → exit 1 said as a parse error. `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check`, `git diff --quiet 670f72f HEAD -- .github/` — expect exit 0.
- AUTO-3 rendered (headless Chrome, `evidence/render.mjs`, host-resolver-rules blocking YouTube, reduced-motion set explicitly, scroll + wait from Node) on `/service-venture-building/` at 1200 and 375: section tops in order kodak < besoin < experience < reflexion; at 1200 matrix right ≤ text left and matrix width ≥ 420; at 375 `scrollWidth ≤ innerWidth`; every matrix text node's element ≥ 14 px computed and quadrant texts inside their quadrant rect; Exploration contrast ≥ 4.5 from computed `color` vs nearest opaque ancestor `background-color`; every `.band-figure figcaption a` computed `text-decoration-line` underline (Venture 2 + IA 1); scripts disabled: `#kodak` rect > 0 inside document and opacity 1. Pre captures at 1200/375 before any edit.
- AUTO-4 `git status --short` of root never lists `outputs/` as staged; no fetch/push/deploy commands in this session.
Changed files → AUTO reach: `service-venture-building/index.html` (AUTO-1/2/3), `index.html` (AUTO-1/2 --seo JSON-LD + meta length), `contact/index.html` (AUTO-2 --seo meta length), `assets/css/style.css` (AUTO-3 rendered + AUTO-2 version), `tools/check.mjs` (AUTO-2 run + mutation pins), four deleted images (AUTO-1 ls-files + AUTO-2 broken-link scan), `?v=` stamps (AUTO-2 version check). None unreached.

## CHANGED
- `service-venture-building/index.html`: name « Venture Building » (title, meta/og, h1); new `#kodak` section first (h2, `.vb-matrix` role=img + aria-label, PNG lead + six rows); `#besoin` eyebrow and « Approche & Outils » card removed; `#experience` eyebrow removed, h2 « Expériences associées », `<strong>` name repeats removed (first word capitalised); `#reflexion` h2 « Réflexion », PNG figure removed, Corporates video kept.
- `index.html`: meta/og descriptions, JSON-LD `:32` description and three `itemOffered.name` (« Stratégie > Transformation opérationnelle », « Entreprise IA », « Venture Building »). `contact/index.html:7` meta description.
- `assets/css/style.css`: `.band-figure figcaption a` cue (underline, `--teal-dark`); `.vb-kodak*` / `.vb-matrix*` family + its 860/640 blocks.
- `tools/check.mjs`: `checkSeo` JSON-LD Service rule + header comment.
- `git rm`: `assets/img/vb-introduction.png`, `assets/img/vb-introduction_2.png`, `pictures/vb_matrix_1.avif`, `pictures/vb_matrix_2.avif`.
- `?v=` stamps by `node tools/version.mjs` (16 pages, style.css hash only).
- Root docs (other repo, not sealed): PLAN § 33 status Done + evidence pointer; ARCHITECTURE line 14 one clause on the `--seo` JSON-LD rule.
- Unit evidence (ignored `.WIP`): `evidence/render.mjs`, `evidence/captures-pre/` (10 jpg + result-pre.json), `evidence/captures-r1/` (16 jpg + result-post.json).

## TEST-RESULTS r1
TREE: 091a2d9d763ed198
CMD: `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `git diff --check` ; `git diff --quiet 670f72f HEAD -- .github/` ; DW1 greps (AUTO-1) ; `node .WIP/pass-loop-p33/evidence/render.mjs .WIP/pass-loop-p33/evidence/captures-r1 <scratchpad>/chrome-r1d post`
RESULT: PASS — check --all exit 0 (16 pages, `--seo: JSON-LD : 3 Service(s) verifie(s) …`, both executed tests PASS); version 0 (42 refs); shell 0; diff --check 0; .github 0; DW1 = 0 / 2 / empty / empty; render exit 0, `pass: true` at 1200 and 375 (result-post.json).
NOTES: Rendered 1200: section tops kodak 393 < besoin 966 < experience 2262 < reflexion 2705; matrix 37–569 (w 532) left of text 617; 13 matrix texts ≥ 14.4 px, quadrant texts inside their cells; Exploration white on navy rgb(26,54,93) from the cell itself = 12.14:1; captions underline teal-dark (Venture 2, IA 1); scripts off: #kodak and matrix in viewport, topmost, opacity 1; 0 YouTube requests. 375: same order, matrix (top 268) above text, scrollWidth 375/375, same text/contrast/caption/no-script results.
  Mutation ledger (scratch export `git -c core.autocrlf=false archive HEAD` + working files, session scratchpad; base copy `--all` exit 0): (a) `"name": "Entreprise IA Pro"` → `--seo` exit 1 « absent du <title> … et du <h1> … »; (b) venture `url` → `/service-absent/` → exit 1 « la page … n existe pas »; (c) one comma removed in the JSON-LD → exit 1 « JSON-LD illisible (JSON.parse) » + « aucun objet Service trouve »; (d) `"venture building"` (case) → exit 1. The Stratégie name passes only through `&gt;` decoding of its h1/title.
  Render probe fix inside this round (evidence script, not product): first no-script topmost probe hit the 76 px sticky header at section top+40; re-probed at the centre below the header.
  Port: own `python -m http.server 4173 --bind 127.0.0.1`; served bytes `cmp`-identical to the tree (page and style.css).


## Reviewer contact 1 - advisory notes (Tier 3, non-blocking, no fix section)
- At 320 px (outside Done When 3, which pins 375) the Développement quadrant breaks mid-word (« Développem/ent ») because `.vb-matrix__cell` uses `overflow-wrap: anywhere`; no overflow, text stays inside its box. Optional later: `hyphens: auto` or a smaller name size at <= 360 px (Pass 38 backlog).
- Guillemets use plain spaces (« autour »), so « can end a line alone at 320 px; `&nbsp;` inside the guillemets would keep them together.
- Root docs repository (separate repo, not covered by this product seal): `git diff` shows ARCHITECTURE.md +1 sentence for the `--seo` JSON-LD rule and PLAN.md § 33 status flip + evidence pointer only, as the Coder prompt section E allows.

```json
{
  "token": "3476539d",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {
      "cmd": "node tools/check.mjs --all",
      "result": "PASS"
    },
    {
      "cmd": "node tools/version.mjs --check",
      "result": "PASS"
    },
    {
      "cmd": "node tools/shell.mjs --check",
      "result": "PASS"
    },
    {
      "cmd": "git diff --check && git diff --quiet 670f72f HEAD -- .github/ && git diff --quiet 670f72f -- .github/",
      "result": "PASS"
    },
    {
      "cmd": "grep -c \"vb-introduction\\|Startups d\\|section__eyebrow\\|Approche &amp; Outils\\|RÉFLEXION\" service-venture-building/index.html (=0); grep -c 'data-video=\"' service-venture-building/index.html (=2); git ls-files <4 images> (empty); grep -rn \"Startups d\\|IA for Business\\|Venture Building & Portfolio\" --include=*.html . | grep -v \"\\.WIP\\|_v2\" (empty)",
      "result": "PASS"
    },
    {
      "cmd": "scratch copy (tar, no .git/.WIP): itemOffered.name 'Entreprise IA' -> 'Entreprise IA Pro'; node tools/check.mjs --seo (exit 1 expected, got 1)",
      "result": "PASS"
    },
    {
      "cmd": "scratch copy: Venture Service url -> /service-absent/; node tools/check.mjs --seo (exit 1 expected, got 1); JSON-LD syntax error -> exit 1; unmutated copy -> exit 0",
      "result": "PASS"
    },
    {
      "cmd": "python -m http.server 4191; node .WIP/pass-loop-p33/evidence/render.mjs <scratch>/render/out <scratch>/render/profile post http://127.0.0.1:4191 (venture-1200.pass and venture-375.pass true: order kodak>besoin>experience>reflexion, matrix 532px left of text, no overflow, matrix texts >=14px inside quadrants, Exploration 12.14:1, 3 caption links underline, scripts-off Kodak visible, 0 YouTube requests)",
      "result": "PASS"
    },
    {
      "cmd": "git show eb9916d:assets/img/vb-introduction.png vs service-venture-building/index.html #kodak (visual transcription: lead, six rows, axes, quadrants; only MM€->Md€, le@ders->leaders, rocket->arrow substituted)",
      "result": "PASS"
    },
    {
      "cmd": "git -c core.autocrlf=false diff -U0 eb9916d -- <13 other pages> | grep '^[+-]' | sort | uniq -c (only the style.css ?v= stamp line)",
      "result": "PASS"
    },
    {
      "cmd": "git rev-list --count origin/rebuild..HEAD (46, unchanged); .git/FETCH_HEAD mtime 2026-10-03; root git diff --cached --name-only (empty), git ls-files outputs (empty)",
      "result": "PASS"
    }
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 126,366 tokens, 5 min 06 s (306,374 ms), 34 tool uses, GREEN high (Agent completion notice)
INVOCATION: fresh pass-auditor subagent, contact 1 of 2 | USAGE BASIS: whole-contact (subagent_tokens in the completion notice)

## CLOSURE
UNIT: p33
DOCS: root PLAN § 33 status Done + evidence pointer and ARCHITECTURE line 14 (`--seo` JSON-LD clause), both before review; root PROGRESS (Done, Open, Next Action, Last Verification, Known minor issues) and CHANGELOG entry after GREEN, in the root closure commit. No PRD/README edit.
MIGRATED: final AUTO evidence (r1), mutation ledger, rendered measurements, verdict GREEN high and contact cost → root PROGRESS Last Verification (Pass 33); owner-visible summary → root CHANGELOG.
NITS: reviewer Tier 3 (320 px « Développement » mid-word break; guillemets without `&nbsp;` around « autour ») → root PROGRESS Known minor issues (P33 line, routed to Pass 38 backlog for the Planner).
COMMIT: ffea34d85750e08ab42181adb44587c224099c89 (product rebuild work commit; LOCAL ONLY, not pushed — owner rule)
