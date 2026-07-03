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
