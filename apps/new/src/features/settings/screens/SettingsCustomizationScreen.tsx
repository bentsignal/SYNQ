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
  useCustomizationTheme,
  type CustomizationTheme,
} from "../hooks/use-customization-theme";
import { useHapticFeedback } from "../hooks/use-haptic-feedback";
import {
  customizationOptions,
} from "../services/customization-settings-service";
import {
  getCustomizationOptionState,
  getCustomizationScreenState,
  shouldSendHapticForHapticsToggle,
} from "../services/settings-screen-service";
import type { CustomizationColorKey } from "../types/customization-settings";

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

export function SettingsCustomizationScreen() {
  const { state: premiumState } = usePremiumEntitlement();
  const {
    setAppIcon,
    setHapticsEnabled,
    setTheme,
    state: customizationState,
  } = useCustomizationSettingsContext();
  const { sendHaptic } = useHapticFeedback();
  const theme = useCustomizationTheme();
  const screenState = getCustomizationScreenState({
    premiumActive: premiumState.active,
    status: customizationState.status,
  });
  const handleSetTheme = (themeKey: CustomizationColorKey) => {
    sendHaptic("light");
    void setTheme(themeKey);
  };
  const handleSetAppIcon = (appIcon: CustomizationColorKey) => {
    sendHaptic("light");
    void setAppIcon(appIcon);
  };
  const handleSetHapticsEnabled = (hapticsEnabled: boolean) => {
    if (
      shouldSendHapticForHapticsToggle({
        hapticsEnabled: customizationState.settings.hapticsEnabled,
      })
    ) {
      sendHaptic("light");
    }

    void setHapticsEnabled(hapticsEnabled);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          Preferences
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Customization
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Make SYNQ feel a little more like yours.
        </Text>
        <Text style={[styles.statusText, { color: theme.accent }]}>
          {screenState.statusLabel}
        </Text>
      </View>

      {screenState.showPremiumPanel && (
        <View
          style={[
            styles.premiumPanel,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.premiumText}>
            <Text style={[styles.panelTitle, { color: theme.primaryText }]}>
              Premium customization locked
            </Text>
            <Text
              style={[
                styles.panelDescription,
                { color: theme.secondaryText },
              ]}
            >
              Unlock theme and app icon choices with Premium.
            </Text>
          </View>
          <Link asChild href="/premium">
            <Pressable
              style={[
                styles.premiumButton,
                { backgroundColor: theme.accent },
              ]}
            >
              <Text
                style={[
                  styles.premiumButtonText,
                  { color: theme.onAccent },
                ]}
              >
                Premium
              </Text>
            </Pressable>
          </Link>
        </View>
      )}

      <View
        style={[
          styles.section,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <ColorOptionRow
          disabled={screenState.themeControlsDisabled}
          onSelect={handleSetTheme}
          selectedKey={customizationState.settings.theme}
          theme={theme}
          title="Theme"
        />
        <ColorOptionRow
          disabled={screenState.themeControlsDisabled}
          onSelect={handleSetAppIcon}
          selectedKey={customizationState.settings.appIcon}
          theme={theme}
          title="App Icon"
        />
      </View>

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
          disabled={screenState.hapticsDisabled}
          onValueChange={handleSetHapticsEnabled}
          thumbColor={theme.surface}
          trackColor={{ false: "#cfd8d3", true: theme.accent }}
          value={customizationState.settings.hapticsEnabled}
        />
      </View>

      {customizationState.error && (
        <Text style={[styles.errorText, { color: theme.danger }]}>
          {customizationState.error}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
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
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 560,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  premiumPanel: {
    alignItems: "center",
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
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
  panelDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  premiumButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
  },
  premiumButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
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
  errorText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});
