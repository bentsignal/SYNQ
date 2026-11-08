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
  /**
   * Cued (Play Next, Add to Queue, or dragged among them): part of the run
   * right after the current song that plays before the rest of the list.
   */
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

/** The song an entry's key belongs to. */
export function songIdOf(key: string) {
  return Number.parseInt(key, 10);
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

/**
 * The entries a skip would land on: after and before the current one, wrapping
 * around when the queue repeats.
 */
export function neighbors(queue: Queue, repeat: "off" | "all" | "one") {
  const index = currentIndex(queue);
  if (index === -1) return [];
  const { entries } = queue;
  const wraps = repeat === "all";
  const next = entries[index + 1] ?? (wraps ? entries[0] : undefined);
  const previous = entries[index - 1] ?? (wraps ? entries.at(-1) : undefined);
  return [next, previous].filter((entry) => entry !== undefined);
}

/** How many cued entries directly follow the current one. */
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

/**
 * `queue` with its current entry under `key`. Native keeps playing an entry
 * whose key it already has, so a new queue around the song playing doesn't
 * interrupt it.
 */
export function withCurrentKey(queue: Queue, key: string) {
  function rename(entryKey: string) {
    return entryKey === queue.currentKey ? key : entryKey;
  }
  return queueOf(
    queue.entries.map((entry) => ({ ...entry, key: rename(entry.key) })),
    key,
    queue.original?.map(rename) ?? null,
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
 * Adds songs to the cued run: "next" (Play Next) straight after the current
 * song, "last" (Add to Queue) behind everything already cued, both ahead of
 * the rest of the list. Cued songs stay out of `original`, so they stay with
 * the current song when shuffle goes off. An empty queue has no list to go
 * ahead of: the songs are the list, so shuffle can reorder them.
 */
export function cueSongs(
  queue: Queue,
  songIds: readonly number[],
  place: "next" | "last",
) {
  const added = newEntries(songIds, queue.entries.length > 0);
  const current = currentIndex(queue);
  const index =
    current === -1
      ? queue.entries.length
      : current +
        1 +
        (place === "next" ? 0 : queuedRunLength(queue.entries, current));
  const entries = [...queue.entries];
  entries.splice(index, 0, ...added);
  return {
    added,
    index,
    queue: queueOf(
      entries,
      queue.currentKey ?? added[0]?.key ?? null,
      queue.original,
    ),
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

/**
 * Moves the entry at `from` so it ends up at `to`. A drop right after the
 * current song or in the cued run, down to its end, cues the entry; a drop
 * below that returns it to the list. That keeps the run unbroken, so the
 * next Add to Queue lands behind everything cued.
 */
export function moveEntry(queue: Queue, from: number, to: number) {
  const entries = [...queue.entries];
  const [moved] = entries.splice(from, 1);
  if (moved === undefined) return queue;
  const current = entries.findIndex((entry) => entry.key === queue.currentKey);
  // Not found: the entry moving is the current one, which isn't in the run.
  const queued =
    current === -1
      ? moved.queued
      : to > current && to <= current + 1 + queuedRunLength(entries, current);
  entries.splice(to, 0, queued === moved.queued ? moved : { ...moved, queued });
  return { ...queue, entries };
}

/**
 * The move that puts `key` at `upNextIndex` of Up Next (the entries after the
 * current one), as queue indices, or null when there's nothing to do: the
 * entry is gone or playing (a song can end mid-drag), or it's already there.
 * Taking a key rather than an index keeps a drag right if the song changed
 * while it was in the air.
 */
export function upNextMove(queue: Queue, key: string, upNextIndex: number) {
  const current = currentIndex(queue);
  const from = queue.entries.findIndex((entry) => entry.key === key);
  // Native can't take a bad index: it would bring the app down, not fail.
  if (from === -1 || from <= current || !Number.isInteger(upNextIndex)) {
    return null;
  }
  const last = queue.entries.length - 1;
  const to = Math.min(Math.max(current + 1 + upNextIndex, current + 1), last);
  return from === to ? null : { from, to };
}

/**
 * Cues the Up Next entry `key` (a swipe right in the queue): "next" moves it
 * straight after the current song, "last" behind the rest of the cued run,
 * as Play Next and Add to Queue would put a new copy. `from` and `to` are
 * the move for native (equal when only the entry's cueing changed), or the
 * result is null when there's nothing to do.
 */
export function cueEntry(queue: Queue, key: string, place: "next" | "last") {
  const current = currentIndex(queue);
  const from = queue.entries.findIndex((entry) => entry.key === key);
  if (current === -1 || from <= current) return null;
  const rest = queue.entries.filter((_, index) => index !== from);
  const to =
    current + 1 + (place === "next" ? 0 : queuedRunLength(rest, current));
  if (from === to && queue.entries[from]?.queued === true) return null;
  return { from, queue: moveEntry(queue, from, to), to };
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
 * Turns shuffle on: the current song stays first with its cued run behind
 * it, and everything else follows in random order as part of the list.
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
    entries: [
      ...run,
      ...shuffled(rest, random).map((entry) =>
        entry.queued ? { ...entry, queued: false } : entry,
      ),
    ],
    original: queue.entries
      .filter((entry) => entry === run[0] || !inRun.has(entry.key))
      .map((entry) => entry.key),
  };
}

/**
 * Turns shuffle off: back to the unshuffled order, with the current song
 * (and its cued run) where it was in that order, so what played before it
 * is behind it again and the rest follows.
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
  // Songs cued while shuffled aren't in the original order. Those already
  // played stay behind the current song, so they don't play again; any still
  // to come (dragged out of the run) stay right after the run.
  function isLeftover(entry: QueueEntry) {
    return !inRun.has(entry.key) && !inOriginal.has(entry.key);
  }
  const played = queue.entries.slice(0, index).filter(isLeftover);
  const toCome = queue.entries.slice(index + 1).filter(isLeftover);
  let insertAt = 0;
  const currentKey = queue.currentKey;
  if (currentKey !== null && inOriginal.has(currentKey)) {
    const position = queue.original.indexOf(currentKey);
    insertAt = queue.original
      .slice(0, position)
      .filter((key) => byKey.has(key) && !inRun.has(key)).length;
  } else {
    // The current song was cued: it goes after the nearest song before it
    // that is in the original order.
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
      ...played,
      ...run,
      ...toCome,
      ...base.slice(insertAt),
    ],
    original: null,
  };
}
