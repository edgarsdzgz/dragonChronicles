#!/usr/bin/env python3
"""
Script to find and remove orphaned syntax elements left behind by the Python cleanup script.
These are typically closing braces, parentheses, or semicolons that no longer have matching opening elements.
"""

import re
import sys
import os

def find_orphaned_syntax(content):
    """
    Find orphaned syntax elements that are causing compilation errors.
    """
    lines = content.split('\n')
    issues = []
    
    for i, line in enumerate(lines):
        line_num = i + 1
        stripped = line.strip()
        
        # Look for orphaned closing syntax
        if stripped in ['});', '});', '},', '});', '});']:
            # Check if this is preceded by commented out object properties
            context_found = False
            
            # Look at previous lines to see if this is orphaned
            for j in range(max(0, i-10), i):
                prev_line = lines[j].strip()
                if 'REMOVED: Dangling object literal' in prev_line:
                    context_found = True
                    break
                # Also check for legitimate opening contexts
                if any(context in prev_line for context in ['console.log(', '= {', 'new Text({', 'new Graphics()']):
                    context_found = True
                    break
                    
            if context_found and 'REMOVED: Dangling object literal' in '\n'.join(lines[max(0, i-5):i]):
                issues.append({
                    'line': line_num,
                    'content': stripped,
                    'type': 'orphaned_closing_syntax'
                })
    
    return issues

def remove_orphaned_syntax(content, issues):
    """
    Remove the identified orphaned syntax elements.
    """
    lines = content.split('\n')
    
    # Sort issues by line number in descending order to avoid index shifting
    issues.sort(key=lambda x: x['line'], reverse=True)
    
    for issue in issues:
        line_idx = issue['line'] - 1
        
        # Remove the problematic line
        if line_idx < len(lines):
            lines[line_idx] = f"    // {issue['content']} // REMOVED: Orphaned syntax"
    
    return '\n'.join(lines)

def main():
    if len(sys.argv) != 2:
        print("Usage: python cleanup-orphaned-syntax.py <typescript-file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist")
        sys.exit(1)
    
    print(f"Analyzing {file_path} for orphaned syntax elements...")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find orphaned syntax elements
    issues = find_orphaned_syntax(content)
    
    if not issues:
        print("✅ No orphaned syntax elements found!")
        return
    
    print(f"🔍 Found {len(issues)} orphaned syntax elements:")
    for issue in issues:
        print(f"  Line {issue['line']}: {issue['content']}")
    
    # Ask for confirmation
    response = input("\nDo you want to remove these orphaned syntax elements? (y/N): ").strip().lower()
    
    if response == 'y' or response == 'yes':
        # Remove the orphaned syntax
        cleaned_content = remove_orphaned_syntax(content, issues)
        
        # Create backup
        backup_path = file_path + '.backup4'
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"📁 Backup created: {backup_path}")
        
        # Write cleaned content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        
        print(f"✅ Cleaned {len(issues)} orphaned syntax elements from {file_path}")
    else:
        print("❌ Cleanup cancelled")

if __name__ == "__main__":
    main()

