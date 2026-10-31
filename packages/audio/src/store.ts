/**
 * A cached snapshot fed by native events, for `useSyncExternalStore`. The
 * native listener is attached while at least one component is subscribed.
 */
export type SnapshotSource<T> = {
  /** Starts listening; returns a function that stops. */
  listen(set: (value: T) => void): () => void;
  /** Reads the current value once, when listening starts. */
  read(): Promise<T>;
};

export type SnapshotStore<T> = {
  subscribe(onChange: () => void): () => void;
  getSnapshot(): T;
};

export function createSnapshotStore<T>(source: SnapshotSource<T>, initial: T): SnapshotStore<T> {
  let value = initial;
  let version = 0;
  let stop: (() => void) | null = null;
  const subscribers = new Set<() => void>();

  const set = (next: T) => {
    value = next;
    version += 1;
    for (const subscriber of subscribers) subscriber();
  };

  const start = () => {
    stop = source.listen(set);
    const startedAt = version;
    source.read().then(
      (current) => {
        // An event that arrived meanwhile is newer than this read.
        if (stop && version === startedAt) set(current);
      },
      () => {},
    );
  };

  return {
    subscribe(onChange) {
      subscribers.add(onChange);
      if (!stop) start();
      return () => {
        subscribers.delete(onChange);
        if (subscribers.size === 0 && stop) {
          stop();
          stop = null;
        }
      };
    },
    getSnapshot: () => value,
  };
}
