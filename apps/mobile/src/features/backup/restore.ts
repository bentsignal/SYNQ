import { unzip } from "react-native-zip-archive";
import { Directory, File } from "expo-file-system";

import {
  createExpoLegacyFileSystem,
  migrateLibraryDb,
  openLegacyDatabaseCopy,
  openLibraryDbIn,
} from "@synq/db/expo";
import { findLegacyBackupRoot, importLegacyLibrary } from "@synq/db/legacy";
import {
  isNewerLibrarySchema,
  mergeBackup,
  readLibrarySnapshot,
} from "@synq/db/merge";

import { libraryDb } from "~/features/library/database";
import { queryClient } from "~/lib/query-client";
import { pathOf, resetWork, withZipProgress } from "./backup";
import { BACKUP_VERSION, manifestFrom } from "./manifest";
import {
  clearWork,
  restoreFileSystem,
  restoreJournal,
  WORK,
} from "./restore-files";

/**
 * Restoring a backup: a 3.0 one, or a 2.5.2 one (a zip of its Documents, with
 * `SQLite/synq.db`; docs/migration.md). It's read into a library database of
 * its own and merged into the current library, replacing nothing
 * (`@synq/db/merge`, docs/rewrite.md → Restoring a backup).
 */

/** The share of a restore's progress that's unzipping; the rest is the merge. */
const UNZIP_SHARE = 0.4;

/** Why a restore stopped, when it's something the person can act on. */
export class RestoreError extends Error {
  readonly code: "newer" | "not-a-backup";

  constructor(code: RestoreError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

/** How long the merge works before the UI gets a turn: about a frame. */
const WORK_MS = 16;

let workingSince = 0;

/**
 * Lets the UI run once the merge has worked for a frame. A timer takes a frame
 * to fire, so waiting after every small file would cost more than the work.
 */
function pause() {
  if (Date.now() - workingSince < WORK_MS) return Promise.resolve();
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      workingSince = Date.now();
      resolve();
    }, 0);
  });
}

/** Finds a 3.0 backup's root: the extraction folder or one level down. */
function findManifestRoot(extracted: Directory) {
  if (new File(extracted, "manifest.json").exists) return extracted;
  for (const entry of extracted.list()) {
    if (
      entry instanceof Directory &&
      !entry.name.startsWith(".") &&
      new File(entry, "manifest.json").exists
    ) {
      return entry;
    }
  }
  return null;
}

/** A 3.0 backup's library, on the schema this app reads. */
async function readBackupLibrary(root: Directory) {
  if (!new File(root, "library.db").exists) {
    throw new RestoreError("not-a-backup", "Not a SYNQ backup.");
  }
  const { close, db } = openLibraryDbIn(root);
  if (isNewerLibrarySchema(db)) {
    close();
    throw new RestoreError("newer", "This backup is from a newer SYNQ.");
  }
  return migrateLibraryDb(db)
    .then(() => readLibrarySnapshot(db))
    .then(
      (library) => {
        close();
        return library;
      },
      (error: unknown) => {
        close();
        throw error;
      },
    );
}

/** A 2.5.2 backup's library, through the same importer as an upgrade. */
async function readLegacyBackupLibrary(
  extracted: Directory,
  legacyRoot: string,
) {
  const root = new Directory(legacyRoot);
  const legacy = await openLegacyDatabaseCopy(new Directory(root, "SQLite"));
  const scratch = new Directory(WORK, "scratch");
  scratch.create({ intermediates: true });
  const { close, db } = openLibraryDbIn(scratch);
  async function closeBoth() {
    close();
    await legacy.close();
  }
  return migrateLibraryDb(db)
    .then(() =>
      importLegacyLibrary({
        asyncStorage: null,
        fs: createExpoLegacyFileSystem([extracted]),
        legacyDb: legacy.legacyDb,
        root: legacyRoot,
        source: "backup",
        targetDb: db,
      }),
    )
    .then(() => readLibrarySnapshot(db))
    .then(
      async (library) => {
        await closeBoth();
        return library;
      },
      async (error: unknown) => {
        await closeBoth();
        throw error;
      },
    );
}

/**
 * Adds a picked backup to the library, replacing nothing, and says what it
 * added. Nothing changes unless all of it works. `onProgress` covers the whole
 * thing. Throws `RestoreError` for a file it can't read as a SYNQ backup.
 */
export async function restoreLibrary(
  uri: string,
  onProgress: (fraction: number) => void,
) {
  resetWork();
  return mergeExtracted(uri, onProgress).then(
    async (summary) => {
      void queryClient.invalidateQueries({ queryKey: ["library"] });
      await clearWork();
      return summary;
    },
    async (error: unknown) => {
      await clearWork();
      throw error;
    },
  );
}

/** Reads a backup from wherever it extracts to, as a library and its folder. */
async function readExtracted(extracted: Directory) {
  const root = findManifestRoot(extracted);
  if (root !== null) {
    const manifest = manifestFrom(
      JSON.parse(new File(root, "manifest.json").textSync()),
    );
    if (manifest === null) {
      throw new RestoreError("not-a-backup", "Not a SYNQ backup.");
    }
    if (manifest.version > BACKUP_VERSION) {
      throw new RestoreError("newer", "This backup is from a newer SYNQ.");
    }
    return { backup: await readBackupLibrary(root), root };
  }
  const legacyRoot = await findLegacyBackupRoot(
    createExpoLegacyFileSystem([extracted]),
    extracted.uri.replace(/\/$/, ""),
  );
  if (legacyRoot === null) {
    throw new RestoreError("not-a-backup", "Not a SYNQ backup.");
  }
  return {
    backup: await readLegacyBackupLibrary(extracted, legacyRoot),
    root: new Directory(legacyRoot),
  };
}

async function mergeExtracted(
  uri: string,
  onProgress: (fraction: number) => void,
) {
  const extracted = new Directory(WORK, "extracted");
  extracted.create({ intermediates: true });
  await withZipProgress(
    (fraction) => onProgress(fraction * UNZIP_SHARE),
    () => unzip(pathOf(new File(uri)), pathOf(extracted)),
  );
  const { backup, root } = await readExtracted(extracted);
  return mergeBackup({
    backup,
    db: libraryDb(),
    fs: restoreFileSystem(root),
    journal: restoreJournal,
    onProgress: (fraction) =>
      onProgress(UNZIP_SHARE + fraction * (1 - UNZIP_SHARE)),
    pause,
  });
}
