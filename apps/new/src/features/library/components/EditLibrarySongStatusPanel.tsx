import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../hooks/use-library-song-detail-query";

type EditLibrarySongStatusPanelProps = {
  detail: LibrarySongDetail;
  errorMessage: string | null;
  hasErrors: boolean;
};

export function EditLibrarySongStatusPanel({
  detail,
  errorMessage,
  hasErrors,
}: EditLibrarySongStatusPanelProps) {
  const theme = useCustomizationTheme();
  const isError = hasErrors || errorMessage !== null;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text
        style={[
          isError ? styles.errorText : styles.panelText,
          { color: isError ? theme.danger : theme.secondaryText },
        ]}
      >
        {errorMessage ??
          (hasErrors
            ? "One or more song edit queries failed."
            : detail.isMissing
              ? "Song missing from database."
              : "Separate multiple artists or albums with commas.")}
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
