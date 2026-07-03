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
