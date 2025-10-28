/**
 * @file Profile Shapes Test
 */

import { Application, Container, Graphics, Ticker } from 'pixi.js';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';

/**
 * Magical particle for gem effects
 */
interface MagicalParticle {
  graphics: Container;
  life: number; // 0 to 1, decreases over time
  velocityX: number;
  velocityY: number;
  gemX: number; // Original gem X position
  gemY: number; // Original gem Y position
  active: boolean; // Whether particle is currently in use
}

/**
 * Gem data for tracking interactions
 */
interface GemData {
  container: Container;
  color: number;
  radius: number;
  isLit: boolean;
  isHovered: boolean;
  hoverGlow?: Container; // Glow for unlit gem on hover
}

/**
 * Profile container data for hover interactions
 */
interface ProfileContainerData {
  nameplate: Container;
  attachment?: Container;
  gems: GemData[];
  isHovered: boolean;
}

export interface ProfileShapeConfig {
  width?: number;
  height?: number;
  cornerRadius?: number;
  parallelogramWidth?: number;
  parallelogramHeight?: number;
  parallelogramLean?: number; // How much the parallelogram leans right
}

/**
 * Creates the NAMEPLATE shape
 *
 * DIMENSIONS:
 * - Base: 500x80px rectangle (sharp corners, dark green 0x1a3d2d)
 * - Angled corners (3): bottom-left, top-left, top-right
 *   - Size: 15x15px triangles with concave hypotenuse
 *   - Control point: 2px from corner for dramatic curve
 * - Bottom-right cutout:
 *   - Triangle: (250,80) -> (300,80) -> (300,40) - 50x40px
 *   - Rectangle: (300,40) -> (500,80) - 200x40px
 * - Gem position (all NAMEPLATE instances):
 *   - Center: x=480, y=20 (relative to nameplate origin)
 *   - Padding: 8px from right edge, 8px from top, 8px from bottom
 *   - Radius: 12px
 */
export function createNameplateShape(config: ProfileShapeConfig = {}): Graphics {
  const { width = 500, height = 80, cornerRadius = 10, parallelogramLean = 50 } = config;

  const graphics = new Graphics();

  // Draw sharp rectangle (no rounded corners)
  graphics.rect(0, 0, width, height);
  graphics.fill({ color: 0x1a3d2d, alpha: 1.0 }); // Dark green, full opacity

  // Cut angled corners using small triangles with VERY deep concave hypotenuse
  const cutSize = 15; // Size of the corner cut
  const controlOffset = 2; // Control point very close to corner for dramatic concave

  // CUT BOTTOM-LEFT CORNER
  graphics.moveTo(cutSize, height); // Start at bottom edge (15, 80)
  graphics.lineTo(0, height); // Go to bottom-left corner (0, 80)
  graphics.lineTo(0, height - cutSize); // Go up left edge (0, 65)
  // Very deep concave curve back to start
  graphics.quadraticCurveTo(
    controlOffset,
    height - controlOffset, // Control point very close to corner (2, 78)
    cutSize,
    height, // End point (15, 80)
  );
  graphics.cut();

  // CUT TOP-LEFT CORNER
  graphics.moveTo(0, cutSize); // Start at left edge (0, 15)
  graphics.lineTo(0, 0); // Go to top-left corner (0, 0)
  graphics.lineTo(cutSize, 0); // Go to top edge (15, 0)
  // Very deep concave curve back to start
  graphics.quadraticCurveTo(
    controlOffset,
    controlOffset, // Control point very close to corner (2, 2)
    0,
    cutSize, // End point (0, 15)
  );
  graphics.cut();

  // CUT TOP-RIGHT CORNER
  graphics.moveTo(width - cutSize, 0); // Start at top edge (485, 0)
  graphics.lineTo(width, 0); // Go to top-right corner (500, 0)
  graphics.lineTo(width, cutSize); // Go down right edge (500, 15)
  // Very deep concave curve back to start
  graphics.quadraticCurveTo(
    width - controlOffset,
    controlOffset, // Control point very close to corner (498, 2)
    width - cutSize,
    0, // End point (485, 0)
  );
  graphics.cut();

  // CUT BOTTOM-RIGHT SECTION (for parallelogram attachment)
  const parallelogramHeight = height / 2; // 40px
  const lean = parallelogramLean; // 50px
  const offsetX = width * 0.5; // Start at 50% of rectangle width (250px)
  const offsetY = height - parallelogramHeight; // Bottom section (40px)

  // Cut right triangle on the left (right angle at bottom-right of triangle)
  graphics
    .poly([
      { x: offsetX, y: offsetY + parallelogramHeight }, // Bottom-left (250, 80)
      { x: offsetX + lean, y: offsetY + parallelogramHeight }, // Bottom-right - right angle (300, 80)
      { x: offsetX + lean, y: offsetY }, // Top-right (300, 40)
    ])
    .cut();

  // Cut narrower rectangle to the right of the triangle
  const rectWidth = 200; // Narrower than before (was 250)
  graphics
    .rect(offsetX + lean, offsetY, rectWidth, parallelogramHeight) // (300, 40, 200, 40)
    .cut();

  return graphics;
}

