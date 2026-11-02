import { useSyncExternalStore } from "react";
import { Alert } from "react-native";

import type { ImportSource, ReadSong } from "./pipeline";
import type { BatchCounts, Transfer } from "./progress";
import { track } from "~/features/analytics/analytics";
import { successFeedback } from "~/lib/haptics";
import { queryClient } from "~/lib/query-client";
import {
  clearImportStaging,
  discardSource,
  importSong,
  readSource,
} from "./pipeline";
import {
  completionDelay,
  failureReport,
  NEW_TRANSFER,
  NO_BATCH,
  pendingCount,
} from "./progress";
import { recordFinishedImport } from "./review";

/**
 * The app's one import queue (docs/ui.md → Import). Files from a Files pick
 * or a Wi-Fi transfer are read and imported in the order they came, one at
 * a time, in the background; nothing here depends on a screen being open. A
 * batch is everything imported from when the queue starts until it's empty
 * again, so a second pick during an import just makes the batch longer.
 */

export interface ImportState {
  readonly batch: BatchCounts;
  /** The Wi-Fi Transfer sheet's visit, while the sheet is open. */
  readonly transfer: Transfer | null;
  /** The batch just finished cleanly, and says so for a moment. */
  readonly finished: boolean;
}

/** How long a finished batch's line stays up. */
const FINISHED_LINE_MS = 1800;
/**
 * The library refreshes at most this often during an import, and less often
 * when a refresh is slow. Reads are synchronous and a refresh re-reads every
 * list on screen: with thousands of songs one can take most of a second, so
 * on a fixed schedule refreshing leaves the queue almost no time to import.
 * This keeps refreshes to a tenth of the JavaScript thread's time.
 */
const MIN_REFRESH_INTERVAL_MS = 1000;
const REFRESH_COST_FACTOR = 9;

/** Types the state (the store's values are built from literals). */
function importState(value: ImportState) {
  return value;
}

let state = importState({ batch: NO_BATCH, finished: false, transfer: null });
const listeners = new Set<() => void>();

let reading = Promise.resolve();
let importing = Promise.resolve();
const reads = new Map<string, ReadSong>();
let failedNames = new Array<string>();

let finishedTimer: ReturnType<typeof setTimeout> | undefined;
let completionTimer: ReturnType<typeof setTimeout> | undefined;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
let nextRefresh = 0;
let onTransferComplete: (() => void) | undefined;

function publish(change: Partial<ImportState>) {
  state = { ...state, ...change };
  for (const listener of listeners) listener();
}

function refreshLibrary() {
  if (refreshTimer !== undefined) return;
  function refresh() {
    refreshTimer = undefined;
    const started = Date.now();
    nextRefresh = started + MIN_REFRESH_INTERVAL_MS;
    void queryClient
      .invalidateQueries({ queryKey: ["library"] })
      .finally(() => {
        const cost = Date.now() - started;
        nextRefresh = Math.max(
          nextRefresh,
          Date.now() + cost * REFRESH_COST_FACTOR,
        );
      });
  }
  const wait = nextRefresh - Date.now();
  if (wait <= 0) refresh();
  else refreshTimer = setTimeout(refresh, wait);
}

/** The batch is over: the last songs shouldn't wait out a long interval. */
function flushRefresh() {
  if (refreshTimer === undefined) return;
  clearTimeout(refreshTimer);
  refreshTimer = undefined;
  nextRefresh = 0;
  refreshLibrary();
}

/** Says once which files failed, and may ask for a review if none did. */
function finishBatch({ showLine }: { showLine: boolean }) {
  const { failed, imported, total } = state.batch;
  if (total === 0) return;
  if (imported > 0) {
    track("import_finish", { numberOfSongs: imported });
    recordFinishedImport({ mayAskForReview: failed === 0 });
  } else {
    track("import_cancel");
  }
  const names = failedNames;
  failedNames = [];
  flushRefresh();
  clearImportStaging();
  if (names.length > 0) {
    const report = failureReport(names);
    Alert.alert(report.title, report.message);
  }
  if (showLine && names.length === 0) {
    publish({ finished: true });
    finishedTimer = setTimeout(() => {
      publish({ batch: NO_BATCH, finished: false });
    }, FINISHED_LINE_MS);
  } else {
    publish({ batch: NO_BATCH, finished: false });
  }
}

/** A transfer's wait is over: it closes, or, with nothing imported, says why. */
function completeTransfer() {
  completionTimer = undefined;
  if (state.batch.imported > 0) {
    successFeedback();
    onTransferComplete?.();
    return;
  }
  // Nothing made it, so the sheet stays open with its address, to try again.
  finishBatch({ showLine: false });
  publish({ transfer: NEW_TRANSFER });
}

/** Called after any change a transfer's completion depends on. */
function reconsiderTransfer() {
  if (completionTimer !== undefined) clearTimeout(completionTimer);
  completionTimer = undefined;
  if (state.transfer === null) return;
  const delay = completionDelay(state.transfer, state.batch);
  if (delay !== null) completionTimer = setTimeout(completeTransfer, delay);
}

