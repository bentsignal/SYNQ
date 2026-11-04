import assert from "node:assert/strict";
import { test } from "node:test";

import type { RemoteTrack } from "./contract.ts";
import {
  decodeError,
  decodeJob,
  decodeServerInfo,
  serverAddress,
  serverEndpoint,
  storedFileName,
} from "./contract.ts";

const SERVER = {
  api: 1,
  name: "Mine",
  usage: { dailyLimit: 100, usedToday: 3 },
};

void test("reads a server's description", () => {
  assert.deepEqual(decodeServerInfo(SERVER), SERVER);
  const unlimited = decodeServerInfo({
    ...SERVER,
    usage: { dailyLimit: null, usedToday: 3 },
  });
  assert.equal(unlimited?.usage?.dailyLimit, null);
});

void test("a server doesn't have to report usage", () => {
  assert.deepEqual(decodeServerInfo({ api: 1, name: "Open" }), {
    api: 1,
    name: "Open",
    usage: null,
  });
});

void test("anything else isn't a server", () => {
  for (const value of [
    null,
    "hi",
    [],
    {},
    { ...SERVER, api: "1" },
    { ...SERVER, name: "" },
  ]) {
    assert.equal(decodeServerInfo(value), null);
  }
});

void test("reads a job, with its error's message", () => {
  const job = decodeJob({
    error: { code: "limit_reached", message: "Too many." },
    id: "j",
    state: "failed",
    title: null,
    tracks: [{ id: "t", state: "ready", title: "Song" }],
  });
  assert.equal(job?.error, "Too many.");
  assert.equal(job.tracks[0]?.title, "Song");
  assert.equal(job.tracks[0].fileName, null);
});

void test("refuses a job with an unknown state or a broken track", () => {
  assert.equal(decodeJob({ id: "j", state: "mystery", tracks: [] }), null);
  assert.equal(decodeJob({ id: "j", state: "done", tracks: "none" }), null);
  assert.equal(
    decodeJob({ id: "j", state: "done", tracks: [{ id: "t", state: "?" }] }),
    null,
  );
});

void test("reads an error reply", () => {
  assert.deepEqual(
    decodeError({ error: { code: "unauthorized", message: "No." } }),
    { code: "unauthorized", message: "No." },
  );
  assert.equal(decodeError({ message: "No." }), null);
  assert.equal(decodeError(null), null);
});

void test("cleans up a typed server address", () => {
  for (const [typed, address] of [
    ["https://server.example/", "https://server.example"],
    ["  server.example  ", "https://server.example"],
    ["http://192.168.1.5:8080", "http://192.168.1.5:8080"],
    ["https://server.example/base/", "https://server.example/base"],
    ["https://server.example/?token=abc", "https://server.example?token=abc"],
    ["server.example/base/?a=1&b=2", "https://server.example/base?a=1&b=2"],
    ["https://server.example/#part", "https://server.example"],
    ["ftp://server.example", null],
    ["https://user:pass@server.example", null],
    ["", null],
    ["not an address", null],
  ] as const) {
    assert.equal(serverAddress(typed), address, typed);
  }
});

void test("paths go between an address's own path and its query", () => {
  for (const [address, url] of [
    ["https://server.example", "https://server.example/v1/server"],
    ["https://server.example/base", "https://server.example/base/v1/server"],
    [
      "https://server.example?token=a",
      "https://server.example/v1/server?token=a",
    ],
    [
      "https://s.example/base?a=1&b=2",
      "https://s.example/base/v1/server?a=1&b=2",
    ],
  ] as const) {
    assert.equal(serverEndpoint(address, "/v1/server"), url);
  }
});

function named(fileName: string | null, mimeType = "audio/mp4") {
  return {
    fileName,
    id: "t",
    mimeType,
    state: "ready",
    title: null,
  } satisfies RemoteTrack;
}

void test("a server can't choose where a file goes, or its type", () => {
  assert.equal(storedFileName(named("Band - Song.m4a")), "Band - Song.m4a");
  assert.equal(storedFileName(named("../../evil.m4a")), "evil.m4a");
  assert.equal(storedFileName(named("a/b\\c.mp3")), "c.mp3");
  assert.equal(storedFileName(named('A: "B"?.m4a')), "A   B.m4a");
  assert.equal(storedFileName(named("run.sh")), "run.sh.m4a");
  assert.equal(storedFileName(named("run.sh", "audio/mpeg")), "run.sh.mp3");
  assert.equal(storedFileName(named(null)), "Song.m4a");
  assert.equal(storedFileName(named("....")), "Song.m4a");
  assert.equal(storedFileName(named(`${"x".repeat(400)}.m4a`)).length, 154);
});
