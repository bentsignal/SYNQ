import { Pressable, StyleSheet, Text, View } from "react-native";
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
      style={[
        styles.selectionPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.selectionText, { color: theme.secondaryText }]}>
        {selectionState.selectionLabel}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={!selectionState.canBulkAdd}
        onPress={onAddSelectedSongs}
        style={[
          styles.bulkAddButton,
          { backgroundColor: theme.accent },
          !selectionState.canBulkAdd ? styles.disabled : null,
        ]}
      >
        <Text style={[styles.bulkAddText, { color: theme.onAccent }]}>
          {selectionState.bulkAddLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  selectionPanel: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    minWidth: 150,
  },
  bulkAddButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 118,
    paddingHorizontal: 12,
  },
  bulkAddText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.45,
  },
});
