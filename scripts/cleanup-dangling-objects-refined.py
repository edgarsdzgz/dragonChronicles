#!/usr/bin/env python3
"""
Refined script to find and remove ONLY the problematic dangling object literals
that are causing syntax errors (remnants from removed console.log statements).
"""

import re
import sys
import os

def find_problematic_dangling_objects(content):
    """
    Find ONLY the problematic dangling object literals that are causing syntax errors.
    These are typically standalone object properties without proper context.
    """
    lines = content.split('\n')
    issues = []
    
    for i, line in enumerate(lines):
        line_num = i + 1
        stripped = line.strip()
        
        # Skip empty lines, comments, and proper statements
        if not stripped or stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            continue
            
        # Skip interface definitions, type definitions, function parameters, etc.
        if any(keyword in stripped for keyword in ['interface ', 'type ', 'function ', 'const ', 'let ', 'var ', 'return ', '= {', '}: {', '): {']):
            continue
            
        # Skip enum definitions and object property definitions
        if any(keyword in stripped for keyword in [': number;', ': string;', ': boolean;', ': any;', ': Graphics;', ': Container;', ': Sprite;']):
            continue
            
        # Skip method definitions
        if any(keyword in stripped for keyword in ['(): void;', '(): boolean;', '(): number;', '(): string;', '() => void;', '() => boolean;', '() => number;', '() => string;']):
            continue
            
        # Look for standalone object properties (key: value, pattern) that are NOT part of proper contexts
        if re.match(r'^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*[^=]', stripped):
            # Check if it's part of a multi-line object literal that should be removed
            # Look backwards to see if there's a proper opening context
            context_found = False
            
            # Check previous lines for proper context
            for j in range(max(0, i-3), i):
                prev_line = lines[j].strip()
                if any(context in prev_line for context in ['console.log(', 'console.warn(', 'console.error(', 'return {', '= {', '}: {', '): {', 'userData = {', 'style: {', 'text: {', 'interface ', 'type ']):
                    context_found = True
                    break
                    
            # Also check if this looks like a legitimate object property (not a dangling one)
            if any(legit in stripped for legit in ['app.screen', 'texture.', 'sprite.', 'graphics.', 'position:', 'scale:', 'width:', 'height:', 'visible:', 'alpha:']):
                context_found = True
                    
            if not context_found:
                issues.append({
                    'line': line_num,
                    'content': stripped,
                    'type': 'dangling_object_property'
                })
    
    return issues

def remove_dangling_objects(content, issues):
    """
    Remove the identified dangling object literals from the content.
    """
    lines = content.split('\n')
    
    # Sort issues by line number in descending order to avoid index shifting
    issues.sort(key=lambda x: x['line'], reverse=True)
    
    for issue in issues:
        line_idx = issue['line'] - 1
        
        # Remove the problematic line
        if line_idx < len(lines):
            lines[line_idx] = f"    // {issue['content']} // REMOVED: Dangling object literal"
    
    return '\n'.join(lines)

def main():
    if len(sys.argv) != 2:
        print("Usage: python cleanup-dangling-objects-refined.py <typescript-file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist")
        sys.exit(1)
    
    print(f"Analyzing {file_path} for problematic dangling objects...")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find problematic dangling object literals
    issues = find_problematic_dangling_objects(content)
    
    if not issues:
        print("✅ No problematic dangling object literals found!")
        return
    
    print(f"🔍 Found {len(issues)} problematic dangling object literals:")
    for issue in issues:
        print(f"  Line {issue['line']}: {issue['content']}")
    
    # Ask for confirmation
    response = input("\nDo you want to remove these problematic dangling objects? (y/N): ").strip().lower()
    
    if response == 'y' or response == 'yes':
        # Remove the dangling objects
        cleaned_content = remove_dangling_objects(content, issues)
        
        # Create backup
        backup_path = file_path + '.backup2'
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"📁 Backup created: {backup_path}")
        
        # Write cleaned content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        
        print(f"✅ Cleaned {len(issues)} problematic dangling object literals from {file_path}")
    else:
        print("❌ Cleanup cancelled")

if __name__ == "__main__":
    main()

