<script lang="ts">
  import { onMount } from 'svelte';
  import { hudEnabled } from '$lib/flags/store';

  // Lazy load PWA components only when needed
  let UpdateToast: any = null;
  let InstallPrompt: any = null;
  let DevMenu: any = null;

  onMount(async () => {
    // Lazy load PWA components
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
</script>

<svelte:head>
  <title>Draconia Chronicles - Dev Mode</title>
  <meta name="description" content="Draconia Chronicles - Development Mode" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#7e2453" />
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Dev routes don't need the main game canvas -->
<main>
  <slot />
</main>

<!-- PWA Components -->
{#if UpdateToast}
  <UpdateToast />
{/if}

{#if InstallPrompt}
  <InstallPrompt />
{/if}

{#if DevMenu}
  <DevMenu />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Cinzel', serif;
    background-color: #0d4f3c;
    color: white;
    overflow: hidden;
  }

  main {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
</style>
