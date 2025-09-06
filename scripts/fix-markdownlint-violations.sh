#!/bin/bash

# Fix Markdownlint Violations Script
# This script fixes the most common markdownlint violations

set -e

echo "🔧 Fixing markdownlint violations..."

# Function to fix trailing spaces
fix_trailing_spaces() {
    echo "📝 Fixing trailing spaces..."
    find docs/ -name "*.md" -type f -exec sed -i 's/[[:space:]]*$//' {} \;
    echo "✅ Trailing spaces removed"
}

# Function to add blank lines around headings
fix_heading_spacing() {
    echo "📝 Fixing heading spacing..."
    # This is complex and requires manual intervention
    echo "⚠️  Heading spacing requires manual fixing - see markdownlint output"
}

# Function to add blank lines around lists
fix_list_spacing() {
    echo "📝 Fixing list spacing..."
    # This is complex and requires manual intervention
    echo "⚠️  List spacing requires manual fixing - see markdownlint output"
}

# Function to fix code block language specification
fix_code_block_language() {
    echo "📝 Fixing code block language specification..."
    # Find code blocks without language and add generic language
    find docs/ -name "*.md" -type f -exec sed -i 's/^```$/```text/' {} \;
    echo "✅ Code block language specification fixed"
}

# Function to check line length
check_line_length() {
    echo "📝 Checking line length violations..."
    # This requires manual intervention
    echo "⚠️  Line length violations require manual fixing - see markdownlint output"
}

# Main execution
main() {
    echo "🚀 Starting markdownlint violation fixes..."
    
    # Fix trailing spaces
    fix_trailing_spaces
    
    # Fix code block language
    fix_code_block_language
    
    # Check for remaining issues
    echo "📋 Running markdownlint to check remaining issues..."
    if pnpm run docs:lint; then
        echo "✅ All markdownlint violations fixed!"
    else
        echo "⚠️  Some violations remain - manual fixing required"
        echo "📖 See markdownlint-rules-reference.md for guidance"
    fi
}

# Run main function
main "$@"
