/**
 * Checks a simulator's SYNQ data container after 3.0 was installed over the
 * real 2.5.2 fixture (`scripts/upgrade-test.sh` runs it):
 *
 *   node scripts/verify-upgrade.ts manifest <container> <out.json>
 *       hashes 2.5.2's files (Documents and its AsyncStorage folder)
 *   node scripts/verify-upgrade.ts check <container> <run dir> <label> [options]
 *       compares the container with the fixture's expected migration and
 *       with `<run dir>/legacy-files.json`, writes `<run dir>/<label>.json`,
 *       and, for `relaunch`, compares the library with `first.json`.
 *       Options: `--theme <id>` (default: purple, the fixture's 2.5.2
 *       theme, which 3.0 keeps); `--fresh-session` (3.0
 *       hasn't played yet, so the session is exactly 2.5.2's); `--file
 *       <id>=<name>` (a song's file was renamed in this copy of the fixture)
 *
 * It reads copies of `library.db` and `preferences.db`, never the app's
 * own files. Prints one line per check and exits 1 if any failed.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite/driver";

import * as schema from "../src/schema.ts";
import { dumpLibrary } from "../src/testing/dump-library.ts";
import { NodeExpoDatabase } from "../src/testing/node-sqlite.ts";
import {
  assertExactLibrary,
  EXPECTED_COUNTS,
  EXPECTED_SETTINGS,
  EXPECTED_WARNINGS,
} from "../src/testing/real-fixture-assert.ts";
import { BUNDLE_ID } from "../src/testing/synthetic-install.ts";

/** The 2.5.2 folders 3.0 must leave byte for byte as they were. */
const LEGACY_ROOTS = [
  "Documents",
  join("Library", "Application Support", BUNDLE_ID),
];

/** Files 3.0 adds next to 2.5.2's, which the legacy check allows. */
const NEW_FILE =
  /^Documents\/SQLite\/(library|preferences)\.db(-wal|-shm|-journal)?$/;

/** PostHog's own files (2.5.2's and 3.0's SDKs both write them): not library data. */
const ANALYTICS_FILE = /^(\.posthog-rn\.json|posthog\.)/;

/**
 * sha256 of every file under the legacy roots but PostHog's, keyed by raw
 * relative path.
 */
function hashLegacyFiles(container: string) {
  const files = new Map<string, string>();
  function walk(relative: string) {
    const absolute = join(container, relative);
    if (!existsSync(absolute)) return;
    if (statSync(absolute).isDirectory()) {
      for (const name of readdirSync(absolute)) {
        if (!ANALYTICS_FILE.test(name)) walk(join(relative, name));
      }
      return;
    }
    files.set(
      relative,
      createHash("sha256").update(readFileSync(absolute)).digest("hex"),
    );
  }
  for (const root of LEGACY_ROOTS) walk(root);
  return files;
}

/** Widens `JSON.parse`'s `any`, so callers check what they read. */
function asUnknown(value: unknown) {
  return value;
}

function readJsonFile(path: string) {
  return asUnknown(JSON.parse(readFileSync(path, "utf8")));
}

/** Copies a SQLite database and its WAL files, so reading it changes nothing. */
function copyDatabase(path: string) {
  const dir = mkdtempSync(join(tmpdir(), "synq-verify-"));
  const copy = join(dir, "copy.db");
  for (const suffix of ["", "-wal", "-shm"]) {
    if (existsSync(path + suffix)) copyFileSync(path + suffix, copy + suffix);
  }
  return {
    path: copy,
    remove: () => rmSync(dir, { force: true, recursive: true }),
  };
}

function parseValue(value: string) {
  try {
    return asUnknown(JSON.parse(value));
  } catch {
    return value;
  }
}

