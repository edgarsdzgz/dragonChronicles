<script lang="ts">
  import { onMount } from 'svelte';
  import { hudEnabled, appFlags } from '$lib/flags/store';

  let fps = 0;
  let FpsCounter: any = null;
  let getFlagDisplayName: any = null;

  onMount(async () => {
    // Lazy load HUD components only when HUD is enabled
    if ($hudEnabled) {
      const [{ FpsCounter: FpsCounterClass }, { getFlagDisplayName: getFlagDisplayNameFn }] = await Promise.all([
        import('$lib/pixi/hud'),
        import('$lib/flags/query')
      ]);
      
      FpsCounter = FpsCounterClass;
      getFlagDisplayName = getFlagDisplayNameFn;
      
      const c = new FpsCounter();
      const id = setInterval(() => {
        const s = c.sample();
        if (s.fps) fps = Math.round(s.fps);
      }, 250);
      return () => clearInterval(id);
    }
  });
</script>

{#if $hudEnabled}
  <div
    style="position:absolute; top:8px; left:8px; padding:6px 10px; background:rgba(0,0,0,.55); color:#fff; font:12px/1.2 system-ui; border-radius:6px;"
  >
    <div>HUD on — FPS: {fps}</div>
    {#if import.meta.env.DEV}
      <div style="margin-top:4px; font-size:10px; opacity:0.8;">
        Active flags:
        {#each Object.entries($appFlags) as [key, value] (key)}
          {#if value === true && getFlagDisplayName}
            <span style="color:#4ade80;">{getFlagDisplayName(key)}</span>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{/if}

{#if !$hudEnabled}
  <div
    style="position:absolute; top:8px; left:8px; padding:6px; background:#222; color:#fff; font:12px; border-radius:4px;"
  >
    Add <code>?hud=1</code> to URL for FPS HUD
  </div>
{/if}
