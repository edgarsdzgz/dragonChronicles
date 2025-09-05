export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSrc = 'ui' | 'worker' | 'render' | 'net';
export type SimMode = 'fg' | 'bg';

export type LogEvent = {
  t: number; // epoch ms
  lvl: LogLevel;
  src: LogSrc;
  msg: string;
  mode?: SimMode; // fg/bg if relevant
  profileId?: string; // optional
  data?: Record<string, unknown>;
};

export interface Logger {
  log(_e: LogEvent): void;
  exportNDJSON(): Promise<Blob>;
  clear(): Promise<void>;
  enableConsole(_enable: boolean): void;
}
