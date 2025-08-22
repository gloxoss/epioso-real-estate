#!/bin/bash

# Epiosio Deployment Script for Vercel
echo "🚀 Deploying Epiosio to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
fi

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Adding and committing changes..."
    git add .
    git commit -m "feat: Deploy Epiosio with landing page to Vercel"
fi

# Test build locally first
echo "🔨 Testing build locally..."
if ! pnpm build; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your Epiosio application is now live!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables in Vercel dashboard"
echo "2. Configure your database connection"
echo "3. Test all features on the live site"
echo "4. Set up your custom domain (optional)"
echo ""
echo "📖 For detailed instructions, see: docs/VERCEL_DEPLOYMENT_GUIDE.md"
