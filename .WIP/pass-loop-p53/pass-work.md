# Pass p53 — Publications — deux colonnes, blog par étiquette

Contract: root PLAN.md § 53 (§ V1.2 R1a–R1b; PRD § Refonte 2026-10-11 row Publications; owner brief `prompts/rework-brief-20261011.md` items 1a–1b). Coder prompt root `prompts/pass53-coder.md`, root inputs commit dd17aed. Product base 17f0a00 (rebuild). LOCAL ONLY.

MODELS: work = claude-opus-5-5 (session system prompt, declared); effort unknown (not exposed). Reviewer: inherits the session model, effort unknown (PROGRESS Model restriction exception). Runtime-verified: nothing.

SERVER: ports 4173 and 4174 free at pre-flight (`netstat -ano | findstr ":4173 :4174"` printed nothing). Product served on 127.0.0.1:4173; a mutated scratch copy on 127.0.0.1:4174 for the red run only.

Started 09:55 local (session clock).

## SLICE

Size: one turn (~30 min): one wrapper on one page, two CSS rules, three changed lines in a 33-line script, `version.mjs`, one headless render script reusing the P51 cdp helper. No split.

ACCEPTANCE: OWNER-EYES-FIRST
Why eyes-first is honest here: a column layout and a chip row, judged by eye; low-risk and reversible (one page, no money/auth/data path); every post stays in the HTML.

Design (existing classes, one new class):
- `publications/index.html`: the two sections become ONE `section.section.reveal`; its `div.container` also carries the new class `pub-cols` and holds two plain `div`s: the cards block (h2 « À lire et à suivre » + `div.stack`) and the blog block (`div#blog`: h2 « Blog » + `div.stack#blog-list` + « Tout le blog → »). `.measure` leaves the two stacks and the last paragraph. The container sits at indent 0 so every line from `<div class="section__head">` down keeps its indentation: the marker-to-marker lines are untouched.
- `assets/css/style.css`, appended inside the blog block (:534–551), nothing else changed: `.pub-cols` = grid, one track `minmax(0, 68ch)` (the former `.measure` reading width, so ≤ 960 px looks as today), row gap `--space-6`; from 961 px tracks `minmax(0, 1fr) minmax(0, 2fr)`, column gap `--space-4`, `align-items: start` (no stretch, no sticky).
- `assets/js/blog.js`: chips = `tags` only; `pick` hides every post whose tag differs from the chip; « Tous » gone (3 mentions → 0). Fewer than two tags → no chip, every post (unchanged line).
- Consequence reported, not self-corrected: in one column the two blocks are now separated by one `--space-6` (72 px; 52 px ≤ 640) instead of two section paddings (144 / 104 px). Owner sees it at 375.

Gates: none internal. Live checks: none (127.0.0.1 + Google Fonts only; resolver maps every other host to NOTFOUND; no LIVE-SAFE clause applies).
MANUAL: one item (owner look). Why no machine can prove it: whether the 1/3–2/3 layout and the tag-only chips are what the owner asked is a look judgment; renders prove geometry and counts, not taste.

## EXPECTED TESTS

- AUTO-1 Done When 1, from the product: `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check 17f0a00` — expect: exit 0 each; `git diff --stat 17f0a00 -- . ':(exclude).WIP'` — expect: `publications/index.html`, `assets/css/style.css`, `assets/js/blog.js` + pages whose only changed lines are `?v=` stamps; `git diff 17f0a00 -U0 -- assets/css/style.css` — expect: one hunk, additions only, after old line 551; `grep -c "Tous" assets/js/blog.js` — expect: 0; the marker command of the Coder prompt — expect: `IDENTIQUE 5299`.
- AUTO-2 Done When 2–4: `node .WIP/pass-loop-p53/evidence/render.mjs` (P51 cdp helper imported) — expect: exit 0, last line `RENDER … failing checks 0, outside requests 0`. JS on at 961/1200/1440: column tops equal ± 1 px, blog width / cards width within 2 ± 3 %, h3 order Du PIB au BCI / Engagez-vous 2.0 / Publications LinkedIn; at 960/768/375/320: blog top ≥ last card bottom, same left edge; every width: 0 element right edge past the emulated width, launcher height/width 0.5625 ± 0.01, inside its card, ▶ 38×38. Chips at 1200: exactly IA / Venture Building / Startup; on load only IA `aria-pressed="true"`, 6 shown all IA; Tab to « Venture Building » + Enter (`Input.dispatchKeyEvent`) → 4 shown all Venture Building; Tab + Enter « Startup » → 1; shown never 11 nor 0. JS off at 1200 and 375: 0 chip, 11 posts with non-zero boxes, same column geometry as JS on, caption link box non-zero. Captures: 1200 IA, 1200 Venture Building, 375, 1200 and 375 scripts off.
- AUTO-3 the render check can fail: the same script against a scratch export of the tree with « Tous » put back in `blog.js`, served on 127.0.0.1:4174 (`P48_BASE`) — expect: exit 1, the chip lines FAIL (4 chips, 11 posts on load).
- [x] MANUAL-1 Owner look, BEFORE the review: `/publications/` at 1200 px (IA selected), at 1200 px after « Venture Building », and at 375 px, sent as images — expect « ok » — confirmed by the owner on 2026-10-12 (« ok », captures of product d200a53)

