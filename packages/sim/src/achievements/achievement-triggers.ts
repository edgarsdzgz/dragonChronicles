/**
 * Achievement Triggers System for Draconia Chronicles
 * Manages achievement unlocks based on game events
 */

import type { CombatEvent } from '../combat/types.js';

/**
 * Achievement types
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Exported for use in other files
export enum AchievementType {
  COMBAT = 'combat',
  EXPLORATION = 'exploration',
  SURVIVAL = 'survival',
  DISCOVERY = 'discovery',
  MASTERY = 'mastery',
  COLLECTION = 'collection',
  TIME_BASED = 'time_based',
  SPECIAL = 'special'
}

/**
 * Achievement rarities
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Exported for use in other files
export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

/**
 * Achievement status
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Exported for use in other files
export enum AchievementStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed'
}

/**
 * Achievement requirement
 */
export interface AchievementRequirement {
  type: string;
  threshold: number;
  condition?: string;
  description: string;
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  rarity: AchievementRarity;
  status: AchievementStatus;
  requirements: AchievementRequirement[];
  rewards: {
    arcana?: number;
    soulPower?: number;
    researchPoints?: number;
    items?: string[];
  };
  progress: number;
  unlockedAt?: number;
  completedAt?: number;
  claimedAt?: number;
}

/**
 * Achievement trigger configuration
 */
export interface AchievementTriggerConfig {
  enableCombatAchievements: boolean;
  enableExplorationAchievements: boolean;
  enableSurvivalAchievements: boolean;
  enableDiscoveryAchievements: boolean;
  enableMasteryAchievements: boolean;
  enableCollectionAchievements: boolean;
  enableTimeBasedAchievements: boolean;
  enableSpecialAchievements: boolean;
  updateInterval: number;
}

/**
 * Achievement trigger state
 */
export interface AchievementTriggerState {
  totalEnemiesDefeated: number;
  totalBossesDefeated: number;
  totalDistanceTraveled: number;
  totalTimeSurvived: number;
  totalDiscoveriesMade: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealingReceived: number;
  totalElementalWeaknessesExploited: number;
  unlockedAchievements: string[];
  completedAchievements: string[];
  claimedAchievements: string[];
  lastUpdate: number;
}

/**
 * Achievement triggers system
 */
export class AchievementTriggers {
  private config: AchievementTriggerConfig;
  private state: AchievementTriggerState;
  private achievements: Map<string, Achievement> = new Map();
  private playerProfile: { 
    arcana: number; 
    soulPower: number; 
    researchPoints: number;
    level: number;
  } = {
    arcana: 0,
    soulPower: 0,
    researchPoints: 0,
    level: 1
  };

  constructor(config: Partial<AchievementTriggerConfig> = {}) {
    this.config = {
      enableCombatAchievements: true,
      enableExplorationAchievements: true,
      enableSurvivalAchievements: true,
      enableDiscoveryAchievements: true,
      enableMasteryAchievements: true,
      enableCollectionAchievements: true,
      enableTimeBasedAchievements: true,
      enableSpecialAchievements: true,
      updateInterval: 1000, // 1 second
      ...config
    };

    this.state = {
      totalEnemiesDefeated: 0,
      totalBossesDefeated: 0,
      totalDistanceTraveled: 0,
      totalTimeSurvived: 0,
      totalDiscoveriesMade: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalHealingReceived: 0,
      totalElementalWeaknessesExploited: 0,
      unlockedAchievements: [],
      completedAchievements: [],
      claimedAchievements: [],
      lastUpdate: 0
    };

    this.initializeAchievements();
  }

