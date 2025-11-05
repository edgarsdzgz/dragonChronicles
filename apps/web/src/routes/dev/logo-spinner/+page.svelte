<script lang="ts">
  import { onMount } from 'svelte';
  import { Application, Sprite, Assets, Graphics, FillGradient } from 'pixi.js';

  let canvas: HTMLCanvasElement;
  let app: Application | null = null;
  let logoSprite: Sprite | null = null;
  let backgroundBox: Graphics | null = null;

  onMount(async () => {
    // Create PixiJS application with white background
    app = new Application();
    await app.init({
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xffffff,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Load the Draconia logo
    const texture = await Assets.load('/ui/buttons/menu/logo/draconia_logo_v1.png');
    logoSprite = new Sprite(texture);

    // Position logo in bottom right with padding
    const padding = 60;
    const boxSize = 200; // Size of the rounded square

    logoSprite.anchor.set(0.5, 0.5);
    logoSprite.x = app.screen.width - padding - boxSize / 2;
    logoSprite.y = app.screen.height - padding - boxSize / 2;

    // Scale logo to fit inside the box (with padding)
    const maxLogoSize = boxSize * 0.8; // 80% of box size for padding
    const logoScale = Math.min(
      maxLogoSize / texture.width,
      maxLogoSize / texture.height
    );
    logoSprite.scale.set(logoScale, logoScale);

    // Create rounded square background with gradient
    backgroundBox = new Graphics();
    const cornerRadius = 20;
    const boxX = logoSprite.x - boxSize / 2;
    const boxY = logoSprite.y - boxSize / 2;

    // Dual-gold gradient (PixiJS renders in top-left and bottom-right)
    // We'll rotate the box 90° clockwise to reposition the gold accents
    const gradient = new FillGradient({
      type: 'linear',
      textureSpace: 'local',
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      colorStops: [
        { offset: 0, color: 0xd4af37 },   // Gold at top-left (before rotation)
        { offset: 0.3, color: 0x000000 }, // Quick transition to black
        { offset: 0.7, color: 0x000000 }, // Black dominates middle
        { offset: 1, color: 0xd4af37 },   // Gold at bottom-right (before rotation)
      ],
    });

    // Draw rounded rectangle with gradient at position
    backgroundBox.roundRect(boxX, boxY, boxSize, boxSize, cornerRadius);
    backgroundBox.fill(gradient);
    backgroundBox.alpha = 0.9;

    // Rotate 90 degrees clockwise (Math.PI / 2 radians)
    // Set pivot to center of the box for rotation
    backgroundBox.pivot.set(boxX + boxSize / 2, boxY + boxSize / 2);
    backgroundBox.position.set(boxX + boxSize / 2, boxY + boxSize / 2);
    backgroundBox.rotation = Math.PI / 2;

    app.stage.addChild(backgroundBox);
    app.stage.addChild(logoSprite);

    // Animation loop - create spinning effect
    let elapsed = 0;
    const baseScale = logoScale; // Store the base scale

    app.ticker.add((ticker) => {
      if (!logoSprite) return;

      elapsed += ticker.deltaTime;

      // Spin effect: oscillate width (scaleX) between baseScale and -baseScale
      // This creates a 3D rotation effect around the Y-axis
      // Use sine wave for smooth animation, complete rotation every ~2 seconds
      const rotationSpeed = 0.05; // Adjust for faster/slower spin
      const scaleX = Math.cos(elapsed * rotationSpeed) * baseScale;

      logoSprite.scale.x = scaleX;
      // Keep Y scale constant at base scale for proper spinning effect
      logoSprite.scale.y = baseScale;
    });

    // Handle window resize
    const handleResize = () => {
      if (!app || !logoSprite || !backgroundBox) return;
      app.renderer.resize(window.innerWidth, window.innerHeight);

      // Reposition in bottom right
      const padding = 60;
      const boxSize = 200;
      const cornerRadius = 20;

      logoSprite.x = app.screen.width - padding - boxSize / 2;
      logoSprite.y = app.screen.height - padding - boxSize / 2;

      // Recalculate logo scale to fit inside box
      const maxLogoSize = boxSize * 0.8;
      const logoScale = Math.min(
        maxLogoSize / logoSprite.texture.width,
        maxLogoSize / logoSprite.texture.height
      );
      logoSprite.scale.set(logoScale, logoScale);

      // Redraw background box at new position
      const boxX = logoSprite.x - boxSize / 2;
      const boxY = logoSprite.y - boxSize / 2;

      // Recreate dual-gold gradient (rotated 90° clockwise after creation)
      const gradient = new FillGradient({
        type: 'linear',
        textureSpace: 'local',
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        colorStops: [
          { offset: 0, color: 0xd4af37 },
          { offset: 0.3, color: 0x000000 },
          { offset: 0.7, color: 0x000000 },
          { offset: 1, color: 0xd4af37 },
        ],
      });

      backgroundBox.clear();
      backgroundBox.roundRect(boxX, boxY, boxSize, boxSize, cornerRadius);
      backgroundBox.fill(gradient);
      backgroundBox.alpha = 0.9;

      // Reapply rotation after redraw
      backgroundBox.pivot.set(boxX + boxSize / 2, boxY + boxSize / 2);
      backgroundBox.position.set(boxX + boxSize / 2, boxY + boxSize / 2);
      backgroundBox.rotation = Math.PI / 2;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app?.destroy(true, { children: true });
    };
  });
</script>

<svelte:head>
  <title>Logo Spinner Test - Draconia Chronicles</title>
</svelte:head>

<div class="logo-spinner-container">
  <canvas bind:this={canvas}></canvas>
  <div class="info-panel">
    <h1>Draconia Logo Spinner Test</h1>
    <p>3D rotation effect created by oscillating width (scaleX)</p>
    <p>Bottom-right position with rotated gradient box (90° clockwise)</p>
    <p>Gold accents in bottom-left & top-right via rotation workaround</p>
    <p>Opacity: 0.9 | Logo scaled to fit inside 200px box</p>
  </div>
</div>

<style>
  .logo-spinner-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #fff;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .info-panel {
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-family: 'Cinzel', serif;
    background: rgba(0, 0, 0, 0.7);
    padding: 20px;
    border-radius: 8px;
    border: 2px solid #b8860b;
  }

  .info-panel h1 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #b8860b;
  }

  .info-panel p {
    margin: 5px 0;
    font-size: 14px;
  }
</style>
