/**
 * Enhanced error handling system for database operations
 *
 * Provides structured error types with context and operation tracking
 * Improves debugging and error handling throughout the application
 */

/**
 * Base database error class
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    // eslint-disable-next-line no-unused-vars -- parameter used as class property
    public operation: string,
    // eslint-disable-next-line no-unused-vars -- parameter used as class property
    public cause?: unknown,
    // eslint-disable-next-line no-unused-vars -- parameter used as class property
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DatabaseError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }

  /**
   * Create a formatted error message with context
   */
  getFormattedMessage(): string {
    let msg = `[${this.operation}] ${this.message}`;

    if (this.context) {
      const contextStr = Object.entries(this.context)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ');
      msg += ` | Context: ${contextStr}`;
    }

    if (this.cause) {
      msg += ` | Cause: ${this.cause instanceof Error ? this.cause.message : String(this.cause)}`;
    }

    return msg;
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      operation: this.operation,
      context: this.context,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
      stack: this.stack,
    };
  }
}

/**
 * Specific error types for different database operations
 */
export class ValidationError extends DatabaseError {
  constructor(
    message: string,
    operation: string,
    public field?: string,
    public value?: unknown,
    cause?: unknown,
  ) {
    super(message, operation, cause, { field, value });
    this.name = 'ValidationError';
  }
}

export class TransactionError extends DatabaseError {
  constructor(
    message: string,
    operation: string,
    public transactionType: 'read' | 'write' | 'readwrite',
    cause?: unknown,
  ) {
    super(message, operation, cause, { transactionType });
    this.name = 'TransactionError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(
    message: string,
    operation: string,
    public connectionState: string,
    cause?: unknown,
  ) {
    super(message, operation, cause, { connectionState });
    this.name = 'ConnectionError';
  }
}

export class MigrationError extends DatabaseError {
  constructor(
    message: string,
    operation: string,
    public version: number,
    public fromVersion?: number,
    cause?: unknown,
  ) {
    super(message, operation, cause, { version, fromVersion });
    this.name = 'MigrationError';
  }
}

/**
 * Error factory functions for consistent error creation
 */
export const createValidationError = (
  message: string,
  operation: string,
  field?: string,
  value?: unknown,
  cause?: unknown,
): ValidationError => {
  return new ValidationError(message, operation, field, value, cause);
};

export const createTransactionError = (
  message: string,
  operation: string,
  transactionType: 'read' | 'write' | 'readwrite',
  cause?: unknown,
): TransactionError => {
  return new TransactionError(message, operation, transactionType, cause);
};

export const createConnectionError = (
  message: string,
  operation: string,
  connectionState: string,
  cause?: unknown,
): ConnectionError => {
  return new ConnectionError(message, operation, connectionState, cause);
};

export const createMigrationError = (
  message: string,
  operation: string,
  version: number,
  fromVersion?: number,
  cause?: unknown,
): MigrationError => {
  return new MigrationError(message, operation, version, fromVersion, cause);
};

/**
 * Error context builder for adding operation context
 */
export class ErrorContext {
  private context: Record<string, unknown> = {};

  // eslint-disable-next-line no-unused-vars -- parameter used as class property
  constructor(public operation: string) {}

  add(key: string, value: unknown): this {
    this.context[key] = value;
    return this;
  }

  addProfile(profileId: string): this {
    this.context.profileId = profileId;
    return this;
  }

  addSave(saveId: number): this {
    this.context.saveId = saveId;
    return this;
  }

  addVersion(version: number): this {
    this.context.version = version;
    return this;
  }

  addTimestamp(timestamp: number): this {
    this.context.timestamp = timestamp;
    return this;
  }

  build(): Record<string, unknown> {
    return { ...this.context };
  }
}

/**
 * Performance monitoring wrapper for database operations
 */
export function withPerformanceMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, unknown>,
): Promise<T> {
  const startTime = performance.now();

  return operation()
    .then((result) => {
      const duration = performance.now() - startTime;

      // Log slow operations
      if (duration > 100) {
        console.warn(`Slow database operation: ${operationName} took ${duration.toFixed(2)}ms`, {
          operation: operationName,
          duration,
          context,
        });
      }

      return result;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;

      // Log failed operations with timing
      console.error(`Database operation failed after ${duration.toFixed(2)}ms: ${operationName}`, {
        operation: operationName,
        duration,
        context,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    });
}

/**
 * Error recovery utilities
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof DatabaseError) {
    // Connection errors are usually recoverable
    if (error instanceof ConnectionError) return true;

    // Validation errors are not recoverable
    if (error instanceof ValidationError) return false;

    // Transaction errors might be recoverable
    if (error instanceof TransactionError) return true;
  }

  // Generic errors might be recoverable
  return error instanceof Error && !(error instanceof SyntaxError);
}

export function shouldRetry(error: unknown, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) return false;

  // Retry connection and transaction errors
  if (error instanceof ConnectionError) return true;
  if (error instanceof TransactionError) return true;

  // Don't retry validation errors
  if (error instanceof ValidationError) return false;

  return false;
}

/**
 * Error logging utilities
 */
export function logDatabaseError(
  error: DatabaseError,
  additionalContext?: Record<string, unknown>,
): void {
  const logData = {
    ...error.toJSON(),
    ...additionalContext,
    timestamp: Date.now(),
  };

  console.error('Database Error:', logData);

  // In production, you might want to send this to a logging service
  // or error tracking system like Sentry
}
