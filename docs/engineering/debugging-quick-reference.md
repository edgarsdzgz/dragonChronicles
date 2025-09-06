# Debugging Chronicles - Quick Reference

## 🚨 **IMMEDIATE ACTION CHECKLIST**

When you encounter ANY debugging session:

1. **STOP** - Don't continue without documenting
2. **CREATE** - New chronicle file: `debugging-chronicles-XXX-[name].md`
3. **START** - Document immediately, update in real-time
4. **UPDATE** - Add entry to `debugging-chronicles-index.md`

---

## 📋 **MINIMAL TEMPLATE** (Copy & Paste)

```markdown

# Debugging Chronicle: [Title]

**Session ID**: DC-YYYY-MM-DD-XXX
**Date**: YYYY-MM-DD
**Status**: 🔄 In Progress

## 🚨 **PROBLEM**

- **Issue**: [What's broken]
- **Error**: [Exact error message]
- **Impact**: [What's affected]

## 🔍 **INVESTIGATION**

- **Hypothesis**: [Initial theory]
- **Tools used**: [What we're using to debug]
- **Research**: [What we're looking up]

## 🔧 **SOLUTION**

- **Fix**: [What we're trying]
- **Results**: [What happened]

## 📚 **LESSONS**

- **Root cause**: [What really caused it]
- **Prevention**: [How to avoid this]
- **Resources**: [Helpful links]

**Tags**: `[category]` `[technology]` `[complexity]`
```text

---

## 🏷️ **QUICK TAGS**

### **Categories**

`ci-cd` `build` `dependencies` `performance` `browser` `database` `pwa` `typescript` `testing`
`deployment`

### **Technologies**

`sveltekit` `pixijs` `dexie` `workbox` `pnpm` `github-actions` `electron` `steam` `vite`
`typescript` `eslint` `prettier` `playwright` `vitest`

### **Complexity**

`beginner` `intermediate` `advanced` `expert`

---

## 📝 **ESSENTIAL ELEMENTS**

**Always Include:**

- ✅ Exact error messages
- ✅ Commands and code snippets
- ✅ Environment details
- ✅ Failed attempts and why they failed
- ✅ Links to resources
- ✅ Performance metrics (if relevant)

**Never Skip:**

- ❌ The investigation process
- ❌ Failed attempts
- ❌ Error message context
- ❌ Environment setup
- ❌ Updating the index

---

## 🔄 **REAL-TIME UPDATES**

**Update the chronicle as you:**

- Try new approaches
- Discover new information
- Find helpful resources
- Encounter new errors
- Make progress
- Hit dead ends

**Don't wait until the end!**

---

## 📊 **INDEX UPDATE FORMAT**

Add to `debugging-chronicles-index.md`:

```markdown

### **DC-YYYY-MM-DD-XXX**: [Title]

- **Date**: YYYY-MM-DD
- **Category**: `[tags]`
- **Complexity**: `[level]`
- **Status**: 🔄 In Progress / ✅ Resolved / ❌ Abandoned
- **File**: [filename.md]
- **Summary**: [One sentence description]

```text

---

## 🎯 **SUCCESS CRITERIA**

A good chronicle is:

- **Findable** - Easy to discover via search
- **Actionable** - Clear steps to resolve
- **Educational** - Teaches debugging techniques
- **Complete** - Covers the full journey
- **Searchable** - Optimized for discovery

---

**Remember**: Document the journey, not just the destination!
