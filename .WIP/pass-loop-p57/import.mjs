// p57 one-off import (offline), copied from .WIP/pass-loop-p54/import.mjs: each saved Wix `post-description`
// (wix/<slug>.html) → tools/blog/<slug>.html in the site format read by tools/blog-sync.mjs: p, h4, ul/ol/li, strong,
// em, a, img, the video figure. Nothing else.
// What it drops (text unchanged): Wix div/span wrappers, classes, inline styles, ids, data-*; empty-line blocks;
// viewer buttons; `u` everywhere (an underline outside a link disappears: on the site an underline means a link);
// `strong` inside a heading. h2 and h4 → h4. A `pre` block → one `p` per line (`pre` is not in the format).
// Learnt for p57: `em` (kept, headings included); the SVG children `line` and `g`; the divider
// (`data-hook="divider divider-single"`: nothing written, counted); the attached-file block
// (`data-hook="file-upload-viewer"`: consumed whole up to its `</button>`, nothing written, its name PRINTED).
// An unknown tag (table, …), an unknown `data-hook`, a nested list, text outside a block, a picture or video without
// its EXTRA entry (alt / caption, written by hand below) stops the run: never a silent skip.
// Needs wix/pictures.json (pictures.py build). usage (product root): node .WIP/pass-loop-p57/import.mjs
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const HERE = import.meta.dirname, WIX = join(HERE, 'wix'), OUT = join(HERE, '..', '..', 'tools', 'blog');
const PICS = JSON.parse(readFileSync(join(WIX, 'pictures.json'), 'utf8'));
// Site texts that Wix does not carry (its alt attributes are empty, its players have no title): listed for the owner.
// Each picture was looked at first (the 18 slides are in English): what the slide is about, no transcription.
const SLIDE = 'Diapositive';
const EXTRA = {
  'corporate-venture-building-4-engie-x-wefound': { video: ['témoignage du Corporate Startup Studio d’Engie, co-créé avec WeFound'] },
  'corporate-venture-building-en-1-mot': { alt: [
    `${SLIDE} de titre « Corp Angels » : une ampoule lumineuse sur fond violet`,
    `${SLIDE} de section « Corporates new challenge » : le nouveau défi des grands groupes`,
    `${SLIDE} « Issue » : l’innovation classique n’a pas fait naître de géants dans les grands groupes, exemple d’Accor et d’AirBnB`,
    `${SLIDE} « Cause » : le cœur de métier l’emporte toujours, marché connu contre champ des possibles, modèle opérationnel rigide`,
    `${SLIDE} « Answer » : les comités exécutifs veulent créer leurs propres startups, avec des logos de grands groupes`,
    `${SLIDE} de section « Corporate Venture Building »`,
    `${SLIDE} « What » : le corporate venture building, corsaire du grand groupe pour explorer de nouveaux territoires`,
    `${SLIDE} « Who » : le savoir-faire des entrepreneurs associé aux actifs du grand groupe`,
    `${SLIDE} « How » : schéma d’un studio qui crée des startups à partir des actifs d’une business unit`,
    `${SLIDE} « How » : les étapes IDEAup, STARTup et SCALEup et leurs acteurs`,
    `${SLIDE} « How much » : durées et budget par startup, comparaison avec l’accélérateur et le corporate venture capital, cas d’usage La Fabrique`,
    `${SLIDE} « Appendix » : illustrations d’idées à explorer par secteur`,
    `${SLIDE} d’annexe « Recruitment » (HRM) : enjeu du groupe, stratégie et proposition de valeur adjacente à explorer`,
    `${SLIDE} d’annexe « Telco » (iKido) : enjeu du groupe, stratégie et proposition de valeur adjacente à explorer`,
    `${SLIDE} d’annexe « Packaging or Home appliance » (NOrder) : enjeu du groupe, stratégie et proposition de valeur adjacente à explorer`,
    `${SLIDE} d’annexe « Consulting (IT, Mgt) » (AIstack) : enjeu du groupe, stratégie et proposition de valeur adjacente à explorer`,
    `${SLIDE} d’annexe « Consulting (Mgt, IT) » (CVB SaaS) : enjeu du groupe, stratégie et proposition de valeur adjacente à explorer`,
    `${SLIDE} d’annexe « Startups bank & early stage VC » (Fullstack Startup) : enjeu du groupe, stratégie et proposition de valeur adjacente à explorer`] },
  'corporate-venture-building-longer-to-startup-quicker-to-scaleup-1': { alt: ['Schéma de Bain & Company : trois cercles emboîtés, le cœur de métier, l’adjacence et l’« Engine 2 »'] },
  'todo-startup-structure-at-minimum': { alt: ['Légumes frais sur une table en bois, certains dans un sac en toile'] },
};
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = s => s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(\w+));/gi, (m, d, h, n) => {
  if (n && !(n in NAMED)) throw Error('unknown entity ' + m);
  return n ? NAMED[n] : String.fromCodePoint(parseInt(d ?? h, d ? 10 : 16));
});
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const tidy = s => { let t = s.replace(/\s+/g, ' '), prev; do { prev = t; t = t.replace(/<(strong|em)>\s*<\/\1>/g, ''); } while (t !== prev); return t.trim(); };
const IGNORED = new Set(['div', 'span', 'u', 'br', 'section', 'wow-image', 'svg', 'path', 'line', 'g', 'button']);
const HOOKS = /^(?:post-description|rcv-block[\w-]*|gap-spacer|web-link|divider divider-single|file-upload-viewer)$/;

