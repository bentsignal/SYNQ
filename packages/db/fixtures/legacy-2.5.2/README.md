# Real SYNQ 2.5.2 install

A library built by hand through the real SYNQ 2.5.2 (build 77) Release app
on an iOS 27.0 simulator on 2026-10-31, then copied out of the app's data
container. `src/legacy/real-fixture.test.ts` imports it and asserts the
exact result; [EXPECTED.md](EXPECTED.md) records every UI action and what a
correct migration must reproduce.

| Path                                                                                      | What                                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container/Documents/`                                                                    | The app's `Documents/`: `SQLite/synq.db`, `library/`, `albums/`, `artists/`, `playlists/`, and the `backup.zip` that Settings > Backup leaves behind |
| `container/Library/Application Support/com.directedbyshawn.synq/RCTAsyncLocalStorage_V1/` | AsyncStorage: `manifest.json` and the out-of-line `queue` file (MD5 of `queue`)                                                                      |
| `backup/synq-2.5.2-backup.zip`                                                            | The real Settings > Backup archive of the same library (identical to `container/Documents/backup.zip`, so git stores it once)                        |
| `EXPECTED.md`                                                                             | The capture notes, verbatim                                                                                                                          |

## How it was made

- The 2.5.2 simulator builds and how to rebuild them:
  `~/Library/Caches/synq/legacy-2.5.2/BUILD.md` on Shawn's Mac. The library
  was built with the `premium-toggle` variant (unmodified 2.5.2 plus a
  Settings toggle that persists `expiration = "never"`).
- The source audio, artwork, screenshots of every step, and the scripts
  that made the audio, drove the Wi-Fi transfer, and generated EXPECTED.md
  (`tools/`) are in `/Users/shawn/dev/worktrees/synq-legacy-fixture/`. They
  aren't committed (about 35 MB, mostly screenshots).

## What differs from the capture

- PostHog's files (`Documents/.posthog-rn.json`, `posthog.*` and
  `posthog.replayFolder/` in Application Support) were dropped as noise.
- The empty `undefined/` folders under `albums/`, `artists/`, and
  `playlists/` were dropped. Git doesn't keep empty folders either, so the
  other empty cover folders (`albums/3`, `artists/2`–`7`, ...) are absent in
  a checkout. Both mean "no artwork" to the importer. The backup zip still
  has all of them.
- Git on macOS stores file names precomposed (NFC), so a checkout has
  `library/10/Café Ünïcødé.mp3` and `library/18/Saoirse Ní Bhriain - Dew Point.flac`
  in NFC, while the device had them in NFD. The backup zip keeps the
  device's NFD bytes, and the test pins them there.
- Cover mtimes (the importer's `artwork_version`) are whatever the checkout
  or unzip set, so the test checks artwork presence, not versions.

## Decisions EXPECTED.md left open

EXPECTED.md was written before these were decided; the test asserts the
decisions, which `docs/migration.md` ("Edge cases") records:

- Untitled songs (13–16, 18) are titled with their file name without its
  extension (`LOUD`, `field recording`), not left empty.
- Blueprints' packed m4a track numbers (196609–196611) are decoded to 1–3.
- Playlists keep their add order (`playlistSongs.id`), not the songs-table
  order 2.5.2 displayed.
