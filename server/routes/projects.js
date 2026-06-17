/**
 * routes/projects.js
 * POST /api/projects/:id/view  — increment view counter for a project
 * GET  /api/projects/views     — get all view counts
 */

const router    = require('express').Router();
const fileStore = require('../utils/fileStore');
const { logger } = require('../middleware/logger');

const ALLOWED_PROJECT_IDS = [
  'jarvis',
  'bash-automation',
  'devops-portfolio',
  'docker-monitor',
  'k8s-deploy',
  'ci-cd-pipeline',
];

// ─── POST /api/projects/:id/view ─────────────────────────────────────────────
router.post('/:id/view', async (req, res) => {
  const { id } = req.params;

  if (!ALLOWED_PROJECT_IDS.includes(id)) {
    return res.status(400).json({ error: `Unknown project id "${id}".` });
  }

  try {
    const updated = await fileStore.updateKey(
      'project_views.json',
      id,
      (current) => (current || 0) + 1,
      {}
    );

    logger.info('Project view logged', { project: id, total: updated[id] });
    res.json({ success: true, project: id, views: updated[id] });
  } catch (err) {
    logger.error('Project view error', { err: err.message });
    res.status(500).json({ error: 'Failed to record view.' });
  }
});

// ─── GET /api/projects/views ──────────────────────────────────────────────────
router.get('/views', async (req, res) => {
  try {
    const views = await fileStore.read('project_views.json', {});
    res.json({ views });
  } catch (err) {
    logger.error('Project views read error', { err: err.message });
    res.status(500).json({ error: 'Failed to retrieve views.' });
  }
});

module.exports = router;
