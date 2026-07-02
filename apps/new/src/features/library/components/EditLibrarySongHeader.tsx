import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { LibrarySongDetail } from "../hooks/use-library-song-detail-query";

type EditLibrarySongHeaderProps = {
  detail: LibrarySongDetail;
};

export function EditLibrarySongHeader({ detail }: EditLibrarySongHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.kicker, { color: theme.accent }]}>Edit song</Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {detail.title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {detail.originalFileName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
