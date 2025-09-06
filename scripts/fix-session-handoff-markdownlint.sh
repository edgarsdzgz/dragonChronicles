#!/bin/bash

# Comprehensive Markdownlint Fixer for session-handoff-complete.md
# Fixes all MD022, MD032, MD031, MD009, and MD036 violations

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

# Function to fix MD022: Headings should be surrounded by blank lines
fix_heading_blanks() {
    echo "  Fixing MD022: Adding blank lines around headings..."
    
    # Add blank line before headings that don't have one
    sed -i '/^[^[:space:]]/{
        :loop
        N
        /^[^[:space:]]*\n###/{
            s/^\([^[:space:]]*\)\n\(###.*\)/\1\n\n\2/
            b loop
        }
        /^[^[:space:]]*\n##/{
            s/^\([^[:space:]]*\)\n\(##.*\)/\1\n\n\2/
            b loop
        }
        /^[^[:space:]]*\n#/{
            s/^\([^[:space:]]*\)\n\(#.*\)/\1\n\n\2/
            b loop
        }
        P
        D
    }' "$TARGET_FILE"
    
    # Add blank line after headings that don't have one
    sed -i '/^###/{
        N
        /^###.*\n[^[:space:]]/{
            s/^\(###.*\)\n\([^[:space:]]\)/\1\n\n\2/
        }
    }' "$TARGET_FILE"
    
    sed -i '/^##/{
        N
        /^##.*\n[^[:space:]]/{
            s/^\(##.*\)\n\([^[:space:]]\)/\1\n\n\2/
        }
    }' "$TARGET_FILE"
    
    sed -i '/^#/{
        N
        /^#.*\n[^[:space:]]/{
            s/^\(#.*\)\n\([^[:space:]]\)/\1\n\n\2/
        }
    }' "$TARGET_FILE"
}

# Function to fix MD032: Lists should be surrounded by blank lines
fix_list_blanks() {
    echo "  Fixing MD032: Adding blank lines around lists..."
    
    # Add blank line before lists
    sed -i '/^[^[:space:]]/{
        N
        /^[^[:space:]]*\n-/{
            s/^\([^[:space:]]*\)\n\(-.*\)/\1\n\n\2/
        }
    }' "$TARGET_FILE"
    
    # Add blank line after lists
    sed -i '/^-/{
        :loop
        N
        /^-\n[^[:space:]-]/{
            s/^\(-.*\)\n\([^[:space:]-]\)/\1\n\n\2/
            b loop
        }
        P
        D
    }' "$TARGET_FILE"
}

# Function to fix MD031: Fenced code blocks should be surrounded by blank lines
fix_code_block_blanks() {
    echo "  Fixing MD031: Adding blank lines around fenced code blocks..."
    
    # Add blank line before code blocks
    sed -i '/^[^[:space:]]/{
        N
        /^[^[:space:]]*\n```/{
            s/^\([^[:space:]]*\)\n\(```.*\)/\1\n\n\2/
        }
    }' "$TARGET_FILE"
    
    # Add blank line after code blocks
    sed -i '/^```/{
        :loop
        N
        /^```.*\n[^[:space:]]/{
            s/^\(```.*\)\n\([^[:space:]]\)/\1\n\n\2/
            b loop
        }
        P
        D
    }' "$TARGET_FILE"
}

# Function to fix MD009: No trailing spaces
fix_trailing_spaces() {
    echo "  Fixing MD009: Removing trailing spaces..."
    sed -i 's/[[:space:]]*$//' "$TARGET_FILE"
}

# Function to fix MD036: Emphasis used instead of a heading
fix_emphasis_as_heading() {
    echo "  Fixing MD036: Converting emphasis to proper heading..."
    
    # Convert lines that are just **text** to proper heading
    sed -i 's/^[[:space:]]*\*\*\([^*]*\)\*\*[[:space:]]*$/### \1/' "$TARGET_FILE"
    
    # Handle the specific case: "Have a great weekend! 🎉"
    sed -i 's/^[[:space:]]*\*\*Have a great weekend! 🎉\*\*[[:space:]]*$/### Have a great weekend! 🎉/' "$TARGET_FILE"
}

# Function to fix specific trailing space issue on line 57
fix_specific_trailing_space() {
    echo "  Fixing specific trailing space on line 57..."
    
    # Use awk to fix the specific line with trailing space
    awk 'NR==57 {gsub(/[[:space:]]+$/, ""); print; next} {print}' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
}

# Apply all fixes
echo "Applying markdownlint fixes..."

fix_trailing_spaces
fix_specific_trailing_space
fix_heading_blanks
fix_list_blanks
fix_code_block_blanks
fix_emphasis_as_heading

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

