import { useSyncExternalStore } from "react";

const SHOWN_MS = 4000;

function lineOf(value: string | null) {
  return value;
}

let line = lineOf(null);
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function publish(next: string | null) {
  line = next;
  for (const listener of listeners) listener();
}

/** Says a song joined the queue, with a way to go and look. */
export function showQueueToast(text: string) {
  if (timer !== undefined) clearTimeout(timer);
  publish(text);
  timer = setTimeout(() => publish(null), SHOWN_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hideQueueToast() {
  if (timer !== undefined) clearTimeout(timer);
  publish(null);
}

export function useQueueToast() {
  return useSyncExternalStore(subscribe, () => line);
}
