# Version Control Best Practices: Draconia Chronicles

**Purpose**: Comprehensive guide for proper version control practices to avoid repository bloat and
maintain clean project structure

## 🚨 **CRITICAL RULES - NEVER DO THESE**

### **1. Never Create Manual Backup Files**

```bash

# ❌ NEVER DO THIS

cp important-file.md important-file.md.backup
cp config.json config.json.backup2
cp script.sh script.sh.old
```text

### **2. Never Create Temporary Files in Repository**

```bash

# ❌ NEVER DO THIS

echo "temp content" > sedDq2kfC
echo "more temp" > sedPR56TM
echo "even more" > sedSE1064
```text

### **3. Never Create Multiple Versions of Same File**

```bash

# ❌ NEVER DO THIS

cp file.md file.md.v1
cp file.md file.md.v2
cp file.md file.md.final
```text

## ✅ **PROPER VERSION CONTROL PRACTICES**

### **1. Use Git Branches for Experimental Work**

```bash

# ✅ DO THIS INSTEAD

git checkout -b experiment/markdown-fixes

# Make your changes

git add .
git commit -m "experiment: try automated markdown fixes"

# If it works, merge it

git checkout main
git merge experiment/markdown-fixes

# If it doesn't work, abandon it

git checkout main
git branch -D experiment/markdown-fixes
```text

### **2. Use Git Stash for Temporary Changes**

```bash

# ✅ DO THIS INSTEAD

git stash push -m "backup before risky changes"

# Make your changes


# If it works:

git add .
git commit -m "feat: implement changes"

# If it doesn't work:

git stash pop  # Restore your backup
```text

### **3. Use Git Commits for Checkpoints**

```bash

# ✅ DO THIS INSTEAD

git add .
git commit -m "checkpoint: before major refactoring"

# Make changes

git add .
git commit -m "feat: complete refactoring"

# If you need to go back:

git reset --hard HEAD~1  # Go back one commit
```text

### **4. Use Git Tags for Stable Versions**

```bash

# ✅ DO THIS INSTEAD

git tag -a v1.0.0 -m "Stable version before optimization"

# Make changes

git tag -a v1.1.0 -m "Version with optimizations"

# If you need to go back:

git checkout v1.0.0
```text

## 🛠️ **AUTOMATION SCRIPT IMPROVEMENTS**

### **1. Add Error Handling to Scripts**

```bash
#!/bin/bash

# ✅ IMPROVED SCRIPT WITH ERROR HANDLING

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Create temporary directory outside repo

TEMP*DIR=$(mktemp -d)
trap "rm -rf $TEMP*DIR" EXIT  # Cleanup on exit

# Work in temp directory

cd "$TEMP*DIR"

# Your script logic here

echo "Working in temporary directory: $TEMP*DIR"
```text

### **2. Use Git Hooks for Validation**

```bash
#!/bin/bash

# .git/hooks/pre-commit


# ✅ PREVENT BACKUP FILES FROM BEING COMMITTED

# Check for backup files

if git diff --cached --name-only | grep -E '\.(backup|bak|old|tmp|temp)$'; then
    echo "❌ Error: Backup files detected in commit!"
    echo "Please remove backup files and use proper Git version control."
    exit 1
fi

# Check for temporary files

if git diff --cached --name-only | grep -E '^sed[A-Za-z0-9]+$'; then
    echo "❌ Error: Temporary files detected in commit!"
    echo "Please remove temporary files and use proper Git version control."
    exit 1
fi
```text

### **3. Use .gitignore for Temporary Files**

```gitignore

# ✅ ADD TO .gitignore


# Backup files

*.backup
*.bak
*.old
*.tmp
*.temp

# Temporary files from scripts

sed*
temp*
tmp*

# IDE temporary files

*.swp
*.swo
*~
```text

## 📋 **WORKFLOW IMPROVEMENTS**

### **1. Before Making Risky Changes**

```bash

# ✅ PROPER WORKFLOW


# 1. Create feature branch

git checkout -b fix/markdown-linting

# 2. Make small, testable changes

git add .
git commit -m "fix: add basic markdown fixes"

# 3. Test the changes

pnpm run docs:lint

# 4. If successful, continue

git add .
git commit -m "fix: complete markdown linting fixes"

# 5. If failed, revert

git reset --hard HEAD~1
```text

