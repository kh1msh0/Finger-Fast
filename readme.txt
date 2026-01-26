Finger Fast - Full Setup & Publishing Guide (readme.txt)

🚀 QUICKSTART CHECKLIST (5 steps to get running):
1. Create accounts (Expo, Apple, Google, AdMob, Firebase).
2. Clone repo → npm install → npx expo login.
3. Add AdMob IDs + Firebase files in app.json.
4. Run npx eas build.
5. Upload to stores + attach Privacy Policy.

💡 VALUE: This setup alone can save you days of trial-and-error. Following this guide means you skip the 20+ hours of figuring out Firebase, AdMob, and EAS quirks.

Purpose
- This document explains, step by step, how to set up accounts, obtain all required keys/files, install libraries, run builds/updates with Expo EAS, configure AdMob and Firebase, prepare privacy policy, and ship the app.
- If any step is unclear or outdated for your environment, fill the noted blanks and adjust.
- ⚠️ IMPORTANT: Firebase is OPTIONAL - you can build and publish without it if you prefer.

References (read these if stuck)
- Expo documentation: [Expo Docs](https://docs.expo.dev/)
- EAS Build: [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- EAS Update: [EAS Update Docs](https://docs.expo.dev/eas-update/introduction/)
- Prebuild (config plugins/native projects): [Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- React Native Google Mobile Ads (AdMob SDK): [Invertase AdMob Docs](https://docs.page/invertase/react-native-google-mobile-ads)
- React Native Firebase (Analytics/Crashlytics): [RN Firebase Docs](https://rnfirebase.io/)
- App icons: [Expo App Icons Guide](https://docs.expo.dev/guides/app-icons/)
- Splash screens: [Expo Splash Screen Guide](https://docs.expo.dev/guides/splash-screens/)

Account Checklist (create or confirm access)
1) Expo account (free)
   - Sign up/login at: https://expo.dev
   - Keep your Expo username ready for EAS builds.

2) Apple Developer Program (iOS)
   - Organization or Individual account: https://developer.apple.com/programs/
   - Needed for signing & App Store Connect.
   - Collect: Team ID, Apple ID email.

3) App Store Connect (iOS)
   - Login: https://appstoreconnect.apple.com
   - Create an app record (name, bundle id, SKU).
   - Prepare: App privacy details, screenshots, app icon, description, keywords, support URL.

4) Google Play Console (Android)
   - Signup: https://play.google.com/console
   - Create an app record (package name, app details).
   - Prepare: App content (privacy, ads, data safety), screenshots, icon, feature graphic.

5) Google AdMob
   - Login: https://admob.google.com
   - Create app entries for iOS and Android (can be without store links initially).
   - Get App IDs (iOS + Android) and create Ad Units (Banner, Interstitial, etc.).
   - Optional but recommended: Configure Privacy & Messaging (GDPR/US states) and Test Devices.

6) Firebase project (Analytics, optional Crashlytics) - ⚠️ OPTIONAL
   - Create project: https://console.firebase.google.com
   - Add iOS app: get `GoogleService-Info.plist`
   - Add Android app: get `google-services.json`
   - Download both files and keep at project root (or the paths defined in app.json).
   - If linking AdMob to Firebase (optional), link from AdMob app settings to enable advanced analytics. Then re-download the google service files.

Local Requirements (install once)
- Node.js 18+ and npm 9+: https://nodejs.org
- Xcode (for iOS Simulator) via App Store (macOS only)
- Android Studio (for Android Emulator): https://developer.android.com/studio
- Git (optional but recommended)

Project Setup
1) Clone or copy the project
2) Open Terminal and navigate to the project folder:
   cd /path-to-app/Finger-Fast
3) Install dependencies:
   npm install
4) Sign in to Expo (for EAS services):
   npx expo login

