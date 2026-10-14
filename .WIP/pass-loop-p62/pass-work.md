# Pass p62 — Accueil — Démarche en texte (PLAN § 62)

Opened 2026-10-14. Root Planner inputs saved 4b92abe. Pass base (product) 0ab46871ac4c7c9a945aba4e428d3e53123e4205.
Models: work = claude-opus-5-5 (session, runtime-declared by the app; effort not exposed = unknown). Reviewer: inherited defaults, no launch control for model/effort exposed (PROGRESS Model restriction exception); recorded as unknown.
Servers: 4173 = the product tree (existing 127.0.0.1 server, pid 77520, not started by this Pass, reused). 4174 = scratch copy of 0ab4687 (`git -c core.autocrlf=false archive`) in the session scratchpad, with `.WIP/mockup-v12/` copied in (mockup reference served on the 0ab4687 stylesheet), bound 127.0.0.1. 4175 unused unless said.

## SLICE
PLAN § 62 Work 1–3: `index.html` `#demarche` ol.chevrons (4 dépliants) → mockup `ol.dm-steps` + `div.dm-deliv` (approved wording, no emoji); `style.css` :970–980 `#demarche .chevron*` → the `demarche-1` rules of `previews/v12/index.html` :134–157 under one comment; `node tools/version.mjs`. Section keeps `section.section.reveal#demarche` and its `section__head`; `.m-demarche` not ported.
Size: one turn (about 35 active minutes): static markup + CSS, P61 proof scripts copied and retargeted. No split.
Gates: none (no money/auth/migration path). Expected tests written and seen red on 0ab4687 before any site edit.
MANUAL: none for this Pass (owner decision 2026-10-13, PLAN § V1.2 MANUAL-V12: he reviews everything once after Passes 61, 62, 59, 60). Acceptance order standard: AUTO → one full audit → close.
LIVE-SAFE: no live system touched (127.0.0.1 + Google Fonts only).

## EXPECTED TESTS
- AUTO-1 (DW1) `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check` — expect exit 0 each; `git diff --stat 0ab4687 -- . ':(exclude).WIP'` = index.html, assets/css/style.css + `?v=` lines only; `git grep -n chevron -- . ':!.WIP'` prints nothing (exit 1).
- AUTO-2 (DW2) `node .WIP/pass-loop-p62/evidence/render.mjs` part « text »: text of `#demarche` (tags removed, white space collapsed) = text of the mockup section `previews/v12/index.html` :403–422 read the same way; 0 `details` in `#demarche`; 0 emoji in `#demarche`.
- AUTO-3 (DW3) same script, home at 1200, 960, 375, scripts on (scrolled to, `is-visible` waited) and off: every text node of `#demarche` visible by its own box in the viewport once scrolled to; stage tops: 1 row of 4 at 1200, 2 rows of 2 at 960, 4 rows at 375; no element right edge past the layout width (also at 961 and 641); every text ≥ 4.5:1 against the worst pixel behind it (painted-pixel count > 0 per run).
- AUTO-4 (DW4) `node .WIP/pass-loop-p62/evidence/mock-compare.mjs`: computed styles mockup `.m-demarche` vs port `#demarche`, pseudo-elements included, at 1920, 1200, 960, 375 — expect 0 differences except ones named with a reason (section `reveal`/class/id only).
- AUTO-5 (DW5) render part « outside », « others » against baseline.json written on 0ab4687: home boxes above `#demarche` equal, below shifted by exactly the `#demarche` height delta (1200, 375); `#experience` heights 906.9/898.5/1394/1569.2 at 1200/961/960/375 unchanged; nine other shell pages keep section heights; no script error on the ten pages.
- AUTO-6 (DW6) the same render on the 0ab4687 scratch copy (baseline run) reports dépliants in `#demarche` (red): run kept as `render-red-0ab4687.txt`.
- AUTO-7 (DW7) review GREEN within 2 contacts; captures `demarche-1200.jpg`, `demarche-960.jpg`, `demarche-375.jpg` kept.
Changed files and who runs them: `index.html`, `assets/css/style.css` (check.mjs census/a11y/nojs + render + mock-compare); the 15 other pages' `?v=` lines (check.mjs + version.mjs --check; render « others » on the nine other shell pages; the six redirect stubs carry a `?v=` stylesheet line too, rewritten by version.mjs, read by check.mjs, not rendered). No changed file left unrun.

