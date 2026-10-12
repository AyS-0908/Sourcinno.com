// p51 round 2: Contact form density and contact-list link look, measured on the rendered page.
// usage (product root): P48_PROFILES=<scratch dir> [P48_BASE=http://127.0.0.1:<port>] node .WIP/pass-loop-p51/evidence/spacing.mjs
import { browser, BASE } from './cdp.mjs';
const probe = `(()=>{const f=[...document.querySelectorAll('form[data-contact-form] .field')];
 const gaps=[];for(let i=0;i<f.length-1;i++){const c=f[i].querySelector('input,select,textarea'),l=f[i+1].querySelector('label,input');gaps.push(Math.round((l.getBoundingClientRect().top-c.getBoundingClientRect().bottom)*10)/10);}
 const form=document.querySelector('form[data-contact-form]').getBoundingClientRect();
 const links=[...document.querySelectorAll('main ul.ticks a')].map(a=>{const s=getComputedStyle(a);return a.textContent.trim().slice(0,34)+' | '+s.color+' | '+s.textDecorationLine});
 const foot=[...document.querySelectorAll('.site-footer a')].slice(0,3).map(a=>getComputedStyle(a).textDecorationLine);
 return {gaps,formHeight:Math.round(form.height),links,footerLinks:foot,quote:document.querySelectorAll('blockquote').length}})()`;
const b = await browser();
try {
  for (const W of [1200, 375]) {
    const p = await b.page(W, { height: W === 1200 ? 900 : 812 }); await p.go('/contact/');
    console.log(`${BASE} /contact/ W=${W} ` + JSON.stringify(await p.ev(probe)));
    await p.close();
  }
} finally { await b.close(); }
