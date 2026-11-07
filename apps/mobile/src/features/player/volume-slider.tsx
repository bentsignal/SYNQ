import type { SymbolViewProps } from "expo-symbols";
import type { ViewProps } from "react-native";
import { useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { requireNativeView, requireOptionalNativeModule } from "expo";

import { SymbolIcon } from "~/components/symbol-icon";

interface NativeVolumeSliderProps extends ViewProps {
  /** Binaries before it never call it, and their volume always shows as usable. */
  onAvailabilityChange?: (event: {
    nativeEvent: { available: boolean };
  }) => void;
}

/** `modules/synq-volume`, or null in a binary built before it. */
const NativeVolumeSlider =
  requireOptionalNativeModule("SynqVolume") === null
    ? null
    : requireNativeView<NativeVolumeSliderProps>("SynqVolume");

/** As tall as the scrubber's row, so the transport sits between equal rows. */
const ROW_HEIGHT = 20;
/** The native view's height: this much of it is touch, beyond the row. */
const TOUCH_HEIGHT = 52;
/**
 * Each symbol is fitted into a square, so the wider one needs a larger square
 * for its speaker to match the other's. The boxes leave the same gap to the bar,
 * and `edge` takes up the clear space each symbol has on its outer side.
 */
const QUIET = { box: 20, edge: -2, size: 13 };
const LOUD = { box: 29, edge: -1.5, size: 20 };
/** The speakers while the route sets its own volume, dimmed with the bar. */
const UNAVAILABLE_OPACITY = 0.4;
/** The bar's own fade (`BarSliderView.growDuration`). */
const FADE_MS = 200;

/**
 * The system volume under the transport, the same bar as the timeline, with a quiet
 * speaker at each end whose outer edges line up with the scrubber's ends. It
 * follows the hardware buttons by itself. A route that sets its own volume
 * (CarPlay) shows its name on a dimmed bar instead, and the speakers dim with
 * it. A binary without it shows nothing.
 */
export function VolumeSlider() {
  const [available, setAvailable] = useState(true);
  if (NativeVolumeSlider === null) return null;
  const opacity = available ? 1 : UNAVAILABLE_OPACITY;
  return (
    <View className="flex-row items-center" style={{ height: ROW_HEIGHT }}>
      <View style={{ alignItems: "flex-start", width: QUIET.box }}>
        <VolumeIcon
          name="speaker.fill"
          size={QUIET.size}
          opacity={opacity}
          marginLeft={QUIET.edge}
        />
      </View>
      <NativeVolumeSlider
        style={{
          flex: 1,
          height: TOUCH_HEIGHT,
          marginVertical: (ROW_HEIGHT - TOUCH_HEIGHT) / 2,
        }}
        onAvailabilityChange={({ nativeEvent }) =>
          setAvailable(nativeEvent.available)
        }
      />
      <View style={{ alignItems: "flex-end", width: LOUD.box }}>
        <VolumeIcon
          name="speaker.wave.3.fill"
          size={LOUD.size}
          opacity={opacity}
          marginRight={LOUD.edge}
        />
      </View>
    </View>
  );
}

function VolumeIcon({
  name,
  size,
  opacity,
  ...edge
}: {
  name: SymbolViewProps["name"];
  size: number;
  opacity: number;
  marginLeft?: number;
  marginRight?: number;
}) {
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        ...edge,
        opacity,
        transitionDuration: FADE_MS,
        transitionProperty: "opacity",
      }}
    >
      <SymbolIcon name={name} size={size} tintColorClassName="accent-muted" />
    </Animated.View>
  );
}
