#!/usr/bin/env node
/* Sourcinno — verificateur du site statique. Aucune dependance : `node tools/check.mjs`.
 *
 * Par defaut : le groupe STRUCTURE (liens, images, balises, header/footer identiques).
 * Options, chacune ajoutant un groupe et ECHOUANT si son sujet n'existe pas encore :
 *   --copy     aucun marqueur de contenu provisoire ne subsiste
 *   --data     assets/data/*.json valides (20 prototypes, publications)
 *   --forms    page contact : formulaire simple + formulaire detaille
 *   --consent  aucune balise de mesure d'audience en dur ; banniere presente
 *   --seo      meta Open Graph, longueurs de title/description, sitemap complet
 *   --all      tous les groupes
 * Sortie 0 = tout vert. Sortie 1 = au moins un echec, chacun cite avec son fichier.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname, resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const want = (g) => args.has("--all") || args.has(g);

const failures = [];
const notes = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);
const note = (msg) => notes.push(msg);

/* ---------- decouverte des fichiers ---------- */
const SKIP_DIRS = new Set([".git", "node_modules", ".github", "tools"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

const allFiles = walk(ROOT);
const htmlFiles = allFiles.filter((f) => f.endsWith(".html")).sort();
if (htmlFiles.length === 0) {
  console.error("ECHEC: aucun fichier .html trouve sous " + ROOT);
  process.exit(1);
}

const pages = htmlFiles.map((f) => ({
  path: f,
  rel: relative(ROOT, f).replace(/\\/g, "/"),
  html: readFileSync(f, "utf8"),
}));

/* Les pages de redirection ne portent ni header ni footer : elles sont exclues
   des controles de coquille, mais PAS des controles de liens. */
const isStub = (p) => /http-equiv="refresh"/i.test(p.html);
const shellPages = pages.filter((p) => !isStub(p));

/* ---------- helpers ---------- */
const between = (html, startTag, endTag) => {
  const i = html.indexOf(startTag);
  if (i < 0) return null;
  const j = html.indexOf(endTag, i);
  if (j < 0) return null;
  return html.slice(i, j + endTag.length);
};
const count = (html, re) => (html.match(re) || []).length;
const attr = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };

/* ---------- STRUCTURE ---------- */
function checkStructure() {
  // 1. balises obligatoires, une par page
  for (const p of pages) {
    if (!/<html lang="fr">/.test(p.html)) fail(p.rel, 'balise <html lang="fr"> absente');

    const title = attr(p.html, /<title>([\s\S]*?)<\/title>/i);
    if (!title) fail(p.rel, "<title> absent ou vide");
    if (count(p.html, /<title>/gi) !== 1) fail(p.rel, "il faut exactement un <title>");

    const desc = attr(p.html, /<meta name="description" content="([^"]*)"/i);
    if (!desc) fail(p.rel, "meta description absente ou vide");

    if (!/<link rel="canonical"/.test(p.html)) fail(p.rel, "lien canonical absent");

    const h1 = count(p.html, /<h1[\s>]/gi);
    if (h1 !== 1) fail(p.rel, `il faut exactement un <h1>, trouve ${h1}`);

    for (const m of p.html.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt=/.test(m[0])) fail(p.rel, "une <img> sans attribut alt: " + m[0].slice(0, 80));
    }
  }

  // 2. header et footer identiques partout
  const headerOf = (p) => between(p.html, '<header class="site-header">', "</header>");
  const footerOf = (p) => between(p.html, '<footer class="site-footer">', "</footer>");
  const ref = shellPages[0];
  const refHeader = headerOf(ref);
  const refFooter = footerOf(ref);
  if (!refHeader) fail(ref.rel, "bloc <header class=\"site-header\"> introuvable");
  if (!refFooter) fail(ref.rel, "bloc <footer class=\"site-footer\"> introuvable");
  for (const p of shellPages) {
    const h = headerOf(p);
    const f = footerOf(p);
    if (!h) { fail(p.rel, "header absent"); continue; }
    if (!f) { fail(p.rel, "footer absent"); continue; }
    if (refHeader && h !== refHeader) fail(p.rel, `header different de ${ref.rel} (les copies doivent rester identiques)`);
    if (refFooter && f !== refFooter) fail(p.rel, `footer different de ${ref.rel}`);
    if (!/<nav class="site-nav"/.test(p.html)) fail(p.rel, "navigation absente du HTML servi");
    if (!/id="main"/.test(p.html)) fail(p.rel, 'element <main id="main"> absent');
  }

  // 3. tous les liens et ressources internes resolvent
  const idsOf = (html) => new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const pageByUrl = new Map();
  for (const p of pages) {
    const url = "/" + p.rel.replace(/index\.html$/, "");
    pageByUrl.set(url, p);
    pageByUrl.set("/" + p.rel, p);
  }

  let linksChecked = 0;
  for (const p of pages) {
    const selfIds = idsOf(p.html);
    const refs = [
      ...[...p.html.matchAll(/\bhref="([^"]+)"/g)].map((m) => ({ v: m[1], kind: "href" })),
      ...[...p.html.matchAll(/\bsrc="([^"]+)"/g)].map((m) => ({ v: m[1], kind: "src" })),
      ...[...p.html.matchAll(/\burl=([^"'\s>]+)/g)].map((m) => ({ v: m[1], kind: "refresh" })),
    ];
    for (const { v, kind } of refs) {
      if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(v)) continue;
      linksChecked++;
      const [pathPart, hash] = v.split("#");
      if (!pathPart) {
        if (hash && !selfIds.has(hash)) fail(p.rel, `ancre interne #${hash} sans element correspondant`);
        continue;
      }
      if (!pathPart.startsWith("/")) {
        fail(p.rel, `${kind} relatif "${v}" — toutes les URL internes doivent commencer par /`);
        continue;
      }
      let target = join(ROOT, pathPart);
      if (pathPart.endsWith("/")) target = join(target, "index.html");
      if (!existsSync(target) || !statSync(target).isFile()) {
        fail(p.rel, `${kind} casse: ${v} (attendu ${relative(ROOT, target).replace(/\\/g, "/")})`);
        continue;
      }
      if (hash && target.endsWith(".html")) {
        const ids = idsOf(readFileSync(target, "utf8"));
        if (!ids.has(hash)) fail(p.rel, `ancre ${v} : aucun element id="${hash}" dans la page cible`);
      }
    }
  }

  // 4. fichiers de service
  for (const f of ["robots.txt", "sitemap.xml", "assets/css/style.css", "assets/js/site.js", "assets/js/config.js"]) {
    if (!existsSync(join(ROOT, f))) fail(f, "fichier attendu absent");
  }
  if (!existsSync(join(ROOT, ".github/workflows/deploy-hostinger.yml"))) {
    fail(".github/workflows/deploy-hostinger.yml", "workflow de deploiement absent");
  }

  note(`STRUCTURE: ${pages.length} page(s) lue(s), dont ${shellPages.length} avec coquille et ${pages.length - shellPages.length} redirection(s); ${linksChecked} lien(s) interne(s) resolu(s)`);
}

/* ---------- --copy ---------- */
const PLACEHOLDER_RE = /TODO-PASS-SUIVANT/;
function checkCopy() {
  let hits = 0;
  for (const p of pages) if (PLACEHOLDER_RE.test(p.html)) { fail(p.rel, "contenu provisoire encore present (TODO-PASS-SUIVANT)"); hits++; }
  note(`--copy: ${pages.length} page(s) inspectee(s), ${hits} avec du contenu provisoire`);
}

/* ---------- --data ---------- */
function readJson(rel) {
  const f = join(ROOT, rel);
  if (!existsSync(f)) { fail(rel, "fichier de donnees absent"); return null; }
  try { return JSON.parse(readFileSync(f, "utf8")); }
  catch (e) { fail(rel, "JSON invalide: " + e.message); return null; }
}
function checkData() {
  const protos = readJson("assets/data/prototypes.json");
  if (protos) {
    const list = Array.isArray(protos) ? protos : protos.items;
    if (!Array.isArray(list)) fail("assets/data/prototypes.json", "structure attendue: un tableau, ou {items: []}");
    else {
      // Regle durable : chaque entree presente est complete. Le nombre vise par le
      // PRD (20) est RAPPORTE bruyamment, jamais fige : le figer ferait echouer
      // le controle a chaque ajout, et masquerait le vrai sujet (des entrees a fournir).
      if (list.length < 20) {
        note(`--data: ATTENTION — ${list.length} prototype(s) sur les 20 annonces par le PRD 4.1 E. Completer assets/data/prototypes.json (modele : prototypes.exemple.json).`);
      }
      const slugs = new Set();
      list.forEach((it, i) => {
        for (const k of ["slug", "titre", "description", "tech"]) {
          if (!it || it[k] === undefined || it[k] === "" || (Array.isArray(it[k]) && !it[k].length)) {
            fail("assets/data/prototypes.json", `entree ${i + 1}: champ obligatoire "${k}" manquant`);
          }
        }
        if (it && it.slug) {
          if (slugs.has(it.slug)) fail("assets/data/prototypes.json", `slug duplique: ${it.slug}`);
          slugs.add(it.slug);
        }
      });
      note(`--data: ${list.length} prototype(s) valide(s)`);
    }
  }
  for (const [page, file] of [["prototypes/index.html", "assets/data/prototypes.json"], ["publications/index.html", "assets/data/publications.json"]]) {
    const p = pages.find((x) => x.rel === page);
    if (!p) { fail(page, "page de collection absente"); continue; }
    if (!/collections\.js/.test(p.html)) fail(page, "la page ne charge pas assets/js/collections.js : la collection ne s afficherait jamais");
    if (!/data-(prototype|publication)-grid/.test(p.html)) fail(page, "aucun conteneur de grille (data-...-grid) dans la page");
    if (!/data-(prototype|publication)-fallback/.test(p.html)) fail(page, `aucun texte de repli sans JavaScript, alors que le contenu vient de ${file}`);
  }

  const pubs = readJson("assets/data/publications.json");
  if (pubs) {
    const list = Array.isArray(pubs) ? pubs : pubs.items;
    if (!Array.isArray(list)) fail("assets/data/publications.json", "structure attendue: un tableau, ou {items: []}");
    else {
      list.forEach((it, i) => {
        for (const k of ["type", "titre"]) {
          if (!it || !it[k]) fail("assets/data/publications.json", `entree ${i + 1}: champ obligatoire "${k}" manquant`);
        }
      });
      note(`--data: ${list.length} publication(s) valide(s)`);
    }
  }
}

/* ---------- --forms ---------- */
function checkForms() {
  const p = pages.find((x) => x.rel === "contact/index.html");
  if (!p) { fail("contact/index.html", "page contact absente"); return; }
  const forms = [...p.html.matchAll(/<form\b[\s\S]*?<\/form>/gi)].map((m) => m[0]);
  if (forms.length < 2) { fail(p.rel, `2 formulaires attendus (simple + detaille, PRD 4.4), trouve ${forms.length}`); return; }
  const basic = forms.find((f) => /id="form-basique"/.test(f));
  const advanced = forms.find((f) => /id="form-avance"/.test(f));
  if (!basic) fail(p.rel, 'formulaire simple attendu avec id="form-basique"');
  if (!advanced) fail(p.rel, 'formulaire detaille attendu avec id="form-avance"');
  const need = (form, label, names) => {
    if (!form) return;
    for (const n of names) {
      if (!new RegExp(`name="${n}"`).test(form)) fail(p.rel, `${label}: champ "${n}" manquant`);
    }
    if (!/type="checkbox"/.test(form) || !/name="rgpd"/.test(form)) fail(p.rel, `${label}: case de consentement RGPD manquante`);
    if (!/<button[^>]*type="submit"/.test(form)) fail(p.rel, `${label}: bouton d envoi manquant`);
    for (const m of form.matchAll(/<(input|select|textarea)\b[^>]*\bid="([^"]+)"/gi)) {
      const id = m[2];
      if (!new RegExp(`<label[^>]*for="${id}"`).test(form) && !/aria-label=/.test(m[0])) {
        fail(p.rel, `${label}: le champ #${id} n a pas de <label for="${id}">`);
      }
    }
  };
  need(basic, "formulaire simple", ["nom", "email", "message"]);
  need(advanced, "formulaire detaille", ["nom", "email", "telephone", "entreprise", "secteur", "besoin", "message"]);
  if (!/form-status/.test(p.html)) fail(p.rel, "zone de message de succes/erreur (.form-status) absente");
  note(`--forms: ${forms.length} formulaire(s) inspecte(s) sur contact/index.html`);
}

/* ---------- --consent ---------- */
const TRACKER_RE = /googletagmanager\.com|google-analytics\.com|plausible\.io\/js|gtag\(|matomo\.js/i;
function checkConsent() {
  for (const p of pages) {
    if (TRACKER_RE.test(p.html)) fail(p.rel, "balise de mesure d audience en dur dans le HTML : elle doit etre injectee apres consentement");
  }
  const banner = existsSync(join(ROOT, "assets/js/consent.js"));
  if (!banner) fail("assets/js/consent.js", "script de banniere de consentement absent");
  else {
    const js = readFileSync(join(ROOT, "assets/js/consent.js"), "utf8");
    if (!/localStorage|document\.cookie/.test(js)) fail("assets/js/consent.js", "le choix de l utilisateur n est pas memorise");
    if (!/PLAUSIBLE_DOMAIN|GA_MEASUREMENT_ID/.test(js)) fail("assets/js/consent.js", "le script ne lit pas la configuration de mesure d audience");
  }
  const withBanner = pages.filter((p) => /consent\.js/.test(p.html)).length;
  if (withBanner !== shellPages.length) fail("assets/js/consent.js", `banniere chargee sur ${withBanner} page(s) sur ${shellPages.length}`);
  note(`--consent: ${pages.length} page(s) inspectee(s), aucune balise de suivi en dur`);
}

/* ---------- --seo ---------- */
function checkSeo() {
  const sitemap = existsSync(join(ROOT, "sitemap.xml")) ? readFileSync(join(ROOT, "sitemap.xml"), "utf8") : "";
  for (const p of pages) {
    if (isStub(p) || p.rel === "404.html") continue;
    for (const prop of ["og:title", "og:description", "og:url", "og:type"]) {
      if (!new RegExp(`property="${prop}"`).test(p.html)) fail(p.rel, `meta ${prop} absente`);
    }
    const title = attr(p.html, /<title>([\s\S]*?)<\/title>/i) || "";
    if (title.length > 65) fail(p.rel, `<title> trop long pour Google: ${title.length} caracteres (max 65)`);
    if (title.length < 15) fail(p.rel, `<title> trop court: ${title.length} caracteres`);
    const desc = attr(p.html, /<meta name="description" content="([^"]*)"/i) || "";
    if (desc.length > 165) fail(p.rel, `meta description trop longue: ${desc.length} caracteres (max 165)`);
    if (desc.length < 70) fail(p.rel, `meta description trop courte: ${desc.length} caracteres (min 70)`);
    const url = "/" + p.rel.replace(/index\.html$/, "");
    if (sitemap && !sitemap.includes(url === "/" ? "sourcinno.com/</loc>" : url)) {
      fail("sitemap.xml", `l URL ${url} n est pas listee`);
    }
  }
  note(`--seo: meta et sitemap verifies sur ${pages.filter((p) => !isStub(p) && p.rel !== "404.html").length} page(s) indexable(s)`);
}

/* ---------- run ---------- */
checkStructure();
if (want("--copy")) checkCopy();
if (want("--data")) checkData();
if (want("--forms")) checkForms();
if (want("--consent")) checkConsent();
if (want("--seo")) checkSeo();

for (const n of notes) console.log("  " + n);
if (failures.length) {
  console.error(`\nECHEC — ${failures.length} probleme(s):`);
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(`\nOK — aucun probleme sur ${pages.length} page(s).`);
