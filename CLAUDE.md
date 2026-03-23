# Claude AI Assistant Guide for Papaya Test

This document helps Claude AI understand and work effectively with this codebase.

## Project Overview

This is a production-ready monorepo using:
- **Runtime**: Bun (not Node.js)
- **Architecture**: Monorepo with Turborepo
- **Backend**: Hono + TRPC (not Express)
- **Frontend**: React + Tanstack Router (not Next.js)
- **Database**: PostgreSQL via Docker + Prisma
- **Testing**: Vitest + Playwright
- **Linting**: Biome (not ESLint/Prettier)

## Key Principles for Claude

### 1. Use Bun, Not Node.js
```bash
# ✅ Correct
bun install
bun run dev
bun test

# ❌ Wrong
npm install
yarn install
node server.js
```

### 2. Monorepo Structure
```
apps/       # Thin deployable apps
packages/   # Shared business logic
docs/       # All documentation
scripts/    # Automation scripts
```

### 3. Package Import Patterns
```typescript
// ✅ Correct - Use workspace imports
import { loginSchema } from "@papaya-fleet/validation";
import { Button } from "@papaya-fleet/ui/components";
import { snakeToCamelObject } from "@papaya-fleet/utils";

// ❌ Wrong - Don't use relative imports across packages
import { loginSchema } from "../../../packages/validation";
```

### 4. Database Operations
- Database runs in Docker on port 5440 (not 5432)
- Use Prisma for all database operations
- Run migrations with `bun run db:push`

### 5. API Standards
- Use TRPC for type-safe APIs
- Backend uses snake_case
- Frontend uses camelCase
- Use transformers from @papaya-fleet/utils

### 6. UI Components
- Use Shadcn components from @papaya-fleet/ui
- Don't install UI libraries directly in apps
- Add new components: `bunx shadcn@latest add <component> -c packages/ui`

### 7. Testing Approach
- Unit tests with Vitest in packages
- E2E tests with Playwright in apps/e2e
- Run with `bun test` not `jest` or `vitest` directly

### 8. Code Quality
- Use Biome for linting: `bun run lint:fix`
- Don't use ESLint or Prettier
- Format with: `bun run format`

## Common Tasks

### Adding a New Feature
1. Create validation schema in `packages/validation`
2. Add API route in `packages/api/src/routers`
3. Add UI components in `packages/ui` if needed
4. Implement in `apps/web` and/or `apps/server`
5. Add tests in relevant package
6. Add E2E test in `apps/e2e`

### Adding a New Package
```bash
mkdir -p packages/new-package/src
cd packages/new-package
bun init -y
# Edit package.json to match other packages
```

### Database Changes
```bash
# Edit schema
vim packages/db/prisma/schema.prisma

# Apply changes
bun run db:push

# Generate client
bun run db:generate
```

### Running Scripts
```bash
# Use project scripts
./scripts/init.sh
./scripts/start.sh
./scripts/stop.sh
./scripts/db-reset.sh

# Not manual Docker commands
```

## Important Files

- `/docs/architecture/ARCHITECTURE.md` - System design
- `/packages/env/src/` - Environment configuration
- `/packages/validation/src/` - All Zod schemas
- `/packages/utils/src/` - Utility functions
- `/packages/api/src/routers/` - API endpoints

## Environment Variables

Always validated with Zod in `packages/env`:
- DATABASE_URL (PostgreSQL on port 5440)
- CORS_ORIGIN
- NODE_ENV

## Anti-Patterns to Avoid

### ❌ DON'T DO THIS:
- Install packages in apps (use packages/ instead)
- Use Express/Fastify (use Hono)
- Use Node.js APIs (use Bun APIs)
- Create .env files everywhere (use root .env)
- Write business logic in apps/ (use packages/)
- Use npm/yarn/pnpm (use bun)
- Import from other apps
- Use absolute imports without @ alias
- Mix snake_case and camelCase without transformers

### ✅ DO THIS INSTEAD:
- Share code via packages/
- Use Hono for servers
- Use Bun.file, Bun.serve, etc.
- Single .env at root
- Apps only orchestrate packages
- Always use bun commands
- Import from @papaya-fleet/* packages
- Use workspace protocol
- Transform case at API boundaries

## URL State Management

Use Nuqs for type-safe URL state:
```typescript
import { useSearchParams } from "@/hooks/use-url-state";
// Not: useState for filters/search
```

## Form Handling

Always use Zod schemas from @papaya-fleet/validation:
```typescript
import { loginSchema } from "@papaya-fleet/validation";
// Not: inline validation
```

## Debugging Tips

1. Check Docker is running: `docker ps`
2. Database issues: `bun run db:studio`
3. Type errors: `bun run check-types`
4. Lint issues: `bun run lint:fix`
5. Test failures: `bun test --watch`

## Performance Considerations

- Bun is 10x faster than Node.js
- Biome is 50x faster than ESLint
- Use Turbo cache for builds
- Docker only for stateful services (DB)
- Apps run natively for hot reload

## Security

- Environment validation with Zod
- Type-safe APIs with TRPC
- Input sanitization in validation schemas
- CORS configured in Hono
- Auth with Better-auth

---

Remember: This is a MODERN stack. Use modern tools and patterns, not legacy Node.js approaches.