# Manual Fix for npm PATH Issue

## The Problem
npm is loading modules from the old nvm directory (`C:\Users\namtv\AppData\Roaming\nvm\v12.22.12`) even though Node.js 18 is installed. This causes a version mismatch.

## Solution: Remove nvm from System PATH

### Step 1: Remove nvm from PATH Permanently

1. **Open System Properties**:
   - Press `Win + R`
   - Type `sysdm.cpl` and press Enter
   - Click the "Advanced" tab
   - Click "Environment Variables"

2. **Edit PATH**:
   - Under "User variables" or "System variables", find and select "Path"
   - Click "Edit"
   - Find and remove any entries containing:
     - `nvm`
     - `v12.22.12`
     - `C:\Users\namtv\AppData\Roaming\nvm`

3. **Ensure Node.js is in PATH**:
   - Make sure `C:\Program Files\nodejs` is in the PATH
   - If not, click "New" and add it
   - Move it to the top of the list if possible

4. **Click OK** on all dialogs

### Step 2: Restart Everything

1. **Close ALL terminal/PowerShell windows**
2. **Restart your computer** (recommended) or at least log out and log back in
3. Open a **NEW** PowerShell window

### Step 3: Verify Installation

```powershell
cd D:\English_Project
node --version    # Should show v18.20.4
npm --version     # Should show npm version (not error)
```

### Step 4: Reinstall Dependencies

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

### Step 5: Run Development Server

```powershell
npm run dev
```

## Alternative: Use nvm-windows Properly

If you want to keep using nvm-windows:

1. Open PowerShell as Administrator
2. Install Node.js 18 via nvm:
   ```powershell
   nvm install 18
   nvm use 18
   ```
3. Set Node.js 18 as default:
   ```powershell
   nvm alias default 18
   ```
4. Close and reopen your terminal
5. Verify:
   ```powershell
   node --version
   npm --version
   ```
6. Reinstall dependencies and run the app

## Quick Test: Use npx Directly

If npm still doesn't work, try using npx directly:

```powershell
cd D:\English_Project
& "C:\Program Files\nodejs\npx.cmd" vite
```

Or use yarn as an alternative:

```powershell
npm install -g yarn
yarn install
yarn dev
```

## Why This Happens

When you have both:
- Node.js 18 installed at `C:\Program Files\nodejs`
- nvm with Node.js 12 at `C:\Users\namtv\AppData\Roaming\nvm\v12.22.12`

The PATH has nvm paths that are loaded before the standard Node.js installation, causing npm to load incompatible modules.

The best solution is to remove nvm from PATH or use nvm properly to switch to Node.js 18.

