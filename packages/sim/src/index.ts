import { clamp } from "@draconia/shared";

export function simulateTick(x: number) { 
  return clamp(x + 1, 0, Number.MAX_SAFE_INTEGER); 
}