/**
 * Death Processing System for Draconia Chronicles
 * 
 * Handles enemy death events, currency rewards, material drops, and progression tracking.
 * Integrates with Arcana/Soul Power systems and provides visual feedback.
 */

import type {
  Dragon,
  Enemy,
  CombatState,
  CombatEvent,
  Vector2,
} from './types.js';
import { createDefaultArcanaDropManager } from '../economy/arcana-drop-manager.js';
import { createDefaultSoulPowerDropManager } from '../economy/soul-power-drop-manager.js';

export interface DeathProcessingConfig {
  enableDeathProcessing: boolean;
  enableCurrencyRewards: boolean;
  enableMaterialDrops: boolean;
  enableRareItemDrops: boolean;
  enableBossArtifacts: boolean;
  enableVisualEffects: boolean;
  enableParticleEffects: boolean;
  enableScreenShake: boolean;
  enableFloatingNumbers: boolean;
  enableProgressionTracking: boolean;
  enableAchievementTriggers: boolean;
  enablePerformanceOptimization: boolean;
  performanceThreshold: number;
  bossMultiplier: number; // 5x for bosses
  rareDropChance: number; // 0.05 = 5%
  artifactDropChance: number; // 0.01 = 1%
}

export interface DeathProcessingState {
  isActive: boolean;
  isPaused: boolean;
  pendingDeaths: Map<string, PendingDeath>;
  activeEffects: Map<string, VisualEffect>;
  progressionTracking: {
    totalKills: number;
    bossKills: number;
    distanceProgress: number;
    killCounts: Map<string, number>;
    achievementTriggers: string[];
  };
  performanceMetrics: {
    deathsProcessedPerSecond: number;
    averageRewardCalculationTime: number;
    averageVisualEffectTime: number;
    averageProgressionUpdateTime: number;
    performanceScore: number;
  };
  combatEvents: CombatEvent[];
  combatState: CombatState;
}

export interface PendingDeath {
  enemy: Enemy;
  deathTime: number;
  rewards: DeathRewards;
  visualEffects: VisualEffect[];
  progressionUpdates: ProgressionUpdate[];
}

export interface DeathRewards {
  arcana: number;
  soulPower: number;
  gold: number;
  astralSeals: number;
  materials: MaterialDrop[];
  rareItems: RareItem[];
  bossArtifacts: Artifact[];
}

export interface MaterialDrop {
  id: string;
  name: string;
  type: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  value: number;
  source: string; // Enemy type that dropped it
}

export interface RareItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'special';
  rarity: 'rare' | 'epic' | 'legendary' | 'mythic';
  value: number;
  effects: Map<string, unknown>;
  source: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'boss_artifact' | 'legendary_artifact' | 'mythic_artifact';
  rarity: 'legendary' | 'mythic' | 'divine';
  value: number;
  effects: Map<string, unknown>;
  bossSource: string;
  description: string;
}

export interface VisualEffect {
  id: string;
  type: 'floating_number' | 'particle_burst' | 'screen_shake' | 'flash' | 'explosion';
  position: Vector2;
  duration: number;
  intensity: number;
  data: Record<string, unknown>;
  startTime: number;
}

export interface ProgressionUpdate {
  type: 'kill_count' | 'distance_progress' | 'achievement_trigger' | 'boss_defeat';
  data: Record<string, unknown>;
  timestamp: number;
}

export interface DeathProcessingMetrics {
  totalDeathsProcessed: number;
  totalCurrencyRewarded: number;
  totalMaterialsDropped: number;
  totalRareItemsDropped: number;
  totalBossArtifactsDropped: number;
  totalVisualEffectsCreated: number;
  totalProgressionUpdates: number;
  averageRewardCalculationTime: number;
  averageVisualEffectTime: number;
  averageProgressionUpdateTime: number;
  performanceOptimizations: number;
}

