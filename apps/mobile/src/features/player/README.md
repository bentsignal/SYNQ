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

- **After the current song** come the cued songs, then the rest of the list.
  An entry with `queued` set is cued, and the cued run is the unbroken stretch
  of them right after the current song. **Play Next** inserts directly after
  the current song, ahead of anything cued. **Add to Queue** inserts after
  everything cued, ahead of the rest of the list. Every route (the swipe, the
  song menu, the collection menu) goes through these two. Into an empty queue,
  the songs are the list, not cued.
- **Dragging** in Up Next keeps the run unbroken: a drop right after the current
  song or in the run, down to its end, cues the entry, and a drop below it
  returns the entry to the list.
- **Shuffle** is computed here: on, the current song stays first with its
  cued run, the rest shuffled; off, the unshuffled order (`original`) comes
  back around the current song and its run. Cued songs aren't in `original`,
  so one that has played stays behind the current song when shuffle goes off.
  The current entry keeps its key, so native keeps playing it without a gap.
  `playSongs` with `shuffle: true` shuffles from a random song; left out, the
  shuffle setting decides.
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
`synq.player.session`: the queue's song ids, which entries are cued,
the current index and position, the unshuffled order (as indices), the
source, shuffle, and repeat.
`persistence.ts` writes it on every native `state` event (pause, track
change), when the app leaves the foreground, and every 15 seconds
while playing, and restores it at launch with `setQueue(..., { play: false })`
at the saved position. Songs deleted since are dropped (the position resets
if the current one went).

**From 2.5.2**: when there is no stored session yet, the player takes over
2.5.2's: `takeLegacySettings("session")` (queue, index, position, source,
`addOffset` as cued entries), and shuffle and repeat from the import record's preferences.
It writes its own session right away, so they're taken once. 2.5.2's
queue was already in shuffled order and it never kept the unshuffled one,
so turning shuffle off after the update keeps that order.

**From a session saved before cueing covered Add to Queue**: the stored shape
is the same. Its Play Next songs are the cued run. Songs it added with Add to
Queue can't be told from the list, so they stay where they are, at the end. A
flagged entry that isn't in the unbroken run is inert until the run reaches it.

## Startup

`startup.ts` registers with `store.ts` and runs on the player's first use:
the mini player subscribing (always mounted under the tabs, after the
library is open) or a play action.

## UI

- `mini-player.tsx`: the tab bar's bottom accessory (both placements).
- `marquee-text.tsx`: one line that scrolls to show the rest when it doesn't
  fit, on the UI thread, in the player and the mini player. See
  [Marquee](#marquee).
- `icon-button.tsx`: every control in the player and the mini player.
- `player-screen.tsx` (route `/player`, a modal sheet): backdrop, artwork
  (eases to 85% when paused), title, like and
  menu, `scrubber.tsx`, `player-controls.tsx` (transport, shuffle, repeat,
  AirPlay via `RoutePickerButton`, queue), `volume-slider.tsx`. The sizes and
  gaps come from `player-layout.ts`.
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

The list's gestures handle every row: a touch on the handle's side picks up the
row at once; anywhere else, a tap plays the row and a sideways pan swipes it
(`use-queue-swipe.ts`). The screen-reader actions on each row are Play Next,
Add to Queue, Move Up, Move Down, and Delete.

## Swiping and tapping rows

- **The actions are drawn by hand** (`queue-swipe-actions.tsx`), since only a
  `UITableView` or a list `UICollectionView` has iOS's own: 44 pt circles with
  a symbol and no label, so a short swipe shows them all (64 pt left, 118 pt
  right). `swipe-layout.ts` (pure, node-tested) places them every frame:
  growing in as the row opens, the first stretching into a capsule past open,
  and taking the whole space once armed (half the row). Its length changes
  without animating layout: a round end either side of a middle that scales.
- **Let go short of a full swipe, a row opens if it's still moving toward the
  edge**, or if it's past halfway; otherwise it closes.
- **A deleted row's Delete collapses with its gap.** It stays full while the
  row is off screen, then shrinks with the gap as the rows below slide up into
  it, so they never pass over it.
- **One backing and one highlight for the whole list** (`RowUnderlays`), placed
  under whichever row is swiped or touched, so each row mounts with no more
  animated styles than it needs to be placed. A highlight and a backing in
  every row made the queue's sheet take half again as long to open.
- **Taps go through a gesture, not a `Pressable`,** in a race with the swipe
  and the handle's drag, so moving 10 points turns a tap into a scroll or a
  swipe instead of playing the row. Taps on an open row's capsules go through
  the same gesture, by where they land.
- **A new order slides only when a row's action made it.** `useSlideNextOrder`
  marks it; the UI thread then eases rows from `previousPositions` with one
  `orderProgress`, and the moved row fades out, the rest slide, and it fades
  in. Anything else (a tap, a song ending, a drop) is just in place.
- **A new current song can't flicker.** It comes with new React content (the
  header, a row leaving Up Next), and the UI thread placing rows by the new
  order before that content is on screen showed one frame of rows on top of
  each other. So such an order reaches the UI thread a frame later. Until it
  does, a row whose song left keeps its slot (`useHeldRows` in
  `use-queue-window.ts`), so that time shows the old list. Otherwise a row
  scrolling in took the slot and showed, in the old place, another song with
  its cover still loading; on a phone, where playing a song keeps JavaScript
  busy, that lasted several frames.
