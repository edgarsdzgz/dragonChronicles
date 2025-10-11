# Scrolling Background Combat System Documentation

## Overview

The scrolling background combat system is a comprehensive implementation that combines infinite scrolling backgrounds with real-time combat mechanics, health systems, and economic integration. This system serves as the core gameplay loop for the DragonIdler game.

## Architecture

### Core Components

1. **Scrolling Background System** (`apps/web/src/lib/pixi/scrolling-background.ts`)
2. **Projectile System** (`apps/web/src/lib/pixi/projectile-sprites.ts`)
3. **Enemy System** (`apps/web/src/lib/pixi/enemy-sprites.ts`)
4. **Arcana Integration** (`@draconia/sim` package)

### Key Features

- **Infinite Scrolling Background**: Seamless looping with parallax effects
- **Real-time Combat**: Homing projectiles with collision detection
- **Health System**: Smooth HP bar animations with visual feedback
- **Economic Integration**: Arcana rewards for enemy defeats
- **Responsive Scaling**: Browser zoom and window resize support
- **Visual Effects**: Blinking animations for defeated enemies and projectiles

## Technical Implementation

### 1. Scrolling Background System

#### Background Image Specifications

- **Current Image**: `steppe_background_2-1.png` (1024x512 pixels)
- **Scaling**: Responsive to browser dimensions with proper aspect ratio
- **Looping**: Seamless horizontal scrolling from right to left
- **Performance**: Power-of-2 dimensions for optimal GPU rendering

#### Band Definitions

Based on pixel analysis of the background image:

```typescript
const BACKGROUND_BANDS = {
  SPACE: { start: 0, end: 180, purpose: 'Currency UI' },
  ACTION_AREA: { start: 180, end: 380, purpose: 'Combat/Gameplay' },
  GROUND: { start: 380, end: 512, purpose: 'Player UI/Menus' },
};
```

- **Space Band (0-180px)**: Dark blue area for currency displays
- **Action Area (180-380px)**: Light blue sky area for combat and gameplay
- **Ground Band (380-512px)**: Brown/underground area for player UI and menus

### 2. Combat System

#### Dragon Protagonist

- **Position**: Left side of screen, centered in Action Area (50% mark of sky band)
- **Attack Range**: 1100 pixels (increased by 175%)
- **Base Damage**: 5 HP per hit
- **Health**: 100 HP with smooth HP bar animation
- **Projectiles**: Homing projectiles that track moving targets

#### Enemy System

- **Spawn Area**: Action Area (sky band) only
- **Spawn Position**: Offscreen right (100px beyond visible area)
- **Movement**: Left to right at 50 pixels/second
- **Attack Range**: 300 pixels

#### Enemy Types and Stats

| Enemy Type      | Health | Damage to Kill | Arcana Reward |
| --------------- | ------ | -------------- | ------------- |
| Swarm           | 7 HP   | 1.4 hits       | 0.01          |
| Mantair Corsair | 13 HP  | 2.6 hits       | 0.03          |

#### Projectile System

**Dragon Projectiles**:

- **Behavior**: Homing projectiles that track target enemies
- **Piercing**: 0.07 second delay before destruction
- **Target Selection**: Closest enemy within attack range
- **Collision**: Single-target collision (prevents multi-hit bugs)

**Enemy Projectiles**:

- **Behavior**: Straight-line projectiles
- **Damage**: 10 HP to dragon
- **Speed**: Variable by enemy type

### 3. Health System

#### Smooth HP Bar Animation

- **Duration**: 500ms animation for health changes
- **Interpolation**: Smooth transition from previous to current health
- **Visual Feedback**: Color changes based on health percentage
  - Green: >60% health
  - Yellow: 30-60% health
  - Orange-Red: <30% health

#### Health Bar Specifications

- **Dragon**: Green background with black border
- **Enemies**: Red background with black border
- **Positioning**: 40 pixels above sprites, scaled with zoom
- **Width**: 60 pixels, scaled with current scale factor

### 4. Visual Effects System

#### Defeated Enemy Animation

- **Blinking Pattern**: 100ms per blink (alpha 1.0 ↔ 0.3)
- **Duration**: 330ms total before disappearance
- **Synchronization**: All projectiles targeting defeated enemies blink in sync

#### Projectile Blinking

- **Target Tracking**: `projectileTargets` Map tracks projectile-enemy relationships
- **Synchronized Destruction**: Projectiles disappear with their target enemy
- **Memory Management**: Automatic cleanup of tracking data

### 5. Economic Integration

#### Arcana System

- **Manager**: `ArcanaDropManager` from `@draconia/sim` package
- **Display**: Yellow Cinzel font, top-left positioning
- **Precision**: Two decimal places (e.g., "1.23")
- **Rewards**: Based on enemy type and difficulty

#### Reward Structure

```typescript
const ARCANA_REWARDS = {
  swarm: 0.01, // Basic enemies
  'mantair-corsair': 0.03, // Elite enemies (3x reward)
};
```

### 6. Responsive Scaling

#### Browser Zoom Support

