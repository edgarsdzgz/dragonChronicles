/**
 * Object Pooling System for Draconia Chronicles
 * Manages reusable game objects to reduce garbage collection and improve performance
 */

/**
 * Vector2 interface for position data
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Poolable object interface
 */
export interface PoolableObject {
  id: string;
  active: boolean;
  reset(): void;
}

/**
 * Object pool configuration
 */
export interface ObjectPoolConfig<T extends PoolableObject> {
  initialSize: number;
  maxSize: number;
  growthFactor: number;
  shrinkThreshold: number;
  resetFunction: (_obj: T) => void;
  destroyFunction: (_obj: T) => void;
}

/**
 * Object pool statistics
 */
export interface PoolStats {
  totalObjects: number;
  activeObjects: number;
  inactiveObjects: number;
  peakUsage: number;
  allocationCount: number;
  deallocationCount: number;
  hitRate: number;
}

/**
 * Object pool for managing reusable objects
 */
export class ObjectPool<T extends PoolableObject> {
  private pool: T[] = [];
  private activeObjects: Set<T> = new Set();
  private config: ObjectPoolConfig<T>;
  private stats: PoolStats;
  private createFunction: () => T;

  constructor(createFunction: () => T, config: Partial<ObjectPoolConfig<T>> = {}) {
    this.createFunction = createFunction;
    this.config = {
      initialSize: 10,
      maxSize: 1000,
      growthFactor: 1.5,
      shrinkThreshold: 0.3,
      resetFunction: (_obj: T) => {},
      destroyFunction: (_obj: T) => {},
      ...config
    } as ObjectPoolConfig<T>;

    this.stats = {
      totalObjects: 0,
      activeObjects: 0,
      inactiveObjects: 0,
      peakUsage: 0,
      allocationCount: 0,
      deallocationCount: 0,
      hitRate: 0
    };

    this.initializePool();
  }

  /**
   * Initialize the pool with initial objects
   */
  private initializePool(): void {
    for (let i = 0; i < this.config.initialSize; i++) {
      const obj = this.createFunction();
      obj.active = false;
      this.pool.push(obj);
      this.stats.totalObjects++;
    }
    this.stats.inactiveObjects = this.pool.length;
  }

  /**
   * Get an object from the pool
   */
  public get(): T {
    let obj: T | undefined;

    // Try to find an inactive object
    for (let i = 0; i < this.pool.length; i++) {
      const poolObj = this.pool[i];
      if (poolObj && !poolObj.active) {
        obj = poolObj;
        break;
      }
    }

    // Create new object if none available
    if (!obj) {
      if (this.pool.length < this.config.maxSize) {
        obj = this.createFunction();
        this.pool.push(obj);
        this.stats.totalObjects++;
      } else {
        // Pool is full, reuse oldest inactive object
        const oldestObj = this.pool[0];
        if (oldestObj) {
          obj = oldestObj;
          this.config.destroyFunction(obj);
        } else {
          obj = this.createFunction();
        }
      }
    }

    // Activate the object
    if (obj) {
      obj.active = true;
      obj.reset();
      this.config.resetFunction(obj);
      this.activeObjects.add(obj);
      this.stats.activeObjects++;
      this.stats.allocationCount++;
    }

    // Update peak usage
    if (this.stats.activeObjects > this.stats.peakUsage) {
      this.stats.peakUsage = this.stats.activeObjects;
    }

    // Update hit rate
    this.updateHitRate();

    return obj!;
  }

  /**
   * Return an object to the pool
   */
  public release(obj: T): void {
    if (!this.activeObjects.has(obj)) {
      return; // Object not in active set
    }

    obj.active = false;
    this.activeObjects.delete(obj);
    this.stats.activeObjects--;
    this.stats.deallocationCount++;

    // Update hit rate
    this.updateHitRate();
  }

  /**
   * Release all active objects
   */
  public releaseAll(): void {
    for (const obj of this.activeObjects) {
      obj.active = false;
      this.stats.activeObjects--;
      this.stats.deallocationCount++;
    }
    this.activeObjects.clear();
    this.updateHitRate();
  }

  /**
   * Get pool statistics
   */
  public getStats(): PoolStats {
    this.stats.inactiveObjects = this.pool.length - this.stats.activeObjects;
    return { ...this.stats };
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const totalRequests = this.stats.allocationCount + this.stats.deallocationCount;
    if (totalRequests > 0) {
      this.stats.hitRate = this.stats.allocationCount / totalRequests;
    }
  }

  /**
   * Optimize pool size based on usage patterns
   */
  public optimize(): void {
    const usageRatio = this.stats.activeObjects / this.pool.length;
    
    // Grow pool if usage is high
    if (usageRatio > 0.8 && this.pool.length < this.config.maxSize) {
      const growthSize = Math.floor(this.pool.length * (this.config.growthFactor - 1));
      for (let i = 0; i < growthSize; i++) {
        const obj = this.createFunction();
        obj.active = false;
        this.pool.push(obj);
        this.stats.totalObjects++;
      }
    }
    
    // Shrink pool if usage is low
    if (usageRatio < this.config.shrinkThreshold && this.pool.length > this.config.initialSize) {
      const shrinkSize = Math.floor(this.pool.length * 0.2);
      for (let i = 0; i < shrinkSize; i++) {
        const obj = this.pool.pop();
        if (obj) {
          this.config.destroyFunction(obj);
          this.stats.totalObjects--;
        }
      }
    }
  }

  /**
   * Clear the entire pool
   */
  public clear(): void {
    for (const obj of this.pool) {
      this.config.destroyFunction(obj);
    }
    this.pool = [];
    this.activeObjects.clear();
    this.stats = {
      totalObjects: 0,
      activeObjects: 0,
      inactiveObjects: 0,
      peakUsage: 0,
      allocationCount: 0,
      deallocationCount: 0,
      hitRate: 0
    };
  }
}

/**
 * Pool manager for multiple object pools
 */
export class PoolManager {
  private pools: Map<string, ObjectPool<PoolableObject>> = new Map();
  private globalStats: Record<string, PoolStats> = {};

  /**
   * Create a new object pool
   */
  public createPool<T extends PoolableObject>(
    name: string,
    createFunction: () => T,
    config?: Partial<ObjectPoolConfig<T>>
  ): ObjectPool<T> {
    const pool = new ObjectPool(createFunction, config);
    this.pools.set(name, pool as unknown as ObjectPool<PoolableObject>);
    return pool;
  }

  /**
   * Get an object pool by name
   */
  public getPool<T extends PoolableObject>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name) as unknown as ObjectPool<T>;
  }

  /**
   * Get object from pool
   */
  public get<T extends PoolableObject>(poolName: string): T | undefined {
    const pool = this.getPool<T>(poolName);
    return pool?.get();
  }

  /**
   * Release object to pool
   */
  public release<T extends PoolableObject>(poolName: string, obj: T): void {
    const pool = this.getPool<T>(poolName);
    pool?.release(obj);
  }

  /**
   * Get global statistics
   */
  public getGlobalStats(): Record<string, PoolStats> {
    this.globalStats = {};
    for (const [name, pool] of this.pools) {
      this.globalStats[name] = pool.getStats();
    }
    return this.globalStats;
  }

  /**
   * Optimize all pools
   */
  public optimizeAll(): void {
    for (const pool of this.pools.values()) {
      pool.optimize();
    }
  }

  /**
   * Clear all pools
   */
  public clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
    this.pools.clear();
    this.globalStats = {};
  }
}

/**
 * Default pool manager instance
 */
export const defaultPoolManager = new PoolManager();
