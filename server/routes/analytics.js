/**
 * routes/analytics.js
 * POST /api/analytics/visit  — log a page visit
 * GET  /api/analytics/summary — aggregate stats (last 30 days)
 */

const router  = require('express').Router();
const { v4: uuidv4 }        = require('uuid');
const { analyticsLimiter }  = require('../middleware/rateLimiter');
const fileStore             = require('../utils/fileStore');
const { logger }            = require('../middleware/logger');

// ─── POST /api/analytics/visit ───────────────────────────────────────────────
router.post('/visit', analyticsLimiter, async (req, res) => {
  const { page = '/', referrer = '', sessionId } = req.body;

  const visit = {
    id:         uuidv4(),
    sessionId:  sessionId || uuidv4(),
    page:       String(page).slice(0, 200),
    referrer:   String(referrer).slice(0, 500),
    ip:         (req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim(),
    userAgent:  (req.headers['user-agent'] || 'unknown').slice(0, 300),
    timestamp:  new Date().toISOString(),
  };

  try {
    await fileStore.append('analytics.json', visit, []);
    res.json({ success: true, id: visit.id });
  } catch (err) {
    logger.error('Analytics write error', { err: err.message });
    res.status(500).json({ error: 'Failed to log visit.' });
  }
});

// ─── GET /api/analytics/summary ──────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const all = await fileStore.read('analytics.json', []);
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // last 30 days

    const recent = all.filter(v => new Date(v.timestamp).getTime() > cutoff);

    // Top pages
    const pageCounts = {};
    for (const v of recent) {
      pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // Unique sessions
    const uniqueSessions = new Set(recent.map(v => v.sessionId)).size;

    // Visits per day (last 7 days)
    const visitsByDay = {};
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const v of recent) {
      if (new Date(v.timestamp).getTime() < sevenDaysAgo) continue;
      const day = v.timestamp.slice(0, 10);
      visitsByDay[day] = (visitsByDay[day] || 0) + 1;
    }

    res.json({
      totalVisits:    all.length,
      last30Days:     recent.length,
      uniqueSessions,
      topPages,
      visitsByDay,
    });
  } catch (err) {
    logger.error('Analytics summary error', { err: err.message });
    res.status(500).json({ error: 'Failed to compute summary.' });
  }
});

module.exports = router;
