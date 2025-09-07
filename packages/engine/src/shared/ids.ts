/**
 * @file Type-safe ID constants for Draconia Chronicles Engine
 * @description Phase 1 Story 1: Land and Ward identifiers with type safety
 */

/**
 * Land identifiers
 */
export const Lands = {
  HorizonSteppe: 1
} as const;

export type LandId = typeof Lands[keyof typeof Lands];

/**
 * Ward identifiers within lands
 */
export const Wards = {
  W1: 1,
  W2: 2, 
  W3: 3,
  W4: 4,
  W5: 5
} as const;

export type WardId = typeof Wards[keyof typeof Wards];

/**
 * Type guards for ID validation
 */
export function isLandId(value: unknown): value is LandId {
  return typeof value === 'number' && Object.values(Lands).includes(value as LandId);
}

export function isWardId(value: unknown): value is WardId {
  return typeof value === 'number' && Object.values(Wards).includes(value as WardId);
}

/**
 * ID validation helpers
 */
export function validateLandId(value: unknown): LandId {
  if (!isLandId(value)) {
    throw new Error(`Invalid land ID: ${value}`);
  }
  return value;
}

export function validateWardId(value: unknown): WardId {
  if (!isWardId(value)) {
    throw new Error(`Invalid ward ID: ${value}`);
  }
  return value;
}
