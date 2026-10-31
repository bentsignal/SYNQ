// Mocks for native modules the measured components render with.
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access -- Jest's mock factories require() what they use, untyped. */
require("react-native-gesture-handler/jestSetup");

// Uniwind has no stylesheet here, so it warns about every themed color on
// every render; that's noise, and printing it slows the measurements.
const warn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("Uniwind")) return;
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
  return { Image: Object.assign(View, { prefetch: () => Promise.resolve() }) };
});

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
