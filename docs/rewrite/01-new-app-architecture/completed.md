# New App Architecture Completed

- Removed app-level event emitters from the new app path; remaining listener
  usage is isolated to native audio status subscription infrastructure.
- Isolated AsyncStorage and filesystem side effects behind feature services.
- Split many broad feature services into focused services:
  - import session command, persistence normalizer, library file placement, and
    Wi-Fi route response services
  - backup filesystem service
  - playback native audio, native status listener, native player registry, and
    persistence normalizer services
  - library navigation, metadata export, row state, detail shaping, screen
    state, and repository boundaries
- Extracted shared UI primitives where they reduce repeated structure:
  - settings screen parts and switch row
  - app-shell song row parts
  - library action parts
- Added or expanded deterministic smoke coverage around many pure services and
  screen-state helpers.
- Moved library song preview, song detail, and summary Drizzle query builders
  out of UI hooks and into repository modules, clearing direct database/schema
  imports from `apps/new/src/features/library/hooks`.
- Added command services for collection form, song, and collection mutations so
  hooks keep UI side effects while services own concrete repository/export
  wiring.
- Aligned collection list queries with the song query/helper pattern by adding
  a single-kind collection list live query hook plus pure row-shaping service.
- Moved import save/link Drizzle writes behind import repository modules and
  added a rewrite verification scan that keeps import hooks, components, and
  services clear of direct database access.
- Moved image table reads/writes behind an image repository and added a rewrite
  verification scan that keeps image services focused on filesystem and image
  transformation work.
- Moved export metadata reads behind an export repository and added a rewrite
  verification scan that keeps export services focused on filesystem sharing
  and ID3 writeback orchestration.
- Slimmed the playback Rostra provider by moving native adapter lifecycle and
  mutable playback-state ref synchronization into dedicated playback hooks.
- Added a new-app database boundary scan that keeps direct Drizzle/database
  access limited to repository modules, query hooks, and approved app/backup
  infrastructure boundaries.
- Moved the song-detail Drizzle live-query adapter out of the UI-facing library
  hook into a library data module and added a ratchet for remaining library hook
  live-query modules.
- Moved the library summary live-query adapter into a library data module and
  lowered the remaining library hook live-query ratchet from 7 modules to 6.
- Moved the song-preview live-query adapter into a library data module and
  lowered the remaining library hook live-query ratchet from 6 modules to 5.
- Moved the collection-list live-query adapter into a library data module and
  lowered the remaining library hook live-query ratchet from 5 modules to 4.
- Moved the collection-preview live-query adapter into a library data module
  and lowered the remaining library hook live-query ratchet from 4 modules to 3.
- Moved the addable-collection song-row live-query adapters into a library data
  module and lowered the remaining library hook live-query ratchet from 3
  modules to 2.
- Moved the edit-collection row live-query adapters into a library data module
  and lowered the remaining library hook live-query ratchet from 2 modules to 1.
- Moved the collection-detail row live-query adapters into a library data module
  and lowered the remaining library hook live-query ratchet from 1 module to 0.
- Tightened the new-app database boundary scan so hook modules are no longer an
  approved Drizzle/database boundary after the library data-module migration.
- Moved import save-screen store wiring into its feature controller so the route
  component stays presentation-focused and orchestration remains in hooks.
- Moved import success/failure result screens behind a result controller and
  pure view-state helpers, leaving the route components as thin view wrappers.
- Moved the import premium gate's entitlement read and haptic command behind a
  gate controller so the component stays focused on rendering the gated UI.
- Moved the edit-import-song route behind a screen controller and pure
  edit-screen state helper, including invalid-id and not-staged state
  derivation.
- Centralized numeric route parameter parsing behind an app-shell hook and
  removed repeated `useLocalSearchParams` parsing from import/library screens.
- Slimmed the premium entitlement Rostra provider by moving entitlement state
  reduction into a pure service and refresh/apply wiring into a dedicated hook.
- Slimmed the playback Rostra provider by moving playback session store
  orchestration into a dedicated hook while leaving the provider as a store
  adapter.
- Slimmed the import session Rostra provider by moving reducer, persistence,
  and command assembly into a dedicated store hook.
- Moved backup phase-transition haptics and runtime-session reset effects out
  of the screen controller into a dedicated backup effects hook.
- Moved backup command result copy and document-picker URI normalization into a
  pure service covered by deterministic smoke.
- Moved edit-library-song cover-pick and save side-effect orchestration out of
  the form controller into a dedicated command hook aligned with collection
  form command patterns.
- Moved library song preview row play/queue side effects out of the row
  component into a dedicated action hook.
- Moved library song list sort/order haptic handlers out of the controls
  component into a dedicated controls hook.
- Moved edit-import-song save side-effect orchestration out of the form
  controller into a dedicated command hook.
