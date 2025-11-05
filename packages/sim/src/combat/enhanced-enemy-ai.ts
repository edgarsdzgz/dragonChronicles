import type {
  Dragon,
  Enemy,
  CombatState,
  CombatEvent,
  Vector2,
} from './types.js';
import { createDefaultArcanaDropManager } from '../economy/arcana-drop-manager.js';
import { createDefaultSoulPowerDropManager } from '../economy/soul-power-drop-manager.js';

export interface EnemyAIState {
  currentState: 'idle' | 'patrol' | 'approach' | 'attack' | 'retreat' | 'death';
  target: Dragon | null;
  lastStateChange: number;
  stateHistory: string[];
  movementPattern: 'linear' | 'circular' | 'zigzag' | 'formation';
  attackPattern: 'single' | 'burst' | 'continuous' | 'area';
  formationPosition: Vector2 | null;
  formationRole: 'leader' | 'follower' | 'support' | 'flanker';
  threatLevel: number;
  lastThreatAssessment: number;
  specialAbilities: EnemySpecialAbility[];
  environmentalElements: EnvironmentalElement[];
  performanceMetrics: {
    stateTransitionsPerSecond: number;
    attacksPerSecond: number;
    movementEfficiency: number;
    formationEffectiveness: number;
    threatAssessmentAccuracy: number;
    performanceScore: number;
  };
}

export interface EnemySpecialAbility {
  id: string;
  name: string;
  type: 'offensive' | 'defensive' | 'utility' | 'environmental';
  cooldown: number;
  lastUsed: number;
  effects: Map<string, unknown>;
  range: number;
  areaOfEffect: number;
  channelDuration: number;
  isChanneling: boolean;
  channelingStartTime: number;
}

export interface EnvironmentalElement {
  id: string;
  type: 'barrier' | 'trap' | 'healing' | 'damage' | 'movement';
  position: Vector2;
  radius: number;
  duration: number;
  effects: Map<string, unknown>;
  isActive: boolean;
  createdBy: string;
  createdAt: number;
}

export interface EnhancedEnemyAIConfig {
  enableEnhancedAI: boolean;
  enableStateMachine: boolean;
  enableMovementPatterns: boolean;
  enableAttackPatterns: boolean;
  enableFormationBehavior: boolean;
  enableThreatAssessment: boolean;
  enableSpecialAbilities: boolean;
  enableEnvironmentalInteraction: boolean;
  enablePerformanceOptimization: boolean;
  enableCombatIntegration: boolean;
  enableCombatEvents: boolean;
  enableCombatStateUpdates: boolean;
  enableCombatTesting: boolean;
  enableCombatValidation: boolean;
  enableCombatOptimization: boolean;
  stateTransitionInterval: number;
  movementUpdateInterval: number;
  attackInterval: number;
  formationUpdateInterval: number;
  threatAssessmentInterval: number;
  specialAbilityCooldown: number;
  environmentalInteractionCooldown: number;
  performanceThreshold: number;
  combatIntegrationInterval: number;
  combatEventProcessingInterval: number;
  combatStateUpdateInterval: number;
  combatTestingInterval: number;
  combatValidationInterval: number;
  combatOptimizationInterval: number;
}

export interface EnhancedEnemyAIState {
  isActive: boolean;
  isPaused: boolean;
  enemyAIStates: Map<string, EnemyAIState>;
  formationGroups: Map<string, Enemy[]>;
  environmentalElements: Map<string, EnvironmentalElement>;
  threatLevels: Map<string, number>;
  performanceMetrics: {
    enemiesPerSecond: number;
    stateTransitionsPerSecond: number;
    attacksPerSecond: number;
    movementEfficiency: number;
    formationEffectiveness: number;
    threatAssessmentAccuracy: number;
    performanceScore: number;
    combatIntegrationScore: number;
    combatEventProcessingScore: number;
    combatStateUpdateScore: number;
    combatTestingScore: number;
    combatValidationScore: number;
    combatOptimizationScore: number;
  };
  combatEvents: CombatEvent[];
  combatState: CombatState;
  combatIntegration: boolean;
  combatTesting: boolean;
  combatValidation: boolean;
  combatOptimization: boolean;
}

