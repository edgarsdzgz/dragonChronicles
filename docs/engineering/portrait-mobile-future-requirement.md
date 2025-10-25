# Portrait Mobile Support - Future Requirement

**Status**: 📋 Planned (Not Yet Implemented)
**Priority**: Low (After core game loop is complete)
**Created**: 2025-10-25

## Current State

**Mobile users MUST play in landscape mode.** The game is optimized for landscape orientation only.

## Width-First Scaling Rule (Current Implementation)

All responsive scaling follows the **WIDTH-FIRST RULE**:

- ✅ Width is ALWAYS more important than height
- ✅ Images fill edge-to-edge horizontally (no dead space on sides)
- ✅ Top/bottom of images may be cut off
- ✅ Maintains aspect ratio (no stretching)
- ✅ Works perfectly for landscape orientation

**Implementation locations:**

- [responsive-manager.ts:110-134](../../apps/web/src/lib/pixi/systems/responsive-manager.ts#L110-L134)
- [splash-screen.ts:241-256](../../apps/web/src/lib/pixi/systems/splash-screen.ts#L241-L256)

## Future Requirement: Portrait Mobile Exception

When we implement portrait mobile support, we will need to **invert the scaling rule**:

### Portrait Mobile Scaling Rule (Future)

For portrait orientation (height > width):

- ✅ **Height becomes more important** than width
- ✅ Images fill edge-to-edge vertically (no dead space on top/bottom)
- ✅ Left/right of images may be cut off
- ✅ Maintains aspect ratio (no stretching)

### Detection Strategy

```typescript
// Detect orientation
function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

// Or use screen orientation API
function getOrientation(): 'portrait' | 'landscape' {
  if (screen.orientation?.type.includes('portrait')) {
    return 'portrait';
  }
  return 'landscape';
}
```

### Implementation Plan (Future)

1. **Detect orientation** on page load and resize
2. **Force landscape mode** for now (show "Please rotate your device" message)
3. **When ready for portrait support**:
   - Update `ResponsiveManager.calculateScale()` to check orientation
   - If portrait: use `scaleY` instead of `scaleX`
   - Update `SplashScreenManager.handleResize()` similarly
   - Redesign UI layout for vertical screens:
     - Top: Logo
     - Middle: Dragon/Action area
     - Bottom: Controls/Status
   - Test on various device sizes (iPhone SE, iPhone Pro Max, iPad, etc.)

### Code Changes Required (Future)

```typescript
// ResponsiveManager.calculateScale()
calculateScale(contentWidth: number, contentHeight: number): number {
  const { viewportWidth, viewportHeight } = this.state;
  const isPortrait = viewportHeight > viewportWidth;

  if (!this.config.maintainAspectRatio) {
    const primaryDimension = isPortrait ? viewportHeight : viewportWidth;
    const contentPrimaryDimension = isPortrait ? contentHeight : contentWidth;
    return Math.min(primaryDimension / contentPrimaryDimension, this.config.maxScale);
  }

  // WIDTH-FIRST for landscape, HEIGHT-FIRST for portrait
  const scale = isPortrait
    ? viewportHeight / contentHeight  // Portrait: fill vertically
    : viewportWidth / contentWidth;   // Landscape: fill horizontally

  return Math.max(this.config.minScale, Math.min(scale, this.config.maxScale));
}
```

### UI/UX Considerations (Future)

**Portrait mode will require rethinking:**

- Button layouts (vertical stacking vs horizontal)
- Text sizes (more vertical space, less horizontal)
- Dragon positioning (centered vertically instead of left-aligned)
- Enemy spawn patterns (vertical lanes instead of horizontal)
- Health bars (above vs beside entities)
- Minimap position (top-right vs bottom-center)

**Do not invest resources in this now.** Focus on landscape-optimized core game loop first.

## Temporary Solution: Force Landscape

For now, we should display a message when portrait orientation is detected:

```
┌─────────────────────┐
│                     │
│   Please rotate     │
│   your device       │
│   for the best      │
│   experience        │
│                     │
│   🔄 Landscape      │
│   Mode Required     │
│                     │
└─────────────────────┘
```

## References

- [ResponsiveManager](../../apps/web/src/lib/pixi/systems/responsive-manager.ts)
- [SplashScreenManager](../../apps/web/src/lib/pixi/systems/splash-screen.ts)
- [MDN: Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation)

---

**Note**: This is a placeholder document. Do not implement portrait support until the core game loop (Ward 1 MVP) is complete and tested in landscape mode.
