#!/usr/bin/env node
/* Sourcinno — verificateur du site statique. Aucune dependance : `node tools/check.mjs`.
 *
 * Par defaut : le groupe STRUCTURE (liens, images, balises, header/footer identiques).
 * Options, chacune ajoutant un groupe et ECHOUANT si son sujet n'existe pas encore :
 *   --data     assets/data/publications.json valide, et la page qui l'affiche
 *   --forms    page contact : le formulaire de contact, complet (V1 = un seul)
 *   --legal    pages legales completes (aucun identifiant laisse a completer)
 *   --a11y     contrastes, liens et boutons nommes, hierarchie des titres
 *   --nojs     le site reste lisible et sur sans JavaScript
 *   --tiers    tout hote externe charge est annonce dans la politique de confidentialite
 *   --seo      meta Open Graph, longueurs de title/description, sitemap complet
 *   --all      tous les groupes
 *
 * Groupes RETIRES en Pass 1, avec leur sujet :
 *   --copy     le marqueur TODO-PASS-SUIVANT n'existe plus nulle part dans l'arbre ;
 *              un groupe sans sujet est vert quoi qu'il arrive, donc il ne verifie rien.
 *   --consent  banniere de consentement et assistant sont reportes en v2 (PLAN.md).
 *              Le cas "balise de mesure d'audience en dur" reste couvert par --tiers :
 *              un hote externe non declare dans la politique de confidentialite echoue.
 * Les drapeaux retires ou inconnus sont refuses : aucun controle ignore en silence.
 * Sortie 0 = tout vert. Sortie 1 = au moins un echec, chacun cite avec son fichier.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname, resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import { execFileSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--data", "--forms", "--legal", "--a11y", "--nojs", "--tiers", "--seo", "--all"]);
for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    console.error("ECHEC: option inconnue ou retiree : " + arg);
    process.exit(1);
  }
}
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

  // La famille partagee reste Inter seule, dans le CSS et chaque page servie.
  const cssPath = join(ROOT, "assets/css/style.css");
  if (existsSync(cssPath) && !/--font-title:\s*var\(--font-body\)/.test(readFileSync(cssPath, "utf8"))) {
    fail("assets/css/style.css", "les titres doivent utiliser la meme famille Inter que le corps");
  }
  const fontUrl = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  for (const p of shellPages) {
    const requests = [...p.html.matchAll(/https:\/\/fonts\.googleapis\.com\/css2\?[^"\s]+/g)].map((m) => m[0]);
    if (requests.length !== 1 || requests[0] !== fontUrl) fail(p.rel, "la requete Google Fonts doit charger Inter seule");
  }
  const privacy = pages.find((p) => p.rel === "politique-confidentialite/index.html");
  const fontNotice = privacy?.html.match(/<h2>Polices de caractères et appels à des tiers<\/h2>\s*<p>(.*?)<\/p>/s)?.[1];
  if (!fontNotice || !/\bInter\b/.test(fontNotice) || /Playfair/i.test(fontNotice)) {
    fail("politique-confidentialite/index.html", "la declaration des polices doit nommer Inter seule");
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
      const [rawPath, hash] = v.split("#");
      const pathPart = rawPath.split("?")[0];
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

  // 5. chaque script du site doit au moins compiler : une erreur de syntaxe
  //    casse la page entiere sans que rien d autre ici ne le voie.
  let scriptsChecked = 0;
  for (const f of allFiles.filter((f) => f.endsWith(".js"))) {
    const rel = relative(ROOT, f).replace(/\\/g, "/");
    try { new Script(readFileSync(f, "utf8"), { filename: rel }); scriptsChecked++; }
    catch (e) { fail(rel, "erreur de syntaxe JavaScript: " + e.message); }
  }

  // 6. empreintes de version des ressources : sans elles, un visiteur deja venu
  //    garde l ancien CSS apres un deploiement (voir tools/version.mjs).
  try {
    const out = execFileSync(process.execPath, [join(ROOT, "tools/version.mjs"), "--check"], { encoding: "utf8" });
    note(out.trim());
  } catch (e) {
    const text = (e.stdout || "") + (e.stderr || "");
    for (const line of text.split("\n").filter((l) => l.trim())) fail("versions", line.trim().replace(/^- /, ""));
  }

  note(`STRUCTURE: ${scriptsChecked} script(s) compile(s); ${pages.length} page(s) lue(s), dont ${shellPages.length} avec coquille et ${pages.length - shellPages.length} redirection(s); ${linksChecked} lien(s) interne(s) resolu(s)`);
}

/* ---------- --data ---------- */
function readJson(rel) {
  const f = join(ROOT, rel);
  if (!existsSync(f)) { fail(rel, "fichier de donnees absent"); return null; }
  try { return JSON.parse(readFileSync(f, "utf8")); }
  catch (e) { fail(rel, "JSON invalide: " + e.message); return null; }
}
/* V1 n'a qu'une seule collection : les publications. Le portfolio de prototypes
   est reporte en v2 (PLAN.md), ses donnees sont rangees dans assets/data/_v2/ :
   plus de page, donc plus de controle ici. */