export class DeathProcessingSystem {
  private config: DeathProcessingConfig;
  private state: DeathProcessingState;
  private metrics: DeathProcessingMetrics;
  private dragon: Dragon;
  private arcanaDropManager: ReturnType<typeof createDefaultArcanaDropManager>;
  private soulPowerDropManager: ReturnType<typeof createDefaultSoulPowerDropManager>;

  constructor(config: Partial<DeathProcessingConfig>, dragon: Dragon) {
    this.config = {
      enableDeathProcessing: true,
      enableCurrencyRewards: true,
      enableMaterialDrops: true,
      enableRareItemDrops: true,
      enableBossArtifacts: true,
      enableVisualEffects: true,
      enableParticleEffects: true,
      enableScreenShake: true,
      enableFloatingNumbers: true,
      enableProgressionTracking: true,
      enableAchievementTriggers: true,
      enablePerformanceOptimization: true,
      performanceThreshold: 100,
      bossMultiplier: 5.0,
      rareDropChance: 0.05,
      artifactDropChance: 0.01,
      ...config,
    };

    this.dragon = dragon;
    this.arcanaDropManager = createDefaultArcanaDropManager();
    this.soulPowerDropManager = createDefaultSoulPowerDropManager();

    this.state = this.createInitialState();
    this.metrics = this.createInitialMetrics();
  }

  public start(): void {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.emitCombatEvent('death_processing_started', { dragonId: this.dragon.id });
  }

  public stop(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.pendingDeaths.clear();
    this.state.activeEffects.clear();
    this.emitCombatEvent('death_processing_stopped', { dragonId: this.dragon.id });
  }

  public pause(): void {
    this.state.isPaused = true;
    this.emitCombatEvent('death_processing_paused', { dragonId: this.dragon.id });
  }

  public resume(): void {
    this.state.isPaused = false;
    this.emitCombatEvent('death_processing_resumed', { dragonId: this.dragon.id });
  }

  public update(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.state.combatState = combatState;
    this.processPendingDeaths();
    this.updateVisualEffects(deltaTime);
    this.updatePerformanceMetrics(deltaTime);
    this.cleanupEvents();
  }

  public processEnemyDeath(enemy: Enemy, combatState: CombatState): void {
    if (!this.config.enableDeathProcessing) {
      return;
    }

    const deathTime = Date.now();
    const rewards = this.calculateRewards(enemy, combatState);
    const visualEffects = this.createVisualEffects(enemy, rewards);
    const progressionUpdates = this.createProgressionUpdates(enemy);

    const pendingDeath: PendingDeath = {
      enemy,
      deathTime,
      rewards,
      visualEffects,
      progressionUpdates,
    };

    this.state.pendingDeaths.set(enemy.id, pendingDeath);
    this.metrics.totalDeathsProcessed++;
    this.emitDeathEvent(enemy, rewards);
  }

  private processPendingDeaths(): void {
    for (const [enemyId, pendingDeath] of this.state.pendingDeaths.entries()) {
      this.applyRewards(pendingDeath.rewards);
      this.triggerVisualEffects(pendingDeath.visualEffects);
      this.applyProgressionUpdates(pendingDeath.progressionUpdates);
      this.state.pendingDeaths.delete(enemyId);
    }
  }

  private calculateRewards(enemy: Enemy, _combatState: CombatState): DeathRewards {
    const isBoss = enemy.isBoss || false;
    const multiplier = isBoss ? this.config.bossMultiplier : 1.0;

    // Calculate currency rewards
    const arcana = this.calculateArcanaReward(enemy, multiplier);
    const soulPower = this.calculateSoulPowerReward(enemy, multiplier);
    const gold = this.calculateGoldReward(enemy, multiplier);
    const astralSeals = this.calculateAstralSealReward(enemy, multiplier);

    // Calculate material drops
    const materials = this.calculateMaterialDrops(enemy, multiplier);

    // Calculate rare item drops
    const rareItems = this.calculateRareItemDrops(enemy);

    // Calculate boss artifacts
    const bossArtifacts = this.calculateBossArtifacts(enemy);

    return {
      arcana,
      soulPower,
      gold,
      astralSeals,
      materials,
      rareItems,
      bossArtifacts,
    };
  }

