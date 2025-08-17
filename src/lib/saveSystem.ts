// MVP 1.1 Principal Engineer Implementation - Save System v110 per CTO Spec §1.2
import { Decimal } from '$lib/num/decimal';

export interface Save110 {
  saveVersion: 110;
  
  // Currencies (all as Decimal strings)
  currencies: {
    arcana: string;
    forgegold: string;
    dragonscales: string;
    gems: string;
  };
  
  // Distance tracking (all as Decimal strings)
  runTotalDistanceKm: string;
  lifetimeTotalDistanceKm: string;
  lifetimeMaxTotalDistanceKm: string;
  
  // Current state
  currentLevel: number;
  levelDistanceKm: string;
  
  // Enchants
  enchants: {
    firepower: {
      level: number;
      tierUnlocked: 1 | 2 | 3;
    };
    scales: {
      level: number;
      tierUnlocked: 1 | 2 | 3;
    };
  };
  
  // Dragon state
  dragonHp: number;
  dragonMaxHp: number;
  travelState: 'HOVERING' | 'ADVANCING' | 'RETREATING';
  
  // Offline progress
  lastSaveTimestampMs: string; // Decimal string for precision
  ewma: {
    arcana: string; // Decimal string for arcana/sec rate
    alpha: string;  // 0.2
  };
  
  // Settings
  notation: 'scientific-ee@e100';
  debugMode: boolean;
}

export function createDefaultSave110(): Save110 {
  return {
    saveVersion: 110,
    
    currencies: {
      arcana: new Decimal(1000).toString(), // Start with testing amount
      forgegold: new Decimal(0).toString(),
      dragonscales: new Decimal(0).toString(),
      gems: new Decimal(0).toString(),
    },
    
    runTotalDistanceKm: new Decimal(0).toString(),
    lifetimeTotalDistanceKm: new Decimal(0).toString(),
    lifetimeMaxTotalDistanceKm: new Decimal(0).toString(),
    
    currentLevel: 1,
    levelDistanceKm: new Decimal(0).toString(),
    
    enchants: {
      firepower: {
        level: 0,
        tierUnlocked: 1,
      },
      scales: {
        level: 0,
        tierUnlocked: 1,
      },
    },
    
    dragonHp: 100,
    dragonMaxHp: 100,
    travelState: 'HOVERING',
    
    lastSaveTimestampMs: new Decimal(Date.now()).toString(),
    ewma: {
      arcana: new Decimal(0).toString(),
      alpha: new Decimal(0.2).toString(),
    },
    
    notation: 'scientific-ee@e100',
    debugMode: false,
  };
}

export function loadSave(): Save110 | null {
  try {
    const saved = localStorage.getItem('dragonChronicles_save');
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    
    // Legacy save detection (≤1.0)
    if (!parsed.saveVersion || parsed.saveVersion < 110) {
      showLegacySaveModal();
      return null;
    }
    
    // Validate structure and convert strings back to Decimals where needed
    return validateAndMigrateSave(parsed);
  } catch (error) {
    console.error('Failed to load save:', error);
    return null;
  }
}

export function saveToDisk(save: Save110): void {
  try {
    // Update timestamp before saving
    save.lastSaveTimestampMs = new Decimal(Date.now()).toString();
    
    const serialized = JSON.stringify(save, null, 2);
    localStorage.setItem('dragonChronicles_save', serialized);
  } catch (error) {
    console.error('Failed to save to disk:', error);
  }
}

function validateAndMigrateSave(parsed: any): Save110 {
  // For MVP 1.1, we only support exact v110 saves
  // Future versions will implement forward migration here
  
  if (parsed.saveVersion !== 110) {
    throw new Error(`Unsupported save version: ${parsed.saveVersion}`);
  }
  
  // Validate all required fields exist
  const defaultSave = createDefaultSave110();
  
  return {
    ...defaultSave,
    ...parsed,
    // Ensure nested objects are properly merged
    currencies: { ...defaultSave.currencies, ...parsed.currencies },
    enchants: {
      firepower: { ...defaultSave.enchants.firepower, ...parsed.enchants?.firepower },
      scales: { ...defaultSave.enchants.scales, ...parsed.enchants?.scales },
    },
    ewma: { ...defaultSave.ewma, ...parsed.ewma },
  };
}

function showLegacySaveModal(): void {
  // Modal will be implemented in UI component
  console.warn('Legacy save detected - showing invalidation modal');
}