import { useEffect } from 'react';

/**
 * Attaches an IntersectionObserver to all .reveal elements
 * and adds the .visible class when they enter the viewport.
 * Also uses a MutationObserver to catch elements added after
 * the initial render (e.g. from API fetches like Skills).
 */
export function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    // Observe all currently existing .reveal elements
    const observe = (root = document) => {
      root.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el));
    };
    observe();

    // Watch for new .reveal elements added to the DOM after initial render
    const mo = new MutationObserver(() => observe());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
