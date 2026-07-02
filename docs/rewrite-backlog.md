# SYNQ Rewrite Backlog

This branch uses `apps/old` as the runnable reference app and `apps/new` as the
rewrite target. Keep old working while moving behavior into smaller, typed,
feature-oriented packages.

## Finish-Line Checklist

Use this checklist to track convergence. The detailed backlog below records the
work already done; this section is the shorter "are we close yet?" dashboard.

### Phase 1: Rewrite Foundation

- [x] Create `rewrite-2` from the completed `rewrite-1` checkpoint.
- [x] Move the project into a Turborepo workspace with `apps/*` and `shared/*`.
- [x] Keep `apps/old` runnable as the reference implementation.
- [x] Create `apps/new` as the rewrite target.
- [x] Extract shared database ownership into `shared/db`.
- [x] Extract reusable audio/metadata helpers into `shared/audio`.
- [x] Keep root `pnpm typecheck`, `pnpm lint`, and old-app iOS export smoke
  working as the normal validation gate.

### Phase 2: Old-App Stabilization And De-Spaghetti

- [x] Remove app-level event emitters and replace refresh flows with typed
  feature actions or reactive Drizzle queries.
- [x] Remove legacy controller/model layers from the main app path.
- [x] Isolate AsyncStorage behind feature-level storage services.
- [x] Move import, backup, premium, export, action-sheet, playback, and library
  side effects out of large UI components/hooks where safe.
- [ ] Finish slimming remaining large hooks and providers.
  - Import/save flows are smaller but still contain orchestration and timers.
  - Playback still needs a deeper pass around state ownership and queue/player
    synchronization.
  - Library query hooks are cleaner, but collection list helpers still need the
    same treatment as song query helpers.
- [ ] Finish repository/query coverage for all high-traffic library workflows.
  - Songs, playlists, albums, and artists have Drizzle-backed query coverage.
  - Remaining gaps should be audited from screens/forms rather than assumed.
- [ ] Add focused regression coverage or deterministic smoke helpers for the
  highest-risk domains: import, save-to-library, backup restore, playback queue,
  and library edits.

### Phase 3: New App Build-Out

- [x] Define the `apps/new` feature map before moving more UI.
  - App shell/navigation: route shell exists with root stack, tabs, feature
    stack placeholders, thin route files, and a replacement-oriented Home route
    with live library/playback state plus import, settings, premium, player, and
    queue entry points.
  - Library: first reactive Drizzle summary, searchable/sortable song surface,
    collection previews, user-facing library home copy and empty states,
    song/playlist/album/artist detail routes with song and collection playback
    entry points, playlist/album/artist create/edit flows, collection song add/remove flows, durable
    album/playlist/artist song reorder flows, and collection cover/profile image
    picking, persistence, and thumbnail rendering exist.
  - Playback: explicit session state, queue/player screens, an Expo Audio
    adapter for play/pause/seek/skip, native status/progress sync,
    filesystem-backed session persistence, queue reordering, and player
    progress controls, active-track removal handling, queue clearing, a
    tab-shell mini player for active tracks, and
    persisted Premium/free-listening ad gate state with bundled ad audio
    playback exist. Remote command semantics for play/pause/next/previous/seek,
    queue-ended, and error handling now exist behind the provider boundary;
    Expo Audio is installed/configured for background playback and is now the
    active playback adapter; player/queue screens now consume saved theme state
    while keeping the ad-break warning treatment distinct. Lock-screen event
    wiring and manual smoke coverage are next.
  - Import/ingest: route-per-step import shell, session state, file picker,
    Wi-Fi transfer route/server, cache staging, metadata/duration extraction,
    preview/save screens, staged metadata editing, and Drizzle draft-to-library
    save/discard commands with durable audio file movement and cover/artwork
    persistence exist behind Premium gates; import stack/home/files/save/result,
    shared staged-song preview lists, and Premium gate surfaces now consume
    saved theme state, file-pick/remove/save/discard/edit actions use
    preference-aware haptics, and staged-file cleanup now runs when songs are
    removed or discarded. Staged import sessions now persist a validated
    manifest across route/provider remounts while keeping staged audio in cache.
    Wi-Fi transfer now falls back across a small local port range and reports
    the active port. Deeper manual smoke is next.
  - Backup/restore: feature-owned backup screen and command-state boundary
    exist; backup archive/share, restore document picking/unzip/reset, and
    erase document cleanup/database reset are connected. The backup command
    screen now consumes saved theme state and preference-aware haptics for
    command start/success/failure/reset feedback. Manual restore smoke and
    edge-case hardening are next.
  - Premium/settings: settings home, premium screen, customization/backup
    routes, privacy/support routes, live RevenueCat pricing, purchase, restore
    commands, an app-wide entitlement provider, persisted customization
    preferences for theme, app icon, haptics, and analytics, and saved-theme
    consumption across navigation, loading/placeholder states, settings,
    library home/shared list components,
    library create/edit/detail/add-song surfaces, playback player/queue
    surfaces, and the backup command surface, import home/files, and import
    Premium gate surfaces exist;
    native app icon assets/config and a settings-owned native icon service are
    wired; haptic feedback now flows through a preference-aware settings hook
    for customization, playback, queue, collection save actions, collection
    detail song mutations, library song-list sort controls, song detail
    play/queue actions, add-to-collection mutations, backup command feedback,
    privacy/support actions, and import file-pick/remove/save/discard/edit
    actions. Native-build icon/haptics smoke and remaining non-theme feature
    polish are next.
