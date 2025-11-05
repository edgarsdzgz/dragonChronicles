/**
 * HP Bar Design Test System
 *
 * Spawns 6 dragons with different HP bar styles to visualize and compare designs.
 * Runs combat simulation: damage -> wait -> heal -> wait -> loop
 */

import { type Application, Container, Graphics, Text, Sprite } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { createAnimatedDragonSprite } from '../dragon-sprites';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import { ResponsiveManager } from './responsive-manager';

export type HPBarStyle =
  | 'rectangular'
  | 'circular-arc'
  | 'curved'
  | 'crystal-shard'
  | 'molten-core'
  | 'arcane-rune'
  | 'dragon-scale'
  | 'ethereal-flame'
  | 'liquid-mercury'
  | 'living-vine'
  | 'constellation'
  | 'flame-frost-wisp'
  | 'flame-inferno-blaze'
  | 'flame-classic-green'
  | 'flame-toxic-miasma'
  | 'flame-arcane-violet'
  | 'flame-bloodfire-crimson'
  | 'flame-divine-radiance'
  | 'flame-nebula-dream'
  | 'flame-voltaic-surge'
  | 'flame-shadow-ember';

interface DragonTestInstance {
  container: Container;
  sprite: Sprite;
  animator: { start: () => void; stop: () => void; destroy: () => void };
  healthBar: Container;
  currentHealth: number;
  maxHealth: number;
  style: HPBarStyle;
}

export class HPBarDesignTest {
  private app: Application;
  private assetManager: AssetManager;
  private responsiveManager: ResponsiveManager;
  private dragons: DragonTestInstance[] = [];
  private combatPhase: 'damage' | 'heal' = 'damage';
  private phaseStartTime: number = 0;
  private legendContainer: Container | null = null;
  private currentHealth: number = 100; // Shared health for all displays
  private maxHealth: number = 100;
  private backgroundSprite: Sprite | null = null;
  private lastRenderedHealth: number = 100; // Track last rendered health to avoid unnecessary updates

  // Parallax layer sprites
  private cloudsSprite: Sprite | null = null;
  private mountainSprite: Sprite | null = null;
  private hillsSprite: Sprite | null = null;
  private grasslandSprite: Sprite | null = null;

  // Standalone UI elements (no dragon needed)
  private cornerGem: Container | null = null;
  private heartsContainer: Container | null = null;
  private edgeIndicator: Container | null = null;

