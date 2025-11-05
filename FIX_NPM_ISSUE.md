# Fix npm PATH Issue

## Problem
You have Node.js 18 installed, but npm is still trying to use the old npm from Node.js 12 in your nvm directory. This causes a version mismatch error.

## Solution

### Option 1: Restart Terminal (Easiest)

1. **Close your current PowerShell/terminal window completely**
2. **Open a NEW PowerShell window**
3. Navigate to your project:
   ```powershell
   cd D:\English_Project
   ```
4. Run the fix script:
   ```powershell
   .\fix-npm-path.ps1
   ```

### Option 2: Manual Fix (If Option 1 doesn't work)

1. **Close your current terminal completely**
2. Open a **NEW PowerShell window** (run as Administrator if possible)
3. Navigate to your project:
   ```powershell
   cd D:\English_Project
   ```
4. Remove nvm paths from PATH temporarily:
   ```powershell
   $env:PATH = ($env:PATH -split ';' | Where-Object { $_ -notlike '*nvm*' }) -join ';'
   ```
5. Verify npm works:
   ```powershell
   npm --version
   ```
   Should show npm version 10.x.x or higher
6. Reinstall dependencies:
   ```powershell
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   Remove-Item package-lock.json -ErrorAction SilentlyContinue
   npm install
   ```
7. Run the dev server:
   ```powershell
   npm run dev
   ```

### Option 3: Fix PATH Permanently (Advanced)

If you want to permanently remove nvm from PATH:

1. Open System Properties → Environment Variables
2. Edit the PATH variable
3. Remove any entries containing `nvm` or `v12.22.12`
4. Make sure `C:\Program Files\nodejs` is at the top of the PATH
5. Restart your computer or close all terminal windows

### Option 4: Use nvm-windows Properly

If you want to keep using nvm-windows:

1. Install Node.js 18 via nvm:
   ```powershell
   nvm install 18
   nvm use 18
   ```
2. Verify:
   ```powershell
   node --version  # Should show v18.x.x
   npm --version   # Should show npm version
   ```
3. Reinstall dependencies:
   ```powershell
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   Remove-Item package-lock.json -ErrorAction SilentlyContinue
   npm install
   ```

## Why This Happens

When you have both:
- Node.js installed at `C:\Program Files\nodejs` (Node.js 18)
- nvm installation with Node.js 12

The PATH might have nvm paths before the standard Node.js installation, causing npm to load incompatible modules.

## Quick Verification

After fixing, verify everything works:

```powershell
node --version  # Should show v18.x.x
npm --version   # Should show npm version (not error)
npm run dev     # Should start the dev server
```

