/**
 * Research Discovery Integration System for Draconia Chronicles
 * Integrates combat events with research discovery milestones
 */

import type { CombatEvent } from '../combat/types.js';

/**
 * Research milestone types
 */
export interface ResearchMilestone {
  id: string;
  type: 'combat' | 'exploration' | 'survival' | 'discovery';
  threshold: number;
  description: string;
  rewards: {
    arcana?: number;
    soulPower?: number;
    researchPoints?: number;
  };
  unlocked: boolean;
  progress: number;
}

/**
 * Research discovery configuration
 */
export interface ResearchDiscoveryConfig {
  enableCombatMilestones: boolean;
  enableExplorationMilestones: boolean;
  enableSurvivalMilestones: boolean;
  enableDiscoveryMilestones: boolean;
  milestoneThresholds: {
    enemiesDefeated: number;
    bossesDefeated: number;
    distanceTraveled: number;
    timeSurvived: number;
    discoveriesMade: number;
  };
  updateInterval: number;
}

/**
 * Research discovery state
 */
export interface ResearchDiscoveryState {
  totalEnemiesDefeated: number;
  totalBossesDefeated: number;
  totalDistanceTraveled: number;
  totalTimeSurvived: number;
  totalDiscoveriesMade: number;
  unlockedMilestones: string[];
  activeResearch: string[];
  lastUpdate: number;
}

/**
 * Research discovery integration system
 */
export class ResearchDiscoveryIntegration {
  private config: ResearchDiscoveryConfig;
  private state: ResearchDiscoveryState;
  private milestones: Map<string, ResearchMilestone> = new Map();
  private playerProfile: { arcana: number; soulPower: number; researchPoints: number } = {
    arcana: 0,
    soulPower: 0,
    researchPoints: 0
  };

  constructor(config: Partial<ResearchDiscoveryConfig> = {}) {
    this.config = {
      enableCombatMilestones: true,
      enableExplorationMilestones: true,
      enableSurvivalMilestones: true,
      enableDiscoveryMilestones: true,
      milestoneThresholds: {
        enemiesDefeated: 10,
        bossesDefeated: 1,
        distanceTraveled: 1000,
        timeSurvived: 3600000, // 1 hour in ms
        discoveriesMade: 5
      },
      updateInterval: 1000, // 1 second
      ...config
    };

    this.state = {
      totalEnemiesDefeated: 0,
      totalBossesDefeated: 0,
      totalDistanceTraveled: 0,
      totalTimeSurvived: 0,
      totalDiscoveriesMade: 0,
      unlockedMilestones: [],
      activeResearch: [],
      lastUpdate: 0
    };

    this.initializeMilestones();
  }

  /**
   * Initialize research milestones
   */
  private initializeMilestones(): void {
    // Combat milestones
    if (this.config.enableCombatMilestones) {
      this.addMilestone({
        id: 'first_enemy_defeated',
        type: 'combat',
        threshold: 1,
        description: 'Defeat your first enemy',
        rewards: { arcana: 10, researchPoints: 5 },
        unlocked: false,
        progress: 0
      });

      this.addMilestone({
        id: 'enemy_slayer',
        type: 'combat',
        threshold: this.config.milestoneThresholds.enemiesDefeated,
        description: `Defeat ${this.config.milestoneThresholds.enemiesDefeated} enemies`,
        rewards: { arcana: 100, soulPower: 50, researchPoints: 25 },
        unlocked: false,
        progress: 0
      });

      this.addMilestone({
        id: 'boss_slayer',
        type: 'combat',
        threshold: this.config.milestoneThresholds.bossesDefeated,
        description: `Defeat ${this.config.milestoneThresholds.bossesDefeated} boss`,
        rewards: { arcana: 500, soulPower: 250, researchPoints: 100 },
        unlocked: false,
        progress: 0
      });
    }

    // Exploration milestones
    if (this.config.enableExplorationMilestones) {
      this.addMilestone({
        id: 'first_journey',
        type: 'exploration',
        threshold: 100,
        description: 'Travel 100 units',
        rewards: { arcana: 25, researchPoints: 10 },
        unlocked: false,
        progress: 0
      });

      this.addMilestone({
        id: 'explorer',
        type: 'exploration',
        threshold: this.config.milestoneThresholds.distanceTraveled,
        description: `Travel ${this.config.milestoneThresholds.distanceTraveled} units`,
        rewards: { arcana: 200, soulPower: 100, researchPoints: 50 },
        unlocked: false,
        progress: 0
      });
    }

    // Survival milestones
    if (this.config.enableSurvivalMilestones) {
      this.addMilestone({
        id: 'survivor',
        type: 'survival',
        threshold: this.config.milestoneThresholds.timeSurvived,
        description: `Survive for ${Math.floor(this.config.milestoneThresholds.timeSurvived / 60000)} minutes`,
        rewards: { arcana: 300, soulPower: 150, researchPoints: 75 },
        unlocked: false,
        progress: 0
      });
    }

    // Discovery milestones
    if (this.config.enableDiscoveryMilestones) {
      this.addMilestone({
        id: 'discoverer',
        type: 'discovery',
        threshold: this.config.milestoneThresholds.discoveriesMade,
        description: `Make ${this.config.milestoneThresholds.discoveriesMade} discoveries`,
        rewards: { arcana: 400, soulPower: 200, researchPoints: 100 },
        unlocked: false,
        progress: 0
      });
    }
  }

  /**
   * Add a research milestone
   */
  private addMilestone(milestone: ResearchMilestone): void {
    this.milestones.set(milestone.id, milestone);
  }

