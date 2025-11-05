# Verification Script for Node.js Installation
Write-Host "=== Node.js Installation Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor $(if ($nodeVersion -match "v(18|19|20|21|22)") { "Green" } else { "Red" })

if ($nodeVersion -match "v(18|19|20|21|22)") {
    Write-Host "✓ Node.js version is compatible!" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js version is too old. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""

# Check npm version
Write-Host "Checking npm version..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
Write-Host "Checking project setup..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ node_modules directory exists" -ForegroundColor Green
} else {
    Write-Host "✗ node_modules directory not found. Run 'npm install' first." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=== Running Project Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check if vite is installed
Write-Host "Checking if Vite is installed..." -ForegroundColor Yellow
if (Test-Path "node_modules\vite") {
    Write-Host "✓ Vite is installed" -ForegroundColor Green
} else {
    Write-Host "✗ Vite not found. Running 'npm install'..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "=== Verification Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If everything looks good, you can now run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

