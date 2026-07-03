# Feature Parity Completed

- Added first-pass new-app flows for import, save review, Wi-Fi transfer,
  library previews, song detail, collection detail, backup, premium, settings,
  and playback surfaces.
- Added new-app song edit route and metadata update flow.
- Added collection create/edit/delete/add-song flows with protected delete
  behavior for seeded collections.
- Added new-app library export actions for songs and collections.
- Added import-review draft export and save-to-library behavior.
- Reset live playback and staged import provider state after backup
  restore/erase.
- Completed a first-pass old/new route and primary-screen audit across import,
  ingest, library, playback, settings, backup, and premium.
- Replaced old `/player/edit` active-track options access with an `Edit song`
  link on the new player screen that routes to the library song edit flow.
- Intentionally replaced old `/album/reorder` with inline persisted Up/Down
  song ordering controls on the new collection detail rows.
- Restored `/import/export` route parity as an alias to the new import save
  screen, where draft export and save/discard actions now live together.
