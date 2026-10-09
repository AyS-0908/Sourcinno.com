# Pass p30 — Dépliant unique : accueil sans indications d'usage

## STARTUP
- Root Planner inputs saved as cddd4920ad8895edc725b59286c812776edb7abf (8 paths: PLAN, PROGRESS, README, prompts/pass27-coder.md, pass28-coder.md, pass29-coder.md, site-auditor.md deleted, prompts/pass30-coder.md added); root dirt matched the prompt exactly; outputs/ untracked, not staged.
- Product base b73680f0c9898d562fa2f6a0177d8e61e3e9962a (rebuild), clean, 37 ahead of origin/rebuild; no live Pass; `.WIP/` ignored by `.git/info/exclude:7`.
- Models: work = claude-opus-5-5 (session-declared), effort unknown (not exposed). Reviewer: inherited defaults (PROGRESS Model restriction exception); not runtime-verified.
- audit_launch_cap = 2, decisions-only, seal = whole product repository.
- Owner vetoes: none received in the launching message (prompt carried only "Read and execute"); démarche subtitles 2–4 of PLAN § Rework copy ship as written.
- Server: 127.0.0.1:4173 LISTENING pid 44640; `curl -s http://127.0.0.1:4173/<f> | cmp - <f>` identical for index.html, style.css, service-ia-business/index.html; reused.

