import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { initScene, startLoop, disposeScene } from '../three/sceneSetup';
import { createFloatingIcons, updateFloatingIcons } from '../three/floatingIcons';
import { createParticleSphere, updateParticles, createStarfield } from '../three/particles';

export default function ThreeBackground() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const { scene } = initScene(canvas);

    // Build scene objects
    const icons       = createFloatingIcons(scene);
    const particles   = createParticleSphere(scene);
    const stars       = createStarfield(scene);

    // Mouse tracking for parallax
    function onMouseMove(e) {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMouseMove);

    // Scroll — move camera Z slightly per scroll position
    function onScroll() {
      const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    }
    window.addEventListener('scroll', onScroll);

    const stop = startLoop((delta, elapsed) => {
      const { x: mx, y: my } = mouseRef.current;
      updateFloatingIcons(icons, elapsed, mx, my);
      updateParticles(particles, elapsed);
      if (stars) stars.rotation.y = elapsed * 0.005;
    });

    return () => {
      stop();
      disposeScene();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="three-bg"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
