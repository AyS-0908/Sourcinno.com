// Pass 59 throw-away: derive the line-1 header of each tools/blog/*.html from the page list itself (never by hand).
// Usage (from the product folder): node .WIP/pass-loop-p59/derive.mjs [--write]
// Prints, per page entry in page order: file, titre (header-escaped), date, etiquette. --write prepends the header
// to each file (LF kept, body bytes untouched). Refuses if a page entry matches no file, or a file no entry.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const START = "<!-- blog-sync:debut -->", END = "<!-- blog-sync:fin -->";
const page = readFileSync("publications/index.html", "utf8");
const list = page.slice(page.indexOf(START) + START.length, page.indexOf(END));
const entries = [...list.matchAll(/<details class="disclosure disclosure--card" data-tag="([^"]+)">\n {8}<summary>\n[^\n]*\n {10}<h3>([^\n]*)<\/h3>\n {10}<span class="card__meta"><time datetime="(\d{4}-\d{2}-\d{2})">([^<]*)<\/time><\/span>\n {8}<\/summary>\n {8}<div class="blog-body">\n([\s\S]*?)\n {8}<\/div>\n {6}<\/details>/g)];
const count = (list.match(/<details /g) || []).length;
if (entries.length !== count || count !== 11) { console.error(`entries read ${entries.length}, details ${count}`); process.exit(1); }
const unhtml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const head = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const files = readdirSync("tools/blog").sort();
const body = (f) => readFileSync("tools/blog/" + f, "utf8").split("\n").map((l) => l.trimEnd()).filter(Boolean).map((l) => "          " + l).join("\n");
const used = new Set(), out = [];
for (const [, tag, h3, date, shown, inner] of entries) {
  const hits = files.filter((f) => body(f) === inner);
  if (hits.length !== 1) { console.error(`« ${h3} » matches ${hits.length} file(s)`); process.exit(1); }
  used.add(hits[0]);
  const titre = head(unhtml(h3));
  // owner 2026-10-14 « Garder l'ordre actuel »: a date shared by several posts gives each its page position as rang
  const same = entries.filter((e) => e[3] === date), rang = same.length > 1 ? ` rang="${same.findIndex((e) => e[2] === h3) + 1}"` : "";
  out.push({ file: hits[0], header: `<!-- blog: titre="${titre}" date="${date}" etiquette="${tag}"${rang} -->`, shown });
}
if (used.size !== files.length) { console.error("files without entry: " + files.filter((f) => !used.has(f)).join(", ")); process.exit(1); }
for (const o of out) console.log(`${o.file}\t${o.shown}\n  ${o.header}`);
if (process.argv.includes("--write")) {
  for (const o of out) {
    const old = readFileSync("tools/blog/" + o.file);
    if (old.subarray(0, 9).toString() === "<!-- blog") { console.error(o.file + " already has a header"); process.exit(1); }
    writeFileSync("tools/blog/" + o.file, Buffer.concat([Buffer.from(o.header + "\n", "utf8"), old]));
  }
  console.log("WROTE 11 headers");
}
