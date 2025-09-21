--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/08*Town*Lair*City*PublicWorks.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 08 — Town, Lair & City Public Works

## Meta-Progression Philosophy

### Power Budget Constraints

**Critical Design Rule**: Meta-progression (town, lair, city) must not overshadow combat progression.

- **Pre-Rift Combat Power**: ≥70% Journey research; town/meta ≤30% (City ≤10%)

- **City Bonuses**: Maximum 10% of total combat power before Rift completion

- **Lair Comfort**: Affects Rested bonuses only (≤5% DPS pre-Rift)

- **Town Economy**: Quality of Life improvements, not raw power

### Meta-Progression Timeline

1. **Phase 1**: Basic town vendor for item sales

1. **Phase 2**: Lair comfort system for rested bonuses

1. **Phase 3**: City public works for global improvements

1. **Phase 4**: Advanced automation and delegation systems

## Town System (Phase 1)

### Vendor & Kiosk Economy

#### **Taxed Vendor Stalls**

````typescript

export interface VendorStall {
  id: string;
  name: string;
  taxRate: number; // 15% base tax
  itemTypes: ItemType[];
  appraisalBonus: number; // +X% to item values

  // Operating Hours
  openHours: [number, number]; // [open, close] in 24h format
  isOpen: boolean;
}

```javascript

#### **Unmanned Kiosks**

```typescript

export interface Kiosk {
  id: string;
  name: string;
  duesRate: number; // 5% dues (lower than vendor tax)
  throughputCap: number; // items per hour limit
  smartPricing: boolean; // automatic price optimization

  // Automation
  autoAppraisal: boolean;
  autoPricing: boolean;
  restockThreshold: number;
}

```bash

#### **Owned Shops (Advanced)**

```typescript

export interface OwnedShop {
  id: string;
  name: string;
  taxRate: number; // 0% tax (owned)
  mercantileLevel: number; // 1-10, affects margins and slots

  // Staffing
  staff: ShopStaff[];
  wages: number; // daily wage cost
  uptime: number; // percentage of time staffed

  // Features
  bulkDisplay: boolean;
  priceInsights: boolean;
  customerLoyalty: number;
}

```text

### Item Economy Integration

#### **Item Drop System**

```typescript

export interface ItemDrop {
  itemId: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  baseValue: number;
  condition: 'poor' | 'fair' | 'good' | 'excellent';

  // Appraisal
  appraisalValue: number;
  appraisalBonus: number; // from vendor/kiosk
  finalValue: number;
}

```text

#### **Gold Economy**

- **Source**: Item sales from defeated enemies

- **Usage**: Quality of Life upgrades, shop improvements, city investments

- **Design**: Gold provides convenience, not raw combat power

- **Scaling**: Gold income increases with progression but remains QoL-focused

## Lair System (Phase 2)

### Comfort & Rested Mechanics

#### **Lair Rooms**

```typescript

export interface LairRoom {
  id: string;
  name: string;
  type: 'nest' | 'workshop' | 'trophy_hall' | 'library' | 'treasury';

  // Comfort System
  baseComfort: number;
  furnitureBonus: number;
  decorationBonus: number;
  totalComfort: number;

  // Rested Integration
  restedCapBonus: number; // +X hours to rested cap
  restedRegenBonus: number; // +X% to rested regeneration
}

```javascript

#### **Furniture & Decorations**

```typescript

export interface Furniture {
  id: string;
  name: string;
  type: 'functional' | 'decorative' | 'luxury';
  comfortValue: number;
  goldCost: number;

  // Placement
  roomType: string[];
  size: 'small' | 'medium' | 'large';
  placementRules: PlacementRule[];
}

```text

### Rested System Integration

#### **Comfort → Rested Conversion**

```typescript

export interface RestedCalculation {
  baseCap: number; // 24 hours
  comfortBonus: number; // +X hours from comfort
  totalCap: number; // baseCap + comfortBonus

  baseRegen: number; // 1x rate
  comfortRegenBonus: number; // +X% from comfort
  totalRegenRate: number; // baseRegen * (1 + comfortRegenBonus)
}

```text

#### **Rested Bonus Application**

- **Duration**: 15 minutes of +50% progression

- **Cooldown**: 30 minutes of playtime before next use

- **Maximum Impact**: ≤5% DPS pre-Rift (comfort affects rested only)

- **Visual Feedback**: Clear indication of rested status and availability

### Trophy System

#### **Achievement Trophies**

```typescript

export interface Trophy {
  id: string;
  name: string;
  description: string;
  unlockCondition: TrophyCondition;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';

  // Passive Bonuses
  passiveBonus: {
    type: 'comfort' | 'rested' | 'gold' | 'cosmetic';
    value: number;
  };

  // Display
  modelPath: string;
  placement: Vector3;
  lighting: LightingSettings;
}

```javascript

#### **Trophy Hall Mechanics**

- **Display Limits**: Maximum trophies per hall based on hall size

- **Lighting Effects**: Trophies provide ambient lighting and atmosphere

- **Social Features**: Trophy halls can be shared with other players

- **Progression**: Unlock larger halls through city development

## City Public Works (Phase 3)

### Project Pipeline System

#### **Construction Pipeline**

```typescript

export interface ConstructionPipeline {
  phases: ConstructionPhase[];
  currentPhase: number;
  progress: number; // 0-100%

  // Resource Requirements
  materials: MaterialRequirement[];
  labor: LaborRequirement;
  time: number; // estimated completion time

  // Benefits
  cityBonuses: CityBonus[];
  populationImpact: number;
  footfallImpact: number;
}

