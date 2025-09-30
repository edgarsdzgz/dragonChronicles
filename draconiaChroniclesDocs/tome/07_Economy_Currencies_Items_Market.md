# 07 — Economy: Currencies, Items, Market

## Currency System Overview

Draconia Chronicles uses a **four-currency system** designed to support different
progression
layers
and
player
motivations:

### Primary Currencies

#### Arcana (Run-Bound Power Currency)

````typescript

interface ArcanaSystem {
  type: 'temporary';
  resetCondition: 'return*to*draconia';
  primaryUse: 'enchant_leveling';
  growthPattern: 'geometric_1.17';
  tierUpMultiplier: '15x*to*25x';
}

```text

**Acquisition**:

- Per-kill drops with curve: `A(L) = 0.03 × 1.40^(L−1)`

- Bonus from lane object destruction (+10% for banners, kites, totems)

- Chain bonuses for multi-kills via environmental collapses

**Usage**:

- Level unlocked Firecraft/Safety/Scales nodes during journeys

- Typical node cost growth: **×1.17** per level

- **Soul Forging costs:** **15-25× last cost** (temporary) or high Soul Power cost (permanent)

#### Soul Power (Meta Progression Currency)

```typescript

interface SoulPowerSystem {
  type: 'permanent';
  resetCondition: 'never';
  primaryUse: 'node_unlocking';
  growthPattern: 'geometric_1.90';
  secondaryUse: 'permanent_bonuses';
}

```text

**Acquisition**:

- Per-kill drops with curve: `S(L) = 0.01 × 1.05^(L−1)`

- Research completion bonuses

- Elite and boss kill bonuses

**Usage**:

- Unlock discovered nodes in tech trees

- Purchase permanent "starts-at-level" bonuses

- **Perform permanent Soul Forging** (extend level caps permanently)

- **Location Restriction**: Can ONLY be spent in Draconia (main town/base)

- **Journey Restriction**: Cannot be spent during journeys - only between journeys

- Typical node cost growth: **×1.90** per rank

#### Gold (Quality of Life Currency)

```typescript

interface GoldSystem {
  type: 'persistent';
  resetCondition: 'never';
  primaryUse: 'convenience_upgrades';
  acquisition: 'item_sales';
}

```text

**Acquisition**:

- Sell collected items to Vendor (15% tax) or Kiosk (5% dues)

- Item values based on rarity and appraisal system

- Caravan trading and market fluctuations

**Usage**:

- Synth production speed upgrades (Minerals ladder)

- Convenience features and quality-of-life improvements

- Market stall rentals and trading fees

#### Astral Seals (Premium Currency)

```typescript

interface AstralSealsSystem {
  type: 'premium';
  loreIntegration: 'cosmic_fragments';
  acquisition: 'rare*drops*and_purchase';
  primaryUse: 'rune_gachapon';
}

```javascript

**Lore Foundation**: Fragments of the **First Flame** bound in celestial glass, representing petitions to cosmic forces rather than mere wealth.

**Acquisition**:

- Rare drops from boss encounters

- Meteor events/comet showers in late-game lands

- Limited quest/achievement rewards

- Optional real-world purchase bundles

**Usage**:

- **Rune Gachapon**: Randomized rune draws for powerful enchantments

- **Lab Expansion**: Additional research slots and queue capacity

- **Rune Slots**: Unlock additional rune equipment slots

- **Cosmetic Purchases**: Visual customization options (future)

## Item System

### Item Categories & Rarity

```typescript

enum ItemRarity {
  Common = 1,    // Grey - basic materials and components
  Uncommon = 2,  // Green - improved materials and minor enchants
  Rare = 3,      // Blue - significant upgrades and useful enchants
  Epic = 4,      // Purple - powerful enchants and rare materials
  Legendary = 5  // Orange - unique items with special properties
}

interface Item {
  id: string;
  name: string;
  rarity: ItemRarity;
  category: ItemCategory;
  baseValue: number;
  properties: ItemProperty[];
  stackSize: number;
  description: string;
}

enum ItemCategory {
  MATERIAL = 'material',      // Crafting components
  ENCHANT_SCROLL = 'scroll',  // Ability and enhancement scrolls
  TREASURE = 'treasure',      // Valuable trade goods
  CONSUMABLE = 'consumable',  // Temporary effect items
  RUNE = 'rune'              // Permanent equipment pieces
}

```text

### Item Acquisition

- **Enemy Drops**: Contextual drops based on enemy type and region

- **Environmental**: Destructible objects and hidden caches

- **Boss Rewards**: Guaranteed rare+ items from boss encounters

- **Exploration**: Discovery rewards for reaching new areas

- **Events**: Special items from timed events and challenges

### Appraisal System

```typescript

interface AppraisalSystem {
  baseValue: number;
  rarityMultiplier: number;
  conditionModifier: number;  // Wear and tear effects
  marketDemand: number;       // Regional price fluctuations
  merchantRelation: number;   // Reputation bonuses
}

