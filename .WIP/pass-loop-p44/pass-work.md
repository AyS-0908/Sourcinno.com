# Pass 44 — CSS — correctifs visibles (unit p44)

OPENING: product rebuild 5d87750b1a254f53008b7cfe9671a97b3f39f95d (clean; seal fe1c4113050aef98). Root main f66edf0 -> Planner inputs saved as a3e8c68 (PLAN, PROGRESS, README, prompts/pass44-coder.md added, prompts/pass43-coder.md deleted). Started 10:33 local (`date`).
MODELS: work = claude-opus-5-5 (system-declared model id; effort not exposed = unknown). Reviewer = fresh pass-auditor subagent, inherited settings (no effort control exposed); PROGRESS Model restriction exception applies.
PORTS: 4173 not listening (`netstat -ano`); this Pass serves the working tree on 127.0.0.1:4173 and the 5d87750 export on 127.0.0.1:4174.

## SLICE
Contract: root PLAN.md § 44 (Goal, Planner decisions, Work 1–7, Done When 1–3) + prompt prompts/pass44-coder.md § A/B. Size: one turn (six small CSS/HTML/image edits + rendered proofs); no split.
1. Footer button: `.site-footer a` -> `.site-footer a:not(.btn)` (style.css:414), same idiom as :415; footer partial untouched; `.btn--primary:hover` still applies in the footer.
2. `.card--service:hover` box-shadow `var(--shadow)` -> `var(--shadow-lg)` (style.css:847); rest stays `--shadow`; reduced-motion `transform: none` (style.css:501) untouched.
3. Matrix: `.vb-matrix__cell` `overflow-wrap: anywhere` -> `break-word` (style.css:733) if « Développement » fits one line at 320 px; otherwise the smallest font-size step inside a `max-width: 360px` query. Choice recorded under CHANGED with the measured widths.
4. `service-venture-building/index.html:94`: `«&nbsp;autour&nbsp;»` (file idiom: `&nbsp;` entities, cf. `30&nbsp;Md$`).
5. Thumbnails: session-scratchpad `p44/thumbs.py` (Pillow, `python -I`) crops each file to the largest centred 16:9 box inside its non-dark rows (dark = row max luminance <= 30): ai-for-business 469x264 (box 5,47–474,311), the three others 480x270 (rows 45–314); JPEG, source quality estimated from its quantization table (81/78/87/89), source subsampling; `<img width height>` at publications:90, ia:222, venture:161,198 updated; no CSS change.
6. `.logo-band img` gains `mix-blend-mode: multiply` (style.css:353); grey filter + opacity and hover kept; blend vs hover checked at rest and on forced hover at 1200 and 375.
7. `node tools/version.mjs` re-stamps `style.css?v=`.
Gates: none (presentation only, reversible). ACCEPTANCE: audit-first; no MANUAL items: every check, the rendered ones included, is driven from the terminal (headless Chrome, AGENTS recipe).
Changed files never executed by `check.mjs`: the CSS rules and the four JPEGs are only judged by the rendered checks AUTO-4..AUTO-9 below (named, not silent).
Live systems: none (127.0.0.1 + Google Fonts only; YouTube/Typebot/jsdelivr mapped to NOTFOUND at the resolver); LIVE-SAFE contract not applicable.
Scratch: scripts and captures under the session scratchpad `p44/`; durable evidence copied into `.WIP/pass-loop-p44/evidence/` only after `done`.

