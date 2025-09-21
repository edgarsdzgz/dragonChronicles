# Story Testing Process (MANDATORY)

**Purpose**: Ensure every story has comprehensive testing and validation before proceeding to the next story.

## Overview

Every story must include testing and validation as part of the implementation, not as a separate testing phase. This prevents bugs from accumulating and makes debugging more focused.

## Mandatory Testing Requirements

### 1. Unit Tests (Required for all code)

**What to test**:

- All public functions and methods
- Edge cases and error conditions
- Input validation and type safety
- Return value correctness

**Coverage requirement**: Minimum 80% code coverage for new code

**When to write**: During implementation, not after

### 2. Integration Tests (Required for system interactions)

**What to test**:

- Component interactions
- Data flow between modules
- Configuration loading and validation
- Error handling across boundaries

**Coverage requirement**: All integration points must be tested

**When to write**: After unit tests, before story completion

### 3. Performance Tests (Required for performance-critical code)

**What to test**:

- Memory usage and leaks
- Execution time benchmarks
- Resource utilization
- Scalability limits

**Coverage requirement**: All performance-critical paths

**When to write**: For any code with performance requirements

### 4. Linting and Code Quality (Required for all code)

**What to check**:

- ESLint compliance (zero errors)
- TypeScript strict mode (zero errors)
- Prettier formatting
- Code style consistency

**Coverage requirement**: 100% compliance

**When to check**: Before every commit

## Story Testing Workflow

### Phase 1: Implementation with Unit Tests

```
1. Write function/method
2. Write unit test immediately
3. Run tests to verify
4. Refactor if needed
5. Repeat for next function
```

### Phase 2: Integration Testing

```
1. Complete all unit tests
2. Write integration tests for component interactions
3. Test error handling and edge cases
4. Verify data flow correctness
```

### Phase 3: Performance Validation

```
1. Run performance benchmarks
2. Check memory usage
3. Validate scalability limits
4. Optimize if needed
```

### Phase 4: Quality Gates

```
1. Run all linting checks
2. Ensure TypeScript strict compliance
3. Format code with Prettier
4. Run full test suite
```

## Testing Infrastructure

### Test File Organization

```
packages/[package]/tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for component interactions
├── performance/    # Performance and benchmark tests
└── fixtures/       # Test data and mock objects
```

### Test Naming Convention

```
[component].[feature].spec.ts     # Unit tests
[component].integration.spec.ts   # Integration tests
[component].performance.spec.ts   # Performance tests
```

### Test Structure

```typescript
describe('[Component] [Feature]', () => {
  describe('Happy Path', () => {
    it('should work correctly with valid input', () => {
      // Test implementation
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge case X', () => {
      // Test implementation
    });
  });

  describe('Error Handling', () => {
    it('should handle error condition Y', () => {
      // Test implementation
    });
  });
});
```

## Quality Gates Checklist

Before marking a story as complete:

- [ ] All unit tests written and passing
- [ ] All integration tests written and passing
- [ ] Performance tests written and passing (if applicable)
- [ ] ESLint: zero errors
- [ ] TypeScript: zero errors (strict mode)
- [ ] Prettier: all code formatted
- [ ] Test coverage: minimum 80% for new code
- [ ] All tests pass in CI/CD pipeline

## Testing Tools and Commands

### Running Tests

```bash
# Run all tests for a package
pnpm --filter @draconia/[package] test

# Run specific test file
pnpm --filter @draconia/[package] test [test-file]

# Run tests with coverage
pnpm --filter @draconia/[package] test --coverage
```

### Linting and Formatting

```bash
# Run ESLint
pnpm run lint

# Fix ESLint issues
pnpm run lint --fix

# Format code with Prettier
pnpm run format

# TypeScript type checking
pnpm run type-check
```

### Performance Testing

```bash
# Run performance benchmarks
pnpm run test:performance

# Memory profiling
pnpm run test:memory
```

## Story Completion Criteria

A story is NOT complete until:

1. **All code is tested** - Unit, integration, and performance tests
2. **All quality gates pass** - Linting, TypeScript, formatting
3. **Test coverage meets requirements** - Minimum 80% for new code
4. **All tests pass in CI/CD** - No failing tests in pipeline
5. **Documentation is updated** - Code is properly documented
6. **Performance requirements met** - Meets specified performance targets

## Benefits of This Process

### Immediate Benefits

- **Faster debugging** - Issues caught early in development
- **Higher code quality** - Tests drive better design
- **Confidence in changes** - Know exactly what works and what doesn't
- **Easier refactoring** - Tests provide safety net

### Long-term Benefits

- **Reduced technical debt** - No accumulation of untested code
- **Faster development** - Less time debugging later
- **Better architecture** - Tests reveal design issues early
- **Easier maintenance** - Well-tested code is easier to modify

## Common Testing Patterns

### Mocking External Dependencies

```typescript
import { vi } from 'vitest';

// Mock external dependencies
vi.mock('@draconia/engine', () => ({
  createRng: vi.fn(),
  // ... other mocks
}));
```

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expectedValue);
});
```

### Testing Error Conditions

```typescript
it('should throw error for invalid input', () => {
  expect(() => {
    functionWithValidation(invalidInput);
  }).toThrow('Expected error message');
});
```

### Performance Testing

```typescript
it('should complete within performance budget', () => {
  const start = performance.now();
  performOperation();
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(MAX_DURATION);
});
```

## Integration with CI/CD

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "pnpm run test:all"
    }
  }
}
```

### Lint-staged Configuration

```json
{
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.{ts,js}": ["vitest related --run"]
  }
}
```

## Emergency Procedures

### If Tests Fail

1. **Don't commit** - Fix tests before committing
2. **Debug systematically** - Use test output to identify issues
3. **Update tests if needed** - Tests might be wrong, not just code
4. **Verify fixes** - Run tests again to confirm

### If Quality Gates Fail

1. **Fix linting issues** - Use auto-fix where possible
2. **Fix TypeScript errors** - Address type issues
3. **Format code** - Run Prettier to fix formatting
4. **Re-run checks** - Verify all issues are resolved

---

**Remember**: Testing is not a separate phase - it's part of the implementation process. Every line of code should be tested as it's written, not after the fact.
