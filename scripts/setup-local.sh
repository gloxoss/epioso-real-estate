#!/bin/bash

# 🚀 Local Development Setup Script
# This script helps you set up the local development environment

echo "🏠 Real Estate Management App - Local Setup"
echo "==========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo "🐳 Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Start Supabase local development
echo "🚀 Starting Supabase local development..."
supabase start

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Supabase is now running locally!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the credentials above to your .env.local file"
    echo "2. Run 'npm install' to install dependencies"
    echo "3. Run 'npx prisma db push' to set up the database schema"
    echo "4. Run 'npm run dev' to start the development server"
    echo ""
    echo "🌐 Useful URLs:"
    echo "   • Supabase Studio: http://127.0.0.1:54323"
    echo "   • Inbucket (Email): http://127.0.0.1:54324"
    echo "   • Your App: http://localhost:3000"
    echo ""
    echo "📖 For more details, see docs/SUPABASE_SETUP.md"
else
    echo "❌ Failed to start Supabase. Please check the error messages above."
    exit 1
fi