  /**
   * Initialize achievements
   */
  private initializeAchievements(): void {
    // Combat achievements
    if (this.config.enableCombatAchievements) {
      this.addAchievement({
        id: 'first_kill',
        name: 'First Blood',
        description: 'Defeat your first enemy',
        type: AchievementType.COMBAT,
        rarity: AchievementRarity.COMMON,
        status: AchievementStatus.LOCKED,
        requirements: [{
          type: 'enemies_defeated',
          threshold: 1,
          description: 'Defeat 1 enemy'
        }],
        rewards: { arcana: 50, researchPoints: 10 },
        progress: 0
      });

      this.addAchievement({
        id: 'enemy_slayer',
        name: 'Enemy Slayer',
        description: 'Defeat 100 enemies',
        type: AchievementType.COMBAT,
        rarity: AchievementRarity.UNCOMMON,
        status: AchievementStatus.LOCKED,
        requirements: [{
          type: 'enemies_defeated',
          threshold: 100,
          description: 'Defeat 100 enemies'
        }],
        rewards: { arcana: 500, soulPower: 100, researchPoints: 50 },
        progress: 0
      });

      this.addAchievement({
        id: 'boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat 10 bosses',
        type: AchievementType.COMBAT,
        rarity: AchievementRarity.RARE,
        status: AchievementStatus.LOCKED,
        requirements: [{
          type: 'bosses_defeated',
          threshold: 10,
          description: 'Defeat 10 bosses'
        }],
        rewards: { arcana: 1000, soulPower: 500, researchPoints: 100 },
        progress: 0
      });
    }

    // Exploration achievements
    if (this.config.enableExplorationAchievements) {
      this.addAchievement({
        id: 'explorer',
        name: 'Explorer',
        description: 'Travel 1000 units',
        type: AchievementType.EXPLORATION,
        rarity: AchievementRarity.COMMON,
        status: AchievementStatus.LOCKED,
        requirements: [{
          type: 'distance_traveled',
          threshold: 1000,
          description: 'Travel 1000 units'
        }],
        rewards: { arcana: 200, researchPoints: 25 },
        progress: 0
      });
    }

    // Survival achievements
    if (this.config.enableSurvivalAchievements) {
      this.addAchievement({
        id: 'survivor',
        name: 'Survivor',
        description: 'Survive for 1 hour',
        type: AchievementType.SURVIVAL,
        rarity: AchievementRarity.UNCOMMON,
        status: AchievementStatus.LOCKED,
        requirements: [{
          type: 'time_survived',
          threshold: 3600000, // 1 hour in ms
          description: 'Survive for 1 hour'
        }],
        rewards: { arcana: 300, soulPower: 150, researchPoints: 75 },
        progress: 0
      });
    }

    // Discovery achievements
    if (this.config.enableDiscoveryAchievements) {
      this.addAchievement({
        id: 'discoverer',
        name: 'Discoverer',
        description: 'Make 10 discoveries',
        type: AchievementType.DISCOVERY,
        rarity: AchievementRarity.RARE,
        status: AchievementStatus.LOCKED,
        requirements: [{
          type: 'discoveries_made',
          threshold: 10,
          description: 'Make 10 discoveries'
        }],
        rewards: { arcana: 800, soulPower: 400, researchPoints: 200 },
        progress: 0
      });
    }
  }

  /**
   * Add an achievement
   */
  private addAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
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

    this.updateAchievements();
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
  private processDamageDealt(event: CombatEvent): void {
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
   * Process elemental weakness exploitation
   */
  private processElementalWeakness(_event: CombatEvent): void {
    this.state.totalElementalWeaknessesExploited++;
  }

  /**
   * Process healing event
   */
  private processHealing(event: CombatEvent): void {
    const data = event.data as Record<string, unknown>;
    const healing = (data.healing as number) || 0;
    this.state.totalHealingReceived += healing;
  }

  /**
   * Process recovery event
   */
  private processRecovery(_event: CombatEvent): void {
    // Track recovery patterns
  }

  /**
   * Update distance milestone
   */
  public updateDistanceMilestone(distance: number): void {
    this.state.totalDistanceTraveled += distance;
    this.updateAchievements();
  }

  /**
   * Update survival milestone
   */
  public updateSurvivalTime(deltaTime: number): void {
    this.state.totalTimeSurvived += deltaTime;
    this.updateAchievements();
  }

  /**
   * Update discovery milestone
   */
  public updateDiscoveryMilestone(): void {
    this.state.totalDiscoveriesMade++;
    this.updateAchievements();
  }

  /**
   * Update all achievements
   */
  private updateAchievements(): void {
    for (const [id, achievement] of this.achievements) {
      if (achievement.status === AchievementStatus.COMPLETED || 
          achievement.status === AchievementStatus.CLAIMED) {
        continue;
      }

      this.updateAchievementProgress(achievement);
      
      if (this.isAchievementCompleted(achievement)) {
        this.completeAchievement(id);
      }
    }
  }

  /**
   * Update achievement progress
   */
  private updateAchievementProgress(achievement: Achievement): void {
    let progress = 0;
    
    for (const requirement of achievement.requirements) {
      const requirementProgress = this.getRequirementProgress(requirement);
      progress = Math.max(progress, requirementProgress);
    }

    achievement.progress = progress;
    
    if (progress > 0 && achievement.status === AchievementStatus.LOCKED) {
      achievement.status = AchievementStatus.IN_PROGRESS;
    }
  }

  /**
   * Get requirement progress
   */
  private getRequirementProgress(requirement: AchievementRequirement): number {
    switch (requirement.type) {
      case 'enemies_defeated':
        return Math.min(1, this.state.totalEnemiesDefeated / requirement.threshold);
      case 'bosses_defeated':
        return Math.min(1, this.state.totalBossesDefeated / requirement.threshold);
      case 'distance_traveled':
        return Math.min(1, this.state.totalDistanceTraveled / requirement.threshold);
      case 'time_survived':
        return Math.min(1, this.state.totalTimeSurvived / requirement.threshold);
      case 'discoveries_made':
        return Math.min(1, this.state.totalDiscoveriesMade / requirement.threshold);
      case 'damage_dealt':
        return Math.min(1, this.state.totalDamageDealt / requirement.threshold);
      case 'damage_taken':
        return Math.min(1, this.state.totalDamageTaken / requirement.threshold);
      case 'healing_received':
        return Math.min(1, this.state.totalHealingReceived / requirement.threshold);
      case 'elemental_weaknesses':
        return Math.min(1, this.state.totalElementalWeaknessesExploited / requirement.threshold);
      default:
        return 0;
    }
  }

  /**
   * Check if achievement is completed
   */
  private isAchievementCompleted(achievement: Achievement): boolean {
    for (const requirement of achievement.requirements) {
      const progress = this.getRequirementProgress(requirement);
      if (progress < 1) {
        return false;
      }
    }
    return true;
  }

  /**
   * Complete an achievement
   */
  private completeAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.status === AchievementStatus.COMPLETED) return;

