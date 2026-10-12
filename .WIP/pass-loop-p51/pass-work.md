# Pass p51 — Contact et Venture Building — textes et ordre des sections

Contract: root PLAN.md § 51 (§ V1.2 R3 + R4; PRD § Refonte 2026-10-11 rows Contact, Venture Building; owner brief `prompts/rework-brief-20261011.md` items 3–4). Coder prompt root `prompts/pass51-coder.md`, root inputs commit 5860ed7. Product base a35c404 (rebuild). LOCAL ONLY.

MODELS: work = claude-opus-5-5 (session system prompt, declared); effort unknown (not exposed). Reviewer: launch controls expose a model alias but no effort label for this session; reviewer inherits the session model, effort unknown (PROGRESS Model restriction exception). Runtime-verified: nothing.

SERVER: port 4173 was free at pre-flight (the PID 87856 server the Planner saw had gone; `netstat -ano` showed no :4173/:4174 line). Served from root `.claude/launch.json` « sourcinno » (`python -m http.server 4173 --directory "current sourcinno site- code"`) = this product tree.

## SLICE

Size: one turn (~30 min): two page edits (delete/rename on Contact, move three whole blocks + rewrite one block as text on Venture), three dead CSS rules, `version.mjs`, one headless render script reusing the P50 cdp helper. No split.

Kept texts — exact strings of a35c404 that must survive (Done When 2 greps each with `grep -c -F`):
- Venture lead: `Identifier des opportunités réalistes et pertinentes &rarr; les expérimenter en mode startup.`
- Phase names + percent lines: `<h3>Stratégie</h3>` + `10% d'inspiration`; `<h3>Création</h3>` + `90% de transpiration`.
- Row titles: `Explorer les opportunités`, `Valider avec les utilisateurs`, `Construire le business plan`, `Organiser la création`.
- Question sentences:
  - `💡 Quoi : produit ou service autour de notre cœur de métier (complémenteur, amont-aval, substitut) ? Quels actifs opérationnels peuvent être mutualisés à faible coût (compétences, base installée, outils) ?`
  - `☑️ Qui : prototype jetable ou validation auprès d'utilisateurs bêta ?`
  - `🚀 Où : business plan ?`
  - `🛠️ Comment : plan de mise en œuvre, équipes, fournisseurs et outils ?`
- Figure captions: `Vidéo « CorpAngels : TechnoService SaaS pour création de StartUps »` (7qO3G7tCHr8), `Vidéo « corpangels Corporates — July23 »` (QtzlMHaUGyM).
- Launcher labels: `Lire la vidéo « CorpAngels : TechnoService SaaS pour création de StartUps »`, `Lire la vidéo « corpangels Corporates — July23 »`.
- Contact keeps: the four contact lines, the quote, the JS-off fallback paragraph (`data-form-fallback`), every form field, the empty `.form-status` after the button; `assets/js/forms.js` byte-identical.

Design (existing classes only):
- Contact: left h2 « Coordonnées »; right column = fallback paragraph + form, no head; hint paragraph and « Trois étapes » section deleted; button « Envoyer ».
- Venture order: hero (new subtitle) → `#kodak` (white, unchanged) → `#david-goliath` `section section--alt reveal` (grey; h2 « David + Goliath », no subtitle element, QtzlMHaUGyM figure moved whole) → `#experience` (white, `service-refinement`, unchanged block moved) → `#besoin` `section section--alt reveal` (grey) → CTA band (white).
- `#besoin` structured text: section head h2, `p.lead`, `div.grid.grid--2` with two plain `div`s (no card); each = `.service-phase__head` (kept byte-identical incl. its `.step__n` badge) + `ol.service-question-list` whose `li` holds one `p`: `strong` (`.service-question__number` + row title), `br`, question sentence (the `strong` + `br` idiom of the removed Pilotage block). 7qO3G7tCHr8 figure moved whole after the grid.
- Measured consequences of « existing classes only » (reported, not self-corrected): (1) `.service-refinement { background: white }` (style.css :962) out-ranks `.section--alt` (:119), so the grey `#besoin` cannot keep `service-refinement`; without it the existing `#besoin .lead` rule (:815, large bold navy) styles the lead instead of the small grey box. (2) `.grid--2` stacks at ≤ 640 px (:498), not 960: two columns from 641 px. A 960 breakpoint or the old lead look needs a new rule; none added. Owner sees both at MANUAL-1.
- CSS: `.step` out of the grouped surface selector (:324, group kept), `.steps` and `.step` rules (:374–375) and `.service-pilotage` (:973) deleted; every other rule kept unless the census says otherwise. Then `node tools/version.mjs`.

Gates: none internal (no money/auth/migration). Live checks: none (127.0.0.1 server + Google Fonts only; resolver maps every other host to NOTFOUND; no LIVE-SAFE clause applies).
MANUAL: one item (owner look). Why no machine can prove it: the owner brief is a look/wording judgment (order, weight of the new lead, text-as-structure); renders prove visibility/overflow, not taste.

