(() => {
  // Lecteur vidéo partagé : rien ne contacte YouTube avant le clic sur le bouton ▶.
  for (const launch of document.querySelectorAll('button[data-video]')) {
    launch.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.title = launch.closest('figure')?.querySelector('figcaption')?.textContent.trim() || launch.getAttribute('aria-label');
      frame.src = `https://www.youtube-nocookie.com/embed/${launch.dataset.video}?autoplay=1&playsinline=1`;
      frame.referrerPolicy = 'origin';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.setAttribute('allowfullscreen', '');
      frame.className = 'video-frame';
      launch.replaceWith(frame);
      frame.focus();
    });
  }
})();
