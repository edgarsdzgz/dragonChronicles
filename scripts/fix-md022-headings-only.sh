#!/bin/bash

# Fix ONLY MD022 violations (headings need blank lines around them)
# Simple, safe approach with timeout protection

set -euo pipefail

TARGET_FILE="docs/engineering/session-handoff-complete.md"
TIMEOUT=30  # 30 second timeout

echo "🔧 Fixing MD022 violations (headings need blank lines) in $TARGET_FILE (timeout: ${TIMEOUT}s)..."

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Error: File $TARGET_FILE not found!"
    exit 1
fi

# Create backup
cp "$TARGET_FILE" "${TARGET_FILE}.backup"
echo "📋 Created backup: ${TARGET_FILE}.backup"

# Function to fix MD022 with timeout
fix_md022() {
    echo "  Fixing MD022: Adding blank lines around headings..."
    
    # Use timeout to prevent infinite loops
    timeout $TIMEOUT perl -i -pe '
        # Add blank line before headings that dont have one
        s/^([^#\s].*)\n(#{1,6}\s)/$1\n\n$2/g;
        # Add blank line after headings that dont have one  
        s/^(#{1,6}\s.*)\n([^#\s\n])/$1\n\n$2/g;
    ' "$TARGET_FILE"
    
    if [ $? -eq 124 ]; then
        echo "❌ Timeout reached! Restoring backup..."
        cp "${TARGET_FILE}.backup" "$TARGET_FILE"
        exit 1
    fi
    
    echo "✅ MD022 fixes applied successfully"
}

# Apply fixes
fix_md022

echo "🎉 MD022 violations fixed! Testing..."
pnpm run docs:lint 2>&1 | grep "MD022" || echo "✅ No MD022 violations found!"

echo "📊 Summary:"
echo "  - Fixed: MD022 (headings need blank lines)"
echo "  - Backup: ${TARGET_FILE}.backup"
echo "  - Timeout: ${TIMEOUT}s"
