import { StyleSheet, Switch, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";

type HapticsPreferenceRowProps = {
  disabled: boolean;
  hapticsEnabled: boolean;
  onChange: (hapticsEnabled: boolean) => void;
  theme: CustomizationTheme;
};

export function HapticsPreferenceRow({
  disabled,
  hapticsEnabled,
  onChange,
  theme,
}: HapticsPreferenceRowProps) {
  return (
    <View
      style={[
        styles.preferenceRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.preferenceText}>
        <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
          Haptic Feedback
        </Text>
        <Text style={[styles.rowDescription, { color: theme.secondaryText }]}>
          Use a light tap response for supported controls.
        </Text>
      </View>
      <Switch
        disabled={disabled}
        onValueChange={onChange}
        thumbColor={theme.surface}
        trackColor={{ false: "#cfd8d3", true: theme.accent }}
        value={hapticsEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  preferenceRow: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  preferenceText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
});
