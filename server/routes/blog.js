/**
 * routes/blog.js
 * GET /api/blog          — list all posts (metadata only)
 * GET /api/blog/:slug    — get a single post (with HTML body)
 */

const router = require('express').Router();
const fs     = require('fs').promises;
const path   = require('path');
const { marked } = require('marked');
const cache  = require('../utils/cache');
const { logger } = require('../middleware/logger');

const BLOG_DIR = path.join(__dirname, '..', 'data', 'blog');
const CACHE_TTL = 5 * 60; // 5 minutes

// ─── Parse front-matter from markdown ────────────────────────────────────────
function parseFrontMatter(raw) {
  const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match   = raw.match(fmRegex);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let   val = line.slice(colonIdx + 1).trim();

    // Parse arrays like [tag1, tag2]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(v => v.trim());
    }
    // Parse numbers
    else if (!isNaN(val) && val !== '') {
      val = Number(val);
    }

    meta[key] = val;
  }

  return { meta, body: match[2].trim() };
}

// ─── GET /api/blog ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const cacheKey = 'blog:list';
  const cached   = cache.get(cacheKey);
  if (cached) return res.json({ posts: cached, cached: true });

  try {
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        const raw          = await fs.readFile(path.join(BLOG_DIR, file), 'utf-8');
        const { meta }     = parseFrontMatter(raw);
        return {
          slug:     meta.slug || file.replace('.md', ''),
          title:    meta.title || file,
          date:     meta.date  || null,
          readTime: meta.readTime || null,
          tags:     meta.tags  || [],
          excerpt:  meta.excerpt || '',
        };
      })
    );

    // Sort newest first
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    cache.set(cacheKey, posts, CACHE_TTL);
    res.json({ posts, total: posts.length, cached: false });
  } catch (err) {
    logger.error('Blog list error', { err: err.message });
    res.status(500).json({ error: 'Failed to load blog posts.' });
  }
});

// ─── GET /api/blog/:slug ──────────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug format.' });
  }

  const cacheKey = `blog:post:${slug}`;
  const cached   = cache.get(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);
    const raw      = await fs.readFile(filePath, 'utf-8');
    const { meta, body } = parseFrontMatter(raw);

    const post = {
      slug:     meta.slug || slug,
      title:    meta.title || slug,
      date:     meta.date  || null,
      readTime: meta.readTime || null,
      tags:     meta.tags  || [],
      excerpt:  meta.excerpt || '',
      html:     marked(body),
      markdown: body,
    };

    cache.set(cacheKey, post, CACHE_TTL);
    res.json({ ...post, cached: false });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: `Post "${slug}" not found.` });
    }
    logger.error('Blog post error', { slug, err: err.message });
    res.status(500).json({ error: 'Failed to load post.' });
  }
});

module.exports = router;
