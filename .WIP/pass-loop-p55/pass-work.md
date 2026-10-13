# Pass 55 — Héros : une photo, le texte par-dessus

Contract: root PLAN § 55 (Goal, Probes 1–4, Planner decisions 1–5, Work 1–4, Done When 1–6) + `prompts/pass55-coder.md` (root 96cb3d0).
Opened 2026-10-13 about 12:08 (reading; first usage reading 10:10 UTC), loop state set 12:10. Product `rebuild` 19fef04 = Pass base (read back from `state.json`). Root `main` a277ef4 → 96cb3d0 « Save approved P55 Planner inputs locally » (5 M, 1 A, 1 D; `outputs/` untouched).

MODEL NOTE: work = claude-opus-5-5 (declared by the session's system prompt, effort not exposed = unknown). Reviewer = the `pass-auditor` agent type with inherited defaults (no model or effort override: PROGRESS Model restriction exception; no instruction asks for a specific effort). Nothing runtime-verified.

Pre-flight (root, 12:02): `plan.py guard` exit 0; product clean on 19fef04; root dirt exactly as the prompt lists; `check-ignore` = `.git/info/exclude:7:/.WIP/`; state dir absent; port 4173 listening (process 61824, earlier session, reused); port 4174 free (used for the scratch copy of 19fef04). `prompts/pass9-coder.md` SHA256 719AC42F…6CF38 unchanged.

## SLICE

One turn of work, as planned (about 60 active minutes): no split asked.

- Pictures (Work 1): root `previews/v12/img/hero2-home.jpg`, `hero2-strategie.jpg`, `hero-venture.jpg` → product `assets/img/hero-home.*`, `hero-strategie.*`, `hero-venture.jpg`, each ≤ 1600 px wide and ≤ 250 KB (Pillow re-encode of the first two; the third copied byte for byte). Nothing read from product `.WIP/mockup-v12/img/`. `pictures/2cvb_hero.png` leaves (only user: `style.css:863`). Entreprise IA: `<img src="/pictures/1ai_hero.jpg" width="554" height="360">`.
- CSS (Work 2): the mockup block `heros-D` written as plain rules (nothing stacked): `.hero--cover`, `.hero__bg`, per-page focus on the existing page classes, `.hero__sub` full white for all heroes. Leaves: `.hero--offer` (rules and class), the home drift/grid/dots, `@keyframes hero-drift`, `--hero-mid`, `--hero-end`. The home title sizing moves under `.hero--home` (the class `hero--animated` is renamed: nothing is animated any more). Class census both ways.
- Markup (Work 3): `index.html` and the three `service-*/index.html`: picture first child of the hero section, `alt=""`, `width`, `height`, no `loading`. No title or subtitle word changes.
- `node tools/version.mjs`; root ARCHITECTURE (hero pictures clause), PLAN § 55 status token + evidence pointer (before final checks and review), CHANGELOG and PROGRESS after the verdict.

Out of scope, untouched: cards and Démarche (56), Portfolio (60), blog list (59), any plain-page picture, hero wording, `og:image`, header/footer (stamped), every JavaScript file.

No manual item in this Pass: owner decision 2026-10-13 (PLAN § V1.2, the overall owner review once Passes 55, 56, 59 and 60 are closed). The Coder looks at every capture itself. Acceptance order = standard (AUTO → one full audit → close).

No live system: every check runs on 127.0.0.1 (4173 working tree, 4174 scratch copy of 19fef04 in the session scratchpad). LIVE-SAFE contract not applicable.

The four plan questions: (1) no manual item; (2) every number below is printed by a named command; (3) no money/auth/migration half; (4) changed files the AUTO suite never executes: `assets/css/style.css` and the four pages are only read as text by `check.mjs` → covered by AUTO-2..5 (rendered in headless Chrome); the three pictures → AUTO-2 (`complete`, `naturalWidth`, a pixel-spread proof on the capture) + AUTO-6 (weights and sizes) + my own look at each file at full size.

## EXPECTED TESTS

Written before any code; `evidence/render.mjs` is first run RED on today's tree and on the scratch copy of 19fef04 (AUTO-4).

- AUTO-1 (Done When 1) from the product: `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check` — expect: exit 0 each; `git diff --stat 19fef04 -- . ':(exclude).WIP'` = `assets/css/style.css`, `index.html`, three `service-*/index.html`, the picture files, one `?v=` line on each of the 12 other pages; `git grep -c -E -e "hero-drift|hero--animated::|--hero-mid|--hero-end" -- assets/css/style.css` prints nothing (9 today).
- AUTO-2 (Done When 2) `node .WIP/pass-loop-p55/evidence/render.mjs`: `/`, the three service pages × 1920, 1200, 961, 861, 860, 375, 320 px × reduced motion off and on — expect: Inter loaded; hero picture `complete`, `naturalWidth > 0`, and its pixels really on screen (spread of the captured picture area); `<h1>` in white, the home accent word in its own colour, and the subtitle ≥ 4.5:1 against the worst pixel inside each line box (text hidden, box captured inside the viewport, no `captureBeyondViewport`); no element's right edge past the width; every title word on one line and inside the title box; hero 520 px (home) / 400 px (service) ± 2 at 1200; picture box = right 70 % of the hero from 861 px, a 230 px full-width block on top below; 0 request outside 127.0.0.1 and Google Fonts.
- AUTO-3 (Done When 3) same script: 404, Contact, Mentions légales, Confidentialité, Portfolio, Publications × 1200, 375, 320 — expect: subtitle ≥ 4.5:1 by the same measure; hero box x, y, width, height equal to `baseline.json` (written from 19fef04).
- AUTO-4 (Done When 4) same script with `P48_BASE=http://127.0.0.1:4174 P55_BASELINE=write` on `git -c core.autocrlf=false archive 19fef04` — expect: exit 1, the three subtitles of probe 3 under 4.5:1 (Contact, Publications, Mentions légales at 375 px), no photo hero; writes `baseline.json`.
- AUTO-5 (Done When 5) same script: scripts disabled, the four photo pages × 1200, 375 — expect: picture, title, subtitle shown by their own boxes inside the viewport and the picture's pixels on screen; and, scripts on and off, every `main > section` after the hero and the footer keep their height, and the two home service cards their computed background picture, against `baseline.json`.
- AUTO-6 pictures: `python` (Pillow) prints width, height and bytes of each new file — expect: ≤ 1600 px, ≤ 250,000 bytes; `git ls-files` shows no file from `.WIP/mockup-v12/img/`, no « dreamstime » picture (`hero2-ia`, `src2-ia`) outside `.WIP`.

Not covered, said here: the six redirect stubs' hero (same `hero--page` rules as Mentions légales; a stub leaves its page at once); any browser but Chrome.

## CHANGED

Product (`rebuild`, base 19fef04):
- `assets/css/style.css`: `.hero__sub` full white; the photo hero (`.hero--cover`, `.hero__bg`, focus per page on `.hero--home` / `--strategie` / `--venture`, stacked block up to 860 px); gone: `.hero--offer` and its two veils, the home drift, grid and dots (`.hero--animated` and its `::before` / `::after`, `@keyframes hero-drift`, the 640 px block), tokens `--hero-mid` and `--hero-end`, the three hero background declarations (the two card ones stay).
- `index.html`, `service-strategie-transformation/index.html`, `service-ia-business/index.html`, `service-venture-building/index.html`: hero class and the picture as first child (`evidence/markup.py`, bytes patched, LF kept); the home hero comment.
- `assets/img/hero-home.webp`, `hero-strategie.webp`, `hero-venture.jpg` added (`evidence/pictures.py`); `pictures/2cvb_hero.png` removed (no user left).
- The 12 other pages: one `?v=` stamp each (`node tools/version.mjs`).
Root docs (other repository, NOT under this loop's seal: named here): `PLAN.md` § 55 status token + evidence pointer; `ARCHITECTURE.md` Components, `style.css` clause (hero pictures).

Choices the plan left to the Coder, and one difference from the mockup page:
- Classes: `hero--cover` + the page class; `hero--animated` renamed `hero--home` (nothing animated is left), `hero--offer` gone, Entreprise IA has no page class (default focus 50 % 50 %). `data-hero-kind` not ported.
- Pictures as WebP (the tree already serves `about-strategy.webp`): home quality 82 = 229,922 bytes, Stratégie quality 88 = 233,716 bytes, both 1600x900 from the mockup JPEG; Venture copied byte for byte (105,929 bytes). Looked at full size: no banding, no watermark.
- DIFFERENCE, home at 640 px and less: on the mockup PAGE the scrim of the home was half as dense and missed the left quarter, because today's rule `.hero--animated::after { inset: 0 0 0 25%; opacity: 0.5 }` (the 640 px block of the dots) still applied to it; the mockup BLOCK `heros-D` does not say so and the three service pages did not have it. Decision 4 removes that rule with the dots, decision 3 gives the block's scrim: the site now has the same scrim on the four pages. Visible effect at 375 px: the picture shows a little less behind « De la Stratégie »; measured effect: the accent word goes from 4.63:1 (mockup) to 10.56:1. Way back if the owner prefers the mockup page: one rule, `@media (max-width: 640px) { .hero--home::after { inset: 0 0 0 25%; opacity: 0.5; } }`.
- The gate of the contrast measure is the plan's one (worst pixel of the box around the whole text, as `probe-live.mjs`); the value inside the line boxes alone is printed beside it. A first version gated on the line boxes only and reported one subtitle of probe 3 instead of three on 19fef04: corrected before any code.
- Nothing adjusted in the scrim or the sizes for 1920, 861–960 or 320 px: all measured green as ported.

## TEST-RESULTS r1
TREE: 283cc2fca6dfdfd6
CMD: `node tools/check.mjs --all` · `node tools/version.mjs --check` · `node tools/shell.mjs --check` · `git diff --stat 19fef04 -- . ':(exclude).WIP'` · `git grep -c -E -e "hero-drift|hero--animated::|--hero-mid|--hero-end" -- assets/css/style.css` · `node .WIP/pass-loop-p55/evidence/render.mjs` (4173 = the working tree, P48_PROFILES = session scratchpad)
RESULT: PASS — check 0 (« aucun probleme sur 16 page(s) », three executed tests PASS), version 0 (43 references, 16 pages), shell 0 (10 pages, 6 stubs skipped); diff stat = 21 files: `style.css`, 4 pages, 3 pictures added, `2cvb_hero.png` removed, one line on each of the 12 other pages; the grep prints nothing (exit 1; 9 on 19fef04); render exit 0, 756 ok, 0 FAIL (`evidence/render.txt`).
NOTES:
- AUTO-4 red run, `P48_BASE=http://127.0.0.1:4174 P55_BASELINE=write node …/render.mjs` on `git -c core.autocrlf=false archive 19fef04` (same bytes as the tree before any code): exit 1, 69 FAIL = 64 « no picture in the hero » + subtitle 4.22:1 Contact 375, 4.30:1 Mentions légales 375, 4.30:1 Publications 375 (probe 3's three values), 4.36:1 Mentions légales 320, 4.40:1 Publications 320 (`evidence/render-red-19fef04.txt`); it wrote `baseline.json`.
- Mutation on a scratch copy of the tree (scrim rules removed + Venture picture address broken), same script: exit 1, 79 FAIL = 47 contrast lines on the home and Stratégie (home 1200: title 4.22:1, accent word 2.92:1, subtitle 2.30:1) + 32 Venture picture lines (`evidence/mutation-red.txt`). The scrim and the picture are what the gates measure.
- Lowest values on the tree: plain pages 5.06:1 (Contact 375; was 4.22), 5.16:1 (Mentions légales and Publications 375); photo pages 7.94:1 (home accent word at 1920), every phone-width value ≥ 10.41:1. Hero 520 px (home) and 400 px (three service pages) at 1200. Heights below the hero and both home card pictures = 19fef04 at 1200 and 375, scripts on and off (16 lists). Plain hero boxes = 19fef04 (18). Hosts asked outside 127.0.0.1 and Google Fonts = 19fef04 (46 lists).
- AUTO-6: hero-home.webp 1600x900 229,922 bytes; hero-strategie.webp 1600x900 233,716; hero-venture.jpg 1024x1536 105,929 (`cmp` = the mockup file); `git ls-files` holds no `mockup-v12`, `hero2-ia`, `src2-ia` or « dreamstime » name.
- Looked at by the Coder (contact sheets in the session scratchpad): the four heroes at 1920, 1200, 861, 860, 375, 320. Seen: at 1920 the home title takes three lines (72 px in a 556 px box; two lines at 1200); the Entreprise IA picture (554x360) is soft from 1200 up; Inter on every capture.
- Port 4174 served, in turn, the scratch copy of 19fef04 then the mutated copy; both stopped. Not covered: the six redirect stubs, any browser but Chrome.

## Review contact 1 of 2 — FULL AUDIT p55 — reviewer verdict (2026-10-13)

Greenlight — Done When 1 to 5 re-measured by the reviewer's own render and all hold; no Tier 1 or Tier 2 finding. Nothing to fix.
NATIVE CHECKS: `node tools/check.mjs --all` PASS (exit 0, 16 pages) · `node tools/version.mjs --check` PASS · `node tools/shell.mjs --check` PASS · dead-rule `git grep` prints nothing · `git diff --stat 19fef04 -- . ':(exclude).WIP'` = the 21 allowed files only.
SCOPE: CLEAN — every changed line traces to PLAN § 55 Work 1 to 4.
COVERAGE: 21/21 changed files read (style.css diff, 4 hero pages, `?v=` line of 12 pages, 3 added pictures viewed at native size, 1 removed picture checked for consumers) — skipped: none. Docs root (second repository, NOT sealed): `git diff -- PLAN.md ARCHITECTURE.md` read; the ARCHITECTURE clause matches the code.

Measured by the reviewer (own script `rv.mjs`, session scratchpad `reviewer-p55/`; headless Chrome at the exact widths, Inter 400–700 loaded, requests only to 127.0.0.1 and Google Fonts; 19fef04 archived with `core.autocrlf=false` and served on 127.0.0.1:4174, the approved mockup `previews/v12` over it on 4175, both stopped):
- Stake 1, contrast: four photo pages × 15 widths (2560, 1920, 1440, 1200, 1024, 961, 861, 860, 768, 641, 640, 480, 375, 360, 320), reduced motion both ways at the seven PLAN widths. Worst pixel behind the glyphs ≥ 8.5:1, behind the line boxes ≥ 7.82:1, behind the whole element boxes ≥ 7.82:1 (home accent word, 1920). Six plain pages × 10 widths: subtitle ≥ 5.10:1 (line boxes), 4.87:1 worst on the whole paragraph box (Contact, 480); none under 4.5 over 120 page/width pairs. The measure can fail: scrim and mask removed by an injected rule → 1.0 to 3.4:1; on 19fef04 it gives Contact 4.62, Mentions légales 4.30, Publications 5.88 at 375 (line boxes), the same three figures as the Coder's red run.
- Stake 2, pictures: `hero-venture.jpg` byte-identical to docs-root `previews/v12/img/hero-venture.jpg`; `hero-home.webp` and `hero-strategie.webp` = 1600×900 re-encodings of `hero2-home.jpg` / `hero2-strategie.jpg` (mean absolute difference 2.7 and 1.8 of 255); 229,922 / 233,716 / 105,929 bytes; `width`/`height` attributes = natural sizes. The watermarked `hero2-ia.jpg` and `src2-ia.webp` match no tracked or unignored file (sha256 over the tree and over this folder); the four pictures and the two Entreprise IA captures of this folder viewed, corners at native size: no watermark.
- Stake 3, below the heroes: 19fef04 against the working tree, 10 pages, scripts off at 1920/1200/861/860/375/320 and scripts on (scrolled through, every `.reveal` shown) at 1200/375 = 80 comparisons of every element outside the hero (position from the hero's bottom, size, 480 sorted computed properties, `::before`/`::after`): 0 real difference; `:root` lost `--hero-mid` and `--hero-end` only; the two home service cards compute the same backgrounds. Plain heroes: same box, same inner boxes, only the subtitle colour family changed.
- Stake 4, dead rules: no `hero-drift`, `hero--animated`, `hero--offer`, `hero--ia`, `--hero-mid`, `--hero-end`, `2cvb_hero` left in the tree outside `.WIP`; class census green both ways (132 HTML classes, 153 selector classes, 0 unused).
- Stake 5, scripts disabled: four photo pages at 1200, 861, 860, 375, 320: picture `complete` with its natural width, title and subtitle boxes on screen at opacity 1, same contrast; captures viewed.
- Port against the mockup: 36 hero/width pairs (four heroes × 1920, 1200, 961, 861, 860, 641, 640, 375, 320): hero, picture, title, subtitle and button boxes, font sizes, focus points, mask and scrim identical; the only style difference is the declared home scrim opacity at 640 px and less (1 here, 0.5 in the mockup page).
- Captures viewed: four photo pages at 1920, 1200, 861, 860, 375, 320; Contact, Publications, Mentions légales (and 404, Confidentialité, Portfolio) at 375; mockup beside the build at 1200 and 375.

Non-blocking observations (Tier 3, no fix section):
1. Home title on three lines (« à la » alone on the second) from about 1230 px wide and up (measured 1230, 1280, 1366, 1440, 1536, 1920, 2560); two lines at 1200 and, on 19fef04, at every desktop width. The approved mockup does the same; the Coder declared it for 1920 only. Worth one wide-screen look at MANUAL-V12.
2. Declared home scrim at 640 px and less: accepted. It raises the worst contrast (accent word 10.56:1 against 7.51:1 in the mockup page at 375, same measure) and makes the lower part of the phone picture slightly darker than on the approved capture.
3. `assets/css/style.css:852` (`.card--strategie` → `about-strategy.webp`) is always overridden by `#services .card--strategie` (:854, gradients; already so on 19fef04). With the Stratégie hero off that picture, `assets/img/about-strategy.webp` (84 KB) is requested by no page; the CSS comment and the ARCHITECTURE clause still call it a card picture. PLAN probe 2 premise was wrong for that card. Planner's call (Code backlog).
4. Home on phones: hero 518 px high (412 on 19fef04); the « Rendez-vous » button sits 507–563 px from the top, so a viewport under about 565 px high cuts it on the first screen (same geometry as the approved mockup).
5. Entreprise IA picture 554×360 stretched up to 1792 px: visibly soft from 1440 px (accepted, PLAN decision 2; licensed file = release gate). Origin of the Accueil and Stratégie pictures still not stated (mockup README open question 2).
6. Phones download the 1600×900 hero file (230 KB home, 234 KB Stratégie) for a 375×230 slot: inside the plan's cap, no smaller variant.
7. PLAN § 55 already reads « Status Done » and points to a PROGRESS « Last Verification (Pass 55) » entry and a journal commit that do not exist yet (product HEAD = 19fef04, nothing committed; docs-root PROGRESS.md unmodified): true only after closure.
8. The Coder's render laid the widths above 860 out with a 15 px scrollbar (hero 1905, 1185, 946, 846 px wide in `render.txt`); the reviewer's render used the exact widths; both pass.
9. Not rendered by the reviewer: the six redirect stubs (their `?v=` line and the shared subtitle colour only); any browser but Chrome.
10. The server on port 4173 left by an earlier session listens on 0.0.0.0, not on 127.0.0.1 only.

```json
{
  "token": "ed382876",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --stat 19fef04 -- . ':(exclude).WIP' (21 files: style.css, 4 hero pages, 3 pictures added, 1 removed, ?v= line of 12 pages)", "result": "PASS"},
    {"cmd": "git grep -c -E -e 'hero-drift|hero--animated::|--hero-mid|--hero-end' -- assets/css/style.css (prints nothing) + grep hero--animated|hero--offer|hero--ia|2cvb_hero over the tree outside .WIP (no match)", "result": "PASS"},
    {"cmd": "sha256sum + python pics.py: tracked hero pictures vs docs-root previews/v12/img and vs .WIP/mockup-v12/img (watermarked files absent, sizes and dimensions in the cap, pictures viewed)", "result": "PASS"},
    {"cmd": "node rv.mjs out photo + node sum-photo.mjs (reviewer render, 4 photo pages x 15 widths, reduced motion both ways: contrast, picture box, hero heights, overflow, word cuts, Inter)", "result": "PASS"},
    {"cmd": "node rv.mjs out mutate (scrim and mask removed by an injected rule: ratios fall to 1.0-3.4, the measure can fail)", "result": "PASS"},
    {"cmd": "node rv.mjs out plain (six plain pages x 10 widths, subtitle contrast; hero box against 19fef04 at 1200, 375, 320)", "result": "PASS"},
    {"cmd": "node rv.mjs out boxall (whole title, accent word and subtitle boxes, 10 pages, 120 page-width pairs: worst 4.87:1)", "result": "PASS"},
    {"cmd": "node rv.mjs out nojs (scripts disabled, 4 photo pages at 1200, 861, 860, 375, 320: picture, title, subtitle visible)", "result": "PASS"},
    {"cmd": "node rv.mjs out mock + node mockdiff.mjs (build vs approved mockup, 36 hero-width pairs: only the declared home scrim opacity differs)", "result": "PASS"},
    {"cmd": "node rv.mjs out basehome,compare + node strict-compare.mjs (19fef04 vs working tree, 10 pages, 80 comparisons: 0 real difference outside the heroes, home card backgrounds unchanged)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 328,769 tokens, 28 min 48 s, GREEN (confidence high; 13 evidence entries, all PASS; no fix section, no test request)
INVOCATION: agent task a1c7cf9f78a625926 (`pass-auditor` agent type, fresh, inherited settings: no model or effort override passed, none verified)
USAGE BASIS: unknown (the `subagent_tokens` figure of the agent completion notice; probably cumulative, as for P53 to P57)
Brief reserved 12:32, verdict imported 13:01. Contacts: 1 of 2.

## CLOSURE
UNIT: p55
DOCS: root PLAN section 55 status token Done + evidence pointer and root ARCHITECTURE (style.css clause: hero pictures) corrected BEFORE the review; root PROGRESS (Current Objective, Done, Next Action, Last Verification, Known minor issues) and root CHANGELOG (one owner-readable entry) written after the verdict. PRD and root README untouched (Planner-only).
MIGRATED: final AUTO evidence, the red run on 19fef04, the mutation run, the measured values, the review verdict and its cost into root PROGRESS Last Verification (Pass 55); what shipped into root CHANGELOG. No manual item in this Pass (owner decision 2026-10-13: his overall review comes after Passes 55, 56, 59 and 60).
NITS: the reviewer's eleven Tier 3 observations are in root PROGRESS, Known minor issues, line P55 (three-line home title from about 1230 px, phone hero height and the button on short screens, the declared phone scrim difference, the soft Entreprise IA picture, the 1600 px file on phones, about-strategy.webp asked by no page, stubs and other browsers not rendered, port 4173 listening on every interface); two concern this loop only and stay here: the PLAN pointer named a commit and a PROGRESS entry that did not exist before closure (true since this record), and the Coder render measured desktop widths with a 15 px scrollbar (hero 1905, 1185, 946, 846 px wide) where the reviewer used exact widths, both green. Its note on a usage-check line appended to a tool result is a session hook, not a finding.
COMMIT: 016c2ef5ead8c898a0244d8d422497b8f6faba45 (product `rebuild`, LOCAL ONLY, not pushed by owner rule; seal 283cc2fca6dfdfd6 before and after the commit; `node tools/check.mjs --all` exit 0 again on it, `version.mjs --check` 0, `shell.mjs --check` 0, `git diff --check 19fef04` 0)
