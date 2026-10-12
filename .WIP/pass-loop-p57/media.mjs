// p57 copy of .WIP/pass-loop-p54/media.mjs, unchanged but for this line. p54 one-off fetch, part 2 (same network exception as fetch.mjs, read-only GET, each address once):
// the ORIGINAL picture files named by the saved sections (static.wixstatic.com/media/<uri>, not Wix's small
// blurred preview) and the 16:9 YouTube thumbnails (i.ytimg.com/vi/<id>/maxresdefault.jpg) → wix/media/.
// A file already saved is never fetched again. usage (product root): node .WIP/pass-loop-p57/media.mjs
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const DIR = join(import.meta.dirname, 'wix'), OUT = join(DIR, 'media');
mkdirSync(OUT, { recursive: true });
const want = new Map();
for (const f of readdirSync(DIR).filter(f => f.endsWith('.html'))) {
  const h = readFileSync(join(DIR, f), 'utf8');
  for (const m of h.matchAll(/<wow-image id="([^"]+)"/g)) want.set(m[1], 'https://static.wixstatic.com/media/' + m[1]);
  for (const m of h.matchAll(/i\.ytimg\.com\/vi\/([\w-]+)\/maxresdefault\.jpg/g)) want.set(`video-${m[1]}.jpg`, `https://i.ytimg.com/vi/${m[1]}/maxresdefault.jpg`);
}
for (const [name, url] of want) {
  const file = join(OUT, name);
  if (existsSync(file)) { console.log(`kept  ${name}`); continue; }
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw Error(`${url} : HTTP ${r.status}`);
  const b = Buffer.from(await r.arrayBuffer());
  writeFileSync(file, b);
  console.log(`GET   ${name} ${b.length} bytes (${r.headers.get('content-type')})`);
}
console.log(`${want.size} file(s) wanted`);
