/**
 * Targeting UI System for Draconia Chronicles
 * Provides user interface components for targeting strategy selection and configuration
 */

import type {
  TargetingStrategy,
  TargetPersistenceMode,
  TargetingConfig,
  PlayerTargetingPreferences,
} from './types.js';
import { createTargetingConfigManager } from './targeting-config.js';
import { createTargetingUnlockSystem } from './targeting-unlock.js';

/**
 * UI component interface
 */
export interface TargetingUIComponent {
  id: string;
  type: 'strategy-selector' | 'persistence-selector' | 'config-panel' | 'preset-selector';
  element: HTMLElement;
  isVisible: boolean;
  isEnabled: boolean;
}

/**
 * UI event types
 */
export type TargetingUIEventType =
  | 'strategy-selected'
  | 'persistence-mode-selected'
  | 'config-changed'
  | 'preset-selected'
  | 'ui-opened'
  | 'ui-closed';

/**
 * UI event data
 */
export interface TargetingUIEvent {
  type: TargetingUIEventType;
  data: Record<string, any>;
  timestamp: number;
}

/**
 * UI configuration
 */
export interface TargetingUIConfig {
  theme: 'light' | 'dark' | 'auto';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size: 'small' | 'medium' | 'large';
  showTooltips: boolean;
  showDescriptions: boolean;
  enableAnimations: boolean;
  autoClose: boolean;
  autoCloseDelay: number;
}

/**
 * Targeting UI Manager
 */
export class TargetingUIManager {
  private config: TargetingUIConfig;
  private configManager = createTargetingConfigManager();
  private unlockSystem = createTargetingUnlockSystem();
  private components: Map<string, TargetingUIComponent> = new Map();
  private eventListeners: Map<string, (event: TargetingUIEvent) => void> = new Map();
  private isOpen = false;
  private container: HTMLElement | null = null;

  constructor(config: Partial<TargetingUIConfig> = {}) {
    this.config = {
      theme: 'auto',
      position: 'top-right',
      size: 'medium',
      showTooltips: true,
      showDescriptions: true,
      enableAnimations: true,
      autoClose: true,
      autoCloseDelay: 5000,
      ...config,
    };
  }

  /**
   * Initialize the UI system
   */
  async initialize(): Promise<void> {
    await this.createContainer();
    await this.createComponents();
    this.setupEventHandlers();
    this.applyTheme();
  }

  /**
   * Open the targeting UI
   */
  open(): void {
    if (this.isOpen || !this.container) return;

    this.isOpen = true;
    this.container.style.display = 'block';

    if (this.config.enableAnimations) {
      this.container.classList.add('targeting-ui-open');
    }

    this.emitEvent('ui-opened', {});

    if (this.config.autoClose) {
      setTimeout(() => this.close(), this.config.autoCloseDelay);
    }
  }

  /**
   * Close the targeting UI
   */
  close(): void {
    if (!this.isOpen || !this.container) return;

    this.isOpen = false;

    if (this.config.enableAnimations) {
      this.container.classList.add('targeting-ui-closing');
      setTimeout(() => {
        if (this.container) {
          this.container.style.display = 'none';
          this.container.classList.remove('targeting-ui-closing');
        }
      }, 300);
    } else {
      this.container.style.display = 'none';
    }

    this.emitEvent('ui-closed', {});
  }

  /**
   * Toggle the targeting UI
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Update UI configuration
   */
  updateConfig(newConfig: Partial<TargetingUIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.applyTheme();
    this.updateComponentVisibility();
  }

