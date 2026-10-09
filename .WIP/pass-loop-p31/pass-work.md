# Pass p31 journal — Accueil — expérience : frise verticale et cartes

## STARTUP
- Root Planner inputs saved: 694adea "Save approved P31 Planner inputs locally" (PLAN, PRD, PROGRESS, README, prompts/pass30-coder.md deleted, prompts/pass31-coder.md added). outputs/ untracked, not staged.
- Opening baseline: product rebuild b2753525f71b5d667bb1458bb6d50f7b6dea2b3e, clean; root main 694adea (after the Planner-inputs commit; f79123a before it). No other in-flight Pass.
- Models: work = this session, declared claude-opus-5-5 by the environment, effort not exposed (unknown). Auditor = fresh pass-auditor subagent, inherited settings, model/effort not exposed (unknown). PROGRESS Model restriction exception applies; independent review still mandatory.
- Owner vetoes: none received in the launching message → D6 (sentence-case h2) and D7 (emoji removed from the five card titles) both applied; Done When 2 kept in full.
- Server: 127.0.0.1:4173 LISTENING pid 44640 (`python -m http.server 4173 --bind 127.0.0.1`), `curl` of index.html and style.css `cmp`-identical to this tree → reused.

## SLICE
One plan slice, PLAN § 31 Work 1–2, about one turn (≈30 min): markup + CSS only on the home `#experience` block and the `#references` h2.
- Markup: `ol.timeline` with five plain `li` (period `.timeline__when`, company `.timeline__what`, former tooltip sentence moved verbatim into `.timeline__text`); no button, no `aria-describedby`, no `role="tooltip"`, no tip id → nothing focusable in the timeline. Five card h3 lose their leading emoji (keyword capitals kept). h2 « +25 ans d’expérience » / « Entreprises accompagnées » (U+2019). Section comment updated.
- CSS: one vertical `.timeline` (dot per `li`, a line segment per `li` from its dot to the next dot, independent of item heights); `.timeline--h*`, `.timeline__tip`, hover/focus scales and the 860 px timeline block deleted. `#experience`: `.grid--2` overridden under `#experience` only (timeline narrower column, cards wider); panel one card per row at every width; closed-height match by ONE shared row unit (`--xp-row`) used as min-height by each timeline `li` and each closed card summary, same gap in both columns, timeline top-aligned (not stretched, items not spread) so opening a card moves nothing on the left. ONE breakpoint (≤ 960 px) switches to one column and drops the row floor; the 640 px `#experience` line and the 960 px panel line deleted; `min-height: 210px` deleted. `node tools/version.mjs`.
- Gates: none internal (presentation only, reversible). No money/auth/migration path → no mutation ledger needed.
- ACCEPTANCE: default audit-first. No MANUAL items for this Pass: every Done When criterion is driven offline by grep, the native suite and headless Chrome (real Tab through `Input.dispatchKeyEvent`, mouse click).
- Live checks: none (localhost only) → LIVE-SAFE contract not engaged.

## EXPECTED TESTS
- AUTO-1 DW1 greps (product folder) — expect: `grep -c "timeline--h\|timeline__tip\|aria-describedby\|role=\"tooltip\"" index.html` 0; `grep -c "timeline--h\|timeline__tip\|min-height: 210px" assets/css/style.css` 0; `grep -c '<ol class="timeline' index.html` 1; `grep -c '<details class="disclosure' index.html` 9; five-fragment grep 5.
- AUTO-2 DW2 greps — expect: h2 grep 2; emoji h3 grep 0.
- AUTO-3 DW3 rendered, `node .WIP/pass-loop-p31/evidence/render.mjs <captures> <profile> post` on 127.0.0.1:4173, motion no-preference — expect at 1200: timeline right < first card left; all closed |first li top − first card top| ≤ 8 and |last li bottom − last card bottom| ≤ 8; each of the five sentences a non-zero rect inside the viewport once scrolled to; opening card 3 moves no li top > 2 px; at 375: one column, timeline bottom ≤ first card top; no horizontal overflow at either width closed and all open; each card opens/closes by click and by real Tab then Enter; zero focusable elements inside `.timeline`. Captures saved.
- AUTO-4 DW4 — expect exit 0 each: `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check`, `git diff --quiet 670f72f HEAD -- .github/`.
- AUTO-5 pre-Pass captures at 1200 and 375 (`render.mjs ... pre`) before any product edit — expect: two captures + baseline geometry in render-result.json.
- Changed files vs coverage: `index.html` — reached by AUTO-1/2/3/4; `assets/css/style.css` — reached by AUTO-3/4; 16 pages' `?v=` stamps — reached by AUTO-4 (`version.mjs --check`, `check.mjs --all`). No survivor.

