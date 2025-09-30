#!/usr/bin/env python3
"""
Fix TypeScript errors in targeting system files.
This script addresses the specific errors found in the CI pipeline.
"""

import re
import sys
from pathlib import Path

def fix_typescript_errors():
    """Fix TypeScript errors in targeting system files."""
    repo_root = Path(__file__).parent.parent
    
    # Fix custom-strategy-framework.ts
    file_path = repo_root / "packages/sim/src/combat/custom-strategy-framework.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Remove duplicate isUnlocked property and method
        content = re.sub(r'  private isUnlocked: boolean;\n', '', content)
        content = re.sub(r'  isUnlocked\(\): boolean \{\n    return this\._isUnlocked;\n  \}\n', '', content)
        
        # Fix calculate method to be synchronous
        content = re.sub(r'  async calculate\(enemies: Enemy\[\], dragon: Dragon\): Promise<Enemy \| null> \{', 
                        '  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {', content)
        
        # Fix health property access
        content = re.sub(r'enemy\.health / enemy\.maxHealth', 'enemy.health.current / enemy.health.max', content)
        
        # Fix utility functions to return non-undefined
        content = re.sub(r'return enemies\[Math\.floor\(Math\.random\(\) \* enemies\.length\)\];', 
                        'return enemies[Math.floor(Math.random() * enemies.length)] || null;', content)
        content = re.sub(r'return closestEnemy;', 'return closestEnemy || null;', content)
        content = re.sub(r'return highestThreatEnemy;', 'return highestThreatEnemy || null;', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix performance-monitor.ts
    file_path = repo_root / "packages/sim/src/combat/performance-monitor.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Remove TargetingMetrics import and define locally
        content = re.sub(r'import type \{\s*TargetingMetrics,\s*\} from \'\./types\.js\';', '', content)
        
        # Add local TargetingMetrics interface
        content = re.sub(r'import type \{', '''export interface TargetingMetrics {
  targetSelectionTime: number;
  rangeDetectionTime: number;
  threatCalculationTime: number;
  totalUpdateTime: number;
  targetsEvaluated: number;
  targetSwitches: number;
  strategyChanges: number;
  performanceScore: number;
}

import type {''', content)
        
        # Fix undefined array access
        content = re.sub(r'return sortedValues\[Math\.max\(0, index\)\];', 
                        'return sortedValues[Math.max(0, index)] || 0;', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix persistence-modes.ts
    file_path = repo_root / "packages/sim/src/combat/persistence-modes.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Add mode property to BasePersistenceHandler
        content = re.sub(r'abstract class BasePersistenceHandler implements TargetPersistenceHandler \{', 
                        '''abstract class BasePersistenceHandler implements TargetPersistenceHandler {
  public mode: TargetPersistenceMode;''', content)
        
        # Fix constructor to set mode
        content = re.sub(r'  constructor\(mode: TargetPersistenceMode, isUnlocked: boolean = true\) \{', 
                        '''  constructor(mode: TargetPersistenceMode, isUnlocked: boolean = true) {
    this.mode = mode;''', content)
        
        # Fix isUnlocked to be property instead of method
        content = re.sub(r'  isUnlocked\(\): boolean \{', '  public isUnlocked: boolean;', content)
        content = re.sub(r'    return this\._isUnlocked;\n  \}', '', content)
        
        # Fix concrete handler constructors
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'keep_target\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'switch_freely\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'switch_aggressive\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'manual_only\', true);', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix targeting-strategies.ts
    file_path = repo_root / "packages/sim/src/combat/targeting-strategies.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Add strategy property to BaseStrategyHandler
        content = re.sub(r'abstract class BaseStrategyHandler implements TargetingStrategyHandler \{', 
                        '''abstract class BaseStrategyHandler implements TargetingStrategyHandler {
  public strategy: TargetingStrategy;''', content)
        
        # Fix constructor to set strategy
        content = re.sub(r'  constructor\(strategy: TargetingStrategy, isUnlocked: boolean = true\) \{', 
                        '''  constructor(strategy: TargetingStrategy, isUnlocked: boolean = true) {
    this.strategy = strategy;''', content)
        
        # Fix isUnlocked to be property instead of method
        content = re.sub(r'  isUnlocked\(\): boolean \{', '  public isUnlocked: boolean;', content)
        content = re.sub(r'    return this\._isUnlocked;\n  \}', '', content)
        
        # Fix concrete handler constructors
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'closest\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'highest_threat\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'lowest_threat\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'highest_hp\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'lowest_hp\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'highest_damage\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'lowest_damage\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'fastest\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'slowest\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'highest_armor\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'lowest_armor\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'shielded\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'unshielded\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'elemental_weak\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'elemental_strong\', true);', content)
        content = re.sub(r'  constructor\(\) \{', '  constructor() {\n    super(\'custom\', true);', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix targeting.ts
    file_path = repo_root / "packages/sim/src/combat/targeting.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Add state property to DefaultTargetingSystem
        content = re.sub(r'export class DefaultTargetingSystem implements TargetingSystem \{', 
                        '''export class DefaultTargetingSystem implements TargetingSystem {
  public state: TargetingState;''', content)
        
        # Fix constructor to set state
        content = re.sub(r'  constructor\(config: TargetingConfig, _state: TargetingState\) \{', 
                        '''  constructor(config: TargetingConfig, state: TargetingState) {
    this.state = state;''', content)
        
        # Fix rangeDetection to be mutable
        content = re.sub(r'  private readonly rangeDetection: RangeDetection;', 
                        '  private rangeDetection: RangeDetection;', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix types.ts - add missing exports
    file_path = repo_root / "packages/sim/src/combat/types.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Add TargetingMetrics interface
        if 'export interface TargetingMetrics' not in content:
            content = re.sub(r'export interface PlayerTargetingPreferences \{', '''export interface TargetingMetrics {
  targetSelectionTime: number;
  rangeDetectionTime: number;
  threatCalculationTime: number;
  totalUpdateTime: number;
  targetsEvaluated: number;
  targetSwitches: number;
  strategyChanges: number;
  performanceScore: number;
}

export interface PlayerTargetingPreferences {''', content)
        
        # Add missing properties to TargetingConfig
        if 'threatWeights' not in content:
            content = re.sub(r'  targetLockDuration: number;', '''  targetLockDuration: number;
  threatWeights: {
    proximity: number;
    health: number;
    damage: number;
    speed: number;
  };
  customSettings: Record<string, any>;''', content)
        
        # Fix Enemy interface to include type and maxHealth
        if 'type: string;' not in content:
            content = re.sub(r'  isAlive: boolean;', '''  isAlive: boolean;
  type: string;
  maxHealth: number;''', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix targeting-config.ts
    file_path = repo_root / "packages/sim/src/combat/targeting-config.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Fix enabledStrategies type
        content = re.sub(r'enabledStrategies: string\[\]', 'enabledStrategies: TargetingStrategy[]', content)
        
        # Add missing properties to baseConfig
        content = re.sub(r'    targetLockDuration: 5000,', '''    targetLockDuration: 5000,
    threatWeights: {
      proximity: 0.4,
      health: 0.3,
      damage: 0.2,
      speed: 0.1,
    },
    customSettings: {},''', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix targeting-presets.ts
    file_path = repo_root / "packages/sim/src/combat/targeting-presets.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Remove PlayerTargetingPreferences import
        content = re.sub(r'  PlayerTargetingPreferences,\s*', '', content)
        
        # Fix strategy names
        content = re.sub(r'elemental_weakness', 'elemental_weak', content)
        content = re.sub(r'highest_health', 'highest_hp', content)
        content = re.sub(r'lowest_health', 'lowest_hp', content)
        content = re.sub(r'highest_shield', 'shielded', content)
        content = re.sub(r'lowest_shield', 'unshielded', content)
        
        # Fix strategy complexity mapping
        content = re.sub(r'highest_health: 1,', 'highest_hp: 1,', content)
        content = re.sub(r'lowest_health: 1,', 'lowest_hp: 1,', content)
        content = re.sub(r'highest_shield: 2,', 'shielded: 2,', content)
        content = re.sub(r'lowest_shield: 2,', 'unshielded: 2,', content)
        content = re.sub(r'elemental_weakness: 3,', 'elemental_weak: 3,', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix targeting-ui.ts
    file_path = repo_root / "packages/sim/src/combat/targeting-ui.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Remove PlayerTargetingPreferences import
        content = re.sub(r'  PlayerTargetingPreferences,\s*', '', content)
        
        # Fix getConfig method call
        content = re.sub(r'this\.configManager\.getConfig\(\)', 'this.configManager.config', content)
        
        # Fix strategy names
        content = re.sub(r'highest_health', 'highest_hp', content)
        content = re.sub(r'lowest_health', 'lowest_hp', content)
        content = re.sub(r'elemental_weakness', 'elemental_weak', content)
        
        # Fix undefined preset handling
        content = re.sub(r'this\.selectPreset\(preset\);', 'if (preset) this.selectPreset(preset);', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix targeting-analytics.ts
    file_path = repo_root / "packages/sim/src/combat/targeting-analytics.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Remove TargetingMetrics import
        content = re.sub(r'  TargetingMetrics,\s*', '', content)
        
        # Fix undefined array access
        content = re.sub(r'window\.localStorage\.removeItem\(events\[i\]\.key\);', 
                        'if (events[i]) window.localStorage.removeItem(events[i].key);', content)
        content = re.sub(r'startTime: events\[0\]\.timestamp,', 'startTime: events[0]?.timestamp || 0,', content)
        content = re.sub(r'endTime: events\[events\.length - 1\]\.timestamp,', 'endTime: events[events.length - 1]?.timestamp || 0,', content)
        content = re.sub(r'duration: events\[events\.length - 1\]\.timestamp - events\[0\]\.timestamp,', 
                        'duration: (events[events.length - 1]?.timestamp || 0) - (events[0]?.timestamp || 0),', content)
        
        # Fix sessionId arithmetic
        content = re.sub(r'sessionDuration: Date\.now\(\) - this\.sessionId,', 
                        'sessionDuration: Date.now() - Number(this.sessionId),', content)
        
        # Fix userAgent type
        content = re.sub(r'userAgent: typeof window !== \'undefined\' \? window\.navigator\.userAgent \|\| \'unknown\' : \'unknown\',', 
                        'userAgent: typeof window !== \'undefined\' ? (window.navigator.userAgent || \'unknown\') : \'unknown\',', content)
        
        # Fix Enemy property access
        content = re.sub(r'target\?\.type', 'target?.type', content)
        content = re.sub(r'target \? target\.health / target\.maxHealth : 0', 
                        'target ? target.health.current / target.health.max : 0', content)
        content = re.sub(r'fromTarget\?\.type', 'fromTarget?.type', content)
        content = re.sub(r'toTarget\?\.type', 'toTarget?.type', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix targeting-unlock.ts
    file_path = repo_root / "packages/sim/src/combat/targeting-unlock.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Fix nextRequirement type
        content = re.sub(r'return \{ unlock, progress, nextRequirement \};', 
                        'return { unlock, progress, nextRequirement: nextRequirement || undefined };', content)
        
        # Fix undefined array access
        content = re.sub(r'return scoredUnlocks\[0\]\.unlock;', 'return scoredUnlocks[0]?.unlock;', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix targeting-persistence.ts
    file_path = repo_root / "packages/sim/src/combat/targeting-persistence.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Remove PlayerTargetingPreferences import
        content = re.sub(r'  PlayerTargetingPreferences,\s*', '', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix threat-assessment.ts
    file_path = repo_root / "packages/sim/src/combat/threat-assessment.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Fix undefined array access
        content = re.sub(r'return sum \+ value \* weights\[index\];', 
                        'return sum + value * (weights[index] || 0);', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")
    
    # Fix index.ts - remove duplicate export
    file_path = repo_root / "packages/sim/src/index.ts"
    if file_path.exists():
        content = file_path.read_text(encoding='utf-8')
        
        # Remove duplicate Enemy export
        content = re.sub(r'export \* from \'\./combat/types\.js\';\n', '', content)
        
        file_path.write_text(content, encoding='utf-8')
        print(f"Fixed {file_path}")

def main():
    """Main function to fix TypeScript errors."""
    print("Fixing TypeScript errors in targeting system...")
    fix_typescript_errors()
    print("TypeScript error fixes completed!")

if __name__ == "__main__":
    main()
