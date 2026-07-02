import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SupportScreenController } from "../hooks/use-support-screen-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import { getSettingsHomeHref } from "../services/settings-screen-service";

type SupportScreenViewProps = SupportScreenController;

export function SupportScreenView({
  openUrl,
  supportActions,
}: SupportScreenViewProps) {
  const theme = useCustomizationTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.scroll, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Help</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Support
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Get help, send feedback, or follow along with the project.
        </Text>
      </View>

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

      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelTitle, { color: theme.primaryText }]}>
          Before you send a bug
        </Text>
        <Text style={[styles.panelBody, { color: theme.secondaryText }]}>
          Include your device model, iOS or Android version, what you tapped
          before the issue, and whether the song file lives locally on-device.
        </Text>
      </View>

      <Link
        href={getSettingsHomeHref()}
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
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
