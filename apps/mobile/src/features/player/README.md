# Player

JavaScript's half of playback. Native (`@synq/audio`) plays the queue,
moves from song to song, and runs the lock screen, remote commands, and
interruptions on its own. This folder decides what goes in the queue,
mirrors it, saves it, restores it, and draws the player.

## The queue

`queue-model.ts` (pure, node-tested) keeps the queue as entries
`{ key, songId, queued }`. Each entry's `key` (`"12.1a"`) is its native
track id, unique within the queue, so the same song can be queued twice and
"what's playing" is always native's `trackId`, never an index that might
have shifted. Every change in `commands.ts` updates the JavaScript queue
first (the UI shows it on the same frame), then makes the same call
natively, then saves the session. A native call that fails resyncs native
from the JavaScript queue (`native-queue.ts`).

- **Play Next** inserts after the current song and the Play Next songs
  already behind it, so several play in the order they were added (2.5.2's
  `addOffset`). **Add to Queue** appends.
- **Shuffle** is computed here: on, the current song stays first with its
  Play Next run, the rest shuffled; off, the unshuffled order (`original`)
  comes back around the current song. The current entry keeps its key, so
  native keeps playing it without a gap. `playSongs` with `shuffle: true`
  shuffles from a random song; left out, the shuffle setting decides.
- **Repeat** cycles off → all → one; native implements it.
- **Library changes** reach the queue through a library query
  (`["library", "player", "songs"]`, refreshed by every `writeLibrary`):
  deleted songs leave the queue, and new titles or covers go to native for
  the lock screen (`startup.ts`). `forgetSongs` does the first part
  directly.
- Failures (a missing file) are reported once per entry, a burst of them in
  one alert (`errors.ts`); native has already moved past them.

## The session

`session.ts` (pure, node-tested) is the stored shape, in the kv store under
`synq.player.session`: the queue's song ids, which are Play Next entries,
the current index and position, the unshuffled order (as indices), the
source, shuffle, and repeat.
`persistence.ts` writes it on every native `state` event (pause, track
change), when the app leaves the foreground, and every 15 seconds
while playing, and restores it at launch with `setQueue(..., { play: false })`
at the saved position. Songs deleted since are dropped (the position resets
if the current one went).

**From 2.5.2**: when there is no stored session yet, the player takes over
2.5.2's: `takeLegacySettings("session")` (queue, index, position, source,
`addOffset` as Play Next entries), and shuffle and repeat from the import record's preferences.
It writes its own session right away, so they're taken once. 2.5.2's
queue was already in shuffled order and it never kept the unshuffled one,
so turning shuffle off after the update keeps that order.

## Startup

`startup.ts` registers with `store.ts` and runs on the player's first use:
the mini player subscribing (always mounted under the tabs, after the
library is open) or a play action.

## UI

- `mini-player.tsx`: the tab bar's bottom accessory (both placements).
- `player-screen.tsx` (route `/player`, a modal sheet): backdrop, artwork
  (eases to 85% when paused), title, like and
  menu, `scrubber.tsx`, `player-controls.tsx` (transport, shuffle, repeat,
  AirPlay via `RoutePickerButton`, queue).
- `queue-screen.tsx` (route `/queue`, a form sheet): a SwiftUI `List`, with
  drag to reorder and swipe to remove in Up Next.

## Backdrop

People who have taken apart Apple Music's web and Mac players found blurred,
rotating copies of the cover (nobody has published the iOS app's), but a blur
of a black cover with a small red ring is black. SYNQ draws the field from
colors it chooses instead, so the ring carries the backdrop.

- `modules/synq-backdrop` reads a 128 px copy of the cover
  (`ArtworkAnalysis.swift`, off the main thread, once per cover): weighted
  k-means in Oklab, where saturated pixels pull harder, seeded farthest-first
  so a small area gets a cluster of its own. It's deterministic.
- `backdrop-palette.ts` picks five colors from the clusters. Chroma counts
  more than area. A cover with no color at all gets a spread of its own
  tones. Everything is capped at `MAX_LUMINANCE`, and this is JavaScript so
  it's tested (`backdrop-palette.test.ts`) and updates over the air.
- `BackdropView.swift` draws them with a Metal fragment shader
  (`BackdropShader.swift`): each pixel is a normalized blend of the pools, so
  no pixel can be brighter than the brightest color and white text always
  reads. It renders at one pixel per point at 30 fps; a new song blends the
  colors in place (0.9 s), which is a crossfade of the two fields without
  drawing both. No JavaScript runs per frame. It stops off screen, while the
  app is inactive or backgrounded, while something covers the player
  (`animating`), and holds still under Reduce Motion (a song change still
  fades). The shader is compiled from source at run time, off the main thread,
  so the pod needs no Metal resource bundle.
- Binaries without the module keep `GradientBackdrop`, the gradient of the
  cover's average colors (`backdrop-colors.ts`, `ArtworkColors.swift`).

`SynqBackdrop.frameStats()` (`scripts/sim.sh eval
"expo.modules.SynqBackdrop.frameStats()"`) reports frames drawn and what they
cost, to check that it stops when it should.

## Artwork corners

Some covers have rounded corners of their own. New imports crop past
transparent ones (`Covers.swift`); covers already on disk are never rewritten,
so `ArtworkAnalysis` also finds corners already flattened to a color or still
transparent, and the player zooms the art until they're past its clip
(`cornerZoom`). The player is the one place art sits on a light background.

## Development

`synqDev.player` (`features/dev/player-automation.ts`) drives all of this
from `scripts/sim.sh eval`. For songs to play, push the sample library and
import it:

```sh
apps/mobile/dev/player-sample/push.sh
scripts/sim.sh eval "synqDev.player.seed()"        # or seed(300) for a long library
scripts/sim.sh eval "synqDev.player.play([1,2,3,4,5])"
```
