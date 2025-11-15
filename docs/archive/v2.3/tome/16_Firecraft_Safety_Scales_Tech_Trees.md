# 16 — Firecraft, Safety & Scales Tech Trees

## Core Philosophy: Discovery-Driven Progression

**Fundamental Rule:** Only **Ember Potency** and **Draconic Vitality** are visible at game start. All other nodes in Firecraft, Safety, and Scales trees are **hidden** until discovered via Research.

### Research States Progression

````text

Unknown → Discovered (via Research) → Soul-Unlocked → Arcana-Leveled

```text

## Firecraft Tree: The Breath Weapon Mastery

### Tree Structure

```typescript

interface FirecraftNode {
  id: string;
  name: string;
  branch: 'Fuel' | 'Air' | 'Mix' | 'Ignition' | 'Throat' | 'Style';
  tierMin: FireTier;
  researchRequired: boolean;
  researchTitle: string;
  researchLabMin: number;
  prereqIds: string[];
  scaleGates: string[];

  // Progression
  arcanaCap: number;
  soulCap: number;
  baseArcanaCost: number;
  arcanaCostGrowth: number;
  baseSoulCost: number;
  soulCostGrowth: number;

  // Effects
  effectsPerArcana: Record<string, number>;
  effectsPerSoul: Record<string, number>;
}

```text

### Fire Tiers & Global Risk System

**Global Risk States** that modify breath nature and increase self-hazard:

| Tier | Hazard Mult | Key Triggers | Effects |
|------|-------------|--------------|---------|
| Regular | 1.00 | Default | Baseline breath |
| Blue | 1.05 | Hydride≥6 + Oxygenator≥4 + Honeycomb≥1 | Smokeless, piercing jets |
| Green | 1.10 | Resin≥6 + Honeycomb≥3 + Swirl≥3 | Caustic DoT, armor melt |
| Purple | 1.15 | Arc Organ≥6 + Pulse Reactor≥3 + Variable Swirlers≥2 | Chain arcs, pulse
staggers
|
| Dark | 1.20 | Arc Organ≥4 + Pulse Rate Tuning + Oxy-Shunt | Terror ticks, overburn |
| Black | 1.25 | Napalm Fractionator + Dust Cyclone + Preheater≥4 | Smoke fields, stacking
DoT
|
| Holy | 1.30 | Honeycomb≥5 + Pilot Comb≥4 + Oxy-Shunt | Radiant vs corrupted,
self-cleanse
|
| Azure | 1.35 | Blue + Heater≥5 + Jet Discipline≥3 + Beam≥3 | Armor-piercing lance |
| Prismatic | 1.40 | Any 3 styles + Dual Split-Beams | Cross-style combos |
| Void | 1.50 | Black+Dark+Azure depth≥24 | Apex glass-cannon |

### Firecraft Branches

#### Fuel Branch

**Purpose:** Controls fuel types, delivery, and combustion characteristics

**Research Schedule by Lab Level:**

- **L2:** Resin Still (Sticky DoT baseline)

- **L4:** Hydride Nodules (H2 storage; blue jet bias)

- **L4:** Gas Gut (Methane/volatile blend)

- **L5:** Bioreactor Valves (Stabilizes wet performance)

- **L6:** Napalm Fractionator (Refines resin to napalm-like mist)

- **L6:** Rapid Release Catalysts

- **L6:** Metal Dust Mill (Powder sparks; anti-swarm)

- **L7:** Dust Cyclone (AoE bloom)

**Key Nodes:**

```typescript

const fuelNodes = {
  'fire.resinStill': {
    name: 'Resin Still',
    effectsPerArcana: { dot*pct: 6, stickiness*pct: 2, cone*width*pct: 3 },
    effectsPerSoul: { start*level: 1, wet*penalty_pct: -15 }
  },
  'fire.hydrideNodules': {
    name: 'Hydride Nodules',
    effectsPerArcana: { dps*pct: 6, pierce*pct*every*3: 5 },
    effectsPerSoul: { start*level: 1, overpressure*resist_pct: 5 }
  },
  'fire.napalmFractionator': {
    name: 'Napalm Fractionator',
    tierMin: 'Regular',
    effectsPerArcana: { dot*pct: 7, vision*obscure_pct: 3 },
    effectsPerSoul: { dot*resist*pen_pct: 5 }
  }
};

