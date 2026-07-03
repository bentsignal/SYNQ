import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDurationMs } from "@/src/features/app-shell/services/duration-format-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddableCollectionSong } from "../hooks/use-addable-collection-songs-query";
import { getAddableSongRowState } from "../services/add-collection-songs-selection-service";

type AddableSongRowProps = {
  onAddSong: (songId: number) => void;
  onToggleSongSelection: (songId: number) => void;
  savingSongId: number | null;
  selectedSongIds: Set<number>;
  song: AddableCollectionSong;
};

export function AddableSongRow({
  onAddSong,
  onToggleSongSelection,
  savingSongId,
  selectedSongIds,
  song,
}: AddableSongRowProps) {
  const theme = useCustomizationTheme();
  const { addLabel, isDisabled, isSelected } = getAddableSongRowState({
    savingSongId,
    selectedSongIds,
    song,
  });

  return (
    <View style={[styles.row, { borderBottomColor: theme.borderSubtle }]}>
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
