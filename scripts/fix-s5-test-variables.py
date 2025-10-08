#!/usr/bin/env python3
"""
Fix variable references in S5 test files.
"""

import os
import re

def fix_test_file(file_path):
    """Fix variable references in test files."""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix variable references
    fixes = [
        # Fix variable references in balance-testing.test.ts
        (r"metricsCollector", "_metricsCollector"),
        (r"arcanaManager", "_arcanaManager"),
        (r"soulPowerManager", "_soulPowerManager"),
        (r"enchantManager", "_enchantManager"),
        
        # Fix unused vi import
        (r"import \{ describe, it, expect, beforeEach, vi \}", "import { describe, it, expect, beforeEach }"),
    ]
    
    for pattern, replacement in fixes:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {file_path}")
        return True
    else:
        print(f"No changes needed: {file_path}")
        return False

def main():
    """Main function to fix test files."""
    test_files = [
        "packages/sim/src/economy/__tests__/balance-analyzer.test.ts",
        "packages/sim/src/economy/__tests__/balance-testing.test.ts",
        "packages/sim/src/economy/__tests__/economic-metrics.test.ts",
    ]
    
    fixed_count = 0
    for file_path in test_files:
        if fix_test_file(file_path):
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} test files")

if __name__ == "__main__":
    main()