- [ ] Move reusable feature logic from `apps/old` into shared app-local modules
  that `apps/new` can consume without copying UI spaghetti.
- [ ] Build the `apps/new` screens against reactive Drizzle query hooks instead
  of event/callback refresh flows.
- [ ] Rebuild playback as an explicit state machine/service boundary rather
  than context-wide imperative state.
- [ ] Rebuild import and ingest with Effect-style orchestration where it buys
  clarity, cancellation, and typed errors.
- [ ] Replace copied old UI with slim components plus feature hooks/services.
- [ ] Make `apps/new` pass typecheck, lint, and iOS export smoke.

### Phase 4: Cutover Readiness

- [ ] Manually smoke the old reference app after every risky migration slice.
- [ ] Manually smoke the new app feature-by-feature once screens exist:
  - Library browsing/search/sort
  - Album/artist/playlist detail and edit flows
  - Import files and Wi-Fi import
  - Save-to-library and discard import
  - Playback, queue, shuffle/repeat, mini player, and player screen
  - Backup restore/erase
  - Premium purchase/restore state
  - Settings customization, privacy, support, app icon, and haptic preferences
- [ ] Compare old and new behavior for the core user journeys.
- [ ] Decide whether `apps/new` replaces `apps/old`, or whether `apps/old` is
  kept as a legacy reference until a later branch.
- [ ] Remove dead compatibility shims once the new app no longer depends on
  them.
- [ ] Final gate: root `pnpm typecheck`, root `pnpm lint`, old-app export smoke,
  new-app export smoke, and a clean architectural scan for event emitters,
  stray console calls, static `Dimensions.get`, and unisolated AsyncStorage.

### Current Position

