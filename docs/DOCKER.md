# Docker Setup Guide

This project includes a comprehensive Docker setup for both development and production environments.

## Architecture

The Docker setup consists of:
- **PostgreSQL Database** - Running on port 5440
- **Server Application** (Hono + TRPC) - Running on port 3101
- **Web Application** (React + Vite) - Running on port 3100

## Quick Start

### Development Environment

#### Method 1: Using npm/bun scripts (Recommended)

```bash
# Start all services with hot reload
bun run docker:up

# View logs
bun run docker:logs

# Stop services
bun run docker:down

# Reset everything (delete all data)
bun run docker:reset
```

#### Method 2: Using docker-compose directly

```bash
# Start all services
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop services
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

#### Method 3: Using the helper script

```bash
# Start development environment
./scripts/docker-dev.sh up

# Stop development environment
./scripts/docker-dev.sh down

# View logs
./scripts/docker-dev.sh logs

# Reset everything (delete all data)
./scripts/docker-dev.sh reset
```

### Production Environment

```bash
# Create .env.production file first
cp .env.example .env.production

# Start production services
bun run docker:prod

# Check health status
bun run docker:prod:health

# Deploy updates
bun run docker:prod:deploy

# Stop services
bun run docker:prod:down
```

## Detailed Commands

### Development Commands

```bash
# Start development environment
./scripts/docker-dev.sh up

# Stop development environment
./scripts/docker-dev.sh down

# Restart services
./scripts/docker-dev.sh restart

# View logs (follow mode)
./scripts/docker-dev.sh logs
./scripts/docker-dev.sh logs server  # Specific service

# Open shell in container
./scripts/docker-dev.sh shell server
./scripts/docker-dev.sh shell web

# Open PostgreSQL shell
./scripts/docker-dev.sh db

# Reset environment (deletes all data)
./scripts/docker-dev.sh reset

# Rebuild images
./scripts/docker-dev.sh build

# Check container status
./scripts/docker-dev.sh ps
```

### Production Commands

```bash
# Start production environment
./scripts/docker-prod.sh up

# Stop production environment
./scripts/docker-prod.sh down

# View logs
./scripts/docker-prod.sh logs

# Create database backup
./scripts/docker-prod.sh backup

# Restore from backup
./scripts/docker-prod.sh restore backup-20240101-120000.sql

# Deploy latest changes (zero-downtime)
./scripts/docker-prod.sh deploy

# Check service health
./scripts/docker-prod.sh health
```

## File Structure

```
.
├── docker-compose.yml           # Base configuration
├── docker-compose.dev.yml       # Development overrides
├── docker-compose.prod.yml      # Production overrides
├── .dockerignore               # Build context exclusions
├── apps/
│   ├── web/
│   │   └── Dockerfile         # Web app multi-stage build
│   └── server/
│       └── Dockerfile         # Server multi-stage build
└── scripts/
    ├── docker-dev.sh          # Development helper script
    └── docker-prod.sh         # Production helper script
```

## Environment Variables

### Development (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5440/papaya-fleet
BETTER_AUTH_SECRET=supersecretkey12345678901234567890
BETTER_AUTH_URL=http://localhost:3101
CORS_ORIGIN=http://localhost:3100
NODE_ENV=development
```

