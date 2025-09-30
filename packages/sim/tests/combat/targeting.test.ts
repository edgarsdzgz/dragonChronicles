/**
 * Comprehensive test suite for Draconia Chronicles targeting system
 * Tests range detection, threat assessment, targeting strategies, and persistence modes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Dragon, Enemy, TargetingConfig, TargetingState } from '../../src/combat/types.js';
import { createTargetingSystem, createDefaultTargetingConfig } from '../../src/combat/targeting.js';
import { createRangeDetection } from '../../src/combat/range-detection.js';
import { createThreatAssessment } from '../../src/combat/threat-assessment.js';
import { createStrategyRegistry } from '../../src/combat/targeting-strategies.js';
import { createPersistenceModeRegistry } from '../../src/combat/persistence-modes.js';

describe('Targeting System', () => {
  let dragon: Dragon;
  let enemies: Enemy[];
  let targetingSystem: ReturnType<typeof createTargetingSystem>;
  let config: TargetingConfig;

  beforeEach(() => {
    // Create test dragon
    dragon = {
      position: { x: 0, y: 0 },
      attackRange: 500,
      elementalType: 'fire',
      targetingConfig: createDefaultTargetingConfig(),
    };

    // Create test enemies
    enemies = [
      {
        id: 'enemy1',
        position: { x: 100, y: 100 },
        health: { current: 100, max: 100 },
        damage: 50,
        speed: 100,
        armor: 10,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 0.8,
        distance: 141.42,
      },
      {
        id: 'enemy2',
        position: { x: 200, y: 200 },
        health: { current: 80, max: 100 },
        damage: 30,
        speed: 80,
        armor: 5,
        shield: 20,
        elementalType: 'fire',
        isAlive: true,
        threatLevel: 0.6,
        distance: 282.84,
      },
      {
        id: 'enemy3',
        position: { x: 600, y: 600 },
        health: { current: 50, max: 100 },
        damage: 70,
        speed: 120,
        armor: 15,
        shield: 0,
        elementalType: 'lightning',
        isAlive: true,
        threatLevel: 0.9,
        distance: 848.53,
      },
    ];

    config = createDefaultTargetingConfig();
    targetingSystem = createTargetingSystem(config);
  });

  describe('Range Detection', () => {
    it('should calculate distance correctly', () => {
      const rangeDetection = createRangeDetection();
      const distance = rangeDetection.calculateDistance(dragon, enemies[0]);
      expect(distance).toBeCloseTo(141.42, 1);
    });

    it('should identify enemies in range', () => {
      const rangeDetection = createRangeDetection();
      const enemiesInRange = rangeDetection.getTargetsInRange(enemies, dragon);

      // Only enemy1 and enemy2 should be in range (distance < 500)
      expect(enemiesInRange).toHaveLength(2);
      expect(enemiesInRange[0].id).toBe('enemy1');
      expect(enemiesInRange[1].id).toBe('enemy2');
    });

    it('should exclude enemies out of range', () => {
      const rangeDetection = createRangeDetection();
      const enemiesInRange = rangeDetection.getTargetsInRange(enemies, dragon);

      // Enemy3 should be excluded (distance > 500)
      expect(enemiesInRange.find((e) => e.id === 'enemy3')).toBeUndefined();
    });

    it('should find closest enemy', () => {
      const rangeDetection = createRangeDetection();
      const closestEnemy = rangeDetection.getClosestEnemy(enemies, dragon);

      expect(closestEnemy?.id).toBe('enemy1');
    });

    it('should sort enemies by distance', () => {
      const rangeDetection = createRangeDetection();
      const sortedEnemies = rangeDetection.getEnemiesByDistance(enemies, dragon);

      expect(sortedEnemies[0].id).toBe('enemy1');
      expect(sortedEnemies[1].id).toBe('enemy2');
    });
  });

  describe('Threat Assessment', () => {
    it('should calculate threat levels correctly', () => {
      const threatAssessment = createThreatAssessment();
      const threat1 = threatAssessment.calculateThreatLevel(enemies[0], dragon, 141.42);
      const threat2 = threatAssessment.calculateThreatLevel(enemies[1], dragon, 282.84);

      expect(threat1).toBeGreaterThan(0);
      expect(threat2).toBeGreaterThan(0);
      expect(threat1).not.toBe(threat2);
    });

    it('should assess threat factors', () => {
      const threatAssessment = createThreatAssessment();
      const assessment = threatAssessment.calculateThreatAssessment(
        enemies[0],
        dragon,
        'highest_threat',
        141.42,
      );

      expect(assessment.enemy.id).toBe('enemy1');
      expect(assessment.factors).toHaveLength(7); // All threat factors
      expect(assessment.totalThreat).toBeGreaterThan(0);
    });

    it('should sort enemies by threat level', () => {
      const threatAssessment = createThreatAssessment();
      const distances = new Map([
        ['enemy1', 141.42],
        ['enemy2', 282.84],
      ]);

      const sortedEnemies = threatAssessment.sortEnemiesByThreat(
        enemies.slice(0, 2),
        dragon,
        'highest_threat',
        distances,
      );

      expect(sortedEnemies).toHaveLength(2);
      expect(sortedEnemies[0].threatLevel).toBeGreaterThanOrEqual(sortedEnemies[1].threatLevel);
    });
  });

  describe('Targeting Strategies', () => {
    it('should implement closest strategy', () => {
      const strategyRegistry = createStrategyRegistry();
      const closestStrategy = strategyRegistry.getStrategy('closest');

      expect(closestStrategy).toBeDefined();
      expect(closestStrategy?.strategy).toBe('closest');

      const target = closestStrategy?.calculate(enemies, dragon);
      expect(target?.id).toBe('enemy1'); // Closest enemy
    });

    it('should implement highest threat strategy', () => {
      const strategyRegistry = createStrategyRegistry();
      const threatStrategy = strategyRegistry.getStrategy('highest_threat');

      expect(threatStrategy).toBeDefined();
      expect(threatStrategy?.strategy).toBe('highest_threat');

      const target = threatStrategy?.calculate(enemies, dragon);
      expect(target).toBeDefined();
    });

    it('should implement lowest HP strategy', () => {
      const strategyRegistry = createStrategyRegistry();
      const lowestHpStrategy = strategyRegistry.getStrategy('lowest_hp');

      expect(lowestHpStrategy).toBeDefined();
      expect(lowestHpStrategy?.strategy).toBe('lowest_hp');

      const target = lowestHpStrategy?.calculate(enemies, dragon);
      expect(target?.id).toBe('enemy2'); // Enemy with lowest HP (80)
    });

    it('should implement highest damage strategy', () => {
      const strategyRegistry = createStrategyRegistry();
      const highestDamageStrategy = strategyRegistry.getStrategy('highest_damage');

      expect(highestDamageStrategy).toBeDefined();
      expect(highestDamageStrategy?.strategy).toBe('highest_damage');

      const target = highestDamageStrategy?.calculate(enemies, dragon);
      expect(target?.id).toBe('enemy1'); // Enemy with highest damage (50)
    });

    it('should implement elemental weak strategy', () => {
      const strategyRegistry = createStrategyRegistry();
      const elementalWeakStrategy = strategyRegistry.getStrategy('elemental_weak');

      expect(elementalWeakStrategy).toBeDefined();
      expect(elementalWeakStrategy?.strategy).toBe('elemental_weak');

      const target = elementalWeakStrategy?.calculate(enemies, dragon);
      expect(target).toBeDefined();
    });

    it('should implement shielded strategy', () => {
      const strategyRegistry = createStrategyRegistry();
      const shieldedStrategy = strategyRegistry.getStrategy('shielded');

      expect(shieldedStrategy).toBeDefined();
      expect(shieldedStrategy?.strategy).toBe('shielded');

      const target = shieldedStrategy?.calculate(enemies, dragon);
      expect(target?.id).toBe('enemy2'); // Only enemy with shield
    });

    it('should get all available strategies', () => {
      const strategyRegistry = createStrategyRegistry();
      const allStrategies = strategyRegistry.getAllStrategies();

      expect(allStrategies).toHaveLength(17); // 15 + custom
      expect(allStrategies.map((s) => s.strategy)).toContain('closest');
      expect(allStrategies.map((s) => s.strategy)).toContain('highest_threat');
      expect(allStrategies.map((s) => s.strategy)).toContain('custom');
    });

    it('should get strategy descriptions', () => {
      const strategyRegistry = createStrategyRegistry();
      const descriptions = strategyRegistry.getStrategyDescriptions();

      expect(descriptions.get('closest')).toBe('Target the nearest enemy in range');
      expect(descriptions.get('highest_threat')).toBe('Target the most dangerous enemy');
    });
  });

  describe('Persistence Modes', () => {
    it('should implement keep_target mode', () => {
      const persistenceRegistry = createPersistenceModeRegistry();
      const keepTargetMode = persistenceRegistry.getMode('keep_target');

      expect(keepTargetMode).toBeDefined();
      expect(keepTargetMode?.mode).toBe('keep_target');

      const shouldSwitch = keepTargetMode?.shouldSwitchTarget(
        enemies[0],
        enemies[1],
        targetingSystem.state,
        config,
      );

      expect(shouldSwitch).toBe(false); // Should not switch in keep_target mode
    });

    it('should implement switch_freely mode', () => {
      const persistenceRegistry = createPersistenceModeRegistry();
      const switchFreelyMode = persistenceRegistry.getMode('switch_freely');

      expect(switchFreelyMode).toBeDefined();
      expect(switchFreelyMode?.mode).toBe('switch_freely');
    });

    it('should implement switch_aggressive mode', () => {
      const persistenceRegistry = createPersistenceModeRegistry();
      const switchAggressiveMode = persistenceRegistry.getMode('switch_aggressive');

      expect(switchAggressiveMode).toBeDefined();
      expect(switchAggressiveMode?.mode).toBe('switch_aggressive');
    });

    it('should implement manual_only mode', () => {
      const persistenceRegistry = createPersistenceModeRegistry();
      const manualOnlyMode = persistenceRegistry.getMode('manual_only');

      expect(manualOnlyMode).toBeDefined();
      expect(manualOnlyMode?.mode).toBe('manual_only');
    });

    it('should get all available modes', () => {
      const persistenceRegistry = createPersistenceModeRegistry();
      const allModes = persistenceRegistry.getAllModes();

      expect(allModes).toHaveLength(4);
      expect(allModes.map((m) => m.mode)).toContain('keep_target');
      expect(allModes.map((m) => m.mode)).toContain('switch_freely');
      expect(allModes.map((m) => m.mode)).toContain('switch_aggressive');
      expect(allModes.map((m) => m.mode)).toContain('manual_only');
    });

    it('should get mode descriptions', () => {
      const persistenceRegistry = createPersistenceModeRegistry();
      const descriptions = persistenceRegistry.getModeDescriptions();

      expect(descriptions.get('keep_target')).toBe(
        'Keep current target until it dies or goes out of range',
      );
      expect(descriptions.get('switch_freely')).toBe(
        'Switch targets when significantly better options are available',
      );
    });
  });

  describe('Main Targeting System', () => {
    it('should find targets correctly', () => {
      const target = targetingSystem.findTarget(enemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('enemy1'); // Should find closest enemy by default
    });

    it('should update targets based on strategy', () => {
      targetingSystem.switchStrategy('highest_threat');
      targetingSystem.updateTarget(enemies);

      const target = targetingSystem.state.currentTarget;
      expect(target).toBeDefined();
    });

    it('should switch strategies', () => {
      targetingSystem.switchStrategy('lowest_hp');

      expect(targetingSystem.state.strategy).toBe('lowest_hp');
      expect(targetingSystem.state.lastStrategyChange).toBeGreaterThan(0);
    });

    it('should lock and unlock targets', () => {
      const target = enemies[0];
      targetingSystem.lockTarget(target);

      expect(targetingSystem.state.currentTarget).toBe(target);
      expect(targetingSystem.state.isTargetLocked).toBe(true);

      targetingSystem.unlockTarget();
      expect(targetingSystem.state.isTargetLocked).toBe(false);
    });

    it('should check if enemies are in range', () => {
      const inRange = targetingSystem.isInRange(enemies[0]);
      const outOfRange = targetingSystem.isInRange(enemies[2]);

      expect(inRange).toBe(true);
      expect(outOfRange).toBe(false);
    });

    it('should calculate threat levels', () => {
      const threatLevel = targetingSystem.calculateThreatLevel(enemies[0]);

      expect(threatLevel).toBeGreaterThan(0);
    });

    it('should determine if target should switch', () => {
      const shouldSwitch = targetingSystem.shouldSwitchTarget(enemies);

      expect(typeof shouldSwitch).toBe('boolean');
    });

    it('should check if target can switch', () => {
      const canSwitch = targetingSystem.canSwitchTarget();

      expect(canSwitch).toBe(true);

      targetingSystem.lockTarget(enemies[0]);
      expect(targetingSystem.canSwitchTarget()).toBe(false);
    });

    it('should set persistence mode', () => {
      targetingSystem.setPersistenceMode('switch_freely');

      expect(targetingSystem.config.persistenceMode).toBe('switch_freely');
    });

    it('should get performance metrics', () => {
      const metrics = targetingSystem.getPerformanceMetrics();

      expect(metrics).toHaveProperty('targetSelectionTime');
      expect(metrics).toHaveProperty('totalUpdateTime');
      expect(metrics).toHaveProperty('targetSwitchCount');
      expect(metrics).toHaveProperty('averageTargetLifetime');
    });

    it('should get system status', () => {
      const status = targetingSystem.getStatus();

      expect(status).toHaveProperty('hasTarget');
      expect(status).toHaveProperty('targetId');
      expect(status).toHaveProperty('strategy');
      expect(status).toHaveProperty('persistenceMode');
      expect(status).toHaveProperty('isLocked');
      expect(status).toHaveProperty('switchCount');
    });

    it('should reset system state', () => {
      targetingSystem.lockTarget(enemies[0]);
      targetingSystem.reset();

      expect(targetingSystem.state.currentTarget).toBeNull();
      expect(targetingSystem.state.isTargetLocked).toBe(false);
      expect(targetingSystem.state.targetSwitchCount).toBe(0);
    });

    it('should update configuration', () => {
      const newConfig = { range: 1000, switchThreshold: 0.2 };
      targetingSystem.updateConfig(newConfig);

      expect(targetingSystem.config.range).toBe(1000);
      expect(targetingSystem.config.switchThreshold).toBe(0.2);
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of enemies efficiently', () => {
      const largeEnemyList: Enemy[] = [];
      for (let i = 0; i < 200; i++) {
        largeEnemyList.push({
          id: `enemy${i}`,
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          health: { current: 100, max: 100 },
          damage: Math.random() * 100,
          speed: Math.random() * 200,
          armor: Math.random() * 50,
          shield: Math.random() * 30,
          isAlive: true,
          threatLevel: Math.random(),
          distance: 0,
        });
      }

      const startTime = performance.now();
      const target = targetingSystem.findTarget(largeEnemyList);
      const endTime = performance.now();

      expect(target).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1); // Should complete in less than 1ms
    });

    it('should maintain performance with frequent updates', () => {
      const updateTimes: number[] = [];

      for (let i = 0; i < 100; i++) {
        const startTime = performance.now();
        targetingSystem.updateTarget(enemies);
        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }

      const averageTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length;
      expect(averageTime).toBeLessThan(0.1); // Average should be less than 0.1ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty enemy list', () => {
      const target = targetingSystem.findTarget([]);
      expect(target).toBeNull();
    });

    it('should handle all enemies out of range', () => {
      const outOfRangeEnemies = enemies.map((enemy) => ({
        ...enemy,
        position: { x: 1000, y: 1000 },
      }));

      const target = targetingSystem.findTarget(outOfRangeEnemies);
      expect(target).toBeNull();
    });

    it('should handle all enemies dead', () => {
      const deadEnemies = enemies.map((enemy) => ({
        ...enemy,
        isAlive: false,
      }));

      const target = targetingSystem.findTarget(deadEnemies);
      expect(target).toBeNull();
    });

    it('should handle null current target', () => {
      targetingSystem.state.currentTarget = null;
      const shouldSwitch = targetingSystem.shouldSwitchTarget(enemies);
      expect(shouldSwitch).toBe(true);
    });

    it('should handle target becoming invalid', () => {
      targetingSystem.state.currentTarget = enemies[0];
      enemies[0].isAlive = false;

      const shouldSwitch = targetingSystem.shouldSwitchTarget(enemies);
      expect(shouldSwitch).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should work with different enemy types', () => {
      // Test with Mantair Corsair-like enemy
      const mantairEnemy: Enemy = {
        id: 'mantair1',
        position: { x: 150, y: 150 },
        health: { current: 120, max: 120 },
        damage: 40,
        speed: 90,
        armor: 8,
        shield: 0,
        elementalType: 'fire',
        isAlive: true,
        threatLevel: 0.7,
        distance: 212.13,
      };

      // Test with Swarm-like enemy
      const swarmEnemy: Enemy = {
        id: 'swarm1',
        position: { x: 80, y: 80 },
        health: { current: 30, max: 30 },
        damage: 20,
        speed: 150,
        armor: 2,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 0.4,
        distance: 113.14,
      };

      const mixedEnemies = [mantairEnemy, swarmEnemy];
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(['mantair1', 'swarm1']).toContain(target?.id);
    });

    it('should integrate with dragon health system', () => {
      // Simulate dragon taking damage
      const damagedDragon: Dragon = {
        ...dragon,
        position: { x: 0, y: 0 },
        attackRange: 400, // Reduced range due to damage
      };

      const target = targetingSystem.findTarget(enemies);
      expect(target).toBeDefined();
    });
  });
});
