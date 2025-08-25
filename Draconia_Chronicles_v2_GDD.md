<!-- markdownlint-disable -->

# 🐉 Draconia Chronicles v2 — Game Design Document (GDD)

**Version:** 2025-08-18 • **Owner:** Draconia Team • **Status:** MVP in progress (Shooter‑Idle focus)  
**Stack:** TypeScript • SvelteKit • PixiJS (WebGL) • Web Workers • Dexie (IndexedDB) • Workbox PWA

> This GDD follows modern best practices for clarity, being a **living document**, scoped to
> **audiences across disciplines**, and organized for **fast retrieval**. It is structured and
> maintained per recommendations from GitBook, Document360/DEV, and Assembla guidance.

---

## 0) Inspirations & Positioning

**Primary inspiration:** _Unnamed Space Idle_ (USI) — phased unlocks, powerful automation,
unfolding systems and satisfying prestige-like resets.

**Secondary references:** _Cookie Clicker_ (evergreen escalators), _Melvor Idle_
(multi-skill progression), _Rusty's Retirement_ (ambient idle UX).

**Differentiator:** A **shooter‑idle** centered on one main dragon with a crisp combat
log-as-narration, tight temporary **Enchant** economy (DMG/HP), and a post‑chapter city/market
meta that intentionally stays **subordinate** to the shooter loop until credits.

---

## 1) Vision, Goals, Pillars

**Vision:** Defend the Dragonlands from encroaching evil. Traverse Wards within Lands, defeat
enemies, gather **Arcana**, and invest in temporary **Enchants** to push farther. Return to
Draconia to bank progress, buy upgrades, and (later) expand the city.

### MVP Goals

- A. **Feel‑good combat** at 60 fps desktop / ≥40 fps mid‑phones, with clear legibility and
  responsive inputs.
- B. **Two-track progression:** permanent **Distance → Ward/Land** and temporary
  **Enchants (DMG/HP)** that reset on "Return to Draconia".
- C. **Offline progress** model that is generous but controlled (8h linear → diminishing; base
  cap 24h, META up to 96h; rested +50%/15m, 30m cooldown).
- D. **Client‑only** architecture: offline‑first PWA, multiple local profiles, exportable
  saves/logs.

### Pillars

1. **Clarity:** deterministic upgrades; readable numbers; narrated logs.
2. **Momentum:** micro‑ramps every few meters; frequent small wins; smooth resets.
3. **Performance:** pooling, workers, and PixiJS rendering budgets.
4. **Respect:** strong accessibility baseline and no grind traps by design.

---

## 2) Target Platforms & Technical Foundations

- **Platforms:** Desktop browsers (Chromium/Firefox/Edge), mobile browsers; installable PWA.
- **Render:** **PixiJS** (WebGL) for combat scene; Svelte UI overlays.
- **Sim:** **Web Workers** handle spawning, projectiles, DPS/HP math, and offline ticks.
- **Persist:** **Dexie** (IndexedDB) with versioned schema, migrations, and integrity validation.
- **PWA:** Workbox precache + update toast (“New version available → Reload”).
- **Logging:** **Structured JSON** logs, persisted **ring buffer (cap 2 MB OR 10k entries)**, exportable JSON. No PII beyond dragon name unless user explicitly opts in.

---

## 3) Core Loops

### 3.1 Shooter‑Idle Loop (MVP)

```mermaid
flowchart LR
    A[Start/Resume Journey] --> B[Advance: distance++]
    B --> C[Enemies spawn (Poisson) & form arc at range]
    C --> D[Auto-combat: dragon vs enemies]
    D --> E[Arcana drops]
    E --> F[Spend Arcana on Enchants (DMG/HP)]
    F -->|stronger| B
    D -->|death->retreat| B
    G[Return to Draconia] -->|reset enchants & distance; keep Arcana| A
```

### 3.2 Post‑Chapter Meta (visible, gated)

- **Market/City (stubs at MVP):** shops, licenses, hire clerks; taxed sales vs. staffed profits.
- **Collections:** rare scrolls → manual abilities (“moves”) unlocked by Arch‑Dragon quests.
- **Automation later:** assign junior dragons to Lands for passive searches (RNG mitigated with pity).

> Meta remains **gated** until after the first chapter to avoid overshadowing core shooter loop.

---

## 4) Systems Summary (MVP Scope)

### 4.1 Distance → Ward/Land

- **Distance Meter:** counts upward while advancing; **micro‑ramps** in enemy stats every **5 m** early, **10 m** later.
- **Wards & Lands:** Wards are level bands within a Land; boss gates at Ward ends.

### 4.2 Currency

- **Arcana (primary):** drops from enemies → spend on **Enchants** (temporary).
- **Gold (secondary, light in MVP):** sell journey items on return; fuels Market later.

### 4.3 Enchants (temporary)

- Two tracks: **Firepower (DMG)** and **Scales (HP)**, Levels 1–50 per Tier; **Tier‑Up** after 50 (steep cost).
- Reset on Return; **Arcana persists**.

### 4.4 Manual Abilities (“moves”)

