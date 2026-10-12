import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The real tool is a script (top-level await, process.exit, ROOT = the parent of its own folder): each case copies it
// into a throw-away tree under the system temp folder and starts it with --from. Trees run eight at a time (one Node
// start each; tools/check.mjs stops a test after 30 s) and are all removed at the end, pass or fail.
const TOOL = fileURLToPath(new URL('./blog-sync.mjs', import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), 'blog-sync-test-'));
const START = '<!-- blog-sync:debut -->', END = '<!-- blog-sync:fin -->', PAD = '      ';
const PAGE0 = `<div id="blog-list">\n${PAD}${START}\n${PAD}${END}\n</div>\n`;
const REL = 'tools/blog/article-un.html';
const item = (title, path, category, date) => `<item><title><![CDATA[${title}]]></title><link>https://sourcinno.wixsite.com/blog/${path}</link><category><![CDATA[${category}]]></category><pubDate>${date}</pubDate></item>`;
const FEED = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n${[
  item('Article un', 'post/article-un', '⚡IA', 'Mon, 02 Mar 2026 10:00:00 GMT'),
  item('Article deux', 'post/article-deux', 'VENTURE BUILDING', 'Sun, 01 Mar 2026 10:00:00 GMT'),
  item('English one', 'en/post/english-one', 'STARTUP', 'Sat, 28 Feb 2026 10:00:00 GMT'),
].join('\n')}\n</channel></rss>\n`;

let trees = 0, starts = 0;
function tree(files = {}) {
  const root = join(TMP, String(++trees));
  const put = (rel, text) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text); };
  mkdirSync(join(root, 'tools/blog'), { recursive: true });
  copyFileSync(TOOL, join(root, 'tools/blog-sync.mjs'));
  put('publications/index.html', PAGE0); put('feed.xml', FEED); put('assets/img/blog/pic-1.png', 'png');
  for (const [rel, text] of Object.entries(files)) put(rel, text);
  const run = (...flags) => new Promise((done) => {
    starts++;
    const child = spawn(process.execPath, [join(root, 'tools/blog-sync.mjs'), '--from', join(root, 'feed.xml'), ...flags]);
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; }); child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => done({ code, out, err }));
  });
  const page = () => readFileSync(join(root, 'publications/index.html'), 'utf8');
  const list = () => { const p = page(); return p.slice(p.indexOf(START) + START.length, p.indexOf(END)); };
  return { put, run, page, list, drop: (rel) => rmSync(join(root, rel)) };
}

// The two outputs of the tool, written out in full: a dépliant when the text file exists, a card with its Wix link when not.
const depliant = (lines) => ['<details class="disclosure disclosure--card" data-tag="IA">', '  <summary>',
  '    <span class="tags"><span class="tag">IA</span></span>', '    <h3>Article un</h3>',
  '    <span class="card__meta"><time datetime="2026-03-02">2 mars 2026</time></span>', '  </summary>',
  '  <div class="blog-body">', ...lines.map((l) => '    ' + l), '  </div>', '</details>'];
const card = (title, slug, tag, time) => [`<article class="card" data-tag="${tag}">`, `  <p class="tags"><span class="tag">${tag}</span></p>`,
  `  <h3><a href="https://sourcinno.wixsite.com/blog/post/${slug}" target="_blank" rel="noopener">${title} <span aria-hidden="true">→</span><span class="visually-hidden"> (nouvel onglet)</span></a></h3>`,
  `  <p class="card__meta">${time}</p>`, '</article>'];
const CARD1 = card('Article un', 'article-un', 'IA', '<time datetime="2026-03-02">2 mars 2026</time>');
const CARD2 = card('Article deux', 'article-deux', 'Venture Building', '<time datetime="2026-03-01">1er mars 2026</time>');
const listOf = (...blocks) => '\n' + blocks.flat().map((l) => PAD + l).join('\n') + '\n' + PAD;

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
    <th scope="col">Colonne B</th>
  </tr>
  <tr>
    <th scope="row">Ligne 1</th>
    <td data-label="Colonne A (&quot;citation&quot;, B)">
      <p>Un <strong>texte</strong></p>
      <ul>
        <li>un</li>
      </ul>
    </td>
    <td data-label="Colonne B">
      <ol>
        <li><em>deux</em></li>
      </ol>
    </td>
  </tr>
</table>
`,
};
// Each FORMAT rule of tools/blog-sync.mjs: tags it must admit (`ok`, found in DOCS[doc]) and tags it must refuse (`bad`;
// a pair gives the piece of the tag the tool quotes when the tag itself holds a « > »).
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
  { name: 'table closing tags', doc: 'table', ok: ['</table>', '</tr>', '</th>', '</td>'], bad: ['</tbody>', '</thead>', '</caption>'] },
  { name: 'table tags without attribute', doc: 'table', ok: ['<table>', '<tr>', '<td>'],
    bad: ['<table class="x">', '<table style="width:100%">', '<table border="1">', '<tr id="r">', '<td style="color:red">', '<td onclick="x()">', '<td colspan="2">',
      '<td class="x">', '<tbody>', '<thead>', '<colgroup>', '<col>', '<caption>'] },
  { name: 'header cell', doc: 'table', ok: ['<th scope="col">', '<th scope="row">'], bad: ['<th>', '<th scope="rowgroup">', '<th class="x">', '<th scope="col" style="color:red">', '<th scope="col" colspan="2">'] },
  { name: 'cell with its column title', doc: 'table', ok: ['<td data-label="Colonne A (&quot;citation&quot;, B)">', '<td data-label="Colonne B">'],
    bad: ['<td data-label="">', '<td data-label="x" onclick="x()">', '<td data-label="x" style="color:red">', '<td data-label="Colonne A ("citation", B)">', '<td data-label="a<b">',
      ['<td data-label="a>b">', '<td data-label="a>'], '<td data-etiquette="x">'] },
];

