import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

import {
  buildTransferPage,
  TRANSFER_PAGE_OUTPUT,
} from "../../../scripts/build-transfer-page.ts";
import { loadPage, remainingOf, typeOf } from "./transfer-page.fixture.ts";
import {
  LIVE_STATE_TOKEN,
  TRANSFER_EXTENSIONS,
  transferPage,
} from "./transfer-page.ts";

void describe("the transfer page's uploads", () => {
  void test("tells the phone how many files follow each one", () => {
    const { choose, requests, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true}');
    choose(["a.mp3", "b.mp3", "c.mp3"]);
    assert.equal(requests.length, 1);
    assert.equal(remainingOf(requests[0]), 2);
    assert.equal(typeOf(requests[0]), "audio/mpeg");
    requests[0]?.onload?.();
    assert.equal(remainingOf(requests[1]), 1);
    requests[1]?.onload?.();
    assert.equal(remainingOf(requests[2]), 0);
  });

  void test("counts files added while one is uploading", () => {
    const { choose, requests, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true}');
    choose(["a.mp3"]);
    assert.equal(remainingOf(requests[0]), 0);
    choose(["b.mp3", "c.mp3"]);
    requests[0]?.onload?.();
    assert.equal(remainingOf(requests[1]), 1);
  });

  void test("shows a compact count while sending, then the result from the phone", async () => {
    const { advance, choose, element, requests, sources } = loadPage();
    const source = sources[0];
    source?.fire("state", '{"on":true}');
    choose(["a.mp3", "b.mp3"]);
    await advance(400);
    assert.equal(element("line").textContent, "Sending 1 of 2");
    assert.equal(element("name").textContent, "a.mp3");
    requests[0]?.onload?.();
    source?.fire("state", '{"on":true,"importing":true,"imported":1}');
    requests[1]?.onload?.();
    await advance(400);
    assert.equal(element("line").textContent, "Adding to your library");
    source?.fire("state", '{"on":true,"importing":false,"imported":2}');
    await advance(400);
    assert.equal(element("line").textContent, "2 Songs Added");
  });

  void test("keeps a bad file to itself and goes on", async () => {
    const { advance, choose, element, requests, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true}');
    choose(["notes.txt", "a.mp3"]);
    assert.equal(requests.length, 1);
    await advance(400);
    assert.equal(element("problems").hidden, false);
    assert.match(element("problems-count").textContent, /1 file/);
  });

  void test("cancel stops what's on its way and what's queued", async () => {
    const { advance, cancel, choose, element, requests, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true}');
    choose(["a.mp3", "b.mp3"]);
    cancel();
    assert.equal(requests[0]?.aborted, true);
    await advance(400);
    assert.equal(requests.length, 1);
    assert.equal(element("line").textContent, "");
  });
});

void describe("the built page", () => {
  void test("is what its sources build", () => {
    assert.ok(
      existsSync(TRANSFER_PAGE_OUTPUT) &&
        readFileSync(TRANSFER_PAGE_OUTPUT, "utf8") === buildTransferPage(),
      "transfer-page.generated.ts is out of date: run `pnpm build:transfer-page` and commit it",
    );
  });

  void test("takes the accent, and leaves nothing for the build to fill in", () => {
    const html = transferPage({ accent: "#ff8585" });
    assert.match(html, /--accent:\s*#ff8585;/);
    assert.doesNotMatch(html, /__SYNQ_ACCENT__|__SYNQ_ACCEPT__/);
    assert.doesNotMatch(html, /TRANSFER_EXTENSIONS|TRANSFER_LOGO/);
  });

  void test("falls back on the blue accent", () => {
    assert.match(transferPage({ accent: "red" }), /--accent:\s*#77adf8;/);
  });

  void test("carries the logo inline, for the page and for the tab", () => {
    const logo = readFileSync(
      path.join(import.meta.dirname, "transfer-page-source/logo.png"),
    ).toString("base64");
    const parts = transferPage({ accent: "#77adf8" }).split(logo);
    assert.equal(parts.length, 3);
  });

  void test("offers the audio SYNQ imports, and takes every one of them", async () => {
    const html = transferPage({ accent: "#77adf8" });
    const accept = TRANSFER_EXTENSIONS.map((extension) => `.${extension}`);
    assert.ok(html.includes(`accept="${accept.join(",")},audio/*"`));
    const { advance, choose, element, requests, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true}');
    choose(TRANSFER_EXTENSIONS.map((extension) => `song.${extension}`));
    await advance(400);
    assert.equal(element("problems").hidden, true);
    assert.equal(requests.length, 1);
    assert.equal(remainingOf(requests[0]), TRANSFER_EXTENSIONS.length - 1);
  });
});

void describe("the page's words", () => {
  const html = transferPage({ accent: "#77adf8" });

  void test("keeps the one line, and none of the old ones", () => {
    assert.match(html, /Files go straight to your iPhone over your Wi-Fi\./);
    assert.doesNotMatch(html, /never the internet/i);
    assert.doesNotMatch(html, /Sending to/);
    assert.doesNotMatch(html, /Keep Wi-Fi Transfer open/);
  });

  void test("has a place for the live state, and no outside requests", () => {
    assert.ok(html.includes(LIVE_STATE_TOKEN));
    assert.doesNotMatch(html, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
    assert.doesNotMatch(html, /<link(?![^>]*href="data:)|src="(?!data:)/);
  });

  void test("doesn't trust the accent it's given", () => {
    assert.doesNotMatch(
      transferPage({ accent: "red;}</style>" }),
      /red;}<\/style>/,
    );
  });
});
