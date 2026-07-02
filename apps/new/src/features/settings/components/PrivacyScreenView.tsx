import { Link } from "expo-router";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { PrivacyScreenController } from "../hooks/use-privacy-screen-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";

type PrivacyScreenViewProps = PrivacyScreenController;

export function PrivacyScreenView({
  screenState,
  state,
  updateAllowAnalytics,
}: PrivacyScreenViewProps) {
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
          Privacy
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Control local preferences for analytics and diagnostics.
        </Text>
        <Text style={[styles.statusText, { color: theme.accent }]}>
          {screenState.statusLabel}
        </Text>
      </View>

      <View
        style={[
          styles.preferenceRow,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.preferenceText}>
          <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
            Analytics
          </Text>
          <Text style={[styles.rowDescription, { color: theme.secondaryText }]}>
            Allow anonymous usage signals to help prioritize reliability and
            feature work.
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

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelTitle, { color: theme.primaryText }]}>
          Local-first by default
        </Text>
        <Text style={[styles.panelBody, { color: theme.secondaryText }]}>
          Your library, imports, backups, theme, and privacy preferences are
          stored on this device unless you choose to export or restore them.
        </Text>
      </View>

      {state.error ? (
        <Text style={[styles.errorText, { color: theme.danger }]}>
          {state.error}
        </Text>
      ) : null}

      <Link
        href="/(tabs)/settings"
        style={[styles.backLink, { color: theme.accent }]}
      >
        Back to Settings
      </Link>
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
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
  panelBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
