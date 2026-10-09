# Pass p40 — CSS : purge, jetons de couleur, images de héros (sans changement visible)

Contract: root PLAN.md § 40 (Planner inputs saved as root 3c798e2). Prompt: root `prompts/pass40-coder.md`.
Start ≈22:59 local (`date` 23:03 at pre-flight). Opening baseline: product rebuild 45ee708 (clean), root main 3c798e2.
Models: work = selected current model, effort unknown (not exposed); reviewer = inherited defaults (PROGRESS Model restriction exception). Declarations, not runtime-verified.
Port: 4173 free at pre-flight (`netstat` empty). Comparison servers: base archive on 127.0.0.1:4181, final tree on 127.0.0.1:4182 (`python -m http.server --bind 127.0.0.1`).

## SLICE
CSS without visible change; one turn (~35 min), no split. Order (prompt A): computed-style baseline on 45ee708 BEFORE any edit, then the census, then purge what it names, tokens, heroes.
0. Baseline: `evidence/computed.mjs` (headless Chrome, AGENTS recipe), 10 shell pages × 1200/375, reduced motion `reduce`, every element + ::before/::after, all computed properties hashed in the page, origin normalised. Saved `evidence/baseline-45ee708.json`.
1. `tools/check.mjs` STRUCTURE: reverse census (class selectors of `assets/css/*.css` and page `<style>` blocks, selectors only, comments stripped) vs consumers: page/partial `class="…"`/`class='…'` tokens, inline `<script>` text of pages/partials, text of every `assets/js/**/*.js` (`_v2` included). Own allow-list `SANS_USAGE`, empty if possible. P39 nits: single-quoted `class='…'` read; an allow-listed class that gains a rule is stale.
2. Purge the dead rules the census names in `assets/css/style.css` (dead selector removed from a shared list; descendant rules of a dead parent go with it; `#besoin` kept).
3. `nav-drop-host` out of `tools/shell/header.html`, `node tools/shell.mjs`, `SANS_REGLE` emptied.
4. Hex literals outside `:root` → role-named `:root` tokens; PAIRS reads tokens; `.tag` pair measured against its real background (the `rgba` of the `.tag` rule read from the CSS, blended over `--white`), so no visible or computed change.
5. Heroes: inline `style=` off the three service pages; classes `.hero--ia`, `.hero--strategie`, `.hero--venture` share one selector list with the existing `.card--ia` / `.card--strategie` URL rule; `node tools/version.mjs`.
No MANUAL items: every criterion is a terminal command or a driven headless render (PLAN § 40: no visible change; the comparison is the proof). LIVE-SAFE: not applicable (no live system; 127.0.0.1 + Google Fonts only).
Plan question 4 — changed files reached by AUTO: `tools/check.mjs` (every command), `assets/css/style.css` (census, `--a11y`, version check, computed-style render), `tools/shell/header.html` + pages (`shell.mjs --check`, census, render). None unreached.
Audit budget: 2 contacts (one fresh review + one confirmation only if fixes).

## EXPECTED TESTS
- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check` — expect: exit 0 each; census notes show 0 exceptions both ways.
- AUTO-2 `git diff --stat 45ee708` — expect: only `assets/css/style.css`, `tools/check.mjs`, `tools/shell/header.html` and pages (header restamp, three heroes, `?v=` stamps).
- AUTO-3 `awk '/^:root/{r=1} r&&/^}/{r=0;next} !r' assets/css/style.css | grep -cE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b'` → 0; `grep -c 'style="' service-*/index.html` → 0 each; `grep -rc nav-drop-host tools/shell tools/check.mjs` → 0 each.
- AUTO-4 the reverse census on the unmodified 45ee708 copy (new check.mjs dropped in) names exactly the 13 probed dead classes, no more.
- AUTO-5 scratch copies (`git -c core.autocrlf=false archive`, session scratchpad), unmodified copy 0 beside each: `.ghost-class { color: red; }` appended to `style.css` → `--all` 1 naming `ghost-class`; plus `ghost-class` used only in `assets/js/_v2/chat.js` → 0; `class='btn--nowhere'` on one page → 1; allow-listed class that gains a rule → 1 (stale).
- AUTO-6 `node evidence/computed.mjs compare` base archive (4181) vs final tree (4182) with the saved baseline — expect: 20 page×width, same structure, 0 differing elements, A matches the saved baseline, no request outside 127.0.0.1/Google Fonts.