Changed files and reach: `publications/index.html` — AUTO-1 (structure, census, nojs, seo, a11y), AUTO-2 (rendered). `assets/css/style.css` — AUTO-1 (census both ways, version), AUTO-2. `assets/js/blog.js` — AUTO-2 and AUTO-3 (executed in Chrome; no `tools/` test added). Pages carrying only a new `?v=` stamp — AUTO-1 (`version.mjs --check`); the new rule is scoped to `.pub-cols`, used by Publications only. No unreached file.

Audit budget: 2 contacts (one fresh review; same reviewer confirms only if FIX). Expect ~150–250k tokens per contact (P50–P51 receipts).

## CHANGED
- `publications/index.html`: one section, `div.container.pub-cols` holding the cards block and `div#blog`; `.measure` off the two stacks and the last paragraph; marker-to-marker lines byte-identical (IDENTIQUE 5299).
- `assets/css/style.css`: 6 lines added after old line 551 (`.pub-cols` grid + the 961 px two-track rule); no line removed or changed.
- `assets/js/blog.js`: chips = tags only; `pick` compares the tag alone; comment updated.
- 15 other pages: `?v=` stamp lines only (`node tools/version.mjs`: 43 refs, 16 pages rewritten).
- Product commit d200a53 (rebuild, local).
- Root docs repository (not in this seal): `ARCHITECTURE.md` `blog.js` clause.
- Evidence (ignored, not sealed; committed durable after done): `.WIP/pass-loop-p53/evidence/` render.mjs, render.txt, render-red.txt, `publications-1200-ia.png`, `publications-1200-venture.png`, `publications-375-js.png`, `publications-1200-nojs.png`, `publications-375-nojs.png`.

## TEST-RESULTS r1
TREE: c25775f6d7f60e28
CMD: `node tools/check.mjs --all` exit 0 (16 pages, both executed tests PASS); `node tools/version.mjs --check` 0 (43 refs); `node tools/shell.mjs --check` 0; `git diff --check 17f0a00` 0; `grep -c "Tous" assets/js/blog.js` 0; marker command `IDENTIQUE 5299`; `node .WIP/pass-loop-p53/evidence/render.mjs` exit 0
RESULT: PASS — Done When 1–4 met on product d200a53; render: failing checks 0, outside requests 0.
NOTES: DW1 scope: `git diff 17f0a00 -U0` outside the three files = 0 non-`?v=` line; style.css = one hunk `@@ -551,0 +552,6 @@`, additions only.
 DW2 (render.txt): 1440 and 1200: tops 464.9/464.9, cards 360.0, blog 720.0 (2.000); 961: tops 453.5/453.5, 288.7 / 577.3 (2.000), launcher 222.7x125.2; 960 and 768: one column 680 wide, blog top 72 px under the last card; 375: 327 wide, 52 px; 320: 272 wide; elements past the emulated width 0 at all seven; launcher ratio 0.5625 inside its card, play mark 38x38 at all seven.
 DW3: chips IA / Venture Building / Startup at all seven widths, on load IA alone pressed, 6 shown all IA; at 1200 Tab x14 + Enter → Venture Building 4; Tab x1 + Enter → Startup 1.
 DW4: scripts off 1200 and 375: 0 chip, 11 of 11 posts with a box, same column x/width as with scripts, caption link 181x20 (launcher display none, as on every page without scripts).
 AUTO-3 red run (render-red.txt): scratch copy of the tree with `git show 17f0a00:assets/js/blog.js`, served on 127.0.0.1:4174 → exit 1, 16 FAIL (7 « chips [Tous, …] », 7 « on load pressed [Tous], shown 11 of 11 », 2 keyboard lines); layout lines stay ok. Product tree untouched (same TREE before and after).
 Captures looked at by the Coder: the five files above.

