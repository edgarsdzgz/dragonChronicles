import { Container } from 'pixi.js';

// Z-index layer constants for consistent layering
export const Z_LAYERS = {
  BACKGROUND: 0,
  PARALLAX_FAR: 1,
  PARALLAX_MID: 2,
  PARALLAX_NEAR: 3,
  TERRAIN: 4,
  ENEMIES: 5,
  PROJECTILES: 6,
  ENTITY_UI: 7, // Health bars, nameplates (below entities)
  PLAYER: 8, // Player dragon (on top of its own UI)
  DRAGON: 8, // Alias for PLAYER for consistency
  UI_BACKGROUND: 9,
  UI_ELEMENTS: 10,
  UI_FOREGROUND: 11,
  EFFECTS: 12,
  DEBUG: 13,
} as const;

export type ZLayer = (typeof Z_LAYERS)[keyof typeof Z_LAYERS];

/**
 * Set the z-index of a display object
 * @param obj - The display object to set z-index for
 * @param zIndex - The z-index value
 */
export function setZIndex(obj: Container, zIndex: number): void {
  obj.zIndex = zIndex;
}

/**
 * Get the z-index of a display object
 * @param obj - The display object to get z-index from
 * @returns The z-index value
 */
export function getZIndex(obj: Container): number {
  return obj.zIndex || 0;
}

/**
 * Bring an object to the front of its parent
 * @param obj - The display object to bring to front
 */
export function bringToFront(obj: Container): void {
  if (obj.parent) {
    obj.parent.addChild(obj);
  }
}

/**
 * Send an object to the back of its parent
 * @param obj - The display object to send to back
 */
export function sendToBack(obj: Container): void {
  if (obj.parent) {
    obj.parent.addChildAt(obj, 0);
  }
}

/**
 * Move an object above another object
 * @param obj - The object to move
 * @param target - The object to move above
 */
export function moveAbove(obj: Container, target: Container): void {
  if (obj.parent && target.parent && obj.parent === target.parent) {
    const targetIndex = target.parent.getChildIndex(target);
    obj.parent.addChildAt(obj, targetIndex + 1);
  }
}

/**
 * Move an object below another object
 * @param obj - The object to move
 * @param target - The object to move below
 */
export function moveBelow(obj: Container, target: Container): void {
  if (obj.parent && target.parent && obj.parent === target.parent) {
    const targetIndex = target.parent.getChildIndex(target);
    obj.parent.addChildAt(obj, targetIndex);
  }
}

/**
 * Sort children by z-index
 * @param container - The container to sort
 */
export function sortByZIndex(container: { children: Container[] }): void {
  container.children.sort((a, b) => getZIndex(a) - getZIndex(b));
}

/**
 * Layer Manager class for managing display object layers
 */
export class LayerManager {
  private layers: Map<string, Container[]> = new Map();

  constructor() {
    // Initialize layer groups
    this.layers.set('background', []);
    this.layers.set('parallax', []);
    this.layers.set('terrain', []);
    this.layers.set('enemies', []);
    this.layers.set('projectiles', []);
    this.layers.set('entityUI', []);
    this.layers.set('dragon', []);
    this.layers.set('ui', []);
    this.layers.set('effects', []);
  }

  addToLayer(layerName: string, obj: Container): void {
    const layer = this.layers.get(layerName);
    if (layer) {
      layer.push(obj);
      setZIndex(obj, this.getLayerZIndex(layerName));
    }
  }

  removeFromLayer(layerName: string, obj: Container): void {
    const layer = this.layers.get(layerName);
    if (layer) {
      const index = layer.indexOf(obj);
      if (index > -1) {
        layer.splice(index, 1);
      }
    }
  }

  getLayerZIndex(layerName: string): number {
    const layerZIndexes: Record<string, number> = {
      background: Z_LAYERS.BACKGROUND,
      parallax: Z_LAYERS.PARALLAX_FAR,
      terrain: Z_LAYERS.TERRAIN,
      enemies: Z_LAYERS.ENEMIES,
      projectiles: Z_LAYERS.PROJECTILES,
      entityUI: Z_LAYERS.ENTITY_UI,
      dragon: Z_LAYERS.DRAGON,
      ui: Z_LAYERS.UI_ELEMENTS,
      effects: Z_LAYERS.EFFECTS,
    };
    return layerZIndexes[layerName] || 0;
  }

  update(_deltaTime: number): void {
    // Update any layer-specific logic here
    // For now, this is a placeholder
  }

  destroy(): void {
    this.layers.clear();
  }
}
