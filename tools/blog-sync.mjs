#!/usr/bin/env node
/* Sourcinno — blog de la page Publications : instantane des articles francais du flux Wix.
 *
 * POURQUOI. Le site ne contacte jamais Wix : la liste du blog est du HTML statique,
 * recopie a la demande depuis le flux RSS entre deux marqueurs de publications/index.html :
 *   <!-- blog-sync:debut --> ... <!-- blog-sync:fin -->
 * Articles gardes : liens /blog/post/ (francais). Liens /blog/en/post/ (anglais) : ignores.
 * Etiquettes : "⚡IA" -> IA, "VENTURE BUILDING" -> Venture Building, "STARTUP" -> Startup.
 * Plus recent d abord ; date en francais (table des mois, UTC, sans dependre de la machine).
 * La page garde ses fins de ligne (CRLF ou LF), seule la liste entre les marqueurs change.
 *
 * USAGE
 *   node tools/blog-sync.mjs                    lit le flux en ligne et recopie la liste
 *   node tools/blog-sync.mjs --check            n ecrit rien, sort 1 si la liste differe du flux
 *   node tools/blog-sync.mjs --from <fichier>   lit une copie locale du flux (combinable avec --check)
 * Sortie 1 sans rien ecrire : flux injoignable (statut HTTP cite) ou illisible, aucun article
 * francais, lien ni francais ni anglais, categorie absente, inconnue ou multiple sur un article
 * francais (article nomme), date illisible, marqueur absent ou en double.
 * `node tools/check.mjs` ne lance PAS ce script (il reste hors ligne) : le lancer avant un deploiement.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = join(ROOT, "publications/index.html");
const FEED = "https://sourcinno.wixsite.com/blog/blog-feed.xml";
const START = "<!-- blog-sync:debut -->";
const END = "<!-- blog-sync:fin -->";
const TAGS = { "⚡IA": "IA", "VENTURE BUILDING": "Venture Building", "STARTUP": "Startup" };
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const INDENT = "      ";

const die = (msg) => { console.error("ECHEC blog-sync : " + msg + " — rien n est ecrit"); process.exit(1); };
const argv = process.argv.slice(2);
const CHECK_ONLY = argv.includes("--check");
const fromAt = argv.indexOf("--from");
const FROM = fromAt >= 0 ? argv[fromAt + 1] : null;
for (const [i, a] of argv.entries()) {
  if (a !== "--check" && a !== "--from" && !(fromAt >= 0 && i === fromAt + 1)) die("option inconnue : " + a);
}
if (fromAt >= 0 && !FROM) die("--from sans fichier");

/* Texte d un champ XML : CDATA tel quel, ailleurs les cinq entites XML et les entites numeriques. */
const ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
function xmlText(raw, where) {
  return raw.split(/(<!\[CDATA\[[\s\S]*?\]\]>)/).map((part) => {
    if (part.startsWith("<![CDATA[")) return part.slice(9, -3);
    if (/&(?!(?:#\d+|#x[0-9a-f]+|lt|gt|amp|quot|apos);)/i.test(part)) die(`entite XML inconnue dans ${where}`);
    return part.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(lt|gt|amp|quot|apos));/gi, (_, d, h, n) =>
      n ? ENTITIES[n.toLowerCase()] : String.fromCodePoint(parseInt(d ?? h, d ? 10 : 16)));
  }).join("");
}
const fields = (item, tag) => [...item.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "g"))].map((m) => m[1]);
const html = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => html(s).replace(/"/g, "&quot;");

async function readFeed() {
  if (FROM) { try { return readFileSync(FROM, "utf8"); } catch (e) { die(`copie du flux illisible : ${FROM} (${e.code || e.message})`); } }
  let res;
  try { res = await fetch(FEED, { signal: AbortSignal.timeout(20000) }); } catch (e) { die(`flux injoignable : ${FEED} (${e.cause?.code || e.message})`); }
  if (!res.ok) die(`flux ${FEED} : HTTP ${res.status}`);
  return res.text();
}

const xml = await readFeed();
if (!/<rss\b/.test(xml)) die("le flux n est pas un flux RSS");
const items = fields(xml, "item");
const opened = (xml.match(/<item\b/g) || []).length;
if (items.length !== opened) die(`${opened} balise(s) <item> ouvertes, ${items.length} lisible(s)`);

const posts = [];
let english = 0;
for (const [n, item] of items.entries()) {
  const title = xmlText(fields(item, "title")[0] ?? "", `l item ${n + 1}`).replace(/\s+/g, " ").trim();
  const name = `item ${n + 1} « ${title || "(sans titre)"} »`;
  const link = xmlText(fields(item, "link")[0] ?? "", name).trim();
  if (/^https:\/\/sourcinno\.wixsite\.com\/blog\/en\/post\/\S+$/.test(link)) { english++; continue; }
  if (!/^https:\/\/sourcinno\.wixsite\.com\/blog\/post\/\S+$/.test(link)) die(`${name} : lien ni francais ni anglais (${link || "absent"})`);
  if (!title) die(`${name} : titre absent`);
  const cats = fields(item, "category").map((c) => xmlText(c, name).trim());
  if (cats.length !== 1) die(`${name} : ${cats.length} categorie(s), 1 attendue`);
  const tag = TAGS[cats[0]];
  if (!tag) die(`${name} : categorie inconnue « ${cats[0]} » (connues : ${Object.keys(TAGS).join(", ")})`);
  const date = new Date(xmlText(fields(item, "pubDate")[0] ?? "", name).trim());
  if (Number.isNaN(date.getTime())) die(`${name} : pubDate illisible`);
  posts.push({ title, link, tag, date });
}
if (!posts.length) die("aucun article francais dans le flux");
posts.sort((a, b) => b.date - a.date);

const day = (d) => (d.getUTCDate() === 1 ? "1er" : String(d.getUTCDate()));
const block = posts.map((p) => [
  `<article class="card" data-tag="${attr(p.tag)}">`,
  `  <p class="tags"><span class="tag">${html(p.tag)}</span></p>`,
  `  <h3><a href="${attr(p.link)}" target="_blank" rel="noopener">${html(p.title)} <span aria-hidden="true">→</span></a></h3>`,
  `  <p class="card__meta"><time datetime="${p.date.toISOString().slice(0, 10)}">${day(p.date)} ${MOIS[p.date.getUTCMonth()]} ${p.date.getUTCFullYear()}</time></p>`,
  `</article>`,
].map((l) => INDENT + l).join("\n"));
const wanted = "\n" + block.join("\n") + "\n" + INDENT;

const page = readFileSync(PAGE, "utf8");
const eol = page.includes("\r\n") ? "\r\n" : "\n";
for (const m of [START, END]) {
  const count = page.split(m).length - 1;
  if (count !== 1) die(`publications/index.html : marqueur ${m} trouve ${count} fois, 1 attendu`);
}
const i = page.indexOf(START) + START.length;
const j = page.indexOf(END);
if (j < i) die(`publications/index.html : ${END} avant ${START}`);
const current = page.slice(i, j);
const next = wanted.replace(/\n/g, eol);
const counts = Object.values(TAGS).map((t) => `${t} ${posts.filter((p) => p.tag === t).length}`).join(", ");
const summary = `${posts.length} article(s) francais (${counts}), ${english} anglais ignore(s)`;

if (CHECK_ONLY) {
  if (current !== next) {
    const have = current.split(eol).map((l) => l.trim());
    const want = next.split(eol).map((l) => l.trim());
    let k = want.findIndex((l, x) => l !== have[x]);
    if (k < 0) k = want.length;
    console.error(`Blog perime — lancer: node tools/blog-sync.mjs (flux : ${summary})`);
    console.error(`  premiere difference, ligne ${k + 1} de la liste :`);
    console.error(`  - page : ${have[k] ?? "(fin)"}`);
    console.error(`  + flux : ${want[k] ?? "(fin)"}`);
    process.exit(1);
  }
  console.log(`  BLOG: liste conforme au flux ; ${summary}`);
} else {
  if (current !== next) writeFileSync(PAGE, page.slice(0, i) + next + page.slice(j), "utf8");
  console.log(`BLOG: ${summary} ; page ${current !== next ? "reecrite" : "inchangee"}`);
}
