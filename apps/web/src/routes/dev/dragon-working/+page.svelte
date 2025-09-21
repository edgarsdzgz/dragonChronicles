<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Application, Sprite, Texture, Assets, Rectangle } from 'pixi.js';

  let canvas: HTMLCanvasElement;
  let app: Application;
  let spawned = 0;
  let dragonTexture: Texture | null = null;
  let dragonFrames: Texture[] = [];
  let loaded = false;
  let sprites: Sprite[] = [];
  let animatedSprites: Sprite[] = [];
  let animationInterval: ReturnType<typeof setInterval> | null = null;
  let currentFrame = 0;

  async function loadDragonTexture() {
    try {
      console.log('Starting texture load with Assets system...');

      // Add the texture to the Assets system
      Assets.add({ alias: 'dragon-sheet', src: '/sprites/dragon_fly_128_sheet.svg' });

      // Load the texture
      dragonTexture = await Assets.load('dragon-sheet');

      if (dragonTexture) {
        console.log('Dragon texture loaded successfully via Assets:', {
          width: dragonTexture.width,
          height: dragonTexture.height,
        });

        // Create individual frame textures from the sprite sheet
        await createDragonFrames();
        loaded = true;
      } else {
        console.error('Texture loaded but null:', dragonTexture);
      }
    } catch (error) {
      console.error('Failed to load dragon texture via Assets:', error);

      // Fallback: try direct Texture.from
      try {
        console.log('Trying fallback Texture.from...');
        dragonTexture = Texture.from('/sprites/dragon_fly_128_sheet.svg');

        // Wait a bit for the texture to load
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (dragonTexture) {
          console.log('Fallback Texture.from loaded:', {
            width: dragonTexture.width,
            height: dragonTexture.height,
          });

          // Create individual frame textures from the sprite sheet
          await createDragonFrames();
          loaded = true;
        } else {
          console.error('Fallback texture still null:', dragonTexture);
        }
      } catch (fallbackError) {
        console.error('Fallback texture loading also failed:', fallbackError);
      }
    }
  }

  async function createDragonFrames() {
    if (!dragonTexture) return;

    console.log('Creating dragon frame textures...');

    // Your sprite sheet is 256x256 with 4 frames in a 2x2 grid
    // Each frame is 128x128
    const frameWidth = 128;
    const frameHeight = 128;
    const cols = 2;
    const rows = 2;

    dragonFrames = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * frameWidth;
        const y = row * frameHeight;

        // Create a texture for each frame
        const frameTexture = new Texture({
          source: dragonTexture.source,
          frame: new Rectangle(x, y, frameWidth, frameHeight),
        });

        dragonFrames.push(frameTexture);
        console.log(`Created frame ${dragonFrames.length}: ${row},${col} at ${x},${y}`);
      }
    }

    console.log(`Created ${dragonFrames.length} dragon frames`);
  }

  function spawnAnimatedDragon() {
    console.log('Spawn animated dragon called:', { loaded, frames: dragonFrames.length });

    if (!loaded || dragonFrames.length === 0 || !app) {
      console.log('Cannot spawn animated dragon - not ready:', {
        loaded,
        framesCount: dragonFrames.length,
        appExists: !!app,
      });
      return;
    }

    // Use the first frame to create the sprite
    const sprite = new Sprite(dragonFrames[0]);
    sprite.visible = true;
    sprite.position.set(
      Math.random() * (app.renderer.width - 128),
      Math.random() * (app.renderer.height - 128),
    );
    sprite.scale.set(0.5);
    sprite.anchor.set(0.5);

    console.log('Adding animated sprite to stage:', {
      sprite,
      position: sprite.position,
      visible: sprite.visible,
      stageChildren: app.stage.children.length,
    });

    app.stage.addChild(sprite);
    animatedSprites.push(sprite);
    spawned++;

    // Force a render to make sure the sprite appears
    app.renderer.render(app.stage);

    console.log('Animated dragon spawned successfully, total:', spawned, {
      stageChildren: app.stage.children.length,
      animatedSprites: animatedSprites.length,
    });
  }

  function startAnimation() {
    if (animationInterval) {
      console.log('Animation already running');
      return;
    }

    if (dragonFrames.length === 0) {
      console.log('No frames available for animation');
      return;
    }

    console.log('Starting dragon animation at 2 FPS...');

    // 2 frames per second = 500ms per frame
    animationInterval = setInterval(() => {
      currentFrame = (currentFrame + 1) % dragonFrames.length;

      // Update all animated sprites
      const frameTexture = dragonFrames[currentFrame];
      if (frameTexture) {
        for (const sprite of animatedSprites) {
          sprite.texture = frameTexture;
        }
      }

      // Force render
      if (app) {
        app.renderer.render(app.stage);
      }

      console.log(`Animation frame: ${currentFrame + 1}/${dragonFrames.length}`);
    }, 500);
  }

  function stopAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
      console.log('Animation stopped');
    }
  }

  function spawnDragon() {
    console.log('Spawn dragon called:', { loaded, dragonTexture: !!dragonTexture });

    if (!loaded || !dragonTexture) {
      console.log('Cannot spawn dragon - texture not ready:', {
        loaded,
        textureExists: !!dragonTexture,
      });
      return;
    }

    const sprite = new Sprite(dragonTexture);
    sprite.visible = true;
    sprite.position.set(
      Math.random() * (app.renderer.width - 128),
      Math.random() * (app.renderer.height - 128),
    );
    sprite.scale.set(0.5);
    sprite.anchor.set(0.5);

    console.log('Adding sprite to stage:', {
      sprite,
      position: sprite.position,
      visible: sprite.visible,
      stageChildren: app.stage.children.length,
      stage: app.stage,
    });

    app.stage.addChild(sprite);
    sprites.push(sprite);
    spawned++;

    // Force a render to make sure the sprite appears (since ticker is stopped)
    app.renderer.render(app.stage);

    console.log('Dragon spawned successfully, total:', spawned, {
      stageChildren: app.stage.children.length,
      spritePosition: sprite.position,
      spriteVisible: sprite.visible,
      rendererWidth: app.renderer.width,
      rendererHeight: app.renderer.height,
    });
  }

  function recycleAll() {
    // Stop animation
    stopAnimation();

    // Remove all static sprites
    for (const sprite of sprites) {
      app.stage.removeChild(sprite);
      sprite.destroy();
    }
    sprites = [];

    // Remove all animated sprites
    for (const sprite of animatedSprites) {
      app.stage.removeChild(sprite);
      sprite.destroy();
    }
    animatedSprites = [];

    spawned = 0;
    currentFrame = 0;
    console.log('All dragons recycled');
  }

  onMount(async () => {
    console.log('Mounting PixiJS app...');

    // Wait for the layout's PixiJS app to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Try to access the global PixiJS app that the layout created
    // Since we can't easily access it, let's create our own but without ticker conflicts
    try {
      app = new Application();
      await app.init({
        view: canvas,
        backgroundAlpha: 0,
        antialias: false,
        resolution: 1,
        autoDensity: true,
      });

      // Stop the ticker to avoid conflicts
      if (app.ticker) {
        app.ticker.stop();
      }

      // Ensure the app is properly sized
      app.renderer.resize(canvas.clientWidth, canvas.clientHeight);

      console.log('PixiJS app initialized:', {
        width: app.renderer.width,
        height: app.renderer.height,
        stage: app.stage,
        tickerRunning: app.ticker?.started,
      });

      await loadDragonTexture();
    } catch (error) {
      console.error('Failed to initialize PixiJS app:', error);
    }
  });

  onDestroy(() => {
    console.log('Destroying PixiJS app...');
    stopAnimation();
    app?.destroy(true, { children: true });
  });
