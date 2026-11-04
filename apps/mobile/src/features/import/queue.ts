import type { ImportSource, ReadSong } from "./pipeline.ts";
import type { BatchCounts, CapsuleCount, Transfer } from "./progress.ts";
import {
  CAPSULE_TICK_MS,
  capsuleHold,
  capsuleTarget,
  completionDelay,
  isBatchActive,
  NEW_TRANSFER,
  NO_BATCH,
  NO_COUNT,
  startsTransfer,
  stepCapsule,
  withNothingAnnounced,
} from "./progress.ts";

/**
 * The app's one import queue (docs/ui.md → Import). Files from a Files pick
 * or a Wi-Fi transfer are read and imported in the order they came, one at
 * a time, in the background; nothing here depends on a screen being open. A
 * batch is everything imported from when the queue starts until it's empty
 * and nothing more is on its way, so a second pick during an import just
 * makes the batch longer. A download keeps the batch open between its songs
 * (`setIncomingImports`).
 *
 * Each song is written to the library as it finishes, so a batch cut short
 * keeps what it got, but library screens refresh only once, when the batch
 * is done, and its songs appear together. A library write made during a
 * batch (a like, a rename) refreshes as always, so it can show the songs
 * written so far; lists hold their position through that (`ScreenList`).
 */

/** What the queue needs from the app, which tests replace. */
export interface ImportQueueDeps {
  read: (source: ImportSource) => Promise<ReadSong>;
  /** Writes a read song to the library, and moves its files in. */
  add: (source: ImportSource, read: ReadSong) => Promise<unknown>;
  discard: (source: ImportSource) => void;
  clearStaging: () => void;
  /** Refreshes every library screen, settling once they've re-read. */
  refreshLibrary: () => Promise<unknown>;
  /** A batch that imported something is done, and is appearing. */
  onFinished: (finished: {
    imported: number;
    failed: number;
    /** It came, at least partly, over Wi-Fi. */
    received: number;
    appeared: Promise<unknown>;
    isImporting: () => boolean;
  }) => void;
  /** A batch where nothing imported is done. */
  onNothingImported: () => void;
  reportFailures: (names: readonly string[]) => void;
}

export interface ImportState {
  readonly batch: BatchCounts;
  /** The browser's uploads in this batch, if any. */
  readonly transfer: Transfer;
  /** Songs a download will still hand over, which the batch waits for. */
  readonly incoming: number;
  /** The capsule's count, which follows the batch at its own pace. */
  readonly shown: CapsuleCount;
  /** The batch just finished cleanly, and says so for a moment. */
  readonly finished: boolean;
}

/** How long a finished batch's line stays up. */
const FINISHED_LINE_MS = 1800;

/** Types the state (the store's values are built from literals). */
function importState(value: ImportState) {
  return value;
}

const IDLE = importState({
  batch: NO_BATCH,
  finished: false,
  incoming: 0,
  shown: NO_COUNT,
  transfer: NEW_TRANSFER,
});

function notInstalled() {
  return Promise.reject(new Error("The import queue isn't installed."));
}

/** Types the app's half of the queue, for `installImportQueue` to replace. */
function queueDeps(value: ImportQueueDeps) {
  return value;
}

let deps = queueDeps({
  add: notInstalled,
  clearStaging: () => undefined,
  discard: () => undefined,
  onFinished: () => undefined,
  onNothingImported: () => undefined,
  read: notInstalled,
  refreshLibrary: notInstalled,
  reportFailures: () => undefined,
});
let state = IDLE;
const listeners = new Set<() => void>();

let reading = Promise.resolve();
let importing = Promise.resolve();
const reads = new Map<string, ReadSong>();
let failedNames = new Array<string>();

let finishedTimer: ReturnType<typeof setTimeout> | undefined;
let completionTimer: ReturnType<typeof setTimeout> | undefined;
let capsuleTimer: ReturnType<typeof setInterval> | undefined;
/** When the capsule came up for this batch. */
let capsuleStarted = 0;
/** Uploads are allowed, so one may start at any moment. */
let transfersOn = false;
let onTransferStarting: (() => void) | undefined;