async function checkData() {
  {
    const page = "publications/index.html";
    const file = "assets/data/publications.json";
    const p = pages.find((x) => x.rel === page);
    if (!p) fail(page, "page de collection absente");
    else {
      if (!/collections\.js/.test(p.html)) fail(page, "la page ne charge pas assets/js/collections.js : la collection ne s afficherait jamais");
      if (!/data-publication-grid/.test(p.html)) fail(page, "aucun conteneur de grille (data-publication-grid) dans la page");
      if (!/data-publication-fallback/.test(p.html)) fail(page, `aucun texte de repli sans JavaScript, alors que le contenu vient de ${file}`);
    }
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
      const page = pages.find((p) => p.rel === "publications/index.html");
      if (page) {
        const fallback = [...page.html.matchAll(/<article\b[^>]*data-publication-index="(\d+)"[^>]*>([\s\S]*?)<\/article>/g)];
        if (fallback.length !== list.length) fail(page.rel, `repli HTML: ${fallback.length} entree(s) pour ${list.length} publication(s) JSON`);
        list.forEach((it, i) => {
          const matches = fallback.filter((m) => Number(m[1]) === i);
          if (matches.length !== 1) { fail(page.rel, `repli HTML: entree ${i + 1} absente ou dupliquee`); return; }
          const html = matches[0][2];
          const title = html.match(/<h3>([^<]*)<\/h3>/)?.[1];
          const paragraphs = [...html.matchAll(/<p(?:\s[^>]*)?>([^<]*)<\/p>/g)].map((m) => m[1]);
          if (title !== it.titre || !paragraphs.includes(it.description || "")) fail(page.rel, `repli HTML: titre ou description de l'entree ${i + 1} differente du JSON`);
          const links = [...html.matchAll(/\bhref="([^"]+)"/g)].map((m) => m[1]);
          if (links.length !== (it.url ? 1 : 0) || (it.url && links[0] !== it.url)) fail(page.rel, `repli HTML: lien de l'entree ${i + 1} different du JSON`);
        });
      }
      note(`--data: ${list.length} publication(s) valide(s)`);
    }
  }
  try {
    const payload = '<img src=x onerror="test"> &';
    const escaped = '&lt;img src=x onerror=&quot;test&quot;&gt; &amp;';
    for (const type of ['livre', 'linkedin', payload]) {
      const grid = { innerHTML: '', parentElement: null };
      const document = {
        readyState: 'complete',
        querySelector: (selector) => selector === '[data-publication-grid]' ? grid : null,
      };
      new Script(readFileSync(join(ROOT, 'assets/js/collections.js'), 'utf8')).runInNewContext({
        document,
        fetch: async () => ({ ok: true, json: async () => [{ type, titre: payload, description: payload, date: payload, image: payload, url: payload }] }),
      });
      await new Promise((resolve) => setImmediate(resolve));
      const escapedCount = grid.innerHTML.split(escaped).length - 1;
      const expectedCount = type === payload ? 7 : 6; // titre dans le h3 et l'alt de l'image
      if (grid.innerHTML.includes(payload) || escapedCount !== expectedCount) {
        throw new Error(`rendu execute : ${escapedCount}/${expectedCount} champs echappes, HTML brut=${grid.innerHTML.includes(payload)}`);
      }
    }
    note('--data: rendu des publications execute avec champs HTML echappes');
  } catch (err) { fail('assets/js/collections.js', err.message); }
}

