import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { loadPage, remainingOf } from "./transfer-page.fixture.ts";
import { LIVE_STATE_TOKEN } from "./transfer-page.ts";

void describe("the live link", () => {
  void test("reads its first state from the page itself", async () => {
    const { advance, root } = loadPage({
      initial: '{"on":false,"accent":"#a888ec"}',
    });
    await advance(10);
    assert.equal(root.dataset.face, "off");
  });

  void test("survives the token being left in place by an older binary", async () => {
    const { advance, root } = loadPage({ initial: LIVE_STATE_TOKEN });
    await advance(10);
    assert.equal(root.dataset.face, "ready");
  });

  void test("says Connected, and follows the accent", async () => {
    const { accents, advance, element, root, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true,"accent":"#ff8585"}');
    await advance(400);
    assert.equal(root.dataset.link, "live");
    assert.equal(element("status").textContent, "Connected");
    assert.equal(accents.at(-1), "#ff8585");
  });

  void test("ignores an accent that isn't a color", () => {
    const { accents, sources } = loadPage();
    sources[0]?.fire("state", '{"accent":"red;}"}');
    assert.deepEqual(accents, []);
  });
});

void describe("transfers going off", () => {
  void test("isn't an error, and files wait", async () => {
    const { advance, choose, element, requests, root, sources } = loadPage();
    sources[0]?.fire("state", '{"on":false}');
    choose(["a.mp3", "b.mp3"]);
    await advance(400);
    assert.equal(requests.length, 0);
    assert.equal(root.dataset.face, "off");
    assert.equal(element("status").textContent, "Transfers Off");
    assert.equal(element("line").textContent, "2 files waiting");
    sources[0]?.fire("state", '{"on":true}');
    assert.equal(requests.length, 1);
    assert.equal(remainingOf(requests[0]), 1);
  });

  void test("a file refused just then waits with the rest", async () => {
    const { advance, choose, element, requests, root, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true}');
    choose(["a.mp3"]);
    const request = requests[0];
    assert.ok(request);
    request.status = 403;
    request.responseText = '{"off":true,"error":"Wi-Fi Transfer is off."}';
    request.onload?.();
    await advance(400);
    assert.equal(root.dataset.face, "off");
    assert.equal(element("problems-list").children.length, 0);
    assert.equal(element("line").textContent, "1 file waiting");
    sources[0]?.fire("state", '{"on":true}');
    assert.equal(requests.length, 2);
  });
});

void describe("losing the phone", () => {
  void test("notices the silence, then reconnects and resumes", async () => {
    let answering = true;
    const { advance, choose, element, requests, root, sources } = loadPage({
      ping: () =>
        answering
          ? Promise.resolve({ json: () => Promise.resolve({}), ok: true })
          : Promise.reject(new Error("gone")),
    });
    sources[0]?.fire("state", '{"on":true}');
    answering = false;
    choose(["a.mp3", "b.mp3"]);
    requests[0]?.onerror?.();
    // One more try before the phone counts as gone, which also breaks.
    await advance(1300);
    requests.at(-1)?.onerror?.();
    await advance(9000);
    assert.equal(root.dataset.face, "lost");
    assert.equal(element("status").textContent, "Disconnected");
    const sentWhileThere = requests.length;
    await advance(5000);
    assert.equal(requests.length, sentWhileThere);
    answering = true;
    await advance(3000);
    const fresh = sources.at(-1);
    assert.notEqual(fresh, sources[0]);
    fresh?.fire("state", '{"on":true}');
    await advance(10);
    assert.equal(root.dataset.face, "ready");
    assert.equal(requests.length, sentWhileThere + 1);
    assert.equal(remainingOf(requests.at(-1)), 1);
  });

  void test("doesn't send a file twice when only its response was lost", async () => {
    const { advance, choose, fetched, requests, sources } = loadPage({
      uploaded: true,
    });
    sources[0]?.fire("state", '{"on":true}');
    choose(["a.mp3", "b.mp3"]);
    requests[0]?.onerror?.();
    await advance(1300);
    assert.ok(fetched.some((url) => url.startsWith("/uploaded?id=")));
    // On to the next file, not the same one again.
    assert.equal(remainingOf(requests[1]), 0);
    assert.equal(requests.length, 2);
  });

  void test("gives up on a file that keeps failing while the phone is there", async () => {
    const { advance, choose, element, requests, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true}');
    choose(["a.mp3"]);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      sources[0]?.fire("ping");
      requests.at(-1)?.onerror?.();
      await advance(1300);
    }
    await advance(400);
    assert.equal(element("problems").hidden, false);
  });

  void test("falls back when the server has no event stream", async () => {
    const { advance, choose, element, requests, root, sources } = loadPage({
      initial: LIVE_STATE_TOKEN,
    });
    const source = sources[0];
    assert.ok(source);
    source.readyState = 2;
    source.onerror?.();
    await advance(400);
    assert.equal(root.dataset.link, "basic");
    assert.equal(element("status").textContent, "Connected");
    choose(["a.mp3"]);
    assert.equal(requests.length, 1);
    requests[0]?.onload?.();
    await advance(400);
    assert.equal(element("line").textContent, "1 Song Added");
  });
});

void describe("how soon the page knows", () => {
  void test("the app going away shows at once, and its pings don't undo it", async () => {
    const { advance, element, root, sources } = loadPage();
    sources[0]?.fire("state", '{"on":true}');
    sources[0]?.fire("state", '{"away":true}');
    await advance(400);
    assert.equal(root.dataset.face, "lost");
    assert.equal(element("status").textContent, "Disconnected");
    sources[0]?.fire("ping");
    await advance(400);
    assert.equal(root.dataset.face, "lost");
    sources[0]?.fire("state", '{"away":false}');
    await advance(400);
    assert.equal(root.dataset.face, "ready");
  });

  void test("a closed app's dropped stream shows at once", async () => {
    const { advance, root, sources } = loadPage({
      ping: () => Promise.reject(new Error("gone")),
    });
    sources[0]?.fire("state", '{"on":true}');
    await advance(400);
    assert.equal(root.dataset.face, "ready");
    sources[0]?.onerror?.();
    await advance(400);
    assert.equal(root.dataset.face, "lost");
  });

  void test("a Wi-Fi hiccup doesn't cost an upload in flight", async () => {
    const { advance, choose, requests, root, sources } = loadPage({
      ping: () =>
        Promise.resolve({ json: () => Promise.resolve({}), ok: true }),
    });
    sources[0]?.fire("state", '{"on":true}');
    choose(["a.mp3"]);
    assert.equal(requests.length, 1);
    await advance(4000);
    assert.equal(requests[0]?.aborted, false);
    assert.notEqual(root.dataset.face, "lost");
  });
});
