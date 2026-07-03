import { Text } from "react-native";
import type { PrivacyScreenController } from "../hooks/use-privacy-screen-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import { getPrivacyScreenViewState } from "../services/settings-screen-service";
import {
  SettingsBackLink,
  SettingsInfoPanel,
  SettingsScreenContent,
  SettingsScreenHeader,
  settingsScreenPartStyles,
} from "./SettingsScreenParts";
import { SettingsSwitchRow } from "./SettingsSwitchRow";

type PrivacyScreenViewProps = PrivacyScreenController;

export function PrivacyScreenView({
  screenState,
  state,
  updateAllowAnalytics,
}: PrivacyScreenViewProps) {
  const theme = useCustomizationTheme();
  const viewState = getPrivacyScreenViewState();

  return (
    <SettingsScreenContent theme={theme}>
      <SettingsScreenHeader
        header={{ ...viewState.header, statusLabel: screenState.statusLabel }}
        theme={theme}
      />

      <SettingsSwitchRow
        description={viewState.preference.description}
        disabled={screenState.isAnalyticsDisabled}
        onChange={updateAllowAnalytics}
        theme={theme}
        title={viewState.preference.title}
        value={state.settings.allowAnalytics}
      />

      <SettingsInfoPanel panel={viewState.localFirstPanel} theme={theme} />

      {state.error ? (
        <Text style={[settingsScreenPartStyles.errorText, { color: theme.danger }]}>
          {state.error}
        </Text>
      ) : null}

      <SettingsBackLink backLink={viewState.backLink} theme={theme} />
    </SettingsScreenContent>
  );
}
