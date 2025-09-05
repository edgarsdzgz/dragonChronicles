#!/bin/bash

# Fix ONLY MD012 violations (multiple consecutive blank lines)
# Simple, safe approach with timeout protection

set -euo pipefail

TARGET_FILE="docs/engineering/session-handoff-complete.md"
TIMEOUT=30  # 30 second timeout

echo "🔧 Fixing MD012 violations (multiple blank lines) in $TARGET_FILE (timeout: ${TIMEOUT}s)..."

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Error: File $TARGET_FILE not found!"
    exit 1
fi

# Create backup
cp "$TARGET_FILE" "${TARGET_FILE}.backup"
echo "📋 Created backup: ${TARGET_FILE}.backup"

# Function to fix MD012 with timeout
fix_md012() {
    echo "  Fixing MD012: Removing multiple consecutive blank lines..."
    
    # Use timeout to prevent infinite loops
    timeout $TIMEOUT awk '
        /^$/ { 
            if (prev_blank) next; 
            prev_blank = 1 
        } 
        !/^$/ { 
            prev_blank = 0 
        } 
        { print }
    ' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    
    if [ $? -eq 124 ]; then
        echo "❌ Timeout reached! Restoring backup..."
        cp "${TARGET_FILE}.backup" "$TARGET_FILE"
        exit 1
    fi
    
    echo "✅ MD012 fixes applied successfully"
}

# Apply fixes
fix_md012

echo "🎉 MD012 violations fixed! Testing..."
pnpm run docs:lint 2>&1 | grep "MD012" || echo "✅ No MD012 violations found!"

echo "📊 Summary:"
echo "  - Fixed: MD012 (multiple consecutive blank lines)"
echo "  - Backup: ${TARGET_FILE}.backup"
echo "  - Timeout: ${TIMEOUT}s"
