# Pass 84 — CATALOGUE C8 — MESURE D'AUDIENCE SANS COOKIE

Journal of the code-pass loop. Source: PLAN § 84 (docs repo), prompt `prompts/pass84-coder.md`. Product branch `mesure` created from bf8e945 (the live version) with `git -c core.autocrlf=false switch -c mesure bf8e945`; Pass base bf8e945 (`state.json` `pass_base` read right after the first `set`). Coder: Claude Code, claude-opus-5-5 high (declared from the session; runtime metadata not exposed). Auditor: Agent pass-auditor, model opus, effort high (declared, prompt STARTUP VALUES). Chained Coder session: nobody watches; minor decisions are written here under DECISIONS.

## PRE-FLIGHT
- `plan.py status` (docs root): branch main, dirty no, unpushed 31 (publish local accepted), closure receipt UNIT 81, orphans none, summary « no pass is waiting on you ».
- Product before the switch: branch `rebuild`, HEAD 3d08502, `git status --short` empty, `git worktree list` = the folder alone, `git ls-files --eol | grep -c w/crlf` 0, `git ls-remote origin main` bf8e945, `node tools/check.mjs --all` exit 0 (`24 page(s) ; 8 redirection(s)`).
- After the switch to `mesure` (= bf8e945): 0 `w/crlf`, `node tools/version.mjs --check` exit 0, `node tools/check.mjs --all` exit 0: `SHELL: … sur 23 page(s) ; 9 redirection(s) ignoree(s)`, `--tiers: 4 hote(s) … : fonts.googleapis.com, fonts.gstatic.com, typebot.io, www.youtube-nocookie.com`, `--seo: meta et sitemap verifies sur 21 page(s) indexable(s)`, `OK — aucun probleme sur 31 page(s).` (the « today on bf8e945 » baseline of Done When 1, read on the branch itself: same commit).
- Python 3.14.7 on PATH (`python`), Node present, `core.autocrlf` true (never changed).

## SLICE
One turn, as planned (PLAN § 84 Work 1-3). Product commits on `mesure`: (1) the tag in `tools/shell/footer.html` + the 23 pages stamped by `node tools/shell.mjs` + the privacy page `<main>` text (one commit, French message); then the journal commit and the reset commit.
- No money, auth, migration or destructive write. Live system: the Umami server is only READ (`GET /script.js`, allowed by the prompt); LIVE-SAFE contract: read-only; the one write a render could cause (`POST /api/send`) is made impossible, not merely intercepted: in render (2) the stats host resolves to NOTFOUND in Chrome and `script.js` is answered from the live bytes downloaded this session (`evidence/umami-script.js`, sha256 recorded), so neither a CORS preflight nor the send can leave the machine; render (1) and (3) load the real `script.js` from the network and must show zero `/api/send`.
- No checker, stamper, CSS or JS change; `version.mjs` not needed (no CSS/JS file changes) — its `--check` is run.
- MANUAL: one box (owner « ok » on the privacy wording incl. « au plus 25 mois »): a promise to visitors and a duration decision, the owner's alone.

