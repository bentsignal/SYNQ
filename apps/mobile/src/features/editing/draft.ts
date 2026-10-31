import { useSyncExternalStore } from "react";

/**
 * An edit sheet's unsaved changes, shared by the screens of its stack (the
 * form and the lists it pushes, such as Edit Songs) and saved by its Done.
 * Each sheet kind has one; the form starts it when it opens.
 */
export function createDraft<Value extends object>(name: string) {
  let value: Value | undefined;
  const listeners = new Set<() => void>();
  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  function current() {
    if (value === undefined) throw new Error(`The ${name} draft isn't open.`);
    return value;
  }
  return {
    /** Starts the draft from the saved values; returns them. */
    begin(initial: Value) {
      value = initial;
      for (const listener of listeners) listener();
      return initial;
    },
    get: current,
    update(change: (draft: Value) => Partial<Value>) {
      value = { ...current(), ...change(current()) };
      for (const listener of listeners) listener();
    },
    /** The draft, re-rendering when it changes. */
    useValue() {
      return useSyncExternalStore(subscribe, current);
    },
  };
}
