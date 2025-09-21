<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Application, Sprite, Texture, Assets } from 'pixi.js';

  let _canvas: HTMLCanvasElement;
  let app: Application | null = null;
  let spawned = 0;
  let dragonTexture: Texture | null = null;
  let loaded = false;
  let sprites: Sprite[] = [];

  async function loadDragonTexture() {
    try {
      console.log('Starting texture load with Assets system...');

      // Add the texture to the Assets system
      Assets.add({ alias: 'dragon-sheet', src: '/sprites/dragon_fly_128_sheet.svg' });

      // Load the texture
      dragonTexture = await Assets.load('dragon-sheet');

      if (dragonTexture) {
        loaded = true;
        console.log('Dragon texture loaded successfully via Assets:', {
          width: dragonTexture.width,
          height: dragonTexture.height,
        });
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
          loaded = true;
          console.log('Fallback Texture.from loaded:', {
            width: dragonTexture.width,
            height: dragonTexture.height,
          });
        } else {
          console.error('Fallback texture still null:', dragonTexture);
        }
      } catch (fallbackError) {
        console.error('Fallback texture loading also failed:', fallbackError);
      }
    }
  }

  function spawnDragon() {
    console.log('Spawn dragon called:', { loaded, dragonTexture: !!dragonTexture });

    if (!loaded || !dragonTexture || !app) {
      console.log('Cannot spawn dragon - not ready:', {
        loaded,
        textureExists: !!dragonTexture,
        appExists: !!app,
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

    console.log('Dragon spawned successfully, total:', spawned, {
      stageChildren: app.stage.children.length,
      spritePosition: sprite.position,
      spriteVisible: sprite.visible,
      rendererWidth: app.renderer.width,
      rendererHeight: app.renderer.height,
    });
  }

  function recycleAll() {
    if (!app) return;

    for (const sprite of sprites) {
      app.stage.removeChild(sprite);
      sprite.destroy();
    }
    sprites = [];
    spawned = 0;
    console.log('All dragons recycled');
  }

  onMount(async () => {
    console.log('Page mounted, waiting for existing PixiJS app...');

    // Wait a bit for the layout's PixiJS app to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Try to find the existing PixiJS app from the layout
    // The layout should have already created it
    console.log('Looking for existing PixiJS app...');

    // Wait for the texture to load
    await loadDragonTexture();

    // We'll need to get the app reference from the layout somehow
    // For now, let's try a different approach
  });

  onDestroy(() => {
    console.log('Page destroyed');
  });
</script>

<div style="position:absolute; top:0; left:0; z-index:1000; pointer-events:none;">
  <div
    style="position:fixed; right:8px; top:8px; background:rgba(0,0,0,.8); color:#fff; padding:12px; border-radius:8px; font:12px system-ui; min-width:200px; pointer-events:auto;"
  >
    <h3 style="margin:0 0 8px 0; font-size:14px;">Final Dragon Test</h3>

    <div style="margin-bottom:8px;">
      <button on:click={spawnDragon} style="margin:2px; padding:6px 12px; background:#4CAF50;"
        >Spawn Dragon</button
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
      <div style="font-size:10px; color:#888;">
        App: {app ? 'Found' : 'Not found'}
      </div>
    </div>
  </div>
</div>
