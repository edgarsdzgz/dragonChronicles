// MVP 1.1 Principal Engineer Implementation - Store System per CTO Spec
import { readable, writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { Decimal } from '$lib/num/decimal';
import type { UiState110, ToWorker110, FromWorker110, DebugAction } from './types110';
import { loadSave, saveToDisk } from './saveSystem';
import { telemetry } from './telemetry';
import { formatDecimal, formatDistance, formatETA } from './numberFormat';
import { distanceWorker } from '$lib/state/distance';

let worker110: Worker | undefined;
let lastState: UiState110 | null = null;

// Core game state store
export const gameState110 = readable<UiState110 | null>(null, (set) => {
  if (!browser) {
    return () => {};
  }

  // Create worker for 1.1 system
  worker110 = new Worker(new URL('../workers/worker110.ts', import.meta.url), { 
    type: 'module' 
  });

  // Load existing save or create new
  const existingSave = loadSave();
  
  // Initialize worker
  worker110.postMessage({ 
    type: 'init', 
    state: existingSave 
  } as ToWorker110);

  // Request offline progress application
  if (existingSave) {
    worker110.postMessage({ type: 'request-offline-apply' } as ToWorker110);
  }

  // Listen for messages from worker
  worker110.onmessage = (e: MessageEvent<FromWorker110>) => {
    const msg = e.data;
    
    switch (msg.type) {
      case 'state:update':
        lastState = msg.state;
        set(msg.state);
        
        // Phase 0.1: Update worker distance store
        distanceWorker.set({
          km: parseFloat(msg.state.runTotalDistanceKm)
        });
        
        // Auto-save periodically (every state update for now)
        if (lastState) {
          const save = {
            saveVersion: 110 as const,
            currencies: {
              arcana: lastState.currencies.arcana,
              forgegold: lastState.currencies.forgegold,
              dragonscales: lastState.currencies.dragonscales,
              gems: lastState.currencies.gems,
            },
            runTotalDistanceKm: lastState.runTotalDistanceKm,
            lifetimeTotalDistanceKm: lastState.lifetimeTotalDistanceKm,
            lifetimeMaxTotalDistanceKm: lastState.lifetimeMaxTotalDistanceKm,
            currentLevel: lastState.currentLevel,
            levelDistanceKm: '0', // Simplified for MVP 1.1
            enchants: lastState.enchants,
            dragonHp: lastState.dragonHp,
            dragonMaxHp: lastState.dragonMaxHp,
            travelState: lastState.travelState,
            lastSaveTimestampMs: new Decimal(Date.now()).toString(),
            ewma: {
              arcana: lastState.ewmaArcanaPerSec,
              alpha: '0.2',
            },
            notation: 'scientific-ee@e100' as const,
            debugMode: lastState.debugMode,
          };
          
          // Throttled save (don't save every single update)
          if (Math.random() < 0.1) { // 10% chance per update
            saveToDisk(save);
          }
        }
        break;
        
      case 'toast':
        console.log('🍞 Toast:', msg.text);
        // Could integrate with a toast notification system
        break;
        
      case 'log':
        // NDJSON log line - already handled by telemetry system
        break;
        
      case 'offline-welcome':
        const hours = Math.round(msg.elapsedHours * 10) / 10;
        const arcanaGain = formatDecimal(msg.arcanaGain);
        console.log(`🌙 Welcome back! You were away for ${hours}h and gained ${arcanaGain} Arcana`);
        break;
        
      case 'error':
        console.error('⚠️ Worker Error:', msg.message);
        break;
    }
  };

  // Cleanup
  return () => {
    // Save before terminating
    if (lastState) {
      const finalSave = {
        saveVersion: 110 as const,
        currencies: lastState.currencies,
        runTotalDistanceKm: lastState.runTotalDistanceKm,
        lifetimeTotalDistanceKm: lastState.lifetimeTotalDistanceKm,
        lifetimeMaxTotalDistanceKm: lastState.lifetimeMaxTotalDistanceKm,
        currentLevel: lastState.currentLevel,
        levelDistanceKm: '0',
        enchants: lastState.enchants,
        dragonHp: lastState.dragonHp,
        dragonMaxHp: lastState.dragonMaxHp,
        travelState: lastState.travelState,
        lastSaveTimestampMs: new Decimal(Date.now()).toString(),
        ewma: {
          arcana: lastState.ewmaArcanaPerSec,
          alpha: '0.2',
        },
        notation: 'scientific-ee@e100' as const,
        debugMode: lastState.debugMode,
      };
      
      saveToDisk(finalSave);
    }
    
    worker110?.terminate();
    worker110 = undefined;
  };
});

// Derived stores for UI components
export const currencies110 = derived(
  gameState110,
  ($state) => $state?.currencies || {
    arcana: '0',
    forgegold: '0', 
    dragonscales: '0',
    gems: '0'
  }
);

export const enchants110 = derived(
  gameState110,
  ($state) => $state?.enchants || {
    firepower: { level: 0, tierUnlocked: 1 },
    scales: { level: 0, tierUnlocked: 1 }
  }
);

export const dragonState110 = derived(
  gameState110,
  ($state) => ({
    hp: $state?.dragonHp || 100,
    maxHp: $state?.dragonMaxHp || 100,
    hpPercentage: $state ? $state.dragonHp / $state.dragonMaxHp : 1,
    travelState: $state?.travelState || 'HOVERING'
  })
);

export const distanceState110 = derived(
  gameState110,
  ($state) => ({
    currentLevel: $state?.currentLevel || 1,
    levelProgress: $state?.levelProgress || 0,
    runTotalKm: $state?.runTotalDistanceKm || '0',
    lifetimeTotalKm: $state?.lifetimeTotalDistanceKm || '0',
    lifetimeMaxKm: $state?.lifetimeMaxTotalDistanceKm || '0',
  })
);

export const ratesState110 = derived(
  gameState110,
  ($state) => ({
    arcanaPerSec: $state?.ewmaArcanaPerSec || '0',
    arcanaPerSecFormatted: formatDecimal($state?.ewmaArcanaPerSec || '0'),
  })
);

// Action functions to send messages to worker
export function startTravel(): void {
  worker110?.postMessage({ 
    type: 'control', 
    cmd: 'start' 
  } as ToWorker110);
}

export function stopTravel(): void {
  worker110?.postMessage({ 
    type: 'control', 
    cmd: 'stop' 
  } as ToWorker110);
}

export function reverseTravel(): void {
  worker110?.postMessage({ 
    type: 'control', 
    cmd: 'reverse' 
  } as ToWorker110);
}

export function purchaseEnchant(which: 'firepower' | 'scales'): void {
  worker110?.postMessage({ 
    type: 'purchase-enchant', 
    which 
  } as ToWorker110);
}

export function tierUpEnchant(which: 'firepower' | 'scales'): void {
  worker110?.postMessage({ 
    type: 'tier-up', 
    which 
  } as ToWorker110);
}

export function selectTier(which: 'firepower' | 'scales', tier: 1 | 2 | 3): void {
  worker110?.postMessage({ 
    type: 'select-tier', 
    which,
    tier 
  } as ToWorker110);
}

export function resetJourney(): void {
  worker110?.postMessage({ 
    type: 'reset-run' 
  } as ToWorker110);
}

// Debug functions
export function debugAddArcana(amount: number): void {
  worker110?.postMessage({ 
    type: 'debug', 
    action: { type: 'add-arcana', amount } 
  } as ToWorker110);
}

export function debugForceHP(percentage: number): void {
  worker110?.postMessage({ 
    type: 'debug', 
    action: { type: 'force-hp', percentage } 
  } as ToWorker110);
}

export function debugFreeLevel(enchant: 'firepower' | 'scales', amount: number): void {
  worker110?.postMessage({ 
    type: 'debug', 
    action: { type: 'free-level', enchant, amount } 
  } as ToWorker110);
}

export function debugFreeTier(enchant: 'firepower' | 'scales', tier: 1 | 2 | 3): void {
  worker110?.postMessage({ 
    type: 'debug', 
    action: { type: 'free-tier', enchant, tier } 
  } as ToWorker110);
}

// Helper functions for UI calculations
export function canAffordEnchant(enchantType: 'firepower' | 'scales', state: UiState110): boolean {
  const enchant = state.enchants[enchantType];
  const arcana = new Decimal(state.currencies.arcana);
  
  // Use proper enchant cost calculation
  const baseCost = enchantType === 'firepower' ? 10 : 12;
  const cost = new Decimal(baseCost).mul(Decimal.pow(1.4, enchant.level)).ceil();
  
  return arcana.gte(cost) && enchant.level < 500; // Level cap per spec
}

export function getEnchantCost(enchantType: 'firepower' | 'scales', state: UiState110): string {
  const enchant = state.enchants[enchantType];
  const baseCost = enchantType === 'firepower' ? 10 : 12;
  const cost = new Decimal(baseCost).mul(Decimal.pow(1.4, enchant.level)).ceil();
  
  return formatDecimal(cost);
}

export function getEnchantETA(enchantType: 'firepower' | 'scales', state: UiState110): string {
  const cost = new Decimal(getEnchantCost(enchantType, state));
  const arcana = new Decimal(state.currencies.arcana);
  const rate = new Decimal(state.ewmaArcanaPerSec);
  
  if (arcana.gte(cost)) return 'Affordable';
  if (rate.lte(0)) return '~—';
  
  const needed = cost.minus(arcana);
  const timeSeconds = needed.div(rate);
  
  return formatETA(timeSeconds);
}