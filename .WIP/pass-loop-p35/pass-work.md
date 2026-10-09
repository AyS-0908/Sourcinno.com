# Pass p35 — Publications : blog (instantané du flux Wix)

## STARTUP
- Root main 242294f measured; Planner inputs saved as root c06a7d9 (PLAN, PROGRESS, README, prompts/pass34-coder.md deleted, prompts/pass35-coder.md added). outputs/ untracked, never staged.
- Product rebuild opening baseline de179ff, clean, 52 ahead of origin/rebuild (LOCAL ONLY; no fetch/push).
- Ground clear: PROGRESS has no owed human test or open defect for P34.
- Models: work = unknown (session model not exposed as runtime metadata; declared Opus 5.5 by system prompt only); auditor = inherited defaults (no effort control exposed). PROGRESS Model restriction exception applies.
- Startup values from the Coder prompt: unit p35, decisions-only, audit_launch_cap 2, whole-repo seal (no seal_paths).
- Active time start 17:41 local (`date`).
- Port: 4173 was free; own `python -m http.server 4173 --bind 127.0.0.1` from the product folder (4174 pid 53832 left alone); `curl` + `cmp` SAME before each rendered run.

## SLICE
PLAN § 35 Work 1–3, one turn (~35–40 min): one new dependency-free tool (~110 lines), one page section + head copy, one ~25-line page script, one CSS comment + one rule, version stamps, root docs. Matches the planned size; no split.
- Work 1: `tools/blog-sync.mjs` — fetch the feed (or `--from <file>`), parse items without dependency (CDATA, five XML entities + numeric, unknown entity = exit 1), French = link `/blog/post/`, English `/blog/en/post/` skipped by rule, any other link = exit 1; exactly one category mapped `⚡IA`/`VENTURE BUILDING`/`STARTUP` → « IA »/« Venture Building »/« Startup », else exit 1 naming the item; newest first by pubDate; French date from a month table (UTC, no locale) + `datetime`; titles whitespace-collapsed, HTML-escaped; links kept percent-encoded, `&`/`"`/`<`/`>` escaped in href; writes between `<!-- blog-sync:debut -->` / `<!-- blog-sync:fin -->` keeping the page EOL; missing/doubled marker, fetch failure (HTTP status), zero French items = exit 1 and nothing written; `--check` writes nothing, exit 1 on difference. Not wired into check.mjs.
- Work 2: publications/index.html — section `#blog` (h2 « Blog », `div.stack.measure#blog-list` of `article.card[data-tag]` = `.tags > .tag`, h3 link with P34 arrow markup, `p.card__meta > time`), « Tout le blog → »; title/og:title, meta/og description, hero sub-line = prompt copy; new `assets/js/blog.js` (chips built by script only, « Tous » first and pressed, `aria-pressed` + `.is-active`, `hidden` attribute); style comment « Filtres et étiquettes (blog Publications) » (grep: Portfolio uses none of these classes); `.card[hidden] { display: none; }` needed because `.card { display: flex }` beats the UA `[hidden]` rule; `node tools/version.mjs`.
- List markup chosen: cards (`article.card` in `div.stack.measure`), same as the three cards above; zero new layout CSS.
- Work 3: root AGENTS Commands one line, ARCHITECTURE tools/js/Publications lines, PLAN § 35 status + pointer, all before review.
- Acceptance order: audit-first (default). Live system: read-only GETs of the public Wix feed only (by me with `curl` once, by blog-sync.mjs at run/`--check`); LIVE-SAFE: read-only, writes nothing remote, no mode changed, nothing left behind.
- No MANUAL items: every Done When item is driven by commands or headless Chrome on this machine.

