#!/usr/bin/env python3
"""
Fix all orphaned syntax elements in scrolling-background.ts
This script finds and removes orphaned closing braces, parentheses, and semicolons
that were left behind by previous cleanup attempts.
"""

import re
import sys

def fix_orphaned_syntax(file_path):
    """Fix all orphaned syntax elements in the file."""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: Orphaned }); at the beginning of lines (common pattern)
    content = re.sub(r'^\s*}\);\s*$', '', content, flags=re.MULTILINE)
    
    # Pattern 2: Orphaned ); at the beginning of lines
    content = re.sub(r'^\s*\);\s*$', '', content, flags=re.MULTILINE)
    
    # Pattern 3: Orphaned }); after commented lines
    content = re.sub(r'^\s*//.*\n\s*}\);\s*$', '', content, flags=re.MULTILINE)
    
    # Pattern 4: Orphaned ); after commented lines
    content = re.sub(r'^\s*//.*\n\s*\);\s*$', '', content, flags=re.MULTILINE)
    
    # Pattern 5: Lines that are just orphaned syntax
    content = re.sub(r'^\s*[}\)];?\s*$', '', content, flags=re.MULTILINE)
    
    # Pattern 6: Clean up multiple consecutive empty lines (max 2)
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    
    # Pattern 7: Remove lines that are just comments with no content
    content = re.sub(r'^\s*//.*debug.*removed.*clean.*code\s*$', '', content, flags=re.MULTILINE | re.IGNORECASE)
    
    # Pattern 8: Clean up any remaining orphaned object literals
    content = re.sub(r'^\s*//.*REMOVED.*Dangling object literal.*\n', '', content, flags=re.MULTILINE)
    
    # Pattern 9: Remove any remaining orphaned closing syntax
    content = re.sub(r'^\s*[}\]\)]+;\s*$', '', content, flags=re.MULTILINE)
    
    # Write the cleaned content back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Count changes
    changes = len(original_content.split('\n')) - len(content.split('\n'))
    
    print(f"Fixed {changes} orphaned syntax elements in {file_path}")
    return changes

if __name__ == "__main__":
    file_path = "apps/web/src/lib/pixi/scrolling-background.ts"
    changes = fix_orphaned_syntax(file_path)
    print(f"Total changes made: {changes}")

