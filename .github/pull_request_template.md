## What changed
- [ ] Code
- [ ] Tests  
- [ ] Docs (required)
  - [ ] Updated `/docs/engineering/testing.md` (if tests/process changed)
  - [ ] Updated `/docs/engineering/typescript.md` (if TypeScript standards changed)
  - [ ] Added/updated ADR under `/docs/adr/` (if architectural decisions changed)

## Verification
- [ ] `pnpm run test:all` green with same summaries
- [ ] Docs build/check passes (if docs:lint and docs:links scripts are available)
- [ ] No linting/type errors introduced

## Description
<!-- Brief description of changes and motivation -->

## Testing
<!-- How were these changes tested? -->

## Documentation
<!-- Link to updated documentation or explain why docs updates aren't needed -->

## Checklist
- [ ] PR title follows conventional commit format
- [ ] Breaking changes are documented
- [ ] Related issues are linked (e.g., Closes #123)
- [ ] All review feedback has been addressed

---

**Note**: All code changes affecting `/packages`, `/apps`, or `/tests` require corresponding documentation updates. See [Documentation Standards](../docs/README.md) for guidance.