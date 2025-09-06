#!/bin/bash

# Final Comprehensive Markdownlint Fixer for session-handoff-complete.md
# Uses a simple, reliable approach to fix all violations

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

# Function to fix all violations using a comprehensive approach
fix_all_violations() {
    echo "  Applying comprehensive markdownlint fixes..."
    
    # Create a temporary file for processing
    local temp_file=$(mktemp)
    local in_code_block=false
    local prev_line=""
    local prev_was_blank=false
    
    while IFS= read -r line || [ -n "$line" ]; do
        # Track code block state
        if [[ "$line" =~ ^``` ]]; then
            in_code_block=$((1 - in_code_block))
        fi
        
        # Skip processing inside code blocks
        if [ $in_code_block -eq 1 ]; then
            echo "$line" >> "$temp_file"
            prev_line="$line"
            prev_was_blank=false
            continue
        fi
        
        # Fix MD009: Remove trailing spaces
        line=$(echo "$line" | sed 's/[[:space:]]*$//')
        
        # Fix MD022: Add blank lines around headings
        if [[ "$line" =~ ^# ]]; then
            # Add blank line before heading if previous line is not blank and not empty
            if [ -n "$prev_line" ] && [[ ! "$prev_line" =~ ^$ ]]; then
                echo "" >> "$temp_file"
            fi
            echo "$line" >> "$temp_file"
            # Add blank line after heading if next line is not blank and not empty
            # We'll handle this in the next iteration
            prev_line="$line"
            prev_was_blank=false
            continue
        fi
        
        # Fix MD032: Add blank lines around lists
        if [[ "$line" =~ ^[[:space:]]*- ]]; then
            # Add blank line before list if previous line is not blank and not empty
            if [ -n "$prev_line" ] && [[ ! "$prev_line" =~ ^$ ]] && [[ ! "$prev_line" =~ ^[[:space:]]*- ]]; then
                echo "" >> "$temp_file"
            fi
            echo "$line" >> "$temp_file"
            prev_line="$line"
            prev_was_blank=false
            continue
        fi
        
        # Fix MD031: Add blank lines around fenced code blocks
        if [[ "$line" =~ ^``` ]]; then
            # Add blank line before code block if previous line is not blank and not empty
            if [ -n "$prev_line" ] && [[ ! "$prev_line" =~ ^$ ]]; then
                echo "" >> "$temp_file"
            fi
            echo "$line" >> "$temp_file"
            prev_line="$line"
            prev_was_blank=false
            continue
        fi
        
        # Fix MD036: Convert emphasis to heading
        if [[ "$line" =~ ^[[:space:]]*\*\*.*\*\*[[:space:]]*$ ]]; then
            # Convert **text** to ### text
            line=$(echo "$line" | sed 's/^[[:space:]]*\*\*\([^*]*\)\*\*[[:space:]]*$/### \1/')
        fi
        
        # Handle blank lines - prevent multiple consecutive blanks (MD012)
        if [[ "$line" =~ ^$ ]]; then
            if [ "$prev_was_blank" = true ]; then
                # Skip this blank line to prevent multiple consecutive blanks
                continue
            else
                echo "$line" >> "$temp_file"
                prev_was_blank=true
            fi
        else
            echo "$line" >> "$temp_file"
            prev_was_blank=false
        fi
        
        prev_line="$line"
    done < "$TARGET_FILE"
    
    # Replace original file
    mv "$temp_file" "$TARGET_FILE"
}

# Apply the comprehensive fix
fix_all_violations

# Additional cleanup to ensure no multiple blank lines at the end
sed -i '/^$/{
    :loop
    N
    /^$\n$/{
        s/^$\n$/$/
        b loop
    }
    P
    D
}' "$TARGET_FILE"

# Remove trailing blank lines
sed -i -e :a -e '/^\s*$/N;ba' -e 's/\n*$//' "$TARGET_FILE"

echo "✅ Comprehensive markdownlint fixes applied!"

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

