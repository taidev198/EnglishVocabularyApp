# Access Your App on Mobile Device

## Quick Setup

### Step 1: Start the Development Server

Make sure your laptop and mobile device are on the **same Wi-Fi network**.

```powershell
npm run dev
```

The server will start and show you the local network URL. Look for something like:
```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

### Step 2: Find Your Laptop's IP Address

Run this command to find your IP address:

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object IPAddress, InterfaceAlias
```

Or use:
```powershell
ipconfig | findstr /i "IPv4"
```

Look for the IP address that starts with `192.168.` or `10.` (this is your local network IP).

### Step 3: Access from Mobile

1. **On your mobile device**, open a web browser (Chrome, Safari, etc.)
2. **Enter the URL**: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`
   - Replace `YOUR_IP_ADDRESS` with your laptop's IP address

### Step 4: Install as PWA (Optional)

Once the app loads on your mobile:

#### For Android:
1. Chrome will show an "Install" prompt
2. Or tap the menu (three dots) → "Add to Home screen"

#### For iOS (iPhone/iPad):
1. Tap the Share button (square with arrow)
2. Scroll down and tap "Add to Home Screen"
3. The app will appear on your home screen like a native app

## Troubleshooting

### Can't Access from Mobile?

1. **Check Firewall**:
   - Windows might be blocking the connection
   - Allow Node.js/Vite through Windows Firewall when prompted
   - Or manually allow port 3000:
     - Go to Windows Defender Firewall → Advanced Settings
     - Create an inbound rule for port 3000

2. **Check Network**:
   - Make sure both devices are on the same Wi-Fi network
   - Try disabling VPN if you have one

3. **Check IP Address**:
   - Make sure you're using the correct IP address
   - The IP address might change if you reconnect to Wi-Fi

4. **Try Different Port**:
   - If port 3000 is blocked, you can change it in `vite.config.ts`:
     ```typescript
     server: {
       port: 3001,  // Change to different port
       host: true
     }
     ```

### Using Mobile Hotspot

If you want to use your mobile's hotspot:

1. **Turn on mobile hotspot** on your phone
2. **Connect your laptop** to the hotspot
3. **Find your laptop's IP** (it will be different now)
4. **Access from mobile** using that IP

Note: Some mobile carriers/hotspots might block local network access.

## Production Deployment

For a permanent mobile solution, deploy your app:

1. **Build the app**:
   ```powershell
   npm run build
   ```

2. **Deploy to**:
   - Vercel (recommended - free)
   - Netlify (free)
   - GitHub Pages (free)
   - Any hosting service

3. **Access from anywhere**:
   - Your app will be available at a public URL
   - Works on any device with internet
   - No need to be on the same network

See `DEPLOYMENT.md` for detailed deployment instructions.

## Quick Commands

```powershell
# Start dev server
npm run dev

# Get your IP address
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" }

# Build for production
npm run build
```

