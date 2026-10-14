# Pass p63 — Stratégie « Réflexion » en visionneuse

STARTUP: Coder prompt root `prompts/pass63-coder.md` (Planner inputs saved root 147d324). unit p63, stop_mode decisions-only, audit_launch_cap 2, seal whole product repository, no seal_paths. Pass base = product 9ed5495 (read in state.json after the first set). MODELS: work = this session, Opus 5.5 per the session's own system text (declared, not runtime-verified); effort unknown (not exposed). Auditor: same model inherited, effort unknown (no launch control for effort; PROGRESS Model restriction exception). Peak hours: owner chose « Continue now » at 14:46.
SERVERS: 4173 was already listening when this Pass started (python -m http.server 4173 --bind 127.0.0.1, pid 61716, not started by this Pass): `/tools/check.mjs` 200 and its `assets/js/site.js` md5 = the product's, so reused (re-checked after the edit). 4174 = scratch copy of 9ed5495 (`git -c core.autocrlf=false archive 9ed5495`, session scratchpad `p63/base`), started by this Pass.

## SLICE
Plan § 63 (Goal, Probes 1–5, Planner decisions 1–4, Work 1–4, Done When 1–6). One turn: one page, one `init*` in `site.js`, a dozen scoped CSS rules, the Pass 62 render scripts reused. Size matches the plan (about 45 active minutes); no split.
Design (Planner decisions applied):
- Markup: the existing `div.grid` of `#reflexion` on Stratégie gets class `viewer` and attribute `data-viewer`; figures, links, pictures, alt texts, captions byte-identical. No rule targets `.viewer` alone: every viewer rule needs `.viewer.is-on`, set by the script, so scripts off = today's boxes.
- Script `initViewer()` in `site.js`, called after `initYear()` (a throw cannot stop the year): on each `[data-viewer]` holding at least two `figure` children and when `Element.prototype.scrollTo` exists, adds `is-on`, builds after the row a `div.viewer__nav` = `button.viewer__btn` « ‹ » (aria-label « Image précédente »), `span.viewer__pos` « 1 / 2 » (`aria-live="polite"`), `button.viewer__btn` « › » (« Image suivante »); buttons `type="button"`, disabled at the ends; a click scrolls the row by one width (`smooth` under no-preference, `auto` under reduce); the position follows the row's scroll (debounced), so a swipe or a Tab onto the hidden picture's link updates it; a focused button that becomes disabled hands the focus to the other one; on resize the row is put back on the current picture.
- CSS: the row = flex, horizontal scroll with mandatory snap, no scrollbar, max-width 760 px centred (the `.band-figure` cap); each figure 100 % of the row, stretched to the taller one's height (decision 3: no script measure), picture and caption centred vertically; a 6 px padding keeps the link's focus ring inside the clipping row. Buttons navy/white, disabled white/grey-500, position grey-700, `:root` tokens only.
Gates: none internal (no money/auth/data path).
ACCEPTANCE: standard order (AUTO → one full audit → close). No MANUAL item: owner decision 2026-10-13, PLAN § V1.2 MANUAL-V12 (he reviews everything once after Passes 59, 60, 63).

