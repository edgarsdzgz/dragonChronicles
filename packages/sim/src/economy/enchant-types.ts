/**
 * Enchant System Type Definitions
 *
 * This file defines the core types and interfaces for the enchant system,
 * including Firepower and Scales enchants, Soul Forging integration,
 * and location-based spending restrictions.
 */

export type EnchantType = 'firepower' | 'scales';

export type EnchantCategory = 'temporary' | 'permanent';

export type LocationType = 'draconia' | 'journey';

export interface EnchantLevel {
  current: number;
  cap: number;
  baseCap: number;
}

export interface EnchantCost {
  baseCost: number;
  growthRate: number;
  currentCost: number;
  nextCost: number;
}

export interface EnchantSystem {
  temporary: {
    firepower: number;
    scales: number;
  };
  permanent: {
    firepower: number;
    scales: number;
  };
  soulForging: {
    temporary: number; // Arcana-based soul forging (current journey only)
    permanent: number; // Soul Power-based soul forging (permanent)
  };
  effective: {
    firepower: number;
    scales: number;
    cap: number; // Effective cap = baseCap + (soulForging.temporary + soulForging.permanent) * 60
  };
}

export interface EnchantConfig {
  baseCosts: {
    firepower: number;
    scales: number;
  };
  growthRate: number; // 1.12 for geometric progression
  baseCap: number; // Base level cap before Soul Forging
  soulForgingMultiplier: number; // 60 levels per Soul Forging
  temporarySoulForgingCost: number; // 15-25× last level cost
  permanentSoulForgingCost: number; // High Soul Power cost
}

export interface EnchantPurchase {
  type: EnchantType;
  category: EnchantCategory;
  amount: number;
  cost: number;
  currency: 'arcana' | 'soul_power';
  location: LocationType;
  timestamp: number;
}

export interface EnchantTransaction {
  id: string;
  type: 'purchase' | 'soul_forging';
  enchantType?: EnchantType;
  category?: EnchantCategory;
  amount: number;
  cost: number;
  currency: 'arcana' | 'soul_power';
  location: LocationType;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface SoulForgingTransaction {
  id: string;
  type: 'temporary' | 'permanent';
  amount: number; // Number of Soul Forging levels
  cost: number;
  currency: 'arcana' | 'soul_power';
  location: LocationType;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface EnchantManager {
  readonly system: EnchantSystem;
  readonly config: EnchantConfig;
  readonly location: LocationType;

  // Core enchant management
  getEnchantLevel(_type: EnchantType, _category: EnchantCategory): number;
  getEnchantCap(_type: EnchantType): number;
  getEnchantCost(_type: EnchantType, _level: number): number;

  // Purchase operations
  purchaseEnchant(
    _type: EnchantType,
    _category: EnchantCategory,
    _amount: number,
    _currency: 'arcana' | 'soul_power',
  ): EnchantTransaction;

  // Soul Forging operations
  purchaseSoulForging(_type: 'temporary' | 'permanent', _amount: number): EnchantTransaction;

  // Location management
  setLocation(_location: LocationType): void;
  canSpendCurrency(_currency: 'arcana' | 'soul_power'): boolean;

  // State management
  resetTemporaryEnchants(): void;
  getTransactionHistory(): EnchantTransaction[];
  getSoulForgingHistory(): EnchantTransaction[];
}

export interface EnchantCostCalculator {
  calculateCost(_type: EnchantType, _level: number): number;
  calculateSoulForgingCost(
    _type: 'temporary' | 'permanent',
    _currentLevel: number,
    _baseCost: number,
  ): number;
  getTotalCost(_type: EnchantType, _fromLevel: number, _toLevel: number): number;
}

export interface LocationValidator {
  canPurchaseEnchant(
    _type: EnchantType,
    _category: EnchantCategory,
    _currency: 'arcana' | 'soul_power',
  ): boolean;
  canPurchaseSoulForging(
    _type: 'temporary' | 'permanent',
    _currency: 'arcana' | 'soul_power',
  ): boolean;
  validateLocation(_location: LocationType): boolean;
}

export interface EnchantAnalytics {
  totalPurchases: number;
  totalSpent: {
    arcana: number;
    soul_power: number;
  };
  averageLevel: {
    firepower: number;
    scales: number;
  };
  soulForgingStats: {
    temporary: number;
    permanent: number;
    totalCapExtension: number;
  };
  locationStats: {
    draconia: number;
    journey: number;
  };
}

export const DEFAULT_ENCHANT_CONFIG: EnchantConfig = {
  baseCosts: {
    firepower: 10,
    scales: 10,
  },
  growthRate: 1.12,
  baseCap: 100,
  soulForgingMultiplier: 60,
  temporarySoulForgingCost: 20, // 20× last level cost
  permanentSoulForgingCost: 5000, // High Soul Power cost
};

export const ENCHANT_DISPLAY_NAMES: Record<EnchantType, string> = {
  firepower: 'Firepower',
  scales: 'Scales',
};

export const ENCHANT_DESCRIPTIONS: Record<EnchantType, string> = {
  firepower: 'Increases damage dealt to enemies',
  scales: 'Increases health and damage resistance',
};

export const LOCATION_DISPLAY_NAMES: Record<LocationType, string> = {
  draconia: 'Draconia',
  journey: 'Journey',
};

export const CURRENCY_DISPLAY_NAMES: Record<'arcana' | 'soul_power', string> = {
  arcana: 'Arcana',
  soul_power: 'Soul Power',
};
