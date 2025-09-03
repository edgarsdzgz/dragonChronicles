# Structured Logging System

**Workpack**: P0-W5 — Logging v1  
**Status**: ✅ Complete  
**Package**: `@draconia/logger`

## Overview

The structured logging system provides a production-ready, high-performance logging infrastructure for Draconia Chronicles v2.0.0. It features a tiny, tree-shakeable API (≤8 KB gz), in-memory ring buffer management, Dexie persistence, and comprehensive PII redaction.

## Architecture

### Core Components

```
@draconia/logger/
├── types.ts           # Core interfaces and types
├── index.ts           # Main entry point and exports
├── ring.ts            # Ring buffer implementation and factory
├── sinks/             # Output destinations
│   ├── console.ts     # Development console sink
│   └── dexie.ts       # IndexedDB persistence sink
├── util/              # Utility functions
│   ├── bytes.ts       # JSON size approximation
│   └── ndjson.ts      # NDJSON conversion
├── redact.ts          # PII redaction logic
└── export.ts          # Export button utilities
```

### Design Principles

1. **Tiny Footprint**: ≤8 KB gzipped bundle size
2. **Tree-Shakeable**: Only import what you use
3. **Memory Efficient**: Configurable byte and entry caps
4. **PII Safe**: Automatic redaction of sensitive data
5. **Performance Focused**: Ring buffer with batch persistence

## API Reference

### Core Types

```typescript
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSrc = 'ui' | 'worker' | 'render' | 'net';
export type SimMode = 'fg' | 'bg';

export type LogEvent = {
  t: number; // Timestamp (Date.now())
  lvl: LogLevel; // Log level
  src: LogSrc; // Source component
  msg: string; // Human-readable message
  mode?: SimMode; // Simulation mode (optional)
  profileId?: string; // User profile ID (optional)
  data?: Record<string, unknown>; // Structured data (optional)
};

export interface Logger {
  log(e: LogEvent): void;
  exportNDJSON(): Promise<Blob>;
  clear(): Promise<void>;
  enableConsole(enable: boolean): void;
}
```

### Factory Function

```typescript
import { createLogger } from '@draconia/logger';

const logger = createLogger({
  maxBytes?: number;        // Memory cap in bytes (default: 1MB)
  maxEntries?: number;      // Entry cap (default: 1000)
  devConsole?: boolean;     // Enable console output (default: false)
  dexie?: DexieSink | null; // Dexie persistence sink (default: null)
});
```

## Configuration

### Memory Management

```typescript
// 2MB memory cap, 10k entries
const logger = createLogger({
  maxBytes: 2 * 1024 * 1024,
  maxEntries: 10_000,
});
```

### Sink Configuration

```typescript
import { createDexieSink } from '@draconia/logger/src/sinks/dexie';

// Dexie sink with 1s batch flush, 10k row cap
const dexieSink = createDexieSink(1000, 10_000);

const logger = createLogger({
  dexie: dexieSink,
  devConsole: import.meta.env.DEV,
});
```

## Usage Examples

### Basic Logging

```typescript
import { logger } from '@/lib/logging/logger';

// Simple log
logger.log({
  t: Date.now(),
  lvl: 'info',
  src: 'ui',
  msg: 'User clicked start button',
});

// With simulation context
logger.log({
  t: Date.now(),
  lvl: 'debug',
  src: 'worker',
  msg: 'Simulation step completed',
  mode: 'fg',
  data: { frame: 1234, fps: 60 },
});
```

### Worker Integration

```typescript
// In worker
self.postMessage({
  type: 'SimToUI',
  action: 'log',
  event: {
    t: Date.now(),
    lvl: 'info',
    src: 'worker',
    msg: 'Background simulation active',
    mode: 'bg',
  },
});

// In main thread
import { bindWorkerLogs } from '@/lib/logging/worker-bridge';
bindWorkerLogs(worker);
```

### Export and Analysis

