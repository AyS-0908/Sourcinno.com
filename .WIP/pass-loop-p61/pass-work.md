# Pass p61 — Accueil : onglets « +25 ans d'expérience » (PLAN § 61, V1.2 R2d second part)

Coder prompt: root `prompts/pass61-coder.md`. Started 2026-10-14 00:10 in a fresh conversation. LOCAL ONLY.
Models: work = Opus 5.5 (declared by the session's system text, not runtime-verified), effort unknown; reviewer = inherited defaults (PROGRESS Model restriction exception), metadata unknown unless the completion notice exposes it.
Ground check (PROGRESS only, before anything else): Pass 56 closed with Planner CHECK, no human test owed, no open defect: ground clear.
Pre-flight 2026-10-14 00:12 (root cwd), all as the Planner measured: root ce0010c with the exact expected dirt, product 6311e63 clean on `rebuild`, `plan.py guard` exit 0, `check-ignore` → `.git/info/exclude:7:/.WIP/`, state dir absent, port 4173 listening on 127.0.0.1 (processes 103380 and 77520, not mine: REUSED for the tree, never stopped), 4174 and 4175 free. Planner inputs saved: root 4f12ba1ee995b59d19146ac936cd7c362f8a2c4d (5 M, 1 A, 1 D, nothing under `outputs/`). First `status.py set` run from the product folder: `pass_base` = 6311e636a986624c3e697fc3e3833a1f1c42fb09 = product HEAD.

## SLICE

One turn of work, not split: one page (`index.html` `#experience`), the existing `initHoverList()` gains a second layout, one CSS block. Planned about 60 active minutes.
Order:
1. `evidence/cdp.mjs` (Pass 56 copy), `evidence/render.mjs` (Pass 56 render retargeted to `#experience`, five tabs); a scratch copy of 6311e63 served on 4174 gives the red run and `baseline.json`.
2. `assets/js/site.js` `initHoverList()`: rows = `.hl__items > li > details` and `.hl__items > details` (child combinators only); the `tabs` branch of `fill()` (value `tabs` only: the bare attribute of the service lists gives an empty string); the forced reveal kept for the list layout only (Planner decision 2).
3. `assets/css/style.css`: the `accueil-T` block and the three `cartes-A` rules Pass 56 left out, at a specificity that beats the `#experience` id rules; the 24 px gap on the new `div.hl__items` of the tabs block only (Planner decision 1).
4. `index.html` `#experience`: classes, `data-hoverlist="tabs"`, one wrapper `div.hl__items`, five `span.hl__lead`, one empty `div.hl__detail` with `aria-live="polite"`. No word changes. `node tools/version.mjs`.
5. Docs before the review: PLAN § 61 status token and evidence pointer, ARCHITECTURE (`site.js` clause, Layering rule 5); PROGRESS and CHANGELOG at closure.
Plan questions: (1) no MANUAL item in this Pass: owner decision 2026-10-13 (PLAN § V1.2 MANUAL-V12), he approved these tabs on the mockup and reviews everything once after Passes 61, 62, 59 and 60. (2) every number below comes from a command named in its results block. (3) no money, auth or migration path; no internal gate. (4) changed files the native suite never executes as rendered behaviour: `site.js`, `style.css`, `index.html` are read by `check.mjs` as source only; the render script is the rendered proof for all three.
Acceptance order: AUTO checks, one full audit, close. No live system is touched (no LIVE-SAFE clause applies): everything runs on 127.0.0.1; fonts from Google Fonts.
What the seal does not cover: the state dir is ignored by git, so `evidence/` (scripts, tables, captures) is outside the seal; the scratch copies live in the session scratchpad.

## EXPECTED TESTS

- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check` — expect: exit 0 each; `git diff --stat 6311e63 -- . ':(exclude).WIP'` holds only `assets/js/site.js`, `assets/css/style.css`, `index.html` and `?v=` lines on the other pages.
- AUTO-2 `node .WIP/pass-loop-p61/evidence/render.mjs`, hover mode, home at 1920, 1200, 961 px, motion both ways, Inter loaded — expect: on load tab 1 active and its detail shown; the mouse on each of the five tabs shows that tab's whole title, subtitle and list in the panel, panel box in the viewport, topmost, under the row of tabs; every tab label horizontal on one line; boxes of the whole page unchanged from one tab to the next; a real Tab reaches each tab (count printed), detail shown, focus ring read from pixels, Enter keeps it; no right edge past the layout width; every text of the active tab and of the panel 4.5:1 or more against the worst pixel behind it, painted pixels counted.
- AUTO-3 same script, no hover mode: 960 px fine pointer; 1200 px touch (`matchMedia("(hover: none)")` printed); 375 px; 1200 and 375 px scripts disabled — expect: every card shows its whole title (the `hl__lead` part has a box wider than 40 px and is not clipped), opens and closes by click or tap and by Enter; boxes of every element of `#experience` that 6311e63 holds, cards closed then first card open, equal 6311e63 (the new wrapper, lead spans and empty panel are left out of the list, their existence printed).
- AUTO-4 same script against 6311e63 at 1200 and 375 px — expect: home, boxes of everything outside `#experience` equal; the nine other shell pages keep their section heights; no script error on the ten pages; at 1200 px with a mouse, motion allowed, loaded without scrolling, `#experience` carries no `is-visible`, and carries it after scrolling to it. The Pass 56 render (`P56_PART` `hover` then `plain`, `P56_PAGE` `strategie` then `ia`, four pieces, each raced against a timeout): 0 failing check each, tree left clean.
- AUTO-5 same script, `prefers-reduced-motion: reduce` — expect: no animation or transition over 50 ms in `#experience` right after each mouse move; without reduced motion the same probe sees some (a blind probe would read 0).
- AUTO-6 the render can fail — expect: on the scratch copy of 6311e63 (`git -c core.autocrlf=false archive 6311e63`) it reports no tabs at 1200 px; on a mutated copy of the tree without the `--hl-min` line it reports a block that moves.
- AUTO-7 once, outside the Done When list — expect, printed: 960 → 1200 → 960 px resize (tabs on, no card left open, then today's cards back, boxes = 6311e63); computed styles of the mocked section (root `previews/v12/` on a scratch copy of cb0bfbf) against the port at 1920, 1200, 961 px, pseudo-elements included, every difference listed; the cloned head carries no id, name or script hook.

## CHANGED

Product (`git diff --numstat 6311e63 -- assets index.html`): `assets/js/site.js` +16 −6, `assets/css/style.css` +21, `index.html` +11 −8; `node tools/version.mjs` rewrote the `?v=` lines of the 15 other pages (18 files in all, 72 insertions, 38 deletions). Root docs, outside this repository's seal: PLAN § 61 status token + evidence pointer (1 line changed, 1 added), ARCHITECTURE (`site.js` clause, Layering rule 5).
- `assets/js/site.js` `initHoverList()`: rows = `.hl__items > li > details, .hl__items > details` (child combinators only); `tabs` = the attribute value is exactly `tabs` (bare attribute = empty string = list layout, unchanged); in tabs `fill()` first copies the summary's children into a `div.hl__head`; the forced reveal of Pass 56 runs for the list layout only (`tabs ? null : root.closest(".reveal")`). Nothing else changed: same events, same `reserve()` (it removes `--hl-min` before measuring the panel; in tabs the panel is the block that takes `min-height: var(--hl-min)`).
- `assets/css/style.css`: block « P61 », 16 rules, after the « P56 » block. Two rules carry `#experience` in front, because the section's id rules outrank a class rule: `#experience .hl--tabs.is-hover` (against `#experience .experience-panel { gap }`, :899) and `#experience .hl--tabs.is-hover .disclosure--card summary` (against `#experience .disclosure--card summary { min-height: var(--xp-row) }`, :903). `.hl--tabs > .hl__items { display: grid; gap: var(--space-3) }` is Planner decision 1 (does not reach the `ol.hl__items` of the service pages: they carry no `.hl--tabs`).
- `index.html` `#experience`: the panel gains `hl hl--tabs` and `data-hoverlist="tabs"`; one `div.hl__items` wraps the five cards (their indentation kept); five `span.hl__lead`; one empty `div.hl__detail` with `aria-live="polite"`. Page text with every tag removed: 4,137 characters before and after, identical (sha256 def9a9b790e1dd7a… both; each of the five titles found once with its space). `#demarche` untouched.

Mockup rules NOT ported as written (all from `previews/v12/index.html`):
- `cartes-A` :87 `.hl__items { display: grid; gap }` unconditional: it would reach the service lists; replaced by `.hl--tabs > .hl__items` (decision 1).
- `cartes-A` :92 `.hl.is-hover .disclosure--card summary { min-height: 0; padding }`: both declarations are overridden by the tabs rule (:122) on its only user, the home tabs: no effect, left out.
- `cartes-A` :95 the `h3` half (`.hl.is-hover .is-active h3`): ported scoped to the tabs block (`.hl--tabs.is-hover .is-active h3`), so the service lists keep their Pass 56 rules untouched.
- `cartes-A` :99 `.hl.is-hover > .hl__detail .bullets { margin: 0; padding: 0; border: 0 }`: folded into the tabs rule (`margin: var(--space-2) 0 0`, same computed values), for the same reason.
- `copie-existant` (`.m-experience`): mockup-only restatement of the id rules.
Declared differences from the mock script: none new (the three Pass 56 ones stay: reserve rounded up, `.is-swap` dropped before a refill, `--hl-min` removed when the mode turns off).

## TEST-RESULTS r1
TREE: 89ae160f4cb337c9
CMD: `node tools/check.mjs --all; node tools/version.mjs --check; node tools/shell.mjs --check; P48_PROFILES=SCRATCH node .WIP/pass-loop-p61/evidence/render.mjs; P48_PROFILES=SCRATCH P56_PART=plain P56_PAGE=ia (then plain strategie, hover ia, hover strategie) node .WIP/pass-loop-p56/evidence/render.mjs; P48_PROFILES=SCRATCH node .WIP/pass-loop-p61/evidence/mock-compare.mjs`
RESULT: PASS — `check.mjs --all` exit 0 (« aucun probleme sur 16 page(s) », three executed tests PASS), `version.mjs --check` exit 0 (43 references, 16 pages), `shell.mjs --check` exit 0 (10 pages, 6 stubs skipped); render « 295 checks, failing 0 » exit 0; Pass 56 render in four pieces: plain ia « 38 checks, failing 0 » (57 s), plain strategie « 33 checks, failing 0 » (95 s), hover ia « 144 checks, failing 0 » (96 s), hover strategie « 228 checks, failing 0 », each under its 300 s timeout, exit 0, tree left clean (`git status --short -- .WIP` empty)
NOTES: seal read before and after the three native commands, same value; the renders ran on this content (last edit of a tracked file = the `version.mjs` run before them). `git diff --stat 6311e63 -- . ':(exclude).WIP'` = 18 files (the three named + `?v=` lines on 15 pages); `git diff --check` exit 0. Red run (same script, scratch copy of 6311e63 on 4174, `P61_BASELINE=write`): exit 1, « 87 checks, failing 8 » = 6 × « tabs on (hover mode false, data-hoverlist « null », panel present false) » (1920, 1200, 961, both motion ways) + 2 lines of the resize case; it wrote `baseline.json` (10 « xp », 2 « outside », 18 « sections », 3 « timeline » lists); its 79 other checks pass on 6311e63. Mutation run (copy of the tree without the `root.style.setProperty("--hl-min", …)` line, on 4176, `P61_PART=hover`, says PARTIAL): exit 1, « 186 checks, failing 30 », all 30 « boxes changed since load » or « section height / panel size over the five tabs » (5 per width and motion way; e.g. panel 638.4x356.3 → 638.4x266.8 on tab 2 at 1920). Files: `evidence/render.txt`, `render-red-6311e63.txt`, `render-mutation-no-reserve.txt`, `mock-compare.txt`. One probe defect met and fixed before these runs: an element without a box (the subtitle inside a tab, display none) was listed with a zero box at the scroll position, which made 5 boxes « move » with every scroll; such elements are now listed as « no box » and the baseline was rewritten with the fixed script. The state dir is ignored by git: the seal does not cover `evidence/`. Servers, said as asked: 4173 = the tree (found running, processes 103380 and 77520, not mine, reused); mine, all bound to 127.0.0.1 and served from the session scratchpad `p61/`: 4174 = scratch copy of 6311e63 (`git -c core.autocrlf=false archive 6311e63`, without `.WIP`), 4175 = scratch copy of cb0bfbf + the approved mockup of root `previews/v12/` under `.WIP/mockup-v12/` (reference of `mock-compare.mjs`), 4176 (free when checked; a third port, beyond the two the prompt named) = the mutated copy.

## MEASURES r1 (all from `evidence/render.txt` unless said)

| What | 1920 | 1200 | 961 |
|---|---|---|---|
| Layout width (`clientWidth`) | 1905 | 1185 | 946 |
| Tabs, width × height | 66.7 / 145.7 / 145.7 / 134.7 / 119.7 × 44 | same | 66 / 145 / 145 / 134 / 508 × 44 |
| Lines of tabs | 1 | 1 | 2 (TECHNOLOGIE alone on the second) |
| Panel, reserve `--hl-min` | 638.4×365, 365px | 638.4×365, 365px | 510×411, 411px |
| Panel under the tabs | 17 px | 17 px | 17 px |
| `#experience` height over the five tabs | 908.8 | 906.9 (= 6311e63 cards closed, 906.9) | 898.5 |
| Boxes changed from one tab to the next (mouse) | 0 of 192, five tabs | 0 of 192 | 0 of 192 |
| Timeline steps | 106 × 5 = 6311e63 | 106 × 5 = 6311e63 | 106 × 5 = 6311e63 |
| Lowest contrast, text against the worst pixel behind it | 7.53:1 (panel subtitle on white); tab label white on navy 12.14:1; panel title, title start and list 12.14:1 | same | same |
| Fewest painted pixels in one piece of text | 197 (tab label) | 197 | 197 |
| Real Tab presses to tab 1, then to each next | 11, 1, 1, 1, 1 | 11, 1, 1, 1, 1 | 11, 1, 1, 1, 1 |
| Focus ring, pixels and median contrast | 744 to 1218, 4.77:1 | 744 to 1218, 4.77:1 | 706 to 3396, 4.77:1 |
| Animations over 50 ms right after a mouse move: motion allowed / reduced | 14 at most on 4 of 5 moves / 0 | 14 / 0 | 14 / 0 |
| Elements past the layout width, script errors | 0, 0 | 0, 0 | 0, 0 |

Not measured for contrast, said on the render line: per width, 5 pieces of text clipped to 1 px in a tab (the start of the title, measured in the panel head instead) and 5 without a box (the subtitle inside a tab, display none); the orange list markers (`li::before`, decoration, same rule as today's cards).
No tabs (Done When 3), five cases: 960 px fine pointer · 1200 px touch (`(hover: none)` true, fine pointer with hover false) · 375 px · 1200 px scripts disabled · 375 px scripts disabled. In each: hover mode false, panel `display: none` and empty; every card shows its whole title (title start 118.7 to 187.8 px wide, `position: static`, inside its `h3`) and its subtitle; boxes of `#experience` and of everything 6311e63 holds in it = 6311e63, cards closed (48 entries) and first card open (53 entries); each card opens and closes by click or tap 5 of 5 and by real Tab + Enter, Enter 5 of 5 (Tab presses 11, 1, 1, 1, 1; at 375 px 6, 1, 1, 1, 1). Left out of the box lists because 6311e63 does not hold them: `div.hl__items`, the five `span.hl__lead`, `div.hl__detail`.
Against 6311e63 (Done When 4): home, everything outside `#experience` at 1200 and 375 px = 6311e63 (157 entries each); the nine other shell pages at 1200 and 375 px: section heights = 6311e63 (18 lists), script errors 0 on every load (home included). Decision 2, motion allowed, loaded without scrolling: at 1200×900 `#experience` starts 1641.8 px down, tabs on, not marked visible, opacity 0; after scrolling to it marked visible, opacity 1 (same at 1920×1080, 1647.5 px down). 37 comparisons with 6311e63 in all, all equal.
Once, outside the list: card 2 opened at 960 px, widened to 1200 (tabs on, 0 card left open, 1 active tab, reserve 365px, no entrance animation replayed, nothing past the width), back to 960 (cards, panel emptied and hidden, reserve removed, boxes = 6311e63). The copied detail holds 0 id, name, hover list, dépliant, summary or script; `aria-live` « polite ».
`first-screen.mjs` of Pass 56 not copied: its question (« a tall .reveal block blank on the first screen ») does not arise here: `#experience` starts 1,642 px down the page, never on a first screen, and the tabs layout does not make it taller (906.9 px at 1200 in both modes); the reveal readings above replace it.
Captures looked at (Inter loaded, refused otherwise): `experience-1200-tab.jpg` 1185×907 (mouse on tab 4), `experience-961-tab.jpg` 946×899 (mouse on tab 3, tabs on two lines), `experience-375-open.jpg` 375×1703 (card 2 open); the 1200 one compared by eye with root `previews/v12/captures/accueil-t-1200.png`: same picture.

## DECLARED FOR THE REVIEW (differences from the mockup, and what nobody proved)

1. Mockup against port (`evidence/mock-compare.txt`; the approved page of root `previews/v12/` running on cb0bfbf, against the tree): the two-column grid of the section (timeline + tabs + panel), 246 elements and pseudo-elements × 449 computed properties, at 1920, 1200 and 961 px. ONE difference, at 1920 and 1200: the panel's `min-block-size`, mock 364px, port 365px (the reserve is rounded up since Pass 56, the mock script rounds down); the panel and its block are 1 px taller (638.4×365 against 638.4×364; block 427 against 426). At 961: no difference, no box differs. Tabs, lines of tabs, widths: identical at the three widths.
2. From 961 to 1199 px the tabs take two lines; at 961 the fifth tab (TECHNOLOGIE) is alone on the second line and stretches to the full width (508 px). Same on the approved mockup; for the owner's overall review.
3. Under the panel the right column is shorter than the timeline: about 200 px of empty section under the panel at 1200 (as on the mockup capture).
4. Never proven, nothing built for it: a screen reader (the tabs are native `details` without a tab role; in hover mode the title exists twice in the page, in the tab and in the `aria-live="polite"` panel, which is rewritten on every tab change, once the fonts are loaded and on every resize); a device with both touch and mouse; any browser but Chrome; the Pass 56 leftovers of PLAN § Code backlog (no `:has()` fallback, find-in-page opening a row).

## Audit verdict — Pass 61, review contact 1 of 2 (fresh auditor)

```json
{
  "token": "fbc18e2b",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --stat 6311e63 -- . ':(exclude).WIP'", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && R_WIDTHS=1920,1200 node hover.mjs", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && R_WIDTHS=961 R_TAG=hover961 node hover.mjs", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && R_BASE=http://127.0.0.1:4176 R_WIDTHS=1200 R_REDUCE=0 node hover.mjs > out-hover-4176-red.txt; test $? -eq 1 && test $(grep -ciE '^FAIL .*nothing moves' out-hover-4176-red.txt) -eq 8 && test $(grep -E '^FAIL' out-hover-4176-red.txt | grep -civE 'nothing moves') -eq 0", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && node compare.mjs", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && R_PART=services node pages.mjs", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && R_PART=pages node pages.mjs", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && node mock.mjs", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && node switch.mjs", "result": "PASS"},
    {"cmd": "cd scratchpad/p61-reviewer && python -I pixels.py .", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 272,173 tokens, 15 min 43 s (942,938 ms), GREEN
INVOCATION: one Agent launch (pass-auditor, brief passed by file path) 2026-10-14 00:41; it stalled with « no progress for 600 s » (the account's weekly usage limit was reached that night; 97 % at launch); resumed 09:05 through SendMessage to the same agent with the same brief and token, no second contact reserved; verdict imported 09:21.
USAGE BASIS: unknown (Agent completion notice after the resume; probably cumulative over both runs, not stated by the notice).
Reviewer Tier 3 (none blocking, migrated to root PROGRESS Known minor issues P61): screen reader, touch+mouse device, other browsers never proven, the panel rewritten about six times at fonts-ready and on each resize; root PLAN § 61 pointed at receipts not yet written (written at this closure); focus ring overlaps the neighbouring tab by about 2 px.

## CLOSURE
UNIT: p61
DOCS: root PLAN § 61 status token Done + evidence pointer (before the review); root ARCHITECTURE `site.js` clause and Layering rule 5 (before the review); root PROGRESS (Current Objective, Done, Next Action, Last Verification Pass 61, Known minor issues P61) and CHANGELOG (one entry) at closure; root AGENTS one Gotcha (a box probe must list an element without a box as such).
MIGRATED: test evidence, measures, the verdict with its cost, the declared differences from the mockup and the reviewer's Tier 3 observations went to root PROGRESS (Last Verification Pass 61, Known minor issues P61); what shipped went to root CHANGELOG.
NITS: root PROGRESS Known minor issues P61
COMMIT: 700b6b628a2d1f151dc95073d4c67e7f37fd4329
