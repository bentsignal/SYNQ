# Feature Parity Todo

- [x] Audit each `apps/old` primary route/screen against `apps/new`.
- [ ] Close missing behavior in import, save-to-library, playback, backup,
  premium, settings, and all library collection flows.
- [ ] Decide whether old `/ingest/*` is obsolete or must be rebuilt in the new
  import feature.
- [x] Decide whether old `/import/export` needs a distinct new route or whether
  new save-screen export is the intended replacement.
- [x] Add or intentionally replace old album reorder parity.
- [x] Add active-player edit/options access or intentionally replace old
  `/player/edit` behavior.
- [ ] Verify edit/delete/export behavior for songs, playlists, albums, and
  artists against the old app.
- [ ] Confirm backup restore, erase, and import-session reset behavior with
  realistic data.
- [ ] Complete final parity audit before declaring the rewrite done.
