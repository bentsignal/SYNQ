import { Pressable, Text } from "react-native";
import {
  SongRowActionButton,
  SongRowDuration,
  SongRowShell,
  SongRowTextStack,
} from "@/src/features/app-shell/components/song-row";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddableCollectionSong } from "../hooks/use-addable-collection-songs-query";
import type { AddableSongRowState } from "../services/add-collection-songs-selection-service";

type AddableSongRowProps = {
  onAddSong: (songId: number) => void;
  onToggleSongSelection: (songId: number) => void;
  rowState: AddableSongRowState;
  song: AddableCollectionSong;
};

export function AddableSongRow({
  onAddSong,
  onToggleSongSelection,
  rowState,
  song,
}: AddableSongRowProps) {
  const theme = useCustomizationTheme();
  const { addLabel, isDisabled, isSelected } = rowState;

  return (
    <SongRowShell theme={theme}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: isSelected,
          disabled: song.isLinked,
        }}
        className={`h-[30px] w-[30px] items-center justify-center rounded-lg border-2 ${
          song.isLinked ? "opacity-[0.45]" : ""
        }`}
        disabled={song.isLinked}
        onPress={() => onToggleSongSelection(song.id)}
        style={{
          backgroundColor: isSelected ? theme.accent : undefined,
          borderColor: isSelected ? theme.accent : theme.border,
        }}
      >
        <Text
          className="text-[15px] font-extrabold leading-5"
          style={{ color: isSelected ? theme.onAccent : theme.mutedText }}
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
