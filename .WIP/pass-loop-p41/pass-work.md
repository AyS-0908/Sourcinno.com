# Pass p41 — Entreprise IA — Typebot auto-hébergé (A-005)

## STARTUP
- Root main 7ced673 at pre-flight; Planner inputs saved as 9deb8fb (6 paths; first attempt 09d7c96 missed `prompts/pass41-coder.md` because a chained `git add` on the already-staged deletion failed; amended locally, never pushed). Product rebuild c2a6025 clean = `pass_base`.
- Models: work claude-opus-5-5 (declared by the session system prompt; effort not exposed = unknown); auditor same model, inherited settings (no effort control exposed). PROGRESS Model restriction exception applies. Cap 2 contacts, decisions-only, no seal_paths (whole product repo).
- Port 4173: not listening at pre-flight (`netstat -ano | grep :4173` empty). Start 2026-10-10 00:00 local (`date`).

## SLICE
PLAN § 41 Work 1–5, about one turn (30–35 min): measured matches the plan, no split.
1. Downloads verified BEFORE extraction: tarball sha512 = PLAN integrity; `LICENSE` SHA-256 29f18026… = PLAN; `package/dist/web.js` 688,298 B, SHA-256 41adb285… = pin, 154 lines, 0 CR, 3 lines ending in whitespace (37, 38, 43), `import(` 0, no static `import`/`from"` outside strings, one `export{Uoe as default}`.
2. `assets/js/vendor/typebot-js-0.10.11/web.js` + `LICENSE` byte copies; product `.gitattributes` `assets/js/vendor/** -text -whitespace` before `git add`.
3. `ia-embeds.js`: specifier `/assets/js/vendor/typebot-js-0.10.11/web.js`; `status` updates null-guarded inside the `try`.
4. `check.mjs`: SHA-256 pin of the vendor `web.js` + `LICENSE` presence (STRUCTURE); `assets/js/vendor/` out of the classic compile (pinned instead), the reverse-census string reader and the `--tiers` script scan; exactly that prefix (`_v2` stays census consumer, `ia-embeds.js` stays in `--tiers`).
5. `test-ia-embeds.mjs`: literal specifier assertion; page without `[data-chat-status]` opens the chat without throwing.
6. Privacy sentence (`politique-confidentialite/index.html:112`): component served by the site itself; `node tools/version.mjs`.
No MANUAL items: every check, the rendered one included, is driven from the terminal.
LIVE-SAFE (rendered live Typebot open): read-only NOT fully met — each open creates one result in the owner's Typebot (owner-approved, at most 2, PLAN § 41); no update/delete of any record; runtime not near any ceiling (browser session, seconds); no mode/config changed; created results go on the owner cleanup list in the report (count stated).
Acceptance order: default audit-first.

## EXPECTED TESTS
- AUTO-1 `node tools/check.mjs --all` — expect exit 0, both executed tests PASS, a note naming the pinned vendor fingerprint.
- AUTO-2 `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check` (vs c2a6025, staged) — expect 0 each.
- AUTO-3 `node tools/check.mjs --tiers` — expect 0 and no `cdn.jsdelivr.net`; `git grep -n jsdelivr -- . ':!.WIP'` prints nothing; `node tools/check.mjs --legal` 0.
- AUTO-4 `git diff --stat c2a6025` (+ untracked) — expect only `.gitattributes`, `assets/js/ia-embeds.js`, `assets/js/vendor/typebot-js-0.10.11/{web.js,LICENSE}`, `tools/check.mjs`, `tools/test-ia-embeds.mjs`, `politique-confidentialite/index.html`, `service-ia-business/index.html`.
- AUTO-5 `certutil -hashfile ... SHA256` on the working file and SHA-256 of `git cat-file blob :assets/js/vendor/typebot-js-0.10.11/web.js` — expect both 41adb2855b0e8868b4cf304b20e3ab1f1014e8ed252ec559aaa8d4cd4ed72750; plus staged-delete-restore round trip (`git checkout --`) re-hash equal.
- AUTO-6 `node --experimental-vm-modules tools/test-ia-embeds.mjs` — expect PASS including specifier assertion and no-status page; mutation: specifier back to jsdelivr → named assert red; status guard removed → no-status assert red.
- AUTO-7 scratch copies (`git -c core.autocrlf=false archive` + working files, session scratchpad): unmodified 0; one byte changed in vendor `web.js` → `--all` 1 naming the fingerprint; vendor `LICENSE` removed → 1; specifier back to jsdelivr → 1; `.ghost-class { color: red; }` in `style.css` + `"ghost-class"` only inside vendor `web.js` → 1.
- AUTO-8 rendered, headless Chrome (P27 recipe), `/service-ia-business/` 1200 px: no request to `typebot.io`/`cdn.jsdelivr.net` before the click; after the click `web.js` from 127.0.0.1, no `cdn.jsdelivr.net`, bot's first message inside `typebot-standard` (live Typebot); `typebot.io` blocked at the browser → « indisponible » message; one 375 px capture of the opened chat. At most 2 live opens.
Changed files vs AUTO reach: `.gitattributes` (AUTO-2 `git diff --check`, AUTO-5 round trip), `ia-embeds.js` (AUTO-6, AUTO-8), vendor `web.js` (AUTO-1 pin, AUTO-5, AUTO-8), vendor `LICENSE` (AUTO-1 presence, AUTO-7), `check.mjs` (AUTO-1, AUTO-7), `test-ia-embeds.mjs` (AUTO-1, AUTO-6), privacy page (AUTO-3 `--tiers`/`--legal`), IA page stamp (AUTO-2 version check). None unreached.
Audit budget: 1 fresh full review (~140–170k tokens, P40 comparable 161,849), 1 same-reviewer confirmation reserved.

