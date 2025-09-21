# Best Practices Quick Reference Guide

**Purpose**: Quick reference for developers and AI assistants to ensure consistent
high-quality code and documentation.

## 🚨 Critical Quality Gates (NEVER BYPASS)

### Before Writing Code

- [ ] Read `.cursorrules` file

- [ ] Check pipeline status: `gh run list --limit 5`

- [ ] Create feature branch (never work on main)

- [ ] Create planning document if needed

- [ ] **For game features**: Read relevant Draconia Tome document(s)

- [ ] **For game content**: Verify alignment with lore and balance specs

### While Writing Code

- [ ] Follow SOLID principles

- [ ] Use meaningful names

- [ ] Keep functions small (single responsibility)

- [ ] Add TypeScript types (strict mode)

- [ ] Document complex logic

### Before Committing

- [ ] Run `pnpm run lint` (zero errors)

- [ ] Run `pnpm run format` (consistent formatting)

- [ ] Run `pnpm run type-check` (zero TypeScript errors)

- [ ] Run `pnpm run test:all` (all 192 tests pass)

- [ ] Update documentation for new code

### Before PR Creation

- [ ] Verify all new functions documented in CLAUDE.md

- [ ] Verify architecture docs updated if needed

- [ ] Verify no undocumented environment variables

- [ ] Create ADRs for significant technical decisions

- [ ] **For game features**: Verify alignment with Draconia Tome specs

- [ ] **For game content**: Verify lore and balance compliance

- [ ] **For debugging sessions**: Verify complete chronicles documentation

- [ ] **For debugging sessions**: Verify handoff documents and automation scripts

- [ ] Get user approval for PR creation

## 📝 Documentation Checklist

### New Function Added

````typescript

/**

  * Calculates dragon flight trajectory based on wind conditions

  * @param startPosition - Initial dragon position {x, y}

  * @param windVector - Wind force and direction {force, angle}

  * @param duration - Flight duration in milliseconds

  * @returns Trajectory points array for smooth animation

  * @throws {Error} When wind force exceeds safe limits

 */

```text

- [ ] Update CLAUDE.md with function purpose

- [ ] Add usage example

- [ ] Document parameters and return values

### New File Created

- [ ] Document file purpose in CLAUDE.md

- [ ] Explain integration points

- [ ] Update architecture documentation

- [ ] Add to relevant package documentation

### Architecture Change

- [ ] Create ADR in `docs/adr/`

- [ ] Update system design documentation

- [ ] Document migration steps if needed

- [ ] Update CLAUDE.md with new patterns

### Game Feature Added

- [ ] Reference relevant Draconia Tome document (see quick reference below)

- [ ] Follow tome data contracts and TypeScript interfaces

- [ ] Implement according to tome acceptance criteria

- [ ] Verify performance targets met (60 fps desktop, ≥40 fps mobile)

- [ ] Ensure lore and world consistency

- [ ] Document any deviations with ADR justification

### New Game Mechanics/Lore/Systems Developed

- [ ] **MANDATORY**: Update relevant tome document with complete specifications

- [ ] Include TypeScript interfaces for all data structures

- [ ] Add mathematical formulas for balance calculations

- [ ] Ensure lore consistency with established world

- [ ] Update cross-references to related tome documents

- [ ] Define acceptance criteria for implementation verification

- [ ] Validate against existing systems for conflicts

### Debugging Session Conducted

- [ ] **MANDATORY**: Create debugging chronicle in `docs/engineering/`

- [ ] Document session overview, issues resolved, key learnings

- [ ] Include current status and remaining issues

- [ ] List all automation scripts created with purposes

- [ ] Create quick reference document for continuation

- [ ] Create handoff document for AI transitions

- [ ] Integrate new debugging patterns into project rules

## 🐉 Game Design Quick Reference

### Draconia Tome Navigation

- **Start Here**: `draconiaChroniclesDocs/README.md`

- **Master Index**: `draconiaChroniclesDocs/tome/00*TOME*Index_v2.2.md`

- **Precedence**: v2.1 GDD wins over tome if conflicts exist

### Key Documents by Feature Area

- **Core Gameplay**: `03*ShooterIdle*Core_Loop.md`

- **Combat & Enemies**: `05*Combat*Systems*Enemies*Bosses.md`

- **Player Progression**: `04*Progression*Maps*Wards*Lands.md`

- **Economy**: `07*Economy*Currencies*Items*Market.md`

- **Frontend Tech**: `12*Tech*Architecture_Frontend.md`

- **Simulation**: `13*Simulation*Workers_Protocol.md`

- **Rendering**: `14*Rendering*Pixi*Perf*Budgets.md`

- **Database**: `15*Persistence*Save*Dexie*Schema.md`

- **Tech Trees**: `16*Firecraft*Safety*Scales*Tech_Trees.md`

### Critical Game Balance Rules

- **Research Discovery**: ALL tech nodes hidden until discovered

- **Combat Balance**: ≥70% Journey research, ≤30% town/meta

- **Manual Contribution**: ~20% ±10% damage from player abilities

- **Economic Growth**: Arcana ×1.12, Soul Power ×1.90

- **Performance**: 60 fps desktop, ≥40 fps mobile, ≤600 projectiles/s

### Tome Update Requirements (MANDATORY)

- **New Game Mechanics**: Update relevant tome with complete specs

- **New Lore**: Add canonical information to appropriate tome document

- **New Balance Rules**: Update mathematical models in tome

- **New Content**: Update bestiary, economy, or region documents

- **Modified Systems**: Update existing tome specifications

### Debugging Chronicles Requirements (MANDATORY)

- **Pipeline Failures**: Create comprehensive debugging chronicle

- **Quality Gate Failures**: Document systematic debugging approach

- **Performance Issues**: Chronicle profiling results and solutions

- **Integration Problems**: Document cross-system debugging process

- **Environment Issues**: Chronicle environment-specific fixes

- **All Sessions**: Include handoff documents and automation scripts

## 🎯 Code Quality Standards

### TypeScript Excellence

```typescript

