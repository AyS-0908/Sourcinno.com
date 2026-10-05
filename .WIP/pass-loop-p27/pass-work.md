# Pass p27 journal — audit fixes: tests, rendered checks, independent review

STARTUP 2026-10-05 15:16 local. Values from Coder prompt (root prompts/pass27-coder.md, saved root 2813044 with the four other Planner inputs): unit p27, decisions-only, cap 2 contacts, whole product repository sealed. Models: work/auditor declared claude-opus-5-5, effort unknown (not runtime-verified; PROGRESS Model restriction exception). Ground check: P26 closed GREEN, no tests owed. Pre-flight equals Planner measurements: root e22d189 + exact expected dirt; product rebuild 420134c clean; no in-flight Pass; state dir ignored via .git/info/exclude `/.WIP/`; no scheduled task names this repository (`Get-ScheduledTask` filter on SOURCINNO|github-sync|commit-push: empty).

## SLICE
ADOPTED CANDIDATE: the code under review already exists as product commit 420134c (range d3b3e21..420134c, 6 files +57/-30). This Pass does not re-implement it. The loop base is 420134c, so the tool's own diff is empty or holds only this Pass's fixes: the review scope names range d3b3e21..HEAD and the reviewer reads `git diff d3b3e21..HEAD` itself.
Size: one turn (about 30 active minutes planned); no split. Work = PLAN § 27 Work 1-4: mutation pins for A-001/A-002/A-006, rendered checks at 1200 and 375, one independent review, fix only what those show.
MANUAL items: none. Every check is driven by the session; a rendered check that cannot be obtained pauses the Pass.
Browser route: the in-app Browser pane is HIDDEN (measured: innerWidth 0, visibilityState hidden, requestAnimationFrame never fired, screenshot timed out; session not open in any window). Rendered checks therefore run in an external browser: the installed Chrome, headless, private scratch profile, driven over its debugging protocol by a scratch Node script (no dependency). Proof of real rendering per capture: innerWidth equal to the requested width, requestAnimationFrame fired, measured rectangles, topmost element, real screenshot inspected.
Live third-party surface (Typebot): read-only by intent — open the conversation, read the first screen, no answer, no data. Each opening may add an empty session to the owner's Typebot results (cleanup list: PROGRESS). No other live system.
Seal limits: the root docs repository (PLAN/PROGRESS/CHANGELOG) is a second repository, outside this seal; ignored `.WIP/` files (this journal, captures) are outside it too.
Files the AUTO suite never executes: README.md (grep pin only), contact/index.html + service-ia-business/index.html + politique-confidentialite/index.html as RENDERED pages (source pins only) -> covered by AUTO-3/AUTO-4 rendered checks.

## EXPECTED TESTS
- AUTO-1 `node tools/check.mjs --all`, `node tools/version.mjs --check`, `git diff --check d3b3e21..HEAD` on the closing tree — expect: all exit 0; `--all` prints `tools/portfolio.test.mjs: ...` and `tools/test-ia-embeds.mjs: ...` PASS lines and the five --tiers hosts (fonts.googleapis.com, fonts.gstatic.com, www.youtube-nocookie.com, cdn.jsdelivr.net, typebot.io).
- AUTO-2 Mutation ledger on two scratch trees outside the repository (OLD = `git archive d3b3e21`, NEW = copy of HEAD), control run green on both first — expect: M1a/M1b a `throw` appended to each test file under `--all`: OLD exit 0, NEW exit 1 naming the file; M2 `cdn.jsdelivr.net` removed from the policy text under `--tiers`: OLD exit 0, NEW exit 1; M3 contact form without `hidden` under `--forms --nojs`: OLD exit 0, NEW exit 1; HEAD-side re-runs M4 fallback paragraph shipped `hidden`, M5 reveal line deleted from forms.js: NEW exit 1 each. Afterwards product `git status --short` empty and HEAD unchanged.
- AUTO-3 Rendered `/contact/` served on localhost:4173, at 1200 and 375 — expect: normal: form visible (rectangle > 0, topmost at its centre inside the form), fallback not rendered; valid submission inside a sandboxed frame (`allow-scripts allow-same-origin`) gives `.form-status` draft text with a mailto link and `form.dataset.lastMailto` starting `mailto:`, no mail client launched; `forms.js` blocked: fallback rectangle > 0 and topmost at its centre, zero visible form; `forms.js` delayed >= 2 s: the text shown during the wait contains no statement false for a JavaScript-enabled visitor, then the form appears. No horizontal overflow. Captures saved in the state dir.
- AUTO-4 Rendered `/service-ia-business/` and the privacy Typebot paragraph at 1200 and 375 — expect: notice and paragraph inside the viewport width, document scrollWidth <= innerWidth; after the click the conversation's first screen shows on a light background (capture); nothing answered. `node tools/check.mjs --legal --tiers` exit 0.
- AUTO-5 Protections — expect: `git diff --quiet 670f72f HEAD -- .github/` exit 0; the three P9 SHA256 and two PNG SHA256 of PROGRESS Safety gates unchanged; no fetch/push/deploy; root `outputs/` unstaged.