## EXPECTED TESTS
- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check` — expect: exit 0 each (16 pages, both executed tests PASS incl. the video test).
- AUTO-2 `git diff --stat 5d87750 -- . ':(exclude).WIP'` — expect: only `assets/css/style.css`, `service-venture-building/index.html`, `service-ia-business/index.html`, `publications/index.html`, the four `assets/img/` thumbnails, and `?v=` lines re-stamped by `version.mjs` (each such page diff = one `style.css?v=` line).
- AUTO-3 comparer `node .WIP/pass-loop-p40/evidence/computed.mjs compare <out> <profile> http://127.0.0.1:4174 http://127.0.0.1:4173` (10 shell pages × 1200/375, reduced motion) — expect: differing elements = footer `.btn` colour (10 pages × 2 widths), `.logo-band img` mix-blend-mode (home), `.vb-matrix__cell` wrap/font (venture), and the four launcher `<img>` (aspect-ratio from width/height attributes); nothing else; no outside request. `:hover` is not captured statically (AUTO-5).
- AUTO-4 rendered: footer button computed `color` = `rgb(255, 255, 255)` on 2 pages (home, contact), text box visible; forced `:hover` on it gives `--primary-hover` background, white text.
- AUTO-5 rendered: home `#services` `.card--service` box-shadow at rest = `--shadow` value, with forced `:hover` = `--shadow-lg` value (`CSS.forcePseudoState`), no-preference motion: `translateY(-2px)`; reduce: `transform: none`.
- AUTO-6 rendered: `/service-venture-building/` at 320 px: per word of each `.vb-matrix__cell` (Range over each word) exactly one client rect; no element right edge > 320; cell min-height unchanged; 1200 unchanged (comparer AUTO-3 at 1200).
- AUTO-7 rendered: the « autour » `<strong>` textContent holds exactly two U+00A0; visible text otherwise identical to 5d87750 (`« autour »` with spaces normalised).
- AUTO-8 files: four thumbnails have no edge row with max luminance <= 30 (top/bottom), sizes within ±30 % of the originals; rendered at 1200 and 375: the four launchers' top and bottom pixel rows in the capture are not dark (row mean luminance > 30) and the launcher box keeps 16:9.
- AUTO-9 rendered: home logo band at 1200 (and 375): for each logo, pixels just inside its box (where the old white slab was) = band grey ±3 (no white box) at rest; forced `:hover` on one white-slab logo shows colour and no white box; blend vs hover outcome written here.
- AUTO-10 captures of the touched routes at 1200/375/320 (home, venture, IA, publications) saved in the session scratchpad.
Manual items: none for this Pass (all proofs are rendered by the terminal).
Audit budget: 2 contacts (one fresh review, one confirmation only if fixes).

## CHANGED
- `assets/css/style.css`: :415 `.site-footer a` -> `.site-footer a:not(.btn)`; :358 `.logo-band img` + `mix-blend-mode: multiply`; :734 `.vb-matrix__cell` `overflow-wrap: anywhere` -> `break-word`; new (:754) `@media (max-width: 360px) { .vb-matrix__cell { padding-inline: 0.25rem } .vb-matrix__cell p { font-size: 0.8rem } }` after the 640 query; :852 `.card--service:hover` box-shadow `var(--shadow-lg)`.
  Matrix choice, measured at 320 (`render.mjs`, P44_ONLY=venture): break-word alone = « Développement » on one line but 116 px wide in a 101 px content box (spills into the padding, 1 px from the border); + 0.85rem = 108 px in 101; final 0.8rem + 4 px side padding ≤ 360 px = 102 px in 109, every word inside the content box; cell height 120 = min-height 7.5rem (unchanged); 375/1200 keep 15.2 px.
- `service-venture-building/index.html:94` `«&nbsp;autour&nbsp;»` (file idiom `&nbsp;`); :161, :198 `<img width="480" height="270">`.
- `service-ia-business/index.html:222` `<img width="468" height="263">`; `publications/index.html:90` `<img width="480" height="270">`.
- `assets/img/` (session-scratchpad `p44/thumbs.py`, Pillow, `python -I`; band row = full-width row with max luminance <= 30): ai-for-business-video 480x360 29,131 B -> 468x263 26,699 B (−8.3 %, q81 = source estimate; box 6,48–474,311: row 47 holds 2 bright px that the re-encode smears to max 10, so the cut starts at row 48); video-corpangels-corporates -> 480x270 36,773 B (−9.2 %, q78 = source); video-corpangels-technoservice -> 480x270 19,989 B (−2.8 %, q87 = source); video-pib-bci -> 480x270 16,943 B (+28.7 %, q83 vs source estimate 89: q89 gave +54 %, outside ±30 %). All 4:2:0 as the sources.
- `node tools/version.mjs`: `style.css?v=` re-stamped on 16 pages (10 shell + 6 redirect stubs), one line each.
- Root (docs repo, outside this seal): PLAN.md § 44 status token + Evidence line.