```typescript
// Export logs as NDJSON
const blob = await logger.exportNDJSON();
const url = URL.createObjectURL(blob);

// Download
const a = document.createElement('a');
a.href = url;
a.download = `logs-${Date.now()}.ndjson`;
a.click();
```

## PII Redaction

### Allowed Fields

Only `dragonName` is allowed as a string value in the `data` field:

```typescript
// ✅ Allowed
logger.log({
  t: Date.now(),
  lvl: 'info',
  src: 'ui',
  msg: 'Dragon created',
  data: { dragonName: 'Shadowfang' },
});

// ❌ Redacted
logger.log({
  t: Date.now(),
  lvl: 'info',
  src: 'ui',
  msg: 'User action',
  data: {
    dragonName: 'Shadowfang', // ✅ Allowed
    userId: 'user123', // ❌ Redacted
    email: 'user@example.com', // ❌ Redacted
  },
});
```

### Redaction Rules

- **Strings**: Only `dragonName` allowed, all others converted to `'[REDACTED]'`
- **Numbers**: Allowed (timestamps, IDs, metrics)
- **Booleans**: Allowed
- **Objects**: Recursively processed
- **Arrays**: Recursively processed
- **Null/Undefined**: Preserved

## Performance Monitoring

### Development Lab

Access the performance lab at `/dev/logs` to:

- Configure log rate and duration
- Start/stop logging sessions
- Export logs for analysis
- Monitor memory usage

### CSV Conversion

Use the provided script to convert NDJSON to CSV:

```bash
node scripts/logs-perf-to-csv.mjs logs.ndjson logs.csv
```

## Integration Points

### Database Schema

Logs are stored in the `logs` table with the following structure:

```typescript
interface LogRow {
  id?: number;
  timestamp: number; // Unix timestamp
  level: LogLevel; // Log level
  source: LogSrc; // Source component
  message: string; // Human-readable message
  data?: string; // JSON string of structured data
  profileId?: string; // User profile ID
}
```

### Worker Protocol

Logs from workers are transmitted via the `SimToUI` protocol:

```typescript
interface SimToUI {
  type: 'SimToUI';
  action: 'log';
  event: LogEvent;
}
```

## Testing

### Test Coverage

- **Unit Tests**: Core functionality, memory limits, export format
- **Integration Tests**: Logger ↔ simulation wiring
- **Database Tests**: Dexie sink integration
- **Performance Tests**: Memory usage and throughput

### Test Commands

```bash
# Run all tests
pnpm run test:all

# Run specific test categories
pnpm run test:node        # Node.js tests
pnpm run test:vitest      # Vitest tests
pnpm run test:vitest:render # Render tests (JSDOM)
```

## Production Considerations

### Bundle Size

- **Target**: ≤8 KB gzipped
- **Tree-shaking**: Only import required components
- **Dependencies**: Minimal external dependencies

### Memory Management

- **Ring Buffer**: Automatic overflow handling
- **Configurable Caps**: Adjust based on device capabilities
- **Batch Persistence**: Minimize IndexedDB writes

### PII Compliance

- **Automatic Redaction**: No sensitive data in logs
- **Audit Trail**: All redaction actions logged
- **Export Safety**: Clean data for analysis

## Future Enhancements

### Planned Features

1. **Remote Logging**: HTTP sink for centralized logging
2. **Log Aggregation**: Real-time log streaming
3. **Advanced Filtering**: Query and search capabilities
4. **Performance Metrics**: Built-in performance monitoring

### Migration Path

The current v1 implementation provides a stable foundation for future enhancements while maintaining backward compatibility through the core `Logger` interface.

## Related Documentation

- [Database Persistence](./database-persistence.md) - W4 implementation
- [Worker Simulation](../overview/README.md#worker-simulation) - W3 implementation
- [Testing Strategy](./testing.md) - Test infrastructure
- [TypeScript Standards](./typescript.md) - Type safety enforcement