- **Detection**: `window.visualViewport.scale` and `window.devicePixelRatio`
- **Scaling**: All sprites, UI elements, and positioning scales proportionally
- **Band Alignment**: Background bands maintain correct positioning across zoom levels

#### Window Resize Handling

- **Dynamic Scaling**: Real-time adjustment to new window dimensions
- **Sprite Repositioning**: Automatic recalculation of sprite positions
- **UI Layout**: Responsive positioning of health bars and counters

## Performance Optimizations

### 1. Rendering Optimizations

- **Power-of-2 Textures**: Background image uses 1024x512 for optimal GPU performance
- **Sprite Pooling**: Reuse of projectile and enemy sprites where possible
- **Efficient Collision**: Custom hitbox system with 50% sprite size for performance

### 2. Memory Management

- **Automatic Cleanup**: Projectiles and enemies are properly destroyed
- **Map Management**: `projectileTargets` Map is cleaned up on projectile destruction
- **Graphics Cleanup**: Health bar graphics are properly disposed of

### 3. Frame Rate Management

- **FPS Limiting**: Configurable frame rate limits for performance
- **Update Loops**: Separate loops for projectiles, combat, and rendering
- **Efficient Updates**: Only update elements that have changed

## API Reference

### Main Functions

#### `initializeScrollingBackground()`

Initializes the complete scrolling background system with combat.

**Returns**: Object with control functions:

- `start()`: Begin gameplay
- `stop()`: Stop gameplay
- `destroy()`: Clean up all resources

#### `fireProjectileFromDragon()`

Fires a homing projectile from the dragon to the closest enemy.

**Features**:

- Single-target collision detection
- Homing behavior with dynamic target tracking
- Piercing effect with 0.07s delay
- Arcana reward integration

#### `drawHealthBars()`

Renders health bars for dragon and all enemies with smooth animations.

**Features**:

- Smooth interpolation between health states
- Color-coded health indicators
- Scaled positioning based on current zoom level

#### `drawArcanaCounter()`

Displays current arcana balance with responsive scaling.

**Features**:

- Integration with `ArcanaDropManager`
- Two decimal place precision
- Responsive font sizing

## Configuration Constants

```typescript
// Combat Configuration
const DRAGON_ATTACK_RANGE = 1100; // Increased by 175%
const ENEMY_ATTACK_RANGE = 300;
const ENEMY_MOVE_SPEED = 50;
const DRAGON_BASE_DAMAGE = 5;

// Enemy Health Configuration
const ENEMY_HEALTH_CONFIG = {
  'mantair-corsair': 13, // 2.6 hits to kill
  swarm: 7, // 1.4 hits to kill
};

// Visual Effect Configuration
const DEATH_DELAY = 330; // Milliseconds before enemy disappears
const BLINK_SPEED = 100; // Milliseconds per blink
const PIERCE_DELAY = 70; // Milliseconds projectile pierces
const HEALTH_ANIMATION_DURATION = 500; // Health bar animation duration
```

## Troubleshooting

### Common Issues

1. **Syntax Errors**: Ensure all try-catch blocks have proper structure
2. **Variable References**: Use `closestEnemy` instead of `enemy` in collision callbacks
3. **Memory Leaks**: Verify `projectileTargets` Map is properly cleaned up
4. **Scaling Issues**: Check that all positioning uses `currentScale` multiplier

### Debug Features

- **Console Logging**: Comprehensive logging for combat events
- **Visual Debugging**: Optional overlay system for band alignment
- **Performance Monitoring**: FPS HUD available with `?hud=1` URL parameter

## Future Enhancements

### Planned Features

1. **Multiple Background Layers**: Parallax scrolling with foreground/background
2. **Advanced Enemy AI**: Different movement patterns and behaviors
3. **Power-up System**: Temporary boosts and special abilities
4. **Sound Effects**: Audio feedback for combat events
5. **Particle Effects**: Visual explosions and impact effects

### Performance Improvements

1. **Object Pooling**: More efficient sprite reuse
2. **Spatial Partitioning**: Optimized collision detection for many enemies
3. **Texture Atlases**: Combined sprite sheets for reduced draw calls
4. **WebGL Optimizations**: Shader-based effects and animations

## Integration Points

### Dependencies

- **PixiJS**: Rendering engine for sprites and graphics
- **@draconia/sim**: Economic simulation and arcana management
- **SvelteKit**: Web application framework
- **TypeScript**: Type-safe development

### Data Flow

1. **User Input** → Combat System → Projectile Creation
2. **Projectile Movement** → Collision Detection → Damage Application
3. **Damage Events** → Health System → Visual Feedback
4. **Enemy Defeat** → Arcana System → Economic Updates
5. **Visual Changes** → Rendering System → Display Updates

## Testing Strategy

### Unit Tests

- Collision detection accuracy
- Health system calculations
- Arcana reward distribution
- Scaling and positioning

### Integration Tests

- End-to-end combat flow
- Background scrolling performance
- Memory leak detection
- Cross-browser compatibility

### Performance Tests

- Frame rate stability under load
- Memory usage over time
- Scaling performance at different zoom levels
- Large enemy count handling

---

_Last Updated: [Current Date]_
_Version: 1.0.0_
_Maintainer: DragonIdler Development Team_
