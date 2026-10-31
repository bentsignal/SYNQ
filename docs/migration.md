# Migrating a 2.5.2 library to 3.0

How `importLegacyLibrary` (`packages/db/src/legacy/`) turns a 2.5.2 install,
or a 2.5.2 backup zip, into `library.db` plus the kv-store, and what the app
must do around it. The contract is in `docs/rewrite.md` ("Migrating a 2.5.2
install"). Everything here is covered by `packages/db` tests unless it says
otherwise.

## What 2.5.2 left on disk

| Where | What |
| --- | --- |
| `Documents/SQLite/synq.db` | expo-sqlite database, created by `src/models/Model.ts` (no foreign keys, indexes, or unique constraints) |
| `Documents/library/{songId}/{fileName}` | audio, as imported |
| `Documents/{library,albums,artists,playlists}/{id}/cover_{full,small}.jpg` | artwork (≤1500 px / ≤200 px). Empty folders are common: the cover getters created a folder for anything displayed |
| `Library/Application Support/com.directedbyshawn.synq/RCTAsyncLocalStorage_V1/` | AsyncStorage 1.23.1: `manifest.json` (key → string, or `null` = the value is in a file named by the lowercase hex MD5 of the key's UTF-8 bytes, used for values over 1024 UTF-16 units). Verified against `RNCAsyncStorage.mm` and React Native's `RCTMD5Hash` |

The database version lived in AsyncStorage (`dbVersion`), not in `PRAGMA
user_version`. Version 2 added `albumSongs.track`. A 3.0.0 TestFlight build
also ran Drizzle migrations on `synq.db` in place (adding
`__drizzle_migrations`), and rewrite-2 dev builds dropped columns such as
`songs.fileName`. The importer reads every table and column it knows
through `PRAGMA table_info`, so all of these import.

## Mapping

### Tables and columns

| 2.5.2 | 3.0 | Notes |
| --- | --- | --- |
| `songs.id` | `songs.id` | Preserved, so `library/{id}/` stays valid |
| `songs.title` | `songs.title` | `NULL` → `''` (the UI shows the file name) |
| `songs.edited` | `songs.modified_since_export` | `0/1`, `'true'`, and `TRUE` all accepted |
| `songs.duration` (seconds) | `songs.duration_ms` | × 1000. 2.5.2 floored to whole seconds; `NULL`/0 → 0 |
| `songs.fileType` (a MIME type) | `songs.mime_type` | Kept as-is; `''` → `NULL` |
| `songs.fileName` | `songs.file_path` | `library/{id}/{fileName}` relative to Documents (see "Audio files") |
| `songs.artists`, `songs.album`, `songs.genre` | (dropped) | Stale copies: edits wrote the join tables, not these. `genre` was always `'Music'` |
| (none) | `songs.added_at` | Synthesized: `now - n + rank` in id order (see "Timestamps") |
| (cover files) | `songs.artwork_version` | Cover mtime in ms if `cover_full.jpg` or `cover_small.jpg` exists, else `NULL` |
| `artists.id`, `.name` | `artists.id`, `.name` | Preserved. Case-variant duplicates ("BTS" and "bts") stay two rows. `NULL` name → `''` |
| `albums.id`, `.name`, `.year` | `albums.id`, `.name`, `.year` | `year` came from tags: `2019`, `'2019'`, `'2019-05-01'` → 2019; 0 or junk → `NULL` |
| `playlists` id 1 ("Library") | (dropped) | The hidden every-song playlist; the library is the `songs` table |
| `playlists` id 2 | `playlists` id 2, `kind = 'liked'` | Keeps the user's name ("Favs ♥"); `NULL`/blank → "Liked Songs". Recreated if its row is missing |
| other `playlists` | `playlists`, `kind = 'user'` | Ids and names preserved |
| `artistSongs` (artistId, songId) | `song_artists` (song_id, artist_id, position) | Position = rowid order per song (2.5.2 listed credits by rowid) |
| `albumSongs` (albumId, songId, track) | `album_songs` (album_id, song_id, track, position) | Position = rowid order per song (the first is the primary album, whose cover wins). Track: first non-null across duplicates; missing column → `NULL` |
| `artistsAlbums` (artistId, albumId) | `album_artists` (album_id, artist_id, position) | Position = rowid order per album |
| `playlistSongs` (id, playlistId, songId) | `playlist_songs` (id, playlist_id, song_id, position) | Playlist 1 rows dropped. Ids preserved. Position = 1..n in rowid order (2.5.2's "date added" playlist order) |
| `sqlite_sequence` | `sqlite_sequence` | Each counter is raised to at least 2.5.2's value, so an id 2.5.2 handed out (and whose folder may linger) is never reissued |
| (none) | `legacy_import` | One row: source, time, counts, the parsed settings, warnings |

### Files

Nothing moves. 3.0 reads audio and covers where 2.5.2 wrote them, via paths
relative to `Documents/`. The importer only lists folders and stats cover
files. `synq.db` is left in place (the app opens a copy, see below).

### AsyncStorage keys

| Key | 3.0 (`LegacySettings`) | Parsing (2.5.2's defaults when missing) |
| --- | --- | --- |
| `theme` | `preferences.accent` | `#rrggbb` → lowercase; otherwise `null` (default blue) |
| `haptic` | `preferences.haptics` | Everything but `'false'` → `true` |
| `shuffle` | `preferences.shuffle` | `'true'` → `true` |
| `loop` | `preferences.repeat` | `'true'` → `'all'` (2.5.2 refilled the queue at the end), else `'off'` |
| `queue` | `session.queueSongIds` | JSON array of track objects. Keeps `id`s that are imported songs, in order; drops the ad (`-2`) and unknown ids |
| `lastTrackIndex` | `session.currentIndex` | Remapped into the filtered queue. If it pointed at a dropped track, uses the next kept one (else the last) |
| `position` (seconds) | `session.positionMs` | × 1000; 0 if the current track changed |
| `sourceType` + `sourceId` | `session.source` | 1 = playlist (id 1 → `{ kind: 'library' }`), 2 album, 3 artist, 4 song; `null` if it no longer exists |
| `addOffset` | `session.insertOffset` | Count of "add to queue" songs after the current one |
| `expiration` | `premiumCache` | `'never'` → lifetime, ISO date → `until`, `'null'`/junk → `null`. A hint only: RevenueCat decides |
| `timePlayed` (seconds) | `ads.listenedMs` | × 1000 |
| `playAd` | `ads.due` | `'true'` → the ad plays at the next transition |
| `importCount` | `bookkeeping.importCount` | |
| `reviewAlreadyRequested` | `bookkeeping.reviewRequested` | |
| `exportNumber` | `bookkeeping.exportNumber` | Export folders are named "batch N" |
| `dbVersion` | `bookkeeping.legacyDbVersion`, `legacy_import.legacy_db_version` | Informational |
| `allowAnalytics` | (ignored) | 2.5.2's analytics toggle was hidden |
| anything else | `unknownKeys` (names only) | |

The app icon needs no migration: iOS remembers the alternate icon by name,
and 3.0 keeps the names (`docs/rewrite.md`, "Variants").

## Edge cases

| Case (seen in 2.5.2 code or data) | Handling | Warning code |
| --- | --- | --- |
| Duplicate `playlistSongs` (2.5.2 allowed adding a song twice) | First occurrence kept; 3.0 holds a song once per playlist | `duplicate-join-rows` |
| Duplicate `artistsAlbums` (`INSERT OR IGNORE` with no unique constraint never ignores), duplicate `albumSongs` | First kept | `duplicate-join-rows` |
| Join rows for a deleted song, artist, album, or playlist (deletes weren't atomic; deleting a playlist left its rows) | Dropped | `orphan-join-rows` |
| Artists and albums with no songs | Kept (2.5.2 kept them) | none |
| Case-variant artists ("BTS", "bts") | Kept as separate rows with their own songs | none |
| An artist named with a comma ("Tyler, The Creator") | Kept whole. Future imports keep it whole too (see `matching.ts`) | none |
| Song rows not in the hidden Library playlist (an import that failed after the row was written; 2.5.2 never showed them) | Imported if their audio file exists; skipped if not (nothing to play, never visible) | `hidden-song-imported`, `hidden-song-skipped` |
| Library playlist empty (damaged database) | Every song row is treated as visible | `library-playlist-empty` |
| Empty `fileName`: 2.5.2 stored `song.audio/mpeg` (it appended the MIME type) and copied to the folder itself | Uses the folder's only non-cover file, else keeps the row with `file_path` null or as recorded | `audio-file-recovered`, `audio-file-missing` |
| `fileName` spelled in NFC, file on disk in NFD (or vice versa) | Matched ignoring Unicode normalization; the on-disk spelling is stored | none |
| Audio file deleted via the Files app | Row kept with the recorded path, so restoring the file brings it back | `audio-file-missing` |
| `#`, `&`, `%`, unicode in file names | Stored verbatim. The app must resolve paths by segments (`documentFile`) | none |
| Only one cover size present | `artwork_version` set; the UI falls back to the other size | `partial-artwork` |
| Folders with no row (a failed delete, a stray folder) | Left alone; never reused thanks to `sqlite_sequence` | `orphan-folders` |
| v1-era database (no `albumSongs.track`) | Tracks `NULL` | `missing-column` |
| Missing tables (damaged or very old database) | Read as empty | `missing-table` |
| Playlist 2 row missing (its likes are still `playlistSongs` rows for id 2) | Liked Songs recreated as id 2 with the default name; likes kept | `liked-playlist-recreated` |
| Loose SQLite affinity (`'3'`, `3.0`, `'2018-04-06'` in INTEGER columns; floats in `duration`) | Coerced once in `read-legacy-db.ts` | `invalid-row` for ids that aren't positive integers |
| Malformed AsyncStorage (bad JSON, a `null` value whose file is gone) | Ignored key by key; never blocks the library import | `async-storage` |
| 2.5.2's Playlists tab `splice(…, 2)` bug hid the playlist sorted after Liked Songs | Nothing to fix in data; 3.0 shows every playlist | none |

### Timestamps

2.5.2 recorded no dates. "Date added" was id order (and `playlistSongs`
rowid order). The importer gives the n rows of each table `added_at` (or
`created_at`/`updated_at`) `now - n + rank` ms in id order. Sorting by date
matches 2.5.2, and everything added in 3.0 sorts after.

## The app's side

### Order at launch

1. Open `library.db` (`openLibraryDb`: `foreign_keys = ON`, WAL) and apply
   Drizzle migrations (`migrateLibraryDb`). The importer needs the
   migrated schema.
2. If `Documents/SQLite/synq.db` exists and `getLegacyImport(db)` is null,
   run the import **before any UI reads the library**. Keep the splash
   screen up, or show a quiet "Updating your library…" screen if it takes
   more than about a second. The write is one synchronous transaction, so
   the JS thread is busy for its duration; reads and the file scan before
   it are async.
3. Write `result.settings` into the kv-store (below).
4. `ensureLikedPlaylist(db)`, then render.

Open the legacy database with `openLegacyDatabaseCopy()`. It copies
`synq.db` and any `-wal`/`-shm` (which can hold 2.5.2's last committed
writes) into the cache and opens the copy, so not even a WAL checkpoint
touches the original. Read AsyncStorage with `readLegacyAsyncStorage` and
`createExpoLegacyFileSystem([Paths.document, legacyAsyncStorageDirectory(bundleId)])`.

### Settings

Settings live in the kv-store (a different SQLite file), so they can't
share the import transaction. `legacy_import.settings` stores them. Make
the kv write idempotent: after an import, or on any launch where the
kv-store lacks `legacyImportApplied = <legacy_import.id>`, write
`getLegacyImport(db).settings` and then set that marker. A crash between
the database commit and the kv write is then repaired on the next launch.
Apply premium-gated preferences (accent) only once premium is known, as
2.5.2 did. Treat `premiumCache` as a hint for the first render.

### Errors

- Any error rolls the transaction back. `library.db` is exactly as before,
  and the next launch retries. Show an error with **Retry** (rerun step 2)
  and a way to contact support. Never continue into an empty library while
  `synq.db` exists and the import hasn't succeeded.
- `LegacyImportError` `target-not-empty` means `library.db` already has
  data but no `legacy_import` row. That should be impossible with the order
  above. Report it; don't overwrite.
- Warnings are informational. Send their codes and counts (not names) to
  analytics so real-world data problems are visible.

### Restoring a 2.5.2 backup zip

2.5.2's backup is a zip of `Documents/` (`SQLite/synq.db`, the media
folders, sometimes a stale `backup.zip` or export folders), with no
AsyncStorage. To restore one in 3.0:

1. Unzip into a temporary folder; `findLegacyBackupRoot(fs, dir)` locates
   the folder containing `SQLite/synq.db`, even if it's nested one level.
2. Run `importLegacyLibrary({ root, source: "backup", asyncStorage: null,
   replaceExisting: true, ... })`. This clears the current library in the
   same transaction.
3. Then replace `Documents/{library,albums,artists,playlists}` with the
   backup's (2.5.2 cleared Documents and unzipped over it). Delete the
   temp folder.

Ids come from the backup, so its folders line up with its rows. Do step 3
only after step 2 succeeds; if step 3 fails, the library points at files
that aren't there yet, so retry the copy.

## Tests

`packages/db/src/legacy/import-legacy-library.test.ts` builds a synthetic
2.5.2 install (`src/testing/synthetic-install.ts`). It uses 2.5.2's exact
DDL (`src/testing/legacy-ddl.ts`, extracted verbatim from `Model.ts`)
filled by 2.5.2's own model SQL, and covers every row of the edge-case
table above. It also checks idempotency, rollback on a failure injected
mid-import, that the legacy tree hashes the same before and after, a
v1-era database, missing tables, and backup roots.
`src/legacy/real-fixture.test.ts` runs the same import on the real
container captured from the 2.5.2 app in the simulator, when present. The
end-to-end upgrade test (install 2.5.2, add data, install 3.0 over it) is
the app's, not this package's.
