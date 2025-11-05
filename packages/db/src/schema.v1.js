/**
 * Schema v1 types and Zod validators
 *
 * Defines the data structures for save data, profiles, and export formats
 * with comprehensive Zod validation for runtime type safety.
 */
import { z } from 'zod';
/**
 * Item categories for classification
 */
export var ItemCategory;
(function (ItemCategory) {
    ItemCategory["MATERIAL"] = "material";
    ItemCategory["TREASURE"] = "treasure";
    ItemCategory["CONSUMABLE"] = "consumable";
    ItemCategory["ENCHANT_SCROLL"] = "scroll";
    ItemCategory["RUNE"] = "rune";
})(ItemCategory || (ItemCategory = {}));
/**
 * Item rarity levels with value multipliers
 */
export var ItemRarity;
(function (ItemRarity) {
    ItemRarity[ItemRarity["COMMON"] = 1] = "COMMON";
    ItemRarity[ItemRarity["UNCOMMON"] = 2] = "UNCOMMON";
    ItemRarity[ItemRarity["RARE"] = 3] = "RARE";
    ItemRarity[ItemRarity["EPIC"] = 4] = "EPIC";
    ItemRarity[ItemRarity["LEGENDARY"] = 5] = "LEGENDARY"; // Orange - 16x value multiplier
})(ItemRarity || (ItemRarity = {}));
// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================
/**
 * W3 time accounting schema
 */
export const W3TimeAccountingSchema = z.object({
    lastSimWallClock: z.number().int().min(0),
    bgCoveredMs: z.number().int().min(0),
});
/**
 * Profile progress schema
 */
export const ProfileProgressSchema = z.object({
    land: z.number().int().min(0),
    ward: z.number().int().min(0),
    distanceM: z.number().int().min(0),
});
/**
 * Profile currencies schema
 */
export const ProfileCurrenciesSchema = z.object({
    arcana: z.number().int().min(0),
    gold: z.number().int().min(0),
});
/**
 * Profile enchants schema
 */
export const ProfileEnchantsSchema = z.object({
    firepower: z.number().int().min(0),
    scales: z.number().int().min(0),
    tier: z.number().int().min(0),
});
/**
 * Profile stats schema
 */
export const ProfileStatsSchema = z.object({
    playtimeS: z.number().int().min(0),
    deaths: z.number().int().min(0),
    totalDistanceM: z.number().int().min(0),
});
/**
 * Profile leaderboard schema
 */
export const ProfileLeaderboardSchema = z.object({
    highestWard: z.number().int().min(0),
    fastestBossS: z.number().int().min(0),
});
/**
 * Auto-sell settings schema
 */
export const AutoSellSettingsSchema = z.object({
    enabled: z.boolean(),
    sellCommon: z.boolean(),
    sellUncommon: z.boolean(),
    categories: z.array(z.nativeEnum(ItemCategory)),
    minValue: z.number().int().min(0),
    maxInventorySlots: z.number().int().min(1),
});
/**
 * Inventory data schema
 */
export const InventoryDataSchema = z.object({
    items: z.record(z.string(), z.number().int().min(0)),
    maxSlots: z.number().int().min(1),
    autoSellSettings: AutoSellSettingsSchema,
    lastDropTime: z.number().int().min(0),
});
/**
 * Item statistics schema
 */
export const ItemStatsSchema = z.object({
    totalItemsFound: z.number().int().min(0),
    totalItemsSold: z.number().int().min(0),
    totalGoldEarned: z.number().int().min(0),
    itemsByCategory: z.record(z.nativeEnum(ItemCategory), z.number().int().min(0)),
    itemsByRarity: z.record(z.nativeEnum(ItemRarity), z.number().int().min(0)),
});
/**
 * Complete profile schema with W3 time accounting
 */
export const ProfileV1Schema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(50),
    createdAt: z.number().int().min(0),
    lastActive: z.number().int().min(0),
    progress: ProfileProgressSchema,
    currencies: ProfileCurrenciesSchema,
    enchants: ProfileEnchantsSchema,
    stats: ProfileStatsSchema,
    leaderboard: ProfileLeaderboardSchema,
    sim: W3TimeAccountingSchema,
    inventory: InventoryDataSchema,
    itemStats: ItemStatsSchema,
});
/**
 * Settings schema
 */
export const SettingsSchema = z.object({
    a11yReducedMotion: z.boolean(),
});
/**
 * Complete save data schema (requires at least 1 profile)
 */
export const SaveV1Schema = z.object({
    version: z.literal(1),
    profiles: z.array(ProfileV1Schema).min(1).max(6),
    settings: SettingsSchema,
});
/**
 * Export data schema (allows empty profiles for empty database exports)
 */
export const ExportDataV1Schema = z.object({
    version: z.literal(1),
    profiles: z.array(ProfileV1Schema).min(0).max(6),
    settings: SettingsSchema,
});
/**
 * Save row schema
 */
export const SaveRowV1Schema = z.object({
    id: z.number().int().positive().optional(),
    profileId: z.string().min(1),
    version: z.literal(1),
    data: SaveV1Schema,
    createdAt: z.number().int().min(0),
    checksum: z.string().min(1),
});
/**
 * Meta row schema
 */
export const MetaRowSchema = z.object({
    key: z.string().min(1),
    value: z.string(),
    updatedAt: z.number().int().min(0),
});
/**
 * Log row schema
 */
export const LogRowSchema = z.object({
    id: z.number().int().positive().optional(),
    timestamp: z.number().int().min(0),
    level: z.enum(['debug', 'info', 'warn', 'error']),
    source: z.enum(['ui', 'worker', 'render', 'net']),
    message: z.string().min(1),
    data: z.record(z.string(), z.unknown()).optional(),
    profileId: z.string().min(1).optional(),
});
/**
 * Export file schema
 */
export const ExportFileV1Schema = z.object({
    fileVersion: z.literal(1),
    exportedAt: z.number().int().min(0),
    checksum: z.string().min(1),
    data: SaveV1Schema,
});
// ============================================================================
// Validation Functions
// ============================================================================
/**
 * Validates a complete save data object
 */
export function validateSaveV1(data) {
    return SaveV1Schema.parse(data);
}
/**
 * Validates export data (allows empty profiles)
 */
export function validateExportDataV1(data) {
    return ExportDataV1Schema.parse(data);
}
/**
 * Validates a profile object
 */
export function validateProfileV1(data) {
    return ProfileV1Schema.parse(data);
}
/**
 * Validates an export file
 */
export function validateExportFileV1(data) {
    return ExportFileV1Schema.parse(data);
}
/**
 * Validates a save row
 */
export function validateSaveRowV1(data) {
    const parsed = SaveRowV1Schema.parse(data);
    return {
        ...parsed,
        id: parsed.id || undefined,
    };
}
/**
 * Validates a meta row
 */
export function validateMetaRow(data) {
    return MetaRowSchema.parse(data);
}
/**
 * Validates a log row
 */
export function validateLogRow(data) {
    const parsed = LogRowSchema.parse(data);
    return {
        ...parsed,
        id: parsed.id || undefined,
    };
}
