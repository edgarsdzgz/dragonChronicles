// MVP 1.1 Principal Engineer Implementation - Data-Driven Distance→Level per CTO Spec §3
import { Decimal } from '$lib/num/decimal';

interface DistanceConfig {
  levelBaseKm: number;
  levelGrowth: number;
  maxLevels: number;
  overrides: Record<string, number>;
}

interface LevelSystem {
  requiredKm: Decimal[];     // requiredKm[N] = km needed for level N
  cumulativeKm: Decimal[];   // cumulativeKm[N] = total km to reach level N
  maxLevels: number;
}

let levelSystem: LevelSystem | null = null;
let isInitialized = false;

/**
 * Load and precompute level system from JSON config
 */
export async function initializeLevelSystem(): Promise<void> {
  try {
    const response = await fetch('/distance-config.json');
    if (!response.ok) {
      throw new Error(`Failed to load distance config: ${response.status}`);
    }
    
    const config: DistanceConfig = await response.json();
    levelSystem = precomputeLevels(config);
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize level system:', error);
    // Fallback to hardcoded config
    levelSystem = precomputeLevels({
      levelBaseKm: 1.5,
      levelGrowth: 1.25,
      maxLevels: 2000,
      overrides: {
        '1': 1.5,
        '2': 1.9,
        '10': 8.0,
      },
    });
    isInitialized = true;
  }
}

/**
 * Precompute required and cumulative distances per spec §3.2
 */
function precomputeLevels(config: DistanceConfig): LevelSystem {
  const { levelBaseKm, levelGrowth, maxLevels, overrides } = config;
  
  const requiredKm: Decimal[] = [new Decimal(0)]; // Level 0 placeholder
  const cumulativeKm: Decimal[] = [new Decimal(0)]; // Cumulative to level 0
  
  let runningTotal = new Decimal(0);
  
  for (let level = 1; level <= maxLevels; level++) {
    // Check for override first
    const overrideKm = overrides[level.toString()];
    let levelKm: Decimal;
    
    if (overrideKm !== undefined) {
      levelKm = new Decimal(overrideKm);
    } else {
      // Geometric progression: levelBaseKm * levelGrowth^(level-1)
      const exponent = level - 1;
      levelKm = new Decimal(levelBaseKm).mul(Decimal.pow(levelGrowth, exponent));
    }
    
    requiredKm[level] = levelKm;
    runningTotal = runningTotal.plus(levelKm);
    cumulativeKm[level] = runningTotal;
  }
  
  return {
    requiredKm,
    cumulativeKm,
    maxLevels,
  };
}

/**
 * Find current land/level based on total distance per spec §3.3
 * Uses binary search for O(log N) performance
 */
export function getLandForRunDistance(runTotalDistanceKm: Decimal): number {
  if (!levelSystem) {
    throw new Error('Level system not initialized - call initializeLevelSystem() first');
  }
  
  const { cumulativeKm, maxLevels } = levelSystem;
  
  // Handle edge cases
  if (runTotalDistanceKm.lte(0)) return 1;
  
  // Binary search to find level N where cumKm[N-1] ≤ distance < cumKm[N]
  let left = 1;
  let right = maxLevels;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    if (runTotalDistanceKm.lt(cumulativeKm[mid])) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  
  // Clamp to valid range
  return Math.min(left, maxLevels);
}

/**
 * Get progress within current level (0.0 to 1.0)
 */
export function getLevelProgress(runTotalDistanceKm: Decimal): number {
  if (!levelSystem) return 0;
  
  const currentLevel = getLandForRunDistance(runTotalDistanceKm);
  const { requiredKm, cumulativeKm } = levelSystem;
  
  if (currentLevel >= levelSystem.maxLevels) return 1.0;
  
  const levelStartKm = currentLevel > 1 ? cumulativeKm[currentLevel - 1] : new Decimal(0);
  const levelRequiredKm = requiredKm[currentLevel];
  const progressKm = runTotalDistanceKm.minus(levelStartKm);
  
  return Math.min(1.0, Math.max(0.0, progressKm.div(levelRequiredKm).toNumber()));
}

/**
 * Format distance header per spec: "Land {N} | Verdant Dragonplains {km}"
 */
export function formatDistanceHeader(runTotalDistanceKm: Decimal): string {
  if (!isInitialized) {
    return 'Land 1 | Verdant Dragonplains 0.00 km'; // Safe default for SSR
  }
  
  const land = getLandForRunDistance(runTotalDistanceKm);
  const formattedDistance = formatDistanceValue(runTotalDistanceKm);
  
  return `Land ${land} | Verdant Dragonplains ${formattedDistance}`;
}

/**
 * Distance-specific formatting with km suffix
 */
function formatDistanceValue(kilometers: Decimal): string {
  if (kilometers.lt(10000)) {
    return kilometers.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' km';
  }
  
  // Use scientific notation for large distances
  const mantissa = kilometers.div(Decimal.pow(10, kilometers.log10().floor()));
  const exponent = kilometers.log10().floor().toNumber();
  return `${mantissa.toFixed(2)}e${exponent} km`;
}

/**
 * Get required distance for a specific level (for debugging/testing)
 */
export function getRequiredDistanceForLevel(level: number): Decimal {
  if (!levelSystem || level < 1 || level > levelSystem.maxLevels) {
    return new Decimal(0);
  }
  
  return levelSystem.requiredKm[level];
}

/**
 * Get cumulative distance to reach a specific level
 */
export function getCumulativeDistanceToLevel(level: number): Decimal {
  if (!levelSystem || level < 1 || level > levelSystem.maxLevels) {
    return new Decimal(0);
  }
  
  return levelSystem.cumulativeKm[level];
}