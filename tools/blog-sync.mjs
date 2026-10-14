#!/usr/bin/env node
/* Sourcinno — blog de la page Publications : la liste ecrite depuis les fichiers de tools/blog/, et rien d autre.
 *
 * POURQUOI. Le site ne contacte jamais Wix et ce script non plus (aucun reseau) : la liste du blog est du HTML
 * statique, ecrit entre deux marqueurs de publications/index.html :
 *   <!-- blog-sync:debut --> ... <!-- blog-sync:fin -->
 * Un article = un fichier tools/blog/<nom>.html ; ajouter un article = ajouter un fichier, puis lancer ce script.
 * La page garde ses fins de ligne (CRLF ou LF), seule la liste entre les marqueurs change.
 *
 * EN-TETE. La ligne 1 de chaque fichier porte les donnees de la liste, ecrites exactement ainsi (HEADER, plus bas) :
 *   <!-- blog: titre="…" date="AAAA-MM-JJ" etiquette="IA|Venture Building|Startup" -->
 * avec, facultatif, ` rang="N"` juste avant ` -->`. Ces attributs, dans cet ordre, une espace entre eux, rien d autre.
 *   titre : non vide, sans espace au debut ni a la fin ; ni " ni < ni > bruts ; & seulement dans &amp; &quot; &lt; &gt;
 *     (aucune autre entite) : un " du titre s ecrit &quot;, un & s ecrit &amp;. Decode, il est ecrit dans le <h3>
 *     avec & < > echappes.
 *   date : jour calendaire reel (mois 01 a 12, jour existant dans le mois, annees bissextiles comprises), affiche
 *     en francais (« 1er », table des mois) sans objet Date ni fuseau horaire.
 *   etiquette : IA, Venture Building ou Startup, ecrite telle quelle.
 *   rang : entier 1, 2, … (pas de 0 en tete) ; ne sert qu a ordonner des articles de meme date.
 * Ordre de la liste : date la plus recente d abord ; a date egale, rang croissant, un fichier sans rang apres tous
 * les fichiers classes de sa date ; puis nom de fichier croissant.
 * L en-tete n est lu qu en ligne 1 et n est jamais ecrit dans la page ; le meme commentaire ailleurs dans le fichier
 * est « hors format » comme tout commentaire.
 *
 * TEXTE. La suite du fichier est ecrite en depliant (details.disclosure--card : etiquette, titre et date dans le
 * resume, le texte dans div.blog-body), insere tel quel (HTML, non echappe), reindente ; ses fins de ligne ne comptent pas.
 * Seules y sont admises, bien imbriquees, les balises de FORMAT (plus bas), ecrites a l identique :
 * p, h4, ul, ol, li, strong, em sans attribut ; a href="https://…" target="_blank" rel="noopener" ;
 * span.visually-hidden ; img de /assets/img/blog/ (fichier present) avec alt, width, height, loading ;
 * la figure video du site (figure.band-figure, button.video-launch, figcaption) ; pour un tableau :
 * table, tr, td sans attribut, th scope="col" ou scope="row", td data-label="…". Aucune autre balise de tableau
 * (thead, tbody, tfoot, colgroup, caption) ni attribut (class, style, id, colspan…). Le data-label d une cellule
 * (que la feuille de style affiche au-dessus d elle sur telephone) doit reprendre le titre de sa colonne : le texte
 * du th scope="col" a la meme place dans sa ligne (balises retirees, espaces reduits, &amp; &quot; &lt; &gt; decodes
 * des deux cotes), place comptee en td et th dans le tableau le plus proche. « Bien imbriquees » = chaque fermeture
 * ferme la derniere balise ouverte ; le script ne verifie pas quelle balise peut en contenir quelle autre (un td hors
 * d un tr passe). Le lien entre un lanceur et sa legende, et la mention « (nouvel onglet) », sont tenus par
 * tools/check.mjs, pas ici.
 *
 * USAGE
 *   node tools/blog-sync.mjs           reecrit la liste depuis les fichiers
 *   node tools/blog-sync.mjs --check   n ecrit rien, sort 1 si la liste de la page differe des fichiers
 *                                      (lance par `node tools/check.mjs --all`)
 * Sortie 1 sans rien ecrire, fichier nomme : en-tete absent de la ligne 1 ou hors format, titre hors format, date
 * impossible, etiquette inconnue, rang hors format, balise ou attribut hors format, imbrication fausse, data-label qui
 * ne reprend pas le titre de sa colonne, image absente, fichier vide (rien apres l en-tete compris), fichier qui n est
 * pas un .html ; aussi : aucun article dans tools/blog/, marqueur absent ou en double, option inconnue.
 * tools/blog-sync.test.mjs (lance par `node tools/check.mjs --all`) execute ce script sur des arbres jetables :
 * l en-tete (formes admises et refusees, ordre), par regle de FORMAT ses balises admises et refusees, la sortie,
 * les refus de fichier cites ici.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = join(ROOT, "publications/index.html");
const START = "<!-- blog-sync:debut -->";
const END = "<!-- blog-sync:fin -->";
const TAGS = ["IA", "Venture Building", "Startup"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const INDENT = "      ";
const BLOG = "tools/blog";
const HEADER = /^<!-- blog: titre="([^"]*)" date="([^"]*)" etiquette="([^"]*)"(?: rang="([^"]*)")? -->$/;
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
for (const a of argv) if (a !== "--check") die("option inconnue : " + a);

const html = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => html(s).replace(/"/g, "&quot;");
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const label = (s) => decode(s.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();

/* Ligne 1 : l en-tete, lu et retire. */
function header(rel, first) {
  if (!first.startsWith("<!-- blog:")) die(`${rel} : ligne 1 sans en-tete <!-- blog: titre="…" date="AAAA-MM-JJ" etiquette="…" -->`);
  const m = first.match(HEADER);
  if (!m) die(`${rel} : en-tete hors format « ${first.slice(0, 120)} » (attendu : <!-- blog: titre="…" date="AAAA-MM-JJ" etiquette="…" --> et, facultatif, rang="N" avant -->)`);
  const [, titre, date, tag, rang] = m;
  if (!titre || titre !== titre.trim() || /[<>]|&(?!(?:amp|quot|lt|gt);)/.test(titre)) die(`${rel} : titre « ${titre} » hors format (non vide, " ecrit &quot;, & ecrit &amp;, ni < ni > bruts)`);
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const [y, mo, da] = d ? d.slice(1).map(Number) : [0, 0, 0];
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  if (!d || !days || da < 1 || da > days) die(`${rel} : date « ${date} » impossible (AAAA-MM-JJ, un jour du calendrier)`);
  if (!TAGS.includes(tag)) die(`${rel} : etiquette « ${tag} » inconnue (connues : ${TAGS.join(", ")})`);
  if (rang !== undefined && !/^[1-9]\d*$/.test(rang)) die(`${rel} : rang « ${rang} » hors format (entier 1, 2, … sans 0 en tete)`);
  return { title: decode(titre), date, y, mo, da, tag, rang: rang === undefined ? Infinity : Number(rang) };
}

