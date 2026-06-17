import React, { useState, useEffect } from 'react';
import '../styles/navbar.css';

const NAV_LINKS = [
  { label: 'Home',     href: '#hero' },
  { label: 'About',    href: '#about' },
  { label: 'Skills',   href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact',  href: '#contact' },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeSection, setActive] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      // Track active section
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(sec.id);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <a
          href="#hero"
          className="navbar__logo"
          onClick={e => handleLinkClick(e, '#hero')}
          id="nav-logo"
        >
          <span className="logo__fh">FH</span>
          <span className="logo__dot" />
        </a>

        {/* Desktop links */}
        <ul className="navbar__links" id="nav-links-desktop">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className={`nav-link${activeSection === href.slice(1) ? ' nav-link--active' : ''}`}
                onClick={e => handleLinkClick(e, href)}
                id={`nav-link-${label.toLowerCase()}`}
              >
                {label}
                <span className="nav-link__underline" />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="#contact"
          className="btn btn-primary navbar__cta"
          onClick={e => handleLinkClick(e, '#contact')}
          id="nav-cta-btn"
        >
          Hire Me
        </a>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(p => !p)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`} id="mobile-menu">
        <ul>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className={`nav-link${activeSection === href.slice(1) ? ' nav-link--active' : ''}`}
                onClick={e => handleLinkClick(e, href)}
                id={`mobile-link-${label.toLowerCase()}`}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className="btn btn-primary" onClick={e => handleLinkClick(e, '#contact')}>
              Hire Me
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
