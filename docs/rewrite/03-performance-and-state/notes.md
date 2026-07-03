# Performance And State Notes

- Rostra reference: `https://github.com/bentsignal/rostra`
- Rostra exposes `createStore(useInternalStore)` and returns a `Store`
  component plus a `useStore(selector)` hook.
- Rostra selector reads are the reason to prefer it over broad React context
  for high-churn state.
- The Rostra README notes that rerender behavior assumes React Compiler is
  enabled; confirm the new app compiler setup before relying on that behavior.
- Current `apps/new/package.json` includes Rostra, NativeWind, and Tailwind.
- There are many `StyleSheet.create` call sites across `apps/new`; make this a
  staged migration with enforcement after a few representative conversions.
- `scripts/audit-rewrite-debt.sh` currently allows the known baseline of 96
  `StyleSheet.create` calls and 0 React context modules. Lower those limits
  whenever cleanup lands.
- The first Rostra-backed provider is customization settings. It keeps the
  compatibility hook while exposing selector reads for lower-churn consumers.
- Customization settings, premium entitlement, import session, and playback
  session are all Rostra-backed. Compatibility hooks still exist for a few
  provider modules, but production consumers use selector hooks and the audit
  blocks new React context modules.
- The new app mirrors the old app's NativeWind 4 setup: Expo Babel jsx import
  source, `nativewind/metro`, `globals.css`, `nativewind-env.d.ts`, and a local
  Tailwind config.
