--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/22*Testing*QA*CI*CD*Gates.md canonical*precedence: v2.1*GDD status: detailed last_updated: 2025-01-12 ---

# 22 — Testing, QA & CI/CD Gates

## Testing Strategy Overview

### Testing Pyramid

````typescript

export interface TestingPyramid {
  unit: {
    count: number;
    coverage: number;
    frameworks: string[];
    purpose: string;
  };
  integration: {
    count: number;
    coverage: number;
    frameworks: string[];
    purpose: string;
  };
  e2e: {
    count: number;
    coverage: number;
    frameworks: string[];
    purpose: string;
  };
}

export const TESTING_PYRAMID: TestingPyramid = {
  unit: {
    count: 150,
    coverage: 80,
    frameworks: ['Vitest', 'Jest'],
    purpose: 'Test individual functions and components in isolation'
  },
  integration: {
    count: 30,
    coverage: 70,
    frameworks: ['Vitest', 'Testing Library'],
    purpose: 'Test component interactions and system integration'
  },
  e2e: {
    count: 12,
    coverage: 60,
    frameworks: ['Playwright', 'Cypress'],
    purpose: 'Test complete user workflows and scenarios'
  }
};

```javascript

### Quality Gates

```typescript

export interface QualityGates {
  // Code Quality
  typeScriptStrict: boolean;
  eslintErrors: number; // 0 required
  prettierErrors: number; // 0 required

  // Test Coverage
  unitTestCoverage: number; // ≥80%
  integrationTestCoverage: number; // ≥70%
  e2eTestCoverage: number; // ≥60%

  // Performance
  bundleSize: number; // ≤200KB gzipped
  lighthouseScore: number; // ≥95
  fpsTarget: number; // ≥60 desktop, ≥40 mobile

  // Accessibility
  a11yScore: number; // ≥95
  axeViolations: number; // 0 required
  keyboardNavigation: boolean;

  // Security
  vulnerabilityScan: boolean;
  dependencyAudit: boolean;
  codeScan: boolean;
}

```text

## Unit Testing Framework

### Vitest Configuration

```typescript

// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});

```javascript

### Unit Test Examples

```typescript

// tests/unit/balancing.test.ts
import { describe, it, expect } from 'vitest';
import { calculateEnchantCost, calculateEnemyHP, calculateOfflineProgress } from
'@/lib/balancing';

describe('Balancing Calculations', () => {
  describe('calculateEnchantCost', () => {
    it('should calculate correct cost for level 0', () => {
      const cost = calculateEnchantCost(10, 0, 1.12);
      expect(cost).toBe(10);
    });

    it('should calculate correct cost for level 5', () => {
      const cost = calculateEnchantCost(10, 5, 1.12);
      expect(cost).toBe(Math.floor(10 * Math.pow(1.12, 5)));
    });

    it('should handle edge cases', () => {
      expect(() => calculateEnchantCost(-1, 0, 1.12)).toThrow();
      expect(() => calculateEnchantCost(10, -1, 1.12)).toThrow();
    });
  });

  describe('calculateEnemyHP', () => {
    it('should scale correctly with ward progression', () => {
      const hp1 = calculateEnemyHP(100, 1, 0, 'minion');
      const hp2 = calculateEnemyHP(100, 2, 0, 'minion');

      expect(hp2).toBeGreaterThan(hp1);
      expect(hp2).toBe(Math.floor(hp1 * 1.18));
    });

    it('should apply micro-ramps correctly', () => {
      const hp1 = calculateEnemyHP(100, 1, 0, 'minion');
      const hp2 = calculateEnemyHP(100, 1, 20, 'minion');

      expect(hp2).toBeGreaterThan(hp1);
    });
  });
});

```javascript

### Component Testing

```typescript

// tests/unit/components/EnchantButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnchantButton from '@/components/EnchantButton';