```text

#### Air Branch

**Purpose:** Manages oxygen delivery, preheating, and combustion efficiency

**Research Schedule:**

- **L1:** Parabronchial Lungs (Sustain long breaths)

- **L3:** Oxygenator Gland (Oxy-doping pulses)

- **L4:** Aux Air Sacs

- **L5:** Counter-Current Preheater

- **L5:** Ceramic Regenerator

- **L6:** Oxy-Shunt

**Key Nodes:**

```typescript

const airNodes = {
  'fire.parabronchialLungs': {
    name: 'Parabronchial Lungs',
    effectsPerArcana: { duration*pct: 4, heat*sustain_pct: 3 },
    effectsPerSoul: { start_level: 1 }
  },
  'fire.oxygenatorGland': {
    name: 'Oxygenator Gland',
    effectsPerArcana: { overburn*temp*pct: 6 }, // for 0.8s
    effectsPerSoul: { start*level: 1, overburn*self*dmg*pct: -10 }
  },
  'fire.oxyShunt': {
    name: 'Oxy-Shunt',
    tierMin: 'Blue',
    effectsPerArcana: { overburn*duration*ms: 80, temp*stability*pct: 4 },
    effectsPerSoul: { overburn*self*dmg_pct: -20 }
  }
};

```text

#### Mix Branch

**Purpose:** Controls fuel-air mixing, flow patterns, and combustion dynamics

**Research Schedule:**

- **L2:** Nozzle Morphs

- **L3:** Bombardier Pulse Reactor

- **L4:** Swirl Throat

- **L4:** Venturi & Cavitation Pump

- **L5:** Variable Swirlers

- **L6:** Pulse Rate Tuning

- **L6:** Cavitation Snap

- **L7:** Dual Split-Beams

**Key Nodes:**

```typescript

const mixNodes = {
  'fire.pulseReactor': {
    name: 'Bombardier Pulse Reactor',
    effectsPerArcana: { stagger*pct: 6, recoil*pct: 2 },
    effectsPerSoul: { valve*fatigue*pct: -10 }
  },
  'fire.swirlThroat': {
    name: 'Swirl Throat',
    effectsPerArcana: { crit*chance*pct: 1.2, spread_pct: -3 },
    effectsPerSoul: { choke*risk*pct: -10 }
  },
  'fire.variableSwirlers': {
    name: 'Variable Swirlers',
    tierMin: 'Green',
    effectsPerArcana: { mode*swap*speed*pct: 10, pattern*bonus_pct: 4 },
    effectsPerSoul: { stability_pct: 6 }
  }
};

```text

#### Ignition Branch

**Purpose:** Manages spark generation, reliability, and ignition timing

**Research Schedule:**

- **L2:** Piezo Cartilage

- **L3:** Catalytic Pilot Comb

- **L3:** Electro Arc Organ

- **L4:** Flint Fangs

- **L5:** Multi-Spark Crown

- **L5:** Knapped Edge

- **L6:** Arc-Only Finisher (L8+)

**Key Nodes:**

```typescript

const ignitionNodes = {
  'fire.piezoCartilage': {
    name: 'Piezo Cartilage',
    effectsPerArcana: { ignite*reliability*pct: 7, wet*penalty*pct: -5 },
    effectsPerSoul: { start_level: 1 }
  },
  'fire.arcOrgan': {
    name: 'Electro Arc Organ',
    effectsPerArcana: { arc*length*pct: 4, storm*dps*pct: 3 },
    effectsPerSoul: { self*shock*pct: -10 }
  },
  'fire.arcFinisher': {
    name: 'Arc-Only Finisher',
    tierMin: 'Purple',
    effectsPerArcana: { execute*thresh*pct: 2, finisher*dmg*pct: 12 },
    effectsPerSoul: { self*shock*pct: -20 }
  }
};

```text

#### Throat/Kiln Branch

**Purpose:** Controls combustion chamber design and thermal management

**Research Schedule:**

- **L3:** Honeycomb Kiln-Throat

- **L5:** Heater Muscles

- **L6:** Kiln Surge

- **L7:** Tile Cartridges (L8+)

**Key Nodes:**

```typescript