- Tap‑to‑cast skills with **charges (PP)**/cooldowns; early examples: **Breath Burst**, **Wing Guard**, **Time Slip**.
- Power‑ups can grant temporary **infinite PP** windows for engagement spikes.

### 4.5 Offline model (finalized knobs)

- **Linear window:** first **8h** at full rate; **diminishing** thereafter.
- **Base cap:** **24h**; **META** upgrades add +12h up to **96h** hard cap.
- **Rested bonus:** **+50%** gains for **15 min** upon return; requires **30 min** active play to re‑accrue; one outstanding at a time; no stacking.

---

## 5) Balance & Progression (starter numbers)

### 5.1 Enemy scaling & cadence

- **HP:** `HP(n) = baseHP * 1.12^n` (normal), elites/bosses apply multipliers.
- **DMG:** `DMG(n) = baseDMG * 1.10^n`.
- **Ward bump:** step increase on entering each Ward; **micro‑ramps** inside Ward: +x% every 5 m (early), 10 m (later).
- **Caps:** design for **200 active enemies** (spikes **400**) and **≤600 projectiles/s**.

### 5.2 Arcana & Enchant costs

- **Recommendation:** **geometric** progression commonly used in idle games for smooth pacing.
- **Enchant level cost:** `cost(l) = base * 1.12^l` (tune base per Tier).
- **Tier‑Up:** single large purchase; suggest 15–25× last level cost.

### 5.3 Offline formulas (candidate family)

- **Model A — Linear→Decay:**  
  `gain = rate * min(t, 8h) + rate * decay(t-8h)` with `decay(x)=x * e^(-k x)`; `k` tuned to hit caps.
- **Model B — Logistic Cap:**  
  `gain = cap / (1 + e^(-a(t-b)))` minus offset to start near-linear; intuitive caps, easy tuning.
- **Model C — Piecewise Power:**  
  full rate to 8h; `rate * (Δt)^α` for remainder (`0<α<1`).

**Anti-cheese:** minimum session runtime before next rested grant; single outstanding rested; diminishing rested if claimed repeatedly within 24h.

---

## 6) Controls & UX

- **Desktop:** keyboard hotkeys (phase into rebinding in 2.0), mouse clicks for abilities.
- **Mobile:** bottom‑sheet dialogs, **FAB** bottom‑right for primary action, 44×44 hit targets, pinch‑zoom/scroll only for gestures.
- **Logs:** **player‑facing narration** and **debug logs** (dual stream); narration is a live region for a11y.

---

## 7) Accessibility (MVP → 2.0)

**MVP baseline:** visible focus rings, logical tab order, ARIA labels/roles, reduced‑motion mode, large touch targets.  
**2.0:** color‑blind palettes, key rebinding, gamepad/controller, screen‑shake intensity slider, full captions and SFX mixing.

---

## 8) Content Plan (Chapter 1 slice)

- **Lands:** 1–3 for MVP; each with ~10 Wards; miniboss every 5, boss every 10.
- **Drops:** Arcana always; items (sell for Gold) occasionally; rare **Scrolls** (seed future moves).
- **Bosses:** elemental variants with simple ability pool; guaranteed chest on first clear.

---

## 9) Economy & Market (visible but gated)

- **Taxed stalls** in early Market; open **owned shops** later to remove taxes at the cost of being “manned”.
- **Hire clerks** (wage) for uptime; **Mercantile level** rises with sales, unlocking better margins/slots.
- **City investments:** donate Arcana/Gold to expand housing and civic buildings for **permanent** global buffs.
- **Safeguards:** income caps at early tiers; slow unlocks ensure meta doesn’t eclipse core combat before credits.

---

## 10) Data, Saves, Logging

### 10.1 Profiles & saves

- **Profiles:** 3 save slots (META unlock to 6).
- **Store:** Dexie DB `draconia_v1`; versioned schema & migrations; Zod validation on load; atomic swap on write.

**Schema v1 (excerpt)**

```ts
// db.ts
export interface SaveV1 {
  version: 1;
  profiles: Profile[]; // 3 by default
  settings: { a11yReducedMotion: boolean };
}

export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  lastActive: number;
  progress: { land: number; ward: number; distanceM: number };
  currencies: { arcana: number; gold: number };
  enchants: { firepower: number; scales: number; tier: number };
  stats: { playtimeS: number; deaths: number; totalDistanceM: number };
  leaderboard: { highestWard: number; fastestBossS: number };
}
```

### 10.2 Logger design

```ts
// logger.ts
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogEvent = {
  t: number; // epoch ms
  lvl: LogLevel;
  src: 'ui' | 'worker' | 'render' | 'net';
  msg: string;
  data?: Record<string, unknown>;
  profileId?: string; // no PII beyond dragon name, unless user opts in
};

export interface Logger {
  log(ev: LogEvent): void;
  export(): Promise<Blob>; // JSON ND array
  clear(): void;
}

export function createBrowserLogger(opts: { capBytes?: number; capEntries?: number }): Logger {
  /* impl */
}
```

- **Caps:** **2 MB or 10k entries**, whichever reached first; oldest‑first eviction.
- **Persistence:** Dexie store `logs` with rolling buffer; toggleable in dev/prod; export from UI.

