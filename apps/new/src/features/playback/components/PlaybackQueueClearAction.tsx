import { Pressable, Text, View } from "react-native";
import type { PlaybackQueueControllerViewState } from "../services/playback-queue-screen-state-service";

type PlaybackQueueClearActionProps = {
  actionState: PlaybackQueueControllerViewState["actionState"];
  borderColor: string;
  dangerColor: string;
  label: string;
  onClearQueue: () => void;
};

export function PlaybackQueueClearAction({
  actionState,
  borderColor,
  dangerColor,
  label,
  onClearQueue,
}: PlaybackQueueClearActionProps) {
  return (
    <View className="flex-row flex-wrap items-center gap-3">
      <Pressable
        accessibilityRole="button"
        className={`min-h-9 items-center justify-center self-start rounded-lg border px-3 ${
          !actionState.canClearQueue ? "opacity-[0.45]" : ""
        }`}
        disabled={!actionState.canClearQueue}
        onPress={onClearQueue}
        style={{ borderColor }}
      >
        <Text
          className="text-[11px] font-extrabold uppercase"
          style={{ color: dangerColor }}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
