# Pass 66 — COORDONNÉES ET PAGE « PERFORMANCE » (journal)

Source: root `prompts/pass66-coder.md`, PLAN § 66 (Work 1-5, Done When 1-5), § V1.3 D1-D3, D8.
Pass base (product): 275d20f198d16b2a649cbc7647fa880555e03974 (`state.json` pass_base). Root base: 8aa18c2.
Reviewer: Agent tool, agent `pass-auditor`, settings inherited (PROGRESS « Model restriction exception »). Work model declared claude-opus-5-5 (system prompt), effort not exposed: unknown. Nothing runtime-verified.
Pre-flight (2026-10-28): `plan.py status` « no pass is waiting on you »; root `main` clean; product `rebuild` 275d20f clean, 54 ahead of origin/rebuild; `check.mjs --all` 0 (16 pages, blog 13), `shell.mjs --check` 0 (9 pages, 7 stubs), `version.mjs --check` 0 (41).

## SLICE

Size: one turn (about 45 active minutes, as planned). No split.
1. Email: every `aymard.de.scorbiac@sourcinno.com` → `contact@sourcinno.com` — `tools/shell/footer.html` (then `node tools/shell.mjs`, 9 pages), Contact (list, no-JS draft link), Mentions (Contact line, « Une erreur » line), Confidentialité (:80, :126), `index.html` JSON-LD, `assets/js/config.js`, `assets/js/forms.js` fallback, `assets/js/_v2/chat.js` (:23, :97).
2. Mobile out everywhere (D2): footer partial line, Contact « Téléphone » line and the no-JS « ou appelez le … » clause (sentence reworded), Mentions « Contact » line (email only), JSON-LD `telephone`, `_v2/chat.js` « Par téléphone » clause. Kept: « Capital social », the host phone in Mentions § Hébergement, « Directeur de la publication — Aymard de Scorbiac », the footer sentence « Aymard de Scorbiac — consultant indépendant… », `og:image:alt` metas, Publications. Privacy `<main>` only: « Aymard de Scorbiac, seul destinataire des messages » → « Le propriétaire de Sourcinno SAS, seul destinataire des messages ».
3. `tools/check.mjs` coherence rule: reference = footer partial for email and LinkedIn only; phone family = any international number (≥ 8 digits) other than the host's in `mentions-legales/index.html` fails anywhere, the host's elsewhere fails, no host occurrence fails; the partials `tools/shell/*.html` are read too, so a phone put back in the footer partial is named there; P50 nit acted on (« widen the set or name the limit when the rule is next touched »): separators also `&#160;`, `.`, `-`, and a French national form `0X XX XX XX XX` is refused anywhere (no host is national). Comment says no phone other than the host's is allowed (D2). `--legal` unchanged (host phone required).
4. Rename (D3): `git mv service-strategie-transformation service-performance`; canonical/og:url; new stub `service-strategie-transformation/index.html` in the shape of `offre-strategie-organisation-processus/index.html`; that stub repointed straight to `/service-performance/`; links in header/footer partials (then stamp), home card « En savoir + », JSON-LD offer url, sitemap, `_v2/chat.js`; label « Performance » in menu, footer, meta descriptions (`index.html:7,13`, JSON-LD description :32, `contact/index.html:7,13`), stub sentence and Contact option (value and label). Not touched (Pass 67): home card title/text, h1, `hero--strategie`, `hero-strategie.webp`, the home experience line « Stratégie & Transformation (Marché, …) ». Page `<title>`/og:title stay « Stratégie > Transformation opérationnelle » (= h1). Then `node tools/version.mjs`.
5. Root docs before audit: PLAN token On-going; ARCHITECTURE (routes, coherence rule), PRD § 5 one line, CHANGELOG, PROGRESS. The seal covers the product repository only; root docs = second repository, listed in `scope` with their diff command.
Not a gate Pass (no money/auth/migration); the coherence rule is a pin: proven by mutation (Done When 3).