function publish(change: Partial<ImportState>) {
  state = { ...state, ...change };
  for (const listener of listeners) listener();
}

function clearStaging() {
  // An upload could be starting right now, into this folder. Its files are
  // moved or discarded one by one anyway, and the next idle moment clears it.
  if (!transfersOn) deps.clearStaging();
}

function stopCapsule() {
  if (capsuleTimer !== undefined) clearInterval(capsuleTimer);
  capsuleTimer = undefined;
}

/** The capsule's count takes one step toward the real one. */
function tickCapsule() {
  const next = stepCapsule(
    state.shown,
    capsuleTarget(state.batch, state.transfer, state.incoming),
  );
  if (next.done !== state.shown.done || next.total !== state.shown.total) {
    publish({ shown: next });
  }
}

/** Something joined the batch; a finished one gives way to a new one. */
function beginActivity() {
  if (finishedTimer !== undefined) clearTimeout(finishedTimer);
  finishedTimer = undefined;
  if (state.finished) {
    publish({ batch: NO_BATCH, finished: false, shown: NO_COUNT });
  }
  if (capsuleTimer === undefined) {
    capsuleStarted = Date.now();
    capsuleTimer = setInterval(tickCapsule, CAPSULE_TICK_MS);
  }
}

/**
 * The batch is done: its songs appear together, in one refresh of the
 * library. Says once which files failed, and may ask for a review if none did.
 */
function finishBatch() {
  const { failed, imported, total } = state.batch;
  const { received } = state.transfer;
  stopCapsule();
  const names = failedNames;
  failedNames = [];
  if (imported > 0) {
    deps.onFinished({
      appeared: deps.refreshLibrary(),
      failed,
      imported,
      isImporting: () => capsuleTimer !== undefined,
      received,
    });
  } else if (total > 0) {
    deps.onNothingImported();
  }
  clearStaging();
  if (names.length > 0) deps.reportFailures(names);
  if (imported > 0 && names.length === 0) {
    publish({
      finished: true,
      shown: NO_COUNT,
      transfer: NEW_TRANSFER,
    });
    finishedTimer = setTimeout(() => {
      finishedTimer = undefined;
      publish({ batch: NO_BATCH, finished: false });
    }, FINISHED_LINE_MS);
  } else {
    publish({
      batch: NO_BATCH,
      finished: false,
      shown: NO_COUNT,
      transfer: NEW_TRANSFER,
    });
  }
}

/** Called after any change the batch's completion depends on. */
function reconsiderCompletion() {
  if (completionTimer !== undefined) clearTimeout(completionTimer);
  completionTimer = undefined;
  if (state.finished || state.incoming > 0) return;
  if (!isBatchActive(state.batch, state.transfer)) {
    // An upload that came to nothing: the capsule just goes away.
    if (capsuleTimer !== undefined) finishBatch();
    return;
  }
  const delay = completionDelay(state.transfer, state.batch);
  if (delay === null) return;
  completionTimer = setTimeout(
    () => {
      completionTimer = undefined;
      finishBatch();
    },
    Math.max(delay, capsuleHold(capsuleStarted, Date.now())),
  );
}

function settled(change: Partial<BatchCounts>, name?: string) {
  if (name !== undefined) failedNames.push(name);
  publish({ batch: { ...state.batch, ...change } });
  reconsiderCompletion();
}

async function readStep(source: ImportSource) {
  const read = await deps.read(source).catch(() => null);
  if (read !== null) {
    reads.set(source.key, read);
    return;
  }
  deps.discard(source);
  settled({ failed: state.batch.failed + 1 }, source.name);
}

async function importStep(source: ImportSource) {
  const read = reads.get(source.key);
  if (read === undefined) return;
  reads.delete(source.key);
  const imported = await deps.add(source, read).then(
    () => true,
    () => false,
  );
  deps.discard(source);
  if (imported) settled({ imported: state.batch.imported + 1 });
  else settled({ failed: state.batch.failed + 1 }, source.name);
}

/** Counts files into the batch, starting a new one if the queue was idle. */
function enqueue(count: number) {
  beginActivity();
  publish({ batch: { ...state.batch, total: state.batch.total + count } });
}

