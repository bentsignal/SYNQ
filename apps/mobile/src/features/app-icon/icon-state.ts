/**
 * The home screen icon as JavaScript knows it: native is asked once, and
 * every switch after that is tracked here.
 *
 * Asking native again can freeze the app. iOS answers `alternateIconName`
 * on the same queue that runs `setAlternateIconName`, and a switch holds
 * that queue until the person dismisses iOS's "You have changed the icon"
 * alert. Reading the icon synchronously in that window blocked the
 * JavaScript thread, and with it the 2.5.2 import, until they tapped OK
 * (the premium check resets the icon at launch). Pure, so node tests
 * cover it.
 */
export interface IconNative {
  getAppIconName: () => string | null;
  setAlternateAppIcon: (name: string | null) => Promise<string | null>;
}

export function createIconState(native: IconNative | null) {
  /** Undefined until native is first asked. */
  let current: string | null | undefined;
  /** Switches still waiting for iOS. */
  let switching = 0;
  const listeners = new Set<() => void>();

  function read() {
    return native?.getAppIconName() ?? null;
  }

  function get() {
    if (current === undefined) current = read();
    return current;
  }

  function publish(next: string | null) {
    if (next === current) return;
    current = next;
    for (const listener of listeners) listener();
  }

  return {
    /** The alternate icon in use (or being switched to), or null for the primary. */
    get,
    /**
     * Switches the icon; it reads as switched at once. If iOS reports an
     * error, native is asked again once no other switch is waiting (so the
     * read can't block): iOS can report one and still switch, as when its
     * alert is dismissed by something other than OK.
     */
    set(name: string) {
      if (native === null) return Promise.resolve(null);
      get();
      publish(name);
      switching += 1;
      return native
        .setAlternateAppIcon(name)
        .catch((error: unknown) => {
          if (switching === 1) publish(read());
          throw error;
        })
        .finally(() => {
          switching -= 1;
        });
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
