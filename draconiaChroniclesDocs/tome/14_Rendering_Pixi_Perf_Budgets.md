--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/14*Rendering*Pixi*Perf*Budgets.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 14 — Rendering & Performance Budgets

## PixiJS Integration Architecture

### Rendering Pipeline

```typescript

export interface RenderingPipeline {
  // Core Systems
  pixiApp: Application;
  renderer: Renderer;
  stage: Container;

  // Layer Management
  layers: RenderLayer[];
  layerOrder: string[];

  // Performance
  frameRate: number;
  frameTime: number;
  performanceBudget: PerformanceBudget;

  // Optimization
  objectPooling: ObjectPooling;
  culling: CullingSystem;
  lod: LODSystem;
}

```javascript

### PixiJS Application Setup

```typescript

export class PixiApplication {
  private app: Application;
  private layers: Map<string, Container> = new Map();

  constructor(config: PixiConfig) {
    this.app = new Application({
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor,
      antialias: config.antialias,
      resolution: config.resolution,
      autoDensity: true,
      powerPreference: 'high-performance'
    });

    this.setupLayers();
    this.setupEventHandlers();
  }

  private setupLayers(): void {
    // Background layer (terrain, environment)
    this.layers.set('background', new Container());

    // Game objects layer (enemies, projectiles)
    this.layers.set('gameObjects', new Container());

    // Effects layer (particles, explosions)
    this.layers.set('effects', new Container());

    // UI layer (overlays, indicators)
    this.layers.set('ui', new Container());

    // Add layers to stage in order
    this.layers.forEach(layer => this.app.stage.addChild(layer));
  }

  private setupEventHandlers(): void {
    // Resize handling
    window.addEventListener('resize', () => this.handleResize());

    // Visibility change handling
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

    // Performance monitoring
    this.app.ticker.add(() => this.updatePerformance());
  }
}

```javascript

## Performance Budgets

### Target Performance Metrics

```typescript

export interface PerformanceTargets {
  // Frame Rate
  desktopFPS: number; // 60 fps target
  mobileFPS: number; // 40 fps minimum

  // Frame Time
  desktopFrameTime: number; // 16.67ms target
  mobileFrameTime: number; // 25ms maximum

  // Entity Limits
  maxEnemies: number; // 200 active, 400 burst
  maxProjectiles: number; // 600 per second
  maxEffects: number; // 100 active effects

  // Memory
  maxMemoryUsage: number; // 512MB maximum
  maxTextureMemory: number; // 256MB maximum

  // Bundle Size
  maxBundleSize: number; // 200KB gzipped
  maxAssetSize: number; // 50MB total assets
}

```javascript

### Performance Budget Implementation

```typescript

export class PerformanceBudget {
  private targets: PerformanceTargets;
  private currentMetrics: PerformanceMetrics;
  private budgetStatus: BudgetStatus;

  constructor(targets: PerformanceTargets) {
    this.targets = targets;
    this.currentMetrics = this.initializeMetrics();
    this.budgetStatus = this.initializeBudgetStatus();
  }

  updateMetrics(metrics: PerformanceMetrics): void {
    this.currentMetrics = metrics;
    this.updateBudgetStatus();
    this.applyOptimizations();
  }

  private updateBudgetStatus(): void {
    this.budgetStatus = {
      fps: this.calculateFPSStatus(),
      frameTime: this.calculateFrameTimeStatus(),
      entities: this.calculateEntityStatus(),
      memory: this.calculateMemoryStatus(),
      overall: this.calculateOverallStatus()
    };
  }

  private applyOptimizations(): void {
    if (this.budgetStatus.overall === 'critical') {
      this.enableAggressiveOptimizations();
    } else if (this.budgetStatus.overall === 'warning') {
      this.enableModerateOptimizations();
    } else {
      this.enableMinimalOptimizations();
    }
  }

  private enableAggressiveOptimizations(): void {
    // Reduce quality to maintain playability
    this.setLODLevel(3); // Maximum LOD reduction
    this.enableObjectCulling(true);
    this.reduceParticleCount(0.5); // 50% reduction
    this.disableNonEssentialEffects();
  }

  private enableModerateOptimizations(): void {
    // Balance quality and performance
    this.setLODLevel(2);
    this.enableObjectCulling(true);
    this.reduceParticleCount(0.8); // 20% reduction
  }

  private enableMinimalOptimizations(): void {
    // Maintain high quality
    this.setLODLevel(1);
    this.enableObjectCulling(false);
    this.reduceParticleCount(1.0); // No reduction
  }
}

```text

