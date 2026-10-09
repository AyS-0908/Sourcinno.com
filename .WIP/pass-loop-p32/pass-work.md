# Pass p32 journal — Lecteur vidéo partagé — Entreprise IA et Venture Building

## STARTUP
- Root Planner inputs saved: 85457cb "Save approved P32 Planner inputs locally" (PLAN, PRD, PROGRESS, README, prompts/pass31-coder.md deleted, prompts/pass32-coder.md added). outputs/ untracked, not staged.
- Opening baseline: product rebuild 1dec9a681611124485e4c736d43f1625f0038868, clean; root main 85457cb (a80f94d before it). No other in-flight Pass (plan.py status: none).
- Models: work = this session, declared claude-opus-5-5 by the environment, effort not exposed (unknown). Auditor = fresh pass-auditor subagent, inherited settings, model/effort not exposed (unknown). PROGRESS Model restriction exception applies; independent review still mandatory.
- Owner message at launch: « conserver le nom "Venture Building" » = the single-service-name decision PLAN routes to Pass 33. This Pass introduces no service name; captions/labels keep « Venture Building » untouched. Recorded for the Planner in PROGRESS Open.
- Server: 4173 was free; own server `python -m http.server 4173 --bind 127.0.0.1` from the product folder; `curl | cmp` of service-venture-building/index.html and style.css identical to the tree. 127.0.0.1:4174 (pid 53832, Pass 31 session) left alone, not used.

## SLICE
One plan slice, PLAN § 32 Work 1–3, about one turn (≈30 min): one small script, markup on two pages, launcher CSS moved to style.css, noscript partial, one privacy sentence, two thumbnails, test extension.
- `assets/js/video.js` (new): every `button[data-video]` → on click replaced by an iframe `https://www.youtube-nocookie.com/embed/<data-video>?autoplay=1&playsinline=1`, `referrerPolicy` origin, same `allow` list, `allowfullscreen`, title = its figure caption text (fallback the button `aria-label`), class `video-frame`, focused. `ia-embeds.js` keeps the chat only (A-005 untouched, Pass 38).
- Markup ×3: `button.video-launch[data-video]` + local 480×360 thumbnail (`alt=""`) + `<span aria-hidden="true">▶</span>`, `aria-label` « Lire la vidéo « <title> » »; figcaption = `<a>` « Vidéo « <title> » » to youtube.com/watch (new tab). Videos stay in place. IA page loads `video.js` + `ia-embeds.js`; Venture page loads `video.js`.
- CSS: IA `<style>` launcher rules removed; shared `.video-launch` / `.video-frame` rules in style.css next to `.band-figure`. `tools/shell/noscript.html` hides `.video-launch` → `node tools/shell.mjs`; `node tools/version.mjs`.
- Privacy line 106: « Si vous cliquez sur « Lancer la vidéo » » → wording naming the ▶ button; nothing else in the file.
- Thumbnails: one `curl` each from i.ytimg.com hqdefault → `assets/img/video-corpangels-technoservice.jpg`, `assets/img/video-corpangels-corporates.jpg`.
- Test: extend `tools/test-ia-embeds.mjs` (already executed by `check.mjs --all`; no `check.mjs` edit) with a second vm context for `video.js`; PASS line names the video check.
- Gates: none internal (presentation + one click handler, reversible). Mutation pin required by the prompt: scratch copy hard-coding one id must fail the two-ids assertion.
- ACCEPTANCE: default audit-first. No MANUAL items for this Pass: every Done When criterion is driven offline (grep, native suite, headless Chrome with real mouse/Tab/Enter, network log with YouTube hosts blocked).
- Live checks: none (localhost only; two one-shot thumbnail downloads) → LIVE-SAFE contract not engaged.

