/**
 * @file UI to Sim protocol messages
 * @description Phase 1 Story 1: Type-safe message contracts from UI to simulation
 */

import type { UiToSim } from '../../shared/types.js';
import { MessageType } from '../../shared/enums.js';
import type { LandId, WardId, AbilityId } from '../../shared/types.js';

/**
 * Creates a boot message
 * @param seed - Simulation seed
 * @param build - Build version string
 * @returns Boot message
 */
export function createBootMessage(seed: number, build: string): UiToSim {
  return {
    t: MessageType._Boot,
    seed,
    build,
  };
}

/**
 * Creates a start message
 * @param land - Land ID to start in
 * @param ward - Ward ID to start in
 * @returns Start message
 */
export function createStartMessage(land: LandId, ward: WardId): UiToSim {
  return {
    t: MessageType._Start,
    land,
    ward,
  };
}

/**
 * Creates a stop message
 * @returns Stop message
 */
export function createStopMessage(): UiToSim {
  return {
    t: MessageType._Stop,
  };
}

/**
 * Creates an ability message
 * @param id - Ability ID to use
 * @returns Ability message
 */
export function createAbilityMessage(id: AbilityId): UiToSim {
  return {
    t: MessageType._Ability,
    id,
  };
}

/**
 * Creates an offline message
 * @param elapsedMs - Elapsed time in milliseconds
 * @returns Offline message
 */
export function createOfflineMessage(elapsedMs: number): UiToSim {
  return {
    t: MessageType._Offline,
    elapsedMs,
  };
}

/**
 * Message factory for creating UI to Sim messages
 */
export class UiToSimMessageFactory {
  /**
   * Creates a boot message
   * @param seed - Simulation seed
   * @param build - Build version string
   * @returns Boot message
   */
  static boot(seed: number, build: string): UiToSim {
    return createBootMessage(seed, build);
  }

  /**
   * Creates a start message
   * @param land - Land ID to start in
   * @param ward - Ward ID to start in
   * @returns Start message
   */
  static start(land: LandId, ward: WardId): UiToSim {
    return createStartMessage(land, ward);
  }

  /**
   * Creates a stop message
   * @returns Stop message
   */
  static stop(): UiToSim {
    return createStopMessage();
  }

  /**
   * Creates an ability message
   * @param id - Ability ID to use
   * @returns Ability message
   */
  static ability(id: AbilityId): UiToSim {
    return createAbilityMessage(id);
  }

  /**
   * Creates an offline message
   * @param elapsedMs - Elapsed time in milliseconds
   * @returns Offline message
   */
  static offline(elapsedMs: number): UiToSim {
    return createOfflineMessage(elapsedMs);
  }
}
