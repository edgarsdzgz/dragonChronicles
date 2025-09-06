#!/bin/bash

# Comprehensive Markdown Fixer
# Fixes line length, emphasis style, and other markdownlint issues

set -euo pipefail

MAX_LINE_LENGTH=100

echo "🔧 Comprehensive Markdown Fixer..."

# Function to fix a file
fix_file() {
    local file="$1"
    echo "Processing: $file"
    
    local temp_file=$(mktemp)
    
    # Process each line
    while IFS= read -r line || [ -n "$line" ]; do
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
        else
            # Fix emphasis style (underscore to asterisk)
            line=$(echo "$line" | sed 's/__\([^_]*\)__/\*\*\1\*\*/g')
            line=$(echo "$line" | sed 's/_\([^_]*\)_/\*\1\*/g')
            
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file
    mv "$temp_file" "$file"
    echo "  ✅ Fixed"
}

# Fix all the remaining files with issues
fix_file "docs/optimization/CODE_OPTIMIZATION_GUIDE.md"
fix_file "docs/optimization/ISSUE_CodeReview_Optimization.md"
fix_file "docs/optimization/OPTIMIZATION_BLUEPRINT.md"
fix_file "docs/optimization/OPTIMIZATION_JOURNEY_SUMMARY.md"
fix_file "docs/optimization/OPTIMIZATION_SUMMARY.md"
fix_file "docs/optimization/README.md"

echo "🎉 Comprehensive markdown fixing complete!"
