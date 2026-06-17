import React, { useState, useCallback, useEffect } from 'react';
import Lenis from 'lenis';
import './styles/global.css';

import Loader          from './components/Loader';
import CustomCursor    from './components/CustomCursor';
import ThreeBackground from './components/ThreeBackground';
import Navbar          from './components/Navbar';
import Hero            from './components/Hero';
import About           from './components/About';
import Skills          from './components/Skills';
import Projects        from './components/Projects';
import Contact         from './components/Contact';
import FloatingContact from './components/FloatingContact';
import { useScrollReveal } from './hooks/useScrollReveal';

// ── Silent analytics visit tracking ──────────────────────
function trackVisit(page) {
  fetch('/api/analytics/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page }),
  }).catch(() => {}); // silent — never breaks the UI
}

function Portfolio() {
  useScrollReveal();

  // Track portfolio visit on mount
  useEffect(() => {
    trackVisit('portfolio-home');
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const id = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <ThreeBackground />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <footer className="site-footer">
        <p>
          <span style={{ color: '#0066ff' }}>{'<'}</span>
          <span style={{ color: '#00aaff' }}>FH</span>
          <span style={{ color: '#0066ff' }}>{'>'}</span>
          {' '}Built with React + Three.js by Farhan Haroon — {new Date().getFullYear()}
          <span style={{ color: '#0066ff' }}>{'</FH>'}</span>
        </p>
      </footer>
    </>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);

  const handleLoaderComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <CustomCursor />

      {/* Loader sits on top — Portfolio renders underneath immediately */}
      {!loaded && <Loader onComplete={handleLoaderComplete} />}

      {/* Always mounted so it paints while loader is showing — no blank frame */}
      <div
        style={{
          opacity:       loaded ? 1 : 0,
          transition:    loaded ? 'opacity 0.6s ease' : 'none',
          pointerEvents: loaded ? 'auto' : 'none',
        }}
      >
        <Portfolio />
      </div>

      <FloatingContact />
    </>
  );
}