/**
 * Creates a MIRRORED nameplate shape (SIMPLE ATTACHMENT)
 *
 * DIMENSIONS:
 * - Base: 500x80px rectangle (sharp corners, dark green 0x1a3d2d)
 * - Angled corners (2): bottom-right, top-right
 *   - Size: 15x15px triangles with concave hypotenuse
 *   - Control point: 2px from corner
 * - Top-left rectangular cut: (0,0) -> (260,48) - 260x48px (52% width, 60% height)
 * - Bottom-left triangle cut: (10,48) -> (50,48) -> (10,80) - 40x32px
 *   - Offset: 10px from left edge
 * - Floating rectangle cut: (0,48) -> (10,80) - 10x32px (removes gap)
 * - Decorative concave corner: 15x15px at (260,0), flipped horizontally
 */
export function createMirroredNameplateShape(config: ProfileShapeConfig = {}): Graphics {
  const { width = 500, height = 80, cornerRadius = 10, parallelogramLean = 50 } = config;

  const graphics = new Graphics();

  // Draw sharp rectangle (no rounded corners)
  graphics.rect(0, 0, width, height);
  graphics.fill({ color: 0x1a3d2d, alpha: 1.0 }); // Dark green, full opacity

  // Cut angled corners using small triangles with VERY deep concave hypotenuse
  const cutSize = 15; // Size of the corner cut
  const controlOffset = 2; // Control point very close to corner for dramatic concave

  // CUT BOTTOM-RIGHT CORNER
  graphics.moveTo(width - cutSize, height); // Start at bottom edge (485, 80)
  graphics.lineTo(width, height); // Go to bottom-right corner (500, 80)
  graphics.lineTo(width, height - cutSize); // Go up right edge (500, 65)
  // Very deep concave curve back to start
  graphics.quadraticCurveTo(
    width - controlOffset,
    height - controlOffset, // Control point very close to corner (498, 78)
    width - cutSize,
    height, // End point (485, 80)
  );
  graphics.cut();

  // CUT TOP-RIGHT CORNER
  graphics.moveTo(width - cutSize, 0); // Start at top edge (485, 0)
  graphics.lineTo(width, 0); // Go to top-right corner (500, 0)
  graphics.lineTo(width, cutSize); // Go down right edge (500, 15)
  // Very deep concave curve back to start
  graphics.quadraticCurveTo(
    width - controlOffset,
    controlOffset, // Control point very close to corner (498, 2)
    width - cutSize,
    0, // End point (485, 0)
  );
  graphics.cut();

  // CUT TOP-LEFT SECTION with rectangle
  const parallelogramHeight = height / 2; // 40px (original)
  const rectWidth = width * 0.52; // 52% of attachment width: 260px
  const rectHeight = height * 0.6; // 60% of attachment height: 48px
  const triangleHeight = height * 0.4; // 40% of attachment height: 32px
  const triangleWidth = triangleHeight * 1.25; // Maintain same proportions: 40px
  const triangleOffsetX = 10; // Offset triangle 10px to the right

  // Cut rectangle on the top-left (52% of width and height)
  graphics
    .rect(0, 0, rectWidth, rectHeight) // (0, 0, 260, 48)
    .cut();

  // CUT BOTTOM-LEFT with triangle (offset 10px to the right, proportional width)
  const offsetY = height - triangleHeight; // Bottom section (48px from top)

  // Cut triangle (right angle at top-left of triangle, offset to right)
  graphics
    .poly([
      { x: triangleOffsetX + triangleWidth, y: offsetY }, // Top-right (50, 48)
      { x: triangleOffsetX, y: offsetY }, // Top-left - right angle (10, 48)
      { x: triangleOffsetX, y: offsetY + triangleHeight }, // Bottom-left (10, 80)
    ])
    .cut();

  // Cut the floating rectangle on the left (between rectangle and triangle)
  graphics
    .rect(0, rectHeight, triangleOffsetX, height - rectHeight) // (0, 48, 10, 32)
    .cut();

  return graphics;
}

/**
 * Creates an EXTENDED attachment shape (COMPLEX ATTACHMENT)
 *
 * DIMENSIONS:
 * - Base: 500x380px rectangle (80px top + 300px extension, dark green 0x1a3d2d)
 * - Top section (80px): Same as simple attachment
 *   - Angled corner: top-right (15x15px)
 *   - Top-left rectangular cut: (0,0) -> (260,48) - 260x48px
 *   - Bottom-left triangle cut: (10,48) -> (50,48) -> (10,80) - 40x32px
 *   - Floating rectangle cut: (0,48) -> (10,80) - 10x32px
 * - Extension section (300px):
 *   - Full width initially, then cut to 490px
 *   - Left side cut: (0,80) -> (10,380) - 10x300px (aligns right edge)
 * - Bottom-right corner cut: 15x15px at (485,365) -> (500,380)
 * - Decorative concave corner: 15x15px at (260,0), flipped horizontally
 * - Gem position: On nameplate at standard position (x=480, y=20)
 */
