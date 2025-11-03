/**
 * UI event definitions for Draconia Chronicles
 *
 * Defines all UI-related events for user interactions and UI state changes.
 */

import type { BaseGameEvent } from './types.js';

/**
 * Movement button clicked payload
 */
export interface MovementButtonClickedPayload {
  buttonType: 'backward' | 'pause' | 'forward';
  speedMultiplier?: number; // Optional speed override (for test buttons)
}

/**
 * Speed change payload
 */
export interface SpeedChangePayload {
  speed: number; // pixels per second
  multiplier?: number; // Speed multiplier (e.g., 1.0 = normal, 4.0 = 4x)
}

/**
 * Movement state change payload
 */
export interface MovementStateChangePayload {
  state: 'backward' | 'paused' | 'forward';
}

/**
 * UI button clicked event
 */
export interface MovementButtonClickedEvent extends BaseGameEvent {
  category: 'ui';
  type: 'movement_button_clicked';
  payload: MovementButtonClickedPayload;
}

/**
 * Speed change event
 */
export interface SpeedChangeEvent extends BaseGameEvent {
  category: 'ui';
  type: 'speed_changed';
  payload: SpeedChangePayload;
}

/**
 * Movement state change event
 */
export interface MovementStateChangeEvent extends BaseGameEvent {
  category: 'ui';
  type: 'movement_state_changed';
  payload: MovementStateChangePayload;
}

/**
 * Union type for all UI events
 */
export type UIEvent =
  | MovementButtonClickedEvent
  | SpeedChangeEvent
  | MovementStateChangeEvent;

