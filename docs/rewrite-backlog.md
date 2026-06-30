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
- `pnpm --filter @synq/audio lint` and `pnpm --filter @synq/audio typecheck`
  succeed. `@synq/audio` owns reusable Expo-bound audio duration, metadata,
  supported-file-type, and ingest track-number helpers consumed by `apps/old`.
- `pnpm --filter @synq/old typecheck` succeeds. The playback nullability cluster around
  `PlaybackProvider`, `usePlayer`, `MiniPlayer`, `PausePlayButtons`,
  `ShuffleButton`, and `PlayerController` has been reduced, and `SongList`
  source metadata now has local defaults/guards. The shared list/query UI
  boundary has also been tightened around optional sort state, draggable item
  rendering, and album/artist relation rows. Album, artist, and playlist
  create/edit routes now normalize optional form values to `undefined`, and
  their update controllers expose the optional-field behavior they already had
  at runtime. The home/player playback route now guards missing TrackPlayer
  index, track, and source metadata before updating local playback state or
  rebuilding queues. Backup settings now resolve the Expo document directory
  once before filesystem operations and wrap restore/erase substep errors
  without relying on invalid `Error` constructor overloads. Treat remaining
  errors as a tracked cleanup lane, not a monorepo migration blocker.
  Cover editing now treats missing entity IDs as a transparent placeholder and
  only calls persisted cover loaders when a real ID is available. Premium
  restore now reads the active RevenueCat entitlement and represents lifetime
  purchases with a nullable expiration. Audio and color utility controllers now
  guard missing duration and invalid RGB parses before returning media metadata.
  Import/export and save-to-library controllers now require real cache/file
  paths before filesystem work and avoid creating orphaned library rows when
  imported path data is incomplete. Legacy song controllers/models now guard
  optional row IDs, metadata fields, and filesystem paths locally, and the old
  player no longer depends on `react-native-crossfade-image` for background
  transitions.

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
   - Playlist edit now hydrates its form from `usePlaylistInfoQuery` instead
     of route-local `getPlaylistInfo` controller refresh.
   - Playlist edit now writes name and cover changes through the Drizzle-backed
     library entity repository instead of the legacy playlist controller.
   - Playlist delete now removes playlist rows and joins through the
     Drizzle-backed library entity repository instead of the legacy playlist
     controller.
   - Playlist export now reads songs through the Drizzle-backed library song
     repository instead of the legacy playlist controller.
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
   - Album reorder now reads songs from `useAlbumSongsQuery` and writes order
     changes through a Drizzle-backed album-song repository instead of
     route-local controller fetch/update loops.
   - Album edit now hydrates album fields and artist relations from
     `useAlbumInfoQuery` instead of route-local `getAlbumInfo` and
     `getArtistsFromAlbum` controller refresh.
   - Album edit now writes name, year, and cover changes through the
     Drizzle-backed library entity repository instead of the legacy album
     controller.
   - Album delete now removes album rows and joins through the Drizzle-backed
     library entity repository instead of the legacy album controller.
   - Album export now reads songs through the Drizzle-backed library song
     repository instead of the legacy album controller.
   - Artist detail content has started. `app/artist/artist.tsx` now reads
     artist info, songs, and albums from `useArtistInfoQuery`,
     `useArtistSongsQuery`, and `useArtistAlbumsQuery` instead of listening for
     `ARTIST_MODIFIED`, `ARTIST_TOGGLED_ON_SONG`, album events, or
     `PLAYLIST_SONGS_IMPORTED`.
   - Artist edit now hydrates its form from `useArtistInfoQuery` instead of
     route-local `getArtistInfo` controller refresh.
   - Artist edit now writes name and cover changes through the Drizzle-backed
     library entity repository instead of the legacy artist controller.
   - Artist delete now removes artist rows and joins through the Drizzle-backed
     library entity repository instead of the legacy artist controller.
   - Artist export now reads songs through the Drizzle-backed library song
     repository instead of the legacy artist controller.
   - Cover picking for album, artist, playlist, and song edit/create flows now
     lives in the images feature repository instead of the legacy image
     controller.
   - Album, artist, and playlist edit cover previews now receive live-query
     image props and no longer ask `EditCover` to fetch legacy entity cover
     directories.
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
   - Artist create now writes through a Drizzle-backed library entity
     repository and stores cover art by image hash instead of calling the
     legacy artist controller from the route.
   - Playlist and album create now share the same Drizzle-backed library entity
     repository and controlled form inputs instead of route-level legacy
     controller create calls.
   - Import song rows now receive artist/album display metadata through
     immutable `results` updates when import relations are toggled, so
     `Song.tsx` no longer listens for `ARTIST_TOGGLED_ON_SONG` or
     `ALBUM_TOGGLED_ON_SONG`.
   - Song edit relation refresh now keys off focus refresh and `editSong`
     context updates from the add/remove rows instead of
     `ARTIST_TOGGLED_ON_SONG` or `ALBUM_TOGGLED_ON_SONG` listeners.
   - Song edit saved-library relation hydration now reads artists and albums
     through the Drizzle-backed library song repository instead of legacy
     artist/album controllers.
   - Player and playback queue display song hydration now reads through the
     Drizzle-backed library song repository instead of `SongController`.
   - Library song cover resolution now lives in the Drizzle-backed song
     repository and is shared by playback track creation, mini player, player
     edit, song edit, and song sheets instead of routing through
     `SongController` cover helpers.
   - Import-song cover fallback, import-result removal, and song list key
     generation now live in feature-level helpers instead of requiring
     `SongController` from UI components.
   - Import song edit saves now run through the import feature helper with
     hash-backed album cover updates, removing the final app-level
     `SongController` import.
   - Playlist membership checks and mutations now use the Drizzle-backed
     library entity repository from song options, import controls, and playlist
     rows instead of `PlaylistController`.
   - Library song deletion now runs through the Drizzle-backed song repository
     from import controls and song options, including relation cleanup and
     filesystem removal instead of `LibraryController`.
   - Album and artist add/remove row actions now mutate song/album join tables
     through Drizzle-backed repositories instead of `AlbumController` and
     `ArtistController`.
   - Album edit artist relation refresh now keys off focus refresh and
     `editAlbum` context updates from add/remove rows instead of
     `ARTIST_TOGGLED_ON_ALBUM`.
   - Album and artist row covers now render from Drizzle-backed live query
     image props instead of `ALBUM_IMAGE_MODIFIED` or `ARTIST_IMAGE_MODIFIED`
     listeners.
   - Playlist row covers now render from Drizzle-backed live query image props
     instead of `PLAYLIST_IMAGE_MODIFIED` listeners.
   - Playlist, album, and artist sheet headers now render cover art from the
     action-sheet entity image props instead of legacy cover controller
     filesystem lookups.
   - Song list page covers now receive playlist, album, and artist cover paths
     from their Drizzle-backed detail queries instead of listening for
     `PLAYLIST_IMAGE_MODIFIED`, `ALBUM_IMAGE_MODIFIED`, or
     `ARTIST_IMAGE_MODIFIED`.
   - Song list page cover rendering now uses those live-query image props
     directly and no longer falls back to legacy cover controller filesystem
     reads.
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
   - Playback queue refresh no longer uses an event bus; `PlaybackProvider`
     exposes a queue revision signal that reloads queue UI from TrackPlayer.
   - Playback queue assembly now reads playlist, album, and artist source
     songs through the Drizzle-backed library song repository instead of legacy
     entity controllers.
   - No app event bus modules remain; `apps/old/src/events` has been removed.
   - Next target: continue strict-null/typecheck cleanup, starting with
     `SongList` source metadata defaults and import/library controller
     nullability.