## MANUAL TEST GUIDE
Setup: nothing to do; three pictures are sent in the conversation (page Publications of the local site, not published).
1. MANUAL-1 — Do: look at picture 1 (computer, « IA » selected), picture 2 (computer, after choosing « Venture Building ») and picture 3 (phone). Expect: on computer the three cards on the left (one third), the blog on the right (two thirds), no « Tous » button, only the articles of the chosen theme; on phone the three cards first, then the blog. Answer « ok » or say what to change.


## Audit fixes to implement — 2026-10-12
BLOCKING_STATUS: NON_BLOCKING (no Tier 1; one Tier 2, so no GREEN at contact 1)
READINESS: READY_WITH_FIXES
REASON: Done When 1–4 are all met on the auditor's own runs, but the single tall `.reveal` section leaves the first screen blank at load on short phone screens where 17f0a00 showed the heading.
NATIVE CHECKS: `node tools/check.mjs --all` PASS (exit 0, 16 pages, both executed tests PASS) · `node tools/version.mjs --check` PASS · `node tools/shell.mjs --check` PASS · `git diff --check 17f0a00` PASS · `grep -c Tous assets/js/blog.js` PASS (0) · marker command PASS (`IDENTIQUE 5299`) · `git diff 17f0a00 -- assets/css/style.css` PASS (one hunk `@@ -551,0 +552,6`, no line removed or changed)
SCOPE: CLEAN — wrapper, six CSS lines, `blog.js` without « Tous », `?v=` stamps: all requested by PLAN § 53; `.measure` dropped from three elements of the page = requested (Work 2).
COVERAGE: 18/18 changed files read — skipped: none (15 of them are one stamp line each, read in the diff: 15 identical `style.css?v=36f36f6d` → `42ed7c26` pairs)

### A-001 | Tier 2 | MEDIUM | `publications/index.html:77`
- issue: the two former `.reveal` sections are now ONE `.reveal` section about 2 660 px high in one column, and `site.js` shows a block only once 8 % of its height is on screen (`threshold: 0.08`, bottom margin −8 %), so at load, JavaScript on, motion allowed, no scroll, the whole section stays at opacity 0 and the screen under the hero is blank until a 40–120 px scroll — measured blank band: 375×635 = 252 px (40 % of the screen), 375×553 = 170 px, 360×640 = 226 px, 320×568 = 154 px; unchanged after a 6 s wait; 17f0a00 shows « À lire et à suivre » and the top of the first card at all four sizes (captures `head-` / `base-firstscreen-375x635.png`); invisible in the MANUAL-1 captures, which are full-page and taken after a scroll through the page.
- fix: make the reveal of the first block independent of the height of the whole two-block section, layout untouched — option with the auditor's reco: take `.reveal` off this one section (content always shown, as with reduced motion; the fade-in on this page goes: owner/Planner veto); alternative that keeps the fade: `.reveal` on smaller units (for instance the two `.section__head`, or head + list separately); NOT enough: `.reveal` moved to the two column blocks (measured on a scratch copy: still hidden at 375×553 and 320×568).
- test: headless Chrome, scripts on, `prefers-reduced-motion: no-preference`, `/publications/` loaded and NOT scrolled (no page walk before measuring): at 375×553, 375×635, 360×640 and 320×568 the h2 « À lire et à suivre » and all its ancestors are at opacity 1, and at 1200×900 both columns are shown; red = the same probe on d200a53 reports the section hidden; then Done When 1–4 re-run green (scripts off still 11 posts) and the three MANUAL-1 views keep the same layout.

