# Fix npm PATH issue - Run this script in a NEW PowerShell window
Write-Host "=== Fixing npm PATH Issue ===" -ForegroundColor Cyan
Write-Host ""

# Remove nvm paths from current session PATH
$newPath = ($env:PATH -split ';' | Where-Object { $_ -notlike '*nvm*' }) -join ';'
$env:PATH = "C:\Program Files\nodejs;" + $newPath

Write-Host "Updated PATH (temporary for this session)" -ForegroundColor Yellow
Write-Host ""

# Verify Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green

if ($nodeVersion -notmatch "v(18|19|20|21|22)") {
    Write-Host "✗ Node.js version is still too old!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verify npm version
Write-Host "Checking npm version..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ npm error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "The npm from nvm is conflicting. Please:" -ForegroundColor Yellow
    Write-Host "1. Close this terminal completely" -ForegroundColor White
    Write-Host "2. Open a NEW PowerShell window" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Reinstall dependencies
Write-Host "=== Reinstalling Dependencies ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Removing old node_modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Running Development Server ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Starting dev server..." -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host ""
    Write-Host "✗ Installation failed. Please check the errors above." -ForegroundColor Red
}

