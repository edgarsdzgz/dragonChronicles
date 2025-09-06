# File-Based Memory System - Usage Guide

**Purpose**: Complete guide for using the file-based memory system as an alternative to Cursor's
missing memory tools

**Created**: 2025-01-15
**Version**: 1.0.0

---

## 🎯 **Overview**

Since Cursor's memory tools are not available on Linux (version 1.5.11), we've created a
comprehensive file-based memory system that provides the same functionality. This system allows the
AI assistant to maintain context and important information across sessions.

## 📁 **System Components**

### **Core Files**

- `memory.md` - Main memory file containing all context and information
- `scripts/memory-manager.py` - Python script for managing memory operations
- `docs/engineering/memory-system-usage.md` - This usage guide

### **File Structure**

```text

dragonChronicles/
├── memory.md                           # Main memory file
├── scripts/
│   └── memory-manager.py              # Memory management script
└── docs/engineering/
    └── memory-system-usage.md         # This guide

```text

---

## 🚀 **Quick Start**

### **1. Test the System**

```bash

# Read current memory

python3 scripts/memory-manager.py read

# Search for specific information

python3 scripts/memory-manager.py search "Steam"

# List all sections

python3 scripts/memory-manager.py sections

```text

### **2. Update Memory**

```bash

# Update a section

python3 scripts/memory-manager.py update "Current Session" "Working on CI/CD fixes"

# Add to a section

python3 scripts/memory-manager.py add "Session Notes" "Completed memory system setup"

```text

---

## 📋 **Detailed Usage**

### **Reading Memory**

**Command**: `python3 scripts/memory-manager.py read`

**Purpose**: Display the entire memory file content

**Example**:

```bash

python3 scripts/memory-manager.py read

```text

**Output**: Full memory file content with all sections and information

---

### **Updating Memory**

**Command**: `python3 scripts/memory-manager.py update <section> <content>`

**Purpose**: Replace the content of a specific section

**Parameters**:

- `<section>` - Name of the section to update
- `<content>` - New content for the section

**Examples**:

```bash

# Update current session information

python3 scripts/memory-manager.py update "Current Session" "Working on Steam integration research"

# Update project status

python3 scripts/memory-manager.py update "Current Development Status" "Branch:
feat/w7-cicd-previews, CI/CD: 4/6 workflows passing"

```text

**Note**: If the section doesn't exist, it will be created.

---

### **Adding to Memory**

**Command**: `python3 scripts/memory-manager.py add <section> <content>`

**Purpose**: Add new content to an existing section

**Parameters**:

- `<section>` - Name of the section to add to
- `<content>` - Content to add to the section

**Examples**:

```bash

# Add to session notes

python3 scripts/memory-manager.py add "Session Notes" "Discovered Steam overlay compatibility
issues"

# Add to knowledge base

python3 scripts/memory-manager.py add "Steam Integration Research" "Electron + Steamworks.js is the
recommended approach"

```text

**Note**: Content is appended to the existing section content.

---

### **Searching Memory**

**Command**: `python3 scripts/memory-manager.py search <query>`

**Purpose**: Search for specific information in the memory file

**Parameters**:

- `<query>` - Search term (case-insensitive)

**Examples**:

```bash

# Search for Steam-related information

python3 scripts/memory-manager.py search "Steam"

# Search for CI/CD information

python3 scripts/memory-manager.py search "CI/CD"

# Search for specific technologies

python3 scripts/memory-manager.py search "PixiJS"

```text

**Output**: Shows matching lines with context (2 lines before and after each match)

---

### **Managing Timestamps**

**Command**: `python3 scripts/memory-manager.py timestamp`

**Purpose**: Update the "Last Updated" timestamp in the memory file

**Example**:

```bash

python3 scripts/memory-manager.py timestamp

```text

**Note**: This is automatically called when using `update` or `add` commands.

---

### **Listing Sections**

**Command**: `python3 scripts/memory-manager.py sections`

**Purpose**: Display all available sections in the memory file

**Example**:

```bash

python3 scripts/memory-manager.py sections

```text

**Output**: List of all section names

---

## 🤖 **AI Assistant Usage**

### **For the AI Assistant**

When working with the AI assistant, you can:

**Read memory at the start of a session**:

```text
Please read the memory file to understand the current project context
```

**Update memory during the session**:

```text
Please update the memory with our current progress on Steam integration
```

**Search for specific information**:

```text
Please search the memory for information about CI/CD issues
```

**Add new discoveries**:

```text
Please add this new information about Electron configuration to the memory
```

### **Memory Update Workflow**

1. **Start of session**: AI reads memory to understand context
2. **During session**: AI updates memory with progress and discoveries
3. **End of session**: AI updates memory with session summary and next steps

---

## 📝 **Memory File Structure**

### **Standard Sections**