Auditor notes, advisory only (Tier 3, no action needed for green, outside the fixes):
- Done When 2–4 re-rendered by the auditor with an own script (not `render.mjs`): 1440/1200/961 two columns (tops equal, blog = 2.000 × cards, no overlap, nothing leaving its column), 960/768/375/320 one column, no right edge past the emulated width, launcher 0.5625, ▶ 38×38; chips IA / Venture Building / Startup, 6 → 4 → 1 by real Tab + Enter/Space and by mouse, re-activation never empties, never 11 and never 0; scripts off 1200 and 375: no chip, 11 posts, same tracks, BCI caption link on screen and top-most. Detectors proven alive on a run-time mutation. `blog.js` branches the page cannot reach today, re-run on a mutated list: one tag → no chip and 11 posts; IA absent → Venture Building selected; unknown tag → chip appended last. Outside requests: 0.
- Backlog for the Planner (pre-existing class, `site.js` is outside this Pass's bounds): a `.reveal` block higher than 11.5 screens can never reach 8 % and would stay invisible with scripts on; today's section is 2 545 px at 568×320 against a 3 680 px limit, and the list grows with the feed.
- Root `PLAN.md` § 53 heading already reads « Status Done » (uncommitted root edit) while this review is contact 1: it must describe the real state when it is committed.
- Auditor scratch (scripts, logs, captures, base and variant copies): session scratchpad `auditor-p53\`; nothing written in the product tree except this section and the verdict below.

```json
{
  "token": "25b9a76e",
  "verdict": "FIX",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check 17f0a00", "result": "PASS"},
    {"cmd": "git diff --stat 17f0a00 -- . ':(exclude).WIP' (18 files: 3 sources + stamp lines only)", "result": "PASS"},
    {"cmd": "git diff -U0 17f0a00 -- assets/css/style.css (one hunk -551,0 +552,6, nothing removed)", "result": "PASS"},
    {"cmd": "grep -c Tous assets/js/blog.js (0)", "result": "PASS"},
    {"cmd": "marker command of prompts/pass53-coder.md (IDENTIQUE 5299)", "result": "PASS"},
    {"cmd": "P48_BASE=http://127.0.0.1:4173 node auditor-p53/audit.mjs geom chips nojs (own render: 7 widths scripts on, chips by keyboard and mouse, scripts off at 1200 and 375; 0 failing, 0 outside requests)", "result": "PASS"},
    {"cmd": "P48_BASE=http://127.0.0.1:4173 node auditor-p53/audit.mjs red edge (detectors see a run-time mutation; blog.js one-tag, IA-absent and unknown-tag branches)", "result": "PASS"},
    {"cmd": "node auditor-p53/firstscreen.mjs on d200a53 (4173) and on a 17f0a00 export (4175): at load without scroll, section hidden at 375x635, 375x553, 360x640, 320x568 on d200a53, shown on 17f0a00", "result": "FAIL"}
  ],
  "opened_fix_section": true
}
```

AUDIT r1 COST: 180,156 tokens / 11 min 15 s (first leg, cut by the session usage limit before any verdict) then 209,966 tokens / 5 min 0 s reported at the end of the resumed leg; verdict FIX (A-001, Tier 2)
INVOCATION: a629bb2a177b4598e (same auditor resumed with the same brief and token after the cut)
USAGE BASIS: unknown (Agent completion notices `subagent_tokens`; whether the second figure includes the first is not stated)

## CHANGED r2
- `publications/index.html:77`: `class="section reveal"` → `class="section"` (A-001, the reviewer's recommended option: the two-block section is always shown; the fade-in on scroll is gone on this page only). Product commit 1166b7a.
- Evidence: `.WIP/pass-loop-p53/evidence/firstscreen.mjs` (new), render.txt and the five captures rewritten by the re-run.

## TEST-RESULTS r2
TREE: ca6687727cd211b3
CMD: `node .WIP/pass-loop-p53/evidence/firstscreen.mjs` exit 0; `node .WIP/pass-loop-p53/evidence/render.mjs` exit 0; `node tools/check.mjs --all` exit 0; `node tools/version.mjs --check` 0; `node tools/shell.mjs --check` 0; `git diff --check 17f0a00` 0; `grep -c "Tous" assets/js/blog.js` 0; marker command `IDENTIQUE 5299`
RESULT: PASS — A-001 test green, Done When 1–4 green again (render: failing checks 0, outside requests 0; 16 pages).
NOTES: firstscreen, loaded and not scrolled, scripts on, motion allowed: 375x553, 375x635, 360x640, 320x568 and 1200x900 → both h2 and every ancestor at opacity 1 (first h2 top 413–465 px). Red run: the same script on the d200a53 page (scratch copy, 127.0.0.1:4174) → exit 1, the four phone sizes FAIL (both h2 hidden), 1200x900 ok.
 Scope still: outside the three source files, 0 non-`?v=` changed line since 17f0a00. Layout of the three owner views unchanged (same capture sizes 1200x2301, 1200x2034, 375x3904; render geometry identical).


## Auditor confirmation r2 — delta after A-001 (contact 2 of 2, same auditor)
- Delta read: `git diff d200a53 1166b7a` = one file, one line, `publications/index.html:77` `class="section reveal"` → `class="section"`; tree clean on 1166b7a; the server on 127.0.0.1:4173 serves the tree's bytes.
- A-001 test, auditor's own probe (loaded, not scrolled, scripts on, motion allowed): 375×553, 375×635, 360×640, 320×568 → « À lire et à suivre » and the first card at opacity 1 on screen, no element under opacity 1 in the section; 1200×900 → both headings and both columns on screen; extras 360×672, 568×320, 960×540, 1366×650 also shown. Red, same probe on a d200a53 export (scratch, 127.0.0.1:4175): the four phone sizes hidden, 1200×900 ok. The Coder's `firstscreen.mjs` gives the same two results (exit 0 on 1166b7a, exit 1 with 4 failing sizes on d200a53). Viewport captures looked at: 375×635 and 1200×900.
- Done When 1 re-run: `check.mjs --all` 0 (16 pages, both executed tests PASS), `version.mjs --check` 0, `shell.mjs --check` 0, `git diff --check 17f0a00` 0, `Tous` count 0, marker `IDENTIQUE 5299`, CSS diff one added hunk, 0 non-stamp changed line outside the three sources.
- Done When 2–4 re-rendered with the auditor's script: 179 checks ok, 0 failing, 0 outside requests; every measured line identical to round 1 (only the section's class name differs); scripts off still 11 posts and no chip. Captures: 6 of 7 byte-identical to round 1 (1200 IA, 375, both scripts-off, 961, 960); the 1200 « Venture Building » one has the same size 1200×2034 and differs only inside the video thumbnail (max channel difference 6 of 255, resampling noise; the Coder's file is byte-identical to round 1). The three MANUAL-1 views keep the same layout.
- A-001: fixed. No Tier 1 or Tier 2 issue introduced by the delta.
- Advisory, no action needed for green: the fade-in on scroll is gone on Publications only (the option chosen; owner/Planner veto stays open) — worth one line in the closure notes; the two round-1 advisory notes (reveal threshold versus block height in `site.js`, root `PLAN.md` § 53 status) are unchanged.

```json
{
  "token": "300cc83f",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "git diff d200a53 HEAD (one file, one line: publications/index.html:77 class section reveal -> section; tree clean on 1166b7a)", "result": "PASS"},
    {"cmd": "P48_BASE=http://127.0.0.1:4173 node auditor-p53/firstscreen2.mjs (own A-001 probe, no scroll: 375x553, 375x635, 360x640, 320x568, 1200x900 all shown; 0 failing, 0 outside requests)", "result": "PASS"},
    {"cmd": "P48_BASE=http://127.0.0.1:4175 node auditor-p53/firstscreen2.mjs on a d200a53 export (red run reports the 4 phone sizes hidden, as expected, exit 1)", "result": "PASS"},
    {"cmd": "P48_BASE=http://127.0.0.1:4173 node .WIP/pass-loop-p53/evidence/firstscreen.mjs (Coder's script, exit 0, failing sizes 0; exit 1 with 4 failing sizes on the d200a53 export)", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check 17f0a00", "result": "PASS"},
    {"cmd": "git diff --stat 17f0a00 -- . ':(exclude).WIP' (18 files; 0 non-stamp changed line outside the 3 sources; CSS one added hunk)", "result": "PASS"},
    {"cmd": "grep -c Tous assets/js/blog.js (0)", "result": "PASS"},
    {"cmd": "marker command of prompts/pass53-coder.md (IDENTIQUE 5299)", "result": "PASS"},
    {"cmd": "P48_BASE=http://127.0.0.1:4173 node auditor-p53/audit.mjs geom chips nojs (Done When 2-4: 179 ok, 0 failing, 0 outside requests; measured lines identical to round 1)", "result": "PASS"},
    {"cmd": "sha256sum and python pngdiff.py round-1 vs round-2 captures (6 of 7 byte-identical; 1200 Venture view same size, differs only inside the video thumbnail, max channel delta 6)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: 244,914 tokens / 7 min 8 s reported at the end of the confirmation leg; verdict GREEN
INVOCATION: a629bb2a177b4598e (same auditor, resumed)
USAGE BASIS: unknown, probably cumulative over the three legs (180,156 then 209,966 then 244,914; Agent completion notices `subagent_tokens`)

## CLOSURE
UNIT: p53
DOCS: root PLAN.md section 53 status token Done, MANUAL-1 ticked on the owner's ok (before the brief), evidence pointer; root ARCHITECTURE.md blog.js clause; root PROGRESS.md (Done, Current Objective, Next Action, Last Verification, Known minor issues); root CHANGELOG.md one entry. PRD and README untouched (Planner-only).
MIGRATED: final AUTO evidence (r2), review verdicts and costs, the owner's ok and the two consequences shown to him went to root PROGRESS.md Last Verification (Pass 53); the owner-readable summary to root CHANGELOG.md.
NITS: root PROGRESS.md Known minor issues, line P53 (fade-in gone on Publications, reveal threshold depends on block height in site.js, half gap between the two blocks in one column, first cards not aligned across columns)
COMMIT: 1166b7a