## CHANGED
- `index.html`: `#references` h2 sentence case; `#experience` section comment, h2 sentence case, `ol.timeline` with five plain `li` (`.timeline__when`, `.timeline__what`, `.timeline__text` = former tooltip sentence moved verbatim by script), five card h3 without leading emoji; `?v=` stamp.
- `assets/css/style.css`: horizontal timeline, tooltip, hover/focus scale and 860 px timeline block replaced by one vertical `.timeline` (dot per li + per-li line segment to the next dot); `#experience` rules rewritten (one card per row, two columns 2fr/3fr above 960 px via ONE `min-width: 961px` block, shared row unit `--xp-row: 6.5rem` = natural closed summary height, li floor `--xp-row + 2px`); `min-height: 210px` and the 960/640 `#experience` lines deleted.
- 15 other pages: `?v=` stamp only (`node tools/version.mjs`, 40 refs).
- Root (docs repo, outside this seal): PLAN § 31 status token Done + evidence pointer.
- Natural heights measured before choosing the row unit (min-height forced to 0 by an injected style, probe in session scratchpad): closed card 106 px at 961/1024/1100/1200/1440; timeline li 94.4 (73.5 for the one-line Fabereo sentence) → floor 6.5rem summary = 104 px = natural, so the cards carry no added empty space.

## TEST-RESULTS r1
TREE: e506689f946d9828
SEAL NOTE: identical before and after; render evidence under ignored `.WIP/` is outside the seal.
CMD: `grep -c ... (DW1 x5, DW2 x2 as PLAN § 31)` ; `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `git diff --check` ; `git diff --quiet 670f72f HEAD -- .github/` ; `node .WIP/pass-loop-p31/evidence/render.mjs .WIP/pass-loop-p31/evidence/captures-r2 <scratch-profile> post http://127.0.0.1:4174`
RESULT: PASS — DW1 0/0/1/9/5; DW2 2/0; tooltip sentences byte-identical to HEAD (`diff` of extracted texts, TIPS_VERBATIM); check.mjs --all exit 0 (16 pages, both test PASS lines); version --check 0 (40 refs); shell --check 0; diff --check 0; .github 0. DW3 PASS: 1200 timeline right − first card left −48, first top Δ 0, last bottom Δ 0, five sentences in viewport + topmost, opening card 3 moves li 0 px, no overflow closed/all open, click 5/5, real Tab+Enter 5/5 (`:focus-visible` true), 0 focusables in timeline; 375 one column (timeline bottom 32 px above first card, same left), same interaction results. Informal 961/1024/1440: Δ 0/0, no overflow.
NOTES: Port 4173 (pid 44640, other session) died between runs (connection refused); own server started on 127.0.0.1:4174 from the product folder, `cmp`-identical to the tree. Pre captures: `evidence/captures-pre/` (1200 + 375, render.mjs pre on 4173). Post captures: `evidence/captures-r2/`.

