# Mobile App API Configuration Guide

This guide explains how to configure the mobile app to connect to the Python Whisper backend API.

## Overview

The mobile app needs to call two backend APIs:
1. **Java Backend API** (API Gateway) - for vocabulary and shadowing services
2. **Python Whisper API** - for audio analysis (waveform and pitch visualization)

## Configuration

### Step 1: Create Environment File

Create a `.env` file in the root of `EnglishVocabularyApp` directory:

```bash
# .env file
VITE_API_BASE_URL=http://YOUR_COMPUTER_IP:8091/api
VITE_WHISPER_API_URL=http://YOUR_COMPUTER_IP:8000
```

### Step 2: Find Your Computer's IP Address

#### Windows:
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

#### Mac/Linux:
```bash
ifconfig
# or
ip addr
# Look for "inet" address (usually starts with 192.168.x.x or 10.x.x.x)
```

### Step 3: Configure for Different Environments

#### For Android Emulator:
```bash
VITE_API_BASE_URL=http://10.0.2.2:8091/api
VITE_WHISPER_API_URL=http://10.0.2.2:8000
```
**Note:** Android emulator uses `10.0.2.2` to access the host machine's localhost.

#### For iOS Simulator:
```bash
VITE_API_BASE_URL=http://localhost:8091/api
VITE_WHISPER_API_URL=http://localhost:8000
```
**Note:** iOS simulator can access localhost directly.

#### For Physical Devices (iOS/Android):
```bash
# Replace YOUR_COMPUTER_IP with your actual IP (e.g., 192.168.1.100)
VITE_API_BASE_URL=http://YOUR_COMPUTER_IP:8091/api
VITE_WHISPER_API_URL=http://YOUR_COMPUTER_IP:8000
```

**Important:** 
- Your computer and mobile device must be on the same Wi-Fi network
- Make sure your firewall allows connections on ports 8000 and 8091

### Step 4: Start the Backend Services

Before running the mobile app, ensure both backend services are running:

1. **Start Java Backend (API Gateway)**:
   ```bash
   # Navigate to joblink-microservices directory
   # Start the API Gateway service on port 8091
   ```

2. **Start Python Whisper API**:
   ```bash
   cd whisper
   ./start_api.sh
   # Or manually:
   python api_server.py
   ```
   The Whisper API should be running on `http://localhost:8000`

### Step 5: Rebuild the Mobile App

After updating the `.env` file, rebuild the app:

```bash
npm run build:mobile
```

This will:
- Build the web app with the new environment variables
- Sync with Capacitor
- Update the native projects

### Step 6: Test the Connection

1. **Check API Gateway**:
   - Open the app on your device/emulator
   - Try to load vocabulary words
   - Check the console for API calls

2. **Check Whisper API**:
   - Go to Shadow Challenge screen
   - Record audio
   - After recording, check if waveform and pitch visualizations appear
   - Check the console for Whisper API calls

## Troubleshooting

### "Failed to fetch" Error

**Problem:** The app cannot connect to the backend APIs.

**Solutions:**
1. Verify both backend services are running:
   - Java API Gateway on port 8091
   - Python Whisper API on port 8000

2. Check your IP address is correct:
   - Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Make sure you're using the correct IP for your network

3. Check firewall settings:
   - Allow incoming connections on ports 8000 and 8091
   - Windows: Windows Defender Firewall
   - Mac: System Preferences → Security & Privacy → Firewall

4. Verify network connectivity:
   - Ensure your computer and mobile device are on the same Wi-Fi network
   - Try pinging your computer's IP from the device

### Android Emulator Issues

**Problem:** Cannot connect from Android emulator.

**Solution:**
- Use `10.0.2.2` instead of `localhost` or your IP
- This is the special IP that Android emulator uses to access the host machine

### iOS Simulator Issues

**Problem:** Cannot connect from iOS simulator.

**Solution:**
- iOS simulator can use `localhost` directly
- Make sure your backend services are running on `localhost`

### Physical Device Issues

**Problem:** Cannot connect from physical device.

**Solutions:**
1. Ensure both devices are on the same Wi-Fi network
2. Use your computer's local IP address (not `localhost`)
3. Check your router's settings (some routers block device-to-device communication)
4. Try disabling VPN if you're using one

## API Endpoints

### Java Backend (API Gateway)
- Base URL: `http://YOUR_IP:8091/api`
- Shadowing endpoint: `POST /vocabulary/shadowing`

### Python Whisper API
- Base URL: `http://YOUR_IP:8000`
- Audio analysis endpoint: `POST /api/analyze-audio`
- Transcription endpoint: `POST /api/transcribe`

## Example .env File

```bash
# For Android Emulator
VITE_API_BASE_URL=http://10.0.2.2:8091/api
VITE_WHISPER_API_URL=http://10.0.2.2:8000

# For iOS Simulator
# VITE_API_BASE_URL=http://localhost:8091/api
# VITE_WHISPER_API_URL=http://localhost:8000

# For Physical Devices (replace with your IP)
# VITE_API_BASE_URL=http://192.168.1.100:8091/api
# VITE_WHISPER_API_URL=http://192.168.1.100:8000
```

## Notes

- Environment variables are embedded at build time
- You need to rebuild the app after changing `.env` file
- The `.env` file should not be committed to version control (add to `.gitignore`)
- For production, set these values in your CI/CD pipeline or build configuration

