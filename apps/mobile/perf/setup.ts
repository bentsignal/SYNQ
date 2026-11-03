// Mocks for native modules the measured components render with.
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access -- Jest's mock factories require() what they use, untyped. */
require("react-native-gesture-handler/jestSetup");

// Uniwind has no stylesheet here, so it warns about every themed color on
// every render; that's noise, and printing it slows the measurements. So is
// expo-constants noting that its native module isn't linked.
const warn = console.warn;
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].startsWith("Uniwind") ||
      args[0].startsWith("No native ExponentConstants module"))
  )
    return;
  warn(...args);
};

jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);

// Native views, drawn as plain views: what's measured is React's work.
jest.mock("expo-symbols", () => {
  const { View } = require("react-native");
  return { SymbolView: View };
});
jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    Image: Object.assign(View, {
      configureCache: () => undefined,
      prefetch: () => Promise.resolve(),
    }),
  };
});

// The mini player is the tab bar's bottom accessory; outside the tab bar,
// the placement is the regular (expanded) one.
jest.mock("expo-router/unstable-native-tabs", () => ({
  NativeTabs: { BottomAccessory: { usePlacement: () => "regular" } },
}));
jest.mock("expo-router", () => ({
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  useRouter: () => ({ push: jest.fn() }),
}));

// SwiftUI views (rows, menus, forms), drawn as plain views.
jest.mock("@expo/ui/swift-ui", () => {
  const { View } = require("react-native");
  const { createElement } = require("react");
  function Passthrough({ children }: { children?: unknown }) {
    return createElement(View, null, children);
  }
  const ContextMenu = Object.assign(Passthrough, {
    Items: Passthrough,
    Preview: Passthrough,
    Trigger: Passthrough,
  });
  return {
    Button: Passthrough,
    ContextMenu,
    HStack: Passthrough,
    Image: View,
    List: Object.assign(Passthrough, { ForEach: Passthrough }),
    Menu: Passthrough,
    RNHostView: Passthrough,
    Section: Passthrough,
  };
});
jest.mock("@expo/ui/swift-ui/modifiers", () => {
  function modifier() {
    return {};
  }
  return new Proxy(
    {},
    {
      get: (_target, name) =>
        name === "shapes" ? new Proxy({}, { get: () => modifier }) : modifier,
    },
  );
});
jest.mock("@expo/ui", () => {
  const { View } = require("react-native");
  return { Host: View };
});
// The UIKit menu row (modules/synq-menu), drawn as a plain view with its
// React Native children, so song lists measure the rows the app draws.
jest.mock("~/components/native-menu-row", () => {
  const { View } = require("react-native");
  return { MenuRowView: View };
});

// Native modules the app reaches at import time. Without a device there is
// nothing to load, and `pnpm perf` fails while loading the test files.

// jest-expo's `requireNativeModule` finds modules on `globalThis.expo.modules`
// and throws for any that isn't there. SynqAudio (packages/audio) becomes an
// idle player that accepts every command and reports nothing.
Object.assign(Reflect.get(globalThis, "expo").modules, {
  SynqAudio: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    getQueue: () => Promise.resolve({ index: null, tracks: [] }),
    getState: () =>
      Promise.resolve({
        durationMs: 0,
        index: null,
        positionMs: 0,
        queueLength: 0,
        repeatMode: "off",
        status: "idle",
        trackId: null,
      }),
    next: jest.fn(() => Promise.resolve(false)),
    pause: jest.fn(() => Promise.resolve()),
    play: jest.fn(() => Promise.resolve()),
    previous: jest.fn(() => Promise.resolve(false)),
    seekTo: jest.fn(() => Promise.resolve(false)),
    setQueue: jest.fn(() => Promise.resolve()),
    setRepeatMode: jest.fn(() => Promise.resolve()),
    skipTo: jest.fn(() => Promise.resolve(false)),
    toggle: jest.fn(() => Promise.resolve()),
  },
});

// The preferences store (src/lib/kv.ts) is a SQLite file; an in-memory
// map answers the same synchronous calls.
jest.mock("expo-sqlite/kv-store", () => ({
  SQLiteStorage: class {
    items = new Map<string, string>();
    getItemSync(key: string) {
      return this.items.get(key) ?? null;
    }
    setItemSync(key: string, value: string) {
      this.items.set(key, value);
    }
  },
}));

// The AirPlay route picker is a native view (SynqAudio's view manager),
// which jest-expo has no stand-in for; draw it as a plain view.
jest.mock("../../../packages/audio/src/route-picker.tsx", () => {
  const { View } = require("react-native");
  return { RoutePickerButton: View };
});

// The library database and the files under Documents/ are native. Screens
// read the library through the query cache, which a scenario seeds, so
// opening the database is a mistake worth failing on.
jest.mock("~/features/library/database", () => ({
  libraryDb: () => {
    throw new Error("Seed the query cache instead.");
  },
}));
jest.mock("@synq/db/expo", () => ({ documentFile: jest.fn() }));
jest.mock("expo-file-system", () => {
  class Entry {}
  return {
    Directory: Entry,
    File: Entry,
    Paths: { cache: "", document: "" },
  };
});
jest.mock("expo-image-manipulator", () => ({}));
jest.mock("expo-document-picker", () => ({}));
jest.mock("expo-sharing", () => ({}));
jest.mock("expo-store-review", () => ({}));

// Saving and restoring the player's session reads and writes the library
// database and the preferences file; the scenarios start from an empty
// player.
jest.mock("~/features/player/persistence", () => ({
  noteNativeState: jest.fn(),
  persist: jest.fn(),
  restoreSession: jest.fn(),
  saveFromNative: jest.fn(),
}));

// The player saves its session on an interval for as long as the app runs;
// in Jest that would keep the process from exiting once the tests finish.
const setIntervalNow = globalThis.setInterval;
Reflect.set(
  globalThis,
  "setInterval",
  (...args: Parameters<typeof setInterval>) => {
    const timer = setIntervalNow(...args);
    if (typeof timer === "object") timer.unref();
    return timer;
  },
);
