/**
 * A cached snapshot fed by native events, for `useSyncExternalStore`. The
 * native listener is attached while at least one component is subscribed,
 * and, with a gate, only while the gate is open.
 */
export interface SnapshotSource<T> {
  /** Starts listening; returns a function that stops. */
  listen(set: (value: T) => void): () => void;
  /** Reads the current value once, when listening starts. */
  read(): Promise<T>;
}

/**
 * When the snapshot is wanted at all, such as while the app is in the
 * foreground: closed, the store stops listening even with subscribers, and
 * when it opens it listens again and reads the current value.
 */
export interface SnapshotGate {
  isOpen(): boolean;
  /** Calls `onChange` when it may have opened or closed; returns a function that stops. */
  watch(onChange: () => void): () => void;
}

export interface SnapshotStore<T> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
}

export function createSnapshotStore<T>(
  source: SnapshotSource<T>,
  initial: T,
  gate?: SnapshotGate,
) {
  let value = initial;
  let version = 0;
  let stop: (() => void) | undefined;
  let unwatch: (() => void) | undefined;
  const subscribers = new Set<() => void>();

  function set(next: T) {
    value = next;
    version += 1;
    for (const subscriber of subscribers) subscriber();
  }

  function start() {
    if (stop || (gate && !gate.isOpen())) return;
    const listening = source.listen(set);
    stop = listening;
    const startedAt = version;
    source.read().then(
      (current) => {
        // An event that arrived meanwhile is newer than this read, and a
        // read from before a stop is older than the one after it.
        if (stop === listening && version === startedAt) set(current);
      },
      () => {
        // Best effort: events still update the snapshot.
      },
    );
  }

  function halt() {
    if (!stop) return;
    stop();
    stop = undefined;
  }

  function gateChanged() {
    if (gate?.isOpen()) start();
    else halt();
  }

  return {
    subscribe: (onChange: () => void) => {
      subscribers.add(onChange);
      if (gate && !unwatch) unwatch = gate.watch(gateChanged);
      start();
      return () => {
        subscribers.delete(onChange);
        if (subscribers.size > 0) return;
        halt();
        unwatch?.();
        unwatch = undefined;
      };
    },
    getSnapshot: () => value,
  } satisfies SnapshotStore<T>;
}
