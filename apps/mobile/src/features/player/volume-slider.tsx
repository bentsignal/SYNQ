import type { SymbolViewProps } from "expo-symbols";
import { View } from "react-native";
import { requireNativeView, requireOptionalNativeModule } from "expo";

import { SymbolIcon } from "~/components/symbol-icon";

/** `modules/synq-volume`, or null in a binary built before it. */
const NativeVolumeSlider =
  requireOptionalNativeModule("SynqVolume") === null
    ? null
    : requireNativeView<React.ComponentProps<typeof View>>("SynqVolume");

/** As tall as the scrubber's row, so the transport sits between equal rows. */
const ROW_HEIGHT = 20;
/** The native view's height: this much of it is touch, beyond the row. */
const TOUCH_HEIGHT = 44;
/**
 * Each symbol is fitted into a square, so the wider one needs a larger square
 * for its speaker to match the other's. The boxes leave the same gap to the bar,
 * and `edge` takes up the clear space each symbol has on its outer side.
 */
const QUIET = { box: 18, edge: -2, size: 12 };
const LOUD = { box: 26, edge: -1.5, size: 18 };

/**
 * The system volume under the transport, drawn like the scrubber, with a quiet
 * speaker at each end whose outer edges line up with the scrubber's ends. It
 * follows the hardware buttons by itself. A binary without it shows nothing.
 */
export function VolumeSlider() {
  if (NativeVolumeSlider === null) return null;
  return (
    <View className="flex-row items-center" style={{ height: ROW_HEIGHT }}>
      <View style={{ alignItems: "flex-start", width: QUIET.box }}>
        <VolumeIcon
          name="speaker.fill"
          size={QUIET.size}
          marginLeft={QUIET.edge}
        />
      </View>
      <NativeVolumeSlider
        style={{
          flex: 1,
          height: TOUCH_HEIGHT,
          marginVertical: (ROW_HEIGHT - TOUCH_HEIGHT) / 2,
        }}
      />
      <View style={{ alignItems: "flex-end", width: LOUD.box }}>
        <VolumeIcon
          name="speaker.wave.3.fill"
          size={LOUD.size}
          marginRight={LOUD.edge}
        />
      </View>
    </View>
  );
}

function VolumeIcon({
  name,
  size,
  ...edge
}: {
  name: SymbolViewProps["name"];
  size: number;
  marginLeft?: number;
  marginRight?: number;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={edge}
    >
      <SymbolIcon name={name} size={size} tintColorClassName="accent-muted" />
    </View>
  );
}
