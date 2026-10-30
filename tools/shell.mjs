#!/usr/bin/env node
/* Sourcinno — coquille commune : header, footer et bloc <noscript>.
 *
 * POURQUOI. Ces trois blocs sont recopies dans chaque page. Les modifier a la
 * main dans dix pages finit toujours par une copie oubliee. Ils vivent donc une
 * seule fois dans tools/shell/ et ce script les recopie entre leurs marqueurs :
 *   <header class="site-header"> ... </header>
 *   <footer class="site-footer"> ... </footer>
 *   <noscript> ... </noscript>   celui du <head> (un <noscript> du <main> n est pas touche)
 * Les pages de redirection (http-equiv="refresh") n ont pas de coquille : ignorees.
 * blog/ est saute (profil du moteur gtm-blog), sauf blog/article.html quand il existe : le
 * modele des pages d article, dont la coquille doit rester celle des pages qu il engendre.
 * Chaque page garde ses fins de ligne (CRLF ou LF), seuls les trois blocs changent.
 *
 * USAGE
 *   node tools/shell.mjs          recopie les modeles dans toutes les pages
 *   node tools/shell.mjs --check  n ecrit rien, sort 1 si une page differe
 * Un marqueur absent ou en double : sortie 1, page nommee, aucune page ecrite.
 * `node tools/check.mjs` lance --check automatiquement.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_ONLY = process.argv.includes("--check");
const SKIP = new Set([".git", "node_modules", ".github", "tools", ".WIP", "blog", "articles"]);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(join(dir, e.name), out); }
    else out.push(join(dir, e.name));
  }
  return out;
}

/* Modeles stockes sans fin de ligne finale ; remis aux fins de ligne de la page.
   Un BOM UTF-8 en tete (editeur Windows) est retire : il finirait au milieu de la page. */
const model = (name) => readFileSync(join(ROOT, "tools/shell", name), "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\n$/, "");
const PARTS = [
  { name: "header", file: "tools/shell/header.html", open: '<header class="site-header">', close: "</header>", inHead: false },
  { name: "footer", file: "tools/shell/footer.html", open: '<footer class="site-footer">', close: "</footer>", inHead: false },
  { name: "<noscript>", file: "tools/shell/noscript.html", open: "<noscript>", close: "</noscript>", inHead: true },
].map((p) => ({ ...p, text: model(p.file.slice("tools/shell/".length)) }));

const isStub = (html) => /http-equiv="refresh"/i.test(html);
const occurrences = (s, sub) => { let n = 0, i = -1; while ((i = s.indexOf(sub, i + 1)) >= 0) n++; return n; };

/* Position [debut, fin[ du bloc, ou un message d erreur. */
function locate(html, part) {
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) return "balise </head> introuvable";
  const zone = part.inHead ? html.slice(0, headEnd) : html;
  const n = occurrences(zone, part.open);
  if (n !== 1) return `marqueur ${part.open}${part.inHead ? " (dans <head>)" : ""} trouve ${n} fois, 1 attendu`;
  const i = zone.indexOf(part.open);
  const j = zone.indexOf(part.close, i);
  if (j < 0) return `fermeture ${part.close} introuvable apres ${part.open}${part.inHead ? " (dans <head>)" : ""}`;
  return [i, j + part.close.length];
}

const files = walk(ROOT).filter((f) => f.endsWith(".html")).sort();
if (existsSync(join(ROOT, "blog/article.html"))) files.push(join(ROOT, "blog/article.html"));
const errors = [];
const drifted = [];
const writes = [];
const stubs = [];
let shells = 0;

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const html = readFileSync(file, "utf8");
  if (isStub(html)) { stubs.push(rel); continue; }
  shells++;
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  let next = html;
  let bad = false;
  for (const part of PARTS) {
    const at = locate(next, part);
    if (typeof at === "string") { errors.push(`${rel}: ${at}`); bad = true; continue; }
    const wanted = part.text.replace(/\n/g, eol);
    if (next.slice(at[0], at[1]) === wanted) continue;
    drifted.push(`${rel}: ${part.name} differe du modele ${part.file}`);
    next = next.slice(0, at[0]) + wanted + next.slice(at[1]);
  }
  if (!bad && next !== html) writes.push([file, next]);
}

const skipped = `${stubs.length} redirection(s) ignoree(s)${stubs.length ? " : " + stubs.join(", ") : ""}`;
if (errors.length) {
  console.error(`Coquille : marqueurs invalides (${errors.length}) — aucune page ecrite`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
if (CHECK_ONLY) {
  if (drifted.length) {
    console.error(`Coquille perimee (${drifted.length}) — lancer: node tools/shell.mjs`);
    for (const d of drifted) console.error("  - " + d);
    process.exit(1);
  }
  console.log(`  SHELL: header, footer et <noscript> conformes a tools/shell/ sur ${shells} page(s) ; ${skipped}`);
} else {
  for (const [file, next] of writes) writeFileSync(file, next, "utf8");
  console.log(`SHELL: ${PARTS.length} bloc(s) sur ${shells} page(s), ${writes.length} page(s) reecrite(s) ; ${skipped}`);
}
