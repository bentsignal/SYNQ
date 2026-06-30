# SYNQ Rewrite Backlog

This branch uses `apps/old` as the runnable reference app and `apps/new` as the
rewrite target. Keep old working while moving behavior into smaller, typed,
feature-oriented packages.

## Current Verification

- `pnpm install` succeeds for the workspace.
- `pnpm lint` succeeds through Turbo with warnings only.
- `pnpm --filter @synq/old exec expo export --platform ios --output-dir dist-export-smoke`
  succeeds, proving the old app still bundles from `apps/old`.
- `pnpm --filter @synq/db lint` and `pnpm --filter @synq/db typecheck`
  succeed. `@synq/db` is now the Drizzle schema, migration, and runtime DB
  package consumed by `apps/old`.
- `pnpm --filter @synq/old typecheck` fails on pre-existing strict-null and
  third-party type issues. Treat this as a tracked cleanup lane, not a monorepo
  migration blocker.

## Priority Lanes

1. Stabilize database ownership.
   - `shared/db` now owns Drizzle schema, migrations, and database init.
   - Retire legacy `Model.createTables()` / manual SQL setup after validating
     backup and restore flows.
   - Audit legacy models for writes to removed columns such as `artists`,
     `album`, `genre`, `fileName`, and `edited`.

2. Build typed repositories and reactive query hooks.
   - Start with songs because they touch player, library, import, edit, and
     queue flows.
   - `apps/old/src/features/library/hooks/use-library-songs-query.ts` now
     owns the first list-level library songs live query.
   - `apps/old/src/features/library/repository/song-metadata-repository.ts`
     now owns saved-library title and relation writes for song edits.
   - Add hooks such as `useSongRelationsQuery` and `usePlaylistSongsQuery`.
   - Avoid per-row live queries in large lists.

3. Replace event buses.
   - Current buses live under `apps/old/src/events`.
   - Convert one domain at a time to database-backed reactive queries or typed
     domain actions.
   - Song/library refresh has started. `Songs.tsx` no longer listens for
     `SONG_DELETED` or `PLAYLIST_SONGS_IMPORTED`; it receives sorted,
     filtered library data from `useLibrarySongsQuery`.
   - `SONG_INFO_MODIFIED` has been removed from the saved-library edit path;
     metadata edits now update `songs`, `artistSongs`, and `albumSongs`.
   - Saved-library cover edits now update `songs.coverImage` or
     `albums.coverImage`, and `Song.tsx` renders cover art from the
     list-level live query instead of `SONG_COVER_MODIFIED` or
     `ALBUM_IMAGE_MODIFIED`.
   - Playlist library refresh has started. `Playlists.tsx` now reads from
     `useLibraryPlaylistsQuery` instead of listening for `PLAYLIST_CREATED`,
     `PLAYLIST_DELETED`, or `PLAYLIST_SONGS_IMPORTED`.
   - Playlist detail content has started. `app/playlist/playlist.tsx` now
     reads its header info from `usePlaylistInfoQuery` and its songs from
     `useLibrarySongsQuery` instead of listening for `PLAYLIST_CONTENT_MODIFIED`,
     `PLAYLIST_SONG_COUNT_MODIFIED`, or `PLAYLIST_NAME_MODIFIED`.
   - Album library refresh has started. `Albums.tsx` now reads from
     `useLibraryAlbumsQuery` instead of listening for `ALBUM_CREATED`,
     `ALBUM_DELETED`, `ALBUM_MODIFIED`, or `PLAYLIST_SONGS_IMPORTED`.
   - Artist library refresh has started. `Artists.tsx` now reads from
     `useLibraryArtistsQuery` instead of listening for `ARTIST_CREATED`,
     `ARTIST_DELETED`, `ARTIST_MODIFIED`, or `PLAYLIST_SONGS_IMPORTED`.
   - Album detail content has started. `app/album/album.tsx` now reads album
     info/artists from `useAlbumInfoQuery` and songs from `useAlbumSongsQuery`
     instead of listening for `ALBUM_MODIFIED`, `ALBUM_TOGGLED_ON_SONG`, or
     `ALBUM_REORDERED`.
   - Artist detail content has started. `app/artist/artist.tsx` now reads
     artist info, songs, and albums from `useArtistInfoQuery`,
     `useArtistSongsQuery`, and `useArtistAlbumsQuery` instead of listening for
     `ARTIST_MODIFIED`, `ARTIST_TOGGLED_ON_SONG`, album events, or
     `PLAYLIST_SONGS_IMPORTED`.
   - Album and artist row metadata now renders from props; `AlbumItem` no
     longer listens for `ALBUM_MODIFIED`, and `ArtistItem` no longer listens
     for `ARTIST_MODIFIED`.
   - Playlist row metadata and counts now render from props; `PlaylistItem` no
     longer listens for `PLAYLIST_NAME_MODIFIED` or
     `PLAYLIST_SONG_COUNT_MODIFIED`.
   - Add-to-playlist now reads from `useLibraryPlaylistsQuery` with
     membership prioritization instead of listening for `PLAYLIST_CREATED`.
   - Add-to-album now reads from `useLibraryAlbumsQuery` with membership
     prioritization instead of listening for `ALBUM_CREATED`.
   - Add-to-artist now reads from `useLibraryArtistsQuery` with membership
     prioritization and source tagging instead of listening for
     `ARTIST_CREATED`.
   - Playlist, album, and artist create screens no longer emit now-unused
     `PLAYLIST_CREATED`, `ALBUM_CREATED`, or `ARTIST_CREATED` events.
   - Import song rows now receive artist/album display metadata through
     immutable `results` updates when import relations are toggled, so
     `Song.tsx` no longer listens for `ARTIST_TOGGLED_ON_SONG` or
     `ALBUM_TOGGLED_ON_SONG`.
   - Song edit relation refresh now keys off focus refresh and `editSong`
     context updates from the add/remove rows instead of
     `ARTIST_TOGGLED_ON_SONG` or `ALBUM_TOGGLED_ON_SONG` listeners.
   - Album edit artist relation refresh now keys off focus refresh and
     `editAlbum` context updates from add/remove rows instead of
     `ARTIST_TOGGLED_ON_ALBUM`.
   - Album and artist row covers now render from Drizzle-backed live query
     image props instead of `ALBUM_IMAGE_MODIFIED` or `ARTIST_IMAGE_MODIFIED`
     listeners.
   - Playlist row covers now render from Drizzle-backed live query image props
     instead of `PLAYLIST_IMAGE_MODIFIED` listeners.
   - Song list page covers now receive playlist, album, and artist cover paths
     from their Drizzle-backed detail queries instead of listening for
     `PLAYLIST_IMAGE_MODIFIED`, `ALBUM_IMAGE_MODIFIED`, or
     `ARTIST_IMAGE_MODIFIED`.
   - Now-unused playlist, album, and artist image modification emits/types have
     been removed; image refresh is driven by Drizzle writes plus live queries.
   - Now-unused `ALBUM_REORDERED` emit/types have been removed from the reorder
     flow; album song ordering is read from the live album-song query.
   - Album bus has been removed after list, detail, row metadata, cover, delete,
     and reorder refresh moved off album events.
   - Artist bus has been removed after list, detail, row metadata, cover, and
     delete refresh moved off artist events.
   - Library category reset no longer uses `PLAYLIST_SONGS_IMPORTED`; the
     category selector is controlled by the library screen, and library data
     refreshes through live queries after imports, backup restores, and erases.
   - Playlist bus has been removed after list, detail, row metadata, cover,
     delete, import, backup, and add/remove flows moved off playlist events.
   - Song bus has been removed after saved-library rows, edit flows, cover
     edits, and deletes moved onto reactive data or direct local state updates.
   - Import finish command no longer uses an event bus; the import footer now
     requests completion through a narrow GlobalProvider command consumed by
     the save screen.
   - Next target: replace the playback queue event bus with queue state sourced
     from TrackPlayer or a focused playback store.

