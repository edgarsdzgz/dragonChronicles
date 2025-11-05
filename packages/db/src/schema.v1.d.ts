/**
 * Schema v1 types and Zod validators
 *
 * Defines the data structures for save data, profiles, and export formats
 * with comprehensive Zod validation for runtime type safety.
 */
import { z } from 'zod';
/**
 * W3-compatible time accounting fields
 *
 * Critical for preventing double-counting of background simulation time
 * when offline simulation is applied.
 */
export interface W3TimeAccounting {
    /** Last known wall-clock time when simulation advanced */
    lastSimWallClock: number;
    /** Background-covered interval to subtract during offline simulation */
    bgCoveredMs: number;
}
/**
 * Item categories for classification
 */
export declare enum ItemCategory {
    MATERIAL = "material",
    TREASURE = "treasure",
    CONSUMABLE = "consumable",
    ENCHANT_SCROLL = "scroll",
    RUNE = "rune"
}
/**
 * Item rarity levels with value multipliers
 */
export declare enum ItemRarity {
    COMMON = 1,// Grey - 1x value multiplier
    UNCOMMON = 2,// Green - 2x value multiplier  
    RARE = 3,// Blue - 4x value multiplier
    EPIC = 4,// Purple - 8x value multiplier
    LEGENDARY = 5
}
/**
 * Auto-sell settings for convenience
 */
export interface AutoSellSettings {
    enabled: boolean;
    sellCommon: boolean;
    sellUncommon: boolean;
    categories: ItemCategory[];
    minValue: number;
    maxInventorySlots: number;
}
/**
 * Inventory data structure
 */
export interface InventoryData {
    items: Record<string, number>;
    maxSlots: number;
    autoSellSettings: AutoSellSettings;
    lastDropTime: number;
}
/**
 * Item statistics for tracking
 */
export interface ItemStats {
    totalItemsFound: number;
    totalItemsSold: number;
    totalGoldEarned: number;
    itemsByCategory: Record<ItemCategory, number>;
    itemsByRarity: Record<ItemRarity, number>;
}
/**
 * Profile data structure with W3 time accounting
 */
export interface ProfileV1 {
    id: string;
    name: string;
    createdAt: number;
    lastActive: number;
    progress: {
        land: number;
        ward: number;
        distanceM: number;
    };
    currencies: {
        arcana: number;
        gold: number;
    };
    enchants: {
        firepower: number;
        scales: number;
        tier: number;
    };
    stats: {
        playtimeS: number;
        deaths: number;
        totalDistanceM: number;
    };
    leaderboard: {
        highestWard: number;
        fastestBossS: number;
    };
    sim: W3TimeAccounting;
    inventory: InventoryData;
    itemStats: ItemStats;
}
/**
 * Complete save data structure
 */
export interface SaveV1 {
    version: 1;
    profiles: ProfileV1[];
    settings: {
        a11yReducedMotion: boolean;
    };
}
/**
 * Save data row in database
 */
export interface SaveRowV1 {
    id?: number | undefined;
    profileId: string;
    version: 1;
    data: SaveV1;
    createdAt: number;
    checksum: string;
}
/**
 * Metadata row for key-value storage
 */
export interface MetaRow {
    key: string;
    value: string;
    updatedAt: number;
}
/**
 * Log entry row for structured logging
 */
export interface LogRow {
    id?: number | undefined;
    timestamp: number;
    level: 'debug' | 'info' | 'warn' | 'error';
    source: 'ui' | 'worker' | 'render' | 'net';
    message: string;
    data?: Record<string, unknown> | undefined;
    profileId?: string | undefined;
}
/**
 * Versioned export file format
 */
export interface ExportFileV1 {
    fileVersion: 1;
    exportedAt: number;
    checksum: string;
    data: SaveV1;
}
/**
 * W3 time accounting schema
 */
export declare const W3TimeAccountingSchema: z.ZodObject<{
    lastSimWallClock: z.ZodNumber;
    bgCoveredMs: z.ZodNumber;
}, z.core.$strip>;
/**
 * Profile progress schema
 */