Round 2 — owner revision 2026-10-12 (answer to the first look; session 71c5081b, resumed from manual-test, GREEN r1 now stale):
ACCEPTANCE: OWNER-EYES-FIRST
Why eyes-first is honest here: wording and spacing only (a synthesis text, a form density, a link look), low-risk and reversible, no money/auth/data path; one review contact is left, so the owner's look comes before it.
Owner words (verbatim): « CONTACT page > colonne de droite : réduire l'espacement entre les blocs. CONTACT page > colonne de gauche : lien sur le linkedin; retirer le blabla ("décrivez la situation..;"). VENTURE BUILDING page > supprimer "Identifier des opportunités ..."; remplacer "Votre besoin..." par "Réflexion" ; remplacer les deux colonnes de texte par une synthèse concrète, structurée, des intérêts et challenge du Venture Building sur la base des articles du site » + three blog URLs (corporate-venture-building-origin-1, -2-quand-le-terrain-est-il-fertile, -longer-to-startup-quicker-to-scaleup-1).
These words supersede PLAN § 51 Planner decisions (4d reading, kept texts), Work 2 and Done When 2 for the last Venture section, and the « quote kept » line above; root PRD § Refonte 2026-10-11 rows and PLAN § 51 carry the revision (root repository, outside this seal).
Design r2 (existing classes, one new modifier):
- Contact form density: the gap was `.field` margin 1rem + the empty `.error` paragraph (global `p` margin 1rem + reserved `min-height: 1.1em`) + flex gap ≈ 52 px. `.field .error` now `margin: 0`, no reserved height: an empty error line takes no room, the seven error paragraphs stay rendered (aria-live, `aria-describedby` of P48 untouched). Portfolio has `.field` but no `.error`: unchanged by construction.
- Contact list: the LinkedIn line was already an `<a>` (as were email and phone) but `a { color: inherit; text-decoration: none }` made all three look like plain text. Reading of « lien sur le linkedin » (assumed, reported to the owner): make it look like a link; the three links of that list take the caption-link look (`--teal-dark`, underlined) through one modifier `.ticks--contact` so the Mentions/policy/service `.ticks` lists and the footer do not move. Quote paragraph and its only rule `.quote` removed.
- Venture: last section id `reflexion` (no `#besoin` rule reaches it; no page links a Venture anchor), h2 « Réflexion », lead removed, `div.grid.grid--2` of two plain `div`s: `h3` « Intérêts » / « Challenges » + `ul.ticks` of five `li` each (`strong` title, em dash, one sentence: the Contact list idiom). 7qO3G7tCHr8 figure kept whole after the grid. The phase/question classes stay used by the two other service pages (census).
- Synthesis sources, each point checked against the downloaded article text (session scratchpad `articles/a1–a3.txt`): [1] « ni trop près, ni trop loin », relais de croissance / contre-attaquer, sortie (BU, entité propre, propres ailes); [2] actifs dormants (données, R&D, supply chain, canaux, partenaires), culture d'innovation, Talents, critère impératif = alignement du Comité Exécutif, pérennité de court terme, faible impact des actifs, 1 M€ par startup; [3] David/Goliath, exemple banque → microERP → affacturage, « Culture eats digital » + oppositions, Comprendre/Accepter/Pouvoir, « perdre quelques semaines… gagner des mois ». No figure or claim outside the three articles.

## EXPECTED TESTS

