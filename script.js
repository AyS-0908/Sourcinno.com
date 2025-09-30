/* script.js — Sourcinno
   - Injecte header/footer
   - Active nav courant + burger mobile
   - Logo => index.html
   - Met à jour l'année dans le footer
   - Effet typewriter pour les héros
*/
(() => {
  'use strict';

  const COMPONENTS = {
    header: { selector: '#app-header', url: 'components/header.html' },
    footer: { selector: '#app-footer', url: 'components/footer.html' }
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    await Promise.all(Object.values(COMPONENTS).map(loadComponent));
    initHeaderBehavior();
    initFooterBehavior();
    initTypewriter();
  }

  async function loadComponent({ selector, url }) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      mount.innerHTML = await res.text();
    } catch (err) {
      console.warn(`[Sourcinno] Impossible de charger ${url}:`, err);
    }
  }

  function initHeaderBehavior() {
    const headerRoot = document.querySelector(COMPONENTS.header.selector);
    if (!headerRoot) return;

    // Logo -> home (si ce n'est pas déjà un <a>)
    const logo = headerRoot.querySelector('[data-home], .site-logo, #logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        const isLink = (logo.tagName === 'A' || logo.closest('a'));
        if (!isLink) e.preventDefault();
        window.location.href = 'index.html';
      });
    }

    // Burger mobile
    const toggle = headerRoot.querySelector('#nav-toggle');
    const nav = headerRoot.querySelector('nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
      });
    }

    // Lien actif
    const current = normalizePath(window.location.pathname);
    headerRoot.querySelectorAll('nav a[href]').forEach((a) => {
      const href = normalizePath(a.getAttribute('href'));
      if (href === current) a.classList.add('active');
    });
  }

  function initFooterBehavior() {
    const footerRoot = document.querySelector(COMPONENTS.footer.selector);
    if (!footerRoot) return;
    const yearEl = footerRoot.querySelector('[data-year]');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function normalizePath(path) {
    try {
      if (!path || path === '/' || path.endsWith('/')) return 'index.html';
      const p = path.split('/').pop();
      return p || 'index.html';
    } catch {
      return 'index.html';
    }
  }

  // === Typewriter ===
  function initTypewriter() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('[data-typewriter]');
    els.forEach((el) => {
      const text = el.getAttribute('data-text') || el.textContent.trim();
      const speed = parseInt(el.getAttribute('data-speed'), 10) || 35;
      const delay = parseInt(el.getAttribute('data-delay'), 10) || 120;
      el.textContent = '';
      if (prefersReduced) {
        el.textContent = text;
        return;
      }
      type(text, el, speed, delay);
    });
  }

  function type(text, el, speed, delay) {
    let i = 0;
    function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, i === 1 ? delay : speed);
      }
    }
    step();
  }
})();
