/**
 * A cached snapshot fed by native events, for `useSyncExternalStore`. The
 * native listener is attached while at least one component is subscribed.
 */
export interface SnapshotSource<T> {
  /** Starts listening; returns a function that stops. */
  listen(set: (value: T) => void): () => void;
  /** Reads the current value once, when listening starts. */
  read(): Promise<T>;
}

export interface SnapshotStore<T> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
}

export function createSnapshotStore<T>(source: SnapshotSource<T>, initial: T) {
  let value = initial;
  let version = 0;
  let stop: (() => void) | undefined;
  const subscribers = new Set<() => void>();

  function set(next: T) {
    value = next;
    version += 1;
    for (const subscriber of subscribers) subscriber();
  }

  function start() {
    stop = source.listen(set);
    const startedAt = version;
    source.read().then(
      (current) => {
        // An event that arrived meanwhile is newer than this read.
        if (stop && version === startedAt) set(current);
      },
      () => {
        // Best effort: events still update the snapshot.
      },
    );
  }

  return {
    subscribe: (onChange: () => void) => {
      subscribers.add(onChange);
      if (!stop) start();
      return () => {
        subscribers.delete(onChange);
        if (subscribers.size === 0 && stop) {
          stop();
          stop = undefined;
        }
      };
    },
    getSnapshot: () => value,
  } satisfies SnapshotStore<T>;
}
