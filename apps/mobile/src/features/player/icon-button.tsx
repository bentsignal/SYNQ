import type { SymbolViewProps } from "expo-symbols";
import { Pressable } from "react-native";

import { SymbolIcon } from "~/components/symbol-icon";
import { cn } from "~/lib/cn";
import { lightImpact } from "~/lib/haptics";

/**
 * A player control: an SF Symbol in a round hit area that lights up while
 * pressed, with a soft haptic tap.
 */
export function IconButton({
  label,
  symbol,
  size,
  tint = "accent-foreground",
  disabled = false,
  selected,
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
  className?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={8}
      className={cn(
        "items-center justify-center rounded-full active:bg-white/10",
        className,
      )}
      style={{ height: size * 1.8, width: size * 1.8 }}
      onPress={() => {
        lightImpact();
        onPress();
      }}
    >
      <SymbolIcon
        name={symbol}
        size={size}
        tintColorClassName={disabled ? "accent-subtle" : tint}
      />
    </Pressable>
  );
}
