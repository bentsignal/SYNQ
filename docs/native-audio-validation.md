# Native Audio Validation

## Automated checks

- `pnpm --filter @synq/native-audio build`
- `CI=1 pnpm --filter @synq/native-audio test --runInBand`
- `pnpm --filter @synq/new typecheck`
- `apps/new`: `xcodebuild -workspace ios/SYNQNew.xcworkspace -configuration Debug -scheme SYNQNew -destination id=00022C64-9209-4747-81D4-0809A377C253 COCOAPODS_PARALLEL_CODE_SIGN=true COMPILER_INDEX_STORE_ENABLE=NO`
- `apps/new/android`: `./gradlew :app:assembleDebug`
- `apps/new`: `pnpm exec expo run:ios --no-bundler`

## Simulator smoke checks

- iOS build installs and opens on iPhone 16 Pro with the New Architecture enabled.
- `@synq/native-audio` autolinks into the app on iOS and Android.
- The active app playback adapter uses the package-backed native runtime for library, ad, pause, resume, seek, stop, restore, and status listener commands.
- App policy remains outside the package: ad gate, premium behavior, queue reducers, persistence, and UI state are still owned by `apps/new`.

## Device/manual checks still required

- iOS local file playback through the app UI, including queue transitions and ad break resume.
- iOS lock screen and Control Center metadata, play, pause, next, previous, and seek commands.
- iOS interruption handling for calls/Siri and route changes for Bluetooth, headphones, and speaker.
- iOS background playback on a physical device.
- CarPlay command visibility and command mapping.
- Android local file playback through the app UI, including queue transitions and ad break resume.
- Android foreground media notification metadata/actions and notification permission behavior on Android 13+.
- Android audio focus, noisy-route handling, Bluetooth/headset route changes, and background playback.
- Android Auto command visibility and command mapping.
