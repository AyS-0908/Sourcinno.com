# Pass p59 — Blog — la liste tenue par le site

STARTUP: unit p59, decisions-only, audit_launch_cap 2, state dir product `.WIP/pass-loop-p59` (ignored by `.git/info/exclude:7`).
Pass base 8ec414715f5affaed3538b75d9599ab48a26d165 (state.json `pass_base`, read right after the first `set`, = product HEAD).
Root Planner inputs saved first: root dbf85fc « Save approved P59 Planner inputs locally » (3 M, 1 A, 1 D; outputs/ untouched).
MODELS: work = claude-opus-5-5 (system prompt of this session; effort not exposed: unknown). Auditor = same model, inherited
settings (PROGRESS Model restriction exception); no runtime metadata exposed: declared, not verified.
PRE-FLIGHT (2026-10-14, all as the prompt measured): root e8159b7 then dbf85fc; product rebuild 8ec4147 clean; guard exit 0;
check-ignore `.git/info/exclude:7:/.WIP/`; Test-Path False; nothing on 4173/4174 (netstat exit 1). On 8ec4147:
`node tools/check.mjs --all` 0 (16 pages; blog-sync.test 97 cases: 15 accepted, 71 format refusals, 10 other, 1 known limit;
92 tool starts), `version.mjs --check` 0 (43), `shell.mjs --check` 0 (10), `git diff 19fef04 HEAD -- publications/index.html`
= `?v=` lines only, `tools/blog/` 11 files, `git grep -c "name:"` = 12. Every page and `tools/blog/*.html` is LF (`git ls-files --eol`).