export interface EnhancedEnemyAIMetrics {
  totalEnemies: number;
  totalStateTransitions: number;
  totalAttacks: number;
  totalFormationUpdates: number;
  totalThreatAssessments: number;
  totalSpecialAbilities: number;
  totalEnvironmentalInteractions: number;
  totalPerformanceOptimizations: number;
  totalCombatEvents: number;
  totalCombatStateUpdates: number;
  totalCombatIntegration: number;
  totalCombatTesting: number;
  totalCombatValidation: number;
  totalCombatOptimization: number;
  averageStateTransitionTime: number;
  averageAttackTime: number;
  averageFormationUpdateTime: number;
  averageThreatAssessmentTime: number;
  averageSpecialAbilityTime: number;
  averageEnvironmentalInteractionTime: number;
  averagePerformanceScore: number;
  averageCombatIntegrationScore: number;
  averageCombatEventProcessingScore: number;
  averageCombatStateUpdateScore: number;
  averageCombatTestingScore: number;
  averageCombatValidationScore: number;
  averageCombatOptimizationScore: number;
}

export class EnhancedEnemyAI {
  private config: EnhancedEnemyAIConfig;
  private state: EnhancedEnemyAIState;
  private metrics: EnhancedEnemyAIMetrics;
  private dragon: Dragon;
  private arcanaDropManager: ReturnType<typeof createDefaultArcanaDropManager>;
  private soulPowerDropManager: ReturnType<typeof createDefaultSoulPowerDropManager>;

