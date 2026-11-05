# AGENTS.md

## Repository summary

SYNQ is Shawn's offline music player for iOS: people import their own audio
files and play them, with playlists, artists, albums, and a queue. 3.0 is
free, with no ads. It is on the App Store as `com.directedbyshawn.synq`, live
version 2.5.2. This repository is the 3.0 rewrite: an Expo app
(`apps/mobile`), a native playback module (`packages/audio`), and the
library database with the 2.5.2 importer (`packages/db`). The plan of
record is [docs/rewrite.md](docs/rewrite.md); read it before asking design
questions, and treat its decisions as settled.

The tooling, checks, workflow, and skills come from Shawn's app Vera
(`~/dev/vera`). When something here is unclear, Vera's equivalent is the
reference; never edit Vera from this repository.

## iOS only

SYNQ has only ever shipped on iOS, and 3.0 is iOS only. Don't write Android
code, `.android.tsx` files, or Android config. Keep native modules'
JavaScript API platform-neutral so Android can be added later.

## The 2.5.2 data invariant

**Every 2.5.2 user's library survives the update untouched**: songs and
their files, artwork, artists, albums, track numbers, playlists and their
order, Liked Songs (renamed or not), theme, app icon, haptics, and shuffle and
repeat. This is the one hard constraint on 3.0.

- Audio and artwork stay where 2.5.2 put them under `Documents/`, stored
  as paths relative to `Documents/`. Never move, rename, or delete them.
- The 2.5.2 database (`Documents/SQLite/synq.db`) and AsyncStorage are read
  once, read-only, by the importer in `packages/db`, in one transaction.
  A failure rolls back and retries on the next launch; the app never shows
  an empty library instead.
- Alternate app icon names (`icon-blue`, `icon-mint`, ...) never change:
  iOS remembers the choice by name (`apps/mobile/assets/icons/README.md`).
- Anything that touches stored data says how a 2.5.2 install upgrades
  through it, in its PR, with a test. See docs/rewrite.md → Data.
- One exception, Shawn's call (November 2026): a song is on one album. A
  2.5.2 song on several keeps one, the first with a cover, else the first
  (docs/rewrite.md → One album per song).

## Project knowledge

Record decisions, plans, and durable context as Markdown in this repository
(`docs/`, package READMEs). Do not use external memory or task CLIs (such
as UAV) or Claude Code auto memory for this project.

## Feature workflow

Shawn starts each feature or fix in its own T3 Code worktree and thread
(`t3.json` runs `scripts/worktree-setup.sh` on creation). Follow the
`synq-feature` skill. In short:

- Work only in the worktree and branch you were given. T3 names the branch;
  do not rename it.
- Verify in this worktree's own simulator (`scripts/sim.sh`), never another
  worktree's or a shared one. Load the `synq-simulator` skill before any
  simulator use: simulators start only through `scripts/sim.sh`, which
  waits in the machine-wide queue SYNQ shares with Vera (up to three
  devices at once, and a boot never overlaps a performance measurement).
  Open a device in T3's Device panel (`device_open`) at most once, and
  close it (`device_close`) before `scripts/sim.sh down`. Shut the device
  down as soon as you have your evidence, and always before you end your
  turn; never leave simulators running. A Stop hook sends you back if one
  is still up, and the queue deletes devices left idle for 30 minutes.
- Native builds (`xcodebuild`, `expo prebuild` and a build, EAS local
  builds) run under the heavy-work lock SYNQ and Vera share:
  `scripts/bench/with-lock.sh <command>`. `scripts/sim.sh` and
  `scripts/phone.sh` take it around their own builds.
- UI changes need screenshots (before and after where something changed);
  motion and gestures need a video. Upload with `scripts/evidence.sh` and
  put them in the PR description. Never commit PR assets.
- Keep each pull request to one coherent change, with a description
  covering the summary, the evidence, and the validation that was run.
  PRs target `main`.
- Open the PR, review your own diff, wait for CI to pass, start the dev
  server (`scripts/phone.sh up`), then tell Shawn it is ready to test and
  **stop**. Shawn tests every change on his phone before it merges, and
  you refine it on the branch until he's happy.
