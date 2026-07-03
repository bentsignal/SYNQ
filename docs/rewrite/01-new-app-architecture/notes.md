# New App Architecture Notes

- Prefer feature-first modules over file-type buckets.
- Prefer pure services plus deterministic smoke where behavior can be tested
  without native APIs.
- Leave native bridge, Expo filesystem, and audio APIs behind small services so
  bundling/export smokes can verify integration.
- Repeated component styling now uses NativeWind utilities in `apps/new`; keep
  the zero-`StyleSheet.create` debt gate green.
- Library query hooks should call repository query builders plus pure row
  shaping services.
- Library command hooks should keep haptics, alerts, navigation, dispatch, and
  local reducer state; command services should own repository/export calls and
  persistence payload shaping.
- Collection list screens now use a list-specific single-kind live query hook
  instead of reusing the library-home all-preview hook, so Albums, Artists, and
  Playlists list pages subscribe only to the repository query they render.
- Import save services now keep filesystem/image orchestration while concrete
  song, artist, album, and relationship database writes live under
  `src/features/import/repository`. `pnpm verify:rewrite` scans import hooks,
  components, and services to keep direct Drizzle imports out of that layer.
- Image storage now keeps hashing, resizing, and filesystem writes in the
  service while image table reads/writes live under
  `src/features/images/repository`. `pnpm verify:rewrite` scans image services
  to keep direct Drizzle imports out of that layer.
- Export metadata services now keep artwork loading and ID3 writeback
  orchestration while song, artist, and album metadata reads live under
  `src/features/export/repository`. `pnpm verify:rewrite` scans export services
  to keep direct Drizzle imports out of that layer.
