# Pass p28 — Socle : coquille unique, navigation et libellés

## STARTUP
- Root Planner inputs saved as 68a8c27 (8 paths: PLAN, PROGRESS, CHANGELOG, README, PRD, AGENTS, prompts/pass28-coder.md, prompts/rework-brief-20261009.md). Deviation: AGENTS.md was also dirty (one Planner-written Gotcha line, port 4173, mtime 12:56 = same Planner session as the prompt at 12:54); judged a Planner input and saved with the others instead of stopping. outputs/ untracked, not staged.
- Product base ee37a688edf680acc102a15c6500a425a2680f3d (pass_base recorded by status.py), clean.
- Models: work = claude-opus-5-5 (session-declared), effort unknown (not exposed). Reviewer: inherited defaults (PROGRESS Model restriction exception); not runtime-verified.
- audit_launch_cap = 2, decisions-only, seal = whole product repository.

## SLICE
Size: one turn (~30–40 min). Matches PLAN § 28; no re-slice.
Measured before any write (`node <scratchpad>/probe.mjs`, `git ls-files --eol -- '*.html'`):
- EOL: every one of the 16 pages is LF in index AND worktree (`i/lf w/lf`), `index.html` crlf=0 lf=492, `service-venture-building/index.html` crlf=0 lf=223; no BOM; core.autocrlf=true, no .gitattributes. shell.mjs still detects per page and writes back with that page's EOL.
- 16 pages = 10 shells + 6 stubs (`http-equiv="refresh"`: ai-business.html, venture-building.html, offre-ia-business/, offre-strategie-organisation-processus/, offre-venture-building/, prototypes/). No .html in .WIP.
- Markers: each shell has exactly 1 `<header class="site-header">`, 1 `<footer class="site-footer">`, 1 `<noscript>` in `<head>`; service-ia-business has a 2nd `<noscript>` in `<main>` (line 219) — untouched.
- Header and footer byte-identical on the 10 shells today. `<noscript>` variants: 8 pages (index, 404, mentions, politique, portfolio, publications, strategie, venture) = reveal + dead form rules; contact = reveal only; IA = `.ia-video-launch { display:none; }` + reveal + dead form rules.
- Dead `.noscript-contact` CSS rule `assets/css/style.css:431` stays for Pass 37 (not this slice).
- Footer "Pages": PRD §2 says « colonne Pages (les six liens) »; current footer has five (no Expérience) → add `Expérience` (`/`) first to reach the menu's six destinations.
Work: tools/shell/{header,footer,noscript}.html + tools/shell.mjs (walk/SKIP/--check/exit codes as version.mjs; refuse on missing/duplicate marker, validate all pages before writing any); check.mjs STRUCTURE runs `shell.mjs --check` + noscript identity; header = Expérience · Services ▾ (2) · Venture Building · Publications · Portfolio · [Rendez-vous]; footer Pages ×6 + Rendez-vous; home hero button by hand; nav CSS only if measured overlap/wrap at 860–1000.
No MANUAL item: every check runs offline here (headless Chrome on localhost). LIVE-SAFE: no live system touched.

