<!-- markdownlint-disable -->

# ADR 0005: Database Choice - Dexie v1

**Date**: 2025-09-06
**Status**: Accepted

## Context

Draconia Chronicles requires a client-side database solution for persistent game state,
save
data,
and
logging..
The requirements include:

- **Client-Side Storage**: No server dependency for core game functionality

- **Offline-First**: Full functionality without network connectivity

- **Data Integrity**: Reliable storage with validation and error handling

- **Performance**: Fast read/write operations for real-time game updates

- **Schema Evolution**: Support for game updates and data migration

- **Export/Import**: Data portability for backup and transfer

- **Multiple Profiles**: Support for multiple player profiles

- **Atomic Operations**: Transaction-safe save operations

The game needs to store player progress, simulation state, settings, and logs while
maintaining
data
consistency
and
supporting
future
updates.

## Decision

Implement **Dexie (IndexedDB wrapper) v1** as the primary database solution with Zod
validation,
atomic
operations,
and
comprehensive
migration
support.

### Technology Choice: Dexie

- **IndexedDB Wrapper**: Provides a more developer-friendly API than raw IndexedDB

- **TypeScript Support**: Excellent TypeScript integration with type safety

- **Performance**: Optimized for client-side storage with efficient indexing

- **Browser Support**: Universal support across modern browsers

- **Schema Management**: Built-in versioning and migration capabilities

- **Transaction Support**: ACID-compliant transactions for data consistency

### Database Schema v1

````typescript

// Core tables
interface DatabaseSchema {
  saves: {
    id?: number;
    profileId: string;
    version: string;
    data: string; // JSON string of save data
    checksum: string; // SHA-256 hash for integrity
    createdAt: number; // Unix timestamp
  };

  meta: {
    key: string; // Primary key
    value: string; // JSON string of metadata
    updatedAt: number; // Unix timestamp
  };

  logs: {
    id?: number;
    timestamp: number; // Unix timestamp
    level: LogLevel; // 'debug' | 'info' | 'warn' | 'error'
    source: LogSrc; // 'ui' | 'worker' | 'render' | 'net'
    message: string; // Human-readable message
    data?: string; // JSON string of structured data
    profileId?: string; // User profile ID
  };
}

```text

### Key Features

#### **Atomic Operations**

```typescript

// Transaction-safe save operations
async function saveGameData(profileId: string, data: GameState): Promise<void> {
  await db.transaction('rw', [db.saves, db.meta], () => {
    return db.saves
      .add({
        profileId,
        version: '1.0.0',
        data: JSON.stringify(data),
        checksum: await generateChecksum(data),
        createdAt: Date.now(),
      })
      .then((saveId) => {
        return db.meta.put({
          key: `active*save*${profileId}`,
          value: JSON.stringify({ saveId, timestamp: Date.now() }),
          updatedAt: Date.now(),
        });
      });
  });
}

```javascript

#### **Data Validation with Zod**

```typescript

// Runtime type safety for all data structures
const SaveDataSchema = z.object({
  profileId: z.string(),
  version: z.string(),
  data: z.string(),
  checksum: z.string(),
  createdAt: z.number(),
});

const validatedData = SaveDataSchema.parse(saveData);

```javascript

#### **Migration System**

```typescript

// Versioned schema evolution
const db = new Dexie('DraconiaChronicles');
db.version(1).stores({
  saves: '++id, profileId, version, createdAt',
  meta: 'key',
  logs: '++id, timestamp, level, source',
});

// Future migrations
db.version(2).stores({
  saves: '++id, profileId, version, createdAt, checksum', // Added checksum
  meta: 'key',
  logs: '++id, timestamp, level, source, profileId', // Added profileId
});

```javascript

#### **Export/Import System**

```typescript

// Data portability with integrity validation
async function exportProfile(profileId: string): Promise<Blob> {
  const saves = await db.saves.where('profileId').equals(profileId).toArray();
const meta = await db.meta.where('key').startsWith(`active*save*${profileId}`).toArray();

  const exportData = {
    version: '1.0.0',
    profileId,
    saves,
    meta,
    exportedAt: Date.now(),
    checksum: await generateChecksum({ saves, meta }),
  };

  return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
}

```javascript

### Performance Characteristics

#### **Storage Limits**

- **Browser Quota**: Typically 50MB-1GB depending on browser and device

- **Data Compression**: JSON compression for large save files

- **Cleanup**: Automatic pruning of old saves and logs

- **Indexing**: Optimized indexes for common query patterns

#### **Operation Performance**

- **Read Operations**: <10ms for typical queries

- **Write Operations**: <50ms for atomic transactions

- **Bulk Operations**: Batch processing for large data sets

- **Memory Usage**: <100MB for typical game data

## Consequences

### Positive

- **Offline-First**: Complete functionality without network dependency

- **Data Integrity**: ACID transactions and checksum validation

- **Type Safety**: Full TypeScript integration with runtime validation

- **Performance**: Fast local storage with efficient indexing

- **Portability**: Export/import system for data backup and transfer

- **Scalability**: Supports multiple profiles and large datasets

- **Migration Support**: Built-in schema evolution capabilities

### Negative

- **Browser Dependency**: Relies on IndexedDB support (universal in modern browsers)

- **Storage Limits**: Subject to browser storage quotas

- **Complexity**: More complex than simple localStorage

- **Debugging**: IndexedDB debugging can be challenging

- **Data Loss Risk**: Client-side storage can be lost if browser data is cleared

### Operational Impact

- **Development Workflow**:

  - Database schema changes require migration scripts

  - Data validation with Zod schemas

  - Transaction testing for atomic operations

- **Testing Strategy**:

  - Unit tests with fake-indexeddb for Node.js environment

  - Integration tests for cross-package database usage

  - Performance tests for large datasets

- **Error Handling**:

  - Transaction rollback on failures

  - Data corruption detection and recovery

  - Graceful degradation when storage is unavailable

### Integration Points

#### **Worker Simulation (W3)**

- Worker state is persisted via database transactions

- Save/load operations coordinate between UI and worker

- State restoration ensures simulation continuity

#### **Logging System (W5)**

- Logs are stored in the database with structured schema

- Performance monitoring and log analysis

- PII redaction before storage

#### **PWA Implementation (W6)**

- Database persists across service worker updates

- Offline functionality relies on local storage

- Data synchronization when network is available

### Migration Path

The database system was established during W4 and has proven successful:

1. **W4**: Core database implementation with Dexie and Zod

1. **W5**: Integration with logging system

1. **W6**: PWA integration and offline support

1. **Future**: Advanced features like data synchronization and cloud backup

### Future Enhancements

- **Data Synchronization**: Cloud backup and multi-device sync

- **Advanced Queries**: Complex query capabilities for analytics

- **Compression**: Data compression for large save files

- **Encryption**: Optional encryption for sensitive data

- **Performance Optimization**: Advanced indexing and caching strategies

## References

- [Dexie Documentation](https://dexie.org/)

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

- [Zod Validation](https://zod.dev/)

- [W4 Implementation](../engineering/database-persistence.md)

- [Database Testing Strategy](../engineering/testing.md)

````
