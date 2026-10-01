/* Sourcinno — formulaire de contact (PRD §5.4).
 *
 * V1 : validation puis brouillon mailto, que le visiteur envoie lui-même.
 * Sans JavaScript, le formulaire est masque et le lien mailto du pied
 * de page permet toujours de nous ecrire. */
(() => {
  "use strict";

  const CFG = window.SOURCINNO_CONFIG || {};
  const EMAIL = (CFG.CONTACT_EMAIL || "aymard.de.scorbiac@sourcinno.com").trim();

  const LABELS = {
    nom: "Nom",
    email: "Email",
    telephone: "Téléphone",
    entreprise: "Entreprise",
    besoin: "Type de besoin",
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
    const subject = "Prise de contact — sourcinno.com";
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
        "Le brouillon a été préparé pour votre messagerie&nbsp;: " +
        "vous devez encore l’envoyer. Rien ne s’est ouvert&nbsp;? " +
        `<a href="${url.replace(/"/g, "&quot;")}">Ouvrir le message</a>, ` +
        `ou écrivez directement à <a href="mailto:${EMAIL}">${EMAIL}</a>.`;
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
      sendByMail(form);
    });
  }

  function init() {
    document.querySelectorAll("form[data-contact-form]").forEach(initForm);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
