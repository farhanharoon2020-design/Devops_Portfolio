/**
 * index.js — DevOps Portfolio Express Server
 *
 * Modular production-grade API for Farhan Haroon's portfolio.
 *
 * Endpoints:
 *   GET  /health                      — server health + uptime
 *   GET  /api/status                  — rich status + system info
 *   POST /api/contact                 — contact form submission
 *   POST /api/analytics/visit         — log page visit
 *   GET  /api/analytics/summary       — visit stats (last 30 days)
 *   GET  /api/github/stats            — GitHub profile + repo stats (cached)
 *   GET  /api/github/repos            — list public repos (cached)
 *   GET  /api/blog                    — list blog posts
 *   GET  /api/blog/:slug              — get a blog post as HTML
 *   POST /api/projects/:id/view       — increment project view counter
 *   GET  /api/projects/views          — all project view counts
 *   GET  /api/resume/download         — download resume PDF
 *   GET  /api/resume/stats            — resume download count
 *   POST /api/newsletter/subscribe    — subscribe to newsletter
 *   POST /api/newsletter/unsubscribe  — unsubscribe
 *   GET  /api/newsletter/count        — active subscriber count
 *   GET  /api/skills                  — skills data
 *   GET  /api/admin/stats             — [admin] aggregated dashboard
 *   GET  /api/admin/contacts          — [admin] contact submissions
 *   GET  /api/admin/subscribers       — [admin] newsletter list
 *   DELETE /api/admin/cache           — [admin] clear cache
 */

require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const os          = require('os');

const { morganMiddleware, logger } = require('./middleware/logger');
const { generalLimiter }           = require('./middleware/rateLimiter');

// ─── Routes ───────────────────────────────────────────────────────────────────
const contactRouter    = require('./routes/contact');
const analyticsRouter  = require('./routes/analytics');
const githubRouter     = require('./routes/github');
const blogRouter       = require('./routes/blog');
const projectsRouter   = require('./routes/projects');
const resumeRouter     = require('./routes/resume');
const newsletterRouter = require('./routes/newsletter');
const skillsRouter     = require('./routes/skills');
const adminRouter      = require('./routes/admin');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;
const START_TIME = Date.now();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow font/pdf serving
}));

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key'],
}));

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morganMiddleware);

