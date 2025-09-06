#!/bin/bash

# Simple script to fix only MD012 (multiple blank lines) violations
# This is the main issue causing the docs workflow to fail

set -euo pipefail

TARGET_FILE="docs/engineering/session-handoff-complete.md"

echo "🔧 Fixing MD012 violations (multiple blank lines) in $TARGET_FILE..."

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Error: File $TARGET_FILE not found!"
    exit 1
fi

# Create backup
cp "$TARGET_FILE" "${TARGET_FILE}.backup"
echo "📋 Created backup: ${TARGET_FILE}.backup"

# Fix MD012: Remove multiple consecutive blank lines (keep only one)
echo "  Fixing multiple blank lines..."
awk '/^$/ { if (prev_blank) next; prev_blank=1 } !/^$/ { prev_blank=0 } { print }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"

# Fix MD047: Ensure file ends with single newline
echo "  Fixing file ending..."
echo "" >> "$TARGET_FILE"

echo "✅ MD012 fixes applied!"

# Verify the fixes
echo "🔍 Verifying fixes..."
if command -v markdownlint >/dev/null 2>&1; then
    echo "Running markdownlint to verify fixes..."
    if markdownlint -c .markdownlint.json "$TARGET_FILE"; then
        echo "✅ All markdownlint violations fixed!"
    else
        echo "⚠️  Some violations may remain. Check the output above."
    fi
else
    echo "ℹ️  markdownlint not available for verification. Manual check recommended."
fi

echo ""
echo "🎉 MD012 fixes applied to $TARGET_FILE!"
echo "📋 Backup saved as: ${TARGET_FILE}.backup"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff $TARGET_FILE"
echo "2. Test locally: pnpm run docs:lint"
echo "3. Commit and push to trigger workflow"

