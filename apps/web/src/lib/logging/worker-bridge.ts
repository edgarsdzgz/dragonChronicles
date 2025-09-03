import type { SimToUI } from '@draconia/shared/protocol';
import { logger } from './logger';

export function bindWorkerLogs(w: Worker) {
  w.addEventListener('message', (ev: MessageEvent<SimToUI>) => {
    if (ev.data.t === 'log') {
      logger.log({
        t: Date.now(),
        lvl: ev.data.level,
        src: 'worker',
        msg: ev.data.msg,
      });
    }
  });
}