/* ---------- --forms ----------
   V1 = UN formulaire de contact complet (PRD 5.4). */
function checkForms() {
  const p = pages.find((x) => x.rel === "contact/index.html");
  if (!p) { fail("contact/index.html", "page contact absente"); return; }
  const forms = [...p.html.matchAll(/<form\b[\s\S]*?<\/form>/gi)].map((m) => m[0]);
  const basic = forms.find((f) => /id="form-basique"/.test(f));
  if (!basic) { fail(p.rel, 'formulaire de contact attendu avec id="form-basique"'); return; }
  if (forms.length !== 1) fail(p.rel, `la V1 exige exactement un formulaire de contact, ${forms.length} trouve(s)`);
  const need = (form, label, required, optional) => {
    if (!form) return;
    const fieldTag = (name) => form.match(new RegExp(`<(?:input|select|textarea)\\b[^>]*name="${name}"[^>]*>`, "i"))?.[0] || "";
    for (const n of [...required, ...optional]) {
      if (!fieldTag(n)) fail(p.rel, `${label}: champ "${n}" manquant`);
    }
    for (const n of required) {
      if (!/\brequired\b/i.test(fieldTag(n))) fail(p.rel, `${label}: champ obligatoire "${n}" sans attribut required`);
    }
    for (const n of optional) {
      if (/\brequired\b/i.test(fieldTag(n))) fail(p.rel, `${label}: champ facultatif "${n}" marque required`);
    }
    if (!/type="checkbox"/i.test(fieldTag("rgpd"))) fail(p.rel, `${label}: case de consentement RGPD manquante`);
    if (!/<button[^>]*type="submit"/.test(form)) fail(p.rel, `${label}: bouton d envoi manquant`);
    for (const m of form.matchAll(/<(input|select|textarea)\b[^>]*\bid="([^"]+)"/gi)) {
      const id = m[2];
      if (!new RegExp(`<label[^>]*for="${id}"`).test(form) && !/aria-label=/.test(m[0])) {
        fail(p.rel, `${label}: le champ #${id} n a pas de <label for="${id}">`);
      }
    }
  };
  need(basic, "formulaire de contact", ["nom", "besoin", "message", "email", "rgpd"], ["entreprise", "telephone"]);
  if (!/form-status/.test(p.html)) fail(p.rel, "zone de message de succes/erreur (.form-status) absente");

  const privacy = pages.find((x) => x.rel === "politique-confidentialite/index.html");
  if (!privacy || !/Un seul formulaire de contact est proposé/.test(privacy.html) ||
      /Formulaire simple|Formulaire détaillé/.test(privacy.html)) {
    fail("politique-confidentialite/index.html", "la politique doit decrire le seul formulaire actuel");
  }

  const runMail = () => {
    let submit;
    let resets = 0;
    const status = { dataset: {}, textContent: "", innerHTML: "", setAttribute() {} };
    const makeField = (name, value, options = {}) => {
      const attrs = new Map();
      const error = { textContent: "" };
      return {
        name, value, type: options.type || "text", required: Boolean(options.required),
        checked: options.checked !== false, addEventListener() {}, focus() {},
        closest: () => ({ querySelector: () => error }),
        setAttribute: (key, val) => attrs.set(key, val),
        removeAttribute: (key) => attrs.delete(key),
        getAttribute: (key) => attrs.get(key) || null,
      };
    };
    const fields = [
      makeField("nom", "Test <V1> & contact", { required: true }),
      makeField("entreprise", ""),
      makeField("besoin", "Autre", { required: true }),
      makeField("message", 'Essai du formulaire : "équipe" & projet', { required: true }),
      makeField("email", "test@example.com", { type: "email", required: true }),
      makeField("telephone", ""),
      makeField("rgpd", "on", { type: "checkbox", required: true }),
    ];
    const form = {
      dataset: {}, setAttribute() {},
      querySelectorAll: () => fields,
      querySelector: (selector) => selector === ".form-status" ? status : null,
      addEventListener: (type, handler) => { if (type === "submit") submit = handler; },
      reset: () => { resets++; fields.forEach((field) => { field.value = ""; }); },
    };
    class TestFormData {
      constructor() {
        this.data = new Map(fields.filter((field) => field.type !== "checkbox" || field.checked)
          .map((field) => [field.name, field.value]));
      }
      entries() { return this.data.entries(); }
    }
    const context = {
      window: { SOURCINNO_CONFIG: { FORM_ENDPOINT: "", CONTACT_EMAIL: "aymard.de.scorbiac@sourcinno.com" }, location: { href: "" } },
      document: { readyState: "complete", querySelectorAll: () => [form] },
      FormData: TestFormData,
      fetch: () => { throw new Error("V1 ne doit pas appeler un service d envoi"); },
    };
    new Script(readFileSync(join(ROOT, "assets/js/forms.js"), "utf8"), { filename: "forms.js" })
      .runInNewContext(context);
    return { fields, form, send: () => submit({ preventDefault() {} }), status,
      location: context.window.location, get resets() { return resets; } };
  };
  try {
    const valid = runMail();
    valid.send();
    const mail = new URL(valid.location.href);
    if (mail.protocol !== "mailto:" || mail.pathname !== "aymard.de.scorbiac@sourcinno.com" ||
        mail.searchParams.get("subject") !== "Prise de contact — sourcinno.com" ||
        !mail.searchParams.get("body").includes('Message : Essai du formulaire : "équipe" & projet') ||
        !mail.searchParams.get("body").includes("Nom : Test <V1> & contact") ||
        /rgpd|submission_id/.test(mail.searchParams.get("body"))) {
      throw new Error("le brouillon doit porter le destinataire et les champs exacts encodes");
    }
    if (valid.resets !== 0 || valid.fields[0].value !== "Test <V1> & contact" ||
        valid.form.dataset.lastMailto !== valid.location.href ||
        !valid.status.innerHTML.includes("vous devez encore l’envoyer") ||
        /message est bien parti|message a été envoyé/i.test(valid.status.innerHTML)) {
      throw new Error("le brouillon doit conserver les champs et ne pas annoncer une livraison");
    }
    for (const [name, value] of [["nom", ""], ["email", "invalide"], ["message", "court"], ["rgpd", false]]) {
      const invalid = runMail();
      const field = invalid.fields.find((f) => f.name === name);
      if (name === "rgpd") field.checked = value;
      else field.value = value;
      invalid.send();
      if (invalid.location.href || invalid.status.dataset.state !== "error" || field.getAttribute("aria-invalid") !== "true") {
        throw new Error(`le champ invalide ${name} doit empecher le brouillon et etre signale`);
      }
    }
  } catch (error) {
    fail("assets/js/forms.js", "contrat d envoi: " + error.message);
  }
  note(`--forms: formulaire de contact inspecte sur contact/index.html`);
}

