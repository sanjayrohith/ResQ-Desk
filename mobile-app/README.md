# ResQ Desk — Mobile

React Native CLI port of the [`frontend`](../frontend) web dashboard, targeting phones. Same live backend, same "premium black" design system, same domain (AI-assisted emergency dispatch).

## Layout vs. the web app

The web dashboard is a fixed 3-column desktop layout (Comms | Incident Report | Tactical Map) with no responsive breakpoints. On a phone that doesn't fit, so it's rebuilt as **3 bottom tabs** — Comms, Incident, Map — each tab showing the corresponding panel full-screen, with the same header/status-bar chrome top and bottom. State that used to be local to the single `Index.tsx` page (`incidentData`, analyzing/popup flags) now lives in `src/api/IncidentContext.tsx` so all three tabs share it.

## Before you run it

1. **Install deps**: `npm install` (already done if you just cloned this).
2. **Fonts** — the web app uses Inter + JetBrains Mono from Google Fonts. This repo has no network access to fetch the actual font files, so `src/theme/typography.ts` currently falls back to the OS system font / monospace. To get pixel-exact type:
   - Download **Inter** (weights 400/500/600/700 as `Inter-Regular.ttf`, `Inter-Medium.ttf`, `Inter-SemiBold.ttf`, `Inter-Bold.ttf`) and **JetBrains Mono** (`JetBrainsMono-Regular.ttf`, `-Medium.ttf`, `-Bold.ttf`) from [Google Fonts](https://fonts.google.com/).
   - Drop the `.ttf` files into `src/assets/fonts/`.
   - Add `"assets": ["./src/assets/fonts"]` to a `react-native.config.js` at the project root, then run `npx react-native-asset` (or manually link via Xcode/`android/app/src/main/assets/fonts`).
   - The `fontFamily` names in `src/theme/typography.ts` already match these filenames — no code changes needed once the files are linked.
3. **Maps** — uses `react-native-maps` with `PROVIDER_GOOGLE` on both platforms to match the web app's dark tactical map look as closely as native maps allow:
   - **Android**: put a real Google Maps API key (Maps SDK for Android enabled) into `android/app/src/main/AndroidManifest.xml`, replacing `YOUR_GOOGLE_MAPS_API_KEY`.
   - **iOS**: `react-native-maps` uses Apple Maps by default unless you add the Google Maps iOS SDK pod and initialize it with a key in `AppDelegate.swift` — see the [react-native-maps iOS install guide](https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md#ios). Without that it'll silently fall back to Apple Maps (still functional, just not the custom dark style).
   - The dark style JSON lives in `src/components/dashboard/mapStyle.ts` if you want to tweak it.
4. **Voice input** — `LiveTranscription` uses `@react-native-voice/voice` for on-device speech-to-text (the web app used the browser's Speech Recognition API, which doesn't exist in RN). Microphone/speech permissions are already declared in `AndroidManifest.xml` and `Info.plist`.
5. **Backend** — points at the same live backend the web app uses (`https://resq-backend-9585.onrender.com`), see `src/api/client.ts`. Change `API_URL` there if you stand up your own instance.
6. **iOS Pods** — run `bundle install && bundle exec pod install` inside `ios/` before the first `npm run ios` (see Step 2 below); this repo's sandbox has no macOS/CocoaPods, so pods have not been installed here yet.

## What's ported 1:1 vs. adapted

- **1:1**: color palette (`src/theme/colors.ts`, taken from `frontend/src/index.css` HSL vars + the `tailwind.config.ts` slate/cyan remap), the `.panel`/`.data-cell`/`.status-badge`/`.keyword-tag` component classes (now `src/components/ui/*`), the Odometer clock, the `useCountUp` confidence-gauge animation, the DispatchPopup's 3 states (auto-dispatch countdown / reallocation confirm / success), and all backend data shapes (`src/api/types.ts` mirrors `backend/app/schemas.py`).
- **Adapted**: 3-column grid → bottom tabs (see above); CSS `backdrop-filter: blur()` glass panels → solid semi-transparent panels with shadow/elevation (no native blur dependency wired in yet — `@react-native-community/blur` is installed if you want to layer it in); Leaflet/CartoDB map → `react-native-maps` with a custom dark style; conic-gradient animated panel borders and CSS keyframe aurora backgrounds were dropped as literal ports (RN has no CSS gradients/backdrop-filter) — the core pulse/glow/countdown-ring animations that carry the most visual weight were rebuilt with RN `Animated`.

---

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