function calculateItemValue(item: Item, context: AppraisalContext): number {
  const base = item.baseValue;
  const rarity = RARITY_MULTIPLIERS[item.rarity];
  const condition = context.conditionModifier;
  const demand = context.marketDemand;
  const relation = context.merchantRelation;

  return Math.floor(base * rarity * condition * demand * relation);
}

```javascript

## Market Systems

### Town Markets (Phase 1)

#### Vendor (Basic Sales)

```typescript

interface VendorSystem {
  taxRate: 0.15;           // 15% tax on all sales
  acceptsAll: true;        // Buys any item type
  priceVariation: 'none';  // Fixed pricing
  convenience: 'high';     // Always available
}

```javascript

#### Kiosk (Improved Sales)

```typescript

interface KioskSystem {
  duesRate: 0.05;          // 5% dues on sales
  throughputCap: number;   // Limited daily volume
  priceBonus: 0.10;        // +10% base prices
  requirements: 'unlock';   // Requires city investment
}

```javascript

### Advanced Markets (Future Phases)

#### Owned Shop System

```typescript

interface OwnedShop {
  staffing: StaffMember[];
  wages: number;
  taxRate: number;
  coverage: MarketCoverage;
  mercantileXP: number;
  reputation: number;
}

interface StaffMember {
  name: string;
  skill: number;
  wage: number;
  specialization: string[];
}

```text

**Trade-offs**:

- **Higher Wages** → Better staff → Higher sale prices

- **Lower Taxes** → Reduced city services → Market instability

- **Broader Coverage** → More customers → Higher operating costs

#### Caravan Trading

```typescript

interface CaravanRoute {
  origin: string;
  destination: string;
  duration: number;
  risk: number;
  demandModifiers: Record<ItemCategory, number>;
  specialGoods: string[];
}

```text

## Synth Materials Economy

### Material Production Tiers

```typescript

interface SynthMaterial {
  id: string;
  tier: 1 | 2 | 3;
  rank: MaterialRank;
  baseTime: number;        // Base production time
  inputs: MaterialInput[]; // Required input materials
  unlockConditions: string[];
}

enum MaterialRank {
  NONE = 0,      // Base materials
  FINE = 1,      // ×3 time multiplier
  GOOD = 2,      // ×5 time multiplier
  SUPERIOR = 3,  // ×8 time multiplier
  REFINED = 4,   // ×12 time multiplier
  GREATER = 5,   // ×18 time multiplier
  MAJESTIC = 6,  // ×27 time multiplier
  ASCENDANT = 7, // ×40 time multiplier
  MYTHIC = 8,    // ×60 time multiplier
  ROYAL = 9      // ×90 time multiplier
}

```text

### Tier 1 Materials (Game Start)

- **Aetherglass Pane**: Base visual optics material

- **Runed Copper Wire**: Glyph conduction components

### Tier 1 Expanded (Unlocked via progression)

- **Drakebone Resin**: Bio-resin base for sticky applications

- **Ceramic Honeycomb Blank**: Kiln substrate material

- **Catalyst Powder**: Noble-dust analog for reactions

- **Arcstone Shard**: Electro-active mineral

### Tier 2 Materials (Advanced)

- **Mythril Filament**: High-conductivity wiring

- **Phoenix Ash**: Thermal regulation component

- **Void Ink**: Obscurant and stealth material

- **Platinum Contacts**: Precision electrical components

- **Dragonhide Seals**: Pressure and thermal sealing

- **Azurite Lens**: Optical focusing elements

### Production Formulas

```typescript

// Time calculation with rank inflation
function productionTime(material: SynthMaterial, level: number): number {
  const baseTime = material.baseTime;
  const rankMult = RANK*TIME*MULTIPLIERS[material.tier][material.rank];
  const levelMult = Math.pow(1.08, level - 1); // 8% per level
  const discounts = calculateCheckpointDiscounts(level);

  return baseTime * rankMult * levelMult * (1 - discounts);
}

// Input quantity scaling
function inputQuantity(baseQty: number, level: number): number {
  const qtySlope = 0.35;
  return Math.ceil(baseQty * (1 + qtySlope * Math.floor((level - 1) / 10)));
}

```javascript

### Checkpoint Rewards

```typescript

interface CheckpointReward {
  level: number;
  timeReduction: number;
  materialReduction: number;
  productionBonus: number;
  synthPoints: number;
  specialEffect?: string;
}

const checkpoints: CheckpointReward[] = [
{ level: 2, timeReduction: 0.02, materialReduction: 0, productionBonus: 0, synthPoints: 0
},
{ level: 5, timeReduction: 0.05, materialReduction: 0, productionBonus: 0, synthPoints: 0
},
{ level: 10, timeReduction: 0.08, materialReduction: 0, productionBonus: 0, synthPoints: 1
},
{ level: 20, timeReduction: 0.12, materialReduction: 0.08, productionBonus: 0.20,
synthPoints:
2
},
{ level: 35, timeReduction: 0.15, materialReduction: 0.10, productionBonus: 0.25,
synthPoints:
3
},
{ level: 50, timeReduction: 0, materialReduction: 0, productionBonus: 0, synthPoints: 4,
specialEffect:
'infinite_output'
}
];

```javascript

## Minerals Ladder (Global Synth Upgrades)

```typescript

