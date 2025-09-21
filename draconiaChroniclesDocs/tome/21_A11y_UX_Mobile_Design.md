--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/21*A11y*UX*Mobile*Design.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 21 — Accessibility & Mobile UX

## Accessibility Framework

### WCAG 2.1 AA Compliance

````typescript

export interface AccessibilityStandards {
  // Visual Accessibility
  colorContrast: {
    normalText: number; // 4.5:1 minimum
    largeText: number;  // 3:1 minimum
    uiComponents: number; // 3:1 minimum
  };

  // Motor Accessibility
  touchTargets: {
    minimumSize: number; // 44x44 pixels
    spacing: number;     // 8px minimum between targets
    gestureArea: number; // 48x48 pixels for gestures
  };

  // Cognitive Accessibility
  informationArchitecture: {
    clearHierarchy: boolean;
    consistentNavigation: boolean;
    errorPrevention: boolean;
    helpSystem: boolean;
  };

  // Auditory Accessibility
  audioAlternatives: {
    visualIndicators: boolean;
    captions: boolean;
    transcripts: boolean;
    hapticFeedback: boolean;
  };
}

```javascript

### Accessibility Implementation

```typescript

export class AccessibilityManager {
  private settings: AccessibilitySettings;
  private features: AccessibilityFeatures;

  constructor(settings: AccessibilitySettings) {
    this.settings = settings;
    this.features = this.initializeFeatures();
  }

  private initializeFeatures(): AccessibilityFeatures {
    return {
      reducedMotion: this.settings.reducedMotion,
      highContrast: this.settings.highContrast,
      fontSize: this.settings.fontSize,
      colorBlindMode: this.settings.colorBlindMode,
      screenReader: this.settings.screenReader,
      keyboardNavigation: this.settings.keyboardNavigation,
      voiceControl: this.settings.voiceControl
    };
  }

  applyAccessibilityFeatures(): void {
    this.applyVisualAccessibility();
    this.applyMotorAccessibility();
    this.applyCognitiveAccessibility();
    this.applyAuditoryAccessibility();
  }

  private applyVisualAccessibility(): void {
    if (this.features.highContrast) {
      this.enableHighContrastMode();
    }

    if (this.features.fontSize !== 'medium') {
      this.adjustFontSize(this.features.fontSize);
    }

    if (this.features.colorBlindMode !== 'none') {
      this.applyColorBlindMode(this.features.colorBlindMode);
    }
  }

  private applyMotorAccessibility(): void {
    if (this.features.keyboardNavigation) {
      this.enableKeyboardNavigation();
    }

    if (this.features.voiceControl) {
      this.enableVoiceControl();
    }

    this.ensureTouchTargetSizes();
  }
}

```text

## Visual Accessibility

### High Contrast Mode

```typescript

export class HighContrastMode {
  private isEnabled: boolean = false;
  private originalColors: Map<string, string> = new Map();

  enable(): void {
    this.isEnabled = true;
    this.storeOriginalColors();
    this.applyHighContrastColors();
  }

  disable(): void {
    this.isEnabled = false;
    this.restoreOriginalColors();
  }

  private applyHighContrastColors(): void {
    const highContrastColors = {
      '--color-primary': '#FFFFFF',
      '--color-secondary': '#000000',
      '--color-accent': '#FFFF00',
      '--color-background': '#000000',
      '--color-text': '#FFFFFF',
      '--color-button': '#FFFFFF',
      '--color-button-text': '#000000',
      '--color-border': '#FFFFFF',
      '--color-shadow': 'rgba(255, 255, 255, 0.3)'
    };

    for (const [property, value] of Object.entries(highContrastColors)) {
      document.documentElement.style.setProperty(property, value);
    }
  }

  private storeOriginalColors(): void {
    const style = getComputedStyle(document.documentElement);
    const colorProperties = [
      '--color-primary', '--color-secondary', '--color-accent',
      '--color-background', '--color-text', '--color-button',
      '--color-button-text', '--color-border', '--color-shadow'
    ];

    for (const property of colorProperties) {
      this.originalColors.set(property, style.getPropertyValue(property));
    }
  }
}

```javascript

### Color Blind Support

```typescript

export class ColorBlindSupport {
  private colorBlindMode: ColorBlindMode = 'none';

  setColorBlindMode(mode: ColorBlindMode): void {
    this.colorBlindMode = mode;
    this.applyColorBlindFilters();
  }

  private applyColorBlindFilters(): void {
    const filters = {
      none: 'none',
      protanopia: 'url(#protanopia-filter)',
      deuteranopia: 'url(#deuteranopia-filter)',
      tritanopia: 'url(#tritanopia-filter)',
      achromatopsia: 'url(#achromatopsia-filter)'
    };

    const filter = filters[this.colorBlindMode];
    document.documentElement.style.filter = filter;
  }

