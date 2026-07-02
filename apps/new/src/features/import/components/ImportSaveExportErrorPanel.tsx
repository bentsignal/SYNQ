import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportSaveExportErrorPanelProps = {
  exportError: string | null;
};

export function ImportSaveExportErrorPanel({
  exportError,
}: ImportSaveExportErrorPanelProps) {
  const theme = useCustomizationTheme();

  if (!exportError) {
    return null;
  }

  return (
    <View
      style={[
        styles.errorPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.errorText, { color: theme.danger }]}>
        {exportError}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorPanel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
