import type {
  LegendListProps,
  LegendListRef,
} from "@legendapp/list/react-native";
import type { Ref } from "react";
import { LegendList } from "@legendapp/list/react-native";
import { useCSSVariable } from "uniwind";

/** How far past the screen, in points, rows are drawn ahead of time. */
const DRAW_DISTANCE = 1000;

/**
 * A full-screen Legend List under a native header (Vera's `ScreenList`),
 * so large titles collapse as it scrolls and the tab bar's inset applies.
 * Library reads are synchronous, so there's no loading state: the rows are
 * there on the first frame.
 *
 * Rows are recycled: a row that scrolls off is reused for the next one
 * with new data, which keeps fast scrolling through thousands of songs
 * from building a new native row for each. Rows must therefore keep no
 * state of their own.
 */
export function ScreenList<Item>({
  ref,
  ...props
}: LegendListProps<Item> & { ref?: Ref<LegendListRef> }) {
  const background = useCSSVariable("--color-background");
  return (
    <LegendList
      ref={ref}
      contentInsetAdjustmentBehavior="automatic"
      // A short list still gives under the finger, as a table view does.
      alwaysBounceVertical
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      estimatedItemSize={64}
      drawDistance={DRAW_DISTANCE}
      recycleItems
      {...props}
      style={[
        {
          backgroundColor:
            typeof background === "string" ? background : undefined,
          flex: 1,
        },
        props.style,
      ]}
    />
  );
}
