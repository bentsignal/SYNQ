# SYNQ 3.0 rewrite

This is the plan of record for the 3.0 rewrite. Treat decisions here as
settled unless Shawn changes them; record new decisions here in the same PR
that makes them.

## Goals

- Ship 3.0 as an update to the App Store app (`com.directedbyshawn.synq`,
  live version **2.5.2**, build 77). 3.0.0 builds up to 99 went to
  TestFlight only and never shipped.
- **Every 2.5.2 user's library survives the update untouched**: songs,
  files, artwork, artists, albums, track numbers, playlists and their order,
  Liked Songs (including a renamed one), theme, app icon, haptics, and shuffle
  and repeat. This is the one hard constraint.
- Code that is easy to extend: Vera's conventions, lint rules, React Doctor,
  perf gates, simulator workflow, and agent skills.
- A native-feeling iOS app (native tabs with the mini player as the tab bar
  accessory, native stacks with large titles, SwiftUI menus and lists, SF
  Symbols) that keeps SYNQ's tone: dark, charcoal grays, one pastel accent,
  quiet and elegant.
- Fast: lists virtualized, React Compiler on, playback owned by native code.
- SYNQ Dev and SYNQ install side by side on Shawn's phone.

## Scope

- **iOS only.** SYNQ has only ever shipped on iOS. Don't write Android code
  or `.android.tsx` files; keep native modules' JS API platform-neutral so
  Android can be added later.
- Feature parity with 2.5.2 (see "Feature checklist"), minus Premium and
  the ad (see "Free").

### Download

Download sends a link to a server's address and imports the audio files it
returns (Shawn, November 2026). SYNQ doesn't host, name, or recommend a server.
The address is the whole setup: a private server can put a token in its query.
See [download-servers.md](download-servers.md).

### Free

SYNQ 3.0 is completely free (Shawn, October 2026). There is no Premium
tier, paywall, or ad, and nothing is locked: import is unlimited and
immediate, and export, backup, themes, and app icons are open to everyone.
RevenueCat (`react-native-purchases`) and Facebook's SDK
(`react-native-fbsdk-next`) are gone; PostHog stays. A 2.5.2 user's
premium status no longer matters, and whatever theme and icon they had
stays. Paid cloud services may come one day, priced differently, but
nothing in the app anticipates them. The App Store side waits for launch
day (see "Launch day").

## Repository layout

Mirrors Vera (`~/dev/vera`), pnpm + turbo:

```
apps/mobile/          @synq/mobile, the Expo app (expo-router, src/app routes, src/features/*)
packages/audio/       @synq/audio, Expo native module (Swift): queue playback, Now Playing, remote commands
packages/db/          @synq/db, Drizzle schema + migrations, library queries, legacy (2.5.2) importer
tooling/{eslint,prettier,typescript}
scripts/              sim.sh, simq.ts (shared simulator queue), phone.sh, evidence.sh, ...
.agents/skills/       synq-feature, synq-simulator, merge, unslop (.claude -> .agents)
docs/                 this file, migration.md, ...
```

`apps/new`, `apps/old`, `shared/*`, `tooling/rewrite-smoke`, and
`packages/native-audio` from the rewrite-2 branch are retired. Read them in
git history (`git show rewrite-2:<path>`) if useful; don't copy their
structure. The production 2.5.2 source is `origin/2.5.2`.

## Stack

Same versions as Vera's `apps/mobile` unless a reason is recorded here:
Expo SDK 57, React Native 0.86.3 (New Architecture), React 19, React
Compiler, expo-router (`NativeTabs` from `expo-router/unstable-native-tabs`,
native stacks), `@expo/ui` (SwiftUI), `expo-symbols`, Uniwind (Tailwind 4),
`@legendapp/list`, Reanimated 4.5, `expo-image`, `expo-sqlite` + Drizzle,
TanStack Query for reading the library, `posthog-react-native`,
`expo-updates`.

From Vera's native setup, SYNQ carries the iOS 27 search tab patch
(`patches/react-native-screens@4.26.2.patch`) and the UIScene life cycle
plugin. It doesn't carry Vera's React Native dictation patch: that needs
React Native built from source (a much slower build) and fixes dictation
in React Native text inputs, which SYNQ barely has; revisit if editing
fields need it.

