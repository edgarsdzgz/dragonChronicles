/**
 * Game Start Manager
 *
 * Handles the initial game start sequence: splash screen -> journey systems.
 * This provides clean separation between game start and journey/combat systems.
 */

import { type Application } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { SplashScreenManager } from './splash-screen';
import { DraconiaMenuManager } from './draconia-menu';
import {
  createScrollingBackground,
  type ScrollingBackgroundHandle,
} from '../scrolling-background-phase2';

export interface GameStartConfig {
  showSplashScreen?: boolean;
  splashScreenConfig?: {
    backgroundColor?: number;
    splashImagePath?: string;
    textColor?: number;
    fontSize?: number;
    fontFamily?: string;
  };
  showDraconiaMenu?: boolean;
  draconiaMenuConfig?: {
    backgroundColor?: number;
    textColor?: number;
    fontSize?: number;
    fontFamily?: string;
    buttonColor?: number;
    buttonHoverColor?: number;
    buttonTextColor?: number;
  };
  autoStartJourney?: boolean;
}

export interface GameStartState {
  isInitialized: boolean;
  isShowingSplash: boolean;
  isShowingDraconiaMenu: boolean;
  isJourneyStarted: boolean;
  currentPhase: 'splash' | 'draconia' | 'journey' | 'complete';
}

/**
 * Game Start Manager
 */
export class GameStartManager {
  private app: Application;
  private assetManager: AssetManager;
  private config: GameStartConfig;
  private state: GameStartState;

  // Systems
  private splashScreenManager: SplashScreenManager | null = null;
  private draconiaMenuManager: DraconiaMenuManager | null = null;
  private scrollingBackground: ScrollingBackgroundHandle | null = null;

  // Callbacks
  private onJourneyStartCallback: (() => void) | null = null;
  private onGameStartCallback: (() => void) | null = null;

  constructor(app: Application, assetManager: AssetManager, config: GameStartConfig = {}) {
    this.app = app;
    this.assetManager = assetManager;
    this.config = {
      showSplashScreen: true,
      splashScreenConfig: {
        backgroundColor: 0x7e2453, // Mauve/purple
        splashImagePath: '/ui/buttons/menu/splash/draconia_splash_2.png', // Updated to splash_2
        textColor: 0xffffff,
        fontSize: 32,
        fontFamily: 'Cinzel, serif',
      },
      showDraconiaMenu: true,
      draconiaMenuConfig: {
        backgroundColor: 0x0d4f3c, // Dark green
        textColor: 0xffffff,
        fontSize: 24,
        fontFamily: 'Cinzel, serif',
        buttonColor: 0x2d5a3d,
        buttonHoverColor: 0x4a7c59,
        buttonTextColor: 0xffffff,
      },
      autoStartJourney: false,
      ...config,
    };

    this.state = {
      isInitialized: false,
      isShowingSplash: false,
      isShowingDraconiaMenu: false,
      isJourneyStarted: false,
      currentPhase: 'splash',
    };
  }

