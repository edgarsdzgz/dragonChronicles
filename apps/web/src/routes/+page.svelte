<script>
  import { onMount } from 'svelte';
  import { hudEnabled } from '$lib/stores/flags';
  import { FpsCounter } from '$lib/pixi/hud';

  let fps = 0;

  onMount(() => {
    const c = new FpsCounter();
    const id = setInterval(() => {
      const s = c.sample();
      if (s.fps) fps = Math.round(s.fps);
    }, 250);
    return () => clearInterval(id);
  });
</script>

<svelte:fragment slot="hud">
  <div
    style="position:absolute; top:8px; left:8px; padding:6px 10px; background:rgba(0,0,0,.55); color:#fff; font:12px/1.2 system-ui; border-radius:6px;"
  >
    HUD on — FPS: {fps}
  </div>
</svelte:fragment>

{#if !$hudEnabled}
  <div
    style="position:absolute; top:8px; left:8px; padding:6px; background:#222; color:#fff; font:12px; border-radius:4px;"
  >
    Add <code>?hud=1</code> to URL for FPS HUD
  </div>
{/if}
