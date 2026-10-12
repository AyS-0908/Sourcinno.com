// p57 Done When 2 — fidelity, copied from .WIP/pass-loop-p54/fidelity.mjs: for each saved Wix `post-description`
// (wix/<slug>.html), the text of its dépliant body in publications/index.html equals the Wix text. Same treatment on
// both sides: figures removed, block tags → a space, inline tags → nothing, entities decoded, whitespace collapsed.
// Excluded and LISTED: on the Wix side the content of each figure (picture viewer, video player: labels are
// attributes, any text is printed) and each attached-file block (`data-hook="file-upload-viewer"` up to its
// `</button>`: file name, extension and « Télécharger PDF • size », printed); on the site side each figure
// (caption link) and each hidden « (nouvel onglet) » span.
// Differences from p54: the attached-file exclusion; titles compared with whitespace collapsed (the feed title
// « Corporate venture  BUILDING… » has a double space that tools/blog-sync.mjs collapses).
// usage (product root): [P57_ROOT=<other tree>] node .WIP/pass-loop-p57/fidelity.mjs   (exit 1 on any difference)
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const HERE = import.meta.dirname, WIX = join(HERE, 'wix'), ROOT = resolve(process.env.P57_ROOT || join(HERE, '..', '..'));
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = s => s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(\w+));/gi, (m, d, h, n) => n ? (NAMED[n] ?? m) : String.fromCodePoint(parseInt(d ?? h, d ? 10 : 16)));
const INLINE = /<\/?(?:span|strong|em|a|u)\b[^>]*>/gi;
const words = html => decode(html.replace(/<!--[\s\S]*?-->/g, ' ').replace(INLINE, '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const slug = link => decodeURIComponent(link.split('/').pop()).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const feed = readFileSync(join(WIX, 'feed.xml'), 'utf8');
const titles = new Map([...feed.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)].map(m => {
  const f = t => (m[1].match(new RegExp(`<${t}\\b[^>]*>([\\s\\S]*?)</${t}>`))?.[1] ?? '').replace(/^<!\[CDATA\[|\]\]>$/g, '').trim();
  return [slug(f('link')), decode(f('title')).replace(/\s+/g, ' ').trim()];
}));
const page = readFileSync(join(ROOT, 'publications/index.html'), 'utf8');
const list = page.slice(page.indexOf('<!-- blog-sync:debut -->'), page.indexOf('<!-- blog-sync:fin -->'));
const details = [...list.matchAll(/<details\b[\s\S]*?<\/details>/g)].map(m => m[0]);
const FIGURE = /<figure\b[\s\S]*?<\/figure>/g, FILE = /<div\b[^>]*data-hook="file-upload-viewer"[\s\S]*?<\/button>/g;
let bad = 0, total = 0;
for (const f of readdirSync(WIX).filter(f => f.endsWith('.html')).sort()) {
  const name = f.slice(0, -5), title = titles.get(name);
  const src = readFileSync(join(WIX, f), 'utf8');
  const wixFigs = [...src.matchAll(/<figure\b[^>]*data-hook="figure-(\w+)"[\s\S]*?<\/figure>/g)];
  const wixFiles = [...src.matchAll(FILE)].map(m => words(m[0]));
  const wix = words(src.replace(FIGURE, ' ').replace(FILE, ' '));
  const d = details.find(x => words(x.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] ?? '') === title);
  if (!d) { bad++; console.log(`ABSENT    ${name}: aucun dépliant titré « ${title} » entre les marqueurs`); continue; }
  const body = d.slice(d.indexOf('<div class="blog-body">') + 23, d.lastIndexOf('</div>'));
  const figs = [...body.matchAll(FIGURE)].map(m => words(m[0].replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, '')));
  const rest = body.replace(FIGURE, ' ');
  const hidden = [...rest.matchAll(/<span class="visually-hidden">([\s\S]*?)<\/span>/g)].map(m => m[1].trim());
  const site = words(rest.replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, ''));
  const a = wix ? wix.split(' ') : [], b = site ? site.split(' ') : [];
  const same = wix === site; if (!same) bad++; else total += a.length;
  const kinds = wixFigs.reduce((o, m) => (o[m[1]] = (o[m[1]] || 0) + 1, o), {}), withText = wixFigs.filter(m => words(m[0]));
  console.log(`${same ? 'IDENTIQUE' : 'DIFFERENT'} ${name}: Wix ${a.length} mots, site ${b.length} mots`);
  console.log(`   exclus côté Wix : ${wixFigs.length} figure(s) [${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(', ')}], dont avec texte ${withText.length}${withText.map(m => ' « ' + words(m[0]) + ' »').join('')} ; ${wixFiles.length} fichier(s) joint(s)${wixFiles.map(x => ' « ' + x + ' »').join('')}`);
  console.log(`   exclus côté site : ${figs.length} légende(s) de figure [${figs.join(' | ')}], ${hidden.length} mention(s) cachée(s) [${[...new Set(hidden)].join(' | ')}]`);
  if (!same) { const k = a.findIndex((w, i) => w !== b[i]); const at = k < 0 ? a.length : k; console.log(`   première différence au mot ${at + 1} : Wix « ${a.slice(Math.max(0, at - 4), at + 5).join(' ')} » / site « ${b.slice(Math.max(0, at - 4), at + 5).join(' ')} »`); }
}
console.log(`FIDELITE ${ROOT}: ${bad} article(s) différent(s) ou absent(s) ; ${total} mots identiques`);
process.exitCode = bad ? 1 : 0;
