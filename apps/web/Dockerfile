# Stage 1: Base image with Bun
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
# Copy root package files
COPY package.json bun.lock ./
# Copy workspace package files
COPY apps/web/package.json ./apps/web/
COPY apps/e2e/package.json ./apps/e2e/
COPY apps/server/package.json ./apps/server/
# Copy all package.json files from packages directory
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/forms/package.json ./packages/forms/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/
COPY packages/validation/package.json ./packages/validation/

# Copy Prisma schema and config to prevent postinstall failure
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/prisma.config.ts ./packages/db/

# Install dependencies
RUN bun install --ignore-scripts --frozen-lockfile --ignore-scripts

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Copy source code
COPY . .

# Build packages first (they are dependencies)
WORKDIR /app/packages/db
RUN bun run db:generate

# Build the web app
WORKDIR /app
RUN bun run build --filter=web

# Stage 4: Development server
FROM base AS dev
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY apps/e2e/package.json ./apps/e2e/
# Copy all package.json files from packages directory
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/forms/package.json ./packages/forms/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/
COPY packages/validation/package.json ./packages/validation/

# Copy Prisma schema and config to prevent postinstall failure
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/prisma.config.ts ./packages/db/

RUN bun install --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/packages/db
RUN bun run db:generate

WORKDIR /app
EXPOSE 3100
CMD ["bun", "run", "dev:web"]

# Stage 5: Production runtime
FROM oven/bun:1-alpine AS prod
WORKDIR /app

# Install production dependencies only
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Copy built application
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages ./packages

# Install serve for static hosting
RUN bun add -g serve

EXPOSE 3100
CMD ["serve", "-s", "apps/web/dist", "-l", "3100"]