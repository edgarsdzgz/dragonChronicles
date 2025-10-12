#!/bin/bash

# DragonIdler Development Server Startup Script
# This script handles all the necessary build steps and starts the web development server

set -e  # Exit on any error

echo "🚀 Starting DragonIdler Development Server..."
echo "=============================================="

# Step 1: Clean any previous builds
echo "🧹 Cleaning previous builds..."
pnpm run clean

# Step 2: Install dependencies (if needed)
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
else
    echo "Dependencies already installed"
fi

# Step 3: Build all packages
echo "🔨 Building all packages..."
pnpm run build

# Step 4: Verify db package was built
echo "🔍 Verifying db package build..."
if [ ! -f "packages/db/dist/index.js" ]; then
    echo "❌ ERROR: packages/db/dist/index.js not found!"
    echo "Building db package specifically..."
    pnpm --filter @draconia/db run build
fi

# Step 5: Verify other critical packages
echo "🔍 Verifying other packages..."
required_packages=("packages/logger/dist" "packages/shared/dist" "packages/sim/dist")
for package in "${required_packages[@]}"; do
    if [ ! -d "$package" ]; then
        echo "❌ ERROR: $package not found!"
        echo "This indicates a build failure. Check the build output above."
        exit 1
    fi
done

echo "✅ All packages built successfully!"

# Step 6: Start the development server
echo "🌐 Starting web development server..."
echo "=============================================="
echo "Server will be available at: http://localhost:5173"
echo "Press Ctrl+C to stop the server"
echo "=============================================="

# Start the server (this will run in foreground)
pnpm --filter @draconia/web run dev