  constructor(config: Partial<EnhancedEnemyAIConfig>, dragon: Dragon) {
    this.config = {
      enableEnhancedAI: true,
      enableStateMachine: true,
      enableMovementPatterns: true,
      enableAttackPatterns: true,
      enableFormationBehavior: true,
      enableThreatAssessment: true,
      enableSpecialAbilities: true,
      enableEnvironmentalInteraction: true,
      enablePerformanceOptimization: true,
      enableCombatIntegration: true,
      enableCombatEvents: true,
      enableCombatStateUpdates: true,
      enableCombatTesting: true,
      enableCombatValidation: true,
      enableCombatOptimization: true,
      stateTransitionInterval: 1000,
      movementUpdateInterval: 100,
      attackInterval: 2000,
      formationUpdateInterval: 500,
      threatAssessmentInterval: 1000,
      specialAbilityCooldown: 5000,
      environmentalInteractionCooldown: 3000,
      performanceThreshold: 100,
      combatIntegrationInterval: 500,
      combatEventProcessingInterval: 100,
      combatStateUpdateInterval: 50,
      combatTestingInterval: 1000,
      combatValidationInterval: 2000,
      combatOptimizationInterval: 5000,
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
    this.emitCombatEvent('enhanced_enemy_ai_started', { dragonId: this.dragon.id });
  }

  public stop(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.enemyAIStates.clear();
    this.state.formationGroups.clear();
    this.state.environmentalElements.clear();
    this.state.threatLevels.clear();
    this.emitCombatEvent('enhanced_enemy_ai_stopped', { dragonId: this.dragon.id });
  }

  public pause(): void {
    this.state.isPaused = true;
    this.emitCombatEvent('enhanced_enemy_ai_paused', { dragonId: this.dragon.id });
  }

  public resume(): void {
    this.state.isPaused = false;
    this.emitCombatEvent('enhanced_enemy_ai_resumed', { dragonId: this.dragon.id });
  }

  public update(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.state.combatState = combatState;
    this.updateEnemyAI(deltaTime, activeEnemies);
    this.updateFormations(deltaTime, activeEnemies);
    this.updateEnvironmentalElements(deltaTime);
    this.updatePerformanceMetrics(deltaTime);
    this.cleanupEvents();
  }

  private updateEnemyAI(deltaTime: number, activeEnemies: Map<string, Enemy>): void {
    for (const [enemyId, enemy] of activeEnemies.entries()) {
      this.initializeEnemyAI(enemy);
      const aiState = this.state.enemyAIStates.get(enemyId);
      if (aiState) {
        this.updateEnemyState(enemy, aiState, deltaTime);
        this.updateEnemyMovement(enemy, aiState, deltaTime);
        this.updateEnemyAttack(enemy, aiState, deltaTime);
        this.updateEnemyFormation(enemy, aiState, deltaTime);
        this.updateEnemyThreatAssessment(enemy, aiState, deltaTime);
        this.updateEnemySpecialAbilities(enemy, aiState, deltaTime);
      }
    }
  }

  private initializeEnemyAI(_enemy: Enemy): void {
    if (!this.state.enemyAIStates.has(_enemy.id)) {
      const initialState: EnemyAIState = {
        currentState: 'idle',
        target: this.dragon,
        lastStateChange: Date.now(),
        stateHistory: ['idle'],
        movementPattern: 'linear',
        attackPattern: 'single',
        formationPosition: null,
        formationRole: 'follower',
        threatLevel: 1.0,
        lastThreatAssessment: Date.now(),
        specialAbilities: [],
        environmentalElements: [],
        performanceMetrics: {
          stateTransitionsPerSecond: 0,
          attacksPerSecond: 0,
          movementEfficiency: 0,
          formationEffectiveness: 0,
          threatAssessmentAccuracy: 0,
          performanceScore: 0,
        },
      };
      this.state.enemyAIStates.set(_enemy.id, initialState);
    }
  }

  private updateEnemyState(_enemy: Enemy, _aiState: EnemyAIState, _deltaTime: number): void {
    const currentTime = Date.now();
    const timeSinceLastChange = currentTime - _aiState.lastStateChange;

    if (timeSinceLastChange >= this.config.stateTransitionInterval) {
      const newState = this.determineNextState(_enemy, _aiState);
      if (newState !== _aiState.currentState) {
        this.transitionToState(_enemy, _aiState, newState);
      }
    }
  }

  private updateEnemyMovement(_enemy: Enemy, _aiState: EnemyAIState, _deltaTime: number): void {
    if (!this.config.enableMovementPatterns) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - _aiState.lastStateChange;

    if (timeSinceLastUpdate >= this.config.movementUpdateInterval) {
      this.moveTowardsTarget(_enemy, _aiState);
    }
  }

  private updateEnemyAttack(_enemy: Enemy, _aiState: EnemyAIState, _deltaTime: number): void {
    if (!this.config.enableAttackPatterns) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastAttack = currentTime - _aiState.lastStateChange;

    if (timeSinceLastAttack >= this.config.attackInterval) {
      this.performAttack(_enemy, _aiState);
    }
  }

  private updateEnemyFormation(_enemy: Enemy, _aiState: EnemyAIState, _deltaTime: number): void {
    if (!this.config.enableFormationBehavior) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - _aiState.lastStateChange;

    if (timeSinceLastUpdate >= this.config.formationUpdateInterval) {
      this.updateFormationState(_enemy, _aiState);
    }
  }

  private updateEnemyThreatAssessment(_enemy: Enemy, _aiState: EnemyAIState, _deltaTime: number): void {
    if (!this.config.enableThreatAssessment) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastAssessment = currentTime - _aiState.lastThreatAssessment;

    if (timeSinceLastAssessment >= this.config.threatAssessmentInterval) {
      _aiState.threatLevel = this.calculateThreatLevel(_enemy);
      _aiState.lastThreatAssessment = currentTime;
      this.state.threatLevels.set(_enemy.id, _aiState.threatLevel);
    }
  }

  private updateEnemySpecialAbilities(_enemy: Enemy, _aiState: EnemyAIState, _deltaTime: number): void {
    if (!this.config.enableSpecialAbilities) {
      return;
    }

    for (const ability of _aiState.specialAbilities) {
      const timeSinceLastUsed = Date.now() - ability.lastUsed;
      if (timeSinceLastUsed >= ability.cooldown) {
        if (this.shouldUseSpecialAbility(_enemy, _aiState, ability)) {
          this.useSpecialAbility(_enemy, _aiState, ability);
        }
      }
    }
  }

  private determineNextState(_enemy: Enemy, _aiState: EnemyAIState): string {
    const distanceToTarget = this.calculateDistance(_enemy.position, this.dragon.position);
    const healthRatio = _enemy.health.current / _enemy.health.max;

    if (healthRatio <= 0) {
      return 'death';
    }

    if (distanceToTarget <= 100) {
      return 'attack';
    } else if (distanceToTarget <= 300) {
      return 'approach';
    } else if (healthRatio <= 0.3) {
      return 'retreat';
    } else {
      return 'patrol';
    }
  }

  private transitionToState(_enemy: Enemy, _aiState: EnemyAIState, newState: string): void {
    _aiState.currentState = newState as 'idle' | 'patrol' | 'approach' | 'attack' | 'retreat' | 'death';
    _aiState.lastStateChange = Date.now();
    _aiState.stateHistory.push(newState);
    this.metrics.totalStateTransitions++;
    this.emitCombatEvent('enemy_state_transition', {
      enemyId: _enemy.id,
      enemyType: _enemy.type,
      fromState: _aiState.stateHistory[_aiState.stateHistory.length - 2],
      toState: newState,
    });
  }

  private moveTowardsTarget(_enemy: Enemy, _aiState: EnemyAIState): void {
    if (!_aiState.target) {
      return;
    }

    const targetPosition = _aiState.target.position;
    const currentPosition = _enemy.position;
    const distance = this.calculateDistance(currentPosition, targetPosition);

    if (distance > 50) {
      const direction = {
        x: (targetPosition.x - currentPosition.x) / distance,
        y: (targetPosition.y - currentPosition.y) / distance,
      };

      const speed = _enemy.speed || 1.0;
      _enemy.position.x += direction.x * speed;
      _enemy.position.y += direction.y * speed;
    }
  }

  private performAttack(_enemy: Enemy, _aiState: EnemyAIState): void {
    if (!_aiState.target) {
      return;
    }

    const distance = this.calculateDistance(_enemy.position, _aiState.target.position);
    if (distance <= 100) {
      const damage = _enemy.damage || 10;
      this.emitAttackEvent(_enemy, _aiState, damage);
      this.metrics.totalAttacks++;
    }
  }

  private updateFormationState(_enemy: Enemy, _aiState: EnemyAIState): void {
    if (_aiState.formationRole === 'leader') {
      this.addEnemyToFormation(_enemy, _aiState);
    }
  }

  private addEnemyToFormation(_enemy: Enemy, _aiState: EnemyAIState): void {
    const formationId = `formation_${_enemy.type}`;
    if (!this.state.formationGroups.has(formationId)) {
      this.state.formationGroups.set(formationId, []);
    }
    this.state.formationGroups.get(formationId)!.push(_enemy);
  }

  private shouldUseSpecialAbility(_enemy: Enemy, _aiState: EnemyAIState, _ability: EnemySpecialAbility): boolean {
    return _aiState.threatLevel > 0.7 && !_ability.isChanneling;
  }

  private useSpecialAbility(_enemy: Enemy, _aiState: EnemyAIState, _ability: EnemySpecialAbility): void {
    _ability.lastUsed = Date.now();
    this.metrics.totalSpecialAbilities++;
    this.emitCombatEvent('enemy_special_ability_used', {
      enemyId: _enemy.id,
      enemyType: _enemy.type,
      abilityId: _ability.id,
      abilityName: _ability.name,
      abilityType: _ability.type,
    });
  }

  private calculateThreatLevel(_enemy: Enemy): number {
    const healthRatio = _enemy.health.current / _enemy.health.max;
    const damage = _enemy.damage || 10;
    const speed = _enemy.speed || 1.0;
    const distance = this.calculateDistance(_enemy.position, this.dragon.position);

    return (healthRatio * 0.3) + (damage * 0.4) + (speed * 0.2) + ((1000 - distance) * 0.1);
  }

  private updateFormations(_deltaTime: number, _activeEnemies: Map<string, Enemy>): void {
    if (!this.config.enableFormationBehavior) {
      return;
    }

    for (const [formationId, enemies] of this.state.formationGroups.entries()) {
      this.updateFormationGroup(formationId, enemies, _deltaTime);
    }
  }

  private updateFormationGroup(_formationId: string, enemies: Enemy[], _deltaTime: number): void {
    if (enemies.length === 0) {
      return;
    }

    const leader = enemies[0];
    if (leader) {
      for (let i = 1; i < enemies.length; i++) {
        const follower = enemies[i];
        if (follower) {
          const aiState = this.state.enemyAIStates.get(follower.id);
          if (aiState) {
            this.updateFollowerPosition(follower, aiState, leader);
          }
        }
      }
    }
  }

  private updateFollowerPosition(_follower: Enemy, _aiState: EnemyAIState, _leader: Enemy): void {
    const offset = { x: 50, y: 0 };
    _follower.position.x = _leader.position.x + offset.x;
    _follower.position.y = _leader.position.y + offset.y;
  }

  private updateEnvironmentalElements(_deltaTime: number): void {
    if (!this.config.enableEnvironmentalInteraction) {
      return;
    }

    for (const [elementId, element] of this.state.environmentalElements.entries()) {
      if (element.duration > 0) {
        element.duration -= _deltaTime;
        if (element.duration <= 0) {
          this.removeEnvironmentalElement(elementId);
        }
      }
    }
  }

  private removeEnvironmentalElement(_elementId: string): void {
    this.state.environmentalElements.delete(_elementId);
    this.metrics.totalEnvironmentalInteractions++;
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
    this.metrics.totalPerformanceOptimizations++;
  }

  private cleanupEvents(): void {
    if (this.state.combatEvents.length > 100) {
      this.state.combatEvents = this.state.combatEvents.slice(-50);
    }
  }

  private emitAttackEvent(_enemy: Enemy, _aiState: EnemyAIState, damage: number): void {
    if (!this.config.enableCombatEvents) {
      return;
    }

    const event: CombatEvent = {
      type: 'damage',
      timestamp: Date.now(),
      source: 'enhanced_enemy_ai',
      target: this.dragon.id,
      data: {
        enemyId: _enemy.id,
        enemyType: _enemy.type,
        damage,
        attackPattern: _aiState.attackPattern,
        formationRole: _aiState.formationRole,
      },
    };

    this.state.combatEvents.push(event);
  }

  private emitCombatEvent(type: string, data: Record<string, unknown>): void {
    if (!this.config.enableCombatEvents) {
      return;
    }

    const event: CombatEvent = {
      type: type as CombatEvent['type'],
      timestamp: Date.now(),
      source: 'enhanced_enemy_ai',
      target: this.dragon.id,
      data,
    };

    this.state.combatEvents.push(event);
  }

  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private createInitialState(): EnhancedEnemyAIState {
    return {
      isActive: false,
      isPaused: false,
      enemyAIStates: new Map(),
      formationGroups: new Map(),
      environmentalElements: new Map(),
      threatLevels: new Map(),
      performanceMetrics: {
        enemiesPerSecond: 0,
        stateTransitionsPerSecond: 0,
        attacksPerSecond: 0,
        movementEfficiency: 0,
        formationEffectiveness: 0,
        threatAssessmentAccuracy: 0,
        performanceScore: 0,
        combatIntegrationScore: 0,
        combatEventProcessingScore: 0,
        combatStateUpdateScore: 0,
        combatTestingScore: 0,
        combatValidationScore: 0,
        combatOptimizationScore: 0,
      },
      combatEvents: [],
      combatState: {} as CombatState,
      combatIntegration: false,
      combatTesting: false,
      combatValidation: false,
      combatOptimization: false,
    };
  }

  private createInitialMetrics(): EnhancedEnemyAIMetrics {
    return {
      totalEnemies: 0,
      totalStateTransitions: 0,
      totalAttacks: 0,
      totalFormationUpdates: 0,
      totalThreatAssessments: 0,
      totalSpecialAbilities: 0,
      totalEnvironmentalInteractions: 0,
      totalPerformanceOptimizations: 0,
      totalCombatEvents: 0,
      totalCombatStateUpdates: 0,
      totalCombatIntegration: 0,
      totalCombatTesting: 0,
      totalCombatValidation: 0,
      totalCombatOptimization: 0,
      averageStateTransitionTime: 0,
      averageAttackTime: 0,
      averageFormationUpdateTime: 0,
      averageThreatAssessmentTime: 0,
      averageSpecialAbilityTime: 0,
      averageEnvironmentalInteractionTime: 0,
      averagePerformanceScore: 0,
      averageCombatIntegrationScore: 0,
      averageCombatEventProcessingScore: 0,
      averageCombatStateUpdateScore: 0,
      averageCombatTestingScore: 0,
      averageCombatValidationScore: 0,
      averageCombatOptimizationScore: 0,
    };
  }

  public getState(): EnhancedEnemyAIState {
    return { ...this.state };
  }

  public getMetrics(): EnhancedEnemyAIMetrics {
    return { ...this.metrics };
  }

  public getConfig(): EnhancedEnemyAIConfig {
    return { ...this.config };
  }
}
