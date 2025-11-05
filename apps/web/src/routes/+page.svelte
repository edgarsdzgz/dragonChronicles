<script lang="ts">
  import { onMount } from 'svelte';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used in template (line 11, 28)
  import { hudEnabled, appFlags } from '$lib/flags/store';

  let fps = 0;
  let FpsCounter: any = null;
  let getFlagDisplayName: any = null;

  onMount(async () => {
    // Lazy load HUD components only when HUD is enabled
    if ($hudEnabled) {
      const [{ FpsCounter: FpsCounterClass }, { getFlagDisplayName: getFlagDisplayNameFn }] =
        await Promise.all([import('$lib/pixi/hud'), import('$lib/flags/query')]);

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
    role="status"
    aria-live="polite"
    aria-label="Game Performance Information"
  >
    <div>HUD on — FPS: <span aria-label="Current frames per second">{fps}</span></div>
    {#if import.meta.env.DEV}
      <div style="margin-top:4px; font-size:10px; opacity:0.8;">
        Active flags:
        {#each Object.entries($appFlags) as [key, value] (key)}
          {#if value === true && getFlagDisplayName}
            <span style="color:#4ade80;" aria-label="Active flag: {getFlagDisplayName(key)}"
              >{getFlagDisplayName(key)}</span
            >
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{/if}

<!-- Removed empty HUD Instructions div that was causing the "little black box" -->
