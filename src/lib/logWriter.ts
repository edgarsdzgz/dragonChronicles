// Real-time Log Writer - Automatic file saving for development
import { browser } from '$app/environment';

interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug' | 'telemetry';
  source: string;
  message: string;
  data?: any;
}

class AutoLogWriter {
  private buffer: LogEntry[] = [];
  private flushInterval = 1000; // 1 second
  private maxBufferSize = 100;
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId = this.generateSessionId();

  constructor() {
    if (browser) {
      this.initializeFileSystem();
      this.interceptConsole();
      this.startAutoFlush();
    }
  }

  private generateSessionId(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `session-${timestamp}`;
  }

  private async initializeFileSystem(): Promise<void> {
    // Create session subdirectory
    const sessionDir = `/logs/${this.sessionId}`;
    
    try {
      // Browser can't create directories directly, but we'll organize files with prefixes
      console.log(`[LogWriter] Session started: ${this.sessionId}`);
    } catch (error) {
      console.warn('[LogWriter] Failed to initialize file system:', error);
    }
  }

  private interceptConsole(): void {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
      info: console.info
    };

    // Intercept console.log
    console.log = (...args: any[]) => {
      originalConsole.log(...args);
      this.addLogEntry('info', 'console', this.formatArgs(args));
    };

    // Intercept console.warn
    console.warn = (...args: any[]) => {
      originalConsole.warn(...args);
      this.addLogEntry('warn', 'console', this.formatArgs(args));
    };

    // Intercept console.error
    console.error = (...args: any[]) => {
      originalConsole.error(...args);
      this.addLogEntry('error', 'console', this.formatArgs(args));
    };

    // Intercept console.debug
    console.debug = (...args: any[]) => {
      originalConsole.debug(...args);
      this.addLogEntry('debug', 'console', this.formatArgs(args));
    };

    // Intercept console.info
    console.info = (...args: any[]) => {
      originalConsole.info(...args);
      this.addLogEntry('info', 'console', this.formatArgs(args));
    };

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.addLogEntry('error', 'window', `Unhandled error: ${event.error?.message || event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addLogEntry('error', 'promise', `Unhandled promise rejection: ${event.reason}`, {
        reason: event.reason
      });
    });
  }

  private formatArgs(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  private addLogEntry(level: LogEntry['level'], source: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      source,
      message,
      data
    };

    this.buffer.push(entry);

    // Immediate flush for errors
    if (level === 'error') {
      this.flushLogs();
    }
    // Auto-flush when buffer is full
    else if (this.buffer.length >= this.maxBufferSize) {
      this.flushLogs();
    }
  }

  public logTelemetry(event: string, data: any): void {
    this.addLogEntry('telemetry', 'telemetry', event, data);
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flushLogs();
      }
    }, this.flushInterval);
  }

  private async flushLogs(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      await this.writeToFiles(logsToFlush);
    } catch (error) {
      // Restore logs to buffer if write fails
      this.buffer.unshift(...logsToFlush);
      console.warn('[LogWriter] Failed to flush logs:', error);
    }
  }

  private async writeToFiles(logs: LogEntry[]): Promise<void> {
    // Group logs by type
    const groupedLogs = {
      console: logs.filter(log => log.source === 'console'),
      telemetry: logs.filter(log => log.source === 'telemetry'),
      errors: logs.filter(log => log.level === 'error'),
      all: logs
    };

    const promises: Promise<void>[] = [];

    // Write to different log files
    if (groupedLogs.console.length > 0) {
      promises.push(this.writeLogFile('console', groupedLogs.console));
    }

    if (groupedLogs.telemetry.length > 0) {
      promises.push(this.writeLogFile('telemetry', groupedLogs.telemetry));
    }

    if (groupedLogs.errors.length > 0) {
      promises.push(this.writeLogFile('errors', groupedLogs.errors));
    }

    // Always write to combined log
    promises.push(this.writeLogFile('combined', groupedLogs.all));

    await Promise.all(promises);
  }

  private async writeLogFile(type: string, logs: LogEntry[]): Promise<void> {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filename = `${this.sessionId}-${type}-${timestamp}.log`;
    
    // Format logs as readable text
    const content = logs.map(log => {
      const time = new Date(log.timestamp).toISOString();
      const dataStr = log.data ? `\n${JSON.stringify(log.data, null, 2)}` : '';
      return `[${time}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}${dataStr}`;
    }).join('\n') + '\n';

    // In browser environment, we'll use the File System Access API if available
    // Otherwise, we'll save to localStorage and provide download functionality
    if ('showSaveFilePicker' in window) {
      try {
        await this.writeWithFileSystemAPI(filename, content);
      } catch (error) {
        // Fallback to localStorage
        this.saveToLocalStorage(filename, content);
      }
    } else {
      this.saveToLocalStorage(filename, content);
    }
  }

  private async writeWithFileSystemAPI(filename: string, content: string): Promise<void> {
    try {
      // This will require user permission on first use
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Log files',
          accept: { 'text/plain': ['.log'] }
        }]
      });

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (error) {
      // User cancelled or API not available
      throw error;
    }
  }

  private saveToLocalStorage(filename: string, content: string): void {
    try {
      const key = `dragonChronicles_logs_${filename}`;
      const existing = localStorage.getItem(key) || '';
      localStorage.setItem(key, existing + content);
    } catch (error) {
      console.warn(`[LogWriter] Failed to save to localStorage for ${filename}:`, error);
    }
  }

  public downloadAllLogs(): void {
    const logs: string[] = [];
    
    // Collect all logs from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('dragonChronicles_logs_')) {
        const content = localStorage.getItem(key);
        if (content) {
          logs.push(`=== ${key} ===\n${content}\n`);
        }
      }
    }

    if (logs.length > 0) {
      const allContent = logs.join('\n');
      const blob = new Blob([allContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `dragonchronicles-all-logs-${this.sessionId}.log`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  public clearAllLogs(): void {
    // Clear current buffer
    this.buffer = [];
    
    // Clear localStorage logs
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('dragonChronicles_logs_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  public getLogStats(): { bufferSize: number; totalSessions: number; currentSession: string } {
    let totalSessions = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('dragonChronicles_logs_session-')) {
        totalSessions++;
      }
    }

    return {
      bufferSize: this.buffer.length,
      totalSessions,
      currentSession: this.sessionId
    };
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    this.flushLogs();
  }
}

// Global instance
export const logWriter = new AutoLogWriter();

// Cleanup on page unload
if (browser) {
  window.addEventListener('beforeunload', () => {
    logWriter.destroy();
  });
}