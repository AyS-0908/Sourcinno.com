// Pass 59 Done When 2 (a page differing from the files fails check --all) and 3 (red runs, mutation ledger).
// Usage (product root): node .WIP/pass-loop-p59/redruns.mjs <scratch folder>   — writes redruns.txt beside this file.
// Everything runs on copies under <scratch>; the product tree is only read. No network (the tool needs none).
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const PRODUCT = process.cwd(), SCRATCH = process.argv[2], HERE = import.meta.dirname;
if (!SCRATCH || !existsSync(SCRATCH)) { console.error('scratch folder missing'); process.exit(2); }
const out = []; let bad = 0;
const log = (s) => { out.push(s); console.log(s); };
const check = (ok, s) => { if (!ok) bad++; log(`${ok ? 'ok  ' : 'FAIL'} ${s}`); };
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);
const node = (args, cwd) => spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 240000 });
const first = (s) => s.split('\n').map((l) => l.trim()).filter(Boolean)[0] || '(empty)';

// 1. Red runs of the real tool on throw-away trees holding the eleven real files.
const BLOGDIR = join(PRODUCT, 'tools/blog'), STUDIO = 'sourcinno-startupstudiotypes.html', GPTS = 'gpts-attention-1.html';
function tree(name) {
  const root = join(SCRATCH, 'red-' + name);
  rmSync(root, { recursive: true, force: true });
  for (const rel of ['tools/blog-sync.mjs', 'tools/blog', 'publications/index.html', 'assets/img/blog']) cpSync(join(PRODUCT, rel), join(root, rel), { recursive: true });
  return root;
}
const edit = (root, f, fn) => { const p = join(root, 'tools/blog', f); writeFileSync(p, fn(readFileSync(p, 'utf8'))); };
log('== red runs of the real tool (eleven real files, one change each)');
for (const [name, f, fn, message] of [
  ['no line 1', GPTS, (s) => s.slice(s.indexOf('\n') + 1), 'tools/blog/gpts-attention-1.html : ligne 1 sans en-tete'],
  ['wrong date 2024-02-30', GPTS, (s) => s.replace('date="2024-03-03"', 'date="2024-02-30"'), 'tools/blog/gpts-attention-1.html : date « 2024-02-30 » impossible'],
  ['unknown tag ⚡IA', GPTS, (s) => s.replace('etiquette="IA"', 'etiquette="⚡IA"'), 'tools/blog/gpts-attention-1.html : etiquette « ⚡IA » inconnue'],
  ['a tfoot in the table', STUDIO, (s) => s.replace('</table>', '<tfoot>\n</tfoot>\n</table>'), `tools/blog/${STUDIO} : balise ou attribut hors format « <tfoot> »`],
  ['data-label not its column title', STUDIO, (s) => s.replace('<td data-label="Studios PURE PLAYER">', '<td data-label="Studios PURE">'), `tools/blog/${STUDIO} : data-label « Studios PURE » ne reprend pas le titre de sa colonne (« Studios PURE PLAYER »)`],
]) {
  const root = tree(name.replace(/\W+/g, '-')), before = sha(join(root, 'publications/index.html'));
  edit(root, f, fn);
  for (const flags of [[], ['--check']]) {
    const r = node([join(root, 'tools/blog-sync.mjs'), ...flags], root);
    check(r.status === 1 && r.stderr.includes(message) && sha(join(root, 'publications/index.html')) === before,
      `${name}${flags.length ? ' (--check)' : ''}: exit ${r.status}, page unchanged ${sha(join(root, 'publications/index.html')) === before}; stderr « ${first(r.stderr)} »`);
  }
}
{
  const root = tree('twelfth');
  writeFileSync(join(root, 'tools/blog/zz-douzieme.html'), '<!-- blog: titre="Douzième article &amp; essai" date="2026-10-14" etiquette="Startup" -->\n<p>Texte.</p>\n');
  const r = node([join(root, 'tools/blog-sync.mjs')], root), page = readFileSync(join(root, 'publications/index.html'), 'utf8');
  const h3 = [...page.matchAll(/<h3>([^<]*)<\/h3>/g)].map((m) => m[1]), list = page.slice(page.indexOf('blog-sync:debut'), page.indexOf('blog-sync:fin'));
  const firstH3 = [...list.matchAll(/<h3>([^<]*)<\/h3>/g)].map((m) => m[1]);
  check(r.status === 0 && firstH3.length === 12 && firstH3[0] === 'Douzième article &amp; essai' && list.includes('<time datetime="2026-10-14">14 octobre 2026</time>') && !list.includes('<!-- blog:'),
    `twelfth file, newest date: exit ${r.status} « ${r.stdout.trim()} »; ${firstH3.length} posts, first « ${firstH3[0]} », then « ${firstH3[1]} »; header off the page ${!list.includes('<!-- blog:')}; ${h3.length} h3 in the page`);
  const c = node([join(root, 'tools/blog-sync.mjs'), '--check'], root);
  check(c.status === 0, `twelfth file, then --check: exit ${c.status} « ${c.stdout.trim()} »`);
}

