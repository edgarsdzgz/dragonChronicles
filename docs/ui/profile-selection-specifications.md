# Profile Selection UI Specifications

**Version**: 1.0
**Date**: 2025-01-XX
**Status**: Official Reference Implementation

This document defines the **ultimate correct version** of the profile selection UI. All measurements, behaviors, colors, and design decisions are documented here as the single source of truth.

---

## Overview

The profile selection system presents 3 save slots in a Zelda: Ocarina of Time-inspired style, with:
- **Nameplate shapes** with magical gems for visual interest
- **Dynamic attachments** that extend based on selection state
- **Clear data hierarchy** showing dragon name, location, playtime, and last played
- **Consistent visual states** (empty, normal, hovered, selected)

---

## Layout & Positioning

### Screen Layout
- **Container**: Full screen overlay on top of background
- **Background**: Semi-transparent dark overlay (alpha 0.95) with rounded corners (15px radius)
- **Title**: "Select Your Adventure" at top center
- **Slots**: 3 vertically stacked slots, centered horizontally
- **Buttons**: Copy, Erase, Options buttons at bottom center

### Slot Positioning
```typescript
// Core measurements (unscaled, 1920x1080 reference)
const NAMEPLATE_WIDTH = 500;   // Main nameplate width
const NAMEPLATE_HEIGHT = 80;    // Main nameplate height
const SLOT_GAP = 30;            // Vertical spacing between slots
const START_Y = 150;            // First slot Y position

// Centering Strategy
// Slots are centered on the GEMS (not on nameplate)
// Gem midpoint calculation:
//   - Nameplate gem at x=480 (right edge of nameplate cutout)
//   - Attachment gem at x=534 (250 + 259 + 25)
//   - Midpoint: (480 + 534) / 2 = 507
const GEM_MIDPOINT = 507;
slotContainer.x = centerX - gemMidpoint * scale;
slotContainer.y = startY + slotIndex * (nameplateHeight + slotGap);
```

### Slot Components
Each slot consists of:
1. **Nameplate** (500x80px)
2. **Nameplate Gem** (24px diameter, positioned in cutout at x=480)
3. **Attachment** (700x80px, 37% cutout) - if slot has data
4. **Attachment Gem** (24px diameter, positioned at x=534) - if slot has data
5. **Decorative Corner** (15px radius concave) - if slot has data
6. **Selection Arrow** (left side, shown on hover)
7. **Text Elements** (dragon name, location, playtime, last played)

---

## Nameplate Design

### Shape Specifications
```typescript
// Nameplate: 500x80px with cutout on right side
interface NameplateShape {
  width: 500;
  height: 80;
  cutoutSide: 'right';        // Cutout on right edge
  cutoutDepth: 30;            // 30px deep cutout
  cutoutWidth: 40;            // 40px tall cutout
  cornerRadius: 8;            // 8px rounded corners
  borderWidth: 2;             // 2px border
}

// Position measurements
const NAMEPLATE_X = 0;         // Relative to slot container
const NAMEPLATE_Y = 0;         // Relative to slot container
const NAMEPLATE_GEM_X = 480;   // In cutout area
const NAMEPLATE_GEM_Y = 20;    // Vertically centered (half of 80px - 20px from gem radius)
```

### Color States
```typescript
// Nameplate tinting based on state
const NAMEPLATE_COLORS = {
  empty: 0x555555,           // Dark grey for empty slots
  normal: 0xCCCCCC,          // Light grey for filled slots (alpha 0.9)
  hovered: 0xFFFFFF,         // Full white when hovered (alpha 1.0)
  selected: 0xFFFFFF,        // Full white when selected (alpha 1.0)
};

// All attachments and decorative corners ALWAYS match the nameplate tint
```

---

## Attachment System

### Attachment Types

**1. Simple Attachment** (Non-Selected Filled Slots)
```typescript
interface SimpleAttachment {
  width: 700;              // 40% wider than nameplate
  height: 80;              // Same height as nameplate
  cutPercentage: 0.37;     // 37% cutout (259px)
  position: {
    x: 250;                // Starts where nameplate cutout begins
    y: 0;                  // Aligned with nameplate
  };
  gem: {
    x: 534;                // 250 + 259 + 25 (in visible solid area)
    y: 20;                 // Vertically centered
    diameter: 24;          // Same as nameplate gem
    lit: true;             // Always lit for filled slots
  };
  decorativeCorner: {
    radius: 15;            // Concave corner radius
    x: 509;                // 250 + 259 (at cut edge)
    y: 0;
    flipX: true;           // Horizontally flipped
  };
}
```