function schedule(source: ImportSource) {
  const read = reading.then(() => readStep(source));
  reading = read;
  importing = Promise.all([importing, read]).then(() => importStep(source));
}

/** Imports picked files in the background. */
export function addImportSources(sources: readonly ImportSource[]) {
  if (sources.length === 0) return;
  if (state.finished || !isBatchActive(state.batch, state.transfer)) {
    clearStaging();
  }
  enqueue(sources.length);
  // Shows the count from the first frame, without waiting for a tick. A
  // download's song is still in `incoming` here, and would count twice.
  if (state.incoming === 0) tickCapsule();
  reconsiderCompletion();
  for (const source of sources) schedule(source);
}

/**
 * How many songs downloads will still hand over. The batch stays open for them
 * and counts them in its total, so a download is one batch, not one per song.
 */
export function setIncomingImports(count: number) {
  if (count === state.incoming) return;
  if (count > 0) beginActivity();
  publish({ incoming: count });
  tickCapsule();
  reconsiderCompletion();
}

/**
 * Wi-Fi Transfer's switch changed. Going off, the page holds what it has
 * queued, so as far as this batch goes nothing more is coming, and any
 * upload already on its way still finishes.
 */
export function setTransfersOn(on: boolean) {
  transfersOn = on;
  if (on) return;
  publish({ transfer: withNothingAnnounced(state.transfer) });
  reconsiderCompletion();
}

/**
 * Runs when a batch's first upload starts, so Wi-Fi Transfer's sheet can give
 * way to the capsule. Returns how to stop.
 */
export function onTransferStart(listener: () => void) {
  onTransferStarting = listener;
  return () => {
    if (onTransferStarting === listener) onTransferStarting = undefined;
  };
}

function changeTransfer(change: (transfer: Transfer) => Transfer) {
  publish({ transfer: change(state.transfer) });
  reconsiderCompletion();
}

function withoutUpload(transfer: Transfer, id: string) {
  const { [id]: _gone, ...uploads } = transfer.uploads;
  return uploads;
}

/** `remaining` is how many the page says will follow, if the server passed it on. */
export function uploadStarted(
  id: string,
  name: string,
  remaining: number | null,
) {
  const first = startsTransfer(state.transfer);
  beginActivity();
  changeTransfer((transfer) => ({
    ...transfer,
    announced:
      remaining ??
      (transfer.announced === null
        ? null
        : Math.max(0, transfer.announced - 1)),
    uploads: { ...transfer.uploads, [id]: { name } },
  }));
  tickCapsule();
  if (first) onTransferStarting?.();
}

/**
 * An upload broke off partway, because the page was closed or cancelled or the
 * connection went. Not a failed file: the page shows what happened and sends
 * it again if it can.
 */
export function uploadFailed(id: string) {
  if (state.transfer.uploads[id] === undefined) return;
  changeTransfer((transfer) => ({
    ...transfer,
    lost: transfer.lost + 1,
    uploads: withoutUpload(transfer, id),
  }));
}

/** A file arrived in full; `remaining` is how many the page says will follow. */
export function uploadReceived(source: ImportSource, remaining: number | null) {
  enqueue(1);
  changeTransfer((transfer) => ({
    ...transfer,
    announced: remaining,
    received: transfer.received + 1,
    uploads: withoutUpload(transfer, source.key),
  }));
  schedule(source);
}

/** The server stopped (the network went): its uploads are gone. */
export function uploadsStopped() {
  changeTransfer((transfer) => ({ ...transfer, uploads: {} }));
}

export function subscribeImportState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getImportState() {
  return state;
}

/** Joins the queue to the app, or, in a test, starts it afresh. */
export function installImportQueue(app: ImportQueueDeps) {
  deps = app;
  state = IDLE;
  listeners.clear();
  reads.clear();
  failedNames = [];
  transfersOn = false;
  onTransferStarting = undefined;
  capsuleTimer = undefined;
  completionTimer = undefined;
  finishedTimer = undefined;
  reading = Promise.resolve();
  importing = Promise.resolve();
}