---

## 11) Architecture Notes

### 11.1 Worker protocol (sim thread) - W3 IMPLEMENTED

```ts
// Protocol v1 - W3 Implementation
export type SimToUI =
  | { t: 'ready'; version: number }
  | { t: 'tick'; now: number; dtMs: number; mode: SimMode; stats: SimStats }
  | { t: 'bgCovered'; coveredMs: number }
  | { t: 'log'; level: 'info'|'warn'|'error'; msg: string }
  | { t: 'fatal'; reason: string };

export type UIToSim =
  | { t: 'boot'; version: number; seed: number }
  | { t: 'start'; mode: SimMode }
  | { t: 'stop' }
  | { t: 'setMode'; mode: SimMode }
  | { t: 'offline'; elapsedMs: number }
  | { t: 'ability'; id: string };

// W3 Features: Fixed-timestep clock (16.67ms), PCG32 RNG, auto-recovery, 
// visibility-aware mode switching (fg/bg), offline time accounting
```

### 11.2 Pixi inside Svelte

- Single Pixi `Application` mounted in `<DragonCombatArea>`, UI overlays in Svelte.
- **Pools** for enemies/projectiles/damage numbers; **cull** off‑screen; **throttle** updates if fps dips.

---

## 12) Testing & Quality Gates

- **Unit:** Vitest for math/curves/config; property tests for offline models.
- **Integration:** store interactions, worker protocol, Dexie migrations.
- **E2E:** Playwright — UI flows, a11y focus order, fake time jumps for offline simulation.
- **A11y gates:** Lighthouse **≥95**; axe-core in CI for violations; reduced-motion snapshots.

---

## 13) Performance Budgets

- **Frame time:** ~16.6ms desktop; target ≥25ms ceiling mid‑phones.
- **Entities:** 200 active (burst 400); projectiles ≤600/s.
- **Bundles:** base app ≤ 200 KB gz; logger layer ≤ **8 KB gz**; defer heavy tools.
- **Workers:** no layout work; isolate hot loops; avoid GC via pooling.

---

## 14) Development Roadmap (Workpack Structure)

**Phase 0 — Foundational Scaffolding & Guardrails (W1-W8)**

"Less thrash, bigger chunks, green pipeline."

- ✅ **W1**: Repo & Standards (monorepo, TS strict, ESLint+Prettier, Husky v9+, commitlint, templates)
- ✅ **W2**: App Shell & Render Host (SvelteKit, Pixi mount, HUD toggle, pooling primitives)
- ✅ **W3**: Worker Sim Harness (worker protocol v1, RNG, fixed clock, offline stub, autorecover)
- ⏳ **W4**: Persistence v1 (Dexie schema, Zod, atomic writes, export/import, migration scaffold)
- ⏳ **W5**: Logging v1 (ring buffer caps, Dexie flush, console sink, export, perf lab)
- ⏳ **W6**: PWA & Update UX (Workbox, precache, manifest/icons, update toast)
- ⏳ **W7**: CI/CD & Previews (Actions, caches, size budgets, Playwright, Lighthouse, PR previews)
- ⏳ **W8**: Dev UX & Docs (feature flags, error boundary, ADRs, CONTRIBUTING, privacy stance)

**Phase 0 Success Criteria**: Base app cold start ≤ 2s; bundle ≤ 200 KB gz; logger ≤ 8 KB gz; deterministic worker sim ≥60fps; Dexie v1 + 3 profiles; structured logging with export; PWA install + update toast; full CI pipeline.

**Phase 1+ — Game Content (After Phase 0)**

- **Core Game Loop**: Shooter-idle mechanics, combat, progression, enchants
- **Meta Systems**: Market/city, collections, automation
- **Polish & Launch**: Performance optimization, accessibility, documentation

---

## 15) Risks & Mitigations

- **Meta overshadowing combat** → Gate meta post‑chapter; hard budgets on income until Ch.1 clear.
- **Offline cheese** → cooldown for rested; caps; session requirement; serverless integrity (seeded RNG).
- **Mobile perf** → early asset budgets; LOD sprites; optional 30 fps fallback.
- **Save corruption** → Zod validation; transactional writes; cloudless export/import.

---

## 16) References (GDD method & structure)

- GitBook: modern GDDs as **living, organized, audience‑aware** internal docs with clear sections and findability.
- Document360 / DEV: **step‑by‑step** GDD elements and best practices (scope, audience, mechanics, UI, a11y, commercialization).
- Assembla: GDD as a **blueprint** that communicates vision, mechanics and features; keep structured and evolving.

---

**Appendix A — Curves (starter tables)**  
_(Omitted here for brevity in the file header; separate CSVs recommended during tuning)._

**Appendix B — PWA Update Toast (sketch)**

```ts
// sw-update.ts (SvelteKit + Workbox register)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
  navigator.serviceWorker.register('/sw.js').then((r) => {
    setInterval(() => r.update(), 60_000);
  });
}
// UI: show toast when waiting SW is present → call skipWaiting via postMessage
```
