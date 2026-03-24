# Papaya Fleet Management

A fleet management system built with TypeScript, React, and Bun.

## Quick Start

### Docker Setup (Recommended)

Clone and run with Docker:

```bash
# Clone the repository
git clone https://github.com/Razal-stack/papaya-fleet
cd papaya-test

# Start everything with Docker Compose
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Access the application
# Web: http://localhost:3100
# API: http://localhost:3101
# Database: localhost:5440
```

The Docker setup automatically:
- Installs all dependencies
- Sets up PostgreSQL database
- Runs migrations
- Seeds sample data
- Starts with hot-reload enabled

### Local Development Setup

Requirements:
- Bun (runtime)
- Docker (for database)
- Node.js 20+ (optional)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Initialize project
./scripts/init.sh

# Start development
bun run dev
```

## Tech Stack

- **Runtime**: Bun
- **Backend**: Hono + TRPC
- **Frontend**: React + Tanstack Router
- **Database**: PostgreSQL + Prisma
- **UI**: Shadcn/ui + Tailwind CSS
- **Testing**: Vitest + Playwright
- **Linting**: Biome
- **URL State**: Nuqs

## Project Structure

```
.
├── apps/
│   ├── server/     # API server (Hono + TRPC)
│   ├── web/        # React application
│   └── e2e/        # E2E tests (Playwright)
├── packages/
│   ├── api/        # API routes & business logic
│   ├── auth/       # Authentication configuration
│   ├── config/     # Shared configurations
│   ├── db/         # Database (Prisma + Docker)
│   ├── env/        # Environment validation
│   ├── ui/         # Shared UI components (Shadcn)
│   ├── utils/      # Utility functions & transformers
│   └── validation/ # Zod schemas for forms
├── scripts/        # Automation scripts
└── docs/          # Documentation
```

## Available Scripts

### Development

```bash
bun run dev          # Start all dev servers
bun run build        # Build all packages
bun run test         # Run all tests
bun run lint         # Lint with Biome
bun run lint:fix     # Fix linting issues
bun run format       # Format code
bun run check-types  # TypeScript checking
```

### Database

```bash
bun run db:start     # Start PostgreSQL in Docker
bun run db:stop      # Stop PostgreSQL
bun run db:studio    # Open Prisma Studio
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:seed      # Seed database
```

### Docker Commands

```bash
bun run docker:dev        # Start all services
bun run docker:dev:logs   # View logs
bun run docker:dev:down   # Stop services
bun run docker:dev:reset  # Reset everything
```

## Environment Variables

Create `.env` in the root directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5440/papaya-fleet
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## Key Features

### Case Conversion
Automatic conversion between snake_case (backend) and camelCase (frontend):
```typescript
import { snakeToCamelObject } from "@papaya-fleet/utils";
```

### Form Validation
Type-safe validation with Zod:
```typescript
import { loginSchema } from "@papaya-fleet/validation";
```

### URL State Management
Type-safe URL parameters with Nuqs:
```typescript
import { useSearchParams } from "@/hooks/use-url-state";
```

### UI Components
Pre-configured Shadcn components:
```typescript
import { Button, Card } from "@papaya-fleet/ui/components";
```

Add more components:
```bash
bunx shadcn@latest add <component> -c packages/ui
```

## Testing

```bash
# Unit tests
bun test
bun test:watch

# E2E tests
cd apps/e2e
bun run test
bun run test:ui
```

## Production Build

```bash
# Build all packages
bun run build

# Run production
cd apps/server && bun run start
cd apps/web && bun run serve
```

## Documentation

- [Documentation Index](./docs/README.md)
- [Architecture Overview](./docs/architecture/ARCHITECTURE.md)
- [Getting Started](./docs/guides/GETTING_STARTED.md)
- [Development Guide](./docs/guides/DEVELOPMENT.md)
- [Testing Guide](./docs/guides/TESTING.md)
- [Deployment Guide](./docs/guides/DEPLOYMENT.md)
- [Claude AI Guide](./CLAUDE.md)

## Troubleshooting

### Port conflicts
If ports 3100, 3101, or 5440 are in use, stop conflicting services or modify `docker-compose.yml`.

### Database connection issues
```bash
docker ps                     # Check Docker is running
docker compose logs postgres  # Check database logs
```

### Dependency issues
```bash
bun install          # Reinstall dependencies
rm -rf node_modules  # Clear and reinstall
bun install
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Run tests (`bun test`)
4. Commit changes (`git commit -m 'Add feature'`)
5. Push to branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## License

MIT

## Acknowledgments

- [Bun](https://bun.sh) - JavaScript runtime
- [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) - Initial template
- [Shadcn](https://ui.shadcn.com) - UI components
- [Tanstack](https://tanstack.com) - Application tools
- [Prisma](https://prisma.io) - Database ORM