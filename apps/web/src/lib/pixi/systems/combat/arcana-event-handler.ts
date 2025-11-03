/**
 * Arcana Event Handler
 *
 * Listens for arcana_calculated events and awards arcana via arcana manager.
 * Keeps arcana manager isolated from event system.
 */

import type { EventBus, CombatEvent } from '@draconia/shared';
import type { ArcanaDropManager } from '@draconia/sim';

/**
 * Set up event listeners for arcana awarding
 * @param eventBus - Event bus instance
 * @param arcanaManager - Arcana drop manager instance
 */
export function setupArcanaEventHandler(
  eventBus: EventBus,
  arcanaManager: ArcanaDropManager,
): void {
  // Listen for arcana_calculated events
  eventBus.on<CombatEvent>(
    'combat',
    'arcana_calculated',
    (event) => {
      const payload = event.payload as {
        enemyId: string | number;
        scaledArcana: number;
      };

      // Award arcana via manager
      arcanaManager.dropArcana(payload.scaledArcana, {
        type: 'enemy_kill',
        enemyId: payload.enemyId,
        timestamp: Date.now(),
      });

      // Emit arcana_awarded event
      eventBus.emit<CombatEvent>({
        category: 'combat',
        type: 'arcana_awarded',
        timestamp: Date.now(),
        source: 'arcana-event-handler',
        payload: {
          enemyId: payload.enemyId,
          amount: payload.scaledArcana,
          totalBalance: arcanaManager.getCurrentBalance(),
        },
      });

      console.log(
        `💰 Arcana awarded: ${payload.scaledArcana} (Total: ${arcanaManager.getCurrentBalance()})`,
      );
    },
  );
}

