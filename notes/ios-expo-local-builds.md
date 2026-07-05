# iOS Expo Local Builds

## Build Workflow

- `apps/new` is Expo-managed. Use local EAS builds for native dev-client binaries unless a remote build is explicitly requested.
- Simulator profile:
  - `cd apps/new`
  - `pnpm exec eas build --local --platform ios --profile development-client-simulator --output ./build/synq-new-development-client-simulator.tar.gz`
- Device profile:
  - `cd apps/new`
  - `pnpm exec eas build --local --platform ios --profile development-client`
- Treat `apps/new/ios` and `apps/new/android` as generated inspection output. Make native app changes through Expo config, config plugins, EAS config, or package native source.

## Local Network And Portless

- iOS dev-client discovery on physical devices needs local network plist keys in `apps/new/app.json`:
  - `NSLocalNetworkUsageDescription`
  - `NSBonjourServices`
  - `NSAppTransportSecurity.NSAllowsLocalNetworking`
- The root `pnpm dev` command starts the Portless proxy and the `@synq/new` Expo dev server. If `synq.mobile.synq.local` is taken, inspect and stop the stale Portless route with `portless list` and `kill <pid>`.

## Xcode 27 Beta Simulator Notes

- The upstream `expo-icon-handler` config plugin created duplicate/malformed alternate-icon Xcode resource entries during simulator builds.
- `apps/new/expo-plugins/with-ios-alternate-icons.cjs` replaces that iOS config behavior with deterministic generated icon files and one Xcode resource entry per icon scale.
- Keep the `expo-icon-handler` package installed for its native/runtime module, but do not use its config plugin for iOS until the upstream duplicate-resource behavior is fixed.

## Native Audio Autolinking

- `@synq/native-audio` autolinks through `expo-module.config.json` and should produce the `SynqNativeAudio` pod plus `SynqNativeAudioModule` in `ExpoModulesProvider.swift`.
- A fresh local EAS simulator build initially produced `Cannot find native module 'SynqNativeAudio'` because the EAS archive omitted `packages/native-audio/ios`.
- Root `.easignore` now ignores generated app native folders explicitly while preserving package native source. A rebuilt simulator artifact contained `SynqNativeAudio` and `SynqNativeAudioModule` symbols in `SYNQNew.debug.dylib`.
