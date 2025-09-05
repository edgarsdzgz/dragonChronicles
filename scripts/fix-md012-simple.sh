#!/bin/bash

# Simple MD012 fix - just remove extra blank lines at the end
# No complex regex, no infinite loops

set -euo pipefail

TARGET_FILE="docs/engineering/session-handoff-complete.md"
TIMEOUT=10  # Short timeout

echo "🔧 Simple MD012 fix for $TARGET_FILE (timeout: ${TIMEOUT}s)..."

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Error: File $TARGET_FILE not found!"
    exit 1
fi

# Create backup
cp "$TARGET_FILE" "${TARGET_FILE}.backup"
echo "📋 Created backup: ${TARGET_FILE}.backup"

# Simple approach: just remove trailing blank lines and add one
echo "  Removing trailing blank lines..."
timeout $TIMEOUT perl -i -pe 'chomp if eof' "$TARGET_FILE"

if [ $? -eq 124 ]; then
    echo "❌ Timeout reached! Restoring backup..."
    cp "${TARGET_FILE}.backup" "$TARGET_FILE"
    exit 1
fi

# Add single newline at end
echo "" >> "$TARGET_FILE"

echo "✅ Simple MD012 fix applied"
echo "🎉 Testing..."
pnpm run docs:lint 2>&1 | grep "MD012" || echo "✅ No MD012 violations found!"
