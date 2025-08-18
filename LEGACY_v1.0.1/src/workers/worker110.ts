// MVP 1.1 Principal Engineer Implementation - Game Worker per CTO Spec §9
import { Decimal } from '../lib/num/decimal';
import type { 
  ToWorker110, 
  FromWorker110, 
  WorkerState110, 
  UiState110,
  RateInfo,
  DebugAction 
} from '../lib/types110';
import type { Save110 } from '../lib/saveSystem';
import { createDefaultSave110 } from '../lib/saveSystem';
import { calculateOfflineProgress, applyOfflineProgress, updateEWMA } from '../lib/offlineProgress';
import { getLandForRunDistance, getLevelProgress, initializeLevelSystem } from '../lib/distanceSystem';
import { 
  calculateEnchantCost, 
  calculateTierUpCost, 
  tryPurchaseEnchant, 
  tryTierUp,
  canTierUp 
} from '../lib/enchantSystem';
import { telemetry } from '../lib/telemetry';
import { THROTTLE_CONFIG } from '../lib/types110';

let state: WorkerState110;
let timer: number | undefined;

/**
 * Convert Save110 to WorkerState110 (strings → Decimal instances)
 */
function saveToWorkerState(save: Save110): WorkerState110 {
  return {
    saveVersion: save.saveVersion,
    
    currencies: {
      arcana: new Decimal(save.currencies.arcana),
      forgegold: new Decimal(save.currencies.forgegold),
      dragonscales: new Decimal(save.currencies.dragonscales),
      gems: new Decimal(save.currencies.gems),
    },
    
    runTotalDistanceKm: new Decimal(save.runTotalDistanceKm),
    lifetimeTotalDistanceKm: new Decimal(save.lifetimeTotalDistanceKm),
    lifetimeMaxTotalDistanceKm: new Decimal(save.lifetimeMaxTotalDistanceKm),
    
    currentLevel: save.currentLevel,
    levelDistanceKm: new Decimal(save.levelDistanceKm),
    
    enchants: save.enchants,
    
    dragonHp: save.dragonHp,
    dragonMaxHp: save.dragonMaxHp,
    travelState: save.travelState,
    
    lastSaveTimestampMs: new Decimal(save.lastSaveTimestampMs),
    ewma: {
      arcanaPerSec: new Decimal(save.ewma.arcana),
      alpha: new Decimal(save.ewma.alpha),
      samples: 0,
    },
    
    debugMode: save.debugMode,
    
    // Internal state
    lastUpdateMs: Date.now(),
    tickAccumulator: 0,
    isAnimating: false,
  };
}

/**
 * Convert WorkerState110 to Save110 (Decimal instances → strings)
 */
function workerStateToSave(workerState: WorkerState110): Save110 {
  return {
    saveVersion: workerState.saveVersion,
    
    currencies: {
      arcana: workerState.currencies.arcana.toString(),
      forgegold: workerState.currencies.forgegold.toString(),
      dragonscales: workerState.currencies.dragonscales.toString(),
      gems: workerState.currencies.gems.toString(),
    },
    
    runTotalDistanceKm: workerState.runTotalDistanceKm.toString(),
    lifetimeTotalDistanceKm: workerState.lifetimeTotalDistanceKm.toString(),
    lifetimeMaxTotalDistanceKm: workerState.lifetimeMaxTotalDistanceKm.toString(),
    
    currentLevel: workerState.currentLevel,
    levelDistanceKm: workerState.levelDistanceKm.toString(),
    
    enchants: workerState.enchants,
    
    dragonHp: workerState.dragonHp,
    dragonMaxHp: workerState.dragonMaxHp,
    travelState: workerState.travelState,
    
    lastSaveTimestampMs: new Decimal(Date.now()).toString(),
    ewma: {
      arcana: workerState.ewma.arcanaPerSec.toString(),
      alpha: workerState.ewma.alpha.toString(),
    },
    
    notation: 'scientific-ee@e100',
    debugMode: workerState.debugMode,
  };
}

/**
 * Convert WorkerState110 to UiState110 for display
 */
