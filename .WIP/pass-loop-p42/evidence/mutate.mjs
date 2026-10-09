// P42 mutation ledger: fresh copy per case (archive 1ebc699 + working files), version.mjs re-stamped,
// then `node tools/check.mjs <flag>`. Usage: node mutate.mjs <product-root> <work-dir>
import { execFileSync } from "node:child_process";
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [product, work] = process.argv.slice(2);
const base = join(work, "base");
rmSync(base, { recursive: true, force: true });
mkdirSync(base, { recursive: true });
execFileSync("git", ["-C", product, "-c", "core.autocrlf=false", "archive", "-o", join(work, "base.tar"), "1ebc699"]);
execFileSync("tar", ["-xf", "base.tar", "-C", "base"], { cwd: work });
const changed = execFileSync("git", ["-C", product, "diff", "--name-only", "1ebc699", "--", ".", ":(exclude).WIP"], { encoding: "utf8" }).trim().split("\n");
for (const f of changed) cpSync(join(product, f), join(base, f));
console.log(`copy = 1ebc699 + ${changed.length} working file(s)`);

const SPAN = '<span class="visually-hidden"> (nouvel onglet)</span>';
const edit = (dir, rel, fn) => {
  const p = join(dir, rel), before = readFileSync(p, "utf8"), after = fn(before);
  if (after === before) throw new Error(`mutation did not apply in ${rel}`);
  writeFileSync(p, after, "utf8");
};
const once = (from, to) => (s) => { if (s.split(from).length !== 2) throw new Error(`not exactly one « ${from.slice(0, 60)} »`); return s.replace(from, to); };
const BLOG = '<a href="https://sourcinno.wixsite.com/blog/post/gpts-attention-1" target="_blank" rel="noopener">GPTs : attention ! <span aria-hidden="true">→</span>';
const CONTACT = 'linkedin.com/in/aymarddescorbiac' + SPAN + '</a>';

const cases = [
  ["unmodified (--a11y)", () => {}, "--a11y", 0, null],
  ["unmodified (--all)", () => {}, "--all", 0, null],
  ["blog link: hidden span removed", (d) => edit(d, "publications/index.html", once(BLOG + SPAN, BLOG)), "--a11y", 1, /^publications\/index\.html: lien target="_blank" dont le nom/m],
  ["aria-label link: « (nouvel onglet) » removed from the label", (d) => edit(d, "service-strategie-transformation/index.html", once('aria-label="Stratégie (nouvel onglet)"', 'aria-label="Stratégie"')), "--a11y", 1, /service-strategie-transformation\/index\.html: lien target="_blank" dont le nom.*« Stratégie »/],
  ["present only after </a>", (d) => edit(d, "contact/index.html", once(CONTACT, "linkedin.com/in/aymarddescorbiac</a>" + SPAN)), "--a11y", 1, /^contact\/index\.html: lien target="_blank" dont le nom/m],
  ["ia-embeds: `if (status)` removed before status.hidden = true", (d) => edit(d, "assets/js/ia-embeds.js", once("if (status) status.hidden = true;", "status.hidden = true;")), "--all", 1, /test-ia-embeds/],
  // own mutations beyond the plan
  ["only in a title attribute", (d) => edit(d, "contact/index.html", (s) => once(CONTACT, "linkedin.com/in/aymarddescorbiac</a>")(s).replace('target="_blank" rel="noopener">linkedin', 'target="_blank" rel="noopener" title="(nouvel onglet)">linkedin')), "--a11y", 1, /^contact\/index\.html: lien target="_blank" dont le nom/m],
  ["inside an HTML comment in the link", (d) => edit(d, "contact/index.html", once(CONTACT, "linkedin.com/in/aymarddescorbiac<!-- (nouvel onglet) --></a>")), "--a11y", 1, /^contact\/index\.html: lien target="_blank" dont le nom/m],
  ["inside an aria-hidden span", (d) => edit(d, "contact/index.html", once(CONTACT, 'linkedin.com/in/aymarddescorbiac<span aria-hidden="true"> (nouvel onglet)</span></a>')), "--a11y", 1, /^contact\/index\.html: lien target="_blank" dont le nom/m],
  ["single-quoted target='_blank', span removed", (d) => edit(d, "contact/index.html", (s) => once(CONTACT, "linkedin.com/in/aymarddescorbiac</a>")(s).replace('target="_blank" rel="noopener">linkedin', "target='_blank' rel=\"noopener\">linkedin")), "--a11y", 1, /^contact\/index\.html: lien target="_blank" dont le nom/m],
  ["aria-label without it overrides a visible hidden span", (d) => edit(d, "mentions-legales/index.html", once('target="_blank" rel="noopener">hostinger.fr', 'target="_blank" rel="noopener" aria-label="Hostinger">hostinger.fr')), "--a11y", 1, /^mentions-legales\/index\.html: lien target="_blank" dont le nom.*« Hostinger »/m],
  ["aria-labelledby on a new-tab link", (d) => edit(d, "mentions-legales/index.html", once('target="_blank" rel="noopener">hostinger.fr', 'target="_blank" rel="noopener" aria-labelledby="x">hostinger.fr')), "--a11y", 1, /aria-labelledby/],
  ["control: unnamed span on a link WITHOUT target → no false FAIL", (d) => edit(d, "mentions-legales/index.html", once('<a href="tel:+37064503378">+370 645 03378</a>', '<a href="tel:+37064503378">+370 645 03378 (onglet)</a>')), "--a11y", 0, null],
  ["control: hidden span then &nbsp; and spaces → still named", (d) => edit(d, "contact/index.html", once(CONTACT, 'linkedin.com/in/aymarddescorbiac<span class="visually-hidden"> (nouvel onglet)&nbsp; </span></a>')), "--a11y", 0, null],
];

let bad = 0;
for (const [name, mutate, flag, want, pattern] of cases) {
  const dir = join(work, "case");
  rmSync(dir, { recursive: true, force: true });
  cpSync(base, dir, { recursive: true });
  let code = 0, out = "";
  try {
    mutate(dir);
    execFileSync("node", ["tools/version.mjs"], { cwd: dir });
    out = execFileSync("node", ["tools/check.mjs", flag], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 120000 });
  } catch (e) { code = e.status ?? -1; out = (e.stdout || "") + (e.stderr || "") + (e.status === undefined ? String(e.message) : ""); }
  const failures = out.split("\n").filter((l) => l.startsWith("  - ")).map((l) => l.trim().replace(/^- /, ""));
  const named = pattern ? pattern.test(failures.join("\n")) : true;
  const ok = code === want && named;
  if (!ok) bad++;
  console.log(`${ok ? "OK " : "BAD"} ${flag} exit ${code} (want ${want}) ${name}${failures.length ? "\n      " + failures.join("\n      ") : ""}${code === -1 ? "\n      " + out.slice(0, 300) : ""}`);
}
console.log(bad ? `LEDGER: ${bad} unexpected result(s)` : `LEDGER: ${cases.length}/${cases.length} as expected`);
process.exit(bad ? 1 : 0);
