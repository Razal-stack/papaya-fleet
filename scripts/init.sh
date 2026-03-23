#!/bin/bash

# Project initialization script
set -e

echo "🚀 Initializing Papaya Test Project..."

# Check requirements
command -v bun >/dev/null 2>&1 || { echo "❌ Bun is required but not installed. Visit https://bun.sh"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Copy env files
echo "📝 Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || echo "DATABASE_URL=postgresql://postgres:password@localhost:5440/papaya-fleet" > .env
fi

# Start database
echo "🗄️ Starting PostgreSQL..."
bun run db:start

# Wait for database
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run migrations
echo "🔄 Running database migrations..."
bun run db:push

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run db:generate

echo "✅ Project initialized successfully!"
echo ""
echo "Next steps:"
echo "  bun run dev       - Start development servers"
echo "  bun run db:studio - Open Prisma Studio"
echo "  ./scripts/stop.sh - Stop all services"