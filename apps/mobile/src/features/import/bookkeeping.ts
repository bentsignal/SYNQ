import { takeLegacySettings } from "~/features/library/legacy-settings";
import { readJson, writeJson } from "~/lib/kv";

/**
 * Counters 2.5.2 kept in AsyncStorage: how many imports finished, whether
 * the App Store review was already requested, and the last export batch
 * number. A 2.5.2 install's values carry over (`takeLegacySettings`).
 */
export interface Bookkeeping {
  readonly importCount: number;
  readonly reviewRequested: boolean;
  readonly exportNumber: number;
}

const STORAGE_KEY = "synq.bookkeeping";

const ZERO: Bookkeeping = {
  exportNumber: 0,
  importCount: 0,
  reviewRequested: false,
};

function count(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function decode(stored: unknown) {
  if (typeof stored !== "object" || stored === null) return null;
  return {
    exportNumber: count(Reflect.get(stored, "exportNumber")),
    importCount: count(Reflect.get(stored, "importCount")),
    reviewRequested: Reflect.get(stored, "reviewRequested") === true,
  } satisfies Bookkeeping;
}

export function getBookkeeping() {
  const stored = readJson(STORAGE_KEY, decode);
  const legacy = takeLegacySettings("bookkeeping");
  if (legacy === null) return stored ?? ZERO;
  // A 2.5.2 install's counters, merged so nothing counts down.
  const base = stored ?? ZERO;
  const merged = {
    exportNumber: Math.max(base.exportNumber, count(legacy.exportNumber)),
    importCount: Math.max(base.importCount, count(legacy.importCount)),
    reviewRequested: base.reviewRequested || legacy.reviewRequested,
  } satisfies Bookkeeping;
  writeJson(STORAGE_KEY, merged);
  return merged;
}

export function updateBookkeeping(change: Partial<Bookkeeping>) {
  const next = { ...getBookkeeping(), ...change };
  writeJson(STORAGE_KEY, next);
  return next;
}
