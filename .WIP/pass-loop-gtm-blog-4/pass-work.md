# Pass 4 - Sourcinno on the engine (gtm-blog PLAN § 4)

Journal of the code-pass loop. Project root of the loop = the product repository
`current sourcinno site- code` (branch `rebuild`). Anchor (Pass base) = `7eb3df92f09f578a2443053dc6a65b89b962d087`.

## STARTUP

- Sources read live 2026-10-16: AGENTS-canonical.md, MEMORY.md, docs-root AGENTS.md / PROGRESS.md / ARCHITECTURE.md, gtm-blog PLAN.md (header, rules, § 4) / PROGRESS.md / SKILL.md / references format.md + profile.md, blog.mjs l. 1-45 + `engineKeys`, blog.test.mjs `FIGURE_TAGS`, the product tools and page lines named by the prompt; code-pass SKILL.md at workbench commit `0b63ecf` (unchanged since Pass 1).
- PRE-FLIGHT: product `rebuild`, clean, HEAD `7eb3df9`, unpushed 50, orphans none, last closure P65 `a4131b8`. Workbench `main`, unpushed 0, closure gtm-blog Pass 3 `cdf10d5`, in flight `.WIP/pass-loop-saas-foundation-98` (another session's, not touched), dirty paths under `skill-saas-foundation/` only. Docs root: ` M PLAN.md`, ` M PROGRESS.md`, ` M README.md`, `D  prompts/pass65-coder.md`, `?? prompts/release-operator.md` (the owner's, as measured by the Planner).
- Deviation from the prompt's re-measure line: `git log --oneline 4c90b84..HEAD` in the workbench shows `82862c0 gtm-blog: …` AND `921ba81 code-plan: relay handoff re-check …` (09:54, the Planner's own doc commit: root `AGENTS.md` one line + four `_AIs_RELAY/` files; nothing under `skill-gtm-blog`, the engine or the product). Read as a Planner doc commit of another skill, not a change of this Pass's inputs: not a stop, named here and in SURPRISES.
- Models: work = `claude-opus-5-5 @ high` (session model id exposed by the runtime: claude-opus-5-5; effort = the owner's launch declaration, not exposed). Auditor = agent `pass-auditor`, declared `model: opus`, `effort: xhigh` in its definition file: declared, not verified.
- Budget: audit_launch_cap 3 (prompt); the site's own AGENTS § Work budget reserves at most TWO contacts per full Pass: planned 1 full + at most 1 delta.
- Before the first edit: the text between `<!-- blog-sync:debut -->` and `<!-- blog-sync:fin -->` of `publications/index.html` saved to `list-before.txt` (600 lines, 51 093 bytes, 12 `<details`); page sha256 `b6bffee2…a748`.

## SLICE

Size: ~1 turn, as planned: one profile file, 12 moved articles with one changed line per picture, 30 moved pictures, one page (markers renamed, two lines), one stylesheet selector, three tool edits, two deletions, docs. No engine code. ACCEPTANCE stays the default order (AUTO -> MANUAL-1 eye check by the agent -> audit is allowed by the prompt's MANUAL placement rule; ACCEPTANCE: OWNER-EYES-FIRST is NOT used: the eye check is the agent's own reading of three captures, done before the audit and ticked by the agent per the prompt).

Work, in order:
1. Profile: `init <tmp> --blog-dir publications` on an empty temp folder, its `blog/profile.json` copied to `blog/profile.json`, the engine keys filled per PLAN (b); owner answers left `?` / empty (`profile` stays red by design, Configure is § 9).
2. Moves (`git mv`): `tools/blog/*.html` -> `publications/articles/`, `assets/img/blog/*` -> `publications/img/`; in the 12 files every `/assets/img/blog/` -> `/publications/img/` (one changed line per picture).
3. Page: the two markers renamed `<!-- gtm-blog:start -->` / `<!-- gtm-blog:end -->` (the engine's; same indentation); `<link rel="stylesheet" href="/publications/blog.css">` after the `style.css` line; `/assets/js/blog.js` line replaced by `<script src="/publications/blog.js" defer></script>`; `node blog.mjs sync .` rewrites the list and writes `publications/blog.css` + `blog.js`.
4. `style.css`: `.chip[aria-pressed="true"]` added to the `.chip.is-active` rule. The `.filters` / `.filters:empty` rules lose their only user (`assets/js/blog.js` built `div.filters`): the reverse census will fail until they go; removing them is the census's own instruction (measured at `test`, named in SURPRISES).
5. Tools: `check.mjs` `runTests()` (blog-sync test out of the list; the `--check` block -> `blog.mjs check <ROOT>`, engine from `GTM_BLOG_DIR` else `../../_AI_SKILLS/skill-gtm-blog` from ROOT; absent = named FAIL with both paths), header comment updated; `blog` + `articles` added to the `SKIP` sets of `check.mjs`, `version.mjs`, `shell.mjs`; `version.mjs` `ASSET_RE` admits `/publications/blog.css|js`; `node tools/version.mjs` run.
6. Deletions (`git rm`): `tools/blog-sync.mjs`, `tools/blog-sync.test.mjs`, `assets/js/blog.js`; `tools/blog/`, `assets/img/blog/` empty after the moves.
7. Proof script `prove-identity.mjs` in the state dir; `verify` with `--out <state dir>/verify`.
8. Docs: docs root (4 files, pathspec commit), workbench (PLAN § 4 token + PROGRESS.md), product docs none (the site keeps its docs at the docs root).

Census choice (PLAN (c)) decided at `test` from the measured census lines: the engine's classes (`blog-tools`, `blog-search`, `blog-chips`, `blog-empty`, `chip`) are written only by `publications/blog.js` at run time (not class tokens of a page; `blog-empty` only on a zero-article list) and `blog.css` is outside `assets/css/`: neither census reads them, so neither a census entry nor a rule is needed IF the census lines confirm it.

Plan question 1 (MANUAL runnable today): MANUAL-1 = the agent reads three PNGs written by `verify`; runnable now (Chrome present, Pass 3 proved `verify` on this machine). No live system.
Plan question 3 (one half first): the identity proof (Done When 3) is the gate on the data half: run right after `sync`, before the tool edits.
Plan question 4 (files no AUTO command reaches): listed under EXPECTED TESTS.
LIVE-SAFE: no live system touched; `verify` serves the product folder on 127.0.0.1 only (outside requests to fonts / Typebot are the page's own, not needed by its 14 checks).

## EXPECTED TESTS

Every command from the product folder; `<engine>` = `C:\Users\aymar\AYS_CODING\_AI_SKILLS\skill-gtm-blog\scripts\blog.mjs`.

- AUTO-1 `node tools/check.mjs --all` — expect: exit 0, a note naming `blog.mjs check` with `12 article(s) (IA 7, Venture Building 4, Startup 1)`, `OK — aucun probleme sur 16 page(s)` (articles not counted as pages); `node tools/version.mjs --check` exit 0; `node tools/shell.mjs --check` exit 0.
- AUTO-2 `node <engine> check .` — expect: `CHECK OK`, `12 article(s)`, `31 picture(s) and 17 link(s)`.
- AUTO-3 `ls tools/blog tools/blog-sync.mjs tools/blog-sync.test.mjs assets/js/blog.js assets/img/blog` — expect: none exists; `ls publications/articles | wc -l` -> 12; `ls publications/img | wc -l` -> 30.
- AUTO-4 identity proof `node .WIP/pass-loop-gtm-blog-4/prove-identity.mjs` — expect: both lengths printed, 12 cards on each side, normalised new text byte-identical to `list-before.txt` (`IDENTICAL`), exit 0; a count other than 12 exits 1.
- AUTO-5 outside-markers hash: sha256 of `publications/index.html` with the list removed, measured after the page edit and before / after `sync` — expect: identical.
- AUTO-6 `git diff --stat -M <anchor> -- publications/articles` — expect: 12 renames, each with only its picture lines changed (one `+` / `-` per picture, 30 picture `src` in all... 31 picture tags counted by `check` as the video thumbnail is reused or counted once per tag: measured, not assumed).
- AUTO-7 `node <engine> verify . --out .WIP/pass-loop-gtm-blog-4/verify` — expect: `VERIFY OK (14 checks)`, exit 0, `desktop.png`, `mobile.png`, `anchor.png`.
- AUTO-8 `node <engine> selftest` (workbench root) — expect: `SELFTEST OK`, 373 cases; `git -C C:\Users\aymar\AYS_CODING\_AI_SKILLS status --porcelain -- skill-gtm-blog/scripts skill-gtm-blog/references` -> empty.
- AUTO-9 absent-engine probe: `GTM_BLOG_DIR=<a folder without scripts/blog.mjs> node tools/check.mjs --all` — expect: exit 1, a FAIL naming both paths tried (RED by name). Run on the live tree is read-only (env var only).
- AUTO-10 engine-refusal reaches `fail`: a COPY of the product in the system temp folder with one article's header broken, `node tools/check.mjs --all` there (with `GTM_BLOG_DIR` set to the workbench engine) — expect: exit 1, a FAIL line carrying the engine's `REFUSED:` text.
- AUTO-11 `grep -rn blog-sync tools/` -> nothing; `grep -rn blog-sync` over the docs-root `AGENTS.md` / `ARCHITECTURE.md` -> only the rewritten history wording, if any (measured).
- AUTO-12 `find . -path ./.git -prune -o -path ./.WIP -prune -o -type d \( -name blog -o -name articles \) -print` after the moves — expect: `./blog` and `./publications/articles` only (the SKIP names hit nothing else).
- AUTO-13 control bytes: `grep -rlP '\x0B|\x0C'` over the docs root `*.md` and `skill-gtm-blog` -> nothing; BOM / raw invisible chars grep over the edited sources -> nothing.
- AUTO-14 `git -C <product> status --porcelain` -> empty at closure; `rev-list origin/rebuild..HEAD | wc -l` -> 50 + this Pass's commits; docs root: the owner's entries unchanged and unstaged, the docs commit lists exactly the four files.
- [x] MANUAL-1 (done by the agent, per the Coder prompt, 2026-10-16, captures of the sealed tree a0205a380e3a2727) the agent opens `verify/desktop.png`, `verify/mobile.png`, `verify/anchor.png` with its image reader — expect: the site's header and footer, search box and chips above the 12 folded cards, the pressed chip filled teal, `anchor.png` with the anchored card open and in view; three lines written here, PNGs kept in the state dir [EYES:judgment]

Why MANUAL-1 is a box: `verify`'s 14 checks prove behaviour; only a look proves the site's look (teal fill, header/footer, layout) — no AUTO check reads the picture (SKILL.md Gotchas).

Changed files and the AUTO command that reaches each:
- `blog/profile.json` -> AUTO-1/2 (`check` reads it).
- `publications/articles/*.html` (12) -> AUTO-2, AUTO-4, AUTO-6.
- `publications/img/*` (30) -> AUTO-2 (pictures), AUTO-3.
- `publications/index.html` -> AUTO-1 (all groups), AUTO-2, AUTO-4, AUTO-5, AUTO-7.
- `publications/blog.css`, `publications/blog.js` (engine-written) -> AUTO-2 (`--check` equality), AUTO-7 (run in Chrome), MANUAL-1.
- `assets/css/style.css` -> AUTO-1 (census), MANUAL-1 (pressed chip teal).
- `tools/check.mjs` -> AUTO-1, AUTO-9, AUTO-10.
- `tools/version.mjs` -> AUTO-1 (`--check` inside), a direct `node tools/version.mjs --check`.
- `tools/shell.mjs` -> AUTO-1 (`--check` inside).
- deleted files -> AUTO-3, AUTO-11.
- docs-root files, workbench PLAN/PROGRESS -> no runner: AUTO-13 (control bytes), AUTO-14 (commit contents), the auditor's reading.

Audit budget: 1 full contact (~215-250k tokens, Passes 1-3) + at most 1 same-auditor delta (~15-25k).

## CHANGED

Product repository (diff against the anchor `7eb3df9`, nothing committed yet):
- `blog/profile.json` (new: `init` skeleton from an empty temp folder + the engine keys of PLAN (b); `extra_tags` proven equal to `FIGURE_TAGS` by a node comparison against `blog.test.mjs`; `site.new_tab_text` null).
- `tools/blog/*.html` -> `publications/articles/` (12, `git mv`; 31 picture `src` lines rewritten `/assets/img/blog/` -> `/publications/img/`, nothing else: `git diff -M --numstat` = 1+1 per picture line; `corporate-venture-building-en-1-mot.html` shows as delete + add in `git diff --stat` because 18 of its 36 lines are picture lines, under git's 50 % rename threshold).
- `assets/img/blog/*` -> `publications/img/` (30, `git mv`, bytes unchanged); `tools/blog/`, `assets/img/blog/` removed once empty.
- `publications/index.html`: markers `<!-- blog-sync:debut -->` / `<!-- blog-sync:fin -->` renamed to the engine's `<!-- gtm-blog:start -->` / `<!-- gtm-blog:end -->` (same indentation; PLAN (a) did not name this, the engine's markers require it); `<link rel="stylesheet" href="/publications/blog.css?v=…">` after `style.css`; `<script src="/publications/blog.js?v=…" defer>` in place of `/assets/js/blog.js`; the list rewritten by `sync` (ids added, picture folder); `?v=` stamps written by `version.mjs`.
- `publications/blog.css`, `publications/blog.js` (new, written by `sync`).
- `assets/css/style.css`: `.chip[aria-pressed="true"]` added to the `.chip.is-active` rule; `.filters` + `.filters:empty` removed (their only user was `assets/js/blog.js`; the reverse census failed on them, measured); `#blog-list > details` added to the `#portfolio` `scroll-margin-top: 80px` rule (MANUAL-1 r1 found the anchored card's tag and title under the sticky header); a section comment's « écrit par tools/blog-sync.mjs » -> « écrit par le moteur gtm-blog ».
- 16 pages: `style.css?v=` restamped by `node tools/version.mjs` (style.css changed); `publications/index.html` also its two new stamps.
- `tools/check.mjs`: header comment; `SKIP_DIRS` + `blog`, `articles`; reverse census reads `publications/blog.js` too; `runTests()`: blog-sync test out, `blog.mjs check <ROOT>` in (engine `GTM_BLOG_DIR` else `../../_AI_SKILLS/skill-gtm-blog`; absent = named FAIL, `return`).
- `tools/version.mjs`: `SKIP` + `blog`, `articles`; `ASSET_RE` admits `/publications/blog.(css|js)`.
- `tools/shell.mjs`: `SKIP` + `blog`, `articles`.
- Deleted (`git rm`): `tools/blog-sync.mjs`, `tools/blog-sync.test.mjs`, `assets/js/blog.js`.

Docs root (third repository, NOT sealed by this loop): `AGENTS.md` (§ Commands l. 19, 23), `ARCHITECTURE.md` (`assets/js/` blog.js clause, `assets/img/` line, `tools/check.mjs` line incl. the SKIP names and the engine call, a new « Blog » component line, State ownership « Page content »), `PROGRESS.md` (one Done line + the « nutschell » owner line's paths), `CHANGELOG.md` (one entry).
Workbench (second repository, NOT sealed by this loop): `skill-gtm-blog/PLAN.md` (§ 4 token -> Done + pointer), `skill-gtm-blog/PROGRESS.md` (written at closure from this journal).
State dir (gitignored, re-tracked at closure): this journal, `list-before.txt`, `list-after.txt`, `prove-identity.mjs`, `verify/` (3 PNG), `verify-r1/anchor-before-scroll-margin.png`.

## MANUAL-1 r1 (agent's eyes, before the audit)

- `desktop.png` (1280 px): site header (logo, menu, « Publications » active) and navy footer present; under « Blog »: search box, chips « Tous » (filled teal, white text), IA, Venture Building, Startup; « 12 article(s) affiché(s) »; 12 folded cards, newest first; « Tout le blog → » below; Inter font.
- `mobile.png` (375 px): same page in one column; box then chips wrapping on two lines; 12 folded cards; no sideways overflow visible.
- `anchor.png` r1: the card `#corporate-venture-building-en-1-mot` open (teal border, grey fill, its pictures) but its tag and title sat UNDER the sticky header (only the date showed). Fixed by `#blog-list > details { scroll-margin-top: 80px }` (the site's own `#portfolio` precedent, Pass 60); r2 `anchor.png`: tag « VENTURE BUILDING », title and « − » fully below the header, card open and in view. r1 capture kept as `verify-r1/anchor-before-scroll-margin.png`.

## TEST-RESULTS r1
TREE: a0205a380e3a2727
CMD: `node tools/check.mjs --all` ; `node tools/version.mjs --check` ; `node tools/shell.mjs --check` ; `node <engine> check .` ; `node .WIP/pass-loop-gtm-blog-4/prove-identity.mjs` ; `node <engine> verify . --out .WIP/pass-loop-gtm-blog-4/verify` ; `node <engine> selftest` (workbench root)
RESULT: PASS — check.mjs exit 0 « OK — aucun probleme sur 16 page(s) », note `blog.mjs check: CHECK OK: 12 article(s) (IA 7, Venture Building 4, Startup 1) read from publications/articles/; 31 picture(s) and 17 link(s) checked` (full output `r1-check.txt`); VERSIONS 41 refs on 16 pages (anchor 40: `blog.js` ref out, `blog.css` + `blog.js` in), exit 0; SHELL 9 pages exit 0; engine `CHECK OK` same counts; proof `IDENTICAL` (before 50 089 chars / 12 cards, new 50 621 / 12, normalised 50 089); `VERIFY OK (14 checks)` ~8 s; selftest 373 cases `SELFTEST OK`; the 5 retired paths absent (5 « cannot access » lines), `publications/articles` 12, `publications/img` 30; `git status --porcelain -- skill-gtm-blog/scripts skill-gtm-blog/references` empty.
NOTES: outside-markers sha256 `b8b28837…8db1` identical before/after `sync`. Census (PLAN (c) choice = no entry, no new rule): forward 133 classes / 160 with rule (anchor 161: `.filters` gone), reverse 160 selectors / 43 scripts read / 0 unused (the engine's classes are script-built, not page tokens; `blog.css` outside `assets/css/`; `.chip` now served by `publications/blog.js` too). Negative runs: `GTM_BLOG_DIR=/tmp/no-such-engine` -> exit 1, FAIL naming that path and the default not tried; a copy two levels under a folder without the engine -> exit 1, FAIL « GTM_BLOG_DIR non defini et chemin par defaut …\gb4-fake\_AI_SKILLS\skill-gtm-blog\scripts\blog.mjs absent »; a temp copy with one header's tag set to « Inconnu » -> exit 1, FAIL carrying the engine's `REFUSED: … etiquette « Inconnu » is not one of the profile's tags …`. Proof mutations on temp copies: one date changed -> exit 1 first difference named; 11 cards -> exit 1; empty saved text -> exit 1 (0 chars, 0 cards printed). `find` (prune .git, .WIP) for dirs named blog/articles -> `./blog`, `./publications/articles` only. Control-byte grep (docs root *.md, skill-gtm-blog) -> nothing; BOM / U+0300-036F byte grep over the edited sources -> nothing. `BLOG_LEGACY_SITE=<product>` selftest: the legacy case now SKIPs by name (« holds no tools/blog/ … »), 373 cases `SELFTEST OK`.

## Audit contact 1 - fresh pass-auditor (code-audit phase-gate) - 2026-10-16

Greenlight - product repository vs Pass base 7eb3df9, no Tier 1 or Tier 2 finding.
- Native checks (run by the auditor): `node tools/check.mjs --all` exit 0 (note `blog.mjs check: CHECK OK: 12 article(s) (IA 7, Venture Building 4, Startup 1) read from publications/articles/; 31 picture(s) and 17 link(s) checked`); `node tools/version.mjs --check` 0; `node tools/shell.mjs --check` 0; engine `check .` CHECK OK; engine `verify . --out <auditor scratchpad>` VERIFY OK (14 checks), captures viewed (header, footer, search + chips above 12 folded cards, « Tous » filled teal, anchored card open below the header, 375 px no sideways scroll); engine `selftest` SELFTEST OK 373 cases; the five old paths absent, `publications/articles` 12, `publications/img` 30.
- Identity: `prove-identity.mjs` IDENTICAL, and re-derived independently against `git show 7eb3df9:publications/index.html` (not only list-before.txt): normalised new list == base list, 12 cards each. Outside the markers: only the blog.css link, the blog.js script line and `?v=` stamps. Each of the 12 articles differs from its base only by its picture lines (residual 0 after the path rewrite); 30 pictures R100; the 15 other pages differ only by the style.css stamp, which equals the file's sha256 prefix.
- Mutations on temp copies (system temp, deleted after): engine missing (bogus GTM_BLOG_DIR, and no default path) -> named FAIL, exit 1; a broken picture in an article -> the engine's REFUSED line reaches the FAIL; blog.css edited -> stale stamp FAIL plus the engine's out-of-date FAIL.
- SCOPE: CLEAN. Necessary side work: marker rename blog-sync:debut/fin -> gtm-blog:start/end (the engine's markers); `.filters` rules removed (their only user was the deleted assets/js/blog.js; the reverse census would go red; selector classes 161 -> 160); the census and the compile now read publications/blog.js (plan (c) option, said in ARCHITECTURE). Unrequested but declared in ARCHITECTURE and CHANGELOG: `#blog-list > details` added to the existing `#portfolio` scroll-margin-top rule (the anchored card sits below the sticky header) - one selector in an existing rule, Tier 3.
- COVERAGE: 69/69 changed paths inspected (67 tracked diff entries + 2 untracked). Partial reads, with reason: publications/blog.css and publications/blog.js (engine output; heads read, byte-currency proven by `blog.mjs check` and the blog.css mutation); tools/blog-sync.mjs and tools/blog-sync.test.mjs (deleted per plan (d); absence and zero remaining references proven by `git grep`).
- Not sealed, checked separately: docs-root diff of AGENTS.md, ARCHITECTURE.md, CHANGELOG.md read, matches (f); the owner's staged `D prompts/pass65-coder.md` is still in the docs-root index, so the docs commit must be the pathspec commit of prompt D(i); workbench `skill-gtm-blog/PLAN.md` diff = the § 4 token only; engine scripts, references, SKILL.md porcelain empty; control-byte grep over the docs root *.md empty; no BOM in the edited product files.
- Owed at closure (not verifiable now, the tree is uncommitted by design): Done When 5. Today `rev-list origin/rebuild..HEAD` = 50 (nothing pushed); the 45 staged product entries are this Pass's own git mv / git rm.
- Tier 3 advisory (NITS, no fix section): (1) the `.chip.is-active` half of the pressed-chip selector has no chip user left (the engine sets aria-pressed only); the census cannot see it because `is-active` lives in site.js; kept since plan (c) said "also matches". (2) The engine selftest's opt-in legacy-site case (BLOG_LEGACY_SITE, needs tools/blog/) can no longer run on the live Sourcinno; it needs a pre-Pass-4 copy such as `git archive 7eb3df9` (engine backlog, for the Planner). (3) version.mjs ASSET_RE, old and new, would match the `.js` prefix of a `.json` URL; no such URL exists today.

```json
{
  "token": "ccc7c1d5",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "node C:/Users/aymar/AYS_CODING/_AI_SKILLS/skill-gtm-blog/scripts/blog.mjs check .", "result": "PASS"},
    {"cmd": "ls tools/blog tools/blog-sync.mjs tools/blog-sync.test.mjs assets/js/blog.js assets/img/blog (none exists); ls publications/articles | wc -l (12); ls publications/img | wc -l (30)", "result": "PASS"},
    {"cmd": "node .WIP/pass-loop-gtm-blog-4/prove-identity.mjs", "result": "PASS"},
    {"cmd": "node indep.mjs <git show 7eb3df9:publications/index.html> publications/index.html (normalised list identical, 12 cards, outside markers only the two planned lines and stamps)", "result": "PASS"},
    {"cmd": "diff of each publications/articles/*.html against 7eb3df9:tools/blog/<same> after the picture-path rewrite (residual 0 for all 12)", "result": "PASS"},
    {"cmd": "git diff 7eb3df9 -- '*.html' ':!publications' ':!tools' (15 style.css stamp lines only, stamp = sha256 prefix)", "result": "PASS"},
    {"cmd": "node C:/Users/aymar/AYS_CODING/_AI_SKILLS/skill-gtm-blog/scripts/blog.mjs verify . --out <auditor scratchpad>/verify", "result": "PASS"},
    {"cmd": "node skill-gtm-blog/scripts/blog.mjs selftest (from the workbench root)", "result": "PASS"},
    {"cmd": "git -C C:/Users/aymar/AYS_CODING/_AI_SKILLS status --porcelain -- skill-gtm-blog/scripts skill-gtm-blog/references skill-gtm-blog/SKILL.md (empty)", "result": "PASS"},
    {"cmd": "git -C C:/Users/aymar/AYS_CODING/_AI_SKILLS diff -- skill-gtm-blog/PLAN.md (section 4 token only)", "result": "PASS"},
    {"cmd": "GTM_BLOG_DIR=C:/nonexistent-gtm node tools/check.mjs --all (expected exit 1 with a named engine FAIL)", "result": "PASS"},
    {"cmd": "temp copy: broken picture in one article, then node tools/check.mjs --all (expected the engine REFUSED line in the FAIL, exit 1)", "result": "PASS"},
    {"cmd": "temp copy: blog.css edited, then node tools/version.mjs --check and node tools/check.mjs --all (expected stale stamp FAIL)", "result": "PASS"},
    {"cmd": "blog.mjs init <empty temp> --blog-dir publications, key-by-key diff with blog/profile.json (only the plan (b) engine keys differ)", "result": "PASS"},
    {"cmd": "git rev-list origin/rebuild..HEAD | wc -l (50, nothing pushed)", "result": "PASS"},
    {"cmd": "grep -rlP '\\x0B|\\x0C' C:/Users/aymar/AYS_CODING/code-SOURCINNO_WWW --include=*.md (empty)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

AUDIT r1 COST: 198 505 tokens, 465 s, GREEN
INVOCATION: ad550f0e531a35537 (agent pass-auditor). USAGE BASIS: whole-contact (subagent_tokens of the Agent tool's completion notice).

## MANUAL TEST GUIDE

Setup: none for the owner. The Coder prompt assigns this eye check to the agent (PLAN § 4 Done When 6): the captures written by `node <engine> verify . --out .WIP/pass-loop-gtm-blog-4/verify` on the sealed tree, read with the agent's image reader.

1. MANUAL-1 — Do: open `verify/desktop.png`, `verify/mobile.png`, `verify/anchor.png`. Expect: header and footer of the site; search box and chips above 12 folded cards; « Tous » filled teal; anchored card open, its title below the sticky header.

Result 2026-10-16 (agent):
- desktop.png: Sourcinno header and navy footer; under « Blog » the search box, chips « Tous » (teal fill, white text) / IA / Venture Building / Startup, « 12 article(s) affiché(s) », 12 folded cards newest first, « Tout le blog → ».
- mobile.png (375 px): one column, chips wrap under the box, the 12 folded cards, no sideways overflow.
- anchor.png: `#corporate-venture-building-en-1-mot` open (− mark, teal border, grey fill), tag, title and date fully below the sticky header, its first picture in view.

## CLOSURE
UNIT: 4
DOCS: product docs none (the site keeps them at the docs root); docs root 6bb29c6 (AGENTS.md § Commands, ARCHITECTURE.md blog lines + Blog component, PROGRESS.md one Done line + the « nutschell » paths, CHANGELOG.md one entry; the owner's uncommitted edits and staged deletion untouched, committed through a temporary index so neither rode in); workbench skill-gtm-blog/PLAN.md § 4 token Done + pointer, skill-gtm-blog/PROGRESS.md (State, Verification Pass 4, Known minor issues, Known Risks, Next Action).
MIGRATED: final AUTO evidence, the identity proof, the census choice, the negative runs, MANUAL-1 observations, verdict GREEN and its cost into skill-gtm-blog/PROGRESS.md § Verification Pass 4; the site-tool lesson into its Known Risks.
NITS: the auditor's three Tier 3 notes (dead .chip.is-active half, legacy-site selftest case now SKIPs, version.mjs pattern vs .json) plus the Coder's PRD row note -> skill-gtm-blog/PROGRESS.md § Known minor issues, « From the Pass 4 auditor's Tier 3 notes ».
COMMIT: cf1d4d7c6486caef4137dea1f130eb5422f59c8b (product rebuild, local only by the owner's rule: no push of this branch)
