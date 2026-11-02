import { Platform, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Host, HStack, Image, ProgressView, Text } from "@expo/ui/swift-ui";
import {
  animation,
  Animation,
  contentTransition,
  controlSize,
  font,
  foregroundStyle,
  glassEffect,
  monospacedDigit,
  padding,
} from "@expo/ui/swift-ui/modifiers";

import type { ImportState } from "./queue";
import { SECONDARY_LABEL } from "~/features/settings/form";
import { capsuleLine, finishedLine, isBatchActive } from "./progress";
import { useImportState } from "./session";

/** Glass needs iOS 26; before that the capsule gets a solid background. */
const HAS_GLASS = Number.parseInt(String(Platform.Version), 10) >= 26;

/** From the bottom safe area to just above the mini player. */
const ABOVE_TAB_BAR = 113;

/** The line to show, or null while there's nothing to say. */
function activityLine({ batch, finished, shown, transfer }: ImportState) {
  if (finished) return finishedLine(batch.imported);
  if (!isBatchActive(batch, transfer)) return null;
  // Nothing to count yet, as when an upload broke off with none arrived.
  return shown.total === 0 ? null : capsuleLine(shown);
}

function isFinished({ finished }: ImportState) {
  return finished;
}

/** What the line's numbers animate on. */
function shownDone({ shown }: ImportState) {
  return shown.done;
}

/**
 * A small capsule floating above the mini player while a batch imports in
 * the background, from Files or Wi-Fi: on every tab, passing touches through,
 * and gone a moment after the batch is. It floats over the screen, so it
 * can't move anything. Its count follows the batch at its own pace
 * (`stepCapsule`), so files flying through don't make the numbers flicker.
 */
export function ImportActivity() {
  const line = useImportState(activityLine);
  const finished = useImportState(isFinished);
  const done = useImportState(shownDone);
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
                contentTransition("numericText"),
                animation(Animation.default, done),
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
