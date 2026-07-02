import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";
import { customizationOptions } from "../services/customization-settings-service";
import { getCustomizationOptionState } from "../services/settings-screen-service";
import type { CustomizationColorKey } from "../types/customization-settings";

type CustomizationColorControlsProps = {
  appIcon: CustomizationColorKey;
  disabled: boolean;
  onSelectAppIcon: (key: CustomizationColorKey) => void;
  onSelectTheme: (key: CustomizationColorKey) => void;
  theme: CustomizationTheme;
  themeKey: CustomizationColorKey;
};

type ColorOptionRowProps = {
  disabled?: boolean;
  onSelect: (key: CustomizationColorKey) => void;
  selectedKey: CustomizationColorKey;
  theme: CustomizationTheme;
  title: string;
};

function ColorOptionRow({
  disabled = false,
  onSelect,
  selectedKey,
  theme,
  title,
}: ColorOptionRowProps) {
  return (
    <View style={[styles.optionGroup, disabled && styles.disabledGroup]}>
      <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
        {title}
      </Text>
      <View style={styles.swatchRow}>
        {customizationOptions.map((option) => {
          const optionState = getCustomizationOptionState({
            disabled,
            optionKey: option.key,
            selectedKey,
          });

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={optionState.accessibilityState}
              disabled={disabled}
              key={option.key}
              onPress={() => onSelect(option.key)}
              style={[
                styles.swatchButton,
                { borderColor: theme.border },
                optionState.isSelected && {
                  borderColor: theme.accent,
                  borderWidth: 2,
                },
              ]}
            >
              <View
                style={[styles.swatch, { backgroundColor: option.color }]}
              />
              <Text
                style={[styles.swatchLabel, { color: theme.secondaryText }]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CustomizationColorControls({
  appIcon,
  disabled,
  onSelectAppIcon,
  onSelectTheme,
  theme,
  themeKey,
}: CustomizationColorControlsProps) {
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <ColorOptionRow
        disabled={disabled}
        onSelect={onSelectTheme}
        selectedKey={themeKey}
        theme={theme}
        title="Theme"
      />
      <ColorOptionRow
        disabled={disabled}
        onSelect={onSelectAppIcon}
        selectedKey={appIcon}
        theme={theme}
        title="App Icon"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 18,
    padding: 16,
  },
  optionGroup: {
    gap: 12,
  },
  disabledGroup: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 23,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  swatchButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 86,
    minWidth: 78,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  swatch: {
    borderColor: "rgba(18, 20, 23, 0.16)",
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    width: 36,
  },
  swatchLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 16,
  },
});
