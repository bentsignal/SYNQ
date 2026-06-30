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
   - Next target: remove remaining row-level cover and import-only metadata
     listeners from `Song.tsx` by moving cover image state into database-backed
     image references or a typed import edit store.

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
   - Next: remove `SONG_COVER_MODIFIED` and `ALBUM_IMAGE_MODIFIED` from
     `apps/old/src/components/song/Song.tsx`.
   - Then remove `apps/old/src/events/song`.

2. Playlist:
   - Add `usePlaylistsQuery`, `usePlaylistInfoQuery(id)`, and
     `usePlaylistSongsQuery(id, query, sort, order)`.
   - Replace count/name/image/content listeners and remove the broad
     `PLAYLIST_SONGS_IMPORTED` invalidation pattern.

3. Album:
   - Add album list/detail/song/order/image queries.
   - Replace `ALBUM_*` events, including `ALBUM_TOGGLED_ON_SONG` and
     `ALBUM_REORDERED`.

4. Artist:
   - Add artist list/detail/relation/image queries over `artists`,
     `artistSongs`, and `artistsAlbums`.
   - Replace artist edit/list/detail listeners.

5. Import command bus:
   - Replace `TRIGGER_FINISH` with save-screen owned workflow state or a typed
     import store.

6. Playback bus:
   - Replace `QUEUE_UPDATED` with a TrackPlayer-backed queue hook/store rather
     than Drizzle.

## Guardrails

- Commit after each coherent migration checkpoint.
- Keep `pnpm lint` passing.
- Run an old-app Expo export or native build smoke after path/config changes.
- Do not introduce Convex or Ruby product dependencies.
- Do not remove `apps/old` until `apps/new` has equivalent verified behavior.
