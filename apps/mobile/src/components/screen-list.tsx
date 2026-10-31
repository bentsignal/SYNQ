import type {
  LegendListProps,
  LegendListRef,
} from "@legendapp/list/react-native";
import type { ComponentType, ReactElement, Ref } from "react";
import { createElement, isValidElement } from "react";
import { ScrollView } from "react-native";
import { LegendList } from "@legendapp/list/react-native";
import { useCSSVariable } from "uniwind";

/** How far past the screen, in points, rows are drawn ahead of time. */
const DRAW_DISTANCE = 1000;

/** A list slot (header, empty state) as Legend List takes it: an element or a component. */
function Slot({
  slot,
}: {
  slot: ComponentType | ReactElement | null | undefined;
}) {
  if (slot === null || slot === undefined) return null;
  return isValidElement(slot) ? slot : createElement(slot);
}

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
  const backgroundColor =
    typeof background === "string" ? background : undefined;
  // With no rows, Legend List cut its header short (an empty playlist lost
  // its summary line and empty state), so a plain scroll view shows both.
  if ((props.data ?? []).length === 0) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        alwaysBounceVertical
        keyboardDismissMode="on-drag"
        style={[{ backgroundColor, flex: 1 }, props.style]}
        onScroll={props.onScroll}
        scrollEventThrottle={props.scrollEventThrottle}
      >
        <Slot slot={props.ListHeaderComponent} />
        <Slot slot={props.ListEmptyComponent} />
        <Slot slot={props.ListFooterComponent} />
      </ScrollView>
    );
  }
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
      style={[{ backgroundColor, flex: 1 }, props.style]}
    />
  );
}
