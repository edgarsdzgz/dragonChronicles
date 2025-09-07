/**
 * @file Core enums for Draconia Chronicles Engine
 * @description Phase 1 Story 1: Essential enums for game entities and systems
 */

/**
 * Enemy family types
 */
export enum Family {
  _Melee = 1,
  _Ranged = 2
}

/**
 * Ability identifiers
 */
export enum AbilityId {
  _Roar = 1
}

/**
 * Log levels for structured logging
 */
export enum LogLvl {
  _Info = "info",
  _Warn = "warn", 
  _Error = "error"
}

/**
 * Simulation modes
 */
export enum SimMode {
  _Foreground = "fg",
  _Background = "bg"
}

/**
 * Message types for UI ↔ Sim communication
 */
export enum MessageType {
  // UI → Sim
  _Boot = "boot",
  _Start = "start", 
  _Stop = "stop",
  _Ability = "ability",
  _Offline = "offline",
  
  // Sim → UI
  _Ready = "ready",
  _Tick = "tick",
  _Log = "log",
  _Fatal = "fatal"
}

/**
 * Validation result types
 */
export enum ValidationResult {
  _Valid = "valid",
  _Invalid = "invalid",
  _Fatal = "fatal"
}