export declare const ProfileProgressSchema: z.ZodObject<{
    land: z.ZodNumber;
    ward: z.ZodNumber;
    distanceM: z.ZodNumber;
}, z.core.$strip>;
/**
 * Profile currencies schema
 */
export declare const ProfileCurrenciesSchema: z.ZodObject<{
    arcana: z.ZodNumber;
    gold: z.ZodNumber;
}, z.core.$strip>;
/**
 * Profile enchants schema
 */
export declare const ProfileEnchantsSchema: z.ZodObject<{
    firepower: z.ZodNumber;
    scales: z.ZodNumber;
    tier: z.ZodNumber;
}, z.core.$strip>;
/**
 * Profile stats schema
 */
export declare const ProfileStatsSchema: z.ZodObject<{
    playtimeS: z.ZodNumber;
    deaths: z.ZodNumber;
    totalDistanceM: z.ZodNumber;
}, z.core.$strip>;
/**
 * Profile leaderboard schema
 */
export declare const ProfileLeaderboardSchema: z.ZodObject<{
    highestWard: z.ZodNumber;
    fastestBossS: z.ZodNumber;
}, z.core.$strip>;
/**
 * Auto-sell settings schema
 */
export declare const AutoSellSettingsSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    sellCommon: z.ZodBoolean;
    sellUncommon: z.ZodBoolean;
    categories: z.ZodArray<z.ZodEnum<typeof ItemCategory>>;
    minValue: z.ZodNumber;
    maxInventorySlots: z.ZodNumber;
}, z.core.$strip>;
/**
 * Inventory data schema
 */
export declare const InventoryDataSchema: z.ZodObject<{
    items: z.ZodRecord<z.ZodString, z.ZodNumber>;
    maxSlots: z.ZodNumber;
    autoSellSettings: z.ZodObject<{
        enabled: z.ZodBoolean;
        sellCommon: z.ZodBoolean;
        sellUncommon: z.ZodBoolean;
        categories: z.ZodArray<z.ZodEnum<typeof ItemCategory>>;
        minValue: z.ZodNumber;
        maxInventorySlots: z.ZodNumber;
    }, z.core.$strip>;
    lastDropTime: z.ZodNumber;
}, z.core.$strip>;
/**
 * Item statistics schema
 */
export declare const ItemStatsSchema: z.ZodObject<{
    totalItemsFound: z.ZodNumber;
    totalItemsSold: z.ZodNumber;
    totalGoldEarned: z.ZodNumber;
    itemsByCategory: z.ZodRecord<z.ZodEnum<typeof ItemCategory>, z.ZodNumber>;
    itemsByRarity: z.ZodRecord<z.ZodEnum<typeof ItemRarity>, z.ZodNumber>;
}, z.core.$strip>;
/**
 * Complete profile schema with W3 time accounting
 */
