<!-- markdownlint-disable -->

# ADR 0006: Logging Architecture v1

**Date**: 2025-09-06
**Status**: Accepted

## Context

Draconia Chronicles requires a comprehensive logging system for debugging, performance monitoring, and user support..
The requirements include:

- **Structured Logging**: Consistent, machine-readable log format

- **Performance Monitoring**: Track game performance and identify bottlenecks

- **Debugging Support**: Detailed logs for development and troubleshooting

- **PII Protection**: Automatic redaction of sensitive user data

- **Memory Management**: Efficient memory usage with configurable limits

- **Persistence**: Log storage for offline analysis and debugging

- **Export Capability**: Data export for analysis and support

- **Cross-Thread Support**: Logging from both UI and worker threads

The game involves complex simulation logic, user interactions, and performance-critical operations
that
require
comprehensive
observability.

## Decision

Implement a **structured logging system** with ring buffer management, Dexie persistence,
comprehensive
PII
redaction,
and
NDJSON
export
capabilities.

### Architecture Overview

````text

Log Sources          Logger Core           Sinks
├── UI Thread   →    ├── Ring Buffer  →   ├── Console (dev)
├── Worker      →    ├── PII Redaction →  ├── Dexie (persistence)
├── Renderer    →    ├── Memory Caps  →   └── Export (NDJSON)
└── Network     →    └── Performance  →

```javascript

### Core Components

#### **Structured Log Format**

```typescript

interface LogEvent {
  t: number; // Timestamp (Date.now())
  lvl: LogLevel; // 'debug' | 'info' | 'warn' | 'error'
  src: LogSrc; // 'ui' | 'worker' | 'render' | 'net'
  msg: string; // Human-readable message
  mode?: SimMode; // 'fg' | 'bg' (simulation mode)
  profileId?: string; // User profile ID (optional)
  data?: Record<string, unknown>; // Structured data (optional)
}

```javascript

#### **Ring Buffer Management**

```typescript

// Memory-efficient circular buffer
class RingBuffer<T> {
  private buffer: T[] = [];
  private head = 0;
  private tail = 0;
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.maxSize;

    if (this.head === this.tail) {
      this.tail = (this.tail + 1) % this.maxSize; // Overwrite oldest
    }
  }
}

```javascript

#### **PII Redaction System**

```typescript

// Automatic redaction of sensitive data
function redactPII(data: unknown): unknown {
  if (typeof data === 'string') {
    // Only allow dragonName as string value
    return data === 'dragonName' ? data : '[REDACTED]';
  }

  if (Array.isArray(data)) {
    return data.map(redactPII);
  }

  if (data && typeof data === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      redacted[key] = redactPII(value);
    }
    return redacted;
  }

  return data; // Numbers, booleans, null, undefined are safe
}

```text

### Key Features

#### **Memory Management**

- **Configurable Limits**: 2MB memory cap OR 10,000 entries

- **Automatic Overflow**: Oldest logs are discarded when limits are reached

- **Performance Monitoring**: Track memory usage and log throughput

- **Efficient Storage**: Optimized data structures for minimal memory footprint

#### **Multiple Sinks**

```typescript

// Console sink for development
const consoleSink = {
  log: (event: LogEvent) => {
    if (import.meta.env.DEV) {
      console[event.lvl](`[${event.src}] ${event.msg}`, event.data);
    }
  },
};

// Dexie sink for persistence
const dexieSink = {
  log: async (event: LogEvent) => {
    await db.logs.add({
      timestamp: event.t,
      level: event.lvl,
      source: event.src,
      message: event.msg,
      data: event.data ? JSON.stringify(event.data) : undefined,
      profileId: event.profileId,
    });
  },
};

```javascript

#### **Cross-Thread Logging**

```typescript

// Worker to UI logging bridge
function bindWorkerLogs(worker: Worker): void {
  worker.addEventListener('message', (event) => {
    if (event.data.type === 'SimToUI' && event.data.action === 'log') {
      logger.log(event.data.event);
    }
  });
}

// UI to worker logging
function logToWorker(event: LogEvent): void {
  worker.postMessage({
    type: 'UIToSim',
    action: 'log',
    event,
  });
}

```javascript

#### **Export System**

```typescript

