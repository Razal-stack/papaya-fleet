# Deployment Guide

Production deployment strategies for the Papaya Test monorepo.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass (`bun test && bun run test:e2e`)
- [ ] No TypeScript errors (`bun run check-types`)
- [ ] Linting passes (`bun run lint`)
- [ ] Bundle size acceptable (`bunx vite-bundle-visualizer`)

### Environment Setup
- [ ] Production environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Backup strategy in place

## Production Build

### Build All Packages

```bash
# Install production dependencies
bun install --production

# Build everything
bun run build

# Verify builds
ls -la apps/*/dist
```

### Environment Configuration

Create `.env.production`:
```env
# Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/papaya

# API
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

# Auth
AUTH_SECRET=your-secret-key-min-32-chars
AUTH_URL=https://api.yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

## Docker Deployment

### Multi-Stage Dockerfile

```dockerfile
# Base image
FROM oven/bun:1.0-slim as base
WORKDIR /app

# Dependencies
FROM base as deps
COPY package.json bun.lockb ./
COPY apps/*/package.json ./apps/
COPY packages/*/package.json ./packages/
RUN bun install --frozen-lockfile

# Build
FROM base as build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production - API
FROM base as api
COPY --from=build /app/apps/server/dist ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["bun", "run", "index.js"]

# Production - Web
FROM nginx:alpine as web
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Docker Compose Production

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  api:
    build:
      context: .
      target: api
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: .
      target: web
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=papaya
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

## Cloud Deployment Options

### Vercel (Frontend)

```json
// vercel.json
{
  "buildCommand": "cd apps/web && bun run build",
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Deploy: `bunx vercel --prod`

### Railway / Render (Full Stack)

```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "bun install && bun run build"

[deploy]
startCommand = "bun run apps/server/dist/index.js"
healthcheckPath = "/health"
restartPolicyType = "always"

[[services]]
name = "api"
type = "web"
port = 3000
```

### AWS ECS/Fargate

```json
// task-definition.json
{
  "family": "papaya-fleet",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "your-ecr-repo/papaya-api:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

## Database Migrations

### Production Migration Strategy

```bash
# 1. Backup current database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Generate migration
bun run db:migrate:dev

# 3. Deploy migration
bun run db:migrate:deploy

# 4. Verify migration
bun run db:studio
```

### Rollback Plan

```bash
# Rollback last migration
bunx prisma migrate rollback

# Restore from backup if needed
psql $DATABASE_URL < backup-20240315-120000.sql
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bun run check-types

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build -t papaya-api --target api .
          docker build -t papaya-web --target web .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag papaya-api:latest ${{ secrets.DOCKER_REGISTRY }}/papaya-api:latest
          docker tag papaya-web:latest ${{ secrets.DOCKER_REGISTRY }}/papaya-web:latest
          docker push ${{ secrets.DOCKER_REGISTRY }}/papaya-api:latest
          docker push ${{ secrets.DOCKER_REGISTRY }}/papaya-web:latest

      - name: Deploy to production
        run: |
          ssh ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} << 'EOF'
            cd /opt/papaya-fleet
            docker-compose -f docker-compose.production.yml pull
            docker-compose -f docker-compose.production.yml up -d
            docker system prune -f
          EOF
```

## Monitoring & Health Checks

### Health Endpoint

```typescript
// apps/server/src/health.ts
import { Hono } from "hono";

export const healthRoutes = new Hono();

healthRoutes.get("/health", async (c) => {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  try {
    // Check database
    await c.get("db").$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (error) {
    checks.database = "error";
    checks.status = "unhealthy";
    return c.json(checks, 503);
  }

  return c.json(checks);
});

healthRoutes.get("/ready", (c) => {
  // Check if service is ready to accept traffic
  if (!c.get("initialized")) {
    return c.json({ ready: false }, 503);
  }
  return c.json({ ready: true });
});
```

### Monitoring Setup

```typescript
// apps/server/src/monitoring.ts
import { register, collectDefaultMetrics, Counter, Histogram } from "prom-client";

// Collect default metrics
collectDefaultMetrics({ prefix: "papaya_" });

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: "papaya_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new Counter({
  name: "papaya_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

// Metrics endpoint
app.get("/metrics", (c) => c.text(register.metrics()));
```

## Performance Optimization

### Frontend Optimization

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          ui: ["@papaya-fleet/ui"],
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

### Backend Optimization

```typescript
// Connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
});

// Response caching
import { createCache } from "@hono/cache";

const cache = createCache({
  ttl: 60 * 1000, // 1 minute
  keyGenerator: (c) => c.req.url,
});

app.use("/api/public/*", cache);
```

## Security Configuration

### Security Headers

```typescript
// apps/server/src/middleware/security.ts
import { secureHeaders } from "hono/secure-headers";

export const security = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
  xContentTypeOptions: "nosniff",
  xFrameOptions: "DENY",
  xXssProtection: "1; mode=block",
});
```

### Rate Limiting

```typescript
// apps/server/src/middleware/rateLimit.ts
import { rateLimiter } from "hono-rate-limiter";

export const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5, // stricter for auth endpoints
  skipSuccessfulRequests: true,
});
```

## Post-Deployment Verification

### Smoke Tests

```typescript
// scripts/smoke-test.ts
const PROD_URL = process.env.PRODUCTION_URL || "https://api.yourdomain.com";

const tests = [
  { name: "Health Check", endpoint: "/health", expectedStatus: 200 },
  { name: "Metrics", endpoint: "/metrics", expectedStatus: 200 },
  { name: "API Root", endpoint: "/", expectedStatus: 200 },
];

async function runSmokeTests() {
  console.log("🔥 Running smoke tests...\n");

  for (const test of tests) {
    try {
      const res = await fetch(PROD_URL + test.endpoint);
      const passed = res.status === test.expectedStatus;

      console.log(
        `${passed ? "✅" : "❌"} ${test.name}: ${res.status} ${passed ? "" : `(expected ${test.expectedStatus})`}`
      );

      if (!passed) process.exit(1);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log("\n✨ All smoke tests passed!");
}

runSmokeTests();
```

### Rollback Strategy

```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: ./rollback.sh <version>"
  exit 1
fi

echo "🔄 Rolling back to version $PREVIOUS_VERSION..."

# Pull previous Docker images
docker pull registry/papaya-api:$PREVIOUS_VERSION
docker pull registry/papaya-web:$PREVIOUS_VERSION

# Tag as latest
docker tag registry/papaya-api:$PREVIOUS_VERSION registry/papaya-api:latest
docker tag registry/papaya-web:$PREVIOUS_VERSION registry/papaya-web:latest

# Restart services
docker-compose -f docker-compose.production.yml up -d

echo "✅ Rollback complete"
```

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups with 30-day retention
- **Code**: Git with multiple remotes
- **Media**: Object storage with versioning
- **Configuration**: Encrypted secrets in vault

### Recovery Objectives
- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 24 hours

### Emergency Procedures
1. Activate incident response team
2. Assess damage and identify root cause
3. Execute recovery plan
4. Verify system integrity
5. Document incident and lessons learned

## Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
- [Bun Deployment](https://bun.sh/guides/runtime/deploy)
- [Security Headers](https://securityheaders.com/)