    achievement.status = AchievementStatus.COMPLETED;
    achievement.completedAt = Date.now();
    this.state.completedAchievements.push(achievementId);

    // Apply rewards
    this.applyAchievementRewards(achievement);
  }

  /**
   * Apply achievement rewards
   */
  private applyAchievementRewards(achievement: Achievement): void {
    if (achievement.rewards.arcana) {
      this.playerProfile.arcana += achievement.rewards.arcana;
    }
    if (achievement.rewards.soulPower) {
      this.playerProfile.soulPower += achievement.rewards.soulPower;
    }
    if (achievement.rewards.researchPoints) {
      this.playerProfile.researchPoints += achievement.rewards.researchPoints;
    }
    // Items would be handled by the inventory system
  }

  /**
   * Claim an achievement
   */
  public claimAchievement(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.status !== AchievementStatus.COMPLETED) {
      return false;
    }

    achievement.status = AchievementStatus.CLAIMED;
    achievement.claimedAt = Date.now();
    this.state.claimedAchievements.push(achievementId);
    
    return true;
  }

  /**
   * Get achievement progress
   */
  public getAchievementProgress(achievementId: string): { progress: number; requirements: AchievementRequirement[] } | null {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return null;

    return {
      progress: achievement.progress,
      requirements: achievement.requirements
    };
  }

  /**
   * Get all achievements
   */
  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => 
      a.status === AchievementStatus.IN_PROGRESS || 
      a.status === AchievementStatus.COMPLETED || 
      a.status === AchievementStatus.CLAIMED
    );
  }

  /**
   * Get completed achievements
   */
  public getCompletedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => 
      a.status === AchievementStatus.COMPLETED || 
      a.status === AchievementStatus.CLAIMED
    );
  }

  /**
   * Get achievement trigger state
   */
  public getState(): AchievementTriggerState {
    return { ...this.state };
  }

  /**
   * Get player profile
   */
  public getPlayerProfile(): { arcana: number; soulPower: number; researchPoints: number; level: number } {
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
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalHealingReceived: 0,
      totalElementalWeaknessesExploited: 0,
      unlockedAchievements: [],
      completedAchievements: [],
      claimedAchievements: [],
      lastUpdate: 0
    };

    this.playerProfile = {
      arcana: 0,
      soulPower: 0,
      researchPoints: 0,
      level: 1
    };

    // Reset all achievements
    for (const achievement of this.achievements.values()) {
      achievement.status = AchievementStatus.LOCKED;
      achievement.progress = 0;
      delete achievement.unlockedAt;
      delete achievement.completedAt;
      delete achievement.claimedAt;
    }
  }
}
