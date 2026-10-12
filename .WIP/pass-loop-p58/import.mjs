// p58 one-off import (offline), copied from .WIP/pass-loop-p57/import.mjs (one fix: an emphasis holding only a
// space leaves that space, where p57 dropped it and glued two words): each saved Wix `post-description`
// (wix/<slug>.html; here ONE post) → tools/blog/<slug>.html in the site format read by tools/blog-sync.mjs: p, h4,
// ul/ol/li, strong, em, a, img, the video figure, and since Pass 58 the table tags. Nothing else.
// What it drops (text unchanged): Wix div/span wrappers, classes, inline styles, ids, data-*; empty-line blocks;
// viewer buttons; `u` everywhere (an underline outside a link disappears: on the site an underline means a link);
// `strong` inside a heading. h2 and h4 → h4. A `pre` block → one `p` per line (`pre` is not in the format).
// Kept from p57: `em`; the SVG children `line` and `g`; the divider (nothing written, counted); the attached-file
// block (consumed whole up to its `</button>`, nothing written, its name PRINTED).
// Learnt for p58:
// - the table (`table`, `colgroup`, `col`, `tbody`, `tr`, `td`; hooks `table-component`, `table-plugin-cell`):
//   row 1 and column 1 → `th` (scope col / row), the paragraphs of such a cell joined by a space, `strong` dropped as
//   inside a heading, a list there stops the run; the corner → an empty `td` (it must hold nothing but U+200B);
//   every other cell → `td data-label="<title of its column>"` holding its `p` / `ul` / `ol` blocks;
// - a link to an old address of sourcinno.com (a page this site does not have) is unwrapped: its words are kept,
//   the address and the words are PRINTED for the owner.
// An unknown tag, an unknown `data-hook`, a nested list, a table in a table, `colspan` / `rowspan`, text outside a
// block, a U+200B outside the corner, a picture or video without its EXTRA entry stops the run: never a silent skip.
// Needs wix/pictures.json (pictures.py build). usage (product root): node .WIP/pass-loop-p58/import.mjs
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const HERE = import.meta.dirname, WIX = join(HERE, 'wix'), OUT = join(HERE, '..', '..', 'tools', 'blog');
const PICS = JSON.parse(readFileSync(join(WIX, 'pictures.json'), 'utf8'));
// Site text that Wix does not carry (its alt attribute is empty): listed for the owner. The picture was looked at first.
const EXTRA = {
  'sourcinno-startupstudiotypes': { alt: ['Une gomme de crayon efface le début du mot « impossible » : il reste « possible »'] },
};
const ZWSP = String.fromCharCode(0x200B);
const OLD_SITE = /^https?:\/\/(?:www\.)?sourcinno\.com\//;
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = s => s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(\w+));/gi, (m, d, h, n) => {
  if (n && !(n in NAMED)) throw Error('unknown entity ' + m);
  return n ? NAMED[n] : String.fromCodePoint(parseInt(d ?? h, d ? 10 : 16));
});
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const plain = s => decode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
const tidy = s => { let t = s.replace(/\s+/g, ' '), prev; do { prev = t; t = t.replace(/<(strong|em)>(\s*)<\/\1>/g, '$2'); } while (t !== prev); return t.trim(); };
const IGNORED = new Set(['div', 'span', 'u', 'br', 'section', 'wow-image', 'svg', 'path', 'line', 'g', 'button']);
const HOOKS = /^(?:post-description|rcv-block[\w-]*|gap-spacer|web-link|divider divider-single|file-upload-viewer|table-component|table-plugin-cell)$/;

