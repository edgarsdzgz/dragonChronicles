# LLM Guide: Draconia Chronicles Project

**Purpose**: Complete guide for any LLM to jump into this project and immediately understand how to
create debugging chronicles, follow markdown rules, and use our automation scripts.

## 🚀 **QUICK START CHECKLIST**

When you start working on this project, immediately:

- [ ] Read this guide completely
- [ ] Check the current debugging chronicles index
- [ ] Understand the markdownlint rules
- [ ] Know how to use our automation scripts
- [ ] Follow the debugging chronicles creation process

---

## 📚 **ESSENTIAL DOCUMENTS TO READ**

### **1. Core Documentation**

- **`docs/engineering/llm-guide.md`** - This guide (you're reading it!)
- **`docs/engineering/debugging-chronicles-template.md`** - Template for new chronicles
- **`docs/engineering/debugging-chronicles-index.md`** - Index of all chronicles
- **`docs/engineering/markdownlint-rules-reference.md`** - Complete markdown rules

### **2. Process Documents**

- **`docs/engineering/debugging-quick-reference.md`** - Quick action checklist
- **`CLAUDE.md`** - Project-specific rules and preferences

---

## 🎯 **DEBUGGING CHRONICLES: COMPLETE PROCESS**

### **When to Create a Chronicle**

Create a debugging chronicle for ANY of these situations:

- CI/CD pipeline failures
- Build system issues
- Dependency problems
- Testing failures
- Performance issues
- Any problem-solving session

### **Step-by-Step Creation Process**

#### **Step 1: Get Next Session ID**

```bash

# Check the current index to get the next session ID

grep "DC-.*" docs/engineering/debugging-chronicles-index.md | tail -1

# Example output: DC-2025-09-06-008


# Next ID would be: DC-2025-09-06-009

```text

#### **Step 2: Create Chronicle File**

```bash

# Create new chronicle file

touch docs/engineering/debugging-chronicles-XXX-descriptive-name.md
```text

#### **Step 3: Use Template Structure**

Copy the exact structure from `debugging-chronicles-template.md` and fill in:

```markdown

# Debugging Chronicle: [Descriptive Title]

**Session ID**: DC-YYYY-MM-DD-XXX
**Date**: YYYY-MM-DD
**Duration**: X hours
**Developer**: Edgar Diaz-Gutierrez
**Project**: Draconia Chronicles
**Status**: 🔄 In Progress

## 🚨 **PROBLEM STATEMENT**

[Follow template exactly]

## 🔍 **ENVIRONMENT CONTEXT**

[Follow template exactly]

## 🕵️ **INVESTIGATION PROCESS**

[Follow template exactly]

## 🔧 **SOLUTION IMPLEMENTATION**

[Follow template exactly]

## 📚 **PREVENTION & LESSONS LEARNED**

[Follow template exactly]

## 🔗 **RELATED ISSUES & DEPENDENCIES**

[Follow template exactly]

## 📖 **RESOURCES & REFERENCES**

[Follow template exactly]

## 🏷️ **TAGGING SYSTEM**


### **Categories**

`category1` `category2` `category3`

### **Technologies**

`tech1` `tech2` `tech3`

### **Complexity**

`beginner`/`intermediate`/`advanced`/`expert`
```text

#### **Step 4: Update Index**

Add entry to `debugging-chronicles-index.md`:

- Add to complete chronicles list
- Add to category sections
- Add to technology sections
- Add to complexity sections
- Update statistics

---

## 📝 **MARKDOWN RULES: 100% COMPLIANCE**

### **Critical Rules (Must Follow)**

1. **MD009**: No trailing spaces (except exactly 2 for line breaks)
2. **MD022**: Blank lines around ALL headings
3. **MD032**: Blank lines around ALL lists
4. **MD013**: Lines under 100 characters
5. **MD031**: Blank lines around ALL code blocks
6. **MD040**: Language specified for ALL code blocks
7. **MD024**: No duplicate headings
8. **MD035**: Use `---` for horizontal rules
9. **MD049**: Use `*emphasis*` not `_emphasis*`

### **Quick Compliance Check**

```bash

# Always run this before committing

pnpm run docs:lint
```text

### **Common Violations and Fixes**

#### **Trailing Spaces (MD009)**

```bash

# Fix trailing spaces

find docs/ -name "*.md" -exec sed -i 's/[[:space:]]*$//' {} \;
```text

#### **Code Block Language (MD040)**

```bash

# Fix code blocks without language

find docs/ -name "*.md" -exec sed -i 's/^```$/```text/' {} \;
```text

#### **Headings and Lists (MD022, MD032)**

These require manual fixing - see the markdownlint output for exact locations.

---

## 🛠️ **AUTOMATION SCRIPTS**

### **Available Scripts**

#### **1. Fix Markdownlint Violations**

```bash

# Run the automated fix script

./scripts/fix-markdownlint-violations.sh
```text

#### **2. Advanced Python Fixes**

```bash

# Run the advanced Python script

python3 scripts/fix-markdown-advanced.py
```text

#### **3. Manual Fixes**

```bash

# Remove trailing spaces

find docs/ -name "*.md" -exec sed -i 's/[[:space:]]*$//' {} \;

# Fix code block language

find docs/ -name "*.md" -exec sed -i 's/^```$/```text/' {} \;

# Check specific file

npx markdownlint docs/engineering/your-file.md
```text

### **Python Script for Complex Fixes**

If you need more complex fixes, use the Python script:

```python
#!/usr/bin/env python3
"""
Markdown Fix Script for Draconia Chronicles
Fixes common markdownlint violations
"""

import re
import os
import glob

def fix*markdown*file(filepath):
    """Fix common markdownlint violations in a file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix trailing spaces
    content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)

    # Fix code blocks without language
    content = re.sub(r'^```$', '```text', content, flags=re.MULTILINE)

    # Add blank lines around headings (basic fix)
    content = re.sub(r'(\n)(#{1,6}\s)', r'\1\n\2', content)
    content = re.sub(r'(#{1,6}.*)(\n)([^#\n])', r'\1\n\n\3', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    """Fix all markdown files in docs/"""
    md*files = glob.glob('docs/**/*.md', recursive=True)
    for filepath in md*files:
        print(f"Fixing {filepath}")
        fix*markdown*file(filepath)

if **name** == "**main**":
    main()
```text

---

## 🔄 **COMPLETE WORKFLOW EXAMPLE**

### **Scenario: CI/CD Pipeline Failure**

#### **Step 1: Identify the Problem**

```bash

# Check current pipeline status

gh run list --limit 5
```text

#### **Step 2: Create Chronicle**

```bash

# Get next session ID

grep "DC-.*" docs/engineering/debugging-chronicles-index.md | tail -1

# Create new chronicle

touch docs/engineering/debugging-chronicles-009-cicd-pipeline-failure.md
```text

#### **Step 3: Document in Real-Time**

- Start with problem statement
- Document investigation process
- Update as you progress
- Don't wait until solved

#### **Step 4: Fix the Issue**

- Follow systematic debugging approach
- Document each step
- Include exact error messages
- Document the solution

#### **Step 5: Update Index**

- Add to all relevant sections
- Update statistics
- Ensure proper tagging

#### **Step 6: Ensure Compliance**

```bash

# Fix markdown violations

./scripts/fix-markdownlint-violations.sh

# Check compliance

pnpm run docs:lint

# If still violations, fix manually

```text

---

## 📋 **PROJECT-SPECIFIC RULES**

### **Developer Name**

Always use: **Edgar Diaz-Gutierrez**

### **Project Name**

Always use: **Draconia Chronicles**

### **File Locations**

- Chronicles: `docs/engineering/debugging-chronicles-*.md`
- Index: `docs/engineering/debugging-chronicles-index.md`
- Templates: `docs/engineering/debugging-chronicles-template.md`

### **Session ID Format**

- Format: `DC-YYYY-MM-DD-XXX`
- Example: `DC-2025-09-06-009`
- Increment from index

### **Tagging System**

- **Categories**: `ci-cd`, `build`, `testing`, `deployment`, `dependencies`, `performance`
- **Technologies**: `sveltekit`, `playwright`, `github-actions`, `pnpm`, `vite`
- **Complexity**: `beginner`, `intermediate`, `advanced`, `expert`

---

## ⚠️ **COMMON MISTAKES TO AVOID**

1. **Don't wait** to document - start immediately
2. **Don't skip** the markdownlint compliance check
3. **Don't forget** to update the index
4. **Don't use** underscores for emphasis (`*text_` → `*text*`)
5. **Don't forget** blank lines around headings and lists
6. **Don't exceed** 100 characters per line
7. **Don't forget** language specification for code blocks

---

## 🎯 **SUCCESS CRITERIA**

A successful LLM session should:

- [ ] Create at least one debugging chronicle
- [ ] Follow the exact template structure
- [ ] Update the index properly
- [ ] Ensure 100% markdownlint compliance
- [ ] Use proper tagging system
- [ ] Document the complete debugging journey
- [ ] Include exact error messages and solutions

---

## 🆘 **TROUBLESHOOTING**

### **If markdownlint fails:**

1. Run `./scripts/fix-markdownlint-violations.sh`
2. Check specific violations with `pnpm run docs:lint`
3. Fix manually using the rules reference
4. Use Python script for complex fixes

### **If chronicle creation fails:**

1. Check the template structure
2. Ensure proper session ID format
3. Follow the exact template sections
4. Update the index properly

### **If index update fails:**

1. Check existing entries for format
2. Ensure proper categorization
3. Update statistics correctly
4. Use consistent tagging

---

**Remember**: This project prioritizes community knowledge sharing through comprehensive debugging
documentation. Every problem solved should become a resource for future developers!
