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
