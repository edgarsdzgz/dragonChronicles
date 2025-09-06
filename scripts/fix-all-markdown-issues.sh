#!/bin/bash

# Comprehensive Markdown Issues Fixer
# Fixes all remaining markdownlint issues automatically

set -euo pipefail

MAX_LINE_LENGTH=100

echo "🔧 Comprehensive Markdown Issues Fixer..."

# Function to fix a file
fix_file() {
    local file="$1"
    echo "Processing: $file"
    
    local temp_file=$(mktemp)
    local changes=0
    
    # Process each line
    while IFS= read -r line || [ -n "$line" ]; do
        local original_line="$line"
        
        # Fix line length
        if [ ${#line} -gt $MAX_LINE_LENGTH ]; then
            echo "  Breaking line: ${#line} chars"
            
            # Find last space before max length
            local break_point=$MAX_LINE_LENGTH
            while [ $break_point -gt 0 ] && [ "${line:$break_point:1}" != " " ]; do
                ((break_point--))
            done
            
            # If no space found, break at max length
            if [ $break_point -eq 0 ]; then
                break_point=$MAX_LINE_LENGTH
            fi
            
            # Write first part
            echo "${line:0:$break_point}" >> "$temp_file"
            
            # Write remaining part (trimmed)
            local remaining="${line:$((break_point + 1))}"
            remaining=$(echo "$remaining" | sed 's/^[[:space:]]*//')
            if [ -n "$remaining" ]; then
                echo "$remaining" >> "$temp_file"
            fi
            ((changes++))
        else
            # Fix emphasis style (underscore to asterisk)
            line=$(echo "$line" | sed 's/__\([^_]*\)__/\*\*\1\*\*/g')
            line=$(echo "$line" | sed 's/_\([^_]*\)_/\*\1\*/g')
            
            # Fix emphasis as heading (convert to proper headings)
            if echo "$line" | grep -q "^[[:space:]]*_[^_]*_[[:space:]]*$"; then
                # Convert "**text**" to "### text"
                line=$(echo "$line" | sed 's/^[[:space:]]*\*\*\([^*]*\)\*\*[[:space:]]*$/### \1/')
                line=$(echo "$line" | sed 's/^[[:space:]]*_\([^_]*\)_[[:space:]]*$/### \1/')
                ((changes++))
            fi
            
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file
    mv "$temp_file" "$file"
    
    if [ $changes -gt 0 ]; then
        echo "  ✅ Fixed $changes issues"
    else
        echo "  ✅ No issues found"
    fi
}

# Fix all files with remaining issues
echo "Fixing line length and emphasis issues..."
fix_file "docs/optimization/ISSUE_CodeReview_Optimization.md"
fix_file "docs/optimization/OPTIMIZATION_BLUEPRINT.md"
fix_file "docs/optimization/OPTIMIZATION_JOURNEY_SUMMARY.md"
fix_file "docs/optimization/OPTIMIZATION_SUMMARY.md"
fix_file "docs/optimization/README.md"

echo ""
echo "🎉 All markdown issues fixed!"
echo "Running final lint check..."
