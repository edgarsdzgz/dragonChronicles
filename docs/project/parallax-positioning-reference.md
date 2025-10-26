# Parallax Background Positioning Reference

## Overview

This document provides precise pixel measurements and screen percentage relationships for all parallax background layers in Land 1: Horizon Steppe. These measurements ensure consistent positioning across different screen sizes and serve as a reference for future lands and wards.

## Screen Zone Definitions (From Draconia Tome)

Based on `draconiaChroniclesDocs/tome/21_A11y_UX_Mobile_Design.md`:

### Zone 1: Space Area (Currency Display)

- **Pixel Range**: 0px - 100px
- **Percentage**: 0% - 9.26% of screen height
- **Purpose**: Currency display area

### Zone 2: Action Area (Gameplay)

- **Pixel Range**: 100px - 525px
- **Percentage**: 9.26% - 48.61% of screen height
- **Purpose**: Main gameplay action area

### Zone 3: Player UI Area (Underground)

- **Pixel Range**: 525px - 1080px
- **Percentage**: 48.61% - 100% of screen height
- **Purpose**: Underground/UI elements

## Background Layer Positioning (Land 1: Horizon Steppe)

### Reference Point: Action Band Bottom Y

- **Code Variable**: `actionBandBottomY`
- **Calculation**: `positioning.getActionAreaBottomY()`
- **Value**: Approximately 400px at 1080p (varies by scale)
- **Percentage**: ~37% of screen height

### Layer Stack (Back to Front)

#### 1. Static Background Layer

- **Asset**: `steppe_background_grassless.png`
- **Position**: `(0, 0)` - Left-aligned to screen edge
- **Movement**: Static (no parallax)
- **Z-Index**: 0
- **Purpose**: Base sky and underground areas

#### 2. Clouds Parallax Layer (Sky)

- **Asset**: `steppe_clouds-1.png`
- **Position Y**: `actionBandBottomY` (aligned with action band bottom)
- **Position X**: Starts at left edge, parallaxes left
- **Movement Speed**: 12.5% of background speed (5% faster than mountain)
- **Z-Index**: 1
- **Purpose**: Sky clouds behind mountain for atmospheric depth
- **Notes**: Positioned behind mountain but in front of background

#### 3. Mountain Parallax Layer

- **Asset**: `lonelyMountain-clouds-1.png`
- **Position Y**: `actionBandBottomY + (29 * currentScale)`
- **Position X**: Starts offscreen right, parallaxes left
- **Movement Speed**: 7.5% of background speed
- **Z-Index**: 2
- **Purpose**: Distant mountain range
- **Notes**: Base fully covered by grassland layer - no clipping visible

#### 4. Hills Parallax Layer

- **Asset**: `steppe_hills-1.png`
- **Position Y**: `actionBandBottomY + (11 * currentScale)` (21px higher than mountain)
- **Position X**: Seamless tiling from left edge
- **Movement Speed**: 6% of background speed (80% of mountain speed)
- **Z-Index**: 10
- **Purpose**: Mid-ground rolling hills
- **Notes**: **LOCKED IN** - Positioned 21px higher than mountain for perfect visibility above grassland

#### 5. Grassland Foreground Layer

- **Asset**: `grasslandLayer_steppe.png`
- **Position Y**: `actionBandBottomY + (44 * currentScale)`
- **Position X**: Seamless tiling from left edge
- **Movement Speed**: 100% of background speed
- **Z-Index**: 40
- **Purpose**: Moving grass foreground
- **Notes**: Overlays mountain and hills, creates flight illusion

## Pixel Measurements Reference

### Key Positioning Offsets (in pixels at 1080p) - **LOCKED IN**

- **Mountain Base**: +29px from actionBandBottomY
- **Hills Base**: +11px from actionBandBottomY (18px higher than mountain for perfect visibility)
- **Grassland Top**: +44px from actionBandBottomY
- **Difference**: Grassland is 15px lower than mountain, 33px lower than hills

### Parallax Speed Relationships

- **Clouds**: 12.5% (sky layer - 5% faster than mountain)
- **Mountain**: 7.5% (distant - slower than clouds)
- **Hills**: 6% (80% of mountain speed - mid-ground)
- **Grassland**: 100% (fastest - foreground)

## Scaling Considerations

### Current Scale Factor

- **Variable**: `currentScale`
- **Calculation**: Based on screen height vs. reference height (1080px)
- **Usage**: All pixel offsets multiplied by `currentScale` for responsive positioning

### Example Calculations (1080p Reference)