## TEST-RESULTS r1
TREE: ef99f359f9eca788
CMD: `node tools/check.mjs --all` -> 0 (16 pages; portfolio.test PASS, test-ia-embeds PASS incl. video.js launchers) · `node tools/version.mjs --check` -> 0 (43 refs) · `node tools/shell.mjs --check` -> 0 (10 pages) · `git diff --check` -> 0
CMD: `git diff --stat 5d87750 -- . ':(exclude).WIP'` -> 21 files, +29/−24: style.css, the 3 named pages, the 4 thumbnails, and 13 other pages whose only change is the `style.css?v=` line (`git diff -U0 5d87750 -- '*.html'` with `?v=` normalised: 16 `?v=` pairs + 4 `<img>` + 1 « autour » line)
CMD: `node .WIP/pass-loop-p40/evidence/computed.mjs compare <scratch>/compare-r1.json <profile> http://127.0.0.1:4174 http://127.0.0.1:4173` -> exit 1 by design (differences expected): 4,544 elements, structure same on 20 page×width, 76 differing, 0 outside request, media emulated everywhere, newTokensAdded {} (copy `evidence/compare-r1.json`). Differences, all named:
  - footer `.site-footer__cta > a.btn` ×20 (10 pages × 1200/375): color rgba(255,255,255,0.78) -> rgb(255,255,255) (+ currentColor-derived props, ::before/::after colours) and transition-property `color` -> `transform, background, box-shadow, color` (+ behavior/delay/timing): the button now keeps `.btn`'s own transition (the footer rule no longer reaches it).
  - home `.logo-band img` ×26 (13 logos × 2 widths): mix-blend-mode normal -> multiply.
  - venture `.vb-matrix__cell` ×8 and its `p` ×14 (and their ::before/::after): overflow-wrap anywhere -> break-word only (font/padding step applies ≤ 360 px only: not at 1200/375).
  - launcher `<img>` ×8 (ia ×2, venture ×4, publications ×2): aspect-ratio `auto 480 / 360` -> `auto 468 / 263` | `auto 480 / 270` (width/height attributes).
  - `.card--service:hover` is not captured statically (reduce, no hover): proven in render below.
CMD: `node <scratch>/p44/render.mjs <scratch>/p44/cap <profile> http://127.0.0.1:4173 after` (and `… :4174 before`), then `python -I <scratch>/p44/pixels.py <scratch>/p44/cap after before` -> 0 outside request, media emulated on every page, no element right edge past the emulated width on any route/width (320/375/1200). Copies: `evidence/{render.mjs,pixels.py,after-render.json,before-render.json}`.
  - Footer button `/` and `/contact/` at 1200: color rgb(255, 255, 255) (before rgba(255, 255, 255, 0.78)), box 131×45; forced :hover background rgb(31, 99, 96) = --primary-hover, text white; footer text link rgba(255,255,255,0.78), hover rgb(127, 214, 211) unchanged.
  - Home `#services` 2 cards: rest `rgba(0,0,0,0.1) 0 12px 32px` both trees; forced :hover after `rgba(0,0,0,0.16) 0 20px 44px` (= --shadow-lg; before = rest); transform hover matrix(…, -2) with no-preference, `none` with reduce.
  - Venture 320/375/1200: 16 words, each on one line (Range rect tops), each inside its cell content box; « Développement » 102 px in 109 at 320 (12.8 px font), 116 in 128 at 375; cells 120/120/152 px = min-height; before at 320: « Développement » on 2 lines (split). « autour » `<strong>` = « U+00A0 autour U+00A0 » (2 × U+00A0; before 2 × U+0020); line text with nbsp normalised identical.
  - Thumbnail files: band rows top/bottom 0/0 on all four (`thumbs.py` re-read). Launchers, band rows (row max lum <= 30, x 20..w−20) top/bottom after: ia 0/0 @1200, 3/0 @375 · vb1 0/0, 0/0 · vb2 0/0, 0/0 · pub 0/0, 0/0. Before: ia 0/6 @1200, 12/12 @375 · vb1 7/8 @375 · vb2 8/8 @375 · pub 25/25 @375. ia @375 top 3 rows = image rows 0–3 (source 48–51): only the slide's speaker icon is brighter there and the 375 side crop removes it; the slide background is black itself. NOT met as typed for that one capture.
  - Logos (band rgb(245, 248, 252)): pixels lighter than band +3 inside each logo box: after 0 for 13/13 at 1200 and 375 (before 11/13 logos carried 105–3,401 such px); forced :hover on accenture/fabereo/mazars: 0 lighter px, colourfulness 245/235/215 (rest 7), opacity 1, grayscale(0), multiply kept. Blend vs hover: no conflict.
