<script lang="ts">
  import { onDestroy } from 'svelte';
  import { logger } from '$lib/logging/logger';

  let rate = 100; // logs/sec
  let seconds = 10;
  let running = false;
  let produced = 0,
    dropped = 0;
  let startTs = 0;
  let handle: any;

  function start() {
    running = true;
    produced = 0;
    dropped = 0;
    startTs = performance.now();

    const interval = 1000 / rate;
    handle = setInterval(() => {
      const perTick = 1; // keep simple; adjust if needed
      for (let i = 0; i < perTick; i++) {
        produced++;
        try {
          logger.log({
            t: Date.now(),
            lvl: 'info',
            src: 'ui',
            msg: 'perf',
            data: { seq: produced },
          });
        } catch {
          dropped++;
        }
      }
    }, interval);

    setTimeout(stop, seconds * 1000);
  }

  function stop() {
    if (!running) return;
    clearInterval(handle);
    running = false;
  }

  onDestroy(stop);

  async function exportLogs() {
    const blob = await logger.exportNDJSON();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.ndjson';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div style="padding:12px; font:14px system-ui;">
  <h3>Logging Perf Lab</h3>

  <div style="margin-bottom: 16px;">
    <label>Rate (logs/sec) <input type="number" bind:value={rate} min="10" max="10000" /></label>
    <label>Duration (s) <input type="number" bind:value={seconds} min="1" max="30" /></label>
  </div>

  <div style="margin-bottom: 16px;">
    <button on:click={start} disabled={running}>Start</button>
    <button on:click={stop} disabled={!running}>Stop</button>
    <button on:click={exportLogs}>Export NDJSON</button>
  </div>

  <div>
    Produced: {produced} Dropped: {dropped} Running: {running ? 'yes' : 'no'}
  </div>
</div>
