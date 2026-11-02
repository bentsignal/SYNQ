import assert from "node:assert/strict";
import { describe, test } from "node:test";
import vm from "node:vm";

import { parseUploadType } from "./progress.ts";
import { TRANSFER_SCRIPT } from "./transfer-page.ts";

interface FakeRequest {
  headers: Record<string, string>;
  status: number;
  onload?: () => void;
}

function noop() {
  return undefined;
}

function fakeElement() {
  return {
    addEventListener: noop,
    append: noop,
    appendChild: noop,
    classList: { add: noop, remove: noop },
    className: "",
    style: {},
    textContent: "",
  };
}

/** Runs the page's script against just enough of a browser. */
function page() {
  const requests = new Array<FakeRequest>();
  const elements = new Map<string, ReturnType<typeof fakeElement>>();
  const listeners = new Map<string, () => void>();
  function element(id: string) {
    const found = elements.get(id) ?? fakeElement();
    elements.set(id, found);
    return found;
  }
  class XMLHttpRequest implements FakeRequest {
    headers: Record<string, string> = {};
    status = 200;
    upload = {};
    responseText = "{}";
    onload?: () => void;
    open = noop;
    setRequestHeader(name: string, value: string) {
      this.headers[name] = value;
    }
    send() {
      requests.push(this);
    }
  }
  const input = element("files");
  Object.assign(input, {
    addEventListener: (type: string, listener: () => void) => {
      listeners.set(type, listener);
    },
  });
  vm.runInNewContext(TRANSFER_SCRIPT, {
    XMLHttpRequest,
    document: {
      createElement: fakeElement,
      getElementById: element,
    },
    encodeURIComponent,
    window: { addEventListener: noop },
  });
  return {
    choose: (names: readonly string[]) => {
      Object.assign(input, {
        files: names.map((name) => ({ name, type: "audio/mpeg" })),
      });
      listeners.get("change")?.();
    },
    note: element("note"),
    requests,
  };
}

function remainingOf(request: FakeRequest | undefined) {
  return parseUploadType(request?.headers["Content-Type"] ?? "").remaining;
}

void describe("the transfer page", () => {
  void test("tells the phone how many files follow each one", () => {
    const { choose, requests } = page();
    choose(["a.mp3", "b.mp3", "c.mp3"]);
    assert.equal(requests.length, 1);
    assert.equal(remainingOf(requests[0]), 2);
    assert.equal(
      parseUploadType(requests[0]?.headers["Content-Type"] ?? "").mimeType,
      "audio/mpeg",
    );
    requests[0]?.onload?.();
    assert.equal(remainingOf(requests[1]), 1);
    requests[1]?.onload?.();
    assert.equal(remainingOf(requests[2]), 0);
  });

  void test("counts files added while one is uploading", () => {
    const { choose, requests } = page();
    choose(["a.mp3"]);
    assert.equal(remainingOf(requests[0]), 0);
    choose(["b.mp3", "c.mp3"]);
    requests[0]?.onload?.();
    assert.equal(remainingOf(requests[1]), 1);
  });

  void test("says so when everything has been sent", () => {
    const { choose, note, requests } = page();
    choose(["a.mp3"]);
    assert.equal(note.textContent, "");
    requests[0]?.onload?.();
    assert.match(note.textContent, /All sent/);
  });
});
