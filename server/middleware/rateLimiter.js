/**
 * middleware/rateLimiter.js
 * Centralised per-route rate limiters.
 */

const rateLimit = require('express-rate-limit');

const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message:        { error: message },
    standardHeaders: true,
    legacyHeaders:   false,
  });

// Contact form — 5 per 15 min
const contactLimiter = make(
  15 * 60 * 1000,
  5,
  'Too many messages sent. Please wait 15 minutes and try again.'
);

// Newsletter subscribe — 3 per hour
const newsletterLimiter = make(
  60 * 60 * 1000,
  3,
  'Too many subscription attempts. Please wait an hour and try again.'
);

// GitHub proxy — 30 per minute (cached anyway)
const githubLimiter = make(
  60 * 1000,
  30,
  'Too many GitHub stat requests. Slow down!'
);

// Analytics — 120 per minute (high freq)
const analyticsLimiter = make(
  60 * 1000,
  120,
  'Analytics rate limit exceeded.'
);

// Admin — 20 per minute
const adminLimiter = make(
  60 * 1000,
  20,
  'Admin rate limit exceeded.'
);

// General — 100 per 15 min (global fallback)
const generalLimiter = make(
  15 * 60 * 1000,
  100,
  'Too many requests. Please slow down.'
);

module.exports = {
  contactLimiter,
  newsletterLimiter,
  githubLimiter,
  analyticsLimiter,
  adminLimiter,
  generalLimiter,
};
