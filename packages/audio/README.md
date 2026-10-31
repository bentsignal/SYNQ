# @synq/audio

SYNQ's playback engine: an Expo native module (iOS) that owns the queue and
plays it with `AVQueuePlayer`. Track changes, the lock screen, Control
Center, headphone buttons, interruptions, and the free tier's interstitial all
work natively, with no JavaScript in the loop. JavaScript owns policy: what
to queue, the shuffle order, persistence.

See "Playback" in `docs/rewrite.md` for the plan this implements.

## API

```ts
import * as Audio from "@synq/audio";

type Track = {
  id: string;
  url: string; // absolute file:// URL (an absolute path also works)
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string; // absolute file:// URL, shown on the lock screen
  durationMs?: number; // used until the file reports its own duration
};

setQueue(tracks: Track[], options?: { startIndex?: number; positionMs?: number; play?: boolean }): Promise<void>
insert(tracks: Track[], index?: number): Promise<void> // default: the end
remove(indices: number[]): Promise<void>
move(from: number, to: number): Promise<void>
play(): Promise<void>
pause(): Promise<void>
toggle(): Promise<void>
seekTo(positionMs: number): Promise<boolean>
next(): Promise<boolean>
previous(): Promise<boolean>
skipTo(index: number): Promise<boolean>
setRepeatMode(mode: "off" | "all" | "one"): Promise<void>
configureInterstitial(config: { track: Track; afterListeningMs: number; listenedMs?: number } | null): Promise<void>
getState(): Promise<PlaybackState>
getQueue(): Promise<{ tracks: Track[]; index: number | null }>
addListener(event, listener): { remove(): void }

// React (useSyncExternalStore; no effects)
usePlaybackState(): PlaybackState
useProgress(): { positionMs: number; durationMs: number }

// The system AirPlay button (AVRoutePickerView); give it a size.
<RoutePickerButton color={muted} activeColor={accent} style={{ width: 36, height: 36 }} />
```

All durations and positions are milliseconds. The functions that can be
refused resolve `false` when nothing happened: `next` at the end of the queue
with repeat off (2.5.2 played an error haptic there), and `next`, `previous`,
`skipTo`, `seekTo` while the interstitial plays.

```ts
type PlaybackState = {
  status: "idle" | "loading" | "playing" | "paused" | "ended" | "error";
  index: number | null; // current entry; during the interstitial, the entry after it
  trackId: string | null; // what's audible (the interstitial's id while it plays)
  positionMs: number;
  durationMs: number;
  repeatMode: "off" | "all" | "one";
  queueLength: number;
  interstitial: boolean;
  listenedMs: number; // counted toward the interstitial; persist it
};
```

### Events

