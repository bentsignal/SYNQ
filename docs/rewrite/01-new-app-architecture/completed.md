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
