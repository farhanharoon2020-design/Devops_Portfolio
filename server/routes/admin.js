/**
 * routes/admin.js
 * All routes require the X-Admin-Key header.
 *
 * GET  /api/admin/stats      — aggregated dashboard stats
 * GET  /api/admin/contacts   — all contact form submissions
 * GET  /api/admin/subscribers — all newsletter subscribers
 * DELETE /api/admin/cache    — clear in-memory cache
 */

const router    = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const { adminLimiter } = require('../middleware/rateLimiter');
const fileStore = require('../utils/fileStore');
const cache     = require('../utils/cache');
const { logger } = require('../middleware/logger');
const os        = require('os');

// Apply auth + rate limit to all admin routes
router.use(adminLimiter, adminAuth);

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [analytics, contacts, subscribers, projectViews, resumeDls] = await Promise.all([
      fileStore.read('analytics.json',        []),
      fileStore.read('contacts.json',         []),
      fileStore.read('subscribers.json',      []),
      fileStore.read('project_views.json',    {}),
      fileStore.read('resume_downloads.json', []),
    ]);

    const cutoff30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentVisits = analytics.filter(v => new Date(v.timestamp).getTime() > cutoff30);

    // Page visit breakdown
    const pageCounts = {};
    for (const v of recentVisits) {
      pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
    }

    // Top referrers
    const referrerCounts = {};
    for (const v of recentVisits) {
      if (v.referrer) referrerCounts[v.referrer] = (referrerCounts[v.referrer] || 0) + 1;
    }

    // Unique IPs (approx unique visitors)
    const uniqueIPs = new Set(recentVisits.map(v => v.ip)).size;

    const stats = {
      server: {
        uptime:   process.uptime(),
        memUsage: process.memoryUsage(),
        cpus:     os.cpus().length,
        platform: os.platform(),
        nodeVersion: process.version,
        cacheStats: cache.stats(),
      },
      visitors: {
        total:         analytics.length,
        last30Days:    recentVisits.length,
        uniqueIPs,
        topPages:      Object.entries(pageCounts)
          .sort((a, b) => b[1] - a[1]).slice(0, 10)
          .map(([page, count]) => ({ page, count })),
        topReferrers:  Object.entries(referrerCounts)
          .sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([ref, count]) => ({ referrer: ref, count })),
      },
      contacts: {
        total:   contacts.length,
        recent:  contacts.slice(-5).reverse(),
      },
      newsletter: {
        total:      subscribers.length,
        active:     subscribers.filter(s => s.active).length,
        unsubscribed: subscribers.filter(s => !s.active).length,
      },
      projects: {
        views: projectViews,
        totalViews: Object.values(projectViews).reduce((s, v) => s + v, 0),
      },
      resume: {
        downloads: resumeDls.length,
        last:      resumeDls[resumeDls.length - 1]?.timestamp || null,
      },
      generatedAt: new Date().toISOString(),
    };

    logger.info('Admin stats requested');
    res.json(stats);
  } catch (err) {
    logger.error('Admin stats error', { err: err.message });
    res.status(500).json({ error: 'Failed to compile stats.' });
  }
});

// ─── GET /api/admin/contacts ──────────────────────────────────────────────────
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await fileStore.read('contacts.json', []);
    res.json({ contacts, total: contacts.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load contacts.' });
  }
});

// ─── GET /api/admin/subscribers ───────────────────────────────────────────────
router.get('/subscribers', async (req, res) => {
  try {
    const subs = await fileStore.read('subscribers.json', []);
    res.json({ subscribers: subs, total: subs.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subscribers.' });
  }
});

// ─── DELETE /api/admin/cache ──────────────────────────────────────────────────
router.delete('/cache', (req, res) => {
  cache.clear();
  logger.info('Cache cleared by admin');
  res.json({ success: true, message: 'In-memory cache cleared.' });
});

module.exports = router;
