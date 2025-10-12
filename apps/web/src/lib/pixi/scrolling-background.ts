/**
 * Infinite Scrolling Background System
 *
 * Creates a seamless infinite scrolling background that moves right to left
 * when the dragon is moving forward, creating a flying effect.
 */

import { Container, Sprite, Texture, Assets, Graphics, Text, type Application } from 'pixi.js';
import { createAnimatedDragonSprite, type DragonAnimator } from './dragon-sprites';
import { createAnimatedEnemySprite, type EnemyType, type EnemyAnimator } from './enemy-sprites';
import {
  createProjectile,
  getProjectileTypeForEnemy,
  getDragonProjectileType,
  type Projectile,
} from './projectile-sprites';
import { BackgroundPositioning } from './background-analyzer';
import { createDefaultArcanaDropManager, type ArcanaDropManager } from '@draconia/sim';

// Z-Index Layer Management System (0-99)
// Organized in 10-layer chunks for easy expansion
const Z_LAYERS = {
  // 0-9: Background layers (furthest back)
  BACKGROUND_STATIC: 0,           // Main background sprites
  BACKGROUND_CLOUDS: 1,          // Sky clouds layer (behind mountain)
  BACKGROUND_PARALLAX: 2,        // Distant parallax elements (mountains)
  
  // 10-19: Environment layers
  ENVIRONMENT_DECORATIVE: 10,     // Trees, rocks, buildings
  ENVIRONMENT_INTERACTIVE: 11,    // Collectibles, power-ups
  
  // 20-29: Gameplay layers
  ENEMIES: 20,                    // Enemy sprites
  ENEMY_PROJECTILES: 21,          // Enemy attacks
  PLAYER_PROJECTILES: 22,         // Player attacks
  
  // 30-39: Player layers
  PLAYER_DRAGON: 30,              // Main dragon character
  
  // 40-49: Foreground environment
  FOREGROUND_GRASS: 40,           // Grassland layer
  FOREGROUND_DECORATIVE: 41,      // Foreground trees, grass details
  
  // 50-59: UI Background layers
  UI_BACKGROUND_PANELS: 50,       // Currency panels, health bar backgrounds
  UI_BACKGROUND_ELEMENTS: 51,     // Other UI backgrounds
  
  // 60-69: UI Content layers
  UI_HEALTH_BARS: 60,             // Health bars
  UI_TEXT: 61,                    // Text elements
  UI_ICONS: 62,                   // Icons (Arcana, etc.)
  UI_CONTROLS: 63,                // Movement control buttons
  
  // 70-79: Effects layers
  EFFECTS_PARTICLES: 70,          // Particle effects
  EFFECTS_LIGHTING: 71,           // Lighting effects
  EFFECTS_OVERLAY: 72,            // Screen effects, transitions
  
  // 80-89: Debug layers
  DEBUG_MEASUREMENT: 80,          // Measurement overlay, grid lines
  DEBUG_HITBOXES: 81,             // Collision debug visuals
  DEBUG_INFO: 82,                 // Debug text, performance info
  
  // 90-99: Reserved for future expansion
  RESERVED_90: 90,
  RESERVED_91: 91,
  RESERVED_92: 92,
  RESERVED_93: 93,
  RESERVED_94: 94,
  RESERVED_95: 95,
  RESERVED_96: 96,
  RESERVED_97: 97,
  RESERVED_98: 98,
  RESERVED_99: 99
} as const;

// Helper function to set z-index for any display object
function setZIndex(displayObject: any, layer: number): void {
  if (displayObject && typeof displayObject.zIndex === 'number') {
    displayObject.zIndex = layer;
  }
}

// Dragon state enum for defeat/recovery system
enum DragonState {
  ALIVE = 'alive',
  DEFEATED = 'defeated',
  RECOVERING = 'recovering',
}

// Extend window interface for background width tracking
declare global {
  interface Window {
    backgroundWidth?: number;
  }
}

export interface ScrollingBackgroundConfig {
  /** Scroll speed in pixels per second (default: 100) */
  scrollSpeed?: number;
  /** Whether scrolling is enabled (default: true) */
  enabled?: boolean;
}

export interface ScrollingBackgroundHandle {
  /** Start scrolling */
  start: () => void;
  /** Stop scrolling */
  stop: () => void;
  /** Check if scrolling is active */
  isScrolling: () => boolean;
  /** Set scroll speed */
  setSpeed: (_speed: number) => void;
  /** Get dragon protagonist sprite */
  getDragon: () => Sprite | null;
  /** Get dragon animator */
  getDragonAnimator: () => DragonAnimator | null;
  /** Start automatic gameplay (enemy spawning, combat) */
  startAutomaticGameplay: () => void;
  /** Stop automatic gameplay */
  stopAutomaticGameplay: () => void;
  /** Check if gameplay is active */
  isGameplayActive: () => boolean;
  /** Spawn a specific enemy type */
  spawnEnemy: (_type: EnemyType) => void;
  /** Get current gameplay statistics */
  getGameplayStats: () => { dragons: number; enemies: number; projectiles: number };
  /** Destroy the background */
  destroy: () => void;
}

/**
 * Create an infinite scrolling background
 */
