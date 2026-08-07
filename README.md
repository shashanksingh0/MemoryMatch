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
npm start        # Start the Expo dev server
npm run web      # Start for web
npm run ios      # Start for iOS
npm run android  # Start for Android
npm run typecheck # Type-check the codebase (tsc --noEmit)
npm test         # Run the unit test suite (vitest)
npm run sounds   # Regenerate the sound effect WAV files
```

## Testing

The test suite covers the game reducer (flip/match/mismatch/hint/shuffle logic),
shuffle determinism, scoring math, and statistics tracking:

```bash
npm test
```

## Customization

Difficulty levels, themes, and every scoring constant live in
`src/config/gameConfig.ts`. To add a theme, add an entry to `THEMES` and a key
to the `ThemeKey` union in `src/types/game.ts`. To change rewards, edit
`SCORING` and the difficulty `baseCoins` values. The sound effects are
generated by `scripts/generate-sounds.js`.

## License

MIT — see [LICENSE](LICENSE).
