declare module 'break_eternity.js' {
  export default class Decimal {
    constructor(n?: number | string);
    // Basic arithmetic
    static min(a: Decimal, b: Decimal): Decimal;
    static max(a: Decimal, b: Decimal): Decimal;
    static pow(base: number | string | Decimal, exp: number | string | Decimal): Decimal;
    add(n: number | string | Decimal): Decimal;
    sub(n: number | string | Decimal): Decimal;
    minus(n: number | string | Decimal): Decimal;
    plus(n: number | string | Decimal): Decimal;
    mul(n: number | string | Decimal): Decimal;
    div(n: number | string | Decimal): Decimal;
    // Comparison
    gt(n: number | string | Decimal): boolean;
    lt(n: number | string | Decimal): boolean;
    gte(n: number | string | Decimal): boolean;
    lte(n: number | string | Decimal): boolean;
    eq(n: number | string | Decimal): boolean;
    // Utility
    abs(): Decimal;
    isFinite(): boolean;
    log10(): Decimal;
    floor(): Decimal;
    ceil(): Decimal;
    toFixed(digits?: number): string;
    toNumber(): number;
    toString(): string;
  }
}