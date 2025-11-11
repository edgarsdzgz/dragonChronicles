#!/bin/bash

# Script to rebuild packages and clear all caches
# Use this when dev server is not picking up package changes

echo "🧹 Clearing all caches..."

# Clear Vite cache
rm -rf apps/web/.vite
rm -rf apps/web/node_modules/.vite
echo "✅ Cleared Vite cache"

# Clear TypeScript build info
find packages -name "tsconfig.tsbuildinfo" -delete
echo "✅ Cleared TypeScript build info"

# Clear package dist folders
rm -rf packages/shared/dist
rm -rf packages/db/dist
echo "✅ Cleared package dist folders"

echo ""
echo "🔨 Rebuilding packages..."

# Rebuild shared package first (db depends on it)
cd packages/shared
pnpm run build
echo "✅ Built @draconia/shared"

# Rebuild db package
cd ../db
pnpm run build
echo "✅ Built @draconia/db"

cd ../..

echo ""
echo "✅ All done! Now restart your dev server:"
echo "   cd apps/web"
echo "   pnpm run dev"
echo ""
echo "Then do a hard refresh in browser (Ctrl+Shift+R)"
