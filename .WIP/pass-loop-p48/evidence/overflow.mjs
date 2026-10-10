// p48 A-001 overflow by element rectangles (AGENTS: body clips overflow, so never scrollWidth). The 10 shell pages
// at 320/375/1200; Contact also with JavaScript off and after an invalid submit (real mouse click on the button).
// Per run: innerWidth vs emulated width, every visible element whose left < -0.6 or right > width + 0.6, and each
// main mailto link: text = full address, rectangle inside the viewport, line boxes. usage: P48_BASE=... node overflow.mjs
import { browser, ROOT, BASE, outside } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const PAGES = ['/', '/404.html', '/contact/', '/mentions-legales/', '/politique-confidentialite/', '/portfolio/', '/publications/',
  '/service-ia-business/', '/service-strategie-transformation/', '/service-venture-building/'];
const ADDRESS = 'aymard.de.scorbiac@sourcinno.com';
const probe = width => `(()=>{const visible=e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0&&r.height>0&&c.display!=='none'&&c.visibility!=='hidden'&&!e.closest('details:not([open])')};
 const over=[...document.body.querySelectorAll('*')].filter(e=>visible(e)&&!e.matches('.skip-link,.visually-hidden')&&!e.closest('.visually-hidden')).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,cls:String(e.className),text:e.textContent.trim().slice(0,40),left:+r.left.toFixed(2),right:+r.right.toFixed(2)}}).filter(r=>r.left<-.6||r.right>${width}+.6);
 const mails=[...document.querySelectorAll('main a[href^="mailto:"]')].filter(visible).map(a=>{const r=a.getBoundingClientRect();return {text:a.textContent.trim(),left:+r.left.toFixed(2),right:+r.right.toFixed(2),lines:a.getClientRects().length,wrap:getComputedStyle(a).overflowWrap}});
 const form=document.querySelector('form[data-contact-form]');const fr=form&&!form.hidden?form.getBoundingClientRect():null;
 return {innerWidth,over,mails,formRight:fr&&+fr.right.toFixed(2),invalid:[...document.querySelectorAll('[aria-invalid="true"]')].length}})()`;
const b = await browser(), runs = [], extra = [];
try {
  const plan = [];
  for (const width of [320, 375, 1200]) {
    for (const route of PAGES) plan.push({ route, width, mode: 'normal' });
    plan.push({ route: '/contact/', width, mode: 'nojs' }, { route: '/contact/', width, mode: 'invalid' });
  }
  for (const { route, width, mode } of plan) {
    const p = await b.page(width, { nojs: mode === 'nojs' });
    await p.go(route);
    if (mode === 'invalid') await p.point('form[data-contact-form] button[type="submit"]');
    const r = await p.ev(probe(width));
    const problems = [];
    if (r.innerWidth !== width) problems.push(`innerWidth ${r.innerWidth}`);
    if (r.over.length) problems.push(`${r.over.length} past the edge`);
    for (const m of r.mails) {
      if (m.text !== ADDRESS && !m.text.startsWith('ouvrir')) problems.push(`mail text "${m.text}"`);
      if (m.left < -0.6 || m.right > width + 0.6) problems.push(`mail rect ${m.left}..${m.right}`);
      if (width === 1200 && m.text === ADDRESS && m.lines !== 1) problems.push(`mail split at 1200 (${m.lines} lines)`);
    }
    if (route === '/contact/' && !r.mails.some(m => m.text === ADDRESS)) problems.push('address link missing');
    if (mode === 'invalid' && r.invalid < 4) problems.push(`only ${r.invalid} invalid fields`);
    runs.push({ route, width, mode, ...r, problems });
    extra.push(...outside(p.requests));
    console.log(`${route.padEnd(36)} ${String(width).padStart(4)} ${mode.padEnd(7)} innerWidth=${r.innerWidth} past=${r.over.length} mails=${r.mails.map(m => `${m.right}/${m.lines}l`).join(',') || '-'} form=${r.formRight ?? '-'} ${problems.length ? 'FAIL ' + problems.join('; ') : 'ok'}`);
    await p.close();
  }
  const failures = runs.filter(r => r.problems.length).length;
  writeFileSync(join(ROOT, `overflow-${new URL(BASE).port}.json`), JSON.stringify(runs, null, 1));
  console.log(`${runs.length} runs on ${BASE}, FAILURES ${failures}, outside requests ${extra.length}`);
  process.exitCode = failures || extra.length ? 1 : 0;
} finally { await b.close(); }
