#!/usr/bin/env node
/* Sourcinno — blog de la page Publications : instantane des articles francais du flux Wix.
 *
 * POURQUOI. Le site ne contacte jamais Wix : la liste du blog est du HTML statique,
 * recopie a la demande depuis le flux RSS entre deux marqueurs de publications/index.html :
 *   <!-- blog-sync:debut --> ... <!-- blog-sync:fin -->
 * Articles gardes : liens /blog/post/ (francais). Liens /blog/en/post/ (anglais) : ignores.
 * Etiquettes : "⚡IA" -> IA, "VENTURE BUILDING" -> Venture Building, "STARTUP" -> Startup.
 * Plus recent d abord ; date en francais (table des mois, jour de Paris, sans dependre de la machine).
 * La page garde ses fins de ligne (CRLF ou LF), seule la liste entre les marqueurs change.
 *
 * ARTICLES COMPLETS. Un article dont tools/blog/<nom>.html existe est ecrit en depliant
 * (details.disclosure--card : etiquette, titre et date dans le resume, le fichier dans div.blog-body) ;
 * sans fichier, il garde sa carte et son lien vers Wix. <nom> = dernier segment du lien de l article,
 * decode, sans accents, en minuscules, toute suite hors a-z0-9 remplacee par "-".
 * Le fichier est insere tel quel (HTML, non echappe), reindente ; ses fins de ligne ne comptent pas.
 * Seules y sont admises, bien imbriquees, les balises de FORMAT (plus bas), ecrites a l identique :
 * p, h4, ul, ol, li, strong, em sans attribut ; a href="https://…" target="_blank" rel="noopener" ;
 * span.visually-hidden ; img de /assets/img/blog/ (fichier present) avec alt, width, height, loading ;
 * la figure video du site (figure.band-figure, button.video-launch, figcaption) ; pour un tableau :
 * table, tr, td sans attribut, th scope="col" ou scope="row", td data-label="…" (titre de sa colonne,
 * que la feuille de style affiche au-dessus de la cellule sur telephone ; le script ne verifie pas
 * qu il reprend ce titre). Aucune autre balise de tableau (thead, tbody, colgroup, caption) ni
 * attribut (class, style, id, colspan…). « Bien imbriquees » = chaque fermeture ferme la derniere
 * balise ouverte ; le script ne verifie pas quelle balise peut en contenir quelle autre (un td hors
 * d un tr passe). Le lien entre un lanceur et sa legende, et la mention « (nouvel onglet) », sont
 * tenus par tools/check.mjs, pas ici. tools/blog-sync.test.mjs (lance par `node tools/check.mjs --all`)
 * execute ce script sur des arbres jetables : par regle de FORMAT, ses balises admises et une liste
 * de balises refusees ; les deux sorties ; les refus de fichier cites plus bas.
 *
 * USAGE
 *   node tools/blog-sync.mjs                    lit le flux en ligne et recopie la liste
 *   node tools/blog-sync.mjs --check            n ecrit rien, sort 1 si la liste differe du flux
 *   node tools/blog-sync.mjs --from <fichier>   lit une copie locale du flux (combinable avec --check)
 * Sortie 1 sans rien ecrire : flux injoignable (statut HTTP cite) ou illisible, aucun article
 * francais, lien ni francais ni anglais, categorie absente, inconnue ou multiple sur un article
 * francais (article nomme), date illisible, marqueur absent ou en double ; dans tools/blog/ (fichier
 * nomme) : balise ou attribut hors format, imbrication fausse, image absente, fichier vide, fichier qui
 * n est pas un .html, fichier dont le nom ne correspond a aucun article francais du flux.
 * `node tools/check.mjs` ne lance PAS ce script (il reste hors ligne) : le lancer avant un deploiement.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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
const BLOG = "tools/blog";
const FORMAT = [
  /^<\/(?:p|h4|ul|ol|li|strong|em|a|span|figure|figcaption|button)>$/,
  /^<(?:p|h4|ul|ol|li|strong|em|figcaption)>$/,
  /^<a href="https:\/\/[^"\s<>]+" target="_blank" rel="noopener">$/,
  /^<span class="visually-hidden">$/,
  /^<span aria-hidden="true">$/,
  /^<img src="\/assets\/img\/blog\/[\w.-]+" alt="[^"<>]+" width="\d+" height="\d+" loading="lazy">$/,
  /^<figure class="band-figure">$/,
  /^<button class="video-launch" type="button" data-video="[\w-]+" aria-label="[^"<>]+">$/,
  /^<\/(?:table|tr|th|td)>$/,
  /^<(?:table|tr|td)>$/,
  /^<th scope="(?:col|row)">$/,
  /^<td data-label="[^"<>]+">$/,
];

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

/* Articles complets de tools/blog/ : chaque fichier doit etre au format et correspondre a un article. */
const slug = (link) => decodeURIComponent(link.split("/").pop()).normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function fullText(rel) {
  const text = readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
  const open = [];
  for (const [t] of text.matchAll(/<[^>]*>?/g)) {
    if (!FORMAT.some((f) => f.test(t))) die(`${rel} : balise ou attribut hors format « ${t.slice(0, 80)} »`);
    const name = t.match(/^<\/?(\w+)/)[1];
    if (name === "img") { const src = t.match(/src="([^"]*)"/)[1]; if (!existsSync(join(ROOT, src))) die(`${rel} : image absente ${src}`); }
    else if (t[1] !== "/") open.push(name);
    else if (open.pop() !== name) die(`${rel} : </${name}> ferme une autre balise`);
  }
  if (open.length) die(`${rel} : <${open.pop()}> non ferme`);
  const lines = text.split("\n").map((l) => l.trimEnd()).filter(Boolean);
  if (!lines.length) die(`${rel} : fichier vide`);
  return lines;
}
const files = existsSync(join(ROOT, BLOG)) ? readdirSync(join(ROOT, BLOG)).sort() : [];
for (const f of files) {
  if (!f.endsWith(".html")) die(`${BLOG}/${f} : fichier inattendu (seuls des .html d article sont admis)`);
  const post = posts.find((p) => slug(p.link) === f.slice(0, -5));
  if (!post) die(`${BLOG}/${f} : aucun article francais du flux ne porte ce nom (attendus : ${posts.map((p) => slug(p.link)).join(", ")})`);
  post.text = fullText(`${BLOG}/${f}`);
}