| Event               | Payload                             | When                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`             | `PlaybackState`                     | status, index, track, repeat mode, queue length, or interstitial changed                                                                                                                                             |
| `progress`          | `{ positionMs, durationMs }`        | about twice a second while playing, plus seeks and track changes; **only produced while it has a listener**                                                                                                          |
| `queue`             | `{ length, index }`                 | after any queue change (call `getQueue()` for the tracks)                                                                                                                                                            |
| `error`             | `{ code, message, trackId, index }` | a file is missing (`file-missing`), can't be decoded (`load-failed`), fails mid-play (`playback-failed`), the interstitial can't play (`interstitial-failed`), or the audio session can't activate (`audio-session`) |
| `interstitialStart` | `{}`                                | the interstitial started                                                                                                                                                                                             |
| `interstitialEnd`   | `{ listenedMs: 0 }`                 | it ended (or was stopped); the counter is back to 0                                                                                                                                                                  |

## Behavior

- **Gapless, native auto-advance.** The item after the current one is
  always enqueued in the `AVQueuePlayer`, so it is buffered before the
  current one ends and the player moves into it by itself. The engine then
  enqueues the next one. Nothing waits on JavaScript, so this works with the
  app backgrounded.
- **Repeat.** `off` stops at the end (status `ended`; `play()` restarts the
  last track). `all` wraps. `one` loops the track gaplessly (a fresh item of
  the same file is preloaded); explicit `next` still moves on and wraps.
- **Previous** restarts the track once 3 s have played, or on the first
  entry; otherwise it goes to the previous entry (no wrap), as in 2.5.2.
  `next`, `previous` to another track, and `skipTo` start playback.
- **Queue edits** (`insert`, `remove`, `move`) never interrupt the current
  item; the preloaded item is recomputed. Removing the current entry moves
  to the entry that took its place, keeping the play state.
- **Replacing the queue** keeps the current item playing seamlessly when the
  track at `startIndex` has the same id (shuffle on/off, a new sort). It
  doesn't seek unless `positionMs` is given and keeps the play state unless
  `play` is given. Otherwise the new track loads at `positionMs` and plays
  unless `play: false`.
- **Failures.** A missing file is caught before an item is created; a file
  AVFoundation can't decode fails via the item's status. Either way an
  `error` event is sent and playback moves past it. A failure found while
  preloading is reported then, and the entry is skipped. A failed entry
  isn't retried until the queue is replaced or it's chosen with `skipTo`. If
  nothing can play, the status is `error`.
- **Interstitial (the free tier's ad).** Native counts listening time while
  queue tracks are audible (not while paused, loading, or during the
  interstitial). Once the count reaches `afterListeningMs`, the interstitial
  is preloaded in place of the next track, and the next transition plays it
  first: a track ending, `next`, `previous` to another track, `skipTo`, a
  new queue that starts playing, or `play()` after the queue ended. Then
  playback continues where that transition was going. During it, `next`,
  `previous`, `skipTo`, and `seekTo` are refused, and the lock screen's
  next/previous/scrubbing are disabled. Pause and play work. Queue edits and
  `setQueue` change what plays after it. At the end of the queue (repeat
  off) nothing follows, so it isn't played and stays due.
  `configureInterstitial(null)` (the user went Premium) stops it at once and
  continues. Restoring with `setQueue(..., { play: false })` doesn't trigger
  it.
- **System.** The audio session is `.playback`, activated on play.
  Interruptions pause, and playback resumes when iOS says `shouldResume` and
  it was playing. Losing the output route (`oldDeviceUnavailable`, e.g.
  headphones unplugged) pauses, and the status shows it. A media services
  reset rebuilds the player and reloads the current item where it was,
  paused. Now Playing is updated on item change, play/pause, seek, and
  stalls, never on a timer. Artwork is decoded off the main thread
  (downsampled to 1024 px) and only the current item's is kept. Remote
  play, pause, toggle, next, previous, and change position are handled
  natively; interval skips are disabled.

## What the app must do

1. Add the plugin to the app config: `plugins: ["@synq/audio"]` (adds
   `UIBackgroundModes: audio`).
2. **Persist the session**: the queue's song ids, `index`, `positionMs`,
   repeat mode, and `listenedMs`. A `state` event fires on every pause,
   track change, and interstitial change, which is when to write. Also write
   `getState()` when the app goes to the background.
3. **Restore on launch** with `setQueue(tracks, { startIndex, positionMs, play: false })`
   and `setRepeatMode(...)`. Nothing plays and no interstitial starts until
   the user presses play.
4. **Free users**: at launch, call
   `configureInterstitial({ track: ad, afterListeningMs: 600_000, listenedMs: persisted })`
   with the bundled ad as a `Track` (resolve the asset to a local file URL,
   e.g. with `expo-asset`; 2.5.2 titled it "Premium Ad" by "SYNQ").
   **Premium**: `configureInterstitial(null)`, including the moment a
   purchase completes. Show the "Listen ad-free" UI while
   `state.interstitial` is true.
5. **Shuffle** is the app's: compute the order and `setQueue` it with
   `startIndex` at the current track, so it keeps playing.
6. Resolve paths relative to `Documents/` at runtime (the container path
   changes across updates) into absolute `file://` URLs before queueing.
7. Show `error` events (2.5.2 showed "Unable to play …").
8. Subscribe to `progress` (or `useProgress()`) only on screens that show
   the position; the native time observer runs only while there is a
   listener.

## Threading

Every engine method, AVFoundation callback, and timer runs on the main
queue:

