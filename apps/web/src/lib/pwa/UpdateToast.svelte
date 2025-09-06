<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getUpdateManager, type UpdateInfo } from './update-manager';

  let updateInfo: UpdateInfo = {
    isUpdateAvailable: false,
    isInstalling: false,
    isInstalled: false,
  };

  let isVisible = false;
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const updateManager = getUpdateManager();

    // Subscribe to update events
    unsubscribe = updateManager.onUpdate((info) => {
      updateInfo = info;
      isVisible = info.isUpdateAvailable && !info.isInstalling;
    });

    // Check for updates on mount
    updateManager.checkForUpdates();
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  async function handleUpdate() {
    const updateManager = getUpdateManager();
    await updateManager.applyUpdate();
  }

  function handleDismiss() {
    isVisible = false;
  }
</script>

{#if isVisible}
  <div class="update-toast" role="alert" aria-live="polite">
    <div class="update-toast__content">
      <div class="update-toast__icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div class="update-toast__text">
        <div class="update-toast__title">Update Available</div>
        <div class="update-toast__message">
          A new version of Draconia Chronicles is ready to install.
        </div>
      </div>
      <div class="update-toast__actions">
        <button
          class="update-toast__button update-toast__button--primary"
          on:click={handleUpdate}
          aria-label="Install update"
        >
          Update
        </button>
        <button
          class="update-toast__button update-toast__button--secondary"
          on:click={handleDismiss}
          aria-label="Dismiss update notification"
        >
          Later
        </button>
      </div>
    </div>
  </div>
{/if}

{#if updateInfo.isInstalling}
  <div class="update-toast update-toast--installing" role="status" aria-live="polite">
    <div class="update-toast__content">
      <div class="update-toast__icon">
        <div class="update-toast__spinner"></div>
      </div>
      <div class="update-toast__text">
        <div class="update-toast__title">Installing Update</div>
        <div class="update-toast__message">Please wait while we install the latest version...</div>
      </div>
    </div>
  </div>
{/if}

<style>
  .update-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(74, 144, 226, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  }

  .update-toast--installing {
    border-color: rgba(255, 107, 107, 0.3);
  }

  .update-toast__content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }

  .update-toast__icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: #4a90e2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .update-toast--installing .update-toast__icon {
    color: #ff6b6b;
  }

  .update-toast__spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 107, 107, 0.3);
    border-top: 2px solid #ff6b6b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .update-toast__text {
    flex: 1;
    min-width: 0;
  }

  .update-toast__title {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
  }

  .update-toast__message {
    font-size: 13px;
    color: #cccccc;
    line-height: 1.4;
  }

  .update-toast__actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .update-toast__button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .update-toast__button--primary {
    background: #4a90e2;
    color: #ffffff;
  }

  .update-toast__button--primary:hover {
    background: #3a7bc8;
  }

  .update-toast__button--secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #cccccc;
  }

  .update-toast__button--secondary:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .update-toast {
      top: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }

    .update-toast__actions {
      flex-direction: column;
    }

    .update-toast__button {
      width: 100%;
    }
  }
</style>
