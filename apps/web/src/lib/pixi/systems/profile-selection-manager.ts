/**
 * @file Profile Selection Manager
 * @description Zelda OoT-style profile selection screen
 *
 * 3 save slots with data display:
 * - File 1, 2, 3
 * - Dragon name, ward, playtime, last played
 * - Copy, Erase, Options buttons
 */

import { Application, Container, Graphics, Text } from 'pixi.js';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import { ResponsiveManager } from './responsive-manager';
import { profileRepo, type ProfileSlotData } from '@draconia/db';

export interface ProfileSelectionConfig {
  backgroundColor?: number;
  textColor?: number;
  fontSize?: number;
  fontFamily?: string;
  slotNormalColor?: number;
  slotHoverColor?: number;
  slotSelectedColor?: number;
  slotEmptyColor?: number;
  buttonColor?: number;
  buttonHoverColor?: number;
  fadeInDuration?: number;
  onProfileSelected?: (profileId: string, slotNumber: number) => void;
  onNewProfile?: (slotNumber: number) => void;
  onCopy?: () => void;
  onErase?: () => void;
  onOptions?: () => void;
}

interface ProfileSelectionState {
  isVisible: boolean;
  isFadingIn: boolean;
  fadeProgress: number;
  selectedSlotIndex: number; // 0, 1, 2 (for slots 1, 2, 3)
  hoveredSlotIndex: number;
  hoveredButton: string | null; // 'copy', 'erase', 'options'
}

interface SlotVisual {
  container: Container;
  background: Graphics;
  icon: Graphics;
  nameText: Text;
  infoText: Text;
  emptyText: Text;
  selectionArrow: Text;
}

interface ButtonVisual {
  id: string;
  graphics: Graphics;
  text: Text;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * ProfileSelectionManager - Main profile screen
 */
export class ProfileSelectionManager {
  private app: Application;
  private config: ProfileSelectionConfig;
  private responsiveManager: ResponsiveManager;
  private container: Container;
  private state: ProfileSelectionState;

  // Visuals
  private backgroundGraphics: Graphics | null = null;
  private titleText: Text | null = null;
  private slots: SlotVisual[] = [];
  private buttons: ButtonVisual[] = [];
  private helpText: Text | null = null;

  // Data
  private profileData: ProfileSlotData[] = [];

  // Animation
  private fadeInStartTime: number = 0;

  // Event handlers
  private keyHandler: ((event: KeyboardEvent) => void) | null = null;
  private mouseHandler: ((event: MouseEvent) => void) | null = null;
  private resizeCallback: (() => void) | null = null;
  private isInitialized: boolean = false;

  constructor(
    app: Application,
    responsiveManager: ResponsiveManager,
    config: ProfileSelectionConfig = {},
  ) {
    this.app = app;
    this.responsiveManager = responsiveManager;

    this.config = {
      backgroundColor: 0x0d4f3c, // Draconia dark green
      textColor: 0xffffff, // White
      fontSize: 24,
      fontFamily: 'Cinzel, serif',
      slotNormalColor: 0x2d5a3d, // Slot background
      slotHoverColor: 0x4a7c59, // Slot hover
      slotSelectedColor: 0x5d8f6f, // Slot selected (lighter)
      slotEmptyColor: 0x1a3d2d, // Empty slot (darker)
      buttonColor: 0x2d5a3d,
      buttonHoverColor: 0x4a7c59,
      fadeInDuration: 1000,
      ...config,
    };

    this.state = {
      isVisible: false,
      isFadingIn: false,
      fadeProgress: 0,
      selectedSlotIndex: 0,
      hoveredSlotIndex: -1,
      hoveredButton: null,
    };

    // Create main container
    this.container = new Container();
    this.container.label = 'profile-selection';
    this.container.visible = false;
    setZIndex(this.container, Z_LAYERS.UI_MENUS);
    this.app.stage.addChild(this.container);

    console.log('✅ Profile Selection Manager: Initialized');
  }

