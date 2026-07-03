# Performance And State Completed

- Removed event-emitter refresh flows from the new app path.
- Moved many high-traffic state transitions into reducers and typed services.
- Added reactive Drizzle-style query boundaries for major library and edit
  flows.
- Isolated native audio status subscriptions in a focused listener registry.
- Reduced repeated UI structure that could otherwise create broad rerender
  surfaces.
- Added a rewrite debt audit ratchet for new-app `StyleSheet.create` and React
  context usage, wired into `pnpm verify:rewrite`.
- Migrated customization settings from broad React context to a Rostra store,
  added selector reads for theme and haptics, and lowered the context ratchet
  from 4 modules to 3.
- Migrated premium entitlement from broad React context to a Rostra store,
  added selector reads for active/status consumers, and lowered the context
  ratchet from 3 modules to 2.
- Migrated import session from broad React context to a Rostra store, converted
  import and backup consumers to selector reads, and lowered the context
  ratchet from 2 modules to 1.
- Migrated playback session from broad React context to a Rostra store,
  converted playback, library, home, and backup consumers to selector reads,
  and lowered the context ratchet from 1 module to 0.
- Moved remaining Rostra-backed provider modules out of feature `context/`
  folders into `state/`, removed the last broad customization store
  compatibility read, and added a debt-audit guard against new feature context
  directories.
- Configured NativeWind/Tailwind for the new app and converted the first
  app-shell/import/backup components from `StyleSheet.create` to utility
  classes, lowering the StyleSheet ratchet from 111 calls to 106.
- Converted another app-shell/backup presentation batch to utility classes,
  lowering the StyleSheet ratchet from 106 calls to 101.
- Converted the remaining eligible backup action card plus app-shell row
  presentation styles to utility classes, lowering the StyleSheet ratchet from
  101 calls to 96.
- Converted import edit/save/Wi-Fi headers and source panel presentation styles
  to utility classes, lowering the StyleSheet ratchet from 96 calls to 92.
- Converted import gate/panel components and premium screen presentation
  components to utility classes, lowering the StyleSheet ratchet from 92 calls
  to 83.
- Converted import edit/save/Wi-Fi action rows and links to utility classes,
  lowering the StyleSheet ratchet from 83 calls to 79.
- Converted settings component presentation styles to utility classes, lowering
  the StyleSheet ratchet from 79 calls to 71.
- Converted import edit fields/invalid state/save toggle/Wi-Fi address panel
  plus playback queue empty/session/list/control-button presentation styles to
  utility classes, lowering the StyleSheet ratchet from 71 calls to 63.
- Converted import edit/files/save/Wi-Fi screen containers to utility classes,
  lowering the StyleSheet ratchet from 63 calls to 59.
- Converted playback ad-break panels, player control rows, and queue row action
  buttons to utility classes, lowering the StyleSheet ratchet from 59 calls to
  55.
- Converted the final import home/result/song-preview row styles to utility
  classes, clearing import components of StyleSheet usage and lowering the
  StyleSheet ratchet from 55 calls to 52.
- Converted remaining playback screen, mini-player, now-playing, and queue row
  presentation styles to utility classes, lowering the StyleSheet ratchet from
  52 calls to 47.
- Converted collection form and edit-library-song form presentation styles to
  utility classes, lowering the StyleSheet ratchet from 47 calls to 39.
- Converted add-to-collection library screen/header/list/status presentation
  styles to utility classes, lowering the StyleSheet ratchet from 39 calls to
  31.
- Converted shared library action parts and song row actions to utility
  classes, lowering the StyleSheet ratchet from 31 calls to 27.
- Converted collection list/detail screen, header, search, list, and status
  presentation styles to utility classes, lowering the StyleSheet ratchet from
  27 calls to 19.
- Converted song detail header/panels/view and song list controls to utility
  classes, lowering the StyleSheet ratchet from 19 calls to 15.
- Converted collection preview and collection song list presentation styles to
  utility classes, lowering the StyleSheet ratchet from 15 calls to 8.
- Converted the final library home, summary, invalid states, image input, song
  preview, and relationship-section presentation styles to utility classes,
  clearing new-app `StyleSheet.create` usage and lowering the ratchet from 8
  calls to 0.
