# Pass p65 — Préparation de mise en ligne

## STARTUP
Prompt: root `prompts/pass65-coder.md` (root Planner-inputs commit 848e2f5). Pre-flight matched the prompt exactly: root 40f76e5 + expected dirt, product rebuild 4f3875c clean, `plan.py guard` 0, check-ignore via `.git/info/exclude:7`, state dir absent, `ls-files .WIP` 614, port 4173 = PID 21968 answering 200 on `/tools/check.mjs` (reused, not started here).
pass_base read from state.json right after the first `set`: 4f3875c7841ea562b470f5ec9574a5348f6521cd = product HEAD at that moment.
MODEL NOTE: work = claude-opus-5-5 (session system prompt, runtime-declared); effort not exposed (unknown). Auditor = same model, effort unknown: the Agent tool exposes no effort control without an explicit owner request, so the reviewer inherits defaults (PROGRESS Model restriction exception). Declared, not verified by the script.
Seal: whole product repository, no seal_paths. NOT covered by this seal: the root repository's docs (PLAN, PROGRESS, CHANGELOG, ARCHITECTURE, AGENTS live there), the ignored `.WIP` folder on disk, the scratch copy of 4f3875c; each gets its own named receipt below.

## SLICE
One turn of work (about 60 active minutes, audit excluded), matching the plan. PLAN § 65 decisions 1–4, Work 1–4:
- W1: `.gitignore` gains `.WIP/`; `git rm -r --cached .WIP` (614 index deletions, folder kept on disk); one product commit.
- W2: `git rm` `assets/img/ai-for-business-video.jpg` and `assets/img/about-strategy.webp`; delete `style.css:852` (`.card--strategie { background-image: url(about-strategy.webp) }`), keep `#services .card--strategie` (:854, the live rule); the comment above (:849–851) reworded so it no longer says « the two cards » are image-backed (it would become false); `node tools/version.mjs`.
- W3: the release audit = this Pass's review contact (code-audit repo mode over `670f72f..HEAD`); code items fixed here, owner/server items routed by ONE appended line each under PLAN § Release acceptance.
- W4: ARCHITECTURE, AGENTS Gotcha line, CHANGELOG, PROGRESS (root repository).
Gates: none internal (no money, auth or migration path). Live checks: none (local server on 127.0.0.1 only; LIVE-SAFE contract not applicable). Network: 127.0.0.1 and Google Fonts only (cdp.mjs resolver rule).
Acceptance order: standard (AUTO → one full audit → close). No MANUAL item for this Pass: every criterion is machine-provable (git counts, native checks, headless render); the owner's publication gestures (licences, Typebot, server read, mail test, phone check after deploy) come after the Pass and stay in PLAN § Release acceptance, not here.

## EXPECTED TESTS
- AUTO-1 `git ls-files .WIP | wc -l` — expect 0 at the W1 commit and again on the reset commit (Done When 1).
- AUTO-2 `git check-ignore -v .WIP/x` — expect `.gitignore:4:.WIP/` (the shared file, not `.git/info/exclude`).
- AUTO-3 `git ls-files | wc -l` — expect 121 (123 − 2 pictures).
- AUTO-4 `git grep -n -E "ai-for-business-video|about-strategy" -- . ':!.WIP'` — expect nothing, exit 1.
- AUTO-5 `git show 4f3875c:.WIP/pass-loop-p63/evidence/render.mjs` — still answers after the W1 commit (receipts intact).
- AUTO-6 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check` — exit 0 each (16 pages, three executed tests PASS, BLOG 12 articles; class census green with `card--strategie` still used).
- AUTO-7 `git diff --check 4f3875c HEAD` exit 0; `git diff --stat 4f3875c HEAD -- . ':(exclude).WIP'` = `.gitignore`, the two deleted pictures, `assets/css/style.css`, `?v=` lines, and any file the audit's Fix Plan names.
- AUTO-8 headless render (`evidence/render.mjs`, copied from Pass 63 and narrowed): ten shell routes × 1200/375 × scripts on/off — heights of header, each `main` block and footer equal to the 4f3875c copy served on 127.0.0.1:4174; script errors 0; `#services .card--strategie` computed `background-image` equal to 4f3875c at 1200 and 375; one capture of the home service cards at 1200 kept (Inter checked first).
- AUTO-9 historical workflow: `git diff 670f72f HEAD -- .github/workflows/deploy-hostinger.yml` = the one `if: ${{ false }}` guard only.
- AUTO-10 PLAN § Release acceptance: `git diff 848e2f5 HEAD -- PLAN.md` (root) shows no removed line under that heading.
Changed files the AUTO suite never reaches: none of the product's runtime files beyond those executed by check.mjs and the render; `.gitignore` is read by AUTO-1/2; root docs are read by AUTO-10 and the auditor.
Audit budget: 2 contacts (cap 2): one fresh release audit, one same-auditor confirmation only if it asks for code fixes.

