import assert from "node:assert/strict";
import { clamp, DRACONIA_VERSION } from "../packages/shared/dist/index.js";

assert.equal(clamp(5, 0, 10), 5);
assert.equal(clamp(-1, 0, 10), 0);
assert.equal(clamp(11, 0, 10), 10);
assert.match(DRACONIA_VERSION, /^\d+\.\d+\.\d+-phase0$/);

console.log("UNIT(shared): ok");