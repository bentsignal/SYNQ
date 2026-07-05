import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackQueueRowPresentation } from "../services/playback-queue-row-service";
import type { PlaybackQueueItem } from "../types/playback-state";
import { PlaybackQueueRowActions } from "./PlaybackQueueRowActions";

type PlaybackQueueRowProps = {
  onMoveSong: (songId: number, direction: "down" | "up") => void;
  onPlaySong: (song: PlaybackQueueItem) => void;
  onRemoveSong: (songId: number) => void;
  rowState: PlaybackQueueRowPresentation;
  song: PlaybackQueueItem;
};

export function PlaybackQueueRow({
  onMoveSong,
  onPlaySong,
  onRemoveSong,
  rowState,
  song,
}: PlaybackQueueRowProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="min-h-[68px] flex-row items-center gap-3 border-b px-3.5 py-2.5"
      style={{ borderBottomColor: theme.borderSubtle }}
    >
      <Pressable
        accessibilityRole="button"
        className={`min-w-0 flex-1 flex-row items-center gap-3 ${
          !rowState.canPlay ? "opacity-[0.45]" : ""
        }`}
        disabled={!rowState.canPlay}
        onPress={() => onPlaySong(song)}
      >
        <Text
          className="min-w-[22px] text-right text-xs font-extrabold"
          style={{ color: rowState.isActive ? theme.accent : theme.mutedText }}
        >
          {rowState.indexLabel}
        </Text>
        <View className="min-w-0 flex-1 gap-1">
          <Text
            className="text-[15px] font-extrabold leading-5"
            numberOfLines={1}
            style={{ color: theme.primaryText }}
          >
            {song.title}
          </Text>
          <Text
            className="text-[13px] leading-[18px]"
            numberOfLines={1}
            style={{ color: theme.secondaryText }}
          >
            {rowState.metadataLabel}
          </Text>
        </View>
        <Text
          className="min-w-11 text-right text-[13px] font-extrabold"
          style={{ color: theme.primaryText }}
        >
          {rowState.durationLabel}
        </Text>
      </Pressable>
      <PlaybackQueueRowActions
        onMoveSong={(direction) => onMoveSong(song.id, direction)}
        onRemoveSong={() => onRemoveSong(song.id)}
        rowState={rowState}
      />
    </View>
  );
}