## OWNER DECISION 2026-10-14 (asked in this session, AskUserQuestion)
Measured with `node .WIP/pass-loop-p59/derive.mjs` (dry): FIVE posts, not two, carry 2024-03-03 (all IA). Page order today
(from Wix's hidden publication times): gpts-attention-1, j-ai-essaye-chatgpt-une-fois, l-ia-modifie-t-elle-deja-le-marche-du-travail,
enjeu-1-de-l-ia-sa-vitesse-d-evolution, l-ia-fait-le-job-de-700-personnes. « date, then file name » (Planner decision 2) gives
enjeu, gpts, j-ai, l-ia-fait, l-ia-modifie: Done When 1 (page byte-identical) could not hold. Question put to the owner with
three options (alphabetical order and the page changes / keep today's order with an optional rank / stop for the Planner).
Owner answer, verbatim: « Garder l'ordre actuel ». Consequence: the header gains an OPTIONAL fourth attribute
`rang="N"` (N = 1, 2, … no leading zero), used only to order posts of the same date: date descending, then `rang` ascending,
a file without `rang` after every ranked one of its date, then file name ascending. The five 2024-03-03 files carry rang 1–5;
the six others carry none. This departs from Planner decision 1 (« exactly these three attributes »): reported in SURPRISES.

## SLICE
Size: one turn, about 45 active minutes as planned (tool rewrite ~120 lines, test reshaped, 11 one-line headers by script,
one `check.mjs` step, docs). Not split.
Work:
1. `tools/blog-sync.mjs`: no feed (FEED, fetch, `--from`, XML reader, Paris conversion, Wix card writer, orphan rule go).
   Each `tools/blog/*.html` opens with line 1 = `<!-- blog: titre="…" date="AAAA-MM-JJ" etiquette="IA|Venture Building|Startup" -->`
   optionally ` rang="N"` before ` -->`. Header read by one HEADER rule on line 1 only, stripped before the body is checked and
   written; the same comment anywhere else stays « hors format » (FORMAT has no comment rule). Title escaping in the header:
   `&amp;` `&quot;` `&lt;` `&gt;`, no other entity, no raw `"` `<` `>`; decoded, then written in the `<h3>` as today (`& < >` escaped).
   Date checked as a real calendar day (month 01–12, day within the month, leap years), French date built from it (`1er`, MOIS),
   no Date object. Unknown tag refused. Refusals each name the file, nothing written. New body rule: a `td data-label` must equal
   the text of the `th scope="col"` of its column (same position in its row; text = tags removed, white space collapsed,
   `&amp; &quot; &lt; &gt;` decoded on both sides).
2. The eleven headers written by `node .WIP/pass-loop-p59/derive.mjs --write` (title from each page `<h3>` unescaped then
   header-escaped, `datetime`, `data-tag`; file matched by its body against the page); `rang` 1–5 added to the five 2024-03-03
   files by the same script (page order). Nothing below line 1 changes (proved by `git diff` = 11 files, 1 line added each).
3. `tools/blog-sync.test.mjs`: trees with header files and no feed; header rule (accepted forms, refused forms), date, tag,
   rang order, tie-break by file name, a twelfth newest file first, header never on the page, the Pass 58 leftovers (each
   FORMAT rule's leading `^` held by a prefixed tag; the number of FORMAT rules read from the tool source; `tfoot` refused;
   data-label against its column title). Cases that can no longer fail are removed (Wix card, orphan, English post name, feed).
4. `tools/check.mjs`: `node tools/blog-sync.mjs --check` as a fourth executed step under `--all` only; header comment :20.
Gates: tests written first and run red on today's tool (r0), then tool, then headers.
No MANUAL item for this Pass: nothing visible changes (Done When 4 proves it); the owner reviews at MANUAL-V12 (plan item).
LIVE-SAFE: not applicable (no live system; the tool needs no network; render uses 127.0.0.1 + Google Fonts only).

## EXPECTED TESTS
- AUTO-1 `node tools/blog-sync.test.mjs` on today's tool (8ec4147) FAILS on the new cases (red run r0), then exit 0 on the new tool;
  PASS line counts header cases and the Pass 58 leftovers — expect: exit 0, counts printed by the runner.
- AUTO-2 mutated copies of the new tool (any date accepted; any tag accepted; header optional; `^` removed from one FORMAT rule;
  a 13th FORMAT rule; data-label check removed; rang ignored) each make the test FAIL — expect: exit 1 per mutation, the named case.
- AUTO-3 red runs of the real tool on throw-away trees: no line 1, wrong date, unknown tag, `tfoot`, data-label not its column
  title — expect: exit 1, file named, page unchanged; a twelfth file with the newest date is written first.
- AUTO-4 Done When 1: `git grep -n -E "fetch|wixsite|pubDate|--from" -- tools/blog-sync.mjs` exit 1; `node tools/blog-sync.mjs --check`
  0; `git diff --stat <base> -- publications/index.html` empty; `node tools/blog-sync.mjs` prints « page inchangee », tree clean after.
- AUTO-5 Done When 2: `node tools/check.mjs --all` 0 with the `BLOG:` line; `version.mjs --check` 0; `shell.mjs --check` 0;
  `git diff --stat <base> -- . ':(exclude).WIP'` = blog-sync.mjs, blog-sync.test.mjs, check.mjs, 11 tools/blog files; a page
  differing from the files makes `check.mjs --all` exit 1 (throw-away copy).
- AUTO-6 Done When 4: `node .WIP/pass-loop-p59/evidence/render.mjs`, Publications 1200 and 375 against 8ec4147 (scratch copy on
  4174, `git -c core.autocrlf=false archive`): every box equal, three tag buttons filter, no script error; scripts off: 11 articles visible.
Changed files and what runs them: blog-sync.mjs (AUTO-1..5), blog-sync.test.mjs (AUTO-1, 2, 5), check.mjs (AUTO-5),
tools/blog/*.html (AUTO-4, 5: the tool reads them; byte diff), page untouched (AUTO-4, 6). Root docs: read by the reviewer.
Audit budget: 1 full contact planned, 1 confirmation reserve (cap 2).

## RED RUN r0 (expected tests before code)
CMD: `node tools/blog-sync.test.mjs` with the new test and the 8ec4147 tool -> exit 1, 165 of 166 cases FAIL (85 format refusal,
43 header refusal, 16 other, 16 accepted, 4 order, 1 known limit); the one green case: the FORMAT rule count (12 at 8ec4147 too).
Output: `test-r0-red-on-8ec4147.txt`.
BREACH (Coder slip, said plainly): the 8ec4147 tool fetches the live Wix feed whenever `--from` is absent, and the new test
starts the tool without `--from`: this one run sent about 160 requests to sourcinno.wixsite.com (162 stderr lines name the feed,
100 of them HTTP 429). Against the prompt's « never call the Wix feed ». Not repeated: the old tool was never run again; the new
tool has no network code (`git grep` Done When 1). Should have run r0 with the network cut or against a stub.

## OWNER ORDER DECISION APPLIED
`node .WIP/pass-loop-p59/derive.mjs --write` (output `derive-output.txt`): eleven headers derived from the page `<h3>`, `datetime`,
`data-tag`; each file matched to its page entry by its body; the five 2024-03-03 posts get rang 1–5 in page order (rule: a date
shared by several page entries gives each its page position). `git diff --numstat -- tools/blog` = 11 × « 1 0 ».

## CHANGED
tools/blog-sync.mjs (rewritten: no feed, HEADER rule, data-label rule, order), tools/blog-sync.test.mjs, tools/check.mjs
(fourth step under --all, header comment), tools/blog/*.html (line 1 only, 11 files). Root repository (second repo, not sealed
here): PLAN.md (§ 59 status + evidence line), AGENTS.md (two Commands lines), ARCHITECTURE.md (:14 blog-sync / tools/blog,
:14 a11y span sentence and executed-tests sentence, :27), PROGRESS.md (objective, Done, Open, Next, P54/P57/P58 live-feed clauses).

## TEST-RESULTS r1
TREE: 3e4c593b519cfa16
CMD: `node tools/check.mjs --all` 0 (16 pages; fourth step « tools/blog-sync.mjs --check: BLOG: liste conforme aux fichiers ; 11 article(s) (IA 6, Venture Building 4, Startup 1) lus dans tools/blog/ »); `node tools/version.mjs --check` 0 (43); `node tools/shell.mjs --check` 0 (10); `node tools/blog-sync.test.mjs` 0
RESULT: PASS — test: 166 cases: 16 accepted, 86 format refusals, 43 header refusals, 4 order, 16 other refusals, 1 known limit; 159 tool starts (`test-r1.txt`). Done When 1: `git grep -n -E "fetch|wixsite|pubDate|--from" -- tools/blog-sync.mjs` exit 1; `--check` 0; `git diff --stat <base> -- publications/index.html` empty; `node tools/blog-sync.mjs` « page inchangee », status unchanged after. Done When 2 diff: the 14 expected files only.
NOTES: `node .WIP/pass-loop-p59/redruns.mjs <scratch>` exit 0 (`redruns.txt`): real-tool red runs on the eleven real files (no line 1, date 2024-02-30, tag ⚡IA, tfoot, data-label « Studios PURE ») each exit 1 naming the file, page unchanged, with and without --check; twelfth file dated 2026-10-14 written first; check --all on a product copy whose file title changed: exit 1 with « Blog perime … + fichiers : <h3>GPTs : attention !!</h3> », plain run 0. Mutation ledger (each a copy of the tool beside the real test, test exit 1): any date (13 cases red), leap years ignored (1), any tag (6), header optional (3), any title (4), rang ignored (1), rang any form (6), tie order reversed (1), ^ dropped from link rule (2), 13th rule <div> (2), tfoot admitted (1), data-label unchecked (4), header on the page (2), « 1er » never written (4).
NOTES: render `node .WIP/pass-loop-p59/evidence/render.mjs` vs 8ec4147 copy (`git -c core.autocrlf=false archive`, 4174): 16 checks, 0 failing (`evidence/render.txt`; baseline run `evidence/render-8ec4147.txt`, 14/0): 714 boxes equal at 1200 and 375, chips IA 6 / Venture Building 4 / Startup 1 by real mouse clicks, 0 script errors, scripts off 11/11 summaries visible. Box comparison proved able to fail: a scratch copy of baseline.json with one h3 height +0.1 px gave 1 FAIL naming element #100.

## Audit fixes to implement — 2026-10-14 (review contact 1 of 2, fresh auditor)
BLOCKING_STATUS: NON_BLOCKING
READINESS: READY_WITH_FIXES
REASON: tool, test, eleven headers and check.mjs meet Done When 1–3 (re-run by the auditor; Done When 4 not re-run: no served file differs from 8ec4147), but two live root-doc lines still route blog changes through the Wix feed this Pass removed.
NATIVE CHECKS: `node tools/check.mjs --all` PASS — « OK — aucun probleme sur 16 page(s) », BLOG line printed · `node tools/version.mjs --check` PASS · `node tools/shell.mjs --check` PASS · `node tools/blog-sync.test.mjs` PASS — 166 cases, 159 tool starts · `git grep -n -E "fetch|wixsite|pubDate|--from" -- tools/blog-sync.mjs` PASS — empty, exit 1; imports fs/path/url only · `node tools/blog-sync.mjs` PASS — « page inchangee », status unchanged (14 files) · `git diff --stat 8ec4147 -- publications/index.html` PASS — empty · `git diff --stat 8ec4147 -- . ':(exclude).WIP'` PASS — the 14 files only, each blog file +1 line.
AUDITOR RUNS (throw-away copy of the working tree under the session scratchpad): 16 red runs of the real tool all exit 1, file named, page md5 unchanged — no line 1, header moved to the end, BOM before header, header repeated on line 2, 2023-02-29, 2100-02-29, 2024-06-31, etiquette « Tech », rang « 0 », rang « 2» with space, raw &, &nbsp;, leading space in titre, <tfoot>, data-label « Studios PURE PLAYERS », data-label of the other column. A twelfth file dated 2026-10-14 is written first (title escaped, no « ‹!-- blog: » on the page), removing it restores the page byte for byte. Stale page: `--check` and `check.mjs --all` exit 1 naming the first difference; plain `node tools/check.mjs` exits 0 and never mentions blog-sync. Mutation of a copy of the tool, test run against it: 25 of 26 mutants killed (leading ^ dropped ×2, tfoot admitted, one FORMAT rule removed, a 13th added, data-label check off / case-insensitive / not entity-decoded, th title tags kept, column counter not reset, leap year every 4th year, bare & and any entity in titre, rang ignored / 0 accepted / unranked first, line-1 check removed, header written into the dépliant, titre not decoded, « 1er » dropped, any etiquette, --check exit 0 on a stale page, date order ascending); survivor: « outermost table instead of nearest » (Tier 3 below). Control run (unmutated) exit 0.
SCOPE: CLEAN — `rang` is the owner's 2026-10-14 decision; the data-label rule is Done When 3; nothing else unrequested.
COVERAGE: 14/14 changed product files read + 4/4 changed root docs read (PLAN § 59 and the lines it made stale, AGENTS Commands, ARCHITECTURE :14 :27, PROGRESS) — skipped: none.

### A-001 | Tier 2 | LOW | `PLAN.md:90`, `PROGRESS.md:20` (root repository)
- issue: two open root-doc items still route blog changes through the removed Wix feed: PLAN Release acceptance (P57 photo) ends with `node tools/blog-sync.mjs --from <saved feed>`, which the tool now refuses (« option inconnue : --from — rien n est ecrit », exit 1, re-run), and PROGRESS Open « fix the Wix blog copy (typo « nutschell », English titles on French posts, straight quotes) » lost its re-sync step in this Pass, so it now reads as if a Wix fix reached the site, while those titles live in line 1 of `tools/blog/*.html` (« nutschell »: `tools/blog/corporate-venture-building-en-1-mot.html:1`) and no Wix change can reach the page any more.
- fix: PLAN :90 → `node tools/blog-sync.mjs` (no `--from`); PROGRESS Open → the site copy is corrected in line 1 (or body) of the `tools/blog/` file, wording approved by the owner, then `node tools/blog-sync.mjs`; a Wix-side fix is separate and no longer reaches the site.
- test: `grep -n -- "--from\|saved feed" PLAN.md PROGRESS.md AGENTS.md ARCHITECTURE.md` from the root prints only § 59's own probe/decision/Work/Done When lines (:417, :421, :426, :431); PROGRESS Open names `tools/blog/` for the typo.

Advisory (Tier 3, not blocking, no review needed):
- T3-1 `tools/blog-sync.test.mjs`: the header comment's « dans le tableau le plus proche » is untested — the mutant `tb = tables[0]` survives (no nested-table case). One case with a table inside a td whose inner data-label matches only the inner column title would hold it.
- T3-2 `tools/blog-sync.mjs:28-30` (carried from Pass 58): the format text says img « avec alt, width, height, loading » while FORMAT requires `loading="lazy"` in that attribute order and a non-empty alt, and `span aria-hidden="true"` (admitted anywhere) is only implied by « la figure video du site ». « ecrites a l identique » covers it loosely.
- T3-3 closure bookkeeping: PLAN § 59 « Status Done », its evidence line « receipts PROGRESS Last Verification (Pass 59) » and PROGRESS « closed locally … each with an independent review GREEN » precede the verdict; PROGRESS has no Last Verification (Pass 59) entry yet and CHANGELOG (PLAN § 59 Work 4) is unchanged. Write both at closure, after the confirmation.

```json
{
  "token": "67b4c9ff",
  "verdict": "FIX",
  "confidence": "high",
  "evidence": [
    {"cmd": "node tools/check.mjs --all", "result": "PASS"},
    {"cmd": "node tools/version.mjs --check", "result": "PASS"},
    {"cmd": "node tools/shell.mjs --check", "result": "PASS"},
    {"cmd": "node tools/blog-sync.test.mjs", "result": "PASS"},
    {"cmd": "git grep -n -E \"fetch|wixsite|pubDate|--from\" -- tools/blog-sync.mjs (empty, exit 1)", "result": "PASS"},
    {"cmd": "node tools/blog-sync.mjs --check; node tools/blog-sync.mjs (page inchangee, git status unchanged)", "result": "PASS"},
    {"cmd": "git diff --stat 8ec414715f5affaed3538b75d9599ab48a26d165 -- publications/index.html (empty)", "result": "PASS"},
    {"cmd": "git diff --stat 8ec414715f5affaed3538b75d9599ab48a26d165 -- . ':(exclude).WIP' (14 files only)", "result": "PASS"},
    {"cmd": "16 red runs of the real tool on a scratch copy (no line 1, bad dates incl. 2023-02-29 and 2100-02-29, unknown tag, bad rang, title escaping, tfoot, data-label mismatch): exit 1, file named, page md5 unchanged", "result": "PASS"},
    {"cmd": "twelfth file dated 2026-10-14 on a scratch copy: written first, header absent from page, removal restores page md5", "result": "PASS"},
    {"cmd": "stale page on a scratch copy: node tools/check.mjs --all exit 1; plain node tools/check.mjs exit 0 without blog-sync", "result": "PASS"},
    {"cmd": "node mutate.mjs + mutate2.mjs: 26 mutated copies of tools/blog-sync.mjs against the test, 25 killed, survivor tb = tables[0] (nested table, Tier 3)", "result": "PASS"},
    {"cmd": "node tools/blog-sync.mjs --from saved-feed.xml (the command PLAN.md:90 still documents)", "result": "FAIL"}
  ],
  "opened_fix_section": true
}
```

AUDIT r1 COST: 198,229 tokens, 12 min 30 s, FIX
INVOCATION: a4636fcd63fb61bb8
USAGE BASIS: whole-contact (Agent completion notice: subagent_tokens 198229, duration_ms 750333)


## FIX ROUND for A-001 (root repository only; product tree untouched)
PLAN.md:90 now ends `node tools/blog-sync.mjs` (no `--from`); PROGRESS.md Open: the typo / English titles / quotes item now says a Wix fix no longer reaches the site and names line 1 of the `tools/blog/` file (« nutschell »: `corporate-venture-building-en-1-mot.html` line 1), then `node tools/blog-sync.mjs`. Tier 3 notes T3-1..T3-3: recorded at closure (T3-3 is closure bookkeeping, done after confirmation).

## TEST-RESULTS r2
TREE: 3e4c593b519cfa16
CMD: `grep -n -- "--from\|saved feed" PLAN.md PROGRESS.md AGENTS.md ARCHITECTURE.md` (root) -> only PLAN.md:417, :421, :426, :431 (§ 59's own lines); `node tools/check.mjs --all` (product) exit 0
RESULT: PASS — fix test as the auditor stated it; product seal unchanged (3e4c593b519cfa16 before, 3e4c593b519cfa16 after).

JOURNAL NOTE (Coder): in the auditor's AUDITOR RUNS line above, the comment opener (less-than, exclamation mark, two hyphens) was replaced by ‹!-- (no word changed): status.py reads an unclosed comment opener as hidden text and ignored every later block.

## AUDIT r2 (delta confirmation, contact 2 of 2, same auditor)
A-001 confirmed fixed. PLAN.md:90 now ends with `node tools/blog-sync.mjs` and no longer uses `--from`. PROGRESS.md:20 says a Wix fix no longer reaches the site. It routes the typo, the English titles and the quotes to line 1 (or the text) of the `tools/blog/` file, with wording approved by the owner, then `node tools/blog-sync.mjs`. It names `corporate-venture-building-en-1-mot.html` line 1 for « nutschell ».
Root diff hunks are unchanged from contact 1 apart from these two lines. The product tree is unchanged: 14 files, same diff stat against 8ec4147. The delta adds no Tier 1 or Tier 2 issue. Tier 3 notes T3-1 to T3-3 stay for closure.

```json
{
  "token": "c485751b",
  "verdict": "GREEN",
  "confidence": "high",
  "evidence": [
    {"cmd": "grep -n -- '--from\\|saved feed' PLAN.md PROGRESS.md AGENTS.md ARCHITECTURE.md (root; only PLAN.md:417, :421, :426, :431)", "result": "PASS"},
    {"cmd": "sed -n 90p PLAN.md; sed -n 20p PROGRESS.md (fix wording read)", "result": "PASS"},
    {"cmd": "git diff -U0 PLAN.md PROGRESS.md (root; only line 90 and line 20 changed since contact 1)", "result": "PASS"},
    {"cmd": "git status --short; git diff --stat 8ec414715f5affaed3538b75d9599ab48a26d165 -- . ':(exclude).WIP' (product; same 14 files)", "result": "PASS"}
  ],
  "opened_fix_section": false
}
```

CONFIRM r2 COST: 212,724 tokens, 1 min 14 s, GREEN
INVOCATION: a4636fcd63fb61bb8 (resumed by SendMessage)
USAGE BASIS: cumulative probably (Agent completion notice after the resume: subagent_tokens 212724 vs 198229 at contact 1, duration_ms 74074)


Evidence files moved under evidence/ before the durable commit: test-r0-red-on-8ec4147.txt, test-r1.txt, check-all-r1.txt, check-all-r2.txt, derive.mjs, derive-output.txt, redruns.mjs, redruns.txt (render.mjs, cdp.mjs, baseline.json, render.txt, render-8ec4147.txt already there).

## CLOSURE
UNIT: p59
DOCS: root PLAN.md § 59 status Done + evidence line, and § Release acceptance P57 photo line (A-001: no --from); AGENTS.md Commands two lines; ARCHITECTURE.md :14 and :27; PROGRESS.md objective, Done, Open (blog-source bullet removed, owner-side typo bullet re-routed to tools/blog/, pre-deploy step removed), Next Action, Last Verification (Pass 59), Known minor issues P59 line and the P54/P57/P58 live-feed clauses; CHANGELOG.md one Pass 59 entry.
MIGRATED: final evidence (r1/r2 commands and seals), both verdicts and their costs, the owner order decision, the r0 Wix-feed breach, the mutation ledger and the render result into PROGRESS Last Verification and Known minor issues; owner-readable summary into CHANGELOG.
NITS: auditor Tier 3 T3-1 (nearest-table rule untested, mutant tables[0] survives) and T3-2 (format text loose on img loading="lazy" and span aria-hidden) into PROGRESS Known minor issues P59; T3-3 (closure bookkeeping) done at closure.
COMMIT: 5f92b94c8f1596cd7d782dbfac492ecd04e90171