  /**
   * Show profile selection screen
   */
  async show(): Promise<void> {
    if (this.state.isVisible) return;

    console.log('🎮 Profile Selection: Showing...');

    // Load profile data from database
    await this.loadProfileData();

    // Create visuals if not initialized
    if (!this.isInitialized) {
      await this.createVisuals();
      this.isInitialized = true;
    }

    // Update visuals with loaded data
    this.updateSlotVisuals();

    // Show container
    this.container.visible = true;
    this.container.alpha = 0;
    this.state.isVisible = true;
    this.state.isFadingIn = true;
    this.fadeInStartTime = Date.now();

    // Add event listeners
    this.addEventListeners();

    console.log('✅ Profile Selection: Visible');
  }

  /**
   * Hide profile selection screen
   */
  hide(): void {
    if (!this.state.isVisible) return;

    this.container.visible = false;
    this.state.isVisible = false;
    this.state.isFadingIn = false;

    // Remove event listeners
    this.removeEventListeners();

    console.log('✅ Profile Selection: Hidden');
  }

  /**
   * Update animation
   */
  update(_deltaTime: number): void {
    if (!this.state.isVisible) return;

    // Handle fade-in
    if (this.state.isFadingIn) {
      const elapsed = Date.now() - this.fadeInStartTime;
      this.state.fadeProgress = Math.min(elapsed / this.config.fadeInDuration!, 1);
      this.container.alpha = this.state.fadeProgress;

      if (this.state.fadeProgress >= 1) {
        this.state.isFadingIn = false;
      }
    }

    // Update slot visuals based on selection/hover
    this.updateSlotHighlights();
  }

  /**
   * Load profile data from database
   */
  private async loadProfileData(): Promise<void> {
    try {
      this.profileData = await profileRepo.loadAllSlots();
      console.log('📦 Loaded profile data:', this.profileData);
    } catch (error) {
      console.error('❌ Failed to load profile data:', error);
      // Fallback: empty slots
      this.profileData = [
        { slotNumber: 1, isEmpty: true },
        { slotNumber: 2, isEmpty: true },
        { slotNumber: 3, isEmpty: true },
      ];
    }
  }

  /**
   * Create all visuals
   */
  private async createVisuals(): Promise<void> {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();

    // Background
    this.createBackground();

    // Title
    this.createTitle(gameWorldScale);

    // 3 Slots
    this.createSlots(gameWorldScale);

    // Buttons (Copy, Erase, Options)
    this.createButtons(gameWorldScale);

    // Help text
    this.createHelpText(gameWorldScale);
  }

  /**
   * Create background
   */
  private createBackground(): void {
    this.backgroundGraphics = new Graphics();
    this.backgroundGraphics.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.backgroundGraphics.fill(this.config.backgroundColor!);
    this.container.addChild(this.backgroundGraphics);
  }

  /**
   * Create title text
   */
  private createTitle(scale: number): void {
    this.titleText = new Text({
      text: 'SELECT A PROFILE',
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: 32 * scale,
        fill: this.config.textColor,
        align: 'center',
      },
    });

    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = this.app.screen.width / 2;
    this.titleText.y = 50 * scale;

    this.container.addChild(this.titleText);
  }

  /**
   * Create 3 profile slots
   */
  private createSlots(scale: number): void {
    const slotWidth = 500 * scale;
    const slotHeight = 120 * scale;
    const slotGap = 30 * scale;
    const startY = 150 * scale;
    const centerX = this.app.screen.width / 2;

    for (let i = 0; i < 3; i++) {
      const slotY = startY + i * (slotHeight + slotGap);

      const slotContainer = new Container();
      slotContainer.x = centerX - slotWidth / 2;
      slotContainer.y = slotY;

      // Background rectangle
      const background = new Graphics();
      background.roundRect(0, 0, slotWidth, slotHeight, 8 * scale);
      background.fill(this.config.slotNormalColor!);
      background.stroke({ color: 0x7fb892, width: 2 * scale });
      slotContainer.addChild(background);

      // Icon (left side)
      const icon = new Graphics();
      icon.x = 20 * scale;
      icon.y = slotHeight / 2;
      slotContainer.addChild(icon);

      // Selection arrow (hidden by default)
      const arrow = new Text({
        text: '▸',
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: 32 * scale,
          fill: 0xffd700, // Gold
        },
      });
      arrow.anchor.set(0.5);
      arrow.x = -20 * scale;
      arrow.y = slotHeight / 2;
      arrow.visible = false;
      slotContainer.addChild(arrow);

      // Name text
      const nameText = new Text({
        text: `File ${i + 1}`,
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: 24 * scale,
          fill: this.config.textColor,
        },
      });
      nameText.x = 120 * scale;
      nameText.y = 30 * scale;
      slotContainer.addChild(nameText);