### **2. When Scripts Fail**

```bash

# ✅ PROPER RECOVERY


# 1. Check what went wrong

git status
git diff

# 2. If changes are good, commit them

git add .
git commit -m "fix: resolve script issues"

# 3. If changes are bad, revert them

git checkout -- .

# or

git reset --hard HEAD

# 4. Fix the script and try again

```text

### **3. For Experimental Work**

```bash

# ✅ PROPER EXPERIMENTAL WORKFLOW


# 1. Create experimental branch

git checkout -b experiment/automated-fixes

# 2. Make experimental changes


# (your experimental work here)

# 3. Test thoroughly

pnpm run docs:lint
pnpm run test

# 4. If successful, merge to main

git checkout main
git merge experiment/automated-fixes
git branch -D experiment/automated-fixes

# 5. If unsuccessful, abandon

git checkout main
git branch -D experiment/automated-fixes
```text

## 🔍 **DETECTION AND CLEANUP**

### **1. Find Backup Files**

```bash

# ✅ FIND BACKUP FILES

find . -name "*.backup" -o -name "*.bak" -o -name "*.old" -o -name "*.tmp"
```text

### **2. Find Temporary Files**

```bash

# ✅ FIND TEMPORARY FILES

find . -name "sed*" -o -name "temp*" -o -name "tmp*"
```text

### **3. Clean Up Repository**

```bash

# ✅ CLEANUP SCRIPT

#!/bin/bash
echo "Cleaning up repository..."

# Remove backup files

find . -name "*.backup" -delete
find . -name "*.bak" -delete
find . -name "*.old" -delete
find . -name "*.tmp" -delete

# Remove temporary files

find . -name "sed*" -delete
find . -name "temp*" -delete
find . -name "tmp*" -delete

echo "Repository cleaned up!"
```text

## 📚 **EDUCATIONAL RESOURCES**

### **1. Git Best Practices**

- **Atomic Commits**: Each commit should represent one logical change
- **Descriptive Messages**: Commit messages should clearly describe what was changed
- **Frequent Commits**: Commit often to create a clear history
- **Branch Strategy**: Use branches for features, experiments, and fixes

### **2. Repository Hygiene**

- **No Backup Files**: Git provides version control, backups are redundant
- **No Temporary Files**: Use proper temporary directories outside the repo
- **Clean History**: Maintain a clean, linear commit history
- **Proper Ignoring**: Use .gitignore for files that shouldn't be tracked

### **3. Team Collaboration**

- **Shared Standards**: All team members follow the same practices
- **Code Reviews**: Review commits to ensure they follow best practices
- **Documentation**: Document any special workflows or exceptions
- **Training**: Ensure all team members understand proper Git usage

## 🎯 **SUCCESS METRICS**

### **Repository Health Indicators**

- **No Backup Files**: Zero `.backup`, `.bak`, `.old` files in repository
- **No Temporary Files**: Zero `sed*`, `temp*`, `tmp*` files in repository
- **Clean History**: Linear, descriptive commit history
- **Proper Branching**: Feature branches for all development work

### **Team Efficiency Indicators**

- **Faster Development**: No time wasted managing backup files
- **Clearer History**: Easy to understand what changed and when
- **Better Collaboration**: Team members can easily understand changes
- **Reduced Conflicts**: Proper branching reduces merge conflicts

## 🚀 **IMPLEMENTATION CHECKLIST**

### **Immediate Actions**

- [ ] Remove all existing backup files
- [ ] Remove all existing temporary files
- [ ] Update .gitignore to prevent future issues
- [ ] Add pre-commit hook to prevent backup files
- [ ] Document these practices for the team

### **Ongoing Practices**

- [ ] Use feature branches for all development
- [ ] Commit frequently with descriptive messages
- [ ] Use Git stash for temporary changes
- [ ] Use Git tags for stable versions
- [ ] Regular repository cleanup

### **Team Training**

- [ ] Share this document with all team members
- [ ] Conduct Git best practices training
- [ ] Establish team standards for version control
- [ ] Regular reviews of repository health

---

**Remember**: Git is a powerful version control system. Use it properly instead of creating manual
backups and temporary files. This will result in a cleaner, more maintainable repository and better
team collaboration.
