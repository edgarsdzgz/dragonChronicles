#!/usr/bin/env python3
"""
Fix unused parameters ONLY in interface definitions for S3 files.
This is careful to only modify interface signatures, not implementations.
"""

import re
from pathlib import Path


def fix_interface_only(content: str, filename: str) -> str:
    """Fix parameters only within interface definitions."""
    lines = content.split('\n')
    result = []
    in_interface = False
    interface_name = ''
    brace_count = 0
    
    for i, line in enumerate(lines):
        # Track if we're inside an interface block
        if re.match(r'^export interface \w+', line):
            in_interface = True
            match = re.search(r'interface (\w+)', line)
            if match:
                interface_name = match.group(1)
            result.append(line)
            continue
        
        # Track braces to know when interface ends
        if in_interface:
            brace_count += line.count('{') - line.count('}')
            if brace_count < 0 or ('}' in line and brace_count == 0):
                in_interface = False
                interface_name = ''
                result.append(line)
                continue
        
        # Only fix lines inside interfaces that are method signatures
        if in_interface and '):' in line and not line.strip().startswith('//'):
            # This is a method signature in an interface - safe to prefix
            fixed_line = line
            fixed_line = re.sub(r'\bstate:', r'_state:', fixed_line)
            fixed_line = re.sub(r'\bperiod:', r'_period:', fixed_line)
            fixed_line = re.sub(r'\bavailableCurrency:', r'_availableCurrency:', fixed_line)
            fixed_line = re.sub(r'\btype:', r'_type:', fixed_line)
            fixed_line = re.sub(r'\bcurrentLevels:', r'_currentLevels:', fixed_line)
            fixed_line = re.sub(r'\bamount:', r'_amount:', fixed_line)
            fixed_line = re.sub(r'\bfromLevel:', r'_fromLevel:', fixed_line)
            fixed_line = re.sub(r'\btoLevel:', r'_toLevel:', fixed_line)
            fixed_line = re.sub(r'\bkey:', r'_key:', fixed_line)
            fixed_line = re.sub(r'\boldState:', r'_oldState:', fixed_line)
            fixed_line = re.sub(r'\btargetVersion:', r'_targetVersion:', fixed_line)
            fixed_line = re.sub(r'\blevel:', r'_level:', fixed_line)
            fixed_line = re.sub(r'\bavailableArcana:', r'_availableArcana:', fixed_line)
            fixed_line = re.sub(r'\bavailableSoulPower:', r'_availableSoulPower:', fixed_line)
            result.append(fixed_line)
        else:
            result.append(line)
    
    return '\n'.join(result)


def main():
    repo_root = Path(__file__).parent.parent
    
    files = [
        "packages/sim/src/economy/soul-forging-analytics.ts",
        "packages/sim/src/economy/soul-forging-costs.ts",
        "packages/sim/src/economy/soul-forging-manager.ts",
        "packages/sim/src/economy/soul-forging-persistence.ts",
    ]
    
    print("🔧 S3 Interface-Only Parameter Fixer")
    print("=" * 60)
    
    for file_str in files:
        file_path = repo_root / file_str
        if not file_path.exists():
            print(f"❌ Not found: {file_str}")
            continue
        
        try:
            content = file_path.read_text(encoding='utf-8')
            original = content
            
            content = fix_interface_only(content, file_str)
            
            if content != original:
                file_path.write_text(content, encoding='utf-8')
                print(f"✅ Fixed: {file_str}")
            else:
                print(f"⚠️  No changes: {file_str}")
        except Exception as e:
            print(f"❌ Error: {file_str}: {e}")
    
    print("=" * 60)
    print("🎉 Interface parameter fixes complete!")


if __name__ == "__main__":
    main()