### Import, export, backup (decided with their build)

- **`modules/synq-media`** (a local Expo module in `apps/mobile`, Swift):
  reads imported audio with AVFoundation (tags, precise duration in ms,
  embedded artwork), writes covers (`cover_full.jpg` ≤1500 px and
  `cover_small.jpg` ≤200 px, center-cropped square), splices new tag blocks
  into export copies, remuxes the M4A files TypeScript can't tag (passthrough
  export),
  hard-links the library for backups, and runs Wi-Fi Transfer's HTTP server
  (Network.framework; uploads stream to disk, and a Server-Sent Events stream
  gives the page a live link to the phone; docs/ui.md → Import). No file passes
  through JavaScript as base64. 2.5.2's JavaScript metadata reader
  (`@missingcore/audio-metadata`) needs the legacy expo-file-system API, and
  its server (`react-native-http-bridge-refurbished`) is an old-architecture
  module that sent files as base64 JSON.
- Tags are read and written in TypeScript (`src/features/media`, node-tested):
  ID3, FLAC, M4A's iTunes atoms, and WAV. See [audio-tags.md](audio-tags.md).
- **react-native-zip-archive** for backups (zip64, SSZipArchive);
  **posthog-react-native** with `expo-application`, `expo-device`, and
  `expo-localization` for its device properties.

## Variants

`apps/mobile/app.config.ts` with `APP_VARIANT`:

