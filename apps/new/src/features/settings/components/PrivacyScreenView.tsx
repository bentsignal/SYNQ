import { StyleSheet, Switch, Text, View } from "react-native";
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

      <View
        style={[
          styles.preferenceRow,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.preferenceText}>
          <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
            {viewState.preference.title}
          </Text>
          <Text style={[styles.rowDescription, { color: theme.secondaryText }]}>
            {viewState.preference.description}
          </Text>
        </View>
        <Switch
          disabled={screenState.isAnalyticsDisabled}
          onValueChange={updateAllowAnalytics}
          thumbColor={theme.surface}
          trackColor={{ false: theme.border, true: theme.accent }}
          value={state.settings.allowAnalytics}
        />
      </View>

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

const styles = StyleSheet.create({
  preferenceRow: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    minHeight: 82,
    padding: 16,
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
    lineHeight: 22,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
});
