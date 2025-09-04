import type { Logger } from './types.js';

export function attachExportButton(el: HTMLElement, logger: Logger) {
  el.addEventListener('click', async () => {
    const blob = await logger.exportNDJSON();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draconia-logs-${Date.now()}.ndjson`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