export declare const ProfileV1Schema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    createdAt: z.ZodNumber;
    lastActive: z.ZodNumber;
    progress: z.ZodObject<{
        land: z.ZodNumber;
        ward: z.ZodNumber;
        distanceM: z.ZodNumber;
    }, z.core.$strip>;
    currencies: z.ZodObject<{
        arcana: z.ZodNumber;
        gold: z.ZodNumber;
    }, z.core.$strip>;
    enchants: z.ZodObject<{
        firepower: z.ZodNumber;
        scales: z.ZodNumber;
        tier: z.ZodNumber;
    }, z.core.$strip>;
    stats: z.ZodObject<{
        playtimeS: z.ZodNumber;
        deaths: z.ZodNumber;
        totalDistanceM: z.ZodNumber;
    }, z.core.$strip>;
    leaderboard: z.ZodObject<{
        highestWard: z.ZodNumber;
        fastestBossS: z.ZodNumber;
    }, z.core.$strip>;
    sim: z.ZodObject<{
        lastSimWallClock: z.ZodNumber;
        bgCoveredMs: z.ZodNumber;
    }, z.core.$strip>;
    inventory: z.ZodObject<{
        items: z.ZodRecord<z.ZodString, z.ZodNumber>;
        maxSlots: z.ZodNumber;
        autoSellSettings: z.ZodObject<{
            enabled: z.ZodBoolean;
            sellCommon: z.ZodBoolean;
            sellUncommon: z.ZodBoolean;
            categories: z.ZodArray<z.ZodEnum<typeof ItemCategory>>;
            minValue: z.ZodNumber;
            maxInventorySlots: z.ZodNumber;
        }, z.core.$strip>;
        lastDropTime: z.ZodNumber;
    }, z.core.$strip>;
    itemStats: z.ZodObject<{
        totalItemsFound: z.ZodNumber;
        totalItemsSold: z.ZodNumber;
        totalGoldEarned: z.ZodNumber;
        itemsByCategory: z.ZodRecord<z.ZodEnum<typeof ItemCategory>, z.ZodNumber>;
        itemsByRarity: z.ZodRecord<z.ZodEnum<typeof ItemRarity>, z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Settings schema
 */
export declare const SettingsSchema: z.ZodObject<{
    a11yReducedMotion: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Complete save data schema (requires at least 1 profile)
 */
export declare const SaveV1Schema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    profiles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        createdAt: z.ZodNumber;
        lastActive: z.ZodNumber;
        progress: z.ZodObject<{
            land: z.ZodNumber;
            ward: z.ZodNumber;
            distanceM: z.ZodNumber;
        }, z.core.$strip>;
        currencies: z.ZodObject<{
            arcana: z.ZodNumber;
            gold: z.ZodNumber;
        }, z.core.$strip>;
        enchants: z.ZodObject<{
            firepower: z.ZodNumber;
            scales: z.ZodNumber;
            tier: z.ZodNumber;
        }, z.core.$strip>;
        stats: z.ZodObject<{
            playtimeS: z.ZodNumber;
            deaths: z.ZodNumber;
            totalDistanceM: z.ZodNumber;
        }, z.core.$strip>;
        leaderboard: z.ZodObject<{
            highestWard: z.ZodNumber;
            fastestBossS: z.ZodNumber;
        }, z.core.$strip>;
        sim: z.ZodObject<{
            lastSimWallClock: z.ZodNumber;
            bgCoveredMs: z.ZodNumber;
        }, z.core.$strip>;
        inventory: z.ZodObject<{
            items: z.ZodRecord<z.ZodString, z.ZodNumber>;
            maxSlots: z.ZodNumber;
            autoSellSettings: z.ZodObject<{
                enabled: z.ZodBoolean;
                sellCommon: z.ZodBoolean;
                sellUncommon: z.ZodBoolean;
                categories: z.ZodArray<z.ZodEnum<typeof ItemCategory>>;
                minValue: z.ZodNumber;
                maxInventorySlots: z.ZodNumber;
            }, z.core.$strip>;
            lastDropTime: z.ZodNumber;
        }, z.core.$strip>;
        itemStats: z.ZodObject<{
            totalItemsFound: z.ZodNumber;
            totalItemsSold: z.ZodNumber;
            totalGoldEarned: z.ZodNumber;
            itemsByCategory: z.ZodRecord<z.ZodEnum<typeof ItemCategory>, z.ZodNumber>;
            itemsByRarity: z.ZodRecord<z.ZodEnum<typeof ItemRarity>, z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    settings: z.ZodObject<{
        a11yReducedMotion: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Export data schema (allows empty profiles for empty database exports)
 */
export declare const ExportDataV1Schema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    profiles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        createdAt: z.ZodNumber;
        lastActive: z.ZodNumber;
        progress: z.ZodObject<{
            land: z.ZodNumber;
            ward: z.ZodNumber;
            distanceM: z.ZodNumber;
        }, z.core.$strip>;
        currencies: z.ZodObject<{
            arcana: z.ZodNumber;
            gold: z.ZodNumber;
        }, z.core.$strip>;
        enchants: z.ZodObject<{
            firepower: z.ZodNumber;
            scales: z.ZodNumber;
            tier: z.ZodNumber;
        }, z.core.$strip>;
        stats: z.ZodObject<{
            playtimeS: z.ZodNumber;
            deaths: z.ZodNumber;
            totalDistanceM: z.ZodNumber;
        }, z.core.$strip>;
        leaderboard: z.ZodObject<{
            highestWard: z.ZodNumber;
            fastestBossS: z.ZodNumber;
        }, z.core.$strip>;
        sim: z.ZodObject<{
            lastSimWallClock: z.ZodNumber;
            bgCoveredMs: z.ZodNumber;
        }, z.core.$strip>;
        inventory: z.ZodObject<{
            items: z.ZodRecord<z.ZodString, z.ZodNumber>;
            maxSlots: z.ZodNumber;
            autoSellSettings: z.ZodObject<{
                enabled: z.ZodBoolean;
                sellCommon: z.ZodBoolean;
                sellUncommon: z.ZodBoolean;
                categories: z.ZodArray<z.ZodEnum<typeof ItemCategory>>;
                minValue: z.ZodNumber;
                maxInventorySlots: z.ZodNumber;
            }, z.core.$strip>;
            lastDropTime: z.ZodNumber;
        }, z.core.$strip>;
        itemStats: z.ZodObject<{
            totalItemsFound: z.ZodNumber;
            totalItemsSold: z.ZodNumber;
            totalGoldEarned: z.ZodNumber;
            itemsByCategory: z.ZodRecord<z.ZodEnum<typeof ItemCategory>, z.ZodNumber>;
            itemsByRarity: z.ZodRecord<z.ZodEnum<typeof ItemRarity>, z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    settings: z.ZodObject<{
        a11yReducedMotion: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Export data type (allows empty profiles for empty database exports)
 */
export type ExportDataV1 = z.infer<typeof ExportDataV1Schema>;
/**
 * Save row schema
 */
export declare const SaveRowV1Schema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    profileId: z.ZodString;
    version: z.ZodLiteral<1>;
    data: z.ZodObject<{
        version: z.ZodLiteral<1>;
        profiles: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            createdAt: z.ZodNumber;
            lastActive: z.ZodNumber;
            progress: z.ZodObject<{
                land: z.ZodNumber;
                ward: z.ZodNumber;
                distanceM: z.ZodNumber;
            }, z.core.$strip>;
            currencies: z.ZodObject<{
                arcana: z.ZodNumber;
                gold: z.ZodNumber;
            }, z.core.$strip>;
            enchants: z.ZodObject<{
                firepower: z.ZodNumber;
                scales: z.ZodNumber;
                tier: z.ZodNumber;
            }, z.core.$strip>;
            stats: z.ZodObject<{
                playtimeS: z.ZodNumber;
                deaths: z.ZodNumber;
                totalDistanceM: z.ZodNumber;
            }, z.core.$strip>;
            leaderboard: z.ZodObject<{
                highestWard: z.ZodNumber;
                fastestBossS: z.ZodNumber;
            }, z.core.$strip>;
            sim: z.ZodObject<{
                lastSimWallClock: z.ZodNumber;
                bgCoveredMs: z.ZodNumber;
            }, z.core.$strip>;
            inventory: z.ZodObject<{
                items: z.ZodRecord<z.ZodString, z.ZodNumber>;
                maxSlots: z.ZodNumber;
                autoSellSettings: z.ZodObject<{
                    enabled: z.ZodBoolean;
                    sellCommon: z.ZodBoolean;
                    sellUncommon: z.ZodBoolean;
                    categories: z.ZodArray<z.ZodEnum<typeof ItemCategory>>;
                    minValue: z.ZodNumber;
                    maxInventorySlots: z.ZodNumber;
                }, z.core.$strip>;
                lastDropTime: z.ZodNumber;
            }, z.core.$strip>;
            itemStats: z.ZodObject<{
                totalItemsFound: z.ZodNumber;
                totalItemsSold: z.ZodNumber;
                totalGoldEarned: z.ZodNumber;
                itemsByCategory: z.ZodRecord<z.ZodEnum<typeof ItemCategory>, z.ZodNumber>;
                itemsByRarity: z.ZodRecord<z.ZodEnum<typeof ItemRarity>, z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        settings: z.ZodObject<{
            a11yReducedMotion: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
    createdAt: z.ZodNumber;
    checksum: z.ZodString;
}, z.core.$strip>;
/**
 * Meta row schema
 */
export declare const MetaRowSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
    updatedAt: z.ZodNumber;
}, z.core.$strip>;
/**
 * Log row schema
 */
export declare const LogRowSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodNumber;
    level: z.ZodEnum<{
        error: "error";
        debug: "debug";
        info: "info";
        warn: "warn";
    }>;
    source: z.ZodEnum<{
        ui: "ui";
        worker: "worker";
        render: "render";
        net: "net";
    }>;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    profileId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Export file schema
 */
export declare const ExportFileV1Schema: z.ZodObject<{
    fileVersion: z.ZodLiteral<1>;
    exportedAt: z.ZodNumber;
    checksum: z.ZodString;
    data: z.ZodObject<{
        version: z.ZodLiteral<1>;
        profiles: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            createdAt: z.ZodNumber;
            lastActive: z.ZodNumber;
            progress: z.ZodObject<{
                land: z.ZodNumber;
                ward: z.ZodNumber;
                distanceM: z.ZodNumber;
            }, z.core.$strip>;
            currencies: z.ZodObject<{
                arcana: z.ZodNumber;
                gold: z.ZodNumber;
            }, z.core.$strip>;
            enchants: z.ZodObject<{
                firepower: z.ZodNumber;
                scales: z.ZodNumber;
                tier: z.ZodNumber;
            }, z.core.$strip>;
            stats: z.ZodObject<{
                playtimeS: z.ZodNumber;
                deaths: z.ZodNumber;
                totalDistanceM: z.ZodNumber;
            }, z.core.$strip>;
            leaderboard: z.ZodObject<{
                highestWard: z.ZodNumber;
                fastestBossS: z.ZodNumber;
            }, z.core.$strip>;
            sim: z.ZodObject<{
                lastSimWallClock: z.ZodNumber;
                bgCoveredMs: z.ZodNumber;
            }, z.core.$strip>;
            inventory: z.ZodObject<{
                items: z.ZodRecord<z.ZodString, z.ZodNumber>;
                maxSlots: z.ZodNumber;
                autoSellSettings: z.ZodObject<{
                    enabled: z.ZodBoolean;
                    sellCommon: z.ZodBoolean;
                    sellUncommon: z.ZodBoolean;
                    categories: z.ZodArray<z.ZodEnum<typeof ItemCategory>>;
                    minValue: z.ZodNumber;
                    maxInventorySlots: z.ZodNumber;
                }, z.core.$strip>;
                lastDropTime: z.ZodNumber;
            }, z.core.$strip>;
            itemStats: z.ZodObject<{
                totalItemsFound: z.ZodNumber;
                totalItemsSold: z.ZodNumber;
                totalGoldEarned: z.ZodNumber;
                itemsByCategory: z.ZodRecord<z.ZodEnum<typeof ItemCategory>, z.ZodNumber>;
                itemsByRarity: z.ZodRecord<z.ZodEnum<typeof ItemRarity>, z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        settings: z.ZodObject<{
            a11yReducedMotion: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Validates a complete save data object
 */
export declare function validateSaveV1(data: unknown): SaveV1;
/**
 * Validates export data (allows empty profiles)
 */
export declare function validateExportDataV1(data: unknown): ExportDataV1;
/**
 * Validates a profile object
 */
export declare function validateProfileV1(data: unknown): ProfileV1;
/**
 * Validates an export file
 */
export declare function validateExportFileV1(data: unknown): ExportFileV1;
/**
 * Validates a save row
 */
export declare function validateSaveRowV1(data: unknown): SaveRowV1;
/**
 * Validates a meta row
 */
export declare function validateMetaRow(data: unknown): MetaRow;
/**
 * Validates a log row
 */
export declare function validateLogRow(data: unknown): LogRow;
//# sourceMappingURL=schema.v1.d.ts.map