## CHANGED
Product (pass_base 4f3875c):
- 6803475 W1: `.gitignore` +`.WIP/` (LF kept, 4 lines); 614 `.WIP` paths removed from the index, folder kept on disk.
- a4131b8 W2: `git rm` `assets/img/about-strategy.webp`, `assets/img/ai-for-business-video.jpg`; `assets/css/style.css` the `.card--strategie { background-image: url(about-strategy.webp) }` line removed and the comment above reworded (it said both home cards were image-backed); `node tools/version.mjs` restamped the one `style.css?v=` line on 16 pages (40 references).
Evidence (ignored state dir): `evidence/cdp.mjs` (byte copy of `4f3875c:.WIP/pass-loop-p63/evidence/cdp.mjs`, 4814 bytes, compared in Python), `evidence/render.mjs` (narrowed from the P63 render).
Baseline: `git -c core.autocrlf=false archive 4f3875c -- . ':(exclude).WIP'` extracted to the session scratchpad (123 files), served `python -m http.server 4174 --bind 127.0.0.1` (started by this session; background task).
Root repository (not in this seal), before review: PLAN § 65 status token Done + evidence pointer; ARCHITECTURE Components (the home Stratégie card has no picture) and Constraints (`.WIP` untracked since Pass 65); AGENTS Gotcha « Scratch belongs in `.WIP` » extended. PROGRESS and CHANGELOG are written after the verdict.

