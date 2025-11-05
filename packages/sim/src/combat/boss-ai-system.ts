/**
 * Boss AI System
 * 
 * Implements sophisticated boss AI with phase transitions, special abilities,
 * and environmental interactions. Based on Draconia's Heartwood Abomination boss.
 */

import type {
  Dragon,
  Enemy,
  CombatState,
  CombatEvent,
  Vector2,
} from './types.js';

/**
 * Boss AI Configuration
 */
export interface BossAIConfig {
  enablePhaseTransitions: boolean;
  enableSpecialAbilities: boolean;
  enableEnvironmentalInteraction: boolean;
  enableThreatAssessment: boolean;
  phaseTransitionCooldown: number;
  abilityCooldownReduction: number;
  threatAssessmentInterval: number;
  environmentalElementLifetime: number;
  maxConcurrentAbilities: number;
  performanceOptimization: boolean;
}

/**
 * Boss Phase Definition
 */
export interface BossPhase {
  id: string;
  name: string;
  healthThreshold: number;
  behavior: BossBehavior;
  specialAbilities: BossSpecialAbility[];
  environmentalElements: EnvironmentalElement[];
  phaseTransitionEffects: BossAbilityEffect[];
}

/**
 * Boss Behavior Configuration
 */
export interface BossBehavior {
  movementPattern: 'stationary' | 'patrol' | 'aggressive' | 'defensive';
  attackFrequency: number;
  repositionFrequency: number;
  threatResponse: 'ignore' | 'moderate' | 'aggressive';
  formationControl: boolean;
  environmentalAwareness: boolean;
}

/**
 * Boss Special Ability
 */
export interface BossSpecialAbility {
  id: string;
  name: string;
  cooldown: number;
  channelDuration: number;
  range: number;
  areaOfEffect: number;
  effects: BossAbilityEffect[];
  requirements: BossAbilityRequirement[];
  visualEffects: BossVisualEffect[];
  audioEffects: BossAudioEffect[];
  lastUsed: number;
}

/**
 * Boss Ability Effect
 */
export interface BossAbilityEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'environmental' | 'summon';
  target: 'self' | 'enemy' | 'area' | 'environmental';
  value: number;
  duration?: number;
  elementalType?: string;
  description: string;
}

/**
 * Boss Ability Requirement
 */
export interface BossAbilityRequirement {
  type: 'health' | 'phase' | 'environmental' | 'cooldown' | 'resource';
  value: number;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
}

/**
 * Environmental Element
 */
export interface EnvironmentalElement {
  id: string;
  type: string;
  position: Vector2;
  lifetime: number;
  effects: EnvironmentalEffect[];
  destructible: boolean;
  health?: number;
  maxHealth?: number;
}

/**
 * Environmental Effect
 */
export interface EnvironmentalEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'movement' | 'visibility';
  target: 'enemy' | 'boss' | 'area';
  value: number;
  duration: number;
  radius: number;
  elementalType?: string;
}

/**
 * Boss Visual Effect
 */
export interface BossVisualEffect {
  type: 'particle' | 'animation' | 'screen_shake' | 'color_change' | 'lighting';
  duration: number;
  intensity: number;
  position?: Vector2;
  color?: string;
  size?: number;
}

/**
 * Boss Audio Effect
 */
export interface BossAudioEffect {
  type: 'sound' | 'music' | 'ambient';
  soundId: string;
  volume: number;
  pitch: number;
  loop: boolean;
  duration?: number;
}

/**
 * Boss AI State
 */
export interface BossAIState {
  currentPhase: BossPhase;
  phaseHistory: string[];
  lastPhaseTransition: number;
  specialAbilities: BossSpecialAbility[];
  environmentalElements: EnvironmentalElement[];
  threatLevel: number;
  isChanneling: boolean;
  channelingAbility: BossSpecialAbility | null;
  channelingStartTime: number;
  channelingDuration: number;
  lastThreatAssessment: number;
  performanceMetrics: {
    phaseTransitionsPerSecond: number;
    specialAbilitiesPerSecond: number;
    environmentalInteractionsPerSecond: number;
    threatAssessmentsPerSecond: number;
    performanceScore: number;
  };
}

