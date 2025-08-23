export interface Ticker {
  start(periodMs: number, cb: () => void): () => void;
}

export const realTicker: Ticker = {
  start(periodMs, cb) {
    const id = setInterval(cb, periodMs);
    return () => clearInterval(id);
  },
};