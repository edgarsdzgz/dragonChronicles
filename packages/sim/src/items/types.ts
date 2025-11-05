/**
 * @file Simplified Item System Types
 * @description Core item data structures for Draconia Chronicles
 * Phase 1: Items are collectibles with lore that convert to gold
 */

import type { ItemCategory, ItemRarity } from '@draconia/db';

// ============================================================================
// Core Item Types
// ============================================================================

/**
 * Item definition (static data)
 */
export interface ItemDefinition {
  id: string;                    // Unique identifier (e.g., "veldtrider_horse_bridle")
  name: string;                  // Display name ("Veldtrider Horse-bridle")
  description: string;           // Lore text
  category: ItemCategory;        // Which vendor buys it
  rarity: ItemRarity;           // 1=Common, 2=Uncommon, 3=Rare, 4=Epic, 5=Legendary
  baseValue: number;            // Base sell value in gold
  landId: number;               // Which land (1 = Horizon Steppe)
  culturalCategory?: string;    // Optional: "races_peoples", "geography", etc.
  culturalIndex?: number;       // Optional: Index within category (1-17)
}

/**
 * Item drop from enemy
 */
export interface ItemDrop {
  itemId: string;
  quantity: number;
}

/**
 * Inventory summary for UI
 */
export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  discoveredCount: number;
}

/**
 * Sell result
 */
export interface SellResult {
  totalGold: number;
  itemsSold: number;
}

// ============================================================================
// Rarity Multipliers (from tome)
// ============================================================================

export const RARITY_VALUE_MULTIPLIERS: Record<ItemRarity, number> = {
  [1]: 1,   // Common: 1x
  [2]: 2,   // Uncommon: 2x
  [3]: 4,   // Rare: 4x
  [4]: 8,   // Epic: 8x
  [5]: 16,  // Legendary: 16x
};
