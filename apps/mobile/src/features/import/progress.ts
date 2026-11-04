/**
 * What an import batch and a Wi-Fi transfer are doing, as plain data: the
 * words the app shows for them, and when a batch counts as done. No React or
 * native code, so it runs in plain unit tests.
 */
import type { ImportState } from "./queue.ts";

/** The files of the current batch, counted as they finish. */
export interface BatchCounts {
  /** Every file handed to the batch, finished or not. */
  readonly total: number;
  readonly imported: number;
  readonly failed: number;
}

/** The browser's uploads during a batch, as the phone sees them. */
export interface Transfer {
  /** Uploads on their way, by id. */
  readonly uploads: Readonly<Record<string, { name: string }>>;
  /** Files that arrived in full. */
  readonly received: number;
  /** Uploads that broke off. The page retries them or says so itself. */
  readonly lost: number;
  /**
   * How many more files the page says will follow, or null when it hasn't
   * said yet (the first file is still on its way).
   */
  readonly announced: number | null;
}

export const NO_BATCH = {
  failed: 0,
  imported: 0,
  total: 0,
} satisfies BatchCounts;

export const NEW_TRANSFER = {
  announced: null,
  lost: 0,
  received: 0,
  uploads: {},
} satisfies Transfer;

/**
 * After a transfer's last file imports, how long before the songs appear:
 * a second drop of files this soon joins the same batch.
 */
export const SETTLED_MS = 1500;
/**
 * The page didn't say whether more is coming. Browsers start the next file
 * as soon as the last one's response lands, so this gap is generous.
 */
export const UNANNOUNCED_MS = 6000;
/**
 * The page said more is coming, but nothing has started for this long: the
 * browser went away or the files were cancelled. If it comes back, its files
 * are simply the next batch.
 */
export const ABANDONED_MS = 8000;

export function pendingCount({ failed, imported, total }: BatchCounts) {
  return total - imported - failed;
}

function uploadCount(transfer: Transfer) {
  return Object.keys(transfer.uploads).length;
}

/** Whether a batch is under way: something is importing or on its way. */
export function isBatchActive(batch: BatchCounts, transfer: Transfer) {
  return (
    batch.total > 0 ||
    uploadCount(transfer) > 0 ||
    transfer.received + transfer.lost > 0
  );
}

/**
 * How long until a batch counts as done and its songs appear together, or
 * null while it can't be: a file is on its way, or one is still importing.
 * A picked batch is done as soon as its last file is. A transfer waits a
 * little, since the browser sends its files one at a time and the phone
 * must not call it done between two of them.
 */
export function completionDelay(transfer: Transfer, batch: BatchCounts) {
  if (uploadCount(transfer) > 0) return null;
  if (pendingCount(batch) > 0) return null;
  if (transfer.received + transfer.lost === 0) {
    return batch.total > 0 ? 0 : null;
  }
  if (transfer.announced === null) return UNANNOUNCED_MS;
  return transfer.announced > 0 ? ABANDONED_MS : SETTLED_MS;
}

/** Transfers went off: nothing more is coming, whatever the page has queued. */
export function withNothingAnnounced(transfer: Transfer) {
  return { ...transfer, announced: 0 } satisfies Transfer;
}

/**
 * This upload begins a batch's transfer, so Wi-Fi Transfer's sheet gives way
 * to the capsule.
 */
export function startsTransfer(transfer: Transfer) {
  return uploadCount(transfer) === 0 && transfer.received + transfer.lost === 0;
}

/** The page's count of files still to come, carried on an upload's type. */
const REMAINING = /;\s*synq-remaining=(\d+)\s*$/;

/** Splits an upload's Content-Type into the file's type and that count. */
export function parseUploadType(contentType: string) {
  const match = REMAINING.exec(contentType);
  if (match === null) return { mimeType: contentType, remaining: null };
  return {
    mimeType: contentType.slice(0, match.index),
    remaining: Number(match[1]),
  };
}

/** What the capsule says, smoothed from the real counts. */
export interface CapsuleCount {
  /** Files done so far, as shown. */
  readonly done: number;
  /** Files in the batch so far, as shown. It never shrinks during a batch. */
  readonly total: number;
}

export const NO_COUNT = { done: 0, total: 0 } satisfies CapsuleCount;

/** The capsule's words change at most this often, however fast files go. */
export const CAPSULE_TICK_MS = 350;
/** A capsule that came up stays up at least this long before its result. */
export const CAPSULE_MIN_MS = 900;

/** The real counts the capsule moves toward. */
export function capsuleTarget(
  batch: BatchCounts,
  transfer: Transfer,
  incoming = 0,
) {
  return {
    done: batch.imported + batch.failed,
    total:
      batch.total +
      uploadCount(transfer) +
      (transfer.announced ?? 0) +
      incoming,
  } satisfies CapsuleCount;
}

/**
 * One tick toward the real counts. It covers a quarter of the distance, at
 * least one file, so a fast import reads as a count rising rather than
 * numbers flying past, and it can't fall far behind a long one.
 */
export function stepCapsule(shown: CapsuleCount, target: CapsuleCount) {
  const gap = target.done - shown.done;
  return {
    done: gap <= 0 ? shown.done : shown.done + Math.max(1, Math.ceil(gap / 4)),
    total: Math.max(shown.total, target.total),
  } satisfies CapsuleCount;
}

/** How much longer a capsule must stay before its result. */
export function capsuleHold(startedAt: number, now: number) {
  return Math.max(0, startedAt + CAPSULE_MIN_MS - now);
}

function songs(n: number) {
  return `${String(n)} ${n === 1 ? "Song" : "Songs"}`;
}

/** The capsule's line while a batch runs: "Importing 3 of 12". */
export function capsuleLine({ done, total }: CapsuleCount) {
  if (total <= 1) return `Importing ${songs(1)}`;
  return `Importing ${String(Math.min(done + 1, total))} of ${String(total)}`;
}

/** The capsule's one completion line: "12 Songs Imported". */
export function finishedLine(imported: number) {
  return `${songs(imported)} Imported`;
}

/** How many failed files an alert names before it just counts the rest. */
const NAMED_FAILURES = 5;

/** The alert for files that couldn't be imported, listing them. */
export function failureReport(names: readonly string[]) {
  const named = names.slice(0, NAMED_FAILURES);
  const more = names.length - named.length;
  return {
    message: [...named, ...(more > 0 ? [`and ${String(more)} more`] : [])].join(
      "\n",
    ),
    title:
      names.length === 1
        ? "Couldn't Import 1 File"
        : `Couldn't Import ${String(names.length)} Files`,
  };
}

/** The line to show, or null while there's nothing to say. */
export function activityLine({
  batch,
  finished,
  incoming,
  shown,
  transfer,
}: ImportState) {
  if (finished) return finishedLine(batch.imported);
  if (incoming === 0 && !isBatchActive(batch, transfer)) return null;
  // Nothing to count yet, as when an upload broke off with none arrived.
  return shown.total === 0 ? null : capsuleLine(shown);
}
