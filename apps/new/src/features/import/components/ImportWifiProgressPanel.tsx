import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type ImportWifiProgressPanelProps = {
  progressLabel: string;
};

export function ImportWifiProgressPanel({
  progressLabel,
}: ImportWifiProgressPanelProps) {
  const theme = useCustomizationTheme();

  return (
    <View
      style={[
        styles.progressPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.panelLabel, { color: theme.secondaryText }]}>
        Progress
      </Text>
      <Text style={[styles.progressValue, { color: theme.primaryText }]}>
        {progressLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panelLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  progressPanel: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 16,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
