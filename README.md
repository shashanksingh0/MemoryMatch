# Memory Match

A cross-platform memory card game built with React Native and Expo SDK 57.
Flip cards over, find all the matching pairs, beat the clock, and earn coins
along the way. Runs on iOS, Android, and web from a single codebase.

## Features

- Three difficulty levels plus an Expert board (4, 6, 8, or 12 pairs)
- Four visual themes (Animals, Fruits, Space, Ocean) plus a Random option
- 3D card flip animations with sound effects and background music
- 3-second memorize phase before every round
- Scoring with streak combo bonuses and a time-based star rating
- Coin economy: earn coins on wins, unlock achievements, track stats
- Daily Challenge with a deterministic, seed-based board that is the same for
  everyone each day
- Hints and a one-time shuffle to unstick difficult boards
- Settings for sound/music, default difficulty, theme, and text size
- Progress persisted locally (coins, statistics, achievements, settings)
- Confetti and celebratory results screen on a win

## Tech Stack

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) / React Native 0.86 / React 19
- TypeScript (strict mode)
- `react-native-reanimated` 4 for animations
- `react-native-svg` for the timer ring and coin icon
- `expo-audio` for sound effects and background music
- `@react-native-async-storage/async-storage` for persistence
- `vitest` for unit tests

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- For a device or simulator: the [Expo Go](https://expo.dev/go) app, or
  Android Studio / Xcode for native builds

### Install dependencies

```bash
npm install
```

### Run the app

```bash
# Start the Expo development server
npm start
```

Then pick a platform:

```bash
# Web
npm run web

# iOS (requires macOS / Xcode or Expo Go)
npm run ios

# Android (requires Android Studio/emulator or Expo Go)
npm run android
```

With `npm start` running, scan the QR code with Expo Go to open the app on a
physical device, or press `w` to open the web version in a browser.

## How to Play

1. Tap **Play** to start a classic round (uses your default difficulty and theme)
   or **Daily Challenge** for today's seeded Expert board.
2. During the 3-second memorize phase, every card is shown face-up. Study the
   board.
3. When play begins, tap a card to flip it. Find its matching pair to keep both
   cards face-up.
4. A mismatch flips both cards back, costs you points, and adds a mistake.
5. Clear every pair before the timer runs out (Easy has no timer) to win.

### Gameplay aids

- **Hint** (3 per game): reveals all remaining cards briefly.
- **Shuffle** (1 per game): rearranges the remaining unmatched cards.

## Scoring, Coins & Stars

- Matching a pair awards 20 points, plus a 10-point combo bonus for every
  consecutive match in a row (streak).
- A wrong match subtracts 2 points (never below zero).
- Clearing the board adds a 100-point level-complete bonus.
- **Stars**: 3 stars for a flawless round, 2 for one mistake, 1 otherwise.
  On timed difficulties, slow rounds are capped to fewer stars.
- **Coins**: awarded only on wins. Each difficulty has a base coin reward plus a
  star bonus (10/25/50 for 1/2/3 stars). Completing the Daily Challenge adds a
  50-coin daily bonus.

## Daily Challenge

The Daily Challenge is always an Expert board (12 pairs). The card layout is
derived from a hash of today's date, so every player sees the identical board
and theme each day, making results comparable. A new challenge unlocks daily
and can only be completed once per day.

## Settings

- **Sound Effects / Music**: toggle audio independently.
- **Difficulty**: sets the default board used by the Play button.
- **Theme**: picks the card theme, or `Random` for a surprise each round.
- **Text Size**: small / medium / large scaling for all UI text.
- **Reset Progress**: clears coins, statistics, and achievements. On native it
  shows a native confirmation dialog; on web it uses the browser confirm dialog.

## Project Structure

```
App.tsx                  Root providers and screen navigation
src/
  components/            Reusable UI (cards, buttons, timer, coins, confetti...)
  config/gameConfig.ts   Difficulties, themes, and scoring constants
  context/               Settings and sound providers
  hooks/                 Game reducer hook and timer hook
  screens/               Home, Game, Result, Achievements, Settings
  theme/colors.ts        Shared color palette
  utils/                 Shuffle, scoring, storage, stats, achievements, daily
  __tests__/             Unit tests
assets/
  sounds/                Generated WAV sound effects and music
scripts/generate-sounds.js
```

## Scripts

```bash
npm start
npm run web
npm run ios
npm run android
npm run typecheck
npm test
npm run sounds
```

## Testing

The test suite covers the game reducer (flip/match/mismatch/hint/shuffle logic),
shuffle determinism, scoring math, and statistics tracking:

```bash
npm test
```

## Building APK and iOS Build Files

There are two ways to produce installable app files: **EAS Build** in the cloud
(recommended, no local native toolchain needed) or a **local native build**.

### Prerequisites

- **Android APK**: no Apple credentials required. A release build is signed
  with a keystore and can be installed on any Android device directly.
- **iOS .ipa**: requires a paid Apple Developer account. A signed `.ipa` only
  installs on devices that are part of the provisioning profile (or are
  distributed via TestFlight / an Enterprise or MDM system). An unsigned `.ipa`
  cannot be sideloaded onto a physical iPhone.

### Option A — EAS Build (cloud)

1. Install the EAS CLI and log in with your Expo account:

```bash
npm install -g eas-cli
eas login
```

2. The repository already includes an `eas.json` with three profiles:

| Profile      | Android output              | iOS output                              |
| ------------ | --------------------------- | --------------------------------------- |
| `development`| development build           | development client                      |
| `preview`    | signed **APK**              | unsigned simulator `.ipa`               |
| `production` | **AAB** (Google Play)       | signed `.ipa` (App Store / TestFlight)  |

3. Build an Android APK (installable, ready to upload to your server):

```bash
eas build --platform android --profile preview
```

When the build finishes, EAS prints a download link. Download the APK and
upload it wherever you want to host it.

4. Build an Android app bundle for the Google Play Store:

```bash
eas build --platform android --profile production
```

This produces a `.aab` file to upload to the Play Console.

5. Build an iOS `.ipa` for the App Store / TestFlight:

```bash
eas build --platform ios --profile production
```

EAS creates and manages the signing certificate and provisioning profile for
you. Once the build is ready, submit it with:

```bash
eas submit --platform ios
```

For a quick unsigned iOS build that only runs in the Simulator:

```bash
eas build --platform ios --profile preview
```

### Option B — Local builds

Generate the native projects first (required once before any local native
build):

```bash
npx expo prebuild
```

**Android** (requires Android Studio / the Android SDK):

```bash
npx expo run:android --variant release
```

or, from the `android/` directory:

```bash
./gradlew assembleRelease
```

The APK is written to
`android/app/build/outputs/apk/release/app-release.apk`, signed with the
keystore configured in `android/app/build.gradle`.

**iOS** (requires macOS and Xcode):

```bash
npx expo run:ios --configuration Release
```

Then open `ios/*.xcworkspace` in Xcode, choose **Product > Archive**, and use
**Distribute App** to export a signed `.ipa` (ad-hoc, TestFlight, or App Store
depending on your distribution certificate and provisioning profile).

### Uploading the build to a server

- **Android**: upload the `.apk` (or `.aab`) to any static host (S3, a VPS,
  object storage, etc.) and share the download link. Users install the APK
  directly from the link.
- **iOS**: a `.ipa` cannot be installed by opening a link on an iPhone. It must
  be distributed through TestFlight, an Enterprise/MDM deployment, or an ad-hoc
  build signed against the provisioning profile that includes the target
  device's UDID.

## Customization

Difficulty levels, themes, and every scoring constant live in
`src/config/gameConfig.ts`. To add a theme, add an entry to `THEMES` and a key
to the `ThemeKey` union in `src/types/game.ts`. To change rewards, edit
`SCORING` and the difficulty `baseCoins` values. The sound effects are
generated by `scripts/generate-sounds.js`.

## License

MIT — see [LICENSE](LICENSE).
