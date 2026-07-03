import { StyleSheet, Text } from "react-native";
import type { CustomizationScreenController } from "../hooks/use-customization-screen-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import { CustomizationColorControls } from "./CustomizationColorControls";
import { CustomizationPremiumPanel } from "./CustomizationPremiumPanel";
import { HapticsPreferenceRow } from "./HapticsPreferenceRow";
import {
  SettingsScreenContent,
  SettingsScreenHeader,
} from "./SettingsScreenParts";

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
    <SettingsScreenContent theme={theme}>
      <SettingsScreenHeader
        header={{
          kicker: "Preferences",
          statusLabel: screenState.statusLabel,
          subtitle: "Make SYNQ feel a little more like yours.",
          title: "Customization",
        }}
        theme={theme}
      />

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
    </SettingsScreenContent>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
});
