# E4 Branch Cleanup and E2E Fix Application

## Current Situation

- We're on `feature/p1-e4-s1-arcana-drop-system`

- E2E test fix exists on old `feat/p1-e3-s2-targeting-logic` branch

- Need to apply fix to E4 and clean up old branches

## Step 1: Apply E2E Test Fix

Run this command to cherry-pick the E2E fix:

````bash

git cherry-pick d9ddb0c32839f9613d071878b410c5b65baea859

```bash

If you get a conflict or "already applied" message, the fix might already be in the branch..
Verify by checking `tests/test-e2e-build.mjs` - it should have `execSync` instead of `spawnSync`.

## Step 2: Clean Up Old Local Branches

Delete the following old branches:

```bash

# E3 branch (already merged)

git branch -D feat/p1-e3-s2-targeting-logic

# Old E4 branches if they exist

git branch -D feat/dependency-updates-security-fixes
git branch -D feat/p1-e4-arcana-economy-enchant-system
git branch -D feat/p1-e4-s3-soul-forging-system

```bash

## Step 3: Verify Current State

```bash

# Check current branch

git branch --show-current

# List all local branches

git branch

# List all remote branches

git branch -r

```javascript

## Step 4: Run Tests

```bash

# Run all tests

pnpm run test:all

# Check pipeline status

gh run list --limit 5

```bash

## Step 5: Commit and Push

If cherry-pick created a new commit:

```bash

git push origin feature/p1-e4-s1-arcana-drop-system

```bash

## Expected Result

- Only `feature/p1-e4-s1-arcana-drop-system` and `main` branches should exist locally

- E2E test should pass

- All 162 tests should pass

- Ready to continue E4 work

## Cleanup This File

After completing these steps, delete this file:

```bash

rm E4-BRANCH-CLEANUP-STEPS.md

```text
````
