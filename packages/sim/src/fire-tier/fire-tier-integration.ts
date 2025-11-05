/**
 * Fire Tier Integration System for Draconia Chronicles
 * Connects combat and progression with the Fire Tier system
 */

import type { CombatEvent } from '../combat/types.js';

/**
 * Fire Tier levels
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Exported for use in other files
export enum FireTierLevel {
  EMBER = 'ember',
  FLAME = 'flame',
  BLAZE = 'blaze',
  INFERNO = 'inferno',
  PHOENIX = 'phoenix'
}

/**
 * Fire Tier configuration
 */
export interface FireTierConfig {
  enableFireTierProgression: boolean;
  enableRiskStates: boolean;
  enableBreathModification: boolean;
  enableSelfHazard: boolean;
  tierThresholds: {
    ember: number;
    flame: number;
    blaze: number;
    inferno: number;
    phoenix: number;
  };
  riskStateThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  updateInterval: number;
}

/**
 * Fire Tier state
 */
export interface FireTierState {
  currentTier: FireTierLevel;
  tierProgress: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  breathModification: number;
  selfHazardLevel: number;
  totalCombatTime: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  lastUpdate: number;
}

/**
 * Fire Tier integration system
 */
export class FireTierIntegration {
  private config: FireTierConfig;
  private state: FireTierState;
  private playerProfile: { 
    arcana: number; 
    soulPower: number; 
    researchPoints: number;
    fireMastery: number;
  } = {
    arcana: 0,
    soulPower: 0,
    researchPoints: 0,
    fireMastery: 0
  };

  constructor(config: Partial<FireTierConfig> = {}) {
    this.config = {
      enableFireTierProgression: true,
      enableRiskStates: true,
      enableBreathModification: true,
      enableSelfHazard: true,
      tierThresholds: {
        ember: 0,
        flame: 1000,
        blaze: 5000,
        inferno: 15000,
        phoenix: 50000
      },
      riskStateThresholds: {
        low: 0.2,
        medium: 0.4,
        high: 0.7,
        critical: 0.9
      },
      updateInterval: 1000, // 1 second
      ...config
    };

    this.state = {
      currentTier: FireTierLevel.EMBER,
      tierProgress: 0,
      riskLevel: 'low',
      breathModification: 1.0,
      selfHazardLevel: 0.0,
      totalCombatTime: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      lastUpdate: 0
    };
  }

  /**
   * Handle combat events
   */
  public handleCombatEvent(event: CombatEvent): void {
    switch (event.type) {
      case 'damage':
        this.processDamageEvent(event);
        break;
      case 'heal':
        this.processHealingEvent(event);
        break;
      case 'status_effect':
        this.processStatusEffect(event);
        break;
    }

    this.updateFireTier();
  }

  /**
   * Process damage event
   */
  private processDamageEvent(event: CombatEvent): void {
    const data = event.data as Record<string, unknown>;
    const damage = (data.damage as number) || 0;
    const isPlayerDamage = (data.source as string) === 'player';

    if (isPlayerDamage) {
      this.state.totalDamageDealt += damage;
    } else {
      this.state.totalDamageTaken += damage;
    }
  }

  /**
   * Process healing event
   */
  private processHealingEvent(_event: CombatEvent): void {
    // Healing events can reduce risk level
    this.state.riskLevel = this.calculateRiskLevel();
  }

  /**
   * Process status effect event
   */
  private processStatusEffect(_event: CombatEvent): void {
    // Status effects can influence fire tier progression
    this.updateFireTier();
  }

  /**
   * Update fire tier based on combat performance
   */
  private updateFireTier(): void {
    if (!this.config.enableFireTierProgression) return;

    // Calculate tier progress based on combat metrics
    const combatScore = this.calculateCombatScore();
    this.state.tierProgress = combatScore;

    // Determine current tier
    const newTier = this.determineFireTier(combatScore);
    if (newTier !== this.state.currentTier) {
      this.transitionToTier(newTier);
    }

    // Update risk level
    this.state.riskLevel = this.calculateRiskLevel();

    // Update breath modification
    if (this.config.enableBreathModification) {
      this.state.breathModification = this.calculateBreathModification();
    }

    // Update self hazard level
    if (this.config.enableSelfHazard) {
      this.state.selfHazardLevel = this.calculateSelfHazardLevel();
    }
  }

  /**
   * Calculate combat score for fire tier progression
   */
  private calculateCombatScore(): number {
    const damageScore = this.state.totalDamageDealt * 0.1;
    const survivalScore = this.state.totalCombatTime * 0.01;
    const riskPenalty = this.getRiskPenalty();
    
    return Math.max(0, damageScore + survivalScore - riskPenalty);
  }

  /**
   * Determine fire tier based on score
   */
  private determineFireTier(score: number): FireTierLevel {
    if (score >= this.config.tierThresholds.phoenix) return FireTierLevel.PHOENIX;
    if (score >= this.config.tierThresholds.inferno) return FireTierLevel.INFERNO;
    if (score >= this.config.tierThresholds.blaze) return FireTierLevel.BLAZE;
    if (score >= this.config.tierThresholds.flame) return FireTierLevel.FLAME;
    return FireTierLevel.EMBER;
  }