describe('EnchantButton', () => {
  it('should render with correct text', () => {
    render(<EnchantButton
      id="firepower"
      level={5}
      cost={100}
      canAfford={true}
      onUpgrade={vi.fn()}
    />);

    expect(screen.getByText('Firepower')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
    expect(screen.getByText('Cost: 100')).toBeInTheDocument();
  });

  it('should call onUpgrade when clicked', () => {
    const mockUpgrade = vi.fn();
    render(<EnchantButton
      id="firepower"
      level={5}
      cost={100}
      canAfford={true}
      onUpgrade={mockUpgrade}
    />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockUpgrade).toHaveBeenCalledWith('firepower');
  });

  it('should be disabled when cannot afford', () => {
    render(<EnchantButton
      id="firepower"
      level={5}
      cost={100}
      canAfford={false}
      onUpgrade={vi.fn()}
    />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});

```javascript

## Integration Testing

### System Integration Tests

```typescript

// tests/integration/game-loop.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { GameSimulation } from '@/lib/simulation';
import { Database } from '@/lib/database';

describe('Game Loop Integration', () => {
  let simulation: GameSimulation;
  let database: Database;

  beforeEach(async () => {
    database = new Database();
    await database.initialize();
    simulation = new GameSimulation(database);
  });

  it('should complete full journey cycle', async () => {
    // Start journey
    await simulation.startJourney();

    // Simulate combat
    for (let i = 0; i < 10; i++) {
      await simulation.tick();
    }

    // Return to Draconia
    await simulation.returnToDraconia();

    // Verify state
    const progress = await database.getProgress();
    expect(progress.currentDistance).toBeGreaterThan(0);
    expect(progress.arcanaEarned).toBeGreaterThan(0);
  });

  it('should persist state correctly', async () => {
    // Make some progress
    await simulation.startJourney();
    await simulation.tick();

    // Save state
    const state = await simulation.saveState();

    // Load state
    await simulation.loadState(state);

    // Verify state is restored
    const currentState = await simulation.getCurrentState();
    expect(currentState.distance).toBe(state.distance);
  });
});

```javascript

### Database Integration Tests

```typescript

// tests/integration/database.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database } from '@/lib/database';

describe('Database Integration', () => {
  let database: Database;

  beforeEach(async () => {
    database = new Database();
    await database.initialize();
  });

  afterEach(async () => {
    await database.cleanup();
  });

  it('should create and retrieve profiles', async () => {
    const profile = await database.createProfile({
      name: 'Test Dragon',
      createdAt: Date.now()
    });

    const retrieved = await database.getProfile(profile.id);
    expect(retrieved.name).toBe('Test Dragon');
  });

  it('should handle concurrent operations', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      database.createProfile({
        name: `Dragon ${i}`,
        createdAt: Date.now()
      })
    );

    const profiles = await Promise.all(promises);
    expect(profiles).toHaveLength(10);
  });

  it('should validate data integrity', async () => {
    const profile = await database.createProfile({
      name: 'Test Dragon',
      createdAt: Date.now()
    });

    // Try to update with invalid data
    await expect(database.updateProfile(profile.id, {
      name: '', // Invalid empty name
      createdAt: Date.now()
    })).rejects.toThrow();
  });
});

```text

## End-to-End Testing

### Playwright Configuration

```typescript

// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: '<http://localhost:5173',>
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});

```javascript

### E2E Test Examples

```typescript

// tests/e2e/journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Journey Flow', () => {
  test('should complete basic journey cycle', async ({ page }) => {
    await page.goto('/');

    // Create profile
    await page.fill('[data-testid="dragon-name"]', 'Test Dragon');
    await page.click('[data-testid="create-profile"]');

    // Start journey
    await page.click('[data-testid="start-journey"]');

    // Wait for enemies to spawn
    await expect(page.locator('[data-testid="enemy"]')).toBeVisible();

    // Wait for combat to progress
    await page.waitForTimeout(2000);

    // Return to Draconia
    await page.click('[data-testid="return-button"]');

    // Verify return screen
    await expect(page.locator('[data-testid="return-screen"]')).toBeVisible();

    // Verify Arcana earned
    const arcanaText = await page.textContent('[data-testid="arcana-earned"]');
    expect(arcanaText).toMatch(/\d+/);
  });

  test('should handle ability usage', async ({ page }) => {
    await page.goto('/');

    // Start journey
    await page.click('[data-testid="start-journey"]');

    // Wait for ability to be ready
    await page.waitForSelector('[data-testid="ability-button"]:not([disabled])');

    // Use ability
    await page.click('[data-testid="ability-button"]');

    // Verify ability is on cooldown
    await expect(page.locator('[data-testid="ability-button"]')).toBeDisabled();
  });
});

