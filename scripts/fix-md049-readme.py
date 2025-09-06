#!/usr/bin/env python3

"""
Fix MD049 violations in README.md - convert underscores to asterisks
"""

import sys
import os
import re

def fix_md049_readme(file_path):
    """Fix MD049 violations by converting underscore emphasis to asterisk emphasis"""
    print(f"🔧 Fixing MD049 violations in {file_path}...")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Count violations before fix
    underscore_count = len(re.findall(r'_[^_]+_', content))
    print(f"📊 Found {underscore_count} underscore emphasis patterns")
    
    # Fix MD049: Convert underscore emphasis to asterisk emphasis
    # Pattern: _text_ -> *text*
    fixed_content = re.sub(r'_([^_]+)_', r'*\1*', content)
    
    # Count violations after fix
    asterisk_count = len(re.findall(r'\*[^*]+\*', fixed_content))
    print(f"📊 Converted to {asterisk_count} asterisk emphasis patterns")
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"✅ Fixed MD049 violations in {file_path}")

if __name__ == "__main__":
    target_file = "docs/optimization/README.md"
    
    if not os.path.exists(target_file):
        print(f"❌ Error: File {target_file} not found!")
        sys.exit(1)
    
    # Create backup
    backup_file = f"{target_file}.backup"
    with open(target_file, 'r') as src, open(backup_file, 'w') as dst:
        dst.write(src.read())
    print(f"📋 Created backup: {backup_file}")
    
    # Fix the file
    fix_md049_readme(target_file)
    print("🎉 MD049 fix completed!")