const cases = [], fails = [];
const add = (group, name, fn) => cases.push({ group, name, fn });
const refused = (r, t, message) => {
  assert.equal(r.code, 1, `exit ${r.code}, expected 1; stderr: ${r.err.trim() || '(empty)'}`);
  assert.ok(r.err.includes(message), `stderr does not hold « ${message} »: ${r.err.trim()}`);
  assert.ok(r.err.includes('rien n est ecrit'), 'stderr does not say that nothing is written');
  assert.equal(t.page(), PAGE0, 'the page changed although the tool refused');
};

// Accepted documents and both outputs. `ran` keeps each document's write run for the per-rule cases below.
const ran = {};
for (const [doc, text] of Object.entries(DOCS)) {
  const lines = text.split('\n').filter(Boolean), want = listOf(depliant(lines), CARD2);
  const t = tree({ [REL]: text });
  ran[doc] = { t, first: t.run() };
  add('accepted', `${doc} document: dépliant written line for line, the article without a file as a Wix card`, async () => {
    const r = await ran[doc].first;
    assert.equal(r.code, 0, `exit ${r.code}: ${r.err.trim()}`);
    assert.match(r.out, /2 article\(s\) francais \(IA 1, Venture Building 1, Startup 0\), dont 1 complet\(s\) \(tools\/blog\/\), 1 anglais ignore\(s\) ; page reecrite/);
    assert.equal(t.list(), want);
    const again = await t.run();
    assert.equal(again.code, 0); assert.match(again.out, /page inchangee/);
    const check = await t.run('--check');
    assert.equal(check.code, 0, check.err.trim()); assert.match(check.out, /liste conforme au flux/);
    t.put(REL, text.replace(/\n/g, '\r\n')); // the file's line endings do not count
    const crlf = await t.run('--check');
    assert.equal(crlf.code, 0, 'CRLF text file: ' + crlf.err.trim());
  });
}
add('accepted', 'no text file: both articles are Wix cards, no dépliant', async () => {
  const t = tree(), r = await t.run();
  assert.equal(r.code, 0, r.err.trim()); assert.match(r.out, /dont 0 complet\(s\)/);
  assert.equal(t.list(), listOf(CARD1, CARD2));
  t.put(REL, DOCS.text);
  const stale = await t.run('--check'); // a text file appears: the page is out of date, and --check writes nothing
  assert.equal(stale.code, 1); assert.match(stale.err, /Blog perime/); assert.equal(t.list(), listOf(CARD1, CARD2));
});
for (const rule of RULES) {
  add('accepted', `${rule.name}: ${rule.ok.length} tag(s) admitted`, async () => {
    const r = await ran[rule.doc].first;
    assert.equal(r.code, 0, `exit ${r.code}: ${r.err.trim()}`);
    for (const tag of rule.ok) { assert.ok(DOCS[rule.doc].includes(tag), `fixture without ${tag}`); assert.ok(ran[rule.doc].t.list().includes(tag), `${tag} absent from the page`); }
  });
  for (const bad of rule.bad) {
    const [tag, quoted] = Array.isArray(bad) ? bad : [bad, bad];
    add('format refusal', `${rule.name}: ${tag}`, async () => {
      const t = tree({ [REL]: `<p>avant</p>\n${tag}\n` });
      refused(await t.run(), t, `${REL} : balise ou attribut hors format « ${quoted.slice(0, 80)}`); // the tool quotes 80 characters
    });
  }
}
// The other refusals named in the tool's header.
for (const [name, files, message] of [
  ['crossed nesting', { [REL]: '<p><strong>x</p></strong>\n' }, `${REL} : </p> ferme une autre balise`],
  ['closing tag never opened', { [REL]: '</p>\n' }, `${REL} : </p> ferme une autre balise`],
  ['tag never closed', { [REL]: '<p>x\n' }, `${REL} : <p> non ferme`],
  ['crossed nesting in a table', { [REL]: '<table>\n<tr>\n<td>x</tr>\n</td>\n</table>\n' }, `${REL} : </tr> ferme une autre balise`],
  ['missing picture', { [REL]: `<img src="/assets/img/blog/absente.png" ${IMG}>\n` }, `${REL} : image absente /assets/img/blog/absente.png`],
  ['empty file', { [REL]: '' }, `${REL} : fichier vide`],
  ['file of blank lines', { [REL]: '\n  \n\t\n' }, `${REL} : fichier vide`],
  ['file that is not .html', { 'tools/blog/notes.txt': 'x' }, 'tools/blog/notes.txt : fichier inattendu'],
  ['orphan file', { 'tools/blog/inconnu.html': '<p>x</p>\n' }, 'tools/blog/inconnu.html : aucun article francais du flux ne porte ce nom'],
  ['file named after an English post', { 'tools/blog/english-one.html': '<p>x</p>\n' }, 'tools/blog/english-one.html : aucun article francais du flux ne porte ce nom'],
]) add('other refusal', name, async () => { const t = tree(files); refused(await t.run(), t, message); });
// Known limit, recorded as it is (PLAN § Code backlog): nesting is a stack of names, not a table grammar.
add('known limit', 'a td straight under a table passes', async () => {
  const r = await tree({ [REL]: '<table>\n<td>x</td>\n</table>\n' }).run();
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
console.log(`PASS: blog-sync on throw-away trees, ${cases.length} cases: ${count('accepted')} accepted (${RULES.length} FORMAT rules, dépliant and Wix card written in full, CRLF text file), ${count('format refusal')} format refusals, ${count('other refusal')} other refusals (nesting, missing picture, empty file, not .html, orphan), ${count('known limit')} known limit; ${starts} tool starts`);
