#!/usr/bin/env node
/* Sourcinno — verificateur du site statique. Aucune dependance : `node tools/check.mjs`.
 *
 * Par defaut : le groupe STRUCTURE (liens, images, balises, header/footer/<noscript> identiques
 *              et conformes a tools/shell/, empreintes de version, chaque classe du HTML
 *              avec une regle CSS, empreinte SHA-256 du code tiers de assets/js/vendor/,
 *              coherence des coordonnees : email, telephone et LinkedIn conformes a
 *              tools/shell/footer.html, chaque lanceur video a l id de sa legende, l id
 *              Typebot des scripts a celui du lien direct ; reference illisible = echec).
 *              Le dossier .WIP (brouillons des Passes) n est jamais lu.
 * Options, chacune ajoutant un groupe et ECHOUANT si son sujet n'existe pas encore :
 *   --forms    page contact : le formulaire de contact, complet (V1 = un seul)
 *   --legal    pages legales completes (aucun identifiant laisse a completer)
 *   --a11y     contrastes, liens et boutons nommes, hierarchie des titres
 *   --nojs     le site reste lisible et sur sans JavaScript
 *   --tiers    tout hote externe charge est annonce dans la politique de confidentialite
 *   --seo      meta Open Graph, longueurs de title/description, sitemap complet, et chaque
 *              Service JSON-LD : url vers une page locale existante, name dans son <title> ou <h1>.
 *              Sitemaps lus : sitemap.xml plus chaque ligne `Sitemap:` de robots.txt sous
 *              https://www.sourcinno.com/ (fichier lu sur le disque ; absent = echec) ; une URL
 *              en double dans un meme sitemap echoue. Un <title> trop long sur une page d article
 *              (publications/<slug>/index.html, ecrite par gtm-blog) est une note, pas un echec :
 *              le titre est celui de l article, au proprietaire de le raccourcir.
 *   --all      tous les groupes, plus le test execute tools/test-ia-embeds.mjs
 *              et `blog.mjs check` du moteur gtm-blog (liste du blog
 *              de Publications = fichiers de publications/articles/, images, liens, hors ligne ;
 *              moteur : $GTM_BLOG_DIR, sinon ../../_AI_SKILLS/skill-gtm-blog depuis la racine)
 *
 * Groupes RETIRES avec leur sujet (en Pass 1, sauf mention) :
 *   --copy     le marqueur TODO-PASS-SUIVANT n'existe plus nulle part dans l'arbre ;
 *              un groupe sans sujet est vert quoi qu'il arrive, donc il ne verifie rien.
 *   --consent  banniere de consentement et assistant sont reportes en v2 (PLAN.md).
 *              Le cas "balise de mesure d'audience en dur" reste couvert par --tiers :
 *              un hote externe non declare dans la politique de confidentialite echoue.
 *   --data     page Publications en HTML statique depuis Pass 34 : plus de JSON a valider.
 * Test RETIRE avec son sujet : tools/portfolio.test.mjs (P75, section Portfolio hors publication,
 *              owner 2026-10-29 « A ») ; le revert du commit P75 Portfolio le rend a --all.
 * Les drapeaux retires ou inconnus sont refuses : aucun controle ignore en silence.
 * Sortie 0 = tout vert. Sortie 1 = au moins un echec, chacun cite avec son fichier.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname, resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--forms", "--legal", "--a11y", "--nojs", "--tiers", "--seo", "--all"]);
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
/* .WIP : brouillons et preuves des Passes, jamais servis ; un .html ou un .js
   laisse la ne devient pas une page ou un script du site. blog (profil du moteur
   gtm-blog) et articles (fragments d articles, lus par le moteur) : pas des pages. */
const SKIP_DIRS = new Set([".git", "node_modules", ".github", "tools", ".WIP", "blog", "articles"]);

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

/* Code tiers servi par le site lui-meme (Pass 41) : chaque script de VENDOR est
   epingle par son empreinte SHA-256 et accompagne de son LICENSE. Parce que son
   contenu est fige par l empreinte, VENDOR est exclu de la compilation en script
   classique (un module ES n y compile pas), du recensement inverse et de la
   lecture des hotes par --tiers (les hotes que le bundle nomme dependent des
   reglages du bot Typebot, pas du site). */
const VENDOR = "assets/js/vendor/";
const VENDOR_PINS = new Map([
  ["assets/js/vendor/typebot-js-0.10.11/web.js", "41adb2855b0e8868b4cf304b20e3ab1f1014e8ed252ec559aaa8d4cd4ed72750"],
]);
const isVendor = (f) => relative(ROOT, f).replace(/\\/g, "/").startsWith(VENDOR);
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

/* Coordonnees de reference (Pass 50, Pass 66) : le partiel du footer est la seule source de
   l email et du profil LinkedIn ; il ne porte aucun telephone (pas de numero personnel sur
   le site, PLAN § V1.3 D2). Une valeur introuvable reste null : la coherence (STRUCTURE)
   et le contrat d envoi (--forms) echouent en le nommant. */
const FOOTER_REF = "tools/shell/footer.html";
const contactRef = (() => {
  const f = join(ROOT, FOOTER_REF);
  const html = existsSync(f) ? readFileSync(f, "utf8") : null;
  return {
    lu: html !== null,
    email: html?.match(/href="mailto:([^"?]+)"/)?.[1] ?? null,
    linkedin: html?.match(/linkedin\.com\/in\/([\w-]+)/)?.[1] ?? null,
  };
})();

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
/* HTML reellement lu par le navigateur : un commentaire <!-- --> ne compte pas. */
const live = (html) => html.replace(/<!--[\s\S]*?-->/g, "");
/* Jetons de chaque attribut class="…" ou class='…', meme coupe sur plusieurs lignes. */
const classTokens = (html) => [...live(html).matchAll(/(?<![\w-])class=(?:"([^"]*)"|'([^']*)')/g)].flatMap((m) => (m[1] ?? m[2]).split(/\s+/).filter(Boolean));
/* Blocs <style> d une page (y compris celui du <noscript> de la coquille). */
const styleBlocks = (html) => [...live(html).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
/* Regles d une feuille, commentaires retires : [selecteurs, declarations]. */
const cssRules = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1], m[2]]);