interface Mineral {
  name: string;
  speedBonus: number;
  costReduction: number;
  specialEffect?: string;
  source: string;
}

const mineralsLadder: Mineral[] = [
{ name: 'Gold', speedBonus: 0.05, costReduction: 0.02, source: 'Early caves, item sales'
},
{ name: 'White Gold', speedBonus: 0.07, costReduction: 0.03, specialEffect: '+1 lab
queue',
source:
'Caves
II'
},
{ name: 'Platinum', speedBonus: 0.10, costReduction: 0.04, specialEffect: '+1 parallel
T1',
source:
'Caves
III'
},
{ name: 'Azure Platinum', speedBonus: 0.12, costReduction: 0.05, specialEffect: '-10% job
cooldown',
source:
'Azure
caves'
},
{ name: 'Black Platinum', speedBonus: 0.15, costReduction: 0.06, specialEffect: '+1
parallel
T2',
source:
'Black
caves'
},
{ name: 'Royal Platinum', speedBonus: 0.18, costReduction: 0.08, specialEffect: '+1 global
parallel,
+1
lab
queue',
source:
'Royal
caves'
}
];

```text

## Economic Balance & Anti-Cheese

### Guardrails

- **No Mandatory RNG**: All progression paths have deterministic alternatives

- **Fair Use Policy**: Reasonable limits on exploitation without punishing normal play

- **Inflation Control**: Zone dampers and kill-type multipliers prevent runaway growth

- **Soft Caps**: Diminishing returns on extreme stacking prevent game-breaking builds

### Balance Monitoring

```typescript

interface EconomicMetrics {
  arcanaInflationRate: number;    // Track per-hour Arcana gains
  soulPowerAccumulation: number;  // Monitor meta progression rate
  itemValueStability: number;     // Market price fluctuation bounds
  synthBottlenecks: string[];     // Identify production constraints
  playerSpendingPatterns: Record<string, number>; // Currency allocation
}

```javascript

### Dynamic Adjustments

- **Kill Type Multipliers**: Fodder enemies → Arcana+, Elites → Soul Power+

- **Regional Modifiers**: Different lands provide different currency emphasis

- **Event Bonuses**: Temporary boosts to specific currency types

- **Seasonal Adjustments**: Limited-time economic events and bonuses

## Rune System Integration

### Rune Gachapon

```typescript

interface RuneGacha {
  cost: number;              // Astral Seals per draw
  rarityWeights: number[];   // Probability distribution
  pitySystem: PityConfig;    // Guaranteed rare after X draws
  seasonalPool: Rune[];      // Limited-time runes
}

interface PityConfig {
  rareGuarantee: 10;    // Guaranteed rare every 10 draws
  epicGuarantee: 50;    // Guaranteed epic every 50 draws
  legendaryGuarantee: 200; // Guaranteed legendary every 200 draws
}

```javascript

### Rune Slot Expansion

- **Base Slots**: 3 rune slots available at start

- **Expansion Cost**: Astral Seals to unlock additional slots

- **Maximum Slots**: 8 total slots (5 purchasable expansions)

- **Slot Types**: Universal slots that accept any rune type

## Telemetry & Analytics

### Economic Events

```typescript

type EconomicEvent =
  | { type: 'currency_gain', currency: string, amount: number, source: string }
  | { type: 'currency_spend', currency: string, amount: number, target: string }
  | { type: 'item_acquire', itemId: string, rarity: ItemRarity, source: string }
  | { type: 'item_sell', itemId: string, value: number, merchant: string }
  | { type: 'synth_complete', materialId: string, level: number, duration: number }
  | { type: 'research_cost', nodeId: string, soulCost: number, materials: MaterialCost[] }
  | { type: 'gacha_draw', cost: number, result: string, pityCounter: number };

```text

### Key Metrics

- **Currency Velocity**: How quickly players earn and spend each currency

- **Upgrade Cadence**: Time between meaningful purchases

- **Market Efficiency**: Price stability and trading volume

- **Progression Bottlenecks**: Where players get stuck economically

- **Premium Conversion**: Astral Seal acquisition vs purchase rates

## Acceptance Criteria

- [ ] Four-currency system implemented with distinct roles and acquisition methods

- [ ] Item system supports rarity tiers and contextual drops

- [ ] Market progression from Vendor → Kiosk → Owned Shop

- [ ] Synth material production with time-based progression and rank loops

- [ ] Minerals ladder provides meaningful global upgrades

- [ ] Astral Seals integration with Rune Gachapon and convenience features

- [ ] Economic balance prevents exploitation while maintaining engagement

- [ ] Telemetry captures all currency flows and economic interactions

## Cross-References

- [Shooter-Idle Core Loop](03*ShooterIdle*Core_Loop.md) - Currency acquisition and spending loops

- [Town, Lair & City Public Works](08*Town*Lair*City*PublicWorks.md) - City-based economic systems

- [Balancing: Math, Curves & Tables](17*Balancing*Math*Curves*Tables.md) - Economic formulas and tuning

- [Telemetry, Stats & Analytics](16*Telemetry*Stats_Analytics.md) - Economic event tracking
````