## Object Pooling System

### Pool Architecture

```typescript

export interface ObjectPool<T> {
  active: T[];
  inactive: T[];
  create: () => T;
  acquire: () => T;
  release: (obj: T) => void;
  cleanup: () => void;
  size: number;
  maxSize: number;
}

export class PixiObjectPool<T extends DisplayObject> implements ObjectPool<T> {
  private active: T[] = [];
  private inactive: T[] = [];
  private factory: () => T;
  private maxSize: number;

  constructor(factory: () => T, maxSize: number = 100) {
    this.factory = factory;
    this.maxSize = maxSize;
    this.preWarm();
  }

  private preWarm(): void {
    // Pre-create objects to avoid allocation during gameplay
    for (let i = 0; i < Math.min(10, this.maxSize); i++) {
      const obj = this.factory();
      this.inactive.push(obj);
    }
  }

  acquire(): T {
    let obj: T;

    if (this.inactive.length > 0) {
      obj = this.inactive.pop()!;
    } else if (this.active.length < this.maxSize) {
      obj = this.factory();
    } else {
      // Pool is full, reuse oldest object
      obj = this.active.shift()!;
      this.resetObject(obj);
    }

    this.active.push(obj);
    return obj;
  }

  release(obj: T): void {
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.resetObject(obj);
      this.inactive.push(obj);
    }
  }

  private resetObject(obj: T): void {
    // Reset object to default state
    obj.visible = false;
    obj.alpha = 1;
    obj.rotation = 0;
    obj.scale.set(1);
    obj.position.set(0, 0);

    // Remove from parent if attached
    if (obj.parent) {
      obj.parent.removeChild(obj);
    }
  }

  cleanup(): void {
    // Clean up all objects
    [...this.active, ...this.inactive].forEach(obj => {
      if (obj.parent) {
        obj.parent.removeChild(obj);
      }
      obj.destroy();
    });

    this.active = [];
    this.inactive = [];
  }
}

```javascript

### Combat Object Pools

```typescript

export class CombatObjectPools {
  public enemies: PixiObjectPool<Sprite>;
  public projectiles: PixiObjectPool<Sprite>;
  public effects: PixiObjectPool<Container>;
  public damageNumbers: PixiObjectPool<Text>;

  constructor() {
    this.enemies = new PixiObjectPool(
      () => new Sprite(Texture.from('enemy_default')),
      200 // Max 200 enemies
    );

    this.projectiles = new PixiObjectPool(
      () => new Sprite(Texture.from('projectile_default')),
      100 // Max 100 projectiles
    );

    this.effects = new PixiObjectPool(
      () => new Container(),
      50 // Max 50 effects
    );

    this.damageNumbers = new PixiObjectPool(
      () => new Text('0', { fontSize: 16, fill: 0xffffff }),
      30 // Max 30 damage numbers
    );
  }

  cleanup(): void {
    this.enemies.cleanup();
    this.projectiles.cleanup();
    this.effects.cleanup();
    this.damageNumbers.cleanup();
  }
}

```text

## Culling System

### Viewport Culling

