/**
 * Integration tests for targeting system with Mantair Corsair and Swarm enemy types
 * Tests real-world scenarios and enemy-specific behaviors
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Dragon, Enemy } from '../../src/combat/types.js';
import { createTargetingSystem, createDefaultTargetingConfig } from '../../src/combat/targeting.js';
import { createStrategyRegistry } from '../../src/combat/targeting-strategies.js';
import { createPersistenceModeRegistry } from '../../src/combat/persistence-modes.js';

describe('Targeting System Integration', () => {
  let dragon: Dragon;
  let mantairEnemies: Enemy[];
  let swarmEnemies: Enemy[];
  let mixedEnemies: Enemy[];
  let targetingSystem: ReturnType<typeof createTargetingSystem>;
  let strategyRegistry: ReturnType<typeof createStrategyRegistry>;
  let persistenceRegistry: ReturnType<typeof createPersistenceModeRegistry>;

  beforeEach(() => {
    // Create test dragon
    dragon = {
      position: { x: 0, y: 0 },
      attackRange: 500,
      elementalType: 'fire',
      targetingConfig: createDefaultTargetingConfig(),
    };

    // Create Mantair Corsair enemies (tanky, slower, higher damage)
    mantairEnemies = [
      {
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
      },
      {
        id: 'mantair2',
        position: { x: 300, y: 300 },
        health: { current: 100, max: 120 },
        damage: 45,
        speed: 85,
        armor: 10,
        shield: 5,
        elementalType: 'fire',
        isAlive: true,
        threatLevel: 0.8,
        distance: 424.26,
      },
      {
        id: 'mantair3',
        position: { x: 450, y: 450 },
        health: { current: 80, max: 120 },
        damage: 50,
        speed: 80,
        armor: 12,
        shield: 10,
        elementalType: 'fire',
        isAlive: true,
        threatLevel: 0.9,
        distance: 636.4,
      },
    ];

    // Create Swarm enemies (fast, low health, moderate damage)
    swarmEnemies = [
      {
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
      },
      {
        id: 'swarm2',
        position: { x: 200, y: 200 },
        health: { current: 25, max: 30 },
        damage: 25,
        speed: 160,
        armor: 1,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 0.5,
        distance: 282.84,
      },
      {
        id: 'swarm3',
        position: { x: 350, y: 350 },
        health: { current: 20, max: 30 },
        damage: 30,
        speed: 170,
        armor: 3,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 0.6,
        distance: 494.97,
      },
    ];

    // Create mixed enemy group
    mixedEnemies = [...mantairEnemies, ...swarmEnemies];

    targetingSystem = createTargetingSystem(createDefaultTargetingConfig());
    strategyRegistry = createStrategyRegistry();
    persistenceRegistry = createPersistenceModeRegistry();
  });

  describe('Mantair Corsair Integration', () => {
    it('should target Mantair enemies with closest strategy', () => {
      const target = targetingSystem.findTarget(mantairEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('mantair1'); // Closest Mantair
      expect(mantairEnemies.map((e) => e.id)).toContain(target?.id);
    });

    it('should target highest HP Mantair with highest_hp strategy', () => {
      targetingSystem.switchStrategy('highest_hp');
      const target = targetingSystem.findTarget(mantairEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('mantair1'); // Highest HP (120)
    });

    it('should target highest damage Mantair with highest_damage strategy', () => {
      targetingSystem.switchStrategy('highest_damage');
      const target = targetingSystem.findTarget(mantairEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('mantair3'); // Highest damage (50)
    });

    it('should target slowest Mantair with slowest strategy', () => {
      targetingSystem.switchStrategy('slowest');
      const target = targetingSystem.findTarget(mantairEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('mantair3'); // Slowest speed (80)
    });

    it('should target highest armor Mantair with highest_armor strategy', () => {
      targetingSystem.switchStrategy('highest_armor');
      const target = targetingSystem.findTarget(mantairEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('mantair3'); // Highest armor (12)
    });

    it('should target shielded Mantair with shielded strategy', () => {
      targetingSystem.switchStrategy('shielded');
      const target = targetingSystem.findTarget(mantairEnemies);

      expect(target).toBeDefined();
      expect(['mantair2', 'mantair3']).toContain(target?.id); // Only mantair2 and mantair3 have shields
    });

    it('should handle Mantair death and target switching', () => {
      targetingSystem.updateTarget(mantairEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Kill the current target
      if (initialTarget) {
        initialTarget.isAlive = false;
        targetingSystem.updateTarget(mantairEnemies);

        const newTarget = targetingSystem.state.currentTarget;
        expect(newTarget).toBeDefined();
        expect(newTarget?.id).not.toBe(initialTarget.id);
        expect(newTarget?.isAlive).toBe(true);
      }
    });
  });

  describe('Swarm Integration', () => {
    it('should target Swarm enemies with closest strategy', () => {
      const target = targetingSystem.findTarget(swarmEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('swarm1'); // Closest Swarm
      expect(swarmEnemies.map((e) => e.id)).toContain(target?.id);
    });

    it('should target lowest HP Swarm with lowest_hp strategy', () => {
      targetingSystem.switchStrategy('lowest_hp');
      const target = targetingSystem.findTarget(swarmEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('swarm3'); // Lowest HP (20)
    });

    it('should target fastest Swarm with fastest strategy', () => {
      targetingSystem.switchStrategy('fastest');
      const target = targetingSystem.findTarget(swarmEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('swarm3'); // Fastest speed (170)
    });

    it('should target lowest armor Swarm with lowest_armor strategy', () => {
      targetingSystem.switchStrategy('lowest_armor');
      const target = targetingSystem.findTarget(swarmEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('swarm2'); // Lowest armor (1)
    });

    it('should target unshielded Swarm with unshielded strategy', () => {
      targetingSystem.switchStrategy('unshielded');
      const target = targetingSystem.findTarget(swarmEnemies);

      expect(target).toBeDefined();
      expect(swarmEnemies.map((e) => e.id)).toContain(target?.id); // All Swarm enemies are unshielded
    });

    it('should handle Swarm death and target switching', () => {
      targetingSystem.updateTarget(swarmEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Kill the current target
      if (initialTarget) {
        initialTarget.isAlive = false;
        targetingSystem.updateTarget(swarmEnemies);

        const newTarget = targetingSystem.state.currentTarget;
        expect(newTarget).toBeDefined();
        expect(newTarget?.id).not.toBe(initialTarget.id);
        expect(newTarget?.isAlive).toBe(true);
      }
    });
  });

  describe('Mixed Enemy Integration', () => {
    it('should handle mixed enemy types with closest strategy', () => {
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(target?.id).toBe('swarm1'); // Closest overall
    });

    it('should prioritize Mantair with highest_hp strategy', () => {
      targetingSystem.switchStrategy('highest_hp');
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(mantairEnemies.map((e) => e.id)).toContain(target?.id); // Mantair have higher HP
    });

    it('should prioritize Swarm with lowest_hp strategy', () => {
      targetingSystem.switchStrategy('lowest_hp');
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(swarmEnemies.map((e) => e.id)).toContain(target?.id); // Swarm have lower HP
    });

    it('should prioritize Swarm with fastest strategy', () => {
      targetingSystem.switchStrategy('fastest');
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(swarmEnemies.map((e) => e.id)).toContain(target?.id); // Swarm are faster
    });

    it('should prioritize Mantair with slowest strategy', () => {
      targetingSystem.switchStrategy('slowest');
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(mantairEnemies.map((e) => e.id)).toContain(target?.id); // Mantair are slower
    });

    it('should prioritize Mantair with highest_armor strategy', () => {
      targetingSystem.switchStrategy('highest_armor');
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(mantairEnemies.map((e) => e.id)).toContain(target?.id); // Mantair have more armor
    });

    it('should prioritize Swarm with lowest_armor strategy', () => {
      targetingSystem.switchStrategy('lowest_armor');
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(swarmEnemies.map((e) => e.id)).toContain(target?.id); // Swarm have less armor
    });

    it('should handle elemental targeting with fire dragon', () => {
      targetingSystem.switchStrategy('elemental_weak');
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(swarmEnemies.map((e) => e.id)).toContain(target?.id); // Fire dragon targets ice enemies (Swarm)
    });

    it('should handle elemental targeting with fire dragon (strong)', () => {
      targetingSystem.switchStrategy('elemental_strong');
      const target = targetingSystem.findTarget(mixedEnemies);

      expect(target).toBeDefined();
      expect(mantairEnemies.map((e) => e.id)).toContain(target?.id); // Fire dragon targets fire enemies (Mantair)
    });
  });

  describe('Persistence Mode Integration', () => {
    it('should keep Mantair target with keep_target mode', () => {
      targetingSystem.setPersistenceMode('keep_target');
      targetingSystem.updateTarget(mixedEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Try to update target again
      targetingSystem.updateTarget(mixedEnemies);
      const finalTarget = targetingSystem.state.currentTarget;

      expect(finalTarget?.id).toBe(initialTarget?.id); // Should keep same target
    });

    it('should switch targets with switch_freely mode', () => {
      targetingSystem.setPersistenceMode('switch_freely');
      targetingSystem.updateTarget(mixedEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Change strategy to force target switch
      targetingSystem.switchStrategy('highest_hp');
      targetingSystem.updateTarget(mixedEnemies);
      const finalTarget = targetingSystem.state.currentTarget;

      expect(finalTarget?.id).not.toBe(initialTarget?.id); // Should switch target
    });

    it('should aggressively switch targets with switch_aggressive mode', () => {
      targetingSystem.setPersistenceMode('switch_aggressive');
      targetingSystem.updateTarget(mixedEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Add a better target
      const betterEnemy: Enemy = {
        id: 'better_enemy',
        position: { x: 50, y: 50 },
        health: { current: 200, max: 200 },
        damage: 100,
        speed: 100,
        armor: 20,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 1.0,
        distance: 70.71,
      };

      targetingSystem.updateTarget([...mixedEnemies, betterEnemy]);
      const finalTarget = targetingSystem.state.currentTarget;

      expect(finalTarget?.id).toBe('better_enemy'); // Should switch to better target
    });

    it('should only switch with manual strategy change in manual_only mode', () => {
      targetingSystem.setPersistenceMode('manual_only');
      targetingSystem.updateTarget(mixedEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Update without strategy change
      targetingSystem.updateTarget(mixedEnemies);
      expect(targetingSystem.state.currentTarget?.id).toBe(initialTarget?.id);

      // Change strategy manually
      targetingSystem.switchStrategy('highest_hp');
      targetingSystem.updateTarget(mixedEnemies);
      expect(targetingSystem.state.currentTarget?.id).not.toBe(initialTarget?.id);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle large mixed enemy groups', () => {
      const largeEnemyGroup: Enemy[] = [];

      // Add 50 Mantair enemies
      for (let i = 0; i < 50; i++) {
        largeEnemyGroup.push({
          id: `mantair_${i}`,
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          health: { current: 100 + Math.random() * 40, max: 120 },
          damage: 35 + Math.random() * 20,
          speed: 70 + Math.random() * 30,
          armor: 5 + Math.random() * 10,
          shield: Math.random() > 0.5 ? Math.random() * 15 : 0,
          elementalType: 'fire',
          isAlive: true,
          threatLevel: 0.6 + Math.random() * 0.4,
          distance: 0,
        });
      }

      // Add 50 Swarm enemies
      for (let i = 0; i < 50; i++) {
        largeEnemyGroup.push({
          id: `swarm_${i}`,
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          health: { current: 20 + Math.random() * 20, max: 30 },
          damage: 15 + Math.random() * 20,
          speed: 120 + Math.random() * 60,
          armor: 1 + Math.random() * 5,
          shield: 0,
          elementalType: 'ice',
          isAlive: true,
          threatLevel: 0.3 + Math.random() * 0.4,
          distance: 0,
        });
      }

      const startTime = performance.now();
      const target = targetingSystem.findTarget(largeEnemyGroup);
      const endTime = performance.now();

      expect(target).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5); // Should complete in less than 5ms
    });

    it('should handle dynamic enemy spawning and despawning', () => {
      let currentEnemies = [...mixedEnemies];
      targetingSystem.updateTarget(currentEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Spawn new enemies
      const newEnemies: Enemy[] = [
        {
          id: 'new_mantair',
          position: { x: 100, y: 100 },
          health: { current: 120, max: 120 },
          damage: 60,
          speed: 90,
          armor: 15,
          shield: 20,
          elementalType: 'fire',
          isAlive: true,
          threatLevel: 0.9,
          distance: 141.42,
        },
        {
          id: 'new_swarm',
          position: { x: 50, y: 50 },
          health: { current: 30, max: 30 },
          damage: 35,
          speed: 180,
          armor: 1,
          shield: 0,
          elementalType: 'ice',
          isAlive: true,
          threatLevel: 0.7,
          distance: 70.71,
        },
      ];

      currentEnemies = [...currentEnemies, ...newEnemies];
      targetingSystem.updateTarget(currentEnemies);

      // Despawn some enemies
      currentEnemies = currentEnemies.filter((e) => e.id !== 'mantair2' && e.id !== 'swarm2');
      targetingSystem.updateTarget(currentEnemies);

      const finalTarget = targetingSystem.state.currentTarget;
      expect(finalTarget).toBeDefined();
      expect(finalTarget?.isAlive).toBe(true);
    });

    it('should handle dragon movement and range changes', () => {
      targetingSystem.updateTarget(mixedEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Simulate dragon moving closer to a different enemy
      const newDragon: Dragon = {
        ...dragon,
        position: { x: 200, y: 200 }, // Move closer to mantair2
      };

      // Update targeting system with new dragon position
      targetingSystem.updateConfig({ range: 600 }); // Increase range
      targetingSystem.updateTarget(mixedEnemies);

      const finalTarget = targetingSystem.state.currentTarget;
      expect(finalTarget).toBeDefined();
    });

    it('should handle strategy switching during combat', () => {
      const strategies = ['closest', 'highest_threat', 'lowest_hp', 'fastest', 'highest_armor'];
      const targets: (Enemy | null)[] = [];

      for (const strategy of strategies) {
        targetingSystem.switchStrategy(strategy as any);
        targetingSystem.updateTarget(mixedEnemies);
        targets.push(targetingSystem.state.currentTarget);
      }

      // All strategies should find valid targets
      targets.forEach((target) => {
        expect(target).toBeDefined();
        expect(target?.isAlive).toBe(true);
      });

      // Targets should vary based on strategy
      const uniqueTargets = new Set(targets.map((t) => t?.id));
      expect(uniqueTargets.size).toBeGreaterThan(1); // Should have different targets
    });
  });

  describe('Performance Integration', () => {
    it('should maintain performance with mixed enemy types', () => {
      const mixedGroup = [...mantairEnemies, ...swarmEnemies];
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const startTime = performance.now();
        targetingSystem.updateTarget(mixedGroup);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(averageTime).toBeLessThan(0.1); // Should be very fast
    });

    it('should handle strategy switching efficiently', () => {
      const strategies = ['closest', 'highest_threat', 'lowest_hp', 'fastest'];
      const times: number[] = [];

      for (const strategy of strategies) {
        const startTime = performance.now();
        targetingSystem.switchStrategy(strategy as any);
        targetingSystem.updateTarget(mixedEnemies);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(averageTime).toBeLessThan(0.1);
    });

    it('should handle persistence mode switching efficiently', () => {
      const modes = ['keep_target', 'switch_freely', 'switch_aggressive', 'manual_only'];
      const times: number[] = [];

      for (const mode of modes) {
        const startTime = performance.now();
        targetingSystem.setPersistenceMode(mode as any);
        targetingSystem.updateTarget(mixedEnemies);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(averageTime).toBeLessThan(0.1);
    });
  });

  describe('Edge Case Integration', () => {
    it('should handle all Mantair enemies dying', () => {
      targetingSystem.updateTarget(mixedEnemies);

      // Kill all Mantair enemies
      mantairEnemies.forEach((enemy) => {
        enemy.isAlive = false;
      });

      targetingSystem.updateTarget(mixedEnemies);
      const target = targetingSystem.state.currentTarget;

      expect(target).toBeDefined();
      expect(swarmEnemies.map((e) => e.id)).toContain(target?.id); // Should target Swarm
    });

    it('should handle all Swarm enemies dying', () => {
      targetingSystem.updateTarget(mixedEnemies);

      // Kill all Swarm enemies
      swarmEnemies.forEach((enemy) => {
        enemy.isAlive = false;
      });

      targetingSystem.updateTarget(mixedEnemies);
      const target = targetingSystem.state.currentTarget;

      expect(target).toBeDefined();
      expect(mantairEnemies.map((e) => e.id)).toContain(target?.id); // Should target Mantair
    });

    it('should handle all enemies dying', () => {
      targetingSystem.updateTarget(mixedEnemies);

      // Kill all enemies
      mixedEnemies.forEach((enemy) => {
        enemy.isAlive = false;
      });

      targetingSystem.updateTarget(mixedEnemies);
      const target = targetingSystem.state.currentTarget;

      expect(target).toBeNull(); // Should have no target
    });

    it('should handle enemies moving out of range', () => {
      targetingSystem.updateTarget(mixedEnemies);
      const initialTarget = targetingSystem.state.currentTarget;

      // Move all enemies out of range
      mixedEnemies.forEach((enemy) => {
        enemy.position = { x: 1000, y: 1000 };
      });

      targetingSystem.updateTarget(mixedEnemies);
      const finalTarget = targetingSystem.state.currentTarget;

      expect(finalTarget).toBeNull(); // Should have no target
    });
  });
});
