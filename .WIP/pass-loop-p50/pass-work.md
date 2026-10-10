# Pass p50 — Une seule source — coordonnées et destinations vidéo contrôlées, téléphone de l'hébergeur

Contract: root PLAN.md § 50 (audit 2026-10-10 A-005); Coder prompt root `prompts/pass50-coder.md` (inputs commit 6cc6fae). Product base fca0472 (rebuild). LOCAL ONLY.

MODELS: work = claude-opus-5-5 (session system prompt, declared); effort unknown (not exposed). Reviewer: launch controls expose a model override but no effort control; reviewer inherits the session model, effort unknown (PROGRESS Model restriction exception). Runtime-verified: nothing.

## SLICE

Size: one turn (~30 min): one STRUCTURE rule (~70 lines) in `tools/check.mjs`, the `--forms` fixture reading the reference, header comment, one Mentions line. No split.

Measured on fca0472 (git grep, pages = 16 `.html` outside `.WIP`/`tools`/`.github`, scripts = `assets/js/*.js` top level):
- email `aymard.de.scorbiac@sourcinno.com`: footer copies (10) + index JSON-LD, contact 86 ×2/103, mentions 90/115, politique 81/127, config.js 18, forms.js 11. No other email-shaped token in scope (`wght@400`, `"@type"`, forms.js regex do not match the email shape).
- phone: `+33608755877` (tel: hrefs + JSON-LD), `+33 6 08 75 58 77` (footer, mentions 90), `+33&nbsp;6&nbsp;08&nbsp;75&nbsp;58&nbsp;77` (contact 87/104); host `+37064503378` / `+370 645 03378` on mentions 98 only. Every `+digit` sequence in scope is one of these.
- LinkedIn profile `linkedin.com/in/aymarddescorbiac` only form of `linkedin.com/in/`.
- video: 4 launchers, each in a `figure` with one `data-video` and one caption `youtube.com/watch?v=`; ids equal today.
- Typebot: direct link `https://typebot.io/paiement-produit-num-rique-o8lsepu` (service-ia-business 228) and `typebot: '…'` in ia-embeds.js 17.

Rule design (STRUCTURE, step 10, « coherence des coordonnees »):
- References read from `tools/shell/footer.html`: mailto value, tel value, `linkedin.com/in/<slug>`. Missing file or any missing value = FAIL naming `tools/shell/footer.html`, nothing compared (fail closed).
- Email: every email-shaped token in scope (pages raw text + scripts) must equal the reference (asset-name tokens ending .png/.jpg/... excluded: `logo@2x.png` is not an email).
- Phone: every international number `+d…` (separators: space, `&nbsp;`, U+00A0) normalised to digits must equal the reference digits; host digits allowed in `mentions-legales/index.html` only. Covers tel: hrefs, displayed text and JSON-LD `telephone`. Limit stated in the comment: a national form (06 …) is not seen.
- LinkedIn: every `linkedin.com/in/<slug>` must carry the reference slug (posts/company URLs are not the contact fact).
- Video: in each page, each `figure` holding `data-video` must hold exactly one `data-video` and one caption `youtube.com/watch?v=` with the same id; a `data-video` outside such a figure or with no caption link = FAIL (no reference); any other YouTube id written in a page must be one of that page's launcher ids.
- Typebot: reference = the single distinct `https://typebot.io/<id>` of the pages (zero or several distinct = FAIL); every `typebot: '<id>'` of the scripts must equal it.
- Zero-occurrence family (email, phone, LinkedIn, video, Typebot script) = FAIL. The note prints counts per fact and per written form.
- `--forms` fixture (:445, :462) uses the footer email; unreadable reference = named FAIL.
- Host phone (Work 3): `+370&nbsp;645&nbsp;03378` at mentions 98. `checkLegal()` unchanged.

Gates: none internal (no money/auth/migration). Mutations on a scratch export in the session scratchpad, never on the live tree.
Live checks: none (local servers on 127.0.0.1 only; no LIVE-SAFE clause applies).
MANUAL items: none for this Pass — every criterion is a terminal command or a headless render the session drives.

## EXPECTED TESTS

