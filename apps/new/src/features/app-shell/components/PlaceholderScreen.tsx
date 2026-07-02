import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";

type PlaceholderScreenProps = {
  title: string;
  boundary: string;
  reference: string;
  nextMilestone: string;
};

export function PlaceholderScreen({
  boundary,
  nextMilestone,
  reference,
  title,
}: PlaceholderScreenProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: theme.accent }]}>
          {boundary}
        </Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          {title}
        </Text>
      </View>
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          Next milestone
        </Text>
        <Text style={[styles.body, { color: theme.primaryText }]}>
          {nextMilestone}
        </Text>
        <Text style={[styles.reference, { color: theme.mutedText }]}>
          {reference}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 36,
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  reference: {
    fontSize: 12,
    lineHeight: 17,
  },
});
