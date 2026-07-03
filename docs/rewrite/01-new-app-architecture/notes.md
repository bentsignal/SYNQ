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
- Import route screens should stay as wrappers around feature controllers.
  Result screens now receive their full view model from
  `use-import-result-controller`, and the premium gate receives entitlement and
  interaction wiring from `use-import-premium-gate-controller`.
- Verification for the latest import controller slices:
  `pnpm verify:rewrite` passed for the result-screen controller extraction;
  `pnpm --filter @synq/new typecheck`, `pnpm --filter @synq/new lint`,
  `pnpm --filter @synq/rewrite-smoke typecheck`,
  `pnpm --filter @synq/rewrite-smoke smoke`, and
  `bash scripts/audit-rewrite-debt.sh` passed for the premium-gate controller
  extraction.
- Edit-import-song routing now parses the route parameter in
  `use-edit-import-song-screen-controller`, then delegates invalid-id,
  not-staged, and ready-state derivation to `getImportSongEditScreenState`.
  Deterministic smoke covers all three outcomes.
- Route screens that need numeric IDs should use
  `useNumericRouteParam`; direct `useLocalSearchParams` plus
  `parseNumericRouteParam` is now isolated to the app-shell hook boundary.
- Premium entitlement state now follows the provider pattern used elsewhere:
  `PremiumEntitlementProvider` only adapts Rostra, `use-premium-entitlement-store`
  owns async refresh/apply wiring, and `premium-entitlement-state-service`
  owns the pure reducer covered by deterministic smoke.
- Playback provider wiring now follows the same shell pattern:
  `PlaybackProvider` adapts Rostra, while `use-playback-session-store` owns
  reducer state, persistence, native adapter/listener wiring, ad-gate wiring,
  and command assembly.