```typescript
// At 1080p screen height - LOCKED IN POSITIONING
const actionBandBottomY = 400; // ~37% of screen
const cloudsY = actionBandBottomY + (0 * 1.0) = 400px; // Aligned with action band bottom
const mountainY = actionBandBottomY + (29 * 1.0) = 429px;
const hillsY = actionBandBottomY + (11 * 1.0) = 411px; // 18px higher than mountain
const grasslandY = actionBandBottomY + (44 * 1.0) = 444px;

// At 1440p screen height (currentScale = 1.33) - LOCKED IN POSITIONING
const actionBandBottomY = 533; // ~37% of screen
const cloudsY = actionBandBottomY + (0 * 1.33) = 533px; // Aligned with action band bottom
const mountainY = actionBandBottomY + (29 * 1.33) = 572px;
const hillsY = actionBandBottomY + (11 * 1.33) = 548px; // 18px higher than mountain
const grasslandY = actionBandBottomY + (44 * 1.33) = 592px;
```

## Z-Index Layer System

```typescript
const Z_LAYERS = {
  BACKGROUND_STATIC: 0, // Static background
  BACKGROUND_CLOUDS: 1, // Sky clouds layer
  BACKGROUND_PARALLAX: 2, // Mountain layer
  ENVIRONMENT_DECORATIVE: 10, // Hills layer
  ENVIRONMENT_INTERACTIVE: 11, // Reserved
  ENEMIES: 20, // Enemy sprites
  ENEMY_PROJECTILES: 21, // Enemy projectiles
  PLAYER_PROJECTILES: 22, // Player projectiles
  PLAYER_DRAGON: 30, // Dragon sprite
  FOREGROUND_GRASS: 40, // Grassland layer
  FOREGROUND_DECORATIVE: 41, // Reserved
  UI_BACKGROUND_PANELS: 50, // UI backgrounds
  UI_BACKGROUND_ELEMENTS: 51, // UI elements
  UI_HEALTH_BARS: 60, // Health bars
  UI_TEXT: 61, // UI text
  UI_ICONS: 62, // UI icons
  // ... additional layers up to 99
};
```

## Future Land Considerations

### Land 2: Ember Reaches (Volcanic Theme)

- **Background**: Volcanic plains with lava flows
- **Parallax**: Fire mountains, lava streams
- **Foreground**: Ember grass, ash particles
- **Positioning**: Use same offset relationships, adjust for volcanic terrain

### Land 3: Mistral Peaks (Wind/Ice Theme)

- **Background**: Mountain sky with storm clouds
- **Parallax**: Snow peaks, ice cliffs
- **Foreground**: Alpine grass, ice crystals
- **Positioning**: Use same offset relationships, adjust for mountainous terrain

## Implementation Guidelines

### Adding New Parallax Layers

1. **Choose appropriate Z-Index** from available range
2. **Calculate Y position** relative to `actionBandBottomY`
3. **Set parallax speed** based on depth (slower = more distant)
4. **Use `currentScale`** for responsive positioning
5. **Test on multiple screen sizes** to verify scaling

### Asset Requirements

#### Current Land 1 Assets (Horizon Steppe)

- **Background**: `steppe_background_grassless.png` - 2048x1024px
- **Clouds**: `steppe_clouds-1.png` - [Dimensions to be measured - sky layer]
- **Mountain**: `lonelyMountain-clouds-1.png` - 850x425px
- **Hills**: `steppe_hills-1.png` - [Dimensions to be measured - similar height to grassland]
- **Grassland**: `grasslandLayer_steppe.png` - 2048x64px

#### Standard Dimensions for Future Assets

- **Background**: 2048x1024px minimum, seamless left-right
- **Clouds Parallax**: Variable width x height, seamless left-right tiling, sky-themed
- **Mountain Parallax**: 850x425px (or proportional - height should be ~50% of width)
- **Hills Parallax**: Variable width x ~64px height, seamless left-right tiling
- **Grassland Foreground**: 2048x64px, seamless left-right tiling
- **Format**: PNG with transparency support

#### Asset Height Guidelines

- **Background**: 1024px height (full screen coverage)
- **Clouds**: Variable height (sky layer - typically 200-400px for atmospheric effect)
- **Mountain**: ~425px height (proportional to width, typically 50% ratio)
- **Hills**: ~64px height (consistent across all lands for proper layering)
- **Grassland**: 64px height (matches hills for seamless integration)

## Quality Assurance Checklist

- [ ] Clouds layer positioned behind mountain but in front of background
- [ ] Mountain base fully covered by grassland layer (no clipping)
- [ ] Hills bottom edge aligns with mountain base
- [ ] Grassland overlays both mountain and hills
- [ ] All layers scale properly on window resize
- [ ] Parallax speeds create convincing depth (clouds faster than mountain)
- [ ] No visual gaps or overlaps between layers
- [ ] Z-index ordering prevents rendering conflicts

## Movement Control Buttons

### Button Positioning

- **Position**: Top-left of underground area
- **Button Size**: 80x80px (scaled from 500x500px assets)
- **Spacing**: 15px between buttons
- **Left Padding**: 20px from screen edge
- **Top Padding**: 20px from underground area top edge
- **Z-Index**: UI_CONTROLS (63)
- **Consistent Padding**: Both left and top use same 20px padding value

