import React, { useRef, useState, useEffect } from 'react';
import '../styles/projects.css';

const PROJECTS = [
  {
    id: 'jarvis-ai',
    title: 'JARVIS',
    subtitle: 'Personal AI Agent',
    shortDesc: 'A voice & text powered AI agent featuring genetic algorithms, CSP scheduling, Gemini AI, and full OS-level automation.',
    tags: ['Python', 'FastAPI', 'React', 'Gemini API', 'AI'],
    icon: '🤖',
    color: '#00aaff',
    github: null,
    detail: {
      tagline: 'Like many people, I grew up watching Iron Man and imagining what it would be like to have a JARVIS of my own. Instead of just imagining it, I decided to build one.',
      overview: 'As a Computer Science student, I wanted to build something that goes beyond simple CRUD apps and tutorials — something that reflects how systems actually think, adapt, and work together.',
      architecture: [
        { icon: '🎙️', title: 'Voice & Text Commands',        desc: 'Complete accessibility through both spoken and typed interaction.' },
        { icon: '🧬', title: 'Genetic Algorithm',             desc: 'Advanced algorithmic approach for dynamic task prioritization.' },
        { icon: '🧮', title: 'Constraint Satisfaction (CSP)', desc: 'Intelligent mathematical engine for generating optimized weekly timetables.' },
        { icon: '💬', title: 'Gemini API Integration',        desc: 'Deep conversational AI allowing contextual chat on any topic.' },
        { icon: '⚙️', title: 'OS-Level Automation',          desc: 'Full control over system searches, apps, screenshots, volume, and website navigation.' },
      ],
      capabilities: [
        'Seamlessly switch between strict automation logic and fluid conversational AI.',
        'Add, delete, and optimize tasks to generate a complete weekly schedule using AI reasoning.',
        'Open various apps and websites directly from voice or text commands.',
      ],
      quote: 'This project represents my growth from basic scripting to structured problem-solving with complex AI algorithms.',
    },
  },
  {
    id: 'bash-automation',
    title: 'Bash Automation Scripts',
    subtitle: 'Linux Systems Engineering',
    shortDesc: 'A collection of production-grade Bash scripts for server provisioning, log rotation, automated backups, and system health monitoring.',
    tags: ['Bash', 'Linux', 'Cron', 'Automation', 'Shell'],
    icon: '💻',
    color: '#f59e0b',
    github: null,
    detail: {
      tagline: "Real DevOps isn't just about fancy cloud tools — it's about mastering the fundamentals. These scripts are battle-tested automation for everyday Linux engineering.",
      overview: 'Built to solve real infrastructure problems: repetitive manual tasks, missed backups, silent failures, and unmonitored system health. Each script is modular, commented, and production-safe.',
      architecture: [
        { icon: '🖥️', title: 'Server Provisioning',     desc: 'Automated setup scripts for configuring fresh Linux servers with required packages and user environments.' },
        { icon: '🔄', title: 'Log Rotation',             desc: 'Custom log management routines that compress, archive, and clean logs on a cron schedule.' },
        { icon: '💾', title: 'Automated Backups',        desc: 'Scheduled rsync and tar-based backup scripts with retention policies and error alerts.' },
        { icon: '❤️', title: 'Health Monitoring',       desc: 'System resource checks (CPU, RAM, disk) that alert when thresholds are breached.' },
        { icon: '⏰', title: 'Cron-Based Scheduling',   desc: 'All scripts run headlessly via crontab with structured logging and exit code handling.' },
      ],
      capabilities: [
        'Provision a production-ready Linux server from zero in minutes with a single script.',
        'Never lose data — automated backups run silently on a configurable schedule.',
        'Get alerted immediately when disk, CPU, or memory hit critical thresholds.',
      ],
      quote: 'Automate the boring stuff — so you can focus on the interesting problems.',
    },
  },
  {
    id: 'devops-portfolio',
    title: 'DevOps Portfolio',
    subtitle: 'This Very Website',
    shortDesc: 'A cinematic, Three.js powered portfolio built with React, featuring custom cursor physics, Lenis smooth scroll, and an Express + Gmail backend.',
    tags: ['React', 'Three.js', 'Express', 'Nodemailer', 'Vite'],
    icon: '🚀',
    color: '#7c3aed',
    github: null,
    detail: {
      tagline: "A portfolio that doesn't just show my work — it is my work. Every pixel, animation, and system reflects how I approach engineering.",
      overview: 'Built to stand out from generic templates. The goal was a cinematic, interactive experience that demonstrates frontend depth, backend integration, and DevOps thinking all in one.',
      architecture: [
        { icon: '🌌', title: 'Three.js Background',      desc: 'Real-time WebGL particle system with floating DevOps tool icons in 3D space.' },
        { icon: '🖱️', title: 'Custom Cursor Physics',   desc: 'Multi-layered trailing cursor with spring physics — black, blue, and white layers.' },
        { icon: '📜', title: 'Lenis Smooth Scroll',      desc: 'Butter-smooth scrolling with custom easing curves for a premium cinematic feel.' },
        { icon: '📡', title: 'Express + Gmail Backend', desc: 'Real email delivery with rate limiting, Helmet security, and auto-reply system.' },
        { icon: '✨', title: 'Scroll Reveal Animations', desc: 'IntersectionObserver-based animations that trigger as sections enter the viewport.' },
      ],
      capabilities: [
        "Fully functional contact form that delivers emails directly to the owner's inbox.",
        'Responsive design that adapts gracefully across all screen sizes.',
        'Optimized Three.js scene with adaptive quality based on device performance.',
      ],
      quote: 'The best way to show you can build great software is to build great software.',
    },
  },
];

