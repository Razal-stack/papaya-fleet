#!/bin/bash

# Reset database completely
set -e

echo "⚠️  This will DELETE all data in the database!"
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Cancelled."
    exit 1
fi

echo "🔄 Resetting database..."

# Stop database
echo "Stopping database..."
bun run db:down

# Remove volume
echo "Removing database volume..."
docker volume rm papaya-fleet_papaya-fleet_postgres_data 2>/dev/null || true

# Start fresh database
echo "Starting fresh database..."
bun run db:start

# Wait for database
echo "Waiting for database..."
sleep 5

# Push schema
echo "Applying schema..."
bun run db:push

# Seed if exists
if [ -f "packages/db/seed.ts" ]; then
    echo "Seeding database..."
    bun run packages/db/seed.ts
fi

echo "✅ Database reset complete!"