4. Split ingest/media.
   - Current checkpoint files: `apps/old/src/features/ingest`,
     `apps/old/src/features/images`, and `shared/audio`.
   - `shared/audio` now owns reusable audio duration, metadata, supported file
     types, and track-number parsing used by the ingest workflow.
   - Done: move file-browser selection, Effect/Zustand ingest workflow, and
     Drizzle song persistence into `apps/old/src/features/ingest`.
   - Done: keep `apps/old/src/lib/ingest.ts` and
     `apps/old/src/hooks/use-ingest.ts` as compatibility shims while callers
     migrate to the feature path.
   - Done: move hashed cover image persistence and path helpers into
     `apps/old/src/features/images/repository/image-repository.ts`, with
     `apps/old/src/lib/image-utils.ts` kept as a legacy controller shim.
   - Keep legacy cover-folder writes in `ImageController` and the legacy
     entity controllers until their filesystem/database writes can move behind
     feature repositories.
   - Future target packages/folders: `shared/db` repositories and
     `apps/new/src/features/ingest`.
   - Keep Effect at workflow boundaries; keep UI state minimal and observable.

5. Break up global state.
   - `apps/old/src/context/GlobalProvider.js` owns too many concerns.
   - Split into notifications, selections, sheets, ads, and ingest/import state.
   - Prefer typed hooks/stores with narrow ownership.
   - Done: global loading/progress/import-ad overlay state now lives in
     `apps/old/src/features/app-shell/context/GlobalProgressProvider.tsx`
     instead of `GlobalProvider`.
   - Done: notification queue/modal state and actions now live in
     `apps/old/src/features/notifications/context/NotificationsProvider.tsx`
     instead of `GlobalProvider`.
   - Done: overlay and info-modal visibility now live in
     `apps/old/src/features/app-shell/context/AppShellProvider.tsx` instead of
     `GlobalProvider`.
   - Done: unused sheet refs and stale modal/control flags were removed from
     `GlobalProvider` after auditing that no active callers used them.
   - Done: selected-song UI state now lives in
     `apps/old/src/features/selection/context/SelectionProvider.tsx` instead of
     `GlobalProvider`.
   - Done: playback ad state now lives in
     `apps/old/src/features/playback/context/PlaybackAdProvider.tsx` instead
     of `GlobalProvider`.
   - Done: import flow state now lives in
     `apps/old/src/features/import/context/ImportFlowProvider.tsx` instead of
     `GlobalProvider`.
   - Done: import session state (`results`, transfer progress, loading,
     export-disabled state, selected transfer row, and Wi-Fi transfer address)
     now lives in `ImportFlowProvider` instead of `GlobalProvider`.
   - Done: edit/action-sheet state now lives in
     `apps/old/src/features/action-sheet/context/ActionSheetProvider.tsx`, and
     the legacy `GlobalProvider` has been removed.
   - In progress: playback orchestration is moving out of the home screen into
     feature hooks. Avoid import results and edit targets until their owning
     feature boundaries are clearer.

