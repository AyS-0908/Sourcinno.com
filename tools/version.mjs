#!/usr/bin/env node
/* Sourcinno — empreinte de version sur les fichiers CSS et JS.
 *
 * POURQUOI. Le deploiement remplace les fichiers sur le serveur, mais le
 * navigateur d un visiteur deja venu garde son ancienne copie de style.css et
 * des scripts : il voit alors la nouvelle page avec l ancien habillage, ou un
 * bouton qui ne repond plus. Ajouter l empreinte du contenu a l URL
 * (style.css?v=1a2b3c4d) force le navigateur a retelecharger UNIQUEMENT les
 * fichiers qui ont reellement change.
 *
 * USAGE
 *   node tools/version.mjs         met a jour toutes les pages
 *   node tools/version.mjs --check n ecrit rien, sort 1 si une page est perimee
 * `node tools/check.mjs` lance --check automatiquement : impossible d oublier.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_ONLY = process.argv.includes("--check");
const SKIP = new Set([".git", "node_modules", ".github", "tools"]);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(join(dir, e.name), out); }
    else out.push(join(dir, e.name));
  }
  return out;
}

const stamp = (rel) => {
  const f = join(ROOT, rel);
  try { statSync(f); } catch { return null; }
  return createHash("sha256").update(readFileSync(f)).digest("hex").slice(0, 8);
};

/* Toute URL /assets/....css ou .js dans une page, avec ou sans ?v= deja pose. */
const ASSET_RE = /(\/assets\/[A-Za-z0-9_\-./]+\.(?:css|js))(\?v=[0-9a-f]{8})?/g;

const files = walk(ROOT).filter((f) => f.endsWith(".html"));
const stale = [];
let rewritten = 0;
let stamped = 0;

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const html = readFileSync(file, "utf8");
  let missing = null;
  const next = html.replace(ASSET_RE, (whole, path, current) => {
    const hash = stamp(path.replace(/^\//, ""));
    if (!hash) { missing = path; return whole; }
    stamped++;
    const wanted = `?v=${hash}`;
    if (current !== wanted) stale.push(`${rel}: ${path} porte ${current || "aucune empreinte"}, attendu ${wanted}`);
    return path + wanted;
  });
  if (missing) {
    console.error(`${rel}: ressource introuvable ${missing}`);
    process.exit(1);
  }
  if (next !== html && !CHECK_ONLY) { writeFileSync(file, next, "utf8"); rewritten++; }
}

if (CHECK_ONLY) {
  if (stale.length) {
    console.error(`Empreintes de version perimees (${stale.length}) — lancer: node tools/version.mjs`);
    for (const s of stale) console.error("  - " + s);
    process.exit(1);
  }
  console.log(`  VERSIONS: ${stamped} reference(s) CSS/JS a jour sur ${files.length} page(s)`);
} else {
  console.log(`VERSIONS: ${stamped} reference(s) estampillee(s), ${rewritten} page(s) reecrite(s)`);
}
