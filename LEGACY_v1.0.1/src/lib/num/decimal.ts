// Canonical Decimal import (ESM). No other place should import break_eternity directly.
import Decimal from 'break_eternity.js';
export { Decimal };

// Helper constructors used throughout the codebase
export const D = (x: number | string) => new Decimal(x);
export const DZ = () => new Decimal(0);
export const D1 = () => new Decimal(1);