#!/bin/bash

echo "🚀 Preparing for Vercel Deployment"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI found"
fi

echo ""
echo "📋 Deployment Checklist:"
echo ""
echo "1. ✅ Build configuration ready (vercel.json)"
echo "2. ✅ Build script updated"
echo "3. ✅ .gitignore configured"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  Found .env file. Make sure to set environment variables in Vercel:"
    echo ""
    echo "   Required environment variables:"
    grep -E "^[A-Z_]+=" .env | sed 's/=.*/=<your-value>/' | sed 's/^/   - /'
    echo ""
else
    echo "⚠️  No .env file found. You'll need to set these environment variables in Vercel:"
    echo ""
    echo "   - DATABASE_URL=<your-neon-postgresql-url>"
    echo "   - IMGBB_API_KEY=<your-imgbb-api-key>"
    echo ""
fi

echo "📚 Next Steps:"
echo ""
echo "1. Login to Vercel:"
echo "   vercel login"
echo ""
echo "2. Deploy to preview:"
echo "   vercel"
echo ""
echo "3. Set environment variables:"
echo "   vercel env add DATABASE_URL"
echo "   vercel env add IMGBB_API_KEY"
echo ""
echo "4. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo ""
