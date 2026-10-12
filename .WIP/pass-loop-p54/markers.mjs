// p54 Done When 1: outside the two blog-sync markers, publications/index.html differs from its 403ba6c version
// on `?v=` stamp lines only. usage (product root): node .WIP/pass-loop-p54/markers.mjs [base sha, default 403ba6c]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const base = process.argv[2] || '403ba6c', A = '<!-- blog-sync:debut -->', B = '<!-- blog-sync:fin -->';
const outside = t => { const s = t.replace(/\r\n/g, '\n'); if (s.split(A).length !== 2 || s.split(B).length !== 2) throw Error('marqueur absent ou en double'); return (s.slice(0, s.indexOf(A)) + s.slice(s.indexOf(B))).split('\n'); };
const then = outside(execFileSync('git', ['show', `${base}:publications/index.html`], { encoding: 'utf8' }));
const now = outside(readFileSync('publications/index.html', 'utf8'));
let other = 0, stamps = 0;
if (then.length !== now.length) { other = Math.abs(then.length - now.length); console.log(`lignes hors marqueurs : ${then.length} puis ${now.length}`); }
else for (const [i, l] of now.entries()) if (l !== then[i]) { if (/\?v=[0-9a-f]{8}/.test(l) && l.replace(/\?v=[0-9a-f]{8}/g, '') === then[i].replace(/\?v=[0-9a-f]{8}/g, '')) stamps++; else { other++; console.log(`- ${then[i]}\n+ ${l}`); } }
console.log(`HORS MARQUEURS (${base}): ${other} ligne hors ?v=, ${stamps} ligne(s) ?v= changee(s), ${now.length} lignes comparees`);
process.exitCode = other ? 1 : 0;
