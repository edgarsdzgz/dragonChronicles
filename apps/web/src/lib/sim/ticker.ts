export interface Ticker {
  start(_periodMs: number, _cb: () => void): () => void;
}

export const realTicker: Ticker = {
  start(periodMs, cb) {
    const id = setInterval(cb, periodMs);
    return () => clearInterval(id);
  },
};