<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { mountPixi } from '$lib/pixi/app';
  import { hudEnabled } from '$lib/flags/store';
  import { initConsoleInterceptor } from '$lib/debug/console-interceptor';

  let canvas: HTMLCanvasElement;
  let handle: Awaited<ReturnType<typeof mountPixi>> | null = null;

  // Lazy load PWA components only when needed
  let UpdateToast: any = null;
  let InstallPrompt: any = null;
  let DevMenu: any = null;

  onMount(async () => {
    // Initialize console interceptor (captures all browser console logs)
    initConsoleInterceptor();

    // Skip game initialization for dev routes
    if ($page.url.pathname.startsWith('/dev/')) {
      console.log('🎯 Main Layout: Skipping game initialization for dev route');
      return;
    }

    handle = await mountPixi(canvas);

    // Lazy load PWA components only for non-dev routes
    const [
      { default: UpdateToastComponent },
      { default: InstallPromptComponent },
      { default: DevMenuComponent },
    ] = await Promise.all([
      import('$lib/pwa/UpdateToast.svelte'),
      import('$lib/pwa/InstallPrompt.svelte'),
      import('$lib/ui/DevMenu.svelte'),
    ]);

    UpdateToast = UpdateToastComponent;
    InstallPrompt = InstallPromptComponent;
    DevMenu = DevMenuComponent;
  });

  onDestroy(() => {
    // Only run in browser (not during SSR)
    if (typeof window === 'undefined') return;
    if (handle?.destroy) {
      handle.destroy();
    }
  });
</script>

{#if !$page.url.pathname.startsWith('/dev/')}
<div
  style="position:fixed; inset:0; overflow:hidden;"
  role="application"
  aria-label="Draconia Chronicles Game Canvas"
>
  <canvas
    bind:this={canvas}
    style="width:100%; height:100%; display:block;"
    aria-label="Draconia Chronicles Game Canvas"
  ></canvas>
  {#if $hudEnabled}
    <slot name="hud" />
  {/if}
</div>
{:else}
<!-- Dev routes render their own content -->
<slot />
{/if}

<!-- PWA Update Toast -->
{#if UpdateToast && !$page.url.pathname.startsWith('/dev/')}
  <svelte:component this={UpdateToast} />
{/if}

<!-- PWA Install Prompt -->
{#if InstallPrompt && !$page.url.pathname.startsWith('/dev/')}
  <svelte:component this={InstallPrompt} />
{/if}

<!-- Developer Menu -->
{#if DevMenu && !$page.url.pathname.startsWith('/dev/')}
  <svelte:component this={DevMenu} />
{/if}