The memory file is organized into these main sections:

#### **🧠 Memory Categories**

- **Project Context** - Basic project information
- **Current Development Status** - Current state and progress
- **Key Technical Decisions** - Important architectural decisions

#### **🎯 Current Session Context**

- **Active Issues** - Current problems being worked on
- **Recent Discoveries** - New findings and solutions
- **Next Steps** - Planned actions

#### **📚 Knowledge Base**

- **Steam Integration Research** - Steam distribution findings
- **CI/CD Solutions** - CI/CD problem solutions
- **Performance Optimization** - Optimization techniques

#### **🔧 Technical Environment**

- **Development Setup** - Environment details
- **Project Structure** - File organization
- **Key Files** - Important files and their purposes

#### **🚀 Future Plans**

- **Immediate** - Next session goals
- **Short Term** - Upcoming milestones
- **Long Term** - Long-term objectives

#### **📝 Session Notes**

- **Current Session** - Today's work
- **Previous Sessions** - Historical context

---

## 🔧 **Advanced Usage**

### **Custom Sections**

You can create custom sections for specific needs:

```bash

# Create a new section for debugging sessions

python3 scripts/memory-manager.py update "Debugging Sessions" "PNPM hoisting issue resolved with
--config.node-linker=hoisted"

# Add to the debugging section

python3 scripts/memory-manager.py add "Debugging Sessions" "GitHub Pages environment protection
rules fixed"

```text

### **Bulk Updates**

For multiple updates, you can chain commands:

```bash

# Update multiple sections

python3 scripts/memory-manager.py update "Current Session" "Working on Steam integration"
python3 scripts/memory-manager.py add "Session Notes" "Researched Electron wrapper approach"
python3 scripts/memory-manager.py add "Session Notes" "Confirmed Steam overlay compatibility
solutions"

```text

### **Integration with Other Scripts**

The memory manager can be integrated into other scripts:

```python

# In another Python script

from scripts.memory_manager import MemoryManager

memory = MemoryManager()
memory.add("Automated Process", "CI/CD pipeline completed successfully")

```text

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Permission Errors**

```bash

# Make script executable

chmod +x scripts/memory-manager.py

```text

#### **Python Not Found**

```bash

# Use python3 explicitly

python3 scripts/memory-manager.py read

```text

#### **Memory File Not Found**

The script will automatically create an initial memory file if it doesn't exist.

#### **Section Not Found**

If you try to add to a non-existent section, it will be created automatically.

### **Error Messages**

- **"Error reading memory file"** - Check file permissions and path
- **"Error updating memory"** - Check write permissions
- **"No results found"** - Try different search terms or check spelling

---

## 📊 **Best Practices**

### **For AI Assistant**

1. **Read memory at session start** - Always understand current context
2. **Update frequently** - Keep memory current with progress
3. **Use descriptive sections** - Organize information logically
4. **Include context** - Add relevant details and background
5. **Update timestamps** - Keep track of when information was last updated

### **For Developers**

1. **Regular backups** - The memory file is important for context
2. **Version control** - Include memory.md in git for team collaboration
3. **Consistent naming** - Use consistent section names
4. **Clear content** - Write clear, searchable content
5. **Regular cleanup** - Remove outdated information

---

## 🔄 **Migration from Cursor Memory Tools**

### **What This Replaces**

- `update-memory` tool calls
- Automatic memory management
- Built-in context persistence

### **What This Provides**

- Manual memory control
- Searchable knowledge base
- Version-controlled memory
- Team-shareable context
- Offline memory management

### **Migration Steps**

1. **Create initial memory** - Use the script to create the memory file
2. **Populate with current context** - Add existing project information
3. **Update AI workflow** - Modify AI instructions to use file-based memory
4. **Test the system** - Verify all functionality works
5. **Train team** - Ensure everyone knows how to use the system

---

## 📈 **Future Enhancements**

### **Planned Features**

- **Memory versioning** - Track changes over time
- **Memory merging** - Combine multiple memory sources
- **Memory export** - Export memory in different formats
- **Memory validation** - Check memory file integrity
- **Memory backup** - Automatic backup functionality

### **Integration Ideas**

- **Git hooks** - Auto-update memory on commits
- **CI/CD integration** - Update memory with build status
- **Documentation sync** - Sync with project documentation
- **Team collaboration** - Multi-user memory management

---

## 🎯 **Summary**

The file-based memory system provides a robust alternative to Cursor's missing memory tools. It
offers:

✅ **Full functionality** - All memory operations supported
✅ **Search capability** - Find information quickly
✅ **Version control** - Track changes over time
✅ **Team collaboration** - Shareable memory system
✅ **Offline operation** - Works without internet
✅ **Customizable** - Adapt to your needs

This system ensures that important project context and knowledge are preserved and accessible across
all development sessions.

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
