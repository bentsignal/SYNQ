# @synq/mobile

The SYNQ iOS app: Expo SDK 57, React Native 0.86 (New Architecture), Expo
Router with native tabs and native stack headers, `@expo/ui` (SwiftUI) for
controls, SF Symbols, Uniwind for everything else, and the React Compiler.
The plan is [docs/rewrite.md](../../docs/rewrite.md). iOS only.

## Run it

There is no Expo Go build. `ios/` is generated (Continuous Native
Generation) and gitignored.

```sh
pnpm --filter @synq/mobile ios   # build, install, and start Metro
pnpm --filter @synq/mobile dev   # Metro only, for an installed dev build
```

These build and serve SYNQ itself (`com.directedbyshawn.synq`); prefix them
with `APP_VARIANT=development` for SYNQ Dev. Agents use `scripts/sim.sh`
and `scripts/phone.sh` instead, which build and serve SYNQ Dev (below).
Don't edit `package.json` scripts to set it: the native fingerprint hashes
them, so SYNQ's runtime would change.

## SYNQ Dev

`APP_VARIANT=development` (`app.config.ts`) builds **SYNQ Dev**: bundle ID
`com.directedbyshawn.synq.dev`, name "SYNQ Dev", scheme `synq-dev`, and the
amber icon (`assets/icons/synq-dev.png`). It installs next to SYNQ, so
Shawn's phone keeps the App Store app while SYNQ Dev runs the work in
progress. Every development binary is SYNQ Dev (the simulator and phone dev
clients); store builds are SYNQ. Store fingerprints don't depend on the
variant: SYNQ's config is unchanged without `APP_VARIANT`.

- **Simulator:** `scripts/sim.sh` gives each worktree its own simulator and
  Metro port, with a SYNQ Dev Debug build cached per native fingerprint in
  `~/Library/Caches/synq/dev-client-ios`, and navigates through the
  dev-only `globalThis.synqDev` hook (`src/features/dev/automation.ts`)
  over Metro's debugger connection (`scripts/sim-eval.mjs`), because iOS
  asks "Open in SYNQ Dev?" before every `simctl openurl`. `sim.sh up` waits
  in the simulator queue (`scripts/simq.ts`), a verbatim copy of Vera's,
  so SYNQ and Vera worktrees share one daemon
  (`~/Library/Caches/vera/simq`) and one three-device limit. Simulators
  are clones of Vera's template (`~/Library/Caches/vera/ios-template-*`).
  See the `synq-simulator` skill.
- **Phone:** `scripts/phone.sh up` builds the dev client with a local EAS
  `development` build (ad hoc), once per native fingerprint, cached in
  `~/Library/Caches/synq/phone-dev-client-ios`, and uploads it with an
  install page (`scripts/install-page.sh`) to bunny.net: Vera's
  `vera-evidence` storage zone, under `synq/`. It then serves this
  worktree's Metro and prints an open link, an https page
  (`scripts/lib/open-page.html`) that opens
  `synq-dev://expo-development-client/?url=...`, because chat apps only make
  http and https links tappable. The phone has to be on the Mac's Wi-Fi, or
  use the Tailscale link. Main's dev client serves every worktree without
  native changes; until 3.0 merges into `main` there is none, and each
  fingerprint gets its own.

Dev clients are Debug builds: slower, with the dev menu, and no update
channel.

## EAS

Project `@directedbyshawn/synq` (`df86bb9d-1587-48b7-a40e-85a09eee2a72`,
the production project 2.5.2 shipped from). Profiles in `eas.json`:

| Profile                 | App      | Use                                   |
| ----------------------- | -------- | ------------------------------------- |
| `development`           | SYNQ Dev | Phone dev client (`scripts/phone.sh`) |
| `development-simulator` | SYNQ Dev | Dev client for the simulator (EAS)    |
| `internal`              | SYNQ Dev | Update and channel checks             |
| `production`            | SYNQ     | TestFlight and App Store builds       |

Each profile has the update channel of the same name. Version 3.0.0; build
numbers come from EAS (`appVersionSource: remote`) and must continue above
99, where the 3.0.0 TestFlight builds stopped. 2.5.2 kept its build number
in `app.json`, so EAS's remote iOS build number still reads 1 (checked
2026-10-31 with `eas build:version:get -p ios -e production`; App Store
Connect's newest upload is build 77). Before the first store build, set it
once: `eas build:version:set -p ios` with 99, so `autoIncrement` makes 100.
The release process is still to be written (AGENTS.md → Releases).

