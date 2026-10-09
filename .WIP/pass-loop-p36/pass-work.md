# Pass p36 — Services : structure « Cas d'usage » (Entreprise IA)

## STARTUP
- Root main 0380cbc measured, expected dirt exact; Planner inputs saved as root 91149dd (PLAN, PROGRESS, README, prompts/pass36-mockup-coder.md deleted, prompts/pass36-coder.md added). outputs/ untracked, never staged.
- Product rebuild opening baseline 0b0578e, clean, 55 ahead of origin/rebuild (LOCAL ONLY; no fetch/push). check-ignore `.git/info/exclude:7:/.WIP/`; no p36 state.json before init.
- Ground clear: PROGRESS has no owed human test or open defect for P35.
- Models: work = unknown (not exposed as runtime metadata; declared Opus 5.5 by the system prompt only); auditor = inherited defaults (no effort control exposed). PROGRESS Model restriction exception applies.
- Startup values from the Coder prompt: unit p36, decisions-only, audit_launch_cap 2, whole-repo seal (no seal_paths).
- Active time start 19:28 local (`date`). Fresh conversation (opened by /clear).
- Ports 4173 and 4174 free (`netstat -ano`): own `python -m http.server 4173 --bind 127.0.0.1` from the product folder.

## SLICE
PLAN § 36 Work 1–2, one turn (~30–40 min): two page sections + head copy ported from the approved mockup, one labelled CSS block, version stamps, PLAN status token. Matches the planned size; no split.
- Work 1 `service-ia-business/index.html`: `#besoin` and `#experience` from `previews/service-ia/mockup.html`, then owner changes + Planner decisions (PLAN § 36): lead line without box; no `.service-pilotage` paragraph; no APPROCHE & OUTILS card; no scope parenthesis; « Frictions à supprimer en priorité. »; `#experience` eyebrow dropped, h2 « Expériences associées », four cards with the PLAN titles/sub-lines (owner sub-line « CEO, Directeur marketing, DRH… » with a real ellipsis); h2 « Réflexion »; meta + og description = mockup sentence (three principles, no « démystifier »). Review-only parts never ported: `<base href>`, mockup `<style>`, « (proposition) », « Fait réel à fournir », `.service-career__todo`.
- Apostrophes: the page's existing usage per string = straight `'` everywhere, except the pre-existing row title « Identifier les impacts de l’IA » (typographic, kept). Owner/PLAN strings are written with the straight `'`; `grep -c` checks use the straight form.
- Work 2 `assets/css/style.css`: one labelled block « P36 — Cas d'usage » right after the service block (`.service-careers--two`). IA-only hook = modifier class `service-refinement--usecases` on the IA `#besoin` section (Pass 37 adds it to Stratégie). Rules on shared selectors are scoped under it: `.service-refinement--usecases .service-question-list .disclosure summary`, `… .disclosure__subtitle`, and the lead box removal `#besoin.service-refinement.service-refinement--usecases .lead` (beats the shared `#besoin.service-refinement .lead`). New classes (`.service-detail*`, `.service-rollout*`, `.service-levels`, `.service-level`) are used by no other page. `.service-career__todo` dropped; `.service-pilotage` kept (Stratégie, Venture). Then `node tools/version.mjs`.
- Niveau strip: kept as in the mockup (3 columns, 1 at ≤ 640 px; Planner decision) unless the 1200 render shows it cramped beyond the mockup.
- Acceptance order: audit-first (default). No live system touched: localhost only, YouTube / Typebot / jsdelivr hosts NOTFOUND at the resolver, Google Fonts allowed.
- No MANUAL items: every Done When item is driven by commands or headless Chrome on this machine.

