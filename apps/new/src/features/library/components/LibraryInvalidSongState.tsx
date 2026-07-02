import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { getLibraryInvalidSongState } from "../services/library-song-detail-service";

export function LibraryInvalidSongState() {
  const theme = useCustomizationTheme();
  const state = getLibraryInvalidSongState();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.kicker, { color: theme.accent }]}>
        {state.kicker}
      </Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {state.title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {state.body}
      </Text>
      <Link
        href={state.backLink.href}
        style={[styles.backLink, { color: theme.accent }]}
      >
        {state.backLink.label}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 56,
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
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
