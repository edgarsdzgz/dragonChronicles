/**
 * @file Item Inventory
 * @description Simple item storage and selling logic
 *
 * Phase 1: Items are collectibles with lore that convert to gold
 * - Store items (Map<itemId, quantity>)
 * - Track discovery history (Set<itemId>)
 * - Sell by category (vendor-specific)
 * - Sell all (convenience)
 */

import { ItemCategory } from '@draconia/db';
import type { ItemRarity } from '@draconia/db';
import type { InventorySummary, SellResult } from './types.js';
import { RARITY_VALUE_MULTIPLIERS } from './types.js';
import { getItemById } from './item-data.js';

/**
 * ItemInventory - Simple item storage and bulk operations
 *
 * No managers, no EventBus, just clean storage logic.
 */
export class ItemInventory {
  private items: Map<string, number> = new Map(); // itemId → quantity
  private collectionHistory: Set<string> = new Set(); // All items ever found

  /**
   * Add items to inventory
   */
  addItem(itemId: string, quantity: number = 1): boolean {
    const itemDef = getItemById(itemId);
    if (!itemDef) {
      console.warn(`⚠️  Unknown item: ${itemId}`);
      return false;
    }

    // Add to current inventory
    const current = this.items.get(itemId) || 0;
    this.items.set(itemId, current + quantity);

    // Mark as discovered (for lore collection)
    this.collectionHistory.add(itemId);

    console.log(`📦 Added ${quantity}x ${itemDef.name}`);
    return true;
  }

  /**
   * Sell items by category (vendor-specific)
   */
  sellByCategory(category: ItemCategory): SellResult {
    let totalGold = 0;
    let itemsSold = 0;

    // Calculate value for matching items
    for (const [itemId, quantity] of this.items) {
      const itemDef = getItemById(itemId);

      if (itemDef && itemDef.category === category) {
        const value = this.calculateValue(itemDef.baseValue, itemDef.rarity, quantity);
        totalGold += value;
        itemsSold += quantity;
      }
    }

    // Remove sold items
    for (const [itemId] of this.items) {
      const itemDef = getItemById(itemId);
      if (itemDef && itemDef.category === category) {
        this.items.delete(itemId);
      }
    }

    if (itemsSold > 0) {
      console.log(`💰 Sold ${itemsSold} items for ${totalGold} gold (category: ${category})`);
    }

    return { totalGold, itemsSold };
  }

  /**
   * Sell ALL items (convenience - visits all vendors)
   */
  sellAll(): SellResult {
    let totalGold = 0;
    let itemsSold = 0;

    // Calculate total value
    for (const [itemId, quantity] of this.items) {
      const itemDef = getItemById(itemId);
      if (itemDef) {
        const value = this.calculateValue(itemDef.baseValue, itemDef.rarity, quantity);
        totalGold += value;
        itemsSold += quantity;
      }
    }

    // Clear inventory
    this.items.clear();

    if (itemsSold > 0) {
      console.log(`💰 Sold ALL ${itemsSold} items for ${totalGold} gold`);
    }

    return { totalGold, itemsSold };
  }

  /**
   * Calculate item value with rarity multiplier
   * Common=1x, Uncommon=2x, Rare=4x, Epic=8x, Legendary=16x
   */
  private calculateValue(baseValue: number, rarity: ItemRarity, quantity: number): number {
    const multiplier = RARITY_VALUE_MULTIPLIERS[rarity] || 1;
    return baseValue * multiplier * quantity;
  }

  /**
   * Get current inventory summary for UI
   */
  getInventorySummary(): InventorySummary {
    let totalItems = 0;
    let totalValue = 0;

    for (const [itemId, quantity] of this.items) {
      const itemDef = getItemById(itemId);
      if (itemDef) {
        totalItems += quantity;
        totalValue += this.calculateValue(itemDef.baseValue, itemDef.rarity, quantity);
      }
    }

    return {
      totalItems,
      totalValue,
      discoveredCount: this.collectionHistory.size,
    };
  }

  /**
   * Check if item has been discovered (for lore viewer)
   */
  hasDiscovered(itemId: string): boolean {
    return this.collectionHistory.has(itemId);
  }

  /**
   * Get all discovered items (for lore collection UI)
   */
  getDiscoveredItems(): string[] {
    return Array.from(this.collectionHistory);
  }

  /**
   * Get current item quantity
   */
  getItemQuantity(itemId: string): number {
    return this.items.get(itemId) || 0;
  }

  /**
   * Get all current items
   */
  getAllItems(): Map<string, number> {
    return new Map(this.items);
  }

  /**
   * Serialize for database save
   */
  toJSON(): { items: Record<string, number>; history: string[] } {
    return {
      items: Object.fromEntries(this.items),
      history: Array.from(this.collectionHistory),
    };
  }

  /**
   * Deserialize from database load
   */
  fromJSON(data: { items: Record<string, number>; history: string[] }): void {
    this.items = new Map(Object.entries(data.items));
    this.collectionHistory = new Set(data.history);

    const summary = this.getInventorySummary();
    console.log(
      `📦 Loaded inventory: ${summary.totalItems} items, ${summary.discoveredCount} discovered`,
    );
  }

  /**
   * Clear all items (for testing)
   */
  clear(): void {
    this.items.clear();
    console.log('📦 Inventory cleared');
  }
}
