/**
 * Elemental System Implementation for Draconia Chronicles
 * Implements the nested triangle system with meta-triangle and sub-triangles
 */

import type { 
  ElementalType, 
  ElementalCategory, 
  StatusEffect, 
  DamageCalculation,
  DamageSource
} from './types.js';

// ============================================================================
// ELEMENTAL SYSTEM CONFIGURATION
// ============================================================================

export class ElementalSystem {
  private config: Record<string, unknown>;
  private effectivenessMatrix: Map<string, number>;

  constructor() {
    this.config = this.createDefaultConfig();
    this.effectivenessMatrix = this.buildEffectivenessMatrix();
  }

  private createDefaultConfig(): Record<string, unknown> {
    return {
      metaTriangle: {
        heat: 'heat',
        cold: 'cold', 
        energy: 'energy'
      },
      subTriangles: {
        heat: ['fire', 'lava', 'steam'],
        cold: ['ice', 'frost', 'mist'],
        energy: ['lightning', 'plasma', 'void']
      },
      effectivenessMatrix: [],
      statusEffects: this.createStatusEffectConfigs()
    };
  }

  private createStatusEffectConfigs(): Record<string, unknown>[] {
    return [
      // Heat effects
      { type: 'burn', elementalType: 'fire', duration: 5, damage: 0.02, debuff: {} },
      { type: 'melt', elementalType: 'lava', duration: 8, damage: 0, debuff: { armorReduction: 0.25 } },
      { type: 'scorch', elementalType: 'steam', duration: 6, damage: 0, debuff: { accuracyReduction: 0.30 } },
      
      // Cold effects
      { type: 'freeze', elementalType: 'ice', duration: 3, damage: 0, debuff: { actionPrevention: true } },
      { type: 'chill', elementalType: 'frost', duration: 8, damage: 0, debuff: { speedReduction: 0.40 } },
      { type: 'blind', elementalType: 'mist', duration: 4, damage: 0, debuff: { accuracyReduction: 0.50 } },
      
      // Energy effects
      { type: 'stun', elementalType: 'lightning', duration: 2, damage: 0, debuff: { actionPrevention: true } },
      { type: 'overheat', elementalType: 'plasma', duration: 6, damage: 0, debuff: { damageIncrease: 0.25 } },
      { type: 'corrupt', elementalType: 'void', duration: 10, damage: 0, debuff: { healingPrevention: true } }
    ];
  }

  private buildEffectivenessMatrix(): Map<string, number> {
    const matrix = new Map<string, number>();

    // Meta-triangle: Heat > Cold > Energy > Heat
    this.addMetaTriangleEffectiveness(matrix);
    
    // Sub-triangles: Internal relationships
    this.addSubTriangleEffectiveness(matrix);
    
    // Cross-triangle rules
    this.addCrossTriangleRules(matrix);

    return matrix;
  }

  private addMetaTriangleEffectiveness(matrix: Map<string, number>): void {
    // Heat beats Cold (150% damage)
    matrix.set('fire>ice', 1.5);
    matrix.set('fire>frost', 1.5);
    matrix.set('fire>mist', 1.5);
    matrix.set('lava>ice', 1.5);
    matrix.set('lava>frost', 1.5);
    matrix.set('lava>mist', 1.5);
    matrix.set('steam>ice', 1.5);
    matrix.set('steam>frost', 1.5);
    matrix.set('steam>mist', 1.5);

    // Cold beats Energy (150% damage)
    matrix.set('ice>lightning', 1.5);
    matrix.set('ice>plasma', 1.5);
    matrix.set('ice>void', 1.5);
    matrix.set('frost>lightning', 1.5);
    matrix.set('frost>plasma', 1.5);
    matrix.set('frost>void', 1.5);
    matrix.set('mist>lightning', 1.5);
    matrix.set('mist>plasma', 1.5);
    matrix.set('mist>void', 1.5);

    // Energy beats Heat (150% damage)
    matrix.set('lightning>fire', 1.5);
    matrix.set('lightning>lava', 1.5);
    matrix.set('lightning>steam', 1.5);
    matrix.set('plasma>fire', 1.5);
    matrix.set('plasma>lava', 1.5);
    matrix.set('plasma>steam', 1.5);
    matrix.set('void>fire', 1.5);
    matrix.set('void>lava', 1.5);
    matrix.set('void>steam', 1.5);
  }

  private addSubTriangleEffectiveness(matrix: Map<string, number>): void {
    // Heat sub-triangle: Fire > Lava > Steam > Fire
    matrix.set('fire>lava', 1.5);
    matrix.set('lava>steam', 1.5);
    matrix.set('steam>fire', 1.5);

    // Cold sub-triangle: Ice > Frost > Mist > Ice
    matrix.set('ice>frost', 1.5);
    matrix.set('frost>mist', 1.5);
    matrix.set('mist>ice', 1.5);

    // Energy sub-triangle: Lightning > Plasma > Void > Lightning
    matrix.set('lightning>plasma', 1.5);
    matrix.set('plasma>void', 1.5);
    matrix.set('void>lightning', 1.5);
  }