export async function createScrollingBackground(
  app: Application,
  config: ScrollingBackgroundConfig = {},
): Promise<ScrollingBackgroundHandle> {
  // console.log('🎯 SCROLLING-BACKGROUND: Function called with config:', config);
  console.log('🔍 DEBUG: Initial stage children count:', app.stage.children.length);
  console.log('🔍 DEBUG: Initial stage children details:', app.stage.children.map((child, index) => ({
    index,
    name: child.name,
    type: child.constructor.name,
    visible: child.visible,
    alpha: child.alpha,
    x: child.x,
    y: child.y,
    width: child.width,
    height: child.height
  })));
  
  // DEBUGGING: Check for any Graphics objects that might be the black box
  const graphicsObjects = app.stage.children.filter(child => child.constructor.name === 'Graphics');
  if (graphicsObjects.length > 0) {
    console.log('🔍 DEBUG: Found Graphics objects on initial stage:', graphicsObjects.map((obj, index) => ({
      index,
      name: obj.name,
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      visible: obj.visible,
      alpha: obj.alpha
    })));
  } else {
    console.log('🔍 DEBUG: No Graphics objects found on initial stage');
  }

  // DEBUGGING HELPER: Add log export functionality
  (window as any).exportGameLogs = () => {
    const logs: string[] = [];
    const originalLog = console.log;
    
    console.log = (...args: any[]) => {
      logs.push(`[${new Date().toISOString()}] ${args.join(' ')}`);
      originalLog(...args);
    };
    
    setTimeout(() => {
      console.log = originalLog;
      const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dragon-idler-logs-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }, 5000); // Capture 5 seconds of logs
  };
  
  // console.log('📁 DEBUG: Call window.exportGameLogs() to download recent logs');
  
  // DEBUGGING: Intercept stage.addChild to track Graphics objects
  const originalAddChild = app.stage.addChild.bind(app.stage);
  app.stage.addChild = function(child: any) {
    if (child.constructor.name === 'Graphics') {
      console.log('🔍 DEBUG: Graphics object added to stage:', {
        name: child.name || 'unnamed',
        x: child.x,
        y: child.y,
        width: child.width,
        height: child.height,
        visible: child.visible,
        alpha: child.alpha
      });
    }
    return originalAddChild(child);
  };
  
  // Track any Graphics objects created early
  const originalGraphics = (window as any).Graphics;
  if (originalGraphics) {
    console.log('🔍 DEBUG: Graphics constructor is available globally');
  }

  // DEBUGGING: Intercept all Graphics object creation
  const GraphicsClass = await import('pixi.js').then(m => m.Graphics);
  const originalGraphicsConstructor = GraphicsClass;
  
  // Override Graphics constructor to log all creations
  const OriginalGraphics = GraphicsClass;
  (window as any).Graphics = class extends OriginalGraphics {
    constructor(...args: any[]) {
      super(...args);
      console.log('🔍 DEBUG: Graphics object created:', {
        name: this.name || 'unnamed',
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        visible: this.visible,
        alpha: this.alpha,
        stack: new Error().stack?.split('\n').slice(1, 4)
      });
    }
  };
  
  // Note: Cannot override imported Graphics class directly due to read-only property
  // Using window-level override and direct logging instead
  const scrollSpeed = config.scrollSpeed ?? 100; // pixels per second
  let currentSpeed = scrollSpeed;
  let isActive = config.enabled ?? true;

  // Store the current scale factor for game elements (must be declared early)
  let currentScale = 1;

  // Create container for background sprites
  const container = new Container();
  container.label = 'scrolling-background';

  // Add container to stage at the bottom (z-index 0)
  app.stage.addChildAt(container, 0);

  // Health bars graphics
  let healthBarsGraphics: Graphics | null = null;

  // Create dragon protagonist
  console.log('DEBUG: Creating dragon protagonist...');
  let dragonSprite: Sprite | null = null;
  let dragonAnimator: DragonAnimator | null = null;
  let dragonHealth = 200;
  let dragonMaxHealth = 200;

  // Movement control state
  enum MovementMode {
    FORWARD = 'forward',
    REVERSE = 'reverse', 
    PAUSED = 'paused'
  }
  let currentMovementMode = MovementMode.FORWARD;
  let movementControlButtons: Graphics[] = [];
  let dragonPreviousHealth = 200; // For smooth HP bar animation
  let dragonHealthAnimationStartTime = 0; // When dragon health animation started
  let arcanaManager: ArcanaDropManager;

  // Dragon defeat/recovery system
  let dragonState: DragonState = DragonState.ALIVE;
  let recoveryStartTime = 0;
  const RECOVERY_DURATION_MS = 2500; // 2.5 seconds for smooth animation
  let dragonWasDefeated = false; // Track if defeat animation has been triggered

  // Initialize arcana drop manager
  arcanaManager = createDefaultArcanaDropManager();

  try {
    const { sprite, animator } = await createAnimatedDragonSprite(app.renderer, app.stage);
    dragonSprite = sprite;
    dragonAnimator = animator;

    // Position dragon using background positioning utilities in the sky blue band
    // Use scaled background dimensions for accurate positioning
    const bgWidth = 2048; // Original background width
    const bgHeight = 1024; // Original background height
    const scaledBgWidth = bgWidth * currentScale;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(scaledBgWidth, scaledBgHeight);
    dragonSprite.x = 100 * currentScale; // Left side of screen, scaled
    dragonSprite.y = positioning.getSkyBlueBandY(); // Center of sky blue band

    // Scale dragon to appropriate size (will be updated by scaleGameElements)
    dragonSprite.scale.set(1.5); // Base scale, will be multiplied by currentScale

    // Set proper z-index for dragon sprite
    setZIndex(dragonSprite, Z_LAYERS.PLAYER_DRAGON);

    // Add dragon to stage (above background)
    app.stage.addChild(dragonSprite);

    // Start dragon animation
    await dragonAnimator.start();
    dragonAnimator.setFPS(8); // 8 FPS for smooth flying animation

    console.log('DEBUG: Dragon protagonist created and positioned successfully:', {
      x: dragonSprite.x,
      y: dragonSprite.y,
      scale: dragonSprite.scale.x,
      animating: dragonAnimator.isAnimating(),
    });
  } catch (error) {
    console.error('DEBUG: Failed to create dragon protagonist:', error);
  }

  // Create movement control buttons
  async function createMovementControlButtons() {
    // Position buttons in top-left of underground section (maroon area)
    // Increased button size to maintain quality (assets are 500x500px)
    const buttonSize = 80; // 2x larger for better quality (500px -> 80px = 6.25x scale instead of 12.5x)
    const buttonSpacing = 15;
    // Calculate scaling first
    const bgHeight = 1024;
    const currentScale = app.screen.width / 2048;
    const startX = 20 * currentScale; // Left margin (scaled)
    // Position in underground area - top-left of the maroon section
    // Calculate actionBandBottomY for positioning
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
    const actionBandBottomY = positioning.getActionAreaBottomY();
    const undergroundStartY = actionBandBottomY + (40 * currentScale); // 40px padding from top of underground area (perfect positioning)
    
    // Debug logging for button positioning
    console.log('🎮 Button positioning debug:', {
      actionBandBottomY,
      undergroundStartY,
      startX,
      currentScale,
      screenWidth: app.screen.width,
      screenHeight: app.screen.height,
      calculatedTopPadding: undergroundStartY - actionBandBottomY,
      calculatedLeftPadding: startX
    });
    
    // Clear existing buttons
    movementControlButtons.forEach(button => button.destroy());
    movementControlButtons = [];
    
    // TEMPORARY: Add visual debug markers to show expected button positions (DISABLED)
    // const debugGraphics = new Graphics();
    // debugGraphics.beginFill(0xFF0000, 0.5); // Red semi-transparent
    // debugGraphics.drawRect(startX, undergroundStartY, buttonSize, buttonSize); // Left button position
    // debugGraphics.drawRect(startX + buttonSize + (buttonSpacing * currentScale), undergroundStartY, buttonSize, buttonSize); // Middle button position  
    // debugGraphics.drawRect(startX + (buttonSize + (buttonSpacing * currentScale)) * 2, undergroundStartY, buttonSize, buttonSize); // Right button position
    // debugGraphics.endFill();
    // container.addChild(debugGraphics);
    // setZIndex(debugGraphics, Z_LAYERS.UI_CONTROLS + 1); // Above buttons
    
    // console.log('🎮 DEBUG: Red rectangles show expected button positions');
    
    try {
      // Load button textures - using available assets
      const reverseNeutralTexture = await Assets.load('/ui/buttons/action/reverseChevron_neutral.png');
      const reversePressedTexture = await Assets.load('/ui/buttons/action/reverseChevron_depressed.png');
      const pauseNeutralTexture = await Assets.load('/ui/buttons/action/pause_neutral.png');
      const pausePressedTexture = await Assets.load('/ui/buttons/action/pause_depressed.png');
      const forwardNeutralTexture = await Assets.load('/ui/buttons/action/chevron_neutral.png');
      const forwardPressedTexture = await Assets.load('/ui/buttons/action/chevron_depressed.png');
      
      // Apply pixel perfect scaling to ALL textures (both neutral and depressed)
      [reverseNeutralTexture, reversePressedTexture, pauseNeutralTexture, 
       pausePressedTexture, forwardNeutralTexture, forwardPressedTexture].forEach(texture => {
        texture.source.scaleMode = 'nearest'; // Pixel perfect scaling for all button textures
      });
      
      // Create reverse button using sprite with proper filtering
      const reverseButton = new Sprite(reverseNeutralTexture);
      reverseButton.name = 'reverse-button';
      reverseButton.scale.set(buttonSize / reverseButton.width, buttonSize / reverseButton.height);
      // Enable pixel perfect scaling for pixel art style
      reverseButton.texture.source.scaleMode = 'nearest';
      reverseButton.position.set(startX, undergroundStartY);
      reverseButton.interactive = true;
      reverseButton.cursor = 'pointer';
      reverseButton.userData = {
        neutralTexture: reverseNeutralTexture,
        pressedTexture: reversePressedTexture,
        isPressed: false
      };
      
      // Create pause button using sprite with proper filtering
      const pauseButton = new Sprite(pauseNeutralTexture);
      pauseButton.name = 'pause-button';
      pauseButton.scale.set(buttonSize / pauseButton.width, buttonSize / pauseButton.height);
      // Enable pixel perfect scaling for pixel art style
      pauseButton.texture.source.scaleMode = 'nearest';
      pauseButton.position.set(startX + buttonSize + buttonSpacing, undergroundStartY);
      pauseButton.interactive = true;
      pauseButton.cursor = 'pointer';
      pauseButton.userData = {
        neutralTexture: pauseNeutralTexture,
        pressedTexture: pausePressedTexture,
        isPressed: false
      };
      
      // Create forward button using sprite with proper filtering
      const forwardButton = new Sprite(forwardNeutralTexture);
      forwardButton.name = 'forward-button';
      forwardButton.scale.set(buttonSize / forwardButton.width, buttonSize / forwardButton.height);
      // Enable pixel perfect scaling for pixel art style
      forwardButton.texture.source.scaleMode = 'nearest';
      forwardButton.position.set(startX + (buttonSize + buttonSpacing) * 2, undergroundStartY);
      forwardButton.interactive = true;
      forwardButton.cursor = 'pointer';
      forwardButton.userData = {
        neutralTexture: forwardNeutralTexture,
        pressedTexture: forwardPressedTexture,
        isPressed: false
      };
      
      // Add button event handlers with persistent state management
      reverseButton.on('pointerdown', () => {
        console.log('🎮 Movement: REVERSE');
        currentMovementMode = MovementMode.REVERSE;
        updateButtonStates(); // This will set the correct textures for all buttons
      });
      
      pauseButton.on('pointerdown', () => {
        console.log('🎮 Movement: PAUSED');
        currentMovementMode = currentMovementMode === MovementMode.PAUSED ? MovementMode.FORWARD : MovementMode.PAUSED;
        updateButtonStates(); // This will set the correct textures for all buttons
      });
      
      forwardButton.on('pointerdown', () => {
        console.log('🎮 Movement: FORWARD');
        currentMovementMode = MovementMode.FORWARD;
        updateButtonStates(); // This will set the correct textures for all buttons
      });
      
      // Add buttons to container and store references
      container.addChild(reverseButton);
      container.addChild(pauseButton);
      container.addChild(forwardButton);
      
      movementControlButtons = [reverseButton, pauseButton, forwardButton];
      
      // Set initial button states
      updateButtonStates();
      
      // Set proper z-index
      movementControlButtons.forEach(button => setZIndex(button, Z_LAYERS.UI_CONTROLS));
      
      console.log('🎮 Movement control buttons created with custom assets successfully');
      
    } catch (error) {
      console.warn('⚠️ Failed to load custom button assets, falling back to programmatic buttons:', error);
      // Fallback to programmatic buttons if asset loading fails
      createFallbackMovementButtons(startX, undergroundStartY, buttonSize, buttonSpacing * currentScale);
    }
  }
  
  function createFallbackMovementButtons(startX: number, undergroundStartY: number, buttonSize: number, buttonSpacing: number) {
    // Fallback function for programmatic buttons if assets fail to load
    console.log('🎮 Creating fallback programmatic movement buttons');
    
    // Create reverse button (<)
    const reverseButton = new Graphics();
    reverseButton.beginFill(0x666666, 0.8);
    reverseButton.drawRoundedRect(0, 0, buttonSize, buttonSize, 12); // Increased corner radius for larger buttons
    reverseButton.endFill();
    reverseButton.position.set(startX, undergroundStartY);
    reverseButton.interactive = true;
    reverseButton.cursor = 'pointer';
    const reverseText = new Text('<', { fontSize: 40, fill: 0xffffff, fontWeight: 'bold' }); // Increased font size for larger buttons
    reverseText.anchor.set(0.5);
    reverseText.position.set(buttonSize / 2, buttonSize / 2);
    reverseButton.addChild(reverseText);
    
    // Create pause button (||)
    const pauseButton = new Graphics();
    pauseButton.beginFill(0x666666, 0.8);
    pauseButton.drawRoundedRect(0, 0, buttonSize, buttonSize, 12); // Increased corner radius
    pauseButton.endFill();
    pauseButton.position.set(startX + buttonSize + buttonSpacing, undergroundStartY);
    pauseButton.interactive = true;
    pauseButton.cursor = 'pointer';
    const pauseText = new Text('||', { fontSize: 32, fill: 0xffffff, fontWeight: 'bold' }); // Increased font size
    pauseText.anchor.set(0.5);
    pauseText.position.set(buttonSize / 2, buttonSize / 2);
    pauseButton.addChild(pauseText);
    
    // Create forward button (>)
    const forwardButton = new Graphics();
    forwardButton.beginFill(0x666666, 0.8);
    forwardButton.drawRoundedRect(0, 0, buttonSize, buttonSize, 12); // Increased corner radius
    forwardButton.endFill();
    forwardButton.position.set(startX + (buttonSize + buttonSpacing) * 2, undergroundStartY);
    forwardButton.interactive = true;
    forwardButton.cursor = 'pointer';
    const forwardText = new Text('>', { fontSize: 40, fill: 0xffffff, fontWeight: 'bold' }); // Increased font size
    forwardText.anchor.set(0.5);
    forwardText.position.set(buttonSize / 2, buttonSize / 2);
    forwardButton.addChild(forwardText);
    
    // Add button event handlers
    reverseButton.on('pointerdown', () => {
      console.log('🎮 Movement: REVERSE');
      currentMovementMode = MovementMode.REVERSE;
      updateButtonStates();
    });
    pauseButton.on('pointerdown', () => {
      console.log('🎮 Movement: PAUSED');
      currentMovementMode = currentMovementMode === MovementMode.PAUSED ? MovementMode.FORWARD : MovementMode.PAUSED;
      updateButtonStates();
    });
    forwardButton.on('pointerdown', () => {
      console.log('🎮 Movement: FORWARD');
      currentMovementMode = MovementMode.FORWARD;
      updateButtonStates();
    });
    
    container.addChild(reverseButton);
    container.addChild(pauseButton);
    container.addChild(forwardButton);
    
    movementControlButtons = [reverseButton, pauseButton, forwardButton];
    updateButtonStates();
    movementControlButtons.forEach(button => setZIndex(button, Z_LAYERS.UI_CONTROLS));
  }
  
  function updateButtonStates() {
    movementControlButtons.forEach((button, index) => {
      const isActive = (
        (index === 0 && currentMovementMode === MovementMode.REVERSE) ||
        (index === 1 && currentMovementMode === MovementMode.PAUSED) ||
        (index === 2 && currentMovementMode === MovementMode.FORWARD)
      );
      
      // For sprite-based buttons, set the correct texture based on active state
      if (button instanceof Sprite && button.userData) {
        if (isActive) {
          // Set to depressed texture for active button
          button.texture = button.userData.pressedTexture;
          button.userData.isPressed = true;
        } else {
          // Set to neutral texture for inactive buttons
          button.texture = button.userData.neutralTexture;
          button.userData.isPressed = false;
        }
      }
      
      // If it's a Graphics button (fallback), update appearance
      if (button instanceof Graphics) {
        button.clear();
        button.beginFill(isActive ? 0x4CAF50 : 0x666666, 0.8);
        button.drawRoundedRect(0, 0, 40, 40, 8);
        button.endFill();
        
        // Re-add text after clearing
        const text = button.children[0] as Text;
        if (text) {
          button.addChild(text);
        }
      }
    });
  }
  
  // Create the buttons
  createMovementControlButtons().catch(error => {
    console.error('Failed to create movement control buttons:', error);
  });

  // Combat system variables
  const enemies: Array<{
    sprite: Sprite;
    animator: EnemyAnimator;
    x: number;
    y: number;
    type: EnemyType;
    isMoving: boolean;
    lastFireTime: number;
    fireRate: number;
    health: number;
    maxHealth: number;
  }> = [];
  const projectiles: Array<Projectile> = [];
  const projectileTargets: Map<Projectile, Enemy> = new Map(); // Track which projectile targets which enemy
  let isGameplayActive = false;
  let autoSpawnInterval: number | null = null;
  let projectileUpdateLoop: number | null = null;
  let combatUpdateLoop: number | null = null;

  // Combat constants
  const DRAGON_ATTACK_RANGE = 1100; // Increased by 175% (400 * 2.75 = 1100)
  const ENEMY_ATTACK_RANGE = 300;
  const ENEMY_MOVE_SPEED = 50;
  const DRAGON_BASE_DAMAGE = 5;
  const ENEMY_HEALTH_CONFIG: Record<EnemyType, number> = {
    'mantair-corsair': 13, // 2.6 hits to kill (5 × 2.6 = 13)
    swarm: 8, // 1.6 hits to kill (5 × 1.6 = 8)
  };
  const AUTO_SPAWN_CONFIG = {
    baseInterval: 3000,
    intervalVariation: 1000,
    enemyTypes: ['mantair-corsair', 'swarm'] as EnemyType[],
    maxEnemies: 8,
  };

  // Offscreen spawning area to prevent tearing and enable smooth enemy entry
  const OFFSCREEN_SPAWN_BUFFER = 300; // Extra space to the right for spawning (was 200, now 300)

  // Custom collision detection using individual hitboxes per enemy type
  function checkSpriteCollision(
    projectileSprite: Sprite,
    enemySprite: Sprite,
    enemyType?: EnemyType,
  ): boolean {
    // Get projectile center position for more accurate collision
    const projectileBounds = projectileSprite.getBounds();
    const projectileCenterX = projectileBounds.x + projectileBounds.width / 2;
    const projectileCenterY = projectileBounds.y + projectileBounds.height / 2;

    // Calculate custom hitbox based on enemy type
    let enemyHitbox = enemySprite.getBounds();

    if (enemyType) {
      const spriteWidth = enemySprite.width;
      const spriteHeight = enemySprite.height;

      // Create 50% size square hitbox centered on sprite
      const hitboxSize = Math.min(spriteWidth, spriteHeight) * 0.5; // 50% of smaller dimension
      const offsetX = (spriteWidth - hitboxSize) / 2;
      const offsetY = (spriteHeight - hitboxSize) / 2;

      enemyHitbox = {
        x: enemySprite.x - offsetX,
        y: enemySprite.y - offsetY,
        width: hitboxSize,
        height: hitboxSize,
      };

      // Only log hitbox info occasionally to reduce noise
      if (!checkSpriteCollision.hitboxLogCounter) checkSpriteCollision.hitboxLogCounter = 0;
      checkSpriteCollision.hitboxLogCounter++;
      if (checkSpriteCollision.hitboxLogCounter % 2000 === 0) {
        console.log(
          `🎯 ${enemyType} hitbox: ${hitboxSize.toFixed(1)}x${hitboxSize.toFixed(1)} (50% of ${Math.min(spriteWidth, spriteHeight).toFixed(1)})`,
        );
      }
    }

    // Option 1: Center-point collision (most accurate)
    // Projectile hits when its center point enters the enemy hitbox
    const projectileCenterInHitbox =
      projectileCenterX >= enemyHitbox.x &&
      projectileCenterX <= enemyHitbox.x + enemyHitbox.width &&
      projectileCenterY >= enemyHitbox.y &&
      projectileCenterY <= enemyHitbox.y + enemyHitbox.height;

    // Option 2: Traditional AABB collision (more forgiving)
    // Projectile hits when any part touches the hitbox
    const projectileIntersectsHitbox =
      projectileBounds.x < enemyHitbox.x + enemyHitbox.width &&
      projectileBounds.x + projectileBounds.width > enemyHitbox.x &&
      projectileBounds.y < enemyHitbox.y + enemyHitbox.height &&
      projectileBounds.y + projectileBounds.height > enemyHitbox.y;

    // Choose collision method based on your preference:
    // - Use only projectileCenterInHitbox for precise center-point collision
    // - Use only projectileIntersectsHitbox for traditional collision
    // - Use both for hybrid approach (current setting)
    const isColliding = projectileCenterInHitbox; // Change this line to choose method

    if (isColliding) {
      console.log(
        `🎯 Collision: Center in hitbox: ${projectileCenterInHitbox}, Intersects: ${projectileIntersectsHitbox}`,
      );
    }

    return isColliding;
  }

  // Draw health bars for dragon and enemies
  function drawHealthBars() {
    // Throttle calls to improve performance - only update every 50ms
    const now = performance.now();
    if (drawHealthBars.lastUpdate && now - drawHealthBars.lastUpdate < 50) {
      return;
    }
    drawHealthBars.lastUpdate = now;
    if (!app || (!dragonSprite && enemies.length === 0)) {
      // Hide and remove health bars if no dragon or enemies
      if (healthBarsGraphics && healthBarsGraphics.parent) {
        healthBarsGraphics.parent.removeChild(healthBarsGraphics);
      }
      return;
    }

    // Create graphics object if it doesn't exist
    if (!healthBarsGraphics) {
      healthBarsGraphics = new Graphics();
      // CRITICAL FIX: Set initial properties to prevent zero-dimension rendering artifacts
      healthBarsGraphics.visible = false; // Start invisible until we have content
      healthBarsGraphics.alpha = 0; // Start transparent
      console.log('🔍 DEBUG: Created new healthBarsGraphics object at position:', {
        x: healthBarsGraphics.x,
        y: healthBarsGraphics.y,
        width: healthBarsGraphics.width,
        height: healthBarsGraphics.height,
        visible: healthBarsGraphics.visible,
        alpha: healthBarsGraphics.alpha
      });
      // Don't add to stage until we have content to draw
    }

    // Clear previous drawing
    healthBarsGraphics.clear();
    
    // CRITICAL FIX: Hide the graphics object when cleared to prevent zero-dimension artifacts
    healthBarsGraphics.visible = false;
    healthBarsGraphics.alpha = 0;
    // Reduced logging frequency - DISABLED FOR CLEAN CONSOLE
    // if (!drawHealthBars.logCounter) drawHealthBars.logCounter = 0;
    // drawHealthBars.logCounter++;
    // if (drawHealthBars.logCounter % 200 === 0) {
    //   console.log('🔍 Health bars graphics cleared (reduced logging)');
    // }

    // Check if we need to draw any health bars
    let needsHealthBars = false;

    // Draw health bar for dragon (only when not at full health)
    // Only log dragon health when it changes significantly or is damaged
    // if (dragonHealth < dragonMaxHealth || drawHealthBars.dragonLogCounter % 100 === 0) {
    //   console.log('🔍 Dragon health check:', {
    //     dragonHealth,
    //     dragonMaxHealth,
    //     isFullHealth: dragonHealth >= dragonMaxHealth,
    //     hasDragonSprite: !!dragonSprite,
    //   });
    // }
    if (!drawHealthBars.dragonLogCounter) drawHealthBars.dragonLogCounter = 0;
    drawHealthBars.dragonLogCounter++;
    if (dragonSprite && dragonHealth > 0) {
      needsHealthBars = true;
      // Only log when health actually changes, not every frame
      if (dragonHealth !== drawHealthBars.lastDragonHealth) {
        console.log('🔍 Drawing dragon health bar');
        drawHealthBars.lastDragonHealth = dragonHealth;
      }

      const barWidth = 60 * currentScale; // Scale health bar width
      const barHeight = 8 * currentScale; // Scale health bar height
      const barX = dragonSprite.x - barWidth / 2;
      const barY = dragonSprite.y - 60 * currentScale; // Position above dragon, scaled

      // Calculate health percentage with smooth animation
      const currentHealthPercent = Math.max(0, dragonHealth / dragonMaxHealth);
      const previousHealthPercent = Math.max(0, dragonPreviousHealth / dragonMaxHealth);

      // Animate health bar if there's a difference
      let displayHealthPercent = currentHealthPercent;
      if (dragonPreviousHealth !== dragonHealth && dragonHealthAnimationStartTime > 0) {
        const animationDuration = 500; // 0.5 seconds
        const timeSinceDamage = performance.now() - dragonHealthAnimationStartTime;
        const animationProgress = Math.min(timeSinceDamage / animationDuration, 1);

        // Smooth interpolation from previous to current health
        displayHealthPercent =
          previousHealthPercent +
          (currentHealthPercent - previousHealthPercent) * animationProgress;

        // Update previous health to current after animation completes
        if (animationProgress >= 1) {
          dragonPreviousHealth = dragonHealth;
          dragonHealthAnimationStartTime = 0; // Reset animation
        }
      }

      // Background bar (black)
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .fill({ color: 0x000000, alpha: 0.8 });

      // Health bar (green to yellow to red based on health)
      if (displayHealthPercent > 0) {
        let healthColor = 0x00ff00; // Green
        if (displayHealthPercent < 0.6) {
          healthColor = 0xffff00; // Yellow
        }
        if (displayHealthPercent < 0.3) {
          healthColor = 0xff4500; // Orange-red
        }

        const currentBarWidth = barWidth * displayHealthPercent;
        healthBarsGraphics
          .rect(barX, barY, currentBarWidth, barHeight)
          .fill({ color: healthColor, alpha: 0.9 });
      }

      // Border around health bar
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .stroke({ width: 1, color: 0x000000, alpha: 0.8 });
    }

    // Draw health bars for enemies
    enemies.forEach((enemy) => {
      if (!healthBarsGraphics) return;

      // Allow health bars for defeated enemies so they animate to zero
      // Health bars will be removed when the enemy is actually deleted from the array

      // Check if this enemy needs a health bar (always show if enemy is alive)
      if (enemy.health > 0) {
        needsHealthBars = true;
        // console.log(
        //   '🔍 Drawing enemy health bar for:',
        //   enemy.type,
        //   'health:',
        //   enemy.health,
        //   '/',
        //   enemy.maxHealth,
        // );
      }

      const barWidth = 40 * currentScale; // Scale health bar width
      const barHeight = 6 * currentScale; // Scale health bar height
      const barX = enemy.sprite.x - barWidth / 2;
      const barY = enemy.sprite.y - 40 * currentScale; // Position above enemy, scaled

      // Calculate health percentage with smooth animation
      const currentHealthPercent = Math.max(0, enemy.health / enemy.maxHealth);
      const previousHealthPercent = Math.max(0, enemy.previousHealth / enemy.maxHealth);

      // Animate health bar if there's a difference
      let displayHealthPercent = currentHealthPercent;
      if (enemy.isAnimatingHealth && enemy.healthAnimationStartTime > 0) {
        const animationDuration = 500; // 0.5 seconds
        const timeSinceDamage = performance.now() - enemy.healthAnimationStartTime;
        const animationProgress = Math.min(timeSinceDamage / animationDuration, 1);

        // Smooth interpolation from previous to current health
        displayHealthPercent =
          previousHealthPercent +
          (currentHealthPercent - previousHealthPercent) * animationProgress;

        // Update previous health to current after animation completes
        if (animationProgress >= 1) {
          enemy.previousHealth = enemy.health;
          enemy.isAnimatingHealth = false;
          enemy.healthAnimationStartTime = 0; // Reset animation
        }
      }

      // Background bar (black)
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .fill({ color: 0x000000, alpha: 0.8 });

      // Health bar (red to orange based on health)
      if (displayHealthPercent > 0) {
        let healthColor = 0xff0000; // Red
        if (displayHealthPercent < 0.5) {
          healthColor = 0xff4500; // Orange-red
        }

        const currentBarWidth = barWidth * displayHealthPercent;
        healthBarsGraphics
          .rect(barX, barY, currentBarWidth, barHeight)
          .fill({ color: healthColor, alpha: 0.9 });
      }

      // Border around health bar
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .stroke({ width: 1, color: 0x000000, alpha: 0.8 });
    });

    // Only add to stage and make visible if we actually drew something
    if (needsHealthBars) {
      if (healthBarsGraphics.parent !== app.stage) {
        app.stage.addChild(healthBarsGraphics);
        console.log('🔍 DEBUG: Added healthBarsGraphics to stage:', {
          x: healthBarsGraphics.x,
          y: healthBarsGraphics.y,
          width: healthBarsGraphics.width,
          height: healthBarsGraphics.height,
          visible: healthBarsGraphics.visible,
          alpha: healthBarsGraphics.alpha
        });
      }
      // CRITICAL FIX: Make sure it's visible and opaque when added to stage
      healthBarsGraphics.visible = true;
      healthBarsGraphics.alpha = 1;
    } else {
      // Remove from stage if no health bars are needed
      if (healthBarsGraphics.parent) {
        healthBarsGraphics.parent.removeChild(healthBarsGraphics);
        console.log('🔍 DEBUG: Removed healthBarsGraphics from stage:', {
          x: healthBarsGraphics.x,
          y: healthBarsGraphics.y,
          width: healthBarsGraphics.width,
          height: healthBarsGraphics.height,
          visible: healthBarsGraphics.visible,
          alpha: healthBarsGraphics.alpha
        });
      }
      // CRITICAL FIX: Hide when removed from stage
      healthBarsGraphics.visible = false;
      healthBarsGraphics.alpha = 0;
    }

    // Debug: Log what's on the stage (throttled) - DISABLED FOR CLEAN CONSOLE
    // if (!drawHealthBars.debugCounter) drawHealthBars.debugCounter = 0;
    // drawHealthBars.debugCounter++;
    // if (drawHealthBars.debugCounter % 60 === 0 && app && app.stage) {
    //   // Only log every 60 calls and ensure app.stage exists
    //   console.log(
    //     '🔍 Stage children after health bars:',
    //     app.stage.children.map((child, index) => ({
    //       index,
    //       name: child.name,
    //       type: child.constructor.name,
    //       x: child.x,
    //       y: child.y,
    //       width: child.width,
    //       height: child.height,
    //       visible: child.visible,
    //       alpha: child.alpha,
    //     })),
    //   );
    // }
  }

  // Function to draw arcana counter with icon and matching colors
  async function drawArcanaCounter() {
    // Throttle calls to improve performance - only update every 100ms
    const now = performance.now();
    if (drawArcanaCounter.lastUpdate && now - drawArcanaCounter.lastUpdate < 100) {
      return;
    }
    drawArcanaCounter.lastUpdate = now;

    // Reduced logging frequency - only log every 100 calls
    if (!drawArcanaCounter.logCounter) drawArcanaCounter.logCounter = 0;
    drawArcanaCounter.logCounter++;
    if (drawArcanaCounter.logCounter % 100 === 0) {
      // console.log('🎨 drawArcanaCounter called (reduced logging)');
    }

    // Prevent multiple simultaneous calls to avoid blinking
    if (drawArcanaCounter.isDrawing) {
      // console.log('🎨 drawArcanaCounter already drawing, skipping...');
      return;
    }
    drawArcanaCounter.isDrawing = true;
    if (!app) {
      console.warn('🎨 No app available for Arcana counter');
      drawArcanaCounter.isDrawing = false;
      return;
    }

    // Import required PixiJS classes
    const { Text, Sprite, Texture, Assets } = await import('pixi.js');

    // Remove existing arcana counters and UI panel if they exist
    const existingCounters = app.stage.children.filter(
      (child) =>
        child.name?.startsWith('arcana-counter') ||
        child.name?.startsWith('arcana-icon') ||
        child.name?.startsWith('currency-ui-panel'),
    );
    existingCounters.forEach((counter) => app.stage.removeChild(counter));

    // Position for arcana counter
    const startX = 20 * currentScale;
    const startY = 20 * currentScale; // Top of the space area
    const iconSize = 24 * currentScale; // Size of the icon
    const textSpacing = 8 * currentScale; // Space between icon and text

    // We'll create the background panel AFTER we know the actual content dimensions

    // Create multiple Arcana counters with different gold colors for comparison
    // Keep only positions 1, 3, 4, 8, 9, 10 (0-indexed: 0, 2, 3, 7, 8, 9)
    const allGoldColors = [
      0xc69842, // 1: Current base gold (leftmost)
      0xd4a850, // 2: Brighter gold 1
      0xe2b85e, // 3: Brighter gold 2
      0xf0c86c, // 4: Brighter gold 3
      0xf8d87a, // 5: Brighter gold 4
      0xffe888, // 6: Brighter gold 5
      0xfff296, // 7: Brightest gold (almost yellow)
      0xffd700, // 8: Pure gold (more yellow)
      0xffc107, // 9: Amber gold (intense yellow-gold)
      0xffb300, // 10: Dark amber (deeper yellow-gold)
      0xffa500, // 11: Orange gold (warm yellow-gold)
    ];

    // Keep only the right Arcana option (position 4)
    const goldColorOptions = [
      allGoldColors[3], // 4: Brighter gold 3 (rightmost option)
    ];

    // Since we only have one Arcana counter now, no need for spacing calculation
    let currentX = startX;
    let maxPanelWidth = 0;

    // Create the single Arcana counter
    const color = goldColorOptions[0]; // We only have one option now
    
    // First, create the text to measure its dimensions
    const arcanaText = new Text({
      text: `Arcana: ${arcanaManager.getCurrentBalance().toFixed(2)}`,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: 18 * currentScale,
        fill: color,
        resolution: 2, // Higher resolution for crisp text
        align: 'left',
        fontWeight: 'normal',
      },
    });

    // Calculate the total content dimensions
    const totalContentWidth = iconSize + textSpacing + arcanaText.width;
    const totalContentHeight = Math.max(iconSize, arcanaText.height);
    const panelPadding = 8 * currentScale;
    const panelCornerRadius = 6 * currentScale;
    
    // Create the background panel with proper dimensions
    const { Graphics } = await import('pixi.js');
    const currencyPanel = new Graphics();
    // console.log('🔍 DEBUG: Created currencyPanel Graphics object:', {
    //   x: currencyPanel.x,
    //   y: currencyPanel.y,
    //   width: currencyPanel.width,
    //   height: currencyPanel.height,
    //   visible: currencyPanel.visible,
    //   alpha: currencyPanel.alpha
    // });
    
    const panelWidth = totalContentWidth + (2 * panelPadding);
    const panelHeight = totalContentHeight + (2 * panelPadding);
    
    // Draw the panel background with low opacity
    currencyPanel
      .roundRect(0, 0, panelWidth, panelHeight, panelCornerRadius)
      .fill({ color: 0x000000, alpha: 0.5 }); // Slightly more visible for testing
    
    // Position the panel centered around the content
    currencyPanel.x = startX - panelPadding;
    currencyPanel.y = startY - panelPadding;
    currencyPanel.name = 'currency-ui-panel';
    
    // IMPORTANT: Add the panel to stage FIRST (lowest z-index)
    app.stage.addChild(currencyPanel);
    // console.log('🔍 DEBUG: Added currencyPanel to stage at:', {
    //   x: currencyPanel.x,
    //   y: currencyPanel.y,
    //   width: panelWidth,
    //   height: panelHeight
    // });
    
    // Create Arcana icon
    try {
      let iconTexture;
      try {
        iconTexture = await Assets.load('/ui/icons/arcana_icon.png');
      } catch (assetsError) {
        console.warn('🎨 Assets.load failed, trying Texture.from:', assetsError);
        iconTexture = Texture.from('/ui/icons/arcana_icon.png');
      }

      const arcanaIcon = new Sprite(iconTexture);
      arcanaIcon.name = `arcana-icon-0`;
      arcanaIcon.x = currentX;
      arcanaIcon.y = startY;
      arcanaIcon.width = iconSize;
      arcanaIcon.height = iconSize;
      arcanaIcon.anchor.set(0, 0);
      
      // Add icon to stage AFTER the panel (higher z-index)
      app.stage.addChild(arcanaIcon);
    } catch (error) {
      console.error('🚨 Failed to load arcana icon:', error);
    }

    // Position and add the text AFTER the panel (highest z-index)
    arcanaText.name = `arcana-counter-text-0`;
    arcanaText.x = currentX + iconSize + textSpacing;
    arcanaText.y = startY;
    arcanaText.anchor.set(0, 0);
    
    // Add text to stage LAST (highest z-index)
    app.stage.addChild(arcanaText);
    
    maxPanelWidth = totalContentWidth;

    // Debug: Log what's on the stage after arcana counter (throttled) - DISABLED FOR CLEAN CONSOLE
    // if (!drawArcanaCounter.debugCounter) drawArcanaCounter.debugCounter = 0;
    // drawArcanaCounter.debugCounter++;
    // if (drawArcanaCounter.debugCounter % 10 === 0 && app && app.stage) {
    //   // Only log every 10 calls and ensure app.stage exists
    //   console.log(
    //     '🔍 Stage children after arcana counter:',
    //     app.stage.children.map((child, index) => ({
    //       index,
    //       name: child.name,
    //       type: child.constructor.name,
    //       x: child.x,
    //       y: child.y,
    //       width: child.width,
    //       height: child.height,
    //       visible: child.visible,
    //       alpha: child.alpha,
    //       // Add more details for Graphics objects
    //       ...(child.constructor.name === 'Graphics' && {
    //         tint: child.tint,
    //         blendMode: child.blendMode,
    //         isMask: child.isMask,
    //       }),
    //     })),
    //   );
    // }

    // Clear the drawing flag
    drawArcanaCounter.isDrawing = false;
  }

  // Load the background texture using Assets API for better reliability
  console.log('Loading background texture from: /backgrounds/land1_steppe/static/steppe_background_grassless.png');

  let texture: Texture;
  try {
    // Try using Assets API first
    console.log('DEBUG: Attempting Assets.load...');
    texture = await Assets.load('/backgrounds/land1_steppe/static/steppe_background_grassless.png');
    console.log('DEBUG: Assets.load successful, texture:', {
      texture: !!texture,
      source: !!texture?.source,
      valid: texture?.source?.valid,
      width: texture?.width,
      height: texture?.height,
    });
  } catch (error) {
    console.warn('Assets.load failed, trying Texture.from:', error);
    // Fallback to Texture.from
    console.log('DEBUG: Attempting Texture.from...');
    texture = await Texture.from('/backgrounds/land1_steppe/static/steppe_background_grassless.png');
    console.log('DEBUG: Texture.from result:', {
      texture: !!texture,
      source: !!texture?.source,
      valid: texture?.source?.valid,
      width: texture?.width,
      height: texture?.height,
    });
  }

  // Debug texture source properties
  console.log('DEBUG: Texture source analysis:', {
    hasTexture: !!texture,
    hasSource: !!texture?.source,
    sourceValid: texture?.source?.valid,
    sourceProperties: texture?.source ? Object.keys(texture.source) : 'no source',
    textureWidth: texture?.width,
    textureHeight: texture?.height,
    textureProperties: texture ? Object.keys(texture) : 'no texture',
  });

  // In PixiJS v8, Assets.load() returns a ready texture - no need to wait for source.valid
  console.log(
    'DEBUG: Skipping texture ready state wait - Assets.load() should return ready texture',
  );

  if (!texture || !texture.width || !texture.height) {
    console.error('DEBUG: Texture validation failed:', {
      hasTexture: !!texture,
      hasWidth: !!texture?.width,
      hasHeight: !!texture?.height,
      texture: texture,
    });
    throw new Error('Background texture failed to load');
  }

  console.log('DEBUG: Background texture loaded successfully:', {
    width: texture.width,
    height: texture.height,
    source: texture.source?.resource?.url,
    textureValid: !!texture,
    sourceValid: texture.source?.valid,
  });

  // Create two sprites for seamless tiling with anti-tearing optimizations
  // The image is 2160x1080, perfect for tiling horizontally
  const sprite1 = new Sprite(texture);
  const sprite2 = new Sprite(texture);

  // Enable pixel-perfect rendering to prevent tearing
  sprite1.roundPixels = true;
  sprite2.roundPixels = true;

  // Position sprites side by side for seamless tiling
  sprite1.position.set(0, 0);
  sprite2.position.set(0, 0); // Will be positioned after scaling

  // Scale sprites to cover the entire screen while maintaining aspect ratio
  const scaleToFit = () => {
    const screenWidth = app.screen.width;
    const screenHeight = app.screen.height;
    const bgWidth = texture.width;
    const bgHeight = texture.height;

    // Calculate scale factors for both dimensions
    const scaleX = screenWidth / bgWidth;
    const scaleY = screenHeight / bgHeight;

    // Use the smaller scale to fit within the screen (like CLICKPOCALYPSE 2)
    // This allows empty space instead of cutting off content
    const scale = Math.min(scaleX, scaleY);

    console.log(
      `🖥️ Responsive scaling: Screen(${screenWidth}x${screenHeight}), BG(${bgWidth}x${bgHeight}), Scale: ${scale.toFixed(2)}`,
    );

    // Store the scale factor for game elements
    currentScale = scale;

    sprite1.scale.set(scale);
    sprite2.scale.set(scale);

    // Create seamless loop with proper sprite positioning and anti-tearing
    const spriteWidth = Math.floor(sprite1.width); // Ensure integer width
    sprite2.position.x = spriteWidth; // Position second sprite right after first with pixel-perfect alignment

    // Center the background within the screen (it will now be smaller than or equal to screen)
    const scaledBgWidth = sprite1.width;
    // const scaledBgHeight = sprite1.height; // Unused in this context

    // Align to left edge (background starts at left edge of screen)
    container.position.x = 0;

    // Align to top - put all extra space at the bottom
    container.position.y = 0;

    // Store the total background width for offscreen spawning calculations
    window.backgroundWidth = sprite1.width;

    // Scale all game elements to match the background
    scaleGameElements();
  };

  // Scale all game elements to match the background scaling
  function scaleGameElements() {
    // Calculate actual scaled background dimensions
    const bgWidth = 2048; // Original background width
    const bgHeight = 1024; // Original background height
    const scaledBgWidth = bgWidth * currentScale;
    const scaledBgHeight = bgHeight * currentScale;

    // Scale dragon
    if (dragonSprite) {
      dragonSprite.scale.set(1.5 * currentScale); // Base scale * background scale
      // Reposition dragon to match scaled coordinate system using actual background dimensions
      const positioning = new BackgroundPositioning(scaledBgWidth, scaledBgHeight);
      dragonSprite.x = 100 * currentScale; // Scale the fixed position
      dragonSprite.y = positioning.getSkyBlueBandY();
    }

    // Scale all enemies
    enemies.forEach((enemy) => {
      enemy.sprite.scale.set(currentScale); // Scale enemy sprites
    });

    // Scale all projectiles
    projectiles.forEach((projectile) => {
      const projectileSprite = projectile.getSprite();
      projectileSprite.scale.set(currentScale); // Scale projectile sprites
    });

    // Note: Grassland and mountain layers are created later with correct scale
    // They don't need scaling here since they're initialized with currentScale

    // Redraw health bars to match new scale
    drawHealthBars();
    drawArcanaCounter();
  }

  // Function to scale grassland and mountain layers (called when they exist)
  function scaleParallaxLayers() {
    // Scale grassland layer
    if (grasslandSprite1 && grasslandSprite2) {
      const grasslandScale = currentScale;
      grasslandSprite1.scale.set(grasslandScale);
      grasslandSprite2.scale.set(grasslandScale);
      
      // Reposition grassland sprites with new scale
      const bgHeight = 1024;
      const scaledBgHeight = bgHeight * currentScale;
      const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
      const actionBandBottomY = positioning.getActionAreaBottomY();
      const grasslandYOffset = actionBandBottomY + (44 * currentScale);
      
      grasslandSprite1.position.set(0, grasslandYOffset);
      grasslandSprite2.position.set(grasslandSprite1.width, grasslandYOffset);
    }

  // Scale clouds layer (sky behind mountain)
  if (cloudsSprite) {
    const cloudsScale = currentScale * 1.0; // Full scale for steppe_clouds-1.png
    cloudsSprite.scale.set(cloudsScale);
    
    // Reposition clouds with new scale (positioned at action band bottom)
    const bgHeight = 1024;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
    const actionBandBottomY = positioning.getActionAreaBottomY();
    
    cloudsSprite.position.set(cloudsSprite.position.x, actionBandBottomY - (23 * currentScale)); // Maintain 23px offset for proper sky/space alignment
  }

  // Scale mountain layer
  if (mountainSprite) {
    const mountainScale = currentScale * 1.0; // Full scale for lonelyMountain-clouds-2.png
    mountainSprite.scale.set(mountainScale);
    
    // Reposition mountain with new scale (maintaining 32-pixel offset)
    const bgHeight = 1024;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
    const actionBandBottomY = positioning.getActionAreaBottomY();
    
    mountainSprite.position.set(mountainSprite.position.x, actionBandBottomY + (32 * currentScale));
  }

  // Scale hills layer
  if (hillsSprite1 && hillsSprite2) {
    const hillsScale = currentScale;
    hillsSprite1.scale.set(hillsScale);
    hillsSprite2.scale.set(hillsScale);
    
    // Reposition hills sprites with new scale
    const bgHeight = 1024;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
    const actionBandBottomY = positioning.getActionAreaBottomY();
    const hillsYOffset = actionBandBottomY + (11 * currentScale); // 21 pixels higher than mountain for perfect balance
    
    hillsSprite1.position.set(0, hillsYOffset);
    hillsSprite2.position.set(hillsSprite1.width, hillsYOffset);
  }
  }

  scaleToFit();

  // Set proper z-index for background sprites
  setZIndex(sprite1, Z_LAYERS.BACKGROUND_STATIC);
  setZIndex(sprite2, Z_LAYERS.BACKGROUND_STATIC);

  // Add sprites to container
  container.addChild(sprite1);
  container.addChild(sprite2);

  // Load and create parallax clouds layer (sky behind mountain)
  let cloudsSprite: Sprite | null = null;
  let cloudsOffset = 0;
  const CLOUDS_PARALLAX_SPEED = 0.125; // 12.5% of background speed (5% faster than mountain)

  // Load and create parallax mountain layer
  let mountainSprite: Sprite | null = null;
  const MOUNTAIN_PARALLAX_SPEED = 0.075; // 7.5% of background speed for distant effect (much slower for depth)

  // Load and create parallax hills layer
  let hillsSprite1: Sprite | null = null;
  let hillsSprite2: Sprite | null = null;
  let hillsOffset = 0;
  const HILLS_PARALLAX_SPEED = 0.06; // 6% of background speed (80% of mountain speed for mid-ground depth)

  console.log('🔍 DEBUG: About to start parallax layer loading...');
  // Load clouds texture first (sky layer)
  console.log('☁️ STARTING CLOUDS LOADING PROCESS');
  try {
    // Calculate actionBandBottomY for clouds positioning
    const bgHeight = 1024;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
    const actionBandBottomY = positioning.getActionAreaBottomY();
    console.log('☁️ DEBUG: Calculated actionBandBottomY for clouds:', actionBandBottomY);
    
    console.log('☁️ Loading clouds texture from: /backgrounds/land1_steppe/parallax/steppe_clouds-1.png');
    let cloudsTexture: Texture;
    try {
      // Try using Assets API first
      console.log('☁️ DEBUG: Attempting Assets.load...');
      cloudsTexture = await Assets.load('/backgrounds/land1_steppe/parallax/steppe_clouds-1.png');
      console.log('☁️ DEBUG: Assets.load successful, texture:', {
        texture: !!cloudsTexture,
        source: !!cloudsTexture?.source,
        valid: cloudsTexture?.source?.valid,
        width: cloudsTexture?.width,
        height: cloudsTexture?.height,
      });
    } catch (error) {
      console.warn('☁️ Assets.load failed, trying Texture.from:', error);
      // Fallback to Texture.from
      console.log('☁️ DEBUG: Attempting Texture.from...');
      cloudsTexture = await Texture.from('/backgrounds/land1_steppe/parallax/steppe_clouds-1.png');
      console.log('☁️ DEBUG: Texture.from result:', {
        texture: !!cloudsTexture,
        source: !!cloudsTexture?.source,
        valid: cloudsTexture?.source?.valid,
        width: cloudsTexture?.width,
        height: cloudsTexture?.height,
      });
    }
    
    // Create clouds sprite
    cloudsSprite = new Sprite(cloudsTexture);
    const cloudsScale = currentScale * 1.0; // Full scale for steppe_clouds-1.png
    cloudsSprite.scale.set(cloudsScale, cloudsScale);
    cloudsSprite.anchor.set(0, 1); // Anchor at bottom
    cloudsSprite.position.set(0, actionBandBottomY - (23 * currentScale)); // Position at action band bottom, raised by 23px to align top cloud with sky/space line
    container.addChild(cloudsSprite);
    setZIndex(cloudsSprite, Z_LAYERS.BACKGROUND_CLOUDS); // Sky layer behind mountain but in front of background
    console.log('☁️ Clouds layer created successfully:', {
      position: cloudsSprite.position,
      scale: cloudsSprite.scale,
      zIndex: Z_LAYERS.BACKGROUND_CLOUDS,
      actionBandBottomY
    });
  } catch (error) {
    console.error('☁️ Failed to load clouds texture, continuing without clouds layer:', error);
    console.error('☁️ Error details:', {
      message: error.message,
      stack: error.stack,
      filename: error.filename,
      lineNumber: error.lineNumber
    });
  }

  // Load mountain texture
  console.log('🏔️ STARTING MOUNTAIN LOADING PROCESS');
  try {
    console.log('🏔️ Loading mountain texture from: /backgrounds/land1_steppe/parallax/lonelyMountain-clouds-2.png');
    let mountainTexture: Texture;
    try {
      // Try using Assets API first
      console.log('🏔️ DEBUG: Attempting Assets.load...');
      mountainTexture = await Assets.load('/backgrounds/land1_steppe/parallax/lonelyMountain-clouds-2.png');
      console.log('🏔️ DEBUG: Assets.load successful, texture:', {
        texture: !!mountainTexture,
        source: !!mountainTexture?.source,
        valid: mountainTexture?.source?.valid,
        width: mountainTexture?.width,
        height: mountainTexture?.height,
      });
    } catch (error) {
      console.warn('🏔️ Assets.load failed, trying Texture.from:', error);
      // Fallback to Texture.from
      console.log('🏔️ DEBUG: Attempting Texture.from...');
      mountainTexture = await Texture.from('/backgrounds/land1_steppe/parallax/lonelyMountain-clouds-2.png');
      console.log('🏔️ DEBUG: Texture.from result:', {
        texture: !!mountainTexture,
        source: !!mountainTexture?.source,
        valid: mountainTexture?.source?.valid,
        width: mountainTexture?.width,
        height: mountainTexture?.height,
      });
    }

    // Create single mountain sprite
    mountainSprite = new Sprite(mountainTexture);

    // Enable pixel-perfect rendering
    mountainSprite.roundPixels = true;

    // Position mountain at the orange line (action band bottom)
    const bgHeight = 1024;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
    const actionBandBottomY = positioning.getActionAreaBottomY();

    // Scale mountain proportionally (larger since it's lonelyMountain-3)
    const mountainScale = currentScale * 1.0; // Full scale for the larger mountain
    mountainSprite.scale.set(mountainScale);

    // Anchor at bottom-left (so it sits on the orange line)
    mountainSprite.anchor.set(0, 1);

    // Start mountain offscreen to the right (where enemies spawn)
    const bgWidth = 2048;
    const scaledBgWidth = bgWidth * currentScale;
    const offscreenBuffer = 300; // Extra space to the right
    const startX = scaledBgWidth + offscreenBuffer;

    // Position mountain so its base is fully covered by the grassland layer, moved down by 32 pixels total
    // The grassland layer will cover the part that overlaps with the grass
      mountainSprite.position.set(startX, actionBandBottomY + (31 * currentScale));

    // Set proper z-index for parallax background layer
    setZIndex(mountainSprite, Z_LAYERS.BACKGROUND_PARALLAX);

    // Add to container (above background, below grass layer and dragon/enemies)
    // This ensures the mountain will be behind the grass layer when you add it
    container.addChild(mountainSprite);

    console.log('🏔️ Mountain parallax layer created successfully:', {
      position: mountainSprite.position,
      scale: mountainSprite.scale,
      zIndex: Z_LAYERS.BACKGROUND_PARALLAX,
      actionBandBottomY,
      startX
    });
  } catch (error) {
    console.error('🏔️ Failed to load mountain texture, continuing without parallax layer:', error);
    console.error('🏔️ Error details:', {
      message: error.message,
      stack: error.stack,
      filename: error.filename,
      lineNumber: error.lineNumber
    });
  }

  // Load and create parallax hills layer (mid-ground depth)
  try {
    console.log('🏔️ Loading hills texture from: /backgrounds/land1_steppe/parallax/steppe_hills-1.png');
    const hillsTexture = await Assets.load('/backgrounds/land1_steppe/parallax/steppe_hills-1.png');

    // Create two hills sprites for seamless looping
    hillsSprite1 = new Sprite(hillsTexture);
    hillsSprite2 = new Sprite(hillsTexture);

    // Enable pixel-perfect rendering
    hillsSprite1.roundPixels = true;
    hillsSprite2.roundPixels = true;

    // Position hills at the edge of the action band and underground
    const bgHeight = 1024;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
    const actionBandBottomY = positioning.getActionAreaBottomY();

    // Scale hills to match background scale
    const hillsScale = currentScale;
    hillsSprite1.scale.set(hillsScale);
    hillsSprite2.scale.set(hillsScale);

    // Anchor at bottom
    hillsSprite1.anchor.set(0, 1);
    hillsSprite2.anchor.set(0, 1);

    // Position at the action band bottom (precisely fine-tuned positioning)
    const hillsYOffset = actionBandBottomY + (11 * currentScale); // 21 pixels higher than mountain for perfect balance
    hillsSprite1.position.set(0, hillsYOffset);
    hillsSprite2.position.set(hillsSprite1.width, hillsYOffset);

    // Set proper z-index for mid-ground parallax layer (between mountain and grassland)
    setZIndex(hillsSprite1, Z_LAYERS.ENVIRONMENT_DECORATIVE);
    setZIndex(hillsSprite2, Z_LAYERS.ENVIRONMENT_DECORATIVE);

    // Add to container (above mountain, below grassland layer and dragon/enemies)
    container.addChild(hillsSprite1);
    container.addChild(hillsSprite2);

    console.log('🏔️ Hills parallax layer created successfully');
  } catch (error) {
    console.warn('🏔️ Failed to load hills texture, continuing without hills layer:', error);
  }

  // Load and create grassland layer (foreground)
  let grasslandSprite1: Sprite | null = null;
  let grasslandSprite2: Sprite | null = null;
  let grasslandOffset = 0;
  const GRASSLAND_PARALLAX_SPEED = 1.0; // Same speed as background for foreground effect

  try {
    console.log('🌿 Loading grassland texture from: /backgrounds/land1_steppe/foreground/grasslandLayer_steppe.png');
    const grasslandTexture = await Assets.load('/backgrounds/land1_steppe/foreground/grasslandLayer_steppe.png');

    // Create two grassland sprites for seamless looping
    grasslandSprite1 = new Sprite(grasslandTexture);
    grasslandSprite2 = new Sprite(grasslandTexture);

    // Enable pixel-perfect rendering
    grasslandSprite1.roundPixels = true;
    grasslandSprite2.roundPixels = true;

    // Position grassland at the orange line (action band bottom)
    const bgHeight = 1024;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
    const actionBandBottomY = positioning.getActionAreaBottomY();

    // Scale grassland to match background scale
    const grasslandScale = currentScale;
    grasslandSprite1.scale.set(grasslandScale);
    grasslandSprite2.scale.set(grasslandScale);

    // Anchor at bottom
    grasslandSprite1.anchor.set(0, 1);
    grasslandSprite2.anchor.set(0, 1);

    // Position at the orange line (action band bottom) - adjust Y to align with background grass
    // Perfect alignment: grassland layer should overlap perfectly with background grass
    const grasslandYOffset = actionBandBottomY + (44 * currentScale); // Move down 44px from the orange line (400px) to around 444px for perfect overlap
    grasslandSprite1.position.set(0, grasslandYOffset);
    grasslandSprite2.position.set(grasslandSprite1.width, grasslandYOffset);
    
    // Debug logging for positioning (disabled for cleaner console)
    // console.log('🌿 Grassland positioning debug:', {
    //   actionBandBottomY,
    //   currentScale,
    //   grasslandYOffset,
    //   grasslandSprite1Position: { x: grasslandSprite1.position.x, y: grasslandSprite1.position.y },
    //   grasslandSprite2Position: { x: grasslandSprite2.position.x, y: grasslandSprite2.position.y },
    //   grasslandTextureSize: { width: grasslandTexture.width, height: grasslandTexture.height },
    //   grasslandSpriteSize: { width: grasslandSprite1.width, height: grasslandSprite1.height }
    // });

    // Set proper z-index for foreground grass layer
    setZIndex(grasslandSprite1, Z_LAYERS.FOREGROUND_GRASS);
    setZIndex(grasslandSprite2, Z_LAYERS.FOREGROUND_GRASS);

    // Add to container (above mountain, below dragon/enemies)
    container.addChild(grasslandSprite1);
    container.addChild(grasslandSprite2);

    // Scale the parallax layers now that they exist
    scaleParallaxLayers();

    console.log('🌿 Grassland layer created successfully');
  } catch (error) {
    console.warn('🌿 Failed to load grassland texture, continuing without foreground layer:', error);
  }

  // Track position for infinite scrolling
  let offset = 0;

  // Create measurement overlay for debugging positioning
  let measurementOverlay: Graphics | null = null;
  
  // Add measurement overlay
  measurementOverlay = new Graphics();
  measurementOverlay.name = 'measurement-overlay';
  
  const screenWidth = app.screen.width;
  const screenHeight = app.screen.height;
  
  // Get positioning for the bands
  const bgHeight = 1024;
  const scaledBgHeight = bgHeight * currentScale;
  const positioning = new BackgroundPositioning(2048 * currentScale, scaledBgHeight);
  const actionAreaTopY = positioning.getActionAreaTopY();
  const actionAreaBottomY = positioning.getActionAreaBottomY();
  
  // Draw horizontal grid lines every 25px
  const gridSpacing = 25;
  
  // Horizontal grid lines every 25px (solid black 1px)
  for (let y = 0; y <= screenHeight; y += gridSpacing) {
    measurementOverlay.lineStyle(1, 0x000000, 1.0); // Solid black lines, 1px thick
    measurementOverlay.moveTo(0, y);
    measurementOverlay.lineTo(screenWidth, y);
  }
  
  // Add coordinate labels every 50px (longer black lines and text labels)
  for (let y = 0; y <= screenHeight; y += 50) {
    // Longer line for 50px markers
    measurementOverlay.lineStyle(2, 0x000000, 1.0); // Solid black labels, 2px thick for visibility
    measurementOverlay.moveTo(0, y);
    measurementOverlay.lineTo(30, y); // Longer line for 50px markers
    
    // Add text label
    const labelText = new Text({
      text: `${y}px`,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0x000000, // Black text
        align: 'left'
      }
    });
    labelText.position.set(35, y - 6); // Position text to the right of the line marker
    measurementOverlay.addChild(labelText);
  }
  
  // Add corner marker
  measurementOverlay.lineStyle(2, 0xFF0000, 1.0); // Red corner marker
  measurementOverlay.moveTo(0, 0);
  measurementOverlay.lineTo(20, 0);
  measurementOverlay.moveTo(0, 0);
  measurementOverlay.lineTo(0, 20);
  
  // Add color-coded bands based on Draconia Tome specifications
  // Zone 1: Space Area (0px - 100px / 0% - 9.26%) - Currency display
  const spaceAreaTop = 0;
  const spaceAreaBottom = screenHeight * 0.0926; // 9.26% of screen height
  measurementOverlay.beginFill(0x0000FF, 0.15); // Blue with 15% opacity
  measurementOverlay.drawRect(0, spaceAreaTop, screenWidth, spaceAreaBottom - spaceAreaTop);
  measurementOverlay.endFill();
  
  // Zone 2: Action Area (100px - 525px / 9.26% - 48.61%) - Gameplay action
  const actionAreaTop = screenHeight * 0.0926; // 9.26% of screen height
  const actionAreaBottom = screenHeight * 0.4861; // 48.61% of screen height
  measurementOverlay.beginFill(0xFF8800, 0.15); // Orange with 15% opacity
  measurementOverlay.drawRect(0, actionAreaTop, screenWidth, actionAreaBottom - actionAreaTop);
  measurementOverlay.endFill();
  
  // Zone 3: Player UI Area (525px - 1080px / 48.61% - 100%) - Underground/UI
  const playerUIAreaTop = screenHeight * 0.4861; // 48.61% of screen height
  const playerUIAreaBottom = screenHeight; // 100% of screen height
  measurementOverlay.beginFill(0xFF0000, 0.15); // Red with 15% opacity
  measurementOverlay.drawRect(0, playerUIAreaTop, screenWidth, playerUIAreaBottom - playerUIAreaTop);
  measurementOverlay.endFill();
  
    // Set proper z-index for measurement overlay (debug layer)
    setZIndex(measurementOverlay, Z_LAYERS.DEBUG_MEASUREMENT);

    // Add to container (on top of everything for debugging)
    container.addChild(measurementOverlay);

    // Turn off the measurement overlay by default (keep it for future use)
    measurementOverlay.visible = false;

    // Debug logging for overlay (disabled for cleaner console)
    // console.log('📏 Measurement overlay created and added (turned off by default):', {
    //   overlayName: measurementOverlay.name,
    //   overlayPosition: { x: measurementOverlay.x, y: measurementOverlay.y },
    //   overlayVisible: measurementOverlay.visible,
    //   overlayAlpha: measurementOverlay.alpha,
    //   screenWidth,
    //   screenHeight,
    //   zones: {
    //     spaceArea: { top: spaceAreaTop, bottom: spaceAreaBottom, height: spaceAreaBottom - spaceAreaTop },
    //     actionArea: { top: actionAreaTop, bottom: actionAreaBottom, height: actionAreaBottom - actionAreaTop },
    //     playerUIArea: { top: playerUIAreaTop, bottom: playerUIAreaBottom, height: playerUIAreaBottom - playerUIAreaTop }
    //   },
    //   containerChildrenCount: container.children.length
    // });

  // Scrolling animation with advanced anti-tearing logic
  const onTick = (ticker: { deltaTime: number; deltaMS: number }) => {
    if (!isActive) return;

    // Calculate scroll amount based on time elapsed and movement mode
    let scrollAmount = 0;
    
    if (currentMovementMode === MovementMode.PAUSED) {
      // No movement when paused
      scrollAmount = 0;
    } else if (currentMovementMode === MovementMode.REVERSE) {
      // Negative scroll amount for reverse movement (background moves left to right)
      scrollAmount = -((currentSpeed / 1000) * ticker.deltaMS);
    } else {
      // Normal forward movement (background moves right to left)
      scrollAmount = (currentSpeed / 1000) * ticker.deltaMS;
    }

    // Background is now static - no movement
    // offset -= scrollAmount;

    // Get the actual scaled sprite width (this is critical for seamless looping)
    const spriteWidth = Math.floor(sprite1.width); // Force integer width

    // Ultra-aggressive anti-tearing loop with larger buffer zone
    // Use a 5-pixel buffer to completely eliminate edge-case tearing
    const resetThreshold = -spriteWidth + 5;

    if (offset <= resetThreshold) {
      // console.log(
      //   `🔄 RESET TRIGGERED: offset: ${offset.toFixed(1)}, threshold: ${resetThreshold}, spriteWidth: ${spriteWidth}`,
      // );

      // Reset offset to create seamless loop
      // Use modulo to handle any accumulated floating-point errors
      const oldOffset = offset;
      offset = offset % spriteWidth;

      // Ensure offset is always within bounds and is an integer
      if (offset < -spriteWidth) {
        offset = offset + spriteWidth;
      }

      // Round to nearest integer to prevent sub-pixel positioning
      offset = Math.round(offset);

      // console.log(`🔄 RESET COMPLETE: old: ${oldOffset.toFixed(1)} -> new: ${offset.toFixed(1)}`);

      // Final safety check - if somehow still out of bounds, reset to 0
      if (offset < -spriteWidth || offset > 0) {
        console.warn(`🚨 RESET FAILED: offset: ${offset} out of bounds, forcing to 0`);
        offset = 0;
      }
    }

    // Background sprites are now static - no movement
    // const sprite1X = Math.round(offset);
    // const sprite2X = Math.round(offset + spriteWidth);

    // sprite1.position.x = sprite1X;
    // sprite2.position.x = sprite2X;

    // Update clouds parallax (12.5% of background speed - 5% faster than mountain)
    if (cloudsSprite) {
      const oldCloudsX = cloudsSprite.position.x;
      
      // Move clouds slightly faster than mountain for sky depth effect
      cloudsSprite.position.x -= scrollAmount * CLOUDS_PARALLAX_SPEED;
      
      // Reset clouds position for seamless looping in both directions
      const screenWidth = app.screen.width;
      const cloudsWidth = cloudsSprite.width;
      
      // Forward movement: reset when completely off-screen to the left
      if (scrollAmount > 0 && cloudsSprite.position.x + cloudsWidth < 0) {
        cloudsSprite.position.x = screenWidth; // Reset to right side for continuous loop
      }
      // Reverse movement: reset when completely off-screen to the right
      else if (scrollAmount < 0 && cloudsSprite.position.x > screenWidth) {
        cloudsSprite.position.x = -cloudsWidth; // Reset to left side for continuous loop
      }
    }

    // Update mountain parallax (7.5% of background speed for distant effect)
    if (mountainSprite) {
      const oldMountainX = mountainSprite.position.x;
      
      // Move mountain slowly from right to left across the screen
      mountainSprite.position.x -= scrollAmount * MOUNTAIN_PARALLAX_SPEED;
      
      // Debug mountain movement every 100px
      if (Math.floor(oldMountainX / 100) !== Math.floor(mountainSprite.position.x / 100)) {
        console.log('🏔️ Mountain movement:', {
          oldX: oldMountainX.toFixed(2),
          newX: mountainSprite.position.x.toFixed(2),
          speed: MOUNTAIN_PARALLAX_SPEED,
          scrollAmount,
          width: mountainSprite.width,
          visible: mountainSprite.visible
        });
      }
      
      // Reset mountain position for seamless looping in both directions
      const screenWidth = app.screen.width;
      const mountainWidth = mountainSprite.width;
      
      // Forward movement: reset when completely off-screen to the left
      if (scrollAmount > 0 && mountainSprite.position.x + mountainWidth < 0) {
        // Position it back offscreen to the right for another pass
        const bgWidth = 2048;
        const scaledBgWidth = bgWidth * currentScale;
        const offscreenBuffer = 300;
        mountainSprite.position.x = scaledBgWidth + offscreenBuffer;
        console.log('🏔️ Mountain reset to offscreen right:', mountainSprite.position.x);
      }
      // Reverse movement: reset when completely off-screen to the right
      else if (scrollAmount < 0 && mountainSprite.position.x > screenWidth) {
        // Position it offscreen to the left for reverse loop
        mountainSprite.position.x = -mountainWidth;
        console.log('🏔️ Mountain reset to offscreen left for reverse:', mountainSprite.position.x);
      }
    }

    // Update hills parallax (6% of background speed for mid-ground depth effect)
    if (hillsSprite1 && hillsSprite2) {
      hillsOffset -= scrollAmount * HILLS_PARALLAX_SPEED;
      const hillsWidth = Math.floor(hillsSprite1.width);

      // Reset hills position for seamless looping in both directions
      if (scrollAmount > 0 && hillsOffset <= -hillsWidth) {
        // Forward movement: reset when completely off-screen to the left
        hillsOffset = hillsOffset % hillsWidth;
      } else if (scrollAmount < 0 && hillsOffset >= 0) {
        // Reverse movement: reset when completely off-screen to the right
        hillsOffset = hillsOffset % hillsWidth - hillsWidth;
      }

      hillsSprite1.position.x = Math.round(hillsOffset);
      hillsSprite2.position.x = Math.round(hillsOffset + hillsWidth);
    }

    // Update grassland parallax (same speed as background for foreground effect)
    if (grasslandSprite1 && grasslandSprite2) {
      const oldOffset = grasslandOffset;
      grasslandOffset -= scrollAmount * GRASSLAND_PARALLAX_SPEED;
      const grasslandWidth = Math.floor(grasslandSprite1.width);

      // Reset grassland position for seamless looping in both directions
      if (scrollAmount > 0 && grasslandOffset <= -grasslandWidth) {
        // Forward movement: reset when completely off-screen to the left
        grasslandOffset = grasslandOffset % grasslandWidth;
      } else if (scrollAmount < 0 && grasslandOffset >= 0) {
        // Reverse movement: reset when completely off-screen to the right
        grasslandOffset = grasslandOffset % grasslandWidth - grasslandWidth;
      }

      grasslandSprite1.position.x = Math.round(grasslandOffset);
      grasslandSprite2.position.x = Math.round(grasslandOffset + grasslandWidth);
      
      // Debug grassland movement
      if (Math.floor(oldOffset / 100) !== Math.floor(grasslandOffset / 100)) {
        console.log('🌿 Grassland movement:', {
          scrollAmount,
          oldOffset: oldOffset.toFixed(2),
          newOffset: grasslandOffset.toFixed(2),
          speed: GRASSLAND_PARALLAX_SPEED,
          sprite1X: grasslandSprite1.position.x,
          sprite2X: grasslandSprite2.position.x
        });
      }
    }

    // Enhanced debug: Log sprite positions more frequently to catch tearing
    const frameCount = Math.floor(Math.abs(offset));

    // Log every 50 pixels for more detailed tracking
    // if (frameCount % 50 === 0) {
    //   console.log(
    //     `🌅 Background offset: ${offset.toFixed(1)}, sprite1: ${sprite1X}, sprite2: ${sprite2X}, width: ${spriteWidth}`,
    //   );
    // }

    // Log every frame during reset cycles (potential tearing zones)
    // if (offset > resetThreshold && offset <= resetThreshold + 20) {
    //   console.log(
    //     `⚠️ RESET ZONE: offset: ${offset.toFixed(1)}, threshold: ${resetThreshold}, sprite1: ${sprite1X}, sprite2: ${sprite2X}`,
    //   );
    // }

    // Background sprites are static - no gap detection needed
    // const gap = sprite2X - sprite1X;
    // if (gap !== spriteWidth) {
    //   console.warn(
    //     `🚨 SPRITE GAP DETECTED: Expected gap: ${spriteWidth}, Actual gap: ${gap}, sprite1: ${sprite1X}, sprite2: ${sprite2X}`,
    //   );
    // }

    // Update background width for offscreen spawning
    window.backgroundWidth = spriteWidth;
  };

  // Add ticker with frame rate limiting and additional anti-tearing measures
  app.ticker.maxFPS = 60; // Limit to 60 FPS to match common monitor refresh rates

  // Note: roundPixels is read-only in PixiJS v8, handled at sprite level instead
  // app.renderer.roundPixels = true; // This would cause a TypeError

  app.ticker.add(onTick);

  // Handle resize
  const onResize = () => {
    scaleToFit();

    // Scale all game elements to match the new background scale
    scaleGameElements();
    
    // Scale parallax layers if they exist
    scaleParallaxLayers();
  };

  app.renderer.on('resize', onResize);

  // Combat system functions
  async function spawnEnemy(type: EnemyType) {
    console.log(`🔍 SPAWN ATTEMPT: Trying to spawn ${type}, current enemies: ${enemies.length}/${AUTO_SPAWN_CONFIG.maxEnemies}`);
    if (!app || enemies.length >= AUTO_SPAWN_CONFIG.maxEnemies) {
      console.log(`🔍 SPAWN BLOCKED: app=${!!app}, enemies=${enemies.length}, max=${AUTO_SPAWN_CONFIG.maxEnemies}`);
      return;
    }

    try {
      const { sprite, animator } = await createAnimatedEnemySprite(type, app.renderer, app.stage);

      // Position enemy offscreen to the right for smooth entry
      // Use scaled background dimensions for accurate positioning
      const bgWidth = 2048; // Original background width
      const bgHeight = 1024; // Original background height
      const scaledBgWidth = bgWidth * currentScale;
      const scaledBgHeight = bgHeight * currentScale;
      const positioning = new BackgroundPositioning(scaledBgWidth, scaledBgHeight);
      // Spawn offscreen to the right, accounting for scaled background width and buffer
      const spawnX = scaledBgWidth + OFFSCREEN_SPAWN_BUFFER;

      // Spawn only in the sky blue band (action area)
      const actionAreaTop = positioning.getActionAreaTopY();
      const actionAreaBottom = positioning.getActionAreaBottomY();
      const spawnY = actionAreaTop + Math.random() * (actionAreaBottom - actionAreaTop);

      sprite.position.set(spawnX, spawnY);
      sprite.scale.set(currentScale); // Scale to match background
      sprite.visible = true;

      app.stage.addChild(sprite);
      await animator.start();
      animator.setFPS(8);

      const maxHealth = ENEMY_HEALTH_CONFIG[type] || 10;

      // Debug logging for swarm enemy spawning
      if (type === 'swarm') {
        console.log(`🐛 SWARM SPAWN: Creating swarm enemy with ${maxHealth} HP (should be 8)`);
      }

      const enemyData = {
        sprite,
        animator,
        x: spawnX,
        y: spawnY,
        type,
        isMoving: true,
        lastFireTime: 0,
        fireRate: 2000 + Math.random() * 500,
        health: maxHealth,
        maxHealth,
        previousHealth: maxHealth, // For smooth HP bar animation
        healthAnimationStartTime: 0, // When the animation started
        isAnimatingHealth: false, // Whether health bar is currently animating
      };

      enemies.push(enemyData);
      console.log(`Spawned ${type} enemy (${enemies.length}/${AUTO_SPAWN_CONFIG.maxEnemies})`);
    } catch (error) {
      console.error(`Failed to spawn ${type} enemy:`, error);
    }
  }

  async function fireProjectileFromEnemy(enemyIndex: number) {
    if (!app || enemyIndex >= enemies.length || !dragonSprite) return;

    const enemy = enemies[enemyIndex];
    const dx = dragonSprite.x - enemy.x;
    const dy = dragonSprite.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > ENEMY_ATTACK_RANGE) return;

    try {
      const projectileType = getProjectileTypeForEnemy(enemy.type);
      const collisionCallback = (projectileSprite: Sprite) => {
        if (!dragonSprite) return false;

        // Dragon is invulnerable during defeat and recovery
        if (dragonState !== DragonState.ALIVE) {
          console.log('🛡️ Dragon is invulnerable during recovery');
          return false;
        }

        // Use custom collision detection with hit areas
        const isColliding = checkSpriteCollision(projectileSprite, dragonSprite);

        if (isColliding) {
          // CRITICAL FIX: Check if this projectile has already hit the dragon
          if (!projectileSprite.userData) {
            projectileSprite.userData = {};
          }
          
          // Prevent multiple hits on the dragon by this projectile
          if (projectileSprite.userData.hasHit) {
            // Projectile has already hit the dragon, don't apply damage again
            return false;
          }
          
          // Mark projectile as hit and set pierce timer
          projectileSprite.userData.hasHit = true;
          projectileSprite.userData.hitTime = performance.now();
          projectileSprite.userData.hitDragonId = dragonSprite; // Track which dragon was hit

          const enemyDamage = 5; // Reduced from 10 to allow dragon to survive more hits
          const oldHealth = dragonHealth;
          dragonHealth = Math.max(0, dragonHealth - enemyDamage); // Clamp to minimum 0

          // Start dragon health bar animation
          dragonPreviousHealth = oldHealth;
          dragonHealthAnimationStartTime = performance.now();

          console.log(
            `💥 DRAGON HIT by ${enemy.type}! Took ${enemyDamage} damage! Health: ${oldHealth} -> ${dragonHealth}/${dragonMaxHealth}`,
          );

          // Check if dragon was just defeated
          if (dragonHealth <= 0 && dragonState === DragonState.ALIVE) {
            handleDragonDefeat();
          }

          return false; // Allow piercing effect
        }
        return false;
      };

      const projectile = await createProjectile(
        projectileType,
        enemy.x,
        enemy.y,
        dragonSprite.x,
        dragonSprite.y,
        app.renderer,
        app.stage,
        collisionCallback,
      );

      projectile.setFPS(8);

      // Scale the new projectile to match current game scale
      const projectileSprite = projectile.getSprite();
      projectileSprite.scale.set(currentScale);

      projectiles.push(projectile);
    } catch (error) {
      console.error(`Failed to fire projectile from enemy:`, error);
    }
  }

  // Smart targeting: Calculate if projectile will kill target and switch if needed
  function calculateKillingBlow(enemy: any): boolean {
    return enemy.health <= DRAGON_BASE_DAMAGE;
  }

  function findBestTarget(): any | null {
    // First, find the closest enemy using the EXISTING logic (with range validation)
    let closestEnemy = enemies[0];
    let closestDistance = Infinity;

    enemies.forEach((enemy) => {
      // Skip defeated enemies when selecting target
      if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
        return;
      }

      const dx = enemy.x - dragonSprite.x;
      const dy = enemy.y - dragonSprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Keep the existing range validation
      if (distance < closestDistance && distance <= DRAGON_ATTACK_RANGE) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    // If no enemy in range, don't fire
    if (closestDistance > DRAGON_ATTACK_RANGE) {
      return null;
    }

    // NOW add the smart targeting layer: if closest enemy will die, find next target
    if (calculateKillingBlow(closestEnemy)) {
      // Closest enemy will die - look for next closest target in range
      let nextClosestEnemy = null;
      let nextClosestDistance = Infinity;

      enemies.forEach((enemy) => {
        // Skip defeated enemies and the enemy we already know will die
        if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
          return;
        }
        if (enemy === closestEnemy) {
          return; // Skip the enemy that will die
        }

        const dx = enemy.x - dragonSprite.x;
        const dy = enemy.y - dragonSprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Must be in range
        if (distance < nextClosestDistance && distance <= DRAGON_ATTACK_RANGE) {
          nextClosestDistance = distance;
          nextClosestEnemy = enemy;
        }
      });

      if (nextClosestEnemy) {
        console.log(`🎯 Smart targeting: ${closestEnemy.type} will die, switching to ${nextClosestEnemy.type}`);
        return nextClosestEnemy;
      } else {
        // No other targets in range - don't fire (let the killing blow happen naturally)
        console.log(`🎯 Smart targeting: ${closestEnemy.type} will die, no other targets in range - not firing`);
        return null;
      }
    }

    // Closest enemy won't die - target it normally
    return closestEnemy;
  }

  async function fireProjectileFromDragon() {
    if (!app || !dragonSprite || enemies.length === 0) return;

    // Use smart targeting to find best target
    const targetEnemy = findBestTarget();
    
    if (!targetEnemy) {
      console.log('🎯 No valid targets found');
      return;
    }

    // Use the smart target found by findBestTarget() (already validated)
    const closestEnemy = targetEnemy;

    try {
      const projectileType = getDragonProjectileType();
      const collisionCallback = (projectileSprite: Sprite) => {
        // Only check collision with the specific target enemy (closestEnemy)
        if (
          !closestEnemy ||
          !closestEnemy.sprite ||
          (closestEnemy.sprite.userData && closestEnemy.sprite.userData.isDefeated)
        ) {
          return false; // Target is gone or defeated, don't hit
        }

        // Use custom collision detection with individual enemy hitboxes
        const isColliding = checkSpriteCollision(
          projectileSprite,
          closestEnemy.sprite,
          closestEnemy.type,
        );

        // Log collision attempts for debugging
        if (isColliding) {
          console.log(`🎯 Dragon projectile HIT ${closestEnemy.type}!`);
        }

        if (isColliding) {
          // CRITICAL FIX: Check if this projectile has already hit this specific enemy
          if (!projectileSprite.userData) {
            projectileSprite.userData = {};
          }
          
          // Prevent multiple hits on the same enemy by this projectile
          if (projectileSprite.userData.hasHit) {
            // Projectile has already hit something, don't apply damage again
            return false;
          }
          
          // Track which enemy this projectile has hit to prevent double-hits
          if (!projectileSprite.userData.hitEnemyId) {
            projectileSprite.userData.hitEnemyId = closestEnemy.sprite; // Use sprite reference as unique ID
            projectileSprite.userData.hasHit = true;
            projectileSprite.userData.hitTime = performance.now();
            
            console.log(`⚡ Projectile FIRST HIT on ${closestEnemy.type} - applying damage and piercing for 0.07 seconds...`);
          } else if (projectileSprite.userData.hitEnemyId !== closestEnemy.sprite) {
            // Projectile hit a different enemy, which shouldn't happen with homing
            console.log(`⚠️ Projectile hit different enemy than expected, ignoring`);
            return false;
          } else {
            // Projectile already hit this specific enemy, don't apply damage again
            return false;
          }

          const oldHealth = closestEnemy.health;
          closestEnemy.health -= DRAGON_BASE_DAMAGE;

          // Start health bar animation
          closestEnemy.previousHealth = oldHealth;
          closestEnemy.healthAnimationStartTime = performance.now();
          closestEnemy.isAnimatingHealth = true;

          console.log(
            `💥 DRAGON HIT! ${closestEnemy.type} took ${DRAGON_BASE_DAMAGE} damage! Health: ${oldHealth} -> ${closestEnemy.health}/${closestEnemy.maxHealth}`,
          );

          // Extra debug for swarm enemies to track one-hit death issue
          if (closestEnemy.type === 'swarm') {
            console.log(
              `🐛 SWARM DEBUG: Initial health: ${closestEnemy.maxHealth}, Current: ${closestEnemy.health}, Damage dealt: ${DRAGON_BASE_DAMAGE}`,
            );
          }

          // Debug variable damage issue
          const actualDamageDealt = oldHealth - closestEnemy.health;
          if (actualDamageDealt !== DRAGON_BASE_DAMAGE) {
            console.error(
              `🚨 DAMAGE MISMATCH! Expected: ${DRAGON_BASE_DAMAGE}, Actual: ${actualDamageDealt}, Enemy: ${closestEnemy.type}`,
            );
          }

          if (closestEnemy.health <= 0) {
            // Mark enemy as defeated and record death time, but don't remove immediately
            if (!closestEnemy.sprite.userData) {
              closestEnemy.sprite.userData = {};
            }
            if (!closestEnemy.sprite.userData.isDefeated) {
              closestEnemy.sprite.userData.isDefeated = true;
              closestEnemy.sprite.userData.deathTime = performance.now();

              // Award arcana based on enemy type using the proper arcana drop manager
              const arcanaReward = closestEnemy.type === 'mantair-corsair' ? 0.03 : 0.01; // Corsairs give more arcana (0.01-0.05 range)
              arcanaManager.dropArcana(arcanaReward, {
                type: 'enemy_kill',
                enemyType: closestEnemy.type,
                timestamp: Date.now(),
              });
              console.log(
                `💀 ${closestEnemy.type} DEFEATED! Awarded ${arcanaReward} arcana! Total: ${arcanaManager.getCurrentBalance()}`,
              );
            }
          }

          return false; // Don't destroy projectile immediately - let it pierce through
        }
        // If no collision with any enemy, projectile MISSES and continues traveling
        // Only log missed projectiles occasionally to reduce noise
        if (!checkSpriteCollision.missLogCounter) checkSpriteCollision.missLogCounter = 0;
        checkSpriteCollision.missLogCounter++;
        if (checkSpriteCollision.missLogCounter % 1500 === 0) {
          console.log(`💨 Projectile MISSED - continuing forward`);
        }
        return false; // Continue traveling
      };

      // Validate target coordinates before creating projectile
      if (closestEnemy.sprite.x === null || closestEnemy.sprite.x === undefined || 
          closestEnemy.sprite.y === null || closestEnemy.sprite.y === undefined) {
        console.warn(`⚠️ Invalid target coordinates for ${closestEnemy.type}: x=${closestEnemy.sprite.x}, y=${closestEnemy.sprite.y}`);
        return; // Don't create projectile with invalid coordinates
      }

      // Calculate dragon head position for projectile origin
      // Dragon head is on the right side of the sprite (facing right)
      const dragonHeadOffsetX = dragonSprite.width * 0.4; // 40% of sprite width from center to right edge
      const dragonHeadOffsetY = -dragonSprite.height * 0.1 + 15; // Mouth position (10% up from center, then 15px down for mouth)
      
      const projectileOriginX = dragonSprite.x + dragonHeadOffsetX;
      const projectileOriginY = dragonSprite.y + dragonHeadOffsetY;

      console.log('🐲 Dragon projectile origin:', {
        dragonCenter: { x: dragonSprite.x, y: dragonSprite.y },
        dragonSize: { width: dragonSprite.width, height: dragonSprite.height },
        headOffset: { x: dragonHeadOffsetX, y: dragonHeadOffsetY },
        projectileOrigin: { x: projectileOriginX, y: projectileOriginY },
        target: { x: closestEnemy.sprite.x, y: closestEnemy.sprite.y }
      });

      const projectile = await createProjectile(
        projectileType,
        projectileOriginX,
        projectileOriginY,
        closestEnemy.sprite.x, // Use sprite center position for accurate aiming
        closestEnemy.sprite.y, // Use sprite center position for accurate aiming
        app.renderer,
        app.stage,
        collisionCallback,
      );

      // Enable homing behavior - projectile will continuously track the target enemy
      projectile.enableHoming(() => {
        // Find the enemy in the current enemies array to check its current state
        const currentEnemy = enemies.find(
          (enemy) => enemy.sprite === closestEnemy.sprite && !enemy.sprite.userData?.isDefeated,
        );

        if (!currentEnemy) {
          return null; // Enemy is defeated or no longer exists, disable homing
        }

        return {
          x: currentEnemy.sprite.x,
          y: currentEnemy.sprite.y,
        };
      });

      projectile.setFPS(8);

      // Scale the new projectile to match current game scale
      const projectileSprite = projectile.getSprite();
      projectileSprite.scale.set(currentScale);

      projectiles.push(projectile);
      projectileTargets.set(projectile, closestEnemy); // Track which enemy this projectile targets
      console.log(
        `🚀 Dragon homing projectile created and added to array. Total projectiles: ${projectiles.length}`,
      );
    } catch (error) {
      console.error('Failed to fire projectile from dragon:', error);
    }
  }

  function startProjectileUpdateLoop() {
    if (projectileUpdateLoop) {
      console.log('⚠️ Projectile update loop already running');
      return;
    }

    console.log('🚀 Starting projectile update loop...');
    let lastTime = performance.now();
    let frameCount = 0;

    // Add visibility change handler to restart loops when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Tab became visible, restarting game loops...');
        // Restart both loops if they were stalled
        if (!projectileUpdateLoop) {
          projectileUpdateLoop = requestAnimationFrame(updateProjectiles);
        }
        if (!combatUpdateLoop) {
          combatUpdateLoop = requestAnimationFrame(updateCombat);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Integrate with background simulation system for tab switching
    const handleBgTick = (event: CustomEvent<{ dt: number }>) => {
      if (!document.hidden) return; // Only run when tab is hidden
      
      const dt = event.detail.dt;
      
      // Update parallax layers when tab is hidden (background simulation)
      updateParallaxLayers(dt);
      
      // Update projectiles when tab is hidden
      updateProjectilesInBackground(dt);
      
      // Update combat when tab is hidden  
      updateCombatInBackground(dt);
    };
    
    window.addEventListener('bg-tick', handleBgTick as EventListener);

    // Background simulation functions (called when tab is hidden)
    function updateParallaxLayers(dt: number) {
      if (!app) return;
      
      // Update all parallax layers at reduced rate when tab is hidden
      const currentScale = app.screen.width / 2048; // Match the scaling logic
      
      // Update clouds
      if (cloudsSprite) {
        const cloudsSpeed = CLOUDS_PARALLAX_SPEED * 0.5; // Reduced speed in background
        cloudsSprite.position.x -= cloudsSpeed * dt * 0.001; // dt is in ms, convert to seconds
        if (cloudsSprite.position.x < -cloudsSprite.width) {
          cloudsSprite.position.x = 0;
        }
      }
      
      // Update mountain
      if (mountainSprite) {
        const mountainSpeed = MOUNTAIN_PARALLAX_SPEED * 0.5; // Reduced speed in background
        mountainSprite.position.x -= mountainSpeed * dt * 0.001;
        if (mountainSprite.position.x < -mountainSprite.width) {
          mountainSprite.position.x = 0;
        }
      }
      
      // Update hills
      if (hillsSprite1 && hillsSprite2) {
        const hillsSpeed = HILLS_PARALLAX_SPEED * 0.5; // Reduced speed in background
        hillsSprite1.position.x -= hillsSpeed * dt * 0.001;
        hillsSprite2.position.x -= hillsSpeed * dt * 0.001;
        
        // Reset positions when they go off screen
        if (hillsSprite1.position.x < -hillsSprite1.width) {
          hillsSprite1.position.x = hillsSprite2.position.x + hillsSprite2.width;
        }
        if (hillsSprite2.position.x < -hillsSprite2.width) {
          hillsSprite2.position.x = hillsSprite1.position.x + hillsSprite1.width;
        }
      }
      
      // Update grassland
      if (grasslandSprite1 && grasslandSprite2) {
        const grasslandSpeed = GRASSLAND_PARALLAX_SPEED * 0.5; // Reduced speed in background
        grasslandSprite1.position.x -= grasslandSpeed * dt * 0.001;
        grasslandSprite2.position.x -= grasslandSpeed * dt * 0.001;
        
        // Reset positions when they go off screen
        if (grasslandSprite1.position.x < -grasslandSprite1.width) {
          grasslandSprite1.position.x = grasslandSprite2.position.x + grasslandSprite2.width;
        }
        if (grasslandSprite2.position.x < -grasslandSprite2.width) {
          grasslandSprite2.position.x = grasslandSprite1.position.x + grasslandSprite1.width;
        }
      }
    }
    
    function updateProjectilesInBackground(dt: number) {
      // Update projectiles at reduced rate when tab is hidden
      for (const projectile of projectiles) {
        try {
          const projectileSprite = projectile.getSprite();
          if (!projectileSprite) {
            projectile.destroy();
            continue;
          }
          
          // Update projectile at reduced rate
          projectile.update(dt * 0.5); // Slower updates in background
          
        } catch (error) {
          console.error('Background projectile update error:', error);
          projectile.destroy();
        }
      }
    }
    
    function updateCombatInBackground(dt: number) {
      // Update combat systems at reduced rate when tab is hidden
      if (dragonState === DragonState.RECOVERING) {
        updateDragonRecovery(performance.now());
        return;
      }
      
      // Update enemies at reduced rate
      for (const enemy of enemies) {
        if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
          continue;
        }
        
        // Move enemies at reduced speed
        enemy.x -= enemy.speed * dt * 0.001 * 0.5; // Half speed in background
        if (enemy.sprite) {
          enemy.sprite.position.x = enemy.x;
        }
      }
      
      // Update dragon firing at reduced rate
      if (dragonAnimatorWithFireTime && performance.now() - dragonAnimatorWithFireTime.lastFireTime > 2000) {
        fireProjectileFromDragon();
        dragonAnimatorWithFireTime.lastFireTime = performance.now();
      }
    }

    function updateProjectiles() {
      if (!app) return;

      frameCount++;
      // if (frameCount % 600 === 0) {
      //   // Log every 600 frames (roughly every 10 seconds)
      //   console.log(`🔄 Projectile update loop running... frame ${frameCount}`);
      // }

      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const activeProjectiles = [];
      if (projectiles.length > 0) {
        // Only log projectile updates occasionally to reduce noise
        if (!updateProjectiles.logCounter) updateProjectiles.logCounter = 0;
        updateProjectiles.logCounter++;
        if (updateProjectiles.logCounter % 1000 === 0) {
          console.log(`🔄 Updating ${projectiles.length} projectiles...`);
        }
      }

      for (const projectile of projectiles) {
        try {
          const projectileSprite = projectile.getSprite();

          // Check if projectile sprite is valid before proceeding
          if (!projectileSprite) {
            console.log(`⚠️ Projectile sprite is null, destroying projectile`);
            projectile.destroy();
            continue;
          }

          // Check if projectile has hit and should be destroyed after pierce timer
          if (projectileSprite.userData && projectileSprite.userData.hasHit) {
            const hitTime = projectileSprite.userData.hitTime;
            const timeSinceHit = performance.now() - hitTime;

            if (timeSinceHit >= 70) {
              // 0.07 seconds = 70ms
              console.log(`⚡ Projectile pierce timer expired, destroying projectile`);
              projectile.destroy();
              continue; // Skip adding to active projectiles
            }
          }

          let stillActive = false;
          try {
            stillActive = projectile.update(deltaTime);
          } catch (error) {
            console.error(`🚨 Error updating projectile:`, error);
            // Destroy the problematic projectile and continue
            projectile.destroy();
            continue;
          }

          // Always keep projectiles active unless they've been explicitly marked for destruction
          // This ensures projectiles continue traveling even when they "miss" according to internal logic

          // Re-get sprite after update in case it was modified
          const currentProjectileSprite = projectile.getSprite();
          if (!currentProjectileSprite) {
            console.log(`⚠️ Projectile sprite became null after update, destroying projectile`);
            projectile.destroy();
            continue;
          }

          // Check if projectile is offscreen (missed) and should be despawned
          const screenWidth = app.screen.width;
          const offscreenBuffer = 100; // Extra buffer beyond screen edge

          // Double-check sprite is still valid before accessing properties
          if (!currentProjectileSprite) {
            console.log(
              `⚠️ Projectile sprite is null when checking offscreen, destroying projectile`,
            );
            projectile.destroy();
            continue;
          }
          
          // Additional safety check for x property access
          if (!currentProjectileSprite || currentProjectileSprite.x === undefined || currentProjectileSprite.x === null) {
            console.log(
              `⚠️ Projectile sprite or x property is invalid, destroying projectile`,
            );
            projectile.destroy();
            continue;
          }

          // Comprehensive null and undefined check to prevent race conditions
          if (!currentProjectileSprite || currentProjectileSprite.x === undefined || currentProjectileSprite.x === null) {
            console.log(`⚠️ Projectile sprite is null/undefined or x is invalid, destroying projectile`);
            projectile.destroy();
            continue;
          }

          // Final safety check before accessing x property
          if (!currentProjectileSprite || typeof currentProjectileSprite.x !== 'number') {
            console.log(`⚠️ Final safety check failed - sprite invalid or x not a number, destroying projectile`);
            projectile.destroy();
            continue;
          }

          if (currentProjectileSprite.x > screenWidth + offscreenBuffer) {
            console.log(`💨 Projectile went offscreen, despawning`);
            projectile.destroy();
          } else if (
            stillActive ||
            (currentProjectileSprite.userData && !currentProjectileSprite.userData.hasHit)
          ) {
            // Keep projectile active if:
            // 1. It's still active according to internal logic, OR
            // 2. It hasn't hit anything yet (allows missed projectiles to continue)
            activeProjectiles.push(projectile);
          }
        } catch (error) {
          console.error('Error updating projectile:', error);
          // Remove the problematic projectile
          projectile.destroy();
        }
      }

      // Clean up projectile targets map for destroyed projectiles
      const destroyedProjectiles = projectiles.filter((p) => !activeProjectiles.includes(p));
      destroyedProjectiles.forEach((projectile) => {
        projectileTargets.delete(projectile);
      });

      projectiles.length = 0;
      projectiles.push(...activeProjectiles);

      // Use requestAnimationFrame but with fallback to setTimeout for tab switching stability
      requestAnimationFrame(updateProjectiles);
      
      // Fallback mechanism: if the game loop hasn't run in 2 seconds, restart it
      if (!updateProjectiles.lastRun) updateProjectiles.lastRun = performance.now();
      const timeSinceLastRun = performance.now() - updateProjectiles.lastRun;
      if (timeSinceLastRun > 2000) {
        console.warn('🔄 Game loop appears stalled, restarting...');
        setTimeout(() => updateProjectiles(), 16); // ~60fps fallback
      }
      updateProjectiles.lastRun = performance.now();
    }

    projectileUpdateLoop = requestAnimationFrame(updateProjectiles);
  }

  function startCombatUpdateLoop() {
    if (combatUpdateLoop) return;

    let lastTime = performance.now();

    function updateCombat() {
      if (!app) return;

      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Handle dragon recovery state
      if (dragonState === DragonState.RECOVERING) {
        updateDragonRecovery(currentTime);

        // Still update health bars and arcana counter during recovery
        drawHealthBars();
        drawArcanaCounter();

        requestAnimationFrame(updateCombat);
        return; // Skip enemy/projectile updates during recovery
      }

      // Remove defeated enemies after their death delay
      const activeEnemies = [];
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
          const timeSinceDeath = performance.now() - enemy.sprite.userData.deathTime;
          if (timeSinceDeath >= 330) {
            // 0.33 seconds = 330ms
            console.log(`👻 ${enemy.type} disappearing after death delay.`);

            // Destroy all projectiles targeting this enemy at the same time
            const projectilesToDestroy: Projectile[] = [];
            projectileTargets.forEach((targetEnemy, projectile) => {
              if (targetEnemy === enemy) {
                projectilesToDestroy.push(projectile);
                projectileTargets.delete(projectile);
              }
            });

            // Destroy the projectiles
            projectilesToDestroy.forEach((projectile) => {
              projectile.destroy();
            });

            enemy.animator.destroy();
            app.stage.removeChild(enemy.sprite);
            // Don't add to activeEnemies, effectively removing it
          } else {
            // Add blinking effect for defeated enemies
            const blinkSpeed = 100; // milliseconds per blink
            const timeSinceDeath = performance.now() - enemy.sprite.userData.deathTime;
            const blinkPhase = Math.floor(timeSinceDeath / blinkSpeed) % 2;

            // Blink between visible (alpha 1) and semi-transparent (alpha 0.3)
            enemy.sprite.alpha = blinkPhase === 0 ? 1.0 : 0.3;

            // Make projectiles targeting this defeated enemy blink in sync
            projectileTargets.forEach((targetEnemy, projectile) => {
              if (targetEnemy === enemy) {
                const projectileSprite = projectile.getSprite();
                projectileSprite.alpha = blinkPhase === 0 ? 1.0 : 0.3;
              }
            });

            activeEnemies.push(enemy);
          }
        } else {
          // Ensure living enemies have normal alpha
          enemy.sprite.alpha = 1.0;
          activeEnemies.push(enemy);
        }
      }
      enemies.length = 0;
      enemies.push(...activeEnemies);

      // Update enemy movement and combat
      enemies.forEach((enemy, index) => {
        if (!dragonSprite) return;

        // Skip movement and combat for defeated enemies
        if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
          return;
        }

        const dx = dragonSprite.x - enemy.x;
        const dy = dragonSprite.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move enemy toward dragon if not in attack range
        if (enemy.isMoving && distance > ENEMY_ATTACK_RANGE) {
          const moveDistance = ENEMY_MOVE_SPEED * (deltaTime / 1000);
          if (distance > 0) {
            const moveX = (dx / distance) * moveDistance;
            const moveY = (dy / distance) * moveDistance;

            enemy.x += moveX;
            enemy.y += moveY;
            enemy.sprite.position.set(enemy.x, enemy.y);
          }
        } else if (distance <= ENEMY_ATTACK_RANGE) {
          enemy.isMoving = false;

          // Auto-fire if enough time has passed
          if (currentTime - enemy.lastFireTime >= enemy.fireRate) {
            fireProjectileFromEnemy(index);
            enemy.lastFireTime = currentTime;
          }
        } else if (distance > ENEMY_ATTACK_RANGE * 1.2) {
          enemy.isMoving = true;
        }
      });

      // Dragon auto-combat
      if (dragonSprite && dragonAnimator) {
        const dragonAnimatorWithFireTime = dragonAnimator as typeof dragonAnimator & {
          lastFireTime?: number;
        };
        const dragonLastFireTime = dragonAnimatorWithFireTime.lastFireTime || 0;
        const dragonFireRate = 1500;

        if (currentTime - dragonLastFireTime >= dragonFireRate) {
          fireProjectileFromDragon();
          dragonAnimatorWithFireTime.lastFireTime = currentTime;
        }
      }

      // Update health bars and arcana counter
      drawHealthBars();
      drawArcanaCounter();

      // Use requestAnimationFrame but with fallback to setTimeout for tab switching stability
      requestAnimationFrame(updateCombat);
      
      // Fallback mechanism: if the game loop hasn't run in 2 seconds, restart it
      if (!updateCombat.lastRun) updateCombat.lastRun = performance.now();
      const timeSinceLastRun = performance.now() - updateCombat.lastRun;
      if (timeSinceLastRun > 2000) {
        console.warn('🔄 Combat loop appears stalled, restarting...');
        setTimeout(() => updateCombat(), 16); // ~60fps fallback
      }
      updateCombat.lastRun = performance.now();
    }

    combatUpdateLoop = requestAnimationFrame(updateCombat);
  }

  function startAutoSpawning() {
    if (autoSpawnInterval) return;
    console.log('🔍 AUTO-SPAWN: Starting automatic enemy spawning');

    const scheduleNextSpawn = () => {
      if (!isGameplayActive) {
        console.log('🔍 AUTO-SPAWN: Gameplay not active, skipping spawn');
        return;
      }

      const baseTime = AUTO_SPAWN_CONFIG.baseInterval;
      const variation = (Math.random() - 0.5) * AUTO_SPAWN_CONFIG.intervalVariation;
      const nextSpawnTime = baseTime + variation;
      console.log(`🔍 AUTO-SPAWN: Next spawn scheduled in ${nextSpawnTime.toFixed(0)}ms`);

      autoSpawnInterval = window.setTimeout(() => {
        if (!isGameplayActive) return;

        if (enemies.length < AUTO_SPAWN_CONFIG.maxEnemies) {
          const randomEnemyType =
            AUTO_SPAWN_CONFIG.enemyTypes[
              Math.floor(Math.random() * AUTO_SPAWN_CONFIG.enemyTypes.length)
            ];
          spawnEnemy(randomEnemyType);
        }

        scheduleNextSpawn();
      }, nextSpawnTime);
    };

    scheduleNextSpawn();
  }

  function stopAutoSpawning() {
    if (autoSpawnInterval) {
      clearTimeout(autoSpawnInterval);
      autoSpawnInterval = null;
    }
  }

  function handleDragonDefeat() {
    console.log('💀 DRAGON DEFEATED! Starting recovery sequence...');

    // Set dragon state to defeated
    dragonState = DragonState.DEFEATED;
    dragonWasDefeated = true;

    // Stop scrolling background
    isActive = false;

    // Clear all projectiles
    projectiles.forEach((projectile) => projectile.destroy());
    projectiles.length = 0;
    projectileTargets.clear();
    console.log('✨ All projectiles cleared');

    // Clear all enemies
    enemies.forEach((enemy) => {
      enemy.animator.destroy();
      app.stage.removeChild(enemy.sprite);
    });
    enemies.length = 0;
    console.log('✨ All enemies cleared');

    // Set dragon to idle animation if animator exists
    if (dragonAnimator) {
      dragonAnimator.stop();
    }

    // Start recovery sequence
    startDragonRecovery();
  }

  function startDragonRecovery() {
    console.log('🔄 Starting dragon recovery sequence...');

    // Set recovery state
    dragonState = DragonState.RECOVERING;
    recoveryStartTime = performance.now();
    dragonHealth = 0; // Ensure health starts at 0
  }

  function updateDragonRecovery(currentTime: number) {
    const recoveryProgress = (currentTime - recoveryStartTime) / RECOVERY_DURATION_MS;

    if (recoveryProgress >= 1.0) {
      // Recovery complete
      completeDragonRecovery();
    } else {
      // Smoothly animate health from 0 to 100
      dragonHealth = Math.floor(dragonMaxHealth * recoveryProgress);

      // Log recovery progress every 20% to avoid spam
      const progressPercent = Math.floor(recoveryProgress * 100);
      if (progressPercent % 20 === 0 && !(updateDragonRecovery as any).lastLoggedProgress) {
        console.log(
          `💚 Dragon recovering: ${progressPercent}% (${dragonHealth}/${dragonMaxHealth} HP)`,
        );
        (updateDragonRecovery as any).lastLoggedProgress = progressPercent;
      }
      if (progressPercent % 20 !== 0) {
        (updateDragonRecovery as any).lastLoggedProgress = undefined;
      }
    }
  }

  async function completeDragonRecovery() {
    console.log('✅ Dragon recovery complete! Resuming journey...');

    // Restore dragon to full health
    dragonHealth = dragonMaxHealth;
    dragonPreviousHealth = dragonMaxHealth;

    // Reset dragon state
    dragonState = DragonState.ALIVE;
    dragonWasDefeated = false;

    // Resume scrolling background
    isActive = true;

    // Restart dragon animation - ensure it's fully stopped first, then restart
    if (dragonAnimator) {
      dragonAnimator.stop(); // Ensure clean stop
      dragonAnimator.setFPS(8);
      await dragonAnimator.start(); // Await the async start
      console.log('🎬 Dragon animation restarted at 8 FPS');
    } else {
      console.warn('⚠️ Dragon animator not available for restart');
    }

    console.log('🚀 Journey resumed!');
  }

  function startAutomaticGameplay() {
    if (isGameplayActive) return;

    isGameplayActive = true;
    console.log('Starting automatic gameplay...');

    startProjectileUpdateLoop();
    startCombatUpdateLoop();
    startAutoSpawning();
  }

  function stopAutomaticGameplay() {
    if (!isGameplayActive) return;

    isGameplayActive = false;
    console.log('Stopping automatic gameplay...');

    stopAutoSpawning();

    if (projectileUpdateLoop) {
      cancelAnimationFrame(projectileUpdateLoop);
      projectileUpdateLoop = null;
    }

    if (combatUpdateLoop) {
      cancelAnimationFrame(combatUpdateLoop);
      combatUpdateLoop = null;
    }

    // Clean up all enemies
    enemies.forEach((enemy) => {
      enemy.animator.destroy();
      app.stage.removeChild(enemy.sprite);
    });
    enemies.length = 0;

    // Clean up all projectiles
    projectiles.forEach((projectile) => projectile.destroy());
    projectiles.length = 0;
    projectileTargets.clear();
  }

  return {
    start: () => {
      isActive = true;
    },
    stop: () => {
      isActive = false;
    },
    isScrolling: () => {
      return isActive;
    },
    setSpeed: (speed: number) => {
      currentSpeed = speed;
    },
    getDragon: () => {
      return dragonSprite;
    },
    getDragonAnimator: () => {
      return dragonAnimator;
    },
    startAutomaticGameplay,
    stopAutomaticGameplay,
    isGameplayActive: () => isGameplayActive,
    spawnEnemy,
    getGameplayStats: () => ({
      dragons: dragonSprite ? 1 : 0,
      enemies: enemies.length,
      projectiles: projectiles.length,
    }),
    destroy: () => {
      // Stop gameplay first
      stopAutomaticGameplay();

      app.ticker.remove(onTick);
      app.renderer.off('resize', onResize);

      // Destroy dragon
      if (dragonAnimator) {
        dragonAnimator.destroy();
      }
      if (dragonSprite) {
        app.stage.removeChild(dragonSprite);
        dragonSprite.destroy();
      }

      // Clean up health bars graphics
      if (healthBarsGraphics) {
        healthBarsGraphics.destroy();
        healthBarsGraphics = null;
      }

      container.destroy({ children: true });

      // Clean up debug graphics (if they exist)
      // Note: debugGraphics cleanup removed as it's not currently used
    },
  };
}