## EXPECTED TESTS
- AUTO-1 DW1 `node tools/blog-sync.mjs --check` exit 0 against the committed page with the LIVE feed (final checkpoint); `--check --from <copy with one French title edited>` exit 1; `--from <copy with one French category renamed>` exit 1 naming the item, page unchanged (`git diff --quiet publications/index.html`); markers removed in a scratch export → exit 1, page unchanged; fetch failure path: `--from` a non-existent file exit 1 and an HTTP error (unreachable URL not used: no extra network) — recorded as code read only.
- AUTO-2 DW2 greps: `grep -c 'href="https://sourcinno.wixsite.com/blog/post/' publications/index.html` = French items at run time (11 on the scratch copy); `grep -c "/blog/en/post/\|⚡\|wixstatic" publications/index.html` = 0; `grep -c "livre, essai et LinkedIn\|Collections pilotees" publications/index.html assets/css/style.css` = 0 each; `grep -rn "wixsite" assets/js` prints nothing.
- AUTO-3 DW3 `node tools/check.mjs --all` exit 0; `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check`, `git diff --quiet 670f72f HEAD -- .github/` exit 0.
- AUTO-4 DW4 `node .WIP/pass-loop-p35/evidence/render.mjs <out> <scratch-profile> post` pass=true at 1200 and 375: blog below the third card; chips exactly « Tous », « IA », « Venture Building », « Startup », « Tous » pressed; mouse click « IA » → only IA posts visible (own rect > 0), others `hidden` 0×0, only « IA » `aria-pressed="true"`; « Tous » restores all; real Tab to « IA » + Enter same, Shift+Tab « Tous » + Enter restores; every `main *` right edge ≤ emulated width; scripts off: every post visible and topmost, 0 chip buttons; 0 wixsite/wixstatic requests (Wix hosts NOTFOUND at the resolver).
- AUTO-5 DW5 no fetch/push/deploy: `git reflog` / remote refs unchanged; `outputs/` never staged (`git diff --cached --name-only` root).
- AUTO-6 Copy pins: title/og:title, meta/og description, hero sub-line, h2, « Tout le blog → » href = prompt copy (grep -c each = expected).
- Changed files vs coverage: tools/blog-sync.mjs (AUTO-1, mutation ledger; not reached by check.mjs by design — tools/ is skipped by the page walk and the JS syntax walk, so `node --check tools/blog-sync.mjs` is added to AUTO-3); publications/index.html (AUTO-2/4/6, check --all); assets/js/blog.js (AUTO-4, check --all syntax walk + --tiers host scan); assets/css/style.css (AUTO-2, AUTO-4 render, version --check); `?v=` stamps (version --check). None left uncovered.

## RESUME
- Session 1 (17:41–~17:50 local) wrote STARTUP/SLICE/EXPECTED TESTS, the code and r1 captures, then stopped before `## CHANGED` (state `code`). Session 2 resumed 17:58 local (`date`), re-read state, journal, diff and new files live; code kept as found after review against PLAN § 35 and the Coder prompt.
- Port: nothing listened on 4173/4174 at resume (`netstat -ano`); own server 127.0.0.1:4173 started for the rendered checks.

## CHANGED
- Product: `tools/blog-sync.mjs` (new, 132 lines), `publications/index.html` (head copy, hero sub-line, `#blog` section with 11 stamped posts, `blog.js` tag), `assets/js/blog.js` (new, 29 lines), `assets/css/style.css` (comment « Filtres et étiquettes (blog Publications) » + `.card[hidden] { display: none; }`), `?v=` stamps on 16 pages (`node tools/version.mjs`).
- Root (docs repo, not in the product seal): AGENTS.md Commands one line; ARCHITECTURE.md `assets/js/` (blog.js), `tools/` (blog-sync.mjs), State ownership Publications line; PLAN.md § 35 status token Done + evidence pointer. PROGRESS.md / CHANGELOG.md at closure.

