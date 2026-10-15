// p60 Done When 2: the four cards' text (tags removed, white space collapsed) in #portfolio of Venture Building
// equals the text of the cards of portfolio/index.html at the Pass base. Run from the product root.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const BASE = process.argv[2] || 'c5db875';
const was = execFileSync('git', ['-c', 'core.autocrlf=false', 'show', `${BASE}:portfolio/index.html`], { encoding: 'utf8' });
const now = readFileSync('service-venture-building/index.html', 'utf8');
const sec = now.slice(now.indexOf('<section class="section section--alt reveal" id="portfolio">'), now.indexOf('<section class="section reveal" id="reflexion">'));
const cards = html => [...html.matchAll(/<article\b[^>]*class="portfolio-card"[^>]*>[\s\S]*?<\/article>/g)].map(m => m[0].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const a = cards(was), b = cards(sec);
let ok = a.length === 4 && b.length === 4;
for (let i = 0; i < Math.max(a.length, b.length); i++) { const same = a[i] === b[i]; ok &&= same; console.log(`card ${i + 1}: ${same ? 'equal' : 'DIFFERENT'} (${(a[i] || '').length} / ${(b[i] || '').length} characters)`); }
console.log(ok ? `PASS: ${b.length} cards, text equal to ${BASE}:portfolio/index.html` : 'FAIL');
process.exitCode = ok ? 0 : 1;
