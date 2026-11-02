import type { ColorValue, ProcessedColorValue, ViewProps } from "react-native";
import { requireNativeView, requireOptionalNativeModule } from "expo";

export interface MenuRowViewProps extends ViewProps {
  /** The menu as `menuJson` writes it. */
  menu: string;
  /** What VoiceOver reads for the row. */
  label: string;
  /** The trailing `ellipsis` button's width; 0 hides it. */
  buttonWidth: number;
  buttonColor: ProcessedColorValue | ColorValue | null | undefined;
  /** What a tap flashes behind the row; none when left out. */
  highlightColor?: ProcessedColorValue | ColorValue | null;
  /** The corners of the shape a long press lifts. */
  previewRadius: number;
  /** The symbol a swipe to the right reveals; none when left out, and no swipe. */
  swipeRightSymbol?: string;
  /** The same for a swipe to the left. */
  swipeLeftSymbol?: string;
  /** What a revealed symbol turns once letting go would do it. */
  swipeColor?: ProcessedColorValue | ColorValue | null;
  onRowPress: () => void;
  onRowSwipe: (event: { nativeEvent: { direction: "left" | "right" } }) => void;
  onRowSwipeReady: () => void;
  onRowMenuAction: (event: { nativeEvent: { id: string } }) => void;
}

/**
 * The UIKit menu row (modules/synq-menu), or null in a binary built before
 * it, which falls back to the SwiftUI row.
 */
export const MenuRowView =
  requireOptionalNativeModule("SynqMenu") === null
    ? null
    : requireNativeView<MenuRowViewProps>("SynqMenu");