## EXPECTED TESTS
- AUTO-1 DW1 greps on `service-ia-business/index.html`: `grep -cE "section__eyebrow|APPROCHE &amp; OUTILS|service-pilotage|[Dd]émystifier|RÉFLEXION|\(proposition\)|Fait réel|Hors fonctionnalités|Frictions idéales|Expérience associée<"` = 0; `grep -c "Données d'entrée"` ≥ 4; `grep -c` = 1 for « Niveau 1 », « Niveau 2 », « Niveau 3 », « Expériences associées », « Formation de dirigeants à l'IA », « Prototypes de Startup IA », « Automatisation des workflows », « Veille technologique »; extra pins = 1: « Frictions à supprimer en priorité », « CEO, Directeur marketing, DRH… », h2 « Réflexion », meta + og description sentence; review-only leftovers `base href|service-career__todo|P36 MOCKUP` = 0.
- AUTO-2 DW2 `grep -c "<details class=\"disclosure\""` ≥ 4 on the page; `grep -c "P36\|service-rollout" assets/css/style.css` ≥ 1; page `<style>` block identical to 0b0578e (`git diff 0b0578e -- service-ia-business/index.html` shows no change between `<style>` and `</style>`).
- AUTO-3 DW3 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check`, `git diff --quiet 670f72f HEAD -- .github/` exit 0; `git diff --stat 0b0578e` = IA page, style.css and `?v=` stamp lines only (other pages: `git diff -U0` = one `style.css?v=` line each).
- AUTO-4 DW4 `node .WIP/pass-loop-p36/evidence/render.mjs <out> <profile> post` pass=true at 1200 and 375 on `/service-ia-business/`: lead computed `background-color` rgba(0, 0, 0, 0) and padding 0; every `main *` right edge ≤ emulated width (closed and open); real Tab (`Input.dispatchKeyEvent`) to row 02 summary, `:focus-visible`, Enter → `details[open]`, its « Données d'entrée » visible; same for the rollout « Données d'entrée »; scripts off: every row summary and every career card visible (own rect > 0) and topmost; 0 requests outside localhost / Google Fonts. Captures: IA closed 1200/375, IA row 02 open 1200/375. Visual comparison with `previews/service-ia/mockup-1200*.png` / `mockup-375.png` by eye, except owner changes.
- AUTO-5 DW4 Stratégie and Venture unchanged: same script `pre` (before any edit) and `post` record the bounding box (document coordinates) and computed colour/background of every element under `#besoin` and `#experience` at 1200 and 375; comparison = exact equality of the two JSON lists (count + every box), plus full-page captures before/after.
- AUTO-6 Mutation of the IA-only scoping, in the browser DOM only (never the tree): render removes `service-refinement--usecases` from the IA section at the end of the run → lead `background-color` becomes the shared grey box (non-transparent) and the row summary `align-items` returns to `baseline`, proving the hook is what removes the box and scopes the summary rule.
- Changed files vs coverage: `service-ia-business/index.html` (AUTO-1/2/4, check --all); `assets/css/style.css` (AUTO-2/4/5/6, version --check); `?v=` stamps on the other pages (version --check, AUTO-3 diff); root PLAN.md status token (not in the product seal; diff review). None left uncovered.

