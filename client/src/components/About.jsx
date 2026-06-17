import React, { useEffect, useRef, useState } from 'react';
import '../styles/about.css';

const CLI_LINES = [
  { prompt: '$ ', text: 'whoami', delay: 400 },
  { prompt: '> ', text: 'farhan-haroon', delay: 900, isOutput: true },
  { prompt: '$ ', text: 'cat role.txt', delay: 1400 },
  { prompt: '> ', text: 'Software & DevOps Engineer', delay: 1900, isOutput: true },
  { prompt: '$ ', text: 'cat university.txt', delay: 2500 },
  { prompt: '> ', text: 'COMSATS University Islamabad', delay: 3000, isOutput: true },
  { prompt: '$ ', text: 'ls skills/', delay: 3600 },
  { prompt: '> ', text: 'Linux  Bash  Networking  Git  Docker', delay: 4100, isOutput: true },
  { prompt: '$ ', text: 'echo $STATUS', delay: 4800 },
  { prompt: '> ', text: 'Open to opportunities 🚀', delay: 5300, isOutput: true },
  { prompt: '$ ', text: '_', delay: 5900, isCursor: true },
];

const SKILL_BADGES = [
  'Linux', 'Bash Scripting', 'Networking', 'Git/GitHub', 'Docker'
];

export default function About() {
  const [visibleLines, setVisibleLines] = useState([]);
  const terminalRef = useRef(null);
  const sectionRef  = useRef(null);
  const [started, setStarted] = useState(false);

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
        <h2 className="section-title reveal">About Me</h2>
        <div className="section-divider" />

        <div className="about__grid">
          {/* Left — bio + education */}
          <div className="about__left reveal">
            <p className="about__bio">
              I am a Software and DevOps Engineer currently studying at{' '}
              <span className="text-highlight">COMSATS University Islamabad</span> with a strong
              interest in Linux systems and automation. I enjoy working with command-line tools,
              building efficient solutions using scripting and programming, and exploring modern
              development and deployment practices.
            </p>

            {/* Education card */}
            <div className="education-card glass-card">
              <div className="edu-card__icon">🎓</div>
              <div className="edu-card__info">
                <h4 className="edu-card__degree">BS Software Engineering</h4>
                <p className="edu-card__school">COMSATS University Islamabad</p>
                <span className="edu-card__status">In Progress</span>
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
