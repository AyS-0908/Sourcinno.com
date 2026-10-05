# Pass 26 journal

## SLICE
PLAN26 only; two HTML pages, native srcdoc anchor navigation reused from the video; one implementation turn (~30 active minutes). No CSS/JS/SDK/checker change planned. No manual tests: AI browser observations can prove all embed criteria; existing remote branches/delivery/payment excluded. Opening metadata unavailable; work/reviewer unknown, inherited selected settings under PROGRESS owner exception; no overrides. Two contacts maximum. Product baseline cae3eaa13574071d94a08693776d5b34079bded2; root Planner baseline c325913. Root inherited AGENTS/ARCHITECTURE and private outputs untouched. LIVE-SAFE: only authorised public document/resource loading, no bot answer/lead/payment submission or account write; temporary browser JS/network/touch/viewport overrides restored on exits. Known remote welcome/technical session initialisation is the authorised launch surface, not business-flow delivery proof. Skill sync timer publishes _AI_SKILLS only (HARNESS.md); .WIP ignored, no publication action run.

## EXPECTED TESTS
- AUTO-6 Owner rework checkpoint BEFORE implementation: runnable tools/test-ia-embeds.mjs verifies zero third-party initialisation on load, click-loaded YouTube with origin referrer/inline playback parameters, chat single initialisation/light-theme/preserved public ID, retry after SDK failure. Browser verifies actual inline playback, compact closed chat and opened light conversation, keyboard open/close,375px/1200px; JS-off links remain. New page-local JS/scoped HTML styles/local actual thumbnail allowed by owner's rejection of both integrations; no remote flow edit.
- AUTO-1 Run existing node tools/check.mjs --all, node tools/version.mjs --check and git diff --check at final checkpoint; expect all PASS.
- AUTO-2 Source diff/native assert: only service-ia-business/index.html and politique-confidentialite/index.html, exact URL, iframe immediately below unchanged figure, title/100%/600px, permanent Typebot/contact links, no external SDK; expected exact original figure/header/footer/script bytes and workflow/P9/rollback protection.
- AUTO-3 Browser desktop1200/mobile375: original video/launch/fallback readable, 600px iframe, no horizontal overflow; two inspected captures; real Tab/Enter and touchscreen launch, first existing question/Oui/Non merci visible, keyboard escapes to permanent link. No bot answer submitted.
- AUTO-4 Network before launch zero Typebot/bot resources; after launch record observed domains; privacy text factual. True JavaScript-disabled navigation shows section/video/direct/contact. Temporary Typebot block leaves fallbacks usable; restore browser overrides.
- AUTO-5 Independent reviewer final product/root diff, captures and observations; unchanged status.py imports GREEN; local implementation/durable/record/reset receipts. No remote delivery claimed.

## MANUAL TEST GUIDE
None required for this embed. Existing bot branches, delivery and payment excluded.

## CHANGED
REWORK2026-10-05: Owner rejected both original black blocks; PLAN26/PRD explicit rework checkpoint authorises page-local JS/scoped HTML CSS/official pinned SDK (not React/install), local actual video thumbnail and integration check. Supersedes AUTO2 unchanged figure/no SDK/path bounds only; all other mandatory criteria retained. Product paths: service-ia-business/index.html, politique-confidentialite/index.html, assets/js/ia-embeds.js, assets/img/ai-for-business-video.jpg, tools/test-ia-embeds.mjs. Header/footer/shared scripts/checker untouched. Root PLAN26/PRD correction, PROGRESS/CHANGELOG new current evidence; inherited files/private outputs untouched.
Product: service-ia-business/index.html (+6 lines), politique-confidentialite/index.html (+2/-1 lines). No CSS/JS/checker edit. Root: PLAN26 token/evidence, PROGRESS/CHANGELOG checkpoint only. Two screenshots in own ignored scratch.

