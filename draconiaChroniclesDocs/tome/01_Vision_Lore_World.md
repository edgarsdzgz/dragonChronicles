# 01 — Vision, Lore & North Star

## Player Promise

> "Push forward, overcome waves, **return to Draconia to invest**, then surge farther."

## Core Vision

Draconia Chronicles is a **shooter-idle hybrid** where players control a dragon defending
the
Dragonlands
from
encroaching
evil..
The game combines real-time combat mechanics with idle progression systems, emphasizing
**discovery-driven
research**
and
**elemental
mastery**
through
the
Firecraft,
Safety,
and
Scales
tech
trees.

## North Star Constraints

### Combat-First Design

- Pre-Rift combat power: **≥70%** Journey research; town/meta **≤30%** (City ≤10%)

- Manual contribution: **~20% ±10%** of damage from abilities pre-Rift

- Performance: 60 fps desktop; ≥40 fps mid-phones; ≤200/400 enemies; ≤600 projectiles/s

### Progression Philosophy

- **Discovery before Power**: All tech nodes hidden until researched

- **Temporary vs Permanent**: Arcana (run-bound) vs Soul Power (meta)

- **Risk/Reward Balance**: Higher Fire Tiers increase both power and hazard

### Offline & Accessibility

- Offline: **8h linear → decaying**; cap 24h; META → 96h; **Rested +50%/15m; 30m cd**

- Persistence: 3 profiles (META → 6); Dexie v1; export/import

- Privacy: no PII beyond dragon name; logs/stats exportable NDJSON

## Lore Canon

### Draconia, Last Bastion

The capital city of the Dragonlands, protected by a magical barrier powered by
**Arcana**..
Refugees from across the realm have gathered here as the last safe haven against the
encroaching
darkness.
The city's **Great Dragon Council** coordinates the defense, enlisting dragons to venture
forth
and
gather
Arcana
to
maintain
the
shield.

### The Dragonlands

A vast realm of diverse **Lands** divided into **Wards** - regions of varying danger and
resources..
Each Land represents a different biome and challenge:

- **Horizon Steppe**: Peaceful inner rim grasslands near Draconia with open skies

- **Ember Reaches**: Volcanic highlands with thermal vents and fire-resistant foes

- **Mistral Peaks**: Mountain ranges with wind-carved valleys and aerial challenges

- **Shadowmere**: Dark wetlands where corruption seeps from hidden portals

### The Human-Wrought Evil

An ancient force unleashed by human hubris that now spills into the Dragonlands through
dimensional
rifts..
This evil corrupts the land and its creatures, creating the **Wind-Taken Nomads**, **Ember
Wraiths**,
and
other
twisted
factions
that
dragons
must
face.

### The Council & Shield

The **Great Dragon Council** maintains Draconia's protective barrier through collected
Arcana..
When dragons return from their journeys, they donate Arcana to the **Shield** - both a
literal
magical
barrier
and
the
institution
that
manages
the
city's
defense.
This creates the fiction for the core loop's "Return to Draconia" mechanic.

### The Origin Flame & Astral Seals

Legends tell of the **First Flame** - a primordial spark that ignited both the stars above
and
dragonfire
below..
When this flame fractured, it scattered **Origin Shards** across the cosmos.
The gods later bound fragments of creation into **Astral Seals** - radiant tokens that
serve
as
the
realm's
premium
currency,
representing
petitions
to
cosmic
forces
rather
than
mere
wealth.

## Inspirations & References

### Primary Inspiration

- **Unnamed Space Idle** (USI): Phased unlocks, powerful automation, unfolding systems, satisfying prestige-like resets

### Secondary References

- **Cookie Clicker**: Evergreen escalators and incremental progression

- **Melvor Idle**: Multi-skill progression and discovery systems

- **Rusty's Retirement**: Ambient idle UX and peaceful progression

### Differentiator

A **shooter-idle** centered on one main dragon with:

- Crisp combat log-as-narration

- Tight temporary **Enchant** economy (DMG/HP)

- Post-chapter city/market meta that remains **subordinate** to combat

- **Discovery-driven research** system that gates all progression

## Design Pillars

### 1. Clarity

- **Deterministic upgrades**: Clear cause-and-effect relationships

- **Readable numbers**: No hidden calculations or unclear mechanics

- **Narrated logs**: Combat log doubles as game narration and flavor text

### 2. Momentum

- **Micro-ramps**: Frequent small wins every few meters of progress

- **Smooth resets**: Return to Draconia feels rewarding, not punishing

- **Discovery cadence**: New research unlocks maintain engagement

### 3. Performance

- **60fps desktop target**: Smooth gameplay on primary platform

- **Mobile optimization**: ≥40fps on mid-range phones

- **Pooling & culling**: Efficient enemy and projectile management

### 4. Respect

- **Strong accessibility baseline**: ARIA, focus management, reduced motion

- **No grind traps**: Progression always feels meaningful

- **Privacy-first**: No PII collection beyond dragon name

## Feature Guardrails

### Research Discovery System

- **Hidden by Default**: Only Ember Potency and Draconic Vitality visible at start

- **Lab Progression**: Research capacity increases with Lab Level (L1→L8+)

- **Material Requirements**: Research costs Soul Power + Synth Materials + Time

- **Coherent Families**: Research titles group logically (Resin Pyrochemistry, etc.)

### Fire Tier System

- **Global Risk States**: Tiers modify breath nature and increase hazard

- **Trigger Requirements**: Specific node combinations unlock each tier

- **Hazard Scaling**: 1.00 (Regular) → 1.50 (Void) hazard multipliers

- **Safety Integration**: Higher tiers push players toward Safety investments

### Economic Balance

- **Arcana Growth**: Geometric ×1.12 per level, Tier-Up 15–25× last cost

- **Soul Power**: Permanent currency with ×1.90 growth per rank

- **Synth Materials**: Time-based production with rank inflation loops

- **Premium Currency**: Astral Seals for Rune Gachapon and convenience features

## Acceptance Criteria

- [ ] v2.1 lore paragraphs integrated into appropriate sections

- [ ] Design constraints referenced by all system documents

- [ ] Feature guardrails prevent power creep and maintain combat focus

- [ ] Inspiration sources clearly differentiate from existing games

- [ ] All currencies and progression systems align with north star

## Cross-References

- [Player Experience Overview](02*Player*Experience_Overview.md) - How vision translates to player journey

- [Shooter-Idle Core Loop](03*ShooterIdle*Core_Loop.md) - Core mechanics implementation

- [Economy: Currencies, Items, Market](07*Economy*Currencies*Items*Market.md) - Economic system details

- [Balancing: Math, Curves & Tables](17*Balancing*Math*Curves*Tables.md) - Mathematical implementation
