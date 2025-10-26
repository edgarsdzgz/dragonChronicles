import { Application, Text, Container } from 'pixi.js';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';

interface FloatingDamageText {
  id: string;
  text: Text;
  container: Container;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  alpha: number;
  scale: number;
}

export class FloatingDamageManager {
  private app: Application;
  private container: Container;
  private damageTexts: Map<string, FloatingDamageText> = new Map();
  private nextId: number = 0;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.label = 'floating-damage-manager';
    setZIndex(this.container, Z_LAYERS.UI_FOREGROUND);
    this.app.stage.addChild(this.container);
  }

  showDamage(
    x: number,
    y: number,
    damage: number,
    isCritical: boolean = false,
    isHealing: boolean = false,
  ): string {
    const id = `damage_${this.nextId++}`;

    // Create damage text
    const text = new Text({
      text: isHealing ? `+${damage}` : `-${damage}`,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: isCritical ? 24 : 18,
        fill: isHealing ? 0x00ff00 : isCritical ? 0xff0000 : 0xffffff,
        stroke: { color: 0x000000, width: 2 },
        dropShadow: {
          color: 0x000000,
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
        },
      },
    });

    // Create container for the text
    const container = new Container();
    container.x = x;
    container.y = y;
    container.addChild(text);

    // Set initial properties
    const damageText: FloatingDamageText = {
      id,
      text,
      container,
      x,
      y,
      velocityX: (Math.random() - 0.5) * 2, // Random horizontal movement
      velocityY: -2 - Math.random() * 2, // Upward movement
      life: 0,
      maxLife: 2000, // 2 seconds
      alpha: 1,
      scale: 1,
    };

    this.damageTexts.set(id, damageText);
    this.container.addChild(container);

    return id;
  }

  showText(
    x: number,
    y: number,
    text: string,
    color: number = 0xffffff,
    fontSize: number = 18,
  ): string {
    const id = `text_${this.nextId++}`;

    const textObj = new Text({
      text,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize,
        fill: color,
        stroke: { color: 0x000000, width: 2 },
        dropShadow: {
          color: 0x000000,
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
        },
      },
    });

    const container = new Container();
    container.x = x;
    container.y = y;
    container.addChild(textObj);

    const floatingText: FloatingDamageText = {
      id,
      text: textObj,
      container,
      x,
      y,
      velocityX: (Math.random() - 0.5) * 1,
      velocityY: -1 - Math.random(),
      life: 0,
      maxLife: 1500, // 1.5 seconds
      alpha: 1,
      scale: 1,
    };

    this.damageTexts.set(id, floatingText);
    this.container.addChild(container);

    return id;
  }

  update(deltaTime: number): void {
    const toRemove: string[] = [];

    this.damageTexts.forEach((damageText) => {
      // Update life
      damageText.life += deltaTime;

      // Update position
      damageText.x += damageText.velocityX;
      damageText.y += damageText.velocityY;
      damageText.container.x = damageText.x;
      damageText.container.y = damageText.y;

      // Update alpha and scale based on life
      const lifePercentage = damageText.life / damageText.maxLife;
      damageText.alpha = Math.max(0, 1 - lifePercentage);
      damageText.scale = Math.max(0.5, 1 - lifePercentage * 0.5);

      // Apply alpha and scale
      damageText.container.alpha = damageText.alpha;
      damageText.container.scale.set(damageText.scale);

      // Remove if expired
      if (damageText.life >= damageText.maxLife) {
        toRemove.push(damageText.id);
      }
    });

    // Remove expired texts
    toRemove.forEach((id) => {
      this.removeText(id);
    });
  }

  removeText(id: string): void {
    const damageText = this.damageTexts.get(id);
    if (!damageText) return;

    if (damageText.container.parent) {
      damageText.container.parent.removeChild(damageText.container);
    }
    damageText.container.destroy();
    this.damageTexts.delete(id);
  }

  clearAll(): void {
    this.damageTexts.forEach((damageText) => {
      if (damageText.container.parent) {
        damageText.container.parent.removeChild(damageText.container);
      }
      damageText.container.destroy();
    });
    this.damageTexts.clear();
  }

  getText(id: string): FloatingDamageText | undefined {
    return this.damageTexts.get(id);
  }

  getAllTexts(): FloatingDamageText[] {
    return Array.from(this.damageTexts.values());
  }

  destroy(): void {
    this.clearAll();
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();
  }
}