Configure Project Files
1) app.json
   - Update app name, icons, splash if needed.
   - Ensure AdMob plugin has your App IDs:
     plugins → react-native-google-mobile-ads → androidAppId, iosAppId
   - Ensure Firebase files paths (if using Firebase):
     ios.googleServicesFile: ./GoogleService-Info.plist
     android.googleServicesFile: ./google-services.json
   - Keep expo-build-properties with Proguard keep rule for Google Play services on Android (prevents Ad ID issues).

2) IDs in code
   - Replace test Ad Unit IDs with production ones for release:
     - Banner in app/index.tsx
     - Interstitial in app/game.tsx
   - Keep test IDs in development. Switch via __DEV__ blocks already present.

3) Firebase files (OPTIONAL - only if you want analytics/crashlytics)
   - Place `GoogleService-Info.plist` and `google-services.json` at project root as referenced by app.json.

Install Required Libraries (already in package.json; run if missing)
- Core Expo:
   npm i expo expo-router
- AdMob:
   npx expo install react-native-google-mobile-ads
- Firebase (OPTIONAL - follow official install guides if you want it):
   npm i @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics
- Async storage, icons, gesture libs (if missing):
   npm i @react-native-async-storage/async-storage @expo/vector-icons react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context

Development Run
- Start Metro bundler:
   npm start
- iOS Simulator:
   npm run ios
- Android Emulator:
   npm run android
- Web (note: RN Firebase packages are not supported on web):
   npm run web

Prebuild & Native Projects (when needed)
- Prebuild generates native iOS/Android projects from your config (required for some plugins/builds):
   npx expo prebuild
- If you change native dependencies or app.json plugins, re-run prebuild.
- To clean and regenerate:
   npx expo prebuild --clean
- After prebuild, use platform-specific run commands if you're building locally:
   npm run ios
   npm run android

EAS Build (cloud builds for stores)
1) Configure EAS (first time):
   npx eas login
   npx eas build:configure
2) Choose platform and profile:
   # iOS
   npx eas build -p ios --profile production
   # Android
   npx eas build -p android --profile production
3) Credentials: EAS will help generate/manage signing keys (Apple and Android). Keep your Apple login handy.
4) Download artifacts from the EAS dashboard after build completes.

EAS Update (OTA updates)
- Enable runtimeVersion in app.json (this project uses policy: appVersion).
- Create build with EAS first. After a compatible build is installed on device, you can push updates:
   npx eas update --branch production --message "Your update message"
- Learn constraints and rollout strategies: [EAS Update Docs](https://docs.expo.dev/eas-update/introduction/)

AdMob Setup (step by step)
1) Create apps and get App IDs in AdMob for iOS and Android.
2) Create Ad Units (Banner, Interstitial). Save Unit IDs.
3) Add your App IDs in app.json via the Expo config plugin:
   plugins → ["react-native-google-mobile-ads", { androidAppId, iosAppId }]
   Docs: https://docs.page/invertase/react-native-google-mobile-ads
4) Handle consent (GDPR/US states) using `AdsConsent` helpers as shown in the docs, and request iOS ATT with `expo-tracking-transparency` before initializing ads when required.
5) Initialize the Mobile Ads SDK early (e.g., app/_layout.tsx) and only then request/show ads.
6) Use test devices during development. Configure in AdMob → Test Devices.
7) For production, replace test ad unit IDs in code with your production IDs and submit with proper privacy declarations.

