import assert from "node:assert/strict";
import { helloLog } from "../packages/logger/dist/index.js";
import { simulateTick } from "../packages/sim/dist/index.js";

assert.match(helloLog(), /^logger-ok@/);
assert.equal(simulateTick(41), 42);

console.log("INTEGRATION(graph): ok");