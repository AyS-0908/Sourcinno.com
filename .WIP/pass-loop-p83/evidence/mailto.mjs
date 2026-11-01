// Pass 83: decoded mailto drafts of the two fixture buttons (rehearsal :4176), journal evidence.
import { browser, sleep } from './cdp.mjs';
const b = await browser(); const p = await b.page(1200, { reduce: true });
await p.s('Page.navigate', { url: 'http://127.0.0.1:4176/service-venture-building/' }); await sleep(3000);
for (const h of await p.ev(`[...document.querySelectorAll('.catalogue-list a[data-idea]')].map((a) => a.href)`)) {
  const u = new URL(h); console.log(`${u.protocol}${u.pathname} | subject: ${u.searchParams.get('subject')} | body: ${JSON.stringify(u.searchParams.get('body'))}`);
}
await b.close(); process.exit(0);
