import React, { useRef, useMemo } from 'react';
import AnimatedHeading from './AnimatedHeading';
import { useStaggerReveal } from '../hooks/useGsap';
import '../styles/skills.css';

// Skills signature: big travel + back-overshoot, fast stagger = punchy.
const SKILLS_STAGGER = {
  from: { opacity: 0, y: 70, scale: 0.7 },
  duration: 0.5,
  ease: 'back.out(1.7)',
  stagger: 0.05,
};

/* ═══════════════════════════════════════════════════════════════
   BRAND LOGO SVGs — real recognizable icons
   ═══════════════════════════════════════════════════════════════ */

const LOGOS = {
  /* CI/CD — blue infinity loop with CI | CD text */
  cicd: (
    <svg viewBox="0 0 64 32" fill="none">
      <path d="M32 16c-5-7.5-11-12-17-12C8 4 2 9.4 2 16s6 12 13 12c6 0 12-4.5 17-12z"
            stroke="#00aaff" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 16c5 7.5 11 12 17 12 7 0 13-5.4 13-12S56 4 49 4c-6 0-12 4.5-17 12z"
            stroke="#e0f0ff" strokeWidth="3" strokeLinecap="round"/>
      <text x="15" y="18.5" textAnchor="middle" fontFamily="Arial,sans-serif"
            fontWeight="700" fontSize="7" fill="#ffffff">CI</text>
      <text x="49" y="18.5" textAnchor="middle" fontFamily="Arial,sans-serif"
            fontWeight="700" fontSize="7" fill="#00ccff">CD</text>
    </svg>
  ),

  /* Jenkins — the butler with headphones */
  jenkins: (
    <svg viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" fill="#d33833"/>
      <ellipse cx="24" cy="22" rx="10" ry="12" fill="#f0c8a0"/>
      <path d="M13 19 Q13 8 24 8 Q35 8 35 19" stroke="#4a5568" strokeWidth="2.8"
            fill="none" strokeLinecap="round"/>
      <rect x="10" y="16" width="5" height="7" rx="2.5" fill="#4a5568"/>
      <rect x="33" y="16" width="5" height="7" rx="2.5" fill="#4a5568"/>
      <path d="M18 21 Q20.5 19 23 21" stroke="#5d4037" strokeWidth="1.2"
            fill="none" strokeLinecap="round"/>
      <path d="M25 21 Q27.5 19 30 21" stroke="#5d4037" strokeWidth="1.2"
            fill="none" strokeLinecap="round"/>
      <ellipse cx="24" cy="24.5" rx="1.2" ry="1" fill="#d4a574"/>
      <path d="M20 27 Q24 30 28 27" stroke="#5d4037" strokeWidth="1"
            fill="none" strokeLinecap="round"/>
      <path d="M16 34 L24 40 L32 34" fill="#3d5a80"/>
      <path d="M21 34 L24 36 L27 34 L24 32Z" fill="#c0392b"/>
    </svg>
  ),

  /* AWS — clean "aws" wordmark + Amazon smile arrow */
  aws: (
    <svg viewBox="0 0 40 28" fill="none">
      <text x="20" y="11" textAnchor="middle" dominantBaseline="middle"
            fontFamily="Arial,Helvetica,sans-serif" fontWeight="900"
            fontSize="15" letterSpacing="0.5" fill="#ff9900">aws</text>
      <path d="M9 20 Q20 27 33 20" stroke="#ff9900" strokeWidth="2.2"
            fill="none" strokeLinecap="round"/>
      <path d="M31 19 L34 20.5 L31 22" stroke="#ff9900" strokeWidth="1.5"
            fill="#ff9900" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  ),

  /* GitHub — the octocat mark */
  github: (
    <svg viewBox="0 0 24 24" fill="#f0f6fc">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  ),
};


/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const SKILLS = [
  { name: 'Networking',       icon: '🌐', color: '#00aaff' },
  { name: 'Linux',            icon: '🐧', color: '#fcc624' },
  { name: 'Automation',       icon: '⚙️',  color: '#7c3aed' },
  { name: 'Scripting',        icon: '📜', color: '#4eaa25' },
  { name: 'Coding',           icon: '👨‍💻', color: '#00ffff' },
  { name: 'Containerization', icon: '📦', color: '#2496ed' },
  { name: 'CI/CD',            logo: 'cicd', color: '#00aaff' },
  { name: 'Deployment',       icon: '🚀', color: '#ef4444' },
  { name: 'Cloud',            icon: '☁️',  color: '#ff9900' },
];

const TOOLS = [
  { name: 'Linux',   icon: '🐧', color: '#fcc624' },
  { name: 'Docker',  icon: '🐳', color: '#2496ed' },
  { name: 'Jenkins', logo: 'jenkins', color: '#d33833' },
  { name: 'AWS',     logo: 'aws',     color: '#ff9900' },
  { name: 'Bash',    icon: '💻', color: '#4eaa25' },
  { name: 'GitHub',  logo: 'github',  color: '#f0f6fc' },
];

const LANGUAGES = [
  { name: 'Python',  color: '#3776ab', accent: '#ffd43b', ext: '.py' },
  { name: 'Bash',    color: '#4eaa25', accent: '#89d185', ext: '.sh' },
  { name: 'Java',    color: '#f89820', accent: '#5382a1', ext: '.java' },
  { name: 'C++',     color: '#00599c', accent: '#659ad2', ext: '.cpp' },
  { name: 'Groovy',  color: '#4298b8', accent: '#e57300', ext: '.groovy' },
];