### Button States

- **Neutral**: Default appearance when not active
- **Depressed**: Active state showing current movement mode
- **Pixel Perfect**: All textures use `scaleMode: 'nearest'`
- **Persistent State**: Active button stays depressed until another is pressed

---

## Journey Scene Baselines (Scrolling Parallax - October 2025)

### Current Implementation (Game World Coordinates)

All positions in 1920x1080 game world space, scale 1.0 at baseline:

#### Layer Configuration

1. **Background** - `steppe-background`
   - Position: (0, 0)
   - zIndex: 0
   - Scale: 1.0
   - Parallax Speed: 0 (static)

2. **Clouds** - `steppe-clouds`
   - Position: (96, 75) = (5%, 6.94%)
   - zIndex: 1
   - Scale: 1.0
   - Width: 2048px (seamless tiling)
   - Parallax Speed: 0.125 (12.5% of dragon speed)

3. **Mountains** - `steppe-mountains`
   - Position: (1920, 90) = (100% offscreen right, 8.33%)
   - zIndex: 2
   - Scale: 1.0
   - Width: 2048px (seamless tiling)
   - Parallax Speed: 0.005 (0.5% of dragon speed - slowest)

4. **Hills** - `steppe-hills`
   - Position: (96, 435) = (5%, 40.28%)
   - zIndex: 3
   - Scale: 1.0
   - Width: 2048px (seamless tiling)
   - Height: 80px
   - Parallax Speed: 0.6 (60% of dragon speed)

5. **Ground** - `steppe-ground`
   - Position: (-38, 485) = (-2%, 44.91%)
   - zIndex: 4
   - Scale: 1.0
   - Width: 2048px (seamless tiling)
   - Height: 64px
   - Parallax Speed: 1.0 (100% of dragon speed - full speed)

#### Key Relationships

- Clouds to Hills: 360px difference
- Mountains to Hills: 345px difference
- Hills to Ground: 50px difference
- Dragon Movement Speed: 100 pixels/second (base)
- All parallax layers use dual-sprite tiling for seamless looping

---

#### Journey Controls

- **Pause Button**: Centered below dragon at X=75.2 (dragon X=115.2, button width=80)
- **Backward Button**: Left of pause at X=-19.8
- **Forward Button**: Right of pause at X=170.2
- **Button Size**: 80x80 (scaled from 128x128 native)
- **Button Y Position**: 615 (underground + 150px - 25px)
- **Button Spacing**: 15px

---

## Journey Progression System

### Distance Tracking

**Physics-Based Movement Speed:**

- Dragon cruising speed: 100 pixels/second
- Conversion ratio: 2.5 pixels = 1 meter
- Real-world speed: 40 meters/second (~144 km/h)
- Calculation basis: Bird of prey cruising speeds (~50 km/h) scaled by square-cube law to dragon size (8x linear scale = 2.83x speed multiplier)

**Movement States:**

- **Forward**: Distance increases at 40 m/s
- **Backward**: Distance decreases at 40 m/s (cannot go below 0m)
- **Paused**: Distance frozen

### Ward Milestones (Land 1: Horizon Steppe)

Ward distances are constant across all playthroughs:

1. **Draconia** (Starting Point)
   - Distance: 0 meters
   - Land: land1_steppe

2. **First Ward**
   - Distance: 1,000 meters (1 km)
   - Land: land1_steppe

3. **Second Ward**
   - Distance: 2,500 meters (2.5 km)
   - Land: land1_steppe

4. **Third Ward**
   - Distance: 5,000 meters (5 km)
   - Land: land1_steppe

### Enemy Difficulty Scaling

Enemy difficulty increases with distance traveled:

```typescript
difficultyMultiplier = 1.0 + (0.1 * distanceInKilometers)

Examples:
- At 0m (Draconia):     1.0x difficulty
- At 1km (First Ward):  1.1x difficulty
- At 2.5km (Second):    1.25x difficulty
- At 5km (Third Ward):  1.5x difficulty
```

### System Integration

**JourneyProgressionManager** ([journey-progression-manager.ts](../../apps/web/src/lib/pixi/systems/journey-progression-manager.ts)):

- Tracks total distance traveled from Draconia
- Detects ward transitions and logs milestone arrivals
- Calculates enemy difficulty multipliers
- Prevents negative distance (cannot retreat past Draconia)
- Updates every frame with dragon speed and movement state

**Integration Points:**

- Initialized in [game-start-manager.ts](../../apps/web/src/lib/pixi/systems/game-start-manager.ts) during journey start
- Updates in main game loop with dragon speed and current movement state
- Provides difficulty multipliers for enemy spawning system

---

**Last Updated**: October 2025 (Journey progression system with distance tracking added)
**Version**: 2.1
**Status**: Active Development - Journey Movement and Progression Complete
