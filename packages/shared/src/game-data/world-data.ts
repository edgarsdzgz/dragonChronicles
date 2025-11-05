/**
 * @file World Data - Single Source of Truth for Lands and Wards
 * @description Provides all land and ward information for Draconia Chronicles
 *
 * IMPORTANT: This is the ONLY place where land and ward names should be defined.
 * All other systems must import from this module.
 */

/**
 * Ward data structure
 */
export interface WardData {
  /** Ward ID (e.g., 'ward1') */
  id: string;
  /** Ward number (1-based index) */
  number: number;
  /** Display name of the ward */
  name: string;
  /** Land ID this ward belongs to */
  landId: number;
  /** Distance from Draconia in meters */
  distanceFromStart: number;
}

/**
 * Land data structure
 */
export interface LandData {
  /** Numeric land ID (1, 2, 3, etc.) */
  id: number;
  /** String identifier for internal use (e.g., 'land1_steppe') */
  stringId: string;
  /** Display name of the land */
  name: string;
  /** All wards in this land */
  wards: WardData[];
}

/**
 * SINGLE SOURCE OF TRUTH: All world data for Draconia Chronicles
 *
 * When adding new lands or wards:
 * 1. Add land data to this array
 * 2. Add all ward data for that land
 * 3. No other files need to be updated!
 */
export const WORLD_DATA: LandData[] = [
  {
    id: 1,
    stringId: 'land1_steppe',
    name: 'Horizon Steppe',
    wards: [
      {
        id: 'ward1',
        number: 1,
        name: 'The Parting Stones',
        landId: 1,
        distanceFromStart: 0, // 0km → 5km (5km long)
      },
      {
        id: 'ward2',
        number: 2,
        name: 'Windwhisper Plains',
        landId: 1,
        distanceFromStart: 5000, // 5km → 12.5km (7.5km long)
      },
      {
        id: 'ward3',
        number: 3,
        name: 'Sunstone Outlook',
        landId: 1,
        distanceFromStart: 12500, // 12.5km → 25km (12.5km long)
      },
      {
        id: 'ward4',
        number: 4,
        name: 'Embergrass Crossing',
        landId: 1,
        distanceFromStart: 25000, // 25km → 50km (25km long)
      },
      {
        id: 'ward5',
        number: 5,
        name: 'Stormwatch Frontier',
        landId: 1,
        distanceFromStart: 50000, // 50km → 60km (10km long)
      },
      {
        id: 'ward6',
        number: 6,
        name: 'Sunwake Downs',
        landId: 1,
        distanceFromStart: 60000, // 60km → 65km (5km long)
      },
      {
        id: 'ward7',
        number: 7,
        name: 'Waystone Mile',
        landId: 1,
        distanceFromStart: 65000, // 65km → 70km (5km long)
      },
      {
        id: 'ward8',
        number: 8,
        name: 'Skylark Flats',
        landId: 1,
        distanceFromStart: 70000, // 70km → 75km (5km long)
      },
      {
        id: 'ward9',
        number: 9,
        name: 'Longgrass Reach',
        landId: 1,
        distanceFromStart: 75000, // 75km → 80km (5km long)
      },
      {
        id: 'ward10',
        number: 10,
        name: 'Bluewind Shelf',
        landId: 1,
        distanceFromStart: 80000, // 80km → 85km (5km long)
      },
      {
        id: 'ward11',
        number: 11,
        name: 'Old Hoard Road',
        landId: 1,
        distanceFromStart: 85000, // 85km → 90km (5km long)
      },
      {
        id: 'ward12',
        number: 12,
        name: 'First Horizon',
        landId: 1,
        distanceFromStart: 90000, // 90km → 93km (3km long)
      },
      {
        id: 'ward13',
        number: 13,
        name: 'Windwhisper Plain',
        landId: 1,
        distanceFromStart: 93000, // 93km → 96km (3km long)
      },
      {
        id: 'ward14',
        number: 14,
        name: "Duskrunner's Stand",
        landId: 1,
        distanceFromStart: 96000, // 96km → 99km (3km long)
      },
      {
        id: 'ward15',
        number: 15,
        name: 'Thornhedge Crossing',
        landId: 1,
        distanceFromStart: 99000, // 99km → 101km (2km long)
      },
      {
        id: 'ward16',
        number: 16,
        name: 'Kite-Banner Flats',
        landId: 1,
        distanceFromStart: 101000, // 101km → 103km (2km long)
      },
      {
        id: 'ward17',
        number: 17,
        name: 'Rumblefoot Trace',
        landId: 1,
        distanceFromStart: 103000, // 103km → 105km (2km long)
      },
      {
        id: 'ward18',
        number: 18,
        name: 'Emberwatch Ridge',
        landId: 1,
        distanceFromStart: 105000, // 105km → 106.5km (1.5km long)
      },
      {
        id: 'ward19',
        number: 19,
        name: 'Scorchline Gap',
        landId: 1,
        distanceFromStart: 106500, // 106.5km → 107.5km (1km long)
      },
      {
        id: 'ward20',
        number: 20,
        name: 'Ashfall March',
        landId: 1,
        distanceFromStart: 107500, // 107.5km → 108.5km (1km long)
      },
      {
        id: 'ward21',
        number: 21,
        name: "Border's End",
        landId: 1,
        distanceFromStart: 108500, // 108.5km → 109.5km (1km long)
      },
      {
        id: 'ward22',
        number: 22,
        name: 'Pyrean Gate',
        landId: 1,
        distanceFromStart: 109500, // 109.5km → 110km (0.5km long - Boss Gate)
      },
    ],
  },
  // Future lands will be added here
];

