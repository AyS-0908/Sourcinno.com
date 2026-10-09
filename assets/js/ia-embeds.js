(() => {
  const chat = document.querySelector('[data-chat]');
  const status = document.querySelector('[data-chat-status]');
  let loading = false, ready = false;
  chat?.addEventListener('toggle', async () => {
    if (!chat.open || loading || ready) return;
    loading = true;
    status.hidden = false;
    status.textContent = 'Ouverture de la conversation…';
    try {
      const { default: Typebot } = await import('https://cdn.jsdelivr.net/npm/@typebot.io/js@0.10.11/dist/web.js');
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
      status.hidden = true;
      ready = true;
    } catch {
      status.textContent = 'La conversation est indisponible ici. Utilisez le lien Typebot ou contactez-nous ci-dessous. Fermez puis rouvrez pour réessayer.';
    } finally {
      loading = false;
    }
  });
})();
