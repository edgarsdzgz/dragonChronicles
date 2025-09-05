#!/bin/bash

# Markdown Line Length Fixer
# Intelligently breaks long lines at word boundaries to meet line length requirements

set -euo pipefail

# Configuration
MAX_LINE_LENGTH=100  # Markdownlint default

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to process a single file
process_file() {
    local file="$1"
    local temp_file=$(mktemp)
    local line_count=0
    local fixed_count=0
    
    echo -e "${BLUE}Processing: $file${NC}"
    
    while IFS= read -r line || [ -n "$line" ]; do
        ((line_count++))
        
        if [ ${#line} -gt $MAX_LINE_LENGTH ]; then
            echo -e "${YELLOW}  Line $line_count: ${#line} chars (exceeds $MAX_LINE_LENGTH)${NC}"
            
            # Break the line and write all parts
            while [ ${#line} -gt $MAX_LINE_LENGTH ]; do
                local break_point=$MAX_LINE_LENGTH
                
                # Find last space before max length
                while [ $break_point -gt 0 ] && [ "${line:$break_point:1}" != " " ]; do
                    ((break_point--))
                done
                
                # If no space found, break at max length
                if [ $break_point -eq 0 ]; then
                    break_point=$MAX_LINE_LENGTH
                fi
                
                # Write the first part
                echo "${line:0:$break_point}" >> "$temp_file"
                
                # Get remaining part and trim leading spaces
                line="${line:$((break_point + 1))}"
                line=$(echo "$line" | sed 's/^[[:space:]]*//')
                
                ((fixed_count++))
            done
            
            # Write any remaining part
            if [ -n "$line" ]; then
                echo "$line" >> "$temp_file"
            fi
        else
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Replace original file with fixed version
    mv "$temp_file" "$file"
    
    if [ $fixed_count -gt 0 ]; then
        echo -e "${GREEN}  ✅ Fixed $fixed_count long lines in $file${NC}"
    else
        echo -e "${GREEN}  ✅ No long lines found in $file${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔧 Markdown Line Length Fixer${NC}"
    echo -e "${BLUE}Target line length: $MAX_LINE_LENGTH characters${NC}"
    echo ""
    
    # Find all markdown files
    local files=()
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(find docs -name "*.md" -type f -print0 2>/dev/null || true)
    
    # Also check root directory for README files
    while IFS= read -r -d '' file; do
        files+=("$file")
    done < <(find . -maxdepth 2 -name "README.md" -type f -print0 2>/dev/null || true)
    
    if [ ${#files[@]} -eq 0 ]; then
        echo -e "${YELLOW}No markdown files found${NC}"
        exit 0
    fi
    
    echo -e "${BLUE}Found ${#files[@]} markdown files:${NC}"
    for file in "${files[@]}"; do
        echo "  - $file"
    done
    echo ""
    
    # Process each file
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            process_file "$file"
            echo ""
        fi
    done
    
    echo -e "${GREEN}🎉 Markdown line length fixing complete!${NC}"
    echo -e "${BLUE}All lines are now under $MAX_LINE_LENGTH characters${NC}"
}

# Run main function
main "$@"