</script>

<div style="position:fixed; inset:0; background: #1a1a2e;">
  <canvas bind:this={canvas} style="width:100%; height:100%; display:block;"></canvas>

  <div
    style="position:absolute; right:8px; top:8px; background:rgba(0,0,0,.8); color:#fff; padding:12px; border-radius:8px; font:12px system-ui; min-width:200px;"
  >
    <h3 style="margin:0 0 8px 0; font-size:14px;">Working Dragon Test</h3>

    <div style="margin-bottom:8px;">
      <button on:click={spawnDragon} style="margin:2px; padding:6px 12px; background:#4CAF50;"
        >Spawn Dragon</button
      >
      <button
        on:click={spawnAnimatedDragon}
        style="margin:2px; padding:6px 12px; background:#2196F3;">Spawn Animated</button
      >
    </div>

    <div style="margin-bottom:8px;">
      <button on:click={startAnimation} style="margin:2px; padding:6px 12px; background:#FF9800;"
        >Start Animation</button
      >
      <button on:click={stopAnimation} style="margin:2px; padding:6px 12px; background:#9C27B0;"
        >Stop Animation</button
      >
    </div>

    <div style="margin-bottom:8px;">
      <button on:click={recycleAll} style="margin:2px; padding:6px 12px; background:#f44336;"
        >Recycle All</button
      >
    </div>

    <div style="border-top:1px solid #444; padding-top:8px; margin-top:8px;">
      <div>Spawned: {spawned}</div>
      <div style="font-size:10px; color:#888;">
        {loaded ? 'Texture loaded ✓' : 'Loading texture...'}
      </div>
      {#if dragonTexture}
        <div style="font-size:10px; color:#888;">
          Texture size: {dragonTexture.width}x{dragonTexture.height}
        </div>
      {/if}
      {#if dragonFrames.length > 0}
        <div style="font-size:10px; color:#888;">
          Frames: {dragonFrames.length} | Current: {currentFrame + 1}
        </div>
      {/if}
      <div style="font-size:10px; color:#888;">
        Animation: {animationInterval ? 'Running' : 'Stopped'}
      </div>
    </div>
  </div>
</div>
