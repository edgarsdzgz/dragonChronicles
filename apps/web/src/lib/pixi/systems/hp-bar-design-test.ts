/**
 * HP Bar Design Test System
 *
 * Spawns 6 dragons with different HP bar styles to visualize and compare designs.
 * Runs combat simulation: damage -> wait -> heal -> wait -> loop
 */

import { type Application, Container, Graphics, Text } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { createAnimatedDragonSprite } from '../dragon-sprites';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';

export type HPBarStyle =
  | 'rectangular'
  | 'circular-arc'
  | 'horizontal-below'
  | 'curved'
  | 'segmented-orbs'
  | 'ring';

interface DragonTestInstance {
  container: Container;
  sprite: any;
  animator: any;
  healthBar: Container;
  currentHealth: number;
  maxHealth: number;
  style: HPBarStyle;
  label: Text;
}

export class HPBarDesignTest {
  private app: Application;
  private assetManager: AssetManager;
  private dragons: DragonTestInstance[] = [];
  private combatPhase: 'damage' | 'damage-wait' | 'heal' | 'heal-wait' = 'damage';
  private phaseStartTime: number = 0;
  private tickCounter: number = 0;

  constructor(app: Application, assetManager: AssetManager) {
    this.app = app;
    this.assetManager = assetManager;
  }

  async initialize(): Promise<void> {
    console.log('🧪 HP Bar Design Test: Initializing...');

    const styles: HPBarStyle[] = [
      'rectangular',
      'circular-arc',
      'horizontal-below',
      'curved',
      'segmented-orbs',
      'ring',
    ];

    const startY = 100;
    const spacing = 120;
    const x = 150;

    for (let i = 0; i < 6; i++) {
      const style = styles[i];
      const y = startY + i * spacing;

      await this.createDragonWithHPBar(x, y, style, i + 1);
    }

    this.phaseStartTime = performance.now();
    console.log('✅ HP Bar Design Test: Initialized with 6 dragons');
  }