/* Outils et tests lances par node, avec une limite : un processus qui ne finit
   pas, ou qui echoue sans rien ecrire, devient un echec nomme, jamais un vert. */
const RUN_TIMEOUT_MS = 30_000;
const runNode = (argv) => execFileSync(process.execPath, argv, { encoding: "utf8", stdio: "pipe", timeout: RUN_TIMEOUT_MS });
const timedOut = (e) => e.code === "ETIMEDOUT" || Boolean(e.signal);
const runFailure = (e) => timedOut(e) ? `interrompu apres ${RUN_TIMEOUT_MS / 1000} s sans finir` : `sortie ${e.status ?? e.code ?? "inconnue"} sans message`;
function failFromTool(label, file, e) {
  const lines = ((e.stdout || "") + (e.stderr || "")).split("\n").map((l) => l.trim()).filter(Boolean);
  if (timedOut(e) || !lines.length) fail(label, `${file} ${runFailure(e)}`);
  for (const line of lines) fail(label, line.replace(/^- /, ""));
}

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

  // 2. header, footer et <noscript> du <head> identiques partout
  //    (une seule source : tools/shell/, recopiee par tools/shell.mjs)
  const headerOf = (p) => between(p.html, '<header class="site-header">', "</header>");
  const footerOf = (p) => between(p.html, '<footer class="site-footer">', "</footer>");
  const noscriptOf = (p) => between(p.html.slice(0, p.html.indexOf("</head>") + 1), "<noscript>", "</noscript>");
  const ref = shellPages[0];
  const refHeader = headerOf(ref);
  const refFooter = footerOf(ref);
  const refNoscript = noscriptOf(ref);
  if (!refHeader) fail(ref.rel, "bloc <header class=\"site-header\"> introuvable");
  if (!refFooter) fail(ref.rel, "bloc <footer class=\"site-footer\"> introuvable");
  for (const p of shellPages) {
    const h = headerOf(p);
    const f = footerOf(p);
    if (!h) { fail(p.rel, "header absent"); continue; }
    if (!f) { fail(p.rel, "footer absent"); continue; }
    if (refHeader && h !== refHeader) fail(p.rel, `header different de ${ref.rel} (les copies doivent rester identiques)`);
    if (refFooter && f !== refFooter) fail(p.rel, `footer different de ${ref.rel}`);
    const ns = noscriptOf(p);
    if (refNoscript && ns !== refNoscript) fail(p.rel, `<noscript> du <head> different de ${ref.rel}`);
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
  //    Les scripts de VENDOR n y passent pas : ils sont epingles juste apres.
  let scriptsChecked = 0;
  for (const f of allFiles.filter((f) => f.endsWith(".js") && !isVendor(f))) {
    const rel = relative(ROOT, f).replace(/\\/g, "/");
    try { new Script(readFileSync(f, "utf8"), { filename: rel }); scriptsChecked++; }
    catch (e) { fail(rel, "erreur de syntaxe JavaScript: " + e.message); }
  }

  // 5 bis. code tiers : empreinte exacte et LICENSE a cote ; un script de VENDOR
  //    sans empreinte echoue, sinon il echapperait a tout controle.
  for (const f of allFiles.filter((f) => isVendor(f) && f.endsWith(".js"))) {
    const rel = relative(ROOT, f).replace(/\\/g, "/");
    if (!VENDOR_PINS.has(rel)) fail(rel, "script tiers sans empreinte : l ajouter a VENDOR_PINS dans tools/check.mjs");
  }
  for (const [rel, pin] of VENDOR_PINS) {
    const f = join(ROOT, rel);
    if (!existsSync(f)) { fail(rel, "script tiers epingle absent"); continue; }
    const sha = createHash("sha256").update(readFileSync(f)).digest("hex");
    if (sha !== pin) fail(rel, `empreinte SHA-256 ${sha} differente de l empreinte epinglee ${pin} : fichier modifie`);
    const licence = join(dirname(f), "LICENSE");
    if (!existsSync(licence) || !statSync(licence).size) fail(posix.join(posix.dirname(rel), "LICENSE"), "licence du script tiers absente ou vide");
  }
  note(`STRUCTURE: code tiers epingle : ${[...VENDOR_PINS].map(([rel, pin]) => `${rel} (sha256 ${pin.slice(0, 12)}…, LICENSE)`).join(", ")}`);

  // 6. empreintes de version des ressources : sans elles, un visiteur deja venu
  //    garde l ancien CSS apres un deploiement (voir tools/version.mjs).
  try {
    note(runNode([join(ROOT, "tools/version.mjs"), "--check"]).trim());
  } catch (e) {
    failFromTool("versions", "tools/version.mjs --check", e);
  }

  // 7. coquille commune : chaque page porte les blocs de tools/shell/
  //    (voir tools/shell.mjs). Une copie retouchee a la main echoue ici.
  try {
    note(runNode([join(ROOT, "tools/shell.mjs"), "--check"]).trim());
  } catch (e) {
    failFromTool("coquille", "tools/shell.mjs --check", e);
  }

  // 8. recensement : toute classe ecrite dans le HTML a au moins une regle CSS
  //    (assets/css/*.css hors _v2, plus les <style> des pages). Seules exceptions :
  //    les classes listees ici, chacune avec le fichier qui la porte ; une
  //    exception que ce fichier ou les pages n utilisent plus, ou qui a gagne
  //    une regle, echoue aussi. Vide depuis Pass 40 (classe morte de la coquille retiree).
  const SANS_REGLE = new Map([
  ]);
  const relOf = (f) => relative(ROOT, f).replace(/\\/g, "/");
  const feuilles = allFiles.filter((f) => /^assets\/css\/[^/]+\.css$/.test(relOf(f)))
    .map((f) => [relOf(f), readFileSync(f, "utf8")]);
  const regles = new Map(); // classe -> premier fichier dont un selecteur la nomme
  for (const [file, css] of [...feuilles, ...pages.flatMap((p) => styleBlocks(p.html).map((b) => [`${p.rel} <style>`, b]))]) {
    for (const [selecteurs] of cssRules(css)) {
      // valeurs d attribut ([src$="x.png"]) et chaines retirees : seul le selecteur nomme des classes
      const nu = selecteurs.replace(/\[[^\]]*\]|"[^"]*"|'[^']*'/g, "");
      for (const m of nu.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) if (!regles.has(m[1])) regles.set(m[1], file);
    }
  }
  const usages = new Map();
  for (const p of pages) {
    for (const t of classTokens(p.html)) {
      if (!usages.has(t)) usages.set(t, new Set());
      usages.get(t).add(p.rel);
    }
  }
  for (const [t, where] of usages) {
    if (regles.has(t) || SANS_REGLE.has(t)) continue;
    const liste = [...where];
    fail(liste[0], `classe « ${t} » sans aucune regle CSS (assets/css/ ni <style> de page)${liste.length > 1 ? ` ; aussi dans ${liste.length - 1} autre(s) page(s)` : ""}`);
  }
  for (const [t, file] of SANS_REGLE) {
    const porteur = existsSync(join(ROOT, file)) ? readFileSync(join(ROOT, file), "utf8") : "";
    if (!classTokens(porteur).includes(t) || !usages.has(t) || regles.has(t)) {
      fail(file, `exception de recensement « ${t} » perimee : la retirer de SANS_REGLE dans tools/check.mjs`);
    }
  }
  note(`STRUCTURE: recensement ${usages.size} classe(s) HTML, ${feuilles.length} feuille(s) assets/css + ${pages.reduce((n, p) => n + styleBlocks(p.html).length, 0)} bloc(s) <style> de page, ${regles.size} classe(s) avec regle ; exception(s) sans regle : ${[...SANS_REGLE].map(([t, f]) => `${t} (${f})`).join(", ") || "aucune"}`);

  // 9. recensement inverse : toute classe nommee par un selecteur (memes feuilles
  //    et <style>) sert quelque part : jeton class="…"/class='…' d une page ou de
  //    tools/shell/*.html, ou mot d une chaine "…", '…' ou `…` d un script
  //    (assets/js/**, _v2 compris, VENDOR exclu, publications/blog.js ecrit par le moteur gtm-blog
  //    (puces .chip), et <script> en ligne hors JSON-LD des pages et
  //    de la coquille ; commentaires ignores). Limite : une expression reguliere
  //    litterale contenant un guillemet hors d un gabarit `…` decalerait la lecture.
  //    Seules exceptions : une classe dont le nom est compose par un script, avec
  //    le fichier et le motif qui la composent ; une exception qui n a plus de
  //    selecteur, qui sert de nouveau telle quelle ou dont le motif a disparu echoue.
  const SANS_USAGE = new Map([
    ["chat-msg--bot", ["assets/js/_v2/chat.js", 'chat-msg--" + who']],
    ["chat-msg--me", ["assets/js/_v2/chat.js", 'chat-msg--" + who']],
  ]);
  const partiels = readdirSync(join(ROOT, "tools/shell")).filter((f) => f.endsWith(".html"))
    .map((f) => readFileSync(join(ROOT, "tools/shell", f), "utf8"));
  const sourcesHtml = [...pages.map((p) => p.html), ...partiels];
  const jetons = new Set(sourcesHtml.flatMap(classTokens));
  const scriptsTexte = [
    ...allFiles.filter((f) => (/^assets\/js\/.+\.js$/.test(relOf(f)) && !isVendor(f)) || relOf(f) === "publications/blog.js").map((f) => readFileSync(f, "utf8")),
    ...sourcesHtml.flatMap((h) => [...live(h).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter((m) => !/ld\+json/i.test(m[1])).map((m) => m[2])),
  ];
  const motsDeChaines = new Set();
  for (const js of scriptsTexte) {
    for (const m of js.matchAll(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g)) {
      if (m[0].startsWith("/")) continue;
      for (const w of m[0].matchAll(/[\w-]+/g)) motsDeChaines.add(w[0]);
    }
  }
  const sert = (t) => jetons.has(t) || motsDeChaines.has(t);
  let mortes = 0;
  for (const [t, file] of regles) {
    if (SANS_USAGE.has(t) || sert(t)) continue;
    mortes++;
    fail(file, `classe « ${t} » dans un selecteur CSS mais utilisee nulle part (pages, tools/shell/, chaines des scripts) : retirer la regle`);
  }
  for (const [t, [file, motif]] of SANS_USAGE) {
    const porteur = existsSync(join(ROOT, file)) ? readFileSync(join(ROOT, file), "utf8") : "";
    if (!regles.has(t) || sert(t) || !porteur.includes(motif)) {
      fail(file, `exception de recensement inverse « ${t} » perimee : la retirer de SANS_USAGE dans tools/check.mjs`);
    }
  }
  note(`STRUCTURE: recensement inverse ${regles.size} classe(s) de selecteur, ${partiels.length} partiel(s) tools/shell, ${scriptsTexte.length} script(s) lus, ${mortes} classe(s) sans usage ; exception(s) composee(s) par script : ${[...SANS_USAGE].map(([t, [f]]) => `${t} (${f})`).join(", ") || "aucune"}`);

  // 10. coherence des coordonnees (Pass 50, Pass 66) : pages + assets/js/*.js (ni _v2 ni
  //     VENDOR) + partiels tools/shell/*.html, texte brut, copies du footer comprises.
  //     - email : toute forme x@domaine.tld (hors nom de fichier image) = celle du footer ;
  //     - telephone : AUCUN numero n est admis sauf celui de l hebergeur, et seulement dans
  //       les mentions legales (PLAN § V1.3 D2 : le mobile du proprietaire nulle part). Lus :
  //       tout numero international « +chiffres » d au moins 8 chiffres et toute forme
  //       nationale « 0X XX XX XX XX », separateurs espace, &nbsp;, &#160;, U+00A0, point,
  //       tiret ou aucun. Hebergeur absent des mentions = echec (la famille n a rien lu).
  //       Limite : un numero ecrit autrement (entite par chiffre, %20, parentheses) n est pas lu ;
  //     - LinkedIn : tout profil linkedin.com/in/… = celui du footer ;
  //     - video : chaque figure a data-video porte un seul lien de legende
  //       youtube.com/watch?v= au meme id ; toute autre id YouTube de la page en fait partie ;
  //     - Typebot : un seul lien direct https://typebot.io/ID dans les pages, et chaque
  //       « typebot: 'ID' » des scripts egal a lui.
  //     Reference illisible ou famille sans aucune occurrence = echec, jamais un vert.
  const R = "coherence des coordonnees";
  const textes = [...pages.map((p) => [p.rel, p.html]),
    ...allFiles.filter((f) => /^assets\/js\/[^/]+\.js$/.test(relOf(f))).map((f) => [relOf(f), readFileSync(f, "utf8")]),
    ...readdirSync(join(ROOT, "tools/shell")).filter((f) => f.endsWith(".html"))
      .map((f) => [`tools/shell/${f}`, readFileSync(join(ROOT, "tools/shell", f), "utf8")])];
  const compte = (m, v) => m.set(v, (m.get(v) || 0) + 1);
  const total = (m) => [...m.values()].reduce((a, b) => a + b, 0);
  const detail = (m) => [...m].map(([v, n]) => `« ${v} » ×${n}`).join(", ");
  const manque = ["email", "linkedin"].filter((k) => !contactRef[k]);
  let bilanCoordonnees;
  if (!contactRef.lu || manque.length) {
    fail(FOOTER_REF, `${R} : reference illisible (${contactRef.lu ? `${manque.join(", ")} introuvable(s)` : "fichier absent"}) ; email, telephone et LinkedIn non compares`);
    bilanCoordonnees = `email, telephone, LinkedIn NON COMPARES (reference ${FOOTER_REF} illisible)`;
  } else {
    const chiffres = (s) => s.replace(/&nbsp;|&#160;/g, "").replace(/\D/g, "");
    const HOTE = { file: "mentions-legales/index.html", tel: "37064503378" };
    const SEP = String.raw`(?: |&nbsp;|&#160;| |\.|-)?`;
    const TEL_INTL = new RegExp(String.raw`\+\d(?:${SEP}\d)+`, "g");
    const TEL_NAT = new RegExp(String.raw`(?<![\w+.-])0[1-9](?:${SEP}\d\d){4}(?!\w)`, "g");
    const INTERDIT = "interdit : aucun numero sur le site sauf celui de l hebergeur, dans les mentions legales (PLAN § V1.3 D2)";
    const vus = { email: new Map(), hote: new Map(), linkedin: new Map() };
    for (const [rel, txt] of textes) {
      for (const m of txt.matchAll(/[\w.%+-]+@[\w-]+(?:\.[\w-]+)*\.[A-Za-z]{2,}/g)) {
        if (/\.(?:png|jpe?g|webp|avif|gif|svg|ico)$/i.test(m[0])) continue;
        if (m[0] === contactRef.email) compte(vus.email, m[0]);
        else fail(rel, `${R} : email « ${m[0]} » different de la reference ${contactRef.email} (${FOOTER_REF})`);
      }
      for (const m of txt.matchAll(TEL_INTL)) {
        const d = chiffres(m[0]);
        if (d.length < 8) continue;
        if (d === HOTE.tel && rel === HOTE.file) compte(vus.hote, m[0]);
        else fail(rel, `${R} : telephone « ${m[0]} » ${d === HOTE.tel ? `de l hebergeur, admis seulement dans ${HOTE.file}` : INTERDIT}`);
      }
      for (const m of txt.matchAll(TEL_NAT)) fail(rel, `${R} : telephone « ${m[0]} » ${INTERDIT}`);
      for (const m of txt.matchAll(/linkedin\.com\/in\/([\w-]*)/gi)) {
        if (m[1] === contactRef.linkedin) compte(vus.linkedin, m[0]);
        else fail(rel, `${R} : profil « ${m[0]} » different de la reference linkedin.com/in/${contactRef.linkedin} (${FOOTER_REF})`);
      }
    }
    for (const [k, nom] of [["email", "email"], ["linkedin", "profil LinkedIn"]]) {
      if (!vus[k].size) fail(FOOTER_REF, `${R} : aucun ${nom} conforme trouve dans les pages, assets/js et tools/shell : rien n a ete compare`);
    }
    if (!vus.hote.size) fail(HOTE.file, `${R} : aucun telephone de l hebergeur trouve : la famille telephone n a rien lu`);
    bilanCoordonnees = `email ${total(vus.email)} (${detail(vus.email)}), telephone : aucun sauf l hebergeur ×${total(vus.hote)} dans ${HOTE.file} (${detail(vus.hote) || "aucun"}), LinkedIn ${total(vus.linkedin)} (${detail(vus.linkedin)})`;
  }
  let videos = 0;
  for (const p of pages) {
    const figures = [...p.html.matchAll(/<figure\b[\s\S]*?<\/figure>/gi)].map((m) => m[0]);
    const admis = new Set();
    let dansFigures = 0;
    for (const fig of figures) {
      const ids = [...fig.matchAll(/\bdata-video="([^"]*)"/g)].map((m) => m[1]);
      if (!ids.length) continue;
      dansFigures += ids.length;
      const legendes = [...fig.matchAll(/youtube\.com\/watch\?v=([\w-]+)/g)].map((m) => m[1]);
      if (ids.length !== 1 || legendes.length !== 1) {
        fail(p.rel, `${R} : une figure video doit porter un data-video et un lien de legende youtube.com/watch?v= (trouve ${ids.length} et ${legendes.length})`);
        continue;
      }
      admis.add(legendes[0]);
      if (ids[0] === legendes[0]) videos++;
      else fail(p.rel, `${R} : data-video « ${ids[0]} » different de l id de sa legende youtube.com/watch?v=${legendes[0]}`);
    }
    const tous = count(p.html, /\bdata-video="/g);
    if (tous !== dansFigures) fail(p.rel, `${R} : ${tous - dansFigures} data-video hors d une figure a legende : aucune reference`);
    for (const m of p.html.matchAll(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/g)) {
      if (!admis.has(m[1])) fail(p.rel, `${R} : video YouTube « ${m[1]} » sans lanceur de meme id dans la page`);
    }
  }
  if (!videos) fail("pages", `${R} : aucun lanceur video conforme trouve : rien n a ete compare`);
  const liensTypebot = new Map();
  for (const p of pages) for (const m of p.html.matchAll(/https:\/\/typebot\.io\/([\w-]+)/g)) compte(liensTypebot, m[1]);
  let typebot = 0;
  if (liensTypebot.size !== 1) {
    fail("pages", `${R} : lien direct Typebot https://typebot.io/ID ${liensTypebot.size ? `en ${liensTypebot.size} versions (${[...liensTypebot.keys()].join(", ")})` : "introuvable"} : aucune reference pour l id des scripts`);
  } else {
    const [refTypebot] = liensTypebot.keys();
    for (const [rel, txt] of textes.filter(([rel]) => rel.startsWith("assets/js/"))) {
      for (const m of txt.matchAll(/\btypebot:\s*['"`]([^'"`]*)['"`]/g)) {
        if (m[1] === refTypebot) typebot++;
        else fail(rel, `${R} : id Typebot « ${m[1]} » different du lien direct https://typebot.io/${refTypebot} des pages`);
      }
    }
    if (!typebot) fail("assets/js", `${R} : aucun « typebot: 'ID' » conforme dans assets/js/*.js : rien n a ete compare`);
  }
  note(`STRUCTURE: ${R} (reference ${FOOTER_REF}) : ${bilanCoordonnees} ; videos ${videos} lanceur(s) = id de leur legende ; Typebot lien direct ×${total(liensTypebot)}, scripts ×${typebot}`);

  note(`STRUCTURE: ${scriptsChecked} script(s) compile(s); ${pages.length} page(s) lue(s), dont ${shellPages.length} avec coquille et ${pages.length - shellPages.length} redirection(s); ${linksChecked} lien(s) interne(s) resolu(s)`);
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

  // Le destinataire du brouillon est l email du footer (voir contactRef), pas une copie ici.
  const EMAIL = contactRef.email;
  if (!EMAIL) {
    fail(FOOTER_REF, "--forms: email de reference illisible : contrat d envoi de assets/js/forms.js non verifie");
    note("--forms: contrat d envoi NON VERIFIE (email de reference illisible)");
    return;
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
    const fallback = { hidden: false };
    const form = {
      hidden: true, dataset: {}, setAttribute() {},
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
      window: { SOURCINNO_CONFIG: { FORM_ENDPOINT: "", CONTACT_EMAIL: EMAIL }, location: { href: "" } },
      document: { readyState: "complete", querySelectorAll: () => [form], querySelector: () => fallback },
      FormData: TestFormData,
      fetch: () => { throw new Error("V1 ne doit pas appeler un service d envoi"); },
    };
    new Script(readFileSync(join(ROOT, "assets/js/forms.js"), "utf8"), { filename: "forms.js" })
      .runInNewContext(context);
    return { fields, form, fallback, send: () => submit({ preventDefault() {} }), status,
      location: context.window.location, get resets() { return resets; } };
  };
  try {
    const valid = runMail();
    if (valid.form.hidden !== false || valid.fallback.hidden !== true) {
      throw new Error("forms.js doit reveler le formulaire et masquer le repli a l initialisation");
    }
    valid.send();
    const mail = new URL(valid.location.href);
    if (mail.protocol !== "mailto:" || mail.pathname !== EMAIL ||
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
    /* 3 000 caracteres : une valeur collee par script passe outre maxlength,
       seul errorFor l arrete avant un brouillon mailto tronque. */
    for (const [name, value] of [["nom", ""], ["email", "invalide"], ["message", "court"], ["message", "x".repeat(3000)], ["rgpd", false]]) {
      const invalid = runMail();
      const field = invalid.fields.find((f) => f.name === name);
      if (name === "rgpd") field.checked = value;
      else field.value = value;
      invalid.send();
      if (invalid.location.href || invalid.status.dataset.state !== "error" || field.getAttribute("aria-invalid") !== "true") {
        const size = typeof value === "string" ? ` (${value.length} caracteres)` : "";
        throw new Error(`le champ invalide ${name}${size} doit empecher le brouillon et etre signale`);
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
    ["surtitres et accents clairs sur bleu nuit", "--accent-on-dark", "--navy", 4.5],
    ["lien survole du pied de page", "--link-hover-on-dark", "--navy-dark", 4.5],
    ["etiquette technique", "--tag-text", "fond .tag", 4.5],
    ["message d erreur", "--error", "--white", 4.5],
    ["aplat decoratif teal", "--teal", "--white", 3.0],
  ];
  /* Fond reellement vu sous une etiquette : le rgba() de la regle .tag, fondu sur --white. */
  const fondTag = (() => {
    const decl = cssRules(css).find(([sel]) => sel.trim() === ".tag")?.[1] || "";
    const m = decl.match(/background:\s*rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)/);
    const blanc = vars["--white"];
    if (!m || !/^#[0-9a-fA-F]{6}$/.test(blanc || "")) return null;
    const a = Number(m[4]);
    return "#" + [1, 3, 5].map((i, k) => Math.round(Number(m[k + 1]) * a + parseInt(blanc.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, "0")).join("");
  })();
  let worst = null;
  for (const [nom, fg, bg, min] of PAIRS) {
    /* Jetons de :root seulement : une couleur en dur ici serait une copie figee. */
    const resolve = (name) => (name === "fond .tag" ? fondTag : vars[name]);
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

  /* Nouvel onglet (Pass 42) : le nom accessible d un lien target="_blank" finit par
     « (nouvel onglet) ». Nom lu = son aria-label s il en a un (le texte visible ne compte
     alors plus), sinon son texte interieur sans commentaires, sans elements
     aria-hidden="true" (sans imbrication de la meme balise) et sans balises, span
     .visually-hidden compris. Un title, un texte apres </a> ou un commentaire ne comptent
     pas ; un aria-labelledby n est pas lu, donc refuse. */
  const NOUVEL_ONGLET = "(nouvel onglet)";
  let links = 0, buttons = 0, blanks = 0;
  const blankPages = new Set();
  for (const p of pages) {
    const body = p.html.slice(p.html.indexOf("<body"));

    for (const m of body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
      links++;
      const text = m[2].replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim();
      if (!text && !/aria-label=/.test(m[1]) && !/aria-labelledby=/.test(m[1])) {
        fail(p.rel, "lien sans texte ni aria-label : " + m[0].slice(0, 70));
      }
      if (!/\btarget\s*=\s*["']?_blank\b/i.test(m[1])) continue;
      blanks++;
      blankPages.add(p.rel);
      if (!/rel="[^"]*noopener/.test(m[1])) {
        fail(p.rel, 'lien target="_blank" sans rel="noopener" : ' + m[0].slice(0, 70));
      }
      if (/\baria-labelledby\s*=/i.test(m[1])) {
        fail(p.rel, 'lien target="_blank" nomme par aria-labelledby (non lu par ce controle) : ' + m[0].slice(0, 70));
        continue;
      }
      const label = m[1].match(/\baria-label\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const nom = (label ? label[1] ?? label[2] : m[2]
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<(\w+)\b[^>]*\baria-hidden\s*=\s*"true"[^>]*>[\s\S]*?<\/\1>/gi, "")
        .replace(/<[^>]+>/g, ""))
        .replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim();
      if (!nom.endsWith(NOUVEL_ONGLET)) {
        fail(p.rel, `lien target="_blank" dont le nom accessible ne finit pas par « ${NOUVEL_ONGLET} » (« ${nom.slice(-60)} ») : ` + m[0].slice(0, 70));
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
  note(`--a11y: ${blanks} lien(s) target="_blank" sur ${blankPages.size} page(s), chacun lu pour « ${NOUVEL_ONGLET} » en fin de nom accessible`);
}

/* ---------- --nojs ----------
   Le site doit rester LISIBLE sans JavaScript, pas seulement present dans le
   HTML. Mesure : `.reveal { opacity: 0 }` rendait chaque section invisible
   alors que le texte etait bien la — un controle qui lit le HTML brut passait
   au vert sur une page entierement blanche. */
function checkNoJs() {
  /* Masquer .reveal n est permis que sous une classe que seul un script pose :
     .reveal-wait (script en ligne de la coquille, retire par un minuteur) ou
     .reveal-on (site.js). Un <noscript> ne couvre pas site.js bloque ou en 404 :
     une regle `.reveal { opacity: 0 }` sans ces classes y laissait la page
     blanche, JavaScript actif. Regles lues bloc le plus interne d abord, la
     premiere regle d un @media comprise ; style.css ET chaque <style> de page. */
  const GATES = /^(html)?\.reveal-(wait|on)$/;
  const cachantes = [];
  const sources = [["assets/css/style.css", readFileSync(join(ROOT, "assets/css/style.css"), "utf8")],
    ...pages.flatMap((p) => styleBlocks(p.html).map((css) => [p.rel + " <style>", css]))];
  for (const [file, css] of sources) {
    for (const [selecteurs, declarations] of cssRules(css)) {
      if (!/opacity:\s*0\b|visibility:\s*hidden|display:\s*none/.test(declarations)) continue;
      for (const sel of selecteurs.split(";").pop().split(",").map((s) => s.trim())) {
        if (!/\.reveal(?![\w-])/.test(sel)) continue;
        cachantes.push(sel);
        if (!GATES.test(sel.split(/\s*[\s>+~]\s*/)[0])) {
          fail(file, `« ${sel} » masque .reveal sans classe .reveal-wait / .reveal-on posee par un script : la page reste blanche sans site.js`);
        }
      }
    }
  }

  /* Le script en ligne de la coquille est EXECUTE : il doit poser .reveal-wait
     et la retirer lui-meme apres 3 s au plus (+ 0,6 s de transition < 4 s). */
  const ran = new Map();
  const runGate = (code) => {
    const classes = new Set();
    const timers = [];
    new Script(code, { filename: "coquille reveal-wait" }).runInNewContext({
      document: { documentElement: { classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c) } } },
      setTimeout: (fn, ms) => timers.push([fn, ms]),
    });
    if (!classes.has("reveal-wait")) return "ne pose pas .reveal-wait";
    if (timers.length !== 1 || !(timers[0][1] <= 3000)) return "n arme pas un seul minuteur de 3 s au plus";
    timers[0][0]();
    return classes.has("reveal-wait") ? "son minuteur ne retire pas .reveal-wait" : "";
  };
  for (const p of shellPages) {
    if (/class="[^"]*\breveal-(wait|on)\b/.test(p.html)) fail(p.rel, "classe .reveal-wait / .reveal-on ecrite dans le HTML : elle masquerait sans JavaScript");
    if (!classTokens(p.html).includes("reveal")) continue;
    // Sans site.js, .reveal-on n est jamais posee : la page reste sur le minuteur seul.
    if (!/<script\b[^>]*\bsrc="\/assets\/js\/site\.js(\?v=[0-9a-f]{8})?"/.test(live(p.html))) {
      fail(p.rel, "page avec des sections .reveal qui ne charge pas /assets/js/site.js");
    }
    const gates = [...p.html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((c) => c.includes("reveal-wait"));
    if (gates.length !== 1) { fail(p.rel, `${gates.length} script(s) en ligne posant .reveal-wait, 1 attendu (tools/shell/header.html)`); continue; }
    if (!ran.has(gates[0])) {
      let why;
      try { why = runGate(gates[0]); } catch (error) { why = "erreur : " + error.message; }
      ran.set(gates[0], why);
    }
    if (ran.get(gates[0])) fail(p.rel, "le script en ligne .reveal-wait " + ran.get(gates[0]));
  }

  /* Un formulaire sans action ferait un GET sur la page courante : nom, email
     et message dans l URL. Il est donc livre hidden, repli visible ; seul
     forms.js, une fois execute, les inverse. */
  for (const p of pages) {
    for (const m of p.html.matchAll(/<form\b([^>]*)>/gi)) {
      if (!/data-contact-form/.test(m[1])) continue;
      if (/\baction=/.test(m[1])) fail(p.rel, "le formulaire porte un action : verifier qu il ne renvoie pas les donnees en clair dans l URL");
      // L attribut hidden lui-meme (hidden, hidden="") ; ni aria-hidden, ni data-hidden, ni une valeur citee.
      if (!/(^|\s)hidden(?=[\s>=/]|$)/.test(m[1].replace(/"[^"]*"/g, '""'))) fail(p.rel, "le formulaire doit etre livre hidden : sans forms.js il ferait un GET avec les donnees personnelles dans l URL");
      if (!/<p\b(?![^>]*\bhidden\b)[^>]*\bdata-form-fallback\b/.test(p.html)) {
        fail(p.rel, "aucun moyen de contact de repli visible (data-form-fallback) tant que le formulaire est masque");
      }
    }
  }

  note(`--nojs: ${shellPages.length} page(s) verifiee(s); ${cachantes.length} selecteur(s) masquant .reveal recense(s) (${cachantes.join(", ") || "aucun"}); ${ran.size} script(s) .reveal-wait execute(s)`);
}

/* ---------- --tiers ----------
   Tout hote externe appele par une page doit etre annonce dans la politique
   de confidentialite : un appel a un tiers transmet l adresse IP du visiteur. */
function checkTiers() {
  const politique = pages.find((p) => p.rel === "politique-confidentialite/index.html");
  if (!politique) { fail("politique-confidentialite/index.html", "page absente"); return; }
  const hotes = new Set();
  const add = (host) => {
    const h = host.toLowerCase();
    if (h.endsWith("sourcinno.com") || h === "schema.org" || h === "www.schema.org") return;
    hotes.add(h);
  };
  for (const p of pages) {
    const zone = p.html.slice(0, p.html.indexOf("</head>") + 7) + p.html.slice(p.html.indexOf("<body"));
    // ponytail: count loaded resources, not ordinary links a visitor may choose to open.
    for (const m of zone.matchAll(/<(?:script|iframe|img|link|source)\b[^>]*\b(?:src|href)="https?:\/\/([a-z0-9.-]+)/gi)) add(m[1]);
    // Un lecteur srcdoc charge son hote au clic, sans attribut src lisible ci-dessus.
    for (const s of p.html.matchAll(/\bsrcdoc="([^"]*)"/gi)) {
      for (const m of s[1].matchAll(/https:\/\/([a-z0-9.-]+)/gi)) add(m[1]);
    }
  }
  // Hotes appeles a l execution par les scripts livres ; _v2 est range, jamais charge ;
  // VENDOR (code tiers epingle) nomme les hotes que les reglages du bot Typebot choisissent.
  for (const f of allFiles.filter((f) => f.endsWith(".js") && !/[\\/]_v2[\\/]/.test(f) && !isVendor(f))) {
    for (const m of readFileSync(f, "utf8").matchAll(/https:\/\/([a-z0-9.-]+)/gi)) add(m[1]);
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
  note(`--tiers: ${hotes.size} hote(s) externe(s) charge(s) par les pages et leurs scripts${hotes.size ? " : " + [...hotes].join(", ") : ""}`);
}

/* ---------- --seo ---------- */
function checkSeo() {
  const sitemap = existsSync(join(ROOT, "sitemap.xml")) ? readFileSync(join(ROOT, "sitemap.xml"), "utf8") : "";
  const indexed = pages.filter((p) => !isStub(p) && p.rel !== "404.html");
  const expectedUrls = new Set(indexed.map((p) => "https://www.sourcinno.com/" + p.rel.replace(/index\.html$/, "")));
  const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const listedUrls = locs(sitemap);
  if (!sitemap) fail("sitemap.xml", "sitemap absent");
  // Une URL en double dans un meme sitemap echoue ; la page Publications figure dans deux sitemaps (la racine et
  // celui du blog), ce que le protocole des sitemaps admet.
  if (new Set(listedUrls).size !== listedUrls.length) fail("sitemap.xml", "URL dupliquee");
  // Les autres sitemaps du site : chaque ligne `Sitemap:` de robots.txt sous https://www.sourcinno.com/ (celui de la
  // racine deja lu), lu sur le disque ; ses URL s ajoutent aux listees.
  const robots = existsSync(join(ROOT, "robots.txt")) ? readFileSync(join(ROOT, "robots.txt"), "utf8") : "";
  const autres = new Set([...robots.matchAll(/^Sitemap:\s*https:\/\/www\.sourcinno\.com\/(\S+?)\s*$/gim)].map((m) => m[1]).filter((f) => f !== "sitemap.xml"));
  for (const f of autres) {
    if (!existsSync(join(ROOT, f))) { fail("robots.txt", `le sitemap ${f} qu il nomme est absent`); continue; }
    const urls = locs(readFileSync(join(ROOT, f), "utf8"));
    if (new Set(urls).size !== urls.length) fail(f, "URL dupliquee");
    listedUrls.push(...urls);
  }
  for (const url of expectedUrls) {
    if (!listedUrls.includes(url)) fail("sitemap.xml", `l URL ${url} n est pas listee`);
  }
  for (const url of listedUrls) {
    if (!expectedUrls.has(url)) fail("sitemap.xml", `l URL ${url} est retiree ou inconnue`);
  }
  for (const p of pages) {
    if (isStub(p) || p.rel === "404.html") continue;
    for (const prop of ["og:title", "og:description", "og:url", "og:type"]) {
      if (!new RegExp(`property="${prop}"`).test(p.html)) fail(p.rel, `meta ${prop} absente`);
    }
    const title = attr(p.html, /<title>([\s\S]*?)<\/title>/i) || "";
    if (title.length > 65) {
      // Page d article (gtm-blog) : son titre est celui de l article, au proprietaire de le raccourcir : une note.
      const msg = `<title> trop long pour Google: ${title.length} caracteres (max 65)`;
      if (/^publications\/[^/]+\/index\.html$/.test(p.rel)) note(`${p.rel}: ${msg}`); else fail(p.rel, msg);
    }
    if (title.length < 15) fail(p.rel, `<title> trop court: ${title.length} caracteres`);
    const desc = attr(p.html, /<meta name="description" content="([^"]*)"/i) || "";
    if (desc.length > 165) fail(p.rel, `meta description trop longue: ${desc.length} caracteres (max 165)`);
    if (desc.length < 70) fail(p.rel, `meta description trop courte: ${desc.length} caracteres (min 70)`);
  }
  note(`--seo: meta et sitemap verifies sur ${pages.filter((p) => !isStub(p) && p.rel !== "404.html").length} page(s) indexable(s)`);

  // JSON-LD : chaque objet "@type": "Service" (a toute profondeur) a une url vers une page locale existante
  // dont le <title> ou le <h1> (balises retirees, entites decodees) contient son "name", casse comprise.
  const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", laquo: "«", raquo: "»", mdash: "—", ndash: "–", eacute: "é", egrave: "è", ecirc: "ê", agrave: "à", ccedil: "ç" };
  const decode = (s) => s.replace(/<[^>]*>/g, "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (NAMED[e] ?? m)).trim();
  const isService = (t) => t === "Service" || (Array.isArray(t) && t.includes("Service"));
  const services = [];
  const collect = (node, file) => {
    if (Array.isArray(node)) { for (const v of node) collect(v, file); return; }
    if (!node || typeof node !== "object") return;
    if (isService(node["@type"])) services.push({ file, name: node.name, url: node.url });
    for (const v of Object.values(node)) collect(v, file);
  };
  for (const p of pages) {
    for (const m of p.html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
      let data;
      try { data = JSON.parse(m[1]); } catch (e) { fail(p.rel, "JSON-LD illisible (JSON.parse) : " + e.message); continue; }
      collect(data, p.rel);
    }
  }
  if (services.length === 0) fail("index.html", "JSON-LD : aucun objet Service trouve (sujet absent)");
  for (const sv of services) {
    if (typeof sv.name !== "string" || !sv.name.trim()) { fail(sv.file, `JSON-LD Service sans name (url ${sv.url})`); continue; }
    const m = typeof sv.url === "string" && sv.url.match(/^https:\/\/www\.sourcinno\.com\/(.*)$/);
    if (!m) { fail(sv.file, `JSON-LD Service "${sv.name}" : url hors du site ou absente (${sv.url})`); continue; }
    const path = m[1].split(/[?#]/)[0];
    const rel = path === "" || path.endsWith("/") ? path + "index.html" : path;
    const target = pages.find((p) => p.rel === rel || p.rel === rel + "/index.html");
    if (!target) { fail(sv.file, `JSON-LD Service "${sv.name}" : la page ${sv.url} n existe pas`); continue; }
    const title = decode(attr(target.html, /<title>([\s\S]*?)<\/title>/i) || "");
    const h1 = decode(attr(target.html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || "");
    if (!title.includes(sv.name) && !h1.includes(sv.name)) {
      fail(sv.file, `JSON-LD Service "${sv.name}" absent du <title> ("${title}") et du <h1> ("${h1}") de ${target.rel}`);
    }
  }
  note(`--seo: JSON-LD : ${services.length} Service(s) verifie(s) (url locale existante, name dans le <title> ou le <h1> de la page cible)`);
}

/* ---------- tests executes (--all) ---------- */
function runTests() {
  for (const f of ["tools/test-ia-embeds.mjs"]) {
    try {
      // --experimental-vm-modules : test-ia-embeds simule l import() du SDK avec vm.SyntheticModule.
      note(`${f}: ${runNode(["--experimental-vm-modules", join(ROOT, f)]).trim()}`);
    } catch (e) {
      const lines = String(e.stderr || "").split("\n").map((l) => l.trim()).filter(Boolean);
      fail(f, "test en echec : " + (timedOut(e) || !lines.length ? runFailure(e) : lines.find((l) => /^\w*Error\b/.test(l)) || lines.at(-1)));
    }
  }
  // La liste du blog de publications/index.html = les fichiers de publications/articles/, verifies par le
  // moteur gtm-blog (liste, blog.css et blog.js, images, liens). Moteur absent = echec nomme, jamais un vert.
  const f = "blog.mjs check";
  const parDefaut = resolve(ROOT, "../../_AI_SKILLS/skill-gtm-blog");
  const dossier = process.env.GTM_BLOG_DIR ? resolve(process.env.GTM_BLOG_DIR) : parDefaut;
  const moteur = join(dossier, "scripts/blog.mjs");
  if (!existsSync(moteur)) {
    fail(f, process.env.GTM_BLOG_DIR
      ? `moteur gtm-blog introuvable : ${moteur} (GTM_BLOG_DIR) ; le chemin par defaut ${join(parDefaut, "scripts/blog.mjs")} n est pas essaye quand GTM_BLOG_DIR est defini`
      : `moteur gtm-blog introuvable : GTM_BLOG_DIR non defini et chemin par defaut ${moteur} absent`);
    return;
  }
  try {
    note(`${f}: ${runNode([moteur, "check", ROOT]).trim()}`);
  } catch (e) {
    const lines = String(e.stderr || "").split("\n").map((l) => l.trim()).filter(Boolean);
    fail(f, "en echec : " + (timedOut(e) || !lines.length ? runFailure(e) : lines.join(" | ")));
  }
}

/* ---------- run ---------- */
checkStructure();
if (want("--forms")) checkForms();
if (want("--legal")) checkLegal();
if (want("--a11y")) checkA11y();
if (want("--nojs")) checkNoJs();
if (want("--tiers")) checkTiers();
if (want("--seo")) checkSeo();
if (args.has("--all")) runTests();

for (const n of notes) console.log("  " + n);
if (failures.length) {
  console.error(`\nECHEC — ${failures.length} probleme(s):`);
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(`\nOK — aucun probleme sur ${pages.length} page(s).`);