PLAN MEASURE (before any edit, headless Chrome, 1200 and 375): `forms.js` held 3 s -> a JavaScript-enabled visitor read "Le formulaire de cette page a besoin de JavaScript. Il est désactivé : ..." for the whole wait (fallback rectangle 327x159 at 375, topmost p.form-status, 0 visible form). Done When 3 defect CONFIRMED -> smallest wording fix in slice. Same run: a click on the submit button inside a frame sandboxed `allow-scripts allow-same-origin` fires NO submit event (Chrome blocks submission without `allow-forms`: status empty, lastMailto empty) -> the check uses `allow-scripts allow-same-origin allow-forms`; the mailto navigation stays blocked by the sandbox (console: "Navigation to external protocol blocked by sandbox").

## CHANGED
- ADOPTED (product 420134c, not edited by this Pass unless listed below): README.md, assets/js/forms.js, contact/index.html, politique-confidentialite/index.html, service-ia-business/index.html, tools/check.mjs.
- EDITED by this Pass: contact/index.html — fallback wording only: "Il est désactivé :" -> "S’il ne s’affiche pas :" (2 lines; no CSS/JS edit, no restamp needed).
- Root docs repository (outside this seal): PLAN.md § 27 status token + evidence pointer; CHANGELOG.md one entry; PROGRESS.md at closure.

