# Performance And State Notes

- Rostra reference: `https://github.com/bentsignal/rostra`
- Rostra exposes `createStore(useInternalStore)` and returns a `Store`
  component plus a `useStore(selector)` hook.
- Rostra selector reads are the reason to prefer it over broad React context
  for high-churn state.
- The Rostra README notes that rerender behavior assumes React Compiler is
  enabled; confirm the new app compiler setup before relying on that behavior.
- Current `apps/new/package.json` includes Rostra, but does not include
  NativeWind, Uniwind, or Tailwind.
- There are many `StyleSheet.create` call sites across `apps/new`; make this a
  staged migration with enforcement after a few representative conversions.
- `scripts/audit-rewrite-debt.sh` currently allows the known baseline of 111
  `StyleSheet.create` calls and 1 React context module. Lower those limits
  whenever cleanup lands.
- The first Rostra-backed provider is customization settings. It keeps the
  compatibility hook while exposing selector reads for lower-churn consumers.
- Premium entitlement and import session are also Rostra-backed. The remaining
  broad React context module is playback session.