/**
 * Boss AI System
 */
export class BossAISystem {
  private config: BossAIConfig;
  private bossAIState!: BossAIState;
  private phases: Map<string, BossPhase>;
  private currentBoss: Enemy | null = null;
  private dragon: Dragon | null = null;
  private combatState: CombatState | null = null;

  constructor(config: Partial<BossAIConfig> = {}) {
    this.config = {
      enablePhaseTransitions: true,
      enableSpecialAbilities: true,
      enableEnvironmentalInteraction: true,
      enableThreatAssessment: true,
      phaseTransitionCooldown: 2000,
      abilityCooldownReduction: 0.1,
      threatAssessmentInterval: 1000,
      environmentalElementLifetime: 10000,
      maxConcurrentAbilities: 3,
      performanceOptimization: true,
      ...config,
    };

    this.phases = new Map();
    this.initializeHeartwoodAbominationPhases();
    this.initializeBossAIState();
  }

  /**
   * Initialize Heartwood Abomination boss phases
   */
  private initializeHeartwoodAbominationPhases(): void {
    // Phase 1: Seed Circuit (100%-70% health)
    const phase1: BossPhase = {
      id: 'seed_circuit',
      name: 'Seed Circuit',
      healthThreshold: 0.7,
      behavior: {
        movementPattern: 'stationary',
        attackFrequency: 0.5,
        repositionFrequency: 0.2,
        threatResponse: 'moderate',
        formationControl: false,
        environmentalAwareness: true,
      },
      specialAbilities: [
        {
          id: 'barrier_seeds',
          name: 'Barrier Seeds',
          cooldown: 8000,
          channelDuration: 2000,
          range: 300,
          areaOfEffect: 150,
        effects: [
          {
            type: 'environmental',
            target: 'area',
            value: 0,
            duration: 15000,
            elementalType: 'fire',
            description: 'Creates rotating barrier seeds that provide damage reduction',
          },
        ],
        lastUsed: 0,
          requirements: [
            {
              type: 'health',
              value: 0.7,
              operator: 'greater_than',
            },
          ],
          visualEffects: [
            {
              type: 'particle',
              duration: 2000,
              intensity: 0.8,
              color: '#ff6b35',
              size: 1.5,
            },
          ],
          audioEffects: [
            {
              type: 'sound',
              soundId: 'barrier_seeds_cast',
              volume: 0.7,
              pitch: 1.0,
              loop: false,
              duration: 2000,
            },
          ],
        },
      ],
      environmentalElements: [],
      phaseTransitionEffects: [
        {
          type: 'buff',
          target: 'self',
          value: 0.18,
          duration: 5000,
          description: 'Briar Aegis - 18% damage reduction while 2+ pyres are lit',
        },
      ],
    };

    // Phase 2: Palisade Garden (70%-30% health)
    const phase2: BossPhase = {
      id: 'palisade_garden',
      name: 'Palisade Garden',
      healthThreshold: 0.3,
      behavior: {
        movementPattern: 'patrol',
        attackFrequency: 0.7,
        repositionFrequency: 0.4,
        threatResponse: 'aggressive',
        formationControl: true,
        environmentalAwareness: true,
      },
      specialAbilities: [
        {
          id: 'thorn_palisades',
          name: 'Thorn Palisades',
          cooldown: 6000,
          channelDuration: 1500,
          range: 400,
          areaOfEffect: 200,
        effects: [
          {
            type: 'environmental',
            target: 'area',
            value: 0,
            duration: 12000,
            elementalType: 'fire',
            description: 'Raises thorn palisades in lanes with cinder turrets',
          },
        ],
        lastUsed: 0,
          requirements: [
            {
              type: 'health',
              value: 0.3,
              operator: 'greater_than',
            },
          ],
          visualEffects: [
            {
              type: 'animation',
              duration: 1500,
              intensity: 1.0,
              color: '#8b4513',
              size: 2.0,
            },
          ],
          audioEffects: [
            {
              type: 'sound',
              soundId: 'thorn_palisades_cast',
              volume: 0.8,
              pitch: 0.9,
              loop: false,
              duration: 1500,
            },
          ],
        },
      ],
      environmentalElements: [],
      phaseTransitionEffects: [
        {
          type: 'buff',
          target: 'self',
          value: 0.25,
          duration: 8000,
          description: 'Thorn Mastery - 25% increased damage and area control',
        },
      ],
    };

    // Phase 3: Sap Boil (30%-0% health)
    const phase3: BossPhase = {
      id: 'sap_boil',
      name: 'Sap Boil',
      healthThreshold: 0.0,
      behavior: {
        movementPattern: 'aggressive',
        attackFrequency: 1.0,
        repositionFrequency: 0.6,
        threatResponse: 'aggressive',
        formationControl: true,
        environmentalAwareness: true,
      },
      specialAbilities: [
        {
          id: 'entangle_nova',
          name: 'Entangle Nova',
          cooldown: 4000,
          channelDuration: 1000,
          range: 500,
          areaOfEffect: 300,
        effects: [
          {
            type: 'damage',
            target: 'area',
            value: 60,
            duration: 0,
            elementalType: 'fire',
            description: 'Massive area damage with entangle effect',
          },
          {
            type: 'debuff',
            target: 'enemy',
            value: 0.3,
            duration: 3000,
            description: 'Movement speed reduced by 30%',
          },
        ],
        lastUsed: 0,
          requirements: [
            {
              type: 'health',
              value: 0.3,
              operator: 'less_than',
            },
          ],
          visualEffects: [
            {
              type: 'screen_shake',
              duration: 1000,
              intensity: 1.2,
            },
            {
              type: 'particle',
              duration: 2000,
              intensity: 1.5,
              color: '#ff4500',
              size: 3.0,
            },
          ],
          audioEffects: [
            {
              type: 'sound',
              soundId: 'entangle_nova_cast',
              volume: 1.0,
              pitch: 0.8,
              loop: false,
              duration: 1000,
            },
          ],
        },
      ],
      environmentalElements: [],
      phaseTransitionEffects: [
        {
          type: 'buff',
          target: 'self',
          value: 0.4,
          duration: 10000,
          description: 'Sap Fury - 40% increased damage and ability frequency',
        },
      ],
    };

    this.phases.set('seed_circuit', phase1);
    this.phases.set('palisade_garden', phase2);
    this.phases.set('sap_boil', phase3);
  }