/* ---------- --legal ----------
   Ce groupe refuse tout identifiant laisse a completer avant publication. */
function checkLegal() {
  let holes = 0;
  for (const p of pages) {
    for (const m of p.html.matchAll(/\[À COMPLÉTER[^\]]*\]/g)) {
      fail(p.rel, "mention legale non renseignee : " + m[0]);
      holes++;
    }
  }
  for (const f of ["mentions-legales/index.html", "politique-confidentialite/index.html"]) {
    if (!pages.some((p) => p.rel === f)) fail(f, "page legale absente");
  }
  const hosting = pages.find((p) => p.rel === "mentions-legales/index.html")?.html.match(/<h2>Hébergement<\/h2>([\s\S]*?)(?=<h2>|$)/)?.[1] || "";
  if (!/href="tel:\+\d{8,15}"/.test(hosting)) fail("mentions-legales/index.html", "telephone de l hebergeur absent de la section Hebergement");
  note(`--legal: ${pages.length} page(s) inspectee(s), ${holes} mention(s) a completer`);
}

/* ---------- --a11y ----------
   Controles statiques d accessibilite. Ils ne remplacent pas un test au
   clavier, mais ils attrapent ce qui se re-casse tout seul : un lien sans
   texte, un titre saute, un contraste insuffisant apres un changement de
   palette. */