### Production (.env.production)
```env
DATABASE_URL=postgresql://postgres:strongpassword@postgres:5432/papaya-fleet
BETTER_AUTH_SECRET=<generate-strong-secret>
BETTER_AUTH_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

## Features

### Development Mode
- **Hot Reload**: Source code is mounted as volumes for instant updates
- **Source Maps**: Full debugging support
- **Verbose Logging**: Detailed logs for debugging
- **Local Database**: Isolated PostgreSQL instance

### Production Mode
- **Optimized Images**: Multi-stage builds for minimal size
- **Security**: No source code in containers
- **Resource Limits**: Memory and CPU constraints
- **Health Checks**: Automatic container health monitoring
- **Restart Policies**: Automatic recovery from failures

## Build Stages

Each Dockerfile uses multi-stage builds:

1. **base**: Bun runtime environment
2. **deps**: Install dependencies
3. **builder**: Build the application
4. **dev**: Development server with hot reload
5. **prod**: Production runtime with minimal footprint

## Networking

All services communicate through the `papaya-network` bridge network:
- Services can reference each other by name (e.g., `postgres`, `server`, `web`)
- Ports are only exposed to the host as needed
- Internal service communication doesn't go through the host

## Volumes

### Development
- Source code mounted for hot reload
- node_modules preserved in containers
- Database data persisted in named volume

### Production
- No source mounts (security)
- Database data in persistent volume
- Backup volume for database backups

## Performance Optimization

1. **Build Cache**: Multi-stage builds maximize Docker layer caching
2. **Minimal Images**: Alpine Linux base for smallest footprint
3. **Dependency Caching**: node_modules cached between builds
4. **Parallel Builds**: Services built concurrently
5. **Resource Limits**: Prevent container resource exhaustion

## Important Configuration Notes

### Web Application (Vite)
The Vite server must be configured to listen on `0.0.0.0` (not just localhost) to be accessible from outside the Docker container:
- Configuration in `vite.config.ts`: `host: "0.0.0.0"`
- This allows the containerized web app to be accessed from the host machine

### Database Connection
The server uses an entrypoint script that:
1. Waits for the database to be ready (up to 30 attempts)
2. Runs Prisma migrations automatically
3. Seeds the database with sample data (in development mode)

### Key Fixes Applied
- **Vite Host Binding**: Added `host: "0.0.0.0"` to vite.config.ts for container accessibility
- **Prisma Commands**: Removed deprecated `--skip-generate` flag from docker-entrypoint.sh
- **Database URL**: Ensured proper connection string format in docker-compose environment

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose logs server
docker compose logs web

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Hot reload not working
```bash
# Ensure volumes are mounted correctly
docker compose -f docker-compose.yml -f docker-compose.dev.yml config

# Restart with fresh volumes
./scripts/docker-dev.sh restart
```

### Database connection issues
```bash
# Check database is healthy
docker compose exec postgres pg_isready -U postgres

# Check connection from server
docker compose exec server sh -c "echo 'SELECT 1' | psql $DATABASE_URL"
```

### Port conflicts
```bash
# Check what's using the ports
lsof -i :3100
lsof -i :3101
lsof -i :5440

# Use different ports
PORT=3200 docker compose up web
```

## Best Practices

1. **Always use scripts**: Use the provided scripts instead of raw docker commands
2. **Environment files**: Never commit .env files, use .env.example as template
3. **Regular backups**: In production, schedule regular database backups
4. **Monitor resources**: Use `docker stats` to monitor container resources
5. **Clean up**: Regularly run `docker system prune` to clean unused resources

## Security Considerations

1. **Secrets**: Use Docker secrets or environment variables for sensitive data
2. **Network isolation**: Services only expose necessary ports
3. **Non-root users**: Consider running containers as non-root (future improvement)
4. **Image scanning**: Scan images for vulnerabilities in CI/CD
5. **Update regularly**: Keep base images and dependencies updated

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and push
        run: |
          docker compose -f docker-compose.yml -f docker-compose.prod.yml build
          docker compose -f docker-compose.yml -f docker-compose.prod.yml push

      - name: Deploy
        run: |
          ssh production-server "cd /app && ./scripts/docker-prod.sh deploy"
```

## Monitoring

For production deployments, consider adding:
- Prometheus metrics endpoint
- Health check endpoints
- Log aggregation (ELK stack)
- Container monitoring (cAdvisor)
- Uptime monitoring (Uptime Kuma)

## Future Improvements

- [ ] Add Redis for caching
- [ ] Implement Docker Swarm or Kubernetes for orchestration
- [ ] Add nginx reverse proxy
- [ ] Implement SSL/TLS termination
- [ ] Add monitoring stack (Prometheus + Grafana)
- [ ] Implement log aggregation
- [ ] Add backup automation
- [ ] Implement blue-green deployments