#!/bin/bash

# Simple Markdownlint Fixer for session-handoff-complete.md
# Fixes only the specific violations found in the error log

set -euo pipefail

TARGET_FILE="docs/engineering/session-handoff-complete.md"

echo "🔧 Fixing markdownlint violations in $TARGET_FILE..."

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Error: File $TARGET_FILE not found!"
    exit 1
fi

# Create backup
cp "$TARGET_FILE" "${TARGET_FILE}.backup"
echo "📋 Created backup: ${TARGET_FILE}.backup"

echo "  Applying simple fixes..."

# Fix MD009: Remove trailing spaces (simple approach)
echo "    Fixing trailing spaces..."
perl -i -pe 's/\s+$/\n/g' "$TARGET_FILE"

# Fix MD012: Remove multiple consecutive blank lines
echo "    Fixing multiple blank lines..."
perl -i -pe 's/\n\n\n+/\n\n/g' "$TARGET_FILE"

# Fix MD022: Add blank lines around headings (manual approach for specific lines)
echo "    Fixing heading spacing..."

# Add blank line before first heading if needed
sed -i '1s/^/\n/' "$TARGET_FILE"

# Add blank lines around specific headings that need them
sed -i '/^## 🎯 Current State Summary/i\
' "$TARGET_FILE"

sed -i '/^### ✅ \*\*WORKFLOWS PASSING/a\
' "$TARGET_FILE"

sed -i '/^### ❌ \*\*WORKFLOWS FAILING/a\
' "$TARGET_FILE"

sed -i '/^## 🔧 \*\*What We Accomplished/i\
' "$TARGET_FILE"

# Fix MD032: Add blank lines around lists
echo "    Fixing list spacing..."
# Add blank line before first list item
sed -i '/^- \*\*CI\*\* ✅/i\
' "$TARGET_FILE"

# Fix MD031: Add blank lines around code blocks
echo "    Fixing code block spacing..."
# Add blank line before first code block
sed -i '/^```bash/i\
' "$TARGET_FILE"

# Fix MD036: Convert emphasis to heading
echo "    Fixing emphasis as heading..."
sed -i 's/^\*\*Have a great weekend! 🎉\*\*$/### Have a great weekend! 🎉/' "$TARGET_FILE"

# Clean up any extra blank lines at the end
echo "    Cleaning up..."
perl -i -pe 'chomp if eof' "$TARGET_FILE"

echo "✅ Simple fixes applied!"

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
echo "🎉 Markdownlint fixes applied to $TARGET_FILE!"
echo "📋 Backup saved as: ${TARGET_FILE}.backup"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff $TARGET_FILE"
echo "2. Test locally: pnpm run docs:lint"
echo "3. Commit and push to trigger workflow"