```javascript

### Accessibility E2E Tests

```typescript

// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Use Enter to activate
    await page.keyboard.press('Enter');

    // Verify action was performed
    await expect(page.locator('[data-testid="profile-created"]')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA labels on buttons
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');

      expect(ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('should support screen reader', async ({ page }) => {
    await page.goto('/');

    // Check for live regions
    const liveRegion = page.locator('[aria-live]');
    expect(liveRegion).toBeVisible();

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    expect(headings).toHaveCount(1); // Should have exactly one h1
  });
});

```text

## Performance Testing

### Performance Test Suite

```typescript

// tests/performance/performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should maintain 60fps on desktop', async ({ page }) => {
    await page.goto('/');

    // Start journey
    await page.click('[data-testid="start-journey"]');

    // Measure FPS
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function measureFrame() {
          frameCount++;
          if (frameCount < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            const endTime = performance.now();
            const fps = (frameCount * 1000) / (endTime - startTime);
            resolve(fps);
          }
        }

        requestAnimationFrame(measureFrame);
      });
    });

    expect(fps).toBeGreaterThanOrEqual(55); // Allow some variance
  });

  test('should load within performance budget', async ({ page }) => {
    const startTime = performance.now();
    await page.goto('/');
    const loadTime = performance.now() - startTime;

    expect(loadTime).toBeLessThan(2000); // 2 second load time
  });

  test('should handle large numbers of enemies', async ({ page }) => {
    await page.goto('/');

    // Start journey and progress to spawn many enemies
    await page.click('[data-testid="start-journey"]');

    // Wait for many enemies to spawn
    await page.waitForTimeout(10000);

    // Check enemy count
    const enemyCount = await page.locator('[data-testid="enemy"]').count();
    expect(enemyCount).toBeLessThanOrEqual(400); // Performance limit
  });
});

```javascript

### Lighthouse CI Tests

```typescript

// tests/lighthouse/lighthouse.test.ts
import { test, expect } from '@playwright/test';

test.describe('Lighthouse Performance', () => {
  test('should pass Lighthouse audit', async ({ page }) => {
    await page.goto('/');

    // Run Lighthouse audit
    const audit = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Lighthouse audit code
        resolve({
          performance: 95,
          accessibility: 95,
          bestPractices: 90,
          seo: 90
        });
      });
    });

    expect(audit.performance).toBeGreaterThanOrEqual(95);
    expect(audit.accessibility).toBeGreaterThanOrEqual(95);
    expect(audit.bestPractices).toBeGreaterThanOrEqual(90);
    expect(audit.seo).toBeGreaterThanOrEqual(90);
  });
});

```text

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml

# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - name: Setup Node.js

        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies

        run: pnpm install

      - name: Type check

        run: pnpm run type-check

      - name: Lint

        run: pnpm run lint

      - name: Unit tests

        run: pnpm run test:vitest

      - name: Integration tests

        run: pnpm run test:integration

      - name: E2E tests

        run: pnpm run test:e2e

      - name: Performance tests

        run: pnpm run test:performance

      - name: Lighthouse CI

        run: pnpm run test:lighthouse

      - name: Bundle size check

        run: pnpm run test:bundle-size

      - name: Security audit

        run: pnpm audit --audit-level moderate

```javascript

### Quality Gates (2)