  private calculateArcanaReward(enemy: Enemy, multiplier: number): number {
    if (!this.config.enableCurrencyRewards) {
      return 0;
    }

    const baseReward = enemy.damage * 10 + enemy.health.max * 5;
    return Math.floor(baseReward * multiplier);
  }

  private calculateSoulPowerReward(enemy: Enemy, multiplier: number): number {
    if (!this.config.enableCurrencyRewards) {
      return 0;
    }

    const baseReward = enemy.damage * 2 + enemy.health.max;
    return Math.floor(baseReward * multiplier);
  }

  private calculateGoldReward(enemy: Enemy, multiplier: number): number {
    if (!this.config.enableCurrencyRewards) {
      return 0;
    }

    const baseReward = enemy.damage * 5 + enemy.health.max * 2;
    return Math.floor(baseReward * multiplier);
  }

  private calculateAstralSealReward(enemy: Enemy, multiplier: number): number {
    if (!this.config.enableCurrencyRewards) {
      return 0;
    }

    // Astral Seals are rare, only from bosses or high-level enemies
    if (enemy.isBoss || enemy.health.max > 1000) {
      return Math.floor(multiplier);
    }
    return 0;
  }

  private calculateMaterialDrops(enemy: Enemy, multiplier: number): MaterialDrop[] {
    if (!this.config.enableMaterialDrops) {
      return [];
    }

    const materials: MaterialDrop[] = [];
    const materialTypes = this.getMaterialTypesForEnemy(enemy);

    for (const materialType of materialTypes) {
      const quantity = Math.floor((1 + Math.random() * 3) * multiplier);
      if (quantity > 0) {
        materials.push({
          id: `${materialType}_${Date.now()}`,
          name: `${materialType} Material`,
          type: this.getMaterialRarity(materialType),
          quantity,
          value: this.getMaterialValue(materialType),
          source: enemy.type,
        });
      }
    }

    return materials;
  }

  private calculateRareItemDrops(enemy: Enemy): RareItem[] {
    if (!this.config.enableRareItemDrops) {
      return [];
    }

    const rareItems: RareItem[] = [];
    const dropChance = enemy.isBoss ? this.config.rareDropChance * 2 : this.config.rareDropChance;

    if (Math.random() < dropChance) {
      const itemType = this.getRandomItemType();
      const rarity = this.getRandomRarity();
      
      rareItems.push({
        id: `rare_item_${Date.now()}`,
        name: `${rarity} ${itemType}`,
        type: itemType,
        rarity,
        value: this.getItemValue(rarity),
        effects: new Map<string, unknown>([
          ['power', Math.random() * 100],
          ['durability', Math.random() * 100],
        ]),
        source: enemy.type,
      });
    }

    return rareItems;
  }

  private calculateBossArtifacts(enemy: Enemy): Artifact[] {
    if (!this.config.enableBossArtifacts || !enemy.isBoss) {
      return [];
    }

    const artifacts: Artifact[] = [];
    const dropChance = this.config.artifactDropChance;

    if (Math.random() < dropChance) {
      const artifactType = this.getRandomArtifactType();
      const rarity = this.getRandomArtifactRarity();
      
      artifacts.push({
        id: `boss_artifact_${Date.now()}`,
        name: `${rarity} ${artifactType}`,
        type: artifactType,
        rarity,
        value: this.getArtifactValue(rarity),
        effects: new Map<string, unknown>([
          ['power', Math.random() * 200],
          ['special_ability', true],
        ]),
        bossSource: enemy.type,
        description: `A powerful artifact dropped by ${enemy.type}`,
      });
    }

    return artifacts;
  }