  /**
   * Add event listener
   */
  addEventListener(
    eventType: TargetingUIEventType,
    listener: (event: TargetingUIEvent) => void,
  ): void {
    this.eventListeners.set(eventType, listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: TargetingUIEventType): void {
    this.eventListeners.delete(eventType);
  }

  /**
   * Get current targeting configuration
   */
  getCurrentConfig(): TargetingConfig {
    return this.configManager.getConfig();
  }

  /**
   * Update targeting configuration
   */
  async updateTargetingConfig(config: Partial<TargetingConfig>): Promise<void> {
    await this.configManager.updateConfig(config);
    this.updateComponentStates();
    this.emitEvent('config-changed', { config });
  }

  /**
   * Create the main container
   */
  private async createContainer(): Promise<void> {
    if (typeof document === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'targeting-ui-container';
    this.container.className = 'targeting-ui-container';
    this.container.style.display = 'none';

    // Apply position
    this.applyPosition();

    // Add to document
    document.body.appendChild(this.container);

    // Add CSS styles
    this.addStyles();
  }

  /**
   * Create UI components
   */
  private async createComponents(): Promise<void> {
    if (!this.container) return;

    // Strategy selector
    const strategySelector = this.createStrategySelector();
    this.components.set('strategy-selector', strategySelector);
    this.container.appendChild(strategySelector.element);

    // Persistence mode selector
    const persistenceSelector = this.createPersistenceSelector();
    this.components.set('persistence-selector', persistenceSelector);
    this.container.appendChild(persistenceSelector.element);

    // Configuration panel
    const configPanel = this.createConfigPanel();
    this.components.set('config-panel', configPanel);
    this.container.appendChild(configPanel.element);

    // Preset selector
    const presetSelector = this.createPresetSelector();
    this.components.set('preset-selector', presetSelector);
    this.container.appendChild(presetSelector.element);
  }

  /**
   * Create strategy selector component
   */
  private createStrategySelector(): TargetingUIComponent {
    const element = document.createElement('div');
    element.className = 'targeting-ui-component strategy-selector';
    element.innerHTML = `
      <div class="component-header">
        <h3>Targeting Strategy</h3>
        <button class="close-btn" aria-label="Close">×</button>
      </div>
      <div class="strategy-list">
        <!-- Strategies will be populated dynamically -->
      </div>
    `;

    return {
      id: 'strategy-selector',
      type: 'strategy-selector',
      element,
      isVisible: true,
      isEnabled: true,
    };
  }

  /**
   * Create persistence mode selector component
   */
  private createPersistenceSelector(): TargetingUIComponent {
    const element = document.createElement('div');
    element.className = 'targeting-ui-component persistence-selector';
    element.innerHTML = `
      <div class="component-header">
        <h3>Target Persistence</h3>
      </div>
      <div class="persistence-list">
        <!-- Persistence modes will be populated dynamically -->
      </div>
    `;

    return {
      id: 'persistence-selector',
      type: 'persistence-selector',
      element,
      isVisible: true,
      isEnabled: true,
    };
  }

  /**
   * Create configuration panel component
   */
  private createConfigPanel(): TargetingUIComponent {
    const element = document.createElement('div');
    element.className = 'targeting-ui-component config-panel';
    element.innerHTML = `
      <div class="component-header">
        <h3>Configuration</h3>
      </div>
      <div class="config-options">
        <div class="config-group">
          <label for="range-slider">Attack Range</label>
          <input type="range" id="range-slider" min="100" max="1000" value="500" step="50">
          <span class="range-value">500</span>
        </div>
        <div class="config-group">
          <label for="lock-duration">Target Lock Duration (ms)</label>
          <input type="range" id="lock-duration" min="0" max="5000" value="1000" step="100">
          <span class="lock-duration-value">1000</span>
        </div>
      </div>
    `;

    return {
      id: 'config-panel',
      type: 'config-panel',
      element,
      isVisible: true,
      isEnabled: true,
    };
  }

  /**
   * Create preset selector component
   */
  private createPresetSelector(): TargetingUIComponent {
    const element = document.createElement('div');
    element.className = 'targeting-ui-component preset-selector';
    element.innerHTML = `
      <div class="component-header">
        <h3>Presets</h3>
      </div>
      <div class="preset-list">
        <button class="preset-btn" data-preset="aggressive">Aggressive</button>
        <button class="preset-btn" data-preset="defensive">Defensive</button>
        <button class="preset-btn" data-preset="balanced">Balanced</button>
        <button class="preset-btn" data-preset="custom">Custom</button>
      </div>
    `;

    return {
      id: 'preset-selector',
      type: 'preset-selector',
      element,
      isVisible: true,
      isEnabled: true,
    };
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.container) return;

    // Close button
    const closeBtn = this.container.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Strategy selection
    const strategySelector = this.components.get('strategy-selector');
    if (strategySelector) {
      strategySelector.element.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('strategy-btn')) {
          const strategy = target.dataset.strategy as TargetingStrategy;
          this.selectStrategy(strategy);
        }
      });
    }

    // Persistence mode selection
    const persistenceSelector = this.components.get('persistence-selector');
    if (persistenceSelector) {
      persistenceSelector.element.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('persistence-btn')) {
          const mode = target.dataset.mode as TargetPersistenceMode;
          this.selectPersistenceMode(mode);
        }
      });
    }

    // Configuration changes
    const configPanel = this.components.get('config-panel');
    if (configPanel) {
      configPanel.element.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.id === 'range-slider') {
          this.updateRange(parseInt(target.value));
        } else if (target.id === 'lock-duration') {
          this.updateLockDuration(parseInt(target.value));
        }
      });
    }

    // Preset selection
    const presetSelector = this.components.get('preset-selector');
    if (presetSelector) {
      presetSelector.element.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('preset-btn')) {
          const preset = target.dataset.preset;
          this.selectPreset(preset);
        }
      });
    }
  }

  /**
   * Select targeting strategy
   */
  private async selectStrategy(strategy: TargetingStrategy): Promise<void> {
    await this.updateTargetingConfig({ primaryStrategy: strategy });
    this.updateComponentStates();
    this.emitEvent('strategy-selected', { strategy });
  }

  /**
   * Select persistence mode
   */
  private async selectPersistenceMode(mode: TargetPersistenceMode): Promise<void> {
    await this.updateTargetingConfig({ persistenceMode: mode });
    this.updateComponentStates();
    this.emitEvent('persistence-mode-selected', { mode });
  }

  /**
   * Update attack range
   */
  private async updateRange(range: number): Promise<void> {
    await this.updateTargetingConfig({ range });
    this.updateRangeDisplay(range);
  }

  /**
   * Update target lock duration
   */
  private async updateLockDuration(duration: number): Promise<void> {
    await this.updateTargetingConfig({ targetLockDuration: duration });
    this.updateLockDurationDisplay(duration);
  }

  /**
   * Select preset configuration
   */
  private async selectPreset(preset: string): Promise<void> {
    const presetConfig = this.getPresetConfig(preset);
    if (presetConfig) {
      await this.updateTargetingConfig(presetConfig);
      this.updateComponentStates();
      this.emitEvent('preset-selected', { preset, config: presetConfig });
    }
  }

  /**
   * Get preset configuration
   */
  private getPresetConfig(preset: string): Partial<TargetingConfig> | null {
    switch (preset) {
      case 'aggressive':
        return {
          primaryStrategy: 'highest_threat',
          persistenceMode: 'switch_aggressive',
          range: 600,
          targetLockDuration: 500,
        };
      case 'defensive':
        return {
          primaryStrategy: 'lowest_threat',
          persistenceMode: 'keep_target',
          range: 400,
          targetLockDuration: 2000,
        };
      case 'balanced':
        return {
          primaryStrategy: 'closest',
          persistenceMode: 'switch_freely',
          range: 500,
          targetLockDuration: 1000,
        };
      case 'custom':
        return null; // Use current configuration
      default:
        return null;
    }
  }

  /**
   * Update component states
   */
  private updateComponentStates(): void {
    const config = this.getCurrentConfig();

    // Update strategy selector
    this.updateStrategySelector(config.primaryStrategy);

    // Update persistence selector
    this.updatePersistenceSelector(config.persistenceMode);

    // Update config panel
    this.updateConfigPanel(config);
  }

  /**
   * Update strategy selector
   */
  private updateStrategySelector(selectedStrategy: TargetingStrategy): void {
    const strategySelector = this.components.get('strategy-selector');
    if (!strategySelector) return;

    const strategyList = strategySelector.element.querySelector('.strategy-list');
    if (!strategyList) return;

    // Clear existing strategies
    strategyList.innerHTML = '';

    // Get available strategies
    const strategies = this.getAvailableStrategies();

    strategies.forEach((strategy) => {
      const button = document.createElement('button');
      button.className = `strategy-btn ${strategy === selectedStrategy ? 'selected' : ''}`;
      button.dataset.strategy = strategy;
      button.textContent = this.getStrategyDisplayName(strategy);

      if (this.config.showTooltips) {
        button.title = this.getStrategyDescription(strategy);
      }

      strategyList.appendChild(button);
    });
  }

  /**
   * Update persistence selector
   */
  private updatePersistenceSelector(selectedMode: TargetPersistenceMode): void {
    const persistenceSelector = this.components.get('persistence-selector');
    if (!persistenceSelector) return;

    const persistenceList = persistenceSelector.element.querySelector('.persistence-list');
    if (!persistenceList) return;

    // Clear existing modes
    persistenceList.innerHTML = '';

    // Get available modes
    const modes = this.getAvailablePersistenceModes();

    modes.forEach((mode) => {
      const button = document.createElement('button');
      button.className = `persistence-btn ${mode === selectedMode ? 'selected' : ''}`;
      button.dataset.mode = mode;
      button.textContent = this.getPersistenceModeDisplayName(mode);

      if (this.config.showTooltips) {
        button.title = this.getPersistenceModeDescription(mode);
      }

      persistenceList.appendChild(button);
    });
  }

  /**
   * Update configuration panel
   */
  private updateConfigPanel(config: TargetingConfig): void {
    const configPanel = this.components.get('config-panel');
    if (!configPanel) return;

    const rangeSlider = configPanel.element.querySelector('#range-slider') as HTMLInputElement;
    const lockDurationSlider = configPanel.element.querySelector(
      '#lock-duration',
    ) as HTMLInputElement;

    if (rangeSlider) {
      rangeSlider.value = config.range.toString();
      this.updateRangeDisplay(config.range);
    }

    if (lockDurationSlider) {
      lockDurationSlider.value = config.targetLockDuration.toString();
      this.updateLockDurationDisplay(config.targetLockDuration);
    }
  }

  /**
   * Update range display
   */
  private updateRangeDisplay(range: number): void {
    const rangeValue = this.container?.querySelector('.range-value');
    if (rangeValue) {
      rangeValue.textContent = range.toString();
    }
  }

  /**
   * Update lock duration display
   */
  private updateLockDurationDisplay(duration: number): void {
    const lockDurationValue = this.container?.querySelector('.lock-duration-value');
    if (lockDurationValue) {
      lockDurationValue.textContent = duration.toString();
    }
  }

  /**
   * Get available strategies
   */
  private getAvailableStrategies(): TargetingStrategy[] {
    // This would integrate with the unlock system
    return [
      'closest',
      'highest_threat',
      'lowest_threat',
      'highest_hp',
      'lowest_hp',
      'elemental_weak',
    ];
  }

  /**
   * Get available persistence modes
   */
  private getAvailablePersistenceModes(): TargetPersistenceMode[] {
    return ['keep_target', 'switch_freely', 'switch_aggressive', 'manual_only'];
  }

  /**
   * Get strategy display name
   */
  private getStrategyDisplayName(strategy: TargetingStrategy): string {
    const names: Record<TargetingStrategy, string> = {
      closest: 'Closest',
      highest_threat: 'Highest Threat',
      lowest_threat: 'Lowest Threat',
      highest_hp: 'Highest Health',
      lowest_hp: 'Lowest Health',
      highest_damage: 'Highest Damage',
      lowest_damage: 'Lowest Damage',
      fastest: 'Fastest',
      slowest: 'Slowest',
      highest_armor: 'Highest Armor',
      lowest_armor: 'Lowest Armor',
      highest_shield: 'Highest Shield',
      lowest_shield: 'Lowest Shield',
      elemental_weak: 'Elemental Weakness',
      elemental_strength: 'Elemental Strength',
      custom: 'Custom',
    };
    return names[strategy] || strategy;
  }

  /**
   * Get strategy description
   */
  private getStrategyDescription(strategy: TargetingStrategy): string {
    const descriptions: Record<TargetingStrategy, string> = {
      closest: 'Target the nearest enemy',
      highest_threat: 'Target the most dangerous enemy',
      lowest_threat: 'Target the least dangerous enemy',
      highest_hp: 'Target the enemy with most health',
      lowest_hp: 'Target the enemy with least health',
      highest_damage: 'Target the enemy dealing most damage',
      lowest_damage: 'Target the enemy dealing least damage',
      fastest: 'Target the fastest moving enemy',
      slowest: 'Target the slowest moving enemy',
      highest_armor: 'Target the enemy with most armor',
      lowest_armor: 'Target the enemy with least armor',
      highest_shield: 'Target the enemy with most shield',
      lowest_shield: 'Target the enemy with least shield',
      elemental_weak: 'Target enemies weak to your element',
      elemental_strength: 'Target enemies strong against your element',
      custom: 'Use custom targeting logic',
    };
    return descriptions[strategy] || 'Custom targeting strategy';
  }

  /**
   * Get persistence mode display name
   */
  private getPersistenceModeDisplayName(mode: TargetPersistenceMode): string {
    const names: Record<TargetPersistenceMode, string> = {
      keep_target: 'Keep Target',
      switch_freely: 'Switch Freely',
      switch_aggressive: 'Switch Aggressive',
      manual_only: 'Manual Only',
    };
    return names[mode] || mode;
  }

  /**
   * Get persistence mode description
   */
  private getPersistenceModeDescription(mode: TargetPersistenceMode): string {
    const descriptions: Record<TargetPersistenceMode, string> = {
      keep_target: 'Keep current target until it dies',
      switch_freely: 'Switch to better targets when available',
      switch_aggressive: 'Always switch to best available target',
      manual_only: 'Only switch when manually changed',
    };
    return descriptions[mode] || 'Custom persistence mode';
  }

  /**
   * Apply theme
   */
  private applyTheme(): void {
    if (!this.container) return;

    const theme =
      this.config.theme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : this.config.theme;

    this.container.className = `targeting-ui-container theme-${theme}`;
  }

  /**
   * Apply position
   */
  private applyPosition(): void {
    if (!this.container) return;

    const positions = {
      'top-left': { top: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    };

    const position = positions[this.config.position];
    Object.assign(this.container.style, position);
  }

  /**
   * Update component visibility
   */
  private updateComponentVisibility(): void {
    this.components.forEach((component) => {
      component.element.style.display = component.isVisible ? 'block' : 'none';
    });
  }

  /**
   * Add CSS styles
   */
  private addStyles(): void {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      .targeting-ui-container {
        position: fixed;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #4a9eff;
        border-radius: 8px;
        padding: 20px;
        min-width: 300px;
        max-width: 400px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
      }

      .targeting-ui-container.theme-light {
        background: rgba(255, 255, 255, 0.95);
        color: #333;
        border-color: #007acc;
      }

      .targeting-ui-container.theme-dark {
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        border-color: #4a9eff;
      }

      .targeting-ui-component {
        margin-bottom: 15px;
      }

      .component-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #4a9eff;
      }

      .component-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        color: #4a9eff;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #fff;
        background: #4a9eff;
        border-radius: 50%;
      }

      .strategy-list, .persistence-list, .preset-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .strategy-btn, .persistence-btn, .preset-btn {
        padding: 8px 12px;
        border: 1px solid #4a9eff;
        background: transparent;
        color: #4a9eff;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .strategy-btn:hover, .persistence-btn:hover, .preset-btn:hover {
        background: #4a9eff;
        color: #fff;
      }

      .strategy-btn.selected, .persistence-btn.selected, .preset-btn.selected {
        background: #4a9eff;
        color: #fff;
      }

      .config-options {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .config-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .config-group label {
        font-size: 12px;
        font-weight: 500;
        color: #4a9eff;
      }

      .config-group input[type="range"] {
        width: 100%;
        height: 4px;
        background: #333;
        outline: none;
        border-radius: 2px;
      }

      .config-group input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        background: #4a9eff;
        border-radius: 50%;
        cursor: pointer;
      }

      .config-group input[type="range"]::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: #4a9eff;
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }

      .range-value, .lock-duration-value {
        font-size: 12px;
        color: #4a9eff;
        font-weight: 600;
      }

      .targeting-ui-open {
        animation: slideIn 0.3s ease-out;
      }

      .targeting-ui-closing {
        animation: slideOut 0.3s ease-in;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Emit event
   */
  private emitEvent(type: TargetingUIEventType, data: Record<string, any>): void {
    const event: TargetingUIEvent = {
      type,
      data,
      timestamp: Date.now(),
    };

    const listener = this.eventListeners.get(type);
    if (listener) {
      listener(event);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.components.clear();
    this.eventListeners.clear();
  }
}

/**
 * Create targeting UI manager
 */
export function createTargetingUI(config?: Partial<TargetingUIConfig>): TargetingUIManager {
  return new TargetingUIManager(config);
}

/**
 * Targeting UI utilities
 */
export const TargetingUIUtils = {
  /**
   * Create targeting UI button
   */
  createTargetingButton(text: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button');
    button.className = 'targeting-ui-trigger';
    button.textContent = text;
    button.addEventListener('click', onClick);

    // Add button styles
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999;
      padding: 10px 15px;
      background: #4a9eff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = '#3a8eef';
      button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#4a9eff';
      button.style.transform = 'translateY(0)';
    });

    return button;
  },

  /**
   * Create targeting UI toggle
   */
  createTargetingToggle(uiManager: TargetingUIManager): HTMLElement {
    return this.createTargetingButton('Targeting', () => uiManager.toggle());
  },

  /**
   * Create targeting status indicator
   */
  createTargetingStatus(config: TargetingConfig): HTMLElement {
    const indicator = document.createElement('div');
    indicator.className = 'targeting-status';
    indicator.innerHTML = `
      <div class="status-item">
        <span class="status-label">Strategy:</span>
        <span class="status-value">${config.primaryStrategy}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Mode:</span>
        <span class="status-value">${config.persistenceMode}</span>
      </div>
      <div class="status-item">
        <span class="status-label">Range:</span>
        <span class="status-value">${config.range}</span>
      </div>
    `;

    // Add status styles
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 998;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      border: 1px solid #4a9eff;
    `;

    return indicator;
  },
};