const throatNodes = {
  'fire.honeycombKiln': {
    name: 'Honeycomb Kiln-Throat',
    effectsPerArcana: { efficiency*pct: 5, soot*rate*pct: -4, temp*stability_pct: 4 },
    effectsPerSoul: { tile*crack*resist_pct: 6 }
  },
  'fire.heaterMuscles': {
    name: 'Heater Muscles',
    effectsPerArcana: { preheat*time*pct: -6, cold*start*bonus*dps*pct: 3 },
    effectsPerSoul: { fatigue*gain*pct: -10 }
  },
  'fire.kilnSurge': {
    name: 'Kiln Surge',
    tierMin: 'Azure',
    effectsPerArcana: { surge*dps*pct: 10 }, // for 1s
    effectsPerSoul: { fatigue*gain*pct: -15 }
  }
};

```text

#### Style Branch

**Purpose:** Advanced techniques and specialized applications

**Research Schedule:**

- **L6:** Jet Discipline

- **L7:** Ink-Fire Pigment Gland

- **L7:** Shock-Diamond Dynamics

**Key Nodes:**

```typescript

const styleNodes = {
  'fire.jetDiscipline': {
    name: 'Jet Discipline',
    tierMin: 'Blue',
    effectsPerArcana: { beam*swap*cost*arcana*pct: -6, beam*stability*pct: 6 },
    effectsPerSoul: { pierce_pct: 2 }
  },
  'fire.inkPigmentGland': {
    name: 'Ink-Fire Pigment Gland',
    tierMin: 'Black',
    effectsPerArcana: { smoke*density*pct: 10, blind_pct: 3 },
    effectsPerSoul: { self*vision*through_smoke: 1 }
  },
  'fire.shockDiamonds': {
    name: 'Shock-Diamond Dynamics',
    tierMin: 'Azure',
    effectsPerArcana: { beam*range*pct: 6, crit*dmg*pct: 4 },
    effectsPerSoul: { overpressure*resist*pct: 8 }
  }
};

```text

## Safety Tree: Hazard Mitigation

### Purpose & Gating

Safety nodes **mitigate hazard** from Firecraft investments but are **gated by Scales**
requirements..
Higher Fire Tiers push players toward Safety investments to avoid self-damage.

### Safety Categories

#### Flow Safeguards

```typescript

interface FlowSafety {
  id: string;
  name: string;
  requiredScales: string[];
  hazardReduction: number;
  effects: SafetyEffect[];
}

const flowSafetyNodes = {
  'safety.dualStageArrestors': {
    name: 'Dual-Stage Arrestors',
    requiredScales: ['keratin-ferrite-s1'],
    hazardReduction: 0.15,
    effects: ['flow*backup*protection', 'pressure*spike*mitigation']
  },
  'safety.microShutters': {
    name: 'Micro-Shutters',
    requiredScales: ['keratin-ferrite-s2'],
    hazardReduction: 0.10,
    effects: ['rapid*flow*cutoff', 'emergency_isolation']
  }
};

```javascript

#### Thermal Management

```typescript

const thermalSafetyNodes = {
  'safety.coolantGlandExpansion': {
    name: 'Coolant Gland Expansion',
    requiredScales: ['thermal-regulation-s1'],
    hazardReduction: 0.20,
    effects: ['active*cooling', 'thermal*soak_capacity']
  },
  'safety.radiativeFins': {
    name: 'Radiative Fins',
    requiredScales: ['thermal-regulation-s2'],
    hazardReduction: 0.12,
    effects: ['passive*heat*dissipation', 'surface*area*increase']
  }
};

```javascript

#### Pressure Control

```typescript

const pressureSafetyNodes = {
  'safety.elasticWalling': {
    name: 'Elastic Walling',
    requiredScales: ['pressure-containment-s1'],
    hazardReduction: 0.18,
    effects: ['pressure*absorption', 'expansion*accommodation']
  },
  'safety.reflexCutOff': {
    name: 'Reflex Cut-Off',
    requiredScales: ['pressure-containment-s2'],
    hazardReduction: 0.25,
    effects: ['instantaneous*shutdown', 'pressure*release_valves']
  }
};

