# Pass 56 — Livrables : aperçu au survol (Stratégie et Entreprise IA)

Contract: root PLAN § 56 (Goal, Probes 1–7, Planner decisions 1–4, Work 1–4, Done When 1–7) and root `prompts/pass56-coder.md` (root fb52521, Planner inputs). Product `rebuild`, Pass base cb0bfbf8637fe351bf202b5a9e0b06ae50674312 (read back from `state.json` right after the first `set`). LOCAL ONLY.

MODEL NOTE: work = the session's model, declared `claude-opus-5-5` by the runtime prompt, effort not exposed (unknown). Reviewer: `pass-auditor` subagent, inherited settings (no model or effort control used; PROGRESS Model restriction exception). Nothing runtime-verified beyond the declared model id.

Ground check (PROGRESS only, before anything else): Pass 55 closed with Planner CHECK, no owed human test (MANUAL-V12 is the owner's single overall review after Passes 56, 61, 59, 60), no open defect. Ground clear.

Pre-flight 2026-10-13 13:45 (root cwd), all as the Planner measured: root a6084a3 with the exact expected dirt, product cb0bfbf clean on `rebuild`, `plan.py guard` exit 0, `check-ignore` → `.git/info/exclude:7:/.WIP/`, state dir absent, port 4173 listening (process 61824, every interface, left by an earlier session: REUSED for the tree), port 4174 free (used, bound to 127.0.0.1, for scratch copies). Planner inputs saved: root fb525217117dc221c9dbada17c9ad23e83aafb7d (4 M, 1 A, 1 D, nothing under `outputs/`).

## SLICE

One slice, not split: both pages or none (PLAN § 56). Measured at plan: the product change is small (one function in `assets/js/site.js`, one CSS block, six markup edits on two pages); the bulk is the proof script (five no-hover cases × two pages against a cb0bfbf baseline, hover mode at three widths both motion ways, contrast and focus ring from pixels, red and mutation runs). Size reality said plainly: about 90 active minutes expected against the 45 planned; it cannot be cut into a smaller whole state (a page without its proofs is not one), so the Pass continues and the overrun goes to the report.

Work order (tests before code):
1. `evidence/cdp.mjs` (P51 helper + touch option + `Runtime.exceptionThrown`), `evidence/render.mjs` (Done When 2–5); a scratch copy of cb0bfbf served on 4174 gives the red run and `baseline.json`.
2. `assets/js/site.js` `initHoverList()` (mock.js in the site idiom, no `tabs` branch, rows = `.hl__items > li > details` only, no entrance animation replayed by a resize).
3. `assets/css/style.css`: the `cartes-A` rules that have a user on these two pages; the list grid applies in hover mode only (decision 1).
4. Markup on the two pages (classes, `data-hoverlist`, empty `div.hl__detail aria-live="polite"`); `node tools/version.mjs`.
5. Docs before the review: PLAN § 56 status token + evidence pointer, ARCHITECTURE, PROGRESS, CHANGELOG.

No MANUAL item in this Pass: owner decision 2026-10-13 (PLAN § V1.2 MANUAL-V12), he approved the behaviour on the mockup and reviews everything once after Passes 56, 61, 59 and 60. Acceptance order: AUTO checks, one full audit, close. No live system is touched (no LIVE-SAFE clause applies): everything runs on 127.0.0.1.

Plan question 4, changed files against what executes them: `assets/js/site.js` → no `tools/` test runs it; `render.mjs` executes it in Chrome on the ten shell pages. `assets/css/style.css` → `check.mjs` (census both ways, declared colours) + `render.mjs` (rendered). Two service pages → `check.mjs` + `render.mjs`. `?v=` lines on the other pages → `version.mjs --check`. Docs → read by the reviewer.

## EXPECTED TESTS

- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check` — expect: exit 0 each; `git diff --stat cb0bfbf -- . ':(exclude).WIP'` holds only `site.js`, `style.css`, the two service pages and `?v=` lines elsewhere.
- AUTO-2 `node .WIP/pass-loop-p56/evidence/render.mjs` on the tree (4173) — expect: 0 failing check. Hover mode at 1920, 1200, 961 px on both pages, reduced motion off then on: first row active on load; mouse on each of the 7 + 3 rows shows that row's own detail in the viewport, top within 1 px of the list's top; no box of the page changes from one row to the next; a real Tab reaches each row, focus ring measured from pixels, Enter keeps the detail; no right edge past the layout width; every text of the active row and of the detail at 4.5:1 or more against the pixels behind it.
- AUTO-3 same run, no hover mode at 960 px fine pointer, 1200 px touch (`(hover: none)` printed), 375 px, 1200 and 375 px scripts off — expect: every row opens and closes by click or tap and by Enter; `#besoin` boxes, rows closed then first row open, equal the cb0bfbf baseline.
- AUTO-4 same run, 1200 and 375 px — expect: everything outside `#besoin` on the two pages keeps its box (elements after `#besoin` compared relative to its bottom edge: in hover mode the section's own height changes); the eight other shell pages keep their section heights; no script error on the ten.
- AUTO-5 same run, `prefers-reduced-motion: reduce` — expect: no animation or transition over 50 ms in `#besoin` right after a hover (and at least one under no-preference: the probe can see them).
- AUTO-6 the render can fail — expect: on the scratch copy of cb0bfbf (`git -c core.autocrlf=false archive cb0bfbf`) it reports no hover mode at 1200 px; on a mutated copy of the tree without `--hl-min` it reports a block that moves.
- AUTO-7 once, outside the Done When list — expect, printed: a row opened at 960 px then widened to 1200 px (hover mode, no row open, no overflow) and back; first screen at 1280×600 without scrolling (opacity of the `#besoin` heading and its ancestors) against cb0bfbf; computed styles of the mocked Stratégie block against the port at 1920, 1200, 961 px, pseudo-elements included, every difference listed.

## CHANGED

Product, against cb0bfbf (`git diff --stat cb0bfbf -- . ':(exclude).WIP'`: 18 files, 128 insertions, 32 deletions):
- `assets/js/site.js` (+66): `initHoverList()`, called from `init()`. `previews/v12/mock.js` in the site idiom, no `tabs` branch. Four differences from the mock script, all declared: rows are `.hl__items > li > details` of the block (not every `details` under it); the reserve is the detail's fractional height rounded UP (`Math.ceil(getBoundingClientRect().height)`; the mock's `offsetHeight` rounds 481.2 to 481 and row 02 of Stratégie then moved 117 boxes by 0.2 px, measured on the first render try); `reserve()` drops `.is-swap` before refilling, so a resize or the font load never replays the entrance animation; leaving hover mode also removes `--hl-min`.
- `assets/css/style.css` (+27): block « P56 — Liste à aperçu », after `.service-rollout__extras`. The `cartes-A` rules with a user on these two pages; `display: grid` of the list moved into the `.hl.is-hover > .hl__items` rule (decision 1).
- `service-strategie-transformation/index.html` (two cards) and `service-ia-business/index.html` (phase 1 card): `hl` + `data-hoverlist` on the card, `hl__items` on its `<ol>` (`start` kept), one empty `<div class="hl__detail" aria-live="polite"></div>` after it. `git diff cb0bfbf --word-diff=porcelain` on the two pages: only these tokens and the two `?v=` stamps, no content word.
- `?v=` stamps (`node tools/version.mjs`): the 14 other pages, 1 or 2 lines each.

`cartes-A` rules NOT ported (no user on these pages; Pass 61 brings them with the home tabs): the unconditional `.hl__items { display: grid; gap: var(--space-3); }` (`previews/v12/index.html:87`), `.hl.is-hover .disclosure--card summary` (:92), the `h3` half of `.hl.is-hover .is-active h3, … strong` (:95), `.hl.is-hover > .hl__detail .bullets` (:99).

Root docs (before the review): PLAN § 56 status token and evidence pointer; ARCHITECTURE (`site.js` clause; Layering rule 5 « no content depends on hover »).

Servers, said as asked: the 4173 server found by the Planner was gone when the work resumed (20:52); restarted from the product with `python -m http.server 4173 --bind 127.0.0.1`. 4174 (127.0.0.1) serves the scratch copy of cb0bfbf (`git -c core.autocrlf=false archive cb0bfbf`, without `.WIP`, plus the approved mockup of root `previews/v12/` copied under `.WIP/mockup-v12/`); 4175 (127.0.0.1, free when checked) serves the mutated copy of the tree. All scratch under the session scratchpad `p56/`.

## TEST-RESULTS r1
TREE: 5a9fb66f2cb48405
CMD: `node tools/check.mjs --all` · `node tools/version.mjs --check` · `node tools/shell.mjs --check` · `node .WIP/pass-loop-p56/evidence/render.mjs` (env `P48_PROFILES` = scratchpad folder; tree on 127.0.0.1:4173)
RESULT: PASS — check.mjs exit 0 (« OK — aucun probleme sur 16 page(s) », the three executed tests PASS, census 135 HTML classes / 158 with a rule / 0 without use, no new exception); version.mjs exit 0 (43 references on 16 pages); shell.mjs exit 0 (10 pages, 6 stubs skipped); render.mjs exit 0, « 515 checks, failing 0 » (`evidence/render.txt`, identical to the run's output).
NOTES: seal read before and after the four commands, same value. `git diff --stat cb0bfbf -- . ':(exclude).WIP'` = 18 files (site.js +66, style.css +27, the two service pages, `?v=` lines on the 14 others); `git diff --check` exit 0. Red run (same script, scratch copy of cb0bfbf on 4174, `P56_BASELINE=write`): exit 1, « 121 checks, failing 16 » = 12 × « hover mode on 0 list(s) » (both pages, 1920/1200/961, both motion ways) + 4 lines of the widen case; it wrote `baseline.json` (20 « besoin », 4 « outside », 16 « sections » lists, 10 first screens); its 105 other checks pass on cb0bfbf (every row opens and closes by click, tap and Enter there too). Mutation run (copy of the tree without the `--hl-min` line of site.js, on 4175, `P56_PART=hover`, says PARTIAL): exit 1, « 372 checks, failing 36 », all 36 « boxes changed since load » (Stratégie rows 02, 06, 07 at 1920 and 1200, rows 02 to 07 at 961; Entreprise IA rows 02 and 03–04 at the three widths; e.g. section 1422.8 → 1480.4). Files: `evidence/render-red-cb0bfbf.txt`, `evidence/render-mutation-no-reserve.txt`. The state dir is ignored by git: the seal does not cover `evidence/`.

## MEASURES r1 (from `evidence/render.txt`; the reviewer re-measures on its own)

Layout width against window width (Done When 2): innerWidth 1920 → clientWidth 1905; 1200 → 1185; 961 → 946; 960 → 945; 375 → 375. Right edges are compared with clientWidth: 0 element past it in the 22 loads.
Media read in the page: 1920/1200/961 fine pointer true; 960 fine pointer true, « 961 px and more » false; 1200 touch: fine pointer false, `(hover: none)` TRUE, « 961 px and more » true; 375: `(hover: none)` true.

Hover mode, 12 loads (2 pages × 1920, 1200, 961 × reduced motion off/on), 60 row states:
- on load the first row of each list is active alone and its detail shows, top 0 px from the list's top, first line 44 px under the panel edge (24 padding + the question block's own 16 + its border and half-leading), no entrance animation;
- mouse on each row: its own detail (text equal to the row's own content), in the viewport and topmost, top 0 px from the list's top, inside its card; boxes changed since load: 0 of 159 (Stratégie) and 0 of 148 (Entreprise IA) on all 60;
- keyboard: 7 real Tab from the first header link to row 01, then 1 Tab per row; `:focus-visible` true; Enter keeps the detail and never opens the row; focus ring 2928 to 3792 pixels, median 5.08:1 against the same pixels without the ring, on all 60;
- a mouse click on a row never opens it; on Entreprise IA the phase 2 dépliant « Données d'entrée » opens and closes by click (6 loads) and is not a row.

| list | width | list height = reserve | first detail |
|---|---|---|---|
| Stratégie 1 | 1920, 1200 | 482 px | 561.8 × 423.1 |
| Stratégie 2 | 1920, 1200 | 396 px | 561.8 × 384.5 |
| Stratégie 1 | 961 | 535 px | 445.1 × 527.8 |
| Stratégie 2 | 961 | 396 px | 445.1 × 384.5 |
| Entreprise IA | 1920, 1200 | 554 px | 561.8 × 358.6 |
| Entreprise IA | 961 | 659 px | 445.1 × 358.6 |

Contrast, text made transparent, worst pixel inside each text's own line boxes (lowest of the 12 loads; 6 for `em`, Stratégie only):

| text (computed colour) | lowest | worst pixel behind | fewest painted pixels in one piece |
|---|---|---|---|
| active row, title `strong` rgb(255, 255, 255) | 12.14:1 | rgb(26,54,93) | 659 |
| active row, subtitle rgba(255, 255, 255, 0.86) | 9.41:1 | rgb(26,54,93) | 827 |
| active row, number rgb(159, 227, 224) | 8.41:1 | rgb(26,54,93) | 100 |
| detail, question `p.service-question` rgb(74, 85, 104) | 7.53:1 | rgb(255,255,255) | 500 |
| detail, `em` in the question rgb(74, 85, 104) | 7.53:1 | rgb(255,255,255) | 195 |
| detail, label `p.service-detail__label` rgb(74, 85, 104) | 7.07:1 | rgb(245,248,252) | 289 |
| detail, list items rgb(26, 54, 93) | 11.40:1 | rgb(245,248,252) | 170 |

Reduced motion (Done When 5): animations or transitions over 50 ms in `#besoin` right after each mouse move: 0 on the 6 reduced loads; the same probe sees 8 at most (Stratégie) and 4 at most (Entreprise IA) on the 6 others.
No hover mode (Done When 3), 10 loads: `#besoin` boxes, rows closed then first row open, = cb0bfbf on all 20 comparisons; every row opens (text visible) and closes by click or tap and by real Tab then Enter: 7 of 7 and 3 of 3 in the five cases.
Done When 4: everything outside `#besoin` = cb0bfbf on the two pages at 1200 and 375 (4 comparisons); section heights of the eight other shell pages = cb0bfbf at 1200 and 375 (16); script errors 0 on every load with scripts on (40 lines), the ten shell pages included.
Once, outside the Done When list: row 2 opened at 960, widened to 1200: hover mode on every list, 0 row left open, reserve set, no entrance animation replayed, 0 element past the layout width; back to 960: no hover mode, panels emptied and hidden, reserve removed, boxes = cb0bfbf.

Captures kept (Done When 7), all four with the heading font Inter, taken inside the viewport: `besoin-strategie-1200-hover.jpg` 1185×1489 (rows 01 and 06 active), `besoin-ia-1200-hover.jpg` 1185×1518 (row 02 active), `besoin-strategie-375-open.jpg` 375×1857 (row 02 open), `besoin-ia-375-open.jpg` 375×2616 (row 02 open). Looked at, with the 1920 and 961 ones (scratchpad, not kept).

## DECLARED TO THE REVIEWER (differences, limits, what was never proven)

1. Mockup against port (`evidence/mock-compare.txt`, the approved page of root `previews/v12/` running on cb0bfbf, against the tree): the `.service-phases` block of Stratégie, 504 elements and pseudo-elements × 449 computed properties, at 1920, 1200 and 961 px: 503 identical; ONE difference, the list's `min-block-size` (mock 481 px, port 482 px at 1920 and 1200; 534 against 535 at 961) = the reserve rounded up, which makes list 1 and its card 1 px taller than on the mockup page. No other computed-style difference, `summary::after` included.
2. First screen (`evidence/first-screen.txt`, 1280 px wide, loaded without scrolling): `#besoin` is a `.reveal` section and is taller in hover mode (Stratégie 796 → 1493 px, Entreprise IA 969 → 1521 px), so it needs more pixels on screen before it fades in (8 % of its height). Window 620 to about 679 px high on Stratégie, 640 to about 679 on Entreprise IA: the section title is on the first screen but hidden until the first scroll, where cb0bfbf showed it (at 600 and less it is hidden on both; from 680 shown on both). Not fixed in this Pass (the plan lists it as a case to read, not a criterion): the way back is to take `reveal` off the two `#besoin` sections, as Pass 53 did on Publications, at the price of their fade-in everywhere.
3. Entreprise IA in hover mode (never mocked), looked at on the captures at 1200 and 961 px: phase 2 sits full width under phase 1, its three « Niveau » blocks in three wide columns; the list of phase 1 holds three rows for a reserve of 554 px (659 at 961), so about 185 px (1200) to 250 px (961) of empty card under the third row; row « 03–04 » starts its title further right than 01 and 02 (wider number, as on cb0bfbf); at 961 the question of row 02 ends with a lone « ? » on its own line. Nothing overlaps or is cut.
4. Never proven by anyone: a screen reader (a row's summary still announces a closed dépliant while its text shows in the `aria-live="polite"` panel, and the panel is rewritten on every row change and on every resize); a device with both touch and mouse; any browser but Chrome (`:has()` missing = two squeezed columns in hover mode, no fallback, same reliance as the Pass 58 table; a `MediaQueryList` without `addEventListener` = no hover mode); the browser's find-in-page opening a row in hover mode (the row then shows its text in place too, and a click cannot close it).
5. Cost of the reserve: on every `resize` event and once the fonts are loaded, each list is filled once per row to measure it (7 copies on Stratégie, 3 on Entreprise IA), with no throttle; nothing runs outside hover mode.

## REVIEW — contact 1 of 2 (fresh auditor, code-audit phase-gate, 2026-10-13)

Own probes, written for this review (session scratchpad `p56-reviewer/`: `lib.mjs`, `rv-hover.mjs`, `rv-nohover.mjs`, `rv-pages.mjs`, `rv-misc.mjs`, `rv-anchor.mjs`; the Coder's `cdp.mjs` used as Chrome launcher only, `render.mjs` not re-run). Tree = 4173, cb0bfbf = 4174, no-reserve mutation = 4175. Inter loaded on every load read.

Stakes, as measured:
1. No mouse-only text — PASS. Hover mode (1920, 1200, 961, plus 1024, 1366, 1600): a real Tab reaches every row (7, then 3), `:focus-visible`, ring `solid 3px rgb(36, 122, 120)` offset 3px, the row's own detail in the panel, Enter keeps it, Shift+Tab goes back; click shows the detail and never opens the row. No hover mode at 960 fine pointer, 1200 touch (`(hover: none)` true), 375, 1200 and 375 scripts off: every row (7; 3 + « Données d'entrée ») opens and closes by click or tap and by Enter.
2. Nothing moves — PASS. Every element box of the whole page (268 Stratégie, 217 Entreprise IA; panel height left out, its left/top/width kept) identical from one row to the next by mouse, Tab, Enter and click, at the six widths; document height and scroll unchanged. Red controls: same probe on 4175 reports moved blocks (16 FAIL), on 4174 « no hover mode » (2 FAIL).
3. Outside hover mode = cb0bfbf — PASS. Five cases × two pages: whole page box for box (266 and 216 boxes), rows closed then first row of each list open; computed style of every element and pseudo-element of `#besoin` identical (190 and 118 × 523 properties, names sorted, custom properties apart). 1200 → 900 → 1200 by resize: equals a fresh load each way, reserve recomputed (482px,396px / 554px).
4. Other pages — PASS. Ten shell pages at 1200 and 375: eight box for box, the two service pages box for box at 375 and, at 1200, everything outside `#besoin` in place relative to its section; no script error, no request outside 127.0.0.1 and Google Fonts. Deep links `#besoin`, `#experience`, `#reflexion` land as on cb0bfbf.
5. Active row on screen — PASS. Rendered colours against the composited background: row number and chevron 8.41:1, title 12.14:1, subtitle 9.41:1; detail 7.07:1 at least. Looked at on in-viewport captures (mouse on row 2, Tab on row 3: ring visible outside the navy row).
6. Reduced motion — PASS. `reduce`: longest animation or transition in `#besoin` 0.01 ms (mouse and keyboard); control without it sees `hl-in` 320 ms and the 200 ms transitions.
7. No rule without a user — PASS. Each of the 19 ported selectors matches at least one element on each page in hover mode; the four mockup rules without a user here (`.hl__items` unconditional, `.disclosure--card summary`, `.is-active h3`, `.hl__detail .bullets`) were left out.

Declared items 1-5: 1 confirmed (port = approved mockup, every box within 1 px; the round-up is accepted). 2 confirmed and NOT accepted: A-001 below. 3 seen on the captures, nothing overlaps or is cut: accepted. 4 and 5: advisory, below.

Advisory, Tier 3 — no action asked in this Pass, nothing here needs another review:
- Find-in-page can open a row in hover mode and a click cannot close it (declared 4). DEFERRED_WITH_REASON: edge case, no text lost.
- The `aria-live` panel is rewritten when the fonts are ready and on every resize; no screen reader was ever run (declared 4).
- A straight pointer path from a lower row to the top of the detail crosses the rows above and changes the detail (measured: row 3 ends on row 2); leaving the row sideways keeps it. Same on the approved mockup: a point for the owner's MANUAL-V12, not a port defect.
- Reserve recomputed on every resize event, no throttle (declared 5): measured, no scroll jump at the bottom of the page nor on list 2.
- No fallback without `:has()` (declared 4).

## Audit fixes to implement — 2026-10-13
BLOCKING_STATUS: NON_BLOCKING
READINESS: READY_WITH_FIXES
REASON: every Done When check passes, but in hover mode the taller `#besoin` section stays blank on the first screen of common laptop windows where cb0bfbf shows its title.
NATIVE CHECKS: `node tools/check.mjs --all` PASS — « OK — aucun probleme sur 16 page(s) », 3 executed tests PASS
NATIVE CHECKS: `node tools/version.mjs --check` PASS — 43 reference(s) a jour
NATIVE CHECKS: `node tools/shell.mjs --check` PASS — 10 page(s) conformes
NATIVE CHECKS: `git diff --stat cb0bfbf -- . ':(exclude).WIP'` PASS — 18 files: site.js, style.css, the two service pages, 14 pages with `?v=` lines only
SCOPE: CLEAN
COVERAGE: 18/18 changed files read — skipped: none

### A-001 | Tier 2 | MEDIUM | `service-strategie-transformation/index.html:78` · `service-ia-business/index.html:78`
- issue: `#besoin` is a `.reveal` section that hover mode makes 1493 and 1521 px high (796 and 969 on cb0bfbf), so loaded without scrolling its title sits on the first screen at opacity 0 until a 20 to 60 px scroll where cb0bfbf shows it — measured at 1366×657, 1280×649 and 1024×640 on both pages and at 1366×625 on Stratégie (AGENTS Gotcha « A tall `.reveal` block can stay blank on the first screen… Keep `.reveal` on short units », a review FIX in Pass 53).
- fix: in hover mode the section must show on the first screen wherever cb0bfbf shows it — for instance the hover list marks its enclosing `.reveal` section shown when the mode turns on, or `reveal` leaves the two `#besoin` sections as Pass 53 did — with nothing else changed outside hover mode.
- test: `node .WIP/pass-loop-p56/evidence/first-screen.mjs` prints no « differs » line, and the same reading at 1366×657, 1366×625 and 1024×640 gives the title and its ancestors opacity 1 wherever cb0bfbf does; then `node .WIP/pass-loop-p56/evidence/render.mjs` 0 failing and `node tools/check.mjs --all`, `node tools/version.mjs --check` exit 0.

```json
{
  "token": "95e3cc1a",
  "verdict": "FIX",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --stat cb0bfbf -- . ':(exclude).WIP' (18 files, 14 pages with ?v= lines only)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-hover.mjs (tree 4173; 1920, 1200, 961; mouse, real Tab, Enter, click, contrast, reduced motion, rule users; 318 checks)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-hover.mjs http://127.0.0.1:4173 1024,1366,1600 (318 checks)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-hover.mjs http://127.0.0.1:4175 1200 (red control: reports moved blocks, exit 1 as expected)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-hover.mjs http://127.0.0.1:4174 1200 (red control: reports no hover mode, exit 1 as expected)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-nohover.mjs (960 fine, 1200 touch, 375, 1200 and 375 scripts off against cb0bfbf; 104 checks)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-pages.mjs (ten shell pages at 1200 and 375 against cb0bfbf, script errors; 100 checks)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-anchor.mjs (deep links below #besoin against cb0bfbf)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-misc.mjs all: resize switch, pointer onto the detail, mockup against port (17 checks)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-misc.mjs all: first screen without scrolling against cb0bfbf (7 of 16 sizes hide the #besoin title where cb0bfbf shows it)", "result": "FAIL"}
  ],
  "opened_fix_section": true
}
```

AUDIT r1 COST: 269,334 tokens, 37 min 38 s, FIX (one Tier 2 finding, A-001; every other stake PASS on the reviewer's own probes)
INVOCATION: the `pass-auditor` subagent started from this session (one Agent call, completed)
USAGE BASIS: whole-contact, from the Agent completion notice of this session (subagent_tokens, duration_ms, 62 tool uses)

## FIX r1 — A-001 (the only finding)

`assets/js/site.js`, `apply()` of `initHoverList()`: when hover mode turns on, the block's enclosing `.reveal` section gets `.is-visible` (the reviewer's first proposed route: 2 lines of code + 3 of comment). Nothing changes outside hover mode: the two lines sit inside `if (mq.matches)`; `reveal` stays on both sections. Effect in hover mode: the section fades in on load instead of on scroll, wherever it is — also on windows 600 px high and less, where cb0bfbf itself kept the title hidden until a scroll. `node tools/version.mjs` restamped the `?v=` of `site.js` on the 10 shell pages. Root ARCHITECTURE Layering rule 5: one sentence added. `evidence/first-screen.mjs` now also reads the reviewer's four sizes and five windows outside hover mode, and exits 1 on a bad line; the « differs » mark is kept for « hidden where cb0bfbf shows it » only.

## TEST-RESULTS r2
TREE: e9c8f831a3bdc155
CMD: `node .WIP/pass-loop-p56/evidence/first-screen.mjs` · `node .WIP/pass-loop-p56/evidence/render.mjs` · `node tools/check.mjs --all` · `node tools/version.mjs --check` · `node tools/shell.mjs --check`
RESULT: PASS — first-screen.mjs exit 0, « 24 readings in hover mode and 10 outside it; title hidden where cb0bfbf shows it, or a difference outside hover mode: 0 »; render.mjs exit 0, « 515 checks, failing 0 »; check.mjs exit 0 (« OK — aucun probleme sur 16 page(s) », census 0 class without use); version.mjs exit 0 (43 references on 16 pages); shell.mjs exit 0.
NOTES: seal read before and after, same value; it differs from r1 (5a9fb66f2cb48405) by this fix alone. A-001 test, as written by the reviewer: no « differs » line in `evidence/first-screen.txt`; at 1366×657, 1366×625, 1280×649 and 1024×640 the title and its ancestors are at opacity 1 on both pages (on Entreprise IA at 1366×625 cb0bfbf itself hides it: shown here). In hover mode the title is now shown at every size read, 1280×580 and 600 included. Outside hover mode (960×600 and 960×640 fine pointer, 1280×600 and 1280×640 touch, 375×667): same reading as cb0bfbf on both pages, hidden where it hides, shown where it shows. Every r1 measure of `## MEASURES r1` re-read on `evidence/render.txt` of this round: same values (boxes changed 0 of 159 / 0 of 148 on the 60 row states, reserves 482/396/535/396/554/659 px, lowest contrast 7.07:1, focus ring median 5.08:1, 20 + 4 + 16 comparisons = cb0bfbf, script errors 0). Mutation run redone on a copy rebuilt from this tree (4175): exit 1, « 372 checks, failing 36 », all « boxes changed since load ». First full-render start of this round died at launch (« chrome timeout »: two Chrome started in the same millisecond share one profile folder name); rerun alone, the result above. `git diff --stat cb0bfbf -- . ':(exclude).WIP'`: 18 files, 133 insertions, 32 deletions (site.js +71).

## REVIEW — contact 2 of 2 (same auditor, delta confirmation of A-001 only, 2026-10-13)

Delta, proven by bytes: `assets/js/site.js` minus the 5 added lines of `apply()` (3 of comment, `const section = root.closest(".reveal"); if (section) section.classList.add("is-visible");`, inside `if (mq.matches)`) hashes to the blob reviewed in contact 1 (528dbb4); the two service pages with the former `site.js?v=` stamp hash to their contact-1 blobs (b9306d9, e201261); `style.css` is the same blob (0efe5af); the 14 other pages differ from cb0bfbf by their stamp lines only. `git diff --stat cb0bfbf`: 18 files, 133 insertions, 32 deletions, as the brief measured. Root `ARCHITECTURE.md` Layering rule 5: the added sentence says what the code does.

A-001 — fixed. The reviewer check that failed in contact 1 now passes at its 16 readings (8 window sizes on each page; the 7 that hid the title show it at opacity 1, no scroll); the Coder's `first-screen.mjs`, run as a byte-identical copy from the reviewer's scratch folder so that nothing is written in the product: exit 0, 34 readings, no « differs » line. In hover mode the title also shows where cb0bfbf itself hid it (1280×609 on both pages, Entreprise IA 1366×625): accepted, it only shows content sooner.

Nothing else changed outside hover mode: 12 reviewer readings without scrolling (960×600 and 960×680 fine pointer, 1280×620 and 1280×720 touch, 375×667, 375×812) give the same title state as cb0bfbf, hidden where it hides (960×600 on both pages, Entreprise IA 1280×620 touch), shown where it shows.

Affected paths: `render.mjs` re-run with `P56_PART=hover,plain,outside,extra,others` (every part but the one that writes the four captures): 511 checks, failing 0; reviewer hover probe at 1200 and 961 (mouse, real Tab, Enter, click, nothing moves, contrast, reduced motion, rule users): 214 checks pass; resize 1200 → 900 → 1200: equals a fresh load each way, no script error. Native suite exit 0. Evidence folder listing identical before and after the reviewer's runs.

Not re-run, cleared in contact 1 and untouched by this delta: the outside-hover box and computed-style comparison, the ten-page comparison, the red controls. The Tier 3 advisory lines of contact 1 stand unchanged; none needs action in this Pass.

```json
{
  "token": "084ba9b2",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "git hash-object: site.js minus the 5 added lines = contact-1 blob 528dbb4; the two service pages with the former site.js stamp = b9306d9 and e201261; style.css = 0efe5af", "result": "PASS"},
    {"cmd": "git diff --stat cb0bfbf -- . ':(exclude).WIP' (18 files, 133 insertions, 32 deletions; other pages: stamp lines only)", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "node first-screen.mjs (byte-identical copy of .WIP/pass-loop-p56/evidence/first-screen.mjs run from the reviewer scratch folder: exit 0, 34 readings, no differs line)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-misc.mjs first (the check that failed in contact 1: 16 of 16 readings show the #besoin title wherever cb0bfbf shows it)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-misc.mjs firstplain (12 first-screen readings outside hover mode = cb0bfbf)", "result": "PASS"},
    {"cmd": "P56_PART=hover,plain,outside,extra,others node .WIP/pass-loop-p56/evidence/render.mjs (511 checks, failing 0; the capture-writing part left out)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-hover.mjs http://127.0.0.1:4173 1200,961 (214 checks)", "result": "PASS"},
    {"cmd": "node p56-reviewer/rv-misc.mjs switch (resize 1200 to 900 to 1200, 10 checks)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: 313,464 tokens on the completion notice (basis unknown, probably cumulative with contact 1: + 44,130 for this contact), 17 min 53 s, GREEN
INVOCATION: the same `pass-auditor` subagent, resumed by a message naming the brief file (15 tool uses in this contact)
USAGE BASIS: unknown (the notice does not say incremental or cumulative), source = the Agent completion notice of this session

Final checkpoint after the verdict, on product commit 01098c9 (content seal still e9c8f831a3bdc155, the briefed and GREEN one): `node tools/check.mjs --all` exit 0, `node tools/version.mjs --check` exit 0, `node tools/shell.mjs --check` exit 0, `git diff --check cb0bfbf 01098c9 -- . ':(exclude).WIP'` exit 0.

SIZE REALITY: about 100 active minutes against 45 planned (the proof script; two full render rounds of about 8 minutes each; one lost round, see below), plus about 55 minutes waiting for the reviewer. Session stopped once, about 14:10, on the peak-hours question of the owner's hook; resumed 20:51 on his « continuer maintenant ». Review contacts: 2 of 2 (FIX, then GREEN by the same reviewer).

Tool and loop notes, named as such: (1) `Page.captureScreenshot` with a `clip` and no `captureBeyondViewport` reads the clip in DOCUMENT coordinates: boxes read in viewport coordinates need the scroll offsets added (first try: every contrast measured the wrong pixels, « painted » 0 caught it). (2) Two Chrome started in the same millisecond by `cdp.mjs` share one profile folder name (`chrome-` + `Date.now()`) and the second dies with « chrome timeout »: start parallel runs apart. (3) A shell line `A=… && (… ) & B` backgrounds the whole `&&` chain: the variable was unset in the foreground part and a full render never started (10 minutes lost). (4) The generated brief forbids reading this journal while the scope pointed the reviewer to one of its sections: the scope repeated the five items in short, which was enough.

## CLOSURE
UNIT: p56
DOCS: root PLAN section 56 status token Done and evidence pointer (before the review); root ARCHITECTURE: `site.js` clause and Layering rule 5 (no content depends on hover; the hover list shows its `.reveal` section at once); root PROGRESS: Current Objective, Done, Next Action, Last Verification (Pass 56 block), Known minor issues (P56 line); root CHANGELOG: one entry. PRD and README untouched (Planner-only).
MIGRATED: final test evidence, both verdicts with their costs, the measured values, the declared differences from the mockup and what Pass 61 inherits went to root PROGRESS (Last Verification and Known minor issues P56); what shipped went to root CHANGELOG.
NITS: the reviewer's five Tier 3 advisory lines (find-in-page opening a row; the aria-live panel rewritten on font load and resize, no screen reader run; a straight pointer path from a low row to the detail changing the row; the reserve recomputed on every resize without throttle; no fallback without :has()) and its remark that the title now shows earlier than on cb0bfbf are in root PROGRESS, Known minor issues, line P56.
COMMIT: 01098c9c93ca0a74913e8db6fc112848a367e628