- Extracted edit-import-song text input rendering into a small field component
  so the field group stays focused on form composition.
- Extracted import save-screen action button rendering into a small reusable
  button component.
- Moved add-collection-songs selection haptic orchestration into the command
  hook so the controller focuses on reducer state and derived selection state.
- Extracted the library home header into a dedicated component so the home view
  composes feature sections more directly.
- Added a shared protected-playlist predicate so UI action state and repository
  mutation guards agree on seeded playlist protections.
- Extracted a shared library section header component used by song previews and
  collection detail song sections.
- Split collection detail action-state helpers out of the broader interaction
  service so mutation/playback hooks import a narrower boundary.
- Split collection detail mutation reducer and error-message state out of the
  command helper service.
- Split edit-import-song save command helpers out of the form state service.
- Moved import session save/discard/reset lifecycle orchestration into an
  injectable service covered by deterministic smoke.
- Split import library one-song save execution out of the session save loop,
  including deterministic smoke coverage for cover handling and rollback.
- Split collection form command/haptic state helpers out of the reducer and
  validation service.
- Split collection form reducer state and actions into a dedicated state
  service.
- Split collection form domain kind and year parsing into a dedicated domain
  service.
- Added a collection form command factory so command wiring can be smoke-tested
  without importing real database repositories.
- Split collection form create/edit copy helpers out of field and action
  presentation state.
- Split add-collection-songs command and mutation-error helpers out of reducer
  state.
- Split add-collection-songs search state out of controller mutation state.
- Split edit-library-song command/haptic/navigation helpers out of form
  reducer state.
- Split library song detail mutation command/haptic/navigation helpers out of
  reducer state.
- Split edit-import-song screen lookup state from form reducer/domain state.
- Moved playback queue haptic action orchestration behind a dedicated action
  hook and split queue command state out of queue algorithms.
- Split playback initial state out of the reducer module so persistence and
  session store code can depend on defaults without importing reducer actions.
- Split collection list search control reducer state out of collection list
  navigation, copy, and filtering state.
- Split library song playback/export command state out of song detail
  navigation and relationship view state.
- Split import session initial state out of the reducer module so the session
  store can depend on defaults without importing reducer actions.
- Extracted import library session save/discard execution behind an injectable
  executor with deterministic smoke coverage for summaries and cache cleanup.
- Centralized import session action builders so file, Wi-Fi, and session command
  hooks dispatch typed command helpers instead of raw reducer objects.
- Split playback player haptic/seek command state out of player view-state
  derivation.
- Split playback queue action-state derivation out of queue algorithms.
- Split playback player action-state derivation out of player progress and
  view-state helpers.
- Split add-to-collection song persistence into per-kind repositories while
  preserving the public collection command API.
- Split collection update persistence into album, artist, and playlist
  repositories behind the existing collection update facade.
- Split library song metadata relationship rewrites out of the song metadata
  repository.
- Split static premium tier catalog and product mapping out of the RevenueCat
  purchase adapter.
- Moved premium purchase, restore, entitlement, and tier-loading behavior behind
  an injectable executor so the RevenueCat adapter only wires native calls.
- Moved settings JSON file persistence behind a shared injectable store so
  privacy and customization services keep normalization separate from
  filesystem wiring.
- Moved import-draft and library song export sharing through a shared injectable
  executor with pure filename helpers.
- Moved import file-cache copy/write/delete orchestration behind an injectable
  executor so file picker and Wi-Fi import staging share one cache boundary.
- Moved persisted import-session load/save/clear behavior behind an injectable
  executor so restored draft validation is testable without Expo filesystem.
- Moved cover-image storage validation, duplicate detection, path planning, and
  variant write orchestration behind an injectable executor.
- Moved collection/song image picker result handling behind an injectable
  executor so MIME validation and base64 conversion are testable without native
  picker modules.
- Moved playback session persistence load/save/clear behavior behind an
  injectable executor so high-traffic playback state persistence is testable
  without Expo filesystem.
- Moved library song relationship cleanup, song-row deletion, and optional file
  cleanup behind an injectable repository executor.
- Moved import library audio file movement and cache cleanup behind an
  injectable file executor.
- Moved import library artist, album, cover, and playlist linking orchestration
  behind an injectable executor.
- Moved import library song row insert, update, and cleanup behavior behind an
  injectable repository executor.
- Moved backup document-directory clearing, restore staging, cleanup, and
  staged-file replacement behind an injectable filesystem executor.
- Moved library export metadata shaping, artwork loading, tag writeback, and
  export snapshot marking behind an injectable executor.
- Moved library export snapshot hashing, staleness checks, and exported
  snapshot updates behind an injectable repository executor.
- Moved album, artist, and playlist collection deletion orchestration behind an
  injectable repository executor.
