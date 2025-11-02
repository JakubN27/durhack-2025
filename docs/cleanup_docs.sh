#!/bin/bash

# Files to KEEP (essential documentation)
KEEP_FILES=(
  "README.md"
  "QUICKSTART.md"
  "OVERVIEW.md"
  "SETUP.md"
  "ARCHITECTURE.md"
  "DEVELOPMENT.md"
  "TROUBLESHOOTING.md"
  "API_REFERENCE.md"
  "DATABASE_SCHEMA.md"
  "GEMINI_INTEGRATION.md"
  "MATCHING_ALGORITHM.md"
  "CHAT_SYSTEM.md"
  "PROFILE_SYSTEM.md"
)

# Move redundant files to archive
mkdir -p _archive

echo "Moving redundant documentation to _archive/..."

for file in *.md; do
  # Check if file should be kept
  keep=false
  for keep_file in "${KEEP_FILES[@]}"; do
    if [ "$file" = "$keep_file" ]; then
      keep=true
      break
    fi
  done
  
  # Move to archive if not in keep list
  if [ "$keep" = false ]; then
    echo "Archiving: $file"
    mv "$file" _archive/
  else
    echo "Keeping: $file"
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo "📁 Kept $(ls *.md 2>/dev/null | wc -l) essential files"
echo "📦 Archived $(ls _archive/*.md 2>/dev/null | wc -l) redundant files"
echo ""
echo "To restore archived files: mv _archive/*.md ."
