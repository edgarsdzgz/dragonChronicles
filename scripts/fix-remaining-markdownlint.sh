#!/bin/bash

# Fix remaining markdownlint issues
set -euo pipefail

echo "🔧 Fixing remaining markdownlint issues..."

# Fix line length issues in specific files
fix_line_length_file() {
    local file="$1"
    echo "  Fixing line length in: $file"
    
    # Use awk to break long lines at word boundaries
    awk '
    {
        if (length($0) > 100) {
            line = $0
            while (length(line) > 100) {
                # Find last space before position 100
                pos = 100
                while (pos > 0 && substr(line, pos, 1) != " ") {
                    pos--
                }
                if (pos == 0) pos = 100  # No space found, break at 100
                
                # Print first part
                print substr(line, 1, pos)
                
                # Get remaining part and trim leading spaces
                line = substr(line, pos + 1)
                gsub(/^[ \t]+/, "", line)
            }
            if (length(line) > 0) {
                print line
            }
        } else {
            print $0
        }
    }' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

# Fix emphasis style issues
fix_emphasis_style_file() {
    local file="$1"
    echo "  Fixing emphasis style in: $file"
    
    # Replace _text_ with *text* (but be careful with existing **text**)
    sed -i 's/\([^*]\)_\([^_]*\)_\([^*]\)/\1*\2*\3/g' "$file"
}

# Fix the specific files with remaining issues
echo "Processing files with remaining issues..."

# Fix line length in optimization files
fix_line_length_file "docs/optimization/OPTIMIZATION_JOURNEY_SUMMARY.md"
fix_line_length_file "docs/optimization/OPTIMIZATION_SUMMARY.md"

# Fix emphasis style in README
fix_emphasis_style_file "docs/optimization/README.md"

echo "🎉 Remaining markdownlint fixes applied!"