6. Extract playback orchestration.
   - Done: home playback side effects now live in
     `apps/old/src/features/playback/hooks/use-home-playback-effects.ts`
     instead of directly inside `apps/old/app/(tabs)/index.tsx`.
   - Done: `use-home-playback-effects.ts` now delegates to focused hooks for
     player persistence, ad timing, and remote event handling.
   - Done: playback state provider now lives at
     `apps/old/src/features/playback/context/PlaybackProvider.tsx` instead of
     the legacy generic context folder.
   - Done: legacy `usePlayer` now lives at
     `apps/old/src/features/playback/hooks/use-player.ts` so queue mutation and
     skip behavior are owned by the playback feature.
   - Done: the remaining live `PlayerController` helpers have been split into
     feature-owned playback factories/services, and the stale legacy controller
     file has been removed.
   - Done: track creation and artwork helpers now live in
     `apps/old/src/features/playback/lib/track-factory.ts`, separate from
     TrackPlayer queue side effects.
   - Done: next-up source lookup and pagination now live in
     `apps/old/src/features/playback/lib/playback-queue-service.ts` instead of
     inside `use-player.ts`.
   - Done: player setup/restore now lives in
     `apps/old/src/features/playback/lib/player-setup-service.ts` with typed
     playback state restore callbacks.
   - Done: TrackPlayer queue mutations now live in
     `apps/old/src/features/playback/lib/player-queue-actions-service.ts`, so
     `use-player.ts` wires playback context into typed queue actions.
   - Done: ad-gated playback commands now share
     `apps/old/src/features/playback/hooks/use-ad-gated-playback-command.ts`
     for skip buttons, remote next/previous, and song-row playback while
     preserving the song-row post-ad queue behavior.
   - Done: command-driven and timing-driven ad side effects now share
     `apps/old/src/features/playback/hooks/use-playback-ad-actions.ts`, while
     timing decisions remain inside `use-playback-ad-timing-effects.ts`.
   - Done: song option add-to-queue now calls `usePlayer().addSongToQueue`
     instead of importing track creation helpers directly.
   - Done: song rows now call `usePlayer().playSong` and
     `usePlayer().addSongToQueue` instead of importing track creation or
     TrackPlayer play helpers directly.
   - Done: song rows now read active track/index through
     `apps/old/src/features/playback/hooks/use-active-queue-track.ts` instead
     of calling TrackPlayer directly.
   - Done: playback source persistence now lives in
     `apps/old/src/features/playback/hooks/use-playback-source-persistence.ts`
     instead of directly inside `SongList`.
   - Done: song press playback orchestration now lives in
     `apps/old/src/features/playback/hooks/use-song-playback-handler.ts`, so
     `SongList` no longer owns ad-gated play/add queue behavior.
   - Done: queue drag row rendering now lives in
     `apps/old/src/components/lists/song/DraggableSongItem.tsx` instead of
     inline inside `SongList`.
   - Done: queue reorder now calls `usePlayer().moveQueueSong`, which delegates
     to the playback queue action service instead of calling TrackPlayer
     directly from the queue screen.
   - Done: queue display loading, active-track scrolling, fade-in animation,
     and drag-end state updates now live in
     `apps/old/src/features/playback/hooks/use-playback-queue-display.ts`.
   - Done: queue footer playback controls now live in
     `apps/old/src/features/playback/components/QueueControls.tsx`.
   - Done: queue song list panel now lives in
     `apps/old/src/features/playback/components/QueueSongListPanel.tsx`, so
     `app/queue.tsx` is mostly route composition.
   - Done: the remaining queue route shell now lives in
     `apps/old/src/features/playback/components/QueueScreen.tsx`; the Expo
     route only exports the feature screen.
   - Done: pause/play and time scrub seek commands now route through
     `usePlayer()` and the playback queue action service instead of direct
     TrackPlayer calls in UI controls.
   - Done: delete flows in import controls and song options now call
     `usePlayer().removeSongsFromQueue` instead of duplicating TrackPlayer
     queue scans/removals.
   - Done: backup erase/reset now calls `usePlayer().resetPlayer`; no
     `app` or generic `components` files import TrackPlayer directly.
   - Done: remote playback play/pause/seek/reset commands now call
     `usePlayer()` actions instead of importing the concrete TrackPlayer
     command object in the remote-event hook.
   - Done: premium ad skip now calls the playback queue action service instead
     of importing TrackPlayer directly in the ad-actions hook.
   - Done: playback hooks now read active queue index and queue contents
     through the playback queue action service instead of importing the
     TrackPlayer command object directly.
   - Done: track playback queue mutation now lives in the playback queue action
     service, leaving the track service focused on ad-track construction and
     track factory re-exports.
   - Done: the obsolete player-track compatibility service has been removed;
     artwork callers import the track factory directly, and ad playback now
     lives in `apps/old/src/features/playback/lib/playback-ad-service.ts`.
   - Next safe slice: continue moving remaining TrackPlayer calls in UI
     components behind playback feature APIs.

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
   - Done: replace `QUEUE_UPDATED` with a PlaybackProvider queue revision
     signal read by the queue screen.
   - Done: remove the remaining playback event module.

