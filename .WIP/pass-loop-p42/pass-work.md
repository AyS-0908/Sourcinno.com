# Pass p42 — Textes et accessibilité — finitions

## STARTUP
- Root main 96f21c8 at pre-flight (expected dirt exact); Planner inputs saved as 586a821 (ARCHITECTURE, PLAN, PROGRESS, README, prompts/pass41-coder.md deleted, prompts/pass42-coder.md added). Product rebuild 1ebc699 clean = `pass_base`; check-ignore `.git/info/exclude:7:/.WIP/`; no live Pass.
- Models: work claude-opus-5-5 (declared by the session system prompt; effort not exposed = unknown); auditor same model, inherited settings (no effort control exposed). PROGRESS Model restriction exception applies. Cap 2 contacts, decisions-only, no seal_paths (whole product repo).
- Port 4173: not listening at pre-flight (`netstat -ano | findstr :4173` exit 1). Start 2026-10-10 00:38 local (`date`).

## SLICE
PLAN § 42 Work 1–6, about one turn (30–35 min): measured matches the plan (36 `target="_blank"` links on 10 pages: footer 10 + blog 11 stamped by tools, 13 hand edits, 2 already named by `aria-label`), no split.
1. `tools/shell/header.html:9` label « Sourcinno, retour &agrave; l&rsquo;accueil » (partial's own entity idiom); `node tools/shell.mjs`.
2. `og:image:alt` line 19 of the 10 shell pages: « …IA et Venture Building ».
3. Eyebrows: `hero__eyebrow` removed on contact, mentions-legales, politique-confidentialite, portfolio (404 keeps « Erreur 404 »); contact's three `section__eyebrow` removed; `.section__eyebrow` rule leaves `style.css` (reverse census). Hero spacing at 375 measured before/after.
4. « (nouvel onglet) »: `<span class="visually-hidden"> (nouvel onglet)</span>` as last child of each `target="_blank"` link (leading space inside the span); footer partial + `node tools/shell.mjs`; `tools/blog-sync.mjs:96` template + re-stamp from ONE saved feed copy (`--check --from <copy>` on the untouched page first); 13 hand edits in pages; the two `aria-label` links already end with it. `--a11y` rule: every `target=_blank` link (quotes optional) has an accessible name ending « (nouvel onglet) » — `aria-label` when present (visible text then ignored), else inner text with comments, `aria-hidden="true"` elements and tags stripped; `aria-labelledby` on such a link fails (not read by the rule). `title`, text after `</a>`, a comment do not count. Note prints the count of `target="_blank"` links and of pages carrying them. `rel="noopener"` rule kept.
5. P41 T3-1: bare-page case closes then reopens after the successful open, `calls` stays 2. T3-2: `textContent = '…'`.
6. `node tools/version.mjs` (style.css, ia-embeds.js).
No MANUAL items: every check, the rendered one included, is driven from the terminal.
LIVE-SAFE: the only live touch is ONE read-only GET of the public Wix feed (owner-approved by the prompt); no write, no record created, no mode changed; nothing left behind except the scratch copy in the session scratchpad.
Acceptance order: default audit-first.

## EXPECTED TESTS
- AUTO-1 `node tools/check.mjs --all` — expect exit 0, both executed tests PASS, `--a11y` note « 36 lien(s) target="_blank" … 10 page(s) », all named.
- AUTO-2 `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `node tools/blog-sync.mjs --check` (live; `--from <copy>` if Wix moved between reads), `git diff --check` — expect 0 each.
- AUTO-3 `git diff --stat 1ebc699 -- . ':(exclude).WIP'` — expect only `tools/shell/header.html`, `tools/shell/footer.html`, the 10 shell pages, `assets/css/style.css`, `assets/js/ia-embeds.js`, `tools/check.mjs`, `tools/blog-sync.mjs`, `tools/test-ia-embeds.mjs`.
- AUTO-4 `git grep -n -e "retour a l accueil" -e "IA et venture building" -- '*.html' tools/shell` — expect nothing; `git grep -n eyebrow -- '*.html' ':(exclude).WIP' ':(exclude)_v2'` — expect only `404.html:72`.
- AUTO-5 scratch copies (`git -c core.autocrlf=false archive 1ebc699` + working files, session scratchpad), fresh copy per case, `version.mjs` re-stamped: unmodified → `--a11y` 0 and `--all` 0; « (nouvel onglet) » removed from one blog link → `--a11y` 1 naming `publications/index.html`; removed from a link's `aria-label` → 1; present only after `</a>` → 1; `if (status)` removed before `status.hidden = true` → `--all` 1 (test-ia-embeds). Own: in `title` only → 1; in a comment inside the link → 1; inside an `aria-hidden` span → 1; `target='_blank'` single-quoted unnamed → 1; aria-label link whose hidden span stays but label loses it → 1; control: an unnamed link WITHOUT `target` → 0.
- AUTO-6 rendered, headless Chrome (AGENTS recipe), 127.0.0.1, 1200 and 375: `/contact/`, `/mentions-legales/`, `/politique-confidentialite/`, `/portfolio/` no `.hero__eyebrow`/`.section__eyebrow`, no element right edge beyond the width; CDP `Accessibility.getPartialAXTree` names: one blog link and footer LinkedIn on `/publications/`, one card link (Engagez-vous 2.0), one `aria-label` link (Stratégie diagram) end « (nouvel onglet) » with a space before « ( »; visible link boxes equal to 1ebc699 (served from a scratch export on a second port); hero h1 offset at 375 before/after.
Changed files vs AUTO reach: header/footer partials + 10 pages (AUTO-1 STRUCTURE identity, `--a11y`, `--seo`, AUTO-6), `style.css` (AUTO-1 census, AUTO-6), `ia-embeds.js` + `test-ia-embeds.mjs` (AUTO-1 executed test, AUTO-5), `check.mjs` (AUTO-1, AUTO-5), `blog-sync.mjs` (AUTO-2 `--check`). None unreached.
Audit budget: 1 fresh full review (~130–170k tokens, P41 comparable 134,943), 1 same-reviewer confirmation reserved.

## CHANGED
Product (vs 1ebc699, `git diff --stat 1ebc699 -- . ':(exclude).WIP'` = 23 files, +108/−93): `tools/shell/header.html` (logo label « Sourcinno, retour à l’accueil » as `&agrave;`/`&rsquo;`), `tools/shell/footer.html` (LinkedIn hidden span), the 10 shell pages (stamp by `node tools/shell.mjs`; `og:image:alt` line 19; eyebrows: contact −4, mentions-legales/politique-confidentialite/portfolio −1 each; 13 hand-written new-tab links get the span: contact 1, mentions-legales 3, politique-confidentialite 1, publications 4, service-ia-business 2, service-venture-building 2; publications blog list re-stamped by `node tools/blog-sync.mjs --from <saved feed>`), `assets/css/style.css` (`.section__eyebrow` rule removed), `assets/js/ia-embeds.js` (T3-2 space), `tools/check.mjs` (`--a11y` new-tab name rule + note), `tools/blog-sync.mjs` (template :96), `tools/test-ia-embeds.mjs` (T3-1 close/reopen, `calls` stays 2); `?v=` stamps by `node tools/version.mjs` on all 16 pages — INCLUDING the 6 redirect stubs (`ai-business.html`, `venture-building.html`, `offre-ia-business/`, `offre-strategie-organisation-processus/`, `offre-venture-building/`, `prototypes/`), one `style.css?v=` line each: PLAN Done When 1 path list did not name them (same mechanism as P40), `version.mjs --check` requires them. Recorded in PLAN § 42 Evidence as NOT met as typed.
Root docs (outside this seal): PLAN § 42 token Done + Evidence line; ARCHITECTURE line 14 (`check.mjs --a11y` new-tab rule, `blog-sync.mjs` span). PROGRESS/CHANGELOG at closure.
Hero at 375 after the eyebrow: h1 now at the hero's own top padding (52 px), hero 29–30 px shorter on the 4 pages; top does not collapse (captures `evidence/hero-*-375-*.png`): no style change.
Feed: ONE fetch (`curl`, HTTP 200, 13,506 B) saved in the session scratchpad `feed/blog-feed.xml`; untouched page `node tools/blog-sync.mjs --check --from <copy>` 0 (11 French: IA 6, Venture Building 4, Startup 1; 9 English): no Wix change.

## TEST-RESULTS r1
TREE: e280fa277b6fda12
CMD: `node tools/check.mjs --all` (0: 16 pages, both executed tests PASS, note « 36 lien(s) target="_blank" sur 10 page(s), chacun lu pour « (nouvel onglet) » »); `node tools/version.mjs --check` 0 (43 refs); `node tools/shell.mjs --check` 0 (10 pages); `node tools/blog-sync.mjs --check` (LIVE, 2nd and last feed read) 0 (11 French: IA 6, VB 4, Startup 1; 9 English); `git diff --check` 0; `git grep -n -e "retour a l accueil" -e "IA et venture building" -- '*.html' tools/shell` empty (exit 1); `git grep -n eyebrow -- '*.html' ':(exclude).WIP' ':(exclude)_v2'` = `404.html:72` only; `.github` vs 1ebc699 and workflow vs 670f72f unchanged.
RESULT: PASS — `git diff --name-only 1ebc699 -- . ':(exclude).WIP'` = PLAN Done When 1 paths + the 6 redirect stubs (one `?v=` line each, see CHANGED); all pages and partials LF (`git ls-files --eol`), no BOM in edited scripts.
NOTES: Mutation ledger `node .WIP/pass-loop-p42/evidence/mutate.mjs <product> <scratchpad>/mut` (archive 1ebc699 `-c core.autocrlf=false` + the 23 working files, fresh copy per case, `version.mjs` re-stamped): 14/14 as expected — unmodified `--a11y` 0 and `--all` 0; blog link span removed → `--a11y` 1 « publications/index.html … (« GPTs : attention ! ») »; Stratégie `aria-label` without it → 1 (« Stratégie »); span only after `</a>` → 1 (contact); `if (status)` removed before `status.hidden = true` → `--all` 1 (test-ia-embeds AssertionError: `calls` 3 ≠ 2). Own: only in `title` → 1; in a comment inside the link → 1; inside an `aria-hidden` span → 1; `target='_blank'` single-quoted, span removed → 1; `aria-label="Hostinger"` over a link whose text keeps the span → 1; `aria-labelledby` → 1; controls (no false FAIL): « (onglet) » on a link without target → 0; span text ending `&nbsp; ` → 0.
Rendered `node .WIP/pass-loop-p42/evidence/render.mjs <scratchpad>/render http://127.0.0.1:4173 http://127.0.0.1:4174` (headless Chrome; 4173 = this tree, 4174 = scratch export of 1ebc699; both `python -m http.server --bind 127.0.0.1`, ports free at start, stopped after; reduced motion `reduce`; hosts contacted: the two local ports + Google Fonts): `/contact/`, `/mentions-legales/`, `/politique-confidentialite/`, `/portfolio/` at 1200 and 375: 0 `.hero__eyebrow`/`.section__eyebrow`, no element right edge beyond the width. AX names (`Accessibility.getPartialAXTree`, role link): blog « GPTs : attention ! (nouvel onglet) », footer « LinkedIn (nouvel onglet) », card « Engagez-vous 2.0 (nouvel onglet) », aria-label « Stratégie (nouvel onglet) », contact in-text « linkedin.com/in/aymarddescorbiac (nouvel onglet) » — space before « ( » in each; link boxes new = old (196.2×26, 63×20, 211.3×26, 760×427.9, 262×20), hidden span 1×1 clip rect(0 0 0 0). Hero 375 old→new: h1 offset 81→52 px (= padding-top 52), height −29/−30 px. Output `evidence/render.json`.

### Review contact 1 (fresh auditor) - Tier 3 observations, advisory only
Greenlight: every Done When re-run on the auditor's own copies (scratchpad/review); SCOPE: the 6 redirect-stub `style.css?v=` lines are necessary side work (`version.mjs --check` needs them; declared in PLAN § 42 Evidence); nothing else unrequested.
- T3-1 `tools/check.mjs:607-614` the new-tab rule mis-reads markup the site does not use (Chrome AX name checked): false PASS for a `<span hidden>`, a single-quoted `aria-hidden='true'`, a `data-aria-label` (read as `aria-label` because of `\b`), and a link whose earlier attribute holds `>` (not scanned; count drops to 35); false FAIL for an empty `aria-label=""` and a commented-out new-tab link. The printed count (36) is the only guard against the last case.
- T3-2 `politique-confidentialite/index.html` cnil.fr link box 1 px wider (hidden span breaks kerning before the trailing "."); the only box change among the 36 links; not visible.
- T3-3 PLAN § 42 Evidence points to PROGRESS Last Verification (Pass 42) and the durable closure commit, neither written yet; closure must write them (same order as P41).

```json
{
  "token": "2498e6a8",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all (product working tree; note: 36 target=_blank links on 10 pages)", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "node tools/blog-sync.mjs --check --from scratchpad/feed/blog-feed.xml (11 French posts)", "result": "PASS"},
    {"cmd": "git diff --check 1ebc699 (product) and git diff --check (root)", "result": "PASS"},
    {"cmd": "git diff --stat 1ebc699 -- . ':(exclude).WIP' = declared 17 paths + 6 redirect stubs, one style.css?v= line each (declared in PLAN 42 Evidence)", "result": "PASS"},
    {"cmd": "git grep -n -e 'retour a l accueil' -e 'IA et venture building' -- '*.html' tools/shell (empty) ; git grep -n eyebrow -- '*.html' ':(exclude).WIP' ':(exclude)_v2' (only 404.html:72)", "result": "PASS"},
    {"cmd": "node review/mut.mjs on own archive 1ebc699 + working copy: unmodified --a11y 0 and --all 0; Enjeu #1 span removed, Business model aria-label stripped, cnil.fr span after </a> -> --a11y 1 naming the page; ia-embeds if (status) removed -> --all 1 via test-ia-embeds; own: footer partial stripped + re-stamped -> 10 pages, TARGET=_BLANK, unquoted target, wrong case, trailing text -> 1", "result": "PASS"},
    {"cmd": "node --experimental-vm-modules tools/test-ia-embeds.mjs with the status.hidden guard removed: 1ebc699 test exit 0, new test exit 1 at :98 (T3-1 pinned)", "result": "PASS"},
    {"cmd": "node review/render.mjs headless Chrome, 127.0.0.1:4183/4184 + Google Fonts only (0 blocked): 4 pages x 1200/375 eyebrows 0, no element past viewport; 36/36 new-tab links CDP AX name ends (nouvel onglet), visible text unchanged; logo name Sourcinno, retour a l'accueil; og:image:alt IA et Venture Building on 10 pages", "result": "PASS"},
    {"cmd": "git diff -- ARCHITECTURE.md PLAN.md (root): line 14 a11y sentence matches check.mjs; PLAN 42 token Done + Evidence line names the 6-stub gap", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 142,912 tokens, 8 min 53 s (532,779 ms), GREEN high. INVOCATION: pass-auditor subagent (Agent tool, async; id in session only); USAGE BASIS: whole-contact, from the Agent completion notice (41 tool uses). Main session usage unknown.
Reviewer process note: scratch under the session scratchpad `review/` only; ports 4183/4184 after netstat; network 127.0.0.1 + Google Fonts; no Wix fetch, no Typebot open; nothing edited/staged/committed (product status hash unchanged per its report; fingerprint e280fa277b6fda12 re-measured identical before `verdict`).

## CLOSURE
UNIT: p42
DOCS: root PLAN § 42 token Done + Evidence line and ARCHITECTURE line 14 (`--a11y` new-tab rule, `blog-sync.mjs` span) before review; root PROGRESS (Current Objective, Done, Open: Done When 1 path-list gap, Next Action Pass 44, Last Verification Pass 42, Known minor issues P42 T3 + P41 T3 fixed) and CHANGELOG entry after GREEN. No PRD/README/AGENTS change (no new trap: the redirect-stub re-stamp is the known `version.mjs` behaviour).
MIGRATED: final test evidence (r1 commands/exits, 14/14 mutation ledger, rendered AX names, hero geometry), the GREEN high verdict and its cost, the Done When 1 gap → PROGRESS Last Verification / Open; shipped behaviour → CHANGELOG.
NITS: reviewer T3-1 (rule mis-reads unused markup: `hidden`, single-quoted aria-hidden, data-aria-label, `>` in an attribute; empty aria-label, commented link), T3-2 (cnil.fr box +1 px), T3-3 (Evidence pointers written at closure) → root PROGRESS Known minor issues (P42), unrouted, Planner decides at CHECK.
COMMIT: 2a505d33118653852d77de4f2109f76a41c7ac71