We are solidly through Phase 1, well into Phase 2, and starting Phase 3. The
`apps/new` shell now has a root stack, tabs, thin route files, a
replacement-oriented Home route with live library/playback state, feature
boundaries, database initialization, and a first reactive Library surface with
searchable/sortable songs, linked details, collection create/edit flows, song
add/remove, durable album/playlist/artist song reorder, and collection
cover/profile image persistence/rendering. Settings now has a feature-owned
home with backup, customization, and premium route entry points. Playback now
has a
reducer-backed session boundary plus queue/player screens connected to a native
Expo Audio adapter for saved library files with native progress/status sync,
persisted session restore, queue reordering, player progress controls, and
queue removal that advances active playback when possible. Free playback now
tracks the old 10-minute ad threshold in persisted session state, pauses
playback commands at an ad break, and lets Premium bypass/reset the gate;
the bundled ad asset now plays during the break and resumes the library track
when it finishes. Playback remote command semantics now have a typed service
boundary that shares the same ad-gated commands and loop-at-queue-end behavior
as native playback completion, but the current Expo Audio adapter still needs a
native-capable remote event source before lock-screen/headphone controls can be
considered done. Expo Audio has been added to `apps/new`, configured for
background playback, and made the active adapter; this SDK 53 API does not yet
expose the newer lock-screen methods, so that wiring remains a future native
backend/API step. Import now has a
route-per-step session shell, native file selection, Premium-gated file/Wi-Fi
entry, a Wi-Fi transfer route/server, cache staging,
metadata/duration extraction, and Drizzle draft saves, including moving cached
audio into durable library storage, persisting artwork to shared image storage,
and editing staged song metadata before save. Backup now has a
feature-owned command-state shell with real archive/share, restore, and
erase/reset commands. Premium now has a feature-owned purchase session shell
connected to RevenueCat pricing, purchase, restore commands, and an app-wide
entitlement provider consumed by Settings, Backup, and Customization. Settings
now owns persisted theme, app icon, haptic, and privacy analytics preference
state, plus support/contact routes;
the app shell, loading states, settings screens, library home,
library shared summary/search/sort/preview/list components, library
create/edit/detail/add-song surfaces, playback player/queue surfaces, and the
backup command surface, import home/files/save/result/Wi-Fi/edit, shared import
preview lists, and import Premium gate surfaces consume saved theme state
through a shared palette hook; deeper non-theme feature polish, native remote
playback event ingestion, and manual playback smoke are still next.
Native app icon assets/config now exist in `apps/new`, and
app-icon preference changes flow through a settings-owned native service, but
alternate icon behavior still needs a native prebuild/device smoke. Haptic
preference state is now consumed by a settings-owned haptics hook in
customization, playback, queue, collection save paths, collection detail song
mutations, backup command feedback, and import file-pick/remove actions, but
broader feature coverage and native-device haptic smoke are still pending.
Import save/discard/edit and Wi-Fi staged-song removal/review actions now also
use the preference-aware haptics boundary. It has a real replacement-app home,
but it is not yet a replacement app overall.
The next useful work should alternate between:

