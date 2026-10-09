import { appendFileSync } from "node:fs";
const v = {
  token: "31eee95e",
  verdict: "GREEN",
  confidence: "high",
  evidence: [
    { cmd: "grep -c Done When 1 patterns on index.html and assets/css/style.css (timeline--h|timeline__tip|aria-describedby|role=tooltip = 0; css timeline--h|timeline__tip|min-height: 210px = 0; <ol class=\"timeline = 1; <details class=\"disclosure = 9; five sentence fragments = 5)", result: "PASS" },
    { cmd: "grep -c Done When 2 patterns on index.html (two sentence-case h2 = 2; five emoji h3 = 0)", result: "PASS" },
    { cmd: "node tools/check.mjs --all", result: "PASS" },
    { cmd: "node tools/version.mjs --check", result: "PASS" },
    { cmd: "node tools/shell.mjs --check", result: "PASS" },
    { cmd: "git diff --check", result: "PASS" },
    { cmd: "git diff --quiet 670f72f HEAD -- .github/", result: "PASS" },
    { cmd: "git diff b275352 -- . ':!index.html' ':!assets/css/style.css' | grep '^[-+][^-+]' | grep -vc 'style.css?v=' (= 0, 15 pages stamp-only)", result: "PASS" },
    { cmd: "curl http://127.0.0.1:4174/ and /assets/css/style.css?v=69bb1ff0 then cmp with index.html and assets/css/style.css", result: "PASS" },
    { cmd: "node evidence/render.mjs review/captures review/profile post http://127.0.0.1:4174 (1200: timeline right - card left = -48, first/last delta 0/0, five sentences in viewport and topmost, open card 3 max li shift 0, no overflow closed and all open, 5/5 click and 5/5 Tab+Enter; 375: one column, timeline bottom 32 px above first card, same checks pass)", result: "PASS" },
    { cmd: "node review/probe.mjs review/captures review/profile2 (641/800/960 one column, 961/1100 two columns, no overflow at any width)", result: "PASS" }
  ],
  opened_fix_section: false
};
const prose = [
  "",
  "## Review contact 1 (p31) - fresh auditor",
  "Greenlight: every PLAN § 31 Done When 1-4 check re-run by the reviewer passes; scope CLEAN (the `--xp-row` row height and the two `#experience` min-heights are the requested closed-height match).",
  "Advisory (Tier 3, no fix section): the closed-height match rests on a fixed 6.5rem row tuned to today's copy (natural card height = the floor; timeline li headroom 12 px at 961 px). A two-line card subtitle or a third line on a timeline sentence between 961 and ~1100 px would break the ≤ 8 px match silently; no check in tools/ guards it.",
  "Reviewer scratch: .WIP/pass-loop-p31/review/ only (captures, profiles, probe.mjs, verdict.mjs, check-all.txt).",
  ""
].join("\n");
const block = "```json\n" + JSON.stringify(v, null, 2) + "\n```\n";
JSON.parse(JSON.stringify(v));
appendFileSync(process.argv[2], prose + "\n" + block);
