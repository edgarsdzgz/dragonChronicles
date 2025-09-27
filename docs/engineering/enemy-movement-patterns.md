# Enemy Movement Pattern System

## Overview

The enemy movement pattern system allows different enemy types to have unique movement
behaviors
that
synchronize
with
their
animation
frames..
This creates more dynamic and visually interesting enemy movement that enhances the game's
visual
appeal.

## Architecture

### Core Components

1. **MovementPattern Interface**: Defines the movement behavior for an enemy type

1. **EnemyAnimator Enhancement**: Tracks animation frames and provides speed multipliers

1. **Movement Integration**: Real-time speed adjustment based on animation frames

1. **Smooth Transitions**: Gradual speed changes to avoid jarring movement

### MovementPattern Configuration

````typescript

interface MovementPattern {
  frameSpeedMultipliers: Record<EnemyFrame, number>;
  smoothTransitions: boolean;
  transitionDuration: number; // ms for smooth speed changes
  frameDurationExtensions?: Record<EnemyFrame, number>; // Extra frames to hold this speed
}

```text

## Implementation Details

### Mantair Corsair Pattern

The mantair corsair uses a unique "glide, glide, glide, THRUST-and-glide" pattern that
creates
realistic
flying
movement:

- **Frames 1-3 (idle, fly*1, fly*2)**: 50% speed (0.5x multiplier) - continuous glide approach

- **Frame 4 (fly_3)**: Thrust-and-glide sequence over 6 total frames

  - **Start**: 200% speed (2.0x multiplier) - explosive thrust

  - **End**: 50% speed (0.5x multiplier) - gradual glide

  - **Duration**: 6 frames total (1 original + 5 extended frames)

- **Smooth Transitions**: 75ms transition duration for dramatic effect

- **Speed Decay**: Gradual slowdown from thrust to glide eliminates "worming" effect

- **Movement Continuity**: Glide frames match thrust end speed for seamless movement

- **Attack Behavior**: Holds explosive frame when in attack range, creating "hover-and-fire" effect

```typescript

const mantairCorsairPattern: MovementPattern = {
  frameSpeedMultipliers: {
    idle: 0.5,    // Match glide end speed for continuity
    fly_1: 0.5,   // Match glide end speed for continuity
    fly_2: 0.5,   // Match glide end speed for continuity
    fly_3: 2.0    // 200% speed on the "explosive expansion" frame
  },
  smoothTransitions: true,
  transitionDuration: 75, // Slightly longer transition for dramatic effect
  frameDurationExtensions: {
    idle: 0,      // Normal duration
    fly_1: 0,     // Normal duration
    fly_2: 0,     // Normal duration
    fly_3: 5      // Hold lunge for 5 extra frames (total 6 frames of thrust-and-glide)
  },
  frameSpeedDecay: {
idle: { startMultiplier: 0.5, endMultiplier: 0.5 }, // No decay - maintain glide speed
fly_1: { startMultiplier: 0.5, endMultiplier: 0.5 }, // No decay - maintain glide speed
fly_2: { startMultiplier: 0.5, endMultiplier: 0.5 }, // No decay - maintain glide speed
fly_3: { startMultiplier: 2.0, endMultiplier: 0.5 } // Decay from 200% to 50% over 6
frames
  }
};

```text

### Default Pattern

Other enemies (like swarm) use smooth forward movement:

```typescript

const defaultMovementPattern: MovementPattern = {
  frameSpeedMultipliers: {
    idle: 1.0,
    fly_1: 1.0,
    fly_2: 1.0,
    fly_3: 1.0
  },
  smoothTransitions: true,
  transitionDuration: 50 // 50ms transition
};

```javascript

## Technical Implementation

### EnemyAnimator Enhancements

The `EnemyAnimator` class has been enhanced with:

- **Frame Change Callbacks**: Notify movement system when animation frames change

- **Speed Multiplier Tracking**: Real-time speed multiplier calculation with smooth transitions

- **Transition Management**: Cubic easing for natural speed changes

### Movement Integration

The movement system:

1. **Frame Synchronization**: Gets current speed multiplier from animator

1. **Real-time Updates**: Applies speed multiplier to movement calculations

1. **Smooth Transitions**: Uses cubic easing for natural speed changes

1. **Debug Information**: Tracks and displays current speed multipliers

### Speed Calculation

```typescript

// Get current speed multiplier from animator (with smooth transitions)
const currentSpeedMultiplier = enemy.animator.getCurrentSpeedMultiplier();
const moveDistance = ENEMY*MOVE*SPEED * currentSpeedMultiplier * (deltaTime / 1000);

```javascript

### Frame Duration Extensions

The system supports extending the duration of specific animation frames to create
sustained
movement
effects:

- **Extension Tracking**: Each frame can specify how many extra frames to hold its speed

- **Animation Pause**: During extended frames, the animation stays on the current frame

- **Speed Maintenance**: The movement speed continues at the extended frame's multiplier

- **Debug Logging**: Console shows frame extension countdown

This allows for dramatic effects like the corsair's sustained "lunge" forward on its
explosive
frame.

### Speed Decay During Extensions

For more realistic movement, the system supports gradual speed changes during extended
frames:

- **Decay Configuration**: Each frame can specify start and end speed multipliers

- **Linear Interpolation**: Speed gradually changes from start to end over the extension duration

- **Real-time Updates**: Movement speed updates every frame during the decay

- **Smooth Glide Effects**: Creates natural "thrust-and-glide" movement patterns

This eliminates jarring "worming" effects and creates more believable creature movement.

### Attack Range Behavior

For enemies with special movement patterns, the system can modify behavior when in attack
range:

- **Frame Holding**: Enemies can hold specific frames when in attack range

- **Hover-and-Fire**: Creates a "hovering" effect while maintaining attack capability

- **Dynamic Animation**: Resumes normal animation when moving out of range

- **Context-Aware**: Different behaviors for different enemy types

Example: Mantair corsairs hold their explosive frame when in attack range, creating a
dramatic
"hover-and-fire"
effect.

## Usage

### Adding New Movement Patterns

1. **Define Pattern**: Create a new `MovementPattern` configuration

1. **Add to Registry**: Include in `enemyMovementPatterns` object

1. **Test Behavior**: Verify smooth transitions and visual appeal

### Example: Creating a "Stutter" Pattern

```typescript

const stutterPattern: MovementPattern = {
  frameSpeedMultipliers: {
    idle: 0.5,    // Slow start
    fly_1: 1.5,   // Speed up
    fly_2: 0.3,   // Slow down
    fly_3: 1.8    // Fast finish
  },
  smoothTransitions: true,
  transitionDuration: 60
};

```javascript

## Benefits

1. **Visual Interest**: Unique movement patterns make enemies more engaging

1. **Animation Sync**: Movement matches visual animation for cohesive experience

1. **Extensibility**: Easy to add new patterns for different enemy types

1. **Smooth Experience**: Gradual transitions prevent jarring movement

1. **Performance**: Efficient real-time calculation with minimal overhead

## Future Enhancements

- **Pattern Sequences**: Complex multi-phase movement patterns

- **Environmental Factors**: Speed adjustments based on terrain/conditions

- **Player Proximity**: Dynamic speed changes based on distance to player

- **Animation Events**: Trigger special effects on frame changes

## Testing

The system includes debug information showing:

- Current speed multipliers for each enemy

- Frame change notifications in console

- Real-time speed adjustments in UI

Access the dragon animation test page at `/dev/dragon-animated` to test movement patterns.

````