  /**
   * Initialize boss AI state
   */
  private initializeBossAIState(): void {
    const initialPhase = this.phases.get('seed_circuit');
    if (!initialPhase) {
      throw new Error('Failed to initialize boss AI - no phases available');
    }

    this.bossAIState = {
      currentPhase: initialPhase,
      phaseHistory: ['seed_circuit'],
      lastPhaseTransition: 0,
      specialAbilities: [...initialPhase.specialAbilities],
      environmentalElements: [],
      threatLevel: 0,
      isChanneling: false,
      channelingAbility: null,
      channelingStartTime: 0,
      channelingDuration: 0,
      lastThreatAssessment: 0,
      performanceMetrics: {
        phaseTransitionsPerSecond: 0,
        specialAbilitiesPerSecond: 0,
        environmentalInteractionsPerSecond: 0,
        threatAssessmentsPerSecond: 0,
        performanceScore: 0,
      },
    };
  }

  /**
   * Update boss AI
   */
  public update(boss: Enemy, dragon: Dragon, combatState: CombatState, _deltaTime: number): void {
    this.currentBoss = boss;
    this.dragon = dragon;
    this.combatState = combatState;

    // Update phase if needed
    this.updatePhase(boss, _deltaTime);

    // Update threat assessment
    if (this.config.enableThreatAssessment) {
      this.updateThreatAssessment(_deltaTime);
    }

    // Update special abilities
    if (this.config.enableSpecialAbilities) {
      this.updateSpecialAbilities(_deltaTime);
    }

    // Update environmental elements
    if (this.config.enableEnvironmentalInteraction) {
      this.updateEnvironmentalElements(_deltaTime);
    }

    // Update performance metrics
    this.updatePerformanceMetrics(_deltaTime);
  }

