/**
 * Custom Strategy Framework for Draconia Chronicles
 * Provides extensible framework for player-defined targeting strategies
 */

import type {
  Dragon,
  Enemy,
  TargetingStrategy,
  TargetingStrategyHandler,
  ThreatAssessment,
  RangeDetection,
} from './types.js';

/**
 * Custom strategy definition interface
 */
export interface CustomStrategyDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'combat' | 'utility' | 'experimental';
  tags: string[];
  parameters: CustomStrategyParameter[];
  code: string; // JavaScript code as string
  validationRules: CustomStrategyValidationRule[];
  dependencies: string[];
  minLevel?: number;
  maxLevel?: number;
  unlockRequirements?: CustomStrategyUnlockRequirement[];
}

/**
 * Custom strategy parameter definition
 */
export interface CustomStrategyParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'enum' | 'range';
  defaultValue: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: string[]; // For enum type
  description: string;
  required: boolean;
}

/**
 * Custom strategy validation rule
 */
export interface CustomStrategyValidationRule {
  type: 'syntax' | 'performance' | 'safety' | 'logic';
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Custom strategy unlock requirement
 */
export interface CustomStrategyUnlockRequirement {
  type: 'level' | 'achievement' | 'currency' | 'time' | 'custom';
  value: number | string;
  description: string;
}

/**
 * Custom strategy execution context
 */
export interface CustomStrategyContext {
  dragon: Dragon;
  enemies: Enemy[];
  threatAssessment: ThreatAssessment;
  rangeDetection: RangeDetection;
  parameters: Record<string, unknown>;
  gameState: Record<string, unknown>;
  utilities: CustomStrategyUtilities;
}

/**
 * Custom strategy utilities
 */
export interface CustomStrategyUtilities {
  calculateDistance(_dragon: Dragon, _enemy: Enemy): number;
  calculateThreatLevel(_enemy: Enemy, _dragon: Dragon): number;
  isInRange(_dragon: Dragon, _enemy: Enemy): boolean;
  getEnemiesInRange(_enemies: Enemy[], _dragon: Dragon): Enemy[];
  sortByDistance(_enemies: Enemy[], _dragon: Dragon): Enemy[];
  sortByThreat(_enemies: Enemy[], _dragon: Dragon): Enemy[];
  filterByHealth(_enemies: Enemy[], _minHealth: number, _maxHealth: number): Enemy[];
  filterByElement(_enemies: Enemy[], _element: string): Enemy[];
  getRandomEnemy(_enemies: Enemy[]): Enemy | null;
  getClosestEnemy(_enemies: Enemy[], _dragon: Dragon): Enemy | null;
  getHighestThreatEnemy(_enemies: Enemy[], _dragon: Dragon): Enemy | null;
}

/**
 * Custom strategy execution result
 */
export interface CustomStrategyResult {
  target: Enemy | null;
  confidence: number; // 0-1
  reasoning: string;
  metrics: {
    executionTime: number;
    memoryUsage: number;
    iterations: number;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Custom strategy validator
 */
export class CustomStrategyValidator {
  private readonly maxExecutionTime = 10; // 10ms max
  private readonly maxMemoryUsage = 1024 * 1024; // 1MB max
  private readonly maxIterations = 1000;
  private readonly allowedAPIs = [
    'Math',
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'Date',
    'JSON',
    'console',
    'performance',
  ];

  /**
   * Validate custom strategy definition
   */
  validateDefinition(definition: CustomStrategyDefinition): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic properties
    if (!definition.id || typeof definition.id !== 'string') {
      errors.push('Strategy ID is required and must be a string');
    }

    if (!definition.name || typeof definition.name !== 'string') {
      errors.push('Strategy name is required and must be a string');
    }

    if (!definition.code || typeof definition.code !== 'string') {
      errors.push('Strategy code is required and must be a string');
    }

    // Validate parameters
    if (definition.parameters) {
      for (const param of definition.parameters) {
        if (!param.name || typeof param.name !== 'string') {
          errors.push('Parameter name is required and must be a string');
        }
        if (!param.type || !['number', 'string', 'boolean', 'enum', 'range'].includes(param.type)) {
          errors.push(`Invalid parameter type: ${param.type}`);
        }
      }
    }

    // Validate code syntax
    try {
      new Function(definition.code);
    } catch (error) {
      errors.push(`Invalid JavaScript syntax: ${error}`);
    }

    // Check for dangerous APIs
    const dangerousAPIs = [
      'eval',
      'Function',
      'setTimeout',
      'setInterval',
      'XMLHttpRequest',
      'fetch',
    ];
    for (const api of dangerousAPIs) {
      if (definition.code.includes(api)) {
        errors.push(`Dangerous API usage detected: ${api}`);
      }
    }

    // Check for performance issues
    if (definition.code.includes('while') || definition.code.includes('for')) {
      warnings.push('Loops detected - ensure they have proper exit conditions');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate strategy execution
   */
  validateExecution(
    strategy: CustomStrategyDefinition,
    context: CustomStrategyContext,
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check execution time
    const startTime = performance.now();
    try {
      // Create sandboxed execution environment
      const sandbox = this.createSandbox(context);
      const result = this.executeInSandbox(strategy.code, sandbox);
      const executionTime = performance.now() - startTime;

      if (executionTime > this.maxExecutionTime) {
        errors.push(
          `Execution time exceeded limit: ${executionTime}ms > ${this.maxExecutionTime}ms`,
        );
      }

      // Validate result
      if (!result || typeof result !== 'object') {
        errors.push('Strategy must return an object');
      }

      if (result && !result.target) {
        warnings.push('Strategy returned null target');
      }

      if (result && typeof result.confidence !== 'number') {
        errors.push('Strategy must return a confidence number');
      }
    } catch (error) {
      errors.push(`Execution error: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Create sandboxed execution environment
   */
  private createSandbox(context: CustomStrategyContext): Record<string, unknown> {
    return {
      // Game objects
      dragon: context.dragon,
      enemies: context.enemies,
      threatAssessment: context.threatAssessment,
      rangeDetection: context.rangeDetection,
      parameters: context.parameters,
      gameState: context.gameState,

      // Utilities
      utils: context.utilities,

      // Safe APIs
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      JSON,

      // Performance monitoring
      performance: {
        now: () => performance.now(),
      },

      // Console (limited)
      console: {
        log: (...args: unknown[]) => console.log('[Custom Strategy]', ...args),
        warn: (...args: unknown[]) => console.warn('[Custom Strategy]', ...args),
        error: (...args: unknown[]) => console.error('[Custom Strategy]', ...args),
      },
    };
  }

  /**
   * Execute code in sandbox
   */
  private executeInSandbox(code: string, sandbox: Record<string, unknown>): Record<string, unknown> {
    // Create function with sandbox context
    const func = new Function(
      'sandbox',
      `
      with (sandbox) {
        ${code}
      }
      `,
    );

    return func(sandbox);
  }
}

/**
 * Custom strategy executor
 */
export class CustomStrategyExecutor {
  private validator = new CustomStrategyValidator();

  /**
   * Execute custom strategy
   */
  async execute(
    strategy: CustomStrategyDefinition,
    context: CustomStrategyContext,
  ): Promise<CustomStrategyResult> {
    const startTime = performance.now();
    const startMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

    try {
      // Validate strategy
      const validation = this.validator.validateDefinition(strategy);
      if (!validation.isValid) {
        return {
          target: null,
          confidence: 0,
          reasoning: `Validation failed: ${validation.errors.join(', ')}`,
          metrics: {
            executionTime: performance.now() - startTime,
            memoryUsage: 0,
            iterations: 0,
          },
          errors: validation.errors,
          warnings: validation.warnings,
        };
      }

      // Create sandboxed execution environment
      const sandbox = this.createSandbox(context);

      // Execute strategy
      const result = this.executeInSandbox(strategy.code, sandbox);

      const executionTime = performance.now() - startTime;
      const endMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
      const memoryUsage = endMemory - startMemory;

      // Validate result
      if (!result || typeof result !== 'object') {
        return {
          target: null,
          confidence: 0,
          reasoning: 'Strategy returned invalid result',
          metrics: {
            executionTime,
            memoryUsage,
            iterations: 0,
          },
          errors: ['Strategy must return an object'],
          warnings: [],
        };
      }

      return {
        target: result.target || null,
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        reasoning: result.reasoning || 'No reasoning provided',
        metrics: {
          executionTime,
          memoryUsage,
          iterations: result.iterations || 0,
        },
        errors: result.errors || [],
        warnings: result.warnings || [],
      };
    } catch (error) {
      return {
        target: null,
        confidence: 0,
        reasoning: `Execution failed: ${error}`,
        metrics: {
          executionTime: performance.now() - startTime,
          memoryUsage: 0,
          iterations: 0,
        },
        errors: [`Execution error: ${error}`],
        warnings: [],
      };
    }
  }

  /**
   * Create sandboxed execution environment
   */
  private createSandbox(context: CustomStrategyContext): Record<string, unknown> {
    return {
      // Game objects
      dragon: context.dragon,
      enemies: context.enemies,
      threatAssessment: context.threatAssessment,
      rangeDetection: context.rangeDetection,
      parameters: context.parameters,
      gameState: context.gameState,

      // Utilities
      utils: context.utilities,

      // Safe APIs
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      JSON,

      // Performance monitoring
      performance: {
        now: () => performance.now(),
      },

      // Console (limited)
      console: {
        log: (...args: unknown[]) => console.log('[Custom Strategy]', ...args),
        warn: (...args: unknown[]) => console.warn('[Custom Strategy]', ...args),
        error: (...args: unknown[]) => console.error('[Custom Strategy]', ...args),
      },
    };
  }

  /**
   * Execute code in sandbox
   */
  private executeInSandbox(code: string, sandbox: Record<string, unknown>): Record<string, unknown> {
    // Create function with sandbox context
    const func = new Function(
      'sandbox',
      `
      with (sandbox) {
        ${code}
      }
      `,
    );

    return func(sandbox);
  }
}

/**
 * Custom strategy handler implementation
 */
export class CustomStrategyHandler implements TargetingStrategyHandler {
  public strategy: TargetingStrategy;
  private definition: CustomStrategyDefinition;
  private executor: CustomStrategyExecutor;
  private _isUnlocked: boolean;

  constructor(definition: CustomStrategyDefinition, isUnlocked: boolean = true) {
    this.definition = definition;
    this.strategy = definition.id as TargetingStrategy;
    this.executor = new CustomStrategyExecutor();
    this._isUnlocked = isUnlocked;
  }

  /**
   * Calculate target using custom strategy
   */
  async calculate(enemies: Enemy[], dragon: Dragon): Promise<Enemy | null> {
    if (!this._isUnlocked) {
      return null;
    }

    // Create execution context
    const context: CustomStrategyContext = {
      dragon,
      enemies,
      threatAssessment: {} as ThreatAssessment, // Would be injected
      rangeDetection: {} as RangeDetection, // Would be injected
      parameters: this.definition.parameters.reduce(
        (acc, param) => {
          acc[param.name] = param.defaultValue;
          return acc;
        },
        {} as Record<string, unknown>,
      ),
      gameState: {},
      utilities: this.createUtilities(),
    };

    // Execute custom strategy
    const result = await this.executor.execute(this.definition, context);

    return result.target;
  }

  /**
   * Get strategy description
   */
  getDescription(): string {
    return this.definition.description;
  }

  /**
   * Check if strategy is unlocked
   */
  isUnlocked(): boolean {
    return this._isUnlocked;
  }

  /**
   * Create utility functions for custom strategies
   */
  private createUtilities(): CustomStrategyUtilities {
    return {
      calculateDistance: (dragon: Dragon, enemy: Enemy) => {
        const dx = dragon.position.x - enemy.position.x;
        const dy = dragon.position.y - enemy.position.y;
        return Math.sqrt(dx * dx + dy * dy);
      },

      calculateThreatLevel: (enemy: Enemy, _dragon: Dragon) => {
        // Simplified threat calculation
        return enemy.health.current / enemy.health.max;
      },

      isInRange: (dragon: Dragon, enemy: Enemy) => {
        return this.createUtilities().calculateDistance(dragon, enemy) <= dragon.attackRange;
      },

      getEnemiesInRange: (enemies: Enemy[], dragon: Dragon) => {
        return enemies.filter((enemy) => this.createUtilities().isInRange(dragon, enemy));
      },

      sortByDistance: (enemies: Enemy[], dragon: Dragon) => {
        return enemies.sort((a, b) => {
          const distA = this.createUtilities().calculateDistance(dragon, a);
          const distB = this.createUtilities().calculateDistance(dragon, b);
          return distA - distB;
        });
      },

      sortByThreat: (enemies: Enemy[], dragon: Dragon) => {
        return enemies.sort((a, b) => {
          const threatA = this.createUtilities().calculateThreatLevel(a, dragon);
          const threatB = this.createUtilities().calculateThreatLevel(b, dragon);
          return threatB - threatA;
        });
      },

      filterByHealth: (enemies: Enemy[], minHealth: number, maxHealth: number) => {
        return enemies.filter((enemy) => {
          const healthPercent = enemy.health.current / enemy.health.max;
          return healthPercent >= minHealth && healthPercent <= maxHealth;
        });
      },

      filterByElement: (enemies: Enemy[], element: string) => {
        return enemies.filter((enemy) => enemy.elementalType === element);
      },

      getRandomEnemy: (enemies: Enemy[]) => {
        if (enemies.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * enemies.length);
        return enemies[randomIndex] || null;
      },

      getClosestEnemy: (enemies: Enemy[], dragon: Dragon) => {
        if (enemies.length === 0) return null;
        const sorted = this.createUtilities().sortByDistance(enemies, dragon);
        return sorted[0] || null;
      },

      getHighestThreatEnemy: (enemies: Enemy[], _dragon: Dragon) => {
        if (enemies.length === 0) return null;
        const sorted = this.createUtilities().sortByThreat(enemies, _dragon);
        return sorted[0] || null;
      },
    };
  }
}

/**
 * Custom strategy registry
 */
export class CustomStrategyRegistry {
  private strategies: Map<string, CustomStrategyDefinition> = new Map();
  private handlers: Map<string, CustomStrategyHandler> = new Map();

  /**
   * Register custom strategy
   */
  register(definition: CustomStrategyDefinition): boolean {
    const validator = new CustomStrategyValidator();
    const validation = validator.validateDefinition(definition);

    if (!validation.isValid) {
      console.error('Failed to register custom strategy:', validation.errors);
      return false;
    }

    this.strategies.set(definition.id, definition);
    this.handlers.set(definition.id, new CustomStrategyHandler(definition));

    console.log(`Registered custom strategy: ${definition.name}`);
    return true;
  }

  /**
   * Unregister custom strategy
   */
  unregister(strategyId: string): boolean {
    const removed = this.strategies.delete(strategyId);
    this.handlers.delete(strategyId);

    if (removed) {
      console.log(`Unregistered custom strategy: ${strategyId}`);
    }

    return removed;
  }

  /**
   * Get custom strategy definition
   */
  getDefinition(strategyId: string): CustomStrategyDefinition | undefined {
    return this.strategies.get(strategyId);
  }

  /**
   * Get custom strategy handler
   */
  getHandler(strategyId: string): CustomStrategyHandler | undefined {
    return this.handlers.get(strategyId);
  }

  /**
   * Get all registered strategies
   */
  getAllStrategies(): CustomStrategyDefinition[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get strategies by category
   */
  getStrategiesByCategory(category: string): CustomStrategyDefinition[] {
    return this.getAllStrategies().filter((strategy) => strategy.category === category);
  }

  /**
   * Get strategies by tag
   */
  getStrategiesByTag(tag: string): CustomStrategyDefinition[] {
    return this.getAllStrategies().filter((strategy) => strategy.tags.includes(tag));
  }

  /**
   * Clear all custom strategies
   */
  clear(): void {
    this.strategies.clear();
    this.handlers.clear();
    console.log('Cleared all custom strategies');
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalStrategies: number;
    strategiesByCategory: Record<string, number>;
    strategiesByTag: Record<string, number>;
  } {
    const strategies = this.getAllStrategies();
    const strategiesByCategory: Record<string, number> = {};
    const strategiesByTag: Record<string, number> = {};

    for (const strategy of strategies) {
      strategiesByCategory[strategy.category] = (strategiesByCategory[strategy.category] || 0) + 1;

      for (const tag of strategy.tags) {
        strategiesByTag[tag] = (strategiesByTag[tag] || 0) + 1;
      }
    }

    return {
      totalStrategies: strategies.length,
      strategiesByCategory,
      strategiesByTag,
    };
  }
}

/**
 * Create custom strategy registry
 */
export function createCustomStrategyRegistry(): CustomStrategyRegistry {
  return new CustomStrategyRegistry();
}

/**
 * Utility functions for custom strategy development
 */
export const CustomStrategyUtils = {
  /**
   * Create a basic custom strategy definition
   */
  createBasicDefinition(
    id: string,
    name: string,
    description: string,
    code: string,
  ): CustomStrategyDefinition {
    return {
      id,
      name,
      description,
      version: '1.0.0',
      author: 'Player',
      category: 'combat',
      tags: ['custom'],
      parameters: [],
      code,
      validationRules: [],
      dependencies: [],
    };
  },

  /**
   * Validate custom strategy code
   */
  validateCode(code: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const validator = new CustomStrategyValidator();
    const definition = CustomStrategyUtils.createBasicDefinition(
      'test',
      'Test',
      'Test strategy',
      code,
    );
    return validator.validateDefinition(definition);
  },

  /**
   * Get example custom strategy code
   */
  getExampleCode(): string {
    return `
      // Example custom strategy: Target enemy with lowest health
      const enemiesInRange = utils.getEnemiesInRange(enemies, dragon);
      
      if (enemiesInRange.length === 0) {
        return { target: null, confidence: 0, reasoning: 'No enemies in range' };
      }
      
      // Find enemy with lowest health percentage
      let lowestHealthEnemy = null;
      let lowestHealth = 1;
      
      for (const enemy of enemiesInRange) {
        const healthPercent = enemy.health / enemy.maxHealth;
        if (healthPercent < lowestHealth) {
          lowestHealth = healthPercent;
          lowestHealthEnemy = enemy;
        }
      }
      
      return {
        target: lowestHealthEnemy,
        confidence: 0.8,
        reasoning: 'Targeting enemy with lowest health for quick elimination'
      };
    `;
  },
};