## TEST-RESULTS r1
TREE: 39c143a123bf2897
CMD: `node tools/check.mjs --all` · `node tools/version.mjs --check` · `node tools/shell.mjs --check` · `git diff --check 4f3875c HEAD` · `P48_PROFILES=<scratch> node .WIP/pass-loop-p65/evidence/render.mjs`
RESULT: PASS — check.mjs 0 « OK — aucun probleme sur 16 page(s) » (three executed tests PASS, BLOG 12 articles); version 0 (40 references); shell 0 (9 pages, 7 stubs); diff --check 0; render « 126 checks, failing 0 » (10 routes × 1200/375 × scripts on/off: heights = 4f3875c, 0 script errors, every page Inter; home cards' computed background-image and size = 4f3875c; capture `services-cards-1200.jpg` 1185×800, Inter, looked at). Receipts in `evidence/check-all.txt`, `evidence/render.txt`.
NOTES: Done When 1 at HEAD a4131b8: `git ls-files .WIP` 0; `git check-ignore -v .WIP/x` = `.gitignore:4:.WIP/`; `git ls-files` 121; grep of the two picture names exit 1 (nothing); `git show 4f3875c:.WIP/pass-loop-p63/evidence/render.mjs` answers (349 lines, exit 0); workflow `git diff 670f72f HEAD` empty (670f72f already holds the one `if: ${{ false }}` guard).
Red run (`evidence/render-red-mutant.txt`, PARTIAL, routes `/` and `/contact/`): a scratch copy of HEAD with `#services .card--strategie { background-image: none }` and `.site-footer { padding-bottom: 99px }` appended, served on 4175 → 12 of 28 FAIL: every footer height (363.5→438.5 at 1200, 850.5→925.5 at 375, scripts on and off) and the Stratégie card background (gradient → none) at both widths, scripts on and off. Mutation copy only; the tree was never mutated.
Probe defects found and fixed before the green run, named: (a) the card comparison first included the server origin in `url(...)` (4173 vs 4174), read as a false FAIL — origin now stripped in the page; (b) Git Bash rewrote `P65_ROUTES=/,…` into `C:/Program Files/Git/` (the known path-conversion trap, usage_coding ENVIRONMENT TRAPS) — red run repeated with `MSYS_NO_PATHCONV=1`.

## Audit fixes to implement — 2026-10-15
Release audit, code-audit REPO mode over product 670f72f..a4131b8 (contact 1 of 2, fresh auditor).
BLOCKING_STATUS: NON_BLOCKING
READINESS: READY_WITH_FIXES
REASON: All code checks pass and this Pass changed nothing visible. Two owner-side risks found in the release range are missing from the release checklist (PLAN § Deferred / Release acceptance), and one release criterion cannot pass as things stand.
NATIVE CHECKS: `node tools/check.mjs --all` PASS — 16 pages, three executed tests PASS, BLOG 12 articles, census 0 without rule / 0 without use
NATIVE CHECKS: `node tools/version.mjs --check` PASS — 40 references; `node tools/shell.mjs --check` PASS — 9 pages, 7 stubs
NATIVE CHECKS: `git diff --check 4f3875c HEAD` PASS; `git diff --check 670f72f HEAD -- . ':(exclude).WIP'` PASS
NATIVE CHECKS: `.WIP` 0 tracked, `git check-ignore -v .WIP/x` = `.gitignore:4`, 121 tracked files, cited `git show <sha>:.WIP/…` evidence reachable (product 27b136c 60582be 271bd50 6b7a59e 8d850e5; root cee3e9e) PASS
NATIVE CHECKS: workflow blob ae13e30 identical at 670f72f and HEAD, one `if: ${{ false }}` PASS; `FORM_ENDPOINT: ""` PASS; secret scan of `git log -p 670f72f..HEAD` + discover_repo `secret_paths` [] PASS
NATIVE CHECKS: auditor render, 10 routes x 1200/375 x scripts on/off, HEAD vs 4f3875c export: 80 loads, 0 section-height diffs, 0 script errors, 0 failed requests, Inter loaded, home `.card--strategie` background identical PASS
NATIVE CHECKS: auditor contact render 1200/375: scripts on = prefilled mailto, « vous devez encore l’envoyer », no delivery claim; scripts off = draft link + phone, no overflow PASS
NATIVE CHECKS: `tools/logo-band.py` re-run (17f0a00, the unreviewed item of § Release acceptance P52) rebuilds all 13 `pictures/band_*.png` byte for byte; widths/heights match `index.html`, CSS 48 px PASS
SCOPE: CLEAN — the Pass diff is .gitignore, the two pictures, one CSS line + comment and the ?v= stamps, all asked by § 65 decisions 1–2
COVERAGE: 20/20 changed non-.WIP files read (the 614 `.WIP` index removals not read: untracked scratch, still on disk and reachable in history, checked by count and `git cat-file -e`)

### A-001 | Tier 2 | MEDIUM | `assets/img/blog/l-ia-fait-le-job-de-700-personnes-1.webp`, `assets/img/blog/enjeu-1-de-l-ia-sa-vitesse-d-evolution-1.png`
- issue: Five blog pictures added since 670f72f are clearly someone else's work, and the § Release acceptance licence list does not name them. They are a BFM Business TV frame showing an identifiable guest (`l-ia-fait-le-job-de-700-personnes-1.webp`), two portraits of Barack Obama of unstated origin (`enjeu-1-de-l-ia-sa-vitesse-d-evolution-1.png`), and three charts copied whole from Berkeley (`enjeu-1-de-l-ia-sa-vitesse-d-evolution-2.webp`), bloomberry/Revealera (`l-ia-modifie-t-elle-deja-le-marche-du-travail-1.png`) and Bain & Company (`corporate-venture-building-longer-to-startup-quicker-to-scaleup-1-1.png`). The P57/P58 rule only checks the Wix prefix `ea3de5_`, which shows who uploaded a file, not who owns it, so it cannot catch these.
- fix: Owner-side route, no code. Add one line to PLAN § Deferred / Release acceptance that names the five files: before publication the owner confirms each one is his own, licensed, or quoted with its source; otherwise he replaces or drops it (light route: the picture line of its `tools/blog/` file, the picture file, then `node tools/blog-sync.mjs`). Name the same gesture in PROGRESS Open « Publication ».
- test: From the root, `git diff 848e2f5 -- PLAN.md` shows the added line naming the five files under § Release acceptance, and no line removed under that heading.

### A-002 | Tier 2 | MEDIUM | `assets/js/ia-embeds.js:42`, `assets/js/vendor/typebot-js-0.10.11/web.js:56`
- issue: Since Pass 64, the Typebot chat starts without a click as soon as Entreprise IA « Réflexion » comes on screen. The bot's first bubble is a YouTube video, which Typebot embeds from `https://www.youtube.com/embed` (not youtube-nocookie) with autoplay on by default (`isAutoplayEnabled:!0`). So every visitor who scrolls there loads a YouTube frame, and its cookies, without consent. This goes against the site's own click-to-play rule (PLAN § V1.1 D2) and the privacy page's « ni bannière cookies » (`politique-confidentialite/index.html:105`). The issue is recorded only in PROGRESS Open, not in the Typebot line of § Release acceptance.
- fix: Owner-side route. Extend the Typebot bullet of § Release acceptance: before publication the owner deletes the video bubble in the Typebot editor (his 2026-10-15 remark « Tout supprimer, y compris la vidéo »). If he keeps the video, the chat goes back to starting on a click before publication (code, light route).
- test: The § Release acceptance Typebot bullet names the video bubble and the owner's gesture, with no line removed under the heading.

### A-003 | Tier 2 | LOW | root `outputs/` (project root repository)
- issue: The release criterion « `git status --short` is clean in both repositories », and this Pass's Done When 4, cannot pass. Root `git status --short` lists `?? outputs/` (the owner's private Excel pilot), and no root ignore rule covers it, although PROGRESS Next Action says « `outputs/` and `archive/` stay out of git ».
- fix: Add `outputs/` to the root `.gitignore` next to `archive/`, or have the owner move the folder out of the project. Then commit the pending root doc edits.
- test: From the project root, `git status --short` prints nothing and `git check-ignore -v outputs/x` names `.gitignore`.

