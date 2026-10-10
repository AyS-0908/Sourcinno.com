# Pass 49 journal — CSS: one card surface, shared field rule, page styles in style.css

Contract: root `PLAN.md` § 49 (root commit 937c439, Planner inputs). Base product 106cd37. LOCAL ONLY.
MODELS: work = claude-opus-5-5 (system prompt, runtime-declared), effort unknown (not exposed). Reviewer: same model, inherited defaults; effort control not exposed (PROGRESS Model restriction exception).

## SLICE
Size: one turn (~30 min): 3 product files + `version.mjs` restamp; no split.
Work: 1. grouped `.card, .step, .disclosure--card, .portfolio-card, .ia-chat { background; border; border-radius }` at the `.card` position (before `.card--service` :825 and `.card--strategie`/`--ia` :862); the triple leaves the five families. 2. `input[type="search"]` joins the shared field rule; `.portfolio-filter input {…}` deleted. 3. Portfolio then IA page `<style>` blocks appended at the end of `style.css` byte for byte (minus the moved declarations); stamped `<noscript>` untouched. 4. `h1, h2, h3, h4` → `h1, h2, h3`. 5. `node tools/version.mjs`.
Cascade measured before coding (106cd37): only equal-specificity (0,1,0) rules can overturn a moved family. `.step`, `.portfolio-card`, `.ia-chat` elements carry no other class; `.disclosure--card` elements carry `disclosure`, whose `border-top` :918 equals the grouped border; no bare attribute/pseudo selector in `style.css` sets background/border/radius. Expected: no family keeps its own declarations.
OWNER DECISION 2026-10-10 (before coding): `.portfolio-filter input` (0,1,1, page block after `style.css`) today overrides `input:focus` (0,1,1, :400) border-color, so the FOCUSED search field keeps a grey-300 border while every other field (the two Portfolio selects included) turns teal. Sharing the field rule makes it teal. Asked in plain words; owner answered « Teal, like others (Recommended) ». So Done When 4 expects ONE named difference: `#portfolio-query` focused border-color grey-300 → teal; everything else equal.
ACCEPTANCE: audit-first. No MANUAL items for this Pass: nothing visible changes at rest; the focus-state change is owner-decided and measured by AUTO-5.

## EXPECTED TESTS
- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check` — expect: each exit 0.
- AUTO-2 `git diff --stat 106cd37 -- . ':(exclude).WIP'` — expect: `assets/css/style.css`, `portfolio/index.html`, `service-ia-business/index.html` + only `?v=` lines of the other 13 pages.
- AUTO-3 `grep -c "<style" portfolio/index.html service-ia-business/index.html` — expect 1 and 1; `git grep -n -e "portfolio-filter input {" -e "h4" -- assets/css/style.css` — expect nothing; `git grep -n 'input\[type="search"\]' -- assets/css/style.css` — expect the shared field rule.
- AUTO-4 `cat assets/css/style.css portfolio/index.html service-ia-business/index.html | grep -o "<pattern>" | wc -l` — expect radius-lg 9, white 12, border 6 (before: 13/17/10).
- AUTO-5 Pass 40 comparer `compare` A = `git -c core.autocrlf=false archive 106cd37` on :4174, B = tree on :4173, 10 pages × 1200/375 — expect: only `transition-property`/`transition-timing-function` of `#portfolio-query` on `/portfolio/` at both widths. Proved not blind first: a scratch copy of B with one changed radius must show a difference.
- AUTO-6 states script (both trees, 375): opened home `.disclosure--card`, opened Portfolio `.portfolio-details` card, `#portfolio-query` focused by real Tab key events with a typed word — background, border, radius, outline, box-shadow equal, except the owner-decided focused search border-color (grey-300 → teal).
Changed files vs AUTO reach: `style.css` and both pages are loaded by AUTO-5/AUTO-6 and parsed by AUTO-1; the 13 restamped pages are loaded by AUTO-5 (10 shell pages) and checked by `version.mjs --check` (16). None unreached.
Audit budget: 2 contacts (one fresh, one confirmation only on FIX).

## CHANGED
- `assets/css/style.css`: grouped surface rule before `.card` (Work 1), `.step`/`.disclosure--card` lose the triple, `input[type="search"]` in the shared field rule (Work 2), `h1, h2, h3` (Work 4), Portfolio then IA page blocks appended at the end (Work 3; moved declarations removed, other lines byte for byte, 2-space indent kept).
- `portfolio/index.html`, `service-ia-business/index.html`: page `<style>` block removed; stamped `<noscript>` untouched.
- 16 pages: `?v=` restamp by `node tools/version.mjs` (43 refs).
- Edit tool: scratchpad script `p49edit.py` (byte I/O, one-match asserts); `grep -c $'\r'` = 0 on the three files.

