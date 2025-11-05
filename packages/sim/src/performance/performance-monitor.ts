/**
 * Performance Monitoring System for Draconia Chronicles
 * Monitors and optimizes game performance in real-time
 */

import { PoolManager } from './object-pool.js';
import { SpatialCullingSystem } from './spatial-culling.js';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  memoryLimit: number;
  activeObjects: number;
  pooledObjects: number;
  culledObjects: number;
  updateTime: number;
  renderTime: number;
  physicsTime: number;
  aiTime: number;
  lastUpdate: number;
}

/**
 * Performance thresholds
 */
export interface PerformanceThresholds {
  targetFPS: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
  maxUpdateTime: number;
  maxRenderTime: number;
  maxPhysicsTime: number;
  maxAITime: number;
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  id: string;
  type: 'fps_drop' | 'memory_leak' | 'frame_time_high' | 'update_slow' | 'render_slow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: number;
  metadata: Record<string, unknown>;
}

/**
 * Performance optimization settings
 */
export interface OptimizationSettings {
  enableObjectPooling: boolean;
  enableSpatialCulling: boolean;
  enableLOD: boolean;
  enableBatching: boolean;
  enableCompression: boolean;
  maxActiveObjects: number;
  cullingDistance: number;
  lodLevels: number;
  batchSize: number;
}

/**
 * Performance monitor configuration
 */
export interface PerformanceMonitorConfig {
  updateInterval: number;
  alertThresholds: PerformanceThresholds;
  optimizationSettings: OptimizationSettings;
  enableAutoOptimization: boolean;
  enableAlerts: boolean;
  enableLogging: boolean;
}

/**
 * Performance monitoring system
 */
