// p54 one-off fetch (the ONLY network exception of the Pass, read-only GET, each address once):
// the Wix feed, then the post pages of ONE category; of each page only its `post-description` section is kept
// (a whole page is ~725 KB and .WIP is tracked in a PUBLIC repository). A file already saved is never fetched again.
// usage (product root): node .WIP/pass-loop-p54/fetch.mjs [category, default "⚡IA"]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const HERE = import.meta.dirname, OUT = join(HERE, 'wix');
const FEED = 'https://sourcinno.wixsite.com/blog/blog-feed.xml';
const CAT = process.argv[2] || '⚡IA';
export const slug = link => decodeURIComponent(link.split('/').pop()).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
mkdirSync(OUT, { recursive: true });
const get = async url => { const r = await fetch(url, { signal: AbortSignal.timeout(30000) }); if (!r.ok) throw Error(`${url} : HTTP ${r.status}`); return r; };
const feedFile = join(OUT, 'feed.xml');
if (!existsSync(feedFile)) { writeFileSync(feedFile, await (await get(FEED)).text(), 'utf8'); console.log('GET feed'); }
const xml = readFileSync(feedFile, 'utf8');
const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)].map(m => m[1]);
const field = (item, tag) => { const m = item.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`)); return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : ''; };
console.log(`feed: ${items.length} items`);
let n = 0;
for (const item of items) {
  const link = field(item, 'link'), cat = field(item, 'category');
  if (!/\/blog\/post\//.test(link) || cat !== CAT) continue;
  n++;
  const file = join(OUT, slug(link) + '.html');
  if (existsSync(file)) { console.log(`kept  ${slug(link)}`); continue; }
  const page = await (await get(link)).text();
  const i = page.indexOf('data-hook="post-description"');
  if (i < 0) throw Error(`${link} : no post-description`);
  const start = page.lastIndexOf('<', i), end = page.indexOf('</section>', i);
  if (end < 0) throw Error(`${link} : no closing section`);
  const part = page.slice(start, end + '</section>'.length);
  writeFileSync(file, `<!-- source ${link} | page ${page.length} bytes | kept ${part.length} -->\n` + part, 'utf8');
  console.log(`GET   ${slug(link)} page ${page.length} kept ${part.length}`);
}
console.log(`${CAT}: ${n} post(s)`);
