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
  lists cost what song rows cost. The queue's rows (a SwiftUI `List`) and
  the import list's are the only song lists without a menu.
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
(`src/features/import/session.ts`), one file at a time. Screens don't own
it, so the app stays fully usable, and a second import just joins the line.
The library refreshes at most once a second during an import. Files that
fail don't interrupt anything: one alert names them when the queue is done.

- **Files**: Import from Files opens the document picker (audio types,
  multiple) directly, with no sheet. Songs appear in the library as they
  finish, with a small glass capsule above the mini player ("Importing 3 of
  12") on every tab, then "12 Songs Imported" for a moment.
- **Wi-Fi Transfer**: a short sheet showing the address to open on a computer
  (selectable) while a local server runs only while the sheet is open; once
  files arrive, a progress view under it. No song list. The sheet closes
  itself when the transfer is complete. (The network's name would need
  location permission and the Wi-Fi Information entitlement, so it isn't
  shown.)

  **Complete** (`completionDelay` in `features/import/progress.ts`) means:
  something arrived, no upload is in flight, every received file has
  imported, and the page has nothing left to send. The browser uploads one
  file at a time, and each upload's `Content-Type` carries how many follow
  (`synq-remaining`), so the phone knows a gap between files isn't the end.
  After the last file the sheet stays 1.8 s (so a second drop can still catch
  it). If the page said more would come and nothing starts for 45 s, the
  browser went away and the sheet closes. A page that says nothing gets 6 s.
  If nothing imported at all, the sheet stays open with its address after the
  alert, to try again.
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
