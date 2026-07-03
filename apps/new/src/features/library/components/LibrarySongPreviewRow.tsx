import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import {
  SongRowActionButton,
  SongRowDuration,
  SongRowShell,
  SongRowTextStack,
} from "@/src/features/app-shell/components/SongRowParts";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongPreview } from "../hooks/use-library-song-preview-query";
import { useLibrarySongPreviewRowActions } from "../hooks/use-library-song-preview-row-actions";
import {
  getLibrarySongPreviewDetailHref,
  getLibrarySongPreviewRowState,
  toLibrarySongPlaybackItem,
} from "../services/library-song-preview-state-service";

type LibrarySongPreviewRowProps = {
  activeTrackId: number | null;
  addToQueue: (song: ReturnType<typeof toLibrarySongPlaybackItem>) => void;
  playSong: (song: ReturnType<typeof toLibrarySongPlaybackItem>) => void;
  song: LibrarySongPreview;
};

export function LibrarySongPreviewRow({
  activeTrackId,
  addToQueue,
  playSong,
  song,
}: LibrarySongPreviewRowProps) {
  const theme = useCustomizationTheme();
  const { canPlay, isActive } = getLibrarySongPreviewRowState({
    activeTrackId,
    song,
  });
  const detailHref = getLibrarySongPreviewDetailHref(song);
  const { play, queue } = useLibrarySongPreviewRowActions({
    addToQueue,
    playSong,
    song,
  });

  return (
    <SongRowShell isActive={isActive} theme={theme}>
      <SongRowTextStack
        meta={`${song.artist} / ${song.album}`}
        title={song.title}
        wrapper={(children) => (
          <Link asChild href={detailHref}>
            <Pressable className="min-h-[46px] min-w-0 flex-1 justify-center">
              {children}
            </Pressable>
          </Link>
        )}
        theme={theme}
      />
      <SongRowDuration duration={song.duration} theme={theme} />
      <View className="flex-row gap-2">
        <SongRowActionButton
          accessibilityLabel={`Play ${song.title}`}
          backgroundColor={theme.accent}
          borderColor={theme.accent}
          disabled={!canPlay}
          label="Play"
          onPress={play}
          textColor={theme.onAccent}
        />
        <SongRowActionButton
          accessibilityLabel={`Add ${song.title} to queue`}
          backgroundColor={theme.surface}
          borderColor={theme.border}
          disabled={!canPlay}
          label="Queue"
          onPress={queue}
          textColor={theme.accent}
        />
      </View>
    </SongRowShell>
  );
}
