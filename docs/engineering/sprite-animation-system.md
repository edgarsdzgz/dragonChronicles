# Sprite Animation System Guide

## Overview

This document provides a comprehensive guide for the sprite animation system implemented
in
the
Draconia
Chronicles
project..
The system supports multiple animated sprites with dynamic FPS control and real-time
management.

## Quick Start

### Running the Animation Test Page

1. **Start the development server:**

   ```bash

   cd apps/web
   pnpm run dev
   ```

`````text

````text

1. **Open the animation test page:**

   <http://localhost:5173/dev/dragon-animated>

1. **Available controls:**

    - 🎯 **Center Dragon** - Spawn dragon in center

    - 🎲 **Random Dragon** - Spawn dragon at random position

    - ⚔️ **Mantair Corsair** - Spawn Wind Swept Nomads enemy

    - 🐝 **Swarm** - Spawn Wind Swept Nomads swarm

    - **FPS Slider** - Adjust animation speed (1-20 FPS)

    - **Play/Pause** - Control all animations

    - **Clear buttons** - Remove sprites selectively

## System Architecture

### Core Components

#### 1. TextureAtlas (`lib/pixi/texture-atlas.ts`)

Handles sprite sheet parsing and frame extraction:

- Loads PNG sprite sheets using PixiJS v8 Assets API

- Extracts individual frames from 2x2 grids

- Caches textures for efficient reuse

- Provides async frame access with error handling

#### 2. Animation Controllers

- **DragonAnimator** (`lib/pixi/dragon-animator.ts`) - Dragon-specific animation

- **EnemyAnimator** (`lib/pixi/enemy-sprites.ts`) - Generic enemy animation

Both provide:

- Frame cycling through 4-state sequence: `idle → fly*1 → fly*2 → fly_3 → repeat`

- Dynamic FPS control (1-20 FPS range)

- Start/stop/pause functionality

- Manual rendering for ticker-stopped applications

#### 3. Sprite Management

- **Dragon Sprites** (`lib/pixi/dragon-sprites.ts`) - Dragon creation and management

- **Enemy Sprites** (`lib/pixi/enemy-sprites.ts`) - Enemy creation and configuration

## Adding New Sprite Types

### Step-by-Step Process

#### 1. Prepare Sprite Assets

- **Format**: PNG file with transparent background

- **Layout**: 2x2 grid (128x128 pixels per frame)

- **Frame Order**:

  - Top-left: `idle` (resting state)

  - Top-right: `fly_1` (first flight frame)

  - Bottom-left: `fly_2` (second flight frame)

  - Bottom-right: `fly_3` (third flight frame)

- **Location**: Place in `apps/web/static/sprites/`

#### 2. Add Enemy Configuration

In `lib/pixi/enemy-sprites.ts`, update the configuration:

```typescript

// Add to EnemyType union
export type EnemyType = 'mantair-corsair' | 'swarm' | 'your-new-enemy';

// Add to enemyConfigs object
export const enemyConfigs: Record<EnemyType, {
  name: string;
  imagePath: string;
  frameWidth: number;
  frameHeight: number;
  rows: number;
  cols: number;
}> = {
  // ... existing enemies
  'your-new-enemy': {
    name: 'Your New Enemy Display Name',
    imagePath: '/sprites/your*new*enemy_sprite.png',
    frameWidth: 128,
    frameHeight: 128,
    rows: 2,
    cols: 2
  }
};

```text

#### 3. Add UI Controls

In your test page (or create a new one), add spawn functionality:

```typescript

function spawnYourNewEnemy() {
  spawnEnemy('your-new-enemy');
}

// In the UI section, add a button:
<button
  on:click={spawnYourNewEnemy}
  disabled={!isLoaded}
style="padding:8px 12px; background:#YOUR_COLOR; color:white; border:none;
border-radius:6px;
cursor:pointer;
font-size:10px;">
  🎭 Your New Enemy
</button>

```text

#### 4. Test the Implementation

1. Use the debug page first: <http://localhost:5173/dev/dragon-debug>

1. Check console for texture loading success

1. Verify animation cycles correctly

1. Test FPS controls work with new sprite

### Advanced Customization

#### Custom Animation Sequences

To modify the animation sequence, update the `frameSequence` array:

```typescript

// In the animator constructor or as a parameter
private readonly frameSequence: EnemyFrame[] = ['idle', 'fly*1', 'fly*3', 'fly_2']; //
Custom
order

```javascript

#### Different Frame Counts

For sprites with different frame counts, modify the TextureAtlas configuration:

```typescript

// For 1x4 horizontal sprite sheet
const atlas = new TextureAtlas({
  imagePath: '/sprites/horizontal_sprite.png',
  frameWidth: 128,
  frameHeight: 128,
  rows: 1,
  cols: 4
});

