#!/usr/bin/env node
/* Sourcinno — controle de l assistant : `node tools/test-chat.mjs`.
 *
 * POURQUOI. Les questions ci-dessous sont celles que le PRD (§9 et MOCKUPS §7)
 * donne comme exemples d acceptation. Trois d entre elles ont ete mal aiguillees
 * lors du premier essai — d ou ce controle : il rougit si l aiguillage regresse.
 *
 * Le script charge assets/js/chat.js tel quel, avec un faux DOM minimal juste
 * suffisant pour que le module s initialise et publie sa fonction de reponse.
 * C est bien la fonction EXPEDIEE qui est testee, pas une copie. */
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* Faux DOM : uniquement ce que init() touche. Tout renvoie un objet inerte. */
function fakeElement() {
  const el = {
    style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
    children: [],
    set className(v) {}, set innerHTML(v) {}, set textContent(v) {}, set type(v) {},
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    addEventListener() {}, appendChild(c) { this.children.push(c); return c; },
    remove() {}, focus() {}, querySelector() { return fakeElement(); },
    querySelectorAll() { return []; }, closest() { return null; }, scrollIntoView() {},
  };
  return el;
}

const window = { SOURCINNO_CONFIG: { CHAT_API_URL: "" } };
const document = {
  readyState: "complete",
  body: fakeElement(),
  head: fakeElement(),
  createElement: () => fakeElement(),
  addEventListener() {},
  querySelector: () => null,
  querySelectorAll: () => [],
};
window.document = document;
window.matchMedia = () => ({ matches: false });

runInNewContext(readFileSync(join(ROOT, "assets/js/chat.js"), "utf8"), {
  window, document, console, fetch: async () => { throw new Error("hors ligne"); },
  setTimeout, JSON, Math, Date, RegExp, String, Object, Array,
});

const answer = window.__sourcinnoAnswer;
if (typeof answer !== "function") {
  console.error("ECHEC: chat.js n a pas publie sa fonction de reponse");
  process.exit(1);
}

const plain = (html) => String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* question -> fragment qui DOIT apparaitre dans la reponse */
const CAS = [
  ["Quelles sont vos offres ?", "Trois offres"],
  ["Que proposez-vous comme prestation ?", "Trois offres"],
  ["Parlez-moi de votre expérience chez Mazars", "Chez Mazars"],
  ["Vous avez travaillé chez Accenture ?", "Chez Accenture"],
  ["C'est quoi Fabereo ?", "500 K"],
  ["Quel est votre parcours ?", "consultant indépendant"],
  ["Que faites-vous en IA ?", "prototype en quelques jours"],
  ["Vous connaissez les LLM ?", "prototype en quelques jours"],
  ["Comment optimiser mes processus ?", "cartographie des processus"],
  ["Vous faites du venture building ?", "incubation jalonn"],
  ["Avez-vous écrit un livre ?", "Engagez-vous 2.0"],
  ["Où trouver vos publications ?", "Du PIB au BCI"],
  ["Vous êtes sur LinkedIn ?", "Le profil LinkedIn"],
  ["Comment vous contacter ?", "48 heures ouvr"],
  ["Où êtes-vous basé ?", "l’Afrique"],
  ["Puis-je voir un prototype ?", "portfolio de prototypes"],
  ["Quelles sont vos références clients ?", "PME"],
];

/* Questions hors sujet : l assistant DOIT refuser plutot qu inventer. */
const HORS_SUJET = [
  "Quel est le prix du bitcoin ?",
  "Quelle est la capitale de l'Australie ?",
  "Combien coûte une mission ?",
];

let failed = 0;
for (const [question, attendu] of CAS) {
  const got = plain(answer(question));
  if (!got.includes(attendu)) {
    console.error(`ECHEC  « ${question} »\n       attendu un extrait : "${attendu}"\n       obtenu : ${got.slice(0, 120)}`);
    failed++;
  }
}
for (const question of HORS_SUJET) {
  const got = plain(answer(question));
  if (!got.includes("Je ne sais répondre que sur")) {
    console.error(`ECHEC  « ${question} » devait etre refusee, mais a recu : ${got.slice(0, 120)}`);
    failed++;
  }
}

if (failed) {
  console.error(`\nASSISTANT: ${failed} cas en echec sur ${CAS.length + HORS_SUJET.length}`);
  process.exit(1);
}
console.log(`  ASSISTANT: ${CAS.length} question(s) correctement aiguillee(s), ${HORS_SUJET.length} hors sujet correctement refusee(s)`);