export function createExtendedAttachmentShape(config: ProfileShapeConfig = {}): Graphics {
  const { width = 500, height = 80, cornerRadius = 10, parallelogramLean = 50 } = config;

  const extensionHeight = 300;
  const totalHeight = height + extensionHeight;

  const graphics = new Graphics();

  // Draw sharp rectangle (no rounded corners) with extended height
  graphics.rect(0, 0, width, totalHeight);
  graphics.fill({ color: 0x1a3d2d, alpha: 1.0 }); // Dark green, full opacity

  // Cut angled corners using small triangles with VERY deep concave hypotenuse
  const cutSize = 15; // Size of the corner cut
  const controlOffset = 2; // Control point very close to corner for dramatic concave

  // CUT BOTTOM-RIGHT CORNER (at new bottom position)
  graphics.moveTo(width - cutSize, totalHeight); // Start at bottom edge (485, 380)
  graphics.lineTo(width, totalHeight); // Go to bottom-right corner (500, 380)
  graphics.lineTo(width, totalHeight - cutSize); // Go up right edge (500, 365)
  // Very deep concave curve back to start
  graphics.quadraticCurveTo(
    width - controlOffset,
    totalHeight - controlOffset, // Control point very close to corner
    width - cutSize,
    totalHeight, // End point
  );
  graphics.cut();

  // CUT TOP-RIGHT CORNER
  graphics.moveTo(width - cutSize, 0); // Start at top edge (485, 0)
  graphics.lineTo(width, 0); // Go to top-right corner (500, 0)
  graphics.lineTo(width, cutSize); // Go down right edge (500, 15)
  // Very deep concave curve back to start
  graphics.quadraticCurveTo(
    width - controlOffset,
    controlOffset, // Control point very close to corner (498, 2)
    width - cutSize,
    0, // End point (485, 0)
  );
  graphics.cut();

  // CUT TOP-LEFT SECTION with rectangle
  const parallelogramHeight = height / 2; // 40px (original)
  const rectWidth = width * 0.52; // 52% of attachment width: 260px
  const rectHeight = height * 0.6; // 60% of attachment height: 48px
  const triangleHeight = height * 0.4; // 40% of attachment height: 32px
  const triangleWidth = triangleHeight * 1.25; // Maintain same proportions: 40px
  const triangleOffsetX = 10; // Offset triangle 10px to the right

  // Cut rectangle on the top-left (52% of width and height)
  graphics
    .rect(0, 0, rectWidth, rectHeight) // (0, 0, 260, 48)
    .cut();

  // CUT BOTTOM-LEFT with triangle (offset 10px to the right, proportional width)
  const offsetY = height - triangleHeight; // Bottom section (48px from top)

  // Cut triangle (right angle at top-left of triangle, offset to right)
  graphics
    .poly([
      { x: triangleOffsetX + triangleWidth, y: offsetY }, // Top-right (50, 48)
      { x: triangleOffsetX, y: offsetY }, // Top-left - right angle (10, 48)
      { x: triangleOffsetX, y: offsetY + triangleHeight }, // Bottom-left (10, 80)
    ])
    .cut();

  // Cut the floating rectangle on the left (between rectangle and triangle)
  graphics
    .rect(0, rectHeight, triangleOffsetX, height - rectHeight) // (0, 48, 10, 32)
    .cut();

  // Cut 2% from the left side of the extension to align right edge
  const extensionCutWidth = width * 0.02; // 10px
  graphics
    .rect(0, height, extensionCutWidth, extensionHeight) // (0, 80, 10, 300)
    .cut();

  return graphics;
}

/**
 * Creates a small concave corner shape
 * - Used as decorative element on corners
 * - Matches the cut corner style with dramatic concave curve
 */
export function createConcaveCornerShape(
  size: number = 15,
  color: number = 0x1a3d2d,
  alpha: number = 1.0,
): Graphics {
  const graphics = new Graphics();
  const controlOffset = 2;

  // Draw the concave corner triangle to match the cut style
  graphics.moveTo(size, 0); // Start at right edge
  graphics.lineTo(0, 0); // Go to corner
  graphics.lineTo(0, size); // Go down left edge
  // Very deep concave curve back to start
  graphics.quadraticCurveTo(
    controlOffset,
    controlOffset, // Control point very close to corner (2, 2)
    size,
    0, // End point back at right edge
  );
  graphics.fill({ color, alpha });

  return graphics;
}

/**
 * Creates a gem circle with 3D effects
 * - Used to show profile gem slots
 * - Includes highlights, shading, and edge lighting for 3D appearance
 * - Unlit gems are crystal/glass with same highlights but no color
 */
