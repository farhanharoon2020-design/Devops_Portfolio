import React, { useEffect, useRef, useState } from 'react';
import '../styles/skills.css';

// Fallback in case API is down
const FALLBACK_SKILLS = [
  { name: 'Linux',      icon: '🐧', level: 90, color: '#fcc624' },
  { name: 'Bash',       icon: '💻', level: 88, color: '#4eaa25' },
  { name: 'Docker',     icon: '🐳', level: 88, color: '#2496ed' },
  { name: 'Git/GitHub', icon: '🐙', level: 85, color: '#f05033' },
  { name: 'AWS',        icon: '☁️', level: 80, color: '#ff9900' },
];

function SkillBadge({ skill }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x =  (e.clientX - rect.left - rect.width  / 2) / rect.width  * 18;
    const y = -(e.clientY - rect.top  - rect.height / 2) / rect.height * 18;
    card.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
  };

  return (
    <div
      className="skill-badge glass-card reveal"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id={`skill-${skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      style={{ '--skill-color': skill.color }}
    >
      <div className="skill-badge__icon">{skill.icon || '🔧'}</div>
      <h4 className="skill-badge__name">{skill.name}</h4>
    </div>
  );
}

function CategorySection({ category }) {
  return (
    <div className="skills__grid-wrap reveal">
      <div className="skills__grid">
        {category.skills.map(skill => (
          <SkillBadge key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  );
}


export default function Skills() {
  const sectionRef = useRef(null);
  const [animate,    setAnimate]    = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  // Fetch skills from backend
  useEffect(() => {
    fetch('/api/skills')
      .then(r => r.json())
      .then(data => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          // backend returned empty — use fallback as flat list
          setCategories([{ name: 'Core Skills', icon: '🛠️', skills: FALLBACK_SKILLS }]);
        }
      })
      .catch(() => {
        setCategories([{ name: 'Core Skills', icon: '🛠️', skills: FALLBACK_SKILLS }]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Trigger bar animation on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section skills" id="skills" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title reveal">Skills &amp; Tools</h2>
        <p className="section-subtitle reveal">Technologies I work with daily</p>
        <div className="section-divider" />

        {loading ? (
          <div className="skills__loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skill-card glass-card skills__skeleton" />
            ))}
          </div>
        ) : (
          categories.map(cat => (
            <CategorySection key={cat.name} category={cat} animate={animate} />
          ))
        )}
      </div>
    </section>
  );
}
