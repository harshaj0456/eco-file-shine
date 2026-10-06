# GreenPulse Android APK & PWA Guide

Production-ready Android build and Progressive Web App configuration for **GreenPulse** (Personal Digital Carbon & Storage Optimizer).

---

## 📦 Generated Deliverables & APK Outputs

| Deliverable | Location | Size | Description |
|---|---|---|---|
| **Debug APK** | `apk/app-debug.apk` | ~4.45 MB | Development APK with debugging symbols enabled |
| **Release APK** | `apk/app-release.apk` | ~3.47 MB | Production APK signed with `greenpulse.keystore` |
| **Keystore** | `greenpulse.keystore` | 2.6 KB | Release signing keystore (alias: `greenpulse`) |
| **PWA Manifest** | `public/manifest.json` | — | Web app manifest with emerald theme & icons |
| **Service Worker** | `public/service-worker.js` | — | Offline caching & asset management |
| **Capacitor Config** | `capacitor.config.ts` | — | Native Android bridge configuration |

---

## ⚡ Quick Start: 1-Command Android Build

To build the entire stack (web bundle + Capacitor asset sync + native Gradle APK compilation):

```bash
npm run build:android
```

Or individual commands:

```bash
# 1. Build web bundle & prepare dist directory
npm run build:web

# 2. Sync web bundle to Android native project
npm run cap:sync

# 3. Assemble Debug and Signed Release APKs
npm run build:apk
```

---

## 🛠️ Step-by-Step Architecture & Configuration

### 1. PWA & Offline Support
- **Manifest (`public/manifest.json`)**: Configures app name, standalone display mode, orientation (`portrait-primary`), `#10B981` theme color, high-res icons (192x192 & 512x512), and preview screenshots.
- **Service Worker (`public/service-worker.js`)**: Caches static assets, handles network fallback, and claims active clients for fast offline experiences.
- **Root Injection (`src/routes/__root.tsx`)**: Integrates viewport meta tags (`viewport-fit=cover`), theme colors, manifest link, and client-side service worker registration.

### 2. Capacitor Android Bridge
- **`capacitor.config.ts`**:
  - `appId`: `com.greenpulse.app`
  - `appName`: `GreenPulse`
  - `webDir`: `dist`
  - `server.androidScheme`: `https`
  - `SplashScreen` & `StatusBar` emerald styling configured.
- **`android/app/src/main/AndroidManifest.xml`**:
  - `android.permission.INTERNET`
  - `android.permission.ACCESS_NETWORK_STATE`
  - `android.permission.READ_EXTERNAL_STORAGE` (maxSdkVersion 32)
  - `android.permission.WRITE_EXTERNAL_STORAGE` (maxSdkVersion 32)
  - `android.permission.POST_NOTIFICATIONS`

### 3. Keystore & Production Signing
The release APK is signed with standard RSA 2048-bit key:
- Keystore file: `android/app/greenpulse.keystore`
- Alias: `greenpulse`
- Store/Key Password: `greenpulse123`
- Configured directly inside `android/app/build.gradle` `signingConfigs.release`.

---

## 📱 Testing Instructions (Emulator & Real Device)

### Using ADB (Android Debug Bridge)

1. Connect your Android device via USB (with **USB Debugging** enabled in Developer Options) or start an Android Emulator.
2. Verify connection:
   ```bash
   adb devices
   ```
3. Install the APK:
   ```bash
   # Install Debug APK
   adb install -r apk/app-debug.apk

   # Or install Release APK
   adb install -r apk/app-release.apk
   ```
4. Launch GreenPulse on the device:
   ```bash
   adb shell am start -n com.greenpulse.app/.MainActivity
   ```
5. View real-time logs:
   ```bash
   adb logcat -s Capacitor/Console:* chromium:* GreenPulse:*
   ```

### Using Android Studio GUI

```bash
npm run cap:open
```
- Click the green **Run** button to launch on your connected device or emulator.
- Or select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🧪 Testing Checklist

- [x] **App Launch**: App starts with custom splash screen and emerald theme bar.
- [x] **Routing & Tabs**: Landing (`/`), Dashboard (`/app`), Report (`/report`), Settings (`/settings`), Auth (`/auth`).
- [x] **Offline Cache**: Functions properly when offline via service worker and local web assets.
- [x] **Storage State**: `localStorage` and Zustand state persist across sessions.
- [x] **Touch UI**: Responsive layout tailored for mobile displays with safe-area insets.

---

## 🚀 Google Play Store Submission Steps

1. **Google Play Console**: Log in to [play.google.com/console](https://play.google.com/console).
2. **Create Application**: Name: `GreenPulse`, Default Language: `English`, Category: `Productivity / Utilities`.
3. **Store Listing**:
   - Short description: Personal Digital Carbon & Storage Optimizer.
   - Screenshots: Use `public/screenshot-1.png` and `public/screenshot-2.png` or generated device screenshots.
   - App Icon: Upload `public/icon-512.png`.
4. **App Release**:
   - Upload `apk/app-release.apk` (or build App Bundle `.aab` with `./gradlew bundleRelease`).
   - Add release notes and rollout to Internal Testing / Production.

---

## 🔍 Troubleshooting Guide

### Q1: `adb devices` shows unauthorized or empty
- **Fix**: Check your phone screen for the prompt *"Allow USB debugging?"* and tap **Always allow**.
- **Fix**: Restart ADB server:
  ```bash
  adb kill-server
  adb start-server
  ```

### Q2: Blank white screen on launch
- **Fix**: Run `adb logcat | grep -i chromium` to check for WebView JavaScript errors.
- Ensure `prepare_dist.py` has copied all asset bundles to `dist/` before running `npx cap sync android`.

### Q3: How to generate Android App Bundle (.aab) for Play Store
- Run:
  ```bash
  cd android
  ./gradlew bundleRelease
  ```
  The bundle will be generated at `android/app/build/outputs/bundle/release/app-release.aab`.