// 2. Done When 2: check.mjs --all on a copy of the product whose page no longer matches the files.
log('== check.mjs --all on a product copy whose list differs from the files');
{
  const root = join(SCRATCH, 'check-copy');
  rmSync(root, { recursive: true, force: true });
  cpSync(PRODUCT, root, { recursive: true, filter: (src) => !/[\\/](\.git|\.WIP)([\\/]|$)/.test(src.slice(PRODUCT.length)) });
  const ok = node(['tools/check.mjs', '--all'], root);
  check(ok.status === 0 && /tools\/blog-sync\.mjs --check: BLOG: liste conforme/.test(ok.stdout), `copy as is: check --all exit ${ok.status}`);
  edit(root, GPTS, (s) => s.replace('titre="GPTs : attention !"', 'titre="GPTs : attention !!"'));
  const r = node(['tools/check.mjs', '--all'], root), line = (r.stdout + r.stderr).split('\n').find((l) => l.includes('blog-sync.mjs --check')) || '(no line)';
  check(r.status === 1 && /Blog perime/.test(line), `title changed in a file, page not re-run: check --all exit ${r.status}; « ${line.trim().slice(0, 300)} »`);
  const plain = node(['tools/check.mjs'], root);
  check(plain.status === 0, `same copy, plain run (no --all): exit ${plain.status} — the offline --check stays under --all only`);
  rmSync(root, { recursive: true, force: true, maxRetries: 5 });
}

// 3. Mutation ledger: a mutated copy of the tool beside the real test; each must make the test fail.
log('== mutations of the tool: the test must fail on each');
const TOOLSRC = readFileSync(join(PRODUCT, 'tools/blog-sync.mjs'), 'utf8'), TESTSRC = readFileSync(join(PRODUCT, 'tools/blog-sync.test.mjs'), 'utf8');
for (const [name, from, to] of [
  ['any date accepted', 'if (!d || !days || da < 1 || da > days) die(', 'if (false) die('],
  ['leap years ignored (February 28 days always)', '[31, leap ? 29 : 28,', '[31, 28,'],
  ['any tag accepted', 'if (!TAGS.includes(tag)) die(', 'if (false) die('],
  ['header optional (a file without line 1 read as body)', 'if (!first.startsWith("<!-- blog:")) die(', 'if (!first.startsWith("<!-- blog:")) return { title: "x", date: "2000-01-01", y: 2000, mo: 1, da: 1, tag: "IA", rang: Infinity, skip: true }; if (false) die('],
  ['any title accepted', '/[<>]|&(?!(?:amp|quot|lt|gt);)/.test(titre)', 'false'],
  ['rang ignored in the order', 'a.rang !== b.rang ? a.rang - b.rang : ', ''],
  ['rang of any form accepted', '!/^[1-9]\\d*$/.test(rang)', 'false'],
  ['file name order reversed for ties', 'a.file < b.file ? -1 : 1', 'a.file < b.file ? 1 : -1'],
  ['leading ^ dropped from the link rule', '  /^<a href=', '  /<a href='],
  ['a thirteenth FORMAT rule (<div>)', '  /^<td data-label="[^"<>]+">$/,\n];', '  /^<td data-label="[^"<>]+">$/,\n  /^<div>$/,\n];'],
  ['tfoot admitted', '/^<(?:table|tr|td)>$/,', '/^<(?:table|tr|td|tfoot)>$/,'],
  ['data-label not compared with its column title', 'if (label(l.text) !== want) die(', 'if (false) die('],
  ['header written on the page', '  posts.push({ file: f, ...header(rel, first), text: body(rel, cut < 0 ? "" : text.slice(cut + 1)) });', '  posts.push({ file: f, ...header(rel, first), text: [first, ...body(rel, cut < 0 ? "" : text.slice(cut + 1))] });'],
  ['1er never written', 'p.da === 1 ? "1er" : p.da', 'p.da'],
]) {
  const count = TOOLSRC.split(from).length - 1;
  if (count !== 1) { check(false, `${name}: anchor found ${count} time(s) in the tool, mutation not applied`); continue; }
  const dir = join(SCRATCH, 'mut-' + name.replace(/\W+/g, '-').slice(0, 40), 'tools');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'blog-sync.mjs'), TOOLSRC.replace(from, to)); writeFileSync(join(dir, 'blog-sync.test.mjs'), TESTSRC);
  const r = node([join(dir, 'blog-sync.test.mjs')], dir), fails = r.stderr.split('\n').filter((l) => l.startsWith('FAIL '));
  check(r.status === 1 && fails.length > 0, `${name}: test exit ${r.status}, ${fails.length} case(s) failing, first « ${(fails[0] || first(r.stderr)).slice(5, 200)} »`);
}
log(`REDRUNS: ${bad ? bad + ' unexpected result(s)' : 'all as expected'}`);
writeFileSync(join(HERE, 'redruns.txt'), out.join('\n') + '\n');
process.exit(bad ? 1 : 0);
