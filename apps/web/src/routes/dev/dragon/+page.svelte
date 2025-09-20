<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Application, Sprite, Texture } from 'pixi.js';
  import { createSpritePool } from '$lib/pool/displayPool';

  let canvas: HTMLCanvasElement;
  let app: Application;
  let spawned = 0;
  let dragonTexture: Texture | null = null;
  let pool = createSpritePool(undefined, 50);
  let loaded = false;

  async function loadDragonTexture() {
    try {
      dragonTexture = Texture.from('/sprites/dragon_fly_128_sheet.svg');
      pool = createSpritePool(dragonTexture, 50);
      loaded = true;
      console.log('Dragon texture loaded successfully');
    } catch (error) {
      console.error('Failed to load dragon texture:', error);
    }
  }

  function spawnDragon() {
    if (!loaded || !dragonTexture) return;
    
    const sprite = pool.acquire();
    sprite.visible = true;
    sprite.position.set(
      Math.random() * (app.renderer.width - 128),
      Math.random() * (app.renderer.height - 128)
    );
    sprite.scale.set(0.5);
    app.stage.addChild(sprite);
    spawned++;
  }

  function recycleAll() {
    for (const child of [...app.stage.children]) {
      if ('texture' in child) {
        pool.release(child as Sprite);
      }
      app.stage.removeChild(child);
    }
    spawned = 0;
  }

  onMount(async () => {
    app = new Application({ view: canvas, backgroundAlpha: 0 });
    await app.init({ resizeTo: canvas.parentElement ?? window });
    await loadDragonTexture();
  });

  onDestroy(() => app?.destroy(true, { children: true }));
</script>

<div style="position:fixed; inset:0; background: #1a1a2e;">
  <canvas bind:this={canvas} style="width:100%; height:100%; display:block;"></canvas>
  
  <div style="position:absolute; right:8px; top:8px; background:rgba(0,0,0,.8); color:#fff; padding:12px; border-radius:8px; font:12px system-ui; min-width:200px;">
    <h3 style="margin:0 0 8px 0; font-size:14px;">Dragon Sprite Test</h3>
    
    <div style="margin-bottom:8px;">
      <button on:click={spawnDragon} style="margin:2px; padding:6px 12px; background:#4CAF50;">Spawn Dragon</button>
    </div>
    
    <div style="margin-bottom:8px;">
      <button on:click={recycleAll} style="margin:2px; padding:6px 12px; background:#f44336;">Recycle All</button>
    </div>
    
    <div style="border-top:1px solid #444; padding-top:8px; margin-top:8px;">
      <div>Spawned: {spawned}</div>
      <div>Pool: {pool.size()} total, {pool.inUse()} in use</div>
      <div style="font-size:10px; color:#888;">
        {loaded ? 'Texture loaded ✓' : 'Loading texture...'}
      </div>
    </div>
  </div>
</div>