## SLICE
Size: one turn (~30–40 min). Matches PLAN § 30; no re-slice.
Measured before any write (product b73680f, `node .WIP/pass-loop-p30/evidence/render.mjs <out> <profile> pre`, results `evidence/captures-pre/render-result.json`):
- IA first question row (`/service-ia-business/`, `.service-question-list details`): closed height 57 px (summary 56) at 1200 and 375; summary `display: flex`, `::after` "+". Done When 4 compares against 57 ±2.
- Home expertise cards closed: 212 px each at 1200 (3 + 2 per row, w 355) and 375 (stacked, w 327); summary `min-height: 210px`.
- Démarche number centre minus title centre: −5 px at 1200, +4 px at 375 (number `top: 1rem` vs summary padding 24 / 16 px). Must stay within that range after the edit.
- `grep -c "<li><strong>" index.html` = 4 (#services); démarche has 8 `<li>` (1 + 3 + 2 + 2). `service-question-card` = 18 uses (IA 7, Stratégie 7, Venture 4); no `tools/*.mjs` rule names any class touched.
- Layout choice for "+" beside the title line: the summary of the home modifier becomes a two-column grid (`1fr auto`), children forced to column 1 (title row 1, subtitle row 2), `::after` placed column 2 row 1; service rows keep the base flex row. One base rule set (from `.service-question-card`) + one modifier `.disclosure--card` + one `#experience` min-height line (equal closed heights until Pass 31).
- Démarche body wrapper `div.journey-detail` removed (its rule dies); body is the `ul.bullets` directly, styled by the modifier like the expertise bodies.
Work: PLAN § 30 Work 1–4 exactly.
No MANUAL item: every check runs offline here (headless Chrome on localhost). LIVE-SAFE: no live system touched.

## EXPECTED TESTS
- AUTO-1 PLAN DW1: `grep -c "initExpertise" assets/js/site.js` = 0; the DW1 hint grep over index.html prints nothing.
- AUTO-2 PLAN DW2: `grep -c '<details class="disclosure' index.html` = 9; `grep -rn "expertise-card\|journey-stage\|service-question-card" --include=*.html --include=*.css --include=*.js . | grep -v .WIP` empty; `grep -c 'summary::after { content: "+"' assets/css/style.css` = 1.
- AUTO-3 PLAN DW3: `grep -c "<h2>Démarche</h2>" index.html` = 1; `grep -c "<li><strong>" index.html` = 12; `grep -c` = 1 for each subtitle text 1–4 (without emoji).
- AUTO-4 PLAN DW4, `node .WIP/pass-loop-p30/evidence/render.mjs <out> <profile> post` at 1200 and 375 (motion no-preference): per disclosure (9) hover leaves `open` false; mouse click opens (body visible, `::after` "−") and closes ("+"); real Tab reaches each summary (`:focus-visible` true), Enter opens/closes, Space opens/closes; tap at 375 opens/closes; scripts disabled before navigation: section opacity 1, summary topmost, click opens with body visible and closes; IA first row toggles and closed height 57 ±2; scrollWidth ≤ innerWidth closed and all-open; "+" in grid column 2 row 1 on the home cards; démarche number offset within −5..+4 ±2; captures inspected by eye.
- AUTO-5 PLAN DW5: `node tools/check.mjs --all` exit 0 (final checkpoint); `node tools/version.mjs --check` 0; `node tools/shell.mjs --check` 0; `git diff --check` 0; `git diff --quiet 670f72f HEAD -- .github/` 0; `git diff --stat` = only the declared files, service pages class-only lines.
Changed files vs coverage: index.html (AUTO-1/2/3/4/5), assets/css/style.css (AUTO-2/4/5), assets/js/site.js (AUTO-1/4/5: page runs, nothing opens on hover), service-ia-business/index.html (AUTO-2/4), service-strategie-transformation/index.html and service-venture-building/index.html (AUTO-2 + `--all` structure; class-only diff, same CSS as the IA row rendered in AUTO-4), `?v=` stamps (AUTO-5 version --check). None uncovered.
MANUAL: none for this Pass (all checks driven by the session).

## CHANGED
- index.html `#experience`: hint paragraph deleted; five `details.disclosure.disclosure--card`, summary = h3 + `span.disclosure__subtitle`, ten action spans deleted; bodies unchanged.
- index.html `#demarche`: comment updated; h2 « Démarche »; `approach-layout` wrapper and « Approche & Outils » block deleted; four `details.disclosure.disclosure--card`, subtitles = PLAN § Rework copy literal (read from PLAN.md by the patch script); action spans, `chevron__valid` lines and `journey-detail` wrapper deleted, body `ul.bullets` re-indented as sibling of `<summary>`; 8 items start `<li><strong>title</strong>` (`=&gt;` → ` : `; « Décision » bold whole; per-item ❔ ✨ 🔎 kept).
- assets/css/style.css: component block `.disclosure` (base = former `.service-question-card` rules, one-line `summary::after { content: "+"`) + modifier `.disclosure--card` (border card, grid summary: title/subtitle column 1, "+" column 2 row 1; card bodies; ≤640 px padding 16) + `#experience .disclosure summary { min-height: 210px; }`; deleted dead `#experience .expertise-*`, `#demarche .approach-layout/.journey-*/summary/.chevron .bullets/.chevron__valid/.approche/.tools-*` (+ their 640 lines), `.service-question-card*`. Kept `#demarche .chevrons/.chevron/::before/.chevron__title`, `.experience-panel` grid.
- assets/js/site.js: `initExpertise` (and its comment) and its call deleted; `on()` and dropdown code untouched.
- service-ia-business (7), service-strategie-transformation (7), service-venture-building (4): `service-question-card` → `disclosure`, class only.
- `node tools/version.mjs`: `?v=` on 16 pages (40 refs).
- Patch applied by a byte-preserving script (scratchpad `p30patch.py`, asserted counts); all six files stay LF (`git ls-files --eol`).

## TEST-RESULTS r1
TREE: 621f2f916d179274
CMD: `node tools/check.mjs --all` exit 0 (OK 16 pages, --nojs 10 pages, --a11y 13 pairs / 279 links / 18 buttons, both test PASS lines); `node tools/version.mjs --check` exit 0 (40 refs); `node tools/shell.mjs --check` exit 0; `git diff --check` exit 0; `git diff --quiet 670f72f HEAD -- .github/` exit 0
RESULT: PASS — PLAN DW1: `grep -c initExpertise site.js` 0, hint grep empty (exit 1). DW2: `grep -c '<details class="disclosure' index.html` 9; old-class grep empty (exit 1); `summary::after { content: "+"` 1. DW3: `<h2>Démarche</h2>` 1; `<li><strong>` 12; subtitles 1–4 each 1. `git diff --stat` 18 files +103/−220 (index, style, site.js, 3 service pages 7/7/4 class lines + `?v=`, 12 other pages `?v=` lines only: style.css and, where loaded, site.js); all touched files stay LF.
NOTES: DW4 `node .WIP/pass-loop-p30/evidence/render.mjs .WIP/pass-loop-p30/evidence/captures-r1 <scratch-profile> post` exit 0 on 127.0.0.1:4173 (pid 44640, `curl | cmp` = this tree); results `evidence/captures-r1/render-result.json`, 18 captures inspected by eye.
- 1200 and 375, 9 disclosures each: hover (mouseMoved over the summary) open false 9/9; mouse click open + body visible + `::after` "−", second click closed + "+" 9/9; real Tab (45 presses at 1200, 40 at 375) reaches each summary, `:focus-visible` true 9/9, Enter open/closed and Space open/closed 9/9; tap at 375 (touch emulation) open + body visible / closed 9/9; scripts disabled before navigation: no `.is-visible`, section opacity 1, summary topmost, click opens with body visible + closes 9/9 both widths; scrollWidth ≤ innerWidth closed and all open, both widths.
- "+" placement: home summaries `display: grid`, tracks `<title col> 11px`, `::after` grid column 2 row 1 (title row) on all 9, subtitle below the title; captures show "+" at the right end of the title line at 1200 and 375.
- Closed heights: expertise cards 212 px (= pre) at both widths, three + two per row at 1200; IA first row 57 px closed at both widths (pre 57; ±0), opens (143 / 171 px, "−") and closes back to 57.
- Démarche number centre − title centre: −5 at 1200 (pre −5); +3 at 375 stages 1–3 (pre +4); stage 4 at 375 −9 because « PLANIFICATION & PILOTAGE » now wraps to two lines (the "+" column takes 27 px), the number sits level with the first title line (capture `demarche-closed-375.jpg`).
- Unified look: expertise summary padding at ≤640 px is now 16 px (was 24; démarche's value) — one component, one rule.
- Recipe trap: with `Emulation.setScriptExecutionDisabled`, page timers never fire, so a `Runtime.evaluate` awaiting `setTimeout` hangs (first run killed, pids 39392/51952); no-JS steps now scroll synchronously and wait from Node. → AGENTS Gotchas.

### Review contact 1 of 2 - fresh auditor (code-audit phase-gate) - 2026-10-09
Greenlight - Pass 30 Work 1-4 and Done When 1-5 re-verified on the working tree vs b73680f; no Tier 1/2 finding. Scope: CLEAN (one extra rule `#experience .disclosure summary { min-height: 210px; }` = necessary side work keeping the #experience layout unchanged until Pass 31).
Tier 3 advisory only (no fix section, no further review):
- T3-a `assets/css/style.css:981`: closed expertise cards keep the 210 px summary floor, so ~100 px of empty space now sits under each subtitle (the action line that filled it is gone). Pass 31 reworks this layout.
- T3-b `assets/css/style.css:1000-1003`: the shared card modifier gives the five expertise cards 16 px padding at <=640 px (24 px before) and the démarche bodies a top separator line; small visual unification, not asked for explicitly.
- T3-c root `PLAN.md` § 30 already reads `Status Done` and points to `PROGRESS Last Verification (Pass 30)`, which does not exist yet: write it at closure.

```json
{
  "token": "c991ddf5",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {
      "cmd": "git diff --stat b73680f (18 files +103/-220; every path inside the declared slice; no untracked non-ignored file)",
      "result": "PASS"
    },
    {
      "cmd": "DW1: grep -c initExpertise assets/js/site.js = 0; grep -n 'expertise-hint|expertise-action|journey-action|chevron__valid|tools-|approach-layout|Survol|Voir les|Masquer|Méthodes et validation|Approche &amp; Outils' index.html prints nothing",
      "result": "PASS"
    },
    {
      "cmd": "DW2: grep -c '<details class=\"disclosure' index.html = 9; grep -rn 'expertise-card|journey-stage|service-question-card' --include=*.html --include=*.css --include=*.js . | grep -v .WIP prints nothing; grep -c 'summary::after { content: \"+\"' assets/css/style.css = 1",
      "result": "PASS"
    },
    {
      "cmd": "DW3: grep -c '<h2>Démarche</h2>' index.html = 1; grep -c '<li><strong>' index.html = 12; grep -c = 1 for each of the four § Rework copy subtitles",
      "result": "PASS"
    },
    {
      "cmd": "node tools/check.mjs --all (exit 0, 16 pages, both test PASS lines)",
      "result": "PASS"
    },
    {
      "cmd": "node tools/version.mjs --check (exit 0, 40 references on 16 pages)",
      "result": "PASS"
    },
    {
      "cmd": "git diff --check; git diff --check b73680f; git diff --quiet 670f72f HEAD -- .github/ (all exit 0)",
      "result": "PASS"
    },
    {
      "cmd": "curl 127.0.0.1:4173 index.html, service-ia-business/, style.css, site.js | cmp against the working tree (identical)",
      "result": "PASS"
    },
    {
      "cmd": "node render.mjs <scratch> <profile> post (copy of .WIP/pass-loop-p30/evidence/render.mjs, run from auditor scratchpad): 1200 and 375, 9/9 click, 9/9 real Tab + Enter/Space with :focus-visible, 9/9 tap at 375, hover leaves open false, ::after + / −, 9/9 no-JS toggle with body visible, no horizontal overflow, IA row 57 px closed",
      "result": "PASS"
    },
    {
      "cmd": "git -c core.autocrlf=false archive b73680f served on 127.0.0.1:4191; node render.mjs <scratch> <profile> pre: IA first row closed height 57 px at 1200 and 375 = post 57 px",
      "result": "PASS"
    },
    {
      "cmd": "git diff b73680f -- service-*/index.html normalised (class rename + ?v= stamps): 0 residual lines on the three service pages",
      "result": "PASS"
    },
    {
      "cmd": "git -C docs-root diff PLAN.md AGENTS.md: PLAN § 30 only status token + Evidence line, Work and Done When unchanged; AGENTS one new Gotcha",
      "result": "PASS"
    },
    {
      "cmd": "node timer.mjs (CDP): awaited setTimeout fires with scripts enabled, hangs > 5 s with Emulation.setScriptExecutionDisabled (AGENTS Gotcha confirmed)",
      "result": "PASS"
    }
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 126466 tokens, 7 min 12 s, GREEN
INVOCATION: pass-auditor subagent (id kept in the session only) | USAGE BASIS: whole-contact (Agent completion notice: 126466 subagent tokens, 40 tool uses, 432341 ms)
Verdict imported by `status.py verdict`: GREEN, state close, 1 of 2 contacts reserved. Auditor scratch outside the tree: its scratchpad `p30audit/` and `/tmp/chk.txt` (check.mjs output), nothing in the product tree.

## CLOSURE
UNIT: p30
DOCS: root PLAN § 30 status Done + evidence pointer (before review); AGENTS Gotchas + scripts-disabled timers trap (before review); PROGRESS Current Objective/Done/Open/Next Action/Last Verification/Known minor issues and one CHANGELOG entry (after the verdict). No PRD/README/ARCHITECTURE edit.
MIGRATED: final native results, rendered measurements, verdict and contact cost -> PROGRESS Last Verification (Pass 30); summary -> CHANGELOG 2026-10-09.
NITS: reviewer Tier 3 (T3-a empty space under closed expertise subtitles from the kept 210 px floor; T3-b ≤640 px expertise padding 16 px and démarche body separator from the shared card modifier; T3-c PLAN pointer ahead of PROGRESS, resolved by this closure) -> PROGRESS Known minor issues (P30 reviewer observations), T3-a/T3-b for Pass 31.
COMMIT: 4ffab4f2915bc2d0ff12a14fa76c0055d95f6128 (product work, LOCAL ONLY, not pushed)
