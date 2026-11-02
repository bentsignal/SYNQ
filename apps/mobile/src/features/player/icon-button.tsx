import type { SymbolViewProps } from "expo-symbols";
import type { Insets } from "react-native";
import { Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
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
 * the symbol itself, with a soft haptic tap. A gesture that only watches the
 * touches runs the animation on the UI thread, so it answers even while
 * JavaScript is busy, and a press re-renders nothing. It never activates, so
 * the `Pressable` still handles the press, its hit slop, and VoiceOver.
 */
export function IconButton({
  label,
  symbol,
  size,
  tint = "accent-foreground",
  disabled = false,
  selected,
  hitSlop = 8,
  box,
  circle = false,
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
  /** The button's width and height; touches reach `hitSlop` beyond it. */
  box?: number;
  /** Sits in a quiet filled circle, which presses with the symbol. */
  circle?: boolean;
  className?: string;
  onPress: () => void;
}) {
  const side = box ?? size * 1.8;
  const pressed = useSharedValue(0);
  const symbolStyle = useAnimatedStyle(() => {
    const amount = pressed.get();
    return {
      opacity: 1 - amount * (1 - PRESSED_OPACITY),
      transform: [{ scale: 1 - amount * (1 - PRESSED_SCALE) }],
    };
  });
  const touches = Gesture.Manual()
    .enabled(!disabled)
    .onTouchesDown(() => {
      pressed.set(withTiming(1, PRESS_IN));
    })
    .onTouchesUp((_event, manager) => {
      // All the way in first, so even the quickest tap shows.
      pressed.set(
        withSequence(withTiming(1, PRESS_IN), withTiming(0, PRESS_OUT)),
      );
      manager.fail();
    })
    .onTouchesCancelled((_event, manager) => {
      pressed.set(withTiming(0, PRESS_OUT));
      manager.fail();
    });
  return (
    <GestureDetector gesture={touches}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled, selected }}
        disabled={disabled}
        hitSlop={hitSlop}
        className={cn("items-center justify-center", className)}
        style={{ height: side, width: side }}
        onPress={() => {
          lightImpact();
          onPress();
        }}
      >
        <Animated.View
          className={cn(
            "h-full w-full items-center justify-center",
            circle && "rounded-full bg-white/10",
          )}
          style={symbolStyle}
        >
          <SymbolIcon
            name={symbol}
            size={size}
            tintColorClassName={disabled ? "accent-subtle" : tint}
          />
        </Animated.View>
      </Pressable>
    </GestureDetector>
  );
}