  private async createDragonWithHPBar(
    x: number,
    y: number,
    style: HPBarStyle,
    index: number,
  ): Promise<void> {
    // Create dragon sprite
    const { sprite, animator } = await createAnimatedDragonSprite();

    const container = new Container();
    container.x = x;
    container.y = y;
    setZIndex(container, Z_LAYERS.PLAYER);

    sprite.x = 0;
    sprite.y = 0;
    sprite.scale.set(0.8);
    container.addChild(sprite);

    // Start animation
    animator.start();

    // Create label
    const label = new Text({
      text: `${index}. ${style}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffffff,
      },
    });
    label.x = -50;
    label.y = -60;
    container.addChild(label);

    // Create HP bar container
    const healthBarContainer = new Container();
    setZIndex(healthBarContainer, Z_LAYERS.ENTITY_UI);
    container.addChild(healthBarContainer);

    const dragon: DragonTestInstance = {
      container,
      sprite,
      animator,
      healthBar: healthBarContainer,
      currentHealth: 100,
      maxHealth: 100,
      style,
      label,
    };

    this.dragons.push(dragon);
    this.app.stage.addChild(container);

    // Initial render
    this.renderHealthBar(dragon);
  }

  private renderHealthBar(dragon: DragonTestInstance): void {
    // Clear existing health bar
    dragon.healthBar.removeChildren();

    const healthPercent = dragon.currentHealth / dragon.maxHealth;

    switch (dragon.style) {
      case 'rectangular':
        this.renderRectangular(dragon.healthBar, healthPercent);
        break;
      case 'circular-arc':
        this.renderCircularArc(dragon.healthBar, healthPercent);
        break;
      case 'horizontal-below':
        this.renderHorizontalBelow(dragon.healthBar, healthPercent);
        break;
      case 'curved':
        this.renderCurved(dragon.healthBar, healthPercent);
        break;
      case 'segmented-orbs':
        this.renderSegmentedOrbs(dragon.healthBar, healthPercent);
        break;
      case 'ring':
        this.renderRing(dragon.healthBar, healthPercent);
        break;
    }
  }

  private renderRectangular(container: Container, healthPercent: number): void {
    const width = 60;
    const height = 8;
    const x = -30;
    const y = -40;

    const bg = new Graphics();
    bg.rect(x, y, width, height);
    bg.fill(0x8b0000);
    bg.stroke({ color: 0x000000, width: 1 });
    container.addChild(bg);

    const fg = new Graphics();
    fg.rect(x, y, width * healthPercent, height);
    fg.fill(this.getHealthColor(healthPercent));
    container.addChild(fg);
  }

  private renderCircularArc(container: Container, healthPercent: number): void {
    const radius = 35;
    const thickness = 6;
    const startAngle = Math.PI * 0.75; // Bottom-left
    const endAngle = Math.PI * 2.25; // Bottom-right (270 degrees arc)

    // Background arc
    const bg = new Graphics();
    bg.arc(0, 0, radius, startAngle, endAngle);
    bg.stroke({ color: 0x8b0000, width: thickness });
    container.addChild(bg);

    // Foreground arc (health)
    if (healthPercent > 0) {
      const healthEndAngle = startAngle + (endAngle - startAngle) * healthPercent;
      const fg = new Graphics();
      fg.arc(0, 0, radius, startAngle, healthEndAngle);
      fg.stroke({ color: this.getHealthColor(healthPercent), width: thickness });
      container.addChild(fg);
    }
  }

  private renderHorizontalBelow(container: Container, healthPercent: number): void {
    const width = 70;
    const height = 6;
    const x = -35;
    const y = 40; // Below dragon

    const bg = new Graphics();
    bg.rect(x, y, width, height);
    bg.fill(0x8b0000);
    bg.stroke({ color: 0x000000, width: 1 });
    container.addChild(bg);

    const fg = new Graphics();
    fg.rect(x, y, width * healthPercent, height);
    fg.fill(this.getHealthColor(healthPercent));
    container.addChild(fg);
  }

  private renderCurved(container: Container, healthPercent: number): void {
    const width = 60;
    const height = 12;
    const curve = 4;
    const x = -30;
    const y = 30;

    // Background
    const bg = new Graphics();
    bg.moveTo(x, y);
    bg.bezierCurveTo(x + width * 0.25, y + curve, x + width * 0.75, y + curve, x + width, y);
    bg.lineTo(x + width, y + height);
    bg.bezierCurveTo(
      x + width * 0.75,
      y + height - curve,
      x + width * 0.25,
      y + height - curve,
      x,
      y + height,
    );
    bg.closePath();
    bg.fill(0x8b0000);
    bg.stroke({ color: 0x000000, width: 1 });
    container.addChild(bg);

    // Foreground
    if (healthPercent > 0) {
      const fgWidth = width * healthPercent;
      const fg = new Graphics();
      fg.moveTo(x, y);
      fg.bezierCurveTo(
        x + fgWidth * 0.25,
        y + curve,
        x + fgWidth * 0.75,
        y + curve,
        x + fgWidth,
        y,
      );
      fg.lineTo(x + fgWidth, y + height);
      fg.bezierCurveTo(
        x + fgWidth * 0.75,
        y + height - curve,
        x + fgWidth * 0.25,
        y + height - curve,
        x,
        y + height,
      );
      fg.closePath();
      fg.fill(this.getHealthColor(healthPercent));
      container.addChild(fg);
    }
  }

  private renderSegmentedOrbs(container: Container, healthPercent: number): void {
    const orbCount = 10;
    const orbRadius = 4;
    const spacing = 8;
    const totalWidth = (orbCount - 1) * spacing;
    const startX = -totalWidth / 2;
    const y = 35;

    const filledOrbs = Math.ceil(orbCount * healthPercent);

    for (let i = 0; i < orbCount; i++) {
      const orb = new Graphics();
      const orbX = startX + i * spacing;

      if (i < filledOrbs) {
        // Filled orb
        orb.circle(orbX, y, orbRadius);
        orb.fill(this.getHealthColor(healthPercent));
        orb.stroke({ color: 0x000000, width: 1 });
      } else {
        // Empty orb
        orb.circle(orbX, y, orbRadius);
        orb.fill(0x8b0000);
        orb.stroke({ color: 0x000000, width: 1 });
      }

      container.addChild(orb);
    }
  }

  private renderRing(container: Container, healthPercent: number): void {
    const radius = 30;
    const thickness = 4;

    // Background circle
    const bg = new Graphics();
    bg.circle(0, 0, radius);
    bg.stroke({ color: 0x8b0000, width: thickness });
    container.addChild(bg);

    // Foreground arc (health)
    if (healthPercent > 0) {
      const startAngle = -Math.PI / 2; // Top
      const endAngle = startAngle + Math.PI * 2 * healthPercent;

      const fg = new Graphics();
      fg.arc(0, 0, radius, startAngle, endAngle);
      fg.stroke({ color: this.getHealthColor(healthPercent), width: thickness });
      container.addChild(fg);
    }
  }

  private getHealthColor(healthPercent: number): number {
    if (healthPercent > 0.6) return 0x00ff00; // Green
    if (healthPercent > 0.3) return 0xffff00; // Yellow
    return 0xff0000; // Red
  }

  update(deltaTime: number): void {
    const currentTime = performance.now();
    const elapsed = currentTime - this.phaseStartTime;

    // Combat simulation logic
    switch (this.combatPhase) {
      case 'damage':
        // Take 2% damage 15 times over 10 seconds
        // 10000ms / 15 = 666.67ms per tick
        if (elapsed >= (this.tickCounter + 1) * 666.67) {
          this.tickCounter++;
          this.applyDamageToAll(2);

          if (this.tickCounter >= 15) {
            this.combatPhase = 'damage-wait';
            this.phaseStartTime = currentTime;
            this.tickCounter = 0;
            console.log('💥 Damage phase complete, waiting...');
          }
        }
        break;

      case 'damage-wait':
        // Wait 5 seconds
        if (elapsed >= 5000) {
          this.combatPhase = 'heal';
          this.phaseStartTime = currentTime;
          this.tickCounter = 0;
          console.log('⏸️  Wait complete, starting heal...');
        }
        break;

      case 'heal':
        // Heal 2% health 15 times over 10 seconds
        if (elapsed >= (this.tickCounter + 1) * 666.67) {
          this.tickCounter++;
          this.applyHealToAll(2);

          if (this.tickCounter >= 15) {
            this.combatPhase = 'heal-wait';
            this.phaseStartTime = currentTime;
            this.tickCounter = 0;
            console.log('💚 Heal phase complete, waiting...');
          }
        }
        break;

      case 'heal-wait':
        // Wait 5 seconds
        if (elapsed >= 5000) {
          this.combatPhase = 'damage';
          this.phaseStartTime = currentTime;
          this.tickCounter = 0;
          console.log('⏸️  Wait complete, starting damage...');
        }
        break;
    }
  }

  private applyDamageToAll(percent: number): void {
    this.dragons.forEach((dragon) => {
      dragon.currentHealth = Math.max(0, dragon.currentHealth - percent);
      this.renderHealthBar(dragon);
    });
  }

  private applyHealToAll(percent: number): void {
    this.dragons.forEach((dragon) => {
      dragon.currentHealth = Math.min(dragon.maxHealth, dragon.currentHealth + percent);
      this.renderHealthBar(dragon);
    });
  }

  destroy(): void {
    this.dragons.forEach((dragon) => {
      if (dragon.animator) {
        dragon.animator.destroy();
      }
      if (dragon.container.parent) {
        dragon.container.parent.removeChild(dragon.container);
      }
      dragon.container.destroy();
    });
    this.dragons = [];
  }
}
