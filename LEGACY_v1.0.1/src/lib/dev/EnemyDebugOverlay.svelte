<script lang="ts">
  import { derived } from 'svelte/store';
  import { enemyStore } from '$lib/state/enemies';
  import { projectileStore } from '$lib/state/projectiles';
  import { combatState } from '$lib/state/combat';
  import { metrics } from '$lib/state/metrics';
  import { distanceUI, distanceWorker } from '$lib/state/distance';
  import { enemyConfigLoaded } from '$lib/state/config';

  // Derived values so we never do imperative DOM work here
  const counters = derived(
    [enemyStore, projectileStore, metrics, combatState, distanceUI, distanceWorker, enemyConfigLoaded],
    ([$enemies, $proj, $m, $combat, $dUI, $dW, $cfg]) => ({
      enemies: `${$enemies.active}/${$enemies.cap}`,
      projectiles: `${$proj.active}/${$proj.cap}`,
      spawnsPerSec: $m.spawnsEWMA.toFixed(2),
      cullCount: $m.cullCount,
      inRange: $enemies.inRange,
      tracking: $combat.tracking ? 'YES' : 'NO',
      distance: `${$dUI.km.toFixed(2)} / ${$dW.km.toFixed(2)} km`,
      cfgLoaded: $cfg ? 'true' : 'false'
    })
  );
</script>

<style>
  .hud {
    position: absolute;
    right: 12px;           /* <- bottom-right */
    bottom: 12px;          /* <- bottom-right */
    left: auto;
    top: auto;

    background: rgba(0,0,0,.65);
    color: #8eff8e;
    font: 12px/16px ui-monospace,monospace;
    padding: 8px 10px;
    border-radius: 6px;
    pointer-events: none;  /* never block clicks in combat */
    max-width: 42ch;
    white-space: pre-wrap;
    z-index: 1000;
  }
  .lab { color:#9bb; }
</style>

{#if import.meta.env.DEV}
<div class="hud" data-testid="enemy-debug-overlay">
  {#await $counters then c}
  <div><span class="lab">Config loaded:</span> {c.cfgLoaded}</div>
  <div><span class="lab">Enemies:</span> {c.enemies}</div>
  <div><span class="lab">Projectiles:</span> {c.projectiles}</div>
  <div><span class="lab">Spawns/s:</span> {c.spawnsPerSec}</div>
  <div><span class="lab">Cull count:</span> {c.cullCount}</div>
  <div><span class="lab">InRange:</span> {c.inRange}</div>
  <div><span class="lab">Tracking:</span> {c.tracking}</div>
  <div><span class="lab">Distance(UI/Worker):</span> {c.distance}</div>
  {/await}
</div>
{/if}