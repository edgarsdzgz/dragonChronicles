<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Application, Graphics } from 'pixi.js';
  import { createSpritePool } from '$lib/pool/displayPool';

  let canvas: HTMLCanvasElement;
  let app: Application;
  let spawned = 0;
  const pool = createSpritePool(undefined, 200);

  function spawn(n: number) {
    for (let i = 0; i < n; i++) {
      const g = new Graphics().circle(Math.random() * 6 + 2).fill(0xffffff * Math.random());
      const sprite = pool.acquire();
      sprite.visible = true;
      sprite.position.set(Math.random() * app.renderer.width, Math.random() * app.renderer.height);
      sprite.texture = app.renderer.generateTexture(g);
      app.stage.addChild(sprite);
      spawned++;
    }
  }

  function recycleAll() {
    // remove all children and return to pool
    for (const c of [...app.stage.children]) {
      if ('texture' in c) pool.release(c as any);
      app.stage.removeChild(c);
    }
    spawned = 0;
  }

  onMount(async () => {
    app = new Application({ view: canvas, backgroundAlpha: 0 });
    await app.init({ resizeTo: canvas.parentElement ?? window });
  });

  onDestroy(() => app?.destroy(true, { children: true }));
</script>

<div style="position:fixed; inset:0;">
  <canvas bind:this={canvas} style="width:100%; height:100%; display:block;"></canvas>
  <div
    style="position:absolute; right:8px; top:8px; background:rgba(0,0,0,.6); color:#fff; padding:8px; border-radius:6px; font:12px system-ui;"
  >
    <button on:click={() => spawn(100)} style="margin-right:6px;">Spawn 100</button>
    <button on:click={() => spawn(1000)} style="margin-right:6px;">Spawn 1000</button>
    <button on:click={recycleAll}>Recycle All</button>
    <div>Spawned: {spawned}</div>
    <div>Pool: {pool.size()} total, {pool.inUse()} in use</div>
  </div>
</div>
