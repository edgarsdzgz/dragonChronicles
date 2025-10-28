/**
 * Game Start Manager
 *
 * Handles the initial game start sequence: splash screen -> journey systems.
 * This provides clean separation between game start and journey/combat systems.
 */

import { type Application } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { SplashScreenManager } from './splash-screen';
import { ProfileSelectionManager } from './profile-selection-manager';
import { ProfileNameEntryManager } from './profile-name-entry';
import { DraconiaMenuManager } from './draconia-menu';
import { MigrationAdapter } from './migration-adapter';
import { LandManager } from './land-manager';
import { EntityManager } from './entity-manager';
import { HPBarDesignTest } from './hp-bar-design-test';
import { UIManager } from './ui-manager';
import { JourneyProgressionManager } from './journey-progression-manager';
import { TakeoffCutsceneManager } from './takeoff-cutscene';
import { profileRepo } from '@draconia/db';

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
  skipProfiles?: boolean; // Skip profile selection and go straight to Draconia
}

export interface GameStartState {
  isInitialized: boolean;
  isShowingSplash: boolean;
  isShowingProfileSelection: boolean;
  isShowingNameEntry: boolean;
  isShowingDraconiaMenu: boolean;
  isJourneyStarted: boolean;
  currentPhase: 'splash' | 'profile-selection' | 'name-entry' | 'draconia' | 'journey' | 'complete';
  selectedProfileId?: string;
  selectedSlotNumber?: 1 | 2 | 3;
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
  private profileSelectionManager: ProfileSelectionManager | null = null;
  private profileNameEntryManager: ProfileNameEntryManager | null = null;
  private draconiaMenuManager: DraconiaMenuManager | null = null;
  private migrationAdapter: MigrationAdapter | null = null;
  private landManager: LandManager | null = null;
  private entityManager: EntityManager | null = null;
  private hpBarTest: HPBarDesignTest | null = null;
  private uiManager: UIManager | null = null;
  private journeyProgressionManager: JourneyProgressionManager | null = null;
  private takeoffCutsceneManager: TakeoffCutsceneManager | null = null;

  // Journey system state
  private isJourneyActive = false;
  private currentSpeed = 0;
  private lastTime = 0;
  private animationFrameId: number | null = null;

  // Callbacks
  private onJourneyStartCallback: (() => void) | null = null;
  private onGameStartCallback: (() => void) | null = null;

