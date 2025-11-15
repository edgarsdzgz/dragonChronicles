# 12 — Frontend Architecture

## Technology Stack

### Core Framework

````typescript

interface TechStack {
  framework: 'SvelteKit';
  language: 'TypeScript';
  renderer: 'PixiJS';
  overlay: 'Svelte';
  workers: ['simulation', 'telemetry'];
  database: 'Dexie (IndexedDB)';
  bundler: 'Vite';
  deployment: 'Static (GitHub Pages)';
}

```text

### Architecture Overview

- **SvelteKit**: Static site generation with client-side hydration

- **PixiJS Stage**: WebGL/WebGPU rendering for combat and effects

- **Svelte Overlay**: UI components layered above PixiJS canvas

- **Web Workers**: Background simulation and telemetry processing

- **TypeScript**: Strict mode compliance across entire codebase

## Application Structure

### Route Organization

```typescript

interface RouteStructure {
  '/': 'splash*and*profile_selection';
  '/journey': 'main*game*combat_interface';
  '/return': 'draconia*upgrade*interface';
  '/town': 'city*management*interface';
  '/stats': 'analytics*and*export_interface';
  '/settings': 'configuration*and*preferences';
}

```text

### Component Hierarchy

```html

src/
├── app.html                 # Root HTML template
├── app.css                  # Global styles
├── routes/
│   ├── +layout.svelte      # Global layout wrapper
│   ├── +page.svelte        # Splash/profile selection
│   ├── journey/
│   │   └── +page.svelte    # Main game interface
│   ├── return/
│   │   └── +page.svelte    # Draconia upgrade interface
│   ├── town/
│   │   └── +page.svelte    # City management
│   └── stats/
│       └── +page.svelte    # Analytics dashboard
├── lib/
│   ├── components/         # Reusable UI components
│   ├── stores/            # Svelte stores for state management
│   ├── pixi/              # PixiJS rendering components
│   ├── workers/           # Web Worker implementations
│   └── utils/             # Utility functions and helpers

```text

## State Management

### Svelte Stores Architecture

```typescript

// Core application state
interface AppState {
  flags: AppFlags;
  profile: PlayerProfile;
  journey: JourneyState;
  research: ResearchState;
  synth: SynthState;
  ui: UIState;
}

// Feature flags system
interface AppFlags {
  hud: boolean;              // Development HUD visibility
  tlmVerbose: boolean;       // Verbose telemetry logging
  devMenu: boolean;          // Developer menu access
  reducedMotion: boolean;    // Accessibility reduced motion
  debugMode: boolean;        // Debug information display
}

```javascript

### Store Implementation

```typescript

// stores/app-flags.ts
import { readable, writable } from 'svelte/store';
import { browser } from '$app/environment';

function createAppFlags() {
  const defaultFlags: AppFlags = {
    hud: false,
    tlmVerbose: false,
    devMenu: false,
    reducedMotion: false,
    debugMode: false
  };

  const { subscribe, set, update } = writable(defaultFlags);

  return {
    subscribe,
    toggle: (flag: keyof AppFlags) => update(flags => ({
      ...flags,
      [flag]: !flags[flag]
    })),
    set: (flags: Partial<AppFlags>) => update(current => ({
      ...current,
      ...flags
    })),
    reset: () => set(defaultFlags)
  };
}

export const appFlags = createAppFlags();

```javascript

### Query String Integration

```typescript

// stores/query-flags.ts
import { browser } from '$app/environment';
import { appFlags } from './app-flags.js';

export function parseQueryFlags(): Partial<AppFlags> {
  if (!browser) return {};

  const params = new URLSearchParams(window.location.search);
  const flags: Partial<AppFlags> = {};

  // Parse boolean flags from query string
  if (params.has('hud')) flags.hud = params.get('hud') !== 'false';
  if (params.has('debug')) flags.debugMode = params.get('debug') !== 'false';
  if (params.has('tlm')) flags.tlmVerbose = params.get('tlm') !== 'false';

  return flags;
}

