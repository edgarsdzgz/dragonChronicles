import { Application, Graphics, Container } from 'pixi.js';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';

interface HealthBar {
  id: string;
  container: Container;
  background: Graphics;
  foreground: Graphics;
  maxWidth: number;
  currentWidth: number;
  x: number;
  y: number;
  visible: boolean;
}

export class HealthBarManager {
  private app: Application;
  private container: Container;
  private healthBars: Map<string, HealthBar> = new Map();

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.label = 'health-bar-manager';
    setZIndex(this.container, Z_LAYERS.ENTITY_UI);
    this.app.stage.addChild(this.container);
  }

  createHealthBar(
    id: string,
    x: number,
    y: number,
    width: number = 100,
    height: number = 10,
    maxHealth: number = 100,
    currentHealth: number = 100,
  ): HealthBar {
    const container = new Container();
    container.x = x;
    container.y = y;

    // Background (red)
    const background = new Graphics();
    background.rect(0, 0, width, height);
    background.fill(0x8b0000);
    background.stroke({ color: 0x000000, width: 1 });

    // Foreground (green)
    const foreground = new Graphics();
    const healthPercentage = Math.max(0, Math.min(1, currentHealth / maxHealth));
    const currentWidth = width * healthPercentage;
    foreground.rect(0, 0, currentWidth, height);
    foreground.fill(0x00ff00);

    container.addChild(background);
    container.addChild(foreground);

    const healthBar: HealthBar = {
      id,
      container,
      background,
      foreground,
      maxWidth: width,
      currentWidth,
      x,
      y,
      visible: true,
    };

    this.healthBars.set(id, healthBar);
    this.container.addChild(container);

    return healthBar;
  }

  updateHealthBar(id: string, currentHealth: number, maxHealth: number): void {
    const healthBar = this.healthBars.get(id);
    if (!healthBar) return;

    const healthPercentage = Math.max(0, Math.min(1, currentHealth / maxHealth));
    healthBar.currentWidth = healthBar.maxWidth * healthPercentage;

    // Update foreground width
    healthBar.foreground.clear();
    healthBar.foreground.rect(0, 0, healthBar.currentWidth, healthBar.foreground.height);
    healthBar.foreground.fill(0x00ff00);

    // Change color based on health percentage
    if (healthPercentage < 0.3) {
      healthBar.foreground.fill(0xff0000); // Red when low
    } else if (healthPercentage < 0.6) {
      healthBar.foreground.fill(0xffff00); // Yellow when medium
    } else {
      healthBar.foreground.fill(0x00ff00); // Green when high
    }
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
    this.healthBars.forEach((healthBar) => {
      if (healthBar.visible) {
        // Any per-frame updates can go here
      }
    });
  }

  destroy(): void {
    this.healthBars.forEach((healthBar) => {
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
}
