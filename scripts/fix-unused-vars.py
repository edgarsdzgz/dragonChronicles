#!/usr/bin/env python3
"""
Fix unused variables in test files by prefixing them with underscore.
This script processes the specific files mentioned in the ESLint errors.
"""

import re
import sys
from pathlib import Path

def fix_unused_vars_in_file(file_path: Path) -> bool:
    """Fix unused variables in a single file."""
    try:
        content = file_path.read_text()
        original_content = content
        
        # List of variables to fix based on ESLint errors
        fixes = [
            # packages/engine/tests/sim.determinism.spec.ts
            ("FixedClock", "_FixedClock"),
            ("createSnapshot", "_createSnapshot"), 
            ("SNAPSHOT_INTERVAL_MS", "_SNAPSHOT_INTERVAL_MS"),
            
            # packages/sim/tests/integration/enemy-system.integration.spec.js
            ("let enemyPool", "let _enemyPool"),
            ("enemyPool =", "_enemyPool ="),
            ("const spawnRate", "const _spawnRate"),
            
            # packages/sim/tests/integration/enemy-system.integration.spec.ts
            ("let enemyPool", "let _enemyPool"),
            ("enemyPool =", "_enemyPool ="),
            ("const spawnRate", "const _spawnRate"),
            
            # packages/sim/tests/integration/spawn-system.integration.spec.js
            ("const playerPosition", "const _playerPosition"),
            ("const deltaTime", "const _deltaTime"),
            
            # packages/sim/tests/integration/spawn-system.integration.spec.ts
            ("createSpawnConfig", "_createSpawnConfig"),
            ("calculateSpawnRate", "_calculateSpawnRate"),
            ("SpawnStats", "_SpawnStats"),
            ("PoolStats", "_PoolStats"),
            ("const playerPosition", "const _playerPosition"),
            ("const deltaTime", "const _deltaTime"),
            
            # packages/sim/tests/unit/enemy-pool.spec.ts
            ("import.*vi.*from", "import { describe, it, expect, beforeEach } from"),
            
            # packages/sim/tests/unit/pool-manager.spec.js
            ("const enemy2", "const _enemy2"),
            
            # packages/sim/tests/unit/pool-manager.spec.ts
            ("import.*vi.*from", "import { describe, it, expect, beforeEach } from"),
            ("const enemy2", "const _enemy2"),
            
            # packages/sim/tests/unit/spawn-config.spec.ts
            ("LandId", "_LandId"),
            
            # packages/sim/tests/unit/spawn-manager.spec.js
            ("const poolStats", "const _poolStats"),
            
            # packages/sim/tests/unit/spawn-manager.spec.ts
            ("SimpleRngImpl", "_SimpleRngImpl"),
            ("const poolStats", "const _poolStats"),
        ]
        
        # Apply fixes
        for old, new in fixes:
            content = content.replace(old, new)
        
        # Write back if changed
        if content != original_content:
            file_path.write_text(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix unused variables in all test files."""
    repo_root = Path(__file__).parent.parent
    
    # Files to fix based on ESLint errors
    files_to_fix = [
        "packages/engine/tests/sim.determinism.spec.ts",
        "packages/sim/tests/integration/enemy-system.integration.spec.js",
        "packages/sim/tests/integration/enemy-system.integration.spec.ts",
        "packages/sim/tests/integration/spawn-system.integration.spec.js",
        "packages/sim/tests/integration/spawn-system.integration.spec.ts",
        "packages/sim/tests/unit/enemy-pool.spec.ts",
        "packages/sim/tests/unit/pool-manager.spec.js",
        "packages/sim/tests/unit/pool-manager.spec.ts",
        "packages/sim/tests/unit/spawn-config.spec.ts",
        "packages/sim/tests/unit/spawn-manager.spec.js",
        "packages/sim/tests/unit/spawn-manager.spec.ts",
    ]
    
    fixed_count = 0
    for file_path in files_to_fix:
        full_path = repo_root / file_path
        if full_path.exists():
            if fix_unused_vars_in_file(full_path):
                print(f"Fixed unused variables in {file_path}")
                fixed_count += 1
            else:
                print(f"No changes needed in {file_path}")
        else:
            print(f"File not found: {file_path}")
    
    print(f"\nFixed unused variables in {fixed_count} files")

if __name__ == "__main__":
    main()