// ✅ GOOD: Explicit types, meaningful names
interface DragonFlightConfig {
  readonly speed: number;
  readonly altitude: number;
  readonly windResistance: number;
}

function calculateFlightPath(
  config: DragonFlightConfig,
  destination: Position
): Promise<FlightPath> {
  // Implementation
}

// ❌ BAD: Any types, unclear names
function calc(c: any, d: any): any {
  // Implementation
}

```javascript

### Game Development Patterns

```typescript

// ✅ GOOD: ECS pattern
interface PositionComponent {
  x: number;
  y: number;
}

interface VelocityComponent {
  dx: number;
  dy: number;
}

// System operates on entities with specific components
function updateMovement(
  entities: Entity[],
  positions: Map<EntityId, PositionComponent>,
  velocities: Map<EntityId, VelocityComponent>
) {
  // Update logic
}

```javascript

### Performance Patterns

```typescript

// ✅ GOOD: Object pooling
class DragonPool {
  private pool: Dragon[] = [];

  acquire(): Dragon {
    return this.pool.pop() || new Dragon();
  }

  release(dragon: Dragon): void {
    dragon.reset();
    this.pool.push(dragon);
  }
}

// ✅ GOOD: Fixed timestep
const FIXED_TIMESTEP = 1000 / 60; // 60 FPS
let accumulator = 0;

function gameLoop(deltaTime: number) {
  accumulator += deltaTime;

  while (accumulator >= FIXED_TIMESTEP) {
    updateSimulation(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
  }

  render(accumulator / FIXED_TIMESTEP);
}

```text

## 🧪 Testing Standards

### Test Structure

```typescript

// ✅ GOOD: Descriptive name, AAA pattern
test('calculateFlightPath returns valid trajectory for normal wind conditions', () => {
  // Arrange
  const config: DragonFlightConfig = {
    speed: 100,
    altitude: 500,
    windResistance: 0.8
  };
  const destination = { x: 1000, y: 800 };

  // Act
  const result = calculateFlightPath(config, destination);

  // Assert
  expect(result.points).toHaveLength(10);
  expect(result.duration).toBeGreaterThan(0);
  expect(result.points[0]).toEqual({ x: 0, y: 0 });
});

```javascript

### Test Coverage Requirements

- [ ] Unit tests: 54+ tests (isolated functions)

- [ ] Integration tests: 26+ tests (component interaction)

- [ ] Database tests: 70+ tests (persistence layer)

- [ ] Render tests: 40+ tests (UI components)

- [ ] E2E tests: 2+ tests (full user journeys)

## 🔧 Common Commands

### Development

```bash

# Setup

pnpm install

# Development (2)

pnpm run dev:web          # Start web app
pnpm run dev:sandbox      # Start sandbox CLI

# Quality checks

pnpm run lint             # ESLint check
pnpm run format           # Prettier format
pnpm run type-check       # TypeScript validation
pnpm run test:all         # Run all tests

# Pipeline status

gh run list --limit 5     # Check workflow status

```bash

### Documentation

```bash

# Test markdown

npx markdownlint -c .markdownlint.json file.md

# Fix markdown issues

python scripts/fix-markdown-universal.py

# Check documentation completeness

grep -r "TODO" docs/

```text

## 🚫 Common Anti-Patterns to Avoid

### Code Anti-Patterns

```typescript

// ❌ BAD: Unclear names, any types
function doStuff(data: any): any {
  return data.map(x => x.thing);
}

// ❌ BAD: Large functions, multiple responsibilities
function handleEverything(input: any) {
  // 100+ lines of mixed concerns
}

// ❌ BAD: Magic numbers
if (dragon.speed > 150) { // What does 150 represent?
  dragon.boost();
}

```javascript

### Documentation Anti-Patterns

```typescript

// ❌ BAD: Obvious comments
const x = 5; // Set x to 5

// ❌ BAD: Outdated comments
// This function calculates area (but now calculates volume)
function calculateArea() {
  return width * height * depth;
}

```javascript

### Testing Anti-Patterns

```typescript

// ❌ BAD: Unclear test name
test('test1', () => {
  expect(func()).toBe(true);
});

// ❌ BAD: Testing implementation details
test('should call internal method', () => {
  const spy = jest.spyOn(obj, '_internalMethod');
  obj.publicMethod();
  expect(spy).toHaveBeenCalled();
});

```text

## 📊 Quality Metrics to Track

### Code Quality

- [ ] ESLint errors: 0

- [ ] TypeScript errors: 0

- [ ] Test coverage: >80%

- [ ] Cyclomatic complexity: <10 per function

- [ ] Bundle size: Within budgets

### Process Quality

- [ ] Pipeline success rate: 100%

- [ ] Average review time: <24 hours

- [ ] Documentation coverage: All new code documented

- [ ] Performance regression: None

## 🔄 Continuous Improvement

### Regular Reviews

- [ ] Weekly: Code quality metrics review

- [ ] Monthly: Best practices effectiveness assessment

- [ ] Quarterly: Industry standards alignment check

- [ ] Annually: Comprehensive process overhaul

### Knowledge Sharing

- [ ] Document lessons learned

- [ ] Share discoveries with team

- [ ] Update this guide regularly

- [ ] Contribute to industry knowledge

---

**Remember**: Quality is not negotiable. These practices exist to ensure consistent, maintainable, and excellent code. When in doubt, err on the side of higher quality and better documentation.

````
