import { router } from "expo-router";
import { Image, Text } from "@expo/ui/swift-ui";
import { font, foregroundStyle } from "@expo/ui/swift-ui/modifiers";

import { FloatingCapsule } from "~/components/floating-capsule";
import { activityLine } from "~/features/import/progress";
import { useImportState } from "~/features/import/session";
import { SECONDARY_LABEL } from "~/features/settings/form";
import { hideQueueToast, useQueueToast } from "./queue-toast-store";

/**
 * "Added to Queue" above the mini player, like the import capsule, which comes
 * first when both have something to say. A tap opens the queue.
 */
export function QueueToast() {
  const text = useQueueToast();
  const importing = useImportState(activityLine) !== null;
  if (text === null || importing) return null;
  return (
    <FloatingCapsule
      label={`${text}, View Queue`}
      onPress={() => {
        hideQueueToast();
        router.push("/queue");
      }}
    >
      <Image systemName="checkmark" size={12} color={SECONDARY_LABEL} />
      <Text
        modifiers={[
          font({ size: 13, weight: "medium" }),
          foregroundStyle("#ffffff"),
        ]}
      >
        {text}
      </Text>
      <Text
        modifiers={[
          font({ size: 13, weight: "medium" }),
          foregroundStyle(SECONDARY_LABEL),
        ]}
      >
        View Queue
      </Text>
    </FloatingCapsule>
  );
}
