/**
 * Spatial Culling System for Draconia Chronicles
 * Optimizes rendering performance by only processing visible objects
 */

/**
 * Vector2 interface for position data
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Bounding box interface
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Cullable object interface
 */
export interface CullableObject {
  id: string;
  position: Vector2;
  bounds: BoundingBox;
  visible: boolean;
  priority: number;
  layer: number;
}

/**
 * Viewport interface
 */
export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

/**
 * LOD (Level of Detail) configuration
 */
export interface LODLevel {
  distance: number;
  detail: number;
  renderDistance: number;
}

/**
 * Spatial culling configuration
 */
export interface CullingConfig {
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
  enableLOD: boolean;
  maxRenderDistance: number;
  lodLevels: LODLevel[];
  updateInterval: number;
  batchSize: number;
}

/**
 * Culling statistics
 */
export interface CullingStats {
  totalObjects: number;
  visibleObjects: number;
  culledObjects: number;
  lodObjects: Record<number, number>;
  updateTime: number;
  lastUpdate: number;
}

/**
 * Quadtree node for spatial partitioning
 */
export class QuadTreeNode {
  public bounds: BoundingBox;
  public objects: CullableObject[] = [];
  public children: QuadTreeNode[] = [];
  public parent: QuadTreeNode | null = null;
  public depth: number;
  public maxObjects: number;
  public maxDepth: number;

  constructor(
    bounds: BoundingBox,
    depth: number = 0,
    maxObjects: number = 10,
    maxDepth: number = 5
  ) {
    this.bounds = bounds;
    this.depth = depth;
    this.maxObjects = maxObjects;
    this.maxDepth = maxDepth;
  }

  /**
   * Insert object into quadtree
   */
  public insert(obj: CullableObject): void {
    if (!this.contains(obj.bounds)) {
      return;
    }

    if (this.objects.length < this.maxObjects || this.depth >= this.maxDepth) {
      this.objects.push(obj);
      return;
    }

    if (this.children.length === 0) {
      this.subdivide();
    }

    for (const child of this.children) {
      child.insert(obj);
    }
  }

  /**
   * Query objects in bounds
   */
  public query(bounds: BoundingBox): CullableObject[] {
    const result: CullableObject[] = [];

    if (!this.intersects(bounds)) {
      return result;
    }

    // Add objects in this node
    for (const obj of this.objects) {
      if (this.intersectsObject(obj.bounds, bounds)) {
        result.push(obj);
      }
    }

    // Query children
    for (const child of this.children) {
      result.push(...child.query(bounds));
    }

    return result;
  }

  /**
   * Clear the node
   */
  public clear(): void {
    this.objects = [];
    this.children = [];
  }

  /**
   * Check if bounds contains object bounds
   */
  private contains(bounds: BoundingBox): boolean {
    return (
      bounds.x >= this.bounds.x &&
      bounds.y >= this.bounds.y &&
      bounds.x + bounds.width <= this.bounds.x + this.bounds.width &&
      bounds.y + bounds.height <= this.bounds.y + this.bounds.height
    );
  }

  /**
   * Check if bounds intersect
   */
  private intersects(bounds: BoundingBox): boolean {
    return !(
      bounds.x > this.bounds.x + this.bounds.width ||
      bounds.x + bounds.width < this.bounds.x ||
      bounds.y > this.bounds.y + this.bounds.height ||
      bounds.y + bounds.height < this.bounds.y
    );
  }

  /**
   * Check if two bounds intersect
   */
  private intersectsObject(bounds1: BoundingBox, bounds2: BoundingBox): boolean {
    return !(
      bounds1.x > bounds2.x + bounds2.width ||
      bounds1.x + bounds1.width < bounds2.x ||
      bounds1.y > bounds2.y + bounds2.height ||
      bounds1.y + bounds1.height < bounds2.y
    );
  }

  /**
   * Subdivide the node into four children
   */
  private subdivide(): void {
    const halfWidth = this.bounds.width / 2;
    const halfHeight = this.bounds.height / 2;

    this.children = [
      new QuadTreeNode(
        { x: this.bounds.x, y: this.bounds.y, width: halfWidth, height: halfHeight },
        this.depth + 1,
        this.maxObjects,
        this.maxDepth
      ),
      new QuadTreeNode(
        { x: this.bounds.x + halfWidth, y: this.bounds.y, width: halfWidth, height: halfHeight },
        this.depth + 1,
        this.maxObjects,
        this.maxDepth
      ),
      new QuadTreeNode(
        { x: this.bounds.x, y: this.bounds.y + halfHeight, width: halfWidth, height: halfHeight },
        this.depth + 1,
        this.maxObjects,
        this.maxDepth
      ),
      new QuadTreeNode(
        { x: this.bounds.x + halfWidth, y: this.bounds.y + halfHeight, width: halfWidth, height: halfHeight },
        this.depth + 1,
        this.maxObjects,
        this.maxDepth
      )
    ];

    // Set parent references
    for (const child of this.children) {
      child.parent = this;
    }

    // Redistribute objects to children
    const objectsToRedistribute = [...this.objects];
    this.objects = [];

    for (const obj of objectsToRedistribute) {
      for (const child of this.children) {
        child.insert(obj);
      }
    }
  }
}

/**
 * Spatial culling system
 */
export class SpatialCullingSystem {
  private quadtree: QuadTreeNode;
  private objects: Map<string, CullableObject> = new Map();
  private config: CullingConfig;
  private stats: CullingStats;
  private lastUpdate: number = 0;

