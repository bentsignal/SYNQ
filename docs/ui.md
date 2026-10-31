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
  circles. A 0.5 px `separator` stroke keeps dark artwork off the
  background.
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
- **Empty states**: centered `ContentUnavailableView`-style symbol, title,
  and one action where there is one (e.g. "No Music Yet" + Import Music).
- **Errors**: `Alert.alert("Couldn't <Verb> <Noun>", "Try again.")`.

## Tabs

`NativeTabs`: **Library** (`music.note.house`), **Settings**
(`gearshape`), **Search** (search role). The mini player is the
`NativeTabs.BottomAccessory`.

### Library

- Large title "Library". Toolbar right: `plus` menu: Import from Files,
  Wi-Fi Transfer, divider, New Playlist.
- Rows (accent symbol, label, chevron): Liked Songs (`heart`), Playlists
  (`music.note.list`), Artists (`music.microphone`), Albums
  (`square.stack`), Songs (`music.note`).
- "Recently Added": a two-column grid of the newest songs' artwork with
  title and artist below; tap plays.
- Empty library: the empty state with Import Music and Wi-Fi Transfer.

### Songs, Albums, Artists, Playlists

LegendList screens with a large title, `Stack.SearchBar` filtering in
place (debounced, through `useSearchQuery`), and a sort menu in the
toolbar (`arrow.up.arrow.down`: the sort keys as a checked group and
Ascending/Descending as a second group). Sort keys: songs Title / Artist /
Album / Date Added; albums Name / Year / Artist; artists Name; playlists
Name / Date Added, Liked Songs always first. Songs starts with Play /
Shuffle. Playlists' toolbar adds `plus` (New Playlist).

### Playlist, Album, Artist

The header scrolls with the list: 240 pt artwork centered (artists: 180 pt
circle), name (`text-title` bold), detail line (`Album · 2021` with the
artist in the accent and tappable; `14 songs, 52 minutes`), then Play /
Shuffle. Toolbar `ellipsis` menu: Edit, Sort By (submenu, playlists only),
Export (Premium), Delete (not for Liked Songs). Album: track-number rows
and a footer `14 songs, 52 minutes`. Artist: "Albums" as a horizontal row
of 140 pt album cards, then "Songs".

### Editing (form sheets)

Native forms (`FieldGroup`) in form sheets with Cancel and Done in the
toolbar:
- **Playlist**: artwork (tap to choose a photo, cropped square), name,
  and Edit Songs (a SwiftUI `List` in edit mode: drag to reorder, swipe to
  remove).
- **Album**: artwork, name, year, artists (toggle list), Reorder Tracks
  (same native list).
- **Artist**: artwork, name.
- **Song**: artwork, title, artists, albums (toggle lists with search).
  Setting a cover on a song with an album sets the album's cover (2.5.2).
- **New Playlist / Album / Artist**: a small form sheet with the name
  field focused.
- **Add to Playlist**: a form sheet listing playlists (Liked Songs first)
  with a New Playlist row at the top; tapping adds and closes at once.

## Player

- **Mini player** (bottom accessory): 32 pt artwork, title over artist
  (`text-footnote` semibold / `text-caption muted`), `play.fill` /
  `pause.fill` and `forward.fill`. Tap opens the player. In the inline
  placement (tab bar minimized) it drops the artist line. "Not Playing"
  when the queue is empty.
- **Full player** (modal sheet, swipe down to close): behind everything, a
  soft gradient in the artwork's own colors, darkened enough for white text
  (2.5.2's signature look; a blur of the artwork is the fallback); large artwork (screen width minus 64,
  radius 12, soft shadow) that eases to 85% scale when paused; title
  (`text-title` semibold, one line) over the artist (muted, tappable);
  `heart` toggle and `ellipsis` menu on the right; a thin scrubber whose
  thumb grows while dragging, elapsed left and remaining right
  (`text-caption` tabular); `backward.fill`, large `play.fill` /
  `pause.fill`, `forward.fill`; bottom row `shuffle`, `repeat` /
  `repeat.1` (accent when on), AirPlay route picker, `list.bullet` (queue).
- **The ad** (free tier): the artwork becomes a card with the SYNQ mark,
  "Listen ad-free with Premium", and Learn More (opens the paywall);
  scrubber and skip are disabled.
- **Queue** (form sheet, detents medium and large): "Playing from
  <source>", the current song, then "Up Next" as a native SwiftUI `List`
  with drag reordering and swipe to remove; toolbar Shuffle / Repeat
  toggles and Clear.

## Search

`Stack.SearchBar` in the search tab. Before typing: the library rows
(Playlists, Artists, Albums, Songs). Results in sections (Songs, Albums,
Artists, Playlists), songs playable in place, the others navigating.

## Settings

A native form (`FieldGroup`):
- **Premium**: free users see a "SYNQ Premium" row with the accent
  `sparkles` symbol that opens the paywall; subscribers see their plan
  and renewal or "Lifetime".
- **Appearance**: Theme (a row of the seven accent swatches, selected one
  ringed; locked behind Premium for free users), App Icon (opens the icon
  picker: the seven icons in a grid, current one checked).
- **Playback**: Haptics toggle.
- **Library**: Backup & Restore (Back Up Library shares a zip; Restore
  from Backup picks one, including 2.5.2 backups; Erase Library,
  destructive with confirmation), How to Import (the Spotify local files
  guide from 2.5.2's info modal, with its images).
- **SYNQ**: Rate SYNQ, Contact Support, X, Instagram, Discord, Restore
  Purchases, and the version in the section footer.

## Import

- **Files**: the document picker (audio types, multiple), then a form
  sheet listing each file as it's read (artwork, title, artist) and
  imported, with a progress line; Done closes it. Free tier keeps 2.5.2's
  rules: the first file is imported, the rest show locked with Import All
  with Premium; the import wait shows as the ad card with progress.
- **Wi-Fi Transfer**: a screen showing the address to open on a computer
  (large, selectable, with the network name) while a local server runs
  only while this screen is open; received files list in as they arrive,
  then import like Files.
- **Export / Share**: tags written into a copy, then the share sheet.

## Paywall

Form sheet, large detent. The eclipse image from 2.5.2's home banner as
the hero, "SYNQ Premium", feature rows with symbols (Ad-Free Listening
`speaker.slash`, Bulk Import and Export `square.and.arrow.down.on.square`,
Themes and App Icons `paintpalette`, Backup and Restore
`externaldrive`), three selectable plan cards (Monthly, Yearly marked Best
Value and selected by default, Lifetime) with prices from RevenueCat, a
prominent glass button whose label follows the plan and trial eligibility,
and Restore · Terms · Privacy below.

## Updating from 2.5.2

While the importer runs on the first launch after the update, a full
screen in the splash color with the SYNQ mark and a native progress
indicator. On failure: "Couldn't Update Your Library" with Try Again; the
library is never shown empty because of a failed import.
