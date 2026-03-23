# Development Guide

Complete guide for setting up and developing with the Papaya Test monorepo.

## Prerequisites

### Required Software
- **Bun** v1.0+ ([install](https://bun.sh))
- **Docker** & Docker Compose ([install](https://docker.com))
- **Git**

### Recommended IDE Setup
- **VS Code** with extensions:
  - Biome (formatting/linting)
  - Prisma (database)
  - Tailwind CSS IntelliSense
  - TypeScript

## Initial Setup

### 1. Clone and Initialize

```bash
# Clone repository
git clone <repository-url>
cd papaya-fleet

# Run setup script (installs deps, starts DB, runs migrations)
./scripts/init.sh
```

### 2. Verify Environment

The setup script creates a `.env` file:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5440/papaya-fleet
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. Start Development

```bash
# Start all services
bun run dev
```

Access points:
- Web app: http://localhost:5173
- API server: http://localhost:3101
- Database studio: http://localhost:5555 (`bun run db:studio`)

## Development Workflow

### Daily Workflow

```bash
# Start your day
git pull origin main
bun install
./scripts/start.sh

# Create feature branch
git checkout -b feature/your-feature

# Development cycle
bun run dev          # Hot reload enabled
bun test --watch     # Test in watch mode

# Before committing
bun run lint:fix
bun run format
bun run check-types
```

## Working with Packages

### Package Architecture

```
packages/
├── api/        # TRPC routes & business logic
├── auth/       # Authentication system
├── db/         # Database schema & client
├── env/        # Environment validation
├── ui/         # Shared UI components
├── utils/      # Utility functions
└── validation/ # Zod schemas
```

### Creating a New Package

```bash
# 1. Create structure
mkdir -p packages/my-package/src
cd packages/my-package
bun init -y

# 2. Configure package.json
```

```json
{
  "name": "@papaya-fleet/my-package",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

```bash
# 3. Add to an app
cd apps/web
bun add @papaya-fleet/my-package@workspace:*
```

## Adding Features

### 1. Database Schema

Edit `packages/db/prisma/schema.prisma`:
```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  price       Decimal
  createdAt   DateTime @default(now())
}
```

Apply changes:
```bash
bun run db:push      # Development
bun run db:migrate   # Production
bun run db:generate  # Generate client
```

### 2. Validation Schema

Create `packages/validation/src/product.ts`:
```typescript
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive()
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

### 3. API Route

Create `packages/api/src/routers/product.ts`:
```typescript
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { createProductSchema } from "@papaya-fleet/validation";

export const productRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany();
  }),

  create: publicProcedure
    .input(createProductSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.db.product.create({ data: input });
    })
});
```

### 4. UI Component

Add Shadcn component:
```bash
bunx shadcn@latest add card -c packages/ui
```

Create custom component:
```typescript
// packages/ui/src/components/product-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface ProductCardProps {
  product: {
    name: string;
    price: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">${product.price}</p>
      </CardContent>
    </Card>
  );
}
```

### 5. Frontend Integration

Create route in `apps/web/src/routes/products.tsx`:
```typescript
import { ProductCard } from "@papaya-fleet/ui/components";
import { trpc } from "@/lib/trpc";

export function ProductsRoute() {
  const { data, isLoading } = trpc.product.list.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Code Standards

### TypeScript Best Practices
- Enable strict mode
- Avoid `any` type
- Use interfaces for objects
- Prefer `const` assertions

### React Guidelines
- Functional components only
- Custom hooks for logic
- Memoize expensive operations
- Handle loading/error states

### API Design
- Use TRPC procedures
- Validate with Zod
- Consistent error handling
- Transform snake_case to camelCase

### Database Conventions
- Use Prisma for all queries
- Add appropriate indexes
- Use transactions for multiple operations
- Implement soft deletes when needed

## Testing During Development

### Run Tests
```bash
# All tests
bun test

# Specific package
cd packages/utils && bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

### Write Tests
```typescript
// packages/utils/src/format.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });
});
```

## Debugging

### VS Code Configuration

`.vscode/launch.json`:
```json
{
  "configurations": [
    {
      "type": "bun",
      "name": "Debug Server",
      "request": "launch",
      "program": "${workspaceFolder}/apps/server/src/index.ts",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Debug Commands
```bash
# Inspect server
bun --inspect apps/server/src/index.ts

# Check bundle size
bun build apps/web/src/index.tsx --outdir=dist --analyze

# Database issues
bun run db:studio
```

## Common Tasks

### Update Dependencies
```bash
# Check outdated
bun outdated

# Update all
bun update

# Update specific
bun update @papaya-fleet/ui
```

### Clean Build
```bash
# Remove all build artifacts
rm -rf apps/*/dist packages/*/dist

# Clean install
rm -rf node_modules bun.lockb
bun install
```

### Database Tasks
```bash
# Reset database
./scripts/db-reset.sh

# Seed data
bun run db:seed

# Backup
pg_dump $DATABASE_URL > backup.sql
```

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :5173  # Web
lsof -i :3101  # API
lsof -i :5440  # Database

# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check Docker
docker ps

# Restart database
bun run db:stop
bun run db:start

# Reset completely
./scripts/db-reset.sh
```

### Type Errors
```bash
# Regenerate Prisma client
bun run db:generate

# Check all types
bun run check-types

# Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo
```

### Dependency Issues
```bash
# Clear cache
rm -rf node_modules bun.lockb

# Fresh install
bun install

# Force resolution
bun install --force
```

## Performance Tips

### Development Speed
- Use `bun --hot` for instant reloads
- Keep Docker running between sessions
- Use Turborepo cache
- Disable source maps in development if slow

### Bundle Optimization
- Analyze with `bunx vite-bundle-visualizer`
- Lazy load heavy components
- Use dynamic imports
- Tree-shake unused code

## Git Workflow

### Commit Convention
```bash
feat: add product search
fix: resolve cart calculation
docs: update API docs
test: add product tests
refactor: simplify auth logic
chore: update dependencies
```

### Pre-commit Checklist
- [ ] Tests pass (`bun test`)
- [ ] Linting clean (`bun run lint`)
- [ ] Types check (`bun run check-types`)
- [ ] No console.logs
- [ ] Documentation updated

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [TRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn Components](https://ui.shadcn.com)
- [Tanstack Documentation](https://tanstack.com)