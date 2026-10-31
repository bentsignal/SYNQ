# @synq/db

The 3.0 library database (`Documents/SQLite/library.db`): Drizzle schema and
migrations, typed library queries and writes, and the 2.5.2 importer. The
plan of record is `docs/rewrite.md` ("Data"); the 2.5.2 → 3.0 mapping and the
importer's contract are in `docs/migration.md`.

| Entry             | What                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `@synq/db`        | `LibraryDb`, `schema`, `libraryMigrations`, every query and write                                                       |
| `@synq/db/legacy` | `importLegacyLibrary`, `readLegacyAsyncStorage`, `findLegacyBackupRoot`, settings types                                 |
| `@synq/db/expo`   | App wiring: `openLibraryDb`, `migrateLibraryDb`, `openLegacyDatabaseCopy`, `createExpoLegacyFileSystem`, `documentFile` |
| `@synq/db/schema` | The Drizzle tables, for ad-hoc queries                                                                                  |

Only `@synq/db/expo` imports native modules (`expo-sqlite`,
`expo-file-system`); everything else runs in node.

## Conventions

- **Synchronous driver.** `LibraryDb` is any sync Drizzle SQLite database.
  Drizzle's expo-sqlite transactions are synchronous (an async callback
  would commit before its awaits ran), so every function here is sync and
  uses `.run()/.all()/.get()`. Wrap them in TanStack `queryFn`s as they are.
- **Plain objects out.** Queries return serializable objects (no Drizzle
  rows with methods, no Dates). Times are ms since the epoch; durations
  are ms.
- **Writes report what changed.** Every write returns
  `{ value, changed: LibraryTable[] }`. Invalidate the queries that read
  those tables (see below). Writes that delete entities return
  `deletePaths` (folders relative to `Documents/`) for the app to remove
  **after** the call returns (the commit happened by then).
- **Paths are relative to `Documents/`** (`library/12/song.mp3`,
  `albums/3/cover_small.jpg`). Resolve them with `documentFile(path)` from
  `@synq/db/expo`, which joins **segments**. Never build a URI string by
  concatenation: expo-file-system parses a single string as a URL, so a
  2.5.2 file named `Song #2 & more.m4a` would be cut at the `#`.
- **Artwork** is `ArtworkRef | null` (`{ kind, id, version }`); the files are
  `cover_full.jpg` (≤1500 px) and `cover_small.jpg` (≤200 px) in the
  entity's folder. `artworkUri(Paths.document.uri, ref, size)` adds
  `?v=version` so expo-image never shows a stale cover. After writing or
  deleting cover files, call `setArtwork(db, { kind, id, present })`. A legacy
  entity may have only one of the two sizes; fall back to the other.
- **Sorting and search run in JS** with `Intl.Collator` (ICU), because
  SQLite's `NOCASE`/`LOWER` fold only ASCII. Search matches every
  whitespace-separated term, ignoring case and accents.
- **Name matching** (import find-or-create): see `src/library/matching.ts`.
  Artists and albums match ignoring case, preferring an exact-case match,
  so 2.5.2's case-variant duplicates keep their songs. Artist tags split
  on commas, except that a run of pieces naming an existing artist
  ("Tyler, The Creator") stays whole.

## Wiring it into the app

```ts
import { Paths } from "expo-file-system";

import { ensureLikedPlaylist } from "@synq/db";
import {
  createExpoLegacyFileSystem,
  hasLegacyDatabase,
  legacyAsyncStorageDirectory,
  migrateLibraryDb,
  openLegacyDatabaseCopy,
  openLibraryDb,
} from "@synq/db/expo";
import {
  getLegacyImport,
  importLegacyLibrary,
  readLegacyAsyncStorage,
} from "@synq/db/legacy";

export async function openLibrary() {
  const { db } = openLibraryDb(); // foreign_keys ON, WAL
  await migrateLibraryDb(db); // 1. Drizzle migrations first

  if (hasLegacyDatabase() && !getLegacyImport(db)) {
    // 2. then the 2.5.2 import (splash stays up)
    const asyncStorageDir = legacyAsyncStorageDirectory(
      "com.directedbyshawn.synq",
    );
    const fs = createExpoLegacyFileSystem([Paths.document, asyncStorageDir]);
    const legacy = await openLegacyDatabaseCopy();
    try {
      const result = await importLegacyLibrary({
        legacyDb: legacy.legacyDb,
        targetDb: db,
        fs,
        root: Paths.document.uri,
        source: "install",
        asyncStorage: await readLegacyAsyncStorage(asyncStorageDir.uri, fs),
      });
      // result.settings → kv-store (see docs/migration.md, "Settings")
    } finally {
      await legacy.close();
    }
  }
  ensureLikedPlaylist(db); // 3. a fresh install needs Liked Songs
  return db;
}
```

Migrations are bundled as strings in `src/migrations.ts`, so the app needs
**no** babel `inline-import` plugin and **no** Metro `sourceExts` change
(Drizzle's documented `migrations.js` needs both). `useMigrations` from
`drizzle-orm/expo-sqlite/migrator` also accepts `libraryMigrations` if you
prefer the hook. Metro must be able to resolve `.ts` imports with explicit
extensions (Vera's config already does).

### Query invalidation

| Table changed                            | Queries to invalidate                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `songs`                                  | songs list, song detail, playlist songs, album tracks, artist detail, search, playlist/album totals |
| `song_artists`, `artists`                | songs list, song detail, artists list, artist detail, search                                        |
| `album_songs`, `albums`, `album_artists` | songs list (album names, artwork), albums list, album detail/tracks, artist detail, search          |
| `playlists`, `playlist_songs`            | playlists list, playlist detail/songs, song detail (`liked`, `playlistIds`)                         |

A simple start: key every query `["library", table, ...]` by its primary
table and invalidate `["library"]` for any write. Refine using `changed`.

## Scripts

| Script             | Does                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`        | `node --test` on every `src/**/*.test.ts` (Node 24, built-in `node:sqlite`; no native builds)                        |
| `pnpm typecheck`   | `tsgo --noEmit` (strict, `noUncheckedIndexedAccess`, erasable syntax only)                                           |
| `pnpm lint`        | Placeholder until `tooling/eslint` lands: unused-code check plus a check that `src/migrations.ts` matches `drizzle/` |
| `pnpm db:generate` | After a schema change: `drizzle-kit generate`, then re-bundle `src/migrations.ts`. Commit both                       |

## Tests

Tests run Drizzle's real `drizzle-orm/expo-sqlite` driver and migrator over
a small `node:sqlite` shim (`src/testing/node-sqlite.ts`), so they execute
the same SQL the app does.

- `src/testing/legacy-ddl.ts` is 2.5.2's DDL, verbatim from its `Model.ts`.
- `src/testing/synthetic-install.ts` builds a messy 2.5.2 container on disk
  (database written with 2.5.2's own model SQL, audio, covers, and an
  AsyncStorage directory with an MD5-named queue file).
- `src/legacy/import-legacy-library.test.ts` asserts the whole migrated
  library row by row, the settings, idempotency, rollback, legacy files left
  untouched, v1-era and damaged databases, and backup roots.
- `src/legacy/real-fixture.test.ts` imports the real 2.5.2 container
  captured from the simulator when it exists
  (`/Users/shawn/dev/worktrees/synq-legacy-fixture/container`, or
  `SYNQ_LEGACY_FIXTURE`); it's skipped otherwise. To pin exact
  expectations, add `expected.json` (`{ counts, settings }`) next to
  `container/`.