  createColorBlindFilters(): void {
    const svg = document.createElementNS('<http://www.w3.org/2000/svg',> 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';

    const defs = document.createElementNS('<http://www.w3.org/2000/svg',> 'defs');

    // Protanopia filter
    const protanopiaFilter = this.createColorBlindFilter('protanopia-filter', [
      0.567, 0.433, 0, 0, 0,
      0.558, 0.442, 0, 0, 0,
      0, 0.242, 0.758, 0, 0,
      0, 0, 0, 1, 0
    ]);
    defs.appendChild(protanopiaFilter);

    // Deuteranopia filter
    const deuteranopiaFilter = this.createColorBlindFilter('deuteranopia-filter', [
      0.625, 0.375, 0, 0, 0,
      0.7, 0.3, 0, 0, 0,
      0, 0.3, 0.7, 0, 0,
      0, 0, 0, 1, 0
    ]);
    defs.appendChild(deuteranopiaFilter);

    // Tritanopia filter
    const tritanopiaFilter = this.createColorBlindFilter('tritanopia-filter', [
      0.95, 0.05, 0, 0, 0,
      0, 0.433, 0.567, 0, 0,
      0, 0.475, 0.525, 0, 0,
      0, 0, 0, 1, 0
    ]);
    defs.appendChild(tritanopiaFilter);

    svg.appendChild(defs);
    document.body.appendChild(svg);
  }
}

```javascript

### Font Scaling

```typescript

export class FontScaling {
  private currentScale: FontScale = 'medium';

  setFontScale(scale: FontScale): void {
    this.currentScale = scale;
    this.applyFontScale();
  }

  private applyFontScale(): void {
    const scaleFactors = {
      small: 0.875,
      medium: 1.0,
      large: 1.125,
      extraLarge: 1.25
    };

    const scaleFactor = scaleFactors[this.currentScale];
    document.documentElement.style.fontSize = `${scaleFactor}em`;
  }

  adjustForScreenSize(): void {
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
      // Mobile: use smaller base font
      document.documentElement.style.fontSize = '14px';
    } else if (screenWidth < 1024) {
      // Tablet: use medium base font
      document.documentElement.style.fontSize = '16px';
    } else {
      // Desktop: use larger base font
      document.documentElement.style.fontSize = '18px';
    }
  }
}

```text

## Motor Accessibility

### Touch Target Optimization

```typescript

export class TouchTargetOptimization {
  private minimumSize: number = 44; // pixels
  private minimumSpacing: number = 8; // pixels

  optimizeTouchTargets(): void {
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], input, select, textarea, a, [tabindex]'
    );

    interactiveElements.forEach(element => {
      this.ensureMinimumSize(element);
      this.ensureMinimumSpacing(element);
    });
  }

  private ensureMinimumSize(element: Element): void {
    const rect = element.getBoundingClientRect();
    const currentSize = Math.min(rect.width, rect.height);

    if (currentSize < this.minimumSize) {
      const scale = this.minimumSize / currentSize;
      element.style.transform = `scale(${scale})`;
      element.style.transformOrigin = 'center';
    }
  }

  private ensureMinimumSpacing(element: Element): void {
    const siblings = Array.from(element.parentElement?.children || []);
    const currentIndex = siblings.indexOf(element);

    if (currentIndex > 0) {
      const previousElement = siblings[currentIndex - 1];
      const currentRect = element.getBoundingClientRect();
      const previousRect = previousElement.getBoundingClientRect();

      const spacing = currentRect.left - previousRect.right;

      if (spacing < this.minimumSpacing) {
        element.style.marginLeft = `${this.minimumSpacing - spacing}px`;
      }
    }
  }
}

```javascript

### Keyboard Navigation

```typescript

export class KeyboardNavigation {
  private focusableElements: Element[] = [];
  private currentFocusIndex: number = 0;

  initialize(): void {
    this.updateFocusableElements();
    this.setupKeyboardEventListeners();
    this.setupFocusManagement();
  }

  private updateFocusableElements(): void {
    this.focusableElements = Array.from(
      document.querySelectorAll(
'button, [role="button"], input, select, textarea, a, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  private setupKeyboardEventListeners(): void {
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Tab':
          this.handleTabNavigation(event);
          break;
        case 'Enter':
        case ' ':
          this.handleActivation(event);
          break;
        case 'Escape':
          this.handleEscape(event);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.handleArrowNavigation(event);
          break;
      }
    });
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    if (event.shiftKey) {
      this.focusPrevious();
    } else {
      this.focusNext();
    }