export function createGemCircle(
  radius: number = 10,
  color: number,
  isLit: boolean = true,
): Graphics {
  const graphics = new Graphics();

  // Base gem circle - use muted gray for unlit, full color for lit
  const baseColor = isLit ? color : 0x9eadb5; // Crystalline gray for unlit
  const baseAlpha = isLit ? 1.0 : 0.3; // More transparent for unlit crystal
  graphics.circle(0, 0, radius);
  graphics.fill({ color: baseColor, alpha: baseAlpha });

  // Edge ring - lighter shade around the edge (creates rim lighting)
  graphics.circle(0, 0, radius);
  graphics.fill({ color: 0xffffff, alpha: isLit ? 0.15 : 0.1 });

  // Darker inner shadow for depth
  const shadowOffset = radius * 0.15;
  graphics.ellipse(shadowOffset, shadowOffset, radius * 0.7, radius * 0.7);
  graphics.fill({ color: 0x000000, alpha: 0.2 });

  // Main translucent highlight (large oval) - upper portion
  const highlightY = -radius * 0.3;
  graphics.ellipse(0, highlightY, radius * 0.6, radius * 0.5);
  graphics.fill({ color: 0xffffff, alpha: isLit ? 0.25 : 0.35 }); // Stronger highlight for unlit crystal

  // Secondary highlight (smaller oval) - top edge
  const smallHighlightY = -radius * 0.6;
  graphics.ellipse(0, smallHighlightY, radius * 0.35, radius * 0.25);
  graphics.fill({ color: 0xffffff, alpha: isLit ? 0.5 : 0.6 }); // Stronger highlight for unlit

  // Bright highlight spot (smallest) - top-left
  const spotX = -radius * 0.25;
  const spotY = -radius * 0.55;
  graphics.ellipse(spotX, spotY, radius * 0.2, radius * 0.15);
  graphics.fill({ color: 0xffffff, alpha: 0.8 });

  // Add subtle stroke for unlit gems to define the edge
  if (!isLit) {
    graphics.circle(0, 0, radius);
    graphics.stroke({ width: 1, color: 0xccddee, alpha: 0.4 });
  }

  return graphics;
}

/**
 * Creates a magical glowing gem with pulsing aura
 * - Returns a container with glow layers and the gem
 * - Glow uses a lighter/brighter shade of the gem color
 */
export function createMagicalGem(radius: number, color: number, isLit: boolean = true): Container {
  const container = new Container();

  if (isLit) {
    // Magical glow layers (rendered behind gem) - 3 layers for soft glow
    const glowColor = lightenColor(color, 0.3); // Brighten color for magical glow

    // Outer glow (largest, most transparent) - reduced radius
    const outerGlow = new Graphics();
    outerGlow.circle(0, 0, radius * 1.6);
    outerGlow.fill({ color: glowColor, alpha: 0.15 });
    container.addChild(outerGlow);

    // Middle glow - reduced radius
    const middleGlow = new Graphics();
    middleGlow.circle(0, 0, radius * 1.35);
    middleGlow.fill({ color: glowColor, alpha: 0.22 });
    container.addChild(middleGlow);

    // Inner glow (smallest, most opaque) - reduced radius
    const innerGlow = new Graphics();
    innerGlow.circle(0, 0, radius * 1.15);
    innerGlow.fill({ color: glowColor, alpha: 0.3 });
    container.addChild(innerGlow);
  }

  // Add the gem itself on top of glow
  const gem = createGemCircle(radius, color, isLit);
  container.addChild(gem);

  return container;
}

/**
 * Lightens a hex color by a factor (0 to 1)
 * - Used to create brighter glow colors from gem colors
 */
function lightenColor(color: number, factor: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;

  const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
  const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
  const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

  return (newR << 16) | (newG << 8) | newB;
}

/**
 * Creates a right-leaning parallelogram with rounded corners
 * - Height is 1/2 the rectangle height
 * - Bottom width is 1/2 the rectangle width
 * - Bottom-right corner aligns with 50% of rectangle width
 */
export function createParallelogramShape(
  rectangleWidth: number = 500,
  rectangleHeight: number = 80,
  lean: number = 50,
  cornerRadius: number = 10,
  fillColor: number = 0xff0000,
): Graphics {
  const parallelogramHeight = rectangleHeight / 2; // Half the rectangle height
  const bottomWidth = rectangleWidth / 2; // Bottom width = 1/2 rectangle width

  const graphics = new Graphics();

  // Parallelogram points (clockwise from bottom-left):
  const p1x = 0;
  const p1y = parallelogramHeight;
  const p2x = bottomWidth;
  const p2y = parallelogramHeight;
  const p3x = bottomWidth + lean;
  const p3y = 0;
  const p4x = lean;
  const p4y = 0;

  // Draw parallelogram (poly doesn't support corner radius directly)
  graphics
    .poly([
      { x: p1x, y: p1y },
      { x: p2x, y: p2y },
      { x: p3x, y: p3y },
      { x: p4x, y: p4y },
    ])
    .fill(fillColor);

  return graphics;
}