## TEST-RESULTS r1
TREE: 04357cf3521070ee
TREE NOTE: identical before and after the native commands; the rendered run and the mutation re-run used this same content (contact/index.html sha256 a581fd008114e8b4...).
CMD: `node tools/check.mjs --all; node tools/version.mjs --check; git diff --check d3b3e21..HEAD; git diff --check; node tools/check.mjs --legal --tiers; git diff --quiet 670f72f HEAD -- .github/`
RESULT: PASS — all exit 0; runner printed "OK — aucun probleme sur 16 page(s)", both test PASS lines, 40 version references, 5 --tiers hosts (fonts.googleapis.com, fonts.gstatic.com, www.youtube-nocookie.com, cdn.jsdelivr.net, typebot.io). `grep -n "déclenche le déploiement" README.md` empty.
CMD: `bash .WIP/pass-loop-p27/evidence/mutate.sh` (run from the session scratch folder; OLD = `git -c core.autocrlf=false archive d3b3e21`, NEW = copy of the 69 tracked working-tree files; each mutation on a throwaway copy)
RESULT: PASS — control `--all` exit 0 on both trees. Ledger (mutation -> OLD exit / NEW exit, NEW failure line): M1a throw appended to tools/portfolio.test.mjs, `--all` -> 0 / 1 "tools/portfolio.test.mjs: test en echec"; M1b same on tools/test-ia-embeds.mjs -> 0 / 1 "tools/test-ia-embeds.mjs: test en echec"; M2 cdn.jsdelivr.net removed from the policy, `--tiers` -> 0 / 1 "le site charge une ressource depuis cdn.jsdelivr.net ... la politique ... n en parle pas"; M3 contact form without `hidden`, `--forms --nojs` -> 0 (OLD ships it that way, no edit needed) / 1 "le formulaire doit etre livre hidden"; M4 fallback shipped hidden (NEW only) -> 1 "aucun moyen de contact de repli visible"; M5 `form.hidden = false` deleted from forms.js, restamped in the copy (NEW only) -> 1 "forms.js doit reveler le formulaire et masquer le repli". Product after: HEAD 420134c, `git status --short` = ` M contact/index.html` only (this Pass's edit).
CMD: `node .WIP/pass-loop-p27/evidence/render.mjs <captures> "" contact ia privacy` (headless Chrome over its debugging protocol, pages served by `python -m http.server 4173`; results evidence/render-results.json; 14 captures in captures/)
RESULT: PASS — at 1200 and 375, innerWidth equal to the request, requestAnimationFrame fired, scrollWidth <= innerWidth on every page. Contact normal: form 544x1162 / 327x1238 display block, topmost inside the form; fallback display none 0x0. Valid submission (sandboxed frame, real click): status "Le brouillon a été préparé pour votre messagerie ..." with a mailto link, lastMailto starts `mailto:aymard.de.scorbiac@sourcinno.com?subject=` and carries "Nom : Test P27", frame URL unchanged, console "Navigation to external protocol blocked by sandbox" (no mail client). forms.js blocked (blockedReason inspector): fallback 544x109 / 327x159, topmost p.form-status, 0 visible form. forms.js held 3007 / 3006 ms: at 1.5 s the visitor reads only "Le formulaire de cette page a besoin de JavaScript. S’il ne s’affiche pas : ouvrir un brouillon d’email ... ou appelez le +33 6 08 75 58 77." (true in every state), then form visible, fallback gone. IA page: notice 710x48 / 277x119 inside the viewport; before the click only fonts.googleapis.com + fonts.gstatic.com requested; after one real click the conversation shows on background rgb(255,255,255) with the welcome text, the video and Oui / Non merci (hosts cdn.jsdelivr.net, typebot.io, www.youtube.com); nothing answered. Privacy Typebot paragraph 632x326 / 327x625 inside the viewport.
NOTES: 8 of 14 captures inspected by eye (contact blocked 1200, delayed 375, submit 1200, normal 1200, IA chat 1200 and 375, IA notice 375, privacy 375); the other 6 rest on their measurements. Protections: P9 three SHA256 and both PNG SHA256 equal PROGRESS Safety gates; workflow diff vs 670f72f empty. Two Typebot conversations opened (one per width), no answer. Root docs repository is outside this seal: PLAN § 27 token/pointer and CHANGELOG entry written before this block.

## Review contact 1 of 2 - fresh auditor notes (code-audit, phase-gate) - 2026-10-05

Greenlight - no Tier 1 or Tier 2 finding in product range d3b3e21..HEAD (HEAD 3eea752, branch rebuild); PLAN section 27 Work 1-4 / Done When 1-4 and 6, and A-001, A-002, A-003 (wording), A-005, A-006 are met. Nothing to fix. This journal was not read (brief); Done When 2 was graded by re-running the mutations, not by reading the journal.

NATIVE CHECKS (product tree, clean before and after):
- `node tools/check.mjs --all` exit 0 - both test PASS lines; `--tiers` lists 5 hosts (fonts.googleapis.com, fonts.gstatic.com, www.youtube-nocookie.com, cdn.jsdelivr.net, typebot.io).
- `node tools/version.mjs --check` exit 0 (40 references); `git diff --check d3b3e21..HEAD` exit 0; `git diff --quiet 670f72f HEAD -- .github/` exit 0.
- `node tools/check.mjs --legal --tiers` exit 0; `node tools/check.mjs --forms --nojs` exit 0.
- Committed tree (`git -c core.autocrlf=false archive HEAD`, scratch): `--all` exit 0, `version.mjs --check` exit 0.
- `grep -n "déclenche le déploiement" README.md` no match; README matches AGENTS release route and `deploy-hostinger.yml` (`if: ${{ false }}`).
- Local only: `rebuild...origin/rebuild [ahead 28]`, origin refs dated 2026-10-03 or older.

MUTATIONS (scratch folder outside the repository; old = archive d3b3e21, new = archive HEAD; `bash mutate.sh`):
- old: M1a, M1b, M2 exit 0; M3 exit 0 (file already without `hidden`).
- new: M1a, M1b, M2, M3, M4, M5 each exit 1 with the expected message.
- Auditor extras on new: fallback-hide line deleted -> exit 1; typebot removed from policy -> exit 1; youtube-nocookie removed from policy -> exit 1; test file exiting 3 -> exit 1.

RENDERED (own run, scratch copy of render.mjs, external headless Chrome, localhost:4173 serving the HEAD bytes - sha1 of 4 served files equals local):
- `/contact/` 1200 and 375: normal = 1 visible form, fallback display none, no overflow; sandboxed-frame submission = state ok, mailto draft link, frame URL unchanged, navigation to mailto blocked by the sandbox (no mail client); `forms.js` blocked = 0 visible form, fallback 544x109 / 327x159 and topmost at its centre; `forms.js` held 3.0 s = fallback visible with the text "S'il ne s'affiche pas", 0 form, then form shown and fallback hidden; scripts disabled (auditor addition) = fallback visible, 0 form.
- `/service-ia-business/` notice and `/politique-confidentialite/` Typebot paragraph, 1200 and 375: inside width, no overflow; hosts before click = Google Fonts only.

LIVE Typebot (LIVE-SAFE, one open, no answer): my single open at 375 gave no measurement and no capture. `P27_CLICK_WIDTH=375 node render.mjs <scratch>/captures audit contact ia privacy` exited 1 with `TypeError: Cannot read properties of undefined (reading 'replace')` raised by the evidence script's own chat probe (render.mjs line 151), after its contact, 1200 notice and 1200 privacy parts had completed. Cause reproduced offline on about:blank: the probe reads `.innerText` on the ShadowRoot whenever `.typebot-container` is not rendered yet. That run is NOT listed in the JSON evidence: no claim rests on it and it says nothing about the product. The light-theme start (Done When 4) therefore rests on the work-session captures `captures/ia-chat-1200.jpg` and `captures/ia-chat-375.jpg` (viewed: white background, grey bubbles, first screen, `Oui` / `Non merci` unanswered), `render-results.json` (background rgb(255, 255, 255)) and the `test-ia-embeds` PASS line - the brief allows relying on the captures. Not reproduced live by the auditor; confidence set to medium for that reason only.

SCOPE: CLEAN - every hunk traces to A-001/A-002/A-003/A-005/A-006 or to section 27 Work 4 (fallback wording, shown false by the delayed check in `render-results-before-fix.json`); removal of the contact `<noscript>` form rules and the header/comment updates are necessary side work.

SEAL: the Pass's only product change since base 420134c is `contact/index.html` (2+/2-, wording only; full diff read). The docs repository and `.WIP` are not sealed: their checks are the re-runs above.

NITS: (Tier 3, non-blocking, no review owed)
- N1 `.WIP/pass-loop-p27/evidence/render.mjs:151` - chat probe throws while the Typebot shadow root has no `.typebot-container` yet; the live first-screen check is therefore not reproducible on demand (see LIVE Typebot).
- N2 `tools/check.mjs:578` - `\bhidden\b` also accepts `aria-hidden`: scratch mutation replacing the form's `hidden` by `aria-hidden="true"` leaves `--forms --nojs` at exit 0.
- N3 `assets/css/style.css:431` - `.noscript-contact { display: none; }` matches no element any more; nine other pages still carry the old `<noscript>` form rules (older than d3b3e21).
- N4 `tools/check.mjs:662` - `execFileSync` has no timeout: a hanging test file hangs `--all`.
- N5 `tools/check.mjs:610` - the script host scan also walks `.WIP` (not in SKIP_DIRS); a stray `.js` there (render.mjs never deletes its `chrome-profile` at exit) would raise false `--tiers` failures.
- N6 Privacy wording, for release acceptance (owner): retention of callback contacts held in the owner's Typebot account is described as depending on Typebot's policy, and "seul destinataire" is an owner-side fact not visible from the visitor side.
- N7 JavaScript-enabled visitors see the fallback box until `forms.js` runs, then the form replaces it (layout shift); the text is true in that state.
- N8 Docs repository working copy (uncommitted) already reads PLAN section 27 `Status Done` and CHANGELOG "independently reviewed": written before this verdict.
- N9 Declared "one-line fix" vs git 2+/2-: one sentence across a wrapped line, nothing else in `420134c..HEAD`.

```json
{
  "token": "0bc92ec2",
  "verdict": "GREEN",
  "confidence": "medium",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check d3b3e21..HEAD", "result": "PASS"},
    {"cmd": "git diff --quiet 670f72f HEAD -- .github/", "result": "PASS"},
    {"cmd": "node tools/check.mjs --legal --tiers", "result": "PASS"},
    {"cmd": "node tools/check.mjs --forms --nojs", "result": "PASS"},
    {"cmd": "git -c core.autocrlf=false archive HEAD | tar -x -C <scratch>/new && cd <scratch>/new && node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "bash mutate.sh from <scratch> (old = archive d3b3e21: M1a M1b M2 M3 exit 0; new = archive HEAD: M1a M1b M2 M3 M4 M5 exit 1)", "result": "PASS"},
    {"cmd": "scratch copy of HEAD with the forms.js line 'if (fallback) fallback.hidden = true;' deleted: node tools/version.mjs && node tools/check.mjs --forms --nojs (expected exit 1)", "result": "PASS"},
    {"cmd": "node render.mjs <scratch>/captures audit3 contact (scratch copy, localhost:4173, 1200 and 375: normal, sandboxed submit, forms.js blocked, forms.js held 3 s, scripts disabled)", "result": "PASS"},
    {"cmd": "node render.mjs <scratch>/captures audit2 ia privacy (scratch copy, no click, 1200 and 375: notice and privacy paragraph inside width, no overflow)", "result": "PASS"},
    {"cmd": "git diff 420134c..HEAD && git status --short", "result": "PASS"},
    {"cmd": "grep -n 'déclenche le déploiement' README.md (expected no match)", "result": "PASS"},
    {"cmd": "view .WIP/pass-loop-p27/captures/ia-chat-1200.jpg and ia-chat-375.jpg (Typebot first screen, light theme, unanswered)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 229482 tokens, 16 min 51 s (1010511 ms), GREEN/medium. INVOCATION: a5ad25977313988fd (pass-auditor subagent, one fresh contact); USAGE BASIS: whole-contact, source = the Agent tool's completion notice (subagent_tokens / duration_ms). Reviewer model/effort: inherited defaults, not runtime-verified.

## CLOSURE
UNIT: p27
DOCS: root PLAN.md § 27 status token Done + evidence pointer (written before the review); root CHANGELOG.md one entry; root PROGRESS.md objective/Done/Open/Next Action/Last Verification/Known minor issues; root AGENTS.md two Gotchas (headless Chrome route when the pane is hidden + sandbox `allow-forms`; scratch export with `core.autocrlf=false`). No README/PRD/ARCHITECTURE edit.
MIGRATED: native suite, mutation ledger, rendered measurements, verdict GREEN/medium/token 0bc92ec2/seal 04357cf3521070ee, review cost, protections and the Typebot cleanup count -> PROGRESS Last Verification (first bullet); visible change -> CHANGELOG.
NITS: nine Tier-3 observations N1-N9 -> root PROGRESS.md "Known minor issues" (P27 block); none turned into a fix.
COMMIT: 3eea7525910b07c5f2e1a6589ec21f5e52688e71
STATUS NOTE: LOCAL ONLY under the owner's publication WAIT - no push; this local commit replaces the pushed commit of the standard closure.