function settled(change: Partial<BatchCounts>, name?: string) {
  if (name !== undefined) failedNames.push(name);
  publish({ batch: { ...state.batch, ...change } });
  if (state.transfer !== null) reconsiderTransfer();
  else if (pendingCount(state.batch) === 0) finishBatch({ showLine: true });
}

async function readStep(source: ImportSource) {
  const read = await readSource(source).catch(() => null);
  if (read !== null) {
    reads.set(source.key, read);
    return;
  }
  discardSource(source);
  settled({ failed: state.batch.failed + 1 }, source.name);
}

async function importStep(source: ImportSource) {
  const read = reads.get(source.key);
  if (read === undefined) return;
  reads.delete(source.key);
  const imported = await importSong(source, read).then(
    () => true,
    () => false,
  );
  discardSource(source);
  if (imported) {
    refreshLibrary();
    settled({ imported: state.batch.imported + 1 });
  } else {
    settled({ failed: state.batch.failed + 1 }, source.name);
  }
}

/** Counts files into the batch, starting a new one if the queue was idle. */
function enqueue(count: number) {
  if (finishedTimer !== undefined) clearTimeout(finishedTimer);
  finishedTimer = undefined;
  const fresh = state.finished ? NO_BATCH : state.batch;
  publish({ batch: { ...fresh, total: fresh.total + count }, finished: false });
}

function schedule(source: ImportSource) {
  const read = reading.then(() => readStep(source));
  reading = read;
  importing = Promise.all([importing, read]).then(() => importStep(source));
}

/** Imports picked files in the background. */
export function addImportSources(sources: readonly ImportSource[]) {
  if (sources.length === 0) return;
  if (state.batch.total === 0 && state.transfer === null) clearImportStaging();
  enqueue(sources.length);
  for (const source of sources) schedule(source);
}

/**
 * The Wi-Fi Transfer sheet opened. `onComplete` runs once its transfer is
 * complete (`completionDelay`), for the sheet to close.
 */
export function openTransfer(onComplete: () => void) {
  if (pendingCount(state.batch) === 0) clearImportStaging();
  if (finishedTimer !== undefined) clearTimeout(finishedTimer);
  finishedTimer = undefined;
  onTransferComplete = onComplete;
  publish({
    batch: state.finished ? NO_BATCH : state.batch,
    finished: false,
    transfer: NEW_TRANSFER,
  });
}

/**
 * The sheet closed. Uploads still on their way stop with the server, by the
 * person's choice, so they aren't failures. Whatever arrived goes on
 * importing in the background.
 */
export function closeTransfer() {
  onTransferComplete = undefined;
  if (completionTimer !== undefined) clearTimeout(completionTimer);
  completionTimer = undefined;
  publish({ transfer: null });
  if (pendingCount(state.batch) === 0) finishBatch({ showLine: false });
}

function changeTransfer(change: (transfer: Transfer) => Transfer) {
  if (state.transfer === null) return;
  publish({ transfer: change(state.transfer) });
  reconsiderTransfer();
}

function withoutUpload(transfer: Transfer, id: string) {
  const { [id]: _gone, ...uploads } = transfer.uploads;
  return uploads;
}

export function uploadStarted(id: string, name: string) {
  changeTransfer((transfer) => ({
    ...transfer,
    announced:
      transfer.announced === null ? null : Math.max(0, transfer.announced - 1),
    uploads: { ...transfer.uploads, [id]: { fraction: 0, name } },
  }));
}

export function uploadProgressed(id: string, fraction: number) {
  const upload = state.transfer?.uploads[id];
  if (upload === undefined) return;
  changeTransfer((transfer) => ({
    ...transfer,
    uploads: { ...transfer.uploads, [id]: { ...upload, fraction } },
  }));
}

/** An upload broke off partway: a failed file, reported with the rest. */
export function uploadFailed(id: string) {
  const name = state.transfer?.uploads[id]?.name;
  if (name === undefined) return;
  failedNames.push(name);
  publish({
    batch: {
      ...state.batch,
      failed: state.batch.failed + 1,
      total: state.batch.total + 1,
    },
  });
  changeTransfer((transfer) => ({
    ...transfer,
    lost: transfer.lost + 1,
    uploads: withoutUpload(transfer, id),
  }));
}

/** A file arrived in full; `remaining` is how many the page says will follow. */
export function uploadReceived(source: ImportSource, remaining: number | null) {
  if (state.transfer === null) return;
  enqueue(1);
  changeTransfer((transfer) => ({
    ...transfer,
    announced: remaining,
    received: transfer.received + 1,
    uploads: withoutUpload(transfer, source.key),
  }));
  schedule(source);
}

/** The server stopped (Try Again, or the network went): its uploads are gone. */
export function uploadsStopped() {
  changeTransfer((transfer) => ({ ...transfer, uploads: {} }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Part of the import state, re-rendering when it changes. `select` returns
 * a primitive or part of the state as it is.
 */
export function useImportState<Selected>(
  select: (current: ImportState) => Selected,
) {
  return useSyncExternalStore(subscribe, () => select(state));
}
