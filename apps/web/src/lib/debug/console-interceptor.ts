/**
 * Browser Console Interceptor
 *
 * Captures console.log, console.error, console.warn from the browser
 * and sends them to the backend for logging to file.
 *
 * This allows Claude Code to read browser logs via file access.
 */

interface LogEntry {
  timestamp: number;
  level: 'log' | 'error' | 'warn' | 'info';
  args: unknown[];
}

class ConsoleInterceptor {
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
  };

  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 50; // Send logs in batches
  private flushInterval = 2000; // Flush every 2 seconds
  private flushTimer: number | null = null;

  constructor() {
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
    };
  }

  /**
   * Start intercepting console methods
   */
  start(): void {
    // Override console.log
    console.log = (...args: unknown[]) => {
      this.originalConsole.log(...args);
      this.captureLog('log', args);
    };

    // Override console.error
    console.error = (...args: unknown[]) => {
      this.originalConsole.error(...args);
      this.captureLog('error', args);
    };

    // Override console.warn
    console.warn = (...args: unknown[]) => {
      this.originalConsole.warn(...args);
      this.captureLog('warn', args);
    };

    // Override console.info
    console.info = (...args: unknown[]) => {
      this.originalConsole.info(...args);
      this.captureLog('info', args);
    };

    // Start periodic flush
    this.startFlushTimer();

    console.log('🔍 Console Interceptor: Started');
  }

  /**
   * Capture a log entry
   */
  private captureLog(level: LogEntry['level'], args: unknown[]): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      args,
    };

    this.logBuffer.push(entry);

    // Auto-flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Flush logs to backend
   */
  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch('/api/dev/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });
    } catch (error) {
      // Silently fail - don't want to create infinite loop
      // Restore to original console to avoid recursion
      this.originalConsole.error('Failed to send logs to backend:', error);
    }
  }

  /**
   * Stop intercepting and restore original console
   */
  stop(): void {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;

    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Final flush
    this.flush();

    this.originalConsole.log('🔍 Console Interceptor: Stopped');
  }
}

// Export singleton instance
export const consoleInterceptor = new ConsoleInterceptor();

/**
 * Initialize console interceptor (call from browser only)
 */
export function initConsoleInterceptor(): void {
  if (typeof window === 'undefined') {
    return; // Only run in browser
  }

  consoleInterceptor.start();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    consoleInterceptor.stop();
  });
}