# Performance And State Notes

- Rostra reference: `https://github.com/bentsignal/rostra`
- Rostra exposes `createStore(useInternalStore)` and returns a `Store`
  component plus a `useStore(selector)` hook.
- Rostra selector reads are the reason to prefer it over broad React context
  for high-churn state.
- The Rostra README notes that rerender behavior assumes React Compiler is
  enabled; confirm the new app compiler setup before relying on that behavior.
- Current `apps/new/package.json` does not include NativeWind, Uniwind,
  Tailwind, or Rostra.
- There are many `StyleSheet.create` call sites across `apps/new`; make this a
  staged migration with enforcement after a few representative conversions.

