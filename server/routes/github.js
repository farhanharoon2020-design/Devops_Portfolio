/**
 * routes/github.js
 * GET /api/github/stats  — cached proxy to GitHub API
 * GET /api/github/repos  — list public repos
 *
 * GitHub username: farhanharoon2020-design
 */

const router  = require('express').Router();
const axios   = require('axios');
const cache   = require('../utils/cache');
const { githubLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../middleware/logger');

const GITHUB_USER = 'farhanharoon2020-design';
const GITHUB_API  = 'https://api.github.com';
const CACHE_TTL   = 10 * 60; // 10 minutes

const ghHeaders = () => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'DevOps-Portfolio-API',
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
});

// ─── GET /api/github/stats ────────────────────────────────────────────────────
router.get('/stats', githubLimiter, async (req, res) => {
  const cacheKey = `github:stats:${GITHUB_USER}`;
  const cached   = cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const [userRes, reposRes] = await Promise.all([
      axios.get(`${GITHUB_API}/users/${GITHUB_USER}`, { headers: ghHeaders() }),
      axios.get(`${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&type=public`, {
        headers: ghHeaders(),
      }),
    ]);

    const user  = userRes.data;
    const repos = reposRes.data;

    // Aggregate stats
    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = repos.reduce((s, r) => s + r.forks_count,      0);
    const topRepos   = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map(r => ({
        name:        r.name,
        description: r.description,
        url:         r.html_url,
        stars:       r.stargazers_count,
        forks:       r.forks_count,
        language:    r.language,
        updatedAt:   r.updated_at,
        topics:      r.topics || [],
      }));

    const languages = {};
    for (const r of repos) {
      if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
    }

    const stats = {
      username:    GITHUB_USER,
      name:        user.name,
      bio:         user.bio,
      avatar:      user.avatar_url,
      profileUrl:  user.html_url,
      followers:   user.followers,
      following:   user.following,
      publicRepos: user.public_repos,
      totalStars,
      totalForks,
      topRepos,
      languages: Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, count]) => ({ lang, count })),
      fetchedAt:   new Date().toISOString(),
    };

    cache.set(cacheKey, stats, CACHE_TTL);
    logger.info('GitHub stats fetched and cached');
    res.json({ ...stats, cached: false });
  } catch (err) {
    logger.error('GitHub API error', { status: err.response?.status, msg: err.message });

    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub rate limit exceeded. Try again in 60 minutes.' });
    }
    if (err.response?.status === 404) {
      return res.status(404).json({ error: `GitHub user "${GITHUB_USER}" not found.` });
    }
    res.status(502).json({ error: 'Failed to fetch GitHub data.' });
  }
});

// ─── GET /api/github/repos ────────────────────────────────────────────────────
router.get('/repos', githubLimiter, async (req, res) => {
  const cacheKey = `github:repos:${GITHUB_USER}`;
  const cached   = cache.get(cacheKey);
  if (cached) return res.json({ repos: cached, cached: true });

  try {
    const { data } = await axios.get(
      `${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&sort=updated&type=public`,
      { headers: ghHeaders() }
    );

    const repos = data.map(r => ({
      id:          r.id,
      name:        r.name,
      fullName:    r.full_name,
      description: r.description,
      url:         r.html_url,
      cloneUrl:    r.clone_url,
      stars:       r.stargazers_count,
      forks:       r.forks_count,
      watchers:    r.watchers_count,
      language:    r.language,
      topics:      r.topics || [],
      isForked:    r.fork,
      isArchived:  r.archived,
      createdAt:   r.created_at,
      updatedAt:   r.updated_at,
      pushedAt:    r.pushed_at,
    }));

    cache.set(cacheKey, repos, CACHE_TTL);
    res.json({ repos, cached: false });
  } catch (err) {
    logger.error('GitHub repos error', { msg: err.message });
    res.status(502).json({ error: 'Failed to fetch repositories.' });
  }
});

module.exports = router;