function workerStateToUi(workerState: WorkerState110): UiState110 {
  return {
    currentLevel: workerState.currentLevel,
    levelProgress: getLevelProgress(workerState.runTotalDistanceKm),
    runTotalDistanceKm: workerState.runTotalDistanceKm.toString(),
    
    dragonHp: workerState.dragonHp,
    dragonMaxHp: workerState.dragonMaxHp,
    travelState: workerState.travelState,
    
    currencies: {
      arcana: workerState.currencies.arcana.toString(),
      forgegold: workerState.currencies.forgegold.toString(),
      dragonscales: workerState.currencies.dragonscales.toString(),
      gems: workerState.currencies.gems.toString(),
    },
    
    enchants: workerState.enchants,
    
    lifetimeTotalDistanceKm: workerState.lifetimeTotalDistanceKm.toString(),
    lifetimeMaxTotalDistanceKm: workerState.lifetimeMaxTotalDistanceKm.toString(),
    
    ewmaArcanaPerSec: workerState.ewma.arcanaPerSec.toString(),
    
    debugMode: workerState.debugMode,
  };
}

/**
 * Calculate current rates per spec §9.5
 */
function calculateRates(): RateInfo {
  // Base arcana rate from enchants (simple formula for MVP)
  const firepowerBonus = new Decimal(state.enchants.firepower.level).mul(0.1);
  const scalesBonus = new Decimal(state.enchants.scales.level).mul(0.05);
  const arcanaPerSec = new Decimal(1).plus(firepowerBonus).plus(scalesBonus);
  
  // Distance rate (44 m/s = 0.044 km/s when advancing)
  const distancePerSec = state.travelState === 'ADVANCING' ? new Decimal(0.044) : new Decimal(0);
  
  return {
    arcanaPerSec,
    distancePerSec,
  };
}

/**
 * Main tick processing per spec §9.3
 */
function processTick(): void {
  const rates = calculateRates();
  
  // Update currencies
  state.currencies.arcana = state.currencies.arcana.plus(rates.arcanaPerSec);
  
  // Update distance (only when traveling)
  if (state.travelState === 'ADVANCING') {
    state.runTotalDistanceKm = state.runTotalDistanceKm.plus(rates.distancePerSec);
    state.levelDistanceKm = state.levelDistanceKm.plus(rates.distancePerSec);
    
    // Check for level progression
    const newLevel = getLandForRunDistance(state.runTotalDistanceKm);
    if (newLevel !== state.currentLevel) {
      state.currentLevel = newLevel;
      // Reset level distance for new level tracking
      // This is a simplified approach for MVP 1.1
      state.levelDistanceKm = new Decimal(0);
    }
  } else if (state.travelState === 'RETREATING') {
    // Retreat logic (simplified)
    state.runTotalDistanceKm = state.runTotalDistanceKm.minus(rates.distancePerSec);
    if (state.runTotalDistanceKm.lt(0)) {
      state.runTotalDistanceKm = new Decimal(0);
      state.travelState = 'HOVERING';
    }
    state.currentLevel = getLandForRunDistance(state.runTotalDistanceKm);
  }
  
  // Update EWMA per spec §2.1
  updateEWMA(state.ewma, rates.arcanaPerSec);
  
  // Log rate samples (throttled every 10s per spec §8)
  if (state.ewma.samples % 10 === 0) {
    telemetry.logRateSample(state.ewma.arcanaPerSec);
  }
}

/**
 * Throttled state updates per spec §9.2
 */
function shouldSendUpdate(): boolean {
  const now = Date.now();
  const elapsed = now - state.lastUpdateMs;
  
  const threshold = state.isAnimating ? 
    THROTTLE_CONFIG.ACTIVE_UPDATE_MS : 
    THROTTLE_CONFIG.IDLE_UPDATE_MS;
    
  return elapsed >= threshold;
}

function sendStateUpdate(): void {
  if (shouldSendUpdate()) {
    const uiState = workerStateToUi(state);
    postMessage({
      type: 'state:update',
      state: uiState
    } as FromWorker110);
    
    state.lastUpdateMs = Date.now();
  }
}

/**
 * Handle debug actions per spec §6
 */
function handleDebugAction(action: DebugAction): void {
  if (!state.debugMode) return; // Ignore if debug mode disabled
  
  switch (action.type) {
    case 'add-arcana':
      state.currencies.arcana = state.currencies.arcana.plus(action.amount);
      break;
      
    case 'force-hp':
      state.dragonHp = Math.max(1, Math.min(100, action.percentage));
      break;
      
    case 'free-level':
      const enchant = state.enchants[action.enchant];
      enchant.level = Math.min(500, enchant.level + action.amount);
      break;
      
    case 'free-tier':
      state.enchants[action.enchant].tierUnlocked = action.tier;
      break;
  }
}