```typescript

export class ViewportCulling {
  private viewport: Rectangle;
  private cullingMargin: number;

  constructor(viewport: Rectangle, margin: number = 100) {
    this.viewport = viewport;
    this.cullingMargin = margin;
  }

  updateViewport(viewport: Rectangle): void {
    this.viewport = viewport;
  }

  isObjectVisible(object: DisplayObject): boolean {
    const bounds = object.getBounds();
    const expandedViewport = this.expandViewport();

    return bounds.x < expandedViewport.right &&
           bounds.x + bounds.width > expandedViewport.left &&
           bounds.y < expandedViewport.bottom &&
           bounds.y + bounds.height > expandedViewport.top;
  }

  private expandViewport(): Rectangle {
    return new Rectangle(
      this.viewport.x - this.cullingMargin,
      this.viewport.y - this.cullingMargin,
      this.viewport.width + this.cullingMargin * 2,
      this.viewport.height + this.cullingMargin * 2
    );
  }

  cullObjects(objects: DisplayObject[]): DisplayObject[] {
    return objects.filter(obj => this.isObjectVisible(obj));
  }
}

```javascript

### Distance-Based Culling

```typescript

export class DistanceCulling {
  private maxDistance: number;
  private playerPosition: Vector2;

  constructor(maxDistance: number) {
    this.maxDistance = maxDistance;
  }

  updatePlayerPosition(position: Vector2): void {
    this.playerPosition = position;
  }

  isObjectInRange(object: DisplayObject): boolean {
    const distance = this.calculateDistance(object.position, this.playerPosition);
    return distance <= this.maxDistance;
  }

  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

```text

## Level of Detail (LOD) System

### LOD Implementation

```typescript

export interface LODLevel {
  level: number;
  name: string;
  distance: number;
  quality: number;
  effects: boolean;
  particles: boolean;
}

export class LODSystem {
  private levels: LODLevel[];
  private currentLevel: number;
  private playerPosition: Vector2;

  constructor() {
    this.levels = [
{ level: 0, name: 'ultra', distance: 0, quality: 1.0, effects: true, particles: true },
{ level: 1, name: 'high', distance: 500, quality: 0.8, effects: true, particles: true },
{ level: 2, name: 'medium', distance: 1000, quality: 0.6, effects: true, particles: false
},
{ level: 3, name: 'low', distance: 1500, quality: 0.4, effects: false, particles: false }
    ];

    this.currentLevel = 1;
  }

  updatePlayerPosition(position: Vector2): void {
    this.playerPosition = position;
  }

  getLODLevel(object: DisplayObject): LODLevel {
    const distance = this.calculateDistance(object.position, this.playerPosition);

    // Find appropriate LOD level based on distance
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (distance >= this.levels[i].distance) {
        return this.levels[i];
      }
    }

    return this.levels[0]; // Default to highest quality
  }

  applyLODToObject(object: DisplayObject, lodLevel: LODLevel): void {
    // Apply quality settings
    object.alpha = lodLevel.quality;
    object.scale.set(lodLevel.quality);

    // Enable/disable effects
    if (object instanceof Container) {
      this.applyLODToContainer(object, lodLevel);
    }
  }

  private applyLODToContainer(container: Container, lodLevel: LODLevel): void {
    container.children.forEach(child => {
      if (child instanceof ParticleContainer && !lodLevel.particles) {
        child.visible = false;
      } else if (child instanceof Graphics && !lodLevel.effects) {
        child.visible = false;
      } else {
        child.visible = true;
      }
    });
  }
}

```text

## Memory Management

### Texture Management