  private createVisualEffects(enemy: Enemy, rewards: DeathRewards): VisualEffect[] {
    if (!this.config.enableVisualEffects) {
      return [];
    }

    const effects: VisualEffect[] = [];

    // Floating numbers for currency rewards
    if (this.config.enableFloatingNumbers) {
      if (rewards.arcana > 0) {
        effects.push(this.createFloatingNumberEffect(enemy.position, `+${rewards.arcana} Arcana`, 'arcana'));
      }
      if (rewards.soulPower > 0) {
        effects.push(this.createFloatingNumberEffect(enemy.position, `+${rewards.soulPower} Soul Power`, 'soul_power'));
      }
      if (rewards.gold > 0) {
        effects.push(this.createFloatingNumberEffect(enemy.position, `+${rewards.gold} Gold`, 'gold'));
      }
    }

    // Particle effects
    if (this.config.enableParticleEffects) {
      effects.push(this.createParticleEffect(enemy.position, 'death_explosion'));
    }

    // Screen shake for bosses
    if (this.config.enableScreenShake && enemy.isBoss) {
      effects.push(this.createScreenShakeEffect(0.5));
    }

    return effects;
  }

  private createProgressionUpdates(enemy: Enemy): ProgressionUpdate[] {
    if (!this.config.enableProgressionTracking) {
      return [];
    }

    const updates: ProgressionUpdate[] = [];

    // Kill count update
    updates.push({
      type: 'kill_count',
      data: {
        enemyType: enemy.type,
        enemyId: enemy.id,
        isBoss: enemy.isBoss || false,
      },
      timestamp: Date.now(),
    });

    // Boss defeat update
    if (enemy.isBoss) {
      updates.push({
        type: 'boss_defeat',
        data: {
          bossType: enemy.type,
          bossId: enemy.id,
          difficulty: enemy.health.max,
        },
        timestamp: Date.now(),
      });
    }

    // Achievement triggers
    if (this.config.enableAchievementTriggers) {
      const triggers = this.getAchievementTriggers(enemy);
      for (const trigger of triggers) {
        updates.push({
          type: 'achievement_trigger',
          data: {
            triggerId: trigger,
            enemyType: enemy.type,
            enemyId: enemy.id,
          },
          timestamp: Date.now(),
        });
      }
    }

    return updates;
  }

  private applyRewards(rewards: DeathRewards): void {
    if (!this.config.enableCurrencyRewards) {
      return;
    }

    // Apply currency rewards through drop managers
    if (rewards.arcana > 0) {
      // this.arcanaDropManager.addBalance(rewards.arcana); // Method doesn't exist yet
    }
    if (rewards.soulPower > 0) {
      // this.soulPowerDropManager.addBalance(rewards.soulPower); // Method doesn't exist yet
    }

    this.metrics.totalCurrencyRewarded += rewards.arcana + rewards.soulPower + rewards.gold + rewards.astralSeals;
  }

  private triggerVisualEffects(visualEffects: VisualEffect[]): void {
    if (!this.config.enableVisualEffects) {
      return;
    }

    for (const effect of visualEffects) {
      this.state.activeEffects.set(effect.id, effect);
      this.metrics.totalVisualEffectsCreated++;
    }
  }

  private applyProgressionUpdates(progressionUpdates: ProgressionUpdate[]): void {
    if (!this.config.enableProgressionTracking) {
      return;
    }

    for (const update of progressionUpdates) {
      switch (update.type) {
        case 'kill_count': {
          this.state.progressionTracking.totalKills++;
          const enemyType = update.data.enemyType as string;
          const currentCount = this.state.progressionTracking.killCounts.get(enemyType) || 0;
          this.state.progressionTracking.killCounts.set(enemyType, currentCount + 1);
          break;
        }
        case 'boss_defeat': {
          this.state.progressionTracking.bossKills++;
          break;
        }
        case 'achievement_trigger': {
          const triggerId = update.data.triggerId as string;
          this.state.progressionTracking.achievementTriggers.push(triggerId);
          break;
        }
      }
      this.metrics.totalProgressionUpdates++;
    }
  }