- **Only a new order reaches the UI thread.** The queue screen renders again
  for other reasons with the same order; handing that over again cut a slide
  short and closed an open row.

`synqDev.player.drag(index, toY, ms, holdMs)` runs a drag from the UI thread
for `scripts/sim.sh frames`. Touches injected into a simulator stall frames on
their own (a plain scroll drops about as many), so they can't measure the list.

## Backdrop

People who have taken apart Apple Music's web and Mac players found blurred,
rotating copies of the cover (nobody has published the iOS app's), but a blur
of a black cover with a small red ring is black. SYNQ draws the field from
colors it chooses instead, so the ring carries the backdrop.

- `modules/synq-backdrop` reads a 128 px copy of the cover
  (`ArtworkAnalysis.swift`, off the main thread, once per cover): weighted
  k-means in Oklab, where saturated pixels pull harder, seeded farthest-first
  so a small area gets a cluster of its own. It's deterministic.
- `backdrop-palette.ts` picks five colors from the clusters, all in one family
  of hues, from a deep ground up to a glow. See [Choosing colors](#choosing-colors).
  A cover with no color at all gets a spread of its own tones. Everything is
  capped at `MAX_LUMINANCE`, and this is JavaScript so it's tested
  (`backdrop-palette.test.ts`) and updates over the air.
- `BackdropView.swift` draws them with a Metal fragment shader
  (`BackdropShader.swift`): each pixel is a normalized blend of the pools, mixed
  in Oklab, so no pixel can be lighter than the lightest color and white text
  always reads. Mixing cancels some chroma where hues differ, and the shader puts
  most of it back. It renders at one pixel per point at 30 fps; a new song blends the
  colors in place (0.9 s), which is a crossfade of the two fields without
  drawing both. No JavaScript runs per frame. It stops off screen, while the
  app is inactive or backgrounded, while something covers the player
  (`animating`), and holds still under Reduce Motion (a song change still
  fades). The shader is compiled from source at run time, off the main thread,
  so the pod needs no Metal resource bundle.
- Binaries without the module keep `GradientBackdrop`, the gradient of the
  cover's average colors (`backdrop-colors.ts`, `ArtworkColors.swift`).

### Choosing colors

An earlier palette let up to four hues lead by chroma and held them all at one
middling lightness. Covers came out clashing and muddy: a logo counted as much as
the art, faint colors were boosted until they weren't in the cover anymore, a dim
yellow is olive, and opposite hues mix to brown. So:

- **One family of hues.** Nearby hues pool their area when choosing the lead, so
  area counts as much as chroma and a line of type can't lead.
- **Lightness does the work.** The family runs from a deep ground to a glow, and
  shadows lean toward violet.
- **A share of what the screen can show.** Chroma is 72% of the most that
  lightness and hue can have, capped at `MAX_CHROMA`, so no hue looks duller than
  another. Testing on a phone settled this: at 100% it looked best overall but
  too strong on some covers.
- **Never olive.** Dim yellows go to amber, and the yellow-greens of grass and
  leaves go to green.

Testing on a phone ruled out a second hue, a grid of the cover's own colors
(closest to what Apple is known to do), a bright top, more darkness, chroma that
follows the cover's, and hues that stay put. PR #46 has the code for all of them
and a Mac tool (`dev/backdrop-lab`) that runs the real analysis and shader over a
folder of covers.

`SynqBackdrop.frameStats()` (`scripts/sim.sh eval
"expo.modules.SynqBackdrop.frameStats()"`) reports frames drawn and what they
cost, to check that it stops when it should.

## Skipping

A skip never shows an empty cover. `SeamlessArtwork` differs from the `Artwork`
in lists in three ways:

- No `recyclingKey`. In `expo-image`, changing it clears the view at once, which
  is what a recycled list row wants and what made every skip flicker: the image
  went away, the small placeholder loaded, then the new cover faded in over
  120 ms. Without it the current image stays until the next one arrives.
- No `transition`, so it's replaced in one frame.
- No downscaling, which `expo-image` does on the main thread.

`artwork-prefetch.ts` keeps the covers of the current song and the songs either
side of it decoded in `expo-image`'s memory cache (both sizes), which
`SeamlessArtwork` reads through `cachePolicy="memory"`, so the cover changes
with the title. It also runs each neighbor through `ArtworkAnalysis`, so the
backdrop and the corner zoom are ready too.

Holding on to the previous image means a file that fails would leave the last
song's cover up, so `onError` moves to the cover's other size, and then to the
placeholder.

The memory cache holds only these covers, capped at 110 MB, about a dozen 1500 px
ones. iOS can purge it at any time, and a miss just shows the old cover a moment
longer.

## Marquee

`MarqueeText` translates the text with a Reanimated transform at a constant
`SPEED`, with no easing, so a short overflow moves as fast as a long one.

`modules/synq-fade` masks it with a `CAGradientLayer`, since the backdrop behind
it moves and an overlay couldn't match it. The native view reads the text's
measured width itself when it lays out, so a new title has the right mask on its
first frame and text that fits has no mask at all. JavaScript only tells it where
the text is (`phase`: at the start, moving, at the end), a few times a cycle, and
Core Animation fades the edges from there. Nothing runs in JavaScript per frame.
The mask sits on a plain view inside the native one, because React Native rewrites
the mask of its own views when it redraws their layers.

## Timeline and volume

`modules/synq-volume` draws both with `BarSliderView`: two nested `CALayer`
capsules with no thumb, resized in real geometry so the ends stay round while they
grow (a scale would squash them), with Core Animation running the growth. A drag
is relative to where it landed, so touching never jumps, and belongs to the bar
from the moment it lands, which holds the sheet still.

The timeline (`ScrubberView`) takes the position from JavaScript and seeks on
release. It reports a drag only when it reaches a new whole second, for the time
labels.

The volume (`VolumeSliderView`) keeps an `MPVolumeView` on screen with every image
clear: that's what keeps iOS's overlay away, and its inner slider is the only way
to set the volume. The bar checks that slider ten times a second while on screen,
which is how it follows the hardware buttons. iOS has no public way to reach it,
but it has been the usual way to do this for years; if it ever stops working,
dragging is lost and the hardware buttons still work.

A route that sets its own volume (CarPlay, some AirPlay speakers) has no slider:
`MPVolumeView` hides it and puts up the route's name in white text, which would
sit on the bar. The view clears that text after each of `MPVolumeView`'s layouts
and shows the name itself: the fill goes, the track dims and parts around the
name (in the times' muted caption style), dragging stops, and an
`onAvailabilityChange` event dims the speakers in JavaScript.

Simulators have no system volume and `MPVolumeView` only says "No Volume
Available" there, so a simulator build drives a stand-in slider, which changes
nothing but checks the layout and the touches. To see the CarPlay state, use the
real `MPVolumeView`, which is already in it on a simulator:
`xcrun simctl spawn <device> defaults write com.directedbyshawn.synq.dev SynqSimulatorSystemVolume -bool YES`,
then relaunch.

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
