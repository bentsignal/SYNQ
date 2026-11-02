import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { after, before, describe, test } from "node:test";

import {
  command,
  events,
  hasSwift,
  messages,
  next,
  nextEvent,
  openUpload,
  request,
  setState,
  startServer,
  stopServer,
  upload,
  uploads,
} from "./transfer-server.fixture.ts";

const skip = !hasSwift;

function fileUrl(uri: unknown) {
  return new URL(String(uri));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

before(async () => {
  if (hasSwift) await startServer();
});

after(() => {
  stopServer();
});

void describe("the server's page and live link", { skip }, () => {
  void test("serves the page with the live state filled in", async () => {
    await setState('{"on":true,"accent":"#a888ec"}', true);
    const { status, text } = await request({ path: "/" });
    assert.equal(status, 200);
    assert.match(text, /"accent":"#a888ec"/);
    assert.doesNotMatch(text, /__SYNQ_LIVE_STATE__/);
  });

  void test("the event stream carries state and counts its pages", async () => {
    await setState('{"accent":"#77adf8"}', true);
    const from = messages.length;
    const stream = await events();
    assert.equal(stream.contentType, "text/event-stream");
    await stream.until((entry) => entry.event === "state");
    await next(
      (message) => message.event === "onTransferClients" && message.count === 1,
      from,
    );
    await setState('{"accent":"#ff8585"}', true);
    await stream.until((entry) => entry.data === '{"accent":"#ff8585"}');
    // The ping is what lets a page notice a suspended app.
    await stream.until((entry) => entry.event === "ping");
    const closing = messages.length;
    stream.close();
    await next(
      (message) => message.event === "onTransferClients" && message.count === 0,
      closing,
    );
  });

  void test("still serves the page and events while off", async () => {
    await setState('{"on":false}', false);
    assert.equal((await request({ path: "/" })).status, 200);
    assert.equal((await request({ path: "/ping" })).status, 200);
    const stream = await events();
    await stream.until((entry) => entry.data === '{"on":false}');
    stream.close();
  });
});

void describe("the server's uploads", { skip }, () => {
  void test("takes a file while on, streamed to disk", async () => {
    await setState("{}", true);
    const from = messages.length;
    const body = Buffer.alloc(3_000_000, 7);
    const { status } = await upload("Déjà Vu.mp3", body);
    assert.equal(status, 200);
    const start = await nextEvent("onTransferStart", from);
    assert.equal(start.mimeType, "audio/mpeg; synq-remaining=0");
    const file = await nextEvent("onTransferFile", from);
    assert.equal(file.name, "Déjà Vu.mp3".normalize("NFC"));
    assert.equal(file.mimeType, "audio/mpeg; synq-remaining=0");
    assert.equal(file.size, body.length);
    assert.equal(readFileSync(fileUrl(file.uri)).length, body.length);
  });

  void test("takes the same name twice as two files", async () => {
    await setState("{}", true);
    const from = messages.length;
    await upload("same.mp3", Buffer.from("one"));
    await upload("same.mp3", Buffer.from("two"));
    const first = await nextEvent("onTransferFile", from);
    const second = await next(
      (message) =>
        message.event === "onTransferFile" && message.uri !== first.uri,
      from,
    );
    assert.equal(readFileSync(fileUrl(first.uri), "utf8"), "one");
    assert.equal(readFileSync(fileUrl(second.uri), "utf8"), "two");
  });

  void test("turns away what it can't import", async () => {
    await setState("{}", true);
    assert.equal((await upload("notes.txt", Buffer.from("x"))).status, 415);
  });

  void test("remembers which uploads arrived, for a retry", async () => {
    await setState("{}", true);
    const id = "page-file-1";
    async function received() {
      const { text } = await request({ path: `/uploaded?id=${id}` });
      return text;
    }
    assert.equal(await received(), '{"received":false}');
    await upload("retry.mp3", Buffer.from("x"), id);
    assert.equal(await received(), '{"received":true}');
  });

  void test("handles a large file", async () => {
    await setState("{}", true);
    const from = messages.length;
    const size = 300_000_000;
    const { status } = await upload("large.flac", Buffer.alloc(size, 9));
    assert.equal(status, 200);
    const file = await nextEvent("onTransferFile", from);
    assert.equal(file.size, size);
  });

  void test("forgets a cancelled upload's partial file", async () => {
    await setState("{}", true);
    const from = messages.length;
    const req = openUpload("cancelled.mp3", 5_000_000);
    req.on("error", () => undefined);
    req.write(Buffer.alloc(100_000, 1));
    const started = await nextEvent("onTransferStart", from);
    req.destroy();
    const failed = await nextEvent("onTransferFailed", from);
    assert.equal(failed.id, started.id);
    assert.equal(existsSync(path.join(uploads, String(started.id))), false);
  });
});

void describe("the server while off", { skip }, () => {
  void test("refuses uploads, and says so readably", async () => {
    await setState("{}", false);
    const from = messages.length;
    // Big enough that the browser is still sending when the answer comes.
    const { status, text } = await upload("a.mp3", Buffer.alloc(8_000_000, 1));
    assert.equal(status, 403);
    assert.match(text, /"off":true/);
    await sleep(100);
    assert.equal(
      messages
        .slice(from)
        .filter((message) => message.event === "onTransferStart").length,
      0,
    );
  });

  void test("a file on its way when transfers go off still finishes", async () => {
    await setState("{}", true);
    const from = messages.length;
    const half = Buffer.alloc(1_000_000, 3);
    const req = openUpload("midway.mp3", half.length * 2);
    const answer = new Promise<number>((resolve, reject) => {
      req.on("response", (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      });
      req.on("error", reject);
    });
    req.write(half);
    await nextEvent("onTransferStart", from);
    await setState("{}", false);
    req.end(half);
    assert.equal(await answer, 200);
    const file = await nextEvent("onTransferFile", from);
    assert.equal(file.size, half.length * 2);
    assert.equal((await upload("next.mp3", Buffer.from("x"))).status, 403);
  });
});

void describe("the server's listener", { skip }, () => {
  void test("knows whether it's listening", async () => {
    let from = messages.length;
    command({ command: "alive" });
    assert.equal((await nextEvent("alive", from)).alive, true);
    assert.ok(readdirSync(uploads).length > 0);
    from = messages.length;
    command({ command: "stop" });
    await nextEvent("stopped", from);
    await sleep(50);
    from = messages.length;
    command({ command: "alive" });
    assert.equal((await nextEvent("alive", from)).alive, false);
  });
});
