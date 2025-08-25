/**
 * Custom error classes for the database layer
 * 
 * Provides specific error types for different database operations
 * with detailed error messages and context information.
 */

// ============================================================================
// Base Database Error
// ============================================================================

/**
 * Base class for all database-related errors
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ============================================================================
// Validation Errors
// ============================================================================

/**
 * Error thrown when data validation fails
 */
export class ValidationError extends DatabaseError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message, 'validation', { field, value });
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when save data validation fails
 */
export class SaveDataValidationError extends ValidationError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, field, value);
    this.name = 'SaveDataValidationError';
  }
}

/**
 * Error thrown when profile validation fails
 */
export class ProfileValidationError extends ValidationError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, field, value);
    this.name = 'ProfileValidationError';
  }
}

// ============================================================================
// Database Operation Errors
// ============================================================================

/**
 * Error thrown when database operations fail
 */
export class DatabaseOperationError extends DatabaseError {
  constructor(
    message: string,
    operation: string,
    public readonly originalError?: Error
  ) {
    super(message, operation, { originalError: originalError?.message });
    this.name = 'DatabaseOperationError';
  }
}

/**
 * Error thrown when save operations fail
 */
export class SaveOperationError extends DatabaseOperationError {
  constructor(message: string, originalError?: Error) {
    super(message, 'save', originalError);
    this.name = 'SaveOperationError';
  }
}

/**
 * Error thrown when load operations fail
 */
export class LoadOperationError extends DatabaseOperationError {
  constructor(message: string, originalError?: Error) {
    super(message, 'load', originalError);
    this.name = 'LoadOperationError';
  }
}

/**
 * Error thrown when delete operations fail
 */
export class DeleteOperationError extends DatabaseOperationError {
  constructor(message: string, originalError?: Error) {
    super(message, 'delete', originalError);
    this.name = 'DeleteOperationError';
  }
}

// ============================================================================
// Export/Import Errors
// ============================================================================

/**
 * Error thrown when export operations fail
 */
export class ExportError extends DatabaseError {
  constructor(message: string, public readonly profileId?: string) {
    super(message, 'export', { profileId });
    this.name = 'ExportError';
  }
}

/**
 * Error thrown when import operations fail
 */
export class ImportError extends DatabaseError {
  constructor(
    message: string,
    public readonly profileId?: string,
    public readonly validationErrors?: string[]
  ) {
    super(message, 'import', { profileId, validationErrors });
    this.name = 'ImportError';
  }
}

/**
 * Error thrown when checksum validation fails
 */
export class ChecksumError extends DatabaseError {
  constructor(
    message: string,
    public readonly expectedChecksum?: string,
    public readonly actualChecksum?: string
  ) {
    super(message, 'checksum_validation', { expectedChecksum, actualChecksum });
    this.name = 'ChecksumError';
  }
}

// ============================================================================
// Migration Errors
// ============================================================================

/**
 * Error thrown when migration operations fail
 */
export class MigrationError extends DatabaseError {
  constructor(
    message: string,
    public readonly fromVersion: number,
    public readonly toVersion: number,
    public readonly migrationErrors?: string[]
  ) {
    super(message, 'migration', { fromVersion, toVersion, migrationErrors });
    this.name = 'MigrationError';
  }
}

/**
 * Error thrown when migration path is invalid
 */
export class MigrationPathError extends MigrationError {
  constructor(
    message: string,
    fromVersion: number,
    toVersion: number,
    public readonly missingVersions?: number[]
  ) {
    super(message, fromVersion, toVersion);
    this.name = 'MigrationPathError';
    // Note: context is readonly, so we can't modify it after construction
    // The missingVersions are already included in the constructor call above
  }
}

// ============================================================================
// Profile Errors
// ============================================================================

/**
 * Error thrown when profile operations fail
 */
export class ProfileError extends DatabaseError {
  constructor(
    message: string,
    public readonly profileId: string
  ) {
    super(message, 'profile', { profileId });
    this.name = 'ProfileError';
  }
}

/**
 * Error thrown when profile is not found
 */
export class ProfileNotFoundError extends ProfileError {
  constructor(profileId: string) {
    super(`Profile not found: ${profileId}`, profileId);
    this.name = 'ProfileNotFoundError';
  }
}

/**
 * Error thrown when profile already exists
 */
export class ProfileExistsError extends ProfileError {
  constructor(profileId: string) {
    super(`Profile already exists: ${profileId}`, profileId);
    this.name = 'ProfileExistsError';
  }
}

// ============================================================================
// Connection Errors
// ============================================================================

/**
 * Error thrown when database connection fails
 */
export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message, 'connection', { originalError: originalError?.message });
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Error thrown when database is not initialized
 */
export class DatabaseNotInitializedError extends DatabaseError {
  constructor() {
    super('Database not initialized. Call initializeDatabase() first.', 'initialization');
    this.name = 'DatabaseNotInitializedError';
  }
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Checks if an error is a database error
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Checks if an error is a profile error
 */
export function isProfileError(error: unknown): error is ProfileError {
  return error instanceof ProfileError;
}

/**
 * Creates a standardized error message
 */
export function createErrorMessage(
  operation: string,
  details: string,
  context?: Record<string, unknown>
): string {
  let message = `Database ${operation} failed: ${details}`;
  
  if (context && Object.keys(context).length > 0) {
    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(', ');
    message += ` (${contextStr})`;
  }
  
  return message;
}

/**
 * Wraps an error with database context
 */
export function wrapDatabaseError(
  error: unknown,
  operation: string,
  context?: Record<string, unknown>
): DatabaseError {
  if (isDatabaseError(error)) {
    return error;
  }
  
  const message = error instanceof Error ? error.message : String(error);
  return new DatabaseOperationError(
    createErrorMessage(operation, message, context),
    operation,
    error instanceof Error ? error : undefined
  );
}
