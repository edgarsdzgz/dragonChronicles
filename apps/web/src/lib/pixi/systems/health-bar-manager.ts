import { Application, Graphics, Container } from 'pixi.js';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import type { ResponsiveManager } from './responsive-manager';

interface HealthBar {
  id: string;
  container: Container;
  maxHealth: number;
  currentHealth: number;
  x: number;
  y: number;
  visible: boolean;
}

/**
 * Color palette for Ethereal Flame HP bars
 */
export interface EtherealFlamePalette {
  outer: number;
  body: number;
  core: number;
}

/**
 * Predefined color palettes for HP bars
 * Executor's approved designs from HP bar test
 */
export const HP_BAR_PALETTES = {
  'classic-green': {
    outer: 0x88ff44, // Bright lime-green outer
    body: 0x44ff00, // Classic bright green
    core: 0xccff88, // Light green-yellow core
  },
  'frost-wisp': {
    outer: 0x88ffff, // Cyan outer
    body: 0x00ddff, // Cyan body
    core: 0xffffff, // White core
  },
  'inferno-blaze': {
    outer: 0xff4422, // Deeper red-orange
    body: 0xff0000, // Pure intense red
    core: 0xff8844, // Orange-red glow
  },
  'toxic-miasma': {
    outer: 0x884488, // Purple haze with green tint
    body: 0x553388, // Deep purple with toxic undertone
    core: 0x66ff66, // Bright sickly green core
  },
  'arcane-violet': {
    outer: 0xcc88ff, // Light purple
    body: 0x8844ff, // Deep purple
    core: 0xffffff, // White core
  },
  'bloodfire-crimson': {
    outer: 0xcc0022, // Dark blood red
    body: 0x880000, // Deep crimson
    core: 0xff4444, // Bright blood red core
  },
  'divine-radiance': {
    outer: 0xffee88, // Light gold
    body: 0xffcc00, // Pure gold
    core: 0xffffff, // White core
  },
  'nebula-dream': {
    outer: 0xff88ff, // Pink
    body: 0xcc44ff, // Purple
    core: 0xffccff, // Light pink core
  },
  'voltaic-surge': {
    outer: 0x44ffcc, // Teal
    body: 0x00ffaa, // Cyan-green
    core: 0xccffff, // Light cyan core
  },
  'shadow-ember': {
    outer: 0x6644aa, // Purple-gray
    body: 0x331166, // Dark purple
    core: 0x9988cc, // Light purple core
  },
} as const;

export type HPBarPaletteName = keyof typeof HP_BAR_PALETTES;

/**
 * HP bar dimensions at 1920x1080 baseline
 * All dimensions in game world pixels (scale with gameWorldScale)
 */
export interface HPBarDimensions {
  radius: number;
  thickness: number;
}

export const HP_BAR_BASE_DIMENSIONS: HPBarDimensions = {
  radius: 50, // Baseline at 1080p
  thickness: 8, // Baseline at 1080p
};

export class HealthBarManager {
  private app: Application;
  private container: Container;
  private healthBars: Map<string, HealthBar> = new Map();
  private defaultPalette: EtherealFlamePalette = HP_BAR_PALETTES['classic-green'];
  private responsiveManager: ResponsiveManager;

  constructor(
    app: Application,
    responsiveManager: ResponsiveManager,
    parentContainer: Container,
  ) {
    this.app = app;
    this.container = new Container();
    this.container.label = 'health-bar-manager';
    // Use UI_ELEMENTS layer (higher than ENTITY_UI) to ensure bars are always on top
    setZIndex(this.container, Z_LAYERS.UI_ELEMENTS);
    // Add to parent container (UIManager) instead of app.stage
    // This creates proper hierarchy where hiding UIManager hides all UI
    parentContainer.addChild(this.container);

    // Initialize responsive system
    this.responsiveManager = responsiveManager;

    // Note: HP bars now scale with gameWorldScale (unified game world coordinates)
    // No breakpoint subscription needed - dimensions calculated on-the-fly during render
  }

  /**
   * Set the default color palette for new health bars
   */
  setDefaultPalette(paletteName: HPBarPaletteName): void {
    this.defaultPalette = HP_BAR_PALETTES[paletteName];
  }

  createHealthBar(
    id: string,
    x: number,
    y: number,
    maxHealth: number = 100,
    currentHealth: number = 100,
    palette?: EtherealFlamePalette,
  ): HealthBar {
    const container = new Container();
    container.x = x;
    container.y = y;

    const healthBar: HealthBar = {
      id,
      container,
      maxHealth,
      currentHealth,
      x,
      y,
      visible: true,
    };

    this.healthBars.set(id, healthBar);
    this.container.addChild(container);

    // Initial render
    this.renderEtherealFlame(healthBar, palette || this.defaultPalette);

    return healthBar;
  }

  updateHealthBar(id: string, currentHealth: number, maxHealth: number): void {
    const healthBar = this.healthBars.get(id);
    if (!healthBar) return;

    healthBar.currentHealth = currentHealth;
    healthBar.maxHealth = maxHealth;

    // Re-render the health bar
    this.renderEtherealFlame(healthBar, this.defaultPalette);
  }

