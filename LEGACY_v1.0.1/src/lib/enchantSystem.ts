// MVP 1.1 Principal Engineer Implementation - Enchant System per CTO Spec §4
import { Decimal } from '$lib/num/decimal';

// Base costs per enchant (configurable constants)
export const ENCHANT_BASE_COSTS = {
  firepower: new Decimal(10),
  scales: new Decimal(12),
} as const;

export type EnchantType = 'firepower' | 'scales';
export type TierLevel = 1 | 2 | 3;

export interface EnchantState {
  level: number;        // 0..500
  tierUnlocked: TierLevel; // starts at 1
}

export interface EnchantsState {
  firepower: EnchantState;
  scales: EnchantState;
}

/**
 * Calculate cost for next level per spec: ceil(base * 1.4^(n-1))
 * where n is the level we're buying (current + 1)
 */
export function calculateEnchantCost(enchantType: EnchantType, fromLevel: number): Decimal {
  if (fromLevel >= 500) return new Decimal(Infinity); // Max level cap
  
  const base = ENCHANT_BASE_COSTS[enchantType];
  const targetLevel = fromLevel + 1;
  const exponent = targetLevel - 1;
  
  // cost(n) = ceil(base * 1.4^(n-1))
  const cost = base.mul(Decimal.pow(1.4, exponent));
  return cost.ceil();
}

/**
 * Get tier ranges per spec
 */
export function getTierBounds(tier: TierLevel): [number, number] {
  switch (tier) {
    case 1: return [0, 50];   // T1: levels 0-50
    case 2: return [51, 200]; // T2: levels 51-200
    case 3: return [201, 500]; // T3: levels 201-500
  }
}

/**
 * Determine which tier a level belongs to
 */
export function getLevelTier(level: number): TierLevel {
  if (level <= 50) return 1;
  if (level <= 200) return 2;
  return 3;
}

/**
 * Calculate tier up cost per spec: 3x cost of last level in current tier
 */
export function calculateTierUpCost(enchantType: EnchantType, currentTier: TierLevel): Decimal {
  if (currentTier >= 3) return new Decimal(Infinity); // Already max tier
  
  const [, maxLevel] = getTierBounds(currentTier);
  const lastLevelCost = calculateEnchantCost(enchantType, maxLevel - 1); // Cost to go from maxLevel-1 to maxLevel
  
  return lastLevelCost.mul(3);
}

/**
 * Check if enchant can tier up (bar full and affordable)
 */
export function canTierUp(enchant: EnchantState, arcana: Decimal, enchantType: EnchantType): boolean {
  if (enchant.tierUnlocked >= 3) return false; // Already max tier
  
  const [, maxLevel] = getTierBounds(enchant.tierUnlocked);
  if (enchant.level < maxLevel) return false; // Tier not full
  
  const cost = calculateTierUpCost(enchantType, enchant.tierUnlocked);
  return arcana.gte(cost);
}

/**
 * Calculate progress within a specific tier (0.0 to 1.0)
 */
export function getTierProgress(level: number, tier: TierLevel): number {
  const [minLevel, maxLevel] = getTierBounds(tier);
  
  if (level < minLevel) return 0;
  if (level >= maxLevel) return 1;
  
  const tierRange = maxLevel - minLevel;
  const progress = level - minLevel;
  
  return progress / tierRange;
}

/**
 * Get visible tick positions for progress bar (every 10 levels)
 */
export function getTierTickPositions(tier: TierLevel): number[] {
  const [minLevel, maxLevel] = getTierBounds(tier);
  const ticks: number[] = [];
  const tierRange = maxLevel - minLevel;
  
  // Add tick every 10 levels within the tier
  for (let level = minLevel + 10; level < maxLevel; level += 10) {
    const position = (level - minLevel) / tierRange;
    ticks.push(position * 100); // Convert to percentage
  }
  
  return ticks;
}

/**
 * Purchase logic per spec §4.4
 */
export function tryPurchaseEnchant(
  enchant: EnchantState,
  arcana: Decimal,
  enchantType: EnchantType
): { success: boolean; newArcana: Decimal; cost?: Decimal } {
  if (enchant.level >= 500) {
    return { success: false, newArcana: arcana }; // Max level
  }
  
  const cost = calculateEnchantCost(enchantType, enchant.level);
  
  if (!arcana.gte(cost)) {
    return { success: false, newArcana: arcana }; // Can't afford
  }
  
  return {
    success: true,
    newArcana: arcana.minus(cost),
    cost,
  };
}

/**
 * Tier up logic per spec
 */
export function tryTierUp(
  enchant: EnchantState,
  arcana: Decimal,
  enchantType: EnchantType
): { success: boolean; newArcana: Decimal; cost?: Decimal } {
  if (!canTierUp(enchant, arcana, enchantType)) {
    return { success: false, newArcana: arcana };
  }
  
  const cost = calculateTierUpCost(enchantType, enchant.tierUnlocked);
  
  return {
    success: true,
    newArcana: arcana.minus(cost),
    cost,
  };
}

/**
 * Create default enchants state
 */
export function createDefaultEnchantsState(): EnchantsState {
  return {
    firepower: {
      level: 0,
      tierUnlocked: 1,
    },
    scales: {
      level: 0,
      tierUnlocked: 1,
    },
  };
}