## EXPECTED TESTS
- AUTO-1 DW1 greps (product folder) — expect: srcdoc grep prints nothing; `grep -c 'data-video="'` IA 1 / Venture 2; `grep -c "data-video-launch\|youtube-nocookie" assets/js/ia-embeds.js` 0; « ne fonctionne pas | Lire la vidéo</ | Lancer la vidéo » grep prints nothing; the three referenced thumbnails exist (`ls`).
- AUTO-2 DW2 — expect exit 0 each: `node tools/check.mjs --all` (video PASS line naming two ids + click-only; `--tiers` 5 hosts), `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check`, `git diff --quiet 670f72f HEAD -- .github/`.
- AUTO-3 DW3 rendered, `node .WIP/pass-loop-p32/evidence/render.mjs <out> <profile> post http://127.0.0.1:4173`, YouTube/ytimg/googlevideo blocked but logged — expect at 1200 and 375 on both pages: each launcher own rect in viewport, thumbnail `naturalWidth` > 0, topmost at centre; 0 YouTube/ytimg requests before a click; mouse click → exactly one more iframe, `src` holds that id, `document.activeElement` = it; real Tab until the launcher is active (`:focus-visible`), Enter → same; no horizontal overflow; scripts disabled: launchers 0×0, caption links non-zero rect inside the viewport when scrolled to. Captures saved.
- AUTO-4 mutation pin: scratch copy (session scratchpad) of tools/test-ia-embeds.mjs + assets/js with `video.js` hard-coding `hDFiKEFv5kA` — expect the test exits non-zero on the two-ids assertion; real file untouched (hash).
- AUTO-5 pre-Pass captures (`render.mjs ... pre`) of the IA and Venture video areas at 1200 and 375 before any product edit.
- AUTO-6 DW4: no fetch/push/deploy; `outputs/` not staged (`git status`, `git log origin/rebuild..` unchanged origin).
- Changed files vs coverage: `video.js` — AUTO-2 (executed test) + AUTO-3; `ia-embeds.js` — AUTO-1/2; two pages — AUTO-1/3; `style.css` — AUTO-3; `noscript.html` + stamped pages — AUTO-2 (`shell.mjs --check`) + AUTO-3 scripts-off; privacy page — AUTO-1/2 (`--tiers`); `test-ia-embeds.mjs` — AUTO-2/4; thumbnails — AUTO-1/3; `?v=` stamps — AUTO-2. No survivor.

## CHANGED
- `assets/js/video.js` (new, 16 lines): every `button[data-video]` → on click an iframe `youtube-nocookie.com/embed/<id>?autoplay=1&playsinline=1`, referrerPolicy origin, same allow list + allowfullscreen, title = figcaption text (fallback aria-label), class `video-frame`, focused. Video half moved from `ia-embeds.js` (13 lines removed; chat untouched).
- `service-ia-business/index.html`: launcher markup (`button.video-launch[data-video="hDFiKEFv5kA"]`, existing thumbnail, `<span aria-hidden="true">▶</span>`, aria-label « Lire la vidéo « AI for BUSINESS » »), caption = link « Vidéo « AI for BUSINESS » »; five `.ia-video*` rules removed from the page `<style>`; `video.js` script tag before `ia-embeds.js`; stamped `<noscript>`.
- `service-venture-building/index.html`: the two `srcdoc` iframes → same launcher markup (7qO3G7tCHr8, QtzlMHaUGyM), captions = title links, same positions; `video.js` script tag; stamped `<noscript>`.
- `assets/css/style.css`: shared `.video-launch` / `.video-frame` rules after `.band-figure` (same box as the former `.ia-video`: 16:9, min-height 200px, radius-lg; thumbnail cover; ▶ in a 72 px teal disc, navy on hover).
- `tools/shell/noscript.html`: `.ia-video-launch` → `.video-launch`; `node tools/shell.mjs` stamped 10 pages.
- `politique-confidentialite/index.html` line 106: « Si vous cliquez sur « Lancer la vidéo » » → « Si vous cliquez sur le bouton ▶ d'une vidéo » (straight apostrophe like the rest of that sentence).
- `assets/img/video-corpangels-technoservice.jpg` (7qO3G7tCHr8 hqdefault, 480×360, 20,559 B, SHA256 be709bcb1e5341d437227cea416e5842f228668bff919c62738865e0bb97fde9) and `assets/img/video-corpangels-corporates.jpg` (QtzlMHaUGyM hqdefault, 480×360, 40,494 B, SHA256 89863895ee1805b7345397d0c23f94681f4b3b6c9e3b33b9c66b84187de45a28): one `curl` each, HTTP 200.
- `tools/test-ia-embeds.mjs`: new first block executes `video.js` in a vm context with two fake launchers (no frame before click; each click embeds its own id, replaces its own button, nocookie URL exact, title from caption, referrerPolicy/focus/allow); the former video assertions removed from the chat block; PASS line names the video check. No `check.mjs` edit (file already in its executed list).
- `?v=` stamps: `node tools/version.mjs` (42 refs, 16 pages).
- Root docs repo (outside this seal): PLAN § 32 status token Done + evidence pointer; ARCHITECTURE lines 11 and 27 name `video.js` / `data-video`.