  /**
   * Transition to new fire tier
   */
  private transitionToTier(newTier: FireTierLevel): void {
    const oldTier = this.state.currentTier;
    this.state.currentTier = newTier;

    // Apply tier-specific effects
    this.applyTierEffects(newTier, oldTier);
  }

  /**
   * Apply tier-specific effects
   */
  private applyTierEffects(newTier: FireTierLevel, _oldTier: FireTierLevel): void {
    switch (newTier) {
      case FireTierLevel.EMBER:
        this.state.breathModification = 1.0;
        this.state.selfHazardLevel = 0.0;
        break;
      case FireTierLevel.FLAME:
        this.state.breathModification = 1.2;
        this.state.selfHazardLevel = 0.1;
        break;
      case FireTierLevel.BLAZE:
        this.state.breathModification = 1.5;
        this.state.selfHazardLevel = 0.2;
        break;
      case FireTierLevel.INFERNO:
        this.state.breathModification = 2.0;
        this.state.selfHazardLevel = 0.3;
        break;
      case FireTierLevel.PHOENIX:
        this.state.breathModification = 3.0;
        this.state.selfHazardLevel = 0.4;
        break;
    }
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (!this.config.enableRiskStates) return 'low';

    const riskRatio = this.state.totalDamageTaken / Math.max(1, this.state.totalDamageDealt);
    
    if (riskRatio >= this.config.riskStateThresholds.critical) return 'critical';
    if (riskRatio >= this.config.riskStateThresholds.high) return 'high';
    if (riskRatio >= this.config.riskStateThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Calculate breath modification
   */
  private calculateBreathModification(): number {
    const baseModification = this.getTierBreathModification();
    const riskModifier = this.getRiskModifier();
    
    return baseModification * riskModifier;
  }

  /**
   * Calculate self hazard level
   */
  private calculateSelfHazardLevel(): number {
    const baseHazard = this.getTierSelfHazard();
    const riskModifier = this.getRiskModifier();
    
    return Math.min(1.0, baseHazard * riskModifier);
  }

  /**
   * Get tier-specific breath modification
   */
  private getTierBreathModification(): number {
    switch (this.state.currentTier) {
      case FireTierLevel.EMBER: return 1.0;
      case FireTierLevel.FLAME: return 1.2;
      case FireTierLevel.BLAZE: return 1.5;
      case FireTierLevel.INFERNO: return 2.0;
      case FireTierLevel.PHOENIX: return 3.0;
      default: return 1.0;
    }
  }

  /**
   * Get tier-specific self hazard
   */
  private getTierSelfHazard(): number {
    switch (this.state.currentTier) {
      case FireTierLevel.EMBER: return 0.0;
      case FireTierLevel.FLAME: return 0.1;
      case FireTierLevel.BLAZE: return 0.2;
      case FireTierLevel.INFERNO: return 0.3;
      case FireTierLevel.PHOENIX: return 0.4;
      default: return 0.0;
    }
  }

  /**
   * Get risk modifier
   */
  private getRiskModifier(): number {
    switch (this.state.riskLevel) {
      case 'low': return 0.8;
      case 'medium': return 1.0;
      case 'high': return 1.2;
      case 'critical': return 1.5;
      default: return 1.0;
    }
  }

  /**
   * Get risk penalty
   */
  private getRiskPenalty(): number {
    switch (this.state.riskLevel) {
      case 'low': return 0;
      case 'medium': return 100;
      case 'high': return 500;
      case 'critical': return 1000;
      default: return 0;
    }
  }

  /**
   * Update combat time
   */
  public updateCombatTime(deltaTime: number): void {
    this.state.totalCombatTime += deltaTime;
  }

  /**
   * Check if safety node is unlocked
   */
  public isSafetyNodeUnlocked(_nodeId: string): boolean {
    // This would integrate with the actual research system
    // For now, return true for basic safety nodes
    return this.state.currentTier !== FireTierLevel.EMBER;
  }

  /**
   * Get fire tier state
   */
  public getState(): FireTierState {
    return { ...this.state };
  }

  /**
   * Get current fire tier
   */
  public getCurrentTier(): FireTierLevel {
    return this.state.currentTier;
  }

  /**
   * Get tier progress
   */
  public getTierProgress(): number {
    return this.state.tierProgress;
  }

  /**
   * Get risk level
   */
  public getRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    return this.state.riskLevel;
  }

  /**
   * Get breath modification
   */
  public getBreathModification(): number {
    return this.state.breathModification;
  }

  /**
   * Get self hazard level
   */
  public getSelfHazardLevel(): number {
    return this.state.selfHazardLevel;
  }

  /**
   * Update the system
   */
  public update(deltaTime: number): void {
    const currentTime = Date.now();
    
    if (currentTime - this.state.lastUpdate < this.config.updateInterval) {
      return;
    }

    this.state.lastUpdate = currentTime;
    this.updateCombatTime(deltaTime);
    this.updateFireTier();
  }

  /**
   * Reset the system
   */
  public reset(): void {
    this.state = {
      currentTier: FireTierLevel.EMBER,
      tierProgress: 0,
      riskLevel: 'low',
      breathModification: 1.0,
      selfHazardLevel: 0.0,
      totalCombatTime: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      lastUpdate: 0
    };

    this.playerProfile = {
      arcana: 0,
      soulPower: 0,
      researchPoints: 0,
      fireMastery: 0
    };
  }
}