- AUTO-1 `node tools/check.mjs --all` — expect exit 0, 16 pages, both executed tests PASS, new STRUCTURE note with counts.
- AUTO-2 `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check` — expect exit 0 each (no CSS/JS asset changed: version refs 43 unchanged).
- AUTO-3 `git diff --stat fca0472 -- . ':(exclude).WIP'` — expect `tools/check.mjs` and `mentions-legales/index.html` only.
- AUTO-4 counts: each per-form count in the note = `git grep -o -F '<form>' -- <16 pages> assets/js/*.js | wc -l` (email 1 form; phone 3 forms; host 2 forms; LinkedIn 1; video `data-video="` and `youtube.com/watch?v=` 4/4; Typebot 2).
- AUTO-5 mutation ledger on a scratch export `git -c core.autocrlf=false archive HEAD` (after product commit): unmutated exit 0; each single mutation exit 1 with the rule's own « coherence » line naming the file: M1 email at contact 103; M2 email in config.js; M3 one displayed digit contact 87 (tel: intact); M4 JSON-LD telephone index.html; M5 LinkedIn slug publications; M6 one launcher `data-video` service-venture-building; M7 Typebot id ia-embeds.js; M8 `tel:+37064503378` pasted into contact; M9 `tools/shell/footer.html` renamed. Plus adversarial no-false-FAIL: the existing three phone forms and the mailto with query string pass (unmutated run = 0).
- AUTO-6 `--forms` on the live tree exits 0 with the fixture reading the reference; on M9 copy `--forms` names the unreadable reference.
- AUTO-7 Host phone: `grep -c "+370&nbsp;645&nbsp;03378" mentions-legales/index.html` = 1; `git diff fca0472 -- mentions-legales/index.html` = 1 line; headless Chrome (P48 a008 method, copied to evidence/) on `/mentions-legales/` `a[href="tel:+37064503378"]` at 320 and 334: before (fca0472 export on :4174) 2 distinct line tops, after (tree on :4173) 1.

Changed files and reach: `tools/check.mjs` — executed by AUTO-1/5/6. `mentions-legales/index.html` — read by AUTO-1 (structure, legal, a11y, nojs, seo) and rendered by AUTO-7. No unreached file.

## CHANGED
- `tools/check.mjs` (product aae77f1): header comment names the rule; module-level `contactRef` read from `tools/shell/footer.html`; STRUCTURE step 10 « coherence des coordonnees » + its note; `--forms` fixture uses `contactRef.email` and fails named when unreadable.
- `mentions-legales/index.html` (product aae77f1): line 98 host phone `+370&nbsp;645&nbsp;03378`.
- Root docs repository (not in this seal): PLAN.md § 50 status token Done + evidence pointer; ARCHITECTURE.md § Components verifier line names the rule and its reference.
- Evidence (ignored, not sealed; committed durable after done): `.WIP/pass-loop-p50/evidence/` counts.sh, mutations.mjs + mutations.txt, cdp.mjs + hostphone.mjs (copied from P48, 2f438ce), hostphone-{before,after}.txt and -320/-334 png.

