/**
 * Which entry each of Up Next's pooled rows shows, outside React. A row reads
 * only its own slot, so a change to the queue renders again only the rows
 * whose entry changed, not every row.
 *
 * That matters beyond the time it saves: the UI thread moves the rows
 * straight on screen, and a React render of a row just after it did can put
 * the row back where it was for a frame or more (a skip's flicker, a dropped
 * row that went missing).
 */
export function createQueueSlots(initial: readonly (string | null)[]) {
  let slots = initial;
  const listeners = new Set<() => void>();
  return {
    get: (slot: number) => slots[slot] ?? null,
    set: (next: readonly (string | null)[]) => {
      if (next === slots) return;
      slots = next;
      for (const listener of listeners) listener();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type QueueSlots = ReturnType<typeof createQueueSlots>;
