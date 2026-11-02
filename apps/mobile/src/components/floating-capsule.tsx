import type { ReactNode } from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Host, HStack } from "@expo/ui/swift-ui";
import { glassEffect, padding } from "@expo/ui/swift-ui/modifiers";

/** Glass needs iOS 26; before that the capsule gets a solid background. */
const HAS_GLASS = Number.parseInt(String(Platform.Version), 10) >= 26;

/** From the bottom safe area to just above the mini player. */
const ABOVE_TAB_BAR = 113;

function Capsule({ children }: { children: ReactNode }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(220)}
      className={
        HAS_GLASS ? undefined : "bg-background-elevated-2 rounded-full"
      }
    >
      <Host matchContents colorScheme="dark">
        <HStack
          spacing={7}
          modifiers={[
            padding({ horizontal: 14, vertical: 9 }),
            // Tinted, so the line stays readable over a list of songs.
            glassEffect({
              glass: { tint: "#1c1c1ed9", variant: "regular" },
              shape: "capsule",
            }),
          ]}
        >
          {children}
        </HStack>
      </Host>
    </Animated.View>
  );
}

/**
 * A small glass capsule floating above the mini player, on every tab. It floats
 * over the screen, so it can't move anything, and touches pass through it
 * unless it has an `onPress`.
 */
export function FloatingCapsule({
  label,
  onPress,
  children,
}: {
  /** What VoiceOver reads, when it can be pressed. */
  label?: string;
  onPress?: () => void;
  children: ReactNode;
}) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      pointerEvents={onPress === undefined ? "none" : "box-none"}
      className="absolute inset-x-0 items-center"
      style={{ bottom: bottom + ABOVE_TAB_BAR }}
    >
      {onPress === undefined ? (
        <Capsule>{children}</Capsule>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          hitSlop={8}
          className="active:opacity-70"
          onPress={onPress}
        >
          <View pointerEvents="none">
            <Capsule>{children}</Capsule>
          </View>
        </Pressable>
      )}
    </View>
  );
}
