# Publishing Memory Match to Google Play

This guide walks through uploading the release build of Memory Match to the
Google Play Console.

## Build outputs

The signed App Bundle (`.aab`) is produced by the local Gradle build:

```
android/app/build/outputs/bundle/release/app-release.aab
```

It is signed with the upload key in `keystore/` (this folder is git-ignored and
must never be committed). Back up the whole `keystore/` folder somewhere safe —
you need it for every future release:

- `keystore/memorymatch-upload.keystore` — the signing keystore
- `keystore/keystore.properties` — passwords and alias (keep private)
- `keystore/upload_key_cert.pem` — the upload key certificate for Play App Signing

## Rebuilding after changes

```bash
npm install
npx expo prebuild --platform android --no-install
```

The `android/` folder is generated and git-ignored, so after every `expo
prebuild` you must re-apply the release signing block to
`android/app/build.gradle`. Inside `signingConfigs { ... }`, add:

```groovy
release {
    def keystoreProperties = new Properties()
    def keystorePropertiesFile = rootProject.file('../keystore/keystore.properties')
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    }
    storeFile file(keystoreProperties.getProperty('storeFile', '../../keystore/memorymatch-upload.keystore'))
    storePassword keystoreProperties.getProperty('storePassword')
    keyAlias keystoreProperties.getProperty('keyAlias', 'memorymatch')
    keyPassword keystoreProperties.getProperty('keyPassword')
}
```

then set `buildTypes.release` to `signingConfig signingConfigs.release`, and
build:

```bash
cd android
ANDROID_HOME=$ANDROID_HOME ./gradlew bundleRelease
```

The fresh `.aab` lands in `android/app/build/outputs/bundle/release/`.

## Uploading to the Play Console

1. Go to https://play.google.com/console and create an app (or open an
   existing one). Set the application ID exactly to
   `com.memorymatch.game`.

2. **Play App Signing**: open **Setup > App signing**. Choose the option to use
   an existing upload key and upload `keystore/upload_key_cert.pem`. Google
   then accepts `.aab` files signed with your upload key and manages the final
   signing keys for distribution.

3. **Create a release**: open **Release > Production** (or **Internal testing**
   for a staged rollout) and click **Create new release**.

4. Upload `android/app/build/outputs/bundle/release/app-release.aab`.

5. Fill in the **release notes**, e.g.:

   ```
   Initial release of Memory Match - a fun card-flipping memory game with
   classic and daily challenge modes, four themes, coins, and achievements.
   ```

6. Save and review the release, then **Start rollout to Production** (or start
   the internal test track and invite testers first).

## Store listing checklist

Before the app can be approved you must complete these sections in the Play
Console (**Main store listing** and the review dashboard):

- **App name**: Memory Match
- **Short description** (max 80 chars)
- **Full description** (max 4000 chars) - describe gameplay, themes,
  difficulties, daily challenge, coins and achievements
- **App icon** (512x512 PNG) - reuse `assets/icon.png`
- **Feature graphic** (1024x500 PNG)
- **Phone screenshots** (min 320px wide; 2-8 images) and optionally tablet
  screenshots
- **Category**: Game / Puzzle (or Game / Educational)
- **Content rating**: complete the questionnaire (no IAP, no ads, no user
  interaction that affects rating)
- **Target audience and content**: set age range and app access settings
- **Data safety form**: the app stores only local game data (coins, stats,
  achievements, settings) on the device via AsyncStorage; it does not collect
  or share personal data, does not use analytics, and does not require any
  permissions. Select "No data shared" / "Data not collected".

## Notes

- The first release takes a few hours to a few days for review. Updates are
  usually faster.
- Bump `app.json` -> `version` (e.g. 1.0.1) before each release. `versionCode`
  is derived from it and must increase with every upload.
- Do not use `expo prebuild` and then forget the `android/` folder - it is
  git-ignored and regenerated; the keystore is the only thing you must keep.
