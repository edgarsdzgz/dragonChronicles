/**
 * Performance Integration System for Draconia Chronicles
 * Coordinates performance optimization systems with game systems
 */

import { PoolManager } from './object-pool.js';
import { SpatialCullingSystem } from './spatial-culling.js';
import { PerformanceMonitor } from './performance-monitor.js';
// Performance integration system - no direct combat types needed

/**
 * Performance integration configuration
 */
export interface PerformanceIntegrationConfig {
  enableObjectPooling: boolean;
  enableSpatialCulling: boolean;
  enablePerformanceMonitoring: boolean;
  enableAutoOptimization: boolean;
  updateInterval: number;
  optimizationThresholds: {
    fpsThreshold: number;
    memoryThreshold: number;
    frameTimeThreshold: number;
  };
}

/**
 * Performance integration state
 */
export interface PerformanceIntegrationState {
  isOptimizing: boolean;
  lastOptimization: number;
  optimizationCount: number;
  performanceLevel: 'low' | 'medium' | 'high' | 'ultra';
  activeOptimizations: string[];
}

/**
 * Performance integration system
 */
export class PerformanceIntegrationSystem {
  private config: PerformanceIntegrationConfig;
  private state: PerformanceIntegrationState;
  private poolManager: PoolManager;
  private spatialCullingSystem: SpatialCullingSystem;
  private performanceMonitor: PerformanceMonitor;
  private lastUpdate: number = 0;

  constructor(config: Partial<PerformanceIntegrationConfig> = {}) {
    this.config = {
      enableObjectPooling: true,
      enableSpatialCulling: true,
      enablePerformanceMonitoring: true,
      enableAutoOptimization: true,
      updateInterval: 1000, // 1 second
      optimizationThresholds: {
        fpsThreshold: 50,
        memoryThreshold: 80 * 1024 * 1024, // 80MB
        frameTimeThreshold: 20
      },
      ...config
    };

    this.state = {
      isOptimizing: false,
      lastOptimization: 0,
      optimizationCount: 0,
      performanceLevel: 'medium',
      activeOptimizations: []
    };

    // Initialize performance systems
    this.poolManager = new PoolManager();
    this.spatialCullingSystem = new SpatialCullingSystem();
    this.performanceMonitor = new PerformanceMonitor();

    // Connect systems
    this.performanceMonitor.setObjectPoolManager(this.poolManager);
    this.performanceMonitor.setSpatialCullingSystem(this.spatialCullingSystem);
  }

  /**
   * Update the performance integration system
   */
  public update(deltaTime: number): void {
    const currentTime = Date.now();
    
    if (currentTime - this.lastUpdate < this.config.updateInterval) {
      return;
    }

    this.lastUpdate = currentTime;

    // Update performance monitor
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.update(deltaTime);
    }

    // Check if optimization is needed
    if (this.config.enableAutoOptimization) {
      this.checkOptimizationNeeds();
    }

    // Update performance level
    this.updatePerformanceLevel();
  }

  /**
   * Check if optimization is needed
   */
  private checkOptimizationNeeds(): void {
    const metrics = this.performanceMonitor.getMetrics();
    const thresholds = this.config.optimizationThresholds;

    const needsOptimization = 
      metrics.fps < thresholds.fpsThreshold ||
      metrics.memoryUsage > thresholds.memoryThreshold ||
      metrics.frameTime > thresholds.frameTimeThreshold;

    if (needsOptimization && !this.state.isOptimizing) {
      this.triggerOptimization();
    }
  }

  /**
   * Trigger performance optimization
   */
  private triggerOptimization(): void {
    this.state.isOptimizing = true;
    this.state.lastOptimization = Date.now();
    this.state.optimizationCount++;

    // Optimize object pooling
    if (this.config.enableObjectPooling) {
      this.optimizeObjectPooling();
      this.state.activeOptimizations.push('object_pooling');
    }

    // Optimize spatial culling
    if (this.config.enableSpatialCulling) {
      this.optimizeSpatialCulling();
      this.state.activeOptimizations.push('spatial_culling');
    }

    // Optimize performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.optimizePerformanceMonitoring();
      this.state.activeOptimizations.push('performance_monitoring');
    }

    // Clear optimization flag after a delay
    setTimeout(() => {
      this.state.isOptimizing = false;
      this.state.activeOptimizations = [];
    }, 5000); // 5 seconds
  }

  /**
   * Optimize object pooling
   */
  private optimizeObjectPooling(): void {
    this.poolManager.optimizeAll();
  }

  /**
   * Optimize spatial culling
   */
  private optimizeSpatialCulling(): void {
    // Spatial culling optimization is handled internally
    // This could trigger more aggressive culling settings
  }

  /**
   * Optimize performance monitoring
   */
  private optimizePerformanceMonitoring(): void {
    // Performance monitoring optimization
    // This could adjust monitoring intervals or thresholds
  }

  /**
   * Update performance level based on current metrics
   */
  private updatePerformanceLevel(): void {
    const metrics = this.performanceMonitor.getMetrics();

    if (metrics.fps >= 60 && metrics.memoryUsage < 50 * 1024 * 1024) {
      this.state.performanceLevel = 'ultra';
    } else if (metrics.fps >= 45 && metrics.memoryUsage < 80 * 1024 * 1024) {
      this.state.performanceLevel = 'high';
    } else if (metrics.fps >= 30 && metrics.memoryUsage < 120 * 1024 * 1024) {
      this.state.performanceLevel = 'medium';
    } else {
      this.state.performanceLevel = 'low';
    }
  }

  /**
   * Get object pool manager
   */
  public getPoolManager(): PoolManager {
    return this.poolManager;
  }

  /**
   * Get spatial culling system
   */
  public getSpatialCullingSystem(): SpatialCullingSystem {
    return this.spatialCullingSystem;
  }

  /**
   * Get performance monitor
   */
  public getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  /**
   * Get integration state
   */
  public getState(): PerformanceIntegrationState {
    return { ...this.state };
  }

  /**
   * Get performance statistics
   */
  public getStatistics(): Record<string, unknown> {
    return {
      state: this.state,
      metrics: this.performanceMonitor.getMetrics(),
      alerts: this.performanceMonitor.getAlerts(),
      poolStats: this.poolManager.getGlobalStats(),
      cullingStats: this.spatialCullingSystem.getStats()
    };
  }

  /**
   * Reset the integration system
   */
  public reset(): void {
    this.state = {
      isOptimizing: false,
      lastOptimization: 0,
      optimizationCount: 0,
      performanceLevel: 'medium',
      activeOptimizations: []
    };
    this.poolManager.clearAll();
    this.spatialCullingSystem.clear();
    this.performanceMonitor.reset();
  }
}
