import React, { useEffect, useRef, useState } from 'react';
import AnimatedHeading from './AnimatedHeading';
import { useStaggerReveal } from '../hooks/useGsap';
import '../styles/about.css';

// About signature: slide from the left, long stagger = lines being
// "printed" to a terminal, one after another. Slow and deliberate.
const ABOUT_PRINT = {
  selector: '.about__bio > p, .education-card, .about__badges',
  from: { opacity: 0, x: -24 },
  duration: 0.6,
  ease: 'power2.out',
  stagger: 0.25,
};

const CLI_LINES = [
  { prompt: '$ ', text: 'whoami', delay: 400 },
  { prompt: '> ', text: 'farhan-haroon', delay: 900, isOutput: true },
  { prompt: '$ ', text: 'cat focus.txt', delay: 1400 },
  { prompt: '> ', text: 'DevOps & Cloud Engineering', delay: 1900, isOutput: true },
  { prompt: '$ ', text: 'cat university.txt', delay: 2500 },
  { prompt: '> ', text: 'BS SE @ COMSATS Islamabad — 5th sem', delay: 3000, isOutput: true },
  { prompt: '$ ', text: 'ls devops-stack/', delay: 3600 },
  { prompt: '> ', text: 'Docker  Jenkins  AWS  Kubernetes  Terraform', delay: 4100, isOutput: true },
  { prompt: '$ ', text: 'echo $NEXT_GOAL', delay: 4800 },
  { prompt: '> ', text: 'AWS + K8s depth → cloud internship 🚀', delay: 5300, isOutput: true },
  { prompt: '$ ', text: '_', delay: 5900, isCursor: true },
];

const SKILL_BADGES = [
  'Docker', 'Jenkins', 'CI/CD', 'Linux', 'AWS'
];

export default function About() {
  const [visibleLines, setVisibleLines] = useState([]);
  const terminalRef = useRef(null);
  const sectionRef  = useRef(null);
  const leftRef     = useRef(null);
  const [started, setStarted] = useState(false);

  // Left column prints its lines in sequence as it scrolls into view.
  useStaggerReveal(leftRef, ABOUT_PRINT);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const timers = CLI_LINES.map((line) =>
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [started]);

  return (
    <section className="section about" id="about" ref={sectionRef}>
      <div className="container">
        <AnimatedHeading className="section-title">About Me</AnimatedHeading>
        <div className="section-divider" />

        <div className="about__grid">
          {/* Left — bio + education (prints line-by-line) */}
          <div className="about__left" ref={leftRef}>
            <div className="about__bio">
              <p>
                I'm Farhan Haroon, a Software Engineering student at{' '}
                <span className="text-highlight">COMSATS University Islamabad</span> with a passion
                for <span className="text-highlight">DevOps</span>, cloud infrastructure, and
                building reliable software systems.
              </p>
              <p>
                I enjoy understanding how applications work beyond just writing code — from
                development and deployment to automation, scalability, and maintaining reliable
                production environments. I'm driven by the challenge of solving complex problems
                and finding efficient, practical solutions that make systems more dependable and
                easier to manage.
              </p>
              <p>
                I believe great software isn't just about creating features; it's about building
                systems that are{' '}
                <span className="text-highlight">stable, secure, scalable, and maintainable</span>.
                That mindset is what continues to shape my journey as an engineer.
              </p>
              <p>
                With every project, I strive to improve my technical skills, deepen my
                understanding of modern software engineering practices, and create solutions that
                have a meaningful real-world impact. My long-term goal is to build a career where I
                can contribute to high-performing engineering teams and continuously grow as a{' '}
                <span className="text-highlight">DevOps professional</span>.
              </p>
            </div>

            {/* Education card */}
            <div className="education-card glass-card">
              <div className="edu-card__icon">🎓</div>
              <div className="edu-card__info">
                <h4 className="edu-card__degree">BS Software Engineering</h4>
                <p className="edu-card__school">COMSATS University Islamabad</p>
                <p className="edu-card__cgpa">CGPA: <strong>3.46</strong> / 4.00</p>
                <span className="edu-card__status">In Progress · 5th Semester</span>
              </div>
            </div>

            {/* Skill badges */}
            <div className="about__badges">
              <p className="badges__label">Core Stack:</p>
              <div className="badges__grid">
                {SKILL_BADGES.map(b => (
                  <span key={b} className="tag">{b}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — terminal */}
          <div className="about__right reveal">
            <div className="terminal glass-card">
              <div className="terminal__header">
                <div className="terminal__dots">
                  <span className="dot dot--red" />
                  <span className="dot dot--yellow" />
                  <span className="dot dot--green" />
                </div>
                <span className="terminal__title">farhan@devops:~</span>
              </div>
              <div className="terminal__body" ref={terminalRef}>
                {visibleLines.map((line, i) => (
                  <div
                    key={i}
                    className={`terminal__line${line.isOutput ? ' terminal__line--output' : ''}${line.isCursor ? ' terminal__line--cursor' : ''}`}
                  >
                    <span className="terminal__prompt">{line.prompt}</span>
                    <span className="terminal__text">{line.text}</span>
                    {line.isCursor && (
                      <span className="terminal__blink-cursor">█</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
