import { Pressable, StyleSheet, Text } from "react-native";
import {
  SongRowActionButton,
  SongRowDuration,
  SongRowShell,
  SongRowTextStack,
} from "@/src/features/app-shell/components/SongRowParts";
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
    <SongRowShell theme={theme}>
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
      <SongRowTextStack
        meta={`${song.artist} / ${song.album}`}
        title={song.title}
        theme={theme}
      />
      <SongRowDuration duration={song.duration} theme={theme} />
      <SongRowActionButton
        backgroundColor={isDisabled ? theme.border : theme.accent}
        disabled={isDisabled}
        label={addLabel}
        minWidth={66}
        onPress={() => onAddSong(song.id)}
        textColor={theme.onAccent}
      />
    </SongRowShell>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
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
});