  private addCrossTriangleRules(matrix: Map<string, number>): void {
    // Opposite triangle: 75% damage (weakness)
    const oppositeTriangles = [
      // Heat vs Energy (Energy beats Heat, so Heat is weak)
      ['fire', 'lightning'], ['fire', 'plasma'], ['fire', 'void'],
      ['lava', 'lightning'], ['lava', 'plasma'], ['lava', 'void'],
      ['steam', 'lightning'], ['steam', 'plasma'], ['steam', 'void'],
      
      // Cold vs Heat (Heat beats Cold, so Cold is weak)
      ['ice', 'fire'], ['ice', 'lava'], ['ice', 'steam'],
      ['frost', 'fire'], ['frost', 'lava'], ['frost', 'steam'],
      ['mist', 'fire'], ['mist', 'lava'], ['mist', 'steam'],
      
      // Energy vs Cold (Cold beats Energy, so Energy is weak)
      ['lightning', 'ice'], ['lightning', 'frost'], ['lightning', 'mist'],
      ['plasma', 'ice'], ['plasma', 'frost'], ['plasma', 'mist'],
      ['void', 'ice'], ['void', 'frost'], ['void', 'mist']
    ];

    oppositeTriangles.forEach(([attacker, defender]) => {
      matrix.set(`${attacker}>${defender}`, 0.75);
    });
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Calculate elemental damage effectiveness
   */
  public calculateEffectiveness(attacker: ElementalType, defender: ElementalType): number {
    const key = `${attacker}>${defender}`;
    return this.effectivenessMatrix.get(key) || 1.0; // Default neutral
  }

  /**
   * Calculate complete damage with elemental modifiers
   */
  public calculateDamage(
    source: DamageSource, 
    _defenderElementalType: ElementalType,
    defenderResistances: Map<ElementalType, number> = new Map()
  ): DamageCalculation {
    const effectiveness = this.calculateEffectiveness(source.elementalType, _defenderElementalType);
    const resistance = defenderResistances.get(source.elementalType) || 0;
    const resistanceReduction = 1 - (resistance / 100);
    
    const elementalMultiplier = effectiveness;
    const finalDamage = Math.max(0, 
      source.baseDamage * elementalMultiplier * resistanceReduction
    );

    return {
      baseDamage: source.baseDamage,
      elementalMultiplier: effectiveness,
      resistanceReduction: resistanceReduction,
      statusEffectBonus: 0, // TODO: Implement status effect bonuses
      finalDamage: Math.round(finalDamage),
      statusEffectApplied: this.rollStatusEffect(source, _defenderElementalType)
    };
  }

  /**
   * Roll for status effect application
   */
  private rollStatusEffect(source: DamageSource, _defender: ElementalType): StatusEffect | undefined {
    if (Math.random() > source.statusEffectChance) {
      return undefined;
    }

    const config = this.config.statusEffects.find(
      effect => effect.elementalType === source.elementalType
    );

    if (!config) {
      return undefined;
    }

    return {
      type: config.type,
      duration: config.duration,
      intensity: 1.0,
      damage: config.damage,
      debuff: config.debuff
    };
  }

  /**
   * Get elemental category for a type
   */
  public getElementalCategory(elementalType: ElementalType): ElementalCategory {
    if (['fire', 'lava', 'steam'].includes(elementalType)) return 'heat';
    if (['ice', 'frost', 'mist'].includes(elementalType)) return 'cold';
    if (['lightning', 'plasma', 'void'].includes(elementalType)) return 'energy';
    throw new Error(`Unknown elemental type: ${elementalType}`);
  }

  /**
   * Check if two elements are in the same category
   */
  public areSameCategory(type1: ElementalType, type2: ElementalType): boolean {
    return this.getElementalCategory(type1) === this.getElementalCategory(type2);
  }

  /**
   * Get all elements in a category
   */
  public getElementsInCategory(category: ElementalCategory): ElementalType[] {
    return this.config.subTriangles[category];
  }

  /**
   * Get land-based elemental theme
   */
  public getLandElementalTheme(landLevel: number): {
    primary: ElementalCategory;
    secondary: ElementalCategory;
    resistance: ElementalCategory;
  } {
    const themes = {
      1: { primary: 'cold' as ElementalCategory, secondary: 'energy' as ElementalCategory, resistance: 'heat' as ElementalCategory },    // Horizon Steppe
      2: { primary: 'heat' as ElementalCategory, secondary: 'cold' as ElementalCategory, resistance: 'energy' as ElementalCategory },  // Ember Reaches
      3: { primary: 'energy' as ElementalCategory, secondary: 'cold' as ElementalCategory, resistance: 'heat' as ElementalCategory }   // Mistral Peaks
    };

    return themes[landLevel as keyof typeof themes] || themes[1];
  }

  /**
   * Get recommended enemy elemental types for a land/ward
   */
  public getRecommendedEnemyElements(landLevel: number, _wardLevel: number): ElementalType[] {
    const theme = this.getLandElementalTheme(landLevel);
    const primaryElements = this.getElementsInCategory(theme.primary);
    const secondaryElements = this.getElementsInCategory(theme.secondary);
    
    // Mix primary and secondary elements based on ward progression
    const primaryWeight = Math.min(0.8, 0.4 + (_wardLevel - 1) * 0.1);
    const elements = [...primaryElements];
    
    if (Math.random() > primaryWeight) {
      elements.push(...secondaryElements);
    }
    
    return elements;
  }
}
