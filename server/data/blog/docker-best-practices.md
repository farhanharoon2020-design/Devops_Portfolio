---
title: "Docker Best Practices for Production"
slug: docker-best-practices
date: 2026-05-10
readTime: 8
tags: [docker, containers, security, devops]
excerpt: "Stop shipping bloated, insecure containers. Here are the Docker patterns that separate hobbyist images from production-grade ones."
---

# Docker Best Practices for Production

Everyone can `docker run hello-world`. But shipping **lean, secure, reproducible** containers to production is a different game entirely.

## 1. Use Multi-Stage Builds

Don't ship your build tools into production. Multi-stage builds keep final images tiny:

```dockerfile
# ── Stage 1: Build ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# ── Stage 2: Runtime ─────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Result: a 45 MB runtime image instead of a 1.2 GB dev image.

## 2. Pin Your Base Images

`FROM node:latest` is a ticking timebomb.

```dockerfile
# ❌ Bad — unpredictable
FROM node:latest

# ✅ Good — deterministic builds
FROM node:20.14.0-alpine3.20
```

## 3. Never Run as Root

```dockerfile
RUN addgroup -S app && adduser -S app -G app
USER app
```

If an attacker escapes your container process, they get a restricted user — not root.

## 4. Use .dockerignore

```dockerignore
node_modules
.git
*.log
.env
coverage/
.nyc_output
```

This prevents secrets and junk from leaking into your image layers.

## 5. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
```

Orchestrators (Kubernetes, ECS) use this to know when a container is ready.

## 6. Scan for Vulnerabilities

```bash
# Using Trivy (free, open-source)
trivy image your-registry/your-app:latest

# In GitHub Actions
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'your-image:${{ github.sha }}'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'
```

## 7. Use Read-Only Filesystems

```yaml
# docker-compose.yml
services:
  api:
    image: your-api:latest
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

## 8. Layer Caching Strategy

Order your Dockerfile from least-to-most frequently changed:

```dockerfile
# Dependencies change less often than code
COPY package*.json ./   ← cache hit most of the time
RUN npm ci
COPY . .                ← only invalidates cache on code changes
```

## Summary Checklist

| Practice | Impact |
|---|---|
| Multi-stage builds | 90% smaller images |
| Non-root user | Reduced attack surface |
| Pinned base image | Reproducible builds |
| .dockerignore | No secrets in layers |
| Health checks | Zero-downtime deployments |
| Vulnerability scanning | No known CVEs shipped |

---

*Small images, non-root users, and automated scans cost 30 minutes of setup and save you from months of headaches.*
