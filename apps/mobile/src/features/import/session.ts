import { useSyncExternalStore } from "react";

import type { ImportSource, ReadSong } from "./pipeline";
import { track } from "~/features/analytics/analytics";
import { successFeedback } from "~/lib/haptics";
import {
  clearImportStaging,
  discardSource,
  importSong,
  readSource,
  stagedCoverUri,
} from "./pipeline";
import { recordFinishedImport } from "./review";

/**
 * One import batch (a Files pick, or a Wi-Fi Transfer visit) as the import
 * sheet shows it. Files are read in order as they arrive, then imported in
 * order, one at a time. The work goes on if the sheet closes.
 */

export type ImportItemStatus =
  /** Wi-Fi Transfer is still receiving it. */
  | "receiving"
  | "reading"
  /** Read, waiting for the songs before it. */
  | "queued"
  | "importing"
  | "imported"
  | "failed";

export interface ImportItem {
  readonly key: string;
  readonly name: string;
  readonly status: ImportItemStatus;
  readonly title: string | null;
  readonly artist: string | null;
  readonly coverUri: string | null;
  /** Wi-Fi Transfer's upload progress, 0 to 1. */
  readonly received: number;
}

export type ImportKind = "files" | "wifi";

export interface ImportSessionState {
  /** Identifies the batch; 0 when there's none. */
  readonly id: number;
  readonly kind: ImportKind | null;
  readonly items: readonly ImportItem[];
}

/** Statuses of songs the batch is still working on. */
export const PENDING = new Set<ImportItemStatus>([
  "receiving",
  "reading",
  "queued",
  "importing",
]);

/** Types a session state (the store's values are built from literals). */
function sessionState(value: ImportSessionState) {
  return value;
}

const EMPTY = sessionState({ id: 0, items: [], kind: null });
let batches = 0;

interface Run {
  readonly kind: ImportKind;
  readonly sources: Map<string, ImportSource>;
  readonly reads: Map<string, ReadSong>;
  reading: Promise<void>;
  importing: Promise<void>;
  closed: boolean;
}

let state = EMPTY;
let run: Run | undefined;
/** An ended batch's imports are still finishing; its staging is in use. */
let working = false;
const listeners = new Set<() => void>();

function publish(next: ImportSessionState) {
  state = next;
  for (const listener of listeners) listener();
}

function update(current: Run, key: string, change: Partial<ImportItem>) {
  if (run !== current) return;
  publish({
    ...state,
    items: state.items.map((item) =>
      item.key === key ? { ...item, ...change } : item,
    ),
  });
}

async function readStep(current: Run, key: string) {
  const source = current.sources.get(key);
  if (source === undefined || current.closed) return;
  update(current, key, { status: "reading" });
  try {
    const read = await readSource(source);
    current.reads.set(key, read);
    update(current, key, {
      artist: read.artists,
      coverUri: stagedCoverUri(read),
      status: "queued",
      title: read.title,
    });
  } catch {
    update(current, key, { status: "failed" });
    discardSource(source);
  }
}

async function importStep(current: Run, key: string) {
  const source = current.sources.get(key);
  const read = current.reads.get(key);
  if (source === undefined || read === undefined) return;
  if (current.closed) {
    discardSource(source);
    return;
  }
  update(current, key, { status: "importing" });
  try {
    await importSong(source, read);
    update(current, key, { status: "imported" });
    if (state.items.every((item) => !PENDING.has(item.status))) {
      successFeedback();
    }
  } catch {
    update(current, key, { status: "failed" });
  }
  current.reads.delete(key);
  discardSource(source);
}

function schedule(current: Run, key: string) {
  const reading = current.reading.then(() => readStep(current, key));
  current.reading = reading;
  current.importing = Promise.all([current.importing, reading]).then(() =>
    importStep(current, key),
  );
}

/** Starts a batch, ending any earlier one. */
export function startImportSession(kind: ImportKind) {
  endImportSession();
  // Whatever an earlier launch left staged (it ended without cleaning up).
  if (!working) clearImportStaging();
  run = {
    closed: false,
    importing: Promise.resolve(),
    kind,
    reading: Promise.resolve(),
    reads: new Map(),
    sources: new Map(),
  };
  batches += 1;
  publish({ ...EMPTY, id: batches, kind });
}

function newItem(key: string, name: string, status: ImportItemStatus) {
  return {
    artist: null,
    coverUri: null,
    key,
    name,
    received: 0,
    status,
    title: null,
  } satisfies ImportItem;
}

/** Adds files to the batch; they're read and imported in order. */
export function addImportSources(sources: readonly ImportSource[]) {
  const current = run;
  if (current === undefined) return;
  const known = new Set(state.items.map((item) => item.key));
  publish({
    ...state,
    items: [
      ...state.items,
      ...sources
        .filter((source) => !known.has(source.key))
        .map((source) => newItem(source.key, source.name, "reading")),
    ],
  });
  for (const source of sources) {
    current.sources.set(source.key, source);
    schedule(current, source.key);
  }
}

/** Wi-Fi Transfer started receiving a file. */
export function receivingImport(key: string, name: string) {
  if (run === undefined || state.items.some((item) => item.key === key)) return;
  publish({
    ...state,
    items: [...state.items, newItem(key, name, "receiving")],
  });
}

export function receivedProgress(key: string, received: number) {
  if (run !== undefined) update(run, key, { received });
}

export function receiveFailed(key: string) {
  if (run !== undefined) update(run, key, { status: "failed" });
}

/** A file Wi-Fi Transfer received in full. */
export function receivedImport(source: ImportSource) {
  const current = run;
  if (current === undefined) return;
  update(current, source.key, {
    name: source.name,
    received: 1,
    status: "reading",
  });
  current.sources.set(source.key, source);
  schedule(current, source.key);
}

/**
 * Ends the batch when its sheet closes: imports already running finish.
 * Sends 2.5.2's finish or cancel event, and a finished import may ask for
 * a review.
 */
export function endImportSession() {
  const current = run;
  if (current === undefined) return;
  current.closed = true;
  run = undefined;
  const imported = state.items.filter((item) => item.status === "imported");
  if (imported.length > 0) {
    track("import_finish", { numberOfSongs: imported.length });
    recordFinishedImport();
  } else if (state.items.length > 0) {
    track("import_cancel");
  }
  publish(EMPTY);
  working = true;
  void Promise.all([current.reading, current.importing]).then(() => {
    working = false;
    if (run === undefined) clearImportStaging();
  });
}

export function subscribeImportSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Part of the batch's state, re-rendering when it changes. `select` returns
 * a primitive or part of the state as it is.
 */
export function useImportSession<Selected>(
  select: (session: ImportSessionState) => Selected,
) {
  return useSyncExternalStore(subscribeImportSession, () => select(state));
}

/** The batch's state, outside React. */
export function getImportSession() {
  return state;
}
