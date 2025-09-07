/**
 * @file Core enums for Draconia Chronicles Engine
 * @description Phase 1 Story 1: Essential enums for game entities and systems
 */

/**
 * Enemy family types
 */
export enum Family {
  Melee = 1,
  Ranged = 2
}

/**
 * Ability identifiers
 */
export enum AbilityId {
  Roar = 1
}

/**
 * Log levels for structured logging
 */
export enum LogLvl {
  Info = "info",
  Warn = "warn", 
  Error = "error"
}

/**
 * Simulation modes
 */
export enum SimMode {
  Foreground = "fg",
  Background = "bg"
}

/**
 * Message types for UI ↔ Sim communication
 */
export enum MessageType {
  // UI → Sim
  Boot = "boot",
  Start = "start", 
  Stop = "stop",
  Ability = "ability",
  Offline = "offline",
  
  // Sim → UI
  Ready = "ready",
  Tick = "tick",
  Log = "log",
  Fatal = "fatal"
}

/**
 * Validation result types
 */
export enum ValidationResult {
  Valid = "valid",
  Invalid = "invalid",
  Fatal = "fatal"
}