  constructor(app: Application, assetManager: AssetManager) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = new ResponsiveManager(app);
  }

  async initialize(): Promise<void> {
    console.log('🧪 HP Bar Design Test: Initializing...');

    // Initialize responsive manager
    this.responsiveManager.initialize();

    // Load and display background
    this.loadBackground();

    // Spawn 10 dragons in a row with all Ethereal Flame color palette variations
    const styles: HPBarStyle[] = [
      'flame-frost-wisp', // 1. Current baseline (cyan-white)
      'flame-inferno-blaze', // 2. Intense red fire
      'flame-classic-green', // 3. Classic video game green (old toxic-miasma)
      'flame-toxic-miasma', // 4. Dark toxic green-purple (NEW)
      'flame-arcane-violet', // 5. Purple magic
      'flame-bloodfire-crimson', // 6. Deep vampire red
      'flame-divine-radiance', // 7. Holy gold
      'flame-nebula-dream', // 8. Pink-purple cosmic
      'flame-voltaic-surge', // 9. Electric teal
      'flame-shadow-ember', // 10. Dark purple-black
    ];

    for (const style of styles) {
      await this.createDragonWithHPBar(style);
    }

    // Set up resize handler to reposition elements
    this.setupResizeHandler();

    this.phaseStartTime = performance.now();
    console.log(
      '✅ HP Bar Design Test: Initialized with 10 dragons (Ethereal Flame palette variations)',
    );
  }

  private loadBackground(): void {
    // Get the steppe background (already loaded by AssetManager)
    const backgroundTexture = this.assetManager.getTexture('steppe-background');

    if (backgroundTexture) {
      this.backgroundSprite = new Sprite(backgroundTexture);
      setZIndex(this.backgroundSprite, Z_LAYERS.BACKGROUND);
      this.backgroundSprite.anchor.set(0.5);

      // Initial positioning
      this.positionBackground();

      this.app.stage.addChild(this.backgroundSprite);
      console.log('✅ Background loaded');
    } else {
      console.warn('⚠️ Background texture not found - make sure AssetManager is initialized');
    }

    // Load parallax layers
    this.loadParallaxLayers();
  }

  private loadParallaxLayers(): void {
    // Load clouds (furthest back) - Z_LAYERS.BACKGROUND + 1
    const cloudsTexture = this.assetManager.getTexture('steppe-sky');
    if (cloudsTexture) {
      this.cloudsSprite = new Sprite(cloudsTexture);
      setZIndex(this.cloudsSprite, Z_LAYERS.BACKGROUND + 1);
      this.cloudsSprite.anchor.set(0, 0);
      this.app.stage.addChild(this.cloudsSprite);
      console.log('✅ Clouds layer loaded');
    }

    // Load mountain (middle layer) - Z_LAYERS.BACKGROUND + 2 - HIDDEN FOR NOW
    const mountainTexture = this.assetManager.getTexture('steppe-mountains');
    if (mountainTexture) {
      this.mountainSprite = new Sprite(mountainTexture);
      setZIndex(this.mountainSprite, Z_LAYERS.BACKGROUND + 2);
      this.mountainSprite.anchor.set(0, 0);
      this.mountainSprite.visible = false; // Hidden
      this.app.stage.addChild(this.mountainSprite);
      console.log('✅ Mountain layer loaded (hidden)');
    }

    // Load hills (Environment Decorative) - Z_LAYERS.ENVIRONMENT_DECORATIVE (10)
    const hillsTexture = this.assetManager.getTexture('steppe-hills');
    if (hillsTexture) {
      this.hillsSprite = new Sprite(hillsTexture);
      setZIndex(this.hillsSprite, 10); // Z_LAYERS.ENVIRONMENT_DECORATIVE
      this.hillsSprite.anchor.set(0, 0);
      this.app.stage.addChild(this.hillsSprite);
      console.log('✅ Hills layer loaded');
    }

    // Load grassland foreground layer (Z_LAYERS.FOREGROUND_GRASS - 40)
    const grasslandTexture = this.assetManager.getTexture('steppe-ground');
    if (grasslandTexture) {
      this.grasslandSprite = new Sprite(grasslandTexture);
      setZIndex(this.grasslandSprite, 40); // Z_LAYERS.FOREGROUND_GRASS
      this.grasslandSprite.anchor.set(0, 0); // Top-left anchor
      this.app.stage.addChild(this.grasslandSprite);
      console.log('✅ Grassland layer loaded');
    }

    // Position all parallax layers
    this.positionParallaxLayers();
  }

  private positionBackground(): void {
    if (!this.backgroundSprite) return;

    // Scale to fill screen using ResponsiveManager WIDTH-FIRST rule
    const scale = this.responsiveManager.calculateScale(
      this.backgroundSprite.texture.width,
      this.backgroundSprite.texture.height,
    );
    this.backgroundSprite.scale.set(scale);

    // Center on screen
    this.backgroundSprite.x = this.app.screen.width / 2;
    this.backgroundSprite.y = this.app.screen.height / 2;
  }

  private positionParallaxLayers(): void {
    // Position clouds layer (independent positioning) - in sky above hills
    if (this.cloudsSprite) {
      // Use native size - no scaling
      // This utilizes the full intentional width of the image

      // Start 2% offscreen to the left to utilize full image width
      // This provides coverage for enemy spawn area on the right
      this.cloudsSprite.x = this.app.screen.width * -0.02;

      // Position at ~31% from top (20% above hills bottom edge at 51%)
      this.cloudsSprite.y = this.app.screen.height * 0.31;
    }

    // Position grassland foreground layer (independent positioning)
    if (this.grasslandSprite) {
      // Use native size (2048x64px) - no scaling
      // This utilizes the full intentional width of the image

      // Start 2% offscreen to the left to utilize full image width
      // This provides coverage for enemy spawn area on the right
      this.grasslandSprite.x = this.app.screen.width * -0.02;
      this.grasslandSprite.y = this.app.screen.height * 0.47; // Grassland at 47%
    }

    // Position hills layer (independent positioning) - bottom edge at 51% (lowered by 1%)
    if (this.hillsSprite) {
      // Use native size - no scaling
      // This utilizes the full intentional width of the image

      // Start 2% offscreen to the left to utilize full image width
      // This provides coverage for enemy spawn area on the right
      this.hillsSprite.x = this.app.screen.width * -0.02;

      // Position so bottom edge is at 51% from top (lowered by 1%)
      const hillsBottomY = this.app.screen.height * 0.51;
      const nativeHeight = this.hillsSprite.texture.height; // Use native height (no scaling)
      this.hillsSprite.y = hillsBottomY - nativeHeight;
    }

    // Mountain layer is hidden and will be positioned later
    // TODO: Position mountain layer
  }

  private createCornerGem(): void {
    this.cornerGem = new Container();
    setZIndex(this.cornerGem, Z_LAYERS.UI_ELEMENTS);

    // Position in top-left corner
    this.cornerGem.x = 40;
    this.cornerGem.y = 40;

    this.app.stage.addChild(this.cornerGem);
    this.renderCornerGem();
  }

  private createHeartsDisplay(): void {
    this.heartsContainer = new Container();
    setZIndex(this.heartsContainer, Z_LAYERS.UI_ELEMENTS);

    // Position in top-center
    this.heartsContainer.x = this.app.screen.width / 2;
    this.heartsContainer.y = 30;

    this.app.stage.addChild(this.heartsContainer);
    this.renderHeartsDisplay();
  }

  private createEdgeIndicator(): void {
    this.edgeIndicator = new Container();
    setZIndex(this.edgeIndicator, Z_LAYERS.UI_ELEMENTS);

    this.app.stage.addChild(this.edgeIndicator);
    this.renderEdgeIndicator();
  }

  private async createDragonWithHPBar(style: HPBarStyle): Promise<void> {
    // Create dragon sprite
    const { sprite, animator } = await createAnimatedDragonSprite();

    const container = new Container();
    setZIndex(container, Z_LAYERS.PLAYER);

    sprite.x = 0;
    sprite.y = 0;
    sprite.scale.set(0.8);
    container.addChild(sprite);

    // Start animation
    animator.start();

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
    };

    this.dragons.push(dragon);
    this.app.stage.addChild(container);

    // Position dragon responsively
    this.positionDragons();

    // Initial render
    this.renderHealthBar(dragon);
  }

  private setupResizeHandler(): void {
    // Listen to ResponsiveManager's resize events through window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleResize(): void {
    // Reposition background
    this.positionBackground();

    // Reposition parallax layers
    this.positionParallaxLayers();

    // Reposition all dragons
    this.positionDragons();
  }

  private positionDragons(): void {
    // Position dragons in a row along the x-axis
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    const dragonCount = this.dragons.length;

    // Calculate spacing: divide screen into equal sections
    const spacing = screenWidth / (dragonCount + 1);
    const y = screenHeight * 0.35; // Center vertically in sky area

    this.dragons.forEach((dragon, index) => {
      // Position each dragon with equal spacing
      dragon.container.x = spacing * (index + 1);
      dragon.container.y = y;
    });
  }

  private renderHealthBar(dragon: DragonTestInstance): void {
    // Properly destroy all existing children before removing
    dragon.healthBar.children.forEach((child) => {
      if (child instanceof Graphics) {
        child.destroy();
      }
    });
    dragon.healthBar.removeChildren();

    const healthPercent = dragon.currentHealth / dragon.maxHealth;

    switch (dragon.style) {
      case 'rectangular':
        this.renderRectangular(dragon.healthBar, healthPercent);
        break;
      case 'circular-arc':
        this.renderCircularArc(dragon.healthBar, healthPercent);
        break;
      case 'curved':
        this.renderCurved(dragon.healthBar, healthPercent);
        break;
      case 'crystal-shard':
        this.renderCrystalShard(dragon.healthBar, healthPercent);
        break;
      case 'molten-core':
        this.renderMoltenCore(dragon.healthBar, healthPercent);
        break;
      case 'arcane-rune':
        this.renderArcaneRune(dragon.healthBar, healthPercent);
        break;
      case 'dragon-scale':
        this.renderDragonScale(dragon.healthBar, healthPercent);
        break;
      case 'ethereal-flame':
        this.renderEtherealFlame(dragon.healthBar, healthPercent);
        break;
      case 'liquid-mercury':
        this.renderLiquidMercury(dragon.healthBar, healthPercent);
        break;
      case 'living-vine':
        this.renderLivingVine(dragon.healthBar, healthPercent);
        break;
      case 'constellation':
        this.renderConstellation(dragon.healthBar, healthPercent);
        break;
      case 'flame-frost-wisp':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0x88ffff,
          body: 0x00ddff,
          core: 0xffffff,
        });
        break;
      case 'flame-inferno-blaze':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0xff4422, // Deeper red-orange
          body: 0xff0000, // Pure intense red
          core: 0xff8844, // Orange-red glow
        });
        break;
      case 'flame-classic-green':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0x88ff44, // Bright lime-green outer
          body: 0x44ff00, // Classic bright green
          core: 0xccff88, // Light green-yellow core
        });
        break;
      case 'flame-toxic-miasma':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0x884488, // Purple haze with green tint
          body: 0x553388, // Deep purple with toxic undertone
          core: 0x66ff66, // Bright sickly green core (unchanged)
        });
        break;
      case 'flame-arcane-violet':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0xcc88ff,
          body: 0x8844ff,
          core: 0xffffff,
        });
        break;
      case 'flame-bloodfire-crimson':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0xcc0022, // Dark blood red
          body: 0x880000, // Deep crimson
          core: 0xff4444, // Bright blood red core
        });
        break;
      case 'flame-divine-radiance':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0xffee88,
          body: 0xffcc00,
          core: 0xffffff,
        });
        break;
      case 'flame-nebula-dream':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0xff88ff,
          body: 0xcc44ff,
          core: 0xffccff,
        });
        break;
      case 'flame-voltaic-surge':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0x44ffcc,
          body: 0x00ffaa,
          core: 0xccffff,
        });
        break;
      case 'flame-shadow-ember':
        this.renderEtherealFlameWithPalette(dragon.healthBar, healthPercent, {
          outer: 0x6644aa,
          body: 0x331166,
          core: 0x9988cc,
        });
        break;
    }
  }

  private renderRectangular(container: Container, healthPercent: number): void {
    const width = 60;
    const height = 10;
    const x = -30;
    const y = -55; // Increased separation

    // Shadow for 3D effect
    const shadow = new Graphics();
    shadow.rect(x + 1, y + 1, width, height);
    shadow.fill({ color: 0x000000, alpha: 0.4 });
    container.addChild(shadow);

    // Background
    const bg = new Graphics();
    bg.rect(x, y, width, height);
    bg.fill(0x8b0000);
    bg.stroke({ color: 0x000000, width: 1 });
    container.addChild(bg);

    // Foreground (health)
    if (healthPercent > 0) {
      const healthColor = this.getHealthColor(healthPercent);
      const fg = new Graphics();
      fg.rect(x, y, width * healthPercent, height);
      fg.fill(healthColor);
      container.addChild(fg);

      // Highlight on top for 3D effect
      const highlight = new Graphics();
      highlight.rect(x, y, width * healthPercent, 2);
      highlight.fill({ color: 0xffffff, alpha: 0.35 });
      container.addChild(highlight);

      // Dark edge on bottom for depth
      const darkEdge = new Graphics();
      darkEdge.rect(x, y + height - 2, width * healthPercent, 2);
      darkEdge.fill({ color: 0x000000, alpha: 0.25 });
      container.addChild(darkEdge);

      // Segmentation marks every 10% - ONLY on filled health portion
      for (let i = 1; i < 10; i++) {
        const segX = x + width * (i * 0.1);
        // Only draw if this segment is within the filled health area
        if (i * 0.1 < healthPercent) {
          const seg = new Graphics();
          seg.moveTo(segX, y);
          seg.lineTo(segX, y + height);
          seg.stroke({ color: 0x000000, width: 1, alpha: 0.6 });
          container.addChild(seg);
        }
      }
    }
  }

  private renderCircularArc(container: Container, healthPercent: number): void {
    const radius = 50; // Increased radius
    const thickness = 7;
    // 120-degree arc on the left side, opening to the right
    const startAngle = (Math.PI * 2) / 3; // 120 degrees (upper-left)
    const endAngle = (Math.PI * 4) / 3; // 240 degrees (lower-left) - 120 degree arc

    // Shadow for 3D effect
    const shadow = new Graphics();
    shadow.arc(1, 1, radius, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: thickness, alpha: 0.4 });
    container.addChild(shadow);

    // Background arc
    const bg = new Graphics();
    bg.arc(0, 0, radius, startAngle, endAngle);
    bg.stroke({ color: 0x8b0000, width: thickness });
    container.addChild(bg);

    // Foreground arc (health)
    if (healthPercent > 0) {
      const healthColor = this.getHealthColor(healthPercent);
      const healthEndAngle = startAngle + (endAngle - startAngle) * healthPercent;
      const fg = new Graphics();
      fg.arc(0, 0, radius, startAngle, healthEndAngle);
      fg.stroke({ color: healthColor, width: thickness });
      container.addChild(fg);

      // Inner highlight for 3D effect
      const innerHighlight = new Graphics();
      innerHighlight.arc(0, 0, radius - thickness / 2 + 1, startAngle, healthEndAngle);
      innerHighlight.stroke({ color: 0xffffff, width: 1.5, alpha: 0.4 });
      container.addChild(innerHighlight);
    }
  }

  private renderHorizontalBelow(container: Container, healthPercent: number): void {
    const width = 70;
    const height = 8;
    const x = -35;
    const y = 50; // Increased separation - further below dragon

    // Shadow for 3D effect
    const shadow = new Graphics();
    shadow.rect(x + 1, y + 1, width, height);
    shadow.fill({ color: 0x000000, alpha: 0.4 });
    container.addChild(shadow);

    // Background
    const bg = new Graphics();
    bg.rect(x, y, width, height);
    bg.fill(0x8b0000);
    bg.stroke({ color: 0x000000, width: 1 });
    container.addChild(bg);

    // Foreground (health)
    if (healthPercent > 0) {
      const healthColor = this.getHealthColor(healthPercent);
      const fg = new Graphics();
      fg.rect(x, y, width * healthPercent, height);
      fg.fill(healthColor);
      container.addChild(fg);

      // Highlight on top for 3D effect
      const highlight = new Graphics();
      highlight.rect(x, y, width * healthPercent, 2);
      highlight.fill({ color: 0xffffff, alpha: 0.35 });
      container.addChild(highlight);

      // Dark edge on bottom for depth
      const darkEdge = new Graphics();
      darkEdge.rect(x, y + height - 2, width * healthPercent, 2);
      darkEdge.fill({ color: 0x000000, alpha: 0.25 });
      container.addChild(darkEdge);
    }

    // Segmentation marks every 10% - ONLY on filled health portion
    for (let i = 1; i < 10; i++) {
      const segX = x + width * (i * 0.1);
      // Only draw if this segment is within the filled health area
      if (i * 0.1 < healthPercent) {
        const seg = new Graphics();
        seg.moveTo(segX, y);
        seg.lineTo(segX, y + height);
        seg.stroke({ color: 0x000000, width: 1, alpha: 0.6 });
        container.addChild(seg);
      }
    }
  }

  private renderCurved(container: Container, healthPercent: number): void {
    const width = 60;
    const height = 12;
    const curve = 4;
    const x = -30;
    const y = 45; // Increased separation

    // Shadow for 3D effect
    const shadow = new Graphics();
    shadow.moveTo(x + 1, y + 1);
    shadow.bezierCurveTo(
      x + 1 + width * 0.25,
      y + 1 + curve,
      x + 1 + width * 0.75,
      y + 1 + curve,
      x + 1 + width,
      y + 1,
    );
    shadow.lineTo(x + 1 + width, y + 1 + height);
    shadow.bezierCurveTo(
      x + 1 + width * 0.75,
      y + 1 + height - curve,
      x + 1 + width * 0.25,
      y + 1 + height - curve,
      x + 1,
      y + 1 + height,
    );
    shadow.closePath();
    shadow.fill({ color: 0x000000, alpha: 0.4 });
    container.addChild(shadow);

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
      const healthColor = this.getHealthColor(healthPercent);
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
      fg.fill(healthColor);
      container.addChild(fg);

      // Highlight on top edge for 3D effect
      const highlight = new Graphics();
      highlight.moveTo(x, y);
      highlight.bezierCurveTo(
        x + fgWidth * 0.25,
        y + curve,
        x + fgWidth * 0.75,
        y + curve,
        x + fgWidth,
        y,
      );
      highlight.stroke({ color: 0xffffff, width: 2, alpha: 0.4 });
      container.addChild(highlight);
    }

    // Segmentation marks every 10% - ONLY on filled health portion
    for (let i = 1; i < 10; i++) {
      const segX = x + width * (i * 0.1);
      // Only draw if this segment is within the filled health area
      if (i * 0.1 < healthPercent) {
        const seg = new Graphics();
        seg.moveTo(segX, y);
        seg.lineTo(segX, y + height);
        seg.stroke({ color: 0x000000, width: 1, alpha: 0.6 });
        container.addChild(seg);
      }
    }
  }

  private renderSegmentedOrbs(container: Container, healthPercent: number): void {
    const orbCount = 10; // Each orb represents 10% health
    const orbRadius = 5;
    const spacing = 9;
    const totalWidth = (orbCount - 1) * spacing;
    const startX = -totalWidth / 2;
    const y = 50; // Increased separation

    const filledOrbs = Math.ceil(orbCount * healthPercent);

    for (let i = 0; i < orbCount; i++) {
      const orbX = startX + i * spacing;

      // Shadow for 3D effect
      const shadow = new Graphics();
      shadow.circle(orbX + 0.5, y + 0.5, orbRadius);
      shadow.fill({ color: 0x000000, alpha: 0.4 });
      container.addChild(shadow);

      const orb = new Graphics();

      if (i < filledOrbs) {
        // Filled orb
        const healthColor = this.getHealthColor(healthPercent);
        orb.circle(orbX, y, orbRadius);
        orb.fill(healthColor);
        orb.stroke({ color: 0x000000, width: 1 });
        container.addChild(orb);

        // Inner highlight for 3D effect
        const highlight = new Graphics();
        highlight.circle(orbX - 1, y - 1, orbRadius * 0.4);
        highlight.fill({ color: 0xffffff, alpha: 0.5 });
        container.addChild(highlight);
      } else {
        // Empty orb
        orb.circle(orbX, y, orbRadius);
        orb.fill(0x8b0000);
        orb.stroke({ color: 0x000000, width: 1 });
        container.addChild(orb);

        // Subtle inner shadow for empty orbs
        const innerShadow = new Graphics();
        innerShadow.circle(orbX + 0.5, y + 0.5, orbRadius * 0.6);
        innerShadow.fill({ color: 0x000000, alpha: 0.3 });
        container.addChild(innerShadow);
      }
    }
  }

  private renderRing(container: Container, healthPercent: number): void {
    const radius = 48; // Increased radius
    const thickness = 6;
    const startAngle = -Math.PI / 2; // Top (12 o'clock position)

    // Shadow for 3D effect
    const shadow = new Graphics();
    shadow.circle(1, 1, radius);
    shadow.stroke({ color: 0x000000, width: thickness, alpha: 0.4 });
    container.addChild(shadow);

    // Background circle
    const bg = new Graphics();
    bg.circle(0, 0, radius);
    bg.stroke({ color: 0x8b0000, width: thickness });
    container.addChild(bg);

    // Foreground arc (health)
    if (healthPercent > 0) {
      const healthColor = this.getHealthColor(healthPercent);
      const endAngle = startAngle + Math.PI * 2 * healthPercent;

      const fg = new Graphics();
      fg.arc(0, 0, radius, startAngle, endAngle);
      fg.stroke({ color: healthColor, width: thickness });
      container.addChild(fg);

      // Inner highlight for 3D effect
      const innerHighlight = new Graphics();
      innerHighlight.arc(0, 0, radius - thickness / 2 + 1, startAngle, endAngle);
      innerHighlight.stroke({ color: 0xffffff, width: 1.5, alpha: 0.4 });
      container.addChild(innerHighlight);
    }

    // Segmentation marks every 10% (36 degrees each) - ONLY on filled health portion
    for (let i = 0; i < 10; i++) {
      // Only draw if this segment is within the filled health area
      if (i * 0.1 < healthPercent) {
        const angle = startAngle + Math.PI * 2 * i * 0.1;
        const innerRadius = radius - thickness / 2;
        const outerRadius = radius + thickness / 2;

        const x1 = Math.cos(angle) * innerRadius;
        const y1 = Math.sin(angle) * innerRadius;
        const x2 = Math.cos(angle) * outerRadius;
        const y2 = Math.sin(angle) * outerRadius;

        const seg = new Graphics();
        seg.moveTo(x1, y1);
        seg.lineTo(x2, y2);
        seg.stroke({ color: 0x000000, width: 1.5, alpha: 0.7 });
        container.addChild(seg);
      }
    }
  }

  // New idle-game-focused HP displays
  private renderAuraGlow(container: Container, healthPercent: number): void {
    // Remove any existing glow filter
    container.filters = [];

    // Create a glow effect based on health
    const _glowColor = this.getHealthColorNumber(healthPercent);
    const _glowStrength = 15 + healthPercent * 15; // 15-30 based on health

    // Apply colored glow filter to entire dragon container
    // Note: PixiJS v8 filters work differently, using simple tint for now
    if (container.children[0]) {
      const sprite = container.children[0];
      if (healthPercent > 0.6) {
        sprite.tint = 0xccffcc; // Light green tint
      } else if (healthPercent > 0.3) {
        sprite.tint = 0xffffcc; // Light yellow tint
      } else {
        sprite.tint = 0xffcccc; // Light red tint
      }
    }
  }

  private renderNumberDisplay(
    container: Container,
    currentHealth: number,
    maxHealth: number,
  ): void {
    const text = new Text({
      text: `${Math.ceil(currentHealth)}/${maxHealth}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    text.anchor.set(0.5, 0.5);
    text.x = 0;
    text.y = -45;
    container.addChild(text);
  }

  private renderScaleColorShift(sprite: Sprite, healthPercent: number): void {
    // Shift dragon color based on health - but keep it always green per user request
    // Apply a subtle green tint that gets lighter as health decreases
    if (healthPercent > 0.75) {
      sprite.tint = 0xccffcc; // Light green tint
    } else if (healthPercent > 0.5) {
      sprite.tint = 0xbbffbb; // Slightly lighter green
    } else if (healthPercent > 0.25) {
      sprite.tint = 0xaaffaa; // Even lighter green
    } else {
      sprite.tint = 0x99ff99; // Lightest green (low health)
    }
  }

  private renderPulsingBreathing(sprite: Sprite, healthPercent: number): void {
    // Pulsing effect: faster pulse when low health
    const time = performance.now() / 1000;
    const pulseSpeed = 2 + (1 - healthPercent) * 4; // 2-6 Hz based on health
    const pulseScale = 0.8 + Math.sin(time * pulseSpeed) * 0.05; // ±5% scale
    sprite.scale.set(pulseScale);
  }

  private renderVerticalLeftCurved(container: Container, healthPercent: number): void {
    // Horizontal arc above the dragon (rotated 90 degrees)
    const thickness = 7;
    const x = 0; // Center horizontally
    const y = -45; // Above dragon

    const radius = 35;

    // Rotated 90 degrees clockwise: arc now goes from left to right above dragon
    // Original: topAngle = -PI/2 - PI/3, bottomAngle = -PI/2 + PI/3
    // Rotated: add PI/2 to each angle
    const leftAngle = Math.PI - Math.PI / 3; // ~120 degrees (left side)
    const rightAngle = Math.PI / 3; // ~60 degrees (right side)

    // Shadow for 3D effect
    const shadow = new Graphics();
    shadow.arc(x + 1, y + 1, radius, rightAngle, leftAngle);
    shadow.stroke({ color: 0x000000, width: thickness, alpha: 0.4 });
    container.addChild(shadow);

    // Background arc
    const bg = new Graphics();
    bg.arc(x, y, radius, rightAngle, leftAngle);
    bg.stroke({ color: 0x8b0000, width: thickness });
    container.addChild(bg);

    // Foreground arc (health) - grows from left to right
    if (healthPercent > 0) {
      const healthColor = this.getHealthColor(healthPercent);

      // Calculate the angle range for the filled portion
      const totalAngleRange = leftAngle - rightAngle;
      const healthAngleRange = totalAngleRange * healthPercent;
      const healthEndAngle = rightAngle + healthAngleRange;

      const fg = new Graphics();
      fg.arc(x, y, radius, rightAngle, healthEndAngle);
      fg.stroke({ color: healthColor, width: thickness });
      container.addChild(fg);

      // Inner highlight for 3D effect
      const innerHighlight = new Graphics();
      innerHighlight.arc(x, y, radius - thickness / 2 + 1, rightAngle, healthEndAngle);
      innerHighlight.stroke({ color: 0xffffff, width: 1.5, alpha: 0.4 });
      container.addChild(innerHighlight);
    }

    // Segmentation marks every 10% - ONLY on filled health portion
    for (let i = 1; i < 10; i++) {
      // Only draw if this segment is within the filled health area
      if (i * 0.1 < healthPercent) {
        const totalAngleRange = leftAngle - rightAngle;
        const segmentAngle = rightAngle + totalAngleRange * i * 0.1;
        const innerRadius = radius - thickness / 2;
        const outerRadius = radius + thickness / 2;

        const x1 = x + Math.cos(segmentAngle) * innerRadius;
        const y1 = y + Math.sin(segmentAngle) * innerRadius;
        const x2 = x + Math.cos(segmentAngle) * outerRadius;
        const y2 = y + Math.sin(segmentAngle) * outerRadius;

        const seg = new Graphics();
        seg.moveTo(x1, y1);
        seg.lineTo(x2, y2);
        seg.stroke({ color: 0x000000, width: 1.5, alpha: 0.7 });
        container.addChild(seg);
      }
    }
  }

  // New HP Bar Redesigns - Executor's requested styles

  /**
   * Crystal Shard Arc - Mystical crystalline energy with beveled shards
   */
  private renderCrystalShard(container: Container, healthPercent: number): void {
    const radius = 50;
    const thickness = 8;
    const startAngle = (Math.PI * 2) / 3; // 120 degrees
    const endAngle = (Math.PI * 4) / 3; // 240 degrees
    const segments = 10;

    // Drop shadow for depth
    const shadow = new Graphics();
    shadow.arc(2, 2, radius, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: thickness + 2, alpha: 0.5 });
    container.addChild(shadow);

    // Background arc (dark crystal)
    const bg = new Graphics();
    bg.arc(0, 0, radius, startAngle, endAngle);
    bg.stroke({ color: 0x1a0d33, width: thickness + 2 }); // Dark purple
    container.addChild(bg);

    if (healthPercent > 0) {
      const _healthEndAngle = startAngle + (endAngle - startAngle) * healthPercent;

      // Draw crystal shards as segments
      for (let i = 0; i < segments; i++) {
        const segmentPercent = i / segments;
        if (segmentPercent >= healthPercent) break;

        const segStartAngle = startAngle + (endAngle - startAngle) * segmentPercent;
        const segEndAngle =
          startAngle + (endAngle - startAngle) * Math.min((i + 1) / segments, healthPercent);

        // Crystal shard with gradient effect
        const shard = new Graphics();
        shard.arc(0, 0, radius, segStartAngle, segEndAngle);
        shard.stroke({ color: 0x00ffff, width: thickness }); // Cyan crystal
        container.addChild(shard);

        // Inner highlight for crystalline refraction
        const highlight = new Graphics();
        highlight.arc(0, 0, radius - thickness / 3, segStartAngle, segEndAngle);
        highlight.stroke({ color: 0xffffff, width: 2, alpha: 0.6 });
        container.addChild(highlight);

        // Outer bevel
        const bevel = new Graphics();
        bevel.arc(0, 0, radius + thickness / 3, segStartAngle, segEndAngle);
        bevel.stroke({ color: 0x004444, width: 1, alpha: 0.4 });
        container.addChild(bevel);
      }
    }
  }

  /**
   * Molten Core Curve - Fantasy-forged metal with glowing lava channels
   */
  private renderMoltenCore(container: Container, healthPercent: number): void {
    const radius = 50;
    const thickness = 10;
    const startAngle = (Math.PI * 2) / 3;
    const endAngle = (Math.PI * 4) / 3;

    // Drop shadow for depth
    const shadow = new Graphics();
    shadow.arc(2, 2, radius, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: thickness + 2, alpha: 0.5 });
    container.addChild(shadow);

    // Metallic outer rim (bronze/gold)
    const outerRim = new Graphics();
    outerRim.arc(0, 0, radius + thickness / 2, startAngle, endAngle);
    outerRim.stroke({ color: 0x8b6914, width: 2 }); // Dark gold
    container.addChild(outerRim);

    // Inner metallic rim
    const innerRim = new Graphics();
    innerRim.arc(0, 0, radius - thickness / 2, startAngle, endAngle);
    innerRim.stroke({ color: 0x5c4a0f, width: 2 }); // Darker gold
    container.addChild(innerRim);

    // Background lava channel (dark)
    const bgLava = new Graphics();
    bgLava.arc(0, 0, radius, startAngle, endAngle);
    bgLava.stroke({ color: 0x330000, width: thickness - 2 });
    container.addChild(bgLava);

    if (healthPercent > 0) {
      const healthEndAngle = startAngle + (endAngle - startAngle) * healthPercent;

      // Glowing lava core
      const lavaCore = new Graphics();
      lavaCore.arc(0, 0, radius, startAngle, healthEndAngle);
      lavaCore.stroke({ color: 0xff4500, width: thickness - 2 }); // Orange-red lava
      container.addChild(lavaCore);

      // Bright lava center
      const lavaGlow = new Graphics();
      lavaGlow.arc(0, 0, radius, startAngle, healthEndAngle);
      lavaGlow.stroke({ color: 0xffff00, width: thickness - 6, alpha: 0.7 }); // Yellow glow
      container.addChild(lavaGlow);

      // Cracks/veins in the metal
      for (let i = 1; i < 10; i++) {
        if (i * 0.1 < healthPercent) {
          const angle = startAngle + (endAngle - startAngle) * (i * 0.1);
          const innerR = radius - thickness / 2;
          const outerR = radius + thickness / 2;

          const crack = new Graphics();
          crack.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
          crack.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
          crack.stroke({ color: 0xff6600, width: 1, alpha: 0.5 });
          container.addChild(crack);
        }
      }
    }
  }

  /**
   * Arcane Rune Circuit - Ancient magical runes channeling life force
   */
  private renderArcaneRune(container: Container, healthPercent: number): void {
    const radius = 50;
    const thickness = 9;
    const startAngle = (Math.PI * 2) / 3;
    const endAngle = (Math.PI * 4) / 3;
    const segments = 10;

    // Drop shadow for depth
    const shadow = new Graphics();
    shadow.arc(2, 2, radius, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: thickness + 4, alpha: 0.5 });
    container.addChild(shadow);

    // Stone/obsidian base
    const base = new Graphics();
    base.arc(0, 0, radius, startAngle, endAngle);
    base.stroke({ color: 0x1a1a2e, width: thickness + 4 }); // Dark obsidian
    container.addChild(base);

    // Weathered texture
    const texture = new Graphics();
    texture.arc(0, 0, radius, startAngle, endAngle);
    texture.stroke({ color: 0x0f0f1e, width: thickness + 2, alpha: 0.5 });
    container.addChild(texture);

    if (healthPercent > 0) {
      // Draw rune segments
      for (let i = 0; i < segments; i++) {
        const segmentPercent = i / segments;
        if (segmentPercent >= healthPercent) break;

        const angle = startAngle + (endAngle - startAngle) * (segmentPercent + 0.05);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Glowing rune circle
        const rune = new Graphics();
        rune.circle(x, y, 4);
        rune.fill({ color: 0x00ffff, alpha: 0.8 }); // Cyan arcane glow
        rune.stroke({ color: 0x0088ff, width: 1 });
        container.addChild(rune);

        // Rune symbol (simplified as cross)
        const symbol = new Graphics();
        symbol.moveTo(x - 2, y);
        symbol.lineTo(x + 2, y);
        symbol.moveTo(x, y - 2);
        symbol.lineTo(x, y + 2);
        symbol.stroke({ color: 0xffffff, width: 1, alpha: 0.9 });
        container.addChild(symbol);

        // Connecting energy thread
        if (i > 0 && i * 0.1 < healthPercent) {
          const prevAngle = startAngle + (endAngle - startAngle) * ((i - 1) / segments + 0.05);
          const prevX = Math.cos(prevAngle) * radius;
          const prevY = Math.sin(prevAngle) * radius;

          const thread = new Graphics();
          thread.moveTo(prevX, prevY);
          thread.lineTo(x, y);
          thread.stroke({ color: 0x00aaff, width: 1, alpha: 0.6 });
          container.addChild(thread);
        }
      }
    }
  }

  /**
   * Dragon Scale Segments - Overlapping dragon scales with iridescent shimmer
   */
  private renderDragonScale(container: Container, healthPercent: number): void {
    const radius = 50;
    const thickness = 10;
    const startAngle = (Math.PI * 2) / 3;
    const endAngle = (Math.PI * 4) / 3;
    const segments = 12;

    // Drop shadow for depth
    const shadow = new Graphics();
    shadow.arc(2, 2, radius, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: thickness + 2, alpha: 0.5 });
    container.addChild(shadow);

    // Background (damaged scales)
    const bg = new Graphics();
    bg.arc(0, 0, radius, startAngle, endAngle);
    bg.stroke({ color: 0x2d1f1f, width: thickness + 2 });
    container.addChild(bg);

    if (healthPercent > 0) {
      // Draw overlapping scales
      for (let i = 0; i < segments; i++) {
        const segmentPercent = i / segments;
        if (segmentPercent >= healthPercent) break;

        const segStartAngle = startAngle + (endAngle - startAngle) * segmentPercent;
        const segEndAngle =
          startAngle + (endAngle - startAngle) * Math.min((i + 1) / segments, healthPercent);

        // Scale body (green with slight variation)
        const scale = new Graphics();
        scale.arc(0, 0, radius, segStartAngle, segEndAngle);
        scale.stroke({ color: 0x2d8b3d + i * 0x020202, width: thickness }); // Varying green
        container.addChild(scale);

        // Scale edge highlight (iridescent effect)
        const edgeHighlight = new Graphics();
        edgeHighlight.arc(0, 0, radius + thickness / 2 - 1, segStartAngle, segEndAngle);
        edgeHighlight.stroke({ color: 0x88ff88, width: 1, alpha: 0.5 });
        container.addChild(edgeHighlight);

        // Inner scale texture
        const innerTexture = new Graphics();
        innerTexture.arc(0, 0, radius - thickness / 3, segStartAngle, segEndAngle);
        innerTexture.stroke({ color: 0x66ff66, width: 1, alpha: 0.3 });
        container.addChild(innerTexture);

        // Scale overlap shadow
        const midAngle = (segStartAngle + segEndAngle) / 2;
        const shadowLine = new Graphics();
        shadowLine.arc(0, 0, radius, midAngle - 0.01, midAngle + 0.01);
        shadowLine.stroke({ color: 0x000000, width: thickness, alpha: 0.3 });
        container.addChild(shadowLine);
      }
    }
  }

  /**
   * Ethereal Flame - Ghostly flame with wispy tendrils (original)
   */
  private renderEtherealFlame(container: Container, healthPercent: number): void {
    this.renderEtherealFlameWithPalette(container, healthPercent, {
      outer: 0x88ffff,
      body: 0x00ddff,
      core: 0xffffff,
    });
  }

  /**
   * Ethereal Flame with custom color palette
   */
  private renderEtherealFlameWithPalette(
    container: Container,
    healthPercent: number,
    palette: { outer: number; body: number; core: number },
  ): void {
    const radius = 50;
    const thickness = 8;
    const startAngle = (Math.PI * 2) / 3;
    const endAngle = (Math.PI * 4) / 3;

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

      // Wispy tendrils (using slightly modified outer color)
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
   * Liquid Mercury Gauge - Metallic liquid in crystal tube
   */
  private renderLiquidMercury(container: Container, healthPercent: number): void {
    const radius = 50;
    const thickness = 8;
    const startAngle = (Math.PI * 2) / 3;
    const endAngle = (Math.PI * 4) / 3;

    // Drop shadow for depth
    const shadow = new Graphics();
    shadow.arc(2, 2, radius, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: thickness + 2, alpha: 0.5 });
    container.addChild(shadow);

    // Crystal tube outer edge
    const tubeOuter = new Graphics();
    tubeOuter.arc(0, 0, radius + thickness / 2, startAngle, endAngle);
    tubeOuter.stroke({ color: 0xaaaaff, width: 1, alpha: 0.6 });
    container.addChild(tubeOuter);

    // Crystal tube inner edge
    const tubeInner = new Graphics();
    tubeInner.arc(0, 0, radius - thickness / 2, startAngle, endAngle);
    tubeInner.stroke({ color: 0x8888cc, width: 1, alpha: 0.6 });
    container.addChild(tubeInner);

    // Empty tube background
    const emptyTube = new Graphics();
    emptyTube.arc(0, 0, radius, startAngle, endAngle);
    emptyTube.stroke({ color: 0x111122, width: thickness - 2, alpha: 0.3 });
    container.addChild(emptyTube);

    if (healthPercent > 0) {
      const healthEndAngle = startAngle + (endAngle - startAngle) * healthPercent;

      // Mercury body (silver)
      const mercury = new Graphics();
      mercury.arc(0, 0, radius, startAngle, healthEndAngle);
      mercury.stroke({ color: 0xc0c0c0, width: thickness - 2 });
      container.addChild(mercury);

      // Mercury highlights (reflections)
      const highlight1 = new Graphics();
      highlight1.arc(0, 0, radius - thickness / 4, startAngle, healthEndAngle);
      highlight1.stroke({ color: 0xffffff, width: 1, alpha: 0.7 });
      container.addChild(highlight1);

      // Mercury shadows
      const shadow1 = new Graphics();
      shadow1.arc(0, 0, radius + thickness / 4, startAngle, healthEndAngle);
      shadow1.stroke({ color: 0x606060, width: 1, alpha: 0.5 });
      container.addChild(shadow1);

      // Etched scrollwork on tube
      for (let i = 1; i < 10; i++) {
        if (i * 0.1 < healthPercent) {
          const angle = startAngle + (endAngle - startAngle) * (i * 0.1);
          const innerR = radius - thickness / 2 - 1;
          const outerR = radius + thickness / 2 + 1;

          const etch = new Graphics();
          etch.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
          etch.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
          etch.stroke({ color: 0x6666aa, width: 0.5, alpha: 0.6 });
          container.addChild(etch);
        }
      }
    }
  }

  /**
   * Living Vine Helix - Organic glowing vines with bioluminescence
   */
  private renderLivingVine(container: Container, healthPercent: number): void {
    const radius = 50;
    const thickness = 7;
    const startAngle = (Math.PI * 2) / 3;
    const endAngle = (Math.PI * 4) / 3;

    // Drop shadow for depth
    const shadow = new Graphics();
    shadow.arc(2, 2, radius, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: thickness + 2, alpha: 0.5 });
    container.addChild(shadow);

    // Dead/withered vine background
    const deadVine = new Graphics();
    deadVine.arc(0, 0, radius, startAngle, endAngle);
    deadVine.stroke({ color: 0x2d1f0f, width: thickness + 2 });
    container.addChild(deadVine);

    if (healthPercent > 0) {
      const healthEndAngle = startAngle + (endAngle - startAngle) * healthPercent;

      // Main vine body (brown-green)
      const vineBody = new Graphics();
      vineBody.arc(0, 0, radius, startAngle, healthEndAngle);
      vineBody.stroke({ color: 0x4a6b2d, width: thickness });
      container.addChild(vineBody);

      // Vine texture/bark
      const vineTexture = new Graphics();
      vineTexture.arc(0, 0, radius, startAngle, healthEndAngle);
      vineTexture.stroke({ color: 0x3a5b1d, width: thickness - 2 });
      container.addChild(vineTexture);

      // Bioluminescent glow veins
      const glowVeins = new Graphics();
      glowVeins.arc(0, 0, radius, startAngle, healthEndAngle);
      glowVeins.stroke({ color: 0x88ff44, width: 2, alpha: 0.6 });
      container.addChild(glowVeins);

      // Leaves/blossoms at healthy segments
      for (let i = 0; i < 8; i++) {
        const segmentPercent = i / 8;
        if (segmentPercent >= healthPercent) break;

        const angle = startAngle + (endAngle - startAngle) * (segmentPercent + 0.06);
        const x = Math.cos(angle) * (radius + thickness / 2 + 3);
        const y = Math.sin(angle) * (radius + thickness / 2 + 3);

        // Small leaf/blossom
        const leaf = new Graphics();
        leaf.circle(x, y, 2);
        leaf.fill({ color: 0x66ff33, alpha: 0.7 });
        container.addChild(leaf);

        // Leaf glow
        const leafGlow = new Graphics();
        leafGlow.circle(x, y, 3);
        leafGlow.fill({ color: 0xaaff66, alpha: 0.3 });
        container.addChild(leafGlow);
      }
    }
  }

  /**
   * Celestial Constellation Arc - Stars and cosmic energy
   */
  private renderConstellation(container: Container, healthPercent: number): void {
    const radius = 50;
    const thickness = 2;
    const startAngle = (Math.PI * 2) / 3;
    const endAngle = (Math.PI * 4) / 3;
    const starCount = 10;

    // Drop shadow for depth
    const shadow = new Graphics();
    shadow.arc(2, 2, radius + 5, startAngle, endAngle);
    shadow.stroke({ color: 0x000000, width: 12, alpha: 0.5 });
    container.addChild(shadow);

    // Cosmic nebula background
    const nebula = new Graphics();
    nebula.arc(0, 0, radius + 5, startAngle, endAngle);
    nebula.stroke({ color: 0x2d1f4a, width: 12, alpha: 0.4 });
    container.addChild(nebula);

    if (healthPercent > 0) {
      // Draw stars and connecting energy threads
      for (let i = 0; i < starCount; i++) {
        const segmentPercent = i / starCount;
        if (segmentPercent >= healthPercent) break;

        const angle = startAngle + (endAngle - startAngle) * (segmentPercent + 0.05);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Star glow aura
        const starGlow = new Graphics();
        starGlow.circle(x, y, 5);
        starGlow.fill({ color: 0x6666ff, alpha: 0.2 });
        container.addChild(starGlow);

        // Star core
        const star = new Graphics();
        star.circle(x, y, 2.5);
        star.fill({ color: 0xffffaa });
        star.stroke({ color: 0xffffff, width: 1 });
        container.addChild(star);

        // Star twinkle points
        const twinkle = new Graphics();
        twinkle.moveTo(x - 4, y);
        twinkle.lineTo(x + 4, y);
        twinkle.moveTo(x, y - 4);
        twinkle.lineTo(x, y + 4);
        twinkle.stroke({ color: 0xffffff, width: 0.5, alpha: 0.8 });
        container.addChild(twinkle);

        // Energy thread connecting stars
        if (i > 0 && (i - 1) / starCount < healthPercent) {
          const prevAngle = startAngle + (endAngle - startAngle) * ((i - 1) / starCount + 0.05);
          const prevX = Math.cos(prevAngle) * radius;
          const prevY = Math.sin(prevAngle) * radius;

          const thread = new Graphics();
          thread.moveTo(prevX, prevY);
          thread.lineTo(x, y);
          thread.stroke({ color: 0xaaaaff, width: thickness, alpha: 0.5 });
          container.addChild(thread);
        }
      }

      // Cosmic particles floating around
      for (let i = 0; i < 15; i++) {
        const particlePercent = Math.random();
        if (particlePercent >= healthPercent) continue;

        const angle = startAngle + (endAngle - startAngle) * particlePercent;
        const offsetR = radius + (Math.random() * 10 - 5);
        const px = Math.cos(angle) * offsetR;
        const py = Math.sin(angle) * offsetR;

        const particle = new Graphics();
        particle.circle(px, py, 0.5);
        particle.fill({ color: 0xccccff, alpha: 0.6 });
        container.addChild(particle);
      }
    }
  }

  // Standalone UI element renderers
  private renderCornerGem(): void {
    if (!this.cornerGem) return;
    this.cornerGem.removeChildren();

    const healthPercent = this.currentHealth / this.maxHealth;
    const gemSize = 30;

    // Gem shadow
    const shadow = new Graphics();
    shadow.circle(2, 2, gemSize / 2);
    shadow.fill({ color: 0x000000, alpha: 0.5 });
    this.cornerGem.addChild(shadow);

    // Gem outer
    const gem = new Graphics();
    gem.circle(0, 0, gemSize / 2);
    gem.fill(this.getHealthColorNumber(healthPercent));
    gem.stroke({ color: 0x000000, width: 2 });
    this.cornerGem.addChild(gem);

    // Inner shine
    const shine = new Graphics();
    shine.circle(-4, -4, gemSize / 4);
    shine.fill({ color: 0xffffff, alpha: 0.6 });
    this.cornerGem.addChild(shine);

    // Pulse based on health
    const time = performance.now() / 1000;
    const pulse = 1 + Math.sin(time * 3) * 0.1 * (1 - healthPercent); // Pulse more when low
    this.cornerGem.scale.set(pulse);
  }

  private renderHeartsDisplay(): void {
    if (!this.heartsContainer) return;
    this.heartsContainer.removeChildren();

    const totalHearts = 5;
    const healthPercent = this.currentHealth / this.maxHealth;
    const filledHearts = Math.ceil(totalHearts * healthPercent);
    const heartSize = 20;
    const spacing = 25;

    for (let i = 0; i < totalHearts; i++) {
      const heart = new Container();
      const x = (i - (totalHearts - 1) / 2) * spacing;

      if (i < filledHearts) {
        // Filled heart
        this.drawHeart(heart, heartSize, 0xff0000, true);
      } else {
        // Empty heart
        this.drawHeart(heart, heartSize, 0x660000, false);
      }

      heart.x = x;
      this.heartsContainer.addChild(heart);
    }
  }

  private drawHeart(container: Container, size: number, color: number, filled: boolean): void {
    const heart = new Graphics();

    // Simple heart shape using circles and triangle
    heart.circle(-size * 0.25, -size * 0.15, size * 0.3);
    heart.circle(size * 0.25, -size * 0.15, size * 0.3);

    if (filled) {
      heart.fill(color);
    } else {
      heart.fill({ color: 0x000000, alpha: 0.3 });
      heart.stroke({ color, width: 2 });
    }

    heart.moveTo(0, size * 0.4);
    heart.lineTo(-size * 0.5, -size * 0.1);
    heart.lineTo(size * 0.5, -size * 0.1);
    heart.closePath();

    if (filled) {
      heart.fill(color);
    } else {
      heart.fill({ color: 0x000000, alpha: 0.3 });
    }

    container.addChild(heart);
  }

  private renderEdgeIndicator(): void {
    if (!this.edgeIndicator) return;
    this.edgeIndicator.removeChildren();

    const healthPercent = this.currentHealth / this.maxHealth;
    const thickness = 5;
    const width = this.app.screen.width;
    const healthColor = this.getHealthColorNumber(healthPercent);

    // Top edge indicator
    const edge = new Graphics();
    edge.rect(0, 0, width * healthPercent, thickness);
    edge.fill(healthColor);
    this.edgeIndicator.addChild(edge);

    // Gradient effect (fade to transparent)
    edge.alpha = 0.7;
  }

  private getHealthColor(_healthPercent: number): number {
    return 0x00ff00; // Always green
  }

  private getHealthColorNumber(healthPercent: number): number {
    return this.getHealthColor(healthPercent);
  }

  update(_deltaTime: number): void {
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.phaseStartTime;

    // Animation cycle phases:
    // Damage I: 3s (100% → 50%)
    // Hold: 4s (at 50%)
    // Damage II: 3s (50% → 0%)
    // Hold: 4s (at 0%)
    // Healing: 8s (0% → 100%)
    // Hold: 4s (at 100%)
    // Total: 26 seconds

    const damageIDuration = 3000; // 3 seconds
    const hold1Duration = 4000; // 4 seconds
    const damageIIDuration = 3000; // 3 seconds
    const hold2Duration = 4000; // 4 seconds
    const healingDuration = 8000; // 8 seconds
    const hold3Duration = 4000; // 4 seconds

    const cycleDuration =
      damageIDuration +
      hold1Duration +
      damageIIDuration +
      hold2Duration +
      healingDuration +
      hold3Duration;

    const cycleTime = elapsedTime % cycleDuration;

    let phase1End = damageIDuration;
    let phase2End = phase1End + hold1Duration;
    let phase3End = phase2End + damageIIDuration;
    let phase4End = phase3End + hold2Duration;
    let phase5End = phase4End + healingDuration;
    const _phase6End = phase5End + hold3Duration;

    if (cycleTime < phase1End) {
      // Damage Phase I: 100% → 50%
      this.combatPhase = 'damage';
      const progress = cycleTime / damageIDuration;
      this.currentHealth = 100 - progress * 50; // 100% down to 50%
    } else if (cycleTime < phase2End) {
      // Hold at 50%
      this.currentHealth = 50;
    } else if (cycleTime < phase3End) {
      // Damage Phase II: 50% → 0%
      this.combatPhase = 'damage';
      const progress = (cycleTime - phase2End) / damageIIDuration;
      this.currentHealth = 50 - progress * 50; // 50% down to 0%
    } else if (cycleTime < phase4End) {
      // Hold at 0%
      this.currentHealth = 0;
    } else if (cycleTime < phase5End) {
      // Healing Phase: 0% → 100%
      this.combatPhase = 'heal';
      const progress = (cycleTime - phase4End) / healingDuration;
      this.currentHealth = progress * 100; // 0% up to 100%
    } else {
      // Hold at 100%
      this.currentHealth = 100;
    }

    // Only update if health has changed (avoid recreating Graphics every frame)
    if (Math.abs(this.currentHealth - this.lastRenderedHealth) > 0.5) {
      this.lastRenderedHealth = this.currentHealth;

      // Update all dragons with the current health
      this.dragons.forEach((dragon) => {
        dragon.currentHealth = this.currentHealth;
        this.renderHealthBar(dragon);
      });
    }
  }

  destroy(): void {
    // Clean up dragons
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

    // Clean up responsive manager
    this.responsiveManager.destroy();

    // Clean up resize handler
    window.removeEventListener('resize', () => this.handleResize());
  }
}
