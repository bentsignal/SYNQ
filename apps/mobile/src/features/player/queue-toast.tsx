import { useSyncExternalStore } from "react";
import { router } from "expo-router";
import { Image, Text } from "@expo/ui/swift-ui";
import { font, foregroundStyle } from "@expo/ui/swift-ui/modifiers";

import { FloatingCapsule } from "~/components/floating-capsule";
import { activityLine } from "~/features/import/import-activity";
import { useImportState } from "~/features/import/session";
import { SECONDARY_LABEL } from "~/features/settings/form";

const SHOWN_MS = 4000;

function noLine(): string | null {
  return null;
}

let line = noLine();
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function publish(next: string | null) {
  line = next;
  for (const listener of listeners) listener();
}

/** Says a song joined the queue, with a way to go and look. */
export function showQueueToast(text: string) {
  if (timer !== undefined) clearTimeout(timer);
  publish(text);
  timer = setTimeout(() => publish(null), SHOWN_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * "Added to Queue" above the mini player, like the import capsule, which comes
 * first when both have something to say. A tap opens the queue.
 */
export function QueueToast() {
  const text = useSyncExternalStore(subscribe, () => line);
  const importing = useImportState(activityLine) !== null;
  if (text === null || importing) return null;
  return (
    <FloatingCapsule
      label={`${text}, View Queue`}
      onPress={() => {
        if (timer !== undefined) clearTimeout(timer);
        publish(null);
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
