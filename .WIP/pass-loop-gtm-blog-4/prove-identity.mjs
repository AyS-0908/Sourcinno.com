#!/usr/bin/env node
/* gtm-blog Pass 4, Done When 3: the 12 cards written by the engine are the cards of today's list.
 * Reads list-before.txt (saved BEFORE any edit: the text between <!-- blog-sync:debut --> and <!-- blog-sync:fin -->)
 * and the text between <!-- gtm-blog:start --> and <!-- gtm-blog:end --> of publications/index.html now.
 * Normalises the NEW text only: drops ` id="…"` on the `<details` tags, writes /publications/img/ back to /assets/img/blog/.
 * Exit 0 = byte-identical and 12 cards on each side; exit 1 otherwise (first differing line printed).
 * Run from the product folder: node .WIP/pass-loop-gtm-blog-4/prove-identity.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const before = readFileSync(join(HERE, "list-before.txt"), "utf8");
const page = readFileSync("publications/index.html", "utf8");
const lines = page.split("\n");
const s = lines.findIndex((l) => l.trim() === "<!-- gtm-blog:start -->");
const e = lines.findIndex((l) => l.trim() === "<!-- gtm-blog:end -->");
if (s < 0 || e < s) { console.log("FAIL: markers not found in publications/index.html"); process.exit(1); }
const now = lines.slice(s + 1, e).join("\n") + "\n";
const norm = now
  .replace(/^(\s*<details\b[^>]*?) id="[^"]*"/gm, "$1")
  .replaceAll("/publications/img/", "/assets/img/blog/");
const cards = (t) => (t.match(/<details\b/g) || []).length;
console.log(`before: ${before.length} chars, ${cards(before)} card(s)`);
console.log(`new:    ${now.length} chars, ${cards(now)} card(s); normalised ${norm.length} chars`);
let ok = cards(before) === 12 && cards(now) === 12;
if (!ok) console.log("FAIL: a card count is not 12");
if (norm !== before) {
  ok = false;
  const a = before.split("\n"), b = norm.split("\n");
  const i = a.findIndex((l, k) => l !== b[k]);
  console.log(`FAIL: first difference at line ${i + 1}\n  before: ${a[i]}\n  new:    ${b[i]}`);
}
console.log(ok ? "IDENTICAL (normalised new text == saved text, 12 cards)" : "NOT IDENTICAL");
process.exit(ok ? 0 : 1);
