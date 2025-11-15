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
import { ConfirmationDialog } from '$lib/dialogue/ui/confirmation-dialog';
import {
  createNameplateShape,
  createMagicalGem,
  createMirroredNameplateShape,
  createExtendedAttachmentShape,
  createConcaveCornerShape,
} from './profile-shapes-test';

// Profile gem colors from UI specifications
const PROFILE_GEM_COLORS = {
  1: 0xFFD700, // Gold
  2: 0xE0115F, // Ruby  
  3: 0x0F52BA, // Sapphire
} as const;

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
  onProfileSelected?: (_profileId: string, _slotNumber: number) => void;
  onNewProfile?: (_slotNumber: number) => void;
  onCopy?: () => void;
  onErase?: () => void;
  onOptions?: () => void;
  onCancel?: () => void;
  onTestJourney?: () => void; // Test button to start journey directly
}

type SelectionMode = 'normal' | 'copy-source' | 'copy-destination' | 'delete-target';

interface ProfileSelectionState {
  isVisible: boolean;
  isFadingIn: boolean;
  fadeProgress: number;
  selectedSlotIndex: number; // 0, 1, 2 (for slots 1, 2, 3)
  hoveredSlotIndex: number;
  hoveredButton: string | null; // 'copy', 'erase', 'options'

  // Copy/Delete flow state
  mode: SelectionMode;
  copySourceSlot: number | null; // Slot index (0-2) selected as copy source
  deleteTargetSlot: number | null; // Slot index (0-2) selected for deletion
}

interface SlotVisual {
  container: Container;
  nameplate: Graphics;
  gem: Container;
  gemColor: number; // Color of the gem (gold, ruby, sapphire)
  slotNumber: number; // 1, 2, or 3
  fileText: Text;
  nameText: Text; // Dragon name or "Empty Slot"
  infoText: Text; // Ward, playtime, land, last-played info
  selectionArrow: Text;
  // Attachment visual elements (added for state-based rendering)
  attachment?: Graphics; // Simple or complex attachment shape
  attachmentGem?: Container; // Unlit gem on attachment
  decorativeCorner?: Graphics; // Concave corner decoration
  currentAttachmentType?: 'simple' | 'extended' | null; // Track current attachment state
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
  private keyHandler: ((_event: KeyboardEvent) => void) | null = null;
  private mouseHandler: ((_event: MouseEvent) => void) | null = null;
  private clickHandler: (() => void) | null = null;
  private resizeCallback: (() => void) | null = null;
  private isInitialized: boolean = false;

