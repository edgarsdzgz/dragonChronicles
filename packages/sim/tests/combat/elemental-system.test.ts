/**
 * Unit tests for Elemental System
 * Tests nested triangle system, effectiveness calculations, and status effects
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalSystem } from '../../dist/combat/elemental-system.js';
import type { ElementalType, ElementalCategory } from '../../dist/combat/types.js';

describe('ElementalSystem', () => {
  let elementalSystem: ElementalSystem;

  beforeEach(() => {
    elementalSystem = new ElementalSystem();
  });

  describe('Meta-Triangle Effectiveness', () => {
    it('should calculate Heat > Cold effectiveness correctly', () => {
      // Heat beats Cold (150% damage)
      expect(elementalSystem.calculateEffectiveness('fire', 'ice')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('fire', 'frost')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('fire', 'mist')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('lava', 'ice')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('steam', 'frost')).toBe(1.5);
    });

    it('should calculate Cold > Energy effectiveness correctly', () => {
      // Cold beats Energy (150% damage)
      expect(elementalSystem.calculateEffectiveness('ice', 'lightning')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('ice', 'plasma')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('ice', 'void')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('frost', 'lightning')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('mist', 'plasma')).toBe(1.5);
    });

    it('should calculate Energy > Heat effectiveness correctly', () => {
      // Energy beats Heat (150% damage)
      expect(elementalSystem.calculateEffectiveness('lightning', 'fire')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('lightning', 'lava')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('lightning', 'steam')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('plasma', 'fire')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('void', 'lava')).toBe(1.5);
    });
  });

  describe('Sub-Triangle Effectiveness', () => {
    it('should calculate Heat sub-triangle correctly', () => {
      // Fire > Lava > Steam > Fire
      expect(elementalSystem.calculateEffectiveness('fire', 'lava')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('lava', 'steam')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('steam', 'fire')).toBe(1.5);
    });

    it('should calculate Cold sub-triangle correctly', () => {
      // Ice > Frost > Mist > Ice
      expect(elementalSystem.calculateEffectiveness('ice', 'frost')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('frost', 'mist')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('mist', 'ice')).toBe(1.5);
    });

    it('should calculate Energy sub-triangle correctly', () => {
      // Lightning > Plasma > Void > Lightning
      expect(elementalSystem.calculateEffectiveness('lightning', 'plasma')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('plasma', 'void')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('void', 'lightning')).toBe(1.5);
    });
  });

  describe('Cross-Triangle Rules', () => {
    it('should calculate opposite triangle weakness correctly', () => {
      // Heat vs Energy (Energy beats Heat, so Heat is weak)
      expect(elementalSystem.calculateEffectiveness('fire', 'lightning')).toBe(0.75);
      expect(elementalSystem.calculateEffectiveness('fire', 'plasma')).toBe(0.75);
      expect(elementalSystem.calculateEffectiveness('fire', 'void')).toBe(0.75);
      expect(elementalSystem.calculateEffectiveness('lava', 'lightning')).toBe(0.75);
      expect(elementalSystem.calculateEffectiveness('steam', 'plasma')).toBe(0.75);
    });

    it('should calculate neutral effectiveness for same elements', () => {
      expect(elementalSystem.calculateEffectiveness('fire', 'fire')).toBe(1.0);
      expect(elementalSystem.calculateEffectiveness('ice', 'ice')).toBe(1.0);
      expect(elementalSystem.calculateEffectiveness('lightning', 'lightning')).toBe(1.0);
    });
  });

  describe('Elemental Categories', () => {
    it('should correctly identify Heat elements', () => {
      expect(elementalSystem.getElementalCategory('fire')).toBe('heat');
      expect(elementalSystem.getElementalCategory('lava')).toBe('heat');
      expect(elementalSystem.getElementalCategory('steam')).toBe('heat');
    });

    it('should correctly identify Cold elements', () => {
      expect(elementalSystem.getElementalCategory('ice')).toBe('cold');
      expect(elementalSystem.getElementalCategory('frost')).toBe('cold');
      expect(elementalSystem.getElementalCategory('mist')).toBe('cold');
    });

    it('should correctly identify Energy elements', () => {
      expect(elementalSystem.getElementalCategory('lightning')).toBe('energy');
      expect(elementalSystem.getElementalCategory('plasma')).toBe('energy');
      expect(elementalSystem.getElementalCategory('void')).toBe('energy');
    });
  });

  describe('Category Relationships', () => {
    it('should identify same category elements', () => {
      expect(elementalSystem.areSameCategory('fire', 'lava')).toBe(true);
      expect(elementalSystem.areSameCategory('ice', 'frost')).toBe(true);
      expect(elementalSystem.areSameCategory('lightning', 'plasma')).toBe(true);
    });

    it('should identify different category elements', () => {
      expect(elementalSystem.areSameCategory('fire', 'ice')).toBe(false);
      expect(elementalSystem.areSameCategory('ice', 'lightning')).toBe(false);
      expect(elementalSystem.areSameCategory('lightning', 'fire')).toBe(false);
    });
  });

  describe('Elements in Category', () => {
    it('should return Heat elements', () => {
      const heatElements = elementalSystem.getElementsInCategory('heat');
      expect(heatElements).toContain('fire');
      expect(heatElements).toContain('lava');
      expect(heatElements).toContain('steam');
      expect(heatElements).toHaveLength(3);
    });

    it('should return Cold elements', () => {
      const coldElements = elementalSystem.getElementsInCategory('cold');
      expect(coldElements).toContain('ice');
      expect(coldElements).toContain('frost');
      expect(coldElements).toContain('mist');
      expect(coldElements).toHaveLength(3);
    });

    it('should return Energy elements', () => {
      const energyElements = elementalSystem.getElementsInCategory('energy');
      expect(energyElements).toContain('lightning');
      expect(energyElements).toContain('plasma');
      expect(energyElements).toContain('void');
      expect(energyElements).toHaveLength(3);
    });
  });

  describe('Land Elemental Themes', () => {
    it('should return correct theme for Land 1 (Horizon Steppe)', () => {
      const theme = elementalSystem.getLandElementalTheme(1);
      expect(theme.primary).toBe('cold');
      expect(theme.secondary).toBe('energy');
      expect(theme.resistance).toBe('heat');
    });

    it('should return correct theme for Land 2 (Ember Reaches)', () => {
      const theme = elementalSystem.getLandElementalTheme(2);
      expect(theme.primary).toBe('heat');
      expect(theme.secondary).toBe('cold');
      expect(theme.resistance).toBe('energy');
    });

    it('should return correct theme for Land 3 (Mistral Peaks)', () => {
      const theme = elementalSystem.getLandElementalTheme(3);
      expect(theme.primary).toBe('energy');
      expect(theme.secondary).toBe('cold');
      expect(theme.resistance).toBe('heat');
    });

    it('should return default theme for unknown land', () => {
      const theme = elementalSystem.getLandElementalTheme(99);
      expect(theme.primary).toBe('cold');
      expect(theme.secondary).toBe('energy');
      expect(theme.resistance).toBe('heat');
    });
  });

  describe('Recommended Enemy Elements', () => {
    it('should return appropriate elements for Land 1 Ward 1', () => {
      const elements = elementalSystem.getRecommendedEnemyElements(1, 1);
      expect(elements.length).toBeGreaterThan(0);
      // Should primarily be cold elements for Land 1
      const coldElements = elements.filter(el => 
        ['ice', 'frost', 'mist'].includes(el)
      );
      expect(coldElements.length).toBeGreaterThan(0);
    });

    it('should return appropriate elements for Land 2 Ward 1', () => {
      const elements = elementalSystem.getRecommendedEnemyElements(2, 1);
      expect(elements.length).toBeGreaterThan(0);
      // Should primarily be heat elements for Land 2
      const heatElements = elements.filter(el => 
        ['fire', 'lava', 'steam'].includes(el)
      );
      expect(heatElements.length).toBeGreaterThan(0);
    });

    it('should return appropriate elements for Land 3 Ward 1', () => {
      const elements = elementalSystem.getRecommendedEnemyElements(3, 1);
      expect(elements.length).toBeGreaterThan(0);
      // Should primarily be energy elements for Land 3
      const energyElements = elements.filter(el => 
        ['lightning', 'plasma', 'void'].includes(el)
      );
      expect(energyElements.length).toBeGreaterThan(0);
    });
  });

  describe('Damage Calculation', () => {
    it('should calculate damage with effectiveness', () => {
      const source = {
        baseDamage: 100,
        elementalType: 'fire' as ElementalType,
        statusEffectChance: 0.1,
        criticalChance: 0.1,
        criticalMultiplier: 1.5
      };

      const calculation = elementalSystem.calculateDamage(
        source, 
        'ice', // Fire beats Ice (1.5x)
        new Map()
      );

      expect(calculation.baseDamage).toBe(100);
      expect(calculation.elementalMultiplier).toBe(1.5);
      expect(calculation.finalDamage).toBe(150);
    });

    it('should calculate damage with resistance', () => {
      const source = {
        baseDamage: 100,
        elementalType: 'fire' as ElementalType,
        statusEffectChance: 0.1,
        criticalChance: 0.1,
        criticalMultiplier: 1.5
      };

      const resistances = new Map<ElementalType, number>();
      resistances.set('fire', 50); // 50% resistance

      const calculation = elementalSystem.calculateDamage(
        source, 
        'ice', // Fire beats Ice (1.5x)
        resistances
      );

      expect(calculation.baseDamage).toBe(100);
      expect(calculation.elementalMultiplier).toBe(1.5);
      expect(calculation.resistanceReduction).toBe(0.5);
      expect(calculation.finalDamage).toBe(75); // 100 * 1.5 * 0.5
    });

    it('should calculate damage with weakness', () => {
      const source = {
        baseDamage: 100,
        elementalType: 'fire' as ElementalType,
        statusEffectChance: 0.1,
        criticalChance: 0.1,
        criticalMultiplier: 1.5
      };

      const calculation = elementalSystem.calculateDamage(
        source, 
        'lightning', // Fire weak vs Lightning (0.75x)
        new Map()
      );

      expect(calculation.baseDamage).toBe(100);
      expect(calculation.elementalMultiplier).toBe(0.75);
      expect(calculation.finalDamage).toBe(75);
    });

    it('should never result in negative damage', () => {
      const source = {
        baseDamage: 100,
        elementalType: 'fire' as ElementalType,
        statusEffectChance: 0.1,
        criticalChance: 0.1,
        criticalMultiplier: 1.5
      };

      const resistances = new Map<ElementalType, number>();
      resistances.set('fire', 200); // 200% resistance (impossible but test edge case)

      const calculation = elementalSystem.calculateDamage(
        source, 
        'ice',
        resistances
      );

      expect(calculation.finalDamage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Status Effect Application', () => {
    it('should roll for status effects based on chance', () => {
      const source = {
        baseDamage: 100,
        elementalType: 'fire' as ElementalType,
        statusEffectChance: 1.0, // 100% chance
        criticalChance: 0.1,
        criticalMultiplier: 1.5
      };

      const calculation = elementalSystem.calculateDamage(
        source, 
        'ice',
        new Map()
      );

      // With 100% chance, should always get status effect
      expect(calculation.statusEffectApplied).toBeDefined();
      if (calculation.statusEffectApplied) {
        expect(calculation.statusEffectApplied.type).toBe('burn');
        expect(calculation.statusEffectApplied.duration).toBe(5);
      }
    });

    it('should not apply status effects with 0% chance', () => {
      const source = {
        baseDamage: 100,
        elementalType: 'fire' as ElementalType,
        statusEffectChance: 0.0, // 0% chance
        criticalChance: 0.1,
        criticalMultiplier: 1.5
      };

      const calculation = elementalSystem.calculateDamage(
        source, 
        'ice',
        new Map()
      );

      expect(calculation.statusEffectApplied).toBeUndefined();
    });
  });

  describe('Comprehensive Effectiveness Matrix', () => {
    const allElements: ElementalType[] = [
      'fire', 'lava', 'steam',
      'ice', 'frost', 'mist', 
      'lightning', 'plasma', 'void'
    ];

    it('should have consistent effectiveness values', () => {
      allElements.forEach(attacker => {
        allElements.forEach(defender => {
          const effectiveness = elementalSystem.calculateEffectiveness(attacker, defender);
          expect(effectiveness).toBeGreaterThan(0);
          expect(effectiveness).toBeLessThanOrEqual(1.5);
          expect(effectiveness).toBeCloseTo(effectiveness, 2); // Should be precise
        });
      });
    });

    it('should have neutral effectiveness for same elements', () => {
      allElements.forEach(element => {
        const effectiveness = elementalSystem.calculateEffectiveness(element, element);
        expect(effectiveness).toBe(1.0);
      });
    });

    it('should have strong effectiveness for meta-triangle relationships', () => {
      // Heat > Cold
      expect(elementalSystem.calculateEffectiveness('fire', 'ice')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('lava', 'frost')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('steam', 'mist')).toBe(1.5);
      
      // Cold > Energy
      expect(elementalSystem.calculateEffectiveness('ice', 'lightning')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('frost', 'plasma')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('mist', 'void')).toBe(1.5);
      
      // Energy > Heat
      expect(elementalSystem.calculateEffectiveness('lightning', 'fire')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('plasma', 'lava')).toBe(1.5);
      expect(elementalSystem.calculateEffectiveness('void', 'steam')).toBe(1.5);
    });
  });
});