/** Every key of the app's kv-store (`expo-sqlite/kv-store`), JSON-decoded. */
function readKvStore(path: string) {
  const values = new Map<string, unknown>();
  if (!existsSync(path)) return values;
  const copy = copyDatabase(path);
  try {
    const db = new DatabaseSync(copy.path);
    for (const row of db.prepare("SELECT key, value FROM storage").all()) {
      values.set(String(row.key), parseValue(String(row.value)));
    }
    db.close();
    return values;
  } finally {
    copy.remove();
  }
}

let failures = 0;

function check(name: string, run: () => string | void) {
  try {
    const note = run();
    console.log(`PASS ${name}${note ? `: ${note}` : ""}`);
  } catch (error) {
    failures += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.log(`FAIL ${name}\n${message.replace(/^/gm, "     ")}`);
  }
}

function option(args: readonly string[], name: string) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function manifest(container: string, out: string) {
  // 3.0's own files may exist already (a retried import); they aren't 2.5.2's.
  const files = new Map(
    [...hashLegacyFiles(container)].filter(([path]) => !NEW_FILE.test(path)),
  );
  writeFileSync(out, `${JSON.stringify(Object.fromEntries(files), null, 2)}\n`);
  console.log(`${files.size} legacy files hashed to ${out}`);
}

function checkLegacyFiles(container: string, runDir: string) {
  check("2.5.2's files are untouched", () => {
    const stored = readJsonFile(join(runDir, "legacy-files.json"));
    assert.ok(typeof stored === "object" && stored !== null);
    const before = new Map(
      Object.entries(stored).map(([path, hash]) => [path, String(hash)]),
    );
    const after = hashLegacyFiles(container);
    const changed = [...before].filter(
      ([path, hash]) => after.get(path) !== hash,
    );
    const added = [...after.keys()].filter((path) => !before.has(path));
    assert.deepEqual(changed, [], "changed or missing legacy files");
    assert.deepEqual(
      added.filter((path) => !NEW_FILE.test(path)),
      [],
      "unexpected new files",
    );
    return `${before.size} files identical; 3.0 added ${added.join(", ")}`;
  });
}

/** Checks library.db; returns its import record and contents, or null if it has none. */
function checkLibrary(documents: string, fileNames: Record<number, string>) {
  const libraryPath = join(documents, "SQLite", "library.db");
  if (!existsSync(libraryPath)) {
    check("library.db exists", () => assert.fail(`${libraryPath} is missing`));
    return null;
  }
  const copy = copyDatabase(libraryPath);
  const client = new NodeExpoDatabase(copy.path);
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- the driver's types want expo-sqlite's class; NodeExpoDatabase implements the subset it calls
    const db = drizzle(client as never, { schema });
    const imports = db.select().from(schema.legacyImport).all();
    const imported = imports.at(0);
    if (imported === undefined) {
      check("the import ran", () => assert.fail("legacy_import is empty"));
      return null;
    }
    check("the import ran once", () => {
      assert.equal(imports.length, 1);
      assert.equal(imported.source, "install");
      return `legacy_import id ${imported.id} at ${new Date(imported.importedAt).toISOString()}`;
    });
    check("import counts, settings, and warnings", () => {
      assert.deepEqual(imported.counts, EXPECTED_COUNTS);
      assert.deepEqual(imported.settings, EXPECTED_SETTINGS);
      assert.deepEqual(imported.warnings, EXPECTED_WARNINGS);
    });
    check(
      "the library matches EXPECTED.md (stored paths are the on-disk bytes)",
      () => {
        assertExactLibrary(db, documents, imported.importedAt, fileNames);
        const songs = new Map(
          dumpLibrary(db).songs.map((song) => [song.id, song.filePath]),
        );
        // The device's NFD names (restored from the backup zip's bytes).
        assert.equal(
          songs.get(10),
          "library/10/Café Ünïcødé.mp3".normalize("NFD"),
        );
        assert.equal(
          songs.get(18),
          "library/18/Saoirse Ní Bhriain - Dew Point.flac".normalize("NFD"),
        );
        return "19 songs, 7 artists, 5 albums, 4 playlists, joins, tracks, artwork, sequences";
      },
    );
    return { imported, library: dumpLibrary(db) };
  } finally {
    client.closeSync();
    copy.remove();
  }
}

