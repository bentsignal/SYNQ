# Performance And State Todo

## Rostra State Migration

- [x] Add `rostra` to the new app once the migration slice is ready.
- [ ] Inventory all React context usage in `apps/new`.
- [ ] Replace broad React context providers with Rostra stores where selector
  reads reduce rerenders.
- [ ] Prioritize high-churn providers first:
  - playback session
  - import session
  - premium entitlement
  - done: customization settings/theme
- [ ] Preserve provider ergonomics while using selector functions for
  component reads.
- [x] Add lint or hygiene scans to prevent new broad React context usage once
  migration is underway.
- [ ] Ratchet `MAX_NEW_APP_CONTEXT_MODULES` down as providers move to Rostra.

## Utility Styling Migration

- [ ] Decide whether the new app should use NativeWind, Uniwind, or another
  Tailwind-compatible React Native utility system.
- [ ] Confirm/install/configure the chosen library in `apps/new`; current
  package manifests do not list NativeWind, Uniwind, or Tailwind packages.
- [ ] Convert `StyleSheet` usage to utility classes wherever physically
  practical.
- [ ] Keep small escape hatches for dynamic runtime styles that are awkward or
  unsafe to express as utility classes.
- [ ] Add a custom lint rule or hygiene scan to ban new `StyleSheet.create`
  usage after the migration path is established.
- [ ] Ratchet `MAX_NEW_APP_STYLESHEET_CREATE` down as utility-class
  conversions land.
- [ ] Track remaining justified `StyleSheet` exceptions explicitly.

## State And Render Performance

- [ ] Audit remaining provider values for unstable object/function identities.
- [ ] Continue replacing screen-local orchestration with typed hooks and
  services.
- [ ] Add profiler/manual notes for high-traffic playback, import, and library
  screens after the architecture stabilizes.
