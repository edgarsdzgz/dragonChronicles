import type { SimToUI } from '@draconia/shared/protocol';
import { getLogger } from './logger';

export async function bindWorkerLogs(w: Worker) {
  const logger = await getLogger();
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