/** 2.5.2's session exactly, as 3.0 takes it over before anything plays. */
const LEGACY_SESSION = {
  index: 4,
  positionMs: 7548,
  queued: [5, 6],
  repeat: "all",
  shuffle: true,
  songIds: [7, 6, 3, 14, 2, 8, 20, 3, 6, 7, 1],
  source: { id: 4, kind: "playlist" },
};

function checkKvStore(
  documents: string,
  importId: number,
  options: { theme: string | undefined; freshSession: boolean },
) {
  const kv = readKvStore(join(documents, "SQLite", "preferences.db"));
  // 2.5.2's purple. 3.0 is free, so a theme someone chose stays.
  const theme = options.theme ?? "purple";
  check("2.5.2's settings were applied once", () => {
    assert.equal(kv.get("synq.legacy-import-applied"), importId);
  });
  check(`preferences: theme ${theme}, haptics off`, () => {
    assert.deepEqual(kv.get("synq.preferences"), { haptics: false, theme });
  });
  check(
    options.freshSession
      ? "player session is 2.5.2's"
      : "player session (played since; not compared)",
    () => {
      const session = kv.get("synq.player.session");
      assert.ok(typeof session === "object" && session !== null, "no session");
      if (options.freshSession) {
        const actual = Object.fromEntries(
          Object.keys(LEGACY_SESSION).map((key) => [
            key,
            Reflect.get(session, key),
          ]),
        );
        assert.deepEqual(actual, LEGACY_SESSION);
      }
      return JSON.stringify(session);
    },
  );
  check("2.5.2 settings not yet taken by a feature", () =>
    JSON.stringify(kv.get("synq.legacy-settings") ?? null),
  );
  return Object.fromEntries(kv);
}

function verify(
  container: string,
  runDir: string,
  label: string,
  args: readonly string[],
) {
  const documents = join(container, "Documents");
  const [renamedId, renamedName] = option(args, "--file")?.split("=") ?? [];
  checkLegacyFiles(container, runDir);
  const result = checkLibrary(
    documents,
    renamedId && renamedName ? { [Number(renamedId)]: renamedName } : {},
  );
  if (result === null) return;
  const kv = checkKvStore(documents, result.imported.id, {
    freshSession: args.includes("--fresh-session"),
    theme: option(args, "--theme"),
  });

  // Plain JSON, as the snapshot file holds it.
  const snapshot = readableJson({ ...result, kv });
  writeFileSync(
    join(runDir, `${label}.json`),
    `${JSON.stringify(snapshot, null, 2)}\n`,
  );
  if (label !== "relaunch") return;
  check("the library is unchanged since the first launch", () => {
    const first = readJsonFile(join(runDir, "first.json"));
    assert.ok(typeof first === "object" && first !== null);
    assert.ok(typeof snapshot === "object" && snapshot !== null);
    assert.deepEqual(
      Reflect.get(snapshot, "imported"),
      Reflect.get(first, "imported"),
    );
    assert.deepEqual(
      Reflect.get(snapshot, "library"),
      Reflect.get(first, "library"),
    );
  });
}

function readableJson(value: unknown) {
  return asUnknown(JSON.parse(JSON.stringify(value)));
}

const [command, ...args] = process.argv.slice(2);
if (command === "manifest" && args[0] && args[1]) {
  manifest(args[0], args[1]);
} else if (command === "check" && args[0] && args[1] && args[2]) {
  verify(args[0], args[1], args[2], args.slice(3));
  console.log(
    failures === 0 ? "all checks passed" : `${failures} check(s) failed`,
  );
  process.exitCode = failures === 0 ? 0 : 1;
} else {
  console.error(
    "usage: verify-upgrade.ts manifest <container> <out.json>\n" +
      "       verify-upgrade.ts check <container> <run dir> <label> [--theme <id>] [--fresh-session] [--file <id>=<name>]",
  );
  process.exitCode = 2;
}