## TEST-RESULTS r1
TREE: e00dbb9b12450b7a
CMD: `node tools/check.mjs --all` 0 (16 pages, both executed tests PASS) · `node tools/version.mjs --check` 0 (43) · `node tools/shell.mjs --check` 0 (10) · `git diff --check` 0 · `git diff --stat 106cd37 -- . ':(exclude).WIP'` 17 files · `node .WIP/pass-loop-p40/evidence/computed.mjs compare … http://127.0.0.1:4174 http://127.0.0.1:4173` exit 1 (14 rows, named) · `node .WIP/pass-loop-p49/evidence/states.mjs … :4174 :4173` exit 0
RESULT: PASS — AUTO-1 all 0. AUTO-2 = style.css, portfolio, IA + 14 pages whose only changed line is `style.css?v=` (non-`?v=` changed lines outside the three files: 0). AUTO-3 `<style` 1/1; `portfolio-filter input {`/`h4` grep exit 1 (nothing); `input[type="search"]` at style.css:393. AUTO-4 radius-lg 9, white 12, border 6. AUTO-5 / AUTO-6 below.
NOTES: AUTO-5 rows (evidence/compare-diff-rows.txt): body elements all equal except `/portfolio/` `input:1` (= #portfolio-query) at 1200 and 375: transition-property all → border-color, box-shadow; transition-timing-function ease → cubic-bezier(0.22, 0.61, 0.36, 1) ×2; transition-behavior/-delay same values as 2-item lists. Head: `style:21` only in A (the removed block) and `noscript:22` keyed `:21` in B (re-index), on Portfolio and IA at both widths. Blindness proof: copy of 106cd37 with `.disclosure--card` radius-lg → radius on :4175, `P40_ONLY=/` compare → 9 differing × 2 widths, exit 1 (evidence/compare-mutation-proof.log). AUTO-6 (evidence/states-result.json): both trees reached the states (disclosure open, portfolio card open, query focused + :focus-visible after 26 Tab, value « agent », 0 outside requests); 4 differences = query border-{top,right,bottom,left}-color rgb(203,213,224) → rgb(49,151,149), the owner-decided change; it also proves the probe sees a border change. No family kept its own declarations. Servers: :4173 tree, :4174 archive 106cd37, :4175 mutated copy (scratchpad).


## REVIEW CONTACT 1 — fresh auditor (code-audit phase-gate), 2026-10-10

Greenlight — the five card surfaces share one rule, the search field uses the shared field rule, both page blocks moved byte-identically to the end of `style.css`, and nothing changes on screen except the owner-accepted teal border of the focused Portfolio search field.

Re-run by the auditor (own servers 127.0.0.1:4183 tree / 4184 `git -c core.autocrlf=false archive 106cd37`, both stopped; scratch under the session scratchpad `review-p49/`):
- Native: `check.mjs --all` 0 (16 pages, both executed tests PASS), `version.mjs --check` 0 (43), `shell.mjs --check` 0 (10), `git diff --check 106cd37` 0.
- Diff: 17 files; the 14 other pages change only their `?v=` line; moved Portfolio/IA blocks = base page blocks minus the deleted `.portfolio-filter input {…}` line and the three surface declarations of `.portfolio-card`/`.ia-chat`. `<style>` count 1/1 (the stamped head `<noscript>` one, every shell page); `portfolio-filter input {`/`h4` grep empty; `input[type="search"]` at `style.css:393`; counts radius-lg 9, white 12, border 6 (base 13/17/10). No `<h4>` in pages, partials, scripts or `blog-sync.mjs`; Typebot's tag list is inside its own shadow root.
- Comparer: 4542 elements, 20 page×width runs, badMedia 0, no outside request, no new token; exit 1 by design (it demands 0). All 14 rows are declared: `#portfolio-query` transition-* ×2 widths, the removed head `<style>` and the re-indexed head `<noscript>` on Portfolio/IA (364→363, 245→244); every body element equal. Receipt: `review-p49/tools/assert-compare.cjs` exit 0.
- States (`states.mjs`, exit 0, both trees at 375, real mouse/Tab/key events, 0 outside requests): opened home disclosure card, opened Portfolio card and its summary equal; focused `#portfolio-query` (26 Tab, « agent ») differs only in the four border colours grey-300 → teal = owner decision 2026-10-10.
- Cascade reasoning checked: no same-specificity rule between the old and new positions reaches the five families except `.disclosure { border-top }` (same value); print and motion media blocks do not touch the surfaces.

SCOPE: CLEAN — every change traces to PLAN § 49 Work 1–5; `?v=` stamps and `states.mjs` are necessary side work.
SEAL: `.WIP/pass-loop-p49/evidence/states.mjs` and its results are ignored, untracked, NOT sealed; separate receipt = this auditor's own read and run above. Root docs (PLAN § 49, PROGRESS, ARCHITECTURE) are another repository, outside the seal: claims checked against the re-runs, `git diff --check` 0.

Tier 3 advisory (no fix section, no further review needed):
- PLAN § 49 Done When 3 says "0 differences except transition-*"; the comparer necessarily also lists the removed head `<style>`/re-indexed `<noscript>` rows. PROGRESS names them; Planner may reword the criterion.
- ARCHITECTURE Components line carries history ("moved … Pass 49"); history belongs to CHANGELOG.
- The appended blocks keep their page indentation (two spaces) and the IA block's compact `prop:value` style inside `style.css`: cosmetic.
- PROGRESS/PLAN already read "closed"/"Done" before this verdict; durable commit must force-add `.WIP/pass-loop-p49/` as PROGRESS states.

```json
{
  "token": "9123bb1d",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check 106cd37", "result": "PASS"},
    {"cmd": "git diff --stat 106cd37 -- . ':(exclude).WIP' && git -c core.autocrlf=false diff -U0 106cd37 -- <14 other pages> | grep -E '^[-+][^-+]' | grep -v '?v='", "result": "PASS"},
    {"cmd": "grep -c '<style' portfolio/index.html service-ia-business/index.html", "result": "PASS"},
    {"cmd": "git grep -n -e 'portfolio-filter input {' -e h4 -- assets/css/style.css", "result": "PASS"},
    {"cmd": "git grep -n 'input\\[type=\"search\"\\]' -- assets/css/style.css", "result": "PASS"},
    {"cmd": "cat assets/css/style.css portfolio/index.html service-ia-business/index.html | grep -o '<radius-lg|white|border pattern>' | wc -l", "result": "PASS"},
    {"cmd": "diff <106cd37 page style blocks> <style.css appended blocks>", "result": "PASS"},
    {"cmd": "git grep -n -i -E '<h4|h4' -- . ':(exclude).WIP' ':(exclude)assets/js/vendor'", "result": "PASS"},
    {"cmd": "node .WIP/pass-loop-p40/evidence/computed.mjs compare <out> <profile> http://127.0.0.1:4184 http://127.0.0.1:4183", "result": "PASS"},
    {"cmd": "node review-p49/tools/assert-compare.cjs review-p49/out/compare.json", "result": "PASS"},
    {"cmd": "node .WIP/pass-loop-p49/evidence/states.mjs <out> <profile> http://127.0.0.1:4184 http://127.0.0.1:4183", "result": "PASS"},
    {"cmd": "git -C C:/Users/aymar/AYS_CODING/code-SOURCINNO_WWW diff --check -- PLAN.md PROGRESS.md ARCHITECTURE.md", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 158,518 tokens, 10 min 22 s (622,150 ms, 42 tool uses), GREEN high
INVOCATION: Agent pass-auditor, completion notice received · USAGE BASIS: whole-contact (Agent completion notice subagent_tokens)

## CLOSURE
UNIT: p49
DOCS: root PLAN.md § 49 status Done + evidence pointer (before review); ARCHITECTURE.md Components style.css line + Layering item 2 (before review); PROGRESS.md Objective/Done/Next Action/Last Verification (Pass 49; Pass 48 block → one-line pointer)/Known minor issues (P49); CHANGELOG.md one owner entry after the verdict. No PRD/README/AGENTS edit (no new trap).
MIGRATED: final evidence (native suite, counts, comparer 14 named rows, mutation proof, states readout), owner decision on the focused search border, verdict and contact cost → root PROGRESS Last Verification (Pass 49); owner-readable entry → root CHANGELOG.
NITS: reviewer Tier 3 (Done When 3 wording vs the head rows a removed page style element must produce; « Pass 49 » history in ARCHITECTURE Components line; moved blocks keep page indentation/IA compact style; durable commit must force-add the state dir) → root PROGRESS Known minor issues (P49).
COMMIT: 9801e2d91aa95b5b4dc49207dc2e282b6bcc37fb (product rebuild, LOCAL ONLY, not pushed)
