// p68 TARGET TEXT (root prompts/pass68-coder.md, owner file prompts/relecture-20261028.md), as rendered words.
// whole: a `main > section` whose whole text is the owner's text. subs: [old, new] applied to the BASE (b332007) render of
// that page, new = the owner's words; every other section must equal the base render (nothing else changes).
export const PAGES = {
  '/service-performance/': {
    whole: {
      besoin: `Votre besoin > Livrables
1. Choisir la direction
Notre positionnement est-il toujours adapté à l'évolution de nos marchés et de nos clients ?
Sur quelles offres, quels clients et quels marchés devons-nous concentrer nos efforts ?
Qu'est-ce qui nous différencie réellement de nos concurrents ?
Où se trouvent nos meilleures opportunités de croissance et de rentabilité ?
Quels choix stratégiques privilégier, compte tenu de nos moyens et des risques ?
2. Définir les leviers de performance opérationnelle
Où perdons-nous aujourd'hui du temps, de l'argent ou de la qualité ?
Comment simplifier nos processus et améliorer notre productivité ?
Notre organisation facilite-t-elle les décisions et la coopération entre les équipes ?
Avons-nous les compétences et les outils adaptés à nos ambitions ?
Quels changements auraient le plus d'impact sur nos coûts, nos marges et la satisfaction de nos clients ?
3. Transformer les décisions en résultats
Quels projets lancer en priorité, et lesquels reporter ou abandonner ?
Quels moyens humains et financiers mobiliser, pour quels résultats attendus ?
Comment clarifier les responsabilités et accélérer les décisions ?
Comment mobiliser les équipes et faire adopter de nouvelles façons de travailler ?
Comment mesurer les résultats obtenus et ajuster les actions si nécessaire ?`,
    },
    subs: [],
  },
  '/service-ia-business/': {
    whole: {
      0: `Entreprise IA
Rendre l'IA aussi naturelle que l'email`,
      besoin: `Vous accompagner
« Quelles sont les menaces et opportunités de l'IA pour nous ? Quels cas d'usage opérationnels rentables ? »
1. Identifier les enjeux spécifiques à l'entreprise
Identifier les enjeux stratégiques
Comment l'IA transforme-t-elle notre marché : clients, concurrents, fournisseurs et technologies ?
Notre offre et modèle économique sont-ils menacés ? Quelles nouvelles opportunités de croissance et de différenciation ?
Quelles évolutions technologiques et réglementaires devons-nous anticiper ?
Identifier les enjeux opérationnels
Où en sommes-nous en termes d'usage de l'IA, compétences, et adhésion des équipes ?
Quels processus et activités pourrions-nous améliorer grâce à l'IA ?
Nos données, outils et infrastructure sont-ils adaptés à nos ambitions ?
2. Définir les vraies priorités
Quels enjeux sont prioritaires pour notre entreprise (urgents x importants) ?
Où y a-t-il le plus de potentiel, i.e. maximum de valeur (croissance, productivité, qualité) et minimum de défis (coûts, risques, résistances) ?
Quels projets découlent des enjeux et potentiel ?
Quel type d'IA-sation par projet : activer les fonctions IA de nos outils, déployer des agents IA, ou restructurer certains processus ?
3. Réussir la mise en œuvre
Quelle feuille de route : projets, calendrier, budgets, ressources et responsabilités ?
Comment organiser la gouvernance, maîtriser les risques et garantir la conformité ?
Comment mobiliser les équipes, développer les compétences et accompagner le changement ?
Faut-il acheter des solutions existantes (sur quels critères), développer en interne ou s'appuyer sur des partenaires ?
Comment expérimenter et mesurer les bénéfices avant de déployer à plus grande échelle ?`,
      experience: `Expériences associées
Formation de dirigeants à l'IA
CEO, Directeur marketing, DRH…
Automatisation des workflows
n8n, API d'IA, intégration au système d'information
Veille technologique
LLM, IA agentique, outils NoCode
Prototypes IA
DIGITAL PAGER, GO VIRAL, QUICK DIAG, N8N ORCHESTRATOR`,
    },
    subs: [],
  },
  '/service-venture-building/': {
    whole: {},
    subs: [
      ['Les entreprises établies ont des actifs dormants pour créer des startups titans', 'Les entreprises établies peuvent créer des startups titans avec leurs actifs dormants'],
      ['du cœur de métier = potentiels leaders :', "du cœur de métier = ils l'ont fait :"],
      ['Fabereo Co-fondation', 'Fabereo (corporate startup) Co-fondation'],
      ['Portefeuille de prototypes de startup.', 'Portefeuille de pré-startups (prototype + business plan).'],
    ],
  },
  '/': {
    whole: {},
    subs: [
      ['Arbitrage des scénarios', 'Arbitrage des scénarii'],
      ['Frameworks : matrice décisionnelle, ex. impact × mise en œuvre', 'Frameworks : matrice décisionnelle (ex. impact x mise en œuvre)'],
      ['Outils : agents IA de brainstorming et de challenge', 'Outils : agents IA : brainstorming, challenging'],
      ['Outils : agents IA créés pour chaque cas', 'Outils : agents IA créés par cas spécifique'],
      ['Frameworks : courbe en S', 'Frameworks : S-curve'],
      ['Outils : agents IA de suivi des tâches et de reporting', 'Outils : agents IA suivi des tâches et reporting'],
    ],
  },
};
