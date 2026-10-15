(() => {
  const chat = document.querySelector('[data-chat]');
  const status = document.querySelector('[data-chat-status]');
  let loading = false, ready = false, io = null;
  const start = async () => {
    if (loading || ready) return;
    loading = true;
    try {
      if (status) {
        status.hidden = false;
        status.textContent = 'Ouverture de la conversation…';
      }
      const { default: Typebot } = await import('/assets/js/vendor/typebot-js-0.10.11/web.js');
      const css = getComputedStyle(chat);
      const color = name => css.getPropertyValue(name).trim();
      Typebot.initStandard({
        typebot: 'paiement-produit-num-rique-o8lsepu',
        apiHost: 'https://typebot.io',
        previewTheme: {
          general: { background: { type: 'Color', content: color('--white') }, font: { type: 'Custom', family: color('--font-body') } },
          chat: {
            hostBubbles: { backgroundColor: color('--grey-50'), color: color('--navy') },
            guestBubbles: { backgroundColor: color('--teal-dark'), color: color('--white') },
            buttons: { backgroundColor: color('--teal-dark'), color: color('--white') },
            inputs: { backgroundColor: color('--grey-50'), color: color('--navy') },
          },
        },
      });
      document.querySelector('typebot-standard').hidden = false;
      if (status) status.hidden = true;
      ready = true;
      io?.disconnect();
    } catch {
      if (status) status.textContent = 'La conversation est indisponible ici. Utilisez le lien Typebot ou contactez-nous ci-dessous.';
    } finally {
      loading = false;
    }
  };
  if (!chat) return;
  /* La conversation démarre seule quand sa section arrive à l'écran (essai suivant au prochain passage si le
     chargement échoue) ; sans IntersectionObserver, dès le chargement de la page. */
  if (typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) start(); });
    io.observe(chat.closest('section') || chat);
  } else start();
})();
