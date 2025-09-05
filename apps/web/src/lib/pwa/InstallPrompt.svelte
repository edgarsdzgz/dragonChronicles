<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getUpdateManager as _getUpdateManager } from './update-manager';

  let deferredPrompt: any = null;
  let showInstallPrompt = false;
  let isInstalled = false;

    onMount(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is already installed
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      isInstalled = true;
    }
  });

  onDestroy(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  });

  function handleBeforeInstallPrompt(event: Event) {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = event;
    
    // Show the install prompt
    showInstallPrompt = true;
  }

  function handleAppInstalled() {
    console.log('PWA was installed');
    isInstalled = true;
    showInstallPrompt = false;
    deferredPrompt = null;
  }

  async function handleInstallClick() {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    showInstallPrompt = false;
  }

  function handleDismiss() {
    showInstallPrompt = false;
  }
</script>

{#if showInstallPrompt && !isInstalled}
  <div class="install-prompt" role="dialog" aria-labelledby="install-title" aria-describedby="install-description">
    <div class="install-prompt__content">
      <div class="install-prompt__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      </div>
      <div class="install-prompt__text">
        <div id="install-title" class="install-prompt__title">Install Draconia Chronicles</div>
        <div id="install-description" class="install-prompt__message">
          Install this app on your device for a better gaming experience with offline play.
        </div>
      </div>
      <div class="install-prompt__actions">
        <button 
          class="install-prompt__button install-prompt__button--primary"
          on:click={handleInstallClick}
          aria-label="Install Draconia Chronicles"
        >
          Install
        </button>
        <button 
          class="install-prompt__button install-prompt__button--secondary"
          on:click={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          Not now
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .install-prompt {
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
    margin: 0 auto;
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(74, 144, 226, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
  }

  .install-prompt__content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }

  .install-prompt__icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: #4a90e2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .install-prompt__text {
    flex: 1;
    min-width: 0;
  }

  .install-prompt__title {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
  }

  .install-prompt__message {
    font-size: 13px;
    color: #cccccc;
    line-height: 1.4;
  }

  .install-prompt__actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .install-prompt__button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .install-prompt__button--primary {
    background: #4a90e2;
    color: #ffffff;
  }

  .install-prompt__button--primary:hover {
    background: #3a7bc8;
  }

  .install-prompt__button--secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #cccccc;
  }

  .install-prompt__button--secondary:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .install-prompt {
      bottom: 10px;
      left: 10px;
      right: 10px;
    }

    .install-prompt__actions {
      flex-direction: column;
    }

    .install-prompt__button {
      width: 100%;
    }
  }
</style>