- closing Phase 2 gaps that would otherwise be copied into the new app; and
- defining/building `apps/new` feature surfaces so cleanup does not become an
endless old-app polishing loop.

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
   - Legacy `Model.createTables()` / manual SQL setup has been retired; backup
     restore/erase now reopens the shared Drizzle database connection and runs
     migrations.
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
   - Done: `apps/old/src/events` has been removed.
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
   - Playlist, album, and artist create form side effects now live in a shared
     library feature hook, moving cover picking, repository writes, haptics,
     notifications, and cancel/success navigation out of the create routes.
   - Playlist, album, and artist edit form side effects now live in a shared
     library feature hook, moving name/year validation, cover picking,
     repository updates, notifications, and close/add-artist navigation out of
     the edit routes.
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
   - Edit cover fallback loading now uses the Drizzle-backed library song cover
     repository instead of chaining through album and image controllers.
   - Song edit saves now call a feature-level library metadata repository
     batch update instead of `LibraryController.updateSongsInLibrary`.
   - Color helpers now live in `src/lib/color-utils`, with UI/app imports moved
     off `ColorController` and the unreferenced compatibility shim removed.
   - Import save-to-library now runs through a feature-level import library
     saver with Drizzle-backed song creation, playlist/album/artist joins, and
     repository cover updates instead of `LibraryController.saveToLibrary`.
   - Import cache cleanup for the "do not save to library" path now lives in
     the import feature edit helpers instead of `ImportExportController`.
   - Wi-Fi import upload processing now lives in the import feature layer,
     using repository-backed metadata album/artist creation instead of
     importing `ImportExportController` from the server component.
   - Song metadata updates now resolve album/artist metadata through library
     repository helpers instead of `AlbumController`/`ArtistController`.
   - Export UI actions now import `exportSongs` from the export feature module
     instead of `ImportExportController`, leaving the metadata writer internals
     as the next export cleanup seam.
   - `ImportExportController.exportSongs` is now a compatibility alias to the
     export feature implementation instead of a duplicate export body.
   - Export metadata comparison and writeback now live in the export feature
     layer, using repository/import cover lookups instead of `SongController`.
   - `ImportExportController` now delegates its remaining compatibility exports
     to import/export feature modules instead of carrying legacy import/export
     implementations.
   - Premium purchase calls now live behind a premium feature service instead
     of importing `PurchaseController` from the premium screen/provider.
   - Remaining relative component imports of `ColorController` now point at
     `src/lib/color-utils`.
   - Unreferenced `AudioController`, `ColorController`,
     `ImportExportController`, `LibraryController`, and `PurchaseController`
     files have been removed after their app-facing behavior moved to feature
     modules or shared libs.
   - Legacy cover filesystem helpers now live in the images feature repository,
     and remaining controllers import that feature code directly instead of
     depending on `ImageController`.
   - Legacy models now hydrate song artist/album display metadata through the
     library song repository instead of importing album/artist controllers.
   - Legacy song-result mapping now lives in the library feature layer instead
     of being exported from `SongController` for other controllers to reuse.
   - Song edit-flag writes now go through a library metadata repository
     compatibility helper, removing `AlbumController` and import edit helpers
     from direct `SongController`/`SongModel` calls for that mutation.
   - Library album/song cover fallbacks now live in feature repositories, so
     `SongController` no longer imports `AlbumController` for cover or album
     song lookups.
   - The remaining unreferenced legacy controllers (`AlbumController`,
     `ArtistController`, `PlaylistController`, and `SongController`) have been
     removed after app, feature, model, and controller callers moved off the
     controller layer.
   - Export completion writes now go through the library metadata repository
     compatibility helper instead of importing `SongModel` from the export
     feature.
   - Backup restore/erase database reset now goes through a backup feature
     service instead of importing legacy `Model` directly from the settings
     route.
   - Unreferenced legacy `AlbumModel`, `ArtistModel`, and `PlaylistModel`
     files have been removed.
   - Song edited/export compatibility now uses the Drizzle-backed library song
     snapshot instead of legacy `SongModel`.
   - Backup restore/erase database reset now uses the shared `@synq/db` reset
     helper instead of the legacy `Model`; `apps/old/src/models` has been
     removed.
   - Backup, restore, erase, support-alert, and premium navigation side
     effects now live in a backup feature hook, leaving
     `app/settings/backup.tsx` as a slimmer settings route.
   - Premium screen purchase bootstrapping, RevenueCat purchase/restore
     actions, notifications, haptics, and loading state now live in a premium
     feature hook, leaving `app/premium.tsx` focused on rendering.
   - The unused legacy `SongResultType` row shape and song result mapper have
     been removed after the model/controller callers disappeared.
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
   - Song sheet option side effects now live in an action-sheet feature hook,
     moving queue, edit, export, delete, playlist membership, liked-song,
     analytics, loading, and navigation actions out of the option row
     component.
   - Import footer controls now route through an import feature hook, moving
     cancel/next/finish navigation, Wi-Fi reset, batch edit/delete, selection
     cleanup, and import-result mutation out of the footer component.
   - Song edit form orchestration now lives in a library feature hook, moving
     relation hydration, cover picking, import/library metadata saves,
     selection cleanup, and edit navigation out of the route component.
   - Song row interaction state now lives in a library feature hook, moving
     selection mutation, import cover fallback loading, sheet presentation,
     haptics, and row animation state out of the row component.
   - Album row interaction state now lives in a library feature hook, moving
     add/remove membership writes, import-result synchronization, fallback
     cover loading, sheet presentation, haptics, and navigation out of the row
     component.
   - Artist row interaction state now lives in a library feature hook, moving
     song/album membership writes, import-result synchronization, fallback
     cover loading, sheet presentation, haptics, and navigation out of the row
     component.
   - Playlist row interaction state now lives in a library feature hook,
     moving membership writes, fallback cover loading, sheet presentation,
     haptics, and navigation out of the row component.
   - Library category list query/sort/order state now lives in a shared
     library feature hook, removing repeated state plumbing from the songs,
     albums, artists, and playlists category components.
   - Album, artist, and playlist detail screens now reuse the shared library
     query/sort/order state hook, keeping route-local state focused on detail
     view concerns such as tabs and scroll position.
   - Album, artist, and playlist detail sheet presentation now lives in an
     action-sheet feature hook, moving haptics, edit-entity context updates,
     sheet presentation, and presenter error handling out of the route
     components.
   - Album, artist, and playlist row hooks now reuse the shared entity sheet
     presenter instead of owning duplicate haptic, context, and TrueSheet
     presentation paths.
   - Song row sheet presentation now lives in an action-sheet feature hook,
     moving edit-song context updates, haptics, import-vs-library sheet
     routing, and presenter error handling out of the row hook.
   - Library and import song sheets now share a song action-sheet presentation
     component, keeping the two sheet wrappers focused on selecting option
     mode instead of duplicating header, cover, scroll, and option layout.
   - Song sheet header rendering now lives in one action-sheet component shared
     by the library/import sheets and the player edit sheet route.
   - Playlist, album, and artist action sheets now share an entity sheet
     presentation shell and header, leaving each concrete sheet to supply only
     its selected entity data and option list.
   - Player screen edit and add-to-playlist commands now live in a playback
     feature hook, moving action-sheet context writes, haptics, and navigation
     out of the player route component.
   - Player song edit sheet pull-dismiss behavior now lives in a playback
     feature hook, moving TrueSheet dismissal and haptics out of the route.
   - Player playback controls now live in a playback feature component,
     removing static control layout and styling from the player route.
   - Player add-to-playlist and more-action buttons now live in a playback
     feature component, continuing to slim static presentation out of the
     player route.
   - Player blurred artwork background and animated gradient now live in a
     playback feature component, leaving the player route to compose state,
     cover art, metadata, and controls.
   - Player track metadata row now lives in a playback feature component,
     keeping song labels, row spacing, and player action buttons out of the
     route.
   - Add-to-playlist, add-to-album, and add-to-artist routes now share a
     library feature screen shell for modal chrome, query controls, new/create
     navigation, and close handling.
   - Playlist, album, and artist create routes now share a library feature
     create screen for modal chrome, cover editing, text inputs,
     notifications, and cancel/create actions.
   - Playlist, album, and artist edit routes now share a library feature edit
     screen for modal chrome, cover editing, text inputs, notifications, and
     close handling, while album still supplies its artist relation section.
   - Song edit route UI now lives in a library feature screen component,
     moving modal chrome, cover editing, metadata fields, relation previews,
     notifications, and close controls out of the app route.
   - Song edit album and artist relation sections now share a library feature
     component for field chrome, empty states, row wrapping, and add actions.
   - Premium route UI now lives in a premium feature screen component, moving
     purchase options, status copy, legal links, hero media, notifications, and
     modal chrome out of the app route.
   - Premium purchase options and footer state now live in a focused premium
     feature panel, separating purchase/status/legal actions from the screen
     hero and modal shell.
   - Premium hero media, feature pager placement, logo, and headline copy now
     live in a premium feature component, leaving the premium screen focused on
     modal shell and purchase-flow composition.
   - Settings index route UI now lives in a settings feature screen component,
     moving modal chrome, navigation options, review/support actions, social
     links, analytics events, and dev premium toggle out of the app route.
   - Settings customization route UI now lives in a settings feature screen
     component, moving premium upsell routing, theme/icon/haptic sections, and
     modal chrome out of the app route.
   - Backup settings route UI now lives in a backup feature screen component,
     keeping backup/restore/erase actions in the backup hook while moving
     premium gating, destructive action buttons, loading state, and modal
     chrome out of the app route.
   - Import save and export prompt routes now delegate to import feature
     components, keeping save/export flow hooks and prompt presentation out of
     app route files.
   - Import files route now delegates to an import feature screen component,
     moving transfer progress, imported song list rendering, and premium blur
     gating out of the app route.
   - Import Wi-Fi route now delegates to an import feature screen component,
     moving server URL instructions, export-disable synchronization, transfer
     progress, result list rendering, and premium blur gating out of the app
     route.
   - Import stack layout now delegates to an import feature shell component,
     keeping header, overlay, stack screen options, and import controls out of
     the Expo Router layout file.
   - Import success and failure routes now delegate to import feature screen
     components, moving Lottie status presentation and failure navigation out
     of app route files.
   - Artist detail route now delegates to a library feature screen component,
     keeping artist detail queries, tab state, list headers, empty states, and
     action-sheet presentation out of the app route.
   - Album detail route now delegates to a library feature screen component,
     keeping album detail queries, header/query controls, animated artist
     footer, and action-sheet presentation out of the app route.
   - Playlist detail route now delegates to a library feature screen component,
     keeping playlist query state, song list header, action-sheet presentation,
     and list footer ownership out of the app route.
   - Playlist add, create, and edit routes now delegate to library feature
     screen components, keeping playlist query/form wiring out of the app route
     layer.
   - Album add, create, and edit routes now delegate to library feature screen
     components, moving album query/form wiring and edit artist membership UI
     out of the app route layer.
   - Artist add, create, and edit routes now delegate to library feature screen
     components, keeping artist query/form wiring and source selection out of
     the app route layer.
   - Home tab route now delegates to an app-shell feature screen component,
     moving import entry actions, premium CTA, playback effects, mini-player,
     info modal, and notifications out of the app route layer.
   - Album reorder route now delegates to a library feature screen component,
     keeping draggable ordering UI, reactive album-song query state, and
     Drizzle-backed order writes out of the app route layer.
   - Library tab route now delegates to a library feature screen component,
     keeping category selection, create routing, settings navigation, and list
     composition out of the app route layer.
   - Library stack route layout now delegates to a library feature shell
     component, keeping stack screen options, top header, mini-player, and
     notification overlay composition out of the app route layer.
   - Player and player song-edit routes now delegate to playback feature screen
     components, keeping modal player composition, track actions, and song
     sheet presentation out of the app route layer.
   - Root tab route layout now delegates to an app-shell feature shell
     component, while playback ad asset loading moved into a playback hook.
   - Ingest stack layout and route screens now delegate to ingest feature
     components, removing the route-layout dependency on controls exported from
     sibling route files while preserving the current ingest flow behavior.
   - Root navigation route now delegates to an app-shell navigation component,
     keeping stack screen configuration and modal presentation options out of
     the app route layer.
   - Root layout now delegates bootstrapping and provider composition to
     app-shell feature code, leaving the Expo route file responsible only for
     global CSS import and rendering the app root.
   - Removed the fully commented legacy tracking route and its unused tracking
     transparency dependency from the old app package.
   - Settings stack route layout now delegates to a settings feature shell
     component, keeping settings modal presentation options out of the app route
     layer.
   - Dynamic library detail and edit route wrappers now render feature screens
     directly instead of importing sibling route modules.
   - Replaced debug-red placeholder ingest screens with a reusable ingest step
     panel that preserves current flow controls while making unfinished ingest
     states explicit in feature-owned UI.
   - Playlist, album, and artist detail routes now share a library feature
     detail shell for the screen container, sticky header, and global overlay,
     leaving each route focused on its query/list content.
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
   - The stale `eventemitter3` dependency has been removed from `@synq/old`
     after the app event buses were retired.
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
   - Done: removed the old `apps/old/src/lib/ingest.ts` and
     `apps/old/src/hooks/use-ingest.ts` compatibility shims after callers
     moved to the feature path.
   - Done: move hashed cover image persistence and path helpers into
     `apps/old/src/features/images/repository/image-repository.ts`.
   - Done: shared cover UI components now live in
     `apps/old/src/features/cover/components` instead of the generic
     `src/components/cover` folder.
   - Done: removed the old `apps/old/src/lib/image-utils.ts` compatibility
     shim after image callers moved to feature repositories.
   - Done: import album cover edits now write only hash-backed image rows
     through the library repository instead of duplicating legacy
     `albums/{id}/cover_*.jpg` files.
   - Done: file-browser ingest now reuses library metadata repositories for
     artist/album creation and relation dedupe, including album artist links.
   - Done: import save-to-library progress now updates the import flow context
     instead of rendering a hardcoded zero-progress placeholder.
   - Done: import route controls, header, Wi-Fi server, instructions, and
     premium blur UI moved from generic `src/components/import` into the
     import feature folder.
   - Done: newer ingest flow UI primitives (`button`, page title, safe-area
     wrappers, settings button) now live in
     `apps/old/src/features/ingest/components` instead of generic
     `src/components` files.
   - Done: import progress UI now lives in
     `apps/old/src/features/import/components/Progress.tsx` instead of the
     generic root `src/components` folder.
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
   - Done: app-shell chrome (`GlobalProgress`, `Overlay`, tab icons, safe top
     spacer) now lives in `apps/old/src/features/app-shell/components` instead
     of the generic root `src/components` folder.
   - Done: library tab category selector UI now lives in
     `apps/old/src/features/library/components/CategorySelector.tsx` instead
     of the generic root `src/components` folder.
   - Done: album/artist/playlist detail header and artist tab selector UI now
     live in `apps/old/src/features/library/components` instead of the generic
     root `src/components` folder.
   - Done: reusable album/artist/playlist/song list surfaces now live under
     `apps/old/src/features/library/components/lists` instead of the generic
     root `src/components/lists` folder.
   - Done: shared song row, song info, and count/duration UI now live under
     `apps/old/src/features/library/components/song` instead of the generic
     root `src/components/song` folder.
   - Done: remaining shared UI primitives and modal primitives now live under
     `apps/old/src/shared/components`, while the legacy tab bar moved into the
     app-shell feature, leaving no files in the generic root `src/components`
     folder.
   - Done: shared list, skeleton, and legacy list-cover primitives now avoid
     stale animation dependencies and derived render state.
   - Done: notification banner and info accordion animations now use explicit
     stable dependencies.
   - Done: notification queue/modal state and actions now live in
     `apps/old/src/features/notifications/context/NotificationsProvider.tsx`
     instead of `GlobalProvider`.
   - Done: notification banner UI now lives in
     `apps/old/src/features/notifications/components` instead of the generic
     `src/components/notifications` folder.
   - Done: notification detail modal UI now lives in
     `apps/old/src/features/notifications/components/NotificationModal.tsx`
     instead of the generic `src/components/modals` folder.
   - Done: overlay and info-modal visibility now live in
     `apps/old/src/features/app-shell/context/AppShellProvider.tsx` instead of
     `GlobalProvider`.
   - Done: app-shell instructions modal UI now lives in
     `apps/old/src/features/app-shell/components/InfoModal.tsx` instead of the
     generic `src/components/modals` folder.
   - Done: font loading now lives in
     `apps/old/src/features/app-shell/hooks/use-font.ts`, and haptic
     preference/actions now live in
     `apps/old/src/features/haptics/hooks/use-haptics.ts`.
   - Done: unused sheet refs and stale modal/control flags were removed from
     `GlobalProvider` after auditing that no active callers used them.
   - Done: selected-song UI state now lives in
     `apps/old/src/features/selection/context/SelectionProvider.tsx` instead of
     `GlobalProvider`.
   - Done: playback ad state now lives in
     `apps/old/src/features/playback/context/PlaybackAdProvider.tsx` instead
     of `GlobalProvider`.
   - Done: privacy/analytics preference state now lives in
     `apps/old/src/features/privacy/context/PrivacyProvider.tsx` and is
     mounted in the root app shell instead of relying on an unmounted generic
     context default.
   - Done: theme and premium state providers now live under
     `apps/old/src/features/theme` and `apps/old/src/features/premium`
     instead of the generic `src/context` folder.
   - Done: theme and premium provider boot effects now use stable callbacks and
     memoized context values.
   - Done: premium feature carousel UI now lives in
     `apps/old/src/features/premium/components` instead of the generic
     `src/components/premium` folder.
   - Done: premium upsell ad UI now lives in
     `apps/old/src/features/premium/components/Ad.tsx` instead of the generic
     root `src/components` folder.
   - Done: premium purchase option UI now lives in
     `apps/old/src/features/premium/components/PremiumOption.tsx` instead of
     the generic root `src/components` folder.
   - Done: settings screen UI components now live in
     `apps/old/src/features/settings/components` instead of the generic
     `src/components/settings` folder.
   - Done: settings theme and app-icon pickers now share
     `apps/old/src/features/settings/hooks/use-horizontal-fade-scroll.ts`
     instead of duplicating scroll-gradient animation state in both components.
   - Done: import flow state now lives in
     `apps/old/src/features/import/context/ImportFlowProvider.tsx` instead of
     `GlobalProvider`.
   - Done: import session state (`results`, transfer progress, loading,
     export-disabled state, selected transfer row, and Wi-Fi transfer address)
     now lives in `ImportFlowProvider` instead of `GlobalProvider`.
   - Done: import file and Wi-Fi routes now derive transfer completion through
     `apps/old/src/features/import/hooks/use-import-transfer-completion.ts`
     instead of mirroring progress into route-local state.
   - Done: import save progress now reuses the transfer-completion hook, and
     the import progress indicator declares its animated dependencies.
   - Done: import save orchestration now lives in
     `apps/old/src/features/import/hooks/use-import-save-flow.ts`, leaving the
     save route focused on prompt/progress UI.
   - Done: Wi-Fi transfer server setup now lives in
     `apps/old/src/features/import/hooks/use-wifi-transfer-server.ts`, and file
     uploads append import results immutably through the import flow context.
   - Done: import export orchestration now lives in
     `apps/old/src/features/import/hooks/use-import-export-flow.ts`, leaving the
     export route focused on prompt UI.
   - Done: edit/action-sheet state now lives in
     `apps/old/src/features/action-sheet/context/ActionSheetProvider.tsx`, and
     the legacy `GlobalProvider` has been removed.
   - Done: action sheet surfaces and entity sheet option components now live in
     `apps/old/src/features/action-sheet/components` instead of the generic
     `src/components/sheet` folder.
   - Done: playlist, album, and artist sheet option side effects now live in
     action-sheet feature hooks, moving export/delete/edit/reorder analytics,
     alerts, global loading, and navigation out of the option row components.
   - Done: song action sheets now share
     `apps/old/src/features/action-sheet/hooks/use-song-sheet-cover.ts`
     instead of duplicating cover-loading state/effects in each sheet.
   - Done: entity action sheets now share
     `apps/old/src/features/action-sheet/hooks/use-sheet-scroll.ts`, and the
     player edit sheet reuses the song sheet cover hook.
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
   - Done: song row UI no longer carries dead premium-blur/message state,
     stale pan-responder scaffolding, or manual selection-array copying; the
     selection toggle and import-cover loading paths are now explicit helpers.
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
   - Done: shared playback buttons, mini-player, skip controls, and time scrub
     UI now live in `apps/old/src/features/playback/components`; the generic
     `src/components/player` folder has been removed.
   - Done: playback toggle buttons no longer carry stale imports or stale
     state-effect dependencies; pause/play previous-state tracking now uses a
     ref instead of extra render state.
   - Done: mini-player artwork loading now lives in
     `apps/old/src/features/playback/hooks/use-mini-player-artwork.ts`, and the
     time scrubber effects now carry explicit reactive dependencies.
   - Done: player route artwork, song hydration, title fade, and gradient
     opacity state now live in
     `apps/old/src/features/playback/hooks/use-player-screen-state.ts`.
   - Done: player artwork crossfade UI now lives in
     `apps/old/src/features/playback/components/CrossfadeImage.tsx` instead of
     the generic `src/components/image` folder.
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
   - Done: library tab panels now live in
     `apps/old/src/features/library/components` instead of the generic
     `src/components/library` folder.
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
   - Done: playlist membership row checks now depend on concrete song/playlist
     IDs instead of broad object references.
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
