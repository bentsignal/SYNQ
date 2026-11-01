import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

import { nodeFileSystem } from "../testing/node-fs.ts";
import {
  LEGACY_ASYNC_STORAGE_KEY_FILES,
  parseLegacySettings,
  readLegacyAsyncStorage,
} from "./index.ts";

function md5(key: string) {
  return createHash("md5").update(key, "utf8").digest("hex");
}

function storageDir(manifest: unknown, files: Record<string, string> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "synq-async-storage-"));
  writeFileSync(
    join(dir, "manifest.json"),
    typeof manifest === "string" ? manifest : JSON.stringify(manifest),
  );
  for (const [key, value] of Object.entries(files))
    writeFileSync(join(dir, md5(key)), value);
  return dir;
}

const library = {
  songIds: new Set([1, 2, 3, 4]),
  playlistIds: new Set([2, 3]),
  albumIds: new Set([7]),
  artistIds: new Set([8]),
};

void describe("readLegacyAsyncStorage", () => {
  void test("precomputed key file names are the MD5 of the key (RCTMD5Hash)", () => {
    for (const [key, fileName] of Object.entries(
      LEGACY_ASYNC_STORAGE_KEY_FILES,
    ))
      assert.equal(fileName, md5(key), key);
  });

  void test("reads inline values and out-of-line (null) values from MD5-named files", async () => {
    const long = "x".repeat(2000);
    const dir = storageDir(
      { theme: "#77adf8", queue: null, position: null },
      { queue: long },
    );
    assert.deepEqual(await readLegacyAsyncStorage(dir, nodeFileSystem), {
      // `position` is null with no file: AsyncStorage itself treats that as missing.
      values: { theme: "#77adf8", queue: long },
      problems: [],
    });
  });

  void test("returns null without a manifest and reports malformed ones without throwing", async () => {
    assert.equal(
      await readLegacyAsyncStorage(
        mkdtempSync(join(tmpdir(), "synq-empty-")),
        nodeFileSystem,
      ),
      null,
    );
    assert.deepEqual(
      await readLegacyAsyncStorage(storageDir("{not json"), nodeFileSystem),
      {
        values: {},
        problems: ["manifest.json is not valid JSON"],
      },
    );
    assert.deepEqual(
      await readLegacyAsyncStorage(
        storageDir({ odd: 3, mystery: null }),
        nodeFileSystem,
      ),
      {
        values: {},
        problems: [
          "odd: unexpected number in manifest",
          "mystery: stored out of line under an unknown key",
        ],
      },
    );
  });
});

void describe("parseLegacySettings", () => {
  void test("applies 2.5.2's defaults when nothing was stored", () => {
    assert.deepEqual(parseLegacySettings({}, library), {
      preferences: {
        accent: null,
        haptics: true,
        shuffle: false,
        repeat: "off",
      },
      session: null,
      bookkeeping: {
        importCount: 0,
        reviewRequested: false,
        exportNumber: null,
        legacyDbVersion: null,
      },
      unknownKeys: [],
    });
  });

  void test("a current index on the ad moves to the next song, with position reset", () => {
    const queue = JSON.stringify([
      { id: 1 },
      { id: -2 },
      { id: 2 },
      { id: "3" },
    ]);
    const settings = parseLegacySettings(
      {
        queue,
        lastTrackIndex: "1",
        position: "12.5",
        sourceType: "1",
        sourceId: "1",
      },
      library,
    );
    assert.deepEqual(settings.session, {
      queueSongIds: [1, 2, 3],
      currentIndex: 1,
      positionMs: 0,
      source: { kind: "library" },
      insertOffset: 0,
    });
  });

  void test("an index past the end clamps to the last kept song", () => {
    const queue = JSON.stringify([{ id: 1 }, { id: 2 }, { id: 99 }]);
    const settings = parseLegacySettings(
      { queue, lastTrackIndex: "40", position: "3" },
      library,
    );
    assert.equal(settings.session?.currentIndex, 1);
    assert.equal(settings.session.positionMs, 0);
  });
});

void describe("parseLegacySettings sources and cached state", () => {
  void test("drops a queue with nothing playable, and sources that no longer exist", () => {
    assert.equal(
      parseLegacySettings(
        { queue: JSON.stringify([{ id: -2 }, { id: 50 }]) },
        library,
      ).session,
      null,
    );
    assert.equal(
      parseLegacySettings({ queue: "garbage" }, library).session,
      null,
    );
    function session(sourceType: string, sourceId: string) {
      return parseLegacySettings(
        { queue: JSON.stringify([{ id: 1 }]), sourceType, sourceId },
        library,
      ).session?.source;
    }
    assert.deepEqual(session("1", "2"), { kind: "playlist", id: 2 });
    assert.equal(session("1", "4"), null);
    assert.deepEqual(session("2", "7"), { kind: "album", id: 7 });
    assert.deepEqual(session("3", "8"), { kind: "artist", id: 8 });
    assert.deepEqual(session("4", "3"), { kind: "song", id: 3 });
    assert.equal(session("9", "1"), null);
  });

  void test("ignores 2.5.2's premium and ad keys", () => {
    const settings = parseLegacySettings(
      {
        expiration: "never",
        playAd: "true",
        theme: "#A888EC",
        timePlayed: "605",
      },
      library,
    );
    assert.equal(settings.preferences.accent, "#a888ec");
    assert.deepEqual(settings.unknownKeys, []);
    assert.deepEqual(Object.keys(settings).sort(), [
      "bookkeeping",
      "preferences",
      "session",
      "unknownKeys",
    ]);
  });

  void test("parses the accent", () => {
    assert.equal(
      parseLegacySettings({ theme: "blue" }, library).preferences.accent,
      null,
    );
    assert.equal(
      parseLegacySettings({ theme: " #EDDD92 " }, library).preferences.accent,
      "#eddd92",
    );
  });
});
