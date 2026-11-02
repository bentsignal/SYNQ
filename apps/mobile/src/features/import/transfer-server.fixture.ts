import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Drives the real Swift server (`modules/synq-media/ios/TransferServer.swift`),
 * compiled for the Mac with a small driver (`modules/synq-media/test`), over
 * real sockets. It uses only Foundation and Network, so it builds with no iOS
 * toolchain; where there's no `swiftc` (a Linux CI runner) the tests skip.
 */
const MODULE = path.join(import.meta.dirname, "../../../modules/synq-media");

export const hasSwift =
  process.platform === "darwin" &&
  spawnSync("swiftc", ["--version"]).status === 0;

export interface Message {
  event: string;
  [field: string]: unknown;
}

function isMessage(value: unknown): value is Message {
  return typeof value === "object" && value !== null && "event" in value;
}

function record(value: unknown) {
  if (isMessage(value)) messages.push(value);
}

const work = mkdtempSync(path.join(tmpdir(), "synq-transfer-"));
export const uploads = path.join(work, "uploads");
export const messages = new Array<Message>();
const waiters = new Set<() => void>();
let child: ReturnType<typeof spawn> | undefined;
let port = 0;

export function command(value: Record<string, unknown>) {
  child?.stdin?.write(`${JSON.stringify(value)}\n`);
}

function waitForMessage() {
  return new Promise<void>((resolve) => {
    function done() {
      waiters.delete(done);
      resolve();
    }
    waiters.add(done);
    setTimeout(done, 200);
  });
}

/** Resolves with the first message past `from` that matches. */
export async function next(
  match: (message: Message) => boolean,
  from = messages.length,
) {
  const deadline = Date.now() + 8000;
  for (;;) {
    const found = messages.slice(from).find(match);
    if (found !== undefined) return found;
    if (Date.now() > deadline) {
      throw new Error(`Timed out. Saw ${JSON.stringify(messages.slice(from))}`);
    }
    await waitForMessage();
  }
}

export function nextEvent(event: string, from = messages.length) {
  return next((message) => message.event === event, from);
}

export async function startServer() {
  const binary = path.join(work, "harness");
  const built = spawnSync("swiftc", [
    "-swift-version",
    "5",
    path.join(MODULE, "ios/TransferServer.swift"),
    path.join(MODULE, "test/main.swift"),
    "-o",
    binary,
  ]);
  assert.equal(built.status, 0, String(built.stderr));
  child = spawn(binary, ["0", uploads]);
  let pending = "";
  child.stdout?.setEncoding("utf8");
  child.stdout?.on("data", (chunk: string) => {
    pending += chunk;
    const lines = pending.split("\n");
    pending = lines.pop() ?? "";
    for (const line of lines) record(JSON.parse(line));
    for (const waiter of waiters) waiter();
  });
  const listening = await nextEvent("listening", 0);
  port = Number(listening.port);
}

export function stopServer() {
  child?.kill();
  rmSync(work, { force: true, recursive: true });
}

export async function setState(json: string, accepting: boolean) {
  const from = messages.length;
  command({ accepting, command: "state", json });
  await nextEvent("stateSet", from);
}

export function connection() {
  return { agent: false, host: "127.0.0.1", port };
}

export function request(options: http.RequestOptions, body?: Buffer) {
  return new Promise<{ status: number; text: string }>((resolve, reject) => {
    const req = http.request({ ...connection(), ...options }, (res) => {
      let text = "";
      res.setEncoding("utf8");
      res.on("data", (chunk: string) => {
        text += chunk;
      });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, text }));
    });
    req.on("error", reject);
    req.end(body);
  });
}

export function upload(name: string, body: Buffer, id?: string) {
  return request(
    {
      headers: {
        "Content-Length": body.length,
        "Content-Type": "audio/mpeg; synq-remaining=0",
        "X-File-Name": encodeURIComponent(name),
        ...(id === undefined ? {} : { "X-Upload-Id": id }),
      },
      method: "POST",
      path: "/upload",
    },
    body,
  );
}

/** Starts an upload of `size` bytes that the test finishes or breaks off. */
export function openUpload(name: string, size: number) {
  return http.request({
    ...connection(),
    headers: {
      "Content-Length": size,
      "Content-Type": "audio/mpeg",
      "X-File-Name": name,
    },
    method: "POST",
    path: "/upload",
  });
}

function parseEvent(block: string) {
  const fields = new Map(
    block.split("\n").map((line) => {
      const colon = line.indexOf(":");
      return [line.slice(0, colon), line.slice(colon + 1).trim()] as const;
    }),
  );
  return { data: fields.get("data") ?? "", event: fields.get("event") ?? "" };
}

/** Opens `/events`, collecting its events until `close`. */
export async function events() {
  const seen = new Array<{ event: string; data: string }>();
  const req = http.get({ ...connection(), path: "/events" });
  const response = await new Promise<http.IncomingMessage>(
    (resolve, reject) => {
      req.on("response", resolve);
      req.on("error", reject);
    },
  );
  let buffer = "";
  response.setEncoding("utf8");
  response.on("data", (chunk: string) => {
    buffer += chunk;
    let end = buffer.indexOf("\n\n");
    while (end >= 0) {
      seen.push(parseEvent(buffer.slice(0, end)));
      buffer = buffer.slice(end + 2);
      end = buffer.indexOf("\n\n");
    }
  });
  return {
    close: () => req.destroy(),
    contentType: response.headers["content-type"],
    until: async (
      match: (entry: { event: string; data: string }) => boolean,
    ) => {
      const deadline = Date.now() + 8000;
      while (!seen.some(match)) {
        if (Date.now() > deadline) {
          throw new Error(`Saw ${JSON.stringify(seen)}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    },
  };
}
