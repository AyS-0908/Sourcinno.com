// p54 one-off import (offline): each saved Wix `post-description` (wix/<slug>.html) → tools/blog/<slug>.html
// in the site format read by tools/blog-sync.mjs: p, h4, ul/ol/li, strong, a, img, the video figure. Nothing else.
// What it drops (text unchanged): Wix div/span wrappers, classes, inline styles, ids, data-*; empty-line blocks;
// viewer buttons; `u` inside links; `strong` inside a heading. h2 and h4 → h4. A `pre` block → one `p` per line
// (`pre` is not in the format). An unknown tag, text outside a block, a picture or video without its EXTRA
// entry (alt / caption, written by hand below) stops the run: never a silent skip.
// Needs wix/pictures.json (pictures.py build). usage (product root): node .WIP/pass-loop-p54/import.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const HERE = import.meta.dirname, WIX = join(HERE, 'wix'), OUT = join(HERE, '..', '..', 'tools', 'blog');
const PICS = JSON.parse(readFileSync(join(WIX, 'pictures.json'), 'utf8'));
// Site texts that Wix does not carry (its alt attributes are empty, its players have no title): listed for the owner.
const EXTRA = {
  'enjeu-1-de-l-ia-sa-vitesse-d-evolution': { alt: [
    'Deux portraits d’un même homme générés par IA : approximatif à l’été 2022, réaliste au printemps 2023',
    'Graphique de l’université de Berkeley : depuis 1998, l’IA dépasse l’humain sur un nombre croissant de tâches, de plus en plus vite'] },
  'gpts-attention-1': { alt: ['Cinq assistants virtuels illustrés, chacun derrière un écran holographique'] },
  'l-ia-fait-le-job-de-700-personnes': { alt: ['Capture de BFM Business, bandeau « Klarna fait trembler Teleperformance »'] },
  'l-ia-modifie-t-elle-deja-le-marche-du-travail': { alt: ['Graphique : évolution du nombre de missions Upwork par catégorie depuis la sortie de ChatGPT, forte hausse du montage vidéo, baisse de la rédaction, de la traduction et du service client'] },
  'j-ai-essaye-chatgpt-une-fois': { video: ['l’audio de l’article'] },
  'ia-cas-d-usage': { video: ['discussion naturelle', 'image'] },
};
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = s => s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(\w+));/gi, (m, d, h, n) => {
  if (n && !(n in NAMED)) throw Error('unknown entity ' + m);
  return n ? NAMED[n] : String.fromCodePoint(parseInt(d ?? h, d ? 10 : 16));
});
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const tidy = s => s.replace(/\s+/g, ' ').replace(/<strong>\s*<\/strong>/g, '').trim();
const IGNORED = new Set(['div', 'span', 'u', 'br', 'section', 'wow-image', 'svg', 'path', 'button']);

function convert(slug, src) {
  const extra = EXTRA[slug] || {}; let nAlt = 0, nVideo = 0;
  const out = []; let buf = null, kind = null, list = null, inHeading = false, inPre = false, inLink = false;
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
    } else if (name === 'a') {
      if (end) { if (inLink) { buf += '<span class="visually-hidden"> (nouvel onglet)</span></a>'; inLink = false; } continue; }
      const href = tag.match(/\bhref="([^"]*)"/)?.[1];
      if (!href) continue; // the picture viewer's <a> has no address and never reaches here (figures are consumed whole)
      if (buf === null || !/^https:\/\//.test(href)) throw Error(`${slug}: lien inattendu ${tag.slice(0, 80)}`);
      buf += `<a href="${attr(decode(href))}" target="_blank" rel="noopener">`; inLink = true;
    } else throw Error(`${slug}: balise Wix inconnue <${name}>`);
  }
  if (buf !== null || list || inLink) throw Error(`${slug}: bloc non ferme`);
  if (nAlt !== (extra.alt?.length || 0) || nVideo !== (extra.video?.length || 0)) throw Error(`${slug}: entrees EXTRA non utilisees`);
  return out;
}

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(WIX).filter(f => f.endsWith('.html')).sort()) {
  const slug = f.slice(0, -5), lines = convert(slug, readFileSync(join(WIX, f), 'utf8'));
  writeFileSync(join(OUT, f), lines.join('\n') + '\n', 'utf8');
  const count = re => lines.filter(l => re.test(l)).length;
  console.log(`${f}: ${lines.length} lignes, p ${count(/^<p>/)}, h4 ${count(/^<h4>/)}, li ${count(/^ {2}<li>/)}, img ${count(/^<img /)}, video ${count(/^<figure /)}, liens ${lines.join('').split('<a href').length - 1 - count(/<figcaption>/)}`);
}
for (const [slug, e] of Object.entries(EXTRA)) { for (const a of e.alt || []) console.log(`ALT   ${slug}: ${a}`); for (const v of e.video || []) console.log(`VIDEO ${slug}: Vidéo : ${v} / Lire la vidéo : ${v}`); }