  /**
   * Update boss phase based on health
   */
  private updatePhase(boss: Enemy, _deltaTime: number): void {
    if (!this.config.enablePhaseTransitions) return;

    const currentTime = Date.now();
    const healthPercent = boss.health.current / boss.health.max;
    
    // Check if phase transition is needed
    const nextPhase = this.getNextPhase(healthPercent);
    if (nextPhase && nextPhase.id !== this.bossAIState.currentPhase.id) {
      const timeSinceLastTransition = currentTime - this.bossAIState.lastPhaseTransition;
      if (timeSinceLastTransition >= this.config.phaseTransitionCooldown) {
        this.transitionToPhase(nextPhase);
      }
    }
  }

  /**
   * Get next phase based on health threshold
   */
  private getNextPhase(healthPercent: number): BossPhase | null {
    for (const phase of this.phases.values()) {
      if (healthPercent <= phase.healthThreshold) {
        return phase;
      }
    }
    return null;
  }

  /**
   * Transition to new phase
   */
  private transitionToPhase(newPhase: BossPhase): void {
    const currentTime = Date.now();
    
    // Apply phase transition effects
    this.applyPhaseTransitionEffect(newPhase);
    
    // Update state
    this.bossAIState.currentPhase = newPhase;
    this.bossAIState.phaseHistory.push(newPhase.id);
    this.bossAIState.lastPhaseTransition = currentTime;
    this.bossAIState.specialAbilities = [...newPhase.specialAbilities];
    
    // Emit phase transition event
    this.emitCombatEvent('phase_transition', {
      bossId: this.currentBoss?.id,
      fromPhase: this.bossAIState.phaseHistory[this.bossAIState.phaseHistory.length - 2],
      toPhase: newPhase.id,
      timestamp: currentTime,
    });
  }

  /**
   * Apply phase transition effects
   */
  private applyPhaseTransitionEffect(phase: BossPhase): void {
    if (!this.currentBoss || !this.combatState) return;

    for (const effect of phase.phaseTransitionEffects) {
      switch (effect.type) {
        case 'buff': {
          // Apply buff to boss
          this.applyBuffToBoss(effect);
          break;
        }
        case 'environmental': {
          // Create environmental element
          this.createEnvironmentalElement(effect);
          break;
        }
      }
    }
  }

  /**
   * Apply buff to boss
   */
  private applyBuffToBoss(effect: BossAbilityEffect): void {
    if (!this.currentBoss) return;

    // In a real implementation, this would modify boss stats
    // For now, we'll just emit an event
    this.emitCombatEvent('boss_buff', {
      bossId: this.currentBoss.id,
      effectType: effect.type,
      value: effect.value,
      duration: effect.duration,
      description: effect.description,
    });
  }

