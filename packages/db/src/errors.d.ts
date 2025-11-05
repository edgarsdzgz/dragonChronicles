/**
 * Custom error classes for the database layer
 *
 * Provides specific error types for different database operations
 * with detailed error messages and context information.
 */
/**
 * Base class for all database-related errors
 */
export declare class DatabaseError extends Error {
    readonly operation: string;
    readonly context?: Record<string, unknown> | undefined;
    constructor(message: string, operation: string, context?: Record<string, unknown> | undefined);
}
/**
 * Error thrown when data validation fails
 */
export declare class ValidationError extends DatabaseError {
    readonly field?: string | undefined;
    readonly value?: unknown | undefined;
    constructor(message: string, field?: string | undefined, value?: unknown | undefined);
}
/**
 * Error thrown when save data validation fails
 */
export declare class SaveDataValidationError extends ValidationError {
    constructor(message: string, field?: string, value?: unknown);
}
/**
 * Error thrown when profile validation fails
 */
export declare class ProfileValidationError extends ValidationError {
    constructor(message: string, field?: string, value?: unknown);
}
/**
 * Error thrown when database operations fail
 */
export declare class DatabaseOperationError extends DatabaseError {
    readonly originalError?: Error | undefined;
    constructor(message: string, operation: string, originalError?: Error | undefined);
}
/**
 * Error thrown when save operations fail
 */
export declare class SaveOperationError extends DatabaseOperationError {
    constructor(message: string, originalError?: Error);
}
/**
 * Error thrown when load operations fail
 */
export declare class LoadOperationError extends DatabaseOperationError {
    constructor(message: string, originalError?: Error);
}
/**
 * Error thrown when delete operations fail
 */
export declare class DeleteOperationError extends DatabaseOperationError {
    constructor(message: string, originalError?: Error);
}
/**
 * Error thrown when export operations fail
 */
export declare class ExportError extends DatabaseError {
    readonly profileId?: string | undefined;
    constructor(message: string, profileId?: string | undefined);
}
/**
 * Error thrown when import operations fail
 */
export declare class ImportError extends DatabaseError {
    readonly profileId?: string | undefined;
    readonly validationErrors?: string[] | undefined;
    constructor(message: string, profileId?: string | undefined, validationErrors?: string[] | undefined);
}
/**
 * Error thrown when checksum validation fails
 */
export declare class ChecksumError extends DatabaseError {
    readonly expectedChecksum?: string | undefined;
    readonly actualChecksum?: string | undefined;
    constructor(message: string, expectedChecksum?: string | undefined, actualChecksum?: string | undefined);
}
/**
 * Error thrown when migration operations fail
 */
export declare class MigrationError extends DatabaseError {
    readonly fromVersion: number;
    readonly toVersion: number;
    readonly migrationErrors?: string[] | undefined;
    constructor(message: string, fromVersion: number, toVersion: number, migrationErrors?: string[] | undefined);
}
/**
 * Error thrown when migration path is invalid
 */
export declare class MigrationPathError extends MigrationError {
    readonly missingVersions?: number[] | undefined;
    constructor(message: string, fromVersion: number, toVersion: number, missingVersions?: number[] | undefined);
}
/**
 * Error thrown when profile operations fail
 */
export declare class ProfileError extends DatabaseError {
    readonly profileId: string;
    constructor(message: string, profileId: string);
}
/**
 * Error thrown when profile is not found
 */
export declare class ProfileNotFoundError extends ProfileError {
    constructor(profileId: string);
}
/**
 * Error thrown when profile already exists
 */
export declare class ProfileExistsError extends ProfileError {
    constructor(profileId: string);
}
/**
 * Error thrown when database connection fails
 */
export declare class DatabaseConnectionError extends DatabaseError {
    readonly originalError?: Error | undefined;
    constructor(message: string, originalError?: Error | undefined);
}
/**
 * Error thrown when database is not initialized
 */
export declare class DatabaseNotInitializedError extends DatabaseError {
    constructor();
}
/**
 * Checks if an error is a database error
 */
export declare function isDatabaseError(error: unknown): error is DatabaseError;
/**
 * Checks if an error is a validation error
 */
export declare function isValidationError(error: unknown): error is ValidationError;
/**
 * Checks if an error is a profile error
 */
export declare function isProfileError(error: unknown): error is ProfileError;
/**
 * Creates a standardized error message
 */
export declare function createErrorMessage(operation: string, details: string, context?: Record<string, unknown>): string;
/**
 * Wraps an error with database context
 */
export declare function wrapDatabaseError(error: unknown, operation: string, context?: Record<string, unknown>): DatabaseError;
//# sourceMappingURL=errors.d.ts.map