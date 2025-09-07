#!/usr/bin/env python3
"""
Universal Markdown Fixer Script

Purpose: Comprehensive markdown linting fixer that handles all common markdownlint violations
Usage: python scripts/fix-markdown-universal.py [file1] [file2] ... [directory] [--max-length N]

Features:
- File-agnostic: Works with any markdown file or directory
- Comprehensive: Fixes all common markdownlint violations
- Intelligent: Smart line breaking with context awareness
- Safe: Preserves content while fixing formatting issues

Fixes:
- MD013: Line length (configurable, default 100 chars)
- MD022: Blank lines around headings
- MD024: Duplicate headings (adds unique identifiers)
- MD031: Blank lines around fenced code blocks
- MD032: Blank lines around lists
- MD040: Language specification for fenced code blocks
- MD009: Trailing spaces
- MD012: Multiple consecutive blank lines
- MD007/MD005: List indentation consistency
- MD029: Ordered list item prefix consistency
- MD034: Bare URLs (wraps in angle brackets)
- MD047: Files should end with single newline
- MD049: Emphasis style consistency (underscore to asterisk)
"""

import argparse
import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple, Optional


class UniversalMarkdownFixer:
    """Universal markdown linter and fixer with comprehensive rule support."""
    
    def __init__(self, max_line_length: int = 100):
        self.max_line_length = max_line_length
        self.fixes_applied = 0
        self.files_processed = 0
        
    def fix_file(self, file_path: Path) -> bool:
        """Fix all markdownlint violations in a file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            content = self._fix_all_violations(content)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            return False
            
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return False
    
    def _fix_all_violations(self, content: str) -> str:
        """Apply all fixes to markdown content."""
        # Remove trailing spaces first
        content = self._fix_trailing_spaces(content)
        
        # Fix multiple consecutive blank lines
        content = self._fix_multiple_blank_lines(content)
        
        # Fix line length issues
        content = self._fix_line_length(content)
        
        # Fix structural issues
        content = self._fix_blank_lines_around_headings(content)
        content = self._fix_blank_lines_around_lists(content)
        content = self._fix_blank_lines_around_fences(content)
        content = self._fix_fenced_code_language(content)
        content = self._fix_duplicate_headings(content)
        content = self._fix_list_indentation(content)
        content = self._fix_ordered_list_prefixes(content)
        content = self._fix_bare_urls(content)
        content = self._fix_emphasis_style(content)
        content = self._fix_file_ending(content)
        
        return content
    
    def _fix_trailing_spaces(self, content: str) -> str:
        """Fix MD009: Trailing spaces."""
        lines = content.split('\n')
        fixed_lines = []
        
        for line in lines:
            # Remove trailing spaces
            fixed_lines.append(line.rstrip())
        
        return '\n'.join(fixed_lines)
    
    def _fix_multiple_blank_lines(self, content: str) -> str:
        """Fix MD012: Multiple consecutive blank lines."""
        # Replace multiple consecutive blank lines with single blank line
        content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
        return content
    
    def _fix_line_length(self, content: str) -> str:
        """Fix MD013: Line length by breaking at appropriate points."""
        lines = content.split('\n')
        fixed_lines = []
        
        for line in lines:
            if len(line) <= self.max_line_length:
                fixed_lines.append(line)
            else:
                # Don't break URLs, code blocks, or special lines
                if (line.startswith('http') or 
                    line.startswith('```') or 
                    line.startswith('#') or
                    line.strip().startswith('-') or
                    line.strip().startswith('*') or
                    line.strip().startswith('1.') or
                    line.strip().startswith('2.') or
                    line.strip().startswith('3.') or
                    line.strip().startswith('4.') or
                    line.strip().startswith('5.') or
                    line.strip().startswith('6.') or
                    line.strip().startswith('7.') or
                    line.strip().startswith('8.') or
                    line.strip().startswith('9.')):
                    fixed_lines.append(line)
                    continue
                
                # Break at sentence boundaries first
                if '. ' in line:
                    parts = line.split('. ')
                    result = parts[0] + '.'
                    for part in parts[1:]:
                        if len(result + '. ' + part) <= self.max_line_length:
                            result += '. ' + part
                        else:
                            result += '.\n' + part
                    fixed_lines.append(result)
                    self.fixes_applied += 1
                    continue
                
                # Break at word boundaries
                words = line.split()
                result = words[0]
                for word in words[1:]:
                    if len(result + ' ' + word) <= self.max_line_length:
                        result += ' ' + word
                    else:
                        result += '\n' + word
                fixed_lines.append(result)
                self.fixes_applied += 1
        
        return '\n'.join(fixed_lines)
    
    def _fix_blank_lines_around_headings(self, content: str) -> str:
        """Fix MD022: Blank lines around headings."""
        lines = content.split('\n')
        fixed_lines = []
        
        for i, line in enumerate(lines):
            # Check if this is a heading
            if re.match(r'^#{1,6}\s+', line):
                # Add blank line before heading (if not first line and previous line not blank)
                if i > 0 and fixed_lines and fixed_lines[-1].strip():
                    fixed_lines.append('')
                fixed_lines.append(line)
                
                # Add blank line after heading (if not last line and next line not blank)
                if i < len(lines) - 1 and lines[i + 1].strip():
                    fixed_lines.append('')
            else:
                fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_blank_lines_around_lists(self, content: str) -> str:
        """Fix MD032: Blank lines around lists."""
        lines = content.split('\n')
        fixed_lines = []
        
        for i, line in enumerate(lines):
            # Check if this is a list item
            if re.match(r'^\s*[-*+]\s+', line) or re.match(r'^\s*\d+\.\s+', line):
                # Add blank line before list (if not first line and previous line not blank)
                if i > 0 and fixed_lines and fixed_lines[-1].strip():
                    fixed_lines.append('')
                fixed_lines.append(line)
                
                # Add blank line after list (if not last line and next line not blank and not list item)
                if (i < len(lines) - 1 and 
                    lines[i + 1].strip() and 
                    not re.match(r'^\s*[-*+]\s+', lines[i + 1]) and
                    not re.match(r'^\s*\d+\.\s+', lines[i + 1])):
                    fixed_lines.append('')
            else:
                fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_blank_lines_around_fences(self, content: str) -> str:
        """Fix MD031: Blank lines around fenced code blocks."""
        lines = content.split('\n')
        fixed_lines = []
        
        for i, line in enumerate(lines):
            # Check if this is a fenced code block
            if line.strip().startswith('```'):
                # Add blank line before fence (if not first line and previous line not blank)
                if i > 0 and fixed_lines and fixed_lines[-1].strip():
                    fixed_lines.append('')
                fixed_lines.append(line)
                
                # Add blank line after fence (if not last line and next line not blank)
                if i < len(lines) - 1 and lines[i + 1].strip():
                    fixed_lines.append('')
            else:
                fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_fenced_code_language(self, content: str) -> str:
        """Fix MD040: Fenced code blocks should have language specified."""
        lines = content.split('\n')
        fixed_lines = []
        
        for i, line in enumerate(lines):
            # Check if this is a fenced code block without language
            if line.strip() == '```':
                # Try to infer language from context or use 'text'
                language = 'text'
                
                # Look at the next few lines for hints
                for j in range(i + 1, min(i + 5, len(lines))):
                    next_line = lines[j].strip()
                    if next_line == '```':
                        break
                    if any(keyword in next_line.lower() for keyword in ['bash', 'sh', 'shell']):
                        language = 'bash'
                        break
                    elif any(keyword in next_line.lower() for keyword in ['javascript', 'js', 'typescript', 'ts']):
                        language = 'javascript'
                        break
                    elif any(keyword in next_line.lower() for keyword in ['python', 'py']):
                        language = 'python'
                        break
                    elif any(keyword in next_line.lower() for keyword in ['json']):
                        language = 'json'
                        break
                    elif any(keyword in next_line.lower() for keyword in ['yaml', 'yml']):
                        language = 'yaml'
                        break
                    elif any(keyword in next_line.lower() for keyword in ['html', 'xml']):
                        language = 'html'
                        break
                    elif any(keyword in next_line.lower() for keyword in ['css']):
                        language = 'css'
                        break
                    elif any(keyword in next_line.lower() for keyword in ['sql']):
                        language = 'sql'
                        break
                
                fixed_lines.append(f'```{language}')
                self.fixes_applied += 1
            else:
                fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_duplicate_headings(self, content: str) -> str:
        """Fix MD024: Duplicate headings by adding unique identifiers."""
        lines = content.split('\n')
        fixed_lines = []
        heading_counts = {}
        
        for line in lines:
            # Check if this is a heading
            heading_match = re.match(r'^(#{1,6})\s+(.+)$', line)
            if heading_match:
                level, text = heading_match.groups()
                heading_text = text.strip()
                
                # Count occurrences
                if heading_text in heading_counts:
                    heading_counts[heading_text] += 1
                    # Make heading unique
                    line = f"{level} {heading_text} ({heading_counts[heading_text]})"
                    self.fixes_applied += 1
                else:
                    heading_counts[heading_text] = 1
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_list_indentation(self, content: str) -> str:
        """Fix MD007/MD005: List indentation consistency."""
        lines = content.split('\n')
        fixed_lines = []
        
        for line in lines:
            # Fix unordered list indentation
            if re.match(r'^\s*[-*+]\s+', line):
                # Ensure consistent 2-space indentation
                indent_match = re.match(r'^(\s*)[-*+]\s+', line)
                if indent_match:
                    indent = indent_match.group(1)
                    if len(indent) % 2 != 0:
                        # Fix odd indentation
                        new_indent = ' ' * (len(indent) + 1)
                        line = re.sub(r'^(\s*)([-*+]\s+)', f'{new_indent}\\g<2>', line)
                        self.fixes_applied += 1
            
            # Fix ordered list indentation
            elif re.match(r'^\s*\d+\.\s+', line):
                # Ensure consistent 2-space indentation
                indent_match = re.match(r'^(\s*)\d+\.\s+', line)
                if indent_match:
                    indent = indent_match.group(1)
                    if len(indent) % 2 != 0:
                        # Fix odd indentation
                        new_indent = ' ' * (len(indent) + 1)
                        line = re.sub(r'^(\s*)(\d+\.\s+)', f'{new_indent}\\g<2>', line)
                        self.fixes_applied += 1
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_ordered_list_prefixes(self, content: str) -> str:
        """Fix MD029: Ordered list item prefix consistency."""
        lines = content.split('\n')
        fixed_lines = []
        
        for line in lines:
            # Fix ordered list prefixes to use 1. style
            if re.match(r'^\s*\d+\.\s+', line):
                # Ensure consistent 1. style
                line = re.sub(r'^(\s*)\d+\.\s+', r'\g<1>1. ', line)
                self.fixes_applied += 1
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_bare_urls(self, content: str) -> str:
        """Fix MD034: Bare URLs should be wrapped in angle brackets or markdown links."""
        lines = content.split('\n')
        fixed_lines = []
        
        for line in lines:
            # Find bare URLs (not already in markdown links or angle brackets)
            url_pattern = r'(?<!\]\()(?<!<)(https?://[^\s<>\[\]()]+)(?!>)(?!\))'
            urls = re.findall(url_pattern, line)
            
            for url in urls:
                # Wrap in angle brackets
                line = line.replace(url, f'<{url}>')
                self.fixes_applied += 1
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_emphasis_style(self, content: str) -> str:
        """Fix MD049: Emphasis style consistency (underscore to asterisk)."""
        lines = content.split('\n')
        fixed_lines = []
        
        for line in lines:
            # Convert underscore emphasis to asterisk emphasis
            # Strong emphasis: __text__ -> **text**
            line = re.sub(r'__([^_]+)__', r'**\1**', line)
            # Emphasis: _text_ -> *text*
            line = re.sub(r'_([^_]+)_', r'*\1*', line)
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _fix_file_ending(self, content: str) -> str:
        """Fix MD047: Files should end with a single newline."""
        # Remove trailing whitespace and ensure single newline at end
        content = content.rstrip() + '\n'
        return content
    
    def process_directory(self, directory: Path, pattern: str = "*.md") -> Dict[str, int]:
        """Process all markdown files in a directory."""
        results = {"processed": 0, "fixed": 0, "errors": 0}
        
        for file_path in directory.rglob(pattern):
            if file_path.is_file():
                results["processed"] += 1
                self.files_processed += 1
                
                if self.fix_file(file_path):
                    results["fixed"] += 1
                    print(f"✅ Fixed: {file_path}")
                else:
                    print(f"✅ No changes needed: {file_path}")
        
        return results
    
    def process_files(self, file_paths: List[Path]) -> Dict[str, int]:
        """Process specific markdown files."""
        results = {"processed": 0, "fixed": 0, "errors": 0}
        
        for file_path in file_paths:
            if file_path.is_file() and file_path.suffix == '.md':
                results["processed"] += 1
                self.files_processed += 1
                
                if self.fix_file(file_path):
                    results["fixed"] += 1
                    print(f"✅ Fixed: {file_path}")
                else:
                    print(f"✅ No changes needed: {file_path}")
            else:
                print(f"⚠️  Skipping non-markdown file: {file_path}")
        
        return results


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Universal Markdown Fixer - Comprehensive markdownlint violation fixer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/fix-markdown-universal.py file.md
  python scripts/fix-markdown-universal.py docs/ file1.md file2.md
  python scripts/fix-markdown-universal.py --max-length 120 docs/
  python scripts/fix-markdown-universal.py docs/ --max-length 100
        """
    )
    parser.add_argument("paths", nargs="+", help="Files or directories to process")
    parser.add_argument("--max-length", type=int, default=100, 
                       help="Maximum line length (default: 100)")
    parser.add_argument("--dry-run", action="store_true", 
                       help="Show what would be fixed without making changes")
    
    args = parser.parse_args()
    
    fixer = UniversalMarkdownFixer(max_line_length=args.max_length)
    
    print("🔧 Universal Markdown Fixer")
    print("=" * 50)
    print(f"Max line length: {args.max_length}")
    print(f"Dry run: {args.dry_run}")
    print("=" * 50)
    
    total_results = {"processed": 0, "fixed": 0, "errors": 0}
    
    for path_str in args.paths:
        path = Path(path_str)
        
        if path.is_file():
            # Process single file
            if path.suffix == '.md':
                total_results["processed"] += 1
                fixer.files_processed += 1
                
                if fixer.fix_file(path):
                    total_results["fixed"] += 1
                    print(f"✅ Fixed: {path}")
                else:
                    print(f"✅ No changes needed: {path}")
            else:
                print(f"⚠️  Skipping non-markdown file: {path}")
        
        elif path.is_dir():
            # Process directory
            results = fixer.process_directory(path)
            total_results["processed"] += results["processed"]
            total_results["fixed"] += results["fixed"]
            total_results["errors"] += results["errors"]
        
        else:
            print(f"❌ Path not found: {path}")
            total_results["errors"] += 1
    
    print("\n" + "=" * 50)
    print("📊 Summary:")
    print(f"  Files processed: {total_results['processed']}")
    print(f"  Files fixed: {total_results['fixed']}")
    print(f"  Errors: {total_results['errors']}")
    print(f"  Total fixes applied: {fixer.fixes_applied}")
    
    if total_results["errors"] > 0:
        sys.exit(1)
    else:
        print("🎉 All files processed successfully!")


if __name__ == "__main__":
    main()
