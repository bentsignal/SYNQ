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
- `marquee-text.tsx`: one line that scrolls to show the rest when it doesn't
  fit, on the UI thread, in the player and the mini player.
- `player-screen.tsx` (route `/player`, a modal sheet): backdrop, artwork
  (eases to 85% when paused), title, like and
  menu, `scrubber.tsx`, `player-controls.tsx` (transport, shuffle, repeat,
  AirPlay via `RoutePickerButton`, queue).
- `queue-screen.tsx` (route `/queue`, a form sheet) and `queue-list.tsx`.

## Reordering the queue

Up Next is drawn by hand, because the queue can be every song in the library.
A SwiftUI `List` builds a view tree for every row it's given (about 15 seconds
to open 3,000 songs), and it only offers a drag after a long press unless the
whole list is in edit mode.

- **A small pool of rows** stays mounted around the screen. `assignSlots`
  (`queue-layout.ts`) keeps a key in its row and gives keys scrolling in the
  rows of keys that left, so a reorder rebuilds nothing.
- **The UI thread places rows.** Each row reads its index from the `positions`
  shared value and moves with a transform. While dragging, rows only run when
  the hovered slot changes, and nothing runs in JavaScript per frame. Rows hold
  no position of their own, only the rest of a slide, so a recycled row can't
  end up in the wrong slot.
- **The dragged row is a floating copy** above the list, so it survives its
  own row being recycled when the list auto-scrolls far away.
- **A drop can't flicker.** JavaScript commits the move, then one UI-thread
  call swaps in the new `positions` as it clears the drag. Row content never
  depends on an index, so no frame shows the old order.
- **A drop goes by key** (`moveInUpNext`), so a song ending mid-drag can't
  move the wrong entry. If the dragged entry started playing, the drag ends
  and nothing moves.
- **Native gets the same move.** `Audio.move` keeps the current item playing
  and preloads again only if what's next changed, which keeps the handoff
  gapless; `persist()` saves the new order.
- **Auto-scroll tops out at 30 rows a second** (`MAX_AUTOSCROLL`). Remounting
  rows faster than that drops frames, in native mounting rather than JavaScript.

One pan on the list handles every row: a touch on the handle's side picks up
the row at once, and a swipe left anywhere else opens or deletes it. The
screen-reader actions on each row are Move Up, Move Down, and Remove.

`synqDev.player.drag(index, toY, ms, holdMs)` runs a drag from the UI thread
for `scripts/sim.sh frames`. Touches injected into a simulator stall frames on
their own (a plain scroll drops about as many), so they can't measure the list.

## Development

`synqDev.player` (`features/dev/player-automation.ts`) drives all of this
from `scripts/sim.sh eval`. For songs to play, push the sample library and
import it:

```sh
apps/mobile/dev/player-sample/push.sh
scripts/sim.sh eval "synqDev.player.seed()"        # or seed(300) for a long library
scripts/sim.sh eval "synqDev.player.play([1,2,3,4,5])"
```