## Typecheck Cleanup Order

1. Playback:
   - Done: give `PlaybackProvider` non-null sort/order defaults matching the
     context contract.
   - Done: guard undefined active track/index/state values in player controls.
   - Done: skip queue rebuilds until playback source metadata is available.

2. Song lists:
   - Done: normalize `SongList` source metadata defaults and guards before
     calling playback queue helpers.
   - Done: tighten shared list/query component nullability in `List`,
     `QueryWrapper`, `AlbumItem`, `ArtistItem`, and the album header.
   - Done: normalize album, artist, and playlist create/edit form optional
     values, remove duplicate textbox style overwrites, and tighten the
     matching update controller contracts.
   - Done: guard missing active track/index/source metadata in the home tab and
     player route playback UI.
   - Done: normalize backup/restore document-directory and error wrapping
     boundaries.
   - Done: guard optional cover IDs in `EditCover` and fix the song edit
     textbox style overwrite.
   - Done: tighten premium restore state around active RevenueCat entitlements
     and nullable lifetime expirations.
   - Done: tighten audio duration and image color luminance helpers.
   - Done: guard import/export and save-to-library filesystem paths before
     sharing, copying, or inserting library rows.
   - Done: clear the remaining old-app source strict-null errors in legacy
     song/album/artist/playlist controllers and models.
   - Done: replace the broken `react-native-crossfade-image` dependency with a
     local typed player background fade component.
   - Next: treat `pnpm --filter @synq/old typecheck` as a required guardrail
     while continuing feature extraction and reactive state migration.

## Guardrails

- Commit after each coherent migration checkpoint.
- Keep `pnpm lint` passing.
- Run an old-app Expo export or native build smoke after path/config changes.
- Do not introduce Convex or Ruby product dependencies.
- Do not remove `apps/old` until `apps/new` has equivalent verified behavior.