  /**
   * Create environmental element
   */
  private createEnvironmentalElement(effect: BossAbilityEffect): void {
    if (!this.currentBoss) return;

    const element: EnvironmentalElement = {
      id: `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: effect.description,
      position: { x: this.currentBoss.position.x, y: this.currentBoss.position.y },
      lifetime: this.config.environmentalElementLifetime,
      effects: [{
        type: 'damage',
        target: 'enemy',
        value: effect.value,
        duration: effect.duration || 0,
        radius: 100,
        elementalType: effect.elementalType || 'fire',
      }],
      destructible: true,
      health: 100,
      maxHealth: 100,
    };

    this.bossAIState.environmentalElements.push(element);
  }

  /**
   * Update threat assessment
   */
  private updateThreatAssessment(_deltaTime: number): void {
    const currentTime = Date.now();
    const timeSinceLastAssessment = currentTime - this.bossAIState.lastThreatAssessment;
    
    if (timeSinceLastAssessment >= this.config.threatAssessmentInterval) {
      this.assessThreat();
      this.bossAIState.lastThreatAssessment = currentTime;
    }
  }

  /**
   * Assess current threat level
   */
  private assessThreat(): void {
    if (!this.dragon || !this.currentBoss) return;

    // Calculate distance-based threat
    const distance = this.calculateDistance(this.dragon.position, this.currentBoss.position);
    const distanceThreat = Math.max(0, 1 - (distance / 500)); // Closer = higher threat

    // Calculate damage-based threat (simplified)
    const damageThreat = Math.min(1, this.bossAIState.performanceMetrics.specialAbilitiesPerSecond);

    // Update threat level
    this.bossAIState.threatLevel = Math.min(1, (distanceThreat + damageThreat) / 2);
  }

  /**
   * Update special abilities
   */
  private updateSpecialAbilities(_deltaTime: number): void {
    if (this.bossAIState.isChanneling) {
      this.updateChannelingAbility(_deltaTime);
      return;
    }

    // Check for available abilities
    for (const ability of this.bossAIState.specialAbilities) {
      if (this.shouldUseAbility(ability)) {
        this.useSpecialAbility(ability);
        break; // Only use one ability per update
      }
    }
  }

  /**
   * Check if ability should be used
   */
  private shouldUseAbility(ability: BossSpecialAbility): boolean {
    const currentTime = Date.now();
    const timeSinceLastUse = currentTime - ability.lastUsed;
    
    // Check cooldown
    if (timeSinceLastUse < ability.cooldown) return false;

    // Check requirements
    for (const requirement of ability.requirements) {
      if (!this.checkRequirement(requirement)) return false;
    }

    return true;
  }

  /**
   * Check ability requirement
   */
  private checkRequirement(requirement: BossAbilityRequirement): boolean {
    if (!this.currentBoss) return false;

    switch (requirement.type) {
      case 'health': {
        const healthPercent = this.currentBoss.health.current / this.currentBoss.health.max;
        return this.compareValues(healthPercent, requirement.value, requirement.operator);
      }
      case 'phase': {
        return this.bossAIState.currentPhase.id === requirement.value.toString();
      }
      case 'cooldown': {
        const currentTime = Date.now();
        const timeSinceLastUse = currentTime - requirement.value;
        return timeSinceLastUse >= requirement.value;
      }
      default:
        return true;
    }
  }

  /**
   * Compare values based on operator
   */
  private compareValues(a: number, b: number, operator: string): boolean {
    switch (operator) {
      case 'greater_than': return a > b;
      case 'less_than': return a < b;
      case 'equals': return Math.abs(a - b) < 0.01;
      case 'not_equals': return Math.abs(a - b) >= 0.01;
      default: return false;
    }
  }

  /**
   * Use special ability
   */
  private useSpecialAbility(ability: BossSpecialAbility): void {
    const currentTime = Date.now();
    
    // Update ability last used time
    ability.lastUsed = currentTime;
    
    // Start channeling if needed
    if (ability.channelDuration > 0) {
      this.bossAIState.isChanneling = true;
      this.bossAIState.channelingAbility = ability;
      this.bossAIState.channelingStartTime = currentTime;
      this.bossAIState.channelingDuration = ability.channelDuration;
    } else {
      // Apply effects immediately
      this.applyAbilityEffects(ability);
    }

    // Trigger visual and audio effects
    this.triggerVisualEffects(ability.visualEffects);
    this.triggerAudioEffects(ability.audioEffects);

    // Emit ability used event
    this.emitCombatEvent('boss_ability_used', {
      bossId: this.currentBoss?.id,
      abilityId: ability.id,
      abilityName: ability.name,
      timestamp: currentTime,
    });
  }

  /**
   * Update channeling ability
   */
  private updateChannelingAbility(_deltaTime: number): void {
    if (!this.bossAIState.isChanneling || !this.bossAIState.channelingAbility) return;

    const currentTime = Date.now();
    const channelingTime = currentTime - this.bossAIState.channelingStartTime;

    if (channelingTime >= this.bossAIState.channelingDuration) {
      // Channeling complete
      this.applyAbilityEffects(this.bossAIState.channelingAbility);
      this.completeChanneledAbility();
    }
  }

  /**
   * Complete channeled ability
   */
  private completeChanneledAbility(): void {
    this.bossAIState.isChanneling = false;
    this.bossAIState.channelingAbility = null;
    this.bossAIState.channelingStartTime = 0;
    this.bossAIState.channelingDuration = 0;
  }

  /**
   * Apply ability effects
   */
  private applyAbilityEffects(ability: BossSpecialAbility): void {
    for (const effect of ability.effects) {
      switch (effect.type) {
        case 'damage': {
          this.dealAreaDamage(effect);
          break;
        }
        case 'heal': {
          this.healBoss(effect);
          break;
        }
        case 'environmental': {
          this.createEnvironmentalElement(effect);
          break;
        }
        case 'buff': {
          this.applyBuffToBoss(effect);
          break;
        }
        case 'debuff': {
          this.applyDebuffToDragon(effect);
          break;
        }
      }
    }
  }

  /**
   * Deal area damage
   */
  private dealAreaDamage(effect: BossAbilityEffect): void {
    if (!this.dragon || !this.combatState) return;

    const damage = effect.value;
    this.combatState.dragonHealth.takeDamage(damage);

    this.emitCombatEvent('boss_area_damage', {
      bossId: this.currentBoss?.id,
      damage,
      elementalType: effect.elementalType,
      areaOfEffect: effect.target === 'area',
    });
  }

  /**
   * Heal boss
   */
  private healBoss(effect: BossAbilityEffect): void {
    if (!this.currentBoss) return;

    const healAmount = effect.value;
    this.currentBoss.health.current = Math.min(
      this.currentBoss.health.max,
      this.currentBoss.health.current + healAmount
    );

    this.emitCombatEvent('boss_heal', {
      bossId: this.currentBoss.id,
      healAmount,
      newHealth: this.currentBoss.health.current,
    });
  }

  /**
   * Apply debuff to dragon
   */
  private applyDebuffToDragon(effect: BossAbilityEffect): void {
    if (!this.dragon || !this.combatState) return;

    this.emitCombatEvent('dragon_debuff', {
      bossId: this.currentBoss?.id,
      debuffType: effect.description,
      value: effect.value,
      duration: effect.duration,
    });
  }

  /**
   * Update environmental elements
   */
  private updateEnvironmentalElements(deltaTime: number): void {
    const elementsToRemove: number[] = [];

    for (let i = 0; i < this.bossAIState.environmentalElements.length; i++) {
      const element = this.bossAIState.environmentalElements[i];
      if (!element) continue;
      
      // Update element lifetime
      element.lifetime -= deltaTime;
      
      if (element.lifetime <= 0) {
        elementsToRemove.push(i);
        continue;
      }

      // Apply environmental effects
      this.applyEnvironmentalEffect(element);
    }

    // Remove expired elements
    for (let i = elementsToRemove.length - 1; i >= 0; i--) {
      const index = elementsToRemove[i];
      if (index !== undefined) {
        this.bossAIState.environmentalElements.splice(index, 1);
      }
    }
  }

  /**
   * Apply environmental effect
   */
  private applyEnvironmentalEffect(element: EnvironmentalElement): void {
    for (const effect of element.effects) {
      switch (effect.type) {
        case 'damage': {
          if (effect.target === 'enemy' && this.dragon) {
            const distance = this.calculateDistance(
              this.dragon.position,
              element.position
            );
            
            if (distance <= effect.radius) {
              this.dealAreaDamage({
                type: 'damage',
                target: 'enemy',
                value: effect.value,
                elementalType: effect.elementalType || 'fire',
                description: 'Environmental damage',
              });
            }
          }
          break;
        }
        case 'movement': {
          // Apply movement effects (simplified)
          break;
        }
        case 'visibility': {
          // Apply visibility effects (simplified)
          break;
        }
      }
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(_deltaTime: number): void {
    const currentTime = Date.now();
    const timeWindow = 1000; // 1 second window

    // Update phase transitions per second
    const recentTransitions = this.bossAIState.phaseHistory.filter(
      (_, index) => index >= this.bossAIState.phaseHistory.length - 3
    );
    this.bossAIState.performanceMetrics.phaseTransitionsPerSecond = recentTransitions.length;

    // Update special abilities per second
    const recentAbilities = this.bossAIState.specialAbilities.filter(
      ability => currentTime - ability.lastUsed < timeWindow
    );
    this.bossAIState.performanceMetrics.specialAbilitiesPerSecond = recentAbilities.length;

    // Update environmental interactions per second
    this.bossAIState.performanceMetrics.environmentalInteractionsPerSecond = 
      this.bossAIState.environmentalElements.length;

    // Update threat assessments per second
    const timeSinceLastAssessment = currentTime - this.bossAIState.lastThreatAssessment;
    this.bossAIState.performanceMetrics.threatAssessmentsPerSecond = 
      timeSinceLastAssessment < timeWindow ? 1 : 0;

    // Calculate overall performance score
    this.bossAIState.performanceMetrics.performanceScore = 
      (this.bossAIState.performanceMetrics.phaseTransitionsPerSecond * 0.3) +
      (this.bossAIState.performanceMetrics.specialAbilitiesPerSecond * 0.4) +
      (this.bossAIState.performanceMetrics.environmentalInteractionsPerSecond * 0.2) +
      (this.bossAIState.performanceMetrics.threatAssessmentsPerSecond * 0.1);
  }

  /**
   * Trigger visual effects
   */
  private triggerVisualEffects(effects: BossVisualEffect[]): void {
    for (const effect of effects) {
      this.emitCombatEvent('boss_visual_effect', {
        effectType: effect.type,
        duration: effect.duration,
        intensity: effect.intensity,
        position: effect.position,
        color: effect.color,
        size: effect.size,
      });
    }
  }

  /**
   * Trigger audio effects
   */
  private triggerAudioEffects(effects: BossAudioEffect[]): void {
    for (const effect of effects) {
      this.emitCombatEvent('boss_audio_effect', {
        effectType: effect.type,
        soundId: effect.soundId,
        volume: effect.volume,
        pitch: effect.pitch,
        loop: effect.loop,
        duration: effect.duration,
      });
    }
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Emit combat event
   */
  private emitCombatEvent(type: string, data: Record<string, unknown>): void {
    if (!this.combatState) return;

    const event: CombatEvent = {
      type: type as CombatEvent['type'],
      timestamp: Date.now(),
      data,
      source: this.currentBoss?.id || '',
      target: this.dragon?.id || '',
    };

    // In a real implementation, this would emit to an event system
    // For now, we'll just store the event
    if (Array.isArray(this.combatState.events)) {
      this.combatState.events.push(event);
    }
  }

  /**
   * Get current boss AI state
   */
  public getState(): BossAIState {
    return { ...this.bossAIState };
  }

  /**
   * Get current phase
   */
  public getCurrentPhase(): BossPhase {
    return this.bossAIState.currentPhase;
  }

  /**
   * Get environmental elements
   */
  public getEnvironmentalElements(): EnvironmentalElement[] {
    return [...this.bossAIState.environmentalElements];
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics() {
    return { ...this.bossAIState.performanceMetrics };
  }

  /**
   * Check if boss is channeling
   */
  public isChanneling(): boolean {
    return this.bossAIState.isChanneling;
  }

  /**
   * Get channeling progress (0-1)
   */
  public getChannelingProgress(): number {
    if (!this.bossAIState.isChanneling) return 0;
    
    const currentTime = Date.now();
    const elapsed = currentTime - this.bossAIState.channelingStartTime;
    return Math.min(1, elapsed / this.bossAIState.channelingDuration);
  }

  /**
   * Interrupt channeling
   */
  public interruptChanneling(): void {
    if (this.bossAIState.isChanneling) {
      this.bossAIState.isChanneling = false;
      this.bossAIState.channelingAbility = null;
      this.bossAIState.channelingStartTime = 0;
      this.bossAIState.channelingDuration = 0;

      this.emitCombatEvent('boss_channeling_interrupted', {
        bossId: this.currentBoss?.id,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Destroy environmental element
   */
  public destroyEnvironmentalElement(elementId: string): void {
    const index = this.bossAIState.environmentalElements.findIndex(
      element => element.id === elementId
    );
    
    if (index !== -1) {
      const element = this.bossAIState.environmentalElements[index];
      if (element) {
        this.bossAIState.environmentalElements.splice(index, 1);

        this.emitCombatEvent('environmental_element_destroyed', {
          elementId: element.id,
          elementType: element.type,
          bossId: this.currentBoss?.id,
          timestamp: Date.now(),
        });
      }
    }
  }
}
