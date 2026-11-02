# SYNQ 3.0 UI

The design of record for 3.0's screens. `docs/rewrite.md` has the
principles (native first, always dark, one pastel accent, SF Symbols, no
explanation text under self-explanatory UI, nothing pops in). This file
says how each screen applies them. Build with Vera's idioms
(`~/dev/vera/apps/mobile`): `TabStack`/`TabTitle`, `Stack.Toolbar`,
`Stack.SearchBar`, `@expo/ui` SwiftUI (`Host`, `FieldGroup`, `ContextMenu`,
`Menu`, `List` + `ForEach` with `onMove`/`onDelete`), `SymbolIcon`,
LegendList through one shared list wrapper, `expo-image`.

## Tokens

`apps/mobile/src/global.css`. Background `#141414`; elevated surfaces
`#1c1c1e` / `#2c2c2e`; `fill` for placeholders and pressed rows; white
`foreground`; `muted` for secondary text; `subtle` for tertiary;
hairline `separator`; `accent` is the person's theme (blue `#77adf8` by
default) and is for tint, selection, and the now-playing indicator, not for
large surfaces. Text styles follow the HIG classes (`text-body`,
`text-subhead`, `text-footnote`, ...). Durations and times use tabular
numbers.

## Shared pieces

- **Artwork**: `expo-image` of `cover_small.jpg` in lists and
  `cover_full.jpg` in headers and the player, keyed by `artwork_version` so
  edits show at once; placeholder is a `fill` square with a subtle
  `music.note` (songs, albums), `music.note.list` (playlists),
  `music.microphone` (artists, circular), `heart.fill` in the accent (Liked
  Songs). Corner radius 6 at row size, 10 at header size; artists are
  circles. A 0.5 px stroke over the art keeps dark artwork off the
  background; nothing sits behind or around the art, so its edge is the
  component's edge.
