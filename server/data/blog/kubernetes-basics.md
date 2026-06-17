---
title: "Kubernetes From Zero to Production"
slug: kubernetes-basics
date: 2026-05-18
readTime: 10
tags: [kubernetes, k8s, containers, orchestration]
excerpt: "You've containerised your app with Docker. Now it's time to orchestrate it. Here's everything you need to go from zero to a working Kubernetes cluster."
---

# Kubernetes From Zero to Production

Kubernetes (K8s) is the operating system of the cloud. Once you understand its mental model, everything else clicks.

## The Mental Model

| Concept | Think of it as |
|---|---|
| **Pod** | A running container (or group of tightly-coupled containers) |
| **Deployment** | "Keep N replicas of this pod alive at all times" |
| **Service** | A stable network endpoint in front of pods |
| **Ingress** | The external-facing reverse proxy/load balancer |
| **ConfigMap** | Non-secret env vars, mounted as files or env |
| **Secret** | Encoded sensitive data (tokens, passwords) |
| **Namespace** | Virtual cluster — logical isolation |

## Your First Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devops-portfolio
  namespace: production
  labels:
    app: portfolio
spec:
  replicas: 3
  selector:
    matchLabels:
      app: portfolio
  template:
    metadata:
      labels:
        app: portfolio
    spec:
      containers:
        - name: portfolio
          image: ghcr.io/farhanharoon2020-design/portfolio:latest
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "5000"
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 30
            periodSeconds: 10
```

## Service & Ingress

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: portfolio-svc
spec:
  selector:
    app: portfolio
  ports:
    - port: 80
      targetPort: 5000
  type: ClusterIP

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: portfolio-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts: [farhanharoon.dev]
      secretName: portfolio-tls
  rules:
    - host: farhanharoon.dev
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: portfolio-svc
                port:
                  number: 80
```

## Rolling Updates — Zero Downtime

```bash
# Update image tag
kubectl set image deployment/devops-portfolio \
  portfolio=ghcr.io/farhanharoon2020-design/portfolio:v2.0.0

# Watch the rolling update
kubectl rollout status deployment/devops-portfolio

# Instant rollback if something goes wrong
kubectl rollout undo deployment/devops-portfolio
```

## Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: portfolio-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: devops-portfolio
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## GitOps with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build & push Docker image
        run: |
          docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}

      - name: Deploy to K8s
        run: |
          kubectl set image deployment/devops-portfolio \
            portfolio=ghcr.io/${{ github.repository }}:${{ github.sha }}
```

---

*Kubernetes rewards patience. Start with one Deployment and one Service. Add complexity only when you feel the pain it solves.*