// Apply query flags on app initialization
if (browser) {
  const queryFlags = parseQueryFlags();
  if (Object.keys(queryFlags).length > 0) {
    appFlags.set(queryFlags);
  }
}

```javascript

## PixiJS Integration

### Canvas Mount System

```typescript

// lib/pixi/pixi-mount.ts
import { Application, Container } from 'pixi.js';
import type { AppFlags } from '../stores/app-flags.js';

export class PixiMount {
  private app: Application;
  private gameStage: Container;
  private uiStage: Container;

  constructor(canvas: HTMLCanvasElement, flags: AppFlags) {
    this.app = new Application({
      view: canvas,
      width: 1200,
      height: 800,
      backgroundColor: 0x87CEEB, // Sky blue
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    this.setupStages();
    this.setupResize();
    this.setupTicker(flags);
  }

  private setupStages(): void {
    this.gameStage = new Container();
    this.uiStage = new Container();

    this.app.stage.addChild(this.gameStage);
    this.app.stage.addChild(this.uiStage);
  }

  private setupResize(): void {
    const resize = () => {
      const parent = this.app.view.parentElement;
      if (parent) {
        this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
      }
    };

    window.addEventListener('resize', resize);
    resize();
  }

  private setupTicker(flags: AppFlags): void {
    this.app.ticker.add(() => {
      // Pause rendering when tab is hidden but continue simulation
      if (document.hidden) {
        this.app.ticker.stop();
        return;
      }

      // Update game objects
      this.updateGameObjects();

      // Update HUD if enabled
      if (flags.hud) {
        this.updateHUD();
      }
    });
  }
}

```javascript

### Rendering Layers

```typescript

interface RenderingLayers {
  background: Container;     // Parallax background elements
  environment: Container;    // Static environment objects
  enemies: Container;        // Enemy sprites and animations
  projectiles: Container;    // Projectile effects and trails
  dragon: Container;         // Player dragon sprite
  effects: Container;        // Visual effects and particles
  ui: Container;            // Game UI elements (health bars, etc.)
  hud: Container;           // Development HUD overlay
}

```text

## UI/UX Design System

### Layout Specification (v2.1) - Integrated from ASCII UI Draft

**Core Design Philosophy**: Player-first clarity with purpose-built designs for shooter-idle experience.

#### Top Rail Layout

```typescript

interface TopRailLayout {
  left: {
    type: 'vertical*currency*stack';
    currencies: ['Arcana', 'Gold', 'Soul Power', 'Astral Seals'];
    position: 'top-left';
    alignment: 'vertical_stacked';
  };

  center: {
    type: 'distance*bar*and_info';
    distanceHUD: 'Distance 12.5 km — Land → Area';
    distanceBar: {
      type: 'thin_horizontal';
      height: '16px';
      fill: 'horizontal_progress';
      background: 'fade*sky*gradient';
    };
  };

  right: {
    type: 'system*buttons*horizontal';
    buttons: [
      { id: 'profile', icon: '👤', size: '16px' },
      { id: 'settings', icon: '⚙️', size: '16px' },
      { id: 'notifications', icon: '🔔', size: '16px' }
    ];
    position: 'top-right';
    alignment: 'horizontal_row';
  };
}

```javascript

#### Combat Area Layout

```typescript

interface CombatAreaLayout {
  dragon: {
    position: 'anchored*left*vertical_center';
    purpose: 'align*eye*focus*between*hud*and*enchant_buttons';
  };

  enemies: {
    spawn: 'from_right';
    movement: 'move_left';
    behavior: 'stop*at*range_ai';
  };

  scenery: {
    layers: 'scroll*right*to_left';
    foreground: 'fast_scroll';
    background: 'slow_scroll';
    effect: 'parallax_depth';
  };

  groundLine: {
    purpose: 'separates*combat*sky*from*ui_underground';
    visual: 'clear*horizontal*division';
  };
}

```javascript

#### Enchant Panel Layout (Underground UI)

```typescript

interface EnchantPanelLayout {
  layout: 'three*scrollable*columns';
  columns: ['firecraft', 'scales', 'safety'];
  columnWidth: 'full*width*slice*33*percent';
  rowLayout: 'two*buttons*side*by*side';
  scrolling: 'vertical_expansion';
  initialState: {
    firecraft: 1, // 1 button at start
    scales: 1,    // 1 button at start
    safety: 0     // empty at start
  };
}

```text

### Enchant Button Specification (v2.1)

#### General Rules

```typescript

interface EnchantButtonRules {
  clickableUnit: 'one*button*equals*one*enchant_node';
  noTiers: 'no*tier*bars*old*design_dropped';
  dynamicExpansion: 'columns*reveal*new*buttons*as*research*unlocks';
  hideCompleted: 'future*option*toggle*to*hide*maxed*nodes';
}

```javascript

#### Button Layout

```typescript

interface EnchantButtonLayout {
  label: 'enchant_name'; // e.g., "Heater Muscles"
  cost: 'arcana*value*displayed*inside*action_button';
  value: 'current_effect'; // e.g., "+32% DMG"
  level: 'shown*only*in*detail*popup*not*on*button*face';
  purpose: 'reduce*clutter*on*main*button';
}

```javascript

#### Button States

```typescript

interface EnchantButtonStates {
  purchasable: {
    background: 'ember*gold*highlight';
    border: 'active_accent';
    costButton: 'active*and*clickable';
  };

  notEnoughArcana: {
    background: 'dimmed_grey';
    border: 'faint';
    costButton: 'disabled_greyed';
  };

  maxedOut: {
    background: 'astral*indigo*celebratory';
    label: 'MAXED*indicator*replaces_cost';
    locked: 'from*further*clicks';
  };
}

```javascript

### Distance Progression System (v2.1)

```typescript

interface DistanceProgression {
  baseSpeed: '10*m*per_second';
  level1Target: '15*km*approximately*25*minutes_baseline';
  scaling: 'plus*3*km*per*level';
  enemyRamps: 'plus*0*1*percent*stats*per*5m_traveled';
  carryOver: 'excess*distance*applied*to*next*level*on_completion';
  rewards: 'copper*forgegold*scales*gems*milestones*remain*in_spec';
}

```javascript

### Currency System (v2.1)

```typescript

interface CurrencySystem {
  arcana: {
    purpose: 'main*temporary*enchant_spend';
    behavior: 'persists*across*returns';
    display: 'top*left*vertical_stack';
  };

  gold: {
    purpose: 'secondary*quality*of_life';
    sinks: 'later*in*market_system';
    display: 'top*left*vertical_stack';
  };

  soulPower: {
    purpose: 'meta*progression*currency';
    behavior: 'permanent*across*all_runs';
    display: 'top*left*vertical_stack';
  };

  astralSeals: {
    purpose: 'premium*lore*driven_currency';
    lore: 'cosmic*comet*fragments*tied*to*origin*starlit_shards';
    display: 'top*left*vertical_stack';
  };
}

```javascript

### Technical Implementation Notes (v2.1)

```typescript

interface TechnicalNotes {
  frontend: 'SvelteKit*plus*TypeScript';
  combatRender: 'PixiJS_WebGL';
  state: 'Dexie*IndexedDB*v3_schema';
  workers: 'spawn*DPS*math*offline*ticks';
  accessibility: 'ARIA*roles*tab*order*visible*focus*rings*44px*touch_targets';
performance:
'60fps*desktop*40fps*mid*phones*le200*active*enemies*le600*projectiles*per_second';
}

```javascript

### Implementation Roadmap (v2.1)

```typescript

interface ImplementationRoadmap {
  nextSteps: [
    'Update*EnchantTab*svelte*replace*tier*bars*with*dynamic*button_grid',
    'Update*FloatingDistanceBar*svelte*integrate*system*buttons*in_header',
    'Implement*button*state*colors*neutral*theme*16px_icons',
    'Add*scrollable*columns*2*buttons*per*row',
    'Implement*hide*completed*toggle*later'
  ];
}

```javascript

### Enchant Button System

```typescript

interface EnchantButton {
  state: 'purchasable' | 'insufficient*arcana' | 'maxed*out';
  label: string;           // Enchant name (e.g., "Heater Muscles")
  cost: number;           // Arcana cost for next level
  value: string;          // Current effect (e.g., "+32% DMG")
  level: number;          // Current level (shown in detail popup only)
}

// Button state styling
const buttonStates = {
  purchasable: {
    background: 'ember-gold-highlight',
    border: 'active-accent',
    costButton: 'active-clickable'
  },
  insufficient_arcana: {
    background: 'dimmed-grey',
    border: 'faint',
    costButton: 'disabled-greyed'
  },
  maxed_out: {
    background: 'astral-indigo',
    label: 'MAXED-indicator',
    costButton: 'locked'
  }
};

```javascript

### Responsive Design

```typescript

interface ResponsiveBreakpoints {
  mobile: '< 768px';
  tablet: '768px - 1024px';
  desktop: '> 1024px';
}

interface MobileAdaptations {
  enchantPanel: 'bottom*sheet*modal';
  systemButtons: 'fab*floating*action_button';
  touchTargets: '44px*minimum*size';
  gestures: 'scroll*and*zoom_only';
}

```javascript

## Performance Optimization

### Rendering Budgets

```typescript

interface PerformanceBudgets {
  targetFPS: {
    desktop: 60;
    mobile: 40;
  };

  entityLimits: {
    enemies: 200;
    projectiles: 600;
    particles: 1000;
  };

  memoryLimits: {
    textureMemory: '256MB';
    audioMemory: '64MB';
    totalHeap: '512MB';
  };
}

```javascript

### Object Pooling

```typescript

class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    // Pre-warm pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    return this.pool.pop() || this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// Usage for enemies and projectiles
const enemyPool = new ObjectPool(
  () => new EnemySprite(),
  (enemy) => enemy.reset(),
  50
);

```javascript

### Culling System

```typescript

interface CullingSystem {
  frustumCulling: boolean;   // Hide objects outside camera view
  distanceCulling: boolean;  // Hide distant objects
  occlusionCulling: boolean; // Hide objects behind others

  cullingBounds: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}

```text

## Web Workers Integration

### Simulation Worker

```typescript

// lib/workers/simulation-worker.ts
interface SimulationWorker {
  // Lifecycle
  boot(seed: number): void;
  start(): void;
  stop(): void;

  // Game state
  updateDistance(meters: number): void;
  spawnEnemy(enemyType: string): void;
  useAbility(abilityId: number): void;

  // Offline processing
  processOfflineTime(elapsedMs: number): OfflineResult;
}

// Message protocol
type SimToUI =
  | { type: 'ready' }
  | { type: 'tick', stats: GameStats }
  | { type: 'enemy_spawn', enemy: EnemyData }
  | { type: 'enemy_death', enemyId: string, rewards: Rewards }
  | { type: 'log', level: 'info' | 'warn' | 'error', message: string };

type UIToSim =
  | { type: 'boot', seed: number }
  | { type: 'start' }
  | { type: 'ability', id: number }
  | { type: 'offline', elapsedMs: number };

```javascript

### Telemetry Worker

```typescript

// lib/workers/telemetry-worker.ts
interface TelemetryWorker {
  // Event processing
  logEvent(event: TelemetryEvent): void;
  flushEvents(): void;

  // Aggregation
  generateDailyStats(): DailyStats;
  generateLifetimeStats(): LifetimeStats;

  // Export
  exportLogs(format: 'json' | 'ndjson'): string;
}

```text

## Accessibility Implementation

### ARIA Integration

```typescript

interface AccessibilityFeatures {
  // Focus management
  focusTrapping: boolean;
  visibleFocus: boolean;
  tabOrder: 'logical';

  // Screen reader support
  ariaLabels: boolean;
  ariaDescriptions: boolean;
  liveRegions: boolean;

  // Motor accessibility
  touchTargets: '44px_minimum';
  keyboardNavigation: 'full_support';
  reducedMotion: 'respects*prefers*reduced_motion';
}

```javascript

### Reduced Motion Support

```typescript

// Respect user's motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  appFlags.set({ reducedMotion: true });
}

// Apply reduced motion to animations
function createAnimation(element: HTMLElement, options: AnimationOptions) {
  if (get(appFlags).reducedMotion) {
    options.duration = 0;
    options.easing = 'linear';
  }

  return element.animate(options.keyframes, options);
}

```text

## Build Configuration

### Vite Configuration

```typescript

// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  build: {
    target: 'es2020',
    sourcemap: false, // Disabled for production
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ['pixi.js'],
          dexie: ['dexie'],
          workers: ['./src/lib/workers/simulation-worker.ts']
        }
      }
    }
  },

  optimizeDeps: {
    include: ['pixi.js', 'dexie']
  },

  worker: {
    format: 'es'
  }
});