function relLum(hex) {
  const v = hex.replace("#", "");
  const n = v.length === 3 ? v.split("").map((c) => c + c) : v.match(/../g);
  const [r, g, b] = n.map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a, b) => {
  const [x, y] = [relLum(a), relLum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

function checkA11y() {
  const css = readFileSync(join(ROOT, "assets/css/style.css"), "utf8");
  const vars = {};
  for (const m of css.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) vars[m[1]] = m[2];

  /* Couples reellement utilises par le design system. Les couleurs sont lues
     dans le CSS : changer la palette refait passer ce controle sur les
     nouvelles valeurs, jamais sur une copie figee ici. */
  const PAIRS = [
    ["texte courant", "--navy", "--white", 4.5],
    ["texte attenue", "--grey-700", "--white", 4.5],
    ["texte discret (dates, indices)", "--grey-500", "--white", 4.5],
    ["texte sur fond gris", "--navy", "--grey-50", 4.5],
    ["bouton principal", "--white", "--teal-dark", 4.5],
    ["surtitre et liens teal", "--teal-dark", "--white", 4.5],
    ["dates du parcours sur fond gris", "--teal-dark", "--grey-50", 4.5],
    ["texte sur bleu nuit", "--white", "--navy", 4.5],
    ["pied de page", "--white", "--navy-dark", 4.5],
    ["surtitre sur bleu nuit", "#7fd6d3", "--navy", 4.5],
    ["etiquette technique", "#a04a12", "#fbeade", 4.5],
    ["message d erreur", "#c53030", "--white", 4.5],
    ["aplat decoratif teal", "--teal", "--white", 3.0],
  ];
  let worst = null;
  for (const [nom, fg, bg, min] of PAIRS) {
    const resolve = (name) => (name.startsWith("#") ? name : vars[name]);
    const cf = resolve(fg), cb = resolve(bg);
    if (!cf || !cb) { fail("assets/css/style.css", `couleur introuvable pour "${nom}" (${fg} ou ${bg})`); continue; }
    const r = ratio(cf, cb);
    if (r < min) fail("assets/css/style.css", `contraste insuffisant pour "${nom}" : ${r.toFixed(2)}:1, minimum ${min}:1 (${cf} sur ${cb})`);
    if (!worst || r - min < worst.marge) worst = { nom, r, marge: r - min };
  }

  // ponytail: garde du contexte 404 ; la cascade et le contraste restent verifies a l ecran.
  const hero404 = pages.find((p) => p.rel === "404.html")?.html.match(/<section class="hero hero--page">([\s\S]*?)<\/section>/)?.[1] || "";
  if (!/^\s*<div class="container">\s*<p class="hero__eyebrow">/.test(hero404)) {
    fail("404.html", "surtitre du hero : utiliser hero__eyebrow clair, pas section__eyebrow sombre sur le degrade");
  }

  let links = 0, buttons = 0;
  for (const p of pages) {
    const body = p.html.slice(p.html.indexOf("<body"));

    for (const m of body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
      links++;
      const text = m[2].replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim();
      if (!text && !/aria-label=/.test(m[1]) && !/aria-labelledby=/.test(m[1])) {
        fail(p.rel, "lien sans texte ni aria-label : " + m[0].slice(0, 70));
      }
      if (/target="_blank"/.test(m[1]) && !/rel="[^"]*noopener/.test(m[1])) {
        fail(p.rel, 'lien target="_blank" sans rel="noopener" : ' + m[0].slice(0, 70));
      }
    }

    for (const m of body.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
      buttons++;
      const text = m[2].replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim();
      if (!text && !/aria-label=/.test(m[1])) fail(p.rel, "bouton sans texte ni aria-label : " + m[0].slice(0, 70));
      if (!/type="/.test(m[1])) fail(p.rel, "bouton sans attribut type : " + m[0].slice(0, 70));
    }

    for (const m of body.matchAll(/tabindex="([^"]+)"/g)) {
      if (Number(m[1]) > 0) fail(p.rel, `tabindex="${m[1]}" positif : il casse l ordre naturel du clavier`);
    }

    let previous = 0;
    for (const m of body.matchAll(/<h([1-6])[\s>]/gi)) {
      const level = Number(m[1]);
      if (previous && level > previous + 1) fail(p.rel, `titre h${level} juste apres un h${previous} : un niveau est saute`);
      previous = level;
    }

    if (!/class="skip-link"/.test(body) && !isStub(p)) fail(p.rel, "lien d evitement (skip link) absent");
  }
  // Jamais silencieusement absent : ce groupe compare les couleurs DECLAREES.
  // Il ne peut pas voir un conflit de cascade (une regle plus specifique qui
  // repeint un bouton). Ce cas-la se voit a l oeil, sur la page rendue.
  note("--a11y: le conflit de cascade (une regle plus specifique qui repeint un element) n est PAS couvert ici : il se controle a l ecran.");
  note(`--a11y: ${PAIRS.length} couple(s) de couleurs verifie(s) (le plus juste : ${worst.nom}, ${worst.r.toFixed(2)}:1); ${links} lien(s) et ${buttons} bouton(s) inspecte(s)`);
}

/* ---------- --nojs ----------
   Le site doit rester LISIBLE sans JavaScript, pas seulement present dans le
   HTML. Mesure : `.reveal { opacity: 0 }` rendait chaque section invisible
   alors que le texte etait bien la — un controle qui lit le HTML brut passait
   au vert sur une page entierement blanche. */
function checkNoJs() {
  const css = readFileSync(join(ROOT, "assets/css/style.css"), "utf8");

  /* Toute classe que seul le JavaScript peut poser et qui MASQUE par defaut. */
  const cachantes = [];
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(^|\})\s*([^{}@]+?)\s*\{([^{}]*)\}/g)) {
    const sel = m[2].trim();
    const body = m[3];
    if (!/opacity:\s*0\b|visibility:\s*hidden|display:\s*none/.test(body)) continue;
    if (/^\.reveal\b/.test(sel)) cachantes.push(sel.trim());
  }

  for (const p of shellPages) {
    const usesReveal = /class="[^"]*\breveal\b/.test(p.html);
    if (!usesReveal) continue;
    const ns = p.html.match(/<noscript>[\s\S]*?<\/noscript>/i);
    if (!ns) {
      fail(p.rel, "la page masque ses sections par defaut (.reveal) et n a aucun <noscript> pour les reafficher : sans JavaScript elle est blanche");
      continue;
    }
    if (!/\.reveal\s*\{[^}]*opacity:\s*1/.test(ns[0])) {
      fail(p.rel, "le bloc <noscript> ne remet pas .reveal a opacity 1");
    }
    if (/<form\b[^>]*data-contact-form/.test(p.html)) {
      if (!/form\[data-contact-form\]\s*\{[^}]*display:\s*none/.test(ns[0])) {
        fail(p.rel, "sans JavaScript le formulaire ferait un GET et enverrait les donnees personnelles dans l URL : le <noscript> doit le masquer");
      }
      if (!/noscript-contact/.test(p.html)) {
        fail(p.rel, "aucun moyen de contact de repli affiche quand le formulaire est masque");
      }
    }
  }

  /* Un formulaire sans action ferait un GET sur la page courante. */
  for (const p of pages) {
    for (const m of p.html.matchAll(/<form\b([^>]*)>/gi)) {
      if (!/data-contact-form/.test(m[1])) continue;
      if (/\baction=/.test(m[1])) fail(p.rel, "le formulaire porte un action : verifier qu il ne renvoie pas les donnees en clair dans l URL");
    }
  }

  note(`--nojs: ${shellPages.length} page(s) verifiee(s); ${cachantes.length} regle(s) masquant par defaut recensee(s) (${cachantes.join(", ") || "aucune"})`);
}