function convert(slug, src) {
  const extra = EXTRA[slug] || {}; let nAlt = 0, nVideo = 0;
  const out = []; let buf = null, kind = null, list = null, inHeading = false, inPre = false, inLink = false;
  let table = null, cell = null, dropped = null; // table { row, col, labels } ; cell { head, parts } ; dropped { href, at }
  const seen = { dividers: 0, files: [], links: [], dropped: [], underlines: 0, tables: 0 };
  const need = (v, what) => { if (v === undefined) throw Error(`${slug}: ${what} sans entree EXTRA`); return v; };
  const open = k => { if (buf !== null) throw Error(`${slug}: bloc ${k} ouvert dans ${kind}`); buf = ''; kind = k; };
  const close = () => { const t = tidy(buf); const k = kind; buf = null; kind = null; return [k, t]; };
  const pad = () => (cell ? '      ' : ''); // blocks of a table cell sit under `    <td …>`
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
      if (table) throw Error(`${slug}: figure dans un tableau`);
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
    if (name === 'u' && !end && !inLink && !dropped) seen.underlines++;
    if (IGNORED.has(name)) continue;
    if (name === 'p') {
      if (list) continue; // Wix writes <li><p>…</p></li>: the li is the block
      if (!end) open('p'); else { const [, t] = close(); if (cell?.head) cell.parts.push(t); else if (t) out.push(`${pad()}<p>${t}</p>`); }
    } else if (name === 'h2' || name === 'h4') {
      if (table) throw Error(`${slug}: titre dans un tableau`);
      if (!end) { open('h4'); inHeading = true; } else { inHeading = false; const [, t] = close(); if (t) out.push(`<h4>${t}</h4>`); }
    } else if (name === 'ul' || name === 'ol') {
      if (!end) {
        if (list) throw Error(`${slug}: liste imbriquee`);
        if (cell?.head) throw Error(`${slug}: liste dans une cellule de titre`);
        list = name; out.push(`${pad()}<${name}>`);
      } else { out.push(`${pad()}</${name}>`); list = null; }
    } else if (name === 'li') {
      if (!end) open('li'); else { const [, t] = close(); if (!t) throw Error(`${slug}: li vide`); out.push(`${pad()}  <li>${t}</li>`); }
    } else if (name === 'pre') {
      if (table) throw Error(`${slug}: pre dans un tableau`);
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
      if (!inHeading && !cell?.head) buf += end ? '</strong>' : '<strong>';
    } else if (name === 'em') {
      if (buf === null) throw Error(`${slug}: em hors bloc`);
      buf += end ? '</em>' : '<em>';
    } else if (name === 'a') {
      if (end) {
        if (dropped) { seen.dropped.push({ href: dropped.href, words: plain(buf.slice(dropped.at)) }); dropped = null; }
        else if (inLink) { buf += '<span class="visually-hidden"> (nouvel onglet)</span></a>'; inLink = false; }
        continue;
      }
      const href = tag.match(/\bhref="([^"]*)"/)?.[1];
      if (!href) continue; // the picture viewer's <a> has no address and never reaches here (figures are consumed whole)
      if (buf === null || inLink || dropped || !/^https:\/\//.test(href)) throw Error(`${slug}: lien inattendu ${tag.slice(0, 80)}`);
      if (OLD_SITE.test(decode(href))) { dropped = { href: decode(href), at: buf.length }; continue; } // words kept, no <a> written
      buf += `<a href="${attr(decode(href))}" target="_blank" rel="noopener">`; inLink = true; seen.links.push(decode(href));
    } else if (name === 'table') {
      if (!end) {
        if (table || buf !== null || list) throw Error(`${slug}: tableau dans un bloc ou dans un tableau`);
        const k = src.indexOf('</table>', i); if (k < 0) throw Error(`${slug}: tableau non ferme`);
        if (/\b(?:colspan|rowspan)=/.test(src.slice(i, k))) throw Error(`${slug}: colspan ou rowspan dans le tableau`);
        table = { row: 0, col: 0, labels: [] }; seen.tables++; out.push('<table>');
      } else { if (!table || cell) throw Error(`${slug}: </table> inattendu`); out.push('</table>'); table = null; }
    } else if (name === 'colgroup' || name === 'col' || name === 'tbody') {
      if (!table || cell) throw Error(`${slug}: <${name}> hors tableau`);
    } else if (name === 'tr') {
      if (!table || cell) throw Error(`${slug}: <tr> hors tableau ou dans une cellule`);
      if (!end) { table.row++; table.col = 0; out.push('  <tr>'); } else out.push('  </tr>');
    } else if (name === 'td') {
      if (!table) throw Error(`${slug}: <td> hors tableau`);
      if (!end) {
        if (cell || buf !== null) throw Error(`${slug}: cellule dans une cellule`);
        table.col++; cell = { head: table.row === 1 || table.col === 1, parts: [] };
        if (!cell.head) { const label = table.labels[table.col]; if (!label) throw Error(`${slug}: cellule sans titre de colonne`); out.push(`    <td data-label="${attr(label)}">`); }
      } else {
        if (!cell || buf !== null || list) throw Error(`${slug}: </td> inattendu`);
        if (cell.head) {
          const t = cell.parts.filter(Boolean).join(' ');
          if (table.row === 1 && table.col === 1) { // the corner
            if (t.replaceAll(ZWSP, '').trim()) throw Error(`${slug}: coin du tableau non vide « ${t} »`);
            out.push('    <td></td>');
          } else {
            if (!t) throw Error(`${slug}: cellule de titre vide`);
            if (table.row === 1) table.labels[table.col] = plain(t);
            out.push(`    <th scope="${table.row === 1 ? 'col' : 'row'}">${t}</th>`);
          }
        } else out.push('    </td>');
        cell = null;
      }
    } else throw Error(`${slug}: balise Wix inconnue <${name}>`);
  }
  if (buf !== null || list || inLink || dropped || table || cell) throw Error(`${slug}: bloc non ferme`);
  if (nAlt !== (extra.alt?.length || 0) || nVideo !== (extra.video?.length || 0)) throw Error(`${slug}: entrees EXTRA non utilisees`);
  if (out.join('').includes(ZWSP)) throw Error(`${slug}: U+200B hors du coin du tableau`);
  return { lines: out, seen };
}

