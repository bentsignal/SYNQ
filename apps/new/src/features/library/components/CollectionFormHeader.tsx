import { StyleSheet, Text, View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { CollectionFormCopy } from "./collection-form-types";

type CollectionFormHeaderProps = {
  copy: CollectionFormCopy;
  subtitle: string;
};

export function CollectionFormHeader({
  copy,
  subtitle,
}: CollectionFormHeaderProps) {
  const theme = useCustomizationTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.kicker, { color: theme.accent }]}>
        {copy.kicker}
      </Text>
      <Text style={[styles.title, { color: theme.primaryText }]}>
        {copy.title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        {subtitle}
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
