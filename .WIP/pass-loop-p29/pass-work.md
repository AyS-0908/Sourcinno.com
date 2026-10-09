# Pass p29 — Accueil : hero, « Votre enjeu », deux services, survol

## STARTUP
- Root Planner inputs saved as 4e6c78ea2b54f9b9682747c334b9c4da1b67e326 (5 paths: ARCHITECTURE, PLAN, PROGRESS, README, prompts/pass29-coder.md); root dirt matched the prompt exactly; outputs/ untracked, not staged.
- Product base 2ce1b23196d037eeeecdf9b34410663af87c2b1d (rebuild), clean; no live Pass; `.WIP/` ignored by `.git/info/exclude:7`.
- Models: work = claude-opus-5-5 (session-declared), effort unknown (not exposed). Reviewer: inherited defaults (PROGRESS Model restriction exception); not runtime-verified.
- audit_launch_cap = 2, decisions-only, seal = whole product repository.
- Owner vetoes: none received in the launching message (prompt carried only "Read and execute"); all three proposals (light-teal « Transformation », Venture Building link line, home cta-band) carried by default.
- Server: 127.0.0.1:4173 LISTENING pid 44640; `curl -s http://127.0.0.1:4173/index.html | cmp - index.html` identical and it serves this Pass's fresh `.WIP/pass-loop-p29/state.json` = this working tree; reused.

## SLICE
Size: one turn (~30–40 min). Matches PLAN § 29; no re-slice.
Measured before any write (product 2ce1b23):
- `index.html:148` eyebrow, `:149` h1, `:159` `<h2>SERVICES</h2>`, `:160` lead with colon, `:163` `grid grid--3`, `:184` `card--venture` article; `grep -c 'href="/service-venture-building/"' index.html` = 3 (menu, card, footer).
- Home hero is `.hero--animated`; its h1 width rule is `.hero--animated h1 { max-width: 14ch }` (`style.css:799`), which overrides `.hero h1 { max-width: 18ch }` (`:300`); `hero--animated` has one consumer (index.html). Two-line h1 at 1200 is measured after the edit; widen only `.hero--animated h1` if a third line appears.
- `p { margin: 0 0 var(--space-2) }`, `.grid` has no margin: a `<p>` right after `#services .grid` sits flush under the cards. One spacing rule `#services .grid + p` (no new class) replaces the deleted `.card--venture` line in the same #services block; reuses `.link-arrow` (CSS arrow, teal-dark on white).
- Reduced-motion block (`:518`) precedes `.card--service:hover` (`:856`): equal specificity would lose to the later rule, so the block uses `!important` (same idiom as its other declarations).
- `.card--service` rest shadow is already `var(--shadow)`; hover sets the same token + translateY(-2px).
- `tools/shell/header.html`: no BOM (`od -c` = `<he`), LF.
- `.card` consumers: card--service ×3 (home), service-career ×12, service-phase ×6, publication-profile ×1, plain ×4.
Work: PLAN § 29 Work 1–4 exactly; plus the spacing rule above.
No MANUAL item: every check runs offline here (headless Chrome on localhost). LIVE-SAFE: no live system touched.

