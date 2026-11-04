import { mock } from "node:test";

import type { ImportSource, ReadSong } from "./pipeline.ts";
import { installImportQueue } from "./queue.ts";

const READ = {
  album: null,
  albumArtists: null,
  artists: null,
  compilation: false,
  covers: null,
  durationMs: 1000,
  mimeType: null,
  title: "Song",
  track: null,
  year: null,
} satisfies ReadSong;

export function source(name: string) {
  return {
    key: name,
    mimeType: null,
    name,
    uri: `file:///${name}`,
  } satisfies ImportSource;
}

/** A queue with its app replaced, and a record of what it asked for. */
export function setup(failing: readonly string[] = []) {
  const log = {
    added: new Array<string>(),
    finished: new Array<{ imported: number; failed: number }>(),
    nothing: 0,
    refreshes: 0,
    reported: new Array<readonly string[]>(),
    staged: 0,
  };
  installImportQueue({
    add: (item) => {
      if (failing.includes(item.name)) return Promise.reject(new Error("no"));
      log.added.push(item.name);
      return Promise.resolve();
    },
    clearStaging: () => {
      log.staged += 1;
    },
    discard: () => undefined,
    onFinished: ({ failed, imported }) =>
      log.finished.push({ failed, imported }),
    onNothingImported: () => {
      log.nothing += 1;
    },
    read: () => Promise.resolve(READ),
    refreshLibrary: () => {
      log.refreshes += 1;
      return Promise.resolve();
    },
    reportFailures: (names) => log.reported.push(names),
  });
  return log;
}

/** Lets the queue's promises run, then moves the clock. */
export async function advance(ms: number) {
  for (let turn = 0; turn < 400; turn += 1) await Promise.resolve();
  mock.timers.tick(ms);
  for (let turn = 0; turn < 400; turn += 1) await Promise.resolve();
}
