#!/usr/bin/env python3
"""
Fix interface method signature parameters by prefixing with underscore.
Only fixes parameters in method signatures within interfaces, not implementations.
"""

import re
from pathlib import Path


def fix_interface_params(content: str) -> str:
    """Fix parameters in interface method signatures."""
    lines = content.split('\n')
    result = []
    in_interface = False
    
    for line in lines:
        # Track if we're inside an interface
        if re.match(r'^export interface \w+', line):
            in_interface = True
        elif in_interface and re.match(r'^\}', line):
            in_interface = False
        
        # Only fix parameters if we're inside an interface
        if in_interface and '(' in line and '):' in line:
            # This is a method signature - fix the parameters
            # Match patterns like: methodName(param: Type, param2: Type2): ReturnType;
            line = re.sub(r'\b(type):', r'_\1:', line)
            line = re.sub(r'\b(category):', r'_\1:', line)
            line = re.sub(r'\b(amount):', r'_\1:', line)
            line = re.sub(r'\b(currency):', r'_\1:', line)
            line = re.sub(r'\b(level):', r'_\1:', line)
            line = re.sub(r'\b(location):', r'_\1:', line)
            line = re.sub(r'\b(fromLevel):', r'_\1:', line)
            line = re.sub(r'\b(toLevel):', r'_\1:', line)
            line = re.sub(r'\b(currentLevel):', r'_\1:', line)
            line = re.sub(r'\b(baseCost):', r'_\1:', line)
            line = re.sub(r'\b(source):', r'_\1:', line)
            line = re.sub(r'\b(enemyType):', r'_\1:', line)
            line = re.sub(r'\b(distance):', r'_\1:', line)
            line = re.sub(r'\b(ward):', r'_\1:', line)
            line = re.sub(r'\b(bossType):', r'_\1:', line)
            line = re.sub(r'\b(dropChance):', r'_\1:', line)
            line = re.sub(r'\b(scalingFactor):', r'_\1:', line)
            line = re.sub(r'\b(arcanaAmount):', r'_\1:', line)
            line = re.sub(r'\b(reason):', r'_\1:', line)
        
        result.append(line)
    
    return '\n'.join(result)


def main():
    repo_root = Path(__file__).parent.parent
    
    files_to_fix = [
        "packages/sim/src/economy/enchant-types.ts",
        "packages/sim/src/economy/types.ts",
    ]
    
    print("🔧 Interface Parameter Fixer")
    print("=" * 60)
    
    for file_path_str in files_to_fix:
        full_path = repo_root / file_path_str
        if not full_path.exists():
            print(f"❌ File not found: {file_path_str}")
            continue
        
        try:
            content = full_path.read_text(encoding='utf-8')
            original = content
            
            content = fix_interface_params(content)
            
            if content != original:
                full_path.write_text(content, encoding='utf-8')
                print(f"✅ Fixed: {file_path_str}")
            else:
                print(f"⚠️  No changes: {file_path_str}")
                
        except Exception as e:
            print(f"❌ Error: {file_path_str}: {e}")
    
    print("=" * 60)
    print("🎉 Interface parameters fixed!")


if __name__ == "__main__":
    main()