Firebase Setup (step by step) - ⚠️ OPTIONAL
1) Create Firebase project and add iOS and Android apps.
2) Download `GoogleService-Info.plist` (iOS) and `google-services.json` (Android).
3) Place them at project root and confirm app.json points to these paths.
4) If you link AdMob to Firebase (optional), do it from AdMob app settings; then re-download configs.
5) Analytics should work after native build; Crashlytics may require running and forcing a test crash according to [RN Firebase Docs](https://rnfirebase.io/crashlytics/usage). Fill in any platform-specific steps here if needed: __________

Privacy Policy & Store Declarations
- You must provide a hosted Privacy Policy URL (a simple static page is fine). Include:
  - What data is collected (Advertising ID, analytics data, crash data)
  - Why you collect it (ads, analytics, improving the app)
  - Links to third-party policies (Google/AdMob, Firebase)
  - How users can opt-out/withdraw consent
  - Contact email
- 🎯 BONUS: I've included a working privacy policy template in this repo so you don't waste hours creating one from scratch.
search privacy policy html in assets/useful_files and change blanks:
  1. write your email
  2. your app name
  
- Sample generator links (pick one and customize):
  - https://www.privacypolicies.com/ (generator)
  - https://termly.io/ (generator)
  - Or host your own simple HTML page.
- App Store Connect:
  - Privacy: declare advertising use and tracking; provide policy URL.
- Google Play Console:
  - App content → Ads, Data Safety: declare data collection and use. Provide policy URL.

iOS ATT (App Tracking Transparency) - ⚠️ CRITICAL FOR APPLE APPROVAL
- Request tracking permission before serving personalized ads.
- The app includes `expo-tracking-transparency` and requests ATT in `app/_layout.tsx`.
- ⚠️ WARNING: Apple WILL reject your app if ATT is missing or triggered wrong. This is non-negotiable.
- If reviewers request changes, consider delaying the prompt until a meaningful moment.

SKAdNetwork IDs (iOS)
- Some apps include a list of SKAdNetwork IDs for ad partners in app.json plugin config. Refer to partner/ad network documentation or the Invertase docs for examples if needed. If required, fill here: __________

Icons & Branding
- App icons: follow [Expo App Icons Guide](https://docs.expo.dev/guides/app-icons/)
- You can design with Figma/Canva or use a generator. Provide 1024x1024 master image and platform-specific variants per the guide.
- Splash screen: follow [Expo Splash Screen Guide](https://docs.expo.dev/guides/splash-screens/)

Typical Build Flow (from scratch)
1) Accounts: Create Expo, Apple, Google Play, AdMob, Firebase (optional).
2) Clone project → npm install → npx expo login
3) Add Firebase files to root (if using); update app.json for icons/ids; set AdMob App IDs and Ad Unit IDs.
4) Test locally: npm start → npm run ios / npm run android (use test ad units).
5) Prebuild if required by native modules: npx expo prebuild
6) EAS build:
   npx eas build -p ios --profile production
   npx eas build -p android --profile production
7) Submit to stores (via EAS Submit or manually). Fill privacy sections correctly.
8) After users install, ship small fixes via OTA:
   npx eas update --branch production --message "Fix copy"

Troubleshooting
- Plugin not found (@react-native-firebase/crashlytics): ensure the package is installed and present in app.json plugins, then re-run prebuild and rebuild.
   npm i @react-native-firebase/app @react-native-firebase/analytics @react-native-firebase/crashlytics
   npx expo prebuild --clean
   npm run ios (or) npm run android
- Directory import not supported (web): RN Firebase packages are not supported for web. Build/run native apps (iOS/Android) or remove Firebase for web builds.
- Ads not showing: verify consent flow, use test devices, confirm production Ad Unit IDs only in release, and ensure Proguard keep rule exists.

Blanks to Fill (project-specific)
- Production iOS AdMob App ID: __________
- Production Android AdMob App ID: __________
- Banner Ad Unit ID (iOS/Android): __________ / __________
- Interstitial Ad Unit ID (iOS/Android): __________ / __________
- Privacy Policy URL: __________
- Support Email: __________
- Apple App ID (after created): __________
- Google Play App Package Name (final): __________

Done! If anything feels off or outdated for your stack, note it here and we'll revise. See the linked docs above for the most current guidance.

💡 FINAL VALUE REMINDER: This comprehensive setup guide saves you from the 20+ hours of trial-and-error that most developers face when integrating AdMob, Firebase, and EAS builds. You're getting battle-tested, production-ready configurations that work.