## EXPECTED TESTS

- AUTO-1 `git grep -n -E "aymard\.de\.scorbiac@|33608755877|08(&nbsp;| )75" -- . ':!.WIP'` from the product — expect: no output, exit 1.
- AUTO-2 `git grep -n service-strategie-transformation -- . ':!.WIP'` — expect: only lines of `service-strategie-transformation/index.html` (the stub).
- AUTO-3 `node tools/check.mjs --all` exit 0 (16 pages + 1 stub = 17, blog 13); `node tools/version.mjs --check` exit 0; `node tools/shell.mjs --check` exit 0, 9 pages, 8 redirections.
- AUTO-4 mutation ledger (each on a scratch edit, restored SHA-identical, suite back to 0): (a) `<li><a href="tel:+33608755877">+33 6 08 75 58 77</a></li>` back in `tools/shell/footer.html` → `check.mjs` exit 1 naming `tools/shell/footer.html`; (b) the mobile back in the Mentions « Contact » line → exit 1 naming `mentions-legales/index.html`; (c) the host `tel:` link removed from Mentions → `check.mjs --legal` exit 1 (« telephone de l hebergeur absent »); (d) national form `06 08 75 58 77` in a page → exit 1; restored → `check.mjs --all` 0.
- AUTO-5 headless Chrome (installed Chrome, `cdp.mjs`-style driver, `prefers-reduced-motion` set explicitly, server `--bind 127.0.0.1` on a free port) at 1200 and 375: every `main > section` height of `/service-performance/` (HEAD) equals `/service-strategie-transformation/` served from `git -c core.autocrlf=false archive 275d20f` — expect: same count, every height equal (±0.5 px).
- AUTO-6 headless: `/service-strategie-transformation/` and `/offre-strategie-organisation-processus/` → final `location.pathname` `/service-performance/` after one refresh each (stub `href` = `/service-performance/`).
- AUTO-7 headless: desktop menu one row at 861 and 961 px (equal vertical centres, increasing left edges, gap logo → first item > 0) on `/service-performance/`.
- AUTO-8 headless: valid Contact submission (nom, email, besoin = « Performance », message) → `data-last-mailto` starts `mailto:contact@sourcinno.com`; the option list reads « Performance ».
- AUTO-9 read as French: Contact no-JS sentence, Mentions « Contact » line, privacy :92, `_v2/chat.js` contact reply — rendered text quoted in the journal.
- AUTO-10 `config.js` holds no secret: diff = one address; file read whole.
Changed files and the command that reaches them: pages and partials — AUTO-1/2/3 (check.mjs reads every page, shell.mjs the partials); `check.mjs` — AUTO-4; `forms.js`/`config.js` — AUTO-3 `--forms` + AUTO-8; `_v2/chat.js` — parked V2 script, loaded by no page: AUTO-1/2 grep + AUTO-9 reading only (not executed: no page loads it); `sitemap.xml` — AUTO-3 `--seo`; stubs — AUTO-6. Root docs — the audit reads them; no AUTO command.
No MANUAL box: every check is agent-executable (prompt); the owner's look at wording comes with Pass 67.
Audit budget: 1 full contact expected, cap 2 (second only to confirm fixes). Estimated 200–330k tokens per contact (PROGRESS Open « Method »).

## CHANGED

