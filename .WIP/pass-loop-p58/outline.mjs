// p54 probe: tag outline of each saved Wix post-description (attributes reduced to data-hook, href, src, alt, type).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const DIR = join(import.meta.dirname, 'wix');
const only = process.argv[2];
for (const f of readdirSync(DIR).filter(f => f.endsWith('.html') && (!only || f.includes(only)))) {
  const h = readFileSync(join(DIR, f), 'utf8');
  console.log('\n===== ' + f);
  let depth = 0; const out = [];
  for (const m of h.matchAll(/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g)) {
    if (m[0].startsWith('<!--')) continue;
    if (m[4] !== undefined) { const t = m[4].replace(/\s+/g, ' ').trim(); if (t) out.push('  '.repeat(depth) + '"' + t.slice(0, 110) + (t.length > 110 ? '…' : '') + '"'); continue; }
    const [, close, tag, attrs] = m; const voidTag = /^(img|br|hr|input|meta|link|source|path|circle|rect)$/i.test(tag) || /\/$/.test(attrs);
    if (close) { depth = Math.max(0, depth - 1); continue; }
    const keep = [...attrs.matchAll(/\b(data-hook|href|src|alt|type|aria-label|role|data-pin-media)="([^"]*)"/g)].map(a => `${a[1]}="${a[2].slice(0, 140)}"`).join(' ');
    out.push('  '.repeat(depth) + '<' + tag + (keep ? ' ' + keep : '') + '>');
    if (!voidTag) depth++;
  }
  console.log(out.join('\n'));
}
