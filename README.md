# Finger Fast - Tap Speed Test

A simple, fun mobile app where you tap as fast as you can for a set time. Built with Expo Router (React Native). This guide is for non-developers and explains step-by-step how to run, build, and configure the app.

## What you can do with this app
- **Play**: Choose a game duration (5s, 10s, 15s) and tap as fast as you can.
- **See results**: View your taps-per-second and total taps.
- **High score**: The best score is saved on your device.
- **Ads + Analytics**: Uses Google AdMob for ads and Firebase Analytics (optional).

## Requirements (install once)
- macOS or Windows
- Node.js 18+ and npm 9+ (download from `https://nodejs.org`)
- Xcode (for iOS simulator) from the App Store, or Android Studio (for Android emulator) from `https://developer.android.com/studio`
- An Expo account (free) at `https://expo.dev`

## 1) Get the project
1. Open Terminal.
2. Go to the project folder:
```bash
cd /path-to-app/Finger-Fast
```
3. Install dependencies:
```bash
npm install
```

## 2) Run the app (development)
- Start the dev server:
```bash
npm start
```
- Choose where to open:
  - iOS Simulator: press i
  - Android Emulator: press a
  - Or scan the QR with the Expo Go app on your phone

Tip: First-time simulator setup can take a few minutes.

## 3) Key configuration you may change
Most settings are in `app.json` and `package.json`.

- `app.json`
  - App name, icons, splash screen
  - Firebase files: `GoogleService-Info.plist` (iOS) and `google-services.json` (Android)
  - Plugins: Expo Router, Firebase, AdMob, Splash Screen, Build properties
- `package.json`
  - App scripts (start, ios, android, web)
  - Dependencies (libraries the app uses)

### Firebase (Analytics/Crashlytics)
- iOS: put your `GoogleService-Info.plist` at the project root and ensure `app.json -> expo.ios.googleServicesFile` points to it.
- Android: put your `google-services.json` at the project root and ensure `app.json -> expo.android.googleServicesFile` points to it.
- If you don’t want Firebase, remove these from `app.json -> plugins` and uninstall the packages:
```bash
npm remove @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics
```

### AdMob
- Update your own Ad Unit IDs in:
  - `app/index.tsx` (banner) and `app/game.tsx` (interstitial): replace test IDs with your production IDs when releasing.
- In `app.json`, plugin `react-native-google-mobile-ads` has `androidAppId` and `iosAppId`—replace with your IDs.

## 4) Build a standalone app (for TestFlight/Play Store)
You need an Expo account.

- iOS (build for simulator or device):
```bash
npm run ios
```
- Android:
```bash
npm run android
```
- Or use EAS (recommended for Store builds):
```bash
npx expo login
npx expo prebuild --clean
npx eas build -p ios --profile production
npx eas build -p android --profile production
```
EAS will guide you through creating signing credentials.

## 5) Where the main code lives
- Screens
  - `app/index.tsx`: Start screen (choose duration, view high score, banner ad)
  - `app/game.tsx`: Game logic (timer, taps, interstitial ad)
  - `app/results.tsx`: Results and high score
  - `app/_layout.tsx`: App setup (fonts, splash screen, theme, ads init)
- Hooks
  - `hooks/useGameMode.ts`: Saves/loads game duration
  - `hooks/useHighScore.ts`: Saves highest taps-per-second
- Utilities
  - `utils/storage.ts`: AsyncStorage helpers

## 6) Common tasks
- Change app name/icon: edit `app.json` under `expo.name` and `expo.ios.icon`/`expo.android.adaptiveIcon`.
- Change splash image: `app.json -> plugins -> expo-splash-screen`.
- Change ad IDs: update them in the code files and `app.json` plugin config.
- Change game durations: edit the array in `app/index.tsx` (`[5, 10, 15]`).

## 7) Troubleshooting
- Plugin not found: @react-native-firebase/crashlytics
  - Ensure the package is installed:
```bash
npm i @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics
```
  - Make sure `app.json -> plugins` includes the same packages. Then run:
```bash
npx expo prebuild
npm run ios # or npm run android
```

- Directory import not supported (ES modules) from @react-native-firebase/analytics
  - Cause: Metro/Web bundler can’t resolve a directory import.
  - Fix options (pick one):
    1) Use native builds only (iOS/Android), not web:
```bash
npm run ios
# or
a
```
    2) If you need web, remove Firebase packages and plugin lines from `app.json`, then:
```bash
npm remove @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics
```

- iOS: Permission/ATT dialog not showing
  - Try again on a real device; add a small delay before requesting permissions if needed in `app/_layout.tsx`.

- Ads not showing in production
  - Ensure consent flow (GDPR) is handled (`AdsConsent` in `_layout.tsx`).
  - Replace test IDs with your real Ad Unit IDs and wait for propagation.

## 8) Quick commands
```bash
npm install           # install dependencies
npm start             # start dev server
npm run ios           # run on iOS
npm run android       # run on Android
npm run web           # run on web (Firebase libs not supported)
```

If you get stuck, share the exact error message and what you tried. I’ll help you fix it fast.
