import React, { useEffect, useRef } from 'react';
import '../styles/cursor.css';

export default function CustomCursor() {
  const canvasRef   = useRef(null);
  const cursorRef   = useRef(null);
  const hovering    = useRef(false); // ref not state — no re-render on hover

  useEffect(() => {
    if (window.innerWidth <= 768) return;

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const cursor = cursorRef.current;

    let W = window.innerWidth;
    let H = window.innerHeight;

    canvas.width  = W;
    canvas.height = H;

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Mouse position — updated directly, never causes re-render
    const mouse  = { x: -200, y: -200 };
    const points = [];

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Move ball instantly via transform — no RAF needed for this
      cursor.style.transform = `translate3d(${mouse.x}px,${mouse.y}px,0)`;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Hover — toggle class directly, no setState = no re-render = no jank
    const onEnter = () => {
      hovering.current = true;
      cursor.classList.add('cursor-hover');
    };
    const onLeave = () => {
      hovering.current = false;
      cursor.classList.remove('cursor-hover');
    };

    const attachHover = () => {
      document.querySelectorAll('a,button,input,textarea,[role="button"]').forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.addEventListener('mouseenter', onEnter, { passive: true });
        el.addEventListener('mouseleave', onLeave, { passive: true });
      });
    };
    attachHover();

    const mo = new MutationObserver(attachHover);
    mo.observe(document.body, { childList: true, subtree: true });

    // Trail animation — no shadowBlur (expensive), use opacity instead
    let raf;
    let tick = 0;

    const LAYERS = [
      { color: [26,  26,  26],  offset: 0,              wScale: 1.4 },
      { color: [0,   170, 255], offset: Math.PI * 0.66, wScale: 0.9 },
      { color: [255, 255, 255], offset: Math.PI * 1.33, wScale: 0.5 },
    ];
    const MAX_AGE  = 32;
    const MAX_PTS  = 60; // hard cap — never more than 60 points

    function animate() {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, W, H);

      if (mouse.x > -200) {
        if (points.length >= MAX_PTS) points.shift();
        points.push({ x: mouse.x, y: mouse.y, age: 0 });
      }

      const hov = hovering.current;

      for (let l = 0; l < LAYERS.length; l++) {
        const { color, offset, wScale } = LAYERS[l];
        const [r, g, b] = color;

        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];

          const fade  = 1 - p1.age / MAX_AGE;
          const t     = tick * 0.08;
          const amp   = 10 * fade;

          const wx1 = Math.sin(p1.age * 0.18 + t + offset) * amp;
          const wy1 = Math.cos(p1.age * 0.18 + t + offset) * amp;
          const wx2 = Math.sin(p2.age * 0.18 + t + offset) * amp;
          const wy2 = Math.cos(p2.age * 0.18 + t + offset) * amp;

          ctx.beginPath();
          ctx.moveTo(p1.x + wx1, p1.y + wy1);
          ctx.lineTo(p2.x + wx2, p2.y + wy2);
          ctx.lineWidth   = Math.max(0.1, (MAX_AGE - p1.age) * 0.3 * wScale * (hov ? 1.4 : 1));
          ctx.strokeStyle = `rgba(${r},${g},${b},${fade * 0.85})`;
          ctx.stroke();
        }
      }

      // Age and cull
      for (let i = points.length - 1; i >= 0; i--) {
        points[i].age++;
        if (points[i].age > MAX_AGE) points.splice(i, 1);
      }

      tick++;
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []); // ← empty deps — NEVER restarts on hover

  return (
    <>
      <canvas ref={canvasRef} className="custom-cursor-canvas" />
      <div    ref={cursorRef} className="custom-cursor-ball"   />
    </>
  );
}
