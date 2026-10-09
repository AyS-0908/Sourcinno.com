# Pass p34 — Publications : ordre, vidéo BCI, sans filtres

## STARTUP
- Root main ab7656f measured; Planner inputs saved as root 2e74a1b (PLAN, PRD, PROGRESS, README, prompts/pass33-coder.md deleted, prompts/pass34-coder.md added). outputs/ untracked, never staged.
- Product rebuild opening baseline 0821abe, clean, 49 ahead of origin/rebuild (LOCAL ONLY; no fetch/push).
- Ground clear: PROGRESS has no owed human test or open defect for P33.
- Models: work = unknown (session model not exposed as runtime metadata; declared Opus 5.5 by system prompt only); auditor = inherited defaults (no effort control exposed). PROGRESS Model restriction exception applies.
- Startup values from the Coder prompt: unit p34, decisions-only, audit_launch_cap 2, whole-repo seal (no seal_paths).
- Active time start 17:13 local (`date`).

## SLICE
PLAN § 34 Work 1–3, one turn (~30 min): measured scope = 1 page rewrite (157-line file, ~40 lines change), 2 `git rm`, ~75 lines removed from tools/check.mjs, 1 meta line in contact, 1 thumbnail download, at most one CSS rule, version stamps. Matches the planned size; no split.
- Work 1: publications/index.html = three `article.card` in one column (order BCI → book → LinkedIn), type label + sentence byte-identical to the current fallback, BCI = D2 launcher copied from service-ia-business/index.html:196-201, book/LinkedIn h3 = external link with « → », no hint/filters/data hooks/eyebrows/page <style>, hero sub-line reordered, video.js loaded, collections.js not loaded.
- Work 2: git rm assets/data/publications.json assets/js/collections.js; check.mjs `--data` group, VM test, readJson, allowedArgs entry and run line removed; header line moved under « Groupes RETIRES ». `Script` import stays (used by STRUCTURE and --forms).
- Work 3: contact og:description = meta description text; `node tools/version.mjs`.
- Acceptance order: audit-first (default). No live system touched; LIVE-SAFE contract not applicable (localhost only).
- No MANUAL items: every Done When item is driven by commands or headless Chrome on this machine.

## EXPECTED TESTS
- AUTO-1 DW1 greps from the product folder: hint grep prints nothing; `git ls-files assets/data/publications.json assets/js/collections.js` prints nothing; reference grep (collections.js|publications.json|data-publication|data-prototype) prints nothing; `grep -c 'data-video="GEh_2faSLb0"' publications/index.html` = 1; `grep -c "eyebrow\|publication-book\|publication-profile\|filters" publications/index.html` = 0; `grep -c "venture building" contact/index.html` = 0.
- AUTO-2 `node tools/check.mjs --all` exit 0 with both executed tests PASS; `node tools/check.mjs --data` exit non-zero (« option inconnue ou retiree »); `node tools/version.mjs --check`, `node tools/shell.mjs --check`, `git diff --check`, `git diff --quiet 670f72f HEAD -- .github/` exit 0.
- AUTO-3 evidence/render.mjs post on /publications/ at 1200 and 375 (headless Chrome, YouTube hosts mapped to NOTFOUND, motion no-preference): three cards BCI → book → LinkedIn, same left edge and increasing top; 0 `.chip`; thumbnail naturalWidth > 0; 0 YouTube/ytimg requests before a click; mouse click → exactly one iframe with GEh_2faSLb0; real Tab + Enter → same; two title links + caption link non-zero rects in viewport and topmost when scrolled to; 375 no horizontal overflow; scripts disabled: three cards visible same order, launcher 0×0, caption link visible.
- AUTO-4 Copy pins: the three titles and three sentences byte-identical to `git show 0821abe:publications/index.html` lines 93,96,102-103,108-109 (node script comparing extracted strings).
- AUTO-5 Mutation pins (scratch export in the session scratchpad, never the live tree): `--data` → exit 1; re-added « Consulter » on the page → DW1 hint grep prints it.
- AUTO-6 Network receipt: thumbnail `curl` HTTP code, size, SHA256 recorded below; no other network beyond localhost/Google Fonts.
- Changed files vs coverage: publications/index.html (AUTO-1/3/4, check --all), assets/img/video-pib-bci.jpg (AUTO-3 naturalWidth, STRUCTURE image check), contact/index.html (AUTO-1, check --seo), tools/check.mjs (AUTO-2, AUTO-5), assets/css/style.css if touched (AUTO-3 render, version --check), `?v=` stamps (version --check). None left uncovered.