/**
 * Creates a parallelogram decomposed into geometric shapes
 * - White rectangle in the center
 * - Two yellow right triangles on the sides
 */
export function createDecomposedParallelogram(
  rectangleWidth: number = 500,
  rectangleHeight: number = 80,
  lean: number = 50,
): Graphics {
  const parallelogramHeight = rectangleHeight / 2;
  const bottomWidth = rectangleWidth / 2;

  const graphics = new Graphics();

  // Center white rectangle
  const rectX = lean;
  const rectY = 0;
  const rectWidth = bottomWidth - lean;
  const rectHeight = parallelogramHeight;

  graphics.rect(rectX, rectY, rectWidth, rectHeight).fill(0xffffff);

  // Left yellow triangle (right angle at bottom-left)
  // Points: (0, parallelogramHeight), (lean, parallelogramHeight), (lean, 0)
  graphics
    .poly([
      { x: 0, y: parallelogramHeight },
      { x: lean, y: parallelogramHeight },
      { x: lean, y: 0 },
    ])
    .fill(0xffff00); // Yellow

  // Right yellow triangle (right angle at top-right)
  // Points: (bottomWidth, parallelogramHeight), (bottomWidth + lean, 0), (bottomWidth, 0)
  graphics
    .poly([
      { x: bottomWidth, y: parallelogramHeight },
      { x: bottomWidth + lean, y: 0 },
      { x: bottomWidth, y: 0 },
    ])
    .fill(0xffff00); // Yellow

  return graphics;
}

/**
 * Creates a vertical line at 50% of rectangle width
 */
export function createCenterLine(
  rectangleWidth: number = 500,
  rectangleHeight: number = 80,
): Graphics {
  const graphics = new Graphics();
  const centerX = rectangleWidth / 2;

  // Draw vertical line from top to bottom of rectangle
  graphics
    .moveTo(centerX, 0)
    .lineTo(centerX, rectangleHeight)
    .stroke({ width: 2, color: 0x0000ff }); // Blue line, 2px wide

  return graphics;
}

/**
 * Test manager to display nameplate shape in-game
 */
export class ProfileShapesTestManager {
  private app: Application;
  private container: Container;
  private particlePool: MagicalParticle[] = [];
  private activeParticles: MagicalParticle[] = [];
  private gems: GemData[] = [];
  private profileContainers: ProfileContainerData[] = [];
  private particleContainer: Container;
  private updateBound: (ticker: Ticker) => void;
  private timeAccumulator: number = 0;
  private hoverParticleAccumulator: number = 0;

  private readonly PARTICLE_POOL_SIZE = 200; // Pre-allocate 200 particles

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    setZIndex(this.container, Z_LAYERS.UI);
    this.app.stage.addChild(this.container);

    // Separate container for particles (rendered on top)
    this.particleContainer = new Container();
    setZIndex(this.particleContainer, Z_LAYERS.UI + 1);
    this.app.stage.addChild(this.particleContainer);

    // Pre-create particle pool
    this.initializeParticlePool();