      // Info text (ward, playtime)
      const infoText = new Text({
        text: '',
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: 18 * scale,
          fill: 0xcccccc, // Light gray
        },
      });
      infoText.x = 120 * scale;
      infoText.y = 60 * scale;
      slotContainer.addChild(infoText);

      // Empty text (for empty slots)
      const emptyText = new Text({
        text: '[Empty]',
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: 18 * scale,
          fill: 0x666666, // Dark gray
        },
      });
      emptyText.x = 120 * scale;
      emptyText.y = 60 * scale;
      emptyText.visible = false;
      slotContainer.addChild(emptyText);

      this.container.addChild(slotContainer);

      this.slots.push({
        container: slotContainer,
        background,
        icon,
        nameText,
        infoText,
        emptyText,
        selectionArrow: arrow,
      });
    }
  }

  /**
   * Create buttons (Copy, Erase, Options)
   */
  private createButtons(scale: number): void {
    const buttonWidth = 150 * scale;
    const buttonHeight = 50 * scale;
    const buttonGap = 20 * scale;
    const startY = 600 * scale;
    const centerX = this.app.screen.width / 2;

    const buttonConfigs = [
      { id: 'copy', text: 'Copy', x: centerX - buttonWidth - buttonGap },
      { id: 'erase', text: 'Erase', x: centerX },
      { id: 'options', text: 'Options', x: centerX + buttonWidth + buttonGap },
    ];

    for (const config of buttonConfigs) {
      const graphics = new Graphics();
      graphics.roundRect(0, 0, buttonWidth, buttonHeight, 8 * scale);
      graphics.fill(this.config.buttonColor!);
      graphics.x = config.x - buttonWidth / 2;
      graphics.y = startY;

      const text = new Text({
        text: config.text,
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: 20 * scale,
          fill: this.config.textColor,
        },
      });
      text.anchor.set(0.5);
      text.x = config.x;
      text.y = startY + buttonHeight / 2;

      this.container.addChild(graphics);
      this.container.addChild(text);

      this.buttons.push({
        id: config.id,
        graphics,
        text,
        x: config.x - buttonWidth / 2,
        y: startY,
        width: buttonWidth,
        height: buttonHeight,
      });
    }
  }

  /**
   * Create help text
   */
  private createHelpText(scale: number): void {
    this.helpText = new Text({
      text: '[ENTER] Select  [ESC] Cancel',
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: 16 * scale,
        fill: 0xcccccc,
        align: 'center',
      },
    });

    this.helpText.anchor.set(0.5);
    this.helpText.x = this.app.screen.width / 2;
    this.helpText.y = this.app.screen.height - 50 * scale;

    this.container.addChild(this.helpText);
  }

  /**
   * Update slot visuals with loaded data
   */
  private updateSlotVisuals(): void {
    for (let i = 0; i < 3; i++) {
      const slotData = this.profileData[i];
      const slotVisual = this.slots[i];

      if (slotData.isEmpty) {
        // Empty slot
        slotVisual.background.tint = this.config.slotEmptyColor!;
        slotVisual.nameText.text = `File ${i + 1}`;
        slotVisual.infoText.visible = false;
        slotVisual.emptyText.visible = true;
        this.drawEmptyIcon(slotVisual.icon);
      } else {
        // Filled slot - display dragon name directly
        slotVisual.background.tint = this.config.slotNormalColor!;
        slotVisual.nameText.text = slotData.dragonName!; // Show dragon name instead of "File # - Name"
        slotVisual.infoText.text = `Ward ${slotData.wardNumber} • ${slotData.playtimeFormatted} • ${slotData.landName}\nLast: ${slotData.lastPlayedRelative}`;
        slotVisual.infoText.visible = true;
        slotVisual.emptyText.visible = false;
        this.drawDragonIcon(slotVisual.icon);
      }
    }
  }

  /**
   * Update slot highlights based on selection/hover
   */
  private updateSlotHighlights(): void {
    for (let i = 0; i < 3; i++) {
      const slot = this.slots[i];
      const isSelected = i === this.state.selectedSlotIndex;
      const isHovered = i === this.state.hoveredSlotIndex;

      // Show/hide selection arrow
      slot.selectionArrow.visible = isSelected;

      // Update background color
      if (this.profileData[i].isEmpty) {
        slot.background.tint = this.config.slotEmptyColor!;
      } else if (isSelected || isHovered) {
        slot.background.tint = this.config.slotSelectedColor!;
      } else {
        slot.background.tint = this.config.slotNormalColor!;
      }
    }

    // Update button highlights
    for (const button of this.buttons) {
      if (this.state.hoveredButton === button.id) {
        button.graphics.tint = this.config.buttonHoverColor!;
      } else {
        button.graphics.tint = this.config.buttonColor!;
      }
    }
  }

  /**
   * Draw dragon icon (simple silhouette)
   */
  private drawDragonIcon(graphics: Graphics): void {
    const scale = this.responsiveManager.getGameWorldScale();

    graphics.clear();
    graphics.circle(0, 0, 30 * scale);
    graphics.fill(0xffd700); // Gold circle for now
    // TODO: Replace with actual dragon sprite
  }

  /**
   * Draw empty icon
   */
  private drawEmptyIcon(graphics: Graphics): void {
    const scale = this.responsiveManager.getGameWorldScale();

    graphics.clear();
    graphics.circle(0, 0, 30 * scale);
    graphics.fill(0x666666); // Gray circle
  }

  /**
   * Handle slot selection
   */
  private async handleSlotSelection(): Promise<void> {
    const selectedSlot = this.profileData[this.state.selectedSlotIndex];

    if (selectedSlot.isEmpty) {
      // Empty slot - go to name entry
      console.log(`🆕 Creating new profile in slot ${selectedSlot.slotNumber}`);
      this.config.onNewProfile?.(selectedSlot.slotNumber);
    } else {
      // Filled slot - load profile
      console.log(`▶️ Loading profile: ${selectedSlot.dragonName}`);
      this.config.onProfileSelected?.(selectedSlot.profileId!, selectedSlot.slotNumber);
    }
  }

  /**
   * Add event listeners
   */
  private addEventListeners(): void {
    // Keyboard navigation
    this.keyHandler = (event: KeyboardEvent) => this.handleKeyPress(event);
    window.addEventListener('keydown', this.keyHandler);

    // Mouse hover
    this.mouseHandler = (event: MouseEvent) => this.handleMouseMove(event);
    this.app.canvas.addEventListener('mousemove', this.mouseHandler);

    // Mouse click
    this.app.canvas.addEventListener('click', () => this.handleSlotSelection());

    // Resize
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }

    if (this.mouseHandler) {
      this.app.canvas.removeEventListener('mousemove', this.mouseHandler);
      this.mouseHandler = null;
    }

    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }
  }

  /**
   * Handle keyboard input
   */
  private handleKeyPress(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        this.state.selectedSlotIndex = Math.max(0, this.state.selectedSlotIndex - 1);
        break;

      case 'ArrowDown':
        this.state.selectedSlotIndex = Math.min(2, this.state.selectedSlotIndex + 1);
        break;

      case 'Enter':
        this.handleSlotSelection();
        break;

      case 'Escape':
        this.hide();
        break;
    }
  }

  /**
   * Handle mouse movement (hover detection)
   */
  private handleMouseMove(event: MouseEvent): void {
    const rect = this.app.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check slot hover
    this.state.hoveredSlotIndex = -1;
    for (let i = 0; i < 3; i++) {
      const slot = this.slots[i];
      const bounds = slot.container.getBounds();

      if (
        mouseX >= bounds.x &&
        mouseX <= bounds.x + bounds.width &&
        mouseY >= bounds.y &&
        mouseY <= bounds.y + bounds.height
      ) {
        this.state.hoveredSlotIndex = i;
        break;
      }
    }

    // Check button hover
    this.state.hoveredButton = null;
    for (const button of this.buttons) {
      if (
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
      ) {
        this.state.hoveredButton = button.id;
        break;
      }
    }
  }

  /**
   * Handle resize
   */
  handleResize(): void {
    // Recreate visuals on resize
    if (this.isInitialized) {
      this.container.removeChildren();
      this.slots = [];
      this.buttons = [];
      this.createVisuals();
      this.updateSlotVisuals();
    }
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.removeEventListeners();
    this.container.destroy();
    console.log('✅ Profile Selection Manager: Destroyed');
  }
}