    event.preventDefault();
  }

  private handleActivation(event: KeyboardEvent): void {
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement instanceof HTMLElement) {
      focusedElement.click();
    }
  }

  private focusNext(): void {
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex].focus();
  }

  private focusPrevious(): void {
    this.currentFocusIndex = this.currentFocusIndex === 0
      ? this.focusableElements.length - 1
      : this.currentFocusIndex - 1;
    this.focusableElements[this.currentFocusIndex].focus();
  }
}

```javascript

### Voice Control

```typescript

export class VoiceControl {
  private recognition: SpeechRecognition;
  private isEnabled: boolean = false;

  constructor() {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.setupRecognition();
  }

  private setupRecognition(): void {
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        this.handleVoiceCommand(result[0].transcript.toLowerCase());
      }
    };
  }

  enable(): void {
    this.isEnabled = true;
    this.recognition.start();
  }

  disable(): void {
    this.isEnabled = false;
    this.recognition.stop();
  }

  private handleVoiceCommand(command: string): void {
    const commands = {
      'start journey': () => this.triggerJourneyStart(),
      'return to draconia': () => this.triggerReturn(),
      'upgrade firepower': () => this.triggerUpgrade('firepower'),
      'upgrade scales': () => this.triggerUpgrade('scales'),
      'upgrade safety': () => this.triggerUpgrade('safety'),
      'use ability': () => this.triggerAbility(),
      'open settings': () => this.triggerSettings(),
      'pause game': () => this.triggerPause(),
      'resume game': () => this.triggerResume()
    };

    for (const [voiceCommand, action] of Object.entries(commands)) {
      if (command.includes(voiceCommand)) {
        action();
        break;
      }
    }
  }
}

```text

## Reduced Motion Support

### Motion Reduction

```typescript

export class ReducedMotionSupport {
  private isReducedMotion: boolean = false;

  constructor() {
    this.detectReducedMotionPreference();
    this.setupMotionReduction();
  }

  private detectReducedMotionPreference(): void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = mediaQuery.matches;