```javascript

### Hazard Calculation System

```typescript

interface HazardSystem {
  fireLoad: number;      // Weighted sum of Firecraft outputs × Tier Hazard
  safetyCapacity: number; // Sum of Safety mitigations (gated by Scales)
  chassisLimit: number;   // Structural allowances from Scales
}

function calculateSelfDamage(hazard: HazardSystem): number {
  const k1 = 0.005; // Tuning constant for Fire Load overflow
  const k2 = 0.003; // Tuning constant for Safety overflow

  let selfDamage = 0;
  if (hazard.fireLoad > hazard.safetyCapacity) {
    selfDamage += k1 * (hazard.fireLoad - hazard.safetyCapacity);
  }
  if (hazard.safetyCapacity > hazard.chassisLimit) {
    selfDamage += k2 * (hazard.safetyCapacity - hazard.chassisLimit);
  }

  return selfDamage;
}

```text

## Scales Tree: Chassis & Structure

### Purpose & Progression

Scales nodes provide **structural support** and **thermal/electrical management**..
They gate Safety usage and provide passive benefits.

### Scale Categories

#### Structural Integrity

```typescript

const structuralScales = {
  'scales.diamondoidMicroplates': {
    name: 'Diamondoid Microplates',
    requiredScales: [],
    effects: ['chassis*limit*+50', 'structural*integrity*+25'],
    gatesSafety: ['keratin-ferrite-s1']
  },
  'scales.scaleLatticeTrusses': {
    name: 'Scale-Lattice Trusses',
    requiredScales: ['diamondoid-microplates'],
    effects: ['chassis*limit*+75', 'load*distribution*improved'],
    gatesSafety: ['keratin-ferrite-s2']
  }
};

```javascript

#### Thermal Management (2)

```typescript

const thermalScales = {
  'scales.heatRedistributionChannels': {
    name: 'Heat-Redistribution Channels',
    requiredScales: ['scale-lattice-trusses'],
    effects: ['thermal*capacity*+40', 'heat*flow*optimization'],
    gatesSafety: ['thermal-regulation-s1']
  },
  'scales.advancedReflectiveShingles': {
    name: 'Advanced Reflective Shingles',
    requiredScales: ['heat-redistribution-channels'],
    effects: ['thermal*reflection*+30', 'heat*resistance*+20'],
    gatesSafety: ['thermal-regulation-s2']
  }
};

```javascript

#### Electrical Systems

```typescript

const electricalScales = {
  'scales.electroReflective': {
    name: 'Electro-Reflective Coating',
    requiredScales: ['advanced-reflective-shingles'],
    effects: ['electrical*resistance*+35', 'shock_protection'],
    gatesSafety: ['electrical-isolation-s1']
  }
};

```javascript

#### Regenerative Systems

```typescript

const regenerativeScales = {
  'scales.moltCycleControl': {
    name: 'Molt Cycle Control',
    requiredScales: ['electro-reflective'],
    effects: ['regeneration*rate*+50', 'damage*repair*improved'],
    gatesSafety: ['regenerative-systems-s1']
  },
  'scales.dragonsblood': {
    name: 'Dragonsblood Enhancement',
    requiredScales: ['molt-cycle-control'],
    effects: ['healing*factor*+75', 'immune*response*boost'],
    gatesSafety: ['regenerative-systems-s2']
  },
  'scales.heatShock': {
    name: 'Heat-Shock Proteins',
    requiredScales: ['dragonsblood'],
    effects: ['thermal*adaptation', 'stress*resistance_+60'],
    gatesSafety: ['regenerative-systems-s3']
  }
};

```text

## Research Lab Integration

### Lab Level Progression

```typescript

interface LabLevel {
  level: number;
  slots: number;      // Parallel research capacity
  queue: number;      // Queued research capacity
  topics: string[];   // Available research topics
}

