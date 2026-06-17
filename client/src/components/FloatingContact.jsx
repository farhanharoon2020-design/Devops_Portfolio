import React, { useState } from 'react';
import '../styles/floatingcontact.css';

const ACTIONS = [
  {
    id: 'call',
    label: 'Call',
    color: '#00c853',
    bg: 'linear-gradient(135deg,#00c853,#009624)',
    href: 'tel:+923349372024',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
      </svg>
    ),
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25d366',
    bg: 'linear-gradient(135deg,#25d366,#128c7e)',
    href: 'https://wa.me/923349372024?text=Hi%20Farhan!%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20connect.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    id: 'sms',
    label: 'SMS',
    color: '#448aff',
    bg: 'linear-gradient(135deg,#448aff,#1565c0)',
    href: 'sms:+923349372024',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    color: '#ff6d00',
    bg: 'linear-gradient(135deg,#ff6d00,#c43e00)',
    href: 'mailto:farhanharoon2020@gmail.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    ),
  },
];

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`fc-wrap${open ? ' fc-wrap--open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Sub-action balls */}
      {ACTIONS.map((action, i) => (
        <a
          key={action.id}
          href={action.href}
          target={action.id === 'whatsapp' ? '_blank' : undefined}
          rel="noopener noreferrer"
          className={`fc-action fc-action--${i}`}
          style={{ '--ac': action.color, '--ab': action.bg }}
          aria-label={action.label}
          id={`fc-${action.id}`}
        >
          <span className="fc-action__icon">{action.icon}</span>
          <span className="fc-action__label">{action.label}</span>
        </a>
      ))}

      {/* Main button */}
      <button
        className="fc-main"
        id="fc-main-btn"
        aria-label="Contact options"
        onClick={() => setOpen(o => !o)}
      >
        <span className={`fc-main__icon${open ? ' fc-main__icon--open' : ''}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </span>
        <span className="fc-main__label">Contact</span>
        <span className="fc-main__pulse" />
      </button>
    </div>
  );
}
