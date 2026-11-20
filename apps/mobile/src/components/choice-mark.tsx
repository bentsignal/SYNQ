import { View } from "react-native";

import { SymbolIcon } from "./symbol-icon";

const SIZE = 24;

/**
 * A choice's trailing circle: empty, filled with a check, or (`mixed`, for
 * some of several songs) filled with a dash. Plain views, for a list of
 * thousands.
 */
export function ChoiceMark({
  chosen,
  mixed = false,
}: {
  chosen: boolean;
  mixed?: boolean;
}) {
  if (!chosen && !mixed) {
    return (
      <View
        className="border-subtle rounded-full border"
        style={{ height: SIZE, width: SIZE }}
      />
    );
  }
  return (
    <View
      className="bg-accent items-center justify-center rounded-full"
      style={{ height: SIZE, width: SIZE }}
    >
      <SymbolIcon
        name={chosen ? "checkmark" : "minus"}
        size={12}
        weight="bold"
        tintColorClassName="accent-on-accent"
      />
    </View>
  );
}