NOTES: SURPRISE: with the box narrower than 16:9 at 375 (min-height 200 px: 327×200, Publications 261×200), `object-fit: cover` now trims the SIDES of the 16:9 thumbnails (≈ 4 % each side; Publications ≈ 13 % each side), where the 4:3 files were trimmed top/bottom. Visible on the « AI for Business » slide at 375: « SOURCINNO » reads « CINNO », « POUR » reads « OUR » (captures `after-launch-ia-375.png` vs `before-…`). No CSS change allowed for this fix (prompt § A): routed to the Planner.

## Reviewer contact 1 of 2 — fresh audit (code-audit phase-gate), 2026-10-10
Verdict GREEN: no Tier 1/2 finding; every check re-run by the reviewer on its own servers (127.0.0.1:4391 = `git -c core.autocrlf=false archive 5d87750` export, 127.0.0.1:4392 = this tree; both stopped). Scratch: SCR = C:/Users/aymar/AppData/Local/Temp/claude/C--Users-aymar-AYS-CODING-code-SOURCINNO-WWW/76aa2206-d9a9-483c-b075-f0519aecaa18/scratchpad/p44-review. No product file edited.
- Native: `node tools/check.mjs --all` 0; `version.mjs --check` 0 (43 refs); `shell.mjs --check` 0; `git diff --check` 0 (also `-c core.autocrlf=false diff --check 5d87750`).
- Done When 1: 21 files vs 5d87750 = style.css, 3 pages, 4 thumbnails, `?v=b93ec49c`→`cac67b81` on 16 pages; the 13 other pages change only that line; nothing untracked outside ignored `.WIP`.
- Done When 2: comparer exit 1 by design (differences expected); 76 differing elements over 20 page-widths: footer `.btn` (colour family + transition list now the `.btn`'s own `transform, background, box-shadow, color` — necessary consequence of the `:not(.btn)` idiom), 13 `.logo-band img` mix-blend-mode, `.vb-matrix__cell` + child `p` overflow-wrap, 4 cropped `<img>` aspect-ratio; outside requests 0; identical to evidence/compare-r1.json (1040/1040 property diffs).
- Done When 3 (own CDP script): footer `.btn` rgb(255, 255, 255) on /, /contact/, /service-venture-building/ at 1200; its :hover background still changes; plain footer links unchanged (0.78, hover rgb(127, 214, 211)). `.card--service` forced :hover `0 20px 44px .16` vs rest `0 12px 32px .10` (before: hover = rest); reduced-motion `transform: none` intact (style.css:502). Matrix at 320: 16 words, 0 split (before: « Développement » split), scrollWidth 320, min-height 120 px held, cell font 12.8 px; sweep 300–370 px: 0 split after (before: split up to 345). `padding-inline: 0.25rem` is needed (« Développement » 102 px vs 101 px inner with 8 px padding). « autour » `<strong>` holds 2 × U+00A0. Thumbnails: JPEG, centred crops of the originals (top offset 48/45/45/45), 468×263 / 480×270 = attributes = natural size, file size −8.3 / −9.2 / −2.8 / +28.7 %, 0 all-dark edge rows. Logos: 0 pixels lighter than band+3 in 13/13 boxes at 1200 and 375 (before: 12/13 had slabs); hover colour returns, blend kept.
Known deviations, graded:
- ia @375, 3 top rows max luminance 7: confirmed. The crop starts at source row 48, inside the 16:9 picture (YouTube letterbox = rows 0–44): the slide's own black background, no visible band. The clause as typed is NOT met (already in PLAN § 44 Evidence); accepted, no sensible in-slice fix.
- Side crop at narrow widths: confirmed, and larger below 375 than the journal states. `min-height: 200px` keeps the box below 16:9, so cover trims the sides: about 4 % each side at 375 (Publications 13 %), 6 % at 360, 12 % at 320 (« BUSINESS » reads « USINESS », « ANGELS » reads « NGELS », « POUR » reads « UR »); before, the 4:3 files showed the whole frame with black bands. Follows from the Planner's "no CSS change" geometry; image decorative (alt="", title in figcaption and aria-label). Tier 3, Planner/owner call: record it in PROGRESS Open at closure (options: drop the launcher `min-height` on narrow screens, or accept).
Advisory (Tier 3, no fix section): PLAN § 44 Evidence points to « PROGRESS Last Verification (Pass 44) », not written yet: closure must add it.
Scope: CLEAN — the ≤360 px `padding-inline` and the footer `.btn` transition list are necessary side work.

```json
{
  "token": "db13dd4a",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check && git -c core.autocrlf=false diff --check 5d87750", "result": "PASS"},
    {"cmd": "git diff --stat 5d87750 && git -c core.autocrlf=false diff 5d87750 -- <13 other pages> | grep -v style.css?v= && git status --porcelain --ignored", "result": "PASS"},
    {"cmd": "node .WIP/pass-loop-p40/evidence/computed.mjs compare $SCR/compare.json $SCR/chrome-cmp http://127.0.0.1:4391 http://127.0.0.1:4392", "result": "PASS"},
    {"cmd": "node -e diff of $SCR/compare.json vs .WIP/pass-loop-p44/evidence/compare-r1.json", "result": "PASS"},
    {"cmd": "node $SCR/audit.mjs $SCR/cap $SCR/chrome-after http://127.0.0.1:4392 after (footer btn colour, forced card hover, matrix words 320, autour nbsp)", "result": "PASS"},
    {"cmd": "node $SCR/w2.mjs $SCR/cap $SCR/chrome-w http://127.0.0.1:4392 after (matrix word sweep 300-370)", "result": "PASS"},
    {"cmd": "python -I $SCR/px.py $SCR <repo> (thumbnail files, launcher captures, logo band pixels)", "result": "PASS"},
    {"cmd": "python -I centred-crop and size check of the four assets/img thumbnails vs 5d87750 export", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 189,553 tokens, 21 min 20 s (1,280,306 ms), 57 tool uses, GREEN high
INVOCATION: fresh pass-auditor subagent (Agent tool; id not recorded here) · USAGE BASIS: whole-contact (Agent completion notice)

## CLOSURE
UNIT: p44
DOCS: root PLAN.md § 44 status token Done + Evidence line (before review); root PROGRESS.md (Current Objective, Done, Open, Next Action, Last Verification Pass 44, Known minor issues) and CHANGELOG.md (one entry) in the root closure commit after the product durable/reset commits; no ARCHITECTURE/AGENTS/PRD/README change (no contract changed, no new trap beyond the journal's measured ones).
MIGRATED: native results, comparer difference list (76 elements, all named), rendered measures (footer white, hover shadow, matrix words at 320, two U+00A0, thumbnail crops and sizes, logo pixels at rest/hover), GREEN high verdict and its cost -> PROGRESS Last Verification (Pass 44); the visible change -> CHANGELOG.
NITS: reviewer Tier 3 -> PROGRESS: (1) narrow-screen side crop of the 16:9 thumbnails (≈4 % each side at 375, Publications 13 %, 12 % at 320: « USINESS », « NGELS ») -> Open, owner/Planner choice (drop launcher min-height on narrow screens, or accept); (2) ia launcher at 375, 3 top rows darker than luminance 30 = slide's own black margin, Done When 3 clause not met as typed -> Open + PLAN § 44 Evidence; (3) PLAN Evidence pointer needed PROGRESS Last Verification (Pass 44) -> written at closure.
COMMIT: 61bb800abb8324b620ddd3f684efd10f38932191 (product work commit, rebuild, LOCAL ONLY, not pushed)