/**
 * Lookup Functions - Static utilities for accessing world data
 */

/**
 * Get land data by numeric ID
 * @param landId - Numeric land ID (1, 2, 3, etc.)
 * @returns Land data or null if not found
 */
export function getLandById(landId: number): LandData | null {
  return WORLD_DATA.find((land) => land.id === landId) || null;
}

/**
 * Get land data by string ID
 * @param stringId - String identifier (e.g., 'land1_steppe')
 * @returns Land data or null if not found
 */
export function getLandByStringId(stringId: string): LandData | null {
  return WORLD_DATA.find((land) => land.stringId === stringId) || null;
}

/**
 * Get ward data by number within a specific land
 * @param wardNumber - Ward number (1-based index)
 * @param landId - Numeric land ID
 * @returns Ward data or null if not found
 */
export function getWardByNumber(wardNumber: number, landId: number): WardData | null {
  const land = getLandById(landId);
  if (!land) return null;
  return land.wards.find((ward) => ward.number === wardNumber) || null;
}

/**
 * Get ward data by string ID
 * @param wardId - Ward string ID (e.g., 'ward1')
 * @returns Ward data or null if not found
 */
export function getWardById(wardId: string): WardData | null {
  for (const land of WORLD_DATA) {
    const ward = land.wards.find((w) => w.id === wardId);
    if (ward) return ward;
  }
  return null;
}

/**
 * Get all wards for a specific land
 * @param landId - Numeric land ID
 * @returns Array of ward data (empty if land not found)
 */
export function getWardsByLandId(landId: number): WardData[] {
  const land = getLandById(landId);
  return land ? land.wards : [];
}

/**
 * Get formatted display name for a land
 * @param landId - Numeric land ID
 * @returns Formatted string like "Land 1: Horizon Steppe" or "Unknown Land"
 */
export function getLandDisplayName(landId: number): string {
  const land = getLandById(landId);
  if (!land) return 'Unknown Land';
  return `Land ${land.id}: ${land.name}`;
}

/**
 * Get formatted display name for a ward
 * @param wardNumber - Ward number (1-based index)
 * @param landId - Numeric land ID
 * @returns Formatted string like "Ward 1: The Parting Stones" or "Unknown Ward"
 */
export function getWardDisplayName(wardNumber: number, landId: number): string {
  const ward = getWardByNumber(wardNumber, landId);
  if (!ward) return 'Unknown Ward';
  return `Ward ${ward.number}: ${ward.name}`;
}

/**
 * Get ward name only (without "Ward #:")
 * @param wardNumber - Ward number (1-based index)
 * @param landId - Numeric land ID
 * @returns Ward name or "Unknown Ward"
 */
export function getWardName(wardNumber: number, landId: number): string {
  const ward = getWardByNumber(wardNumber, landId);
  return ward ? ward.name : 'Unknown Ward';
}

/**
 * Get land name only (without "Land #:")
 * @param landId - Numeric land ID
 * @returns Land name or "Unknown Land"
 */
export function getLandName(landId: number): string {
  const land = getLandById(landId);
  return land ? land.name : 'Unknown Land';
}
