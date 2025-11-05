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
import { ProjectileManager } from './combat/projectile-manager';
import type { DragonCombatState, EnemyCombatState } from './combat/combat-state';
import {
  createDragonCombatState,
  createEnemyCombatState,
  calculateScaledStats,
  calculateRangePixels,
  DEFAULT_COMBAT_CONFIG,
} from './combat/combat-state';
import * as CollisionUtils from './combat/collision-utils';
import * as DamageUtils from './combat/damage-utils';
import { getEventBus, type EventBus, type CombatEvent } from '@draconia/shared';
import { createDefaultArcanaDropManager } from '@draconia/sim';
import { setupArcanaRewardListeners } from './combat/arcana-reward-calculator';
import { setupArcanaEventHandler } from './combat/arcana-event-handler';

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

  // Combat systems (independent managers, no orchestrator)
  private projectileManager: ProjectileManager | null = null;
  private dragonCombatState: DragonCombatState | null = null;
  private enemyCombatStates: Map<number, EnemyCombatState> = new Map();

  // Event system
  private eventBus: EventBus | null = null;
  private arcanaManager: ReturnType<typeof createDefaultArcanaDropManager> | null = null;

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

      // Initialize Event System (before creating managers that need it)
      this.eventBus = getEventBus();
      this.arcanaManager = createDefaultArcanaDropManager();

      // Initialize land manager (background only, with eventBus)
      this.landManager = new LandManager(this.app, this.assetManager, responsiveManager, {
        eventBus: this.eventBus,
      });
      await this.landManager.loadLand('land1_steppe');
      this.landManager.start();

      // HP Bar Design Test - DISABLED (test complete, using production HP bar now)
      // this.hpBarTest = new HPBarDesignTest(this.app, this.assetManager);
      // await this.hpBarTest.initialize();

      // Initialize Entity Manager
      // HP bars now managed by UIManager (UI elements, not entity logic)
      this.entityManager = new EntityManager(this.app, this.assetManager, responsiveManager);

      // Create dragon protagonist (with eventBus)
      // Position and scale are handled internally using game world coordinates
      await this.entityManager.createDragonProtagonist({
        visible: true,
        eventBus: this.eventBus,
      });

      // Start journey for dragon
      const dragon = this.entityManager.getDragonProtagonist();
      if (dragon) {
        await dragon.enterLand('land1_steppe');
      }

      // Create and start enemy manager (with eventBus)
      await this.entityManager.createEnemyManager({
        maxEnemies: 10,
        spawnInterval: 3000, // Spawn every 3 seconds
        eventBus: this.eventBus,
      });

      const enemyManager = this.entityManager.getEnemyManager();
      if (enemyManager) {
        enemyManager.start(); // Start automatic spawning
      }

      // Initialize Combat Systems (independent managers, no orchestrator)
      this.projectileManager = new ProjectileManager(this.app);
      await this.projectileManager.initialize();

      // Create dragon combat state
      this.dragonCombatState = createDragonCombatState(DEFAULT_COMBAT_CONFIG);

      console.log('⚔️ Combat Systems: Initialized (independent architecture)');

      // Initialize UI Manager (journey controls, top bar, HP bars, etc.)
      // UIManager creates and owns HealthBarManager - proper UI hierarchy
      this.uiManager = new UIManager(this.app, this.assetManager, responsiveManager, {
        eventBus: this.eventBus,
      });
      await this.uiManager.initialize();
      this.uiManager.setLandManager(this.landManager); // Connect UI to land manager
      this.uiManager.setDragonProtagonist(dragon!); // Connect UI to dragon for HP bar tracking

      // Create dragon health bar (managed by UI Manager)
      this.uiManager.createDragonHealthBar();

      // Initialize Journey Progression Manager (distance tracking, ward progression)
      this.journeyProgressionManager = new JourneyProgressionManager();
      this.journeyProgressionManager.startJourney();
      this.uiManager.setJourneyProgressionManager(this.journeyProgressionManager); // Connect UI to progression manager

      // Set up arcana reward listeners (eventBus already initialized above)
      setupArcanaRewardListeners(
        this.eventBus,
        this.arcanaManager,
        () => this.journeyProgressionManager?.getDistanceMeters() || 0,
        () => this.journeyProgressionManager?.getCurrentWardNumber() || 1,
      );

      // Set up arcana event handler
      setupArcanaEventHandler(this.eventBus, this.arcanaManager);

      // Listen for arcana_awarded events to update UI
      this.eventBus.on<CombatEvent>('combat', 'arcana_awarded', (event) => {
        const payload = event.payload as { totalBalance: number };
        if (this.uiManager) {
          this.uiManager.updateCurrencies({ arcana: payload.totalBalance });
        }
      });

      // Initialize Takeoff Cutscene Manager
      this.takeoffCutsceneManager = new TakeoffCutsceneManager(this.app, responsiveManager);
      this.takeoffCutsceneManager.setDragon(dragon!);
      this.takeoffCutsceneManager.setLandManager(this.landManager);
      this.takeoffCutsceneManager.setTopBarUI(this.uiManager.getTopBarUI());
      this.takeoffCutsceneManager.setJourneyProgression(this.journeyProgressionManager);
      this.takeoffCutsceneManager.setUIManager(this.uiManager);
      this.takeoffCutsceneManager.setEntityManager(this.entityManager);
      // Inject topbar container so cutscene can control zoom/pan
      const topbarContainer = this.uiManager.getTopbarContainer();
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
   * Update combat systems
   * Demonstrates independent manager architecture - no orchestrator
   * Uses pure utility functions and data passing
   */
  private updateCombat(deltaTime: number, currentTime: number): void {
    if (!this.projectileManager || !this.dragonCombatState || !this.entityManager) {
      return;
    }

    const enemyManager = this.entityManager.getEnemyManager();
    const dragon = this.entityManager.getDragonProtagonist();
    if (!enemyManager || !dragon) return;

    const dragonSprite = dragon.getDragonSprite();
    if (!dragonSprite) return;

    const enemies = enemyManager.getEnemies();
    const currentDistance = this.journeyProgressionManager?.getDistanceMeters() || 0;

    // 1. Update projectiles (independent manager)
    this.projectileManager.update(deltaTime);

    // 2. Update enemy manager (already done by entity manager)
    enemyManager.update(deltaTime);

    // 3. Register new enemies in combat (create combat state using pure functions)
    for (const enemy of enemies) {
      if (!this.enemyCombatStates.has(enemy.id)) {
        // Assign random attack range tier (20%, 25%, or 28%)
        const rangeTiers = [0.20, 0.25, 0.28];
        const attackRangePercent = rangeTiers[Math.floor(Math.random() * rangeTiers.length)];

        // Create enemy combat state using pure function
        const combatState = createEnemyCombatState(attackRangePercent, DEFAULT_COMBAT_CONFIG);
        this.enemyCombatStates.set(enemy.id, combatState);

        // Apply scaled stats using pure function
        const scaledStats = calculateScaledStats(currentDistance, DEFAULT_COMBAT_CONFIG);
        enemy.health = scaledStats.hp;
        enemy.maxHealth = scaledStats.hp;
        enemy.damage = scaledStats.damage;
      }
    }

    // 4. Get alive enemies (shared by both dragon and enemy attacks)
    const aliveEnemies = enemies.filter((e) => {
      const combatState = this.enemyCombatStates.get(e.id);
      return combatState && !combatState.isDefeated;
    });

    // 5. Dragon auto-attack (using pure utility functions)
    if (currentTime - this.dragonCombatState.lastFireTime >= this.dragonCombatState.fireRate) {
      // Find enemies in range using pure function
      const dragonRangePixels = calculateRangePixels(
        this.dragonCombatState.attackRangePercent,
        DEFAULT_COMBAT_CONFIG,
      );

      // Find closest enemy using pure function
      const closestEnemy = CollisionUtils.findClosestSprite(
        dragonSprite,
        aliveEnemies.map((e) => e.sprite),
        dragonRangePixels,
      );

      if (closestEnemy) {
        const targetEnemy = aliveEnemies.find((e) => e.sprite === closestEnemy);
        if (targetEnemy) {
          // Fire projectile with collision callback
          this.projectileManager.fireDragonProjectile(
            dragonSprite.x,
            dragonSprite.y,
            targetEnemy.sprite,
            (projectileSprite) => {
              // Collision callback using pure function
              const isColliding = CollisionUtils.checkCollision(projectileSprite, targetEnemy.sprite);

              if (isColliding) {
                // Apply damage using pure function
                const result = DamageUtils.applyEnemyDamage(
                  targetEnemy.health,
                  this.dragonCombatState!.damage,
                  targetEnemy.maxHealth,
                );

                targetEnemy.health = result.newHealth;

                // Handle death
                if (result.targetDied) {
                  const combatState = this.enemyCombatStates.get(targetEnemy.id);
                  if (combatState) {
                    combatState.isDefeated = true;
                    combatState.deathData = DamageUtils.createDeathData();

                    // Emit enemy_defeated event
                    if (this.eventBus) {
                      this.eventBus.emit<CombatEvent>({
                        category: 'combat',
                        type: 'enemy_defeated',
                        timestamp: Date.now(),
                        source: 'game-start-manager',
                        payload: {
                          enemyId: targetEnemy.id,
                          enemyType: targetEnemy.type,
                          baseArcana: targetEnemy.baseArcana || 0,
                          defeatMethod: 'projectile',
                          position: { x: targetEnemy.x, y: targetEnemy.y },
                          enemy: targetEnemy,
                        },
                      });

                      // Emit death_animation_started event
                      this.eventBus.emit<CombatEvent>({
                        category: 'combat',
                        type: 'death_animation_started',
                        timestamp: Date.now(),
                        source: 'game-start-manager',
                        payload: {
                          enemyId: targetEnemy.id,
                          animationStartTime: combatState.deathData.timestamp,
                          animationDuration: 330,
                        },
                      });
                    }
                  }
                }

                return true; // Collision occurred
              }

              return false; // No collision
            },
          );

          this.dragonCombatState.lastFireTime = currentTime;
        }
      }
    }

    // 6. Enemy auto-attack (using pure utility functions)
    for (const enemy of aliveEnemies) {
      const combatState = this.enemyCombatStates.get(enemy.id);
      if (!combatState || combatState.isDefeated) continue;

      // Calculate enemy attack range and distance to dragon
      const enemyRangePixels = calculateRangePixels(
        combatState.attackRangePercent,
        DEFAULT_COMBAT_CONFIG,
      );
      const distanceToDragon = CollisionUtils.getDistance(enemy.sprite, dragonSprite);

      // Stop enemy movement when in attack range, continue when out of range
      if (distanceToDragon <= enemyRangePixels) {
        enemy.isMoving = false; // Stop moving, start attacking
      } else {
        enemy.isMoving = true; // Keep approaching dragon
      }

      // Check if enemy can fire
      if (currentTime - combatState.lastFireTime >= combatState.fireRate) {
        // Fire only if dragon is in range (already calculated above)
        if (distanceToDragon <= enemyRangePixels) {
          // Enemy is in range, fire projectile at dragon's current position
          this.projectileManager.fireEnemyProjectile(
            enemy.sprite.x,
            enemy.sprite.y,
            dragonSprite.x,
            dragonSprite.y,
            enemy.type,
            (projectileSprite) => {
              // Collision callback for enemy projectile hitting dragon
              const isColliding = CollisionUtils.checkCollision(projectileSprite, dragonSprite);

              if (isColliding && this.dragonCombatState) {
                // Apply damage to dragon using pure function
                const result = DamageUtils.applyDragonDamage(
                  this.dragonCombatState.hp,
                  enemy.damage,
                  this.dragonCombatState.maxHP,
                );

                this.dragonCombatState.hp = result.newHealth;

                // Update dragon HP in dragon protagonist
                dragon.setHealth(result.newHealth);

                // Update HP bar visual
                if (this.uiManager) {
                  this.uiManager.updateDragonHealth(result.newHealth, this.dragonCombatState.maxHP);
                }

                // Handle dragon death
                if (result.targetDied) {
                  this.handleDragonDeath();
                }

                return true; // Collision occurred
              }

              return false; // No collision
            },
          );

          combatState.lastFireTime = currentTime;
        }
      }
    }

    // 7. Check enemy projectile collisions with dragon (for projectiles already in flight)
    const enemyProjectiles = this.projectileManager.getEnemyProjectiles();
    for (const projectileData of enemyProjectiles) {
      if (!projectileData.hasHit && this.dragonCombatState) {
        const isColliding = CollisionUtils.checkCollision(
          projectileData.projectile.getSprite(),
          dragonSprite,
        );

        if (isColliding) {
          // Find which enemy fired this projectile (for damage value)
          // For now, use average enemy damage
          const avgDamage = 2.0; // Base damage, will be scaled

          const result = DamageUtils.applyDragonDamage(
            this.dragonCombatState.hp,
            avgDamage,
            this.dragonCombatState.maxHP,
          );

          this.dragonCombatState.hp = result.newHealth;
          dragon.setHealth(result.newHealth);

          // Update HP bar visual
          if (this.uiManager) {
            this.uiManager.updateDragonHealth(result.newHealth, this.dragonCombatState.maxHP);
          }

          // Mark projectile as hit
          this.projectileManager.markProjectileHit(projectileData);

          // Handle dragon death
          if (result.targetDied) {
            this.handleDragonDeath();
          }
        }
      }
    }

    // 8. Update death animations and remove defeated enemies (using pure functions)
    for (const enemy of enemies) {
      const combatState = this.enemyCombatStates.get(enemy.id);
      if (combatState && combatState.isDefeated && combatState.deathData) {
        const isComplete = DamageUtils.updateDeathAnimation(combatState.deathData, currentTime);

        // Update sprite visibility based on blink state
        enemy.sprite.visible = combatState.deathData.isBlinking;

        // Remove when animation complete
        if (isComplete) {
          enemy.sprite.visible = false;

          // Emit death_animation_complete event
          if (this.eventBus) {
            this.eventBus.emit<CombatEvent>({
              category: 'combat',
              type: 'death_animation_complete',
              timestamp: Date.now(),
              source: 'game-start-manager',
              payload: {
                enemyId: enemy.id,
                enemy: enemy, // Full enemy data for reward calculation
              },
            });
          }

          // EnemyManager will clean up invisible enemies
        }
      }
    }
  }

  /**
   * Handle dragon death (full death sequence)
   */
  private handleDragonDeath(): void {
    if (!this.journeyProgressionManager || !this.dragonCombatState || !this.entityManager) return;

    console.log('💀 Dragon Death: Starting death sequence...');

    // 1. Clear all enemies from the battlefield
    const enemyManager = this.entityManager.getEnemyManager();
    if (enemyManager) {
      const enemyCount = enemyManager.getEnemyCount();
      enemyManager.clearAllEnemies();
      console.log(`💀 Dragon Death: Cleared ${enemyCount} enemies`);
    }

    // 2. Clear all projectiles
    if (this.projectileManager) {
      const projectileCount = this.projectileManager.getProjectileCount();
      this.projectileManager.clearAllProjectiles();
      console.log(`💀 Dragon Death: Cleared ${projectileCount} projectiles`);
    }

    // 3. Clear enemy combat states
    this.enemyCombatStates.clear();

    // 4. TODO: Dragon blink animation (330ms, 3 blinks)
    // For now, skip animation and proceed directly to respawn

    // 5. Get current journey state for pushback calculation
    const currentDistance = this.journeyProgressionManager.getDistanceMeters();
    const currentWard = this.journeyProgressionManager.getCurrentWard();
    const wardStartDistance = currentWard?.distanceFromStart || 0;
    const wardEndDistance = wardStartDistance + 5000; // Ward 1 is 5000m

    // 6. Calculate pushback using pure function
    const deathResult = DamageUtils.calculateDragonPushback(
      currentDistance,
      wardStartDistance,
      wardEndDistance,
    );

    console.log(
      `💀 Dragon Death: Pushback ${deathResult.pushbackDistance.toFixed(2)}m (${currentDistance.toFixed(2)}m → ${deathResult.newDistance.toFixed(2)}m)`,
    );

    // 7. Apply pushback distance
    this.journeyProgressionManager.setState({ distanceTraveledMeters: deathResult.newDistance });

    // 8. Reset dragon HP to full
    this.dragonCombatState.hp = this.dragonCombatState.maxHP;

    const dragon = this.entityManager.getDragonProtagonist();
    if (dragon) {
      dragon.setHealth(this.dragonCombatState.maxHP);
    }

    // Update HP bar visual to show full health
    if (this.uiManager) {
      this.uiManager.updateDragonHealth(this.dragonCombatState.maxHP, this.dragonCombatState.maxHP);
    }

    // 9. Pause journey (TODO: set pause button state via UIManager)
    // For now, journey continues automatically

    console.log('💀 Dragon Death: Sequence complete - respawned with full HP');
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

        // Update Combat (independent systems coordinated via data passing)
        // Skip combat during cutscene to prevent targeting issues
        if (!this.takeoffCutsceneManager || !this.takeoffCutsceneManager.isPlaying()) {
          this.updateCombat(deltaTime, currentTime);
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
