import { Decimal } from '$lib/num/decimal';
import { setBootFlags } from '$lib/state/boot';

export function runBootDiagnostics() {
  // Decimal check
  let decOK = false;
  try {
    const d = new Decimal('1e100');
    decOK = d.toString() === '1e+100' || d.toString() === '1e100';
  } catch {}

  // Renderer subscription check (provide real implementation)
  const rendererSubscribed = (window as any).__rendererSubscribed === true;

  // Worker tick check (set a flag in worker on first tick)
  const workerActive = (window as any).__workerActive === true;

  setBootFlags({ decOK, rendererSubscribed, workerActive });

  // Dev one-liners (print once)
  if (import.meta.env.DEV) {
    console.info('[BOOT OK] Decimal:', decOK);
    console.info('[BOOT OK] Renderer subscribed:', rendererSubscribed);
    console.info('[BOOT OK] Worker active:', workerActive);
  }
}