## CHANGED
- `index.html`: comment of section 5; `#demarche` ol.chevrons (4 details) → mockup `ol.dm-steps` + `div.dm-deliv` (bytes copied from `previews/v12/index.html` :407–420 by `port.py`, session scratchpad).
- `assets/css/style.css`: :970–980 (`#demarche .chevron*`, 11 lines) → `demarche-1` rules (23 lines, copied from the mockup's `<style data-direction="demarche-1">`) under one comment.
- `?v=` stamps on the 16 pages by `node tools/version.mjs` (43 references).
- Root (docs repository, outside this seal): PLAN § 62 status token Done + evidence pointer.

## TEST-RESULTS r1
TREE: a362f70812cba61f
CMD: `node tools/check.mjs --all` exit 0 (16 pages, three executed tests PASS) · `node tools/version.mjs --check` 0 (43 references) · `node tools/shell.mjs --check` 0 (10 pages) · `git grep -n chevron -- . ':!.WIP'` exit 1 (nothing) · `git diff --stat 0ab4687 -- . ':(exclude).WIP'` 17 files, 53+/75- (index.html, style.css, 15 `?v=` lines)
CMD: `node .WIP/pass-loop-p62/evidence/render.mjs` (P48_BASE 4173 = the tree) exit 0 — 162 checks, failing 0 (evidence/render.txt)
CMD: `node .WIP/pass-loop-p62/evidence/mock-compare.mjs` exit 0 — 20 differences, all five `transition-*` properties of the section element itself at each of 4 widths (evidence/mock-compare.txt)
RESULT: PASS — DW1 exits 0; DW2 text 896/896 chars equal (files and rendered), 0 details, 0 emoji; DW3 38/38 text nodes visible at 1200/960/375 scripts on and off, rows [4] / [2,2] / [1,1,1,1], 0 elements past the width at 1200, 961, 960, 641, 375, worst contrast 4.77:1 (stage labels teal-dark on grey-50), muted lines 7.53:1, numbers 5.08:1; DW5 196/187 outside boxes = 0ab4687, `#demarche` 710.5 → 832.6 at 1200 (+122.1), 804.9 → 1509.3 at 375 (+704.4), `#experience` 906.9/898.5/1394/1569.2 unchanged, nine pages × 2 widths equal, 0 script errors.
NOTES: DW6 red run (P62_BASELINE=write on the 0ab4687 copy, port 4174): 26 of 120 checks FAIL — 4 details (4 closed), 19 emoji, 0 dm-step; 9 of 24 text nodes visible (the 15 inside closed details: boxes in view but not topmost, checkVisibility false); method lines 0 painted pixels (evidence/render-red-0ab4687.txt). DW4: the only differences are the section's `.reveal` transition (Planner decision 2: `#demarche` keeps `.reveal`; the mockup section has none); 182 of 183 elements and pseudo-elements identical at 1920/1200/960/375, 0 boxes differ. Mock served on the 0ab4687 stylesheet (scratch copy, 4174).

AUDIT r1 INVOCATION 1: interrupted by the owner at launch (2026-10-14), not-started: no reviewer scratch folder, no verdict in this file; seal unchanged a362f70812cba61f. Owner then said « run the review now »: same reserved brief and token handed to one fresh auditor (no new contact booked).

## Review contact 1 of 2 — fresh auditor (code-audit phase-gate), 2026-10-14
Verdict GREEN. Coverage 17/17 changed product files read (index.html and style.css in full diff; the 15 other pages = one `?v=` line each, checked by `git diff -U0`); root PLAN.md diff = status token + one evidence line only. Scope: CLEAN (no unrequested change). Native: check.mjs --all, version.mjs --check, shell.mjs --check exit 0; chevron and m-demarche greps exit 1. Port markup and CSS byte-identical to mockup :405-421 / :135-157 (only the comment differs). Own 0ab4687 export (git -c core.autocrlf=false archive) on 127.0.0.1:4175 (stopped after use): red run fails as expected (4 closed details, 19 emoji), own baseline.json identical to the session's; render.mjs on the tree 162 checks 0 failing; own probe (every line box of 38 text nodes in viewport and topmost at 3 points, 1200/960/375/360x640/320x568, scripts on and off; right edges at 17 widths 320-1920; pixel contrast min 4.77 teal-dark stage labels on grey-50, peak rendered ink equals the declared ratio) all pass; mock-compare: only the section's .reveal transition differs, boxes 0 differences.
Tier 3 advisories (no fix needed for this Pass): PRD.md « Démarche et outils » body (:179) still describes a vertical path with dépliants while PRD :95 records the 2026-10-13 choice and the index.html comment cites « PRD §5.1 » for the new layout (doc hygiene); PLAN § 62 already reads Done and cites PROGRESS Last Verification (Pass 62), which closure must still write; from 641 to about 1030 px the « Livrables types » grey box spans edge to edge (as in the approved mockup).

```json
{
  "token": "090ecc6d",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --stat 0ab4687 -- . ':(exclude).WIP' (17 files: index.html, style.css, 15 ?v= lines only)", "result": "PASS"},
    {"cmd": "git grep -n chevron -- . ':!.WIP' (exit 1); git grep -n m-demarche -- . ':!.WIP' (exit 1)", "result": "PASS"},
    {"cmd": "diff mockup previews/v12/index.html markup and demarche-1 rules against index.html #demarche and style.css :971-993", "result": "PASS"},
    {"cmd": "P62_BASELINE=write node render.mjs on own git archive of 0ab4687 at 127.0.0.1:4175 (red run reports 4 closed details)", "result": "PASS"},
    {"cmd": "node render.mjs on 127.0.0.1:4173 with own baseline (162 checks, 0 failing)", "result": "PASS"},
    {"cmd": "node own.mjs vis/width/contrast and own-short.mjs at 320x568 and 360x640, scripts on and off", "result": "PASS"},
    {"cmd": "node mock-compare.mjs at 1920/1200/960/375 (only .reveal transition differs, 0 box differences)", "result": "PASS"},
    {"cmd": "git -C code-SOURCINNO_WWW diff -- PLAN.md (status token and one evidence line only)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 201,481 tokens, 12 min 19 s, GREEN
INVOCATION: a317a3783784d0ca8 · USAGE BASIS: whole-contact (Agent completion notice subagent_tokens; basis not stated by the tool)

## CLOSURE
UNIT: p62
DOCS: root PLAN § 62 status token Done + evidence pointer (before the review); root PROGRESS (Current Objective, Done, Next Action, Last Verification Pass 62, Known minor issues P62) and CHANGELOG (one entry) at closure; ARCHITECTURE, PRD and AGENTS unchanged (no contract changed, no new trap).
MIGRATED: test evidence, measures, the verdict with its cost, the declared differences from the mockup and the reviewer Tier 3 observations went to root PROGRESS (Last Verification Pass 62, Known minor issues P62); what shipped went to root CHANGELOG.
NITS: root PROGRESS Known minor issues P62
COMMIT: 6c4ebd508f3a5bd3cbb26e6efd3321adf306b23b
