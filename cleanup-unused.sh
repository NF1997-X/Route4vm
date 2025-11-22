#!/bin/bash

echo "🧹 Cleaning up unused files and duplicates..."

# 1. Remove unused page (home.tsx not imported in App.tsx)
echo "📄 Removing unused home.tsx page..."
if [ -f "client/src/pages/home.tsx" ]; then
    rm -f client/src/pages/home.tsx
    echo "  ✓ Removed client/src/pages/home.tsx"
fi

# 2. Remove unused statistics-cards component
echo "📊 Removing unused statistics-cards component..."
if [ -f "client/src/components/statistics-cards.tsx" ]; then
    rm -f client/src/components/statistics-cards.tsx
    echo "  ✓ Removed client/src/components/statistics-cards.tsx"
fi

# 3. Consolidate documentation (keep essential ones)
echo "📚 Removing redundant documentation..."
# Keep: README.md, QUICKSTART.md, DEPLOYMENT.md
# Remove: VERCEL_READY.md (info already in QUICKSTART and DEPLOYMENT)
#         DEPLOYMENT_CHECKLIST.md (redundant with DEPLOYMENT.md)
#         SERVERLESS_FIXES.md (technical notes, can be removed)
#         THEME_DESIGN_SYSTEM.md (internal docs)
if [ -f "VERCEL_READY.md" ]; then
    rm -f VERCEL_READY.md
    echo "  ✓ Removed VERCEL_READY.md"
fi

if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
    rm -f DEPLOYMENT_CHECKLIST.md
    echo "  ✓ Removed DEPLOYMENT_CHECKLIST.md"
fi

if [ -f "SERVERLESS_FIXES.md" ]; then
    rm -f SERVERLESS_FIXES.md
    echo "  ✓ Removed SERVERLESS_FIXES.md"
fi

if [ -f "THEME_DESIGN_SYSTEM.md" ]; then
    rm -f THEME_DESIGN_SYSTEM.md
    echo "  ✓ Removed THEME_DESIGN_SYSTEM.md"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Summary of removed files:"
echo "  ✗ client/src/pages/home.tsx (not used in routes)"
echo "  ✗ client/src/components/statistics-cards.tsx (no imports)"
echo "  ✗ VERCEL_READY.md (duplicate info)"
echo "  ✗ DEPLOYMENT_CHECKLIST.md (redundant)"
echo "  ✗ SERVERLESS_FIXES.md (technical notes)"
echo "  ✗ THEME_DESIGN_SYSTEM.md (internal docs)"
echo ""
echo "Kept essential files:"
echo "  ✓ README.md (main documentation)"
echo "  ✓ QUICKSTART.md (deployment guide)"
echo "  ✓ DEPLOYMENT.md (detailed deployment)"
echo "  ✓ IMGBB_SETUP.md (ImgBB setup guide)"
echo "  ✓ PWA_SETUP.md (PWA setup guide)"
