# Stage 1: Base image with Bun
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
# Copy root package files
COPY package.json bun.lock ./
# Copy workspace package files
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
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

# Install dependencies (skip postinstall for now)
RUN bun install --frozen-lockfile --ignore-scripts

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/packages/db
RUN bun run db:generate

# Build the server
WORKDIR /app
RUN bun run build --filter=server

# Stage 4: Development server
FROM base AS dev
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
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

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

WORKDIR /app
EXPOSE 3101

# Use entrypoint for automatic migrations
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["bun", "run", "dev:server"]

# Stage 5: Production runtime
FROM oven/bun:1-alpine AS prod
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/

# Install production dependencies only
RUN bun install --production

# Copy built application and necessary files
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3101
CMD ["bun", "run", "apps/server/dist/index.mjs"]