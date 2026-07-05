# SYNQ Agent Instructions

## Expo Build Boundary

`apps/new` is an Expo-managed React Native app. Build, install, and debug it through Expo and EAS.

- Do not edit `apps/new/ios` or `apps/new/android` as source.
- Treat those folders as generated artifacts that Expo/EAS may delete and regenerate.
- Use them only for inspection, logs, diagnostics, or temporary build output.
- If native app behavior must change, use Expo config, config plugins, package source, or EAS configuration.
- `packages/native-audio/ios` and `packages/native-audio/android` are package source and may be edited for the native audio module.

For SYNQ app build/install/test requests, use the local Codex skill `synq-expo-build`.
