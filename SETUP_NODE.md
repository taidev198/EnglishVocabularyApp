# Node.js Upgrade Guide

Your current Node.js version (12.22.12) is too old for this project. You need Node.js 18+ to run Vite 6.

## Quick Solution: Use nvm-windows

### Step 1: Install nvm-windows
1. Download from: https://github.com/coreybutler/nvm-windows/releases
2. Download `nvm-setup.exe` (the installer)
3. Run the installer and follow the instructions

### Step 2: Install Node.js 18
Open a **new** PowerShell/Command Prompt window (important - restart your terminal) and run:

```powershell
nvm install 18
nvm use 18
```

### Step 3: Verify Installation
```powershell
node --version
# Should show v18.x.x or higher
```

### Step 4: Reinstall Dependencies
```powershell
cd D:\English_Project
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Step 5: Run the App
```powershell
npm run dev
```

## Alternative: Direct Node.js Installation

If you don't want to use nvm:

1. Download Node.js 18 LTS from: https://nodejs.org/
2. Install it (this will replace your current Node.js version)
3. Open a new terminal
4. Run `node --version` to verify
5. Reinstall dependencies as shown above

## Why This is Needed

- Vite 6.x requires Node.js 18+
- Modern JavaScript features (top-level await) require Node.js 18+
- Your current Node.js 12 doesn't support these features

