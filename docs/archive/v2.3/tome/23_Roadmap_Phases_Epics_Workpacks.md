--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/23*Roadmap*Phases*Epics*Workpacks.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 23 — Roadmap: Phases, Epics & Workpacks

## Development Roadmap Overview

### Phase Structure

````typescript

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  status: 'planned' | 'active' | 'completed' | 'blocked';
  epics: Epic[];
  dependencies: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
}

export interface Epic {
  id: string;
  name: string;
  description: string;
  phase: string;
  stories: Story[];
  dependencies: string[];
  estimatedEffort: number; // story points
  acceptanceCriteria: string[];
}

export interface Story {
  id: string;
  name: string;
  description: string;
  epic: string;
  acceptanceCriteria: string[];
  estimatedEffort: number; // story points
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'done';
}

```text

## Phase 0: Foundation (Completed)

### Phase 0 Overview

**Status**: ✅ **COMPLETED** (September 7, 2025)
**Duration**: 8 Workpacks (W1-W8)
**Total Tests**: 192 passing tests

### Phase 0 Epics

```typescript

export const PHASE*0*EPICS: Epic[] = [
  {
    id: 'P0-E1',
    name: 'Repository & Standards',
description: 'Monorepo setup, TS strict, ESLint+Prettier, Husky v9+, commitlint,
templates',
    phase: 'P0',
    stories: [
      {
        id: 'P0-E1-S1',
        name: 'Setup monorepo',
        description: 'Initialize pnpm workspace with shared packages',
        epic: 'P0-E1',
acceptanceCriteria: ['pnpm workspace configured', 'shared packages created', 'build system
working'],
        estimatedEffort: 5,
        priority: 'critical',
        status: 'done'
      },
      {
        id: 'P0-E1-S2',
        name: 'Configure ESLint/Prettier',
        description: 'Set up linting and formatting rules',
        epic: 'P0-E1',
acceptanceCriteria: ['ESLint rules configured', 'Prettier formatting working', 'Git hooks
integrated'],
        estimatedEffort: 3,
        priority: 'high',
        status: 'done'
      }
    ],
    dependencies: [],
    estimatedEffort: 20,
acceptanceCriteria: ['Monorepo structure complete', 'All linting rules enforced', 'Git
hooks
working']
  },

  {
    id: 'P0-E2',
    name: 'App Shell & Render Host',
    description: 'SvelteKit, Pixi mount, HUD toggle, pooling primitives',
    phase: 'P0',
    stories: [
      {
        id: 'P0-E2-S1',
        name: 'Initialize SvelteKit project',
        description: 'Set up SvelteKit with TypeScript and routing',
        epic: 'P0-E2',
acceptanceCriteria: ['SvelteKit app running', 'TypeScript configured', 'Routing working'],
        estimatedEffort: 4,
        priority: 'critical',
        status: 'done'
      },
      {
        id: 'P0-E2-S2',
        name: 'Integrate PixiJS canvas',
        description: 'Mount PixiJS application in SvelteKit',
        epic: 'P0-E2',
acceptanceCriteria: ['PixiJS canvas rendering', 'SvelteKit integration working',
'Performance
acceptable'],
        estimatedEffort: 6,
        priority: 'critical',
        status: 'done'
      }
    ],
    dependencies: ['P0-E1'],
    estimatedEffort: 25,
acceptanceCriteria: ['SvelteKit app functional', 'PixiJS rendering', 'Object pooling
implemented']
  }

  // ... additional Phase 0 epics
];

```bash

### Phase 0 Deliverables

- ✅ Monorepo architecture with shared packages

- ✅ TypeScript strict mode enabled

- ✅ ESLint and Prettier configured

- ✅ Husky Git hooks working

- ✅ Commitlint enforcing conventional commits

- ✅ SvelteKit application shell

- ✅ PixiJS rendering integration

- ✅ Object pooling system

- ✅ Web Worker simulation harness

- ✅ Dexie database with schema

- ✅ Structured logging system

- ✅ PWA configuration

- ✅ CI/CD pipeline

- ✅ 192 passing tests

## Phase 1: Shooter-Idle Core (Current)

### Phase 1 Overview

**Status**: 🔄 **IN PROGRESS**
**Duration**: 6 Epics, ~24 Stories
**Goal**: "Push → spend Arcana → Return" feels great and self-explanatory

### Phase 1 Epics

```typescript

export const PHASE*1*EPICS: Epic[] = [
  {
    id: 'P1-E1',
    name: 'Distance/Ward/Land Scaffolding',
    description: 'Micro-ramps (5m early, 10m later)',
    phase: 'P1',
    stories: [
      {
        id: 'P1-E1-S1',
        name: 'Core Determinism Engine Foundation',
        description: 'Implement core types, constants, enums, IDs, deterministic simulation, RNG, clock system, protocol validation, and message handling',
        epic: 'P1-E1',
acceptanceCriteria: ['Core types and constants defined', 'Deterministic RNG system working', 'Clock system implemented', 'Protocol validation functional', 'Message handling system complete'],
        estimatedEffort: 8,
        priority: 'critical',
        status: 'done'
      },
      {
        id: 'P1-E1-S2',
        name: 'Define Ward/Land structure',
        description: 'Create ward and land progression system',
        epic: 'P1-E1',
acceptanceCriteria: ['Ward boundaries defined', 'Land progression working', 'Scaling
formulas
implemented'],
        estimatedEffort: 5,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P0-E2'],
    estimatedEffort: 15,
acceptanceCriteria: ['Distance progression working', 'Ward system functional',
'Micro-ramps
implemented']
  },

  {
    id: 'P1-E2',
    name: 'Spawns + Basic AI',
    description: 'Approach, stop-at-range; two enemy families',
    phase: 'P1',
    stories: [
      {
        id: 'P1-E2-S1',
        name: 'Implement enemy spawning system',
        description: 'Spawn enemies based on distance and ward',
        epic: 'P1-E2',
acceptanceCriteria: ['Enemies spawn at correct intervals', 'Spawn rate scales with
distance',
'Performance
within
limits'],
        estimatedEffort: 4,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P1-E2-S2',
        name: 'Develop basic AI (approach/attack)',
        description: 'Implement stop-at-range AI behavior',
        epic: 'P1-E2',
acceptanceCriteria: ['Enemies approach player', 'Enemies stop at range', 'Enemies attack
when
in
range'],
        estimatedEffort: 6,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P1-E1'],
    estimatedEffort: 20,
acceptanceCriteria: ['Enemy spawning working', 'Basic AI functional', 'Two enemy families
implemented']
  },

  {
    id: 'P1-E3',
    name: 'Dragon Auto-Attack & Combat',
    description: 'Two weapon archetypes; hit/crit; TTK smoothing',
    phase: 'P1',
    stories: [
      {
        id: 'P1-E3-S1',
        name: 'Implement dragon auto-attack',
        description: 'Dragon automatically attacks nearest enemy',
        epic: 'P1-E3',
acceptanceCriteria: ['Auto-attack targets nearest enemy', 'Damage calculation working',
'Visual
feedback
present'],
        estimatedEffort: 5,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P1-E3-S2',
        name: 'Define weapon archetypes',
        description: 'Implement different weapon types and behaviors',
        epic: 'P1-E3',
acceptanceCriteria: ['Two weapon archetypes working', 'Different damage patterns', 'Visual
differences
clear'],
        estimatedEffort: 4,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P1-E2'],
    estimatedEffort: 18,
acceptanceCriteria: ['Auto-attack functional', 'Weapon archetypes working', 'TTK smoothing
implemented']
  },

  {
    id: 'P1-E4',
    name: 'Arcana Drops & Enchants',
    description: 'Geometric costs (×1.12); Tier-Up (15–25× last level)',
    phase: 'P1',
    stories: [
      {
        id: 'P1-E4-S1',
        name: 'Implement Arcana drops',
        description: 'Enemies drop Arcana when defeated',
        epic: 'P1-E4',
acceptanceCriteria: ['Arcana drops on enemy death', 'Drop amounts scale correctly',
'Arcana
displayed
in
UI'],
        estimatedEffort: 3,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P1-E4-S2',
        name: 'Create enchant system',
        description: 'Spend Arcana to upgrade dragon abilities',
        epic: 'P1-E4',
acceptanceCriteria: ['Enchant buttons functional', 'Geometric cost scaling working',
'Tier-Up
mechanic
implemented'],
        estimatedEffort: 6,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P1-E3'],
    estimatedEffort: 16,
acceptanceCriteria: ['Arcana drops working', 'Enchant system functional', 'Geometric costs
implemented']
  },

  {
    id: 'P1-E5',
    name: 'Return Flow & Offline Sim',
description: 'Donate to Shield; keep Arcana; reset enchants; Rested rules; first-run
tutorial;
logs
→
narration',
    phase: 'P1',
    stories: [
      {
        id: 'P1-E5-S1',
        name: 'Implement Return to Draconia flow',
        description: 'Player can return to Draconia to spend Arcana',
        epic: 'P1-E5',
acceptanceCriteria: ['Return button functional', 'Return screen displays', 'Arcana
donation
working'],
        estimatedEffort: 4,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P1-E5-S2',
        name: 'Develop offline simulation',
        description: 'Game continues progressing when offline',
        epic: 'P1-E5',
acceptanceCriteria: ['Offline progression working', 'Rested bonus functional', 'Progress
capped
appropriately'],
        estimatedEffort: 8,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P1-E4'],
    estimatedEffort: 20,
acceptanceCriteria: ['Return flow working', 'Offline simulation functional', 'Tutorial
implemented']
  },

  {
    id: 'P1-E6',
    name: 'Manual Ability No.1',
    description: '(Roar/Shatter) (target manual dmg ~20%)',
    phase: 'P1',
    stories: [
      {
        id: 'P1-E6-S1',
        name: 'Implement first manual ability',
        description: 'Add Roar ability for manual damage',
        epic: 'P1-E6',
acceptanceCriteria: ['Ability button functional', 'Ability deals damage', 'Cooldown system
working'],
        estimatedEffort: 5,
        priority: 'medium',
        status: 'todo'
      },
      {
        id: 'P1-E6-S2',
        name: 'Balance manual damage contribution',
        description: 'Ensure manual abilities contribute ~20% of damage',
        epic: 'P1-E6',
acceptanceCriteria: ['Manual damage ~20% of total', 'Ability feels impactful', 'Cooldown
balanced'],
        estimatedEffort: 3,
        priority: 'medium',
        status: 'todo'
      }
    ],
    dependencies: ['P1-E5'],
    estimatedEffort: 12,
acceptanceCriteria: ['Manual ability functional', 'Damage contribution balanced', 'Ability
UI
working']
  }
];

```text

### Phase 1 Deliverables

- [ ] Playable loop 30–60 min

- [ ] 1 Land, ~10 Wards

- [ ] First boss encounter

- [ ] Journey time ≥ 65% (p50)

- [ ] 2–3 returns/hour early

- [ ] Performance under 200 enemies / 600 proj/s

- [ ] Telemetry for DPS share, TTK trend, Arcana/hr

## Phase 2: Frontend Component Development

### Phase 2 Overview

**Status**: 📋 **PLANNED**
**Duration**: 8 Epics, ~48 Stories
**Goal**: Implement all core frontend UI components individually

### Phase 2 Epics

```typescript

export const PHASE*2*EPICS: Epic[] = [
  {
    id: 'P2-E1',
    name: 'Core Layout & Navigation UI',
    description: 'Main app layout, navigation, loading screens, modals',
    phase: 'P2',
    stories: [
      {
        id: 'P2-E1-S1',
        name: 'Implement main app layout',
        description: 'Create responsive layout for desktop and mobile',
        epic: 'P2-E1',
acceptanceCriteria: ['Layout adapts to screen size', 'Navigation accessible', 'Loading
states
handled'],
        estimatedEffort: 6,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P2-E1-S2',
        name: 'Develop navigation bar',
        description: 'Create navigation between game sections',
        epic: 'P2-E1',
acceptanceCriteria: ['Navigation between screens', 'Active state indicators',
'Mobile-friendly'],
        estimatedEffort: 4,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P1-E6'],
    estimatedEffort: 25,
acceptanceCriteria: ['Main layout functional', 'Navigation working', 'Loading screens
implemented',
'Modal
system
working']
  },

  {
    id: 'P2-E2',
    name: 'Combat Scene UI',
    description: 'Distance bar, enemy health bars, projectile VFX, damage numbers',
    phase: 'P2',
    stories: [
      {
        id: 'P2-E2-S1',
        name: 'Develop distance bar',
        description: 'Show current distance and progression',
        epic: 'P2-E2',
acceptanceCriteria: ['Distance bar updates', 'Visual progression clear', 'Milestones
highlighted'],
        estimatedEffort: 4,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P2-E2-S2',
        name: 'Implement enemy health bars',
        description: 'Show enemy health above each enemy',
        epic: 'P2-E2',
acceptanceCriteria: ['Health bars visible', 'Update with damage', 'Performance
optimized'],
        estimatedEffort: 5,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P2-E1'],
    estimatedEffort: 20,
acceptanceCriteria: ['Distance bar functional', 'Enemy health bars working', 'Projectile
VFX
implemented',
'Damage
numbers
showing']
  }

  // ... additional Phase 2 epics
];

```text

## Phase 3: Advanced Systems

### Phase 3 Overview

**Status**: 📋 **PLANNED**
**Duration**: 4 Epics, ~24 Stories
**Goal**: Integrate core meta-progression and advanced combat mechanics

### Phase 3 Epics

```typescript

export const PHASE*3*EPICS: Epic[] = [
  {
    id: 'P3-E1',
    name: 'Research Discovery System',
    description: 'Discovery before Unlock logic, Research Lab progression',
    phase: 'P3',
    stories: [
      {
        id: 'P3-E1-S1',
        name: 'Implement Discovery before Unlock logic',
        description: 'Tech nodes hidden until discovered via research',
        epic: 'P3-E1',
acceptanceCriteria: ['Nodes hidden initially', 'Discovery through research', 'Unlock
progression
working'],
        estimatedEffort: 6,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P3-E1-S2',
        name: 'Develop Research Lab level progression',
        description: 'Research Lab levels unlock new research types',
        epic: 'P3-E1',
acceptanceCriteria: ['Lab levels functional', 'Research types unlock', 'Costs scale
appropriately'],
        estimatedEffort: 5,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P2-E8'],
    estimatedEffort: 20,
acceptanceCriteria: ['Discovery system working', 'Research Lab functional', 'Node
visibility
logic
implemented',
'Costs
balanced']
  }

  // ... additional Phase 3 epics
];

```text

## Phase 4: Content & Regions

### Phase 4 Overview

**Status**: 📋 **PLANNED**
**Duration**: 3 Epics, ~18 Stories
**Goal**: Implement first full region and content pack system

### Phase 4 Epics

```typescript

export const PHASE*4*EPICS: Epic[] = [
  {
    id: 'P4-E1',
    name: 'Region R01: Horizon Steppe Implementation',
    description: 'Complete Horizon Steppe region with all specified content',
    phase: 'P4',
    stories: [
      {
        id: 'P4-E1-S1',
        name: 'Implement Horizon Steppe subzones',
        description: 'Create all 7 wards with proper scaling',
        epic: 'P4-E1',
acceptanceCriteria: ['All 7 wards implemented', 'Proper scaling between wards', 'Visual
differences
clear'],
        estimatedEffort: 8,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P4-E1-S2',
        name: 'Integrate visual/audio direction',
        description: 'Apply Horizon Steppe visual and audio themes',
        epic: 'P4-E1',
acceptanceCriteria: ['Visual theme applied', 'Audio theme integrated', 'Atmosphere
consistent'],
        estimatedEffort: 6,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P3-E4'],
    estimatedEffort: 25,
acceptanceCriteria: ['Horizon Steppe fully implemented', 'Wind-Taken Nomads functional',
'Khagan
boss
working',
'Content
pack
system
ready']
  }

  // ... additional Phase 4 epics
];

```bash

## Phase 5: Polish & Optimization

### Phase 5 Overview

**Status**: 📋 **PLANNED**
**Duration**: 3 Epics, ~18 Stories
**Goal**: Ensure high performance, accessibility, and overall quality

### Phase 5 Epics

```typescript

export const PHASE*5*EPICS: Epic[] = [
  {
    id: 'P5-E1',
    name: 'Performance Optimization Pass',
    description: 'Object pooling/culling review, rendering optimization',
    phase: 'P5',
    stories: [
      {
        id: 'P5-E1-S1',
        name: 'Conduct object pooling/culling review',
        description: 'Optimize object pooling and culling systems',
        epic: 'P5-E1',
acceptanceCriteria: ['Pooling optimized', 'Culling efficient', 'Memory usage controlled'],
        estimatedEffort: 6,
        priority: 'high',
        status: 'todo'
      },
      {
        id: 'P5-E1-S2',
        name: 'Optimize rendering layers',
        description: 'Improve rendering performance and efficiency',
        epic: 'P5-E1',
acceptanceCriteria: ['Rendering optimized', 'Frame rate stable', 'GPU usage efficient'],
        estimatedEffort: 5,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P4-E3'],
    estimatedEffort: 18,
acceptanceCriteria: ['Performance budgets met', 'Rendering optimized', 'Memory usage
controlled',
'Bundle
size
within
limits']
  }

  // ... additional Phase 5 epics
];

```text

## Phase 6: Release Preparation

### Phase 6 Overview

**Status**: 📋 **PLANNED**
**Duration**: 2 Epics, ~12 Stories
**Goal**: Finalize for release and establish live operations readiness

### Phase 6 Epics

```typescript

export const PHASE*6*EPICS: Epic[] = [
  {
    id: 'P6-E1',
    name: 'Release Engineering',
    description: 'Finalize build process, versioning, deployment',
    phase: 'P6',
    stories: [
      {
        id: 'P6-E1-S1',
        name: 'Finalize build process',
        description: 'Optimize build pipeline for production',
        epic: 'P6-E1',
acceptanceCriteria: ['Build process optimized', 'Production builds working', 'Deployment
automated'],
        estimatedEffort: 4,
        priority: 'critical',
        status: 'todo'
      },
      {
        id: 'P6-E1-S2',
        name: 'Implement versioning strategy',
        description: 'Set up semantic versioning and release management',
        epic: 'P6-E1',
acceptanceCriteria: ['Versioning system working', 'Release notes automated', 'Version
tracking
functional'],
        estimatedEffort: 3,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: ['P5-E3'],
    estimatedEffort: 12,
acceptanceCriteria: ['Build process finalized', 'Versioning implemented', 'Deployment
ready',
'Security
audit
passed']
  }

  // ... additional Phase 6 epics
];

```text

## Cross-Cutting Epics

### Cross-Cutting Work

```typescript

export const CROSS*CUTTING*EPICS: Epic[] = [
  {
    id: 'CC-E1',
    name: 'Benchmarking & Tooling',
    description: 'Logger bake-offs, a11y tooling matrix',
    phase: 'Cross-Cutting',
    stories: [
      {
        id: 'CC-E1-S1',
        name: 'Logger performance comparison',
        description: 'Compare pino, loglevel, consola, winston',
        epic: 'CC-E1',
acceptanceCriteria: ['Performance benchmarks complete', 'Best logger selected',
'Integration
working'],
        estimatedEffort: 4,
        priority: 'medium',
        status: 'todo'
      }
    ],
    dependencies: [],
    estimatedEffort: 15,
acceptanceCriteria: ['Tooling optimized', 'Benchmarks complete', 'Best tools selected']
  },

  {
    id: 'CC-E2',
    name: 'Security/Privacy',
    description: 'PII stance, consent UI, save encryption',
    phase: 'Cross-Cutting',
    stories: [
      {
        id: 'CC-E2-S1',
        name: 'Implement privacy controls',
        description: 'Add user consent and privacy settings',
        epic: 'CC-E2',
acceptanceCriteria: ['Privacy settings functional', 'Consent UI working', 'Data protection
implemented'],
        estimatedEffort: 5,
        priority: 'high',
        status: 'todo'
      }
    ],
    dependencies: [],
    estimatedEffort: 12,
acceptanceCriteria: ['Privacy controls working', 'Security measures implemented', 'Data
protection
compliant']
  }
];

```text

## Workpack Structure

### Workpack Definition

```typescript

export interface Workpack {
  id: string;
  name: string;
  phase: string;
  epic: string;
  stories: Story[];
  startDate: number;
  endDate: number;
  status: 'planned' | 'active' | 'completed';
  deliverables: string[];
  acceptanceCriteria: string[];
}

```text

### Workpack Planning

- **Duration**: 1-2 weeks per workpack

- **Scope**: 2-4 stories per workpack

- **Review**: Workpack review at completion

- **Integration**: Continuous integration between workpacks

## Risk Management

### Risk Categories

```typescript

export interface Risk {
  id: string;
  category: 'technical' | 'scope' | 'schedule' | 'quality' | 'resource';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  mitigation: string[];
  contingency: string[];
}

```javascript

### Identified Risks

```typescript

export const IDENTIFIED_RISKS: Risk[] = [
  {
    id: 'R1',
    category: 'technical',
    description: 'Performance issues with large numbers of enemies',
    impact: 'high',
    probability: 'medium',
    mitigation: ['Object pooling', 'Culling systems', 'Performance budgets'],
    contingency: ['Reduce enemy count', 'Simplify graphics', 'Optimize algorithms']
  },

  {
    id: 'R2',
    category: 'scope',
    description: 'Feature creep during development',
    impact: 'medium',
    probability: 'high',
    mitigation: ['Strict scope management', 'Regular reviews', 'Change control'],
    contingency: ['Defer features', 'Reduce scope', 'Extend timeline']
  }
];

```text

## Acceptance Criteria

- [ ] All phases have clear deliverables and acceptance criteria

- [ ] Dependencies between phases are clearly defined

- [ ] Risk mitigation strategies are in place

- [ ] Workpack structure supports iterative development

- [ ] Cross-cutting concerns are addressed throughout

- [ ] Quality gates prevent progression without meeting standards

- [ ] Timeline is realistic and achievable

- [ ] Resource requirements are clearly defined

- [ ] Success metrics are measurable

- [ ] Rollback plans exist for each phase
````
