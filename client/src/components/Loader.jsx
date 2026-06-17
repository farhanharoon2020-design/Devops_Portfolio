import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import '../styles/loader.css';

/* ── Realistic canvas fire simulation ─────────────────────── */
function startFire(canvas) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.width;
  const H   = canvas.height;

  // ── Particle types ────────────────────────────────────────
  class FlameParticle {
    constructor(type = 'flame') {
      this.type = type;
      this.reset();
    }
    reset() {
      const t = this.type;

      if (t === 'core') {
        // Hot inner core — wide, fast, bright white-blue
        this.x       = W * 0.05 + Math.random() * W * 0.9;
        this.y       = H + Math.random() * 20;
        this.vx      = (Math.random() - 0.5) * 1.2;
        this.vy      = -(H / 55 + Math.random() * H / 45); // scales to screen height
        this.size    = 60 + Math.random() * 120;
        this.maxLife = 0.9 + Math.random() * 0.5;

      } else if (t === 'flame') {
        // Main flame body — tall tongues reaching top
        this.x       = W * 0.02 + Math.random() * W * 0.96;
        this.y       = H + Math.random() * 40;
        this.vx      = (Math.random() - 0.5) * 2.0;
        this.vy      = -(H / 70 + Math.random() * H / 50); // scales to screen height
        this.size    = 50 + Math.random() * 110;
        this.maxLife = 1.1 + Math.random() * 0.8;

      } else {
        // Ember sparks — tiny, shoot all the way to top
        this.x       = W * 0.05 + Math.random() * W * 0.9;
        this.y       = H - Math.random() * H * 0.15;
        this.vx      = (Math.random() - 0.5) * 4;
        this.vy      = -(H / 40 + Math.random() * H / 30);
        this.size    = 3 + Math.random() * 6;
        this.maxLife = 0.7 + Math.random() * 0.6;
      }

      this.life        = 0;
      this.wobble      = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 2 + Math.random() * 3;
    }

    update(dt) {
      this.life   += dt;
      this.wobble += this.wobbleSpeed * dt;
      // Turbulence
      this.vx += Math.sin(this.wobble * 1.7) * 0.12 + Math.cos(this.wobble * 0.9) * 0.06;
      this.vx  *= 0.97;
      this.x   += this.vx;
      this.y   += this.vy;
      this.vy  -= 0.12; // faster upward acceleration
      if (this.type !== 'ember') this.size *= 0.994; // slower decay = taller flames
    }

    get p()    { return Math.min(this.life / this.maxLife, 1); }
    get dead() { return this.life >= this.maxLife || this.size < 0.5; }

    draw(ctx) {
      const p = this.p;
      let r, g, b, a;

      if (this.type === 'core') {
        // White-hot → pure blue core
        if (p < 0.2) {
          r = 255; g = 255; b = 255; a = p / 0.2; // white hot
        } else if (p < 0.5) {
          const t = (p - 0.2) / 0.3;
          r = Math.round(255 - t * 165); g = Math.round(255 - t * 200); b = 255; a = 1;
        } else {
          const t = (p - 0.5) / 0.5;
          r = Math.round(90 - t * 80); g = Math.round(55 - t * 50); b = 255; a = 1 - t;
        }

      } else if (this.type === 'flame') {
        // Electric blue flame
        if (p < 0.15) {
          const t = p / 0.15;
          r = Math.round(200 * t); g = Math.round(230 * t); b = 255; a = t;
        } else if (p < 0.55) {
          const t = (p - 0.15) / 0.4;
          r = Math.round(200 - t * 185); g = Math.round(230 - t * 185); b = 255; a = 1;
        } else {
          const t = (p - 0.55) / 0.45;
          r = 15; g = Math.round(45 + t * 120); b = 255; a = 1 - t * 0.95;
        }

      } else {
        // Ember — bright white-cyan spark
        const t = p;
        r = Math.round(200 - t * 180);
        g = Math.round(230 - t * 100);
        b = 255;
        a = 1 - t;
      }

      a = Math.max(0, Math.min(1, a));

      if (this.type === 'ember') {
        // Embers = simple bright circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
        ctx.shadowBlur  = 12;
        ctx.fill();
        ctx.shadowBlur  = 0;
      } else {
        // Flame = radial gradient blob
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        grad.addColorStop(0,    `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(0.35, `rgba(${Math.round(r*0.8)},${Math.round(g*0.5)},${b},${a * 0.75})`);
        grad.addColorStop(0.7,  `rgba(0,30,${b},${a * 0.35})`);
        grad.addColorStop(1,    `rgba(0,0,200,0)`);

        ctx.beginPath();
        // Elongated ellipse shape — taller than wide like real flame tongue
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(1, 1.5);
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.restore();
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }
  }

  // ── Spawn particles ───────────────────────────────────────
  const particles = [];
  const spawn = (type, count) => {
    for (let i = 0; i < count; i++) {
      const p = new FlameParticle(type);
      p.life = Math.random() * p.maxLife; // stagger births
      particles.push(p);
    }
  };
  spawn('core',  80);
  spawn('flame', 220);
  spawn('ember', 80);

  // Extra mid-height layer so fire reaches the top
  const spawnMid = (count) => {
    for (let i = 0; i < count; i++) {
      const p = new FlameParticle('flame');
      p.y    = H * (0.3 + Math.random() * 0.5); // start mid-screen
      p.vy   = -(H / 90 + Math.random() * H / 70);
      p.size = 40 + Math.random() * 80;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }
  };
  spawnMid(80);

  let last  = performance.now();
  let rafId;
  let time  = 0;

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05);
    last  = now;
    time += dt;

    ctx.clearRect(0, 0, W, H);

    // ── Pulsing base heat glow ──────────────────────────────
    const pulse = 0.5 + 0.5 * Math.sin(time * 8);
    const baseGlow = ctx.createLinearGradient(0, H, 0, H * 0.25);
    baseGlow.addColorStop(0,   `rgba(0,60,255,${0.35 + pulse * 0.2})`);
    baseGlow.addColorStop(0.3, `rgba(0,100,255,${0.15 + pulse * 0.1})`);
    baseGlow.addColorStop(0.6, `rgba(0,180,255,0.06)`);
    baseGlow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = baseGlow;
    ctx.fillRect(0, 0, W, H);

    // ── Draw all particles with additive blend ──────────────
    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(dt);
      particles[i].draw(ctx);
      if (particles[i].dead) particles[i].reset();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  rafId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(rafId);
}


/* ── Loader component ─────────────────────────────────────── */
export default function Loader({ onComplete }) {
  const canvasRef    = useRef(null);
  const fireRef      = useRef(null);
  const containerRef = useRef(null);
  const contentRef   = useRef(null);

  useEffect(() => {
    const canvas     = canvasRef.current;
    const container  = containerRef.current;
    const fireCanvas = fireRef.current;
    const content    = contentRef.current;

    // ── Pre-size fire canvas immediately so no layout jump later ──
    fireCanvas.width  = window.innerWidth;
    fireCanvas.height = window.innerHeight;

    const onResize = () => {
      fireCanvas.width  = window.innerWidth;
      fireCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Three.js scene setup
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 4;

    scene.add(new THREE.AmbientLight(0x0044aa, 1));
    const pLight = new THREE.PointLight(0x00aaff, 3, 20);
    pLight.position.set(2, 2, 2);
    scene.add(pLight);
    const pLight2 = new THREE.PointLight(0x00ffff, 2, 20);
    pLight2.position.set(-2, -2, 2);
    scene.add(pLight2);

    const group = new THREE.Group();
    const mat   = new THREE.MeshStandardMaterial({
      color: 0x0066ff, emissive: 0x003399, emissiveIntensity: 1,
      metalness: 0.5, roughness: 0.2,
    });

    const fParts = [
      new THREE.BoxGeometry(0.15, 1.4, 0.2),
      new THREE.BoxGeometry(0.6,  0.15, 0.2),
      new THREE.BoxGeometry(0.4,  0.15, 0.2),
    ];
    const fPos = [[-0.6, 0, 0], [-0.375, 0.625, 0], [-0.425, 0.1, 0]];
    fParts.forEach((geo, i) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...fPos[i]);
      group.add(mesh);
    });

    const hParts = [
      new THREE.BoxGeometry(0.15, 1.4, 0.2),
      new THREE.BoxGeometry(0.15, 1.4, 0.2),
      new THREE.BoxGeometry(0.45, 0.15, 0.2),
    ];
    const hPos = [[0.2, 0, 0], [0.65, 0, 0], [0.425, 0, 0]];
    hParts.forEach((geo, i) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...hPos[i]);
      group.add(mesh);
    });

    const wfMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.3,
    });
    group.children.forEach(child => {
      const wf = new THREE.Mesh(child.geometry.clone(), wfMat);
      wf.position.copy(child.position);
      group.add(wf);
    });
    scene.add(group);

    const ringGeo  = new THREE.TorusGeometry(1.2, 0.03, 8, 80);
    const ringMat  = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.7 });
    const ring     = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    scene.add(ring);

    const ring2Geo = new THREE.TorusGeometry(1.5, 0.02, 8, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
    const ring2    = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 5;
    ring2.rotation.z =  Math.PI / 6;
    scene.add(ring2);

    const clock = new THREE.Clock();
    let raf;
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = Math.sin(t * 1.2) * 0.6;
      group.rotation.x = Math.sin(t * 0.7) * 0.15;
      ring.rotation.z  = t * 1.5;
      ring2.rotation.y = t * -1.2;
      renderer.render(scene, camera);
    }
    animate();

    // ── Smooth exit sequence ─────────────────────────────────
    const timer = setTimeout(() => {

      // STEP 1 — Start fire & simultaneously fade out the logo/text
      //          Both happen at the SAME time — no pause
      const stopFire = startFire(fireCanvas);

      // Fire canvas fades in smoothly
      fireCanvas.style.transition = 'opacity 0.5s ease';
      fireCanvas.style.opacity    = '1';

      // Logo + text fades out at same time
      content.style.transition = 'opacity 0.5s ease';
      content.style.opacity    = '0';

      // STEP 2 — After fire has filled screen, fade the whole loader out
      //          smooth single fade, no double-stop
      setTimeout(() => {
        container.style.transition = 'opacity 0.5s ease';
        container.style.opacity    = '0';

        // STEP 3 — Cleanup after fade completes
        setTimeout(() => {
          stopFire();
          cancelAnimationFrame(raf);
          renderer.dispose();
          onComplete?.();
        }, 500);
      }, 500);

    }, 3800);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      renderer.dispose();
      window.removeEventListener('resize', onResize);
    };
  }, [onComplete]);

  return (
    <div className="loader" ref={containerRef} id="loader-screen">
      {/* Fire canvas — pre-sized, fades in over logo */}
      <canvas ref={fireRef} className="loader__fire-canvas" />

      {/* Logo + text wrapped so they fade out as fire fades in */}
      <div className="loader__content" ref={contentRef}>
        <canvas ref={canvasRef} className="loader__canvas" />
        <div className="loader__text">
          <span className="loader__name">FARHAN HAROON</span>
          <span className="loader__role">DevOps Engineer</span>
        </div>
        <div className="loader__bar-wrap">
          <div className="loader__bar" />
        </div>
      </div>
    </div>
  );
}