mkdirSync(OUT, { recursive: true });
const report = [];
for (const f of readdirSync(WIX).filter(f => f.endsWith('.html')).sort()) {
  const slug = f.slice(0, -5), { lines, seen } = convert(slug, readFileSync(join(WIX, f), 'utf8'));
  writeFileSync(join(OUT, f), lines.join('\n') + '\n', 'utf8');
  const count = re => lines.filter(l => re.test(l)).length, all = lines.join('');
  console.log(`${f}: ${lines.length} lignes, p ${count(/^\s*<p>/)}, h4 ${count(/^<h4>/)}, li ${count(/^\s*<li>/)}, img ${count(/^<img /)}, video ${count(/^<figure /)}, tableau ${seen.tables} (tr ${count(/^ {2}<tr>/)}, th ${count(/^ {4}<th /)}, td ${count(/^ {4}<td/)}), em ${all.split('<em>').length - 1}, strong ${all.split('<strong>').length - 1}, liens gardés ${seen.links.length}, liens retirés ${seen.dropped.length}; laissés de côté : ${seen.dividers} séparateur(s), ${seen.files.length} fichier(s) joint(s), ${seen.underlines} soulignement(s) hors lien`);
  for (const l of seen.links) report.push(`LIEN  ${slug}: ${l}`);
  for (const d of seen.dropped) report.push(`LIEN RETIRE ${slug}: « ${d.words} » → ${d.href}`);
  for (const x of seen.files) report.push(`PDF   ${slug}: ${x}`);
}
for (const l of report) console.log(l);
for (const [slug, e] of Object.entries(EXTRA)) { for (const [n, a] of (e.alt || []).entries()) console.log(`ALT   ${slug} #${n + 1}: ${a}`); for (const v of e.video || []) console.log(`VIDEO ${slug}: Vidéo : ${v} / Lire la vidéo : ${v}`); }
// French posts of the saved feed still without a text file: named, never silent.
const feed = readFileSync(join(WIX, 'feed.xml'), 'utf8');
const slugOf = link => decodeURIComponent(link.split('/').pop()).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
let missing = 0;
for (const m of feed.matchAll(/<link>\s*(?:<!\[CDATA\[)?(https:\/\/sourcinno\.wixsite\.com\/blog\/post\/[^\s<\]]+)/g)) {
  const s = slugOf(m[1]);
  if (!existsSync(join(OUT, s + '.html'))) { missing++; console.log(`NON IMPORTE ${s} : garde sa carte et son lien Wix`); }
}
console.log(`NON IMPORTE : ${missing} article(s) français du flux sans fichier`);
