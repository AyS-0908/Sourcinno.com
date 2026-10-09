# Pass p39 — Contrôleur : durcissement et recensement des classes

Contract: root PLAN.md § 39 (Planner inputs saved as root 2c50518). Prompt: root `prompts/pass39-coder.md`.
Start 21:57 local (`date`). Opening baseline: product rebuild 2a04923 (clean), root main 2c50518.
Models: work = selected current model, effort unknown (not exposed); reviewer = inherited defaults (PROGRESS Model restriction exception). Declarations, not runtime-verified.

## SLICE
Checker-only: `tools/check.mjs`, `tools/version.mjs`, `tools/shell.mjs`. One turn of work (~30 min), no split.
1. `.WIP` added to the three skip sets; `pageByUrl` deleted; the form `hidden` match reads attributes with quoted values blanked, then `(^|\s)hidden(?=[\s>=/]|$)` (accepts `hidden`, `hidden=""`; refuses `aria-hidden`, `data-hidden`).
2. One timeout (30 s; tests take ~0.2 s each today, `--all` 0.7 s) on the three `execFileSync` sites; a timed-out run, or one that fails with no output, is a named failure.
3. `shell.mjs` `model()` strips one leading U+FEFF.
4. `--nojs` scans `style.css` plus every page `<style>` block for hiding `.reveal` rules; a page whose class tokens include `reveal` must load `/assets/js/site.js`.
5. STRUCTURE item 8, census: class tokens of every `class="…"` attribute in the pages vs class selectors in `assets/css/*.css` (not `_v2`) and page `<style>` blocks (comments stripped, selector preludes only, `:not(.x)` included). Allow-list: token -> file that carries it; an entry whose file no longer carries it, or no page uses, fails.
No MANUAL items: every criterion is a terminal command (no rendered check, no live system). LIVE-SAFE: not applicable (no live system).
Plan question 4 — changed files reached by AUTO: `tools/check.mjs` (run by every command), `tools/version.mjs` and `tools/shell.mjs` (`--check` run by check.mjs item 6–7, write mode run on scratch copies). None unreached.
Audit budget: 2 contacts (one fresh review + one confirmation only if fixes).
Mutations run on scratch copies `git -c core.autocrlf=false archive` under the session scratchpad, unmodified copy run beside each.

