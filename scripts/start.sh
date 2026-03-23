#!/bin/bash

# Start all services
set -e

echo "🚀 Starting all services..."

# Start database
echo "🗄️ Starting database..."
bun run db:start

# Wait for database
echo "⏳ Waiting for database..."
sleep 3

# Start development servers
echo "🔥 Starting development servers..."
bun run dev

echo "✅ All services started!"