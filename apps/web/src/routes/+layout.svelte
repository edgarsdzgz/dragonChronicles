<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { mountPixi } from '$lib/pixi/app';
  import { hudEnabled } from '$lib/flags/store';

  let canvas: HTMLCanvasElement;
  let handle: Awaited<ReturnType<typeof mountPixi>> | null = null;

  // Lazy load PWA components only when needed
  let UpdateToast: any = null;
  let InstallPrompt: any = null;
  let DevMenu: any = null;

  onMount(async () => {
    handle = await mountPixi(canvas);
    
    // Lazy load PWA components
    const [{ default: UpdateToastComponent }, { default: InstallPromptComponent }, { default: DevMenuComponent }] = await Promise.all([
      import('$lib/pwa/UpdateToast.svelte'),
      import('$lib/pwa/InstallPrompt.svelte'),
      import('$lib/ui/DevMenu.svelte')
    ]);
    
    UpdateToast = UpdateToastComponent;
    InstallPrompt = InstallPromptComponent;
    DevMenu = DevMenuComponent;
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
{#if UpdateToast}
  <svelte:component this={UpdateToast} />
{/if}

<!-- PWA Install Prompt -->
{#if InstallPrompt}
  <svelte:component this={InstallPrompt} />
{/if}

<!-- Developer Menu -->
{#if DevMenu}
  <svelte:component this={DevMenu} />
{/if}

<slot />