  constructor(app: Application, assetManager: AssetManager, config: GameStartConfig = {}) {
    this.app = app;
    this.assetManager = assetManager;
    this.config = {
      showSplashScreen: true,
      splashScreenConfig: {
        backgroundColor: 0x0d4f3c, // Draconia green background
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
        onJourneyStart: () => this.startJourney(),
      },
      autoStartJourney: false,
      ...config,
    };

    this.state = {
      isInitialized: false,
      isShowingSplash: false,
      isShowingProfileSelection: false,
      isShowingNameEntry: false,
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

      // Initialize migration adapter early so all managers can access shared systems
      if (!this.migrationAdapter) {
        this.migrationAdapter = new MigrationAdapter(this.app, {
          enableNewSystems: true,
          enableBackgroundRenderer: false,
          enableHealthBarManager: true,
          enableFloatingDamage: true,
          enableLayerManager: true,
          debugMode: true,
        });
      }

      // Get responsive manager for use by all managers
      const responsiveManager = this.migrationAdapter.getResponsiveManager();

      // Initialize profile managers (always available)
      this.profileSelectionManager = new ProfileSelectionManager(this.app, responsiveManager, {
        onProfileSelected: (profileId, slotNumber) => this.onProfileSelected(profileId, slotNumber),
        onNewProfile: (slotNumber) => this.onNewProfile(slotNumber),
        onCopy: () => console.log('Copy profile (not yet implemented)'),
        onErase: () => console.log('Erase profile (not yet implemented)'),
        onOptions: () => console.log('Options (not yet implemented)'),
        onCancel: () => console.log('Cancel (not yet implemented)'),
        onTestJourney: () => this.onTestJourney(),
      });

      this.profileNameEntryManager = new ProfileNameEntryManager(this.app, responsiveManager, {
        onNameConfirmed: (name, slotNumber) => this.onNameConfirmed(name, slotNumber),
        onCancel: () => this.onNameEntryCancel(),
      });

      // Create splash screen if enabled
      if (this.config.showSplashScreen) {
        this.splashScreenManager = new SplashScreenManager(
          this.app,
          this.assetManager,
          responsiveManager,
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

    // Update profile selection if showing
    if (this.state.isShowingProfileSelection && this.profileSelectionManager) {
      this.profileSelectionManager.update(deltaTime);
    }

    // Update profile name entry if showing
    if (this.state.isShowingNameEntry && this.profileNameEntryManager) {
      this.profileNameEntryManager.update(deltaTime);
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
    if (this.state.isJourneyStarted) {
      // Journey systems are self-updating through their own update loops
      // (migrationAdapter, landManager, dragonProtagonist)
    }
  }

  /**
   * Handle splash screen completion
   */
  private async onSplashComplete(): Promise<void> {
    console.log('🎮 Game Start: Splash screen complete');

    this.state.isShowingSplash = false;

    // Skip profiles if configured (for testing)
    if (this.config.skipProfiles) {
      console.log('🧪 Skipping profiles, going to Draconia menu...');
      await this.showDraconiaMenu();
      return;
    }

    // Show profile selection (new flow: Splash → Profile → Draconia → Journey)
    await this.showProfileSelection();
  }

  /**
   * Show profile selection screen
   */
  private async showProfileSelection(): Promise<void> {
    console.log('👤 Game Start: Showing profile selection...');

    if (!this.profileSelectionManager) {
      console.error('❌ Profile selection manager not initialized');
      return;
    }

    await this.profileSelectionManager.show();
    this.state.isShowingProfileSelection = true;
    this.state.currentPhase = 'profile-selection';

    console.log('👤 Game Start: Profile selection shown');
  }

  /**
   * Show Draconia menu
   */
  private async showDraconiaMenu(): Promise<void> {
    console.log('🏰 Game Start: Showing Draconia menu...');

    const responsiveManager = this.migrationAdapter.getResponsiveManager();
    this.draconiaMenuManager = new DraconiaMenuManager(
      this.app,
      this.assetManager,
      responsiveManager,
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
   * Handle profile selection (existing profile selected)
   */
  private async onProfileSelected(profileId: string, slotNumber: 1 | 2 | 3): Promise<void> {
    console.log(`👤 Game Start: Profile selected - ID: ${profileId}, Slot: ${slotNumber}`);

    this.state.isShowingProfileSelection = false;
    this.state.selectedProfileId = profileId;
    this.state.selectedSlotNumber = slotNumber;

    // Hide profile selection
    if (this.profileSelectionManager) {
      this.profileSelectionManager.hide();
    }

    // Load profile from database
    try {
      const profile = await profileRepo.loadProfileBySlot(slotNumber);
      if (profile) {
        console.log(`✅ Profile loaded: ${profile.dragonName} (Ward ${profile.currentWardNumber})`);
        // TODO: Apply profile data to game state (arcana, inventory, progress, etc.)
      }
    } catch (error) {
      console.error('❌ Failed to load profile:', error);
    }

    // Show Draconia menu if enabled
    if (this.config.showDraconiaMenu) {
      await this.showDraconiaMenu();
    } else {
      // Skip Draconia menu, go directly to journey
      await this.startJourney();
    }
  }

  /**
   * Handle new profile selection (empty slot selected)
   */
  private async onNewProfile(slotNumber: 1 | 2 | 3): Promise<void> {
    console.log(`👤 Game Start: New profile selected - Slot: ${slotNumber}`);

    this.state.isShowingProfileSelection = false;
    this.state.selectedSlotNumber = slotNumber;

    // Hide profile selection
    if (this.profileSelectionManager) {
      this.profileSelectionManager.hide();
    }

    // Show name entry screen
    await this.showNameEntry(slotNumber);
  }

  /**
   * Show name entry screen
   */
  private async showNameEntry(slotNumber: 1 | 2 | 3): Promise<void> {
    console.log(`✏️ Game Start: Showing name entry for slot ${slotNumber}...`);

    if (!this.profileNameEntryManager) {
      console.error('❌ Profile name entry manager not initialized');
      return;
    }

    await this.profileNameEntryManager.show(slotNumber);
    this.state.isShowingNameEntry = true;
    this.state.currentPhase = 'name-entry';

    console.log('✏️ Game Start: Name entry shown');
  }

  /**
   * Handle name confirmation (new profile created)
   */
  private async onNameConfirmed(name: string, slotNumber: 1 | 2 | 3): Promise<void> {
    console.log(`✅ Game Start: Name confirmed - "${name}" for slot ${slotNumber}`);

    this.state.isShowingNameEntry = false;

    // Hide name entry
    if (this.profileNameEntryManager) {
      this.profileNameEntryManager.hide();
    }

    // Create new profile in database
    try {
      const profileId = await profileRepo.createProfile(slotNumber, name);
      this.state.selectedProfileId = profileId;
      console.log(`✅ Profile created: ${name} (ID: ${profileId})`);
    } catch (error) {
      console.error('❌ Failed to create profile:', error);
      // On error, go back to profile selection
      await this.showProfileSelection();
      return;
    }

    // Show Draconia menu if enabled
    if (this.config.showDraconiaMenu) {
      await this.showDraconiaMenu();
    } else {
      // Skip Draconia menu, go directly to journey
      await this.startJourney();
    }
  }

  /**
   * Handle name entry cancel (back to profile selection)
   */
  private async onNameEntryCancel(): Promise<void> {
    console.log('❌ Game Start: Name entry cancelled');

    this.state.isShowingNameEntry = false;

    // Hide name entry
    if (this.profileNameEntryManager) {
      this.profileNameEntryManager.hide();
    }

    // Show profile selection again
    await this.showProfileSelection();
  }

  /**
   * Handle test journey button (skip profile logic, show Draconia)
   */
  private async onTestJourney(): Promise<void> {
    console.log('🧪 TEST: Going to Draconia menu (bypassing profiles)...');

    this.state.isShowingProfileSelection = false;

    // Hide profile selection
    if (this.profileSelectionManager) {
      this.profileSelectionManager.hide();
    }

    // Show Draconia menu
    await this.showDraconiaMenu();
  }

  /**
   * Start the journey systems
   */
  async startJourney(): Promise<void> {
    if (this.state.isJourneyStarted) {
      return;
    }

    try {
      // Migration adapter should already be initialized from initialize()
      // But create it if somehow it's not (defensive programming)
      if (!this.migrationAdapter) {
        this.migrationAdapter = new MigrationAdapter(this.app, {
          enableNewSystems: true,
          enableBackgroundRenderer: false,
          enableHealthBarManager: true,
          enableFloatingDamage: true,
          enableLayerManager: true,
          debugMode: true,
        });
      }

      // Get responsive manager for use by multiple managers
      const responsiveManager = this.migrationAdapter.getResponsiveManager();

      // Initialize land manager (background only)
      this.landManager = new LandManager(this.app, this.assetManager, responsiveManager);
      await this.landManager.loadLand('land1_steppe');
      this.landManager.start();

      // HP Bar Design Test - DISABLED (test complete, using production HP bar now)
      // this.hpBarTest = new HPBarDesignTest(this.app, this.assetManager);
      // await this.hpBarTest.initialize();

      // Initialize Entity Manager
      // HP bars now managed by UIManager (UI elements, not entity logic)
      this.entityManager = new EntityManager(this.app, this.assetManager, responsiveManager);

      // Create dragon protagonist
      // Position and scale are handled internally using game world coordinates
      await this.entityManager.createDragonProtagonist({
        visible: true,
      });

      // Start journey for dragon
      const dragon = this.entityManager.getDragonProtagonist();
      if (dragon) {
        await dragon.enterLand('land1_steppe');
      }

      // Create and start enemy manager
      await this.entityManager.createEnemyManager({
        maxEnemies: 10,
        spawnInterval: 3000, // Spawn every 3 seconds
      });

      const enemyManager = this.entityManager.getEnemyManager();
      if (enemyManager) {
        enemyManager.start(); // Start automatic spawning
      }

      // Initialize UI Manager (journey controls, top bar, HP bars, etc.)
      // UIManager creates and owns HealthBarManager - proper UI hierarchy
      this.uiManager = new UIManager(this.app, this.assetManager, responsiveManager);
      await this.uiManager.initialize();
      this.uiManager.setLandManager(this.landManager); // Connect UI to land manager
      this.uiManager.setDragonProtagonist(dragon!); // Connect UI to dragon for HP bar tracking

      // Create dragon health bar (managed by UI Manager)
      this.uiManager.createDragonHealthBar();

      // Initialize Journey Progression Manager (distance tracking, ward progression)
      this.journeyProgressionManager = new JourneyProgressionManager();
      this.journeyProgressionManager.startJourney();
      this.uiManager.setJourneyProgressionManager(this.journeyProgressionManager); // Connect UI to progression manager

      // Initialize Takeoff Cutscene Manager
      this.takeoffCutsceneManager = new TakeoffCutsceneManager(this.app, responsiveManager);
      this.takeoffCutsceneManager.setDragon(dragon!);
      this.takeoffCutsceneManager.setLandManager(this.landManager);
      this.takeoffCutsceneManager.setTopBarUI(this.uiManager.getTopBarUI());
      this.takeoffCutsceneManager.setJourneyProgression(this.journeyProgressionManager);
      this.takeoffCutsceneManager.setUIManager(this.uiManager);
      this.takeoffCutsceneManager.setEntityManager(this.entityManager);
      // Inject topbar container so cutscene can control zoom/pan
      const topbarContainer = (this.uiManager as any).topbarContainer;
      if (topbarContainer) {
        this.takeoffCutsceneManager.setTopbarContainer(topbarContainer);
      }

      // Start takeoff cutscene BEFORE update loop (so UI/HP bar hide happens first)
      this.takeoffCutsceneManager.start();

      // Start the journey update loop (after cutscene state is set)
      this.startJourneyUpdateLoop();

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
   * Handle window resize for responsive behavior
   */
  handleResize(): void {
    console.log('🎮 Game Start Manager: Handling resize...');

    // Update splash screen if visible
    if (this.splashScreenManager) {
      this.splashScreenManager.handleResize();
    }

    // Update profile selection if visible
    if (this.profileSelectionManager) {
      this.profileSelectionManager.handleResize();
    }

    // Update profile name entry if visible
    if (this.profileNameEntryManager) {
      this.profileNameEntryManager.handleResize();
    }

    // Update Draconia menu if visible
    if (this.draconiaMenuManager) {
      this.draconiaMenuManager.handleResize();
    }

    // Update land manager if active
    if (this.landManager) {
      this.landManager.handleResize();
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

    if (this.profileSelectionManager) {
      this.profileSelectionManager.destroy();
      this.profileSelectionManager = null;
    }

    if (this.profileNameEntryManager) {
      this.profileNameEntryManager.destroy();
      this.profileNameEntryManager = null;
    }

    if (this.draconiaMenuManager) {
      this.draconiaMenuManager.destroy();
      this.draconiaMenuManager = null;
    }

    if (this.hpBarTest) {
      this.hpBarTest.destroy();
      this.hpBarTest = null;
    }

    if (this.entityManager) {
      this.entityManager.destroy();
      this.entityManager = null;
    }

    if (this.landManager) {
      this.landManager.destroy();
      this.landManager = null;
    }

    if (this.uiManager) {
      this.uiManager.destroy();
      this.uiManager = null;
    }

    if (this.journeyProgressionManager) {
      this.journeyProgressionManager.destroy();
      this.journeyProgressionManager = null;
    }

    if (this.migrationAdapter) {
      this.migrationAdapter.destroy();
      this.migrationAdapter = null;
    }

    // Stop the journey update loop
    this.stopJourneyUpdateLoop();

    this.state.isInitialized = false;
    this.state.isShowingSplash = false;
    this.state.isShowingProfileSelection = false;
    this.state.isShowingNameEntry = false;
    this.state.isShowingDraconiaMenu = false;
    this.state.isJourneyStarted = false;
    this.state.currentPhase = 'splash';
    this.state.selectedProfileId = undefined;
    this.state.selectedSlotNumber = undefined;

    console.log('🎮 Game Start: Destroyed');
  }

  /**
   * Start the journey update loop (replaces scrolling-background-phase2 functionality)
   */
  private startJourneyUpdateLoop(): void {
    this.isJourneyActive = true;
    this.lastTime = performance.now();

    const updateLoop = (currentTime: number) => {
      if (!this.isJourneyActive) return;

      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      // Get dragon movement speed for scrolling
      let dragonSpeed = 0;
      if (this.entityManager) {
        const dragon = this.entityManager.getDragonProtagonist();
        if (dragon) {
          dragonSpeed = dragon.getMovementSpeed();
        }
      }

      // Update systems (scroll offset now based on dragon speed)
      if (this.migrationAdapter) {
        this.migrationAdapter.update(deltaTime, currentTime, 0);
      }

      // Update land manager with dragon speed for parallax scrolling
      if (this.landManager) {
        this.landManager.update(deltaTime, dragonSpeed);
      }

      // Update dragon protagonist
      if (this.entityManager) {
        const dragon = this.entityManager.getDragonProtagonist();
        if (dragon) {
          dragon.update(deltaTime);
          // HP bar position is now updated by UIManager.update()
        }
      }

      // Update UI Manager (handles HP bar position updates)
      if (this.uiManager) {
        this.uiManager.update(deltaTime);
      }

      // Update Journey Progression Manager (distance tracking)
      if (this.journeyProgressionManager && this.uiManager && this.landManager) {
        const movementState = this.landManager.getMovementState();
        this.journeyProgressionManager.update(deltaTime, dragonSpeed, movementState);
      }

      // Update HP bar test - DISABLED
      // if (this.hpBarTest) {
      //   this.hpBarTest.update(deltaTime);
      // }

      // Update Takeoff Cutscene (if playing)
      if (this.takeoffCutsceneManager && this.takeoffCutsceneManager.isPlaying()) {
        this.takeoffCutsceneManager.update(deltaTime);
      }

      this.animationFrameId = requestAnimationFrame(updateLoop);
    };

    this.animationFrameId = requestAnimationFrame(updateLoop);
  }

  /**
   * Stop the journey update loop
   */
  private stopJourneyUpdateLoop(): void {
    this.isJourneyActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Set journey speed (from scrolling-background-phase2)
   */
  setJourneySpeed(speed: number): void {
    this.currentSpeed = speed;
  }

  /**
   * Set dragon movement speed (from scrolling-background-phase2)
   */
  setDragonMovementSpeed(_speed: number): void {
    // Dragon movement speed handling - delegate to entity manager
    if (this.entityManager) {
      // This would be implemented in EntityManager
    }
  }

  /**
   * Get dragon instance (from scrolling-background-phase2)
   */
  getDragon(): unknown {
    return this.entityManager?.getDragonProtagonist();
  }

  /**
   * Get dragon animator (from scrolling-background-phase2)
   */
  getDragonAnimator(): unknown {
    return this.entityManager?.getDragonProtagonist()?.getDragonAnimator();
  }

  /**
   * Spawn enemy (from scrolling-background-phase2)
   */
  spawnEnemy(_type: string): void {
    // Enemy spawning disabled in Phase 2 - but method preserved for compatibility
  }

  /**
   * Handle resize (from scrolling-background-phase2)
   */
}
