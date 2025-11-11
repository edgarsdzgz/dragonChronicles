# Profile Selection Animation System - Implementation Plan

**Date**: 2025-01-XX
**Status**: Planning Phase
**Priority**: Medium

---

## Overview

Create a smooth, coordinated animation sequence when a profile slot is selected. The animation should feel polished and professional, with clear visual feedback about what's happening.

---

## Animation Sequence

### **Current State**: No animation - instant state change
### **Desired State**: Coordinated multi-step animation sequence

### **Sequence Steps**:

1. **User selects a profile** (clicks or presses ENTER)
2. **Below slots move left** (200-300ms)
3. **Extended attachment drops down** (200-300ms, starts when slots finish moving)
4. **Total duration**: ~400-600ms

---

## Detailed Animation Specification

### **Step 1: Selection Triggered**
```typescript
// When selection changes from slotIndex A to slotIndex B
onSelectionChange(newIndex: number, oldIndex: number) {
  // Determine which slots need to move
  const slotsToMove = this.getSlotsBelow(newIndex);

  // Start animation sequence
  this.animateSelection(newIndex, slotsToMove);
}
```

### **Step 2: Slots Move Left**
```typescript
// Animation parameters
const SLIDE_LEFT_DURATION = 250; // ms
const SLIDE_LEFT_DISTANCE = 300; // px (move left by this amount)
const SLIDE_LEFT_EASING = 'easeInOutCubic';

// For each slot below the selected one:
// - Animate container.x from currentX to (currentX - SLIDE_LEFT_DISTANCE)
// - Use smooth easing curve
// - All slots below move simultaneously

// Example: Slot 1 selected
// - Slot 2 moves left
// - Slot 3 moves left
// Both start at the same time, finish at the same time
```

### **Step 3: Extended Attachment Drops Down**
```typescript
// Animation parameters
const DROP_DOWN_DURATION = 250; // ms
const DROP_DOWN_EASING = 'easeOutCubic'; // Gravity-like feel
const DROP_DOWN_START_Y = -80; // Start above the nameplate
const DROP_DOWN_END_Y = 0; // Final position

// Attachment animation:
// - Create extended attachment at y=-80 (above nameplate, hidden)
// - Animate attachment.y from -80 to 0
// - Animate opacity from 0 to 1 simultaneously
// - Starts AFTER slots finish moving left (sequenced, not parallel)

// Timeline:
// 0ms - 250ms: Slots move left
// 250ms - 500ms: Attachment drops down
```

---

## Animation State Management

### **Animation State Enum**
```typescript
enum AnimationState {
  IDLE = 'idle',                    // No animation in progress
  MOVING_SLOTS = 'moving_slots',    // Slots are moving left
  DROPPING_ATTACHMENT = 'dropping', // Extended attachment is dropping
  FINISHING = 'finishing'           // Final state transitions
}
```

### **Animation Context**
```typescript
interface AnimationContext {
  state: AnimationState;
  selectedSlotIndex: number;
  previousSlotIndex: number;
  slotsToAnimate: SlotVisual[];
  startTime: number;
  duration: number;
  onComplete?: () => void;
}
```

---

## Implementation Architecture

### **Option 1: Custom Animation Manager** (Recommended)

**Pros**:
- Full control over timing and easing
- No external dependencies
- Lightweight and performant
- Can be reused for other UI animations

**Cons**:
- Need to implement easing functions
- Manual state management