Product commit 6d47ace on `rebuild` (local only), 18 files: `git diff --stat 275d20f 6d47ace`. Old page → new path: `git diff 275d20f:service-strategie-transformation/index.html 6d47ace:service-performance/index.html` (canonical, og:url, stamped header/footer, `?v=` only).
- `tools/shell/footer.html`, `tools/shell/header.html`: email, mobile line removed, « Performance » link; stamped into the 9 shell pages by `node tools/shell.mjs`.
- `contact/index.html`: « Téléphone » line removed; no-JS sentence ends « …depuis votre messagerie. »; option `Performance`; two metas.
- `mentions-legales/index.html`: Contact line = email only; « Signaler » email. Kept: Capital social, Directeur de la publication, host phone.
- `politique-confidentialite/index.html`: two emails; :92 « Le propriétaire de Sourcinno SAS, seul destinataire des messages. »
- `index.html`: JSON-LD email, `telephone` removed, description and offer url; two metas; card « En savoir + » link. Not touched: card title/text, experience line (Pass 67).
- `service-performance/index.html` (git mv + canonical/og:url); `service-strategie-transformation/index.html` new stub (byte copy of the repointed `offre-strategie-organisation-processus/index.html`); that stub repointed + « vers la page Performance. »
- `assets/js/config.js`, `assets/js/forms.js` (fallback), `assets/js/_v2/chat.js` (emails, phone clause, two links; its old labels « Stratégie, Organisation & Processus »/« IA for Business » left: parked V2 text, no page loads it).
- `sitemap.xml`; `?v=` restamped by `node tools/version.mjs` (42 references: +1 = the new stub's stylesheet).
- `tools/check.mjs`: coherence rule (SLICE 3). Found by mutation (a) on its first run: `allFiles` skips `tools/`, so the partials were not read; fixed by reading `tools/shell/*.html` as § 9 already does.
Root docs (second repository, not sealed; `git -C "C:\Users\aymar\AYS_CODING\code-SOURCINNO_WWW" diff`): PLAN token On-going; ARCHITECTURE routes + coherence rule; PRD § 5 pointer line; CHANGELOG entry; PROGRESS (P50 known issue narrowed, P38 mail test target, Next Action).
Evidence (product `.WIP/pass-loop-p66/evidence/`, ignored): `cdp.mjs` (byte copy of P65), `render.mjs` + `render.txt`, `capture.mjs` + `capture.txt` + three jpg; mutation script and log in the session scratchpad (`p66-mutations.sh`, `p66-mutations.log`), copied below.

## TEST-RESULTS r1
TREE: b74c66ea51dd45e1
CMD: `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `git grep -n -E "aymard\.de\.scorbiac@|33608755877|08(&nbsp;| )75" -- . ':!.WIP'` ; `git grep -n service-strategie-transformation -- . ':!.WIP'` ; `bash .WIP/pass-loop-p66/evidence/mutations.sh .WIP/pass-loop-p66/evidence/mutations.log` ; `P48_PROFILES=<scratch> node .WIP/pass-loop-p66/evidence/render.mjs` (OLD = 275d20f archive on 127.0.0.1:4177, NEW = tree on 127.0.0.1:4176, both `--bind 127.0.0.1`; netstat showed no listener on 4170–4179 first)
RESULT: PASS — check --all 0 (« OK — aucun probleme sur 17 page(s) », « blog.mjs check: CHECK OK: 13 article(s) »); version 0 (42 references); shell 0 (9 pages, 8 redirections); DW1 no output exit 1; DW2 no output exit 1 (the stub names only `/service-performance/`: zero lines, which meets « only lines of the stub »); mutations 6/6 red, each restored SHA-identical, suite back to 0; render 104 checks, failing 0.
NOTES: mutation ledger (`evidence/mutations.log`): (a) tel back in `tools/shell/footer.html` → exit 1, coherence names `tools/shell/footer.html` (+10 coquille lines); (b) tel back in Mentions Contact line → exit 1 naming `mentions-legales/index.html`; (c) host `tel:` link unwrapped in § Hébergement → `--legal` exit 1 « telephone de l hebergeur absent »; (d) `06 08 75 58 77` in Contact → exit 1; (e) JSON-LD `telephone` back → exit 1; (f) old email as footer reference → exit 1 on every copy. First run of (a), before the fix noted in CHANGED, named only the stale shell copies: the partial was not read.
Render (`evidence/render.txt`): `/service-performance/` 6 heights (header + 5 main blocks) = 275d20f `/service-strategie-transformation/` at 1200 and 375, scripts on and off; same on `/`, IA, Venture, Publications, 404; footer 363.5 = at 1200, 850.5 → 816.1 at 375 (one line fewer); text-changed pages reported: contact 375 section 1368.8 → 1304.9, scripts off 388 → 351.2 (1200) and 632.4 → 543.4 (375); mentions 1678.3 → 1651.1 (1200), 2274.5 → 2192.9 (375); privacy unchanged. Redirects: both old addresses request 2 documents (stub, `/service-performance/`) and land there; refresh, « Continuer » and canonical = `/service-performance/`. Menu one row: 861 centres 37.9–38, gap logo → « Expérience » 108.2 px; 961 gap 130.5 px. Contact: options « Performance », Entreprise IA, Venture Building, Autre; valid submission → `data-last-mailto` `mailto:contact@sourcinno.com?subject=…`, body names « Performance ». Read as French (rendered): « Le formulaire de cette page a besoin de JavaScript. S’il ne s’affiche pas : ouvrir un brouillon d’email, à compléter puis à envoyer depuis votre messagerie. »; Mentions « Contact — contact@sourcinno.com », Capital social and host phone present; privacy « Le propriétaire de Sourcinno SAS, seul destinataire des messages. » Captures looked at (Inter loaded): `evidence/perf-1200.jpg`, `contact-375.jpg`, `footer-375.jpg`. `config.js` read whole: one address changed, no secret. `_v2/chat.js` reply (not executed, no page loads it): « Par email : contact@sourcinno.com. Ou via le formulaire — réponse sous 48 heures ouvrées, puis un échange de trente minutes, sans engagement. »


## Audit contact 1 of 2 — fresh pass-auditor, 2026-10-28

Greenlight — every Done When 1-4 item re-measured on the committed tree 6d47ace, no Tier 1 or Tier 2 finding. Scope: CLEAN (all edits trace to PLAN § 66 Work 1-5 / § V1.3 D2-D3). Coverage (phase-gate): 18/18 changed product files read, skipped: none; root docs (second repository, unsealed) read through `git -C <root> diff`: PLAN status token only, ARCHITECTURE, PRD, CHANGELOG, PROGRESS.

Re-measured by the auditor (scratch exports `git -c core.autocrlf=false archive`, working tree untouched):
- Done When 1: email/mobile grep exit 1, no output; wider grep (national forms, U+00A0, other emails outside vendor) nothing but `test@example.com` in check.mjs's own form test.
- Done When 2: old-route grep exit 1, no output; `shell.mjs --check` 9 pages, 8 redirections; `version.mjs --check` 42 references on 17 pages.
- Done When 3: `check.mjs --all` exit 0 (17 pages, blog 13 articles, two executed tests PASS). Mutations on scratch copies: mobile in footer partial, stamped → exit 1, phone named on every page; unstamped → exit 1, named on `tools/shell/footer.html`; mobile in Mentions → exit 1 naming it; host phone line removed → `--legal` exit 1 (« aucun telephone de l hebergeur », « absent de la section Hebergement »); extra: national forms `06&nbsp;08…`, U+00A0, `06.08…`, `tel:0608755877`, `+33` U+00A0 in Contact → exit 1, each named. Unmutated scratch: plain and `--legal` exit 0.
- Done When 4 (own CDP probe, headless Chrome, reduced motion `no-preference`, servers `--bind 127.0.0.1` on 4181/4182 after netstat): `/service-performance/` vs 275d20f `/service-strategie-transformation/` — 1200 px: all 7 blocks equal, total 4218 = 4218; 375 px: every `main` section equal, only the footer 850.5 → 816.1 px (the removed phone line, expected), Inter loaded both sides. Both old addresses land on `/service-performance/` at both widths. Menu one row at 861 (centres 37.9-38.0, lefts increasing, logo gap 108.2 / home 107.2) and 961 (gap 130.5 / home 129.5). Contact submission recorded `mailto:contact@sourcinno.com?…Type de besoin : Performance…`; options `Performance`, `Entreprise IA`, `Venture Building`, `Autre`.
- JSON-LD of `index.html` parses; `config.js` holds no secret; `rebuild` not on origin (ahead 55), `main` = origin/main fd37e87, `.github` untouched; new files LF.

Tier 3 (advisory, non-blocking, for the closure notes):
- PRD § 2 (line 29, header menu) and the § 5.1 table (line 148) still name `/service-strategie-transformation` and « Stratégie & Transformation »; the new PRD pointer claims precedence over § 5 only, so § 2 relies on the project precedence rule (PLAN > PRD). A future PRD tidy could extend the pointer to § 2.
- `assets/js/_v2/chat.js` (parked) still labels the service « Stratégie, Organisation & Processus », and the coherence rule does not read `_v2/`: a phone reintroduced there is caught only by the Done When 1 grep, not by `check.mjs`.
- `/service-performance/` keeps `<title>`/`og:title` « Stratégie > Transformation opérationnelle », consistent with D3 (h1 kept); Pass 67/68 wording may revisit it.

```json
{
  "token": "3c9aeed1",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "git grep -n -E \"aymard\\.de\\.scorbiac@|33608755877|08(&nbsp;| )75\" -- . ':!.WIP'  (exit 1, no output)", "result": "PASS"},
    {"cmd": "git grep -n service-strategie-transformation -- . ':!.WIP'  (exit 1, no output)", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check  (exit 0, 9 pages, 8 redirections)", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check  (exit 0, 42 references, 17 pages)", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all  (exit 0, 17 pages, blog 13 articles)", "result": "PASS"},
    {"cmd": "scratch mutation: mobile back in tools/shell/footer.html then node tools/shell.mjs; node tools/check.mjs  (exit 1, phone named)", "result": "PASS"},
    {"cmd": "scratch mutation: mobile in mentions-legales/index.html; node tools/check.mjs  (exit 1, phone named)", "result": "PASS"},
    {"cmd": "scratch mutation: host phone line removed; node tools/check.mjs --legal  (exit 1)", "result": "PASS"},
    {"cmd": "scratch mutation: national, nbsp, U+00A0, dot and tel: forms in contact/index.html; node tools/check.mjs  (exit 1, each named)", "result": "PASS"},
    {"cmd": "node probe.mjs http://127.0.0.1:4181 http://127.0.0.1:4182  (section heights 1200/375, redirects, menu 861/961, contact mailto)", "result": "PASS"},
    {"cmd": "git show 6d47ace:index.html | JSON.parse of each application/ld+json block", "result": "PASS"},
    {"cmd": "git merge-base --is-ancestor 6d47ace origin/rebuild  (false: not pushed)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 152,990 tokens, 401 s (400,802 ms), GREEN
INVOCATION: one Agent call, agent pass-auditor, fresh context (id in the session's task notice) · USAGE BASIS: whole-contact (task notification `subagent_tokens`; incremental or cumulative not stated)

## CLOSURE
UNIT: 66
DOCS: root PLAN § 66 token On-going → Done + evidence pointer (journal commit); ARCHITECTURE routes + coherence rule; PRD § 5 pointer line « Refonte 2026-10-28 »; CHANGELOG 2026-10-28 entry; PROGRESS Done line, Last Verification (Pass 66), Known minor issues (P66, P50 narrowed), Open « Mail test » target, Current Objective, Next Action.
MIGRATED: final evidence (commands, exit codes, mutation ledger, render measures), verdict and cost into root PROGRESS Last Verification (Pass 66); durable evidence files stay in this state dir's journal commit (`evidence/`).
NITS: the auditor's three Tier-3 notes (PRD § 2/§ 5.1 old route; `_v2/chat.js` label and not read by the rule; page title kept) → root PROGRESS Known minor issues « P66 ».
COMMIT: 6d47ace
