/* ============================================================
   GSAP HOOKS — per-section motion primitives
   ------------------------------------------------------------
   Each section of the portfolio has its own motion signature.
   These hooks encode them so components stay declarative:
     • useSplitReveal   — per-character heading reveal (ease is
       tunable so a section can echo its own personality).
     • useHeroIntro     — terminal "boot" sequence: the name
       types in with a blinking caret.
     • useStaggerReveal — grid/list reveal with a configurable
       ease (Skills = snappy back-overshoot; About = deliberate
       line-by-line print).
     • useParallax      — scroll-linked drift, slower than the
       surrounding content (Projects depth).
   All respect prefers-reduced-motion.
   ============================================================ */

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, MOTION, prefersReducedMotion } from '../lib/gsap';

/**
 * Splits a heading into characters and reveals them with a subtle
 * upward stagger the first time it scrolls into view. The ease is
 * tunable so a section can give its title its own personality
 * (e.g. Skills uses a back-overshoot to echo its cards).
 *
 * The target should carry `.reveal-heading` so it starts hidden.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {{ease?:string, duration?:number, stagger?:number}} [opts]
 */
export function useSplitReveal(ref, opts = {}) {
  const {
    ease = MOTION.ease,
    duration = MOTION.headingDuration,
    stagger = MOTION.headingStagger,
  } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    let split;
    let trigger;
    let cancelled = false;

    const build = () => {
      if (cancelled || !ref.current) return;
      split = new SplitText(el, { type: 'chars', charsClass: 'split-char' });
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(split.chars, { yPercent: 120, opacity: 0 });

      const tween = gsap.to(split.chars, {
        yPercent: 0,
        opacity: 1,
        duration,
        ease,
        stagger,
        paused: true,
      });

      trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => tween.play(),
      });
    };

    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => { if (ref.current) build(); });
    } else {
      build();
    }

    return () => {
      cancelled = true;
      if (trigger) trigger.kill();
      if (split) split.revert();
    };
  }, [ref, ease, duration, stagger]);
}

/**
 * Terminal "boot" entrance for the hero. Plays once `active` flips
 * true (loader handoff). The name types in character-by-character
 * with a blinking caret; surrounding blocks fade up around it.
 * Deliberately paced (~2s) so it reads as a boot, not a flourish.
 *
 * @param {React.RefObject<HTMLElement>} scopeRef
 * @param {boolean} active
 */
