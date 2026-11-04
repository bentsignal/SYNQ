import type { ViewProps } from "react-native";
import { StyleSheet } from "react-native";
import { requireNativeView, requireOptionalNativeModule } from "expo";

/** `modules/synq-header-glass`, or null in a binary built before it. */
const NativeHeaderGlass =
  requireOptionalNativeModule("SynqHeaderGlass") === null
    ? null
    : requireNativeView<ViewProps>("SynqHeaderGlass");

/**
 * A glass header, which fades in once the page has scrolled and out back at the
 * top (`HeaderGlassView.swift`), for a page whose bar would otherwise have nothing
 * behind it: the root tabs, and playlist, album, and artist pages. Goes after the
 * page, as its sibling. It takes no touches.
 */
export function HeaderGlass() {
  if (NativeHeaderGlass === null) return null;
  return (
    <NativeHeaderGlass pointerEvents="none" style={StyleSheet.absoluteFill} />
  );
}
