#!/usr/bin/env python3
"""
Remove all console.log statements from the codebase
"""
import os
import re
import glob

def remove_console_logs(file_path):
    """Remove console.log statements from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove console.log statements (including multi-line ones)
        # Pattern matches: console.log(...); with optional semicolon
        pattern = r'^\s*console\.log\([^;]*\);\s*$'
        content = re.sub(pattern, '', content, flags=re.MULTILINE)
        
        # Remove console.log statements that are part of larger statements
        # Pattern matches: console.log(...) followed by semicolon or comma
        pattern = r'console\.log\([^)]*\);\s*'
        content = re.sub(pattern, '', content)
        
        # Remove standalone console.log statements
        pattern = r'^\s*console\.log\([^)]*\);\s*$'
        content = re.sub(pattern, '', content, flags=re.MULTILINE)
        
        # Clean up multiple empty lines
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Cleaned: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error cleaning {file_path}: {e}")
        return False

def main():
    """Main function"""
    print("🧹 Removing console.log statements from PixiJS systems...")
    
    # Find all TypeScript files in the pixi directory
    pattern = "apps/web/src/lib/pixi/**/*.ts"
    files = glob.glob(pattern, recursive=True)
    
    cleaned_count = 0
    total_count = len(files)
    
    for file_path in files:
        if remove_console_logs(file_path):
            cleaned_count += 1
    
    print(f"\n🎯 Summary:")
    print(f"   Files processed: {cleaned_count}/{total_count}")
    print(f"   Console.log statements removed from PixiJS systems")

if __name__ == "__main__":
    main()
