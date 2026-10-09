# Pass p37 — Services : même structure pour Stratégie & Transformation

## STARTUP
- Root main 0ab140e measured, expected dirt exact; Planner inputs saved as root 805181c (PLAN, PROGRESS, README, prompts/pass36-coder.md deleted, prompts/pass37-coder.md added). outputs/ untracked, never staged.
- Product rebuild opening baseline 3b43901, clean, 58 ahead of origin/rebuild (LOCAL ONLY; no fetch/push). check-ignore `.git/info/exclude:7:/.WIP/`; no p37 state.json before init.
- Ground clear: PROGRESS has no owed human test or open defect for P36.
- Models: work = unknown (not exposed as runtime metadata; declared Opus 5.5 by the system prompt only); auditor = inherited defaults (no effort control exposed). PROGRESS Model restriction exception applies.
- Startup values from the Coder prompt: unit p37, decisions-only, audit_launch_cap 2, whole-repo seal (no seal_paths).
- Active time start 20:21 local (`date`). Fresh conversation (opened by /clear).
- Ports 4173 and 4174 free (`netstat -ano`): own `python -m http.server 4173 --bind 127.0.0.1` from the product folder; `curl | cmp` SAME for the three service pages and style.css.

## SLICE
PLAN § 37 Work 1–3, one turn (~30 min): one page, two section rebuilds on the shipped P36 structure, CSS reused. Matches the planned size; no split.
- Work 1 `service-strategie-transformation/index.html` `#besoin`: modifier `service-refinement--usecases`; eyebrow removed; h2 « Votre besoin &gt; Livrables » and lead sentence kept; `10% d'inspiration` / `90% de transpiration` kept; rows 01–07 mirror the IA row markup (`summary` = number + `<strong>` title + `.disclosure__subtitle` visible line; `.service-detail` = `.service-question`, label « Données d'entrée », `ul.ticks`, label « Livrables », `ul.ticks`); no `.service-rollout`, no Niveau strip; `.service-pilotage` paragraph removed (its content is row 05's Livrables per § Rework copy).
- Copy: Données d'entrée / Livrables items and visible lines from PLAN § Rework copy, exact; one `<li>` per « · » item, first letter capitalised and a final period (IA item style). Questions = page wording, emoji removed (🛣️ 🛠️ 💰 📅 ☑️ ✨), « offre x client x géographie » → « offre × client × géographie » (table/IA style), nothing else rewritten.
- Apostrophes: new strings use the straight `'` (PLAN table, IA « Données d'entrée », page `10% d'inspiration`); existing card text keeps its `’`. `grep -cF` checks use the straight form.
- Work 2: `#experience` eyebrow removed, h2 « Expériences associées », five cards unchanged; `#reflexion` h2 « Réflexion »; each `<img>` wrapped in `<a href="/assets/img/…-original.png" target="_blank" rel="noopener" aria-label="<figcaption subject> (nouvel onglet)">` (« Stratégie », « Business model »); `alt`, `width`, `height`, `loading` kept; both « Agrandir l'image » links removed. PNG files untouched (Safety-gate hashes).
- Work 3: no CSS planned; a rule is added inside the P36 block only if a rendered check shows a gap (focus ring / link box on the diagram links), then `node tools/version.mjs`.
- Acceptance order: audit-first (default). No live system touched: localhost only, YouTube / Typebot / jsdelivr hosts NOTFOUND at the resolver, Google Fonts allowed.
- No MANUAL items: every Done When item is driven by commands or headless Chrome on this machine.

## EXPECTED TESTS
- AUTO-1 DW1 on `service-strategie-transformation/index.html`: `grep -cE "section__eyebrow|service-pilotage|RÉFLEXION|Agrandir|Expérience associée<"` = 0; `grep -c "Données d'entrée"` ≥ 7; `grep -c '<details class="disclosure"'` = 7; `grep -c "service-refinement--usecases"` = 1; `grep -c "Expériences associées"` = 1. Extra pins: emoji in the page body `grep -cP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]"` = 0; h2 « Réflexion » = 1.
- AUTO-2 DW2: each of the seven visible Livrables lines `grep -cF` = 1; `grep -c 'href="/assets/img/strategy-original.png"'` = 1 and `grep -c 'href="/assets/img/transformation-original.png"'` = 1; every Données d'entrée / Livrables item of § Rework copy present (`grep -cF` per item, case-insensitive on the first letter) — 40 items; the seven questions present without emoji.
- AUTO-3 DW3: `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check`, `git diff --quiet 670f72f HEAD -- .github/` exit 0; `git diff --stat 3b43901` = Stratégie page only (+ style.css and `?v=` stamps if CSS changed); the two original PNG SHA256 = Safety-gate values.
- AUTO-4 DW4: `node .WIP/pass-loop-p37/evidence/render.mjs <out> <profile> post` → strategie.pass = true at 1200 and 375: lead `background-color` rgba(0, 0, 0, 0), padding 0; summary align flex-start; 7 rows / 7 disclosures / 5 cards / 2 diagram links; every `main *` right edge ≤ emulated width closed and with row 05 open (row 05 last Livrables item topmost); real Tab (`Input.dispatchKeyEvent`) → row 01 summary `:focus-visible`, Enter → open, question + « Données d'entrée » topmost; real Tab reaches both diagram links, `:focus-visible`, outline drawn, own rect > 0 and topmost; scripts off: 7 summaries + 5 cards + 2 diagram links visible and topmost, both images loaded, sections opacity 1; 0 requests outside localhost / Google Fonts. Captures: Stratégie closed, row 05 open, scripts off, diagram focus, 1200/375.
- AUTO-5 DW4 IA and Venture unchanged: `pre` (taken before any edit, `captures-pre/`) vs `post` geometry + computed colour/background/align-items of every `#besoin` / `#experience` element at 1200 and 375, exact equality (section geometry, not full-page pixels: PROGRESS Known minor issues).
- AUTO-6 Mutation of the modifier hook, in the browser DOM only: render removes `service-refinement--usecases` from the Stratégie section → lead turns into the shared grey box and summary `align-items` returns to `baseline`.
- Changed files vs coverage: `service-strategie-transformation/index.html` (AUTO-1/2/4/6, check --all); style.css only if changed (AUTO-4/5, version --check); root PLAN.md status token (not in the product seal; diff review). None left uncovered.

## CHANGED
- Product: `service-strategie-transformation/index.html` (`#besoin` rebuilt with the modifier and rows 01–07, Pilotage paragraph removed; `#experience` eyebrow removed + plural h2; h2 « Réflexion »; both diagram images wrapped in their original-PNG link, two « Agrandir » links removed; scratch Python patch, LF kept, 329 lines); `assets/css/style.css` (2 lines at the end of the P36 block: `.band-figure > a { display: block; border-radius }`, added because the first render showed no visible focus ring: the inline link around a block image computed `outline: solid 3px` but drew nothing; `.band-figure > a` matches only the two Stratégie diagram links, no other page has a direct `a` child in `.band-figure`); `?v=` stamps on 16 pages (`node tools/version.mjs`, 43 refs).
- Root (docs repo, not in the product seal): PLAN.md § 37 status token Done + evidence pointer line. ARCHITECTURE checked (`grep -i` agrandir/pilotage/original/usecases/disclosure: no hit; lines 9/14 still true): no change.
- Evidence: `.WIP/pass-loop-p37/evidence/render.mjs` (p36 recipe adapted to Stratégie), `captures-pre/` (taken before any edit: 6 PNG + geometry). First post run (before the CSS rule) kept in the session scratchpad only, not committed.

## TEST-RESULTS r1
TREE: ed4fdcac7b8c3251
CMD: `python .WIP/pass-loop-p37/evidence/copy_check.py <root>/PLAN.md service-strategie-transformation/index.html` + the AUTO-1/2 `grep -c` / `grep -cF` pins ; `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `git diff --check` ; `git diff --quiet 670f72f HEAD -- .github/` ; `git diff --stat 3b43901` ; `node .WIP/pass-loop-p37/evidence/render.mjs .WIP/pass-loop-p37/evidence/captures-r1 <scratchpad>/chrome-r1 post`
RESULT: PASS — copy_check: 7 rows, 35 items (measured; the slice's « 40 » was an estimate), 0 failures; mutation on a scratch copy (« Kick-off. » → « Kick-off ») → exit 1 naming row 06. DW1 forbidden 0; « Données d'entrée » 7; `<details class="disclosure"` 7; modifier 1; « Expériences associées » 1; h2 « Réflexion » 1; emoji in body 0 (Python scan, U+1F300–1FAFF, U+2600–27BF, U+FE0F). DW2 seven visible lines 1 each; `href` strategy-original 1, transformation-original 1; aria-labels « Stratégie (nouvel onglet) » / « Business model (nouvel onglet) » 1 each; seven questions 1 each; h2 « Votre besoin &gt; Livrables », lead, `10% d'inspiration`, `90% de transpiration` 1 each; `service-rollout|service-level` 0; title/meta/h1 diff lines 0; PNG SHA256 = Safety-gate values. DW3 check --all 0 (16 pages, both executed tests PASS); version 0 (43 refs); shell 0; diff --check 0; .github 0; diff --stat 3b43901 = 17 files +132/−42 (Stratégie page, style.css +2, 15 other files carry only their `style.css?v=` line). DW4 render strategie.pass=true at 1200 and 375: lead rgba(0, 0, 0, 0), padding 0; summary flex-start; 7 rows / 7 disclosures / 5 cards / 2 diagram links; max right edge 1185 / 375 closed and row 05 open (last Livrables item topmost); real Tab ×24 (1200) / ×19 (375) to row 01, `:focus-visible`, Enter → open, question + « Données d'entrée » topmost; Tab ×7 then ×1 to the two diagram links, `:focus-visible`, outline solid 3px drawn around the image (capture), 760×428 / 760×610 (1200), 327×184 / 327×262 (375), topmost; scripts off: 7 summaries + 5 cards + 2 links visible and topmost, both images loaded, sections opacity 1; mutation (modifier removed in the DOM) → lead rgb(245, 248, 252) padding 24px, summary baseline; 0 requests outside localhost / Google Fonts in every run. IA / Venture: geometry + colours of every `#besoin` / `#experience` element (113 / 68) identical pre vs post at 1200 and 375.
NOTES: CSS gap found by render r0 (scratchpad, before the rule): the inline `<a>` around the block image computed `outline: solid 3px` but drew no ring (capture); `.band-figure > a { display: block; border-radius: var(--radius-lg) }` fixed it (r1 capture shows the ring). Full-page capture `post-strategie-1200.png` shows the Business model image blank (lazy-load timing, PROGRESS Known minor issues); the image itself is proven loaded (scripts-off run `complete && naturalWidth > 0`) and visible in the 375 captures. Server: own `python -m http.server 4173 --bind 127.0.0.1`, `curl | cmp` SAME for the three pages and style.css before each run. Port 4173.

## Review contact 1 of 2 — fresh auditor (code-audit phase-gate) — 2026-10-09

Greenlight — PLAN § 37 Done When 1–4 all re-measured by the reviewer and met; copy matches § Rework copy exactly; IA and Venture `#besoin` / `#experience` geometry identical vs an independent render of the base tree. Native checks: `node tools/check.mjs --all` exit 0, `node tools/version.mjs --check` exit 0, `node tools/shell.mjs --check` exit 0, `git diff --check 3b43901` exit 0. Scope: CLEAN (the 2-line CSS rule is the requested conditional focus-ring fix; `?v=` stamps follow from it; « x » → « × » in row 01's question is allowed by the Coder prompt).

Reviewer receipts (scratch under the session scratchpad `reviewer/`, Chrome profiles deleted after the runs):
- Seal: product `git diff --stat 3b43901` = 17 files (Stratégie page 142 lines, style.css +2, 15 pages one `?v=121b633a` → `?v=bedaae81` line each, nothing else); new stamp = sha256(style.css)[:8] = bedaae81; no untracked non-ignored file. Root `git diff HEAD -- PLAN.md` = § 37 status token + evidence pointer only.
- DW1/DW2: eyebrow/pilotage/RÉFLEXION/Agrandir/« Expérience associée< » = 0; « Données d'entrée » 7; `<details class="disclosure"` 7; modifier 1; « Expériences associées » 1; seven visible Livrables lines 1 each; both original-PNG hrefs 1 each.
- Copy: independent parser of the PLAN table vs the page (number, title, subtitle, labels, every Données d'entrée and Livrables `<li>`), 7/7 rows exact; no emoji left in `#besoin`..`#reflexion`; questions = base wording minus emoji (plus « × »).
- DW4: base tree exported (`git archive 3b43901`) and served on 127.0.0.1:4175 for the BEFORE run; working tree on 4173 (curl | cmp SAME for page, style.css, IA, Venture). Both widths: lead `rgba(0, 0, 0, 0)`, no right edge > viewport (closed, row 05 open, row 01 open), real Tab + Enter opens row 01 (:focus-visible), real Tab reaches both diagram links (3px outline, topmost, in viewport), scripts off 7 rows / 5 cards / 2 diagrams visible with images loaded, no request outside localhost/Google Fonts; IA 113/113 and Venture 68/68 elements identical at 1200 and 375. Extra probe: all seven rows open at 375 and 320, no overflow.

Advisory only (Tier 3, no fix section, no further review needed):
- T3-1 `assets/css/style.css:1037` `.band-figure > a` is not keyed on any page hook, inside a block whose header says « sans effet sur les autres pages ». Today it matches only the two Stratégie diagram links (the four other `.band-figure` consumers hold a `button.video-launch` + `figcaption a`, and `video.js` swaps in an iframe, never an `a`). Route with the Pass 38 CSS cleanup if wanted (e.g. `#reflexion .band-figure > a`).
- T3-2 PLAN § 37 « Evidence: PROGRESS Last Verification (Pass 37) » points at a PROGRESS entry that closure has not written yet; it becomes true when the closure step runs.

```json
{
  "token": "fc8f43d4",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "git -C product diff --stat 3b43901 (17 files: Strategie page, style.css +2, 15 style.css ?v= stamp lines only; stamp = sha256 prefix bedaae81)", "result": "PASS"},
    {"cmd": "git -C root diff HEAD -- PLAN.md (section 37 status token + evidence pointer only)", "result": "PASS"},
    {"cmd": "grep -cE 'section__eyebrow|service-pilotage|RÉFLEXION|Agrandir|Expérience associée<' service-strategie-transformation/index.html = 0; Données d'entrée 7; details.disclosure 7; modifier 1; Expériences associées 1", "result": "PASS"},
    {"cmd": "grep -cF each of the seven visible Livrables lines = 1; grep -c href strategy-original.png = 1; transformation-original.png = 1", "result": "PASS"},
    {"cmd": "python -I reviewer/copy_audit.py (PLAN Rework copy table vs 7 page rows: number, title, subtitle, labels, inputs, livrables; no emoji)", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check 3b43901", "result": "PASS"},
    {"cmd": "curl http://127.0.0.1:4173 | cmp working tree (Strategie page, style.css, IA page, Venture page)", "result": "PASS"},
    {"cmd": "node reviewer/render.mjs pre on git archive 3b43901 served at 127.0.0.1:4175 + post on 4173; python -I reviewer/analyze.py (Done When 4 at 1200 and 375, IA and Venture geometry identical)", "result": "PASS"},
    {"cmd": "node reviewer/allopen.mjs (all seven rows open at 375 and 320: no element right edge beyond viewport, no outside request)", "result": "PASS"},
    {"cmd": "grep -rn band-figure across site pages and assets/js (only Strategie has a direct a child; video.js inserts iframe only)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 128,898 tokens, 6 min 20 s (380,434 ms, 43 tool uses), GREEN high
INVOCATION: fresh pass-auditor subagent, launched ~20:30 local, completion notice ~20:36
USAGE BASIS: whole-contact (subagent_tokens from the Agent completion notice)

## CLOSURE
UNIT: p37
DOCS: root PLAN § 37 status Done + evidence pointer (before review); PROGRESS (Current Objective, Done, Open, Next Action, Last Verification, Known minor issues) and CHANGELOG entry after GREEN, in the root closure commit. ARCHITECTURE checked, unchanged (no service-structure line became false). No AGENTS Gotcha added, no PRD/README edit.
MIGRATED: final test evidence, render results, IA/Venture comparison, verdict and review cost → root PROGRESS Last Verification (Pass 37); what shipped → root CHANGELOG.
NITS: reviewer T3-1 (`.band-figure > a` in the P36 block is not keyed on a page hook; today matches only the two Stratégie diagram links; could narrow to `#reflexion .band-figure > a` in Pass 38 cleanup) → root PROGRESS Known minor issues; T3-2 (PLAN evidence pointer names PROGRESS Last Verification Pass 37, written at this closure) resolved by the root closure commit.
COMMIT: 3a26a76 (product work commit, LOCAL ONLY, not pushed)
