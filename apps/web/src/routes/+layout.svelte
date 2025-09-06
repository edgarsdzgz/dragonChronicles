<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { mountPixi } from '$lib/pixi/app';
  import { hudEnabled } from '$lib/flags/store';
  import UpdateToast from '$lib/pwa/UpdateToast.svelte';
  import InstallPrompt from '$lib/pwa/InstallPrompt.svelte';
  import DevMenu from '$lib/ui/DevMenu.svelte';

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

<!-- PWA Update Toast -->
<UpdateToast />

<!-- PWA Install Prompt -->
<InstallPrompt />

<!-- Developer Menu -->
<DevMenu />

<slot />
