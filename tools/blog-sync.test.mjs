import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The real tool is a script (top-level await, process.exit, ROOT = the parent of its own folder): each case copies it
// into a throw-away tree under the system temp folder and starts it there. Trees run eight at a time (one Node start
// each; tools/check.mjs stops a test after 30 s) and are all removed at the end, pass or fail.
const TOOL = fileURLToPath(new URL('./blog-sync.mjs', import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), 'blog-sync-test-'));
const START = '<!-- blog-sync:debut -->', END = '<!-- blog-sync:fin -->', PAD = '      ';
const PAGE0 = `<div id="blog-list">\n${PAD}${START}\n${PAD}${END}\n</div>\n`;
const REL = 'tools/blog/article-un.html', REL2 = 'tools/blog/article-deux.html';
// Line 1 of every file of tools/blog/: the list data of its post (the tool's HEADER rule).
const head = (titre, date, etiquette, rang) => `<!-- blog: titre="${titre}" date="${date}" etiquette="${etiquette}"${rang === undefined ? '' : ` rang="${rang}"`} -->`;
const HEAD1 = head('Article &quot;un&quot;', '2026-03-02', 'IA'), HEAD2 = head('Article deux &amp; co &lt;3', '2026-03-01', 'Venture Building');
const BODY2 = '<p>deux</p>\n';

let trees = 0, starts = 0;
function tree(files = {}) {
  const root = join(TMP, String(++trees));
  const put = (rel, text) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text); };
  mkdirSync(join(root, 'tools/blog'), { recursive: true });
  copyFileSync(TOOL, join(root, 'tools/blog-sync.mjs'));
  put('publications/index.html', PAGE0); put('assets/img/blog/pic-1.png', 'png');
  for (const [rel, text] of Object.entries(files)) put(rel, text);
  const run = (...flags) => new Promise((done) => {
    starts++;
    const child = spawn(process.execPath, [join(root, 'tools/blog-sync.mjs'), ...flags]);
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; }); child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => done({ code, out, err }));
  });
  const page = () => readFileSync(join(root, 'publications/index.html'), 'utf8');
  const list = () => { const p = page(); return p.slice(p.indexOf(START) + START.length, p.indexOf(END)); };
  return { put, run, page, list, drop: (rel) => rmSync(join(root, rel), { recursive: true }) };
}

// The one output of the tool, written out in full: a dépliant per file, title and date from its header.
const depliant = (tag, h3, time, lines) => [`<details class="disclosure disclosure--card" data-tag="${tag}">`, '  <summary>',
  `    <span class="tags"><span class="tag">${tag}</span></span>`, `    <h3>${h3}</h3>`,
  `    <span class="card__meta">${time}</span>`, '  </summary>',
  '  <div class="blog-body">', ...lines.map((l) => '    ' + l), '  </div>', '</details>'];
const DEP1 = (lines) => depliant('IA', 'Article "un"', '<time datetime="2026-03-02">2 mars 2026</time>', lines);
const DEP2 = depliant('Venture Building', 'Article deux &amp; co &lt;3', '<time datetime="2026-03-01">1er mars 2026</time>', ['<p>deux</p>']);
const listOf = (...blocks) => '\n' + blocks.flat().map((l) => PAD + l).join('\n') + '\n' + PAD;
const titles = (t) => [...t.list().matchAll(/<h3>([^<]*)<\/h3>/g)].map((m) => m[1]);
const times = (t) => [...t.list().matchAll(/<time datetime="([^"]*)">([^<]*)<\/time>/g)].map((m) => `${m[1]} ${m[2]}`);