// ─── Global Rate Limit ────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT — Beautiful API Docs Page
// ─────────────────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  const uptimeSec = Math.floor((Date.now() - START_TIME) / 1000);
  const uptimeStr = `${Math.floor(uptimeSec/3600)}h ${Math.floor((uptimeSec%3600)/60)}m ${uptimeSec%60}s`;
  const mem = process.memoryUsage();
  const heapMB = +(mem.heapUsed / 1024 / 1024).toFixed(1);

  const endpoints = [
    { method:'GET',    badge:'get',    path:'/health',                      desc:'Quick health check',                     auth:false },
    { method:'GET',    badge:'get',    path:'/api/status',                  desc:'Rich status — uptime, memory, system',   auth:false },
    { method:'POST',   badge:'post',   path:'/api/contact',                 desc:'Submit contact form',                    auth:false },
    { method:'POST',   badge:'post',   path:'/api/analytics/visit',         desc:'Log a page visit',                       auth:false },
    { method:'GET',    badge:'get',    path:'/api/analytics/summary',       desc:'Visit stats (last 30 days)',              auth:false },
    { method:'GET',    badge:'get',    path:'/api/github/stats',            desc:'GitHub profile + repo stats (cached)',    auth:false },
    { method:'GET',    badge:'get',    path:'/api/github/repos',            desc:'List all public repos',                  auth:false },
    { method:'GET',    badge:'get',    path:'/api/blog',                    desc:'List all blog posts',                    auth:false },
    { method:'GET',    badge:'get',    path:'/api/blog/:slug',              desc:'Get a post as rendered HTML',            auth:false },
    { method:'POST',   badge:'post',   path:'/api/projects/:id/view',       desc:'Increment project view counter',         auth:false },
    { method:'GET',    badge:'get',    path:'/api/projects/views',          desc:'All project view counts',                auth:false },
    { method:'GET',    badge:'get',    path:'/api/resume/download',         desc:'Download resume PDF',                    auth:false },
    { method:'GET',    badge:'get',    path:'/api/resume/stats',            desc:'Resume download count',                  auth:false },
    { method:'POST',   badge:'post',   path:'/api/newsletter/subscribe',    desc:'Subscribe to newsletter',                auth:false },
    { method:'POST',   badge:'post',   path:'/api/newsletter/unsubscribe',  desc:'Unsubscribe from newsletter',            auth:false },
    { method:'GET',    badge:'get',    path:'/api/newsletter/count',        desc:'Active subscriber count',                auth:false },
    { method:'GET',    badge:'get',    path:'/api/skills',                  desc:'Skills data by category',                auth:false },
    { method:'GET',    badge:'get',    path:'/api/admin/stats',             desc:'Aggregated dashboard stats',             auth:true  },
    { method:'GET',    badge:'get',    path:'/api/admin/contacts',          desc:'All contact form submissions',           auth:true  },
    { method:'GET',    badge:'get',    path:'/api/admin/subscribers',       desc:'Full newsletter subscriber list',        auth:true  },
    { method:'DELETE', badge:'delete', path:'/api/admin/cache',             desc:'Clear in-memory cache',                  auth:true  },
  ];

  const rows = endpoints.map(e => `
    <tr>
      <td><span class="badge badge-${e.badge}">${e.method}</span></td>
      <td class="path">${e.path.startsWith('/api') || e.path === '/health'
          ? `<a href="${e.path.includes(':') ? '#' : e.path}" class="path-link">${e.path}</a>`
          : e.path}</td>
      <td class="desc">${e.desc}</td>
      <td>${e.auth ? '<span class="auth-tag">🔑 X-Admin-Key</span>' : '<span class="open-tag">🌐 Public</span>'}</td>
    </tr>`).join('');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>DevOps Portfolio API v2.0.0</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --bg:#080c14;--surface:#0d1422;--card:#111827;--border:#1e2d45;
      --blue:#3b82f6;--cyan:#06b6d4;--green:#22c55e;--yellow:#eab308;
      --red:#ef4444;--purple:#a855f7;--text:#e2e8f0;--muted:#64748b;
    }
    body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}

    /* ── Animated background ── */
    body::before{
      content:'';position:fixed;inset:0;
      background:radial-gradient(ellipse 80% 60% at 50% -10%,#1e3a5f44,transparent),
                 radial-gradient(ellipse 60% 40% at 90% 90%,#0f2a1a33,transparent);
      pointer-events:none;z-index:0;
    }
    .wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:40px 24px 80px}

    /* ── Header ── */
    header{text-align:center;padding:48px 0 40px;border-bottom:1px solid var(--border);margin-bottom:40px}
    .logo-row{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:18px}
    .logo-icon{width:52px;height:52px;background:linear-gradient(135deg,#1d4ed8,#06b6d4);border-radius:14px;
      display:flex;align-items:center;justify-content:center;font-size:24px;
      box-shadow:0 0 32px #3b82f630;animation:pulse 3s ease-in-out infinite}
    @keyframes pulse{0%,100%{box-shadow:0 0 20px #3b82f630}50%{box-shadow:0 0 45px #3b82f660}}
    h1{font-family:'JetBrains Mono',monospace;font-size:clamp(1.5rem,4vw,2.2rem);font-weight:700;
      background:linear-gradient(135deg,#60a5fa,#06b6d4,#818cf8);-webkit-background-clip:text;
      -webkit-text-fill-color:transparent;background-clip:text}
    .version{display:inline-block;background:#1e3a5f;border:1px solid #3b82f640;color:#60a5fa;
      font-family:'JetBrains Mono',monospace;font-size:.75rem;padding:3px 10px;border-radius:20px;margin-top:6px}
    .tagline{color:var(--muted);font-size:.95rem;margin-top:12px}
    .owner-links{display:flex;gap:16px;justify-content:center;margin-top:20px;flex-wrap:wrap}
    .owner-links a{display:flex;align-items:center;gap:6px;color:#60a5fa;text-decoration:none;
      font-size:.85rem;padding:6px 14px;border:1px solid #1e3a5f;border-radius:8px;
      transition:.2s;background:#0d1422}
    .owner-links a:hover{border-color:#3b82f6;background:#1e2d45;color:#93c5fd}

    /* ── Stats row ── */
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:40px}
    .stat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;
      display:flex;flex-direction:column;gap:6px;transition:.25s;position:relative;overflow:hidden}
    .stat-card::before{content:'';position:absolute;inset:0;border-radius:14px;opacity:0;
      background:linear-gradient(135deg,#3b82f608,#06b6d408);transition:.25s}
    .stat-card:hover::before{opacity:1}
    .stat-card:hover{border-color:#3b82f640;transform:translateY(-2px)}
    .stat-icon{font-size:1.5rem}
    .stat-value{font-family:'JetBrains Mono',monospace;font-size:1.4rem;font-weight:700;color:#60a5fa}
    .stat-label{font-size:.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}

    /* ── Section title ── */
    .section-title{font-family:'JetBrains Mono',monospace;font-size:.8rem;font-weight:600;
      color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;
      display:flex;align-items:center;gap:10px}
    .section-title::after{content:'';flex:1;height:1px;background:var(--border)}

    /* ── Endpoint table ── */
    .table-wrap{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:40px}
    table{width:100%;border-collapse:collapse}
    thead tr{background:#0d1626;border-bottom:1px solid var(--border)}
    th{padding:12px 16px;font-size:.72rem;font-weight:600;color:var(--muted);text-transform:uppercase;
      letter-spacing:.08em;text-align:left}
    tbody tr{border-bottom:1px solid #131f30;transition:.15s}
    tbody tr:last-child{border-bottom:none}
    tbody tr:hover{background:#0d1626}
    td{padding:12px 16px;font-size:.875rem;vertical-align:middle}
    .badge{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:.68rem;font-weight:700;
      padding:3px 9px;border-radius:6px;letter-spacing:.04em;min-width:58px;text-align:center}
    .badge-get{background:#0c2a1a;color:#22c55e;border:1px solid #22c55e30}
    .badge-post{background:#1a1f0a;color:#eab308;border:1px solid #eab30830}
    .badge-delete{background:#2a0c0c;color:#ef4444;border:1px solid #ef444430}
    .path{font-family:'JetBrains Mono',monospace;font-size:.82rem;color:#93c5fd}
    .path-link{color:#60a5fa;text-decoration:none;transition:.15s}
    .path-link:hover{color:#93c5fd;text-decoration:underline}
    .desc{color:#94a3b8;font-size:.83rem}
    .auth-tag{font-size:.75rem;color:#a855f7;background:#1e0a2a;border:1px solid #a855f730;
      padding:3px 8px;border-radius:6px;white-space:nowrap}
    .open-tag{font-size:.75rem;color:#22c55e;background:#0c2a1a;border:1px solid #22c55e30;
      padding:3px 8px;border-radius:6px;white-space:nowrap}

    /* ── Quick test section ── */
    .quick-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:40px}
    .quick-link{display:flex;align-items:center;gap:10px;padding:14px 16px;
      background:var(--card);border:1px solid var(--border);border-radius:12px;
      text-decoration:none;color:var(--text);transition:.2s;font-size:.875rem}
    .quick-link:hover{border-color:#3b82f650;background:#0d1a2e;transform:translateY(-1px)}
    .quick-link .ql-icon{font-size:1.1rem;min-width:24px;text-align:center}
    .quick-link .ql-path{font-family:'JetBrains Mono',monospace;font-size:.78rem;color:#60a5fa;margin-top:1px}

    /* ── Footer ── */
    footer{text-align:center;color:var(--muted);font-size:.8rem;padding-top:32px;border-top:1px solid var(--border)}
    footer a{color:#60a5fa;text-decoration:none}
    footer a:hover{text-decoration:underline}

    /* ── Blinking cursor ── */
    .cursor{display:inline-block;width:2px;height:1em;background:#3b82f6;margin-left:2px;
      animation:blink 1s step-end infinite;vertical-align:text-bottom}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

    @media(max-width:640px){
      th:nth-child(4),td:nth-child(4){display:none}
      th:nth-child(3),td:nth-child(3){display:none}
    }
  </style>
</head>
<body>
<div class="wrap">

  <!-- Header -->
  <header>
    <div class="logo-row">
      <div class="logo-icon">🚀</div>
      <div>
        <h1>DevOps Portfolio API<span class="cursor"></span></h1>
        <div class="version">v2.0.0</div>
      </div>
    </div>
    <p class="tagline">Production-grade Express backend by <strong>Farhan Haroon</strong></p>
    <div class="owner-links">
      <a href="https://github.com/farhanharoon2020-design" target="_blank">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.57v-2c-3.33.72-4.03-1.6-4.03-1.6-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
      </a>
      <a href="https://www.linkedin.com/in/farhan-haroon-8a1047379/" target="_blank">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 .77 0 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
        LinkedIn
      </a>
      <a href="/api/status">
        ⚡ API Status
      </a>
      <a href="/health">
        ❤️ Health
      </a>
    </div>
  </header>

  <!-- Server Stats -->
  <p class="section-title">Live Server Stats</p>
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-icon">⚡</span>
      <span class="stat-value" id="uptime">${uptimeStr}</span>
      <span class="stat-label">Uptime</span>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🧠</span>
      <span class="stat-value">${heapMB} MB</span>
      <span class="stat-label">Heap Used</span>
    </div>
    <div class="stat-card">
      <span class="stat-icon">📦</span>
      <span class="stat-value">${endpoints.length}</span>
      <span class="stat-label">Endpoints</span>
    </div>
    <div class="stat-card">
      <span class="stat-icon">✉️</span>
      <span class="stat-value">${process.env.SMTP_USER ? '✅' : '⚠️'}</span>
      <span class="stat-label">SMTP ${process.env.SMTP_USER ? 'Configured' : 'Dev Mode'}</span>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🐙</span>
      <span class="stat-value">${process.env.GITHUB_TOKEN ? '✅' : '⚠️'}</span>
      <span class="stat-label">GitHub ${process.env.GITHUB_TOKEN ? 'Auth' : 'Unauth'}</span>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🔑</span>
      <span class="stat-value">${process.env.ADMIN_KEY ? '✅' : '⚠️'}</span>
      <span class="stat-label">Admin ${process.env.ADMIN_KEY ? 'Secured' : 'Off'}</span>
    </div>
  </div>

  <!-- Quick Test Links -->
  <p class="section-title">Quick Test (click to open)</p>
  <div class="quick-links">
    <a class="quick-link" href="/health"><span class="ql-icon">❤️</span><div><div>Health Check</div><div class="ql-path">GET /health</div></div></a>
    <a class="quick-link" href="/api/status"><span class="ql-icon">⚡</span><div><div>Full Status</div><div class="ql-path">GET /api/status</div></div></a>
    <a class="quick-link" href="/api/github/stats"><span class="ql-icon">🐙</span><div><div>GitHub Stats</div><div class="ql-path">GET /api/github/stats</div></div></a>
    <a class="quick-link" href="/api/github/repos"><span class="ql-icon">📁</span><div><div>GitHub Repos</div><div class="ql-path">GET /api/github/repos</div></div></a>
    <a class="quick-link" href="/api/blog"><span class="ql-icon">📝</span><div><div>Blog Posts</div><div class="ql-path">GET /api/blog</div></div></a>
    <a class="quick-link" href="/api/blog/intro-to-devops"><span class="ql-icon">📄</span><div><div>Intro to DevOps</div><div class="ql-path">GET /api/blog/intro-to-devops</div></div></a>
    <a class="quick-link" href="/api/blog/docker-best-practices"><span class="ql-icon">🐳</span><div><div>Docker Best Practices</div><div class="ql-path">GET /api/blog/docker-best-practices</div></div></a>
    <a class="quick-link" href="/api/blog/kubernetes-basics"><span class="ql-icon">☸️</span><div><div>Kubernetes Basics</div><div class="ql-path">GET /api/blog/kubernetes-basics</div></div></a>
    <a class="quick-link" href="/api/skills"><span class="ql-icon">🛠️</span><div><div>Skills Data</div><div class="ql-path">GET /api/skills</div></div></a>
    <a class="quick-link" href="/api/projects/views"><span class="ql-icon">👁️</span><div><div>Project Views</div><div class="ql-path">GET /api/projects/views</div></div></a>
    <a class="quick-link" href="/api/newsletter/count"><span class="ql-icon">📬</span><div><div>Newsletter Count</div><div class="ql-path">GET /api/newsletter/count</div></div></a>
    <a class="quick-link" href="/api/resume/stats"><span class="ql-icon">📄</span><div><div>Resume Downloads</div><div class="ql-path">GET /api/resume/stats</div></div></a>
    <a class="quick-link" href="/api/analytics/summary"><span class="ql-icon">📊</span><div><div>Analytics Summary</div><div class="ql-path">GET /api/analytics/summary</div></div></a>
    <a class="quick-link" href="/api/resume/download"><span class="ql-icon">⬇️</span><div><div>Download Resume</div><div class="ql-path">GET /api/resume/download</div></div></a>
  </div>

  <!-- All Endpoints Table -->
  <p class="section-title">All Endpoints</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Method</th><th>Path</th><th>Description</th><th>Access</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <footer>
    Built with ❤️ by <a href="https://www.linkedin.com/in/farhan-haroon-8a1047379/" target="_blank">Farhan Haroon</a>
    &nbsp;·&nbsp; DevOps Engineer &nbsp;·&nbsp; COMSATS University Islamabad
    &nbsp;·&nbsp; <a href="https://github.com/farhanharoon2020-design" target="_blank">GitHub</a>
  </footer>
</div>
</body>
</html>`);
});

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH / STATUS
// ─────────────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    time:    new Date().toISOString(),
    smtp:    process.env.SMTP_USER ? 'configured' : 'dev-mode',
    github:  process.env.GITHUB_TOKEN ? 'authenticated' : 'unauthenticated (rate-limited)',
    admin:   process.env.ADMIN_KEY ? 'configured' : 'not configured',
  });
});

app.get('/api/status', (req, res) => {
  const uptimeSec = Math.floor((Date.now() - START_TIME) / 1000);
  const mem       = process.memoryUsage();
  res.json({
    status:    'online',
    version:   '2.0.0',
    uptime:    {
      seconds: uptimeSec,
      human:   `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`,
    },
    memory: {
      heapUsedMB:  +(mem.heapUsed  / 1024 / 1024).toFixed(2),
      heapTotalMB: +(mem.heapTotal / 1024 / 1024).toFixed(2),
      rssMB:       +(mem.rss       / 1024 / 1024).toFixed(2),
    },
    system: {
      platform:    os.platform(),
      cpus:        os.cpus().length,
      freeMemMB:   +(os.freemem() / 1024 / 1024).toFixed(2),
      totalMemMB:  +(os.totalmem() / 1024 / 1024).toFixed(2),
      nodeVersion: process.version,
    },
    owner: {
      name:     'Farhan Haroon',
      github:   'https://github.com/farhanharoon2020-design',
      linkedin: 'https://www.linkedin.com/in/farhan-haroon-8a1047379/',
    },
    endpoints: [
      'GET  /health',
      'GET  /api/status',
      'POST /api/contact',
      'POST /api/analytics/visit',
      'GET  /api/analytics/summary',
      'GET  /api/github/stats',
      'GET  /api/github/repos',
      'GET  /api/blog',
      'GET  /api/blog/:slug',
      'POST /api/projects/:id/view',
      'GET  /api/projects/views',
      'GET  /api/resume/download',
      'GET  /api/resume/stats',
      'POST /api/newsletter/subscribe',
      'POST /api/newsletter/unsubscribe',
      'GET  /api/newsletter/count',
      'GET  /api/skills',
      'GET  /api/admin/stats       [X-Admin-Key required]',
      'GET  /api/admin/contacts    [X-Admin-Key required]',
      'GET  /api/admin/subscribers [X-Admin-Key required]',
      'DELETE /api/admin/cache     [X-Admin-Key required]',
    ],
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

app.use('/api/contact',    contactRouter);
app.use('/api/analytics',  analyticsRouter);
app.use('/api/github',     githubRouter);
app.use('/api/blog',       blogRouter);
app.use('/api/projects',   projectsRouter);
app.use('/api/resume',     resumeRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/skills',     skillsRouter);
app.use('/api/admin',      adminRouter);

// ─────────────────────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error:   'Route not found.',
    path:    req.originalUrl,
    method:  req.method,
    hint:    'Visit GET /api/status for a full list of available endpoints.',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error:   'Internal server error.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`🚀 DevOps Portfolio API v2.0.0 — http://localhost:${PORT}`);
  logger.info(`   Health  : http://localhost:${PORT}/health`);
  logger.info(`   Status  : http://localhost:${PORT}/api/status`);
  logger.info(`   Blog    : http://localhost:${PORT}/api/blog`);
  logger.info(`   GitHub  : http://localhost:${PORT}/api/github/stats`);
  logger.info(`   Admin   : http://localhost:${PORT}/api/admin/stats  [X-Admin-Key]`);
  logger.info(`   SMTP    : ${process.env.SMTP_USER ? '✅ Configured' : '⚠️  Dev mode (no SMTP)'}`);
  logger.info(`   GitHub  : ${process.env.GITHUB_TOKEN ? '✅ Token set (higher rate limits)' : '⚠️  No token (60 req/hr limit)'}`);
  logger.info(`   Admin   : ${process.env.ADMIN_KEY ? '✅ Secured' : '⚠️  ADMIN_KEY not set — admin endpoints disabled'}`);
});