**Implementation**:
```typescript
class ProfileAnimationManager {
  private context: AnimationContext | null = null;
  private ticker: Ticker;

  constructor(ticker: Ticker) {
    this.ticker = ticker;
  }

  /**
   * Start selection animation sequence
   */
  startSelectionAnimation(
    selectedIndex: number,
    previousIndex: number,
    slots: SlotVisual[]
  ): void {
    // Cancel any existing animation
    this.cancelAnimation();

    // Determine which slots need to move
    const slotsToMove = slots.filter((slot, index) => index > selectedIndex);

    // Create animation context
    this.context = {
      state: AnimationState.MOVING_SLOTS,
      selectedSlotIndex: selectedIndex,
      previousSlotIndex: previousIndex,
      slotsToAnimate: slotsToMove,
      startTime: Date.now(),
      duration: SLIDE_LEFT_DURATION,
    };

    // Start animation loop
    this.ticker.add(this.updateAnimation, this);
  }

  /**
   * Animation update loop
   */
  private updateAnimation = (delta: number): void => {
    if (!this.context) return;

    const elapsed = Date.now() - this.context.startTime;
    const progress = Math.min(1, elapsed / this.context.duration);

    switch (this.context.state) {
      case AnimationState.MOVING_SLOTS:
        this.updateSlotMovement(progress);
        if (progress >= 1) {
          this.transitionToDropAttachment();
        }
        break;

      case AnimationState.DROPPING_ATTACHMENT:
        this.updateAttachmentDrop(progress);
        if (progress >= 1) {
          this.transitionToFinishing();
        }
        break;

      case AnimationState.FINISHING:
        this.finishAnimation();
        break;
    }
  };

  /**
   * Update slot left movement animation
   */
  private updateSlotMovement(progress: number): void {
    const eased = this.easeInOutCubic(progress);
    const offsetX = -SLIDE_LEFT_DISTANCE * eased;

    for (const slot of this.context!.slotsToAnimate) {
      // Animate container.x with easing
      slot.container.x = slot.originalX + offsetX;
    }
  }

  /**
   * Update attachment drop animation
   */
  private updateAttachmentDrop(progress: number): void {
    const eased = this.easeOutCubic(progress);
    const offsetY = DROP_DOWN_START_Y + (DROP_DOWN_END_Y - DROP_DOWN_START_Y) * eased;
    const alpha = eased; // Fade in as it drops

    const selectedSlot = this.slots[this.context!.selectedSlotIndex];
    if (selectedSlot.attachment) {
      selectedSlot.attachment.y = offsetY;
      selectedSlot.attachment.alpha = alpha;
    }
  }

  /**
   * Easing functions
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * State transitions
   */
  private transitionToDropAttachment(): void {
    this.context!.state = AnimationState.DROPPING_ATTACHMENT;
    this.context!.startTime = Date.now();
    this.context!.duration = DROP_DOWN_DURATION;
  }

  private transitionToFinishing(): void {
    this.context!.state = AnimationState.FINISHING;
  }

  private finishAnimation(): void {
    this.ticker.remove(this.updateAnimation, this);
    this.context = null;
  }

  /**
   * Cancel ongoing animation
   */
  cancelAnimation(): void {
    if (this.context) {
      this.ticker.remove(this.updateAnimation, this);
      this.context = null;
    }
  }
}
```

### **Option 2: GSAP Animation Library**

**Pros**:
- Professional-grade animations
- Built-in easing functions
- Timeline system for sequencing
- Widely used and well-documented

**Cons**:
- External dependency (~47KB minified)
- Overkill for simple animations
- Learning curve for API

**Implementation**:
```typescript
import { gsap } from 'gsap';

class ProfileAnimationManager {
  private timeline: gsap.core.Timeline | null = null;

  startSelectionAnimation(
    selectedIndex: number,
    previousIndex: number,
    slots: SlotVisual[]
  ): void {
    // Cancel any existing animation
    this.timeline?.kill();

    // Create new timeline
    this.timeline = gsap.timeline();

    // Step 1: Move slots below to the left
    const slotsToMove = slots.filter((slot, index) => index > selectedIndex);
    for (const slot of slotsToMove) {
      this.timeline.to(
        slot.container,
        {
          x: slot.container.x - 300, // Move left 300px
          duration: 0.25,
          ease: 'power2.inOut',
        },
        0 // Start at timeline position 0 (all simultaneous)
      );
    }

    // Step 2: Drop down extended attachment
    const selectedSlot = slots[selectedIndex];
    if (selectedSlot.attachment) {
      this.timeline.fromTo(
        selectedSlot.attachment,
        {
          y: -80,
          alpha: 0,
        },
        {
          y: 0,
          alpha: 1,
          duration: 0.25,
          ease: 'power2.out',
        },
        0.25 // Start after slots finish moving (sequence, not parallel)
      );
    }
  }
}
```

---

## Integration Points

### **Profile Selection Manager Changes**

**File**: `apps/web/src/lib/pixi/systems/profile-selection-manager.ts`

**Changes Required**:

1. **Add Animation Manager**:
```typescript
private animationManager: ProfileAnimationManager;

constructor(...) {
  // ... existing code
  this.animationManager = new ProfileAnimationManager(this.app.ticker);
}
```

2. **Update Selection Logic**:
```typescript
private handleSlotSelection(slotIndex: number): void {
  const previousIndex = this.state.selectedSlotIndex;

  // Only animate if selection changed
  if (previousIndex !== slotIndex) {
    // Start animation sequence
    this.animationManager.startSelectionAnimation(
      slotIndex,
      previousIndex,
      this.slots
    );
  }

  // Update state (same as before)
  this.state.selectedSlotIndex = slotIndex;

  // NOTE: Visual updates now happen in animation callbacks
  // Don't immediately update slot visuals - let animation drive it
}
```

3. **Store Original Positions**:
```typescript
private createSlot(slotNumber: number): SlotVisual {
  const slotVisual = {
    // ... existing properties
    originalX: centerX - gemMidpoint * scale, // Store original X position
    originalY: startY + (slotNumber - 1) * (nameplateHeight + slotGap), // Store original Y position
  };

  slotVisual.container.x = slotVisual.originalX;
  slotVisual.container.y = slotVisual.originalY;

  return slotVisual;
}
```

4. **Add Cleanup**:
```typescript
destroy(): void {
  // Cancel any ongoing animations
  this.animationManager.cancelAnimation();

  // ... existing cleanup code
}
```

---

## Edge Cases & Considerations

### **1. Rapid Selection Changes**
**Problem**: User rapidly changes selection before animation completes.

