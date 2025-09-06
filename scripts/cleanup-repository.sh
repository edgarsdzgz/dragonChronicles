#!/bin/bash
# Repository cleanup script to remove backup files and temporary files

echo "🧹 Cleaning up repository..."

# Count files before cleanup
BACKUP_COUNT=$(find . -name "*.backup" -o -name "*.bak" -o -name "*.old" -o -name "*.tmp" | wc -l)
TEMP_COUNT=$(find . -name "sed*" -o -name "temp*" -o -name "tmp*" | wc -l)

echo "Found $BACKUP_COUNT backup files and $TEMP_COUNT temporary files."

if [ $BACKUP_COUNT -gt 0 ] || [ $TEMP_COUNT -gt 0 ]; then
    echo "Removing backup and temporary files..."
    
    # Remove backup files
    find . -name "*.backup" -delete
    find . -name "*.bak" -delete
    find . -name "*.old" -delete
    find . -name "*.tmp" -delete
    
    # Remove temporary files
    find . -name "sed*" -delete
    find . -name "temp*" -delete
    find . -name "tmp*" -delete
    
    echo "✅ Repository cleaned up!"
    echo "Removed $BACKUP_COUNT backup files and $TEMP_COUNT temporary files."
else
    echo "✅ Repository is already clean!"
fi

echo ""
echo "📋 Remember:"
echo "- Use Git branches for experimental work"
echo "- Use Git stash for temporary changes"
echo "- Use Git commits for checkpoints"
echo "- Never create manual backup files in a Git repository"
