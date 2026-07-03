import { StyleSheet, Switch, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";

type SettingsSwitchRowProps = {
  description: string;
  disabled: boolean;
  onChange: (enabled: boolean) => void;
  theme: CustomizationTheme;
  title: string;
  trackColorOff?: string;
  value: boolean;
};

export function SettingsSwitchRow({
  description,
  disabled,
  onChange,
  theme,
  title,
  trackColorOff,
  value,
}: SettingsSwitchRowProps) {
  return (
    <View
      style={[
        styles.preferenceRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.preferenceText}>
        <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
          {title}
        </Text>
        <Text style={[styles.rowDescription, { color: theme.secondaryText }]}>
          {description}
        </Text>
      </View>
      <Switch
        disabled={disabled}
        onValueChange={onChange}
        thumbColor={theme.surface}
        trackColor={{
          false: trackColorOff ?? theme.border,
          true: theme.accent,
        }}
        value={value}
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
