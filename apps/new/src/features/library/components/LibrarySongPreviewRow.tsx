import { Link, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { useHapticFeedback } from "@/src/features/settings/hooks/use-haptic-feedback";
import type { LibrarySongPreview } from "../hooks/use-library-song-preview-query";
import {
  getLibrarySongPreviewDetailHref,
  getLibrarySongPreviewPlayerHref,
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
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.borderSubtle },
        isActive ? { backgroundColor: theme.borderSubtle } : null,
      ]}
    >
      <Link asChild href={detailHref}>
        <Pressable style={styles.rowText}>
          <Text
            numberOfLines={1}
            style={[styles.songTitle, { color: theme.primaryText }]}
          >
            {song.title}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.songMeta, { color: theme.secondaryText }]}
          >
            {song.artist} / {song.album}
          </Text>
        </Pressable>
      </Link>
      <Text style={[styles.duration, { color: theme.primaryText }]}>
        {formatDurationMs(song.duration)}
      </Text>
      <View style={styles.actionGroup}>
        <Pressable
          accessibilityLabel={`Play ${song.title}`}
          accessibilityRole="button"
          disabled={!canPlay}
          onPress={() => {
            sendHaptic("light");
            playSong(playbackItem);
            router.push(getLibrarySongPreviewPlayerHref());
          }}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.accent,
              borderColor: theme.accent,
            },
            !canPlay ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.primaryActionText, { color: theme.onAccent }]}>
            Play
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Add ${song.title} to queue`}
          accessibilityRole="button"
          disabled={!canPlay}
          onPress={() => {
            sendHaptic("light");
            addToQueue(playbackItem);
          }}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
            !canPlay ? styles.disabled : null,
          ]}
        >
          <Text style={[styles.secondaryActionText, { color: theme.accent }]}>
            Queue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 66,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 0,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  actionGroup: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    minWidth: 58,
    paddingHorizontal: 10,
  },
  disabled: {
    opacity: 0.45,
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