/* ---------- --tiers ----------
   Tout hote externe appele par une page doit etre annonce dans la politique
   de confidentialite : un appel a un tiers transmet l adresse IP du visiteur. */
function checkTiers() {
  const politique = pages.find((p) => p.rel === "politique-confidentialite/index.html");
  if (!politique) { fail("politique-confidentialite/index.html", "page absente"); return; }
  const hotes = new Set();
  for (const p of pages) {
    const zone = p.html.slice(0, p.html.indexOf("</head>") + 7) + p.html.slice(p.html.indexOf("<body"));
    // ponytail: count loaded resources, not ordinary links a visitor may choose to open.
    for (const m of zone.matchAll(/<(?:script|iframe|img|link|source)\b[^>]*\b(?:src|href)="https?:\/\/([a-z0-9.-]+)/gi)) {
      const h = m[1].toLowerCase();
      if (h.endsWith("sourcinno.com") || h === "schema.org" || h === "www.schema.org") continue;
      hotes.add(h);
    }
  }
  /* On ne lit que le TEXTE de la politique, jamais son <head> : celui-ci
     charge les memes ressources que les autres pages, et la comparaison
     reviendrait a confronter le fichier a lui-meme — toujours verte. */
  const texte = politique.html
    .slice(politique.html.indexOf('<main id="main">'), politique.html.indexOf("</main>"))
    .toLowerCase();
  for (const h of hotes) {
    const racine = h.replace(/^www\./, "").split(".").slice(-2).join(".");
    if (!texte.includes(racine)) {
      fail("politique-confidentialite/index.html", `le site charge une ressource depuis ${h}, ce qui transmet l adresse IP du visiteur, et la politique de confidentialite n en parle pas`);
    }
  }
  note(`--tiers: ${hotes.size} hote(s) externe(s) charge(s) par les pages${hotes.size ? " : " + [...hotes].join(", ") : ""}`);
}

/* ---------- --seo ---------- */
function checkSeo() {
  const sitemap = existsSync(join(ROOT, "sitemap.xml")) ? readFileSync(join(ROOT, "sitemap.xml"), "utf8") : "";
  const indexed = pages.filter((p) => !isStub(p) && p.rel !== "404.html");
  const expectedUrls = new Set(indexed.map((p) => "https://www.sourcinno.com/" + p.rel.replace(/index\.html$/, "")));
  const listedUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!sitemap) fail("sitemap.xml", "sitemap absent");
  for (const url of expectedUrls) {
    if (!listedUrls.includes(url)) fail("sitemap.xml", `l URL ${url} n est pas listee`);
  }
  for (const url of listedUrls) {
    if (!expectedUrls.has(url)) fail("sitemap.xml", `l URL ${url} est retiree ou inconnue`);
  }
  if (new Set(listedUrls).size !== listedUrls.length) fail("sitemap.xml", "URL dupliquee");
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
  }
  note(`--seo: meta et sitemap verifies sur ${pages.filter((p) => !isStub(p) && p.rel !== "404.html").length} page(s) indexable(s)`);
}

/* ---------- run ---------- */
checkStructure();
if (want("--data")) await checkData();
if (want("--forms")) checkForms();
if (want("--legal")) checkLegal();
if (want("--a11y")) checkA11y();
if (want("--nojs")) checkNoJs();
if (want("--tiers")) checkTiers();
if (want("--seo")) checkSeo();

for (const n of notes) console.log("  " + n);
if (failures.length) {
  console.error(`\nECHEC — ${failures.length} probleme(s):`);
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(`\nOK — aucun probleme sur ${pages.length} page(s).`);