## CHANGED
Product (vs c2a6025, `git diff --stat c2a6025` = 8 files, +337/−20): `.gitattributes` (new, `assets/js/vendor/** -text -whitespace`), `assets/js/vendor/typebot-js-0.10.11/web.js` + `LICENSE` (new, npm/GitHub bytes), `assets/js/ia-embeds.js` (local specifier; `status` writes guarded inside `try`/`catch`), `tools/check.mjs` (`VENDOR`/`VENDOR_PINS`, step 5 bis pin + LICENSE + unpinned-vendor-script failure; vendor out of compile, reverse census, `--tiers` scan), `tools/test-ia-embeds.mjs` (literal specifier, runtime specifier, page without status), `politique-confidentialite/index.html` (one sentence), `service-ia-business/index.html` (`?v=` stamp by `node tools/version.mjs`).
Root docs: PLAN § 41 token Done + evidence pointer; ARCHITECTURE `assets/js/` line (vendor folder, pin, `.gitattributes`), `tools/` line (`check.mjs` pin + 3 exclusions), privacy/third-party line (component served by the site). PROGRESS/CHANGELOG at closure.
No `check.mjs`/`version.mjs`/`shell.mjs` rule reads vendor whitespace or line endings (they read `.html` only, or the checker's JS readers now skip vendor): no extra exclusion needed.

## TEST-RESULTS r1
TREE: 19e847824a66e1e3
CMD: `node tools/check.mjs --all` (0: 16 pages, both executed tests PASS, note « code tiers epingle … sha256 41adb2855b0e…, LICENSE », `--tiers` 4 hosts without cdn.jsdelivr.net); `node tools/check.mjs --forms --a11y --nojs --tiers --seo` 0; `--legal` 0; `node tools/version.mjs --check` 0 (43 refs); `node tools/shell.mjs --check` 0 (10 pages); `git diff --check c2a6025` 0 and `git diff --cached --check` 0; `git grep -n jsdelivr -- . ':!.WIP'` nothing (exit 1); `git diff --name-only c2a6025` = the 8 allowed paths, no other untracked; `.github` vs c2a6025 and workflow vs 670f72f identical.
RESULT: PASS — pin: `certutil -hashfile` working file, `git cat-file blob :…/web.js | sha256sum` staged blob and the `rm` + `git checkout --` round trip all 41adb2855b0e8868b4cf304b20e3ab1f1014e8ed252ec559aaa8d4cd4ed72750; LICENSE staged 29f18026…; `git ls-files --eol` vendor `i/lf w/lf attr/-text`.
NOTES: Mutation ledger `node .WIP/pass-loop-p41/evidence/mutate.mjs <product> <scratchpad>/mut` (archive c2a6025 `-c core.autocrlf=false` + the 8 working files, fresh copy per case, `version.mjs` re-stamped per case so only the intended rule fires): 11/11 as expected — unmodified 0; vendor byte flipped → 1 « empreinte SHA-256 … differente »; LICENSE removed → 1 « licence … absente »; specifier back to jsdelivr → 1 (`--tiers` cdn.jsdelivr.net + test-ia-embeds deepEqual); `.ghost-class` rule + word only in vendor web.js (pin re-set to the mutated hash) → 1 « ghost-class … utilisee nulle part »; own: same + word also in `ia-embeds.js` → 0 (no false FAIL); unpinned `vendor/other/x.js` → 1; specifier `typebot-js-0.10.12` → 1 (test); status guard removed → 1 (test: bare page `calls` 1 ≠ 2); vendor CRLF → 1 (fingerprint); pin entry deleted → 1 « script tiers sans empreinte ».
Rendered `node .WIP/pass-loop-p41/evidence/render.mjs <scratchpad>/render <mode>`, headless Chrome, `python -m http.server 4173 --bind 127.0.0.1` (port free at start), 1200 px: before the click only 127.0.0.1:4173, fonts.googleapis.com, fonts.gstatic.com. LIVE (1 live Typebot open of 2 allowed): `web.js` 200 `text/javascript` from 127.0.0.1:4173; after click hosts 127.0.0.1, typebot.io (2 × startChat), www.youtube.com (bot video); no cdn.jsdelivr.net; bot's first message « En collaboration avec des DRH de PME et ETI… » inside `typebot-standard` shadow `.typebot-container`; same page re-laid at 375: message + video bubble, no element wider than 375 (captures ia-chat-live-1200/375.png). BLOCKED (`--host-resolver-rules` typebot.io + cdn.jsdelivr.net NOTFOUND, `--no-proxy-server`): startChat ERR_NAME_NOT_RESOLVED ×2; Typebot's own « Error! Could not reach server. Check your connection. » in the component, status line hidden: PLAN Done When 4 « indisponible with typebot.io blocked » NOT met as typed (the catch covers SDK load/init failures only; same path as c2a6025, not re-measured there because that needs jsdelivr). LOCALBLOCKED (local web.js refused by `Network.setBlockedURLs`): « La conversation est indisponible ici… » shown, typebot-standard hidden, only 127.0.0.1 contacted.

## Review contact 1 of 2 — fresh auditor (code-audit phase-gate) — GREEN

SCOPE: CLEAN — every changed file traces to PLAN 41 Work 1-5 / Done When 1 (.gitattributes, vendor web.js + LICENSE, ia-embeds.js, check.mjs, test-ia-embeds.mjs, policy sentence, `?v=` stamp). Root ARCHITECTURE.md lines on assets/js/ and tools/ (outside this seal) checked against the diff: accurate.
Done When 4 gap (Coder-declared) graded Tier 3 / DEFERRED_WITH_REASON, not blocking: measured with typebot.io + jsdelivr unresolvable, Typebot's own « Error! Could not reach server. Check your connection. » shows; « indisponible » shows only when web.js itself fails (re-proven, localblocked). The site's catch only sees an `import()` rejection or a synchronous throw; Typebot's server error is rendered inside its component, so with the same bytes loaded from jsDelivr (pre-Pass) the same English error showed. The clause's premise was wrong at planning; already recorded in PLAN 41 Evidence. A French message for "Typebot server unreachable" would be new work (owner's call).
Tier 3 advisory (no fix section, no new review):
- T3-1 `tools/test-ia-embeds.mjs:74-92` — mutation `if (status) status.hidden = true;` → `status.hidden = true;` (`assets/js/ia-embeds.js:30`) survives `check.mjs --all` (exit 0): on the bare page the TypeError is caught after `initStandard`, `calls` = 2 and the mount is shown, so the asserts pass while `ready` stays false (a later reopen would start a second conversation). One more close/reopen asserting `calls` stays 2 would pin it. No shipped page lacks `[data-chat-status]`.
- T3-2 `assets/js/ia-embeds.js:33` — missing space in `status.textContent ='La conversation…'`.
Reviewer scratch: scratchpad/review (mut.mjs, mut.log, rend.mjs, render/*.png, render-*.log). No live Typebot open; network limited to 127.0.0.1 and Google Fonts; nothing edited, staged or committed in either repository.

```json
{
  "token": "f8c2c288",
  "verdict": "GREEN",
  "confidence": "medium",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check && git diff --cached --check && git diff --check c2a6025", "result": "PASS"},
    {"cmd": "node tools/check.mjs --tiers | grep -i jsdelivr (no match; hosts = fonts.googleapis.com, fonts.gstatic.com, typebot.io, www.youtube-nocookie.com)", "result": "PASS"},
    {"cmd": "git grep -n jsdelivr -- . ':!.WIP' (empty, rc 1)", "result": "PASS"},
    {"cmd": "git diff --stat c2a6025 (8 files, 337+/20-, matches brief block and PLAN 41 Done When 1 list)", "result": "PASS"},
    {"cmd": "sha256sum assets/js/vendor/typebot-js-0.10.11/web.js; git cat-file blob :assets/js/vendor/typebot-js-0.10.11/web.js | sha256sum; certutil -hashfile ... SHA256 (all 41adb2855b0e8868b4cf304b20e3ab1f1014e8ed252ec559aaa8d4cd4ed72750; LICENSE 29f1802604e2b84e0d67ab2e7efd977fdb602d3791f8275d6bce11dca1665f53)", "result": "PASS"},
    {"cmd": "git -c core.autocrlf=true cat-file --filters :assets/js/vendor/typebot-js-0.10.11/web.js | sha256sum (pin kept, 0 CR; same blob filtered as --path=assets/js/x.js gets 154 CR, style.css gets 1001 CR)", "result": "PASS"},
    {"cmd": "node review/mut.mjs <product> <scratch> DW3 cases on git -c core.autocrlf=false archive c2a6025 + 8 working files: unmodified 0; vendor byte flip 1 (empreinte SHA-256); LICENSE removed 1; specifier back to jsdelivr 1 (tiers + test-ia-embeds); ghost-class only in repinned vendor web.js 1", "result": "PASS"},
    {"cmd": "node review/mut.mjs own false-PASS hunts: LICENSE emptied 1; pinned web.js deleted 1; unpinned sibling vendor/typebot-js-0.10.12/web.js 1; extra protocol-relative jsdelivr import 1; specifier built from a variable 1; ES module in assets/js/vendorx/ still compiled 1", "result": "PASS"},
    {"cmd": "node review/mut.mjs own false-FAIL hunts: specifier in double quotes 0; classic assets/js/vendor-notes.js 0; README.md inside vendor dir 0", "result": "PASS"},
    {"cmd": "python -m http.server 4173 --bind 127.0.0.1 + node review/rend.mjs blocked 1200 (typebot.io, *.typebot.io, cdn.jsdelivr.net ~NOTFOUND, --no-proxy-server): before click hosts 127.0.0.1 + Google Fonts only; after click web.js 200 text/javascript from 127.0.0.1:4173, no jsdelivr request, typebot.io ERR_NAME_NOT_RESOLVED, no page exception", "result": "PASS"},
    {"cmd": "node review/rend.mjs localblocked 1200 (Network.setBlockedURLs */assets/js/vendor/*): status shows the indisponible message, typebot-standard stays hidden", "result": "PASS"},
    {"cmd": "node review/rend.mjs blocked 375: chat open, typebot-standard shown, no page exception", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 134,943 tokens, 9 min 19 s (558,971 ms), GREEN medium. INVOCATION: pass-auditor subagent (Agent tool, async; id in session only); USAGE BASIS: whole-contact, from the Agent completion notice (40 tool uses). Main session usage unknown.
Reviewer process note: it wrote one stray scratch file `/tmp/x` early and deleted it at once (brief rule 1 says never `/tmp`); everything else under the session scratchpad `review/`; no live Typebot open; product `git status` unchanged.

## CLOSURE
UNIT: p41
DOCS: root PLAN § 41 token Done + evidence pointer (with the Done When 4 « typebot.io blocked » gap named) and ARCHITECTURE `assets/js/`, `tools/`, third-party lines — before review; root PROGRESS (Done, Open, Next Action, Last Verification, Known minor issues) and CHANGELOG entry after GREEN, in the root closure commit. No PRD/README/AGENTS change (no new trap beyond the measured Typebot error behaviour, recorded in PROGRESS).
MIGRATED: final AUTO evidence, mutation ledger, rendered request summary, live-open count (1), verdict GREEN medium and its cost → root PROGRESS Last Verification (Pass 41); what shipped → root CHANGELOG.
NITS: reviewer T3-1 (second status null-guard `ia-embeds.js:30` not pinned by the bare-page test: no reopen after success) and T3-2 (missing space `textContent ='…'` at `ia-embeds.js:33`) + the Done When 4 wording gap (Tier 3, DEFERRED_WITH_REASON) → root PROGRESS Known minor issues (P41), for the Planner to route.
COMMIT: 92650bc2563e5849f77bdfa284e055bcddb55e76 (product work, LOCAL ONLY, not pushed)
