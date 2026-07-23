/* ============================================================
   SHARED GSAP CONFIG — Farhan Haroon DevOps Portfolio
   ------------------------------------------------------------
   Single source of truth for GSAP. Plugins are registered ONCE
   here so components never re-register them. Import gsap /
   ScrollTrigger / SplitText from this file, never from 'gsap'
   directly.
   ============================================================ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register every plugin the site uses, exactly one time.
gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * True when the user has asked the OS to minimise motion.
 * Non-essential animation should be shortened or skipped when this
 * returns true. Guarded for SSR / non-browser contexts.
 */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Shared easing + timing tokens so every section shares one feel.
export const MOTION = {
  ease: 'power3.out',
  // Keep heading reveals subtle: total time stays under 0.6s.
  headingDuration: 0.5,
  headingStagger: 0.02,
};

export { gsap, ScrollTrigger, SplitText };