NOTE (Tier 3, advisory, not to implement in this Pass):
- Three more pictures are used by no page: `assets/img/about-business-model.webp`, `pictures/1ai_chg_mgt.png` (450 KB) and `pictures/logo_linkedin_nb.png`. They were already unused at 670f72f; remove them later by the light route.
- Three client logos are new since 670f72f (Mazars, Guide Michelin, Fabereo). The owner confirms he may show them, as for the ten earlier ones.
- `/tools/` and `/.github/` are served by the static root. They are already public on GitHub, and robots.txt disallows `/tools/`.
- The root PLAN working copy already marks § 65 « Status Done » before this verdict was given.

```json
{
  "token": "2edc0b3a",
  "verdict": "FIX",
  "confidence": "high",
  "evidence": [
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
      "cmd": "git diff --check 4f3875c HEAD",
      "result": "PASS"
    },
    {
      "cmd": "git diff --check 670f72f HEAD -- . ':(exclude).WIP'",
      "result": "PASS"
    },
    {
      "cmd": "git ls-files .WIP | wc -l (0); git check-ignore -v .WIP/x (.gitignore:4); git ls-files | wc -l (121)",
      "result": "PASS"
    },
    {
      "cmd": "git cat-file -e 27b136c/60582be/271bd50/6b7a59e/8d850e5 :.WIP/... (product) and cee3e9e:.WIP/pass-loop-p8/pass-work.md (root)",
      "result": "PASS"
    },
    {
      "cmd": "git diff --quiet 670f72f HEAD -- .github/workflows/deploy-hostinger.yml (blob ae13e30 both)",
      "result": "PASS"
    },
    {
      "cmd": "grep FORM_ENDPOINT assets/js/config.js (FORM_ENDPOINT: '')",
      "result": "PASS"
    },
    {
      "cmd": "git log -p 670f72f..HEAD | grep -E secret/key/token/private-key/webhook patterns; python discover_repo.py . (secret_paths empty)",
      "result": "PASS"
    },
    {
      "cmd": "node render.mjs: 10 routes x 1200/375 x scripts on/off, HEAD (127.0.0.1:4173) vs 4f3875c export (127.0.0.1:4175)",
      "result": "PASS"
    },
    {
      "cmd": "node contact.mjs: /contact/ at 1200/375 scripts on (prefilled mailto, no delivery claim) and off (draft link fallback)",
      "result": "PASS"
    },
    {
      "cmd": "python tools/logo-band.py (scratch copy, output redirected) vs pictures/band_*.png sha256",
      "result": "PASS"
    },
    {
      "cmd": "visual review of every picture added since 670f72f vs PLAN Release acceptance licence lines",
      "result": "FAIL"
    },
    {
      "cmd": "grep -o -F 'https://www.youtube.com/embed' assets/js/vendor/typebot-js-0.10.11/web.js (Typebot video bubble; chat started on view by assets/js/ia-embeds.js:42)",
      "result": "FAIL"
    },
    {
      "cmd": "git -C C:/Users/aymar/AYS_CODING/code-SOURCINNO_WWW status --short (?? outputs/)",
      "result": "FAIL"
    }
  ],
  "opened_fix_section": true
}
```

