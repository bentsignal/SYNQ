import type { SymbolViewProps } from "expo-symbols";
import type { Insets } from "react-native";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { SymbolIcon } from "~/components/symbol-icon";
import { cn } from "~/lib/cn";
import { lightImpact } from "~/lib/haptics";

/** Pressed, the symbol shrinks and dims a little, with nothing around it. */
const PRESSED_SCALE = 0.86;
const PRESSED_OPACITY = 0.55;
const PRESS_IN = { duration: 70 };
const PRESS_OUT = { duration: 220 };

/**
 * A player control: an SF Symbol in a round hit area, which answers a press on
 * the symbol itself, with a soft haptic tap. The animation runs on the UI
 * thread, and a press re-renders nothing.
 */
export function IconButton({
  label,
  symbol,
  size,
  tint = "accent-foreground",
  disabled = false,
  selected,
  hitSlop = 8,
  className,
  onPress,
}: {
  label: string;
  symbol: SymbolViewProps["name"];
  size: number;
  /** A Uniwind `accent-*` class for the symbol. */
  tint?: string;
  disabled?: boolean;
  /** For toggles (shuffle, repeat, like). */
  selected?: boolean;
  hitSlop?: number | Insets;
  className?: string;
  onPress: () => void;
}) {
  const pressed = useSharedValue(0);
  const symbolStyle = useAnimatedStyle(() => {
    const amount = pressed.get();
    return {
      opacity: 1 - amount * (1 - PRESSED_OPACITY),
      transform: [{ scale: 1 - amount * (1 - PRESSED_SCALE) }],
    };
  });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={hitSlop}
      className={cn("items-center justify-center", className)}
      style={{ height: size * 1.8, width: size * 1.8 }}
      onPressIn={() => pressed.set(withTiming(1, PRESS_IN))}
      onPressOut={() => pressed.set(withTiming(0, PRESS_OUT))}
      onPress={() => {
        lightImpact();
        onPress();
      }}
    >
      <Animated.View style={symbolStyle}>
        <SymbolIcon
          name={symbol}
          size={size}
          tintColorClassName={disabled ? "accent-subtle" : tint}
        />
      </Animated.View>
    </Pressable>
  );
}