## CHANGED
- Product: `service-ia-business/index.html` (meta + og description, `#besoin` and `#experience` ported from the mockup with the owner changes, modifier `service-refinement--usecases` on `#besoin`, h2 « Réflexion »; built by a scratch Python script, LF kept, 283 lines); `assets/css/style.css` (one labelled block « P36 — Cas d'usage » after `.service-careers--two`, 18 lines; `.service-career__todo` and `.service-rollout__scope` not ported: their markup is gone); `?v=` stamps on 16 pages (`node tools/version.mjs`, 43 refs).
- Root (docs repo, not in the product seal): PLAN.md § 36 status token Done + evidence pointer line. ARCHITECTURE checked: no line about the service pages' structure became false (lines 9/10/20/22 still true); no change. PROGRESS.md / CHANGELOG.md at closure.
- Evidence: `.WIP/pass-loop-p36/evidence/render.mjs` (p35 recipe adapted), `captures-pre/` (taken before any edit, 6 PNG + geometry), `captures-r1/` (first post run; keyboard probes then strengthened to scroll + topmost).

## TEST-RESULTS r1
TREE: 2c22c5bf13551708
CMD: `grep -cE "section__eyebrow|APPROCHE &amp; OUTILS|service-pilotage|[Dd]émystifier|RÉFLEXION|\(proposition\)|Fait réel|Hors fonctionnalités|Frictions idéales|Expérience associée<" service-ia-business/index.html` + the AUTO-1/2 `grep -c` pins ; `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `git diff --check` ; `git diff --quiet 670f72f HEAD -- .github/` ; `git diff --stat 0b0578e` ; `node .WIP/pass-loop-p36/evidence/render.mjs .WIP/pass-loop-p36/evidence/captures-r2 <scratchpad>/chrome-r2 post`
RESULT: PASS — DW1 forbidden 0; « Données d'entrée » 4; Niveau 1/2/3, « Expériences associées », the four card titles, « Frictions à supprimer en priorité », « CEO, Directeur marketing, DRH… », h2 « Réflexion », h2 « Cas d'usage de l'IA », modifier class = 1 each; description sentence 2 lines (meta + og); mockup leftovers (`base href|service-career__todo|P36 MOCKUP|service-rollout__scope`) 0 in page, 0 in CSS. DW2 details 4; CSS `P36|service-rollout` 5; `.service-pilotage` rule kept (1); page `<style>` identical to 0b0578e; modifier used by the IA page only. DW3 check --all 0 (16 pages, both executed tests PASS); version 0 (43 refs); shell 0; diff --check 0; .github 0; diff --stat 0b0578e = 17 files +114/−75, the 15 other files carry only their `style.css?v=` line. DW4 render pass=true at 1200 and 375: lead `background-color` rgba(0, 0, 0, 0), padding 0, radius 0; summary `align-items` flex-start; max right edge 1185 / 375 closed, row 02 open, both open; real Tab ×25 (1200) / ×20 (375) to row 02 summary, `:focus-visible`, Enter → open, question and « Données d'entrée » topmost; Tab ×2 to the rollout « Données d'entrée », `:focus-visible`, Enter → open, first item topmost; scripts off: 4 summaries + 4 cards visible and topmost, sections opacity 1; 0 requests outside localhost / Google Fonts in every run; levels 3 × 154 px at 1200 (as the mockup), 1 column 293 px at 375. Stratégie / Venture: geometry + colours of every `#besoin` / `#experience` element (96 / 68) identical pre vs post at 1200 and 375.
NOTES: Comparison method = bounding boxes (document coordinates) + computed colour/background/align-items, decisive. Pixel diff of the full-page PNG also run: identical for Stratégie 1200/375 and Venture 1200; Venture 375 differs by 108 antialiasing pixels on the edges of the CorpAngels video thumbnail image only (76 in its rounded 14 px corners), max 58/255, geometry identical; r1 and r2 post captures identical to each other; no CSS rule of this Pass reaches that element. AUTO-6 DOM mutation (class removed in the browser only): lead turns rgb(245, 248, 252) padding 24px radius 18px and summary `align-items` baseline → the modifier is what removes the box and scopes the summary rule. Server: own `python -m http.server 4173 --bind 127.0.0.1`, `curl | cmp` SAME for IA, Stratégie, Venture pages and style.css before each run. Visual comparison with `previews/service-ia/mockup-1200-open.png` / `mockup-375.png` by eye: same layout; differences = owner changes only (no lead box, no scope line, no Pilotage box, plural h2, new card titles/sub-lines, « Frictions à supprimer en priorité. »). Niveau strip kept (Planner decision). Captures: `evidence/captures-pre/` (before any edit), `evidence/captures-r2/` (final; `captures-r1/` = first run before the keyboard probes scrolled + required topmost, same results).

## Review contact 1 of 2 - fresh auditor (code-audit phase-gate) - Greenlight
Scope: CLEAN (IA-only modifier `.service-refinement--usecases` = necessary side work asked by prompt B; `.service-rollout__scope` and `.service-career__todo` correctly not ported). Seal: product diff = IA page + style.css P36 block + 15 stamp-only pages; root PLAN.md diff = status token + evidence pointer only.
Tier 3 advisory (no fix section): (1) PLAN § 36 evidence pointer names « PROGRESS Last Verification (Pass 36) », absent until closure writes it. (2) Full-page PNG diffs of Strategie/Venture differ only in the lazy-loaded Reflexion figure (image load timing); the decisive proof is the #besoin/#experience geometry, identical base vs post.

```json
{
  "token": "9b1de295",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all (product working tree)", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --stat 0b0578e + per-file normalized diff: 15 pages change only style.css?v=3a5846ad to 121b633a; IA page and style.css otherwise", "result": "PASS"},
    {"cmd": "grep -cE forbidden pattern of Done When 1 on service-ia-business/index.html = 0; Donnees d'entree = 4; Niveau 1/2/3, Experiences associees, four card titles = 1 each", "result": "PASS"},
    {"cmd": "grep -c details.disclosure = 4; grep -c P36|service-rollout style.css = 5; page style blocks md5 base == worktree", "result": "PASS"},
    {"cmd": "curl http://127.0.0.1:4173 + cmp against working tree for IA, style.css, Strategie, Venture", "result": "PASS"},
    {"cmd": "node .WIP/pass-loop-p36/evidence/render.mjs <scratch>/post <scratch>/profile post: ia.pass true at 1200 and 375 (lead transparent, Tab+Enter row 02 and rollout, scripts off, right edges, 0 outside requests)", "result": "PASS"},
    {"cmd": "git archive 0b0578e served on 127.0.0.1:4175 + render.mjs pre; Strategie/Venture #besoin/#experience geometry base == post at 1200 and 375 (96 and 68 elements, 0 diffs)", "result": "PASS"},
    {"cmd": "python pixdiff.py base vs post Strategie/Venture PNGs: no pixel change inside #besoin/#experience", "result": "PASS"},
    {"cmd": "node allopen.mjs: all 4 #besoin details open, scripts on and off, 1200 and 375: 0 elements past viewport, 21/21 detail items sized", "result": "PASS"},
    {"cmd": "visual side-by-side mockup-1200.png/mockup-375.png vs shipped #besoin..#experience crop: matches except owner changes", "result": "PASS"},
    {"cmd": "git -C root diff PLAN.md: section 36 status token + evidence pointer only", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 130,888 tokens, 6 min 41 s (401,408 ms, 48 tool uses), GREEN high
INVOCATION: fresh pass-auditor subagent, launched 19:36 local, completion notice ~19:42
USAGE BASIS: whole-contact (subagent_tokens from the Agent completion notice)

## CLOSURE
UNIT: p36
DOCS: root PLAN § 36 status Done + evidence pointer (before review); PROGRESS (Current Objective, Done, Open, Next Action, Last Verification, Known minor issues) and CHANGELOG entry after GREEN, in the root closure commit. ARCHITECTURE checked, unchanged (no service-structure line became false). No AGENTS Gotcha added, no PRD/README edit.
MIGRATED: final test evidence, render results, Stratégie/Venture comparison, verdict and review cost → root PROGRESS Last Verification (Pass 36); what shipped → root CHANGELOG.
NITS: reviewer T3-1 (PLAN evidence pointer names PROGRESS Last Verification Pass 36, written at this closure) resolved by the root closure commit; T3-2 (full-page pixel diffs on Stratégie/Venture vary with lazy image load timing; geometry is the decisive proof) → root PROGRESS Known minor issues.
COMMIT: 6c2d9af (product work commit, LOCAL ONLY, not pushed)
- Closure note: `captures-r1/` PNGs dropped before the durable commit (superseded by r2, same results); its `render-result.json` kept.
