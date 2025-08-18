// MVP 1.1 Principal Engineer Implementation - Worker Contracts per CTO Spec §9
import { Decimal } from '$lib/num/decimal';
import type { Save110 } from './saveSystem';
import type { EnchantsState } from './enchantSystem';

// Debug actions per CTO Spec §6
export type DebugAction = 
  | { type: 'add-arcana'; amount: number }
  | { type: 'force-hp'; percentage: number }
  | { type: 'free-level'; enchant: 'firepower' | 'scales'; amount: number }
  | { type: 'free-tier'; enchant: 'firepower' | 'scales'; tier: 1 | 2 | 3 };

// Messages UI → Worker per spec §9.1
export type ToWorker110 =
  | { type: 'init'; state?: Save110 }
  | { type: 'tick'; dtMs: number }                             // main loop
  | { type: 'control'; cmd: 'start' | 'stop' | 'reverse' }     // travel controls
  | { type: 'purchase-enchant'; which: 'firepower' | 'scales' }
  | { type: 'tier-up'; which: 'firepower' | 'scales' }
  | { type: 'select-tier'; which: 'firepower' | 'scales'; tier: 1 | 2 | 3 }
  | { type: 'reset-run' }                                      // Return to Draconia
  | { type: 'request-offline-apply' }                          // at boot
  | { type: 'debug'; action: DebugAction };

// UI State for display (derived from internal worker state)
export interface UiState110 {
  // Current run state
  currentLevel: number;
  levelProgress: number;           // 0.0 to 1.0
  runTotalDistanceKm: string;      // Decimal string for display
  
  // Dragon state  
  dragonHp: number;
  dragonMaxHp: number;
  travelState: 'HOVERING' | 'ADVANCING' | 'RETREATING';
  
  // Currencies (Decimal strings for display)
  currencies: {
    arcana: string;
    forgegold: string;
    dragonscales: string;
    gems: string;
  };
  
  // Enchants
  enchants: EnchantsState;
  
  // Lifetime tracking
  lifetimeTotalDistanceKm: string;
  lifetimeMaxTotalDistanceKm: string;
  
  // Rates for ETA calculations
  ewmaArcanaPerSec: string;        // Decimal string
  
  // Settings
  debugMode: boolean;
}

// Messages Worker → UI per spec §9.2  
export type FromWorker110 =
  | { type: 'state:update'; state: UiState110 }  // throttled ≤10 Hz idle, ≤60 Hz active
  | { type: 'toast'; text: string }
  | { type: 'log'; line: string }                // NDJSON append
  | { type: 'offline-welcome'; elapsedHours: number; arcanaGain: string }
  | { type: 'error'; message: string };

// Internal worker state (uses actual Decimal instances)
export interface WorkerState110 {
  // Save data (mirrors Save110 but with Decimal instances)
  saveVersion: 110;
  
  // Currencies (Decimal instances for math)
  currencies: {
    arcana: Decimal;
    forgegold: Decimal;
    dragonscales: Decimal;
    gems: Decimal;
  };
  
  // Distance tracking
  runTotalDistanceKm: Decimal;
  lifetimeTotalDistanceKm: Decimal;
  lifetimeMaxTotalDistanceKm: Decimal;
  
  // Current state
  currentLevel: number;
  levelDistanceKm: Decimal;        // Progress within current level
  
  // Enchants
  enchants: EnchantsState;
  
  // Dragon state
  dragonHp: number;
  dragonMaxHp: number;
  travelState: 'HOVERING' | 'ADVANCING' | 'RETREATING';
  
  // Offline progress
  lastSaveTimestampMs: Decimal;
  ewma: {
    arcanaPerSec: Decimal;
    alpha: Decimal;                // 0.2
    samples: number;
  };
  
  // Settings
  debugMode: boolean;
  
  // Internal worker state
  lastUpdateMs: number;            // For throttling
  tickAccumulator: number;         // For fixed 1s ticks
  isAnimating: boolean;            // For high-frequency updates
}

// Rate calculation helpers
export interface RateInfo {
  arcanaPerSec: Decimal;
  distancePerSec: Decimal;         // Only when traveling
}

// Throttling configuration per spec
export const THROTTLE_CONFIG = {
  TICK_MS: 1000,                   // 1s fixed ticks
  IDLE_UPDATE_HZ: 10,              // ≤10 Hz when idle
  ACTIVE_UPDATE_HZ: 60,            // ≤60 Hz when active
  IDLE_UPDATE_MS: 100,             // 1000ms / 10Hz
  ACTIVE_UPDATE_MS: 16,            // 1000ms / 60Hz ≈ 16.67ms
} as const;