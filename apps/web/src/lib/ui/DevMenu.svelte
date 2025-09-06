<script lang="ts">
  import { appFlags } from '$lib/flags/store';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let isVisible = false;
  let menuElement: HTMLElement;

  // Toggle menu visibility
  function toggleMenu() {
    isVisible = !isVisible;
  }

  // Navigate to dev routes
  function navigateTo(path: string) {
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(path);
    isVisible = false; // Close menu after navigation
  }

  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (menuElement && !menuElement.contains(event.target as Node)) {
      isVisible = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

{#if $appFlags.devMenu}
  <div class="dev-menu-container">
    <!-- Dev Menu Toggle Button -->
    <button
      class="dev-menu-toggle"
      on:click={toggleMenu}
      aria-label="Toggle Developer Menu"
      title="Developer Menu (dev flag enabled)"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
      </svg>
    </button>

    <!-- Dev Menu Panel -->
    {#if isVisible}
      <div class="dev-menu-panel" bind:this={menuElement}>
        <div class="dev-menu-header">
          <h3>Developer Tools</h3>
          <button
            class="dev-menu-close"
            on:click={() => (isVisible = false)}
            aria-label="Close menu"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav class="dev-menu-nav">
          <button on:click={() => navigateTo('/dev/pool')} class="dev-menu-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15.5c0-1.5-1.5-3-3-3s-3 1.5-3 3" />
            </svg>
            Pool Inspector
          </button>

          <button on:click={() => navigateTo('/dev/sim')} class="dev-menu-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16 10,8" />
            </svg>
            Simulation
          </button>

          <button on:click={() => navigateTo('/dev/logs')} class="dev-menu-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            Logs Viewer
          </button>
        </nav>

        <div class="dev-menu-footer">
          <small>Dev mode enabled</small>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .dev-menu-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }

  .dev-menu-toggle {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    padding: 8px;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
  }

  .dev-menu-toggle:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  .dev-menu-toggle:active {
    transform: scale(0.95);
  }

  .dev-menu-panel {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 16px;
    min-width: 200px;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .dev-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dev-menu-header h3 {
    margin: 0;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }

  .dev-menu-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .dev-menu-close:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .dev-menu-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dev-menu-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-size: 13px;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }

  .dev-menu-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(2px);
  }

  .dev-menu-footer {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
  }

  .dev-menu-footer small {
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dev-menu-container {
      top: 10px;
      right: 10px;
    }

    .dev-menu-panel {
      min-width: 180px;
      padding: 12px;
    }
  }
</style>