## EXPECTED TESTS
Changed files and who reaches them: `tools/shell/footer.html` → AUTO-1 (shell identity), AUTO-2, AUTO-4..6; the 23 stamped pages → AUTO-1, AUTO-2, AUTO-4..6; `politique-confidentialite/index.html` → AUTO-1 (`--tiers` reads its `<main>`, `--legal`, `--a11y`, `--seo`), AUTO-3, AUTO-7. None left uncovered.
- AUTO-1 `node tools/check.mjs --all` (product folder, branch `mesure`, `GTM_BLOG_DIR` unset) — expect: exit 0, `SHELL: … sur 23 page(s) ; 9 redirection(s) ignoree(s)`, `--tiers: 4 hote(s) externe(s) … : fonts.googleapis.com, fonts.gstatic.com, typebot.io, www.youtube-nocookie.com`, `--seo: … sur 21 page(s) indexable(s)`, `OK — aucun probleme sur 31 page(s).`; plus `node tools/version.mjs --check` and `node tools/shell.mjs --check` exit 0.
- AUTO-2 `grep -rlF 'data-website-id="40414ae3-7634-4761-a172-3c7a95d705b6"' --include='*.html' . | grep -v '^\./tools/\|^\./\.WIP/' | wc -l` — expect `23`; `grep -rF 'recorder.js' --include='*.html' --include='*.js' . | wc -l` — expect `0` (`.WIP` included: the downloaded script must not name it either, else noted); the tag line byte-equal to PROGRESS's verbatim code + the two attributes.
- AUTO-3 `grep -c 'Aucun outil de mesure d’audience n’est actif' politique-confidentialite/index.html` — expect `0`; `fontNotice` sentence and « Un seul formulaire de contact est proposé » still present (grep 1 each).
- AUTO-4 render (1) `localhost`, home page, scripts on, reduced motion set — expect: exactly one request to `https://stats.sourcinno.com/script.js`, zero to `/api/send`, `document.cookie` "", `localStorage.length` 0, no `Set-Cookie` in any response header seen.
- AUTO-5 render (2) host `www.sourcinno.com` mapped to the local server, stats host NOTFOUND, `script.js` answered from the live bytes, `Fetch` pause on `*stats.sourcinno.com/*` — expect: one `script.js`, the `/api/send` POST paused once, its payload `website` = `40414ae3-7634-4761-a172-3c7a95d705b6`, `hostname` `www.sourcinno.com`, request failed (reaches nobody), `document.cookie` "", `localStorage.length` 0. If the mapping or the pause cannot be made to work: said here, and the live send left to part C3.
- AUTO-6 render (3) scripts off (`Emulation.setScriptExecutionDisabled`, synchronous evaluate) on the mapped host and on localhost — expect: zero request to `stats.sourcinno.com`.
- AUTO-7 captures of the privacy page at 1200 and 375 (Inter loaded, looked at), no element past the viewport width.
- AUTO-8 `git merge-tree --write-tree --name-only rebuild mesure` — expect exit 0 (no conflict).
- AUTO-9 Done When 3: `git log --oneline bf8e945..mesure` = this Pass's commits; `git rev-parse rebuild` 3d08502; `git ls-files --eol | grep -c w/crlf` 0; `git status --short` empty; after the reset `git ls-files .WIP | grep -c p84` 0.
- [x] MANUAL-1 Owner reads the privacy page text (captures 1200 and 375), told first in plain French what is counted, that there is no cookie, and the promise « au plus 25 mois » with the purge still to build — expect: his « ok » (or a wording change, then AUTO-1..7 re-run; a refusal of 25 months stops the Pass) [EYES:judgment] — confirmed by the owner on 2026-11-02, his words verbatim: « ok, A » (A = text approved with the legal-basis sentence, the 25-month line in « Combien de temps » and « visiteur »: applied in 990e3a6, re-tested r2, reviewed GREEN at contact 2)

Audit budget: one fresh review (cap 2: one confirmation only if FIX), est. 130–195k tokens per contact (prompt).

