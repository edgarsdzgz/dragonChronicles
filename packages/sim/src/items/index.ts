/**
 * @file Item System - Simplified Exports
 * @description Phase 1: Items as collectibles with lore
 *
 * What you get:
 * - ItemInventory: Simple storage + sell logic
 * - SeededRNG: Anti-save-scum random generation
 * - Item data: 20 Horizon Steppe items (289 total in future)
 * - Types: Clean interfaces without EventBus bloat
 */

// Core classes
export { ItemInventory } from './item-inventory.js';
export { SeededRNG } from './seeded-rng.js';

// Item data
export {
  HORIZON_STEPPE_ITEMS,
  getItemById,
  getItemsByRarity,
  getItemsByCategory,
} from './item-data.js';

// Types
export type {
  ItemDefinition,
  ItemDrop,
  InventorySummary,
  SellResult,
} from './types.js';

export { RARITY_VALUE_MULTIPLIERS } from './types.js';

// Re-export database types for convenience
export { ItemCategory, ItemRarity } from '@draconia/db';
export type { InventoryData, ItemStats } from '@draconia/db';
