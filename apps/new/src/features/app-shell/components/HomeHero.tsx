import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

export function HomeHero() {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.eyebrow, { color: theme.accent }]}>SYNQ</Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        Your music, ready when you are.
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        Import tracks, shape your library, and keep playback moving from one
        place.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  eyebrow: {
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
    maxWidth: 520,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
});
