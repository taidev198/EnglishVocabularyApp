# Install Node.js 18 - Quick Guide

## Current Situation
You have Node.js 12.22.12 installed, but this project requires Node.js 18+.

## Solution: Install Node.js 18 LTS

### Step 1: Download Node.js 18
1. Go to: **https://nodejs.org/en/download/**
2. Download the **Windows Installer (.msi)** for Node.js 18 LTS
   - Choose the 64-bit version: `node-v18.x.x-x64.msi`
   - Or use this direct link: https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi

### Step 2: Install Node.js 18
1. Run the downloaded `.msi` installer
2. Follow the installation wizard
3. **Important**: Keep the default installation path (`C:\Program Files\nodejs`)
4. The installer will automatically replace your Node.js 12 installation

### Step 3: Verify Installation
1. **Close your current terminal/PowerShell window completely**
2. Open a **NEW** PowerShell window
3. Navigate to your project:
   ```powershell
   cd D:\English_Project
   ```
4. Check Node.js version:
   ```powershell
   node --version
   ```
   Should show: `v18.x.x` or higher

### Step 4: Reinstall Dependencies
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Step 5: Run the Development Server
```powershell
npm run dev
```

## Alternative: Using nvm-windows (if you want multiple versions)

If you prefer to use nvm-windows:

1. Install nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Open a **new** PowerShell window (run as Administrator)
3. Install Node.js 18:
   ```powershell
   nvm install 18
   nvm use 18
   ```
4. Verify:
   ```powershell
   node --version
   ```

## Troubleshooting

### If you still see Node.js 12 after installing:
1. **Restart your computer** (ensures PATH is fully updated)
2. Or manually verify the installation:
   ```powershell
   & "C:\Program Files\nodejs\node.exe" --version
   ```

### If npm commands don't work:
1. Close and reopen your terminal
2. Check if Node.js is in PATH:
   ```powershell
   $env:PATH -split ';' | Select-String nodejs
   ```

## Quick Verification Script

After installing Node.js 18, run:
```powershell
.\verify-installation.ps1
```

This will check everything is set up correctly.

