import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SettingsHomeController } from "../hooks/use-settings-home-controller";
import { useCustomizationTheme } from "../hooks/use-customization-theme";
import {
  SettingsScreenContent,
  SettingsScreenHeader,
} from "./SettingsScreenParts";

type SettingsHomeViewProps = SettingsHomeController;

export function SettingsHomeView({
  routes,
  screenState,
}: SettingsHomeViewProps) {
  const theme = useCustomizationTheme();

  return (
    <SettingsScreenContent contentStyle={styles.content} theme={theme}>
      <SettingsScreenHeader
        header={{
          kicker: "Preferences",
          statusLabel: screenState.premiumStatusLabel,
          subtitle: "Manage the pieces around your library experience.",
          title: "Settings",
        }}
        subtitleStyle={styles.subtitle}
        theme={theme}
      />

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
    </SettingsScreenContent>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  subtitle: {
    maxWidth: 520,
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
