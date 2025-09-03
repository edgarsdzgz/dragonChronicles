<!-- markdownlint-disable -->

# Database Persistence Layer

This document describes the database persistence layer implementation for Draconia Chronicles v2.0.0,
including the Dexie (IndexedDB) integration, test suite, and current implementation status.

## Architecture Overview

### Core Components

- **Database**: Dexie (IndexedDB) with versioned schema
- **Validation**: Zod schemas for data integrity
- **Testing**: Vitest with fake-indexeddb for Node.js environment
- **Migration**: Structured schema evolution with rollback support

### Schema Design

```typescript
// Core tables
saves: '++id, profileId, version, createdAt'; // Save data with versioning
meta: 'key'; // Metadata and pointers
logs: '++id, timestamp, level, source'; // Structured logging
```

## Implementation Status

### ✅ Completed (Step 7 - Test Suite)

#### **Test Infrastructure**

- **Vitest Configuration**: `configs/vitest/vitest.db.config.ts`
- **Test Setup**: `tests/db/setup.ts` with IndexedDB polyfill
- **Test Files**: 4 comprehensive test suites
  - `tests/db/schema.spec.ts` - Zod validation tests
  - `tests/db/atomic.spec.ts` - Atomic write operations
  - `tests/db/export-import.spec.ts` - Data portability
  - `tests/db/migrate.spec.ts` - Schema evolution

#### **Core Functionality**

- **Atomic Writes**: Transaction-consistent save operations
- **Active Profile Management**: Profile pointer tracking
- **Backup Pruning**: Configurable retention (default: 3 backups)
- **Checksum Validation**: Data integrity verification
- **Error Handling**: Comprehensive error reporting

#### **Test Results** (Latest Run)

```
Test Files: 1 failed (1)
Tests: 2 failed | 10 passed (12)
```

**Passing Tests (10/12)**:

- ✅ `should write save data atomically`
- ✅ `should update active profile pointer`
- ✅ `should handle concurrent writes to different profiles`
- ✅ `should maintain data integrity during transaction failures`
- ✅ `should return the most recent save for a profile`
- ✅ `should return null for non-existent profile`
- ✅ `should handle profile with multiple saves correctly`
- ✅ `should handle database corruption gracefully`
- ✅ `should preserve W3 time accounting fields during atomic writes`
- ✅ `should handle W3 time accounting updates correctly`

**Failing Tests (2/12)**:

- ❌ `should prune old saves to keep only 3 backups` - Test isolation issue
- ❌ `should maintain referential integrity between saves and meta tables` - Test isolation issue

### 🔄 In Progress

#### **Test Isolation Fixes**

- **Issue**: Database state persisting between tests
- **Solution**: Implement `clearDatabase()` function
- **Status**: Implementation ready, needs integration

#### **Export/Import Functionality** (17 tests failing)

- **Issue**: `exportAllProfiles` failing with "Cannot read properties of undefined (reading 'length')"
- **Status**: Core implementation exists, needs debugging

#### **Migration System** (8 tests failing)

- **Issue**: Field name mismatches (`migratedProfiles` vs `recordsMigrated`)
- **Status**: Core implementation exists, needs test alignment

### ⏳ Planned

#### **Remaining W4 Steps**

- **Step 8**: Fix implementation issues identified by tests
- **Step 9**: Integration testing with other packages
- **Step 10**: Performance optimization
- **Step 11**: Documentation and examples

## Technical Details

### Key Fixes Applied

#### **Transaction Structure**

```typescript
// Before: async/await in Dexie transactions (caused PrematureCommitError)
await db.transaction('rw', [db.saves, db.meta], async () => {
  // async operations
});

// After: Promise chaining in transactions
await db.transaction('rw', [db.saves, db.meta], () => {
  return db.saves.add(newSaveRow).then((saveId) => {
    return db.meta.put(metaRow).then(() => {
      // More promise chaining
    });
  });
});
```

#### **Active Profile Support**

```typescript
const META_KEYS = {
  ACTIVE_SAVE: 'active_save',
  PROFILE_POINTERS: 'profile_pointers',
  ACTIVE_PROFILE: 'active_profile', // Added
} as const;
```

#### **Pruning Logic**

```typescript
// Keep the most recent saves, delete the oldest ones
const savesToDelete =
  savesToPrune.length > keepBackups ? savesToPrune.slice(0, savesToPrune.length - keepBackups) : [];
```

### Error Handling

#### **Structured Error Reporting**

```typescript
throw new Error(`Atomic save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
```

#### **Validation Integration**

```typescript
const validatedData = validateSaveV1(saveData);
const validatedRow = validateSaveRowV1(saveRow);
```

## Development Workflow

### Running Tests

```bash
# Run all database tests
pnpm test:db

# Run specific test file
pnpm test:db tests/db/atomic.spec.ts

# Run with verbose output
pnpm test:db --reporter=verbose
```

### Development Utilities

```bash
# Clear database for testing
pnpm db:nuke

# Seed database with sample data
pnpm db:seed
```

### Debugging

- **Test Isolation**: Use `clearDatabase()` between tests
- **Transaction Issues**: Check for async/await in Dexie transactions
- **Validation Errors**: Verify Zod schema compliance
- **Checksum Issues**: Ensure proper async/await on `generateChecksum`

## Next Steps

### Immediate (Current Sprint)

1. **Fix Test Isolation**: Implement and integrate `clearDatabase()`
2. **Debug Export/Import**: Resolve `exportAllProfiles` issues
3. **Align Migration Tests**: Fix field name mismatches
4. **Remove Debug Logging**: Clean up console.log statements

### Short Term (Next Sprint)

1. **Performance Testing**: Benchmark atomic operations
2. **Integration Testing**: Test with other packages
3. **Documentation**: Create usage examples and API docs
4. **Error Recovery**: Implement robust error recovery mechanisms

### Long Term (Future Sprints)

1. **Advanced Features**: Complex queries, indexing optimization
2. **Migration Tools**: GUI for schema evolution
3. **Backup/Restore**: Enhanced data portability features
4. **Monitoring**: Database health and performance metrics

## Related Documentation

- [Testing Strategy](./testing.md) - Overall testing approach
- [TypeScript Standards](./typescript.md) - Type safety requirements
- [W4Plan.md](../../W4Plan.md) - Week 4 implementation plan
- [GDD](../../../Draconia_Chronicles_v2_GDD.md) - Game Design Document
