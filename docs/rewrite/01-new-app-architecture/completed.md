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
