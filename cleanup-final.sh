#!/bin/bash

echo "🧹 Final cleanup - Removing unused files and folders..."

# Remove unused utility scripts
echo "📝 Removing unused scripts..."
rm -f remove-kilometer.ts
rm -f truncate-table.ts
rm -f import-csv.ts
rm -f cleanup.sh

# Remove unused folders
echo "📁 Removing unused folders..."
rm -rf edit_documentation/
rm -rf csv/

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Removed:"
echo "  ✗ remove-kilometer.ts (old migration script)"
echo "  ✗ truncate-table.ts (old utility script)"
echo "  ✗ import-csv.ts (old import script)"
echo "  ✗ cleanup.sh (temporary cleanup script)"
echo "  ✗ edit_documentation/ (unused documentation)"
echo "  ✗ csv/ (old CSV import data)"
echo ""
echo "Note: icon/ folder kept (contains kl-flag.png & selangor-flag.png used in app)"
