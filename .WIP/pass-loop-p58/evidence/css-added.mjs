// p58 Done When 1, style clause: against the base version of assets/css/style.css, the file removes no line and
// every selector of an added rule holds `.blog-body` and a table element (table, tbody, tr, th, td). That clause is
// the proof that the ten other articles did not move: no existing rule changed, no new rule can match outside a table.
// Reading: lines are matched in order (only insertions are expected); a base line that is not found is REMOVED.
// usage (product root): node .WIP/pass-loop-p58/evidence/css-added.mjs [base sha, default 7cff339] [file, default the tree's]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const base = process.argv[2] || '7cff339', file = process.argv[3] || 'assets/css/style.css';
const lines = t => t.replace(/\r\n/g, '\n').split('\n');
const then = lines(execFileSync('git', ['-c', 'core.autocrlf=false', 'show', `${base}:assets/css/style.css`], { encoding: 'utf8' }));
const now = lines(readFileSync(file, 'utf8'));
const added = []; let i = 0;
for (const l of now) { if (i < then.length && l === then[i]) i++; else added.push(l); }
const removed = then.length - i;
const css = added.join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
const selectors = [...css.matchAll(/([^{}]+)\{/g)].map(m => m[1].trim()).filter(s => s && !s.startsWith('@')).flatMap(s => s.split(',').map(x => x.trim()));
const TABLE = /(?<![\w.#-])(?:table|tbody|tr|th|td)(?![\w-])/;
const bad = selectors.filter(s => !s.includes('.blog-body') || !TABLE.test(s));
for (const s of bad.slice(0, 5)) console.log(`FAIL selector without .blog-body or without a table element: ${s}`);
if (bad.length > 5) console.log(`FAIL … and ${bad.length - 5} more selector(s), not listed`);
if (removed) console.log(`FAIL ${removed} base line(s) not found in order, the first: ${then[i]}`);
console.log(`CSS (${base} → ${file}): ${added.length} line(s) added, ${removed} removed; ${selectors.length} added selector(s), ${selectors.length - bad.length} holding .blog-body and a table element`);
process.exitCode = removed || bad.length || !selectors.length ? 1 : 0;
