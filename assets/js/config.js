/* Sourcinno — réglages fournisseurs.

   ⚠️ DÉPÔT PUBLIC. Ce fichier est lisible par tout le monde, sur GitHub comme
   dans le navigateur. N'y colle JAMAIS une clé secrète (clé API OpenAI, mot de
   passe, jeton). Seules des valeurs publiques par nature vont ici : une URL de
   formulaire, un identifiant de mesure d'audience, l'adresse d'un service
   intermédiaire. Une clé secrète doit rester sur le serveur, jamais ici.

   Les fonctionnalités V2 nécessiteront leurs scripts et leur validation
   avant de brancher un service externe. */

window.SOURCINNO_CONFIG = {
  /* Réservé à V2. V1 utilise uniquement un brouillon mailto ;
     renseigner cette valeur ne suffit pas à activer l'envoi automatique. */
  FORM_ENDPOINT: "",

  /* Adresse email de destination, utilisée par le mode mailto. */
  CONTACT_EMAIL: "aymard.de.scorbiac@sourcinno.com"

  /* V2 — réglages des fonctionnalités mises de côté pour la version 1.
     Leurs scripts sont rangés dans assets/js/_v2/. À remettre ici, avec une
     virgule après CONTACT_EMAIL, le jour où la fonctionnalité revient :

       PLAUSIBLE_DOMAIN: ""     mesure d'audience, ex. "sourcinno.com"
       GA_MEASUREMENT_ID: ""    mesure d'audience, ex. "G-XXXXXXXXXX"
       CHAT_API_URL: ""         assistant, URL appelée en POST JSON          */
};