  constructor(config: Partial<CullingConfig> = {}) {
    this.config = {
      enableFrustumCulling: true,
      enableOcclusionCulling: false,
      enableLOD: true,
      maxRenderDistance: 1000,
      lodLevels: [
        { distance: 0, detail: 1.0, renderDistance: 500 },
        { distance: 500, detail: 0.5, renderDistance: 1000 },
        { distance: 1000, detail: 0.25, renderDistance: 2000 }
      ],
      updateInterval: 16, // ~60fps
      batchSize: 100,
      ...config
    } as CullingConfig;

    this.stats = {
      totalObjects: 0,
      visibleObjects: 0,
      culledObjects: 0,
      lodObjects: {},
      updateTime: 0,
      lastUpdate: 0
    };

    // Initialize quadtree with world bounds
    this.quadtree = new QuadTreeNode({
      x: -10000,
      y: -10000,
      width: 20000,
      height: 20000
    });
  }

  /**
   * Add object to culling system
   */
  public addObject(obj: CullableObject): void {
    this.objects.set(obj.id, obj);
    this.quadtree.insert(obj);
    this.stats.totalObjects++;
  }

  /**
   * Remove object from culling system
   */
  public removeObject(id: string): void {
    const obj = this.objects.get(id);
    if (obj) {
      this.objects.delete(id);
      this.stats.totalObjects--;
    }
  }

  /**
   * Update object position
   */
  public updateObject(id: string, position: Vector2): void {
    const obj = this.objects.get(id);
    if (obj) {
      obj.position = position;
      // Note: In a full implementation, you'd need to remove and re-insert
      // objects when they move between quadtree nodes
    }
  }

  /**
   * Get visible objects in viewport
   */
  public getVisibleObjects(viewport: Viewport): CullableObject[] {
    const startTime = Date.now();
    
    // Create viewport bounds
    const viewportBounds: BoundingBox = {
      x: viewport.x,
      y: viewport.y,
      width: viewport.width,
      height: viewport.height
    };

    // Query objects in viewport
    let visibleObjects = this.quadtree.query(viewportBounds);

    // Apply frustum culling
    if (this.config.enableFrustumCulling) {
      visibleObjects = this.applyFrustumCulling(visibleObjects, viewport);
    }

    // Apply LOD
    if (this.config.enableLOD) {
      visibleObjects = this.applyLOD(visibleObjects, viewport);
    }

    // Update statistics
    this.stats.visibleObjects = visibleObjects.length;
    this.stats.culledObjects = this.stats.totalObjects - this.stats.visibleObjects;
    this.stats.updateTime = Date.now() - startTime;
    this.stats.lastUpdate = Date.now();

    return visibleObjects;
  }

  /**
   * Apply frustum culling
   */
  private applyFrustumCulling(objects: CullableObject[], viewport: Viewport): CullableObject[] {
    return objects.filter(obj => {
      const bounds = obj.bounds;
      return (
        bounds.x < viewport.x + viewport.width &&
        bounds.x + bounds.width > viewport.x &&
        bounds.y < viewport.y + viewport.height &&
        bounds.y + bounds.height > viewport.y
      );
    });
  }

  /**
   * Apply Level of Detail
   */
  private applyLOD(objects: CullableObject[], viewport: Viewport): CullableObject[] {
    const centerX = viewport.x + viewport.width / 2;
    const centerY = viewport.y + viewport.height / 2;

    return objects.filter(obj => {
      const distance = Math.sqrt(
        Math.pow(obj.position.x - centerX, 2) + Math.pow(obj.position.y - centerY, 2)
      );

    // Find appropriate LOD level
    for (let i = this.config.lodLevels.length - 1; i >= 0; i--) {
      const level = this.config.lodLevels[i];
      if (level && distance >= level.distance) {
        obj.visible = distance <= level.renderDistance;
        return obj.visible;
      }
    }

      // Default to highest detail
      const firstLevel = this.config.lodLevels[0];
      if (firstLevel) {
        obj.visible = distance <= firstLevel.renderDistance;
        return obj.visible;
      }
      return false;
    });
  }

  /**
   * Update the culling system
   */
  public update(viewport: Viewport): void {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate < this.config.updateInterval) {
      return;
    }

    this.lastUpdate = currentTime;

    // Rebuild quadtree if needed
    if (this.shouldRebuildQuadtree()) {
      this.rebuildQuadtree();
    }

    // Update visible objects
    this.getVisibleObjects(viewport);
  }

  /**
   * Check if quadtree should be rebuilt
   */
  private shouldRebuildQuadtree(): boolean {
    // Simple heuristic: rebuild if object count changed significantly
    return this.stats.totalObjects > 0 && this.stats.totalObjects % 100 === 0;
  }

  /**
   * Rebuild the quadtree
   */
  private rebuildQuadtree(): void {
    this.quadtree.clear();
    for (const obj of this.objects.values()) {
      this.quadtree.insert(obj);
    }
  }

  /**
   * Get culling statistics
   */
  public getStats(): CullingStats {
    return { ...this.stats };
  }

  /**
   * Clear all objects
   */
  public clear(): void {
    this.objects.clear();
    this.quadtree.clear();
    this.stats = {
      totalObjects: 0,
      visibleObjects: 0,
      culledObjects: 0,
      lodObjects: {},
      updateTime: 0,
      lastUpdate: 0
    };
  }
}
