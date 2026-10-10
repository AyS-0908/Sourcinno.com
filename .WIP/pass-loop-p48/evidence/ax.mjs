// p48 A-003: Accessibility.getFullAXTree descriptions of the contact fields at 375 (real mouse click on the submit
// button, real typing with Input.insertText, real Tab / Shift+Tab). Then the email draft built with fixed values
// inside a sandboxed frame (allow-scripts allow-same-origin allow-forms: the mailto navigation stays blocked, no
// mail client), compared between P48_BASE (after) and P48_BEFORE (before). usage: node ax.mjs
import { browser, BASE, ROOT, outside } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const BEFORE = process.env.P48_BEFORE || 'http://127.0.0.1:4174';
const FIELDS = ['nom', 'entreprise', 'besoin', 'message', 'email', 'telephone', 'rgpd'];
const b = await browser(), log = [], fails = [], extra = [];
let mailto = 0;
const check = (ok, line) => { log.push((ok ? 'ok   ' : 'FAIL ') + line); if (!ok) fails.push(line); };
async function ax(p) {
  const { nodes } = await p.s('Accessibility.getFullAXTree');
  const { root } = await p.s('DOM.getDocument', { depth: -1 });
  const out = {};
  for (const f of FIELDS) {
    const { nodeId } = await p.s('DOM.querySelector', { nodeId: root.nodeId, selector: `form [name="${f}"]` });
    const { node } = await p.s('DOM.describeNode', { nodeId });
    const a = nodes.find(n => n.backendDOMNodeId === node.backendNodeId);
    out[f] = { description: a?.description?.value ?? '', invalid: a?.properties?.find(x => x.name === 'invalid')?.value?.value ?? 'false' };
  }
  return out;
}
const errText = (p, f) => p.ev(`document.querySelector('form [name="${f}"]').closest('.field').querySelector('.error').textContent`);
try {
  const p = await b.page(375);
  await p.s('DOM.enable'); await p.s('Accessibility.enable');
  await p.go('/contact/');
  const ids = await p.ev(`(()=>{const all=[...document.querySelectorAll('[id]')].map(e=>e.id);return {dup:all.filter((x,i)=>all.indexOf(x)!==i),err:all.filter(x=>x.startsWith('err-')).length,slots:document.querySelectorAll('form .error').length,orphan:document.querySelectorAll('form > .error').length}})()`);
  check(ids.dup.length === 0 && ids.err === 7 && ids.slots === 7 && ids.orphan === 0, `ids unique (dup ${ids.dup.length}), err-* ${ids.err}, error slots ${ids.slots}, form-level slots ${ids.orphan}`);
  await p.point('form[data-contact-form] button[type="submit"]');
  let a = await ax(p);
  for (const f of ['nom', 'besoin', 'message', 'email', 'rgpd']) {
    const t = await errText(p, f);
    check(t && a[f].description === t && a[f].invalid === 'true', `empty submit: ${f} description="${a[f].description}" invalid=${a[f].invalid}`);
  }
  for (const f of ['entreprise', 'telephone']) check(a[f].description === '' && a[f].invalid === 'false', `empty submit: optional ${f} description="${a[f].description}"`);
  const focused = await p.ev('document.activeElement.name');
  check(focused === 'nom', `first invalid field focused: ${focused}`);
  // Tab away and back: the corrective instruction travels with the field.
  await p.key('Tab'); await p.key('Tab', 8);
  a = await ax(p);
  check(await p.ev('document.activeElement.name') === 'nom' && a.nom.description === 'Ce champ est obligatoire.', `Tab away and back to nom: description="${a.nom.description}"`);
  // Correct the name: description empties.
  await p.s('Input.insertText', { text: 'Jean Test' });
  await p.key('Tab');
  a = await ax(p);
  check(a.nom.description === '' && a.nom.invalid === 'false', `after correcting nom: description="${a.nom.description}" invalid=${a.nom.invalid}`);
  // Malformed phone, then blur.
  await p.ev(`document.querySelector('#b-telephone').focus()`);
  await p.s('Input.insertText', { text: '12' });
  await p.key('Tab');
  a = await ax(p);
  check(a.telephone.description === 'Ce numéro de téléphone semble incomplet.' && a.telephone.invalid === 'true', `malformed phone: description="${a.telephone.description}"`);
  // Malformed email and short message.
  await p.ev(`document.querySelector('#b-email').focus()`); await p.s('Input.insertText', { text: 'jean@' }); await p.key('Tab');
  await p.ev(`document.querySelector('#b-message').focus()`); await p.s('Input.insertText', { text: 'court' }); await p.key('Tab');
  a = await ax(p);
  check(a.email.description === 'Cette adresse email ne semble pas valide.', `malformed email: description="${a.email.description}"`);
  check(a.message.description.startsWith('Merci de détailler'), `short message: description="${a.message.description}"`);
  extra.push(...outside(p.requests));
  await p.close();
  // Email draft equality before/after, no mail client.
  const drafts = {};
  for (const base of [BASE, BEFORE]) {
    const q = await b.page(375);
    await q.s('Page.navigate', { url: base + '/404.html' }); await new Promise(r => setTimeout(r, 1500));
    drafts[base] = await q.ev(`new Promise(done=>{document.body.innerHTML='';const f=document.createElement('iframe');f.sandbox='allow-scripts allow-same-origin allow-forms';f.style.cssText='width:375px;height:2000px';f.src='/contact/';f.onload=()=>setTimeout(()=>{const d=f.contentDocument,form=d.querySelector('form[data-contact-form]');const v={nom:'Jean Test',entreprise:'Acme & Cie',besoin:'Entreprise IA',message:'Bonjour, ceci est un essai accentué : é è ç « test ».',email:'jean.test@example.com',telephone:'+33 6 12 34 56 78'};for(const [k,x] of Object.entries(v)){const e=form.querySelector('[name="'+k+'"]');e.value=x;e.dispatchEvent(new Event('input',{bubbles:true}))}form.querySelector('[name="rgpd"]').checked=true;form.querySelector('button[type="submit"]').click();setTimeout(()=>done(form.dataset.lastMailto||''),500)},1500);document.body.append(f)})`);
    // The draft's own mailto navigation shows as a request event; Chrome blocks it in a sandboxed frame without
    // allow-popups/allow-top-navigation (no network, no mail client). Counted apart, never as outside traffic.
    mailto += q.requests.filter(u => u.startsWith('mailto:')).length;
    extra.push(...outside(q.requests.filter(u => !u.startsWith('mailto:'))));
    await q.close();
  }
  const [after, before] = [drafts[BASE], drafts[BEFORE]];
  check(after && after === before, `email draft identical before/after (${after.length} chars): ${after.slice(0, 90)}…`);
  log.push(`info mailto navigations attempted inside the sandboxed frame (blocked): ${mailto}`);
  check(!extra.length, `outside requests ${extra.length} ${extra.map(u => u.slice(0, 60)).join(" ")}`);
} catch (e) { fails.push(String(e)); log.push('FAIL ' + e); }
finally { await b.close(); }
console.log(log.join('\n'));
console.log(`AX ${BASE}: ${log.length} checks, FAILURES ${fails.length}`);
writeFileSync(join(ROOT, 'ax.txt'), log.join('\n') + '\n');
process.exitCode = fails.length ? 1 : 0;
