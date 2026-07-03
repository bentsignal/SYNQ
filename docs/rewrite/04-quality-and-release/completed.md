# Quality And Release Completed

- Added `pnpm verify:rewrite`.
- Added deterministic rewrite smoke tests for many pure services and
  screen-state helpers.
- Added hygiene scans for event emitters, direct AsyncStorage boundaries, and
  other new-app architecture risks.
- Kept old-app and new-app iOS export smokes passing at checkpoints.
- Added `pnpm audit:rewrite-debt` and included it in the full rewrite
  verification gate.
- Added custom new-app ESLint coverage for banned `StyleSheet` usage and a
  verifier smoke that proves the rule fails on violations.
- Ratcheted the rewrite debt audit to block new `StyleSheet` references and
  raw `sendHaptic("...")` interaction decisions in the new app.
- Added a shared app-shell native alert presenter and ratcheted the rewrite
  debt audit to block direct feature-level `Alert.alert` calls.
- Added a shared app-shell imperative route presenter and ratcheted the rewrite
  debt audit to block direct feature-level `router.push`/`router.replace`
  calls.
- Ratcheted the rewrite debt audit to block direct feature-level route-param
  parsing outside the app-shell `useNumericRouteParam` boundary.
- Expanded deterministic backup smoke coverage for command result messages and
  document-picker archive URI normalization.
- Added injectable backup command orchestration smoke coverage for backup,
  restore, erase, cancellation, sharing availability, and restore cleanup.
- Added import save-to-library session smoke coverage for successful draft
  cache cleanup and failure-safe cleanup skipping.
- Expanded playback reducer smoke coverage for ad native status, ad completion,
  and native-finished advance/end transitions.
- Added injectable library song command smoke coverage for like, delete,
  export, and metadata update forwarding.
- Added injectable library collection command smoke coverage for export,
  delete, move, remove, and add forwarding.
- Added Wi-Fi import route-handler smoke coverage for transfer start, upload,
  duplicate upload, failure, finish, and reset runtime transitions.
- Added injectable premium purchase executor smoke coverage for tier price
  loading, purchase activation, restore, entitlement checks, fallback tier
  mapping, and unavailable packages.
- Added settings JSON file-store smoke coverage for missing files, corrupt JSON,
  normalized saves, loaded values, and unavailable document-directory failures.
- Added shared export-file executor smoke coverage for sanitized filenames,
  single-file sharing, multi-file copy/share cleanup, cache failures, and copy
  failure cleanup.
- Added import file-cache executor smoke coverage for sanitized filenames,
  cache directory reset, picked-file copies, Wi-Fi base64 writes, cleanup error
  wrapping, draft cache deletion, and unavailable cache directories.
- Added persisted import-session executor smoke coverage for missing files,
  corrupt JSON, cached draft filtering, selected-song fallback, empty-state
  clears, saves, and best-effort cleanup.
- Added image-storage executor smoke coverage for data URL parsing, image path
  planning, variant write plans, duplicate detection, invalid formats, null
  inputs, writes, and stored-image row inserts.
- Added collection image-picker executor smoke coverage for canceled picks,
  empty asset results, MIME fallback/validation, base64 reads, and data URL
  assembly.
- Added playback persistence executor smoke coverage for missing files, corrupt
  JSON, normalized loads, save payloads, clear behavior, and unavailable
  document-directory failures.
- Added library song delete executor smoke coverage for relationship cleanup
  order, song-row deletion, file cleanup, and missing document-directory
  behavior.
- Added import library file executor smoke coverage for library path planning,
  audio copy/cache cleanup order, no-op file deletion, unavailable document
  directories, and copy failures.
- Added import library link executor smoke coverage for normalized artist/album
  reuse and inserts, song relationships, album-cover updates, playlist linking,
  and no-album imports.
- Added import library song row executor smoke coverage for draft insert values,
  path/cover updates, and relationship cleanup order.
- Added backup filesystem executor smoke coverage for document/cache directory
  availability, archive/staging paths, clear/prepare/cleanup behavior, staged
  item reads, and restore replacement move order.
- Added library export metadata executor smoke coverage for metadata shaping,
  artwork embedding, stale snapshot decisions, tag writeback, snapshot marking,
  and failure-safe export fallback behavior.
- Added library export snapshot executor smoke coverage for deterministic hash
  inputs, missing songs, no prior snapshot, fresh snapshots, stale snapshots,
  and exported snapshot updates.
- Added collection delete executor smoke coverage for album, artist, playlist,
  and protected system-playlist deletion behavior.
- Added album artist update executor smoke coverage for name normalization,
  unknown-label filtering, existing/new artist resolution, deduping, and
  relationship replacement.
- Added song metadata relationship executor smoke coverage for name
  normalization, unknown-label filtering, deduping, song join replacement, and
  album-artist link preservation.
- Added collection song membership executor smoke coverage for append order,
  duplicate no-ops, protected playlist guards, and liked-song deletion.
- Added collection song relationship executor smoke coverage for album, artist,
  and playlist reorder/remove dispatch plus protected playlist guards.
- Added collection uniqueness executor smoke coverage for kind-specific lookup
  routing, edit exclusions, and duplicate-name errors.
- Added song metadata update executor smoke coverage for title validation,
  relationship sequencing, album-cover targeting, song-cover fallback, and
  empty saved-cover no-ops.
- Added collection update executor smoke coverage for album, artist, and
  playlist update sequencing, optional image persistence, protected playlists,
  required names, and duplicate-name failures.
- Added collection create executor smoke coverage for album, artist, and
  playlist creation sequencing, optional image persistence, missing insert ids,
  required names, and duplicate-name failures.
- Added collection song add executor smoke coverage for album, artist, and
  playlist dispatch plus ordered batched adds.
- Added library export sharing executor smoke coverage for playable-song
  filtering, sharing availability, export preparation, and share-file
  delegation.
- Added import draft export executor smoke coverage for staged-song file
  mapping, sharing availability, and share-file delegation.
- Added import file-selection executor smoke coverage for canceled picks,
  cache setup, per-file skip behavior, MIME fallback, and Wi-Fi staging.
- Added settings domain smoke coverage for customization defaults/options,
  customization normalization fallbacks, and privacy normalization fallbacks.
- Preserved Wi-Fi import route-handler smoke coverage across the request
  service split for transfer gating, upload acceptance, and response copy.
