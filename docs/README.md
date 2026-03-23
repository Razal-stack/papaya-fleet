# Papaya Test Documentation

Modern monorepo with Bun, TRPC, and React.

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd papaya-fleet
./scripts/init.sh

# Start development
bun run dev
```

Access:
- Web: http://localhost:5173
- API: http://localhost:3101
- Database Studio: http://localhost:5555 (run `bun db:studio`)

## Documentation

### Getting Started
- [**Development Guide**](./guides/DEVELOPMENT.md) - Setup, workflow, and daily development
- [**Architecture**](./architecture/ARCHITECTURE.md) - Technical decisions and system design
- [**Testing Guide**](./guides/TESTING.md) - Unit, integration, and E2E testing
- [**Deployment Guide**](./guides/DEPLOYMENT.md) - Production deployment strategies

### For AI Assistants
- [**Claude Guide**](/CLAUDE.md) - Instructions for AI assistants working with this codebase

## Project Structure

```
apps/                   # Deployable applications
├── server/            # Hono API server
├── web/              # React SPA
└── e2e/              # Playwright tests

packages/              # Shared code
├── api/              # TRPC routes & business logic
├── auth/             # Authentication
├── db/               # Database (Prisma + PostgreSQL)
├── env/              # Environment validation
├── ui/               # Shared UI components (Shadcn)
├── utils/            # Utilities
└── validation/       # Zod schemas

scripts/              # Automation scripts
└── docs/            # This documentation
```

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Bun | Fast JavaScript runtime |
| **Monorepo** | Turborepo | Build orchestration |
| **Backend** | Hono + TRPC | Type-safe API |
| **Frontend** | React + Tanstack | Modern SPA |
| **Database** | PostgreSQL + Prisma | Type-safe ORM |
| **UI** | Shadcn/ui + Tailwind | Component library |
| **Testing** | Vitest + Playwright | Unit & E2E |
| **Code Quality** | Biome | Fast linting/formatting |

## Common Commands

### Development
```bash
bun run dev          # Start all services
bun run dev:web      # Frontend only
bun run dev:server   # Backend only
```

### Database
```bash
bun run db:studio    # Visual database editor
bun run db:push      # Apply schema changes
bun run db:generate  # Generate Prisma client
./scripts/db-reset.sh # Reset database
```

### Testing
```bash
bun test            # Run unit tests
bun test:e2e        # Run E2E tests
bun test --watch    # Watch mode
```

### Code Quality
```bash
bun run lint:fix    # Fix linting issues
bun run format      # Format code
bun run check-types # TypeScript check
```

## Contributing

1. Create feature branch
2. Make changes in appropriate package
3. Write tests
4. Ensure linting passes
5. Submit PR

## Support

- Check documentation first
- Review [Claude Guide](/CLAUDE.md) for AI assistance
- Create an issue for bugs/features