export class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private objectPoolManager: PoolManager | null = null;
  private spatialCullingSystem: SpatialCullingSystem | null = null;
  private lastUpdate: number = 0;
  private frameCount: number = 0;
  private frameTimeHistory: number[] = [];
  private memoryHistory: number[] = [];

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = {
      updateInterval: 1000, // 1 second
      alertThresholds: {
        targetFPS: 60,
        maxFrameTime: 16.67, // 60fps
        maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        maxUpdateTime: 8,
        maxRenderTime: 8,
        maxPhysicsTime: 4,
        maxAITime: 4
      },
      optimizationSettings: {
        enableObjectPooling: true,
        enableSpatialCulling: true,
        enableLOD: true,
        enableBatching: true,
        enableCompression: false,
        maxActiveObjects: 1000,
        cullingDistance: 1000,
        lodLevels: 3,
        batchSize: 100
      },
      enableAutoOptimization: true,
      enableAlerts: true,
      enableLogging: false,
      ...config
    };

    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      memoryLimit: 0,
      activeObjects: 0,
      pooledObjects: 0,
      culledObjects: 0,
      updateTime: 0,
      renderTime: 0,
      physicsTime: 0,
      aiTime: 0,
      lastUpdate: 0
    };
  }

  /**
   * Set object pool manager
   */
  public setObjectPoolManager(manager: PoolManager): void {
    this.objectPoolManager = manager;
  }

  /**
   * Set spatial culling system
   */
  public setSpatialCullingSystem(system: SpatialCullingSystem): void {
    this.spatialCullingSystem = system;
  }

  /**
   * Update performance metrics
   */
  public update(deltaTime: number): void {
    const currentTime = Date.now();
    
    if (currentTime - this.lastUpdate < this.config.updateInterval) {
      return;
    }

    this.lastUpdate = currentTime;
    this.frameCount++;

    // Update frame time
    this.updateFrameTime(deltaTime);

    // Update memory usage
    this.updateMemoryUsage();

    // Update object counts
    this.updateObjectCounts();

    // Update performance times
    this.updatePerformanceTimes(deltaTime);

    // Check for alerts
    if (this.config.enableAlerts) {
      this.checkAlerts();
    }

    // Auto-optimize if enabled
    if (this.config.enableAutoOptimization) {
      this.autoOptimize();
    }
  }

  /**
   * Update frame time metrics
   */
  private updateFrameTime(deltaTime: number): void {
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    this.metrics.frameTime = avgFrameTime;
    this.metrics.fps = 1000 / avgFrameTime;
  }

  /**
   * Update memory usage
   */
  private updateMemoryUsage(): void {
    if (typeof performance !== 'undefined' && (performance as unknown as Record<string, unknown>).memory) {
      const memory = (performance as unknown as Record<string, unknown>).memory as Record<string, unknown>;
      this.metrics.memoryUsage = (memory.usedJSHeapSize as number) || 0;
      this.metrics.memoryLimit = (memory.jsHeapSizeLimit as number) || 0;
    } else {
      // Fallback for environments without performance.memory
      this.metrics.memoryUsage = 0;
      this.metrics.memoryLimit = 0;
    }

    this.memoryHistory.push(this.metrics.memoryUsage);
    if (this.memoryHistory.length > 60) {
      this.memoryHistory.shift();
    }
  }

  /**
   * Update object counts
   */
  private updateObjectCounts(): void {
    if (this.objectPoolManager) {
      const globalStats = this.objectPoolManager.getGlobalStats();
      this.metrics.activeObjects = Object.values(globalStats).reduce((sum, stats) => sum + stats.activeObjects, 0);
      this.metrics.pooledObjects = Object.values(globalStats).reduce((sum, stats) => sum + stats.totalObjects, 0);
    }

    if (this.spatialCullingSystem) {
      const cullingStats = this.spatialCullingSystem.getStats();
      this.metrics.culledObjects = cullingStats.culledObjects;
    }
  }

  /**
   * Update performance times
   */
  private updatePerformanceTimes(_deltaTime: number): void {
    // These would be populated by timing different systems
    // For now, using placeholder values
    this.metrics.updateTime = 0;
    this.metrics.renderTime = 0;
    this.metrics.physicsTime = 0;
    this.metrics.aiTime = 0;
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(): void {
    const thresholds = this.config.alertThresholds;

    // Check FPS
    if (this.metrics.fps < thresholds.targetFPS) {
      this.addAlert('fps_drop', 'high', 
        `FPS dropped to ${this.metrics.fps.toFixed(1)} (target: ${thresholds.targetFPS})`,
        thresholds.targetFPS, this.metrics.fps);
    }

    // Check frame time
    if (this.metrics.frameTime > thresholds.maxFrameTime) {
      this.addAlert('frame_time_high', 'medium',
        `Frame time ${this.metrics.frameTime.toFixed(2)}ms exceeds threshold ${thresholds.maxFrameTime}ms`,
        thresholds.maxFrameTime, this.metrics.frameTime);
    }

    // Check memory usage
    if (this.metrics.memoryUsage > thresholds.maxMemoryUsage) {
      this.addAlert('memory_leak', 'critical',
        `Memory usage ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB exceeds threshold ${(thresholds.maxMemoryUsage / 1024 / 1024).toFixed(1)}MB`,
        thresholds.maxMemoryUsage, this.metrics.memoryUsage);
    }

    // Check update time
    if (this.metrics.updateTime > thresholds.maxUpdateTime) {
      this.addAlert('update_slow', 'medium',
        `Update time ${this.metrics.updateTime.toFixed(2)}ms exceeds threshold ${thresholds.maxUpdateTime}ms`,
        thresholds.maxUpdateTime, this.metrics.updateTime);
    }

    // Check render time
    if (this.metrics.renderTime > thresholds.maxRenderTime) {
      this.addAlert('render_slow', 'medium',
        `Render time ${this.metrics.renderTime.toFixed(2)}ms exceeds threshold ${thresholds.maxRenderTime}ms`,
        thresholds.maxRenderTime, this.metrics.renderTime);
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    threshold: number,
    actualValue: number
  ): void {
    const alert: PerformanceAlert = {
      id: `${type}_${Date.now()}`,
      type,
      severity,
      message,
      threshold,
      actualValue,
      timestamp: Date.now(),
      metadata: {}
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  /**
   * Auto-optimize performance
   */
  private autoOptimize(): void {
    const settings = this.config.optimizationSettings;

    // Optimize object pooling
    if (settings.enableObjectPooling && this.objectPoolManager) {
      this.objectPoolManager.optimizeAll();
    }

    // Optimize spatial culling
    if (settings.enableSpatialCulling && this.spatialCullingSystem) {
      // Spatial culling optimization would be handled by the system itself
    }

    // Memory optimization
    if (this.metrics.memoryUsage > this.config.alertThresholds.maxMemoryUsage * 0.8) {
      this.optimizeForMemory();
    }

    // Frame rate optimization
    if (this.metrics.fps < this.config.alertThresholds.targetFPS * 0.9) {
      this.optimizeForFPS();
    }

    // Frame time optimization
    if (this.metrics.frameTime > this.config.alertThresholds.maxFrameTime * 0.8) {
      this.optimizeForFrameTime();
    }
  }

  /**
   * Optimize for memory usage
   */
  private optimizeForMemory(): void {
    if (this.objectPoolManager) {
      this.objectPoolManager.optimizeAll();
    }
  }

  /**
   * Optimize for FPS
   */
  private optimizeForFPS(): void {
    // Reduce quality settings, enable more aggressive culling
    const settings = this.config.optimizationSettings;
    if (settings.enableLOD) {
      // Reduce LOD distance
      settings.cullingDistance *= 0.9;
    }
  }

  /**
   * Optimize for frame time
   */
  private optimizeForFrameTime(): void {
    // Reduce batch sizes, enable more aggressive optimization
    const settings = this.config.optimizationSettings;
    settings.batchSize = Math.max(10, Math.floor(settings.batchSize * 0.9));
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance alerts
   */
  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear alerts
   */
  public clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get performance statistics
   */
  public getStatistics(): Record<string, unknown> {
    return {
      metrics: this.metrics,
      alerts: this.alerts,
      frameTimeHistory: this.frameTimeHistory,
      memoryHistory: this.memoryHistory,
      config: this.config
    };
  }

  /**
   * Reset performance monitor
   */
  public reset(): void {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      memoryLimit: 0,
      activeObjects: 0,
      pooledObjects: 0,
      culledObjects: 0,
      updateTime: 0,
      renderTime: 0,
      physicsTime: 0,
      aiTime: 0,
      lastUpdate: 0
    };
    this.alerts = [];
    this.frameTimeHistory = [];
    this.memoryHistory = [];
    this.frameCount = 0;
    this.lastUpdate = 0;
  }
}
