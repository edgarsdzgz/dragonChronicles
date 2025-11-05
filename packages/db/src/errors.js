/**
 * Custom error classes for the database layer
 *
 * Provides specific error types for different database operations
 * with detailed error messages and context information.
 */
/* eslint-disable no-unused-vars -- Many exports are used in other files */
// ============================================================================
// Base Database Error
// ============================================================================
/**
 * Base class for all database-related errors
 */
export class DatabaseError extends Error {
    operation;
    context;
    constructor(message, 
    // eslint-disable-next-line no-unused-vars -- parameter used as class property
    operation, 
    // eslint-disable-next-line no-unused-vars -- parameter used as class property
    context) {
        super(message);
        this.operation = operation;
        this.context = context;
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
    field;
    value;
    constructor(message, field, value) {
        super(message, 'validation', { field, value });
        this.field = field;
        this.value = value;
        this.name = 'ValidationError';
    }
}
/**
 * Error thrown when save data validation fails
 */
export class SaveDataValidationError extends ValidationError {
    constructor(message, field, value) {
        super(message, field, value);
        this.name = 'SaveDataValidationError';
    }
}
/**
 * Error thrown when profile validation fails
 */
export class ProfileValidationError extends ValidationError {
    constructor(message, field, value) {
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
    originalError;
    constructor(message, operation, originalError) {
        super(message, operation, { originalError: originalError?.message });
        this.originalError = originalError;
        this.name = 'DatabaseOperationError';
    }
}
/**
 * Error thrown when save operations fail
 */
export class SaveOperationError extends DatabaseOperationError {
    constructor(message, originalError) {
        super(message, 'save', originalError);
        this.name = 'SaveOperationError';
    }
}
/**
 * Error thrown when load operations fail
 */
export class LoadOperationError extends DatabaseOperationError {
    constructor(message, originalError) {
        super(message, 'load', originalError);
        this.name = 'LoadOperationError';
    }
}
/**
 * Error thrown when delete operations fail
 */
export class DeleteOperationError extends DatabaseOperationError {
    constructor(message, originalError) {
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
    profileId;
    constructor(message, profileId) {
        super(message, 'export', { profileId });
        this.profileId = profileId;
        this.name = 'ExportError';
    }
}
/**
 * Error thrown when import operations fail
 */
export class ImportError extends DatabaseError {
    profileId;
    validationErrors;
    constructor(message, profileId, validationErrors) {
        super(message, 'import', { profileId, validationErrors });
        this.profileId = profileId;
        this.validationErrors = validationErrors;
        this.name = 'ImportError';
    }
}
/**
 * Error thrown when checksum validation fails
 */
export class ChecksumError extends DatabaseError {
    expectedChecksum;
    actualChecksum;
    constructor(message, expectedChecksum, actualChecksum) {
        super(message, 'checksum_validation', { expectedChecksum, actualChecksum });
        this.expectedChecksum = expectedChecksum;
        this.actualChecksum = actualChecksum;
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
    fromVersion;
    toVersion;
    migrationErrors;
    constructor(message, fromVersion, toVersion, migrationErrors) {
        super(message, 'migration', { fromVersion, toVersion, migrationErrors });
        this.fromVersion = fromVersion;
        this.toVersion = toVersion;
        this.migrationErrors = migrationErrors;
        this.name = 'MigrationError';
    }
}
/**
 * Error thrown when migration path is invalid
 */
export class MigrationPathError extends MigrationError {
    missingVersions;
    constructor(message, fromVersion, toVersion, 
    // eslint-disable-next-line no-unused-vars -- parameter used as class property
    missingVersions) {
        super(message, fromVersion, toVersion);
        this.missingVersions = missingVersions;
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
    profileId;
    constructor(message, profileId) {
        super(message, 'profile', { profileId });
        this.profileId = profileId;
        this.name = 'ProfileError';
    }
}
/**
 * Error thrown when profile is not found
 */
export class ProfileNotFoundError extends ProfileError {
    constructor(profileId) {
        super(`Profile not found: ${profileId}`, profileId);
        this.name = 'ProfileNotFoundError';
    }
}
/**
 * Error thrown when profile already exists
 */
export class ProfileExistsError extends ProfileError {
    constructor(profileId) {
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
    originalError;
    constructor(message, originalError) {
        super(message, 'connection', { originalError: originalError?.message });
        this.originalError = originalError;
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
export function isDatabaseError(error) {
    return error instanceof DatabaseError;
}
/**
 * Checks if an error is a validation error
 */
export function isValidationError(error) {
    return error instanceof ValidationError;
}
/**
 * Checks if an error is a profile error
 */
export function isProfileError(error) {
    return error instanceof ProfileError;
}
/**
 * Creates a standardized error message
 */
export function createErrorMessage(operation, details, context) {
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
export function wrapDatabaseError(error, operation, context) {
    if (isDatabaseError(error)) {
        return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    return new DatabaseOperationError(createErrorMessage(operation, message, context), operation, error instanceof Error ? error : undefined);
}
