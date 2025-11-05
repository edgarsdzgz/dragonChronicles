#!/usr/bin/env python3
"""
Find unmatched braces in TypeScript files
"""

import sys
import re

def find_unmatched_braces(file_path):
    """Find unmatched braces in a file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Track brace depth and line numbers
    brace_depth = 0
    paren_depth = 0
    bracket_depth = 0
    
    unmatched_opens = []
    unmatched_closes = []
    
    for line_num, line in enumerate(lines, 1):
        # Remove comments to avoid counting braces in comments
        line = re.sub(r'//.*$', '', line)
        line = re.sub(r'/\*.*?\*/', '', line, flags=re.DOTALL)
        
        for char in line:
            if char == '{':
                brace_depth += 1
                unmatched_opens.append((line_num, 'brace'))
            elif char == '}':
                brace_depth -= 1
                if brace_depth < 0:
                    unmatched_closes.append((line_num, 'brace'))
                    brace_depth = 0
                else:
                    unmatched_opens.pop()
            elif char == '(':
                paren_depth += 1
                unmatched_opens.append((line_num, 'paren'))
            elif char == ')':
                paren_depth -= 1
                if paren_depth < 0:
                    unmatched_closes.append((line_num, 'paren'))
                    paren_depth = 0
                else:
                    unmatched_opens.pop()
            elif char == '[':
                bracket_depth += 1
                unmatched_opens.append((line_num, 'bracket'))
            elif char == ']':
                bracket_depth -= 1
                if bracket_depth < 0:
                    unmatched_closes.append((line_num, 'bracket'))
                    bracket_depth = 0
                else:
                    unmatched_opens.pop()
    
    print(f"Analysis of {file_path}:")
    print(f"Final brace depth: {brace_depth}")
    print(f"Final paren depth: {paren_depth}")
    print(f"Final bracket depth: {bracket_depth}")
    
    if unmatched_opens:
        print(f"\nUnmatched opening braces/parens/brackets:")
        for line_num, brace_type in unmatched_opens:
            print(f"  Line {line_num}: {brace_type}")
    
    if unmatched_closes:
        print(f"\nUnmatched closing braces/parens/brackets:")
        for line_num, brace_type in unmatched_closes:
            print(f"  Line {line_num}: {brace_type}")
    
    if not unmatched_opens and not unmatched_closes:
        print("All braces are matched!")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python find-unmatched-braces.py <file>")
        sys.exit(1)
    
    find_unmatched_braces(sys.argv[1])