| | Production | Development |
|---|---|---|
| Name | SYNQ | SYNQ Dev |
| Bundle id | `com.directedbyshawn.synq` | `com.directedbyshawn.synq.dev` |
| Scheme | `synq` | `synq-dev` |
| Icon | `icon-blue` (alternates `icon-blue`, `icon-mint`, `icon-red`, `icon-yellow`, `icon-purple`, `icon-orange`, `icon-pink`; names must stay exactly these, iOS remembers the user's choice by name) | `synq-dev`: the same arrows, dark on amber (rendered by `apps/mobile/assets/icons/render-dev-icon.swift`) |

EAS project `df86bb9d-1587-48b7-a40e-85a09eee2a72` (the production
project). Version 3.0.0; build numbers continue above 99 (EAS remote
versioning; its counter still reads 1 and must be set to 99 before the
first store build, see `apps/mobile/README.md`). Runtime version `ios-1`,
set by hand like Vera's. Both variants are on Shawn's Apple team, signed
through its App Store Connect API key (`~/.appstoreconnect/vera.env`).

## Data

### On disk (unchanged from 2.5.2)

Audio and artwork stay where 2.5.2 put them, relative to the app's
`Documents/` directory, so the update moves no files:

```
Documents/library/{songId}/{fileName}                audio, as imported
Documents/library/{songId}/cover_{full,small}.jpg    song artwork (songs without an album cover)
Documents/albums/{albumId}/cover_{full,small}.jpg
Documents/artists/{artistId}/cover_{full,small}.jpg
Documents/playlists/{playlistId}/cover_{full,small}.jpg
Documents/SQLite/synq.db                             the 2.5.2 database (left in place, read once)
```

`cover_full.jpg` is at most 1500 px, `cover_small.jpg` at most 200 px.
Paths are always stored **relative to Documents** and resolved at runtime;
the container path changes across updates.

### The 3.0 database

A new file, `Documents/SQLite/library.db`, owned by Drizzle migrations
(`packages/db`). Ids of songs, albums, artists, and playlists are preserved
from 2.5.2 so the folders above stay valid. Shape (snake_case columns,
foreign keys on with `ON DELETE CASCADE` for join rows, indexes on join
columns and names):

- `songs`: `id`, `title`, `file_path` (relative), `mime_type`,
  `duration_ms`, `artwork_version` (null = no song artwork; otherwise a
  cache-busting number), `added_at` (ms), `modified_since_export` (2.5.2's
  `edited`), and the Home columns below.
- `artists`: `id`, `name`, `artwork_version`, `added_at`, Home columns.
- `albums`: `id`, `name`, `year`, `artwork_version`, `added_at`, Home columns.
- `song_artists`: `song_id`, `artist_id`, `position` (unique pair).
- `album_songs`: `album_id`, `song_id`, `track` (nullable), `position` (the
  song's album order; the first is its primary album) (unique pair).
- `album_artists`: `album_id`, `artist_id`, `position` (unique pair).
- `playlists`: `id`, `name`, `kind` (`liked` for Liked Songs, else `user`),
  `artwork_version`, `created_at`, `updated_at`, Home columns. Liked Songs is a playlist
  row, so renames and order survive. 2.5.2's hidden "Library" playlist
  (id 1) is not migrated: the library is the `songs` table.
- `playlist_songs`: `id`, `playlist_id`, `song_id`, `position` (REAL, so a
  move writes one row), unique `(playlist_id, song_id)`.
- `legacy_import`: one row recording when and what was imported from 2.5.2.

Durations are **milliseconds** everywhere in 3.0 (2.5.2 stored seconds).

A song's artwork is its first album (by `album_songs.position`) that has
artwork, else its own, else the placeholder (2.5.2's precedence).

Preferences (accent, haptics, shuffle, repeat, review bookkeeping) and the playback session (queue song ids, index, position,
source) live in `expo-sqlite/kv-store` behind a small typed store, read
synchronously at startup.

### Home

The Library tab opens to what you go back to (Shawn, November 2026): Pinned,
then Recents. The code is `packages/db/src/library/home.ts`.

`songs`, `albums`, `artists`, and `playlists` each have two nullable columns,
`last_played_at` and `pinned_at` (ms). They're on the rows rather than in a table
of their own, so a delete takes them along by any route, and an erase with it.

- **What counts as a play.** `playSongs` records the collection it came from
  (an album, artist, playlist, or Liked Songs), or, from Songs or a search, the
  song someone tapped. Play or Shuffle on all of Songs records nothing. Songs
  advancing on their own don't either.
- **When it shows.** Recents only changes if the Library tab was at the very top
  when it was left (for another tab, a pushed page, or the player), or when the app
  went to the background. Then what was played is first on the way back. Left
  scrolled down, it finds everything where it was, so someone browsing never has
  the page move under them; what they played waits in memory, with the time each
  happened, until the tab is next left at the top. Leaving counts once the tab is
  fully off screen, a second later, so the change is never seen during the
  animation; coming back sooner leaves the list as it was. Going to the background still
  writes it, so a relaunch shows it, but doesn't refresh the list. A pin shows at
  once. It's decided by scroll position rather than by when the app restarts
  because playing music can keep the app alive for days.
- **Recents** is everything not pinned, by `last_played_at`, else when it was
  added. So a new import comes up first, and a library nothing's been played in
  yet, which is every 2.5.2 upgrade, still has a home. A song an album stands for
  waits until it's played by itself; an artist waits until played, since imports
  add artists as a side effect; Liked Songs has its own row until it's played; an
  album with no songs isn't shown.
- **Paging.** The list asks for the newest N and asks for more near its end. It's
  one read of the whole window rather than pages kept side by side, so something
  played moves up with no duplicate or gap.
- **Upgrading.** The migration only adds nullable columns, and the importer writes
  neither, so a 2.5.2 library arrives with nothing pinned or played and no file
  moved. Tested in `home.test.ts`, with the real migrator and importer.

### Adding a song to an album

Adding a song from an album's Edit Songs (or New Album) moves it there
(`addSongsToAlbum`). No schema change, so a 2.5.2 library upgrades through
it untouched, and no audio or artwork file moves or is deleted.

- It leaves its primary album; this one becomes primary. A second album
  it's also on stays second.
- It lands at the end: tracks number on from the last one. An unnumbered
  track sorts after every numbered one, so an album with any gets numbered
  1..n in its current order first.
- An album left without a cover copies the first added song's, as an import
  gives a new album its first song's. Otherwise moving a song would lose its
  artwork, since an album's cover stays with that album.
- An album with no artists takes the added songs' artists; one that has
  artists keeps them, and a track by someone else shows them under its
  title.
- The album it leaves stays, even when emptied, with its cover: albums left
  without songs are kept, as `deleteSongs` keeps them and as 2.5.2 did. The
  write reports the albums it emptied, and the app offers to delete them once
  (docs/ui.md → Editing); only a confirmed Delete removes one, and its songs
  stay. Deleting an album from its menu is the one delete that can take its
  songs along (docs/ui.md → Collection menu). Nothing asks about an album a
  2.5.2 library already had empty.

### Migrating a 2.5.2 install

Details and test fixtures: `docs/migration.md` (written with the
importer). The contract:

1. On launch, before any UI that reads the library, if
   `Documents/SQLite/synq.db` exists and `library.db` has no
   `legacy_import` row, run the importer. A splash-style screen covers it.
2. The importer reads the legacy database read-only (tolerating missing
   tables and columns, orphaned join rows, duplicate playlist entries,
   empty `fileName`, songs whose file is missing) and 2.5.2's AsyncStorage
   (`Library/Application Support/com.directedbyshawn.synq/RCTAsyncLocalStorage_V1/manifest.json`,
   plus per-key files named by the key's MD5 for long values), and writes
   everything into `library.db` and the kv-store **in one transaction**.
   It never modifies or deletes legacy files. A failure rolls back and the
   next launch retries; the app shows an error with a retry, never an empty
   library.
3. The same importer reads 2.5.2 backup zips (which hold `SQLite/synq.db`
   and the folders above, but no AsyncStorage) when one is restored (see
   "Restoring a backup").
4. Covered by node tests against a synthetic 2.5.2 database and a real one
   captured from the 2.5.2 app in the simulator, and by an end-to-end
   upgrade test: install 2.5.2, add data, install 3.0 over it.

### Same-named albums

An album is its name and its artists (Shawn, November 2026): two "Greatest
Hits" by different artists are two albums. Nothing gets renamed: album lists,
search, the album screen, and the pickers all show the artist beside the name,
and the database has never required album names to be unique. The rule is
`packages/db/src/library/album-identity.ts`, with no schema change. A 2.5.2
album holding songs by several artists stays exactly as it is: the importer
neither splits nor merges, and this only decides where new songs go.

A file's album artist (TPE2, `aART`, ALBUMARTIST) says whose album it is. A
compilation flag (TCMP, `cpil`, COMPILATION) with none means Various Artists,
an artist row like any other. The album credits just these, so a featured
artist doesn't become an album's artist. It joins, in order:

1. the same-named album sharing an album artist (the same set first), so a
   compilation stays whole, across batches;
2. else one with no artists;
3. else a 2.5.2-style album crediting several artists, this song's among them;
4. else a new album.

Most files have no album artist, and then only the song's artists and its batch
can say. A batch is everything imported until the queue goes idle. It joins:

1. the same-named album sharing an artist. A track number clashing doesn't
   matter here: re-importing an album gives its songs again, and they belong
   with it;
2. else one with no artists;
3. else, within the batch, one started by a song with no album artist, unless
   that song's track number is taken there. So an untagged compilation's tracks
   (1 by A, 2 by B, 3 by C) stay one album, while two artists' "Greatest Hits"
   (both with a track 1) in one import separate;
4. else a new album. Across batches a new artist with nothing in common starts
   their own: that's what two different albums look like, and it's the choice
   that never merges them.

A song with no artist at all has nothing against any album of the name, so it
joins one (one with no artists first).

What this can't tell apart, since imports read one file at a time: two artists'
untagged albums in one batch whose first few songs have no clashing track (an
import sorted by title, say) stay combined, as they do today, because each joins
on the artist already credited. An untagged compilation imported in two parts
makes a second album for any artist new in the second part, and an untagged
two-disc compilation can split on a disc's clashing track numbers.

**Editing.** Picking an album is by id, and the picker shows each one's artist.
It offers a typed name as new unless these artists have that album (or nobody's
credited, so they couldn't be told apart). A name that reaches `editSong` means
the album the song's artists are on, else a new one credited to them. **New
Album and Edit Album** refuse a name only when another album has it with artists
in common, or with no artists to tell them apart.

**Exports** write the album artists, so a re-import or another player sees the
same albums.

### Restoring a backup

Restoring **adds a backup to the library**; it never removes or overwrites
anything the person has now (Shawn, November 2026). Erase is a separate
action. The code is `packages/db/src/merge`, tested on real files. Every backup is first read into a `library.db` of its
own: a 3.0 backup's own database, migrated; a 2.5.2 backup's through the
importer. So one merge handles both.

The rule behind the rest: **what's missing is added, what's blank is filled
in, and what's there stays.** Restoring the same backup twice changes
nothing the second time.

- **Same song.** Ids can't say, since a backup's come from another install.
  When both sides have the audio file, its bytes decide: size, then an MD5
  of the same-sized ones. SYNQ keeps audio exactly as imported and edits
  only change the database, so a song retitled on one side still matches.
  Without a file on one side there's nothing to compare, so the title,
  duration (within a second, since 2.5.2 floored it), and an artist must
  agree. Two different files are never the same song, even with identical
  tags: a wrong match loses a song, and a duplicate loses nothing. Each copy
  of a file imported twice pairs with one copy, same title first, so copies
  are neither lost nor multiplied.
- **New songs** get a fresh id and folder, in the usual
  `Documents/{library,albums,artists,playlists}/{id}/` layout. Their
  `added_at` stays the backup's, so they sort where they did.
- **Existing files** are never moved, renamed, or overwritten. A new id
  skips any folder a failed delete left, and is reserved in
  `sqlite_sequence`, so a song imported during the restore can't take it.
- **A song on both sides** keeps its title and credits; the current library
  wins. Only blanks fill in: artwork, artists if it has none, albums if it
  has none, a track number, or its audio if the file is missing.
- **Artists** match by name the way import does (ignoring case, an exact match
  first), and combine. **Albums** match by name and artists, as import does
  (see "Same-named albums"): two "Greatest Hits" by different artists stay two,
  in the backup and across it. A song on both sides says two same-named albums
  are one, whatever their artists say; an album with no artists on either side
  has nothing to tell it apart, so it combines. An album gaining songs adds the
  backup's album artists after its own; one gaining nothing keeps them unless
  it has none. A backup's artist or album that nothing would use isn't
  created (all its songs matched and kept their own credits: that's the
  other side of an edit, like Bjork to Björk), unless it had no songs to
  begin with. Case variants new to the library stay separate, as they were.
- **Playlists** match by name. A match keeps its order and appends the
  backup's other songs in backup order; otherwise it's created. Liked Songs
  is the union whatever each side calls it, and keeps the current name.
- **Artwork** fills in only where the current item has none, and never over
  a cover file that's already in the folder.
- **Pins and plays** come with what's new. Something on both sides keeps its own:
  having unpinned it isn't a blank for an old backup to fill. Liked Songs is on
  both sides, so its pin and last play stay this library's.
- **Settings stay.** A backup has no theme, icon, or haptics. A 3.0 backup's
  `legacy_import` row may hold 2.5.2's settings; it's ignored, so a restore
  can't bring back an old theme. This device's own `legacy_import` row stays.
- **Playback carries on.** No id or file changes, so the queue is untouched,
  and the library queries refresh when it's done.

**Atomicity.** Files move first, from the extracted backup (same volume, so
it's a rename), and the database follows in one transaction. A failure
removes the moved files and leaves the library as it was. For the app being
killed partway, a journal in the kv-store lists what's being added before the
first file moves, and the transaction writes the journal's token to `PRAGMA
user_version`. The next launch reads both: token there, it committed; token
absent, the listed files go. A failed try can burn ids, which nothing sees.

Reading folders, comparing files, and moving files all pause between items
and report progress, so a large backup doesn't hold up the JS thread, and audio
plays in native code throughout. What can't pause is short: `File.md5` is one
file at a time, and planning and the transaction are synchronous, but planning
only looks paths up in memory, and the transaction's statements each take
their rows as one JSON array, so SQLite does the work.

## Playback (`packages/audio`)

Native owns the queue and playback, so playback, lock screen, remote
commands, and auto-advance work with no JavaScript in the loop. JavaScript
owns policy (what to queue, shuffle order, persistence).

- `AVQueuePlayer` with the next item preloaded (gapless), KVO on item
  status and `timeControlStatus`, all state on the main queue.
- Now Playing info updated on item change, seek, and rate change; remote
  commands: play, pause, toggle, next, previous, change position.
- Interruptions pause and resume when iOS says to; a route losing its
  output pauses. The audio session is `.playback`.
- A file that fails to load reports an error and advances.
- Previous restarts the track after 3 seconds, else goes back.
- Repeat off / all / one. Shuffle is a JavaScript-computed order; replacing
  the queue keeps the current item playing seamlessly when it's the same
  track.
- JavaScript API (async functions + events): `setQueue(tracks, {startIndex,
  positionMs, play})`, `insert(tracks, index)`, `remove(indices)`,
  `move(from, to)`, `play`, `pause`, `toggle`, `seekTo(ms)`, `next`,
  `previous`, `skipTo(index)`, `setRepeatMode`, `getState`, and events `state` (status, index, track id), `progress`
  (position/duration about twice a second while playing, only when
  subscribed), `queue` (native changed the queue), `error`.

## UI direction

Native first, then SYNQ's tone on top:

- Always dark. Near-black background (2.5.2 used `#141414`), iOS dark
  system grays for grouped and elevated surfaces, white primary text, gray
  secondary text, hairline separators. The accent is the user's theme
  color (2.5.2's pastel set: blue `#77adf8` default, purple `#a888ec`, pink
  `#f6ace5`, red `#ff8585`, orange `#efa28a`, yellow `#eddd92`, mint
  `#61ae7f`), used as the tint, sparingly.
- `NativeTabs` (Liquid Glass): Library, Search (search role), Settings,
  plus the **mini player as the tab bar's bottom accessory** (like Apple
  Music). Importing lives in the Library toolbar's "+" menu (and an empty
  state that invites it).
- Native stacks, large titles, `Stack.Toolbar` buttons and menus,
  `Stack.SearchBar`, form sheets with detents, SwiftUI context menus on
  rows, SwiftUI `List` with native drag reordering for playlist editing, `@expo/ui` forms for settings.
- Full player: large artwork over a blurred artwork backdrop, native-feeling
  scrubber and controls with SF Symbols, AirPlay route button, queue
  sheet.
- SF Symbols everywhere; no PNG icons.
- No explanation text under self-explanatory UI. Nothing pops in.

## Feature checklist (2.5.2 parity)

- Import from Files (multi-select) and over Wi-Fi (local web page);
  metadata and embedded artwork read on import; unlimited and immediate
  (2.5.2's free tier had a wait and one song per batch).
- Library: Playlists, Artists, Albums, Songs with search and sort;
  detail pages for each; Liked Songs first.
- Song actions: like, add to playlist, remove from playlist, play next /
  add to queue, edit (title, artwork, albums, artists), export (with tags),
  delete.
- Playlist, album, artist: create, edit (name, artwork, year, artists),
  delete, export, album track reorder.
- Player, mini player, queue with drag reordering, shuffle, repeat.
- Settings: theme accent, app icon, haptics, backup / restore / erase,
  review, support and social links.
- PostHog events as in 2.5.2, less the paywall and purchase ones.
- Not carried over: Premium, the paywall, Restore Purchases, the audio ad,
  the import wait, and Facebook's SDK (see "Free").

## Launch day

Done by Shawn, or with his explicit go-ahead, never automatically:

1. Once 3.0 is live, in App Store Connect remove `SYNQPremiumMonthly`,
   `SYNQPremiumYearly`, and `SYNQPremiumLifetime` from sale. Don't delete
   them. Removing a subscription from sale stops its renewals; removing
   the products from sale keeps everyone's purchase records.
2. Leave the RevenueCat project alone.
3. Update the App Store privacy label: no purchase history (RevenueCat)
   and no Facebook data.
4. Update the store description and screenshots that mention Premium.

This waits for launch day because until 3.0 is live, 2.5.2 is the only
SYNQ there is, and it still checks Premium. Taking the products off sale
earlier would stop 2.5.2 subscribers' renewals, and they'd lose Premium in
2.5.2 before a free 3.0 existed to replace it.

## Working on a shared Mac

Shawn's laptop runs SYNQ and Vera agents side by side.

- Simulators start only through `scripts/sim.sh`, which waits in the
  **same** machine-wide queue as Vera (`scripts/simq.ts` is a verbatim copy
  of Vera's; both talk to one daemon in `~/Library/Caches/vera/simq`).
  Never boot one any other way, and take it down as soon as you have your
  evidence.
- Native builds (`xcodebuild`, `expo prebuild` + build, EAS local builds)
  run under the shared heavy-work lock:
  `~/dev/vera/scripts/bench/with-lock.sh <command>` (until SYNQ has its own
  copy at `scripts/bench/with-lock.sh`, which uses the same lock file).