## CHANGED
- `tools/check.mjs`: `classTokens` reads `class='…'` too; STRUCTURE 8 `regles` = Map class → first file, selectors stripped of `[attr]` values and strings (`[src$="…png"]` no longer yields `png`); `SANS_REGLE` emptied, an entry that gains a rule is stale; new STRUCTURE 9 reverse census (consumers: page + `tools/shell/*.html` class tokens, words of string literals in `assets/js/**` and inline non-JSON-LD `<script>`, comments skipped) with `SANS_USAGE` = `chat-msg--bot`/`chat-msg--me` (composed by `assets/js/_v2/chat.js` `"chat-msg chat-msg--" + who`; stale if the motif goes, if used literally, or if no selector); `--a11y` PAIRS read `:root` tokens only (`#` literal branch removed), `.tag` pair = `--tag-text` on the `.tag` rule's `rgba()` blended over `--white` (#fbede4), « surtitre sur bleu nuit » (#7fd6d3, subject purged) replaced by `--accent-on-dark` on `--navy` + `--link-hover-on-dark` on `--navy-dark` (13 → 14 pairs).
- `assets/css/style.css`: 13 dead classes purged (`grid--4` kept out of the shared 640 list only); 9 role-named `:root` tokens replace every hex outside `:root`; `.card--strategie, .hero--strategie` / `.card--ia, .hero--ia` / `.hero--venture` declare each hero URL once.
- `tools/shell/header.html`: `<li class="nav-drop-host">` → `<li>`; `node tools/shell.mjs` restamped the 10 shell pages; `service-*/index.html` hero `style=` → `hero--ia|strategie|venture`; `node tools/version.mjs` restamped 16 pages (`style.css` ?v=).
- Evidence (state dir): `evidence/computed.mjs`, `evidence/baseline-45ee708.json`, `evidence/compare-r1.json`.
- Root (other repository, not in this seal): PLAN § 40 status Done + evidence pointer; AGENTS Gotcha « Every HTML class needs a CSS rule » → two-way census, new Gotcha « A computed-style comparison must sort properties… »; ARCHITECTURE `style.css` line (tokens, hero images).

## TEST-RESULTS r1
TREE: b5515d67606aa094
CMD: `node tools/check.mjs --all` 0 (16 pages; census 134 classes / 0 exception; reverse census 155 selector classes, 0 unused, 2 script-composed exceptions; `--a11y` 14 pairs, tightest 4.77:1); `node tools/check.mjs --forms --a11y --nojs --tiers --seo` 0; `node tools/version.mjs --check` 0 (43 refs); `node tools/shell.mjs --check` 0 (10 pages); `git diff --check` 0; `git diff --name-only 45ee708` = 19 files (style.css, check.mjs, header.html, 16 pages); `git diff --quiet 670f72f -- .github` 0; hex-outside-:root awk|grep 0; `grep -c 'style="' service-*/index.html` 0 ×3; `grep -rc nav-drop-host tools/shell tools/check.mjs` 0 ×4.
CMD: `bash evidence/mutations.sh` (fresh tar copy of the working tree per case, session scratchpad) — after the last edit
CMD: `P40_NEW_TOKENS=<the 9 tokens> node evidence/computed.mjs compare evidence/compare-r1.json <profile> http://127.0.0.1:4181 http://127.0.0.1:4182 evidence/baseline-45ee708.json` (4181 = `git -c core.autocrlf=false archive 45ee708`, 4182 = working tree; served files unchanged since 23:13, compare 23:26)
RESULT: PASS — mutations 14/14; comparison 20 page×width, 4,488 elements (+ ::before/::after), structure same, 0 differing, saved baseline matched 20/20, 0 outside request; only addition: the 9 new custom properties on every element (13,464 = 4,488 × 3 each).
NOTES: AUTO-4 census on unmodified 45ee708 + new check.mjs: exactly the 13 probed names (+ forward `nav-drop-host`, SANS_REGLE emptied). Parser errors found and fixed on the way: `split` hidden by JS `.split(` (word match on whole JS text → string literals only); `png` from `[src$="guidemichelin_nb.png"]` (attribute values stripped); `chat-msg--bot`/`--me` composed by `_v2/chat.js` → `SANS_USAGE`. Ledger: m0 unmodified → --all 0 · m1 `.ghost-class` rule → 1 « ghost-class » · m2 + `"ghost-class"` in `_v2/chat.js` → 0 · m3 `class='btn--nowhere'` → 1 · m4 `"chat-msg--bot"` literal in chat.js → 1 (stale) · m5 motif removed → 1 « perimee » · m6a SANS_REGLE entry `zz-x` carried by header → 0; m6b + `.zz-x` rule → 1 · m7 dead class in contact `<style>` → 1 · m8 class only in JS comments → 1 · m9 class set by `classList.add("zz-js")` → 0 · m10 `.tag` rgba alpha 0.9 → --a11y 1 « etiquette technique » · m11 `--tag-text` lighter → 1 · m12 `.hero--venture` rule removed → 1. Comparator proven: copy with `.hero--venture` rule deleted + `--error` #c53031 → venture hero `background-image` and 7 contact error lines named, exit 1. Comparator defect found and fixed: Chrome's custom-property order varies between loads (base vs base differed on every element) → names sorted; standard/custom hashed apart (AGENTS Gotcha). Baseline recaptured after that fix from the same untouched 45ee708 archive.

## Review contact 1 of 2 - fresh auditor (pass p40)

GREEN: Done When 1-4 re-run on my own scratch copies (scratchpad `review/`: 45ee708 archive with autocrlf=false + the 19 changed working-tree files; own servers 4191 base / 4192 final, stopped after use). No Tier 1 or Tier 2 finding. Scope: CLEAN. One necessary side change: the old PAIRS row « surtitre sur bleu nuit » measured `#7fd6d3`, which only a purged rule used. It now measures `--accent-on-dark` on `--navy`, and `--link-hover-on-dark` gets its own row on `--navy-dark`.