- AUTO-1 Done When 1: `grep -c "Trois étapes\|deux minutes\|Me joindre directement\|Ce formulaire prépare\|Préparer mon email" contact/index.html` = 0; `grep -c "<h2>Coordonnées</h2>" contact/index.html` = 1; `grep -c ">Envoyer</button>" contact/index.html` = 1; `git diff --quiet a35c404 -- assets/js/forms.js` exit 0.
- AUTO-2 Done When 2: `grep -o "<h2>[^<]*</h2>" service-venture-building/index.html` = Kodak aurait pu créer Instagram / David + Goliath / Expériences associées / Votre besoin &gt; Livrables / Pages / Contact; `grep -c 'Réflexion\|Pilotage\|class="disclosure\|Capitaliser sur vos actifs'` = 0; new subtitle `grep -c -F` = 1; QtzlMHaUGyM inside `#david-goliath`, 7qO3G7tCHr8 inside `#besoin` (section-scoped awk); each kept text above `grep -c -F` = 1 (captions and labels 1 each).
- AUTO-3 Done When 3: `node .WIP/pass-loop-p51/evidence/render.mjs` (P50 cdp helper copied; resolver NOTFOUND except 127.0.0.1 + Google Fonts) — both pages × 1200/375 × JS on/off: every `main > section` scrolled in has a box inside the viewport, opacity 1 and is topmost at its centre; elements whose right edge > emulated width = 0 (all `body *` with a box); JS on: each `.video-launch img` complete with naturalWidth > 0 and a box; JS off: launchers display none and caption links shown; Contact JS off: fallback paragraph shown and form hidden; Contact JS on: valid form in a sandboxed frame (`allow-scripts allow-same-origin allow-forms`), click « Envoyer » → status line holds « vous devez encore l’envoyer », frame URL unchanged (mailto blocked); outside requests 0. Full-page captures + post-click capture under `evidence/`.
- AUTO-4 Done When 4: `node tools/check.mjs --all`, `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check a35c404` exit 0; `git diff --stat a35c404 -- . ':(exclude).WIP'` = contact/index.html, service-venture-building/index.html, assets/css/style.css + `?v=` stamp lines only (`git diff a35c404 -U0` on other files shows only `?v=` lines).
- [x] MANUAL-1 Owner look: the 1200 and 375 px captures of /contact/ and /service-venture-building/ sent as images — expect « ok » — confirmed by the owner on 2026-10-12 (« ok », round-2 captures of product 84780e0)
- AUTO-5 (round 2, replaces the Venture half of AUTO-2): `sh .WIP/pass-loop-p51/evidence/greps-r2.sh` — expect: last line `R2 ok` (Contact Done When 1 unchanged, quote and its rule gone, hooked list holds the LinkedIn link, link and error rules present, seven error lines kept; Venture h2 order Kodak / David + Goliath / Expériences associées / Réflexion / Pages / Contact, removed texts 0, both videos in their sections, two h3 + ten points in `#reflexion`, captions and labels once each).
- AUTO-6 (round 2): `node .WIP/pass-loop-p51/evidence/spacing.mjs` — expect: rendered gap between a field's control and the next label ≤ 28 px at 1200 and 375 (was ≈ 52), the three contact-list links computed `underline`, footer links `none`, no `blockquote`.
- AUTO-3 and AUTO-4 re-run unchanged on the round-2 tree (render.mjs is selector-free for the renamed section).

Changed files and reach: `contact/index.html` — AUTO-1, AUTO-3, AUTO-4 (structure, forms, a11y, nojs, seo). `service-venture-building/index.html` — AUTO-2, AUTO-3, AUTO-4 (incl. P50 video coherence rule). `assets/css/style.css` — AUTO-3 (rendered), AUTO-4 (census both ways, version). Pages carrying only a new `?v=` stamp — AUTO-4 (`version.mjs --check`); their rendering is unchanged except through the three deleted rules, which had no other user (class map above, census). No unreached file.

Audit budget: 2 contacts (one fresh review; same reviewer confirms only if FIX). Expect ~150–240k tokens per contact (P48–P50 receipts).

## CHANGED
- `contact/index.html`: h2 « Coordonnées »; right-column head and hint paragraph removed; button « Envoyer »; « Trois étapes » section removed. Fallback paragraph, quote, fields, empty status kept.
- `service-venture-building/index.html`: new hero subtitle; `#david-goliath` (grey) with the QtzlMHaUGyM figure moved whole; `#experience` block unchanged, now third; `#besoin` (grey, last before the CTA band) as structured text + the 7qO3G7tCHr8 figure moved whole; Pilotage paragraph and `#reflexion` removed. Both figure blocks sha256-identical to a35c404 (awk extract, 0ab4f9eb… / b20d7dbb…).
- `assets/css/style.css`: `.step` out of the grouped surface selector; `.steps`, `.step`, `.service-pilotage` rules deleted.
- 14 other pages: stylesheet `?v=` stamp line only (`node tools/version.mjs`: 43 refs, 16 pages rewritten; JS stamps unchanged).
- Root docs repository (not in this seal): PLAN.md § 51 status token Done + evidence pointer.
- Evidence (ignored, not sealed; committed durable after done): `.WIP/pass-loop-p51/evidence/` greps.sh, cdp.mjs (P50 copy, sha256 97b58ca6… identical), render.mjs + render.txt, 8 full-page captures `{contact,service-venture-building}-{1200,375}-{js,nojs}.png`, `contact-{1200,375}-submit.png`.

## TEST-RESULTS r1
TREE: a694857849f46cbe
CMD: `node tools/check.mjs --all` exit 0 (16 pages, both executed tests PASS, census 130/151 classes, 0 without rule, 0 without usage); `node tools/version.mjs --check` 0 (43); `node tools/shell.mjs --check` 0 (10 + 6 redirects); `git diff --check a35c404` 0; `sh .WIP/pass-loop-p51/evidence/greps.sh` DW12 ok; `node .WIP/pass-loop-p51/evidence/render.mjs` exit 0
RESULT: PASS — Done When 1–4 met on product bf29256.
NOTES: DW1–2 (greps.sh, 38 lines all ok): removed texts 0/0, « Coordonnées » 1, « Envoyer » 1, forms.js diff quiet; h2 order Kodak | David + Goliath | Expériences associées | Votre besoin &gt; Livrables | Pages | Contact; QtzlMHaUGyM 2 lines in #david-goliath, 7qO3G7tCHr8 2 in #besoin; 17 kept texts 1 each; no details/card in #besoin. Script proven red on an a35c404 export (10 FAIL lines).
 DW3 (render.txt, resolver NOTFOUND except 127.0.0.1 + Google Fonts, P48_PROFILES = session scratchpad): 8 runs, every section in view/opacity 1/topmost, elements past width 0 at 1200 and 375, JS on launchers 2/2 thumbnail 480 px + caption, JS off launchers display none + caption shown, Contact JS off fallback first in its column + form hidden; submit 1200/375 « Envoyer » → « …vous devez encore l’envoyer… », role status, frame URL unchanged, 0 invalid; outside requests 0, blocked mailto attempts 2 (Network logs the blocked navigation; counted apart). Section backgrounds: kodak transparent (white), david-goliath rgb(245,248,252), experience white, besoin rgb(245,248,252), CTA transparent.
 DW4: `git diff --stat a35c404 -- . ':(exclude).WIP'` 17 files = the 3 + 14 pages whose only changed line is the stylesheet `?v=26c01f27` stamp (non-stamp lines outside the 3 = 0).
 Server: launch.json « sourcinno » on :4173 (free at pre-flight).

