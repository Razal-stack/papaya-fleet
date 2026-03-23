#!/bin/bash

# Stop all services
echo "🛑 Stopping all services..."

# Kill any running dev servers
echo "Stopping development servers..."
pkill -f "bun.*dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Stop database
echo "Stopping database..."
bun run db:stop

echo "✅ All services stopped!"