/**
 * routes/skills.js
 * GET /api/skills — serve skills data from data/skills.json
 */

const router    = require('express').Router();
const fileStore = require('../utils/fileStore');
const cache     = require('../utils/cache');
const { logger } = require('../middleware/logger');

// ─── GET /api/skills ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const cacheKey = 'skills:all';
  const cached   = cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const data = await fileStore.read('skills.json', { categories: [] });
    cache.set(cacheKey, data, 5 * 60); // cache 5 min
    res.json({ ...data, cached: false });
  } catch (err) {
    logger.error('Skills read error', { err: err.message });
    res.status(500).json({ error: 'Failed to load skills data.' });
  }
});

module.exports = router;