- **Song row** (fixed 64 pt, for the list's estimated size): 48 pt
  artwork, title (`text-body`) over `artist · album` (`text-subhead
  muted`), trailing `ellipsis` button opening the song menu; long press
  opens the same actions as a context menu. The playing song's title is
  in the accent with an animated `waveform` symbol (paused: static).
  Album track lists show the track number in place of artwork.
- **Collection row** (playlists, albums, artists): 56 pt artwork, name,
  muted detail (`12 songs`, year, `Album · Artist`), chevron.
- **Play / Shuffle buttons** at the top of every song collection: two
  equal capsules on `fill`, accent symbol and label (`play.fill` Play,
  `shuffle` Shuffle).
- **Song menu** (the ellipsis and the context menu, one data definition):
  Play Next, Add to Queue, Add to Playlist…, Love / Remove from Liked,
  Go to Album, Go to Artist, Edit Info, Share (export with tags), Remove
  from Playlist (inside a user playlist), Delete from Library (destructive,
  confirmed with an alert: cancel first, destructive second). Run list
  changes after the menu closes (Vera's `afterMenuCloses`).
  Built as `NativeRow` (`src/components/native-row.tsx`): the React Native
  row inside a UIKit view (`modules/synq-menu`) that handles the touches.
  A tap highlights the row in `fill`, a long press lifts it into a
  `UIContextMenuInteraction`, and the trailing `ellipsis` is a `UIButton`
  showing the same menu as its primary action. The menu goes to native as
  JSON and is only built when a menu opens, so a recycled row costs a
  string compare. This replaced a SwiftUI `Host` per row (`ContextMenu`
  around a `Button`, plus a `Menu`): with 3,000 songs and six identical
  flings in a production bundle, SwiftUI rows dropped about 600 frames
  (100 slow), UIKit rows about 410 (60 slow), and plain React Native rows
  with no menus about 350 (60 slow), on a Mac at full load. Binaries
  without the module fall back to the SwiftUI row
  (`src/components/swiftui-row.tsx`). The separator is a React Native
  hairline. Share sends the file as imported until export writes tags into
  a copy.
- **Collection menu** (`src/features/library/collection-menu.ts`): a long
  press on a playlist, album, or artist, wherever one appears (lists,
  search, an artist's album cards), and the `ellipsis` on its own page,
  from one definition in the song menu's order: Play, Shuffle; Play Next,
  Add to Queue; Add to Playlist…; Go to Artist; Edit, Export; Delete. Its
  page leaves out Play and Shuffle (they're buttons there) and Go to
  Artist (the header links to them). A collection with no songs offers
  only Edit and Delete. Liked Songs has no Delete. Collection rows and
  Recently Added's and an artist's cards are `NativeRow`s without the
  `ellipsis` button or a separator, so a long press lifts them natively and
  lists cost what song rows cost. The queue's rows have no menu either; they
  drag and swipe instead.
- **Song picker** (`src/features/editing/song-picker.tsx`): add several
  songs from the library at once, from Edit Songs and New Playlist / Album.
  The Songs list's sort in a Legend List of plain React Native rows (no
  native host per row, so 3,000 songs scroll freely), with a circle that
  fills with a check; the bar's search narrows what's listed and choices
  stay through it. The title counts them ("3 Selected"); Select All applies
  to what's listed; a song already there is dimmed with a gray check. Back
  discards, Done (`checkmark`, prominent) adds them in the order chosen.
- **Empty states** (`EmptyState`, one component for every empty page and
  every "no results"): a small `subtle` symbol (26 pt), a short `muted` title,
  and only the actions that help, as quiet capsules on `fill`, sitting in the
  upper part of the page. A page that's empty and has no artwork drops its
  collection header, so there's no large placeholder: its name moves to the
  bar and the state stands alone (Liked Songs: "No Liked Songs" + Browse
  Songs).
- **Errors**: `Alert.alert("Couldn't <Verb> <Noun>", "Try again.")`.

## Tabs

`NativeTabs`: **Library** (`music.note.house`), **Settings**
(`gearshape`), **Search** (search role). The mini player is the
`NativeTabs.BottomAccessory`.

### Library

- "Library" sits on the bar's own row (`RootTabTitle`, as on Settings),
  left-aligned opposite the `plus` menu: Import from Files, Wi-Fi Transfer,
  divider, New Playlist. A large title would leave that row's left half
  empty, with the title alone on the row below; pushed screens keep large
  titles, since their top left is Back.
- Rows (accent symbol, label, chevron): Liked Songs (`heart`), Playlists
  (`music.note.list`), Artists (`music.microphone`), Albums
  (`square.stack`), Songs (`music.note`).
- "Recently Added": a two-column grid of the newest songs' artwork with
  title and artist below; tap plays.
- Empty library: "No Music Yet" with Import from Files and Wi-Fi Transfer.

### Songs, Albums, Artists, Playlists

LegendList screens with a large title, `Stack.SearchBar` filtering in
place (debounced, through `useSearchQuery`), and a sort menu in the
toolbar (`arrow.up.arrow.down`: the sort keys as a checked group and
Ascending/Descending as a second group). Sort keys: songs Title / Artist /
Album / Date Added; albums Name / Year / Artist; artists Name; playlists
Name / Date Added, Liked Songs always first. Songs starts with Play /
Shuffle. Playlists' toolbar adds `plus` (New Playlist), and Albums' and
Artists' add `plus` for New Album and New Artist (2.5.2 could create
both). The search bars hide under the large title until pulled down, as
in Apple Music. Liked Songs is the playlist screen (it's a playlist row).

### Playlist, Album, Artist

The header scrolls with the list: 240 pt artwork centered (artists: 180 pt
circle), name (`text-title` bold), detail line (`Album · 2021` with the
artist in the accent and tappable; `14 songs, 52 minutes`), then Play /
Shuffle. Toolbar `ellipsis` menu: the collection menu, with Sort By first
on playlists. Album: track-number rows and a footer `14 songs, 52 minutes`. Artist: "Albums" as a horizontal row
of 140 pt album cards, then "Songs".

### Editing (form sheets)

Native forms (`FieldGroup`) with Cancel (`xmark`) and Done (`checkmark`,
prominent) in the toolbar. The small sheets (New Artist, Add to Playlist)
are form sheets; the edit and create sheets push lists (Edit Songs, Add
Songs, Artists, Albums) inside their own stack, which a form sheet can't
hold, so they're page sheets, and Done saves everything the sheet changed
(`src/features/editing/draft.ts`):
- **Playlist**: artwork (tap to choose a photo, cropped square), name,
  and Edit Songs (a SwiftUI `List` in edit mode: an Add Songs row on top
  opening the song picker, drag to reorder, swipe to remove).
- **Album**: artwork, name, year, artists (toggle list), Edit Songs (same
  native list). Adding a song moves it here: see docs/rewrite.md → Adding
  a song to an album.
- **Artist**: artwork, name.
- **Song**: artwork, title, artists, albums (toggle lists with search).
  Setting a cover on a song with an album sets the album's cover (2.5.2).
- **New Playlist / Album**: the same form as editing, with no field focused
  so the keyboard doesn't hide Add Songs, so someone can pick a picture and
  songs before it exists. With no songs yet,
  Add Songs goes straight to the picker. From Add to Playlist, New Playlist
  starts with those songs and Done closes both sheets.
- **New Artist**: a small form sheet with the name field focused.
- **Add to Playlist**: a form sheet listing playlists (Liked Songs first)
  with a New Playlist row at the top; tapping adds and closes at once.

## Player

- **Mini player** (bottom accessory): 32 pt artwork, title over artist
  (`text-footnote` semibold / `text-caption muted`), `backward.fill`,
  `play.fill` / `pause.fill`, and `forward.fill`. Tap opens the player. In
  the inline placement (tab bar minimized) it drops the artist line and
  `backward.fill`. "Not Playing" when the queue is empty.
- **Full player** (modal sheet, swipe down to close): behind everything,
  soft pools of the artwork's own colors drifting slowly, never brighter
  than white text can read over (`modules/synq-backdrop`, and the
  [player README](../apps/mobile/src/features/player/README.md#backdrop));
  binaries without it show a gradient in the artwork's colors. Large artwork
  (screen width minus 64, radius 12, soft shadow with the same radius) that
  eases to 85% scale when paused; a cover with its own rounded corners is
  zoomed until they're past the clip; title
  (`text-title` semibold, one line) over the artist (muted, tappable);
  `heart` toggle and `ellipsis` menu on the right; a thin scrubber whose
  thumb grows while dragging, elapsed left and remaining right
  (`text-caption` tabular); `backward.fill`, large `play.fill` /
  `pause.fill`, `forward.fill`; bottom row `shuffle`, `repeat` /
  `repeat.1` (accent when on), AirPlay route picker, `list.bullet` (queue).
- **Queue** (form sheet, detents medium and large): "Playing from
  <source>", the current song, then "Up Next"; toolbar Shuffle / Repeat
  toggles and Clear. Every Up Next row has a `line.3.horizontal` handle: a
  touch on it picks the row up at once, with no edit mode, and dragging near
  the edges scrolls. Swipe left to delete; tap to play. It's React Native
  rather than a SwiftUI `List`, which mounted a native view tree for every
  song and took about 15 seconds to open 3,000 of them, and which only
  reorders after a long press unless the whole list is in edit mode
  (`src/features/player/README.md`).

## Search

`Stack.SearchBar` in the search tab. Before typing: the library rows
(Playlists, Artists, Albums, Songs). Results in sections (Songs, Albums,
Artists, Playlists), songs playable in place, the others navigating.

## Settings

A native form (`FieldGroup`):
- **Appearance**: Theme (a row of the seven accent swatches, selected one
  ringed), App Icon (opens the icon picker: the seven icons in a grid,
  current one checked; the row itself doesn't repeat the current icon).
- **Playback**: Haptics toggle.
- **Library**: Backup & Restore (Back Up Library shares a zip; Restore
  from Backup picks one, including 2.5.2 backups; Erase Library,
  destructive with confirmation), How to Import (the Spotify local files
  guide from 2.5.2's info modal, with its images).
- **SYNQ**: Rate SYNQ, Contact Support, X, Instagram, Discord, and the
  version in the section footer.

## Import

Everything imports through one background queue
(`src/features/import/queue.ts`), one file at a time. Screens don't own it, so
the app stays fully usable, and a second import just joins the line. Files
that fail don't interrupt anything: one alert names them when the queue is
done.

**A batch appears all at once.** Each song is written to the library as it
finishes, so a batch cut short keeps what it got and shows it on the next
launch, but library screens refresh only once, when the whole batch is done.
A library action during a batch (a like, a rename) refreshes as always, so it
can show the songs written so far; lists hold their position through that.

**Nothing moves when a batch lands.** Scrolled down a list, the rows on screen
stay exactly where they are and the new ones go in above them
(`ScreenList`, `isInsertionOnly`). At the very top of a list the new rows push
down, so they're seen arriving. Library's Recently Added keeps its height once
it has 12 songs. The capsule floats over the screen and moves nothing.

**The capsule** floats above the mini player during any batch, Files or Wi-Fi,
on every tab, passing touches through: "Importing 3 of 12", then "12 Songs
Imported" for 1.8 s, as the songs appear. Files fly through too fast to read
one by one, so the count moves at most every 350 ms and covers a quarter of the
remaining distance each time (`stepCapsule`), its total never shrinks during a
batch, and it stays up at least 0.9 s. Files arriving during the result line
start a new batch in the same capsule.

**The App Store review prompt** comes 1.8 s after the first batch's songs have
appeared, once ever, and not after a batch with failures or if another import
has started by then; the next clean batch asks instead.

- **Files**: Import from Files opens the document picker (audio types,
  multiple) directly, with no sheet.
- **Wi-Fi Transfer**: a short glass sheet: an Allow Transfers switch, the
  address to open on a computer (selectable, with a copy button), and whether a
  computer is connected. No song list, no progress. Closing it stops nothing:
  someone can turn transfers on, close the sheet, and go on using the app while
  they send files. The sheet closes itself when a batch's first file starts
  arriving, and the capsule takes over. (The network's name would need location
  permission and the Wi-Fi Information entitlement, so it isn't shown.)

  **The switch** starts off on every launch, so a library doesn't go on taking
  files from the network because someone once flipped it. While it's off, the
  server stays up and refuses uploads, and the page says so. Turned off during a
  transfer, the file on its way finishes and the rest wait on the page.

  **The server** (`features/import/wifi-transfer.ts`) starts the first time
  someone opens Wi-Fi Transfer, since a listener can bring up iOS's Local
  Network prompt, which must never come at launch. After that it runs while the
  app does, and starts with the app on later launches, by which time iOS has its
  answer. iOS can reclaim the listener while the app is suspended, so returning
  to the foreground checks that it still answers and restarts it if not, on the
  same port. An older binary's server can't refuse uploads, so there it runs only
  while the switch is on.

  **The page** (`features/import/transfer-page*.ts`) is one self-contained file,
  since it has to work with no internet: charcoal, the theme's accent, a big
  quiet drop area, and one line of copy. It holds a live link to the phone
  (Server-Sent Events on the same server), which carries whether transfers are
  on, the accent (a theme change on the phone changes the page right away), and
  how the import is going. A small level meter shows the link: breathing when
  connected, moving while sending, flat with "Transfers Off" and "Turn on Wi-Fi
  Transfer in SYNQ" while off, which never reads as an error, and pulsing gray
  with "Disconnected" only when the app is backgrounded or the phone is gone
  (no ping for 8 s). Dropped files wait through any of that and go on by
  themselves. The sheet being closed changes nothing here.

  In progress, the page shows one line ("Sending 3 of 12", the file's name, and
  Cancel) and a hairline along the card's edge, then "Adding to your library",
  then "12 Songs Added". An upload that breaks off goes back to the front of the
  line; if only its response was lost, the page asks the phone first
  (`/uploaded`), so nothing arrives twice. A file that keeps failing with the
  phone there is listed under the card. On the phone, a broken upload isn't a
  failed import, so it brings no alert.

  **Done** (`completionDelay` in `features/import/progress.ts`) means: no upload
  is in flight, every received file has imported, and the page has nothing left
  to send. The browser uploads one file at a time, and each upload's
  `Content-Type` carries how many follow (`synq-remaining`), so the phone knows
  a gap between files isn't the end. After the last file the batch waits 1.5 s
  (so a second drop joins it). If the page said more would come and nothing
  starts for 8 s, the browser went away or the files were cancelled, and the
  songs land; anything sent after that is the next batch. A page that says
  nothing gets 6 s. Transfers going off ends the wait at once.
- **Export / Share**: tags written into copies, then the share sheet: one
  song as its file; an album, playlist, or artist as one zip named after
  it (`Album Name.zip`, stored rather than compressed, since audio doesn't
  compress). Album and playlist files are numbered in play order (`03
  Title.mp3`), so sorting by name gives that order; artist files are just
  titled. An export that takes more than half a second shows a banner at
  the top (`Exporting Album Name`, `3 of 14`, a progress bar, and `xmark`
  to cancel); the app stays usable underneath. One export runs at a time,
  and its temporary files go when the sheet closes.

## Updating from 2.5.2

While the importer runs on the first launch after the update, a full
screen in the splash color with the SYNQ mark and a native progress
indicator. On failure: "Couldn't Update Your Library" with Try Again; the
library is never shown empty because of a failed import.
