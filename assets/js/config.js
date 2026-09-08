/* Sourcinno — réglages fournisseurs.

   ⚠️ DÉPÔT PUBLIC. Ce fichier est lisible par tout le monde, sur GitHub comme
   dans le navigateur. N'y colle JAMAIS une clé secrète (clé API OpenAI, mot de
   passe, jeton). Seules des valeurs publiques par nature vont ici : une URL de
   formulaire, un identifiant de mesure d'audience, l'adresse d'un service
   intermédiaire. Une clé secrète doit rester sur le serveur, jamais ici.

   SEUL fichier à modifier pour brancher un service externe.
   Tant qu'une valeur est vide, la fonctionnalité marche en mode dégradé
   (décrit en commentaire) : le site ne casse jamais.  */

window.SOURCINNO_CONFIG = {
  /* Adresse qui reçoit les formulaires.
     Vide  -> les formulaires ouvrent le logiciel de messagerie (mailto) avec
              le message pré-rempli. Fonctionne partout, sans compte.
     Rempli -> les formulaires envoient directement en arrière-plan.
     Coller ici l'URL fournie par Formspree / Web3Forms / Resend.
     Exemple : "https://formspree.io/f/abcdwxyz"                            */
  FORM_ENDPOINT: "",

  /* Adresse email de destination, utilisée par le mode mailto. */
  CONTACT_EMAIL: "aymard@de-scorbiac.fr",

  /* Mesure d'audience. Vide -> aucun script de suivi n'est chargé.
     PLAUSIBLE_DOMAIN : ex. "sourcinno.com"
     GA_MEASUREMENT_ID : ex. "G-XXXXXXXXXX"
     Le script n'est injecté qu'après acceptation de la bannière cookies.   */
  PLAUSIBLE_DOMAIN: "",
  GA_MEASUREMENT_ID: "",

  /* Assistant. Vide -> assistant scripté hors ligne (questions courantes
     sur le parcours, les offres, les publications).
     Rempli -> les questions sont envoyées à cette URL (POST JSON).         */
  CHAT_API_URL: ""
};
