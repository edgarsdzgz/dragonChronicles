#!/bin/bash

# Improved Markdownlint Fixer for session-handoff-complete.md
# Fixes all MD022, MD032, MD031, MD009, MD036, and MD012 violations

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

# Function to fix MD012: Multiple consecutive blank lines (reduce to max 1)
fix_multiple_blanks() {
    echo "  Fixing MD012: Reducing multiple blank lines to single blank lines..."
    
    # Replace 3+ consecutive blank lines with 1 blank line
    sed -i '/^$/{
        :loop
        N
        /^$\n$/{
            N
            /^$\n$\n$/{
                s/^$\n$\n$/\
/
                b loop
            }
            s/^$\n$/$/
            b loop
        }
        P
        D
    }' "$TARGET_FILE"
    
    # Replace 2 consecutive blank lines with 1 blank line
    sed -i '/^$/{
        N
        /^$\n$/{
            s/^$\n$/$/
        }
    }' "$TARGET_FILE"
}

# Function to fix MD009: No trailing spaces
fix_trailing_spaces() {
    echo "  Fixing MD009: Removing trailing spaces..."
    sed -i 's/[[:space:]]*$//' "$TARGET_FILE"
}

# Function to fix MD022: Headings should be surrounded by blank lines (but not create multiple blanks)
fix_heading_blanks() {
    echo "  Fixing MD022: Adding blank lines around headings (without creating multiple blanks)..."
    
    # Add blank line before headings that don't have one (but not if it would create multiple blanks)
    awk '
    BEGIN { prev_line = "" }
    {
        current_line = $0
        if (current_line ~ /^###/ || current_line ~ /^##/ || current_line ~ /^#/) {
            if (prev_line != "" && prev_line !~ /^$/) {
                print ""
            }
        }
        print current_line
        prev_line = current_line
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    
    # Add blank line after headings that don't have one (but not if it would create multiple blanks)
    awk '
    BEGIN { next_line = "" }
    {
        current_line = $0
        if (current_line ~ /^###/ || current_line ~ /^##/ || current_line ~ /^#/) {
            print current_line
            getline next_line
            if (next_line != "" && next_line !~ /^$/) {
                print ""
            }
            if (next_line != "") {
                print next_line
            }
        } else {
            print current_line
        }
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
}

# Function to fix MD032: Lists should be surrounded by blank lines (but not create multiple blanks)
fix_list_blanks() {
    echo "  Fixing MD032: Adding blank lines around lists (without creating multiple blanks)..."
    
    # Add blank line before lists that don't have one
    awk '
    BEGIN { prev_line = "" }
    {
        current_line = $0
        if (current_line ~ /^[[:space:]]*-/) {
            if (prev_line != "" && prev_line !~ /^$/) {
                print ""
            }
        }
        print current_line
        prev_line = current_line
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    
    # Add blank line after lists that don't have one
    awk '
    BEGIN { next_line = "" }
    {
        current_line = $0
        if (current_line ~ /^[[:space:]]*-/) {
            print current_line
            getline next_line
            if (next_line != "" && next_line !~ /^$/ && next_line !~ /^[[:space:]]*-/) {
                print ""
            }
            if (next_line != "") {
                print next_line
            }
        } else {
            print current_line
        }
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
}

# Function to fix MD031: Fenced code blocks should be surrounded by blank lines (but not create multiple blanks)
fix_code_block_blanks() {
    echo "  Fixing MD031: Adding blank lines around fenced code blocks (without creating multiple blanks)..."
    
    # Add blank line before code blocks that don't have one
    awk '
    BEGIN { prev_line = "" }
    {
        current_line = $0
        if (current_line ~ /^```/) {
            if (prev_line != "" && prev_line !~ /^$/) {
                print ""
            }
        }
        print current_line
        prev_line = current_line
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
    
    # Add blank line after code blocks that don't have one
    awk '
    BEGIN { next_line = "" }
    {
        current_line = $0
        if (current_line ~ /^```/) {
            print current_line
            getline next_line
            if (next_line != "" && next_line !~ /^$/ && next_line !~ /^```/) {
                print ""
            }
            if (next_line != "") {
                print next_line
            }
        } else {
            print current_line
        }
    }' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
}

# Function to fix MD036: Emphasis used instead of a heading
fix_emphasis_as_heading() {
    echo "  Fixing MD036: Converting emphasis to proper heading..."
    
    # Convert lines that are just **text** to proper heading
    sed -i 's/^[[:space:]]*\*\*\([^*]*\)\*\*[[:space:]]*$/### \1/' "$TARGET_FILE"
    
    # Handle the specific case: "Have a great weekend! 🎉"
    sed -i 's/^[[:space:]]*\*\*Have a great weekend! 🎉\*\*[[:space:]]*$/### Have a great weekend! 🎉/' "$TARGET_FILE"
}

# Apply all fixes in the correct order
echo "Applying markdownlint fixes..."

# First, fix trailing spaces
fix_trailing_spaces

# Then fix multiple blank lines
fix_multiple_blanks

# Then add proper spacing around elements
fix_heading_blanks
fix_list_blanks
fix_code_block_blanks

# Finally, fix emphasis as heading
fix_emphasis_as_heading

# Clean up any remaining multiple blank lines
fix_multiple_blanks

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