## TEST-RESULTS r1
TREE: 6f30e3f71844c782
CMD: `grep (PLAN § 32 DW1 x4) + ls thumbnails` ; `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `git diff --check` ; `git diff --quiet 670f72f HEAD -- .github/` ; `node .WIP/pass-loop-p32/evidence/render.mjs .WIP/pass-loop-p32/evidence/captures-post <scratchpad-profile> post http://127.0.0.1:4173`
RESULT: PASS — DW1: srcdoc none; data-video 1/2; ia-embeds 0; hint grep none; thumbnails 29,131 / 20,559 / 40,494 B exist. DW2: check --all exit 0 (16 pages; `tools/test-ia-embeds.mjs: PASS: video.js click-only, two launchers embed their own id …`; --tiers 5 hosts); version 0 (42 refs); shell 0; diff --check 0; .github 0. DW3 PASS at 1200 and 375 on both pages: thumbnails naturalWidth 480, launcher in viewport + topmost, visible text « ▶ » only; 0 YouTube/ytimg requests before a click (1 per launch after; CORRECTED by review A-001: NOT blocked inside the cross-site iframe, the player really loaded from YouTube in this run); each click +1 iframe with its own id, focused, referrerPolicy origin; real Tab (IA 16/11, Venture 13+16 / 8+11 presses from a fresh load) → `:focus-visible` → Enter → own iframe focused, 0 YouTube requests before Enter; no overflow before/after; scripts disabled: launchers 0×0 `display:none`, caption links in viewport + topmost (375 Venture links wrap to 2 lines), 0 YouTube requests.
NOTES: Mutation ledger: scratch copy (session scratchpad `mut/`) of test + assets/js with `video.js` hard-coding `hDFiKEFv5kA` → test exit 1, `AssertionError … expected '…/embed/QtzlMHaUGyM?…'` (two-ids assertion); real `video.js` SHA256 4ad941e0… unchanged before/after. Probe fixes before this run (render.mjs, no product change): keyboard loop no longer pre-scrolls (a pre-scroll moved Chrome's focus start point → full Tab wrap, equal counts); topmost of a wrapped caption link probed at its first line box. Pre captures: `evidence/captures-pre/` (IA 1, Venture 2, at 1200 and 375). Post captures + render-result.json: `evidence/captures-post/`. Server: own 127.0.0.1:4173.

## Audit fixes to implement — 2026-10-09
BLOCKING_STATUS: NON_BLOCKING
READINESS: READY_WITH_FIXES
REASON: product delivery meets PLAN § 32 Done When 1-3, but the rendered-check evidence claims YouTube was blocked ("local only") while the click-loaded player really reached YouTube.
NATIVE CHECKS: `node tools/check.mjs --all` PASS — exit 0, "tools/test-ia-embeds.mjs: PASS: video.js click-only, two launchers embed their own id"; `--tiers` 5 hosts
NATIVE CHECKS: `node tools/version.mjs --check` PASS; `node tools/shell.mjs --check` PASS; `git diff --check` PASS; `git diff --quiet 670f72f HEAD -- .github/` PASS
NATIVE CHECKS: Done When 1 greps PASS (srcdoc none; data-video 1/2; ia-embeds video refs 0; hint strings none; 3 thumbnails present, 480x360 JPEG)
NATIVE CHECKS: mutant video.js with hard-coded id fails the test (AssertionError) PASS; `render.mjs post` re-run, all four page/width `pass` true PASS
SCOPE: CLEAN — the ▶ hover colour and the iframe title taken from the caption belong to the requested launcher (necessary_side_work).

### A-001 | Tier 2 | MEDIUM | `.WIP/pass-loop-p32/evidence/render.mjs:7`
- issue: the header says YouTube hosts are "BLOCKED (Network.setBlockedURLs) ... local only", but that page-session block does not reach the click-loaded cross-site (out-of-process) iframe: `evidence/captures-post/post-venture-after-click-1200.jpg` and `post-ia-after-click-375.jpg` show the live YouTube player (video title, channel "AyS Perso", 0:00 / 1:35), so youtube-nocookie/ytimg/googlevideo were contacted beyond the Pass network allow-list (localhost, Google Fonts, two thumbnails) and the locality claim in the evidence is false; this reviewer's re-run of the same script did the same (unintended, disclosed here).
- fix: make the recipe really block those hosts inside the iframe too (e.g. Chrome flag `--host-resolver-rules="MAP *.youtube-nocookie.com ~NOTFOUND, MAP *.youtube.com ~NOTFOUND, MAP *.ytimg.com ~NOTFOUND, MAP *.googlevideo.com ~NOTFOUND"`, or Target.setAutoAttach and setBlockedURLs in every child session), re-run `post`, correct the header and the journal's locality claim, declare both unintended YouTube contacts under SURPRISES, and add the trap ("setBlockedURLs on the page session does not cover out-of-process iframes") to root AGENTS.md Gotchas beside the line 54 setBlockedURLs mention.
- test: re-run `node .WIP/pass-loop-p32/evidence/render.mjs <scratch-out> <scratch-profile> post`: every `pass` stays true (src holds the id, frame focused, Tab+Enter, no-script, no overflow) and every after-click capture shows a Chrome error page, never YouTube player content.

Reviewer notes (Tier 3, non-blocking, no fix required this Pass): the caption title is now the only YouTube path (and the only one with scripts off), yet site-wide `a { color: inherit; text-decoration: none; }` (`assets/css/style.css:74`) gives it no visual link cue; owner/Planner call, e.g. route to Pass 33 or Release acceptance. Reviewer scratch: C:\Users\aymar\AppData\Local\Temp\claude\C--Users-aymar-AYS-CODING-code-SOURCINNO-WWW\7605b029-0171-4725-8f0f-a61788a415d3\scratchpad\review-p32\ (Chrome profile deleted; nothing written to the product tree except this append).

```json
{
  "token": "3991d709",
  "verdict": "FIX",
  "confidence": "high",
  "evidence": [
    {"cmd": "grep -rln srcdoc --include=*.html . | grep -v .WIP|_v2 ; grep -c data-video= service-ia-business/index.html service-venture-building/index.html ; grep -c data-video-launch|youtube-nocookie assets/js/ia-embeds.js ; grep -rn ne fonctionne pas|Lire la vidéo</|Lancer la vidéo --include=*.html . ; file assets/img/video-corpangels-*.jpg", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/check.mjs --tiers", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check", "result": "PASS"},
    {"cmd": "git diff --quiet 670f72f HEAD -- .github/", "result": "PASS"},
    {"cmd": "node --experimental-vm-modules <scratch>/mut/tools/test-ia-embeds.mjs (video.js with hard-coded id hDFiKEFv5kA) exits 1 with AssertionError", "result": "PASS"},
    {"cmd": "curl -s http://127.0.0.1:4173/<6 changed files> | cmp against the tree", "result": "PASS"},
    {"cmd": "node .WIP/pass-loop-p32/evidence/render.mjs <scratch>/captures <scratch>/chrome-profile-1 post http://127.0.0.1:4173 (all four page/width pass true, ytBeforeClick 0)", "result": "PASS"},
    {"cmd": "inspect post-venture-after-click-1200.jpg and post-ia-after-click-375.jpg (work session captures-post and reviewer re-run): YouTube must be blocked per render.mjs header, live YouTube player rendered instead", "result": "FAIL"},
    {"cmd": "git rev-list --count origin/rebuild..HEAD (43) ; ls -l .git/FETCH_HEAD (2026-10-03) ; git rev-parse HEAD (1dec9a6)", "result": "PASS"}
  ],
  "opened_fix_section": true
}
```

AUDIT r1 COST: 129,146 tokens, 6 min 17 s, FIX (A-001 Tier 2, evidence locality)
INVOCATION: fresh pass-auditor subagent (id in session only) · USAGE BASIS: whole-contact (Agent completion notice)

## FIX A-001 (round 2)
- `evidence/render.mjs`: launch flags `--host-resolver-rules` (youtube-nocookie, youtube, ytimg, googlevideo, ggpht → ~NOTFOUND) + `--no-proxy-server` (system proxy checked: none); header now says the page-session block does not reach the cross-site frame and that the resolver block does. No product file changed.
- Journal r1 locality claim corrected above. Unintended YouTube contacts declared for SURPRISES: this session's two `post` runs (r1 and the run before the probe fix) and the reviewer's contact-1 re-run each loaded the three players from YouTube (hosts youtube-nocookie and whatever the player fetched).
- Root AGENTS.md Gotchas: new bullet "`Network.setBlockedURLs` on the page session does not reach a cross-site iframe" next to the reduced-motion one (root repo, outside this seal).

## TEST-RESULTS r2
TREE: 6f30e3f71844c782
CMD: `node .WIP/pass-loop-p32/evidence/render.mjs .WIP/pass-loop-p32/evidence/captures-r2 <scratchpad-profile> post http://127.0.0.1:4173`
RESULT: PASS — all four page/width `pass` true: ytBefore 0; clicks 1/2/1/2 pass (own id, focused); Tab+Enter pass (16, 13/16, 11, 8/11 presses); no-script pass; no overflow. All four after-click captures (`captures-r2/post-*-after-click-*.jpg`) show Chrome's error page, no YouTube content.
NOTES: product tree unchanged since r1 (same seal); native suite of r1 still applies (no product edit).

Delta review (contact 2 of 2, A-001 only): CONFIRMED. render.mjs header (lines 7-9) now states the page-session block does not reach the cross-site iframe; launch flags `--host-resolver-rules` (youtube-nocookie, youtube, ytimg, googlevideo, ggpht → ~NOTFOUND) + `--no-proxy-server` (lines 20-22). Reviewer re-run of the fixed script into scratch: all four page/width `pass` true, ytBeforeClick 0, and all four after-click captures show Chrome's error page (byte sizes identical to `captures-r2`). Journal r1 result line carries the A-001 correction; root AGENTS.md Gotchas line 55 holds the new trap. Product tree unchanged (same 20-file diff, served files identical). Reviewer Chrome profile deleted; no new finding.

```json
{
  "token": "b59cb440",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "sed -n 1,26p .WIP/pass-loop-p32/evidence/render.mjs (header corrected; --host-resolver-rules MAP youtube-nocookie/youtube/ytimg/googlevideo/ggpht ~NOTFOUND + --no-proxy-server)", "result": "PASS"},
    {"cmd": "curl -s http://127.0.0.1:4173/<video.js, IA page, Venture page> | cmp against the tree", "result": "PASS"},
    {"cmd": "node .WIP/pass-loop-p32/evidence/render.mjs <scratch>/captures-r2 <scratch>/chrome-profile-2 post http://127.0.0.1:4173 (all four pass true, ytBeforeClick 0, clicks and Tab+Enter own id focused)", "result": "PASS"},
    {"cmd": "inspect <scratch>/captures-r2/post-*-after-click-*.jpg and evidence/captures-r2/post-*-after-click-*.jpg: Chrome error page, no YouTube player content", "result": "PASS"},
    {"cmd": "node -e read evidence/captures-r2/render-result.json: all four page/width pass true", "result": "PASS"},
    {"cmd": "grep -n setBlockedURLs AGENTS.md (root): new Gotcha line 55; git diff --stat -- AGENTS.md 1 insertion", "result": "PASS"},
    {"cmd": "grep -n -i youtube .WIP/pass-loop-p32/pass-work.md: r1 result line 46 carries the A-001 locality correction", "result": "PASS"},
    {"cmd": "git diff --stat 1dec9a6 (20 files, 86+/66-, unchanged) ; git status --short | wc -l (23)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: 156,192 tokens cumulative for the resumed auditor (contact 1 = 129,146, so ~27,046 for this confirmation), 2 min 13 s, GREEN
INVOCATION: same pass-auditor resumed via SendMessage · USAGE BASIS: cumulative (Agent completion notice)

## CLOSURE
UNIT: p32
DOCS: root PLAN § 32 status Done + evidence pointer and ARCHITECTURE lines 11/27 (`video.js`, `data-video`) before review; root AGENTS Gotchas new bullet (setBlockedURLs vs cross-site iframe, A-001); root PROGRESS (Done, Open, Next Action, Last Verification, Known minor issues) and CHANGELOG entry after GREEN.
MIGRATED: final evidence r1/r2, verdicts (contact 1 FIX A-001, contact 2 GREEN high), costs, thumbnail sizes/SHA256, unintended YouTube contacts, owner name decision « Venture Building » → root PROGRESS Last Verification / Open; change summary → root CHANGELOG.
NITS: reviewer Tier 3 (caption title link has no visual link cue under site-wide `a { color: inherit; text-decoration: none; }`, now the only YouTube path incl. scripts off) → root PROGRESS Known minor issues for Planner routing; confirmation note (journal lines 19/25 "blocked" now true with the fixed script) → no action.
COMMIT: 9d1e097bb1b8776f6b1f3dbc7da0d9eb518d650e
