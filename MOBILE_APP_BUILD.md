# Building Native Mobile App

Your app is now configured with **Capacitor** to build native iOS and Android apps!

## Quick Start

### Step 1: Build the Web App

```powershell
npm run build
```

This creates the production build in the `dist` folder.

### Step 2: Sync with Capacitor

```powershell
npm run sync
```

Or use the combined command:

```powershell
npm run build:mobile
```

This syncs the web build with the native projects.

## Building for Android

### Prerequisites

1. **Install Android Studio**:
   - Download from: https://developer.android.com/studio
   - Install Android SDK and tools
   - Set up Android emulator (optional, for testing)

2. **Set up Android SDK**:
   - Open Android Studio
   - Go to Tools → SDK Manager
   - Install Android SDK (API level 33 or higher recommended)

### Build and Run

1. **Build and open Android project**:
   ```powershell
   npm run android
   ```
   This will:
   - Build the web app
   - Sync with Capacitor
   - Open Android Studio

2. **In Android Studio**:
   - Wait for Gradle sync to complete
   - Connect your Android device via USB (enable USB debugging)
   - Or start an emulator
   - Click the "Run" button (green play icon)
   - Select your device/emulator

### Generate APK

1. **Build APK**:
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Or use command line:
     ```powershell
     cd android
     .\gradlew assembleDebug
     ```
   - APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

2. **Install on device**:
   - Transfer APK to your Android device
   - Enable "Install from unknown sources" in settings
   - Open and install the APK

### Generate Release APK

For production release:

1. **Create keystore** (first time only):
   ```powershell
   keytool -genkey -v -keystore english-vocab-release.keystore -alias english-vocab -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing**:
   - Edit `android/app/build.gradle`
   - Add signing config (see Android documentation)

3. **Build release APK**:
   ```powershell
   cd android
   .\gradlew assembleRelease
   ```

## Building for iOS

### Prerequisites

1. **Mac computer required** (iOS development requires macOS)
2. **Install Xcode**:
   - Download from Mac App Store
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

3. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   cd ios/App
   pod install
   ```

### Build and Run

1. **Build and open iOS project**:
   ```powershell
   npm run ios
   ```
   This will:
   - Build the web app
   - Sync with Capacitor
   - Open Xcode

2. **In Xcode**:
   - Select your device or simulator
   - Click the "Run" button (play icon)
   - The app will install and run on your device/simulator

### Generate IPA for App Store

1. **Archive the app**:
   - In Xcode: Product → Archive
   - Wait for archive to complete

2. **Distribute**:
   - Click "Distribute App"
   - Choose distribution method (App Store, Ad Hoc, Enterprise)
   - Follow the wizard

## Development Workflow

### For Development

1. **Make changes** to your React code
2. **Rebuild**:
   ```powershell
   npm run build:mobile
   ```
3. **Reload in app**:
   - Android: Shake device → "Reload"
   - iOS: Shake device → "Reload"

### For Testing

1. **Build and sync**:
   ```powershell
   npm run build:mobile
   ```

2. **Open in IDE**:
   ```powershell
   # Android
   npm run android

   # iOS (Mac only)
   npm run ios
   ```

3. **Run from IDE** (Android Studio or Xcode)

## Project Structure

```
English_Project/
├── dist/              # Web build (generated)
├── android/           # Android native project
├── ios/               # iOS native project
├── capacitor.config.ts # Capacitor configuration
└── ...
```

## Troubleshooting

### Android Issues

**"SDK not found"**:
- Open Android Studio
- Go to Tools → SDK Manager
- Install required SDK components

**"Gradle sync failed"**:
- Delete `android/.gradle` folder
- Rebuild: `npm run build:mobile`

**"Build failed"**:
- Check Java version (requires Java 11+)
- Update Gradle: Edit `android/build.gradle`

### iOS Issues

**"Pod install failed"**:
```bash
cd ios/App
pod deintegrate
pod install
```

**"Code signing error"**:
- Open Xcode → Project Settings → Signing & Capabilities
- Select your development team
- Or disable signing for testing

**"Build failed"**:
- Clean build: Product → Clean Build Folder
- Delete Derived Data: `~/Library/Developer/Xcode/DerivedData`

## Updating Capacitor

When you update Capacitor or add plugins:

```powershell
npm install @capacitor/core @capacitor/cli
npx cap sync
```

## Adding Native Plugins

Capacitor plugins can add native functionality:

```powershell
# Example: Camera plugin
npm install @capacitor/camera
npx cap sync
```

## Publishing to App Stores

### Android (Google Play)

1. Create Google Play Developer account ($25 one-time fee)
2. Build release APK/AAB
3. Upload to Google Play Console
4. Fill in app details, screenshots, etc.
5. Submit for review

### iOS (App Store)

1. Create Apple Developer account ($99/year)
2. Archive in Xcode
3. Upload via Xcode or App Store Connect
4. Fill in app details, screenshots, etc.
5. Submit for review

## Quick Reference

```powershell
# Build web app
npm run build

# Sync with native projects
npm run sync

# Build and sync
npm run build:mobile

# Open Android project
npm run android

# Open iOS project (Mac only)
npm run ios
```

