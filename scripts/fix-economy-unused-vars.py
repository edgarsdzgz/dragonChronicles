#!/usr/bin/env python3
"""
Fix unused variables in economy stub files by prefixing them with underscore.
This script targets the specific files in packages/sim/src/economy/ with ESLint errors.
"""

import re
from pathlib import Path


def fix_unused_imports(content: str, imports_to_fix: list) -> str:
    """Fix unused imports by prefixing with underscore."""
    for old_import in imports_to_fix:
        # Fix import statement
        content = re.sub(
            rf'\b{old_import}\b(?=\s*[,}}])',
            f'_{old_import}',
            content
        )
    return content


def fix_unused_params(content: str, params_to_fix: list) -> str:
    """Fix unused parameters by prefixing with underscore."""
    for param in params_to_fix:
        # Fix function parameters - be careful to match whole words
        content = re.sub(
            rf'\b{param}\b(?=\s*[:,)])',
            f'_{param}',
            content
        )
    return content


def fix_unused_vars(content: str, vars_to_fix: list) -> str:
    """Fix unused variables by prefixing with underscore."""
    for var in vars_to_fix:
        # Fix variable declarations
        content = re.sub(
            rf'\b{var}\b(?=\s*[=:])',
            f'_{var}',
            content
        )
    return content


def fix_file(file_path: Path, config: dict) -> bool:
    """Fix unused variables in a single file based on configuration."""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Apply fixes based on configuration
        if 'imports' in config:
            content = fix_unused_imports(content, config['imports'])
        
        if 'params' in config:
            content = fix_unused_params(content, config['params'])
        
        if 'vars' in config:
            content = fix_unused_vars(content, config['vars'])
        
        # Write back if changed
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False


def main():
    """Main function to fix unused variables in economy files."""
    repo_root = Path(__file__).parent.parent
    
    # Configuration for each file with specific variables to fix
    fixes_config = {
        "packages/sim/src/economy/arcana-drop-manager.ts": {
            "imports": ["BossType"]
        },
        "packages/sim/src/economy/enchant-manager.ts": {
            "params": ["type"],
            "vars": ["soulForgingStats"]
        },
        "packages/sim/src/economy/enchant-types.ts": {
            "params": ["type", "category", "amount", "currency", "level", "location", 
                      "fromLevel", "toLevel", "currentLevel", "baseCost"]
        },
        "packages/sim/src/economy/soul-forging.ts": {
            "params": ["amount", "availableArcana", "availableSoulPower", "baseCap", 
                      "currentLevels"]
        },
        "packages/sim/src/economy/soul-power-drop-manager.ts": {
            "imports": ["BossType"]
        },
        "packages/sim/src/economy/soul-power-scaling.ts": {
            "vars": ["BOSS_CHANCE_MULTIPLIERS", "BOSS_AMOUNT_MULTIPLIERS"]
        },
        "packages/sim/src/economy/types.ts": {
            "params": ["amount", "source", "enemyType", "distance", "ward", "bossType",
                      "dropChance", "scalingFactor", "arcanaAmount", "reason", "location",
                      "currency"]
        }
    }
    
    fixed_count = 0
    total_files = len(fixes_config)
    
    print("🔧 Economy Unused Variables Fixer")
    print("=" * 60)
    
    for file_path_str, config in fixes_config.items():
        full_path = repo_root / file_path_str
        if full_path.exists():
            if fix_file(full_path, config):
                print(f"✅ Fixed: {file_path_str}")
                fixed_count += 1
            else:
                print(f"⚠️  No changes needed: {file_path_str}")
        else:
            print(f"❌ File not found: {file_path_str}")
    
    print("=" * 60)
    print(f"📊 Summary: Fixed {fixed_count}/{total_files} files")
    
    if fixed_count > 0:
        print("🎉 Unused variable fixes applied successfully!")
    else:
        print("ℹ️  All files were already clean or no matches found")


if __name__ == "__main__":
    main()