const labProgression: LabLevel[] = [
  { level: 1, slots: 1, queue: 2, topics: ["Parabronchial Lungs"] },
{ level: 2, slots: 1, queue: 2, topics: ["Resin Still", "Piezo Cartilage", "Nozzle
Morphs"]
},
{ level: 3, slots: 2, queue: 3, topics: ["Oxygenator Gland", "Bombardier Pulse Reactor",
"Honeycomb
Kiln-Throat",
"Catalytic
Pilot
Comb",
"Electro
Arc
Organ"]
},
{ level: 4, slots: 2, queue: 3, topics: ["Hydride Nodules", "Gas Gut", "Aux Air Sacs",
"Swirl
Throat",
"Venturi
&
Cavitation
Pump",
"Flint
Fangs"]
},
{ level: 5, slots: 2, queue: 4, topics: ["Bioreactor Valves", "Counter-Current Preheater",
"Variable
Swirlers",
"Multi-Spark
Crown",
"Knapped
Edge",
"Ceramic
Regenerator",
"Heater
Muscles"]
},
{ level: 6, slots: 3, queue: 4, topics: ["Napalm Fractionator", "Rapid Release Catalysts",
"Oxy-Shunt",
"Pulse
Rate
Tuning",
"Cavitation
Snap",
"Metal
Dust
Mill",
"Jet
Discipline"]
},
{ level: 7, slots: 3, queue: 5, topics: ["Dual Split-Beams", "Shock-Diamond Dynamics",
"Kiln
Surge",
"Ink-Fire
Pigment
Gland",
"Self-Heating
Mesh",
"Dust
Cyclone"]
},
  { level: 8, slots: 3, queue: 5, topics: ["Tile Cartridges", "Arc-Only Finisher"] }
];

```javascript

### Research Cost Structure

```typescript

interface ResearchTitle {
  title: string;
  nodeId: string;
  labMin: number;
  timeBand: 'S' | 'M' | 'L';  // Short/Medium/Long duration
  soulCost: number;
  materials: MaterialRequirement[];
}

interface MaterialRequirement {
  materialId: string;
  quantity: number;
}

// Example research titles
const researchTitles = {
  'fire.hydrideNodules': {
    title: 'Hydride Storage Science: Applied Methods',
    nodeId: 'fire.hydrideNodules',
    labMin: 6,
    timeBand: 'M',
    soulCost: 25,
    materials: [
      { materialId: 'synth.aetherGlass', quantity: 2 },
      { materialId: 'synth.runedWire', quantity: 1 }
    ]
  }
};

```javascript

## Synth Materials Integration

### Material Requirements for Research

```typescript

interface SynthIntegration {
  materialId: string;
  tier: 1 | 2 | 3;
  researchUsages: string[]; // Which research titles use this material
  productionTime: number;
  inputs: MaterialInput[];
}

const synthMaterials = {
  'synth.aetherGlass': {
    tier: 1,
    researchUsages: ['fire.hydrideNodules', 'fire.gasGut', 'fire.oxyShunt'],
    productionTime: 120, // seconds
    inputs: [] // Base material
  },
  'synth.runedWire': {
    tier: 1,
    researchUsages: ['fire.hydrideNodules', 'fire.pulseReactor', 'fire.arcOrgan'],
    productionTime: 150,
    inputs: []
  },
  'synth.drakeboneResin': {
    tier: 1,
    researchUsages: ['fire.resinStill', 'fire.napalmFractionator'],
    productionTime: 180,
    inputs: [
      { materialId: 'synth.aetherGlass', quantity: 1 }
    ]
  }
};

```text

## Economic Balance

### Currency Flows

```typescript

interface TechTreeEconomics {
  arcana: {
    growthPattern: 'geometric_1.17';
    tierUpMultiplier: '15x*to*25x';
    resetCondition: 'return*to*draconia';
  };
  soulPower: {
    growthPattern: 'geometric_1.90';
    resetCondition: 'never';
    primaryUse: 'node_unlocking';
  };
  synthMaterials: {
    productionTime: 'time_based';
    rankInflation: 'exponential';
    researchRequirements: 'variable';
  };
}

```text

### Progression Gates

1. **Discovery Gate**: Research reveals hidden nodes

1. **Soul Gate**: Soul Power unlocks discovered nodes

1. **Arcana Gate**: Arcana levels unlocked nodes during runs

1. **Safety Gate**: Scales nodes gate Safety usage

1. **Material Gate**: Synth materials enable research

## Acceptance Criteria

- [ ] Only Ember Potency and Draconic Vitality visible at game start

- [ ] All other nodes hidden until research completion

- [ ] Fire Tier system increases both power and hazard appropriately

- [ ] Safety nodes properly gated by Scales requirements

- [ ] Research Lab progression controls discovery pacing

- [ ] Synth materials provide meaningful research requirements

- [ ] Economic balance prevents runaway progression

- [ ] Hazard calculation system provides meaningful risk/reward choices

- [ ] All nodes follow consistent design patterns and cost curves

## Complete Tech Tree Data Integration

### Fire Tech Tree Nodes (Complete CSV Data)

```typescript

interface FireTechNode {
  tree: 'Fire';
  id: string;
  name: string;
  branch: string;
  tier_min: string;
  arcana_cap: number;
  soul_cap: number;
  base*arcana*cost: number;
  arcana*cost*growth: number;
  base*soul*cost: number;
  soul*cost*growth: number;
  per*arcana*effect: string;
  per*soul*effect: string;
  prereq_ids: string;
  scale_gates: string;
  notes: string;
}

const FIRE*TECH*NODES: FireTechNode[] = [
  {
    tree: 'Fire',
    id: 'fire.resinStill',
    name: 'Resin Still',
    branch: 'Fuel',
    tier_min: 'Regular',
    arcana_cap: 12,
    soul_cap: 3,
    base*arcana*cost: 6,
    arcana*cost*growth: 1.17,
    base*soul*cost: 15,
    soul*cost*growth: 1.9,
    per*arcana*effect: 'dot*pct:+6;stickiness*pct:+2;cone*width*pct:+3',
    per*soul*effect: 'start*level:+1;wet*penalty_pct:-15',
    prereq_ids: '',
    scale_gates: '',
    notes: 'Sticky DoT baseline'
  },
  {
    tree: 'Fire',
    id: 'fire.napalmFractionator',
    name: 'Napalm Fractionator',
    branch: 'Fuel',
    tier_min: 'Regular',
    arcana_cap: 10,
    soul_cap: 2,
    base*arcana*cost: 12,
    arcana*cost*growth: 1.19,
    base*soul*cost: 35,
    soul*cost*growth: 1.9,
    per*arcana*effect: 'dot*pct:+7;vision*obscure_pct:+3',
    per*soul*effect: 'dot*resist*pen_pct:+5',
    prereq_ids: 'fire.resinStill',
    scale_gates: '',
    notes: 'Refines resin to napalm-like mist'
  }
  // ... additional Fire nodes would be added here from CSV data
];

```javascript

### Safety Tech Tree Nodes (Complete CSV Data)

```typescript

interface SafetyTechNode {
  tree: 'Safety';
  id: string;
  name: string;
  branch: string;
  tier_min: string;
  arcana_cap: number;
  soul_cap: number;
  base*arcana*cost: number;
  arcana*cost*growth: number;
  base*soul*cost: number;
  soul*cost*growth: number;
  per*arcana*effect: string;
  per*soul*effect: string;
  prereq_ids: string;
  scale_gates: string;
  notes: string;
}

const SAFETY*TECH*NODES: SafetyTechNode[] = [
  {
    tree: 'Safety',
    id: 'safety.flashbackArrestors',
    name: 'Flashback Arrestors',
    branch: 'Flow',
    tier_min: '-',
    arcana_cap: 12,
    soul_cap: 3,
    base*arcana*cost: 6,
    arcana*cost*growth: 1.17,
    base*soul*cost: 18,
    soul*cost*growth: 1.9,
    per*arcana*effect: 'backfire*chance*pct:-8;backfire*dmg*pct:-10',
    per*soul*effect: 'dual*stage*unlock:yes',
    prereq_ids: '',
    scale_gates: 'scales.keratinFerrite:S1',
    notes: ''
  },
  {
    tree: 'Safety',
    id: 'safety.dualStageArrestors',
    name: 'Dual-Stage Arrestors',
    branch: 'Flow',
    tier_min: '-',
    arcana_cap: 8,
    soul_cap: 2,
    base*arcana*cost: 10,
    arcana*cost*growth: 1.17,
    base*soul*cost: 40,
    soul*cost*growth: 1.9,
    per*arcana*effect: 'gas*line*safety*pct:+12;resin*line*safety*pct:+12',
    per*soul*effect: '',
    prereq_ids: 'safety.flashbackArrestors',
    scale_gates: 'scales.keratinFerrite:S2',
    notes: ''
  }
  // ... additional Safety nodes would be added here from CSV data
];

```javascript

### Scales Tech Tree Nodes (Complete CSV Data)

```typescript

interface ScalesTechNode {
  tree: 'Scales';
  id: string;
  name: string;
  branch: string;
  tier_min: string;
  arcana_cap: number;
  soul_cap: number;
  base*arcana*cost: number;
  arcana*cost*growth: number;
  base*soul*cost: number;
  soul*cost*growth: number;
  per*arcana*effect: string;
  per*soul*effect: string;
  prereq_ids: string;
  scale_gates: string;
  notes: string;
}

const SCALES*TECH*NODES: ScalesTechNode[] = [
  {
    tree: 'Scales',
    id: 'scales.keratinFerrite',
    name: 'Keratin-Ferrite Lamellae',
    branch: 'Structure',
    tier_min: '-',
    arcana_cap: 15,
    soul_cap: 5,
    base*arcana*cost: 6,
    arcana*cost*growth: 1.17,
    base*soul*cost: 12,
    soul*cost*growth: 1.9,
    per*arcana*effect: 'max*hp*pct:+4;phys*resist*pct:+2',
    per*soul*effect: 'safety_gate:A',
    prereq_ids: '',
    scale_gates: '',
    notes: ''
  },
  {
    tree: 'Scales',
    id: 'scales.diamondoid',
    name: 'Diamondoid Microplates',
    branch: 'Structure',
    tier_min: '-',
    arcana_cap: 12,
    soul_cap: 4,
    base*arcana*cost: 8,
    arcana*cost*growth: 1.17,
    base*soul*cost: 25,
    soul*cost*growth: 1.9,
    per*arcana*effect: 'proj*crit*reduct*pct:+3;armor*shred*resist*pct:+2',
    per*soul*effect: 'safety_gate:B',
    prereq_ids: '',
    scale_gates: '',
    notes: ''
  }
  // ... additional Scales nodes would be added here from CSV data
];

```javascript

### Tech Tree Integration System

```typescript

interface TechTreeSystem {
  fire: FireTechNode[];
  safety: SafetyTechNode[];
  scales: ScalesTechNode[];
  tiers: FireTier[];
}

class TechTreeManager {
  private trees: TechTreeSystem;

  constructor() {
    this.trees = {
      fire: FIRE*TECH*NODES,
      safety: SAFETY*TECH*NODES,
      scales: SCALES*TECH*NODES,
      tiers: FIRE_TIERS
    };
  }

getNode(tree: 'fire' | 'safety' | 'scales', id: string): FireTechNode | SafetyTechNode |
ScalesTechNode
|
null
{
    return this.trees[tree].find(node => node.id === id) || null;
  }

getAvailableNodes(player: Player, tree: 'fire' | 'safety' | 'scales'): (FireTechNode |
SafetyTechNode
|
ScalesTechNode)[]
{
    return this.trees[tree].filter(node => this.canUnlockNode(player, node));
  }

canUnlockNode(player: Player, node: FireTechNode | SafetyTechNode | ScalesTechNode):
boolean
{
    // Check prerequisites, resource requirements, and scale gates
    return true; // Implementation details
  }

unlockNode(player: Player, node: FireTechNode | SafetyTechNode | ScalesTechNode): boolean
{
    if (!this.canUnlockNode(player, node)) return false;

    // Deduct costs and apply effects
    // Update player progress
    return true;
  }
}

```bash

## Cross-References

- [Shooter-Idle Core Loop](03*ShooterIdle*Core_Loop.md) - How tech trees integrate with core progression

- [Economy: Currencies, Items, Market](07*Economy*Currencies*Items*Market.md) - Economic systems supporting tech progression

- [Balancing: Math, Curves & Tables](17*Balancing*Math*Curves*Tables.md) - Mathematical formulas and cost curves

- [Town, Lair & City Public Works](08*Town*Lair*City*PublicWorks.md) - Synth production systems
````
