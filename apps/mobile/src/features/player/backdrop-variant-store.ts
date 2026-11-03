import { useSyncExternalStore } from "react";

import { readJson, writeJson } from "~/lib/kv";
import { CURRENT_VARIANT, VARIANTS } from "./backdrop-variants";

/** The experiment's choice, on this device only. Release builds never read it. */
const STORAGE_KEY = "synq.dev.backdrop-variant";

const [first] = VARIANTS;

/** The choices in dev builds; release builds stay on what they have. */
function initial() {
  if (!__DEV__) return CURRENT_VARIANT;
  return readJson(
    STORAGE_KEY,
    (stored) => VARIANTS.find((variant) => variant.id === stored) ?? first,
  );
}

let chosen = initial();
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
  chosen = VARIANTS[(index + 1) % VARIANTS.length] ?? first;
  writeJson(STORAGE_KEY, chosen.id);
  for (const listener of listeners) listener();
}
