import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddableCollectionSong } from "../hooks/use-addable-collection-songs-query";
import { getAddableSongRowState } from "../services/library-collection-interaction-service";

type AddableSongListProps = {
  onAddSong: (songId: number) => void;
  onToggleSongSelection: (songId: number) => void;
  selectedSongIds: Set<number>;
  savingSongId: number | null;
  songs: AddableCollectionSong[];
};

export function AddableSongList({
  onAddSong,
  onToggleSongSelection,
  selectedSongIds,
  savingSongId,
  songs,
}: AddableSongListProps) {
  const theme = useCustomizationTheme();

  if (songs.length === 0) {
    return (
      <View
        style={[
          styles.emptyPanel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: theme.primaryText }]}>
          No matching songs
        </Text>
        <Text style={[styles.emptyBody, { color: theme.secondaryText }]}>
          Try a different search term or import more music into the library.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.list,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {songs.map((song) => {
        const { addLabel, isDisabled, isSelected } = getAddableSongRowState({
          savingSongId,
          selectedSongIds,
          song,
        });

        return (
          <View
            key={song.id}
            style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
          >
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: isSelected,
                disabled: song.isLinked,
              }}
              disabled={song.isLinked}
              onPress={() => onToggleSongSelection(song.id)}
              style={[
                styles.selectBox,
                { borderColor: theme.border },
                isSelected
                  ? { backgroundColor: theme.accent, borderColor: theme.accent }
                  : null,
                song.isLinked ? styles.disabled : null,
              ]}
            >
              <Text
                style={[
                  styles.selectMark,
                  { color: isSelected ? theme.onAccent : theme.mutedText },
                ]}
              >
                {isSelected ? "x" : ""}
              </Text>
            </Pressable>
            <View style={styles.rowText}>
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
            </View>
            <Text style={[styles.duration, { color: theme.primaryText }]}>
              {formatDurationMs(song.duration)}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={isDisabled}
              onPress={() => onAddSong(song.id)}
              style={[
                styles.addButton,
                {
                  backgroundColor: isDisabled ? theme.border : theme.accent,
                },
              ]}
            >
              <Text style={[styles.addButtonText, { color: theme.onAccent }]}>
                {addLabel}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 66,
    paddingHorizontal: 10,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.45,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
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
    minWidth: 0,
  },
  selectBox: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  selectMark: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  songMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
});