## SOURCES (privacy facts)
- docs.umami.is, read 2026-11-02: FAQ « Umami's web tracker does not use cookies. »; collects « pageviews, referrer URLs, browsers, operating systems, device types, and approximate location »; /docs/metric-definitions « Visitor identification »: anonymous session identifier = hash of website ID, visitor IP, User-Agent and a rotating salt (monthly by default, `SALT_ROTATION`); the IP is used for that calculation and for approximate location (country, region, city) but « not stored as a field in the analytics session record »; « not a guarantee of absolute anonymity »; /docs/tracker-configuration `data-do-not-track` « disable Umami tracking when the browser exposes an enabled Do Not Track preference », `data-domains` runs the tracker only on the listed domains; /docs/environment-variables: no retention variable.
- Live `https://stats.sourcinno.com/script.js` read 2026-11-02 (`evidence/umami-script.js`, 4,773 bytes, headers `evidence/script-headers.txt`: no `Set-Cookie`): payload fields `website, screen, language, title, hostname, url, referrer, tag, id`; `fetch(…/api/send, {keepalive, credentials: omit by default})`; reads `localStorage` `umami.disabled` only, never writes; checks `doNotTrack`/`msDoNotTrack`; `domains` attribute filter; no `recorder` string.
- Hosting: privacy page line « Le site est hébergé sur un serveur loué chez Hostinger »; PROGRESS Open « Mesure d'audience »: Umami runs as a Coolify service on the same VPS (DNS A of `stats.sourcinno.com` and of `www.sourcinno.com` both 92.112.194.235, read on 1.1.1.1 2026-11-02).
- Retention « au plus 25 mois »: Planner's sentence (CNIL bar), PLAN § Deferred « Measurement — retention purge ».

