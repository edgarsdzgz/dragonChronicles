import type { Seed } from "@draconia/shared";

export type Profile = { id: string; name: string; createdAt: number; seed?: Seed };

export function makeProfile(name: string): Profile {
  if (!/[\p{L}\p{N}\s'-]{2,24}/u.test(name)) throw new Error("invalid-name");
  return { id: cryptoRandomId(), name, createdAt: Date.now() };
}

function cryptoRandomId() {
  // Not using Web Crypto here to keep Node-compat simple in Phase 0
  return Math.random().toString(36).slice(2, 10);
}