## Review contact 1 (p31) - fresh auditor
Greenlight: every PLAN § 31 Done When 1-4 check re-run by the reviewer passes; scope CLEAN (the `--xp-row` row height and the two `#experience` min-heights are the requested closed-height match).
Advisory (Tier 3, no fix section): the closed-height match rests on a fixed 6.5rem row tuned to today's copy (natural card height = the floor; timeline li headroom 12 px at 961 px). A two-line card subtitle or a third line on a timeline sentence between 961 and ~1100 px would break the ≤ 8 px match silently; no check in tools/ guards it.
Reviewer scratch: .WIP/pass-loop-p31/review/ only (captures, profiles, probe.mjs, verdict.mjs, check-all.txt).

```json
{
  "token": "31eee95e",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {
      "cmd": "grep -c Done When 1 patterns on index.html and assets/css/style.css (timeline--h|timeline__tip|aria-describedby|role=tooltip = 0; css timeline--h|timeline__tip|min-height: 210px = 0; <ol class=\"timeline = 1; <details class=\"disclosure = 9; five sentence fragments = 5)",
      "result": "PASS"
    },
    {
      "cmd": "grep -c Done When 2 patterns on index.html (two sentence-case h2 = 2; five emoji h3 = 0)",
      "result": "PASS"
    },
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
      "cmd": "git diff --check",
      "result": "PASS"
    },
    {
      "cmd": "git diff --quiet 670f72f HEAD -- .github/",
      "result": "PASS"
    },
    {
      "cmd": "git diff b275352 -- . ':!index.html' ':!assets/css/style.css' | grep '^[-+][^-+]' | grep -vc 'style.css?v=' (= 0, 15 pages stamp-only)",
      "result": "PASS"
    },
    {
      "cmd": "curl http://127.0.0.1:4174/ and /assets/css/style.css?v=69bb1ff0 then cmp with index.html and assets/css/style.css",
      "result": "PASS"
    },
    {
      "cmd": "node evidence/render.mjs review/captures review/profile post http://127.0.0.1:4174 (1200: timeline right - card left = -48, first/last delta 0/0, five sentences in viewport and topmost, open card 3 max li shift 0, no overflow closed and all open, 5/5 click and 5/5 Tab+Enter; 375: one column, timeline bottom 32 px above first card, same checks pass)",
      "result": "PASS"
    },
    {
      "cmd": "node review/probe.mjs review/captures review/profile2 (641/800/960 one column, 961/1100 two columns, no overflow at any width)",
      "result": "PASS"
    }
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 101,611 tokens, 4 min 48 s, GREEN high (verdict imported by status.py)
INVOCATION: fresh pass-auditor subagent, id not recorded here | USAGE BASIS: whole-contact (Agent completion notice: subagent_tokens 101611, duration_ms 288201)
REVIEWER HOUSEKEEPING: reviewer wrote its check log first to root `outputs/` then moved it into `review/` (its report); root `outputs/` re-checked after: no file newer than the P31 prompt, nothing staged. Reviewer's `review/srv-index.html` renamed `.bin` (AGENTS Gotcha: scratch HTML is a site page); its two Chrome profiles (~123 MB) deleted, never staged.

## CLOSURE
UNIT: p31
DOCS: root PLAN § 31 status Done + evidence pointer (before review); root PROGRESS (Current Objective, Done, Open, Next Action, Last Verification, Known minor issues) and CHANGELOG (one entry) after the verdict; no README/PRD/ARCHITECTURE/AGENTS change (no new project trap).
MIGRATED: TEST-RESULTS r1 (DW1–4 values, render 1200/375, extra widths), GREEN verdict and AUDIT r1 COST, port 4173→4174 note → root PROGRESS Last Verification (Pass 31); summary → root CHANGELOG.
NITS: reviewer Tier 3 (equal height rests on a fixed 6.5rem row tuned to today's text; a subtitle wrapping to two lines or a timeline sentence to three lines between 961 and ~1100 px would silently break the ≤ 8 px match, no tools/ check) -> root PROGRESS Known minor issues (P31 reviewer observation).
COMMIT: 036c5aa05ea5e80dfa6228e4a219361bde946c7a (product work, LOCAL ONLY, not pushed)