// One accepted document per family of rules; every `ok` tag of RULES below is in one of them.
const DOCS = {
  text: `<img src="/assets/img/blog/pic-1.png" alt="Une image d'essai" width="10" height="5" loading="lazy">
<h4>Un intertitre</h4>
<p>Un <strong>gras</strong>, un <em>italique</em> et un <a href="https://example.com/a?b=1&amp;c=2" target="_blank" rel="noopener">lien<span class="visually-hidden"> (nouvel onglet)</span></a>.</p>
<ul>
  <li>un</li>
</ul>
<ol>
  <li>deux</li>
</ol>
<figure class="band-figure">
  <button class="video-launch" type="button" data-video="abc_DEF-123" aria-label="Lire la vidéo : essai">
    <img src="/assets/img/blog/pic-1.png" alt="Vignette de la vidéo : essai" width="10" height="5" loading="lazy">
    <span aria-hidden="true">▶</span>
  </button>
  <figcaption><a href="https://www.youtube.com/watch?v=abc_DEF-123" target="_blank" rel="noopener">Vidéo : essai<span class="visually-hidden"> (nouvel onglet)</span></a></figcaption>
</figure>
`,
  table: `<table>
  <tr>
    <td></td>
    <th scope="col">Colonne A ("citation", B)</th>
    <th scope="col">Colonne <em>B</em>
      &amp; co</th>
  </tr>
  <tr>
    <th scope="row">Ligne 1</th>
    <td data-label="Colonne A (&quot;citation&quot;, B)">
      <p>Un <strong>texte</strong></p>
      <ul>
        <li>un</li>
      </ul>
    </td>
    <td data-label="Colonne B &amp; co">
      <ol>
        <li><em>deux</em></li>
      </ol>
    </td>
  </tr>
</table>
`,
};
// Each FORMAT rule of tools/blog-sync.mjs: tags it must admit (`ok`, found in DOCS[doc]) and tags it must refuse (`bad`;
// a pair gives the piece of the tag the tool quotes when the tag itself holds a « > »). Every rule also refuses its first
// `ok` tag behind a stray « <x » (the rule's leading ^, added below).
const A = 'target="_blank" rel="noopener"', IMG = 'alt="x" width="10" height="5" loading="lazy"';
const RULES = [
  { name: 'closing tags', doc: 'text', ok: ['</p>', '</h4>', '</ul>', '</ol>', '</li>', '</strong>', '</em>', '</a>', '</span>', '</figure>', '</figcaption>', '</button>'],
    bad: ['</div>', '</script>', '</h2>', '</p >', '</P>'] },
  { name: 'tags without attribute', doc: 'text', ok: ['<p>', '<h4>', '<ul>', '<ol>', '<li>', '<strong>', '<em>', '<figcaption>'],
    bad: ['<p class="x">', '<h4 id="t">', '<li style="color:red">', '<h2>', '<div>', '<br>', '<script>', '<P>', '<!-- note -->', ['<p', '<p']] },
  { name: 'link', doc: 'text', ok: [`<a href="https://example.com/a?b=1&amp;c=2" ${A}>`],
    bad: [`<a href="http://example.com/" ${A}>`, `<a href="javascript:alert(1)" ${A}>`, `<a href="/contact/" ${A}>`, '<a href="https://example.com/">',
      '<a href="https://example.com/" rel="noopener" target="_blank">', `<a href="https://example.com/ x" ${A}>`, `<a href="https://example.com/" ${A} onclick="x()">`] },
  { name: 'hidden mention', doc: 'text', ok: ['<span class="visually-hidden">'], bad: ['<span class="tag">', '<span>', '<span class="visually-hidden" style="x">'] },
  { name: 'decorative sign', doc: 'text', ok: ['<span aria-hidden="true">'], bad: ['<span aria-hidden="false">'] },
  { name: 'picture', doc: 'text', ok: ['<img src="/assets/img/blog/pic-1.png" alt="Une image d\'essai" width="10" height="5" loading="lazy">'],
    bad: [`<img src="/assets/img/pic-1.png" ${IMG}>`, `<img src="https://example.com/pic-1.png" ${IMG}>`, `<img src="/assets/img/blog/../pic-1.png" ${IMG}>`,
      '<img src="/assets/img/blog/pic-1.png" alt="" width="10" height="5" loading="lazy">', '<img src="/assets/img/blog/pic-1.png" width="10" height="5" loading="lazy">',
      '<img src="/assets/img/blog/pic-1.png" alt="x" height="5" loading="lazy">', '<img src="/assets/img/blog/pic-1.png" alt="x" width="10px" height="5" loading="lazy">',
      '<img src="/assets/img/blog/pic-1.png" alt="x" width="10" height="5" loading="eager">', `<img src="/assets/img/blog/pic-1.png" ${IMG} onerror="x()">`] },
  { name: 'video figure', doc: 'text', ok: ['<figure class="band-figure">'], bad: ['<figure>', '<figure class="x">'] },
  { name: 'video launcher', doc: 'text', ok: ['<button class="video-launch" type="button" data-video="abc_DEF-123" aria-label="Lire la vidéo : essai">'],
    bad: ['<button class="video-launch" type="submit" data-video="abc" aria-label="x">', '<button class="btn" type="button" data-video="abc" aria-label="x">',
      '<button class="video-launch" type="button" data-video="a b" aria-label="x">', '<button class="video-launch" type="button" data-video="abc" aria-label="">',
      '<button class="video-launch" type="button" data-video="abc" aria-label="x" onclick="x()">', '<button>'] },
  { name: 'table closing tags', doc: 'table', ok: ['</table>', '</tr>', '</th>', '</td>'], bad: ['</tbody>', '</thead>', '</tfoot>', '</caption>'] },
  { name: 'table tags without attribute', doc: 'table', ok: ['<table>', '<tr>', '<td>'],
    bad: ['<table class="x">', '<table style="width:100%">', '<table border="1">', '<tr id="r">', '<td style="color:red">', '<td onclick="x()">', '<td colspan="2">',
      '<td class="x">', '<tbody>', '<thead>', '<tfoot>', '<colgroup>', '<col>', '<caption>'] },
  { name: 'header cell', doc: 'table', ok: ['<th scope="col">', '<th scope="row">'], bad: ['<th>', '<th scope="rowgroup">', '<th class="x">', '<th scope="col" style="color:red">', '<th scope="col" colspan="2">'] },
  { name: 'cell with its column title', doc: 'table', ok: ['<td data-label="Colonne A (&quot;citation&quot;, B)">', '<td data-label="Colonne B &amp; co">'],
    bad: ['<td data-label="">', '<td data-label="x" onclick="x()">', '<td data-label="x" style="color:red">', '<td data-label="Colonne A ("citation", B)">', '<td data-label="a<b">',
      ['<td data-label="a>b">', '<td data-label="a>'], '<td data-etiquette="x">'] },
];
for (const rule of RULES) rule.bad.push('<x' + rule.ok[0]);

