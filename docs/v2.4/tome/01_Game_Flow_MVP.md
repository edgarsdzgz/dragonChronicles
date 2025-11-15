# Game Flow & Tutorial Sequence - Draconia Chronicles v2.4.0

**Document:** 01_Game_Flow_MVP.md
**Version:** 2.4.0
**Last Updated:** 2025-11-15
**Purpose:** Complete tutorial sequence and MVP game flow specification

---

## Table of Contents

1. [Overview](#overview)
2. [Tutorial Sequence (15 Steps)](#tutorial-sequence-15-steps)
3. [Post-Tutorial Game Flow](#post-tutorial-game-flow)
4. [UI State Management](#ui-state-management)
5. [Narrative Integration](#narrative-integration)
6. [Tutorial Triggers & Gates](#tutorial-triggers--gates)
7. [Player Guidance System](#player-guidance-system)
8. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Tutorial Purpose

The 15-step tutorial introduces players to all core systems in a structured, progressive manner, ensuring no overwhelming information dumps while maintaining engagement through gameplay.

**Duration:** ~30-60 minutes (based on player pace)

**Completion Criteria:**
- All 15 steps completed
- Sirocco defeated (Land 1 world boss)
- Worldstone discovered (optional but recommended)
- All core systems unlocked and demonstrated

### Tutorial Phases

**Phase 1: Basic Loop (Steps 1-4)**
- Journey basics, Arcana collection, first return, Arcana Bank

**Phase 2: Soul Power Introduction (Steps 5-8)**
- Ward 3 Scroll discovery, Soul Power unlock, Aethervault

**Phase 3: Permanent Progression (Steps 9-12)**
- City Council, Librarium, Rune Forge, permanent upgrades

**Phase 4: Advanced Systems (Steps 13-15)**
- Scrolls, Cartography Pages, Mining Guild, Worldstone

---

## Tutorial Sequence (15 Steps)

### Step 1: Cutscene → Journey Begins

**Trigger:** Game start (new save file)

**Narrative:**
- **Opening Cutscene** (30-60 seconds):
  - Draconia city under siege, barrier glowing
  - Elder voiceover: "The Unmaking spreads beyond our barrier... only dragons with Arcana Pendants can survive out there"
  - Camera pans to player dragon receiving pendant
  - Elder: "Your pendant will protect you and gather power from defeated enemies"
  - Assistant: "Be careful... the world beyond is dangerous, but we need your help"
  - Fade to journey start

**UI State:**
- Arcana Bar: Visible, empty, shows max capacity (1000)
- Gold: Visible, zero
- Soul Power: **HIDDEN** (not unlocked yet)
- Return to Draconia Button: **HIDDEN** (gated until Ward 1 completion)
- Inventory: Empty

**Gameplay:**
- Player spawns at start of Ward 1
- Journey scrolling begins automatically (or player-triggered)
- First enemies spawn (2-3 common enemies)
- Tutorial popup: "Defeat enemies to gain Arcana"

**Tutorial Messages:**
- "Use [Movement Controls] to dodge enemy attacks"
- "Use [Attack Button] to defeat enemies"
- "Arcana fills your pendant when enemies are defeated"

**First Enemy Defeat:**
- Arcana gained: 10-20 (visible fill in Arcana Bar)
- Tutorial: "Great! Keep defeating enemies to fill your pendant"

**Enemy Spawning:**
- Continuous spawn throughout Ward 1
- Gradual difficulty increase (more enemies, faster)

**Acceptance Criteria:**
- ✓ Cutscene plays and completes
- ✓ Player can move and attack
- ✓ Enemies spawn and can be defeated
- ✓ Arcana accumulates visibly in Arcana Bar
- ✓ Soul Power UI element is hidden
- ✓ Return button is hidden

---

### Step 2: Ward 1 - First Enemies

**Trigger:** After first enemy defeated (Step 1 complete)

**Tutorial Messages:**
- "Enemies may drop items - collect them for Gold back in Draconia!"
- "Your pendant can hold 1000 Arcana - fill it up!"

**Guaranteed Item Drops:**
| Milestone | Drop | Notification |
|-----------|------|--------------|
| 5 enemies defeated | 1 Silver Coin (10 Gold value) | "Silver Coin obtained! Sell items at Draconia Market" |
| 15 enemies defeated | 1 Nickel Coin (15 Gold value) | "Nickel Coin obtained!" |
| 50 enemies defeated | 1 Silver Bar (50 Gold value) | "Silver Bar obtained!" |

**Progression:**
- Player continues through Ward 1 (duration: 5-10 minutes)
- Arcana Bar gradually fills (~80% full by end of Ward 1)
- Items collected and visible in inventory UI

**Random Drops (Optional):**
- Additional Silver/Nickel items (low %, adds variety)

**Enemy Types:**
- Common enemies: Melee, ranged, flying (introduce variety)

**Acceptance Criteria:**
- ✓ Guaranteed drops trigger at correct milestones
- ✓ Tutorial messages display at appropriate times
- ✓ Inventory UI shows collected items
- ✓ Arcana Bar fills to ~80% by end of Ward 1
- ✓ Player progresses to end of Ward 1

---

### Step 3: Ward 1 Boss Wave

**Trigger:** Player reaches end of Ward 1

**Warning System:**
- UI popup: "⚠️ A strong enemy force is gathering at the end of this ward!"
- Visual effect: Screen shake, red tint, ominous music
- Progression pauses (scrolling continues, but player doesn't auto-advance to Ward 2)
- Optional: 5-second countdown timer

**Boss Wave Spawn:**
- **3 enemies** spawn simultaneously (Ward 1 boss wave)
- Enemy composition: 2 melee, 1 ranged (balanced challenge)
- Stats: 2x health, 1.5x damage compared to common enemies
- Visual distinction: Glowing aura, larger size, special colors

**Combat:**
- Player must defeat all 3 boss wave enemies
- Tutorial: "Focus fire on one enemy at a time!"
- Tutorial: "Use [Ability] to deal area damage!" (if abilities unlocked)

**Defeat All Enemies:**
- Victory animation (screen flash, victory sound)
- **Arcana Bar fills to 100% capacity** (1000/1000)
- Guaranteed item drop: 1 Nickel Ingot (75 Gold value)
- Tutorial popup: "Your pendant is FULL! Return to Draconia to deposit Arcana."

**UI Change (MAJOR):**
- **Return to Draconia button REVEALED** (glowing, pulsing animation)
- Tutorial: "Click [Return to Draconia] to return to safety"
- Arrow points to button (optional)

**Ward 1 Checkpoint:**
- Fast travel checkpoint created: "Ward 1" (for future use)

**Acceptance Criteria:**
- ✓ Warning system triggers at correct location
- ✓ 3 boss wave enemies spawn simultaneously
- ✓ Progression pauses until boss wave defeated
- ✓ Arcana Bar fills to 100% on victory
- ✓ Nickel Ingot drops
- ✓ Return to Draconia button appears and is functional
- ✓ Tutorial messages guide player to return

---

### Step 4: First Return to Draconia

**Trigger:** Player clicks Return to Draconia button

**Transition:**
- Loading screen or transition animation (journey → Draconia)
- Music change: Combat → Peaceful city theme

**Arrival in Draconia:**
- Player spawns in central plaza
- NPC (Guard or Elder) approaches automatically

**25% Tax Introduction (CRITICAL):**
- **NPC Dialogue:**
  - Guard: "Welcome back! The barrier requires 25% of your Arcana to maintain protection."
  - Math displayed on screen:
    ```
    Arcana Gained: 1000
    Barrier Tax (25%): -250
    Remaining Arcana: 750
    ```
  - Guard: "This tax is required EVERY time you return to Draconia."
  - Guard: "It keeps the barrier powered and protects the city."

**Arcana Deducted:**
- 1000 → 750 Arcana (250 taken, visible animation)
- Tutorial: "Your remaining Arcana can be spent or deposited"

**Food Shortage Lore:**
- **Elder Dialogue:**
  - Elder: "We have a food shortage... dragons are eating gold as a last resort."
  - Elder: "If you find Silver or Nickel items, they're more nutritious and valuable."
  - Elder: "You can sell these items for Gold at the Market."

**Market Introduction (Optional Path):**
- Tutorial: "Visit the Market to sell your items for Gold"
- If player goes to Market:
  - Market UI: Shows inventory items (Silver Coin, Nickel Coin, Silver Bar, Nickel Ingot)
  - Sell prices: 10, 15, 50, 75 Gold respectively
  - Player sells items → Gains 150 Gold total
  - Tutorial: "Gold is used to fund City Council projects"

**Acceptance Criteria:**
- ✓ Transition from journey to Draconia works
- ✓ 25% tax deducted automatically (1000 → 750)
- ✓ Tax dialogue explains mechanic clearly
- ✓ Food shortage lore delivered
- ✓ Market accessible and functional
- ✓ Items can be sold for Gold
- ✓ Gold total updates correctly

---

### Step 5: Arcana Bank Introduction (Guided)

**Trigger:** After 25% tax dialogue (Step 4)

**Guidance:**
- Tutorial popup: "Visit the Arcana Bank to deposit your Arcana"
- Assistant appears: "Depositing Arcana helps power the barrier and rewards your contribution!"
- Arrow points to Arcana Bank building (optional)

**Arcana Bank UI:**
- **Current Capacity:** 1000 Arcana (base)
- **Current Arcana:** 750 (after tax)
- **Total Deposited:** 0 (cumulative tracker)
- **Next Threshold:** 5,000 Arcana → +25% capacity (1000 → 1250)

**Deposit Slider:**
- Player chooses amount to deposit (e.g., 500 Arcana, keep 250 for other uses)
- Tutorial: "Depositing Arcana increases your pendant's max capacity at certain thresholds"

**First Deposit:**
- Player deposits 500 Arcana
- **Total Deposited:** 500 (cumulative, tracked permanently)
- **Remaining Arcana:** 250
- Tutorial: "You'll reach the next capacity upgrade at 5,000 total Arcana deposited!"

**Reward Animation (Future):**
- "The soul of Draconia recognizes your contribution"
- (If threshold reached: "Spark of First Flame" animation → capacity increases)

**Deposit Progress UI:**
- Progress bar: 500 / 5,000 (10% toward next upgrade)

**Tutorial Summary:**
- Tutorial: "You've learned the basic loop: Journey → Gain Arcana → Return (25% tax) → Deposit → Increase Capacity"
- Tutorial: "Continue your journey to gain more Arcana and unlock new systems!"

**Acceptance Criteria:**
- ✓ Arcana Bank UI displays correctly
- ✓ Deposit slider functional
- ✓ Deposit updates total deposited (cumulative)
- ✓ Progress toward next threshold shown
- ✓ Remaining Arcana updates correctly
- ✓ Tutorial messages guide player through process

---

### Step 6: Ward 2-3 Journey

**Trigger:** Player returns to journey (clicks Journey/Embark button)

**Gameplay:**
- Player continues through Ward 2 and Ward 3
- Enemy spawning continues (increasing difficulty)
- Arcana accumulates again (toward max capacity 1000)
- Items drop randomly (Silver/Nickel items for Gold)

**Small Scroll Drop Chance (Foreshadowing):**
- Very low % chance for Scroll drop (~0.5% per enemy)
- If player finds Scroll: Tutorial hint about Ward 3 boss special drop
- Most players won't find Scroll here (guaranteed at Ward 3 boss)

**Boss Waves:**
- **Ward 2 Boss Wave:** 4 enemies (increased from Ward 1's 3)
- **Completion:** Arcana gain, checkpoint created

**Progression:**
- Duration: 10-15 minutes for Wards 2-3
- By end of Ward 3, Arcana ~80-90% full

**Optional Return:**
- Player can return to Draconia any time after Ward 1 (Return button available)
- If player returns: 25% tax applies, can deposit more Arcana
- Tutorial: Reminds player of Ward 3 boss objective

**Acceptance Criteria:**
- ✓ Ward 2 and Ward 3 traversable
- ✓ Boss waves at end of each ward (4 enemies)
- ✓ Arcana accumulates toward max capacity
- ✓ Items drop randomly
- ✓ Optional return to Draconia functional (25% tax applies)
- ✓ Player progresses to Ward 3 boss wave

---

### Step 7: Ward 3 Boss Wave - FIRST SCROLL

**Trigger:** Player reaches end of Ward 3

**Boss Wave:**
- **5 enemies** spawn (Ward 3 boss wave, increased difficulty)
- Enemy composition: 3 melee, 2 ranged
- Combat duration: ~30-60 seconds

**Defeat All Enemies:**
- Victory animation

**SPECIAL DROP (ONE-TIME ONLY):**
- **FIRST SCROLL** appears (glowing, golden light, special sound effect)
- Scroll name: "Soul Power Scroll" (or lore-appropriate name)
- Animation: Scroll floats down, player automatically collects it
- Tutorial popup: "You've found an ancient Scroll! This is significant..."
- Lore hint: "This Scroll contains forbidden knowledge..."

**Arcana Fills to Max:**
- Arcana Bar: 100% capacity (1000/1000)

**Additional Rewards:**
- 2 Nickel Ingots (150 Gold value total)

**Tutorial Guidance (STRONG):**
- Tutorial: "Return to Draconia IMMEDIATELY to decipher this Scroll at the Aethervault!"
- Return button: Pulsing/glowing animation (draw attention)
- Optional: Cannot progress to Ward 4 until Scroll deciphered (soft gate)

**Scroll Item UI:**
- Special inventory slot: "Quest Items" or "Scrolls"
- Scroll icon: Unique appearance, "First Scroll" tooltip

**Acceptance Criteria:**
- ✓ Ward 3 boss wave: 5 enemies spawn
- ✓ First Scroll drops with special animation (100% guaranteed, one-time)
- ✓ Arcana fills to max capacity
- ✓ Additional items drop (Nickel Ingots)
- ✓ Tutorial messages emphasize returning to Draconia
- ✓ Scroll visible in quest item inventory
- ✓ Return button pulsing/glowing

---

### Step 8: Second Return - Aethervault Introduction

**Trigger:** Player returns to Draconia with First Scroll

**25% Tax (Again):**
- 1000 Arcana → 250 tax → 750 remaining
- Player now familiar with this mechanic (less tutorial needed)

**Automatic Guidance:**
- Tutorial: "The Scroll must be taken to the Aethervault"
- NPC (Elder) approaches: "I've heard of these ancient Scrolls... let me research it"
- Arrow points to Aethervault location (if unlocked) OR City Council (if not)

**City Council Prerequisite Check:**
- If Aethervault NOT unlocked:
  - Tutorial: "The Aethervault requires City Council funding"
  - Player directed to City Council building
  - City Council UI shows: "Aethervault - 500 Gold"
  - If player has <500 Gold:
    - Tutorial: "Sell your items at the Market for Gold"
    - Player sells Nickel Ingots (2x 75 = 150 Gold total)
    - Previous Gold from Step 4: 150 Gold
    - Total Gold: 300 Gold (still need 200 more)
    - **Soft Gate:** Player must return to journey for more items OR wait for future drops
    - Alternative: Adjust guaranteed drops to ensure 500 Gold by Ward 3
  - Once 500 Gold: Player funds Aethervault → Building unlocked

**Aethervault Cutscene (MAJOR STORY MOMENT):**
- Player enters Aethervault
- **Elder NPC** takes Scroll:
  - Elder: "This is the Soul Power Scroll... forbidden knowledge from ancient times"
  - Elder: "Let me decipher it... I'll use my personal Arcana to speed this up"
  - Animation: Elder channels Arcana into Scroll (glowing effect, 5-10 seconds)
  - Scroll unfurls, runes appear, dramatic music

**Soul Power Revelation:**
- Elder: "I've unlocked the secrets of Soul Power!"
- Elder: "Soul Power is the ability to strengthen yourself permanently using souls from defeated enemies"
- Elder: "This magic was forbidden because it harvests souls..."
- Elder: "But given our circumstances and the abundance of evil, this is justified"
- Elder adds Scroll Rune to player's pendant (animation)
- Tutorial: "Your pendant can now gather Soul Power from defeated enemies!"

**UI Change (MAJOR):**
- **Soul Power display NOW VISIBLE** (was hidden until now)
- Soul Power: 0 (will accumulate from now on)
- Tutorial: "Soul Power never resets - it's permanent across all journeys"

**Knowledge Revelation:**
- Elder: "However, you'll need knowledge to USE this power for permanent upgrades"
- Elder: "The Librarium can research how to craft Soul Power into Runes"
- Tutorial: "Visit the City Council to fund the Librarium project"

**Acceptance Criteria:**
- ✓ Aethervault unlocked (500 Gold spent at City Council)
- ✓ Elder cutscene plays completely
- ✓ Soul Power mechanics explained via dialogue
- ✓ Scroll Rune added to pendant (animation)
- ✓ Soul Power UI element now visible
- ✓ Soul Power set to 0 (accumulation starts)
- ✓ Tutorial directs player to Librarium funding

---

### Step 9: City Council - Fund Librarium

**Trigger:** After Aethervault cutscene (Step 8)

**Guidance:**
- Tutorial: "Visit the City Council to fund the Librarium project"
- Arrow points to City Council building

**City Council UI:**
- **Projects Visible:**
  - ✓ Aethervault (funded) - grayed out, checkmark
  - **Librarium - 1,000 Gold** (highlighted, available)
  - Rune Forge - 1,500 Gold (locked, tooltip: "Requires Librarium research")
  - Mining Guild - 800 Gold (locked, tooltip: "Requires Cartography Page discovery")
  - Fast Travel - 2,000 Gold (locked, tooltip: "Available at Ward 10+")

**Gold Check:**
- Player has 300 Gold (from Ward 3) - 500 Gold (Aethervault) = Need to verify math
- **ISSUE IDENTIFIED:** Player needs 1,000 Gold for Librarium but may not have enough
- **Solution Options:**
  1. Adjust guaranteed drops (more valuable items by Ward 3)
  2. Add Gold reward to First Scroll discovery
  3. Create soft gate: Player must journey to Ward 4-5 for more items

**Proposed Solution:**
- Add 700 Gold reward to First Scroll discovery (story justification: City Council rewards player for major discovery)
- Updated totals: 150 (Ward 1 items) + 150 (Ward 3 items) + 700 (First Scroll reward) = 1,000 Gold exactly

**Funding Librarium:**
- Player clicks "Fund Librarium" button
- Confirmation: "Fund Librarium for 1,000 Gold?"
- Player confirms → 1,000 Gold spent → 0 Gold remaining
- Animation: Building construction (brief, 2-3 seconds)
- Tutorial: "Librarium unlocked! Click the Librarium button to visit"

**UI Change:**
- **Librarium building button** appears in Draconia UI (navigation panel)

**Acceptance Criteria:**
- ✓ City Council UI displays projects correctly
- ✓ Projects show locked/unlocked status with tooltips
- ✓ Librarium fundable with 1,000 Gold
- ✓ Gold balance updates correctly
- ✓ Librarium building button appears after funding
- ✓ Tutorial guides player to visit Librarium

---

### Step 10: Librarium Research

**Trigger:** Player visits Librarium (after funding in Step 9)

**Librarium UI:**
- **Researchers Available:** 1 (base)
- **Research Topics:**
  - "Soul Power Permanent Enchantment" (only topic visible initially)
  - Status: Not started
  - Duration: 5 minutes (IRL time)
  - Cost: Free (research time only)

**Start Research:**
- Player clicks "Research Soul Power Permanent Enchantment"
- Confirmation: "Start research? (5 minutes)"
- Player confirms → Research begins
- Timer UI: "Research in progress: 4:59... 4:58..."
- Animation: Researcher studying books, glowing effects

**Tutorial - Multitasking:**
- Tutorial: "Research takes real time, but you can continue your journey!"
- Tutorial: "Return to collect the results when research completes"
- Optional: Notification system (alert when research complete)

**Player Options:**
1. Wait in Draconia (5 minutes idle - not recommended)
2. Continue journey to Ward 4+ (recommended)
3. Explore Draconia, visit other buildings

**Research Complete (5 Minutes Later):**
- **Notification:** "Research complete! Return to the Librarium."
- **If Player is in Draconia:** Visual/audio cue (glow from Librarium building)
- **If Player is on Journey:** UI notification banner

**Return to Librarium:**
- Researcher: "I've discovered how to infuse Runes with Soul Power!"
- Researcher: "The ancient techniques require a Rune Forge to craft permanent upgrades"
- Tutorial: "Visit the City Council to fund the Rune Forge project"

**Research Completion Rewards:**
- Knowledge unlocked: "Soul Power Permanent Enchantment" (tracked in player state)
- Rune Forge project now unlockable at City Council

**Acceptance Criteria:**
- ✓ Librarium UI displays correctly
- ✓ Research topic visible and startable
- ✓ Timer begins and counts down (5 minutes IRL)
- ✓ Player can leave Librarium and continue journey
- ✓ Notification triggers when research complete
- ✓ Research completion dialogue plays
- ✓ Rune Forge project unlocked at City Council

---

### Step 11: City Council - Fund Rune Forge

**Trigger:** Research complete (Step 10)

**Guidance:**
- Tutorial: "Return to the City Council to fund the Rune Forge"

**Gold Check:**
- Player has 0 Gold (spent all on Librarium)
- **Need 1,500 Gold for Rune Forge**
- **Soft Gate:** Player MUST journey to gain more Gold

**Journey for Gold:**
- Player returns to journey (now at Ward 4+)
- Defeats enemies, collects items (Silver/Nickel)
- By Ward 5-6, player should have enough items to sell for 1,500 Gold

**Time Progression:**
- While journeying, research completes (5 minutes passes naturally)
- Player may need 2-3 returns to accumulate 1,500 Gold
  - Return 1: Sell items, 500 Gold
  - Return 2: Sell items, 500 Gold
  - Return 3: Sell items, 500 Gold → Total 1,500 Gold

**Funding Rune Forge:**
- Player has 1,500 Gold
- City Council: "Fund Rune Forge" button available
- Player funds → 1,500 Gold spent → 0 Gold remaining
- Animation: Forge construction

**UI Change:**
- **Rune Forge building button** appears in Draconia UI

**Acceptance Criteria:**
- ✓ Rune Forge project unlockable (research prerequisite met)
- ✓ Player can accumulate 1,500 Gold through journey returns
- ✓ City Council funding functional
- ✓ Rune Forge building button appears after funding

---

### Step 12: Rune Forge Usage

**Trigger:** Player visits Rune Forge (after funding in Step 11)

**Rune Forge UI:**
- **Available Upgrades:**
  - Fire Potency Tier 1: 500 Soul Power, +10% fire damage
  - Draconic Vitality Tier 1: 500 Soul Power, +15% max health
  - Arcane Resonance Tier 1: 750 Soul Power, +5% Arcana gain
- **Forgers Available:** 1 (base)
- **Forge Usage:** 0/10 (maintenance due at 10 uses, costs 50 Gold)

**Soul Power Check:**
- Player has accumulated Soul Power from enemies defeated post-Ward 3
- Example: 100 enemies defeated x 5 SP each = 500 Soul Power
- Enough for one Tier 1 upgrade

**If Not Enough Soul Power:**
- Tutorial: "Continue your journey to gain more Soul Power"
- Player journeys more, accumulates SP, returns

**Craft Upgrade:**
- Player selects "Fire Potency Tier 1"
- UI shows: Cost 500 SP, Duration 3 minutes, Effect +10% fire damage
- Player confirms → 500 SP spent → 0 SP remaining
- **Crafting begins:** Timer: "Crafting: 2:59... 2:58..."
- Animation: Forge glowing, hammer sounds, rune forming

**Tutorial - Multitasking:**
- Tutorial: "Rune crafting takes real time. Continue your journey and return to collect!"

**Player Journeys:**
- Continue to Ward 6-7 while rune crafts

**Crafting Complete (3 Minutes Later):**
- **Notification:** "Rune forged! Collect it at the Rune Forge."

**Collect Rune:**
- Player returns to Rune Forge
- UI: "Fire Potency Tier 1 ready! Click to collect."
- Player clicks → Rune collected
- Animation: Rune absorbed into pendant, stat increase visual
- Tutorial: "Fire Potency Tier 1 applied! +10% fire damage (permanent)"

**Stat Update:**
- Player stats updated: Fire damage +10% (visible in character sheet)
- Permanent: Never resets across journeys

**Forge Usage:**
- UI updates: "Forge usage: 1/10"
- Tutorial: "The forge requires 50 Gold maintenance every 10 uses"

**Tutorial Summary:**
- Tutorial: "You've mastered permanent progression!"
- Tutorial: "Gain Soul Power → Craft Runes → Permanent upgrades → Become stronger!"

**Acceptance Criteria:**
- ✓ Rune Forge UI displays available upgrades
- ✓ Soul Power cost deducted correctly
- ✓ Crafting timer functional (3 minutes IRL)
- ✓ Player can leave and return during crafting
- ✓ Notification triggers when crafting complete
- ✓ Rune collectible and stat increase applied
- ✓ Forge usage counter updates
- ✓ Permanent stat tracked in player state

---

### Step 13: Ongoing Systems - Scrolls

**Trigger:** Post-Rune Forge (Step 12 complete)

**Assistant Passive Research:**
- Assistant appears (cutscene or dialogue popup)
- Assistant: "I've been researching Scroll locations while you were journeying"
- Assistant: "Scrolls have a small chance to drop from any enemy (~0.5%)"
- Assistant: "I've found guaranteed Scroll locations: Ward 2 and Ward 5"

**Scroll Drop Rates (Shown to Player):**
- Common enemies: 0.5% chance
- Boss wave enemies: 5% chance
- Guaranteed locations: Ward 2 (specific chest/enemy), Ward 5 (specific chest/enemy)

**If Player Finds Scroll (Random Drop):**
- Scroll obtained (non-first scroll)
- Tutorial: "Take this Scroll to the Aethervault for decryption"

**Aethervault Revisit:**
- Elder: "Another Scroll! I'll need Scroll Researchers to decipher these efficiently"
- Tutorial: "Hire Scroll Researchers to decipher Scrolls"

**Scroll Researcher System:**
- **Aethervault UI:**
  - Researchers available: 0 (must hire)
  - Hire cost: 200 Gold per researcher (funds 5 Scrolls)
- Player hires researcher → 200 Gold spent
- Researcher available: 1 (can decipher 5 Scrolls before needing new funding)

**Scroll Decryption:**
- Player submits Scroll for decryption
- Decryption time: 2-5 minutes (IRL time, depends on Scroll)
- Queue: One Scroll at a time per researcher
- Player can hire multiple researchers for parallel decryption

**Decryption Complete:**
- Notification: "Scroll decrypted! Return to Aethervault."
- Reward: Research topic unlocked, lore entry, or ability unlocked (depends on Scroll content)

**Future Scrolls:**
- Player continues finding Scrolls throughout journey
- Ward 2, Ward 5 guaranteed Scrolls provide important unlocks
- Tutorial: "Scrolls unlock new research, abilities, and lore"

**Acceptance Criteria:**
- ✓ Assistant dialogue triggers post-Rune Forge
- ✓ Scroll drop rates communicated clearly
- ✓ Random Scroll drops functional (0.5% per enemy)
- ✓ Guaranteed Scroll locations at Ward 2, Ward 5
- ✓ Scroll Researcher hiring functional (200 Gold)
- ✓ Decryption queue and timer functional
- ✓ Decryption rewards (research, lore, abilities) granted correctly

---

### Step 14: Ongoing Systems - Cartography Pages & Mining Guild

**Trigger:** Post-Scroll system introduction (Step 13)

**First Cartography Page Discovery:**
- Player defeats enemy (rare drop, ~0.1% chance)
- Cartography Page obtained: "Cartography Page (Horizon Steppe)"
- Tutorial: "This map fragment might reveal hidden locations"
- Notification: "Collect more pages to reveal mine locations"

**City Council - Mining Guild:**
- Tutorial: "Visit the City Council to fund the Mining Guild"
- City Council UI: "Mining Guild - 800 Gold"
- Player funds → Mining Guild unlocked

**Visit Mining Guild:**
- **Cartographer NPC:**
  - Cartographer: "Cartography Pages reveal mine locations!"
  - Cartographer: "Collect 3 pages of the same land to reveal a mine"
  - Cartographer: "I'll track your progress"

**Cartography Page Progress UI:**
- "Horizon Steppe: 1/3 pages collected"

**Collect More Pages:**
- Player journeys, defeats enemies
- Find Page 2: "Horizon Steppe: 2/3 pages"
- Find Page 3: "Horizon Steppe: 3/3 pages - Mine location revealed!"

**Mine Location Revealed:**
- **Cartographer:** "I've found the mine! It's at Ward 11C - an alternate path"
- Tutorial: "Travel to Ward 11 and choose the alternate path to the mine"
- Map UI: Ward 11B → Ward 11C path highlighted

**Journey to Mine:**
- Player progresses to Ward 11
- **Branch Point UI:** "Ward 11A (main path)" or "Ward 11B (toward mine)"
- Player chooses Ward 11B → Ward 11C (dead end)

**Mine Guardian Boss:**
- Ward 11C ends with Mine Guardian boss (tough enemy, unique mechanics)
- Tutorial: "Defeat the Mine Guardian to access the mine"
- Combat: Single tough boss (similar to large enemy)

**Defeat Guardian:**
- Victory → Mine entrance accessible

**Clicker Minigame (Gold Mining):**
- **Mine UI:** Click to mine gold (manual, active gameplay)
- Each click: 1-5 Gold gained (randomized)
- Time-limited or resource-limited (TBD: e.g., 60 seconds or 100 clicks max)
- Total Gold gained: 200-500 Gold (significant reward)

**Exit Mine:**
- Tutorial: "You must backtrack through Ward 11C to return to the main path"
- Player travels: Ward 11C → Ward 11B → Ward 12 (main path continues)

**Post-Worldstone Note:**
- Tutorial: "Mining automation will be unlocked after powering the Worldstone"
- Future: Convoys/stewards can mine automatically

**Acceptance Criteria:**
- ✓ Cartography Pages drop at correct rate (~0.1%)
- ✓ Mining Guild funding functional (800 Gold)
- ✓ Cartographer dialogue explains system
- ✓ Page collection progress tracked (X/3)
- ✓ Mine location revealed at 3/3 pages
- ✓ Branch point at Ward 11 functional (11A vs 11B choice)
- ✓ Ward 11B → 11C alternate path traversable
- ✓ Mine Guardian boss fight functional
- ✓ Clicker minigame functional (gold gain)
- ✓ Backtracking through 11C → 11B works
- ✓ Player rejoins main path at Ward 12

---

### Step 15: Land 1 Progress - Sirocco & Worldstone

**Trigger:** Player progresses through wards toward end of Land 1

**Journey Through Land 1:**
- Player continues through Ward 12, 13, 14, ... (total wards TBD)
- Boss waves every ward (increasing difficulty)
- Large enemies every 10 wards (Ward 10, Ward 20, etc.)
- Branching paths demonstrated (multiple Ward##A, Ward##B choices)
- Fast Travel system unlocked (City Council project, 2,000 Gold)

**Fast Travel Introduction (Optional):**
- City Council: "Fast Travel - 2,000 Gold" (unlockable at Ward 10+)
- Player funds → Fast Travel UI available
- **Fast Travel UI:**
  - Checkpoints: List of completed wards (Ward 1, Ward 2, ..., Ward 10, etc.)
  - Cost per use: 20 Arcana (Tier 1)
  - Restrictions: Can't skip undefeated bosses, can't skip first visits
- Tutorial: "Fast travel reduces backtracking - use it to return to alternate paths or mines"

**Final Ward - Sirocco Encounter:**
- Player reaches final ward of Land 1 (e.g., Ward 25 or Ward 30, TBD)
- **Epic Warning:**
  - UI: "⚠️ THE KHAGAN OF THE SIROCCO BLOCKS YOUR PATH"
  - Dramatic cutscene: Sirocco appears (dragon-like boss, wind effects, menacing)
  - Elder voiceover: "This is Sirocco, corrupted by the Unmaking... defeat him to reach the Worldstone"

**Sirocco Boss Fight:**
- **ONE TIME ONLY** encounter (permanent defeat, never respawns)
- **Boss Mechanics:**
  - Phase 1: Ground attacks, wind slashes
  - Phase 2: Aerial attacks, summon wind spirits (adds)
  - Phase 3: Enrage, powerful area attacks, storm effects
- Duration: 3-5 minutes (challenging but achievable)
- Tutorial: "Use all your abilities and permanent upgrades to survive!"

**Defeat Sirocco:**
- **Victory Animation:** Epic slow-motion finale, Sirocco defeated
- **Lore Revelation:**
  - Elder: "You've defeated Sirocco! The path to the Worldstone is now open."
  - Elder: "Worldstones are ancient devices that protect against the Unmaking"
  - Elder: "Powering them with Arcana creates protection layers for entire lands"

**Worldstone Path Unlocked:**
- Alternate path revealed: "Ward N+1A - Path to Worldstone"
- Tutorial: "Explore the Worldstone path (optional) or continue to Land 2"

**Sirocco Rewards:**
- 10,000 Soul Power (massive boost)
- Unique item: "Sirocco's Crest" (cosmetic or stat boost)
- Land 1 completion milestone

**Discover Worldstone (Optional):**
- Player chooses alternate path (Ward N+1A)
- Short path (dead end): Worldstone at end
- **Worldstone:**
  - Ancient stone pillar, inert, glowing faintly
  - Elder: "This is a Worldstone! Power it with Arcana to activate protection"

**Power Worldstone (Optional):**
- Worldstone UI: "Deposit Arcana to power Worldstone"
- Cost: 50,000 Arcana (significant, requires multiple journeys or later in game)
- If player has enough: Deposit → Worldstone powered
- **Effect:**
  - Protection layer activated: Non-pendant wearers can now safely explore Horizon Steppe
  - Mining automation unlocked: Convoys can mine gold passively
  - Visual: Worldstone glowing, light spreads across land

**Land 1 Complete:**
- **Tutorial:** "Congratulations! You've completed the introduction to Draconia Chronicles!"
- **Summary:**
  - ✓ Sirocco defeated (permanent)
  - ✓ Worldstone discovered (optional)
  - ✓ All core systems unlocked and demonstrated
- **Tutorial:** "Continue to Land 2 to face new challenges and expand your power!"

**MVP/Demo Complete:**
- Player has experienced full game loop
- All systems functional and understood
- First story beat complete
- ~30-60 minutes of gameplay (depending on player pace)

**Acceptance Criteria:**
- ✓ Fast Travel system functional (if unlocked)
- ✓ Sirocco boss fight triggers at final ward
- ✓ Sirocco encounter ONE TIME ONLY (never respawns)
- ✓ Boss fight phases functional
- ✓ Victory cutscene plays
- ✓ Worldstone path unlocked after victory
- ✓ Worldstone discoverable (alternate path)
- ✓ Worldstone powering functional (50,000 Arcana)
- ✓ Worldstone effects applied (protection layer, automation)
- ✓ Land 1 completion tracked in permanent state
- ✓ Tutorial completion message displayed

---

## Post-Tutorial Game Flow

### After Tutorial Completion

**Player Progression Options:**
1. **Continue to Land 2** (future content, out of MVP scope)
2. **Return to Horizon Steppe** (explore missed alternate paths, mines)
3. **Power Worldstone** (if not yet done, requires 50,000 Arcana)
4. **Grind for Upgrades** (continue crafting permanent upgrades)
5. **Discover All Scrolls** (Ward 2, Ward 5, random drops)

**Repeatable Activities:**
- New journeys (all ward bosses respawn, Sirocco does NOT)
- Rune Forge crafting (unlimited permanent upgrades)
- Arcana Bank deposits (increase max capacity)
- Mine visits (gold farming via clicker minigame)
- Scroll hunting (research, lore, abilities)

**Non-Repeatable Content:**
- Sirocco boss fight (ONE TIME ONLY, permanent defeat)
- First Scroll (Ward 3, one-time drop)
- Building unlocks (one-time Gold costs)

---

## UI State Management

### UI Element Visibility Gates

| UI Element | Hidden Until | Revealed When |
|------------|--------------|---------------|
| Soul Power Display | Ward 3 Scroll | Aethervault decryption complete |
| Return to Draconia Button | Ward 1 boss wave | Ward 1 boss wave defeated |
| Arcana Bank Button | Tutorial Step 4 | First return to Draconia |
| Aethervault Button | City Council funding | 500 Gold spent at City Council |
| Librarium Button | City Council funding | 1,000 Gold spent at City Council |
| Rune Forge Button | City Council funding | 1,500 Gold spent at City Council |
| Mining Guild Button | City Council funding | 800 Gold spent at City Council |
| Fast Travel Button | City Council funding | 2,000 Gold spent (Ward 10+) |

### Tutorial Popup System

**Popup Triggers:**
- Event-based: Enemy defeated, boss wave complete, Scroll obtained
- Location-based: Enter Arcana Bank, enter Aethervault, approach City Council
- UI-based: Return button revealed, Soul Power display shown

**Popup Dismissal:**
- Click "OK" or "Understood" button
- Auto-dismiss after 10 seconds (optional)
- Don't show again: Checkbox for repeated tutorials

**Popup Priority:**
- Critical: 25% tax explanation, Soul Power unlock, Sirocco encounter
- High: Return button reveal, Arcana Bank introduction, building unlocks
- Medium: Item drops, Scroll hints, fast travel
- Low: Repeated advice, combat tips

---

## Narrative Integration

### Key Story Beats

1. **Opening Cutscene** (Step 1): Draconia under siege, pendant received
2. **First Return** (Step 4): Barrier tax, food shortage lore
3. **Soul Power Unlock** (Step 8): Forbidden magic revelation, justification
4. **Librarium Research** (Step 10): Ancient knowledge rediscovered
5. **Rune Forge Crafting** (Step 12): Permanent strength achieved
6. **Sirocco Defeat** (Step 15): First major victory against Unmaking
7. **Worldstone Discovery** (Step 15): Hope for saving the world

### NPC Roles

**Elder:**
- Lore exposition (Unmaking, Soul Power, Worldstones)
- Deciphers First Scroll (Ward 3)
- Ongoing research (passive, hints at future content)

**Assistant:**
- Player guidance (tutorial messages, quest tracking)
- Passive research (Scroll locations, Ward 2/5 hints)
- Emotional support (encouragement, warnings)

**Guard/City Official:**
- Barrier tax explanation (first return)
- City Council interface (building funding)

**Cartographer:**
- Mining Guild NPC (Cartography Pages, mine locations)

**Researchers (Aethervault, Librarium):**
- Functional NPCs (Scroll decryption, Soul Power research)
- Minimal dialogue (focus on mechanics)

---

## Tutorial Triggers & Gates

### Hard Gates (Must Complete Before Progressing)

1. **Ward 1 Boss Wave**: Must defeat to reveal Return button
2. **First Return**: Must experience 25% tax and Arcana Bank tutorial
3. **Ward 3 Scroll**: Must obtain First Scroll (100% guaranteed drop)
4. **Soul Power Unlock**: Must decipher First Scroll at Aethervault
5. **Sirocco Defeat**: Must defeat to unlock Worldstone path (one-time)

### Soft Gates (Can Progress Without, But Difficulty Increases)

1. **Librarium Funding**: Recommended but not required for Ward 4+
2. **Rune Forge Crafting**: Highly recommended for Ward 10+
3. **Fast Travel Unlock**: Quality of life, not required
4. **Mining Guild**: Optional gold source
5. **Worldstone Powering**: Optional endgame milestone

### Optional Content

1. **Mine Discovery**: Cartography Pages, clicker minigame
2. **Additional Scrolls**: Ward 2, Ward 5, random drops
3. **Branching Paths**: Exploration, alternate routes
4. **Worldstone Powering**: Major Arcana investment

---

## Player Guidance System

### Tutorial Message Types

1. **Action Prompts**: "Click [Button] to [Action]"
2. **Explanations**: "This system works like this..."
3. **Lore**: "The world is in danger because..."
4. **Warnings**: "Tough challenge ahead!"
5. **Congratulations**: "You've completed [Milestone]!"

### Guidance Intensity Levels

**High Guidance (Steps 1-4):**
- Frequent popups
- Arrows pointing to buttons
- Strong tutorial messages
- Cannot miss key mechanics

**Medium Guidance (Steps 5-12):**
- Popups for new systems only
- Less hand-holding
- Player can explore more freely

**Low Guidance (Steps 13-15):**
- Minimal popups
- Player expected to understand systems
- Optional content not heavily tutorialized

### Accessibility Options

- **Tutorial Verbosity**: Low/Medium/High
- **Skip Cutscenes**: Yes/No (respect player time)
- **Tutorial Replay**: Revisit tutorial messages in menu

---

## Implementation Checklist

### Phase 1: Basic Loop (Steps 1-4)

- [ ] Opening cutscene system (video or in-engine)
- [ ] Journey system (ward traversal, enemy spawning)
- [ ] Arcana accumulation and UI
- [ ] Boss wave system (3 enemies, Ward 1)
- [ ] Return to Draconia button (reveal on Ward 1 boss defeat)
- [ ] 25% tax system (automatic deduction)
- [ ] Arcana Bank UI and deposit mechanic
- [ ] Market UI (sell items for Gold)
- [ ] Tutorial popup system (event-driven)

### Phase 2: Soul Power (Steps 5-8)

- [ ] Ward 2-3 traversal and boss waves
- [ ] First Scroll drop (Ward 3 boss, 100% guaranteed, one-time)
- [ ] City Council UI (project list, funding)
- [ ] Aethervault unlock (500 Gold)
- [ ] Elder cutscene (Soul Power revelation)
- [ ] Soul Power UI element (visibility gate)
- [ ] Soul Power accumulation system

### Phase 3: Permanent Progression (Steps 9-12)

- [ ] Librarium unlock (1,000 Gold)
- [ ] Research system (timer, queue, notifications)
- [ ] Rune Forge unlock (1,500 Gold)
- [ ] Rune crafting system (timer, Soul Power cost, stat application)
- [ ] Permanent upgrade tracking (cross-journey)
- [ ] Forge maintenance system (50 Gold every 10 uses)

### Phase 4: Advanced Systems (Steps 13-15)

- [ ] Scroll drop system (0.5% random, guaranteed Ward 2/5)
- [ ] Scroll Researcher hiring (200 Gold per researcher)
- [ ] Scroll decryption queue and timer
- [ ] Cartography Page drops (0.1% rare)
- [ ] Mining Guild unlock (800 Gold)
- [ ] Cartography progress tracking (X/3 pages)
- [ ] Branching path system (Ward##A, Ward##B navigation)
- [ ] Mine alternate path (Ward 11B → 11C)
- [ ] Mine Guardian boss fight
- [ ] Clicker minigame (gold mining)
- [ ] Fast Travel system (2,000 Gold unlock, checkpoint navigation)
- [ ] Sirocco boss fight (phases, one-time encounter)
- [ ] Worldstone discovery (alternate path)
- [ ] Worldstone powering (50,000 Arcana deposit)
- [ ] Land 1 completion tracking

### State Persistence

- [ ] Journey state (boss defeats, path history, current ward)
- [ ] Permanent state (world bosses, buildings, upgrades, Worldstone)
- [ ] Save/load system (auto-save on major events)
- [ ] Migration from v2.3 (if applicable)

### Polish

- [ ] All tutorial messages written and localized
- [ ] All NPC dialogues written and recorded (if voice acting)
- [ ] Tutorial popup timing and pacing tuned
- [ ] Hard gates tested (cannot bypass critical steps)
- [ ] Soft gates tested (can progress without, but harder)
- [ ] Tutorial skip option (for speedruns/replays)
- [ ] Accessibility options (tutorial verbosity, etc.)

---

## Cross-References

- Core GDD: [GDD_v2.4.0.md](../GDD_v2.4.0.md)
- Economy System: [02_Economy_System.md](./02_Economy_System.md)
- Progression System: [03_Progression_System.md](./03_Progression_System.md)
- Building System: [04_Building_System.md](./04_Building_System.md)
- Combat System: [05_Combat_System.md](./05_Combat_System.md)
- Path Navigation: [06_Path_Navigation_System.md](./06_Path_Navigation_System.md)
- State Persistence: [07_State_Persistence.md](./07_State_Persistence.md)

---

*This document provides complete implementation specifications for the v2.4.0 tutorial sequence and MVP game flow.*
