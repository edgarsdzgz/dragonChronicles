# Markdownlint Rules Reference

**Purpose**: Complete reference for creating 100% compliant markdown files that pass our linter

## 🚨 **CRITICAL RULES - MUST FOLLOW 100% OF THE TIME**

### **MD009 - No Trailing Spaces**

- **Rule**: Lines should not have trailing spaces
- **Exception**: Exactly 2 trailing spaces for line breaks
- **Fix**: Remove all single trailing spaces, use exactly 2 spaces for line breaks
- **Example**:

  ```markdown
  ❌ Wrong: "Text with trailing space "
  ✅ Correct: "Text without trailing space"
  ✅ Correct: "Text with line break  " (exactly 2 spaces)
  ```

### **MD022 - Headings Should Be Surrounded by Blank Lines**

- **Rule**: Headings must have blank lines before and after
- **Fix**: Add blank line before and after every heading
- **Example**:

  ```markdown
  ❌ Wrong:
  Some text
  ### Heading
  More text

  ✅ Correct:
  Some text

  ### Heading

  More text
  ```

### **MD032 - Lists Should Be Surrounded by Blank Lines**

- **Rule**: Lists must have blank lines before and after
- **Fix**: Add blank line before and after every list
- **Example**:

  ```markdown
  ❌ Wrong:
  Some text

  - List item
  - Another item

  More text

  ✅ Correct:
  Some text

  - List item
  - Another item

  More text
  ```

### **MD013 - Line Length**

- **Rule**: Lines should not exceed 100 characters
- **Exceptions**:
  - Code blocks: No limit
  - Tables: No limit
  - Headings: 100 character limit
- **Fix**: Break long lines at 100 characters
- **Example**:

  ```markdown
❌ Wrong: This is a very long line that exceeds the 100 character limit and will cause a linting
error
  ✅ Correct: This is a properly formatted line that stays within the 100 character limit
  ```

### **MD031 - Fenced Code Blocks Should Be Surrounded by Blank Lines**

- **Rule**: Code blocks must have blank lines before and after
- **Fix**: Add blank line before and after every code block
- **Example**:

  ```markdown
  ❌ Wrong:
  Some text
  ```javascript
  const code = "example";
  ```
  More text

  ✅ Correct:
  Some text

  ```javascript
  const code = "example";
  ```

  More text
  ```

### **MD040 - Fenced Code Blocks Should Have a Language Specified**

- **Rule**: All code blocks must specify a language
- **Fix**: Add language identifier to all code blocks
- **Example**:

  ```markdown
  ❌ Wrong:
  ```
  const code = "example";
  ```

  ✅ Correct:
  ```javascript
  const code = "example";
  ```
  ```

### **MD024 - No Duplicate Headings**

- **Rule**: No two headings should have the same content
- **Fix**: Make headings unique or use different levels
- **Example**:

  ```markdown
  ❌ Wrong:
  ### Section
  Content here
  ### Section
  More content

  ✅ Correct:
  ### Section 1
  Content here
  ### Section 2
  More content
  ```

## 📋 **ADDITIONAL RULES**

### **MD035 - Horizontal Rule Style**

- **Rule**: Horizontal rules should use `---`
- **Fix**: Use `---` for all horizontal rules
- **Example**:

  ```markdown
  ❌ Wrong: *** or __*
  ✅ Correct: ---
  ```

### **MD049 - Emphasis Style**

- **Rule**: Use asterisks for emphasis, not underscores
- **Fix**: Use `*text*` instead of `*text*`
- **Example**:

  ```markdown
  ❌ Wrong: *emphasis*
  ✅ Correct: *emphasis*
  ```

### **MD033 - Allowed HTML Elements**

- **Rule**: Only specific HTML elements are allowed
- **Allowed**: `br`, `img`, `a`, `sub`, `sup`, `span`, `div`, `picture`, `source`, `Title`
- **Fix**: Use markdown syntax instead of HTML when possible

### **MD041 - First Line Should Be Top Level Heading**

- **Rule**: First line should be a top-level heading (disabled in our config)
- **Status**: Disabled in our configuration

## 🛠️ **AUTOMATED FIXES**

### **Using markdownlint CLI**

```bash

# Check for violations

pnpm run docs:lint

# Fix basic violations automatically

npx markdownlint --fix "**/*.md"
```text

### **Common Fix Patterns**

#### **Fix Trailing Spaces**

```bash

# Remove trailing spaces

sed -i 's/[[:space:]]*$//' file.md
```text

#### **Fix Line Length**

```bash

# Break long lines (manual process)


# Use text editor with 100 character ruler

```text

#### **Fix Headings and Lists**

```bash

# Add blank lines around headings and lists


# This requires manual editing or custom scripts

```text

## 📝 **CREATION CHECKLIST**

When creating new markdown files, ensure:

- [ ] **No trailing spaces** (except exactly 2 for line breaks)
- [ ] **Blank lines around all headings**
- [ ] **Blank lines around all lists**
- [ ] **Lines under 100 characters**
- [ ] **Blank lines around code blocks**
- [ ] **Language specified for all code blocks**
- [ ] **Unique heading content**
- [ ] **Use `---` for horizontal rules**
- [ ] **Use `*emphasis*` not `*emphasis_`**
- [ ] **Run `pnpm run docs:lint` before committing**

## 🔧 **QUICK FIX COMMANDS**

### **Remove Trailing Spaces**

```bash
find docs/ -name "*.md" -exec sed -i 's/[[:space:]]*$//' {} \;
```text

### **Check Specific File**

```bash
npx markdownlint file.md
```text

### **Fix Basic Issues**

```bash
npx markdownlint --fix file.md
```text

## 📚 **TEMPLATE FOR NEW FILES**

```markdown

# Title

Brief description.

## Section 1

Content here.

### Subsection

- List item 1
- List item 2

## Section 2

More content.



```javascript
const example = "code";

```text

Final content.
```text

## ⚠️ **COMMON MISTAKES TO AVOID**

1. **Forgetting blank lines** around headings and lists
2. **Trailing spaces** at end of lines
3. **Long lines** exceeding 100 characters
4. **Code blocks without language** specification
5. **Duplicate headings** with same content
6. **Missing blank lines** around code blocks
7. **Using underscores** for emphasis instead of asterisks

## 🎯 **GOAL: 100% COMPLIANCE**

Every markdown file must pass `pnpm run docs:lint` with zero violations. This ensures:

- Consistent formatting across all documentation
- No CI/CD pipeline failures
- Professional, readable documentation
- Easy maintenance and updates

---

**Remember**: Always run `pnpm run docs:lint` before committing any markdown changes!
