import type { ReactNode } from "react";
import { ScrollView } from "react-native";

/**
 * A tab screen's scrolling body under the transparent native header, so
 * the large title collapses as it scrolls and the tab bar's inset applies.
 */
export function ScreenScroll({
  children,
  onLayout,
}: {
  children?: ReactNode;
  onLayout?: () => void;
}) {
  return (
    <ScrollView
      className="bg-background flex-1"
      contentInsetAdjustmentBehavior="automatic"
      onLayout={onLayout}
    >
      {children}
    </ScrollView>
  );
}