/* La suite : balises de FORMAT, bien imbriquees, data-label = titre de sa colonne, images presentes. */
function body(rel, text) {
  const open = [], tables = [];
  for (const m of text.matchAll(/<[^>]*>?/g)) {
    const t = m[0];
    if (!FORMAT.some((f) => f.test(t))) die(`${rel} : balise ou attribut hors format « ${t.slice(0, 80)} »`);
    const name = t.match(/^<\/?(\w+)/)[1], tb = tables.at(-1);
    if (name === "img") { const src = t.match(/src="([^"]*)"/)[1]; if (!existsSync(join(ROOT, src))) die(`${rel} : image absente ${src}`); continue; }
    if (t[1] !== "/") {
      open.push(name);
      if (name === "table") tables.push({ titles: [], labels: [], col: -1, th: null });
      else if (name === "tr" && tb) tb.col = -1;
      else if ((name === "td" || name === "th") && tb) {
        tb.col++;
        if (t === '<th scope="col">') tb.th = { col: tb.col, from: m.index + t.length };
        const dl = t.match(/^<td data-label="([^"]*)">$/);
        if (dl) tb.labels.push({ col: tb.col, text: dl[1] });
      }
    } else {
      if (open.pop() !== name) die(`${rel} : </${name}> ferme une autre balise`);
      if (name === "th" && tb && tb.th) { tb.titles[tb.th.col] = label(text.slice(tb.th.from, m.index)); tb.th = null; }
      if (name === "table") {
        for (const l of tables.pop().labels) {
          const want = tb.titles[l.col];
          if (label(l.text) !== want) die(`${rel} : data-label « ${l.text} » ne reprend pas le titre de sa colonne (${want === undefined ? "aucun" : `« ${want} »`})`);
        }
      }
    }
  }
  if (open.length) die(`${rel} : <${open.pop()}> non ferme`);
  const lines = text.split("\n").map((l) => l.trimEnd()).filter(Boolean);
  if (!lines.length) die(`${rel} : fichier vide`);
  return lines;
}

const files = existsSync(join(ROOT, BLOG)) ? readdirSync(join(ROOT, BLOG)).sort() : [];
const posts = [];
for (const f of files) {
  const rel = `${BLOG}/${f}`;
  if (!f.endsWith(".html")) die(`${rel} : fichier inattendu (seuls des .html d article sont admis)`);
  const text = readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
  if (!text.trim()) die(`${rel} : fichier vide`);
  const cut = text.indexOf("\n");
  const first = cut < 0 ? text : text.slice(0, cut);
  posts.push({ file: f, ...header(rel, first), text: body(rel, cut < 0 ? "" : text.slice(cut + 1)) });
}
if (!posts.length) die(`aucun article dans ${BLOG}/`);
posts.sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.rang !== b.rang ? a.rang - b.rang : a.file < b.file ? -1 : 1));

const time = (p) => `<time datetime="${p.date}">${p.da === 1 ? "1er" : p.da} ${MOIS[p.mo - 1]} ${p.y}</time>`;
const block = posts.map((p) => [
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
const counts = TAGS.map((t) => `${t} ${posts.filter((p) => p.tag === t).length}`).join(", ");
const summary = `${posts.length} article(s) (${counts}) lus dans ${BLOG}/`;

if (CHECK_ONLY) {
  if (current !== next) {
    const have = current.split(eol).map((l) => l.trim());
    const want = next.split(eol).map((l) => l.trim());
    let k = want.findIndex((l, x) => l !== have[x]);
    if (k < 0) k = want.length;
    console.error(`Blog perime — lancer: node tools/blog-sync.mjs (${summary})`);
    console.error(`  premiere difference, ligne ${k + 1} de la liste :`);
    console.error(`  - page : ${have[k] ?? "(fin)"}`);
    console.error(`  + fichiers : ${want[k] ?? "(fin)"}`);
    process.exit(1);
  }
  console.log(`  BLOG: liste conforme aux fichiers ; ${summary}`);
} else {
  if (current !== next) writeFileSync(PAGE, page.slice(0, i) + next + page.slice(j), "utf8");
  console.log(`BLOG: ${summary} ; page ${current !== next ? "reecrite" : "inchangee"}`);
}
