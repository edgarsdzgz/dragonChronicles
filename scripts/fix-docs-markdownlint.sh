#!/bin/bash

# Targeted Markdownlint Fixer for Docs Workflow
# Fixes specific issues found in the docs workflow

set -euo pipefail

echo "🔧 Fixing specific markdownlint issues in docs..."

# Function to fix emphasis style (underscore to asterisk)
fix_emphasis_style() {
    local file="$1"
    echo "  Fixing emphasis style in: $file"
    
    # Replace __text__ with **text**
    sed -i 's/__\([^_]*\)__/\*\*\1\*\*/g' "$file"
    
    # Replace _text_ with *text* (but not if it's already **text**)
    sed -i 's/\([^*]\)_\([^_]*\)_\([^*]\)/\1*\2*\3/g' "$file"
}

# Function to fix emphasis as heading
fix_emphasis_as_heading() {
    local file="$1"
    echo "  Fixing emphasis as heading in: $file"
    
    # Convert lines that are just **text** to ### text
    sed -i 's/^[[:space:]]*\*\*\([^*]*\)\*\*[[:space:]]*$/### \1/' "$file"
}

# Function to fix line length
fix_line_length() {
    local file="$1"
    echo "  Fixing line length in: $file"
    
    # Create a temporary file
    local temp_file=$(mktemp)
    local changes=0
    
    while IFS= read -r line || [ -n "$line" ]; do
        if [ ${#line} -gt 100 ]; then
            # Find last space before max length
            local break_point=100
            while [ $break_point -gt 0 ] && [ "${line:$break_point:1}" != " " ]; do
                ((break_point--))
            done
            
            # If no space found, break at max length
            if [ $break_point -eq 0 ]; then
                break_point=100
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
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file
    mv "$temp_file" "$file"
    
    if [ $changes -gt 0 ]; then
        echo "    Fixed $changes long lines"
    fi
}

# Fix specific files with issues
echo "Processing files with markdownlint issues..."

# Fix emphasis style issues
fix_emphasis_style "docs/optimization/ISSUE_CodeReview_Optimization.md"
fix_emphasis_style "docs/optimization/README.md"

# Fix emphasis as heading issues
fix_emphasis_as_heading "docs/optimization/CODE_OPTIMIZATION_GUIDE.md"

# Fix line length issues
fix_line_length "docs/optimization/OPTIMIZATION_JOURNEY_SUMMARY.md"
fix_line_length "docs/optimization/OPTIMIZATION_SUMMARY.md"

echo "🎉 Markdownlint fixes applied!"
echo ""
echo "Note: Some issues like link fragments and duplicate headings may need manual review."