## TEST-RESULTS r1
TREE: 843a998d0eef78ce
CMD: `node tools/blog-sync.mjs --check` (LIVE feed, 18:02 local) ; `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `node --check tools/blog-sync.mjs` ; `git diff --check` ; `git diff --quiet 670f72f HEAD -- .github/` ; `node .WIP/pass-loop-p35/evidence/render.mjs .WIP/pass-loop-p35/evidence/captures-r2 <scratch-profile> post`
RESULT: PASS — live --check exit 0 « 11 article(s) francais (IA 6, Venture Building 4, Startup 1), 9 anglais ignore(s) »; check --all 0 (16 pages, both executed tests PASS); version 0 (43 refs); shell 0; node --check 0; diff --check 0; .github 0; render pass=true at 1200 and 375 (blog top 1680 > third card bottom 1608 / 1602 > 1550; chips Tous|IA|Venture Building|Startup, Tous pressed; IA click 6 of 11 visible, others hidden 0×0; Tous restores; real Tab ×14 / ×9 to « IA », :focus-visible, Enter, Shift+Tab « Tous », Enter; no element right edge > emulated width; scripts off 0 chips, 11 posts visible + topmost; 0 wixsite/wixstatic requests in all runs, Wix hosts NOTFOUND). DW2: FR links 11; en/⚡/wixstatic 0; old title + old CSS comment 0 / 0; wixsite in assets/js none. Copy pins: title, og:title, meta + og description, hero sub-line, h2 « Blog », « Tout le blog → » href = 1 each; CSS comment = 1; eyebrow 0.
NOTES: Mutation ledger (scratch feed copies in the session scratchpad, base = feed read 2026-10-09 13,506 B): French title edited → `--check` exit 1 naming line 4 of the list; French « STARTUP » → « STARTUPS » (item 19) → exit 1 « categorie inconnue « STARTUPS » », page md5 unchanged; category removed → exit 1 « 0 categorie(s) »; two categories → exit 1; non-CDATA title `&amp; &#33; &#x21; &lt;b&gt;` → decoded and re-escaped (« GPTs &amp; attention ! ! &lt;b&gt; »); `&nbsp;` outside CDATA → exit 1 « entite XML inconnue »; non-Wix link → exit 1; CDATA title with runs of spaces/newline → `--check` exit 0 (collapsed); missing `--from` file → exit 1 ENOENT; unknown option → exit 1. Markers (scratch tree copy of tool + page): both removed → exit 1 « marqueur … trouve 0 fois », page unchanged; `fin` doubled → exit 1 « 2 fois », unchanged; CRLF page → rewritten with 215 CRLF / 0 bare LF. Fetch failure path (HTTP status) = code read only (`res.ok` → `HTTP ${status}`), no extra network. Render pin: scratch site copy without `.card[hidden] { display: none; }` served on 127.0.0.1:4175 → render pass=false (5 « hidden » posts still 680×181 / 327×198). Deviation: write-mode mutation runs hit the real page once (m-ent-ok rewrote it, m-space rewrote it back); md5 335e8d33… identical before/after, `--check --from` exit 0 after. Server 4173 own, `cmp` SAME for page, blog.js, style.css. Captures r2: `evidence/captures-r2/` (pre: `captures-pre/`).

## Reviewer contact 1 — p35 (fresh auditor, code-audit phase-gate)
Greenlight — Done When 1-5 re-run by the reviewer; no Tier 1/2 finding. SCOPE: CLEAN (`.card[hidden]` rule, filter-bar role/aria-label and fail-closed parser guards = necessary side work).
Seal: whole product repo; root docs repo (AGENTS/ARCHITECTURE/PLAN) checked separately by diff review + `git diff --check`, not covered by the seal. Live feed: one curl GET at review time; fetch path exercised offline against a local server on a scratch copy.
Tier 3 (non-blocking, for the Planner):
- T3-1 Dates use UTC as the contract prescribes: 2 of 11 posts (pubDate 22:00Z = midnight Paris) show the day before the Paris date (« 25 octobre 2022 », « 15 août 2022 » vs 26 oct / 16 août). Owner call: `timeZone: 'Europe/Paris'` would match the Wix calendar date.
- T3-2 `assets/js/blog.js:6` chip order = first appearance in the newest-first list; today « IA, Venture Building, Startup », but it reorders if the newest post changes tag. A fixed order would be stable.
- T3-3 `tools/blog-sync.mjs:61` a refused connection prints « fetch failed » without the cause code (e.cause is not a plain error here); exit 1 and no write are correct.
Reviewer scratch: review-p35 under the session scratchpad; Chrome profile deleted.

