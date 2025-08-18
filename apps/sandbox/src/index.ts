import { DRACONIA_VERSION } from "@draconia/shared";
import { helloLog } from "@draconia/logger";
import { makeProfile } from "@draconia/db";
import { simulateTick } from "@draconia/sim";

const p = makeProfile("Aster");
console.log(JSON.stringify({
  v: DRACONIA_VERSION,
  hello: helloLog(),
  tick: simulateTick(0),
  profile: { id: p.id, name: p.name.length, createdAt: Math.floor(p.createdAt/1000) }
}, null, 2));