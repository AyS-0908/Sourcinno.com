// p51 Done When 3: /contact/ and /service-venture-building/ at 1200 and 375 px, JavaScript on and off,
// plus the post-click status of « Envoyer » on a valid form (sandboxed frame: the mailto navigation stays blocked).
// cdp.mjs = P50 helper, byte-identical (durable c265376): resolver NOTFOUND for every host except 127.0.0.1 and
// Google Fonts. JS off: synchronous evaluate, waits from Node (P30 Gotcha). Overflow = every element's right edge
// against the emulated width (P34 Gotcha), not scrollWidth.
// usage (product root): P48_PROFILES=<scratch dir> node .WIP/pass-loop-p51/evidence/render.mjs
import { browser, BASE, outside, sleep } from './cdp.mjs';
const ROUTES = ['/contact/', '/service-venture-building/'];
const WIDTHS = [1200, 375];
const HEIGHT = { 1200: 900, 375: 812 };
const name = r => r.replace(/\//g, '') || 'home';

// Scroll through the page so every .reveal section and lazy image comes in (JS on); back to the top after.
const walk = `(async()=>{const H=innerHeight*0.7;for(let y=0;y<=document.documentElement.scrollHeight;y+=H){scrollTo(0,y);await new Promise(r=>setTimeout(r,450));}
 scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,900));
 await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,3000)})));
 scrollTo(0,0);await new Promise(r=>setTimeout(r,700));return 1})()`;
// One section: scroll its top under the header, then measure its box, opacity and what is topmost at its centre.
const secProbe = i => `(()=>{const s=document.querySelectorAll('main > section')[${i}];const hd=document.querySelector('.site-header');const hh=hd?hd.getBoundingClientRect().height:0;
 scrollTo(0,s.getBoundingClientRect().top+scrollY-hh);return 1})()`;
const secMeasure = i => `(()=>{const s=document.querySelectorAll('main > section')[${i}];const r=s.getBoundingClientRect();const hd=document.querySelector('.site-header');const hh=hd?hd.getBoundingClientRect().height:0;
 const y=Math.round(Math.max(r.top,hh)+Math.min(r.bottom,innerHeight)-Math.max(r.top,hh))/2;const cy=Math.round(Math.max(r.top,hh)+(Math.min(r.bottom,innerHeight)-Math.max(r.top,hh))/2);
 const top=document.elementFromPoint(innerWidth/2,cy);const h2=s.querySelector('h2');
 return {i:${i},id:s.id||s.getAttribute('aria-label')||s.className,h2:h2?h2.textContent.trim():null,cls:s.className,bg:getComputedStyle(s).backgroundColor,
  h:Math.round(r.height),inView:r.top<innerHeight&&r.bottom>0,opacity:getComputedStyle(s).opacity,topmost:!!top&&s.contains(top),ok:r.height>0&&r.top<innerHeight&&r.bottom>0&&getComputedStyle(s).opacity==='1'&&!!top&&s.contains(top)}})()`;
const overflow = W => `(()=>{const W=${W};const bad=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.width===0&&r.height===0)continue;if(r.right>W+0.5)bad.push((e.tagName+'.'+(typeof e.className==='string'?e.className:'')).slice(0,60)+' right '+r.right.toFixed(1));}
 return {innerWidth,scrollWidth:document.documentElement.scrollWidth,pastWidth:bad.length,list:bad.slice(0,12)}})()`;
const launchers = `(()=>[...document.querySelectorAll('.video-launch')].map(b=>{const r=b.getBoundingClientRect();const img=b.querySelector('img');const fig=b.closest('figure');const cap=fig&&fig.querySelector('figcaption a');const cr=cap?cap.getBoundingClientRect():{width:0};
 return {id:b.dataset.video,display:getComputedStyle(b).display,box:[Math.round(r.width),Math.round(r.height)],thumb:!!img&&img.complete&&img.naturalWidth>0,natural:img?img.naturalWidth:0,caption:cap?cap.textContent.trim():null,captionShown:cr.width>0}}))()`;
const contactState = `(()=>{const f=document.querySelector('form[data-contact-form]');const fb=document.querySelector('[data-form-fallback]');const rf=f.getBoundingClientRect(),rb=fb.getBoundingClientRect();
 const btn=f.querySelector('button[type=submit]');const col=fb.parentElement;
 return {formShown:rf.width>0&&rf.height>0,fallbackShown:rb.width>0&&rb.height>0,fallbackFirstInColumn:col.firstElementChild===fb,button:btn.textContent.trim(),h2:[...document.querySelectorAll('main h2')].map(h=>h.textContent.trim())}})()`;
// Valid form inside a sandboxed same-origin frame, click « Envoyer », read the status line (P27 recipe).
const submit = `(async()=>{const f=document.createElement('iframe');f.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms');f.src='/contact/';
 f.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:99999';document.body.append(f);
 await new Promise(r=>f.addEventListener('load',r,{once:true}));await new Promise(r=>setTimeout(r,1500));
 const d=f.contentDocument,form=d.querySelector('form[data-contact-form]');const set=(id,v)=>{const el=d.getElementById(id);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};
 set('b-nom','Test P51');set('b-besoin','Autre');set('b-message','Message de test local P51, aucun envoi.');set('b-email','test@example.com');d.getElementById('b-rgpd').checked=true;
 const btn=form.querySelector('button[type=submit]');const before=f.contentWindow.location.href;btn.click();await new Promise(r=>setTimeout(r,1200));
 const st=form.querySelector('.form-status');btn.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,400));const r=st.getBoundingClientRect();let after;try{after=f.contentWindow.location.href}catch(e){after='unreadable: '+e.message}
 return {button:btn.textContent.trim(),status:st.innerText.replace(/\\s+/g,' ').trim(),state:st.dataset.state,role:st.getAttribute('role'),statusBox:[Math.round(r.width),Math.round(r.height)],statusInView:r.top>=0&&r.bottom<=f.contentWindow.innerHeight,
  mustStillSend:st.innerText.includes('vous devez encore l’envoyer'),promisesDelivery:/message est bien parti|message a été envoyé/i.test(st.innerText),lastMailto:(form.dataset.lastMailto||'').slice(0,40),frameBefore:before,frameAfter:after,invalid:d.querySelectorAll('[aria-invalid="true"]').length}})()`;

const b = await browser(); let bad = 0; const extra = []; const out = [];
const log = s => { out.push(s); console.log(s); };
try {
  for (const route of ROUTES) for (const W of WIDTHS) for (const nojs of [false, true]) {
    const tag = `${name(route)}-${W}-${nojs ? 'nojs' : 'js'}`;
    const p = await b.page(W, { nojs, height: HEIGHT[W] }); await p.go(route);
    if (!nojs) await p.ev(walk); else await sleep(400);
    const n = await p.ev(`document.querySelectorAll('main > section').length`);
    const secs = [];
    for (let i = 0; i < n; i++) { await p.ev(secProbe(i)); await sleep(nojs ? 250 : 750); secs.push(await p.ev(secMeasure(i))); }
    await p.ev('scrollTo(0,0),1'); await sleep(nojs ? 250 : 600);
    const ov = await p.ev(overflow(W));
    const la = await p.ev(launchers);
    const cs = route === '/contact/' ? await p.ev(contactState) : null;
    // full-page capture
    const H = await p.ev('document.documentElement.scrollHeight');
    const { data } = await p.s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
    (await import('node:fs')).writeFileSync(new URL(`./${tag}.png`, import.meta.url), Buffer.from(data, 'base64'));
    const secBad = secs.filter(s => !s.ok).length;
    const laBad = la.filter(l => nojs ? (l.display !== 'none' || l.box[0] !== 0 || !l.captionShown) : (l.display === 'none' || l.box[0] === 0 || !l.thumb || !l.captionShown)).length;
    const csBad = cs ? (nojs ? (cs.formShown || !cs.fallbackShown || !cs.fallbackFirstInColumn) : (!cs.formShown || cs.fallbackShown)) || cs.button !== 'Envoyer' : false;
    if (secBad || ov.pastWidth || laBad || csBad) bad++;
    log(`== ${tag} ${route} W=${W} JS=${nojs ? 'off' : 'on'} page ${W}x${H} -> ${tag}.png`);
    for (const s of secs) log(`   section ${s.i} ${s.id} h2=${JSON.stringify(s.h2)} bg=${s.bg} h=${s.h} inView=${s.inView} opacity=${s.opacity} topmost=${s.topmost} ${s.ok ? 'ok' : 'FAIL'}`);
    log(`   overflow: innerWidth ${ov.innerWidth} scrollWidth ${ov.scrollWidth} elements past ${W}: ${ov.pastWidth}${ov.pastWidth ? ' ' + JSON.stringify(ov.list) : ''}`);
    for (const l of la) log(`   launcher ${l.id} display=${l.display} box=${l.box.join('x')} thumb=${l.thumb} (${l.natural}px) caption shown=${l.captionShown} « ${l.caption} »`);
    if (cs) log(`   contact: form shown=${cs.formShown} fallback shown=${cs.fallbackShown} fallback first in column=${cs.fallbackFirstInColumn} button « ${cs.button} » main h2 ${JSON.stringify(cs.h2)}`);
    log(`   RESULT ${tag}: sections not ok ${secBad}, past width ${ov.pastWidth}, launchers not ok ${laBad}, contact state ${csBad ? 'FAIL' : 'ok'}`);
    if (route === '/contact/' && !nojs) {
      const r = await p.ev(submit);
      await sleep(300); await p.shot(`contact-${W}-submit`);
      const ok = r.button === 'Envoyer' && r.mustStillSend && !r.promisesDelivery && r.state === 'ok' && r.statusBox[0] > 0 && r.frameAfter === r.frameBefore && r.lastMailto.startsWith('mailto:') && r.invalid === 0;
      if (!ok) bad++;
      log(`   SUBMIT ${W}: button « ${r.button} » state=${r.state} role=${r.role} box=${r.statusBox.join('x')} inView=${r.statusInView} status « ${r.status} »`);
      log(`   SUBMIT ${W}: must-still-send=${r.mustStillSend} promises-delivery=${r.promisesDelivery} lastMailto ${r.lastMailto}… frame ${r.frameBefore} -> ${r.frameAfter} invalid=${r.invalid} -> contact-${W}-submit.png ${ok ? 'ok' : 'FAIL'}`);
    }
    extra.push(...outside(p.requests)); await p.close();
  }
} finally { await b.close(); }
// The blocked mailto navigation of each submit is logged by Network as a request attempt: counted apart, not network.
const mailto = extra.filter(u => u.startsWith('mailto:')), net = extra.filter(u => !u.startsWith('mailto:'));
log(`RENDER ${BASE}: runs ${ROUTES.length * WIDTHS.length * 2}, failing runs/submits ${bad}, outside requests ${net.length}${net.length ? ' ' + JSON.stringify([...new Set(net)].slice(0, 10)) : ''}, blocked mailto attempts ${mailto.length} (want 2: one per submit)`);
(await import('node:fs')).writeFileSync(new URL('./render.txt', import.meta.url), out.join('\n') + '\n');
process.exitCode = bad || net.length || mailto.length !== 2 ? 1 : 0;
