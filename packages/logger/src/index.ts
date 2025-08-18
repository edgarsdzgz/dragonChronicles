import { DRACONIA_VERSION } from "@draconia/shared";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogEvent = { t: number; lvl: LogLevel; src: string; msg: string; data?: Record<string, unknown> };

export interface Logger {
  log(e: LogEvent): void;
  drain(): LogEvent[];
}

export function createMemoryLogger(capacity = 1000): Logger {
  const buf: LogEvent[] = [];
  return {
    log(e) {
      buf.push(e);
      if (buf.length > capacity) buf.shift();
    },
    drain() {
      const copy = buf.slice(0);
      buf.length = 0;
      return copy;
    }
  };
}

/** Small smoke-call to prove the package is wired */
export function helloLog(): string {
  return `logger-ok@${DRACONIA_VERSION}`;
}