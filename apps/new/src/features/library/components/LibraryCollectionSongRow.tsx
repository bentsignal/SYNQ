import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionDetailSong } from "../hooks/use-library-collection-detail-query";
import { getCollectionSongRowActionState } from "../services/library-collection-song-mutation-service";
import { getLibrarySongDetailHref } from "../services/library-song-interaction-service";
import { LibraryCollectionSongRowActions } from "./LibraryCollectionSongRowActions";

type LibraryCollectionSongRowProps = {
  canMutateSongs?: boolean;
  index: number;
  movingSongId?: number | null;
  onMoveSong?: (songId: number, direction: "down" | "up") => void;
  onRemoveSong?: (songId: number) => void;
  removingSongId?: number | null;
  song: LibraryCollectionDetailSong;
  totalSongs: number;
};

export function LibraryCollectionSongRow({
  canMutateSongs = true,
  index,
  movingSongId,
  onMoveSong,
  onRemoveSong,
  removingSongId,
  song,
  totalSongs,
}: LibraryCollectionSongRowProps) {
  const theme = useCustomizationTheme();
  const rowState = getCollectionSongRowActionState({
    canMutateSongs,
    index,
    movingSongId: movingSongId ?? null,
    removingSongId: removingSongId ?? null,
    songId: song.id,
    totalSongs,
  });

  return (
    <View
      className="min-h-[66px] flex-row items-center gap-3 border-b px-3.5 py-2.5"
      style={{ borderBottomColor: theme.borderSubtle }}
    >
      <Link asChild href={getLibrarySongDetailHref({ songId: song.id })}>
        <Pressable className="min-w-0 flex-1 flex-row items-center gap-3">
          <Text
            className="min-w-6 text-right text-xs font-extrabold tracking-normal"
            style={{ color: theme.mutedText }}
          >
            {song.track !== null ? song.track.toString() : ""}
          </Text>
          <View className="min-w-0 flex-1 gap-1">
            <Text
              numberOfLines={1}
              className="text-[15px] font-extrabold leading-5 tracking-normal"
              style={{ color: theme.primaryText }}
            >
              {song.title}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[13px] leading-[18px]"
              style={{ color: theme.secondaryText }}
            >
              {song.artist} / {song.album}
            </Text>
          </View>
          <Text
            className="min-w-11 text-right text-[13px] font-extrabold tracking-normal"
            style={{ color: theme.primaryText }}
          >
            {formatDurationMs(song.duration)}
          </Text>
        </Pressable>
      </Link>
      <LibraryCollectionSongRowActions
        onMoveSong={
          onMoveSong ? (direction) => onMoveSong(song.id, direction) : undefined
        }
        onRemoveSong={onRemoveSong ? () => onRemoveSong(song.id) : undefined}
        rowState={rowState}
        songTitle={song.title}
      />
    </View>
  );
}
