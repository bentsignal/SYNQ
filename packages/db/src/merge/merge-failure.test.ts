/**
 * A restore that fails or is cut short leaves the library exactly as it was.
 * See docs/rewrite.md → Restoring a backup.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { sql } from "drizzle-orm";

import { dumpLibrary } from "../testing/dump-library.ts";
import {
  copyTree,
  library,
  memoryJournal,
  merge,
  MERGED_AT,
  nodeMergeFileSystem,
  read,
  titles,
} from "../testing/merge-fixture.ts";
import { hashTree } from "../testing/run-import.ts";
import {
  mergeBackup,
  readLibrarySnapshot,
  recoverInterruptedMerge,
} from "./index.ts";

async function pair() {
  const current = await library();
  current.song(1, "Mine", "mine");
  current.album(1, "Album");
  current.playlist(1, "Mix", [1]);
  const backup = await library();
  backup.song(1, "Theirs", "theirs", { cover: "art" });
  backup.song(2, "More", "more");
  backup.album(1, "Album", { cover: "album art" });
  backup.playlist(1, "Mix", [1, 2]);
  return { backup, current };
}

void test("a file that won't move leaves the library exactly as it was", async () => {
  const { backup, current } = await pair();
  const dump = dumpLibrary(current.db);
  const tree = hashTree(current.root);
  let moved = 0;
  await assert.rejects(
    merge(current, backup, (fs) => ({
      ...fs,
      move: async (from, to) => {
        moved += 1;
        if (moved === 3) throw new Error("disk full");
        await fs.move(from, to);
      },
    })),
    /disk full/,
  );
  assert.deepEqual(dumpLibrary(current.db), dump);
  assert.deepEqual(hashTree(current.root), tree);
  assert.equal(existsSync(join(current.root, "library/2")), false);
  assert.equal(existsSync(join(current.root, "albums/1")), false);
});

void test("a transaction that fails rolls back and removes the files", async () => {
  const { backup, current } = await pair();
  current.db.run(
    sql`CREATE TRIGGER no_more BEFORE INSERT ON playlist_songs BEGIN SELECT RAISE(ABORT, 'database full'); END`,
  );
  const dump = dumpLibrary(current.db);
  const tree = hashTree(current.root);
  await assert.rejects(merge(current, backup));
  assert.deepEqual(dumpLibrary(current.db), dump);
  assert.deepEqual(hashTree(current.root), tree);
  assert.equal(existsSync(join(current.root, "library/2")), false);

  // And the next try, with the problem gone, works.
  current.db.run(sql`DROP TRIGGER no_more`);
  await merge(current, backup);
  assert.deepEqual(titles(current.db), ["Mine", "Theirs", "More"]);
  const theirs = dumpLibrary(current.db).songs[1]?.filePath;
  assert.ok(theirs !== null && theirs !== undefined);
  assert.equal(read(current, theirs), "theirs");
});

void test("the next launch clears a merge the app didn't live to finish", async () => {
  const { backup, current } = await pair();
  const dump = dumpLibrary(current.db);
  const tree = hashTree(current.root);
  const journal = memoryJournal();
  const real = nodeMergeFileSystem(copyTree(backup.root), current.root);
  let moved = 0;
  await assert.rejects(
    mergeBackup({
      backup: readLibrarySnapshot(backup.db),
      db: current.db,
      // Killed: the third move never comes back, and no clean-up runs.
      fs: {
        ...real,
        move: async (from, to) => {
          moved += 1;
          if (moved === 3) throw new Error("killed");
          await real.move(from, to);
        },
        removeFile: () => undefined,
        removeFolder: () => undefined,
      },
      journal: { ...journal, clear: () => undefined },
      now: MERGED_AT,
    }),
  );
  assert.notDeepEqual(hashTree(current.root), tree, "files were left behind");
  assert.notEqual(journal.read(), null);

  recoverInterruptedMerge(current.db, real, journal);

  assert.deepEqual(hashTree(current.root), tree);
  assert.deepEqual(dumpLibrary(current.db), dump);
  assert.equal(journal.read(), null);
});

void test("killed after committing, the next launch keeps it all", async () => {
  const { backup, current } = await pair();
  const journal = memoryJournal();
  const real = nodeMergeFileSystem(copyTree(backup.root), current.root);
  await mergeBackup({
    backup: readLibrarySnapshot(backup.db),
    db: current.db,
    fs: real,
    journal: { ...journal, clear: () => undefined },
    now: MERGED_AT,
  });
  const dump = dumpLibrary(current.db);
  const tree = hashTree(current.root);
  assert.notEqual(journal.read(), null);

  recoverInterruptedMerge(current.db, real, journal);

  assert.deepEqual(dumpLibrary(current.db), dump);
  assert.deepEqual(hashTree(current.root), tree);
  assert.equal(journal.read(), null);
});