function convert(slug, src) {
  const extra = EXTRA[slug] || {}; let nAlt = 0, nVideo = 0;
  const out = []; let buf = null, kind = null, list = null, inHeading = false, inPre = false, inLink = false;
  const seen = { dividers: 0, files: [], links: [], underlines: 0 };
  const need = (v, what) => { if (v === undefined) throw Error(`${slug}: ${what} sans entree EXTRA`); return v; };
  const open = k => { if (buf !== null) throw Error(`${slug}: bloc ${k} ouvert dans ${kind}`); buf = ''; kind = k; };
  const close = () => { const t = tidy(buf); const k = kind; buf = null; kind = null; return [k, t]; };
  for (let i = 0; i < src.length;) {
    if (src.startsWith('<!--', i)) { i = src.indexOf('-->', i) + 3; continue; }
    if (src[i] !== '<') {
      const j = src.indexOf('<', i); const raw = src.slice(i, j < 0 ? src.length : j); i = j < 0 ? src.length : j;
      if (buf !== null) buf += esc(decode(raw));
      else if (raw.trim()) throw Error(`${slug}: texte hors bloc « ${raw.trim().slice(0, 40)} »`);
      continue;
    }
    const j = src.indexOf('>', i); const tag = src.slice(i, j + 1); i = j + 1;
    const m = tag.match(/^<(\/?)([a-zA-Z][\w-]*)/); if (!m) throw Error(`${slug}: balise illisible ${tag.slice(0, 40)}`);
    const end = !!m[1], name = m[2].toLowerCase();
    if (name === 'figure' && !end) {
      const k = src.indexOf('</figure>', i); const inner = src.slice(i, k); i = k + '</figure>'.length;
      if (inner.replace(/<[^>]*>/g, '').trim()) throw Error(`${slug}: texte dans une figure`);
      if (/figure-IMAGE/.test(tag)) {
        const uri = need(inner.match(/<wow-image id="([^"]+)"/)?.[1], 'image sans wow-image'); const p = need(PICS[uri], `image ${uri}`);
        out.push(`<img src="/assets/img/blog/${p.file}" alt="${attr(need(extra.alt?.[nAlt++], 'image'))}" width="${p.width}" height="${p.height}" loading="lazy">`);
      } else if (/figure-VIDEO/.test(tag)) {
        const id = need(inner.match(/i\.ytimg\.com\/vi\/([\w-]+)\//)?.[1], 'video sans vignette'); const p = need(PICS['video-' + id], `vignette ${id}`);
        const label = need(extra.video?.[nVideo++], 'video');
        out.push(`<figure class="band-figure">`,
          `  <button class="video-launch" type="button" data-video="${id}" aria-label="Lire la vidéo : ${attr(label)}">`,
          `    <img src="/assets/img/blog/${p.file}" alt="Vignette de la vidéo : ${attr(label)}" width="${p.width}" height="${p.height}" loading="lazy">`,
          `    <span aria-hidden="true">▶</span>`,
          `  </button>`,
          `  <figcaption><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">Vidéo : ${esc(label)}<span class="visually-hidden"> (nouvel onglet)</span></a></figcaption>`,
          `</figure>`);
      } else throw Error(`${slug}: figure inconnue ${tag.slice(0, 80)}`);
      continue;
    }
    const hook = end ? undefined : tag.match(/\bdata-hook="([^"]*)"/)?.[1];
    if (hook !== undefined && !HOOKS.test(hook)) throw Error(`${slug}: bloc Wix inconnu data-hook="${hook}"`);
    if (hook === 'file-upload-viewer') { // attached file: a button holding the name, the extension and « Télécharger PDF • size »
      if (buf !== null) throw Error(`${slug}: fichier joint dans un bloc ${kind}`);
      const k = src.indexOf('</button>', i); if (k < 0) throw Error(`${slug}: fichier joint sans </button>`);
      const inner = src.slice(i, k); i = k + '</button>'.length;
      const part = h => need(inner.match(new RegExp(`data-hook="${h}"[^>]*>([^<]*)<`))?.[1], `fichier joint sans ${h}`);
      const fname = decode(part('file-upload-name')) + decode(part('file-upload-extension'));
      const all = decode(inner.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
      seen.files.push(`${fname} [texte Wix du bloc, non recopié : « ${all} »]`);
      continue;
    }
    if (hook === 'divider divider-single') { seen.dividers++; continue; } // its svg, line and blank div are ignored tags: nothing written
    if (name === 'u' && !end && !inLink) seen.underlines++;
    if (IGNORED.has(name)) continue;
    if (name === 'p') {
      if (list) continue; // Wix writes <li><p>…</p></li>: the li is the block
      if (!end) open('p'); else { const [, t] = close(); if (t) out.push(`<p>${t}</p>`); }
    } else if (name === 'h2' || name === 'h4') {
      if (!end) { open('h4'); inHeading = true; } else { inHeading = false; const [, t] = close(); if (t) out.push(`<h4>${t}</h4>`); }
    } else if (name === 'ul' || name === 'ol') {
      if (!end) { if (list) throw Error(`${slug}: liste imbriquee`); list = name; out.push(`<${name}>`); } else { out.push(`</${name}>`); list = null; }
    } else if (name === 'li') {
      if (!end) open('li'); else { const [, t] = close(); if (!t) throw Error(`${slug}: li vide`); out.push(`  <li>${t}</li>`); }
    } else if (name === 'pre') {
      if (!end) { open('pre'); inPre = true; } else {
        inPre = false; const raw = buf; buf = null; kind = null; let bold = false;
        for (const line of raw.split('\n')) {
          const startBold = bold; bold = (line.lastIndexOf('<strong>') > line.lastIndexOf('</strong>')) || (bold && !line.includes('</strong>'));
          const t = tidy((startBold ? '<strong>' : '') + line + (bold ? '</strong>' : ''));
          if (t) out.push(`<p>${t}</p>`);
        }
      }
    } else if (name === 'strong') {
      if (buf === null) throw Error(`${slug}: strong hors bloc`);
      if (!inHeading) buf += end ? '</strong>' : '<strong>';
    } else if (name === 'em') {
      if (buf === null) throw Error(`${slug}: em hors bloc`);
      buf += end ? '</em>' : '<em>';
    } else if (name === 'a') {
      if (end) { if (inLink) { buf += '<span class="visually-hidden"> (nouvel onglet)</span></a>'; inLink = false; } continue; }
      const href = tag.match(/\bhref="([^"]*)"/)?.[1];
      if (!href) continue; // the picture viewer's <a> has no address and never reaches here (figures are consumed whole)
      if (buf === null || !/^https:\/\//.test(href)) throw Error(`${slug}: lien inattendu ${tag.slice(0, 80)}`);
      buf += `<a href="${attr(decode(href))}" target="_blank" rel="noopener">`; inLink = true; seen.links.push(decode(href));
    } else throw Error(`${slug}: balise Wix inconnue <${name}>`);
  }
  if (buf !== null || list || inLink) throw Error(`${slug}: bloc non ferme`);
  if (nAlt !== (extra.alt?.length || 0) || nVideo !== (extra.video?.length || 0)) throw Error(`${slug}: entrees EXTRA non utilisees`);
  return { lines: out, seen };
}

mkdirSync(OUT, { recursive: true });
const report = [];
for (const f of readdirSync(WIX).filter(f => f.endsWith('.html')).sort()) {
  const slug = f.slice(0, -5), { lines, seen } = convert(slug, readFileSync(join(WIX, f), 'utf8'));
  writeFileSync(join(OUT, f), lines.join('\n') + '\n', 'utf8');
  const count = re => lines.filter(l => re.test(l)).length, all = lines.join('');
  console.log(`${f}: ${lines.length} lignes, p ${count(/^<p>/)}, h4 ${count(/^<h4>/)}, li ${count(/^ {2}<li>/)}, img ${count(/^<img /)}, video ${count(/^<figure /)}, em ${all.split('<em>').length - 1}, strong ${all.split('<strong>').length - 1}, liens ${seen.links.length}; laissés de côté : ${seen.dividers} séparateur(s), ${seen.files.length} fichier(s) joint(s), ${seen.underlines} soulignement(s) hors lien`);
  for (const l of seen.links) report.push(`LIEN  ${slug}: ${l}`);
  for (const x of seen.files) report.push(`PDF   ${slug}: ${x}`);
}
for (const l of report) console.log(l);
for (const [slug, e] of Object.entries(EXTRA)) { for (const [n, a] of (e.alt || []).entries()) console.log(`ALT   ${slug} #${n + 1}: ${a}`); for (const v of e.video || []) console.log(`VIDEO ${slug}: Vidéo : ${v} / Lire la vidéo : ${v}`); }
// French posts of the saved feed still without a text file: named, never silent.
const feed = readFileSync(join(WIX, 'feed.xml'), 'utf8');
const slugOf = link => decodeURIComponent(link.split('/').pop()).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
for (const m of feed.matchAll(/<link>\s*(?:<!\[CDATA\[)?(https:\/\/sourcinno\.wixsite\.com\/blog\/post\/[^\s<\]]+)/g)) {
  const s = slugOf(m[1]);
  if (!existsSync(join(OUT, s + '.html'))) console.log(`NON IMPORTE ${s} : garde sa carte et son lien Wix${s === 'sourcinno-startupstudiotypes' ? ' (son tableau : Pass 58)' : ''}`);
}