## DECISIONS
- D1 Retention « au plus 25 mois » sits in § « Cookies et mesure d’audience » only; the « Combien de temps » list is not touched (prompt scope: hero + that section). MANUAL-1 may ask to repeat it there.
- D2 Opposition: the text names the two ways that exist without a new script (constraint): the browser's Do Not Track setting (honoured by `data-do-not-track="true"`, docs.umami.is tracker configuration) and blocking `stats.sourcinno.com` with a content blocker. [ASSUMED, from memory, not re-read this Pass] the CNIL exemption also expects visitors to be able to object; whether DNT + blocking is enough, or an opt-out link is wanted, is the Planner's/owner's call (named in SURPRISES).
- D3 « un identifiant de visite qui change chaque mois », not « anonyme »: docs.umami.is metric-definitions says the identifier is « not a guarantee of absolute anonymity »; monthly = default `SALT_ROTATION` (part A did not set it: [ASSUMED] default kept).
- D4 « Qui y a accès », « Où sont vos données », « Sécurité » (« ni base de données publique ») untouched: still true (statistics read by Sourcinno alone, stated in the cookies section; Umami's database is not public). Mentions légales untouched: its « Données personnelles et cookies » paragraph only points to the privacy page; no fact there became false.
- D5 Render (2) mapping: Chrome 156 headless, `--host-resolver-rules="MAP www.sourcinno.com 127.0.0.1, MAP stats.sourcinno.com ~NOTFOUND, …"` with `python -m http.server 80 --bind 127.0.0.1` (port 80, no `:port` mapping tried). Chrome DOES hand the CORS preflight (`OPTIONS /api/send`, request headers `content-type,x-umami-hostname,x-umami-website-id`) to `Fetch.requestPaused`: it is answered locally (204, headers echoed; the first try with `content-type` only failed CORS on `x-umami-hostname`, nothing sent), then the POST is paused, read and failed. The stats host is unresolvable in that run, so nothing could leave even if a pause were missed.
- D6 `«&nbsp;Do Not Track&nbsp;»`, `«&nbsp;replay&nbsp;»`, `25&nbsp;mois`: a guillemet broke away from its words at 375 px (seen on the first capture); the page's older « … » use plain spaces, left as they are.
- D7 No `version.mjs` run: no CSS or JS file changed; `version.mjs --check` exit 0.

## CHANGED
Product (`git diff --stat bf8e945..mesure`, one commit): `tools/shell/footer.html` +1 (the tag, last child of `<footer class="site-footer">`, after the `.container` `</div>`); the 23 pages stamped by `node tools/shell.mjs` (+1 line each, same line; `blog/article.html` included); `politique-confidentialite/index.html` `<main>`: hero sentence and § « Cookies et mesure d’audience » (1 paragraph → 4). Nothing else (`site.js`, `config.js`, `check.mjs`, `shell.mjs`, `noscript.html`, `header.html` untouched).
Docs repo (root, `main`, committed at closure): PLAN § 84 token On-going; ARCHITECTURE Layering 1 (one sentence: the tag in the footer partial, first-party host skipped by `--tiers`); PROGRESS, CHANGELOG at closure.

## TEST-RESULTS r1
TREE: d87d155d4c387408
CMD: `node tools/check.mjs --all` (product folder, branch `mesure` at bed63fa, GTM_BLOG_DIR unset) ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; the AUTO-2/AUTO-3 greps of EXPECTED TESTS ; `git merge-tree --write-tree --name-only rebuild mesure` ; `git diff --check bf8e945 mesure` ; servers `python -m http.server 4184 --bind 127.0.0.1` and `python -m http.server 80 --bind 127.0.0.1` (each `curl`ed for « ni cookie, ni stockage local », only this tree holds it) ; `node evidence/render.mjs sandbox-local|real-local|mapped|nojs|captures`
RESULT: PASS — AUTO-1 exit 0, `SHELL: … sur 23 page(s) ; 9 redirection(s) ignoree(s)`, `--tiers: 4 hote(s) … : fonts.googleapis.com, fonts.gstatic.com, typebot.io, www.youtube-nocookie.com`, `--seo: … sur 21 page(s) indexable(s)`, `OK — aucun probleme sur 31 page(s).`; version 0, shell 0. AUTO-2 `23`, recorder `0`. AUTO-3 `0`, form sentence 1, Inter sentence 1. AUTO-8 merge-tree exit 0 (tree 6bfbe875). diff --check 0. AUTO-4..7 below.
NOTES:
- `check-all.txt` differs from the bf8e945 baseline by one line only: reverse census `94 → 117 script(s) lus` (the 23 tag elements).
- AUTO-4 (render-real-local.txt, real network, home + privacy page, 1200): stats host requests 1 each = `GET https://stats.sourcinno.com/script.js`; `/api/send` 0; `document.cookie` ""; `localStorage.length` 0; `sessionStorage.length` 0; Set-Cookie seen none (live script response included); browser cookie jar empty; script errors none. Same in sandbox (render-sandbox-local.txt).
- AUTO-5 (render-mapped.txt): `location.host` `www.sourcinno.com` (port 80 + resolver MAP, D5); per page one `script.js`, one POST `/api/send` paused and failed (`net::ERR_BLOCKED_BY_CLIENT`), home also one preflight answered locally; payload `{"type":"event","payload":{"website":"40414ae3-7634-4761-a172-3c7a95d705b6","screen":"800x600","language":"fr-FR","title":…,"hostname":"www.sourcinno.com","url":"http://www.sourcinno.com/","referrer":""}}`; cookie "", localStorage 0, jar empty, Set-Cookie none. Stats host NOTFOUND in that run: nothing reached Umami.
- AUTO-6 (render-nojs.txt, 375): localhost and mapped host, tag element present (1), stats host requests 0.
- AUTO-7 (render-captures.txt): privacy page 1200 (4,535 px) and 375 (7,003 px), Inter loaded and h1 in Inter (looked at), no element past the width, `.reveal` opacity 1; `evidence/privacy-1200.png`, `privacy-375.png` (stitched from 2,500 px tiles).
- `navigator.doNotTrack` null in headless: the DNT path is not exercised by these renders (read in the script: `doNotTrack`/`msDoNotTrack` → no send when `data-do-not-track="true"`).
- Not covered: a real visit recorded by Umami (part C3, operator), any browser but Chrome, a real DNT-enabled browser.

## AUDIT — review contact 1 of 2 (fresh auditor, code-audit phase-gate, 2026-11-02)
Greenlight — the tag is the last child of `footer.site-footer` on exactly the 23 shell pages, the privacy text matches docs.umami.is and the live script.js, and every native check passes. Scope: CLEAN. Coverage: 24/24 changed files read, skipped: none. Docs repo (separate, not sealed): `git diff` ARCHITECTURE.md Layering 1 (claims re-checked: check.mjs:898, probe below) and PLAN.md § 84 token On-going, read.
Tier 3 advisory (closure notes / MANUAL-1, no fix round):
- Privacy page states no legal basis for the audience measurement (only the form's consent is named); GDPR art. 13 asks one per purpose. Choosing it (e.g. legitimate interest) is the owner's call: ask at MANUAL-1.
- « identifiant de visite qui change chaque mois »: Umami's monthly-salted id is the visitor/session id (a visit id uses an hourly salt); true in substance, wording could say « de visiteur ». Monthly assumes SALT_ROTATION left at default (not verifiable without the VPS).
- « Combien de temps » list omits the 25-month line (it sits in « Cookies et mesure d’audience »); Umami self-hosted keeps data indefinitely (docs FAQ): the promise rests on PLAN § Deferred « retention purge » (deadline recorded).
- Operator C4 (read only): a textually clean merge (`git merge-tree` exit 0) leaves service-venture-building/index.html without the tag (`shell.mjs --check` reports it) until `node tools/shell.mjs` runs; `merge --no-ff` auto-commits that red tree first. Re-stamped on an archive of the merged tree: `check.mjs --all` OK, SHELL 24 pages, 22 indexable. Suggest `--no-commit` or « restamp even on a clean merge ».
- `--tiers` skips every host ending in sourcinno.com, so no check guards the stats-host disclosure (declared in ARCHITECTURE).
Probe (stats host mapped NOTFOUND at the resolver, script.js fulfilled from the live copy, every other stats request failed: nothing reached stats.sourcinno.com): www.sourcinno.com host → 1 script.js, 1 send attempt (blocked at preflight), document.cookie empty, 0 cookies, localStorage/sessionStorage 0, on home, article and privacy page; DNT=1 → no send; 127.0.0.1 → no send (data-domains); scripts off → no stats request.

```json
{
  "token": "2165c8ad",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all (branch mesure): exit 0, SHELL 23 page(s) ; 9 redirection(s), --tiers 4 hote(s), 21 page(s) indexable(s)", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check ; node tools/shell.mjs --check ; git diff --check bf8e945..mesure", "result": "PASS"},
    {"cmd": "grep -rlF 'data-website-id=\"40414ae3-7634-4761-a172-3c7a95d705b6\"' --include='*.html' . excluding tools/ and .WIP/ | wc -l -> 23, same file set as <footer class=\"site-footer\">", "result": "PASS"},
    {"cmd": "git diff -U1 bf8e945..mesure excluding privacy page: 23 identical added tag lines, each followed by </footer>", "result": "PASS"},
    {"cmd": "grep -rF 'recorder.js' --include='*.html' --include='*.js' . | wc -l -> 0 ; grep -c 'Aucun outil de mesure d’audience n’est actif' politique-confidentialite/index.html -> 0", "result": "PASS"},
    {"cmd": "git ls-files --eol | grep -c w/crlf -> 0 ; git rev-parse rebuild -> 3d08502 ; git log --oneline bf8e945..mesure -> bed63fa only ; git merge-base --is-ancestor origin/main mesure -> 0 ; git diff --quiet 670f72f mesure -- .github/workflows/deploy-hostinger.yml -> 0", "result": "PASS"},
    {"cmd": "git merge-tree --write-tree rebuild mesure -> exit 0 ; archive of merged tree + node tools/shell.mjs + node tools/check.mjs --all -> OK, SHELL 24 pages, 22 indexable", "result": "PASS"},
    {"cmd": "node probe.mjs (headless Chrome, MAP stats.sourcinno.com ~NOTFOUND, Fetch fulfils script.js from live copy, fails all else): www host 1 send attempt no cookie no storage; DNT no send; 127.0.0.1 no send; scripts off no request", "result": "PASS"},
    {"cmd": "curl https://stats.sourcinno.com/script.js (4773 bytes, no Set-Cookie): payload website/screen/language/title/hostname/url/referrer, localStorage read only, credentials omit, DNT and data-domains honoured, no recorder", "result": "PASS"},
    {"cmd": "WebFetch docs.umami.is metric-definitions, faq, tracker-configuration: IP hashed with monthly salt not stored, browser/OS/device/country/region/city derived, no cookies", "result": "PASS"},
    {"cmd": "Resolve-DnsName stats.sourcinno.com and www.sourcinno.com -> both 92.112.194.235 ; curl -I https://www.sourcinno.com/ -> no Content-Security-Policy header", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 153,222 tokens, 523.5 s (8 min 44 s), 42 tool uses, GREEN
INVOCATION: a1ce19be9148f055a (Agent pass-auditor, model opus) · USAGE BASIS: whole-contact (task notification `subagent_tokens`)

## MANUAL TEST GUIDE
Precondition: none (the agent made the captures; nothing is online, nothing to install).
1. MANUAL-1 — Do: read the « Cookies et mesure d’audience » section on the two captures `evidence/privacy-1200.png` and `evidence/privacy-375.png` (sent in the chat), after the plain-French summary. Expect: you answer « ok », or name the words to change; the 25-month promise (purge still to build) and the legal basis of the measurement (auditor Tier 3 #1) are put to you as two questions in the same message.

## OWNER ANSWER (MANUAL-1 stop, 2026-11-02)
Asked: approve the text, the « au plus 25 mois » promise (purge still to build, PLAN § Deferred) and the legal basis; option A = text approved + legal basis « intérêt légitime » sentence + 25-month line in « Combien de temps » + « visiteur » instead of « visite » (auditor Tier 3 #1-#3). His words verbatim: « ok, A »
- D8 Option A applied (commit 2 on `mesure`): § Cookies gains `<p><strong>Base légale</strong>&nbsp;: l’intérêt légitime de Sourcinno à connaître la fréquentation de son site.</p>` (same shape as the form's « Base légale » paragraph); « Combien de temps » gains `<li><strong>Statistiques de visite</strong> &mdash; conservées au plus 25&nbsp;mois.</li>` (first after the contact messages); « identifiant de visite » → « identifiant de visiteur » (docs.umami.is: the monthly-salt identifier is the visitor/session id). Code changed after GREEN → `test`, then the confirmation contact on this delta.

## TEST-RESULTS r2
TREE: b3a2b2fa0d643d82
CMD: same commands as r1 on `mesure` at 990e3a6 (`node tools/check.mjs --all`, `version.mjs --check`, `shell.mjs --check`, AUTO-2/3 greps + `grep -c 'Base légale'` / `'au plus 25&nbsp;mois'`, `git merge-tree --write-tree --name-only rebuild mesure`, `git diff --check bf8e945 mesure`, `git ls-files --eol | grep -c w/crlf`, servers `curl`ed for « Statistiques de visite », `node evidence/render.mjs sandbox-local|real-local|mapped|nojs|captures`)
RESULT: PASS — check exit 0 (`23 page(s) ; 9 redirection(s)`, `--tiers: 4 hote(s)` same four, `21 page(s) indexable(s)`, `OK — aucun probleme sur 31 page(s).`); version 0, shell 0; tag 23, recorder 0, old sentence 0, form 1, Inter 1, « Base légale » 2 (form + measurement), « au plus 25&nbsp;mois » 2; merge-tree exit 0; diff --check 0; w/crlf 0.
NOTES:
- Renders identical to r1: localhost (sandbox and real network) 1 `script.js`, 0 send; mapped host 1 send per page paused and failed, `website` = the ID; nojs 0 stats request; Set-Cookie none ×8, cookie jar empty ×6, localStorage 0 ×6.
- Captures: privacy 1200 (4,642 px) and 375 (7,165 px), Inter, no overflow; the three option-A changes seen on the 1200 capture.
- D9 Contact 2 after a code change post-GREEN: `brief --resume` is refused (needs a FIX), so plain `brief`; sent to the SAME auditor (SendMessage, it holds the r1 context) because the delta is 3 sentences of one file and this is the last contact; scope names r1's coverage and the new commit explicitly.

## AUDIT — review contact 2 of 2 (same auditor, code-audit phase-gate, 2026-11-02)
Greenlight — 990e3a6 changes politique-confidentialite/index.html only, by exactly the owner's option A (legal basis « intérêt légitime » paragraph, « Statistiques de visite — au plus 25 mois » in « Combien de temps », « identifiant de visiteur »); bed63fa untouched since r1 (`git diff --name-only bed63fa..mesure` = the privacy page only); every check passes on the new tip. Scope: CLEAN. Coverage: 1/1 new changed file read (24/24 for the slice), skipped: none. The three r1 Tier 3 points #1-#3 are closed; #4 (operator C4 restamp on a clean merge) and #5 (`--tiers` skips sourcinno.com hosts) stay advisory for the Planner.

```json
{
  "token": "fc6e3aa2",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "git diff bed63fa 990e3a6 ; git diff --name-only bed63fa..mesure -> politique-confidentialite/index.html only, 3 added lines and 1 changed line matching option A", "result": "PASS"},
    {"cmd": "node tools/check.mjs --all (branch mesure at 990e3a6): exit 0, SHELL 23 page(s) ; 9 redirection(s), --tiers 4 hote(s), 21 page(s) indexable(s), OK on 31 pages", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check ; node tools/shell.mjs --check ; git diff --check bf8e945..mesure ; git ls-files --eol | grep -c w/crlf -> 0", "result": "PASS"},
    {"cmd": "git rev-parse rebuild -> 3d08502 ; git merge-tree --write-tree rebuild mesure -> exit 0 ; git merge-base --is-ancestor origin/main mesure -> 0 ; git diff --quiet 670f72f mesure -- .github/workflows/deploy-hostinger.yml -> 0", "result": "PASS"},
    {"cmd": "tag grep -> 23 ; recorder.js grep -> 0 ; old sentence -> 0 ; grep -c 'Base légale' -> 2 ; grep -c 'au plus 25&nbsp;mois' -> 2 ; grep -c 'identifiant de visite ' -> 0", "result": "PASS"},
    {"cmd": "node probe.mjs on 990e3a6 (stats host NOTFOUND, script.js fulfilled from live copy, all else failed): www host send attempt blocked at preflight on home/article/privacy; DNT no send; 127.0.0.1 no send; scripts off no stats request; no cookie, storage 0", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: 175,022 tokens cumulative for the resumed auditor (r1 153,222 → about 21,800 for this contact), 104.8 s, 8 tool uses, GREEN
INVOCATION: a1ce19be9148f055a resumed by SendMessage · USAGE BASIS: cumulative (task notification `subagent_tokens`)

## CLOSURE
UNIT: 84
DOCS: PLAN § 84 token Done + evidence pointer (no commit id), MANUAL-1 ticked; ARCHITECTURE Layering 1 (tag in the footer partial, `--tiers` skips `*.sourcinno.com`; before the review); PROGRESS (Done « Pass 84 », Open « Mesure d'audience » built, Next Action 1, Last Verification, Known minor issues P84); CHANGELOG (owner entry 2026-11-02); AGENTS § Gotchas one line (a render on `www.sourcinno.com` counts a real visit; resolver + Fetch recipe; written after GREEN, docs repo, bookkeeping per the Coder prompt D). Docs repo commit on `main`, not pushed (`publish: local`).
MIGRATED: final evidence (check lines, render results, merge-tree), the two GREEN verdicts and their cost, MANUAL-1 « ok, A » → PROGRESS Done « Pass 84 » and Last Verification.
NITS: auditor Tier 3 #4-#5 (C4 re-stamp after a clean merge, `--tiers` blind to the stats host) + Coder notes (SALT_ROTATION default assumed, opposition = DNT/blocking, DNT not exercised by the Coder's renders) → PROGRESS Known minor issues « P84 »; #1-#3 fixed (owner option A, 990e3a6).
COMMIT: 990e3a6
