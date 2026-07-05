import { Image, Pressable, Text, View } from "react-native";
import type { CustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { SongAddToPlaylistRowState } from "../services/song-add-to-playlist-row-state-service";

type SongAddToPlaylistRowProps = {
  addToPlaylist: (playlistId: number) => void;
  rowState: SongAddToPlaylistRowState;
  theme: CustomizationTheme;
};

export function SongAddToPlaylistRow({
  addToPlaylist,
  rowState,
  theme,
}: SongAddToPlaylistRowProps) {
  const { playlist } = rowState;

  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-16 flex-row items-center gap-3 border-b px-3.5 py-2.5 ${
        rowState.isPending ? "opacity-[0.55]" : ""
      }`}
      disabled={rowState.isDisabled}
      onPress={() => addToPlaylist(playlist.id)}
      style={{ borderBottomColor: theme.borderSubtle }}
    >
      {playlist.imagePath ? (
        <Image
          className="h-11 w-11 rounded-md"
          source={{ uri: playlist.imagePath }}
        />
      ) : (
        <View
          className="h-11 w-11 items-center justify-center rounded-md"
          style={{ backgroundColor: theme.background }}
        >
          <Text
            className="text-base font-extrabold leading-[21px]"
            style={{ color: theme.accent }}
          >
            {rowState.imageInitial}
          </Text>
        </View>
      )}
      <View className="min-w-0 flex-1 gap-1">
        <Text
          className="text-[15px] font-extrabold leading-5"
          numberOfLines={1}
          style={{ color: theme.primaryText }}
        >
          {playlist.title}
        </Text>
        <Text
          className="text-[13px] leading-[18px]"
          numberOfLines={1}
          style={{ color: theme.secondaryText }}
        >
          {rowState.metaLabel}
        </Text>
      </View>
      <Text
        className="max-w-[118px] text-right text-xs font-extrabold"
        style={{ color: rowState.isAdded ? theme.accent : theme.primaryText }}
      >
        {rowState.detailLabel}
      </Text>
    </Pressable>
  );
}