4. Split ingest/media.
   - Current checkpoint files: `apps/old/src/hooks/use-ingest.ts`,
     `apps/old/src/lib/ingest.ts`, `apps/old/src/lib/audio-utils.ts`, and
     `apps/old/src/lib/image-utils.ts`.
   - Target packages/folders: `shared/audio`, `shared/db`, and
     `apps/new/src/features/ingest`.
   - Keep Effect at workflow boundaries; keep UI state minimal and observable.

5. Break up global state.
   - `apps/old/src/context/GlobalProvider.js` owns too many concerns.
   - Split into notifications, selections, sheets, ads, and ingest/import state.
   - Prefer typed hooks/stores with narrow ownership.

6. Extract playback orchestration.
   - `apps/old/app/(tabs)/index.tsx` still coordinates player setup, ad timing,
     import entrypoints, and UI.
   - Move playback and ad timing into hooks/services before rebuilding the home
     screen in `apps/new`.

7. Build feature-first app structure.
   - Prefer `features/<domain>/{components,hooks,queries,repository,effects}`.
   - Keep reusable UI in `shared/ui-mobile` only after it is genuinely shared.
   - Avoid moving old code wholesale into shared packages.

## Suggested Agent Tasks

- Worker A: create song repository/query hooks and convert library songs screen
  away from manual controller refresh. The first library list hook is complete;
  continue with cover/image and playlist-detail query hooks.
- Worker B: scaffold `apps/new` Expo app after `apps/old` has a committed
  monorepo baseline; do not copy old monolithic components.
- Worker C: fix typecheck by domain, starting with `SongType` nullability and
  player `undefined` handling.

## Event Bus Removal Order

