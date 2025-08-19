import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const r = spawnSync("pnpm", ["-w", "lint"], { encoding: "utf8" });
const out = (r.stdout || "") + (r.stderr || "");
if (r.status !== 0) {
  console.error(out);
}
assert.equal(r.status, 0, "Workspace lint failed");
console.log("WORKSPACE LINT: ok");