## BROWSER OBSERVATIONS
REWORK connected external Chrome extension3/tab2091500319: native keyboard launch YouTube gives elapsed2sec/63sec and Pause control; subsequent screenshot shows changed video frame. Published bot with local previewTheme white/grey/teal, welcome/video/first question/Oui/Non merci visible on375/1200. Real Tab/Enter open and close summary, Shift+Tab exits to existing external-question link; no answers. Chrome Emulation touch=true plus real Input.dispatchTouchEvent touchStart79,431/touchEnd opens summary; this resolves old touch gap. Mobile/desktop scrollWidth<=innerWidth; chat600px. Current captures screenshots/rework-desktop.jpg/rework-mobile.jpg inspected; viewport only, old full-page captures not current proof.
REWORK network: before first click full cursor/no truncation/no further pages, localhost/fonts.googleapis.com/fonts.gstatic.com plus chrome-extension URLs only; no Typebot/SDK/YouTube. After click observed cdn.jsdelivr.net,typebot.io,www.youtube.com,www.youtube-nocookie.com and Google Fonts. Temporary Network block *typebot.io/* actually blocks SDK request (loadingFailed Script/blockedReason=inspector); visible local French error and both fallback links, Tab/Enter contact reaches /contact/. Restore blockedURLs empty and touchfalse. Actual scriptExecutionDisabled true BEFORE navigation shows section/video link/direct/contact; launch button hidden by noscript rule, contact links accessible. Restore false/reload; viewport overrides on both browsers reset. Receiver4174 writes exactly two current JPEG captures and stops after second request. No provider/account changes/answers/lead/payment.
- Cua IAB tab1/localhost:4173/service-ia-business, viewport1200x1000 then375x900/1000. Native srcdoc launch loads exact supplied URL after real Tab then Return; remote title AI for Business, first training introduction/video/question and Oui/Non merci visible; no answer/video playback submitted. Shift+Tab then Tab leaves remote frame to permanent direct link.
- Pre-launch Network.requestWillBeSent cursor captured before reload: no truncated/pending event pages; only localhost/fonts.googleapis.com/fonts.gstatic.com. Remote document after Enter hasUserGesture=true and exact URL. Child Runtime read-only performance resources after launch: typebot.io, s3.typebot.io, static.cloudflareinsights.com, fonts.bunny.net, www.youtube.com. Remote startChat is automatic welcome initialisation, not branch/delivery/payment verification. YouTube nested document observed; no original-video launch.
- Actual JS disabled via Emulation.setScriptExecutionDisabled(true) before reload: #reflexion has no is-visible, rendered opacity1; original video anchor, direct bot and /contact links visible; Enter on nous contacter reaches /contact/. Restored false. Desktop/mobile overflow=false, iframe600px; final captures inspected screenshots/desktop-1200.jpg and screenshots/mobile-375.jpg. Native full-page captures include sticky header at current scroll; screenshot remains evidence of layout, no claim of bot flow completion.
- Actual touch OPEN: Input.dispatchTouchEvent and Input.synthesizeTapGesture unsupported in IAB. Touch emulation flag alone is NOT a touch test; restored disabled. Mobile locator click loads same bot, does not meet actual-touch criterion.
- Provider-block test OPEN: Network.setBlockedURLs accepted but actual remote document still loaded, no loadingFailed; no PASS claimed. Fetch Document interception forbidden by browser-managed navigation. Direct/contact links visibly remain outside iframe; this is fallback source/render evidence, not successful blocked-provider test. Network URL overrides reset empty; JS/touch/viewport reset. No persistent browser setting change.
- Browser opening/reload one call waited423s. Screenshot direct fs save EPERM; authorised local receiver4174 saved exact two capture names, stopped; no remote image transfer. Root first staging attempted from product cwd failed without mutation, then correctly saved Planner inputs c325913. Current metadata/usage unknown. Owner asked to enable Chrome/Edge control for the missing native capabilities, no approval/waiver inferred.

## TEST-RESULTS r1
TREE: 0c5d4b32f25971ba
CMD: `node tools/check.mjs --all`
RESULT: FAIL — 1 problem: service-ia-business/index.html: il faut exactement un <title>
NOTES: Checker counts srcdoc title as a second outer-page title. Remove unnecessary inner title, retain descriptive iframe title; no checker weakening. Browser capability items above remain OPEN.

## TEST-RESULTS r2
TREE: 36c6cb2b0c5f8c93
CMD: `node tools/check.mjs --all; node tools/version.mjs --check; git diff --check`
RESULT: PASS — 16 pages/292 internal links;39 version references; whitespace exit0.
NOTES: Native scope/protection assertions PASS exact two HTML paths, unchanged figure/header/footer/scripts, P9 three hashes/workflow670f72f/rollbacke50e34f. Final inner-title removal refreshed in browser/exact launch anchor preserved; no visual delta. Browser AUTO3 actual touch/AUTO4 blocked-provider proof remain OPEN, so this native PASS is not complete acceptance. No reviewer launched;0of2contacts reserved. Captures inspected before metadata-only title removal, current source-native seal above. Best-effort model/cost/usage unknown.

## PAUSE
DONE: Candidate two-page local embed/privacy complete; source/native/desktop375/keyboard/JS-off/initial network/first question observations pass. Historical protections intact. Planner root c325913; no remote delivery.
NEXT: Resume test with native browser transport supporting actual touch and demonstrable Typebot document blocking; finish exact OPEN observations, fresh review/max2contacts, GREEN/local durable journal/closure/reset. No new unit/criteria change/answer submission. Material time overrun checkpoint under prompt/project rule.
DOCS: PLAN26 In progress/evidence only; PROGRESS current objective/next/verification and CHANGELOG checkpoint corrected. Original criteria/PRD/README/queues/inherited files preserved.

## TEST-RESULTS r3
TREE: 5ed113f0aaaa2902
CMD: `node --experimental-vm-modules tools/test-ia-embeds.mjs; node tools/check.mjs --all; node tools/version.mjs --check; git diff --check`
RESULT: PASS — integration handler/transport checks;16pages294links/8scripts;40version references; whitespace. Fingerprint identical before/after; REWORK browser acceptance above resolves formerly OPEN touch/block. Protection assertions rerun before brief. Remote branches/payments/delivery excluded. No owner manual test owed;0of2audit contacts.

## FRESH AUDIT r1 — 2026-10-05
ARCHIVE NOTE: Force-staging scratch for durable commit49c0c5e temporarily brought the two previously ignored viewport JPEGs into Git's seal discovery (567eff3e1a67a3a5). Their bytes are already independently reviewed/archived in49c0c5e; untrack exactly these two again, preserving local files, restores reviewed coverage5ed113f0aaaa2902. No product/root operational source edit after GREEN; capture proof remains a separately inspected artifact as declared in brief.
AUDIT r1 COST: unknown tokens; approximately15active minutes +624s interrupted browser wait; GREEN/high. INVOCATION: /root/p26_review. USAGE BASIS: unknown; source reviewer completion notice. Runtime model/effort unavailable, inherited defaults; no overrides.
MODE: code-audit phase-gate; contact1of2; inherited runtime model/effort/usage unknown under owner metadata exception.
SCOPE: CLEAN. Two HTML changes and three authorised new assets/test paths requested by PLAN26 owner correction; root own PLAN/PRD/PROGRESS/CHANGELOG delta reviewed separately, outside product seal. Scoped CSS, pinned click-only SDK and privacy CDN wording are necessary side work; no unrelated product code, checker/workflow/shared-source edits.
RESULT: GREEN/high; no Tier1/Tier2 findings; no fix section/test request.
NATIVE: discover_repo inspection.complete=true; integration PASS; --all PASS16pages/294links; versions40refs PASS; both-repo whitespace PASS. Workflow matches670f72f; rollbacke50e34f resolves; root retired-P9 three literal hashes match.
BROWSER: Current rework-desktop.jpg/rework-mobile.jpg inspected. Independent Chrome review tab2091500325 shows click-open light conversation with unchanged welcome/video/question and Oui/Non merci; permanent direct/contact links present. PROGRESS Last Verification supplies durable real keyboard/touch/playback/blocked-SDK/no-JS/network acceptance observations. Extra network-reload probe hung624s and was interrupted, without a failing acceptance observation; subsequent bounded AX/screenshot calls succeeded. No answers submitted. Temporary review tab closed; no JS/touch/network-block/viewport override applied by reviewer, only Network event observation.
LIMITS: Local acceptance only; remote later branches/delivery/payment, account configuration and publication remain excluded. Root post-GREEN PLAN status mutation is outside operational-doc seal; defer to Planner CHECK, closure receipts only in excluded PROGRESS/CHANGELOG.
EFFORT: approximately15active minutes excluding624s tool wait; new/cached tokens and cost unknown;1audit contact consumed.

```json
{
  "token": "380dc8da",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "python C:/Users/aymar/AYS_CODING/_AI_SKILLS/skill-code-audit/scripts/discover_repo.py product-root (inspection.complete=true)", "result": "PASS"},
    {"cmd": "node --experimental-vm-modules tools/test-ia-embeds.mjs", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "git diff --check (root and product)", "result": "PASS"},
    {"cmd": "view_image rework-desktop.jpg and rework-mobile.jpg; Chrome tab2091500325 click106/getAXStateAndScreenshot/getAXState (light welcome and Oui/Non merci)", "result": "PASS"},
    {"cmd": "git diff 670f72f --exit-code -- .github/workflows/deploy-hostinger.yml; git rev-parse --verify e50e34f; Get-FileHash root retired-P9 three named files", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

## CLOSURE
UNIT: p26
DOCS: Root PLAN26/PRD owner correction frozen before review; PROGRESS/CHANGELOG current review/closure receipts committed3a463637851a56b2fcb01b66e0638c698ca6f146. PLAN status token reconciliation awaits Planner CHECK per reviewer, no post-GREEN operational edit.
MIGRATED: Native/integration/browser acceptance, independent GREEN/high/token/fingerprint, protections, current capture paths, model/usage unknown and remote exclusions in PROGRESS P26 rework/Last Verification; visible changes in CHANGELOG. Local-only replaces push under owner publication WAIT.
NITS: none raised; no Tier1/2/3 findings.
COMMIT: 49c0c5e2baf541e908143866fca3ec393bbefb7d
