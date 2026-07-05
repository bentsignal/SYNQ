---
name: synq-expo-build
description: Use for SYNQ Expo React Native app build, install, and testing work, including EAS CLI builds, Expo dev clients, iOS Simulator testing, physical iPhone installs, native audio validation, provisioning/signing through EAS, and avoiding edits to generated app native folders.
---

# SYNQ Expo Build

## Core Rule

`apps/new` is an Expo-managed React Native app. Build and install it through Expo and EAS.

Do not edit `apps/new/ios` or `apps/new/android` as source. Treat those folders as generated artifacts for inspection, diagnostics, and temporary local build output only. If native app behavior needs to change, use Expo config, config plugins, EAS configuration, or package source.

`packages/native-audio/ios` and `packages/native-audio/android` are package source and may be edited for the modular native audio package.

## App Facts

- New app directory: `apps/new`
- Expo config: `apps/new/app.json`
- App slug: `synq-new`
- iOS bundle id: `com.directedbyshawn.synq-new`
- Android package: `com.directedbyshawn.synqnew`
- Scheme: `synq-new`
- Existing old-app EAS reference: `apps/old/eas.json`

## Standard Checks

Run from the repo root before or after meaningful build-facing changes:

```bash
pnpm --filter @synq/new typecheck
pnpm --filter @synq/native-audio build
CI=1 pnpm --filter @synq/native-audio test --runInBand
```

## EAS Setup

If `apps/new/eas.json` is missing, create one for the new app before building. Use `apps/old/eas.json` as the local profile pattern, but keep app-specific values in `apps/new/app.json`.

Useful profiles for this repo should include:

- `development-client-simulator`: iOS simulator development client.
- `development-client`: physical iPhone/internal development client.
- `development` or `production`: only when the user explicitly wants those distribution modes.

## Simulator Build

Use EAS for build validation:

```bash
cd apps/new
pnpm exec eas build --platform ios --profile development-client-simulator
```

Use local Expo only for JS iteration against an installed development client:

```bash
cd apps/new
pnpm exec expo start --dev-client --host lan --clear
```

## Physical iPhone Install

Confirm the paired device:

```bash
xcrun devicectl list devices
```

Build a device `.ipa` with EAS:

```bash
cd apps/new
pnpm exec eas build --platform ios --profile development-client
```

Download the EAS artifact if needed, then install the `.ipa`:

```bash
xcrun devicectl device install app --device <device-uuid> <path-to-ipa>
```

If signing/provisioning fails, fix EAS credentials or profiles. Do not patch `apps/new/ios` signing settings as the solution.

## Reporting

Always report the EAS profile used, artifact type (`.ipa` or simulator build), device id when installing, and any EAS signing/provisioning blocker exactly.