## EXPECTED TESTS
- AUTO-1 (Done When 1) `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check` exit 0; `git diff --stat <base> -- . ':(exclude).WIP'` = Stratégie page, `site.js`, `style.css` and `?v=` lines only.
- AUTO-2 (Done When 2) `node .WIP/pass-loop-p63/evidence/render.mjs`, part `view`: Stratégie at 1200, 961, 960, 375 px, mouse (fine pointer) and touch, reduced motion both ways: on arrival picture 1 whole inside the viewer box and the viewport, picture 2 outside the viewer box; « › » by mouse click, by real Tab + Enter and (375, touch) by a real touch swipe shows picture 2 whole and « 2 / 2 »; « ‹ » brings back picture 1 and « 1 / 2 »; a click on the disabled button changes nothing; boxes of every element after the viewer equal on picture 1 and picture 2; no element right edge past the layout width; viewer texts ≥ 4.5:1 against rendered pixels; button focus ring visible (pixels focused vs blurred).
- AUTO-3 (Done When 3) same script, parts `links`, `nojs`: each link `href`/`target`/`rel`/`aria-label` unchanged, a click and a keyboard Enter on each picture open a new target whose URL is the PNG; scripts disabled at 1200 and 375: every box of `#reflexion` = 9ed5495 and both pictures visible by their own box.
- AUTO-4 (Done When 4) parts `outside`, `others`: Stratégie boxes above `#reflexion` = 9ed5495 at 1200 and 375; Entreprise IA, Venture Building and the seven other shell pages keep their section heights; no script error on the ten pages; and `P56_PART=hover P56_PAGE=strategie node .WIP/pass-loop-p56/evidence/render.mjs` green.
- AUTO-5 (Done When 5) the same script on the scratch copy of 9ed5495 (4174) reports no viewer (red run kept as `render-red-9ed5495.txt`, also writes `baseline.json`).
- AUTO-6 (Done When 6) captures `reflexion-1200-1.jpg`, `reflexion-1200-2.jpg`, `reflexion-375.jpg`, refused when the heading font is not Inter; independent review GREEN in at most two contacts.
Changed files a command reaches: `site.js` and `style.css` executed and rendered by AUTO-2..5; the page by AUTO-1..5. None unreached.
RED RUN (AUTO-5, before code): `P48_BASE=http://127.0.0.1:4174 P63_BASELINE=write node .WIP/pass-loop-p63/evidence/render.mjs` on the scratch copy of 9ed5495: exit 1, 77 checks, 13 failing (« viewer present: row.is-on false, nav false, 0 buttons » at all seven cases; links: no viewer, picture 1 not « whole » without a row); `render-red-9ed5495.txt`; `baseline.json` written (2 outside, 2 nojs, 18 sections lists). Loop note: the code below was written while `state.json` still said `plan` (the `set state=code` call was forgotten after the red run); recorded here, transitions made in order afterwards.
TEST NOTES: headless Chrome ends a smooth scroll at once even when the script asks `smooth` (measured: rAF trace of `scrollLeft` = 760 from the first frame, both motion settings; scratch probe `smooth.mjs`), so the render records the behaviour the script asks (`smooth` under no-preference, `auto` under reduce) by wrapping the row's `scrollTo`, and under reduce checks the row is at picture 2 right after the click. Keyboard case: after Shift+Tab the browser scrolls only the button into view, so the row is re-centred (focus kept) before the picture is read. Session interrupted after the first green viewer run (14:5x → resumed 20:19); servers 4173 (not this Pass's) and 4174 (this Pass's) still answering with the expected `site.js` hashes.

## CHANGED
- `service-strategie-transformation/index.html`: `#reflexion` `div.grid` → `div.grid.viewer[data-viewer]` (one line).
- `assets/js/site.js`: `initViewer()` (+53 lines) and its call after `initYear()`.
- `assets/css/style.css`: P63 block after `.band-figure > a` (12 lines, every rule under `.viewer.is-on` or the script-built `.viewer__*`).
- 15 other pages: `?v=` lines rewritten by `node tools/version.mjs`.
FIX BEFORE TEST-RESULTS (seen on the first captures): the picture's wide shadow (`--shadow`, 32 px blur) was cut by the row and drew a faint grey box around it: `.viewer.is-on img { box-shadow: var(--shadow-sm); }` added (`style.css`, scoped); capture script now scrolls the section below the sticky header (it covered the section top). `node tools/version.mjs` re-run.

## TEST-RESULTS r1
TREE: 6bc5a3afbe78bc18
CMD: `node tools/check.mjs --all` (exit 0, 16 pages, three executed tests PASS) · `node tools/version.mjs --check` (0, 43 references) · `node tools/shell.mjs --check` (0, 10 pages) · `P48_PROFILES=<scratch> node .WIP/pass-loop-p63/evidence/render.mjs` (exit 0) · `P56_PART=hover P56_PAGE=strategie node .WIP/pass-loop-p56/evidence/render.mjs` (exit 1, see NOTES)
RESULT: PASS — render 267 checks, failing 0 (`evidence/render.txt`); red run on 9ed5495 77 checks, 13 failing (`render-red-9ed5495.txt`); `git diff --name-only 9ed5495 -- . ':(exclude).WIP'` = Stratégie page, `site.js`, `style.css` + 15 pages whose only changed lines are `?v=` (grep of non-`?v=` lines outside `assets` and the Stratégie page: nothing); PLAN probe 2 grep now finds only the P63 comment/rules (`style.css` 1085–1091, `site.js` 183).
NOTES: viewer row height = the taller figure at every width: 639.3 px at 1200/961/960 (row 760 wide, pictures 748×421.1 and 748×600.1), 291.9 px at 375 (row 327, pictures 315×177.3 and 315×252.7). Swipe proven by real `Input.dispatchTouchEvent` start + 8 moves + end on the row (touch emulation), 60 % of the row width, both ways, at 1200 touch and 375 (both motion settings). Smooth: headless Chrome ends any smooth scroll at once (rAF trace), so the render reads the behaviour asked (`smooth` / `auto` under reduce). Pass 56 hover list on Stratégie: every hover, keyboard, focus-ring and « boxes changed 0 » check ok; its 6 FAIL are its page-width probe (raw boxes, no clipping) listing the scrolled-out figure 2 at 1920/1200/961 × two motion settings; `evidence/clip-probe.txt`: row `overflow-x: auto`, figure 2 starts at the row's right edge, topmost element right of the row = `div.container` (not the figure), `documentElement.scrollWidth` = `clientWidth` at 1920/1200/961/375. The P63 probe cuts boxes by clipping ancestors: 0 past the width, 4 boxes cut.

## Review contact 1 - fresh auditor verdict (code-audit phase-gate)
Greenlight - the viewer meets PLAN 63 Done When 1-5 and PRD Refonte row "Strategie - Reflexion" / 5.2 :226-227 on my own renders; no Tier 1 or Tier 2 finding.
- NATIVE CHECKS: `node tools/check.mjs --all` PASS (OK, 16 pages, census 0 without rule / 0 without user); `node tools/version.mjs --check` PASS; `node tools/shell.mjs --check` PASS; `git diff --stat 9ed5495 -- . ':(exclude).WIP'` = 18 files, only the 3 declared + `?v=` lines on 15 pages (non-`?v=` HTML lines: the `#reflexion` div pair only).
- RENDERS (server on 4173 was NOT running; no server started: scratch copies of render.mjs/cdp.mjs served the product tree to Chrome by browser-level Fetch interception, 4174 = 9ed5495 verified by file hashes): red run on 4174 = 77 checks, 13 failing, verdict lines identical to render-red-9ed5495.txt, rewritten baseline.json byte-identical to the evidence one; tree run = 267 checks, 0 failing, verdict lines identical to render.txt; own probe 182 checks, 0 failing (1200/961/960/375, mouse and touch, reduce both ways: arrival, buttons, swipes incl. a short one snapping to a whole picture, 48 boxes after the row unchanged, resize while on picture 2 keeps picture 2, link focus rings 6 px inside the clipping row, scripts off AND site.js blocked: 13 boxes of #reflexion = 9ed5495 at 1200/961/960/375); P56 hover rerun on Strategie: verdict lines identical to p56-hover-strategie.txt.
- Item 4 reading: ACCEPTED. The 6 P56 "past the layout width" lines are figure 2 of the row (raw boxes, no clip); the clip-aware probe reads 0 at every width, document scrollWidth = clientWidth, and figure 2 sits wholly right of the row's clip edge.
- SCOPE: CLEAN (resize re-snap, focus hand-off off a disabled button, overscroll containment and the shorter shadow are necessary side work).
- COVERAGE: 18/18 changed files read - skipped: none. ARCHITECTURE.md viewer clause (docs repo, not sealed): accurate.
- Advisory (Tier 3, no fix section): `.viewer__btn:hover` can stay teal after a tap on touch screens (sticky hover; could sit under `@media (hover: hover)`); the window `resize` listener also fires on mobile toolbar show/hide and could snap back to the old picture if it lands within the 120 ms after a swipe; root PLAN.md already says "Status Done" and cites "the review verdict" before this verdict existed (docs repo, outside the seal).

```json
{
  "token": "f9590947",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --stat 9ed5495 -- . ':(exclude).WIP' (18 files; non-?v= HTML lines = the #reflexion div pair only)", "result": "PASS"},
    {"cmd": "P48_BASE=http://127.0.0.1:4174 P63_BASELINE=write node render.mjs (scratch copy) then cmp baseline.json with evidence/baseline.json: 13 expected viewer failures, baseline byte-identical", "result": "PASS"},
    {"cmd": "node render.mjs (scratch copy, product tree on 4173 via Fetch interception): 267 checks, failing 0", "result": "PASS"},
    {"cmd": "node own.mjs (auditor probe, 1200/961/960/375 mouse+touch, reduce both ways, resize, short swipe, link focus ring, nojs and site.js blocked vs 9ed5495): 182 checks, failing 0", "result": "PASS"},
    {"cmd": "P56_PART=hover P56_PAGE=strategie node render.mjs (scratch copy of P56) verdict lines diffed with evidence/p56-hover-strategie.txt: identical, hover checks all ok", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 219,807 tokens, 14 min 15 s, GREEN
INVOCATION: pass-auditor subagent, Agent completion notice of this session (id not recorded in the public repository)
USAGE BASIS: unknown (the notice's subagent_tokens figure; probably cumulative over the contact)
VERDICT IMPORT: `status.py verdict` 20:45 → close. Reviewer note on servers: 4173 (not this Pass's server) had stopped answering during the review; it served the product tree to Chrome from disk by Fetch interception in its own scratch copies; 4174 checked by hashes.

## CLOSURE
UNIT: p63
DOCS: root PLAN § 63 status token Done + evidence pointer and root ARCHITECTURE `site.js` clause (the viewer) before the review; root PROGRESS (Current Objective, Done, Next Action, Last Verification Pass 63, Known minor issues P63) and CHANGELOG (one entry) at closure; PRD and AGENTS unchanged (no new trap: the headless smooth-scroll and clip-blind width probe facts are recorded in PROGRESS).
MIGRATED: test evidence, viewer heights, contrast and focus-ring measures, the swipe method, the verdict with its cost and the reviewer Tier 3 observations went to root PROGRESS (Last Verification Pass 63, Known minor issues P63); what shipped went to root CHANGELOG.
NITS: root PROGRESS Known minor issues P63
COMMIT: 4ab0bd09b0f15bf90c6b3e7126a6d084d00641ab