/* Jour calendaire de Paris (Intl de Node, sans dependance) : 22:00 GMT en ete = minuit le lendemain. */
const PARIS = new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", year: "numeric", month: "numeric", day: "numeric" });
const paris = (d) => Object.fromEntries(PARIS.formatToParts(d).filter((x) => x.type !== "literal").map((x) => [x.type, Number(x.value)]));
const pad = (n) => String(n).padStart(2, "0");
const time = (p) => `<time datetime="${p.year}-${pad(p.month)}-${pad(p.day)}">${p.day === 1 ? "1er" : p.day} ${MOIS[p.month - 1]} ${p.year}</time>`;
const block = posts.map((p) => ({ ...p, ...paris(p.date) })).map((p) => (p.text ? [
  `<details class="disclosure disclosure--card" data-tag="${attr(p.tag)}">`,
  `  <summary>`,
  `    <span class="tags"><span class="tag">${html(p.tag)}</span></span>`,
  `    <h3>${html(p.title)}</h3>`,
  `    <span class="card__meta">${time(p)}</span>`,
  `  </summary>`,
  `  <div class="blog-body">`,
  ...p.text.map((l) => "    " + l),
  `  </div>`,
  `</details>`,
] : [
  `<article class="card" data-tag="${attr(p.tag)}">`,
  `  <p class="tags"><span class="tag">${html(p.tag)}</span></p>`,
  `  <h3><a href="${attr(p.link)}" target="_blank" rel="noopener">${html(p.title)} <span aria-hidden="true">→</span><span class="visually-hidden"> (nouvel onglet)</span></a></h3>`,
  `  <p class="card__meta">${time(p)}</p>`,
  `</article>`,
]).map((l) => INDENT + l).join("\n"));
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
const summary = `${posts.length} article(s) francais (${counts}), dont ${files.length} complet(s) (${BLOG}/), ${english} anglais ignore(s)`;

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
