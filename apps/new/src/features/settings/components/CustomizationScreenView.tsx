import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { CustomizationScreenController } from "../hooks/use-customization-screen-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import { CustomizationColorControls } from "./CustomizationColorControls";
import { CustomizationPremiumPanel } from "./CustomizationPremiumPanel";
import { HapticsPreferenceRow } from "./HapticsPreferenceRow";

type CustomizationScreenViewProps = CustomizationScreenController;

export function CustomizationScreenView({
  customizationState,
  screenState,
  updateAppIcon,
  updateHapticsEnabled,
  updateTheme,
}: CustomizationScreenViewProps) {
  const theme = useCustomizationTheme();

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
        <CustomizationPremiumPanel theme={theme} />
      )}

      <CustomizationColorControls
        appIcon={customizationState.settings.appIcon}
        disabled={screenState.themeControlsDisabled}
        onSelectAppIcon={updateAppIcon}
        onSelectTheme={updateTheme}
        theme={theme}
        themeKey={customizationState.settings.theme}
      />

      <HapticsPreferenceRow
        disabled={screenState.hapticsDisabled}
        hapticsEnabled={customizationState.settings.hapticsEnabled}
        onChange={updateHapticsEnabled}
        theme={theme}
      />

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
  errorText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});
