import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";

/**
 * The real `AudioExtractor.swift`, compiled for the Mac with a small driver
 * (`modules/synq-media/test/extract`), on tiny videos in
 * `modules/synq-media/test/fixtures`. AVFoundation is the same on the Mac;
 * where there's no `swiftc` (a Linux CI runner) the tests skip.
 */
const MODULE = path.join(import.meta.dirname, "../../../modules/synq-media");
const FIXTURES = path.join(MODULE, "test/fixtures");

const hasSwift =
  process.platform === "darwin" &&
  spawnSync("swiftc", ["--version"]).status === 0;

const work = mkdtempSync(path.join(tmpdir(), "synq-extract-"));
const binary = path.join(work, "extract");

interface Extracted {
  audioTracks?: number;
  videoTracks?: number;
  formats?: string[];
  durationMs?: number;
  sameSamples?: boolean;
  error?: string;
}

function extract(video: string) {
  const destination = path.join(work, `${video}.m4a`);
  const run = spawnSync(binary, [path.join(FIXTURES, video), destination], {
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- The driver's one JSON line, written above.
  return { result: JSON.parse(run.stdout) as Extracted };
}

void describe("extracting a video's sound", { skip: !hasSwift }, () => {
  before(() => {
    const built = spawnSync("swiftc", [
      "-swift-version",
      "5",
      path.join(MODULE, "ios/AudioExtractor.swift"),
      path.join(MODULE, "test/extract/main.swift"),
      "-o",
      binary,
    ]);
    assert.equal(built.status, 0, String(built.stderr));
  });

  after(() => rmSync(work, { force: true, recursive: true }));

  void test("copies AAC as it is, without the picture", () => {
    const { result } = extract("aac.mov");
    assert.deepEqual(result.formats, ["aac "]);
    assert.equal(result.videoTracks, 0);
    assert.ok(Math.abs((result.durationMs ?? 0) - 1000) < 100);
    assert.equal(result.sameSamples, true);
  });

  void test("encodes other sound to AAC", () => {
    const { result } = extract("pcm.mov");
    assert.deepEqual(result.formats, ["aac "]);
    assert.equal(result.sameSamples, false);
    assert.equal(result.videoTracks, 0);
  });

  void test("mixes the tracks a video plays together into one", () => {
    const { result } = extract("two-tracks.mov");
    assert.equal(result.audioTracks, 1);
    assert.deepEqual(result.formats, ["aac "]);
    // Mixed, so not the first track copied alone.
    assert.equal(result.sameSamples, false);
  });

  void test("refuses a video with no sound", () => {
    const { result } = extract("silent.mp4");
    assert.equal(result.error, "This video has no sound.");
  });
});