```text

#### Custom FPS Ranges

Modify the FPS controls in your UI:

```typescript

// Extend range to 1-30 FPS
<input
  type="range"
  min="1"
  max="30"  // Increased maximum
  step="1"
  bind:value={currentFPS}
/>

```javascript

## Technical Details

### PixiJS v8 Compatibility

The system uses modern PixiJS v8 features:

```typescript

// Modern async texture loading
const texture = await Assets.load('/sprites/sprite_sheet.png');

// Proper texture region creation
const frameTexture = new Texture({
  source: baseTexture.source,
  frame: new Rectangle(x, y, frameWidth, frameHeight),
});

```text

### Performance Optimizations

#### Object Pooling

The dragon system includes object pooling for efficient memory management:

```typescript

const pool = createSpritePool(texture, initialSize);
const sprite = pool.acquire(); // Get sprite from pool
pool.release(sprite); // Return to pool when done

```text

#### Manual Rendering

Since the main app uses ticker.stop(), manual rendering ensures visual updates:

```typescript

// Force render after texture changes
if (this.renderer && this.stage) {
  this.renderer.render(this.stage);
}

```text

### Error Handling

Comprehensive error handling throughout the system:

```typescript

try {
  const frame = await getDragonFrame(frameType);
  if (!frame) {
    console.error(`Failed to get frame: ${frameType}`);
    return;
  }
  // Process frame...
} catch (error) {
  console.error('Animation error:', error);
}

```bash

## Troubleshooting Guide

### Common Issues

#### Sprites Not Appearing

1. **Check console logs** for texture loading errors

1. **Verify file paths** in browser Network tab

1. **Confirm sprite visibility** is set to `true`

1. **Check positioning** - sprites might be off-screen

#### Animation Not Working

1. **Verify renderer and stage** are passed to animator

1. **Check FPS setting** - ensure it's > 0

1. **Confirm animation is started** - check `isAnimating()` status

1. **Look for frame loading errors** in console

#### Build Issues

- **Development works fine** - build issues are related to logger package dependencies

- **Use dev server** for all development and testing

- **Build issues don't affect** the sprite animation system

### Debug Tools

#### Debug Page Features

The debug page (`/dev/dragon-debug`) provides:

- Step-by-step texture loading verification

- Real-time loading status updates

- Error message display

- Frame-by-frame loading confirmation

#### Console Debugging

Enable detailed logging by checking browser console:

- Texture loading success/failure

- Frame extraction confirmation

- Animation state changes

- FPS adjustment confirmations

#### Browser DevTools

- **Network tab**: Verify sprite sheet files load correctly

- **Console**: Monitor for JavaScript errors

- **Performance tab**: Check for memory leaks with many sprites

## Best Practices

### Code Organization

1. **Follow existing patterns** - Use the same file structure as dragon/enemy sprites

1. **Maintain type safety** - Always update TypeScript types when adding sprites

1. **Use meaningful names** - Clear naming for sprite types and configurations

1. **Document changes** - Update this guide when adding new features

### Performance Considerations

1. **Use object pooling** for frequently spawned sprites

1. **Limit concurrent animations** - Too many sprites can impact performance

1. **Optimize sprite sheet size** - Keep textures reasonably sized

1. **Clean up properly** - Always destroy animators and remove sprites

### Testing Strategy

1. **Start with debug page** - Verify texture loading before main implementation

1. **Test incrementally** - Add one sprite type at a time

1. **Verify FPS controls** - Ensure new sprites respond to speed changes

1. **Test cleanup** - Confirm sprites are properly removed

## Future Enhancements

### Potential Improvements

1. **Animation Presets** - Predefined animation sequences for different sprite types

1. **Easing Functions** - Smooth transitions between frames

1. **Sprite Trails** - Visual effects following animated sprites

1. **Sound Integration** - Audio cues synchronized with animations

1. **Batch Operations** - Efficient handling of many sprites simultaneously

### Extension Points

The system is designed for easy extension:

- Add new enemy types by updating configuration objects

- Create custom animation sequences by modifying frame arrays

- Implement new UI controls by following existing button patterns

- Add special effects by extending the animator classes

## Conclusion

The sprite animation system provides a robust foundation for animated sprites in the
Draconia
Chronicles
project..
By following the patterns established for dragons and Wind Swept Nomads enemies, you can
easily
add
new
sprite
types
while
maintaining
performance
and
code
quality.

For questions or issues, refer to the debug tools and console logging - the system
provides
comprehensive
feedback
to
help
diagnose
and
resolve
problems
quickly.

`````