1. Song/library:
   - Done: replace `apps/old/src/components/library/Songs.tsx` refresh
     listeners with a single `useLibrarySongsQuery({ query, sort, order })`.
   - Done: saved library row metadata is now prop-derived from the list query,
     not patched by `SONG_INFO_MODIFIED`, `ARTIST_TOGGLED_ON_SONG`, or
     `ALBUM_TOGGLED_ON_SONG`.
   - Done: saved library metadata edits write through a feature repository into
     the Drizzle-owned `songs`, `artistSongs`, and `albumSongs` tables.
   - Done: saved library cover edits write through the same feature repository
     into Drizzle image references, and saved library rows render cover art
     from `useLibrarySongsQuery`.
   - Done: remove import-only `ARTIST_TOGGLED_ON_SONG` and
     `ALBUM_TOGGLED_ON_SONG` listeners from `apps/old/src/components/song/Song.tsx`.
   - Done: move `app/song/edit/edit.tsx` relation refresh to focus refresh
     plus `editSong` context updates from relation list rows.
   - Done: remove the remaining emit-only song event bus module.

2. Playlist:
   - Done: add `useLibraryPlaylistsQuery` for the list-level library playlist
     screen.
   - Done: add `usePlaylistInfoQuery(id)` for playlist detail header state.
   - Reuse `useLibrarySongsQuery` for playlist detail songs while deciding
     whether a playlist-specific wrapper is still useful.
   - Done: remove `PLAYLIST_NAME_MODIFIED` and
     `PLAYLIST_SONG_COUNT_MODIFIED` display listeners from playlist rows.
   - Done: add membership prioritization to `useLibraryPlaylistsQuery` and use
     it in `app/playlist/add.tsx` instead of the `PLAYLIST_CREATED` listener.
   - Done: remove the now-unused `PLAYLIST_CREATED` emit from
     `app/playlist/create.tsx`.
   - Done: render playlist row cover art from live query props instead of
     `PLAYLIST_IMAGE_MODIFIED` listeners.
   - Done: render playlist detail page cover art from `usePlaylistInfoQuery`
     instead of `PLAYLIST_IMAGE_MODIFIED`.
   - Done: remove now-unused `PLAYLIST_IMAGE_MODIFIED` emits and event types.
   - Done: remove the broad `PLAYLIST_SONGS_IMPORTED` invalidation/reset
     pattern from import, backup, library, and category selector flows.
   - Done: remove count/name/content/delete emits and the remaining playlist
     event bus module.

3. Album:
   - Done: add `useLibraryAlbumsQuery` for the list-level library album screen.
   - Done: add membership prioritization to `useLibraryAlbumsQuery` and use it
     in `app/album/add.tsx` instead of the `ALBUM_CREATED` listener.
   - Done: remove the now-unused `ALBUM_CREATED` emit from
     `app/album/create.tsx`.
   - Done: add `useAlbumInfoQuery` and `useAlbumSongsQuery` for the album
     detail screen.
   - Done: remove `ALBUM_MODIFIED` display listeners from album rows.
   - Done: render album row cover art from live query props instead of
     `ALBUM_IMAGE_MODIFIED` listeners.
   - Done: render album detail page cover art from `useAlbumInfoQuery` instead
     of `ALBUM_IMAGE_MODIFIED`.
   - Done: remove now-unused `ALBUM_IMAGE_MODIFIED` emits and event types.
   - Done: remove now-unused `ALBUM_REORDERED` emits and event types.
   - Done: remove the remaining emit-only album event bus module.
   - Add album order/image queries where the reorder and cover flows still
     need Drizzle-backed state.
   - Replace `ALBUM_*` events, including `ALBUM_TOGGLED_ON_SONG` and
     `ALBUM_REORDERED`.

4. Artist:
   - Done: add `useLibraryArtistsQuery` for the list-level library artist
     screen.
   - Done: add membership prioritization and source tagging to
     `useLibraryArtistsQuery`, and use it in `app/artist/add.tsx` instead of
     the `ARTIST_CREATED` listener.
   - Done: remove the now-unused `ARTIST_CREATED` emit from
     `app/artist/create.tsx`.
   - Done: add `useArtistInfoQuery`, `useArtistSongsQuery`, and
     `useArtistAlbumsQuery` for the artist detail screen.
   - Done: remove `ARTIST_MODIFIED` display listeners from artist rows.
   - Done: remove `ARTIST_TOGGLED_ON_ALBUM` listener/emit path from album edit
     relation refresh.
   - Done: render artist row cover art from live query props instead of
     `ARTIST_IMAGE_MODIFIED` listeners.
   - Done: render artist detail page cover art from `useArtistInfoQuery`
     instead of `ARTIST_IMAGE_MODIFIED`.
   - Done: remove now-unused `ARTIST_IMAGE_MODIFIED` emits and event types.
   - Done: remove the remaining emit-only artist event bus module.
   - Add artist relation/image queries where add/edit/cover flows still need
     Drizzle-backed state.
   - Replace artist edit/list/detail listeners.

5. Import command bus:
   - Done: replace `TRIGGER_FINISH` with a GlobalProvider import finish
     request consumed by the save screen.

6. Playback bus:
   - Replace `QUEUE_UPDATED` with a TrackPlayer-backed queue hook/store rather
     than Drizzle.

## Guardrails

- Commit after each coherent migration checkpoint.
- Keep `pnpm lint` passing.
- Run an old-app Expo export or native build smoke after path/config changes.
- Do not introduce Convex or Ruby product dependencies.
- Do not remove `apps/old` until `apps/new` has equivalent verified behavior.
