import { Link } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { usePremiumEntitlement } from "@/src/features/premium/context/PremiumEntitlementProvider";
import { useCustomizationSettingsContext } from "../context/CustomizationSettingsProvider";
import {
  customizationOptions,
  getCustomizationOption,
} from "../services/customization-settings-service";
import type { CustomizationColorKey } from "../types/customization-settings";

type ColorOptionRowProps = {
  disabled?: boolean;
  onSelect: (key: CustomizationColorKey) => void;
  selectedKey: CustomizationColorKey;
  title: string;
};

function ColorOptionRow({
  disabled = false,
  onSelect,
  selectedKey,
  title,
}: ColorOptionRowProps) {
  return (
    <View style={[styles.optionGroup, disabled && styles.disabledGroup]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.swatchRow}>
        {customizationOptions.map((option) => {
          const isSelected = selectedKey === option.key;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled, selected: isSelected }}
              disabled={disabled}
              key={option.key}
              onPress={() => onSelect(option.key)}
              style={[
                styles.swatchButton,
                isSelected && styles.swatchButtonSelected,
              ]}
            >
              <View
                style={[styles.swatch, { backgroundColor: option.color }]}
              />
              <Text style={styles.swatchLabel}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SettingsCustomizationScreen() {
  const { state: premiumState } = usePremiumEntitlement();
  const {
    setAppIcon,
    setHapticsEnabled,
    setTheme,
    state: customizationState,
  } = useCustomizationSettingsContext();
  const activeTheme = getCustomizationOption(customizationState.settings.theme);
  const themeControlsDisabled =
    !premiumState.active || customizationState.status === "loading";
  const isSaving = customizationState.status === "saving";

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.kicker}>src/features/settings</Text>
        <Text style={styles.title}>Customization</Text>
        <Text style={styles.subtitle}>
          Make SYNQ feel a little more like yours.
        </Text>
        <Text style={styles.statusText}>
          {isSaving ? "Saving" : "Preferences saved locally"}
        </Text>
      </View>

      {!premiumState.active && (
        <View style={styles.premiumPanel}>
          <View style={styles.premiumText}>
            <Text style={styles.panelTitle}>Premium customization locked</Text>
            <Text style={styles.panelDescription}>
              Unlock theme and app icon choices with Premium.
            </Text>
          </View>
          <Link asChild href="/premium">
            <Pressable
              style={[
                styles.premiumButton,
                { backgroundColor: activeTheme.color },
              ]}
            >
              <Text style={styles.premiumButtonText}>Premium</Text>
            </Pressable>
          </Link>
        </View>
      )}

      <View style={styles.section}>
        <ColorOptionRow
          disabled={themeControlsDisabled}
          onSelect={setTheme}
          selectedKey={customizationState.settings.theme}
          title="Theme"
        />
        <ColorOptionRow
          disabled={themeControlsDisabled}
          onSelect={setAppIcon}
          selectedKey={customizationState.settings.appIcon}
          title="App Icon"
        />
      </View>

      <View style={styles.preferenceRow}>
        <View style={styles.preferenceText}>
          <Text style={styles.rowTitle}>Haptic Feedback</Text>
          <Text style={styles.rowDescription}>
            Use a light tap response for supported controls.
          </Text>
        </View>
        <Switch
          disabled={customizationState.status === "loading"}
          onValueChange={setHapticsEnabled}
          thumbColor="#ffffff"
          trackColor={{ false: "#cfd8d3", true: activeTheme.color }}
          value={customizationState.settings.hapticsEnabled}
        />
      </View>

      {customizationState.error && (
        <Text style={styles.errorText}>{customizationState.error}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f7f5",
    flex: 1,
  },
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 560,
  },
  statusText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  premiumPanel: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  premiumText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  panelTitle: {
    color: "#121417",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
  panelDescription: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 19,
  },
  premiumButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
  },
  premiumButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  section: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
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
    color: "#121417",
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
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: "center",
    minHeight: 86,
    minWidth: 78,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  swatchButtonSelected: {
    borderColor: "#0f766e",
    borderWidth: 2,
  },
  swatch: {
    borderColor: "rgba(18, 20, 23, 0.16)",
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    width: 36,
  },
  swatchLabel: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 16,
  },
  preferenceRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
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
    color: "#121417",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  rowDescription: {
    color: "#52605a",
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});
