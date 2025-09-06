#!/usr/bin/env python3

"""
Final MD012 fix for session-handoff-complete.md
Simple, reliable approach to remove multiple consecutive blank lines
"""

import sys
import os

def fix_md012_final(file_path):
    """Fix MD012 violations by removing multiple consecutive blank lines"""
    print(f"🔧 Fixing MD012 violations in {file_path}...")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"📊 Original file has {len(lines)} lines")
    
    # Process lines to remove multiple consecutive blank lines
    result_lines = []
    prev_was_blank = False
    
    for i, line in enumerate(lines):
        is_blank = line.strip() == ''
        
        if is_blank and prev_was_blank:
            # Skip this blank line (we already have one)
            print(f"  Skipping blank line {i+1}")
            continue
        else:
            result_lines.append(line)
            prev_was_blank = is_blank
    
    # Remove any trailing blank lines and ensure file ends with exactly one newline
    while result_lines and result_lines[-1].strip() == '':
        print(f"  Removing trailing blank line")
        result_lines.pop()
    
    # Add exactly one newline at the end
    result_lines.append('\n')
    
    print(f"📊 Processed file has {len(result_lines)} lines")
    
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
    fix_md012_final(target_file)
    print("🎉 MD012 fix completed!")
