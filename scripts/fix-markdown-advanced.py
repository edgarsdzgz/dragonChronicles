#!/usr/bin/env python3
"""
Advanced Markdown Fix Script for Draconia Chronicles
Fixes complex markdownlint violations that bash scripts can't handle
"""

import re
import os
import glob
import sys
from pathlib import Path

class MarkdownFixer:
    def __init__(self):
        self.fixes_applied = 0
        self.files_processed = 0
        
    def fix_trailing_spaces(self, content):
        """Fix MD009: Remove trailing spaces"""
        original = content
        # Remove trailing spaces and tabs
        content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)
        if content != original:
            self.fixes_applied += 1
        return content
    
    def fix_code_block_language(self, content):
        """Fix MD040: Add language to code blocks without language"""
        original = content
        # Fix standalone ``` without language
        content = re.sub(r'^```$', '```text', content, flags=re.MULTILINE)
        if content != original:
            self.fixes_applied += 1
        return content
    
    def fix_heading_spacing(self, content):
        """Fix MD022: Add blank lines around headings"""
        original = content
        lines = content.split('\n')
        new_lines = []
        
        for i, line in enumerate(lines):
            # Check if line is a heading
            if re.match(r'^#{1,6}\s', line):
                # Add blank line before heading (if not first line and previous line not blank)
                if i > 0 and lines[i-1].strip() != '':
                    new_lines.append('')
                
                new_lines.append(line)
                
                # Add blank line after heading (if not last line and next line not blank)
                if i < len(lines) - 1 and lines[i+1].strip() != '':
                    new_lines.append('')
            else:
                new_lines.append(line)
        
        content = '\n'.join(new_lines)
        if content != original:
            self.fixes_applied += 1
        return content
    
    def fix_list_spacing(self, content):
        """Fix MD032: Add blank lines around lists"""
        original = content
        lines = content.split('\n')
        new_lines = []
        
        for i, line in enumerate(lines):
            # Check if line is a list item
            if re.match(r'^[\s]*[-*+]\s', line) or re.match(r'^[\s]*\d+\.\s', line):
                # Add blank line before list (if not first line and previous line not blank)
                if i > 0 and lines[i-1].strip() != '' and not re.match(r'^[\s]*[-*+]\s', lines[i-1]) and not re.match(r'^[\s]*\d+\.\s', lines[i-1]):
                    new_lines.append('')
                
                new_lines.append(line)
                
                # Add blank line after list (if not last line and next line not blank and not list item)
                if i < len(lines) - 1 and lines[i+1].strip() != '' and not re.match(r'^[\s]*[-*+]\s', lines[i+1]) and not re.match(r'^[\s]*\d+\.\s', lines[i+1]):
                    new_lines.append('')
            else:
                new_lines.append(line)
        
        content = '\n'.join(new_lines)
        if content != original:
            self.fixes_applied += 1
        return content
    
    def fix_code_block_spacing(self, content):
        """Fix MD031: Add blank lines around code blocks"""
        original = content
        lines = content.split('\n')
        new_lines = []
        in_code_block = False
        
        for i, line in enumerate(lines):
            # Check if line starts a code block
            if re.match(r'^```', line):
                if not in_code_block:
                    # Starting code block - add blank line before if previous line not blank
                    if i > 0 and lines[i-1].strip() != '':
                        new_lines.append('')
                    in_code_block = True
                else:
                    # Ending code block - add blank line after if next line not blank
                    if i < len(lines) - 1 and lines[i+1].strip() != '':
                        new_lines.append('')
                    in_code_block = False
                
                new_lines.append(line)
            else:
                new_lines.append(line)
        
        content = '\n'.join(new_lines)
        if content != original:
            self.fixes_applied += 1
        return content
    
    def fix_line_length(self, content):
        """Fix MD013: Break long lines (basic implementation)"""
        original = content
        lines = content.split('\n')
        new_lines = []
        
        for line in lines:
            if len(line) > 100:
                # Simple word-based breaking
                words = line.split(' ')
                current_line = ''
                
                for word in words:
                    if len(current_line + ' ' + word) <= 100:
                        if current_line:
                            current_line += ' ' + word
                        else:
                            current_line = word
                    else:
                        if current_line:
                            new_lines.append(current_line)
                            current_line = word
                        else:
                            # Single word longer than 100 chars - keep as is
                            new_lines.append(word)
                
                if current_line:
                    new_lines.append(current_line)
            else:
                new_lines.append(line)
        
        content = '\n'.join(new_lines)
        if content != original:
            self.fixes_applied += 1
        return content
    
    def fix_emphasis_style(self, content):
        """Fix MD049: Use asterisks for emphasis instead of underscores"""
        original = content
        # Replace _text_ with *text* (but not in code blocks)
        content = re.sub(r'(?<!`)_([^_]+)_(?!`)', r'*\1*', content)
        if content != original:
            self.fixes_applied += 1
        return content
    
    def fix_horizontal_rules(self, content):
        """Fix MD035: Use --- for horizontal rules"""
        original = content
        # Replace *** and ___ with ---
        content = re.sub(r'^(\*{3,}|_{3,})$', '---', content, flags=re.MULTILINE)
        if content != original:
            self.fixes_applied += 1
        return content
    
    def fix_file(self, filepath):
        """Fix all violations in a single file"""
        print(f"Processing {filepath}...")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Apply all fixes
            content = self.fix_trailing_spaces(content)
            content = self.fix_code_block_language(content)
            content = self.fix_heading_spacing(content)
            content = self.fix_list_spacing(content)
            content = self.fix_code_block_spacing(content)
            content = self.fix_line_length(content)
            content = self.fix_emphasis_style(content)
            content = self.fix_horizontal_rules(content)
            
            # Write back if changes were made
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  ✅ Fixed {self.fixes_applied} violations")
            else:
                print(f"  ✅ No violations found")
            
            self.files_processed += 1
            
        except Exception as e:
            print(f"  ❌ Error processing {filepath}: {e}")
    
    def fix_directory(self, directory):
        """Fix all markdown files in a directory"""
        md_files = glob.glob(f'{directory}/**/*.md', recursive=True)
        
        print(f"Found {len(md_files)} markdown files to process...")
        
        for filepath in md_files:
            self.fix_file(filepath)
        
        print(f"\n📊 Summary:")
        print(f"  Files processed: {self.files_processed}")
        print(f"  Total fixes applied: {self.fixes_applied}")

def main():
    """Main function"""
    if len(sys.argv) > 1:
        target = sys.argv[1]
    else:
        target = 'docs/'
    
    if not os.path.exists(target):
        print(f"Error: {target} does not exist")
        sys.exit(1)
    
    fixer = MarkdownFixer()
    
    if os.path.isfile(target):
        fixer.fix_file(target)
    else:
        fixer.fix_directory(target)
    
    print(f"\n🎯 Next steps:")
    print(f"  1. Run 'pnpm run docs:lint' to check remaining violations")
    print(f"  2. Fix any remaining violations manually")
    print(f"  3. Commit your changes")

if __name__ == "__main__":
    main()