- Merge only after Shawn approves that PR in the thread ("merge it", "ship
  it", "approved"), following the `merge` skill. Approval of one PR is not
  approval of another.
- Never commit directly to `main`. Do not leave work
  uncommitted between sessions; push it and note its state in the PR.

## Releases

Follow the `synq-release` skill and [docs/releasing.md](docs/releasing.md).
Don't release anything (store builds, `eas update`, submissions) unless Shawn
asks for that step by name.

Over-the-air updates reach only binaries with the same runtime version
(`RUNTIME_VERSION` in `apps/mobile/app.config.ts`); raise it only when the
JavaScript needs native code older binaries lack. Build numbers continue above
99 (EAS keeps them, `appVersionSource: remote`). Store builds use release Xcode
(`/Applications/Xcode-27.app`).

## Phone builds

Shawn's phone has two SYNQ apps side by side: **SYNQ** (the App Store,
production) and **SYNQ Dev** (`com.directedbyshawn.synq.dev`, amber icon).
Every development binary is SYNQ Dev. See
[apps/mobile/README.md](apps/mobile/README.md#synq-dev).

- When your worktree's work is ready to test, run `scripts/phone.sh up` in
  it. One Metro serves the Mac's Wi-Fi address and, through a Tailscale
  proxy, his tailnet. It prints a block to send him as it is, first in your
  message, every time: the **open links** as a Markdown list (one tap opens
  SYNQ Dev on this worktree's server), then each server address in its own
  code block. Keep the links as list items in `[label](url)` form, never in
  backticks, never bare, never the `synq-dev://` URL.
- **Native builds only when native code changed.** `phone.sh up` compares
  the worktree's native fingerprint with main's. A worktree that changed
  native code gets its own dev client (built once, about 15 minutes, and
  cached); he installs it from the install link, and `phone.sh down` prints
  main's install link to put main's back. Tell Shawn when he has to install
  something; otherwise he only taps the open link.
- Keep it up until the PR merges or Shawn drops the work, then
  `scripts/phone.sh down`. A server the phone hasn't loaded from in 24
  hours stops on its own.

## Required validation after changes

At the end of every run, run these in order:

1. `pnpm run lint`
2. `pnpm run typecheck`
3. `pnpm run test`
4. `pnpm run react-doctor --base origin/<PR base>` when the app changed

If all succeed, run `pnpm run format:fix`, then summarize the changes.

Lint enforces the React rules: the React Compiler handles memoization (no
`useMemo`, `useCallback`, or `memo`; `pnpm test` also checks every file
compiles under it); the library is read through TanStack Query
(`useSuspenseQuery` with `select`), never in an effect; `useContext` is
banned in favor of stores with selectors; and `useEffect` is banned except
with an `eslint-disable-next-line` comment saying why nothing else works.
Animations never animate layout (`synq/no-layout-animation`). CI also
exports the iOS bundle, reports Reassure render timings, and labels PRs
that change native code ("📱 Native Change"), since those reach people only
in a store build. Every PR says "Native change: no", "yes, compatible", or
"yes, new runtime" in its release notes, and CI checks it. Keep native
features optional: the native side reports what it supports and the
JavaScript checks, so a native change rarely needs a new runtime.

Two more rules, also enforced by lint:

- **User actions respond instantly.** A tap shows its result right away.
  Writes to the library are local but still asynchronous: give the
  mutation an `onMutate` that updates the query data it affects (rolled
  back in `onError`), then close the sheet or navigate immediately. When
  the app creates something, it makes the ID itself and passes it along.
  Don't `await mutateAsync` before responding or disable a control while
  `isPending`. Report a failure with `.catch(() => Alert.alert(...))`. Use
  a ref, not `isPending`, to stop a double submit.
- **Search is debounced and never flickers.** Every search goes through
  `useSearchText` and `useSearchQuery`
  (`apps/mobile/src/features/search/use-search-query.ts`): the query waits
  for typing to pause, and the previous results stay up until the next ones
  arrive. Lint flags a call to a `search*` function, or a `queryKey`
  carrying search text, anywhere else.

**No explanation text under self-explanatory UI.** Don't add footers,
captions, or hint text that explain an option, button, or field whose
label already says what it does. Add one only when Shawn asks for it.
