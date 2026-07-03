import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  SongRowActionButton,
  SongRowDuration,
  SongRowShell,
  SongRowTextStack,
  songRowPartStyles,
} from "@/src/features/app-shell/components/SongRowParts";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getImportSongEditHref } from "../services/import-song-edit-navigation-service";
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
  const editHref = getImportSongEditHref({ songId: song.id });

  return (
    <SongRowShell minHeight={76} theme={theme}>
      <SongRowTextStack
        meta={`${song.artist} / ${song.album}`}
        title={song.title}
        theme={theme}
      >
        <Text
          numberOfLines={1}
          style={[styles.fileName, { color: theme.mutedText }]}
        >
          {song.fileName}
        </Text>
      </SongRowTextStack>
      <SongRowDuration duration={song.duration} theme={theme} />
      {showActions ? (
        <View style={[songRowPartStyles.actionGroup, styles.actionGroup]}>
          {canEditSongs ? (
            <Link asChild href={editHref}>
              <Pressable
                accessibilityRole="button"
                style={[styles.editButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.actionText, { color: theme.accent }]}>
                  Edit
                </Text>
              </Pressable>
            </Link>
          ) : null}
          {onRemoveSong ? (
            <SongRowActionButton
              backgroundColor={theme.surface}
              borderColor={theme.border}
              label="Remove"
              minWidth={76}
              onPress={() => onRemoveSong(song.id)}
              textColor={theme.danger}
            />
          ) : null}
        </View>
      ) : null}
    </SongRowShell>
  );
}

const styles = StyleSheet.create({
  actionGroup: {
    flexWrap: "wrap",
    justifyContent: "flex-end",
    maxWidth: 168,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  editButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    minWidth: 58,
    paddingHorizontal: 10,
  },
  fileName: {
    fontSize: 12,
    lineHeight: 16,
  },
});
