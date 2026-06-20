/**
 * routes/contact.js
 * POST /api/contact — sanitised contact form with email + submission log.
 */

const router  = require('express').Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { contactLimiter }   = require('../middleware/rateLimiter');
const { sendContactEmails } = require('../utils/mailer');
const fileStore             = require('../utils/fileStore');
const { logger }            = require('../middleware/logger');

// ─── Validation rules ─────────────────────────────────────────────────────────
const rules = [
  body('name')
    .trim().notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be ≤ 100 characters.')
    .escape(),
  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),
  body('message')
    .trim().notEmpty().withMessage('Message is required.')
    .isLength({ min: 1, max: 2000 }).withMessage('Message must be under 2000 characters.')
    .escape(),
];

// ─── POST /api/contact ────────────────────────────────────────────────────────
router.post('/', contactLimiter, rules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;
  const id = uuidv4();
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  // Log the submission (flat-file)
  const submission = {
    id,
    name,
    email,
    message,
    ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    submittedAt: new Date().toISOString(),
  };

  try {
    await fileStore.append('contacts.json', submission, []);
  } catch (err) {
    logger.error('Failed to log contact submission', { err: err.message });
  }

  // Send emails (runs in the background, doesn't block success response if it fails)
  try {
    await sendContactEmails({ name, email, message });
    logger.info('Contact send email success', { id, name, email });
  } catch (err) {
    logger.error('Email send failed but message was saved', { err: err.message });
  }

  return res.json({
    success: true,
    id,
    message: "Message received! I'll get back to you shortly.",
  });
});

module.exports = router;