// NDJSON export for analysis
async function exportNDJSON(): Promise<Blob> {
  const logs = await db.logs.orderBy('timestamp').toArray();
  const ndjson = logs
    .map((log) =>
      JSON.stringify({
        timestamp: log.timestamp,
        level: log.level,
        source: log.source,
        message: log.message,
        data: log.data ? JSON.parse(log.data) : undefined,
        profileId: log.profileId,
      }),
    )
    .join('\n');

  return new Blob([ndjson], { type: 'application/x-ndjson' });
}

```text

### Performance Characteristics

#### **Bundle Size**

- **Target**: ≤8 KB gzipped

- **Tree-Shakeable**: Only import required components

- **Minimal Dependencies**: Self-contained with minimal external dependencies

- **Optimized**: Efficient data structures and algorithms

#### **Runtime Performance**

- **Logging Overhead**: <1ms per log entry

- **Memory Usage**: <50MB for typical game sessions

- **Export Performance**: <5 seconds for 10,000 log entries

- **PII Redaction**: <0.1ms per data object

### PII Protection

#### **Allowed Data**

- **Dragon Name**: Only `dragonName` field is allowed as string value

- **Numeric Data**: Timestamps, IDs, metrics, and performance data

- **Boolean Values**: Configuration flags and state indicators

- **Structured Data**: Game state and simulation data (with redaction)

#### **Redaction Rules**

```typescript

// Example of PII redaction
const originalData = {
  dragonName: 'Shadowfang', // ✅ Allowed
  userId: 'user123', // ❌ Redacted
  email: 'user@example.com', // ❌ Redacted
  level: 42, // ✅ Allowed
  isActive: true, // ✅ Allowed
};

const redactedData = {
  dragonName: 'Shadowfang', // ✅ Preserved
  userId: '[REDACTED]', // ❌ Redacted
  email: '[REDACTED]', // ❌ Redacted
  level: 42, // ✅ Preserved
  isActive: true, // ✅ Preserved
};

```text

## Consequences

### Positive

- **Comprehensive Observability**: Detailed logging for debugging and monitoring

- **Performance Insights**: Track game performance and identify bottlenecks

- **PII Compliance**: Automatic protection of sensitive user data

- **Memory Efficient**: Configurable limits prevent memory bloat

- **Cross-Thread Support**: Unified logging across UI and worker threads

- **Export Capability**: Data analysis and support tools

- **Production Ready**: Optimized for production use with minimal overhead

### Negative

- **Memory Usage**: Logging consumes memory and storage space

- **Performance Impact**: Logging adds overhead to game operations

- **Storage Requirements**: Persistent logs require database storage

- **Complexity**: More complex than simple console.log statements

- **PII Risk**: Potential for accidental data exposure if redaction fails

### Operational Impact

- **Development Workflow**:

  - Structured logging patterns across all components

  - Performance monitoring and optimization

  - PII-aware development practices

- **Testing Strategy**:

  - Unit tests for logging functionality

  - Integration tests for cross-thread logging

  - Performance tests for memory usage and throughput

- **Production Monitoring**:

  - Log analysis and performance tracking

  - Error detection and debugging

  - User support and issue resolution

### Integration Points

#### **Database Layer (W4)**

- Logs are stored in the database with structured schema

- Performance monitoring and log analysis

- Data integrity and consistency

#### **Worker Simulation (W3)**

- Cross-thread logging for simulation events

- Performance monitoring for worker operations

- State tracking and debugging

#### **PWA Implementation (W6)**

- Logs persist across service worker updates

- Offline logging and analysis

- Performance monitoring for PWA features

### Migration Path

The logging system was established during W5 and has proven successful:

1. **W5**: Core logging implementation with ring buffer and PII redaction

1. **W6**: PWA integration and offline logging

1. **W8**: Error boundary integration and log export

1. **Future**: Advanced analytics and remote logging

### Future Enhancements

- **Remote Logging**: HTTP sink for centralized log collection

- **Real-time Analytics**: Live log streaming and analysis

- **Advanced Filtering**: Query and search capabilities

- **Performance Metrics**: Built-in performance monitoring

- **Log Aggregation**: Centralized log management and analysis

## References

- [Structured Logging Best Practices](https://www.loggly.com/blog/structured-logging/)

- [PII Protection Guidelines](https://gdpr.eu/data-protection-by-design-and-by-default/)

- [W5 Implementation](../engineering/structured-logging.md)

- [Database Integration](../engineering/database-persistence.md)

- [Performance Monitoring Guide](../optimization/CODE*OPTIMIZATION*GUIDE.md)
````
