import assert from "node:assert/strict";
import { test } from "node:test";

import { BACKUP_FORMAT, backupKind, manifestFrom } from "./manifest.ts";

void test("tells 3.0 backups from 2.5.2 ones by their entries", () => {
  assert.equal(backupKind(["manifest.json", "library.db", "library/1/a.mp3"]), "synq");
  assert.equal(backupKind(["SYNQ Backup/manifest.json", "SYNQ Backup/library.db"]), "synq");
  assert.equal(backupKind(["SQLite/synq.db", "library/3/song.mp3", ".posthog-rn.json"]), "legacy");
  assert.equal(backupKind(["Documents/SQLite/synq.db"]), "legacy");
  assert.equal(backupKind(["__MACOSX/SQLite/synq.db"]), null);
  assert.equal(backupKind(["a/b/SQLite/synq.db"]), null);
  assert.equal(backupKind(["photo.jpg"]), null);
});

void test("reads a manifest, refusing anything else", () => {
  assert.deepEqual(manifestFrom({ createdAt: 5, format: BACKUP_FORMAT, version: 1 }), {
    createdAt: 5,
    format: BACKUP_FORMAT,
    version: 1,
  });
  assert.equal(manifestFrom({ format: "other", version: 1 }), null);
  assert.equal(manifestFrom({ format: BACKUP_FORMAT, version: "1" }), null);
  assert.equal(manifestFrom(null), null);
});