## TEST-RESULTS r1
TREE: 196967d9605fb96f
CMD: `node tools/check.mjs --all` exit 0 (16 pages, both executed tests PASS); `node tools/version.mjs --check` 0 (43); `node tools/shell.mjs --check` 0 (10 + 6 redirects); `git diff --check fca0472 HEAD` 0; `git diff --stat fca0472 -- . ':(exclude).WIP'` = tools/check.mjs + mentions-legales/index.html only
RESULT: PASS — Done When 1 met.
NOTES: Done When 2 (`sh .WIP/pass-loop-p50/evidence/counts.sh`, same 23 files = 16 pages + 7 assets/js/*.js) note vs git grep -o -F: email 34/34; phone +33608755877 14/14, « +33 6 08 75 58 77 » 11/11, « +33&nbsp;…77 » 2/2; host +37064503378 1/1 and « +370&nbsp;645&nbsp;03378 » 1/1 (mentions only); LinkedIn 14/14; data-video 4/4 and watch?v= 4/4; Typebot direct link 1/1, script 1/1.
 Done When 3 (`node .WIP/pass-loop-p50/evidence/mutations.mjs <scratchpad>/p50-mut HEAD`, export of aae77f1, full output evidence/mutations.txt): M0 exit 0; every Mn exit 1 with the rule's own line naming the file — M1 contact/index.html email « contact@sourcinno.com »; M2 assets/js/config.js email (+ versions stale ?v=, expected for a JS edit); M3 contact/index.html « +33&nbsp;…58&nbsp;78 »; M4 index.html « +33608755878 »; M5 publications/index.html profile slug; M6 service-venture-building/index.html data-video vs caption; M7 assets/js/ia-embeds.js Typebot id (+ versions ?v= + « aucun typebot conforme »); M8 contact/index.html host phone « admis seulement dans mentions-legales »; M9 tools/shell/footer.html « reference illisible (fichier absent) » (+ shell.mjs ENOENT crash reported by coquille) and with --forms the named fixture line. Pass-probes P1 (reference phone with U+00A0 in contact text) and P2 (LinkedIn /posts/ URL) exit 0.
 Done When 4 (`node .WIP/pass-loop-p50/evidence/hostphone.mjs`, P48 cdp method, fca0472 export on 127.0.0.1:4174 vs tree on :4173, outside requests 0): before 320 = 2 line tops [427,454], 334 = 1 [440]; after 320 = 1 [440], 334 = 1 [440]; grep -c = 1; mentions diff = 1 line. Surprise: before at 334 was already 1 line here (plan expected 2).

## Review contact 1 (fresh auditor) — verdict GREEN
Phase-gate, product aae77f1 vs fca0472 + root docs diff. Own export `git -c core.autocrlf=false archive HEAD` in the session scratchpad `reviewer-p50/` (receipts `mutations-reviewer.txt`, `mutations2-reviewer.txt`, `render/reviewer-hostphone-*.png`). Done When 1-4 re-measured: suite/version/shell/diff-check 0; note counts = independent `git grep -o -F` on the same 23 files (email 34, phone 14+11+2, host 1+1, LinkedIn 14, 4 launchers, Typebot 1/1); all 9 plan mutations exit 1 with the coherence message naming the mutated file (JS ones also isolated after `version.mjs`: coherence lines only); 7 own mutations caught (caption-only id, single-quoted data-video, stray launcher, third-party mailto, host-phone digit, footer `tel:` removed, U+00A0 phone); false-FAIL probes green (`@2x.png`/`+02:00`/`wght@` text; consistent email change everywhere with `--all`; consistent phone change everywhere). Host phone one line at 320/334/360/375 (link rects 1, range tops 1, no element past width, 0 outside requests). Scope CLEAN (stray-id/outside-figure checks = necessary side work).
Advisory (Tier 3, no fix section): phone forms with `&#160;` (already normalised at `tools/check.mjs:733`), `.` or `-` separators, and `%40`/`&#64;`-encoded emails are not read — a wrong digit written `+33&#160;6…79` or `+33.6.08.75.58.79` stays green; the code comment names only the national-form limit and ARCHITECTURE says "every international phone". Widen the separator set or name the limit when next touched.

```json
{
  "token": "6bd252f0",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all (scratch export of aae77f1)", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check (scratch export)", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check (scratch export)", "result": "PASS"},
    {"cmd": "git diff --check fca0472 HEAD; git diff --check", "result": "PASS"},
    {"cmd": "git diff --stat fca0472 -- . ':(exclude).WIP' = tools/check.mjs + mentions-legales/index.html only", "result": "PASS"},
    {"cmd": "git grep -o -F <each value> -- <16 pages + assets/js/*.js> | wc -l vs STRUCTURE coherence note counts", "result": "PASS"},
    {"cmd": "node mut.mjs (9 Done When 3 mutations + 7 own, fresh copy each, node tools/check.mjs)", "result": "PASS"},
    {"cmd": "node mut2.mjs (JS mutations isolated after version.mjs; consistent email/phone changes stay green incl. --all)", "result": "PASS"},
    {"cmd": "node render/phone.mjs at 320/334/360/375 on 127.0.0.1:4174 (host phone link rects 1, range tops 1, past width 0, outside requests 0)", "result": "PASS"},
    {"cmd": "grep -c \"+370&nbsp;645&nbsp;03378\" mentions-legales/index.html = 1; git diff fca0472 -- mentions-legales/index.html = one line", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 134,625 tokens, 6 min 26 s (385,711 ms, 39 tool uses), GREEN high
INVOCATION: Agent tool, pass-auditor subagent (fresh; inherited session model, effort unknown)
USAGE BASIS: whole-contact (Agent completion notice, subagent_tokens)

## CLOSURE
UNIT: p50
DOCS: root PLAN.md section 50 status Done + evidence pointer and ARCHITECTURE.md verifier line (before review); root PROGRESS.md (Objective, Done, Next Action, Last Verification, Known minor issues P50) and CHANGELOG.md entry (after GREEN); committed in the root docs repository after the product reset commit. No PRD, README or AGENTS change (no new trap).
MIGRATED: final AUTO evidence, count pairs, mutation ledger, host-phone line tops, review verdict and cost into root PROGRESS.md Last Verification (Pass 50); owner-readable entry into root CHANGELOG.md.
NITS: reviewer Tier 3 (unread phone separators and encoded emails; comment and ARCHITECTURE wording stronger than the separator set) and the redundant Typebot second line recorded in root PROGRESS.md Known minor issues (P50).
COMMIT: product aae77f1 (rebuild, LOCAL ONLY, not pushed); durable journal and reset commits follow on rebuild.
