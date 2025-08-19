# TypeScript Standards

This document defines TypeScript standards, strict mode enforcement, and development guidelines for
Draconia Chronicles v2.0.0.

## Strict Mode Policy

### Required Compiler Options

All TypeScript code must compile successfully with these strict settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "NodeNext"
  }
}
```

### Policy Rationale

- **`strict: true`**: Enables all strict type checking options  
- **`noImplicitAny: true`**: Prevents implicit any types that hide errors
- **`exactOptionalPropertyTypes: true`**: Enforces precise optional property handling
- **`noUncheckedIndexedAccess: true`**: Requires index signature safety checks
- **`noFallthroughCasesInSwitch: true`**: Prevents accidental switch fallthrough bugs

## Strict Gate Enforcement

### How to Run the Strict Gate

```bash
# Run TypeScript strict mode validation
pnpm run test:ts-strict

# Or directly
node tests/test-ts-strict.mjs
```

### Expected Output

```text
ok - 2 passed
```

### Gate Implementation

The strict gate uses two separate TypeScript projects to validate compliance:

#### Pass Configuration (`tsconfig.strict.should-pass.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noEmit": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "module": "ESNext"
  },
  "include": ["../fixtures/strict/good.ts"]
}
```

#### Fail Configuration (`tsconfig.strict.should-fail.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noEmit": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "module": "ESNext"
  },
  "include": ["../fixtures/strict/bad-implicit-any.ts"]
}
```

### Error Code Assertions

The gate validates specific TypeScript error codes rather than full error messages:

```javascript
// Assert specific error codes (non-brittle)
const output = (result.stderr || result.stdout || "").toString();
assert.ok(output.includes("TS7006") || output.includes("TS7031"), 
  "expected implicit any error codes TS7006/TS7031");
```

**Target Error Codes**:

- **TS7006**: Parameter implicitly has an 'any' type
- **TS7031**: Binding element implicitly has an 'any' type

## Code Examples

### ✅ Good TypeScript (Passes Strict Gate)

**File**: `tests/fixtures/strict/good.ts`

```typescript
type Opt = { title?: string };
export function greet(name: string, opt?: Opt) {
  // exactOptionalPropertyTypes: opt?.title is string | undefined, not string
  const label = opt?.title ? `${opt.title}: ` : "";
  return `${label}Hello, ${name}`;
}
```

**Why it passes**:

- All parameters have explicit types (`name: string`, `opt?: Opt`)
- Optional property handling respects `exactOptionalPropertyTypes`
- No implicit any types anywhere

### ❌ Bad TypeScript (Fails Strict Gate)

**File**: `tests/fixtures/strict/bad-implicit-any.ts`

```typescript
// Should fail with TS7006 (parameter implicitly has 'any')
// and/or TS7031 (binding element implicitly has 'any')
export function bad(a, { b }) {
  return a ?? b;
}
```

**Why it fails**:

- Parameter `a` has no type annotation (implicit any)
- Destructured parameter `{ b }` has no type annotation (implicit any)
- Triggers TS7006 and TS7031 error codes

## Best Practices

### Function Parameters

```typescript
// ❌ Implicit any
function process(data) { return data; }

// ✅ Explicit types
function process(data: unknown): unknown { return data; }
function processUser(user: { name: string }): string { return user.name; }
```

### Object Destructuring  

```typescript
// ❌ Implicit any in destructuring
function handle({ name, age }) { return `${name}: ${age}`; }

// ✅ Explicit types in destructuring  
function handle({ name, age }: { name: string; age: number }): string {
  return `${name}: ${age}`;
}
```

### Optional Properties

```typescript
interface Config {
  title?: string;
  enabled?: boolean;
}

// ❌ Unsafe optional access
function getTitle(config: Config): string {
  return config.title.toUpperCase(); // Error: title might be undefined
}

// ✅ Safe optional access
function getTitle(config: Config): string {
  return config.title ? config.title.toUpperCase() : "DEFAULT";
}
```

### Index Signatures

```typescript
interface Dictionary {
  [key: string]: string;
}

// ❌ Unchecked index access
function getValue(dict: Dictionary, key: string): string {
  return dict[key].trim(); // Error: might be undefined
}

