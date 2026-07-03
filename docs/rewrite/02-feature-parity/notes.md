# Feature Parity Notes

- Treat `apps/old` as the truth source for expected behavior unless a new
  design decision is explicitly documented.
- Parity evidence should be stronger than "tests pass"; record command output,
  manual checks, screenshots, or smoke coverage where appropriate.
- Do not remove old-app behavior until new-app parity is proven.

## Route Audit Evidence

- Old `/import/export` now resolves in the new app as an alias to the import
  save screen. The new screen owns draft export via
  `use-import-save-export-actions.ts` and `ImportSaveActions.tsx` alongside
  save/discard actions.
- Old Home `Files` and `Network` import entry points are restored as direct
  new Home quick actions to `/(tabs)/import/files` and
  `/(tabs)/import/wifi`. The generic import hub remains available through the
  tab bar and nested import routes.
- Old Home instruction modal coverage is restored as a new Home setup guide
  section with Spotify setup, export flow, and network transfer guidance. This
  keeps the behavior in app-shell view state instead of reintroducing broad
  modal context.
- Old `/ingest/*` was an earlier import stack with placeholder export/save
  steps plus direct file-browser processing. It is intentionally replaced by
  the new import feature; `apps/new/app/ingest/*` now exists only as
  compatibility routes to the new import file, Wi-Fi, export/save, success, and
  failure screens.
- Old top-level collection and song routes mostly moved under
  `/(tabs)/library/*`. Treat route-shape changes as acceptable only after each
  linked flow is manually checked from new navigation.
- Old `/album/reorder` drag ordering is intentionally replaced by inline
  persisted Up/Down song controls on new collection detail rows. This applies
  to albums, artists, and playlists instead of only albums.
- Old `/player/edit` exposed active-track options from the player. New player
  now exposes `Edit song` for the active track when playback commands are not
  blocked by an ad gate, routing to the existing library song edit flow.
- New settings privacy/support routes are additional surface, not old-to-new
  gaps. Old support/social actions were inline settings actions.
- Backup and premium have no obvious primary route gaps in the first-pass audit.

## Edit/Delete/Export Audit Evidence

- Song detail now subscribes to Liked Songs membership through
  `buildLibrarySongDetailLikedRowsQuery`, matching the existing mutation path
  that toggles `playlistSongs` rows for the seeded liked playlist.
- Nash completed a read-only edit/delete/export audit. Verified parity:
  song delete, song export, collection create/edit/delete/export. Intentional
  replacements: song title/artist/album editing via comma-separated metadata
  fields, collection song add/remove/reorder via unified detail rows.
- Old song cover editing is restored in the new edit-song flow. The new detail
  model prefers song-specific cover hashes and falls back to linked album cover
  hashes for display; saves apply picked covers to the first linked album or to
  the song row when the song has no album, matching the old edit behavior.
- Old album artist relationship editing is restored in the new edit-album flow.
  The old app used an add-artist selection screen; the rewrite intentionally
  uses a comma-separated Artists field, matching the new song metadata editing
  pattern while still replacing `artistsAlbums` relationships on save.
- Seeded system playlist exposure was closed by filtering playlist id `1` from
  previews and blocking its collection mutations.

## Backup And Reset Evidence

- New backup erase clears the document directory through
  `clearBackupDocumentDirectory`, reconnects the Drizzle database, and then the
  backup screen controller resets import and playback runtime sessions on the
  successful erase phase transition.
- New backup restore stages the selected archive in cache, replaces the document
  directory with staged archive contents, reconnects the database, cleans the
  staging directory, and resets import and playback runtime sessions on the
  successful restore phase transition.
- Import session persistence lives under `documentDirectory/import/session.json`
  and playback persistence lives under `documentDirectory/playback/session.json`;
  replacing or erasing the document directory clears both persisted runtime
  sessions, while the backup controller reset also clears their in-memory stores.
- Backup restore/erase also reloads the mounted customization settings store so
  the live theme/haptics state follows the restored/default file-backed settings
  without waiting for an app restart.
- Backup restore/erase phase-transition side effects now live in
  `use-backup-phase-effects`, keeping the runtime reset behavior explicit and
  isolated from the screen action controller.
- Import session reset now clears both the persisted import session JSON and the
  staged import cache directory, matching backup reset expectations for
  realistic partially staged imports.

## Premium And Settings Evidence

- Old settings support parity is restored in the new Support screen. The new
  support action list now includes `Leave a Review`, `Contact Support`, `X`,
  `Instagram`, and `Discord`; URL actions still open externally, while the
  review action uses `expo-store-review` when the platform supports the native
  store prompt.