## EXPECTED TESTS
- AUTO-1 PLAN DW1: `grep -c "hero__eyebrow" index.html` = 0; `grep -c "<h1>De la Stratégie<br>à la <span>Transformation</span></h1>" index.html` = 1.
- AUTO-2 PLAN DW2: `grep -c "<h2>Votre enjeu</h2>" index.html` = 1; `grep -c 'class="card card--service' index.html` = 2; `grep -c "card--venture\|grid--3" index.html` = 0; `grep -c "card--venture" assets/css/style.css` = 0; `grep -c 'href="/service-venture-building/"' index.html` = 3; awk demarche<cta-band prints 1.
- AUTO-3 PLAN DW3: `grep -c "translateY(-6px)" assets/css/style.css` = 1; btn hover transform count 0; shadow tokens rgba(0, 0, 0 count 3; `site-footer a:not(.btn):hover` count 1.
- AUTO-4 PLAN DW4: emoji grep in header partial = 0; `node tools/shell.mjs --check` exit 0; `grep -rn "btn--outline" --include=*.html . | grep -v .WIP` empty; partial has no BOM after save.
- AUTO-5 PLAN DW5, headless Chrome (P28 render.mjs recipe, 127.0.0.1:4173) at 1200 and 375: h1 two lines at 1200 (distinct `top` of Range client rects over h1 = 2); two `.card--service` same top, equal heights (rect) at 1200, stacked at 375; link line and cta-band each inside the viewport once scrolled to and revealed (opacity 1); no horizontal overflow; forced `:hover`: home `.card--service` transform `matrix(1, 0, 0, 1, 0, -2)`; `/service-ia-business/` `.card.service-career` `none`; `/publications/` `.card.publication-profile` `none`; header `.btn--primary` `none`; footer CTA colour equal at rest and hover; reduced motion emulated: home `.card--service` hover `none`; dropdown (desktop, open) and mobile menu box-shadow not `none`; captures in `evidence/`.
- AUTO-6 PLAN DW6: `node tools/check.mjs --all` exit 0 (once, final checkpoint); `node tools/version.mjs --check` exit 0; `git diff --check` exit 0; `git diff --quiet 670f72f HEAD -- .github/` exit 0; `git diff --stat` stamped pages touched only in the header region (2 lines each), no whole-file rewrite.
- AUTO-7 `--nojs` covered inside `--all`: home cta-band carries `reveal` and the shared `<noscript>` reveals it.
Changed files vs coverage: index.html (AUTO-1/2/5/6), assets/css/style.css (AUTO-3/5/6), tools/shell/header.html + 10 stamped pages (AUTO-4/6), portfolio/index.html (AUTO-4/6), `?v=` stamps (AUTO-6 version --check). None uncovered.
MANUAL: none for this Pass (all checks driven by the session).

## CHANGED
- index.html: hero eyebrow deleted; h1 `De la Stratégie<br>à la <span>Transformation</span>`; `#services` h2 « Votre enjeu », lead in `<strong>` (colon dropped), `grid--2`, Venture card article deleted, link line `<p><a class="link-arrow" href="/service-venture-building/">Venture Building : préparer les marchés d’avenir</a></p>` (arrow from `.link-arrow::after`); cta-band section copied verbatim from service-venture-building/index.html:176-180 after `#demarche`.
- assets/css/style.css: `--shadow*` rgba(0, 0, 0, same alphas); `.btn--primary/secondary/ghost:hover` no transform; `.card:hover` border tint only; `.card--service:hover` translateY(-2px) + var(--shadow) + existing border; `.site-footer a:not(.btn):hover`; reduced-motion block `.card:hover, .card--service:hover { transform: none !important; }` (the block precedes `.card--service:hover`, equal specificity would lose); `.card--venture` rule deleted; NEW rule `#services .grid + p { margin: var(--space-3) 0 0; }` (no new class; measured: p margin-top 0 and .grid no margin = link line flush under the cards; rendered gap now 24 px). Image `pictures/2cvb_hero.png` kept.
- tools/shell/header.html: `&#9823;&#65039; ` and `&#10024; ` removed (no BOM, LF); `node tools/shell.mjs` stamped 10 pages (2 header lines each).
- portfolio/index.html: `btn--outline` → `btn--secondary` (A-003 class swap only).
- `node tools/version.mjs`: style.css `?v=8e62224a` → `?v=85d115f4` on 16 pages (1 line each).
- h1 width: no change needed (two lines at 1200 with the existing `.hero--animated h1 { max-width: 14ch }` = 560 px).
- Root (outside the product seal): PLAN § 29 status Done + pointer; AGENTS Gotchas + headless reduced-motion default.

## TEST-RESULTS r1
TREE: 0de4580992e9a6a2
CMD: `node tools/check.mjs --all` exit 0 (16 pages, 10 shells + 6 stubs, 306 internal links, --nojs 10 pages, both test PASS lines); `node tools/version.mjs --check` exit 0 (40 refs); `node tools/shell.mjs --check` exit 0; `git diff --check` exit 0; `git diff --quiet 670f72f HEAD -- .github/` exit 0
RESULT: PASS — PLAN DW1 0/1; DW2 1/2/0/0/3/awk 1; DW3 1/0/3/1; DW4 emoji 0, shell --check 0, btn--outline grep empty; partial first bytes `<he` (no BOM). `git diff --stat` 18 files 61+/64-: shells 3 lines (2 header + 1 ?v=), stubs 1 line, no whole-file rewrite.
NOTES: Rendered DW5 `node .WIP/pass-loop-p29/evidence/render.mjs .WIP/pass-loop-p29/evidence/captures-r1 <scratch-profile>` exit 0 on 127.0.0.1:4173 (pid 44640, serves this tree: `curl | cmp index.html` identical); results `evidence/captures-r1/render-result.json`, 10 captures.
- 1200: h1 2 lines (Range rect tops 168/231; height 126 ÷ line-height 63px = 2), span colour rgb(159, 227, 224), no eyebrow; cards same top 806, x 37–581 / 605–1149, heights 448/448; link line rect 436–463 inside viewport + topmost, 24 px under grid; cta-band button 422–477 inside + topmost, section opacity 1, next sibling of #demarche; scrollWidth 1185 ≤ 1200.
- 375: h1 3 lines (not a criterion; « Transformation » alone on line 3); cards stacked (1136 → 1160); link line and cta-band inside + topmost; scrollWidth 375.
- Forced :hover (`CSS.forcePseudoState`, prefers-reduced-motion emulated no-preference): home `.card--service` `matrix(1, 0, 0, 1, 0, -2)` (rest none); IA `.card.service-career` none (border tint only), `.card.service-phase` none; Publications `.card.publication-profile` none; header `.btn--primary` none (bg 247a78 → 1f6360); footer CTA colour rgba(255,255,255,0.78) rest = hover; footer list link → rgb(127,214,211). Reduced motion emulated reduce: home card hover none.
- Shadows still visible: desktop dropdown `rgba(0, 0, 0, 0.16) 0px 20px 44px`; 375 menu open `rgba(0, 0, 0, 0.1) 0px 12px 32px`. Portfolio « Réinitialiser » 2px solid navy border.
- Surprise: headless Chrome here defaults to reduced motion; first run (`evidence/captures/`, kept) read card hover `none` for that reason only — not a CSS defect. Captures inspected by eye: hero 1200/375, link line 1200, cta 1200.

## Review contact 1 of 2 - fresh auditor (code-audit phase-gate)
Greenlight: Done When 1-6 re-run independently, no Tier 1/2 finding. Scope: CLEAN (only necessary side work: `#services .grid + p` spacing for the requested link line; `!important` in the reduced-motion card rule, needed because `.card--service:hover` sits later in the file).
Tier 3 advisory (no fix section, no further review): (1) at 375 px the home h1 wraps to 3 lines (De la Stratégie / à la / Transformation) - not a Done When item; (2) `#services .card--service` already rests at `var(--shadow)`, so the hover shadow change is a no-op and only the 2 px lift is visible - plan wording met literally.

```json
{
  "token": "08f12856",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "git diff --stat 2ce1b23 (18 files; non-core pages carry only header-emoji and ?v= lines per uniq -c of +/- lines); git diff --diff-filter=D --name-only 2ce1b23 (empty)", "result": "PASS"},
    {"cmd": "DW1: grep -c hero__eyebrow index.html = 0; grep -c '<h1>De la Stratégie<br>à la <span>Transformation</span></h1>' index.html = 1", "result": "PASS"},
    {"cmd": "DW2: grep -c '<h2>Votre enjeu</h2>' = 1; grep -c 'class=\"card card--service' = 2; grep -c 'card--venture\\|grid--3' index.html = 0; grep -c card--venture style.css = 0; grep -c 'href=\"/service-venture-building/\"' = 3; awk demarche<cta-band prints 1", "result": "PASS"},
    {"cmd": "DW3: grep -c 'translateY(-6px)' style.css = 1; grep -E '\\.btn--[a-z]+:hover' | grep -c transform = 0; grep -E '^\\s*--shadow(-sm|-lg)?:' | grep -c 'rgba(0, 0, 0' = 3; grep -c 'site-footer a:not(.btn):hover' = 1", "result": "PASS"},
    {"cmd": "DW4: grep -c '&#9823;\\|&#10024;' tools/shell/header.html = 0; node tools/shell.mjs --check exit 0; grep -rn btn--outline --include=*.html . | grep -v .WIP empty; header.html first bytes 3c 68 65 (no BOM)", "result": "PASS"},
    {"cmd": "curl -s http://127.0.0.1:4173{/,/assets/css/style.css,/service-ia-business/,/tools/shell/header.html} | cmp - <worktree file> (all SAME)", "result": "PASS"},
    {"cmd": "node scratchpad/audit29.mjs (independent CDP probe, prefers-reduced-motion no-preference + reduce): 27 checks 0 FAIL - h1 2 lines at 1200, cards side by side equal 448px at 1200 and stacked at 375, link line and cta-band in viewport opacity 1, no overflow, home card hover matrix(1, 0, 0, 1, 0, -2), service-career and publications card none, header btn none, footer CTA colour unchanged, dropdown and mobile menu shadow visible, reduce -> none", "result": "PASS"},
    {"cmd": "node scratchpad/default.mjs (no media emulation): matchMedia('(prefers-reduced-motion: reduce)').matches = true, confirms new AGENTS Gotcha", "result": "PASS"},
    {"cmd": "DW6: node tools/check.mjs --all exit 0 (OK 16 pages, --nojs green); node tools/version.mjs --check exit 0; git diff --check exit 0; git diff --quiet 670f72f HEAD -- .github/ exit 0", "result": "PASS"},
    {"cmd": "git -C C:/Users/aymar/AYS_CODING/code-SOURCINNO_WWW diff PLAN.md AGENTS.md (only section 29 status token + Evidence line, one Gotcha line; outputs/ untracked)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 104764 tokens, 3 min 53 s, GREEN
INVOCATION: pass-auditor subagent (id kept in the session only) | USAGE BASIS: whole-contact (Agent completion notice: 104764 subagent tokens, 21 tool uses, 232822 ms)

## CLOSURE
UNIT: p29
DOCS: root PLAN § 29 status Done + evidence pointer (before review); AGENTS Gotchas + headless reduced-motion default (before review); PROGRESS Current Objective/Done/Next Action/Last Verification/Known minor issues and one CHANGELOG entry (after the verdict). No PRD/README/ARCHITECTURE edit.
MIGRATED: final native results, rendered measurements, verdict and contact cost -> PROGRESS Last Verification (Pass 29); summary -> CHANGELOG 2026-10-09.
NITS: reviewer Tier 3 (h1 3 lines at 375; service-card hover shadow equals rest shadow, only the 2 px lift shows) -> PROGRESS Known minor issues (P29 reviewer observations).
COMMIT: 3c5858d02d91d11ec830d8e00c1ddcae2b8613ac (product work, LOCAL ONLY, not pushed)