**2. Extended Attachment** (Selected Filled Slot)
```typescript
interface ExtendedAttachment {
  width: 700;              // Same as simple attachment
  height: 80;
  cutPercentage: 0.37;
  position: { x: 250, y: 0 };
  gem: { x: 534, y: 20, diameter: 24, lit: true };
  decorativeCorner: { radius: 15, x: 509, y: 0, flipX: true };
  // Extended attachment has more detailed visual styling
  // but same dimensions as simple attachment
}
```

**3. No Attachment** (Empty Slots)
- No attachment shape
- No attachment gem
- No decorative corner

### Attachment Color Behavior
```typescript
// CRITICAL: Attachment and decorative corner ALWAYS match nameplate tint
// This ensures visual consistency across all states

// When nameplate changes color:
nameplate.tint = newTint;
attachment.tint = newTint;         // ALWAYS matches
decorativeCorner.tint = newTint;   // ALWAYS matches

// States:
// - Normal: 0xCCCCCC (alpha 0.9)
// - Hovered: 0xFFFFFF (alpha 1.0)
// - Selected: 0xFFFFFF (alpha 1.0)
```

---

## Text Elements

### Dragon Name (FILE Text)
```typescript
interface DragonNameText {
  // Label changes based on state:
  // - Empty slot: "FILE 1" / "FILE 2" / "FILE 3"
  // - Filled slot: Dragon name (e.g., "Ignis")

  font: 'Cinzel';           // Primary font
  fontSize: 32;             // Larger, prominent
  color: 0xFFFFFF;          // White
  anchor: { x: 0, y: 0 };   // LEFT-ALIGNED, top anchor
  position: {
    x: 20;                  // 20px left margin
    y: 15;                  // 15px from top (vertically centered in nameplate)
  };
  maxLength: 15;            // Character limit
}
```

### Location Text (Land/Ward on Simple Attachment)
```typescript
interface LocationText {
  // Format: "Land 1 Horizon Steppe • Ward 1 The Parting Stones"
  font: 'Cinzel';
  fontSize: 20;             // Increased from 18 for better visibility
  color: 0xFFFFFF;
  anchor: { x: 0, y: 0.5 }; // LEFT-ALIGNED, vertically centered
  position: {
    x: 564;                 // 250 + 259 + 25 + 30 (30px spacing from gem)
    y: 20;                  // Same as gem Y (vertically centered on gem)
  };
  dataSource: '@draconia/shared/world-data';  // Single source of truth
  visibility: 'simple attachment only';       // Only shown on simple attachment
}
```

### Ward/Playtime Text (Extended Attachment)
```typescript
interface WardPlaytimeText {
  // Format: "Ward 1 The Parting Stones • 2h 15m"
  font: 'Cinzel';
  fontSize: 20;
  color: 0xFFFFFF;
  anchor: { x: 0, y: 0 };   // Left-aligned, top anchor
  position: {
    x: 564;                 // Same as location text
    y: 55;                  // Standard position below dragon name
  };
  visibility: 'extended attachment only';
}
```

### Land/Last Played Text (Extended Attachment)
```typescript
interface LandLastPlayedText {
  // Format: "Land 1 Horizon Steppe • Last: 2h ago"
  font: 'Cinzel';
  fontSize: 14;             // Smaller, secondary info
  color: 0xCCCCCC;          // Slightly dimmed
  anchor: { x: 0, y: 0 };
  position: {
    x: 564;                 // Same as other attachment text
    y: 75;                  // Below ward/playtime text (but within 80px height)
  };
  visibility: 'extended attachment only';
}
```

### Footer Text (ENTER/ESC) - NOT PRESENT
```typescript
// IMPORTANT: Footer text is NOT shown on profile selection screen
// Footer only appears on the name entry screen
// This was intentionally removed to avoid confusion
```

---

## Magical Gems

### Gem Specifications
```typescript
interface MagicalGem {
  diameter: 24;              // Full gem size (12px radius)
  layers: [
    'outerGlow',           // Outer glow layer
    'mainCircle',          // Main gem body
    'innerGlow',           // Inner glow layer
    'highlight',           // Bright highlight spot
  ];

  // Gem states
  lit: boolean;              // true = glowing, false = dim

  // Colors (vary by slot)
  colors: {
    slot1: 0x00CED1,       // Cyan
    slot2: 0xFF6B9D,       // Pink
    slot3: 0x9370DB,       // Purple
  };

  // Glow behavior
  alpha: {
    normal: 1.0,
    hovered: 1.2,          // Brighter when hovered
  };
}

// Gem positioning
// - Nameplate gem: (480, 20) in nameplate cutout
// - Attachment gem: (534, 20) in attachment visible area
```

---

## Selection States

### State Definitions
```typescript
enum SlotState {
  EMPTY = 'empty',           // No profile data
  FILLED_NORMAL = 'normal',  // Has data, not selected/hovered
  FILLED_HOVERED = 'hovered',// Has data, mouse over
  FILLED_SELECTED = 'selected' // Has data, currently selected
}
```

### State Visual Behaviors

