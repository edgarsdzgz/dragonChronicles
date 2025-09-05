/**
 * Update Manager for Draconia Chronicles PWA
 * Handles service worker updates and user notifications
 */

export interface UpdateInfo {
  isUpdateAvailable: boolean;
  isInstalling: boolean;
  isInstalled: boolean;
}

export class UpdateManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private installing = false;
  private installed = false;
  private updateCallbacks: ((_info: UpdateInfo) => void)[] = [];

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      // Register the service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker: Registered successfully');

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Service Worker: Update available');
              this.updateAvailable = true;
              this.notifyCallbacks();
            }
          });
        }
      });

      // Handle service worker controlling
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker: Now controlling');
        this.installed = true;
        this.installing = false;
        this.notifyCallbacks();
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return this.updateAvailable;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }

  /**
   * Apply pending service worker update
   */
  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) {
      return;
    }

    try {
      this.installing = true;
      this.notifyCallbacks();

      // Send skip waiting message to service worker
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Failed to apply update:', error);
      this.installing = false;
      this.notifyCallbacks();
    }
  }

  /**
   * Subscribe to update events
   */
  onUpdate(callback: (_info: UpdateInfo) => void): () => void {
    this.updateCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current update status
   */
  getUpdateInfo(): UpdateInfo {
    return {
      isUpdateAvailable: this.updateAvailable,
      isInstalling: this.installing,
      isInstalled: this.installed,
    };
  }

  /**
   * Check if PWA can be installed
   */
  canInstall(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Install PWA (if supported)
   */
  async install(): Promise<boolean> {
    if (!this.canInstall()) {
      return false;
    }

    try {
      // This would typically be handled by the browser's install prompt
      // For now, we'll just return true if the service worker is registered
      return this.registration !== null;
    } catch (error) {
      console.error('Failed to install PWA:', error);
      return false;
    }
  }

  private notifyCallbacks(): void {
    const info = this.getUpdateInfo();
    this.updateCallbacks.forEach((callback) => callback(info));
  }
}

// Singleton instance
let updateManagerInstance: UpdateManager | null = null;

export function getUpdateManager(): UpdateManager {
  if (!updateManagerInstance) {
    updateManagerInstance = new UpdateManager();
  }
  return updateManagerInstance;
}
