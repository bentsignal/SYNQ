/**
 * The playback queue as JavaScript keeps it: pure functions, no React or
 * native code, so node tests cover them. Native (`@synq/audio`) holds the
 * same entries in the same order; each entry's key is its native track id,
 * so "which entry is playing" never depends on indices lining up.
 */

export interface QueueEntry {
  /** Unique within the queue; the native track id. */
  readonly key: string;
  readonly songId: number;
  /** Added with Play Next: part of the run that stacks after the current song. */
  readonly queued: boolean;
}

export interface Queue {
  readonly entries: readonly QueueEntry[];
  /** The key of the current entry, or null when the queue is empty. */
  readonly currentKey: string | null;
  /**
   * While shuffle is on: the keys in their unshuffled order, so turning
   * shuffle off puts them back. Null while shuffle is off.
   */
  readonly original: readonly string[] | null;
}

export const EMPTY_QUEUE = {
  currentKey: null,
  entries: [],
  original: null,
} satisfies Queue;

let lastKey = 0;

/** A key no other entry in this run of the app has. */
export function nextKey(songId: number) {
  lastKey += 1;
  return `${songId}.${lastKey.toString(36)}`;
}

export function newEntries(songIds: readonly number[], queued = false) {
  return songIds.map(
    (songId): QueueEntry => ({ key: nextKey(songId), queued, songId }),
  );
}

/** Fisher–Yates; `random` returns [0, 1) like `Math.random`. */
export function shuffled<T>(items: readonly T[], random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = result[i];
    const other = result[j];
    if (swap === undefined || other === undefined) continue;
    result[i] = other;
    result[j] = swap;
  }
  return result;
}

export function currentIndex(queue: Queue) {
  if (queue.currentKey === null) return -1;
  return queue.entries.findIndex((entry) => entry.key === queue.currentKey);
}

/** How many Play Next entries directly follow the current one. */
function queuedRunLength(entries: readonly QueueEntry[], index: number) {
  let length = 0;
  while (entries[index + 1 + length]?.queued === true) length += 1;
  return length;
}

/**
 * A new queue of `songIds` in the order shown, starting at `startIndex`.
 * With `shuffle`, the start song comes first (or a random one when
 * `startIndex` is null) and the rest follow in random order.
 */
export function buildQueue(
  songIds: readonly number[],
  {
    startIndex,
    shuffle,
    random = Math.random,
  }: { startIndex: number | null; shuffle: boolean; random?: () => number },
) {
  const entries = newEntries(songIds);
  const start = entries[clampIndex(startIndex ?? 0, entries.length)];
  if (!shuffle) {
    return queueOf(entries, start?.key ?? null, null);
  }
  const rest = shuffled(entries, random).filter(
    (entry) => startIndex === null || entry !== start,
  );
  const order =
    startIndex === null || start === undefined ? rest : [start, ...rest];
  return queueOf(
    order,
    order[0]?.key ?? null,
    entries.map((entry) => entry.key),
  );
}

function clampIndex(index: number, length: number) {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0));
}

function queueOf(
  entries: readonly QueueEntry[],
  currentKey: string | null,
  original: readonly string[] | null,
) {
  return { currentKey, entries, original };
}

/**
 * Where Play Next inserts: after the current entry and the Play Next
 * entries already stacked behind it, so several play in the order they
 * were added (2.5.2's `addOffset`).
 */
export function playNextIndex(queue: Queue) {
  const index = currentIndex(queue);
  if (index === -1) return queue.entries.length;
  return index + 1 + queuedRunLength(queue.entries, index);
}

export function insertEntries(
  queue: Queue,
  added: readonly QueueEntry[],
  index: number,
) {
  const entries = [...queue.entries];
  entries.splice(index, 0, ...added);
  // Songs added to the end belong to the list; Play Next ones float with
  // the current song when shuffle goes off.
  const original =
    queue.original === null
      ? null
      : added.every((entry) => !entry.queued)
        ? [...queue.original, ...added.map((entry) => entry.key)]
        : queue.original;
  return {
    currentKey: queue.currentKey ?? added[0]?.key ?? null,
    entries,
    original,
  };
}

/**
 * Removes entries by index. When the current one goes, the entry that
 * takes its place becomes current (the native engine does the same).
 */