## EXPECTED TESTS
- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check` on the tree — expect: exit 0 each; 16 pages; census note lists exactly one allow-listed token (`nav-drop-host`).
- AUTO-2 `git diff --stat 2a04923` — expect: only `tools/check.mjs`, `tools/version.mjs`, `tools/shell.mjs`.
- AUTO-3 scratch: `class="btn--nowhere"` added to one page -> `node tools/check.mjs --all` exit 1 naming the token; unmodified copy 0.
- AUTO-4 scratch: contact form `hidden` replaced by `aria-hidden="true"` -> `node tools/check.mjs --forms --nojs` exit 1; `data-hidden` variant exit 1; `hidden=""` variant exit 0.
- AUTO-5 scratch: a page `<style>` holding `.reveal { opacity: 0 }` -> `node tools/check.mjs --nojs` exit 1; a page `<style>` hiding another class (`.foo { display: none }` with `.foo` used) -> exit 0.
- AUTO-6 scratch: `site.js` script tag removed from one `.reveal` page -> `node tools/check.mjs --nojs` exit 1; removed from a page without `.reveal` (if any) -> exit 0.
- AUTO-7 scratch: `tools/shell/footer.html` saved with a UTF-8 BOM, then `node tools/shell.mjs` -> `node tools/shell.mjs --check` exit 0 and every page `cmp`-identical to the unmodified copy.
- AUTO-8 scratch: `.WIP/x.html` (broken internal link) and `.WIP/x.js` (undeclared host) -> `node tools/check.mjs --all` exit 0, 16 pages; `version.mjs --check` and `shell.mjs --check` exit 0.
- AUTO-9 scratch: `tools/portfolio.test.mjs` = `setInterval(() => {}, 1000)` -> `node tools/check.mjs --all` exit 1 within 30 s naming the file (run once); `tools/version.mjs` = `process.exit(3)` -> `node tools/check.mjs` exit 1 with a « versions » line.
- AUTO-10 own extra mutations: a class split across lines with extra spaces (all known) -> 0; a new class used only in `:not(.x)` of a selector -> 0; a page class whose only "rule" sits inside a CSS comment -> 1.

## CHANGED
- `tools/check.mjs`: `.WIP` in `SKIP_DIRS`; helpers `classTokens`, `styleBlocks`, `cssRules`, `runNode` (30 s timeout), `failFromTool`; `pageByUrl` deleted; items 6–7 name a timed-out or silent failure; STRUCTURE item 8 census with `SANS_REGLE` (`nav-drop-host` -> `tools/shell/header.html`); `--nojs` scans `style.css` + page `<style>` blocks, requires `/assets/js/site.js` on `.reveal` pages, form `hidden` attribute match; `runTests` 30 s timeout naming the file.
- `tools/version.mjs`, `tools/shell.mjs`: `.WIP` in `SKIP`; `shell.mjs` `model()` strips a leading U+FEFF.
- Root (other repository, not in this seal): PLAN.md § 39 status Done + evidence pointer; AGENTS.md Gotcha « Scratch HTML is a site page » rewritten, new Gotcha « Every HTML class needs a CSS rule ». ARCHITECTURE.md: no line made false (unchanged).

## TEST-RESULTS r1
TREE: 367baca6ae144b36
CMD: `node tools/check.mjs --all` 0 (16 pages, census 132 classes / 1 exception, both executed tests PASS); `node tools/check.mjs --forms --a11y --nojs --tiers --seo` 0; `node tools/version.mjs --check` 0 (43 refs); `node tools/shell.mjs --check` 0 (10 pages); `git diff --check` 0; `git diff --name-only 2a04923` = the 3 tools only; `git diff --quiet 670f72f -- .github` 0.
CMD: `bash <scratchpad>/p39/mutations.sh` (ledger, scratch copies `git -c core.autocrlf=false archive 2a04923` + the 3 working tools; `old` copy = 2a04923 tools as control)
RESULT: PASS — 30/30 ledger lines PASS (final run after the last edit, `nohang`), m7 hang PASS in the full run (same check.mjs).
NOTES: ledger (mutation -> command -> exit): base unmodified -> --all/version/shell 0 · m1 `btn--nowhere` -> --all 1 « classe « btn--nowhere » sans aucune regle CSS » · m2 `aria-hidden="true"` / m2b `data-hidden` / m2e `title="hidden"` -> --forms --nojs 1; m2c `hidden=""` / m2d `hidden` first -> 0 · m3 page `<style>.reveal { opacity: 0 }` -> --nojs 1 « index.html <style> »; m3c `main .reveal { visibility: hidden }` in the noscript style -> 1; m3b page style hiding `.video-launch`/`.zz-hide` -> 0 · m4 site.js tag removed from index.html -> --nojs 1; m4b removed from 404.html (no .reveal) -> 0 · m5 BOM footer + `node tools/shell.mjs` -> shell --check 0, 0 pages differ (`cmp`); control with 2a04923 shell.mjs -> 10 pages differ · m6 `.WIP/x.html` broken link + `.WIP/x.js` undeclared host -> --all 0 « 16 page(s) », version/shell --check 0; control 2a04923 -> 1 · m7 `setInterval` test -> --all 1 « tools/portfolio.test.mjs: test en echec : interrompu apres 30 s sans finir », 31 s elapsed, run once · m8 version.mjs `process.exit(3)` -> check 1 « versions: tools/version.mjs --check sortie 3 sans message »; m8b same for shell.mjs -> 1 « coquille: … » · own: e1 class split over lines + extra spaces -> 0; e2 class only in `:not(.zz-only-not)` -> 0; e3 class whose only rule is in a CSS comment -> 1; e4 `data-class=` not counted -> 0; e5 allow-listed token on a new element -> 0; e6 `nav-drop-host` removed everywhere -> 1 « exception … perimee ».
Timeout chosen: 30 s (tests ~0.2 s each, `--all` 0.7 s today; 15× margin over a ~2 s test).

## Audit fixes to implement — 2026-10-09
BLOCKING_STATUS: NON_BLOCKING
READINESS: READY_WITH_FIXES
REASON: Done When 1-5 all reproduce on fresh scratch copies, but the new site.js and census rules read HTML comments as live markup: a commented-out site.js tag stays green (false PASS) and a commented-out class fails (false FAIL).
NATIVE CHECKS: `node tools/check.mjs --all` PASS — 16 pages, census 132 classes, 1 exception nav-drop-host · `node tools/version.mjs --check` PASS · `node tools/shell.mjs --check` PASS · `git diff --check` PASS · `git diff --stat 2a04923` PASS — 3 tools only, 90+/36- · Done When 2-5 mutation list on scratch copies (git -c core.autocrlf=false archive 2a04923 + 3 working-tree tools) PASS — m1 btn--nowhere `--all` 1, m2 aria-hidden `--forms --nojs` 1, m3 page `<style>` `.reveal { opacity: 0 }` `--nojs` 1, m4 site.js tag deleted `--nojs` 1, unmodified copy 0 on each command; m5 BOM footer: stamp then `--check` 0, 16/16 pages `cmp`-identical; m6 `.WIP/x.html` + `.WIP/x.js` `--all` 0 with 16 pages, version/shell `--check` 0; m7 hanging portfolio test `--all` 1 after 31 s naming the file (once); m8 `process.exit(3)` version → exit 1 « versions: tools/version.mjs --check sortie 3 sans message ». Same mutations on the pre-Pass tools: m1-m4 exit 0, m5 `--check` 1 (mutations discriminate).
SCOPE: CLEAN — `runNode`/`failFromTool` and the stale-exception check are necessary side work for Work 2 and the Planner allow-list decision.

### A-001 | Tier 2 | LOW | `tools/check.mjs:96` `tools/check.mjs:581`
- issue: own mutation o1 — on `mentions-legales/index.html` (a `.reveal` page) the site.js tag wrapped as `<!-- <script src="/assets/js/site.js?v=c0f148db" defer></script> -->` keeps `node tools/check.mjs --all` at exit 0 although the page no longer loads site.js (the P38 T3-3 rule is fooled); own mutation o10 — `<!-- <p class="zz-commented">old</p> -->` after `<main id="main">` makes `node tools/check.mjs` exit 1 on a class nothing renders.
- fix: strip `<!--[\s\S]*?-->` from the page HTML before `classTokens` (census usages and the `.reveal` detection) and before the site.js script-tag test.
- test: o1 copy → `node tools/check.mjs --nojs` exit 1 naming `mentions-legales/index.html`; o10 copy → `node tools/check.mjs` exit 0; real tree `node tools/check.mjs --all` exit 0.

**Reviewer notes (Tier 3, non-blocking — route at closure, no fix required):**
- Known deviation accepted: `nav-drop-host` is a dead class (no CSS rule or script ever read it; `git log -S` confirms), so naming it with `tools/shell/header.html` is the only way to keep Done When 1 (no page changes); route its deletion (partial + restamp + drop the `SANS_REGLE` entry, which the stale check then forces) to a page-touching Pass. Stale check verified: o8 (class removed from the partial, pages restamped) → exit 1 « exception … perimee ».
- Census reads only double-quoted `class="…"` (o2: `class='btn--nowhere'` → `--all` exit 0); 0 single-quoted class attributes in pages or generators today.
- An allow-listed class that later gains a CSS rule is not reported stale and the note still says « sans regle » (o13: `.nav-drop-host {}` added → exit 0).
- `check.mjs:51` says `.WIP` is « jamais servis »: true today (`.WIP` absent from main/origin/main) but `.WIP` evidence is tracked on `rebuild` and ARCHITECTURE gives the Coolify publish root as `/`; add a Release acceptance line to exclude `.WIP` from the published tree or prove nginx refuses `/.WIP/`.
- AGENTS Gotcha « anywhere else in the product tree a scratch .html is still a site page » overstates slightly: `tools/`, `.github`, `node_modules` are skipped too.
- Pre-existing, fail-safe: uppercase `HIDDEN` on the form → `--forms --nojs` exit 1 (o12). `timedOut` treats any kill signal as the 30 s timeout (message only).
- Root PLAN § 39 already reads « Status Done » with `Evidence: PROGRESS.md Last Verification (Pass 39)`, a section PROGRESS does not have yet; both are only true after closure.
- Own probes that behaved correctly: o3 class ruled only in `assets/css/_v2/` → exit 1; o4 class ruled only inside `@media` (after restamp) → exit 0; o5 `hidden=""` → exit 0; o6 `.reveal` hidden inside `@media` in a page `<style>` → exit 1; o11 `defer` before `src` → exit 0. Timeout margin: both tests ~150 ms vs 30 s.

```json
{
  "token": "fa37c5b0",
  "verdict": "FIX",
  "confidence": "medium",
  "evidence": [
    {"cmd": "node tools/check.mjs --all (product tree, exit 0, 16 pages)", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check; node tools/shell.mjs --check; git diff --check (product tree, all exit 0)", "result": "PASS"},
    {"cmd": "git diff --stat 2a04923 (tools/check.mjs, tools/version.mjs, tools/shell.mjs only)", "result": "PASS"},
    {"cmd": "m1 class=btn--nowhere on mentions-legales: node tools/check.mjs --all exit 1; unmodified copy exit 0", "result": "PASS"},
    {"cmd": "m2 form hidden -> aria-hidden=true: node tools/check.mjs --forms --nojs exit 1; unmodified copy exit 0", "result": "PASS"},
    {"cmd": "m3 page style .reveal { opacity: 0 }: node tools/check.mjs --nojs exit 1; unmodified copy exit 0", "result": "PASS"},
    {"cmd": "m4 site.js script tag deleted on mentions-legales: node tools/check.mjs --nojs exit 1", "result": "PASS"},
    {"cmd": "m5 footer.html with UTF-8 BOM: node tools/shell.mjs; node tools/shell.mjs --check exit 0; cmp 16/16 pages identical", "result": "PASS"},
    {"cmd": "m6 .WIP/x.html broken link + .WIP/x.js undeclared host: node tools/check.mjs --all exit 0 16 pages; version and shell --check exit 0", "result": "PASS"},
    {"cmd": "m7 portfolio.test.mjs = setInterval: node tools/check.mjs --all exit 1 after 31 s naming tools/portfolio.test.mjs", "result": "PASS"},
    {"cmd": "m8 version.mjs = process.exit(3): node tools/check.mjs exit 1 with versions failure line", "result": "PASS"},
    {"cmd": "o1 site.js tag inside an HTML comment on mentions-legales: node tools/check.mjs --all exit 0 (expected 1)", "result": "FAIL"},
    {"cmd": "o10 class zz-commented only inside an HTML comment: node tools/check.mjs exit 1 (expected 0)", "result": "FAIL"},
    {"cmd": "o3 class ruled only in assets/css/_v2/old.css: node tools/check.mjs --all exit 1", "result": "PASS"},
    {"cmd": "o8 nav-drop-host removed from tools/shell/header.html then node tools/shell.mjs: node tools/check.mjs exit 1 stale exception", "result": "PASS"}
  ],
  "opened_fix_section": true
}
```

AUDIT r1 COST: 172,642 tokens, 10 min 44 s, FIX (A-001 Tier 2 LOW). INVOCATION: pass-auditor subagent (task notification). USAGE BASIS: whole-contact, from the Agent completion notice.

## TEST-RESULTS r2
TREE: fce515b2700d9517
CMD: `node tools/check.mjs --all` 0 (16 pages); `node tools/check.mjs --forms --a11y --nojs --tiers --seo` 0; `node tools/version.mjs --check` 0; `node tools/shell.mjs --check` 0; `git diff --check` 0; `git diff --stat 2a04923` = 3 tools, +92/−36.
CMD: `bash <scratchpad>/p39/mutations.sh nohang` after the fix (last edit)
RESULT: PASS — 31/31 ledger lines PASS (r1 said 30/30: miscount, it was 27/27 + m7; m7 hang unchanged path, not re-run).
NOTES: A-001 fix = helper `live()` strips `<!-- -->` before `classTokens`, `styleBlocks` and the site.js tag test. Fix ledger: f1 (reviewer o1) site.js tag commented out on mentions-legales -> --nojs 1 naming the page; f2 (o10) class only in an HTML comment -> check 0; f3 own: class whose only rule is in a commented-out `<style>` -> 1; f4 own: commented-out `<style>.reveal { opacity: 0 }` -> --nojs 0. All 27 earlier lines still PASS.

## AUDIT r2 — delta confirmation A-001 (contact 2 of 2)
VERDICT: GREEN — A-001 complete. Delta measured against the contact-1 copy of `tools/check.mjs` (version.mjs and shell.mjs byte-identical): new `live()` strips `<!-- -->`, used by `classTokens`, `styleBlocks` and the site.js tag test; `git diff --stat 2a04923` = 3 tools, +92/−36, matches the declared slice.
CHECKS (fresh scratch copies, new check.mjs copied in, no network): real tree `node tools/check.mjs --all` 0 (16 pages, census still 132 classes, 12 page `<style>` blocks); o1 site.js tag in a comment → `--nojs` 1 naming `mentions-legales/index.html`; o10 class only in a comment → `node tools/check.mjs` 0; m1 btn--nowhere → `--all` 1; m3 page `<style>` `.reveal { opacity: 0 }` → `--nojs` 1; m4 site.js tag deleted → `--nojs` 1; unmodified copy `--all` 0 and `--nojs` 0.
Tier 3 (non-blocking, new with the delta): `live()` also strips `<!-- -->` inside raw-text `<style>`, so a legacy CDO-wrapped `<style><!-- .reveal { opacity: 0 } --></style>` (still applied by browsers) passes `--nojs` (probe d1 exit 0); 0 pages carry `<!--` inside any `<style>`/`<script>` today and no generator emits it. Optional later hardening: strip comments outside raw-text elements only.

```json
{
  "token": "e18ed465",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "diff -u contact-1 tools/check.mjs vs working tree; git diff --stat 2a04923 (3 tools, +92/-36)", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all (real product tree, exit 0, 16 pages, census 132)", "result": "PASS"},
    {"cmd": "o1 site.js tag inside an HTML comment: node tools/check.mjs --nojs exit 1 naming mentions-legales/index.html", "result": "PASS"},
    {"cmd": "o10 class zz-commented only inside an HTML comment: node tools/check.mjs exit 0", "result": "PASS"},
    {"cmd": "m1 class=btn--nowhere on mentions-legales: node tools/check.mjs --all exit 1", "result": "PASS"},
    {"cmd": "m3 page style .reveal { opacity: 0 }: node tools/check.mjs --nojs exit 1", "result": "PASS"},
    {"cmd": "m4 site.js script tag deleted on mentions-legales: node tools/check.mjs --nojs exit 1", "result": "PASS"},
    {"cmd": "unmodified scratch copy: node tools/check.mjs --all exit 0; node tools/check.mjs --nojs exit 0", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: ≈14,709 tokens (187,351 cumulative − 172,642), 1 min 15 s, GREEN. INVOCATION: same pass-auditor resumed by SendMessage. USAGE BASIS: cumulative per Agent completion notice; delta derived.

## CLOSURE
UNIT: p39
DOCS: root PLAN.md § 39 status Done + evidence pointer (before review); root AGENTS.md Gotchas (Scratch belongs in .WIP; Every HTML class needs a CSS rule) before review; root PROGRESS.md (Done, Last Verification, Next Action, Known minor issues) and CHANGELOG.md after GREEN. ARCHITECTURE.md unchanged (no line made false). No README/PRD edits.
MIGRATED: final native + mutation evidence, verdicts FIX→GREEN, costs, timeout 30 s, census allow-list content -> root PROGRESS Last Verification (Pass 39); shipped behaviour -> root CHANGELOG.
NITS: reviewer Tier-3 notes (nav-drop-host dead class, single-quoted class attributes unread, allow-list entry gaining a rule not flagged, `.WIP` tracked on rebuild vs publish root `/`, Gotcha wording, uppercase HIDDEN fail-safe, any kill signal reported as timeout, `<!--` inside `<style>` stripped by live()) -> root PROGRESS Known minor issues (P39).
COMMIT: 879d18f0e3a150769596325c9b78aba9e319bb9a (product rebuild, LOCAL ONLY, not pushed)
