#!/usr/bin/env python3

"""
Memory Markdown Fixer Script

Purpose: Fix markdown linting issues in memory system documentation
Usage: python scripts/fix-memory-markdown.py [file1] [file2] ...

Fixes:
- MD013: Line length (100 chars max)
- MD022: Blank lines around headings
- MD032: Blank lines around lists
- MD031: Blank lines around fenced code blocks
- MD040: Language specification for fenced code blocks
- MD009: Trailing spaces
- MD012: Multiple consecutive blank lines
"""

import sys
import re
from pathlib import Path


def fix_line_length(text, max_length=100):
    """Fix line length issues (MD013)"""
    lines = text.split('\n')
    fixed_lines = []
    
    for line in lines:
        if len(line) <= max_length:
            fixed_lines.append(line)
        else:
            # Try to break at word boundaries
            words = line.split(' ')
            current_line = ""
            
            for word in words:
                if len(current_line + " " + word) <= max_length:
                    if current_line:
                        current_line += " " + word
                    else:
                        current_line = word
                else:
                    if current_line:
                        fixed_lines.append(current_line)
                        current_line = word
                    else:
                        # Single word longer than max_length, keep as is
                        fixed_lines.append(word)
            
            if current_line:
                fixed_lines.append(current_line)
    
    return '\n'.join(fixed_lines)


def fix_blank_lines_around_headings(text):
    """Fix blank lines around headings (MD022)"""
    lines = text.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        fixed_lines.append(line)
        
        # Check if this is a heading
        if re.match(r'^#{1,6}\s', line):
            # Add blank line after heading if not present
            if i + 1 < len(lines) and lines[i + 1].strip() != '':
                fixed_lines.append('')
        elif re.match(r'^#{1,6}\s', line) and i > 0:
            # Add blank line before heading if not present
            if lines[i - 1].strip() != '':
                fixed_lines.insert(-1, '')
    
    return '\n'.join(fixed_lines)


def fix_blank_lines_around_lists(text):
    """Fix blank lines around lists (MD032)"""
    lines = text.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        fixed_lines.append(line)
        
        # Check if this is a list item
        if re.match(r'^\s*[-*+]\s', line) or re.match(r'^\s*\d+\.\s', line):
            # Add blank line before list if not present
            if i > 0 and not re.match(r'^\s*[-*+]\s', lines[i - 1]) and not re.match(r'^\s*\d+\.\s', lines[i - 1]) and lines[i - 1].strip() != '':
                fixed_lines.insert(-1, '')
            
            # Add blank line after list if not present
            if i + 1 < len(lines) and not re.match(r'^\s*[-*+]\s', lines[i + 1]) and not re.match(r'^\s*\d+\.\s', lines[i + 1]) and lines[i + 1].strip() != '':
                fixed_lines.append('')
    
    return '\n'.join(fixed_lines)


def fix_blank_lines_around_fences(text):
    """Fix blank lines around fenced code blocks (MD031)"""
    lines = text.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # Check if this is a fenced code block
        if re.match(r'^```', line):
            # Add blank line before fence if not present
            if i > 0 and lines[i - 1].strip() != '':
                fixed_lines.append('')
            fixed_lines.append(line)
            
            # Add blank line after fence if not present
            if i + 1 < len(lines) and lines[i + 1].strip() != '':
                fixed_lines.append('')
        else:
            fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)


def fix_fenced_code_language(text):
    """Fix fenced code blocks without language specification (MD040)"""
    # Add language specification to fenced code blocks that don't have one
    text = re.sub(r'^```$', '```text', text, flags=re.MULTILINE)
    return text


def fix_trailing_spaces(text):
    """Fix trailing spaces (MD009)"""
    lines = text.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Remove trailing spaces
        fixed_lines.append(line.rstrip())
    
    return '\n'.join(fixed_lines)


def fix_multiple_blank_lines(text):
    """Fix multiple consecutive blank lines (MD012)"""
    # Replace multiple consecutive blank lines with single blank line
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    return text


def fix_markdown_file(file_path):
    """Fix all markdown issues in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"Fixing {file_path}...")
        
        # Apply all fixes
        content = fix_trailing_spaces(content)
        content = fix_multiple_blank_lines(content)
        content = fix_blank_lines_around_headings(content)
        content = fix_blank_lines_around_lists(content)
        content = fix_blank_lines_around_fences(content)
        content = fix_fenced_code_language(content)
        content = fix_line_length(content)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python scripts/fix-memory-markdown.py [file1] [file2] ...")
        print("Example: python scripts/fix-memory-markdown.py memory.md docs/engineering/memory-system-usage.md")
        sys.exit(1)
    
    files = sys.argv[1:]
    success_count = 0
    
    for file_path in files:
        if Path(file_path).exists():
            if fix_markdown_file(file_path):
                success_count += 1
        else:
            print(f"❌ File not found: {file_path}")
    
    print(f"\n✅ Successfully fixed {success_count}/{len(files)} files")


if __name__ == "__main__":
    main()
