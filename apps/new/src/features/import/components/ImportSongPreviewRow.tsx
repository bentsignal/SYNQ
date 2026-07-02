import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { ImportSongDraft } from "../types/import-session";

type ImportSongPreviewRowProps = {
  canEditSongs: boolean;
  onRemoveSong?: (songId: number) => Promise<void> | void;
  song: ImportSongDraft;
};

export function ImportSongPreviewRow({
  canEditSongs,
  onRemoveSong,
  song,
}: ImportSongPreviewRowProps) {
  const theme = useCustomizationTheme();
  const showActions = canEditSongs || onRemoveSong !== undefined;

  return (
    <View style={[styles.row, { borderBottomColor: theme.borderSubtle }]}>
      <View style={styles.rowText}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: theme.primaryText }]}
        >
          {song.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.meta, { color: theme.secondaryText }]}
        >
          {song.artist} / {song.album}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.fileName, { color: theme.mutedText }]}
        >
          {song.fileName}
        </Text>
      </View>
      <Text style={[styles.duration, { color: theme.primaryText }]}>
        {formatDurationMs(song.duration)}
      </Text>
      {showActions ? (
        <View style={styles.actionGroup}>
          {canEditSongs ? (
            <Link asChild href={`/import/edit/${song.id}`}>
              <Pressable
                accessibilityRole="button"
                style={[styles.editButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.editText, { color: theme.accent }]}>
                  Edit
                </Text>
              </Pressable>
            </Link>
          ) : null}
          {onRemoveSong ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onRemoveSong(song.id)}
              style={[styles.removeButton, { borderColor: theme.border }]}
            >
              <Text style={[styles.removeText, { color: theme.danger }]}>
                Remove
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
    maxWidth: 168,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  editButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 58,
    paddingHorizontal: 10,
  },
  editText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  fileName: {
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  removeButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 76,
    paddingHorizontal: 10,
  },
  removeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
});