```javascript

### TypeScript Configuration

```typescript

// tsconfig.json (extends tsconfig.base.json)
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "allowJs": true,
    "checkJs": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "outDir": ".svelte-kit/output",
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "$lib": ["src/lib"],
      "$lib/*": ["src/lib/*"]
    }
  },
  "include": [
    "src/**/*.d.ts",
    "src/**/*.js",
    "src/**/*.ts",
    "src/**/*.svelte"
  ]
}

```text

## Testing Integration

### Component Testing

```typescript

// Component test example
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import EnchantButton from '$lib/components/EnchantButton.svelte';

test('EnchantButton displays correct state', () => {
  const props = {
    label: 'Heater Muscles',
    cost: 150,
    value: '+32% DMG',
    state: 'purchasable'
  };

  render(EnchantButton, props);

  expect(screen.getByText('Heater Muscles')).toBeInTheDocument();
  expect(screen.getByText('150')).toBeInTheDocument();
  expect(screen.getByText('+32% DMG')).toBeInTheDocument();
});

```javascript

### E2E Testing

```typescript

// Playwright E2E test
import { test, expect } from '@playwright/test';

test('complete journey flow', async ({ page }) => {
  await page.goto('/');

  // Select profile
  await page.click('[data-testid="profile-select"]');

  // Start journey
  await page.click('[data-testid="begin-journey"]');

  // Verify combat interface loads
  await expect(page.locator('[data-testid="pixi-canvas"]')).toBeVisible();
  await expect(page.locator('[data-testid="distance-bar"]')).toBeVisible();

  // Verify enchant panel
  await expect(page.locator('[data-testid="enchant-panel"]')).toBeVisible();
});

```javascript

## Acceptance Criteria

- [ ] SvelteKit application boots and renders correctly

- [ ] PixiJS canvas mounts and displays game content

- [ ] Svelte stores manage application state effectively

- [ ] Feature flags system works via query strings and UI

- [ ] Web Workers handle simulation and telemetry processing

- [ ] Responsive design adapts to mobile and desktop

- [ ] Accessibility features meet WCAG 2.1 AA standards

- [ ] Performance budgets maintained under load

- [ ] Build system produces optimized production bundles

- [ ] Testing framework covers components and E2E flows

## Cross-References

- [Simulation: Workers & Protocol](13*Simulation*Workers_Protocol.md) - Web Worker implementation details

- [Rendering & Performance Budgets](14*Rendering*Pixi*Perf*Budgets.md) - PixiJS rendering and optimization

- [Accessibility & Mobile UX](18*A11y*UX*Mobile*Design.md) - Accessibility implementation

- [Testing, QA & CI/CD](19*Testing*QA*CI*CD_Gates.md) - Testing strategy and implementation
````
