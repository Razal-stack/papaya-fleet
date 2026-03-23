# Architecture & Technical Decisions

## System Architecture

This project follows a **modern monorepo architecture** optimized for scalability, type safety, and developer experience.

## Key Architectural Decisions

### Why Monorepo?

1. **Code Sharing**: Share types, utilities, and components across all apps
2. **Type Safety**: End-to-end type safety with TRPC without code generation
3. **Atomic Changes**: Update API and clients together in single commits
4. **Single Version**: One version for all packages, no dependency conflicts
5. **Better DX**: Single install, single build, unified tooling

### Package vs App Separation

```
packages/              # Shared, reusable code
├── api/              # Business logic lives here
├── auth/             # Reusable authentication
├── db/               # Centralized data layer
├── env/              # Type-safe configuration
├── ui/               # Shared component library
├── utils/            # Common utilities
└── validation/       # Single source of truth for schemas

apps/                  # Thin, deployable shells
├── server/           # Just wires up packages
├── web/              # Just routing and pages
└── e2e/              # End-to-end test suites
```

**Design Principle**: Apps are assembly plants that wire together packages. Business logic NEVER lives in apps.

### Technology Choices

#### Runtime: Bun over Node.js
- **10x faster** startup and execution
- **Built-in TypeScript** without compilation step
- **Native test runner** without additional dependencies
- **Better package manager** with workspace support

#### API: Hono + TRPC over Express + REST
- **Type safety** from database to frontend
- **No code generation** required
- **Smaller bundle** size than Express
- **Web standards** compliant

#### Database: PostgreSQL + Prisma
- **Production ready** with ACID compliance
- **Type-safe ORM** with auto-completion
- **Migration system** built-in
- **Visual editor** with Prisma Studio

#### UI: Shadcn over Material-UI
- **Copy-paste** components you own
- **Full control** over styling
- **Tree-shakeable** by design
- **Tailwind based** for consistency

#### Testing: Vitest + Playwright
- **Vite compatible** for fast tests
- **ESM first** design
- **Browser-like** environment
- **Reliable E2E** with auto-wait

#### Code Quality: Biome over ESLint + Prettier
- **50x faster** than ESLint
- **Single tool** for lint and format
- **Zero config** with good defaults
- **Rust-based** for performance

## Data Flow Architecture

```
Browser Request
    ↓
React Router (Type-safe routes)
    ↓
TRPC Client (Type-safe API calls)
    ↓
Hono Server (Web standards)
    ↓
TRPC Router (Business logic)
    ↓
Prisma ORM (Type-safe queries)
    ↓
PostgreSQL (ACID compliance)
```

## Scaling Strategy

### Horizontal Scaling
- Stateless API servers behind load balancer
- Database read replicas for queries
- CDN for static assets
- Redis for session/cache (when needed)

### Vertical Scaling
- Packages can be split into microservices
- Apps can be deployed independently
- Database can be sharded by tenant

## Security Architecture

### Defense in Depth
1. **Input Validation**: Zod schemas at every boundary
2. **Type Safety**: TypeScript strict mode everywhere
3. **Authentication**: Better-auth with secure defaults
4. **Authorization**: Role-based access control
5. **Environment**: Validated configuration with Zod
6. **Dependencies**: Regular audits with `bun audit`

## Performance Considerations

### Build Time
- Turborepo caching for incremental builds
- Bun's fast resolution and bundling
- Biome's instant linting

### Runtime
- Bun's optimized JavaScript engine
- PostgreSQL connection pooling
- React Query for client caching
- Lazy loading with React.lazy

### Bundle Size
- Tree-shaking with modern tooling
- Code splitting by route
- Dynamic imports for heavy libraries

## Development Workflow

### Branch Strategy
```
main (production)
  ├── develop (staging)
  └── feature/* (development)
```

### CI/CD Pipeline
1. **Pre-commit**: Biome format/lint
2. **PR Checks**: Type check, tests, build
3. **Merge**: Deploy to staging
4. **Release**: Deploy to production

## Monitoring & Observability

### Three Pillars
1. **Logs**: Structured JSON logging
2. **Metrics**: Prometheus-compatible
3. **Traces**: OpenTelemetry support

### Health Checks
- `/health` - Basic liveness
- `/ready` - Readiness probe
- `/metrics` - Prometheus metrics

## Future Considerations

### Potential Additions
- GraphQL federation for complex queries
- WebSocket support for real-time
- Service worker for offline support
- Kubernetes manifests for orchestration

### Migration Paths
- Microservices: Split packages into services
- Multi-region: Database replication
- Multi-tenant: Schema-per-tenant
- Event-driven: Add message queue

## Decision Records

| Decision | Rationale | Date |
|----------|-----------|------|
| Bun runtime | 10x performance over Node.js | 2024-01 |
| TRPC over REST | Type safety without codegen | 2024-01 |
| Shadcn over MUI | Own your components | 2024-01 |
| Biome over ESLint | 50x faster linting | 2024-01 |
| PostgreSQL on 5440 | Avoid port conflicts | 2024-01 |