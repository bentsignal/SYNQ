import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CustomizationTheme } from "../hooks/use-customization-theme";
import { getSettingsPremiumHref } from "../services/settings-screen-service";

type CustomizationPremiumPanelProps = {
  theme: CustomizationTheme;
};

export function CustomizationPremiumPanel({
  theme,
}: CustomizationPremiumPanelProps) {
  return (
    <View
      style={[
        styles.premiumPanel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.premiumText}>
        <Text style={[styles.panelTitle, { color: theme.primaryText }]}>
          Premium customization locked
        </Text>
        <Text style={[styles.panelDescription, { color: theme.secondaryText }]}>
          Unlock theme and app icon choices with Premium.
        </Text>
      </View>
      <Link asChild href={getSettingsPremiumHref()}>
        <Pressable
          style={[styles.premiumButton, { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.premiumButtonText, { color: theme.onAccent }]}>
            Premium
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  premiumPanel: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  premiumText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
  panelDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  premiumButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
  },
  premiumButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
