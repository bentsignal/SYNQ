import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { AddCollectionSongsStatusState } from "../services/addable-collection-songs-screen-state-service";

type AddCollectionSongsStatusPanelProps = {
  statusState: AddCollectionSongsStatusState;
};

export function AddCollectionSongsStatusPanel({
  statusState,
}: AddCollectionSongsStatusPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text
        style={[
          statusState.isError ? styles.errorText : styles.panelText,
          {
            color: statusState.isError ? theme.danger : theme.secondaryText,
          },
        ]}
      >
        {statusState.statusLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