```typescript

export class TextureManager {
  private textures: Map<string, Texture> = new Map();
  private textureMemory: number = 0;
  private maxTextureMemory: number = 256 * 1024 * 1024; // 256MB

  loadTexture(url: string): Promise<Texture> {
    if (this.textures.has(url)) {
      return Promise.resolve(this.textures.get(url)!);
    }

    return new Promise((resolve, reject) => {
      const texture = Texture.from(url);

      texture.on('loaded', () => {
        this.textures.set(url, texture);
        this.textureMemory += this.calculateTextureMemory(texture);
        this.cleanupIfNeeded();
        resolve(texture);
      });

      texture.on('error', reject);
    });
  }

  private calculateTextureMemory(texture: Texture): number {
    const width = texture.width;
    const height = texture.height;
    const bytesPerPixel = 4; // RGBA
    return width * height * bytesPerPixel;
  }

  private cleanupIfNeeded(): void {
    if (this.textureMemory > this.maxTextureMemory) {
      this.cleanupUnusedTextures();
    }
  }

  private cleanupUnusedTextures(): void {
    // Remove textures that are no longer referenced
    const unusedTextures: string[] = [];

    this.textures.forEach((texture, url) => {
      if (texture.refCount === 0) {
        unusedTextures.push(url);
      }
    });

    unusedTextures.forEach(url => {
      const texture = this.textures.get(url)!;
      texture.destroy();
      this.textures.delete(url);
      this.textureMemory -= this.calculateTextureMemory(texture);
    });
  }
}

```javascript

### Asset Streaming

```typescript

export class AssetStreaming {
  private loadedAssets: Set<string> = new Set();
  private loadingQueue: string[] = [];
  private maxConcurrentLoads: number = 3;
  private currentlyLoading: number = 0;

  async loadAsset(url: string): Promise<void> {
    if (this.loadedAssets.has(url)) {
      return;
    }

    if (this.currentlyLoading >= this.maxConcurrentLoads) {
      this.loadingQueue.push(url);
      return;
    }

    await this.loadAssetInternal(url);
  }

  private async loadAssetInternal(url: string): Promise<void> {
    this.currentlyLoading++;

    try {
      const texture = await Texture.fromURL(url);
      this.loadedAssets.add(url);
    } catch (error) {
      console.error(`Failed to load asset: ${url}`, error);
    } finally {
      this.currentlyLoading--;

      if (this.loadingQueue.length > 0) {
        const nextUrl = this.loadingQueue.shift()!;
        this.loadAssetInternal(nextUrl);
      }
    }
  }
}

```text

## Performance Monitoring

### Real-time Performance Metrics

```typescript

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private history: PerformanceMetrics[] = [];
  private maxHistorySize: number = 60; // 1 second at 60fps

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  updateMetrics(): void {
    this.metrics = {
      fps: this.calculateFPS(),
      frameTime: this.calculateFrameTime(),
      drawCalls: this.calculateDrawCalls(),
      triangles: this.calculateTriangles(),
      memory: this.calculateMemoryUsage(),
      entities: this.calculateEntityCount()
    };

    this.addToHistory(this.metrics);
  }

  private calculateFPS(): number {
    return this.app.ticker.FPS;
  }

  private calculateFrameTime(): number {
    return this.app.ticker.deltaMS;
  }

  private calculateDrawCalls(): number {
    return this.app.renderer.gl.info.render.calls;
  }

  private calculateTriangles(): number {
    return this.app.renderer.gl.info.render.triangles;
  }

  private calculateMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  getPerformanceReport(): PerformanceReport {
    return {
      current: this.metrics,
      average: this.calculateAverageMetrics(),
      min: this.calculateMinMetrics(),
      max: this.calculateMaxMetrics(),
      trend: this.calculateTrend()
    };
  }
}

```javascript

## Acceptance Criteria

- [ ] PixiJS integration provides 60fps desktop, ≥40fps mobile performance

- [ ] Object pooling system prevents memory leaks and improves performance

- [ ] Culling system removes off-screen objects from rendering

- [ ] LOD system reduces quality for distant objects

- [ ] Performance budgets automatically adjust quality to maintain framerate

- [ ] Memory management prevents excessive memory usage

- [ ] Asset streaming loads assets efficiently without blocking gameplay

- [ ] Performance monitoring provides real-time metrics

- [ ] Rendering pipeline supports all required visual effects

- [ ] Optimization systems work seamlessly with game systems