### Apple credentials

EAS talks to Apple through the App Store Connect API key of Shawn's team,
which owns SYNQ and Vera (`~/.appstoreconnect/vera.env`, team key "Vera
EAS", Admin), so credentials and builds need no Apple ID login. SYNQ's App
Store Connect app is "SYNQ - Offline Music Player" (Apple ID `6624313712`).

```sh
source ~/.appstoreconnect/vera.env   # EXPO_ASC_* and EXPO_APPLE_TEAM_*
expect scripts/eas-credentials.exp development   # SYNQ Dev's ad hoc profile
```

The script registers `com.directedbyshawn.synq.dev` when it's missing and
answers `eas credentials:configure-build`'s prompts; it exits if EAS asks
for an Apple ID instead. Ad hoc builds install only on the devices in the
profile (the team's registered iPhones).

## Layout

- `src/app`: routes. `(tabs)` holds Library (`(library)`), Settings, and
  Search (the search role), each with its own native stack (`TabStack`,
  large titles); the mini player is the tab bar's bottom accessory
  (`src/features/player/mini-player.tsx`). Screens above the tabs (the full
  player, sheets) go in the root stack. Library screens
  (`src/features/library/screens`) are routed in both the Library and the
  Search tab (`search/album/[id].tsx` re-exports the album screen), and
  `openLibraryScreen` pushes onto whichever is in front, so an album opened
  from Search stays in Search.
- `dev/sample-library`: the dev sample library `scripts/sim.sh seed`
  imports (`src/features/dev/seed.ts`), made by its `generate.mjs` with
  ffmpeg.
- `src/features`: screen building blocks grouped by feature. `library` is
  the library's reads, writes, rows, menus, and screens; `editing` its
  edit sheets; `dev` is the automation hook, frame recorder, and seed; `search` the debounced search hooks;
  `app-icon` the alternate icons (`expo-alternate-app-icons`, loaded with
  `requireOptionalNativeModule`).
- `modules/synq-media`: SYNQ's local Expo module (Swift): audio metadata,
  covers, export retagging, backup staging, and the Wi-Fi Transfer server
  (`src/features/media/native.ts`). See docs/rewrite.md → Data.
- `src/features/import`, `export`, `backup`, `settings`, `analytics`:
  Import from Files and Wi-Fi Transfer, Export (`exportSongs`,
  `exportPlaylist`, ...), Backup & Restore, the Settings tab, and `track`
  ([docs/analytics.md](../../docs/analytics.md)).
- `src/components`, `src/lib`: shared components and helpers.
  `lib/query-client.ts` is the one TanStack Query cache the library reads
  through.
- `src/global.css`: the theme tokens (always dark; the accent defaults to
  2.5.2's blue, `#77adf8`).
- `plugins/with-ios-scene-lifecycle.cjs`: adopts the UIScene life cycle
  that the iOS 27 SDK requires. Expo SDK 58 does this in its template;
  remove the plugin when upgrading.
- `plugins/with-alternate-icons.cjs`: the seven 2.5.2 icons as iOS
  alternate icons, under their 2.5.2 names (`assets/icons/README.md`).
- `patches/react-native-screens@4.26.2.patch` (repo root, from Vera): on
  iOS 27, react-native-screens renders Expo Router's `role="search"` tab
  as an ordinary tab. The patch builds the tab bar from `UITab`s and makes
  Search a `UISearchTab`, so it sits apart with the field over the
  keyboard; it compiles only with the iOS 27 SDK (Xcode 27).
  `src/features/search/native-search.ts` focuses the field when the tab is
  selected. Remove it once react-native-screens ships the fix.
- `perf/`: the React Compiler check and Reassure measurements
  ([perf/README.md](perf/README.md)).

## UI rules

- Native first: native tabs and stacks, large titles, `Stack.Toolbar`
  menus, `Stack.SearchBar`, SwiftUI lists and forms, SF Symbols. No PNG
  icons.
- Always dark, one pastel accent used sparingly (docs/rewrite.md → UI
  direction).
- Nothing pops in. Anything that loads shows nothing until it is ready and
  then fades in.
- Liquid Glass never sits under a parent whose opacity is below 1: no fade,
  no `active:opacity-*`. Fade the content inside the glass instead.
