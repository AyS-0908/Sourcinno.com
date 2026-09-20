/* Sourcinno — formulaires de contact (PRD §4.4).
 *
 * Deux modes, selon FORM_ENDPOINT dans config.js :
 *   vide    -> ouvre le logiciel de messagerie avec le message pre-rempli (mailto).
 *              Aucun compte, aucun service tiers, fonctionne partout.
 *   rempli  -> envoie le formulaire en arriere-plan (POST) et affiche un message
 *              de succes sans quitter la page.
 * La validation cote client est identique dans les deux cas.
 * Sans JavaScript, les formulaires restent lisibles et le lien mailto du pied
 * de page permet toujours de nous ecrire. */
(() => {
  "use strict";

  const CFG = window.SOURCINNO_CONFIG || {};
  const ENDPOINT = (CFG.FORM_ENDPOINT || "").trim();
  const EMAIL = (CFG.CONTACT_EMAIL || "aymard.de.scorbiac@sourcinno.com").trim();

  const LABELS = {
    nom: "Nom",
    email: "Email",
    telephone: "Téléphone",
    entreprise: "Entreprise",
    secteur: "Secteur d’activité",
    besoin: "Type de besoin",
    budget: "Budget estimé",
    message: "Message",
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function errorFor(field) {
    const value = (field.value || "").trim();
    if (field.type === "checkbox") {
      return field.checked ? "" : "Cette case doit être cochée pour envoyer le message.";
    }
    if (field.required && !value) return "Ce champ est obligatoire.";
    if (!value) return "";
    if (field.type === "email" && !EMAIL_RE.test(value)) {
      return "Cette adresse email ne semble pas valide.";
    }
    if (field.type === "tel" && value.replace(/[^0-9]/g, "").length < 9) {
      return "Ce numéro de téléphone semble incomplet.";
    }
    if (field.name === "message" && value.length < 10) {
      return "Merci de détailler un peu votre demande (10 caractères minimum).";
    }
    return "";
  }

  function showError(field, message) {
    const box = field.closest(".field");
    const slot = box && box.querySelector(".error");
    if (slot) slot.textContent = message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    return !message;
  }

  function fieldsOf(form) {
    return [...form.querySelectorAll("input, select, textarea")].filter((f) => f.type !== "submit");
  }

  function validate(form) {
    let firstBad = null;
    for (const field of fieldsOf(form)) {
      const ok = showError(field, errorFor(field));
      if (!ok && !firstBad) firstBad = field;
    }
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function say(form, state, text) {
    const box = form.querySelector(".form-status");
    if (!box) return;
    box.dataset.state = state;
    box.textContent = text;
    box.setAttribute("role", state === "error" ? "alert" : "status");
  }

  function summarise(form) {
    const data = new FormData(form);
    const lines = [];
    for (const [key, raw] of data.entries()) {
      if (key === "rgpd" || key.startsWith("_")) continue;
      const value = String(raw).trim();
      if (!value) continue;
      lines.push(`${LABELS[key] || key} : ${value}`);
    }
    return lines.join("\n");
  }

  function sendByMail(form) {
    const subject = form.id === "form-avance"
      ? "Demande d’accompagnement — sourcinno.com"
      : "Prise de contact — sourcinno.com";
    const body = summarise(form) + "\n\n--\nEnvoyé depuis sourcinno.com";
    const url = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    /* Le lien construit est conservé ET affiché : beaucoup de visiteurs n’ont
       aucun logiciel de messagerie installé, et la navigation mailto échoue
       alors sans rien dire. Ce lien de repli est leur seule porte de sortie. */
    form.dataset.lastMailto = url;
    window.location.href = url;
    const box = form.querySelector(".form-status");
    if (box) {
      box.dataset.state = "ok";
      box.setAttribute("role", "status");
      box.innerHTML =
        "Votre logiciel de messagerie vient de s’ouvrir avec le message pré-rempli&nbsp;: " +
        "il ne reste qu’à l’envoyer. Rien ne s’est ouvert&nbsp;? " +
        `<a href="${url.replace(/"/g, "&quot;")}">Ouvrir le message</a>, ` +
        `ou écrivez directement à <a href="mailto:${EMAIL}">${EMAIL}</a>.`;
    }
  }

  async function sendByEndpoint(form, button) {
    const original = button ? button.textContent : "";
    if (button) { button.disabled = true; button.textContent = "Envoi en cours…"; }
    say(form, "", "");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      form.reset();
      fieldsOf(form).forEach((f) => showError(f, ""));
      say(form, "ok", "Merci, votre message est bien parti. Réponse sous 48 heures ouvrées.");
    } catch (err) {
      say(form, "error",
        "L’envoi automatique a échoué. Écrivez-nous directement à " + EMAIL +
        " — votre message n’est pas perdu, il est encore dans le formulaire.");
    } finally {
      if (button) { button.disabled = false; button.textContent = original; }
    }
  }

  function initForm(form) {
    form.setAttribute("novalidate", "novalidate");
    for (const field of fieldsOf(form)) {
      field.addEventListener("blur", () => showError(field, errorFor(field)));
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid")) showError(field, errorFor(field));
      });
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate(form)) {
        say(form, "error", "Quelques champs sont à corriger, ils sont signalés ci-dessus.");
        return;
      }
      if (ENDPOINT) sendByEndpoint(form, form.querySelector('button[type="submit"]'));
      else sendByMail(form);
    });
  }

  /* Bouton "Besoin d’un accompagnement plus précis ?" — PRD §4.4 */
  function initDisclosure() {
    const trigger = document.querySelector("[data-toggle-advanced]");
    const panel = document.getElementById("bloc-form-avance");
    if (!trigger || !panel) return;
    trigger.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
    trigger.addEventListener("click", () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      trigger.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
        const first = panel.querySelector("input, select, textarea");
        if (first) first.focus({ preventScroll: true });
      }
    });
  }

  function init() {
    document.querySelectorAll("form[data-contact-form]").forEach(initForm);
    initDisclosure();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