    mediaQuery.addEventListener('change', (event) => {
      this.isReducedMotion = event.matches;
      this.applyMotionReduction();
    });
  }

  private setupMotionReduction(): void {
    if (this.isReducedMotion) {
      this.applyMotionReduction();
    }
  }

  private applyMotionReduction(): void {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .particle-effect {
        display: none !important;
      }

      .screen-shake {
        transform: none !important;
      }

      .parallax {
        transform: none !important;
      }
    `;

    document.head.appendChild(style);
  }
}

```text

## Mobile UX Design

### Responsive Layout

```typescript

export class ResponsiveLayout {
  private breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };

  private currentBreakpoint: string = 'desktop';

  constructor() {
    this.detectBreakpoint();
    this.setupResizeListener();
    this.applyResponsiveLayout();
  }

  private detectBreakpoint(): void {
    const width = window.innerWidth;

    if (width < this.breakpoints.mobile) {
      this.currentBreakpoint = 'mobile';
    } else if (width < this.breakpoints.tablet) {
      this.currentBreakpoint = 'tablet';
    } else {
      this.currentBreakpoint = 'desktop';
    }
  }

  private applyResponsiveLayout(): void {
    const layoutConfigs = {
      mobile: {
        currencyRail: { position: 'top', layout: 'vertical' },
        systemButtons: { position: 'top-right', layout: 'stacked' },
        distanceBar: { position: 'top-center', height: 'thin' },
        enchantPanel: { position: 'bottom', layout: 'horizontal-scroll' },
        dragonAnchor: { position: 'left', size: 'small' }
      },
      tablet: {
        currencyRail: { position: 'top-left', layout: 'horizontal' },
        systemButtons: { position: 'top-right', layout: 'grid' },
        distanceBar: { position: 'top-center', height: 'medium' },
        enchantPanel: { position: 'right', layout: 'vertical-scroll' },
        dragonAnchor: { position: 'left', size: 'medium' }
      },
      desktop: {
        currencyRail: { position: 'top-left', layout: 'horizontal' },
        systemButtons: { position: 'top-right', layout: 'grid' },
        distanceBar: { position: 'top-center', height: 'thin' },
        enchantPanel: { position: 'right', layout: 'three-column' },
        dragonAnchor: { position: 'left', size: 'large' }
      }
    };

    const config = layoutConfigs[this.currentBreakpoint];
    this.applyLayoutConfig(config);
  }

  private applyLayoutConfig(config: LayoutConfig): void {
    // Apply layout configuration to DOM elements
    Object.entries(config).forEach(([element, properties]) => {
      const domElement = document.querySelector(`[data-layout="${element}"]`);
      if (domElement) {
        Object.entries(properties).forEach(([property, value]) => {
          domElement.style.setProperty(`--${property}`, value);
        });
      }
    });
  }
}

```javascript

### Mobile Gestures

```typescript

export class MobileGestures {
  private gestureRecognizer: GestureRecognizer;

  constructor() {
    this.gestureRecognizer = new GestureRecognizer();
    this.setupGestures();
  }

  private setupGestures(): void {
    // Swipe gestures
    this.gestureRecognizer.onSwipe('left', () => this.handleSwipeLeft());
    this.gestureRecognizer.onSwipe('right', () => this.handleSwipeRight());
    this.gestureRecognizer.onSwipe('up', () => this.handleSwipeUp());
    this.gestureRecognizer.onSwipe('down', () => this.handleSwipeDown());

    // Pinch gestures
    this.gestureRecognizer.onPinch('in', () => this.handlePinchIn());
    this.gestureRecognizer.onPinch('out', () => this.handlePinchOut());

    // Tap gestures
    this.gestureRecognizer.onTap('single', () => this.handleSingleTap());
    this.gestureRecognizer.onTap('double', () => this.handleDoubleTap());
    this.gestureRecognizer.onTap('long', () => this.handleLongTap());
  }

  private handleSwipeLeft(): void {
    // Navigate to next screen or ability
    this.navigateNext();
  }

  private handleSwipeRight(): void {
    // Navigate to previous screen or ability
    this.navigatePrevious();
  }

  private handleSwipeUp(): void {
    // Open quick menu or abilities
    this.openQuickMenu();
  }

  private handleSwipeDown(): void {
    // Close current menu or return to game
    this.closeCurrentMenu();
  }

  private handlePinchIn(): void {
    // Zoom out (if zoom is enabled)
    this.zoomOut();
  }

  private handlePinchOut(): void {
    // Zoom in (if zoom is enabled)
    this.zoomIn();
  }
}

```bash

### Bottom Sheet Navigation

```typescript

export class BottomSheetNavigation {
  private currentSheet: BottomSheet | null = null;
  private sheetStack: BottomSheet[] = [];

  openSheet(sheet: BottomSheet): void {
    if (this.currentSheet) {
      this.sheetStack.push(this.currentSheet);
    }

    this.currentSheet = sheet;
    this.renderSheet(sheet);
  }

  closeSheet(): void {
    if (this.currentSheet) {
      this.currentSheet = null;
      this.hideSheet();

      if (this.sheetStack.length > 0) {
        const previousSheet = this.sheetStack.pop()!;
        this.openSheet(previousSheet);
      }
    }
  }

  private renderSheet(sheet: BottomSheet): void {
    const sheetElement = document.createElement('div');
    sheetElement.className = 'bottom-sheet';
    sheetElement.innerHTML = `
      <div class="bottom-sheet-header">
        <h2>${sheet.title}</h2>
        <button class="close-button" aria-label="Close">×</button>
      </div>
      <div class="bottom-sheet-content">
        ${sheet.content}
      </div>
    `;

    document.body.appendChild(sheetElement);
    this.animateSheetIn(sheetElement);
  }

  private animateSheetIn(element: HTMLElement): void {
    element.style.transform = 'translateY(100%)';
    element.style.transition = 'transform 0.3s ease-out';

    requestAnimationFrame(() => {
      element.style.transform = 'translateY(0)';
    });
  }
}

```text

## Screen Reader Support

### ARIA Implementation

```typescript

export class ARIASupport {
  private liveRegion: HTMLElement;

  constructor() {
    this.createLiveRegion();
    this.setupARIALabels();
  }

  private createLiveRegion(): void {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 1000);
  }

  private setupARIALabels(): void {
    // Add ARIA labels to interactive elements
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label')) {
        button.setAttribute('aria-label', button.textContent || 'Button');
      }
    });

    // Add ARIA labels to form elements
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-labelledby', label.id);
        }
      }
    });
  }
}

```javascript

## Acceptance Criteria

- [ ] WCAG 2.1 AA compliance achieved for all UI components

- [ ] High contrast mode provides sufficient contrast ratios

- [ ] Color blind support works for all color combinations

- [ ] Font scaling supports 100%-200% zoom levels

- [ ] Touch targets meet 44x44 pixel minimum requirements

- [ ] Keyboard navigation supports all game functions

- [ ] Voice control provides alternative input methods

- [ ] Reduced motion mode disables all animations

- [ ] Mobile layout adapts to different screen sizes

- [ ] Screen reader support provides complete game narration
````
