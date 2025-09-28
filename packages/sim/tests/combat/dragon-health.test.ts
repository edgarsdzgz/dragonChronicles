/**
 * Unit tests for Dragon Health System
 * Tests health management, death/respawn, pushback mechanics, and elemental integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DragonHealthImpl, DragonHealthManager } from '../../dist/combat/dragon-health.js';
import type { HealthConfig, ElementalResistance } from '../../dist/combat/types.js';

describe('DragonHealthImpl', () => {
  let health: DragonHealthImpl;
  let config: HealthConfig;

  beforeEach(() => {
    config = {
      maxHP: 100,
      baseRecoveryTime: 6,
      maxRecoveryTime: 12,
      pushbackConfig: {
        basePercentage: 0.03,
        maxPercentage: 0.15,
        landDifficultySpikes: true
      }
    };
    health = new DragonHealthImpl(config, {} as any); // Mock elemental system
  });

  describe('Health Management', () => {
    it('should initialize with full health', () => {
      expect(health.currentHP).toBe(100);
      expect(health.maxHP).toBe(100);
      expect(health.isAlive).toBe(true);
      expect(health.isRecovering).toBe(false);
    });

    it('should take damage correctly', () => {
      health.takeDamage(30);
      expect(health.currentHP).toBe(70);
      expect(health.isAlive).toBe(true);
    });

    it('should die when health reaches 0', () => {
      health.takeDamage(100);
      expect(health.currentHP).toBe(0);
      expect(health.isAlive).toBe(false);
      expect(health.isRecovering).toBe(true);
    });

    it('should heal correctly', () => {
      health.takeDamage(50);
      health.heal(20);
      expect(health.currentHP).toBe(70);
    });

    it('should not heal beyond max HP', () => {
      health.heal(50);
      expect(health.currentHP).toBe(100);
    });

    it('should respawn correctly', () => {
      health.takeDamage(100);
      health.respawn();
      expect(health.currentHP).toBe(100);
      expect(health.isAlive).toBe(true);
      expect(health.isRecovering).toBe(false);
    });
  });

  describe('Death and Recovery System', () => {
    it('should start recovery when dying', () => {
      health.takeDamage(100);
      expect(health.isRecovering).toBe(true);
      expect(health.recoveryProgress).toBe(0);
    });

    it('should not take damage while recovering', () => {
      health.takeDamage(100);
      const initialHP = health.currentHP;
      health.takeDamage(50);
      expect(health.currentHP).toBe(initialHP);
    });

    it('should not heal while dead', () => {
      health.takeDamage(100);
      const initialHP = health.currentHP;
      health.heal(50);
      expect(health.currentHP).toBe(initialHP);
    });

    it('should update recovery progress', () => {
      health.takeDamage(100);
      health.startRecovery(1000, 1, 1);
      
      // Simulate time passing
      health.updateRecovery(3000); // 3 seconds
      expect(health.recoveryProgress).toBeGreaterThan(0);
      expect(health.recoveryProgress).toBeLessThan(1);
    });

    it('should complete recovery after full duration', () => {
      health.takeDamage(100);
      health.startRecovery(1000, 1, 1);
      
      // Simulate full recovery time (9 seconds for Land 1 Ward 1: 6 + 3% * 100 = 9)
      health.updateRecovery(9000); // 9 seconds
      expect(health.recoveryProgress).toBe(1);
      expect(health.isRecovering).toBe(false);
      expect(health.isAlive).toBe(true);
    });
  });

  describe('Pushback Calculation', () => {
    it('should calculate correct pushback for Land 1 Ward 1', () => {
      health.takeDamage(100); // Die first
      health.startRecovery(1000, 1, 1);
      expect(health.pushbackPercentage).toBe(0.03);
      expect(health.pushbackDistance).toBe(30);
    });

    it('should calculate correct pushback for Land 1 Ward 5', () => {
      health.takeDamage(100); // Die first
      health.startRecovery(1000, 1, 5);
      expect(health.pushbackPercentage).toBe(0.12);
      expect(health.pushbackDistance).toBe(120);
    });

    it('should calculate correct pushback for Land 2 Ward 1 (new land)', () => {
      health.takeDamage(100); // Die first
      health.startRecovery(1000, 2, 1);
      expect(health.pushbackPercentage).toBe(0.03);
      expect(health.pushbackDistance).toBe(30);
    });

    it('should calculate correct pushback for Land 2 Ward 5', () => {
      health.takeDamage(100); // Die first
      health.startRecovery(1000, 2, 5);
      expect(health.pushbackPercentage).toBe(0.15);
      expect(health.pushbackDistance).toBe(150);
    });

    it('should never result in negative distance', () => {
      health.takeDamage(100); // Die first
      health.startRecovery(50, 1, 1);
      expect(health.pushbackDistance).toBeGreaterThanOrEqual(0);
    });

    it('should handle edge case of very small distance', () => {
      health.takeDamage(100); // Die first
      health.startRecovery(10, 1, 1);
      expect(health.pushbackDistance).toBe(0.3);
    });
  });

  describe('Ward/Land Transition', () => {
    it('should handle ward transition correctly', () => {
      const result = health.handleWardTransition(1000, 1, 1);
      expect(result.newDistance).toBe(970);
      expect(result.newLand).toBe(1);
      expect(result.newWard).toBe(2); // Distance 970 should be in ward 2
      expect(result.pushbackAmount).toBe(30);
    });

    it('should handle land transition correctly', () => {
      const result = health.handleWardTransition(2500, 1, 5);
      expect(result.newDistance).toBe(2200);
      expect(result.newLand).toBe(2);
      expect(result.newWard).toBe(1);
    });

    it('should never result in negative distance', () => {
      const result = health.handleWardTransition(10, 1, 1);
      expect(result.newDistance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Elemental Integration', () => {
    it('should apply elemental resistance correctly', () => {
      health.setElementalResistance('fire', 50);
      health.takeElementalDamage(100, 'fire');
      expect(health.currentHP).toBe(50); // 50% resistance = 50 damage
    });

    it('should handle no resistance', () => {
      health.takeElementalDamage(50, 'ice');
      expect(health.currentHP).toBe(50);
    });

    it('should handle 100% resistance', () => {
      health.setElementalResistance('lightning', 100);
      health.takeElementalDamage(100, 'lightning');
      expect(health.currentHP).toBe(100); // No damage
    });

    it('should not take elemental damage while recovering', () => {
      health.takeDamage(100);
      const initialHP = health.currentHP;
      health.takeElementalDamage(50, 'fire');
      expect(health.currentHP).toBe(initialHP);
    });
  });

  describe('Status Effects', () => {
    it('should track active status effects', () => {
      const effects = health.getActiveStatusEffects();
      expect(Array.isArray(effects)).toBe(true);
    });

    it('should update status effects over time', () => {
      // Add a status effect (this would be done by the elemental system)
      health.updateStatusEffects(1000); // 1 second
      const effects = health.getActiveStatusEffects();
      expect(Array.isArray(effects)).toBe(true);
    });
  });
});

describe('DragonHealthManager', () => {
  let manager: DragonHealthManager;
  let config: HealthConfig;

  beforeEach(() => {
    config = {
      maxHP: 100,
      baseRecoveryTime: 6,
      maxRecoveryTime: 12,
      pushbackConfig: {
        basePercentage: 0.03,
        maxPercentage: 0.15,
        landDifficultySpikes: true
      }
    };
    manager = new DragonHealthManager(config, 1, 1, 1000);
  });

  describe('Health Management', () => {
    it('should initialize correctly', () => {
      expect(manager.isAlive()).toBe(true);
      expect(manager.isRecovering()).toBe(false);
      expect(manager.getHealthPercentage()).toBe(1.0);
    });

    it('should take damage correctly', () => {
      manager.takeDamage(30);
      expect(manager.getHealthPercentage()).toBe(0.7);
    });

    it('should heal correctly', () => {
      manager.takeDamage(50);
      manager.heal(20);
      expect(manager.getHealthPercentage()).toBe(0.7);
    });

    it('should respawn correctly', () => {
      manager.takeDamage(100);
      manager.respawn();
      expect(manager.isAlive()).toBe(true);
      expect(manager.getHealthPercentage()).toBe(1.0);
    });
  });

  describe('Recovery System', () => {
    it('should start recovery when dying', () => {
      manager.takeDamage(100);
      expect(manager.isRecovering()).toBe(true);
      expect(manager.getRecoveryProgress()).toBe(0);
    });

    it('should update recovery over time', () => {
      manager.takeDamage(100);
      manager.startRecovery();
      manager.update(3000); // 3 seconds
      expect(manager.getRecoveryProgress()).toBeGreaterThan(0);
    });

    it('should complete recovery after full duration', () => {
      manager.takeDamage(100);
      manager.startRecovery();
      manager.update(9000); // 9 seconds (6 + 3% * 100 = 9)
      expect(manager.getRecoveryProgress()).toBe(1);
      expect(manager.isRecovering()).toBe(false);
    });
  });

  describe('Pushback System', () => {
    it('should calculate pushback distance correctly', () => {
      manager.takeDamage(100);
      manager.startRecovery();
      const pushbackDistance = manager.getPushbackDistance();
      expect(pushbackDistance).toBeGreaterThan(0);
    });

    it('should handle ward transition', () => {
      const result = manager.handleWardTransition();
      expect(result.newDistance).toBeGreaterThanOrEqual(0);
      expect(result.newLand).toBeGreaterThan(0);
      expect(result.newWard).toBeGreaterThan(0);
    });

    it('should update position correctly', () => {
      manager.updatePosition(2, 3, 2000);
      const result = manager.handleWardTransition();
      expect(result.newLand).toBe(1); // Should be land 1 after pushback
    });
  });

  describe('Elemental System Integration', () => {
    it('should take elemental damage correctly', () => {
      manager.takeElementalDamage(50, 'fire');
      expect(manager.getHealthPercentage()).toBe(0.5);
    });

    it('should set elemental resistance', () => {
      manager.setElementalResistance('ice', 75);
      const resistances = manager.getElementalResistances();
      expect(resistances.ice).toBe(75);
    });

    it('should get elemental resistances', () => {
      manager.setElementalResistance('fire', 50);
      manager.setElementalResistance('ice', 25);
      const resistances = manager.getElementalResistances();
      expect(resistances.fire).toBe(50);
      expect(resistances.ice).toBe(25);
    });
  });

  describe('Status Effects', () => {
    it('should track active status effects', () => {
      const effects = manager.getActiveStatusEffects();
      expect(Array.isArray(effects)).toBe(true);
    });

    it('should update status effects over time', () => {
      manager.update(1000); // 1 second
      const effects = manager.getActiveStatusEffects();
      expect(Array.isArray(effects)).toBe(true);
    });
  });
});

describe('Pushback Percentage Progression', () => {
  let manager: DragonHealthManager;

  beforeEach(() => {
    const config: HealthConfig = {
      maxHP: 100,
      baseRecoveryTime: 6,
      maxRecoveryTime: 12,
      pushbackConfig: {
        basePercentage: 0.03,
        maxPercentage: 0.15,
        landDifficultySpikes: true
      }
    };
    manager = new DragonHealthManager(config, 1, 1, 1000);
  });

  it('should follow Land 1 progression pattern', () => {
    const land1Wards = [
      { ward: 1, expected: 0.03 },
      { ward: 2, expected: 0.05 },
      { ward: 3, expected: 0.07 },
      { ward: 4, expected: 0.10 },
      { ward: 5, expected: 0.12 }
    ];

    land1Wards.forEach(({ ward, expected }) => {
      manager.updatePosition(1, ward, 1000);
      manager.takeDamage(100);
      manager.startRecovery();
      expect(manager.getPushbackPercentage()).toBeCloseTo(expected, 2);
      manager.respawn();
    });
  });

  it('should follow Land 2 progression pattern with difficulty spike', () => {
    const land2Wards = [
      { ward: 1, expected: 0.03 }, // New land tutorial
      { ward: 2, expected: 0.06 },
      { ward: 3, expected: 0.09 },
      { ward: 4, expected: 0.12 },
      { ward: 5, expected: 0.15 }
    ];

    land2Wards.forEach(({ ward, expected }) => {
      manager.updatePosition(2, ward, 1000);
      manager.takeDamage(100);
      manager.startRecovery();
      expect(manager.getPushbackPercentage()).toBeCloseTo(expected, 2);
      manager.respawn();
    });
  });

  it('should follow Land 3 progression pattern with difficulty spike', () => {
    const land3Wards = [
      { ward: 1, expected: 0.03 }, // New land tutorial
      { ward: 2, expected: 0.07 },
      { ward: 3, expected: 0.11 },
      { ward: 4, expected: 0.14 },
      { ward: 5, expected: 0.15 }
    ];

    land3Wards.forEach(({ ward, expected }) => {
      manager.updatePosition(3, ward, 1000);
      manager.takeDamage(100);
      manager.startRecovery();
      expect(manager.getPushbackPercentage()).toBeCloseTo(expected, 2);
      manager.respawn();
    });
  });
});

describe('Edge Cases', () => {
  let manager: DragonHealthManager;

  beforeEach(() => {
    const config: HealthConfig = {
      maxHP: 100,
      baseRecoveryTime: 6,
      maxRecoveryTime: 12,
      pushbackConfig: {
        basePercentage: 0.03,
        maxPercentage: 0.15,
        landDifficultySpikes: true
      }
    };
    manager = new DragonHealthManager(config, 1, 1, 1000);
  });

  it('should handle zero distance pushback', () => {
    manager.updatePosition(1, 1, 0);
    manager.takeDamage(100);
    manager.startRecovery();
    expect(manager.getPushbackDistance()).toBe(0);
  });

  it('should handle very small distance', () => {
    manager.updatePosition(1, 1, 1);
    manager.takeDamage(100);
    manager.startRecovery();
    expect(manager.getPushbackDistance()).toBeGreaterThanOrEqual(0);
  });

  it('should handle maximum pushback percentage', () => {
    manager.updatePosition(2, 5, 1000);
    manager.takeDamage(100);
    manager.startRecovery();
    expect(manager.getPushbackPercentage()).toBe(0.15);
  });

  it('should handle unknown land/ward combinations', () => {
    manager.updatePosition(99, 99, 1000);
    manager.takeDamage(100);
    manager.startRecovery();
    expect(manager.getPushbackPercentage()).toBeGreaterThan(0);
    expect(manager.getPushbackPercentage()).toBeLessThanOrEqual(0.15);
  });
});
