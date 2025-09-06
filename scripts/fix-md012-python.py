#!/usr/bin/env python3

"""
Simple Python script to fix MD012 violations (multiple consecutive blank lines)
No complex regex, just straightforward line processing
"""

import sys
import os

def fix_multiple_blanks(file_path):
    """Fix multiple consecutive blank lines by keeping only one"""
    print(f"🔧 Fixing MD012 violations in {file_path}...")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Process lines to remove multiple consecutive blank lines
    result_lines = []
    prev_was_blank = False
    
    for line in lines:
        is_blank = line.strip() == ''
        
        if is_blank and prev_was_blank:
            # Skip this blank line (we already have one)
            continue
        else:
            result_lines.append(line)
            prev_was_blank = is_blank
    
    # Ensure file ends with exactly one newline
    if result_lines and result_lines[-1].strip() == '':
        # Remove trailing blank lines
        while result_lines and result_lines[-1].strip() == '':
            result_lines.pop()
        # Add one newline at the end
        result_lines.append('\n')
    elif result_lines and not result_lines[-1].endswith('\n'):
        # Ensure last line ends with newline
        result_lines[-1] = result_lines[-1].rstrip() + '\n'
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(result_lines)
    
    print(f"✅ Fixed MD012 violations in {file_path}")

if __name__ == "__main__":
    target_file = "docs/engineering/session-handoff-complete.md"
    
    if not os.path.exists(target_file):
        print(f"❌ Error: File {target_file} not found!")
        sys.exit(1)
    
    # Create backup
    backup_file = f"{target_file}.backup"
    with open(target_file, 'r') as src, open(backup_file, 'w') as dst:
        dst.write(src.read())
    print(f"📋 Created backup: {backup_file}")
    
    # Fix the file
    fix_multiple_blanks(target_file)
    print("🎉 MD012 fix completed!")