- Moved album artist-name parsing, artist lookup/creation, and album-artist
  relationship replacement behind an injectable repository executor.
- Moved song metadata artist/album parsing, lookup/creation, song joins, and
  album-artist link reconciliation behind an injectable repository executor.
- Moved album, artist, playlist, and liked-song membership append/delete
  behavior behind a shared injectable repository executor.
- Moved collection song reorder/remove behavior behind an injectable repository
  executor so relationship mutations are separated from Drizzle table adapters.
- Moved collection name uniqueness policy behind an injectable repository
  executor so create/update adapters only provide table-specific lookups.
- Moved library song metadata title validation, relationship replacement, and
  cover targeting behind an injectable repository executor.
- Moved album, artist, and playlist update validation, uniqueness, image
  persistence, protected-playlist guards, and album artist replacement behind a
  shared injectable repository executor.
- Moved album, artist, and playlist creation validation, uniqueness, image
  persistence, insert-id assertions, and result shaping behind a shared
  injectable repository executor.
- Moved single and batched collection song add dispatch behind an injectable
  repository executor so collection-kind routing is separated from adapters.
- Moved library song export sharing orchestration behind an injectable executor
  so playable filtering and export file preparation are separated from Expo
  sharing adapters.
- Moved import draft export sharing orchestration behind an injectable executor
  so staged-song file mapping is separated from Expo sharing adapters.
- Moved import file picking and Wi-Fi staging orchestration behind an
  injectable executor so the Expo document-picker adapter only wires native
  dependencies.
- Split customization and privacy settings defaults/normalizers into pure
  domain services so filesystem-backed settings modules only wire persistence.
- Split Wi-Fi import request handling into focused response, transfer-decision,
  and upload-decision services so route handlers compose narrower policies.
- Split collection song relationship Drizzle adapters into album, artist, and
  playlist repositories behind the existing relationship facade.
- Split collection creation Drizzle insert adapters into album, artist, and
  playlist repositories behind the existing collection-create facade.
- Split import library artist/album find-or-create behavior into a focused
  entity-link service used by the import song linking executor.
- Split library export ID3 tag construction into a focused pure helper used by
  export metadata writeback orchestration.
- Split backup phase-transition side-effect decisions out of the backup screen
  state service and into a focused phase-effect service.
- Split import library link Drizzle adapters into entity and relationship
  repositories behind the existing import-library link facade.
- Split import library song Drizzle adapters into song-row and relationship
  cleanup repositories behind the existing import-library song facade.
- Split library export metadata writeback into focused metadata builder,
  artwork, and audio tag services behind the existing export executor facade.
- Moved library song delete filesystem cleanup out of the repository boundary
  into a dedicated file service and delete orchestration service.
- Moved settings support review/link native side effects out of the controller
  hook and behind a support action service boundary.
- Split backup command native adapters for archive picking, sharing, and
  compression out of the backup command composition service.
- Extracted playback native player registry transition decisions into a pure
  state service while keeping Expo audio calls in the native registry.
- Split Wi-Fi import bridge request/response types, JSON response sending, and
  mutable route runtime state out of the route-handler service.
- Split import library song save rollback, cover persistence, and error
  normalization steps out of the main save orchestration service.
- Split collection delete Drizzle adapters into row and relationship cleanup
  repositories behind the existing collection delete facade.
- Split collection update name validation, optional image persistence, and
  protected-playlist guard steps out of the main update executor.
- Split collection create name validation, required/optional image preparation,
  and created-id assertion steps out of the main create executor.
- Split song metadata relationship get-or-create and album-artist link planning
  helpers out of the main relationship replace executor.
- Split song metadata update title validation and cover update target selection
  out of the main metadata update executor.
- Split collection song relationship order and remove operation planning out of
  the main relationship executor.
- Split collection song add operation planning out of the main add executor.
- Split collection song membership order, guard, insert, and liked-delete
  helpers out of the main membership executor.
- Split import file selection cached-file and Wi-Fi process parameter planning
  out of the main file selection executor.
- Split import library song, album, artist-album, and cover update link
  parameter planning out of the main library link executor.
- Split import library artist linking, album linking, and album-cover update
  operations out of the main library link executor.
- Split playback queue removal and move state derivation out of the queue
  mutation service.
- Shared playback active-track activation between transport commands and native
  track-finished transitions.
- Split playback native ad/library status update derivation out of the native
  transition service.
- Moved playback native library source validation out of the native player
  registry orchestration.
- Split playback native target-index command planning out of the native command
  plan service.
- Moved playback native resume, previous-track, and queue-removal command
  decisions into the native command step service.
- Split simple playback command action/native plan construction into a focused
  command step service.
- Split playback session hydration, failure, and playback-mode toggles into a
  focused session step service.
