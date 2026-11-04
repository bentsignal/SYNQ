import vm from "node:vm";

import { parseUploadType } from "./progress.ts";
import { transferPage } from "./transfer-page.ts";

/**
 * Runs the built page's script in a test, against just enough of a browser,
 * with a clock the test moves. Its elements are the ones the built page has.
 */

const PAGE = transferPage({ accent: "#77adf8" });
const SCRIPT = /<script>([\s\S]*)<\/script>/.exec(PAGE)?.[1] ?? "";

type Listener = (event: { data: string }) => void;

function noop() {
  return undefined;
}

export class FakeRequest {
  static sent = new Array<FakeRequest>();
  headers: Record<string, string> = {};
  status = 200;
  aborted = false;
  upload = {};
  responseText = "{}";
  onload?: () => void;
  onerror?: () => void;
  open = noop;
  abort() {
    this.aborted = true;
  }
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  send() {
    FakeRequest.sent.push(this);
  }
}

export class FakeSource {
  static opened = new Array<FakeSource>();
  readyState = 1;
  listeners = new Map<string, Listener[]>();
  onerror?: () => void;
  constructor() {
    FakeSource.opened.push(this);
  }
  addEventListener(type: string, listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  close = noop;
  fire(type: string, data = "") {
    for (const listener of this.listeners.get(type) ?? []) listener({ data });
  }
}

function fakeElement() {
  const handlers = new Map<string, () => void>();
  return {
    addEventListener: (type: string, listener: () => void) => {
      handlers.set(type, listener);
    },
    appendChild: noop,
    children: new Array<unknown>(),
    dataset: new Proxy<Record<string, string>>({}, {}),
    handlers,
    hidden: false,
    style: { setProperty: (_: string, __: string) => undefined },
    textContent: "",
    value: "",
  };
}

interface Timer {
  at: number;
  run: () => void;
  every?: number;
}

function fakeClock() {
  const timers = new Array<Timer>();
  let now = 1000;
  async function settle() {
    for (let turn = 0; turn < 30; turn += 1) await Promise.resolve();
  }
  return {
    advance: async (ms: number) => {
      await settle();
      const end = now + ms;
      for (;;) {
        const due = timers
          .filter((timer) => timer.at <= end)
          .sort((a, b) => a.at - b.at)[0];
        if (due === undefined) break;
        now = due.at;
        if (due.every === undefined) due.at = Infinity;
        else due.at += due.every;
        due.run();
        await settle();
      }
      now = end;
      await settle();
    },
    globals: {
      Date: { now: () => now },
      clearTimeout: (timer: Timer) => {
        timer.at = Infinity;
      },
      setInterval: (run: () => void, every: number) => {
        const timer = { at: now + every, every, run };
        timers.push(timer);
        return timer;
      },
      setTimeout: (run: () => void, wait: number) => {
        const timer = { at: now + wait, run };
        timers.push(timer);
        return timer;
      },
    },
  };
}

function okResponse(body: unknown) {
  return Promise.resolve({ json: () => Promise.resolve(body), ok: true });
}

export function loadPage({
  initial = '{"on":true}',
  ping = () => okResponse({}),
  uploaded = false,
  uploadedOk = true,
} = {}) {
  FakeRequest.sent = [];
  FakeSource.opened = [];
  const elements = new Map<string, ReturnType<typeof fakeElement>>();
  const fetched = new Array<string>();
  const accents = new Array<string>();
  const clock = fakeClock();
  function element(id: string) {
    if (!PAGE.includes(`id="${id}"`)) throw new Error(`The page has no #${id}`);
    const found = elements.get(id) ?? fakeElement();
    elements.set(id, found);
    return found;
  }
  element("live").textContent = initial;
  const root = fakeElement();
  root.style.setProperty = (_, value) => {
    accents.push(value);
    return undefined;
  };
  vm.runInNewContext(SCRIPT, {
    AbortController,
    EventSource: FakeSource,
    XMLHttpRequest: FakeRequest,
    ...clock.globals,
    document: {
      createElement: fakeElement,
      documentElement: root,
      getElementById: element,
      title: "",
    },
    encodeURIComponent,
    fetch: (url: string) => {
      fetched.push(url);
      if (!url.startsWith("/uploaded")) return ping();
      return uploadedOk
        ? okResponse({ received: uploaded })
        : Promise.resolve({
            json: () => Promise.resolve({ error: "Not found." }),
            ok: false,
          });
    },
    window: { addEventListener: noop },
  });
  return {
    accents,
    advance: clock.advance,
    cancel: () => element("cancel").handlers.get("click")?.(),
    choose: (names: readonly string[]) => {
      Object.assign(element("files"), {
        files: names.map((name) => ({ name, size: 10, type: "audio/mpeg" })),
      });
      element("files").handlers.get("change")?.();
    },
    element,
    fetched,
    root,
    /** Every upload sent so far. */
    requests: FakeRequest.sent,
    /** Every event stream opened so far. */
    sources: FakeSource.opened,
  };
}

/** How many files the page said would follow this upload. */
export function remainingOf(request: FakeRequest | undefined) {
  return parseUploadType(request?.headers["Content-Type"] ?? "").remaining;
}

export function typeOf(request: FakeRequest | undefined) {
  return parseUploadType(request?.headers["Content-Type"] ?? "").mimeType;
}
