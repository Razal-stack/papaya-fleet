#!/bin/sh

# Docker entrypoint script for server
# Handles database migration and startup

set -e

echo "🚀 Starting Papaya Test Server..."

# Export DATABASE_URL for Prisma to use
export DATABASE_URL="${DATABASE_URL}"

# First, generate Prisma client since we skipped postinstall
echo "🔧 Generating Prisma client..."
cd /app/packages/db
bunx prisma generate

# Wait for database to be ready
echo "⏳ Waiting for database..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    # Try to connect to database
    if bunx prisma db push 2>&1 | grep -q "Your database is now in sync"; then
        echo "✅ Database is ready and migrated"
        break
    fi

    # Check if it's just "already in sync" which is also success
    if bunx prisma db push 2>&1 | grep -q "already in sync"; then
        echo "✅ Database is already in sync"
        break
    fi

    attempt=$((attempt + 1))

    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Database connection failed after $max_attempts attempts"
        exit 1
    fi

    echo "Database not ready, waiting... ($attempt/$max_attempts)"
    sleep 2
done

# Check if we should seed the database (only in development)
if [ "$NODE_ENV" = "development" ] && [ "$AUTO_SEED" = "true" ]; then
    echo "🌱 Seeding database with sample data..."
    bun run db:seed || echo "⚠️ Seeding failed or data already exists"
fi

# Start the server
echo "🎯 Starting server..."
cd /app

# Execute the command passed to the container
exec "$@"