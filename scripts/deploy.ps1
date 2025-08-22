# Epiosio Deployment Script for Vercel (PowerShell)
Write-Host "🚀 Deploying Epiosio to Vercel..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📝 Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Check if we have uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Adding and committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "feat: Deploy Epiosio with landing page to Vercel"
}

# Test build locally first
Write-Host "🔨 Testing build locally..." -ForegroundColor Blue
try {
    pnpm build
    Write-Host "✅ Build successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your Epiosio application is now live!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set up your environment variables in Vercel dashboard"
Write-Host "2. Configure your database connection"
Write-Host "3. Test all features on the live site"
Write-Host "4. Set up your custom domain (optional)"
Write-Host ""
Write-Host "📖 For detailed instructions, see: docs/VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Blue