**EMPTY**
- Nameplate: Dark grey (0x555555)
- Gem: Unlit (dim state)
- Attachment: None
- Text: "FILE #" label only
- Selection arrow: Hidden

**FILLED_NORMAL**
- Nameplate: Light grey (0xCCCCCC, alpha 0.9)
- Gem: Lit (glowing)
- Attachment: Simple attachment (700x80, 37% cut)
- Attachment & corner: Match nameplate tint (0xCCCCCC, alpha 0.9)
- Text: Dragon name + location data
- Selection arrow: Hidden

**FILLED_HOVERED**
- Nameplate: Full white (0xFFFFFF, alpha 1.0)
- Gem: Lit with increased glow (alpha 1.2)
- Attachment: Simple attachment
- Attachment & corner: Match nameplate tint (0xFFFFFF, alpha 1.0)
- Text: Dragon name + location data
- Selection arrow: Visible

**FILLED_SELECTED**
- Nameplate: Full white (0xFFFFFF, alpha 1.0)
- Gem: Lit (glowing)
- Attachment: Extended attachment (more detailed styling)
- Attachment & corner: Match nameplate tint (0xFFFFFF, alpha 1.0)
- Text: Dragon name + ward/playtime + land/last played
- Selection arrow: Hidden (selected state is clear from attachment)

---

## Data Architecture

### World Data Source
```typescript
// SINGLE SOURCE OF TRUTH
// Location: packages/shared/src/game-data/world-data.ts

export interface WardData {
  id: string;              // 'ward1', 'ward2', etc.
  number: number;          // 1-based index
  name: string;            // Display name (e.g., "The Parting Stones")
  landId: number;          // Parent land ID
  distanceFromStart: number; // Distance in meters
}

export interface LandData {
  id: number;              // Numeric land ID (1, 2, 3...)
  stringId: string;        // String identifier ('land1_steppe')
  name: string;            // Display name (e.g., "Horizon Steppe")
  wards: WardData[];       // All wards in this land
}

// Lookup functions (imported from @draconia/shared)
getWardName(wardNumber: number, landId: number): string
getLandName(landId: number): string
```

### Profile Data Flow
```typescript
// Data loading sequence:
// 1. ProfileRepository loads profiles from IndexedDB (Dexie)
// 2. For each profile, look up ward/land names from shared world data
// 3. Format playtime and last played timestamps
// 4. Return ProfileSlotData for UI rendering

interface ProfileSlotData {
  slotNumber: 1 | 2 | 3;
  isEmpty: boolean;

  // If not empty:
  profileId?: string;
  dragonName?: string;         // From profile.name
  wardNumber?: number;         // From profile.progress.ward
  wardName?: string;           // From getWardName(ward, land)
  landNumber?: number;         // From profile.progress.land
  landName?: string;           // From getLandName(land)
  playtimeFormatted?: string;  // Formatted as "2h 15m"
  lastPlayedRelative?: string; // Formatted as "2h ago"
  lastActiveTimestamp?: number;
}
```

---

## Responsive Scaling

### Game World Scale
```typescript
// ResponsiveManager calculates scale based on screen size
// All measurements are multiplied by this scale factor

const scale = responsiveManager.getGameWorldScale();

// Example scaling:
// - 1920x1080 screen: scale = 1.0 (reference size)
// - 1280x720 screen: scale = 0.67
// - 3840x2160 screen: scale = 2.0

// Apply scale to ALL measurements:
nameplate.width = 500 * scale;
nameplate.height = 80 * scale;
gem.radius = 12 * scale;
fontSize = 32 * scale;
// etc.
```

---

## Implementation Files

### Core Files
- **Profile Selection Manager**: `apps/web/src/lib/pixi/systems/profile-selection-manager.ts`
  - Main UI controller
  - State management
  - Event handling
  - Visual updates

- **Profile Repository**: `packages/db/src/profile-repo.ts`
  - Data loading from IndexedDB
  - Profile CRUD operations
  - Uses shared world data for lookups

- **World Data**: `packages/shared/src/game-data/world-data.ts`
  - Single source of truth for land/ward names
  - Lookup utility functions
  - All 22 Horizon Steppe wards

- **Profile Shapes**: `apps/web/src/lib/pixi/systems/profile-shapes.ts`
  - Nameplate shape generation
  - Attachment shape generation
  - Concave corner shape
  - Magical gem creation

---

## Critical Design Decisions

### 1. Gem-Centered Layout
**Decision**: Slots are centered on the gems, not the nameplates.

**Rationale**: Creates visual balance when attachments extend to the right. If centered on nameplates, the extended attachments would make slots appear right-heavy.

**Implementation**: Calculate midpoint between nameplate gem (480) and attachment gem (534) = 507px, then center on that point.

### 2. Attachment Color Matching
**Decision**: Attachments and decorative corners ALWAYS match the nameplate tint.

