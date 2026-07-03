# Quality And Release Completed

- Added `pnpm verify:rewrite`.
- Added deterministic rewrite smoke tests for many pure services and
  screen-state helpers.
- Added hygiene scans for event emitters, direct AsyncStorage boundaries, and
  other new-app architecture risks.
- Kept old-app and new-app iOS export smokes passing at checkpoints.
- Added `pnpm audit:rewrite-debt` and included it in the full rewrite
  verification gate.
- Added custom new-app ESLint coverage for banned `StyleSheet` usage and a
  verifier smoke that proves the rule fails on violations.
- Ratcheted the rewrite debt audit to block new `StyleSheet` references and
  raw `sendHaptic("...")` interaction decisions in the new app.
- Added a shared app-shell native alert presenter and ratcheted the rewrite
  debt audit to block direct feature-level `Alert.alert` calls.
- Added a shared app-shell imperative route presenter and ratcheted the rewrite
  debt audit to block direct feature-level `router.push`/`router.replace`
  calls.
- Ratcheted the rewrite debt audit to block direct feature-level route-param
  parsing outside the app-shell `useNumericRouteParam` boundary.
- Expanded deterministic backup smoke coverage for command result messages and
  document-picker archive URI normalization.
- Added injectable backup command orchestration smoke coverage for backup,
  restore, erase, cancellation, sharing availability, and restore cleanup.
- Added import save-to-library session smoke coverage for successful draft
  cache cleanup and failure-safe cleanup skipping.
- Expanded playback reducer smoke coverage for ad native status, ad completion,
  and native-finished advance/end transitions.
- Added injectable library song command smoke coverage for like, delete,
  export, and metadata update forwarding.
- Added injectable library collection command smoke coverage for export,
  delete, move, remove, and add forwarding.
- Added Wi-Fi import route-handler smoke coverage for transfer start, upload,
  duplicate upload, failure, finish, and reset runtime transitions.