## RECEIPTS (pre-code)
- Server: own `python -m http.server 4173 --bind 127.0.0.1` from the product folder (4173 was free; 4174 pid 53832 left alone); `curl` + `cmp` SAME on publications/index.html, style.css, video.js, video-pib-bci.jpg before each rendered run.
- Pre captures (before any edit): evidence/captures-pre/ (1200 + 375, full page; JS grid book/BCI side by side, LinkedIn full width, 4 chips).
- Thumbnail: `curl -s -o assets/img/video-pib-bci.jpg https://i.ytimg.com/vi/GEh_2faSLb0/hqdefault.jpg` → HTTP 200, 13,164 bytes, 480×360 JPEG, SHA256 1f3f2f1052b594956b08e4809027f319ba746d7067d0d8aa1975fac169d10297; looked at: real video frame (speaker on stage).

## CHANGED
- publications/index.html: hero eyebrow, section eyebrow « Tout », filters host, count status, JS grid, fallback wrapper, data-publication-* hooks, page <style> removed; one column `div.stack.measure` (68ch → 680 px at 1200, 327 px at 375; left edge = h2), cards BCI (tag, h3, sentence, D2 launcher copied from IA) → book → LinkedIn; h3 links `Title <span aria-hidden="true">→</span>` (arrow hidden from screen readers, accessible name = title); hero sub-line reordered; collections.js → video.js.
- assets/img/video-pib-bci.jpg (new).
- git rm assets/data/publications.json, assets/js/collections.js.
- tools/check.mjs: --data header line moved under « Groupes RETIRES » (header now « en Pass 1, sauf mention »), allowedArgs entry, run line, readJson + checkData (rules + VM render test) removed (75 lines). `Script`/`existsSync` imports kept: still used by STRUCTURE, --forms, --seo.
- contact/index.html:13 og:description = meta description text (line 7).
- assets/css/style.css: one rule `.card .band-figure { margin: var(--space-1) 0 0; }` (band-figure's 3rem bottom margin inside a card).
- `?v=` stamps: `node tools/version.mjs` (42 refs, 16 pages; style.css changed).
- Root docs (other repository, before review): PLAN § 34 status Done + evidence pointer; AGENTS Commands line 20 drops `--data`; ARCHITECTURE lines 11, 12, 26 drop collections.js/publications.json.
- r1 render defect found and fixed in-round: `div.grid.measure` let the launcher's aspect-ratio + min-height (200 × 16/9 = 356 px) widen the grid track → 422 px cards at 375, cut off; `scrollWidth` probe missed it (body `overflow-x: hidden`, emulated innerWidth widened). Fix: `div.stack.measure` (block flow). Probe strengthened to `innerWidth === width`, scrollWidth and every card/figure right edge ≤ width.

## TEST-RESULTS r1
TREE: 4bfaa1bfcf10cd2e
CMD: `DW1 greps (PLAN § 34) ; node tools/check.mjs --all ; node tools/check.mjs --data ; node tools/version.mjs --check ; node tools/shell.mjs --check ; git diff --check ; git diff --quiet 670f72f HEAD -- .github/ ; node p34copy.mjs ; node .WIP/pass-loop-p34/evidence/render.mjs .WIP/pass-loop-p34/evidence/captures-r3 <scratch-profile> post`
RESULT: PASS — DW1: hint grep empty, ls-files empty, ref grep empty, GEh_2faSLb0 = 1, eyebrow|publication-book|publication-profile|filters = 0; check --all exit 0 (16 pages, both executed tests PASS); --data exit 1 « option inconnue ou retiree »; version/shell/diff --check/.github exit 0; copy pin 6/6 SAME + order; render pass=true at 1200 and 375 (cards left 37/37/37 tops 555<1153<1388 w 680; 375 left 24 tops 491<993<1280 w 327; 0 chips; naturalWidth 480; 0 YouTube requests before click; click → 1 iframe youtube-nocookie/embed/GEh_2faSLb0, focused; Tab ×9 / ×4 + Enter → same; 3 links in viewport + topmost; no overflow; scripts off: order kept, cards topmost, launcher 0×0 display none, caption visible, 0 YouTube requests).
NOTES:
- DW1 item 6 UNMET AS TYPED: `grep -c "venture building" contact/index.html` = 1, not 0. The hit is line 19 `og:image:alt` (« …processus, IA et venture building »), the same text on every page's <head>, untouched by this Pass and outside the prompt's bound (contact line 13 only). Line 13 itself: `sed -n 13p contact/index.html | grep -c "venture building"` = 0. Not converted to PASS; routed to the Planner.
- Mutation ledger (scratch export in the session scratchpad, never the live tree): « Consulter » link re-added on publications → DW1 hint grep prints `./publications/index.html:82`; `--data` → exit 1 (live run above); `div.grid.measure` restored → strengthened render probe 375 noOverflow=false, pass=false (the first probe had stayed true on it).
- Captures: evidence/captures-r3/ (final), captures-r2/ (same tree), captures-r1/ (the 422 px defect, kept as receipt); after-click capture shows Chrome's error page inside the frame (YouTube hosts NOTFOUND).

## Reviewer notes - contact 1 (non-blocking, no fix section)
- GREEN on the delivered work: Work 1-3 and Done When 1 items 1-5, 2, 3, 4 re-run and met; SCOPE CLEAN (`.card .band-figure` and the 16 `?v=` stamps = necessary side work; render.mjs = ignored evidence tooling, re-run by the reviewer, not sealed).
- Done When 1 item 6 stays UNMET AS TYPED (`grep -c "venture building" contact/index.html` = 1, hit `:19` og:image:alt, identical on all 10 shell pages). Intent met: contact og:description == meta description. This GREEN does not convert that criterion to PASS: Planner CHECK must amend the wording (target the og:description line) and, if wanted, schedule the site-wide og:image:alt « Venture Building » name in a later pass. Closure PROGRESS must carry it.
- PLAN 34 already says Status Done with an Evidence pointer to PROGRESS Last Verification (Pass 34, unit p34), which does not exist yet (PROGRESS :7 still says « prepared, not started »): closure must write it.
- T3 advisory: Publications page title and meta description still list « livre, essai et LinkedIn » (old order); the BCI thumbnail is 4:3 hqdefault with letterbox bars visible at 375 (same as P32 thumbnails).
- Root FETCH_HEAD was written 2026-10-09 17:13:11, before the Planner commit 2e74a1b and the P34 loop start: outside this Pass, noted only.

```json
{
  "token": "7d0ff036",
  "verdict": "GREEN",
  "confidence": "medium",
  "evidence": [
    {
      "cmd": "git -C \"C:\\Users\\aymar\\AYS_CODING\\code-SOURCINNO_WWW\\current sourcinno site- code\" diff --stat 0821abe && git status --short (20 tracked files = 16 ?v= pages + style.css + check.mjs + 2 staged deletions; 1 untracked assets/img/video-pib-bci.jpg; matches declared slice)",
      "result": "PASS"
    },
    {
      "cmd": "grep -rn \"Voir le \\|Voir la \\|Voir les \\|Consulter\\|Découvrir le livre\\|ouvrir sur YouTube\\|Survol\\|voir le schéma\" --include=*.html --include=*.js . | grep -v \"\\.WIP\\|_v2\" (prints nothing)",
      "result": "PASS"
    },
    {
      "cmd": "git ls-files assets/data/publications.json assets/js/collections.js (prints nothing) ; grep -rn \"collections\\.js\\|publications\\.json\\|data-publication\\|data-prototype\" --include=*.html --include=*.js --include=*.mjs . | grep -v \"\\.WIP\\|_v2\" (prints nothing) ; git grep -n \"collections\\|publications\\.json\\|initPublications\\|initPrototypes\" -- . ':!.WIP' (prints nothing)",
      "result": "PASS"
    },
    {
      "cmd": "grep -c 'data-video=\"GEh_2faSLb0\"' publications/index.html (=1) ; grep -c \"eyebrow\\|publication-book\\|publication-profile\\|filters\" publications/index.html (=0)",
      "result": "PASS"
    },
    {
      "cmd": "node -e (contact/index.html meta description === og:description -> EQUAL=true) ; grep -n \"venture building\" contact/index.html -> only :19 og:image:alt, byte-identical on all 10 shell pages, outside the line-13 bound: DW1 item 6 literal grep stays UNMET AS TYPED (=1, not 0) and is reported as such, not silently passed",
      "result": "PASS"
    },
    {
      "cmd": "node tools/check.mjs --all (exit 0, OK 16 pages, portfolio.test + test-ia-embeds PASS) ; node tools/check.mjs --data (exit 1, option retiree)",
      "result": "PASS"
    },
    {
      "cmd": "node tools/version.mjs --check ; node tools/shell.mjs --check ; git diff --check ; git diff --check 0821abe ; git diff --quiet 670f72f HEAD -- .github/ ; git diff --quiet 670f72f -- .github/ (all exit 0)",
      "result": "PASS"
    },
    {
      "cmd": "curl -s http://127.0.0.1:4173/{publications/index.html,assets/css/style.css,assets/js/video.js,assets/img/video-pib-bci.jpg,contact/index.html} | cmp with working tree (5 SAME; collections.js and publications.json 404)",
      "result": "PASS"
    },
    {
      "cmd": "node .WIP/pass-loop-p34/evidence/render.mjs <reviewer>/captures <reviewer>/chrome-profile post (1200 and 375 pass=true: order BCI->book->LinkedIn same left edge, 0 chips, naturalWidth 480, 0 YouTube requests before click, click and Tab+Enter -> 1 focused youtube-nocookie iframe with GEh_2faSLb0, links in viewport and topmost, no overflow, scripts off: 3 cards, launcher 0x0, caption visible)",
      "result": "PASS"
    },
    {
      "cmd": "node -e (JPEG SOF of assets/img/video-pib-bci.jpg -> 480x360, FFD9 tail, 13164 bytes) ; ancestor walk of every figure.band-figure in service pages -> 0 .card ancestors (new .card .band-figure rule reaches Publications only)",
      "result": "PASS"
    },
    {
      "cmd": "git -C \"C:\\Users\\aymar\\AYS_CODING\\code-SOURCINNO_WWW\" diff (AGENTS.md :20 --data dropped; ARCHITECTURE.md :11 collections.js dropped, :12 assets/data = _v2 only, :26 Publications in HTML; PLAN.md 34 status + Evidence pointer) ; ls assets/data assets/js (no publications.json, no collections.js)",
      "result": "PASS"
    },
    {
      "cmd": "git reflog -3 (product HEAD = 0821abe, no commit) ; git diff --cached --name-status (product: 2 deletions; root: empty, outputs/ unstaged) ; .git/FETCH_HEAD mtime (product 2026-10-03; root 17:13:11, before the 17:14 P34 loop start)",
      "result": "PASS"
    }
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 137,934 tokens, 5 min 38 s, GREEN (confidence medium)
INVOCATION: pass-auditor subagent, contact 1 of 2 (id in the session only)
USAGE BASIS: whole-contact (Agent completion notice subagent_tokens / duration_ms)

## CLOSURE
UNIT: p34
DOCS: root PLAN § 34 status Done + evidence pointer, AGENTS Commands line 20 (`--data` dropped) and ARCHITECTURE lines 11/12/26 (collections.js / publications.json gone), all before review; root PROGRESS (Current Objective, Done, Open, Next Action, Last Verification, Known minor issues) and CHANGELOG entry after GREEN, in the root closure commit. No PRD/README edit.
MIGRATED: final AUTO evidence (r1, TREE 4bfaa1bfcf10cd2e), mutation ledger, rendered measurements, thumbnail receipt, DW1 item 6 unmet-as-typed, verdict GREEN medium and contact cost → root PROGRESS Last Verification (Pass 34); owner-visible summary → root CHANGELOG.
NITS: reviewer notes (DW1 item 6 wording for the Planner; Publications page title and meta description still « livre, essai et LinkedIn » order; BCI 4:3 thumbnail letterbox at 375 like P32; root FETCH_HEAD 17:13:11 predates this Pass) → root PROGRESS Open (DW1 item 6) and Known minor issues (P34 line).
COMMIT: 04ff1d6dc20958d851695c4247ff38d016cf6989 (product rebuild work commit; LOCAL ONLY, not pushed — owner rule)