// Message handling per spec §9
self.onmessage = (e: MessageEvent<ToWorker110>) => {
  const msg = e.data;
  
  try {
    switch (msg.type) {
      case 'init':
        // Initialize level system first
        initializeLevelSystem().then(() => {
          const save = msg.state || createDefaultSave110();
          state = saveToWorkerState(save);
          
          if (!timer) {
            // Phase 0.2: Set worker active flag
            if (typeof window !== 'undefined') {
              (window as any).__workerActive = true;
            } else {
              (self as any).__workerActive = true;
            }
            
            timer = setInterval(() => {
              // Process accumulated time in fixed 1s chunks per spec §9.3
              state.tickAccumulator += 16; // Assuming 60fps timer
              
              while (state.tickAccumulator >= THROTTLE_CONFIG.TICK_MS) {
                processTick();
                state.tickAccumulator -= THROTTLE_CONFIG.TICK_MS;
              }
              
              sendStateUpdate();
            }, 16) as unknown as number; // ~60fps for smooth updates
          }
        });
        break;
        
      case 'tick':
        // External tick (not used in 1.1, keeping for compatibility)
        break;
        
      case 'control':
        switch (msg.cmd) {
          case 'start':
            state.travelState = 'ADVANCING';
            state.isAnimating = true; // Enable high-frequency updates
            break;
          case 'stop':
            state.travelState = 'HOVERING';
            state.isAnimating = false;
            break;
          case 'reverse':
            state.travelState = 'RETREATING';
            state.isAnimating = true;
            break;
        }
        break;
        
      case 'purchase-enchant':
        const enchantState = state.enchants[msg.which];
        const result = tryPurchaseEnchant(enchantState, state.currencies.arcana, msg.which);
        
        if (result.success && result.cost) {
          state.currencies.arcana = result.newArcana;
          enchantState.level++;
          
          telemetry.logPurchase(
            msg.which,
            enchantState.level - 1,
            enchantState.level,
            result.cost,
            state.currencies.arcana
          );
        }
        break;
        
      case 'tier-up':
        const enchant = state.enchants[msg.which];
        const tierResult = tryTierUp(enchant, state.currencies.arcana, msg.which);
        
        if (tierResult.success && tierResult.cost) {
          state.currencies.arcana = tierResult.newArcana;
          const oldTier = enchant.tierUnlocked;
          enchant.tierUnlocked = Math.min(3, enchant.tierUnlocked + 1) as 1 | 2 | 3;
          
          telemetry.logTierUp(
            msg.which,
            oldTier,
            tierResult.cost,
            state.currencies.arcana
          );
        }
        break;
        
      case 'select-tier':
        const selectEnchant = state.enchants[msg.which];
        if (msg.tier <= selectEnchant.tierUnlocked) {
          // Note: selectedTier is not in our state model yet for MVP 1.1
          // This would be added in a future version
        }
        break;
        
      case 'reset-run':
        // Return to Draconia logic per spec §6
        const oldRunTotal = state.runTotalDistanceKm;
        
        // Update lifetime stats
        state.lifetimeTotalDistanceKm = state.lifetimeTotalDistanceKm.plus(oldRunTotal);
        state.lifetimeMaxTotalDistanceKm = Decimal.max(
          state.lifetimeMaxTotalDistanceKm,
          oldRunTotal
        );
        
        // Reset per-run state
        state.runTotalDistanceKm = new Decimal(0);
        state.levelDistanceKm = new Decimal(0);
        state.currentLevel = 1;
        
        // Reset enchants
        state.enchants.firepower = { level: 0, tierUnlocked: 1 };
        state.enchants.scales = { level: 0, tierUnlocked: 1 };
        
        state.travelState = 'HOVERING';
        state.isAnimating = false;
        
        telemetry.logResetJourney(oldRunTotal, state.lifetimeTotalDistanceKm);
        
        postMessage({
          type: 'toast',
          text: 'Journey Ended, returning to Draconia.'
        } as FromWorker110);
        break;
        
      case 'request-offline-apply':
        const save110 = workerStateToSave(state);
        const offline = calculateOfflineProgress(save110);
        
        if (offline.wasOffline) {
          applyOfflineProgress(save110, offline);
          state = saveToWorkerState(save110); // Reload updated state
          
          const elapsedHours = offline.elapsedMs.div(3600000).toNumber();
          
          postMessage({
            type: 'offline-welcome',
            elapsedHours,
            arcanaGain: offline.arcanaGain.toString()
          } as FromWorker110);
          
          telemetry.logOfflinePayout(
            offline.appliedMs.div(1000),
            state.ewma.arcanaPerSec,
            offline.arcanaGain
          );
        }
        break;
        
      case 'debug':
        handleDebugAction(msg.action);
        break;
    }
  } catch (error) {
    postMessage({
      type: 'error',
      message: `Worker error: ${error}`
    } as FromWorker110);
  }
};