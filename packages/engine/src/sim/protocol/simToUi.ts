/**
 * @file Sim to UI protocol messages
 * @description Phase 1 Story 1: Type-safe message contracts from simulation to UI
 */

import type { SimToUi, SimStats } from '../../shared/types.js';
import { MessageType, LogLvl } from '../../shared/enums.js';

/**
 * Creates a ready message
 * @returns Ready message
 */
export function createReadyMessage(): SimToUi {
  return {
    t: MessageType._Ready,
  };
}

/**
 * Creates a tick message
 * @param now - Current simulation time
 * @param stats - Simulation statistics
 * @returns Tick message
 */
export function createTickMessage(now: number, stats: SimStats): SimToUi {
  return {
    t: MessageType._Tick,
    now,
    stats,
  };
}

/**
 * Creates a log message
 * @param level - Log level
 * @param message - Log message
 * @returns Log message
 */
export function createLogMessage(level: LogLvl, message: string): SimToUi {
  return {
    t: MessageType._Log,
    lvl: level,
    msg: message,
  };
}

/**
 * Creates a fatal error message
 * @param reason - Error reason
 * @returns Fatal message
 */
export function createFatalMessage(reason: string): SimToUi {
  return {
    t: MessageType._Fatal,
    reason,
  };
}

/**
 * Message factory for creating Sim to UI messages
 */
export class SimToUiMessageFactory {
  /**
   * Creates a ready message
   * @returns Ready message
   */
  static ready(): SimToUi {
    return createReadyMessage();
  }

  /**
   * Creates a tick message
   * @param now - Current simulation time
   * @param stats - Simulation statistics
   * @returns Tick message
   */
  static tick(now: number, stats: SimStats): SimToUi {
    return createTickMessage(now, stats);
  }

  /**
   * Creates an info log message
   * @param message - Log message
   * @returns Log message
   */
  static info(message: string): SimToUi {
    return createLogMessage(LogLvl._Info, message);
  }

  /**
   * Creates a warning log message
   * @param message - Log message
   * @returns Log message
   */
  static warn(message: string): SimToUi {
    return createLogMessage(LogLvl._Warn, message);
  }

  /**
   * Creates an error log message
   * @param message - Log message
   * @returns Log message
   */
  static error(message: string): SimToUi {
    return createLogMessage(LogLvl._Error, message);
  }

  /**
   * Creates a fatal error message
   * @param reason - Error reason
   * @returns Fatal message
   */
  static fatal(reason: string): SimToUi {
    return createFatalMessage(reason);
  }
}
