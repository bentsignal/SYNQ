import { Text } from "react-native";
import type { CustomizationScreenController } from "../hooks/use-customization-screen-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import { CustomizationColorControls } from "./CustomizationColorControls";
import { CustomizationPremiumPanel } from "./CustomizationPremiumPanel";
import { HapticsPreferenceRow } from "./HapticsPreferenceRow";
import {
  SettingsScreenContent,
  SettingsScreenHeader,
} from "./settings-screen";

type CustomizationScreenViewProps = CustomizationScreenController;

export function CustomizationScreenView({
  colorControlsState,
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
        <CustomizationPremiumPanel
          panel={screenState.premiumPanel}
          theme={theme}
        />
      )}

      <CustomizationColorControls
        disabled={screenState.themeControlsDisabled}
        onSelectAppIcon={updateAppIcon}
        onSelectTheme={updateTheme}
        state={colorControlsState}
        theme={theme}
      />

      <HapticsPreferenceRow
        disabled={screenState.hapticsDisabled}
        hapticsEnabled={customizationState.settings.hapticsEnabled}
        onChange={updateHapticsEnabled}
        theme={theme}
      />

      {customizationState.error && (
        <Text
          className="text-[13px] font-bold leading-[19px]"
          style={{ color: theme.danger }}
        >
          {customizationState.error}
        </Text>
      )}
    </SettingsScreenContent>
  );
}
