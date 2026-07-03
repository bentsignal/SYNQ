import { Pressable, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddableSongSelectionState } from "../services/add-collection-songs-selection-service";

type AddCollectionSongsSelectionPanelProps = {
  onAddSelectedSongs: () => void;
  selectionState: AddableSongSelectionState;
};

export function AddCollectionSongsSelectionPanel({
  onAddSelectedSongs,
  selectionState,
}: AddCollectionSongsSelectionPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      className="min-h-[58px] flex-row flex-wrap items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <Text
        className="min-w-[150px] flex-1 text-sm leading-5"
        style={{ color: theme.secondaryText }}
      >
        {selectionState.selectionLabel}
      </Text>
      <Pressable
        accessibilityRole="button"
        className={`min-h-[38px] min-w-[118px] items-center justify-center rounded-lg px-3 ${
          selectionState.canBulkAdd ? "" : "opacity-[0.45]"
        }`}
        disabled={!selectionState.canBulkAdd}
        onPress={onAddSelectedSongs}
        style={{ backgroundColor: theme.accent }}
      >
        <Text
          className="text-xs font-extrabold uppercase"
          style={{ color: theme.onAccent }}
        >
          {selectionState.bulkAddLabel}
        </Text>
      </Pressable>
    </View>
  );
}
