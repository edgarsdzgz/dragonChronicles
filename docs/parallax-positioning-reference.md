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
- **Position Y**: `actionBandBottomY + (32 * currentScale)`
- **Position X**: Starts offscreen right, parallaxes left
- **Movement Speed**: 7.5% of background speed
- **Z-Index**: 2
- **Purpose**: Distant mountain range
- **Notes**: Perfect positioning achieved - base aligned with underground transition

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
- **Mountain Base**: +32px from actionBandBottomY
- **Hills Base**: +11px from actionBandBottomY (21px higher than mountain for perfect visibility)
- **Grassland Top**: +44px from actionBandBottomY
- **Difference**: Grassland is 12px lower than mountain, 33px lower than hills

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
const mountainY = actionBandBottomY + (32 * 1.0) = 432px;
const hillsY = actionBandBottomY + (11 * 1.0) = 411px; // 21px higher than mountain
const grasslandY = actionBandBottomY + (44 * 1.0) = 444px;

// At 1440p screen height (currentScale = 1.33) - LOCKED IN POSITIONING
const actionBandBottomY = 533; // ~37% of screen
const cloudsY = actionBandBottomY + (0 * 1.33) = 533px; // Aligned with action band bottom
const mountainY = actionBandBottomY + (32 * 1.33) = 576px;
const hillsY = actionBandBottomY + (11 * 1.33) = 548px; // 21px higher than mountain
const grasslandY = actionBandBottomY + (44 * 1.33) = 592px;
```

## Z-Index Layer System

```typescript
const Z_LAYERS = {
  BACKGROUND_STATIC: 0,        // Static background
  BACKGROUND_CLOUDS: 1,        // Sky clouds layer
  BACKGROUND_PARALLAX: 2,      // Mountain layer
  ENVIRONMENT_DECORATIVE: 10,   // Hills layer
  ENVIRONMENT_INTERACTIVE: 11,  // Reserved
  ENEMIES: 20,                  // Enemy sprites
  ENEMY_PROJECTILES: 21,        // Enemy projectiles
  PLAYER_PROJECTILES: 22,       // Player projectiles
  PLAYER_DRAGON: 30,            // Dragon sprite
  FOREGROUND_GRASS: 40,         // Grassland layer
  FOREGROUND_DECORATIVE: 41,    // Reserved
  UI_BACKGROUND_PANELS: 50,     // UI backgrounds
  UI_BACKGROUND_ELEMENTS: 51,   // UI elements
  UI_HEALTH_BARS: 60,           // Health bars
  UI_TEXT: 61,                  // UI text
  UI_ICONS: 62,                 // UI icons
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
- [ ] Mountain base aligns with underground transition
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

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready for Land 1