/* ═══════════════════════════════════════════════════════════════
   3D TILT HOOK — reusable across all card types
   ═══════════════════════════════════════════════════════════════ */

function useTilt(intensity = 15) {
  const ref = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handlers = useMemo(() => ({
    onMouseMove: (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x =  (e.clientX - rect.left - rect.width  / 2) / rect.width  * intensity;
      const y = -(e.clientY - rect.top  - rect.height / 2) / rect.height * intensity;
      el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateY(-6px)`;
    },
    onMouseLeave: () => {
      if (ref.current)
        ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
    },
  }), [intensity]);
  return { ref, ...handlers };
}


/* ═══════════════════════════════════════════════════════════════
   ICON RENDERER — handles both emoji and SVG logos
   ═══════════════════════════════════════════════════════════════ */

function renderIcon(item) {
  if (item.logo && LOGOS[item.logo]) return LOGOS[item.logo];
  return item.icon || '🔧';
}


/* ═══════════════════════════════════════════════════════════════
   1. SKILL CARD — compact glass card with icon + name
   ═══════════════════════════════════════════════════════════════ */

function SkillCard({ skill }) {
  const { ref, ...tilt } = useTilt(18);

  return (
    <div
      className="skill-card glass-card"
      ref={ref}
      {...tilt}
      style={{ '--accent': skill.color }}
      id={`skill-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      <div className={`skill-card__icon${skill.logo ? ' skill-card__icon--svg' : ''}`}>
        {renderIcon(skill)}
      </div>
      <h4 className="skill-card__name">{skill.name}</h4>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   2. TOOL CARD — wider card with brand-color accent bar
   ═══════════════════════════════════════════════════════════════ */

function ToolCard({ tool }) {
  const { ref, ...tilt } = useTilt(12);

  return (
    <div
      className="tool-card glass-card"
      ref={ref}
      {...tilt}
      style={{ '--accent': tool.color }}
      id={`tool-${tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      <div className="tool-card__accent" />
      <div className={`tool-card__icon${tool.logo ? ' tool-card__icon--svg' : ''}`}>
        {renderIcon(tool)}
      </div>
      <h4 className="tool-card__name">{tool.name}</h4>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   3. LANGUAGE CARD — code-editor themed with IDE topbar
   ═══════════════════════════════════════════════════════════════ */

function LanguageCard({ lang }) {
  const { ref, ...tilt } = useTilt(12);

  return (
    <div
      className="lang-card glass-card"
      ref={ref}
      {...tilt}
      style={{ '--accent': lang.color, '--accent2': lang.accent }}
      id={`lang-${lang.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      <div className="lang-card__topbar">
        <div className="lang-card__dots">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
        </div>
        <span className="lang-card__filename">{lang.name.toLowerCase()}{lang.ext}</span>
      </div>
      <div className="lang-card__body">
        <span className="lang-card__bracket">{'{'}</span>
        <h4 className="lang-card__name">{lang.name}</h4>
        <span className="lang-card__bracket">{'}'}</span>
      </div>
      <div className="lang-card__accent-bar" />
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   CATEGORY HEADER — neon lines + diamond icon
   ═══════════════════════════════════════════════════════════════ */

function CategoryHeader({ title }) {
  return (
    <div className="skills-category__header reveal">
      <span className="skills-category__line" />
      <h3 className="skills-category__title">
        <span className="skills-category__diamond">◆</span>
        {title}
      </h3>
      <span className="skills-category__line" />
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════ */

export default function Skills() {
  const skillsGridRef = useRef(null);
  const toolsGridRef  = useRef(null);
  const langsGridRef  = useRef(null);

  // Each grid pops in with the punchy back-overshoot signature.
  useStaggerReveal(skillsGridRef, SKILLS_STAGGER);
  useStaggerReveal(toolsGridRef,  SKILLS_STAGGER);
  useStaggerReveal(langsGridRef,  SKILLS_STAGGER);

  return (
    <section className="section skills-section" id="skills">
      <div className="container">
        {/* Heading echoes the cards with the same back-overshoot ease */}
        <AnimatedHeading className="section-title" ease="back.out(1.7)">
          Skills &amp; Expertise
        </AnimatedHeading>
        <p className="section-subtitle reveal">My professional competency stack</p>
        <div className="section-divider" />

        {/* ── Core Skills ─────────────────────────────────────── */}
        <div className="skills-category">
          <CategoryHeader title="Core Skills" />
          <div className="skills-grid" ref={skillsGridRef}>
            {SKILLS.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </div>

        {/* ── Tools & Technologies ─────────────────────────────── */}
        <div className="skills-category">
          <CategoryHeader title="Tools & Technologies" />
          <div className="tools-grid" ref={toolsGridRef}>
            {TOOLS.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </div>

        {/* ── Languages ───────────────────────────────────────── */}
        <div className="skills-category">
          <CategoryHeader title="Languages" />
          <div className="languages-grid" ref={langsGridRef}>
            {LANGUAGES.map((lang) => (
              <LanguageCard key={lang.name} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