  setHealthBarPosition(id: string, x: number, y: number): void {
    const healthBar = this.healthBars.get(id);
    if (!healthBar) return;

    healthBar.container.x = x;
    healthBar.container.y = y;
    healthBar.x = x;
    healthBar.y = y;
  }

  setHealthBarVisible(id: string, visible: boolean): void {
    const healthBar = this.healthBars.get(id);
    if (!healthBar) return;

    healthBar.visible = visible;
    healthBar.container.visible = visible;
  }

  removeHealthBar(id: string): void {
    const healthBar = this.healthBars.get(id);
    if (!healthBar) return;

    // Properly destroy all children
    healthBar.container.children.forEach((child) => {
      if (child instanceof Graphics) {
        child.destroy();
      }
    });

    if (healthBar.container.parent) {
      healthBar.container.parent.removeChild(healthBar.container);
    }
    healthBar.container.destroy();
    this.healthBars.delete(id);
  }

  getHealthBar(id: string): HealthBar | undefined {
    return this.healthBars.get(id);
  }

  getAllHealthBars(): HealthBar[] {
    return Array.from(this.healthBars.values());
  }

  update(_deltaTime: number): void {
    // Update any animated health bars here if needed
  }

  destroy(): void {
    this.healthBars.forEach((healthBar) => {
      healthBar.container.children.forEach((child) => {
        if (child instanceof Graphics) {
          child.destroy();
        }
      });
      if (healthBar.container.parent) {
        healthBar.container.parent.removeChild(healthBar.container);
      }
      healthBar.container.destroy();
    });
    this.healthBars.clear();

    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();
  }

  /**
   * Render Ethereal Flame HP bar style
   * Approved by Executor - ghostly flame with wispy tendrils
   * Uses unified game world scaling
   */
  private renderEtherealFlame(healthBar: HealthBar, palette: EtherealFlamePalette): void {
    const container = healthBar.container;

    // Properly destroy all existing children before removing
    container.children.forEach((child) => {
      if (child instanceof Graphics) {
        child.destroy();
      }
    });
    container.removeChildren();

    const healthPercent = Math.max(0, Math.min(1, healthBar.currentHealth / healthBar.maxHealth));

    // Calculate dimensions using game world scale (unified scaling)
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const radius = HP_BAR_BASE_DIMENSIONS.radius * gameWorldScale;
    const thickness = HP_BAR_BASE_DIMENSIONS.thickness * gameWorldScale;
    const startAngle = (Math.PI * 2) / 3; // 120 degrees (upper-left)
    const endAngle = (Math.PI * 4) / 3; // 240 degrees (lower-left) - 120 degree arc

    // Drop shadow for depth
    const shadow = new Graphics();
    shadow.arc(2, 2, radius, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: thickness + 4, alpha: 0.4 });
    container.addChild(shadow);

    if (healthPercent > 0) {
      const healthEndAngle = startAngle + (endAngle - startAngle) * healthPercent;

      // Outer wispy aura (using palette.outer)
      const outerWisp = new Graphics();
      outerWisp.arc(0, 0, radius + 4, startAngle, healthEndAngle);
      outerWisp.stroke({ color: palette.outer, width: thickness + 4, alpha: 0.2 });
      container.addChild(outerWisp);

      // Middle flame body (using palette.body)
      const flameBody = new Graphics();
      flameBody.arc(0, 0, radius, startAngle, healthEndAngle);
      flameBody.stroke({ color: palette.body, width: thickness, alpha: 0.6 });
      container.addChild(flameBody);

      // Inner bright core (using palette.core)
      const flameCore = new Graphics();
      flameCore.arc(0, 0, radius - 2, startAngle, healthEndAngle);
      flameCore.stroke({ color: palette.core, width: thickness - 4, alpha: 0.8 });
      container.addChild(flameCore);

      // Wispy tendrils (using outer color)
      for (let i = 1; i < 8; i++) {
        if (i / 8 < healthPercent) {
          const angle = startAngle + (endAngle - startAngle) * (i / 8);
          const baseX = Math.cos(angle) * (radius + thickness / 2);
          const baseY = Math.sin(angle) * (radius + thickness / 2);
          const tipX = Math.cos(angle) * (radius + thickness / 2 + 6);
          const tipY = Math.sin(angle) * (radius + thickness / 2 + 6);

          const wisp = new Graphics();
          wisp.moveTo(baseX, baseY);
          wisp.lineTo(tipX, tipY);
          wisp.stroke({ color: palette.outer, width: 1, alpha: 0.4 });
          container.addChild(wisp);
        }
      }
    }
  }

  /**
   * Re-render all health bars (e.g., after viewport resize)
   * Called automatically by ResponsiveManager resize subscribers
   */
  rerender(): void {
    this.healthBars.forEach((healthBar) => {
      this.renderEtherealFlame(healthBar, this.defaultPalette);
    });
  }
}
