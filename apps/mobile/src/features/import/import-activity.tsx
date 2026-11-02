import { Platform, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Host, HStack, Image, ProgressView, Text } from "@expo/ui/swift-ui";
import {
  controlSize,
  font,
  foregroundStyle,
  glassEffect,
  monospacedDigit,
  padding,
} from "@expo/ui/swift-ui/modifiers";

import type { ImportState } from "./session";
import { SECONDARY_LABEL } from "~/features/settings/form";
import { batchLine, pendingCount } from "./progress";
import { useImportState } from "./session";

/** Glass needs iOS 26; before that the capsule gets a solid background. */
const HAS_GLASS = Number.parseInt(String(Platform.Version), 10) >= 26;

/** From the bottom safe area to just above the mini player. */
const ABOVE_TAB_BAR = 113;

/** The line to show, or null while there's nothing to say. */
function activityLine({ batch, finished, transfer }: ImportState) {
  if (transfer !== null) return null;
  if (!finished && pendingCount(batch) === 0) return null;
  return batchLine(batch);
}

function isFinished({ finished }: ImportState) {
  return finished;
}

/**
 * A small capsule floating above the mini player while a batch imports in
 * the background: on every tab, passing touches through, and gone when the
 * batch is. Wi-Fi Transfer's sheet shows its own progress instead.
 */
export function ImportActivity() {
  const line = useImportState(activityLine);
  const finished = useImportState(isFinished);
  const { bottom } = useSafeAreaInsets();
  if (line === null) return null;
  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 items-center"
      style={{ bottom: bottom + ABOVE_TAB_BAR }}
    >
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
            {finished ? (
              <Image systemName="checkmark" size={12} color={SECONDARY_LABEL} />
            ) : (
              <ProgressView modifiers={[controlSize("small")]} />
            )}
            <Text
              modifiers={[
                font({ size: 13, weight: "medium" }),
                monospacedDigit(),
                foregroundStyle("#ffffff"),
              ]}
            >
              {line}
            </Text>
          </HStack>
        </Host>
      </Animated.View>
    </View>
  );
}
