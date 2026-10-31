import { useSyncExternalStore } from "react";

import type { ImportSource, ReadSong } from "./pipeline";
import { track } from "~/features/analytics/analytics";
import { isPremium, subscribePremium } from "~/features/premium/premium";
import { successFeedback } from "~/lib/haptics";
import { IMPORT_WAIT_MS, importGate } from "./free-tier";
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
 * order, one at a time, under the free tier's rules (`free-tier.ts`). The
 * work goes on if the sheet closes, except that the free tier's wait and
 * anything locked are dropped.
 */

export type ImportItemStatus =
  /** Wi-Fi Transfer is still receiving it. */
  | "receiving"
  | "reading"
  /** Read, waiting for the songs before it. */
  | "queued"
  /** The free tier's wait. */
  | "waiting"
  | "importing"
  | "imported"
  /** Free tier: needs Premium. */
  | "locked"
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
  /** The free tier's wait, 0 to 1, while it runs. */
  readonly wait: number | null;
}

/** Statuses of songs the batch is still working on. */
export const PENDING = new Set<ImportItemStatus>([
  "receiving",
  "reading",
  "queued",
  "waiting",
  "importing",
]);

const EMPTY: ImportSessionState = { id: 0, items: [], kind: null, wait: null };
let batches = 0;

interface Run {
  readonly kind: ImportKind;
  readonly sources: Map<string, ImportSource>;
  readonly reads: Map<string, ReadSong>;
  reading: Promise<void>;
  importing: Promise<void>;
  freeSongUsed: boolean;
  closed: boolean;
}

let state = EMPTY;
let run: Run | null = null;
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

function setWait(current: Run, wait: number | null) {
  if (run === current) publish({ ...state, wait });
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** The free tier's wait; Premium (bought meanwhile) or closing ends it. */
async function importWait(current: Run) {
  const start = Date.now();
  for (;;) {
    const progress = (Date.now() - start) / IMPORT_WAIT_MS;
    if (current.closed || isPremium() || progress >= 1) break;
    setWait(current, progress);
    await delay(200);
  }
  setWait(current, null);
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
  const gate = importGate({
    freeSongUsed: current.freeSongUsed,
    premium: isPremium(),
  });
  if (gate === "lock") {
    update(current, key, { status: "locked" });
    return;
  }
  if (gate === "wait-then-import") {
    current.freeSongUsed = true;
    update(current, key, { status: "waiting" });
    await importWait(current);
    if (current.closed) {
      discardSource(source);
      return;
    }
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
  run = {
    closed: false,
    freeSongUsed: false,
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
  if (current === null) return;
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
  if (run === null || state.items.some((item) => item.key === key)) return;
  publish({ ...state, items: [...state.items, newItem(key, name, "receiving")] });
}

export function receivedProgress(key: string, received: number) {
  if (run !== null) update(run, key, { received });
}

export function receiveFailed(key: string) {
  if (run !== null) update(run, key, { status: "failed" });
}

/** A file Wi-Fi Transfer received in full. */
export function receivedImport(source: ImportSource) {
  const current = run;
  if (current === null) return;
  update(current, source.key, { name: source.name, received: 1, status: "reading" });
  current.sources.set(source.key, source);
  schedule(current, source.key);
}

/**
 * Ends the batch when its sheet closes: imports already running finish;
 * the wait and locked songs are dropped. Sends 2.5.2's finish or cancel
 * event, and a finished import may ask for a review.
 */
export function endImportSession() {
  const current = run;
  if (current === null) return;
  current.closed = true;
  run = null;
  const imported = state.items.filter((item) => item.status === "imported");
  if (imported.length > 0) {
    track("import_finish", { numberOfSongs: imported.length });
    recordFinishedImport();
  } else if (state.items.length > 0) {
    track("import_cancel");
  }
  for (const item of state.items) {
    if (item.status === "locked") {
      const source = current.sources.get(item.key);
      if (source !== undefined) discardSource(source);
    }
  }
  publish(EMPTY);
  void Promise.all([current.reading, current.importing]).then(() => {
    if (run === null) clearImportStaging();
  });
}

/** Imports the locked songs once Premium is bought from the sheet. */
function unlockLocked() {
  const current = run;
  if (current === null || !isPremium()) return;
  for (const item of state.items) {
    if (item.status !== "locked") continue;
    update(current, item.key, { status: "queued" });
    const key = item.key;
    current.importing = current.importing.then(() => importStep(current, key));
  }
}

subscribePremium(unlockLocked);

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