// ✅ Checked index access  
function getValue(dict: Dictionary, key: string): string {
  const value = dict[key];
  return value ? value.trim() : "";
}
```

## Quick Fixes for Common Violations

### Fix TS7006: Parameter Implicitly Has Any

```typescript
// Before (fails strict gate)
function helper(value) { return value; }

// After (passes strict gate)
function helper(value: unknown): unknown { return value; }
```

### Fix TS7031: Binding Element Implicitly Has Any

```typescript
// Before (fails strict gate)  
function extract({ data }) { return data; }

// After (passes strict gate)
function extract({ data }: { data: unknown }): unknown { return data; }
```

### Fix Exact Optional Properties

```typescript
interface User {
  name: string;
  email?: string;
}

// Before (might fail with exactOptionalPropertyTypes)
function formatUser(user: User): string {
  return `${user.name} <${user.email}>`;
}

// After (handles undefined properly)
function formatUser(user: User): string {
  return user.email ? `${user.name} <${user.email}>` : user.name;
}
```

## Configuration Files

### Base Configuration (`tsconfig.base.json`)

The base TypeScript configuration enforces strict mode across the workspace:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "composite": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist", "**/*.test.*"]
}
```

### Gate Test Configurations

Located in `tests/ts-strict/`:

- `tsconfig.strict.should-pass.json` - Validates good TypeScript compiles
- `tsconfig.strict.should-fail.json` - Validates bad TypeScript fails

## Troubleshooting

### "Property does not exist" Errors

```typescript
// Problem: TypeScript doesn't know about dynamic properties
const obj: any = { name: "test" };
console.log(obj.unknownProp); // No error, but dangerous

// Solution: Use proper typing or index signatures
interface MyObject {
  name: string;
  [key: string]: unknown; // Allow additional properties
}
```

### "Object is possibly undefined" Errors

```typescript
// Problem: Optional chaining needed
function getLength(items?: string[]): number {
  return items.length; // Error: items might be undefined
}

// Solution: Use optional chaining or guards
function getLength(items?: string[]): number {
  return items?.length ?? 0;
}
```

### "Type 'undefined' is not assignable" Errors

```typescript
// Problem: exactOptionalPropertyTypes enforcement
interface Config {
  debug?: boolean;
}

const config: Config = {
  debug: undefined // Error with exactOptionalPropertyTypes
};

// Solution: Omit undefined properties or use union types
const config: Config = {}; // Omit the property
// OR
interface Config {
  debug?: boolean | undefined; // Explicitly allow undefined
}
```

## Migration from Non-Strict Code

### Step 1: Enable Strict Mode Gradually

```json
{
  "compilerOptions": {
    // Start with these
    "noImplicitReturns": true,
    "noImplicitAny": true,
    
    // Add these next  
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    
    // Finally enable full strict mode
    "strict": true
  }
}
```

### Step 2: Fix Implicit Any Issues

Run the strict gate and address TS7006/TS7031 errors:

```bash
pnpm run test:ts-strict
# Fix reported implicit any issues
```

### Step 3: Address Optional Property Issues  

Enable `exactOptionalPropertyTypes` and fix undefined handling:

```typescript
// Before
interface User {
  name?: string;
}
const user: User = { name: undefined }; // Will fail

// After  
interface User {
  name?: string;
}
const user: User = {}; // Correct - omit undefined properties
```

## Integration with Development Workflow

### Pre-commit Checks

The TypeScript strict gate runs as part of:

- `pnpm run test:all` - Full test suite execution
- CI/CD pipeline validation  
- Manual quality checks before PR submission

### IDE Configuration

Ensure your IDE uses the project's TypeScript configuration:

1. Point IDE to `tsconfig.base.json`
2. Enable TypeScript strict mode warnings
3. Configure auto-fix for common violations

### Code Review Guidelines

- All new code must pass the strict gate
- No `@ts-ignore` comments without justification
- Prefer explicit types over `any` or `unknown`
- Document complex type definitions with comments

See [ADR-0002: TypeScript Strict Gate](/docs/adr/0002-typescript-strict-gate.md) for the
architectural decision record.
