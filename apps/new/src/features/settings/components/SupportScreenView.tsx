import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SupportScreenController } from "../hooks/use-support-screen-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import { getSupportScreenViewState } from "../services/settings-screen-service";
import {
  SettingsBackLink,
  SettingsInfoPanel,
  SettingsScreenContent,
  SettingsScreenHeader,
} from "./SettingsScreenParts";

type SupportScreenViewProps = SupportScreenController;

export function SupportScreenView({
  openUrl,
  supportActions,
}: SupportScreenViewProps) {
  const theme = useCustomizationTheme();
  const viewState = getSupportScreenViewState();

  return (
    <SettingsScreenContent theme={theme}>
      <SettingsScreenHeader header={viewState.header} theme={theme} />

      <View
        style={[
          styles.list,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {supportActions.map((action) => (
          <Pressable
            accessibilityRole="link"
            key={action.url}
            onPress={() => openUrl(action.url)}
            style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
                {action.label}
              </Text>
              <Text
                style={[styles.rowDescription, { color: theme.secondaryText }]}
              >
                {action.description}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: theme.accent }]}>{">"}</Text>
          </Pressable>
        ))}
      </View>

      <SettingsInfoPanel panel={viewState.bugReportPanel} theme={theme} />

      <SettingsBackLink backLink={viewState.backLink} theme={theme} />
    </SettingsScreenContent>
  );
}

const styles = StyleSheet.create({
  list: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
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
  chevron: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
  },
});
