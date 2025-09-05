#!/bin/bash

# Simple Markdown Line Length Fixer
# Focus on specific files with known issues

set -euo pipefail

MAX_LINE_LENGTH=100

echo "🔧 Fixing markdown line lengths..."

# Function to break long lines
fix_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    local temp_file=$(mktemp)
    
    # Process each line
    while IFS= read -r line || [ -n "$line" ]; do
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
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file
    mv "$temp_file" "$file"
    echo "  ✅ Fixed"
}

# Fix the specific files mentioned in the error
fix_file "docs/engineering/development-workflow.md"
fix_file "docs/optimization/CODE_OPTIMIZATION_GUIDE.md"
fix_file "docs/optimization/ISSUE_CodeReview_Optimization.md"
fix_file "docs/optimization/README.md"
fix_file "docs/README.md"
fix_file "docs/runbooks/pr-cleanup.md"

echo "🎉 Done!"
