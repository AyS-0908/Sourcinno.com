# Pass p48 — audit 2026-10-10 fixes (A-001, A-002, A-003, A-006, A-007)

OPENING: product rebuild 1f4aaf4dfe3820914cf3478639e9c77c649a9146 (clean); root Planner inputs b748fac.
MODELS: work = claude-opus-5-5 (session system prompt; effort not exposed = unknown). Reviewer = inherited
session defaults (no model/effort launch control exposed beyond the Agent tool's optional model alias);
PROGRESS Model restriction exception applies. Declared, not runtime-verified.
SERVERS: after = product tree on 127.0.0.1:4173; before = `git -c core.autocrlf=false archive 1f4aaf4`
in the session scratchpad on 127.0.0.1:4174. Port 4173 was free at pre-flight.
EVIDENCE SCRIPTS: `.WIP/pass-loop-p48/evidence/` (cdp.mjs = audit cdp.mjs adapted; Chrome profiles in the
session scratchpad). Network: resolver maps every host to NOTFOUND except 127.0.0.1 and Google Fonts.

## SLICE

One turn of work, matches the plan (~35–40 min): five small fixes in four product files + version stamps.
1. A-001 `style.css`: `a[href^="mailto:"] { overflow-wrap: anywhere; }` + `.grid > * { min-width: 0; }`.
2. A-002 `style.css`: darker `.hero--offer::before` veil only at the widths where the measured subtitle
   contrast is < 4.5:1 (≤ 640 px per audit; 768 measured too). Values chosen from the before measure.
3. A-003 `contact/index.html`: each field error `<p>` gets `id="err-<name>"`, its control
   `aria-describedby="err-<name>"`; the form-level slot after the consent field is removed if no script
   writes it (forms.js writes only `.field .error` and `.form-status`).
4. A-006 `style.css`: delete `h4`, `.btn[disabled]`, `.quote cite`, `.card > img` (no `_v2` consumer:
   the only grep hit is an SVG path `h4` in `assets/js/_v2/chat.js:237`).
5. A-007 `video.js`: frame title = caption text without its `.visually-hidden` parts, fallback the
   launcher `aria-label`; `tools/test-ia-embeds.mjs` mock caption carries « (nouvel onglet) » in a hidden
   span and the test asserts it is stripped; a second mock without caption pins the fallback.
6. `node tools/version.mjs`.
ACCEPTANCE: default audit-first. No MANUAL items for this Pass: every criterion is rendered or executed
from the terminal (PLAN § 48 Done When 1–5); the owner's eyes are not required by the plan.
Plan questions: (1) no manual item; (2) every number below comes from a named command; (3) no money/auth/
migration half; (4) changed files and their runner: `style.css` (rendered scripts + check.mjs),
`contact/index.html` (check.mjs + AX script), `video.js` + `tools/test-ia-embeds.mjs` (executed by
`check.mjs --all`, plus rendered frame-title probe). No changed file is left unreached.
LIVE-SAFE: no live system touched (local servers only).

## EXPECTED TESTS

- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`,
  `git diff --check` — expect: exit 0 each.
- AUTO-2 `git diff --stat 1f4aaf4 -- . ':(exclude).WIP'` — expect: style.css, contact/index.html,
  assets/js/video.js, tools/test-ia-embeds.mjs + `?v=` lines only; the A-006 `git grep` prints nothing.
- AUTO-3 `node evidence/overflow.mjs` — expect: /contact/ and /mentions-legales/ at 320/375/1200 (Contact
  also no-JS and after an invalid submit): innerWidth = emulated width, 0 elements past it, the email link
  text complete (textContent = the address) and its rectangle inside the viewport; at 1200 the email link
  is one line (height = one line box).
- AUTO-4 Pass 40 comparer `computed.mjs compare` between :4174 (before) and :4173 (after), 10 shell pages
  at 1200 and 375 — expect: every differing element matched to a named fix (min-width on grid children,
  overflow-wrap on mailto links, veil ::before ≤ 640 on offer heroes, removed rules h4/quote cite/card>img
  having no consumer = no difference, contact form error slots unchanged in style). Exit code non-zero is
  expected (differences exist); the list is the evidence.
- AUTO-5 `node evidence/contrast.mjs` then `python evidence/contrast_pixels.py` — expect: hero subtitle min
  contrast ≥ 4.5:1 (h1 ≥ 3:1) on the three service heroes at 320, 375, 768, 1200; one capture per hero at
  375; before-values recorded from :4174 for the comparison.
- AUTO-6 `node evidence/ax.mjs` at 375 — expect: after an empty submit Name, Need, Message, Email, Consent
  expose their error text as AX description; malformed phone exposes its text; after correcting Name its
  description is empty; email draft (`form.dataset.lastMailto`) with fixed values equals the same draft on
  :4174 (mailto navigation blocked, no mail client).
- AUTO-7 `node evidence/video.mjs` — expect: the four frames (mouse launch on 3 pages + keyboard launch)
  titles contain no « nouvel onglet », equal the visible caption text, and document.activeElement is the frame.
- No MANUAL items for this Pass (see SLICE).

## CHANGED
- `assets/css/style.css`: A-001 `a[href^="mailto:"] { overflow-wrap: anywhere; }` (after `a`), `.grid > * { min-width: 0; }`
  (after `.grid--3`); A-002 `@media (max-width: 860px) { .hero--offer::before { … 0.92 / navy 0.84 at 55% / navy 0.74 } }`
  after the shared veil; A-006 deleted `h4 {…}`, `.btn[disabled]`, `.quote cite`, `.card > img` (the grouped
  `h1, h2, h3, h4 {…}` selector kept: not in the plan's four rules).
- `contact/index.html`: A-003 seven `id="err-<name>"` + `aria-describedby` on input/select/textarea/checkbox; the
  empty form-level `<p class="error">` after the consent field removed (no writer: `forms.js` writes `.field .error`
  through `showError` and `.form-status` through `say`/`sendByMail` only).
- `assets/js/video.js`: A-007 title = cloned caption minus `.visually-hidden`, fallback launcher `aria-label`.
- `tools/test-ia-embeds.mjs`: caption mock with a hidden « (nouvel onglet) » part, clone, a figure-less launcher.
- 16 pages: `?v=` stamps (`node tools/version.mjs`). `forms.js` untouched.
- Root `PLAN.md` § 48: status token Done + evidence pointer (root repo, outside this seal).

## TEST-RESULTS r1
TREE: d677c1bd0bad2f17
CMD: `node tools/check.mjs --all` 0 (16 pages, both executed tests PASS) · `node tools/version.mjs --check` 0 (43) · `node tools/shell.mjs --check` 0 (10) · `git diff --check` 0 · `git grep -n -e "^h4 " -e "btn\[disabled\]" -e "\.quote cite" -e "\.card > img" -- assets/css/style.css` 1 (nothing)
CMD: `node evidence/overflow.mjs` 0 (36 runs, FAILURES 0; before :4174 FAILURES 4) · `node evidence/ax.mjs` 0 (17 checks) · `node evidence/video.mjs` 0 (8 launches; before 8 FAILURES) · `P48_TAG=after node evidence/contrast.mjs` + `python evidence/contrast_pixels.py after` 0 (54 measures, 0 under) · scan 19 more widths 0 (114 measures)
CMD: `node ../pass-loop-p40/evidence/computed.mjs compare evidence/computed-compare.json <profile> http://127.0.0.1:4174 http://127.0.0.1:4173` exit 1 by design (61 differences, all classified below) · `node evidence/form-geometry.mjs` (1200/375 same; 320 differs = A-001)
RESULT: PASS — every PLAN § 48 Done When 1–5 measured green; rendered runs re-done after the last edit (veil).
NOTES: mutation ledger on a scratchpad copy of test-ia-embeds + video.js: old title line → `assert.equal` frames[0].title red; caption ignored → same assert red (label instead); no clone → « page caption keeps its hidden notice » red. Diff stat = the 4 named files + 15 `?v=` pages (publications/IA/Venture have 2 stamps).

## EVIDENCE (Done When 2–5)
Overflow (`evidence/overflow-after.txt`, before `overflow-before.txt`): before at 320 Contact innerWidth 331, email right 330.8, 42 elements past (form 330.8), Mentions 1, Contact no-JS 13, invalid submit 42; after 320 innerWidth 320, 0 past, email right 292.8 on 2 lines, form right 296; 375 and 1200 email on 1 line; all 10 shell pages 320/375/1200 0 past.
Comparer (`evidence/computed-classified.txt`), 10 pages × 1200/375, 4544 elements, 61 differing, outside requests 0:
- 16 × `min-width auto → 0px` only = `.grid > *` (home 5 per width, services, contact 2);
- 32 × `overflow-wrap normal → anywhere` only (element, ::before, ::after) = mailto links (footer link on every page, Contact main + fallback, Mentions main);
- 3 × at 375 `section:0::before background-image` 0.78/teal 0.62 → 0.84/navy 0.74 = A-002 veil (3 offer heroes; none at 1200);
- Contact 4 per width = key shift from the removed `p.error` (A p:7 empty 0 px vs B p:7 hint; p:8/button:9/p:10 compared with neighbours, the last absent in B). `evidence/form-geometry.mjs`: consent/hint/button/status rectangles and style hashes identical at 1200 and 375; at 320 they differ only through A-001 (narrower, taller form).
- h4 / `.btn[disabled]` / `.quote cite` / `.card > img` removals: 0 differences (no consumer).
Contrast (subtitle min ratio, pixels under 4.5 in brackets; `evidence/contrast-before.txt` / `contrast-after.txt`):
| hero | width | before | after |
|---|---|---|---|
| strategie | 320 / 375 / 641 / 700 | 3.34 (191) / 4.187 (31) / 4.066 (59) / 4.066 (20) | 5.345 / 5.795 / 5.644 / 5.644 |
| strategie | 768 / 800 / 860 / 1200 | 5.273 / 5.484 / 5.558 / 5.637 | 6.409 / 6.409 / 6.396 / 5.637 |
| ia | 320 / 375 / 641 / 700 | 4.051 (66) / 4.294 (29) / 4.401 (4) / 5.481 | 6.053 / 5.963 / 6.347 / 6.586 |
| ia | 768 / 800 / 860 / 1200 | 5.23 / 5.2 / 6.771 / 8.04 | 6.359 / 6.373 / 7.386 / 8.04 |
| venture | 320 / 375 / 641 / 700 | 7.091 / 6.91 / 3.07 (260) / 2.941 (346) | 9.636 / 9.636 / 5.706 / 5.509 |
| venture | 768 / 800 / 860 / 1200 | 4.193 (125) / 4.603 / 7.848 / 9.707 | 6.728 / 6.939 / 9.636 / 9.707 |
375 reduced motion = 375 values. h1 min after 6.308 (bar 3). Scan 330–840 (19 widths): min subtitle 4.937 (Venture 660), min h1 5.285. Captures: `evidence/orig-after-service-*-375.png`.
Veil trials (on :4174/:4173 by injected style, not shipped): 0.86/teal 0.78 left Strategy 320 4.142, Venture 641 3.597; teal-dark (36,122,120) 0.92 end left Venture 600 4.286 / 660 4.416 (white at 0.86 over teal-dark caps near 4.4); navy 0.84/0.74 chosen (min 4.937), navy 0.86/0.80 min 5.624 (darker than needed).
AX (`evidence/ax.txt`, 375): ids unique, 7 err-*, 0 form-level slots; empty submit → nom/besoin/message/email « Ce champ est obligatoire. », rgpd « Cette case doit être cochée pour envoyer le message. », all invalid=true; entreprise/telephone description empty; first invalid focused (nom); Tab away and Shift+Tab back keeps nom's text; after typing a name description empty, invalid false; phone « 12 » → « Ce numéro de téléphone semble incomplet. »; email « jean@ » → « Cette adresse email ne semble pas valide. »; message « court » → « Merci de détailler … ». Email draft with fixed values identical on :4173 and :4174 (485 chars), 2 mailto navigations blocked by the frame sandbox, outside requests 0.
Video (`evidence/video-after.txt`): 4 launchers × mouse + keyboard, titles « Vidéo « Du PIB au BCI » », « Vidéo « AI for BUSINESS » », « Vidéo « CorpAngels : TechnoService SaaS pour création de StartUps » », « Vidéo « corpangels Corporates — July23 » », frame focused 8/8; before all 8 titles ended « (nouvel onglet) ».

## Audit fixes to implement — 2026-10-10 (Pass 48, review contact 1)
BLOCKING_STATUS: NON_BLOCKING
READINESS: READY_WITH_FIXES
REASON: A-001, A-002, A-003, A-006 and A-007 meet Done When 1-5 on independent before/after measurement, but the new global mailto wrap rule splits the footer address at 320 px on all 10 shell pages as « …@sourcinno.co » / « m », a regression no Done When exercised.
NATIVE CHECKS (after copy = `git -c core.autocrlf=false archive 1f4aaf4` + the 19 changed working files, byte-identical; before copy = the archive alone):
- `node tools/check.mjs --all` PASS — 16 pages, 312 internal links, both executed tests pass.
- `node tools/version.mjs --check` PASS — 43 references. `node tools/shell.mjs --check` PASS — 10 shell pages, 6 redirects.
- `git diff --check 1f4aaf4` PASS; `git grep` of the four removed selectors in style.css PASS (prints nothing); pages other than Contact differ only by `?v=` lines (15 style.css, 3 video.js).
- `node tools/test-ia-embeds.mjs` with the 1f4aaf4 `video.js` swapped in: FAIL as expected (title keeps « (nouvel onglet) ») — the new assertion discriminates.
AUDITOR MEASURES (own scripts in the session scratchpad `p48-audit/tools/`; servers 127.0.0.1:4473 before, :4474 after; Chrome resolver MAP * ~NOTFOUND except 127.0.0.1 and Google Fonts; 0 outside requests):
- `node geom.mjs` — after: innerWidth = emulated width and 0 elements past it on the 10 shell pages at 320/375/768/1200 and Contact no-JS / after invalid submit at 320/375/1200 (before: Contact and Mentions at 320 report 331). Rectangles before = after at 375/768/1200 on all 10 pages (Contact form hint/status matched by role). At 320 the only changes are the Contact/Mentions fix and the address splits of A-008.
- `python contrast.py` — subtitle >= 4.5:1 (audit glyph rule and brightest-glyph-pixel reading) on the three service heroes at 17 widths 320-1440 plus reduced motion at 375; before reproduces 3.340/4.187 (Strategy 320/375), 4.051/4.294 (IA), 4.193 (Venture 768). Veil ::before computed value differs only at <= 860 px.
- `node ax.mjs` — A-003: 7 aria-describedby each resolve to their own slot; empty submit at 375/320/1200 exposes each error text as description; Tab away and back keeps it; corrected name and phone go empty; before = empty descriptions; FormData identical before/after (no submit, no mail client). A-007: 4 frames x (mouse 1200, keyboard 1200, mouse 375): title = visible caption text, AX name identical, no « nouvel onglet », frame focused, caption link keeps its hidden notice.
- `node computed.mjs` — 1200 and 375 computed-style differences only: grid children min-width/min-inline-size auto -> 0px, mailto overflow-wrap, offer veil ::before (375 only), removed form p.error; the remaining rows differ only by server port inside background-image URLs.
SCOPE: CLEAN — every change traces to § 48 / A-001-A-007; the test-ia-embeds mock is necessary side work.

### A-008 | Tier 2 | MEDIUM | `assets/css/style.css:87`, `tools/shell/footer.html:23`
- issue: At 320 px `overflow-wrap: anywhere` now splits the footer address on all 10 shell pages, and the in-text addresses of Mentions (second) and Politique (both), as « aymard.de.scorbiac@sourcinno.co » / « m » (at 334 px Contact and Mentions show « …sourcinno.c » / « om »); before the Pass they sat on one line inside the screen (right edge 302 of 320), and the first line now reads as another domain (.co).
- fix: Let each displayed address break only after « @ » — a `<wbr>` after « @ » in the footer partial (then `node tools/shell.mjs`) and in the in-page addresses, plus `display: inline-block; max-width: 100%` on address links only (not the no-JS draft link `contact/index.html:103`), keeping `overflow-wrap` as last resort; this widens Done When 1's file list (Planner/owner call; the alternative is an explicit owner acceptance of the arbitrary break, recorded as a deviation).
- test: DOM-only trial already measured (`node wbrtrial2.mjs`): at 320 every address reads « aymard.de.scorbiac@ / sourcinno.com », 0 elements past the width, and at 375/768/1200 page heights equal the current tree; after the source change rerun the geometry sweep at 320/334/375/768/1200 (Contact no-JS and invalid included) and the 1200 computed-style comparison.

Advisory, Tier 3 (not required for closure):
- Contact phone at 320 now wraps « +33 6 08 75 58 » / « 77 » (`contact/index.html:87`): non-breaking spaces in the displayed number keep it whole.
- The <= 860 px veil also replaces the teal end of the gradient with navy (`assets/css/style.css:308-309`): visible on phones/tablets on the three service heroes (images, layout and desktop unchanged); show it to the owner at manual review.
- Root `PLAN.md` § 48 already says « Status Done » and points to « PROGRESS Last Verification (Pass 48) », which does not exist yet: write it at closure, or revert the status if the Pass does not close green.

```json
{
  "token": "eaac3d92",
  "verdict": "FIX",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all (after copy)", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check (after copy)", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check (after copy)", "result": "PASS"},
    {"cmd": "git diff --check 1f4aaf4", "result": "PASS"},
    {"cmd": "git grep -n -e '^h4 ' -e 'btn[[]disabled[]]' -e '[.]quote cite' -e '[.]card > img' -- assets/css/style.css (prints nothing)", "result": "PASS"},
    {"cmd": "git diff -U0 1f4aaf4 -- *.html excluding contact: only ?v= lines", "result": "PASS"},
    {"cmd": "node tools/test-ia-embeds.mjs with 1f4aaf4 video.js swapped in (must fail)", "result": "PASS"},
    {"cmd": "node geom.mjs: innerWidth and element rectangles at 320/375/768/1200, Contact no-JS and invalid", "result": "PASS"},
    {"cmd": "node geom.mjs + node mailbreak.mjs: mailto addresses at 320 newly split (footer on 10 pages, Mentions, Politique)", "result": "FAIL"},
    {"cmd": "node heroshots.mjs + python contrast.py: hero subtitle >= 4.5:1 at 17 widths", "result": "PASS"},
    {"cmd": "node ax.mjs: AX descriptions, FormData equality, four video frame titles and focus", "result": "PASS"},
    {"cmd": "node computed.mjs: computed styles 1200/375 limited to the named elements (port-only URL rows reviewed)", "result": "PASS"}
  ],
  "opened_fix_section": true
}
```

AUDIT r1 COST: 235,590 tokens, 42 min 46 s, FIX (A-008, Tier 2). INVOCATION: fresh pass-auditor subagent (Agent tool; id in the session transcript). USAGE BASIS: whole-contact (Agent completion notice `subagent_tokens`).

## FIX-AUDIT NOTES (A-008)
- Measured (`node evidence/mailbreak.mjs`, 320/334): current tree splits footer « …@sourcinno.co / m » on 10 pages at 320; Politique both + Mentions second « …co / m »; Contact/Mentions contact line « …@sourcinno / .com » at 320, « …sourcinno.c / om » at 334. Before (:4174) every address one line except Contact/Mentions at 320 (overflow, innerWidth 331).
- Trial `overflow-wrap: break-word` (P48_TRIAL, not shipped): footer back to one line at 320; Politique/Mentions in-text and the two contact lines still split arbitrarily (« …co / m », « …c / om »). No CSS-only rule breaks after « @ »: a `<wbr>` in markup is needed (footer partial + Politique + Mentions + Contact), outside Done When 1's list → owner/Planner decision (Coder prompt: ask before any file outside those bounds).

## OWNER ANSWER (A-008) — 2026-10-10
Option 2, smallest change: scope the wrap rule to `.ticks a[href^="mailto:"]` (Contact :86, Mentions :90); footer, Politique and Mentions :115 back to their 1f4aaf4 rendering; the Contact/Mentions address may break mid-word below ~340 px (accepted deviation; no `<wbr>`). Planner adds: the two Contact phone displays (:87, :104) take `&nbsp;`; PLAN § 48 Done When 6 + manual item 1 (veil look at 375). Saved in root 0f950e8 (prompt `prompts/pass48-coder.md`).

## PAUSE
DONE: A-001/A-002/A-003/A-006/A-007 implemented and checkpointed (product 38e107a), TEST-RESULTS r1 green; review contact 1 = FIX A-008; owner answered Option 2 (above).
NEXT: resumed 2026-10-10 in a fresh conversation (contact-1 reviewer not resumable): scope the rule to `.ticks`, phone `&nbsp;`, `node tools/version.mjs`, mailbreak/overflow/comparer reruns, TEST-RESULTS r2, `brief --fresh` (full slice, last contact), MANUAL-1, close.
DOCS: root PLAN § 48 (Planner: A-008 decision, Done When 6, MANUAL-1) and PROGRESS Next Action current in 0f950e8. CHANGELOG untouched (written after the verdict).

## CHANGED r2 (A-008, owner Option 2) — product a8ec73f on top of 38e107a
- `assets/css/style.css:86–87`: `a[href^="mailto:"]` → `.ticks a[href^="mailto:"]` (comment adjusted).
- `contact/index.html:87`, `:104`: displayed phone `+33&nbsp;6&nbsp;08&nbsp;75&nbsp;58&nbsp;77`; `href="tel:+33608755877"` unchanged; footer copy :204 (stamped shell) untouched.
- 16 pages: `?v=` stamp of style.css (`node tools/version.mjs`). Footer partial, Politique, Mentions content: not edited.
- Root `PLAN.md` § 48: status token Done + evidence pointer appended (root repo, outside the seal).
- New evidence scripts (ignored, untracked): `evidence/a008.mjs` (rule reach + Contact phone lines), `evidence/classify.py` (comparer rows by named fix).

## TEST-RESULTS r2
TREE: d30afc1d843db88a
CMD: `node tools/check.mjs --all` 0 (16 pages, both executed tests PASS) · `node tools/version.mjs --check` 0 (43) · `node tools/shell.mjs --check` 0 (10) · `git diff --check 1f4aaf4` 0 · A-006 `git grep` 1 (nothing) · `git diff --stat 1f4aaf4 -- . ':(exclude).WIP'` 19 files = the 4 named + 15 `?v=` pages
CMD: `node evidence/a008.mjs` 0 (:4173: `.ticks a[href^="mailto:"]` = 2 links on the 10 pages, Contact main + Mentions main; computed `overflow-wrap: anywhere` on exactly those 2 mailto links at 320/334/375/1200; Contact phone 1 line at 320/334/375/1200, JS on and off) · before :4174 bad 12 (iw 331 at 320, phone 2 lines at 320 no-JS…)
CMD: `node evidence/mailbreak.mjs` :4173 bad 4 = the 4 accepted splits (Contact/Mentions main at 320 « …@sourcinno / .com », 334 « …sourcinno.c / om »); :4174 bad 2 = iw 331 at 320 · `diff` before/after (heights included): 375/768/1200 identical on 10 pages; 320/334 identical on the 8 other pages; footer, Politique ×2, Mentions :115 one line everywhere, as 1f4aaf4
CMD: `node evidence/overflow.mjs` 0 (36 runs incl. Contact no-JS + invalid, FAILURES 0, outside 0) · `node evidence/ax.mjs` 0 (17 checks) · `node ../pass-loop-p40/evidence/computed.mjs compare evidence/computed-compare-r2.json <profile> http://127.0.0.1:4174 http://127.0.0.1:4173` exit 1 by design + `python evidence/classify.py evidence/computed-compare-r2.json` 0 (OTHER 0)
RESULT: PASS — PLAN § 48 Done When 1–6 green on the final tree; manual item 1 owed (after GREEN).
NOTES: comparer 4544 elements, totalDiffs 33 (31 differing rows + 2 Contact structure entries, same accounting as r1's 61/59): overflow-wrap 32 → 4 (Contact :86 + Mentions :90 at 1200 and 375, element + ::before/::after), grid min-width 16, veil ::before 3 (375), Contact form slot shift 8 — unchanged from r1. Not re-run: `video.mjs` (video.js unchanged since r1) and the contrast pixels (veil computed values identical to r1 per the comparer); both stay r1 evidence.

## EXPECTED TESTS r2 (A-008 answer + owner look, PLAN § 48 Done When 6 and its manual line)
- AUTO-8 `node evidence/a008.mjs` + `node evidence/mailbreak.mjs` before/after at 320/334/375/768/1200 — expect: the scoped rule reaches exactly the 2 `.ticks` mailto links; footer, Politique and Mentions :115 lines identical to 1f4aaf4; Contact phone one line; 0 elements past the width.
- AUTO-9 `node evidence/overflow.mjs` and the Pass 40 comparer at 1200/375 — expect: FAILURES 0; overflow-wrap rows reduced to the two `.ticks` links, other rows as r1.
- [x] MANUAL-1 (owner « ok » 2026-10-10, side-by-side capture `evidence/manual1-veil-375.png`) Owner looks at the three service heroes at 375 px, before/after captures side by side (the end of the veil is navy instead of teal on phones and tablets, needed for 4.5:1) — expect: « OK »; anything else is a new owner decision. No machine can judge whether the darker look is acceptable to the owner. [EYES:judgment]

## Audit — 2026-10-10 (Pass 48, review contact 2 of 2, fresh auditor) — GREEN
VERDICT: GREEN — PLAN § 48 Done When 1–6 hold on independent before/after measurement; A-008 is resolved as the owner's Option 2 defines it; no Tier 1 or Tier 2 finding.
TREES: before = `git -c core.autocrlf=false archive 1f4aaf4`; after = same export of a8ec73f (product `rebuild`, working tree clean; the after copy equals it except CRLF-only working copies of 4 portfolio SVGs and sitemap.xml, untouched by the Pass). Servers 127.0.0.1:4573 before / :4574 after; Chrome `--host-resolver-rules=MAP * ~NOTFOUND` except 127.0.0.1 and Google Fonts; 0 outside requests in every run. Scratch: session scratchpad `p48-audit2/` (own scripts geo/cmp/valid/opened; copies of evidence ax/video/contrast/contrast_pixels and of the Pass 40 comparer, resolver line made strict, logic unchanged).
NATIVE CHECKS (after copy unless stated):
- `node tools/check.mjs --all` PASS — 16 pages, 312 internal links, both executed tests PASS.
- `node tools/version.mjs --check` PASS — 43 references. `node tools/shell.mjs --check` PASS — 10 shell pages, 6 redirects.
- product `git diff --check 1f4aaf4` PASS; A-006 `git grep` of the four selectors in style.css PASS (prints nothing; no page, `_v2/` or shell consumer).
- `git diff --stat 1f4aaf4 HEAD` = 19 files: the 4 named + 15 pages whose only changed lines are `?v=` stamps (`git diff -U0` filtered: nothing else).
- `node --experimental-vm-modules tools/test-ia-embeds.mjs` with the 1f4aaf4 video.js swapped in: FAIL as required (title keeps « (nouvel onglet) »); with the shipped video.js PASS.
AUDITOR MEASURES:
- `geo.mjs` + `cmp.mjs` (10 shell pages × 320/334/375/768/1200, plus Contact no-JS, Contact invalid submit by real click, Mentions no-JS; 65 runs per tree): after innerWidth = width and 0 elements past it in all 65. Footer address (10 pages), Politique ×2, Mentions :115 line boxes identical to 1f4aaf4 at every width; the only address change is Contact :86 / Mentions :90 (« …@sourcinno / .com » at 320, « …sourcinno.c / om » at 334 — owner-accepted). Contact phone one line everywhere, JS on and off (before: no-JS status phone « +33 6 / 08 75 58 77 » at 320/334). Element rectangles before = after at 375/768/1200 on all pages except Contact's 7 error slots gaining ids (same boxes); invalid submit sets error text in all widths after (before at 320 the click failed in the widened layout).
- `valid.mjs` (Contact after a VALID submit in a sandboxed same-origin frame, mailto blocked, 320/334/375/1200): status line and its address on one line, 0 elements past the width.
- `opened.mjs` (every `<details>` opened, 10 pages × 320/375/768): 0 past the width after; rectangles and heights identical to before except the Contact/Mentions fix — `.grid > * { min-width: 0 }` moves nothing else.
- `node computed.mjs compare` 4573 vs 4574 at 1200/375 (exit 1 by design, totalDiffs 33, 4544 elements, outside 0), every row listed: grid children min-width auto→0px; overflow-wrap on exactly the two `.ticks` mailto links; offer veil `::before` on the 3 service heroes at 375 only; Contact form index shift from the removed `p.error`. Nothing else.
- `contrast.mjs` + `python contrast_pixels.py` (3 service heroes × 320/375/641/700/768/800/860/1200 + 375 reduced motion): after 54/54 at or above the bar (subtitle minimum 5.345, Strategy 320); before reproduces 3.34/4.187 (Strategy 320/375), 4.051/4.294 (IA), 2.941–4.193 (Venture 641–768) — the ≤ 860 px media query is justified.
- `ax.mjs` (after 17/17; before 10 FAIL with empty descriptions): each of Name, Need, Message, Email, Consent exposes its error text as description after an empty submit at 375; Tab away and back keeps it; corrected name goes empty; malformed phone/email/short message described; email draft identical before/after (no mail client).
- `video.mjs`: 4 frames × mouse and keyboard at 1200 — title = visible caption without « nouvel onglet », frame focused; YouTube hosts unresolved.
SCOPE: CLEAN — every change traces to § 48 (A-001/2/3/6/7, A-008 Option 2, Planner phone `&nbsp;`); the test-ia-embeds mock and the `?v=` stamps are necessary side work.
SEAL: whole product repository (no sealed paths named); all 19 changed files are tracked there; no tracked `.WIP` change. Not sealed, checked separately: the ignored evidence scripts (read, re-run as copies on my servers) and root `PLAN.md` (`git diff 0f950e8` = status token + evidence pointer only).
Advisory, Tier 3 (not required for closure):
- Root PLAN § 48 already reads « Status Done » and points to « PROGRESS Last Verification (Pass 48) », which does not exist yet, while MANUAL-1 is unchecked and PROGRESS still says PAUSED: write the receipts at closure after MANUAL-1, or set the status back if the owner refuses the veil.
- Mentions hébergeur phone « +370 645 / 03378 » breaks at its space at 320/334 (identical on 1f4aaf4; outside this Pass's files).

```json
{
  "token": "664ce62a",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all (after copy = archive a8ec73f)", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check (after copy)", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check (after copy)", "result": "PASS"},
    {"cmd": "git diff --check 1f4aaf4", "result": "PASS"},
    {"cmd": "git grep -n -e '^h4 ' -e 'btn[[]disabled[]]' -e '[.]quote cite' -e '[.]card > img' -- assets/css/style.css (prints nothing)", "result": "PASS"},
    {"cmd": "git diff --stat 1f4aaf4 HEAD = 4 named files + 15 pages with only ?v= lines", "result": "PASS"},
    {"cmd": "node --experimental-vm-modules tools/test-ia-embeds.mjs with 1f4aaf4 video.js swapped in (must fail)", "result": "PASS"},
    {"cmd": "node geo.mjs + node cmp.mjs: 10 pages x 320/334/375/768/1200 + Contact no-JS/invalid + Mentions no-JS: iw = width, 0 past, footer/Politique/Mentions 115 lines as 1f4aaf4, Contact phone 1 line", "result": "PASS"},
    {"cmd": "node valid.mjs: Contact after valid submit in sandboxed frame at 320/334/375/1200, 0 past", "result": "PASS"},
    {"cmd": "node opened.mjs: all details opened, 10 pages x 320/375/768, 0 past, rects as before except the fix", "result": "PASS"},
    {"cmd": "node computed.mjs compare 4573 4574 (1200/375): only grid min-width, 2 .ticks mailto overflow-wrap, veil ::before at 375, Contact form slot shift", "result": "PASS"},
    {"cmd": "node contrast.mjs + python contrast_pixels.py after: 54/54 at or above bar (before 12 under)", "result": "PASS"},
    {"cmd": "node ax.mjs after 17/17 (before 10 FAIL)", "result": "PASS"},
    {"cmd": "node video.mjs: 4 frames x mouse/keyboard, no nouvel onglet, focused", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: n/a — contact 2 was a FRESH FULL AUDIT (contact-1 reviewer not resumable): AUDIT r2 COST: 212,501 tokens, 16 min 56 s, GREEN. INVOCATION: fresh pass-auditor subagent (Agent tool; id in the session transcript). USAGE BASIS: whole-contact (Agent completion notice `subagent_tokens`, `duration_ms` 1016217).

## MANUAL TEST GUIDE
Setup: none — the captures are shown in the conversation (`evidence/orig-before-service-*-375.png` beside `evidence/orig-after-service-*-375.png`; veil unchanged since r1, comparer r2 confirms).
1. MANUAL-1 — Do: look at the three service heroes at phone width, before beside after. Expect: same photos and layout; the right end of the dark veil is navy instead of teal. Answer « OK » or say what bothers you.

## CLOSURE
UNIT: p48
DOCS: root de82e1e — PLAN § 48 status Done + evidence pointer (before review); PROGRESS Done, Next Action (Pass 49), Last Verification (Pass 48; Pass 47 → pointer 0f950e8), Known minor issues (P48 mid-word address < ~340 px, Mentions host phone); CHANGELOG Pass 48 entry; AGENTS Gotcha « a bare-selector rule also reaches the stamped footer ». PRD/ARCHITECTURE: no change.
MIGRATED: final native + rendered evidence, both review costs and verdicts, owner « ok » on manual item 1 → PROGRESS Last Verification; owner-visible summary → CHANGELOG.
NITS: contact 1 Tier 3 (Contact phone wrap → fixed in a8ec73f; veil navy → manual item 1 « ok »; PLAN Done before PROGRESS receipt → written at closure); contact 2 Tier 3 (same PLAN/PROGRESS ordering → written; Mentions host phone wraps at 320/334 as before P48) → PROGRESS Known minor issues (P48 line).
COMMIT: a8ec73fe3a1238d272597fb76b587f7f0ce026c4 (product rebuild, local only; checkpoint 38e107a before it). LOCAL ONLY: nothing pushed (owner rule).
EVIDENCE KEPT IN GIT: scripts, text/JSON results, the 375 px before/after hero captures and `manual1-veil-375.png`; the other contrast captures (`bg-*`, `orig-*` at 320/641–1200, ~20 MB) stay local and ignored, re-derivable with `contrast.mjs`.