const cases = [], fails = [];
const add = (group, name, fn) => cases.push({ group, name, fn });
const refused = (r, t, message) => {
  assert.equal(r.code, 1, `exit ${r.code}, expected 1; stderr: ${r.err.trim() || '(empty)'}`);
  assert.ok(r.err.includes(message), `stderr does not hold « ${message} »: ${r.err.trim()}`);
  assert.ok(r.err.includes('rien n est ecrit'), 'stderr does not say that nothing is written');
  assert.equal(t.page(), PAGE0, 'the page changed although the tool refused');
};
const files2 = (text) => ({ [REL]: HEAD1 + '\n' + text, [REL2]: HEAD2 + '\n' + BODY2 });

// Accepted documents and the output. `ran` keeps each document's write run for the per-rule cases below.
const ran = {};
for (const [doc, text] of Object.entries(DOCS)) {
  const want = listOf(DEP1(text.split('\n').filter(Boolean)), DEP2);
  const t = tree(files2(text));
  ran[doc] = { t, first: t.run() };
  add('accepted', `${doc} document: each file a dépliant written line for line, its header never on the page`, async () => {
    const r = await ran[doc].first;
    assert.equal(r.code, 0, `exit ${r.code}: ${r.err.trim()}`);
    assert.match(r.out, /^BLOG: 2 article\(s\) \(IA 1, Venture Building 1, Startup 0\) lus dans tools\/blog\/ ; page reecrite\n$/);
    assert.equal(t.list(), want);
    assert.ok(!t.page().includes('<!-- blog:'), 'a header reached the page');
    const again = await t.run();
    assert.equal(again.code, 0); assert.match(again.out, /page inchangee/);
    const check = await t.run('--check');
    assert.equal(check.code, 0, check.err.trim()); assert.match(check.out, /^ {2}BLOG: liste conforme aux fichiers ; 2 article/);
    t.put(REL, (HEAD1 + '\n' + text).replace(/\n/g, '\r\n')); // the file's line endings do not count, header included
    const crlf = await t.run('--check');
    assert.equal(crlf.code, 0, 'CRLF text file: ' + crlf.err.trim());
  });
}
add('accepted', 'page out of date: --check exits 1 naming the first difference and writes nothing', async () => {
  const t = tree(files2(DOCS.text)), stale = await t.run('--check');
  assert.equal(stale.code, 1); assert.match(stale.err, /Blog perime — lancer: node tools\/blog-sync\.mjs/);
  assert.match(stale.err, /\+ fichiers : <details class="disclosure disclosure--card" data-tag="IA">/);
  assert.equal(t.page(), PAGE0);
});
add('accepted', 'unknown option refused', async () => { const t = tree(files2(DOCS.text)); refused(await t.run('--from'), t, 'option inconnue : --from'); });
for (const rule of RULES) {
  add('accepted', `${rule.name}: ${rule.ok.length} tag(s) admitted`, async () => {
    const r = await ran[rule.doc].first;
    assert.equal(r.code, 0, `exit ${r.code}: ${r.err.trim()}`);
    for (const tag of rule.ok) { assert.ok(DOCS[rule.doc].includes(tag), `fixture without ${tag}`); assert.ok(ran[rule.doc].t.list().includes(tag), `${tag} absent from the page`); }
  });
  for (const bad of rule.bad) {
    const [tag, quoted] = Array.isArray(bad) ? bad : [bad, bad];
    add('format refusal', `${rule.name}: ${tag}`, async () => {
      const t = tree({ [REL]: `${HEAD1}\n<p>avant</p>\n${tag}\n` });
      refused(await t.run(), t, `${REL} : balise ou attribut hors format « ${quoted.slice(0, 80)}`); // the tool quotes 80 characters
    });
  }
}
// The FORMAT list itself, read from the tool's source: exactly the rules above, each anchored at both ends.
add('format refusal', `the tool holds exactly ${RULES.length} FORMAT rules, each written /^…$/`, async () => {
  const src = readFileSync(TOOL, 'utf8'), block = src.match(/\nconst FORMAT = \[\n([\s\S]*?)\n\];\n/);
  assert.ok(block, 'no « const FORMAT = [ … ]; » block in the tool');
  const rules = block[1].split('\n').map((l) => l.trim()).filter(Boolean);
  assert.equal(rules.length, RULES.length, `FORMAT holds ${rules.length} rule(s), the test mirrors ${RULES.length}`);
  for (const r of rules) assert.match(r, /^\/\^<.*\$\/,$/, `rule not anchored: ${r}`);
});