AUDIT r1 COST: 273,453 tokens, 1,031.6 s (17.2 min), FIX. INVOCATION: Agent subagent (pass-auditor), id in the session's task notice. USAGE BASIS: whole-contact (Agent completion notice `subagent_tokens`; cumulative-vs-incremental split not exposed).

OWNER CHOICE (peak hours hook, between rounds): « Continue through peak hours; finish Pass 65 now. »

## FIX ROUND 1 (A-001..A-003, root repository only; product unchanged at a4131b8)
- A-001: PLAN § Release acceptance + one line « Release audit P65 A-001 » naming the five files, their likely owners and the owner gesture (confirm rights or replace/drop, light route).
- A-002: PLAN § Release acceptance + one line « Release audit P65 A-002 » (the Typebot video bubble loads youtube.com/embed with autoplay when the chat starts on view; owner deletes the bubble before publication, else the chat goes back to a click). Appended, not edited into the existing Typebot bullet: the Pass may not remove or rewrite a line under that heading.
- A-003: root `.gitignore` + `outputs/` (next to `archive/`, which it already holds for the same reason; the folder is neither read, moved nor staged); pending root doc edits committed.
Root commit 073af85 (`.gitignore`, AGENTS, ARCHITECTURE, PLAN). PROGRESS and CHANGELOG are written after the verdict (bookkeeping).

## TEST-RESULTS r2
TREE: 39c143a123bf2897
CMD: `git diff -U0 848e2f5 -- PLAN.md` · `git -C .. status --short` · `git -C .. check-ignore -v outputs/x` · `node tools/check.mjs --all` · `node tools/version.mjs --check` · `node tools/shell.mjs --check`
RESULT: PASS — PLAN diff vs the Planner inputs: +4 −1, the only removed line is the § 65 heading's old status token « Not started »; the two A-001/A-002 lines added under § Release acceptance, none removed there. Root `git status --short` prints nothing (0 lines) at 073af85; `check-ignore` = `.gitignore:24:outputs/`. Product native checks at a4131b8: check.mjs 0 (16 pages), version 0, shell 0.
NOTES: product seal unchanged from r1 (39c143a123bf2897): the fixes touched the root repository only.

```json
{
  "token": "2f1199bb",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "git diff -U0 848e2f5 -- PLAN.md (root): +A-001 and +A-002 lines at 92-93 under Release acceptance (heading 78, next heading 100); only removed line = 65 heading status token Not started", "result": "PASS"},
    {"cmd": "git status --short (root, HEAD 073af85): 0 lines", "result": "PASS"},
    {"cmd": "git check-ignore -v outputs/x (root): .gitignore:24:outputs/; git ls-files outputs: 0", "result": "PASS"},
    {"cmd": "git diff --check 848e2f5 HEAD (root)", "result": "PASS"},
    {"cmd": "git -C 'current sourcinno site- code' rev-parse --short HEAD (a4131b8) and status --porcelain (0 lines)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: about 12,344 tokens incremental (285,797 cumulative minus 273,453 at r1), 34.6 s, GREEN. INVOCATION: the same pass-auditor subagent, resumed by SendMessage. USAGE BASIS: cumulative (Agent completion notice `subagent_tokens`; the increment is derived by subtraction).

## CLOSURE
UNIT: p65
DOCS: root PLAN § 65 status Done + evidence pointer, § Release acceptance + two appended lines (A-001 pictures, A-002 Typebot video bubble), nothing removed there; ARCHITECTURE Components (home Stratégie card has no picture) and Constraints (`.WIP` untracked since Pass 65); AGENTS Gotcha « Scratch belongs in `.WIP` » extended; root `.gitignore` + `outputs/` (A-003); PROGRESS (Done, Current Objective, Next Action, Open « Publication » rewritten as the owner/server list, Last Verification Pass 65) and CHANGELOG written after GREEN in the root closure commit.
MIGRATED: final evidence (native checks, render 126/0, red run 12/28 FAIL as intended, Done When counts, both verdicts and costs) to PROGRESS Last Verification (Pass 65); owner-readable summary to CHANGELOG.
NITS: auditor Tier 3 (three pictures already unused at 670f72f; three client logos new since 670f72f to confirm; `/tools/` and `/.github/` served by the static root; PLAN § 65 marked Done before the verdict, as the loop requires) → PROGRESS Known minor issues (P65) and Open « Publication » (logos).
COMMIT: a4131b84f881d3a7a9e05ed9dc54b15b444ef547 (product: 6803475 .WIP untracked, a4131b8 pictures + CSS); root 073af85 (fixes and pre-review docs); LOCAL ONLY, nothing pushed.
