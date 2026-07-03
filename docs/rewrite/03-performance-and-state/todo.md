# Performance And State Todo

## Rostra State Migration

- [x] Add `rostra` to the new app once the migration slice is ready.
- [x] Inventory all React context usage in `apps/new`.
- [x] Replace broad React context providers with Rostra stores where selector
  reads reduce rerenders.
- [x] Prioritize high-churn providers first:
  - done: playback session
  - done: import session
  - done: premium entitlement
  - done: customization settings/theme
- [x] Preserve provider ergonomics while using selector functions for
  component reads.
- [x] Add lint or hygiene scans to prevent new broad React context usage once
  migration is underway.
- [x] Ratchet `MAX_NEW_APP_CONTEXT_MODULES` down as providers move to Rostra.

## Utility Styling Migration

- [x] Decide whether the new app should use NativeWind, Uniwind, or another
  Tailwind-compatible React Native utility system.
- [x] Confirm/install/configure the chosen library in `apps/new`.
- [x] Convert `StyleSheet` usage to utility classes wherever physically
  practical.
- [x] Keep small escape hatches for dynamic runtime styles that are awkward or
  unsafe to express as utility classes.
- [x] Add a custom lint rule or hygiene scan to ban new `StyleSheet.create`
  usage after the migration path is established.
- [x] Ratchet `MAX_NEW_APP_STYLESHEET_CREATE` down as utility-class
  conversions land.
- [x] Track remaining justified `StyleSheet` exceptions explicitly.

## State And Render Performance

- [x] Audit remaining provider values for unstable object/function identities.
- [ ] Continue replacing screen-local orchestration with typed hooks and
  services.
- [ ] Add profiler/manual notes for high-traffic playback, import, and library
  screens after the architecture stabilizes.
