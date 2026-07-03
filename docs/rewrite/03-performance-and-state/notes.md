# Performance And State Notes

- Rostra reference: `https://github.com/bentsignal/rostra`
- Rostra exposes `createStore(useInternalStore)` and returns a `Store`
  component plus a `useStore(selector)` hook.
- Rostra selector reads are the reason to prefer it over broad React context
  for high-churn state.
- The Rostra README notes that rerender behavior assumes React Compiler is
  enabled; confirm the new app compiler setup before relying on that behavior.
- Current `apps/new/package.json` includes Rostra, NativeWind, and Tailwind.
- `scripts/audit-rewrite-debt.sh` currently allows 0 `StyleSheet.create` calls
  and 0 React context modules in the new app. Keep these debt gates at zero.
- Import edit fields/invalid state/save toggle/Wi-Fi address panel and playback
  queue empty/session/list/control-button components now use NativeWind
  utilities for presentation styles; the StyleSheet ratchet is 63 calls after
  converting that local batch.
- Import edit/files/save/Wi-Fi screen containers now use NativeWind utilities;
  the StyleSheet ratchet is 59 calls after converting that local batch.
- Playback ad-break panels, player control rows, and queue row action buttons
  now use NativeWind utilities for presentation styles; the StyleSheet ratchet
  is 55 calls after converting that local batch.
- Import components are now clear of `StyleSheet.create`; the StyleSheet
  ratchet is 52 calls after converting the final import batch.
- Remaining playback screen, mini-player, now-playing, and queue row
  presentation styles now use NativeWind utilities; the StyleSheet ratchet is
  47 calls after converting that local batch.
- Collection form and edit-library-song form components now use NativeWind
  utilities for presentation styles; the StyleSheet ratchet is 39 calls after
  converting that local batch.
- Add-to-collection library screen/header/list/status presentation styles now
  use NativeWind utilities; the StyleSheet ratchet is 31 calls after converting
  that local batch.
- Shared library action parts and song row actions now use NativeWind
  utilities; the StyleSheet ratchet is 27 calls after converting that local
  batch.
- Collection list/detail screen, header, search, list, and status presentation
  styles now use NativeWind utilities; the StyleSheet ratchet is 19 calls after
  converting that local batch.
- Song detail header/panels/view and song list controls now use NativeWind
  utilities; the StyleSheet ratchet is 15 calls after converting that local
  batch.
- Collection preview and collection song list presentation styles now use
  NativeWind utilities; the StyleSheet ratchet is 8 calls after converting that
  local batch.
- Final library home, summary, invalid states, image input, song preview, and
  relationship-section presentation styles now use NativeWind utilities; the
  StyleSheet ratchet is 0 calls after clearing the final new-app batch.
- The first Rostra-backed provider is customization settings. It keeps the
  compatibility hook while exposing selector reads for lower-churn consumers.
- Customization settings, premium entitlement, import session, and playback
  session are all Rostra-backed. Compatibility hooks still exist for a few
  provider modules, but production consumers use selector hooks and the audit
  blocks new React context modules.
- The new app mirrors the old app's NativeWind 4 setup: Expo Babel jsx import
  source, `nativewind/metro`, `globals.css`, `nativewind-env.d.ts`, and a local
  Tailwind config.