  private updateVisualEffects(_deltaTime: number): void {
    const currentTime = Date.now();
    
    for (const [effectId, effect] of this.state.activeEffects.entries()) {
      const elapsedTime = currentTime - effect.startTime;
      if (elapsedTime >= effect.duration) {
        this.state.activeEffects.delete(effectId);
      }
    }
  }

  private updatePerformanceMetrics(_deltaTime: number): void {
    if (!this.config.enablePerformanceOptimization) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - this.state.performanceMetrics.performanceScore;

    if (timeSinceLastUpdate >= this.config.performanceThreshold) {
      this.optimizePerformance();
    }
  }

  private optimizePerformance(): void {
    this.metrics.performanceOptimizations++;
  }

  private cleanupEvents(): void {
    if (this.state.combatEvents.length > 100) {
      this.state.combatEvents = this.state.combatEvents.slice(-50);
    }
  }

  private createFloatingNumberEffect(position: Vector2, text: string, type: string): VisualEffect {
    return {
      id: `floating_number_${Date.now()}`,
      type: 'floating_number',
      position: { ...position },
      duration: 2000,
      intensity: 1.0,
      data: { text, type },
      startTime: Date.now(),
    };
  }

  private createParticleEffect(position: Vector2, type: string): VisualEffect {
    return {
      id: `particle_${Date.now()}`,
      type: 'particle_burst',
      position: { ...position },
      duration: 1000,
      intensity: 1.0,
      data: { particleType: type },
      startTime: Date.now(),
    };
  }

  private createScreenShakeEffect(intensity: number): VisualEffect {
    return {
      id: `screen_shake_${Date.now()}`,
      type: 'screen_shake',
      position: { x: 0, y: 0 },
      duration: 500,
      intensity,
      data: { shakeType: 'boss_defeat' },
      startTime: Date.now(),
    };
  }

  private getMaterialTypesForEnemy(enemy: Enemy): string[] {
    const baseTypes = ['iron', 'steel', 'crystal', 'essence'];
    const bossTypes = ['dragon_scale', 'ancient_core', 'void_shard'];
    
    if (enemy.isBoss) {
      return [...baseTypes, ...bossTypes];
    }
    return baseTypes;
  }