/* ── Project Page (full screen, feels like new page) ──── */
function ProjectModal({ project, onClose }) {

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const onPop = () => onClose();
    window.addEventListener('popstate', onPop);

    // Hide the main Navbar behind the project page
    document.body.classList.add('project-open');

    // Block Lenis from scrolling the background while project page is open
    const el = document.querySelector('.project-page');
    const blockLenis = (e) => e.stopPropagation();
    if (el) el.addEventListener('wheel', blockLenis, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPop);
      document.body.classList.remove('project-open');
      if (el) el.removeEventListener('wheel', blockLenis);
    };
  }, [onClose]);

  return (
    <div
      className="project-page"
      id={`modal-${project.id}`}
      role="main"
      data-lenis-prevent          // tells Lenis to ignore scroll inside here
    >
      {/* Top nav bar — feels like a real page header */}
      <div className="project-page__nav">
        <button
          className="project-page__back"
          onClick={onClose}
          id="modal-back-btn"
          aria-label="Back to projects"
        >
          <span className="back-arrow">←</span>
          <span>Back to Projects</span>
        </button>
        <span className="project-page__nav-title">
          {project.icon} {project.title}
        </span>
      </div>

      {/* Page content */}
      <div className="project-page__body">
        <div className="modal-panel" style={{ '--mc': project.color }}>
          <div className="modal-accent-bar" />

          <div className="modal-header">
            <div className="modal-icon-wrap">
              <span className="modal-icon">{project.icon}</span>
              <div className="modal-icon-ring" />
            </div>
            <div className="modal-header-text">
              <p className="modal-subtitle">{project.subtitle}</p>
              <h2 className="modal-title">{project.title}</h2>
            </div>
          </div>

          {project.views != null && (
            <div className="modal-views-badge">
              👁️ {project.views} view{project.views !== 1 ? 's' : ''}
            </div>
          )}

          <div className="modal-tags">
            {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>

          <div className="modal-tagline-wrap">
            <span className="modal-quote-mark">"</span>
            <p className="modal-tagline">{project.detail.tagline}</p>
          </div>

          <p className="modal-overview">{project.detail.overview}</p>

          <div className="modal-section-header">
            <span className="modal-section-line" />
            <h3 className="modal-section-title">Core Architecture</h3>
            <span className="modal-section-line" />
          </div>
          <div className="modal-arch-grid">
            {project.detail.architecture.map((item) => (
              <div className="modal-arch-item" key={item.title}>
                <span className="arch-icon">{item.icon}</span>
                <div>
                  <strong className="arch-title">{item.title}</strong>
                  <p className="arch-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-section-header">
            <span className="modal-section-line" />
            <h3 className="modal-section-title">What It Can Do</h3>
            <span className="modal-section-line" />
          </div>
          <ul className="modal-caps">
            {project.detail.capabilities.map((c, i) => (
              <li key={i} className="modal-cap-item">
                <span className="cap-dot" />
                <span>{c}</span>
              </li>
            ))}
          </ul>

          <blockquote className="modal-quote-block">
            {project.detail.quote}
          </blockquote>

          <div className="modal-footer">
            {project.github ? (
              <a href={project.github} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary modal-gh-btn" id={`modal-gh-${project.id}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.57v-2c-3.33.72-4.03-1.6-4.03-1.6-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            ) : (
              <span className="modal-gh-soon">🔒 GitHub link coming soon</span>
            )}
            <button className="btn btn-secondary modal-back-btn" onClick={onClose}>
              ← Back to Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ── Project Card ──────────────────────────────────────────── */
function ProjectCard({ project, onOpen }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) / rect.width;
    const y = (e.clientY - rect.top  - rect.height / 2) / rect.height;
    card.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-6px) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  };

  return (
    <div
      className="project-card glass-card reveal"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(project); }}
      id={`project-${project.id}`}
      style={{ '--pc': project.color }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.title} details`}
    >
      <div className="project-card__header">
        <span className="project-card__icon">{project.icon}</span>
        <div className="project-card__glow-ring" />
      </div>
      <p className="project-card__subtitle">{project.subtitle}</p>
      <h3 className="project-card__title">{project.title}</h3>
      <p className="project-card__desc">{project.shortDesc}</p>
      <div className="project-card__tags">
        {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
      {/* Live view count */}
      {project.views != null && (
        <div className="project-card__views">👁️ {project.views} views</div>
      )}
      <div className="project-card__cta">
        <span>Explore Project</span>
        <span className="cta-arrow">→</span>
      </div>
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────── */
export default function Projects() {
  const [active,     setActive]     = useState(null);
  const [viewCounts, setViewCounts] = useState({});

  // Fetch view counts on mount
  useEffect(() => {
    fetch('/api/projects/views')
      .then(r => r.json())
      .then(data => { if (data.views) setViewCounts(data.views); })
      .catch(() => {});
  }, []);

  // Merge view counts into project list
  const projectsWithViews = PROJECTS.map(p => ({
    ...p,
    views: viewCounts[p.id] ?? null,
  }));

  const handleOpen = (project) => {
    setActive(project);
    // Update URL — feels like real page navigation
    window.history.pushState({ project: project.id }, '', `#project/${project.id}`);
    // Scroll to very top instantly
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Increment view counter
    fetch(`/api/projects/${project.id}/view`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.views != null)
          setViewCounts(prev => ({ ...prev, [project.id]: data.views }));
      })
      .catch(() => {});
  };

  const handleClose = () => {
    setActive(null);
    // Restore URL
    window.history.pushState({}, '', window.location.pathname);
    // Scroll back to projects section
    setTimeout(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <section className="section projects" id="projects">
      <div className="container">
        <h2 className="section-title reveal">Projects</h2>
        <p className="section-subtitle reveal">Things I've built — click to explore</p>
        <div className="section-divider" />

        <div className="projects__grid">
          {projectsWithViews.map(p => (
            <ProjectCard key={p.id} project={p} onOpen={handleOpen} />
          ))}
        </div>
      </div>

      {active && (
        <ProjectModal
          project={{ ...active, views: viewCounts[active.id] ?? active.views }}
          onClose={handleClose}
        />
      )}
    </section>
  );
}
