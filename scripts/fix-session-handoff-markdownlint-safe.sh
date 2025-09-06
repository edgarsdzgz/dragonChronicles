#!/bin/bash

# Safe Markdownlint Fixer for session-handoff-complete.md
# Simple, reliable approach with timeout protection

set -euo pipefail

TARGET_FILE="docs/engineering/session-handoff-complete.md"
TIMEOUT=30  # 30 second timeout

echo "🔧 Fixing markdownlint violations in $TARGET_FILE (timeout: ${TIMEOUT}s)..."

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Error: File $TARGET_FILE not found!"
    exit 1
fi

# Create backup
cp "$TARGET_FILE" "${TARGET_FILE}.backup"
echo "📋 Created backup: ${TARGET_FILE}.backup"

# Function to apply fixes with timeout
apply_fixes() {
    echo "  Applying markdownlint fixes..."
    
    # Fix MD009: Remove trailing spaces
    echo "    Fixing trailing spaces..."
    sed -i 's/[[:space:]]*$//' "$TARGET_FILE"
    
    # Fix MD012: Remove multiple consecutive blank lines
    echo "    Fixing multiple blank lines..."
    awk '/^$/ { if (prev_blank) next; prev_blank=1 } !/^$/ { prev_blank=0 } { print }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    
    # Fix MD022: Add blank lines around headings (simple approach)
    echo "    Fixing heading spacing..."
    awk '
    BEGIN { prev_line = "" }
    {
        current_line = $0
        # Add blank line before headings
        if (current_line ~ /^#/ && prev_line != "" && prev_line !~ /^$/) {
            print ""
        }
        print current_line
        prev_line = current_line
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    
    # Fix MD032: Add blank lines around lists (simple approach)
    echo "    Fixing list spacing..."
    awk '
    BEGIN { prev_line = "" }
    {
        current_line = $0
        # Add blank line before lists
        if (current_line ~ /^[[:space:]]*-/ && prev_line != "" && prev_line !~ /^$/ && prev_line !~ /^[[:space:]]*-/) {
            print ""
        }
        print current_line
        prev_line = current_line
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    
    # Fix MD031: Add blank lines around code blocks (simple approach)
    echo "    Fixing code block spacing..."
    awk '
    BEGIN { prev_line = "" }
    {
        current_line = $0
        # Add blank line before code blocks
        if (current_line ~ /^```/ && prev_line != "" && prev_line !~ /^$/) {
            print ""
        }
        print current_line
        prev_line = current_line
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    
    # Fix MD036: Convert emphasis to heading
    echo "    Fixing emphasis as heading..."
    sed -i 's/^[[:space:]]*\*\*\([^*]*\)\*\*[[:space:]]*$/### \1/' "$TARGET_FILE"
    
    echo "✅ All fixes applied successfully!"
}

# Run the fixes with timeout protection
if timeout $TIMEOUT bash -c "$(declare -f apply_fixes); apply_fixes"; then
    echo "🎉 Markdownlint fixes completed within timeout!"
else
    echo "⏰ Timeout reached! Restoring backup..."
    cp "${TARGET_FILE}.backup" "$TARGET_FILE"
    echo "❌ Fixes failed due to timeout. File restored from backup."
    exit 1
fi

# Verify the fixes
echo "🔍 Verifying fixes..."
if command -v markdownlint >/dev/null 2>&1; then
    echo "Running markdownlint to verify fixes..."
    if timeout 10 markdownlint -c .markdownlint.json "$TARGET_FILE"; then
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