  // Dialogs
  private confirmationDialog: ConfirmationDialog;

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
      selectedSlotIndex: -1, // No auto-selection on first load
      hoveredSlotIndex: -1,
      hoveredButton: null,
      mode: 'normal',
      copySourceSlot: null,
      deleteTargetSlot: null,
    };

    // Create main container
    this.container = new Container();
    this.container.label = 'profile-selection';
    this.container.visible = false;
    setZIndex(this.container, Z_LAYERS.UI_MENUS);
    this.app.stage.addChild(this.container);

    // Create confirmation dialog
    this.confirmationDialog = new ConfirmationDialog(app, responsiveManager);

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
   * Check if copy button should be enabled
   * Requires: ≥1 filled slot AND ≥1 empty slot
   */
  private isCopyButtonEnabled(): boolean {
    let filledCount = 0;
    let emptyCount = 0;

    for (let i = 0; i < 3; i++) {
      const slotData = this.profileData[i];
      if (slotData && !slotData.isEmpty) {
        filledCount++;
      } else {
        emptyCount++;
      }
    }

    return filledCount >= 1 && emptyCount >= 1;
  }

  /**
   * Check if delete button should be enabled
   * Requires: ≥1 filled slot
   */
  private isDeleteButtonEnabled(): boolean {
    for (let i = 0; i < 3; i++) {
      const slotData = this.profileData[i];
      if (slotData && !slotData.isEmpty) {
        return true;
      }
    }
    return false;
  }

  /**
   * Handle copy button click - initiates copy mode
   */
  private async handleCopyButtonClick(): Promise<void> {
    if (!this.isCopyButtonEnabled()) {
      console.warn('⚠️ Copy button clicked but not enabled');
      return;
    }

    console.log('📋 Copy button clicked - entering copy-source mode');
    this.state.mode = 'copy-source';
    this.state.copySourceSlot = null;
    this.updateInstructionText('Select a profile to copy');
    this.updateSlotHighlights();
  }

  /**
   * Execute copy operation from source to destination
   */
  private async executeCopy(sourceSlot: number, destSlot: number): Promise<void> {
    try {
      console.log(`📋 Copying profile from slot ${sourceSlot} to slot ${destSlot}`);

      // Animate gem power-up on source slot
      await this.animateGemPowerUp(sourceSlot);

      // Perform database copy (convert 0-based indices to 1-based slot numbers)
      await profileRepo.copyProfile((sourceSlot + 1) as 1 | 2 | 3, (destSlot + 1) as 1 | 2 | 3);

      // Reload profile data
      await this.loadProfileData();

      // Animate attachment duplication to destination
      await this.animateAttachmentDuplicate(sourceSlot, destSlot);

      // Reset state
      this.state.mode = 'normal';
      this.state.copySourceSlot = null;
      this.updateInstructionText('Select a profile or create a new one');
      this.updateSlotHighlights();

      console.log('✅ Copy operation complete');
    } catch (error) {
      console.error('❌ Copy operation failed:', error);
      this.state.mode = 'normal';
      this.state.copySourceSlot = null;
      this.updateInstructionText('Copy failed - please try again');
      this.updateSlotHighlights();
    }
  }

  /**
   * Animate gem power-up effect on source slot
   */
  private async animateGemPowerUp(slotIndex: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const slot = this.slots[slotIndex];
      if (!slot?.gem) {
        resolve();
        return;
      }

      const gemSprite = slot.gem;
      const startScale = gemSprite.scale.x;
      const targetScale = startScale * 1.3; // 30% larger
      const duration = 400; // 400ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress);

        // Scale up then back down
        const scale =
          progress < 0.5
            ? startScale + (targetScale - startScale) * (easeProgress * 2)
            : targetScale - (targetScale - startScale) * ((easeProgress - 0.5) * 2);

        gemSprite.scale.set(scale);

        // Pulse alpha
        gemSprite.alpha = 0.7 + Math.sin(progress * Math.PI * 4) * 0.3;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          gemSprite.scale.set(startScale);
          gemSprite.alpha = 1;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Animate attachment duplication from source to destination
   */
  private async animateAttachmentDuplicate(sourceSlot: number, destSlot: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const sourceSlotObj = this.slots[sourceSlot];
      const destSlotObj = this.slots[destSlot];

      if (!sourceSlotObj?.attachmentSprite || !destSlotObj?.attachmentSprite) {
        resolve();
        return;
      }

      const sourceAttachment = sourceSlotObj.attachmentSprite;
      const destAttachment = destSlotObj.attachmentSprite;

      // Get positions (reserved for future arc animation)
      const _startX = sourceAttachment.x;
      const _startY = sourceAttachment.y;
      const _endX = destAttachment.x;
      const _endY = destAttachment.y;

      // Start destination attachment invisible
      destAttachment.alpha = 0;

      const duration = 600; // 600ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in-out quad
        const easeProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Fade in destination attachment
        destAttachment.alpha = easeProgress;

        // Optional: animate position along arc (creates visual "travel" effect)
        // For now, just fade in at destination

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          destAttachment.alpha = 1;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Handle delete button click - initiates delete mode
   */
  private async handleDeleteButtonClick(): Promise<void> {
    if (!this.isDeleteButtonEnabled()) {
      console.warn('⚠️ Delete button clicked but not enabled');
      return;
    }

    console.log('🗑️ Delete button clicked - entering delete-target mode');
    this.state.mode = 'delete-target';
    this.state.deleteTargetSlot = null;
    this.updateInstructionText('CHOOSE A FILE TO DELETE');
    this.updateSlotHighlights();
  }

  /**
   * Show delete confirmation dialog
   */
  private async showDeleteConfirmation(): Promise<boolean> {
    return await this.confirmationDialog.show({
      title: 'Delete Profile?',
      message: 'Are you sure you want to delete this profile?',
      additionalMessage: 'Data is not recoverable.',
      yesText: 'Delete',
      noText: 'Cancel',
    });
  }

  /**
   * Execute delete operation on target slot
   */
  private async executeDelete(targetSlot: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting profile from slot ${targetSlot}`);

      // Animate gem fade out and attachment fall
      await Promise.all([
        this.animateGemFadeOut(targetSlot),
        this.animateAttachmentFallOff(targetSlot),
      ]);

      // Perform database delete (convert 0-based index to 1-based slot number)
      await profileRepo.eraseProfile((targetSlot + 1) as 1 | 2 | 3);

      // Reload profile data
      await this.loadProfileData();

      // Refresh slot visuals with new data (makes deletion visible immediately)
      this.updateSlotVisuals();

      // Reset state
      this.state.mode = 'normal';
      this.state.deleteTargetSlot = null;
      this.updateInstructionText('Select a profile or create a new one');
      this.updateSlotHighlights();

      console.log('✅ Delete operation complete');
    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      this.state.mode = 'normal';
      this.state.deleteTargetSlot = null;
      this.updateInstructionText('Delete failed - please try again');
      this.updateSlotHighlights();
    }
  }

  /**
   * Animate gem fade out effect on target slot
   */
  private async animateGemFadeOut(slotIndex: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const slot = this.slots[slotIndex];
      if (!slot?.gem) {
        resolve();
        return;
      }

      const gemSprite = slot.gem;
      const startAlpha = gemSprite.alpha;
      const duration = 500; // 500ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in quad
        const easeProgress = progress * progress;

        // Fade out alpha
        gemSprite.alpha = startAlpha * (1 - easeProgress);

        // Slight scale down
        const scale = 1 - easeProgress * 0.2; // 20% smaller
        gemSprite.scale.set(scale);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          gemSprite.alpha = 0;
          gemSprite.scale.set(1); // Reset for future use
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Animate attachment falling off screen on target slot
   */
  private async animateAttachmentFallOff(slotIndex: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const slot = this.slots[slotIndex];
      if (!slot?.attachment) {
        resolve();
        return;
      }

      // Collect all elements that should fall together
      const attachmentSprite = slot.attachment;
      const attachmentGem = slot.attachmentGem;
      const nameText = slot.nameText;
      const infoText = slot.infoText;

      // Store initial positions and alphas
      const startY = attachmentSprite.y;
      const startAlpha = attachmentSprite.alpha;
      const nameStartY = nameText.y;
      const nameStartAlpha = nameText.alpha;
      const infoStartY = infoText.y;
      const infoStartAlpha = infoText.alpha;
      const gemStartY = attachmentGem?.y ?? 0;
      const gemStartAlpha = attachmentGem?.alpha ?? 1;

      const fallDistance = this.app.screen.height; // Fall off screen
      const duration = 800; // 800ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in quad (accelerating fall)
        const easeProgress = progress * progress;

        // Animate attachment shape
        attachmentSprite.y = startY + fallDistance * easeProgress;
        attachmentSprite.alpha = startAlpha * (1 - easeProgress * 0.5);
        attachmentSprite.rotation = easeProgress * Math.PI * 0.5; // 90 degrees

        // Animate text elements (fall together with attachment)
        nameText.y = nameStartY + fallDistance * easeProgress;
        nameText.alpha = nameStartAlpha * (1 - easeProgress * 0.5);

        infoText.y = infoStartY + fallDistance * easeProgress;
        infoText.alpha = infoStartAlpha * (1 - easeProgress * 0.5);

        // Animate attachment gem if present
        if (attachmentGem) {
          attachmentGem.y = gemStartY + fallDistance * easeProgress;
          attachmentGem.alpha = gemStartAlpha * (1 - easeProgress * 0.5);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Reset all elements for future use
          attachmentSprite.y = startY;
          attachmentSprite.alpha = 0; // Hide it
          attachmentSprite.rotation = 0;

          nameText.y = nameStartY;
          nameText.alpha = 0; // Hide text

          infoText.y = infoStartY;
          infoText.alpha = 0; // Hide text

          if (attachmentGem) {
            attachmentGem.y = gemStartY;
            attachmentGem.alpha = 0; // Hide gem
          }

          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Update instruction text (updates the prominent title text to show current mode)
   */
  private updateInstructionText(text: string): void {
    if (this.titleText) {
      this.titleText.text = text.toUpperCase(); // Keep consistent uppercase style
    }
  }

  /**
   * Handle button click - routes to appropriate handler
   */
  private async handleButtonClick(buttonId: string): Promise<void> {
    console.log(`🔘 Button clicked: ${buttonId}`);

    switch (buttonId) {
      case 'copy':
        await this.handleCopyButtonClick();
        break;
      case 'erase':
        await this.handleDeleteButtonClick();
        break;
      case 'options':
        console.log('⚙️ Options button clicked (not yet implemented)');
        break;
      default:
        console.warn(`⚠️ Unknown button clicked: ${buttonId}`);
    }
  }

  /**
   * Update button visual states (hover, disabled, etc.)
   */
  private updateButtonHighlights(): void {
    const copyEnabled = this.isCopyButtonEnabled();
    const deleteEnabled = this.isDeleteButtonEnabled();

    for (const button of this.buttons) {
      let shouldDisable = false;

      // Determine if button should be disabled
      if (button.id === 'copy' && !copyEnabled) {
        shouldDisable = true;
      } else if (button.id === 'erase' && !deleteEnabled) {
        shouldDisable = true;
      }

      // Apply disabled styling
      if (shouldDisable) {
        button.graphics.tint = 0x666666; // Grey out
        button.graphics.alpha = 0.5;
        button.graphics.eventMode = 'none';
        button.graphics.cursor = 'default';
        button.text.alpha = 0.5;
      } else {
        button.graphics.tint = 0xffffff; // Normal color
        button.graphics.alpha = 1;
        button.graphics.eventMode = 'static';
        button.graphics.cursor = 'pointer';
        button.text.alpha = 1;
      }

      // Highlight hovered button
      if (this.state.hoveredButton === button.id && !shouldDisable) {
        button.graphics.alpha = 0.8;
      }
    }
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

    // Help text for instruction display (SELECT A PROFILE, CHOOSE A FILE TO DELETE, etc.)
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
    const _nameplateWidth = 500 * scale; // Reserved for future use
    const nameplateHeight = 80 * scale;
    const slotGap = 30 * scale;
    const startY = 150 * scale;
    const centerX = this.app.screen.width / 2;

    // Calculate gem positions for centering
    // Nameplate gem at x=480, attachment gem at x=250+259+25=534
    // Midpoint: (480 + 534) / 2 = 507
    const gemMidpoint = 507 * scale;

    for (let i = 0; i < 3; i++) {
      const slotY = startY + i * (nameplateHeight + slotGap);
      const slotNumber = i + 1;

      const slotContainer = new Container();
      // Position to center the GEMS (not the nameplate+attachment)
      slotContainer.x = centerX - gemMidpoint;
      slotContainer.y = slotY;

      // Create nameplate shape using the profile UI specifications
      // Use unscaled dimensions (500x80) and scale the Graphics object
      const nameplate = createNameplateShape({
        width: 500,
        height: 80,
      });
      nameplate.scale.set(scale);
      slotContainer.addChild(nameplate);

      // Create gem for this slot (Gold/Ruby/Sapphire) - starts unlit (no data yet)
      const gemColor = PROFILE_GEM_COLORS[slotNumber as keyof typeof PROFILE_GEM_COLORS];
      const gem = createMagicalGem(12 * scale, gemColor, false); // Unlit initially
      
      // Position gem according to specifications: x=480, y=20 (relative to nameplate)
      gem.x = 480 * scale;
      gem.y = 20 * scale;
      slotContainer.addChild(gem);

      // Selection arrow (hidden by default)
      const arrow = new Text({
        text: '▸',
        style: {
          fontFamily: this.config.fontFamily!,
          fontSize: 32 * scale,
          fill: 0xffd700, // Gold
        },
      });
      arrow.anchor.set(0.5);
      arrow.x = -20 * scale;
      arrow.y = nameplateHeight / 2;
      arrow.visible = false;
      slotContainer.addChild(arrow);

      // File text (FILE 1, FILE 2, FILE 3) - larger, left-aligned, vertically centered
      const fileText = new Text({
        text: `FILE ${slotNumber}`,
        style: {
          fontFamily: this.config.fontFamily!,
          fontSize: 32 * scale, // Larger (was 24)
          fill: this.config.textColor!,
        },
      });
      fileText.anchor.set(0, 0); // Left-aligned
      fileText.x = 20 * scale; // Left margin
      fileText.y = 15 * scale; // Vertically centered in nameplate
      fileText.zIndex = 10; // Ensure text is on top
      slotContainer.addChild(fileText);

      // Name text (dragon name or "Empty Slot") - larger font for land/ward data
      const nameText = new Text({
        text: 'Empty Slot',
        style: {
          fontFamily: this.config.fontFamily!,
          fontSize: 20 * scale, // Increased from 18 for better visibility
          fill: this.config.textColor!,
        },
      });
      nameText.x = 20 * scale;
      nameText.y = 55 * scale; // Below fileText
      nameText.zIndex = 10; // Ensure text is on top
      slotContainer.addChild(nameText);

      // Info text (ward, playtime, land, last-played)
      const infoText = new Text({
        text: '',
        style: {
          fontFamily: this.config.fontFamily!,
          fontSize: 14 * scale,
          fill: 0xcccccc, // Slightly dimmed
        },
      });
      infoText.x = 20 * scale;
      infoText.y = 75 * scale; // Below nameText
      infoText.visible = false; // Hidden by default for empty slots
      infoText.zIndex = 10; // Ensure text is on top
      slotContainer.addChild(infoText);

      // Enable sorting by zIndex for this container
      slotContainer.sortableChildren = true;

      this.container.addChild(slotContainer);

      this.slots.push({
        container: slotContainer,
        nameplate,
        gem,
        gemColor,
        slotNumber,
        fileText,
        nameText,
        infoText,
        selectionArrow: arrow,
      });
    }
  }

  /**
   * Create buttons (Copy, Erase, Options, Test Journey)
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
      graphics.eventMode = 'static';
      graphics.cursor = 'pointer';

      // Add click handler
      graphics.on('pointerdown', () => {
        this.handleButtonClick(config.id);
      });

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

    // Add test journey button (larger, centered below other buttons)
    const testButtonWidth = 300 * scale;
    const testButtonHeight = 60 * scale;
    const testButtonY = startY + 100 * scale;

    const testGraphics = new Graphics();
    testGraphics.roundRect(0, 0, testButtonWidth, testButtonHeight, 8 * scale);
    testGraphics.fill(0xff6600); // Orange for visibility
    testGraphics.x = centerX - testButtonWidth / 2;
    testGraphics.y = testButtonY;
    testGraphics.eventMode = 'static';
    testGraphics.cursor = 'pointer';

    const testText = new Text({
      text: 'TEST: Start Journey',
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: 24 * scale,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    testText.anchor.set(0.5);
    testText.x = centerX;
    testText.y = testButtonY + testButtonHeight / 2;

    // Add click handler
    testGraphics.on('pointerdown', () => {
      console.log('🧪 TEST: Starting journey directly...');
      this.config.onTestJourney?.();
    });

    this.container.addChild(testGraphics);
    this.container.addChild(testText);

    this.buttons.push({
      id: 'test-journey',
      graphics: testGraphics,
      text: testText,
      x: centerX - testButtonWidth / 2,
      y: testButtonY,
      width: testButtonWidth,
      height: testButtonHeight,
    });
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
   * Update slot visuals with loaded data - STATE-BASED RENDERING
   */
  private updateSlotVisuals(): void {
    const scale = this.responsiveManager.getGameWorldScale();

    for (let i = 0; i < 3; i++) {
      const slotData = this.profileData[i];
      const slotVisual = this.slots[i];
      const hasData = !slotData.isEmpty;
      const isSelected = i === this.state.selectedSlotIndex;

      // Determine desired attachment type based on state
      let desiredAttachmentType: 'simple' | 'extended' | null = null;
      if (hasData && !isSelected) {
        desiredAttachmentType = 'simple';
      } else if (hasData && isSelected) {
        desiredAttachmentType = 'extended';
      }

      // Update nameplate gem (lit if has data, unlit if empty - no data = no magic)
      const oldGem = slotVisual.gem;
      const gemPosition = { x: oldGem.x, y: oldGem.y };
      slotVisual.container.removeChild(oldGem);
      oldGem.destroy();

      const isGemLit = hasData; // Lit only if profile has data
      const newGem = createMagicalGem(12 * scale, slotVisual.gemColor, isGemLit);
      newGem.x = gemPosition.x;
      newGem.y = gemPosition.y;
      slotVisual.container.addChild(newGem);
      slotVisual.gem = newGem;

      // Manage attachments based on state
      if (desiredAttachmentType !== slotVisual.currentAttachmentType) {
        // Remove existing attachment if type changed
        if (slotVisual.attachment) {
          slotVisual.container.removeChild(slotVisual.attachment);
          slotVisual.attachment.destroy();
          slotVisual.attachment = undefined;
        }
        if (slotVisual.attachmentGem) {
          slotVisual.container.removeChild(slotVisual.attachmentGem);
          slotVisual.attachmentGem.destroy();
          slotVisual.attachmentGem = undefined;
        }
        if (slotVisual.decorativeCorner) {
          slotVisual.container.removeChild(slotVisual.decorativeCorner);
          slotVisual.decorativeCorner.destroy();
          slotVisual.decorativeCorner = undefined;
        }

        // Create new attachment if needed
        if (desiredAttachmentType === 'simple') {
          // SIMPLE ATTACHMENT (810x80px, 62% wider, 32% cut for balanced connection)
          const cutPercent = 0.32; // 32% cut (increased from 30% for better spacing)
          const attachmentWidth = 810; // Reduced from 900px (10% smaller)
          const attachment = createMirroredNameplateShape({
            width: attachmentWidth,
            height: 80,
            cutPercentage: cutPercent,
          });
          attachment.scale.set(scale);
          // Position to start where nameplate cutout begins
          attachment.x = 250 * scale;
          attachment.y = 0;
          // Match attachment color to nameplate
          attachment.tint = slotVisual.nameplate.tint;
          slotVisual.container.addChild(attachment);
          slotVisual.attachment = attachment;

          // Lit gem on attachment - positioned in visible solid area (32% of 810px = 259px cut)
          const cutWidth = attachmentWidth * cutPercent; // 259px
          const attachmentGem = createMagicalGem(12 * scale, slotVisual.gemColor, true); // Lit
          attachmentGem.x = (250 + cutWidth + 25) * scale; // attachment.x (250) + cutWidth (259) + 25 = 534px
          attachmentGem.y = 20 * scale;
          slotVisual.container.addChild(attachmentGem);
          slotVisual.attachmentGem = attachmentGem;

          // Decorative concave corner at cut edge (259px for 32% of 810px)
          const corner = createConcaveCornerShape(15 * scale, 0x1a3d2d, 1.0);
          corner.scale.x = -1; // Flip horizontally
          corner.x = (250 + cutWidth) * scale; // attachment.x (250) + cutWidth (259) = 509px - positioned at cut edge
          corner.y = 0;
          // Match corner color to nameplate and attachment
          corner.tint = slotVisual.nameplate.tint;
          slotVisual.container.addChild(corner);
          slotVisual.decorativeCorner = corner;

        } else if (desiredAttachmentType === 'extended') {
          // COMPLEX ATTACHMENT (810x80px, 62% wider, 32% cut for balanced connection)
          const cutPercent = 0.32; // 32% cut (increased from 30% for better spacing)
          const attachmentWidth = 810; // Reduced from 900px (10% smaller)
          const attachment = createExtendedAttachmentShape({
            width: attachmentWidth,
            height: 80,
            cutPercentage: cutPercent,
          });
          attachment.scale.set(scale);
          // Position to start where nameplate cutout begins
          attachment.x = 250 * scale;
          attachment.y = 0;
          // Match attachment color to nameplate
          attachment.tint = slotVisual.nameplate.tint;
          slotVisual.container.addChild(attachment);
          slotVisual.attachment = attachment;

          // Lit gem on attachment - positioned in visible solid area (32% of 810px = 259px cut)
          const cutWidth = attachmentWidth * cutPercent; // 259px
          const attachmentGem = createMagicalGem(12 * scale, slotVisual.gemColor, true); // Lit
          attachmentGem.x = (250 + cutWidth + 25) * scale; // attachment.x (250) + cutWidth (259) + 25 = 534px
          attachmentGem.y = 20 * scale;
          slotVisual.container.addChild(attachmentGem);
          slotVisual.attachmentGem = attachmentGem;

          // Decorative concave corner at cut edge (259px for 32% of 810px)
          const corner = createConcaveCornerShape(15 * scale, 0x1a3d2d, 1.0);
          corner.scale.x = -1; // Flip horizontally
          corner.x = (250 + cutWidth) * scale; // attachment.x (250) + cutWidth (259) = 509px - positioned at cut edge
          corner.y = 0;
          // Match corner color to nameplate and attachment
          corner.tint = slotVisual.nameplate.tint;
          slotVisual.container.addChild(corner);
          slotVisual.decorativeCorner = corner;
        }

        slotVisual.currentAttachmentType = desiredAttachmentType;
      }

      // Update text content
      if (slotData.isEmpty) {
        // Empty slot - show FILE # in file text, "NO DATA" in small tertiary text
        slotVisual.nameplate.tint = this.config.slotEmptyColor!;
        slotVisual.fileText.text = `FILE ${slotVisual.slotNumber}`;
        slotVisual.nameText.text = 'NO DATA'; // Small tertiary text for empty slots
        slotVisual.nameText.style.fontSize = 12 * scale; // Tertiary font size (small)
        slotVisual.nameText.style.fill = 0x888888; // Dimmed grey color
        slotVisual.nameText.anchor.set(0, 0); // Left-aligned, top anchor
        slotVisual.infoText.visible = false;
        // Position "NO DATA" text beneath "FILE #"
        slotVisual.nameText.x = 20 * scale;
        slotVisual.nameText.y = 45 * scale; // Below FILE text (15 + 32 = 47, so 45 works)
        slotVisual.infoText.x = 20 * scale;
      } else {
        // Filled slot - show dragon name in file text
        slotVisual.nameplate.tint = this.config.slotNormalColor!;
        slotVisual.fileText.text = slotData.dragonName || 'Unknown Dragon';

        // Reset nameText style to normal (in case it was "NO DATA" style before)
        slotVisual.nameText.style.fontSize = 20 * scale; // Normal font size
        slotVisual.nameText.style.fill = 0xffffff; // White color

        // Simple attachment: Show "Land # Name • Ward # Name" aligned with gem
        if (desiredAttachmentType === 'simple') {
          slotVisual.nameText.text = `Land ${slotData.landNumber} ${slotData.landName} • Ward ${slotData.wardNumber} ${slotData.wardName}`;
          // Position text to the right of attachment gem (534 + 30px spacing) - updated for 32% cut
          const textStartX = (250 + 259 + 25 + 30) * scale; // 564px (32% cut)
          slotVisual.nameText.anchor.set(0, 0.5); // Left-aligned, vertically centered
          slotVisual.nameText.x = textStartX;
          slotVisual.nameText.y = 20 * scale; // Center vertically on gem (gem is at y=20)
          slotVisual.infoText.visible = false; // Hide info text for simple attachment
        }
        // Extended attachment: Show all info (playtime, last played) with full land/ward details
        else if (desiredAttachmentType === 'extended') {
          slotVisual.nameText.text = `Ward ${slotData.wardNumber} ${slotData.wardName} • ${slotData.playtimeFormatted}`;
          slotVisual.infoText.text = `Land ${slotData.landNumber} ${slotData.landName} • Last: ${slotData.lastPlayedRelative}`;
          slotVisual.infoText.visible = true;
          // Position text to the right of attachment gem (534 + 30px spacing) - updated for 32% cut
          const textStartX = (250 + 259 + 25 + 30) * scale; // 564px (32% cut)
          slotVisual.nameText.x = textStartX;
          slotVisual.nameText.y = 55 * scale; // Standard position below fileText
          slotVisual.infoText.x = textStartX;
        }
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

      // Show/hide selection arrow - show on hover
      slot.selectionArrow.visible = isHovered;

      // Update nameplate tint based on state
      if (isSelected || isHovered) {
        slot.nameplate.tint = 0xffffff; // Full brightness
        slot.nameplate.alpha = 1.0;
        // Match attachment and decorative corner color to nameplate
        if (slot.attachment) {
          slot.attachment.tint = 0xffffff;
          slot.attachment.alpha = 1.0;
        }
        if (slot.decorativeCorner) {
          slot.decorativeCorner.tint = 0xffffff;
          slot.decorativeCorner.alpha = 1.0;
        }
      } else {
        slot.nameplate.tint = 0xcccccc; // Slightly dimmed
        slot.nameplate.alpha = 0.9;
        // Match attachment and decorative corner color to nameplate
        if (slot.attachment) {
          slot.attachment.tint = 0xcccccc;
          slot.attachment.alpha = 0.9;
        }
        if (slot.decorativeCorner) {
          slot.decorativeCorner.tint = 0xcccccc;
          slot.decorativeCorner.alpha = 0.9;
        }
      }

      // Update gem glow intensity based on hover state
      // The gem container contains glow layers and the gem itself
      if (isHovered) {
        slot.gem.alpha = 1.2; // Brighter when hovered
      } else {
        slot.gem.alpha = 1.0; // Normal brightness
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
   * Handle slot selection
   */
  private async handleSlotSelection(): Promise<void> {
    const selectedSlot = this.profileData[this.state.selectedSlotIndex];
    const slotIndex = this.state.selectedSlotIndex;

    // Route based on current mode
    switch (this.state.mode) {
      case 'normal':
        // Normal mode - create or load profile
        if (selectedSlot.isEmpty) {
          // Empty slot - go to name entry
          console.log(`🆕 Creating new profile in slot ${selectedSlot.slotNumber}`);
          this.config.onNewProfile?.(selectedSlot.slotNumber);
        } else {
          // Filled slot - load profile
          console.log(`▶️ Loading profile: ${selectedSlot.dragonName}`);
          this.config.onProfileSelected?.(selectedSlot.profileId!, selectedSlot.slotNumber);
        }
        break;

      case 'copy-source':
        // User is selecting which profile to copy FROM
        if (selectedSlot.isEmpty) {
          console.warn('⚠️ Cannot copy from empty slot');
          return;
        }

        console.log(`📋 Selected slot ${slotIndex} as copy source`);
        this.state.copySourceSlot = slotIndex;
        this.state.mode = 'copy-destination';
        this.updateInstructionText('Select an empty slot to copy to');
        this.updateSlotHighlights();
        break;

      case 'copy-destination':
        // User is selecting which empty slot to copy TO
        if (!selectedSlot.isEmpty) {
          console.warn('⚠️ Cannot copy to filled slot');
          return;
        }

        if (this.state.copySourceSlot === null) {
          console.error('❌ No copy source set');
          this.state.mode = 'normal';
          return;
        }

        console.log(
          `📋 Selected slot ${slotIndex} as copy destination from slot ${this.state.copySourceSlot}`,
        );
        await this.executeCopy(this.state.copySourceSlot, slotIndex);
        break;

      case 'delete-target': {
        // User is selecting which profile to delete
        if (selectedSlot.isEmpty) {
          console.warn('⚠️ Cannot delete empty slot');
          return;
        }

        console.log(`🗑️ Selected slot ${slotIndex} for deletion`);
        this.state.deleteTargetSlot = slotIndex;

        // Show confirmation dialog
        const confirmed = await this.showDeleteConfirmation();
        if (confirmed) {
          await this.executeDelete(slotIndex);
        } else {
          console.log('🚫 Delete operation cancelled');
          this.state.mode = 'normal';
          this.state.deleteTargetSlot = null;
          this.updateInstructionText('Select a profile or create a new one');
          this.updateSlotHighlights();
        }
        break;
      }
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

    // Mouse click - only select if clicking on a hovered slot
    this.clickHandler = () => {
      if (this.state.hoveredSlotIndex !== -1) {
        this.state.selectedSlotIndex = this.state.hoveredSlotIndex;
        this.handleSlotSelection();
      }
    };
    this.app.canvas.addEventListener('click', this.clickHandler);

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

    if (this.clickHandler) {
      this.app.canvas.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
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
    const previousSelection = this.state.selectedSlotIndex;

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
        // Cancel copy/delete operations if in progress
        if (this.state.mode !== 'normal') {
          console.log(`🚫 Canceling ${this.state.mode} operation`);
          this.state.mode = 'normal';
          this.state.copySourceSlot = null;
          this.state.deleteTargetSlot = null;
          this.updateInstructionText('Select a profile or create a new one');
          this.updateSlotHighlights();
        } else {
          this.hide();
        }
        break;
    }

    // Update visuals if selection changed (to switch between simple/extended attachments)
    if (previousSelection !== this.state.selectedSlotIndex) {
      this.updateSlotVisuals();
    }
  }

  /**
   * Handle mouse movement (hover detection)
   */
  private handleMouseMove(event: MouseEvent): void {
    const rect = this.app.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check slot hover - use nameplate bounds, not container bounds
    // (container includes arrow at x=-20 and text that may extend beyond nameplate)
    this.state.hoveredSlotIndex = -1;
    for (let i = 0; i < 3; i++) {
      const slot = this.slots[i];
      const bounds = slot.nameplate.getBounds();

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