  private getMaterialRarity(materialType: string): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
    const rarityMap: Record<string, 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'> = {
      iron: 'common',
      steel: 'uncommon',
      crystal: 'rare',
      essence: 'epic',
      dragon_scale: 'legendary',
      ancient_core: 'legendary',
      void_shard: 'legendary',
    };
    return rarityMap[materialType] || 'common';
  }

  private getMaterialValue(materialType: string): number {
    const valueMap: Record<string, number> = {
      iron: 1,
      steel: 5,
      crystal: 25,
      essence: 100,
      dragon_scale: 500,
      ancient_core: 1000,
      void_shard: 2000,
    };
    return valueMap[materialType] || 1;
  }

  private getRandomItemType(): 'weapon' | 'armor' | 'accessory' | 'consumable' | 'special' {
    const types = ['weapon', 'armor', 'accessory', 'consumable', 'special'];
    return types[Math.floor(Math.random() * types.length)] as 'weapon' | 'armor' | 'accessory' | 'consumable' | 'special';
  }

  private getRandomRarity(): 'rare' | 'epic' | 'legendary' | 'mythic' {
    const rarities = ['rare', 'epic', 'legendary', 'mythic'];
    return rarities[Math.floor(Math.random() * rarities.length)] as 'rare' | 'epic' | 'legendary' | 'mythic';
  }

  private getItemValue(rarity: string): number {
    const valueMap: Record<string, number> = {
      rare: 100,
      epic: 500,
      legendary: 2000,
      mythic: 10000,
    };
    return valueMap[rarity] || 100;
  }

  private getRandomArtifactType(): 'boss_artifact' | 'legendary_artifact' | 'mythic_artifact' {
    const types = ['boss_artifact', 'legendary_artifact', 'mythic_artifact'];
    return types[Math.floor(Math.random() * types.length)] as 'boss_artifact' | 'legendary_artifact' | 'mythic_artifact';
  }

  private getRandomArtifactRarity(): 'legendary' | 'mythic' | 'divine' {
    const rarities = ['legendary', 'mythic', 'divine'];
    return rarities[Math.floor(Math.random() * rarities.length)] as 'legendary' | 'mythic' | 'divine';
  }

  private getArtifactValue(rarity: string): number {
    const valueMap: Record<string, number> = {
      legendary: 5000,
      mythic: 25000,
      divine: 100000,
    };
    return valueMap[rarity] || 5000;
  }

  private getAchievementTriggers(enemy: Enemy): string[] {
    const triggers: string[] = [];
    
    if (enemy.isBoss) {
      triggers.push(`boss_defeat_${enemy.type}`);
    }
    
    const killCount = this.state.progressionTracking.killCounts.get(enemy.type) || 0;
    if (killCount === 10) {
      triggers.push(`kill_10_${enemy.type}`);
    } else if (killCount === 100) {
      triggers.push(`kill_100_${enemy.type}`);
    }
    
    return triggers;
  }

  private emitDeathEvent(enemy: Enemy, rewards: DeathRewards): void {
    const event: CombatEvent = {
      type: 'death',
      timestamp: Date.now(),
      source: 'death_processing_system',
      target: enemy.id,
      data: {
        enemyType: enemy.type,
        enemyId: enemy.id,
        isBoss: enemy.isBoss || false,
        rewards: {
          arcana: rewards.arcana,
          soulPower: rewards.soulPower,
          gold: rewards.gold,
          astralSeals: rewards.astralSeals,
          materialCount: rewards.materials.length,
          rareItemCount: rewards.rareItems.length,
          artifactCount: rewards.bossArtifacts.length,
        },
        dragonId: this.dragon.id,
      },
    };

    this.state.combatEvents.push(event);
  }

  private emitCombatEvent(type: string, data: Record<string, unknown>): void {
    const event: CombatEvent = {
      type: type as CombatEvent['type'],
      timestamp: Date.now(),
      source: 'death_processing_system',
      target: this.dragon.id,
      data,
    };

    this.state.combatEvents.push(event);
  }

  private createInitialState(): DeathProcessingState {
    return {
      isActive: false,
      isPaused: false,
      pendingDeaths: new Map(),
      activeEffects: new Map(),
      progressionTracking: {
        totalKills: 0,
        bossKills: 0,
        distanceProgress: 0,
        killCounts: new Map(),
        achievementTriggers: [],
      },
      performanceMetrics: {
        deathsProcessedPerSecond: 0,
        averageRewardCalculationTime: 0,
        averageVisualEffectTime: 0,
        averageProgressionUpdateTime: 0,
        performanceScore: 0,
      },
      combatEvents: [],
      combatState: {} as CombatState,
    };
  }

  private createInitialMetrics(): DeathProcessingMetrics {
    return {
      totalDeathsProcessed: 0,
      totalCurrencyRewarded: 0,
      totalMaterialsDropped: 0,
      totalRareItemsDropped: 0,
      totalBossArtifactsDropped: 0,
      totalVisualEffectsCreated: 0,
      totalProgressionUpdates: 0,
      averageRewardCalculationTime: 0,
      averageVisualEffectTime: 0,
      averageProgressionUpdateTime: 0,
      performanceOptimizations: 0,
    };
  }

  public getState(): DeathProcessingState {
    return { ...this.state };
  }

  public getMetrics(): DeathProcessingMetrics {
    return { ...this.metrics };
  }

  public getConfig(): DeathProcessingConfig {
    return { ...this.config };
  }
}