```text

#### **Construction Phases**

1. **Gather**: Collect raw materials from defeated enemies

1. **Transport**: Move materials to construction site

1. **Refine**: Process materials into construction components

1. **Build**: Assemble the final structure

1. **Commission**: Official opening and bonus activation

### Housing & Market Districts

#### **Bastion Tier System**

```typescript

export interface BastionTier {
  level: number; // BT1, BT2, BT3, etc.
  name: string;

  // Population Effects
  populationCap: number;
  populationGrowth: number; // residents per day

  // Hiring Quality
  staffQuality: number; // 1-10, affects shop performance
  wageMultiplier: number; // cost of hiring better staff

  // Unlock Requirements
  requirements: {
    previousTier: boolean;
    cityInvestments: number;
    timeElapsed: number;
  };
}

```javascript

#### **Market District Development**

- **Footfall Generation**: More residents = more customers

- **Shop Quality**: Better districts attract higher-quality vendors

- **Competition**: Multiple shops in same district affect pricing

- **Specialization**: Different districts specialize in different goods

### City Investment System

#### **Investment Types**

```typescript

export interface CityInvestment {
  id: string;
  name: string;
  type: 'housing' | 'infrastructure' | 'commerce' | 'defense';

  // Costs
  arcanaCost: number;
  goldCost: number;
  timeCost: number; // days to complete

  // Benefits
  globalBonuses: GlobalBonus[];
  districtEffects: DistrictEffect[];
  unlockRequirements: UnlockRequirement[];
}

```javascript

#### **Global Bonus Limits**

- **Pre-Rift Cap**: Maximum 10% of total combat power

- **Post-Rift**: Limits can be relaxed for endgame content

- **Balancing**: City bonuses enhance but don't replace combat progression

- **Transparency**: Clear indication of bonus sources and magnitudes

## Automation Systems (Phase 4)

### Roads & Transportation

#### **Transport Network**

```typescript

export interface TransportNetwork {
  routes: TransportRoute[];
  nodes: TransportNode[];
  guards: Guard[];

  // Safety System
  safetyIndex: number; // 0-100, affects incident rates
  incidentRate: number; // percentage chance of problems

  // Efficiency
  transportSpeed: number;
  capacity: number;
  costPerUnit: number;
}

```text

#### **Safety Index Management**

- **Guard Placement**: More guards = higher safety index

- **Route Optimization**: Safer routes cost more but have fewer incidents

- **Incident Types**: Bandits, weather, mechanical failures

- **Recovery**: Incidents cause downtime, not item loss

### Steward Contracts

#### **Steward System**

```typescript

export interface Steward {
  id: string;
  name: string;
  type: 'junior_dragon' | 'apprentice' | 'experienced';

  // Capabilities
  scrollHunting: number; // ability to find scrolls
  materialGathering: number; // ability to gather materials
  escortProtection: number; // ability to protect caravans

  // Contract Terms
  wage: number; // daily cost
  contractLength: number; // days
  specialization: 'scrolls' | 'materials' | 'balanced';
}

```text

#### **Delegation Tasks**

- **Scroll Hunting**: Assign stewards to search for specific scrolls

- **Material Gathering**: Collect resources from defeated areas

- **Caravan Escort**: Protect trade routes and merchant caravans

- **Exploration**: Scout new areas for potential expansion

### Task Board System

#### **Available Tasks**

```typescript

export interface Task {
  id: string;
  name: string;
  description: string;
  type: 'scroll*hunt' | 'material*gather' | 'escort' | 'exploration';

  // Requirements
  stewardLevel: number;
  timeRequired: number; // hours
  riskLevel: number; // 1-5, affects success rate

  // Rewards
  guaranteedRewards: Reward[];
  bonusRewards: Reward[];
  failurePenalty: Penalty;
}

```text

#### **Task Management**

- **Pity System**: Failed tasks increase success rate for retries

- **Risk/Reward**: Higher risk tasks offer better rewards

- **Specialization**: Stewards perform better at tasks matching their specialization

- **Queue Management**: Multiple tasks can be queued for efficient delegation

## Performance & Optimization

### City Simulation Performance

```typescript

export interface CityPerformance {
  // Population Simulation
  populationUpdateRate: number; // updates per minute
  maxPopulation: number; // performance limit

  // Construction Simulation
  projectUpdateRate: number; // updates per minute
  maxActiveProjects: number; // performance limit

  // Economy Simulation
  transactionUpdateRate: number; // updates per minute
  maxTransactions: number; // performance limit
}

```text

### Offline City Progression

- **Construction Continues**: Buildings progress while offline

- **Population Growth**: Residents increase over time

- **Economic Activity**: Shops continue operating

- **Resource Accumulation**: Materials gather in storage

## UI/UX Design

### City Interface

- **Single Progress Bar**: Overall city development progress

- **Bottleneck Indicators**: Red dots show where progress is blocked

- **Queue Management**: Visual queue for construction projects

- **Investment Planner**: Preview effects before spending resources

### Mobile Optimization

- **Simplified Interface**: Essential information only on mobile

- **Touch-Friendly**: Large buttons for city management

- **Offline Notifications**: Push notifications for completed projects

- **Quick Actions**: Common city tasks accessible with minimal taps

## Acceptance Criteria

- [ ] Meta-progression never exceeds 30% of combat power pre-Rift

- [ ] City bonuses capped at 10% of total power pre-Rift

- [ ] Lair comfort affects rested bonuses only (≤5% DPS impact)

- [ ] Town economy provides QoL improvements, not raw power

- [ ] Construction pipeline feels engaging but not overwhelming

- [ ] Steward delegation system provides meaningful automation

- [ ] City simulation performs well on all target devices

- [ ] Offline progression continues city development

- [ ] UI/UX supports both mobile and desktop city management

- [ ] Investment decisions feel meaningful and strategic
````