**Solution**: Cancel current animation and immediately snap to new selection:
```typescript
startSelectionAnimation(...) {
  // Always cancel existing animation first
  this.cancelAnimation();

  // Reset all slots to original positions
  this.resetSlotPositions();

  // Start new animation
  // ...
}
```

### **2. Selecting Above Slot**
**Problem**: User selects slot 1 when slot 2 was selected.

**Solution**: Only animate slots BELOW the selected one:
```typescript
const slotsToMove = slots.filter((slot, index) => index > selectedIndex);
if (slotsToMove.length === 0) {
  // No slots to move - just swap attachments instantly
  this.updateSlotVisualsInstantly();
}
```

### **3. Animation Performance**
**Problem**: Animations may stutter on slower devices.

**Solution**:
- Use PixiJS ticker for smooth frame sync
- Cache container positions during animation
- Use transform caching if needed: `container.cacheAsBitmap = true;`

### **4. Deselecting (Returning to Normal)**
**Problem**: What happens when slot is deselected?

**Solution**: Reverse animation:
```typescript
// Slots move back right (opposite of moving left)
// Extended attachment fades out and slides up
// Simple attachment fades in
```

---

## Testing Checklist

### **Visual Testing**
- [ ] Animation plays smoothly at 60fps
- [ ] No visual glitches or jankiness
- [ ] Timing feels natural and polished
- [ ] Easing curves feel right (not too fast, not too slow)

### **Interaction Testing**
- [ ] Rapid selection changes don't break animation
- [ ] Selecting slot 1 from slot 2 doesn't move slots unnecessarily
- [ ] Selecting slot 3 from slot 1 animates slot 2 and 3
- [ ] Mouse hover during animation doesn't interfere

### **Performance Testing**
- [ ] Animation runs at 60fps on target devices
- [ ] No memory leaks after repeated selections
- [ ] Ticker cleanup works properly

### **Edge Case Testing**
- [ ] Animation cancels properly on rapid changes
- [ ] Slots reset to correct positions after cancel
- [ ] Extended attachment doesn't persist when it shouldn't

---

## Implementation Phases

### **Phase 1: Basic Animation (Recommended Start)**
- Implement slot left movement only
- No attachment animation yet
- Verify smooth 60fps performance
- Test edge cases

### **Phase 2: Attachment Drop**
- Add extended attachment drop animation
- Sequence with slot movement
- Test timing and coordination

### **Phase 3: Polish & Refinement**
- Fine-tune easing curves
- Add optional fade-in/out for attachments
- Optimize performance if needed
- Add optional particle effects or glow

### **Phase 4: Reverse Animations**
- Implement deselection animations
- Slots move back right
- Attachment slides up and fades out

---

## Recommended Approach

**Start with Option 1 (Custom Animation Manager)**:
1. Simpler implementation
2. No external dependencies
3. Full control over timing
4. Easier to debug and understand
5. Can always migrate to GSAP later if needed

**Implementation Priority**:
1. ✅ Reduce attachment width by 10% (DONE)
2. ⏳ Implement basic slot movement animation
3. ⏳ Add attachment drop animation
4. ⏳ Test and polish timing
5. ⏳ Handle edge cases
6. ⏳ Add reverse animations

---

## Animation Constants (Tunable)

```typescript
// Animation durations (in milliseconds)
const SLIDE_LEFT_DURATION = 250;    // Slot movement duration
const DROP_DOWN_DURATION = 250;     // Attachment drop duration
const FADE_DURATION = 150;          // Fade in/out duration

// Animation distances (in pixels, unscaled)
const SLIDE_LEFT_DISTANCE = 300;    // How far slots move left
const DROP_DOWN_START_Y = -80;      // Attachment starts above nameplate

// Easing function names
const SLIDE_EASING = 'easeInOutCubic';  // Slot movement easing
const DROP_EASING = 'easeOutCubic';     // Attachment drop easing (gravity-like)

// Performance settings
const USE_CACHE_AS_BITMAP = false;  // Enable for performance if needed
const TARGET_FPS = 60;              // Animation target framerate
```

---

## Future Enhancements

**Possible additions after core implementation**:

1. **Sound Effects**: Subtle "whoosh" for slot movement, "thud" for attachment drop
2. **Particle Effects**: Magical sparkles when attachment appears
3. **Glow Effects**: Pulsing glow on selected slot during animation
4. **Spring Physics**: Replace easing curves with spring physics for more natural feel
5. **Stagger**: Slots below move with slight delay (cascading effect)

---

## Questions to Resolve

Before implementation, confirm:

1. **Should slots above selected slot also move?** (Current plan: No, only below)
2. **What happens when deselecting?** (Reverse animation or instant?)
3. **Should animation be skippable?** (Click again to skip to end state?)
4. **Accessibility concerns?** (Respect `prefers-reduced-motion`?)
5. **Should we animate on initial load?** (Probably not - only on user interaction)

---

**Next Step**: Review this plan with team, get approval on animation timing and behavior, then proceed with Phase 1 implementation.
