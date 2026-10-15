# Pass p60 - Portfolio inside Venture Building, « Afficher plus »

Contract: root PLAN.md § 60 (Goal, Probes 1-5, Planner decisions 1-4, Work 1-4, Done When 1-6); prompt root prompts/pass60-coder.md.
Pass base: product c5db8758b258e976866a80f996022ac6bfb36856 (state.json pass_base, read right after the first set). Root Planner inputs saved: 16766537691d36d22254a0786beb3953a4f062bb.
Models: work = selected current model (session reports Opus 5.5, effort not exposed: unknown); reviewer = inherited defaults (PROGRESS Model restriction exception). Runtime-verified: none; declared: the session's model line.

## SLICE
Size: one turn (about 60 active minutes): one section moved into a page, a stub, two shell partials, one script + its test, sitemap, docs. Matches the plan; no split.
Work:
1. service-venture-building/index.html: new section.section.section--alt.reveal#portfolio between #experience and #reflexion (#reflexion loses section--alt: decision 2); section__head h2 « Portfolio »; the form and grid of portfolio/index.html as they are; card titles h2 -> h3 (ids kept), back-face labels and front « Proposition de valeur » h3 -> h4; one button.btn.btn--secondary « Afficher plus (2) » hidden in the markup; portfolio.js loaded.
2. portfolio/index.html -> redirect stub copied from offre-venture-building/index.html (title, description, refresh target /service-venture-building/#portfolio, canonical, « Continuer » link); sitemap.xml loses /portfolio/ (CRLF kept).
3. tools/shell/header.html, footer.html: « Portfolio » entry removed; node tools/shell.mjs (9 pages, 7 stubs).
4. assets/js/portfolio.js: h4; the button (cards 3-4 hidden on load, one click shows them and the button goes; any update() hides the button); node tools/version.mjs. tools/portfolio.test.mjs: new source path, h4, button cases.
5. Docs: ARCHITECTURE routes, PROGRESS, CHANGELOG, PLAN status token + pointer.
Gate: none internal (no money/auth/migration path). Mutation proof applied to the button pins of the test (copy in the scratchpad).
No MANUAL item (owner decision 2026-10-13, PLAN § V1.2 MANUAL-V12: he reviews everything once after this Pass). No live system touched: LIVE-SAFE contract not applicable (local server 127.0.0.1 only, Google Fonts).
Acceptance order: standard (AUTO -> one full audit -> close).

## EXPECTED TESTS
- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check` exit 0; shell.mjs reports 9 shell pages and 7 stubs — expect: three exit 0.
- AUTO-2 `git diff --stat c5db875 -- . ':(exclude).WIP'` = the seven named files + stamped header/footer and ?v= lines of other pages — expect: no other file.
- AUTO-3 `git grep -n "/portfolio/" -- . ':!.WIP' ':!portfolio/index.html'` — expect: nothing, exit 1.
- AUTO-4 card text (tags removed, white space collapsed) in #portfolio of the new page = text of portfolio/index.html cards at c5db875 — expect: equal (evidence/cardtext.mjs).
- AUTO-5 `node tools/portfolio.test.mjs` exit 0, covering: button shown on load with cards 3-4 hidden, click shows four and hides the button, a filter hides the button and shows every match; the eight existing assertion groups still pass on the new source.
- AUTO-6 `node .WIP/pass-loop-p60/evidence/render.mjs` (headless Chrome, 127.0.0.1:4173): Venture Building 1200/375 scripts on: two cards + button visible by box, two cards « no box »; click, real Tab+Enter, tap show four and the button has no box; a search term matching a hidden card shows it; #reflexion after #portfolio; nothing past the layout width; every section above #portfolio keeps its box vs c5db875. Scripts off: four cards visible, button and form no box, each card's details opens by click.
- AUTO-7 same script: /portfolio/ = stub (refresh target and « Continuer » href = /service-venture-building/#portfolio, not followed); home + 8 other shell pages: no « Portfolio » link in header/footer, section heights vs c5db875 (header and footer heights may change: declared per page); desktop menu one row at 861 and 961 px on the ten pages (equal vertical centres, increasing left edges), logo -> first item gap recorded; no script error.
- AUTO-8 red run: the same script on the c5db875 scratch copy (127.0.0.1:4174) fails: no #portfolio, a « Portfolio » menu entry.
- AUTO-9 footer line breaks at 320 px before/after (AGENTS Gotcha): the footer « Pages » column loses one line, nothing else breaks differently.
Changed files reached by AUTO commands: all seven (pages and shell by render + check.mjs; portfolio.js by the test and the render; test by itself; sitemap by --seo). Docs (ARCHITECTURE, PROGRESS, CHANGELOG, PLAN, root repo) by no runner: read by the reviewer.
Audit budget: 2 contacts (one full, one confirmation only on FIX).

## CHANGED
Product: service-venture-building/index.html (section #portfolio between #experience and #reflexion, #reflexion alt off, portfolio.js loaded), portfolio/index.html (redirect stub), sitemap.xml (-1 URL, CRLF kept), tools/shell/header.html and footer.html (entry removed; shell.mjs restamped 9 pages), assets/js/portfolio.js (h4, « Afficher plus »), tools/portfolio.test.mjs (new source, h4, button cases, selector pinned), assets/css/style.css (two selectors: .portfolio-card h2 -> h3, h3 -> h4; NOT in the plan's file list: forced by decision 2's heading change, else titles and labels lose their styles), ?v= stamps on 16 pages (version.mjs).
Root (not sealed, second repository): ARCHITECTURE.md (routes, portfolio.js, 9 shell pages), AGENTS.md (menu-gap and footer Gotchas made true), PLAN.md (§ 60 status token + evidence pointer).
Design choices declared: the button sits in div.container.cta-band#portfolio-more[hidden] (existing classes; .btn is inline-flex and would override hidden on the button itself, a wrapper div needs no new rule); after « Afficher plus » the focus moves to the third card's « i » (summary) so a keyboard user is not dropped to the body; « Réinitialiser » after a search leaves four cards and no button (update() always removes it); stub title kept « Page deplacee », its hero text unchanged (wording out of scope).

## TEST-RESULTS r1
TREE: 25dd327c7f39119e
CMD: `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `node tools/portfolio.test.mjs` ; `node .WIP/pass-loop-p60/evidence/cardtext.mjs` ; `git diff --stat c5db875 -- . ':(exclude).WIP'` ; `git grep -n "/portfolio/" -- . ':!.WIP' ':!portfolio/index.html'` ; `node .WIP/pass-loop-p60/evidence/render.mjs` (outputs: evidence/check-all.txt, evidence/render.txt)
RESULT: PASS — check.mjs « OK — aucun probleme sur 16 page(s) » exit 0 (three executed tests PASS, BLOG line); version --check 0 (41 references, was 43: the old page's three, now one script on Venture Building); shell --check 0 (9 pages, 7 stubs incl. portfolio/index.html); portfolio.test PASS; cardtext 4 cards equal; diff = 22 files (the 7 planned + style.css + ?v=/shell lines of 14 other pages); git grep exit 1 (nothing); render 164 checks, failing 0.
NOTES: Red run `P60_BASELINE=write P48_BASE=http://127.0.0.1:4174` on the c5db875 scratch copy (git -c core.autocrlf=false archive): 102 checks, failing 52 (no #portfolio x4, stub not a stub, « Portfolio » in header+footer on 9 pages x2 widths, 6-item menu x27) — evidence/render-red-c5db875.txt.
  Mutation ledger (evidence/mutations.txt, copy in the session scratchpad, product file SHA-identical 952c491c…): 8 mutations of portfolio.js, 8 red (update keeps the button, cards 3-4 not hidden, click shows nothing, click keeps the button, focus elsewhere, label without count, button never shown, h3 selector). The last one survived the first ledger: the fixture ignored the selector (so before this Pass); querySelectorAll now answers only « .portfolio-back h4 ».
  Menu gap logo → first item (all 9 pages one row, 5 items): 861 px 104.2 (Venture)–109.2, was 24.2–29.2; 961 px 126.5–131.5 (404 146.5), was 46.5–51.5 (66.5); 1200 px 340.5–345.5, was 260.5–265.5.
  Footer: 397.8 → 363.5 px at 1200, 884.8 → 850.5 at 375 on the 9 pages (one entry less); at 320 every other footer line breaks as before (16 entries equal). Header 77 px unchanged. Main block heights of the 9 pages = c5db875 (Venture Building without #portfolio).
  Venture Building: boxes above #portfolio (72) and from #reflexion on (42, relative) = c5db875 at 1200 and 375. Backgrounds now: david-goliath alt, experience white, portfolio alt, reflexion transparent, contact band transparent (c5db875: reflexion alt, band transparent): the contact band now follows a white section, so the two read as one white area (decision 2's consequence, for the owner's overall review).
  Cards (scripts off) vs /portfolio/ c5db875: box sizes, grid width and computed style of title, back label, front label, text, tag equal at 1200 and 375.
  « Réinitialiser » after a search: four cards, the button does not come back (as the Planner expected).

## Audit fixes to implement — 2026-10-15
BLOCKING_STATUS: BLOCKING
READINESS: READY_WITH_FIXES
REASON: every contract check passes, but a visitor arriving through /portfolio/ lands with the section title « Portfolio » hidden under the sticky header (fully at 375 px, mostly at 1200 px).
NATIVE CHECKS: `node tools/check.mjs --all` PASS — « OK — aucun probleme sur 16 page(s) », census 0 without rule / 0 without use
NATIVE CHECKS: `node tools/version.mjs --check` PASS — 41 references; `node tools/shell.mjs --check` PASS — 9 shell pages, 7 stubs
NATIVE CHECKS: `node tools/portfolio.test.mjs` PASS; `node .WIP/pass-loop-p60/evidence/cardtext.mjs` PASS — 4 cards equal; `git grep -n '/portfolio/' -- . ':!.WIP' ':!portfolio/index.html'` PASS — exit 1, nothing
NATIVE CHECKS: Coder render re-run (all parts, outputs in the auditor scratchpad) PASS — 164 checks, 0 failing
SCOPE: CLEAN — the two style.css selectors (h2 to h3, h3 to h4) are necessary side work of the heading change; computed style and boxes of the 213 card elements and 45 form elements equal c5db875 /portfolio/ at 1200 and 375 px (comparison proven on an injected mutation).
COVERAGE: 22/22 changed product files read (full diffs of the 8 non-stamp files; the 14 other pages by a census of changed lines: only the two « Portfolio » li lines and the style.css ?v= line) + root AGENTS.md, ARCHITECTURE.md, PLAN.md diffs — skipped: none

### A-001 | Tier 2 | MEDIUM | `service-venture-building/index.html:145`, `portfolio/index.html:8`
- issue: through /portfolio/ (or /service-venture-building/#portfolio) the section's top edge lands at the window top under the 77 px sticky glass header (plus the 22 px .reveal offset): the h2 « Portfolio » sits at 30–60 px at 375 (entirely under the header; the point at its centre hits the logo image) and 50–92 px at 1200 (mostly under), so at 375 the first screen is an untitled six-field search form with no title and no card; the site has no scroll-margin or scroll-padding and this is its first fragment landing.
- fix: give the section a scroll offset of at least the header height, e.g. one rule `#portfolio { scroll-margin-top: 80px; }` in style.css (id selector, no class-census change), then `node tools/version.mjs`; nothing else.
- test: load /portfolio/ at 1200x900 and 375x740, scripts on (wait 2.5 s) and off: `#portfolio h2` top is at or below `.site-header` bottom and elementFromPoint at the h2 centre lies inside the h2; then re-run render.mjs (« nothing moves » boxes unchanged) and `node tools/check.mjs --all`.

Tier 3 advisory (not to implement this round): the sitemap.xml working copy is now CRLF while the index holds LF (core.autocrlf normalises the commit, so the committed change stays one line). Declared choices judged acceptable: the button in div.container.cta-band#portfolio-more[hidden] (hidden honoured, no rule overrides display); focus to the third card's summary after « Afficher plus » (real Tab then continues card 3, card 4, #reflexion); « Réinitialiser » leaves four cards and no button; #reflexion now white before the white contact band, the same pattern as the home page (#demarche then the contact band). Root docs checked against the auditor's own menu measures (861 px gap 104.2–109.2, 961 px 126.5–131.5, 404 146.5; before 24.2–27.2 and 46.5–49.5).

```json
{
  "token": "ad44ed01",
  "verdict": "FIX",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --stat c5db875 -- . ':(exclude).WIP' (22 files: plan list, declared style.css, stamped and ?v= lines only)", "result": "PASS"},
    {"cmd": "git grep -n '/portfolio/' -- . ':!.WIP' ':!portfolio/index.html' (exit 1, nothing printed)", "result": "PASS"},
    {"cmd": "node tools/portfolio.test.mjs", "result": "PASS"},
    {"cmd": "node .WIP/pass-loop-p60/evidence/cardtext.mjs", "result": "PASS"},
    {"cmd": "python compare of the 4 articles of c5db875 portfolio/index.html (h2 to h3, h3 to h4) with the VB section: byte-equal", "result": "PASS"},
    {"cmd": "node audit.mjs vb (auditor scratchpad: 1200 and 375 scripts on, click, real Tab and Enter, touch tap, search, reset, facet, width, headings, script errors) 39/39", "result": "PASS"},
    {"cmd": "node audit.mjs nojs,moves,cards (scripts off four cards and details by click; boxes above #portfolio and from #reflexion equal c5db875 on and off at 1200 and 375; computed style of 213 card and 45 form elements equal c5db875 /portfolio/) 24/24", "result": "PASS"},
    {"cmd": "node audit-mut.mjs cards (mutation proof: an injected h4 letter-spacing is detected, 40 style diffs)", "result": "PASS"},
    {"cmd": "node audit.mjs menu (9 shell pages at 861, 961 and 1200: one row, 5 items, no Portfolio link, no script error) 27/27", "result": "PASS"},
    {"cmd": "node audit.mjs stub (raw /portfolio/: refresh and Continuer to /service-venture-building/#portfolio, no header, footer or script)", "result": "PASS"},
    {"cmd": "node landing.mjs (/portfolio/ arrival at 1200 and 375: #portfolio h2 top 50 and 30 px against sticky header bottom 77 px, A-001)", "result": "FAIL"},
    {"cmd": "P60_PART=vb,nojs,stub,others,menu,footer,shots node .WIP/pass-loop-p60/evidence/render.mjs (outputs in the auditor scratchpad) 164/164", "result": "PASS"}
  ],
  "opened_fix_section": true
}
```

AUDIT r1 COST: 231,410 tokens, 150.6 s for the resumed segment (first segment cut by the account's session limit, HTTP 429, wall time not reported), FIX
INVOCATION: one subagent, resumed once with the same brief/token after the 429 | USAGE BASIS: unknown (Agent completion notice, probably cumulative over both segments)

## TEST-RESULTS r2
TREE: 219d111629539306
CMD: `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `node tools/portfolio.test.mjs` ; `node .WIP/pass-loop-p60/evidence/cardtext.mjs` ; `git diff --stat c5db875 -- . ':(exclude).WIP'` ; `git grep -n "/portfolio/" -- . ':!.WIP' ':!portfolio/index.html'` ; `node .WIP/pass-loop-p60/evidence/render.mjs` (new part « landing »)
RESULT: PASS — check.mjs « OK — aucun probleme sur 16 page(s) » 0; version --check 0; shell --check 0; portfolio.test PASS; cardtext 4 equal; diff 22 files (style.css now +1 comment +1 rule); git grep exit 1; render 170 checks, failing 0.
NOTES: A-001 fix: style.css `#portfolio { scroll-margin-top: 80px; }` + a comment, in the Portfolio block; version.mjs restamped. New render part « landing » (/portfolio/ followed, 1200x900 and 375x740, scripts on after 2.7 s and off): h2 top below the 77 px header and topmost at its centre: 129.8 / 152.3 (off) px at 1200, 109.6 / 132.7 (off) px at 375. Red: the same part on a copy of this tree without the rule (127.0.0.1:4176) fails 4 of 4 (h2 at 49.8, 72.3, 29.6, 51.7 px; evidence/landing-red-no-rule.txt). Boxes above #portfolio and from #reflexion on still equal c5db875 (scroll-margin moves nothing).

## AUDIT r2 verdict (delta confirmation, A-001)
A-001 confirmed fixed: style.css adds one comment and `#portfolio { scroll-margin-top: 80px; }`; style.css ?v= is de5ec870 on all 16 pages. Arriving through /portfolio/ or #portfolio, the h2 « Portfolio » now sits below the 77 px header and is topmost at its centre. Scripts on: 129.8 px at 1200, 109.6 px at 375. Scripts off: 152.3 px at 1200, 132.7 px at 375. The delta introduced nothing new: check.mjs --all is green and the census unchanged; render.mjs gives 170/170 with the « nothing moves » boxes still equal to c5db875.

```json
{
  "token": "40fc037e",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "git diff c5db875 -- assets/css/style.css (delta: one comment and #portfolio scroll-margin-top 80px in the Portfolio block) and the changed-line census of the other pages (style.css ?v=de5ec870 on 16 pages, nothing else new)", "result": "PASS"},
    {"cmd": "node landing2.mjs (auditor scratchpad: /portfolio/ and /service-venture-building/#portfolio at 1200x900 and 375x740, scripts on after 2.5 s and off: #portfolio h2 top at or below .site-header bottom 77, elementFromPoint at the h2 centre inside the h2) 8/8", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "P60_PART=vb,nojs,stub,landing,others,menu,footer,shots node .WIP/pass-loop-p60/evidence/render.mjs (outputs in the auditor scratchpad) 170 checks, failing 0", "result": "PASS"},
    {"cmd": "read .WIP/pass-loop-p60/evidence/landing-red-no-rule.txt (the landing part without the rule fails 4 of 4)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: 249,855 tokens, 249.0 s, GREEN
INVOCATION: same subagent, resumed | USAGE BASIS: unknown (Agent completion notice, probably cumulative over the three segments)

## CLOSURE
UNIT: p60
DOCS: root PLAN.md § 60 status Done + evidence pointer; ARCHITECTURE.md routes (seven stubs incl. /portfolio/), portfolio.js clause, 9 shell pages; AGENTS.md menu-gap and footer Gotchas made true; PROGRESS.md and CHANGELOG.md Pass 60 entries (root, LOCAL ONLY)
MIGRATED: final test evidence, review verdicts (FIX A-001 then GREEN), costs, menu gaps and mutation ledger into PROGRESS Last Verification (Pass 60); owner-facing summary into CHANGELOG 2026-10-15
NITS: PROGRESS Known minor issues P60 (white Réflexion before the white contact band, count text before « Afficher plus », reset state, awkward CSS comment, sitemap CRLF working copy noted here only: git normalises it, committed change one line; never proven: screen reader, other browsers, real phone)
COMMIT: 351b70826edc930f113c9e706343ab9860dc5233
