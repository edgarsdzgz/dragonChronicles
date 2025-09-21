# Debugging Chronicles System

## MANDATORY Debugging Documentation

**CRITICAL REQUIREMENT**: All debugging sessions must be documented as chronicles in `docs/engineering/` following the established format and templates.

## Required Chronicle Files

When encountering any bug or debugging session, you MUST create/update these files:

### 1. Session Documentation

- **File**: `docs/engineering/[issue-name]-debugging-session.md`

- **Purpose**: Complete session chronicle with detailed breakdown

- **Required**: Yes, for every debugging session

### 2. Quick Reference

- **File**: `docs/engineering/quick-reference-continuation.md`

- **Purpose**: Immediate actions and current status

- **Required**: Update with current status and next steps

### 3. Handoff Document

- **File**: `docs/engineering/session-handoff-complete.md`

- **Purpose**: Comprehensive handoff for AI transitions

- **Required**: Update for seamless continuity

## Chronicle Template Structure

Every debugging chronicle MUST include:

1. **Session Overview**
   - Date and duration

   - Objectives and scope

   - Key issues addressed

1. **Issues Resolved**
   - Detailed breakdown of each problem

   - Root cause analysis

   - Solution applied with evidence

1. **Key Learnings**
   - Patterns discovered

   - Automation scripts created

   - Configuration changes made

1. **Current Status**
   - Workflow status (X/6 passing)

   - Remaining issues

   - Next steps with priorities

1. **Automation Scripts**
   - List of scripts created

   - Purpose and usage instructions

   - Location in `/scripts/` directory

1. **Memory Rules**
   - New rules discovered

   - Updates to CLAUDE.md

   - Process improvements

1. **Handoff Instructions**
   - Specific commands for continuation

   - Context for next developer/AI

   - Critical state information

## Required Actions for Each Debugging Session

### Before Starting

1. Create feature branch for debugging work

1. Document initial problem state

1. Set clear objectives for the session

### During Debugging

1. **Document Each Step**: Record every attempt, failure, and discovery

1. **Capture Evidence**: Screenshots, logs, command outputs

1. **Note Patterns**: Recurring issues, common solutions

1. **Create Scripts**: Automate repetitive tasks (3+ manual attempts)

### After Debugging

1. **Create/Update Chronicle**: Complete documentation in `docs/engineering/`

1. **Update Quick Reference**: Current status and immediate next steps

1. **Update Handoff Document**: Comprehensive guide for transitions

1. **Document Automation**: Record all scripts created and purposes

1. **Update CLAUDE.md**: Add new memory rules and patterns

1. **Verify Status**: Check `gh run list --limit 5` for pipeline status

## Debugging Patterns to Follow

### 1. Systematic Approach

- **One Issue at a Time**: Focus on single problem to completion

- **Document Each Fix**: Record solution with verification

- **Test Thoroughly**: Ensure fix doesn't break other functionality

### 2. Pipeline-First Strategy

- **Trust GitHub Actions**: Use CI logs as source of truth over local tests

- **Workflow-by-Workflow**: Fix one failing workflow completely before moving to next

- **Online Research**: Use web search to find known solutions

### 3. Automation Priority

- **3+ Manual Attempts**: Create automation script

- **Repetitive Tasks**: Build reusable tools in `/scripts/`

- **Document Scripts**: Include purpose, usage, and examples

### 4. Evidence-Based Solutions

- **Concrete Proof**: Provide reproducible evidence for all claims

- **Before/After**: Show exact changes and verification

- **Command Outputs**: Include exact terminal results

## Quality Gates for Debugging Chronicles

### Documentation Requirements

- ✅ Complete chronicle created in `docs/engineering/`

- ✅ Quick reference updated with current status

- ✅ Handoff document comprehensive for AI transitions

- ✅ All automation scripts documented and committed

- ✅ Memory rules updated in CLAUDE.md

### Technical Requirements

- ✅ Root cause identified and documented

- ✅ Solution verified with objective evidence

- ✅ No regression in existing functionality

- ✅ Pipeline status improved or maintained

### Process Requirements

- ✅ Systematic approach followed (one issue at a time)

- ✅ All attempts documented with outcomes

- ✅ Automation created for repetitive tasks

- ✅ Knowledge preserved for future reference

## Integration with Development Workflow

### When Debugging is Required

- **Pipeline Failures**: Any GitHub Actions workflow failure

- **Test Failures**: Unit, integration, or E2E test issues

- **Build Errors**: TypeScript, ESLint, or compilation problems

- **Performance Issues**: Size budget violations or slow builds

- **Configuration Problems**: Tool setup or environment issues

### Debugging Triggers

- **Automatic**: When CI/CD pipeline fails

- **Manual**: When encountering unexpected behavior

- **Scheduled**: Regular health checks and maintenance

### Documentation Location

- **Primary**: `docs/engineering/` directory

- **Reference**: Links in CLAUDE.md and memory.md

- **Scripts**: `/scripts/` directory with documentation

- **Templates**: Follow existing chronicle format

## Example Chronicle Structure

````markdown
# [Issue Name] Debugging Session

## Session Overview

- **Date**: YYYY-MM-DD

- **Duration**: X hours

- **Objective**: Fix failing CI pipeline

- **Issues Addressed**: ESLint errors, test failures

## Issues Resolved

### Issue 1: ESLint Configuration Error

- **Problem**: ESLint flat config not recognized

- **Root Cause**: Missing export in eslint.config.mjs

- **Solution**: Added proper export statement

- **Evidence**: `pnpm run lint` now passes

## Key Learnings

- ESLint 9 requires explicit exports

- Flat config syntax differs from legacy

- Always verify config with `--print-config`

## Current Status

- ✅ ESLint workflow passing

- ✅ TypeScript checks passing

- ⏳ Test suite still running

- ❌ Documentation workflow failing

## Next Steps

1. Fix markdown linting issues

1. Update documentation links

1. Verify full pipeline success

## Automation Created

- `scripts/fix-eslint-config.sh` - Auto-fix common ESLint issues

- Usage: `./scripts/fix-eslint-config.sh`

## Memory Rules Added

- Always use flat config for ESLint 9+

- Verify config changes with --print-config

- Document all config changes in chronicles

```text

This debugging chronicles system ensures systematic problem-solving, knowledge
preservation,
and
seamless
handoffs
between
developers
and
AI
assistants.
```
````