    // Bind update method and add to ticker
    this.updateBound = this.update.bind(this);
    this.app.ticker.add(this.updateBound);
  }

  /**
   * Pre-creates particle pool to avoid constant allocation/deallocation
   */
  private initializeParticlePool(): void {
    for (let i = 0; i < this.PARTICLE_POOL_SIZE; i++) {
      const particleContainer = this.createParticleGraphics();
      particleContainer.visible = false;
      this.particleContainer.addChild(particleContainer);

      this.particlePool.push({
        graphics: particleContainer,
        life: 0,
        velocityX: 0,
        velocityY: 0,
        gemX: 0,
        gemY: 0,
        active: false,
      });
    }
  }

  /**
   * Creates the graphics for a single particle (reusable)
   */
  private createParticleGraphics(): Container {
    const particleContainer = new Container();

    // Base size - will be scaled when spawned
    const baseSize = 1;

    // Base orb
    const particle = new Graphics();
    particle.circle(0, 0, baseSize);
    particle.fill({ color: 0xffffff, alpha: 0.7 });
    particleContainer.addChild(particle);

    // Highlight
    const highlight = new Graphics();
    const highlightOffset = -baseSize * 0.35;
    highlight.ellipse(highlightOffset * 0.3, highlightOffset, baseSize * 0.4, baseSize * 0.3);
    highlight.fill({ color: 0xffffff, alpha: 0.6 });
    particleContainer.addChild(highlight);

    // Bright spot
    const brightSpot = new Graphics();
    brightSpot.circle(highlightOffset * 0.5, highlightOffset * 0.8, baseSize * 0.2);
    brightSpot.fill({ color: 0xffffff, alpha: 0.8 });
    particleContainer.addChild(brightSpot);

    return particleContainer;
  }

  displayTestShapes(): void {
    const startX = 50;
    const startY = 100;
    const rectangleWidth = 500;
    const rectangleHeight = 80;

    // STANDALONE NAMEPLATE at original position
    const standaloneNameplate = createNameplateShape({
      width: rectangleWidth,
      height: rectangleHeight,
    });
    standaloneNameplate.position.set(startX, startY);
    this.container.addChild(standaloneNameplate);

    // Gold gem for standalone nameplate (top-right stub with equal 8px padding on all sides)
    const gemRadius = 12;
    // Stub area: x=300 to x=500 (200px wide), y=0 to y=40 (40px tall)
    // Gem diameter: 24px
    // Equal padding: (40 - 24) / 2 = 8px top/bottom, also 8px right
    const stubPadding = 8;
    const standaloneGoldGem = createMagicalGem(gemRadius, 0xffd700, true);
    const goldGemX = startX + rectangleWidth - stubPadding - gemRadius; // 8px from right edge (480)
    const goldGemY = startY + stubPadding + gemRadius; // 8px from top edge (20)
    standaloneGoldGem.position.set(goldGemX, goldGemY);
    this.container.addChild(standaloneGoldGem);
    this.registerGem(standaloneGoldGem, 0xffd700, gemRadius, true);

    // NAMEPLATE + ATTACHMENT moved down 100px
    const offsetY = 100;

    // NAMEPLATE shape (rendered first - in background)
    const nameplate = createNameplateShape({ width: rectangleWidth, height: rectangleHeight });
    nameplate.position.set(startX, startY + offsetY);
    this.container.addChild(nameplate);

    // Ruby gem for simple attachment nameplate (standard gem position)
    const rubyGemNameplate = createMagicalGem(gemRadius, 0xe0115f, true);
    const rubyGemX = startX + rectangleWidth - stubPadding - gemRadius; // 8px from right edge (480)
    const rubyGemY = startY + offsetY + stubPadding + gemRadius; // 8px from top edge (20)
    rubyGemNameplate.position.set(rubyGemX, rubyGemY);
    this.container.addChild(rubyGemNameplate);
    this.registerGem(rubyGemNameplate, 0xe0115f, gemRadius, true);

    // ATTACHMENT - positioned to overlap 50% with nameplate (rendered second - in foreground)
    const attachment = createMirroredNameplateShape({
      width: rectangleWidth,
      height: rectangleHeight,
    });
    const attachmentX = startX + rectangleWidth * 0.5;
    attachment.position.set(attachmentX, startY + offsetY); // Overlap by 50%
    this.container.addChild(attachment);

    // CONCAVE CORNER DECORATION - "attachment for the attachment"
    // Positioned at the right edge of the rectangular cut, hugging from outside
    const cornerSize = 15;
    const rectCutWidth = rectangleWidth * 0.52; // 260px - matches the rectangular cut width
    const concaveCorner = createConcaveCornerShape(cornerSize, 0x1a3d2d, 1.0); // Dark green, full opacity
    concaveCorner.scale.x = -1; // Flip on y-axis
    concaveCorner.position.set(attachmentX + rectCutWidth, startY + offsetY); // At right edge of rect cut
    this.container.addChild(concaveCorner);

    // EXTENDED ATTACHMENT TEMPLATE (nameplate + extended attachment) - equal spacing
    const extendedOffsetY = offsetY * 2; // Same spacing as between first two templates

    // Nameplate for extended template
    const extendedNameplate = createNameplateShape({
      width: rectangleWidth,
      height: rectangleHeight,
    });
    extendedNameplate.position.set(startX, startY + extendedOffsetY);
    this.container.addChild(extendedNameplate);

    // Sapphire gem for extended attachment nameplate (standard gem position)
    const sapphireGemNameplate = createMagicalGem(gemRadius, 0x0f52ba, true);
    const sapphireGemX = startX + rectangleWidth - stubPadding - gemRadius; // 8px from right edge (480)
    const sapphireGemY = startY + extendedOffsetY + stubPadding + gemRadius; // 8px from top edge (20)
    sapphireGemNameplate.position.set(sapphireGemX, sapphireGemY);
    this.container.addChild(sapphireGemNameplate);
    this.registerGem(sapphireGemNameplate, 0x0f52ba, gemRadius, true);

    // Extended attachment
    const extendedAttachment = createExtendedAttachmentShape({
      width: rectangleWidth,
      height: rectangleHeight,
    });
    extendedAttachment.position.set(attachmentX, startY + extendedOffsetY);
    this.container.addChild(extendedAttachment);

    // Concave corner for extended attachment
    const extendedConcaveCorner = createConcaveCornerShape(cornerSize, 0x1a3d2d, 1.0); // Dark green, full opacity
    extendedConcaveCorner.scale.x = -1;
    extendedConcaveCorner.position.set(attachmentX + rectCutWidth, startY + extendedOffsetY);
    this.container.addChild(extendedConcaveCorner);

    // GEM CIRCLES for attachments (2 unlit gems at same y-axis as nameplate gem)
    // Position in the uncut area, 8px from the concave corner (left edge of uncut area)
    const unlitGemX = attachmentX + rectCutWidth + stubPadding + gemRadius; // 8px from left edge of uncut area (280)

    // First unlit gem (simple attachment - will glow ruby on hover)
    const unlitGem1 = createMagicalGem(gemRadius, 0x000000, false);
    unlitGem1.position.set(unlitGemX, startY + offsetY + stubPadding + gemRadius); // Same y as nameplate gem (20)
    this.container.addChild(unlitGem1);
    this.registerGem(unlitGem1, 0xe0115f, gemRadius, false); // Ruby color for hover

    // Second unlit gem (extended attachment - will glow sapphire on hover)
    const unlitGem2 = createMagicalGem(gemRadius, 0x000000, false);
    unlitGem2.position.set(unlitGemX, startY + extendedOffsetY + stubPadding + gemRadius); // Same y as nameplate gem (20)
    this.container.addChild(unlitGem2);
    this.registerGem(unlitGem2, 0x0f52ba, gemRadius, false); // Sapphire color for hover

    // LARGE TEST GEM - For experimenting with 3D effects and magical particles
    const testGemRadius = 50;
    const testGemY = startY + extendedOffsetY + 450; // Below all templates

    // Test Gold gem
    const testGoldGem = createMagicalGem(testGemRadius, 0xffd700, true);
    testGoldGem.position.set(150, testGemY);
    this.container.addChild(testGoldGem);
    this.registerGem(testGoldGem, 0xffd700, testGemRadius, true);

    // Test Ruby gem
    const testRubyGem = createMagicalGem(testGemRadius, 0xe0115f, true);
    testRubyGem.position.set(300, testGemY);
    this.container.addChild(testRubyGem);
    this.registerGem(testRubyGem, 0xe0115f, testGemRadius, true);

    // Test Sapphire gem
    const testSapphireGem = createMagicalGem(testGemRadius, 0x0f52ba, true);
    testSapphireGem.position.set(450, testGemY);
    this.container.addChild(testSapphireGem);
    this.registerGem(testSapphireGem, 0x0f52ba, testGemRadius, true);

    // Test Unlit gem (will glow gold on hover for testing)
    const testUnlitGem = createMagicalGem(testGemRadius, 0x000000, false);
    testUnlitGem.position.set(600, testGemY);
    this.container.addChild(testUnlitGem);
    this.registerGem(testUnlitGem, 0xffd700, testGemRadius, false); // Gold for hover testing
  }

  /**
   * Registers a gem with hover interactions
   */
  private registerGem(
    gemContainer: Container,
    color: number,
    radius: number,
    isLit: boolean,
  ): void {
    const gemData: GemData = {
      container: gemContainer,
      color,
      radius,
      isLit,
      isHovered: false,
    };

    // Make gem interactive
    gemContainer.eventMode = 'static';
    gemContainer.cursor = 'pointer';

    // Create hover glow for unlit gems (pre-create and add, start at alpha 0)
    if (!isLit) {
      const hoverGlow = new Container();
      const glowColor = lightenColor(color, 0.3);

      // Stronger glow layers for unlit gems on hover
      const outerGlow = new Graphics();
      outerGlow.circle(0, 0, radius * 1.4);
      outerGlow.fill({ color: glowColor, alpha: 0.18 }); // Tripled from 0.06
      hoverGlow.addChild(outerGlow);

      const middleGlow = new Graphics();
      middleGlow.circle(0, 0, radius * 1.2);
      middleGlow.fill({ color: glowColor, alpha: 0.3 }); // Tripled from 0.1
      hoverGlow.addChild(middleGlow);

      const innerGlow = new Graphics();
      innerGlow.circle(0, 0, radius * 1.05);
      innerGlow.fill({ color: glowColor, alpha: 0.45 }); // Tripled from 0.15
      hoverGlow.addChild(innerGlow);

      hoverGlow.alpha = 0; // Start invisible
      gemData.hoverGlow = hoverGlow;

      // Pre-add to container but keep invisible
      gemContainer.addChildAt(hoverGlow, 0);
    }

    // Hover events (glow is pre-added, just fade in/out)
    gemContainer.on('pointerenter', () => {
      gemData.isHovered = true;
    });

    gemContainer.on('pointerleave', () => {
      gemData.isHovered = false;
    });

    this.gems.push(gemData);
  }

  /**
   * Spawns a magical particle from a gem using object pool
   */
  private spawnParticle(gemX: number, gemY: number, color: number, radius: number): void {
    // Find inactive particle from pool
    const particle = this.particlePool.find((p) => !p.active);
    if (!particle) return; // Pool exhausted

    // Vary particle size (60% to 100% of base size)
    const baseSizeMultiplier = 0.12;
    const sizeVariation = 0.6 + Math.random() * 0.4;
    const particleSize = radius * baseSizeMultiplier * sizeVariation;

    // Set particle color (first child is the base orb)
    const baseOrb = particle.graphics.children[0] as Graphics;
    baseOrb.tint = lightenColor(color, 0.4);

    // Scale particle to desired size
    particle.graphics.scale.set(particleSize);

    // Random starting position on the gem surface
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * 0.7 + Math.random() * radius * 0.3;
    const startX = gemX + Math.cos(angle) * distance;
    const startY = gemY + Math.sin(angle) * distance;

    particle.graphics.position.set(startX, startY);
    particle.graphics.visible = true;
    particle.graphics.alpha = 0.7;

    // Reset particle data with variable lifespan (20% to 100% of max)
    const lifespanVariation = 0.2 + Math.random() * 0.8;
    particle.life = 1.0 * lifespanVariation;
    particle.velocityX = (Math.random() - 0.5) * 0.3;
    particle.velocityY = -0.5 - Math.random() * 0.5;
    particle.gemX = gemX;
    particle.gemY = gemY;
    particle.active = true;

    this.activeParticles.push(particle);
  }

  /**
   * Updates all magical effects (particles and glow pulsing)
   */
  private update(ticker: Ticker): void {
    const deltaTime = ticker.deltaTime / 60; // Normalize to ~1.0 at 60fps
    const time = Date.now() * 0.001;
    this.timeAccumulator += deltaTime;
    this.hoverParticleAccumulator += deltaTime;

    // Spawn particles from lit gems periodically
    if (this.timeAccumulator > 0.15) {
      // Spawn every ~0.15 seconds
      this.timeAccumulator = 0;

      for (const gem of this.gems) {
        if (!gem.isLit) continue;

        // Spawn 1-2 particles per lit gem
        const particleCount = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < particleCount; i++) {
          this.spawnParticle(gem.container.x, gem.container.y, gem.color, gem.radius);
        }
      }
    }

    // Spawn very few particles from hovered unlit gems
    if (this.hoverParticleAccumulator > 0.8) {
      // Much slower spawn rate
      this.hoverParticleAccumulator = 0;

      for (const gem of this.gems) {
        if (gem.isLit || !gem.isHovered) continue;

        // Very rarely spawn a particle (20% chance)
        if (Math.random() < 0.2) {
          this.spawnParticle(gem.container.x, gem.container.y, gem.color, gem.radius);
        }
      }
    }

    // Update glow effects
    for (const gem of this.gems) {
      if (gem.isLit) {
        // Lit gems - pulse normally, breathe slower on hover
        const pulseSpeed = gem.isHovered ? 1.0 : 2.0; // Slower breathing on hover
        const pulseAmount = gem.isHovered ? 0.25 : 0.15; // Stronger pulse on hover
        const pulse = 1.0 + Math.sin(time * pulseSpeed) * pulseAmount;

        // Pulse the first 3 children (glow layers)
        for (let i = 0; i < 3; i++) {
          const glowLayer = gem.container.children[i];
          if (glowLayer) {
            const baseAlpha = i === 0 ? 0.15 : i === 1 ? 0.22 : 0.3;
            const hoverBoost = gem.isHovered ? 1.8 : 1.0; // Much brighter on hover (was 1.3)
            glowLayer.alpha = baseAlpha * pulse * hoverBoost;
          }
        }

        // Make gem itself slightly brighter on hover
        const gemGraphics = gem.container.children[3]; // 4th child is the gem
        if (gemGraphics) {
          gemGraphics.alpha = gem.isHovered ? 1.0 : 1.0; // Could boost if needed
        }
      } else {
        // Unlit gems - fade in/out hover glow
        if (gem.hoverGlow) {
          const targetAlpha = gem.isHovered ? 1.0 : 0.0;
          const fadeSpeed = 0.08 * deltaTime;
          gem.hoverGlow.alpha += (targetAlpha - gem.hoverGlow.alpha) * fadeSpeed;
        }
      }
    }

    // Update particles using pool
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];

      // Update position
      particle.graphics.x += particle.velocityX;
      particle.graphics.y += particle.velocityY;

      // Decrease life very fast so particles barely travel 10px upward
      particle.life -= 0.12 * deltaTime; // Max ~6-8px travel at 60fps

      // Fade out with smooth curve
      particle.graphics.alpha = Math.max(0, particle.life * 0.7);

      // Deactivate dead particles and return to pool
      if (particle.life <= 0) {
        particle.graphics.visible = false;
        particle.active = false;
        this.activeParticles.splice(i, 1);
      }
    }
  }

  destroy(): void {
    // Remove ticker callback
    this.app.ticker.remove(this.updateBound);

    // Clean up particle pool (particles are already children of particleContainer)
    this.particlePool = [];
    this.activeParticles = [];

    this.particleContainer.removeFromParent();
    this.particleContainer.destroy({ children: true });

    this.container.removeFromParent();
    this.container.destroy({ children: true });
  }
}