export function removeEntries(
  queue: Queue,
  indices: readonly number[],
  repeatAll: boolean,
) {
  const removing = new Set(indices);
  const entries = queue.entries.filter((_, index) => !removing.has(index));
  if (entries.length === 0) return EMPTY_QUEUE;
  let currentKey = queue.currentKey;
  const index = currentIndex(queue);
  if (index !== -1 && removing.has(index)) {
    const shifted = index - [...removing].filter((i) => i < index).length;
    currentKey =
      (entries[shifted] ?? (repeatAll ? entries[0] : entries.at(-1)))?.key ??
      null;
  }
  const kept = new Set(entries.map((entry) => entry.key));
  return {
    currentKey,
    entries,
    original: queue.original?.filter((key) => kept.has(key)) ?? null,
  };
}

/** Moves the entry at `from` so it ends up at `to`. */
export function moveEntry(queue: Queue, from: number, to: number) {
  const entries = [...queue.entries];
  const [moved] = entries.splice(from, 1);
  if (moved === undefined) return queue;
  entries.splice(to, 0, moved);
  return { ...queue, entries };
}

/** Drops every entry of these songs (they were deleted from the library). */
export function forgetSongIds(
  queue: Queue,
  songIds: ReadonlySet<number>,
  repeatAll: boolean,
) {
  const indices = queue.entries.flatMap((entry, index) =>
    songIds.has(entry.songId) ? [index] : [],
  );
  return { indices, queue: removeEntries(queue, indices, repeatAll) };
}

/**
 * Turns shuffle on: the current song stays first with its Play Next run
 * behind it, and everything else follows in random order.
 */
export function shuffleQueue(queue: Queue, random = Math.random) {
  const index = currentIndex(queue);
  if (index === -1) return queue;
  const run = queue.entries.slice(
    index,
    index + 1 + queuedRunLength(queue.entries, index),
  );
  const inRun = new Set(run.map((entry) => entry.key));
  const rest = queue.entries.filter((entry) => !inRun.has(entry.key));
  return {
    currentKey: queue.currentKey,
    entries: [...run, ...shuffled(rest, random)],
    original: queue.entries
      .filter((entry) => entry === run[0] || !inRun.has(entry.key))
      .map((entry) => entry.key),
  };
}

/**
 * Turns shuffle off: back to the unshuffled order, with the current song
 * (and its Play Next run) where it was in that order, so what played before
 * it is behind it again and the rest follows.
 */
export function unshuffleQueue(queue: Queue) {
  const index = currentIndex(queue);
  if (queue.original === null || index === -1) {
    return { ...queue, original: null };
  }
  const byKey = new Map(queue.entries.map((entry) => [entry.key, entry]));
  const run = queue.entries.slice(
    index,
    index + 1 + queuedRunLength(queue.entries, index),
  );
  const inRun = new Set(run.map((entry) => entry.key));
  const inOriginal = new Set(queue.original);
  const base = queue.original.flatMap((key) => {
    const entry = byKey.get(key);
    return entry === undefined || inRun.has(key) ? [] : [entry];
  });
  // Entries added while shuffled that aren't in the original order (Play
  // Next songs that drifted from the run) stay right after it.
  const leftovers = queue.entries.filter(
    (entry) => !inRun.has(entry.key) && !inOriginal.has(entry.key),
  );
  let insertAt = 0;
  const currentKey = queue.currentKey;
  if (currentKey !== null && inOriginal.has(currentKey)) {
    const position = queue.original.indexOf(currentKey);
    insertAt = queue.original
      .slice(0, position)
      .filter((key) => byKey.has(key) && !inRun.has(key)).length;
  } else {
    // The current song was added with Play Next: it goes after the nearest
    // song before it that is in the original order.
    const basePosition = new Map(base.map((entry, i) => [entry.key, i]));
    for (let i = index - 1; i >= 0; i -= 1) {
      const found = basePosition.get(queue.entries[i]?.key ?? "");
      if (found !== undefined) {
        insertAt = found + 1;
        break;
      }
    }
  }
  return {
    currentKey,
    entries: [
      ...base.slice(0, insertAt),
      ...run,
      ...leftovers,
      ...base.slice(insertAt),
    ],
    original: null,
  };
}
