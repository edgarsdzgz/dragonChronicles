<!-- markdownlint-disable -->

# ADR 0004: Worker Simulation Architecture

**Date**: 2025-09-06
**Status**: Accepted

## Context

Draconia Chronicles requires a game simulation system that can run continuously without
blocking
the
main
UI
thread..
The simulation needs to:

- **Maintain 60fps UI**: UI rendering must not be blocked by game logic

- **Offline Continuation**: Simulation should continue when the browser tab is not active

- **Deterministic Results**: Same inputs should produce identical outputs for save consistency

- **Performance**: Handle complex game calculations without impacting user experience

- **Background Processing**: Continue simulation during offline periods

The game involves continuous spawning, projectile physics, DPS/HP calculations, and
progression
systems
that
could
easily
block
the
main
thread
if
implemented
synchronously.

## Decision

Implement a **Web Worker-based simulation system** with a structured communication
protocol,
fixed-timestep
clock,
and
automatic
recovery
mechanisms.

### Architecture Overview

````javascript

Main Thread (UI)          Web Worker (Simulation)
├── PixiJS Renderer  ←→   ├── Game Logic Engine
├── User Input      ←→   ├── Physics Simulation
├── Save System     ←→   ├── Progression Systems
└── Logging         ←→   └── Background Processing

```javascript

### Core Components

#### **Worker Protocol v1**

```typescript

// UI to Worker messages
interface UIToSim {
  type: 'UIToSim';
  action: 'init' | 'tick' | 'input' | 'pause' | 'resume';
  data?: any;
  timestamp: number;
}

// Worker to UI messages
interface SimToUI {
  type: 'SimToUI';
  action: 'state' | 'log' | 'error' | 'ready';
  data?: any;
  timestamp: number;
}

```text

#### **Fixed-Timestep Clock**

- **Target FPS**: 60fps (16.67ms per frame)

- **Deterministic**: Same input sequence produces identical results

- **Catch-up Logic**: Handles frame drops and variable timing

- **Background Mode**: Continues simulation when tab is inactive

#### **Simulation Modes**

- **Foreground (fg)**: Full simulation with UI updates

- **Background (bg)**: Simplified simulation for offline periods

- **Auto**: Automatically switches based on visibility API

### Implementation Details

#### **Worker Creation and Management**

```typescript

// Worker lifecycle management
class SimulationWorker {
  private worker: Worker | null = null;
  private isRunning = false;

  async start(): Promise<void> {
    this.worker = new Worker('/workers/sim.js');
    this.setupMessageHandlers();
    await this.sendMessage({ type: 'UIToSim', action: 'init' });
  }

  private setupMessageHandlers(): void {
    this.worker?.addEventListener('message', (event) => {
      this.handleSimMessage(event.data);
    });
  }
}

```text

#### **State Synchronization**

- **Bidirectional**: UI and worker can both initiate state changes

- **Conflict Resolution**: Worker state takes precedence for simulation data

- **Save Integration**: Worker state is captured for persistence

- **Recovery**: Automatic state restoration on worker restart

#### **Error Handling and Recovery**

- **Worker Crashes**: Automatic restart with state restoration

- **Message Errors**: Graceful degradation and error reporting

- **Performance Monitoring**: Detection of simulation lag and recovery

### Performance Characteristics

#### **Target Performance**

- **UI Thread**: Maintains 60fps rendering

- **Worker Thread**: 60fps simulation (16.67ms per frame)

- **Memory Usage**: <50MB for simulation state

- **CPU Usage**: <30% on modern devices

#### **Optimization Strategies**

- **Object Pooling**: Reuse game objects to reduce GC pressure

- **Batch Processing**: Group similar operations for efficiency

- **LOD Systems**: Reduce simulation complexity when appropriate

- **Background Throttling**: Lower simulation rate when tab is inactive

## Consequences

### Positive

- **UI Responsiveness**: Main thread remains free for rendering and user input

- **Offline Capability**: Simulation continues when browser tab is not active

- **Deterministic**: Consistent results enable reliable save/load functionality

- **Scalability**: Can handle complex game logic without performance degradation

- **Isolation**: Worker crashes don't affect the main application

- **Background Processing**: Continues simulation during offline periods

### Negative

- **Complexity**: More complex architecture than single-threaded approach

- **Message Overhead**: Communication between threads has performance cost

- **State Synchronization**: Potential for state inconsistencies between threads

- **Debugging**: More difficult to debug cross-thread issues

- **Browser Support**: Requires Web Worker support (universal in modern browsers)

### Operational Impact

- **Development Workflow**:

  - Separate build process for worker code

  - Cross-thread debugging tools and techniques

  - State management across thread boundaries

- **Testing Strategy**:

  - Unit tests for worker logic in isolation

  - Integration tests for message passing

  - Performance tests for frame rate maintenance

- **Error Handling**:

  - Worker crash detection and recovery

  - Message validation and error reporting

  - Performance monitoring and alerting

### Integration Points

#### **Database Layer (W4)**

- Worker state is captured and persisted via IndexedDB

- Save/load operations coordinate between UI and worker

- State restoration ensures simulation continuity

#### **Logging System (W5)**

- Worker logs are transmitted to main thread for persistence

- Performance metrics are collected and analyzed

- Error reporting includes worker context

#### **PWA Implementation (W6)**

- Service worker coordinates with simulation worker

- Offline simulation continues during network outages

- Update management preserves simulation state

### Future Enhancements

- **Multi-Worker**: Distribute simulation across multiple workers

- **WebAssembly**: Use WASM for performance-critical calculations

- **Shared Memory**: Use SharedArrayBuffer for zero-copy communication

- **Advanced Recovery**: More sophisticated state recovery mechanisms

## References

- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web*Workers*API)

- [Game Loop Patterns](https://gameprogrammingpatterns.com/game-loop.html)

- [W3 Implementation](../engineering/development-workflow.md)

- [Performance Optimization Guide](../optimization/CODE_OPTIMIZATION_GUIDE.md)

````