## Review contact 1 of 2 — fresh auditor verdict (P51)

GREEN. Done When 1-4 re-derived independently on bf29256 (clean export + tree); both reported deviations judged non-blocking. Scope CLEAN: CSS deletions (.steps, .step, .service-pilotage) and the 14 ?v= stamp lines are necessary side work; no unrequested change. Reviewer scratch: C:\Users\aymar\AppData\Local\Temp\claude\...\scratchpad\reviewer-p51.

Tier 3 (advisory, no fix section):
- #besoin without .service-refinement: the lead renders as the large bold navy statement (30 px desktop, 22.4 px mobile) where the two sister service pages show a grey band; owner to confirm by eye.
- .grid--2 keeps two columns from 641 px (285 px each at 641, readable, no overflow) instead of the Planner's 960 px; presentation only.
- The Contact form now has no heading or accessible name; an aria-label on the form would help screen-reader navigation (optional).
- About 150 px of empty grey below each video caption (#david-goliath, #besoin): existing .band-figure bottom margin plus section padding, same as the old #reflexion.
- Root PLAN.md § 51 already says Done and points at "PROGRESS.md Last Verification (Pass 51)", which does not exist yet: write it at closure (outside this seal).

```json
{
  "token": "8a70794b",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {
      "cmd": "grep -c \"Trois étapes\\|deux minutes\\|Me joindre directement\\|Ce formulaire prépare\\|Préparer mon email\" contact/index.html  (= 0)",
      "result": "PASS"
    },
    {
      "cmd": "grep -c \"<h2>Coordonnées</h2>\" contact/index.html ; grep -c \">Envoyer</button>\" contact/index.html  (= 1, 1)",
      "result": "PASS"
    },
    {
      "cmd": "git diff --quiet a35c404 -- assets/js/forms.js  (exit 0)",
      "result": "PASS"
    },
    {
      "cmd": "grep -o \"<h2>[^<]*</h2>\" service-venture-building/index.html  (Kodak, David + Goliath, Expériences associées, Votre besoin &gt; Livrables, Pages, Contact)",
      "result": "PASS"
    },
    {
      "cmd": "grep -c 'Réflexion\\|Pilotage\\|class=\"disclosure\\|Capitaliser sur vos actifs' service-venture-building/index.html (= 0) ; grep -c -F \"Les entreprises établies ont des actifs dormants pour créer des startups titans\" (= 1)",
      "result": "PASS"
    },
    {
      "cmd": "node scratchpad/reviewer-p51/dw2.mjs venture-base.html(a35c404) service-venture-building/index.html  (QtzlMHaUGyM only in #david-goliath, 7qO3G7tCHr8 only in #besoin, 4 titles + 4 questions once each in #besoin, id order kodak<david-goliath<experience<besoin<CTA)",
      "result": "PASS"
    },
    {
      "cmd": "git -c core.autocrlf=false archive bf29256 | tar -x (scratch export) && node tools/check.mjs --all  (exit 0, OK 16 pages; same in tree)",
      "result": "PASS"
    },
    {
      "cmd": "node tools/version.mjs --check ; node tools/shell.mjs --check  (export and tree, exit 0)",
      "result": "PASS"
    },
    {
      "cmd": "git diff --check a35c404 ; git diff --check a35c404 bf29256  (exit 0)",
      "result": "PASS"
    },
    {
      "cmd": "git diff --stat a35c404 -- . ':(exclude).WIP'  (17 files = contact, venture, style.css + 14 pages whose only diff is the style.css ?v= line; no .WIP file in bf29256)",
      "result": "PASS"
    },
    {
      "cmd": "node scratchpad/reviewer-p51/render.mjs  (headless Chrome, export on 127.0.0.1:4191, resolver NOTFOUND except 127.0.0.1/Google Fonts; /contact/ and /service-venture-building/ at 1200/800/375/320, JS on and off: every main section visible on screen, no element right edge past the emulated width, thumbnails loaded JS on, caption links JS off, empty submit via Envoyer shows the error status, 0 outside requests; 156 PASS 0 FAIL)",
      "result": "PASS"
    },
    {
      "cmd": "RV_WIDTHS=641,961 node scratchpad/reviewer-p51/render.mjs  (breakpoint edges, 78 PASS 0 FAIL)",
      "result": "PASS"
    }
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 170,845 tokens, 10 min 51 s, GREEN. INVOCATION: a2f6066fd0918beaa (pass-auditor subagent, inherited settings). USAGE BASIS: whole-contact (Agent completion notice: subagent_tokens 170845, tool_uses 54, duration_ms 651200).

## MANUAL TEST GUIDE
Setup: none — the owner looks at the captures sent in chat (renders of this tree, bf29256, 127.0.0.1:4173).
MANUAL-1 — Do: look at the 1200 px and 375 px pictures of Contact and Venture Building. Expect: Contact = « Coordonnées » beside the form, button « Envoyer », no « Trois étapes »; Venture = new subtitle, Kodak → David + Goliath → Expériences associées → Votre besoin > Livrables as plain text with the second video. Reply « ok » or what to change.

## MANUAL-1 RESULT r1 (owner, 2026-10-12)
Not accepted: three change requests (verbatim in `## SLICE` Round 2). Not a defect of the reviewed code: an owner revision of the brief. Route: revise (re-enter at the tests, no fix round counted); the r1 GREEN carries nothing; the box stays open and is re-issued on the new captures. Round-1 captures and render.txt kept under `evidence/r1/`.

## CHANGED
Round 2 (on top of bf29256):
- `contact/index.html`: list class `ticks ticks--contact`; quote paragraph removed.
- `service-venture-building/index.html`: last section `#besoin` → `#reflexion`, h2 « Réflexion », lead and the two phase columns replaced by « Intérêts » / « Challenges » (five points each); 7qO3G7tCHr8 figure untouched.
- `assets/css/style.css`: `.field .error` margin 0 and no reserved height; new `.ticks--contact a`; `.quote` rule and its comment removed.
- 14 other pages: stylesheet `?v=` stamp line only (`node tools/version.mjs`: 43 refs, 16 pages).
- Evidence (ignored, not sealed): `evidence/greps-r2.sh`, `spacing.mjs`, fresh `render.txt` + 10 captures; r1 set moved to `evidence/r1/`.
- Root docs repository (not in this seal): PRD § Refonte 2026-10-11 rows Contact and Venture Building, PLAN § 51 owner-revision line, PROGRESS Next Action.

## TEST-RESULTS r2
TREE: 59d39e60e6a46b92
CMD: `node tools/check.mjs --all` exit 0 (16 pages, both executed tests PASS, census 0 without rule, 0 without usage); `node tools/version.mjs --check` 0; `node tools/shell.mjs --check` 0; `git diff --check a35c404` 0; `sh .WIP/pass-loop-p51/evidence/greps-r2.sh` R2 ok; `node .WIP/pass-loop-p51/evidence/render.mjs` exit 0; `node .WIP/pass-loop-p51/evidence/spacing.mjs` exit 0
RESULT: PASS — round-2 AUTO-3/4/5/6 met on the working tree (fingerprint identical before and after the native suite and greps; render and spacing ran on the same tree, after the last edit and the re-stamp).
NOTES: render (resolver NOTFOUND except 127.0.0.1 + Google Fonts, server = launch.json « sourcinno » restarted on :4173, the earlier one had gone): 8 runs, failing 0, elements past width 0 at 1200 and 375, submit 1200/375 « …vous devez encore l’envoyer… » frame URL unchanged, outside requests 0, blocked mailto attempts 2. Contact page 1200 px JS on: 2026 → 1813 px high.
 spacing: gaps 21.6 px ×5 and 27.2 px (before the checkbox) at 1200 and 375; three list links rgb(36,122,120) underline; footer links none; blockquote 0.
 `git diff --stat a35c404 -- . ':(exclude).WIP'` 17 files, non-stamp lines outside the three files 0.
 Not measured: the « before » gap is derived from the rules (16 + 16 + 14.4 + 5.6 px), not rendered.

## MANUAL TEST GUIDE
Setup: none — the owner looks at the four captures sent in chat (renders of the round-2 tree, 127.0.0.1:4173).
MANUAL-1 — Do: look at the 1200 px and 375 px pictures of Contact and Venture Building. Expect: Contact = tighter form, email/phone/LinkedIn underlined as links, no quote; Venture = last section « Réflexion » with « Intérêts » and « Challenges » (five points each) and the second video, no « Identifier des opportunités… ». Reply « ok » or what to change.

## TEST-RESULTS r3
TREE: 59d39e60e6a46b92
CMD: `node tools/check.mjs --all` exit 0; `node tools/version.mjs --check` 0; `node tools/shell.mjs --check` 0; `git diff --check a35c404` 0; `sh .WIP/pass-loop-p51/evidence/greps-r2.sh` R2 ok; `node .WIP/pass-loop-p51/evidence/render.mjs`; `node .WIP/pass-loop-p51/evidence/spacing.mjs`
RESULT: PASS — same commands as r2, re-run after the revise was recorded (the loop accepts only a block written after it); tree unchanged since r2 (same fingerprint).
NOTES: RENDER http://127.0.0.1:4173: runs 8, failing runs/submits 0, outside requests 0, blocked mailto attempts 2 (want 2: one per submit)
 spacing "gaps":[21.6,21.6,21.6,21.6,21.6,27.2] "gaps":[21.6,21.6,21.6,21.6,21.6,27.2]

## Review contact 2 of 2 — invocation 1 lost before any verdict
INVOCATION: pass-auditor subagent launched 2026-10-12 with brief.txt by file path; terminated by the API (HTTP 429, account session limit reached) before appending anything. No verdict, no fix section; tree fingerprint still 59d39e60e6a46b92; token unused. USAGE BASIS: unknown (no completion notice). Same brief and token handed to a fresh pass-auditor after the limit reset (owner « Réessayer »): no new contact reserved.

## Review contact 2 of 2 — fresh auditor verdict (P51, full slice at 84780e0)

GREEN. No Tier 1 or Tier 2 finding. Every claim re-derived with the reviewer's own scripts (scratch: scratchpad/reviewer-p51-r2/run2; exports of a35c404 and 84780e0 served by a throwaway in-process server, stopped; no process left; product and root trees untouched, git status clean before and after).
NATIVE CHECKS: `node tools/check.mjs --all` PASS (tree + export) — `node tools/version.mjs --check` PASS — `node tools/shell.mjs --check` PASS — `git diff --check a35c404` PASS.
SCOPE: CLEAN — the deleted rules (.steps, .step, .service-pilotage, .quote) and the 14 stamp lines are necessary side work (census, version stamps); underlining email and phone as well as LinkedIn goes one step past « lien sur le linkedin », was reported to the owner and accepted on the captures.
COVERAGE: 17/17 changed files read (contact and Venture pages in full; style.css by its whole diff plus the surrounding rules; the 14 other pages by their single changed line) — skipped: none.

Tier 3 (advisory, no fix section, no further review needed):
- service-venture-building/index.html :7 and :13: the meta description and og:description still say « identifier des opportunités autour du cœur de métier, les expérimenter en mode startup et piloter la création », text the owner removed from the visible page (lead, Pilotage). Not shown on the page; shown in search results and link previews.
- Contact at 320 px: the LinkedIn address stays on one line and runs 18.8 px past its column into the page margin (right edge 314.8 of 320: fully visible, not past the screen). Same geometry at a35c404; more noticeable now that it is underlined. Extending the existing `.ticks a[href^="mailto:"] { overflow-wrap: anywhere }` to that list's links would end it.
- An error line no longer has reserved room: when one appears on blur, everything below moves down 22.3 px (7.9 px at a35c404). Measured with an invalid email still focused: a click in the top 8 px of « Envoyer » (the upper ~22 px of its 55 px are exposed) only shows that field's message, the submit handler does not run (no status line); a centre click works. The form is invalid in that state anyway, so the visitor sees the same message; the consent checkbox behaves the same way. Usual web-form behaviour, cost of the density the owner asked for.
- Synthesis wording: « souvent sous-exploités » — article [2] lists « actifs dormants sous-exploités » as a favourable-context criterion; « souvent » is the synthesis's own word (no figure involved, wording accepted by the owner).
- The Contact form still has no heading or accessible name (the owner removed its title): an `aria-label` on the form would help screen-reader navigation (optional; raised at contact 1).
- Root docs (outside this seal): PLAN.md § 51 says Status Done and points at « PROGRESS.md Last Verification (Pass 51) », which does not exist yet; PROGRESS.md Next Action still says the Pass waits for the owner's second look (given: « ok »); the § 51 Goal line still names « Votre besoin > Livrables » (superseded by the revision line under it). All three to settle at closure.

```json
{
  "token": "477d3224",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {
      "cmd": "node tools/check.mjs --all  (working tree = 84780e0, git status clean; and on a scratch export: git -c core.autocrlf=false archive 84780e0 | tar -x)  exit 0 twice: 16 pages, census 0 class without rule / 0 without usage, --forms --a11y --nojs --tiers --seo --legal, both executed tests PASS",
      "result": "PASS"
    },
    {
      "cmd": "node tools/version.mjs --check ; node tools/shell.mjs --check ; git diff --check a35c404  (exit 0, 0, 0: 43 references on 16 pages, shell on 10 pages + 6 redirects); curl -s http://127.0.0.1:4173/assets/css/style.css | sha256sum = 3da3c909… = tree file = the ?v= stamp",
      "result": "PASS"
    },
    {
      "cmd": "git diff --stat a35c404 -- . ':(exclude).WIP'  (17 files: contact/index.html, service-venture-building/index.html, assets/css/style.css + 14 pages); git diff -U0 a35c404 on those 14: 28 changed lines, all the style.css?v=d5e77fbb -> 3da3c909 line, 0 other; git diff --stat a35c404 84780e0 -- .WIP empty; git diff --quiet a35c404 -- assets/js/forms.js exit 0 (blob 204758fb both sides)",
      "result": "PASS"
    },
    {
      "cmd": "grep -c \"Trois étapes\\|deux minutes\\|Me joindre directement\\|Ce formulaire prépare\\|Préparer mon email\" contact/index.html (0); grep -c \"<h2>Coordonnées</h2>\" (1); grep -c \">Envoyer</button>\" (1); grep -c -i \"blockquote\\|Décrivez la situation\" contact/index.html (0); grep -c \"\\.quote\" assets/css/style.css (0)",
      "result": "PASS"
    },
    {
      "cmd": "grep -o \"<h2>[^<]*</h2>\" service-venture-building/index.html (Kodak aurait pu créer Instagram | David + Goliath | Expériences associées | Réflexion | Pages | Contact); removed texts grep -c 'Votre besoin\\|Identifier des opportunités\\|Pilotage\\|class=\"disclosure\\|Capitaliser sur vos actifs\\|inspiration\\|transpiration\\|service-question\\|service-phase\\|id=\"besoin\"\\|class=\"lead\"' (0); new subtitle grep -c -F (1); section ids kodak>david-goliath>experience>reflexion; #reflexion h3 Intérêts|Challenges + 10 li; two captions and two launcher labels once each; sh .WIP/pass-loop-p51/evidence/greps-r2.sh (R2 ok, exit 0)",
      "result": "PASS"
    },
    {
      "cmd": "risk (a): curl -sS -L <the three blog URLs of the brief> (HTTP 200 x3) + node scratchpad/reviewer-p51-r2/run2/scripts/extract.mjs -> each of the ten points matched to article lines: [1] relais de croissance / contre-attaquer, « ni trop près, ni trop loin », Engine #2, sortie BU / entité propre / propres ailes; [2] actifs dormants sous-exploités (données, R&D, supply chain, canaux, partenaires), culture d'innovation, Talents, critère impératif = alignement du Comité Exécutif (déploiement commercial), pérennité de court terme, peu d'impact des actifs, 1 M€ par startup; [3] David (agilité) + Goliath (actifs), banque -> microERP PME -> données opérationnelles -> affacturage, « Culture eats digital » + traction vs bénéfice trimestriel / semaine vs mois / test-mesure-apprentissage, Comprendre / Accepter / Pouvoir, titre « Plus long au décollage… », « perdre quelques semaines… gagner des mois ». Only figure on the page block = 1 M€ par startup = article [2]. No unsupported claim, no invented figure",
      "result": "PASS"
    },
    {
      "cmd": "risk (d): git grep -n -I -E '#besoin|#reflexion|venture-building/?#|venture-building\\.html#' -- '*.html' '*.xml' '*.txt' '*.json' 'assets/js/*.js' 'assets/js/_v2' tools ':(exclude).WIP'  (exit 1, no match: no page, script, sitemap or tool links a Venture anchor); git grep 'id=\"besoin\"' = service-ia-business/index.html:77 + service-strategie-transformation/index.html:77 (users of the style.css #besoin rules :803-804, :952-953, :976); no #reflexion rule anywhere",
      "result": "PASS"
    },
    {
      "cmd": "risks (b)(e) + Done When 3: node scratchpad/reviewer-p51-r2/run2/scripts/pages.mjs http://127.0.0.1:4173 scratchpad/reviewer-p51-r2/run2/base  (own headless Chrome script, resolver NOTFOUND except 127.0.0.1 + Google Fonts) 185 PASS 0 FAIL, exit 0 — /contact/ and /service-venture-building/ at 1200, 861, 641, 375, 320, JS on and off: every main section on screen, opacity 1, topmost; right edge of every boxed element <= emulated width (0 past, also in the error state); launchers QtzlMHaUGyM@david-goliath and 7qO3G7tCHr8@reflexion with loaded thumbnail (JS on) / hidden with caption link (JS off); #reflexion 10/10 points boxed and unclipped, two columns from 641, stacked at 375/320; Contact JS off = fallback shown, form hidden; real mouse click on « Envoyer » with an empty form at all five widths: 5 required fields show their message (22.3 px line, 44.6 px for the consent line at 375/320, rgb(197,48,48)), each inside the form, below its control, 16 px clear of the next block, topmost where drawn; the 2 optional fields stay empty at 0 px; focus on #b-nom; status role=alert « Quelques champs sont à corriger… »; Accessibility.getPartialAXTree: empty #err-nom ignored=false live=polite before and after (same as a35c404), #b-nom description « Ce champ est obligatoire. » invalid=true; typing clears the message; valid form in a sandboxed frame at 1200 and 375 -> « …vous devez encore l’envoyer… » role=status, frame URL unchanged; density measured: gaps 52/57.6 px (a35c404) -> 21.6/27.2 px, form 1162 -> 879 px at 1200; list links rgb(36,122,120) underline (none at a35c404), footer links none; outside requests 0",
      "result": "PASS"
    },
    {
      "cmd": "risk (c): RV_JS=off RV_WIDTHS=1200,375,320 node scratchpad/reviewer-p51-r2/run2/scripts/regress.mjs scratchpad/reviewer-p51-r2/run2/base http://127.0.0.1:4173  (a35c404 export vs tree; every element + ::before/::after: sorted standard computed properties and custom properties hashed apart, box; animations frozen) — /, /mentions-legales/, /politique-confidentialite/, /service-ia-business/, /service-strategie-transformation/, /publications/, /portfolio/, /404.html whole page + header and footer of the two changed pages: 30 runs, 5325 elements, 0 differences, exit 0",
      "result": "PASS"
    },
    {
      "cmd": "risk (c), JS on: RV_JS=on RV_WIDTHS=1200,375 node scratchpad/reviewer-p51-r2/run2/scripts/regress.mjs scratchpad/reviewer-p51-r2/run2/base http://127.0.0.1:4173  (pages walked first; Portfolio 339 rendered elements incl. the search field) 20 runs, 3592 elements, 0 differences, exit 0",
      "result": "PASS"
    },
    {
      "cmd": "comparer proven on mutated copies of 84780e0 (Pass 40 method): node scratchpad/reviewer-p51-r2/run2/scripts/regress.mjs scratchpad/reviewer-p51-r2/run2/head scratchpad/reviewer-p51-r2/run2/mut  with « .ticks--contact a » -> « .ticks a » and « .field .error » -> « .field »: exit 1, 64 differences, exactly Mentions (9 elements x 2 widths) and Portfolio (23 x 2), 0 elsewhere; scratchpad/reviewer-p51-r2/run2/mut2 with « .ticks li { margin-bottom: 2rem } »: 95 box + 21 style differences on Politique at 375",
      "result": "PASS"
    },
    {
      "cmd": "root repository truth check (read PLAN.md § 51 incl. « Owner revision 2026-10-12 », PRD.md § Refonte 2026-10-11 rows Contact and Venture Building, PROGRESS.md Next Action, prompts/rework-brief-20261011.md items 3-4) against the tree: h2 order, #besoin -> #reflexion, Intérêts / Challenges five points each, 7qO3G7tCHr8 inside, lead / phases / question rows gone, tighter form, underlined contact links, quote removed, « aucun chiffre hors de ces articles », Done When 4 file list — all true; git status -sb = rebuild...origin/rebuild [ahead 2] (84780e0 local, not pushed)",
      "result": "PASS"
    }
  ],
  "opened_fix_section": false
}
```

AUDIT r2 COST: 262,350 tokens, 35 min 39 s, GREEN. INVOCATION: a8bcad34a21da733c (pass-auditor subagent, inherited settings; second invocation of contact 2, the first was cut by the account limit with usage unknown). USAGE BASIS: whole-contact (Agent completion notice: subagent_tokens 262350, tool_uses 60, duration_ms 2139257).

Review contact 2 Tier 3 (advisory, no fix section): (1) Venture meta description and og:description (lines 7, 13) still say « identifier des opportunités … piloter la création », removed from the visible page (the Coder prompt froze the meta). (2) Contact at 320 px: the LinkedIn address runs 18.8 px past its column into the page margin (right edge 314.8 of 320, fully visible; same geometry at a35c404, more visible underlined). (3) Error lines no longer reserve room: what is below moves 22.3 px when a message appears (7.9 at a35c404); with an invalid field still focused, a click in the top 8 px of « Envoyer » only shows that field's message. (4) « souvent sous-exploités »: « souvent » is the synthesis's own word. (5) The Contact form has no heading or accessible name. (6) Root docs to settle at closure: PROGRESS Last Verification (Pass 51) missing, Next Action stale, PLAN section 51 Goal line still names « Votre besoin > Livrables ».

## CLOSURE
UNIT: p51
DOCS: root PLAN.md section 51 status Done, evidence pointer and owner-revision line, root PRD.md Refonte 2026-10-11 rows Contact and Venture Building (before review; the PRD rows are an owner-instructed edit of a Planner-owned file, reported in the PASS REPORT); root PROGRESS.md (Objective, Done, Next Action, Last Verification, Known minor issues P51) and CHANGELOG.md entry (after GREEN); committed in the root docs repository after the product reset commit. No README, ARCHITECTURE or AGENTS change (no new trap).
MIGRATED: final AUTO evidence, form gaps, render result, both review verdicts and costs, the owner's two looks into root PROGRESS.md Last Verification (Pass 51); owner-readable entry into root CHANGELOG.md.
NITS: Tier 3 of both review contacts recorded in root PROGRESS.md Known minor issues (P51); the stale PLAN section 51 Goal line and the README row are left to the Planner CHECK.
COMMIT: product bf29256 + 84780e0 (rebuild, LOCAL ONLY, not pushed); durable journal and reset commits follow on rebuild.