// Line 1: the header. Accepted forms are in the cases above (quote, ampersand, less-than in a title; CRLF).
const BAD_HEADERS = [
  ['no header', '<p>x</p>\n', 'ligne 1 sans en-tete'],
  ['blank line before the header', `\n${HEAD1}\n<p>x</p>\n`, 'ligne 1 sans en-tete'],
  ['space before the header', ` ${HEAD1}\n<p>x</p>\n`, 'ligne 1 sans en-tete'],
  ['header on line 2 too', `${HEAD1}\n${HEAD1}\n<p>x</p>\n`, `balise ou attribut hors format « ${HEAD1.slice(0, 80)}`],
  ['header inside the body', `${HEAD1}\n<p>x</p>\n${HEAD2}\n`, `balise ou attribut hors format « ${HEAD2.slice(0, 80)}`],
  ['attributes in another order', '<!-- blog: date="2026-03-02" titre="x" etiquette="IA" -->\n<p>x</p>\n', 'en-tete hors format'],
  ['etiquette missing', '<!-- blog: titre="x" date="2026-03-02" -->\n<p>x</p>\n', 'en-tete hors format'],
  ['an extra attribute', '<!-- blog: titre="x" date="2026-03-02" etiquette="IA" auteur="y" -->\n<p>x</p>\n', 'en-tete hors format'],
  ['rang before etiquette', '<!-- blog: titre="x" date="2026-03-02" rang="1" etiquette="IA" -->\n<p>x</p>\n', 'en-tete hors format'],
  ['no space before -->', '<!-- blog: titre="x" date="2026-03-02" etiquette="IA"-->\n<p>x</p>\n', 'en-tete hors format'],
  ['text after the header', `${HEAD1} <p>x</p>\n`, 'en-tete hors format'],
  ['raw quote in the title', `${head('a "b" c', '2026-03-02', 'IA')}\n<p>x</p>\n`, 'en-tete hors format'],
  ['empty title', `${head('', '2026-03-02', 'IA')}\n<p>x</p>\n`, 'titre «  » hors format'],
  ['blank title', `${head(' ', '2026-03-02', 'IA')}\n<p>x</p>\n`, 'titre «   » hors format'],
  ['bare ampersand in the title', `${head('a & b', '2026-03-02', 'IA')}\n<p>x</p>\n`, 'titre « a & b » hors format'],
  ['other entity in the title', `${head('l&#39;IA', '2026-03-02', 'IA')}\n<p>x</p>\n`, 'titre « l&#39;IA » hors format'],
  ['raw less-than in the title', `${head('a<b', '2026-03-02', 'IA')}\n<p>x</p>\n`, 'titre « a<b » hors format'],
  ['raw greater-than in the title', `${head('a>b', '2026-03-02', 'IA')}\n<p>x</p>\n`, 'titre « a>b » hors format'],
  ...['2024-02-30', '2023-02-29', '1900-02-29', '2024-04-31', '2024-13-01', '2024-00-10', '2024-01-00', '2024-01-32', '2024-1-05', '24-01-05', '05/01/2024', '2024-01-05T10:00', ''].map((d) =>
    [`date « ${d} »`, `${head('x', d, 'IA')}\n<p>x</p>\n`, `date « ${d} » impossible`]),
  ...['ia', '⚡IA', 'VENTURE BUILDING', 'Tous', 'IA ', ''].map((e) =>
    [`etiquette « ${e} »`, `${head('x', '2026-03-02', e)}\n<p>x</p>\n`, `etiquette « ${e} » inconnue (connues : IA, Venture Building, Startup)`]),
  ...['0', '01', '-1', '1.5', 'x', ''].map((n) =>
    [`rang « ${n} »`, `${head('x', '2026-03-02', 'IA', n)}\n<p>x</p>\n`, `rang « ${n} » hors format`]),
];
for (const [name, text, message] of BAD_HEADERS) add('header refusal', name, async () => { const t = tree({ [REL]: text }); refused(await t.run(), t, `${REL} : ${message}`); });