## EXPECTED TESTS
- AUTO-1 `node tools/shell.mjs --check` — expect exit 0 on closing tree.
- AUTO-2 scratch copy (`git -c core.autocrlf=false archive` of the closing tree outside the repo), one footer link removed from `contact/index.html`, `node tools/shell.mjs --check` — expect exit 1 naming `contact/index.html`; `node tools/check.mjs` on that copy — expect exit 1 (shell + identity). Also: duplicate `<header class="site-header">` in one page of a copy → default run exit 1 naming it, no page written (hash of the tree unchanged); stub page skipped and counted in the output line.
- AUTO-3 copy with noscript edited in one page (no header/footer change) → `check.mjs` exit 1 (noscript identity + shell check).
- AUTO-4 `node tools/check.mjs --all` — expect exit 0, 16 pages, both test PASS lines; `--nojs` on index.html after first stamp exit 0 before stamping the rest.
- AUTO-5 `grep -rln "Prendre rendez-vous" --include=*.html . | grep -v "^./.WIP"` empty; `grep -c "Rendez-vous" index.html` ≥ 3.
- AUTO-6 PLAN Done When 3 node one-liner prints `10`.
- AUTO-7 `grep -c "<h2>Pages</h2>" index.html` = 1; `grep -rc "<h2>Services</h2>" --include=*.html . | grep -v ":0" | grep -v .WIP` empty.
- AUTO-8 headless Chrome on localhost at 1200/1000/900/880/375: last nav item right < button left, all items same offsetTop at ≥ 900 (and 880); mobile menu order Services → Venture Building → Publications; `aria-current="page"` on Venture link at /service-venture-building/, Services summary without it; captures in evidence/.
- AUTO-9 `node tools/version.mjs --check` exit 0; `git diff --check` exit 0; `git diff --quiet 670f72f HEAD -- .github/` exit 0; `git diff --stat` shows stamped pages changed only in their regions (no whole-file rewrite).
Changed files vs coverage: tools/shell.mjs, tools/shell/*.html (AUTO-1/2/3), tools/check.mjs (AUTO-2/3/4), 10 pages (AUTO-4..8), style.css if touched (AUTO-8 + version). None uncovered.
MANUAL: none for this Pass (all checks driven by the session).

## CHANGED
- NEW tools/shell.mjs (walk/SKIP/--check/exit codes copied from version.mjs; validates every page before writing any; per-page EOL), tools/shell/header.html, footer.html, noscript.html (extracted from index.html ee37a68 by script, then edited).
- tools/check.mjs: STRUCTURE item 2 also compares the head `<noscript>`; item 7 runs `shell.mjs --check` (same execFileSync/note/fail pattern as version); header comment line.
- 10 shell pages stamped (header/footer/noscript only) + index.html hero button "Rendez-vous" by hand. `git diff --stat`: 10–16 lines per page = stamp, not rewrite; all pages still LF.
- No CSS change: nav measured fitting at 1200/1000/900/880/861 (below). No JS change, so no version restamp needed (`version.mjs --check` exit 0).
- Root (not sealed): PLAN § 28 status Done + pointer; AGENTS Commands line + Gotchas (shell source replaces "duplicated header/footer" line; nav width at 861).
- Noted, not done: dead `.noscript-contact` rule `assets/css/style.css:431` stays for Pass 37. Footer "Pages" gains Expérience (`/`) to make the PRD's six links.

## TEST-RESULTS r1
TREE: 7068ab07a9c2ce82
CMD: `node tools/check.mjs --all` exit 0 (16 pages, 10 shells + 6 stubs, SHELL + VERSIONS lines, both test PASS lines); `node tools/shell.mjs --check` exit 0; `node tools/version.mjs --check` exit 0 (40 refs); `git diff --check` exit 0; `git diff --quiet 670f72f HEAD -- .github/` exit 0
RESULT: PASS — Done When 2: `grep -rln "Prendre rendez-vous" --include=*.html . | grep -v "^./.WIP"` empty, `grep -c "Rendez-vous" index.html` = 3; DW3 one-liner prints 10; DW4 `<h2>Pages</h2>` = 1 on index, Services-h2 grep empty.
NOTES: `--nojs` ran on a fully stamped scratch copy (scratchpad try1, `git -c core.autocrlf=false archive HEAD` + new tools) before the real tree was stamped: exit 0; second run on the copy rewrote 0 pages (idempotent).
Mutation ledger (`node <scratchpad>/mutate.mjs <product> <scratchpad>/ledger1`, each on its own copy, .git/.WIP excluded; control: shell --check 0, check --all 0):
- M1 Publications link removed from contact footer: `shell.mjs --check` 1 naming contact/index.html; `check.mjs` 1 (identity + coquille).
- M2 doubled header marker in publications + drifted contact: default run 1 "marqueurs invalides — aucune page ecrite", tree hash unchanged. M2b head noscript removed (portfolio): 1, "trouve 0 fois", tree unchanged.
- M3 head noscript edited in 404 only: shell --check 1; check 1. M3b same with shell.mjs neutralised: check 1 from the new noscript identity alone.
- M4 mentions-legales converted to CRLF + footer drifted: default run restamps 1 page, page stays all-CRLF (154/154), --check 0 after.
- Hero label restored to "Prendre rendez-vous" on the control copy: DW2 grep prints ./index.html.
Rendered (headless Chrome via `.WIP/pass-loop-p28/evidence/render.mjs`, server already listening on 127.0.0.1:4173 = this working tree, `curl | cmp index.html` identical; reused, not restarted): results `evidence/captures/render-result.json`.
- 1200/1000/900/880/861: innerWidth = width, rAF fired, no overflow, burger hidden; gap Portfolio→button 24 px at every width; vertical centres 38/37.5/38/38/38/38.5 (one row; offsetTop 24/19/24/24/24/16 differs only by item height, align-items:center); no label wraps; logo→first item 341/167/67/47/28 px; button right 1149/961/861/841/822 < width.
- /service-venture-building/ 1200: top-level link aria-current="page", Services summary none, dropdown has no Venture link. 375 menu open: Expérience, Services, Venture Building (aria-current), Publications, Portfolio, Rendez-vous, each inside viewport and topmost.
- Footer 1200: headings Pages, Contact; Pages = Expérience, Stratégie & Transformation, Entreprise IA, Venture Building, Publications, Portfolio; CTA Rendez-vous.
- Captures (8): header-home-{1200,1000,900,880,861}, header-venture-1200, menu-venture-375, footer-home-1200. Inspected by eye: 861, menu 375, footer 1200; others rest on measurements.

## Auditor contact 1 of 2 — p28 — Greenlight (Tier 3 advisory only, no fix section)
Phase-gate, product `rebuild` @ ee37a68 + uncommitted (11 tracked files 79+/80-, 4 untracked = brief's measured block; no disagreement). Pages changed only inside header/footer/head-noscript regions + index hero button (region-strip compare vs ee37a68: 0 other diffs). SCOPE: CLEAN (Expérience footer link = PRD §2 "six liens"; dead noscript form rules dropped = A-006 intent, declared in CHANGELOG; partial = contact variant + IA line, behaviour-equivalent to PLAN Work 1 wording).
Receipts: shell --check exit 0 (10 shells, 6 stubs); check.mjs --all exit 0 (16 pages, 305 links, both test PASS); version --check exit 0 (40 refs); git diff --check 0; .github vs 670f72f 0; nothing staged (product, root). DW2/3/4 commands: empty / 3 / 10 / 1 / empty. Auditor mutation ledger 12/12 on scratch copies (footer link removed in contact -> exit 1 naming contact; noscript edit -> check.mjs "<noscript> du <head> different"; header drift 404; missing marker -> exit 1, zero writes; doubled head noscript; CRLF page preserved; partial edit -> 10 drifted, stamp, check ok, IA main noscript kept; idempotent; new unmarked page refused). Own headless-Chrome probe at 1300/1200/1000/900/861 on /, /service-venture-building/, /contact/: one row, gaps 24 px, no overlap, no h-scroll; aria-current VB only on its page; Services+IA on IA page; 375 menu order Expérience|Services|Venture Building|Publications|Portfolio|Rendez-vous; footer Pages(6)+Rendez-vous.
Outside the product seal (root repo, not sealed): PLAN.md §28, AGENTS.md Commands+Gotchas, CHANGELOG.md (+4, written 13:46:33, after the brief 13:46:22, not named in brief SCOPE) — diffs read, content matches the tree.
Tier 3 advisory (non-blocking, no re-review needed):
- T3-1 `tools/shell.mjs` model(): a partial saved with a UTF-8 BOM makes every stamp insert one more U+FEFF before each region and --check never goes green (reproduced on scratch: 2 BOMs after 2 runs). Fail-closed; strip `^﻿` in model().
- T3-2 `tools/shell.mjs` SKIP mirrors check.mjs (no `.WIP`); `check.mjs` item 7 execFileSync has no timeout and, like item 6, records no failure if it throws with empty output. Fold into A-007 (Pass 37).
- T3-3 PLAN §28 "Status Done" and CHANGELOG were written before this verdict and point to "PROGRESS Last Verification (Pass 28)", which does not exist yet (PROGRESS.md mtime 12:53, line 7 still "not started"): closure must write it.
- T3-4 Root `.git/FETCH_HEAD` written 2026-10-09 13:36:17 (no ref change, nothing pushed), before root commit 68a8c27 (13:39:04) and the pass loop (state.json 13:39:10); likely `git_sync.py fetch --prune`. Closure receipts must not claim "nothing fetched" for the session.
- T3-5 AGENTS gotcha "Six items + button ... 28 px at 861": the header has 5 items + button; measured 24-29 px by page.

```json
{
  "token": "81878fd1",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check && git diff --quiet 670f72f HEAD -- .github/ && git diff --cached --quiet", "result": "PASS"},
    {"cmd": "grep -rln 'Prendre rendez-vous' --include=*.html . | grep -v ^./.WIP (empty); grep -c Rendez-vous index.html (3)", "result": "PASS"},
    {"cmd": "PLAN 28 Done When 3 node -e header/dropdown probe (prints 10)", "result": "PASS"},
    {"cmd": "grep -c '<h2>Pages</h2>' index.html (1); grep -rc '<h2>Services</h2>' --include=*.html . | grep -v :0 | grep -v .WIP (empty)", "result": "PASS"},
    {"cmd": "node scratchpad/scripts/mut.mjs <copy> <runs> (12/12 shell mutations incl. footer link removed from contact/index.html)", "result": "PASS"},
    {"cmd": "node scratchpad/scripts/probe.mjs (headless Chrome 1300/1200/1000/900/861/375, aria-current, mobile order, footer)", "result": "PASS"},
    {"cmd": "node -e region-strip compare of 10 pages vs ee37a68 (0 diffs outside header/footer/head-noscript + hero line)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 139416 tokens, 7 min 35 s, GREEN
INVOCATION: pass-auditor subagent (id kept in the session only) | USAGE BASIS: whole-contact (Agent completion notice)

## CLOSURE
UNIT: p28
DOCS: root PLAN § 28 status Done + pointer (before review); AGENTS Commands + Gotchas (shell source, nav width; T3-5 wording corrected after GREEN, root doc outside the product seal); PROGRESS Current Objective/Done/Next Action/Last Verification/Known minor issues; CHANGELOG one entry. No PRD/README/ARCHITECTURE edit (ARCHITECTURE line for tools/shell.mjs left to the Planner).
MIGRATED: final native results, mutation ledger, rendered measurements, verdict and contact cost -> PROGRESS Last Verification (Pass 28); summary -> CHANGELOG 2026-10-09.
NITS: reviewer T3-1..T3-5 -> PROGRESS Known minor issues (P28 reviewer observations).
COMMIT: bb090e243657679c35ff6699af9e9bc0b98b3202 (product work, LOCAL ONLY, not pushed)
