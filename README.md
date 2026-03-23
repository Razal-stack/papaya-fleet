# 🥭 Papaya Test - Production-Ready Monorepo

A modern, scalable monorepo architecture with TypeScript, React, and Bun. Originally created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) and enhanced with enterprise-grade features.

## 🎯 For New Collaborators: Zero-Setup Required!

**Just need Docker installed?** Clone this repo and run `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`

That's it! The app will:
- ✅ Install all dependencies automatically (inside containers)
- ✅ Set up PostgreSQL database
- ✅ Run all migrations
- ✅ Seed sample data (drivers, vehicles, etc.)
- ✅ Start everything with hot-reload
- ✅ No Bun, Node, or any other tools required on your machine!

## ✨ Features

- 🚀 **Lightning Fast**: Powered by Bun runtime
- 🔒 **Type-Safe**: End-to-end TypeScript with TRPC
- 🎨 **Modern UI**: Shadcn components with Tailwind CSS 4
- 🧪 **Well Tested**: Vitest unit tests + Playwright E2E
- 📦 **Monorepo**: Turborepo with shared packages
- 🔄 **Hot Reload**: Instant development feedback
- 🗄️ **PostgreSQL**: Dockerized database with Prisma ORM
- 🔐 **Authentication**: Better-auth integration
- 🌐 **URL State**: Type-safe URL management with Nuqs
- 🎯 **Linting**: Fast code quality with Biome
- 🔄 **API Standards**: Snake_case/camelCase transformers

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Backend**: Hono + TRPC
- **Frontend**: React + Tanstack Router
- **Database**: PostgreSQL + Prisma
- **UI**: Shadcn/ui + Tailwind CSS
- **Testing**: Vitest + Playwright
- **Linting**: Biome
- **URL State**: Nuqs

## 📋 Prerequisites

