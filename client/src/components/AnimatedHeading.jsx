import React, { useRef } from 'react';
import { useSplitReveal } from '../hooks/useGsap';

/**
 * A heading whose characters reveal with an upward stagger as it
 * scrolls into view (GSAP SplitText). Drop-in replacement for the
 * plain `<h2 className="section-title reveal">` used across sections.
 *
 * Easing is tunable via `ease` / `duration` / `stagger` so a section
 * can give its title its own personality (Skills echoes its cards
 * with a back-overshoot); by default every heading stays uniform.
 *
 * Respects prefers-reduced-motion via the underlying hook.
 */
export default function AnimatedHeading({
  as: Tag = 'h2',
  className = '',
  ease,
  duration,
  stagger,
  children,
  ...rest
}) {
  const ref = useRef(null);
  useSplitReveal(ref, { ease, duration, stagger });

  return (
    <Tag ref={ref} className={`reveal-heading ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