```json
{
  "token": "b754f2ef",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {
      "cmd": "node tools/check.mjs --all",
      "result": "PASS"
    },
    {
      "cmd": "node tools/version.mjs --check",
      "result": "PASS"
    },
    {
      "cmd": "node tools/shell.mjs --check",
      "result": "PASS"
    },
    {
      "cmd": "git diff --check de179ff ; git diff --quiet 670f72f HEAD -- .github/",
      "result": "PASS"
    },
    {
      "cmd": "curl -sS -o review-p35/feed/blog-feed.xml https://sourcinno.wixsite.com/blog/blog-feed.xml (single live GET, HTTP 200, 13506 B)",
      "result": "PASS"
    },
    {
      "cmd": "node tools/blog-sync.mjs --check --from review-p35/feed/blog-feed.xml (exit 0, 11 FR: IA 6 / Venture Building 4 / Startup 1, 9 EN skipped; page sha256 unchanged)",
      "result": "PASS"
    },
    {
      "cmd": "node review-p35/xcheck.mjs feed page (independent parser: 11 titles, links, tags, ISO and French dates, order match)",
      "result": "PASS"
    },
    {
      "cmd": "node review-p35/mutate.mjs on scratch copies (22 cases: title edit, unknown and missing category, markers removed/doubled/reversed, idempotent write, CRLF kept, entities, non-RSS, no FR item, HTTP 503, refused fetch; all exit 1 with page untouched where expected)",
      "result": "PASS"
    },
    {
      "cmd": "grep -c blog/post href = 11 ; grep -c en/post|emoji|wixstatic = 0 ; grep -c old title/comment = 0 per file ; grep -rn wixsite assets/js = empty",
      "result": "PASS"
    },
    {
      "cmd": "curl 127.0.0.1:4173 + cmp for publications/, blog.js, style.css, site.js",
      "result": "PASS"
    },
    {
      "cmd": "node .WIP/pass-loop-p35/evidence/render.mjs review-p35/captures review-p35/chrome-profile-1 post (1200+375: placement, chips, IA click 6/11, Tous restore, real Tab+Enter, overflow, scripts-off 11 posts 0 chips, 0 Wix requests)",
      "result": "PASS"
    },
    {
      "cmd": "git diff -U0 de179ff on 15 other pages = style.css ?v= stamp only ; untracked = blog.js + blog-sync.mjs only ; nothing staged ; FETCH_HEAD 2026-10-03 ; 52 ahead of origin/rebuild",
      "result": "PASS"
    },
    {
      "cmd": "git -C root diff -- AGENTS.md ARCHITECTURE.md PLAN.md (1+, 3+/3-, 2+/1-) ; git diff --check exit 0 ; outputs/ never in history",
      "result": "PASS"
    }
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 139,526 tokens, 6 min 14 s (373,537 ms, 37 tool uses), GREEN high
INVOCATION: fresh pass-auditor subagent, launched 18:03 local, completion notice received ~18:10
USAGE BASIS: whole-contact (subagent_tokens from the Agent completion notice)

## CLOSURE
UNIT: p35
DOCS: root PLAN § 35 status Done + evidence pointer, AGENTS Commands one line, ARCHITECTURE tools/js/Publications lines (all before review); PROGRESS (Current Objective, Done, Next Action, Last Verification, Known minor issues) and CHANGELOG entry after GREEN, in the root closure commit. No PRD/README edit.
MIGRATED: final test evidence, mutation ledger summary, render results, verdict and review cost → root PROGRESS Last Verification (Pass 35); what shipped → root CHANGELOG.
NITS: reviewer T3-1 (UTC dates show the day before for 2 midnight-Paris posts), T3-2 (chip order by first appearance), T3-3 (refused connection prints no cause code) + owner-copy oddities (« nutschell ») → root PROGRESS Known minor issues.
COMMIT: 5404181 (product work commit, LOCAL ONLY, not pushed)