### For Docker Setup (Easiest - Recommended for New Contributors)
- ✅ [Docker Desktop](https://docker.com) (includes Docker Compose)
- ✅ Git
- ✅ [Bun](https://bun.sh) (only for running scripts, not required inside containers)

**Note**: If you don't have Bun installed, you can still run with standard Docker commands (see Method 2 below)

### For Local Development (Advanced)
- All of the above plus:
- Node.js 20+
- PostgreSQL 16+

## 🚀 Quick Start - For New Contributors

### Method 1: With Bun Installed (Simplest)

```bash
# Clone the repository
git clone <your-repo-url>
cd papaya-fleet

# Install Bun if you haven't already
curl -fsSL https://bun.sh/install | bash

# Start everything with one command
bun run docker:up

# That's it! 🎉 Your app is now running with:
# ✅ Web app at http://localhost:3100
# ✅ API at http://localhost:3101
# ✅ Database at localhost:5440
# ✅ Sample data automatically seeded
```

**Useful Commands:**
```bash
bun run docker:down        # Stop all services
bun run docker:logs        # View logs
bun run docker:reset       # Reset everything (delete all data)
```

### Method 2: Without Bun (Docker Only)

```bash
# Clone the repository
git clone <your-repo-url>
cd papaya-fleet

# Start everything with Docker Compose
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop everything
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Method 3: Using Helper Script (No Bun Required)

```bash
# Clone the repository
git clone <your-repo-url>
cd papaya-fleet

# Start everything
./scripts/docker-dev.sh up

# Stop everything
./scripts/docker-dev.sh down
```

### What Happens Automatically? 🪄

When you run any of the above commands, Docker will:
1. ✅ Build all containers (web, server, database)
2. ✅ Install all dependencies inside containers
3. ✅ Start PostgreSQL database on port 5440
4. ✅ Run database migrations automatically
5. ✅ Seed the database with sample data (drivers, vehicles, etc.)
6. ✅ Start the API server with hot-reload
7. ✅ Start the web app with hot-reload
8. ✅ Create a `.env` file if it doesn't exist

**No manual setup required!** Everything is containerized and automated.

### Option 4: Local Development (Advanced - Requires Bun Installed Locally)

```bash
# Clone the repository
git clone <your-repo-url>
cd papaya-fleet

# Initialize the project (install deps, setup DB, migrations)
./scripts/init.sh

# Start development servers
bun run dev

# Or start everything manually
./scripts/start.sh
```

The web app will be available at [http://localhost:3100](http://localhost:3100) and the API at [http://localhost:3101](http://localhost:3101).

## 📁 Project Structure

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
└── test/          # Global test setup
```

## 🔧 Available Scripts

### Root Level
```bash
bun run dev          # Start all dev servers
bun run build        # Build all packages
bun run lint         # Lint with Biome
bun run lint:fix     # Fix linting issues
bun run format       # Format code
bun run test         # Run all tests
bun run test:e2e     # Run E2E tests
bun run check-types  # TypeScript checking
```

### Database Management
```bash
bun run db:start     # Start PostgreSQL in Docker
bun run db:stop      # Stop PostgreSQL
bun run db:studio    # Open Prisma Studio
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:seed      # Seed database with sample data
./scripts/db-reset.sh # Reset database completely
```

### 🐳 Docker Development (Full Stack)
```bash
# Initial Setup (First Time Only)
bun run docker:init       # Complete setup with prompts

# Daily Development
bun run docker:dev        # Start all services (DB + API + Web)
bun run docker:dev:logs   # View real-time logs
bun run docker:dev:down   # Stop all services
bun run docker:dev:reset  # Reset everything (deletes data!)

# Advanced Docker Commands
./scripts/docker-dev.sh shell server  # SSH into server container
./scripts/docker-dev.sh shell web     # SSH into web container
./scripts/docker-dev.sh db           # Open PostgreSQL shell
./scripts/docker-dev.sh ps           # Check container status
./scripts/docker-dev.sh build        # Rebuild images
```

**🎯 Docker Port Mapping:**
- Web App: `http://localhost:3100`
- API Server: `http://localhost:3101`
- PostgreSQL: `localhost:5440`

**💡 Docker Features:**
- ✅ Automatic database migrations on startup
- ✅ Optional database seeding (AUTO_SEED=true)
- ✅ Hot reload for code changes
- ✅ Isolated environment (no local dependencies needed)
- ✅ Consistent setup across all team members

### Individual Apps
```bash
bun run dev:web      # Start web app only
bun run dev:server   # Start server only
```

### Testing
```bash
# Unit tests (Vitest)
bun test              # Run all unit tests
bun test:watch        # Watch mode

# E2E tests (Playwright)
cd apps/e2e
bun run test          # Run E2E tests
bun run test:ui       # Open test UI
bun run test:debug    # Debug mode
bun run test:chromium # Chrome only
bun run test:mobile   # Mobile viewports
```

## 🐳 Database Setup

The database runs in Docker for consistency:

1. **Automatic Setup** (recommended):
```bash
./scripts/init.sh
```

2. **Manual Setup**:
```bash
# Start PostgreSQL container
bun run db:start

# Apply schema
bun run db:push

# Open Prisma Studio (optional)
bun run db:studio
```

The database runs on port `5440` (not default 5432) to avoid conflicts.

## 🔒 Environment Variables

Create `.env` in the root directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5440/papaya-fleet
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## 🏗️ Key Features

### 🔄 Case Conversion
Automatic conversion between snake_case (backend) and camelCase (frontend):
```typescript
import { snakeToCamelObject, camelToSnakeObject } from "@papaya-fleet/utils";

// API response transformation
const camelCaseData = snakeToCamelObject(apiResponse);
```

### 📝 Form Validation
Comprehensive Zod schemas for all forms:
```typescript
import { loginSchema, signUpSchema } from "@papaya-fleet/validation";

// Type-safe form validation
const result = loginSchema.safeParse(formData);
```

### 🔗 URL State Management
Type-safe URL parameters with Nuqs:
```typescript
import { useSearchParams, usePaginationParams } from "@/hooks/use-url-state";

// Syncs with URL: ?q=search&page=1&size=10
const { search, setSearch } = useSearchParams();
const { page, setPage } = usePaginationParams();
```

### 🎨 UI Components
Pre-configured Shadcn components in `packages/ui`:
```typescript
import { Button, Card, Dialog } from "@papaya-fleet/ui/components";
```

Add more Shadcn components:
```bash
bunx shadcn@latest add accordion dialog table -c packages/ui
```

### 📊 Standard API Responses
Consistent API response format:
```typescript
import { successResponse, errorResponse, paginatedResponse } from "@papaya-fleet/utils";

// Standardized responses
return successResponse(data, "Operation successful");
return errorResponse("INVALID_INPUT", "Invalid email format");
return paginatedResponse(items, page, pageSize, totalItems);
```

## 📝 Code Quality

### Linting & Formatting (Biome)
```bash
bun run lint         # Check for issues
bun run lint:fix     # Auto-fix issues
bun run format       # Format all code
```

### Type Checking
```bash
bun run check-types  # Full TypeScript validation
```

## 🚢 Production Build

```bash
# Build all packages
bun run build

# Run production server
cd apps/server && bun run start

# Serve frontend
cd apps/web && bun run serve
```

## 🧪 Testing Strategy

- **Unit Tests**: Package-level with Vitest
- **E2E Tests**: User flows with Playwright
- **Coverage**: Aim for >80%

## 📚 Documentation

All documentation is organized in the `/docs` folder:

- [📖 Documentation Index](./docs/README.md) - Start here
- [🏗️ Architecture Overview](./docs/architecture/ARCHITECTURE.md) - System design
- [🚀 Getting Started](./docs/guides/GETTING_STARTED.md) - Setup guide
- [👨‍💻 Development Guide](./docs/guides/DEVELOPMENT.md) - Dev workflow
- [🧪 Testing Guide](./docs/guides/TESTING.md) - Testing strategy
- [🚢 Deployment Guide](./docs/guides/DEPLOYMENT.md) - Production deployment
- [🤖 Claude AI Guide](./CLAUDE.md) - For AI assistants

## 🐛 Troubleshooting

### Common Issues for New Contributors

**"Docker command not found"**
- Install [Docker Desktop](https://docker.com) which includes Docker Compose

**"bun: command not found"**
- You can either:
  - Install Bun: `curl -fsSL https://bun.sh/install | bash`
  - OR use Docker directly (see Method 2 above)
  - OR use the shell scripts (see Method 3 above)

**"Port already in use"**
- Another service is using ports 3100, 3101, or 5440
- Stop conflicting services or change ports in docker-compose.yml

**"Database connection failed"**
- Ensure Docker is running: `docker ps`
- Wait 30 seconds for database to be ready
- Check logs: `docker compose logs postgres`

**"Changes not reflecting"**
- The development setup includes hot-reload
- If not working, restart: `bun run docker:down && bun run docker:up`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Run tests (`bun test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing`)
6. Open a Pull Request

## 📄 License

MIT

## 🙏 Acknowledgments

- [Bun](https://bun.sh) for the amazing runtime
- [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) for the initial template
- [Shadcn](https://ui.shadcn.com) for beautiful components
- [Tanstack](https://tanstack.com) for powerful tools
- [Prisma](https://prisma.io) for type-safe database

---

Built with ❤️ using modern web technologies