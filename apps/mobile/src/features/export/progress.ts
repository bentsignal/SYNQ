import { useSyncExternalStore } from "react";

/** A running export, as the banner shows it. */
export interface ExportStatus {
  name: string;
  /** Songs written so far. */
  completed: number;
  total: number;
  /** Overall, 0 to 1. */
  fraction: number;
}

/** A quick export finishes without a banner ever appearing. */
const SHOW_AFTER_MS = 500;

let shown: ExportStatus | undefined;
let running = false;
let cancelled = false;
const listeners = new Set<() => void>();

function publish(next: ExportStatus | undefined) {
  shown = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The running export once it has taken long enough to show. */
export function useExportStatus() {
  return useSyncExternalStore(subscribe, () => shown);
}

/** Stops the running export at its next song, or before it shares. */
export function cancelExport() {
  cancelled = true;
  publish(undefined);
}

/**
 * Starts an export's progress. One runs at a time: the share sheet can only
 * show one, and they share a folder. Returns null while another is running.
 */
export function beginExport(name: string, total: number) {
  if (running) return null;
  running = true;
  cancelled = false;
  let status = {
    completed: 0,
    fraction: 0,
    name,
    total,
  } satisfies ExportStatus;
  let finished = false;
  const timer = setTimeout(() => {
    if (!cancelled) publish(status);
  }, SHOW_AFTER_MS);
  return {
    cancelled: () => cancelled,
    /** The banner is gone and another export may start; safe to call twice. */
    end() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      running = false;
      publish(undefined);
    },
    update(completed: number, fraction: number) {
      status = { ...status, completed, fraction };
      if (shown !== undefined) publish(status);
    },
  };
}
