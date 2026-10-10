// P50 Done When 3: mutation ledger for the check.mjs coherence rule.
// Usage (from the product root): node .WIP/pass-loop-p50/evidence/mutations.mjs <scratch-dir> [ref=HEAD]
// Exports `git -c core.autocrlf=false archive <ref>` into <scratch-dir>/base, copies it once per
// mutation, applies ONE edit, runs `node tools/check.mjs` (and --forms where named) in the copy,
// prints the exit code and every failure line. The live tree is never written.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, cpSync, readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const scratch = resolve(process.argv[2] || "");
if (!process.argv[2]) { console.error("usage: mutations.mjs <scratch-dir> [ref]"); process.exit(2); }
const ref = process.argv[3] || "HEAD";
const base = join(scratch, "base");
rmSync(scratch, { recursive: true, force: true });
mkdirSync(base, { recursive: true });
const tar = execFileSync("git", ["-c", "core.autocrlf=false", "archive", "--format=tar", ref], { maxBuffer: 1 << 28 });
execFileSync("tar", ["-x"], { cwd: base, input: tar });

// Replace exactly one occurrence of `from` on the line that contains `anchor` (or anywhere).
function edit(dir, file, from, to, anchor) {
  const p = join(dir, file);
  const lines = readFileSync(p, "utf8").split("\n");
  const i = lines.findIndex((l) => l.includes(from) && (!anchor || l.includes(anchor)));
  if (i < 0) throw new Error(`mutation target not found in ${file}: ${from}`);
  lines[i] = lines[i].replace(from, to);
  writeFileSync(p, lines.join("\n"));
  return `${file}:${i + 1}`;
}

const MUTATIONS = [
  ["M0 unmutated", () => "none"],
  ["M1 other email, contact fallback mailto", (d) => edit(d, "contact/index.html", "mailto:aymard.de.scorbiac@sourcinno.com?subject", "mailto:contact@sourcinno.com?subject")],
  ["M2 other email, config.js", (d) => edit(d, "assets/js/config.js", '"aymard.de.scorbiac@sourcinno.com"', '"aymard@sourcinno.fr"')],
  ["M3 one displayed digit, contact 87 (tel: intact)", (d) => edit(d, "contact/index.html", "58&nbsp;77</a>", "58&nbsp;78</a>", "<strong>Téléphone</strong>")],
  ["M4 JSON-LD telephone, index", (d) => edit(d, "index.html", '"telephone": "+33608755877"', '"telephone": "+33608755878"')],
  ["M5 LinkedIn slug, publications card", (d) => edit(d, "publications/index.html", "linkedin.com/in/aymarddescorbiac", "linkedin.com/in/aymard-descorbiac", "Publications LinkedIn")],
  ["M6 one launcher data-video, venture", (d) => edit(d, "service-venture-building/index.html", 'data-video="7qO3G7tCHr8"', 'data-video="7qO3G7tCHr9"')],
  ["M7 Typebot id, ia-embeds.js", (d) => edit(d, "assets/js/ia-embeds.js", "'paiement-produit-num-rique-o8lsepu'", "'paiement-produit-num-rique-o8lsepX'")],
  ["M8 host tel: pasted into contact", (d) => edit(d, "contact/index.html", 'href="tel:+33608755877"', 'href="tel:+37064503378"', "<strong>Téléphone</strong>")],
  ["M9 footer reference renamed", (d) => { renameSync(join(d, "tools/shell/footer.html"), join(d, "tools/shell/footer.html.bak")); return "tools/shell/footer.html -> footer.html.bak"; }, ["--forms"]],
  // Adversarial pass-probes: legitimate variants must NOT fail.
  ["P1 reference phone with U+00A0 in contact text (expect 0)", (d) => edit(d, "contact/index.html", "<strong>Téléphone</strong>", "<strong>Téléphone</strong> (+33 6 08 75 58 77)")],
  ["P2 LinkedIn post URL in publications (expect 0)", (d) => edit(d, "publications/index.html", "Publications LinkedIn", "Publications LinkedIn (https://www.linkedin.com/posts/aymarddescorbiac_ia-123)")],
];

for (const [name, apply, extra = []] of MUTATIONS) {
  const dir = join(scratch, name.split(" ")[0]);
  cpSync(base, dir, { recursive: true });
  const where = apply(dir);
  for (const args of [[], extra].filter((a, i) => i === 0 || a.length)) {
    const r = spawnSync(process.execPath, ["tools/check.mjs", ...args], { cwd: dir, encoding: "utf8" });
    const lines = (r.stderr || "").split("\n").filter((l) => l.startsWith("  - ")).map((l) => l.slice(4));
    console.log(`${name} [${where}] check.mjs ${args.join(" ")} -> exit ${r.status}`);
    for (const l of lines) console.log(`    ${l}`);
    if (!lines.length && r.status !== 0) console.log(`    (no failure line) ${(r.stderr || "").trim().slice(0, 300)}`);
  }
}
if (existsSync(base)) console.log(`scratch: ${scratch}`);