Tier 3 advisory (no fix section, no further contact):
- T3-1 `tools/check.mjs` reverse-census string reader: a regex literal containing `//` (for example `/https?:\/\//`) is read as a line comment. A class used only in a string later on that same line is then reported unused (own mutation `regexslash` gave exit 1 naming ghost-class). This fails closed, and no current JS triggers it: my independent probe gives the same 155 selector classes / 134 tokens / 21 script-only classes. It has the same root cause as the documented quote limitation. Either widen the check.mjs comment and the AGENTS Gotcha to « a quote or `//` », or accept it.
- T3-2 root ARCHITECTURE `style.css` line says the hero images are « shared with the home cards ». Only ia and strategie have a home card; `.hero--venture` has none.
- T3-3 root PLAN section 40 already reads « Status Done » and points to « PROGRESS.md Last Verification (Pass 40) », which does not exist yet (PROGRESS lines 7/30 still say Pass 40 is next). Closure bookkeeping has to land before the Planner CHECK.

```json
{
  "token": "853a3904",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all (working tree) -> exit 0, STRUCTURE reverse census 155 selector classes, 0 unused, SANS_REGLE empty", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check; node tools/shell.mjs --check; git diff --check 45ee708 -> all exit 0", "result": "PASS"},
    {"cmd": "git diff --stat 45ee708 -> 19 files: assets/css/style.css, tools/check.mjs, tools/shell/header.html, 16 pages (10 header restamp + ?v=, 3 service heroes, 6 redirects ?v= only)", "result": "PASS"},
    {"cmd": "awk '/^:root/{r=1} r&&/^}/{r=0;next} !r' assets/css/style.css | grep -cE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\\b' -> 0; grep -c 'style=\"' service-*/index.html -> 0 x3; grep -rc nav-drop-host tools/shell tools/check.mjs -> 0 x4", "result": "PASS"},
    {"cmd": "scratch copy clean (git -c core.autocrlf=false archive 45ee708 + changed files): node tools/check.mjs --all -> exit 0", "result": "PASS"},
    {"cmd": "scratch ghost: append .ghost-class { color: red; } + node tools/version.mjs + check --all -> exit 1 naming ghost-class", "result": "PASS"},
    {"cmd": "scratch ghostjs: same rule + \"ghost-class\" string only in assets/js/_v2/chat.js -> exit 0", "result": "PASS"},
    {"cmd": "scratch single: <span class='btn--nowhere'> on contact/index.html -> exit 1 naming btn--nowhere", "result": "PASS"},
    {"cmd": "own false-PASS mutations: ghost-class only in a JS comment / only in JSON-LD / only in page text + HTML comment / only in tools/blog-sync.mjs / hero--venture removed from its page -> each exit 1 naming the class", "result": "PASS"},
    {"cmd": "own false-FAIL mutations: ghost-class in an inline non-JSON-LD <script> string / selector .btn[data-k=\".zz-attr\"] / SANS_REGLE entry zz-hook with page use and no rule -> each exit 0", "result": "PASS"},
    {"cmd": "own stale and a11y mutations: chat-msg--bot as literal string (SANS_USAGE stale) / SANS_REGLE zz-hook gains rule / --tag-text #f0a070 / .tag background non-rgba / multi-line class='btn zz-unknown' -> each exit 1 with the expected message", "result": "PASS"},
    {"cmd": "own CDP script review/scripts/cmp.mjs (headless Chrome, scratch profile, prefers-reduced-motion reduce, sorted props, custom apart, settle loop): 10 shell pages x 1200 and 375, 45ee708 vs final -> 0 standard-property diffs on every element and ::before/::after/::marker; only the 9 new :root tokens added, identical on every row", "result": "PASS"},
    {"cmd": "cmp.mjs sensitivity: base vs herodrop copy (service-venture-building) and base vs a11ytag copy (publications) -> diffs reported (hero background-image; tag colour)", "result": "PASS"},
    {"cmd": "cmp.mjs forced :hover .btn--primary (index, IA) and footer a:not(.btn), plus contact error colours -> identical base vs final", "result": "PASS"},
    {"cmd": "independent reverse probe review/scripts/jsonly.mjs on final copy -> 155 selector classes, 134 page/partial tokens, 21 script-only all with a real JS hit except chat-msg--bot/--me (SANS_USAGE)", "result": "PASS"},
    {"cmd": "git grep -w of the 13 purged classes in 45ee708 outside style.css -> 0 uses each; grep -c in final style.css -> 0; each hero image URL once in style.css, in no page", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 161,849 tokens, 13 min 17 s (796,982 ms), 51 tool uses, GREEN high. INVOCATION: pass-auditor subagent (task notification). USAGE BASIS: whole-contact, from the Agent completion notice.
Verdict imported 23:44 (`status.py verdict`, fingerprint b5515d67606aa094 unchanged). Comparison servers 4181/4182 stopped after the verdict.
