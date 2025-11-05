# iOS Build Guide - English Vocabulary App

## ⚠️ Important: macOS Required

**iOS development requires a Mac computer with macOS and Xcode.** You cannot build iOS apps on Windows directly.

## Prerequisites

### 1. Mac Computer with macOS
- macOS 12.0 (Monterey) or later recommended
- At least 8GB RAM (16GB recommended)
- Sufficient disk space (Xcode requires ~15GB)

### 2. Install Xcode
1. Open **App Store** on your Mac
2. Search for "Xcode"
3. Click "Get" or "Install" (free, but large download)
4. Wait for installation to complete (~15GB)

### 3. Install Xcode Command Line Tools
Open Terminal and run:
```bash
xcode-select --install
```
Click "Install" when prompted.

### 4. Install CocoaPods
CocoaPods is the dependency manager for iOS projects:
```bash
sudo gem install cocoapods
```

Verify installation:
```bash
pod --version
```

### 5. Install Node.js (if not already installed)
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

Verify:
```bash
node --version
npm --version
```

## Build Steps

### Step 1: Prepare the Project

1. **Transfer project to Mac** (if building on different machine):
   - Copy the entire `English_Project` folder to your Mac
   - Or clone from Git repository

2. **Install dependencies**:
   ```bash
   cd English_Project
   npm install
   ```

### Step 2: Build the Web App

Build the production web app:
```bash
npm run build
```

This creates the optimized build in the `dist/` folder.

### Step 3: Sync with Capacitor

Sync the web build with the iOS native project:
```bash
npm run sync
```

Or use the combined command:
```bash
npm run build:mobile
```

This will:
- Build the web app
- Copy files to `ios/App/App/public/`
- Update Capacitor configuration

### Step 4: Install CocoaPods Dependencies

Navigate to the iOS project and install pods:
```bash
cd ios/App
pod install
```

This may take a few minutes on first run.

### Step 5: Open in Xcode

Open the workspace (not the project file):
```bash
cd ../..
npm run ios
```

Or manually:
```bash
open ios/App/App.xcworkspace
```

⚠️ **Important**: Always open `.xcworkspace`, not `.xcodeproj`

### Step 6: Configure Signing & Capabilities

1. In Xcode, select the **App** project in the left sidebar
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Select your **Team** (you'll need an Apple Developer account)
5. Xcode will automatically create a provisioning profile

**For Testing (Free Account):**
- You can use a free Apple ID for testing on your own device
- Select "Personal Team" in the Team dropdown
- You may need to trust the developer certificate on your device

### Step 7: Select Target Device

1. In Xcode toolbar, click the device selector (next to the play button)
2. Choose:
   - **Your connected iPhone/iPad** (for device testing)
   - **iOS Simulator** (for testing without device)

### Step 8: Build and Run

1. Click the **Play** button (▶️) or press `Cmd + R`
2. Wait for build to complete
3. App will launch on your device/simulator

## Building for App Store

### Prerequisites
- **Apple Developer Account** ($99/year)
- Sign up at: https://developer.apple.com

### Step 1: Configure App Store Distribution

1. In Xcode, select **App** project
2. Go to **Signing & Capabilities**
3. Select your **Paid Developer Team**
4. Set **Bundle Identifier** (should match your Apple Developer account)

### Step 2: Update Version and Build Number

1. Select **App** target
2. Go to **General** tab
3. Update:
   - **Version**: e.g., "1.0.0"
   - **Build**: e.g., "1" (increment for each upload)

### Step 3: Archive the App

1. Select **Any iOS Device (arm64)** from device selector
2. Go to **Product → Archive**
3. Wait for archive to complete
4. **Organizer** window will open

### Step 4: Distribute to App Store

1. In Organizer, select your archive
2. Click **Distribute App**
3. Choose **App Store Connect**
4. Follow the wizard:
   - Select distribution method
   - Choose code signing
   - Upload to App Store Connect

### Step 5: Submit via App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Create a new app (if first time)
3. Fill in:
   - App information
   - Screenshots
   - Description
   - Privacy policy URL
   - App category
4. Submit for review

## Alternative: Building on Windows (Cloud Build Services)

If you don't have a Mac, you can use cloud build services:

### Option 1: Codemagic
- Website: https://codemagic.io
- Supports Capacitor iOS builds
- Free tier available

### Option 2: Appcircle
- Website: https://appcircle.io
- CI/CD for mobile apps
- Free tier available

### Option 3: MacStadium / MacinCloud
- Rent a Mac in the cloud
- Monthly subscription
- Full macOS access

## Troubleshooting

### "Pod install failed"

```bash
cd ios/App
pod deintegrate
pod cache clean --all
pod install
```

### "Code signing error"

1. Open Xcode → Preferences → Accounts
2. Add your Apple ID
3. Select your team in Signing & Capabilities

### "Build failed - Missing module"

```bash
cd ios/App
pod update
```

### "Simulator not working"

1. Open Xcode → Preferences → Components
2. Download iOS Simulator for your target version
3. Restart Xcode

### "Device not detected"

1. Unlock your iPhone/iPad
2. Trust the computer when prompted
3. Enable Developer Mode: Settings → Privacy & Security → Developer Mode

### "Archive failed"

1. Clean build folder: Product → Clean Build Folder (`Cmd + Shift + K`)
2. Delete Derived Data:
   - Go to: `~/Library/Developer/Xcode/DerivedData`
   - Delete the folder for your project
3. Rebuild

## Quick Reference Commands

```bash
# Build web app
npm run build

# Sync with native projects
npm run sync

# Build and sync (combined)
npm run build:mobile

# Open iOS project in Xcode
npm run ios

# Install CocoaPods dependencies
cd ios/App
pod install

# Update CocoaPods
pod update

# Clean and reinstall pods
pod deintegrate
pod install
```

## Project Structure

```
English_Project/
├── dist/                    # Web build (generated)
├── ios/
│   └── App/
│       ├── App.xcworkspace  # Open this in Xcode
│       ├── App.xcodeproj
│       ├── Podfile          # CocoaPods dependencies
│       └── App/
│           └── public/      # Web build files (synced)
├── capacitor.config.ts      # Capacitor configuration
└── package.json
```

## Next Steps After Building

1. **Test on device**: Install on your iPhone/iPad
2. **Test on simulator**: Use iOS Simulator
3. **Add native features**: Install Capacitor plugins
4. **Prepare for release**: Update version, icons, splash screens
5. **Submit to App Store**: Follow App Store guidelines

## Additional Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Xcode Documentation](https://developer.apple.com/xcode/)