**Rationale**: Ensures visual consistency - they're part of the same UI element and should behave as a unified component.

**Implementation**: In `updateSlotHighlights()`, apply the same tint and alpha to nameplate, attachment, and decorative corner simultaneously.

### 3. Single World Data Source
**Decision**: All land/ward names are defined ONLY in `packages/shared/src/game-data/world-data.ts`.

**Rationale**: Eliminates code duplication, prevents inconsistencies, and makes adding new lands/wards scalable (only update one file).

**Implementation**: Profile repository imports lookup functions from shared package, journey manager uses same data source.

### 4. Text Vertical Centering
**Decision**: Location text uses `anchor.set(0, 0.5)` with y=20 to center on gems.

**Rationale**: Text baseline needs to align with gem center for visual balance. Without anchor adjustment, text appears too low.

**Implementation**: Set anchor to (0, 0.5) for left-aligned, vertically centered text, then position at same Y as gem.

### 5. Dragon Name Left-Aligned
**Decision**: Dragon name is left-aligned (x=20) instead of center-aligned.

**Rationale**: Provides consistent reading flow from left to right. Center-aligned names with varying lengths create visual instability.

**Implementation**: `anchor.set(0, 0)` for left alignment, positioned at x=20 (left margin).

### 6. No Footer on Profile Selection
**Decision**: ENTER/ESC footer only appears on name entry screen, not profile selection.

**Rationale**: Footer is contextual to name entry actions. Profile selection uses mouse/keyboard naturally without needing explicit instructions.

**Implementation**: Commented out `createHelpText()` call in profile selection initialization.

---

## Testing & Verification

### Visual Verification Checklist
- [ ] All 3 slots display with correct positioning
- [ ] Empty slots show "FILE #" labels
- [ ] Filled slots show dragon names left-aligned
- [ ] Location text is vertically centered on attachment gem
- [ ] Attachment color matches nameplate in all states
- [ ] Decorative corner matches nameplate/attachment color
- [ ] Gems glow appropriately (lit for filled, dim for empty)
- [ ] Selection arrow appears on hover
- [ ] Extended attachment appears on selection
- [ ] All text is readable and properly formatted
- [ ] Ward/land names display correctly (not "undefined")

### Data Verification Checklist
- [ ] Ward names match world-data.ts definitions
- [ ] Land names match world-data.ts definitions
- [ ] Playtime formats correctly (e.g., "2h 15m")
- [ ] Last played formats correctly (e.g., "2h ago")
- [ ] Profile data loads from IndexedDB correctly
- [ ] New profiles create with correct initial values

### Behavioral Verification Checklist
- [ ] Hover changes visual state appropriately
- [ ] Selection changes attachment type (simple → extended)
- [ ] Arrow keys navigate between slots
- [ ] ENTER key selects/confirms slot
- [ ] ESC key cancels and returns to previous screen
- [ ] Copy/Erase/Options buttons function correctly

---

## Future Enhancements

### Potential Improvements
1. **Animation**: Smooth transitions when changing states (fade, slide, scale)
2. **Audio**: Sound effects for hover, select, confirm actions
3. **Particle Effects**: Gem sparkles, magical dust trails
4. **Tooltips**: Additional information on hover (stats, achievements, etc.)
5. **Profile Icons**: Custom dragon avatars/portraits
6. **Theme Support**: Color schemes for different game themes

### Scalability Considerations
- Adding new lands/wards only requires updating `world-data.ts`
- Font sizes scale proportionally with screen size
- Layout remains centered across all resolutions
- Component-based architecture allows easy replacement of visual elements

---

## Maintenance Notes

### When Adding New Lands/Wards
1. Update `packages/shared/src/game-data/world-data.ts` with new land/ward data
2. Run `pnpm run build` in packages/shared to compile TypeScript
3. No other files need changes - all systems use shared world data

### When Modifying Visual Design
1. Update measurements in this specification document first
2. Implement changes in profile-selection-manager.ts
3. Update visual verification checklist
4. Test across multiple screen resolutions
5. Verify all state transitions work correctly

### When Debugging "Undefined" Issues
1. Check browser console for import errors
2. Verify packages/shared is built (dist/ folder exists)
3. Confirm profile-repo imports from @draconia/shared correctly
4. Check that profile data has valid ward/land numbers
5. Verify world-data.ts includes all expected wards

---

## Version History

### Version 1.0 (Current)
- Initial comprehensive specification
- Gem-centered layout
- Attachment color matching behavior
- Single world data source
- Dragon name left-aligned
- Location text vertically centered on gems
- Decorative corner tinting
- No footer on profile selection screen

---

**Document Maintainer**: Development Team
**Last Updated**: 2025-01-XX
**Review Frequency**: After any UI changes
**Status**: Official Reference Implementation ✅