// Order: date descending, then rang ascending (a file without rang after every ranked one of its date), then file name.
const one = (titre, date, etiquette, rang) => head(titre, date, etiquette, rang) + '\n<p>x</p>\n';
for (const [name, files, wantTitles, wantTimes] of [
  ['a twelfth file with the newest date is written first',
    { ...files2(DOCS.text), 'tools/blog/zz-nouveau.html': one('Nouveau', '2027-01-01', 'Startup') },
    ['Nouveau', 'Article "un"', 'Article deux &amp; co &lt;3'], ['2027-01-01 1er janvier 2027', '2026-03-02 2 mars 2026', '2026-03-01 1er mars 2026']],
  ['same date, no rang: file name ascending',
    { 'tools/blog/b.html': one('B', '2025-12-31', 'IA'), 'tools/blog/a.html': one('A', '2025-12-31', 'IA'), 'tools/blog/c.html': one('C', '2025-01-09', 'IA') },
    ['A', 'B', 'C'], ['2025-12-31 31 décembre 2025', '2025-12-31 31 décembre 2025', '2025-01-09 9 janvier 2025']],
  ['same date: rang ascending, then the files without rang by name; rang never crosses dates',
    { 'tools/blog/a.html': one('A', '2024-02-29', 'IA', 2), 'tools/blog/b.html': one('B', '2024-02-29', 'IA'), 'tools/blog/c.html': one('C', '2024-02-29', 'IA', 1),
      'tools/blog/d.html': one('D', '2024-02-29', 'IA', 10), 'tools/blog/e.html': one('E', '2000-02-29', 'IA', 1), 'tools/blog/f.html': one('F', '2024-03-01', 'IA', 3) },
    ['F', 'C', 'A', 'D', 'B', 'E'], ['2024-03-01 1er mars 2024', '2024-02-29 29 février 2024', '2024-02-29 29 février 2024', '2024-02-29 29 février 2024', '2024-02-29 29 février 2024', '2000-02-29 29 février 2000']],
  ['every month name', Object.fromEntries(['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'].map((m, k) =>
    [`tools/blog/m${String(k + 1).padStart(2, '0')}.html`, one(m, `2023-${String(k + 1).padStart(2, '0')}-1${k % 2}`, 'IA')])),
    ['décembre', 'novembre', 'octobre', 'septembre', 'août', 'juillet', 'juin', 'mai', 'avril', 'mars', 'février', 'janvier'],
    ['12', '11', '10', '09', '08', '07', '06', '05', '04', '03', '02', '01'].map((mm) => { const k = +mm - 1, m = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'][k]; return `2023-${mm}-1${k % 2} 1${k % 2} ${m} 2023`; })],
]) add('order', name, async () => {
  const t = tree(files), r = await t.run();
  assert.equal(r.code, 0, r.err.trim());
  assert.deepEqual(titles(t), wantTitles); assert.deepEqual(times(t), wantTimes);
});

// The other refusals named in the tool's header.
const IN = (text) => ({ [REL]: `${HEAD1}\n${text}` });
const TABLE = (cells) => `<table>\n<tr>\n<td></td>\n<th scope="col">Titre A</th>\n<th scope="col">Titre B</th>\n</tr>\n<tr>\n<th scope="row">L</th>\n${cells}\n</tr>\n</table>\n`;
for (const [name, files, message] of [
  ['crossed nesting', IN('<p><strong>x</p></strong>\n'), `${REL} : </p> ferme une autre balise`],
  ['closing tag never opened', IN('</p>\n'), `${REL} : </p> ferme une autre balise`],
  ['tag never closed', IN('<p>x\n'), `${REL} : <p> non ferme`],
  ['crossed nesting in a table', IN('<table>\n<tr>\n<td>x</tr>\n</td>\n</table>\n'), `${REL} : </tr> ferme une autre balise`],
  ['data-label of the other column', IN(TABLE('<td data-label="Titre B">x</td>\n<td data-label="Titre B">y</td>')), `${REL} : data-label « Titre B » ne reprend pas le titre de sa colonne (« Titre A »)`],
  ['data-label of a column without title', IN(TABLE('<td data-label="Titre A">x</td>\n<td data-label="Titre B">y</td>\n<td data-label="Titre C">z</td>')), `${REL} : data-label « Titre C » ne reprend pas le titre de sa colonne (aucun)`],
  ['data-label on the row title column', IN('<table>\n<tr>\n<td></td>\n<th scope="col">Titre A</th>\n</tr>\n<tr>\n<td data-label="Titre A">x</td>\n<td data-label="Titre A">y</td>\n</tr>\n</table>\n'), `${REL} : data-label « Titre A » ne reprend pas le titre de sa colonne (aucun)`],
  ['data-label case differs', IN(TABLE('<td data-label="titre a">x</td>\n<td data-label="Titre B">y</td>')), `${REL} : data-label « titre a » ne reprend pas le titre de sa colonne (« Titre A »)`],
  ['missing picture', IN(`<img src="/assets/img/blog/absente.png" ${IMG}>\n`), `${REL} : image absente /assets/img/blog/absente.png`],
  ['empty file', { [REL]: '' }, `${REL} : fichier vide`],
  ['file of blank lines', { [REL]: '\n  \n\t\n' }, `${REL} : fichier vide`],
  ['header and nothing else', { [REL]: `${HEAD1}\n\n  \n` }, `${REL} : fichier vide`],
  ['file that is not .html', { ...files2(DOCS.text), 'tools/blog/notes.txt': 'x' }, 'tools/blog/notes.txt : fichier inattendu'],
]) add('other refusal', name, async () => { const t = tree(files); refused(await t.run(), t, message); });
add('other refusal', 'no file in tools/blog/', async () => { const t = tree(); refused(await t.run(), t, 'aucun article dans tools/blog/'); });
add('other refusal', 'no tools/blog/ folder', async () => { const t = tree(); t.drop('tools/blog'); refused(await t.run(), t, 'aucun article dans tools/blog/'); });
add('other refusal', 'markers missing from the page', async () => {
  const t = tree(files2(DOCS.text)); t.put('publications/index.html', '<div id="blog-list"></div>\n');
  const r = await t.run(); assert.equal(r.code, 1); assert.match(r.err, /publications\/index\.html : marqueur <!-- blog-sync:debut --> trouve 0 fois, 1 attendu/);
  assert.equal(t.page(), '<div id="blog-list"></div>\n');
});
// Known limit, recorded as it is (PLAN § Code backlog): nesting is a stack of names, not a table grammar.
add('known limit', 'a td straight under a table passes', async () => {
  const r = await tree(IN('<table>\n<td>x</td>\n</table>\n')).run();
  assert.equal(r.code, 0, r.err.trim());
});

try {
  let next = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < cases.length) {
      const c = cases[next++];
      try { await c.fn(); } catch (e) { fails.push(`${c.group} — ${c.name} — ${String(e.message).split('\n')[0]}`); }
    }
  }));
} finally {
  rmSync(TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
const count = (group) => cases.filter((c) => c.group === group).length;
if (fails.length) {
  for (const f of fails) console.error('FAIL ' + f);
  console.error(`ECHEC blog-sync.test : ${fails.length} cas sur ${cases.length} en echec, le premier : ${fails[0]}`);
  process.exit(1);
}
console.log(`PASS: blog-sync on throw-away trees, ${cases.length} cases: ${count('accepted')} accepted (${RULES.length} FORMAT rules, dépliant written in full, header kept off the page, CRLF text file, stale page), ${count('format refusal')} format refusals (tfoot and each rule's leading ^ included, the rule count read from the tool), ${count('header refusal')} header refusals (line 1, title escaping, date, tag, rang), ${count('order')} order cases (date, rang, file name, French dates), ${count('other refusal')} other refusals (nesting, data-label against its column title, missing picture, empty file, not .html, no file, markers), ${count('known limit')} known limit; ${starts} tool starts`);
