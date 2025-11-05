/**
 * @file Item Data Definitions
 * @description All items from Horizon Steppe (Land 1)
 *
 * Based on Tome: 07_Economy_Currencies_Items_Market.md
 * Total: 289 items (17 categories × 17 items each)
 *
 * TODO: Add remaining 269 items from tome
 */

import { ItemCategory, ItemRarity } from '@draconia/db';
import type { ItemDefinition } from './types.js';

/**
 * Horizon Steppe Items (Land 1)
 * Phase 1: First 20 items to demonstrate system
 */
export const HORIZON_STEPPE_ITEMS: ItemDefinition[] = [
  // ============================================================================
  // Category 1: Races & Peoples
  // ============================================================================
  {
    id: 'veldtrider_horse_bridle',
    name: 'Veldtrider Horse-bridle',
    description: 'Woven reins used by nomadic horse clans. The leather is weathered from countless journeys across the endless plains. Each knot tells a story of distance traveled.',
    category: ItemCategory.TREASURE,
    rarity: ItemRarity.COMMON,
    baseValue: 10,
    landId: 1,
    culturalCategory: 'races_peoples',
    culturalIndex: 1,
  },
  {
    id: 'wind_elf_sky_feather',
    name: 'Wind-elf Sky-feather',
    description: 'A feather from the wind-elves who ride the thermals above the steppes. Still warm to the touch, it seems to vibrate with stored wind energy.',
    category: ItemCategory.MATERIAL,
    rarity: ItemRarity.COMMON,
    baseValue: 12,
    landId: 1,
    culturalCategory: 'races_peoples',
    culturalIndex: 2,
  },
  {
    id: 'grass_kobold_scout_cloak',
    name: 'Grass Kobold Scout-cloak',
    description: 'A camouflage cloak woven from steppe grass by kobold scouts. Nearly invisible in tall grass, it smells faintly of earth and wildflowers.',
    category: ItemCategory.TREASURE,
    rarity: ItemRarity.UNCOMMON,
    baseValue: 15,
    landId: 1,
    culturalCategory: 'races_peoples',
    culturalIndex: 3,
  },
  {
    id: 'centaur_war_braid',
    name: 'Centaur War-braid',
    description: 'A ceremonial braid worn by centaur warriors. Decorated with beads carved from the bones of defeated foes, it represents three generations of battle honors.',
    category: ItemCategory.TREASURE,
    rarity: ItemRarity.RARE,
    baseValue: 25,
    landId: 1,
    culturalCategory: 'races_peoples',
    culturalIndex: 4,
  },

  // ============================================================================
  // Category 2: Geography & Landmarks
  // ============================================================================
  {
    id: 'steppe_wildflower_bundle',
    name: 'Steppe Wildflower Bundle',
    description: 'A bundle of resilient wildflowers that bloom across the steppes in spring. Their vibrant colors persist even when dried, making them valuable for dyes.',
    category: ItemCategory.MATERIAL,
    rarity: ItemRarity.COMMON,
    baseValue: 8,
    landId: 1,
    culturalCategory: 'geography',
    culturalIndex: 1,
  },
  {
    id: 'wind_carved_stone',
    name: 'Wind-carved Stone',
    description: 'A smooth stone sculpted by centuries of wind erosion. Its surface shows delicate patterns that whisper stories of ancient storms.',
    category: ItemCategory.TREASURE,
    rarity: ItemRarity.COMMON,
    baseValue: 10,
    landId: 1,
    culturalCategory: 'geography',
    culturalIndex: 2,
  },
  {
    id: 'steppe_elemental_core',
    name: 'Steppe Elemental Core',
    description: 'The crystallized essence of a wind elemental. It glows with stored magical energy and hums with the voices of a thousand winds.',
    category: ItemCategory.MATERIAL,
    rarity: ItemRarity.RARE,
    baseValue: 40,
    landId: 1,
    culturalCategory: 'geography',
    culturalIndex: 3,
  },

  // ============================================================================
  // Category 3: Flora & Fauna
  // ============================================================================
  {
    id: 'steppe_honey',
    name: 'Steppe Honey',
    description: 'Golden honey collected from wild bees that pollinate steppe flowers. Sweet with a hint of wildflowers, it never spoils.',
    category: ItemCategory.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    baseValue: 14,
    landId: 1,
    culturalCategory: 'flora_fauna',
    culturalIndex: 1,
  },
  {
    id: 'wind_spirit_essence_vial',
    name: 'Wind Spirit Essence-vial',
    description: 'A small vial containing the captured essence of a wind spirit. The liquid inside swirls constantly, never settling, always seeking freedom.',
    category: ItemCategory.MATERIAL,
    rarity: ItemRarity.UNCOMMON,
    baseValue: 20,
    landId: 1,
    culturalCategory: 'flora_fauna',
    culturalIndex: 2,
  },
  {
    id: 'sky_serpent_scale',
    name: 'Sky Serpent Scale',
    description: 'An iridescent scale from a sky serpent. It shimmers with all the colors of sunset and is prized by artisans for jewelry and armor decoration.',
    category: ItemCategory.MATERIAL,
    rarity: ItemRarity.RARE,
    baseValue: 35,
    landId: 1,
    culturalCategory: 'flora_fauna',
    culturalIndex: 3,
  },

  // ============================================================================
  // Category 4: Scrolls & Knowledge
  // ============================================================================
  {
    id: 'ancient_scroll_of_winds',
    name: 'Ancient Scroll of Winds',
    description: 'A weathered parchment containing wind-reading techniques passed down through generations of steppe shamans. The ink shimmers with residual magic.',
    category: ItemCategory.ENCHANT_SCROLL,
    rarity: ItemRarity.RARE,
    baseValue: 50,
    landId: 1,
    culturalCategory: 'knowledge',
    culturalIndex: 1,
  },
  {
    id: 'shamanic_weather_chart',
    name: 'Shamanic Weather Chart',
    description: 'A leather chart marked with symbols predicting weather patterns. Used by nomadic tribes to plan migrations and avoid deadly storms.',
    category: ItemCategory.ENCHANT_SCROLL,
    rarity: ItemRarity.UNCOMMON,
    baseValue: 18,
    landId: 1,
    culturalCategory: 'knowledge',
    culturalIndex: 2,
  },
  {
    id: 'wind_elf_song_scroll',
    name: 'Wind-elf Song Scroll',
    description: 'Musical notation for wind-elf sky songs. When hummed correctly, the melody seems to carry on the breeze for miles.',
    category: ItemCategory.ENCHANT_SCROLL,
    rarity: ItemRarity.UNCOMMON,
    baseValue: 22,
    landId: 1,
    culturalCategory: 'knowledge',
    culturalIndex: 3,
  },

  // ============================================================================
  // Category 5: Artifacts & Relics
  // ============================================================================
  {
    id: 'veldstrider_clan_heirloom',
    name: 'Veldstrider Clan Heirloom',
    description: 'An ancient medallion passed down through the Veldstrider horse clan. Its surface is inscribed with the names of legendary riders and their steeds.',
    category: ItemCategory.TREASURE,
    rarity: ItemRarity.EPIC,
    baseValue: 80,
    landId: 1,
    culturalCategory: 'artifacts',
    culturalIndex: 1,
  },
  {
    id: 'wind_lords_blessing',
    name: "Wind Lord's Blessing",
    description: 'A crystalline token blessed by one of the ancient Wind Lords. It grants the bearer safe passage through the worst storms and whispers warnings of danger.',
    category: ItemCategory.TREASURE,
    rarity: ItemRarity.LEGENDARY,
    baseValue: 150,
    landId: 1,
    culturalCategory: 'artifacts',
    culturalIndex: 2,
  },

  // ============================================================================
  // Category 6: Crafting Materials
  // ============================================================================
  {
    id: 'woven_grass_fiber',
    name: 'Woven Grass Fiber',
    description: 'Strong fibers woven from steppe grass. Used by nomads to craft everything from baskets to rope to lightweight armor.',
    category: ItemCategory.MATERIAL,
    rarity: ItemRarity.COMMON,
    baseValue: 6,
    landId: 1,
    culturalCategory: 'crafting',
    culturalIndex: 1,
  },
  {
    id: 'wind_blessed_thread',
    name: 'Wind-blessed Thread',
    description: 'Thread spun from wind-elf silk and blessed by shamans. Garments made from it are incredibly light and seem to billow even without wind.',
    category: ItemCategory.MATERIAL,
    rarity: ItemRarity.UNCOMMON,
    baseValue: 16,
    landId: 1,
    culturalCategory: 'crafting',
    culturalIndex: 2,
  },
  {
    id: 'storm_forged_metal',
    name: 'Storm-forged Metal',
    description: 'Metal infused with lightning during a steppe thunderstorm. It holds a permanent electric charge and is highly prized by weaponsmiths.',
    category: ItemCategory.MATERIAL,
    rarity: ItemRarity.EPIC,
    baseValue: 100,
    landId: 1,
    culturalCategory: 'crafting',
    culturalIndex: 3,
  },

  // ============================================================================
  // Category 7: Trade Goods
  // ============================================================================
  {
    id: 'nomad_spice_pouch',
    name: 'Nomad Spice Pouch',
    description: 'A leather pouch filled with rare steppe spices. The mixture includes dried wildflowers, aromatic roots, and mysterious herbs that never lose their potency.',
    category: ItemCategory.TREASURE,
    rarity: ItemRarity.COMMON,
    baseValue: 12,
    landId: 1,
    culturalCategory: 'trade_goods',
    culturalIndex: 1,
  },
  {
    id: 'sky_serpent_oil',
    name: 'Sky Serpent Oil',
    description: 'Rendered oil from sky serpent fat. Burns with a bright blue flame and is used by nomads for ceremonial lanterns and weather-resistant fire.',
    category: ItemCategory.CONSUMABLE,
    rarity: ItemRarity.UNCOMMON,
    baseValue: 18,
    landId: 1,
    culturalCategory: 'trade_goods',
    culturalIndex: 2,
  },
];

/**
 * Get item definition by ID
 */
export function getItemById(itemId: string): ItemDefinition | undefined {
  return HORIZON_STEPPE_ITEMS.find((item) => item.id === itemId);
}

/**
 * Get all items of a specific rarity
 */
export function getItemsByRarity(rarity: ItemRarity): ItemDefinition[] {
  return HORIZON_STEPPE_ITEMS.filter((item) => item.rarity === rarity);
}

/**
 * Get all items of a specific category
 */
export function getItemsByCategory(category: ItemCategory): ItemDefinition[] {
  return HORIZON_STEPPE_ITEMS.filter((item) => item.category === category);
}
