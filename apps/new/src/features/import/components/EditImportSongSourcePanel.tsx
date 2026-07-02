import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type EditImportSongSourcePanelProps = {
  fileName: string;
};

export function EditImportSongSourcePanel({
  fileName,
}: EditImportSongSourcePanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.filePanel,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.fileLabel, { color: theme.secondaryText }]}>
        Source file
      </Text>
      <Text numberOfLines={2} style={[styles.fileName, { color: theme.primaryText }]}>
        {fileName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  filePanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
    padding: 12,
  },
  fileLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  fileName: {
    fontSize: 14,
    lineHeight: 20,
  },
});
