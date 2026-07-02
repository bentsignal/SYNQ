import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibraryCollectionListState } from "../services/library-collection-list-service";

type LibraryCollectionListStatusProps = {
  listState: LibraryCollectionListState;
};

export function LibraryCollectionListStatus({
  listState,
}: LibraryCollectionListStatusProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.statusPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text
        style={[
          listState.hasErrors ? styles.errorText : styles.statusText,
          {
            color: listState.hasErrors ? theme.danger : theme.secondaryText,
          },
        ]}
      >
        {listState.statusLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  statusPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
