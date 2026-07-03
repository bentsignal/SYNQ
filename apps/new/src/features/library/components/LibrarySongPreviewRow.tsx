import { Link, router } from "expo-router";
import { Pressable, View } from "react-native";
import {
  SongRowActionButton,
  SongRowDuration,
  SongRowShell,
  SongRowTextStack,
} from "@/src/features/app-shell/components/SongRowParts";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { LibrarySongPreview } from "../hooks/use-library-song-preview-query";
import {
  getLibrarySongPreviewDetailHref,
  getLibrarySongPreviewPlayCommand,
  getLibrarySongPreviewQueueCommand,
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
  const { sendHaptic } = useHapticFeedback();
  const { canPlay, isActive } = getLibrarySongPreviewRowState({
    activeTrackId,
    song,
  });
  const playbackItem = toLibrarySongPlaybackItem(song);
  const detailHref = getLibrarySongPreviewDetailHref(song);

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
          onPress={() => {
            const command = getLibrarySongPreviewPlayCommand();
            sendHaptic(command.haptic);
            playSong(playbackItem);
            router.push(command.href);
          }}
          textColor={theme.onAccent}
        />
        <SongRowActionButton
          accessibilityLabel={`Add ${song.title} to queue`}
          backgroundColor={theme.surface}
          borderColor={theme.border}
          disabled={!canPlay}
          label="Queue"
          onPress={() => {
            sendHaptic(getLibrarySongPreviewQueueCommand().haptic);
            addToQueue(playbackItem);
          }}
          textColor={theme.accent}
        />
      </View>
    </SongRowShell>
  );
}
