import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import profileImg from '../assets/farhan.png';
import '../styles/hero.css';

// Animated counter hook
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const ROLES = [
  'Linux Enthusiast',
  'Bash Scripting Expert',
  'Network Engineer',
  'Docker Specialist',
];

// ── Floating tool badges ─────────────────────────────────────
// Icons: Docker (simple-icons), AWS (simple-icons), Linux terminal
// (Material), K8s settings gear (Material), Git (simple-icons)
const TOOL_BADGES = [
  {
    label: 'Docker', color: '#2496ed',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.186.186 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.887c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/>
      </svg>
    ),
  },
  {
    label: 'AWS', color: '#ff9900',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 01-.28.104.488.488 0 01-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 01.224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 011.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 00-.735-.136 6.02 6.02 0 00-.75-.048c-.535 0-.926.104-1.19.32-.262.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.063-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 01-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 01.32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 01.311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 01-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 01-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 01-.048-.224v-.407c0-.167.063-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 00.415-.758.777.777 0 00-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 01-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 01.24.2.43.43 0 01.071.263v.375c0 .168-.063.256-.184.256a.83.83 0 01-.303-.096 3.652 3.652 0 00-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.025-.527.27-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.385.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z"/>
      </svg>
    ),
  },
  {
    label: 'Linux', color: '#00aaff',
    icon: (
      // Material "terminal" icon — monitor with > prompt
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10l1.5 1.5L6 13h2l1.5-1.5L8 10H6zm4 3h6v-1.5h-6V13z"/>
      </svg>
    ),
  },
  {
    label: 'K8s', color: '#326ce5',
    icon: (
      // Material "settings" cog — universally recognised as Kubernetes
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.36.07-.73.07-1.08 0-.36-.03-.73-.07-1.08l2.34-1.83c.21-.16.26-.46.12-.7l-2.22-3.84c-.13-.24-.43-.32-.67-.24l-2.76 1.11c-.58-.44-1.19-.81-1.87-1.09L14.5 2.42c-.04-.27-.27-.42-.5-.42H10c-.23 0-.46.15-.5.42L9.1 5.02C8.42 5.3 7.81 5.67 7.23 6.11L4.47 5C4.23 4.92 3.93 5 3.8 5.24L1.58 9.08c-.14.24-.09.54.12.7l2.34 1.83c-.04.35-.07.73-.07 1.09 0 .36.03.73.07 1.08l-2.34 1.83c-.21.16-.26.46-.12.7l2.22 3.84c.13.24.43.32.67.24l2.76-1.11c.58.44 1.19.81 1.87 1.09l.37 2.6c.04.27.27.42.5.42h4.44c.23 0 .46-.15.5-.42l.37-2.6c.68-.28 1.29-.65 1.87-1.09l2.76 1.11c.24.08.54 0 .67-.24l2.22-3.84c.14-.24.09-.54-.12-.7l-2.34-1.83z"/>
      </svg>
    ),
  },
  {
    label: 'Git', color: '#f05032',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M23.546 10.93L13.067.452a1.55 1.55 0 00-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 012.327 2.341l2.658 2.66a1.838 1.838 0 011.979 2.97 1.842 1.842 0 01-2.664 0 1.843 1.843 0 01-.392-2.01L12.86 8.955v6.525c.176.086.342.203.48.346a1.842 1.842 0 010 2.664 1.842 1.842 0 01-2.664 0 1.843 1.843 0 010-2.664c.16-.165.346-.283.537-.368V8.99a1.832 1.832 0 01-.537-.368 1.847 1.847 0 01-.384-2.004L7.553 3.96.45 11.063a1.55 1.55 0 000 2.187l10.48 10.478a1.55 1.55 0 002.187 0l10.428-10.428a1.55 1.55 0 000-2.188"/>
      </svg>
    ),
  },
];

function HeroThreeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    // Use window dimensions as the reliable size source — the canvas is
    // position:absolute filling 100 % of the hero (100vh), so this is always correct.
    const W = canvas.offsetWidth  || window.innerWidth;
    const H = canvas.offsetHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.z = 6;

    // ── Star field ──────────────────────────────────────────
    const pCount = 1200;
    const pPos   = new Float32Array(pCount * 3);
    const pCol   = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 30;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 3;
      pCol[i * 3]     = 0;
      pCol[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      pCol[i * 3 + 2] = 1;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.04, vertexColors: true,
      transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const stars = new THREE.Points(pGeo, pMat);
    scene.add(stars);

    // ── Wireframe polyhedrons ───────────────────────────────
    const shapes = [];
    const geoms  = [
      new THREE.TetrahedronGeometry(0.22, 0),
      new THREE.OctahedronGeometry(0.18, 0),
      new THREE.IcosahedronGeometry(0.16, 0),
    ];
    const wfMat = new THREE.MeshBasicMaterial({
      color: 0x00aaff, wireframe: true, transparent: true, opacity: 0.55,
    });

    for (let i = 0; i < 8; i++) {
      const geo  = geoms[i % geoms.length];
      const mesh = new THREE.Mesh(geo, wfMat.clone());
      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 4
      );
      mesh.userData = {
        rotSpeed:   (Math.random() - 0.5) * 0.015,
        floatOff:   Math.random() * Math.PI * 2,
        floatSpeed: 0.3 + Math.random() * 0.3,
        originY:    mesh.position.y,
      };
      scene.add(mesh);
      shapes.push(mesh);
    }

    // ── Mouse parallax ──────────────────────────────────────
    let mx = 0, my = 0;
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    // ── Animation loop ──────────────────────────────────────
    let raf;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      stars.rotation.y = t * 0.015;
      shapes.forEach(s => {
        const { rotSpeed, floatOff, floatSpeed, originY } = s.userData;
        s.rotation.x += rotSpeed;
        s.rotation.y += rotSpeed * 1.3;
        s.position.y  = originY + Math.sin(t * floatSpeed + floatOff) * 0.4;
      });
      camera.position.x += (mx * 0.4 - camera.position.x) * 0.05;
      camera.position.y += (-my * 0.2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    animate();

    // ── Resize handler ──────────────────────────────────────
    const onResize = () => {
      const W2 = window.innerWidth;
      const H2 = window.innerHeight;
      renderer.setSize(W2, H2);
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__three-canvas" />;
}


export default function Hero() {
  const [roleIdx,    setRoleIdx]    = useState(0);
  const [displayed,  setDisplayed]  = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [ghStats,    setGhStats]    = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const timerRef = useRef(null);

  // Animated counters
  const projectsCount    = useCounter(3, 1600, statsVisible);
  const skillsCount      = useCounter(5, 1600, statsVisible);
  const experienceCount  = useCounter(1, 1200, statsVisible);

  // Trigger stats counter when hero is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch live GitHub stats
  useEffect(() => {
    fetch('/api/github/stats')
      .then(r => r.json())
      .then(data => { if (data.profile) setGhStats(data); })
      .catch(() => {});
  }, []);

  // Typewriter
  useEffect(() => {
    const current = ROLES[roleIdx];
    const speed   = isDeleting ? 35 : 75;
    timerRef.current = setTimeout(() => {
      if (!isDeleting) {
        setDisplayed(current.slice(0, displayed.length + 1));
        if (displayed.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayed(current.slice(0, displayed.length - 1));
        if (displayed.length - 1 === 0) {
          setIsDeleting(false);
          setRoleIdx(i => (i + 1) % ROLES.length);
        }
      }
    }, speed);
    return () => clearTimeout(timerRef.current);
  }, [displayed, isDeleting, roleIdx]);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor(p => !p), 530);
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="section hero" id="hero">
      <HeroThreeCanvas />

      {/* Floating tool badges — decorative background layer, z-index 2,
          positioned in left half of screen so they never touch the photo
          (right side, ~60 %+ from left) or the fixed contact button */}
      <div className="hero__tool-badges" aria-hidden="true">
        {TOOL_BADGES.map((tool, i) => (
          <div
            key={tool.label}
            className={`tool-badge tool-badge--${i}`}
            style={{ '--tool-color': tool.color }}
          >
            <span className="tool-badge__icon" style={{ color: tool.color }}>
              {tool.icon}
            </span>
            <span className="tool-badge__label">{tool.label}</span>
          </div>
        ))}
      </div>

      <div className="hero__content container">
        {/* Left text block */}
        <div className="hero__text">
          {/* Open to Work Badge */}
          <div className="hero__open-badge" id="open-to-work-badge">
            <span className="open-badge__dot" />
            <span className="open-badge__text">Open to Work</span>
          </div>

          <p className="hero__greeting">Hello, I'm</p>

          <h1 className="hero__name">
            <span className="name--white">Farhan </span>
            <span className="name--blue">Haroon</span>
          </h1>

          <p className="hero__subtitle">Software and DevOps Engineer</p>

          <p className="hero__value-prop">
            Building robust infrastructure and automating workflows to deliver reliable software solutions.
          </p>

          <div className="hero__typewriter" aria-live="polite">
            <span className="typewriter__bracket">&gt; </span>
            <span className="typewriter__text">{displayed}</span>
            <span className={`typewriter__cursor${showCursor ? '' : ' typewriter__cursor--off'}`}>|</span>
          </div>

          {/* Live GitHub Stats Badges */}
          {ghStats && (
            <div className="hero__gh-stats" id="hero-github-stats">
              <a
                href={`https://github.com/${ghStats.profile.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-stat-badge"
              >
                <span className="gh-stat-icon">📁</span>
                <span className="gh-stat-value">{ghStats.profile.public_repos}</span>
                <span className="gh-stat-label">Repos</span>
              </a>
              <a
                href={`https://github.com/${ghStats.profile.login}?tab=followers`}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-stat-badge"
              >
                <span className="gh-stat-icon">👥</span>
                <span className="gh-stat-value">{ghStats.profile.followers}</span>
                <span className="gh-stat-label">Followers</span>
              </a>
              {ghStats.totalStars != null && (
                <span className="gh-stat-badge">
                  <span className="gh-stat-icon">⭐</span>
                  <span className="gh-stat-value">{ghStats.totalStars}</span>
                  <span className="gh-stat-label">Stars</span>
                </span>
              )}
            </div>
          )}

          <div className="hero__cta">
            <button
              className="btn hero__btn--primary"
              id="hero-view-projects-btn"
              onClick={() => scrollTo('#projects')}
            >
              View Projects
            </button>
            <button
              className="btn hero__btn--outline"
              id="hero-about-btn"
              onClick={() => scrollTo('#about')}
            >
              More About Me
            </button>
          </div>

          {/* Animated Stats Counter */}
          <div className="hero__stats" ref={statsRef} id="hero-stats">
            <div className="hero__stat">
              <span className="stat__number">{projectsCount}<span className="stat__plus">+</span></span>
              <span className="stat__label">Projects</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="stat__number">{skillsCount}<span className="stat__plus">+</span></span>
              <span className="stat__label">Skills</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="stat__number">{experienceCount}<span className="stat__plus">yr</span></span>
              <span className="stat__label">Experience</span>
            </div>
          </div>
        </div>

        {/* Right — Photo */}
        <div className="hero__photo-side">
          <div className="hero__photo-frame" id="hero-profile-photo">
            <img src={profileImg} alt="Farhan Haroon" />
            <div className="photo__scan-line" />
          </div>
          <div className="hero__photo-glow" />
        </div>
      </div>

      <div className="hero__scroll-hint">
        <div className="scroll__mouse"><div className="scroll__wheel" /></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
