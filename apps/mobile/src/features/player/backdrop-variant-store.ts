import { useSyncExternalStore } from "react";

import { readJson, writeJson } from "~/lib/kv";
import { VARIANTS } from "./backdrop-variants";

/** The experiment's choice, on this device only. Release builds never read it. */
const STORAGE_KEY = "synq.dev.backdrop-variant";

const [fallback] = VARIANTS;
const initial = __DEV__
  ? readJson(
      STORAGE_KEY,
      (stored) =>
        VARIANTS.find((variant) => variant.id === stored) ??
        VARIANTS.find((variant) => variant.id === "glow") ??
        fallback,
    )
  : fallback;

let chosen = initial;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBackdropVariant() {
  return useSyncExternalStore(subscribe, () => chosen);
}

export function cycleBackdropVariant() {
  const index = VARIANTS.findIndex((variant) => variant.id === chosen.id);
  chosen = VARIANTS[(index + 1) % VARIANTS.length] ?? fallback;
  writeJson(STORAGE_KEY, chosen.id);
  for (const listener of listeners) listener();
}
