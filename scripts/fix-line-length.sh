#!/bin/bash

# Fix line length issues in markdown files by breaking long lines
# Usage: ./fix-line-length.sh [file_or_directory] [max_length]

set -e

MAX_LENGTH=${2:-100}
TARGET=${1:-"**/*.md"}

echo "🔧 Fixing line length issues (max: $MAX_LENGTH chars)..."

# Function to break long lines intelligently
break_long_line() {
    local line="$1"
    local max_len="$2"
    
    if [ ${#line} -le $max_len ]; then
        echo "$line"
        return
    fi
    
    # Don't break URLs, code blocks, or special lines
    if [[ "$line" =~ ^(http|https):// ]] || [[ "$line" =~ ^``` ]] || [[ "$line" =~ ^# ]] || [[ "$line" =~ ^[[:space:]]*[-*+] ]] || [[ "$line" =~ ^[[:space:]]*[0-9]+\. ]]; then
        echo "$line"
        return
    fi
    
    # Break at sentence boundaries first
    if [[ "$line" =~ \. ]]; then
        local result=""
        local remaining="$line"
        
        while [ ${#remaining} -gt $max_len ]; do
            # Find the last sentence boundary within max length
            local break_point=$max_len
            for ((i=$max_len; i>0; i--)); do
                if [[ "${remaining:$i:1}" == "." ]] && [[ "${remaining:$((i+1)):1}" == " " ]]; then
                    break_point=$((i+1))
                    break
                fi
            done
            
            if [ $break_point -eq $max_len ]; then
                # No sentence boundary found, break at word boundary
                for ((i=$max_len; i>0; i--)); do
                    if [[ "${remaining:$i:1}" == " " ]]; then
                        break_point=$i
                        break
                    fi
                done
            fi
            
            result+="${remaining:0:$break_point}"
            remaining="${remaining:$break_point}"
            
            if [ ${#remaining} -gt $max_len ]; then
                result+="\n"
            fi
        done
        
        result+="$remaining"
        echo -e "$result"
        return
    fi
    
    # Break at word boundaries
    local result=""
    local remaining="$line"
    
    while [ ${#remaining} -gt $max_len ]; do
        local break_point=$max_len
        for ((i=$max_len; i>0; i--)); do
            if [[ "${remaining:$i:1}" == " " ]]; then
                break_point=$i
                break
            fi
        done
        
        result+="${remaining:0:$break_point}"
        remaining="${remaining:$break_point}"
        
        if [ ${#remaining} -gt $max_len ]; then
            result+="\n"
        fi
    done
    
    result+="$remaining"
    echo -e "$result"
}

# Process files
if [ -f "$1" ]; then
    # Single file
    echo "Processing file: $1"
    temp_file=$(mktemp)
    
    while IFS= read -r line; do
        if [ ${#line} -gt $MAX_LENGTH ]; then
            break_long_line "$line" $MAX_LENGTH
        else
            echo "$line"
        fi
    done < "$1" > "$temp_file"
    
    mv "$temp_file" "$1"
    echo "✅ Fixed: $1"
    
elif [ -d "$1" ]; then
    # Directory
    echo "Processing directory: $1"
    find "$1" -name "*.md" -type f | while read -r file; do
        echo "Processing: $file"
        temp_file=$(mktemp)
        
        while IFS= read -r line; do
            if [ ${#line} -gt $MAX_LENGTH ]; then
                break_long_line "$line" $MAX_LENGTH
            else
                echo "$line"
            fi
        done < "$file" > "$temp_file"
        
        mv "$temp_file" "$file"
        echo "✅ Fixed: $file"
    done
    
else
    # Pattern or default
    echo "Processing pattern: $TARGET"
    find . -name "*.md" -type f | while read -r file; do
        echo "Processing: $file"
        temp_file=$(mktemp)
        
        while IFS= read -r line; do
            if [ ${#line} -gt $MAX_LENGTH ]; then
                break_long_line "$line" $MAX_LENGTH
            else
                echo "$line"
            fi
        done < "$file" > "$temp_file"
        
        mv "$temp_file" "$file"
        echo "✅ Fixed: $file"
    done
fi

echo "🎉 Line length fixes complete!"



