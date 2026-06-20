import React, { useState } from 'react';
import '../styles/contact.css';

export default function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errors, setErrors] = useState({});



  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setStatus('loading');
    setErrorMsg('');
    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        // Show the actual server error (validation, rate limit, etc.)
        const msg = data?.errors?.[0]?.msg || data?.error || 'Transmission failed. Try again.';
        setErrorMsg(msg);
        setStatus('error');
        setTimeout(() => { setStatus('idle'); setErrorMsg(''); }, 6000);
      }
    } catch {
      setErrorMsg('Cannot reach the server. Make sure the backend is running.');
      setStatus('error');
      setTimeout(() => { setStatus('idle'); setErrorMsg(''); }, 6000);
    }
  };



  return (
    <section className="section contact" id="contact">
      <div className="container">
        <h2 className="section-title reveal">Contact</h2>
        <p className="section-subtitle reveal">Let's build something together</p>
        <div className="section-divider" />

        <div className="contact__grid">
          {/* Form */}
          <div className="contact__form-wrap reveal">
            <div className="terminal glass-card contact__terminal">
              {/* Terminal header */}
              <div className="terminal__header">
                <div className="terminal__dots">
                  <span className="dot dot--red" />
                  <span className="dot dot--yellow" />
                  <span className="dot dot--green" />
                </div>
                <span className="terminal__title">farhan@contact:~ $ send_message</span>
              </div>

              <form className="contact__form" onSubmit={handleSubmit} id="contact-form">
                {/* Name */}
                <div className={`form-group${errors.name ? ' form-group--error' : ''}`}>
                  <label className="form-label" htmlFor="contact-name">
                    <span className="form-prompt">{'>'}</span> name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    className="form-input"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Farhan Haroon"
                    autoComplete="name"
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className={`form-group${errors.email ? ' form-group--error' : ''}`}>
                  <label className="form-label" htmlFor="contact-email">
                    <span className="form-prompt">{'>'}</span> email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    className="form-input"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                {/* Message */}
                <div className={`form-group${errors.message ? ' form-group--error' : ''}`}>
                  <label className="form-label" htmlFor="contact-message">
                    <span className="form-prompt">{'>'}</span> message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="form-input form-textarea"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Let's collaborate on something amazing..."
                    rows={5}
                  />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={`btn btn-primary contact__submit${status === 'loading' ? ' btn--loading' : ''}`}
                  disabled={status === 'loading'}
                  id="contact-submit-btn"
                >
                  {status === 'loading' ? (
                    <><span className="spinner" /> Transmitting...</>
                  ) : (
                    <>
                      <span>{'>'}</span> Send Message
                    </>
                  )}
                </button>

                {/* Feedback */}
                {status === 'success' && (
                  <div className="form-feedback form-feedback--success" id="contact-success">
                    <span>✓</span> Message Transmitted Successfully!
                  </div>
                )}
                {status === 'error' && (
                  <div className="form-feedback form-feedback--error" id="contact-error">
                    <span>✗</span> {errorMsg || 'Transmission Failed. Try again.'}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Info + Social */}
          <div className="contact__info reveal">
            <h3 className="contact__info-title">Get In Touch</h3>
            <p className="contact__info-text">
              Whether you have a project in mind, want to collaborate on open source,
              or just want to talk DevOps — my inbox is always open.
            </p>

            <div className="contact__details">
              <div className="contact__detail-item">
                <span className="detail__icon">📍</span>
                <span>Islamabad, Pakistan</span>
              </div>
              <div className="contact__detail-item">
                <span className="detail__icon">🎓</span>
                <span>COMSATS University Islamabad</span>
              </div>
              <div className="contact__detail-item">
                <span className="detail__icon">💼</span>
                <span>Open to opportunities</span>
              </div>
            </div>

            <div className="contact__socials">
              <p className="socials__label">Find me on:</p>
              <div className="socials__links">
                <a
                  href="https://github.com/farhanharoon2020-design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  id="social-github-btn"
                  aria-label="GitHub"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.57v-2c-3.33.72-4.03-1.6-4.03-1.6-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/farhan-haroon-8a1047379/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  id="social-linkedin-btn"
                  aria-label="LinkedIn"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
                  </svg>
                <span>LinkedIn</span>
                </a>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}
