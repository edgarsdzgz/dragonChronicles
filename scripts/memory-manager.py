#!/usr/bin/env python3

"""
Memory Manager Script

Purpose: Manage the file-based memory system for AI assistant
Usage: python scripts/memory-manager.py [command] [options]

Commands:
  read - Read current memory
  update - Update memory with new information
  add - Add new information to memory
  search - Search memory for specific information
  timestamp - Update last updated timestamp
"""

import os
import sys
import re
from datetime import datetime
from pathlib import Path


class MemoryManager:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.memory_file = self.project_root / "memory.md"
    
    def read(self):
        """Read the current memory file"""
        try:
            if not self.memory_file.exists():
                print("Memory file does not exist. Creating initial memory...")
                self.create_initial_memory()
            
            with open(self.memory_file, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading memory file: {e}")
            return None
    
    def update(self, section, content):
        """Update memory with new information"""
        try:
            current_memory = self.read()
            if not current_memory:
                return False
            
            # Simple update logic - replace section content
            updated_memory = self.replace_section(current_memory, section, content)
            
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                f.write(updated_memory)
            
            print(f"Updated memory section: {section}")
            return True
        except Exception as e:
            print(f"Error updating memory: {e}")
            return False
    
    def add(self, section, content):
        """Add new information to memory"""
        try:
            current_memory = self.read()
            if not current_memory:
                return False
            
            # Add content to existing section or create new section
            updated_memory = self.add_to_section(current_memory, section, content)
            
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                f.write(updated_memory)
            
            print(f"Added to memory section: {section}")
            return True
        except Exception as e:
            print(f"Error adding to memory: {e}")
            return False
    
    def search(self, query):
        """Search memory for specific information"""
        try:
            memory = self.read()
            if not memory:
                return []
            
            lines = memory.split('\n')
            results = []
            
            for i, line in enumerate(lines):
                if query.lower() in line.lower():
                    # Get context (2 lines before and after)
                    start = max(0, i - 2)
                    end = min(len(lines), i + 3)
                    context = '\n'.join(lines[start:end])
                    
                    results.append({
                        'line': i + 1,
                        'content': line.strip(),
                        'context': context
                    })
            
            return results
        except Exception as e:
            print(f"Error searching memory: {e}")
            return []
    
    def replace_section(self, memory, section, new_content):
        """Replace a section in the memory file"""
        section_pattern = rf"(### \*\*{re.escape(section)}\*\*[\s\S]*?)(?=###|##|$)"
        replacement = f"### **{section}**\n\n{new_content}\n\n"
        
        if re.search(section_pattern, memory):
            return re.sub(section_pattern, replacement, memory)
        else:
            # Section doesn't exist, add it
            return memory + f"\n\n### **{section}**\n\n{new_content}\n\n"
    
    def add_to_section(self, memory, section, new_content):
        """Add content to an existing section"""
        section_pattern = rf"(### \*\*{re.escape(section)}\*\*[\s\S]*?)(?=###|##|$)"
        match = re.search(section_pattern, memory)
        
        if match:
            existing_content = match.group(1)
            updated_content = existing_content + f"\n{new_content}"
            return memory.replace(match.group(0), updated_content)
        else:
            # Section doesn't exist, create it
            return memory + f"\n\n### **{section}**\n\n{new_content}\n\n"
    
    def create_initial_memory(self):
        """Create initial memory file if it doesn't exist"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        initial_memory = f"""# Draconia Chronicles - AI Memory System

**Purpose**: File-based memory system for AI assistant to maintain context and important information across sessions

**Last Updated**: {today}
**Version**: 1.0.0

---

## 🧠 **Memory Categories**

### **Project Context**
- **Project Name**: Draconia Chronicles
- **Type**: Browser-based offline idle game
- **Tech Stack**: TypeScript, SvelteKit, PixiJS, Web Workers, Dexie (IndexedDB), Workbox PWA
- **Platform**: Desktop browsers, mobile browsers, installable PWA
- **Current Phase**: Phase 0 Foundation in Progress (Shooter-Idle focus)

### **Current Development Status**
- **Branch**: feat/w7-cicd-previews
- **CI/CD Status**: 4/6 workflows passing, 2 failing (Pages Deploys, E2E Smoke)
- **Recent Work**: CI/CD pipeline debugging, optimization journey, Steam distribution research
- **Next Steps**: Complete CI/CD fixes, continue optimization phases

---

## 📝 **Session Notes**

### **Current Session ({today})**
- **Focus**: Memory system creation
- **Key Outcomes**: 
  - Created file-based memory system
  - Established memory management workflow
- **Next Actions**: Test memory system, continue development work

---

**Note**: This memory system is maintained by the AI assistant and updated throughout sessions to maintain context and knowledge continuity.
"""
        
        with open(self.memory_file, 'w', encoding='utf-8') as f:
            f.write(initial_memory)
        
        print("Created initial memory file")
    
    def update_timestamp(self):
        """Update the last updated timestamp"""
        try:
            memory = self.read()
            if not memory:
                return False
            
            today = datetime.now().strftime("%Y-%m-%d")
            updated_memory = re.sub(
                r'\*\*Last Updated\*\*: .*',
                f'**Last Updated**: {today}',
                memory
            )
            
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                f.write(updated_memory)
            
            return True
        except Exception as e:
            print(f"Error updating timestamp: {e}")
            return False
    
    def list_sections(self):
        """List all sections in the memory file"""
        try:
            memory = self.read()
            if not memory:
                return []
            
            # Find all section headers
            section_pattern = r'### \*\*(.*?)\*\*'
            sections = re.findall(section_pattern, memory)
            return sections
        except Exception as e:
            print(f"Error listing sections: {e}")
            return []


def main():
    """CLI Interface"""
    if len(sys.argv) < 2:
        print_usage()
        return
    
    command = sys.argv[1]
    memory_manager = MemoryManager()
    
    if command == 'read':
        memory = memory_manager.read()
        if memory:
            print(memory)
    
    elif command == 'update':
        if len(sys.argv) < 4:
            print("Usage: python scripts/memory-manager.py update <section> <content>")
            sys.exit(1)
        
        section = sys.argv[2]
        content = ' '.join(sys.argv[3:])
        memory_manager.update(section, content)
        memory_manager.update_timestamp()
    
    elif command == 'add':
        if len(sys.argv) < 4:
            print("Usage: python scripts/memory-manager.py add <section> <content>")
            sys.exit(1)
        
        section = sys.argv[2]
        content = ' '.join(sys.argv[3:])
        memory_manager.add(section, content)
        memory_manager.update_timestamp()
    
    elif command == 'search':
        if len(sys.argv) < 3:
            print("Usage: python scripts/memory-manager.py search <query>")
            sys.exit(1)
        
        query = ' '.join(sys.argv[2:])
        results = memory_manager.search(query)
        
        if results:
            print(f"Found {len(results)} results for \"{query}\":")
            for i, result in enumerate(results, 1):
                print(f"\n{i}. Line {result['line']}: {result['content']}")
                print(f"Context:\n{result['context']}")
        else:
            print(f"No results found for \"{query}\"")
    
    elif command == 'timestamp':
        memory_manager.update_timestamp()
        print("Updated timestamp")
    
    elif command == 'sections':
        sections = memory_manager.list_sections()
        if sections:
            print("Available sections:")
            for section in sections:
                print(f"  - {section}")
        else:
            print("No sections found")
    
    else:
        print(f"Unknown command: {command}")
        print_usage()


def print_usage():
    """Print usage information"""
    print("""
Memory Manager - File-based AI Memory System

Usage: python scripts/memory-manager.py <command> [options]

Commands:
  read                    - Read current memory
  update <section> <content> - Update memory section
  add <section> <content>    - Add to memory section
  search <query>             - Search memory
  timestamp                 - Update last updated timestamp
  sections                  - List all sections

Examples:
  python scripts/memory-manager.py read
  python scripts/memory-manager.py update "Current Session" "Working on CI/CD fixes"
  python scripts/memory-manager.py add "Session Notes" "Completed memory system setup"
  python scripts/memory-manager.py search "Steam"
  python scripts/memory-manager.py sections
    """)


if __name__ == "__main__":
    main()
