<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { mountPixi } from '$lib/pixi/app';
  import { hudEnabled } from '$lib/stores/flags';

  let canvas: HTMLCanvasElement;
  let handle: Awaited<ReturnType<typeof mountPixi>> | null = null;

  onMount(async () => {
    handle = await mountPixi(canvas);
  });
  
  onDestroy(() => handle?.destroy());
</script>

<div style="position:fixed; inset:0; overflow:hidden;">
  <canvas bind:this={canvas} style="width:100%; height:100%; display:block;"></canvas>
  {#if $hudEnabled}
    <slot name="hud" />
  {/if}
</div>

<slot />