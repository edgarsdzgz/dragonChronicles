/**
 * Protocol v1 for Worker-UI communication
 *
 * Defines the message contract between the UI and simulation worker.
 * Includes version handshake, mode switching, offline simulation, and error handling.
 */

export const SIM_PROTOCOL_VERSION = 1;

export type SimMode = 'fg' | 'bg';

export type SimStats = {
  enemies: number;
  proj: number;
};

// UI → Worker messages
export type UIToSim =
  | { t: 'boot'; version: number; seed: number }
  | { t: 'start'; mode: SimMode }
  | { t: 'stop' }
  | { t: 'setMode'; mode: SimMode }
  | { t: 'offline'; elapsedMs: number }
  | { t: 'ability'; id: string };

// Worker → UI messages
export type SimToUI =
  | { t: 'ready'; version: number }
  | { t: 'tick'; now: number; dtMs: number; mode: SimMode; stats: SimStats }
  | { t: 'bgCovered'; coveredMs: number }
  | { t: 'log'; level: 'info' | 'warn' | 'error'; msg: string }
  | { t: 'fatal'; reason: string };

// Type guards for message validation
export function isUIToSim(msg: unknown): msg is UIToSim {
  return typeof msg === 'object' && msg !== null && 't' in msg;
}

export function isSimToUI(msg: unknown): msg is SimToUI {
  return typeof msg === 'object' && msg !== null && 't' in msg;
}

// Protocol validation helpers
export function validateProtocolVersion(version: number): boolean {
  return version === SIM_PROTOCOL_VERSION;
}

export function validateSimMode(mode: string): mode is SimMode {
  return mode === 'fg' || mode === 'bg';
}
