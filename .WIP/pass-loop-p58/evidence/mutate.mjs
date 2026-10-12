// p58 red runs: removes ONE of the four table lines of FORMAT from a COPY of tools/blog-sync.mjs (never the product's).
// Stops (exit 2) unless exactly one line of the file is that pattern. usage: node mutate.mjs <file> <0..3>
import { readFileSync, writeFileSync } from 'node:fs';
const [file, n] = process.argv.slice(2);
const LINES = ['/^<\\/(?:table|tr|th|td)>$/,', '/^<(?:table|tr|td)>$/,', '/^<th scope="(?:col|row)">$/,', '/^<td data-label="[^"<>]+">$/,'];
const want = LINES[Number(n)];
const lines = readFileSync(file, 'utf8').split('\n'), hits = lines.filter(l => l.trim() === want).length;
if (!want || hits !== 1) { console.error(`mutate: ${hits} line(s) equal to ${want} in ${file}, 1 expected`); process.exit(2); }
writeFileSync(file, lines.filter(l => l.trim() !== want).join('\n'));
console.log(`FORMAT line removed: ${want}`);
