import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackQueueRowPresentation } from "../services/playback-queue-row-service";

type PlaybackQueueRowActionsProps = {
  onMoveSong: (direction: "down" | "up") => void;
  onRemoveSong: () => void;
  rowState: PlaybackQueueRowPresentation;
};

export function PlaybackQueueRowActions({
  onMoveSong,
  onRemoveSong,
  rowState,
}: PlaybackQueueRowActionsProps) {
  const theme = useCustomizationTheme();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onRemoveSong}
        className="min-h-[34px] min-w-[76px] items-center justify-center rounded-lg border px-2.5"
        style={{ borderColor: theme.border }}
      >
        <Text
          className="text-[11px] font-extrabold uppercase"
          style={{ color: theme.danger }}
        >
          {rowState.removeLabel}
        </Text>
      </Pressable>
      <View className="flex-row gap-1.5">
        <Pressable
          accessibilityLabel={rowState.moveUpAccessibilityLabel}
          accessibilityRole="button"
          disabled={!rowState.canMoveUp}
          onPress={() => onMoveSong("up")}
          className={`min-h-[34px] min-w-[54px] items-center justify-center rounded-lg border px-2 ${
            rowState.canMoveUp ? "" : "opacity-[0.45]"
          }`}
          style={{ borderColor: theme.border }}
        >
          <Text
            className="text-[11px] font-extrabold uppercase"
            style={{ color: theme.accent }}
          >
            {rowState.moveUpLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={rowState.moveDownAccessibilityLabel}
          accessibilityRole="button"
          disabled={!rowState.canMoveDown}
          onPress={() => onMoveSong("down")}
          className={`min-h-[34px] min-w-[54px] items-center justify-center rounded-lg border px-2 ${
            rowState.canMoveDown ? "" : "opacity-[0.45]"
          }`}
          style={{ borderColor: theme.border }}
        >
          <Text
            className="text-[11px] font-extrabold uppercase"
            style={{ color: theme.accent }}
          >
            {rowState.moveDownLabel}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