  /**
   * Handle combat events
   */
  public handleCombatEvent(event: CombatEvent): void {
    switch (event.type) {
      case 'death':
        this.processEnemyDeath(event);
        break;
      case 'damage':
        this.processDamageDealt(event);
        break;
      case 'status_effect':
        this.processElementalWeakness(event);
        break;
      case 'heal':
        this.processHealing(event);
        break;
      case 'recovery':
        this.processRecovery(event);
        break;
    }

    this.updateMilestones();
  }

  /**
   * Process enemy death event
   */
  private processEnemyDeath(event: CombatEvent): void {
    const data = event.data as Record<string, unknown>;
    const isBoss = data.isBoss as boolean;
    
    if (isBoss) {
      this.state.totalBossesDefeated++;
    } else {
      this.state.totalEnemiesDefeated++;
    }
  }

  /**
   * Process damage dealt event
   */
  private processDamageDealt(_event: CombatEvent): void {
    // Track damage patterns for research insights
    // This could unlock specific research nodes based on damage types
  }

  /**
   * Process elemental weakness exploitation
   */
  private processElementalWeakness(_event: CombatEvent): void {
    // Track elemental mastery for research
    // This could unlock elemental research nodes
  }

  /**
   * Process healing event
   */
  private processHealing(_event: CombatEvent): void {
    // Track healing patterns for survival research
  }

  /**
   * Process recovery event
   */
  private processRecovery(_event: CombatEvent): void {
    // Track recovery patterns for resilience research
  }

  /**
   * Update distance milestone
   */
  public updateDistanceMilestone(distance: number): void {
    this.state.totalDistanceTraveled += distance;
    this.updateMilestones();
  }

  /**
   * Update survival milestone
   */
  public updateSurvivalTime(deltaTime: number): void {
    this.state.totalTimeSurvived += deltaTime;
    this.updateMilestones();
  }

  /**
   * Update discovery milestone
   */
  public updateDiscoveryMilestone(): void {
    this.state.totalDiscoveriesMade++;
    this.updateMilestones();
  }

  /**
   * Update all milestones
   */
  private updateMilestones(): void {
    for (const [id, milestone] of this.milestones) {
      if (milestone.unlocked) continue;

      let progress = 0;
      switch (milestone.type) {
        case 'combat':
          if (milestone.id === 'boss_slayer') {
            progress = this.state.totalBossesDefeated;
          } else {
            progress = this.state.totalEnemiesDefeated;
          }
          break;
        case 'exploration':
          progress = this.state.totalDistanceTraveled;
          break;
        case 'survival':
          progress = this.state.totalTimeSurvived;
          break;
        case 'discovery':
          progress = this.state.totalDiscoveriesMade;
          break;
      }

      milestone.progress = progress;

      if (progress >= milestone.threshold) {
        this.unlockMilestone(id);
      }
    }
  }

  /**
   * Unlock a research milestone
   */
  private unlockMilestone(milestoneId: string): void {
    const milestone = this.milestones.get(milestoneId);
    if (!milestone || milestone.unlocked) return;

    milestone.unlocked = true;
    this.state.unlockedMilestones.push(milestoneId);

    // Apply rewards
    if (milestone.rewards.arcana) {
      this.playerProfile.arcana += milestone.rewards.arcana;
    }
    if (milestone.rewards.soulPower) {
      this.playerProfile.soulPower += milestone.rewards.soulPower;
    }
    if (milestone.rewards.researchPoints) {
      this.playerProfile.researchPoints += milestone.rewards.researchPoints;
    }

    // Trigger research discovery
    this.triggerResearchDiscovery(milestone);
  }

  /**
   * Trigger research discovery
   */
  private triggerResearchDiscovery(milestone: ResearchMilestone): void {
    // This would integrate with the actual research system
    // For now, we'll just track the discovery
    this.state.activeResearch.push(milestone.id);
  }

  /**
   * Get milestone progress
   */
  public getMilestoneProgress(milestoneId: string): { progress: number; threshold: number; unlocked: boolean } | null {
    const milestone = this.milestones.get(milestoneId);
    if (!milestone) return null;

    return {
      progress: milestone.progress,
      threshold: milestone.threshold,
      unlocked: milestone.unlocked
    };
  }

  /**
   * Get all milestones
   */
  public getAllMilestones(): ResearchMilestone[] {
    return Array.from(this.milestones.values());
  }

  /**
   * Get unlocked milestones
   */
  public getUnlockedMilestones(): ResearchMilestone[] {
    return Array.from(this.milestones.values()).filter(m => m.unlocked);
  }

  /**
   * Get research discovery state
   */
  public getState(): ResearchDiscoveryState {
    return { ...this.state };
  }

  /**
   * Get player profile
   */
  public getPlayerProfile(): { arcana: number; soulPower: number; researchPoints: number } {
    return { ...this.playerProfile };
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
    this.updateSurvivalTime(deltaTime);
  }

  /**
   * Reset the system
   */
  public reset(): void {
    this.state = {
      totalEnemiesDefeated: 0,
      totalBossesDefeated: 0,
      totalDistanceTraveled: 0,
      totalTimeSurvived: 0,
      totalDiscoveriesMade: 0,
      unlockedMilestones: [],
      activeResearch: [],
      lastUpdate: 0
    };

    this.playerProfile = {
      arcana: 0,
      soulPower: 0,
      researchPoints: 0
    };

    // Reset all milestones
    for (const milestone of this.milestones.values()) {
      milestone.unlocked = false;
      milestone.progress = 0;
    }
  }
}
