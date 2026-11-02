import { StyleSheet, View } from "react-native";

/**
 * A row's hairline, as a filled view rather than a view that is only a
 * bottom border. React Native draws a one-sided border from a stretchable
 * image only if the border fits the view, and here they're the same size:
 * a rounding difference in the last float digit made one row (track 1 on
 * album pages) fall the wrong way and draw nothing.
 */
export function RowSeparator({ inset }: { inset: number }) {
  return (
    <View
      pointerEvents="none"
      className="bg-separator absolute right-4 bottom-0"
      style={{ height: StyleSheet.hairlineWidth, left: inset }}
    />
  );
}
