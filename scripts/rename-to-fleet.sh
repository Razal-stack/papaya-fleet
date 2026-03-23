#!/bin/bash
# Script to rename papaya-fleet to papaya-fleet across the entire codebase

echo "🚀 Starting rename from papaya-fleet to papaya-fleet..."

# Function to update file content
update_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        # Use sed to replace all occurrences
        sed -i '' 's/papaya-fleet/papaya-fleet/g' "$file"
        echo "✅ Updated: $file"
    fi
}

# Update all package.json files
echo "📦 Updating package.json files..."
find . -name "package.json" -not -path "./node_modules/*" -not -path "./.turbo/*" | while read -r file; do
    update_file "$file"
done

# Update all TypeScript and JavaScript files
echo "📝 Updating TypeScript and JavaScript files..."
find . \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "./node_modules/*" \
    -not -path "./.turbo/*" \
    -not -path "./packages/db/prisma/generated/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" | while read -r file; do
    update_file "$file"
done

# Update Docker files
echo "🐳 Updating Docker files..."
for file in docker-compose.yml docker-compose.dev.yml docker-compose.prod.yml Dockerfile .dockerignore; do
    update_file "$file"
done
update_file "apps/server/Dockerfile"
update_file "apps/web/Dockerfile"

# Update shell scripts
echo "🔧 Updating shell scripts..."
find ./scripts -name "*.sh" | while read -r file; do
    update_file "$file"
done

# Update documentation files
echo "📚 Updating documentation..."
find . \( -name "*.md" \) -not -path "./node_modules/*" -not -path "./.turbo/*" | while read -r file; do
    update_file "$file"
done

# Update configuration files
echo "⚙️ Updating configuration files..."
update_file "tsconfig.json"
update_file "vitest.config.ts"
update_file "biome.json"
update_file "turbo.json"
update_file ".env.example"
update_file "bts.jsonc"

# Update component.json files
find . -name "components.json" -not -path "./node_modules/*" | while read -r file; do
    update_file "$file"
done

# Update HTML files
echo "🌐 Updating HTML files..."
find . -name "*.html" -not -path "./node_modules/*" -not -path "./.turbo/*" | while read -r file; do
    update_file "$file"
done

# Update CSS files
echo "🎨 Updating CSS files..."
find . -name "*.css" -not -path "./node_modules/*" -not -path "./.turbo/*" | while read -r file; do
    update_file "$file"
done

# Update Prisma schema
echo "🗃️ Updating Prisma schema..."
update_file "packages/db/prisma/schema/schema.prisma"
update_file "packages/db/prisma.config.ts"

echo "✨ Rename complete! All references updated from papaya-fleet to papaya-fleet"
echo ""
echo "📋 Next steps:"
echo "1. Clear bun cache: rm -rf node_modules .turbo bun.lock"
echo "2. Reinstall dependencies: bun install"
echo "3. Rebuild Docker images: docker compose -f docker-compose.yml -f docker-compose.dev.yml build"
echo "4. Run tests: bun test"