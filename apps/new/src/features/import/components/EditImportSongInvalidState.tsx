import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import {
  getImportSongEditInvalidState,
  type ImportSongEditInvalidReason,
} from "../services/import-song-form-service";

type EditImportSongInvalidStateProps = {
  reason: ImportSongEditInvalidReason;
};

export function EditImportSongInvalidState({
  reason,
}: EditImportSongInvalidStateProps) {
  const theme = useCustomizationTheme();
  const invalidState = getImportSongEditInvalidState(reason);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.kicker, { color: theme.accent }]}>
        {invalidState.kicker}
      </Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {invalidState.title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {invalidState.subtitle}
      </Text>

      <View style={styles.linkRow}>
        {invalidState.links.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            style={[styles.backLink, { color: theme.accent }]}
          >
            {link.label}
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 12,
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
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
