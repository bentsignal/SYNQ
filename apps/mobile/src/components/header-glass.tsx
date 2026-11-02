import type { ViewProps } from "react-native";
import { StyleSheet } from "react-native";
import { requireNativeView, requireOptionalNativeModule } from "expo";

/** `modules/synq-header-glass`, or null in a binary built before it. */
const NativeHeaderGlass =
  requireOptionalNativeModule("SynqHeaderGlass") === null
    ? null
    : requireNativeView<ViewProps & { glass: boolean }>("SynqHeaderGlass");

/**
 * A root tab's glass header, which fades in once the page has scrolled and out
 * back at the top (`HeaderGlassView.swift`). Goes after the page, as its
 * sibling, under `RootTabTitle`. It takes no touches. With `glass={false}` it
 * draws nothing and only takes away iOS's own band under the bar, for a page
 * that doesn't scroll under it.
 */
export function HeaderGlass({ glass = true }: { glass?: boolean }) {
  if (NativeHeaderGlass === null) return null;
  return (
    <NativeHeaderGlass
      glass={glass}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    />
  );
}
