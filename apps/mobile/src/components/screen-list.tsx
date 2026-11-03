import type {
  LegendListProps,
  LegendListRef,
} from "@legendapp/list/react-native";
import type { ComponentType, ReactElement, Ref } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { createElement, isValidElement, useRef } from "react";
import { ScrollView } from "react-native";
import { LegendList } from "@legendapp/list/react-native";
import { useCSSVariable } from "uniwind";

import { isInsertionOnly } from "~/lib/list-order";

/** How far past the screen, in points, rows are drawn ahead of time. */
const DRAW_DISTANCE = 1000;

/** Within this of the top, in points, a list counts as at the top. */
const AT_TOP_SLOP = 12;

/**
 * With `holdThroughMoves`, how far a row can go and still count as staying: a
 * section's heading and a card arriving above it push it down by two.
 */
const MOVED_BY_MORE_THAN = 2;

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
 * When songs land while someone is scrolled down, what they're looking at
 * stays exactly where it is, and the new rows go in above it. At the very top
 * of a list the new rows push down, so they're seen arriving. A new sort or
 * search isn't an insertion (`isInsertionOnly`), so it doesn't hold.
 *
 * Rows are recycled: a row that scrolls off is reused for the next one
 * with new data, which keeps fast scrolling through thousands of songs
 * from building a new native row for each. Rows must therefore keep no
 * state of their own.
 */
export function ScreenList<Item>({
  ref,
  holdThroughMoves = false,
  ...props
}: LegendListProps<Item> & {
  ref?: Ref<LegendListRef>;
  /** Keep what's on screen in place when rows move too, not just when they're added. */
  holdThroughMoves?: boolean;
}) {
  const background = useCSSVariable("--color-background");
  const backgroundColor =
    typeof background === "string" ? background : undefined;
  const atTop = useRef(true);
  const topOffset = useRef<number | null>(null);
  const known = useRef(props.data ?? []);
  const insertion = useRef(false);
  const lastIndex = useRef(new Map<string, number>());
  function shouldHold(item: Item, index: number, data: readonly Item[]) {
    const { keyExtractor } = props;
    // Called for each row in view when the data changes; the first decides.
    if (data !== known.current) {
      insertion.current =
        keyExtractor !== undefined &&
        isInsertionOnly(known.current, data, keyExtractor);
      if (holdThroughMoves && keyExtractor !== undefined) {
        lastIndex.current = new Map(
          known.current.map((row, at) => [keyExtractor(row, at), at]),
        );
      }
      known.current = data;
    }
    if (atTop.current) return false;
    if (!holdThroughMoves || keyExtractor === undefined) {
      return insertion.current;
    }
    // Hold on to what stayed: holding on to something that moved takes the
    // list along with it.
    const last = lastIndex.current.get(keyExtractor(item, index));
    return last === undefined || Math.abs(last - index) <= MOVED_BY_MORE_THAN;
  }
  function onScrollBeginDrag(event: NativeSyntheticEvent<NativeScrollEvent>) {
    // The top is below zero under a native header, by an inset the event
    // doesn't report. Before the first drag the list is at rest at the top. An
    // earlier scroll event won't do: layout changes send them too.
    if (topOffset.current === null) {
      topOffset.current = event.nativeEvent.contentOffset.y;
    }
    props.onScrollBeginDrag?.(event);
  }
  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (topOffset.current !== null) {
      atTop.current =
        event.nativeEvent.contentOffset.y <= topOffset.current + AT_TOP_SLOP;
    }
    props.onScroll?.(event);
  }
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
      maintainVisibleContentPosition={{
        data: true,
        shouldRestorePosition: shouldHold,
        size: true,
      }}
      {...props}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      style={[{ backgroundColor, flex: 1 }, props.style]}
    />
  );
}