- JS calls are `AsyncFunction(...).runOnQueue(.main)` and enter the engine
  through `MainActor.assumeIsolated`, which checks the thread at runtime.
  Nothing is a synchronous JS-thread function, and the engine has no state
  outside the main actor.
- KVO, `NotificationCenter`, seek completions, and the audio session's
  notifications hop to the main queue with `DispatchQueue.main.async`
  before touching state. They are never handled re-entrantly inside a
  player call, and every handler checks it is still about the current item
  (`slot === current`) before acting.
- The periodic time observer is delivered on `.main`. Remote command
  handlers run on the main thread (and `sync` onto it if MediaPlayer ever
  calls from elsewhere).
- Only artwork decoding runs off the main thread; its result is applied on
  main and dropped if the item changed meanwhile.

The engine is `@MainActor` and compiles in Swift 6 language mode with
complete concurrency checking (`swift build`). Callbacks handed to system
frameworks are `@Sendable` closures, so they're never inferred main-actor
isolated and trapped when called off main.

## Design

```
ios/
  Engine/                 plain Swift (AVFoundation + MediaPlayer), no Expo
    AudioEngine.swift     the engine: queue, transitions, preload, interstitial, state
    PlaybackQueue.swift   value type: entries with stable keys, next/previous rules
    Slot.swift            one AVPlayerItem + its scoped KVO and end/failure observers
    ListeningCounter.swift
    NowPlaying.swift      MPNowPlayingInfoCenter + off-main artwork loading
    RemoteCommands.swift  MPRemoteCommandCenter
    AudioSession.swift    AVAudioSession (iOS only)
    MainThread.swift
  Module/SynqAudioModule.swift   Expo glue: argument conversion, events
  Module/RoutePickerView.swift   the AirPlay button (an Expo view)
  Tests/SynqAudioEngineTests/    XCTest, real audio through AVQueuePlayer on macOS
  SynqAudio.podspec
Package.swift             SwiftPM package for Engine/ + tests
src/                      TypeScript API, hooks, snapshot store (+ node tests)
app.plugin.js             UIBackgroundModes: audio
```

- **Entries, not tracks.** The queue is a list of entries with stable keys,
  so the same song can appear twice and edits never confuse "which item is
  playing". The engine keeps `currentKey` (the entry playback is on) and at
  most two `Slot`s in the player: `current` and `upcoming`.
- **Preload invariant.** After every change (current item, queue edit,
  repeat mode, interstitial due or configured, a failure),
  `refreshUpcoming()` computes what should follow the current item and
  makes the player's second item exactly that, replacing it if needed.
  When the current item ends, AVQueuePlayer has already moved into
  `upcoming` and the engine adopts it. A requested jump to the preloaded
  entry uses `advanceToNextItem()`; any other jump loads a fresh item.
- **End and failure observers are per item** (`object: item`), and
  `AVPlayerItem.status` and `AVPlayer.timeControlStatus` are observed with
  KVO. Status is derived from those, not stored. When the player is paused
  by something other than the engine, the engine follows it, so the next
  toggle plays.
- **Starting at a position** holds playback until the seek lands, so the
  first moments of the track are never heard.
- **The interstitial** is just another kind of slot (`.interstitial`).
  `currentKey` points at the entry that plays after it, so queue edits
  during it need no special cases. The listening counter runs only while a
  queue entry is audible, and a one-shot main-queue timer fires when it
  crosses the threshold, which swaps the preload for the interstitial.

## Development

```sh
pnpm --filter @synq/audio test         # TS store tests (node --test)
pnpm --filter @synq/audio typecheck
cd packages/audio && swift test        # engine tests on macOS: ~50 s, plays silent files
```

`swift test` writes short silent AAC files with `AVAudioFile` and plays them
for real through `AVQueuePlayer` at volume 0. If the Mac's default output is
an external interface that's asleep or wedged, AVFoundation blocks the main
thread inside CoreAudio (`afplay` hangs too). Route the tests elsewhere:

```sh
SYNQ_AUDIO_TEST_OUTPUT=BuiltInSpeakerDevice swift test
```

`.build/` is gitignored; if Metro ever crawls it, add it to the app's
`resolver.blockList`.