  /**
   * Initialize the game start sequence
   */
  async initialize(): Promise<boolean> {
    if (this.state.isInitialized) {
      return true;
    }

    try {
      console.log('🎮 Game Start: Initializing...');

      // Create splash screen if enabled
      if (this.config.showSplashScreen) {
        this.splashScreenManager = new SplashScreenManager(
          this.app,
          this.assetManager,
          this.config.splashScreenConfig,
        );

        await this.splashScreenManager.initialize();
        await this.splashScreenManager.show();
        this.state.isShowingSplash = true;
        this.state.currentPhase = 'splash';

        console.log('🎮 Game Start: Splash screen initialized');
      } else if (this.config.showDraconiaMenu) {
        // Skip splash screen, go directly to Draconia menu
        await this.showDraconiaMenu();
      } else {
        // Skip both, go directly to journey
        await this.startJourney();
      }

      this.state.isInitialized = true;
      console.log('✅ Game Start: Initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Game Start: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Update the game start sequence
   */
  update(deltaTime: number): void {
    if (!this.state.isInitialized) {
      return;
    }

    // Update splash screen if showing
    if (this.state.isShowingSplash && this.splashScreenManager) {
      this.splashScreenManager.update(deltaTime);

      // Check if splash screen is complete
      if (this.splashScreenManager.isComplete()) {
        this.onSplashComplete();
      }
    }

    // Update Draconia menu if showing
    if (this.state.isShowingDraconiaMenu && this.draconiaMenuManager) {
      this.draconiaMenuManager.update(deltaTime);

      // Check if Draconia menu is complete (journey button clicked)
      if (this.draconiaMenuManager.isComplete()) {
        this.onDraconiaMenuComplete();
      }
    }

    // Update journey systems if started
    if (this.state.isJourneyStarted && this.scrollingBackground) {
      // Journey systems are self-updating through their own loops
    }
  }

  /**
   * Handle splash screen completion
   */
  private async onSplashComplete(): Promise<void> {
    console.log('🎮 Game Start: Splash screen complete');

    this.state.isShowingSplash = false;

    // Show Draconia menu if enabled
    if (this.config.showDraconiaMenu) {
      await this.showDraconiaMenu();
    } else {
      // Skip Draconia menu, go directly to journey
      await this.startJourney();
    }
  }

  /**
   * Show Draconia menu
   */
  private async showDraconiaMenu(): Promise<void> {
    console.log('🏰 Game Start: Showing Draconia menu...');

    this.draconiaMenuManager = new DraconiaMenuManager(
      this.app,
      this.assetManager,
      this.config.draconiaMenuConfig,
    );

    await this.draconiaMenuManager.initialize();
    await this.draconiaMenuManager.show();
    this.state.isShowingDraconiaMenu = true;
    this.state.currentPhase = 'draconia';

    console.log('🏰 Game Start: Draconia menu initialized');
  }

  /**
   * Handle Draconia menu completion (journey button clicked)
   */
  private async onDraconiaMenuComplete(): Promise<void> {
    console.log('🏰 Game Start: Draconia menu complete, starting journey...');

    this.state.isShowingDraconiaMenu = false;
    this.state.currentPhase = 'journey';

    // Start journey systems
    await this.startJourney();
  }

  /**
   * Start the journey systems
   */
  async startJourney(): Promise<void> {
    if (this.state.isJourneyStarted) {
      return;
    }

    try {
      console.log('🎮 Game Start: Starting journey systems...');

      // Create scrolling background (journey systems)
      this.scrollingBackground = await createScrollingBackground(this.app, {
        scrollSpeed: 0, // No movement for now
        enabled: true,
      });

      // Start the journey
      await this.scrollingBackground.start();

      this.state.isJourneyStarted = true;
      this.state.currentPhase = 'complete';

      // Call journey start callback
      if (this.onJourneyStartCallback) {
        this.onJourneyStartCallback();
      }

      console.log('✅ Game Start: Journey systems started');
    } catch (error) {
      console.error('❌ Game Start: Failed to start journey:', error);
    }
  }

  /**
   * Set callback for when journey starts
   */
  setOnJourneyStart(callback: () => void): void {
    this.onJourneyStartCallback = callback;
  }

  /**
   * Set callback for when game starts
   */
  setOnGameStart(callback: () => void): void {
    this.onGameStartCallback = callback;
  }

  /**
   * Get current state
   */
  getState(): GameStartState {
    return { ...this.state };
  }

  /**
   * Check if showing splash screen
   */
  isShowingSplash(): boolean {
    return this.state.isShowingSplash;
  }

  /**
   * Check if journey has started
   */
  isJourneyStarted(): boolean {
    return this.state.isJourneyStarted;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): 'splash' | 'draconia' | 'journey' | 'complete' {
    return this.state.currentPhase;
  }

  /**
   * Get scrolling background handle (for external access)
   */
  getScrollingBackground(): ScrollingBackgroundHandle | null {
    return this.scrollingBackground;
  }

  /**
   * Handle window resize for responsive behavior
   */
  handleResize(): void {
    console.log('🎮 Game Start Manager: Handling resize...');

    // Update splash screen if visible
    if (this.splashScreenManager) {
      this.splashScreenManager.handleResize();
    }

    // Update Draconia menu if visible
    if (this.draconiaMenuManager) {
      this.draconiaMenuManager.handleResize();
    }

    console.log('🎮 Game Start Manager: Resize completed');
  }

  /**
   * Destroy the game start manager
   */
  destroy(): void {
    if (this.splashScreenManager) {
      this.splashScreenManager.destroy();
      this.splashScreenManager = null;
    }

    if (this.draconiaMenuManager) {
      this.draconiaMenuManager.destroy();
      this.draconiaMenuManager = null;
    }

    if (this.scrollingBackground) {
      this.scrollingBackground.destroy();
      this.scrollingBackground = null;
    }

    this.state.isInitialized = false;
    this.state.isShowingSplash = false;
    this.state.isShowingDraconiaMenu = false;
    this.state.isJourneyStarted = false;
    this.state.currentPhase = 'splash';

    console.log('🎮 Game Start: Destroyed');
  }
}
