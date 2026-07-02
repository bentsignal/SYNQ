import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SettingsHomeController } from "../hooks/use-settings-home-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";

type SettingsHomeViewProps = SettingsHomeController;

export function SettingsHomeView({
  routes,
  screenState,
}: SettingsHomeViewProps) {
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
          Settings
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Manage the pieces around your library experience.
        </Text>
        <Text style={[styles.statusText, { color: theme.accent }]}>
          {screenState.premiumStatusLabel}
        </Text>
      </View>

      <View
        style={[
          styles.list,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {routes.map((route) => (
          <Link asChild href={route.href} key={route.href}>
            <Pressable
              style={[styles.row, { borderBottomColor: theme.borderSubtle }]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: theme.primaryText }]}>
                  {route.label}
                </Text>
                <Text
                  style={[
                    styles.rowDescription,
                    { color: theme.secondaryText },
                  ]}
                >
                  {route.description}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: theme.accent }]}>
                {">"}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 20,
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
    maxWidth: 520,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
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
});
