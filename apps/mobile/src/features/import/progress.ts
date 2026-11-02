/**
 * What an import batch and a Wi-Fi transfer are doing, as plain data: the
 * words the app shows for them, and when a transfer counts as complete.
 * No React or native code, so it runs in plain unit tests.
 */

/** The files of the current batch, counted as they finish. */
export interface BatchCounts {
  /** Every file handed to the batch, finished or not. */
  readonly total: number;
  readonly imported: number;
  readonly failed: number;
}

/** One Wi-Fi Transfer visit, as the phone sees the browser's uploads. */
export interface Transfer {
  /** Uploads on their way, by id, with how much has arrived (0 to 1). */
  readonly uploads: Readonly<
    Record<string, { name: string; fraction: number }>
  >;
  /** Files that arrived in full. */
  readonly received: number;
  /** Uploads that broke off. */
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
 * Once everything has arrived and imported, how long the sheet stays. Long
 * enough to read the result, and for a second drop of files to catch it.
 */
export const SETTLED_MS = 1800;
/**
 * The page didn't say whether more is coming. Browsers start the next file
 * as soon as the last one's response lands, so this gap is generous.
 */
export const UNANNOUNCED_MS = 6000;
/**
 * The page said more is coming, but nothing has started for this long: the
 * browser went away, so waiting longer would keep the server up for nothing.
 */
export const ABANDONED_MS = 45_000;

export function pendingCount({ failed, imported, total }: BatchCounts) {
  return total - imported - failed;
}

function uploadsOf(transfer: Transfer) {
  return Object.values(transfer.uploads);
}

/**
 * How long until a transfer counts as complete, or null while it can't be:
 * nothing has arrived yet, a file is on its way, or a received file is
 * still importing. Each new upload clears the wait, so the server never
 * stops between the files of one transfer.
 */
export function completionDelay(transfer: Transfer, batch: BatchCounts) {
  if (uploadsOf(transfer).length > 0) return null;
  if (transfer.received + transfer.lost === 0) return null;
  if (pendingCount(batch) > 0) return null;
  if (transfer.announced === null) return UNANNOUNCED_MS;
  return transfer.announced > 0 ? ABANDONED_MS : SETTLED_MS;
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

function songs(n: number) {
  return `${String(n)} ${n === 1 ? "Song" : "Songs"}`;
}

/** The batch in words: "Importing 3 of 12", then "12 Songs Imported". */
export function batchLine(batch: BatchCounts) {
  const { failed, imported, total } = batch;
  if (pendingCount(batch) > 0) {
    const importable = total - failed;
    return `Importing ${String(Math.min(imported + 1, importable))} of ${String(importable)}`;
  }
  return `${songs(imported)} Imported`;
}

/** A transfer in progress, for its sheet. */
export interface TransferView {
  readonly line: string;
  /** The file arriving, when there is one. */
  readonly name: string | null;
  /** The whole transfer, 0 to 1. */
  readonly fraction: number;
  readonly done: boolean;
}

/** The files of the whole transfer that are known so far, and how far along. */
function transferSpan(transfer: Transfer) {
  const uploads = uploadsOf(transfer);
  const finished = transfer.received + transfer.lost;
  const total = finished + uploads.length + (transfer.announced ?? 0);
  const arriving = uploads.reduce((sum, upload) => sum + upload.fraction, 0);
  return {
    finished,
    fraction: total === 0 ? 1 : (finished + arriving) / total,
    total,
  };
}

function receivingLine(finished: number, total: number) {
  return total > 1
    ? `Receiving ${String(Math.min(finished + 1, total))} of ${String(total)}`
    : "Receiving";
}

/** The transfer in words, or null before anything has arrived. */
export function transferView(transfer: Transfer, batch: BatchCounts) {
  const uploads = uploadsOf(transfer);
  const { finished, fraction, total } = transferSpan(transfer);
  if (uploads.length === 0 && finished === 0) return null;
  const name = uploads[0]?.name ?? null;
  if (uploads.length > 0 || (transfer.announced ?? 0) > 0) {
    return {
      done: false,
      fraction,
      line: receivingLine(finished, total),
      name,
    } satisfies TransferView;
  }
  return {
    done: pendingCount(batch) === 0,
    fraction,
    line: batchLine(batch),
    name,
  } satisfies TransferView;
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
