/**
 * routes/resume.js
 * GET /api/resume/download — serve the PDF + log every download
 */

const router  = require('express').Router();
const path    = require('path');
const fs      = require('fs');
const { v4: uuidv4 } = require('uuid');
const fileStore      = require('../utils/fileStore');
const { logger }     = require('../middleware/logger');

const RESUME_PATH = process.env.RESUME_PATH
  ? path.resolve(process.env.RESUME_PATH)
  : path.join(__dirname, '..', '..', 'client', 'public', 'resume.pdf');

// ─── GET /api/resume/download ─────────────────────────────────────────────────
router.get('/download', async (req, res) => {
  if (!fs.existsSync(RESUME_PATH)) {
    logger.warn('Resume PDF not found', { path: RESUME_PATH });
    return res.status(404).json({
      error: 'Resume file not found. Please contact me directly.',
      hint:  'Place your resume PDF at client/public/resume.pdf',
    });
  }

  // Log download event
  const event = {
    id:        uuidv4(),
    ip:        (req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim(),
    userAgent: (req.headers['user-agent'] || '').slice(0, 300),
    referrer:  (req.headers.referer || '').slice(0, 500),
    timestamp: new Date().toISOString(),
  };

  try {
    await fileStore.append('resume_downloads.json', event, []);
    logger.info('Resume downloaded', { id: event.id });
  } catch (err) {
    logger.error('Resume log error', { err: err.message });
  }

  res.setHeader('Content-Disposition', 'attachment; filename="Farhan_Haroon_Resume.pdf"');
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(RESUME_PATH);
});

// ─── GET /api/resume/stats ────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const downloads = await fileStore.read('resume_downloads.json', []);
    res.json({
      totalDownloads: downloads.length,
      lastDownload:   downloads[downloads.length - 1]?.timestamp || null,
    });
  } catch (err) {
    logger.error('Resume stats error', { err: err.message });
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

module.exports = router;
