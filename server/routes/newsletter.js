/**
 * routes/newsletter.js
 * POST /api/newsletter/subscribe    — save email, send welcome
 * POST /api/newsletter/unsubscribe  — remove email
 * GET  /api/newsletter/count        — public subscriber count
 */

const router  = require('express').Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { newsletterLimiter }  = require('../middleware/rateLimiter');
const { sendWelcomeEmail }   = require('../utils/mailer');
const fileStore              = require('../utils/fileStore');
const { logger }             = require('../middleware/logger');

// ─── POST /api/newsletter/subscribe ──────────────────────────────────────────
router.post(
  '/subscribe',
  newsletterLimiter,
  [
    body('email')
      .trim().notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Invalid email address.')
      .normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const subs = await fileStore.read('subscribers.json', []);

      // Check for duplicate
      if (subs.some(s => s.email === email && s.active)) {
        return res.status(409).json({ error: 'You are already subscribed!' });
      }

      const entry = {
        id:          uuidv4(),
        email,
        subscribedAt: new Date().toISOString(),
        active:       true,
        ip:           (req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim(),
      };

      await fileStore.append('subscribers.json', entry, []);

      // Send welcome email (non-blocking)
      sendWelcomeEmail({ email }).catch(err =>
        logger.error('Welcome email failed', { err: err.message })
      );

      logger.info('Newsletter subscription', { email });
      res.status(201).json({
        success: true,
        message: "You're subscribed! Welcome aboard 🚀",
      });
    } catch (err) {
      logger.error('Subscribe error', { err: err.message });
      res.status(500).json({ error: 'Subscription failed. Please try again.' });
    }
  }
);

// ─── POST /api/newsletter/unsubscribe ────────────────────────────────────────
router.post(
  '/unsubscribe',
  [
    body('email')
      .trim().notEmpty().isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const subs = await fileStore.read('subscribers.json', []);
      const updated = subs.map(s =>
        s.email === email ? { ...s, active: false, unsubscribedAt: new Date().toISOString() } : s
      );

      const wasSubscribed = subs.some(s => s.email === email && s.active);
      if (!wasSubscribed) {
        return res.status(404).json({ error: 'Email not found in subscriber list.' });
      }

      await fileStore.write('subscribers.json', updated);
      logger.info('Newsletter unsubscription', { email });
      res.json({ success: true, message: 'You have been unsubscribed.' });
    } catch (err) {
      logger.error('Unsubscribe error', { err: err.message });
      res.status(500).json({ error: 'Failed to unsubscribe. Please try again.' });
    }
  }
);

// ─── GET /api/newsletter/count ────────────────────────────────────────────────
router.get('/count', async (req, res) => {
  try {
    const subs = await fileStore.read('subscribers.json', []);
    const active = subs.filter(s => s.active).length;
    res.json({ subscribers: active });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get count.' });
  }
});

module.exports = router;
