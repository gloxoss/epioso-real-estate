# 🚀 Local Development Setup Script (PowerShell)
# This script helps you set up the local development environment on Windows

Write-Host "🏠 Real Estate Management App - Local Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "📦 Please install it first:" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase" -ForegroundColor White
    Write-Host "   or visit: https://supabase.com/docs/guides/cli" -ForegroundColor White
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running." -ForegroundColor Red
    Write-Host "🐳 Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Prerequisites check passed!" -ForegroundColor Green
Write-Host ""

# Start Supabase local development
Write-Host "🚀 Starting Supabase local development..." -ForegroundColor Cyan
supabase start

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Supabase is now running locally!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Copy the credentials above to your .env.local file" -ForegroundColor White
    Write-Host "2. Run 'npm install' to install dependencies" -ForegroundColor White
    Write-Host "3. Run 'npx prisma db push' to set up the database schema" -ForegroundColor White
    Write-Host "4. Run 'npm run dev' to start the development server" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Useful URLs:" -ForegroundColor Yellow
    Write-Host "   • Supabase Studio: http://127.0.0.1:54323" -ForegroundColor White
    Write-Host "   • Inbucket (Email): http://127.0.0.1:54324" -ForegroundColor White
    Write-Host "   • Your App: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 For more details, see docs/SUPABASE_SETUP.md" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to start Supabase. Please check the error messages above." -ForegroundColor Red
    exit 1
}