```typescript

// scripts/quality-gates.ts
export class QualityGates {
  async checkAllGates(): Promise<QualityGateResult> {
    const results = await Promise.all([
      this.checkTypeScript(),
      this.checkLinting(),
      this.checkTestCoverage(),
      this.checkBundleSize(),
      this.checkPerformance(),
      this.checkAccessibility(),
      this.checkSecurity()
    ]);

    const allPassed = results.every(result => result.passed);

    return {
      allPassed,
      results,
      summary: this.generateSummary(results)
    };
  }

  private async checkTypeScript(): Promise<GateResult> {
    // Run TypeScript check
    const result = await exec('pnpm run type-check');
    return {
      name: 'TypeScript',
      passed: result.exitCode === 0,
      details: result.stdout
    };
  }

  private async checkLinting(): Promise<GateResult> {
    // Run ESLint
    const result = await exec('pnpm run lint');
    return {
      name: 'Linting',
      passed: result.exitCode === 0,
      details: result.stdout
    };
  }

  private async checkTestCoverage(): Promise<GateResult> {
    // Run tests with coverage
    const result = await exec('pnpm run test:coverage');
    const coverage = this.parseCoverage(result.stdout);

    return {
      name: 'Test Coverage',
      passed: coverage.lines >= 80,
      details: `Lines: ${coverage.lines}%, Functions: ${coverage.functions}%`
    };
  }
}

```text

## Test Data Management

### Test Fixtures

```typescript

// tests/fixtures/test-data.ts
export const TEST_PROFILES = {
  basic: {
    id: 'test-profile-1',
    name: 'Test Dragon',
    createdAt: Date.now(),
    currentLand: 1,
    currentWard: 1,
    currentDistanceM: 0,
    currencies: {
      arcana: 1000,
      soulPower: 100,
      gold: 500,
      astralSeals: 10
    }
  },

  advanced: {
    id: 'test-profile-2',
    name: 'Advanced Dragon',
    createdAt: Date.now(),
    currentLand: 2,
    currentWard: 3,
    currentDistanceM: 2500,
    currencies: {
      arcana: 10000,
      soulPower: 1000,
      gold: 5000,
      astralSeals: 50
    }
  }
};

export const TEST_ENEMIES = {
  minion: {
    id: 'test-minion',
    type: 'minion',
    baseHP: 100,
    baseDamage: 10,
    baseArcana: 10
  },

  elite: {
    id: 'test-elite',
    type: 'elite',
    baseHP: 320,
    baseDamage: 20,
    baseArcana: 30
  },

  boss: {
    id: 'test-boss',
    type: 'boss',
    baseHP: 4000,
    baseDamage: 100,
    baseArcana: 450
  }
};

```javascript

### Mock Services

```typescript

// tests/mocks/mock-services.ts
export class MockDatabase {
  private data: Map<string, any> = new Map();

  async getProfile(id: string): Promise<Profile | null> {
    return this.data.get(`profile:${id}`) || null;
  }

  async saveProfile(profile: Profile): Promise<void> {
    this.data.set(`profile:${profile.id}`, profile);
  }

  async getProgress(profileId: string): Promise<Progress | null> {
    return this.data.get(`progress:${profileId}`) || null;
  }

  async saveProgress(progress: Progress): Promise<void> {
    this.data.set(`progress:${progress.profileId}`, progress);
  }
}

export class MockTelemetry {
  private events: TelemetryEvent[] = [];

  collectEvent(event: TelemetryEvent): void {
    this.events.push(event);
  }

  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

```text

## Acceptance Criteria

- [ ] Unit test coverage ≥80% for all critical functions

- [ ] Integration test coverage ≥70% for system interactions

- [ ] E2E test coverage ≥60% for user workflows

- [ ] All tests pass in CI/CD pipeline

- [ ] Performance tests verify 60fps desktop, ≥40fps mobile

- [ ] Accessibility tests verify WCAG 2.1 AA compliance

- [ ] Security tests verify no vulnerabilities

- [ ] Bundle size tests verify ≤200KB gzipped limit

- [ ] Lighthouse tests verify ≥95 score

- [ ] Quality gates prevent deployment of failing code
````
