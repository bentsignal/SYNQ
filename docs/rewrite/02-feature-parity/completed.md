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
- Restored old `/ingest/*` route compatibility by routing those entry points to
  the new import file, Wi-Fi, export/save, success, and failure screens.
- Restored reactive song-detail liked-state reads so the new Like/Unlike action
  reflects `playlistSongs` membership in the seeded Liked Songs playlist.
- Restored seeded system-playlist protection by hiding playlist id `1` from new
  previews and blocking edit/add/reorder/remove mutations for that playlist.
- Restored old song cover editing in the new song edit flow, including picked
  cover previews, image persistence, album-cover fallback, and export snapshot
  invalidation through the existing song metadata save path.
- Restored old album artist relationship editing in the new album edit flow with
  a comma-separated Artists field that replaces `artistsAlbums` rows on save and
  creates missing artist records through the collection update repository.
- Restored old settings review/support parity in the new Support screen,
  including native store review prompting plus support and social links.
- Restored old Home direct import-entry parity by exposing separate Files and
  Wi-Fi quick actions that route to the new import feature's file and network
  screens.