export function useHeroIntro(scopeRef, active) {
  const played = useRef(false);

  // Hide targets before first paint so nothing flashes in.
  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root || prefersReducedMotion()) return;

    gsap.set(
      root.querySelectorAll(
        '.hero__open-badge, .hero__greeting, .hero__name, .hero__subtitle, ' +
        '.hero__value-prop, .hero__typewriter, .hero__cta, .hero__stats'
      ),
      { autoAlpha: 0, y: 24 }
    );
    gsap.set(root.querySelector('.hero__photo-side'), { autoAlpha: 0, scale: 0.92 });
    gsap.set(root.querySelector('[data-hero-cursor]'), { autoAlpha: 0 });
  }, [scopeRef]);

  useEffect(() => {
    const root = scopeRef.current;
    if (!root || !active || played.current) return;
    played.current = true;

    const q = (sel) => root.querySelector(sel);
    const tail = root.querySelectorAll(
      '.hero__value-prop, .hero__typewriter, .hero__cta, .hero__stats'
    );
    const nameBlock = q('.hero__name');
    const nameText = q('[data-hero-name]');
    const cursor = q('[data-hero-cursor]');
    const photo = q('.hero__photo-side');

    // Reduced motion: reveal everything, skip the boot.
    if (prefersReducedMotion()) {
      gsap.set(
        [
          q('.hero__open-badge'), q('.hero__greeting'), nameBlock,
          q('.hero__subtitle'), photo, ...tail,
        ],
        { autoAlpha: 1, y: 0, scale: 1 }
      );
      return;
    }

    let nameSplit;
    let blink;
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.to(q('.hero__open-badge'), { autoAlpha: 1, y: 0, duration: 0.4 }, 0);
    tl.to(q('.hero__greeting'), { autoAlpha: 1, y: 0, duration: 0.4 }, 0.15);

    // Photo eases in on its own track, parallel with the text boot.
    tl.to(photo, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.2);

    // ── Name types in with a blinking caret ──────────────────
    if (nameText) {
      nameSplit = new SplitText(nameText, { type: 'chars', charsClass: 'split-char' });
      gsap.set(nameSplit.chars, { opacity: 0 });

      tl.set(nameBlock, { autoAlpha: 1, y: 0 }, 0.5);
      tl.set(cursor, { autoAlpha: 1 }, 0.5);
      tl.add(() => {
        // Caret blink runs while the boot line is "active".
        blink = gsap.to(cursor, {
          opacity: 0.1, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)',
        });
      }, 0.5);
      // Mechanical, evenly-timed character reveal = typing.
      tl.to(nameSplit.chars, {
        opacity: 1, duration: 0.01, ease: 'none', stagger: 0.055,
      }, 0.5);
    }

    // Subtitle prints after the name; caret retires as it appears.
    tl.to(q('.hero__subtitle'), { autoAlpha: 1, y: 0, duration: 0.4 }, 1.25);
    tl.add(() => { if (blink) blink.kill(); }, 1.25);
    tl.to(cursor, { autoAlpha: 0, duration: 0.2 }, 1.25);

    // Remaining blocks fade up together to close the sequence.
    tl.to(tail, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 }, 1.4);

    return () => {
      tl.kill();
      if (blink) blink.kill();
      if (nameSplit) nameSplit.revert();
    };
  }, [scopeRef, active]);
}

/**
 * Reveals a set of items (grid children, or a custom selector within
 * the ref) with a stagger as they scroll into view. The ease and
 * travel are configurable so each section can feel different:
 *   Skills  → big travel + back-overshoot, fast stagger (punchy)
 *   About   → slide from the left, long stagger (line-by-line print)
 *
 * @param {React.RefObject<HTMLElement>} ref  container element
 * @param {{
 *   selector?: string, from?: object, duration?: number,
 *   ease?: string, stagger?: number, start?: string
 * }} [opts]
 */
export function useStaggerReveal(ref, opts = {}) {
  const {
    selector,
    from = { opacity: 0, y: 40 },
    duration = 0.5,
    ease = 'power3.out',
    stagger = 0.08,
    start = 'top 85%',
  } = opts;

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = selector ? root.querySelectorAll(selector) : root.children;
    if (!items || items.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, x: 0, y: 0, scale: 1 });
      return;
    }

    // Set the hidden start state explicitly, then animate to the
    // natural (visible) state. Using set + to — rather than gsap.from
    // — keeps the target values correct through React StrictMode's
    // mount/remount, which would otherwise capture the hidden state as
    // the target and leave elements stuck invisible.
    gsap.set(items, from);
    const anim = gsap.to(items, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration,
      ease,
      stagger,
      clearProps: 'transform',
      scrollTrigger: { trigger: root, start, once: true },
    });

    return () => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    };
  }, [ref, selector, from, duration, ease, stagger, start]);
}

/**
 * Scroll-linked parallax: the element drifts vertically at a slower
 * rate than the content around it, giving a sense of depth. Tied to
 * a trigger's full pass through the viewport via scrub.
 *
 * @param {React.RefObject<HTMLElement>} ref  element to drift
 * @param {{ trigger?: React.RefObject<HTMLElement>, distance?: number }} [opts]
 */
export function useParallax(ref, opts = {}) {
  const { trigger, distance = 15 } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const triggerEl = (trigger && trigger.current) || el;
    const tween = gsap.fromTo(
      el,
      { yPercent: distance },
      {
        yPercent: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: triggerEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [ref, trigger, distance]);
}
