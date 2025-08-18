import { clamp } from "@draconia/shared";

export interface SimLogger {
  log(msg: string): void;
}

export function simulateTick(x: number, logger?: SimLogger) { 
  const result = clamp(x + 1, 0, Number.MAX_SAFE_INTEGER);
  if (logger) {
    logger.log(`simulateTick: ${x} -> ${result}`);
  }
  return result;
}